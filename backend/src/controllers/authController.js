const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Utilisateur } = require('../models');
const REGEX_MOT_DE_PASSE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
const crypto = require('crypto');
const { Op } = require('sequelize');
const resend = require('../config/mailer');

exports.register = async (req, res) => {
  try {
    const { nom, prenom, email, motDePasse, adresse, telephone } = req.body;

    if (!nom || !prenom || !email || !motDePasse) {
      return res.status(400).json({ message: 'Champs obligatoires manquants.' });
    }

    if (!REGEX_MOT_DE_PASSE.test(motDePasse)) {
      return res.status(400).json({
        message: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.',
      });
    }

    const utilisateurExistant = await Utilisateur.findOne({ where: { email } });
    if (utilisateurExistant) {
      return res.status(409).json({ message: 'Un compte existe déjà avec cet email.' });
    }

    const motDePasseHache = await bcrypt.hash(motDePasse, 10);

    const nouvelUtilisateur = await Utilisateur.create({
      nom,
      prenom,
      email,
      motDePasse: motDePasseHache,
      adresse,
      telephone,
      role: 'adherent', // toujours forcé côté serveur, jamais laissé au choix du client
    });

    res.status(201).json({
      id: nouvelUtilisateur.id,
      nom: nouvelUtilisateur.nom,
      prenom: nouvelUtilisateur.prenom,
      email: nouvelUtilisateur.email,
      role: nouvelUtilisateur.role,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la création du compte." });
  }
};

exports.demanderReinitialisation = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email requis.' });
    }

    const utilisateur = await Utilisateur.findOne({ where: { email } });

    // Toujours la même réponse, que l'email existe ou non
    const reponseGenerique = {
      message: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.',
    };

    if (!utilisateur || utilisateur.compteSupprime) {
      return res.status(200).json(reponseGenerique);
    }

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHache = crypto.createHash('sha256').update(token).digest('hex');
    const expiration = new Date(Date.now() + 60 * 60 * 1000); // 1 heure

    utilisateur.resetTokenHache = tokenHache;
    utilisateur.resetTokenExpiration = expiration;
    await utilisateur.save();

    const lienReinitialisation = `${process.env.FRONTEND_URL}/reinitialiser-mot-de-passe?token=${token}`;

    await resend.emails.send({
      from: "L'Armurerie <onboarding@resend.dev>",
      to: utilisateur.email,
      subject: 'Réinitialisation de votre mot de passe',
      text: `Bonjour ${utilisateur.prenom},\n\nCliquez sur ce lien pour choisir un nouveau mot de passe (valable 1 heure) :\n${lienReinitialisation}\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez cet email.`,
    });

    res.status(200).json(reponseGenerique);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la demande de réinitialisation.' });
  }
};

exports.reinitialiserMotDePasse = async (req, res) => {
  try {
    const { token, nouveauMotDePasse } = req.body;

    if (!token || !nouveauMotDePasse) {
      return res.status(400).json({ message: 'Token et nouveau mot de passe requis.' });
    }

    if (!REGEX_MOT_DE_PASSE.test(nouveauMotDePasse)) {
      return res.status(400).json({
        message: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.',
      });
    }

    const tokenHache = crypto.createHash('sha256').update(token).digest('hex');

    const utilisateur = await Utilisateur.findOne({
      where: {
        resetTokenHache: tokenHache,
        resetTokenExpiration: { [Op.gt]: new Date() },
      },
    });

    if (!utilisateur) {
      return res.status(400).json({ message: 'Ce lien est invalide ou a expiré.' });
    }

    utilisateur.motDePasse = await bcrypt.hash(nouveauMotDePasse, 10);
    utilisateur.resetTokenHache = null;
    utilisateur.resetTokenExpiration = null;
    await utilisateur.save();

    const nouveauTokenConnexion = jwt.sign(
      { id: utilisateur.id, role: utilisateur.role },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.status(200).json({
      message: 'Mot de passe réinitialisé avec succès.',
      token: nouveauTokenConnexion,
      utilisateur: {
        id: utilisateur.id,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        email: utilisateur.email,
        role: utilisateur.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la réinitialisation.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, motDePasse } = req.body;

    if (!email || !motDePasse) {
      return res.status(400).json({ message: 'Email et mot de passe requis.' });
    }

    const utilisateur = await Utilisateur.findOne({ where: { email } });
    if (!utilisateur || utilisateur.compteSupprime) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
    }

    const motDePasseValide = await bcrypt.compare(motDePasse, utilisateur.motDePasse);
    if (!motDePasseValide) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
    }

    const token = jwt.sign(
      { id: utilisateur.id, role: utilisateur.role },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({
      token,
      utilisateur: {
        id: utilisateur.id,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        email: utilisateur.email,
        role: utilisateur.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la connexion.' });
  }
};