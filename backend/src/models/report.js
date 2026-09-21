// Report.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Report = sequelize.define('Report', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  reporter_id: { type: DataTypes.UUID, allowNull: false },
  reported_user_id: DataTypes.UUID,
  report_type: { type: DataTypes.STRING(50), allowNull: false },
  target_type: { type: DataTypes.STRING(50), allowNull: false },
  target_id: { type: DataTypes.UUID, allowNull: false },
  reason: { type: DataTypes.TEXT, allowNull: false },
  priority: { type: DataTypes.STRING(20), defaultValue: 'medium' },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'pending',
    validate: { isIn: [['pending', 'reviewing', 'resolved', 'dismissed']] }
  },
  assigned_to: DataTypes.UUID,
  resolution_notes: DataTypes.TEXT,
  resolved_at: DataTypes.DATE
}, { tableName: 'reports', timestamps: true, underscored: false });

module.exports = Report;