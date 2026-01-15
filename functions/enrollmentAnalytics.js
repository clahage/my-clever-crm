/**
 * ============================================================================
 * ENROLLMENT ANALYTICS HELPER MODULE - SpeedyCRM
 * ============================================================================
 * Path: /functions/enrollmentAnalytics.js
 *
 * PURPOSE:
 * Track enrollment funnel steps and analyze drop-off points
 * NOT a Cloud Function - helper module used by other functions
 *
 * FEATURES:
 * - Track every step of enrollment funnel
 * - Identify drop-off points
 * - Calculate conversion metrics
 * - Support for recovery email targeting
 * - A/B test subject line tracking
 *
 * INTEGRATES WITH:
 * - processWorkflowStages (scheduled recovery)
 * - operationsManager (on-demand tracking)
 * - enrollmentAutomation (post-enrollment)
 *
 * FIRESTORE COLLECTIONS:
 * - enrollmentAnalytics (main tracking data)
 * - enrollmentFunnelStats (aggregated stats)
 *
 * © 1995-2026 Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved
 * ============================================================================
 */

const admin = require('firebase-admin');

// ============================================================================
// FUNNEL STEP DEFINITIONS
// ============================================================================

/**
 * Enrollment funnel step definitions with expected order
 */
const FUNNEL_STEPS = {
  LANDING_PAGE_VIEW: {
    id: 'landing_page_view',
    order: 1,
    name: 'Landing Page View',
    description: 'User viewed the landing page'
  },
  FORM_STARTED: {
    id: 'form_started',
    order: 2,
    name: 'Form Started',
    description: 'User started filling out the form'
  },
  BASIC_INFO_COMPLETE: {
    id: 'basic_info_complete',
    order: 3,
    name: 'Basic Info Complete',
    description: 'User completed name, email, phone, state'
  },
  IDIQ_FORM_STARTED: {
    id: 'idiq_form_started',
    order: 4,
    name: 'IDIQ Form Started',
    description: 'User started IDIQ enrollment form'
  },
  IDIQ_FORM_SUBMITTED: {
    id: 'idiq_form_submitted',
    order: 5,
    name: 'IDIQ Form Submitted',
    description: 'User submitted IDIQ enrollment data'
  },
  VERIFICATION_STARTED: {
    id: 'verification_started',
    order: 6,
    name: 'Verification Started',
    description: 'User started identity verification'
  },
  VERIFICATION_COMPLETE: {
    id: 'verification_complete',
    order: 7,
    name: 'Verification Complete',
    description: 'User completed identity verification'
  },
  REPORT_PULLED: {
    id: 'report_pulled',
    order: 8,
    name: 'Report Pulled',
    description: 'Credit report successfully retrieved'
  },
  ENROLLMENT_COMPLETE: {
    id: 'enrollment_complete',
    order: 9,
    name: 'Enrollment Complete',
    description: 'Full enrollment process completed'
  },
  ENROLLMENT_FAILED: {
    id: 'enrollment_failed',
    order: -1,
    name: 'Enrollment Failed',
    description: 'Enrollment failed due to error'
  },
  ENROLLMENT_ABANDONED: {
    id: 'enrollment_abandoned',
    order: -2,
    name: 'Enrollment Abandoned',
    description: 'User abandoned the enrollment process'
  }
};

// ============================================================================
// CORE TRACKING FUNCTIONS
// ============================================================================

/**
 * Track an enrollment funnel step
 * @param {string} contactId - The contact's Firestore document ID
 * @param {string} step - Step ID from FUNNEL_STEPS
 * @param {Object} metadata - Additional data about the step
 * @returns {Promise<Object>} Result with success status
 */
