// ============================================================================
// AI CREDIT INTELLIGENCE ENGINE - CORE AI FUNCTIONS
// ============================================================================
// Comprehensive AI-powered credit analysis, prediction, and optimization
// using OpenAI GPT-4 Turbo with structured outputs
// ============================================================================

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');
const OpenAI = require('openai');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const OPENAI_API_KEY = defineSecret('OPENAI_API_KEY');

// ============================================================================
// CREDIT SCORE IMPACT WEIGHTS (Based on FICO model)
// ============================================================================
const SCORE_IMPACT_WEIGHTS = {
  // Payment History (35%)
  paymentHistory: {
    latePayment30: -15,
    latePayment60: -30,
    latePayment90: -50,
    latePayment120Plus: -70,
    collection: -80,
    chargeOff: -100,
    bankruptcy: -150,
    foreclosure: -120,
    repossession: -100,
    judgment: -80,
    taxLien: -70,
  },
  // Credit Utilization (30%)
  utilizationImpact: {
    over90: -50,
    over75: -35,
    over50: -20,
    over30: -10,
    under30: 0,
    under10: 10,
  },
  // Length of Credit History (15%)
  accountAge: {
    perYearPositive: 2,
    closedAccountPenalty: -5,
  },
  // Credit Mix (10%)
  creditMix: {
    hasInstallment: 5,
    hasRevolving: 5,
    hasMortgage: 10,
  },
  // New Credit (10%)
  inquiries: {
    perInquiry: -5,
    maxImpact: -35,
  },
};

// ============================================================================
// BUREAU-SPECIFIC SUCCESS RATES (Historical data patterns)
// ============================================================================
const BUREAU_SUCCESS_PATTERNS = {
  experian: {
    collections: 0.72,
    latePayments: 0.45,
    inquiries: 0.85,
    publicRecords: 0.35,
    chargeOffs: 0.55,
    medicalCollections: 0.82,
  },
  equifax: {
    collections: 0.68,
    latePayments: 0.42,
    inquiries: 0.80,
    publicRecords: 0.38,
    chargeOffs: 0.52,
    medicalCollections: 0.78,
  },
  transunion: {
    collections: 0.70,
    latePayments: 0.48,
    inquiries: 0.82,
    publicRecords: 0.40,
    chargeOffs: 0.58,
    medicalCollections: 0.80,
  },
};

// ============================================================================
// DISPUTE REASON EFFECTIVENESS (Based on FCRA violations)
// ============================================================================
const DISPUTE_REASON_EFFECTIVENESS = {
  'not_mine': 0.75,
  'never_late': 0.65,
  'paid_before_collection': 0.70,
  'incorrect_balance': 0.60,
  'incorrect_date': 0.55,
  'duplicate_account': 0.85,
  'identity_theft': 0.90,
  'mixed_file': 0.88,
  'obsolete': 0.92,
  'unverifiable': 0.78,
  'fcra_violation': 0.82,
  'metro2_error': 0.72,
  'reinsertion': 0.85,
};

