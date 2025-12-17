/**
 * functions/aiService.js
 *
 * SECURE AI Cloud Function Logic (OpenAI + Anthropic)
 *
 * ⭐ MIGRATED TO FIREBASE FUNCTIONS GEN 2 ⭐
 *
 * This file exports Gen 2 callable functions for AI services.
 * All secrets are managed via Firebase Secret Manager using defineSecret().
 *
 * IMPORTANT GEN 2 CHANGES:
 * - Uses onCall from firebase-functions/v2/https
 * - Secrets defined with defineSecret() and accessed via .value()
 * - Functions receive `request` object instead of `(data, context)`
 * - Access data via request.data and auth via request.auth
 * - HttpsError imported from firebase-functions/v2/https
 *
 * Purpose: Move all AI API calls server-side to protect API keys
 *
 * Features:
 * - OpenAI GPT completions
 * - Anthropic Claude completions
 * - Credit analysis and report parsing
 * - Dispute letter generation
 * - Lead scoring
 * - Generic AI completion endpoints
 * - Rate limiting per user
 * - Error handling and logging
 * - Cost tracking
 *
 * Security:
 * - API keys stored in Firebase Secret Manager
 * - Request validation
 * - User authentication required
 * - Rate limiting
 */

// ============================================
// GEN 2 IMPORTS
// ============================================
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');
const OpenAI = require('openai');
const fetch = require('node-fetch');

// ============================================
// FIREBASE ADMIN INITIALIZATION
// ============================================
// Initialize Firebase Admin (if not already initialized)
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// ============================================
// SECRETS CONFIGURATION
// ============================================
const openaiApiKey = defineSecret('OPENAI_API_KEY');

// NOTE: ANTHROPIC_API_KEY is optional - if you want to enable Anthropic support,
// set it as an environment variable in .env.local or use Secret Manager

// ============================================
// OPENAI CLIENT (Lazy-loaded)
// ============================================
// Lazy-load OpenAI client to avoid initialization errors during deployment
let openai = null;
function getOpenAI() {
  if (!openai) {
    const apiKey = openaiApiKey.value();
    if (!apiKey || apiKey === 'YOUR_KEY') {
      throw new HttpsError(
        'failed-precondition',
        'OpenAI API key not configured. Set OPENAI_API_KEY in Firebase Secret Manager'
      );
    }
    openai = new OpenAI({ apiKey });
  }
  return openai;
}

// ============================================
// ANTHROPIC CONFIGURATION (OPTIONAL)
// ============================================
// Anthropic is optional - functions will fallback to OpenAI if not configured
// To enable Anthropic, set ANTHROPIC_API_KEY in .env.local
const anthropicConfig = {
  apiKey: process.env.ANTHROPIC_API_KEY, // Optional - from environment variable
  apiVersion: '2023-06-01',
  baseURL: 'https://api.anthropic.com/v1/messages'
};

// ============================================
// RATE LIMITING HELPERS
// ============================================

async function checkRateLimit(userId, maxRequests = 100) {
  const now = Date.now();
  const oneHourAgo = now - (60 * 60 * 1000);

  const rateLimitRef = db.collection('rateLimits').doc(userId);
  const doc = await rateLimitRef.get();

  if (!doc.exists) {
    await rateLimitRef.set({
      requests: [now],
      totalRequests: 1,
      lastReset: now
    });
    return true;
  }

  const data = doc.data();
  const recentRequests = data.requests.filter(timestamp => timestamp > oneHourAgo);

  if (recentRequests.length >= maxRequests) {
    return false; // Rate limit exceeded
  }

  recentRequests.push(now);

  await rateLimitRef.update({
    requests: recentRequests,
    totalRequests: admin.firestore.FieldValue.increment(1),
    lastRequest: now
  });

  return true;
}

async function logAIUsage(userId, endpoint, tokensUsed, cost) {
  await db.collection('aiUsageLogs').add({
    userId,
    endpoint,
    tokensUsed,
    cost,
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  });
}

// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================

