// ============================================================================
// Path: /src/services/extensionEligibilityAnalyzer.js
// © 1995-2026 Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved
// Trademark registered USPTO, violations prosecuted.
//
// AI EXTENSION ELIGIBILITY ANALYZER — SMART GOODWILL EXTENSION DETECTION
// ============================================================================
// Uses AI to analyze if a client should receive a goodwill contract extension.
// Christopher's requirement: "I do not offer this to all clients, but try to
// gauge which clients have not had reasonable outcomes given their service plan
// and level, but also if I feel the client may be vindictive, and cause a poor
// review, or become a difficult problem."
//
// ANALYSIS FACTORS:
//   1. OUTCOME vs. ITEMS: Number/type of items vs. deletions achieved
//   2. SERVICE LEVEL: DIY vs. Premium expectations differ
//   3. SENTIMENT: Email, text, note analysis for frustration/vindictiveness
//   4. RISK ASSESSMENT: Likelihood of poor review or difficult behavior
//   5. SERVICE DURATION: 3+ months with minimal results
//   6. IDIQ COMPLIANCE: Has maintained credit monitoring subscription
//
// AI SCORING (0-100):
//   - 80-100: HIGHLY RECOMMENDED (offer extension immediately)
//   - 60-79:  RECOMMENDED (offer with personal review)
//   - 40-59:  NEUTRAL (requires careful judgment call)
//   - 20-39:  NOT RECOMMENDED (high risk, low ROI)
//   - 0-19:   STRONGLY DISCOURAGED (vindictive risk detected)
//
// INTEGRATION:
//   - AdminAddendumFlow: Shows AI recommendation before extension offer
//   - ContactDetailPage: Displays extension eligibility badge
//   - Automated monthly review: Batch analysis of eligible clients
// ============================================================================

import { collection, query, where, getDocs, doc, getDoc, orderBy, limit } from 'firebase/firestore';
import { db, functions } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';

// ============================================================================
// ===== ANALYZE CLIENT EXTENSION ELIGIBILITY =====
// Main entry point - analyzes all factors and returns AI recommendation
// ============================================================================

/**
 * Analyze if client qualifies for goodwill extension
 * 
 * @param {string} contactId - Contact ID to analyze
 * @returns {Promise<Object>} Analysis result with score and recommendation
 */
export async function analyzeExtensionEligibility(contactId) {
  console.log('🤖 Starting AI extension eligibility analysis for:', contactId);

  try {
    // ===== Step 1: Gather client data =====
    const clientData = await gatherClientData(contactId);

    if (!clientData.contact) {
      throw new Error('Contact not found');
    }

    // ===== Step 2: Calculate outcome metrics =====
    const outcomeMetrics = calculateOutcomeMetrics(clientData);

    // ===== Step 3: Analyze sentiment from communications =====
    const sentimentAnalysis = await analyzeSentiment(clientData);

    // ===== Step 4: Assess risk factors =====
    const riskAssessment = assessRiskFactors(clientData, sentimentAnalysis);

    // ===== Step 5: Call AI for final recommendation =====
    const aiRecommendation = await getAIRecommendation({
      contactId,
      contact: clientData.contact,
      contract: clientData.contract,
      outcomeMetrics,
      sentimentAnalysis,
      riskAssessment,
      disputes: clientData.disputes,
      emails: clientData.emails,
      notes: clientData.notes
    });

    // ===== Step 6: Compile final result =====
    const result = {
      contactId,
      contactName: `${clientData.contact.firstName} ${clientData.contact.lastName}`,
      eligibilityScore: aiRecommendation.score, // 0-100
      recommendation: aiRecommendation.recommendation, // HIGHLY_RECOMMENDED, RECOMMENDED, NEUTRAL, NOT_RECOMMENDED, DISCOURAGED
      confidence: aiRecommendation.confidence, // 0-100
      reasoning: aiRecommendation.reasoning,
      
      // Detailed breakdown
      outcomeMetrics,
      sentimentAnalysis,
      riskAssessment,
      
      // Recommendations
      suggestedExtensionMonths: aiRecommendation.suggestedMonths, // 3, 6, or null
      suggestedTerms: aiRecommendation.suggestedTerms, // items_only, reduced_monthly, etc.
      warningFlags: aiRecommendment.warningFlags, // Array of concerns
      
      // Metadata
      analyzedAt: new Date().toISOString(),
      dataCompleteness: calculateDataCompleteness(clientData),
      
      // Action items
      requiresHumanReview: aiRecommendation.score >= 40 && aiRecommendation.score < 60,
      autoApproved: aiRecommendation.score >= 80,
      autoRejected: aiRecommendation.score < 20
    };

    console.log('✅ Extension eligibility analysis complete');
    console.log(`   Score: ${result.eligibilityScore}/100`);
    console.log(`   Recommendation: ${result.recommendation}`);
    console.log(`   Confidence: ${result.confidence}%`);

    return result;

  } catch (error) {
    console.error('❌ Error analyzing extension eligibility:', error);
    throw error;
  }
}

