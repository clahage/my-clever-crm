// src/services/aiCreditAnalyzer.js
// AI-Powered Credit Analysis Service
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

// FICO Score Factors (official weights)
const FICO_FACTORS = {
  paymentHistory: 0.35,
  amountsOwed: 0.30,
  lengthOfHistory: 0.15,
  creditMix: 0.10,
  newCredit: 0.10
};

/**
 * Analyze credit profile and generate comprehensive insights
 */
export async function analyzeCreditProfile(profileData) {
  const {
    currentScore,
    negativeItems,
    positiveItems,
    utilization,
    ageOfCredit,
    hardInquiries,
    publicRecords,
    collections,
    latePayments
  } = profileData;

  // Calculate health score
  const healthScore = calculateHealthScore(profileData);

  // Identify key issues
  const keyIssues = identifyKeyIssues(profileData);

  // Find strengths
  const strengths = identifyStrengths(profileData);

  // Calculate potential impact
  const estimatedImpact = calculatePotentialImpact(profileData);

  // AI-enhanced analysis
  const aiInsights = await getAIInsights(profileData, healthScore, keyIssues);

  return {
    healthScore,
    overallHealth: getHealthCategory(healthScore),
    keyIssues,
    strengths,
    riskFactors: identifyRiskFactors(profileData),
    opportunities: identifyOpportunities(profileData),
    estimatedImpact,
    complianceIssues: checkCompliance(profileData),
    recommendations: generateRecommendations(profileData, aiInsights),
    aiInsights
  };
}

/**
 * Calculate overall credit health score (0-100)
 */
function calculateHealthScore(profile) {
  let score = 100;

  // Deduct for negative items
  score -= profile.negativeItems?.length * 5 || 0;
  
  // Deduct for high utilization
  if (profile.utilization > 70) score -= 20;
  else if (profile.utilization > 50) score -= 10;
  else if (profile.utilization > 30) score -= 5;

  // Deduct for short credit history
  if (profile.ageOfCredit < 2) score -= 15;
  else if (profile.ageOfCredit < 5) score -= 8;

  // Deduct for hard inquiries
  score -= Math.min(profile.hardInquiries * 3, 15);

  // Deduct for public records
  score -= profile.publicRecords * 10 || 0;

  // Deduct for collections
  score -= profile.collections?.length * 8 || 0;

  // Deduct for late payments
  score -= profile.latePayments?.length * 6 || 0;

  // Add for positive items
  score += Math.min(profile.positiveItems?.length * 3, 15) || 0;

  return Math.max(0, Math.min(100, score));
}

function getHealthCategory(score) {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'fair';
  return 'poor';
}

function identifyKeyIssues(profile) {
  const issues = [];

  if (profile.utilization > 70) {
    issues.push('High credit utilization (>70%) - Major score drag');
  }

  if (profile.collections?.length > 0) {
    issues.push(`${profile.collections.length} collection account(s) - Significant negative impact`);
  }

  if (profile.latePayments?.length > 0) {
    issues.push(`${profile.latePayments.length} late payment(s) - Payment history factor affected`);
  }

  if (profile.publicRecords > 0) {
    issues.push(`${profile.publicRecords} public record(s) - Severe negative impact`);
  }

  if (profile.ageOfCredit < 2) {
    issues.push('Thin credit file - Need to build credit history');
  }

  if (profile.hardInquiries > 5) {
    issues.push(`${profile.hardInquiries} hard inquiries - Credit-seeking behavior concern`);
  }

  if (profile.negativeItems?.length > 10) {
    issues.push('Excessive negative items - Comprehensive cleanup needed');
  }

  return issues;
}

