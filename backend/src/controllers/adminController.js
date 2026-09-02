const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { Utilisateur, Emprunt, Livre } = require('../models');
const { fn, col, literal, Op } = require('sequelize');
const resend = require('../config/mailer');

exports.creerGestionnaire = async (req, res) => {
  try {
    const { nom, prenom, email, adresse, telephone } = req.body;

    if (!nom || !prenom || !email) {
      return res.status(400).json({ message: 'Nom, prénom et email sont requis.' });
    }

    const utilisateurExistant = await Utilisateur.findOne({ where: { email } });
    if (utilisateurExistant) {
      return res.status(409).json({ message: 'Un compte existe déjà avec cet email.' });
    }

    const motDePasseTemporaire = crypto.randomBytes(6).toString('hex');
    const motDePasseHache = await bcrypt.hash(motDePasseTemporaire, 10);

    const gestionnaire = await Utilisateur.create({
      nom,
      prenom,
      email,
      motDePasse: motDePasseHache,
      adresse,
      telephone,
      role: 'gestionnaire',
    });

    const { error: erreurEmail } = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: gestionnaire.email,
      subject: 'Votre compte gestionnaire — L\'Armurerie',
      text: `Bonjour ${gestionnaire.prenom},\n\nUn compte gestionnaire a été créé pour vous sur L'Armurerie.\n\nEmail : ${gestionnaire.email}\nMot de passe temporaire : ${motDePasseTemporaire}\n\nConnectez-vous et pensez à changer ce mot de passe dès que possible depuis votre espace personnel.`,
    });

    if (erreurEmail) {
      console.warn('Email non envoyé (le compte a quand même été créé) :', erreurEmail);
    }

    res.status(201).json({
      id: gestionnaire.id,
      nom: gestionnaire.nom,
      prenom: gestionnaire.prenom,
      email: gestionnaire.email,
      role: gestionnaire.role,
      motDePasseTemporaire,
      emailEnvoye: !erreurEmail,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la création du gestionnaire.' });
  }
};

exports.getGestionnaires = async (req, res) => {
  try {
    const gestionnaires = await Utilisateur.findAll({
      where: { role: 'gestionnaire', compteSupprime: false },
      attributes: { exclude: ['motDePasse'] },
    });
    res.json(gestionnaires);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la récupération des gestionnaires.' });
  }
};

exports.supprimerGestionnaire = async (req, res) => {
  try {
    const { id } = req.params;
    const gestionnaire = await Utilisateur.findByPk(id);

    if (!gestionnaire || gestionnaire.role !== 'gestionnaire') {
      return res.status(404).json({ message: 'Gestionnaire introuvable.' });
    }

    gestionnaire.role = 'adherent';
    await gestionnaire.save();

    res.json({ message: 'Le gestionnaire a été rétrogradé au rôle adhérent.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la suppression du gestionnaire.' });
  }
};

exports.getStatistiques = async (req, res) => {
  try {
    const { periode } = req.query;

    const where = {};
    const maintenant = new Date();

    if (periode === 'mois') {
      const debutMois = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);
      where.dateEmprunt = { [Op.gte]: debutMois };
    } else if (periode === 'annee') {
      const debutAnnee = new Date(maintenant.getFullYear(), 0, 1);
      where.dateEmprunt = { [Op.gte]: debutAnnee };
    }

    const resultats = await Emprunt.findAll({
      where,
      attributes: [
        'id_livre',
        [fn('COUNT', col('Emprunt.id')), 'nombreEmprunts'],
      ],
      include: [{ model: Livre, attributes: ['titre'] }],
      group: ['id_livre', 'Livre.id'],
      order: [[literal('nombreEmprunts'), 'DESC']],
      limit: 10,
    });

    const statistiques = resultats.map((r) => ({
      titre: r.Livre.titre,
      nombreEmprunts: parseInt(r.get('nombreEmprunts'), 10),
    }));

    res.json(statistiques);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors du calcul des statistiques.' });
  }
};