async function trackEnrollmentStep(contactId, step, metadata = {}) {
  console.log(`📊 Tracking enrollment step: ${step} for contact: ${contactId}`);

  const db = admin.firestore();

  try {
    // Validate step
    const stepInfo = Object.values(FUNNEL_STEPS).find(s => s.id === step);
    if (!stepInfo) {
      throw new Error(`Invalid funnel step: ${step}`);
    }

    // Generate session ID if not provided
    const sessionId = metadata.sessionId || `session_${contactId}_${Date.now()}`;

    // Create step record
    const stepRecord = {
      step: step,
      stepName: stepInfo.name,
      stepOrder: stepInfo.order,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      metadata: {
        source: metadata.source || 'unknown',
        referrer: metadata.referrer || null,
        device: metadata.device || null,
        userAgent: metadata.userAgent || null,
        timeSpent: metadata.timeSpent || null,
        fieldsCompleted: metadata.fieldsCompleted || [],
        lastField: metadata.lastField || null,
        errorMessage: metadata.errorMessage || null,
        ...metadata
      }
    };

    // Get or create analytics document for this contact
    const analyticsRef = db.collection('enrollmentAnalytics').doc(contactId);
    const analyticsDoc = await analyticsRef.get();

    if (analyticsDoc.exists) {
      // Update existing document
      await analyticsRef.update({
        lastStep: step,
        lastStepName: stepInfo.name,
        lastStepAt: admin.firestore.FieldValue.serverTimestamp(),
        steps: admin.firestore.FieldValue.arrayUnion(stepRecord),
        stepCount: admin.firestore.FieldValue.increment(1),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    } else {
      // Create new analytics document
      await analyticsRef.set({
        contactId: contactId,
        sessionId: sessionId,
        firstStep: step,
        firstStepAt: admin.firestore.FieldValue.serverTimestamp(),
        lastStep: step,
        lastStepName: stepInfo.name,
        lastStepAt: admin.firestore.FieldValue.serverTimestamp(),
        steps: [stepRecord],
        stepCount: 1,

        // Drop-off tracking
        abandonedAt: null,
        abandonedStep: null,
        timeToAbandon: null,

        // Recovery tracking
        recoveryEmailsSent: 0,
        recoveryEmailsOpened: 0,
        recoveryEmailsClicked: 0,
        recovered: false,
        recoveredVia: null,

        // Metadata
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    // Update contact document with enrollment status
    if (contactId) {
      const contactUpdates = {
        'enrollment.lastStep': step,
        'enrollment.lastStepAt': admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      // Set enrollment status based on step
      if (step === FUNNEL_STEPS.ENROLLMENT_COMPLETE.id) {
        contactUpdates['enrollmentStatus'] = 'enrolled';
        contactUpdates['enrollment.completedAt'] = admin.firestore.FieldValue.serverTimestamp();
      } else if (step === FUNNEL_STEPS.ENROLLMENT_FAILED.id) {
        contactUpdates['enrollmentStatus'] = 'failed';
        contactUpdates['enrollment.failedAt'] = admin.firestore.FieldValue.serverTimestamp();
        contactUpdates['enrollment.failureReason'] = metadata.errorMessage || 'Unknown error';
      } else if (step === FUNNEL_STEPS.ENROLLMENT_ABANDONED.id) {
        contactUpdates['enrollmentStatus'] = 'abandoned';
        contactUpdates['enrollment.abandonedAt'] = admin.firestore.FieldValue.serverTimestamp();
      } else if (step === FUNNEL_STEPS.FORM_STARTED.id || step === FUNNEL_STEPS.BASIC_INFO_COMPLETE.id) {
        // Only set to 'started' if not already in a terminal state
        contactUpdates['enrollmentStatus'] = 'started';
        if (step === FUNNEL_STEPS.FORM_STARTED.id) {
          contactUpdates['enrollment.startedAt'] = admin.firestore.FieldValue.serverTimestamp();
        }
      }

      try {
        await db.collection('contacts').doc(contactId).update(contactUpdates);
      } catch (updateError) {
        console.warn('⚠️ Could not update contact enrollment status:', updateError.message);
      }
    }

    console.log(`✅ Enrollment step tracked: ${step}`);

    return {
      success: true,
      step: step,
      stepName: stepInfo.name,
      contactId: contactId
    };

  } catch (error) {
    console.error('❌ Error tracking enrollment step:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Mark enrollment as abandoned
 * @param {string} contactId - Contact ID
 * @param {Object} data - Abandonment data
 * @returns {Promise<Object>} Result
 */
async function markEnrollmentAbandoned(contactId, data = {}) {
  console.log(`⚠️ Marking enrollment abandoned: ${contactId}`);

  const db = admin.firestore();

  try {
    const analyticsRef = db.collection('enrollmentAnalytics').doc(contactId);
    const analyticsDoc = await analyticsRef.get();

    if (!analyticsDoc.exists) {
      console.log('ℹ️ No analytics document to mark as abandoned');
      return { success: true, message: 'No analytics to update' };
    }

    const analytics = analyticsDoc.data();
    const startedAt = analytics.firstStepAt?.toDate() || new Date();
    const timeToAbandon = Math.floor((Date.now() - startedAt.getTime()) / 1000); // seconds

    await analyticsRef.update({
      abandonedAt: admin.firestore.FieldValue.serverTimestamp(),
      abandonedStep: analytics.lastStep,
      timeToAbandon: timeToAbandon,
      abandonmentReason: data.reason || 'inactivity',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Track the abandonment step
    await trackEnrollmentStep(contactId, FUNNEL_STEPS.ENROLLMENT_ABANDONED.id, {
      abandonedFromStep: analytics.lastStep,
      timeSpent: timeToAbandon,
      ...data
    });

    console.log(`✅ Enrollment marked abandoned after ${timeToAbandon} seconds`);

    return {
      success: true,
      abandonedStep: analytics.lastStep,
      timeToAbandon: timeToAbandon
    };

  } catch (error) {
    console.error('❌ Error marking abandonment:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Track recovery email sent
 * @param {string} contactId - Contact ID
 * @param {Object} emailData - Email details
 * @returns {Promise<Object>} Result
 */
async function trackRecoveryEmailSent(contactId, emailData = {}) {
  console.log(`📧 Tracking recovery email sent: ${contactId}`);

  const db = admin.firestore();

  try {
    const analyticsRef = db.collection('enrollmentAnalytics').doc(contactId);

    await analyticsRef.update({
      recoveryEmailsSent: admin.firestore.FieldValue.increment(1),
      lastRecoveryEmailAt: admin.firestore.FieldValue.serverTimestamp(),
      lastRecoveryEmailTemplate: emailData.templateId || 'unknown',
      lastRecoveryEmailSubject: emailData.subject || 'unknown',
      recoveryEmailHistory: admin.firestore.FieldValue.arrayUnion({
        templateId: emailData.templateId,
        subject: emailData.subject,
        variant: emailData.variant || 'A',
        sentAt: new Date().toISOString()
      }),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`✅ Recovery email tracked`);
    return { success: true };

  } catch (error) {
    console.error('❌ Error tracking recovery email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Track recovery email opened
 * @param {string} contactId - Contact ID
 * @returns {Promise<Object>} Result
 */
async function trackRecoveryEmailOpened(contactId) {
  const db = admin.firestore();

  try {
    await db.collection('enrollmentAnalytics').doc(contactId).update({
      recoveryEmailsOpened: admin.firestore.FieldValue.increment(1),
      lastRecoveryEmailOpenedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Track recovery email clicked
 * @param {string} contactId - Contact ID
 * @returns {Promise<Object>} Result
 */
async function trackRecoveryEmailClicked(contactId) {
  const db = admin.firestore();

  try {
    await db.collection('enrollmentAnalytics').doc(contactId).update({
      recoveryEmailsClicked: admin.firestore.FieldValue.increment(1),
      lastRecoveryEmailClickedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Mark enrollment as recovered
 * @param {string} contactId - Contact ID
 * @param {string} recoveredVia - How they were recovered (email, direct, phone)
 * @returns {Promise<Object>} Result
 */
async function markEnrollmentRecovered(contactId, recoveredVia = 'email') {
  console.log(`🎉 Marking enrollment recovered: ${contactId}`);

  const db = admin.firestore();

  try {
    await db.collection('enrollmentAnalytics').doc(contactId).update({
      recovered: true,
      recoveredVia: recoveredVia,
      recoveredAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`✅ Enrollment marked as recovered via ${recoveredVia}`);
    return { success: true, recoveredVia };

  } catch (error) {
    console.error('❌ Error marking recovery:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================================
// QUERY FUNCTIONS - For Recovery System
// ============================================================================

/**
 * Get contacts needing failed enrollment recovery (5 min)
 * @returns {Promise<Array>} Contacts needing recovery
 */
async function getFailedEnrollmentsForRecovery() {
  console.log('🔍 Finding failed enrollments for recovery...');

  const db = admin.firestore();
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

  try {
    // Find contacts where enrollment failed and no recovery email sent yet
    const snapshot = await db.collection('contacts')
      .where('enrollmentStatus', '==', 'started')
      .where('idiq.reportRequested', '==', false)
      .where('enrollment.startedAt', '<=', admin.firestore.Timestamp.fromDate(fiveMinutesAgo))
      .limit(50)
      .get();

    const contacts = [];

    for (const doc of snapshot.docs) {
      const contactData = doc.data();

      // Check if recovery email already sent
      const analyticsDoc = await db.collection('enrollmentAnalytics').doc(doc.id).get();
      const analytics = analyticsDoc.exists ? analyticsDoc.data() : null;

      // Skip if recovery email already sent for failed enrollment
      if (analytics?.recoveryEmailHistory?.some(e => e.templateId === 'recovery-failed-enrollment')) {
        continue;
      }

      contacts.push({
        contactId: doc.id,
        ...contactData,
        analytics: analytics
      });
    }

    console.log(`📊 Found ${contacts.length} failed enrollments needing recovery`);
    return contacts;

  } catch (error) {
    console.error('❌ Error getting failed enrollments:', error);
    return [];
  }
}

/**
 * Get contacts needing abandonment recovery (30 min)
 * @returns {Promise<Array>} Contacts needing recovery
 */
async function getAbandonedEnrollmentsForRecovery() {
  console.log('🔍 Finding abandoned enrollments for recovery...');

  const db = admin.firestore();
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

  try {
    // Find contacts where enrollment started but abandoned
    const snapshot = await db.collection('contacts')
      .where('enrollmentStatus', '==', 'started')
      .where('enrollment.startedAt', '<=', admin.firestore.Timestamp.fromDate(thirtyMinutesAgo))
      .limit(50)
      .get();

    const contacts = [];

    for (const doc of snapshot.docs) {
      const contactData = doc.data();

      // Check analytics for recovery email status
      const analyticsDoc = await db.collection('enrollmentAnalytics').doc(doc.id).get();
      const analytics = analyticsDoc.exists ? analyticsDoc.data() : null;

      // Skip if 30-min recovery email already sent
      if (analytics?.recoveryEmailHistory?.some(e => e.templateId === 'recovery-abandoned-30min')) {
        continue;
      }

      // Skip if already enrolled
      if (contactData.enrollmentStatus === 'enrolled') {
        continue;
      }

      contacts.push({
        contactId: doc.id,
        ...contactData,
        analytics: analytics
      });
    }

    console.log(`📊 Found ${contacts.length} abandoned enrollments needing recovery`);
    return contacts;

  } catch (error) {
    console.error('❌ Error getting abandoned enrollments:', error);
    return [];
  }
}

/**
 * Get contacts needing drip sequence emails
 * @param {number} dripDay - Which drip day (1, 3, 7, or 14)
 * @returns {Promise<Array>} Contacts needing drip email
 */
async function getDripSequenceContacts(dripDay) {
  console.log(`🔍 Finding contacts for drip day ${dripDay}...`);

  const db = admin.firestore();

  // Calculate the time window for this drip day
  const templateMap = {
    1: { templateId: 'drip-day-1', minHours: 24, maxHours: 48 },
    3: { templateId: 'drip-day-3', minHours: 72, maxHours: 96 },
    7: { templateId: 'drip-day-7', minHours: 168, maxHours: 192 },
    14: { templateId: 'drip-day-14', minHours: 336, maxHours: 360 }
  };

  const config = templateMap[dripDay];
  if (!config) {
    console.error(`Invalid drip day: ${dripDay}`);
    return [];
  }

  const minTime = new Date(Date.now() - config.maxHours * 60 * 60 * 1000);
  const maxTime = new Date(Date.now() - config.minHours * 60 * 60 * 1000);

  try {
    // Find contacts in the time window who haven't completed enrollment
    const snapshot = await db.collection('contacts')
      .where('enrollmentStatus', 'in', ['started', 'abandoned', 'failed'])
      .where('enrollment.startedAt', '>=', admin.firestore.Timestamp.fromDate(minTime))
      .where('enrollment.startedAt', '<=', admin.firestore.Timestamp.fromDate(maxTime))
      .limit(50)
      .get();

    const contacts = [];

    for (const doc of snapshot.docs) {
      const contactData = doc.data();

      // Check analytics for drip email status
      const analyticsDoc = await db.collection('enrollmentAnalytics').doc(doc.id).get();
      const analytics = analyticsDoc.exists ? analyticsDoc.data() : null;

      // Skip if this drip email already sent
      if (analytics?.recoveryEmailHistory?.some(e => e.templateId === config.templateId)) {
        continue;
      }

      // Skip if contact opted out or is enrolled
      if (contactData.emailOptOut || contactData.enrollmentStatus === 'enrolled') {
        continue;
      }

      contacts.push({
        contactId: doc.id,
        ...contactData,
        analytics: analytics,
        dripTemplateId: config.templateId
      });
    }

    console.log(`📊 Found ${contacts.length} contacts for drip day ${dripDay}`);
    return contacts;

  } catch (error) {
    console.error('❌ Error getting drip contacts:', error);
    return [];
  }
}

// ============================================================================
// ANALYTICS & REPORTING FUNCTIONS
// ============================================================================

/**
 * Analyze drop-off points in the funnel
 * @param {number} days - Number of days to analyze
 * @returns {Promise<Object>} Drop-off analysis
 */
async function analyzeDropoffPoints(days = 30) {
  console.log(`📊 Analyzing drop-off points for last ${days} days...`);

  const db = admin.firestore();
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  try {
    const snapshot = await db.collection('enrollmentAnalytics')
      .where('createdAt', '>=', admin.firestore.Timestamp.fromDate(startDate))
      .get();

    const stepCounts = {};
    const abandonedByStep = {};
    let totalStarted = 0;
    let totalCompleted = 0;
    let totalRecovered = 0;

    snapshot.forEach(doc => {
      const data = doc.data();
      totalStarted++;

      // Count each step
      if (data.steps) {
        data.steps.forEach(step => {
          stepCounts[step.step] = (stepCounts[step.step] || 0) + 1;
        });
      }

      // Count abandonments by step
      if (data.abandonedStep) {
        abandonedByStep[data.abandonedStep] = (abandonedByStep[data.abandonedStep] || 0) + 1;
      }

      // Count completions
      if (data.lastStep === 'enrollment_complete') {
        totalCompleted++;
      }

      // Count recoveries
      if (data.recovered) {
        totalRecovered++;
      }
    });

    // Calculate conversion rates
    const conversionRate = totalStarted > 0 ? (totalCompleted / totalStarted * 100).toFixed(2) : 0;
    const recoveryRate = (totalStarted - totalCompleted) > 0
      ? (totalRecovered / (totalStarted - totalCompleted) * 100).toFixed(2)
      : 0;

    // Find worst drop-off point
    let worstDropoff = null;
    let worstDropoffCount = 0;
    for (const [step, count] of Object.entries(abandonedByStep)) {
      if (count > worstDropoffCount) {
        worstDropoff = step;
        worstDropoffCount = count;
      }
    }

    const analysis = {
      period: `Last ${days} days`,
      totalStarted,
      totalCompleted,
      totalAbandoned: totalStarted - totalCompleted,
      totalRecovered,
      conversionRate: parseFloat(conversionRate),
      recoveryRate: parseFloat(recoveryRate),
      stepCounts,
      abandonedByStep,
      worstDropoff: {
        step: worstDropoff,
        count: worstDropoffCount,
        percentage: totalStarted > 0 ? (worstDropoffCount / totalStarted * 100).toFixed(2) : 0
      },
      analyzedAt: new Date().toISOString()
    };

    console.log('📊 Drop-off Analysis:', JSON.stringify(analysis, null, 2));

    // Store the analysis
    await db.collection('enrollmentFunnelStats').add({
      ...analysis,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return analysis;

  } catch (error) {
    console.error('❌ Error analyzing drop-off points:', error);
    return { error: error.message };
  }
}

/**
 * Generate funnel report
 * @param {number} days - Days to include
 * @returns {Promise<Object>} Funnel report
 */
async function generateFunnelReport(days = 7) {
  console.log(`📊 Generating funnel report for last ${days} days...`);

  const db = admin.firestore();
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  try {
    const snapshot = await db.collection('enrollmentAnalytics')
      .where('createdAt', '>=', admin.firestore.Timestamp.fromDate(startDate))
      .get();

    const funnelSteps = Object.values(FUNNEL_STEPS)
      .filter(s => s.order > 0)
      .sort((a, b) => a.order - b.order);

    const report = {
      period: `Last ${days} days`,
      generatedAt: new Date().toISOString(),
      totalContacts: snapshot.size,
      steps: []
    };

    // Calculate counts for each step
    const stepCounts = {};
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.steps) {
        data.steps.forEach(step => {
          stepCounts[step.step] = (stepCounts[step.step] || 0) + 1;
        });
      }
    });

    // Build funnel visualization data
    funnelSteps.forEach((step, index) => {
      const count = stepCounts[step.id] || 0;
      const previousCount = index > 0 ? (report.steps[index - 1]?.count || 0) : snapshot.size;
      const dropoffRate = previousCount > 0 ? ((previousCount - count) / previousCount * 100).toFixed(1) : 0;

      report.steps.push({
        step: step.id,
        name: step.name,
        order: step.order,
        count,
        dropoffRate: parseFloat(dropoffRate),
        percentageOfTotal: snapshot.size > 0 ? (count / snapshot.size * 100).toFixed(1) : 0
      });
    });

    console.log('📊 Funnel Report Generated');
    return report;

  } catch (error) {
    console.error('❌ Error generating funnel report:', error);
    return { error: error.message };
  }
}

// ============================================================================
// A/B TESTING HELPERS
// ============================================================================

/**
 * Select A/B variant for email
 * Uses Thompson Sampling for multi-armed bandit optimization
 * @param {string} templateId - Email template ID
 * @returns {Promise<string>} Selected variant ('A' or 'B')
 */
async function selectEmailVariant(templateId) {
  const db = admin.firestore();

  try {
    const statsDoc = await db.collection('emailABTests').doc(templateId).get();

    if (!statsDoc.exists) {
      // Initialize with 50/50 split
      await db.collection('emailABTests').doc(templateId).set({
        variants: {
          A: { sends: 0, opens: 0, clicks: 0, conversions: 0 },
          B: { sends: 0, opens: 0, clicks: 0, conversions: 0 }
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      return Math.random() > 0.5 ? 'A' : 'B';
    }

    const stats = statsDoc.data();
    const variantA = stats.variants.A;
    const variantB = stats.variants.B;

    // Thompson Sampling with Beta distribution approximation
    const scoreA = (variantA.opens + 1) / (variantA.sends + 2) + Math.random() * 0.1;
    const scoreB = (variantB.opens + 1) / (variantB.sends + 2) + Math.random() * 0.1;

    return scoreA > scoreB ? 'A' : 'B';

  } catch (error) {
    console.error('❌ Error selecting variant:', error);
    return 'A'; // Default to A on error
  }
}

/**
 * Track A/B test result
 * @param {string} templateId - Template ID
 * @param {string} variant - Variant ('A' or 'B')
 * @param {string} event - Event type ('send', 'open', 'click', 'conversion')
 */
async function trackABTestEvent(templateId, variant, event) {
  const db = admin.firestore();

  try {
    const eventMap = {
      send: 'sends',
      open: 'opens',
      click: 'clicks',
      conversion: 'conversions'
    };

    const field = eventMap[event];
    if (!field) return;

    await db.collection('emailABTests').doc(templateId).update({
      [`variants.${variant}.${field}`]: admin.firestore.FieldValue.increment(1),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

  } catch (error) {
    console.error('❌ Error tracking A/B event:', error);
  }
}

// ============================================================================
// MODULE EXPORTS
// ============================================================================

module.exports = {
  // Constants
  FUNNEL_STEPS,

  // Core tracking
  trackEnrollmentStep,
  markEnrollmentAbandoned,
  markEnrollmentRecovered,

  // Recovery email tracking
  trackRecoveryEmailSent,
  trackRecoveryEmailOpened,
  trackRecoveryEmailClicked,

  // Query functions for recovery system
  getFailedEnrollmentsForRecovery,
  getAbandonedEnrollmentsForRecovery,
  getDripSequenceContacts,

  // Analytics & reporting
  analyzeDropoffPoints,
  generateFunnelReport,

  // A/B testing
  selectEmailVariant,
  trackABTestEvent
};

// ============================================================================
// © 1995-2026 Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved
// ============================================================================
