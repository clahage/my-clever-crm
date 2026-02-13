// ============================================================================
// AI CREDIT REVIEW SERVICE - TIER 5+ ENTERPRISE EDITION
// ============================================================================
// Path: src/services/aiCreditReviewService.js
//
// AI-Powered Credit Review Generation Service
// Generates initial reviews and monthly updates with affiliate suggestions
//
// FEATURES:
// ✅ Initial free credit review generation
// ✅ Monthly client update reviews
// ✅ On-demand review generation
// ✅ AI-powered content via Cloud Functions (secure)
// ✅ Affiliate product recommendations
// ✅ Review storage and management
// ✅ Email integration ready
// ✅ Multi-status workflow (draft, pending, approved, sent)
// ✅ Comprehensive error handling
// ✅ No external dependencies
//
// © 1995-2026 Speedy Credit Repair Inc. | Christopher Lahage
// ============================================================================

import { httpsCallable } from 'firebase/functions';
import { functions, db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit, 
  doc, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { analyzeCreditProfile } from '@/services/aiCreditAnalyzer';

// ============================================================================
// REVIEW TYPES AND STATUS
// ============================================================================

export const REVIEW_TYPES = {
  INITIAL: 'initial',      // Free credit review offer
  MONTHLY: 'monthly',      // Monthly update for clients
  ONDEMAND: 'ondemand'     // Admin-requested review
};

export const REVIEW_STATUS = {
  DRAFT: 'draft',
  PENDING_REVIEW: 'pending_review',
  APPROVED: 'approved',
  SENT: 'sent',
  FAILED: 'failed'
};

// ============================================================================
// MAIN REVIEW GENERATION FUNCTIONS
// ============================================================================

/**
 * Generate initial credit review (Free offer)
 * This is what converts leads to clients!
 * 
 * @param {object} reportData - Credit report data
 * @param {object} clientGoals - Client's stated goals (optional)
 * @returns {Promise<object>} Complete review with AI content + affiliate suggestions
 */
export async function generateInitialReview(reportData, clientGoals = null) {
  console.log('🧠 Generating initial credit review for:', reportData.clientEmail);

  try {
    // Validate input
    if (!reportData || !reportData.clientEmail) {
      throw new Error('Report data with client email is required');
    }

    // ===== STEP 1: ANALYZE CREDIT PROFILE =====
    console.log('📊 Step 1: Analyzing credit profile...');
    const analysis = await analyzeCreditProfile({
      currentScore: reportData.scores?.vantage?.score || reportData.vantageScore || 650,
      negativeItems: reportData.parsedData?.negatives || reportData.negativeItems || [],
      positiveItems: reportData.parsedData?.positives || reportData.positiveItems || [],
      utilization: reportData.parsedData?.utilization || reportData.utilization || 50,
      ageOfCredit: reportData.parsedData?.ageOfCredit || reportData.ageOfCredit || 5,
      hardInquiries: reportData.parsedData?.hardInquiries?.length || reportData.hardInquiries || 0,
      publicRecords: reportData.parsedData?.publicRecords?.length || reportData.publicRecords || 0,
      collections: reportData.parsedData?.collections || reportData.collections || [],
      latePayments: reportData.parsedData?.latePayments || reportData.latePayments || [],
      tradelines: reportData.parsedData?.tradelines || reportData.tradelines || [],
    });

    console.log(`✅ Analysis complete - Health Score: ${analysis.healthScore}/100`);

    // ===== STEP 2: GENERATE AI REVIEW CONTENT =====
    console.log('✍️ Step 2: Generating AI review content...');
    const aiContent = await generateReviewContent(reportData, analysis, clientGoals);
    console.log('✅ AI content generated');

    // ===== STEP 3: GET AFFILIATE SUGGESTIONS (WITH FALLBACK) =====
    console.log('🔗 Step 3: Getting affiliate suggestions...');
    let affiliateSuggestions = [];
    try {
      const { suggestProducts } = await import('@/services/affiliateLinkService');
      affiliateSuggestions = await suggestProducts(
        {
          email: reportData.clientEmail,
          score: reportData.scores?.vantage?.score || reportData.vantageScore,
          goals: clientGoals,
          profile: analysis
        },
        analysis
      );
      console.log(`✅ ${affiliateSuggestions.length} affiliate products suggested`);
    } catch (affiliateError) {
      console.warn('⚠️ Affiliate suggestions failed (non-blocking):', affiliateError.message);
      // Continue without affiliate suggestions
    }

    // ===== STEP 4: CREATE REVIEW OBJECT =====
    const review = {
      type: REVIEW_TYPES.INITIAL,
      reportId: reportData.id || null,
      clientEmail: reportData.clientEmail,
      clientName: reportData.clientName || 'Valued Client',
      generatedAt: new Date().toISOString(),
      
      // AI-generated content
      aiContent: {
        summary: aiContent.summary,
        positives: aiContent.positives || [],
        negatives: aiContent.negatives || [],
        recommendations: aiContent.recommendations || [],
        estimatedImpact: aiContent.estimatedImpact,
        callToAction: aiContent.callToAction,
      },
      
      // Analysis results
      analysis: {
        healthScore: analysis.healthScore,
        overallHealth: analysis.overallHealth,
        keyIssues: analysis.keyIssues.slice(0, 5), // Top 5 issues
        opportunities: analysis.opportunities.slice(0, 3), // Top 3 opportunities
        estimatedImpact: analysis.estimatedImpact,
      },
      
      // Affiliate suggestions
      affiliateProducts: affiliateSuggestions.slice(0, 3), // Top 3 products
      
      // Metadata
      status: REVIEW_STATUS.DRAFT,
      createdAt: new Date().toISOString(),
      createdBy: 'system',
      emailSent: false,
      viewedByClient: false,
    };

    // ===== STEP 5: SAVE REVIEW TO FIRESTORE =====
    console.log('💾 Step 5: Saving review to Firestore...');
    const reviewRef = await addDoc(collection(db, 'creditReviews'), {
      ...review,
      createdAt: serverTimestamp(),
    });

    console.log(`✅ Initial review generated successfully: ${reviewRef.id}`);

    return {
      success: true,
      reviewId: reviewRef.id,
      review: review,
    };

  } catch (error) {
    console.error('❌ Initial review generation error:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate initial review',
    };
  }
}

/**
 * Generate monthly credit review update for existing clients
 * 
 * @param {string} clientEmail - Client email address
 * @param {object} latestReportData - Most recent credit report data
 * @returns {Promise<object>} Monthly review with progress tracking
 */
export async function generateMonthlyReview(clientEmail, latestReportData) {
  console.log('📅 Generating monthly review for:', clientEmail);

  try {
    if (!clientEmail || !latestReportData) {
      throw new Error('Client email and report data required');
    }

    // ===== STEP 1: GET PREVIOUS REVIEW FOR COMPARISON =====
    console.log('🔍 Fetching previous review...');
    const previousReview = await getLatestReview(clientEmail);

    // ===== STEP 2: ANALYZE CURRENT CREDIT PROFILE =====
    console.log('📊 Analyzing current credit profile...');
    const currentAnalysis = await analyzeCreditProfile({
      currentScore: latestReportData.vantageScore || 650,
      negativeItems: latestReportData.negativeItems || [],
      positiveItems: latestReportData.positiveItems || [],
      utilization: latestReportData.utilization || 50,
      ageOfCredit: latestReportData.ageOfCredit || 5,
      hardInquiries: latestReportData.hardInquiries || 0,
      publicRecords: latestReportData.publicRecords || 0,
      collections: latestReportData.collections || [],
      latePayments: latestReportData.latePayments || [],
      tradelines: latestReportData.tradelines || [],
    });

    // ===== STEP 3: CALCULATE PROGRESS =====
    console.log('📈 Calculating progress...');
    const progress = calculateProgress(previousReview, currentAnalysis, latestReportData);

    // ===== STEP 4: GENERATE MONTHLY UPDATE CONTENT =====
    console.log('✍️ Generating monthly update content...');
    const aiContent = await generateMonthlyUpdateContent(
      currentAnalysis,
      progress,
      latestReportData
    );

    // ===== STEP 5: CREATE MONTHLY REVIEW =====
    const review = {
      type: REVIEW_TYPES.MONTHLY,
      clientEmail,
      clientName: latestReportData.clientName || 'Valued Client',
      generatedAt: new Date().toISOString(),
      
      // Progress tracking
      progress: {
        scoreChange: progress.scoreChange,
        itemsDeleted: progress.itemsDeleted,
        newNegatives: progress.newNegatives,
        utilizationChange: progress.utilizationChange,
        timeInProgram: progress.timeInProgram,
      },
      
      // AI content
      aiContent: {
        summary: aiContent.summary,
        achievements: aiContent.achievements || [],
        challenges: aiContent.challenges || [],
        nextSteps: aiContent.nextSteps || [],
        encouragement: aiContent.encouragement,
      },
      
      // Current analysis
      analysis: {
        healthScore: currentAnalysis.healthScore,
        overallHealth: currentAnalysis.overallHealth,
        keyIssues: currentAnalysis.keyIssues.slice(0, 5),
        opportunities: currentAnalysis.opportunities.slice(0, 3),
      },
      
      // Metadata
      status: REVIEW_STATUS.DRAFT,
      createdAt: new Date().toISOString(),
      createdBy: 'system',
      emailSent: false,
      previousReviewId: previousReview?.id || null,
    };

    // ===== STEP 6: SAVE TO FIRESTORE =====
    const reviewRef = await addDoc(collection(db, 'creditReviews'), {
      ...review,
      createdAt: serverTimestamp(),
    });

    console.log(`✅ Monthly review generated: ${reviewRef.id}`);

    return {
      success: true,
      reviewId: reviewRef.id,
      review: review,
    };

  } catch (error) {
    console.error('❌ Monthly review generation error:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate monthly review',
    };
  }
}

// ============================================================================
// AI CONTENT GENERATION (VIA CLOUD FUNCTIONS)
// ============================================================================

/**
 * Generate review content using AI via Cloud Functions
 * Secure server-side AI processing
 */
async function generateReviewContent(reportData, analysis, clientGoals) {
  console.log('🤖 Generating AI review content...');

  try {
    const aiContentGenerator = httpsCallable(functions, 'aiContentGenerator');
    
    const result = await aiContentGenerator({
      type: 'generateCreditReview',
      params: {
        clientName: reportData.clientName || 'Valued Client',
        currentScore: reportData.scores?.vantage?.score || reportData.vantageScore || 650,
        healthScore: analysis.healthScore,
        overallHealth: analysis.overallHealth,
        keyIssues: analysis.keyIssues.slice(0, 5).map(i => ({
          title: i.title,
          severity: i.severity,
          impact: i.estimatedScoreImpact,
        })),
        opportunities: analysis.opportunities.slice(0, 3).map(o => ({
          title: o.opportunity,
          potential: o.potential,
          timeline: o.timeline,
        })),
        estimatedImpact: analysis.estimatedImpact,
        clientGoals: clientGoals || null,
      },
    });

    if (result.data?.success && result.data?.content) {
      console.log('✅ AI content generated');
      return result.data.content;
    } else {
      // Fallback to template-based content
      console.warn('⚠️ AI content unavailable, using fallback template');
      return generateFallbackContent(reportData, analysis);
    }

  } catch (error) {
    console.warn('⚠️ AI content generation failed:', error.message);
    return generateFallbackContent(reportData, analysis);
  }
}

/**
 * Generate monthly update content via AI
 */
async function generateMonthlyUpdateContent(analysis, progress, reportData) {
  console.log('🤖 Generating monthly update content...');

  try {
    const aiContentGenerator = httpsCallable(functions, 'aiContentGenerator');
    
    const result = await aiContentGenerator({
      type: 'generateMonthlyUpdate',
      params: {
        clientName: reportData.clientName || 'Valued Client',
        scoreChange: progress.scoreChange,
        itemsDeleted: progress.itemsDeleted,
        newNegatives: progress.newNegatives,
        timeInProgram: progress.timeInProgram,
        healthScore: analysis.healthScore,
        keyIssues: analysis.keyIssues.slice(0, 3).map(i => i.title),
        opportunities: analysis.opportunities.slice(0, 3).map(o => o.opportunity),
      },
    });

    if (result.data?.success && result.data?.content) {
      return result.data.content;
    } else {
      return generateFallbackMonthlyContent(analysis, progress);
    }

  } catch (error) {
    console.warn('⚠️ Monthly update AI failed:', error.message);
    return generateFallbackMonthlyContent(analysis, progress);
  }
}

// ============================================================================
// FALLBACK CONTENT GENERATION (NO AI REQUIRED)
// ============================================================================

/**
 * Generate fallback content when AI is unavailable
 */
function generateFallbackContent(reportData, analysis) {
  const score = reportData.scores?.vantage?.score || reportData.vantageScore || 650;
  const name = reportData.clientName || 'Valued Client';

  return {
    summary: `Hi ${name}, based on our analysis of your credit report, your current VantageScore is ${score}. We've identified ${analysis.keyIssues.length} key issues that are affecting your score, along with ${analysis.opportunities.length} opportunities for improvement.`,
    
    positives: analysis.strengths.map(s => s.factor),
    
    negatives: analysis.keyIssues.map(i => ({
      issue: i.title,
      severity: i.severity,
      impact: i.estimatedScoreImpact,
      solution: i.recommendation,
    })),
    
    recommendations: analysis.recommendations.map(r => ({
      priority: r.priority,
      action: r.action,
      impact: r.impact,
      timeline: r.timeline,
    })),
    
    estimatedImpact: `With professional credit repair, you could potentially increase your score by ${analysis.estimatedImpact.scoreIncrease} over the next ${analysis.estimatedImpact.timeline}.`,
    
    callToAction: `Ready to start improving your credit? Our credit repair specialists can help you address these issues and work toward your financial goals. Schedule a free consultation today!`,
  };
}

/**
 * Generate fallback monthly update content
 */
function generateFallbackMonthlyContent(analysis, progress) {
  return {
    summary: `Here's your monthly credit update. ${progress.scoreChange >= 0 ? `Great news - your score improved by ${progress.scoreChange} points!` : `Your score decreased by ${Math.abs(progress.scoreChange)} points this month.`}`,
    
    achievements: [
      progress.itemsDeleted > 0 ? `✅ ${progress.itemsDeleted} negative items removed` : null,
      progress.utilizationChange < 0 ? `✅ Utilization improved by ${Math.abs(progress.utilizationChange)}%` : null,
    ].filter(Boolean),
    
    challenges: analysis.keyIssues.slice(0, 3).map(i => i.title),
    
    nextSteps: analysis.recommendations.slice(0, 3).map(r => r.action),
    
    encouragement: progress.scoreChange >= 0 
      ? `You're making excellent progress! Keep up the great work.`
      : `Don't get discouraged - credit repair takes time. Stay consistent with the plan.`,
  };
}

// ============================================================================
// PROGRESS CALCULATION
// ============================================================================

/**
 * Calculate progress between reviews
 */
function calculateProgress(previousReview, currentAnalysis, currentData) {
  if (!previousReview) {
    return {
      scoreChange: 0,
      itemsDeleted: 0,
      newNegatives: 0,
      utilizationChange: 0,
      timeInProgram: 0,
    };
  }

  const previousScore = previousReview.analysis?.currentScore || 650;
  const currentScore = currentData.vantageScore || 650;
  
  const previousNegatives = previousReview.analysis?.keyIssues?.length || 0;
  const currentNegatives = currentAnalysis.keyIssues.length;
  
  const previousUtil = previousReview.analysis?.utilization || 50;
  const currentUtil = currentData.utilization || 50;

  const startDate = new Date(previousReview.createdAt);
  const timeInProgram = Math.floor((Date.now() - startDate) / (1000 * 60 * 60 * 24 * 30));

  return {
    scoreChange: currentScore - previousScore,
    itemsDeleted: Math.max(0, previousNegatives - currentNegatives),
    newNegatives: Math.max(0, currentNegatives - previousNegatives),
    utilizationChange: currentUtil - previousUtil,
    timeInProgram,
  };
}

// ============================================================================
// REVIEW RETRIEVAL FUNCTIONS
// ============================================================================

/**
 * Get pending reviews (for admin dashboard)
 */
export async function getPendingReviews() {
  try {
    const q = query(
      collection(db, 'creditReviews'),
      where('status', '==', REVIEW_STATUS.PENDING_REVIEW),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const snapshot = await getDocs(q);
    const reviews = [];

    snapshot.forEach(doc => {
      reviews.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()?.toISOString() || null,
      });
    });

    return reviews;

  } catch (error) {
    console.error('❌ Error fetching pending reviews:', error);
    return [];
  }
}

