// ============================================================================
// AI ADVANCED FEATURES - NEXT-LEVEL CRM INTELLIGENCE
// ============================================================================
// Credit Score Simulator, Victory System, Upsell Engine, Referral AI,
// Document OCR, A/B Testing, Bureau Predictor, Compliance Monitor
// ============================================================================

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { onDocumentCreated, onDocumentUpdated } = require('firebase-functions/v2/firestore');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');
const OpenAI = require('openai');

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const OPENAI_API_KEY = defineSecret('OPENAI_API_KEY');

// ============================================================================
// 1. AI CREDIT SCORE SIMULATOR - "WHAT-IF" SCENARIOS
// ============================================================================
exports.simulateCreditScore = onCall(
  { secrets: [OPENAI_API_KEY], memory: '1GiB', timeoutSeconds: 120 },
  async (request) => {
    const { clientId, scenarios } = request.data;

    if (!clientId) {
      throw new HttpsError('invalid-argument', 'Client ID required');
    }

    try {
      // Get current credit report
      const reportQuery = await db.collection('creditReports')
        .where('clientId', '==', clientId)
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get();

      if (reportQuery.empty) {
        throw new HttpsError('not-found', 'No credit report found');
      }

      const report = reportQuery.docs[0].data();
      const { parsedData } = report;

      // Default scenarios if not provided
      const defaultScenarios = scenarios || [
        { type: 'pay_off_card', cardName: 'highest_balance', description: 'Pay off highest balance card' },
        { type: 'remove_collection', count: 1, description: 'Remove 1 collection account' },
        { type: 'reduce_utilization', target: 10, description: 'Reduce utilization to 10%' },
        { type: 'remove_late_payment', count: 1, description: 'Remove 1 late payment' },
        { type: 'add_authorized_user', age: 5, description: 'Become authorized user on 5-year account' },
      ];

      const openai = new OpenAI({ apiKey: OPENAI_API_KEY.value() });

      // Current scores
      const currentScores = parsedData?.scores || { experian: 620, equifax: 615, transunion: 618 };
      const avgScore = Math.round((currentScores.experian + currentScores.equifax + currentScores.transunion) / 3);

      // Account summary
      const accounts = parsedData?.accounts || [];
      const revolvingAccounts = accounts.filter(a =>
        a.accountType?.toLowerCase().includes('revolving') ||
        a.accountType?.toLowerCase().includes('credit')
      );
      const collections = accounts.filter(a => a.accountType?.toLowerCase().includes('collection'));
      const latePayments = accounts.reduce((sum, a) => sum + (a.latePayments30 || 0) + (a.latePayments60 || 0) + (a.latePayments90 || 0), 0);

      const totalCreditLimit = revolvingAccounts.reduce((sum, a) => sum + (a.creditLimit || 0), 0);
      const totalBalance = revolvingAccounts.reduce((sum, a) => sum + (a.balance || 0), 0);
      const currentUtilization = totalCreditLimit > 0 ? (totalBalance / totalCreditLimit * 100) : 0;

      const simulation = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are a credit score simulation expert. You understand exactly how FICO and VantageScore algorithms work and can accurately predict score changes based on credit profile modifications.

SCORING IMPACT RULES:
- Payment history: 35% of score (Late payments: -60 to -110 points each)
- Credit utilization: 30% (Every 10% reduction = +5-20 points)
- Length of credit history: 15%
- Credit mix: 10%
- New credit: 10%
- Collections: -50 to -100 points each
- Paid collections still impact score for 7 years
- Authorized user accounts add age but less impact than own accounts
- Hard inquiries: -5 to -10 points each, fade after 12 months`
          },
          {
            role: 'user',
            content: `Simulate credit score changes for these scenarios:

CURRENT CREDIT PROFILE:
- Average Score: ${avgScore}
- Experian: ${currentScores.experian}, Equifax: ${currentScores.equifax}, TransUnion: ${currentScores.transunion}
- Credit Utilization: ${currentUtilization.toFixed(1)}%
- Total Credit Limit: $${totalCreditLimit.toLocaleString()}
- Total Balances: $${totalBalance.toLocaleString()}
- Collections: ${collections.length}
- Late Payments: ${latePayments}
- Revolving Accounts: ${revolvingAccounts.length}
- Total Accounts: ${accounts.length}

ACCOUNTS DETAIL:
${JSON.stringify(revolvingAccounts.slice(0, 10).map(a => ({
  creditor: a.creditor,
  limit: a.creditLimit,
  balance: a.balance,
  utilization: a.creditLimit > 0 ? Math.round(a.balance / a.creditLimit * 100) : 0
})), null, 2)}

SCENARIOS TO SIMULATE:
${JSON.stringify(defaultScenarios, null, 2)}

Return JSON with predicted scores for each scenario:
{
  "currentScore": {
    "average": number,
    "experian": number,
    "equifax": number,
    "transunion": number
  },
  "scenarios": [
    {
      "id": "scenario_1",
      "description": "string",
      "type": "string",
      "predictedScore": {
        "average": number,
        "experian": number,
        "equifax": number,
        "transunion": number
      },
      "pointsGained": number,
      "timeToReflect": "string (e.g., '30-45 days')",
      "difficulty": "easy|medium|hard",
      "costEstimate": "string or null",
      "steps": ["step 1", "step 2"],
      "confidence": number (0-100)
    }
  ],
  "combinedScenario": {
    "description": "If all actions completed",
    "predictedScore": number,
    "totalPointsGained": number,
    "timeframe": "string"
  },
  "recommendations": [
    {
      "priority": 1,
      "action": "string",
      "reason": "string",
      "expectedGain": number
    }
  ],
  "warnings": ["string"]
}`
          }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      });

      const result = JSON.parse(simulation.choices[0].message.content);

      // Store simulation for tracking
      await db.collection('scoreSimulations').add({
        clientId,
        simulation: result,
        currentScores,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: request.auth?.uid || 'system',
      });

      return {
        success: true,
        ...result,
        creditProfile: {
          utilization: currentUtilization.toFixed(1),
          collections: collections.length,
          latePayments,
          accounts: accounts.length,
        },
        generatedAt: new Date().toISOString(),
      };

    } catch (error) {
      console.error('Score simulation error:', error);
      throw new HttpsError('internal', error.message);
    }
  }
);

// ============================================================================
// 2. VICTORY CELEBRATION SYSTEM - AUTO-CELEBRATE WINS
// ============================================================================
exports.triggerVictoryCelebration = onCall(
  { secrets: [OPENAI_API_KEY], memory: '512MiB', timeoutSeconds: 60 },
  async (request) => {
    const { clientId, victoryType, details } = request.data;

    if (!clientId || !victoryType) {
      throw new HttpsError('invalid-argument', 'Client ID and victory type required');
    }

    try {
      // Get client info
      const clientDoc = await db.collection('contacts').doc(clientId).get();
      if (!clientDoc.exists) {
        throw new HttpsError('not-found', 'Client not found');
      }
      const client = clientDoc.data();

      // Get dispute progress
      const disputesQuery = await db.collection('disputes')
        .where('clientId', '==', clientId)
        .get();

      const disputes = disputesQuery.docs.map(d => d.data());
      const deletedItems = disputes.filter(d => d.result === 'deleted').length;
      const totalDisputes = disputes.length;

      const openai = new OpenAI({ apiKey: OPENAI_API_KEY.value() });

      const victoryMessages = {
        item_deleted: 'A negative item was successfully removed from their credit report',
        score_increase: 'Their credit score increased significantly',
        collection_removed: 'A collection account was deleted',
        dispute_won: 'A dispute was resolved in their favor',
        goal_reached: 'They reached a credit score milestone',
        all_disputes_complete: 'All disputes have been completed',
      };

      const celebration = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are a celebration message creator for a credit repair company. Create exciting, personalized victory messages that make clients feel valued and motivated. Be enthusiastic but professional.`
          },
          {
            role: 'user',
            content: `Create victory celebration content for this client:

CLIENT: ${client.firstName} ${client.lastName}
VICTORY TYPE: ${victoryType}
VICTORY DESCRIPTION: ${victoryMessages[victoryType] || 'Achievement unlocked'}
DETAILS: ${JSON.stringify(details || {})}
PROGRESS: ${deletedItems}/${totalDisputes} items removed

Generate celebration content in JSON:
{
  "emailSubject": "string (exciting subject line with emoji)",
  "emailBody": "string (full HTML email body with celebration message)",
  "smsMessage": "string (short celebratory SMS, max 160 chars)",
  "pushNotification": {
    "title": "string",
    "body": "string"
  },
  "socialShareText": "string (if client wants to share their win)",
  "inAppBanner": {
    "title": "string",
    "message": "string",
    "confettiColor": "string (hex color)"
  },
  "milestoneAchieved": "string or null",
  "nextGoalSuggestion": "string",
  "motivationalQuote": "string"
}`
          }
        ],
        temperature: 0.8,
        response_format: { type: 'json_object' }
      });

      const result = JSON.parse(celebration.choices[0].message.content);

      // Store victory record
      const victoryRef = await db.collection('victories').add({
        clientId,
        victoryType,
        details,
        celebration: result,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        notificationsSent: [],
      });

      // Queue notifications
      await db.collection('notificationQueue').add({
        type: 'victory_celebration',
        clientId,
        victoryId: victoryRef.id,
        channels: ['email', 'sms', 'push', 'in_app'],
        content: result,
        scheduledFor: admin.firestore.FieldValue.serverTimestamp(),
        status: 'pending',
      });

      return {
        success: true,
        victoryId: victoryRef.id,
        ...result,
      };

    } catch (error) {
      console.error('Victory celebration error:', error);
      throw new HttpsError('internal', error.message);
    }
  }
);