function identifyStrengths(profile) {
  const strengths = [];

  if (profile.utilization < 10) {
    strengths.push('Excellent credit utilization (<10%)');
  } else if (profile.utilization < 30) {
    strengths.push('Good credit utilization (<30%)');
  }

  if (profile.ageOfCredit > 10) {
    strengths.push('Strong credit history (10+ years)');
  } else if (profile.ageOfCredit > 5) {
    strengths.push('Solid credit history (5+ years)');
  }

  if (profile.positiveItems?.length > 5) {
    strengths.push(`${profile.positiveItems.length} positive accounts - Good credit mix`);
  }

  if (profile.latePayments?.length === 0) {
    strengths.push('Perfect payment history');
  }

  if (profile.hardInquiries < 2) {
    strengths.push('Minimal recent credit applications');
  }

  return strengths;
}

function identifyRiskFactors(profile) {
  const risks = [];

  if (profile.utilization > 90) {
    risks.push('Critical: Maxed out credit - Risk of score plummet');
  }

  if (profile.currentScore < 600 && profile.negativeItems?.length > 5) {
    risks.push('Multiple negative items with low score - Long recovery timeline');
  }

  if (profile.collections?.some(c => c.amount > 10000)) {
    risks.push('Large collection amount(s) - Potential lawsuit risk');
  }

  if (profile.publicRecords > 0) {
    risks.push('Public records present - May indicate financial instability');
  }

  return risks;
}

function identifyOpportunities(profile) {
  const opportunities = [];

  if (profile.utilization > 50) {
    const reduction = profile.utilization - 30;
    opportunities.push(`Pay down balances: Reduce utilization by ${reduction}% for ~${Math.round(reduction * 1.5)} point boost`);
  }

  if (profile.negativeItems?.some(item => item.age > 7)) {
    opportunities.push('Some items may be past statute of limitations - Dispute for removal');
  }

  if (profile.positiveItems?.length < 3) {
    opportunities.push('Add authorized user accounts or secured cards to build positive history');
  }

  if (profile.collections?.some(c => c.amount < 500)) {
    opportunities.push('Quick win: Pay off small collections for immediate impact');
  }

  if (profile.negativeItems?.some(item => item.type === 'inquiry' && item.age > 1)) {
    opportunities.push('Dispute old inquiries - Often successfully removed');
  }

  return opportunities;
}

function calculatePotentialImpact(profile) {
  let removingNegatives = 0;
  let improvingUtilization = 0;
  let addingPositives = 0;
  let agingAccounts = 0;

  // Removing negative items impact
  if (profile.negativeItems?.length > 0) {
    removingNegatives = Math.min(profile.negativeItems.length * 15, 120);
  }

  // Improving utilization impact
  if (profile.utilization > 30) {
    const utilizationDrop = profile.utilization - 10;
    improvingUtilization = Math.round(utilizationDrop * 0.8);
  }

  // Adding positive accounts impact
  if (profile.positiveItems?.length < 5) {
    addingPositives = (5 - profile.positiveItems?.length) * 8;
  }

  // Time-based improvements
  if (profile.ageOfCredit < 5) {
    agingAccounts = 20;
  }

  return {
    removingNegatives,
    improvingUtilization,
    addingPositives,
    agingAccounts,
    total: removingNegatives + improvingUtilization + addingPositives + agingAccounts
  };
}

function checkCompliance(profile) {
  const issues = [];

  if (profile.negativeItems?.some(item => item.age > 7)) {
    issues.push('FCRA violation: Items older than 7 years (10 for bankruptcy) should be removed');
  }

  if (profile.collections?.some(c => !c.validationReceived)) {
    issues.push('FDCPA violation: Collection without validation - Disputable');
  }

  return issues;
}

