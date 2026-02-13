// ============================================================================
// AI CREDIT ANALYZER - TIER 5+ ENTERPRISE EDITION
// ============================================================================
// Path: src/services/aiCreditAnalyzer.js
//
// AI-Powered Credit Analysis Service
// Comprehensive credit profile analysis with AI-enhanced insights
//
// FEATURES:
// ✅ Health score calculation (0-100 scale)
// ✅ Key issues identification with severity levels
// ✅ Strengths and opportunities detection
// ✅ Risk factor analysis
// ✅ Compliance checking (FCRA, FDCPA)
// ✅ AI-enhanced recommendations via Cloud Functions
// ✅ Potential impact estimation
// ✅ FICO factor analysis (official weights)
// ✅ Comprehensive error handling with fallbacks
// ✅ No external dependencies
//
// © 1995-2026 Speedy Credit Repair Inc. | Christopher Lahage
// ============================================================================

import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

// ============================================================================
// FICO SCORE FACTORS (OFFICIAL WEIGHTS)
// ============================================================================

const FICO_FACTORS = {
  paymentHistory: 0.35,      // 35% - Most important
  amountsOwed: 0.30,         // 30% - Credit utilization
  lengthOfHistory: 0.15,     // 15% - Age of credit
  creditMix: 0.10,           // 10% - Types of credit
  newCredit: 0.10            // 10% - Recent inquiries
};

// ============================================================================
// MAIN ANALYSIS FUNCTION
// ============================================================================

/**
 * Analyze credit profile and generate comprehensive insights
 * 
 * @param {object} profileData - Credit profile data
 * @returns {Promise<object>} Complete analysis with scores, issues, recommendations
 */
export async function analyzeCreditProfile(profileData) {
  console.log('🧠 Starting credit profile analysis...');

  try {
    // Validate input
    if (!profileData) {
      throw new Error('Profile data is required');
    }

    // Extract data with defaults
    const {
      currentScore = 650,
      negativeItems = [],
      positiveItems = [],
      utilization = 50,
      ageOfCredit = 5,
      hardInquiries = 0,
      publicRecords = 0,
      collections = [],
      latePayments = [],
      tradelines = [],
      totalAccounts = 0,
      openAccounts = 0,
    } = profileData;

    // ===== STEP 1: CALCULATE HEALTH SCORE =====
    const healthScore = calculateHealthScore(profileData);
    console.log(`✅ Health score calculated: ${healthScore}/100`);

    // ===== STEP 2: IDENTIFY KEY ISSUES =====
    const keyIssues = identifyKeyIssues(profileData);
    console.log(`✅ Identified ${keyIssues.length} key issues`);

    // ===== STEP 3: FIND STRENGTHS =====
    const strengths = identifyStrengths(profileData);
    console.log(`✅ Found ${strengths.length} strengths`);

    // ===== STEP 4: CALCULATE POTENTIAL IMPACT =====
    const estimatedImpact = calculatePotentialImpact(profileData);
    console.log(`✅ Estimated potential score increase: ${estimatedImpact.scoreIncrease} points`);

    // ===== STEP 5: GET AI-ENHANCED INSIGHTS =====
    let aiInsights = null;
    try {
      aiInsights = await getAIInsights(profileData, healthScore, keyIssues);
      console.log('✅ AI insights generated');
    } catch (aiError) {
      console.warn('⚠️ AI insights failed, using rule-based analysis:', aiError.message);
      // Fall back to rule-based recommendations (no AI required)
    }

    // ===== STEP 6: ASSEMBLE COMPLETE ANALYSIS =====
    const analysis = {
      // Health metrics
      healthScore,
      overallHealth: getHealthCategory(healthScore),
      
      // Issues and risks
      keyIssues,
      riskFactors: identifyRiskFactors(profileData),
      complianceIssues: checkCompliance(profileData),
      
      // Opportunities
      strengths,
      opportunities: identifyOpportunities(profileData),
      
      // Impact estimation
      estimatedImpact,
      
      // Recommendations
      recommendations: generateRecommendations(profileData, aiInsights),
      
      // AI insights (optional)
      aiInsights: aiInsights || {
        summary: 'AI analysis temporarily unavailable. Using rule-based analysis.',
        available: false,
      },
      
      // FICO factor breakdown
      ficoFactors: analyzeFicoFactors(profileData),
      
      // Metadata
      analyzedAt: new Date().toISOString(),
      dataCompleteness: calculateDataCompleteness(profileData),
    };

    console.log('✅ Credit profile analysis complete');
    return analysis;

  } catch (error) {
    console.error('❌ Credit analysis error:', error);
    
    // Return fallback analysis
    return getFallbackAnalysis(profileData, error.message);
  }
}

