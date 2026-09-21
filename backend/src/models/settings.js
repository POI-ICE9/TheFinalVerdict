const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Setting = sequelize.define('Setting', {
  key: {
    type: DataTypes.STRING(100),
    primaryKey: true
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  category: DataTypes.STRING(50),
  description: DataTypes.TEXT,
  updated_by: DataTypes.UUID
}, {
  tableName: 'settings',
  timestamps: true,
  underscored: false
});

module.exports = Setting;