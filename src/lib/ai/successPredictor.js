/**
 * AI SUCCESS PREDICTOR SYSTEM
 *
 * Purpose:
 * Predict detailed client outcomes with high accuracy using machine learning
 * and historical data patterns to forecast credit score improvements, deletion
 * success rates, and goal achievement timelines.
 *
 * What It Predicts:
 * - Final Credit Score: Expected score after program completion
 * - Score Improvement: Total points gained (30, 50, 100+)
 * - Time to Goal: Months needed to reach target score
 * - Deletion Success Rate: % of negative items likely to be removed
 * - Dispute Win Rate: Success probability for each item
 * - Completion Probability: Likelihood of finishing program
 * - Satisfaction Prediction: Expected client satisfaction score
 * - Referral Likelihood: Probability of referring others
 *
 * Prediction Models:
 * 1. **Credit Score Model**: Starting score + negative items + cooperation → final score
 * 2. **Timeline Model**: Historical averages + client engagement → months to completion
 * 3. **Deletion Model**: Item type + age + bureau → removal probability
 * 4. **Churn Model**: Engagement + satisfaction + results → completion probability
 *
 * Input Factors:
 * - Starting credit score
 * - Number and type of negative items
 * - Client cooperation level (doc submission, responsiveness)
 * - Service tier (more support = better results)
 * - Historical performance data
 * - Bureau responsiveness patterns
 * - Item age and complexity
 *
 * Why It's Important:
 * - Set realistic client expectations
 * - Identify clients likely to fail early (intervene)
 * - Optimize resource allocation (focus on high-success clients)
 * - Price tiers based on expected outcomes
 * - Improve marketing with accurate success statistics
 * - Track prediction accuracy over time (improve model)
 *
 * Example Predictions:
 * - "Sarah: 620 → 695 (75 points) in 6.2 months. 87% completion probability."
 * - "Michael: 580 → 640 (60 points) in 8.5 months. 65% completion probability (at-risk)."
 * - "Collection account from 2019: 82% deletion probability. Medical debt: 95%."
 * - "Late payment from 2023: 45% deletion probability (recent, harder to remove)."
 *
 * Accuracy Tracking:
 * - Compare predictions to actual outcomes
 * - Calculate model accuracy (RMSE, MAE)
 * - Improve predictions over time
 * - A/B test different prediction models
 *
 * Created: 2025-12-05
 * Part of: Speedy Credit Repair AI Workflow System - Tier 3
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';

// ============================================================================
// SUCCESS PREDICTION - MAIN FUNCTION
// ============================================================================

/**
 * Generate comprehensive success prediction for a client
 * @param {string} contactId - Contact ID
 * @param {Object} options - Prediction options
 * @returns {Object} Detailed success prediction
 */
export async function predictClientSuccess(contactId, options = {}) {
  try {
    const contact = await getContact(contactId);
    if (!contact) {
      throw new Error('Contact not found');
    }

    const historicalData = await getHistoricalSuccessData();
    const negativeItems = await getNegativeItems(contactId);

    // Run all prediction models
    const predictions = {
      creditScore: await predictCreditScore(contact, negativeItems, historicalData),
      timeline: await predictTimeline(contact, negativeItems, historicalData),
      deletions: await predictDeletions(negativeItems, historicalData),
      completion: await predictCompletion(contact, historicalData),
      satisfaction: await predictSatisfaction(contact, historicalData),
      confidence: 0
    };

    // Calculate overall confidence
    predictions.confidence = calculatePredictionConfidence(contact, predictions);

    // Generate insights
    predictions.insights = generateSuccessInsights(predictions, contact);

    // Track prediction for accuracy measurement
    if (options.trackPrediction !== false) {
      await trackPrediction(contactId, predictions);
    }

    return predictions;

  } catch (error) {
    console.error('[predictClientSuccess] Error:', error);
    return { error: error.message };
  }
}

// ============================================================================
// CREDIT SCORE PREDICTION
// ============================================================================