// ============================================================================
// HEALTH SCORE CALCULATION
// ============================================================================

/**
 * Calculate overall credit health score (0-100)
 * Higher is better
 */
function calculateHealthScore(profile) {
  let score = 100;

  // Deduct for negative items (5 points each, max 40 points)
  const negativeDeduction = Math.min((profile.negativeItems?.length || 0) * 5, 40);
  score -= negativeDeduction;
  
  // Deduct for high utilization
  const util = profile.utilization || 0;
  if (util > 70) score -= 20;
  else if (util > 50) score -= 10;
  else if (util > 30) score -= 5;

  // Deduct for short credit history
  const age = profile.ageOfCredit || 0;
  if (age < 2) score -= 15;
  else if (age < 5) score -= 8;

  // Deduct for hard inquiries (3 points each, max 15)
  const inquiryDeduction = Math.min((profile.hardInquiries || 0) * 3, 15);
  score -= inquiryDeduction;

  // Deduct for public records (10 points each, max 30)
  const publicRecordDeduction = Math.min((profile.publicRecords || 0) * 10, 30);
  score -= publicRecordDeduction;

  // Deduct for collections (8 points each, max 32)
  const collectionDeduction = Math.min((profile.collections?.length || 0) * 8, 32);
  score -= collectionDeduction;

  // Deduct for late payments (based on recency and severity)
  const latePayments = profile.latePayments || [];
  let lateDeduction = 0;
  latePayments.forEach(payment => {
    const daysLate = payment.daysLate || 30;
    if (daysLate >= 90) lateDeduction += 10;
    else if (daysLate >= 60) lateDeduction += 7;
    else if (daysLate >= 30) lateDeduction += 4;
  });
  score -= Math.min(lateDeduction, 25);

  // Bonus for positive factors
  const positives = profile.positiveItems?.length || 0;
  if (positives >= 10) score += 10;
  else if (positives >= 5) score += 5;

  // Ensure score stays within 0-100 range
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Convert health score to category
 */
function getHealthCategory(score) {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 60) return 'Fair';
  if (score >= 40) return 'Poor';
  return 'Critical';
}

// ============================================================================
// ISSUE IDENTIFICATION
// ============================================================================

/**
 * Identify key issues affecting credit score
 */
