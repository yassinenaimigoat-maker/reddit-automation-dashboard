const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ScannedPost = sequelize.define('ScannedPost', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  subredditId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'subreddits',
      key: 'id'
    }
  },
  redditPostId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: 'Reddit post ID (e.g., t3_abc123)'
  },
  title: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  body: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  author: {
    type: DataTypes.STRING,
    allowNull: true
  },
  url: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  permalink: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  relevanceScore: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
    comment: 'Calculated relevance score 0-100'
  },
  matchedKeywords: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  upvotes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  numComments: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  postAge: {
    type: DataTypes.INTEGER,
    comment: 'Age in minutes when scanned'
  },
  isLocked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isByModerator: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  flair: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('queued', 'commented', 'skipped', 'expired'),
    defaultValue: 'queued'
  },
  scannedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  topComments: {
    type: DataTypes.JSONB,
    comment: 'Top 3 comments for context'
  }
}, {
  timestamps: true,
  tableName: 'scanned_posts',
  indexes: [
    { fields: ['subredditId'] },
    { fields: ['status'] },
    { fields: ['relevanceScore'] }
  ]
});

module.exports = ScannedPost;
