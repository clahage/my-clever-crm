/**
 * Business Intelligence Functions
 * Executive KPIs, Payment Health, and Dispute Pattern Analysis
 */

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { defineSecret } = require('firebase-functions/params');

const openaiApiKey = defineSecret('OPENAI_API_KEY');

const ROLE_HIERARCHY = { admin: 4, manager: 3, user: 2, viewer: 1 };

// ============================================
// EXECUTIVE KPI DASHBOARD
// ============================================

/**
 * Get comprehensive business KPIs
 */
exports.getExecutiveKPIs = onCall(async (request) => {
  const db = getFirestore();
  const { period } = request.data; // 'today', 'week', 'month', 'quarter', 'year'
  const userId = request.auth?.uid;

  if (!userId) throw new HttpsError('unauthenticated', 'Must be logged in');

  // Verify manager+ role
  const userDoc = await db.collection('users').doc(userId).get();
  const userRole = userDoc.exists ? userDoc.data().role : 'viewer';
  if (ROLE_HIERARCHY[userRole] < ROLE_HIERARCHY['manager']) {
    throw new HttpsError('permission-denied', 'Manager access required');
  }

  const now = new Date();
  let startDate = new Date();

  switch (period) {
    case 'today':
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'week':
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(now.getMonth() - 1);
      break;
    case 'quarter':
      startDate.setMonth(now.getMonth() - 3);
      break;
    case 'year':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      startDate.setMonth(now.getMonth() - 1); // Default to month
  }

  // Gather all KPIs in parallel
  const [
    clientKPIs,
    revenueKPIs,
    disputeKPIs,
    satisfactionKPIs,
    autoLeadKPIs
  ] = await Promise.all([
    getClientKPIs(db, startDate),
    getRevenueKPIs(db, startDate),
    getDisputeKPIs(db, startDate),
    getSatisfactionKPIs(db, startDate),
    getAutoLeadKPIs(db, startDate)
  ]);

  return {
    period,
    generatedAt: new Date().toISOString(),
    clients: clientKPIs,
    revenue: revenueKPIs,
    disputes: disputeKPIs,
    satisfaction: satisfactionKPIs,
    autoLeads: autoLeadKPIs
  };
});

async function getClientKPIs(db, startDate) {
  // Total clients
  const allClientsSnapshot = await db.collection('clients').get();
  const totalClients = allClientsSnapshot.size;

  // Active clients (with activity in period)
  const activeClientsSnapshot = await db.collection('clients')
    .where('lastActivityDate', '>=', startDate)
    .get();
  const activeClients = activeClientsSnapshot.size;

  // New clients in period
  const newClientsSnapshot = await db.collection('clients')
    .where('createdAt', '>=', startDate)
    .get();
  const newClients = newClientsSnapshot.size;

  // Churned clients (no activity in 60+ days)
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
  const churnedSnapshot = await db.collection('clients')
    .where('status', '==', 'inactive')
    .where('lastActivityDate', '<=', sixtyDaysAgo)
    .get();
  const churnedClients = churnedSnapshot.size;

  // Average score improvement
  let totalImprovement = 0;
  let clientsWithImprovement = 0;
  allClientsSnapshot.docs.forEach(doc => {
    const data = doc.data();
    if (data.scoreImprovement && data.scoreImprovement > 0) {
      totalImprovement += data.scoreImprovement;
      clientsWithImprovement++;
    }
  });

  return {
    total: totalClients,
    active: activeClients,
    new: newClients,
    churned: churnedClients,
    churnRate: totalClients > 0 ? ((churnedClients / totalClients) * 100).toFixed(1) : 0,
    averageScoreImprovement: clientsWithImprovement > 0
      ? Math.round(totalImprovement / clientsWithImprovement)
      : 0,
    retentionRate: totalClients > 0
      ? (((totalClients - churnedClients) / totalClients) * 100).toFixed(1)
      : 100
  };
}