function generateRecommendations(profile, aiInsights) {
  const recs = [];

  // Priority 1: High-impact actions
  if (profile.utilization > 50) {
    recs.push({
      priority: 'high',
      action: 'Pay down credit card balances to under 30% utilization',
      impact: 'High',
      timeframe: '30-60 days',
      expectedGain: '40-60 points'
    });
  }

  if (profile.collections?.length > 0) {
    recs.push({
      priority: 'high',
      action: 'Negotiate pay-for-delete with collection agencies',
      impact: 'High',
      timeframe: '60-90 days',
      expectedGain: '30-50 points'
    });
  }

  // Priority 2: Medium-impact actions
  if (profile.negativeItems?.length > 3) {
    recs.push({
      priority: 'medium',
      action: 'Dispute inaccurate negative items with bureaus',
      impact: 'Medium-High',
      timeframe: '45-60 days',
      expectedGain: '20-40 points per removal'
    });
  }

  if (profile.ageOfCredit < 5) {
    recs.push({
      priority: 'medium',
      action: 'Become authorized user on seasoned account',
      impact: 'Medium',
      timeframe: '30 days',
      expectedGain: '15-30 points'
    });
  }

  // Priority 3: Long-term strategies
  recs.push({
    priority: 'low',
    action: 'Set up automatic payments to ensure perfect payment history',
    impact: 'Long-term',
    timeframe: 'Ongoing',
    expectedGain: '5-10 points per year'
  });

  return recs;
}

async function getAIInsights(profile, healthScore, keyIssues) {
  try {
    const prompt = `As a credit expert, provide 3 key insights for this profile:
    Score: ${profile.currentScore}
    Health: ${healthScore}/100
    Key Issues: ${keyIssues.join(', ')}
    
    Format: ["insight1", "insight2", "insight3"]`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{
        role: "system",
        content: "You are a credit repair expert. Provide concise, actionable insights."
      }, {
        role: "user",
        content: prompt
      }],
      temperature: 0.4,
      max_tokens: 300
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('AI insights error:', error);
    return [
      'Focus on high-impact items first',
      'Consistent payment history is crucial',
      'Monitor progress monthly'
    ];
  }
}

/**
 * Calculate dispute success probability for an item
 */
export function calculateDisputeSuccess(item) {
  let probability = 50; // Base probability

  // Age factor (older items easier to dispute)
  if (item.age > 5) probability += 20;
  else if (item.age > 3) probability += 10;
  else if (item.age < 1) probability -= 10;

  // Type factor
  const successRates = {
    inquiry: 70,
    collection: 60,
    latePayment: 50,
    chargeoff: 45,
    bankruptcy: 30,
    judgment: 35
  };
  probability = successRates[item.type] || probability;

  // Verification factor
  if (!item.verified) probability += 15;

  // Amount factor (smaller amounts easier)
  if (item.amount && item.amount < 500) probability += 10;
  else if (item.amount && item.amount > 5000) probability -= 5;

  // Bureau factor
  if (item.bureau === 'equifax') probability += 5; // Typically more cooperative

  return Math.max(20, Math.min(95, probability));
}

/**
 * Predict score improvement timeline
 */
export function predictScoreTimeline(currentScore, goalScore, profileData) {
  const pointsNeeded = goalScore - currentScore;
  const monthlyRate = estimateMonthlyImprovement(profileData);

  const months = Math.ceil(pointsNeeded / monthlyRate);
  
  const projections = [];
  let score = currentScore;

  for (let month = 1; month <= Math.min(months, 24); month++) {
    score += monthlyRate;
    projections.push({
      month,
      score: Math.min(score, goalScore),
      confidence: calculateConfidence(month, profileData)
    });
  }

  return {
    estimatedMonths: months,
    projections,
    achievable: months <= 24,
    monthlyRate
  };
}

function estimateMonthlyImprovement(profile) {
  let rate = 5; // Base rate

  // High utilization = quick gains when paid down
  if (profile.utilization > 70) rate += 10;
  else if (profile.utilization > 50) rate += 5;

  // Many negative items = slower progress
  if (profile.negativeItems?.length > 10) rate -= 2;

  // Good payment history = stable improvement
  if (profile.latePayments?.length === 0) rate += 3;

  return Math.max(3, rate);
}

function calculateConfidence(month, profile) {
  let confidence = 85;

  // Confidence decreases over time
  confidence -= month * 2;

  // Complex profiles = lower confidence
  if (profile.negativeItems?.length > 10) confidence -= 10;

  // Many variables = lower confidence
  if (profile.publicRecords > 0) confidence -= 15;

  return Math.max(40, confidence);
}

