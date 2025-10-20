/**
 * functions/aiService.js
 * 
 * SECURE OpenAI Cloud Function Wrapper
 * 
 * Purpose: Move all OpenAI API calls server-side to protect API keys
 * 
 * Features:
 * - Credit analysis and report parsing
 * - Dispute letter generation
 * - Lead scoring
 * - Generic AI completion endpoint
 * - Rate limiting per user
 * - Error handling and logging
 * - Cost tracking
 * 
 * Security:
 * - API key stored in Firebase Functions config (NOT in .env)
 * - Request validation
 * - User authentication required
 * - Rate limiting
 * 
 * Setup:
 * firebase functions:config:set openai.api_key="sk-..."
 * 
 * Author: SpeedyCRM Audit Remediation
 * Last Updated: 2025-10-20
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const OpenAI = require('openai');

// Initialize Firebase Admin (if not already initialized)
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// Initialize OpenAI with config from Firebase Functions config
// NOT from environment variables to avoid client exposure
const openai = new OpenAI({
  apiKey: functions.config().openai.api_key,
});

// ============================================================================
// RATE LIMITING HELPERS
// ============================================================================

/**
 * Check if user has exceeded rate limit
 * @param {string} userId - Firebase Auth UID
 * @param {number} maxRequests - Max requests per hour
 * @returns {Promise<boolean>} - true if under limit, false if exceeded
 */
async function checkRateLimit(userId, maxRequests = 100) {
  const now = Date.now();
  const oneHourAgo = now - (60 * 60 * 1000);

  const rateLimitRef = db.collection('rateLimits').doc(userId);
  const doc = await rateLimitRef.get();

  if (!doc.exists) {
    // First request, create document
    await rateLimitRef.set({
      requests: [now],
      totalRequests: 1,
      lastReset: now
    });
    return true;
  }

  const data = doc.data();
  // Filter out requests older than 1 hour
  const recentRequests = data.requests.filter(timestamp => timestamp > oneHourAgo);

  if (recentRequests.length >= maxRequests) {
    return false; // Rate limit exceeded
  }

  // Add current request
  recentRequests.push(now);

  await rateLimitRef.update({
    requests: recentRequests,
    totalRequests: admin.firestore.FieldValue.increment(1),
    lastRequest: now
  });

  return true;
}

/**
 * Log AI usage for cost tracking
 */
async function logAIUsage(userId, endpoint, tokensUsed, cost) {
  await db.collection('aiUsageLogs').add({
    userId,
    endpoint,
    tokensUsed,
    cost,
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  });
}

// ============================================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================================

/**
 * Verify Firebase Auth token
 */
async function verifyAuth(context) {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to use AI services.'
    );
  }
  return context.auth.uid;
}

// ============================================================================
// AI SERVICE ENDPOINTS
// ============================================================================

/**
 * Generic AI Completion Endpoint
 * 
 * Usage:
 * const result = await aiComplete({
 *   model: 'gpt-4',
 *   messages: [{role: 'user', content: 'Hello'}],
 *   temperature: 0.7,
 *   maxTokens: 500
 * });
 */
exports.aiComplete = functions.https.onCall(async (data, context) => {
  try {
    const userId = await verifyAuth(context);

    // Rate limiting
    const withinLimit = await checkRateLimit(userId, 100);
    if (!withinLimit) {
      throw new functions.https.HttpsError(
        'resource-exhausted',
        'Rate limit exceeded. Please try again in an hour.'
      );
    }

    // Validate input
    if (!data.messages || !Array.isArray(data.messages)) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Messages array is required.'
      );
    }

    // Default values
    const model = data.model || 'gpt-4';
    const temperature = data.temperature !== undefined ? data.temperature : 0.7;
    const maxTokens = data.maxTokens || 1000;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model,
      messages: data.messages,
      temperature,
      max_tokens: maxTokens,
    });

    const response = completion.choices[0].message.content;
    const tokensUsed = completion.usage.total_tokens;
    const estimatedCost = calculateCost(model, tokensUsed);

    // Log usage
    await logAIUsage(userId, 'aiComplete', tokensUsed, estimatedCost);

    return {
      success: true,
      response,
      tokensUsed,
      estimatedCost
    };

  } catch (error) {
    console.error('AI Complete Error:', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError(
      'internal',
      'AI service error: ' + error.message
    );
  }
});

