/**
 * AI PERFORMANCE COACH SYSTEM
 *
 * Purpose:
 * Personal AI business coach that analyzes your performance, sets goals,
 * and provides actionable recommendations to improve your credit repair business.
 *
 * What It Coaches:
 * - Revenue Growth: Strategies to increase MRR/ARR
 * - Client Retention: Improve churn rate
 * - Operational Efficiency: Work smarter, not harder
 * - Sales Performance: Improve conversion rates
 * - Time Management: Optimize how you spend time
 * - Client Satisfaction: Improve NPS and reviews
 * - Profitability: Increase profit margins
 * - Strategic Planning: Quarterly and annual goals
 *
 * Key Performance Indicators (KPIs):
 * - Monthly Recurring Revenue (MRR)
 * - Annual Recurring Revenue (ARR)
 * - Client Count by Tier
 * - Churn Rate (monthly)
 * - Client Acquisition Cost (CAC)
 * - Lifetime Value (LTV)
 * - LTV:CAC Ratio
 * - Net Promoter Score (NPS)
 * - Average Credit Score Improvement
 * - Time per Client
 * - Email Open Rate
 * - Response Time
 *
 * Why It's Important:
 * - Objective performance feedback (no blind spots)
 * - Data-driven goal setting
 * - Actionable recommendations (not just data)
 * - Accountability and progress tracking
 * - Learn from industry benchmarks
 * - Continuous improvement mindset
 * - Catch problems before they become crises
 *
 * Coaching Formats:
 * - Daily Insights: Morning briefing with priorities
 * - Weekly Reviews: Performance summary and wins
 * - Monthly Coaching: Deep dive with action plans
 * - Quarterly Planning: Strategic goal setting
 * - Milestone Celebrations: Acknowledge achievements
 * - Course Corrections: Alert when trending wrong direction
 *
 * Example Coaching:
 * - "Your churn rate increased to 18% this month (up from 12%). Top risk: Premium tier clients showing low engagement. Action: Call top 3 at-risk Premium clients this week."
 * - "Great news! You hit $12K MRR this month (+15%). You're on track to hit your Q1 goal of $15K. Next milestone: Add 3 more Standard tier clients to stay on pace."
 * - "You're spending 5.2 hours per client vs industry benchmark of 3.5 hours. Opportunities: Automate more workflow steps, delegate task management to Laurie."
 *
 * Coaching Philosophy:
 * - Positive reinforcement (celebrate wins)
 * - Specific and actionable (not vague advice)
 * - Prioritized (focus on highest-impact actions)
 * - Balanced (growth + sustainability)
 * - Accountable (track commitments)
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
// PERFORMANCE DASHBOARD
// ============================================================================

/**
 * Get comprehensive performance dashboard
 * @param {string} period - 'day' | 'week' | 'month' | 'quarter' | 'year'
 * @returns {Object} Performance metrics and insights
 */
export async function getPerformanceDashboard(period = 'month') {
  try {
    const kpis = await calculateAllKPIs(period);
    const goals = await getActiveGoals();
    const insights = await generateInsights(kpis, goals, period);
    const priorities = await generatePriorities(kpis, insights);
    const coaching = await generateCoaching(kpis, insights, priorities);

    return {
      period,
      timestamp: new Date(),
      kpis,
      goals,
      insights,
      priorities,
      coaching,
      summary: generateExecutiveSummary(kpis, goals, insights)
    };

  } catch (error) {
    console.error('[getPerformanceDashboard] Error:', error);
    return { error: error.message };
  }
}

// ============================================================================
// KPI CALCULATION
// ============================================================================

async function calculateAllKPIs(period) {
  const contacts = await getActiveContacts();
  const historicalData = await getHistoricalKPIs(period);

  const kpis = {
    // Revenue Metrics
    mrr: calculateMRR(contacts),
    arr: calculateARR(contacts),
    averageRevenuePerClient: calculateAverageRevenuePerClient(contacts),

    // Client Metrics
    totalClients: contacts.length,
    clientsByTier: calculateClientsByTier(contacts),
    newClientsThisPeriod: await countNewClients(period),
    churnedClientsThisPeriod: await countChurnedClients(period),

    // Retention Metrics
    churnRate: await calculateChurnRate(period),
    retentionRate: await calculateRetentionRate(period),
    averageLifetimeMonths: calculateAverageLifetime(contacts),

    // Financial Metrics
    ltv: await calculateAverageLTV(contacts),
    cac: await calculateCAC(period),
    ltvCacRatio: 0, // Will calculate after LTV and CAC

    // Operational Metrics
    averageTimePerClient: await calculateAverageTimePerClient(period),
    responseTime: await calculateAverageResponseTime(period),
    emailOpenRate: await calculateEmailOpenRate(period),
    emailClickRate: await calculateEmailClickRate(period),

    // Client Success Metrics
    averageCreditScoreImprovement: calculateAverageCreditScoreImprovement(contacts),
    nps: await calculateNPS(period),
    clientSatisfactionScore: await calculateClientSatisfaction(period),

    // Growth Metrics
    growthRate: calculateGrowthRate(historicalData),
    projectedMRR: calculateProjectedMRR(historicalData)
  };

  // Calculate dependent metrics
  kpis.ltvCacRatio = kpis.cac > 0 ? Math.round((kpis.ltv / kpis.cac) * 10) / 10 : 0;

  return kpis;
}

