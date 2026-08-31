const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/mot-de-passe-oublie', authController.demanderReinitialisation);
router.post('/reinitialiser-mot-de-passe', authController.reinitialiserMotDePasse);

module.exports = router;