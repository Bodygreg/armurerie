require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./src/models');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/livres', require('./src/routes/livreRoutes'));
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/reservations', require('./src/routes/reservationRoutes'));
app.use('/api/emprunts', require('./src/routes/empruntRoutes'));

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