const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');
const logger = require('../utils/logger');
const { Config } = require('../models');

class AIService {
  constructor() {
    this.openaiClient = null;
    this.anthropicClient = null;
  }

  /**
   * Initialize AI clients from config
   */
  async initialize() {
    const config = await Config.findOne();
    if (!config) {
      logger.warn('No config found, AI service not initialized');
      return;
    }

    if (config.openaiApiKey) {
      this.openaiClient = new OpenAI({
        apiKey: config.openaiApiKey
      });
      logger.info('OpenAI client initialized');
    }

    if (config.anthropicApiKey) {
      this.anthropicClient = new Anthropic({
        apiKey: config.anthropicApiKey
      });
      logger.info('Anthropic client initialized');
    }
  }

  /**
   * Generate a comment using AI
   */
  async generateComment(postData, config, isPromotional = false) {
    try {
      const prompt = this.buildPrompt(postData, config, isPromotional);
      
      let commentText;
      
      if (config.aiProvider === 'openai' && this.openaiClient) {
        commentText = await this.generateWithOpenAI(prompt, config.aiModel);
      } else if (config.aiProvider === 'anthropic' && this.anthropicClient) {
        commentText = await this.generateWithAnthropic(prompt);
      } else {
        throw new Error('No AI client available');
      }

      return {
        success: true,
        comment: commentText,
        isPromotional,
        model: config.aiProvider
      };

    } catch (error) {
      logger.error('Error generating comment:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Build the prompt for AI
   */
  buildPrompt(postData, config, isPromotional) {
    const { post, subreddit } = postData;
    
    let prompt = `You are a helpful Reddit user. You are NOT a marketer. You genuinely help people.

SUBREDDIT: r/${subreddit.name}
SUBREDDIT RULES: ${subreddit.rules || 'Be respectful and helpful'}
${subreddit.toneNotes ? `TONE NOTES: ${subreddit.toneNotes}` : ''}

POST TITLE: ${post.title}
POST BODY: ${post.body || 'No additional text'}
EXISTING COMMENTS: ${this.formatTopComments(post.topComments)}

`;

    if (isPromotional && config.productName) {
      prompt += `MY TOOL: ${config.productName} - ${config.productDescription}
TOOL URL: ${config.productUrl}
${config.productContext ? `\nDETAILED CONTEXT:\n${config.productContext}\n` : ''}

INSTRUCTIONS:
- Write a genuinely helpful comment that answers the user's question or adds value to the discussion
- Naturally mention ${config.productName} ONLY if it's truly relevant - do NOT force it
- Never say "check out" or "you should try" or sound like an ad
- Match the subreddit's tone and culture
- Keep it concise (2-4 sentences usually, unless detailed help is needed)
- Use casual Reddit language, not corporate speak
- Occasionally use Reddit mannerisms (e.g., "honestly", "FWIW", "I've been using...")
- Frame it as personal experience: "I ran into this same issue and ended up using..."
- NEVER use emojis excessively
- Vary your comment structure - don't always follow the same pattern
`;
    } else {
      prompt += `INSTRUCTIONS:
- Write a genuinely helpful comment that answers the user's question or adds value to the discussion
- DO NOT mention any products or tools - just be helpful to build karma and credibility
- Match the subreddit's tone and culture
- Keep it concise and natural
- Use casual Reddit language
- Be authentic and conversational
`;
    }

    prompt += `\nWrite ONLY the comment text, nothing else. Do not include greetings like "Hi" or "Hey there".`;

    return prompt;
  }

  /**
   * Format top comments for context
   */
  formatTopComments(topComments) {
    if (!topComments || topComments.length === 0) {
      return 'No comments yet';
    }
    
    return topComments.map((c, i) => 
      `${i + 1}. u/${c.author} (${c.score} points): ${c.body}`
    ).join('\n');
  }

  /**
   * Generate comment using OpenAI
   */
  async generateWithOpenAI(prompt, model = 'gpt-4-turbo-preview') {
    const response = await this.openaiClient.chat.completions.create({
      model: model,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful Reddit user who provides genuine value. You never sound like a marketer or advertiser.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8, // More creative
      max_tokens: 300
    });

    return response.choices[0].message.content.trim();
  }

  /**
   * Generate comment using Anthropic Claude
   */
  async generateWithAnthropic(prompt) {
    const response = await this.anthropicClient.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 300,
      temperature: 0.8,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    return response.content[0].text.trim();
  }

  /**
   * Check if AI is properly configured
   */
  async isConfigured() {
    const config = await Config.findOne();
    if (!config) return false;
    
    if (config.aiProvider === 'openai') {
      return !!config.openaiApiKey && !!this.openaiClient;
    } else if (config.aiProvider === 'anthropic') {
      return !!config.anthropicApiKey && !!this.anthropicClient;
    }
    
    return false;
  }
}

module.exports = new AIService();
