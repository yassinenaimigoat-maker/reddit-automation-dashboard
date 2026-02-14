const snoowrap = require('snoowrap');
const logger = require('../utils/logger');
const { Account, Subreddit, ScannedPost, ActionLog } = require('../models');

class RedditService {
  constructor() {
    this.clients = new Map(); // Store Reddit clients per account
  }

  /**
   * Create or get Reddit client for an account
   */
  async getClient(accountId) {
    if (this.clients.has(accountId)) {
      return this.clients.get(accountId);
    }

    const account = await Account.findByPk(accountId);
    if (!account) {
      throw new Error('Account not found');
    }

    const client = new snoowrap({
      userAgent: account.userAgent,
      clientId: account.clientId,
      clientSecret: account.clientSecret,
      username: account.username,
      password: account.password
    });

    // Configure to avoid rate limit issues
    client.config({ 
      requestDelay: 1000, // 1 second between requests
      continueAfterRatelimitError: false,
      warnings: false,
      debug: false
    });

    this.clients.set(accountId, client);
    logger.info(`Reddit client created for account: ${account.username}`);
    return client;
  }

  /**
   * Test Reddit credentials
   */
  async testCredentials(accountId) {
    try {
      const client = await this.getClient(accountId);
      const me = await client.getMe();
      
      return {
        success: true,
        username: me.name,
        karma: me.link_karma + me.comment_karma,
        accountAge: new Date(me.created_utc * 1000)
      };
    } catch (error) {
      logger.error('Reddit credentials test failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Fetch subreddit rules
   */
  async getSubredditRules(subredditName) {
    try {
      const client = await this.getClient(1); // Use default account
      const subreddit = await client.getSubreddit(subredditName);
      const rules = await subreddit.getRules();
      const info = await subreddit.fetch();

      return {
        rules: rules.rules.map(r => ({ title: r.short_name, description: r.description })),
        subscribers: info.subscribers,
        description: info.public_description,
        allowsImagePosts: info.allow_images,
        allowsTextPosts: info.allow_text_posts
      };
    } catch (error) {
      logger.error(`Failed to fetch rules for r/${subredditName}:`, error);
      return null;
    }
  }

  /**
   * Scan a subreddit for relevant posts
   */
  async scanSubreddit(subredditId, limit = 25) {
    try {
      const subreddit = await Subreddit.findByPk(subredditId);
      if (!subreddit || !subreddit.isActive) {
        return { scanned: 0, queued: 0 };
      }

      const client = await this.getClient(1); // Use default account
      const sub = client.getSubreddit(subreddit.name);
      
      // Fetch new posts
      const posts = await sub.getNew({ limit });
      
      let scanned = 0;
      let queued = 0;

      for (const post of posts) {
        scanned++;

        // Skip if already in database
        const exists = await ScannedPost.findOne({ 
          where: { redditPostId: post.id } 
        });
        if (exists) continue;

        // Calculate post age
        const postAge = Math.floor((Date.now() - post.created_utc * 1000) / 60000);
        
        // Skip if too old (default 24 hours = 1440 minutes)
        if (postAge > 1440) continue;

        // Skip if locked or by moderator
        if (post.locked) continue;
        if (post.distinguished === 'moderator') continue;

        // Calculate relevance score
        const relevanceScore = this.calculateRelevance(
          post.title,
          post.selftext,
          subreddit.keywords
        );

        // Get top comments for context
        const topComments = await this.getTopComments(post, 3);

        // Create scanned post
        const scannedPost = await ScannedPost.create({
          subredditId: subreddit.id,
          redditPostId: post.id,
          title: post.title,
          body: post.selftext || '',
          author: post.author.name,
          url: post.url,
          permalink: `https://reddit.com${post.permalink}`,
          relevanceScore,
          matchedKeywords: this.findMatchedKeywords(post.title + ' ' + post.selftext, subreddit.keywords),
          upvotes: post.ups,
          numComments: post.num_comments,
          postAge,
          isLocked: post.locked,
          isByModerator: post.distinguished === 'moderator',
          flair: post.link_flair_text,
          topComments,
          status: relevanceScore >= 0.5 ? 'queued' : 'skipped'
        });

        if (relevanceScore >= 0.5) {
          queued++;
          logger.info(`Queued post: ${post.title} (score: ${relevanceScore.toFixed(2)})`);
        }
      }

      // Log the scan action
      await ActionLog.create({
        actionType: 'scan_subreddit',
        subreddit: subreddit.name,
        details: { scanned, queued },
        success: true
      });

      logger.info(`Scanned r/${subreddit.name}: ${scanned} posts, ${queued} queued`);
      return { scanned, queued };

    } catch (error) {
      logger.error(`Error scanning subreddit:`, error);
      await ActionLog.create({
        actionType: 'scan_subreddit',
        subreddit: subreddit.name,
        details: { error: error.message },
        success: false,
        errorMessage: error.message
      });
      throw error;
    }
  }

  /**
   * Calculate relevance score for a post
   */
  calculateRelevance(title, body, keywords) {
    if (!keywords || keywords.length === 0) return 0.5;

    const text = (title + ' ' + body).toLowerCase();
    let score = 0;
    let matches = 0;

    for (const keyword of keywords) {
      if (text.includes(keyword.toLowerCase())) {
        matches++;
        // Higher score for title matches
        if (title.toLowerCase().includes(keyword.toLowerCase())) {
          score += 0.3;
        } else {
          score += 0.2;
        }
      }
    }

    // Question marks increase relevance
    if (text.includes('?')) score += 0.1;
    
    // Looking for recommendations/help
    const helpWords = ['recommend', 'suggestion', 'help', 'looking for', 'alternative', 'better'];
    for (const word of helpWords) {
      if (text.includes(word)) {
        score += 0.15;
        break;
      }
    }

    return Math.min(score, 1.0);
  }

  /**
   * Find matched keywords in text
   */
  findMatchedKeywords(text, keywords) {
    if (!keywords) return [];
    const textLower = text.toLowerCase();
    return keywords.filter(kw => textLower.includes(kw.toLowerCase()));
  }

  /**
   * Get top comments from a post for context
   */
  async getTopComments(post, limit = 3) {
    try {
      const comments = await post.comments.fetchMore({ amount: limit });
      return comments.slice(0, limit).map(c => ({
        author: c.author.name,
        body: c.body.substring(0, 200),
        score: c.score
      }));
    } catch (error) {
      logger.error('Error fetching top comments:', error);
      return [];
    }
  }

  /**
   * Post a comment to Reddit
   */
  async postComment(accountId, postId, commentText) {
    try {
      const client = await this.getClient(accountId);
      const post = await ScannedPost.findByPk(postId);
      
      if (!post) {
        throw new Error('Post not found');
      }

      const submission = await client.getSubmission(post.redditPostId);
      const comment = await submission.reply(commentText);

      logger.info(`Comment posted to r/${post.subreddit}: ${comment.id}`);
      
      return {
        success: true,
        commentId: comment.id,
        permalink: `https://reddit.com${comment.permalink}`
      };

    } catch (error) {
      logger.error('Error posting comment:', error);
      throw error;
    }
  }

  /**
   * Check if a comment still exists (not removed)
   */
  async checkCommentStatus(accountId, commentId) {
    try {
      const client = await this.getClient(accountId);
      const comment = await client.getComment(commentId);
      
      return {
        exists: true,
        upvotes: comment.ups,
        downvotes: comment.downs,
        score: comment.score,
        isRemoved: comment.removed || comment.spam
      };
    } catch (error) {
      return { exists: false, isRemoved: true };
    }
  }

  /**
   * Search for subreddits based on query
   */
  async searchSubreddits(query, limit = 10) {
    try {
      const client = await this.getClient(1);
      const results = await client.searchSubreddits({ query, limit });
      
      return results.map(sub => ({
        name: sub.display_name,
        subscribers: sub.subscribers,
        description: sub.public_description,
        url: `https://reddit.com/r/${sub.display_name}`
      }));
    } catch (error) {
      logger.error('Error searching subreddits:', error);
      return [];
    }
  }

  /**
   * Upvote a post or comment (for building karma)
   */
  async upvote(accountId, thingId) {
    try {
      const client = await this.getClient(accountId);
      await client.getSubmission(thingId).upvote();
      
      await ActionLog.create({
        accountId,
        actionType: 'upvote_given',
        details: { thingId },
        success: true
      });
      
      return { success: true };
    } catch (error) {
      logger.error('Error upvoting:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new RedditService();
