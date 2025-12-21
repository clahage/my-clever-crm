// ============================================================================
// AI BUSINESS INTELLIGENCE ENGINE
// ============================================================================
// Advanced AI-powered business analytics, forecasting, and automation
// Revenue prediction, churn analysis, client insights, and more
// ============================================================================

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');
const OpenAI = require('openai');

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const OPENAI_API_KEY = defineSecret('OPENAI_API_KEY');

// ============================================================================
// 1. REVENUE FORECASTER - PREDICT MRR AND GROWTH
// ============================================================================
exports.forecastRevenue = onCall(
  { secrets: [OPENAI_API_KEY], memory: '1GiB', timeoutSeconds: 120 },
  async (request) => {
    const { months = 6, includeScenarios = true } = request.data;

    try {
      // Gather historical revenue data
      const now = new Date();
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);

      // Get all payments from last 6 months
      const paymentsQuery = await db.collection('payments')
        .where('createdAt', '>=', sixMonthsAgo)
        .orderBy('createdAt', 'desc')
        .get();

      const payments = paymentsQuery.docs.map(d => ({ id: d.id, ...d.data() }));

      // Get active subscriptions/contracts
      const contractsQuery = await db.collection('contracts')
        .where('status', '==', 'active')
        .get();

      const activeContracts = contractsQuery.docs.map(d => ({ id: d.id, ...d.data() }));

      // Get client acquisition rate
      const clientsQuery = await db.collection('contacts')
        .where('type', '==', 'client')
        .where('createdAt', '>=', sixMonthsAgo)
        .get();

      const newClients = clientsQuery.docs.map(d => ({ id: d.id, ...d.data() }));

      // Calculate monthly revenue breakdown
      const monthlyRevenue = {};
      payments.forEach(payment => {
        if (payment.amount && payment.createdAt) {
          const date = payment.createdAt.toDate ? payment.createdAt.toDate() : new Date(payment.createdAt);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + (payment.amount || 0);
        }
      });

      // Calculate current MRR
      const currentMRR = activeContracts.reduce((sum, contract) => {
        return sum + (contract.monthlyAmount || contract.amount || 0);
      }, 0);

      // Calculate average new clients per month
      const avgNewClientsPerMonth = newClients.length / 6;

      // Calculate churn rate (contracts ended / total)
      const churnedQuery = await db.collection('contracts')
        .where('status', '==', 'cancelled')
        .where('cancelledAt', '>=', sixMonthsAgo)
        .get();

      const churnedContracts = churnedQuery.size;
      const churnRate = activeContracts.length > 0
        ? churnedContracts / (activeContracts.length + churnedContracts)
        : 0;

      // Use AI for advanced forecasting
      const openai = new OpenAI({ apiKey: OPENAI_API_KEY.value() });

      const forecast = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are a financial analyst AI specializing in SaaS/subscription business forecasting. Analyze revenue data and provide accurate forecasts with multiple scenarios.`
          },
          {
            role: 'user',
            content: `Analyze this credit repair business data and forecast revenue:

CURRENT STATE:
- Monthly Recurring Revenue (MRR): $${currentMRR.toLocaleString()}
- Active Contracts: ${activeContracts.length}
- Average Contract Value: $${activeContracts.length > 0 ? Math.round(currentMRR / activeContracts.length) : 0}
- Monthly Churn Rate: ${(churnRate * 100).toFixed(1)}%
- New Clients/Month (avg): ${avgNewClientsPerMonth.toFixed(1)}

HISTORICAL MONTHLY REVENUE:
${JSON.stringify(monthlyRevenue, null, 2)}

Forecast the next ${months} months. Return JSON:
{
  "currentMRR": number,
  "projectedMRR": {
    "month1": number,
    "month2": number,
    "month3": number,
    "month4": number,
    "month5": number,
    "month6": number
  },
  "annualRecurringRevenue": number,
  "projectedAnnualRevenue": number,
  "growthRate": number,
  "scenarios": {
    "optimistic": {
      "mrr": number,
      "assumptions": "string"
    },
    "realistic": {
      "mrr": number,
      "assumptions": "string"
    },
    "conservative": {
      "mrr": number,
      "assumptions": "string"
    }
  },
  "keyMetrics": {
    "customerLifetimeValue": number,
    "customerAcquisitionCost": number,
    "paybackPeriod": "string",
    "netRevenueRetention": number
  },
  "recommendations": [
    { "action": "string", "impact": "string", "priority": "high|medium|low" }
  ],
  "riskFactors": ["string"],
  "opportunities": ["string"]
}`
          }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      });

      const forecastData = JSON.parse(forecast.choices[0].message.content);

      // Store forecast for historical tracking
      await db.collection('revenuForecasts').add({
        forecast: forecastData,
        generatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: request.auth?.uid || 'system',
        dataPoints: {
          payments: payments.length,
          activeContracts: activeContracts.length,
          newClients: newClients.length,
        }
      });

      return {
        success: true,
        ...forecastData,
        historicalRevenue: monthlyRevenue,
        dataPoints: {
          paymentsAnalyzed: payments.length,
          activeContracts: activeContracts.length,
          newClientsLast6Mo: newClients.length,
        },
        generatedAt: new Date().toISOString(),
      };

    } catch (error) {
      console.error('Revenue forecast error:', error);
      throw new HttpsError('internal', error.message);
    }
  }
);

// ============================================================================
// 2. CLIENT CHURN PREDICTOR - IDENTIFY AT-RISK CLIENTS
// ============================================================================
exports.predictChurn = onCall(
  { secrets: [OPENAI_API_KEY], memory: '1GiB', timeoutSeconds: 120 },
  async (request) => {
    const { limit = 50 } = request.data;

    try {
      // Get all active clients
      const clientsQuery = await db.collection('contacts')
        .where('type', '==', 'client')
        .where('status', '==', 'active')
        .limit(limit)
        .get();

      const clients = clientsQuery.docs.map(d => ({ id: d.id, ...d.data() }));

      // Analyze each client for churn risk
      const clientRiskAnalysis = await Promise.all(clients.map(async (client) => {
        // Get client's recent activity
        const activityQuery = await db.collection('activities')
          .where('clientId', '==', client.id)
          .orderBy('createdAt', 'desc')
          .limit(20)
          .get();

        const activities = activityQuery.docs.map(d => d.data());

        // Get payment history
        const paymentsQuery = await db.collection('payments')
          .where('clientId', '==', client.id)
          .orderBy('createdAt', 'desc')
          .limit(10)
          .get();

        const payments = paymentsQuery.docs.map(d => d.data());

        // Get dispute progress
        const disputesQuery = await db.collection('disputes')
          .where('clientId', '==', client.id)
          .get();

        const disputes = disputesQuery.docs.map(d => d.data());

        // Calculate risk factors
        const riskFactors = [];
        let riskScore = 0;

        // No activity in 14+ days
        const lastActivity = activities[0]?.createdAt;
        if (lastActivity) {
          const daysSinceActivity = (Date.now() - (lastActivity.toDate ? lastActivity.toDate().getTime() : new Date(lastActivity).getTime())) / (1000 * 60 * 60 * 24);
          if (daysSinceActivity > 30) {
            riskScore += 30;
            riskFactors.push('No activity in 30+ days');
          } else if (daysSinceActivity > 14) {
            riskScore += 15;
            riskFactors.push('No activity in 14+ days');
          }
        } else {
          riskScore += 20;
          riskFactors.push('No recorded activity');
        }

        // Payment issues
        const failedPayments = payments.filter(p => p.status === 'failed').length;
        if (failedPayments > 0) {
          riskScore += failedPayments * 15;
          riskFactors.push(`${failedPayments} failed payment(s)`);
        }

        // Late payments
        const latePayments = payments.filter(p => p.isLate).length;
        if (latePayments > 2) {
          riskScore += 20;
          riskFactors.push('Multiple late payments');
        }

        // No dispute progress
        const resolvedDisputes = disputes.filter(d => d.status === 'completed').length;
        const totalDisputes = disputes.length;
        if (totalDisputes > 0 && resolvedDisputes === 0) {
          riskScore += 25;
          riskFactors.push('No resolved disputes yet');
        }

        // Contract ending soon
        if (client.contractEndDate) {
          const daysUntilEnd = (new Date(client.contractEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
          if (daysUntilEnd < 30 && daysUntilEnd > 0) {
            riskScore += 20;
            riskFactors.push('Contract ending within 30 days');
          }
        }

        // Normalize risk score (0-100)
        riskScore = Math.min(100, riskScore);

        return {
          clientId: client.id,
          clientName: `${client.firstName || ''} ${client.lastName || ''}`.trim() || client.email,
          email: client.email,
          phone: client.phone,
          riskScore,
          riskLevel: riskScore >= 70 ? 'critical' : riskScore >= 50 ? 'high' : riskScore >= 30 ? 'medium' : 'low',
          riskFactors,
          recentActivityCount: activities.length,
          disputeProgress: totalDisputes > 0 ? `${resolvedDisputes}/${totalDisputes}` : 'None',
          paymentStatus: failedPayments > 0 ? 'Issues' : 'Good',
          recommendedActions: getRetentionActions(riskScore, riskFactors),
        };
      }));

      // Sort by risk score (highest first)
      clientRiskAnalysis.sort((a, b) => b.riskScore - a.riskScore);

      // Calculate overall stats
      const criticalRisk = clientRiskAnalysis.filter(c => c.riskLevel === 'critical').length;
      const highRisk = clientRiskAnalysis.filter(c => c.riskLevel === 'high').length;
      const mediumRisk = clientRiskAnalysis.filter(c => c.riskLevel === 'medium').length;
      const lowRisk = clientRiskAnalysis.filter(c => c.riskLevel === 'low').length;

      const avgRiskScore = clientRiskAnalysis.reduce((sum, c) => sum + c.riskScore, 0) / clientRiskAnalysis.length;

      return {
        success: true,
        clients: clientRiskAnalysis,
        summary: {
          totalAnalyzed: clientRiskAnalysis.length,
          criticalRisk,
          highRisk,
          mediumRisk,
          lowRisk,
          averageRiskScore: Math.round(avgRiskScore),
          estimatedChurnRisk: `${((criticalRisk + highRisk) / clientRiskAnalysis.length * 100).toFixed(1)}%`,
        },
        generatedAt: new Date().toISOString(),
      };

    } catch (error) {
      console.error('Churn prediction error:', error);
      throw new HttpsError('internal', error.message);
    }
  }
);

// ============================================================================
// 3. AI EMAIL/SMS COMPOSER - PERSONALIZED OUTREACH
// ============================================================================
exports.composeMessage = onCall(
  { secrets: [OPENAI_API_KEY], memory: '512MiB', timeoutSeconds: 60 },
  async (request) => {
    const {
      clientId,
      messageType, // welcome, follow_up, payment_reminder, progress_update, re_engagement, celebration
      channel, // email, sms
      customContext,
      tone // professional, friendly, urgent
    } = request.data;

    if (!clientId || !messageType) {
      throw new HttpsError('invalid-argument', 'Client ID and message type required');
    }

    try {
      // Get client data
      const clientDoc = await db.collection('contacts').doc(clientId).get();
      if (!clientDoc.exists) {
        throw new HttpsError('not-found', 'Client not found');
      }

      const client = clientDoc.data();

      // Get additional context
      let disputeContext = '';
      let paymentContext = '';
      let scoreContext = '';

      // Get dispute progress
      const disputesQuery = await db.collection('disputes')
        .where('clientId', '==', clientId)
        .get();

      const disputes = disputesQuery.docs.map(d => d.data());
      const completed = disputes.filter(d => d.status === 'completed').length;
      const deleted = disputes.filter(d => d.result === 'deleted').length;
      disputeContext = `${completed}/${disputes.length} disputes resolved, ${deleted} items deleted`;

      // Get latest credit score
      const reportQuery = await db.collection('creditReports')
        .where('clientId', '==', clientId)
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get();

      if (!reportQuery.empty) {
        const report = reportQuery.docs[0].data();
        const scores = report.parsedData?.scores;
        if (scores) {
          const avg = Math.round((scores.experian + scores.equifax + scores.transunion) / 3);
          scoreContext = `Current average score: ${avg}`;
        }
      }

      const openai = new OpenAI({ apiKey: OPENAI_API_KEY.value() });

      const messagePrompts = {
        welcome: 'Welcome the client to the credit repair program, set expectations, and express enthusiasm about helping them.',
        follow_up: 'Check in on the client, ask if they have questions, remind them of next steps.',
        payment_reminder: 'Gently remind about upcoming or past due payment, offer help if needed.',
        progress_update: 'Share exciting progress on their credit repair journey, celebrate wins.',
        re_engagement: 'Re-engage an inactive client, show you care, remind them of the value.',
        celebration: 'Celebrate a major win (deleted items, score increase, goal achieved).',
        dispute_update: 'Update client on dispute status and next steps.',
        appointment_reminder: 'Remind about an upcoming appointment or call.',
      };

      const composition = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are a professional credit repair company communication specialist. Write personalized, engaging messages that build trust and maintain client relationships.

            Company: Speedy Credit Repair
            Tone: ${tone || 'professional yet friendly'}
            Channel: ${channel || 'email'}

            For SMS: Keep under 160 characters when possible, max 2 messages.
            For Email: Include subject line, proper greeting, body, and signature.`
          },
          {
            role: 'user',
            content: `Compose a ${messageType} message for this client:

CLIENT INFO:
- Name: ${client.firstName} ${client.lastName}
- Email: ${client.email}
- Program Start: ${client.createdAt ? new Date(client.createdAt.toDate ? client.createdAt.toDate() : client.createdAt).toLocaleDateString() : 'N/A'}

CREDIT REPAIR PROGRESS:
- Disputes: ${disputeContext}
- Score: ${scoreContext}

${customContext ? `ADDITIONAL CONTEXT: ${customContext}` : ''}

MESSAGE PURPOSE: ${messagePrompts[messageType] || 'General communication'}

Return JSON:
{
  "subject": "email subject line (for email only)",
  "message": "the full message content",
  "shortVersion": "SMS-friendly version under 160 chars (for SMS)",
  "callToAction": "what you want them to do",
  "followUpTiming": "when to follow up if no response",
  "alternateVersions": [
    { "tone": "string", "message": "alternate version" }
  ]
}`
          }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      });

      const result = JSON.parse(composition.choices[0].message.content);

      // Log for analytics
      await db.collection('aiComposedMessages').add({
        clientId,
        messageType,
        channel,
        composedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: request.auth?.uid || 'system',
      });

      return {
        success: true,
        ...result,
        clientName: `${client.firstName} ${client.lastName}`,
      };

    } catch (error) {
      console.error('Message composition error:', error);
      throw new HttpsError('internal', error.message);
    }
  }
);

