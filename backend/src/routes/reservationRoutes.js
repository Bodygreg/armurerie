const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const { verifierToken, verifierRole } = require('../middlewares/authMiddleware');

router.post('/', verifierToken, reservationController.createReservation);

router.patch('/:id/annuler', verifierToken, reservationController.annulerReservation);

router.get('/mes-reservations', verifierToken, reservationController.getMesReservations);

router.patch('/:id/convertir-en-emprunt', verifierToken, verifierRole(['gestionnaire', 'admin']), reservationController.convertirEnEmprunt);

module.exports = router;