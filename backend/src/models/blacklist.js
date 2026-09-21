const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Blacklist = sequelize.define('Blacklist', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  type: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      isIn: [['ip', 'email', 'word', 'user']]
    }
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  category: DataTypes.STRING(50),
  reason: DataTypes.TEXT,
  added_by: DataTypes.UUID,
  expires_at: DataTypes.DATE,
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'blacklist',
  timestamps: true,
  underscored: false,
  updatedAt: false
});

module.exports = Blacklist;