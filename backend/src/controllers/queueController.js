const { ScannedPost, Comment, Subreddit, Account, Config } = require('../../models');
const { Op } = require('sequelize');
const aiService = require('../../services/aiService');
const antiBan = require('../../utils/antiBan');
const logger = require('../../utils/logger');

exports.getQueue = async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;

    const where = {};
    if (status) where.status = status;
    else where.status = { [Op.in]: ['queued', 'commented'] };

    const posts = await ScannedPost.findAndCountAll({
      where,
      include: [{ model: Subreddit, as: 'subreddit' }],
      order: [['relevanceScore', 'DESC'], ['scannedAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.generateComment = async (req, res) => {
  try {
    const post = await ScannedPost.findByPk(req.params.postId, {
      include: [{ model: Subreddit, as: 'subreddit' }]
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const config = await Config.findOne();
    const isPromotional = req.body.isPromotional !== undefined 
      ? req.body.isPromotional 
      : antiBan.shouldBePromotional(config.promotionalRatio);

    const result = await aiService.generateComment(
      { post, subreddit: post.subreddit },
      config,
      isPromotional
    );

    if (!result.success) {
      return res.status(500).json({ message: result.error });
    }

    // Check similarity
    const account = await Account.findOne({ where: { status: 'active' } });
    if (account) {
      const recentComments = await Comment.findAll({
        where: { accountId: account.id },
        order: [['createdAt', 'DESC']],
        limit: 20
      });

      const recentTexts = recentComments.map(c => c.commentText);
      const isSimilar = antiBan.isTooSimilar(result.comment, recentTexts, config.similarityThreshold);

      result.isTooSimilar = isSimilar;
      if (isSimilar) {
        result.warning = 'This comment is very similar to recent comments';
      }
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.approveComment = async (req, res) => {
  try {
    const { postId, commentText, isPromotional } = req.body;

    const post = await ScannedPost.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const account = await Account.findOne({ where: { status: 'active' } });
    if (!account) {
      return res.status(404).json({ message: 'No active account found' });
    }

    const comment = await Comment.create({
      accountId: account.id,
      postId,
      commentText,
      isPromotional: isPromotional || false,
      status: 'approved',
      aiModel: 'manual'
    });

    await post.update({ status: 'commented' });

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.skipPost = async (req, res) => {
  try {
    const post = await ScannedPost.findByPk(req.params.postId);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    await post.update({ status: 'skipped' });
    res.json({ message: 'Post skipped' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.bulkApprove = async (req, res) => {
  try {
    const { commentIds } = req.body;

    await Comment.update(
      { status: 'approved' },
      { where: { id: { [Op.in]: commentIds }, status: 'pending' } }
    );

    res.json({ message: `${commentIds.length} comments approved` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.bulkReject = async (req, res) => {
  try {
    const { postIds } = req.body;

    await ScannedPost.update(
      { status: 'skipped' },
      { where: { id: { [Op.in]: postIds } } }
    );

    res.json({ message: `${postIds.length} posts skipped` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
