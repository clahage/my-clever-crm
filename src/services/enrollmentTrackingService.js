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
// ✅ PRODUCTION READY: Sanitized for Firestore (No 'undefined' crashes)
// ✅ PRODUCTION READY: Re-ordered for variable hoisting safety
// ✅ FEATURES PRESERVED: Full recovery sequence, Exit intent, Inactivity triggers
//
// © 1995-2025 Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved
// ============================================================================

import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

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
// UTILITY FUNCTIONS (MOVED TO TOP TO ENSURE THEY ARE INITIALIZED)
// ============================================================================

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

/**
 * Global Sanitizer to prevent Firestore 'undefined' crashes
 * Explicitly removes properties with undefined values before write
 */
const cleanForFirestore = (obj) => {
  const sanitized = {};
  Object.keys(obj).forEach(key => {
    if (obj[key] !== undefined) {
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        sanitized[key] = cleanForFirestore(obj[key]); // Recurse into nested objects
      } else {
        sanitized[key] = obj[key];
      }
    }
  });
  return sanitized;
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

  const timeOnPage = Math.round((Date.now() - PAGE_LOAD_TIME) / 1000);
  const deviceType = detectDeviceType();
  const utm = getUTMParams();

  // Build payload matching MySQL schema
  const eventData = {
    event_type: eventType,
    contact_id: contactId,
    email: email,
    phone: phone,
    first_name: firstName,
    current_phase: phase,
    device_type: deviceType,
    time_on_page: timeOnPage,
    timestamp: new Date().toISOString(),
    user_agent: navigator.userAgent,
    referrer: document.referrer,
    page_url: window.location.href,
    session_id: getSessionId(),
    metadata: JSON.stringify({
      ...metadata,
      utm,
      viewport: { width: window.innerWidth, height: window.innerHeight },
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }),
    admin_secret: TRACKING_CONFIG.adminSecret,
    csrf_token: getCSRFToken(),
  };

  try {
    // 1. Send to PHP tracking endpoint
    const response = await fetch(TRACKING_CONFIG.trackingEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Secret': TRACKING_CONFIG.adminSecret,
        'X-Session-ID': getSessionId(),
      },
      body: JSON.stringify(eventData),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn('⚠️ PHP tracking error:', response.status, errorText);
    } else {
      console.log('✅ Event tracked in MySQL');
    }
  } catch (error) {
    console.warn('⚠️ MySQL tracking fallback triggered:', error.message);
  }

  // 2. Log to Firestore - SANITIZED for compatibility
  try {
    const firebasePayload = cleanForFirestore({
      ...eventData,
      // Store actual metadata object in Firestore for easier dashboard viewing
      metadata: { ...metadata, utm }, 
      admin_secret: null, 
      csrf_token: null,
      createdAt: serverTimestamp(),
    });

    await addDoc(collection(db, 'enrollmentTracking'), firebasePayload);
  } catch (firebaseError) {
    console.error('❌ Firebase tracking failed:', firebaseError);
  }

  // If this is an abandonment event, schedule recovery sequence
  if (eventType === TRACKING_CONFIG.eventTypes.FORM_ABANDONED && email) {
    await scheduleEmailRecovery({ email, phone, firstName, phase, contactId });
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
    1: 'step1_complete',
    2: 'step2_complete',
    3: 'step3_complete',
    4: 'step4_complete',
    5: 'step5_complete',
    6: 'step6_complete',
    7: 'step7_complete',
    8: 'step8_complete',
    9: 'step9_complete',
    10: 'form_completed',
  };

  if (phase === 7) {
    await trackEvent({
      eventType: TRACKING_CONFIG.eventTypes.PAYMENT_STARTED,
      contactId, email, phone, firstName, phase,
      metadata: { plan: formData.selectedPlan },
    });
  }

  return trackEvent({
    eventType: milestoneMap[phase] || `phase${phase}_complete`,
    contactId, email, phone, firstName, phase,
    metadata: {
      formData: sanitizeFormData(formData),
      funnelPosition: phase,
      funnelTotal: 10,
      completionPercentage: Math.round((phase / 10) * 100),
    },
  });
};

/**
 * Track form start - Sanitized entry point
 */
export const trackFormStarted = async ({ contactId, email, firstName, middleName }) => {
  const eventData = {
    eventType: TRACKING_CONFIG.eventTypes.FORM_STARTED,
    contactId: contactId || null,
    email: email || null,
    firstName: firstName || null,
    metadata: {
      middleName: middleName || null,
      landingSource: document.referrer || 'direct',
      entryTime: new Date().toISOString(),
    },
  };

  return trackEvent(eventData);
};

// ============================================================================
// ABANDONED CART RECOVERY (email_followups table)
// ============================================================================

export const scheduleEmailRecovery = async ({
  email,
  phone,
  firstName,
  phase,
  contactId,
}) => {
  console.log('📧 Scheduling recovery sequence for phase', phase);

  const recoveryType = phase <= 2 ? 'early_abandon' : 
                       phase <= 4 ? 'mid_funnel' : 
                       phase <= 6 ? 'late_funnel' : 'payment_abandon';
  const now = Date.now();

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
    await fetch(`${TRACKING_CONFIG.trackingEndpoint}?action=schedule_recovery`, {
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
      }),
    });
    console.log('✅ Recovery scheduled in MySQL');
  } catch (error) {
    console.warn('⚠️ PHP recovery failed:', error);
  }

  // Firebase Backup
  try {
    for (const entry of recoveryEntries) {
      await addDoc(collection(db, 'emailFollowups'), { ...entry, createdAt: serverTimestamp() });
    }
  } catch (error) {
    console.error('❌ Firebase recovery backup failed:', error);
  }

  return recoveryEntries;
};