// ============================================================================
// 1. AI SCORE PREDICTOR
// ============================================================================
exports.predictCreditScore = onCall(
  { secrets: [OPENAI_API_KEY], memory: '1GiB', timeoutSeconds: 120 },
  async (request) => {
    const { clientId, reportId, scenarioType } = request.data;

    if (!clientId) {
      throw new HttpsError('invalid-argument', 'Client ID is required');
    }

    try {
      // Fetch client's credit report data
      let reportData;
      if (reportId) {
        const reportDoc = await db.collection('creditReports').doc(reportId).get();
        reportData = reportDoc.exists ? reportDoc.data() : null;
      } else {
        // Get most recent report
        const reportsQuery = await db.collection('creditReports')
          .where('clientId', '==', clientId)
          .orderBy('createdAt', 'desc')
          .limit(1)
          .get();
        reportData = reportsQuery.empty ? null : reportsQuery.docs[0].data();
      }

      if (!reportData || !reportData.parsedData) {
        throw new HttpsError('not-found', 'No credit report data found for this client');
      }

      const { parsedData } = reportData;
      const { scores, accounts, collections, inquiries, publicRecords } = parsedData;

      // Get current disputes
      const disputesQuery = await db.collection('disputes')
        .where('clientId', '==', clientId)
        .where('status', 'in', ['pending', 'sent', 'in_progress'])
        .get();

      const activeDisputes = disputesQuery.docs.map(d => d.data());

      // Calculate current negative items
      const negativeItems = categorizeNegativeItems(accounts, collections, publicRecords, inquiries);

      // Get historical success rates for this client
      const historicalQuery = await db.collection('disputes')
        .where('clientId', '==', clientId)
        .where('status', '==', 'completed')
        .get();

      const historicalDisputes = historicalQuery.docs.map(d => d.data());
      const clientSuccessRate = calculateClientSuccessRate(historicalDisputes);

      // Initialize OpenAI
      const openai = new OpenAI({ apiKey: OPENAI_API_KEY.value() });

      // AI-powered prediction with context
      const aiPrediction = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are an expert credit analyst AI. Analyze credit data and predict score outcomes.

            Use FICO scoring factors:
            - Payment History: 35%
            - Credit Utilization: 30%
            - Length of Credit History: 15%
            - Credit Mix: 10%
            - New Credit: 10%

            Consider that disputed items have varying success rates based on type and bureau.
            Medical collections under $500 are no longer scored by FICO 9+.
            Paid collections may still impact score depending on model.

            Respond with JSON only.`
          },
          {
            role: 'user',
            content: `Analyze this credit profile and predict scores:

CURRENT SCORES:
${JSON.stringify(scores, null, 2)}

NEGATIVE ITEMS:
- Late Payments: ${negativeItems.latePayments.length}
- Collections: ${negativeItems.collections.length}
- Charge-offs: ${negativeItems.chargeOffs.length}
- Public Records: ${negativeItems.publicRecords.length}
- Hard Inquiries: ${negativeItems.inquiries.length}

ACTIVE DISPUTES: ${activeDisputes.length}
CLIENT HISTORICAL SUCCESS RATE: ${(clientSuccessRate * 100).toFixed(1)}%

SCENARIO: ${scenarioType || 'all_disputes_successful'}

Predict the following and respond in JSON:
{
  "currentScoreEstimate": { "experian": number, "equifax": number, "transunion": number },
  "predictedScores": {
    "optimistic": { "experian": number, "equifax": number, "transunion": number, "timeline": "X months" },
    "realistic": { "experian": number, "equifax": number, "transunion": number, "timeline": "X months" },
    "conservative": { "experian": number, "equifax": number, "transunion": number, "timeline": "X months" }
  },
  "keyFactors": [
    { "factor": "string", "impact": "positive|negative", "points": number, "recommendation": "string" }
  ],
  "quickWins": [
    { "action": "string", "potentialGain": number, "difficulty": "easy|medium|hard", "timeframe": "string" }
  ],
  "riskFactors": ["string"],
  "confidenceLevel": number
}`
          }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      });

      const aiAnalysis = JSON.parse(aiPrediction.choices[0].message.content);

      // Calculate algorithmic predictions
      const algorithmicPrediction = calculateAlgorithmicPrediction(
        scores,
        negativeItems,
        activeDisputes,
        clientSuccessRate
      );

      // Combine AI and algorithmic predictions
      const combinedPrediction = {
        ...aiAnalysis,
        algorithmicPrediction,
        negativeItemsBreakdown: negativeItems,
        activeDisputesCount: activeDisputes.length,
        historicalSuccessRate: clientSuccessRate,
        generatedAt: new Date().toISOString(),
      };

      // Store prediction for tracking
      await db.collection('scorePredictions').add({
        clientId,
        reportId: reportId || null,
        prediction: combinedPrediction,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: request.auth?.uid || 'system',
      });

      return { success: true, prediction: combinedPrediction };

    } catch (error) {
      console.error('Score prediction error:', error);
      throw new HttpsError('internal', error.message);
    }
  }
);

// ============================================================================
// 2. SMART DISPUTE PRIORITIZATION
// ============================================================================
exports.prioritizeDisputes = onCall(
  { secrets: [OPENAI_API_KEY], memory: '1GiB', timeoutSeconds: 120 },
  async (request) => {
    const { clientId, reportId, maxItems } = request.data;

    if (!clientId) {
      throw new HttpsError('invalid-argument', 'Client ID is required');
    }

    try {
      // Fetch credit report
      let reportData;
      if (reportId) {
        const reportDoc = await db.collection('creditReports').doc(reportId).get();
        reportData = reportDoc.exists ? reportDoc.data() : null;
      } else {
        const reportsQuery = await db.collection('creditReports')
          .where('clientId', '==', clientId)
          .orderBy('createdAt', 'desc')
          .limit(1)
          .get();
        reportData = reportsQuery.empty ? null : reportsQuery.docs[0].data();
      }

      if (!reportData?.parsedData) {
        throw new HttpsError('not-found', 'No credit report data found');
      }

      const { parsedData } = reportData;
      const allItems = extractAllDisputeableItems(parsedData);

      // Calculate priority score for each item
      const prioritizedItems = allItems.map(item => {
        const scoreImpact = calculateItemScoreImpact(item);
        const successProbability = calculateSuccessProbability(item);
        const legalStrength = assessLegalStrength(item);
        const urgency = calculateUrgency(item);

        // Weighted priority score
        const priorityScore = (
          (scoreImpact * 0.35) +
          (successProbability * 100 * 0.30) +
          (legalStrength * 0.20) +
          (urgency * 0.15)
        );

        return {
          ...item,
          analysis: {
            scoreImpact,
            successProbability,
            legalStrength,
            urgency,
            priorityScore,
          },
          recommendedReasons: getRecommendedDisputeReasons(item),
          estimatedTimeToResolve: estimateResolutionTime(item),
        };
      });

      // Sort by priority score
      prioritizedItems.sort((a, b) => b.analysis.priorityScore - a.analysis.priorityScore);

      // Limit if requested
      const finalItems = maxItems ? prioritizedItems.slice(0, maxItems) : prioritizedItems;

      // Group by recommended round
      const rounds = groupIntoRounds(finalItems);

      // AI enhancement for strategy
      const openai = new OpenAI({ apiKey: OPENAI_API_KEY.value() });

      const strategyAnalysis = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are a credit repair strategist. Analyze prioritized dispute items and provide strategic recommendations. Focus on FCRA compliance and maximum score impact.`
          },
          {
            role: 'user',
            content: `Analyze these prioritized items and provide strategic guidance:

TOP PRIORITY ITEMS:
${JSON.stringify(finalItems.slice(0, 10), null, 2)}

TOTAL ITEMS: ${finalItems.length}

Provide JSON response:
{
  "overallStrategy": "string describing the recommended approach",
  "immediateActions": ["action1", "action2"],
  "warningsAndRisks": ["warning1", "warning2"],
  "estimatedTotalScoreGain": number,
  "recommendedDisputeOrder": ["itemId1", "itemId2"],
  "bundlingRecommendations": [
    { "bundle": ["itemId1", "itemId2"], "reason": "string" }
  ]
}`
          }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      });

      const strategy = JSON.parse(strategyAnalysis.choices[0].message.content);

      return {
        success: true,
        prioritizedItems: finalItems,
        rounds,
        strategy,
        totalItems: allItems.length,
        generatedAt: new Date().toISOString(),
      };

    } catch (error) {
      console.error('Prioritization error:', error);
      throw new HttpsError('internal', error.message);
    }
  }
);

