const express = require('express');
const router = express.Router();
const alerteController = require('../controllers/alerteController');
const { verifierToken } = require('../middlewares/authMiddleware');

router.post('/', verifierToken, alerteController.creerAlerte);
router.get('/mes-alertes', verifierToken, alerteController.getMesAlertes);

module.exports = router;