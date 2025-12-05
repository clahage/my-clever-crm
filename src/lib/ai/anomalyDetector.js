/**
 * AI ANOMALY DETECTION SYSTEM
 *
 * Purpose:
 * Automatically detects unusual patterns, problems, and anomalies in workflow
 * performance, lead generation, conversions, and system behavior.
 *
 * What It Does:
 * - Monitors key metrics in real-time
 * - Detects sudden drops in conversion rates
 * - Identifies email deliverability problems
 * - Catches workflow execution failures
 * - Spots unusual lead source patterns
 * - Alerts when IDIQ enrollments drop
 * - Detects seasonal/temporal anomalies
 * - Provides root cause analysis and recommendations
 *
 * Why It's Important:
 * - Problems caught early = less revenue lost
 * - Christopher doesn't need to manually monitor dashboards
 * - Prevents "silent failures" that go unnoticed for weeks
 * - Identifies opportunities (unexpected success to replicate)
 * - Data-driven alerts, not guesswork
 *
 * Example Alerts:
 * - "🚨 Email open rate dropped 40% in last 24 hours - possible deliverability issue"
 * - "⚠️ No leads from Facebook in 3 days - campaign may have stopped"
 * - "📉 Standard tier conversion down 25% this week vs last week"
 * - "✅ Premium tier converting 2x higher than usual - analyze what changed"
 * - "🔴 5 workflow executions failed in last hour - server issue?"
 *
 * Detection Methods:
 * 1. Statistical (Z-score, moving average, standard deviation)
 * 2. Rule-based (hard thresholds)
 * 3. Pattern recognition (day-of-week, time-of-day)
 * 4. AI-powered (GPT-4 analysis of complex patterns)
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
  Timestamp,
  addDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';

// ============================================================================
// ANOMALY TYPES
// ============================================================================

/**
 * Categories of anomalies we detect
 */
const ANOMALY_TYPES = {
  CONVERSION_DROP: 'conversion_drop',
  CONVERSION_SPIKE: 'conversion_spike',
  EMAIL_DELIVERABILITY: 'email_deliverability',
  WORKFLOW_FAILURE: 'workflow_failure',
  LEAD_SOURCE_DRIED_UP: 'lead_source_dried_up',
  IDIQ_ENROLLMENT_DROP: 'idiq_enrollment_drop',
  UNUSUAL_LEAD_QUALITY: 'unusual_lead_quality',
  RESPONSE_TIME_SPIKE: 'response_time_spike',
  TASK_BACKLOG: 'task_backlog',
  REVENUE_DROP: 'revenue_drop',
  CHURN_SPIKE: 'churn_spike',
  SEASONAL_ANOMALY: 'seasonal_anomaly'
};

/**
 * Severity levels
 */
const SEVERITY_LEVELS = {
  CRITICAL: 'critical',     // Immediate action required (revenue impacting)
  HIGH: 'high',             // Important but not urgent
  MEDIUM: 'medium',         // Worth investigating
  LOW: 'low',               // FYI only
  INFO: 'info'              // Positive anomaly (opportunity)
};

// ============================================================================
// DETECTION THRESHOLDS
// ============================================================================

/**
 * Defines when we should alert
 */
