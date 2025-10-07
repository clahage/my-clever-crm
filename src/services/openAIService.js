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

  async categorizeContact(contact) {
    try {
      if (!this.apiKey) {
        console.warn('No OpenAI API key configured');
        throw new Error('No OpenAI API key');
      }
      
      const prompt = `Given the following contact details, categorize as one of: lead, client, vendor, affiliate. Also provide a heat score (1-10), urgency (Low/Medium/High), and suggest the next best move.\nContact: ${JSON.stringify(contact)}`;
      
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are a CRM contact categorization and sales expert.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 200
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return JSON.parse(data.choices[0].message.content);
    } catch (err) {
      console.error('Categorization error', err);
      return { 
        category: 'lead', 
        heatScore: 5, 
        urgency: 'Medium', 
        nextMove: 'Follow up within 3 days.' 
      };
    }
  }
}

export default new OpenAIService();