/**
 * Generate personalized action plan
 */
export async function generateActionPlan(analysisData, goalScore, timeframe) {
  const phases = [];
  let currentPhase = 1;
  let cumulativeScore = analysisData.currentScore || 0;

  // Phase 1: Quick Wins (0-30 days)
  const quickWins = {
    phase: currentPhase++,
    name: 'Quick Wins & Foundation',
    duration: '0-30 days',
    goals: [
      'Address high-impact items',
      'Establish positive habits',
      'Set up monitoring'
    ],
    actions: []
  };

  if (analysisData.utilization > 50) {
    quickWins.actions.push({
      action: 'Pay down high utilization accounts to 30% or below',
      priority: 'high',
      impact: 40,
      effort: 'high',
      timeline: '30 days',
      steps: [
        'List all credit cards with balances',
        'Calculate 30% of each limit',
        'Pay down highest utilization cards first',
        'Set up automatic payments'
      ]
    });
    cumulativeScore += 40;
  }

  quickWins.expectedScoreChange = cumulativeScore - (analysisData.currentScore || 0);
  phases.push(quickWins);

  // Phase 2: Dispute & Verify (30-90 days)
  const disputes = {
    phase: currentPhase++,
    name: 'Dispute & Verification Phase',
    duration: '30-90 days',
    goals: [
      'Remove inaccurate items',
      'Challenge questionable entries',
      'Verify debt validity'
    ],
    actions: [
      {
        action: 'Dispute all inaccurate or unverifiable negative items',
        priority: 'high',
        impact: 60,
        effort: 'medium',
        timeline: '45-60 days',
        steps: [
          'Pull all three credit reports',
          'Identify inaccurate items',
          'Send dispute letters (certified mail)',
          'Track bureau responses',
          'Follow up on incomplete responses'
        ]
      }
    ],
    expectedScoreChange: 60
  };
  cumulativeScore += 60;
  phases.push(disputes);

  // Phase 3: Optimization (90-180 days)
  const optimization = {
    phase: currentPhase++,
    name: 'Credit Optimization',
    duration: '90-180 days',
    goals: [
      'Build positive history',
      'Optimize credit mix',
      'Strategic account management'
    ],
    actions: [
      {
        action: 'Add 2-3 positive tradelines',
        priority: 'medium',
        impact: 30,
        effort: 'low',
        timeline: '90-120 days',
        steps: [
          'Apply for secured credit card or credit builder loan',
          'Become authorized user on seasoned account',
          'Use new accounts responsibly (low utilization)'
        ]
      }
    ],
    expectedScoreChange: 30
  };
  phases.push(optimization);

  return {
    phases,
    quickWins: [
      'Pay down high balances immediately',
      'Dispute obvious errors',
      'Set up payment automation'
    ],
    longTermStrategies: [
      'Maintain payment history',
      'Keep utilization under 10%',
      'Age accounts responsibly',
      'Diversify credit types'
    ],
    avoidActions: [
      'Closing old accounts',
      'Applying for too much new credit',
      'Paying collection agencies without negotiation',
      'Missing any payments during repair process'
    ],
    milestones: generateMilestones(analysisData.currentScore || 0, goalScore, phases)
  };
}

function generateMilestones(currentScore, goalScore, phases) {
  const milestones = [];
  let week = 0;
  let score = currentScore;

  phases.forEach(phase => {
    const weeksInPhase = Math.ceil((parseInt(phase.duration.split('-')[1]) || 30) / 7);
    week += weeksInPhase;
    score += phase.expectedScoreChange;

    milestones.push({
      week,
      milestone: `Complete ${phase.name}`,
      expectedScore: Math.min(score, goalScore)
    });
  });

  return milestones;
}

export default {
  analyzeCreditProfile,
  calculateDisputeSuccess,
  predictScoreTimeline,
  generateActionPlan
};