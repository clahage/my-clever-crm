// ============================================
// LEAD SCORING ENGINE
// Path: /src/utils/LeadScoringEngine.js
// ============================================
// Comprehensive lead scoring system with multiple models
// ML-based adjustments, real-time scoring, and historical tracking
// ============================================

import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

// ============================================
// SCORING WEIGHTS & CONFIGURATION
// ============================================

const SCORING_WEIGHTS = {
  // Demographic Factors (30%)
  demographic: {
    age: 0.08,
    income: 0.12,
    employmentStatus: 0.10,
  },
  
  // Behavioral Factors (40%)
  behavioral: {
    websiteEngagement: 0.15,
    emailEngagement: 0.10,
    phoneResponsiveness: 0.08,
    formCompleteness: 0.07,
  },
  
  // Firmographic Factors (20%)
  firmographic: {
    creditScore: 0.12,
    debtAmount: 0.05,
    urgency: 0.03,
  },
  
  // Intent Signals (10%)
  intent: {
    referralSource: 0.04,
    campaignResponse: 0.03,
    contentDownloads: 0.03,
  },
};

const SCORE_RANGES = {
  hot: { min: 80, max: 100, label: 'Hot Lead', color: '#ef4444' },
  warm: { min: 60, max: 79, label: 'Warm Lead', color: '#f59e0b' },
  cool: { min: 40, max: 59, label: 'Cool Lead', color: '#3b82f6' },
  cold: { min: 0, max: 39, label: 'Cold Lead', color: '#6b7280' },
};

// ============================================
// AI-POWERED SCORING FUNCTIONS
// ============================================

/**
 * Calculate demographic score
 * Scores based on age, income, employment status
 */
export const calculateDemographicScore = (lead) => {
  console.log('📊 Calculating demographic score for lead:', lead.id);
  
  let score = 0;
  const weights = SCORING_WEIGHTS.demographic;
  
  try {
    // Age scoring (25-65 is optimal)
    if (lead.age) {
      const age = parseInt(lead.age);
      if (age >= 25 && age <= 65) {
        score += 100 * weights.age;
      } else if (age >= 18 && age < 25) {
        score += 70 * weights.age;
      } else if (age > 65) {
        score += 60 * weights.age;
      }
    }
    
    // Income scoring (higher is better)
    if (lead.annualIncome) {
      const income = parseInt(lead.annualIncome);
      if (income >= 75000) {
        score += 100 * weights.income;
      } else if (income >= 50000) {
        score += 85 * weights.income;
      } else if (income >= 30000) {
        score += 70 * weights.income;
      } else {
        score += 50 * weights.income;
      }
    }
    
    // Employment status scoring
    const employmentScores = {
      'full-time': 100,
      'self-employed': 90,
      'part-time': 70,
      'retired': 60,
      'unemployed': 40,
    };
    
    if (lead.employmentStatus) {
      const employmentScore = employmentScores[lead.employmentStatus] || 50;
      score += employmentScore * weights.employmentStatus;
    }
    
    console.log('✅ Demographic score calculated:', score.toFixed(2));
    return score;
    
  } catch (error) {
    console.error('❌ Error calculating demographic score:', error);
    return 0;
  }
};

/**
 * Calculate behavioral score
 * Scores based on engagement, responsiveness, and form completion
 */
export const calculateBehavioralScore = (lead, interactions = []) => {
  console.log('🎯 Calculating behavioral score for lead:', lead.id);
  
  let score = 0;
  const weights = SCORING_WEIGHTS.behavioral;
  
  try {
    // Website engagement scoring
    const pageViews = interactions.filter(i => i.type === 'page_view').length;
    if (pageViews >= 10) {
      score += 100 * weights.websiteEngagement;
    } else if (pageViews >= 5) {
      score += 80 * weights.websiteEngagement;
    } else if (pageViews >= 2) {
      score += 60 * weights.websiteEngagement;
    } else {
      score += 40 * weights.websiteEngagement;
    }
    
    // Email engagement scoring
    const emailOpens = interactions.filter(i => i.type === 'email_open').length;
    const emailClicks = interactions.filter(i => i.type === 'email_click').length;
    
    const emailEngagement = (emailOpens * 2) + (emailClicks * 5);
    if (emailEngagement >= 20) {
      score += 100 * weights.emailEngagement;
    } else if (emailEngagement >= 10) {
      score += 80 * weights.emailEngagement;
    } else if (emailEngagement >= 5) {
      score += 60 * weights.emailEngagement;
    } else {
      score += 30 * weights.emailEngagement;
    }
    
    // Phone responsiveness scoring
    const callsAnswered = interactions.filter(i => i.type === 'call_answered').length;
    const callsMissed = interactions.filter(i => i.type === 'call_missed').length;
    
    const responseRate = callsAnswered / (callsAnswered + callsMissed || 1);
    score += responseRate * 100 * weights.phoneResponsiveness;
    
    // Form completeness scoring
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'creditScore'];
    const completedFields = requiredFields.filter(field => lead[field]).length;
    const completeness = (completedFields / requiredFields.length) * 100;
    
    score += completeness * weights.formCompleteness;
    
    console.log('✅ Behavioral score calculated:', score.toFixed(2));
    return score;
    
  } catch (error) {
    console.error('❌ Error calculating behavioral score:', error);
    return 0;
  }
};

