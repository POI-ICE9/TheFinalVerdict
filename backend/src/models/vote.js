// Vote.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Vote = sequelize.define('Vote', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  user_id: { type: DataTypes.UUID, allowNull: false },
  user_soul_id: { type: DataTypes.UUID, allowNull: false },
  vote_type: {
    type: DataTypes.STRING(10),
    allowNull: false,
    validate: { isIn: [['like', 'dislike']] }
  }
}, { tableName: 'votes', timestamps: true, underscored: false });

module.exports = Vote;