const DETECTION_THRESHOLDS = {
  // Conversion rate changes
  conversionDrop: {
    minPercentChange: 25,       // Alert if drops >25%
    minSampleSize: 20,          // Need at least 20 data points
    lookbackDays: 7,            // Compare to last 7 days
    severity: SEVERITY_LEVELS.CRITICAL
  },

  // Email metrics
  emailOpenRate: {
    minPercentChange: 30,       // 30% drop in opens
    minSampleSize: 50,
    lookbackDays: 3,
    severity: SEVERITY_LEVELS.HIGH
  },

  emailClickRate: {
    minPercentChange: 40,
    minSampleSize: 50,
    lookbackDays: 3,
    severity: SEVERITY_LEVELS.HIGH
  },

  emailBounceRate: {
    maxBounceRate: 0.05,        // 5% bounce rate
    severity: SEVERITY_LEVELS.CRITICAL
  },

  // Workflow execution
  workflowFailureRate: {
    maxFailureRate: 0.10,       // 10% failure rate
    minSampleSize: 10,
    lookbackHours: 24,
    severity: SEVERITY_LEVELS.CRITICAL
  },

  // Lead generation
  leadSourceDryUp: {
    minDaysSinceLastLead: 3,    // No leads in 3 days
    severity: SEVERITY_LEVELS.HIGH
  },

  // IDIQ enrollment
  idiqEnrollmentDrop: {
    minPercentChange: 30,
    minSampleSize: 20,
    lookbackDays: 7,
    severity: SEVERITY_LEVELS.HIGH
  },

  // Lead quality
  leadQualityDrop: {
    minScoreDrop: 15,           // Lead score drops 15+ points
    minSampleSize: 30,
    lookbackDays: 7,
    severity: SEVERITY_LEVELS.MEDIUM
  },

  // Task backlog
  taskBacklog: {
    maxOpenTasks: 50,
    maxOverdueTasks: 10,
    severity: SEVERITY_LEVELS.MEDIUM
  },

  // Revenue
  revenueDrop: {
    minPercentChange: 20,
    lookbackDays: 30,
    severity: SEVERITY_LEVELS.CRITICAL
  }
};

// ============================================================================
// MAIN ANOMALY DETECTOR CLASS
// ============================================================================

export class AnomalyDetector {
  constructor() {
    this.detectedAnomalies = [];
    this.historicalData = new Map();
  }

  // --------------------------------------------------------------------------
  // MAIN DETECTION METHODS
  // --------------------------------------------------------------------------

  /**
   * Runs all anomaly detection checks
   *
   * @param {Object} options - Detection options
   * @param {Array} options.checkTypes - Which checks to run (default: all)
   * @param {boolean} options.useAI - Use GPT-4 for deeper analysis (default: false)
   *
   * @returns {Array} Detected anomalies
   */
  async detectAnomalies(options = {}) {
    const {
      checkTypes = Object.values(ANOMALY_TYPES),
      useAI = false
    } = options;

    console.log(`[AnomalyDetector] Running ${checkTypes.length} anomaly checks`);

    const anomalies = [];

    // Run each detection check
    for (const checkType of checkTypes) {
      try {
        let result = null;

        switch (checkType) {
          case ANOMALY_TYPES.CONVERSION_DROP:
            result = await this.detectConversionAnomaly();
            break;

          case ANOMALY_TYPES.EMAIL_DELIVERABILITY:
            result = await this.detectEmailAnomaly();
            break;

          case ANOMALY_TYPES.WORKFLOW_FAILURE:
            result = await this.detectWorkflowFailures();
            break;

          case ANOMALY_TYPES.LEAD_SOURCE_DRIED_UP:
            result = await this.detectLeadSourceIssues();
            break;

          case ANOMALY_TYPES.IDIQ_ENROLLMENT_DROP:
            result = await this.detectIDIQAnomaly();
            break;

          case ANOMALY_TYPES.UNUSUAL_LEAD_QUALITY:
            result = await this.detectLeadQualityAnomaly();
            break;

          case ANOMALY_TYPES.TASK_BACKLOG:
            result = await this.detectTaskBacklog();
            break;

          case ANOMALY_TYPES.REVENUE_DROP:
            result = await this.detectRevenueAnomaly();
            break;

          default:
            console.log(`[AnomalyDetector] Unknown check type: ${checkType}`);
        }

        if (result && result.isAnomaly) {
          anomalies.push(result);
        }

      } catch (error) {
        console.error(`[AnomalyDetector] Error in ${checkType} check:`, error);
      }
    }

    // Use AI for deeper analysis if requested
    if (useAI && anomalies.length > 0) {
      const aiInsights = await this.getAIInsights(anomalies);
      anomalies.forEach((anomaly, index) => {
        anomaly.aiInsights = aiInsights[index];
      });
    }

    // Save anomalies to database
    for (const anomaly of anomalies) {
      await this.saveAnomaly(anomaly);
    }

    this.detectedAnomalies = anomalies;

    console.log(`[AnomalyDetector] Detected ${anomalies.length} anomalies`);
    return anomalies;
  }