/**
 * Credit Report Analysis
 * 
 * Analyzes credit report data and provides recommendations
 * 
 * Usage:
 * const result = await analyzeCreditReport({
 *   reportData: {...},
 *   clientInfo: {...}
 * });
 */
exports.analyzeCreditReport = functions.https.onCall(async (data, context) => {
  try {
    const userId = await verifyAuth(context);

    // Rate limiting
    const withinLimit = await checkRateLimit(userId, 50);
    if (!withinLimit) {
      throw new functions.https.HttpsError(
        'resource-exhausted',
        'Rate limit exceeded for credit analysis.'
      );
    }

    // Validate input
    if (!data.reportData) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Credit report data is required.'
      );
    }

    const systemPrompt = `You are a FCRA-compliant credit repair expert. Analyze the credit report data and provide:
1. Overall credit health score (0-100)
2. Key issues affecting credit score
3. Specific dispute-able items
4. Action plan with prioritized steps
5. Estimated timeline for improvement

Be specific, actionable, and compliant with FCRA regulations.`;

    const userPrompt = `Analyze this credit report:
${JSON.stringify(data.reportData, null, 2)}

Client Info: ${JSON.stringify(data.clientInfo || {}, null, 2)}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const analysis = completion.choices[0].message.content;
    const tokensUsed = completion.usage.total_tokens;
    const estimatedCost = calculateCost('gpt-4', tokensUsed);

    // Save analysis to Firestore
    const analysisRef = await db.collection('creditAnalyses').add({
      userId: data.clientId || userId,
      analyzedBy: userId,
      analysis,
      reportData: data.reportData,
      tokensUsed,
      estimatedCost,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Log usage
    await logAIUsage(userId, 'analyzeCreditReport', tokensUsed, estimatedCost);

    return {
      success: true,
      analysisId: analysisRef.id,
      analysis,
      tokensUsed,
      estimatedCost
    };

  } catch (error) {
    console.error('Credit Analysis Error:', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError(
      'internal',
      'Credit analysis error: ' + error.message
    );
  }
});

/**
 * Generate Dispute Letter
 * 
 * Creates FCRA-compliant dispute letters
 * 
 * Usage:
 * const result = await generateDisputeLetter({
 *   accountInfo: {...},
 *   disputeReason: 'not mine',
 *   clientInfo: {...}
 * });
 */
exports.generateDisputeLetter = functions.https.onCall(async (data, context) => {
  try {
    const userId = await verifyAuth(context);

    // Rate limiting
    const withinLimit = await checkRateLimit(userId, 100);
    if (!withinLimit) {
      throw new functions.https.HttpsError(
        'resource-exhausted',
        'Rate limit exceeded for dispute letters.'
      );
    }

    // Validate input
    if (!data.accountInfo || !data.disputeReason) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Account info and dispute reason are required.'
      );
    }

    const systemPrompt = `You are an expert at writing FCRA-compliant credit dispute letters. 

Generate a professional, legally sound dispute letter that:
1. States the dispute clearly and factually
2. Includes specific account details
3. Cites FCRA Section 611 (Investigation of disputed information)
4. Requests investigation and deletion if unverifiable
5. Maintains a professional, assertive tone
6. Is formatted for printing and mailing to credit bureaus

Do NOT include threats, emotional language, or false claims.`;

    const userPrompt = `Generate a dispute letter for:

Account Information:
${JSON.stringify(data.accountInfo, null, 2)}

Dispute Reason: ${data.disputeReason}

Client Information:
${JSON.stringify(data.clientInfo, null, 2)}

Bureau: ${data.bureau || 'All Three Bureaus'}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.4,
      max_tokens: 1500,
    });

    const letter = completion.choices[0].message.content;
    const tokensUsed = completion.usage.total_tokens;
    const estimatedCost = calculateCost('gpt-4', tokensUsed);

    // Save letter to Firestore
    const letterRef = await db.collection('disputeLetters').add({
      userId: data.clientId || userId,
      createdBy: userId,
      letter,
      accountInfo: data.accountInfo,
      disputeReason: data.disputeReason,
      bureau: data.bureau,
      status: 'draft',
      tokensUsed,
      estimatedCost,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Log usage
    await logAIUsage(userId, 'generateDisputeLetter', tokensUsed, estimatedCost);

    return {
      success: true,
      letterId: letterRef.id,
      letter,
      tokensUsed,
      estimatedCost
    };

  } catch (error) {
    console.error('Dispute Letter Generation Error:', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError(
      'internal',
      'Dispute letter generation error: ' + error.message
    );
  }
});

