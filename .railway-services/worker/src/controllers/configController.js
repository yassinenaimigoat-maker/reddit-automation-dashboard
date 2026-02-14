const { Config } = require('../../models');
const aiService = require('../../services/aiService');
const logger = require('../../utils/logger');

exports.getConfig = async (req, res) => {
  try {
    let config = await Config.findOne();
    
    if (!config) {
      // Create default config
      config = await Config.create({});
    }

    // Don't send API keys to frontend
    const safeConfig = config.toJSON();
    safeConfig.openaiApiKey = config.openaiApiKey ? '***' : null;
    safeConfig.anthropicApiKey = config.anthropicApiKey ? '***' : null;

    res.json(safeConfig);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateConfig = async (req, res) => {
  try {
    let config = await Config.findOne();
    
    if (!config) {
      config = await Config.create(req.body);
    } else {
      // Only update provided fields
      const updates = { ...req.body };
      
      // If API key is '***', don't update it (means frontend didn't change it)
      if (updates.openaiApiKey === '***') delete updates.openaiApiKey;
      if (updates.anthropicApiKey === '***') delete updates.anthropicApiKey;
      
      await config.update(updates);
    }

    // Reinitialize AI service with new keys
    await aiService.initialize();

    logger.info('Configuration updated');

    const safeConfig = config.toJSON();
    safeConfig.openaiApiKey = config.openaiApiKey ? '***' : null;
    safeConfig.anthropicApiKey = config.anthropicApiKey ? '***' : null;

    res.json(safeConfig);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.toggleAutomation = async (req, res) => {
  try {
    const config = await Config.findOne();
    await config.update({ isActive: !config.isActive });
    
    logger.info(`Automation ${config.isActive ? 'started' : 'stopped'}`);
    
    res.json({ isActive: config.isActive });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