// ============================================================================
// 3. BUREAU RESPONSE AUTO-PARSER
// ============================================================================
exports.parseResponseLetter = onCall(
  { secrets: [OPENAI_API_KEY], memory: '2GiB', timeoutSeconds: 180 },
  async (request) => {
    const { documentId, pdfText, clientId } = request.data;

    if (!pdfText) {
      throw new HttpsError('invalid-argument', 'PDF text content is required');
    }

    try {
      const openai = new OpenAI({ apiKey: OPENAI_API_KEY.value() });

      const parsing = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are an expert at parsing credit bureau response letters. Extract all relevant information including:
            - Which bureau sent the response
            - Response date
            - Investigation results for each disputed item
            - Whether items were deleted, verified, updated, or remain unchanged
            - Any reinvestigation rights mentioned
            - Control/reference numbers

            Be extremely accurate as this affects client credit repair progress.`
          },
          {
            role: 'user',
            content: `Parse this bureau response letter and extract all dispute results:

${pdfText}

Respond with JSON:
{
  "bureau": "experian|equifax|transunion",
  "responseDate": "YYYY-MM-DD",
  "referenceNumber": "string or null",
  "overallSummary": "string",
  "disputeResults": [
    {
      "creditorName": "string",
      "accountNumber": "string (last 4 if partial)",
      "originalDispute": "string describing what was disputed",
      "result": "deleted|verified|updated|under_investigation|pending",
      "resultDetails": "string with specific changes or verification details",
      "newInformation": "any updated account information",
      "scoreImpact": "positive|negative|neutral"
    }
  ],
  "deletedItems": {
    "count": number,
    "items": ["item descriptions"]
  },
  "verifiedItems": {
    "count": number,
    "items": ["item descriptions"]
  },
  "updatedItems": {
    "count": number,
    "items": ["item descriptions with changes"]
  },
  "nextSteps": ["recommended actions"],
  "reinvestigationRights": "boolean",
  "deadlines": ["any mentioned deadlines"],
  "confidence": number
}`
          }
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' }
      });

      const parsedResponse = JSON.parse(parsing.choices[0].message.content);

      // Auto-update disputes based on parsed results
      if (clientId && parsedResponse.disputeResults?.length > 0) {
        await updateDisputesFromResponse(clientId, parsedResponse);
      }

      // Store parsed response
      const responseDoc = await db.collection('bureauResponses').add({
        documentId: documentId || null,
        clientId: clientId || null,
        parsedData: parsedResponse,
        rawTextLength: pdfText.length,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: request.auth?.uid || 'system',
      });

      return {
        success: true,
        responseId: responseDoc.id,
        parsedResponse,
        autoUpdatedDisputes: parsedResponse.disputeResults?.length || 0,
      };

    } catch (error) {
      console.error('Response parsing error:', error);
      throw new HttpsError('internal', error.message);
    }
  }
);

// ============================================================================
// 4. PREDICTIVE SUCCESS SCORING
// ============================================================================
exports.predictDisputeSuccess = onCall(
  { secrets: [OPENAI_API_KEY], memory: '1GiB', timeoutSeconds: 90 },
  async (request) => {
    const { items, clientId, bureau } = request.data;

    if (!items || !Array.isArray(items)) {
      throw new HttpsError('invalid-argument', 'Items array is required');
    }

    try {
      // Get historical data for better predictions
      const historicalQuery = await db.collection('disputes')
        .where('status', '==', 'completed')
        .limit(1000)
        .get();

      const historicalData = historicalQuery.docs.map(d => d.data());
      const successRates = calculateHistoricalSuccessRates(historicalData);

      // Analyze each item
      const predictions = items.map(item => {
        const baseSuccessRate = getBaseSuccessRate(item, bureau, successRates);
        const factors = analyzeSuccessFactors(item);

        // Adjust based on factors
        let adjustedRate = baseSuccessRate;
        factors.forEach(factor => {
          adjustedRate *= factor.multiplier;
        });

        // Cap between 5% and 95%
        adjustedRate = Math.min(0.95, Math.max(0.05, adjustedRate));

        return {
          item,
          successProbability: adjustedRate,
          confidenceLevel: calculateConfidence(item, historicalData.length),
          factors,
          recommendedApproach: getRecommendedApproach(item, adjustedRate),
          estimatedDays: estimateResolutionDays(item, bureau),
        };
      });

      // Calculate aggregate statistics
      const aggregateStats = {
        averageSuccessRate: predictions.reduce((sum, p) => sum + p.successProbability, 0) / predictions.length,
        highConfidenceItems: predictions.filter(p => p.successProbability > 0.7).length,
        lowConfidenceItems: predictions.filter(p => p.successProbability < 0.3).length,
        totalEstimatedDeletions: predictions.reduce((sum, p) => sum + p.successProbability, 0),
      };

      return {
        success: true,
        predictions,
        aggregateStats,
        historicalDataPoints: historicalData.length,
        generatedAt: new Date().toISOString(),
      };

    } catch (error) {
      console.error('Success prediction error:', error);
      throw new HttpsError('internal', error.message);
    }
  }
);

// ============================================================================
// 5. CREDIT REPORT ANOMALY DETECTOR
// ============================================================================
exports.detectAnomalies = onCall(
  { secrets: [OPENAI_API_KEY], memory: '1GiB', timeoutSeconds: 120 },
  async (request) => {
    const { clientId, reportId } = request.data;

    if (!clientId) {
      throw new HttpsError('invalid-argument', 'Client ID is required');
    }

    try {
      // Fetch report
      let reportData;
      if (reportId) {
        const reportDoc = await db.collection('creditReports').doc(reportId).get();
        reportData = reportDoc.exists ? reportDoc.data() : null;
      } else {
        const reportsQuery = await db.collection('creditReports')
          .where('clientId', '==', clientId)
          .orderBy('createdAt', 'desc')
          .limit(1)
          .get();
        reportData = reportsQuery.empty ? null : reportsQuery.docs[0].data();
      }

      if (!reportData?.parsedData) {
        throw new HttpsError('not-found', 'No credit report data found');
      }

      const { parsedData } = reportData;
      const anomalies = [];

      // Check for duplicate accounts
      const duplicates = findDuplicateAccounts(parsedData.accounts || []);
      duplicates.forEach(dup => {
        anomalies.push({
          type: 'duplicate_account',
          severity: 'high',
          description: `Possible duplicate: ${dup.creditor} appears ${dup.count} times`,
          items: dup.accounts,
          recommendedAction: 'Dispute as duplicate reporting',
          legalBasis: 'FCRA Section 611 - Accuracy requirement',
        });
      });

      // Check for impossible dates
      const dateAnomalies = findDateAnomalies(parsedData);
      anomalies.push(...dateAnomalies);

      // Check for mixed file indicators
      const mixedFileIndicators = detectMixedFile(parsedData);
      anomalies.push(...mixedFileIndicators);

      // Check for obsolete items (>7 years for most, >10 for bankruptcy)
      const obsoleteItems = findObsoleteItems(parsedData);
      anomalies.push(...obsoleteItems);

      // Check for re-aged accounts
      const reAgedAccounts = detectReAging(parsedData);
      anomalies.push(...reAgedAccounts);

      // Check balance inconsistencies
      const balanceIssues = findBalanceInconsistencies(parsedData);
      anomalies.push(...balanceIssues);

      // AI-powered deep analysis
      const openai = new OpenAI({ apiKey: OPENAI_API_KEY.value() });

      const aiAnalysis = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are a forensic credit analyst expert at finding errors, inconsistencies, and FCRA violations in credit reports. Look for:
            - Metro 2 format errors
            - Furnisher compliance issues
            - Statute of limitations violations
            - Identity theft indicators
            - Calculation errors
            - Reporting timeline violations`
          },
          {
            role: 'user',
            content: `Analyze this credit report for anomalies and errors:

PERSONAL INFO:
${JSON.stringify(parsedData.personalInfo || {}, null, 2)}

ACCOUNTS (${(parsedData.accounts || []).length} total):
${JSON.stringify((parsedData.accounts || []).slice(0, 20), null, 2)}

COLLECTIONS (${(parsedData.collections || []).length} total):
${JSON.stringify(parsedData.collections || [], null, 2)}

INQUIRIES (${(parsedData.inquiries || []).length} total):
${JSON.stringify(parsedData.inquiries || [], null, 2)}

PUBLIC RECORDS:
${JSON.stringify(parsedData.publicRecords || [], null, 2)}

Find ALL anomalies and respond with JSON:
{
  "anomalies": [
    {
      "type": "string",
      "severity": "critical|high|medium|low",
      "description": "detailed description",
      "affectedItems": ["item identifiers"],
      "legalBasis": "applicable law or regulation",
      "recommendedDispute": "dispute strategy",
      "estimatedScoreImpact": number
    }
  ],
  "identityTheftRisk": {
    "level": "none|low|medium|high|critical",
    "indicators": ["indicator1", "indicator2"],
    "recommendedActions": ["action1", "action2"]
  },
  "overallReportQuality": number,
  "estimatedErrorRate": number,
  "prioritizedActions": ["action1", "action2", "action3"]
}`
          }
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' }
      });

      const aiAnomalies = JSON.parse(aiAnalysis.choices[0].message.content);

      // Merge rule-based and AI anomalies
      const allAnomalies = [
        ...anomalies,
        ...(aiAnomalies.anomalies || []),
      ];

      // Deduplicate and sort by severity
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const uniqueAnomalies = deduplicateAnomalies(allAnomalies)
        .sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

      const result = {
        anomalies: uniqueAnomalies,
        identityTheftRisk: aiAnomalies.identityTheftRisk,
        overallReportQuality: aiAnomalies.overallReportQuality,
        estimatedErrorRate: aiAnomalies.estimatedErrorRate,
        prioritizedActions: aiAnomalies.prioritizedActions,
        totalAnomaliesFound: uniqueAnomalies.length,
        criticalIssues: uniqueAnomalies.filter(a => a.severity === 'critical').length,
        generatedAt: new Date().toISOString(),
      };

      // Store anomaly report
      await db.collection('anomalyReports').add({
        clientId,
        reportId: reportId || null,
        results: result,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return { success: true, ...result };

    } catch (error) {
      console.error('Anomaly detection error:', error);
      throw new HttpsError('internal', error.message);
    }
  }
);

