const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Subreddit = sequelize.define('Subreddit', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: 'Subreddit name without r/ prefix'
  },
  keywords: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    comment: 'Keywords to match for relevance'
  },
  priority: {
    type: DataTypes.ENUM('high', 'medium', 'low'),
    defaultValue: 'medium'
  },
  maxCommentsPerDay: {
    type: DataTypes.INTEGER,
    defaultValue: 3,
    comment: 'Max comments allowed per day in this subreddit'
  },
  allowPosts: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether we can create posts in this subreddit'
  },
  toneNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Custom tone/style notes for AI'
  },
  rules: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Cached subreddit rules'
  },
  allowsPromotion: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Does this sub allow self-promotion'
  },
  requiresFlair: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  flairOptions: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Available flair options'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  commentsToday: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lastCommentAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  totalEngagement: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Total upvotes received'
  },
  subscribers: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'subreddits'
});

module.exports = Subreddit;