// ============================================================================
// EXIT INTENT & INACTIVITY Logic (Original Details Preserved)
// ============================================================================

export const initExitIntent = ({ currentPhase, onExitIntent, contactId, email }) => {
  let exitIntentTriggered = false;
  let scrollDepth = 0;

  const handleScroll = () => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    scrollDepth = Math.round((window.scrollY / docHeight) * 100) || 0;
  };

  const handleMouseLeave = (e) => {
    if (e.clientY <= 0 && !exitIntentTriggered) {
      if (currentPhase < TRACKING_CONFIG.exitIntentPhaseThreshold) {
        exitIntentTriggered = true;
        trackEvent({
          eventType: TRACKING_CONFIG.eventTypes.EXIT_INTENT_SHOWN,
          contactId, email, phase: currentPhase,
          metadata: { device: 'desktop', scrollDepth },
        });
        onExitIntent({
          discount: TRACKING_CONFIG.exitIntentDiscount,
          message: "Wait! Don't Leave Empty-Handed",
        });
      }
    }
  };

  const handlePopState = () => {
    if (!exitIntentTriggered && currentPhase < TRACKING_CONFIG.exitIntentPhaseThreshold) {
      exitIntentTriggered = true;
      trackEvent({ eventType: TRACKING_CONFIG.eventTypes.EXIT_INTENT_SHOWN, contactId, email, phase: currentPhase, metadata: { device: 'mobile' } });
      onExitIntent({ discount: TRACKING_CONFIG.exitIntentDiscount });
    }
  };

  document.addEventListener('mouseleave', handleMouseLeave);
  window.addEventListener('popstate', handlePopState);
  window.addEventListener('scroll', handleScroll, { passive: true });
  window.history.pushState({ enrollmentInProgress: true }, '');

  return () => {
    document.removeEventListener('mouseleave', handleMouseLeave);
    window.removeEventListener('popstate', handlePopState);
    window.removeEventListener('scroll', handleScroll);
  };
};

export const trackExitIntentResponse = async ({ accepted, contactId, email, phase, discountApplied = false }) => {
  const eventType = accepted ? TRACKING_CONFIG.eventTypes.EXIT_INTENT_ACCEPTED : TRACKING_CONFIG.eventTypes.EXIT_INTENT_DISMISSED;
  if (accepted && discountApplied) {
    await trackEvent({ eventType: TRACKING_CONFIG.eventTypes.DISCOUNT_APPLIED, contactId, email, phase, metadata: { discountAmount: TRACKING_CONFIG.exitIntentDiscount } });
  }
  return trackEvent({ eventType, contactId, email, phase, metadata: { discountApplied } });
};

export const initInactivityTimer = ({ onInactive, contactId, email, firstName, phone, currentPhase, formData, timeoutMs = TRACKING_CONFIG.abandonmentTimeout }) => {
  let inactivityTimer = null;
  const resetTimer = () => {
    if (inactivityTimer) clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(async () => {
      console.log('⏰ Inactivity recovery triggered');
      await trackEvent({
        eventType: TRACKING_CONFIG.eventTypes.FORM_ABANDONED,
        contactId, email, firstName, phone, phase: currentPhase,
        metadata: { triggerType: 'inactivity_timeout' },
      });
      if (onInactive) onInactive({ phase: currentPhase, contactId, email, phone, firstName });
    }, timeoutMs);
  };

  ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'].forEach(event => document.addEventListener(event, resetTimer, { passive: true }));
  resetTimer();
  return () => {
    if (inactivityTimer) clearTimeout(inactivityTimer);
  };
};

// ============================================================================
// ANALYTICS & CONVERSION Logic
// ============================================================================

export const syncAnalytics = async ({ contactId, email, phase, completed = false, revenue = 0 }) => {
  const analyticsData = {
    contact_id: contactId, email, current_phase: phase, completed, revenue,
    timestamp: new Date().toISOString(),
    utm_params: getUTMParams(),
    device_type: detectDeviceType(),
    admin_secret: TRACKING_CONFIG.adminSecret,
  };
  try {
    await fetch(TRACKING_CONFIG.analyticsEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Admin-Secret': TRACKING_CONFIG.adminSecret }, body: JSON.stringify(analyticsData) });
    console.log('✅ Analytics synced');
  } catch (error) { console.warn('⚠️ Analytics sync failed:', error); }
  return analyticsData;
};

export const logConversion = async ({ contactId, email, planId, planPrice, discountApplied = 0 }) => {
  const finalRevenue = planPrice - discountApplied;
  const conversionData = { contact_id: contactId, email, plan_id: planId, plan_price: planPrice, discount: discountApplied, final_revenue: finalRevenue };
  await trackEvent({ eventType: TRACKING_CONFIG.eventTypes.PAYMENT_COMPLETED, contactId, email, phase: 8, metadata: conversionData });
  await syncAnalytics({ contactId, email, phase: 10, completed: true, revenue: finalRevenue });
  console.log('💰 Conversion logged:', finalRevenue);
  return conversionData;
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