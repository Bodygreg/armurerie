const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Alerte = sequelize.define('Alerte', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  statut: {
    type: DataTypes.ENUM('en_attente', 'notifiee'),
    allowNull: false,
    defaultValue: 'en_attente',
  },
}, {
  tableName: 'alertes',
  timestamps: true,
});

module.exports = Alerte;