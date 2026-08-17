const sequelize = require('../config/database');
const Utilisateur = require('./Utilisateur');
const Livre = require('./Livre');
const Auteur = require('./Auteur');
const Theme = require('./Theme');
const Emprunt = require('./Emprunt');
const Reservation = require('./Reservation');

Auteur.hasMany(Livre, { foreignKey: 'id_auteur' });
Livre.belongsTo(Auteur, { foreignKey: 'id_auteur' });

Theme.hasMany(Livre, { foreignKey: 'id_theme' });
Livre.belongsTo(Theme, { foreignKey: 'id_theme' });

// Un emprunt appartient à un utilisateur ET à un livre
Utilisateur.hasMany(Emprunt, { foreignKey: 'id_utilisateur' });
Emprunt.belongsTo(Utilisateur, { foreignKey: 'id_utilisateur' });

Livre.hasMany(Emprunt, { foreignKey: 'id_livre' });
Emprunt.belongsTo(Livre, { foreignKey: 'id_livre' });

// Une réservation appartient à un utilisateur ET à un livre
Utilisateur.hasMany(Reservation, { foreignKey: 'id_utilisateur' });
Reservation.belongsTo(Utilisateur, { foreignKey: 'id_utilisateur' });

Livre.hasMany(Reservation, { foreignKey: 'id_livre' });
Reservation.belongsTo(Livre, { foreignKey: 'id_livre' });

module.exports = {
  sequelize,
  Utilisateur,
  Livre,
  Auteur,
  Theme,
  Emprunt,
  Reservation,
};