// ============================================================================
// ===== GATHER CLIENT DATA =====
// Collects all relevant data from Firestore for analysis
// ============================================================================

async function gatherClientData(contactId) {
  const data = {
    contact: null,
    contract: null,
    disputes: [],
    emails: [],
    notes: [],
    texts: [],
    idiqReports: []
  };

  try {
    // ===== Get contact =====
    const contactRef = doc(db, 'contacts', contactId);
    const contactSnap = await getDoc(contactRef);
    
    if (contactSnap.exists()) {
      data.contact = { id: contactSnap.id, ...contactSnap.data() };
    } else {
      throw new Error('Contact not found');
    }

    // ===== Get active contract =====
    const contractsQuery = query(
      collection(db, 'contracts'),
      where('contactId', '==', contactId),
      where('status', '==', 'signed'),
      orderBy('signedAt', 'desc'),
      limit(1)
    );
    const contractsSnap = await getDocs(contractsQuery);
    
    if (!contractsSnap.empty) {
      data.contract = { id: contractsSnap.docs[0].id, ...contractsSnap.docs[0].data() };
    }

    // ===== Get disputes =====
    const disputesQuery = query(
      collection(db, 'disputes'),
      where('contactId', '==', contactId),
      orderBy('createdAt', 'desc')
    );
    const disputesSnap = await getDocs(disputesQuery);
    data.disputes = disputesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // ===== Get emails (communications) =====
    const emailsQuery = query(
      collection(db, 'emails'),
      where('contactId', '==', contactId),
      orderBy('sentAt', 'desc'),
      limit(50) // Last 50 emails
    );
    const emailsSnap = await getDocs(emailsQuery);
    data.emails = emailsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // ===== Get employee notes =====
    const notesQuery = query(
      collection(db, 'contactNotes'),
      where('contactId', '==', contactId),
      orderBy('createdAt', 'desc'),
      limit(100)
    );
    const notesSnap = await getDocs(notesQuery);
    data.notes = notesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // ===== Get IDIQ credit reports =====
    const idiqQuery = query(
      collection(db, 'idiqEnrollments'),
      where('contactId', '==', contactId),
      orderBy('createdAt', 'desc'),
      limit(12) // Last 12 months of reports
    );
    const idiqSnap = await getDocs(idiqQuery);
    data.idiqReports = idiqSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    console.log('📊 Client data gathered:');
    console.log(`   Disputes: ${data.disputes.length}`);
    console.log(`   Emails: ${data.emails.length}`);
    console.log(`   Notes: ${data.notes.length}`);
    console.log(`   IDIQ Reports: ${data.idiqReports.length}`);

    return data;

  } catch (error) {
    console.error('❌ Error gathering client data:', error);
    throw error;
  }
}

// ============================================================================
// ===== CALCULATE OUTCOME METRICS =====
// Analyzes items vs. deletions, service duration, ROI, etc.
// ============================================================================

