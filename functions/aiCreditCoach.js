// ============================================================================
// AI CREDIT COACH - INTELLIGENT CHATBOT FOR CLIENT EDUCATION
// ============================================================================
// 24/7 AI-powered credit education and guidance chatbot
// ============================================================================

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');
const OpenAI = require('openai');

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const OPENAI_API_KEY = defineSecret('OPENAI_API_KEY');

// ============================================================================
// CREDIT KNOWLEDGE BASE
// ============================================================================
const CREDIT_KNOWLEDGE = {
  scoringFactors: {
    paymentHistory: {
      weight: 35,
      description: 'Your track record of paying bills on time',
      tips: [
        'Set up autopay for at least minimum payments',
        'Even one 30-day late payment can drop your score 50-100 points',
        'Late payments stay on your report for 7 years',
      ],
    },
    creditUtilization: {
      weight: 30,
      description: 'How much of your available credit you\'re using',
      tips: [
        'Keep utilization below 30%, ideally below 10%',
        'Pay down balances before statement closes',
        'Request credit limit increases to lower utilization',
      ],
    },
    creditAge: {
      weight: 15,
      description: 'The average age of all your credit accounts',
      tips: [
        'Don\'t close old accounts even if unused',
        'Become an authorized user on old accounts',
        'Open new accounts sparingly',
      ],
    },
    creditMix: {
      weight: 10,
      description: 'The variety of credit types you have',
      tips: [
        'Having both revolving and installment credit helps',
        'A mortgage has the biggest positive impact',
        'Don\'t open accounts just for mix',
      ],
    },
    newCredit: {
      weight: 10,
      description: 'Recent credit applications and new accounts',
      tips: [
        'Each hard inquiry can drop your score 5-10 points',
        'Rate shopping for mortgages/auto loans within 14-45 days counts as one inquiry',
        'Wait 6 months between credit applications',
      ],
    },
  },
  commonQuestions: {
    'how long do late payments stay': '7 years from the date of the late payment',
    'how long do collections stay': '7 years from the date of first delinquency',
    'how long does bankruptcy stay': 'Chapter 7: 10 years, Chapter 13: 7 years',
    'what is a good credit score': '670-739 is good, 740-799 is very good, 800+ is exceptional',
    'how to dispute an error': 'File a dispute with each bureau reporting the error online, by mail, or by phone',
  },
  scoreRanges: {
    exceptional: { min: 800, max: 850, description: 'Best rates and terms available' },
    veryGood: { min: 740, max: 799, description: 'Qualify for most products with good rates' },
    good: { min: 670, max: 739, description: 'May qualify for most products' },
    fair: { min: 580, max: 669, description: 'May face higher rates or deposits' },
    poor: { min: 300, max: 579, description: 'May have difficulty qualifying for credit' },
  },
};