// ============================================================================
// 6. LEGAL COMPLIANCE GUARDIAN
// ============================================================================
exports.checkCompliance = onCall(
  { secrets: [OPENAI_API_KEY], memory: '512MiB', timeoutSeconds: 60 },
  async (request) => {
    const { letterContent, disputeType, bureau, state } = request.data;

    if (!letterContent) {
      throw new HttpsError('invalid-argument', 'Letter content is required');
    }

    try {
      const openai = new OpenAI({ apiKey: OPENAI_API_KEY.value() });

      const compliance = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are a legal compliance expert specializing in credit repair laws. Check letters for compliance with:
            - Fair Credit Reporting Act (FCRA)
            - Fair Debt Collection Practices Act (FDCPA)
            - Credit Repair Organizations Act (CROA)
            - State-specific credit repair laws
            - FTC guidelines

            Flag any potential legal issues, required disclosures, or prohibited practices.`
          },
          {
            role: 'user',
            content: `Check this dispute letter for legal compliance:

LETTER CONTENT:
${letterContent}

DISPUTE TYPE: ${disputeType || 'general'}
TARGET BUREAU: ${bureau || 'unknown'}
CLIENT STATE: ${state || 'unknown'}

Respond with JSON:
{
  "isCompliant": boolean,
  "overallRisk": "low|medium|high",
  "issues": [
    {
      "law": "FCRA|FDCPA|CROA|State Law",
      "section": "specific section number",
      "issue": "description of the issue",
      "severity": "warning|violation|critical",
      "recommendation": "how to fix"
    }
  ],
  "requiredDisclosures": ["disclosure1", "disclosure2"],
  "suggestedImprovements": ["improvement1", "improvement2"],
  "legalStrength": number,
  "effectivenessScore": number
}`
          }
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' }
      });

      return {
        success: true,
        compliance: JSON.parse(compliance.choices[0].message.content),
      };

    } catch (error) {
      console.error('Compliance check error:', error);
      throw new HttpsError('internal', error.message);
    }
  }
);

// ============================================================================
// 7. AI GOODWILL LETTER GENERATOR
// ============================================================================
exports.generateGoodwillLetter = onCall(
  { secrets: [OPENAI_API_KEY], memory: '512MiB', timeoutSeconds: 90 },
  async (request) => {
    const {
      clientInfo,
      creditorName,
      accountDetails,
      circumstance,
      paymentHistory,
      tone
    } = request.data;

    if (!clientInfo || !creditorName) {
      throw new HttpsError('invalid-argument', 'Client info and creditor name required');
    }

    try {
      const openai = new OpenAI({ apiKey: OPENAI_API_KEY.value() });

      const letter = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are an expert at writing persuasive goodwill letters to creditors. Create letters that:
            - Are sincere and take responsibility appropriately
            - Explain circumstances without making excuses
            - Highlight positive payment history
            - Make a specific, reasonable request
            - Are professional yet personal
            - Reference the long-term customer relationship when applicable`
          },
          {
            role: 'user',
            content: `Generate a goodwill letter with these details:

CLIENT: ${clientInfo.name}
CREDITOR: ${creditorName}
ACCOUNT: ${accountDetails?.accountNumber || 'On file'}
ACCOUNT TYPE: ${accountDetails?.type || 'Credit account'}

CIRCUMSTANCE: ${circumstance || 'temporary financial hardship'}

PAYMENT HISTORY: ${paymentHistory || 'Generally good with one late payment'}

TONE: ${tone || 'sincere and professional'}

Generate the complete letter and respond with JSON:
{
  "letter": "full letter text with proper formatting",
  "subject": "suggested subject line",
  "tips": ["tip1 for sending", "tip2"],
  "alternativeApproaches": ["approach1", "approach2"],
  "estimatedSuccessRate": number,
  "bestTimeToSend": "recommendation",
  "followUpStrategy": "string"
}`
          }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      });

      return {
        success: true,
        ...JSON.parse(letter.choices[0].message.content),
      };

    } catch (error) {
      console.error('Goodwill letter error:', error);
      throw new HttpsError('internal', error.message);
    }
  }
);

