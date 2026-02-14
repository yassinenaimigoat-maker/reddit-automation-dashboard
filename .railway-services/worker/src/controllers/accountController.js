const { Account, Comment, ActionLog } = require('../../models');
const redditService = require('../../services/redditService');
const logger = require('../../utils/logger');

exports.getAllAccounts = async (req, res) => {
  try {
    const accounts = await Account.findAll({
      attributes: { exclude: ['clientId', 'clientSecret', 'password'] },
      order: [['createdAt', 'DESC']]
    });
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createAccount = async (req, res) => {
  try {
    const { username, clientId, clientSecret, password, userAgent } = req.body;

    const account = await Account.create({
      username,
      clientId,
      clientSecret,
      password,
      userAgent: userAgent || 'RedditAutomation/1.0.0'
    });

    // Test credentials
    const test = await redditService.testCredentials(account.id);

    if (test.success) {
      await account.update({
        karma: test.karma,
        accountAge: test.accountAge,
        status: 'active'
      });

      logger.info(`Account created: ${username}`);
      
      const safeAccount = account.toJSON();
      delete safeAccount.clientId;
      delete safeAccount.clientSecret;
      delete safeAccount.password;

      res.status(201).json(safeAccount);
    } else {
      await account.destroy();
      res.status(400).json({ message: 'Invalid Reddit credentials: ' + test.error });
    }

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateAccount = async (req, res) => {
  try {
    const account = await Account.findByPk(req.params.id);
    
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    await account.update(req.body);

    const safeAccount = account.toJSON();
    delete safeAccount.clientId;
    delete safeAccount.clientSecret;
    delete safeAccount.password;

    res.json(safeAccount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const account = await Account.findByPk(req.params.id);
    
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    await account.destroy();
    logger.info(`Account deleted: ${account.username}`);
    
    res.json({ message: 'Account deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.testAccount = async (req, res) => {
  try {
    const result = await redditService.testCredentials(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
