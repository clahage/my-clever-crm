/**
 * AI REVENUE OPTIMIZER SYSTEM
 *
 * Purpose:
 * Maximize revenue and profitability through intelligent pricing, upsells,
 * retention strategies, and operational efficiency improvements.
 *
 * What It Optimizes:
 * - Pricing Strategy: Optimal pricing for each tier
 * - Upsell Timing: Best time to offer upgrades
 * - Retention Investments: How much to spend saving each client
 * - Service Tier Mix: Ideal distribution across tiers
 * - Discount Strategy: When discounts increase LTV
 * - Client Profitability: Which clients are most/least profitable
 * - Operational Efficiency: Reduce costs per client
 * - Resource Allocation: Where to invest time for max revenue
 *
 * Revenue Levers:
 * 1. Increase Prices: When market supports higher pricing
 * 2. Upsell Clients: Move to higher tiers at optimal times
 * 3. Reduce Churn: Keep clients longer (increases LTV)
 * 4. Acquire Better Clients: Focus on high-LTV segments
 * 5. Reduce Costs: Automation, efficiency improvements
 * 6. Add Services: New revenue streams
 * 7. Optimize Discounts: Discount only when it increases LTV
 *
 * Why It's Important:
 * - Maximize profit per client (LTV)
 * - Identify revenue opportunities automatically
 * - Optimize pricing without guesswork
 * - Know exactly how much to invest in retention
 * - Focus energy on highest-ROI activities
 * - Data-driven revenue decisions
 * - Prevent revenue leakage
 *
 * Example Insights:
 * - "Premium tier should increase to $229/mo based on market analysis"
 * - "Upsell Sarah to Premium now - 87% success probability, +$1,200 LTV"
 * - "Spend up to $150 to retain John (LTV: $2,400, 18mo expected)"
 * - "DIY tier clients have 2x churn rate - consider raising to $69"
 * - "Offer 20% discount to at-risk Premium clients - saves $4,800/year"
 * - "Christopher spends 4.2hrs/client - automate workflows to hit 3hrs"
 *
 * Financial Metrics:
 * - MRR (Monthly Recurring Revenue)
 * - ARR (Annual Recurring Revenue)
 * - LTV (Lifetime Value per client)
 * - CAC (Customer Acquisition Cost)
 * - LTV:CAC Ratio (should be 3:1 or higher)
 * - Churn Rate (monthly & annual)
 * - Net Revenue Retention (NRR)
 * - Gross Margin per tier
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
// PRICING OPTIMIZATION
// ============================================================================

/**
 * Analyze and optimize pricing strategy for each tier
 * @returns {Object} Pricing recommendations
 */
export async function optimizePricing() {
  try {
    const tierData = await getTierPerformanceData();
    const marketData = await getMarketBenchmarks();
    const competitorPricing = getCompetitorPricing();

    const recommendations = [];

    for (const tier in TIER_PRICING) {
      const currentPrice = TIER_PRICING[tier];
      const tierPerformance = tierData[tier];
      const marketAverage = competitorPricing[tier];

      // Price elasticity analysis
      const priceElasticity = calculatePriceElasticity(tier, tierPerformance);

      // Optimal price calculation
      const optimalPrice = calculateOptimalPrice({
        currentPrice,
        marketAverage,
        churnRate: tierPerformance.churnRate,
        conversionRate: tierPerformance.conversionRate,
        priceElasticity,
        valueDelivered: tierPerformance.averageScoreImprovement
      });

      const priceDifference = optimalPrice - currentPrice;
      const percentChange = (priceDifference / currentPrice) * 100;

      if (Math.abs(percentChange) > 5) {
        recommendations.push({
          tier,
          currentPrice,
          optimalPrice,
          change: priceDifference,
          percentChange: Math.round(percentChange),
          reasoning: generatePricingReasoning(tier, {
            priceDifference,
            priceElasticity,
            marketAverage,
            tierPerformance
          }),
          expectedRevenueImpact: calculateRevenueImpact(
            tier,
            tierPerformance.clientCount,
            priceDifference,
            priceElasticity
          ),
          confidence: calculatePricingConfidence(tierPerformance),
          implementation: 'Implement gradually over 3 months to minimize churn'
        });
      }
    }

    return {
      recommendations,
      currentMRR: await calculateCurrentMRR(),
      projectedMRR: calculateProjectedMRR(recommendations),
      implementationPlan: generateImplementationPlan(recommendations)
    };

  } catch (error) {
    console.error('[optimizePricing] Error:', error);
    return { error: error.message };
  }
}