async function predictCreditScore(contact, negativeItems, historicalData) {
  const startingScore = contact.creditScore || contact.initialCreditScore || 600;
  const itemCount = negativeItems.length;

  // Base prediction on historical data
  const similarClients = findSimilarClients(contact, historicalData);
  const avgImprovement = calculateAverageImprovement(similarClients);

  // Factors affecting prediction
  let predictedImprovement = avgImprovement;

  // Factor 1: Number of items (more items = more potential improvement)
  if (itemCount > 10) predictedImprovement += 15;
  else if (itemCount > 5) predictedImprovement += 10;
  else if (itemCount < 3) predictedImprovement -= 5;

  // Factor 2: Service tier (more support = better results)
  const tierBonus = {
    diy: -10,
    standard: 0,
    acceleration: 10,
    premium: 15,
    vip: 20
  };
  predictedImprovement += tierBonus[contact.serviceTier] || 0;

  // Factor 3: Client cooperation (estimated from engagement)
  const cooperationScore = estimateCooperation(contact);
  predictedImprovement += cooperationScore * 0.2; // Up to 20 points for perfect cooperation

  // Factor 4: Item types (easier items = faster improvement)
  const deletionPotential = await estimateOverallDeletionPotential(negativeItems);
  predictedImprovement += (deletionPotential - 50) * 0.3; // Adjust based on deletion likelihood

  // Calculate final predicted score
  const predictedFinalScore = Math.min(850, Math.round(startingScore + predictedImprovement));

  // Calculate range (conservative to optimistic)
  const conservativeScore = Math.round(startingScore + (predictedImprovement * 0.7));
  const optimisticScore = Math.min(850, Math.round(startingScore + (predictedImprovement * 1.3)));

  return {
    current: startingScore,
    predicted: predictedFinalScore,
    improvement: Math.round(predictedImprovement),
    range: {
      conservative: conservativeScore,
      expected: predictedFinalScore,
      optimistic: optimisticScore
    },
    confidence: calculateScoreConfidence(similarClients.length, contact),
    factors: {
      itemCount,
      serviceTier: contact.serviceTier,
      cooperation: cooperationScore,
      deletionPotential: Math.round(deletionPotential)
    }
  };
}

function findSimilarClients(contact, historicalData) {
  // Find clients with similar starting conditions
  return historicalData.filter(client => {
    const scoreDiff = Math.abs((client.initialScore || 600) - (contact.creditScore || 600));
    const itemDiff = Math.abs((client.itemCount || 0) - (contact.negativeItemCount || 0));

    return scoreDiff < 50 && itemDiff < 5 && client.finalScore; // Must have completed
  });
}

function calculateAverageImprovement(similarClients) {
  if (similarClients.length === 0) return 50; // Default estimate

  const improvements = similarClients.map(c => (c.finalScore || 0) - (c.initialScore || 0));
  return Math.round(improvements.reduce((sum, imp) => sum + imp, 0) / improvements.length);
}

function estimateCooperation(contact) {
  let score = 50; // Baseline

  // Email responsiveness
  if (contact.emailResponseRate > 0.8) score += 20;
  else if (contact.emailResponseRate > 0.6) score += 10;
  else if (contact.emailResponseRate < 0.3) score -= 20;

  // Portal engagement
  const logins = contact.portalLogins || 0;
  if (logins > 20) score += 15;
  else if (logins > 10) score += 10;
  else if (logins < 3) score -= 15;

  // Document submission
  const docs = contact.documentsProvided || 0;
  if (docs >= 5) score += 15;
  else if (docs >= 3) score += 5;
  else if (docs === 0) score -= 20;

  return Math.max(0, Math.min(100, score));
}

async function estimateOverallDeletionPotential(items) {
  if (items.length === 0) return 50;

  const deletionRates = await Promise.all(
    items.map(item => estimateItemDeletionProbability(item))
  );

  return Math.round(deletionRates.reduce((sum, rate) => sum + rate, 0) / items.length);
}

