// Friendship.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Friendship = sequelize.define('Friendship', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  user_id: { type: DataTypes.UUID, allowNull: false },
  friend_id: { type: DataTypes.UUID, allowNull: false },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'pending',
    validate: { isIn: [['pending', 'accepted', 'rejected', 'blocked']] }
  }
}, { 
  tableName: 'friendships', 
  timestamps: true, 
  underscored: false,
  indexes: [{ unique: true, fields: ['user_id', 'friend_id'] }]
});

module.exports = Friendship;