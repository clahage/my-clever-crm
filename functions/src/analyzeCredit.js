// ============================================================================
// ANALYZE CREDIT - CLOUD FUNCTION
// ============================================================================
// Path: /functions/src/analyzeCredit.js
//
// PURPOSE:
// Analyze client credit report from IDIQ and recommend optimal service plan
// using OpenAI GPT-4 for intelligent analysis and matching
//
// AI FEATURES (5 total):
// 1. Intelligent credit report parsing and negative item classification
// 2. Success probability calculation per plan
// 3. Personalized reasoning generation
// 4. 3-step action plan creation with specific items
// 5. Timeline estimation with confidence intervals
//
// Created By: Chris Lahage - Speedy Credit Repair Inc.
// © 1995-2025 Speedy Credit Repair Inc. All Rights Reserved
// ============================================================================

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { OpenAI } = require('openai');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: functions.config().openai?.key || process.env.OPENAI_API_KEY
});

/**
 * Analyze credit report and recommend optimal service plan
 * @param {Object} data - Request data
 * @param {string} data.contactId - Contact ID
 * @param {string} data.idiqEnrollmentId - IDIQ enrollment ID
 * @param {Object} context - Firebase auth context
 * @returns {Promise<Object>} Analysis result
 */
exports.analyzeCredit = functions.https.onCall(async (data, context) => {
  const startTime = Date.now();

  try {
    // Authentication check
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated to analyze credit reports'
      );
    }

    // Input validation
    if (!data.contactId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'contactId is required'
      );
    }

    if (!data.idiqEnrollmentId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'idiqEnrollmentId is required'
      );
    }

    functions.logger.info('Starting credit analysis', {
      contactId: data.contactId,
      idiqEnrollmentId: data.idiqEnrollmentId,
      userId: context.auth.uid
    });

    // Fetch contact data
    const contactDoc = await db.collection('contacts').doc(data.contactId).get();

    if (!contactDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Contact not found'
      );
    }

    const contact = contactDoc.data();

    // Fetch IDIQ enrollment and credit report
    const enrollmentDoc = await db
      .collection('idiqEnrollments')
      .doc(data.idiqEnrollmentId)
      .get();

    if (!enrollmentDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'IDIQ enrollment not found'
      );
    }

    const enrollment = enrollmentDoc.data();

    if (!enrollment.creditReport) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Credit report not available in enrollment'
      );
    }

    // Parse credit report
    const creditAnalysis = parseCreditReport(enrollment.creditReport);

    // Fetch active service plans
    const plansSnapshot = await db
      .collection('servicePlans')
      .where('status', '==', 'active')
      .get();

    if (plansSnapshot.empty) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'No active service plans available'
      );
    }

    const servicePlans = [];
    plansSnapshot.forEach(doc => {
      servicePlans.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Attempt OpenAI analysis
    let recommendation;
    let aiAnalysisUsed = false;

    try {
      recommendation = await analyzeWithOpenAI(
        contact,
        creditAnalysis,
        servicePlans
      );
      aiAnalysisUsed = true;
      functions.logger.info('OpenAI analysis successful');
    } catch (aiError) {
      functions.logger.warn('OpenAI analysis failed, using fallback', {
        error: aiError.message
      });

      // Fallback to rule-based recommendation
      recommendation = generateRuleBasedRecommendation(
        contact,
        creditAnalysis,
        servicePlans
      );
    }

    // Save recommendation to Firestore
    const recommendationData = {
      contactId: data.contactId,
      idiqEnrollmentId: data.idiqEnrollmentId,
      creditAnalysis,
      recommendation,
      aiAnalysisUsed,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: context.auth.uid,
      status: 'pending',
      metadata: {
        processingTimeMs: Date.now() - startTime,
        openaiModel: aiAnalysisUsed ? 'gpt-4' : null
      }
    };

    const recommendationRef = await db
      .collection('servicePlanRecommendations')
      .add(recommendationData);

    // Update contact with latest recommendation
    await db.collection('contacts').doc(data.contactId).update({
      latestRecommendationId: recommendationRef.id,
      latestRecommendationDate: admin.firestore.FieldValue.serverTimestamp(),
      creditScoreAvg: creditAnalysis.scores.average,
      negativeItemCount: creditAnalysis.summary.totalNegativeItems
    });

    functions.logger.info('Credit analysis completed successfully', {
      recommendationId: recommendationRef.id,
      processingTimeMs: Date.now() - startTime
    });

    return {
      success: true,
      data: {
        recommendationId: recommendationRef.id,
        recommendation,
        creditAnalysis
      },
      error: null
    };

  } catch (error) {
    functions.logger.error('Credit analysis failed', {
      error: error.message,
      stack: error.stack,
      contactId: data.contactId
    });

    // Re-throw HttpsErrors
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    // Wrap other errors
    throw new functions.https.HttpsError(
      'internal',
      'Failed to analyze credit report',
      { originalError: error.message }
    );
  }
});