// Auto-trigger victory on dispute deletion
exports.onDisputeDeleted = onDocumentUpdated(
  { document: 'disputes/{disputeId}', memory: '512MiB', secrets: [OPENAI_API_KEY] },
  async (event) => {
    const before = event.data.before.data();
    const after = event.data.after.data();

    // Check if result changed to 'deleted'
    if (before.result !== 'deleted' && after.result === 'deleted') {
      const clientId = after.clientId;

      // Trigger celebration (call the function logic directly)
      try {
        const clientDoc = await db.collection('contacts').doc(clientId).get();
        if (clientDoc.exists) {
          const client = clientDoc.data();

          // Create victory record
          await db.collection('victories').add({
            clientId,
            victoryType: 'item_deleted',
            details: {
              creditor: after.creditor,
              accountType: after.accountType,
              disputeId: event.params.disputeId,
            },
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            autoTriggered: true,
          });

          // Queue celebration email
          await db.collection('emailQueue').add({
            to: client.email,
            template: 'victory_celebration',
            data: {
              firstName: client.firstName,
              creditor: after.creditor,
              type: 'item_deleted',
            },
            scheduledFor: admin.firestore.FieldValue.serverTimestamp(),
            status: 'pending',
          });

          console.log(`Victory celebration triggered for client ${clientId}`);
        }
      } catch (error) {
        console.error('Auto victory trigger error:', error);
      }
    }
  }
);