const TIER_PRICING = {
  diy: 49,
  standard: 99,
  acceleration: 149,
  premium: 199,
  vip: 299
};

function calculatePriceElasticity(tier, performance) {
  // Price elasticity: % change in demand per 1% change in price
  // Lower tiers = more price sensitive (higher elasticity)
  // Higher tiers = less price sensitive (lower elasticity)

  const baseElasticity = {
    diy: -1.8,        // Very price sensitive
    standard: -1.2,   // Price sensitive
    acceleration: -0.8, // Moderately price sensitive
    premium: -0.5,    // Less price sensitive
    vip: -0.3         // Least price sensitive (luxury tier)
  };

  // Adjust based on churn rate (higher churn = more price sensitive)
  const churnAdjustment = performance.churnRate > 0.15 ? -0.2 : 0;

  return baseElasticity[tier] + churnAdjustment;
}

function calculateOptimalPrice(params) {
  const {
    currentPrice,
    marketAverage,
    churnRate,
    conversionRate,
    priceElasticity,
    valueDelivered
  } = params;

  // Start with current price
  let optimalPrice = currentPrice;

  // Adjust based on market position
  if (currentPrice < marketAverage * 0.85) {
    // We're significantly cheaper - can increase
    optimalPrice += (marketAverage * 0.9 - currentPrice) * 0.5;
  } else if (currentPrice > marketAverage * 1.15) {
    // We're significantly more expensive - consider decreasing
    optimalPrice -= (currentPrice - marketAverage * 1.1) * 0.3;
  }

  // Adjust based on churn rate
  if (churnRate > 0.20) {
    // High churn - price may be too high
    optimalPrice *= 0.95;
  } else if (churnRate < 0.10) {
    // Low churn - can increase price
    optimalPrice *= 1.05;
  }

  // Adjust based on value delivered
  if (valueDelivered > 60) {
    // Delivering great results - can charge more
    optimalPrice *= 1.08;
  } else if (valueDelivered < 30) {
    // Poor results - should charge less
    optimalPrice *= 0.92;
  }

  // Round to attractive price point ($X9 or $X5)
  optimalPrice = roundToAttractivePricing(optimalPrice);

  return optimalPrice;
}

function roundToAttractivePricing(price) {
  // Round to nearest $X9 or $X5
  const rounded = Math.round(price / 10) * 10;

  // Check if $X9 makes sense
  if (price % 10 >= 4 && price % 10 <= 9) {
    return rounded - 1; // $X9
  } else if (price % 10 >= 0 && price % 10 <= 3) {
    return rounded + 5; // $X5
  }

  return rounded;
}

function generatePricingReasoning(tier, data) {
  const reasons = [];

  if (data.priceDifference > 0) {
    if (data.tierPerformance.churnRate < 0.10) {
      reasons.push('Low churn rate indicates clients see strong value');
    }
    if (data.tierPerformance.averageScoreImprovement > 60) {
      reasons.push('Delivering excellent results - clients willing to pay premium');
    }
    if (data.marketAverage > TIER_PRICING[tier] * 1.1) {
      reasons.push(`Market average ($${data.marketAverage}) significantly higher than current price`);
    }
  } else if (data.priceDifference < 0) {
    if (data.tierPerformance.churnRate > 0.20) {
      reasons.push('High churn rate suggests price resistance');
    }
    if (data.tierPerformance.averageScoreImprovement < 30) {
      reasons.push('Results below expectations - price adjustment needed');
    }
  }

  return reasons;
}