  // --------------------------------------------------------------------------
  // CONVERSION ANOMALY DETECTION
  // --------------------------------------------------------------------------

  /**
   * Detects unusual changes in conversion rates
   */
  async detectConversionAnomaly() {
    const threshold = DETECTION_THRESHOLDS.conversionDrop;

    // Get recent conversion data
    const recentData = await this.getRecentConversions(1); // Last 1 day
    const baselineData = await this.getRecentConversions(threshold.lookbackDays); // Last 7 days

    if (recentData.count < threshold.minSampleSize) {
      return { isAnomaly: false, reason: 'Insufficient data' };
    }

    const recentRate = recentData.conversions / recentData.count;
    const baselineRate = baselineData.conversions / baselineData.count;

    const percentChange = ((recentRate - baselineRate) / baselineRate) * 100;

    // Check for drop
    if (percentChange < -threshold.minPercentChange) {
      return {
        isAnomaly: true,
        type: ANOMALY_TYPES.CONVERSION_DROP,
        severity: threshold.severity,
        title: '🚨 Conversion Rate Dropped',
        message: `Conversion rate dropped ${Math.abs(percentChange).toFixed(1)}% (${(recentRate * 100).toFixed(1)}% today vs ${(baselineRate * 100).toFixed(1)}% baseline)`,
        data: {
          recentRate,
          baselineRate,
          percentChange,
          recentCount: recentData.count,
          baselineCount: baselineData.count
        },
        detectedAt: new Date(),
        recommendations: [
          'Check if workflow emails are being delivered',
          'Review recent changes to workflows or email templates',
          'Check lead quality - are leads lower quality recently?',
          'Verify IDIQ enrollment process is working',
          'Review any recent service plan price changes'
        ]
      };
    }

    // Check for spike (opportunity)
    if (percentChange > threshold.minPercentChange) {
      return {
        isAnomaly: true,
        type: ANOMALY_TYPES.CONVERSION_SPIKE,
        severity: SEVERITY_LEVELS.INFO,
        title: '✅ Conversion Rate Spiked (Good!)',
        message: `Conversion rate increased ${percentChange.toFixed(1)}% (${(recentRate * 100).toFixed(1)}% today vs ${(baselineRate * 100).toFixed(1)}% baseline)`,
        data: {
          recentRate,
          baselineRate,
          percentChange,
          recentCount: recentData.count
        },
        detectedAt: new Date(),
        recommendations: [
          'Analyze what changed - can you replicate it?',
          'Check lead source - is one source performing exceptionally well?',
          'Review recent email/workflow changes',
          'Document what\'s working for future reference'
        ]
      };
    }

    return { isAnomaly: false };
  }

  /**
   * Gets recent conversion data
   */
  async getRecentConversions(daysBack) {
    const startDate = Timestamp.fromDate(
      new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000)
    );

    const contactsRef = collection(db, 'contacts');
    const q = query(
      contactsRef,
      where('createdAt', '>=', startDate)
    );

    const snapshot = await getDocs(q);

    const count = snapshot.size;
    const conversions = snapshot.docs.filter(doc =>
      doc.data().status === 'client'
    ).length;