function calculateMRR(contacts) {
  const TIER_PRICING = { diy: 49, standard: 99, acceleration: 149, premium: 199, vip: 299 };
  return contacts.reduce((sum, c) => sum + (TIER_PRICING[c.serviceTier] || 0), 0);
}

function calculateARR(contacts) {
  return calculateMRR(contacts) * 12;
}

function calculateAverageRevenuePerClient(contacts) {
  const mrr = calculateMRR(contacts);
  return contacts.length > 0 ? Math.round(mrr / contacts.length) : 0;
}

function calculateClientsByTier(contacts) {
  const tiers = { diy: 0, standard: 0, acceleration: 0, premium: 0, vip: 0 };
  contacts.forEach(c => {
    if (tiers[c.serviceTier] !== undefined) {
      tiers[c.serviceTier]++;
    }
  });
  return tiers;
}

async function calculateChurnRate(period) {
  const startOfPeriod = getStartOfPeriod(period);
  const clientsAtStart = await getClientsAtDate(startOfPeriod);
  const churnedClients = await countChurnedClients(period);

  return clientsAtStart > 0 ? (churnedClients / clientsAtStart) * 100 : 0;
}

async function calculateRetentionRate(period) {
  const churnRate = await calculateChurnRate(period);
  return 100 - churnRate;
}

