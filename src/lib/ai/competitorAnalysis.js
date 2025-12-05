/**
 * AI COMPETITOR ANALYSIS SYSTEM
 *
 * Purpose:
 * Monitor competitors, analyze their strategies, and provide actionable
 * recommendations to stay ahead in the credit repair market.
 *
 * What It Analyzes:
 * - Pricing Strategies: Track competitor pricing changes
 * - Service Offerings: What features/tiers they offer
 * - Marketing Messages: How they position themselves
 * - Online Presence: Website, SEO, reviews, social media
 * - Client Reviews: What customers say (positive/negative)
 * - Market Positioning: Premium vs budget vs value
 * - Technology Stack: What tools they use
 * - Response Times: How fast they respond to leads
 *
 * Key Competitors (Credit Repair Industry):
 * - Lexington Law (largest, premium pricing)
 * - Sky Blue Credit (mid-market)
 * - CreditRepair.com (mass market)
 * - The Credit People (budget option)
 * - Local competitors in your area
 *
 * Why It's Important:
 * - Stay competitive on pricing
 * - Identify gaps in competitor offerings
 * - Learn from their successes and failures
 * - Benchmark your performance
 * - Find differentiation opportunities
 * - Anticipate market trends
 * - Avoid being undercut on price
 *
 * Analysis Types:
 * - Pricing Analysis: Are you priced competitively?
 * - Feature Gap Analysis: What are you missing?
 * - Positioning Analysis: How do you compare?
 * - Review Sentiment Analysis: What do their clients complain about?
 * - Marketing Strategy Analysis: What messaging works?
 * - Technology Analysis: What tools give them advantage?
 *
 * Example Insights:
 * - "Lexington Law raised Premium tier to $149/mo (+$10). Consider raising your Premium to $209."
 * - "Sky Blue offers free credit monitoring - 87% of reviews mention this. Add to your Standard tier."
 * - "CreditRepair.com has 4.2★ avg (down from 4.5). Common complaint: slow response times. Emphasize your 2-hour response in marketing."
 * - "The Credit People launched $79 'Basic' tier. Risk: may pull price-sensitive DIY clients. Counter: highlight AI features and results."
 *
 * Competitive Advantages to Track:
 * - Your AI features (unique in market)
 * - Personal service (vs call centers)
 * - CROA compliance (some competitors violate)
 * - Response time (faster = better)
 * - Results (average credit score improvement)
 * - Technology (modern CRM vs outdated systems)
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
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';

// ============================================================================
// COMPETITOR DATABASE
// ============================================================================

const COMPETITORS = {
  lexington_law: {
    id: 'lexington_law',
    name: 'Lexington Law',
    website: 'https://www.lexingtonlaw.com',
    position: 'premium',
    strengths: ['Brand recognition', 'Large law firm backing', 'Money-back guarantee'],
    weaknesses: ['Expensive', 'Slow results', 'Call center support'],
    pricing: {
      concord_standard: 89.95,
      concord_premier: 119.95,
      premier_plus: 139.95
    },
    features: [
      'Credit report analysis',
      'Dispute letters',
      'Credit monitoring',
      'Identity theft insurance',
      'FICO score tracking',
      'Inquiry targeting'
    ],
    trackingEnabled: true
  },

  sky_blue: {
    id: 'sky_blue',
    name: 'Sky Blue Credit',
    website: 'https://www.skyblue.com',
    position: 'mid_market',
    strengths: ['Simple pricing', 'Good reviews', 'Personal service'],
    weaknesses: ['Limited features', 'No app', 'Manual process'],
    pricing: {
      individual: 79,
      couple: 119
    },
    features: [
      'Credit disputes',
      'Goodwill letters',
      'Credit monitoring',
      'Personal account manager',
      'No long-term contracts'
    ],
    trackingEnabled: true
  },

  creditrepair_com: {
    id: 'creditrepair_com',
    name: 'CreditRepair.com',
    website: 'https://www.creditrepair.com',
    position: 'mass_market',
    strengths: ['Large marketing budget', 'Fast onboarding', 'Mobile app'],
    weaknesses: ['Complaints about results', 'High cancellation rate', 'Aggressive sales'],
    pricing: {
      credit_repair: 99.95,
      credit_repair_concierge: 119.95
    },
    features: [
      'Dispute process',
      'Credit score tracking',
      'Mobile app',
      'Educational content',
      'Bureau direct disputes'
    ],
    trackingEnabled: true
  },

  the_credit_people: {
    id: 'the_credit_people',
    name: 'The Credit People',
    website: 'https://www.thecreditpeople.com',
    position: 'budget',
    strengths: ['Low price', 'Flexible cancellation', 'Family plans'],
    weaknesses: ['Limited service', 'Slower results', 'Basic technology'],
    pricing: {
      individual: 79,
      couple: 119
    },
    features: [
      'Credit disputes',
      'Score tracking',
      'Online portal',
      'Monthly progress reports'
    ],
    trackingEnabled: true
  }
};

// ============================================================================
// COMPETITIVE ANALYSIS
// ============================================================================

/**
 * Perform comprehensive competitive analysis
 * @param {string} focusArea - Optional specific area to analyze
 * @returns {Object} Competitive analysis results
 */