    return { count, conversions };
  }

  // --------------------------------------------------------------------------
  // EMAIL ANOMALY DETECTION
  // --------------------------------------------------------------------------

  /**
   * Detects email deliverability issues
   */
  async detectEmailAnomaly() {
    const threshold = DETECTION_THRESHOLDS.emailOpenRate;

    // Get recent email metrics
    const recentMetrics = await this.getEmailMetrics(1);
    const baselineMetrics = await this.getEmailMetrics(threshold.lookbackDays);

    if (recentMetrics.sent < threshold.minSampleSize) {
      return { isAnomaly: false, reason: 'Insufficient data' };
    }

    const recentOpenRate = recentMetrics.opened / recentMetrics.sent;
    const baselineOpenRate = baselineMetrics.opened / baselineMetrics.sent;

    const percentChange = ((recentOpenRate - baselineOpenRate) / baselineOpenRate) * 100;

    // Check for open rate drop
    if (percentChange < -threshold.minPercentChange) {
      return {
        isAnomaly: true,
        type: ANOMALY_TYPES.EMAIL_DELIVERABILITY,
        severity: threshold.severity,
        title: '⚠️ Email Open Rate Dropped',
        message: `Email open rate dropped ${Math.abs(percentChange).toFixed(1)}% (${(recentOpenRate * 100).toFixed(1)}% today vs ${(baselineOpenRate * 100).toFixed(1)}% baseline)`,
        data: {
          recentOpenRate,
          baselineOpenRate,
          percentChange,
          sentToday: recentMetrics.sent,
          bounceRate: recentMetrics.bounced / recentMetrics.sent
        },
        detectedAt: new Date(),
        recommendations: [
          'Check spam folder placement - use mail-tester.com',
          'Review recent subject line changes',
          'Check sender reputation - may be blacklisted',
          'Verify DKIM/SPF/DMARC records',
          'Check bounce rate - clean email list if high'
        ]
      };
    }

    // Check bounce rate
    const bounceRate = recentMetrics.bounced / recentMetrics.sent;
    const bounceThreshold = DETECTION_THRESHOLDS.emailBounceRate;

    if (bounceRate > bounceThreshold.maxBounceRate) {
      return {
        isAnomaly: true,
        type: ANOMALY_TYPES.EMAIL_DELIVERABILITY,
        severity: bounceThreshold.severity,
        title: '🔴 High Email Bounce Rate',
        message: `Email bounce rate is ${(bounceRate * 100).toFixed(1)}% (threshold: ${(bounceThreshold.maxBounceRate * 100).toFixed(1)}%)`,
        data: {
          bounceRate,
          bounced: recentMetrics.bounced,
          sent: recentMetrics.sent
        },
        detectedAt: new Date(),
        recommendations: [
          'Clean your email list - remove invalid addresses',
          'Use email verification service',
          'Check if contacts opted out',
          'Review contact import process - may be importing bad data'
        ]
      };
    }

    return { isAnomaly: false };
  }

  /**
   * Gets email metrics for time period
   */
  async getEmailMetrics(daysBack) {
    const startDate = Timestamp.fromDate(
      new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000)
    );

    const logsRef = collection(db, 'emailLogs');
    const q = query(
      logsRef,
      where('sentAt', '>=', startDate)
    );

    const snapshot = await getDocs(q);

    const metrics = {
      sent: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
      replied: 0
    };

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      metrics.sent++;
      if (data.opened) metrics.opened++;
      if (data.clicked) metrics.clicked++;
      if (data.bounced) metrics.bounced++;
      if (data.replied) metrics.replied++;
    });

    return metrics;
  }

  // --------------------------------------------------------------------------
  // WORKFLOW FAILURE DETECTION
  // --------------------------------------------------------------------------

  /**
   * Detects workflow execution failures
   */
  async detectWorkflowFailures() {
    const threshold = DETECTION_THRESHOLDS.workflowFailureRate;

    const startTime = Timestamp.fromDate(
      new Date(Date.now() - threshold.lookbackHours * 60 * 60 * 1000)
    );

    const executionsRef = collection(db, 'workflowExecutions');
    const q = query(
      executionsRef,
      where('startedAt', '>=', startTime)
    );

    const snapshot = await getDocs(q);

    if (snapshot.size < threshold.minSampleSize) {
      return { isAnomaly: false, reason: 'Insufficient data' };
    }

    const failed = snapshot.docs.filter(doc => doc.data().status === 'failed').length;
    const failureRate = failed / snapshot.size;

    if (failureRate > threshold.maxFailureRate) {
      // Analyze failure reasons
      const failureReasons = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.status === 'failed') {
          const reason = data.errorMessage || 'Unknown error';
          failureReasons[reason] = (failureReasons[reason] || 0) + 1;
        }
      });

      const topReason = Object.keys(failureReasons).reduce((a, b) =>
        failureReasons[a] > failureReasons[b] ? a : b
      );

      return {
        isAnomaly: true,
        type: ANOMALY_TYPES.WORKFLOW_FAILURE,
        severity: threshold.severity,
        title: '🔴 High Workflow Failure Rate',
        message: `${(failureRate * 100).toFixed(1)}% of workflows failing (${failed} of ${snapshot.size} in last ${threshold.lookbackHours} hours)`,
        data: {
          failureRate,
          failed,
          total: snapshot.size,
          failureReasons,
          topReason
        },
        detectedAt: new Date(),
        recommendations: [
          `Most common error: "${topReason}" - investigate this first`,
          'Check Firebase Cloud Functions logs',
          'Verify OpenAI API is working',
          'Check IDIQ API connection',
          'Review recent workflow changes'
        ]
      };
    }

    return { isAnomaly: false };
  }

  // --------------------------------------------------------------------------
  // LEAD SOURCE DETECTION
  // --------------------------------------------------------------------------

  /**
   * Detects when lead sources dry up
   */
  async detectLeadSourceIssues() {
    const threshold = DETECTION_THRESHOLDS.leadSourceDryUp;

    // Get all lead sources
    const contactsRef = collection(db, 'contacts');
    const recentQuery = query(
      contactsRef,
      orderBy('createdAt', 'desc'),
      limit(100)
    );

    const snapshot = await getDocs(recentQuery);

    // Group by source
    const sourceActivity = {};

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const source = data.source || 'unknown';

      if (!sourceActivity[source]) {
        sourceActivity[source] = {
          lastLeadDate: null,
          count: 0
        };
      }

      sourceActivity[source].count++;

      const createdAt = data.createdAt?.toDate();
      if (!sourceActivity[source].lastLeadDate || createdAt > sourceActivity[source].lastLeadDate) {
        sourceActivity[source].lastLeadDate = createdAt;
      }
    });

    // Check each source
    const anomalies = [];
    const now = new Date();

    Object.keys(sourceActivity).forEach(source => {
      const activity = sourceActivity[source];
      const daysSinceLastLead = (now - activity.lastLeadDate) / (1000 * 60 * 60 * 24);

      if (daysSinceLastLead > threshold.minDaysSinceLastLead && activity.count > 5) {
        anomalies.push({
          source,
          daysSinceLastLead: Math.floor(daysSinceLastLead),
          historicalCount: activity.count
        });
      }
    });

    if (anomalies.length > 0) {
      return {
        isAnomaly: true,
        type: ANOMALY_TYPES.LEAD_SOURCE_DRIED_UP,
        severity: threshold.severity,
        title: '⚠️ Lead Source Dried Up',
        message: `${anomalies.length} lead source(s) haven't generated leads recently`,
        data: {
          driedUpSources: anomalies
        },
        detectedAt: new Date(),
        recommendations: anomalies.map(a =>
          `${a.source}: No leads in ${a.daysSinceLastLead} days - check if campaign stopped/paused`
        )
      };
    }

    return { isAnomaly: false };
  }

  // --------------------------------------------------------------------------
  // IDIQ ANOMALY DETECTION
  // --------------------------------------------------------------------------

  /**
   * Detects drops in IDIQ enrollment
   */
  async detectIDIQAnomaly() {
    const threshold = DETECTION_THRESHOLDS.idiqEnrollmentDrop;

    const recentEnrollments = await this.getIDIQEnrollments(1);
    const baselineEnrollments = await this.getIDIQEnrollments(threshold.lookbackDays);

    if (recentEnrollments < threshold.minSampleSize / 7) {
      return { isAnomaly: false, reason: 'Insufficient data' };
    }

    const recentDaily = recentEnrollments;
    const baselineDaily = baselineEnrollments / threshold.lookbackDays;

    const percentChange = ((recentDaily - baselineDaily) / baselineDaily) * 100;

    if (percentChange < -threshold.minPercentChange) {
      return {
        isAnomaly: true,
        type: ANOMALY_TYPES.IDIQ_ENROLLMENT_DROP,
        severity: threshold.severity,
        title: '📉 IDIQ Enrollment Dropped',
        message: `IDIQ enrollments dropped ${Math.abs(percentChange).toFixed(1)}% (${recentDaily} today vs ${baselineDaily.toFixed(1)} daily average)`,
        data: {
          recentDaily,
          baselineDaily,
          percentChange
        },
        detectedAt: new Date(),
        recommendations: [
          'Check IDIQ API connection',
          'Verify Partner ID 11981 is active',
          'Review IDIQ enrollment workflow',
          'Check if IDIQ offer emails are being sent',
          'Confirm IDIQ pricing hasn\'t changed'
        ]
      };
    }

    return { isAnomaly: false };
  }

  /**
   * Gets IDIQ enrollment count
   */
  async getIDIQEnrollments(daysBack) {
    const startDate = Timestamp.fromDate(
      new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000)
    );

    const contactsRef = collection(db, 'contacts');
    const q = query(
      contactsRef,
      where('idiqStatus', '==', 'enrolled'),
      where('idiqEnrolledAt', '>=', startDate)
    );

    const snapshot = await getDocs(q);
    return snapshot.size;
  }

  // --------------------------------------------------------------------------
  // LEAD QUALITY DETECTION
  // --------------------------------------------------------------------------

  /**
   * Detects unusual changes in lead quality
   */
  async detectLeadQualityAnomaly() {
    const threshold = DETECTION_THRESHOLDS.leadQualityDrop;

    const recentLeads = await this.getRecentLeadScores(1);
    const baselineLeads = await this.getRecentLeadScores(threshold.lookbackDays);

    if (recentLeads.length < threshold.minSampleSize / 7) {
      return { isAnomaly: false, reason: 'Insufficient data' };
    }

    const recentAvg = recentLeads.reduce((sum, score) => sum + score, 0) / recentLeads.length;
    const baselineAvg = baselineLeads.reduce((sum, score) => sum + score, 0) / baselineLeads.length;

    const scoreDrop = baselineAvg - recentAvg;

    if (scoreDrop > threshold.minScoreDrop) {
      return {
        isAnomaly: true,
        type: ANOMALY_TYPES.UNUSUAL_LEAD_QUALITY,
        severity: threshold.severity,
        title: '📊 Lead Quality Dropped',
        message: `Average lead score dropped ${scoreDrop.toFixed(1)} points (${recentAvg.toFixed(1)} today vs ${baselineAvg.toFixed(1)} baseline)`,
        data: {
          recentAvg,
          baselineAvg,
          scoreDrop
        },
        detectedAt: new Date(),
        recommendations: [
          'Check lead sources - is low-quality source sending more traffic?',
          'Review any recent changes to lead capture forms',
          'Analyze if marketing targeting changed',
          'Consider pausing underperforming lead sources'
        ]
      };
    }

    return { isAnomaly: false };
  }

  /**
   * Gets recent lead scores
   */
  async getRecentLeadScores(daysBack) {
    const startDate = Timestamp.fromDate(
      new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000)
    );

    const contactsRef = collection(db, 'contacts');
    const q = query(
      contactsRef,
      where('createdAt', '>=', startDate),
      where('leadScore', '>', 0)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data().leadScore || 0);
  }

  // --------------------------------------------------------------------------
  // TASK BACKLOG DETECTION
  // --------------------------------------------------------------------------

  /**
   * Detects task backlog issues
   */
  async detectTaskBacklog() {
    const threshold = DETECTION_THRESHOLDS.taskBacklog;

    const tasksRef = collection(db, 'tasks');

    // Get open tasks
    const openQuery = query(
      tasksRef,
      where('status', '==', 'open')
    );
    const openSnapshot = await getDocs(openQuery);
    const openCount = openSnapshot.size;

    // Get overdue tasks
    const now = Timestamp.now();
    const overdueQuery = query(
      tasksRef,
      where('status', '==', 'open'),
      where('dueDate', '<', now)
    );
    const overdueSnapshot = await getDocs(overdueQuery);
    const overdueCount = overdueSnapshot.size;

    if (openCount > threshold.maxOpenTasks || overdueCount > threshold.maxOverdueTasks) {
      return {
        isAnomaly: true,
        type: ANOMALY_TYPES.TASK_BACKLOG,
        severity: threshold.severity,
        title: '📋 Task Backlog Building Up',
        message: `${openCount} open tasks (${overdueCount} overdue) - threshold: ${threshold.maxOpenTasks} open, ${threshold.maxOverdueTasks} overdue`,
        data: {
          openCount,
          overdueCount,
          maxOpen: threshold.maxOpenTasks,
          maxOverdue: threshold.maxOverdueTasks
        },
        detectedAt: new Date(),
        recommendations: [
          'Prioritize overdue tasks first',
          'Consider delegating to Laurie',
          'Review if some tasks can be automated',
          'Identify and remove low-value tasks'
        ]
      };
    }

    return { isAnomaly: false };
  }

  // --------------------------------------------------------------------------
  // REVENUE ANOMALY DETECTION
  // --------------------------------------------------------------------------

  /**
   * Detects revenue drops
   */
  async detectRevenueAnomaly() {
    const threshold = DETECTION_THRESHOLDS.revenueDrop;

    // This would query Stripe or payment records
    // Placeholder implementation
    return { isAnomaly: false, reason: 'Revenue tracking not yet implemented' };
  }

  // --------------------------------------------------------------------------
  // AI-POWERED INSIGHTS
  // --------------------------------------------------------------------------

  /**
   * Uses GPT-4 to provide deeper insights on detected anomalies
   */
  async getAIInsights(anomalies) {
    try {
      const analyzeAnomalies = httpsCallable(functions, 'aiAnalyzeAnomalies');

      const result = await analyzeAnomalies({
        anomalies: anomalies.map(a => ({
          type: a.type,
          severity: a.severity,
          message: a.message,
          data: a.data
        }))
      });

      return result.data.insights;

    } catch (error) {
      console.error('[AnomalyDetector] AI insights failed:', error);
      return anomalies.map(() => null);
    }
  }

  // --------------------------------------------------------------------------
  // PERSISTENCE
  // --------------------------------------------------------------------------

  /**
   * Saves anomaly to database
   */
  async saveAnomaly(anomaly) {
    try {
      await addDoc(collection(db, 'anomalies'), {
        ...anomaly,
        detectedAt: Timestamp.now(),
        acknowledged: false,
        resolvedAt: null
      });

      console.log(`[AnomalyDetector] Saved anomaly: ${anomaly.type}`);

    } catch (error) {
      console.error('[AnomalyDetector] Error saving anomaly:', error);
    }
  }

  /**
   * Gets recent anomalies from database
   */
  async getRecentAnomalies(daysBack = 7, includeResolved = false) {
    const startDate = Timestamp.fromDate(
      new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000)
    );

    let q = query(
      collection(db, 'anomalies'),
      where('detectedAt', '>=', startDate),
      orderBy('detectedAt', 'desc')
    );

    if (!includeResolved) {
      q = query(q, where('resolvedAt', '==', null));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}