/**
 * Calculate firmographic score
 * Scores based on credit profile and urgency
 */
export const calculateFirmographicScore = (lead) => {
  console.log('💼 Calculating firmographic score for lead:', lead.id);
  
  let score = 0;
  const weights = SCORING_WEIGHTS.firmographic;
  
  try {
    // Credit score scoring (lower is better for credit repair)
    if (lead.creditScore) {
      const creditScore = parseInt(lead.creditScore);
      if (creditScore < 550) {
        score += 100 * weights.creditScore; // Needs major help
      } else if (creditScore < 620) {
        score += 85 * weights.creditScore; // Good candidate
      } else if (creditScore < 680) {
        score += 70 * weights.creditScore; // Moderate candidate
      } else {
        score += 40 * weights.creditScore; // Less urgent
      }
    }
    
    // Debt amount scoring (higher debt = more motivated)
    if (lead.totalDebt) {
      const debt = parseInt(lead.totalDebt);
      if (debt >= 50000) {
        score += 100 * weights.debtAmount;
      } else if (debt >= 25000) {
        score += 85 * weights.debtAmount;
      } else if (debt >= 10000) {
        score += 70 * weights.debtAmount;
      } else {
        score += 50 * weights.debtAmount;
      }
    }
    
    // Urgency scoring
    const urgencyScores = {
      'immediate': 100,
      'high': 85,
      'medium': 65,
      'low': 40,
    };
    
    if (lead.urgency) {
      const urgencyScore = urgencyScores[lead.urgency] || 50;
      score += urgencyScore * weights.urgency;
    }
    
    console.log('✅ Firmographic score calculated:', score.toFixed(2));
    return score;
    
  } catch (error) {
    console.error('❌ Error calculating firmographic score:', error);
    return 0;
  }
};

/**
 * Calculate intent score
 * Scores based on referral source, campaign response, and content engagement
 */
export const calculateIntentScore = (lead, interactions = []) => {
  console.log('🎯 Calculating intent score for lead:', lead.id);
  
  let score = 0;
  const weights = SCORING_WEIGHTS.intent;
  
  try {
    // Referral source scoring
    const referralScores = {
      'google-ads': 95,
      'facebook-ads': 90,
      'referral': 100,
      'organic': 80,
      'direct': 75,
      'social': 70,
      'other': 60,
    };
    
    if (lead.source) {
      const sourceScore = referralScores[lead.source] || 60;
      score += sourceScore * weights.referralSource;
    }
    
    // Campaign response scoring
    if (lead.campaignId) {
      score += 100 * weights.campaignResponse;
    } else {
      score += 50 * weights.campaignResponse;
    }
    
    // Content downloads scoring
    const downloads = interactions.filter(i => i.type === 'content_download').length;
    if (downloads >= 3) {
      score += 100 * weights.contentDownloads;
    } else if (downloads >= 2) {
      score += 80 * weights.contentDownloads;
    } else if (downloads >= 1) {
      score += 60 * weights.contentDownloads;
    } else {
      score += 30 * weights.contentDownloads;
    }
    
    console.log('✅ Intent score calculated:', score.toFixed(2));
    return score;
    
  } catch (error) {
    console.error('❌ Error calculating intent score:', error);
    return 0;
  }
};

/**
 * Calculate ML-based adjustment
 * Uses historical conversion data to adjust scores
 */