// ============================================================================
// AI CREDIT COACH CHAT
// ============================================================================
exports.chatWithCoach = onCall(
  { secrets: [OPENAI_API_KEY], memory: '512MiB', timeoutSeconds: 60 },
  async (request) => {
    const { message, conversationHistory, clientContext, mode } = request.data;

    if (!message) {
      throw new HttpsError('invalid-argument', 'Message is required');
    }

    try {
      const openai = new OpenAI({ apiKey: OPENAI_API_KEY.value() });

      // Build context-aware system prompt
      let systemPrompt = `You are CreditCoach AI, a friendly and knowledgeable credit expert assistant. Your role is to:

1. EDUCATE clients about credit scores, reports, and improvement strategies
2. ANSWER questions about credit repair, disputes, and financial health
3. MOTIVATE clients on their credit repair journey
4. EXPLAIN complex credit concepts in simple terms
5. PROVIDE actionable advice tailored to their situation

IMPORTANT GUIDELINES:
- Be encouraging and supportive
- Use simple language, avoid jargon
- Give specific, actionable advice
- Reference FCRA rights when relevant
- Never give legal or financial advice that requires a license
- Always recommend consulting professionals for complex issues
- Be concise - clients want quick answers

KNOWLEDGE BASE:
${JSON.stringify(CREDIT_KNOWLEDGE, null, 2)}`;

      // Add client context if available
      if (clientContext) {
        systemPrompt += `

CLIENT CONTEXT:
- Current Score: ${clientContext.currentScore || 'Unknown'}
- Target Score: ${clientContext.targetScore || '720+'}
- Active Disputes: ${clientContext.activeDisputes || 0}
- Main Concerns: ${clientContext.concerns?.join(', ') || 'General credit improvement'}`;
      }

      // Add mode-specific instructions
      if (mode === 'motivational') {
        systemPrompt += `

CURRENT MODE: MOTIVATIONAL
Focus on encouragement, celebrating progress, and maintaining momentum.`;
      } else if (mode === 'educational') {
        systemPrompt += `

CURRENT MODE: EDUCATIONAL
Focus on teaching credit concepts and answering informational questions.`;
      } else if (mode === 'strategic') {
        systemPrompt += `

CURRENT MODE: STRATEGIC
Focus on specific action plans and dispute strategies.`;
      }

      // Build messages array
      const messages = [{ role: 'system', content: systemPrompt }];

      // Add conversation history
      if (conversationHistory && Array.isArray(conversationHistory)) {
        conversationHistory.slice(-10).forEach(msg => {
          messages.push({
            role: msg.role,
            content: msg.content,
          });
        });
      }

      // Add current message
      messages.push({ role: 'user', content: message });

      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages,
        temperature: 0.7,
        max_tokens: 500,
      });

      const aiResponse = response.choices[0].message.content;

      // Check for follow-up suggestions
      const followUps = generateFollowUpSuggestions(message, aiResponse);

      // Store conversation for analytics
      if (request.auth?.uid) {
        await db.collection('coachConversations').add({
          userId: request.auth.uid,
          clientId: clientContext?.clientId || null,
          message,
          response: aiResponse,
          mode: mode || 'general',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      return {
        success: true,
        response: aiResponse,
        followUpSuggestions: followUps,
        mode: mode || 'general',
      };

    } catch (error) {
      console.error('Chat error:', error);
      throw new HttpsError('internal', error.message);
    }
  }
);

// ============================================================================
// QUICK TIPS GENERATOR
// ============================================================================
exports.getQuickTips = onCall(
  { secrets: [OPENAI_API_KEY], memory: '256MiB', timeoutSeconds: 30 },
  async (request) => {
    const { clientId, category } = request.data;

    try {
      let clientData = null;

      if (clientId) {
        // Fetch client's credit data for personalized tips
        const reportQuery = await db.collection('creditReports')
          .where('clientId', '==', clientId)
          .orderBy('createdAt', 'desc')
          .limit(1)
          .get();

        if (!reportQuery.empty) {
          clientData = reportQuery.docs[0].data();
        }
      }

      const openai = new OpenAI({ apiKey: OPENAI_API_KEY.value() });

      let prompt = 'Generate 5 actionable credit improvement tips';

      if (category) {
        prompt += ` focused on ${category}`;
      }

      if (clientData?.parsedData) {
        const scores = clientData.parsedData.scores || {};
        const avgScore = Math.round(
          ((scores.experian || 0) + (scores.equifax || 0) + (scores.transunion || 0)) / 3
        );

        prompt += `. The client has a ${avgScore} credit score`;

        if (clientData.parsedData.collections?.length > 0) {
          prompt += `, ${clientData.parsedData.collections.length} collections`;
        }

        if (clientData.parsedData.inquiries?.length > 5) {
          prompt += `, and high inquiry count`;
        }
      }

      const tips = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a credit expert. Provide concise, actionable tips. Format as JSON array.',
          },
          {
            role: 'user',
            content: `${prompt}

Return JSON:
{
  "tips": [
    {
      "title": "Short title",
      "description": "Detailed tip under 50 words",
      "impact": "high|medium|low",
      "timeframe": "immediate|weekly|monthly",
      "category": "utilization|payments|disputes|other"
    }
  ]
}`,
          },
        ],
        temperature: 0.6,
        response_format: { type: 'json_object' },
      });

      return {
        success: true,
        ...JSON.parse(tips.choices[0].message.content),
        personalized: !!clientData,
      };

    } catch (error) {
      console.error('Quick tips error:', error);
      throw new HttpsError('internal', error.message);
    }
  }
);