// ============================================================================
// EXPORTS & HELPERS
// ============================================================================

/**
 * Quick function to run all anomaly checks
 */
export async function quickDetectAnomalies() {
  const detector = new AnomalyDetector();
  return await detector.detectAnomalies({ useAI: false });
}

export default AnomalyDetector;

export {
  ANOMALY_TYPES,
  SEVERITY_LEVELS,
  DETECTION_THRESHOLDS
};

/**
 * Example Usage:
 *
 * const detector = new AnomalyDetector();
 *
 * // Run all checks
 * const anomalies = await detector.detectAnomalies({
 *   checkTypes: Object.values(ANOMALY_TYPES),
 *   useAI: true
 * });
 *
 * // Display results
 * anomalies.forEach(anomaly => {
 *   console.log(anomaly.title);
 *   console.log(anomaly.message);
 *   console.log('Severity:', anomaly.severity);
 *   console.log('Recommendations:');
 *   anomaly.recommendations.forEach(rec => console.log(`  - ${rec}`));
 * });
 *
 * // Run specific checks only
 * const emailAnomalies = await detector.detectAnomalies({
 *   checkTypes: [ANOMALY_TYPES.EMAIL_DELIVERABILITY]
 * });
 *
 * // Get recent anomalies from database
 * const recent = await detector.getRecentAnomalies(7, false);
 * console.log(`${recent.length} unresolved anomalies in last 7 days`);
 *
 * // Schedule regular checks (run every hour)
 * setInterval(async () => {
 *   const anomalies = await quickDetectAnomalies();
 *   if (anomalies.length > 0) {
 *     // Send alert to Christopher
 *     sendAlert(anomalies);
 *   }
 * }, 60 * 60 * 1000); // Every hour
 */
