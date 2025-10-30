/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ENTERPRISE AI EMAIL SERVICE - SpeedyCRM
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Advanced AI-powered email generation system with:
 * - Multi-model AI support (GPT-4, GPT-3.5-turbo with intelligent fallback)
 * - Deep sentiment analysis and emotional intelligence
 * - Pain point extraction and urgency detection
 * - Personalization engine with dynamic content
 * - A/B testing and optimization
 * - Learning from engagement metrics
 * - Industry-specific terminology and compliance
 * - Template performance tracking
 * - Tone matching and style adaptation
 * - Multi-language support (future)
 * 
 * @author SpeedyCRM Enterprise Team
 * @version 2.0.0
 * @date October 2025
 */

const OpenAI = require('openai');
const { db, admin } = require('./firebaseAdmin');

// Initialize OpenAI with API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CONFIGURATION & CONSTANTS
 * ═══════════════════════════════════════════════════════════════════════════
 */

const AI_CONFIG = {
  models: {
    primary: 'gpt-4-turbo-preview', // Latest GPT-4 for best quality
    fallback: 'gpt-3.5-turbo', // Faster, cheaper fallback
    analysis: 'gpt-4-turbo-preview' // Best for analysis tasks
  },
  
  limits: {
    maxTokens: 2000,
    temperature: 0.7, // Balance creativity and consistency
    topP: 0.9,
    frequencyPenalty: 0.3,
    presencePenalty: 0.3
  },
  
  retries: {
    maxAttempts: 3,
    backoffMs: 1000
  },
  
  caching: {
    enabled: true,
    ttlSeconds: 3600 // 1 hour
  }
};

const TONE_PROFILES = {
  professional: {
    formality: 'high',
    enthusiasm: 'moderate',
    urgency: 'subtle',
    warmth: 'professional'
  },
  
  friendly: {
    formality: 'moderate',
    enthusiasm: 'high',
    urgency: 'moderate',
    warmth: 'high'
  },
  
  urgent: {
    formality: 'moderate',
    enthusiasm: 'high',
    urgency: 'high',
    warmth: 'moderate'
  },
  
  consultative: {
    formality: 'high',
    enthusiasm: 'moderate',
    urgency: 'low',
    warmth: 'high'
  },
  
  empathetic: {
    formality: 'moderate',
    enthusiasm: 'moderate',
    urgency: 'low',
    warmth: 'very high'
  }
};

const CHRIS_VOICE_PROFILE = {
  name: 'Chris Lahage',
  role: 'Owner & Credit Expert',
  experience: '30 years',
  personality: 'Direct, personal, knowledgeable, caring, no-nonsense',
  catchphrases: [
    "I've been doing this for 30 years",
    "Your credit situation is fixable",
    "I personally review every case",
    "You're not just a number here",
    "Let's get this fixed together"
  ],
  communication_style: 'Personal touch from the owner, not corporate speak',
  values: 'Honesty, transparency, results-driven, client success'
};

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MAIN AI EMAIL SERVICE CLASS
 * ═══════════════════════════════════════════════════════════════════════════
 */

class AIEmailService {
  constructor() {
    this.cache = new Map();
    this.performanceMetrics = new Map();
  }

  /**
   * ═══════════════════════════════════════════════════════════════════════
   * PRIMARY EMAIL GENERATION METHODS
   * ═══════════════════════════════════════════════════════════════════════
   */

