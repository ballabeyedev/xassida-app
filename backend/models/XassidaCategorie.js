const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const XassidaCategorie = sequelize.define('XassidaCategorie', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
}, {
  tableName: 'xassida_categorie',
  timestamps: false,
});

module.exports = XassidaCategorie;
