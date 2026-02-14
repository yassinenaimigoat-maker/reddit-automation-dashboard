const { Subreddit, ScannedPost, Comment } = require('../../models');
const redditService = require('../../services/redditService');
const { Op } = require('sequelize');

exports.getAllSubreddits = async (req, res) => {
  try {
    const subreddits = await Subreddit.findAll({
      order: [['priority', 'DESC'], ['name', 'ASC']]
    });
    res.json(subreddits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createSubreddit = async (req, res) => {
  try {
    const { name, keywords, priority, maxCommentsPerDay, toneNotes, allowPosts } = req.body;

    // Fetch subreddit info and rules
    const info = await redditService.getSubredditRules(name);

    const subreddit = await Subreddit.create({
      name,
      keywords: keywords || [],
      priority: priority || 'medium',
      maxCommentsPerDay: maxCommentsPerDay || 3,
      toneNotes,
      allowPosts: allowPosts || false,
      rules: info ? JSON.stringify(info.rules) : null,
      subscribers: info?.subscribers
    });

    res.status(201).json(subreddit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateSubreddit = async (req, res) => {
  try {
    const subreddit = await Subreddit.findByPk(req.params.id);
    
    if (!subreddit) {
      return res.status(404).json({ message: 'Subreddit not found' });
    }

    await subreddit.update(req.body);
    res.json(subreddit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteSubreddit = async (req, res) => {
  try {
    const subreddit = await Subreddit.findByPk(req.params.id);
    
    if (!subreddit) {
      return res.status(404).json({ message: 'Subreddit not found' });
    }

    await subreddit.destroy();
    res.json({ message: 'Subreddit deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.searchSubreddits = async (req, res) => {
  try {
    const { q } = req.query;
    const results = await redditService.searchSubreddits(q);
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.scanSubreddit = async (req, res) => {
  try {
    const result = await redditService.scanSubreddit(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSubredditStats = async (req, res) => {
  try {
    const subreddit = await Subreddit.findByPk(req.params.id);
    
    if (!subreddit) {
      return res.status(404).json({ message: 'Subreddit not found' });
    }

    const totalPosts = await ScannedPost.count({ where: { subredditId: subreddit.id } });
    const queuedPosts = await ScannedPost.count({ 
      where: { subredditId: subreddit.id, status: 'queued' } 
    });
    
    const comments = await Comment.count({
      include: [{
        model: ScannedPost,
        as: 'post',
        where: { subredditId: subreddit.id }
      }]
    });

    res.json({
      subreddit,
      stats: { totalPosts, queuedPosts, comments }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
