// src/services/aiCreditReviewService.js
// AI-Powered Credit Review Generation Service
// Generates initial reviews and monthly updates with affiliate suggestions

import OpenAI from 'openai';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, orderBy, limit, doc, updateDoc } from 'firebase/firestore';
import { analyzeCreditProfile } from '@/services/aiCreditAnalyzer';
import { suggestProducts } from '@/services/affiliateLinkService';

// ============================================================================
// OPENAI CONFIGURATION
// ============================================================================

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

// ============================================================================
// REVIEW TYPES
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
// MAIN FUNCTIONS
// ============================================================================

/**
 * Generate initial credit review (Free offer)
 * This is what converts leads to clients!
 * 
 * @param {object} reportData - Credit report data
 * @param {object} clientGoals - Client's stated goals
 * @returns {object} Complete review with AI content + affiliate suggestions
 */
export async function generateInitialReview(reportData, clientGoals = null) {
  console.log('🧠 Generating initial credit review for:', reportData.clientEmail);

  try {
    // Step 1: Analyze the credit profile
    const analysis = await analyzeCreditProfile({
      currentScore: reportData.scores?.vantage?.score || 650,
      negativeItems: reportData.parsedData?.negatives || [],
      positiveItems: reportData.parsedData?.positives || [],
      utilization: reportData.parsedData?.utilization || 50,
      ageOfCredit: reportData.parsedData?.ageOfCredit || 5,
      hardInquiries: reportData.parsedData?.hardInquiries?.length || 0,
      publicRecords: reportData.parsedData?.publicRecords?.length || 0,
      collections: reportData.parsedData?.collections || [],
      latePayments: reportData.parsedData?.latePayments || []
    });

    // Step 2: Generate AI review content
    const aiContent = await generateReviewContent(reportData, analysis, clientGoals);

    // Step 3: Get affiliate suggestions
    const affiliateSuggestions = await suggestProducts(
      {
        email: reportData.clientEmail,
        score: reportData.scores?.vantage?.score,
        goals: clientGoals,
        profile: analysis
      },
      analysis
    );

    // Step 4: Create review object
    const review = {
      type: REVIEW_TYPES.INITIAL,
      reportId: reportData.id,
      clientEmail: reportData.clientEmail,
      clientName: reportData.clientName,
      generatedAt: new Date().toISOString(),
      
      // AI-generated content
      aiContent: {
        summary: aiContent.summary,
        positives: aiContent.positives,
        negatives: aiContent.negatives,
        quickWins: aiContent.quickWins,
        longTermPlan: aiContent.longTermPlan,
        scoreImpact: aiContent.scoreImpact,
        educationalContent: aiContent.educationalContent
      },

      // Affiliate suggestions
      affiliateSuggestions: affiliateSuggestions,

      // Analysis data
      analysis: {
        healthScore: analysis.healthScore,
        overallHealth: analysis.overallHealth,
        estimatedImpact: analysis.estimatedImpact
      },

      // Human review tracking
      humanReview: {
        required: true,  // Initially requires human approval
        reviewed: false,
        reviewedBy: null,
        reviewedAt: null,
        approved: false,
        edits: null,
        comments: null
      },

      // Status
      status: REVIEW_STATUS.DRAFT,
      sentAt: null,
      deliveryMethod: null,

      // Metadata
      aiModel: 'gpt-4',
      tokensUsed: aiContent.tokensUsed || 0,
      confidence: aiContent.confidence || 85
    };

    // Step 5: Save to Firestore
    const reviewId = await saveReview(review);

    console.log('✅ Initial review generated:', reviewId);

    return {
      success: true,
      reviewId,
      review
    };

  } catch (error) {
    console.error('❌ Error generating initial review:', error);
    throw error;
  }
}

/**
 * Generate monthly update review
 * Compares current report with previous and explains changes
 * 
 * @param {object} currentReport - Latest credit report
 * @param {object} previousReport - Previous credit report
 * @returns {object} Monthly update review
 */
