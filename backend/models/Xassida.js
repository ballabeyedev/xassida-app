const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Xassida = sequelize.define('Xassida', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  titre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  date_enregistrement: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW,
  },
  audioUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  videoUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  pdfUrl: {
    type: DataTypes.STRING,
    allowNull: false
  },
  statut: {
    type: DataTypes.ENUM('actif', 'inactif'),
    defaultValue: 'actif',
  },
  nombre_telechargements: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'xassida',
  timestamps: true,
});

module.exports = Xassida;
