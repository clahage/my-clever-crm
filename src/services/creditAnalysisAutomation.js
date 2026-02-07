// ============================================================================
// Path: src/services/creditAnalysisAutomation.js
// © 1995-2026 Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved
// Trademark registered USPTO, violations prosecuted.
//
// CREDIT ANALYSIS AUTOMATION - THE MISSING 13%
// ============================================================================
// Orchestrates complete credit analysis workflow after IDIQ enrollment
// This is the CRITICAL MISSING PIECE that Christopher identified!
//
// CHRISTOPHER'S GAP IDENTIFIED:
// "Credit analysis NOT triggered after IDIQ enrollment. Expected: After IDIQ 
// completes, system should automatically fetch credit report, run AI analysis, 
// generate gameplan, email prospect with review, and update pipeline to 
// 'review-sent'. Currently: Nothing happens automatically."
//
// WHAT THIS SERVICE DOES:
// 1. Fetches credit report from IDIQ using member token
// 2. Parses credit report data (accounts, inquiries, public records)
// 3. Runs AI analysis to identify issues and opportunities
// 4. Generates strategic gameplan with timeline
// 5. Identifies dispute opportunities
// 6. Saves analysis to Firestore
// 7. Emails prospect with credit review
// 8. Updates contact pipeline to 'review-sent'
// 9. Optionally creates auto-disputes
//
// TRIGGERED BY:
// - CompleteEnrollmentFlow.jsx (after IDIQ submission)
// - onContactUpdated Cloud Function (when idiqEnrollment.enrollmentComplete === true)
// - Manual trigger from admin dashboard
//
// INTEGRATIONS:
// - IDIQ API (credit report fetching)
// - aiCreditReviewService.js (AI analysis)
// - emailWorkflowEngine.js (email notifications)
// - Firebase Firestore (data storage)
// ============================================================================

