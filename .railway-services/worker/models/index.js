const { sequelize } = require('../config/database');
const Account = require('./Account');
const Subreddit = require('./Subreddit');
const ScannedPost = require('./ScannedPost');
const Comment = require('./Comment');
const ActionLog = require('./ActionLog');
const Config = require('./Config');

// Define relationships
Subreddit.hasMany(ScannedPost, { foreignKey: 'subredditId', as: 'posts' });
ScannedPost.belongsTo(Subreddit, { foreignKey: 'subredditId', as: 'subreddit' });

Account.hasMany(Comment, { foreignKey: 'accountId', as: 'comments' });
Comment.belongsTo(Account, { foreignKey: 'accountId', as: 'account' });

ScannedPost.hasMany(Comment, { foreignKey: 'postId', as: 'comments' });
Comment.belongsTo(ScannedPost, { foreignKey: 'postId', as: 'post' });

Account.hasMany(ActionLog, { foreignKey: 'accountId', as: 'logs' });
ActionLog.belongsTo(Account, { foreignKey: 'accountId', as: 'account' });

module.exports = {
  sequelize,
  Account,
  Subreddit,
  ScannedPost,
  Comment,
  ActionLog,
  Config
};