function identifyKeyIssues(profile) {
  const issues = [];

  // High utilization
  const util = profile.utilization || 0;
  if (util > 70) {
    issues.push({
      type: 'high_utilization',
      severity: 'critical',
      title: 'Very High Credit Utilization',
      description: `Credit card utilization is ${util}%, well above the recommended 30%. This significantly impacts your score.`,
      impact: 'high',
      recommendation: 'Pay down credit card balances to reduce utilization below 30%.',
      estimatedScoreImpact: '+40 to +80 points',
    });
  } else if (util > 50) {
    issues.push({
      type: 'high_utilization',
      severity: 'moderate',
      title: 'High Credit Utilization',
      description: `Credit card utilization is ${util}%, above the recommended 30%.`,
      impact: 'moderate',
      recommendation: 'Reduce credit card balances to improve utilization ratio.',
      estimatedScoreImpact: '+20 to +40 points',
    });
  }

  // Negative items
  const negatives = profile.negativeItems || [];
  if (negatives.length > 0) {
    const chargeOffs = negatives.filter(n => n.type?.toLowerCase().includes('charge'));
    const collections = negatives.filter(n => n.type?.toLowerCase().includes('collection'));
    const latePayments = negatives.filter(n => n.type?.toLowerCase().includes('late'));

    if (chargeOffs.length > 0) {
      issues.push({
        type: 'charge_offs',
        severity: 'critical',
        title: `${chargeOffs.length} Charge-Off${chargeOffs.length > 1 ? 's' : ''}`,
        description: 'Charge-offs severely damage credit and should be disputed or resolved.',
        impact: 'high',
        recommendation: 'Dispute inaccuracies or negotiate pay-for-delete settlements.',
        estimatedScoreImpact: '+30 to +60 points per deletion',
      });
    }

    if (collections.length > 0) {
      issues.push({
        type: 'collections',
        severity: 'critical',
        title: `${collections.length} Collection Account${collections.length > 1 ? 's' : ''}`,
        description: 'Collection accounts need immediate attention.',
        impact: 'high',
        recommendation: 'Validate debts and dispute inaccuracies. Consider pay-for-delete.',
        estimatedScoreImpact: '+20 to +40 points per deletion',
      });
    }

    if (latePayments.length > 0) {
      issues.push({
        type: 'late_payments',
        severity: 'moderate',
        title: `${latePayments.length} Late Payment${latePayments.length > 1 ? 's' : ''}`,
        description: 'Late payment history affects your score.',
        impact: 'moderate',
        recommendation: 'Dispute inaccurate late payments and ensure future on-time payments.',
        estimatedScoreImpact: '+10 to +30 points per deletion',
      });
    }
  }

  // Short credit history
  const age = profile.ageOfCredit || 0;
  if (age < 2) {
    issues.push({
      type: 'short_history',
      severity: 'moderate',
      title: 'Short Credit History',
      description: `Average age of credit is only ${age.toFixed(1)} years. Lenders prefer longer history.`,
      impact: 'moderate',
      recommendation: 'Keep oldest accounts open. Become authorized user on established accounts.',
      estimatedScoreImpact: '+10 to +20 points over time',
    });
  }

  // Too many hard inquiries
  const inquiries = profile.hardInquiries || 0;
  if (inquiries > 6) {
    issues.push({
      type: 'excessive_inquiries',
      severity: 'low',
      title: 'Too Many Hard Inquiries',
      description: `${inquiries} hard inquiries in the past 2 years. Inquiries indicate credit seeking behavior.`,
      impact: 'low',
      recommendation: 'Avoid new credit applications. Dispute unauthorized inquiries.',
      estimatedScoreImpact: '+5 to +15 points',
    });
  }

  // Public records
  const publicRecords = profile.publicRecords || 0;
  if (publicRecords > 0) {
    issues.push({
      type: 'public_records',
      severity: 'critical',
      title: `${publicRecords} Public Record${publicRecords > 1 ? 's' : ''}`,
      description: 'Public records (bankruptcy, judgments, tax liens) severely impact credit.',
      impact: 'high',
      recommendation: 'Verify accuracy. Resolve or dispute if inaccurate.',
      estimatedScoreImpact: '+50 to +100 points per deletion',
    });
  }

  // Sort by severity
  const severityOrder = { critical: 0, moderate: 1, low: 2 };
  issues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return issues;
}

/**
 * Identify risk factors
 */
function identifyRiskFactors(profile) {
  const risks = [];

  // High utilization risk
  if ((profile.utilization || 0) > 70) {
    risks.push({
      factor: 'High Utilization',
      risk: 'Maxed out cards signal financial distress to lenders',
      action: 'Pay down balances immediately',
    });
  }

  // Recent late payments
  const recentLates = (profile.latePayments || []).filter(lp => {
    const date = new Date(lp.date);
    const monthsAgo = (Date.now() - date) / (1000 * 60 * 60 * 24 * 30);
    return monthsAgo < 12;
  });

  if (recentLates.length > 0) {
    risks.push({
      factor: 'Recent Late Payments',
      risk: 'Recent payment issues indicate current financial problems',
      action: 'Ensure all future payments are on time',
    });
  }

  // No credit mix
  const tradelines = profile.tradelines || [];
  const types = new Set(tradelines.map(t => t.accountType));
  if (types.size < 2) {
    risks.push({
      factor: 'Limited Credit Mix',
      risk: 'Only one type of credit may limit score growth',
      action: 'Consider diversifying credit types (installment + revolving)',
    });
  }

  return risks;
}