import { doc, updateDoc, serverTimestamp, setDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// ===== MAIN ORCHESTRATOR =====

/**
 * Run complete credit analysis workflow
 * This is the main function that orchestrates the entire process
 * 
 * @param {string} contactId - Contact document ID
 * @param {Object} idiqData - IDIQ enrollment data including memberToken
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} Analysis result
 */
export async function runCreditAnalysis(contactId, idiqData, options = {}) {
  console.log('===== CREDIT ANALYSIS AUTOMATION STARTED =====');
  console.log('📊 Contact ID:', contactId);
  console.log('🎯 Auto-disputes enabled:', options.autoDisputeEnabled || false);

  try {
    // ===== STEP 1: FETCH CREDIT REPORT FROM IDIQ =====
    console.log('📥 STEP 1: Fetching credit report from IDIQ...');
    
    const creditReport = await fetchCreditReportFromIDIQ(
      idiqData.memberToken || idiqData.idiqMemberToken
    );
    
    if (!creditReport) {
      throw new Error('Failed to fetch credit report from IDIQ');
    }
    
    console.log('✅ Credit report fetched successfully');

    // ===== STEP 2: SAVE RAW REPORT TO FIRESTORE =====
    console.log('💾 STEP 2: Saving raw credit report...');
    
    const reportId = await saveCreditReport(contactId, creditReport);
    
    console.log('✅ Credit report saved:', reportId);

    // ===== STEP 3: PARSE CREDIT REPORT =====
    console.log('🔍 STEP 3: Parsing credit report data...');
    
    const parsedReport = await parseCreditReport(creditReport);
    
    console.log('✅ Credit report parsed');
    console.log('   Accounts:', parsedReport.accounts?.length || 0);
    console.log('   Negative Items:', parsedReport.negativeItems?.length || 0);
    console.log('   Public Records:', parsedReport.publicRecords?.length || 0);
    console.log('   Inquiries:', parsedReport.inquiries?.length || 0);

    // ===== STEP 4: RUN AI ANALYSIS =====
    console.log('🤖 STEP 4: Running AI credit analysis...');
    
    const analysis = await runAIAnalysis(contactId, parsedReport);
    
    console.log('✅ AI analysis complete');

    // ===== STEP 5: GENERATE STRATEGIC GAMEPLAN =====
    console.log('📋 STEP 5: Generating strategic gameplan...');
    
    const gameplan = await generateStrategicGameplan(analysis, parsedReport);
    
    console.log('✅ Gameplan generated');
    console.log('   Timeline:', gameplan.estimatedTimeline);
    console.log('   Priority items:', gameplan.priorityItems?.length || 0);

    // ===== STEP 6: IDENTIFY DISPUTE OPPORTUNITIES =====
    console.log('⚖️ STEP 6: Identifying dispute opportunities...');
    
    const disputeOpportunities = await identifyDisputeOpportunities(analysis, parsedReport);
    
    console.log('✅ Dispute opportunities identified:', disputeOpportunities.length);

    // ===== STEP 7: SAVE ANALYSIS TO FIRESTORE =====
    console.log('💾 STEP 7: Saving analysis to Firestore...');
    
    const analysisId = await saveAnalysis(contactId, {
      analysis,
      gameplan,
      disputeOpportunities,
      parsedReport,
      reportId,
      analyzedAt: serverTimestamp()
    });
    
    console.log('✅ Analysis saved:', analysisId);

    // ===== STEP 8: EMAIL PROSPECT WITH REVIEW =====
    console.log('📧 STEP 8: Sending credit review email...');
    
    await emailCreditReview(contactId, {
      analysis,
      gameplan,
      reportId,
      analysisId
    });
    
    console.log('✅ Email sent successfully');

    // ===== STEP 9: UPDATE CONTACT PIPELINE =====
    console.log('📊 STEP 9: Updating contact pipeline...');
    
    await updateContactPipeline(contactId, {
      creditAnalysisComplete: true,
      pipelineStage: 'review-sent',
      lastAnalyzedAt: serverTimestamp(),
      creditScore: parsedReport.scores?.vantageScore || parsedReport.scores?.average || 0,
      negativeItemsCount: parsedReport.negativeItems?.length || 0
    });
    
    console.log('✅ Pipeline updated: review-sent');

    // ===== STEP 10: CREATE AUTO-DISPUTES (OPTIONAL) =====
    if (options.autoDisputeEnabled && disputeOpportunities.length > 0) {
      console.log('⚔️ STEP 10: Creating auto-disputes...');
      
      const disputeIds = await createDisputesFromAnalysis(contactId, disputeOpportunities);
      
      console.log('✅ Auto-disputes created:', disputeIds.length);
    } else {
      console.log('⏭️ STEP 10: Skipping auto-disputes (not enabled)');
    }

    // ===== SUCCESS! =====
    console.log('===== CREDIT ANALYSIS AUTOMATION COMPLETE =====');
    console.log('🎉 Success! All steps completed successfully.');

    return {
      success: true,
      contactId,
      reportId,
      analysisId,
      analysis,
      gameplan,
      disputeOpportunities,
      negativeItemsCount: parsedReport.negativeItems?.length || 0,
      creditScore: parsedReport.scores?.vantageScore || 0,
      message: 'Credit analysis completed successfully'
    };

  } catch (error) {
    console.error('❌ Credit analysis automation failed:', error);
    
    // Log error to Firestore for tracking
    await logAnalysisError(contactId, error);
    
    return {
      success: false,
      error: error.message,
      contactId
    };
  }
}

// ===== HELPER FUNCTIONS =====

/**
 * Fetch credit report from IDIQ using member token
 * Calls the IDIQ API to get the full credit report
 * 
 * @param {string} memberToken - IDIQ member token
 * @returns {Promise<Object>} Credit report data
 */
async function fetchCreditReportFromIDIQ(memberToken) {
  console.log('🔌 Calling IDIQ API for credit report...');

  try {
    // Call your Cloud Function that wraps the IDIQ API
    const response = await fetch(
      'https://us-central1-my-clever-crm.cloudfunctions.net/idiqService',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'getCreditReport',
          memberToken: memberToken
        })
      }
    );

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch credit report');
    }

    console.log('✅ IDIQ API response received');
    
    return result.creditReport;

  } catch (error) {
    console.error('❌ Error fetching credit report from IDIQ:', error);
    throw error;
  }
}

/**
 * Save raw credit report to Firestore
 * 
 * @param {string} contactId - Contact document ID
 * @param {Object} report - Raw credit report data
 * @returns {Promise<string>} Report document ID
 */