async function verifyAuth(request) {
  if (!request.auth) {
    throw new HttpsError(
      'unauthenticated',
      'User must be authenticated to use AI services.'
    );
  }
  return request.auth.uid;
}

// ============================================
// HELPER FUNCTIONS (Cost Calculation)
// ============================================

function calculateCost(model, tokens) {
  const pricing = {
    'gpt-4': { input: 0.03 / 1000, output: 0.06 / 1000 },
    'gpt-3.5-turbo': { input: 0.0015 / 1000, output: 0.002 / 1000 }
  };
  const modelPricing = pricing[model] || pricing['gpt-4'];
  const avgCostPerToken = (modelPricing.input + modelPricing.output) / 2;
  return (tokens * avgCostPerToken).toFixed(4);
}

function calculateAnthropicCost(model, usage) {
  if (!usage) return '0.0000';
  const pricing = {
    'claude-sonnet-4-20250514': { input: 0.003 / 1000, output: 0.015 / 1000 },
    'claude-opus-4-20250514': { input: 0.015 / 1000, output: 0.075 / 1000 },
    'claude-3-5-sonnet-20241022': { input: 0.003 / 1000, output: 0.015 / 1000 }
  };
  const modelPricing = pricing[model] || pricing['claude-sonnet-4-20250514'];
  const inputCost = (usage.input_tokens || 0) * modelPricing.input;
  const outputCost = (usage.output_tokens || 0) * modelPricing.output;
  return (inputCost + outputCost).toFixed(4);
}

// ============================================
// AI SERVICE ENDPOINTS (GEN 2 CALLABLE FUNCTIONS)
// ============================================

/**
 * Generic AI Completion Endpoint
 */
exports.aiComplete = onCall(
  {
    secrets: [openaiApiKey],
    memory: '512MiB',
    timeoutSeconds: 60
  },
  async (request) => {
    try {
      const userId = await verifyAuth(request);

      const withinLimit = await checkRateLimit(userId, 100);
      if (!withinLimit) {
        throw new HttpsError('resource-exhausted', 'Rate limit exceeded.');
      }

      const data = request.data;

      if (!data.messages || !Array.isArray(data.messages)) {
        throw new HttpsError('invalid-argument', 'Messages array is required.');
      }

      const model = data.model || 'gpt-4';
      const temperature = data.temperature !== undefined ? data.temperature : 0.7;
      const maxTokens = data.maxTokens || 1000;

      const completion = await getOpenAI().chat.completions.create({
        model,
        messages: data.messages,
        temperature,
        max_tokens: maxTokens,
      });

      const response = completion.choices[0].message.content;
      const tokensUsed = completion.usage.total_tokens;
      const estimatedCost = calculateCost(model, tokensUsed);

      await logAIUsage(userId, 'aiComplete', tokensUsed, estimatedCost);

      return { success: true, response, tokensUsed, estimatedCost };

    } catch (error) {
      console.error('AI Complete Error:', error);
      if (error instanceof HttpsError) throw error;
      throw new HttpsError('internal', 'AI service error: ' + error.message);
    }
  }
);

/**
 * Anthropic Claude Completion Endpoint
 * NOTE: This function requires ANTHROPIC_API_KEY to be set in .env.local
 */
