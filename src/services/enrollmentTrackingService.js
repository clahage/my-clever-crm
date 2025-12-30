// ============================================================================
// enrollmentTrackingService.js - Enrollment Analytics & Recovery Tracking
// ============================================================================
// Path: src/services/enrollmentTrackingService.js
//
// PURPOSE: Bridge enrollment events to MySQL tracking system
// - Track user progress through enrollment phases
// - Populate email_followups table for abandoned cart recovery
// - Sync with enrollment-analytics.php dashboard
// - Exit intent tracking integration
//
// INTEGRATIONS:
// - tracking.php / tracking.js (MySQL event logging)
// - exit-intent-popup.js (Exit intent detection)
// - email-tracking-schema.sql (Database structure)
// - enrollment-analytics.php (Real-time monitoring)
//
// © 1995-2025 Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved
// ============================================================================

import { db } from '@/lib/firebase';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';

// ============================================================================
// CONFIGURATION
// ============================================================================

const TRACKING_CONFIG = {
  // PHP tracking endpoint (adjust to your server)
  trackingEndpoint: '/api/tracking.php',
  analyticsEndpoint: '/api/enrollment-analytics.php',

  // Exit intent discount
  exitIntentDiscount: 50,
  exitIntentPhaseThreshold: 5, // Show exit intent before phase 5

  // Inactivity timeout for abandoned cart (in milliseconds)
  abandonmentTimeout: 15 * 60 * 1000, // 15 minutes

  // Event types for MySQL tracking
  eventTypes: {
    FORM_STARTED: 'form_started',
    STEP_COMPLETE: 'step_complete',
    FORM_ABANDONED: 'form_abandoned',
    EXIT_INTENT_SHOWN: 'exit_intent_shown',
    EXIT_INTENT_ACCEPTED: 'exit_intent_accepted',
    EXIT_INTENT_DISMISSED: 'exit_intent_dismissed',
    DISCOUNT_APPLIED: 'discount_applied',
    FORM_COMPLETED: 'form_completed',
    PAYMENT_STARTED: 'payment_started',
    PAYMENT_COMPLETED: 'payment_completed',
    RECOVERY_SMS_SENT: 'recovery_sms_sent',
    RECOVERY_CLICKED: 'recovery_clicked',
  },
};

// ============================================================================
// TRACKING EVENT INTERFACE
// ============================================================================

/**
 * Track enrollment event to MySQL via PHP endpoint
 * Compatible with tracking.php and tracking.js structure
 */
export const trackEvent = async ({
  eventType,
  contactId = null,
  email = null,
  phone = null,
  firstName = null,
  phase = null,
  metadata = {},
}) => {
  console.log('📊 Tracking event:', eventType, { contactId, phase, metadata });

  const eventData = {
    event_type: eventType,
    contact_id: contactId,
    email: email,
    phone: phone,
    first_name: firstName,
    current_phase: phase,
    timestamp: new Date().toISOString(),
    user_agent: navigator.userAgent,
    referrer: document.referrer,
    page_url: window.location.href,
    session_id: getSessionId(),
    metadata: JSON.stringify(metadata),
  };

  try {
    // Send to PHP tracking endpoint
    const response = await fetch(TRACKING_CONFIG.trackingEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      console.warn('⚠️ PHP tracking endpoint returned error:', response.status);
    }
  } catch (error) {
    console.warn('⚠️ Failed to send to PHP tracking (will use Firebase fallback):', error);
  }

  // Also log to Firebase for redundancy
  try {
    await addDoc(collection(db, 'enrollmentTracking'), {
      ...eventData,
      metadata: metadata, // Keep as object in Firebase
      createdAt: serverTimestamp(),
    });
  } catch (firebaseError) {
    console.error('❌ Firebase tracking fallback failed:', firebaseError);
  }

  // If this is an abandonment event, schedule recovery
  if (eventType === TRACKING_CONFIG.eventTypes.FORM_ABANDONED && email) {
    await scheduleEmailRecovery({
      email,
      phone,
      firstName,
      phase,
      contactId,
    });
  }

  return eventData;
};

/**
 * Track phase completion milestone
 */
export const trackPhaseComplete = async ({
  phase,
  contactId,
  email,
  phone,
  firstName,
  formData = {},
}) => {
  const milestoneMap = {
    1: 'step1_complete', // Lead capture
    2: 'step2_complete', // Analysis started
    3: 'step3_complete', // Analysis complete
    4: 'step4_complete', // Documents uploaded
    5: 'step5_complete', // Signature complete
    6: 'step6_complete', // Plan selected
    7: 'step7_complete', // Payment started
    8: 'step8_complete', // Payment complete
    9: 'step9_complete', // Portal preview
    10: 'form_completed', // Enrollment complete
  };

  return trackEvent({
    eventType: milestoneMap[phase] || `phase${phase}_complete`,
    contactId,
    email,
    phone,
    firstName,
    phase,
    metadata: {
      formData: sanitizeFormData(formData),
    },
  });
};

