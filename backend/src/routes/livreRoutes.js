const express = require('express');
const router = express.Router();
const livreController = require('../controllers/livreController');
const { verifierToken, verifierRole } = require('../middlewares/authMiddleware');

router.get('/', livreController.getAllLivres);
router.post('/', verifierToken, verifierRole(['gestionnaire', 'admin']), livreController.creerLivre);
router.patch('/:id/archiver', verifierToken, verifierRole(['gestionnaire', 'admin']), livreController.archiverLivre);
router.get('/:id', livreController.getLivreById);

module.exports = router;