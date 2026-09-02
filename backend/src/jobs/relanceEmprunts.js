const { Op } = require('sequelize');
const { Emprunt, Livre, Utilisateur } = require('../models');
const resend = require('../config/mailer');

async function verifierRetards() {
  const maintenant = new Date();

  // 1. Emprunts qui viennent de dépasser les 3 semaines → email à l'adhérent concerné
  const empruntsEnRetard = await Emprunt.findAll({
    where: {
      statut: 'en_cours',
      dateRetourPrevue: { [Op.lt]: maintenant },
      relanceEnvoyee: false,
    },
    include: [{ model: Livre }, { model: Utilisateur }],
  });

  for (const emprunt of empruntsEnRetard) {
    await resend.emails.send({
      from: "L'Armurerie <onboarding@resend.dev>",
      to: emprunt.Utilisateur.email,
      subject: `Rappel : retour de "${emprunt.Livre.titre}" en retard`,
      text: `Bonjour ${emprunt.Utilisateur.prenom},\n\nLe livre "${emprunt.Livre.titre}" devait être rendu le ${emprunt.dateRetourPrevue.toLocaleDateString('fr-FR')}. Merci de le rapporter dès que possible.`,
    });

    emprunt.statut = 'en_retard';
    emprunt.relanceEnvoyee = true;
    await emprunt.save();
  }

  // 2. Emprunts en retard critique (1 semaine de plus) → email à TOUS les gestionnaires/admins actifs
  const uneSemaine = 7 * 24 * 60 * 60 * 1000;
  const dateLimiteGestionnaire = new Date(maintenant.getTime() - uneSemaine);

  const empruntsCritiques = await Emprunt.findAll({
    where: {
      statut: 'en_retard',
      dateRetourPrevue: { [Op.lt]: dateLimiteGestionnaire },
      alerteGestionnaireEnvoyee: false,
    },
    include: [{ model: Livre }, { model: Utilisateur }],
  });

  if (empruntsCritiques.length > 0) {
    const gestionnaires = await Utilisateur.findAll({
      where: { role: ['gestionnaire', 'admin'], compteSupprime: false },
      attributes: ['email'],
    });
    const emailsGestionnaires = gestionnaires.map((g) => g.email);

    if (emailsGestionnaires.length === 0) {
      console.warn('Aucun gestionnaire actif trouvé, alertes non envoyées.');
    } else {
      for (const emprunt of empruntsCritiques) {
        await resend.emails.send({
          from: "L'Armurerie <onboarding@resend.dev>",
          to: emailsGestionnaires,
          subject: `Alerte : retard critique sur "${emprunt.Livre.titre}"`,
          text: `Le livre "${emprunt.Livre.titre}", emprunté par ${emprunt.Utilisateur.prenom} ${emprunt.Utilisateur.nom} (${emprunt.Utilisateur.email}), est en retard de plus de 4 semaines.`,
        });

        emprunt.alerteGestionnaireEnvoyee = true;
        await emprunt.save();
      }
    }
  }
}

module.exports = verifierRetards;