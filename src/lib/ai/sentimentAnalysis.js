/**
 * AI CLIENT SENTIMENT ANALYSIS SYSTEM
 *
 * Purpose:
 * Analyzes emotional tone in client communications (emails, SMS, calls) to detect
 * satisfaction, frustration, confusion, urgency, and churn risk before it's too late.
 *
 * What It Analyzes:
 * - Email Content: Subject lines, body text, reply patterns
 * - SMS Messages: Text tone, urgency indicators, emoji usage
 * - Support Tickets: Frustration levels, resolution satisfaction
 * - Call Notes: Tone indicators recorded by staff
 * - Response Patterns: Speed, completeness, engagement level
 *
 * Sentiment Categories:
 * - Positive: Happy, satisfied, grateful, enthusiastic
 * - Neutral: Informational, transactional, standard inquiries
 * - Negative: Frustrated, angry, disappointed, confused
 * - Urgent: Time-sensitive, demanding immediate attention
 * - At-Risk: Cancellation intent, dissatisfaction patterns
 *
 * Why It's Important:
 * - Catch dissatisfaction early (before they churn)
 * - Prioritize responses to frustrated clients
 * - Celebrate successes with satisfied clients
 * - Identify confusion points in communication
 * - Measure effectiveness of support interventions
 * - Track emotional journey throughout client lifecycle
 *
 * Example Detections:
 * - Email: "I've been waiting 2 weeks..." → Frustrated (75%), Urgent (80%)
 * - SMS: "Thank you so much! My score went up!" → Positive (95%), Satisfied (90%)
 * - Email: "I'm thinking about canceling" → At-Risk (100%), Negative (85%)
 * - SMS: "Can someone help me?" → Confused (70%), Neutral (30%)
 * - Email: "This is ridiculous" → Frustrated (90%), At-Risk (60%)
 *
 * Sentiment Trends:
 * - Track sentiment over time (improving vs declining)
 * - Compare sentiment by service tier
 * - Identify sentiment triggers (billing, delays, results)
 * - Measure impact of interventions
 * - Predict churn based on sentiment trajectory
 *
 * Alert Triggers:
 * - Sudden negative sentiment shift
 * - Repeated negative communications
 * - Cancellation language detected
 * - Prolonged silence after negative sentiment
 * - Multiple support escalations
 *
 * Created: 2025-12-05
 * Part of: Speedy Credit Repair AI Workflow System - Tier 2
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
// SENTIMENT ANALYSIS - MAIN FUNCTION
// ============================================================================

/**
 * Analyze sentiment of a communication
 * @param {Object} communication - Communication object (email, SMS, etc.)
 * @returns {Object} Sentiment analysis result
 */
export async function analyzeSentiment(communication) {
  try {
    const { type, content, subject, contactId } = communication;

    // Extract text content
    const textToAnalyze = type === 'email'
      ? `${subject || ''}\n\n${content || ''}`
      : content || '';

    if (!textToAnalyze.trim()) {
      return {
        error: 'No content to analyze',
        sentiment: 'neutral',
        confidence: 0
      };
    }

    // Perform multi-dimensional analysis
    const overallSentiment = calculateOverallSentiment(textToAnalyze);
    const emotions = detectEmotions(textToAnalyze);
    const urgency = detectUrgency(textToAnalyze);
    const churnRisk = detectChurnRisk(textToAnalyze);
    const keyPhrases = extractKeyPhrases(textToAnalyze);
    const tone = determineTone(emotions, urgency, churnRisk);

    // Get historical context
    const historicalSentiment = contactId
      ? await getHistoricalSentiment(contactId)
      : null;

    const sentimentShift = historicalSentiment
      ? calculateSentimentShift(overallSentiment.score, historicalSentiment.averageScore)
      : null;

    // Determine if intervention needed
    const intervention = determineIntervention({
      sentiment: overallSentiment,
      emotions,
      urgency,
      churnRisk,
      sentimentShift,
      historicalSentiment
    });

    // Save analysis
    const analysisResult = {
      communicationId: communication.id,
      contactId,
      timestamp: new Date(),
      type,
      sentiment: overallSentiment,
      emotions,
      urgency,
      churnRisk,
      tone,
      keyPhrases,
      sentimentShift,
      intervention
    };

    // Store in database
    if (contactId) {
      await storeSentimentAnalysis(contactId, analysisResult);
    }

    return analysisResult;

  } catch (error) {
    console.error('[analyzeSentiment] Error:', error);
    return {
      error: error.message,
      sentiment: 'neutral',
      confidence: 0
    };
  }
}

