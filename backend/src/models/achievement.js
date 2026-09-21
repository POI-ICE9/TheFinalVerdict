// Achievement.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Achievement = sequelize.define('Achievement', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  description: DataTypes.TEXT,
  icon: DataTypes.STRING(100),
  requirement_type: DataTypes.STRING(50),
  requirement_value: DataTypes.INTEGER,
  xp_reward: { type: DataTypes.INTEGER, defaultValue: 0 }
}, { tableName: 'achievements', timestamps: true, underscored: false });

module.exports = Achievement;