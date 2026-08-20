const express = require('express');
const router = express.Router();
const gestionnaireController = require('../controllers/gestionnaireController');
const { verifierToken, verifierRole } = require('../middlewares/authMiddleware');

router.get('/adherents', verifierToken, verifierRole(['gestionnaire', 'admin']), gestionnaireController.rechercherAdherents);
router.get('/adherents/:id', verifierToken, verifierRole(['gestionnaire', 'admin']), gestionnaireController.getFicheAdherent);

module.exports = router;