function calculateOutcomeMetrics(clientData) {
  const { contact, contract, disputes, idiqReports } = clientData;

  // ===== Dispute analysis =====
  const totalItems = disputes.length;
  const deletedItems = disputes.filter(d => d.status === 'deleted' || d.status === 'verified_deleted').length;
  const pendingItems = disputes.filter(d => d.status === 'pending' || d.status === 'in_progress').length;
  const verifiedItems = disputes.filter(d => d.status === 'verified').length;
  const unsuccessfulItems = disputes.filter(d => d.status === 'unsuccessful' || d.status === 'failed').length;

  const deletionRate = totalItems > 0 ? (deletedItems / totalItems) * 100 : 0;
  const successRate = totalItems > 0 ? ((deletedItems + verifiedItems) / totalItems) * 100 : 0;

  // ===== Service duration =====
  const contractStartDate = contract?.signedAt?.toDate() || new Date();
  const monthsOfService = Math.floor((Date.now() - contractStartDate.getTime()) / (1000 * 60 * 60 * 24 * 30));

  // ===== Expected vs. Actual performance =====
  // DIY: 15-25% deletion rate expected
  // Standard: 30-40% deletion rate expected
  // Acceleration/Premium: 50-60% deletion rate expected
  
  let expectedDeletionRate = 35; // Default
  const planId = contract?.planId;
  
  if (planId === 'diy') expectedDeletionRate = 20;
  else if (planId === 'standard') expectedDeletionRate = 35;
  else if (planId === 'acceleration' || planId === 'premium') expectedDeletionRate = 55;
  else if (planId === 'payForDelete') expectedDeletionRate = 40;
  else if (planId === 'hybrid') expectedDeletionRate = 30;

  const performanceGap = expectedDeletionRate - deletionRate; // Positive = underperforming

  // ===== Credit score improvement =====
  let scoreImprovement = 0;
  if (idiqReports.length >= 2) {
    const latestReport = idiqReports[0];
    const oldestReport = idiqReports[idiqReports.length - 1];
    
    // Average across all 3 bureaus
    const latestAvg = (
      (latestReport.equifaxScore || 0) +
      (latestReport.experianScore || 0) +
      (latestReport.transunionScore || 0)
    ) / 3;
    
    const oldestAvg = (
      (oldestReport.equifaxScore || 0) +
      (oldestReport.experianScore || 0) +
      (oldestReport.transunionScore || 0)
    ) / 3;
    
    scoreImprovement = latestAvg - oldestAvg;
  }

  // ===== IDIQ subscription compliance =====
  const hasActiveIDIQ = contact?.idiqStatus === 'active';
  const idiqCancelledDate = contact?.idiqCancelledAt;
  const idiqCompliant = hasActiveIDIQ && !idiqCancelledDate;

  // ===== Overall outcome assessment =====
  let outcomeAssessment = 'poor';
  if (deletionRate >= expectedDeletionRate * 0.8) outcomeAssessment = 'good';
  else if (deletionRate >= expectedDeletionRate * 0.5) outcomeAssessment = 'fair';
  else if (deletionRate >= expectedDeletionRate * 0.3) outcomeAssessment = 'below_average';
  else outcomeAssessment = 'poor';

  return {
    totalItems,
    deletedItems,
    pendingItems,
    verifiedItems,
    unsuccessfulItems,
    deletionRate: Math.round(deletionRate),
    successRate: Math.round(successRate),
    expectedDeletionRate,
    performanceGap: Math.round(performanceGap),
    monthsOfService,
    scoreImprovement: Math.round(scoreImprovement),
    idiqCompliant,
    outcomeAssessment,
    
    // Qualifies for extension based on outcome?
    qualifiesOnOutcome: (
      monthsOfService >= 3 &&
      performanceGap > 10 &&
      deletionRate < 40 &&
      idiqCompliant
    )
  };
}

// ============================================================================
// ===== ANALYZE SENTIMENT =====
// AI analysis of emails, notes, texts for frustration/vindictiveness
// ============================================================================

