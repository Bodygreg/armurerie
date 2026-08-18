const express = require('express');
const router = express.Router();
const empruntController = require('../controllers/empruntController');
const { verifierToken, verifierRole } = require('../middlewares/authMiddleware');

router.get('/mes-emprunts', verifierToken, empruntController.getMesEmprunts);
router.get('/', verifierToken, verifierRole(['gestionnaire', 'admin']), empruntController.getAllEmpruntsEnCours);

module.exports = router;