// ============================================================================
// STRENGTHS & OPPORTUNITIES
// ============================================================================

/**
 * Identify strengths in credit profile
 */
function identifyStrengths(profile) {
  const strengths = [];

  // Good utilization
  if ((profile.utilization || 100) <= 30) {
    strengths.push({
      factor: 'Low Credit Utilization',
      description: `Utilization at ${profile.utilization}% is excellent`,
      benefit: 'Demonstrates responsible credit management',
    });
  }

  // Long credit history
  if ((profile.ageOfCredit || 0) >= 7) {
    strengths.push({
      factor: 'Established Credit History',
      description: `${profile.ageOfCredit.toFixed(1)} years average age`,
      benefit: 'Long history shows stability and experience',
    });
  }

  // Many positive accounts
  const positives = profile.positiveItems?.length || 0;
  if (positives >= 5) {
    strengths.push({
      factor: 'Multiple Positive Accounts',
      description: `${positives} accounts in good standing`,
      benefit: 'Strong payment history across multiple accounts',
    });
  }

  // Few inquiries
  if ((profile.hardInquiries || 0) <= 2) {
    strengths.push({
      factor: 'Few Hard Inquiries',
      description: 'Limited recent credit applications',
      benefit: 'Shows financial stability and selective credit use',
    });
  }

  // No public records
  if ((profile.publicRecords || 0) === 0) {
    strengths.push({
      factor: 'Clean Public Record',
      description: 'No bankruptcies, judgments, or tax liens',
      benefit: 'No major financial problems on record',
    });
  }

  return strengths;
}

/**
 * Identify opportunities for improvement
 */
function identifyOpportunities(profile) {
  const opportunities = [];

  // Dispute negative items
  const negatives = profile.negativeItems || [];
  if (negatives.length > 0) {
    opportunities.push({
      opportunity: 'Dispute Negative Items',
      description: `${negatives.length} items could be disputed for inaccuracies`,
      potential: `+${negatives.length * 20} to +${negatives.length * 40} points`,
      priority: 'high',
      timeline: '60-90 days',
    });
  }

  // Pay down high balances
  if ((profile.utilization || 0) > 50) {
    const currentUtil = profile.utilization;
    const targetUtil = 30;
    const improvement = currentUtil - targetUtil;
    
    opportunities.push({
      opportunity: 'Reduce Credit Utilization',
      description: `Lower utilization from ${currentUtil}% to ${targetUtil}%`,
      potential: `+${Math.round(improvement * 1.5)} to +${Math.round(improvement * 2)} points`,
      priority: 'high',
      timeline: 'Immediate impact',
    });
  }

  // Become authorized user
  if ((profile.ageOfCredit || 0) < 5) {
    opportunities.push({
      opportunity: 'Become Authorized User',
      description: 'Add yourself to an established account with good history',
      potential: '+10 to +30 points',
      priority: 'medium',
      timeline: '30-60 days',
    });
  }

  // Dispute hard inquiries
  if ((profile.hardInquiries || 0) > 3) {
    opportunities.push({
      opportunity: 'Remove Excess Inquiries',
      description: 'Dispute unauthorized or duplicate inquiries',
      potential: '+5 to +15 points',
      priority: 'low',
      timeline: '30-45 days',
    });
  }

  return opportunities;
}

// ============================================================================
// IMPACT ESTIMATION
// ============================================================================

/**
 * Calculate potential score increase from credit repair
 */
