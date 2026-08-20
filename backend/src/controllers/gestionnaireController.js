const { Op } = require('sequelize');
const { Utilisateur, Emprunt, Reservation, Livre } = require('../models');

exports.rechercherAdherents = async (req, res) => {
  try {
    const { nom, email } = req.query;

    const where = {
      role: 'adherent',
      compteSupprime: false,
    };

    if (nom) {
      where[Op.or] = [
        { nom: { [Op.like]: `%${nom}%` } },
        { prenom: { [Op.like]: `%${nom}%` } },
      ];
    }

    if (email) {
      where.email = { [Op.like]: `%${email}%` };
    }

    const adherents = await Utilisateur.findAll({
      where,
      attributes: { exclude: ['motDePasse'] },
    });

    res.json(adherents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la recherche.' });
  }
};

exports.getFicheAdherent = async (req, res) => {
  try {
    const { id } = req.params;

    const adherent = await Utilisateur.findOne({
      where: { id, role: 'adherent' },
      attributes: { exclude: ['motDePasse'] },
    });

    if (!adherent) {
      return res.status(404).json({ message: 'Adhérent introuvable.' });
    }

    const emprunts = await Emprunt.findAll({
      where: { id_utilisateur: id },
      include: [{ model: Livre }],
      order: [['dateEmprunt', 'DESC']],
    });

    const reservations = await Reservation.findAll({
      where: { id_utilisateur: id },
      include: [{ model: Livre }],
      order: [['dateReservation', 'DESC']],
    });

    res.json({
      adherent,
      emprunts,
      reservations,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la récupération de la fiche adhérent.' });
  }
};