/**
 * Lead Scoring
 * 
 * Analyzes lead data and assigns a quality score
 * 
 * Usage:
 * const result = await scoreL ead({
 *   leadData: {...}
 * });
 */
exports.scoreLead = functions.https.onCall(async (data, context) => {
  try {
    const userId = await verifyAuth(context);

    // Rate limiting
    const withinLimit = await checkRateLimit(userId, 200);
    if (!withinLimit) {
      throw new functions.https.HttpsError(
        'resource-exhausted',
        'Rate limit exceeded for lead scoring.'
      );
    }

    // Validate input
    if (!data.leadData) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Lead data is required.'
      );
    }

    const systemPrompt = `You are a sales intelligence AI. Analyze the lead data and provide:
1. Quality Score (0-100)
2. Likelihood to Convert (%)
3. Recommended Actions
4. Risk Factors
5. Ideal Follow-up Timeline

Return response as JSON:
{
  "score": 85,
  "conversionLikelihood": 75,
  "priority": "high",
  "recommendedActions": [],
  "riskFactors": [],
  "followUpTimeline": "24 hours",
  "reasoning": "..."
}`;

    const userPrompt = `Score this lead:
${JSON.stringify(data.leadData, null, 2)}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 800,
      response_format: { type: "json_object" }
    });

    const scoring = JSON.parse(completion.choices[0].message.content);
    const tokensUsed = completion.usage.total_tokens;
    const estimatedCost = calculateCost('gpt-4', tokensUsed);

    // Save scoring to Firestore
    await db.collection('leads').doc(data.leadId).update({
      aiScore: scoring.score,
      aiConversionLikelihood: scoring.conversionLikelihood,
      aiPriority: scoring.priority,
      aiScoredAt: admin.firestore.FieldValue.serverTimestamp(),
      aiScoredBy: userId
    });

    // Log usage
    await logAIUsage(userId, 'scoreLead', tokensUsed, estimatedCost);

    return {
      success: true,
      scoring,
      tokensUsed,
      estimatedCost
    };

  } catch (error) {
    console.error('Lead Scoring Error:', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError(
      'internal',
      'Lead scoring error: ' + error.message
    );
  }
});

/**
 * Parse Credit Report PDF/Text
 * 
 * Extracts structured data from credit report text
 * 
 * Usage:
 * const result = await parseCreditReport({
 *   reportText: "...",
 *   bureau: "Experian"
 * });
 */
exports.parseCreditReport = functions.https.onCall(async (data, context) => {
  try {
    const userId = await verifyAuth(context);

    // Rate limiting
    const withinLimit = await checkRateLimit(userId, 50);
    if (!withinLimit) {
      throw new functions.https.HttpsError(
        'resource-exhausted',
        'Rate limit exceeded for report parsing.'
      );
    }

    // Validate input
    if (!data.reportText) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Report text is required.'
      );
    }

    const systemPrompt = `You are a credit report parsing expert. Extract structured data from the credit report text.

Return JSON with this structure:
{
  "personalInfo": {
    "name": "",
    "address": "",
    "ssn": "***-**-1234",
    "dateOfBirth": ""
  },
  "creditScores": {
    "experian": null,
    "equifax": null,
    "transunion": null
  },
  "accounts": [
    {
      "creditor": "",
      "accountNumber": "",
      "type": "",
      "balance": 0,
      "status": "",
      "dateOpened": "",
      "paymentHistory": ""
    }
  ],
  "inquiries": [],
  "publicRecords": [],
  "collections": []
}`;

    const userPrompt = `Parse this ${data.bureau || ''} credit report:

${data.reportText}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.1,
      max_tokens: 3000,
      response_format: { type: "json_object" }
    });

    const parsedData = JSON.parse(completion.choices[0].message.content);
    const tokensUsed = completion.usage.total_tokens;
    const estimatedCost = calculateCost('gpt-4', tokensUsed);

    // Save parsed report
    const reportRef = await db.collection('creditReports').add({
      userId: data.clientId || userId,
      parsedBy: userId,
      bureau: data.bureau,
      parsedData,
      rawText: data.reportText.substring(0, 1000), // Store first 1000 chars only
      tokensUsed,
      estimatedCost,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Log usage
    await logAIUsage(userId, 'parseCreditReport', tokensUsed, estimatedCost);

    return {
      success: true,
      reportId: reportRef.id,
      parsedData,
      tokensUsed,
      estimatedCost
    };

  } catch (error) {
    console.error('Credit Report Parsing Error:', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError(
      'internal',
      'Report parsing error: ' + error.message
    );
  }
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate estimated cost based on model and tokens
 */
function calculateCost(model, tokens) {
  // Pricing as of 2024 (update as needed)
  const pricing = {
    'gpt-4': {
      input: 0.03 / 1000,  // $0.03 per 1K input tokens
      output: 0.06 / 1000  // $0.06 per 1K output tokens
    },
    'gpt-3.5-turbo': {
      input: 0.0015 / 1000,
      output: 0.002 / 1000
    }
  };

  const modelPricing = pricing[model] || pricing['gpt-4'];
  
  // Rough estimate (assume 50/50 input/output split)
  const avgCostPerToken = (modelPricing.input + modelPricing.output) / 2;
  
  return (tokens * avgCostPerToken).toFixed(4);
}

/**
 * Get AI usage statistics for a user
 */
exports.getAIUsageStats = functions.https.onCall(async (data, context) => {
  try {
    const userId = await verifyAuth(context);

    const now = Date.now();
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);

    const logsSnapshot = await db.collection('aiUsageLogs')
      .where('userId', '==', userId)
      .where('timestamp', '>', new Date(thirtyDaysAgo))
      .get();

    let totalTokens = 0;
    let totalCost = 0;
    const endpointCounts = {};

    logsSnapshot.forEach(doc => {
      const data = doc.data();
      totalTokens += data.tokensUsed;
      totalCost += parseFloat(data.cost);
      endpointCounts[data.endpoint] = (endpointCounts[data.endpoint] || 0) + 1;
    });

    return {
      success: true,
      stats: {
        totalRequests: logsSnapshot.size,
        totalTokens,
        totalCost: totalCost.toFixed(2),
        endpointCounts,
        period: '30 days'
      }
    };

  } catch (error) {
    console.error('Get Usage Stats Error:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to retrieve usage stats: ' + error.message
    );
  }
});

// ============================================================================
// ADMIN ENDPOINTS
// ============================================================================

/**
 * Admin: Get all AI usage for cost tracking
 */
exports.getAllAIUsage = functions.https.onCall(async (data, context) => {
  try {
    const userId = await verifyAuth(context);

    // Check if admin
    const userDoc = await db.collection('users').doc(userId).get();
    const userRole = userDoc.data()?.role;

    if (userRole !== 'admin' && userRole !== 'masterAdmin') {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only admins can access this endpoint.'
      );
    }

    const daysAgo = data.days || 30;
    const cutoffDate = new Date(Date.now() - (daysAgo * 24 * 60 * 60 * 1000));

    const logsSnapshot = await db.collection('aiUsageLogs')
      .where('timestamp', '>', cutoffDate)
      .orderBy('timestamp', 'desc')
      .limit(1000)
      .get();

    const logs = [];
    let totalCost = 0;
    let totalTokens = 0;

    logsSnapshot.forEach(doc => {
      const data = doc.data();
      logs.push({
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate()
      });
      totalCost += parseFloat(data.cost);
      totalTokens += data.tokensUsed;
    });

    return {
      success: true,
      logs,
      summary: {
        totalLogs: logs.length,
        totalCost: totalCost.toFixed(2),
        totalTokens,
        period: `${daysAgo} days`
      }
    };

  } catch (error) {
    console.error('Get All Usage Error:', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError(
      'internal',
      'Failed to retrieve all usage: ' + error.message
    );
  }
});