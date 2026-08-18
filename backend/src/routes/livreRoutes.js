const express = require('express');
const router = express.Router();
const livreController = require('../controllers/livreController');

router.get('/', livreController.getAllLivres);
router.get('/:id', livreController.getLivreById);

module.exports = router;