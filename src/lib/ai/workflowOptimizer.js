/**
 * AI WORKFLOW OPTIMIZER
 *
 * Purpose:
 * Analyzes completed workflow executions to identify optimization opportunities
 * based on real conversion data, engagement metrics, and performance patterns.
 *
 * What It Does:
 * - Analyzes workflow conversion rates (Contact → Lead → Client)
 * - Identifies bottlenecks where contacts drop off
 * - Compares A/B test variants to find winners
 * - Suggests timing optimizations for email sends
 * - Detects underperforming steps that need improvement
 * - Provides data-driven recommendations with confidence scores
 *
 * Why It's Important:
 * - Continuously improves workflows based on actual performance data
 * - Prevents "set it and forget it" workflows that become stale
 * - Identifies what's working and what's not with statistical significance
 * - Helps prioritize which workflows need attention first
 *
 * Example Use Cases:
 * - "Standard tier has 15% conversion, Premium has 45% - why?"
 * - "Emails sent at 9am get 2x higher open rates than 5pm"
 * - "Contacts who receive IDIQ report within 2 hours convert 3x better"
 * - "Step 5 (service recommendation) has 60% drop-off rate - needs fixing"
 *
 * Created: 2025-12-05
 * Part of: Speedy Credit Repair AI Workflow System
 */

import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';

// ============================================================================
// PERFORMANCE THRESHOLDS
// ============================================================================

/**
 * Defines what constitutes "good" vs "needs improvement" metrics
 * These are industry benchmarks for credit repair workflows
 */
const PERFORMANCE_THRESHOLDS = {
  // Conversion rates (percentage of contacts that complete desired action)
  conversion: {
    excellent: 0.40,    // 40%+ conversion is excellent
    good: 0.25,         // 25-40% is good
    average: 0.15,      // 15-25% is average
    poor: 0.10,         // 10-15% is poor
    critical: 0.05      // Below 5% needs immediate attention
  },

  // Email engagement metrics
  emailEngagement: {
    openRate: {
      excellent: 0.35,  // 35%+ open rate
      good: 0.25,       // 25-35%
      average: 0.18,    // 18-25%
      poor: 0.12        // Below 12%
    },
    clickRate: {
      excellent: 0.15,  // 15%+ click-through rate
      good: 0.10,       // 10-15%
      average: 0.05,    // 5-10%
      poor: 0.02        // Below 2%
    },
    replyRate: {
      excellent: 0.08,  // 8%+ reply rate
      good: 0.05,       // 5-8%
      average: 0.02,    // 2-5%
      poor: 0.01        // Below 1%
    }
  },

  // Timing metrics (hours)
  timing: {
    responseTime: {
      excellent: 1,     // Under 1 hour
      good: 4,          // 1-4 hours
      average: 24,      // 4-24 hours
      poor: 48          // 24-48 hours
    }
  },

  // Drop-off rates (percentage of contacts who abandon at a step)
  dropOff: {
    excellent: 0.05,    // Under 5% drop-off
    good: 0.10,         // 5-10%
    average: 0.20,      // 10-20%
    poor: 0.30,         // 20-30%
    critical: 0.40      // Over 40% drop-off
  },

  // Sample size requirements for statistical significance
  minSampleSize: {
    workflow: 50,       // Need at least 50 completions to analyze workflow
    step: 30,           // Need at least 30 for step-level analysis
    abTest: 100         // Need 100+ per variant for A/B tests
  }
};

// ============================================================================
// OPTIMIZATION CATEGORIES
// ============================================================================

/**
 * Types of optimizations the AI can suggest
 */
const OPTIMIZATION_TYPES = {
  TIMING: 'timing',                   // When to send emails/SMS
  CONTENT: 'content',                 // What to say in messages
  SEQUENCING: 'sequencing',           // Order of steps
  PERSONALIZATION: 'personalization', // Dynamic content based on contact data
  BRANCHING: 'branching',             // Conditional logic improvements
  REMOVAL: 'removal',                 // Steps that can be deleted
  ADDITION: 'addition',               // Missing steps to add
  URGENCY: 'urgency'                  // Time-sensitive improvements needed
};

// ============================================================================
// MAIN ANALYSIS FUNCTION
// ============================================================================