// ============================================================================
// 3. AI UPSELL ENGINE - SMART SERVICE RECOMMENDATIONS
// ============================================================================
exports.generateUpsellRecommendations = onCall(
  { secrets: [OPENAI_API_KEY], memory: '512MiB', timeoutSeconds: 90 },
  async (request) => {
    const { clientId } = request.data;

    if (!clientId) {
      throw new HttpsError('invalid-argument', 'Client ID required');
    }

    try {
      // Get client data
      const clientDoc = await db.collection('contacts').doc(clientId).get();
      if (!clientDoc.exists) {
        throw new HttpsError('not-found', 'Client not found');
      }
      const client = clientDoc.data();

      // Get current services
      const contractsQuery = await db.collection('contracts')
        .where('clientId', '==', clientId)
        .where('status', '==', 'active')
        .get();

      const currentServices = contractsQuery.docs.map(d => d.data());

      // Get credit report
      const reportQuery = await db.collection('creditReports')
        .where('clientId', '==', clientId)
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get();

      const report = reportQuery.empty ? null : reportQuery.docs[0].data();

      // Get dispute progress
      const disputesQuery = await db.collection('disputes')
        .where('clientId', '==', clientId)
        .get();

      const disputes = disputesQuery.docs.map(d => d.data());

      // Get available services
      const servicesQuery = await db.collection('services')
        .where('active', '==', true)
        .get();

      const availableServices = servicesQuery.docs.map(d => ({ id: d.id, ...d.data() }));

      const openai = new OpenAI({ apiKey: OPENAI_API_KEY.value() });

      const upsell = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are an intelligent upsell recommendation engine for a credit repair company. Analyze client profiles and recommend additional services that would genuinely help them. Be helpful, not pushy. Focus on value and timing.

AVAILABLE SERVICE CATEGORIES:
- Credit Repair (basic, standard, premium tiers)
- Credit Monitoring
- Identity Theft Protection
- Debt Management/Consolidation
- Financial Coaching
- Tax Services
- Legal Services (FCRA violations)
- Mortgage Readiness Program
- Auto Loan Assistance
- Business Credit Building`
          },
          {
            role: 'user',
            content: `Analyze this client and recommend upsells:

CLIENT PROFILE:
- Name: ${client.firstName} ${client.lastName}
- Current Plan: ${currentServices.map(s => s.serviceName).join(', ') || 'None'}
- Member Since: ${client.createdAt ? new Date(client.createdAt.toDate ? client.createdAt.toDate() : client.createdAt).toLocaleDateString() : 'Unknown'}
- Goals: ${client.goals || 'Not specified'}

CREDIT SITUATION:
${report?.parsedData ? `
- Score Range: ${report.parsedData.scores?.experian || 'N/A'}
- Collections: ${report.parsedData.accounts?.filter(a => a.accountType?.toLowerCase().includes('collection')).length || 0}
- Total Accounts: ${report.parsedData.accounts?.length || 0}
` : 'No credit report on file'}

DISPUTE PROGRESS:
- Total Disputes: ${disputes.length}
- Completed: ${disputes.filter(d => d.status === 'completed').length}
- Deletions: ${disputes.filter(d => d.result === 'deleted').length}

AVAILABLE SERVICES:
${JSON.stringify(availableServices.slice(0, 10).map(s => ({
  id: s.id,
  name: s.name,
  price: s.price,
  category: s.category
})), null, 2)}

Return upsell recommendations in JSON:
{
  "recommendations": [
    {
      "serviceId": "string or null",
      "serviceName": "string",
      "category": "string",
      "reason": "string (why this helps them)",
      "timing": "now|after_disputes|3_months|6_months",
      "priority": "high|medium|low",
      "estimatedValue": "string (what they'll gain)",
      "suggestedPrice": number,
      "discountEligible": boolean,
      "talkingPoints": ["point 1", "point 2"]
    }
  ],
  "crossSells": [
    {
      "bundle": "string",
      "services": ["service1", "service2"],
      "savings": number,
      "reason": "string"
    }
  ],
  "upgradeOpportunity": {
    "currentTier": "string",
    "suggestedTier": "string",
    "benefits": ["benefit 1", "benefit 2"],
    "priceDifference": number
  },
  "timing": {
    "bestTimeToPresent": "string",
    "trigger": "string (what event should trigger the offer)"
  },
  "doNotRecommend": ["service names that don't fit this client"],
  "clientReadiness": "ready|needs_nurturing|not_ready"
}`
          }
        ],
        temperature: 0.4,
        response_format: { type: 'json_object' }
      });

      const result = JSON.parse(upsell.choices[0].message.content);

      // Store recommendations
      await db.collection('upsellRecommendations').add({
        clientId,
        recommendations: result,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        viewed: false,
        actedOn: null,
      });

      return {
        success: true,
        ...result,
        generatedAt: new Date().toISOString(),
      };

    } catch (error) {
      console.error('Upsell recommendation error:', error);
      throw new HttpsError('internal', error.message);
    }
  }
);

// ============================================================================
// 4. REFERRAL AI PREDICTOR - IDENTIFY LIKELY REFERRERS
// ============================================================================
exports.predictReferralLikelihood = onCall(
  { secrets: [OPENAI_API_KEY], memory: '512MiB', timeoutSeconds: 90 },
  async (request) => {
    const { limit: resultLimit = 50 } = request.data;

    try {
      // Get all active clients
      const clientsQuery = await db.collection('contacts')
        .where('type', '==', 'client')
        .where('status', '==', 'active')
        .limit(resultLimit)
        .get();

      const clientAnalysis = await Promise.all(clientsQuery.docs.map(async (doc) => {
        const client = { id: doc.id, ...doc.data() };

        // Get dispute success rate
        const disputesQuery = await db.collection('disputes')
          .where('clientId', '==', client.id)
          .get();

        const disputes = disputesQuery.docs.map(d => d.data());
        const deletions = disputes.filter(d => d.result === 'deleted').length;
        const successRate = disputes.length > 0 ? (deletions / disputes.length * 100) : 0;

        // Get payment history
        const paymentsQuery = await db.collection('payments')
          .where('clientId', '==', client.id)
          .orderBy('createdAt', 'desc')
          .limit(6)
          .get();

        const payments = paymentsQuery.docs.map(d => d.data());
        const onTimePayments = payments.filter(p => !p.isLate && p.status === 'completed').length;

        // Get engagement (activities, logins, etc.)
        const activitiesQuery = await db.collection('activities')
          .where('clientId', '==', client.id)
          .orderBy('createdAt', 'desc')
          .limit(30)
          .get();

        const recentActivity = activitiesQuery.size;

        // Get existing referrals
        const referralsQuery = await db.collection('contacts')
          .where('referredBy', '==', client.id)
          .get();

        const pastReferrals = referralsQuery.size;

        // Calculate referral score
        let referralScore = 0;

        // Success rate (max 30 points)
        referralScore += Math.min(30, successRate * 0.3);

        // Payment reliability (max 20 points)
        referralScore += (onTimePayments / Math.max(1, payments.length)) * 20;

        // Engagement (max 20 points)
        referralScore += Math.min(20, recentActivity * 0.7);

        // Past referrals (max 20 points)
        referralScore += Math.min(20, pastReferrals * 5);

        // Tenure bonus (max 10 points)
        if (client.createdAt) {
          const tenure = (Date.now() - (client.createdAt.toDate ? client.createdAt.toDate().getTime() : new Date(client.createdAt).getTime())) / (1000 * 60 * 60 * 24 * 30);
          referralScore += Math.min(10, tenure);
        }

        return {
          clientId: client.id,
          clientName: `${client.firstName || ''} ${client.lastName || ''}`.trim(),
          email: client.email,
          phone: client.phone,
          referralScore: Math.round(referralScore),
          likelihood: referralScore >= 70 ? 'high' : referralScore >= 50 ? 'medium' : 'low',
          metrics: {
            disputeSuccessRate: successRate.toFixed(1),
            deletions,
            totalDisputes: disputes.length,
            paymentReliability: payments.length > 0 ? ((onTimePayments / payments.length) * 100).toFixed(0) : 'N/A',
            recentActivity,
            pastReferrals,
          },
          triggers: getReferralTriggers(successRate, deletions, pastReferrals, recentActivity),
        };
      }));

      // Sort by score
      clientAnalysis.sort((a, b) => b.referralScore - a.referralScore);

      // Summary stats
      const highLikelihood = clientAnalysis.filter(c => c.likelihood === 'high').length;
      const mediumLikelihood = clientAnalysis.filter(c => c.likelihood === 'medium').length;

      return {
        success: true,
        clients: clientAnalysis,
        summary: {
          totalAnalyzed: clientAnalysis.length,
          highLikelihood,
          mediumLikelihood,
          lowLikelihood: clientAnalysis.length - highLikelihood - mediumLikelihood,
          topReferralCandidates: clientAnalysis.slice(0, 10).map(c => c.clientName),
        },
        recommendations: [
          { action: 'Launch referral campaign targeting high-likelihood clients', priority: 'high' },
          { action: 'Create personalized referral incentives for top 10 candidates', priority: 'high' },
          { action: 'Send success story requests to clients with 80%+ success rate', priority: 'medium' },
        ],
        generatedAt: new Date().toISOString(),
      };

    } catch (error) {
      console.error('Referral prediction error:', error);
      throw new HttpsError('internal', error.message);
    }
  }
);

function getReferralTriggers(successRate, deletions, pastReferrals, activity) {
  const triggers = [];

  if (successRate > 70) {
    triggers.push('High success rate - great testimonial candidate');
  }
  if (deletions >= 3) {
    triggers.push('Multiple deletions - strong results to share');
  }
  if (pastReferrals > 0) {
    triggers.push('Previous referrer - proven advocate');
  }
  if (activity > 20) {
    triggers.push('Highly engaged - active and invested');
  }

  return triggers.length > 0 ? triggers : ['Standard outreach recommended'];
}

// ============================================================================
// 5. DOCUMENT OCR PIPELINE - EXTRACT DATA FROM SCANS
// ============================================================================
exports.processDocumentOCR = onCall(
  { secrets: [OPENAI_API_KEY], memory: '2GiB', timeoutSeconds: 180 },
  async (request) => {
    const { documentUrl, documentType, clientId } = request.data;

    if (!documentUrl) {
      throw new HttpsError('invalid-argument', 'Document URL required');
    }

    try {
      const openai = new OpenAI({ apiKey: OPENAI_API_KEY.value() });

      // Document type configurations
      const docConfigs = {
        credit_report: {
          prompt: `Extract all data from this credit report image. Include:
            - Personal information (name, address, SSN last 4)
            - Credit scores from all bureaus
            - All accounts with: creditor name, account type, balance, credit limit, payment status, date opened, late payments
            - Collections and public records
            - Inquiries`,
          schema: {
            personalInfo: {},
            scores: {},
            accounts: [],
            collections: [],
            inquiries: [],
          }
        },
        bureau_letter: {
          prompt: `Extract information from this credit bureau response letter:
            - Bureau name
            - Date of letter
            - Reference/case number
            - Items addressed
            - Decision for each item (verified, deleted, updated, under investigation)
            - Next steps mentioned`,
          schema: {
            bureau: '',
            date: '',
            caseNumber: '',
            items: [],
            overallResult: '',
          }
        },
        id_document: {
          prompt: `Extract information from this ID document:
            - Document type (driver's license, passport, state ID)
            - Full name
            - Date of birth
            - Address
            - ID number
            - Expiration date
            - Issue date`,
          schema: {
            documentType: '',
            fullName: '',
            dateOfBirth: '',
            address: '',
            idNumber: '',
            expirationDate: '',
          }
        },
        utility_bill: {
          prompt: `Extract information from this utility bill:
            - Company name
            - Account holder name
            - Service address
            - Bill date
            - Amount due
            - Account number`,
          schema: {
            company: '',
            accountHolder: '',
            serviceAddress: '',
            billDate: '',
            amountDue: '',
            accountNumber: '',
          }
        },
        bank_statement: {
          prompt: `Extract key information from this bank statement:
            - Bank name
            - Account holder name
            - Account number (last 4)
            - Statement period
            - Beginning balance
            - Ending balance
            - Address`,
          schema: {
            bankName: '',
            accountHolder: '',
            accountNumberLast4: '',
            statementPeriod: '',
            beginningBalance: '',
            endingBalance: '',
          }
        },
      };

      const config = docConfigs[documentType] || docConfigs.credit_report;

      // Use GPT-4 Vision to analyze the document
      const analysis = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are an expert document data extractor. Extract information accurately from document images. Return structured JSON data. If information is unclear or missing, use null.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `${config.prompt}\n\nReturn the extracted data as JSON matching this structure:\n${JSON.stringify(config.schema, null, 2)}\n\nAdd a "confidence" field (0-100) and "warnings" array for any issues detected.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: documentUrl,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 4096,
        response_format: { type: 'json_object' }
      });

      const extractedData = JSON.parse(analysis.choices[0].message.content);

      // Store OCR result
      const ocrRef = await db.collection('ocrResults').add({
        clientId: clientId || null,
        documentType,
        documentUrl,
        extractedData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        processedBy: request.auth?.uid || 'system',
        status: 'completed',
      });

      return {
        success: true,
        ocrId: ocrRef.id,
        documentType,
        ...extractedData,
        processingTime: new Date().toISOString(),
      };

    } catch (error) {
      console.error('Document OCR error:', error);
      throw new HttpsError('internal', error.message);
    }
  }
);

