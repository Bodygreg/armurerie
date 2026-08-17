// backend/src/models/Reservation.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Reservation = sequelize.define('Reservation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  dateReservation: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  statut: {
    type: DataTypes.ENUM('en_attente', 'annulee', 'convertie_en_emprunt'),
    allowNull: false,
    defaultValue: 'en_attente',
  },
}, {
  tableName: 'reservations',
  timestamps: false,
});

module.exports = Reservation;