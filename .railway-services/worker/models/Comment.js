const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Comment = sequelize.define('Comment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  accountId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'accounts',
      key: 'id'
    }
  },
  postId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'scanned_posts',
      key: 'id'
    }
  },
  commentText: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  isPromotional: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Does this comment mention our product?'
  },
  mentionsProduct: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'posted', 'removed', 'skipped', 'failed'),
    defaultValue: 'pending'
  },
  redditCommentId: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Reddit comment ID after posting'
  },
  upvotes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  downvotes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  postedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  lastChecked: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Last time we checked if comment still exists'
  },
  isRemoved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  permalink: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  aiModel: {
    type: DataTypes.STRING,
    comment: 'Which AI model generated this (gpt-4, claude-3, etc.)'
  },
  generatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  scheduledFor: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When to post this comment'
  },
  errorMessage: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'comments',
  indexes: [
    { fields: ['accountId'] },
    { fields: ['postId'] },
    { fields: ['status'] },
    { fields: ['postedAt'] }
  ]
});

module.exports = Comment;