// ============================================================================
// 8. CREDITOR NEGOTIATION ASSISTANT
// ============================================================================
exports.generateNegotiationScript = onCall(
  { secrets: [OPENAI_API_KEY], memory: '512MiB', timeoutSeconds: 90 },
  async (request) => {
    const {
      creditorName,
      debtAmount,
      debtAge,
      accountType,
      clientBudget,
      negotiationType
    } = request.data;

    if (!creditorName || !debtAmount) {
      throw new HttpsError('invalid-argument', 'Creditor and debt amount required');
    }

    try {
      const openai = new OpenAI({ apiKey: OPENAI_API_KEY.value() });

      const script = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are a debt negotiation expert. Create negotiation scripts for:
            - Pay-for-delete agreements
            - Settlement offers
            - Payment plan negotiations
            - Re-aging prevention
            - Validation requests

            Scripts should be conversational, include objection handling, and know when to escalate.`
          },
          {
            role: 'user',
            content: `Create a negotiation script for:

CREDITOR: ${creditorName}
DEBT AMOUNT: $${debtAmount}
DEBT AGE: ${debtAge || 'unknown'}
ACCOUNT TYPE: ${accountType || 'collection'}
CLIENT BUDGET: $${clientBudget || 'flexible'}
NEGOTIATION TYPE: ${negotiationType || 'pay-for-delete'}

Respond with JSON:
{
  "openingScript": "what to say when they answer",
  "keyTalkingPoints": ["point1", "point2"],
  "objectionHandling": {
    "they_say_no": "response",
    "they_want_full_amount": "response",
    "they_cant_delete": "response",
    "they_need_supervisor": "response"
  },
  "settlementRange": {
    "ideal": number,
    "acceptable": number,
    "walkAway": number
  },
  "closingScript": "how to finalize agreement",
  "writtenConfirmationRequest": "what to request in writing",
  "redFlags": ["warning1", "warning2"],
  "legalProtections": ["protection1", "protection2"],
  "followUpPlan": "string"
}`
          }
        ],
        temperature: 0.5,
        response_format: { type: 'json_object' }
      });

      return {
        success: true,
        ...JSON.parse(script.choices[0].message.content),
      };

    } catch (error) {
      console.error('Negotiation script error:', error);
      throw new HttpsError('internal', error.message);
    }
  }
);

// ============================================================================
// 9. MULTI-ROUND STRATEGY PLANNER
// ============================================================================
exports.createStrategyPlan = onCall(
  { secrets: [OPENAI_API_KEY], memory: '1GiB', timeoutSeconds: 180 },
  async (request) => {
    const { clientId, targetScore, timeframeMonths } = request.data;

    if (!clientId) {
      throw new HttpsError('invalid-argument', 'Client ID is required');
    }

    try {
      // Fetch all client data
      const [reportQuery, disputeQuery, clientDoc] = await Promise.all([
        db.collection('creditReports')
          .where('clientId', '==', clientId)
          .orderBy('createdAt', 'desc')
          .limit(1)
          .get(),
        db.collection('disputes')
          .where('clientId', '==', clientId)
          .get(),
        db.collection('contacts').doc(clientId).get(),
      ]);

      const reportData = reportQuery.empty ? null : reportQuery.docs[0].data();
      const disputes = disputeQuery.docs.map(d => ({ id: d.id, ...d.data() }));
      const clientData = clientDoc.exists ? clientDoc.data() : null;

      if (!reportData?.parsedData) {
        throw new HttpsError('not-found', 'No credit report found');
      }

      const openai = new OpenAI({ apiKey: OPENAI_API_KEY.value() });

      const strategy = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are a master credit repair strategist. Create comprehensive multi-round dispute strategies that:
            - Prioritize items by score impact
            - Time disputes strategically (bureaus, creditor types)
            - Plan for expected objections and reinvestigations
            - Include parallel strategies (goodwill, negotiation, validation)
            - Set realistic milestones and checkpoints
            - Account for bureau processing times (30-45 days)`
          },
          {
            role: 'user',
            content: `Create a comprehensive credit repair strategy:

CLIENT INFO:
${JSON.stringify(clientData || {}, null, 2)}

CURRENT SCORES:
${JSON.stringify(reportData.parsedData.scores || {}, null, 2)}

TARGET SCORE: ${targetScore || 720}
TIMEFRAME: ${timeframeMonths || 6} months

NEGATIVE ITEMS:
- Accounts: ${(reportData.parsedData.accounts || []).filter(a => a.status === 'negative' || a.paymentStatus?.includes('Late')).length}
- Collections: ${(reportData.parsedData.collections || []).length}
- Inquiries: ${(reportData.parsedData.inquiries || []).length}
- Public Records: ${(reportData.parsedData.publicRecords || []).length}

EXISTING DISPUTES: ${disputes.length}
COMPLETED DISPUTES: ${disputes.filter(d => d.status === 'completed').length}
SUCCESS RATE: ${disputes.length > 0 ? ((disputes.filter(d => d.result === 'deleted').length / disputes.filter(d => d.status === 'completed').length) * 100).toFixed(1) : 0}%

Create a detailed multi-round strategy with JSON:
{
  "overview": {
    "currentScoreAverage": number,
    "targetScore": number,
    "estimatedTimeToTarget": "X months",
    "confidenceLevel": number,
    "totalItemsToAddress": number
  },
  "rounds": [
    {
      "roundNumber": 1,
      "name": "Round name",
      "startWeek": 1,
      "duration": "X weeks",
      "focus": "what this round targets",
      "items": [
        {
          "type": "account|collection|inquiry|publicRecord",
          "description": "item description",
          "bureau": ["experian", "equifax", "transunion"],
          "strategy": "dispute|goodwill|negotiate|validate",
          "expectedOutcome": "string",
          "successProbability": number
        }
      ],
      "expectedScoreGain": number,
      "checkpointGoals": ["goal1", "goal2"],
      "contingencyPlan": "if this doesn't work, then..."
    }
  ],
  "parallelStrategies": [
    {
      "strategy": "string",
      "description": "what to do alongside disputes",
      "timing": "when to execute",
      "expectedBenefit": "string"
    }
  ],
  "milestones": [
    {
      "week": number,
      "expectedScore": number,
      "keyAchievements": ["achievement1"]
    }
  ],
  "riskFactors": ["risk1", "risk2"],
  "successMetrics": ["metric1", "metric2"],
  "weeklyActionPlan": {
    "week1": ["action1", "action2"],
    "week2": ["action1", "action2"]
  }
}`
          }
        ],
        temperature: 0.4,
        response_format: { type: 'json_object' }
      });

      const strategyPlan = JSON.parse(strategy.choices[0].message.content);

      // Store strategy plan
      const planDoc = await db.collection('strategyPlans').add({
        clientId,
        plan: strategyPlan,
        targetScore: targetScore || 720,
        timeframeMonths: timeframeMonths || 6,
        status: 'active',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: request.auth?.uid || 'system',
      });

      return {
        success: true,
        planId: planDoc.id,
        ...strategyPlan,
      };

    } catch (error) {
      console.error('Strategy planning error:', error);
      throw new HttpsError('internal', error.message);
    }
  }
);