async function getRevenueKPIs(db, startDate) {
  // Get payments in period
  const paymentsSnapshot = await db.collection('payments')
    .where('createdAt', '>=', startDate)
    .where('status', '==', 'completed')
    .get();

  let totalRevenue = 0;
  let recurringRevenue = 0;
  let oneTimeRevenue = 0;
  const paymentsByDay = {};

  paymentsSnapshot.docs.forEach(doc => {
    const payment = doc.data();
    totalRevenue += payment.amount || 0;

    if (payment.type === 'recurring') {
      recurringRevenue += payment.amount || 0;
    } else {
      oneTimeRevenue += payment.amount || 0;
    }

    // Group by day for trend
    const day = payment.createdAt?.toDate?.().toISOString().slice(0, 10) ||
                new Date().toISOString().slice(0, 10);
    if (!paymentsByDay[day]) paymentsByDay[day] = 0;
    paymentsByDay[day] += payment.amount || 0;
  });

  // Get failed payments
  const failedPaymentsSnapshot = await db.collection('payments')
    .where('createdAt', '>=', startDate)
    .where('status', '==', 'failed')
    .get();

  // Calculate MRR (Monthly Recurring Revenue)
  const activeSubscriptions = await db.collection('subscriptions')
    .where('status', '==', 'active')
    .get();

  let mrr = 0;
  activeSubscriptions.docs.forEach(doc => {
    const sub = doc.data();
    mrr += sub.monthlyAmount || 0;
  });

  // Auto sales commissions
  const commissionsSnapshot = await db.collection('commissions')
    .where('soldAt', '>=', startDate)
    .get();

  let autoCommissions = 0;
  commissionsSnapshot.docs.forEach(doc => {
    autoCommissions += doc.data().myCommission || 0;
  });

  return {
    totalRevenue,
    recurringRevenue,
    oneTimeRevenue,
    mrr,
    arr: mrr * 12, // Annual Recurring Revenue
    failedPayments: failedPaymentsSnapshot.size,
    failedAmount: failedPaymentsSnapshot.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0),
    autoCommissions,
    totalIncome: totalRevenue + autoCommissions,
    trend: paymentsByDay
  };
}

async function getDisputeKPIs(db, startDate) {
  // All disputes in period
  const disputesSnapshot = await db.collection('disputes')
    .where('createdAt', '>=', startDate)
    .get();

  let totalDisputes = disputesSnapshot.size;
  let resolved = 0;
  let successful = 0;
  let pending = 0;
  let byBureau = { equifax: 0, experian: 0, transunion: 0 };
  let byType = {};
  let avgResolutionDays = 0;
  let totalResolutionDays = 0;
  let resolvedCount = 0;

  disputesSnapshot.docs.forEach(doc => {
    const dispute = doc.data();

    if (dispute.status === 'resolved' || dispute.status === 'completed') {
      resolved++;
      if (dispute.outcome === 'deleted' || dispute.outcome === 'updated' || dispute.outcome === 'verified_removed') {
        successful++;
      }

      // Calculate resolution time
      if (dispute.createdAt && dispute.resolvedAt) {
        const created = dispute.createdAt.toDate?.() || new Date(dispute.createdAt);
        const resolvedDate = dispute.resolvedAt.toDate?.() || new Date(dispute.resolvedAt);
        const days = Math.ceil((resolvedDate - created) / (1000 * 60 * 60 * 24));
        totalResolutionDays += days;
        resolvedCount++;
      }
    } else if (dispute.status === 'pending' || dispute.status === 'sent') {
      pending++;
    }

    // Count by bureau
    if (dispute.bureau) {
      const bureau = dispute.bureau.toLowerCase();
      if (byBureau[bureau] !== undefined) byBureau[bureau]++;
    }

    // Count by type
    const type = dispute.type || dispute.disputeType || 'other';
    if (!byType[type]) byType[type] = 0;
    byType[type]++;
  });

  if (resolvedCount > 0) {
    avgResolutionDays = Math.round(totalResolutionDays / resolvedCount);
  }

  return {
    total: totalDisputes,
    resolved,
    successful,
    pending,
    successRate: resolved > 0 ? ((successful / resolved) * 100).toFixed(1) : 0,
    avgResolutionDays,
    byBureau,
    byType
  };
}