async function analyzeSentiment(clientData) {
  const { emails, notes, texts } = clientData;

  // ===== Combine all text communications =====
  const allCommunications = [
    ...emails.map(e => ({
      type: 'email',
      date: e.sentAt,
      text: `${e.subject || ''} ${e.body || ''}`,
      from: e.from,
      to: e.to
    })),
    ...notes.map(n => ({
      type: 'note',
      date: n.createdAt,
      text: n.content || n.text || '',
      author: n.createdBy
    })),
    ...(texts || []).map(t => ({
      type: 'text',
      date: t.sentAt,
      text: t.message || '',
      from: t.from
    }))
  ].filter(c => c.text && c.text.trim().length > 0);

  if (allCommunications.length === 0) {
    return {
      overallSentiment: 'neutral',
      sentimentScore: 50, // 0-100 (0=very negative, 100=very positive)
      frustrationLevel: 'low',
      vindictiveRisk: 'low',
      keyPhrases: [],
      redFlags: [],
      positiveIndicators: []
    };
  }

  // ===== Call AI sentiment analysis (server-side via Cloud Function) =====
  try {
    const analyzeFunction = httpsCallable(functions, 'analyzeCommunicationSentiment');
    
    const result = await analyzeFunction({
      communications: allCommunications.slice(0, 30), // Limit to most recent 30
      analysisType: 'extension_eligibility'
    });

    return result.data.sentimentAnalysis;

  } catch (error) {
    console.error('❌ AI sentiment analysis failed:', error);
    
    // ===== FALLBACK: Simple keyword-based sentiment =====
    return performSimpleSentimentAnalysis(allCommunications);
  }
}

// ===== Fallback sentiment analysis (no AI) =====
function performSimpleSentimentAnalysis(communications) {
  const allText = communications.map(c => c.text.toLowerCase()).join(' ');

  // Negative keywords
  const negativeKeywords = [
    'disappointed', 'frustrated', 'angry', 'terrible', 'worst', 'scam',
    'fraud', 'lawsuit', 'attorney', 'bbb', 'complaint', 'refund',
    'useless', 'waste', 'rip off', 'disgusted', 'unacceptable'
  ];

  // Positive keywords
  const positiveKeywords = [
    'thank', 'appreciate', 'great', 'excellent', 'helpful', 'satisfied',
    'happy', 'pleased', 'impressed', 'recommend', 'patient', 'understanding'
  ];

  const negativeCount = negativeKeywords.filter(kw => allText.includes(kw)).length;
  const positiveCount = positiveKeywords.filter(kw => allText.includes(kw)).length;

  // Vindictive risk phrases
  const vindictiveRiskPhrases = [
    'review', 'yelp', 'google', 'bbb', 'attorney', 'lawyer', 'lawsuit',
    'sue', 'report you', 'file complaint', 'social media', 'warn others'
  ];

  const vindictiveMatches = vindictiveRiskPhrases.filter(kw => allText.includes(kw));

  // Calculate sentiment score (0-100)
  const sentimentScore = Math.max(0, Math.min(100, 50 + (positiveCount * 10) - (negativeCount * 10)));

  let overallSentiment = 'neutral';
  if (sentimentScore >= 70) overallSentiment = 'positive';
  else if (sentimentScore >= 40) overallSentiment = 'neutral';
  else if (sentimentScore >= 20) overallSentiment = 'negative';
  else overallSentiment = 'very_negative';

  let frustrationLevel = 'low';
  if (negativeCount >= 5) frustrationLevel = 'high';
  else if (negativeCount >= 2) frustrationLevel = 'medium';

  let vindictiveRisk = 'low';
  if (vindictiveMatches.length >= 3) vindictiveRisk = 'high';
  else if (vindictiveMatches.length >= 1) vindictiveRisk = 'medium';

  return {
    overallSentiment,
    sentimentScore,
    frustrationLevel,
    vindictiveRisk,
    keyPhrases: [...negativeKeywords.filter(kw => allText.includes(kw)).slice(0, 5)],
    redFlags: vindictiveMatches,
    positiveIndicators: positiveKeywords.filter(kw => allText.includes(kw)).slice(0, 5)
  };
}

// ============================================================================
// ===== ASSESS RISK FACTORS =====
// Evaluates likelihood of poor review, difficult client, etc.
// ============================================================================

