const express = require('express');
const router = express.Router();
const livreController = require('../controllers/livreController');
const { verifierToken, verifierRole } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload');

router.get('/', livreController.getAllLivres);
router.post('/', verifierToken, verifierRole(['gestionnaire', 'admin']), upload.single('photo'), livreController.creerLivre);
router.patch('/:id/photo', verifierToken, verifierRole(['gestionnaire', 'admin']), upload.single('photo'), livreController.modifierPhotoLivre);
router.patch('/:id/archiver', verifierToken, verifierRole(['gestionnaire', 'admin']), livreController.archiverLivre);
router.get('/:id', livreController.getLivreById);

module.exports = router;