  /**
   * Generate personalized AI email with full analysis
   * 
   * @param {string} callTranscript - Full call transcript from AI receptionist
   * @param {Object} contactData - Contact information from Firestore
   * @param {string} emailType - Type of email (welcome, follow-up, consultation, etc.)
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Complete email package
   */
  async generateAIEmail(callTranscript, contactData, emailType = 'welcome', options = {}) {
    const startTime = Date.now();
    
    try {
      console.log(`🤖 Generating AI email for ${contactData.email} - Type: ${emailType}`);

      // Step 1: Analyze the call transcript
      const analysis = await this.analyzeCallTranscript(callTranscript, contactData);
      
      // Step 2: Determine optimal tone based on analysis
      const toneProfile = this.determineToneProfile(analysis, emailType);
      
      // Step 3: Generate personalized subject line
      const subject = await this.generateSubjectLine(analysis, emailType, toneProfile);
      
      // Step 4: Generate email body
      const body = await this.generateEmailBody(
        analysis,
        contactData,
        emailType,
        toneProfile,
        options
      );
      
      // Step 5: Generate alternative versions for A/B testing
      const alternatives = await this.generateAlternatives(
        analysis,
        contactData,
        emailType,
        { subject, body }
      );
      
      // Step 6: Calculate performance prediction
      const prediction = this.predictPerformance(analysis, { subject, body }, alternatives);
      
      // Step 7: Save generation data for learning
      await this.saveGenerationData({
        contactId: contactData.id || contactData.contactId,
        emailType,
        analysis,
        subject,
        body,
        alternatives,
        prediction,
        generatedAt: new Date()
      });

      const duration = Date.now() - startTime;
      console.log(`✅ AI email generated in ${duration}ms`);

      return {
        success: true,
        subject,
        body,
        alternatives,
        analysis,
        prediction,
        metadata: {
          model: AI_CONFIG.models.primary,
          tone: toneProfile,
          generationTime: duration,
          confidence: prediction.confidence
        }
      };

    } catch (error) {
      console.error('❌ Error generating AI email:', error);
      
      // Fallback to template-based email
      return this.generateFallbackEmail(contactData, emailType);
    }
  }

  /**
   * ═══════════════════════════════════════════════════════════════════════
   * CALL TRANSCRIPT ANALYSIS
   * ═══════════════════════════════════════════════════════════════════════
   */

  /**
   * Analyze call transcript using advanced AI
   * 
   * @param {string} transcript - Call transcript
   * @param {Object} contactData - Contact data
   * @returns {Promise<Object>} Comprehensive analysis
   */
  async analyzeCallTranscript(transcript, contactData) {
    console.log('🔍 Analyzing call transcript...');

    const cacheKey = `analysis_${this.hashString(transcript)}`;
    
    // Check cache
    if (AI_CONFIG.caching.enabled && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < AI_CONFIG.caching.ttlSeconds * 1000) {
        console.log('📦 Using cached analysis');
        return cached.data;
      }
    }

    const analysisPrompt = `You are an expert credit repair consultant analyzing a phone conversation.

CALL TRANSCRIPT:
${transcript}

CONTACT INFO:
Name: ${contactData.name || 'Unknown'}
Phone: ${contactData.phone || 'Unknown'}
Source: ${contactData.source || 'Unknown'}

Analyze this conversation and provide a comprehensive JSON response with the following structure:

{
  "sentiment": {
    "overall": "positive/neutral/negative/urgent",
    "confidence": 0.95,
    "emotional_state": "hopeful/frustrated/desperate/curious/skeptical"
  },
  "pain_points": [
    {
      "issue": "specific problem mentioned",
      "severity": "high/medium/low",
      "emotional_impact": "description",
      "keywords": ["list", "of", "related", "terms"]
    }
  ],
  "goals": [
    {
      "goal": "what they want to achieve",
      "timeline": "when they need it",
      "importance": "high/medium/low",
      "mentioned_explicitly": true/false
    }
  ],
  "urgency": {
    "level": "critical/high/moderate/low",
    "indicators": ["reasons why"],
    "timeline_mentioned": "specific timeframe if any",
    "financial_pressure": true/false
  },
  "creditSituation": {
    "current_score_mentioned": true/false,
    "estimated_score_range": "300-400/400-500/etc",
    "major_issues": ["bankruptcies", "collections", "late payments"],
    "recent_events": ["recent credit denials", "loan rejections"],
    "goals_score": "target score if mentioned"
  },
  "engagement_level": {
    "interest": "very high/high/moderate/low",
    "readiness_to_act": "immediate/soon/researching/uncertain",
    "questions_asked": 5,
    "concerns_raised": ["concern 1", "concern 2"]
  },
  "personalization_hooks": {
    "family_situation": "single/married/children/etc",
    "employment": "mentioned job situation",
    "financial_goals": ["buy house", "get car", "lower rates"],
    "life_events": ["divorce", "medical bills", "job loss"],
    "specific_mentions": ["anything specific they said we should reference"]
  },
  "objections": [
    {
      "objection": "concern they raised",
      "type": "price/trust/effectiveness/time",
      "addressed_in_call": true/false
    }
  ],
  "next_best_action": {
    "recommended": "get_report/schedule_call/send_info/follow_up",
    "reasoning": "why this is the best next step",
    "timing": "immediate/24h/48h/week"
  },
  "key_quotes": [
    "memorable things they said that we can reference"
  ]
}

Provide ONLY the JSON response, no other text.`;

