const express = require('express');
const router = express.Router();
const utilisateurController = require('../controllers/utilisateurController');
const { verifierToken } = require('../middlewares/authMiddleware');

router.get('/me', verifierToken, utilisateurController.getMonProfil);
router.patch('/me', verifierToken, utilisateurController.modifierMonProfil);
router.delete('/me', verifierToken, utilisateurController.supprimerMonCompte);

module.exports = router;