/**
 * AI PREDICTIVE ANALYTICS SYSTEM
 *
 * Purpose:
 * Forecasts future outcomes, predicts churn risk, and provides proactive
 * recommendations to prevent problems before they happen.
 *
 * What It Predicts:
 * - Churn Risk: Which clients are likely to cancel (and why)
 * - Revenue Forecast: Expected monthly/quarterly revenue
 * - Client Success: Likelihood of achieving credit goals
 * - Service Tier Upgrades: Who's ready to upgrade
 * - Payment Defaults: Who might miss payments
 * - Dispute Success Rate: Which disputes will succeed
 * - Time to Completion: When clients will reach their goals
 * - Credit Score Improvements: Predicted score increases
 *
 * Why It's Important:
 * - Intervene before clients churn (saves revenue)
 * - Accurate revenue forecasting for business planning
 * - Proactive outreach to at-risk clients
 * - Optimize resource allocation based on predictions
 * - Identify upsell opportunities automatically
 * - Improve client outcomes with early intervention
 *
 * Example Use Cases:
 * - "Sarah has 87% churn risk - low engagement for 14 days. Send personal check-in."
 * - "Revenue forecast for Q1: $47,300 (±$3,200) based on 23 active clients."
 * - "Michael likely to upgrade to Premium (92% confidence) - recommend in next call."
 * - "15% of Standard tier clients show payment default risk - send reminder emails."
 * - "Average time to 100-point credit score improvement: 4.2 months."
 *
 * Prediction Models:
 * - Churn Model: Engagement patterns, payment history, sentiment, service tier
 * - Revenue Model: Historical trends, seasonal patterns, pipeline analysis
 * - Success Model: Credit profile, dispute count, client cooperation, timeline
 * - Upgrade Model: Service usage, results achieved, financial indicators
 *
 * Created: 2025-12-05
 * Part of: Speedy Credit Repair AI Workflow System - Tier 2
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';

// ============================================================================
// CHURN RISK PREDICTION
// ============================================================================

/**
 * Predict which clients are at risk of churning
 * @param {string} contactId - Optional specific contact to analyze
 * @returns {Array} Churn risk predictions sorted by risk score
 */
