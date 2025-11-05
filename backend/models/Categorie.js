const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Categorie = sequelize.define('Categorie', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    nom: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    statut: {
        type: DataTypes.ENUM('actif', 'inactif'),
        defaultValue: 'actif',
    },
}, {
  tableName: 'categorie',
  timestamps: true,
});

module.exports = Categorie;