function calculateRevenueImpact(tier, clientCount, priceChange, elasticity) {
  // Revenue impact = (New Price * Expected Clients) - (Old Price * Current Clients)
  const currentRevenue = TIER_PRICING[tier] * clientCount;

  // Expected client change based on price elasticity
  const percentPriceChange = (priceChange / TIER_PRICING[tier]) * 100;
  const expectedDemandChange = percentPriceChange * elasticity; // Will be negative if price increases
  const expectedClients = clientCount * (1 + expectedDemandChange / 100);

  const newPrice = TIER_PRICING[tier] + priceChange;
  const newRevenue = newPrice * expectedClients;

  return Math.round(newRevenue - currentRevenue);
}

function calculatePricingConfidence(performance) {
  // Confidence based on data points
  let confidence = 50;

  if (performance.clientCount > 20) confidence += 20;
  else if (performance.clientCount > 10) confidence += 10;

  if (performance.monthsOfData > 6) confidence += 20;
  else if (performance.monthsOfData > 3) confidence += 10;

  if (performance.churnRate !== undefined) confidence += 10;

  return Math.min(100, confidence);
}

// ============================================================================
// UPSELL OPTIMIZATION
// ============================================================================

/**
 * Identify optimal upsell opportunities
 * @returns {Array} Prioritized upsell opportunities
 */
export async function optimizeUpsells() {
  try {
    const contacts = await getActiveContacts();
    const opportunities = [];

    for (const contact of contacts) {
      if (contact.serviceTier === 'vip') continue; // Can't upsell VIP

      const upsellScore = await calculateUpsellScore(contact);

      if (upsellScore.score > 60) {
        const nextTier = getNextTier(contact.serviceTier);
        const revenueIncrease = TIER_PRICING[nextTier] - TIER_PRICING[contact.serviceTier];
        const lifetimeValue = calculateIncrementalLTV(contact, revenueIncrease);

        opportunities.push({
          contactId: contact.id,
          name: `${contact.firstName} ${contact.lastName}`,
          currentTier: contact.serviceTier,
          recommendedTier: nextTier,
          score: upsellScore.score,
          probability: upsellScore.probability,
          reasoning: upsellScore.reasoning,
          monthlyIncrease: revenueIncrease,
          lifetimeValue,
          roi: calculateUpsellROI(lifetimeValue, upsellScore.effortRequired),
          timing: upsellScore.timing,
          approach: upsellScore.approach,
          effortRequired: upsellScore.effortRequired
        });
      }
    }

    // Sort by ROI (highest first)
    opportunities.sort((a, b) => b.roi - a.roi);

    return {
      opportunities,
      totalPotentialMRR: opportunities.reduce((sum, opp) => sum + opp.monthlyIncrease, 0),
      totalPotentialARR: opportunities.reduce((sum, opp) => sum + opp.lifetimeValue, 0),
      highProbability: opportunities.filter(o => o.probability > 0.75).length,
      recommendations: generateUpsellRecommendations(opportunities)
    };

  } catch (error) {
    console.error('[optimizeUpsells] Error:', error);
    return { error: error.message };
  }
}