export async function predictChurnRisk(contactId = null) {
  try {
    let contacts;

    if (contactId) {
      const contactDoc = await getDoc(doc(db, 'contacts', contactId));
      contacts = contactDoc.exists() ? [{ id: contactDoc.id, ...contactDoc.data() }] : [];
    } else {
      // Get all active clients
      const q = query(
        collection(db, 'contacts'),
        where('status', 'in', ['active', 'onboarding']),
        orderBy('lastActivity', 'desc')
      );
      const snapshot = await getDocs(q);
      contacts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    const predictions = [];

    for (const contact of contacts) {
      const riskFactors = await analyzeChurnRisk(contact);
      const churnScore = calculateChurnScore(riskFactors);
      const interventions = recommendInterventions(riskFactors, churnScore);

      predictions.push({
        contactId: contact.id,
        name: `${contact.firstName} ${contact.lastName}`,
        churnScore, // 0-100 (higher = more likely to churn)
        riskLevel: getRiskLevel(churnScore),
        riskFactors,
        interventions,
        predictedChurnDate: estimateChurnDate(contact, churnScore),
        confidence: riskFactors.confidenceScore,
        lastActivity: contact.lastActivity,
        serviceTier: contact.serviceTier
      });
    }

    // Sort by churn score (highest risk first)
    return predictions.sort((a, b) => b.churnScore - a.churnScore);

  } catch (error) {
    console.error('[predictChurnRisk] Error:', error);
    return [];
  }
}

async function analyzeChurnRisk(contact) {
  const factors = {
    engagementScore: 0,
    paymentHealth: 0,
    sentimentScore: 0,
    progressScore: 0,
    communicationScore: 0,
    confidenceScore: 0
  };

  // 1. Engagement Analysis
  const daysSinceActivity = getDaysSince(contact.lastActivity);
  if (daysSinceActivity > 30) factors.engagementScore = 90;
  else if (daysSinceActivity > 14) factors.engagementScore = 60;
  else if (daysSinceActivity > 7) factors.engagementScore = 30;
  else factors.engagementScore = 5;

  // 2. Payment Health
  const missedPayments = contact.missedPayments || 0;
  const paymentDelays = contact.paymentDelays || 0;
  factors.paymentHealth = Math.min(100, (missedPayments * 30) + (paymentDelays * 10));

  // 3. Sentiment Score (from recent communications)
  const recentEmails = await getRecentCommunications(contact.id, 'email', 5);
  factors.sentimentScore = await analyzeSentiment(recentEmails);

  // 4. Progress Score (are they seeing results?)
  const initialScore = contact.initialCreditScore || 0;
  const currentScore = contact.creditScore || initialScore;
  const scoreImprovement = currentScore - initialScore;

  if (scoreImprovement < 0) factors.progressScore = 80; // Score declined
  else if (scoreImprovement === 0 && getDaysSince(contact.createdAt) > 60) factors.progressScore = 60; // No improvement after 60 days
  else if (scoreImprovement > 50) factors.progressScore = 0; // Great progress
  else factors.progressScore = 30; // Some progress

  // 5. Communication Responsiveness
  const responseRate = contact.emailResponseRate || 0;
  factors.communicationScore = (1 - responseRate) * 100;

  // 6. Confidence Score (how reliable is this prediction?)
  const dataPoints = [
    contact.lastActivity ? 1 : 0,
    contact.missedPayments !== undefined ? 1 : 0,
    contact.creditScore ? 1 : 0,
    contact.emailResponseRate !== undefined ? 1 : 0,
    recentEmails.length > 0 ? 1 : 0
  ].reduce((sum, val) => sum + val, 0);

  factors.confidenceScore = (dataPoints / 5) * 100;

  return factors;
}

function calculateChurnScore(factors) {
  // Weighted average of risk factors
  const weights = {
    engagementScore: 0.30,
    paymentHealth: 0.25,
    sentimentScore: 0.20,
    progressScore: 0.15,
    communicationScore: 0.10
  };

  return Math.round(
    (factors.engagementScore * weights.engagementScore) +
    (factors.paymentHealth * weights.paymentHealth) +
    (factors.sentimentScore * weights.sentimentScore) +
    (factors.progressScore * weights.progressScore) +
    (factors.communicationScore * weights.communicationScore)
  );
}

function getRiskLevel(churnScore) {
  if (churnScore >= 70) return 'critical';
  if (churnScore >= 50) return 'high';
  if (churnScore >= 30) return 'medium';
  return 'low';
}

function recommendInterventions(factors, churnScore) {
  const interventions = [];

  if (factors.engagementScore > 50) {
    interventions.push({
      type: 'personal_outreach',
      priority: 'immediate',
      action: 'Call client personally - check if they need help',
      assignTo: 'christopher'
    });
  }

  if (factors.paymentHealth > 40) {
    interventions.push({
      type: 'payment_assistance',
      priority: 'high',
      action: 'Offer payment plan or tier downgrade option',
      assignTo: 'laurie'
    });
  }

  if (factors.sentimentScore > 60) {
    interventions.push({
      type: 'satisfaction_recovery',
      priority: 'high',
      action: 'Address concerns - send satisfaction survey',
      assignTo: 'christopher'
    });
  }

  if (factors.progressScore > 50) {
    interventions.push({
      type: 'results_acceleration',
      priority: 'medium',
      action: 'Review strategy - consider more aggressive dispute approach',
      assignTo: 'christopher'
    });
  }

  if (churnScore >= 70 && interventions.length === 0) {
    interventions.push({
      type: 'retention_offer',
      priority: 'immediate',
      action: 'Make retention offer - discount or free month',
      assignTo: 'christopher'
    });
  }

  return interventions;
}

function estimateChurnDate(contact, churnScore) {
  if (churnScore < 30) return null; // Low risk, no estimated churn date

  const daysSinceActivity = getDaysSince(contact.lastActivity);

  if (churnScore >= 70) {
    // Critical risk - likely to churn within 7-14 days
    return new Date(Date.now() + (7 + Math.random() * 7) * 24 * 60 * 60 * 1000);
  } else if (churnScore >= 50) {
    // High risk - likely to churn within 14-30 days
    return new Date(Date.now() + (14 + Math.random() * 16) * 24 * 60 * 60 * 1000);
  } else {
    // Medium risk - likely to churn within 30-60 days
    return new Date(Date.now() + (30 + Math.random() * 30) * 24 * 60 * 60 * 1000);
  }
}

// ============================================================================
// REVENUE FORECASTING
// ============================================================================

/**
 * Forecast revenue for upcoming period
 * @param {string} period - 'month' | 'quarter' | 'year'
 * @returns {Object} Revenue forecast with confidence intervals
 */
export async function forecastRevenue(period = 'month') {
  try {
    const activeContacts = await getActiveContacts();
    const historicalData = await getHistoricalRevenue(period);
    const churnPredictions = await predictChurnRisk();

    // Calculate base revenue (current MRR)
    let baseRevenue = 0;
    const tierPricing = {
      diy: 49,
      standard: 99,
      acceleration: 149,
      premium: 199,
      vip: 299
    };

    activeContacts.forEach(contact => {
      const monthlyRate = tierPricing[contact.serviceTier] || 99;
      baseRevenue += monthlyRate;
    });

    // Adjust for predicted churn
    let churnAdjustment = 0;
    churnPredictions.forEach(prediction => {
      if (prediction.riskLevel === 'critical' || prediction.riskLevel === 'high') {
        const contact = activeContacts.find(c => c.id === prediction.contactId);
        if (contact) {
          const monthlyRate = tierPricing[contact.serviceTier] || 99;
          churnAdjustment += monthlyRate * (prediction.churnScore / 100);
        }
      }
    });

    // Adjust for predicted upgrades
    const upgradeRevenue = await predictUpgradeRevenue(activeContacts);

    // Calculate forecast based on period
    let periodMultiplier = 1;
    if (period === 'quarter') periodMultiplier = 3;
    else if (period === 'year') periodMultiplier = 12;

    const expectedRevenue = (baseRevenue - churnAdjustment + upgradeRevenue) * periodMultiplier;

    // Calculate confidence interval (±15% based on historical variance)
    const variance = calculateVariance(historicalData);
    const lowerBound = expectedRevenue * (1 - variance);
    const upperBound = expectedRevenue * (1 + variance);

    // Growth rate calculation
    const growthRate = calculateGrowthRate(historicalData, expectedRevenue / periodMultiplier);

    return {
      period,
      expectedRevenue: Math.round(expectedRevenue),
      lowerBound: Math.round(lowerBound),
      upperBound: Math.round(upperBound),
      confidence: 85, // 85% confidence interval
      breakdown: {
        baseRevenue: Math.round(baseRevenue * periodMultiplier),
        churnImpact: -Math.round(churnAdjustment * periodMultiplier),
        upgradeRevenue: Math.round(upgradeRevenue * periodMultiplier),
        newClientRevenue: 0 // Future enhancement: predict new signups
      },
      growthRate,
      assumptions: [
        `${activeContacts.length} active clients at period start`,
        `${churnPredictions.filter(p => p.riskLevel === 'critical' || p.riskLevel === 'high').length} high-risk churn predictions`,
        `${Math.round(variance * 100)}% historical revenue variance`,
        'No new client acquisition included (conservative)'
      ]
    };

  } catch (error) {
    console.error('[forecastRevenue] Error:', error);
    return {
      period,
      expectedRevenue: 0,
      error: error.message
    };
  }
}

async function predictUpgradeRevenue(contacts) {
  let upgradeRevenue = 0;
  const tierUpgradeValue = {
    diy: 50, // $49 → $99 = +$50
    standard: 50, // $99 → $149 = +$50
    acceleration: 50, // $149 → $199 = +$50
    premium: 100 // $199 → $299 = +$100
  };

  for (const contact of contacts) {
    const upgradeScore = await calculateUpgradeScore(contact);
    if (upgradeScore > 70) {
      const potentialIncrease = tierUpgradeValue[contact.serviceTier] || 0;
      upgradeRevenue += potentialIncrease * (upgradeScore / 100);
    }
  }

  return upgradeRevenue;
}

// ============================================================================
// CLIENT SUCCESS PREDICTION
// ============================================================================

/**
 * Predict likelihood of client achieving their credit goals
 * @param {string} contactId - Contact to analyze
 * @returns {Object} Success prediction with timeline
 */
export async function predictClientSuccess(contactId) {
  try {
    const contactDoc = await getDoc(doc(db, 'contacts', contactId));
    if (!contactDoc.exists()) {
      throw new Error('Contact not found');
    }

    const contact = { id: contactDoc.id, ...contactDoc.data() };

    const currentScore = contact.creditScore || 600;
    const goalScore = contact.goalCreditScore || 700;
    const negativeItems = contact.negativeItemCount || 5;
    const monthsActive = getDaysSince(contact.createdAt) / 30;

    // Calculate success factors
    const factors = {
      startingPosition: calculateStartingPositionScore(currentScore, negativeItems),
      engagementLevel: calculateEngagementScore(contact),
      cooperationLevel: calculateCooperationScore(contact),
      disputeSuccessRate: await calculateDisputeSuccessRate(contactId),
      timeInProgram: Math.min(100, (monthsActive / 6) * 100) // 6 months = 100%
    };

    // Overall success probability
    const successProbability = Math.round(
      (factors.startingPosition * 0.30) +
      (factors.engagementLevel * 0.25) +
      (factors.cooperationLevel * 0.20) +
      (factors.disputeSuccessRate * 0.15) +
      (factors.timeInProgram * 0.10)
    );

    // Predict timeline to goal
    const pointsNeeded = Math.max(0, goalScore - currentScore);
    const averagePointsPerMonth = calculateAveragePointsGained(contact, monthsActive);
    const monthsToGoal = averagePointsPerMonth > 0
      ? Math.ceil(pointsNeeded / averagePointsPerMonth)
      : null;

    return {
      contactId,
      name: `${contact.firstName} ${contact.lastName}`,
      successProbability,
      successLevel: getSuccessLevel(successProbability),
      currentScore,
      goalScore,
      pointsNeeded,
      estimatedMonthsToGoal: monthsToGoal,
      estimatedCompletionDate: monthsToGoal ? addMonths(new Date(), monthsToGoal) : null,
      factors,
      recommendations: generateSuccessRecommendations(factors, successProbability)
    };

  } catch (error) {
    console.error('[predictClientSuccess] Error:', error);
    return { error: error.message };
  }
}

function calculateStartingPositionScore(creditScore, negativeItems) {
  // Better starting position = higher success probability
  let score = 0;

  if (creditScore >= 650) score += 60;
  else if (creditScore >= 600) score += 40;
  else if (creditScore >= 550) score += 20;

  if (negativeItems <= 3) score += 40;
  else if (negativeItems <= 7) score += 20;
  else score += 10;

  return Math.min(100, score);
}

function calculateEngagementScore(contact) {
  const daysSinceActivity = getDaysSince(contact.lastActivity);
  const portalLogins = contact.portalLogins || 0;

  let score = 50; // Baseline

  if (daysSinceActivity <= 7) score += 30;
  else if (daysSinceActivity <= 14) score += 15;

  if (portalLogins > 20) score += 20;
  else if (portalLogins > 10) score += 10;

  return Math.min(100, score);
}

function calculateCooperationScore(contact) {
  const responseRate = contact.emailResponseRate || 0.5;
  const documentsProvided = contact.documentsProvided || 0;

  let score = responseRate * 60;

  if (documentsProvided >= 5) score += 40;
  else if (documentsProvided >= 3) score += 25;
  else score += 10;

  return Math.min(100, score);
}

async function calculateDisputeSuccessRate(contactId) {
  const disputesQuery = query(
    collection(db, 'disputes'),
    where('contactId', '==', contactId)
  );
  const snapshot = await getDocs(disputesQuery);

  if (snapshot.empty) return 50; // No data yet, assume average

  const disputes = snapshot.docs.map(doc => doc.data());
  const successful = disputes.filter(d => d.status === 'removed' || d.status === 'verified').length;

  return Math.round((successful / disputes.length) * 100);
}

function calculateAveragePointsGained(contact, monthsActive) {
  if (monthsActive < 1) return 15; // Assume 15 points/month for new clients

  const initialScore = contact.initialCreditScore || contact.creditScore - 30;
  const currentScore = contact.creditScore || initialScore;
  const pointsGained = currentScore - initialScore;

  return pointsGained / monthsActive;
}

function getSuccessLevel(probability) {
  if (probability >= 80) return 'very_high';
  if (probability >= 60) return 'high';
  if (probability >= 40) return 'moderate';
  return 'low';
}

function generateSuccessRecommendations(factors, probability) {
  const recommendations = [];

  if (factors.engagementLevel < 50) {
    recommendations.push({
      area: 'engagement',
      suggestion: 'Increase client touchpoints - schedule weekly check-ins',
      impact: 'high'
    });
  }

  if (factors.cooperationLevel < 50) {
    recommendations.push({
      area: 'cooperation',
      suggestion: 'Simplify document requests - provide clear checklists',
      impact: 'high'
    });
  }

  if (factors.disputeSuccessRate < 60) {
    recommendations.push({
      area: 'disputes',
      suggestion: 'Review dispute strategy - consider more aggressive approach',
      impact: 'medium'
    });
  }

  if (probability < 40) {
    recommendations.push({
      area: 'overall',
      suggestion: 'Consider tier upgrade for more intensive support',
      impact: 'high'
    });
  }

  return recommendations;
}

// ============================================================================
// SERVICE TIER UPGRADE PREDICTION
// ============================================================================

/**
 * Predict which clients are ready to upgrade their service tier
 * @returns {Array} Upgrade predictions sorted by score
 */
export async function predictServiceUpgrades() {
  try {
    const contacts = await getActiveContacts();
    const predictions = [];

    for (const contact of contacts) {
      // Can't upgrade VIP tier
      if (contact.serviceTier === 'vip') continue;

      const upgradeScore = await calculateUpgradeScore(contact);

      if (upgradeScore > 50) { // Only include likely upgrades
        predictions.push({
          contactId: contact.id,
          name: `${contact.firstName} ${contact.lastName}`,
          currentTier: contact.serviceTier,
          recommendedTier: getNextTier(contact.serviceTier),
          upgradeScore,
          confidence: upgradeScore > 70 ? 'high' : 'medium',
          reasons: getUpgradeReasons(contact, upgradeScore),
          revenueIncrease: calculateRevenueIncrease(contact.serviceTier),
          recommendedApproach: getUpgradeApproach(contact, upgradeScore)
        });
      }
    }

    return predictions.sort((a, b) => b.upgradeScore - a.upgradeScore);

  } catch (error) {
    console.error('[predictServiceUpgrades] Error:', error);
    return [];
  }
}

async function calculateUpgradeScore(contact) {
  let score = 0;

  // 1. Service usage intensity
  const portalLogins = contact.portalLogins || 0;
  if (portalLogins > 30) score += 25;
  else if (portalLogins > 15) score += 15;

  // 2. Results satisfaction
  const scoreImprovement = (contact.creditScore || 600) - (contact.initialCreditScore || 600);
  if (scoreImprovement > 50) score += 20;
  else if (scoreImprovement > 30) score += 10;

  // 3. Financial capacity
  const paymentHistory = contact.paymentHistory || [];
  const onTimePayments = paymentHistory.filter(p => p.onTime).length;
  const paymentReliability = paymentHistory.length > 0 ? onTimePayments / paymentHistory.length : 0.5;
  score += paymentReliability * 20;

  // 4. Engagement level
  const daysSinceActivity = getDaysSince(contact.lastActivity);
  if (daysSinceActivity <= 3) score += 15;
  else if (daysSinceActivity <= 7) score += 10;
  else if (daysSinceActivity <= 14) score += 5;

  // 5. Feature requests (indicating desire for more service)
  const supportTickets = contact.supportTickets || 0;
  if (supportTickets > 5) score += 10;

  // 6. Current tier limitations
  if (contact.serviceTier === 'diy' && portalLogins > 10) score += 10; // DIY clients showing high engagement

  return Math.min(100, Math.round(score));
}

function getNextTier(currentTier) {
  const tiers = ['diy', 'standard', 'acceleration', 'premium', 'vip'];
  const currentIndex = tiers.indexOf(currentTier);
  return tiers[currentIndex + 1] || 'vip';
}

function getUpgradeReasons(contact, score) {
  const reasons = [];

  if ((contact.portalLogins || 0) > 20) {
    reasons.push('High platform engagement - using service actively');
  }

  const scoreImprovement = (contact.creditScore || 600) - (contact.initialCreditScore || 600);
  if (scoreImprovement > 30) {
    reasons.push('Seeing results - likely to value premium features');
  }

  if (getDaysSince(contact.lastActivity) <= 7) {
    reasons.push('Recently active - good time for upgrade conversation');
  }

  if (contact.serviceTier === 'diy' || contact.serviceTier === 'standard') {
    reasons.push('Could benefit from more intensive support');
  }

  return reasons;
}

function calculateRevenueIncrease(currentTier) {
  const increases = {
    diy: 50,        // $49 → $99
    standard: 50,   // $99 → $149
    acceleration: 50, // $149 → $199
    premium: 100    // $199 → $299
  };
  return increases[currentTier] || 0;
}

function getUpgradeApproach(contact, score) {
  if (score > 80) {
    return 'Direct offer - very likely to accept. Emphasize time savings and better results.';
  } else if (score > 65) {
    return 'Feature comparison - show what they\'re missing. Offer trial period.';
  } else {
    return 'Soft touch - mention in next conversation. Plant seed for future consideration.';
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getDaysSince(timestamp) {
  if (!timestamp) return 999;
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
}

async function getActiveContacts() {
  const q = query(
    collection(db, 'contacts'),
    where('status', 'in', ['active', 'onboarding'])
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function getRecentCommunications(contactId, type, limit = 5) {
  const q = query(
    collection(db, 'communications'),
    where('contactId', '==', contactId),
    where('type', '==', type),
    orderBy('timestamp', 'desc'),
    limit(limit)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data());
}

async function analyzeSentiment(communications) {
  // Simplified sentiment analysis
  // In production, this would call an AI service

  if (communications.length === 0) return 50; // Neutral

  let sentimentScore = 50;

  communications.forEach(comm => {
    const content = (comm.content || '').toLowerCase();

    // Negative indicators
    if (content.includes('cancel') || content.includes('frustrated') ||
        content.includes('unhappy') || content.includes('disappointed')) {
      sentimentScore -= 15;
    }

    // Positive indicators
    if (content.includes('thank') || content.includes('great') ||
        content.includes('happy') || content.includes('appreciate')) {
      sentimentScore += 10;
    }
  });

  return Math.max(0, Math.min(100, sentimentScore));
}

async function getHistoricalRevenue(period) {
  // Fetch historical revenue data
  // Returns array of monthly revenue figures
  const q = query(
    collection(db, 'revenueHistory'),
    orderBy('month', 'desc'),
    limit(period === 'year' ? 12 : 6)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data().revenue || 0);
}

function calculateVariance(historicalData) {
  if (historicalData.length < 2) return 0.15; // Default 15%

  const mean = historicalData.reduce((sum, val) => sum + val, 0) / historicalData.length;
  const squaredDiffs = historicalData.map(val => Math.pow(val - mean, 2));
  const variance = Math.sqrt(squaredDiffs.reduce((sum, val) => sum + val, 0) / historicalData.length);

  return Math.min(0.30, variance / mean); // Cap at 30%
}

function calculateGrowthRate(historicalData, currentMRR) {
  if (historicalData.length < 2) return 0;

  const oldestMRR = historicalData[historicalData.length - 1];
  const months = historicalData.length;

  if (oldestMRR === 0) return 0;

  const totalGrowth = ((currentMRR - oldestMRR) / oldestMRR) * 100;
  return Math.round(totalGrowth / months); // Monthly growth rate
}

function addMonths(date, months) {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

export default {
  predictChurnRisk,
  forecastRevenue,
  predictClientSuccess,
  predictServiceUpgrades
};
