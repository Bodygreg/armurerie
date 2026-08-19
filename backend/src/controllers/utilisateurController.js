const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { Utilisateur, Emprunt, Reservation } = require('../models');

exports.getMonProfil = async (req, res) => {
  try {
    const utilisateur = await Utilisateur.findByPk(req.utilisateur.id, {
      attributes: { exclude: ['motDePasse'] },
    });
    res.json(utilisateur);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la récupération du profil.' });
  }
};

exports.modifierMonProfil = async (req, res) => {
  try {
    const { nom, prenom, adresse, telephone } = req.body; // pas d'email, volontairement

    const utilisateur = await Utilisateur.findByPk(req.utilisateur.id);
    if (!utilisateur) {
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }

    if (nom) utilisateur.nom = nom;
    if (prenom) utilisateur.prenom = prenom;
    if (adresse !== undefined) utilisateur.adresse = adresse;
    if (telephone !== undefined) utilisateur.telephone = telephone;

    await utilisateur.save();

    const { motDePasse, ...utilisateurSansMdp } = utilisateur.toJSON();
    res.json(utilisateurSansMdp);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la modification du profil.' });
  }
};

exports.supprimerMonCompte = async (req, res) => {
  try {
    const utilisateur = await Utilisateur.findByPk(req.utilisateur.id);
    if (!utilisateur) {
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }

    const empruntActif = await Emprunt.findOne({
      where: { id_utilisateur: utilisateur.id, statut: ['en_cours', 'en_retard'] },
    });
    if (empruntActif) {
      return res.status(409).json({
        message: "Impossible de supprimer votre compte : un emprunt est en cours. Merci de rapporter l'ouvrage au préalable.",
      });
    }

    const reservationActive = await Reservation.findOne({
      where: { id_utilisateur: utilisateur.id, statut: 'en_attente' },
    });
    if (reservationActive) {
      return res.status(409).json({
        message: "Impossible de supprimer votre compte : une réservation est en attente. Merci de l'annuler au préalable.",
      });
    }

    utilisateur.nom = 'Compte';
    utilisateur.prenom = 'supprimé';
    utilisateur.email = `supprime-${utilisateur.id}@armurerie.fr`;
    utilisateur.motDePasse = await bcrypt.hash(crypto.randomUUID(), 10);
    utilisateur.adresse = null;
    utilisateur.telephone = null;
    utilisateur.compteSupprime = true;

    await utilisateur.save();

    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la suppression du compte.' });
  }
};