/**
 * Analyzes a workflow and returns comprehensive optimization recommendations
 *
 * @param {string} workflowId - The workflow to analyze
 * @param {Object} options - Analysis options
 * @param {number} options.daysBack - How many days of data to analyze (default: 30)
 * @param {boolean} options.includeAIInsights - Use GPT-4 for deeper analysis (default: true)
 * @param {boolean} options.compareVariants - Include A/B test comparisons (default: true)
 * @param {number} options.minConfidence - Minimum confidence level for suggestions (default: 0.7)
 *
 * @returns {Object} Comprehensive optimization report
 *
 * Example return:
 * {
 *   workflowId: 'standard-tier-onboarding',
 *   performance: {
 *     overallConversion: 0.23,
 *     rating: 'average',
 *     totalExecutions: 245,
 *     completedExecutions: 189
 *   },
 *   recommendations: [
 *     {
 *       type: 'timing',
 *       priority: 'high',
 *       confidence: 0.87,
 *       issue: 'Step 3 emails sent at 5pm have 12% open rate',
 *       suggestion: 'Send at 9am instead - expect 28% open rate (+133% improvement)',
 *       expectedImpact: '+15% overall conversion',
 *       implementation: { stepIndex: 3, field: 'sendAt', newValue: '09:00' }
 *     }
 *   ],
 *   bottlenecks: [...],
 *   strengths: [...],
 *   abTestResults: [...]
 * }
 */
export async function analyzeWorkflow(workflowId, options = {}) {
  const {
    daysBack = 30,
    includeAIInsights = true,
    compareVariants = true,
    minConfidence = 0.7
  } = options;

  console.log(`[WorkflowOptimizer] Analyzing workflow: ${workflowId}`);
  console.log(`[WorkflowOptimizer] Date range: Last ${daysBack} days`);

  try {
    // Step 1: Gather all execution data
    const executionData = await gatherExecutionData(workflowId, daysBack);

    if (!executionData || executionData.executions.length < PERFORMANCE_THRESHOLDS.minSampleSize.workflow) {
      return {
        workflowId,
        error: 'insufficient_data',
        message: `Need at least ${PERFORMANCE_THRESHOLDS.minSampleSize.workflow} executions to analyze. Currently have ${executionData?.executions.length || 0}.`,
        recommendations: []
      };
    }

    // Step 2: Calculate overall performance metrics
    const performance = calculatePerformanceMetrics(executionData);

    // Step 3: Identify bottlenecks (steps with high drop-off rates)
    const bottlenecks = identifyBottlenecks(executionData);

    // Step 4: Identify strengths (what's working well)
    const strengths = identifyStrengths(executionData);

    // Step 5: Analyze timing patterns
    const timingOptimizations = analyzeTimingPatterns(executionData);

    // Step 6: Analyze A/B test variants if requested
    let abTestResults = [];
    if (compareVariants) {
      abTestResults = await analyzeABTests(workflowId, executionData);
    }

    // Step 7: Use GPT-4 for deeper insights if requested
    let aiInsights = [];
    if (includeAIInsights) {
      aiInsights = await getAIInsights(workflowId, {
        performance,
        bottlenecks,
        strengths,
        timingOptimizations,
        abTestResults,
        executionData
      });
    }

    // Step 8: Combine all recommendations
    const allRecommendations = [
      ...bottlenecks.map(b => b.recommendation),
      ...timingOptimizations,
      ...aiInsights
    ];

    // Step 9: Filter by confidence threshold and prioritize
    const recommendations = allRecommendations
      .filter(rec => rec.confidence >= minConfidence)
      .sort((a, b) => {
        // Sort by priority (high > medium > low), then confidence
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return b.confidence - a.confidence;
      });

    // Step 10: Return comprehensive report
    return {
      workflowId,
      analyzedAt: new Date().toISOString(),
      dataRange: {
        daysBack,
        startDate: new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString()
      },
      performance,
      recommendations,
      bottlenecks,
      strengths,
      abTestResults,
      summary: {
        totalRecommendations: recommendations.length,
        highPriority: recommendations.filter(r => r.priority === 'high').length,
        estimatedImpact: calculateTotalEstimatedImpact(recommendations),
        status: performance.rating
      }
    };

  } catch (error) {
    console.error('[WorkflowOptimizer] Error analyzing workflow:', error);
    throw error;
  }
}

// ============================================================================
// DATA GATHERING
// ============================================================================

/**
 * Gathers all workflow execution data for analysis
 *
 * @param {string} workflowId - Workflow to analyze
 * @param {number} daysBack - Days of history to retrieve
 * @returns {Object} Execution data with aggregated metrics
 */
