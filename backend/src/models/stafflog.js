const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StaffLog = sequelize.define('StaffLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  staff_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  action: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  target_type: DataTypes.STRING(50),
  target_id: DataTypes.UUID,
  details: DataTypes.JSONB,
  ip_address: DataTypes.STRING(45),
  user_agent: DataTypes.TEXT
}, {
  tableName: 'staff_logs',
  timestamps: true,
  underscored: false,
  updatedAt: false
});

module.exports = StaffLog;