function assessRiskFactors(clientData, sentimentAnalysis) {
  const { contact, contract, disputes, emails, notes } = clientData;

  const risks = {
    vindictiveClientRisk: 'low', // low, medium, high
    poorReviewLikelihood: 'low',
    paymentHistoryRisk: 'low',
    communicationDifficulty: 'low',
    overallRiskLevel: 'low',
    riskScore: 0, // 0-100 (0=no risk, 100=extreme risk)
    riskFactors: []
  };

  // ===== Sentiment-based risks =====
  if (sentimentAnalysis.vindictiveRisk === 'high') {
    risks.vindictiveClientRisk = 'high';
    risks.riskScore += 40;
    risks.riskFactors.push('High vindictive language detected in communications');
  } else if (sentimentAnalysis.vindictiveRisk === 'medium') {
    risks.vindictiveClientRisk = 'medium';
    risks.riskScore += 20;
    risks.riskFactors.push('Some vindictive language detected');
  }

  if (sentimentAnalysis.frustrationLevel === 'high') {
    risks.poorReviewLikelihood = 'high';
    risks.riskScore += 30;
    risks.riskFactors.push('High frustration level in recent communications');
  } else if (sentimentAnalysis.frustrationLevel === 'medium') {
    risks.poorReviewLikelihood = 'medium';
    risks.riskScore += 15;
  }

  // ===== Payment history risks =====
  const paymentIssues = contact?.paymentIssues || 0;
  const nsfCount = contact?.nsfCount || 0;
  
  if (paymentIssues >= 3 || nsfCount >= 2) {
    risks.paymentHistoryRisk = 'high';
    risks.riskScore += 25;
    risks.riskFactors.push(`${paymentIssues} payment issues, ${nsfCount} NSF events`);
  } else if (paymentIssues >= 1 || nsfCount >= 1) {
    risks.paymentHistoryRisk = 'medium';
    risks.riskScore += 10;
  }

  // ===== Communication difficulty =====
  const excessiveEmails = emails.filter(e => {
    return e.from === contact.email && e.sentAt > Date.now() - (30 * 24 * 60 * 60 * 1000);
  }).length;

  if (excessiveEmails > 20) { // More than 20 emails in last 30 days
    risks.communicationDifficulty = 'high';
    risks.riskScore += 15;
    risks.riskFactors.push('Excessive communication volume (demanding client)');
  } else if (excessiveEmails > 10) {
    risks.communicationDifficulty = 'medium';
    risks.riskScore += 5;
  }

  // ===== Employee notes analysis =====
  const concerningNotes = notes.filter(n => {
    const text = (n.content || n.text || '').toLowerCase();
    return text.includes('difficult') || text.includes('demanding') ||
           text.includes('angry') || text.includes('complaint') ||
           text.includes('problem') || text.includes('issue');
  }).length;

  if (concerningNotes >= 3) {
    risks.riskScore += 20;
    risks.riskFactors.push(`${concerningNotes} employee notes flagged as concerning`);
  }

  // ===== Overall risk level =====
  if (risks.riskScore >= 60) risks.overallRiskLevel = 'high';
  else if (risks.riskScore >= 30) risks.overallRiskLevel = 'medium';
  else risks.overallRiskLevel = 'low';

  return risks;
}

// ============================================================================
// ===== GET AI RECOMMENDATION =====
// Calls OpenAI to make final extension recommendation
// ============================================================================

async function getAIRecommendation(analysisData) {
  try {
    const recommendFunction = httpsCallable(functions, 'generateExtensionRecommendation');
    
    const result = await recommendFunction({
      ...analysisData,
      christopher_business_context: `
        Christopher Lahage offers goodwill extensions to clients who:
        1. Have not achieved reasonable results after 3+ months
        2. Maintain their IDIQ subscription ($21.86/mo)
        3. Are NOT vindictive or likely to cause problems
        4. Would benefit from 3-6 more months of items-only service ($0 monthly fee)
        
        The goal is to help genuine clients while avoiding:
        - Poor reviews from frustrated clients
        - Difficult/demanding clients who will abuse the extension
        - Clients with payment history issues
        
        Extension terms: $0 monthly fee, only per-item charges ($25 or $75), 
        3-6 month duration, must maintain IDIQ subscription.
      `
    });

    return result.data.recommendation;

  } catch (error) {
    console.error('❌ AI recommendation failed, using fallback logic:', error);
    
    // ===== FALLBACK: Rule-based recommendation =====
    return generateFallbackRecommendation(analysisData);
  }
}

