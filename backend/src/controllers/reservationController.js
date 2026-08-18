const { Livre, Emprunt, Reservation } = require('../models');

exports.createReservation = async (req, res) => {
  try {
    const { id_livre } = req.body;
    const id_utilisateur = req.utilisateur.id; // vient du token vérifié, jamais du client

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
    if (empruntActif) {
      return res.status(409).json({ message: 'Ce livre est actuellement emprunté.' });
    }

    const reservationActive = await Reservation.findOne({
      where: { id_livre, statut: 'en_attente' },
    });
    if (reservationActive) {
      return res.status(409).json({ message: 'Ce livre est déjà réservé.' });
    }

    const reservation = await Reservation.create({
      id_livre,
      id_utilisateur,
      statut: 'en_attente',
    });

    res.status(201).json(reservation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la réservation.' });
  }
};

exports.annulerReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const reservation = await Reservation.findByPk(id);

    if (!reservation) {
      return res.status(404).json({ message: 'Réservation introuvable.' });
    }

    const estProprietaire = reservation.id_utilisateur === req.utilisateur.id;
    const estGestionnaireOuAdmin = ['gestionnaire', 'admin'].includes(req.utilisateur.role);

    if (!estProprietaire && !estGestionnaireOuAdmin) {
      return res.status(403).json({ message: "Vous ne pouvez pas annuler la réservation d'un autre adhérent." });
    }

    if (reservation.statut !== 'en_attente') {
      return res.status(409).json({ message: 'Cette réservation ne peut plus être annulée.' });
    }

    reservation.statut = 'annulee';
    await reservation.save();

    res.json(reservation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de l'annulation." });
  }
};