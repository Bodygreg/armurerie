const { Livre, Auteur, Theme, Emprunt, Reservation } = require('../models');
const { Op } = require('sequelize');

exports.getAllLivres = async (req, res) => {
  try {
    const { titre, auteur, theme, tri, page, limite } = req.query;

    const livreWhere = { archive: false };
    if (titre) {
      livreWhere.titre = { [Op.like]: `%${titre}%` };
    }

    const auteurInclude = { model: Auteur };
    if (auteur) {
      auteurInclude.where = { nom: { [Op.like]: `%${auteur}%` } };
      auteurInclude.required = true;
    }

    const themeInclude = { model: Theme };
    if (theme) {
      themeInclude.where = { nom: { [Op.like]: `%${theme}%` } };
      themeInclude.required = true;
    }

    const ordre = tri === 'recent' ? [['createdAt', 'DESC']] : [['titre', 'ASC']];

    const limiteNombre = limite ? parseInt(limite, 10) : 12;
    const pageNombre = page ? parseInt(page, 10) : 1;
    const decalage = (pageNombre - 1) * limiteNombre;

    const { count, rows: livres } = await Livre.findAndCountAll({
      where: livreWhere,
      order: ordre,
      limit: limiteNombre,
      offset: decalage,
      distinct: true,
      include: [
        auteurInclude,
        themeInclude,
        { model: Emprunt, required: false, where: { statut: ['en_cours', 'en_retard'] } },
        { model: Reservation, required: false, where: { statut: 'en_attente' } },
      ],
    });

    const livresAvecStatut = livres.map((livre) => {
      let statut = 'disponible';
      if (livre.Emprunts && livre.Emprunts.length > 0) statut = 'indisponible';
      else if (livre.Reservations && livre.Reservations.length > 0) statut = 'reserve';

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

    res.json({
      livres: livresAvecStatut,
      total: count,
      page: pageNombre,
      totalPages: Math.ceil(count / limiteNombre),
    });
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

    if (!livre || livre.archive) {
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

exports.creerLivre = async (req, res) => {
  try {
    const { titre, annee, resume, photoCouverture, auteur, theme } = req.body;

    if (!titre || !auteur || !theme) {
      return res.status(400).json({ message: 'Titre, auteur et thème sont requis.' });
    }

    const [auteurTrouve] = await Auteur.findOrCreate({ where: { nom: auteur } });
    const [themeTrouve] = await Theme.findOrCreate({ where: { nom: theme } });

    const livre = await Livre.create({
      titre,
      annee,
      resume,
      photoCouverture,
      id_auteur: auteurTrouve.id,
      id_theme: themeTrouve.id,
    });

    res.status(201).json(livre);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la création du livre.' });
  }
};

exports.archiverLivre = async (req, res) => {
  try {
    const { id } = req.params;
    const livre = await Livre.findByPk(id);

    if (!livre) {
      return res.status(404).json({ message: 'Livre introuvable.' });
    }

    livre.archive = true;
    await livre.save();

    res.json({ message: 'Livre retiré du catalogue.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de l'archivage du livre." });
  }
};