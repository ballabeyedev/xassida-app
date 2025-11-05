const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Favori = sequelize.define('Favori', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
}, {
  tableName: 'favori',
  timestamps: true,
});

module.exports = Favori;