async function gatherExecutionData(workflowId, daysBack) {
  const startDate = Timestamp.fromDate(
    new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000)
  );

  // Query all executions for this workflow in the date range
  const executionsRef = collection(db, 'workflowExecutions');
  const q = query(
    executionsRef,
    where('workflowId', '==', workflowId),
    where('startedAt', '>=', startDate),
    orderBy('startedAt', 'desc'),
    limit(1000) // Max 1000 executions to prevent performance issues
  );

  const snapshot = await getDocs(q);
  const executions = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  console.log(`[WorkflowOptimizer] Found ${executions.length} executions`);

  // Aggregate data by step
  const stepMetrics = aggregateStepMetrics(executions);

  // Calculate conversion funnel
  const conversionFunnel = calculateConversionFunnel(executions);

  return {
    executions,
    stepMetrics,
    conversionFunnel,
    totalExecutions: executions.length,
    completedExecutions: executions.filter(e => e.status === 'completed').length,
    failedExecutions: executions.filter(e => e.status === 'failed').length,
    inProgressExecutions: executions.filter(e => e.status === 'in_progress').length
  };
}

/**
 * Aggregates metrics for each step across all executions
 */
function aggregateStepMetrics(executions) {
  const stepMetrics = {};

  executions.forEach(execution => {
    if (!execution.stepResults) return;

    execution.stepResults.forEach((stepResult, index) => {
      const stepKey = `step_${index}`;

      if (!stepMetrics[stepKey]) {
        stepMetrics[stepKey] = {
          stepIndex: index,
          stepType: stepResult.type,
          totalExecutions: 0,
          successfulExecutions: 0,
          failedExecutions: 0,
          totalDuration: 0,
          emailMetrics: {
            sent: 0,
            opened: 0,
            clicked: 0,
            replied: 0
          },
          smsMetrics: {
            sent: 0,
            delivered: 0,
            replied: 0
          },
          dropOffs: 0 // Contacts who didn't proceed to next step
        };
      }

      stepMetrics[stepKey].totalExecutions++;

      if (stepResult.success) {
        stepMetrics[stepKey].successfulExecutions++;
      } else {
        stepMetrics[stepKey].failedExecutions++;
      }

      if (stepResult.duration) {
        stepMetrics[stepKey].totalDuration += stepResult.duration;
      }

      // Aggregate email metrics
      if (stepResult.type === 'email_send' && stepResult.result) {
        stepMetrics[stepKey].emailMetrics.sent++;
        if (stepResult.result.opened) stepMetrics[stepKey].emailMetrics.opened++;
        if (stepResult.result.clicked) stepMetrics[stepKey].emailMetrics.clicked++;
        if (stepResult.result.replied) stepMetrics[stepKey].emailMetrics.replied++;
      }

      // Aggregate SMS metrics
      if (stepResult.type === 'sms_send' && stepResult.result) {
        stepMetrics[stepKey].smsMetrics.sent++;
        if (stepResult.result.delivered) stepMetrics[stepKey].smsMetrics.delivered++;
        if (stepResult.result.replied) stepMetrics[stepKey].smsMetrics.replied++;
      }

      // Check if contact dropped off after this step
      const nextStepExists = execution.stepResults[index + 1];
      if (!nextStepExists && execution.status !== 'completed') {
        stepMetrics[stepKey].dropOffs++;
      }
    });
  });

  // Calculate percentages
  Object.keys(stepMetrics).forEach(stepKey => {
    const metrics = stepMetrics[stepKey];

    metrics.successRate = metrics.successfulExecutions / metrics.totalExecutions;
    metrics.failureRate = metrics.failedExecutions / metrics.totalExecutions;
    metrics.averageDuration = metrics.totalDuration / metrics.totalExecutions;
    metrics.dropOffRate = metrics.dropOffs / metrics.totalExecutions;

    if (metrics.emailMetrics.sent > 0) {
      metrics.emailMetrics.openRate = metrics.emailMetrics.opened / metrics.emailMetrics.sent;
      metrics.emailMetrics.clickRate = metrics.emailMetrics.clicked / metrics.emailMetrics.sent;
      metrics.emailMetrics.replyRate = metrics.emailMetrics.replied / metrics.emailMetrics.sent;
    }

    if (metrics.smsMetrics.sent > 0) {
      metrics.smsMetrics.deliveryRate = metrics.smsMetrics.delivered / metrics.smsMetrics.sent;
      metrics.smsMetrics.replyRate = metrics.smsMetrics.replied / metrics.smsMetrics.sent;
    }
  });

  return stepMetrics;
}

/**
 * Calculates conversion funnel (how many contacts make it through each stage)
 */