// ============================================================================
// 10. TIMELINE PREDICTOR
// ============================================================================
exports.predictTimeline = onCall(
  { secrets: [OPENAI_API_KEY], memory: '512MiB', timeoutSeconds: 60 },
  async (request) => {
    const { clientId, targetScore } = request.data;

    if (!clientId) {
      throw new HttpsError('invalid-argument', 'Client ID is required');
    }

    try {
      // Fetch client data
      const reportQuery = await db.collection('creditReports')
        .where('clientId', '==', clientId)
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get();

      if (reportQuery.empty) {
        throw new HttpsError('not-found', 'No credit report found');
      }

      const reportData = reportQuery.docs[0].data();
      const { parsedData } = reportData;

      // Calculate based on item types and counts
      const negativeItems = {
        collections: (parsedData.collections || []).length,
        latePayments: (parsedData.accounts || []).filter(a =>
          a.paymentStatus?.includes('Late') || a.status === 'negative'
        ).length,
        inquiries: (parsedData.inquiries || []).length,
        publicRecords: (parsedData.publicRecords || []).length,
      };

      const currentScore = Math.round(
        ((parsedData.scores?.experian || 0) +
         (parsedData.scores?.equifax || 0) +
         (parsedData.scores?.transunion || 0)) / 3
      );

      const target = targetScore || 720;
      const pointsNeeded = target - currentScore;

      // Estimate based on historical patterns
      const roundsNeeded = Math.ceil(
        (negativeItems.collections + negativeItems.latePayments) / 5
      );
      const monthsEstimate = roundsNeeded * 1.5; // ~45 days per round

      const timeline = {
        currentScore,
        targetScore: target,
        pointsNeeded,
        negativeItemsCount: Object.values(negativeItems).reduce((a, b) => a + b, 0),
        estimatedRounds: roundsNeeded,
        estimatedMonths: {
          optimistic: Math.max(1, monthsEstimate * 0.7),
          realistic: monthsEstimate,
          conservative: monthsEstimate * 1.5,
        },
        milestones: generateMilestones(currentScore, target, monthsEstimate),
        factors: analyzeTimelineFactors(negativeItems, parsedData),
      };

      return { success: true, timeline };

    } catch (error) {
      console.error('Timeline prediction error:', error);
      throw new HttpsError('internal', error.message);
    }
  }
);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function categorizeNegativeItems(accounts, collections, publicRecords, inquiries) {
  return {
    latePayments: (accounts || []).filter(a =>
      a.paymentStatus?.includes('Late') ||
      a.status === 'negative' ||
      a.paymentHistory?.includes('30') ||
      a.paymentHistory?.includes('60') ||
      a.paymentHistory?.includes('90')
    ),
    collections: collections || [],
    chargeOffs: (accounts || []).filter(a =>
      a.status?.toLowerCase().includes('charge') ||
      a.accountStatus?.toLowerCase().includes('charge')
    ),
    publicRecords: publicRecords || [],
    inquiries: inquiries || [],
  };
}

function calculateClientSuccessRate(historicalDisputes) {
  if (!historicalDisputes.length) return 0.5; // Default 50%

  const successful = historicalDisputes.filter(d =>
    d.result === 'deleted' || d.result === 'removed' || d.result === 'updated'
  ).length;

  return successful / historicalDisputes.length;
}

function calculateAlgorithmicPrediction(scores, negativeItems, activeDisputes, successRate) {
  const currentAvg = Math.round(
    ((scores?.experian || 0) + (scores?.equifax || 0) + (scores?.transunion || 0)) / 3
  );

  let potentialGain = 0;

  // Calculate potential gains from each category
  negativeItems.collections.forEach(() => {
    potentialGain += 15 * successRate;
  });

  negativeItems.latePayments.forEach(() => {
    potentialGain += 10 * successRate;
  });

  negativeItems.chargeOffs.forEach(() => {
    potentialGain += 20 * successRate;
  });

  negativeItems.inquiries.forEach(() => {
    potentialGain += 5 * successRate;
  });

  return {
    currentAverage: currentAvg,
    potentialGain: Math.round(potentialGain),
    projectedScore: Math.min(850, currentAvg + Math.round(potentialGain)),
    confidence: Math.min(0.9, 0.5 + (successRate * 0.4)),
  };
}