// ============================================================================
// MOTIVATION MESSAGE GENERATOR
// ============================================================================
exports.getMotivation = onCall(
  { secrets: [OPENAI_API_KEY], memory: '256MiB', timeoutSeconds: 30 },
  async (request) => {
    const { clientId, milestone, progressData } = request.data;

    try {
      const openai = new OpenAI({ apiKey: OPENAI_API_KEY.value() });

      let context = '';

      if (milestone) {
        context = `Client just achieved: ${milestone}`;
      } else if (progressData) {
        context = `Client progress: Started at ${progressData.startScore}, now at ${progressData.currentScore}`;
      } else {
        context = 'General encouragement needed';
      }

      const motivation = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are an enthusiastic credit coach. Generate warm, encouraging messages that celebrate progress and motivate continued effort. Be genuine, not generic. Reference specific achievements when possible.`,
          },
          {
            role: 'user',
            content: `Generate a motivational message for this context: ${context}

Return JSON:
{
  "message": "The main motivational message",
  "emoji": "appropriate emoji",
  "nextStep": "One specific action they should take next",
  "encouragement": "A brief quote or affirmation"
}`,
          },
        ],
        temperature: 0.8,
        response_format: { type: 'json_object' },
      });

      return {
        success: true,
        ...JSON.parse(motivation.choices[0].message.content),
      };

    } catch (error) {
      console.error('Motivation error:', error);
      throw new HttpsError('internal', error.message);
    }
  }
);

// ============================================================================
// CREDIT SCORE EXPLAINER
// ============================================================================
exports.explainScore = onCall(
  { secrets: [OPENAI_API_KEY], memory: '512MiB', timeoutSeconds: 60 },
  async (request) => {
    const { clientId, reportId } = request.data;

    if (!clientId) {
      throw new HttpsError('invalid-argument', 'Client ID required');
    }

    try {
      let reportData;

      if (reportId) {
        const doc = await db.collection('creditReports').doc(reportId).get();
        reportData = doc.exists ? doc.data() : null;
      } else {
        const query = await db.collection('creditReports')
          .where('clientId', '==', clientId)
          .orderBy('createdAt', 'desc')
          .limit(1)
          .get();
        reportData = query.empty ? null : query.docs[0].data();
      }

      if (!reportData?.parsedData) {
        throw new HttpsError('not-found', 'No credit report found');
      }

      const { parsedData } = reportData;
      const openai = new OpenAI({ apiKey: OPENAI_API_KEY.value() });

      const explanation = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are a credit educator. Explain credit scores in simple terms that anyone can understand. Use analogies and examples. Be encouraging while being honest about issues.`,
          },
          {
            role: 'user',
            content: `Explain this credit profile in simple terms:

SCORES:
${JSON.stringify(parsedData.scores || {}, null, 2)}

ACCOUNTS: ${(parsedData.accounts || []).length}
COLLECTIONS: ${(parsedData.collections || []).length}
INQUIRIES: ${(parsedData.inquiries || []).length}
PUBLIC RECORDS: ${(parsedData.publicRecords || []).length}

NEGATIVE ITEMS:
${JSON.stringify((parsedData.accounts || []).filter(a => a.status === 'negative').slice(0, 5), null, 2)}

Provide a friendly explanation. Return JSON:
{
  "overallExplanation": "2-3 paragraph plain English explanation",
  "scoreBreakdown": {
    "paymentHistory": { "status": "good|fair|poor", "explanation": "string" },
    "creditUtilization": { "status": "good|fair|poor", "explanation": "string" },
    "creditAge": { "status": "good|fair|poor", "explanation": "string" },
    "creditMix": { "status": "good|fair|poor", "explanation": "string" },
    "newCredit": { "status": "good|fair|poor", "explanation": "string" }
  },
  "biggestIssues": [
    { "issue": "string", "impact": "string", "solution": "string" }
  ],
  "strengths": ["strength1", "strength2"],
  "encouragement": "A positive closing message"
}`,
          },
        ],
        temperature: 0.5,
        response_format: { type: 'json_object' },
      });

      return {
        success: true,
        ...JSON.parse(explanation.choices[0].message.content),
      };

    } catch (error) {
      console.error('Score explanation error:', error);
      throw new HttpsError('internal', error.message);
    }
  }
);

