// backend/src/models/Emprunt.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Emprunt = sequelize.define('Emprunt', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  dateEmprunt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  dateRetourPrevue: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  dateRetourReelle: {
    type: DataTypes.DATE,
    allowNull: true, // NULL tant que le livre n'est pas rendu
  },
  statut: {
    type: DataTypes.ENUM('en_cours', 'retourne', 'en_retard'),
    allowNull: false,
    defaultValue: 'en_cours',
  },
}, {
  tableName: 'emprunts',
  timestamps: false,
});

module.exports = Emprunt;