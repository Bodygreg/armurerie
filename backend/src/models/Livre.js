// backend/src/models/Livre.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Livre = sequelize.define('Livre', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  titre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  annee: {
    type: DataTypes.INTEGER,
  },
  resume: {
    type: DataTypes.TEXT,
  },
  photoCouverture: {
    type: DataTypes.STRING,
  },
}, {
  tableName: 'livres',
  timestamps: false,
});

module.exports = Livre;