const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Soul = sequelize.define('Soul', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  category: {
    type: DataTypes.ENUM('historical', 'celebrity', 'fictional', 'personal', 'other'),
    allowNull: false
  },
  epoch: DataTypes.STRING(100),
  nationality: DataTypes.STRING(100),
  biography: DataTypes.TEXT,
  image_url: DataTypes.STRING(500),
  status: {
    type: DataTypes.ENUM('approved', 'pending', 'rejected'),
    defaultValue: 'pending'
  },
  created_by: DataTypes.UUID,
  approved_by: DataTypes.UUID,
  approved_at: DataTypes.DATE,
  rejection_reason: DataTypes.TEXT,
  total_judgments: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  inferno_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  purgatorio_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  paradiso_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  community_score: {
    type: DataTypes.DECIMAL(3,2),
    defaultValue: 0.00
  }
}, {
  tableName: 'souls',
  timestamps: true,
  underscored: false
});

module.exports = Soul;