/**
 * Track form start
 */
export const trackFormStarted = async ({ contactId, email, firstName }) => {
  return trackEvent({
    eventType: TRACKING_CONFIG.eventTypes.FORM_STARTED,
    contactId,
    email,
    firstName,
    phase: 1,
    metadata: {
      landingSource: document.referrer || 'direct',
      utmParams: getUTMParams(),
    },
  });
};

// ============================================================================
// ABANDONED CART RECOVERY
// ============================================================================

/**
 * Schedule email/SMS recovery for abandoned enrollment
 * Populates email_followups table
 */
export const scheduleEmailRecovery = async ({
  email,
  phone,
  firstName,
  phase,
  contactId,
}) => {
  console.log('📧 Scheduling recovery for abandoned enrollment at phase', phase);

  const recoveryData = {
    email,
    phone,
    first_name: firstName,
    contact_id: contactId,
    abandoned_phase: phase,
    recovery_type: getRecoveryType(phase),
    scheduled_time: new Date(Date.now() + TRACKING_CONFIG.abandonmentTimeout).toISOString(),
    status: 'pending',
    created_at: new Date().toISOString(),
  };

  try {
    // Send to PHP endpoint to populate email_followups table
    await fetch(`${TRACKING_CONFIG.trackingEndpoint}?action=schedule_recovery`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(recoveryData),
    });
  } catch (error) {
    console.warn('⚠️ Failed to schedule PHP recovery:', error);
  }

  // Also store in Firebase
  try {
    await addDoc(collection(db, 'emailFollowups'), {
      ...recoveryData,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('❌ Failed to store recovery in Firebase:', error);
  }

  return recoveryData;
};

/**
 * Determine recovery type based on abandoned phase
 */
const getRecoveryType = (phase) => {
  if (phase <= 2) return 'early_abandon'; // Just started
  if (phase <= 4) return 'mid_funnel'; // Got through analysis
  if (phase <= 6) return 'late_funnel'; // Almost completed
  return 'payment_abandon'; // Abandoned at payment
};

// ============================================================================
// EXIT INTENT TRACKING
// ============================================================================

/**
 * Initialize exit intent detection
 * Compatible with exit-intent-popup.js logic
 */
export const initExitIntent = ({
  currentPhase,
  onExitIntent,
  contactId,
  email,
}) => {
  let exitIntentTriggered = false;

  const handleMouseLeave = (e) => {
    // Only trigger if mouse moves to top of screen (leaving)
    if (e.clientY <= 0 && !exitIntentTriggered) {
      // Only show before phase threshold
      if (currentPhase < TRACKING_CONFIG.exitIntentPhaseThreshold) {
        exitIntentTriggered = true;

        // Track the event
        trackEvent({
          eventType: TRACKING_CONFIG.eventTypes.EXIT_INTENT_SHOWN,
          contactId,
          email,
          phase: currentPhase,
        });

        // Call the callback to show popup
        onExitIntent({
          discount: TRACKING_CONFIG.exitIntentDiscount,
          message: "Wait! Don't Leave Empty-Handed",
          subMessage: `Complete your enrollment now and get $${TRACKING_CONFIG.exitIntentDiscount} OFF your first month!`,
        });
      }
    }
  };

  // Mobile exit intent (scroll up quickly or back button)
  const handlePopState = () => {
    if (!exitIntentTriggered && currentPhase < TRACKING_CONFIG.exitIntentPhaseThreshold) {
      exitIntentTriggered = true;

      trackEvent({
        eventType: TRACKING_CONFIG.eventTypes.EXIT_INTENT_SHOWN,
        contactId,
        email,
        phase: currentPhase,
        metadata: { device: 'mobile' },
      });

      onExitIntent({
        discount: TRACKING_CONFIG.exitIntentDiscount,
        message: "Wait! Don't Leave Empty-Handed",
        subMessage: `Complete your enrollment now and get $${TRACKING_CONFIG.exitIntentDiscount} OFF your first month!`,
      });
    }
  };

  // Add listeners
  document.addEventListener('mouseleave', handleMouseLeave);
  window.addEventListener('popstate', handlePopState);

  // Push a state so we can detect back button
  window.history.pushState({ enrollmentInProgress: true }, '');

  // Return cleanup function
  return () => {
    document.removeEventListener('mouseleave', handleMouseLeave);
    window.removeEventListener('popstate', handlePopState);
  };
};

/**
 * Track exit intent response (accepted or dismissed)
 */
export const trackExitIntentResponse = async ({
  accepted,
  contactId,
  email,
  phase,
  discountApplied = false,
}) => {
  return trackEvent({
    eventType: accepted
      ? TRACKING_CONFIG.eventTypes.EXIT_INTENT_ACCEPTED
      : TRACKING_CONFIG.eventTypes.EXIT_INTENT_DISMISSED,
    contactId,
    email,
    phase,
    metadata: {
      discountApplied,
      discountAmount: discountApplied ? TRACKING_CONFIG.exitIntentDiscount : 0,
    },
  });
};

// ============================================================================
// INACTIVITY DETECTION
// ============================================================================

/**
 * Initialize inactivity timer for abandoned cart detection
 */
export const initInactivityTimer = ({
  onInactive,
  contactId,
  email,
  firstName,
  phone,
  currentPhase,
  formData,
  timeoutMs = TRACKING_CONFIG.abandonmentTimeout,
}) => {
  let inactivityTimer = null;
  let lastActivityTime = Date.now();

  const resetTimer = () => {
    lastActivityTime = Date.now();

    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
    }

    inactivityTimer = setTimeout(() => {
      // User has been inactive - trigger abandonment
      console.log('⏰ User inactive for', timeoutMs / 1000, 'seconds');

      trackEvent({
        eventType: TRACKING_CONFIG.eventTypes.FORM_ABANDONED,
        contactId,
        email,
        firstName,
        phone,
        phase: currentPhase,
        metadata: {
          inactiveMinutes: timeoutMs / 60000,
          formData: sanitizeFormData(formData),
        },
      });

      if (onInactive) {
        onInactive({
          phase: currentPhase,
          inactiveMinutes: timeoutMs / 60000,
        });
      }
    }, timeoutMs);
  };

  // Track user activity
  const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];

  activityEvents.forEach((event) => {
    document.addEventListener(event, resetTimer, { passive: true });
  });

  // Start initial timer
  resetTimer();

  // Return cleanup function
  return () => {
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
    }
    activityEvents.forEach((event) => {
      document.removeEventListener(event, resetTimer);
    });
  };
};

