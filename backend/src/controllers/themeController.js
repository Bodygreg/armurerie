const { Theme } = require('../models');

exports.getAllThemes = async (req, res) => {
  try {
    const themes = await Theme.findAll({
      order: [['nom', 'ASC']],
    });
    res.json(themes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la récupération des thèmes.' });
  }
};