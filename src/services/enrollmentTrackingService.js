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
// SECURITY:
// - Admin secret token required for tracking.php endpoint
// - CSRF protection via session_id
// - Rate limiting via timestamp checks
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

  // Admin secret for tracking.php authentication (from environment)
  adminSecret: import.meta.env.VITE_TRACKING_ADMIN_SECRET || 'speedy_tracking_2025',

  // Exit intent discount
  exitIntentDiscount: 50,
  exitIntentPhaseThreshold: 5, // Show exit intent before phase 5

  // Inactivity timeout for abandoned cart (in milliseconds)
  abandonmentTimeout: 15 * 60 * 1000, // 15 minutes

  // MySQL table column mapping (matches email-tracking-schema.sql)
  mysqlColumns: {
    eventType: 'event_type',
    contactId: 'contact_id',
    email: 'email',
    phone: 'phone',
    firstName: 'first_name',
    currentPhase: 'current_phase',
    timestamp: 'created_at',
    userAgent: 'user_agent',
    referrer: 'referrer',
    pageUrl: 'page_url',
    sessionId: 'session_id',
    metadata: 'metadata',
    deviceType: 'device_type',
    timeOnPage: 'time_on_page',
  },

  // Event types for MySQL tracking (matches tracking.js)
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
    PAGE_VIEW: 'page_view',
    BUTTON_CLICK: 'button_click',
  },

  // Recovery sequence timing (matches EMAIL_RECOVERY_SYSTEM_PLAN)
  recoverySequence: {
    sms: { delayMinutes: 15, channel: 'sms' },
    email1: { delayMinutes: 60, channel: 'email', template: 'abandoned_cart_1' },
    email2: { delayMinutes: 1440, channel: 'email', template: 'abandoned_cart_2' }, // 24 hours
    email3: { delayMinutes: 4320, channel: 'email', template: 'final_reminder' }, // 72 hours
  },
};

// Page load timestamp for time-on-page calculation
const PAGE_LOAD_TIME = Date.now();

// ============================================================================
// TRACKING EVENT INTERFACE
// ============================================================================

/**
 * Track enrollment event to MySQL via PHP endpoint
 * Compatible with tracking.php and tracking.js structure
 *
 * MySQL Schema (email_followups / enrollment_events):
 * - id, event_type, contact_id, email, phone, first_name
 * - current_phase, device_type, time_on_page, user_agent
 * - referrer, page_url, session_id, metadata, created_at
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

  const timeOnPage = Math.round((Date.now() - PAGE_LOAD_TIME) / 1000);
  const deviceType = detectDeviceType();

  // Build payload matching MySQL schema
  const eventData = {
    // Required fields
    event_type: eventType,
    contact_id: contactId,
    email: email,
    phone: phone,
    first_name: firstName,
    current_phase: phase,

    // Analytics fields (for enrollment-analytics.php dashboard)
    device_type: deviceType,
    time_on_page: timeOnPage,
    timestamp: new Date().toISOString(),
    user_agent: navigator.userAgent,
    referrer: document.referrer,
    page_url: window.location.href,
    session_id: getSessionId(),

    // Extended metadata as JSON
    metadata: JSON.stringify({
      ...metadata,
      utm: getUTMParams(),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }),

    // Security: Admin secret token
    admin_secret: TRACKING_CONFIG.adminSecret,

    // CSRF protection
    csrf_token: getCSRFToken(),
  };

  try {
    // Send to PHP tracking endpoint with authentication
    const response = await fetch(TRACKING_CONFIG.trackingEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Secret': TRACKING_CONFIG.adminSecret,
        'X-Session-ID': getSessionId(),
      },
      body: JSON.stringify(eventData),
      credentials: 'include', // Include cookies for session
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn('⚠️ PHP tracking endpoint returned error:', response.status, errorText);
    } else {
      const result = await response.json().catch(() => ({ success: true }));
      console.log('✅ Event tracked in MySQL:', result);
    }
  } catch (error) {
    console.warn('⚠️ Failed to send to PHP tracking (using Firebase fallback):', error.message);
  }

  // Also log to Firebase for redundancy
  try {
    await addDoc(collection(db, 'enrollmentTracking'), {
      ...eventData,
      metadata: { ...metadata, utm: getUTMParams() }, // Keep as object in Firebase
      admin_secret: undefined, // Don't store secret in Firebase
      csrf_token: undefined,
      createdAt: serverTimestamp(),
    });
  } catch (firebaseError) {
    console.error('❌ Firebase tracking fallback failed:', firebaseError);
  }

  // If this is an abandonment event, schedule recovery sequence
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
 * Maps to step[N]_complete events in MySQL
 */