export const calculateMLAdjustment = async (lead) => {
  console.log('🤖 Calculating ML adjustment for lead:', lead.id);
  
  try {
    // Get similar converted leads for pattern matching
    const conversionsRef = collection(db, 'conversions');
    const conversionsQuery = query(
      conversionsRef,
      where('convertedToClient', '==', true),
      orderBy('convertedAt', 'desc')
    );
    
    const conversionsSnapshot = await getDocs(conversionsQuery);
    const conversions = conversionsSnapshot.docs.map(doc => doc.data());
    
    if (conversions.length === 0) {
      console.log('⚠️ No conversion data available, skipping ML adjustment');
      return 0;
    }
    
    // Find similar leads (same age range, income bracket, credit score range)
    const similarLeads = conversions.filter(conv => {
      const ageMatch = Math.abs(conv.age - lead.age) <= 10;
      const incomeMatch = Math.abs(conv.annualIncome - lead.annualIncome) <= 20000;
      const creditMatch = Math.abs(conv.creditScore - lead.creditScore) <= 50;
      
      return ageMatch && incomeMatch && creditMatch;
    });
    
    if (similarLeads.length === 0) {
      console.log('⚠️ No similar converted leads found');
      return 0;
    }
    
    // Calculate conversion rate for similar leads
    const conversionRate = similarLeads.length / conversions.length;
    
    // Adjust score based on conversion rate
    // High conversion rate (>0.3) = +10 points
    // Medium conversion rate (0.1-0.3) = +5 points
    // Low conversion rate (<0.1) = -5 points
    
    let adjustment = 0;
    if (conversionRate > 0.3) {
      adjustment = 10;
    } else if (conversionRate > 0.1) {
      adjustment = 5;
    } else {
      adjustment = -5;
    }
    
    console.log('✅ ML adjustment calculated:', adjustment, 'points');
    return adjustment;
    
  } catch (error) {
    console.error('❌ Error calculating ML adjustment:', error);
    return 0;
  }
};

/**
 * Calculate total lead score
 * Combines all scoring models with ML adjustment
 */
export const calculateLeadScore = async (lead, interactions = []) => {
  console.log('🎯 Calculating total lead score for:', lead.id);
  
  try {
    // Calculate individual scores
    const demographicScore = calculateDemographicScore(lead);
    const behavioralScore = calculateBehavioralScore(lead, interactions);
    const firmographicScore = calculateFirmographicScore(lead);
    const intentScore = calculateIntentScore(lead, interactions);
    
    // Calculate base score (weighted average)
    const baseScore = demographicScore + behavioralScore + firmographicScore + intentScore;
    
    // Get ML adjustment
    const mlAdjustment = await calculateMLAdjustment(lead);
    
    // Calculate final score (cap at 100)
    const finalScore = Math.min(100, Math.max(0, baseScore + mlAdjustment));
    
    // Determine score category
    let category = 'cold';
    for (const [key, range] of Object.entries(SCORE_RANGES)) {
      if (finalScore >= range.min && finalScore <= range.max) {
        category = key;
        break;
      }
    }
    
    const scoreData = {
      totalScore: Math.round(finalScore),
      category,
      breakdown: {
        demographic: Math.round(demographicScore),
        behavioral: Math.round(behavioralScore),
        firmographic: Math.round(firmographicScore),
        intent: Math.round(intentScore),
        mlAdjustment: Math.round(mlAdjustment),
      },
      calculatedAt: new Date().toISOString(),
    };
    
    console.log('✅ Lead score calculated:', scoreData);
    return scoreData;
    
  } catch (error) {
    console.error('❌ Error calculating lead score:', error);
    return {
      totalScore: 50,
      category: 'cool',
      breakdown: {},
      calculatedAt: new Date().toISOString(),
    };
  }
};

/**
 * Update lead score in Firebase
 */
export const updateLeadScore = async (leadId, scoreData) => {
  console.log('💾 Updating lead score in Firebase:', leadId);
  
  try {
    const leadRef = doc(db, 'contacts', leadId);
    
    await updateDoc(leadRef, {
      leadScore: scoreData.totalScore,
      scoreCategory: scoreData.category,
      scoreBreakdown: scoreData.breakdown,
      lastScored: serverTimestamp(),
    });
    
    // Save score history
    const historyRef = doc(collection(db, 'leadScoreHistory'), `${leadId}_${Date.now()}`);
    await setDoc(historyRef, {
      leadId,
      ...scoreData,
      timestamp: serverTimestamp(),
    });
    
    console.log('✅ Lead score updated successfully');
    return true;
    
  } catch (error) {
    console.error('❌ Error updating lead score:', error);
    return false;
  }
};

/**
 * Get lead score history
 */
