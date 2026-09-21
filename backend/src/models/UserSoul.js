const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserSoul = sequelize.define('UserSoul', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  soul_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  realm_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  circle_name: DataTypes.STRING(100),
  motivation: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      len: [50, 5000]
    }
  },
  punishment: DataTypes.TEXT,
  beatitude: DataTypes.TEXT,
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  custom_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'user_souls',
  timestamps: true,
  underscored: false
});

module.exports = UserSoul;