// ===== Fallback recommendation (no AI) =====
function generateFallbackRecommendation(analysisData) {
  const { outcomeMetrics, sentimentAnalysis, riskAssessment } = analysisData;

  let score = 50; // Start at neutral

  // ===== Outcome factors (positive) =====
  if (outcomeMetrics.qualifiesOnOutcome) score += 20;
  if (outcomeMetrics.monthsOfService >= 4) score += 10;
  if (outcomeMetrics.performanceGap > 20) score += 15; // Significantly underperformed
  if (outcomeMetrics.idiqCompliant) score += 10;

  // ===== Sentiment factors (negative) =====
  if (sentimentAnalysis.overallSentiment === 'negative') score -= 15;
  if (sentimentAnalysis.overallSentiment === 'very_negative') score -= 30;
  if (sentimentAnalysis.frustrationLevel === 'high') score -= 10;
  if (sentimentAnalysis.vindictiveRisk === 'high') score -= 25;
  if (sentimentAnalysis.vindictiveRisk === 'medium') score -= 10;

  // ===== Risk factors (negative) =====
  score -= Math.min(30, Math.round(riskAssessment.riskScore / 2));

  // ===== Clamp score 0-100 =====
  score = Math.max(0, Math.min(100, score));

  // ===== Determine recommendation =====
  let recommendation = 'NEUTRAL';
  if (score >= 80) recommendation = 'HIGHLY_RECOMMENDED';
  else if (score >= 60) recommendation = 'RECOMMENDED';
  else if (score >= 40) recommendation = 'NEUTRAL';
  else if (score >= 20) recommendation = 'NOT_RECOMMENDED';
  else recommendation = 'DISCOURAGED';

  // ===== Suggested terms =====
  let suggestedMonths = null;
  let suggestedTerms = 'items_only';
  
  if (score >= 60) {
    suggestedMonths = outcomeMetrics.monthsOfService >= 6 ? 6 : 3;
  }

  // ===== Warning flags =====
  const warningFlags = [];
  if (sentimentAnalysis.vindictiveRisk !== 'low') {
    warningFlags.push('Potential vindictive behavior detected');
  }
  if (riskAssessment.paymentHistoryRisk === 'high') {
    warningFlags.push('Poor payment history');
  }
  if (riskAssessment.communicationDifficulty === 'high') {
    warningFlags.push('Excessive communication demands');
  }
  if (!outcomeMetrics.idiqCompliant) {
    warningFlags.push('IDIQ subscription not maintained');
  }

  // ===== Reasoning =====
  let reasoning = '';
  if (recommendation === 'HIGHLY_RECOMMENDED') {
    reasoning = 'Client has minimal results despite sufficient service time, maintains IDIQ compliance, shows no signs of vindictive behavior, and would likely benefit from an extension.';
  } else if (recommendation === 'RECOMMENDED') {
    reasoning = 'Client qualifies based on outcome metrics and poses low-medium risk. Extension recommended with personal review.';
  } else if (recommendation === 'NEUTRAL') {
    reasoning = 'Mixed signals - requires careful judgment call. Consider personal conversation with client before deciding.';
  } else if (recommendation === 'NOT_RECOMMENDED') {
    reasoning = 'Risk factors outweigh outcome justification. Extension may not be beneficial.';
  } else {
    reasoning = 'Strong warning signs of vindictive behavior or significant risk factors. Extension not advised.';
  }

  return {
    score,
    recommendation,
    confidence: 75, // Lower confidence for fallback vs. AI
    reasoning,
    suggestedMonths,
    suggestedTerms,
    warningFlags
  };
}

// ============================================================================
// ===== CALCULATE DATA COMPLETENESS =====
// How much data is available for analysis
// ============================================================================