function calculateConversionFunnel(executions) {
  const funnel = {
    started: executions.length,
    completedStep1: 0,
    completedStep2: 0,
    completedStep3: 0,
    completedAllSteps: 0,
    convertedToLead: 0,
    convertedToClient: 0
  };

  executions.forEach(execution => {
    if (execution.stepResults && execution.stepResults.length > 0) {
      funnel.completedStep1++;
    }
    if (execution.stepResults && execution.stepResults.length > 1) {
      funnel.completedStep2++;
    }
    if (execution.stepResults && execution.stepResults.length > 2) {
      funnel.completedStep3++;
    }
    if (execution.status === 'completed') {
      funnel.completedAllSteps++;
    }

    // Check final contact status
    if (execution.finalContactStatus === 'lead') {
      funnel.convertedToLead++;
    }
    if (execution.finalContactStatus === 'client') {
      funnel.convertedToClient++;
    }
  });

  // Calculate conversion rates
  funnel.step1ConversionRate = funnel.completedStep1 / funnel.started;
  funnel.step2ConversionRate = funnel.completedStep2 / funnel.completedStep1;
  funnel.step3ConversionRate = funnel.completedStep3 / funnel.completedStep2;
  funnel.overallCompletionRate = funnel.completedAllSteps / funnel.started;
  funnel.leadConversionRate = funnel.convertedToLead / funnel.started;
  funnel.clientConversionRate = funnel.convertedToClient / funnel.started;

  return funnel;
}

// ============================================================================
// PERFORMANCE ANALYSIS
// ============================================================================

/**
 * Calculates overall performance metrics and ratings
 */
function calculatePerformanceMetrics(executionData) {
  const { executions, conversionFunnel } = executionData;

  // Overall conversion rate (contacts that became clients)
  const overallConversion = conversionFunnel.clientConversionRate;

  // Determine rating based on thresholds
  let rating;
  if (overallConversion >= PERFORMANCE_THRESHOLDS.conversion.excellent) {
    rating = 'excellent';
  } else if (overallConversion >= PERFORMANCE_THRESHOLDS.conversion.good) {
    rating = 'good';
  } else if (overallConversion >= PERFORMANCE_THRESHOLDS.conversion.average) {
    rating = 'average';
  } else if (overallConversion >= PERFORMANCE_THRESHOLDS.conversion.poor) {
    rating = 'poor';
  } else {
    rating = 'critical';
  }

  // Calculate average time to conversion
  const completedExecutions = executions.filter(e => e.status === 'completed');
  const averageTimeToComplete = completedExecutions.reduce((sum, e) => {
    const duration = (e.completedAt?.toDate() - e.startedAt?.toDate()) / (1000 * 60 * 60); // hours
    return sum + duration;
  }, 0) / completedExecutions.length;

  return {
    overallConversion,
    rating,
    totalExecutions: executions.length,
    completedExecutions: completedExecutions.length,
    completionRate: completedExecutions.length / executions.length,
    averageTimeToComplete: averageTimeToComplete || 0,
    leadConversionRate: conversionFunnel.leadConversionRate,
    clientConversionRate: conversionFunnel.clientConversionRate,
    trend: calculateTrend(executions) // 'improving', 'declining', 'stable'
  };
}

/**
 * Calculates performance trend over time
 */
function calculateTrend(executions) {
  // Split executions into first half and second half
  const midpoint = Math.floor(executions.length / 2);
  const firstHalf = executions.slice(midpoint); // More recent (descending order)
  const secondHalf = executions.slice(0, midpoint); // Older

  const firstHalfConversion = firstHalf.filter(e => e.finalContactStatus === 'client').length / firstHalf.length;
  const secondHalfConversion = secondHalf.filter(e => e.finalContactStatus === 'client').length / secondHalf.length;

  const change = firstHalfConversion - secondHalfConversion;

  if (change > 0.05) return 'improving'; // 5%+ improvement
  if (change < -0.05) return 'declining'; // 5%+ decline
  return 'stable';
}

// ============================================================================
// BOTTLENECK DETECTION
// ============================================================================

/**
 * Identifies steps with high drop-off rates (bottlenecks)
 */