// ============================================================================
// FAQ RESPONDER
// ============================================================================
exports.answerFAQ = onCall(
  { memory: '256MiB', timeoutSeconds: 30 },
  async (request) => {
    const { question } = request.data;

    if (!question) {
      throw new HttpsError('invalid-argument', 'Question required');
    }

    // Common FAQ responses (no AI needed for these)
    const faqDatabase = [
      {
        keywords: ['how long', 'late payment', 'stay'],
        answer: 'Late payments stay on your credit report for 7 years from the date of the missed payment. However, their impact on your score decreases over time.',
        category: 'reporting_timeline',
      },
      {
        keywords: ['how long', 'collection', 'stay'],
        answer: 'Collections remain on your credit report for 7 years from the date of first delinquency on the original account, not from when it went to collections.',
        category: 'reporting_timeline',
      },
      {
        keywords: ['how long', 'bankruptcy', 'stay'],
        answer: 'Chapter 7 bankruptcy stays on your report for 10 years. Chapter 13 bankruptcy stays for 7 years from the filing date.',
        category: 'reporting_timeline',
      },
      {
        keywords: ['dispute', 'how', 'file'],
        answer: 'You can dispute errors by: 1) Online through each bureau\'s website, 2) By mail with a detailed letter and supporting documents, or 3) By phone. Written disputes create a paper trail and are recommended.',
        category: 'disputes',
      },
      {
        keywords: ['good', 'credit score', 'what'],
        answer: 'Credit score ranges: 800-850 = Exceptional, 740-799 = Very Good, 670-739 = Good, 580-669 = Fair, 300-579 = Poor. A 700+ score qualifies you for most products at competitive rates.',
        category: 'scores',
      },
      {
        keywords: ['hard', 'soft', 'inquiry', 'difference'],
        answer: 'Hard inquiries occur when you apply for credit and can lower your score by 5-10 points. Soft inquiries (checking your own score, pre-approvals) don\'t affect your score.',
        category: 'inquiries',
      },
      {
        keywords: ['utilization', 'credit', 'what'],
        answer: 'Credit utilization is the percentage of your available credit you\'re using. Keep it below 30% for a good score, below 10% for the best results. It\'s calculated both per-card and overall.',
        category: 'utilization',
      },
      {
        keywords: ['authorized user', 'help', 'score'],
        answer: 'Being added as an authorized user on someone\'s credit card can help your score if: 1) The account has a good payment history, 2) Low utilization, 3) Long history. Their account history appears on your report.',
        category: 'building_credit',
      },
      {
        keywords: ['pay', 'delete', 'collection'],
        answer: 'Pay-for-delete is an agreement where a collector removes the collection from your report in exchange for payment. Get any agreement in writing before paying. Not all collectors agree to this.',
        category: 'collections',
      },
      {
        keywords: ['close', 'credit card', 'hurt'],
        answer: 'Closing a credit card can hurt your score by: 1) Increasing your overall utilization, 2) Reducing your credit age when old cards are closed. Keep old cards open with occasional small purchases.',
        category: 'credit_cards',
      },
    ];

    const questionLower = question.toLowerCase();

    // Find matching FAQ
    let bestMatch = null;
    let highestMatchCount = 0;

    for (const faq of faqDatabase) {
      const matchCount = faq.keywords.filter(kw => questionLower.includes(kw)).length;
      if (matchCount > highestMatchCount) {
        highestMatchCount = matchCount;
        bestMatch = faq;
      }
    }

    if (bestMatch && highestMatchCount >= 2) {
      return {
        success: true,
        answer: bestMatch.answer,
        category: bestMatch.category,
        source: 'faq_database',
        confidence: 'high',
      };
    }

    // If no FAQ match, indicate AI response is needed
    return {
      success: true,
      answer: null,
      needsAI: true,
      message: 'This question requires AI processing. Use chatWithCoach instead.',
    };
  }
);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateFollowUpSuggestions(userMessage, aiResponse) {
  const suggestions = [];
  const msgLower = userMessage.toLowerCase();
  const responseLower = aiResponse.toLowerCase();

  // Based on topic, suggest follow-ups
  if (msgLower.includes('score') || responseLower.includes('score')) {
    suggestions.push('What affects my score the most?');
    suggestions.push('How can I improve my score quickly?');
  }

  if (msgLower.includes('collection') || responseLower.includes('collection')) {
    suggestions.push('Should I pay off collections?');
    suggestions.push('How do I dispute a collection?');
  }

  if (msgLower.includes('dispute') || responseLower.includes('dispute')) {
    suggestions.push('What happens after I file a dispute?');
    suggestions.push('How long do disputes take?');
  }

  if (msgLower.includes('credit card') || responseLower.includes('credit card')) {
    suggestions.push('What credit card should I get?');
    suggestions.push('Should I close unused cards?');
  }

  // Always include general helpful suggestions
  if (suggestions.length < 3) {
    suggestions.push('What should I do next?');
    suggestions.push('How long will this take?');
  }

  return suggestions.slice(0, 3);
}