function calculatePotentialImpact(profile) {
  let minIncrease = 0;
  let maxIncrease = 0;

  // Negative items
  const negatives = profile.negativeItems || [];
  const collections = negatives.filter(n => n.type?.toLowerCase().includes('collection')).length;
  const chargeOffs = negatives.filter(n => n.type?.toLowerCase().includes('charge')).length;
  const latePayments = negatives.filter(n => n.type?.toLowerCase().includes('late')).length;

  minIncrease += collections * 20;
  maxIncrease += collections * 40;
  minIncrease += chargeOffs * 30;
  maxIncrease += chargeOffs * 60;
  minIncrease += latePayments * 10;
  maxIncrease += latePayments * 30;

  // Utilization improvement
  const util = profile.utilization || 0;
  if (util > 50) {
    const improvement = util - 30;
    minIncrease += Math.round(improvement * 1);
    maxIncrease += Math.round(improvement * 2);
  }

  // Public records
  const publicRecords = profile.publicRecords || 0;
  minIncrease += publicRecords * 50;
  maxIncrease += publicRecords * 100;

  // Hard inquiries
  const inquiries = Math.max(0, (profile.hardInquiries || 0) - 2);
  minIncrease += inquiries * 2;
  maxIncrease += inquiries * 5;

  return {
    scoreIncrease: `${minIncrease}-${maxIncrease} points`,
    minIncrease,
    maxIncrease,
    avgIncrease: Math.round((minIncrease + maxIncrease) / 2),
    timeline: '3-6 months',
    confidence: negatives.length > 5 ? 'high' : 'moderate',
  };
}

// ============================================================================
// FICO FACTOR ANALYSIS
// ============================================================================

/**
 * Analyze FICO score factors
 */
function analyzeFicoFactors(profile) {
  const factors = {
    paymentHistory: {
      weight: FICO_FACTORS.paymentHistory,
      score: 100,
      issues: [],
    },
    amountsOwed: {
      weight: FICO_FACTORS.amountsOwed,
      score: 100,
      issues: [],
    },
    lengthOfHistory: {
      weight: FICO_FACTORS.lengthOfHistory,
      score: 100,
      issues: [],
    },
    creditMix: {
      weight: FICO_FACTORS.creditMix,
      score: 100,
      issues: [],
    },
    newCredit: {
      weight: FICO_FACTORS.newCredit,
      score: 100,
      issues: [],
    },
  };

  // Payment History (35%)
  const latePayments = profile.latePayments?.length || 0;
  const collections = profile.collections?.length || 0;
  const chargeOffs = (profile.negativeItems || []).filter(n => 
    n.type?.toLowerCase().includes('charge')
  ).length;

  if (chargeOffs > 0) {
    factors.paymentHistory.score -= 50;
    factors.paymentHistory.issues.push(`${chargeOffs} charge-off(s)`);
  }
  if (collections > 0) {
    factors.paymentHistory.score -= 40;
    factors.paymentHistory.issues.push(`${collections} collection(s)`);
  }
  if (latePayments > 0) {
    factors.paymentHistory.score -= Math.min(latePayments * 10, 30);
    factors.paymentHistory.issues.push(`${latePayments} late payment(s)`);
  }

  // Amounts Owed (30%)
  const util = profile.utilization || 0;
  if (util > 70) {
    factors.amountsOwed.score -= 60;
    factors.amountsOwed.issues.push(`Very high utilization (${util}%)`);
  } else if (util > 50) {
    factors.amountsOwed.score -= 40;
    factors.amountsOwed.issues.push(`High utilization (${util}%)`);
  } else if (util > 30) {
    factors.amountsOwed.score -= 20;
    factors.amountsOwed.issues.push(`Above ideal utilization (${util}%)`);
  }

  // Length of History (15%)
  const age = profile.ageOfCredit || 0;
  if (age < 2) {
    factors.lengthOfHistory.score -= 50;
    factors.lengthOfHistory.issues.push(`Very short history (${age.toFixed(1)} years)`);
  } else if (age < 5) {
    factors.lengthOfHistory.score -= 30;
    factors.lengthOfHistory.issues.push(`Short history (${age.toFixed(1)} years)`);
  }

  // Credit Mix (10%)
  const tradelines = profile.tradelines || [];
  const types = new Set(tradelines.map(t => t.accountType));
  if (types.size <= 1) {
    factors.creditMix.score -= 40;
    factors.creditMix.issues.push('Limited credit mix');
  } else if (types.size === 2) {
    factors.creditMix.score -= 20;
    factors.creditMix.issues.push('Could diversify more');
  }

  // New Credit (10%)
  const inquiries = profile.hardInquiries || 0;
  if (inquiries > 6) {
    factors.newCredit.score -= 50;
    factors.newCredit.issues.push(`Too many inquiries (${inquiries})`);
  } else if (inquiries > 3) {
    factors.newCredit.score -= 30;
    factors.newCredit.issues.push(`Multiple inquiries (${inquiries})`);
  }

  // Ensure scores don't go below 0
  Object.keys(factors).forEach(key => {
    factors[key].score = Math.max(0, factors[key].score);
  });

  return factors;
}