// ============================================================================
// 6. DISPUTE LETTER A/B TESTING - TRACK EFFECTIVENESS
// ============================================================================
exports.recordDisputeLetterResult = onCall(
  { memory: '256MiB', timeoutSeconds: 30 },
  async (request) => {
    const { disputeId, templateId, bureauId, result, responseTime } = request.data;

    if (!disputeId || !templateId || !bureauId || !result) {
      throw new HttpsError('invalid-argument', 'Missing required fields');
    }

    try {
      // Record the result
      await db.collection('letterTestResults').add({
        disputeId,
        templateId,
        bureauId,
        result, // 'deleted', 'verified', 'updated', 'pending', 'no_response'
        responseTime, // days
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Update template statistics
      const templateRef = db.collection('disputeTemplates').doc(templateId);
      const templateDoc = await templateRef.get();

      if (templateDoc.exists) {
        const stats = templateDoc.data().stats || {
          totalSent: 0,
          deleted: 0,
          verified: 0,
          updated: 0,
          avgResponseDays: 0,
        };

        stats.totalSent += 1;
        if (result === 'deleted') stats.deleted += 1;
        if (result === 'verified') stats.verified += 1;
        if (result === 'updated') stats.updated += 1;

        // Update average response time
        if (responseTime) {
          stats.avgResponseDays = ((stats.avgResponseDays * (stats.totalSent - 1)) + responseTime) / stats.totalSent;
        }

        await templateRef.update({
          stats,
          lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      return { success: true };

    } catch (error) {
      console.error('Letter result recording error:', error);
      throw new HttpsError('internal', error.message);
    }
  }
);

exports.getLetterEffectivenessReport = onCall(
  { memory: '512MiB', timeoutSeconds: 60 },
  async (request) => {
    const { bureauId, timeframe = 90 } = request.data;

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - timeframe);

      let query = db.collection('letterTestResults')
        .where('createdAt', '>=', cutoffDate)
        .orderBy('createdAt', 'desc');

      if (bureauId) {
        query = query.where('bureauId', '==', bureauId);
      }

      const resultsSnap = await query.get();
      const results = resultsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      // Aggregate by template
      const templateStats = {};
      results.forEach(r => {
        if (!templateStats[r.templateId]) {
          templateStats[r.templateId] = {
            templateId: r.templateId,
            total: 0,
            deleted: 0,
            verified: 0,
            updated: 0,
            noResponse: 0,
            totalResponseDays: 0,
            responsesWithTime: 0,
          };
        }

        const stat = templateStats[r.templateId];
        stat.total += 1;
        if (r.result === 'deleted') stat.deleted += 1;
        if (r.result === 'verified') stat.verified += 1;
        if (r.result === 'updated') stat.updated += 1;
        if (r.result === 'no_response') stat.noResponse += 1;
        if (r.responseTime) {
          stat.totalResponseDays += r.responseTime;
          stat.responsesWithTime += 1;
        }
      });

      // Calculate success rates
      const rankings = Object.values(templateStats).map(stat => ({
        ...stat,
        successRate: stat.total > 0 ? ((stat.deleted / stat.total) * 100).toFixed(1) : 0,
        avgResponseDays: stat.responsesWithTime > 0
          ? (stat.totalResponseDays / stat.responsesWithTime).toFixed(1)
          : 'N/A',
      }));

      // Sort by success rate
      rankings.sort((a, b) => parseFloat(b.successRate) - parseFloat(a.successRate));

      // Bureau breakdown
      const bureauStats = {};
      results.forEach(r => {
        if (!bureauStats[r.bureauId]) {
          bureauStats[r.bureauId] = { total: 0, deleted: 0 };
        }
        bureauStats[r.bureauId].total += 1;
        if (r.result === 'deleted') bureauStats[r.bureauId].deleted += 1;
      });

      return {
        success: true,
        timeframe: `${timeframe} days`,
        totalResults: results.length,
        templateRankings: rankings,
        bureauPerformance: Object.entries(bureauStats).map(([bureau, stats]) => ({
          bureau,
          total: stats.total,
          deleted: stats.deleted,
          successRate: stats.total > 0 ? ((stats.deleted / stats.total) * 100).toFixed(1) : 0,
        })),
        recommendations: generateLetterRecommendations(rankings),
        generatedAt: new Date().toISOString(),
      };

    } catch (error) {
      console.error('Letter effectiveness report error:', error);
      throw new HttpsError('internal', error.message);
    }
  }
);

function generateLetterRecommendations(rankings) {
  const recs = [];

  if (rankings.length > 0) {
    const topTemplate = rankings[0];
    if (parseFloat(topTemplate.successRate) > 50) {
      recs.push({
        type: 'use_more',
        template: topTemplate.templateId,
        reason: `${topTemplate.successRate}% deletion rate - highest performing template`,
      });
    }

    const worstTemplate = rankings[rankings.length - 1];
    if (rankings.length > 1 && parseFloat(worstTemplate.successRate) < 20) {
      recs.push({
        type: 'review',
        template: worstTemplate.templateId,
        reason: `Only ${worstTemplate.successRate}% deletion rate - consider revising`,
      });
    }
  }

  return recs;
}

// ============================================================================
// 7. BUREAU RESPONSE PREDICTOR
// ============================================================================
exports.predictBureauResponse = onCall(
  { secrets: [OPENAI_API_KEY], memory: '512MiB', timeoutSeconds: 60 },
  async (request) => {
    const { disputeId, bureauId, disputeReason, accountType, accountAge, amount } = request.data;

    try {
      // Get historical data for this type of dispute
      const historicalQuery = await db.collection('disputes')
        .where('bureauId', '==', bureauId)
        .where('accountType', '==', accountType)
        .where('status', '==', 'completed')
        .limit(100)
        .get();

      const historical = historicalQuery.docs.map(d => d.data());

      // Calculate stats
      const deleted = historical.filter(d => d.result === 'deleted').length;
      const verified = historical.filter(d => d.result === 'verified').length;
      const avgDays = historical.reduce((sum, d) => {
        if (d.responseDate && d.submittedDate) {
          const diff = (new Date(d.responseDate).getTime() - new Date(d.submittedDate).getTime()) / (1000 * 60 * 60 * 24);
          return sum + diff;
        }
        return sum;
      }, 0) / Math.max(1, historical.length);

      const bureauPatterns = {
        experian: { avgDays: 28, strictness: 'medium', electronicResponse: true },
        equifax: { avgDays: 32, strictness: 'high', electronicResponse: true },
        transunion: { avgDays: 25, strictness: 'low', electronicResponse: true },
      };

      const bureauInfo = bureauPatterns[bureauId?.toLowerCase()] || bureauPatterns.experian;

      const openai = new OpenAI({ apiKey: OPENAI_API_KEY.value() });

      const prediction = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are a credit bureau response prediction expert. Based on historical patterns and dispute characteristics, predict the likely outcome and timing of bureau responses.`
          },
          {
            role: 'user',
            content: `Predict the bureau response for this dispute:

DISPUTE DETAILS:
- Bureau: ${bureauId}
- Account Type: ${accountType}
- Dispute Reason: ${disputeReason}
- Account Age: ${accountAge || 'Unknown'}
- Amount: ${amount ? '$' + amount : 'Unknown'}

HISTORICAL DATA (similar disputes):
- Total: ${historical.length}
- Deleted: ${deleted} (${historical.length > 0 ? ((deleted / historical.length) * 100).toFixed(0) : 0}%)
- Verified: ${verified}
- Average Response Time: ${avgDays.toFixed(0)} days

BUREAU CHARACTERISTICS:
${JSON.stringify(bureauInfo, null, 2)}

Return prediction in JSON:
{
  "predictedOutcome": "deleted|verified|updated|frivolous",
  "confidence": number (0-100),
  "estimatedResponseDays": {
    "minimum": number,
    "expected": number,
    "maximum": number
  },
  "successProbability": number (0-100),
  "factors": {
    "positive": ["factor 1", "factor 2"],
    "negative": ["factor 1", "factor 2"]
  },
  "recommendations": ["rec 1", "rec 2"],
  "escalationThreshold": "string (when to escalate if no response)",
  "alternativeStrategies": ["strategy if verified"]
}`
          }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      });

      const result = JSON.parse(prediction.choices[0].message.content);

      // Store prediction
      if (disputeId) {
        await db.collection('disputes').doc(disputeId).update({
          prediction: result,
          predictionDate: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      return {
        success: true,
        ...result,
        historicalBasis: {
          sampleSize: historical.length,
          deletionRate: historical.length > 0 ? ((deleted / historical.length) * 100).toFixed(1) : 'N/A',
          avgResponseDays: avgDays.toFixed(0),
        },
        generatedAt: new Date().toISOString(),
      };

    } catch (error) {
      console.error('Bureau prediction error:', error);
      throw new HttpsError('internal', error.message);
    }
  }
);

// ============================================================================
// 8. REGULATORY COMPLIANCE MONITOR - FCRA/FDCPA CHECKER
// ============================================================================
exports.checkRegulatoryCompliance = onCall(
  { secrets: [OPENAI_API_KEY], memory: '512MiB', timeoutSeconds: 90 },
  async (request) => {
    const { letterId, letterContent, letterType } = request.data;

    if (!letterContent) {
      throw new HttpsError('invalid-argument', 'Letter content required');
    }

    try {
      const openai = new OpenAI({ apiKey: OPENAI_API_KEY.value() });

      const compliance = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are a credit law compliance expert specializing in FCRA (Fair Credit Reporting Act), FDCPA (Fair Debt Collection Practices Act), and state credit repair laws.

KEY REGULATIONS TO CHECK:
FCRA:
- Section 611: Procedure in case of disputed accuracy
- Section 623: Responsibilities of furnishers
- Section 609: Disclosures to consumers
- Section 605: Requirements relating to information contained in consumer reports

FDCPA:
- Section 809: Validation of debts
- Section 807: False or misleading representations
- Section 806: Harassment or abuse

STATE LAWS:
- Credit repair organization regulations
- Required disclosures
- Prohibited practices
- Cancellation rights`
          },
          {
            role: 'user',
            content: `Analyze this ${letterType || 'dispute'} letter for regulatory compliance:

LETTER CONTENT:
${letterContent}

Check for compliance issues and return JSON:
{
  "overallCompliance": "compliant|minor_issues|major_issues|non_compliant",
  "complianceScore": number (0-100),
  "issues": [
    {
      "severity": "critical|high|medium|low",
      "regulation": "FCRA Section X / FDCPA Section X / State Law",
      "issue": "description of the issue",
      "location": "where in the letter",
      "fix": "how to fix it"
    }
  ],
  "missingElements": [
    {
      "element": "string",
      "required_by": "string",
      "suggestion": "string"
    }
  ],
  "strengths": ["what the letter does well"],
  "suggestedRevisions": [
    {
      "original": "text to change",
      "revised": "suggested replacement",
      "reason": "why"
    }
  ],
  "legalRisks": [
    {
      "risk": "string",
      "probability": "low|medium|high",
      "mitigation": "string"
    }
  ],
  "requiredDisclosures": {
    "present": ["disclosures included"],
    "missing": ["disclosures needed"]
  },
  "recommendations": ["overall recommendations"]
}`
          }
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' }
      });

      const result = JSON.parse(compliance.choices[0].message.content);

      // Store compliance check
      await db.collection('complianceChecks').add({
        letterId: letterId || null,
        letterType,
        result,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        checkedBy: request.auth?.uid || 'system',
      });

      return {
        success: true,
        ...result,
        checkedAt: new Date().toISOString(),
      };

    } catch (error) {
      console.error('Compliance check error:', error);
      throw new HttpsError('internal', error.message);
    }
  }
);

