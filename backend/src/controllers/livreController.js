const { Livre, Auteur, Theme, Emprunt, Reservation } = require('../models');

exports.getAllLivres = async (req, res) => {
  try {
    const livres = await Livre.findAll({
      include: [
        { model: Auteur },
        { model: Theme },
        {
          model: Emprunt,
          required: false,
          where: { statut: ['en_cours', 'en_retard'] },
        },
        {
          model: Reservation,
          required: false,
          where: { statut: 'en_attente' },
        },
      ],
    });

    const livresAvecStatut = livres.map((livre) => {
      let statut = 'disponible';

      if (livre.Emprunts && livre.Emprunts.length > 0) {
        statut = 'indisponible';
      } else if (livre.Reservations && livre.Reservations.length > 0) {
        statut = 'reserve';
      }

      return {
        id: livre.id,
        titre: livre.titre,
        annee: livre.annee,
        resume: livre.resume,
        photoCouverture: livre.photoCouverture,
        auteur: livre.Auteur ? livre.Auteur.nom : null,
        theme: livre.Theme ? livre.Theme.nom : null,
        statut,
      };
    });

    res.json(livresAvecStatut);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la récupération des livres.' });
  }
};

exports.getLivreById = async (req, res) => {
  try {
    const { id } = req.params;

    const livre = await Livre.findByPk(id, {
      include: [
        { model: Auteur },
        { model: Theme },
        {
          model: Emprunt,
          required: false,
          where: { statut: ['en_cours', 'en_retard'] },
        },
        {
          model: Reservation,
          required: false,
          where: { statut: 'en_attente' },
        },
      ],
    });

    if (!livre) {
      return res.status(404).json({ message: 'Livre introuvable.' });
    }

    let statut = 'disponible';
    if (livre.Emprunts && livre.Emprunts.length > 0) {
      statut = 'indisponible';
    } else if (livre.Reservations && livre.Reservations.length > 0) {
      statut = 'reserve';
    }

    res.json({
      id: livre.id,
      titre: livre.titre,
      annee: livre.annee,
      resume: livre.resume,
      photoCouverture: livre.photoCouverture,
      auteur: livre.Auteur ? livre.Auteur.nom : null,
      theme: livre.Theme ? livre.Theme.nom : null,
      statut,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la récupération du livre.' });
  }
};