exports.anthropicComplete = onCall(
  {
    memory: '512MiB',
    timeoutSeconds: 60
  },
  async (request) => {
    try {
      const userId = await verifyAuth(request);

      const withinLimit = await checkRateLimit(userId, 100);
      if (!withinLimit) {
        throw new HttpsError('resource-exhausted', 'Rate limit exceeded.');
      }

      const data = request.data;

      if (!data.prompt) {
        throw new HttpsError('invalid-argument', 'Prompt is required.');
      }

      const apiKey = anthropicConfig.apiKey;
      if (!apiKey) {
        throw new HttpsError('failed-precondition', 'Anthropic API key not configured. Set ANTHROPIC_API_KEY in .env.local to enable Anthropic support.');
      }

      const model = data.model || 'claude-sonnet-4-20250514';
      const temperature = data.temperature !== undefined ? data.temperature : 0.7;
      const maxTokens = data.maxTokens || 1000;

      const response = await fetch(anthropicConfig.baseURL, {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': anthropicConfig.apiVersion,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model,
          max_tokens: maxTokens,
          temperature,
          messages: [{ role: 'user', content: data.prompt }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Anthropic API error: ${errorData.error?.message || response.statusText}`);
      }

      const result = await response.json();
      const responseText = result.content[0]?.text || '';
      const tokensUsed = (result.usage?.input_tokens || 0) + (result.usage?.output_tokens || 0);
      const estimatedCost = calculateAnthropicCost(model, result.usage);

      await logAIUsage(userId, 'anthropicComplete', tokensUsed, estimatedCost);

      return {
        success: true,
        response: responseText,
        tokensUsed,
        estimatedCost,
        usage: result.usage
      };

    } catch (error) {
      console.error('Anthropic Complete Error:', error);
      if (error instanceof HttpsError) throw error;
      throw new HttpsError('internal', 'Anthropic service error: ' + error.message);
    }
  }
);

/**
 * Generate AI Insights
 * Uses Anthropic if configured, otherwise falls back to OpenAI
 */
exports.generateInsights = onCall(
  {
    secrets: [openaiApiKey],
    memory: '512MiB',
    timeoutSeconds: 90
  },
  async (request) => {
    try {
      const userId = await verifyAuth(request);

      const withinLimit = await checkRateLimit(userId, 100);
      if (!withinLimit) {
        throw new HttpsError('resource-exhausted', 'Rate limit exceeded.');
      }

      const data = request.data;

      if (!data.data) {
        throw new HttpsError('invalid-argument', 'Data is required.');
      }

      const analysisType = data.type || 'general';
      const systemPrompt = `You are an expert data analyst. Provide actionable insights for ${analysisType} analysis.`;
      const userPrompt = `Analyze this data and provide insights:\n${JSON.stringify(data.data, null, 2)}`;

      // Try Anthropic first (if configured), fallback to OpenAI
      let response, tokensUsed, estimatedCost, provider;

      const apiKey = anthropicConfig.apiKey;
      if (apiKey) {
        try {
          const anthropicResponse = await fetch(anthropicConfig.baseURL, {
            method: 'POST',
            headers: {
              'x-api-key': apiKey,
              'anthropic-version': anthropicConfig.apiVersion,
              'content-type': 'application/json',
            },
            body: JSON.stringify({
              model: 'claude-sonnet-4-20250514',
              max_tokens: 2000,
              temperature: 0.5,
              messages: [
                { role: 'user', content: `${systemPrompt}\n\n${userPrompt}` }
              ]
            })
          });

          if (anthropicResponse.ok) {
            const result = await anthropicResponse.json();
            response = result.content[0]?.text;
            tokensUsed = (result.usage?.input_tokens || 0) + (result.usage?.output_tokens || 0);
            estimatedCost = calculateAnthropicCost('claude-sonnet-4-20250514', result.usage);
            provider = 'anthropic';
          }
        } catch (err) {
          console.warn('Anthropic failed, falling back to OpenAI:', err);
        }
      }

      // Fallback to OpenAI if Anthropic failed or not configured
      if (!response) {
        const completion = await getOpenAI().chat.completions.create({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.5,
          max_tokens: 2000,
        });

        response = completion.choices[0].message.content;
        tokensUsed = completion.usage.total_tokens;
        estimatedCost = calculateCost('gpt-4', tokensUsed);
        provider = 'openai';
      }

      await logAIUsage(userId, 'generateInsights', tokensUsed, estimatedCost);

      return {
        success: true,
        insights: response,
        tokensUsed,
        estimatedCost,
        provider
      };

    } catch (error) {
      console.error('Generate Insights Error:', error);
      if (error instanceof HttpsError) throw error;
      throw new HttpsError('internal', 'Insights generation error: ' + error.message);
    }
  }
);

/**
 * Analyze Credit Report
 */
exports.analyzeCreditReport = onCall(
  {
    secrets: [openaiApiKey],
    memory: '1GiB',
    timeoutSeconds: 120
  },
  async (request) => {
    try {
      const userId = await verifyAuth(request);

      const withinLimit = await checkRateLimit(userId, 50);
      if (!withinLimit) {
        throw new HttpsError('resource-exhausted', 'Rate limit exceeded.');
      }

      const data = request.data;

      if (!data.reportData) {
        throw new HttpsError('invalid-argument', 'Report data is required.');
      }

      const systemPrompt = `You are a credit repair expert. Analyze this credit report and provide:
1. Overall Credit Health Score (0-100)
2. Top Issues Affecting Credit
3. Recommended Dispute Items
4. Action Plan for Improvement
5. Estimated Timeline for Score Increase

Return as JSON with these fields: score, issues, recommendations, actionPlan, timeline.`;

      const userPrompt = `Analyze this credit report:\n${JSON.stringify(data.reportData, null, 2)}\n\nClient Info: ${JSON.stringify(data.clientInfo, null, 2)}`;

      const completion = await getOpenAI().chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.2,
        max_tokens: 2500,
        response_format: { type: "json_object" }
      });

      const analysis = JSON.parse(completion.choices[0].message.content);
      const tokensUsed = completion.usage.total_tokens;
      const estimatedCost = calculateCost('gpt-4', tokensUsed);

      // Store analysis in Firestore
      const analysisRef = await db.collection('creditAnalyses').add({
        userId: data.clientId || userId,
        analyzedBy: userId,
        analysis,
        tokensUsed,
        estimatedCost,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

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
      if (error instanceof HttpsError) throw error;
      throw new HttpsError('internal', 'Analysis error: ' + error.message);
    }
  }
);

/**
 * Generate Dispute Letter
 */
exports.generateDisputeLetter = onCall(
  {
    secrets: [openaiApiKey],
    memory: '512MiB',
    timeoutSeconds: 90
  },
  async (request) => {
    try {
      const userId = await verifyAuth(request);

      const withinLimit = await checkRateLimit(userId, 50);
      if (!withinLimit) {
        throw new HttpsError('resource-exhausted', 'Rate limit exceeded.');
      }

      const data = request.data;

      if (!data.disputeItem || !data.bureau || !data.clientInfo) {
        throw new HttpsError(
          'invalid-argument',
          'Dispute item, bureau, and client info are required.'
        );
      }

      const systemPrompt = `You are a professional credit dispute letter writer. Generate a formal, legally-compliant dispute letter to ${data.bureau} credit bureau.

Follow FCRA guidelines. Be professional, factual, and assertive.`;

      const userPrompt = `Generate a dispute letter for:
Client: ${data.clientInfo.name}
Address: ${data.clientInfo.address}
Dispute Item: ${data.disputeItem.description}
Reason: ${data.reason || 'This item is inaccurate and should be removed.'}
Account Number: ${data.disputeItem.accountNumber || 'Unknown'}`;

      const completion = await getOpenAI().chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 1500,
      });

      const letter = completion.choices[0].message.content;
      const tokensUsed = completion.usage.total_tokens;
      const estimatedCost = calculateCost('gpt-4', tokensUsed);

      // Save letter to Firestore
      const letterRef = await db.collection('disputeLetters').add({
        clientId: data.clientId || userId,
        generatedBy: userId,
        bureau: data.bureau,
        disputeItem: data.disputeItem,
        letter,
        tokensUsed,
        estimatedCost,
        status: 'draft',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

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
      if (error instanceof HttpsError) throw error;
      throw new HttpsError('internal', 'Letter generation error: ' + error.message);
    }
  }
);

/**
 * Score Lead
 */
exports.scoreLead = onCall(
  {
    secrets: [openaiApiKey],
    memory: '512MiB',
    timeoutSeconds: 60
  },
  async (request) => {
    try {
      const userId = await verifyAuth(request);

      const withinLimit = await checkRateLimit(userId, 200);
      if (!withinLimit) {
        throw new HttpsError('resource-exhausted', 'Rate limit exceeded.');
      }

      const data = request.data;

      if (!data.leadData) {
        throw new HttpsError('invalid-argument', 'Lead data is required.');
      }

      const systemPrompt = `You are a sales intelligence AI. Analyze the lead data and provide:
1. Quality Score (0-100)
2. Likelihood to Convert (%)
3. Recommended Actions
4. Risk Factors
5. Ideal Follow-up Timeline

Return response as JSON.`;

      const userPrompt = `Score this lead: ${JSON.stringify(data.leadData, null, 2)}`;

      const completion = await getOpenAI().chat.completions.create({
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

      await db.collection('leads').doc(data.leadId).update({
        aiScore: scoring.score,
        aiConversionLikelihood: scoring.conversionLikelihood,
        aiPriority: scoring.priority,
        aiScoredAt: admin.firestore.FieldValue.serverTimestamp(),
        aiScoredBy: userId
      });

      await logAIUsage(userId, 'scoreLead', tokensUsed, estimatedCost);

      return { success: true, scoring, tokensUsed, estimatedCost };

    } catch (error) {
      console.error('Lead Scoring Error:', error);
      if (error instanceof HttpsError) throw error;
      throw new HttpsError('internal', 'Lead scoring error: ' + error.message);
    }
  }
);

/**
 * Parse Credit Report
 */
exports.parseCreditReport = onCall(
  {
    secrets: [openaiApiKey],
    memory: '1GiB',
    timeoutSeconds: 120
  },
  async (request) => {
    try {
      const userId = await verifyAuth(request);

      const withinLimit = await checkRateLimit(userId, 50);
      if (!withinLimit) {
        throw new HttpsError('resource-exhausted', 'Rate limit exceeded.');
      }

      const data = request.data;

      if (!data.reportText) {
        throw new HttpsError('invalid-argument', 'Report text is required.');
      }

      const systemPrompt = `You are a credit report parsing expert. Extract structured data from the credit report text. Return JSON.`;
      const userPrompt = `Parse this ${data.bureau || ''} credit report:\n\n${data.reportText}`;

      const completion = await getOpenAI().chat.completions.create({
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

      const reportRef = await db.collection('creditReports').add({
        userId: data.clientId || userId,
        parsedBy: userId,
        bureau: data.bureau,
        parsedData,
        rawText: data.reportText.substring(0, 1000),
        tokensUsed,
        estimatedCost,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      await logAIUsage(userId, 'parseCreditReport', tokensUsed, estimatedCost);

      return { success: true, reportId: reportRef.id, parsedData, tokensUsed, estimatedCost };

    } catch (error) {
      console.error('Credit Report Parsing Error:', error);
      if (error instanceof HttpsError) throw error;
      throw new HttpsError('internal', 'Report parsing error: ' + error.message);
    }
  }
);

/**
 * Get AI Usage Stats
 */
exports.getAIUsageStats = onCall(
  {
    memory: '256MiB',
    timeoutSeconds: 30
  },
  async (request) => {
    try {
      const userId = await verifyAuth(request);
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
      throw new HttpsError('internal', 'Failed to retrieve usage stats: ' + error.message);
    }
  }
);

/**
 * Get All AI Usage (Admin)
 */
exports.getAllAIUsage = onCall(
  {
    memory: '512MiB',
    timeoutSeconds: 60
  },
  async (request) => {
    try {
      const userId = await verifyAuth(request);
      const userDoc = await db.collection('users').doc(userId).get();
      const userRole = userDoc.data()?.role;

      if (userRole !== 'admin' && userRole !== 'masterAdmin') {
        throw new HttpsError('permission-denied', 'Only admins can access this endpoint.');
      }

      const data = request.data;
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
      throw new HttpsError('internal', 'Failed to retrieve all usage: ' + error.message);
    }
  }
);