async function getSatisfactionKPIs(db, startDate) {
  const surveysSnapshot = await db.collection('satisfactionSurveys')
    .where('completedAt', '>=', startDate)
    .where('status', '==', 'completed')
    .get();

  let promoters = 0, passives = 0, detractors = 0;
  let totalScore = 0;

  surveysSnapshot.docs.forEach(doc => {
    const survey = doc.data();
    const score = survey.npsScore;
    totalScore += score;

    if (score >= 9) promoters++;
    else if (score >= 7) passives++;
    else detractors++;
  });

  const total = surveysSnapshot.size;
  const npsScore = total > 0 ? Math.round(((promoters - detractors) / total) * 100) : null;

  // Review counts
  const reviewsSnapshot = await db.collection('reviewRequests')
    .where('completedAt', '>=', startDate)
    .where('status', '==', 'completed')
    .get();

  return {
    surveyResponses: total,
    npsScore,
    promoters,
    passives,
    detractors,
    avgRating: total > 0 ? (totalScore / total).toFixed(1) : null,
    reviewsReceived: reviewsSnapshot.size
  };
}

async function getAutoLeadKPIs(db, startDate) {
  const leadsSnapshot = await db.collection('autoLeads')
    .where('createdAt', '>=', startDate)
    .get();

  let totalLeads = leadsSnapshot.size;
  let newLeads = 0;
  let contacted = 0;
  let appointments = 0;
  let sold = 0;
  let lost = 0;
  let byType = { no_auto: 0, high_interest: 0, maturity: 0, prime: 0 };

  leadsSnapshot.docs.forEach(doc => {
    const lead = doc.data();

    switch (lead.status) {
      case 'new': newLeads++; break;
      case 'contacted': contacted++; break;
      case 'appointment_set':
      case 'showed': appointments++; break;
      case 'sold': sold++; break;
      case 'lost': lost++; break;
    }

    if (lead.opportunityType && byType[lead.opportunityType] !== undefined) {
      byType[lead.opportunityType]++;
    }
  });

  return {
    total: totalLeads,
    new: newLeads,
    contacted,
    appointments,
    sold,
    lost,
    conversionRate: totalLeads > 0 ? ((sold / totalLeads) * 100).toFixed(1) : 0,
    byType
  };
}

/**
 * Get revenue forecast
 */
exports.getRevenueForecast = onCall(
  { secrets: [openaiApiKey] },
  async (request) => {
    const db = getFirestore();
    const userId = request.auth?.uid;

    if (!userId) throw new HttpsError('unauthenticated', 'Must be logged in');

    // Get historical data
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const paymentsSnapshot = await db.collection('payments')
      .where('createdAt', '>=', sixMonthsAgo)
      .where('status', '==', 'completed')
      .get();

    // Group by month
    const monthlyRevenue = {};
    paymentsSnapshot.docs.forEach(doc => {
      const payment = doc.data();
      const month = payment.createdAt?.toDate?.().toISOString().slice(0, 7) ||
                    new Date().toISOString().slice(0, 7);
      if (!monthlyRevenue[month]) monthlyRevenue[month] = 0;
      monthlyRevenue[month] += payment.amount || 0;
    });

    // Get current client pipeline
    const pipelineSnapshot = await db.collection('clients')
      .where('status', '==', 'active')
      .get();

    const activeClients = pipelineSnapshot.size;

    // Get MRR
    const subscriptionsSnapshot = await db.collection('subscriptions')
      .where('status', '==', 'active')
      .get();

    let mrr = 0;
    subscriptionsSnapshot.docs.forEach(doc => {
      mrr += doc.data().monthlyAmount || 0;
    });

    // Simple forecast: MRR + growth trend
    const months = Object.keys(monthlyRevenue).sort();
    let growthRate = 0;
    if (months.length >= 2) {
      const recentMonth = monthlyRevenue[months[months.length - 1]];
      const previousMonth = monthlyRevenue[months[months.length - 2]];
      if (previousMonth > 0) {
        growthRate = ((recentMonth - previousMonth) / previousMonth) * 100;
      }
    }

    // Forecast next 3 months
    const forecast = [];
    let projectedMRR = mrr;
    for (let i = 1; i <= 3; i++) {
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + i);
      const monthKey = futureDate.toISOString().slice(0, 7);

      projectedMRR = projectedMRR * (1 + (growthRate / 100));
      forecast.push({
        month: monthKey,
        projected: Math.round(projectedMRR),
        low: Math.round(projectedMRR * 0.85),
        high: Math.round(projectedMRR * 1.15)
      });
    }

    return {
      historical: monthlyRevenue,
      currentMRR: mrr,
      activeClients,
      growthRate: growthRate.toFixed(1),
      forecast
    };
  }
);