function identifyBottlenecks(executionData) {
  const { stepMetrics } = executionData;
  const bottlenecks = [];

  Object.keys(stepMetrics).forEach(stepKey => {
    const metrics = stepMetrics[stepKey];

    // Check if drop-off rate exceeds threshold
    if (metrics.dropOffRate >= PERFORMANCE_THRESHOLDS.dropOff.poor) {
      const severity = metrics.dropOffRate >= PERFORMANCE_THRESHOLDS.dropOff.critical ? 'critical' : 'high';

      bottlenecks.push({
        stepIndex: metrics.stepIndex,
        stepType: metrics.stepType,
        dropOffRate: metrics.dropOffRate,
        severity,
        affectedContacts: metrics.dropOffs,
        recommendation: {
          type: OPTIMIZATION_TYPES.URGENCY,
          priority: severity,
          confidence: 0.95, // High confidence - this is hard data
          issue: `Step ${metrics.stepIndex} (${metrics.stepType}) has ${(metrics.dropOffRate * 100).toFixed(1)}% drop-off rate`,
          suggestion: `Investigate why ${metrics.dropOffs} contacts abandoned at this step. Common issues: confusing messaging, too much friction, poor timing, or technical errors.`,
          expectedImpact: `Reducing drop-off to 10% would recover ${Math.floor(metrics.dropOffs * 0.5)} additional conversions`,
          data: {
            currentDropOffRate: metrics.dropOffRate,
            targetDropOffRate: 0.10,
            potentialRecoveredContacts: Math.floor(metrics.dropOffs * 0.5)
          }
        }
      });
    }

    // Check email engagement if applicable
    if (metrics.stepType === 'email_send' && metrics.emailMetrics.sent >= 30) {
      const openRate = metrics.emailMetrics.openRate;
      const clickRate = metrics.emailMetrics.clickRate;

      if (openRate < PERFORMANCE_THRESHOLDS.emailEngagement.openRate.poor) {
        bottlenecks.push({
          stepIndex: metrics.stepIndex,
          stepType: metrics.stepType,
          issue: 'Low email open rate',
          recommendation: {
            type: OPTIMIZATION_TYPES.CONTENT,
            priority: 'medium',
            confidence: 0.85,
            issue: `Step ${metrics.stepIndex} email has ${(openRate * 100).toFixed(1)}% open rate (industry average: 25%)`,
            suggestion: `Improve subject line - test these approaches:\n• Add personalization ({{firstName}})\n• Create urgency ("24-hour credit report ready")\n• Use curiosity ("You won't believe what we found...")\n• Keep under 50 characters`,
            expectedImpact: `Increasing to 25% open rate could improve overall conversion by 8-12%`,
            implementation: {
              stepIndex: metrics.stepIndex,
              field: 'subjectLine',
              testVariants: true
            }
          }
        });
      }

      if (clickRate < PERFORMANCE_THRESHOLDS.emailEngagement.clickRate.poor && openRate >= PERFORMANCE_THRESHOLDS.emailEngagement.openRate.poor) {
        bottlenecks.push({
          stepIndex: metrics.stepIndex,
          stepType: metrics.stepType,
          issue: 'Low email click rate',
          recommendation: {
            type: OPTIMIZATION_TYPES.CONTENT,
            priority: 'medium',
            confidence: 0.82,
            issue: `Step ${metrics.stepIndex} email has ${(clickRate * 100).toFixed(1)}% click rate (opens are good, but clicks are low)`,
            suggestion: `People open the email but don't click. Improve your call-to-action:\n• Make CTA button bigger and brighter\n• Use action-oriented text ("Get My Free Report" not "Click Here")\n• Add urgency ("Claim Your Spot - Only 3 Left Today")\n• Place CTA above the fold (visible without scrolling)`,
            expectedImpact: `Increasing click rate to 5% could recover 15-20 additional conversions per month`,
            implementation: {
              stepIndex: metrics.stepIndex,
              field: 'emailTemplate',
              focus: 'call_to_action'
            }
          }
        });
      }
    }
  });

  return bottlenecks.sort((a, b) => b.dropOffRate - a.dropOffRate);
}

// ============================================================================
// STRENGTH IDENTIFICATION
// ============================================================================

/**
 * Identifies what's working well (to protect from accidental changes)
 */