export async function generateMonthlyUpdate(currentReport, previousReport) {
  console.log('📊 Generating monthly update for:', currentReport.clientEmail);

  try {
    // Import comparison service
    const { compareReports } = await import('@/services/creditComparisonService');

    // Step 1: Compare reports
    const comparison = await compareReports(currentReport, previousReport);

    // Step 2: Generate update content with AI
    const updateContent = await generateUpdateContent(comparison, currentReport);

    // Step 3: Get updated affiliate suggestions based on changes
    const affiliateSuggestions = await suggestProducts(
      {
        email: currentReport.clientEmail,
        score: currentReport.scores?.vantage?.score,
        profile: comparison
      },
      comparison
    );

    // Step 4: Create review object
    const review = {
      type: REVIEW_TYPES.MONTHLY,
      reportId: currentReport.id,
      previousReportId: previousReport.id,
      clientEmail: currentReport.clientEmail,
      clientName: currentReport.clientName,
      generatedAt: new Date().toISOString(),

      // AI-generated content
      aiContent: {
        summary: updateContent.summary,
        scoreChanges: updateContent.scoreChanges,
        whatChanged: updateContent.whatChanged,
        whyItChanged: updateContent.whyItChanged,
        recommendations: updateContent.recommendations,
        progressUpdate: updateContent.progressUpdate,
        nextSteps: updateContent.nextSteps
      },

      // Comparison data
      comparison: {
        scoreChanges: comparison.scoreChanges,
        accountChanges: comparison.accountChanges,
        utilizationChange: comparison.utilizationChange,
        negativeItemChanges: comparison.negativeItemChanges
      },

      // Affiliate suggestions
      affiliateSuggestions: affiliateSuggestions,

      // Human review tracking (can be automated after training)
      humanReview: {
        required: false,  // Set to false for automation mode
        reviewed: false,
        reviewedBy: null,
        reviewedAt: null,
        approved: true,   // Auto-approve in automation mode
        edits: null,
        comments: null
      },

      // Status
      status: REVIEW_STATUS.APPROVED,  // Auto-approved in automation mode
      sentAt: null,
      deliveryMethod: null,

      // Metadata
      aiModel: 'gpt-4',
      tokensUsed: updateContent.tokensUsed || 0,
      confidence: updateContent.confidence || 90
    };

    // Step 5: Save to Firestore
    const reviewId = await saveReview(review);

    console.log('✅ Monthly update generated:', reviewId);

    return {
      success: true,
      reviewId,
      review
    };

  } catch (error) {
    console.error('❌ Error generating monthly update:', error);
    throw error;
  }
}

// ============================================================================
// AI CONTENT GENERATION
// ============================================================================

/**
 * Generate review content using OpenAI
 */
