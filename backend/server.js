require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./src/models'); // on importe depuis index.js

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/test', (req, res) => {
  res.json({ message: 'API L\'Armurerie fonctionne !' });
});

const PORT = process.env.PORT || 5000;

sequelize.sync() // uniquement pour cette première synchro
  .then(() => {
    console.log('Base de données synchronisée.');
    app.listen(PORT, () => console.log(`Serveur démarré sur http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('Erreur de synchronisation :', err);
  });