// ================================================================================
// REAL PIPELINE AI SERVICE - FUNCTIONAL AI CAPABILITIES
// ================================================================================
// Purpose: Production-ready AI service with actual OpenAI integration
// Features: Real AI-powered lead scoring, sentiment analysis, next-best-action,
//           conversation intelligence, and predictive analytics
// Author: Claude Code - REAL Implementation
// ================================================================================

const { db } = require('../lib/firebase.node.cjs');
const {
  collection,
  doc,
  updateDoc,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  limit
} = require('firebase/firestore');

// ================================================================================
// CONFIGURATION
// ================================================================================

const OPENAI_API_KEY = process.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Model configuration
const AI_MODELS = {
  fast: 'gpt-4o-mini',      // Fast, cost-effective for simple tasks
  powerful: 'gpt-4o',        // More powerful for complex analysis
};

// ================================================================================
// CORE AI SERVICE CLASS
// ================================================================================

class RealPipelineAIService {
  constructor() {
    this.apiKey = OPENAI_API_KEY;
    this.requestCache = new Map(); // Simple caching to reduce API calls
    this.rateLimitDelay = 100; // ms between requests
    this.lastRequestTime = 0;
  }

  // ================================================================================
  // CORE API METHODS
  // ================================================================================

  /**
   * Make OpenAI API call with error handling and rate limiting
   */
  async callOpenAI(messages, options = {}) {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured. Please set VITE_OPENAI_API_KEY in .env');
    }

