import aiService from '@/services/aiService';

class OpenAIService {
  async generateResponse(message, platform, context = {}) {
    if (aiService?.complete) {
      const res = await aiService.complete({ messages: [{ role: 'user', content: message }], ...context });
      return { success: true, response: res.response || res, model: res.model || 'aiService' };
    }
    console.warn('aiService.complete not available - returning fallback');
    return this.getFallbackResponse(platform);
  }

  buildPrompt(message, platform, context) {
    return `A potential customer sent this message via ${platform}:
"${message}"

Generate a helpful, professional response that:
1. Acknowledges their message
2. Provides relevant information about credit repair
3. Invites them to learn more or schedule a consultation
Keep the response under 100 words.`;
  }

  getFallbackResponse(platform) {
    return {
      success: false,
      response: `Thank you for contacting Speedy Credit Repair via ${platform}. A team member will respond to your inquiry shortly. For immediate assistance, please call us at 1-800-SPEEDY-1.`,
      model: 'fallback'
    };
  }

  async analyzeReviewSentiment(reviewText, rating) {
    if (aiService?.complete) {
      const res = await aiService.complete({ messages: [{ role: 'user', content: `Analyze sentiment: ${reviewText}` }] });
      try {
        return JSON.parse(res.response || res);
      } catch {
        return { sentiment: 'neutral', urgency: rating < 3 ? 'high' : 'normal' };
      }
    }
    return { sentiment: 'neutral', urgency: rating < 3 ? 'high' : 'normal' };
  }

  async categorizeContact(contact) {
    if (aiService?.complete) {
      const res = await aiService.complete({ messages: [{ role: 'user', content: `Categorize contact: ${JSON.stringify(contact)}` }] });
      try {
        return JSON.parse(res.response || res);
      } catch {
        return { category: 'lead', heatScore: 5, urgency: 'Medium', nextMove: 'Follow up within 3 days.' };
      }
    }
    return { category: 'lead', heatScore: 5, urgency: 'Medium', nextMove: 'Follow up within 3 days.' };
  }
}

export default new OpenAIService();