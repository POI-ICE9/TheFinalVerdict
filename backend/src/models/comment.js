// Comment.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Comment = sequelize.define('Comment', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  user_id: { type: DataTypes.UUID, allowNull: false },
  user_soul_id: DataTypes.UUID,
  content: { type: DataTypes.TEXT, allowNull: false, validate: { len: [1, 2000] } },
  likes: { type: DataTypes.INTEGER, defaultValue: 0 },
  dislikes: { type: DataTypes.INTEGER, defaultValue: 0 },
  is_flagged: { type: DataTypes.BOOLEAN, defaultValue: false },
  flag_reason: DataTypes.TEXT,
  deleted_at: DataTypes.DATE
}, { tableName: 'comments', timestamps: true, underscored: false });

module.exports = Comment;