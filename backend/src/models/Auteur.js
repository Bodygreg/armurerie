// backend/src/models/Auteur.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Auteur = sequelize.define('Auteur', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'auteurs',
  timestamps: false,
});

module.exports = Auteur;