const { Emprunt, Livre, Utilisateur } = require('../models');

// Pour un adhérent : ses propres emprunts
exports.getMesEmprunts = async (req, res) => {
  try {
    const emprunts = await Emprunt.findAll({
      where: { id_utilisateur: req.utilisateur.id },
      include: [{ model: Livre }],
      order: [['dateEmprunt', 'DESC']],
    });
    res.json(emprunts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la récupération des emprunts.' });
  }
};

// Pour un gestionnaire/admin : tous les emprunts en cours
exports.getAllEmpruntsEnCours = async (req, res) => {
  try {
    const emprunts = await Emprunt.findAll({
      where: { statut: ['en_cours', 'en_retard'] },
      include: [{ model: Livre }, { model: Utilisateur, attributes: ['id', 'nom', 'prenom', 'email'] }],
      order: [['dateRetourPrevue', 'ASC']],
    });
    res.json(emprunts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la récupération des emprunts.' });
  }
};