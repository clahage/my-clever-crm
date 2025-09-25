const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

class OpenAIService {
  constructor() {
    this.apiKey = OPENAI_API_KEY;
    this.apiUrl = 'https://api.openai.com/v1/chat/completions';
  }

  async generateResponse(message, platform, context = {}) {
    if (!this.apiKey) {
      console.error('OpenAI API key not configured');
      return this.getFallbackResponse(platform);
    }

    try {
      const prompt = this.buildPrompt(message, platform, context);
      
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful customer service representative for Speedy Credit Repair. Be professional, empathetic, and informative about credit repair services.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 150
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        response: data.choices[0].message.content,
        model: 'gpt-3.5-turbo'
      };
    } catch (error) {
      console.error('OpenAI generation error:', error);
      return this.getFallbackResponse(platform);
    }
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
    if (!this.apiKey) return { sentiment: 'neutral', urgency: 'normal' };

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'Analyze the sentiment and urgency of this customer review.'
            },
            {
              role: 'user',
              content: `Review (${rating}/5 stars): "${reviewText}"

Respond with JSON: {"sentiment": "positive/neutral/negative", "urgency": "low/normal/high", "key_issues": []}`
            }
          ],
          temperature: 0.3,
          max_tokens: 100
        })
      });

      const data = await response.json();
      return JSON.parse(data.choices[0].message.content);
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      return { sentiment: 'neutral', urgency: rating < 3 ? 'high' : 'normal' };
    }
  }
}

export default new OpenAIService();