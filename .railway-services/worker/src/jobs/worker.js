/**
 * Background Worker - Handles automated scanning and commenting
 * Runs independently from the main server
 */

require('dotenv').config();
const cron = require('node-cron');
const { connectDB } = require('../../config/database');
const { connectRedis } = require('../../config/redis');
const logger = require('../../utils/logger');
const antiBan = require('../../utils/antiBan');
const redditService = require('../../services/redditService');
const aiService = require('../../services/aiService');
const { Config, Subreddit, ScannedPost, Comment, Account, ActionLog } = require('../../models');

class AutomationWorker {
  constructor() {
    this.isRunning = false;
    this.isPaused = false;
  }

  async initialize() {
    await connectDB();
    await connectRedis();
    await aiService.initialize();
    logger.info('🤖 Automation Worker initialized');
  }

  /**
   * Main scanning job - runs every 30 minutes by default
   */
  async scanJob() {
    if (this.isPaused) {
      logger.info('⏸️  Worker is paused, skipping scan');
      return;
    }

    const config = await Config.findOne();
    if (!config || !config.isActive) {
      logger.info('Automation is not active, skipping scan');
      return;
    }

    // Check if we're within active hours
    if (!antiBan.isWithinActiveHours(config.activeHoursStart, config.activeHoursEnd)) {
      logger.info('Outside active hours, skipping scan');
      return;
    }

    // Check if today is a rest day
    if (antiBan.isRestDay(config.restDays)) {
      logger.info('Today is a rest day, skipping scan');
      return;
    }

    logger.info('🔍 Starting subreddit scan...');

    const subreddits = await Subreddit.findAll({ where: { isActive: true } });
    
    for (const subreddit of subreddits) {
      try {
        await redditService.scanSubreddit(subreddit.id);
        
        // Random delay between subreddit scans
        const delay = antiBan.getRandomDelay(1, 3);
        logger.info(`Waiting ${Math.floor(delay / 1000)}s before next subreddit...`);
        await this.sleep(delay);
        
      } catch (error) {
        logger.error(`Error scanning r/${subreddit.name}:`, error);
      }
    }

    logger.info('✅ Scan complete');
  }

  /**
   * Comment generation job - processes queued posts
   */
  async commentJob() {
    if (this.isPaused) {
      logger.info('⏸️  Worker is paused, skipping comment generation');
      return;
    }

    const config = await Config.findOne();
    if (!config || !config.isActive || config.manualApprovalMode) {
      return; // Skip if manual approval is required
    }

    if (!antiBan.isWithinActiveHours(config.activeHoursStart, config.activeHoursEnd)) {
      return;
    }

    if (antiBan.isRestDay(config.restDays)) {
      return;
    }

    logger.info('💬 Processing comment queue...');

    // Get queued posts
    const queuedPosts = await ScannedPost.findAll({
      where: { status: 'queued' },
      include: [{ model: Subreddit, as: 'subreddit' }],
      order: [['relevanceScore', 'DESC']],
      limit: 10
    });

    if (queuedPosts.length === 0) {
      logger.info('No posts in queue');
      return;
    }

    const account = await Account.findOne({ where: { status: 'active' } });
    if (!account) {
      logger.warn('No active account found');
      return;
    }

    // Check rate limits
    const canAct = antiBan.canPerformAction(
      account.id,
      config.maxCommentsPerHour,
      config.maxCommentsPerDay
    );

    if (!canAct.allowed) {
      logger.warn(`Rate limit hit: ${canAct.reason}`);
      return;
    }

    // Process one post at a time
    const post = queuedPosts[0];
    
    // Check subreddit cooldown
    if (!antiBan.canCommentInSubreddit(post.subreddit.name)) {
      logger.info(`Skipping r/${post.subreddit.name} - on cooldown`);
      return;
    }

    try {
      // Decide if promotional or pure help
      const isPromotional = antiBan.shouldBePromotional(config.promotionalRatio);

      // Generate comment
      const result = await aiService.generateComment(
        { post, subreddit: post.subreddit },
        config,
        isPromotional
      );

      if (!result.success) {
        throw new Error(result.error);
      }

      // Check similarity to recent comments
      const recentComments = await Comment.findAll({
        where: { accountId: account.id },
        order: [['createdAt', 'DESC']],
        limit: 20
      });

      const recentTexts = recentComments.map(c => c.commentText);
      
      if (antiBan.isTooSimilar(result.comment, recentTexts, config.similarityThreshold)) {
        logger.warn('Generated comment too similar to recent ones, skipping');
        await post.update({ status: 'skipped' });
        return;
      }

      // Create comment record
      const comment = await Comment.create({
        accountId: account.id,
        postId: post.id,
        commentText: result.comment,
        isPromotional,
        mentionsProduct: result.comment.toLowerCase().includes(config.productName?.toLowerCase() || ''),
        status: config.dryRunMode ? 'pending' : 'approved',
        aiModel: result.model
      });

      logger.info(`Comment generated for: ${post.title}`);
      logger.info(`Comment: ${result.comment.substring(0, 100)}...`);

      // If not dry run and auto-mode, post it
      if (!config.dryRunMode && !config.manualApprovalMode) {
        await this.postComment(comment.id);
      }

      // Update post status
      await post.update({ status: 'commented' });

      // Record action
      antiBan.recordAction(account.id);
      antiBan.recordSubredditComment(post.subreddit.name);

      // Wait before next action
      const waitTime = antiBan.getRecommendedWaitTime(account.id);
      logger.info(`Waiting ${Math.floor(waitTime / 60000)} minutes before next action...`);
      await this.sleep(waitTime);

    } catch (error) {
      logger.error('Error processing comment:', error);
      await post.update({ status: 'skipped' });
    }
  }