    // Simple rate limiting
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.rateLimitDelay) {
      await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay - timeSinceLastRequest));
    }

    const model = options.model || AI_MODELS.fast;
    const temperature = options.temperature || 0.7;
    const maxTokens = options.maxTokens || 500;

    try {
      this.lastRequestTime = Date.now();

      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI API Error: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API call failed:', error);
      throw error;
    }
  }

  /**
   * Parse JSON response from OpenAI with error handling
   */
  async callOpenAIJSON(messages, options = {}) {
    const response = await this.callOpenAI(messages, options);
    try {
      // Try to extract JSON if it's wrapped in markdown code blocks
      const jsonMatch = response.match(/```json\n?([\s\S]*?)\n?```/) || response.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : response;
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Failed to parse OpenAI JSON response:', response);
      throw new Error('Failed to parse AI response as JSON');
    }
  }

  // ================================================================================
  // 1. INTELLIGENT LEAD SCORING
  // ================================================================================

  /**
   * AI-powered lead scoring based on conversation data
   * Returns: Score 0-100, reasoning, and recommended actions
   */
  async scoreLeadIntelligently(leadData) {
    const {
      transcript = '',
      caller = '',
      phone = '',
      email = '',
      painPoints = [],
      budget = null,
      timeline = null,
      urgencyLevel = 'unknown',
      companyName = '',
      jobTitle = '',
    } = leadData;

    const prompt = `You are a lead scoring expert for a credit repair CRM. Analyze this lead and provide a detailed scoring.

Lead Information:
- Caller: ${caller}
- Phone: ${phone}
- Email: ${email}
- Company: ${companyName}
- Job Title: ${jobTitle}
- Pain Points: ${painPoints.join(', ')}
- Budget: ${budget || 'Not mentioned'}
- Timeline: ${timeline || 'Not mentioned'}
- Urgency: ${urgencyLevel}

Conversation Transcript:
${transcript || 'No transcript available'}

Provide your analysis in JSON format:
{
  "leadScore": <number 0-100>,
  "scoreBreakdown": {
    "qualification": <number 0-25>,
    "engagement": <number 0-25>,
    "urgency": <number 0-25>,
    "fit": <number 0-25>
  },
  "reasoning": "<brief explanation>",
  "strongSignals": ["<signal 1>", "<signal 2>"],
  "concerns": ["<concern 1>", "<concern 2>"],
  "recommendedActions": ["<action 1>", "<action 2>"],
  "estimatedCloseTime": "<timeframe>",
  "confidence": <number 0-100>
}`;

    try {
      const result = await this.callOpenAIJSON([
        { role: 'system', content: 'You are a lead scoring expert. Always respond with valid JSON.' },
        { role: 'user', content: prompt },
      ], { temperature: 0.3, maxTokens: 800 });

      // Track usage
      await this.trackAIUsage('lead_scoring', leadData.phone || leadData.email);

      return result;
    } catch (error) {
      console.error('Lead scoring failed:', error);
      // Return fallback scoring
      return this.fallbackLeadScore(leadData);
    }
  }

  /**
   * Fallback lead scoring using rule-based logic
   */
  fallbackLeadScore(leadData) {
    let score = 50; // Base score

    if (leadData.email) score += 10;
    if (leadData.phone) score += 10;
    if (leadData.painPoints?.length > 0) score += 15;
    if (leadData.urgencyLevel === 'high') score += 15;
    if (leadData.budget) score += 10;

    return {
      leadScore: Math.min(score, 100),
      scoreBreakdown: {
        qualification: 15,
        engagement: 15,
        urgency: leadData.urgencyLevel === 'high' ? 20 : 10,
        fit: 10,
      },
      reasoning: 'Fallback scoring used due to AI unavailability',
      strongSignals: leadData.painPoints || [],
      concerns: ['AI scoring unavailable'],
      recommendedActions: ['Contact lead', 'Qualify further'],
      estimatedCloseTime: '7-14 days',
      confidence: 60,
    };
  }

  // ================================================================================
  // 2. SENTIMENT ANALYSIS
  // ================================================================================

  /**
   * Analyze sentiment and emotional state from conversation
   */
  async analyzeSentiment(text, context = {}) {
    if (!text || text.length < 10) {
      return { sentiment: 'neutral', confidence: 0, emotions: [] };
    }

    const prompt = `Analyze the sentiment and emotional state in this conversation:

Text: "${text}"

Context: ${JSON.stringify(context)}

Provide analysis in JSON:
{
  "sentiment": "<positive|negative|neutral|mixed>",
  "confidence": <0-100>,
  "emotions": ["<emotion1>", "<emotion2>"],
  "tone": "<professional|casual|frustrated|excited|concerned>",
  "keyPhrases": ["<phrase1>", "<phrase2>"],
  "recommendedResponse": "<how to respond>",
  "concerns": ["<any concerns detected>"]
}`;

    try {
      const result = await this.callOpenAIJSON([
        { role: 'system', content: 'You are a sentiment analysis expert. Respond with valid JSON.' },
        { role: 'user', content: prompt },
      ], { temperature: 0.2, maxTokens: 500 });

      await this.trackAIUsage('sentiment_analysis', context.contactId);
      return result;
    } catch (error) {
      console.error('Sentiment analysis failed:', error);
      return {
        sentiment: 'neutral',
        confidence: 0,
        emotions: [],
        tone: 'unknown',
        keyPhrases: [],
        recommendedResponse: 'Respond professionally and ask clarifying questions',
        concerns: ['AI analysis unavailable'],
      };
    }
  }

  // ================================================================================
  // 3. NEXT BEST ACTION RECOMMENDATION
  // ================================================================================

  /**
   * AI-powered next best action based on contact history and context
   */
  async suggestNextAction(contact, recentInteractions = []) {
    const contactSummary = {
      name: contact.name,
      status: contact.status,
      stage: contact.stage,
      leadScore: contact.leadScore,
      lastContact: contact.lastContact,
      daysSinceContact: contact.lastContact
        ? Math.floor((Date.now() - contact.lastContact.toDate()) / (1000 * 60 * 60 * 24))
        : 999,
      totalInteractions: recentInteractions.length,
      completedActions: contact.completedActions || [],
      painPoints: contact.painPoints || [],
      budget: contact.budget,
    };

    const prompt = `As a CRM strategy expert, recommend the best next action for this contact:

Contact Summary:
${JSON.stringify(contactSummary, null, 2)}

Recent Interactions (last 5):
${recentInteractions.slice(-5).map(i => `- ${i.type}: ${i.summary || i.notes}`).join('\n')}

Recommend the optimal next action in JSON:
{
  "action": "<specific action to take>",
  "priority": "<critical|high|medium|low>",
  "timing": "<when to do it>",
  "channel": "<email|phone|sms|meeting>",
  "reasoning": "<why this action>",
  "messageTemplate": "<draft message>",
  "expectedOutcome": "<what to expect>",
  "alternatives": ["<alternative 1>", "<alternative 2>"]
}`;

    try {
      const result = await this.callOpenAIJSON([
        { role: 'system', content: 'You are a CRM strategy expert for credit repair services. Respond with valid JSON.' },
        { role: 'user', content: prompt },
      ], { temperature: 0.4, maxTokens: 700 });

      await this.trackAIUsage('next_best_action', contact.id);
      return result;
    } catch (error) {
      console.error('Next action suggestion failed:', error);
      return this.fallbackNextAction(contactSummary);
    }
  }

  /**
   * Fallback next action using rules
   */
  fallbackNextAction(contactSummary) {
    const { daysSinceContact, leadScore, stage } = contactSummary;

    if (daysSinceContact > 14) {
      return {
        action: 'Re-engagement call',
        priority: 'high',
        timing: 'within 24 hours',
        channel: 'phone',
        reasoning: 'No contact in over 2 weeks',
        messageTemplate: 'Hi, checking in to see how we can help with your credit goals',
        expectedOutcome: 'Re-establish connection',
        alternatives: ['Send re-engagement email', 'Send SMS check-in'],
      };
    }

    if (leadScore >= 8) {
      return {
        action: 'Schedule consultation',
        priority: 'critical',
        timing: 'immediate',
        channel: 'phone',
        reasoning: 'High-quality lead ready for conversion',
        messageTemplate: 'Based on our conversation, I\'d like to schedule a consultation to review your credit report',
        expectedOutcome: 'Book appointment',
        alternatives: ['Send pricing proposal', 'Offer free credit analysis'],
      };
    }

    return {
      action: 'Send educational content',
      priority: 'medium',
      timing: 'within 48 hours',
      channel: 'email',
      reasoning: 'Continue nurturing relationship',
      messageTemplate: 'I thought you might find this helpful...',
      expectedOutcome: 'Increase engagement',
      alternatives: ['Schedule follow-up call', 'Send case study'],
    };
  }

  // ================================================================================
  // 4. CONVERSATION INTELLIGENCE
  // ================================================================================

  /**
   * Extract key insights from conversation transcripts
   */
  async analyzeConversation(transcript, metadata = {}) {
    if (!transcript || transcript.length < 50) {
      return { summary: 'Insufficient conversation data', insights: [] };
    }

    const prompt = `Analyze this sales conversation for a credit repair service:

Conversation:
${transcript}

Metadata: ${JSON.stringify(metadata)}

Extract key insights in JSON:
{
  "summary": "<2-3 sentence summary>",
  "painPoints": ["<pain point 1>", "<pain point 2>"],
  "objections": ["<objection 1>", "<objection 2>"],
  "buyingSignals": ["<signal 1>", "<signal 2>"],
  "questionsAsked": ["<question 1>", "<question 2>"],
  "commitmentsMade": ["<commitment 1>"],
  "nextSteps": ["<step 1>", "<step 2>"],
  "competitorsmentioned": ["<competitor 1>"],
  "budget": "<mentioned budget or 'not discussed'>",
  "timeline": "<mentioned timeline or 'not discussed'>",
  "decisionMakers": ["<name/role>"],
  "coachingTips": ["<tip for rep 1>", "<tip 2>"]
}`;

    try {
      const result = await this.callOpenAIJSON([
        { role: 'system', content: 'You are a conversation intelligence expert. Respond with valid JSON.' },
        { role: 'user', content: prompt },
      ], {
        temperature: 0.3,
        maxTokens: 1000,
        model: AI_MODELS.powerful // Use more powerful model for complex analysis
      });

      await this.trackAIUsage('conversation_analysis', metadata.contactId);
      return result;
    } catch (error) {
      console.error('Conversation analysis failed:', error);
      return {
        summary: 'AI analysis unavailable',
        painPoints: [],
        objections: [],
        buyingSignals: [],
        questionsAsked: [],
        commitmentsMade: [],
        nextSteps: ['Follow up with contact'],
        competitors: [],
        budget: 'not discussed',
        timeline: 'not discussed',
        decisionMakers: [],
        coachingTips: ['Review conversation manually'],
      };
    }
  }

  // ================================================================================
  // 5. PREDICTIVE ANALYTICS
  // ================================================================================

  /**
   * Predict likelihood of conversion and churn risk
   */
  async predictOutcomes(contact, historicalData = []) {
    const contactProfile = {
      leadScore: contact.leadScore || 0,
      engagementScore: contact.engagementScore || 0,
      daysSinceFirstContact: contact.createdAt
        ? Math.floor((Date.now() - contact.createdAt.toDate()) / (1000 * 60 * 60 * 24))
        : 0,
      interactionCount: historicalData.length,
      lastInteractionDays: contact.lastContact
        ? Math.floor((Date.now() - contact.lastContact.toDate()) / (1000 * 60 * 60 * 24))
        : 999,
      responseRate: contact.responseRate || 0,
      status: contact.status,
      stage: contact.stage,
    };

    const prompt = `Analyze this contact and predict conversion likelihood and churn risk:

Contact Profile:
${JSON.stringify(contactProfile, null, 2)}

Historical Interactions: ${historicalData.length} total
Recent Activity: ${historicalData.slice(-5).map(h => h.type).join(', ')}

Provide predictions in JSON:
{
  "conversionProbability": <0-100>,
  "churnRisk": <0-100>,
  "estimatedCloseDate": "<date range>",
  "projectedLifetimeValue": <number>,
  "riskFactors": ["<risk 1>", "<risk 2>"],
  "growthOpportunities": ["<opportunity 1>"],
  "recommendedInterventions": ["<intervention 1>"],
  "confidence": <0-100>,
  "reasoning": "<explanation>"
}`;

    try {
      const result = await this.callOpenAIJSON([
        { role: 'system', content: 'You are a predictive analytics expert. Respond with valid JSON.' },
        { role: 'user', content: prompt },
      ], { temperature: 0.2, maxTokens: 600 });

      await this.trackAIUsage('predictive_analytics', contact.id);
      return result;
    } catch (error) {
      console.error('Predictive analytics failed:', error);
      return this.fallbackPrediction(contactProfile);
    }
  }

  /**
   * Fallback predictions using rule-based logic
   */
  fallbackPrediction(profile) {
    const { leadScore, lastInteractionDays, interactionCount } = profile;

    let conversionProbability = leadScore;
    if (lastInteractionDays > 30) conversionProbability -= 20;
    if (interactionCount > 5) conversionProbability += 10;

    const churnRisk = lastInteractionDays > 30 ? 70 : lastInteractionDays > 14 ? 40 : 10;

    return {
      conversionProbability: Math.max(0, Math.min(100, conversionProbability)),
      churnRisk,
      estimatedCloseDate: conversionProbability > 70 ? '7-14 days' : '30-60 days',
      projectedLifetimeValue: leadScore > 7 ? 1200 : 800,
      riskFactors: lastInteractionDays > 14 ? ['Infrequent contact'] : [],
      growthOpportunities: ['Upsell premium services'],
      recommendedInterventions: churnRisk > 50 ? ['Immediate outreach required'] : ['Continue nurturing'],
      confidence: 60,
      reasoning: 'Rule-based prediction (AI unavailable)',
    };
  }

  // ================================================================================
  // 6. EMAIL GENERATION
  // ================================================================================

  /**
   * Generate personalized email based on context
   */
  async generateEmail(contact, purpose, context = {}) {
    const prompt = `Generate a professional, personalized email for a credit repair service:

Recipient: ${contact.name}
Purpose: ${purpose}
Lead Score: ${contact.leadScore || 'Unknown'}
Stage: ${contact.stage || 'New'}
Pain Points: ${(contact.painPoints || []).join(', ')}
Additional Context: ${JSON.stringify(context)}

Generate email in JSON:
{
  "subject": "<compelling subject line>",
  "body": "<email body with proper formatting>",
  "callToAction": "<clear CTA>",
  "tone": "<professional|friendly|urgent>",
  "alternatives": {
    "subject2": "<alternative subject>",
    "subject3": "<another alternative>"
  }
}

Keep it conversational, authentic, and focused on their specific needs.`;

    try {
      const result = await this.callOpenAIJSON([
        {
          role: 'system',
          content: 'You are an expert email copywriter for credit repair services. Write compelling, personalized emails that convert. Respond with valid JSON.',
        },
        { role: 'user', content: prompt },
      ], { temperature: 0.7, maxTokens: 800 });

      await this.trackAIUsage('email_generation', contact.id);
      return result;
    } catch (error) {
      console.error('Email generation failed:', error);
      return {
        subject: `Following up, ${contact.name}`,
        body: `Hi ${contact.name},\n\nI wanted to follow up on our recent conversation about improving your credit.\n\nWould you be available for a quick call this week to discuss next steps?\n\nBest regards,\nYour Credit Repair Team`,
        callToAction: 'Schedule a call',
        tone: 'professional',
        alternatives: {
          subject2: `Quick question, ${contact.name}`,
          subject3: `Your credit improvement plan`,
        },
      };
    }
  }

  // ================================================================================
  // 7. OBJECTION HANDLING
  // ================================================================================

  /**
   * Generate responses to common objections
   */
  async handleObjection(objection, contactContext = {}) {
    const prompt = `A prospect raised this objection about credit repair services:

Objection: "${objection}"

Contact Context:
- Lead Score: ${contactContext.leadScore || 'Unknown'}
- Budget Mentioned: ${contactContext.budget || 'No'}
- Main Concerns: ${(contactContext.concerns || []).join(', ')}

Provide objection handling response in JSON:
{
  "objectionType": "<price|trust|timing|need|competition>",
  "response": "<empathetic, strategic response>",
  "followUpQuestions": ["<question 1>", "<question 2>"],
  "proofPoints": ["<social proof or data>"],
  "alternativeOffers": ["<option 1>"],
  "redFlags": ["<any concerns>"]
}`;

    try {
      const result = await this.callOpenAIJSON([
        { role: 'system', content: 'You are a sales objection handling expert for credit repair. Respond with valid JSON.' },
        { role: 'user', content: prompt },
      ], { temperature: 0.5, maxTokens: 600 });

      await this.trackAIUsage('objection_handling', contactContext.contactId);
      return result;
    } catch (error) {
      console.error('Objection handling failed:', error);
      return {
        objectionType: 'unknown',
        response: 'I understand your concern. Can you tell me more about what\'s holding you back?',
        followUpQuestions: ['What specific concerns do you have?', 'What would make you feel comfortable moving forward?'],
        proofPoints: ['We have helped over 10,000 clients improve their credit'],
        alternativeOffers: ['Start with a free credit analysis'],
        redFlags: [],
      };
    }
  }

  // ================================================================================
  // 8. BATCH OPERATIONS
  // ================================================================================

  /**
   * Score multiple leads efficiently
   */
  async batchScoreLeads(leads) {
    const results = [];
    for (const lead of leads) {
      try {
        const score = await this.scoreLeadIntelligently(lead);
        results.push({ leadId: lead.id, score, error: null });
        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay));
      } catch (error) {
        results.push({ leadId: lead.id, score: null, error: error.message });
      }
    }
    return results;
  }

  // ================================================================================
  // UTILITY METHODS
  // ================================================================================

  /**
   * Track AI feature usage for analytics and billing
   */
  async trackAIUsage(feature, contactId, metadata = {}) {
    try {
      await addDoc(collection(db, 'aiUsageTracking'), {
        feature,
        contactId,
        metadata,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error('Failed to track AI usage:', error);
    }
  }

  /**
   * Get AI usage statistics
   */
  async getUsageStats(startDate, endDate) {
    try {
      const q = query(
        collection(db, 'aiUsageTracking'),
        where('timestamp', '>=', startDate),
        where('timestamp', '<=', endDate)
      );

      const snapshot = await getDocs(q);
      const stats = {
        total: snapshot.size,
        byFeature: {},
      };

      snapshot.forEach(doc => {
        const data = doc.data();
        stats.byFeature[data.feature] = (stats.byFeature[data.feature] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Failed to get usage stats:', error);
      return { total: 0, byFeature: {} };
    }
  }

  /**
   * Check if API key is configured
   */
  isConfigured() {
    return !!this.apiKey && this.apiKey !== 'undefined';
  }

  /**
   * Health check
   */
  async healthCheck() {
    if (!this.isConfigured()) {
      return {
        status: 'error',
        message: 'OpenAI API key not configured',
        configured: false,
      };
    }

    try {
      await this.callOpenAI([
        { role: 'user', content: 'Say "OK" if you can read this.' },
      ], { maxTokens: 10 });

      return {
        status: 'healthy',
        message: 'AI service is operational',
        configured: true,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
        configured: true,
      };
    }
  }
}

// ================================================================================
// EXPORT SINGLETON INSTANCE
// ================================================================================

const realPipelineAI = new RealPipelineAIService();
module.exports = realPipelineAI;