function calculateDataCompleteness(clientData) {
  const factors = {
    hasContract: clientData.contract ? 1 : 0,
    hasDisputes: clientData.disputes.length > 0 ? 1 : 0,
    hasEmails: clientData.emails.length > 0 ? 1 : 0,
    hasNotes: clientData.notes.length > 0 ? 1 : 0,
    hasIDIQReports: clientData.idiqReports.length > 0 ? 1 : 0
  };

  const completeness = (Object.values(factors).reduce((a, b) => a + b, 0) / 5) * 100;

  return {
    percentage: Math.round(completeness),
    missingData: Object.keys(factors).filter(k => factors[k] === 0),
    isComplete: completeness === 100
  };
}

// ============================================================================
// ===== BATCH ANALYSIS =====
// Analyze multiple clients at once (for monthly review)
// ============================================================================

/**
 * Batch analyze extension eligibility for multiple clients
 * 
 * @param {Array<string>} contactIds - Array of contact IDs
 * @returns {Promise<Array>} Array of analysis results
 */
export async function batchAnalyzeExtensionEligibility(contactIds) {
  console.log(`🤖 Starting batch analysis for ${contactIds.length} clients...`);

  const results = [];

  for (const contactId of contactIds) {
    try {
      const result = await analyzeExtensionEligibility(contactId);
      results.push(result);
    } catch (error) {
      console.error(`❌ Failed to analyze ${contactId}:`, error);
      results.push({
        contactId,
        error: error.message,
        eligibilityScore: 0,
        recommendation: 'ERROR'
      });
    }
  }

  // Sort by eligibility score (highest first)
  results.sort((a, b) => b.eligibilityScore - a.eligibilityScore);

  console.log('✅ Batch analysis complete');
  console.log(`   ${results.filter(r => r.recommendation === 'HIGHLY_RECOMMENDED').length} highly recommended`);
  console.log(`   ${results.filter(r => r.recommendation === 'RECOMMENDED').length} recommended`);
  console.log(`   ${results.filter(r => r.recommendation === 'NEUTRAL').length} neutral`);
  console.log(`   ${results.filter(r => r.recommendation === 'NOT_RECOMMENDED').length} not recommended`);
  console.log(`   ${results.filter(r => r.recommendation === 'DISCOURAGED').length} discouraged`);

  return results;
}

// ============================================================================
// ===== FIND ELIGIBLE CLIENTS AUTOMATICALLY =====
// Query Firestore for clients who may qualify for extension
// ============================================================================

/**
 * Find clients who may qualify for goodwill extension
 * 
 * @param {Object} criteria - Search criteria
 * @returns {Promise<Array>} Array of potential client IDs
 */
export async function findEligibleClients(criteria = {}) {
  const {
    minMonthsOfService = 3,
    maxMonthsOfService = 12,
    requireIDIQCompliance = true,
    minItems = 5,
    maxDeletionRate = 40
  } = criteria;

  try {
    // Query contacts with contracts
    const contractsQuery = query(
      collection(db, 'contracts'),
      where('status', '==', 'signed'),
      where('signedAt', '<=', new Date(Date.now() - (minMonthsOfService * 30 * 24 * 60 * 60 * 1000)))
    );

    const contractsSnap = await getDocs(contractsQuery);
    const potentialClients = [];

    for (const contractDoc of contractsSnap.docs) {
      const contract = contractDoc.data();
      const contactId = contract.contactId;

      // Get contact
      const contactRef = doc(db, 'contacts', contactId);
      const contactSnap = await getDoc(contactRef);

      if (!contactSnap.exists()) continue;

      const contact = contactSnap.data();

      // Check IDIQ compliance
      if (requireIDIQCompliance && contact.idiqStatus !== 'active') continue;

      // Check if already has extension
      if (contact.contractExtended) continue;

      // Get dispute count
      const disputesQuery = query(
        collection(db, 'disputes'),
        where('contactId', '==', contactId)
      );
      const disputesSnap = await getDocs(disputesQuery);

      if (disputesSnap.size < minItems) continue;

      potentialClients.push(contactId);
    }

    console.log(`✅ Found ${potentialClients.length} potentially eligible clients`);
    return potentialClients;

  } catch (error) {
    console.error('❌ Error finding eligible clients:', error);
    throw error;
  }
}

// ============================================================================
// ===== EXPORT =====
// ============================================================================

export default {
  analyzeExtensionEligibility,
  batchAnalyzeExtensionEligibility,
  findEligibleClients
};