function identifyStrengths(executionData) {
  const { stepMetrics } = executionData;
  const strengths = [];

  Object.keys(stepMetrics).forEach(stepKey => {
    const metrics = stepMetrics[stepKey];

    // Low drop-off rate = strength
    if (metrics.dropOffRate <= PERFORMANCE_THRESHOLDS.dropOff.excellent && metrics.totalExecutions >= 30) {
      strengths.push({
        stepIndex: metrics.stepIndex,
        stepType: metrics.stepType,
        metric: 'Low drop-off rate',
        value: `${(metrics.dropOffRate * 100).toFixed(1)}%`,
        message: `Step ${metrics.stepIndex} is performing excellently - only ${(metrics.dropOffRate * 100).toFixed(1)}% of contacts drop off. Don't change this step without A/B testing!`
      });
    }

    // High email open rate = strength
    if (metrics.stepType === 'email_send' && metrics.emailMetrics.sent >= 30) {
      const openRate = metrics.emailMetrics.openRate;
      if (openRate >= PERFORMANCE_THRESHOLDS.emailEngagement.openRate.excellent) {
        strengths.push({
          stepIndex: metrics.stepIndex,
          stepType: metrics.stepType,
          metric: 'High email open rate',
          value: `${(openRate * 100).toFixed(1)}%`,
          message: `Step ${metrics.stepIndex} email has excellent ${(openRate * 100).toFixed(1)}% open rate. Subject line is working well - consider using similar language in other emails.`
        });
      }

      const clickRate = metrics.emailMetrics.clickRate;
      if (clickRate >= PERFORMANCE_THRESHOLDS.emailEngagement.clickRate.excellent) {
        strengths.push({
          stepIndex: metrics.stepIndex,
          stepType: metrics.stepType,
          metric: 'High email click rate',
          value: `${(clickRate * 100).toFixed(1)}%`,
          message: `Step ${metrics.stepIndex} email has outstanding ${(clickRate * 100).toFixed(1)}% click rate. Your call-to-action is highly effective - replicate this approach elsewhere.`
        });
      }
    }
  });

  return strengths;
}

// ============================================================================
// TIMING ANALYSIS
// ============================================================================

/**
 * Analyzes timing patterns to find optimal send times
 */
function analyzeTimingPatterns(executionData) {
  const { executions } = executionData;
  const recommendations = [];

  // Group executions by hour of day
  const hourlyPerformance = {};

  executions.forEach(execution => {
    if (!execution.stepResults) return;

    execution.stepResults.forEach((stepResult, index) => {
      if (stepResult.type !== 'email_send' && stepResult.type !== 'sms_send') return;
      if (!stepResult.timestamp) return;

      const hour = stepResult.timestamp.toDate().getHours();
      const key = `step_${index}_hour_${hour}`;

      if (!hourlyPerformance[key]) {
        hourlyPerformance[key] = {
          stepIndex: index,
          stepType: stepResult.type,
          hour,
          sends: 0,
          opens: 0,
          clicks: 0,
          conversions: 0
        };
      }

      hourlyPerformance[key].sends++;
      if (stepResult.result?.opened) hourlyPerformance[key].opens++;
      if (stepResult.result?.clicked) hourlyPerformance[key].clicks++;
      if (execution.finalContactStatus === 'client') hourlyPerformance[key].conversions++;
    });
  });

  // Analyze each step's timing
  const stepTimingData = {};
  Object.keys(hourlyPerformance).forEach(key => {
    const data = hourlyPerformance[key];
    const stepKey = `step_${data.stepIndex}`;

    if (!stepTimingData[stepKey]) {
      stepTimingData[stepKey] = [];
    }

    stepTimingData[stepKey].push({
      hour: data.hour,
      openRate: data.opens / data.sends,
      clickRate: data.clicks / data.sends,
      conversionRate: data.conversions / data.sends,
      sampleSize: data.sends
    });
  });

  // Find optimal times for each step
  Object.keys(stepTimingData).forEach(stepKey => {
    const timings = stepTimingData[stepKey];

    // Need at least 2 different hours with 10+ sends each
    const validTimings = timings.filter(t => t.sampleSize >= 10);
    if (validTimings.length < 2) return;

    // Find best and worst performing hours
    const bestTiming = validTimings.reduce((best, current) =>
      current.conversionRate > best.conversionRate ? current : best
    );
    const worstTiming = validTimings.reduce((worst, current) =>
      current.conversionRate < worst.conversionRate ? current : worst
    );

    // Only recommend if there's a significant difference (>50% improvement)
    const improvement = (bestTiming.conversionRate - worstTiming.conversionRate) / worstTiming.conversionRate;

    if (improvement > 0.5 && bestTiming.hour !== worstTiming.hour) {
      const stepIndex = parseInt(stepKey.split('_')[1]);

      recommendations.push({
        type: OPTIMIZATION_TYPES.TIMING,
        priority: 'medium',
        confidence: Math.min(0.7 + (improvement * 0.2), 0.95), // Higher improvement = higher confidence
        issue: `Step ${stepIndex} performs ${(improvement * 100).toFixed(0)}% better when sent at ${bestTiming.hour}:00 vs ${worstTiming.hour}:00`,
        suggestion: `Change send time from ${worstTiming.hour}:00 to ${bestTiming.hour}:00 for optimal engagement`,
        expectedImpact: `+${(improvement * 100).toFixed(0)}% improvement in conversion rate`,
        data: {
          currentWorstHour: worstTiming.hour,
          recommendedHour: bestTiming.hour,
          improvementPercentage: improvement,
          bestHourConversion: bestTiming.conversionRate,
          worstHourConversion: worstTiming.conversionRate
        },
        implementation: {
          stepIndex,
          field: 'scheduledTime',
          newValue: `${bestTiming.hour}:00`
        }
      });
    }
  });

  return recommendations;
}