async function generateReviewContent(reportData, analysis, clientGoals) {
  console.log('🤖 Calling OpenAI to generate review content...');

  try {
    const score = reportData.scores?.vantage?.score || 'Unknown';
    const healthScore = analysis.healthScore;
    const keyIssues = analysis.keyIssues.join(', ');
    const strengths = analysis.strengths.join(', ');
    const opportunities = analysis.opportunities.join(', ');

    const goalText = clientGoals 
      ? `The client's goal is: ${clientGoals.primary || 'general credit improvement'}.`
      : 'The client wants general credit improvement.';

    const prompt = `You are a professional credit repair expert. Write a comprehensive credit review for a client.

CLIENT PROFILE:
- Current Credit Score: ${score}
- Credit Health: ${healthScore}/100 (${analysis.overallHealth})
- Key Issues: ${keyIssues || 'None identified'}
- Strengths: ${strengths || 'Building credit history'}
- Opportunities: ${opportunities || 'Continue monitoring'}
${goalText}

INSTRUCTIONS:
1. Write a friendly, professional 2-3 paragraph summary explaining their credit situation
2. List 3-5 positive findings (things they're doing well)
3. List 3-5 negative findings (areas for improvement)
4. Provide 3-4 "quick wins" - easy actions they can take this month
5. Provide 4-6 long-term strategies for credit building
6. Estimate potential score increase and timeframe
7. Add educational content about credit scores

TONE: Encouraging, professional, not salesy. Focus on empowerment and education.

OUTPUT FORMAT (JSON):
{
  "summary": "2-3 paragraph overview",
  "positives": ["Positive finding 1", "Positive finding 2", ...],
  "negatives": ["Negative finding 1", "Negative finding 2", ...],
  "quickWins": ["Quick win 1", "Quick win 2", ...],
  "longTermPlan": ["Strategy 1", "Strategy 2", ...],
  "scoreImpact": {
    "estimated": 45,
    "timeframe": "3-6 months",
    "explanation": "Brief explanation of how we calculated this"
  },
  "educationalContent": "1 paragraph explaining credit score factors relevant to their situation"
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert credit counselor. Provide accurate, helpful, and encouraging credit advice. Always output valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const content = JSON.parse(response.choices[0].message.content);

    return {
      ...content,
      tokensUsed: response.usage?.total_tokens || 0,
      confidence: 85
    };

  } catch (error) {
    console.error('❌ OpenAI generation error:', error);
    
    // Fallback content if OpenAI fails
    return generateFallbackContent(reportData, analysis);
  }
}

/**
 * Generate monthly update content using OpenAI
 */
async function generateUpdateContent(comparison, currentReport) {
  console.log('🤖 Calling OpenAI to generate monthly update...');

  try {
    const scoreChange = comparison.scoreChanges?.vantage?.change || 0;
    const direction = scoreChange > 0 ? 'increased' : scoreChange < 0 ? 'decreased' : 'remained stable';

    const prompt = `You are a credit repair expert providing a monthly progress update.

SCORE CHANGES:
- VantageScore: ${comparison.scoreChanges?.vantage?.previous || 'N/A'} → ${comparison.scoreChanges?.vantage?.current || 'N/A'} (${scoreChange > 0 ? '+' : ''}${scoreChange} points)
- Overall: Score ${direction}

ACCOUNT CHANGES:
- New Accounts: ${comparison.accountChanges?.newAccounts?.length || 0}
- Closed Accounts: ${comparison.accountChanges?.closedAccounts?.length || 0}
- Balance Changes: ${comparison.accountChanges?.balanceChanges?.length || 0}

UTILIZATION:
- Previous: ${comparison.utilizationChange?.previous || 'N/A'}%
- Current: ${comparison.utilizationChange?.current || 'N/A'}%
- Change: ${comparison.utilizationChange?.change || 0}%

NEGATIVE ITEMS:
- Removed: ${comparison.negativeItemChanges?.removed?.length || 0}
- Added: ${comparison.negativeItemChanges?.added?.length || 0}

INSTRUCTIONS:
1. Write a 2 paragraph summary of their progress this month
2. Explain what changed (list 3-5 key changes)
3. Explain WHY these changes happened (causes)
4. Provide 3-5 new recommendations based on progress
5. Give an encouraging progress update
6. Outline 2-3 next steps for continued improvement

TONE: Encouraging and celebratory if positive, supportive and strategic if negative.

OUTPUT FORMAT (JSON):
{
  "summary": "2 paragraph progress summary",
  "scoreChanges": "Explanation of score movement",
  "whatChanged": ["Change 1", "Change 2", ...],
  "whyItChanged": ["Cause 1", "Cause 2", ...],
  "recommendations": ["Recommendation 1", "Recommendation 2", ...],
  "progressUpdate": "Encouraging paragraph about their progress",
  "nextSteps": ["Next step 1", "Next step 2", ...]
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an encouraging credit counselor providing monthly progress updates. Always output valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });

    const content = JSON.parse(response.choices[0].message.content);

    return {
      ...content,
      tokensUsed: response.usage?.total_tokens || 0,
      confidence: 90
    };

  } catch (error) {
    console.error('❌ OpenAI update generation error:', error);
    return generateFallbackUpdate(comparison);
  }
}