export const trackPhaseComplete = async ({
  phase,
  contactId,
  email,
  phone,
  firstName,
  formData = {},
}) => {
  // MySQL event_type mapping for conversion funnel
  const milestoneMap = {
    1: 'step1_complete', // Lead capture - email_followups trigger point
    2: 'step2_complete', // Analysis started
    3: 'step3_complete', // Analysis complete - key recovery trigger
    4: 'step4_complete', // Documents uploaded
    5: 'step5_complete', // Signature complete
    6: 'step6_complete', // Plan selected
    7: 'step7_complete', // Payment started - payment_started event
    8: 'step8_complete', // Payment complete
    9: 'step9_complete', // Portal preview
    10: 'form_completed', // Enrollment complete - conversion!
  };

  // Track payment_started separately for analytics
  if (phase === 7) {
    await trackEvent({
      eventType: TRACKING_CONFIG.eventTypes.PAYMENT_STARTED,
      contactId,
      email,
      phone,
      firstName,
      phase,
      metadata: { plan: formData.selectedPlan },
    });
  }

  return trackEvent({
    eventType: milestoneMap[phase] || `phase${phase}_complete`,
    contactId,
    email,
    phone,
    firstName,
    phase,
    metadata: {
      formData: sanitizeFormData(formData),
      funnelPosition: phase,
      funnelTotal: 10,
      completionPercentage: Math.round((phase / 10) * 100),
    },
  });
};

/**
 * Track form start - first entry into funnel
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
      entryTime: new Date().toISOString(),
      deviceType: detectDeviceType(),
    },
  });
};

// ============================================================================
// ABANDONED CART RECOVERY (email_followups table)
// ============================================================================

/**
 * Schedule email/SMS recovery for abandoned enrollment
 * Populates email_followups table via tracking.php?action=schedule_recovery
 *
 * Recovery Sequence (from EMAIL_RECOVERY_SYSTEM_PLAN):
 * 1. SMS via carrier gateway: 15 minutes
 * 2. Email #1 (urgency): 1 hour
 * 3. Email #2 (value): 24 hours
 * 4. Email #3 (final): 72 hours
 */
