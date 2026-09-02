const { Emprunt, Reservation, Alerte, Livre, Utilisateur } = require('../models');
const resend = require('../config/mailer');

async function verifierEtNotifierDisponibilite(id_livre) {
  const empruntActif = await Emprunt.findOne({
    where: { id_livre, statut: ['en_cours', 'en_retard'] },
  });
  if (empruntActif) return;

  const reservationActive = await Reservation.findOne({
    where: { id_livre, statut: 'en_attente' },
  });
  if (reservationActive) return;

  const alertesEnAttente = await Alerte.findAll({
    where: { id_livre, statut: 'en_attente' },
    include: [{ model: Utilisateur }, { model: Livre }],
  });

  for (const alerte of alertesEnAttente) {
    await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: alerte.Utilisateur.email,
      subject: `"${alerte.Livre.titre}" est maintenant disponible !`,
      text: `Bonjour ${alerte.Utilisateur.prenom},\n\nLe livre "${alerte.Livre.titre}" que vous attendiez est de nouveau disponible à l'emprunt.`,
    });

    alerte.statut = 'notifiee';
    await alerte.save();
  }
}

module.exports = verifierEtNotifierDisponibilite;