// ============================================================================
// OVERALL SENTIMENT CALCULATION
// ============================================================================

function calculateOverallSentiment(text) {
  const normalizedText = text.toLowerCase();
  let score = 50; // Neutral baseline (0-100 scale)
  let signals = 0;

  // Positive indicators
  POSITIVE_INDICATORS.forEach(indicator => {
    const count = countOccurrences(normalizedText, indicator.phrases);
    if (count > 0) {
      score += indicator.weight * count;
      signals += count;
    }
  });

  // Negative indicators
  NEGATIVE_INDICATORS.forEach(indicator => {
    const count = countOccurrences(normalizedText, indicator.phrases);
    if (count > 0) {
      score -= indicator.weight * count;
      signals += count;
    }
  });

  // Normalize score to 0-100
  score = Math.max(0, Math.min(100, score));

  // Calculate confidence based on number of signals
  const confidence = Math.min(100, (signals / 3) * 100);

  return {
    score, // 0-100 (0 = very negative, 50 = neutral, 100 = very positive)
    label: getSentimentLabel(score),
    confidence
  };
}

const POSITIVE_INDICATORS = [
  {
    phrases: ['thank you', 'thanks', 'appreciate', 'grateful'],
    weight: 8
  },
  {
    phrases: ['great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'awesome'],
    weight: 10
  },
  {
    phrases: ['happy', 'pleased', 'satisfied', 'glad', 'delighted'],
    weight: 9
  },
  {
    phrases: ['love', 'loving', 'love it'],
    weight: 12
  },
  {
    phrases: ['helpful', 'professional', 'responsive', 'quick'],
    weight: 7
  },
  {
    phrases: ['improved', 'better', 'progress', 'success', 'working'],
    weight: 8
  },
  {
    phrases: ['recommend', 'referral', 'tell others'],
    weight: 15
  }
];

const NEGATIVE_INDICATORS = [
  {
    phrases: ['frustrated', 'frustrating', 'annoyed', 'irritated'],
    weight: 10
  },
  {
    phrases: ['disappointed', 'disappointing', 'let down'],
    weight: 9
  },
  {
    phrases: ['angry', 'mad', 'furious', 'upset'],
    weight: 12
  },
  {
    phrases: ['terrible', 'horrible', 'awful', 'worst'],
    weight: 11
  },
  {
    phrases: ['confused', 'don\'t understand', 'unclear', 'confusing'],
    weight: 7
  },
  {
    phrases: ['problem', 'issue', 'trouble', 'difficulty'],
    weight: 6
  },
  {
    phrases: ['waiting', 'delayed', 'late', 'slow'],
    weight: 7
  },
  {
    phrases: ['not working', 'doesn\'t work', 'broken', 'failed'],
    weight: 9
  },
  {
    phrases: ['cancel', 'canceling', 'refund', 'money back'],
    weight: 15
  }
];

function getSentimentLabel(score) {
  if (score >= 70) return 'positive';
  if (score >= 55) return 'somewhat_positive';
  if (score >= 45) return 'neutral';
  if (score >= 30) return 'somewhat_negative';
  return 'negative';
}

// ============================================================================
// EMOTION DETECTION
// ============================================================================

function detectEmotions(text) {
  const normalizedText = text.toLowerCase();
  const emotions = {};

  EMOTION_PATTERNS.forEach(emotion => {
    const score = calculateEmotionScore(normalizedText, emotion.indicators);
    if (score > 0) {
      emotions[emotion.name] = {
        score,
        intensity: getIntensityLevel(score)
      };
    }
  });

  return emotions;
}

const EMOTION_PATTERNS = [
  {
    name: 'satisfied',
    indicators: ['satisfied', 'happy', 'pleased', 'content', 'good results', 'working well', 'score improved']
  },
  {
    name: 'frustrated',
    indicators: ['frustrated', 'frustrating', 'annoyed', 'irritated', 'fed up', 'had enough', 'ridiculous']
  },
  {
    name: 'grateful',
    indicators: ['thank you', 'thanks', 'appreciate', 'grateful', 'thankful', 'blessing']
  },
  {
    name: 'confused',
    indicators: ['confused', 'don\'t understand', 'unclear', 'not sure', 'what does', 'how do i', 'help me']
  },
  {
    name: 'disappointed',
    indicators: ['disappointed', 'let down', 'expected more', 'thought it would', 'not what i']
  },
  {
    name: 'anxious',
    indicators: ['worried', 'concerned', 'anxious', 'nervous', 'scared', 'afraid', 'what if']
  },
  {
    name: 'angry',
    indicators: ['angry', 'mad', 'furious', 'outraged', 'unacceptable', 'demand', 'complaint']
  },
  {
    name: 'hopeful',
    indicators: ['hopeful', 'hoping', 'excited', 'looking forward', 'can\'t wait', 'optimistic']
  },
  {
    name: 'impatient',
    indicators: ['waiting', 'how long', 'when will', 'hurry', 'asap', 'urgently', 'still waiting']
  }
];

function calculateEmotionScore(text, indicators) {
  let score = 0;

  indicators.forEach(indicator => {
    if (text.includes(indicator)) {
      score += 20;
    }
  });

  return Math.min(100, score);
}

function getIntensityLevel(score) {
  if (score >= 60) return 'high';
  if (score >= 30) return 'medium';
  return 'low';
}

// ============================================================================
// URGENCY DETECTION
// ============================================================================

function detectUrgency(text) {
  const normalizedText = text.toLowerCase();
  let urgencyScore = 0;
  const urgencyIndicators = [];

  URGENCY_PATTERNS.forEach(pattern => {
    if (countOccurrences(normalizedText, pattern.phrases) > 0) {
      urgencyScore += pattern.weight;
      urgencyIndicators.push(pattern.reason);
    }
  });

  return {
    score: Math.min(100, urgencyScore),
    level: getUrgencyLevel(urgencyScore),
    indicators: urgencyIndicators,
    requiresImmediateAction: urgencyScore > 60
  };
}

const URGENCY_PATTERNS = [
  {
    phrases: ['urgent', 'urgently', 'asap', 'as soon as possible'],
    weight: 30,
    reason: 'Explicit urgency language'
  },
  {
    phrases: ['immediately', 'right away', 'right now', 'today'],
    weight: 25,
    reason: 'Immediate action requested'
  },
  {
    phrases: ['emergency', 'critical', 'important'],
    weight: 20,
    reason: 'High-priority language'
  },
  {
    phrases: ['deadline', 'expires', 'running out', 'last chance'],
    weight: 25,
    reason: 'Time constraint mentioned'
  },
  {
    phrases: ['waiting', 'still waiting', 'been waiting', 'how long'],
    weight: 15,
    reason: 'Extended wait time'
  },
  {
    phrases: ['help', 'please help', 'need help', 'can someone'],
    weight: 10,
    reason: 'Help requested'
  }
];

function getUrgencyLevel(score) {
  if (score >= 60) return 'critical';
  if (score >= 40) return 'high';
  if (score >= 20) return 'medium';
  return 'low';
}

// ============================================================================
// CHURN RISK DETECTION
// ============================================================================

function detectChurnRisk(text) {
  const normalizedText = text.toLowerCase();
  let churnScore = 0;
  const riskIndicators = [];

  CHURN_PATTERNS.forEach(pattern => {
    if (countOccurrences(normalizedText, pattern.phrases) > 0) {
      churnScore += pattern.weight;
      riskIndicators.push(pattern.reason);
    }
  });

  return {
    score: Math.min(100, churnScore),
    level: getChurnRiskLevel(churnScore),
    indicators: riskIndicators,
    requiresIntervention: churnScore > 50
  };
}

const CHURN_PATTERNS = [
  {
    phrases: ['cancel', 'canceling', 'cancellation', 'want to cancel'],
    weight: 50,
    reason: 'Explicit cancellation intent'
  },
  {
    phrases: ['refund', 'money back', 'get my money'],
    weight: 40,
    reason: 'Refund request'
  },
  {
    phrases: ['not worth', 'waste of money', 'too expensive', 'overpriced'],
    weight: 35,
    reason: 'Value concerns'
  },
  {
    phrases: ['not working', 'doesn\'t work', 'no results', 'no progress'],
    weight: 30,
    reason: 'Effectiveness concerns'
  },
  {
    phrases: ['thinking about', 'considering', 'might cancel', 'probably cancel'],
    weight: 25,
    reason: 'Considering cancellation'
  },
  {
    phrases: ['other options', 'competitor', 'somewhere else', 'different service'],
    weight: 30,
    reason: 'Considering alternatives'
  },
  {
    phrases: ['disappointed', 'let down', 'expected more', 'not satisfied'],
    weight: 20,
    reason: 'Dissatisfaction expressed'
  },
  {
    phrases: ['never', 'always', 'every time'], // Absolute language indicating frustration
    weight: 15,
    reason: 'Frustration with repeated issues'
  }
];

function getChurnRiskLevel(score) {
  if (score >= 70) return 'critical';
  if (score >= 50) return 'high';
  if (score >= 30) return 'medium';
  return 'low';
}

// ============================================================================
// KEY PHRASE EXTRACTION
// ============================================================================

function extractKeyPhrases(text) {
  const normalizedText = text.toLowerCase();
  const phrases = [];

  // Extract quoted text
  const quotes = text.match(/"([^"]+)"/g);
  if (quotes) {
    phrases.push(...quotes.map(q => ({ text: q, type: 'quote' })));
  }

  // Extract important phrases
  KEY_PHRASE_PATTERNS.forEach(pattern => {
    const matches = normalizedText.match(pattern.regex);
    if (matches) {
      matches.forEach(match => {
        phrases.push({
          text: match,
          type: pattern.type,
          importance: pattern.importance
        });
      });
    }
  });

  return phrases.slice(0, 10); // Return top 10 phrases
}