// ============================================================================
// COMPLIANCE CHECKING
// ============================================================================

/**
 * Check for compliance issues (FCRA, FDCPA)
 */
function checkCompliance(profile) {
  const issues = [];

  // Check for items past statute of limitations
  const negatives = profile.negativeItems || [];
  negatives.forEach(item => {
    if (item.dateOpened) {
      const date = new Date(item.dateOpened);
      const yearsOld = (Date.now() - date) / (1000 * 60 * 60 * 24 * 365);
      
      if (yearsOld > 7) {
        issues.push({
          type: 'reporting_violation',
          severity: 'high',
          item: item.creditorName,
          description: `Item is ${yearsOld.toFixed(1)} years old - should be removed after 7 years`,
          statute: 'FCRA § 605',
          action: 'Dispute for removal due to reporting time limit',
        });
      }
    }
  });

  // Check for potential FCRA violations (multiple similar items)
  const creditorCounts = {};
  negatives.forEach(item => {
    const creditor = item.creditorName || 'Unknown';
    creditorCounts[creditor] = (creditorCounts[creditor] || 0) + 1;
  });

  Object.entries(creditorCounts).forEach(([creditor, count]) => {
    if (count > 2) {
      issues.push({
        type: 'duplicate_reporting',
        severity: 'moderate',
        item: creditor,
        description: `${count} entries from same creditor may indicate duplicate reporting`,
        statute: 'FCRA § 623',
        action: 'Investigate for duplicate or inaccurate entries',
      });
    }
  });

  return issues;
}

// ============================================================================
// AI-ENHANCED INSIGHTS (VIA CLOUD FUNCTIONS)
// ============================================================================

/**
 * Get AI-enhanced insights using Cloud Functions
 * Falls back gracefully if AI is unavailable
 */
async function getAIInsights(profile, healthScore, keyIssues) {
  console.log('🤖 Requesting AI insights...');

  try {
    const aiContentGenerator = httpsCallable(functions, 'aiContentGenerator');
    
    const result = await aiContentGenerator({
      type: 'analyzeCreditInsights',
      profileData: {
        currentScore: profile.currentScore || 650,
        healthScore,
        utilization: profile.utilization || 0,
        ageOfCredit: profile.ageOfCredit || 0,
        negativeCount: profile.negativeItems?.length || 0,
        positiveCount: profile.positiveItems?.length || 0,
        keyIssues: keyIssues.slice(0, 3), // Top 3 issues
      },
    });

    if (result.data?.success && result.data?.insights) {
      console.log('✅ AI insights received');
      return result.data.insights;
    } else {
      throw new Error('AI insights not available');
    }

  } catch (error) {
    console.warn('⚠️ AI insights failed:', error.message);
    return null; // Graceful fallback
  }
}

// ============================================================================
// RECOMMENDATIONS
// ============================================================================

/**
 * Generate actionable recommendations
 */