/**
 * Parse credit report and extract key metrics
 * @param {Object} creditReport - Raw credit report from IDIQ
 * @returns {Object} Parsed credit analysis
 */
function parseCreditReport(creditReport) {
  const analysis = {
    scores: {
      experian: 0,
      equifax: 0,
      transunion: 0,
      average: 0
    },
    negativeItems: {
      collections: [],
      chargeoffs: [],
      latePayments: [],
      publicRecords: [],
      inquiries: [],
      other: []
    },
    summary: {
      totalNegativeItems: 0,
      totalDebt: 0,
      creditUtilization: 0,
      oldestAccountAge: 0,
      averageAccountAge: 0
    },
    details: {
      totalAccounts: 0,
      openAccounts: 0,
      closedAccounts: 0,
      derogatoryAccounts: 0,
      totalCreditLimit: 0,
      totalBalance: 0
    }
  };

  try {
    // Extract credit scores from three bureaus
    if (creditReport.scores) {
      analysis.scores.experian = parseInt(creditReport.scores.experian) || 0;
      analysis.scores.equifax = parseInt(creditReport.scores.equifax) || 0;
      analysis.scores.transunion = parseInt(creditReport.scores.transunion) || 0;

      const validScores = [
        analysis.scores.experian,
        analysis.scores.equifax,
        analysis.scores.transunion
      ].filter(score => score > 0);

      if (validScores.length > 0) {
        analysis.scores.average = Math.round(
          validScores.reduce((a, b) => a + b, 0) / validScores.length
        );
      }
    }

    // Parse negative items
    if (creditReport.negativeItems && Array.isArray(creditReport.negativeItems)) {
      creditReport.negativeItems.forEach(item => {
        const itemData = {
          id: item.id || generateItemId(),
          creditor: item.creditor || 'Unknown',
          accountNumber: item.accountNumber || '',
          type: item.type || 'other',
          status: item.status || '',
          balance: parseFloat(item.balance) || 0,
          openDate: item.openDate || null,
          reportedDate: item.reportedDate || null,
          bureaus: item.bureaus || ['experian', 'equifax', 'transunion']
        };

        // Classify item
        const typeLC = itemData.type.toLowerCase();

        if (typeLC.includes('collection')) {
          analysis.negativeItems.collections.push(itemData);
        } else if (typeLC.includes('charge') || typeLC.includes('chargeoff')) {
          analysis.negativeItems.chargeoffs.push(itemData);
        } else if (typeLC.includes('late') || typeLC.includes('delinquent')) {
          analysis.negativeItems.latePayments.push(itemData);
        } else if (typeLC.includes('bankruptcy') || typeLC.includes('lien') || typeLC.includes('judgment')) {
          analysis.negativeItems.publicRecords.push(itemData);
        } else if (typeLC.includes('inquiry')) {
          analysis.negativeItems.inquiries.push(itemData);
        } else {
          analysis.negativeItems.other.push(itemData);
        }

        // Add to total debt if balance exists
        if (itemData.balance > 0) {
          analysis.summary.totalDebt += itemData.balance;
        }
      });
    }

    // Calculate total negative items
    analysis.summary.totalNegativeItems =
      analysis.negativeItems.collections.length +
      analysis.negativeItems.chargeoffs.length +
      analysis.negativeItems.latePayments.length +
      analysis.negativeItems.publicRecords.length;

    // Parse account details
    if (creditReport.accounts && Array.isArray(creditReport.accounts)) {
      analysis.details.totalAccounts = creditReport.accounts.length;

      creditReport.accounts.forEach(account => {
        if (account.status === 'open') {
          analysis.details.openAccounts++;
        } else if (account.status === 'closed') {
          analysis.details.closedAccounts++;
        }

        if (account.isDerogatory) {
          analysis.details.derogatoryAccounts++;
        }

        const creditLimit = parseFloat(account.creditLimit) || 0;
        const balance = parseFloat(account.balance) || 0;

        analysis.details.totalCreditLimit += creditLimit;
        analysis.details.totalBalance += balance;
      });

      // Calculate credit utilization
      if (analysis.details.totalCreditLimit > 0) {
        analysis.summary.creditUtilization = Math.round(
          (analysis.details.totalBalance / analysis.details.totalCreditLimit) * 100
        );
      }

      // Calculate account ages
      const accountAges = creditReport.accounts
        .map(acc => {
          if (!acc.openDate) return 0;
          const openDate = new Date(acc.openDate);
          const now = new Date();
          return (now - openDate) / (1000 * 60 * 60 * 24 * 365); // years
        })
        .filter(age => age > 0);

      if (accountAges.length > 0) {
        analysis.summary.oldestAccountAge = Math.max(...accountAges);
        analysis.summary.averageAccountAge =
          accountAges.reduce((a, b) => a + b, 0) / accountAges.length;
      }
    }

  } catch (error) {
    functions.logger.error('Error parsing credit report', {
      error: error.message
    });
  }

  return analysis;
}