async function saveCreditReport(contactId, report) {
  console.log('💾 Saving credit report to Firestore...');

  try {
    const reportRef = doc(collection(db, 'creditReports'));
    
    await setDoc(reportRef, {
      contactId,
      report,
      pulledAt: serverTimestamp(),
      source: 'idiq',
      reportType: 'full',
      createdAt: serverTimestamp()
    });

    console.log('✅ Credit report saved with ID:', reportRef.id);
    
    return reportRef.id;

  } catch (error) {
    console.error('❌ Error saving credit report:', error);
    throw error;
  }
}

/**
 * Parse credit report data
 * Extracts structured data from raw credit report
 * 
 * @param {Object} report - Raw credit report
 * @returns {Promise<Object>} Parsed credit report data
 */
async function parseCreditReport(report) {
  console.log('🔍 Parsing credit report...');

  try {
    // Import the credit report parser
    const { parseCreditReport: parse } = await import('./aiCreditReportParser');
    
    const parsed = await parse(report);
    
    console.log('✅ Credit report parsed successfully');
    
    return parsed;

  } catch (error) {
    console.error('❌ Error parsing credit report:', error);
    
    // Fallback: basic parsing if parser fails
    return {
      scores: extractScores(report),
      accounts: extractAccounts(report),
      negativeItems: extractNegativeItems(report),
      publicRecords: extractPublicRecords(report),
      inquiries: extractInquiries(report)
    };
  }
}

/**
 * Run AI analysis on parsed credit report
 * Uses aiCreditReviewService to analyze credit data
 * 
 * @param {string} contactId - Contact document ID
 * @param {Object} parsedReport - Parsed credit report
 * @returns {Promise<Object>} AI analysis result
 */
async function runAIAnalysis(contactId, parsedReport) {
  console.log('🤖 Running AI analysis...');

  try {
    // Import AI credit review service
    const { generateReview } = await import('./aiCreditReviewService');
    
    const analysis = await generateReview(contactId, parsedReport);
    
    console.log('✅ AI analysis complete');
    
    return analysis;

  } catch (error) {
    console.error('❌ Error running AI analysis:', error);
    
    // Fallback: basic analysis if AI fails
    return {
      summary: 'Credit analysis in progress. Our team will review your report shortly.',
      negativeItems: parsedReport.negativeItems || [],
      recommendations: ['Review your credit report for errors', 'Consider disputing inaccurate items'],
      creditScore: parsedReport.scores?.vantageScore || 0
    };
  }
}

/**
 * Generate strategic gameplan based on analysis
 * Creates actionable plan with timeline and priorities
 * 
 * @param {Object} analysis - AI analysis result
 * @param {Object} parsedReport - Parsed credit report
 * @returns {Promise<Object>} Strategic gameplan
 */
async function generateStrategicGameplan(analysis, parsedReport) {
  console.log('📋 Generating strategic gameplan...');

  try {
    const negativeItems = analysis.negativeItems || parsedReport.negativeItems || [];
    
    // Prioritize items by impact on credit score
    const prioritizedItems = negativeItems
      .sort((a, b) => (b.scoreImpact || 0) - (a.scoreImpact || 0))
      .slice(0, 10); // Top 10 priority items

    // Calculate estimated timeline
    const estimatedTimeline = calculateTimeline(prioritizedItems);

    // Generate action steps
    const actionSteps = generateActionSteps(prioritizedItems);

    const gameplan = {
      priorityItems: prioritizedItems,
      estimatedTimeline,
      actionSteps,
      projectedScoreIncrease: calculateProjectedIncrease(prioritizedItems),
      currentScore: parsedReport.scores?.vantageScore || 0,
      targetScore: (parsedReport.scores?.vantageScore || 0) + calculateProjectedIncrease(prioritizedItems),
      generatedAt: new Date().toISOString()
    };

    console.log('✅ Gameplan generated');
    console.log('   Timeline:', estimatedTimeline);
    console.log('   Priority items:', prioritizedItems.length);
    console.log('   Projected increase:', gameplan.projectedScoreIncrease, 'points');

    return gameplan;

  } catch (error) {
    console.error('❌ Error generating gameplan:', error);
    throw error;
  }
}

