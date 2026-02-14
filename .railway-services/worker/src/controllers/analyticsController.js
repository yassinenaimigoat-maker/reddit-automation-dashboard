const { Comment, ScannedPost, ActionLog, Account, Subreddit } = require('../../models');
const { Op } = require('sequelize');
const { sequelize } = require('../../config/database');

exports.getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Comments stats
    const commentsToday = await Comment.count({
      where: { 
        status: 'posted',
        postedAt: { [Op.gte]: today }
      }
    });

    const commentsThisWeek = await Comment.count({
      where: { 
        status: 'posted',
        postedAt: { [Op.gte]: weekAgo }
      }
    });

    const commentsThisMonth = await Comment.count({
      where: { 
        status: 'posted',
        postedAt: { [Op.gte]: monthAgo }
      }
    });

    const totalComments = await Comment.count({
      where: { status: 'posted' }
    });

    // Queue stats
    const queuedPosts = await ScannedPost.count({
      where: { status: 'queued' }
    });

    const postsScannedToday = await ScannedPost.count({
      where: { 
        scannedAt: { [Op.gte]: today }
      }
    });

    // Pending comments
    const pendingComments = await Comment.count({
      where: { status: { [Op.in]: ['pending', 'approved'] } }
    });

    // Account health
    const accounts = await Account.findAll({
      attributes: ['id', 'username', 'status', 'karma', 'healthScore', 'totalComments', 'removedComments']
    });

    // Success rate
    const totalPosted = await Comment.count({ where: { status: 'posted' } });
    const removed = await Comment.count({ where: { isRemoved: true } });
    const successRate = totalPosted > 0 ? ((totalPosted - removed) / totalPosted * 100).toFixed(1) : 100;

    // Karma earned
    const karmaEarned = await Comment.sum('upvotes', {
      where: { status: 'posted' }
    }) || 0;

    res.json({
      comments: {
        today: commentsToday,
        week: commentsThisWeek,
        month: commentsThisMonth,
        total: totalComments
      },
      queue: {
        queued: queuedPosts,
        scannedToday: postsScannedToday,
        pending: pendingComments
      },
      accounts,
      successRate: parseFloat(successRate),
      karmaEarned,
      totalPosted,
      totalRemoved: removed
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getActivityTimeline = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const activity = await Comment.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('postedAt')), 'date'],
        [sequelize.fn('COUNT', '*'), 'count']
      ],
      where: {
        status: 'posted',
        postedAt: { [Op.gte]: startDate }
      },
      group: [sequelize.fn('DATE', sequelize.col('postedAt'))],
      order: [[sequelize.fn('DATE', sequelize.col('postedAt')), 'ASC']]
    });

    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSubredditPerformance = async (req, res) => {
  try {
    const performance = await Comment.findAll({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('upvotes')), 'totalUpvotes'],
        [sequelize.fn('COUNT', '*'), 'totalComments'],
        [sequelize.fn('AVG', sequelize.col('upvotes')), 'avgUpvotes']
      ],
      include: [{
        model: ScannedPost,
        as: 'post',
        attributes: [],
        include: [{
          model: Subreddit,
          as: 'subreddit',
          attributes: ['id', 'name']
        }]
      }],
      where: { status: 'posted' },
      group: ['post.subreddit.id', 'post.subreddit.name'],
      order: [[sequelize.fn('SUM', sequelize.col('upvotes')), 'DESC']],
      raw: true
    });

    res.json(performance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRecentActivity = async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const logs = await ActionLog.findAll({
      include: [{ 
        model: Account, 
        as: 'account',
        attributes: ['username']
      }],
      order: [['timestamp', 'DESC']],
      limit: parseInt(limit)
    });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getKarmaOverTime = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const karma = await Comment.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('postedAt')), 'date'],
        [sequelize.fn('SUM', sequelize.col('upvotes')), 'karma']
      ],
      where: {
        status: 'posted',
        postedAt: { [Op.gte]: startDate }
      },
      group: [sequelize.fn('DATE', sequelize.col('postedAt'))],
      order: [[sequelize.fn('DATE', sequelize.col('postedAt')), 'ASC']]
    });

    res.json(karma);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