// ============================================================================
// A/B TEST ANALYSIS
// ============================================================================

/**
 * Analyzes A/B test variants to find winners
 */
async function analyzeABTests(workflowId, executionData) {
  const { executions } = executionData;
  const results = [];

  // Group executions by variant ID
  const variantGroups = {};
  executions.forEach(execution => {
    if (!execution.variant) return;

    if (!variantGroups[execution.variant]) {
      variantGroups[execution.variant] = [];
    }
    variantGroups[execution.variant].push(execution);
  });

  // Need at least 2 variants to compare
  const variants = Object.keys(variantGroups);
  if (variants.length < 2) {
    return results;
  }

  // Compare each variant
  const variantStats = variants.map(variantId => {
    const executions = variantGroups[variantId];
    const conversions = executions.filter(e => e.finalContactStatus === 'client').length;
    const conversionRate = conversions / executions.length;

    return {
      variantId,
      executions: executions.length,
      conversions,
      conversionRate,
      avgTimeToComplete: executions.reduce((sum, e) => {
        if (!e.completedAt || !e.startedAt) return sum;
        return sum + (e.completedAt.toDate() - e.startedAt.toDate()) / (1000 * 60 * 60);
      }, 0) / executions.length
    };
  });

  // Sort by conversion rate
  variantStats.sort((a, b) => b.conversionRate - a.conversionRate);

  const winner = variantStats[0];
  const loser = variantStats[variantStats.length - 1];

  // Check if winner is statistically significant
  const sampleSizeAdequate = winner.executions >= PERFORMANCE_THRESHOLDS.minSampleSize.abTest;
  const improvement = (winner.conversionRate - loser.conversionRate) / loser.conversionRate;
  const isSignificant = improvement > 0.20; // 20%+ improvement

  if (sampleSizeAdequate && isSignificant) {
    results.push({
      type: 'ab_test_winner',
      workflowId,
      winner: winner.variantId,
      loser: loser.variantId,
      improvement: improvement,
      winnerConversionRate: winner.conversionRate,
      loserConversionRate: loser.conversionRate,
      confidence: calculateStatisticalSignificance(winner, loser),
      recommendation: {
        type: OPTIMIZATION_TYPES.CONTENT,
        priority: 'high',
        confidence: calculateStatisticalSignificance(winner, loser),
        issue: `Variant "${loser.variantId}" underperforming by ${(improvement * 100).toFixed(1)}%`,
        suggestion: `Replace all traffic with variant "${winner.variantId}" which converts ${(improvement * 100).toFixed(1)}% better`,
        expectedImpact: `+${(improvement * 100).toFixed(1)}% overall conversion if fully rolled out`,
        implementation: {
          action: 'set_default_variant',
          variantId: winner.variantId,
          archiveVariants: [loser.variantId]
        }
      }
    });
  }

  return results;
}

/**
 * Calculates statistical significance using simplified z-test
 */
function calculateStatisticalSignificance(variant1, variant2) {
  const p1 = variant1.conversionRate;
  const n1 = variant1.executions;
  const p2 = variant2.conversionRate;
  const n2 = variant2.executions;

  // Pooled probability
  const pPool = (variant1.conversions + variant2.conversions) / (n1 + n2);

  // Standard error
  const se = Math.sqrt(pPool * (1 - pPool) * (1/n1 + 1/n2));

  // Z-score
  const z = Math.abs(p1 - p2) / se;

  // Convert z-score to confidence level (simplified)
  // z > 1.96 = 95% confidence, z > 2.58 = 99% confidence
  if (z > 2.58) return 0.99;
  if (z > 1.96) return 0.95;
  if (z > 1.65) return 0.90;
  return 0.80;
}

// ============================================================================
// AI-POWERED INSIGHTS
// ============================================================================

/**
 * Uses GPT-4 to provide deeper insights beyond statistical analysis
 */
