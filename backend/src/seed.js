require('dotenv').config();
const { sequelize, Utilisateur, Livre, Auteur, Theme, Emprunt, Reservation } = require('./models');

async function seed() {
  try {
    await sequelize.sync(); // s'assure que les tables existent, sans les supprimer

    // 1. Auteurs et thèmes (indépendants)
    const rothfuss = await Auteur.create({ nom: 'Patrick Rothfuss' });
    const herbert = await Auteur.create({ nom: 'Frank Herbert' });
    const liuCixin = await Auteur.create({ nom: 'Liu Cixin' });

    const fantasy = await Theme.create({ nom: 'Fantasy' });
    const scifi = await Theme.create({ nom: 'Science-Fiction' });

    // 2. Livres (dépendent des auteurs/thèmes créés juste au-dessus)
    const nomDuVent = await Livre.create({
      titre: 'Le Nom du Vent',
      annee: 2007,
      resume: "Kvothe, aubergiste retiré du monde, raconte enfin sa véritable histoire...",
      id_auteur: rothfuss.id,
      id_theme: fantasy.id,
    });

    const dune = await Livre.create({
      titre: 'Dune',
      annee: 1965,
      resume: "Sur la planète désertique Arrakis, Paul Atréides devra survivre...",
      id_auteur: herbert.id,
      id_theme: scifi.id,
    });

    const troisCorps = await Livre.create({
      titre: '3 Body Problem',
      annee: 2008,
      resume: "Une civilisation extraterrestre menace la Terre après un signal envoyé dans les années 60...",
      id_auteur: liuCixin.id,
      id_theme: scifi.id,
    });

    // 3. Utilisateurs (indépendants, un de chaque rôle pour tester)
    const admin = await Utilisateur.create({
      nom: 'Dupont', prenom: 'Alice', email: 'admin@armurerie.fr',
      motDePasse: 'motdepasse123', role: 'admin',
    });

    const gestionnaire = await Utilisateur.create({
      nom: 'Martin', prenom: 'Julien', email: 'gestionnaire@armurerie.fr',
      motDePasse: 'motdepasse123', role: 'gestionnaire',
    });

    const adherent1 = await Utilisateur.create({
      nom: 'Bernard', prenom: 'Claire', email: 'claire@test.fr',
      motDePasse: 'motdepasse123', role: 'adherent',
    });

    const adherent2 = await Utilisateur.create({
      nom: 'Petit', prenom: 'Marc', email: 'marc@test.fr',
      motDePasse: 'motdepasse123', role: 'adherent',
    });

    // 4. Emprunts et réservations (dépendent des livres ET des utilisateurs)
    const dateEmprunt = new Date();
    const dateRetourPrevue = new Date();
    dateRetourPrevue.setDate(dateRetourPrevue.getDate() + 21);

    await Emprunt.create({
      id_livre: troisCorps.id,
      id_utilisateur: adherent2.id,
      dateEmprunt,
      dateRetourPrevue,
      statut: 'en_cours',
    });

    await Reservation.create({
      id_livre: dune.id,
      id_utilisateur: adherent1.id,
      statut: 'en_attente',
    });

    console.log('Données de test insérées avec succès.');
    process.exit(0);
  } catch (err) {
    console.error('Erreur pendant le seed :', err);
    process.exit(1);
  }
}

seed();