// ============================================
// PAYMENT HEALTH MONITOR
// ============================================

/**
 * Analyze payment health and predict at-risk clients
 */
exports.analyzePaymentHealth = onCall(
  { secrets: [openaiApiKey] },
  async (request) => {
    const db = getFirestore();
    const userId = request.auth?.uid;

    if (!userId) throw new HttpsError('unauthenticated', 'Must be logged in');

    // Get all active subscriptions
    const subscriptionsSnapshot = await db.collection('subscriptions')
      .where('status', '==', 'active')
      .get();

    const healthReport = {
      healthy: [],
      atRisk: [],
      critical: [],
      pastDue: []
    };

    for (const subDoc of subscriptionsSnapshot.docs) {
      const subscription = subDoc.data();
      const clientId = subscription.clientId;

      // Get payment history
      const paymentsSnapshot = await db.collection('payments')
        .where('clientId', '==', clientId)
        .orderBy('createdAt', 'desc')
        .limit(6)
        .get();

      const payments = paymentsSnapshot.docs.map(doc => doc.data());

      // Calculate risk factors
      let riskScore = 0;
      let failedCount = 0;
      let lateCount = 0;
      let declinedCount = 0;

      payments.forEach(payment => {
        if (payment.status === 'failed') {
          failedCount++;
          riskScore += 25;
        }
        if (payment.status === 'declined') {
          declinedCount++;
          riskScore += 30;
        }
        if (payment.wasLate) {
          lateCount++;
          riskScore += 10;
        }
      });

      // Check if currently past due
      const now = new Date();
      const nextDue = subscription.nextPaymentDate?.toDate?.() || new Date(subscription.nextPaymentDate);
      const daysPastDue = Math.floor((now - nextDue) / (1000 * 60 * 60 * 24));

      if (daysPastDue > 0) {
        riskScore += daysPastDue * 5;
      }

      // Get client info
      const clientDoc = await db.collection('clients').doc(clientId).get();
      const client = clientDoc.exists ? clientDoc.data() : {};

      const record = {
        subscriptionId: subDoc.id,
        clientId,
        clientName: client.name || client.firstName || 'Unknown',
        clientEmail: client.email,
        monthlyAmount: subscription.monthlyAmount,
        nextPaymentDate: nextDue,
        daysPastDue: daysPastDue > 0 ? daysPastDue : 0,
        riskScore: Math.min(riskScore, 100),
        failedPayments: failedCount,
        latePayments: lateCount,
        declinedPayments: declinedCount,
        lastPaymentDate: payments[0]?.createdAt || null,
        recommendations: []
      };

      // Generate recommendations
      if (failedCount >= 2) {
        record.recommendations.push('Update payment method on file');
      }
      if (lateCount >= 3) {
        record.recommendations.push('Consider alternative payment date');
      }
      if (daysPastDue > 7) {
        record.recommendations.push('Immediate outreach required');
      }
      if (riskScore >= 50) {
        record.recommendations.push('Offer payment plan restructuring');
      }

      // Categorize
      if (daysPastDue > 0) {
        healthReport.pastDue.push(record);
      } else if (riskScore >= 60) {
        healthReport.critical.push(record);
      } else if (riskScore >= 30) {
        healthReport.atRisk.push(record);
      } else {
        healthReport.healthy.push(record);
      }
    }

    // Sort by risk
    healthReport.critical.sort((a, b) => b.riskScore - a.riskScore);
    healthReport.atRisk.sort((a, b) => b.riskScore - a.riskScore);
    healthReport.pastDue.sort((a, b) => b.daysPastDue - a.daysPastDue);

    return {
      summary: {
        total: subscriptionsSnapshot.size,
        healthy: healthReport.healthy.length,
        atRisk: healthReport.atRisk.length,
        critical: healthReport.critical.length,
        pastDue: healthReport.pastDue.length,
        atRiskRevenue: healthReport.atRisk.reduce((sum, r) => sum + r.monthlyAmount, 0) +
                       healthReport.critical.reduce((sum, r) => sum + r.monthlyAmount, 0) +
                       healthReport.pastDue.reduce((sum, r) => sum + r.monthlyAmount, 0)
      },
      ...healthReport
    };
  }
);

