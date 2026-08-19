const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { Utilisateur } = require('../models');

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

    const motDePasseTemporaire = crypto.randomBytes(6).toString('hex'); // ex: "a1b2c3d4e5f6"
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

    res.status(201).json({
      id: gestionnaire.id,
      nom: gestionnaire.nom,
      prenom: gestionnaire.prenom,
      email: gestionnaire.email,
      role: gestionnaire.role,
      motDePasseTemporaire, // uniquement affiché ici, une seule fois, jamais stocké en clair
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la création du gestionnaire.' });
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