  /**
   * Post a comment to Reddit
   */
  async postComment(commentId) {
    try {
      const comment = await Comment.findByPk(commentId, {
        include: [
          { model: Account, as: 'account' },
          { model: ScannedPost, as: 'post' }
        ]
      });

      if (!comment) {
        throw new Error('Comment not found');
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
          subreddit: comment.post.subreddit.name,
          details: { commentId: result.commentId, postTitle: comment.post.title },
          success: true
        });

        logger.info(`✅ Comment posted: ${result.permalink}`);
      }

    } catch (error) {
      logger.error('Error posting comment:', error);
      
      await Comment.update(
        { status: 'failed', errorMessage: error.message },
        { where: { id: commentId } }
      );

      await ActionLog.create({
        actionType: 'comment_posted',
        details: { error: error.message },
        success: false,
        errorMessage: error.message
      });
    }
  }

  /**
   * Health check job - monitor account health
   */
  async healthCheckJob() {
    logger.info('🏥 Running health check...');

    const accounts = await Account.findAll({ where: { status: 'active' } });
    const config = await Config.findOne();

    for (const account of accounts) {
      try {
        // Check recent comments for removal
        const recentComments = await Comment.findAll({
          where: { 
            accountId: account.id,
            status: 'posted',
            postedAt: { [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) }
          }
        });

        let removedCount = 0;

        for (const comment of recentComments) {
          if (comment.redditCommentId) {
            const status = await redditService.checkCommentStatus(
              account.id,
              comment.redditCommentId
            );

            if (status.isRemoved && !comment.isRemoved) {
              await comment.update({ isRemoved: true });
              await account.increment('removedComments');
              removedCount++;
            } else if (status.exists) {
              await comment.update({ 
                upvotes: status.upvotes,
                downvotes: status.downvotes,
                lastChecked: new Date()
              });
            }
          }
        }

        // Auto-pause if too many removed
        if (removedCount >= (config?.pauseOnRemovedComments || 3)) {
          await account.update({ status: 'paused' });
          logger.warn(`⚠️  Account ${account.username} paused due to ${removedCount} removed comments`);
          
          await ActionLog.create({
            accountId: account.id,
            actionType: 'account_paused',
            details: { reason: 'too_many_removed', count: removedCount },
            success: true
          });
        }

        // Calculate health score
        const healthScore = this.calculateHealthScore(account);
        await account.update({ healthScore });

        logger.info(`Account ${account.username} health: ${healthScore}/100`);

      } catch (error) {
        logger.error(`Error checking account ${account.username}:`, error);
      }
    }
  }

  /**
   * Calculate account health score (0-100)
   */
  calculateHealthScore(account) {
    let score = 100;

    // Deduct for removed comments
    score -= (account.removedComments * 10);

    // Deduct if low karma
    if (account.karma < 100) score -= 20;
    else if (account.karma < 500) score -= 10;

    // Deduct if many failed comments
    const failureRate = account.totalComments > 0 
      ? (account.removedComments / account.totalComments) * 100
      : 0;
    
    if (failureRate > 30) score -= 30;
    else if (failureRate > 15) score -= 15;

    return Math.max(0, Math.min(100, score));
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Start the worker with cron schedules
   */
  start() {
    logger.info('🚀 Starting automation worker...');

    // Scan subreddits every 30 minutes
    cron.schedule('*/30 * * * *', () => {
      this.scanJob().catch(err => logger.error('Scan job error:', err));
    });

    // Process comments every 10 minutes
    cron.schedule('*/10 * * * *', () => {
      this.commentJob().catch(err => logger.error('Comment job error:', err));
    });

    // Health check every 6 hours
    cron.schedule('0 */6 * * *', () => {
      this.healthCheckJob().catch(err => logger.error('Health check error:', err));
    });

    logger.info('✅ Worker scheduled and running');
    this.isRunning = true;
  }

  pause() {
    this.isPaused = true;
    logger.info('⏸️  Worker paused');
  }

  resume() {
    this.isPaused = false;
    logger.info('▶️  Worker resumed');
  }
}

// Start worker if run directly
if (require.main === module) {
  const worker = new AutomationWorker();
  worker.initialize().then(() => {
    worker.start();
  }).catch(err => {
    logger.error('Worker initialization failed:', err);
    process.exit(1);
  });
}

module.exports = AutomationWorker;