export const getLeadScoreHistory = async (leadId) => {
  console.log('📊 Fetching lead score history:', leadId);
  
  try {
    const historyRef = collection(db, 'leadScoreHistory');
    const historyQuery = query(
      historyRef,
      where('leadId', '==', leadId),
      orderBy('timestamp', 'desc')
    );
    
    const historySnapshot = await getDocs(historyQuery);
    const history = historySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    console.log('✅ Score history fetched:', history.length, 'records');
    return history;
    
  } catch (error) {
    console.error('❌ Error fetching score history:', error);
    return [];
  }
};

/**
 * Batch score all leads
 * Used for bulk scoring operations
 */
export const batchScoreLeads = async (leads) => {
  console.log('🔄 Starting batch lead scoring for', leads.length, 'leads');
  
  const results = {
    success: 0,
    failed: 0,
    scores: [],
  };
  
  for (const lead of leads) {
    try {
      // Get interactions for this lead
      const interactionsRef = collection(db, 'interactions');
      const interactionsQuery = query(
        interactionsRef,
        where('leadId', '==', lead.id)
      );
      
      const interactionsSnapshot = await getDocs(interactionsQuery);
      const interactions = interactionsSnapshot.docs.map(doc => doc.data());
      
      // Calculate score
      const scoreData = await calculateLeadScore(lead, interactions);
      
      // Update in Firebase
      await updateLeadScore(lead.id, scoreData);
      
      results.success++;
      results.scores.push({
        leadId: lead.id,
        score: scoreData.totalScore,
        category: scoreData.category,
      });
      
    } catch (error) {
      console.error('❌ Error scoring lead:', lead.id, error);
      results.failed++;
    }
  }
  
  console.log('✅ Batch scoring complete:', results);
  return results;
};

/**
 * Get score statistics
 */
export const getScoreStatistics = async () => {
  console.log('📊 Calculating score statistics');
  
  try {
    const leadsRef = collection(db, 'contacts');
    const leadsQuery = query(
      leadsRef,
      where('roles', 'array-contains', 'lead')
    );
    
    const leadsSnapshot = await getDocs(leadsQuery);
    const leads = leadsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    // Calculate statistics
    const stats = {
      total: leads.length,
      hot: leads.filter(l => l.scoreCategory === 'hot').length,
      warm: leads.filter(l => l.scoreCategory === 'warm').length,
      cool: leads.filter(l => l.scoreCategory === 'cool').length,
      cold: leads.filter(l => l.scoreCategory === 'cold').length,
      averageScore: leads.reduce((sum, l) => sum + (l.leadScore || 0), 0) / leads.length,
      needsScoring: leads.filter(l => !l.leadScore).length,
    };
    
    console.log('✅ Score statistics calculated:', stats);
    return stats;
    
  } catch (error) {
    console.error('❌ Error calculating statistics:', error);
    return null;
  }
};

/**
 * AI-powered score prediction
 * Predicts future score based on current trajectory
 */
export const predictFutureScore = async (leadId) => {
  console.log('🔮 Predicting future score for lead:', leadId);
  
  try {
    const history = await getLeadScoreHistory(leadId);
    
    if (history.length < 2) {
      console.log('⚠️ Insufficient data for prediction');
      return null;
    }
    
    // Calculate trend
    const scores = history.map(h => h.totalScore);
    const trend = (scores[0] - scores[scores.length - 1]) / history.length;
    
    // Predict score in 30 days
    const currentScore = scores[0];
    const predictedScore = Math.min(100, Math.max(0, currentScore + (trend * 30)));
    
    const prediction = {
      currentScore,
      predictedScore: Math.round(predictedScore),
      trend: trend > 0 ? 'improving' : trend < 0 ? 'declining' : 'stable',
      confidence: history.length >= 5 ? 'high' : 'medium',
    };
    
    console.log('✅ Score prediction generated:', prediction);
    return prediction;
    
  } catch (error) {
    console.error('❌ Error predicting score:', error);
    return null;
  }
};

// ============================================
// EXPORT ALL FUNCTIONS
// ============================================

export default {    
  calculateLeadScore,
  calculateDemographicScore,
  calculateBehavioralScore,
  calculateFirmographicScore,
  calculateIntentScore,
  calculateMLAdjustment,
  updateLeadScore,
  getLeadScoreHistory,
  batchScoreLeads,
  getScoreStatistics,
  predictFutureScore,
  SCORE_RANGES,
  SCORING_WEIGHTS,
};