// ============================================================================
// 4. CREDIT UTILIZATION OPTIMIZER
// ============================================================================
exports.optimizeUtilization = onCall(
  { secrets: [OPENAI_API_KEY], memory: '512MiB', timeoutSeconds: 90 },
  async (request) => {
    const { clientId } = request.data;

    if (!clientId) {
      throw new HttpsError('invalid-argument', 'Client ID required');
    }

    try {
      // Get latest credit report
      const reportQuery = await db.collection('creditReports')
        .where('clientId', '==', clientId)
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get();

      if (reportQuery.empty) {
        throw new HttpsError('not-found', 'No credit report found');
      }

      const report = reportQuery.docs[0].data();
      const { parsedData } = report;

      if (!parsedData?.accounts) {
        throw new HttpsError('not-found', 'No account data in credit report');
      }

      // Filter revolving accounts (credit cards)
      const revolvingAccounts = parsedData.accounts.filter(acc =>
        acc.accountType?.toLowerCase().includes('revolving') ||
        acc.accountType?.toLowerCase().includes('credit card') ||
        acc.type?.toLowerCase().includes('credit')
      );

      // Calculate current utilization
      let totalCredit = 0;
      let totalBalance = 0;
      const accountDetails = revolvingAccounts.map(acc => {
        const limit = acc.creditLimit || acc.limit || 0;
        const balance = acc.balance || 0;
        totalCredit += limit;
        totalBalance += balance;

        const utilization = limit > 0 ? (balance / limit) * 100 : 0;

        return {
          creditor: acc.creditor || acc.name,
          limit,
          balance,
          utilization: Math.round(utilization),
          status: acc.status,
        };
      });

      const overallUtilization = totalCredit > 0 ? (totalBalance / totalCredit) * 100 : 0;

      const openai = new OpenAI({ apiKey: OPENAI_API_KEY.value() });

      const optimization = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are a credit utilization optimization expert. Analyze credit card balances and provide specific paydown strategies to maximize credit score improvement.

            Key facts:
            - Optimal utilization is under 10% (best), under 30% is good
            - Individual card utilization matters, not just overall
            - Paying down highest utilization cards first often best
            - Utilization updates when statement cuts, not when payment posts
            - Credit limit increases can help but require hard inquiry`
          },
          {
            role: 'user',
            content: `Analyze this client's credit utilization and create an optimization plan:

CURRENT ACCOUNTS:
${JSON.stringify(accountDetails, null, 2)}

TOTALS:
- Total Credit Limit: $${totalCredit.toLocaleString()}
- Total Balance: $${totalBalance.toLocaleString()}
- Overall Utilization: ${overallUtilization.toFixed(1)}%

Create an optimization strategy. Return JSON:
{
  "currentStatus": {
    "overallUtilization": number,
    "utilizationRating": "excellent|good|fair|poor",
    "estimatedScoreImpact": "string"
  },
  "targetUtilization": number,
  "paydownPlan": [
    {
      "creditor": "string",
      "currentBalance": number,
      "targetBalance": number,
      "paymentNeeded": number,
      "priority": 1,
      "reason": "why this card first"
    }
  ],
  "totalPaymentNeeded": number,
  "projectedScoreIncrease": {
    "atTargetUtilization": number,
    "at10Percent": number,
    "at1Percent": number
  },
  "quickWins": [
    { "action": "string", "impact": "string" }
  ],
  "advancedStrategies": [
    { "strategy": "string", "description": "string", "risk": "low|medium|high" }
  ],
  "statementCycleStrategy": "string",
  "warningsAndTips": ["string"]
}`
          }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      });

      const result = JSON.parse(optimization.choices[0].message.content);

      return {
        success: true,
        ...result,
        accounts: accountDetails,
        generatedAt: new Date().toISOString(),
      };

    } catch (error) {
      console.error('Utilization optimization error:', error);
      throw new HttpsError('internal', error.message);
    }
  }
);

// ============================================================================
// 5. AI WORKFLOW AUTOMATOR - SMART TRIGGERS
// ============================================================================
exports.analyzeAndTriggerWorkflows = onCall(
  { secrets: [OPENAI_API_KEY], memory: '512MiB', timeoutSeconds: 60 },
  async (request) => {
    const { clientId, eventType, eventData } = request.data;

    try {
      // Get client data
      const clientDoc = await db.collection('contacts').doc(clientId).get();
      const client = clientDoc.exists ? clientDoc.data() : null;

      // Get workflow rules
      const rulesQuery = await db.collection('workflowRules')
        .where('active', '==', true)
        .get();

      const rules = rulesQuery.docs.map(d => ({ id: d.id, ...d.data() }));

      // Determine which workflows to trigger
      const triggeredWorkflows = [];

      for (const rule of rules) {
        if (rule.triggerEvent === eventType) {
          // Check conditions
          let shouldTrigger = true;

          if (rule.conditions) {
            for (const condition of rule.conditions) {
              const value = eventData?.[condition.field] || client?.[condition.field];
              switch (condition.operator) {
                case 'equals':
                  shouldTrigger = value === condition.value;
                  break;
                case 'greaterThan':
                  shouldTrigger = value > condition.value;
                  break;
                case 'lessThan':
                  shouldTrigger = value < condition.value;
                  break;
                case 'contains':
                  shouldTrigger = String(value).includes(condition.value);
                  break;
              }
              if (!shouldTrigger) break;
            }
          }

          if (shouldTrigger) {
            triggeredWorkflows.push({
              ruleId: rule.id,
              ruleName: rule.name,
              actions: rule.actions,
            });
          }
        }
      }

      // Execute triggered workflows
      for (const workflow of triggeredWorkflows) {
        for (const action of workflow.actions) {
          await executeWorkflowAction(action, clientId, client, eventData);
        }

        // Log execution
        await db.collection('workflowExecutions').add({
          ruleId: workflow.ruleId,
          clientId,
          eventType,
          executedAt: admin.firestore.FieldValue.serverTimestamp(),
          status: 'completed',
        });
      }

      return {
        success: true,
        triggeredWorkflows: triggeredWorkflows.length,
        workflows: triggeredWorkflows.map(w => w.ruleName),
      };

    } catch (error) {
      console.error('Workflow automation error:', error);
      throw new HttpsError('internal', error.message);
    }
  }
);

// ============================================================================
// 6. AI BUSINESS INSIGHTS GENERATOR
// ============================================================================
exports.generateBusinessInsights = onCall(
  { secrets: [OPENAI_API_KEY], memory: '1GiB', timeoutSeconds: 180 },
  async (request) => {
    try {
      // Gather comprehensive business data
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Get clients
      const [activeClients, newClients, allContacts] = await Promise.all([
        db.collection('contacts').where('type', '==', 'client').where('status', '==', 'active').get(),
        db.collection('contacts').where('type', '==', 'client').where('createdAt', '>=', thirtyDaysAgo).get(),
        db.collection('contacts').get(),
      ]);

      // Get disputes
      const [allDisputes, recentDisputes] = await Promise.all([
        db.collection('disputes').get(),
        db.collection('disputes').where('createdAt', '>=', thirtyDaysAgo).get(),
      ]);

      // Get payments
      const recentPayments = await db.collection('payments')
        .where('createdAt', '>=', thirtyDaysAgo)
        .get();

      // Calculate metrics
      const metrics = {
        totalContacts: allContacts.size,
        activeClients: activeClients.size,
        newClientsThisMonth: newClients.size,
        totalDisputes: allDisputes.size,
        disputesThisMonth: recentDisputes.size,
        completedDisputes: allDisputes.docs.filter(d => d.data().status === 'completed').length,
        deletedItems: allDisputes.docs.filter(d => d.data().result === 'deleted').length,
        revenueThisMonth: recentPayments.docs.reduce((sum, d) => sum + (d.data().amount || 0), 0),
      };

      // Calculate success rate
      metrics.disputeSuccessRate = metrics.completedDisputes > 0
        ? (metrics.deletedItems / metrics.completedDisputes * 100).toFixed(1)
        : 0;

      const openai = new OpenAI({ apiKey: OPENAI_API_KEY.value() });

      const insights = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are a business intelligence analyst for a credit repair company. Analyze metrics and provide actionable insights, identify trends, and suggest improvements.`
          },
          {
            role: 'user',
            content: `Analyze these business metrics and generate insights:

METRICS (Last 30 Days):
${JSON.stringify(metrics, null, 2)}

Generate comprehensive business insights. Return JSON:
{
  "executiveSummary": "2-3 sentence overview",
  "keyPerformanceIndicators": [
    { "metric": "string", "value": "string", "trend": "up|down|stable", "insight": "string" }
  ],
  "strengthsIdentified": ["string"],
  "areasForImprovement": ["string"],
  "opportunities": [
    { "opportunity": "string", "potentialImpact": "string", "effort": "low|medium|high" }
  ],
  "risks": [
    { "risk": "string", "severity": "low|medium|high", "mitigation": "string" }
  ],
  "recommendations": [
    { "recommendation": "string", "priority": "immediate|short-term|long-term", "expectedOutcome": "string" }
  ],
  "benchmarkComparison": {
    "industryAvgSuccessRate": number,
    "yourSuccessRate": number,
    "verdict": "string"
  },
  "actionItems": [
    { "action": "string", "owner": "string", "deadline": "string" }
  ]
}`
          }
        ],
        temperature: 0.4,
        response_format: { type: 'json_object' }
      });

      const insightsData = JSON.parse(insights.choices[0].message.content);

      // Store insights
      await db.collection('businessInsights').add({
        insights: insightsData,
        metrics,
        generatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: request.auth?.uid || 'system',
      });

      return {
        success: true,
        metrics,
        ...insightsData,
        generatedAt: new Date().toISOString(),
      };

    } catch (error) {
      console.error('Business insights error:', error);
      throw new HttpsError('internal', error.message);
    }
  }
);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getRetentionActions(riskScore, riskFactors) {
  const actions = [];

  if (riskScore >= 70) {
    actions.push('Immediate outreach call from manager');
    actions.push('Offer personalized consultation');
    actions.push('Review contract terms for flexibility');
  }

  if (riskFactors.includes('No activity in 30+ days')) {
    actions.push('Send re-engagement email with progress summary');
    actions.push('Schedule check-in call');
  }

  if (riskFactors.some(f => f.includes('failed payment'))) {
    actions.push('Offer payment plan options');
    actions.push('Verify payment method is current');
  }

  if (riskFactors.includes('No resolved disputes yet')) {
    actions.push('Prioritize their disputes');
    actions.push('Send detailed progress update');
  }

  if (riskFactors.includes('Contract ending within 30 days')) {
    actions.push('Initiate renewal conversation');
    actions.push('Highlight achievements and remaining work');
  }

  if (actions.length === 0) {
    actions.push('Standard check-in communication');
    actions.push('Continue monitoring');
  }

  return actions;
}