function calculateAverageLifetime(contacts) {
  const lifetimes = contacts.map(c => {
    const startDate = c.createdAt?.toDate ? c.createdAt.toDate() : new Date(c.createdAt);
    const monthsActive = (Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
    return monthsActive;
  });

  return lifetimes.length > 0
    ? Math.round(lifetimes.reduce((sum, m) => sum + m, 0) / lifetimes.length * 10) / 10
    : 0;
}

function calculateAverageCreditScoreImprovement(contacts) {
  const improvements = contacts
    .filter(c => c.creditScore && c.initialCreditScore)
    .map(c => c.creditScore - c.initialCreditScore);

  return improvements.length > 0
    ? Math.round(improvements.reduce((sum, i) => sum + i, 0) / improvements.length)
    : 0;
}

function calculateGrowthRate(historicalData) {
  if (!historicalData || historicalData.length < 2) return 0;

  const current = historicalData[0]?.mrr || 0;
  const previous = historicalData[1]?.mrr || 0;

  return previous > 0 ? Math.round(((current - previous) / previous) * 100) : 0;
}

function calculateProjectedMRR(historicalData) {
  if (!historicalData || historicalData.length < 3) return 0;

  // Simple linear projection based on last 3 months
  const recentMRR = historicalData.slice(0, 3).map(d => d.mrr || 0);
  const avgGrowth = (recentMRR[0] - recentMRR[2]) / 2;

  return Math.round(recentMRR[0] + avgGrowth);
}

// ============================================================================
// INSIGHTS GENERATION
// ============================================================================

async function generateInsights(kpis, goals, period) {
  const insights = {
    positive: [],
    concerns: [],
    opportunities: [],
    trends: []
  };

  // Positive insights
  if (kpis.growthRate > 10) {
    insights.positive.push({
      category: 'growth',
      message: `Strong growth! MRR increased ${kpis.growthRate}% this ${period}.`,
      impact: 'high'
    });
  }

  if (kpis.ltvCacRatio > 3) {
    insights.positive.push({
      category: 'unit_economics',
      message: `Excellent unit economics! LTV:CAC ratio is ${kpis.ltvCacRatio}:1 (target: 3:1).`,
      impact: 'high'
    });
  }

  if (kpis.churnRate < 10) {
    insights.positive.push({
      category: 'retention',
      message: `Low churn rate of ${kpis.churnRate.toFixed(1)}% - clients are staying!`,
      impact: 'medium'
    });
  }

  if (kpis.averageCreditScoreImprovement > 50) {
    insights.positive.push({
      category: 'results',
      message: `Delivering great results! Average ${kpis.averageCreditScoreImprovement} point credit score improvement.`,
      impact: 'high'
    });
  }

  // Concerns
  if (kpis.churnRate > 20) {
    insights.concerns.push({
      category: 'retention',
      severity: 'critical',
      message: `High churn rate of ${kpis.churnRate.toFixed(1)}% needs immediate attention.`,
      recommendation: 'Review at-risk clients and implement retention strategies'
    });
  }

  if (kpis.ltvCacRatio < 2) {
    insights.concerns.push({
      category: 'unit_economics',
      severity: 'high',
      message: `LTV:CAC ratio of ${kpis.ltvCacRatio}:1 is below healthy threshold (3:1).`,
      recommendation: 'Reduce acquisition costs or increase client lifetime value'
    });
  }

  if (kpis.emailOpenRate < 20) {
    insights.concerns.push({
      category: 'engagement',
      severity: 'medium',
      message: `Email open rate of ${kpis.emailOpenRate}% is below industry average (25%).`,
      recommendation: 'Test new subject lines and send times'
    });
  }

  if (kpis.averageTimePerClient > 4) {
    insights.concerns.push({
      category: 'efficiency',
      severity: 'medium',
      message: `Spending ${kpis.averageTimePerClient} hours per client - above target of 3.5 hours.`,
      recommendation: 'Automate more workflow steps and delegate tasks'
    });
  }

  // Opportunities
  if (kpis.clientsByTier.diy > 10 && kpis.clientsByTier.standard < 30) {
    insights.opportunities.push({
      category: 'upsell',
      message: `${kpis.clientsByTier.diy} DIY clients - opportunity to upsell to Standard tier.`,
      potentialRevenue: kpis.clientsByTier.diy * 50 * 12,
      action: 'Run upsell campaign to DIY clients'
    });
  }

  if (kpis.clientsByTier.standard > 20 && kpis.clientsByTier.premium < 10) {
    insights.opportunities.push({
      category: 'upsell',
      message: 'Large Standard tier base - identify Premium upgrade candidates.',
      potentialRevenue: 5 * 100 * 12,
      action: 'Use AI upgrade predictions to find top 5 candidates'
    });
  }

  if (kpis.nps > 70) {
    insights.opportunities.push({
      category: 'referrals',
      message: `NPS of ${kpis.nps} indicates strong promoters - ask for referrals!`,
      potentialRevenue: 3 * 99 * 12,
      action: 'Launch referral program with promoters'
    });
  }

  // Trends
  insights.trends = detectTrends(kpis);

  return insights;
}

function detectTrends(kpis) {
  const trends = [];

  // Revenue trend
  if (kpis.growthRate > 0) {
    trends.push({
      metric: 'revenue',
      direction: 'up',
      message: `Revenue trending up (+${kpis.growthRate}%)`
    });
  } else if (kpis.growthRate < -5) {
    trends.push({
      metric: 'revenue',
      direction: 'down',
      message: `Revenue declining (${kpis.growthRate}%)`,
      alert: true
    });
  }

  return trends;
}

// ============================================================================
// PRIORITIES GENERATION
// ============================================================================

async function generatePriorities(kpis, insights) {
  const priorities = [];

  // Critical issues first
  insights.concerns
    .filter(c => c.severity === 'critical')
    .forEach(concern => {
      priorities.push({
        priority: 1,
        category: concern.category,
        title: 'Critical: ' + concern.message,
        action: concern.recommendation,
        timeframe: 'this_week',
        impact: 'high'
      });
    });

  // High-value opportunities
  insights.opportunities
    .sort((a, b) => (b.potentialRevenue || 0) - (a.potentialRevenue || 0))
    .slice(0, 2)
    .forEach(opp => {
      priorities.push({
        priority: 2,
        category: opp.category,
        title: opp.message,
        action: opp.action,
        potentialRevenue: opp.potentialRevenue,
        timeframe: 'this_month',
        impact: 'high'
      });
    });

  // Other concerns
  insights.concerns
    .filter(c => c.severity !== 'critical')
    .forEach(concern => {
      priorities.push({
        priority: 3,
        category: concern.category,
        title: concern.message,
        action: concern.recommendation,
        timeframe: 'this_quarter',
        impact: 'medium'
      });
    });

  return priorities.slice(0, 5); // Top 5 priorities
}

// ============================================================================
// COACHING GENERATION
// ============================================================================

async function generateCoaching(kpis, insights, priorities) {
  const coaching = {
    greeting: generateGreeting(),
    celebration: generateCelebration(insights.positive),
    challenges: generateChallenges(insights.concerns),
    actionPlan: generateActionPlan(priorities),
    encouragement: generateEncouragement(kpis, insights),
    nextMilestone: await identifyNextMilestone(kpis)
  };

  return coaching;
}

function generateGreeting() {
  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
  return `Good ${timeOfDay}, Christopher!`;
}

function generateCelebration(positiveInsights) {
  if (positiveInsights.length === 0) {
    return null;
  }

  const win = positiveInsights[0];
  return {
    message: `🎉 ${win.message}`,
    encouragement: 'Keep up the excellent work!'
  };
}

function generateChallenges(concerns) {
  if (concerns.length === 0) {
    return {
      message: 'No major concerns this period - smooth sailing!',
      tone: 'positive'
    };
  }

  const topConcern = concerns[0];
  return {
    message: topConcern.message,
    severity: topConcern.severity,
    recommendation: topConcern.recommendation,
    tone: 'constructive'
  };
}

function generateActionPlan(priorities) {
  if (priorities.length === 0) {
    return {
      message: 'Maintain current momentum - you\'re on track!',
      actions: []
    };
  }

  return {
    message: `Here are your top ${priorities.length} priorities:`,
    actions: priorities.map((p, index) => ({
      number: index + 1,
      title: p.title,
      action: p.action,
      timeframe: p.timeframe,
      impact: p.impact
    }))
  };
}

function generateEncouragement(kpis, insights) {
  const messages = [
    "You're building something special here.",
    "Every client's credit score improvement changes their life.",
    "Your dedication to compliance sets you apart from competitors.",
    "Remember: sustainable growth beats rapid growth.",
    "Focus on the clients who need you most."
  ];

  // Contextual encouragement
  if (insights.concerns.length > insights.positive.length) {
    return "Challenges are temporary, but the systems you're building last forever. Keep pushing forward.";
  }

  if (kpis.growthRate > 15) {
    return "You're in hypergrowth mode! Don't forget to maintain quality as you scale.";
  }

  return messages[Math.floor(Math.random() * messages.length)];
}

async function identifyNextMilestone(kpis) {
  const milestones = [
    { metric: 'mrr', threshold: 10000, label: '$10K MRR' },
    { metric: 'mrr', threshold: 15000, label: '$15K MRR' },
    { metric: 'mrr', threshold: 20000, label: '$20K MRR' },
    { metric: 'totalClients', threshold: 50, label: '50 Active Clients' },
    { metric: 'totalClients', threshold: 100, label: '100 Active Clients' },
    { metric: 'averageCreditScoreImprovement', threshold: 75, label: '75-Point Average Improvement' }
  ];

  // Find next unachieved milestone
  for (const milestone of milestones) {
    if (kpis[milestone.metric] < milestone.threshold) {
      const progress = (kpis[milestone.metric] / milestone.threshold) * 100;
      const remaining = milestone.threshold - kpis[milestone.metric];

      return {
        label: milestone.label,
        current: kpis[milestone.metric],
        target: milestone.threshold,
        progress: Math.round(progress),
        remaining,
        message: `You're ${Math.round(progress)}% of the way to ${milestone.label}!`
      };
    }
  }

  return {
    label: 'Scale to $50K MRR',
    message: 'Time to think bigger - you\'ve achieved all initial milestones!'
  };
}

// ============================================================================
// GOAL SETTING & TRACKING
// ============================================================================

/**
 * Set a performance goal
 * @param {Object} goal - Goal configuration
 * @returns {Object} Created goal
 */
export async function setGoal(goal) {
  try {
    const newGoal = {
      ...goal,
      createdAt: Timestamp.now(),
      status: 'active',
      progress: 0
    };

    const docRef = await addDoc(collection(db, 'performanceGoals'), newGoal);

    return {
      id: docRef.id,
      ...newGoal
    };

  } catch (error) {
    console.error('[setGoal] Error:', error);
    return { error: error.message };
  }
}

async function getActiveGoals() {
  try {
    const q = query(
      collection(db, 'performanceGoals'),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

  } catch (error) {
    console.error('[getActiveGoals] Error:', error);
    return [];
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function getActiveContacts() {
  const q = query(
    collection(db, 'contacts'),
    where('status', 'in', ['active', 'onboarding'])
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function getHistoricalKPIs(period) {
  const q = query(
    collection(db, 'kpiHistory'),
    orderBy('date', 'desc'),
    limit(12)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data());
}

async function countNewClients(period) {
  const startDate = getStartOfPeriod(period);
  const q = query(
    collection(db, 'contacts'),
    where('createdAt', '>=', Timestamp.fromDate(startDate))
  );

  const snapshot = await getDocs(q);
  return snapshot.size;
}

async function countChurnedClients(period) {
  const startDate = getStartOfPeriod(period);
  const q = query(
    collection(db, 'contacts'),
    where('status', '==', 'churned'),
    where('churnedAt', '>=', Timestamp.fromDate(startDate))
  );

  const snapshot = await getDocs(q);
  return snapshot.size;
}

async function getClientsAtDate(date) {
  // Simplified - would need more complex query in production
  const contacts = await getActiveContacts();
  return contacts.length;
}

async function calculateAverageLTV(contacts) {
  const TIER_PRICING = { diy: 49, standard: 99, acceleration: 149, premium: 199, vip: 299 };
  const averageLifetimeMonths = 18;

  const totalLTV = contacts.reduce((sum, c) => {
    const monthlyRate = TIER_PRICING[c.serviceTier] || 99;
    return sum + (monthlyRate * averageLifetimeMonths);
  }, 0);

  return contacts.length > 0 ? Math.round(totalLTV / contacts.length) : 0;
}

async function calculateCAC(period) {
  // Simplified - would fetch actual marketing spend
  return 450; // Average acquisition cost
}

async function calculateAverageTimePerClient(period) {
  // Would track actual time spent
  return 4.2; // Hours per client per month
}

async function calculateAverageResponseTime(period) {
  // Would calculate from actual response times
  return 3.5; // Hours
}

async function calculateEmailOpenRate(period) {
  // Would calculate from email logs
  return 28; // Percent
}

async function calculateEmailClickRate(period) {
  // Would calculate from email logs
  return 8; // Percent
}

async function calculateNPS(period) {
  // Would calculate from surveys
  return 75; // Net Promoter Score
}

async function calculateClientSatisfaction(period) {
  // Would calculate from satisfaction surveys
  return 4.3; // Out of 5
}

function getStartOfPeriod(period) {
  const now = new Date();

  switch (period) {
    case 'day':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    case 'week':
      const dayOfWeek = now.getDay();
      return new Date(now.getTime() - dayOfWeek * 24 * 60 * 60 * 1000);
    case 'month':
      return new Date(now.getFullYear(), now.getMonth(), 1);
    case 'quarter':
      const quarter = Math.floor(now.getMonth() / 3);
      return new Date(now.getFullYear(), quarter * 3, 1);
    case 'year':
      return new Date(now.getFullYear(), 0, 1);
    default:
      return new Date(now.getFullYear(), now.getMonth(), 1);
  }
}

function generateExecutiveSummary(kpis, goals, insights) {
  return {
    headline: generateHeadline(kpis, insights),
    keyMetrics: [
      { label: 'MRR', value: `$${kpis.mrr.toLocaleString()}`, change: kpis.growthRate },
      { label: 'Total Clients', value: kpis.totalClients, change: null },
      { label: 'Churn Rate', value: `${kpis.churnRate.toFixed(1)}%`, change: null },
      { label: 'LTV:CAC', value: `${kpis.ltvCacRatio}:1`, change: null }
    ],
    status: determineOverallStatus(kpis, insights)
  };
}

function generateHeadline(kpis, insights) {
  if (insights.concerns.length > 0 && insights.concerns[0].severity === 'critical') {
    return '⚠️ Critical Issues Require Attention';
  }

  if (kpis.growthRate > 15) {
    return '🚀 Strong Growth - Maintain Momentum!';
  }

  if (insights.positive.length > insights.concerns.length) {
    return '✅ Healthy Performance - On Track';
  }

  return '📊 Steady Progress - Opportunities Ahead';
}

function determineOverallStatus(kpis, insights) {
  const criticalConcerns = insights.concerns.filter(c => c.severity === 'critical').length;

  if (criticalConcerns > 0) return 'critical';
  if (insights.concerns.length > insights.positive.length) return 'needs_improvement';
  if (kpis.growthRate > 10 && insights.positive.length > 0) return 'excellent';
  return 'good';
}

export default {
  getPerformanceDashboard,
  setGoal
};
