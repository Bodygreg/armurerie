const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const { verifierToken } = require('../middlewares/authMiddleware');

router.post('/', verifierToken, reservationController.createReservation);

router.patch('/:id/annuler', verifierToken, reservationController.annulerReservation);

module.exports = router;