async function executeWorkflowAction(action, clientId, client, eventData) {
  switch (action.type) {
    case 'send_email':
      // Queue email
      await db.collection('emailQueue').add({
        to: client?.email,
        template: action.template,
        data: { ...client, ...eventData },
        scheduledFor: admin.firestore.FieldValue.serverTimestamp(),
        status: 'pending',
      });
      break;

    case 'send_sms':
      // Queue SMS
      await db.collection('smsQueue').add({
        to: client?.phone,
        template: action.template,
        data: { ...client, ...eventData },
        scheduledFor: admin.firestore.FieldValue.serverTimestamp(),
        status: 'pending',
      });
      break;

    case 'create_task':
      // Create task
      await db.collection('tasks').add({
        title: action.taskTitle,
        description: action.taskDescription,
        clientId,
        assignee: action.assignee || null,
        dueDate: action.dueInDays
          ? admin.firestore.Timestamp.fromDate(new Date(Date.now() + action.dueInDays * 24 * 60 * 60 * 1000))
          : null,
        priority: action.priority || 'medium',
        status: 'pending',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      break;

    case 'update_client':
      // Update client field
      await db.collection('contacts').doc(clientId).update({
        [action.field]: action.value,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      break;

    case 'notify_team':
      // Create notification
      await db.collection('notifications').add({
        type: 'workflow_trigger',
        title: action.notificationTitle,
        message: action.notificationMessage,
        clientId,
        recipients: action.recipients || ['admin'],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        read: false,
      });
      break;
  }
}
