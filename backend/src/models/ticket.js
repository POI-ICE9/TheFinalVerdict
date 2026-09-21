const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Ticket = sequelize.define('Ticket', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  ticket_number: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    unique: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  assigned_to: DataTypes.UUID,
  category: {
    type: DataTypes.ENUM('technical', 'account', 'report', 'feature_request', 'other'),
    allowNull: false
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium'
  },
  status: {
    type: DataTypes.ENUM('open', 'in_progress', 'resolved', 'closed'),
    defaultValue: 'open'
  },
  subject: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  attachment_url: DataTypes.STRING(500),
  rating: {
    type: DataTypes.INTEGER,
    validate: { min: 1, max: 5 }
  },
  rating_comment: DataTypes.TEXT,
  resolved_at: DataTypes.DATE,
  closed_at: DataTypes.DATE,
  sla_deadline: DataTypes.DATE,
  escalated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'tickets',
  timestamps: true,
  underscored: false
});

module.exports = Ticket;