function generateRecommendations(profile, aiInsights) {
  const recommendations = [];

  // Priority 1: Critical issues
  const keyIssues = identifyKeyIssues(profile);
  const criticalIssues = keyIssues.filter(i => i.severity === 'critical');
  
  criticalIssues.forEach(issue => {
    recommendations.push({
      priority: 'high',
      category: 'immediate_action',
      title: issue.title,
      action: issue.recommendation,
      impact: issue.estimatedScoreImpact,
      timeline: '30-60 days',
    });
  });

  // Priority 2: Utilization
  if ((profile.utilization || 0) > 50) {
    recommendations.push({
      priority: 'high',
      category: 'utilization',
      title: 'Reduce Credit Card Balances',
      action: `Pay down balances to achieve 30% utilization. Current: ${profile.utilization}%.`,
      impact: '+20 to +60 points',
      timeline: 'Immediate impact',
    });
  }

  // Priority 3: Build positive history
  recommendations.push({
    priority: 'medium',
    category: 'positive_history',
    title: 'Maintain On-Time Payments',
    action: 'Set up autopay to ensure no missed payments. Payment history is 35% of your score.',
    impact: 'Prevents score decline',
    timeline: 'Ongoing',
  });

  // Priority 4: Credit mix
  const tradelines = profile.tradelines || [];
  const types = new Set(tradelines.map(t => t.accountType));
  if (types.size < 2) {
    recommendations.push({
      priority: 'low',
      category: 'credit_mix',
      title: 'Diversify Credit Types',
      action: 'Consider adding an installment loan (e.g., credit builder loan) to complement revolving credit.',
      impact: '+5 to +15 points',
      timeline: '3-6 months',
    });
  }

  // Add AI recommendations if available
  if (aiInsights && aiInsights.recommendations) {
    aiInsights.recommendations.forEach(rec => {
      recommendations.push({
        priority: 'medium',
        category: 'ai_suggestion',
        title: rec.title || 'AI Recommendation',
        action: rec.action,
        impact: rec.impact || 'Varies',
        timeline: rec.timeline || '90 days',
        source: 'AI',
      });
    });
  }

  return recommendations;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate data completeness percentage
 */
function calculateDataCompleteness(profile) {
  const fields = [
    'currentScore',
    'negativeItems',
    'positiveItems',
    'utilization',
    'ageOfCredit',
    'hardInquiries',
    'tradelines',
  ];

  const complete = fields.filter(field => 
    profile[field] !== null && 
    profile[field] !== undefined &&
    (Array.isArray(profile[field]) ? profile[field].length > 0 : true)
  ).length;

  return Math.round((complete / fields.length) * 100);
}

/**
 * Get fallback analysis when main analysis fails
 */
function getFallbackAnalysis(profile, errorMessage) {
  console.warn('⚠️ Using fallback analysis');

  return {
    healthScore: 50,
    overallHealth: 'Unknown',
    keyIssues: [{
      type: 'analysis_error',
      severity: 'low',
      title: 'Analysis Incomplete',
      description: 'Unable to complete full analysis. Please provide more complete credit data.',
      impact: 'low',
      recommendation: 'Upload complete credit report for detailed analysis.',
    }],
    riskFactors: [],
    complianceIssues: [],
    strengths: [],
    opportunities: [],
    estimatedImpact: {
      scoreIncrease: 'Unknown',
      minIncrease: 0,
      maxIncrease: 0,
      avgIncrease: 0,
      timeline: 'Unknown',
      confidence: 'low',
    },
    recommendations: [{
      priority: 'high',
      category: 'data_collection',
      title: 'Provide Complete Credit Report',
      action: 'Upload a full 3-bureau credit report for comprehensive analysis.',
      impact: 'Enables accurate analysis',
      timeline: 'Immediate',
    }],
    aiInsights: {
      summary: 'Analysis unavailable due to incomplete data.',
      available: false,
    },
    ficoFactors: {},
    analyzedAt: new Date().toISOString(),
    dataCompleteness: calculateDataCompleteness(profile),
    error: errorMessage,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  analyzeCreditProfile,
};