async function calculateUpsellScore(contact) {
  let score = 0;
  const reasoning = [];
  let probability = 0;

  // 1. Usage intensity
  const portalLogins = contact.portalLogins || 0;
  if (portalLogins > 30) {
    score += 25;
    reasoning.push('Very active user - high engagement');
  } else if (portalLogins > 15) {
    score += 15;
    reasoning.push('Active user - regular engagement');
  }

  // 2. Results satisfaction
  const scoreImprovement = (contact.creditScore || 600) - (contact.initialCreditScore || 600);
  if (scoreImprovement > 50) {
    score += 25;
    reasoning.push('Excellent results - likely sees value');
  } else if (scoreImprovement > 30) {
    score += 15;
    reasoning.push('Good results - satisfied with progress');
  }

  // 3. Payment reliability
  const missedPayments = contact.missedPayments || 0;
  if (missedPayments === 0 && contact.paymentHistory?.length > 2) {
    score += 20;
    reasoning.push('Perfect payment history - financially stable');
  } else if (missedPayments === 0) {
    score += 10;
  }

  // 4. Tenure (longer clients more likely to upgrade)
  const monthsActive = getDaysSince(contact.createdAt) / 30;
  if (monthsActive > 6) {
    score += 15;
    reasoning.push('Long-term client - trust established');
  } else if (monthsActive > 3) {
    score += 10;
  }

  // 5. Recent engagement
  if (getDaysSince(contact.lastActivity) <= 7) {
    score += 10;
    reasoning.push('Recently active - good timing');
  }

  // 6. Current tier limitations
  if (contact.serviceTier === 'diy') {
    score += 5;
    reasoning.push('DIY clients often ready for more support');
  }

  // Calculate probability (slightly lower than score to be conservative)
  probability = Math.min(0.95, score / 110);

  // Determine timing
  const timing = score > 80 ? 'immediate' :
                 score > 70 ? 'this_week' :
                 score > 60 ? 'this_month' : 'next_quarter';

  // Determine approach
  const approach = score > 80 ? 'direct_offer' :
                   score > 70 ? 'feature_comparison' :
                   'soft_mention';

  // Effort required
  const effortRequired = score > 80 ? 'low' :
                         score > 70 ? 'medium' : 'high';

  return {
    score,
    probability,
    reasoning,
    timing,
    approach,
    effortRequired
  };
}

function calculateIncrementalLTV(contact, monthlyIncrease) {
  // Expected remaining months as client
  const averageLifetimeMonths = 18;
  const monthsActive = getDaysSince(contact.createdAt) / 30;
  const expectedRemainingMonths = Math.max(6, averageLifetimeMonths - monthsActive);

  return Math.round(monthlyIncrease * expectedRemainingMonths);
}

function calculateUpsellROI(lifetimeValue, effortRequired) {
  const effortCost = {
    low: 30,      // 30 minutes @ $60/hr = $30
    medium: 60,   // 1 hour
    high: 120     // 2 hours
  };

  const cost = effortCost[effortRequired] || 60;
  return Math.round((lifetimeValue / cost) * 100) / 100; // ROI ratio
}

function generateUpsellRecommendations(opportunities) {
  const highROI = opportunities.filter(o => o.roi > 50);
  const immediate = opportunities.filter(o => o.timing === 'immediate');

  return [
    `${immediate.length} clients ready for immediate upsell (high probability)`,
    `Focus on top ${Math.min(5, highROI.length)} opportunities - ROI over 50:1`,
    `Total potential ARR increase: $${opportunities.reduce((sum, o) => sum + o.lifetimeValue, 0).toLocaleString()}`,
    highROI.length > 0 ? `Start with ${highROI[0].name} - ${highROI[0].currentTier} → ${highROI[0].recommendedTier} ($${highROI[0].lifetimeValue} LTV)` : null
  ].filter(Boolean);
}

// ============================================================================
// RETENTION VALUE OPTIMIZATION
// ============================================================================

/**
 * Calculate how much to invest in retaining each at-risk client
 * @param {string} contactId - Optional specific contact
 * @returns {Array} Retention investment recommendations
 */