// ============================================================================
// 9. CLIENT PROGRESS TIMELINE GENERATOR
// ============================================================================
exports.generateProgressTimeline = onCall(
  { memory: '512MiB', timeoutSeconds: 60 },
  async (request) => {
    const { clientId } = request.data;

    if (!clientId) {
      throw new HttpsError('invalid-argument', 'Client ID required');
    }

    try {
      // Get all client events
      const [disputes, payments, activities, victories, reports] = await Promise.all([
        db.collection('disputes').where('clientId', '==', clientId).get(),
        db.collection('payments').where('clientId', '==', clientId).get(),
        db.collection('activities').where('clientId', '==', clientId).orderBy('createdAt', 'desc').limit(50).get(),
        db.collection('victories').where('clientId', '==', clientId).get(),
        db.collection('creditReports').where('clientId', '==', clientId).orderBy('createdAt', 'desc').get(),
      ]);

      const timeline = [];

      // Add disputes to timeline
      disputes.docs.forEach(doc => {
        const d = doc.data();
        if (d.createdAt) {
          timeline.push({
            type: 'dispute_created',
            date: d.createdAt.toDate ? d.createdAt.toDate() : new Date(d.createdAt),
            title: `Dispute filed: ${d.creditor}`,
            description: d.disputeReason || 'Dispute initiated',
            icon: 'gavel',
            color: '#3b82f6',
            status: d.status,
          });
        }
        if (d.result === 'deleted' && d.responseDate) {
          timeline.push({
            type: 'item_deleted',
            date: d.responseDate.toDate ? d.responseDate.toDate() : new Date(d.responseDate),
            title: `Item DELETED: ${d.creditor}`,
            description: 'Successfully removed from credit report',
            icon: 'check_circle',
            color: '#22c55e',
            celebration: true,
          });
        }
      });

      // Add credit reports
      reports.docs.forEach(doc => {
        const r = doc.data();
        if (r.createdAt) {
          const scores = r.parsedData?.scores;
          timeline.push({
            type: 'credit_report',
            date: r.createdAt.toDate ? r.createdAt.toDate() : new Date(r.createdAt),
            title: 'Credit Report Pulled',
            description: scores ? `Scores: EX ${scores.experian}, EQ ${scores.equifax}, TU ${scores.transunion}` : 'Report analyzed',
            icon: 'assessment',
            color: '#8b5cf6',
            scores: scores,
          });
        }
      });

      // Add victories
      victories.docs.forEach(doc => {
        const v = doc.data();
        if (v.createdAt) {
          timeline.push({
            type: 'victory',
            date: v.createdAt.toDate ? v.createdAt.toDate() : new Date(v.createdAt),
            title: 'Victory Achieved!',
            description: v.victoryType,
            icon: 'emoji_events',
            color: '#f59e0b',
            celebration: true,
          });
        }
      });

      // Sort by date
      timeline.sort((a, b) => b.date.getTime() - a.date.getTime());

      // Calculate progress metrics
      const totalDisputes = disputes.size;
      const completedDisputes = disputes.docs.filter(d => d.data().status === 'completed').length;
      const deletedItems = disputes.docs.filter(d => d.data().result === 'deleted').length;

      // Score progression
      const scoreProgression = reports.docs
        .map(d => {
          const data = d.data();
          const scores = data.parsedData?.scores;
          if (scores) {
            return {
              date: data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
              average: Math.round((scores.experian + scores.equifax + scores.transunion) / 3),
              experian: scores.experian,
              equifax: scores.equifax,
              transunion: scores.transunion,
            };
          }
          return null;
        })
        .filter(Boolean)
        .sort((a, b) => a.date.getTime() - b.date.getTime());

      const scoreChange = scoreProgression.length >= 2
        ? scoreProgression[scoreProgression.length - 1].average - scoreProgression[0].average
        : 0;

      return {
        success: true,
        clientId,
        timeline: timeline.slice(0, 50), // Last 50 events
        progress: {
          totalDisputes,
          completedDisputes,
          deletedItems,
          deletionRate: totalDisputes > 0 ? ((deletedItems / totalDisputes) * 100).toFixed(1) : 0,
          pendingDisputes: totalDisputes - completedDisputes,
        },
        scoreProgression,
        scoreChange,
        milestones: calculateMilestones(deletedItems, scoreChange, completedDisputes),
        generatedAt: new Date().toISOString(),
      };

    } catch (error) {
      console.error('Timeline generation error:', error);
      throw new HttpsError('internal', error.message);
    }
  }
);