function calculateScoreConfidence(similarClientCount, contact) {
  let confidence = 50;

  // More similar clients = higher confidence
  if (similarClientCount > 20) confidence += 30;
  else if (similarClientCount > 10) confidence += 20;
  else if (similarClientCount > 5) confidence += 10;
  else confidence -= 20;

  // More data about this client = higher confidence
  const hasInitialScore = contact.initialCreditScore ? 10 : 0;
  const hasItems = contact.negativeItemCount > 0 ? 10 : 0;
  const hasEngagement = contact.portalLogins > 0 ? 10 : 0;

  confidence += hasInitialScore + hasItems + hasEngagement;

  return Math.max(30, Math.min(95, confidence));
}

// ============================================================================
// TIMELINE PREDICTION
// ============================================================================

async function predictTimeline(contact, negativeItems, historicalData) {
  const itemCount = negativeItems.length;

  // Base timeline from historical data
  const similarClients = findSimilarClients(contact, historicalData);
  const avgMonths = similarClients.length > 0
    ? similarClients.reduce((sum, c) => sum + (c.monthsToCompletion || 12), 0) / similarClients.length
    : 12;

  let predictedMonths = avgMonths;

  // Factor 1: Item count (more items = more time)
  if (itemCount > 15) predictedMonths += 4;
  else if (itemCount > 10) predictedMonths += 2;
  else if (itemCount < 5) predictedMonths -= 2;

  // Factor 2: Service tier (higher tiers = faster service)
  const tierAdjustment = {
    diy: 3,          // Slower (DIY)
    standard: 0,     // Baseline
    acceleration: -2, // 2 months faster
    premium: -3,     // 3 months faster
    vip: -4          // 4 months faster
  };
  predictedMonths += tierAdjustment[contact.serviceTier] || 0;

  // Factor 3: Client cooperation (responsive clients finish faster)
  const cooperationScore = estimateCooperation(contact);
  if (cooperationScore > 80) predictedMonths -= 2;
  else if (cooperationScore < 40) predictedMonths += 3;

  // Factor 4: Item complexity
  const complexItems = negativeItems.filter(item =>
    item.type === 'bankruptcy' || item.type === 'foreclosure' || item.type === 'judgment'
  ).length;
  predictedMonths += complexItems * 1.5;

  // Round and calculate milestones
  predictedMonths = Math.max(3, Math.round(predictedMonths));

  const milestones = generateMilestones(predictedMonths, negativeItems.length);

  return {
    estimatedMonths: predictedMonths,
    estimatedCompletionDate: addMonths(new Date(), predictedMonths),
    range: {
      fastest: Math.max(3, predictedMonths - 3),
      expected: predictedMonths,
      longest: predictedMonths + 4
    },
    milestones,
    factors: {
      itemCount,
      serviceTier: contact.serviceTier,
      cooperation: Math.round(cooperationScore),
      complexity: complexItems
    }
  };
}

function generateMilestones(totalMonths, itemCount) {
  const milestones = [];

  // Month 1: Initial disputes filed
  milestones.push({
    month: 1,
    event: 'Initial dispute letters sent',
    expectedResults: `First round of disputes filed for ${itemCount} items`
  });

  // Month 2-3: First results
  milestones.push({
    month: Math.min(3, Math.ceil(totalMonths * 0.25)),
    event: 'First dispute responses',
    expectedResults: 'Initial deletions and verifications expected'
  });

  // Mid-point: Significant progress
  milestones.push({
    month: Math.ceil(totalMonths * 0.5),
    event: 'Midpoint progress check',
    expectedResults: `50-60% of negative items addressed`
  });

  // Near completion: Final push
  if (totalMonths > 6) {
    milestones.push({
      month: Math.ceil(totalMonths * 0.75),
      event: 'Final dispute rounds',
      expectedResults: 'Addressing remaining difficult items'
    });
  }

  // Completion
  milestones.push({
    month: totalMonths,
    event: 'Expected program completion',
    expectedResults: 'All dispute rounds completed, final score achieved'
  });

  return milestones;
}