export const scheduleEmailRecovery = async ({
  email,
  phone,
  firstName,
  phase,
  contactId,
}) => {
  console.log('📧 Scheduling recovery sequence for abandoned enrollment at phase', phase);

  const recoveryType = getRecoveryType(phase);
  const now = Date.now();

  // Build recovery sequence entries for email_followups table
  const recoveryEntries = Object.entries(TRACKING_CONFIG.recoverySequence).map(([key, config]) => ({
    email,
    phone,
    first_name: firstName,
    contact_id: contactId,
    abandoned_phase: phase,
    recovery_type: recoveryType,
    channel: config.channel,
    template: config.template || `recovery_${key}`,
    scheduled_time: new Date(now + config.delayMinutes * 60 * 1000).toISOString(),
    status: 'pending',
    created_at: new Date().toISOString(),
    sequence_order: key,
  }));

  try {
    // Send to PHP endpoint to populate email_followups table
    const response = await fetch(`${TRACKING_CONFIG.trackingEndpoint}?action=schedule_recovery`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Secret': TRACKING_CONFIG.adminSecret,
      },
      body: JSON.stringify({
        admin_secret: TRACKING_CONFIG.adminSecret,
        entries: recoveryEntries,
        contact_id: contactId,
        email: email,
        phone: phone,
        abandoned_phase: phase,
        recovery_type: recoveryType,
      }),
    });

    if (response.ok) {
      console.log('✅ Recovery sequence scheduled in MySQL email_followups');
    }
  } catch (error) {
    console.warn('⚠️ Failed to schedule PHP recovery:', error);
  }

  // Also store in Firebase as backup
  try {
    for (const entry of recoveryEntries) {
      await addDoc(collection(db, 'emailFollowups'), {
        ...entry,
        createdAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('❌ Failed to store recovery in Firebase:', error);
  }

  return recoveryEntries;
};

/**
 * Determine recovery type based on abandoned phase
 * Different recovery templates for different funnel positions
 */
const getRecoveryType = (phase) => {
  if (phase <= 2) return 'early_abandon'; // Just started - aggressive recovery
  if (phase <= 4) return 'mid_funnel'; // Got through analysis - show value
  if (phase <= 6) return 'late_funnel'; // Almost completed - urgency
  return 'payment_abandon'; // Abandoned at payment - highest value recovery
};

// ============================================================================
// EXIT INTENT TRACKING (exit-intent-popup.js integration)
// ============================================================================

/**
 * Initialize exit intent detection
 * Compatible with exit-intent-popup.js logic
 * Shows popup before Phase 5 with $50 discount
 */
export const initExitIntent = ({
  currentPhase,
  onExitIntent,
  contactId,
  email,
}) => {
  let exitIntentTriggered = false;
  let scrollDepth = 0;

  // Track scroll depth for analytics
  const handleScroll = () => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    scrollDepth = Math.round((window.scrollY / docHeight) * 100) || 0;
  };

  const handleMouseLeave = (e) => {
    // Only trigger if mouse moves to top of screen (leaving)
    if (e.clientY <= 0 && !exitIntentTriggered) {
      // Only show before phase threshold (Phase 5)
      if (currentPhase < TRACKING_CONFIG.exitIntentPhaseThreshold) {
        exitIntentTriggered = true;

        // Track the event in MySQL
        trackEvent({
          eventType: TRACKING_CONFIG.eventTypes.EXIT_INTENT_SHOWN,
          contactId,
          email,
          phase: currentPhase,
          metadata: {
            device: 'desktop',
            scrollDepth,
            timeOnPage: Math.round((Date.now() - PAGE_LOAD_TIME) / 1000),
          },
        });

        // Call the callback to show popup with discount
        onExitIntent({
          discount: TRACKING_CONFIG.exitIntentDiscount,
          message: "Wait! Don't Leave Empty-Handed",
          subMessage: `Complete your enrollment now and get $${TRACKING_CONFIG.exitIntentDiscount} OFF your first month!`,
          features: [
            'FREE Credit Analysis',
            'No Hidden Fees',
            'Cancel Anytime',
          ],
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
        metadata: {
          device: 'mobile',
          trigger: 'back_button',
          scrollDepth,
        },
      });

      onExitIntent({
        discount: TRACKING_CONFIG.exitIntentDiscount,
        message: "Wait! Don't Leave Empty-Handed",
        subMessage: `Complete your enrollment now and get $${TRACKING_CONFIG.exitIntentDiscount} OFF your first month!`,
        features: [
          'FREE Credit Analysis',
          'No Hidden Fees',
          'Cancel Anytime',
        ],
      });
    }
  };

  // Visibility change (tab switch on mobile)
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden' && !exitIntentTriggered) {
      if (currentPhase < TRACKING_CONFIG.exitIntentPhaseThreshold) {
        // Don't show popup, but track the intent
        trackEvent({
          eventType: 'tab_switch_intent',
          contactId,
          email,
          phase: currentPhase,
          metadata: { scrollDepth },
        });
      }
    }
  };

  // Add listeners
  document.addEventListener('mouseleave', handleMouseLeave);
  window.addEventListener('popstate', handlePopState);
  window.addEventListener('scroll', handleScroll, { passive: true });
  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Push a state so we can detect back button
  window.history.pushState({ enrollmentInProgress: true }, '');

  // Return cleanup function
  return () => {
    document.removeEventListener('mouseleave', handleMouseLeave);
    window.removeEventListener('popstate', handlePopState);
    window.removeEventListener('scroll', handleScroll);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
};

/**
 * Track exit intent response (accepted or dismissed)
 * When accepted, discount should flow to Phase 7 payment
 */
export const trackExitIntentResponse = async ({
  accepted,
  contactId,
  email,
  phase,
  discountApplied = false,
}) => {
  const eventType = accepted
    ? TRACKING_CONFIG.eventTypes.EXIT_INTENT_ACCEPTED
    : TRACKING_CONFIG.eventTypes.EXIT_INTENT_DISMISSED;

  // If accepted, also track discount applied
  if (accepted && discountApplied) {
    await trackEvent({
      eventType: TRACKING_CONFIG.eventTypes.DISCOUNT_APPLIED,
      contactId,
      email,
      phase,
      metadata: {
        discountAmount: TRACKING_CONFIG.exitIntentDiscount,
        discountSource: 'exit_intent',
      },
    });
  }

  return trackEvent({
    eventType,
    contactId,
    email,
    phase,
    metadata: {
      discountApplied,
      discountAmount: discountApplied ? TRACKING_CONFIG.exitIntentDiscount : 0,
      responseTime: Math.round((Date.now() - PAGE_LOAD_TIME) / 1000),
    },
  });
};

// ============================================================================
// INACTIVITY DETECTION (15-minute SMS trigger)
// ============================================================================

/**
 * Initialize inactivity timer for abandoned cart detection
 * Triggers SMS recovery via carrier gateway after 15 minutes
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
  let warningShown = false;

  const resetTimer = () => {
    lastActivityTime = Date.now();

    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
    }

    // Show warning at 12 minutes (3 minutes before trigger)
    const warningTimeout = setTimeout(() => {
      if (!warningShown && currentPhase < 8) {
        warningShown = true;
        console.log('⚠️ User inactive for 12 minutes - warning');
      }
    }, timeoutMs - 180000);

    inactivityTimer = setTimeout(async () => {
      // User has been inactive - trigger abandonment
      console.log('⏰ User inactive for', timeoutMs / 1000, 'seconds - triggering recovery');

      // Track abandonment in MySQL
      await trackEvent({
        eventType: TRACKING_CONFIG.eventTypes.FORM_ABANDONED,
        contactId,
        email,
        firstName,
        phone,
        phase: currentPhase,
        metadata: {
          inactiveMinutes: timeoutMs / 60000,
          formData: sanitizeFormData(formData),
          triggerType: 'inactivity_timeout',
        },
      });

      // Call the callback to trigger SMS recovery
      if (onInactive) {
        onInactive({
          phase: currentPhase,
          inactiveMinutes: timeoutMs / 60000,
          contactId,
          email,
          phone,
          firstName,
        });
      }
    }, timeoutMs);

    return () => clearTimeout(warningTimeout);
  };

  // Track user activity
  const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];

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
// ANALYTICS SYNC (enrollment-analytics.php dashboard)
// ============================================================================

/**
 * Sync enrollment analytics to PHP dashboard
 * Data points: conversion funnel, device type, time-on-page
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
    device_type: detectDeviceType(),
    time_on_page: Math.round((Date.now() - PAGE_LOAD_TIME) / 1000),
    browser: getBrowserInfo(),
    admin_secret: TRACKING_CONFIG.adminSecret,
  };

  try {
    await fetch(TRACKING_CONFIG.analyticsEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Secret': TRACKING_CONFIG.adminSecret,
      },
      body: JSON.stringify(analyticsData),
    });
    console.log('✅ Analytics synced to dashboard');
  } catch (error) {
    console.warn('⚠️ Failed to sync analytics:', error);
  }

  return analyticsData;
};

/**
 * Log conversion for ROI tracking
 * Called when payment is completed
 */
export const logConversion = async ({
  contactId,
  email,
  planId,
  planPrice,
  discountApplied = 0,
}) => {
  const finalRevenue = planPrice - discountApplied;

  const conversionData = {
    contact_id: contactId,
    email,
    plan_id: planId,
    plan_price: planPrice,
    discount: discountApplied,
    discount_source: discountApplied > 0 ? 'exit_intent' : null,
    final_revenue: finalRevenue,
    timestamp: new Date().toISOString(),
    conversion_source: getConversionSource(),
    utm_params: getUTMParams(),
    device_type: detectDeviceType(),
    time_to_conversion: Math.round((Date.now() - PAGE_LOAD_TIME) / 1000),
    session_id: getSessionId(),
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
    revenue: finalRevenue,
  });

  console.log('💰 Conversion logged:', { planId, finalRevenue, discountApplied });

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
 * Get CSRF token (generate if not exists)
 */
const getCSRFToken = () => {
  let token = sessionStorage.getItem('csrf_token');

  if (!token) {
    token = `csrf_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
    sessionStorage.setItem('csrf_token', token);
  }

  return token;
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
    gclid: params.get('gclid') || '', // Google Ads
    fbclid: params.get('fbclid') || '', // Facebook Ads
  };
};

/**
 * Detect device type for analytics
 */
const detectDeviceType = () => {
  const ua = navigator.userAgent;

  if (/tablet|ipad|playbook|silk/i.test(ua)) {
    return 'tablet';
  }
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
};

/**
 * Get browser info for analytics
 */
const getBrowserInfo = () => {
  const ua = navigator.userAgent;
  let browser = 'unknown';

  if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari')) browser = 'Safari';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Edge')) browser = 'Edge';

  return browser;
};

/**
 * Determine conversion source
 */
const getConversionSource = () => {
  const utm = getUTMParams();
  const referrer = document.referrer;

  if (utm.gclid) return 'google_ads';
  if (utm.fbclid) return 'facebook_ads';
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
  delete sanitized.creditCard;
  delete sanitized.cvv;

  // Mask phone partially
  if (sanitized.phone) {
    sanitized.phone = sanitized.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
  }

  // Mask email partially
  if (sanitized.email) {
    const [local, domain] = sanitized.email.split('@');
    sanitized.email = `${local.slice(0, 2)}***@${domain}`;
  }

  return sanitized;
};

// ============================================================================
// EXPORTS
// ============================================================================

export { TRACKING_CONFIG };

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