    try {
      const completion = await this.callOpenAI(analysisPrompt, AI_CONFIG.models.analysis, {
        response_format: { type: "json_object" }
      });

      const analysis = JSON.parse(completion);
      
      // Cache the result
      if (AI_CONFIG.caching.enabled) {
        this.cache.set(cacheKey, {
          data: analysis,
          timestamp: Date.now()
        });
      }

      console.log('✅ Transcript analysis complete');
      return analysis;

    } catch (error) {
      console.error('❌ Error analyzing transcript:', error);
      
      // Return basic analysis
      return this.generateBasicAnalysis(transcript, contactData);
    }
  }

  /**
   * ═══════════════════════════════════════════════════════════════════════
   * SUBJECT LINE GENERATION
   * ═══════════════════════════════════════════════════════════════════════
   */

  /**
   * Generate compelling subject line
   * 
   * @param {Object} analysis - Call analysis
   * @param {string} emailType - Email type
   * @param {Object} toneProfile - Tone profile
   * @returns {Promise<string>} Subject line
   */
  async generateSubjectLine(analysis, emailType, toneProfile) {
    console.log('📧 Generating subject line...');

    const subjectPrompt = `You are an expert copywriter for a credit repair company. Generate a compelling email subject line.

EMAIL TYPE: ${emailType}

RECIPIENT ANALYSIS:
${JSON.stringify(analysis, null, 2)}

TONE: ${JSON.stringify(toneProfile, null, 2)}

REQUIREMENTS:
1. 40-60 characters (optimal for mobile)
2. Personalized based on the analysis
3. Creates urgency without being pushy
4. Speaks to their specific pain points
5. Implies value/benefit
6. Avoids spam trigger words
7. Professional but friendly

EXAMPLES OF GREAT SUBJECT LINES:
- "{{FirstName}}, your 720 credit score is achievable"
- "Free credit report ready - let's fix those errors"
- "{{FirstName}}, I found 7 items we can remove"
- "Your path to homeownership starts here"
- "Quick question about your credit goals"

Generate 1 perfect subject line that will get opened. Be specific to this person's situation.
Return ONLY the subject line text, no quotes, no explanation.`;

    try {
      const subject = await this.callOpenAI(subjectPrompt, AI_CONFIG.models.primary);
      console.log(`✅ Subject line generated: "${subject}"`);
      return subject.trim();

    } catch (error) {
      console.error('❌ Error generating subject line:', error);
      return this.getFallbackSubject(emailType, analysis);
    }
  }

  /**
   * ═══════════════════════════════════════════════════════════════════════
   * EMAIL BODY GENERATION
   * ═══════════════════════════════════════════════════════════════════════
   */

  /**
   * Generate personalized email body
   * 
   * @param {Object} analysis - Call analysis
   * @param {Object} contactData - Contact data
   * @param {string} emailType - Email type
   * @param {Object} toneProfile - Tone profile
   * @param {Object} options - Additional options
   * @returns {Promise<string>} HTML email body
   */
  async generateEmailBody(analysis, contactData, emailType, toneProfile, options = {}) {
    console.log('✍️ Generating email body...');

    const firstName = contactData.firstName || contactData.name?.split(' ')[0] || 'there';

    const bodyPrompt = `You are Chris Lahage, owner of Speedy Credit Repair with 30 years of experience. Write a personalized email.

YOUR VOICE & STYLE:
${JSON.stringify(CHRIS_VOICE_PROFILE, null, 2)}

RECIPIENT ANALYSIS:
${JSON.stringify(analysis, null, 2)}

CONTACT INFO:
Name: ${contactData.name || 'Unknown'}
First Name: ${firstName}
Phone: ${contactData.phone || 'Unknown'}
Email: ${contactData.email || 'Unknown'}

EMAIL TYPE: ${emailType}
TONE: ${JSON.stringify(toneProfile, null, 2)}

EMAIL STRUCTURE REQUIREMENTS:

1. GREETING (warm and personal)
   - Use first name
   - Reference something from the call if applicable

2. OPENING (hook them immediately)
   - Acknowledge their specific situation
   - Show you understand their pain points
   - Build immediate rapport

3. VALUE PROPOSITION (what you offer)
   - Address their specific concerns from the analysis
   - Explain how you can help THEIR situation
   - Use specific examples relevant to them

4. CREDIBILITY (why trust you)
   - 30 years experience
   - Personal attention from owner
   - Specific results/testimonials relevant to their situation

5. CLEAR CALL TO ACTION
   - Tell them exactly what to do next
   - Make it easy and low-risk
   - Create appropriate urgency based on their situation

6. OVERCOME OBJECTIONS
   - Address any concerns they raised
   - Preemptively handle common objections

7. PERSONAL SIGN-OFF
   - Reinforce personal involvement
   - Include direct contact info
   - Add authentic P.S. that relates to them

WRITING GUIDELINES:
- Write in first person (I/me) as Chris
- Keep paragraphs short (2-3 sentences max)
- Use conversational but professional language
- Be specific to THEIR situation, not generic
- Reference actual pain points from the analysis
- Show genuine empathy and understanding
- No corporate jargon or sales speak
- Natural tone like you're talking to a friend
- Include emotional connection points
- Use power words: achieve, guaranteed, proven, expert, personal

IMPORTANT:
- Write PLAIN TEXT version, not HTML
- Use clear paragraph breaks
- Keep total length 300-400 words
- Make it feel personal, not templated
- Include a specific P.S. that references their situation

Write the email body now:`;

    try {
      const bodyText = await this.callOpenAI(bodyPrompt, AI_CONFIG.models.primary, {
        max_tokens: 2500
      });

      // Convert to HTML with proper formatting
      const bodyHTML = this.convertTextToEmailHTML(bodyText, contactData, analysis);

      console.log('✅ Email body generated');
      return bodyHTML;

    } catch (error) {
      console.error('❌ Error generating email body:', error);
      return this.getFallbackBody(emailType, contactData, analysis);
    }
  }

  /**
   * ═══════════════════════════════════════════════════════════════════════
   * A/B TESTING & ALTERNATIVES
   * ═══════════════════════════════════════════════════════════════════════
   */

  /**
   * Generate alternative email versions for A/B testing
   * 
   * @param {Object} analysis - Call analysis
   * @param {Object} contactData - Contact data
   * @param {string} emailType - Email type
   * @param {Object} original - Original email
   * @returns {Promise<Array>} Alternative versions
   */
  async generateAlternatives(analysis, contactData, emailType, original) {
    console.log('🔄 Generating A/B test alternatives...');

    try {
      // Generate alternative subject lines
      const altSubjects = await this.generateAlternativeSubjects(
        analysis,
        emailType,
        original.subject
      );

      // Return alternatives
      return [
        {
          version: 'A',
          subject: original.subject,
          body: original.body,
          strategy: 'original'
        },
        {
          version: 'B',
          subject: altSubjects[0],
          body: original.body,
          strategy: 'subject_test'
        },
        {
          version: 'C',
          subject: altSubjects[1],
          body: original.body,
          strategy: 'subject_test'
        }
      ];

    } catch (error) {
      console.error('❌ Error generating alternatives:', error);
      return [];
    }
  }

  /**
   * Generate alternative subject lines
   * 
   * @param {Object} analysis - Call analysis  
   * @param {string} emailType - Email type
   * @param {string} original - Original subject
   * @returns {Promise<Array>} Alternative subjects
   */
  async generateAlternativeSubjects(analysis, emailType, original) {
    const prompt = `Generate 2 alternative subject lines for A/B testing.

ORIGINAL SUBJECT: ${original}

ANALYSIS: ${JSON.stringify(analysis.pain_points, null, 2)}

Requirements:
- Different approach/angle than original
- Same target length (40-60 chars)
- Test different psychological triggers
- Maintain professionalism

Return as JSON array: ["subject 1", "subject 2"]`;

    try {
      const completion = await this.callOpenAI(prompt, AI_CONFIG.models.primary, {
        response_format: { type: "json_object" }
      });
      
      const result = JSON.parse(completion);
      return result.subjects || [];

    } catch (error) {
      return [
        `${analysis.sentiment.emotional_state === 'urgent' ? '⏰ ' : ''}${original}`,
        original.replace('Your', 'Get Your')
      ];
    }
  }

  /**
   * ═══════════════════════════════════════════════════════════════════════
   * PERFORMANCE PREDICTION & OPTIMIZATION
   * ═══════════════════════════════════════════════════════════════════════
   */

  /**
   * Predict email performance
   * 
   * @param {Object} analysis - Call analysis
   * @param {Object} email - Email content
   * @param {Array} alternatives - Alternative versions
   * @returns {Object} Performance prediction
   */
  predictPerformance(analysis, email, alternatives) {
    let confidence = 0.75; // Base confidence

    // Adjust based on analysis quality
    if (analysis.sentiment?.confidence > 0.8) confidence += 0.1;
    if (analysis.pain_points?.length >= 3) confidence += 0.05;
    if (analysis.urgency?.level === 'high' || analysis.urgency?.level === 'critical') confidence += 0.05;

    // Subject line quality
    const subjectLength = email.subject.length;
    if (subjectLength >= 40 && subjectLength <= 60) confidence += 0.05;

    // Predicted metrics
    const baseOpenRate = 0.25;
    const baseClickRate = 0.05;

    const adjustedOpenRate = baseOpenRate * (1 + (confidence - 0.75) * 2);
    const adjustedClickRate = baseClickRate * (1 + (confidence - 0.75) * 3);

    return {
      confidence,
      predictedOpenRate: Math.min(adjustedOpenRate, 0.45),
      predictedClickRate: Math.min(adjustedClickRate, 0.15),
      factors: {
        personalization: analysis.personalization_hooks ? 'high' : 'medium',
        urgency: analysis.urgency?.level || 'moderate',
        relevance: analysis.pain_points?.length >= 2 ? 'high' : 'medium'
      },
      recommendation: alternatives.length > 0 ? 'A/B test recommended' : 'Single version'
    };
  }

  /**
   * ═══════════════════════════════════════════════════════════════════════
   * LEARNING & OPTIMIZATION
   * ═══════════════════════════════════════════════════════════════════════
   */

  /**
   * Learn from email engagement
   * 
   * @param {string} contactId - Contact ID
   * @param {string} emailId - Email ID
   * @param {Object} engagement - Engagement data
   * @returns {Promise<void>}
   */
  async learnFromEngagement(contactId, emailId, engagement) {
    try {
      // Save engagement data
      await db.collection('emailPerformance').add({
        contactId,
        emailId,
        opened: engagement.opened || false,
        clicked: engagement.clicked || false,
        converted: engagement.converted || false,
        openedAt: engagement.openedAt || null,
        clickedAt: engagement.clickedAt || null,
        convertedAt: engagement.convertedAt || null,
        deviceType: engagement.deviceType || 'unknown',
        location: engagement.location || null,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });

      // Update performance metrics
      this.updatePerformanceMetrics(emailId, engagement);

      console.log('📊 Engagement data saved for learning');

    } catch (error) {
      console.error('❌ Error saving engagement data:', error);
    }
  }

  /**
   * Update performance metrics
   * 
   * @param {string} emailId - Email ID
   * @param {Object} engagement - Engagement data
   */
  updatePerformanceMetrics(emailId, engagement) {
    if (!this.performanceMetrics.has(emailId)) {
      this.performanceMetrics.set(emailId, {
        sent: 0,
        opened: 0,
        clicked: 0,
        converted: 0
      });
    }

    const metrics = this.performanceMetrics.get(emailId);
    metrics.sent++;
    if (engagement.opened) metrics.opened++;
    if (engagement.clicked) metrics.clicked++;
    if (engagement.converted) metrics.converted++;
  }

  /**
   * ═══════════════════════════════════════════════════════════════════════
   * HELPER METHODS
   * ═══════════════════════════════════════════════════════════════════════
   */

  /**
   * Call OpenAI API with retry logic
   * 
   * @param {string} prompt - Prompt
   * @param {string} model - Model name
   * @param {Object} options - Additional options
   * @returns {Promise<string>} Response
   */
  async callOpenAI(prompt, model = AI_CONFIG.models.primary, options = {}) {
    let lastError;

    for (let attempt = 1; attempt <= AI_CONFIG.retries.maxAttempts; attempt++) {
      try {
        const response = await openai.chat.completions.create({
          model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: options.max_tokens || AI_CONFIG.limits.maxTokens,
          temperature: options.temperature || AI_CONFIG.limits.temperature,
          top_p: options.top_p || AI_CONFIG.limits.topP,
          frequency_penalty: AI_CONFIG.limits.frequencyPenalty,
          presence_penalty: AI_CONFIG.limits.presencePenalty,
          ...options
        });

        return response.choices[0].message.content.trim();

      } catch (error) {
        lastError = error;
        console.error(`❌ OpenAI API error (attempt ${attempt}/${AI_CONFIG.retries.maxAttempts}):`, error.message);

        if (attempt < AI_CONFIG.retries.maxAttempts) {
          // Wait before retry
          await this.sleep(AI_CONFIG.retries.backoffMs * attempt);
          
          // Try fallback model on final attempt
          if (attempt === AI_CONFIG.retries.maxAttempts - 1 && model !== AI_CONFIG.models.fallback) {
            model = AI_CONFIG.models.fallback;
            console.log(`🔄 Switching to fallback model: ${model}`);
          }
        }
      }
    }

    throw lastError;
  }

  /**
   * Determine optimal tone profile
   * 
   * @param {Object} analysis - Call analysis
   * @param {string} emailType - Email type
   * @returns {Object} Tone profile
   */
  determineToneProfile(analysis, emailType) {
    // Urgent situations
    if (analysis.urgency?.level === 'critical' || analysis.urgency?.level === 'high') {
      return TONE_PROFILES.urgent;
    }

    // Skeptical or concerned
    if (analysis.sentiment?.emotional_state === 'skeptical' && analysis.objections?.length > 0) {
      return TONE_PROFILES.consultative;
    }

    // Frustrated or desperate
    if (analysis.sentiment?.emotional_state === 'frustrated' || analysis.sentiment?.emotional_state === 'desperate') {
      return TONE_PROFILES.empathetic;
    }

    // Default to friendly
    return TONE_PROFILES.friendly;
  }

  /**
   * Convert plain text to HTML email format
   * 
   * @param {string} text - Plain text
   * @param {Object} contactData - Contact data
   * @param {Object} analysis - Call analysis
   * @returns {string} HTML
   */
  convertTextToEmailHTML(text, contactData, analysis) {
    // Split into paragraphs
    const paragraphs = text.split('\n\n').filter(p => p.trim());

    // Convert to HTML paragraphs
    let html = paragraphs.map(p => {
      // Check if it's a signature
      if (p.includes('Chris Lahage') || p.includes('Owner')) {
        return `<div class="signature">${p.replace(/\n/g, '<br>')}</div>`;
      }
      
      // Check if it's a P.S.
      if (p.trim().startsWith('P.S.')) {
        return `<div class="ps-box">${p.replace(/\n/g, '<br>')}</div>`;
      }

      // Regular paragraph
      return `<p>${p.replace(/\n/g, '<br>')}</p>`;
    }).join('\n');

    // Add CTA button if appropriate
    if (analysis.next_best_action?.recommended === 'get_report') {
      const ctaButton = `
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td align="center" style="padding: 20px 0;">
              <a href="{{idiq_report_url}}" class="btn btn-primary" style="display: inline-block; padding: 14px 28px; font-size: 16px; font-weight: 600; text-align: center; text-decoration: none; border-radius: 8px; background-color: #1e40af; color: #ffffff;">
                Get Your Free Credit Report
              </a>
            </td>
          </tr>
        </table>
      `;
      
      // Insert before signature
      html = html.replace('<div class="signature">', ctaButton + '<div class="signature">');
    }

    return html;
  }

  /**
   * Generate basic analysis when AI fails
   * 
   * @param {string} transcript - Transcript
   * @param {Object} contactData - Contact data
   * @returns {Object} Basic analysis
   */
  generateBasicAnalysis(transcript, contactData) {
    return {
      sentiment: {
        overall: 'neutral',
        confidence: 0.5,
        emotional_state: 'curious'
      },
      pain_points: [
        {
          issue: 'credit concerns',
          severity: 'medium',
          emotional_impact: 'moderate stress',
          keywords: ['credit', 'score', 'repair']
        }
      ],
      goals: [
        {
          goal: 'improve credit score',
          timeline: 'soon',
          importance: 'high',
          mentioned_explicitly: false
        }
      ],
      urgency: {
        level: 'moderate',
        indicators: ['seeking help'],
        financial_pressure: false
      },
      creditSituation: {
        current_score_mentioned: false,
        estimated_score_range: 'unknown',
        major_issues: [],
        recent_events: []
      },
      engagement_level: {
        interest: 'moderate',
        readiness_to_act: 'researching',
        questions_asked: 0,
        concerns_raised: []
      },
      personalization_hooks: {},
      objections: [],
      next_best_action: {
        recommended: 'get_report',
        reasoning: 'standard flow',
        timing: 'immediate'
      },
      key_quotes: []
    };
  }

  /**
   * Get fallback subject line
   * 
   * @param {string} emailType - Email type
   * @param {Object} analysis - Analysis
   * @returns {string} Subject line
   */
  getFallbackSubject(emailType, analysis) {
    const subjects = {
      welcome: 'Your free credit report is ready',
      reminder: 'Don\'t miss your free credit analysis',
      help: 'Need help with your credit report?',
      report_ready: 'Your credit report results are in',
      consultation: 'Let\'s schedule your credit consultation'
    };

    return subjects[emailType] || 'Important update about your credit';
  }

  /**
   * Get fallback email body
   * 
   * @param {string} emailType - Email type
   * @param {Object} contactData - Contact data
   * @param {Object} analysis - Analysis
   * @returns {string} HTML body
   */
  getFallbackBody(emailType, contactData, analysis) {
    const firstName = contactData.firstName || contactData.name?.split(' ')[0] || 'there';

    return `
      <p>Hi ${firstName},</p>
      
      <p>Thanks for contacting Speedy Credit Repair. I'm Chris Lahage, the owner, and I'm here to help you improve your credit.</p>
      
      <p>With 30 years of experience, I've helped thousands of people just like you achieve their credit goals. Your situation is fixable, and I'm ready to show you how.</p>
      
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td align="center" style="padding: 20px 0;">
            <a href="{{idiq_report_url}}" class="btn btn-primary" style="display: inline-block; padding: 14px 28px; font-size: 16px; font-weight: 600; text-align: center; text-decoration: none; border-radius: 8px; background-color: #1e40af; color: #ffffff;">
              Get Your Free Credit Report
            </a>
          </td>
        </tr>
      </table>
      
      <p>Let's get started on improving your credit today.</p>
      
      <div class="signature">
        <p><strong>Chris Lahage</strong><br>
        Owner & Credit Expert<br>
        Speedy Credit Repair<br>
        (888) 724-7344</p>
      </div>
    `;
  }

  /**
   * Save generation data for learning
   * 
   * @param {Object} data - Generation data
   * @returns {Promise<void>}
   */
  async saveGenerationData(data) {
    try {
      await db.collection('aiEmailGenerations').add({
        ...data,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {
      console.error('❌ Error saving generation data:', error);
    }
  }

  /**
   * Hash string for caching
   * 
   * @param {string} str - String to hash
   * @returns {string} Hash
   */
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  /**
   * Sleep helper
   * 
   * @param {number} ms - Milliseconds
   * @returns {Promise<void>}
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate fallback email when AI unavailable
   * 
   * @param {Object} contactData - Contact data
   * @param {string} emailType - Email type
   * @returns {Object} Fallback email
   */
  generateFallbackEmail(contactData, emailType) {
    const firstName = contactData.firstName || contactData.name?.split(' ')[0] || 'there';
    
    return {
      success: true,
      subject: this.getFallbackSubject(emailType, {}),
      body: this.getFallbackBody(emailType, contactData, {}),
      alternatives: [],
      analysis: this.generateBasicAnalysis('', contactData),
      prediction: {
        confidence: 0.6,
        predictedOpenRate: 0.20,
        predictedClickRate: 0.04
      },
      metadata: {
        model: 'fallback',
        tone: TONE_PROFILES.friendly,
        generationTime: 0,
        confidence: 0.6
      }
    };
  }
}

// Export singleton instance
const aiEmailService = new AIEmailService();

module.exports = {
  aiEmailService,
  AIEmailService,
  generateAIEmail: (transcript, contactData, emailType, options) => 
    aiEmailService.generateAIEmail(transcript, contactData, emailType, options),
  analyzeCallTranscript: (transcript, contactData) =>
    aiEmailService.analyzeCallTranscript(transcript, contactData),
  learnFromEngagement: (contactId, emailId, engagement) =>
    aiEmailService.learnFromEngagement(contactId, emailId, engagement)
};