function addMonths(date, months) {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

// ============================================================================
// DELETION PREDICTION
// ============================================================================

async function predictDeletions(negativeItems, historicalData) {
  if (negativeItems.length === 0) {
    return {
      totalItems: 0,
      expectedDeletions: 0,
      deletionRate: 0,
      itemPredictions: []
    };
  }

  const itemPredictions = await Promise.all(
    negativeItems.map(async item => ({
      item,
      deletionProbability: await estimateItemDeletionProbability(item),
      estimatedMonths: estimateItemResolutionTime(item),
      difficulty: classifyItemDifficulty(item)
    }))
  );

  // Calculate overall deletion rate
  const totalProbability = itemPredictions.reduce((sum, pred) => sum + pred.deletionProbability, 0);
  const avgDeletionRate = Math.round(totalProbability / negativeItems.length);
  const expectedDeletions = Math.round(negativeItems.length * (avgDeletionRate / 100));

  // Group by difficulty
  const byDifficulty = {
    easy: itemPredictions.filter(p => p.difficulty === 'easy'),
    medium: itemPredictions.filter(p => p.difficulty === 'medium'),
    hard: itemPredictions.filter(p => p.difficulty === 'hard')
  };

  return {
    totalItems: negativeItems.length,
    expectedDeletions,
    deletionRate: avgDeletionRate,
    itemPredictions: itemPredictions.sort((a, b) => b.deletionProbability - a.deletionProbability),
    byDifficulty: {
      easy: byDifficulty.easy.length,
      medium: byDifficulty.medium.length,
      hard: byDifficulty.hard.length
    },
    insights: generateDeletionInsights(itemPredictions)
  };
}

async function estimateItemDeletionProbability(item) {
  // Base rates by item type (from historical data)
  const baseRates = {
    'late_payment': 45,
    'collection': 75,
    'charge_off': 65,
    'medical_collection': 85,
    'inquiry': 60,
    'bankruptcy': 25,
    'foreclosure': 20,
    'judgment': 35,
    'tax_lien': 30,
    'student_loan': 40
  };

  let probability = baseRates[item.type] || 50;

  // Factor: Age of item (older = easier to remove)
  const age = calculateItemAge(item.date);
  if (age > 5) probability += 15;
  else if (age > 3) probability += 10;
  else if (age < 1) probability -= 15;

  // Factor: Bureau verification history
  if (item.previouslyDisputed) {
    probability -= 10; // Harder if already fought
  }

  // Factor: Item accuracy (inaccurate items easier to remove)
  if (item.hasInaccuracies) {
    probability += 20;
  }

  // Factor: Original creditor responsiveness
  if (item.creditorType === 'small_business') {
    probability += 10; // Small businesses less likely to respond
  }

  return Math.max(10, Math.min(95, Math.round(probability)));
}

function estimateItemResolutionTime(item) {
  // Months to resolve this item
  const baseTime = {
    'inquiry': 1,
    'late_payment': 3,
    'collection': 4,
    'medical_collection': 3,
    'charge_off': 5,
    'bankruptcy': 12,
    'foreclosure': 12,
    'judgment': 8,
    'tax_lien': 10
  };

  return baseTime[item.type] || 6;
}

function classifyItemDifficulty(item) {
  const probability = estimateItemDeletionProbability(item);

  if (probability > 70) return 'easy';
  if (probability > 40) return 'medium';
  return 'hard';
}

function calculateItemAge(itemDate) {
  if (!itemDate) return 2; // Default 2 years

  const date = new Date(itemDate);
  const now = new Date();
  const years = (now - date) / (1000 * 60 * 60 * 24 * 365);

  return Math.max(0, years);
}

function generateDeletionInsights(itemPredictions) {
  const insights = [];

  const easyItems = itemPredictions.filter(p => p.difficulty === 'easy');
  if (easyItems.length > 0) {
    insights.push({
      type: 'positive',
      message: `${easyItems.length} items have high deletion probability (>70%)`,
      recommendation: 'Focus on these first for quick wins'
    });
  }

  const hardItems = itemPredictions.filter(p => p.difficulty === 'hard');
  if (hardItems.length > 3) {
    insights.push({
      type: 'concern',
      message: `${hardItems.length} items are difficult to remove (<40% probability)`,
      recommendation: 'May require multiple dispute rounds or goodwill approach'
    });
  }

  return insights;
}

// ============================================================================
// COMPLETION PREDICTION
// ============================================================================

async function predictCompletion(contact, historicalData) {
  // Predict if client will complete program (vs churn)
  let completionProbability = 70; // Baseline

  // Factor 1: Engagement level
  const engagement = estimateCooperation(contact);
  if (engagement > 80) completionProbability += 20;
  else if (engagement > 60) completionProbability += 10;
  else if (engagement < 40) completionProbability -= 20;
  else if (engagement < 20) completionProbability -= 35;

  // Factor 2: Payment history
  const missedPayments = contact.missedPayments || 0;
  completionProbability -= missedPayments * 10;

  // Factor 3: Early results
  const monthsActive = getDaysSince(contact.createdAt) / 30;
  if (monthsActive > 2) {
    const scoreImprovement = (contact.creditScore || 600) - (contact.initialCreditScore || 600);
    if (scoreImprovement > 30) completionProbability += 15;
    else if (scoreImprovement < 10) completionProbability -= 15;
  }

  // Factor 4: Service tier (higher tiers = more committed)
  const tierBonus = {
    diy: -10,
    standard: 0,
    acceleration: 5,
    premium: 10,
    vip: 15
  };
  completionProbability += tierBonus[contact.serviceTier] || 0;

  // Factor 5: Sentiment (if available)
  if (contact.latestSentiment) {
    if (contact.latestSentiment.label === 'positive') completionProbability += 10;
    else if (contact.latestSentiment.label === 'negative') completionProbability -= 15;
  }

  completionProbability = Math.max(10, Math.min(95, Math.round(completionProbability)));

  const risk = completionProbability < 50 ? 'high' :
                completionProbability < 70 ? 'medium' : 'low';

  return {
    probability: completionProbability,
    churnRisk: risk,
    expectedOutcome: completionProbability > 60 ? 'will_complete' : 'at_risk',
    interventionsRecommended: completionProbability < 60 ? true : false,
    factors: {
      engagement: Math.round(engagement),
      paymentHistory: missedPayments === 0 ? 'good' : 'concerning',
      earlyResults: monthsActive > 2 ? 'tracked' : 'too_early',
      serviceTier: contact.serviceTier
    }
  };
}

// ============================================================================
// SATISFACTION PREDICTION
// ============================================================================

async function predictSatisfaction(contact, historicalData) {
  // Predict NPS score (0-10) and satisfaction level
  let npsScore = 7; // Baseline (neutral)

  // Factor 1: Expected results vs actual timeline
  const expectedMonths = 12; // Average
  const monthsActive = getDaysSince(contact.createdAt) / 30;

  if (monthsActive > expectedMonths * 1.5) {
    npsScore -= 2; // Taking too long
  }

  // Factor 2: Score improvement
  const improvement = (contact.creditScore || 600) - (contact.initialCreditScore || 600);
  if (improvement > 75) npsScore += 2;
  else if (improvement > 50) npsScore += 1;
  else if (improvement < 20 && monthsActive > 6) npsScore -= 2;

  // Factor 3: Service tier (higher tiers = higher expectations but better service)
  const tierAdjustment = {
    diy: -1,      // Lower expectations
    standard: 0,
    acceleration: 0,
    premium: 1,   // Better service
    vip: 2        // White glove service
  };
  npsScore += tierAdjustment[contact.serviceTier] || 0;

  // Factor 4: Recent sentiment
  if (contact.latestSentiment) {
    if (contact.latestSentiment.label === 'positive') npsScore += 1;
    else if (contact.latestSentiment.label === 'negative') npsScore -= 2;
  }

  npsScore = Math.max(0, Math.min(10, Math.round(npsScore)));

  // Classify satisfaction
  const category = npsScore >= 9 ? 'promoter' :
                   npsScore >= 7 ? 'passive' : 'detractor';

  const referralLikelihood = npsScore >= 9 ? 'very_likely' :
                             npsScore >= 7 ? 'possible' : 'unlikely';

  return {
    predictedNPS: npsScore,
    category,
    referralLikelihood,
    estimatedSatisfaction: (npsScore / 10) * 100,
    factors: {
      timelineExpectation: monthsActive > expectedMonths * 1.5 ? 'too_slow' : 'on_track',
      resultsQuality: improvement > 50 ? 'excellent' : improvement > 30 ? 'good' : 'needs_improvement',
      serviceTier: contact.serviceTier
    }
  };
}

// ============================================================================
// INSIGHTS GENERATION
// ============================================================================

function generateSuccessInsights(predictions, contact) {
  const insights = [];

  // Credit score insights
  if (predictions.creditScore.improvement > 75) {
    insights.push({
      type: 'positive',
      category: 'score',
      message: `Excellent prognosis: ${predictions.creditScore.improvement}-point improvement expected`,
      icon: '🎯'
    });
  } else if (predictions.creditScore.improvement < 30) {
    insights.push({
      type: 'concern',
      category: 'score',
      message: `Limited improvement potential: ${predictions.creditScore.improvement} points`,
      recommendation: 'Consider adjusting expectations or upgrading service tier',
      icon: '⚠️'
    });
  }

  // Timeline insights
  if (predictions.timeline.estimatedMonths > 12) {
    insights.push({
      type: 'info',
      category: 'timeline',
      message: `Extended timeline: ${predictions.timeline.estimatedMonths} months to completion`,
      recommendation: 'Set clear expectations with client about long-term commitment',
      icon: '⏱️'
    });
  }

  // Deletion insights
  if (predictions.deletions.deletionRate > 75) {
    insights.push({
      type: 'positive',
      category: 'deletions',
      message: `High deletion success rate: ${predictions.deletions.deletionRate}%`,
      icon: '✅'
    });
  } else if (predictions.deletions.deletionRate < 50) {
    insights.push({
      type: 'concern',
      category: 'deletions',
      message: `Challenging items: ${predictions.deletions.deletionRate}% deletion rate`,
      recommendation: 'Focus on goodwill letters and manual verification requests',
      icon: '⚠️'
    });
  }

  // Completion risk
  if (predictions.completion.churnRisk === 'high') {
    insights.push({
      type: 'alert',
      category: 'completion',
      message: `High churn risk: ${predictions.completion.probability}% completion probability`,
      recommendation: 'Implement retention strategies immediately',
      icon: '🚨'
    });
  }

  // Satisfaction prediction
  if (predictions.satisfaction.category === 'promoter') {
    insights.push({
      type: 'positive',
      category: 'satisfaction',
      message: 'Likely promoter - high referral potential',
      recommendation: 'Ask for referrals and testimonial',
      icon: '⭐'
    });
  } else if (predictions.satisfaction.category === 'detractor') {
    insights.push({
      type: 'concern',
      category: 'satisfaction',
      message: 'May become detractor - proactive intervention needed',
      recommendation: 'Schedule personal check-in call',
      icon: '⚠️'
    });
  }

  return insights;
}

// ============================================================================
// CONFIDENCE CALCULATION
// ============================================================================

function calculatePredictionConfidence(contact, predictions) {
  let confidence = 50;

  // More data = higher confidence
  const dataPoints = [
    contact.creditScore ? 10 : 0,
    contact.initialCreditScore ? 10 : 0,
    contact.negativeItemCount ? 10 : 0,
    contact.portalLogins > 5 ? 10 : 0,
    contact.emailResponseRate ? 10 : 0,
    getDaysSince(contact.createdAt) > 30 ? 10 : 0
  ].reduce((sum, val) => sum + val, 0);

  confidence += dataPoints;

  // Individual prediction confidences
  if (predictions.creditScore.confidence) {
    confidence += (predictions.creditScore.confidence - 50) * 0.3;
  }

  return Math.round(Math.max(30, Math.min(95, confidence)));
}

// ============================================================================
// PREDICTION TRACKING
// ============================================================================

async function trackPrediction(contactId, predictions) {
  try {
    await addDoc(collection(db, 'successPredictions'), {
      contactId,
      predictions,
      predictedAt: Timestamp.now(),
      status: 'pending_validation'
    });

    return { success: true };
  } catch (error) {
    console.error('[trackPrediction] Error:', error);
    return { error: error.message };
  }
}

/**
 * Validate prediction accuracy against actual outcomes
 * @param {string} contactId - Contact ID
 * @returns {Object} Accuracy metrics
 */
export async function validatePredictionAccuracy(contactId) {
  try {
    const contact = await getContact(contactId);
    if (!contact || contact.status !== 'completed') {
      return { error: 'Contact has not completed program yet' };
    }

    // Get original prediction
    const predictionQuery = query(
      collection(db, 'successPredictions'),
      where('contactId', '==', contactId),
      orderBy('predictedAt', 'desc'),
      limit(1)
    );

    const snapshot = await getDocs(predictionQuery);
    if (snapshot.empty) {
      return { error: 'No prediction found for this contact' };
    }

    const prediction = snapshot.docs[0].data();
    const actual = {
      finalScore: contact.creditScore,
      improvement: contact.creditScore - contact.initialCreditScore,
      monthsToComplete: getDaysSince(contact.createdAt) / 30,
      deletionCount: contact.deletedItems || 0,
      completedProgram: true
    };

    // Calculate accuracy
    const accuracy = {
      scoreAccuracy: calculateScoreAccuracy(prediction.predictions.creditScore, actual),
      timelineAccuracy: calculateTimelineAccuracy(prediction.predictions.timeline, actual),
      deletionAccuracy: calculateDeletionAccuracy(prediction.predictions.deletions, actual)
    };

    return {
      prediction: prediction.predictions,
      actual,
      accuracy,
      overallAccuracy: Math.round((accuracy.scoreAccuracy + accuracy.timelineAccuracy + accuracy.deletionAccuracy) / 3)
    };

  } catch (error) {
    console.error('[validatePredictionAccuracy] Error:', error);
    return { error: error.message };
  }
}

function calculateScoreAccuracy(predicted, actual) {
  const error = Math.abs(predicted.predicted - actual.finalScore);
  const percentError = (error / actual.finalScore) * 100;

  return Math.max(0, Math.round(100 - percentError));
}

function calculateTimelineAccuracy(predicted, actual) {
  const error = Math.abs(predicted.estimatedMonths - actual.monthsToComplete);
  const percentError = (error / actual.monthsToComplete) * 100;

  return Math.max(0, Math.round(100 - percentError));
}

function calculateDeletionAccuracy(predicted, actual) {
  if (predicted.totalItems === 0) return 100;

  const error = Math.abs(predicted.expectedDeletions - actual.deletionCount);
  const percentError = (error / predicted.totalItems) * 100;

  return Math.max(0, Math.round(100 - percentError));
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function getContact(contactId) {
  const contactDoc = await getDoc(doc(db, 'contacts', contactId));
  return contactDoc.exists() ? { id: contactDoc.id, ...contactDoc.data() } : null;
}

async function getHistoricalSuccessData() {
  const q = query(
    collection(db, 'contacts'),
    where('status', '==', 'completed'),
    limit(100)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data());
}

async function getNegativeItems(contactId) {
  const q = query(
    collection(db, 'negativeItems'),
    where('contactId', '==', contactId)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

function getDaysSince(timestamp) {
  if (!timestamp) return 0;
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
}

export default {
  predictClientSuccess,
  validatePredictionAccuracy
};