/**
 * Check for upcoming payment issues (scheduled daily at 6 AM)
 */
exports.checkPaymentHealth = onSchedule('0 6 * * *', async (event) => {
  const db = getFirestore();

  // Get subscriptions with payment due in next 3 days
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

  const upcomingSnapshot = await db.collection('subscriptions')
    .where('status', '==', 'active')
    .where('nextPaymentDate', '<=', threeDaysFromNow)
    .get();

  const alerts = [];

  for (const subDoc of upcomingSnapshot.docs) {
    const subscription = subDoc.data();

    // Check for previous failures
    const failedPayments = await db.collection('payments')
      .where('clientId', '==', subscription.clientId)
      .where('status', '==', 'failed')
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();

    if (!failedPayments.empty) {
      const lastFailed = failedPayments.docs[0].data();
      const daysSinceFailure = Math.floor(
        (new Date() - (lastFailed.createdAt?.toDate?.() || new Date())) /
        (1000 * 60 * 60 * 24)
      );

      if (daysSinceFailure < 30) {
        alerts.push({
          type: 'payment_risk',
          subscriptionId: subDoc.id,
          clientId: subscription.clientId,
          reason: 'Recent payment failure',
          severity: 'high'
        });
      }
    }
  }

  // Log alerts for follow-up
  if (alerts.length > 0) {
    await db.collection('paymentAlerts').add({
      alerts,
      createdAt: FieldValue.serverTimestamp(),
      processed: false
    });
  }

  console.log(`Payment health check: ${alerts.length} alerts generated`);
});

// ============================================
// DISPUTE SUCCESS PATTERN ANALYZER
// ============================================

/**
 * Analyze dispute patterns for success optimization
 */
exports.analyzeDisputePatterns = onCall(
  { secrets: [openaiApiKey] },
  async (request) => {
    const db = getFirestore();
    const userId = request.auth?.uid;

    if (!userId) throw new HttpsError('unauthenticated', 'Must be logged in');

    // Get resolved disputes
    const disputesSnapshot = await db.collection('disputes')
      .where('status', 'in', ['resolved', 'completed'])
      .get();

    const patterns = {
      byBureau: {
        equifax: { total: 0, successful: 0, successRate: 0, avgDays: 0 },
        experian: { total: 0, successful: 0, successRate: 0, avgDays: 0 },
        transunion: { total: 0, successful: 0, successRate: 0, avgDays: 0 }
      },
      byType: {},
      byReason: {},
      byMonth: {},
      bestStrategies: [],
      worstPerforming: [],
      recommendations: []
    };

    const bureauDays = { equifax: [], experian: [], transunion: [] };

    disputesSnapshot.docs.forEach(doc => {
      const dispute = doc.data();
      const bureau = (dispute.bureau || '').toLowerCase();
      const type = dispute.type || dispute.disputeType || 'general';
      const reason = dispute.reason || dispute.disputeReason || 'unspecified';
      const isSuccess = ['deleted', 'updated', 'verified_removed'].includes(dispute.outcome);

      // Bureau analysis
      if (patterns.byBureau[bureau]) {
        patterns.byBureau[bureau].total++;
        if (isSuccess) patterns.byBureau[bureau].successful++;

        // Resolution time
        if (dispute.createdAt && dispute.resolvedAt) {
          const created = dispute.createdAt.toDate?.() || new Date(dispute.createdAt);
          const resolved = dispute.resolvedAt.toDate?.() || new Date(dispute.resolvedAt);
          const days = Math.ceil((resolved - created) / (1000 * 60 * 60 * 24));
          bureauDays[bureau].push(days);
        }
      }

      // Type analysis
      if (!patterns.byType[type]) {
        patterns.byType[type] = { total: 0, successful: 0 };
      }
      patterns.byType[type].total++;
      if (isSuccess) patterns.byType[type].successful++;

      // Reason analysis
      if (!patterns.byReason[reason]) {
        patterns.byReason[reason] = { total: 0, successful: 0 };
      }
      patterns.byReason[reason].total++;
      if (isSuccess) patterns.byReason[reason].successful++;

      // Monthly analysis
      const month = dispute.createdAt?.toDate?.().toISOString().slice(0, 7) ||
                    new Date().toISOString().slice(0, 7);
      if (!patterns.byMonth[month]) {
        patterns.byMonth[month] = { total: 0, successful: 0 };
      }
      patterns.byMonth[month].total++;
      if (isSuccess) patterns.byMonth[month].successful++;
    });

    // Calculate rates and averages
    Object.keys(patterns.byBureau).forEach(bureau => {
      const data = patterns.byBureau[bureau];
      data.successRate = data.total > 0
        ? ((data.successful / data.total) * 100).toFixed(1)
        : 0;
      data.avgDays = bureauDays[bureau].length > 0
        ? Math.round(bureauDays[bureau].reduce((a, b) => a + b, 0) / bureauDays[bureau].length)
        : 0;
    });

    Object.keys(patterns.byType).forEach(type => {
      const data = patterns.byType[type];
      data.successRate = data.total > 0
        ? ((data.successful / data.total) * 100).toFixed(1)
        : 0;
    });

    Object.keys(patterns.byReason).forEach(reason => {
      const data = patterns.byReason[reason];
      data.successRate = data.total > 0
        ? ((data.successful / data.total) * 100).toFixed(1)
        : 0;
    });

    // Find best and worst strategies
    const typesSorted = Object.entries(patterns.byType)
      .filter(([_, data]) => data.total >= 5) // Minimum sample size
      .sort((a, b) => parseFloat(b[1].successRate) - parseFloat(a[1].successRate));

    patterns.bestStrategies = typesSorted.slice(0, 5).map(([type, data]) => ({
      type,
      ...data
    }));

    patterns.worstPerforming = typesSorted.slice(-5).reverse().map(([type, data]) => ({
      type,
      ...data
    }));

    // Generate AI recommendations
    patterns.recommendations = await generateDisputeRecommendations(patterns, openaiApiKey.value());

    return patterns;
  }
);