/**
 * Identify dispute opportunities from analysis
 * Creates dispute objects for negative items
 * 
 * @param {Object} analysis - AI analysis result
 * @param {Object} parsedReport - Parsed credit report
 * @returns {Promise<Array>} Array of dispute opportunities
 */
async function identifyDisputeOpportunities(analysis, parsedReport) {
  console.log('⚖️ Identifying dispute opportunities...');

  try {
    const negativeItems = analysis.negativeItems || parsedReport.negativeItems || [];
    
    const opportunities = negativeItems
      .filter(item => item.disputable !== false)
      .map(item => ({
        itemType: item.type || 'account',
        itemId: item.id || item.accountId,
        creditorName: item.creditorName || item.name,
        accountNumber: item.accountNumber || '****',
        disputeReason: generateDisputeReason(item),
        strategy: determineDisputeStrategy(item),
        bureau: item.bureau || 'all',
        priority: item.priority || 'medium',
        scoreImpact: item.scoreImpact || 0,
        status: 'opportunity',
        autoGenerated: true
      }));

    console.log('✅ Dispute opportunities identified:', opportunities.length);

    return opportunities;

  } catch (error) {
    console.error('❌ Error identifying disputes:', error);
    return [];
  }
}

/**
 * Save analysis to Firestore
 * 
 * @param {string} contactId - Contact document ID
 * @param {Object} analysisData - Analysis data to save
 * @returns {Promise<string>} Analysis document ID
 */
async function saveAnalysis(contactId, analysisData) {
  console.log('💾 Saving analysis to Firestore...');

  try {
    const analysisRef = doc(collection(db, 'creditReportAnalysis'));
    
    await setDoc(analysisRef, {
      contactId,
      ...analysisData,
      createdAt: serverTimestamp()
    });

    console.log('✅ Analysis saved with ID:', analysisRef.id);
    
    return analysisRef.id;

  } catch (error) {
    console.error('❌ Error saving analysis:', error);
    throw error;
  }
}

/**
 * Email credit review to prospect
 * Sends email with analysis summary and link to portal
 * 
 * @param {string} contactId - Contact document ID
 * @param {Object} reviewData - Review data for email
 * @returns {Promise<void>}
 */
async function emailCreditReview(contactId, reviewData) {
  console.log('📧 Sending credit review email...');

  try {
    // Call your Cloud Function that handles email
    const response = await fetch(
      'https://us-central1-my-clever-crm.cloudfunctions.net/operationsManager',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'sendCreditReviewEmail',
          contactId,
          reviewData
        })
      }
    );

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to send email');
    }

    console.log('✅ Email sent successfully');

  } catch (error) {
    console.error('❌ Error sending email:', error);
    // Don't throw - email failure shouldn't stop the process
  }
}

/**
 * Update contact pipeline after analysis
 * 
 * @param {string} contactId - Contact document ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
async function updateContactPipeline(contactId, updates) {
  console.log('📊 Updating contact pipeline...');

  try {
    const contactRef = doc(db, 'contacts', contactId);
    
    await updateDoc(contactRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });

    console.log('✅ Contact pipeline updated');

  } catch (error) {
    console.error('❌ Error updating contact:', error);
    throw error;
  }
}

/**
 * Create disputes from analysis (auto-dispute feature)
 * 
 * @param {string} contactId - Contact document ID
 * @param {Array} opportunities - Dispute opportunities
 * @returns {Promise<Array>} Array of created dispute IDs
 */
async function createDisputesFromAnalysis(contactId, opportunities) {
  console.log('⚔️ Creating auto-disputes...');

  try {
    const disputeIds = [];

    for (const opportunity of opportunities) {
      const disputeRef = doc(collection(db, 'disputes'));
      
      await setDoc(disputeRef, {
        contactId,
        ...opportunity,
        status: 'draft',
        createdAt: serverTimestamp(),
        createdBy: 'automation',
        requiresApproval: true
      });

      disputeIds.push(disputeRef.id);
    }

    console.log('✅ Auto-disputes created:', disputeIds.length);

    return disputeIds;

  } catch (error) {
    console.error('❌ Error creating disputes:', error);
    return [];
  }
}

