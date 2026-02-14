const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { encrypt, decrypt } = require('../utils/encryption');

const Config = sequelize.define('Config', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // AI Configuration
  aiProvider: {
    type: DataTypes.ENUM('openai', 'anthropic'),
    defaultValue: 'openai'
  },
  openaiApiKey: {
    type: DataTypes.TEXT,
    allowNull: true,
    set(value) {
      this.setDataValue('openaiApiKey', value ? encrypt(value) : null);
    },
    get() {
      const raw = this.getDataValue('openaiApiKey');
      return raw ? decrypt(raw) : null;
    }
  },
  anthropicApiKey: {
    type: DataTypes.TEXT,
    allowNull: true,
    set(value) {
      this.setDataValue('anthropicApiKey', value ? encrypt(value) : null);
    },
    get() {
      const raw = this.getDataValue('anthropicApiKey');
      return raw ? decrypt(raw) : null;
    }
  },
  aiModel: {
    type: DataTypes.STRING,
    defaultValue: 'gpt-4-turbo-preview',
    comment: 'Specific model to use'
  },
  
  // Product Information
  productName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  productUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  productDescription: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  productContext: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Detailed context document for AI'
  },
  
  // Automation Settings
  dryRunMode: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'If true, generate but don\'t post'
  },
  maxCommentsPerDay: {
    type: DataTypes.INTEGER,
    defaultValue: 15
  },
  maxCommentsPerHour: {
    type: DataTypes.INTEGER,
    defaultValue: 3
  },
  minDelayMinutes: {
    type: DataTypes.INTEGER,
    defaultValue: 3
  },
  maxDelayMinutes: {
    type: DataTypes.INTEGER,
    defaultValue: 15
  },
  activeHoursStart: {
    type: DataTypes.INTEGER,
    defaultValue: 9,
    comment: 'Hour of day (0-23)'
  },
  activeHoursEnd: {
    type: DataTypes.INTEGER,
    defaultValue: 23
  },
  promotionalRatio: {
    type: DataTypes.FLOAT,
    defaultValue: 0.3,
    comment: 'Ratio of promotional to helpful comments (0-1)'
  },
  restDays: {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
    defaultValue: [0, 3],
    comment: 'Days of week to skip (0=Sunday, 6=Saturday)'
  },
  
  // Scanning Settings
  scanIntervalMinutes: {
    type: DataTypes.INTEGER,
    defaultValue: 30,
    comment: 'How often to scan subreddits'
  },
  maxPostAgeHours: {
    type: DataTypes.INTEGER,
    defaultValue: 24,
    comment: 'Don\'t comment on posts older than this'
  },
  minRelevanceScore: {
    type: DataTypes.FLOAT,
    defaultValue: 0.5,
    comment: 'Minimum relevance score to queue (0-1)'
  },
  
  // Safety Settings
  similarityThreshold: {
    type: DataTypes.FLOAT,
    defaultValue: 0.7,
    comment: 'Max similarity between comments (0-1)'
  },
  pauseOnRemovedComments: {
    type: DataTypes.INTEGER,
    defaultValue: 3,
    comment: 'Auto-pause if this many comments removed'
  },
  
  // Global Status
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Master on/off switch for automation'
  },
  manualApprovalMode: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Require manual approval for each comment'
  }
}, {
  timestamps: true,
  tableName: 'config'
});

module.exports = Config;