/**
 * Analyze credit with OpenAI GPT-4
 * @param {Object} contact - Contact data
 * @param {Object} creditAnalysis - Parsed credit analysis
 * @param {Array} servicePlans - Available service plans
 * @returns {Promise<Object>} AI recommendation
 */
async function analyzeWithOpenAI(contact, creditAnalysis, servicePlans) {
  const { scores, summary, negativeItems } = creditAnalysis;

  // Build plan descriptions for prompt
  const planDescriptions = servicePlans.map((plan, idx) => {
    let desc = `${idx + 1}. ${plan.name} ($${plan.monthlyPrice}/mo`;

    if (plan.setupFee > 0) {
      desc += ` + $${plan.setupFee} setup`;
    }

    if (plan.deletionFee > 0) {
      desc += ` + $${plan.deletionFee}/deletion`;
    }

    desc += `) - ${plan.description || 'No description'}`;

    return desc;
  }).join('\n');

  const prompt = `You are a credit repair expert with 30 years of experience. Analyze this client's credit profile and recommend the best service plan.

CLIENT PROFILE:
- Name: ${contact.firstName} ${contact.lastName}
- Credit Scores: Experian ${scores.experian}, Equifax ${scores.equifax}, TransUnion ${scores.transunion} (Avg: ${scores.average})
- Negative Items: ${summary.totalNegativeItems} total
  - Collections: ${negativeItems.collections.length}
  - Charge-offs: ${negativeItems.chargeoffs.length}
  - Late Payments: ${negativeItems.latePayments.length}
  - Public Records: ${negativeItems.publicRecords.length}
- Credit Utilization: ${summary.creditUtilization}%
- Credit Age: ${Math.round(summary.averageAccountAge * 10) / 10} years (oldest: ${Math.round(summary.oldestAccountAge * 10) / 10} years)
- Total Debt: $${summary.totalDebt.toFixed(2)}

AVAILABLE PLANS:
${planDescriptions}

INSTRUCTIONS:
Recommend the BEST plan and provide:
1. Plan ID (use the actual plan ID from the list)
2. Reasoning (2-3 sentences explaining why this plan is best)
3. Alternative plans (2 other viable options with brief justification)
4. 3-step action plan with specific items to dispute, strategies, timelines, and expected impact
5. Estimates: score increase range, timeline in months, success probability percentage

Consider:
- Client's financial situation (debt load, utilization)
- Complexity of negative items
- Urgency implied by credit needs
- Value for money

Respond in valid JSON format ONLY with this structure:
{
  "recommendedPlanId": "plan-id-here",
  "reasoning": "explanation here",
  "alternativePlans": [
    {"planId": "alt-plan-1", "reason": "why this could work"},
    {"planId": "alt-plan-2", "reason": "why this could work"}
  ],
  "actionPlan": [
    {
      "step": 1,
      "title": "Initial Disputes",
      "description": "specific items and strategy",
      "timelineWeeks": 4,
      "expectedImpact": "score increase estimate"
    },
    {
      "step": 2,
      "title": "Follow-up Actions",
      "description": "specific items and strategy",
      "timelineWeeks": 8,
      "expectedImpact": "score increase estimate"
    },
    {
      "step": 3,
      "title": "Final Optimization",
      "description": "specific items and strategy",
      "timelineWeeks": 12,
      "expectedImpact": "score increase estimate"
    }
  ],
  "estimates": {
    "scoreIncreaseMin": 30,
    "scoreIncreaseMax": 100,
    "timelineMonths": 6,
    "successProbability": 85
  }
}`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are an expert credit repair analyst. Always respond with valid JSON only.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 1500,
    response_format: { type: 'json_object' }
  });

  const responseText = completion.choices[0].message.content;
  const aiRecommendation = JSON.parse(responseText);

  // Validate that recommended plan exists
  const recommendedPlan = servicePlans.find(p => p.id === aiRecommendation.recommendedPlanId);

  if (!recommendedPlan) {
    throw new Error(`AI recommended invalid plan ID: ${aiRecommendation.recommendedPlanId}`);
  }

  // Enrich recommendation with plan details
  return {
    ...aiRecommendation,
    recommendedPlan: {
      id: recommendedPlan.id,
      name: recommendedPlan.name,
      monthlyPrice: recommendedPlan.monthlyPrice,
      setupFee: recommendedPlan.setupFee || 0,
      deletionFee: recommendedPlan.deletionFee || 0
    }
  };
}