/**
 * Get all reviews for a specific client
 */
export async function getClientReviews(clientEmail) {
  try {
    const q = query(
      collection(db, 'creditReviews'),
      where('clientEmail', '==', clientEmail),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const reviews = [];

    snapshot.forEach(doc => {
      reviews.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()?.toISOString() || null,
      });
    });

    return reviews;

  } catch (error) {
    console.error('❌ Error fetching client reviews:', error);
    return [];
  }
}

/**
 * Get latest review for a client
 */
async function getLatestReview(clientEmail) {
  try {
    const q = query(
      collection(db, 'creditReviews'),
      where('clientEmail', '==', clientEmail),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()?.toISOString() || null,
    };

  } catch (error) {
    console.error('❌ Error fetching latest review:', error);
    return null;
  }
}

// ============================================================================
// REVIEW MANAGEMENT FUNCTIONS
// ============================================================================

/**
 * Update review status
 */
export async function updateReviewStatus(reviewId, newStatus) {
  try {
    const reviewRef = doc(db, 'creditReviews', reviewId);
    
    await updateDoc(reviewRef, {
      status: newStatus,
      updatedAt: serverTimestamp(),
    });

    console.log(`✅ Review ${reviewId} status updated to ${newStatus}`);
    return { success: true };

  } catch (error) {
    console.error('❌ Error updating review status:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Mark review as sent
 */
export async function markReviewAsSent(reviewId, sentAt = new Date()) {
  try {
    const reviewRef = doc(db, 'creditReviews', reviewId);
    
    await updateDoc(reviewRef, {
      status: REVIEW_STATUS.SENT,
      emailSent: true,
      sentAt: sentAt.toISOString(),
      updatedAt: serverTimestamp(),
    });

    console.log(`✅ Review ${reviewId} marked as sent`);
    return { success: true };

  } catch (error) {
    console.error('❌ Error marking review as sent:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Mark review as viewed by client
 */
export async function markReviewAsViewed(reviewId) {
  try {
    const reviewRef = doc(db, 'creditReviews', reviewId);
    
    await updateDoc(reviewRef, {
      viewedByClient: true,
      viewedAt: new Date().toISOString(),
      updatedAt: serverTimestamp(),
    });

    console.log(`✅ Review ${reviewId} marked as viewed`);
    return { success: true };

  } catch (error) {
    console.error('❌ Error marking review as viewed:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  // Generation
  generateInitialReview,
  generateMonthlyReview,
  
  // Retrieval
  getPendingReviews,
  getClientReviews,
  
  // Management
  updateReviewStatus,
  markReviewAsSent,
  markReviewAsViewed,
  
  // Constants
  REVIEW_TYPES,
  REVIEW_STATUS,
};