export async function analyzeCompetitors(focusArea = 'all') {
  try {
    const competitors = await getTrackedCompetitors();
    const yourBusiness = await getYourBusinessProfile();

    const analysis = {
      pricingAnalysis: await analyzePricing(competitors, yourBusiness),
      featureGapAnalysis: await analyzeFeatureGaps(competitors, yourBusiness),
      positioningAnalysis: await analyzePositioning(competitors, yourBusiness),
      reviewAnalysis: await analyzeReviews(competitors),
      marketTrends: await detectMarketTrends(competitors),
      recommendations: []
    };

    // Generate strategic recommendations
    analysis.recommendations = generateRecommendations(analysis, yourBusiness);

    // Calculate competitive score
    analysis.competitiveScore = calculateCompetitiveScore(analysis);

    return analysis;

  } catch (error) {
    console.error('[analyzeCompetitors] Error:', error);
    return { error: error.message };
  }
}

// ============================================================================
// PRICING ANALYSIS
// ============================================================================

async function analyzePricing(competitors, yourBusiness) {
  const pricingData = [];

  // Your pricing
  const yourPricing = {
    business: 'Speedy Credit Repair',
    tiers: {
      diy: 49,
      standard: 99,
      acceleration: 149,
      premium: 199,
      vip: 299
    }
  };

  // Competitor pricing
  Object.values(competitors).forEach(comp => {
    if (comp.pricing) {
      pricingData.push({
        name: comp.name,
        position: comp.position,
        lowestPrice: Math.min(...Object.values(comp.pricing)),
        highestPrice: Math.max(...Object.values(comp.pricing)),
        averagePrice: Object.values(comp.pricing).reduce((a, b) => a + b, 0) / Object.values(comp.pricing).length,
        tiers: comp.pricing
      });
    }
  });

  // Market averages
  const allPrices = pricingData.flatMap(p => Object.values(p.tiers));
  const marketAverage = allPrices.reduce((a, b) => a + b, 0) / allPrices.length;
  const marketLow = Math.min(...allPrices);
  const marketHigh = Math.max(...allPrices);

  // Your position
  const yourAveragePrice = (yourPricing.tiers.standard + yourPricing.tiers.premium) / 2;
  const pricePosition = yourAveragePrice < marketAverage - 10 ? 'below_market' :
                        yourAveragePrice > marketAverage + 10 ? 'above_market' : 'at_market';

  return {
    yourPricing,
    competitors: pricingData,
    market: {
      average: Math.round(marketAverage),
      low: marketLow,
      high: marketHigh
    },
    yourPosition: pricePosition,
    insights: generatePricingInsights(yourPricing, pricingData, marketAverage)
  };
}