async function generateDisputeRecommendations(patterns, apiKey) {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a credit repair strategy expert. Analyze dispute patterns and provide actionable recommendations.'
          },
          {
            role: 'user',
            content: `Analyze these dispute patterns and provide 5 specific recommendations:

Bureau Performance:
${JSON.stringify(patterns.byBureau, null, 2)}

Best Performing Dispute Types:
${JSON.stringify(patterns.bestStrategies, null, 2)}

Worst Performing:
${JSON.stringify(patterns.worstPerforming, null, 2)}

Return as JSON array of strings with actionable recommendations.`
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7
      })
    });

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    return result.recommendations || [];
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return [
      'Focus on high-success dispute types to improve overall win rate',
      'Review low-performing dispute reasons for strategy adjustments',
      'Consider timing optimizations based on bureau response patterns'
    ];
  }
}

/**
 * Get dispute letter effectiveness
 */
exports.getLetterEffectiveness = onCall(async (request) => {
  const db = getFirestore();
  const userId = request.auth?.uid;

  if (!userId) throw new HttpsError('unauthenticated', 'Must be logged in');

  const disputesSnapshot = await db.collection('disputes')
    .where('status', 'in', ['resolved', 'completed'])
    .get();

  const letterStats = {};

  disputesSnapshot.docs.forEach(doc => {
    const dispute = doc.data();
    const letterType = dispute.letterType || dispute.templateUsed || 'standard';
    const isSuccess = ['deleted', 'updated', 'verified_removed'].includes(dispute.outcome);

    if (!letterStats[letterType]) {
      letterStats[letterType] = { total: 0, successful: 0, successRate: 0 };
    }
    letterStats[letterType].total++;
    if (isSuccess) letterStats[letterType].successful++;
  });

  // Calculate rates
  Object.keys(letterStats).forEach(letter => {
    const data = letterStats[letter];
    data.successRate = data.total > 0
      ? ((data.successful / data.total) * 100).toFixed(1)
      : 0;
  });

  // Sort by success rate
  const sorted = Object.entries(letterStats)
    .sort((a, b) => parseFloat(b[1].successRate) - parseFloat(a[1].successRate))
    .map(([letter, stats]) => ({ letterType: letter, ...stats }));

  return { letterEffectiveness: sorted };
});
