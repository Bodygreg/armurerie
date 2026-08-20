require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./src/models');
const cron = require('node-cron');
const verifierRetards = require('./src/jobs/relanceEmprunts');

const app = express();

// Vérification tous les jours à 8h00
cron.schedule('0 8 * * *', () => {
  console.log('Exécution du job de vérification des retards...');
  verifierRetards();
});

app.use(cors());
app.use(express.json());
app.use('/api/livres', require('./src/routes/livreRoutes'));
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/reservations', require('./src/routes/reservationRoutes'));
app.use('/api/emprunts', require('./src/routes/empruntRoutes'));
app.use('/api/utilisateurs', require('./src/routes/utilisateurRoutes'));
app.use('/api/admin', require('./src/routes/adminRoutes'));
app.use('/api/contact', require('./src/routes/contactRoutes'));
app.use('/api/gestionnaire', require('./src/routes/gestionnaireRoutes'));

app.get('/api/test', (req, res) => {
  res.json({ message: 'API L\'Armurerie fonctionne !' });
});

const PORT = process.env.PORT || 5000;

sequelize.sync()
  .then(() => {
    console.log('Base de données synchronisée.');
    app.listen(PORT, () => console.log(`Serveur démarré sur http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('Erreur de synchronisation :', err);
  });