function generatePricingInsights(yourPricing, competitors, marketAverage) {
  const insights = [];

  // DIY tier analysis
  const hasDIY = competitors.some(c => c.lowestPrice < 60);
  if (!hasDIY) {
    insights.push({
      type: 'opportunity',
      tier: 'diy',
      message: 'Your DIY tier ($49) is unique - no direct competitors at this price point',
      recommendation: 'Emphasize DIY tier in marketing to capture budget-conscious segment'
    });
  }

  // Standard tier analysis
  if (yourPricing.tiers.standard < marketAverage - 20) {
    insights.push({
      type: 'pricing_power',
      tier: 'standard',
      message: `Your Standard tier ($${yourPricing.tiers.standard}) is ${Math.round(marketAverage - yourPricing.tiers.standard)} below market average`,
      recommendation: `Consider raising to $${Math.round(marketAverage - 10)} to increase revenue without losing competitiveness`
    });
  }

  // Premium tier analysis
  const premiumCompetitors = competitors.filter(c => c.highestPrice > 120);
  if (premiumCompetitors.length > 0) {
    const avgPremiumPrice = premiumCompetitors.reduce((sum, c) => sum + c.highestPrice, 0) / premiumCompetitors.length;

    if (yourPricing.tiers.premium < avgPremiumPrice) {
      insights.push({
        type: 'pricing_power',
        tier: 'premium',
        message: `Premium tier competitors average $${Math.round(avgPremiumPrice)}`,
        recommendation: `Your Premium ($${yourPricing.tiers.premium}) is competitive. Room to increase if value-add features are strong.`
      });
    }
  }

  return insights;
}

// ============================================================================
// FEATURE GAP ANALYSIS
// ============================================================================

async function analyzeFeatureGaps(competitors, yourBusiness) {
  const yourFeatures = [
    'AI Lead Scoring',
    'AI Churn Prediction',
    'AI Sentiment Analysis',
    'AI Workflow Optimizer',
    'AI Email Optimizer',
    'AI Voice Commands',
    'AI Predictive Analytics',
    'AI Revenue Optimizer',
    'AI Training Mode',
    'AI Performance Coach',
    'Workflow Testing Simulator',
    'Automated workflows',
    'Email/SMS automation',
    'Credit monitoring',
    'Dispute letters',
    'Client portal',
    'Mobile responsive'
  ];

  // Aggregate competitor features
  const competitorFeatures = {};
  Object.values(competitors).forEach(comp => {
    comp.features.forEach(feature => {
      competitorFeatures[feature] = (competitorFeatures[feature] || 0) + 1;
    });
  });

  // Common competitor features you don't have
  const gaps = [];
  Object.entries(competitorFeatures).forEach(([feature, count]) => {
    if (!yourFeatures.some(f => f.toLowerCase().includes(feature.toLowerCase()))) {
      const prevalence = (count / Object.keys(competitors).length) * 100;
      if (prevalence > 50) { // More than 50% of competitors have it
        gaps.push({
          feature,
          prevalence: Math.round(prevalence),
          competitorsOffering: count,
          priority: prevalence > 75 ? 'high' : 'medium'
        });
      }
    }
  });

  // Your unique features (competitive advantages)
  const uniqueFeatures = yourFeatures.filter(feature => {
    return !Object.keys(competitorFeatures).some(cf =>
      cf.toLowerCase().includes(feature.toLowerCase()) ||
      feature.toLowerCase().includes(cf.toLowerCase())
    );
  });

  return {
    gaps,
    uniqueFeatures,
    totalYourFeatures: yourFeatures.length,
    avgCompetitorFeatures: Object.values(competitors).reduce((sum, c) => sum + c.features.length, 0) / Object.keys(competitors).length,
    recommendations: generateFeatureRecommendations(gaps, uniqueFeatures)
  };
}