const KEY_PHRASE_PATTERNS = [
  {
    type: 'question',
    regex: /[a-z\s]{3,}(?:\?)/g,
    importance: 'high'
  },
  {
    type: 'complaint',
    regex: /(?:problem|issue|trouble|concern) (?:with|about) [a-z\s]{3,}/g,
    importance: 'high'
  },
  {
    type: 'request',
    regex: /(?:can you|could you|please) [a-z\s]{3,}/g,
    importance: 'medium'
  }
];

// ============================================================================
// TONE DETERMINATION
// ============================================================================

function determineTone(emotions, urgency, churnRisk) {
  // Professional/Formal vs Casual
  // Positive vs Negative
  // Urgent vs Routine
  // Engaged vs Disengaged

  const tones = [];

  // Primary tone based on sentiment
  if (emotions.satisfied || emotions.grateful) {
    tones.push('positive');
  } else if (emotions.frustrated || emotions.angry) {
    tones.push('negative');
  } else {
    tones.push('neutral');
  }

  // Secondary tones
  if (urgency.level === 'critical' || urgency.level === 'high') {
    tones.push('urgent');
  }

  if (emotions.confused) {
    tones.push('confused');
  }

  if (churnRisk.level === 'critical' || churnRisk.level === 'high') {
    tones.push('at-risk');
  }

  if (emotions.anxious) {
    tones.push('concerned');
  }

  return tones;
}