function extractAllDisputeableItems(parsedData) {
  const items = [];

  // Add collections
  (parsedData.collections || []).forEach((col, idx) => {
    items.push({
      id: `col_${idx}`,
      type: 'collection',
      creditor: col.creditor || col.collectionAgency,
      originalCreditor: col.originalCreditor,
      balance: col.balance || col.amount,
      dateOpened: col.dateOpened || col.date,
      ...col,
    });
  });

  // Add negative accounts
  (parsedData.accounts || []).forEach((acc, idx) => {
    if (acc.status === 'negative' || acc.paymentStatus?.includes('Late')) {
      items.push({
        id: `acc_${idx}`,
        type: 'account',
        creditor: acc.creditor || acc.name,
        balance: acc.balance,
        dateOpened: acc.dateOpened,
        ...acc,
      });
    }
  });

  // Add inquiries
  (parsedData.inquiries || []).forEach((inq, idx) => {
    items.push({
      id: `inq_${idx}`,
      type: 'inquiry',
      creditor: inq.creditor || inq.company,
      date: inq.date || inq.inquiryDate,
      ...inq,
    });
  });

  // Add public records
  (parsedData.publicRecords || []).forEach((pr, idx) => {
    items.push({
      id: `pr_${idx}`,
      type: 'publicRecord',
      ...pr,
    });
  });

  return items;
}

function calculateItemScoreImpact(item) {
  switch (item.type) {
    case 'collection':
      return item.balance > 500 ? 80 : 50;
    case 'account':
      if (item.paymentStatus?.includes('90') || item.paymentStatus?.includes('120')) {
        return 70;
      }
      return 40;
    case 'inquiry':
      return 10;
    case 'publicRecord':
      return 100;
    default:
      return 30;
  }
}

function calculateSuccessProbability(item) {
  let baseProbability = 0.5;

  // Adjust based on item type
  if (item.type === 'inquiry') baseProbability = 0.85;
  if (item.type === 'collection') baseProbability = 0.70;
  if (item.type === 'publicRecord') baseProbability = 0.35;

  // Medical collections have higher success rates
  if (item.creditor?.toLowerCase().includes('medical') ||
      item.originalCreditor?.toLowerCase().includes('medical')) {
    baseProbability += 0.15;
  }

  // Older items are easier to dispute
  if (item.dateOpened || item.date) {
    const ageInYears = (Date.now() - new Date(item.dateOpened || item.date).getTime()) / (365 * 24 * 60 * 60 * 1000);
    if (ageInYears > 5) baseProbability += 0.15;
    if (ageInYears > 6) baseProbability += 0.20;
  }

  return Math.min(0.95, baseProbability);
}

function assessLegalStrength(item) {
  let strength = 50;

  // Check for common FCRA violations
  if (!item.balance && item.balance !== 0) strength += 20;
  if (!item.dateOpened && !item.date) strength += 15;
  if (!item.creditor) strength += 25;

  return Math.min(100, strength);
}

function calculateUrgency(item) {
  let urgency = 50;

  // Higher balance = higher urgency
  if (item.balance > 1000) urgency += 20;
  if (item.balance > 5000) urgency += 10;

  // Recent items are more urgent
  if (item.dateOpened || item.date) {
    const ageInMonths = (Date.now() - new Date(item.dateOpened || item.date).getTime()) / (30 * 24 * 60 * 60 * 1000);
    if (ageInMonths < 12) urgency += 20;
  }

  return Math.min(100, urgency);
}

function getRecommendedDisputeReasons(item) {
  const reasons = [];

  if (item.type === 'collection') {
    reasons.push('not_mine', 'unverifiable', 'incorrect_balance');
  } else if (item.type === 'account') {
    reasons.push('never_late', 'incorrect_date', 'incorrect_balance');
  } else if (item.type === 'inquiry') {
    reasons.push('not_mine', 'unauthorized');
  }

  return reasons;
}

function estimateResolutionTime(item) {
  if (item.type === 'inquiry') return '30-45 days';
  if (item.type === 'collection') return '45-60 days';
  return '45-90 days';
}

function groupIntoRounds(items) {
  const rounds = [];
  const itemsPerRound = 5;

  for (let i = 0; i < items.length; i += itemsPerRound) {
    rounds.push({
      roundNumber: rounds.length + 1,
      items: items.slice(i, i + itemsPerRound),
      estimatedStartWeek: rounds.length * 6 + 1,
    });
  }

  return rounds;
}