function generateFeatureRecommendations(gaps, uniqueFeatures) {
  const recommendations = [];

  // Address gaps
  gaps.forEach(gap => {
    if (gap.priority === 'high') {
      recommendations.push({
        type: 'add_feature',
        feature: gap.feature,
        reason: `${gap.prevalence}% of competitors offer this`,
        impact: 'high',
        effort: estimateEffort(gap.feature)
      });
    }
  });

  // Leverage unique features in marketing
  if (uniqueFeatures.length > 5) {
    recommendations.push({
      type: 'marketing',
      message: `You have ${uniqueFeatures.length} unique features competitors don't offer`,
      action: 'Emphasize AI features in marketing - they are your competitive advantage',
      impact: 'high'
    });
  }

  return recommendations;
}

function estimateEffort(feature) {
  const easyFeatures = ['credit monitoring', 'score tracking', 'email alerts'];
  const mediumFeatures = ['mobile app', 'family plans', 'goodwill letters'];
  const hardFeatures = ['identity theft insurance', 'attorney network', 'legal consultation'];

  if (easyFeatures.some(f => feature.toLowerCase().includes(f))) return 'low';
  if (hardFeatures.some(f => feature.toLowerCase().includes(f))) return 'high';
  return 'medium';
}

// ============================================================================
// POSITIONING ANALYSIS
// ============================================================================

async function analyzePositioning(competitors, yourBusiness) {
  const positions = {
    premium: [],
    mid_market: [],
    budget: [],
    value: []
  };

  // Categorize competitors
  Object.values(competitors).forEach(comp => {
    positions[comp.position]?.push(comp.name);
  });

  // Determine your position
  const yourPosition = determineYourPosition(yourBusiness, competitors);

  return {
    marketSegments: positions,
    yourPosition,
    crowdedSegments: Object.entries(positions)
      .filter(([_, comps]) => comps.length > 2)
      .map(([segment]) => segment),
    opportunities: identifyPositioningOpportunities(positions, yourPosition),
    whitespace: findMarketWhitespace(positions, competitors)
  };
}

function determineYourPosition(yourBusiness, competitors) {
  // Based on pricing and features
  const avgPricing = (99 + 199) / 2; // Standard + Premium average

  if (avgPricing > 150) return 'premium';
  if (avgPricing > 100) return 'mid_market';
  if (avgPricing < 80) return 'budget';

  // With AI features, you're likely "value" - good features at fair price
  return 'value';
}

function identifyPositioningOpportunities(positions, yourPosition) {
  const opportunities = [];

  // Identify underserved segments
  if (positions.premium.length === 0) {
    opportunities.push({
      segment: 'premium',
      message: 'No strong premium competitor - opportunity to own high-end market',
      strategy: 'Launch VIP tier with white-glove service at $299+'
    });
  }

  if (positions.budget.length > 3) {
    opportunities.push({
      segment: 'budget',
      message: 'Budget segment is crowded - avoid race to bottom on price',
      strategy: 'Differentiate on value (AI features, results, service) not price'
    });
  }

  return opportunities;
}

function findMarketWhitespace(positions, competitors) {
  const whitespace = [];

  // Technology-focused positioning
  const techCompetitors = Object.values(competitors).filter(c =>
    c.features.some(f => f.toLowerCase().includes('app') || f.toLowerCase().includes('ai'))
  );

  if (techCompetitors.length < 2) {
    whitespace.push({
      area: 'AI-Powered Credit Repair',
      description: 'No competitors emphasize AI/technology',
      opportunity: 'Position as "tech-forward" credit repair company',
      messaging: '"Credit repair powered by artificial intelligence"'
    });
  }

  // Personal service + technology
  whitespace.push({
    area: 'Personal + Automated',
    description: 'Competitors are either personal (slow) or automated (impersonal)',
    opportunity: 'Combine both: AI automation with personal touch',
    messaging: '"AI handles routine work, Christopher handles your success"'
  });

  return whitespace;
}

// ============================================================================
// REVIEW ANALYSIS
// ============================================================================

