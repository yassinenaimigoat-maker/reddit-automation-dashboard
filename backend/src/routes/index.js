const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

// Controllers
const authController = require('../controllers/authController');
const configController = require('../controllers/configController');
const accountController = require('../controllers/accountController');
const subredditController = require('../controllers/subredditController');
const queueController = require('../controllers/queueController');
const commentController = require('../controllers/commentController');
const analyticsController = require('../controllers/analyticsController');

// Public routes
router.post('/auth/login', authController.login);

// Protected routes (all require authentication)
router.use(authMiddleware);

// Auth
router.get('/auth/verify', authController.verify);

// Configuration
router.get('/config', configController.getConfig);
router.put('/config', configController.updateConfig);
router.post('/config/toggle', configController.toggleAutomation);

// Accounts
router.get('/accounts', accountController.getAllAccounts);
router.post('/accounts', accountController.createAccount);
router.put('/accounts/:id', accountController.updateAccount);
router.delete('/accounts/:id', accountController.deleteAccount);
router.post('/accounts/:id/test', accountController.testAccount);

// Subreddits
router.get('/subreddits', subredditController.getAllSubreddits);
router.post('/subreddits', subredditController.createSubreddit);
router.put('/subreddits/:id', subredditController.updateSubreddit);
router.delete('/subreddits/:id', subredditController.deleteSubreddit);
router.get('/subreddits/search', subredditController.searchSubreddits);
router.post('/subreddits/:id/scan', subredditController.scanSubreddit);
router.get('/subreddits/:id/stats', subredditController.getSubredditStats);

// Queue
router.get('/queue', queueController.getQueue);
router.post('/queue/:postId/generate', queueController.generateComment);
router.post('/queue/approve', queueController.approveComment);
router.post('/queue/:postId/skip', queueController.skipPost);
router.post('/queue/bulk-approve', queueController.bulkApprove);
router.post('/queue/bulk-reject', queueController.bulkReject);

// Comments
router.get('/comments', commentController.getAllComments);
router.post('/comments/:id/post', commentController.postComment);
router.put('/comments/:id', commentController.updateComment);
router.delete('/comments/:id', commentController.deleteComment);
router.get('/comments/:id/status', commentController.checkCommentStatus);

// Analytics
router.get('/analytics/dashboard', analyticsController.getDashboardStats);
router.get('/analytics/activity', analyticsController.getActivityTimeline);
router.get('/analytics/subreddits', analyticsController.getSubredditPerformance);
router.get('/analytics/logs', analyticsController.getRecentActivity);
router.get('/analytics/karma', analyticsController.getKarmaOverTime);

module.exports = router;