/**
 * Generate rule-based recommendation as fallback
 * @param {Object} contact - Contact data
 * @param {Object} creditAnalysis - Parsed credit analysis
 * @param {Array} servicePlans - Available service plans
 * @returns {Object} Rule-based recommendation
 */
function generateRuleBasedRecommendation(contact, creditAnalysis, servicePlans) {
  const { scores, summary } = creditAnalysis;
  const avgScore = scores.average;
  const itemCount = summary.totalNegativeItems;

  let recommendedPlanName;

  // Rule-based logic
  if (avgScore < 550 && itemCount > 10) {
    recommendedPlanName = 'premium';
  } else if (avgScore < 620 && itemCount > 5) {
    recommendedPlanName = 'acceleration';
  } else if (avgScore < 650 && itemCount > 3) {
    recommendedPlanName = 'standard';
  } else if (itemCount <= 3) {
    recommendedPlanName = 'diy';
  } else {
    recommendedPlanName = 'hybrid';
  }

  // Find plan by name (case-insensitive partial match)
  const recommendedPlan = servicePlans.find(plan =>
    plan.name.toLowerCase().includes(recommendedPlanName)
  ) || servicePlans[0];

  // Find alternative plans
  const otherPlans = servicePlans.filter(p => p.id !== recommendedPlan.id);
  const alternativePlans = otherPlans.slice(0, 2).map(plan => ({
    planId: plan.id,
    reason: `Alternative option with ${plan.name} pricing structure`
  }));

  // Generate basic action plan
  const actionPlan = [
    {
      step: 1,
      title: 'Initial Credit Report Analysis',
      description: 'Review all three credit reports and identify inaccurate, outdated, or unverifiable items for dispute',
      timelineWeeks: 4,
      expectedImpact: '10-30 point increase'
    },
    {
      step: 2,
      title: 'Dispute Negative Items',
      description: 'File disputes with credit bureaus for identified items and follow up on responses',
      timelineWeeks: 8,
      expectedImpact: '20-50 point increase'
    },
    {
      step: 3,
      title: 'Credit Building & Optimization',
      description: 'Implement credit building strategies and optimize utilization for maximum score improvement',
      timelineWeeks: 12,
      expectedImpact: '30-80 point increase'
    }
  ];

  // Calculate estimates based on score and item count
  let scoreIncreaseMin = 20;
  let scoreIncreaseMax = 60;
  let timelineMonths = 6;
  let successProbability = 75;

  if (itemCount > 10) {
    scoreIncreaseMin = 40;
    scoreIncreaseMax = 120;
    timelineMonths = 12;
    successProbability = 80;
  } else if (itemCount > 5) {
    scoreIncreaseMin = 30;
    scoreIncreaseMax = 90;
    timelineMonths = 9;
    successProbability = 85;
  }

  return {
    recommendedPlanId: recommendedPlan.id,
    reasoning: `Based on your credit profile with an average score of ${avgScore} and ${itemCount} negative items, the ${recommendedPlan.name} plan provides the best balance of service and value for your situation.`,
    alternativePlans,
    actionPlan,
    estimates: {
      scoreIncreaseMin,
      scoreIncreaseMax,
      timelineMonths,
      successProbability
    },
    recommendedPlan: {
      id: recommendedPlan.id,
      name: recommendedPlan.name,
      monthlyPrice: recommendedPlan.monthlyPrice,
      setupFee: recommendedPlan.setupFee || 0,
      deletionFee: recommendedPlan.deletionFee || 0
    }
  };
}

/**
 * Generate unique item ID
 * @returns {string} Unique ID
 */
function generateItemId() {
  return `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
