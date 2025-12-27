// ============================================================================
// EscalationService.js - Agent Routing & Callbacks
// ============================================================================
// Handles escalation to human agents, callback scheduling, and alerts
//
// Features:
// - Enrollment failure alerts
// - Human agent escalation
// - Callback scheduling
// - Email notifications
// - SMS alerts for critical issues
// - Task creation for team follow-up
// ============================================================================

import {
  collection,
  addDoc,
  doc,
  updateDoc,
  getDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { db, functions } from '../lib/firebase';

// ============================================================================
// CONSTANTS
// ============================================================================

const COLLECTIONS = {
  ESCALATIONS: 'escalations',
  CALLBACKS: 'callbacks',
  TASKS: 'tasks',
  NOTIFICATIONS: 'notifications',
  ENROLLMENT_FAILURES: 'enrollmentFailures',
};

const URGENCY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

const ESCALATION_TYPES = {
  ENROLLMENT_FAILURE: 'enrollment_failure',
  SECURITY_QUESTIONS_FAILED: 'security_questions_failed',
  IDENTITY_NOT_VERIFIED: 'identity_not_verified',
  TECHNICAL_ERROR: 'technical_error',
  FRAUD_ALERT: 'fraud_alert',
  USER_REQUEST: 'user_request',
  AI_DETECTED_FRUSTRATION: 'ai_detected_frustration',
  CALLBACK_REQUEST: 'callback_request',
};

const IDIQ_CONTACT = {
  phone: '1-877-875-4347',
  phoneTollFree: true,
  hoursPST: {
    weekdays: { open: '5:00 AM', close: '4:00 PM' },
    saturday: { open: '6:30 AM', close: '3:00 PM' },
    sunday: null,
  },
  hoursCST: {
    weekdays: { open: '7:00 AM', close: '6:00 PM' },
    saturday: { open: '8:30 AM', close: '5:00 PM' },
    sunday: null,
  },
};

const SCR_CONTACT = {
  phone: '(888) 724-7344',
  email: 'chris@speedycreditrepair.com',
  supportEmail: 'support@speedycreditrepair.com',
};

// ============================================================================
// IDIQ STATUS HELPERS
// ============================================================================

/**
 * Get IDIQ customer service status (open/closed)
 */
export const getIDIQStatus = () => {
  const now = new Date();
  const pacificTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
  const day = pacificTime.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const hour = pacificTime.getHours();
  const minutes = pacificTime.getMinutes();
  const currentTime = hour + (minutes / 60);

  // Sunday - Closed
  if (day === 0) {
    return {
      isOpen: false,
      message: 'Closed today (Sunday)',
      opensNext: 'Monday at 5:00 AM PT',
      color: 'error',
    };
  }

  // Saturday - 6:30 AM to 3:00 PM PT
  if (day === 6) {
    if (currentTime >= 6.5 && currentTime < 15) {
      const closesIn = Math.floor(15 - currentTime);
      return {
        isOpen: true,
        message: `Open now! Closes in ${closesIn} hour${closesIn !== 1 ? 's' : ''}`,
        closesAt: '3:00 PM PT',
        color: 'success',
      };
    } else if (currentTime < 6.5) {
      return {
        isOpen: false,
        message: 'Opens at 6:30 AM PT today',
        color: 'warning',
      };
    } else {
      return {
        isOpen: false,
        message: 'Closed for the day',
        opensNext: 'Monday at 5:00 AM PT',
        color: 'error',
      };
    }
  }

  // Monday-Friday - 5:00 AM to 4:00 PM PT
  if (currentTime >= 5 && currentTime < 16) {
    const closesIn = Math.floor(16 - currentTime);
    return {
      isOpen: true,
      message: `Open now! Closes in ${closesIn} hour${closesIn !== 1 ? 's' : ''}`,
      closesAt: '4:00 PM PT',
      color: 'success',
    };
  } else if (currentTime < 5) {
    return {
      isOpen: false,
      message: 'Opens at 5:00 AM PT today',
      color: 'warning',
    };
  } else {
    // After 4 PM
    if (day === 5) { // Friday
      return {
        isOpen: false,
        message: 'Closed for the day',
        opensNext: 'Saturday at 6:30 AM PT',
        color: 'error',
      };
    } else {
      return {
        isOpen: false,
        message: 'Closed for the day',
        opensNext: 'Tomorrow at 5:00 AM PT',
        color: 'error',
      };
    }
  }
};

// ============================================================================
// ESCALATION FUNCTIONS
// ============================================================================

/**
 * Create an escalation record
 */
export const createEscalation = async ({
  type,
  contactId,
  contactName,
  contactEmail,
  contactPhone,
  description,
  urgency = URGENCY_LEVELS.MEDIUM,
  formData = {},
  errorDetails = null,
  userId = null,
  metadata = {},
}) => {
  try {
    const escalationData = {
      type,
      contactId,
      contactName: contactName || `${formData.firstName || ''} ${formData.lastName || ''}`.trim(),
      contactEmail: contactEmail || formData.email,
      contactPhone: contactPhone || formData.phone,
      description,
      urgency,
      formData: sanitizeFormData(formData),
      errorDetails,
      userId,
      metadata,
      status: 'pending',
      assignedTo: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      resolvedAt: null,
      resolution: null,
    };

    const docRef = await addDoc(collection(db, COLLECTIONS.ESCALATIONS), escalationData);

    console.log(`Escalation created: ${docRef.id}`);

    // Trigger notifications based on urgency
    if (urgency === URGENCY_LEVELS.HIGH || urgency === URGENCY_LEVELS.CRITICAL) {
      await sendEscalationAlert({
        escalationId: docRef.id,
        ...escalationData,
      });
    }

    // Create a task for follow-up
    await createFollowUpTask({
      escalationId: docRef.id,
      contactId,
      contactName: escalationData.contactName,
      type,
      urgency,
    });

    return {
      success: true,
      escalationId: docRef.id,
    };
  } catch (error) {
    console.error('Error creating escalation:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Log enrollment failure
 */
export const logEnrollmentFailure = async ({
  contactId,
  errorType,
  errorMessage,
  formData,
  step,
  userId,
}) => {
  try {
    const failureData = {
      contactId,
      errorType,
      errorMessage,
      formData: sanitizeFormData(formData),
      step,
      userId,
      timestamp: serverTimestamp(),
      status: 'pending',
      retryCount: 0,
      lastRetryAt: null,
      resolved: false,
      resolvedAt: null,
    };

    const docRef = await addDoc(collection(db, COLLECTIONS.ENROLLMENT_FAILURES), failureData);

    // Create escalation for critical failures
    const urgency = getUrgencyFromErrorType(errorType);
    await createEscalation({
      type: ESCALATION_TYPES.ENROLLMENT_FAILURE,
      contactId,
      description: `IDIQ Enrollment failed: ${errorType} - ${errorMessage}`,
      urgency,
      formData,
      errorDetails: { errorType, errorMessage, step },
      userId,
    });

    return {
      success: true,
      failureId: docRef.id,
    };
  } catch (error) {
    console.error('Error logging enrollment failure:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Schedule a callback
 */
export const scheduleCallback = async ({
  contactId,
  contactName,
  contactPhone,
  contactEmail,
  preferredTime,
  preferredDate,
  reason,
  notes,
  userId,
}) => {
  try {
    const callbackData = {
      contactId,
      contactName,
      phone: contactPhone,
      email: contactEmail,
      preferredTime,
      preferredDate,
      reason,
      notes,
      userId,
      status: 'scheduled',
      createdAt: serverTimestamp(),
      scheduledFor: preferredDate ? new Date(`${preferredDate} ${preferredTime}`) : null,
      completedAt: null,
      outcome: null,
    };

    const docRef = await addDoc(collection(db, COLLECTIONS.CALLBACKS), callbackData);

    // Create task for the callback
    await addDoc(collection(db, COLLECTIONS.TASKS), {
      title: `Callback: ${reason}`,
      description: `Call ${contactName} at ${contactPhone}\nReason: ${reason}\n${notes || ''}`,
      contactId,
      type: 'callback',
      priority: 'high',
      status: 'pending',
      dueDate: callbackData.scheduledFor,
      assignedTo: null,
      createdBy: userId,
      createdAt: serverTimestamp(),
      relatedTo: {
        type: 'callback',
        id: docRef.id,
      },
    });

    // Send confirmation email to contact
    await sendCallbackConfirmation({
      contactEmail,
      contactName,
      preferredTime,
      preferredDate,
      reason,
    });

    return {
      success: true,
      callbackId: docRef.id,
    };
  } catch (error) {
    console.error('Error scheduling callback:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Request human agent help
 */
export const requestHumanHelp = async ({
  contactId,
  contactName,
  contactPhone,
  contactEmail,
  currentStep,
  currentField,
  issue,
  frustrationScore,
  conversationHistory,
  userId,
}) => {
  try {
    const urgency = frustrationScore > 90 ? URGENCY_LEVELS.CRITICAL :
                   frustrationScore > 70 ? URGENCY_LEVELS.HIGH :
                   URGENCY_LEVELS.MEDIUM;

    const result = await createEscalation({
      type: frustrationScore > 70 ? ESCALATION_TYPES.AI_DETECTED_FRUSTRATION : ESCALATION_TYPES.USER_REQUEST,
      contactId,
      contactName,
      contactEmail,
      contactPhone,
      description: `User requested human help at step ${currentStep}, field: ${currentField}. Issue: ${issue}`,
      urgency,
      metadata: {
        currentStep,
        currentField,
        frustrationScore,
        conversationHistory: conversationHistory?.slice(-10), // Last 10 messages
      },
      userId,
    });

    return result;
  } catch (error) {
    console.error('Error requesting human help:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// ============================================================================
// NOTIFICATION FUNCTIONS
// ============================================================================

/**
 * Send escalation alert to team
 */
const sendEscalationAlert = async (escalation) => {
  try {
    // Try to call Cloud Function for email/SMS
    const sendAlert = httpsCallable(functions, 'sendEscalationAlert');
    await sendAlert({
      escalationId: escalation.escalationId,
      type: escalation.type,
      urgency: escalation.urgency,
      contactName: escalation.contactName,
      contactEmail: escalation.contactEmail,
      contactPhone: escalation.contactPhone,
      description: escalation.description,
    });
  } catch (error) {
    console.warn('Cloud function not available, storing notification locally:', error.message);

    // Store notification for later processing
    await addDoc(collection(db, COLLECTIONS.NOTIFICATIONS), {
      type: 'escalation_alert',
      escalationId: escalation.escalationId,
      data: {
        type: escalation.type,
        urgency: escalation.urgency,
        contactName: escalation.contactName,
        description: escalation.description,
      },
      status: 'pending',
      createdAt: serverTimestamp(),
    });
  }
};

/**
 * Send callback confirmation email
 */
const sendCallbackConfirmation = async ({
  contactEmail,
  contactName,
  preferredTime,
  preferredDate,
  reason,
}) => {
  try {
    const sendEmail = httpsCallable(functions, 'manualSendEmail');
    await sendEmail({
      to: contactEmail,
      subject: 'Your Callback Request - Speedy Credit Repair',
      body: `Hi ${contactName},\n\nWe've received your callback request and will call you on ${preferredDate} at ${preferredTime}.\n\nReason: ${reason}\n\nIf you need to reschedule, please reply to this email or call us at ${SCR_CONTACT.phone}.\n\nThank you for choosing Speedy Credit Repair!`,
    });
  } catch (error) {
    console.warn('Could not send callback confirmation email:', error.message);
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Create follow-up task
 */
const createFollowUpTask = async ({
  escalationId,
  contactId,
  contactName,
  type,
  urgency,
}) => {
  const priorityMap = {
    [URGENCY_LEVELS.CRITICAL]: 'urgent',
    [URGENCY_LEVELS.HIGH]: 'high',
    [URGENCY_LEVELS.MEDIUM]: 'medium',
    [URGENCY_LEVELS.LOW]: 'low',
  };

  await addDoc(collection(db, COLLECTIONS.TASKS), {
    title: `Follow up: ${type.replace(/_/g, ' ')}`,
    description: `Escalation for ${contactName}. Review and resolve.`,
    contactId,
    type: 'escalation_followup',
    priority: priorityMap[urgency] || 'medium',
    status: 'pending',
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    assignedTo: null,
    createdBy: 'system',
    createdAt: serverTimestamp(),
    relatedTo: {
      type: 'escalation',
      id: escalationId,
    },
  });
};

/**
 * Sanitize form data (remove sensitive info for logging)
 */
const sanitizeFormData = (formData) => {
  if (!formData) return {};

  const sanitized = { ...formData };

  // Mask SSN
  if (sanitized.ssn) {
    sanitized.ssn = `***-**-${sanitized.ssn.slice(-4)}`;
  }

  // Remove passwords
  delete sanitized.password;
  delete sanitized.idiqPassword;

  return sanitized;
};

/**
 * Get urgency level from error type
 */
const getUrgencyFromErrorType = (errorType) => {
  const urgencyMap = {
    FRAUD_ALERT: URGENCY_LEVELS.CRITICAL,
    IDENTITY_NOT_VERIFIED: URGENCY_LEVELS.HIGH,
    SECURITY_QUESTIONS_FAILED: URGENCY_LEVELS.MEDIUM,
    ALREADY_ENROLLED: URGENCY_LEVELS.LOW,
    TECHNICAL_ERROR: URGENCY_LEVELS.MEDIUM,
  };

  return urgencyMap[errorType] || URGENCY_LEVELS.MEDIUM;
};

/**
 * Get recent escalations for a contact
 */
export const getContactEscalations = async (contactId, limitCount = 10) => {
  try {
    const q = query(
      collection(db, COLLECTIONS.ESCALATIONS),
      where('contactId', '==', contactId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching escalations:', error);
    return [];
  }
};

/**
 * Update escalation status
 */
export const updateEscalationStatus = async (escalationId, status, resolution = null) => {
  try {
    const docRef = doc(db, COLLECTIONS.ESCALATIONS, escalationId);
    await updateDoc(docRef, {
      status,
      resolution,
      updatedAt: serverTimestamp(),
      resolvedAt: status === 'resolved' ? serverTimestamp() : null,
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating escalation:', error);
    return { success: false, error: error.message };
  }
};

// ============================================================================
// EXPORTS
// ============================================================================

export {
  URGENCY_LEVELS,
  ESCALATION_TYPES,
  IDIQ_CONTACT,
  SCR_CONTACT,
};

export default {
  createEscalation,
  logEnrollmentFailure,
  scheduleCallback,
  requestHumanHelp,
  getIDIQStatus,
  getContactEscalations,
  updateEscalationStatus,
  URGENCY_LEVELS,
  ESCALATION_TYPES,
  IDIQ_CONTACT,
  SCR_CONTACT,
};
