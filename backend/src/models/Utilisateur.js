const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Utilisateur = sequelize.define('Utilisateur', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  prenom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  motDePasse: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  adresse: {
    type: DataTypes.STRING,
  },
  telephone: {
    type: DataTypes.STRING,
  },
  role: {
    type: DataTypes.ENUM('adherent', 'gestionnaire', 'admin'),
    allowNull: false,
    defaultValue: 'adherent',
  },
  compteSupprime: {
  type: DataTypes.BOOLEAN,
  allowNull: false,
  defaultValue: false,
  },
  resetTokenHache: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  resetTokenExpiration: {
    type: DataTypes.DATE,
    allowNull: true,
  },

}, {
  tableName: 'utilisateurs',
  timestamps: true,
});

module.exports = Utilisateur;