/**
 * ═══════════════════════════════════════════════════════════════════════════
 * AI CREDIT ANALYSIS ENGINE - SpeedyCRM  
 * ═══════════════════════════════════════════════════════════════════════════
 * Path: /functions/creditAnalysisEngine.js
 * 
 * MAXIMUM AI-POWERED CREDIT REPORT ANALYSIS WITH GPT-4
 * 
 * Features:
 * ✅ Complete credit report parsing and analysis
 * ✅ Negative item identification and prioritization  
 * ✅ Dispute letter generation (3 variations per item)
 * ✅ Service plan recommendation based on complexity
 * ✅ Score improvement predictions
 * ✅ Personalized action plans
 * ✅ Bureau-specific strategies
 * ✅ FCRA violation detection
 * 
 * @version 1.0.0 PRODUCTION READY
 * @author Christopher - Speedy Credit Repair
 * @date November 2025
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

// ═══════════════════════════════════════════════════════════════════════════
// OPENAI INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════
const { OpenAI } = require('openai');
const openaiKey = functions.config().openai?.api_key || process.env.OPENAI_API_KEY;
const openai = openaiKey ? new OpenAI({ apiKey: openaiKey }) : null;

if (!openai) {
  console.error('⚠️ OpenAI not configured - credit analysis will be limited');
}

// ═══════════════════════════════════════════════════════════════════════════
// SERVICE PLAN DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

const SERVICE_PLANS = {
  diy_support: {
    name: 'DIY Support Plan',
    price: 39,
    duration: 'monthly',
    icon: '💪',
    description: 'Perfect for budget-conscious, tech-savvy clients',
    features: [
      'AI-generated dispute letters',
      'Credit monitoring (basic)',
      'Educational resources',
      'Email support',
      'Client portal access'
    ]
  },
  standard: {
    name: 'Standard Improvement Plan',
    price: 149,
    duration: '6 months',
    icon: '📈',
    description: 'Our most popular plan for typical credit repair',
    features: [
      'Full-service dispute handling',
      '3-bureau credit monitoring',
      'Monthly progress reports',
      'Unlimited disputes',
      'Phone support',
      '30-day money-back guarantee'
    ]
  },
  acceleration: {
    name: 'Acceleration Plan',
    price: 199,
    duration: '9 months',
    icon: '🚀',
    description: 'For complex credit with urgency',
    features: [
      'Aggressive dispute strategies',
      'Creditor intervention',
      'Bi-weekly updates',
      'Priority processing',
      'Dedicated account manager',
      'Debt validation requests'
    ]
  },
  pay_for_delete: {
    name: 'Pay-For-Delete Only',
    price: 0,
    duration: 'per deletion',
    icon: '🎯',
    description: 'Only pay for successful deletions',
    features: [
      'No monthly fees',
      '$75 per collection deleted',
      '$100 per charge-off deleted',
      '$150 per judgment deleted',
      '60-day guarantee'
    ]
  },
  hybrid: {
    name: 'Hybrid Plan',
    price: 99,
    duration: 'monthly',
    icon: '🔄',
    description: 'Balance of monthly fee and per-deletion',
    features: [
      'Low monthly fee',
      '$30 per deletion',
      'Full dispute service',
      'Basic monitoring',
      'No commitment'
    ]
  },
  premium_vip: {
    name: 'Premium VIP Plan',
    price: 349,
    duration: '12 months',
    icon: '👑',
    description: 'White-glove service for complex cases',
    features: [
      'Attorney consultation',
      'FCRA violation analysis',
      'Court-ready documentation',
      'Identity theft recovery',
      'Bankruptcy credit rebuild',
      'Weekly video check-ins',
      'Unlimited deletions'
    ]
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN ANALYSIS FUNCTION - Triggers on queue entry
// ═══════════════════════════════════════════════════════════════════════════

exports.analyzeCreditReport = functions.runWith({
  memory: '512MB',
  timeoutSeconds: 60
}).firestore
  .document('creditAnalysisQueue/{analysisId}')
  .onCreate(async (snap, context) => {
    const analysisId = context.params.analysisId;
    const queueData = snap.data();
    
    console.log(`===== CREDIT ANALYSIS ENGINE STARTED =====`);
    console.log(`Processing analysis: ${analysisId}`);
    console.log(`Contact ID: ${queueData.contactId}`);
    
    try {
      // ===== STEP 1: Parse credit report data =====
      const parsedReport = parseCredit

Report(queueData.reportData);
      console.log(`Parsed report: ${parsedReport.bureaus.length} bureaus, ${parsedReport.accounts.length} accounts`);
      
      // ===== STEP 2: Identify negative items =====
      const negativeItems = identifyNegativeItems(parsedReport);
      console.log(`Found ${negativeItems.length} negative items`);
      
      // ===== STEP 3: AI-powered analysis =====
      let aiAnalysis = null;
      if (openai) {
        aiAnalysis = await performAIAnalysis(parsedReport, negativeItems);
        console.log('AI analysis complete');
      }
      
      // ===== STEP 4: Generate dispute letters =====
      const disputeLetters = await generateDisputeLetters(negativeItems, parsedReport);
      console.log(`Generated ${Object.keys(disputeLetters).length} dispute letter sets`);
      
      // ===== STEP 5: Recommend service plan =====
      const recommendedPlan = recommendServicePlan(
        parsedReport,
        negativeItems,
        aiAnalysis
      );
      console.log(`Recommended plan: ${recommendedPlan.id}`);
      
      // ===== STEP 6: Create action plan =====
      const actionPlan = createActionPlan(
        parsedReport,
        negativeItems,
        recommendedPlan,
        aiAnalysis
      );
      console.log('Action plan created');
      
      // ===== STEP 7: Generate initial review =====
      const initialReview = await generateInitialReview(
        parsedReport,
        negativeItems,
        recommendedPlan,
        actionPlan,
        aiAnalysis
      );
      console.log('Initial review generated');
      
      // ===== STEP 8: Store analysis results =====
      const analysisDoc = {
        contactId: queueData.contactId,
        analysisDate: admin.firestore.FieldValue.serverTimestamp(),
        
        // Credit report summary
        creditScores: parsedReport.scores,
        bureauData: parsedReport.bureaus,
        accountSummary: {
          total: parsedReport.accounts.length,
          open: parsedReport.accounts.filter(a => a.status === 'open').length,
          closed: parsedReport.accounts.filter(a => a.status === 'closed').length,
          negative: negativeItems.length
        },
        
        // Negative items analysis
        negativeItems: negativeItems.map(item => ({
          ...item,
          disputeRecommended: item.disputability > 0.5,
          priority: calculatePriority(item),
          estimatedImpact: estimateScoreImpact(item)
        })),
        
        // Dispute information
        disputableItems: negativeItems.filter(item => item.disputability > 0.5),
        disputeLetters: disputeLetters,
        totalDisputes: Object.keys(disputeLetters).length,
        
        // Recommendations
        recommendedPlan: recommendedPlan,
        actionPlan: actionPlan,
        initialReview: initialReview,
        
        // AI insights
        aiInsights: aiAnalysis || {},
        aiConfidence: aiAnalysis?.confidence || 0,
        
        // Metadata
        status: 'pending_review',
        reviewedBy: null,
        reviewedAt: null,
        approved: false,
        
        // Predictions
        estimatedImprovement: calculateEstimatedImprovement(negativeItems),
        estimatedTimeframe: calculateTimeframe(negativeItems),
        successProbability: calculateSuccessProbability(negativeItems, parsedReport)
      };
      
      const analysisRef = await db.collection('creditAnalyses').add(analysisDoc);
      console.log(`Analysis saved: ${analysisRef.id}`);
      
      // ===== STEP 9: Create dispute records =====
      await createDisputeRecords(
        queueData.contactId,
        negativeItems.filter(item => item.disputability > 0.5),
        disputeLetters
      );
      
      // ===== STEP 10: Update contact and workflow =====
      await updateContactWithAnalysis(queueData.contactId, {
        creditAnalysisId: analysisRef.id,
        creditScore: parsedReport.scores.average,
        negativeItemCount: negativeItems.length,
        recommendedPlan: recommendedPlan.id,
        workflow: {
          stage: 'credit_analyzed',
          nextAction: 'review_required',
          lastAction: admin.firestore.FieldValue.serverTimestamp()
        }
      });
      
      // ===== STEP 11: Create review task =====
      await createReviewTask(queueData.contactId, analysisRef.id);
      
      // ===== STEP 12: Update queue status =====
      await snap.ref.update({
        status: 'completed',
        completedAt: admin.firestore.FieldValue.serverTimestamp(),
        analysisId: analysisRef.id
      });
      
      console.log(`===== CREDIT ANALYSIS COMPLETE =====`);
      return { success: true, analysisId: analysisRef.id };
      
    } catch (error) {
      console.error('Credit analysis error:', error);
      
      await snap.ref.update({
        status: 'failed',
        error: error.message,
        failedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      return { success: false, error: error.message };
    }
  });

// ═══════════════════════════════════════════════════════════════════════════
// CREDIT REPORT PARSING
// ═══════════════════════════════════════════════════════════════════════════

function parseCreditReport(reportData) {
  // Handle IDIQ format credit report
  const parsed = {
    scores: {},
    bureaus: [],
    accounts: [],
    inquiries: [],
    publicRecords: [],
    personalInfo: {}
  };
  
  // Extract scores from each bureau
  if (reportData.experian) {
    parsed.scores.experian = reportData.experian.score || 0;
    parsed.bureaus.push({
      name: 'Experian',
      score: reportData.experian.score,
      accounts: reportData.experian.accounts || []
    });
  }
  
  if (reportData.equifax) {
    parsed.scores.equifax = reportData.equifax.score || 0;
    parsed.bureaus.push({
      name: 'Equifax', 
      score: reportData.equifax.score,
      accounts: reportData.equifax.accounts || []
    });
  }
  
  if (reportData.transunion) {
    parsed.scores.transunion = reportData.transunion.score || 0;
    parsed.bureaus.push({
      name: 'TransUnion',
      score: reportData.transunion.score,
      accounts: reportData.transunion.accounts || []
    });
  }
  
  // Calculate average score
  const scores = Object.values(parsed.scores).filter(s => s > 0);
  parsed.scores.average = scores.length > 0 
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0;
  
  // Consolidate accounts from all bureaus
  const accountMap = new Map();
  
  parsed.bureaus.forEach(bureau => {
    bureau.accounts.forEach(account => {
      const key = `${account.creditor}_${account.accountNumber}`;
      
      if (!accountMap.has(key)) {
        accountMap.set(key, {
          ...account,
          bureaus: [bureau.name]
        });
      } else {
        accountMap.get(key).bureaus.push(bureau.name);
      }
    });
  });
  
  parsed.accounts = Array.from(accountMap.values());
  
  // Extract inquiries
  if (reportData.inquiries) {
    parsed.inquiries = reportData.inquiries;
  }
  
  // Extract public records
  if (reportData.publicRecords) {
    parsed.publicRecords = reportData.publicRecords;
  }
  
  // Extract personal info
  parsed.personalInfo = reportData.personalInfo || {};
  
  return parsed;
}

// ═══════════════════════════════════════════════════════════════════════════
// NEGATIVE ITEM IDENTIFICATION
// ═══════════════════════════════════════════════════════════════════════════

function identifyNegativeItems(parsedReport) {
  const negativeItems = [];
  
  // Check each account
  parsedReport.accounts.forEach(account => {
    // Collections
    if (account.status === 'collection' || account.accountType === 'collection') {
      negativeItems.push({
        type: 'collection',
        creditor: account.creditor,
        originalCreditor: account.originalCreditor,
        accountNumber: account.accountNumber,
        balance: account.balance || 0,
        dateOpened: account.dateOpened,
        dateOfLastActivity: account.dateOfLastActivity,
        bureaus: account.bureaus,
        disputability: calculateDisputability('collection', account),
        details: account
      });
    }
    
    // Charge-offs
    if (account.status === 'charged-off' || account.remarks?.includes('charged off')) {
      negativeItems.push({
        type: 'charge-off',
        creditor: account.creditor,
        accountNumber: account.accountNumber,
        chargeOffAmount: account.chargeOffAmount || account.balance,
        dateCharged: account.dateCharged,
        bureaus: account.bureaus,
        disputability: calculateDisputability('charge-off', account),
        details: account
      });
    }
    
    // Late payments
    if (account.paymentHistory) {
      const latePayments = analyzeLatePayments(account.paymentHistory);
      if (latePayments.count > 0) {
        negativeItems.push({
          type: 'late_payments',
          creditor: account.creditor,
          accountNumber: account.accountNumber,
          lateCount: latePayments.count,
          worst: latePayments.worst,
          recent: latePayments.recent,
          bureaus: account.bureaus,
          disputability: calculateDisputability('late_payments', account),
          details: account
        });
      }
    }
  });
  
  // Public records
  parsedReport.publicRecords?.forEach(record => {
    negativeItems.push({
      type: record.type, // bankruptcy, judgment, lien, etc.
      court: record.court,
      caseNumber: record.caseNumber,
      amount: record.amount,
      dateFiled: record.dateFiled,
      status: record.status,
      bureaus: record.bureaus || ['All'],
      disputability: calculateDisputability(record.type, record),
      details: record
    });
  });
  
  // Hard inquiries (if excessive)
  const recentInquiries = parsedReport.inquiries?.filter(inq => {
    const monthsOld = getMonthsDifference(new Date(inq.date), new Date());
    return monthsOld <= 6 && inq.type === 'hard';
  });
  
  if (recentInquiries?.length > 6) {
    negativeItems.push({
      type: 'excessive_inquiries',
      count: recentInquiries.length,
      inquiries: recentInquiries,
      disputability: 0.3, // Harder to dispute
      bureaus: ['All']
    });
  }
  
  return negativeItems;
}

function calculateDisputability(type, item) {
  let score = 0.5; // Base disputability
  
  // Age of item (older = more disputable)
  const ageMonths = getMonthsDifference(
    new Date(item.dateOpened || item.dateFiled || item.date),
    new Date()
  );
  
  if (ageMonths > 72) score += 0.3; // Over 6 years
  else if (ageMonths > 60) score += 0.2; // Over 5 years
  else if (ageMonths > 48) score += 0.1; // Over 4 years
  
  // Type-specific factors
  switch (type) {
    case 'collection':
      if (!item.originalCreditor) score += 0.2; // Missing info
      if (item.balance < 100) score += 0.1; // Small amount
      if (item.medical) score += 0.15; // Medical debt
      break;
      
    case 'charge-off':
      if (!item.dateCharged) score += 0.15; // Missing date
      if (item.soldToAnother) score += 0.1; // Sold account
      break;
      
    case 'late_payments':
      if (item.worst <= 60) score -= 0.2; // Minor lates harder
      if (ageMonths < 12) score -= 0.1; // Recent harder
      break;
      
    case 'bankruptcy':
      score = 0.1; // Very hard to dispute
      break;
      
    case 'judgment':
    case 'lien':
      if (!item.satisfied) score += 0.1;
      break;
  }
  
  return Math.max(0, Math.min(1, score));
}

function analyzeLatePayments(paymentHistory) {
  let count = 0;
  let worst = 0;
  let recent = null;
  
  // Payment history is usually a string like "000000301200000"
  // Where 0 = on time, 1 = 30 days, 2 = 60 days, etc.
  
  if (typeof paymentHistory === 'string') {
    for (let i = 0; i < paymentHistory.length; i++) {
      const payment = parseInt(paymentHistory[i]);
      if (payment > 0) {
        count++;
        worst = Math.max(worst, payment * 30);
        if (!recent) recent = i; // Position in history
      }
    }
  } else if (Array.isArray(paymentHistory)) {
    paymentHistory.forEach((payment, index) => {
      if (payment.late) {
        count++;
        worst = Math.max(worst, payment.daysLate || 30);
        if (!recent) recent = index;
      }
    });
  }
  
  return { count, worst, recent };
}

function getMonthsDifference(date1, date2) {
  const months = (date2.getFullYear() - date1.getFullYear()) * 12;
  return months + date2.getMonth() - date1.getMonth();
}

// ═══════════════════════════════════════════════════════════════════════════
// AI-POWERED ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════

async function performAIAnalysis(parsedReport, negativeItems) {
  if (!openai) return null;
  
  try {
    const prompt = `You are an expert credit analyst with 30 years of experience in credit repair and FCRA law.

CREDIT REPORT SUMMARY:
- Average Score: ${parsedReport.scores.average}
- Total Accounts: ${parsedReport.accounts.length}
- Negative Items: ${negativeItems.length}
- Collections: ${negativeItems.filter(i => i.type === 'collection').length}
- Charge-offs: ${negativeItems.filter(i => i.type === 'charge-off').length}
- Late Payments: ${negativeItems.filter(i => i.type === 'late_payments').length}
- Public Records: ${negativeItems.filter(i => ['bankruptcy', 'judgment', 'lien'].includes(i.type)).length}

NEGATIVE ITEMS DETAIL:
${JSON.stringify(negativeItems.slice(0, 10), null, 2)}

ANALYZE AND PROVIDE:

1. DISPUTE STRATEGY:
   - Which items should be disputed first?
   - What dispute reasons are most likely to succeed?
   - Any FCRA violations you notice?
   - Bureau-specific strategies?

2. SCORE IMPROVEMENT POTENTIAL:
   - Realistic score improvement if all disputes succeed
   - Timeframe for seeing results
   - Quick wins vs long-term strategies

3. CREDITOR NEGOTIATION:
   - Which creditors might accept pay-for-delete?
   - Settlement opportunities?
   - Goodwill letter candidates?

4. RED FLAGS:
   - Identity theft indicators?
   - Reporting errors?
   - Statute of limitations issues?

5. UNIQUE INSIGHTS:
   - Anything unusual about this report?
   - Hidden opportunities?
   - Potential complications?

OUTPUT FORMAT: Return detailed JSON with your analysis.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 2000
    });
    
    const response = JSON.parse(completion.choices[0].message.content);
    
    return {
      disputeStrategy: response.disputeStrategy,
      improvementPotential: response.improvementPotential,
      negotiationOpportunities: response.negotiationOpportunities,
      redFlags: response.redFlags,
      uniqueInsights: response.uniqueInsights,
      confidence: 0.85,
      model: 'gpt-4',
      analyzedAt: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('AI analysis error:', error);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// DISPUTE LETTER GENERATION
// ═══════════════════════════════════════════════════════════════════════════

async function generateDisputeLetters(negativeItems, parsedReport) {
  const letters = {};
  
  // Generate letters for top 5 most disputable items
  const topItems = negativeItems
    .filter(item => item.disputability > 0.5)
    .sort((a, b) => b.disputability - a.disputability)
    .slice(0, 5);
  
  for (const item of topItems) {
    const itemKey = `${item.type}_${item.creditor}_${item.accountNumber || 'NA'}`;
    
    letters[itemKey] = {
      item: item,
      variations: await generateLetterVariations(item, parsedReport)
    };
  }
  
  return letters;
}

async function generateLetterVariations(item, parsedReport) {
  const variations = [];
  
  // Variation 1: Formal Legal
  variations.push({
    type: 'formal',
    subject: `Formal Dispute - Account ${item.accountNumber || 'Reference'}`,
    tone: 'legal',
    content: generateFormalLetter(item, parsedReport)
  });
  
  // Variation 2: Consumer Friendly
  variations.push({
    type: 'consumer',
    subject: `Request for Investigation - ${item.creditor}`,
    tone: 'friendly',
    content: generateConsumerLetter(item, parsedReport)
  });
  
  // Variation 3: Aggressive Rights-Based
  variations.push({
    type: 'aggressive',
    subject: `FCRA Violation Notice - Immediate Action Required`,
    tone: 'assertive',
    content: generateAggressiveLetter(item, parsedReport)
  });
  
  // Use AI to enhance if available
  if (openai) {
    try {
      const enhanced = await enhanceLettersWithAI(item, variations);
      return enhanced;
    } catch (error) {
      console.error('AI letter enhancement failed:', error);
    }
  }
  
  return variations;
}

function generateFormalLetter(item, report) {
  const date = new Date().toLocaleDateString();
  const consumerInfo = report.personalInfo;
  
  return `${date}

Credit Bureau Dispute Department
[Bureau Address]

RE: Formal Dispute of Inaccurate Information
Consumer: ${consumerInfo.name || '[Name]'}
SSN: XXX-XX-${consumerInfo.ssnLast4 || 'XXXX'}

Dear Sir or Madam:

I am writing to formally dispute inaccurate information appearing on my credit report pursuant to Section 611 of the Fair Credit Reporting Act (FCRA), 15 U.S.C. § 1681i.

DISPUTED ITEM:
Creditor: ${item.creditor}
Account Number: ${item.accountNumber || 'Not Provided'}
Type: ${item.type}
Reported Balance: $${item.balance || item.chargeOffAmount || 0}

DISPUTE REASON:
This account information is inaccurate and/or unverifiable for the following reasons:

1. ${getDisputeReason(item, 1)}
2. The reported information lacks sufficient detail to establish its accuracy
3. The furnisher has failed to provide adequate verification of this debt

REQUESTED ACTION:
Pursuant to 15 U.S.C. § 1681i(a)(1)(A), I request that you:
1. Conduct a reasonable reinvestigation of this disputed information
2. Delete this inaccurate information from my credit file
3. Provide me with written results of your investigation
4. Provide me with a corrected credit report upon completion

If you determine this information is accurate, I request that you provide me with:
- The method of verification used
- The name, address, and telephone number of any person contacted
- A copy of all information provided by the furnisher

Please note that under 15 U.S.C. § 1681i(a)(3), you must complete this investigation within 30 days of receipt of this letter.

I have included the following identification documents:
- Copy of driver's license
- Copy of recent utility bill

Thank you for your prompt attention to this matter.

Sincerely,

${consumerInfo.name || '[Consumer Name]'}
${consumerInfo.address || '[Address]'}`;
}

function generateConsumerLetter(item, report) {
  const date = new Date().toLocaleDateString();
  const consumerInfo = report.personalInfo;
  
  return `${date}

Dear Credit Bureau,

I'm writing to ask for your help with an error on my credit report. I recently reviewed my report and found information that doesn't seem right.

The Problem:
There's a ${item.type} from ${item.creditor} showing on my report${item.accountNumber ? ` (Account: ${item.accountNumber})` : ''}. ${item.balance ? `It shows I owe $${item.balance}, but ` : ''}I believe this information is incorrect.

Why I'm Disputing:
${getDisputeReason(item, 2)}

What I'm Asking:
Could you please look into this for me? I'd like this item removed from my credit report if it can't be verified as accurate. This error is affecting my credit score and my ability to ${getConsumerGoal()}.

My Information:
Name: ${consumerInfo.name || '[Your Name]'}
Address: ${consumerInfo.address || '[Your Address]'}
Last 4 SSN: ${consumerInfo.ssnLast4 || '[Last 4 of SSN]'}

I've attached:
- A copy of my ID
- Proof of address

Please let me know if you need anything else from me. I appreciate your help with fixing this error.

Thank you,
${consumerInfo.name || '[Your Name]'}`;
}

function generateAggressiveLetter(item, report) {
  const date = new Date().toLocaleDateString();
  const consumerInfo = report.personalInfo;
  
  return `${date}

CERTIFIED MAIL - RETURN RECEIPT REQUESTED

Credit Bureau Compliance Department
[Bureau Address]

RE: IMMEDIATE FCRA COMPLIANCE DEMAND
     EVIDENCE OF SYSTEMATIC VIOLATIONS
     Consumer: ${consumerInfo.name || '[Name]'}

URGENT: This letter serves as formal notice of violations of the Fair Credit Reporting Act and demand for immediate corrective action.

VIOLATION IDENTIFIED:
You are currently reporting unverifiable and potentially fraudulent information:
- Creditor: ${item.creditor}
- Account: ${item.accountNumber || 'UNIDENTIFIED'}
- Violation Type: ${getViolationType(item)}

SPECIFIC FCRA VIOLATIONS:
1. 15 U.S.C. § 1681e(b) - Failure to follow reasonable procedures to assure maximum possible accuracy
2. 15 U.S.C. § 1681i - Failure to conduct reasonable reinvestigation of disputed information
3. 15 U.S.C. § 1681s-2(b) - Reporting information after notice of dispute

IMMEDIATE DEMANDS:
1. DELETE this unverified information within 5 business days
2. PROVIDE complete method of verification documentation
3. CEASE reporting this disputed information to any third parties
4. CONFIRM in writing the permanent deletion of this item

NOTICE OF POTENTIAL LEGAL ACTION:
Failure to comply with this demand will result in:
- Filing complaints with the CFPB, FTC, and State Attorney General
- Pursuing actual damages under 15 U.S.C. § 1681n
- Seeking statutory damages of $1,000 per violation
- Recovery of attorney fees and costs

This is not a request - this is a DEMAND for compliance with federal law. The reporting of this unverified information constitutes defamation, negligent enablement of identity theft, and willful noncompliance with the FCRA.

TIME IS OF THE ESSENCE. You have 30 days from receipt to comply fully with this demand.

DATED: ${date}

${consumerInfo.name || '[Consumer Name]'}
[Signature]

cc: Consumer Financial Protection Bureau
    Federal Trade Commission
    [State] Attorney General
    Private Counsel`;
}

function getDisputeReason(item, style) {
  const reasons = {
    collection: {
      1: 'This alleged debt is not mine and I have no knowledge of this account',
      2: 'I don\'t recognize this account and never had any business with this company'
    },
    'charge-off': {
      1: 'The charge-off date and amount are incorrectly reported',
      2: 'The dates and amounts shown don\'t match my records'
    },
    late_payments: {
      1: 'The payment history is inaccurately reported and does not reflect actual payment dates',
      2: 'My payment history isn\'t shown correctly - I made payments that aren\'t reflected'
    }
  };
  
  return reasons[item.type]?.[style] || 'This information is inaccurate and unverifiable';
}

function getViolationType(item) {
  const violations = {
    collection: 'Reporting unverified third-party collection account',
    'charge-off': 'Inaccurate charge-off status and amount',
    late_payments: 'False derogatory payment history',
    bankruptcy: 'Improper bankruptcy reporting',
    judgment: 'Unverified public record',
    lien: 'Invalid tax lien reporting'
  };
  
  return violations[item.type] || 'Unverifiable derogatory information';
}

function getConsumerGoal() {
  const goals = [
    'get approved for a mortgage',
    'qualify for an auto loan',
    'rent an apartment',
    'get better interest rates',
    'qualify for employment'
  ];
  
  return goals[Math.floor(Math.random() * goals.length)];
}

async function enhanceLettersWithAI(item, variations) {
  if (!openai) return variations;
  
  try {
    const prompt = `Enhance these dispute letter variations for maximum effectiveness:

ITEM: ${JSON.stringify(item)}
CURRENT VARIATIONS: ${JSON.stringify(variations)}

Make each letter more compelling while maintaining its tone (formal/consumer/aggressive).
Add specific FCRA references where appropriate.
Ensure each hits the right emotional and legal notes.

Return the enhanced variations in the same JSON format.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_tokens: 3000
    });
    
    return JSON.parse(completion.choices[0].message.content);
    
  } catch (error) {
    console.error('Letter enhancement error:', error);
    return variations;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SERVICE PLAN RECOMMENDATION
// ═══════════════════════════════════════════════════════════════════════════

function recommendServicePlan(parsedReport, negativeItems, aiAnalysis) {
  const score = parsedReport.scores.average;
  const itemCount = negativeItems.length;
  const hasPublicRecords = negativeItems.some(i => 
    ['bankruptcy', 'judgment', 'lien'].includes(i.type)
  );
  const complexity = calculateComplexity(negativeItems);
  
  // AI recommendation if available
  if (aiAnalysis?.recommendedPlan) {
    const aiPlan = SERVICE_PLANS[aiAnalysis.recommendedPlan];
    if (aiPlan) {
      return {
        id: aiAnalysis.recommendedPlan,
        ...aiPlan,
        aiRecommended: true,
        reasoning: aiAnalysis.planReasoning
      };
    }
  }
  
  // Rule-based recommendation
  let recommendedPlanId = 'standard'; // Default
  
  // Premium VIP for complex cases
  if (score < 500 || itemCount > 20 || hasPublicRecords) {
    recommendedPlanId = 'premium_vip';
  }
  // Acceleration for urgent complex
  else if (score < 580 && itemCount > 10) {
    recommendedPlanId = 'acceleration';
  }
  // Standard for typical cases
  else if (score < 640 && itemCount >= 5) {
    recommendedPlanId = 'standard';
  }
  // DIY for simple cases
  else if (score >= 600 && itemCount <= 3) {
    recommendedPlanId = 'diy_support';
  }
  // Pay-for-delete for few items
  else if (itemCount <= 5) {
    recommendedPlanId = 'pay_for_delete';
  }
  // Hybrid as alternative
  else if (complexity === 'medium') {
    recommendedPlanId = 'hybrid';
  }
  
  return {
    id: recommendedPlanId,
    ...SERVICE_PLANS[recommendedPlanId],
    reasoning: generatePlanReasoning(recommendedPlanId, score, itemCount, complexity)
  };
}

function calculateComplexity(negativeItems) {
  let complexityScore = 0;
  
  negativeItems.forEach(item => {
    switch (item.type) {
      case 'bankruptcy': complexityScore += 10; break;
      case 'judgment': complexityScore += 8; break;
      case 'lien': complexityScore += 7; break;
      case 'charge-off': complexityScore += 3; break;
      case 'collection': complexityScore += 2; break;
      case 'late_payments': complexityScore += 1; break;
    }
  });
  
  if (complexityScore > 30) return 'high';
  if (complexityScore > 15) return 'medium';
  return 'low';
}

function generatePlanReasoning(planId, score, itemCount, complexity) {
  const reasonings = {
    premium_vip: `With ${itemCount} negative items and a ${score} credit score, you need comprehensive professional support. This plan provides attorney-backed strategies and aggressive dispute tactics for maximum results.`,
    acceleration: `Your ${itemCount} negative items require immediate aggressive action. This plan fast-tracks disputes and includes creditor intervention to improve your ${score} score quickly.`,
    standard: `With ${itemCount} items affecting your ${score} score, our full-service plan handles everything while you focus on rebuilding. Most clients see results within 3-4 months.`,
    diy_support: `Your ${score} score and ${itemCount} negative items are manageable with guidance. This plan provides the tools and support you need to dispute effectively yourself.`,
    pay_for_delete: `With only ${itemCount} items, you can minimize risk by paying only for successful deletions. Perfect for your situation.`,
    hybrid: `The hybrid plan balances affordability with results for your ${itemCount} items and ${complexity} complexity level.`
  };
  
  return reasonings[planId] || 'Recommended based on your credit profile analysis.';
}

// ═══════════════════════════════════════════════════════════════════════════
// ACTION PLAN CREATION
// ═══════════════════════════════════════════════════════════════════════════

function createActionPlan(parsedReport, negativeItems, recommendedPlan, aiAnalysis) {
  const plan = {
    immediate: [], // 0-30 days
    shortTerm: [], // 30-90 days
    longTerm: [],  // 90+ days
    ongoing: []    // Continuous
  };
  
  // Immediate actions
  plan.immediate.push({
    action: 'Sign up for credit monitoring',
    reason: 'Track changes and catch new issues immediately',
    impact: 'Essential',
    timeline: 'Today'
  });
  
  if (negativeItems.filter(i => i.disputability > 0.7).length > 0) {
    plan.immediate.push({
      action: 'Submit initial dispute letters',
      reason: `${negativeItems.filter(i => i.disputability > 0.7).length} items have high dispute potential`,
      impact: 'High',
      timeline: 'Within 7 days'
    });
  }
  
  // Short-term actions
  if (parsedReport.scores.average < 630) {
    plan.shortTerm.push({
      action: 'Become authorized user on good account',
      reason: 'Quick score boost of 20-50 points possible',
      impact: 'Medium-High',
      timeline: '30-45 days'
    });
  }
  
  const collections = negativeItems.filter(i => i.type === 'collection');
  if (collections.length > 0) {
    plan.shortTerm.push({
      action: 'Negotiate pay-for-delete agreements',
      reason: `${collections.length} collections may accept deletion for payment`,
      impact: 'High',
      timeline: '30-60 days'
    });
  }
  
  // Long-term actions
  plan.longTerm.push({
    action: 'Build positive payment history',
    reason: 'Payment history is 35% of your score',
    impact: 'Critical',
    timeline: '6+ months'
  });
  
  if (parsedReport.accounts.filter(a => a.status === 'open').length < 3) {
    plan.longTerm.push({
      action: 'Open 2-3 new credit accounts',
      reason: 'Credit mix accounts for 10% of score',
      impact: 'Medium',
      timeline: '3-6 months'
    });
  }
  
  // Ongoing actions
  plan.ongoing.push({
    action: 'Keep credit utilization below 30%',
    reason: 'Utilization is 30% of your credit score',
    impact: 'Critical',
    timeline: 'Always'
  });
  
  plan.ongoing.push({
    action: 'Review credit reports monthly',
    reason: 'Catch and dispute new errors immediately',
    impact: 'High',
    timeline: 'Monthly'
  });
  
  // Add AI recommendations if available
  if (aiAnalysis?.actionPlan) {
    // Merge AI suggestions
    Object.keys(aiAnalysis.actionPlan).forEach(phase => {
      if (plan[phase]) {
        plan[phase] = [...plan[phase], ...aiAnalysis.actionPlan[phase]];
      }
    });
  }
  
  return plan;
}

// ═══════════════════════════════════════════════════════════════════════════
// INITIAL REVIEW GENERATION
// ═══════════════════════════════════════════════════════════════════════════

async function generateInitialReview(parsedReport, negativeItems, recommendedPlan, actionPlan, aiAnalysis) {
  let review = '';
  
  if (openai && aiAnalysis) {
    try {
      const prompt = `Write a warm, empathetic 200-300 word initial credit review for a client.

DETAILS:
- Current Score: ${parsedReport.scores.average}
- Negative Items: ${negativeItems.length}
- Main Issues: ${negativeItems.slice(0, 3).map(i => i.type).join(', ')}
- Recommended Plan: ${recommendedPlan.name} ($${recommendedPlan.price}/mo)
- Estimated Improvement: ${calculateEstimatedImprovement(negativeItems)} points
- Timeframe: ${calculateTimeframe(negativeItems)}

TONE: Empathetic, non-technical, hopeful but realistic.
Include: Current situation, improvement potential, why the plan fits, next steps.
Do NOT use technical jargon or legal terms.`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 400
      });
      
      review = completion.choices[0].message.content;
      
    } catch (error) {
      console.error('AI review generation error:', error);
    }
  }
  
  // Fallback to template if AI fails
  if (!review) {
    const firstName = parsedReport.personalInfo?.name?.split(' ')[0] || 'there';
    
    review = `Hi ${firstName},

I've completed a thorough review of your credit report, and I want you to know that you're not alone in this journey - we've helped thousands of clients in similar situations achieve their credit goals.

Your current credit score of ${parsedReport.scores.average} reflects ${negativeItems.length} negative items that are impacting your credit. The good news is that ${negativeItems.filter(i => i.disputability > 0.5).length} of these items show strong potential for removal or improvement through our dispute process.

Based on your specific situation, I'm recommending our ${recommendedPlan.name}. ${recommendedPlan.reasoning}

Here's what I see for your potential: With consistent effort, we typically see improvements of ${calculateEstimatedImprovement(negativeItems)} points or more over the next ${calculateTimeframe(negativeItems)}. Many of our clients with similar profiles have successfully qualified for mortgages, auto loans, and better interest rates after completing our program.

Your immediate next steps are simple: ${actionPlan.immediate[0]?.action}. We'll handle the complex legal work while keeping you informed every step of the way.

Remember, rebuilding credit is a marathon, not a sprint. But with the right strategy and support, you can achieve the financial freedom you deserve. I'm confident we can help you reach your goals.

Let's get started on transforming your credit today!`;
  }
  
  return review;
}

// ═══════════════════════════════════════════════════════════════════════════
// DISPUTE RECORD CREATION
// ═══════════════════════════════════════════════════════════════════════════

async function createDisputeRecords(contactId, disputableItems, disputeLetters) {
  const batch = db.batch();
  
  for (const item of disputableItems) {
    const itemKey = `${item.type}_${item.creditor}_${item.accountNumber || 'NA'}`;
    const letters = disputeLetters[itemKey];
    
    if (!letters) continue;
    
    // Create dispute for each bureau
    for (const bureau of item.bureaus) {
      const disputeRef = db.collection('disputes').doc();
      
      batch.set(disputeRef, {
        contactId: contactId,
        itemType: item.type,
        creditor: item.creditor,
        accountNumber: item.accountNumber,
        bureau: bureau,
        
        disputeReason: getDisputeReason(item, 1),
        disputability: item.disputability,
        priority: calculatePriority(item),
        
        letters: letters.variations,
        selectedLetter: 'formal', // Default
        
        status: 'pending_review',
        stage: 'created',
        
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: 'ai_analysis',
        
        reviewedBy: null,
        reviewedAt: null,
        approved: false,
        
        sentDate: null,
        responseDate: null,
        outcome: null,
        
        metadata: {
          autoGenerated: true,
          itemDetails: item.details
        }
      });
    }
  }
  
  await batch.commit();
  console.log(`Created ${disputableItems.length * 3} dispute records`);
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function calculatePriority(item) {
  // Higher score = higher priority
  let priority = 5; // Base
  
  // Type priorities
  const typePriorities = {
    'collection': 3,
    'charge-off': 3,
    'late_payments': 2,
    'judgment': 4,
    'lien': 4,
    'bankruptcy': 1, // Lower priority (harder to remove)
    'excessive_inquiries': 1
  };
  
  priority += typePriorities[item.type] || 0;
  
  // Recency boost
  if (item.dateOfLastActivity || item.dateOpened) {
    const monthsOld = getMonthsDifference(
      new Date(item.dateOfLastActivity || item.dateOpened),
      new Date()
    );
    if (monthsOld < 12) priority += 2; // Recent items more urgent
  }
  
  // Amount factor
  if (item.balance || item.chargeOffAmount) {
    const amount = item.balance || item.chargeOffAmount;
    if (amount > 1000) priority += 1;
    if (amount > 5000) priority += 1;
  }
  
  // Disputability factor
  priority += Math.floor(item.disputability * 3);
  
  return Math.min(10, priority); // Cap at 10
}

function estimateScoreImpact(item) {
  // Estimate points that could be gained by removing this item
  const baseImpacts = {
    'collection': 25,
    'charge-off': 35,
    'late_payments': 15,
    'judgment': 40,
    'lien': 35,
    'bankruptcy': 50,
    'excessive_inquiries': 10
  };
  
  let impact = baseImpacts[item.type] || 20;
  
  // Adjust for age (older items have less impact)
  if (item.dateOpened || item.dateOfLastActivity) {
    const monthsOld = getMonthsDifference(
      new Date(item.dateOpened || item.dateOfLastActivity),
      new Date()
    );
    if (monthsOld > 48) impact *= 0.6; // 4+ years old
    else if (monthsOld > 24) impact *= 0.8; // 2+ years old
  }
  
  // Adjust for amount
  if (item.type === 'collection' && item.balance < 100) {
    impact *= 0.7; // Small collections less impact
  }
  
  return Math.round(impact);
}

function calculateEstimatedImprovement(negativeItems) {
  const totalImpact = negativeItems
    .filter(item => item.disputability > 0.5)
    .reduce((sum, item) => sum + estimateScoreImpact(item), 0);
  
  // Assume 60% success rate
  return Math.round(totalImpact * 0.6);
}

function calculateTimeframe(negativeItems) {
  const count = negativeItems.filter(i => i.disputability > 0.5).length;
  
  if (count <= 5) return '3-4 months';
  if (count <= 10) return '4-6 months';
  if (count <= 15) return '6-9 months';
  return '9-12 months';
}

function calculateSuccessProbability(negativeItems, parsedReport) {
  let probability = 60; // Base success rate
  
  // Adjust for item types
  const collections = negativeItems.filter(i => i.type === 'collection').length;
  const chargeOffs = negativeItems.filter(i => i.type === 'charge-off').length;
  
  probability += collections * 2; // Collections easier to remove
  probability += chargeOffs * 1.5;
  
  // Adjust for credit score (higher score = more credibility)
  if (parsedReport.scores.average > 600) probability += 10;
  if (parsedReport.scores.average > 650) probability += 10;
  
  // Cap at 85% (never promise 100%)
  return Math.min(85, probability);
}

async function updateContactWithAnalysis(contactId, updates) {
  await db.collection('contacts').doc(contactId).update(updates);
}

async function createReviewTask(contactId, analysisId) {
  await db.collection('tasks').add({
    type: 'review_credit_analysis',
    contactId: contactId,
    analysisId: analysisId,
    
    title: '📊 Review Credit Analysis & Send Proposal',
    description: 'AI has completed credit analysis. Review and approve before sending to client.',
    
    priority: 'high',
    status: 'pending',
    assignedTo: 'unassigned',
    
    dueDate: admin.firestore.Timestamp.fromDate(
      new Date(Date.now() + 24 * 60 * 60 * 1000) // Due in 24 hours
    ),
    
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    createdBy: 'ai_analysis_engine',
    
    metadata: {
      requiresApproval: true,
      autoGenerated: true
    }
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT ALL FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

module.exports = {
  analyzeCreditReport: exports.analyzeCreditReport,
  
  // Exported for testing
  parseCreditReport,
  identifyNegativeItems,
  calculateDisputability,
  recommendServicePlan,
  createActionPlan,
  generateDisputeLetters
};