/**
 * Fallback content if OpenAI fails
 */
function generateFallbackContent(reportData, analysis) {
  return {
    summary: `Thank you for requesting your free credit review. Your current credit score is ${reportData.scores?.vantage?.score || 'unavailable'}, and your overall credit health is ${analysis.overallHealth}. We've identified several opportunities to improve your credit profile and increase your score.\n\nOur analysis shows that ${analysis.keyIssues.length} key issues are impacting your credit score, but the good news is that many of these can be addressed with the right strategy. We estimate you could see improvement within the next few months by following our recommendations.`,
    
    positives: analysis.strengths.length > 0 
      ? analysis.strengths 
      : ['Building credit history', 'Active credit monitoring', 'Taking steps to improve'],
    
    negatives: analysis.keyIssues.length > 0
      ? analysis.keyIssues
      : ['Continue monitoring credit', 'Maintain good payment habits'],
    
    quickWins: [
      'Set up automatic payments for all accounts',
      'Pay down high-balance credit cards',
      'Dispute any inaccurate items on your report',
      'Avoid applying for new credit this month'
    ],
    
    longTermPlan: [
      'Maintain on-time payments for 6+ months',
      'Keep credit utilization below 30%',
      'Diversify your credit mix with different account types',
      'Build emergency fund to avoid future late payments',
      'Review credit reports quarterly for accuracy'
    ],
    
    scoreImpact: {
      estimated: analysis.estimatedImpact?.total || 50,
      timeframe: '3-6 months',
      explanation: 'Based on addressing key issues and maintaining good habits'
    },
    
    educationalContent: 'Credit scores are calculated using five main factors: payment history (35%), amounts owed (30%), length of credit history (15%), credit mix (10%), and new credit (10%). Understanding these factors helps you make strategic decisions to improve your score over time.',
    
    tokensUsed: 0,
    confidence: 75
  };
}

/**
 * Fallback monthly update if OpenAI fails
 */
function generateFallbackUpdate(comparison) {
  const scoreChange = comparison.scoreChanges?.vantage?.change || 0;
  
  return {
    summary: `Here's your monthly credit progress update. ${scoreChange > 0 ? `Great news! Your credit score increased by ${scoreChange} points this month.` : scoreChange < 0 ? `Your credit score decreased by ${Math.abs(scoreChange)} points this month, but we can turn this around.` : 'Your credit score remained stable this month.'} We've analyzed all changes to your credit report and provided recommendations for continued improvement.`,
    
    scoreChanges: `Your VantageScore changed from ${comparison.scoreChanges?.vantage?.previous || 'N/A'} to ${comparison.scoreChanges?.vantage?.current || 'N/A'}.`,
    
    whatChanged: [
      `${comparison.accountChanges?.newAccounts?.length || 0} new accounts opened`,
      `${comparison.accountChanges?.closedAccounts?.length || 0} accounts closed`,
      `Credit utilization changed by ${comparison.utilizationChange?.change || 0}%`,
      `${comparison.negativeItemChanges?.removed?.length || 0} negative items removed`
    ],
    
    whyItChanged: [
      'Account activity impacted credit mix',
      'Balance changes affected utilization ratio',
      'Payment history remained consistent'
    ],
    
    recommendations: [
      'Continue making on-time payments',
      'Monitor credit utilization',
      'Review report for accuracy',
      'Maintain current positive habits'
    ],
    
    progressUpdate: 'You\'re making progress on your credit journey. Stay focused on the fundamentals: on-time payments, low utilization, and regular monitoring.',
    
    nextSteps: [
      'Review this month\'s changes',
      'Address any new issues immediately',
      'Continue working on long-term goals'
    ],
    
    tokensUsed: 0,
    confidence: 70
  };
}