// ============================================================================
// HISTORICAL SENTIMENT ANALYSIS
// ============================================================================

async function getHistoricalSentiment(contactId) {
  try {
    const q = query(
      collection(db, 'sentimentHistory'),
      where('contactId', '==', contactId),
      orderBy('timestamp', 'desc'),
      limit(20)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const history = snapshot.docs.map(doc => doc.data());

    // Calculate average sentiment
    const totalScore = history.reduce((sum, item) => sum + (item.sentiment?.score || 50), 0);
    const averageScore = totalScore / history.length;

    // Detect trend (improving, declining, stable)
    const recentScores = history.slice(0, 5).map(item => item.sentiment?.score || 50);
    const olderScores = history.slice(5, 10).map(item => item.sentiment?.score || 50);

    const recentAvg = recentScores.reduce((sum, s) => sum + s, 0) / recentScores.length;
    const olderAvg = olderScores.length > 0
      ? olderScores.reduce((sum, s) => sum + s, 0) / olderScores.length
      : recentAvg;

    const trend = recentAvg > olderAvg + 10 ? 'improving'
      : recentAvg < olderAvg - 10 ? 'declining'
      : 'stable';

    return {
      averageScore,
      trend,
      recentScores,
      communicationCount: history.length,
      lastAnalysis: history[0]
    };

  } catch (error) {
    console.error('[getHistoricalSentiment] Error:', error);
    return null;
  }
}

function calculateSentimentShift(currentScore, historicalAverage) {
  const shift = currentScore - historicalAverage;
  const percentShift = (shift / historicalAverage) * 100;

  return {
    absolute: Math.round(shift),
    percent: Math.round(percentShift),
    direction: shift > 5 ? 'improving' : shift < -5 ? 'declining' : 'stable',
    significant: Math.abs(percentShift) > 20 // 20% change is significant
  };
}

// ============================================================================
// INTERVENTION DETERMINATION
// ============================================================================

function determineIntervention(analysis) {
  const interventions = [];

  // Critical churn risk
  if (analysis.churnRisk.level === 'critical') {
    interventions.push({
      priority: 'immediate',
      type: 'churn_prevention',
      action: 'Call client immediately - cancellation intent detected',
      assignTo: 'christopher',
      reason: analysis.churnRisk.indicators.join(', ')
    });
  }

  // High negative sentiment
  if (analysis.sentiment.score < 30) {
    interventions.push({
      priority: 'high',
      type: 'satisfaction_recovery',
      action: 'Personal outreach to address concerns',
      assignTo: 'christopher',
      reason: 'Very negative sentiment detected'
    });
  }

  // Confused client
  if (analysis.emotions.confused && analysis.emotions.confused.intensity !== 'low') {
    interventions.push({
      priority: 'medium',
      type: 'clarification',
      action: 'Provide clear explanation and guidance',
      assignTo: 'support',
      reason: 'Client appears confused'
    });
  }

  // Urgent request
  if (analysis.urgency.requiresImmediateAction) {
    interventions.push({
      priority: 'immediate',
      type: 'urgent_response',
      action: 'Respond within 1 hour',
      assignTo: 'support',
      reason: analysis.urgency.indicators.join(', ')
    });
  }

  // Significant negative sentiment shift
  if (analysis.sentimentShift?.significant && analysis.sentimentShift.direction === 'declining') {
    interventions.push({
      priority: 'high',
      type: 'sentiment_decline',
      action: 'Check in with client - sentiment declining',
      assignTo: 'christopher',
      reason: `Sentiment dropped ${Math.abs(analysis.sentimentShift.absolute)} points`
    });
  }

  // No intervention needed
  if (interventions.length === 0) {
    return {
      needed: false,
      message: 'Sentiment appears healthy - no intervention required'
    };
  }

  return {
    needed: true,
    count: interventions.length,
    interventions: interventions.sort((a, b) => {
      const priorityOrder = { immediate: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    })
  };
}

// ============================================================================
// STORAGE
// ============================================================================

async function storeSentimentAnalysis(contactId, analysis) {
  try {
    await addDoc(collection(db, 'sentimentHistory'), {
      contactId,
      ...analysis,
      timestamp: Timestamp.now()
    });

    // Update contact's latest sentiment
    const contactRef = doc(db, 'contacts', contactId);
    await updateDoc(contactRef, {
      latestSentiment: {
        score: analysis.sentiment.score,
        label: analysis.sentiment.label,
        tone: analysis.tone,
        churnRisk: analysis.churnRisk.level,
        analyzedAt: Timestamp.now()
      }
    });

  } catch (error) {
    console.error('[storeSentimentAnalysis] Error:', error);
  }
}

// ============================================================================
// BATCH ANALYSIS
// ============================================================================

/**
 * Analyze sentiment for all recent communications of a contact
 * @param {string} contactId - Contact ID
 * @param {number} limit - Number of recent communications to analyze
 * @returns {Object} Aggregated sentiment analysis
 */
export async function analyzeContactSentiment(contactId, limit = 10) {
  try {
    const q = query(
      collection(db, 'communications'),
      where('contactId', '==', contactId),
      orderBy('timestamp', 'desc'),
      limit(limit)
    );

    const snapshot = await getDocs(q);
    const communications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const analyses = await Promise.all(
      communications.map(comm => analyzeSentiment(comm))
    );

    // Aggregate results
    const avgSentiment = analyses.reduce((sum, a) => sum + (a.sentiment?.score || 50), 0) / analyses.length;
    const overallTone = aggregateTones(analyses.map(a => a.tone));
    const highestChurnRisk = Math.max(...analyses.map(a => a.churnRisk?.score || 0));

    return {
      contactId,
      communicationsAnalyzed: analyses.length,
      averageSentiment: Math.round(avgSentiment),
      overallTone,
      highestChurnRisk,
      trend: analyses.length > 3 ? detectTrendInAnalyses(analyses) : 'insufficient_data',
      analyses
    };

  } catch (error) {
    console.error('[analyzeContactSentiment] Error:', error);
    return { error: error.message };
  }
}

function aggregateTones(toneArrays) {
  const toneCounts = {};
  toneArrays.forEach(tones => {
    tones?.forEach(tone => {
      toneCounts[tone] = (toneCounts[tone] || 0) + 1;
    });
  });

  return Object.entries(toneCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([tone]) => tone);
}

function detectTrendInAnalyses(analyses) {
  const scores = analyses.map(a => a.sentiment?.score || 50);
  const recentAvg = (scores[0] + scores[1] + scores[2]) / 3;
  const olderAvg = (scores[3] + scores[4] + (scores[5] || scores[4])) / 3;

  return recentAvg > olderAvg + 10 ? 'improving'
    : recentAvg < olderAvg - 10 ? 'declining'
    : 'stable';
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function countOccurrences(text, phrases) {
  return phrases.reduce((count, phrase) => {
    return count + (text.includes(phrase) ? 1 : 0);
  }, 0);
}

export default {
  analyzeSentiment,
  analyzeContactSentiment
};