async function updateDisputesFromResponse(clientId, parsedResponse) {
  const disputesQuery = await db.collection('disputes')
    .where('clientId', '==', clientId)
    .where('status', 'in', ['sent', 'pending', 'in_progress'])
    .get();

  const batch = db.batch();

  parsedResponse.disputeResults?.forEach(result => {
    // Try to match dispute by creditor name
    const matchingDispute = disputesQuery.docs.find(d => {
      const data = d.data();
      return data.creditorName?.toLowerCase().includes(result.creditorName?.toLowerCase()) ||
             result.creditorName?.toLowerCase().includes(data.creditorName?.toLowerCase());
    });

    if (matchingDispute) {
      batch.update(matchingDispute.ref, {
        status: result.result === 'deleted' ? 'completed' : 'resolved',
        result: result.result,
        resultDetails: result.resultDetails,
        responseDate: parsedResponse.responseDate,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  });

  await batch.commit();
}

function findDuplicateAccounts(accounts) {
  const creditorCounts = {};

  accounts.forEach(acc => {
    const key = (acc.creditor || acc.name || '').toLowerCase().trim();
    if (!creditorCounts[key]) {
      creditorCounts[key] = { creditor: key, count: 0, accounts: [] };
    }
    creditorCounts[key].count++;
    creditorCounts[key].accounts.push(acc);
  });

  return Object.values(creditorCounts).filter(c => c.count > 1);
}

function findDateAnomalies(parsedData) {
  const anomalies = [];
  const now = new Date();

  // Check accounts
  (parsedData.accounts || []).forEach(acc => {
    if (acc.dateOpened) {
      const openDate = new Date(acc.dateOpened);
      if (openDate > now) {
        anomalies.push({
          type: 'future_date',
          severity: 'high',
          description: `Account ${acc.creditor} has future open date: ${acc.dateOpened}`,
          recommendedAction: 'Dispute as inaccurate date',
          legalBasis: 'FCRA Section 623 - Accuracy requirement',
        });
      }
    }
  });

  return anomalies;
}

function detectMixedFile(parsedData) {
  const indicators = [];
  const personalInfo = parsedData.personalInfo || {};

  // Check for multiple SSNs or variations
  if (personalInfo.ssnVariations?.length > 1) {
    indicators.push({
      type: 'mixed_file_ssn',
      severity: 'critical',
      description: 'Multiple SSN variations detected - possible mixed file',
      recommendedAction: 'File FCRA Section 611 dispute for mixed file',
      legalBasis: 'FCRA Section 607(b) - Reasonable procedures',
    });
  }

  // Check for name variations that don't match
  if (personalInfo.nameVariations?.length > 3) {
    indicators.push({
      type: 'mixed_file_names',
      severity: 'high',
      description: 'Excessive name variations - review for mixed file',
      recommendedAction: 'Request investigation for mixed file',
      legalBasis: 'FCRA Section 611',
    });
  }

  return indicators;
}

function findObsoleteItems(parsedData) {
  const anomalies = [];
  const now = new Date();
  const sevenYearsAgo = new Date(now.getFullYear() - 7, now.getMonth(), now.getDate());
  const tenYearsAgo = new Date(now.getFullYear() - 10, now.getMonth(), now.getDate());

  // Check collections
  (parsedData.collections || []).forEach(col => {
    const date = new Date(col.dateOpened || col.date);
    if (date < sevenYearsAgo) {
      anomalies.push({
        type: 'obsolete_collection',
        severity: 'critical',
        description: `Collection ${col.creditor} is over 7 years old`,
        recommendedAction: 'Dispute as obsolete under FCRA',
        legalBasis: 'FCRA Section 605 - 7-year reporting limit',
      });
    }
  });

  // Check public records
  (parsedData.publicRecords || []).forEach(pr => {
    const date = new Date(pr.date || pr.filedDate);
    const limit = pr.type?.toLowerCase().includes('bankruptcy') ? tenYearsAgo : sevenYearsAgo;
    if (date < limit) {
      anomalies.push({
        type: 'obsolete_public_record',
        severity: 'critical',
        description: `Public record is past reporting limit`,
        recommendedAction: 'Demand immediate removal',
        legalBasis: 'FCRA Section 605',
      });
    }
  });

  return anomalies;
}

function detectReAging(parsedData) {
  // This would require comparing multiple reports over time
  // For now, flag accounts where dates seem inconsistent
  return [];
}

function findBalanceInconsistencies(parsedData) {
  const anomalies = [];

  (parsedData.accounts || []).forEach(acc => {
    // Check if balance exceeds credit limit significantly
    if (acc.creditLimit && acc.balance > acc.creditLimit * 1.5) {
      anomalies.push({
        type: 'balance_exceeds_limit',
        severity: 'medium',
        description: `${acc.creditor} balance ($${acc.balance}) exceeds limit ($${acc.creditLimit}) by >50%`,
        recommendedAction: 'Dispute incorrect balance',
        legalBasis: 'FCRA Section 623',
      });
    }
  });

  return anomalies;
}

function deduplicateAnomalies(anomalies) {
  const seen = new Set();
  return anomalies.filter(a => {
    const key = `${a.type}_${a.description}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function calculateHistoricalSuccessRates(historicalData) {
  const rates = {};

  ['collection', 'account', 'inquiry', 'publicRecord'].forEach(type => {
    const typeDisputes = historicalData.filter(d => d.itemType === type);
    if (typeDisputes.length > 0) {
      const successful = typeDisputes.filter(d => d.result === 'deleted' || d.result === 'removed').length;
      rates[type] = successful / typeDisputes.length;
    } else {
      rates[type] = BUREAU_SUCCESS_PATTERNS.experian[type === 'collection' ? 'collections' : 'latePayments'] || 0.5;
    }
  });

  return rates;
}

function getBaseSuccessRate(item, bureau, successRates) {
  const bureauRates = BUREAU_SUCCESS_PATTERNS[bureau?.toLowerCase()] || BUREAU_SUCCESS_PATTERNS.experian;

  switch (item.type) {
    case 'collection':
      return bureauRates.collections;
    case 'account':
      return bureauRates.latePayments;
    case 'inquiry':
      return bureauRates.inquiries;
    case 'publicRecord':
      return bureauRates.publicRecords;
    default:
      return 0.5;
  }
}

function analyzeSuccessFactors(item) {
  const factors = [];

  // Age factor
  if (item.dateOpened || item.date) {
    const ageInYears = (Date.now() - new Date(item.dateOpened || item.date).getTime()) / (365 * 24 * 60 * 60 * 1000);
    if (ageInYears > 5) {
      factors.push({ name: 'Age > 5 years', multiplier: 1.2 });
    }
  }

  // Medical collection bonus
  if (item.creditor?.toLowerCase().includes('medical')) {
    factors.push({ name: 'Medical debt', multiplier: 1.15 });
  }

  // Small balance bonus
  if (item.balance && item.balance < 500) {
    factors.push({ name: 'Balance < $500', multiplier: 1.1 });
  }

  return factors;
}

function calculateConfidence(item, dataPoints) {
  let confidence = 0.5;
  if (dataPoints > 100) confidence += 0.2;
  if (dataPoints > 500) confidence += 0.15;
  if (dataPoints > 1000) confidence += 0.1;
  return Math.min(0.95, confidence);
}

function getRecommendedApproach(item, successRate) {
  if (successRate > 0.7) return 'Direct dispute - high success probability';
  if (successRate > 0.5) return 'Dispute with validation request';
  if (successRate > 0.3) return 'Consider goodwill letter or negotiation first';
  return 'Negotiate pay-for-delete or settlement';
}

function estimateResolutionDays(item, bureau) {
  let baseDays = 45; // Standard investigation period

  if (item.type === 'inquiry') baseDays = 30;
  if (item.type === 'publicRecord') baseDays = 60;

  return baseDays;
}

function generateMilestones(currentScore, targetScore, months) {
  const milestones = [];
  const totalGain = targetScore - currentScore;
  const monthlyGain = totalGain / months;

  for (let i = 1; i <= Math.ceil(months); i++) {
    milestones.push({
      month: i,
      expectedScore: Math.min(targetScore, Math.round(currentScore + (monthlyGain * i))),
      checkpoint: i % 2 === 0 ? 'Review progress and adjust strategy' : 'Continue current round',
    });
  }

  return milestones;
}

function analyzeTimelineFactors(negativeItems, parsedData) {
  const factors = [];

  if (negativeItems.collections > 5) {
    factors.push({ factor: 'High collection count', impact: 'extends_timeline', months: 2 });
  }

  if (negativeItems.publicRecords > 0) {
    factors.push({ factor: 'Public records present', impact: 'extends_timeline', months: 3 });
  }

  if (negativeItems.inquiries > 10) {
    factors.push({ factor: 'Excessive inquiries', impact: 'quick_win', months: -1 });
  }

  return factors;
}
