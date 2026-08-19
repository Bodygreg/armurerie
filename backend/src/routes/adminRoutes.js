const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifierToken, verifierRole } = require('../middlewares/authMiddleware');

router.post('/gestionnaires', verifierToken, verifierRole(['admin']), adminController.creerGestionnaire);
router.delete('/gestionnaires/:id', verifierToken, verifierRole(['admin']), adminController.supprimerGestionnaire);

module.exports = router;