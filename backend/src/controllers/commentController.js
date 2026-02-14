const { Comment, ScannedPost, Account, Subreddit, ActionLog } = require('../../models');
const { Op } = require('sequelize');
const redditService = require('../../services/redditService');

exports.getAllComments = async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;

    const where = {};
    if (status) where.status = status;

    const comments = await Comment.findAndCountAll({
      where,
      include: [
        { model: Account, as: 'account', attributes: ['id', 'username'] },
        { 
          model: ScannedPost, 
          as: 'post',
          include: [{ model: Subreddit, as: 'subreddit' }]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.postComment = async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id, {
      include: [
        { model: Account, as: 'account' },
        { model: ScannedPost, as: 'post' }
      ]
    });

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.status === 'posted') {
      return res.status(400).json({ message: 'Comment already posted' });
    }

    const result = await redditService.postComment(
      comment.account.id,
      comment.post.id,
      comment.commentText
    );

    if (result.success) {
      await comment.update({
        status: 'posted',
        redditCommentId: result.commentId,
        permalink: result.permalink,
        postedAt: new Date()
      });

      await comment.account.increment('totalComments');

      await ActionLog.create({
        accountId: comment.account.id,
        actionType: 'comment_posted',
        subreddit: comment.post.subreddit?.name,
        details: { commentId: result.commentId },
        success: true
      });

      res.json(comment);
    } else {
      res.status(500).json({ message: 'Failed to post comment' });
    }

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateComment = async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    await comment.update(req.body);
    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    await comment.destroy();
    res.json({ message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.checkCommentStatus = async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id, {
      include: [{ model: Account, as: 'account' }]
    });

    if (!comment || !comment.redditCommentId) {
      return res.status(404).json({ message: 'Comment not found or not posted' });
    }

    const status = await redditService.checkCommentStatus(
      comment.account.id,
      comment.redditCommentId
    );

    await comment.update({
      upvotes: status.upvotes || 0,
      downvotes: status.downvotes || 0,
      isRemoved: status.isRemoved,
      lastChecked: new Date()
    });

    res.json(status);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
