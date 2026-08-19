const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Utilisateur } = require('../models');

exports.register = async (req, res) => {
  try {
    const { nom, prenom, email, motDePasse, adresse, telephone } = req.body;

    if (!nom || !prenom || !email || !motDePasse) {
      return res.status(400).json({ message: 'Champs obligatoires manquants.' });
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