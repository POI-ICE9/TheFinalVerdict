const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 50],
      is: /^[a-zA-Z0-9_]+$/
    }
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  avatar_url: DataTypes.STRING(500),
  bio: DataTypes.TEXT,
  quote: DataTypes.TEXT,
  status: {
    type: DataTypes.ENUM('active', 'suspended', 'banned', 'pending'),
    defaultValue: 'active'
  },
  role: {
    type: DataTypes.ENUM('user', 'moderator', 'super_moderator', 'content_manager', 'support', 'analytics', 'admin', 'founder'),
    defaultValue: 'user'
  },
  karma: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  xp: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  level: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  last_login: DataTypes.DATE,
  email_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  two_factor_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  two_factor_secret: DataTypes.STRING(255),
  privacy_settings: {
    type: DataTypes.JSONB,
    defaultValue: {
      profile_visibility: 'public',
      allow_comments: true,
      allow_messages: true
    }
  },
  deleted_at: DataTypes.DATE
}, {
  tableName: 'users',
  timestamps: true,
  underscored: false,
  paranoid: false,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password_hash) {
        user.password_hash = await bcrypt.hash(user.password_hash, 10);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password_hash')) {
        user.password_hash = await bcrypt.hash(user.password_hash, 10);
      }
    }
  }
});

User.prototype.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password_hash);
};

User.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.password_hash;
  delete values.two_factor_secret;
  return values;
};

module.exports = User;