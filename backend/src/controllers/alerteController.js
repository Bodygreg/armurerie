const { Livre, Emprunt, Reservation, Alerte } = require('../models');

exports.creerAlerte = async (req, res) => {
  try {
    const { id_livre } = req.body;
    const id_utilisateur = req.utilisateur.id;

    if (!id_livre) {
      return res.status(400).json({ message: 'id_livre est requis.' });
    }

    const livre = await Livre.findByPk(id_livre);
    if (!livre) {
      return res.status(404).json({ message: 'Livre introuvable.' });
    }

    const empruntActif = await Emprunt.findOne({
      where: { id_livre, statut: ['en_cours', 'en_retard'] },
    });
    const reservationActive = await Reservation.findOne({
      where: { id_livre, statut: 'en_attente' },
    });

    if (!empruntActif && !reservationActive) {
      return res.status(409).json({ message: 'Ce livre est déjà disponible.' });
    }

    const alerteExistante = await Alerte.findOne({
      where: { id_livre, id_utilisateur, statut: 'en_attente' },
    });
    if (alerteExistante) {
      return res.status(409).json({ message: 'Vous êtes déjà inscrit pour ce livre.' });
    }

    const alerte = await Alerte.create({ id_livre, id_utilisateur, statut: 'en_attente' });
    res.status(201).json(alerte);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de l'inscription à l'alerte." });
  }
};