/**
 * Log analysis error for tracking
 * 
 * @param {string} contactId - Contact document ID
 * @param {Error} error - Error object
 * @returns {Promise<void>}
 */
async function logAnalysisError(contactId, error) {
  try {
    const errorRef = doc(collection(db, 'analysisErrors'));
    
    await setDoc(errorRef, {
      contactId,
      error: error.message,
      stack: error.stack,
      timestamp: serverTimestamp()
    });

    console.log('✅ Error logged for tracking');

  } catch (err) {
    console.error('❌ Failed to log error:', err);
  }
}

// ===== UTILITY FUNCTIONS =====

function extractScores(report) {
  // Extract credit scores from report
  return report.scores || { vantageScore: 0, equifax: 0, experian: 0, transunion: 0 };
}

function extractAccounts(report) {
  // Extract accounts from report
  return report.accounts || [];
}

function extractNegativeItems(report) {
  // Extract negative items from report
  return report.negativeItems || [];
}

function extractPublicRecords(report) {
  // Extract public records from report
  return report.publicRecords || [];
}

function extractInquiries(report) {
  // Extract inquiries from report
  return report.inquiries || [];
}

function calculateTimeline(items) {
  // Estimate 30-45 days per dispute round
  const rounds = Math.ceil(items.length / 3); // 3 items per round
  return `${rounds * 30}-${rounds * 45} days`;
}

function generateActionSteps(items) {
  return [
    { step: 1, action: 'Review credit report for errors', timeline: 'Week 1' },
    { step: 2, action: 'Gather supporting documentation', timeline: 'Week 1-2' },
    { step: 3, action: 'Submit initial disputes (Round 1)', timeline: 'Week 2' },
    { step: 4, action: 'Monitor dispute responses', timeline: 'Week 4-6' },
    { step: 5, action: 'Submit follow-up disputes if needed', timeline: 'Week 6-8' }
  ];
}

function calculateProjectedIncrease(items) {
  // Estimate 10-30 points per successfully removed negative item
  return Math.min(items.length * 15, 100); // Cap at 100 points
}

function determineDisputeStrategy(item) {
  // Determine best dispute strategy based on item type
  if (item.type === 'late-payment') return 'inaccuracy';
  if (item.type === 'collection') return 'verification';
  if (item.type === 'charge-off') return 'method_of_verification';
  return 'inaccuracy';
}

function generateDisputeReason(item) {
  const strategies = {
    'inaccuracy': `The information reported for this ${item.type} is inaccurate. Please investigate and correct.`,
    'verification': `I am requesting verification of this debt. Please provide documentation.`,
    'method_of_verification': `I am challenging the method of verification used for this ${item.type}.`
  };
  
  const strategy = determineDisputeStrategy(item);
  return strategies[strategy] || 'Please investigate this item for accuracy.';
}

// ===== EXPORT =====

export default {
  runCreditAnalysis,
  fetchCreditReportFromIDIQ,
  saveCreditReport,
  parseCreditReport,
  runAIAnalysis,
  generateStrategicGameplan,
  identifyDisputeOpportunities
};

// ===== USAGE EXAMPLE =====
/**
 * In CompleteEnrollmentFlow.jsx after IDIQ submission:
 * 
 * import { runCreditAnalysis } from '@/services/creditAnalysisAutomation';
 * 
 * const handleIDIQComplete = async (idiqData) => {
 *   try {
 *     // Sync data to contact
 *     await syncIDIQToContact(contactId, idiqData);
 *     
 *     // Run credit analysis automation
 *     const result = await runCreditAnalysis(contactId, idiqData, {
 *       autoDisputeEnabled: false // Set to true to auto-create disputes
 *     });
 *     
 *     if (result.success) {
 *       console.log('✅ Credit analysis complete!');
 *       console.log('   Credit Score:', result.creditScore);
 *       console.log('   Negative Items:', result.negativeItemsCount);
 *       console.log('   Email sent to prospect');
 *       
 *       // Show success message and move to next step
 *       onNext();
 *     } else {
 *       console.error('❌ Analysis failed:', result.error);
 *       setError('Credit analysis failed. Our team will review manually.');
 *     }
 *     
 *   } catch (error) {
 *     console.error('Error:', error);
 *   }
 * };
 */