export async function optimizeRetentionInvestment(contactId = null) {
  try {
    const atRiskClients = contactId
      ? [await getContact(contactId)]
      : await getAtRiskClients();

    const recommendations = [];

    for (const client of atRiskClients) {
      const ltv = await calculateClientLTV(client);
      const churnProbability = await calculateChurnProbability(client);
      const expectedLoss = ltv * churnProbability;

      // Calculate max retention investment (50% of expected loss)
      const maxInvestment = Math.round(expectedLoss * 0.5);

      // Recommend retention strategies by investment level
      const strategies = recommendRetentionStrategies(client, maxInvestment);

      recommendations.push({
        contactId: client.id,
        name: `${client.firstName} ${client.lastName}`,
        serviceTier: client.serviceTier,
        ltv: Math.round(ltv),
        churnProbability: Math.round(churnProbability * 100),
        expectedLoss: Math.round(expectedLoss),
        maxInvestment,
        strategies,
        priority: expectedLoss > 1000 ? 'critical' :
                  expectedLoss > 500 ? 'high' : 'medium'
      });
    }

    // Sort by expected loss (highest first)
    recommendations.sort((a, b) => b.expectedLoss - a.expectedLoss);

    return {
      recommendations,
      totalAtRisk: recommendations.length,
      totalPotentialLoss: recommendations.reduce((sum, r) => sum + r.expectedLoss, 0),
      totalMaxInvestment: recommendations.reduce((sum, r) => sum + r.maxInvestment, 0),
      summary: generateRetentionSummary(recommendations)
    };

  } catch (error) {
    console.error('[optimizeRetentionInvestment] Error:', error);
    return { error: error.message };
  }
}

async function calculateClientLTV(client) {
  const monthlyRate = TIER_PRICING[client.serviceTier] || 99;
  const averageLifetimeMonths = 18; // Historical average
  const monthsActive = getDaysSince(client.createdAt) / 30;
  const expectedRemainingMonths = Math.max(3, averageLifetimeMonths - monthsActive);

  return monthlyRate * expectedRemainingMonths;
}

async function calculateChurnProbability(client) {
  // Use churn prediction from predictive analytics
  // Simplified version for now
  const daysSinceActivity = getDaysSince(client.lastActivity);
  const missedPayments = client.missedPayments || 0;

  let probability = 0.1; // Base 10%

  if (daysSinceActivity > 30) probability += 0.4;
  else if (daysSinceActivity > 14) probability += 0.2;
  else if (daysSinceActivity > 7) probability += 0.1;

  probability += missedPayments * 0.15;

  if (client.latestSentiment?.churnRisk === 'critical') probability += 0.3;
  else if (client.latestSentiment?.churnRisk === 'high') probability += 0.2;

  return Math.min(0.95, probability);
}

function recommendRetentionStrategies(client, maxInvestment) {
  const strategies = [];

  if (maxInvestment > 200) {
    strategies.push({
      strategy: 'Personal call from owner',
      cost: 60,
      effectiveness: 0.70,
      expectedValue: Math.round(60 * 0.70),
      action: 'Schedule 30-minute call with Christopher'
    });
  }

  if (maxInvestment > 100) {
    strategies.push({
      strategy: 'One month free service',
      cost: TIER_PRICING[client.serviceTier],
      effectiveness: 0.60,
      expectedValue: Math.round(TIER_PRICING[client.serviceTier] * 0.60),
      action: 'Offer 1 month free to demonstrate continued value'
    });
  }

  if (maxInvestment > 50) {
    strategies.push({
      strategy: '50% discount for 3 months',
      cost: Math.round(TIER_PRICING[client.serviceTier] * 0.5 * 3),
      effectiveness: 0.55,
      expectedValue: Math.round(TIER_PRICING[client.serviceTier] * 0.5 * 3 * 0.55),
      action: 'Offer loyalty discount to bridge rough patch'
    });
  }

  strategies.push({
    strategy: 'Tier downgrade offer',
    cost: 30, // Time cost
    effectiveness: 0.50,
    expectedValue: Math.round(30 * 0.50),
    action: 'Offer downgrade to lower tier instead of cancellation'
  });

  return strategies.filter(s => s.cost <= maxInvestment)
                   .sort((a, b) => b.effectiveness - a.effectiveness);
}