function calculateMilestones(deletions, scoreChange, completed) {
  const milestones = [];

  if (deletions >= 1) milestones.push({ name: 'First Deletion', achieved: true, icon: 'star' });
  if (deletions >= 5) milestones.push({ name: '5 Items Deleted', achieved: true, icon: 'stars' });
  if (deletions >= 10) milestones.push({ name: '10 Items Deleted', achieved: true, icon: 'emoji_events' });
  if (scoreChange >= 50) milestones.push({ name: '50+ Point Increase', achieved: true, icon: 'trending_up' });
  if (scoreChange >= 100) milestones.push({ name: '100+ Point Increase', achieved: true, icon: 'rocket' });
  if (completed >= 3) milestones.push({ name: 'First Round Complete', achieved: true, icon: 'check_circle' });

  // Upcoming milestones
  if (deletions < 5) milestones.push({ name: '5 Items Deleted', achieved: false, progress: `${deletions}/5` });
  if (scoreChange < 50) milestones.push({ name: '50+ Point Increase', achieved: false, progress: `${scoreChange}/50` });

  return milestones;
}

// ============================================================================
// 10. SMART NOTIFICATION ENGINE
// ============================================================================
exports.analyzeNotificationTiming = onCall(
  { secrets: [OPENAI_API_KEY], memory: '512MiB', timeoutSeconds: 60 },
  async (request) => {
    const { clientId, notificationType } = request.data;

    if (!clientId) {
      throw new HttpsError('invalid-argument', 'Client ID required');
    }

    try {
      // Get client activity patterns
      const activitiesQuery = await db.collection('activities')
        .where('clientId', '==', clientId)
        .orderBy('createdAt', 'desc')
        .limit(100)
        .get();

      const activities = activitiesQuery.docs.map(d => {
        const data = d.data();
        return {
          timestamp: data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
          type: data.type,
        };
      });

      // Analyze patterns
      const hourCounts = {};
      const dayCounts = {};

      activities.forEach(a => {
        const hour = a.timestamp.getHours();
        const day = a.timestamp.getDay();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        dayCounts[day] = (dayCounts[day] || 0) + 1;
      });

      // Find peak times
      const peakHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 10;
      const peakDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 1;

      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

      return {
        success: true,
        clientId,
        optimalTiming: {
          preferredHour: parseInt(peakHour),
          preferredDay: dayNames[parseInt(peakDay)],
          timezone: 'America/Los_Angeles', // Would get from client profile
          recommendation: `Best time to reach: ${dayNames[parseInt(peakDay)]} around ${peakHour}:00`,
        },
        activityPattern: {
          hourlyDistribution: hourCounts,
          dailyDistribution: dayCounts,
          totalActivities: activities.length,
          mostActiveHours: Object.entries(hourCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([h, c]) => `${h}:00 (${c} activities)`),
        },
        notificationStrategy: {
          urgentMessages: `Send immediately, but prefer ${peakHour}:00`,
          marketingMessages: `Send on ${dayNames[parseInt(peakDay)]} at ${peakHour}:00`,
          reminders: `Send day before at ${peakHour}:00`,
        },
        generatedAt: new Date().toISOString(),
      };

    } catch (error) {
      console.error('Notification timing error:', error);
      throw new HttpsError('internal', error.message);
    }
  }
);

console.log('🚀 AI Advanced Features loaded successfully!');
