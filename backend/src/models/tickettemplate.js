// TicketTemplate.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TicketTemplate = sequelize.define('TicketTemplate', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  category: {
    type: DataTypes.ENUM('technical', 'account', 'report', 'feature_request', 'other'),
    allowNull: false
  },
  subject: { type: DataTypes.STRING(255), allowNull: false },
  body: { type: DataTypes.TEXT, allowNull: false },
  variables: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
  created_by: DataTypes.UUID
}, { tableName: 'ticket_templates', timestamps: true, underscored: false });

module.exports = TicketTemplate;