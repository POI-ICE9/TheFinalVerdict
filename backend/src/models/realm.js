const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Realm = sequelize.define('Realm', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  realm_type: {
    type: DataTypes.ENUM('inferno', 'purgatorio', 'paradiso'),
    allowNull: false
  },
  custom_name: DataTypes.STRING(100),
  description: DataTypes.TEXT,
  theme: {
    type: DataTypes.STRING(50),
    defaultValue: 'default'
  },
  primary_color: {
    type: DataTypes.STRING(7),
    defaultValue: '#ffd700'
  },
  background_url: DataTypes.STRING(500),
  music_url: DataTypes.STRING(500),
  visibility: {
    type: DataTypes.STRING(20),
    defaultValue: 'public'
  },
  visit_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  souls_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'realms',
  timestamps: true,
  underscored: false
});

module.exports = Realm;