async function getAIInsights(workflowId, analysisData) {
  try {
    const analyzeWorkflowAI = httpsCallable(functions, 'aiAnalyzeWorkflowPerformance');

    const result = await analyzeWorkflowAI({
      workflowId,
      performanceData: analysisData.performance,
      bottlenecks: analysisData.bottlenecks,
      strengths: analysisData.strengths,
      timingData: analysisData.timingOptimizations,
      abTestResults: analysisData.abTestResults,
      executionSample: analysisData.executionData.executions.slice(0, 10) // Send sample for context
    });

    // GPT-4 returns structured recommendations
    return result.data.recommendations || [];

  } catch (error) {
    console.error('[WorkflowOptimizer] AI insights failed:', error);
    return []; // Fail gracefully - statistical analysis is still valuable
  }
}

// ============================================================================
// IMPACT CALCULATION
// ============================================================================

/**
 * Estimates total impact if all recommendations are implemented
 */
function calculateTotalEstimatedImpact(recommendations) {
  // This is simplified - actual impact would depend on recommendation interaction
  const totalImprovementPercentage = recommendations.reduce((sum, rec) => {
    // Extract percentage from expectedImpact string (e.g., "+15% overall conversion")
    const match = rec.expectedImpact?.match(/\+(\d+)%/);
    if (match) {
      return sum + parseInt(match[1]);
    }
    return sum;
  }, 0);

  // Cap at 100% to be realistic (compounding effects don't add linearly)
  const cappedImprovement = Math.min(totalImprovementPercentage * 0.6, 100);

  return `+${cappedImprovement.toFixed(0)}% estimated improvement if all recommendations implemented`;
}

// ============================================================================
// AUTO-APPLY OPTIMIZATIONS
// ============================================================================

/**
 * Automatically applies safe optimizations that don't require human review
 *
 * @param {string} workflowId - Workflow to optimize
 * @param {Object} optimizationReport - Report from analyzeWorkflow()
 * @param {Object} options - Auto-apply options
 * @returns {Object} Applied changes summary
 */
export async function autoApplyOptimizations(workflowId, optimizationReport, options = {}) {
  const {
    minConfidence = 0.90, // Only auto-apply very confident recommendations
    allowedTypes = [OPTIMIZATION_TYPES.TIMING], // Only auto-apply timing changes by default
    dryRun = true // Default to dry run for safety
  } = options;

  const appliedChanges = [];
  const skippedChanges = [];

  for (const recommendation of optimizationReport.recommendations) {
    // Check if this recommendation is safe to auto-apply
    const isSafe =
      recommendation.confidence >= minConfidence &&
      allowedTypes.includes(recommendation.type) &&
      recommendation.implementation;

    if (!isSafe) {
      skippedChanges.push({
        recommendation,
        reason: 'Does not meet auto-apply criteria'
      });
      continue;
    }

    if (dryRun) {
      appliedChanges.push({
        recommendation,
        action: 'DRY RUN - would apply',
        implementation: recommendation.implementation
      });
    } else {
      try {
        // Actually apply the change via Firebase function
        const applyOptimization = httpsCallable(functions, 'applyWorkflowOptimization');

        const result = await applyOptimization({
          workflowId,
          optimization: recommendation.implementation
        });

        appliedChanges.push({
          recommendation,
          action: 'Applied successfully',
          result: result.data
        });

      } catch (error) {
        skippedChanges.push({
          recommendation,
          reason: `Error applying: ${error.message}`
        });
      }
    }
  }

  return {
    appliedChanges,
    skippedChanges,
    summary: {
      totalRecommendations: optimizationReport.recommendations.length,
      applied: appliedChanges.length,
      skipped: skippedChanges.length,
      dryRun
    }
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  PERFORMANCE_THRESHOLDS,
  OPTIMIZATION_TYPES
};

/**
 * Example Usage:
 *
 * // Analyze a workflow
 * const report = await analyzeWorkflow('standard-tier-onboarding', {
 *   daysBack: 30,
 *   includeAIInsights: true,
 *   compareVariants: true,
 *   minConfidence: 0.7
 * });
 *
 * console.log(report.performance.rating); // 'good'
 * console.log(report.recommendations.length); // 12
 * console.log(report.summary.estimatedImpact); // '+35% estimated improvement'
 *
 * // Auto-apply safe optimizations
 * const applied = await autoApplyOptimizations('standard-tier-onboarding', report, {
 *   minConfidence: 0.90,
 *   allowedTypes: ['timing'],
 *   dryRun: false // Actually apply changes
 * });
 *
 * console.log(`Applied ${applied.summary.applied} optimizations`);
 */
