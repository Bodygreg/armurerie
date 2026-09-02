const { Op } = require('sequelize');
const { Reservation, Livre, Utilisateur } = require('../models');
const resend = require('../config/mailer');
const verifierEtNotifierDisponibilite = require('../services/notificationDisponibilite');

async function verifierReservationsExpirees() {
  const maintenant = new Date();

  const reservationsExpirees = await Reservation.findAll({
    where: {
      statut: 'en_attente',
      dateLimiteRetrait: { [Op.lt]: maintenant },
    },
    include: [{ model: Livre }, { model: Utilisateur }],
  });

  for (const reservation of reservationsExpirees) {
    reservation.statut = 'annulee';
    await reservation.save();

    await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: reservation.Utilisateur.email,
      subject: `Votre réservation pour "${reservation.Livre.titre}" a expiré`,
      text: `Bonjour ${reservation.Utilisateur.prenom},\n\nVotre réservation pour "${reservation.Livre.titre}" n'a pas été retirée dans le délai imparti. Elle a été annulée et le livre est remis à disposition des autres adhérents.`,
    });

    await verifierEtNotifierDisponibilite(reservation.id_livre);
  }  
}

module.exports = verifierReservationsExpirees;