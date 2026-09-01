const { Livre, Emprunt, Reservation } = require('../models');
const verifierEtNotifierDisponibilite = require('../services/notificationDisponibilite');
const { calculerDateLimiteRetrait } = require('../utils/horaires');

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

    const dateLimiteRetrait = calculerDateLimiteRetrait(new Date());

    const reservation = await Reservation.create({
      id_livre,
      id_utilisateur,
      dateLimiteRetrait,
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
    await verifierEtNotifierDisponibilite(reservation.id_livre);

    res.json(reservation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de l'annulation." });
  }
};

exports.getMesReservations = async (req, res) => {
  try {
    const reservations = await Reservation.findAll({
      where: { id_utilisateur: req.utilisateur.id, statut: 'en_attente' },
      include: [{ model: Livre }],
    });
    res.json(reservations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la récupération des réservations.' });
  }
};

exports.convertirEnEmprunt = async (req, res) => {
  try {
    const { id } = req.params;
    const reservation = await Reservation.findByPk(id);

    if (!reservation) {
      return res.status(404).json({ message: 'Réservation introuvable.' });
    }
    if (reservation.statut !== 'en_attente') {
      return res.status(409).json({ message: 'Cette réservation ne peut pas être convertie.' });
    }

    const nombreEmpruntsActifs = await Emprunt.count({
      where: { id_utilisateur: reservation.id_utilisateur, statut: ['en_cours', 'en_retard'] },
    });
    if (nombreEmpruntsActifs >= 3) {
      return res.status(409).json({
        message: 'Cet adhérent a déjà atteint la limite de 3 emprunts simultanés.',
      });
    }

    const dateEmprunt = new Date();
    const dateRetourPrevue = new Date();
    dateRetourPrevue.setDate(dateRetourPrevue.getDate() + 21);

    const emprunt = await Emprunt.create({
      id_livre: reservation.id_livre,
      id_utilisateur: reservation.id_utilisateur,
      dateEmprunt,
      dateRetourPrevue,
      statut: 'en_cours',
    });

    reservation.statut = 'convertie_en_emprunt';
    await reservation.save();

    res.status(201).json(emprunt);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la conversion en emprunt.' });
  }
};