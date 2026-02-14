const logger = require('./logger');

/**
 * Anti-Ban System - Critical for avoiding Reddit detection
 * Implements human-like behavior patterns
 */

class AntiBanSystem {
  constructor() {
    this.accountActivity = new Map(); // Track per-account activity
    this.subredditCooldowns = new Map(); // Track per-subreddit cooldowns
  }

  /**
   * Calculate random delay with jitter (never exact intervals)
   */
  getRandomDelay(minMinutes = 3, maxMinutes = 15) {
    const min = minMinutes * 60 * 1000;
    const max = maxMinutes * 60 * 1000;
    const jitter = Math.random() * 0.3; // Add 30% randomness
    const baseDelay = Math.random() * (max - min) + min;
    return Math.floor(baseDelay * (1 + jitter));
  }

  /**
   * Check if account is within rate limits
   */
  canPerformAction(accountId, maxPerHour = 3, maxPerDay = 15) {
    const now = Date.now();
    const activity = this.accountActivity.get(accountId) || {
      hourly: [],
      daily: []
    };

    // Clean up old timestamps
    const oneHourAgo = now - (60 * 60 * 1000);
    const oneDayAgo = now - (24 * 60 * 60 * 1000);

    activity.hourly = activity.hourly.filter(t => t > oneHourAgo);
    activity.daily = activity.daily.filter(t => t > oneDayAgo);

    // Check limits
    if (activity.hourly.length >= maxPerHour) {
      logger.warn(`Account ${accountId} hit hourly limit (${maxPerHour}/hour)`);
      return { allowed: false, reason: 'hourly_limit' };
    }

    if (activity.daily.length >= maxPerDay) {
      logger.warn(`Account ${accountId} hit daily limit (${maxPerDay}/day)`);
      return { allowed: false, reason: 'daily_limit' };
    }

    return { allowed: true };
  }

  /**
   * Record an action for an account
   */
  recordAction(accountId) {
    const now = Date.now();
    const activity = this.accountActivity.get(accountId) || {
      hourly: [],
      daily: []
    };

    activity.hourly.push(now);
    activity.daily.push(now);
    this.accountActivity.set(accountId, activity);
  }

  /**
   * Check if we're within active hours
   */
  isWithinActiveHours(startHour = 9, endHour = 23) {
    const now = new Date();
    const currentHour = now.getHours();
    return currentHour >= startHour && currentHour < endHour;
  }

  /**
   * Check if today is a rest day
   */
  isRestDay(restDays = [0, 3]) { // Sunday and Wednesday by default
    const today = new Date().getDay();
    return restDays.includes(today);
  }

  /**
   * Check subreddit cooldown (don't spam same subreddit)
   */
  canCommentInSubreddit(subreddit, cooldownMinutes = 60) {
    const lastComment = this.subredditCooldowns.get(subreddit);
    if (!lastComment) return true;

    const cooldownMs = cooldownMinutes * 60 * 1000;
    const timeSince = Date.now() - lastComment;
    
    if (timeSince < cooldownMs) {
      const remainingMinutes = Math.ceil((cooldownMs - timeSince) / 60000);
      logger.info(`Subreddit ${subreddit} on cooldown for ${remainingMinutes} more minutes`);
      return false;
    }

    return true;
  }

  /**
   * Record subreddit comment
   */
  recordSubredditComment(subreddit) {
    this.subredditCooldowns.set(subreddit, Date.now());
  }

  /**
   * Decide if this should be a promotional comment or pure help
   */
  shouldBePromotional(promotionalRatio = 0.3) {
    return Math.random() < promotionalRatio;
  }

  /**
   * Calculate similarity between two texts (to avoid duplicate comments)
   */
  calculateSimilarity(text1, text2) {
    const stringSimilarity = require('string-similarity');
    return stringSimilarity.compareTwoStrings(text1, text2);
  }

  /**
   * Check if comment is too similar to recent comments
   */
  isTooSimilar(newComment, recentComments, threshold = 0.7) {
    for (const recent of recentComments) {
      const similarity = this.calculateSimilarity(newComment, recent);
      if (similarity > threshold) {
        logger.warn(`Comment too similar (${(similarity * 100).toFixed(1)}%) to recent comment`);
        return true;
      }
    }
    return false;
  }

  /**
   * Get recommended wait time before next action
   */
  getRecommendedWaitTime(accountId) {
    const activity = this.accountActivity.get(accountId);
    if (!activity || activity.hourly.length === 0) {
      return this.getRandomDelay(3, 8); // First action, shorter wait
    }

    // More actions = longer wait
    const recentActions = activity.hourly.length;
    const baseMin = Math.min(5 + recentActions * 2, 20);
    const baseMax = Math.min(15 + recentActions * 3, 45);

    return this.getRandomDelay(baseMin, baseMax);
  }

  /**
   * Slow ramp-up: reduce limits for new accounts
   */
  getRampUpLimits(accountAgeInDays) {
    if (accountAgeInDays < 7) {
      return { maxPerDay: 3, maxPerHour: 1 };
    } else if (accountAgeInDays < 14) {
      return { maxPerDay: 8, maxPerHour: 2 };
    } else if (accountAgeInDays < 30) {
      return { maxPerDay: 12, maxPerHour: 3 };
    }
    return { maxPerDay: 15, maxPerHour: 3 };
  }
}

module.exports = new AntiBanSystem();