// ============================================================================
// ANALYTICS SYNC
// ============================================================================

/**
 * Sync enrollment analytics to PHP dashboard
 */
export const syncAnalytics = async ({
  contactId,
  email,
  phase,
  completed = false,
  revenue = 0,
}) => {
  const analyticsData = {
    contact_id: contactId,
    email,
    current_phase: phase,
    completed,
    revenue,
    timestamp: new Date().toISOString(),
    conversion_source: getConversionSource(),
    utm_params: getUTMParams(),
  };

  try {
    await fetch(TRACKING_CONFIG.analyticsEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(analyticsData),
    });
  } catch (error) {
    console.warn('⚠️ Failed to sync analytics:', error);
  }

  return analyticsData;
};

/**
 * Log conversion for ROI tracking
 */
export const logConversion = async ({
  contactId,
  email,
  planId,
  planPrice,
  discountApplied = 0,
}) => {
  const conversionData = {
    contact_id: contactId,
    email,
    plan_id: planId,
    plan_price: planPrice,
    discount: discountApplied,
    final_revenue: planPrice - discountApplied,
    timestamp: new Date().toISOString(),
    conversion_source: getConversionSource(),
    utm_params: getUTMParams(),
  };

  // Track as completed event
  await trackEvent({
    eventType: TRACKING_CONFIG.eventTypes.PAYMENT_COMPLETED,
    contactId,
    email,
    phase: 8,
    metadata: conversionData,
  });

  // Sync to analytics dashboard
  await syncAnalytics({
    contactId,
    email,
    phase: 10,
    completed: true,
    revenue: planPrice - discountApplied,
  });

  return conversionData;
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get or create session ID
 */
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('enrollment_session_id');

  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('enrollment_session_id', sessionId);
  }

  return sessionId;
};

/**
 * Get UTM parameters from URL
 */
const getUTMParams = () => {
  const params = new URLSearchParams(window.location.search);

  return {
    utm_source: params.get('utm_source') || '',
    utm_medium: params.get('utm_medium') || '',
    utm_campaign: params.get('utm_campaign') || '',
    utm_term: params.get('utm_term') || '',
    utm_content: params.get('utm_content') || '',
  };
};

/**
 * Determine conversion source
 */
const getConversionSource = () => {
  const utm = getUTMParams();
  const referrer = document.referrer;

  if (utm.utm_source) {
    return `${utm.utm_source}/${utm.utm_medium || 'unknown'}`;
  }

  if (referrer.includes('google')) return 'google/organic';
  if (referrer.includes('facebook')) return 'facebook/social';
  if (referrer.includes('speedycreditrepair.com')) return 'website/direct';

  return 'direct/none';
};

/**
 * Sanitize form data for logging (remove sensitive info)
 */
const sanitizeFormData = (formData) => {
  if (!formData) return {};

  const sanitized = { ...formData };

  // Remove sensitive fields
  delete sanitized.ssn;
  delete sanitized.password;

  // Mask phone partially
  if (sanitized.phone) {
    sanitized.phone = sanitized.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
  }

  return sanitized;
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  trackEvent,
  trackPhaseComplete,
  trackFormStarted,
  scheduleEmailRecovery,
  initExitIntent,
  trackExitIntentResponse,
  initInactivityTimer,
  syncAnalytics,
  logConversion,
  TRACKING_CONFIG,
};
