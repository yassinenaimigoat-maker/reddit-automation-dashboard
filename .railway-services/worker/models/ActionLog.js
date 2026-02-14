const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ActionLog = sequelize.define('ActionLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  accountId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'accounts',
      key: 'id'
    }
  },
  actionType: {
    type: DataTypes.ENUM(
      'scan_subreddit',
      'post_scanned',
      'comment_generated',
      'comment_posted',
      'comment_approved',
      'comment_skipped',
      'comment_removed',
      'upvote_given',
      'account_paused',
      'rate_limit_hit',
      'error'
    ),
    allowNull: false
  },
  details: {
    type: DataTypes.JSONB,
    comment: 'Additional details about the action'
  },
  subreddit: {
    type: DataTypes.STRING,
    allowNull: true
  },
  success: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  errorMessage: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: false,
  tableName: 'action_logs',
  indexes: [
    { fields: ['accountId'] },
    { fields: ['actionType'] },
    { fields: ['timestamp'] }
  ]
});

module.exports = ActionLog;