// ============================================================================
// FIRESTORE OPERATIONS
// ============================================================================

/**
 * Save review to Firestore
 */
async function saveReview(review) {
  try {
    const docRef = await addDoc(collection(db, 'aiReviews'), {
      ...review,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    console.log('💾 Review saved to Firestore:', docRef.id);
    return docRef.id;

  } catch (error) {
    console.error('❌ Firestore save error:', error);
    throw error;
  }
}

/**
 * Get review by ID
 */
export async function getReviewById(reviewId) {
  try {
    const docRef = doc(db, 'aiReviews', reviewId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return {
      id: docSnap.id,
      ...docSnap.data()
    };

  } catch (error) {
    console.error('❌ Error fetching review:', error);
    throw error;
  }
}

/**
 * Get all reviews for a client
 */
export async function getClientReviews(clientEmail, limitCount = 12) {
  try {
    const q = query(
      collection(db, 'aiReviews'),
      where('clientEmail', '==', clientEmail),
      orderBy('generatedAt', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

  } catch (error) {
    console.error('❌ Error fetching client reviews:', error);
    throw error;
  }
}

/**
 * Get pending reviews (awaiting human approval)
 */
export async function getPendingReviews() {
  try {
    const q = query(
      collection(db, 'aiReviews'),
      where('humanReview.reviewed', '==', false),
      where('status', '==', REVIEW_STATUS.DRAFT),
      orderBy('generatedAt', 'desc')
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

  } catch (error) {
    console.error('❌ Error fetching pending reviews:', error);
    throw error;
  }
}

/**
 * Approve review (human review)
 */
export async function approveReview(reviewId, approvedBy, edits = null) {
  try {
    const docRef = doc(db, 'aiReviews', reviewId);
    
    await updateDoc(docRef, {
      'humanReview.reviewed': true,
      'humanReview.reviewedBy': approvedBy,
      'humanReview.reviewedAt': new Date().toISOString(),
      'humanReview.approved': true,
      'humanReview.edits': edits,
      status: REVIEW_STATUS.APPROVED,
      updatedAt: new Date().toISOString()
    });

    console.log(`✅ Review ${reviewId} approved by ${approvedBy}`);

  } catch (error) {
    console.error('❌ Error approving review:', error);
    throw error;
  }
}

/**
 * Reject review (human review)
 */
export async function rejectReview(reviewId, rejectedBy, comments) {
  try {
    const docRef = doc(db, 'aiReviews', reviewId);
    
    await updateDoc(docRef, {
      'humanReview.reviewed': true,
      'humanReview.reviewedBy': rejectedBy,
      'humanReview.reviewedAt': new Date().toISOString(),
      'humanReview.approved': false,
      'humanReview.comments': comments,
      status: REVIEW_STATUS.FAILED,
      updatedAt: new Date().toISOString()
    });

    console.log(`❌ Review ${reviewId} rejected by ${rejectedBy}`);

  } catch (error) {
    console.error('❌ Error rejecting review:', error);
    throw error;
  }
}

/**
 * Mark review as sent
 */
export async function markReviewSent(reviewId, deliveryMethod) {
  try {
    const docRef = doc(db, 'aiReviews', reviewId);
    
    await updateDoc(docRef, {
      status: REVIEW_STATUS.SENT,
      sentAt: new Date().toISOString(),
      deliveryMethod: deliveryMethod,
      updatedAt: new Date().toISOString()
    });

    console.log(`📧 Review ${reviewId} marked as sent via ${deliveryMethod}`);

  } catch (error) {
    console.error('❌ Error marking review as sent:', error);
    throw error;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  generateInitialReview,
  generateMonthlyUpdate,
  getReviewById,
  getClientReviews,
  getPendingReviews,
  approveReview,
  rejectReview,
  markReviewSent,
  REVIEW_TYPES,
  REVIEW_STATUS
};