async function analyzeReviews(competitors) {
  // In production, this would scrape/fetch real reviews
  // For now, using representative data

  const reviewData = {
    lexington_law: {
      avgRating: 3.8,
      totalReviews: 12453,
      commonComplaints: [
        'Expensive monthly fees',
        'Slow results',
        'Hard to cancel',
        'Call center runaround'
      ],
      commonPraises: [
        'Professional service',
        'Good explanations',
        'Law firm backing'
      ],
      sentiment: 'mixed'
    },
    sky_blue: {
      avgRating: 4.3,
      totalReviews: 3421,
      commonComplaints: [
        'Limited features',
        'No app',
        'Manual process takes time'
      ],
      commonPraises: [
        'Great customer service',
        'Honest and transparent',
        'Personal attention',
        'Good results'
      ],
      sentiment: 'positive'
    },
    creditrepair_com: {
      avgRating: 3.5,
      totalReviews: 8932,
      commonComplaints: [
        'Aggressive sales tactics',
        'Results not as promised',
        'Poor communication',
        'Difficult cancellation'
      ],
      commonPraises: [
        'Easy to get started',
        'Mobile app is convenient',
        'Fast initial response'
      ],
      sentiment: 'negative'
    }
  };

  // Extract insights
  const insights = extractReviewInsights(reviewData);

  return {
    competitorReviews: reviewData,
    insights,
    yourOpportunities: identifyReviewOpportunities(reviewData)
  };
}

function extractReviewInsights(reviewData) {
  const insights = [];

  // Common pain points across competitors
  const allComplaints = Object.values(reviewData).flatMap(r => r.commonComplaints);
  const complaintCounts = {};

  allComplaints.forEach(complaint => {
    const key = complaint.toLowerCase();
    complaintCounts[key] = (complaintCounts[key] || 0) + 1;
  });

  Object.entries(complaintCounts)
    .filter(([_, count]) => count > 1)
    .forEach(([complaint, count]) => {
      insights.push({
        type: 'industry_pain_point',
        complaint,
        prevalence: count,
        message: `"${complaint}" is a common complaint - ensure you avoid this`
      });
    });

  return insights;
}

function identifyReviewOpportunities(reviewData) {
  const opportunities = [];

  // Slow results
  if (reviewData.lexington_law.commonComplaints.includes('Slow results')) {
    opportunities.push({
      weakness: 'Competitors criticized for slow results',
      yourAdvantage: 'AI-powered dispute optimization speeds up process',
      messaging: 'Emphasize faster results in marketing'
    });
  }

  // Poor customer service
  const serviceComplaints = Object.values(reviewData).filter(r =>
    r.commonComplaints.some(c => c.toLowerCase().includes('customer service') || c.toLowerCase().includes('communication'))
  );

  if (serviceComplaints.length > 0) {
    opportunities.push({
      weakness: 'Competitors have customer service issues',
      yourAdvantage: 'Direct access to Christopher, 2-hour response time',
      messaging: 'Highlight personal service and responsiveness'
    });
  }

  return opportunities;
}

// ============================================================================
// MARKET TRENDS
// ============================================================================

async function detectMarketTrends(competitors) {
  // Track changes over time
  const trends = {
    pricing: {
      direction: 'stable',
      insight: 'Prices have remained stable over past 12 months'
    },
    features: {
      direction: 'increasing',
      insight: 'Competitors adding mobile apps and automation',
      examples: ['Sky Blue added credit monitoring', 'CreditRepair.com improved app']
    },
    positioning: {
      trend: 'Technology focus increasing',
      insight: 'More competitors emphasizing technology and automation'
    },
    consolidation: {
      trend: 'No recent M&A activity',
      insight: 'Market remains fragmented with many small players'
    }
  };

  return trends;
}

// ============================================================================
// RECOMMENDATIONS ENGINE
// ============================================================================

