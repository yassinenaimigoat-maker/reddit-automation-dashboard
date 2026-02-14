const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { encrypt, decrypt } = require('../utils/encryption');

const Account = sequelize.define('Account', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  // Encrypted credentials
  clientId: {
    type: DataTypes.TEXT,
    allowNull: false,
    set(value) {
      this.setDataValue('clientId', encrypt(value));
    },
    get() {
      const raw = this.getDataValue('clientId');
      return raw ? decrypt(raw) : null;
    }
  },
  clientSecret: {
    type: DataTypes.TEXT,
    allowNull: false,
    set(value) {
      this.setDataValue('clientSecret', encrypt(value));
    },
    get() {
      const raw = this.getDataValue('clientSecret');
      return raw ? decrypt(raw) : null;
    }
  },
  password: {
    type: DataTypes.TEXT,
    allowNull: false,
    set(value) {
      this.setDataValue('password', encrypt(value));
    },
    get() {
      const raw = this.getDataValue('password');
      return raw ? decrypt(raw) : null;
    }
  },
  userAgent: {
    type: DataTypes.STRING,
    defaultValue: 'RedditAutomation/1.0.0'
  },
  karma: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('active', 'paused', 'banned', 'rate_limited'),
    defaultValue: 'active'
  },
  accountAge: {
    type: DataTypes.DATE,
    allowNull: true
  },
  lastActive: {
    type: DataTypes.DATE,
    allowNull: true
  },
  totalComments: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  totalPosts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  removedComments: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  healthScore: {
    type: DataTypes.INTEGER,
    defaultValue: 100,
    comment: '0-100 score based on karma, removed comments, etc.'
  }
}, {
  timestamps: true,
  tableName: 'accounts'
});

module.exports = Account;