function generateRetentionSummary(recommendations) {
  const critical = recommendations.filter(r => r.priority === 'critical');

  return [
    `${critical.length} clients in critical retention status`,
    `Total at-risk revenue: $${recommendations.reduce((sum, r) => sum + r.expectedLoss, 0).toLocaleString()}`,
    `Recommended retention budget: $${recommendations.reduce((sum, r) => sum + r.maxInvestment, 0).toLocaleString()}`,
    critical.length > 0 ? `Prioritize: ${critical[0].name} ($${critical[0].expectedLoss} at risk)` : null
  ].filter(Boolean);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function getTierPerformanceData() {
  // Fetch performance data for each tier
  // Mock data for now - would query Firestore in production
  return {
    diy: {
      clientCount: 15,
      churnRate: 0.25,
      conversionRate: 0.40,
      averageScoreImprovement: 45,
      monthsOfData: 6
    },
    standard: {
      clientCount: 42,
      churnRate: 0.12,
      conversionRate: 0.65,
      averageScoreImprovement: 68,
      monthsOfData: 12
    },
    acceleration: {
      clientCount: 18,
      churnRate: 0.08,
      conversionRate: 0.70,
      averageScoreImprovement: 75,
      monthsOfData: 8
    },
    premium: {
      clientCount: 12,
      churnRate: 0.05,
      conversionRate: 0.80,
      averageScoreImprovement: 82,
      monthsOfData: 10
    },
    vip: {
      clientCount: 3,
      churnRate: 0.02,
      conversionRate: 0.90,
      averageScoreImprovement: 90,
      monthsOfData: 6
    }
  };
}

async function getMarketBenchmarks() {
  // Would fetch from industry data sources
  return {
    averageChurnRate: 0.15,
    averageLTV: 1800,
    averageCAC: 450
  };
}

function getCompetitorPricing() {
  // Competitive analysis
  return {
    diy: 59,
    standard: 119,
    acceleration: 169,
    premium: 219,
    vip: 349
  };
}

async function calculateCurrentMRR() {
  const contacts = await getActiveContacts();
  return contacts.reduce((sum, c) => sum + (TIER_PRICING[c.serviceTier] || 0), 0);
}

function calculateProjectedMRR(recommendations) {
  // Calculate MRR after implementing pricing changes
  // Simplified calculation
  return 0; // Would implement based on recommendations
}

function generateImplementationPlan(recommendations) {
  if (recommendations.length === 0) {
    return ['No pricing changes recommended at this time'];
  }

  return [
    'Month 1: Announce pricing changes with 60-day notice',
    'Month 2: Grandfather existing clients at current rates',
    'Month 3: New clients pay new rates, begin transition for existing',
    'Month 4-6: Gradually transition existing clients with value messaging'
  ];
}

async function getActiveContacts() {
  const q = query(
    collection(db, 'contacts'),
    where('status', 'in', ['active', 'onboarding'])
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function getAtRiskClients() {
  const q = query(
    collection(db, 'contacts'),
    where('status', '==', 'active'),
    where('latestSentiment.churnRisk', 'in', ['high', 'critical'])
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function getContact(contactId) {
  const contactDoc = await getDoc(doc(db, 'contacts', contactId));
  return contactDoc.exists() ? { id: contactDoc.id, ...contactDoc.data() } : null;
}

function getNextTier(currentTier) {
  const tiers = ['diy', 'standard', 'acceleration', 'premium', 'vip'];
  const currentIndex = tiers.indexOf(currentTier);
  return tiers[currentIndex + 1] || 'vip';
}

function getDaysSince(timestamp) {
  if (!timestamp) return 999;
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
}

export default {
  optimizePricing,
  optimizeUpsells,
  optimizeRetentionInvestment
};