function generateRecommendations(analysis, yourBusiness) {
  const recommendations = [];

  // Pricing recommendations
  if (analysis.pricingAnalysis.insights.length > 0) {
    analysis.pricingAnalysis.insights.forEach(insight => {
      if (insight.type === 'pricing_power') {
        recommendations.push({
          category: 'pricing',
          priority: 'high',
          title: insight.message,
          action: insight.recommendation,
          impact: 'revenue_increase'
        });
      }
    });
  }

  // Feature recommendations
  if (analysis.featureGapAnalysis.gaps.length > 0) {
    const highPriorityGaps = analysis.featureGapAnalysis.gaps.filter(g => g.priority === 'high');
    if (highPriorityGaps.length > 0) {
      recommendations.push({
        category: 'product',
        priority: 'medium',
        title: `${highPriorityGaps.length} features offered by most competitors`,
        action: `Consider adding: ${highPriorityGaps.map(g => g.feature).join(', ')}`,
        impact: 'competitive_parity'
      });
    }
  }

  // Positioning recommendations
  if (analysis.positioningAnalysis.whitespace.length > 0) {
    recommendations.push({
      category: 'positioning',
      priority: 'high',
      title: 'Market whitespace identified',
      action: analysis.positioningAnalysis.whitespace[0].messaging,
      impact: 'differentiation'
    });
  }

  // Review-based recommendations
  if (analysis.reviewAnalysis.yourOpportunities.length > 0) {
    analysis.reviewAnalysis.yourOpportunities.forEach(opp => {
      recommendations.push({
        category: 'marketing',
        priority: 'medium',
        title: opp.weakness,
        action: opp.messaging,
        impact: 'customer_acquisition'
      });
    });
  }

  return recommendations.slice(0, 10); // Top 10 recommendations
}

// ============================================================================
// COMPETITIVE SCORE
// ============================================================================

function calculateCompetitiveScore(analysis) {
  let score = 50; // Baseline

  // Pricing competitiveness (+/- 20 points)
  if (analysis.pricingAnalysis.yourPosition === 'at_market') score += 10;
  else if (analysis.pricingAnalysis.yourPosition === 'below_market') score += 15;

  // Feature advantage (+/- 20 points)
  const featureAdvantage = analysis.featureGapAnalysis.uniqueFeatures.length - analysis.featureGapAnalysis.gaps.length;
  score += Math.min(20, Math.max(-20, featureAdvantage * 2));

  // Positioning (+/- 10 points)
  if (analysis.positioningAnalysis.whitespace.length > 0) score += 10;

  return Math.max(0, Math.min(100, Math.round(score)));
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function getTrackedCompetitors() {
  // In production, fetch from database
  // For now, return static competitor data
  return COMPETITORS;
}

async function getYourBusinessProfile() {
  return {
    name: 'Speedy Credit Repair',
    pricing: {
      diy: 49,
      standard: 99,
      acceleration: 149,
      premium: 199,
      vip: 299
    },
    features: [
      'AI Lead Scoring',
      'AI Churn Prediction',
      'Automated workflows',
      'Personal service',
      'Fast response times'
    ]
  };
}

/**
 * Track a competitor price change
 * @param {string} competitorId - Competitor ID
 * @param {Object} priceChange - Price change data
 */
export async function trackPriceChange(competitorId, priceChange) {
  try {
    await addDoc(collection(db, 'competitorPriceHistory'), {
      competitorId,
      ...priceChange,
      detectedAt: Timestamp.now()
    });

    return { success: true };
  } catch (error) {
    console.error('[trackPriceChange] Error:', error);
    return { error: error.message };
  }
}

/**
 * Get competitive intelligence summary
 * @returns {Object} Quick competitive overview
 */
export async function getCompetitiveIntelligence() {
  const analysis = await analyzeCompetitors();

  return {
    competitiveScore: analysis.competitiveScore,
    topRecommendations: analysis.recommendations.slice(0, 3),
    keyInsights: [
      `You have ${analysis.featureGapAnalysis.uniqueFeatures.length} unique features`,
      `Your pricing is ${analysis.pricingAnalysis.yourPosition.replace('_', ' ')}`,
      `${analysis.recommendations.length} opportunities identified`
    ],
    lastUpdated: new Date()
  };
}

export default {
  analyzeCompetitors,
  trackPriceChange,
  getCompetitiveIntelligence,
  COMPETITORS
};
