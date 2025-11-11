// ===================================================================
// Email Notification Service
// Monitors email prefixes and converts them to mobile app notifications
//
// This service replaces SMS notifications (which aren't available via
// Twilio for credit repair companies) with an email-based notification
// system using Google Workspace email prefixes.
// ===================================================================

import {
  EMAIL_PREFIXES,
  getConfigByEmail,
  createNotificationPayload,
  getNotificationRoute,
  getAllMonitoredEmails
} from '@/config/emailPrefixConfig';

// ===================================================================
// EMAIL MONITORING
// ===================================================================

/**
 * Poll email inbox for new notifications
 * This should be called by the mobile app at regular intervals
 *
 * @param {string} lastCheckTimestamp - ISO timestamp of last check
 * @returns {Promise<Array>} - Array of new notifications
 */
export async function pollEmailNotifications(lastCheckTimestamp) {
  try {
    // In production, this would call your backend API
    // which uses Gmail API to check the monitored email addresses

    const response = await fetch('/api/email/poll', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lastCheck: lastCheckTimestamp,
        monitoredEmails: getAllMonitoredEmails()
      })
    });

    if (!response.ok) {
      throw new Error('Failed to poll email notifications');
    }

    const { emails } = await response.json();

    // Convert emails to notification payloads
    const notifications = emails.map(email =>
      createNotificationPayload(
        email.to, // The email prefix address it was sent to
        email.subject,
        email.body,
        {
          messageId: email.id,
          sentAt: email.timestamp
        }
      )
    ).filter(Boolean); // Remove null values

    return notifications;
  } catch (error) {
    console.error('Error polling email notifications:', error);
    return [];
  }
}

/**
 * Send notification via email prefix
 *
 * @param {string} prefixType - Type of notification (from EMAIL_PREFIXES keys)
 * @param {string} subject - Email subject / notification title
 * @param {string} message - Email body / notification message
 * @param {Object} metadata - Additional data
 * @returns {Promise<Object>} - Send result
 */
export async function sendEmailNotification(prefixType, subject, message, metadata = {}) {
  try {
    const config = EMAIL_PREFIXES[prefixType];

    if (!config) {
      throw new Error(`Invalid notification type: ${prefixType}`);
    }

    // Send email via backend API
    const response = await fetch('/api/email/send-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: config.email,
        from: 'system@speedycreditrepair.com',
        subject,
        body: message,
        priority: config.priority,
        metadata
      })
    });

    if (!response.ok) {
      throw new Error('Failed to send email notification');
    }

    const result = await response.json();

    return {
      success: true,
      messageId: result.messageId,
      email: config.email,
      priority: config.priority
    };
  } catch (error) {
    console.error('Error sending email notification:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ===================================================================
// NOTIFICATION HELPERS
// ===================================================================

/**
 * Send urgent alert (critical priority)
 */
export async function sendUrgentAlert(subject, message, metadata = {}) {
  return sendEmailNotification('URGENT', subject, message, metadata);
}

/**
 * Send dispute update notification
 */
export async function sendDisputeUpdate(clientName, updateMessage, metadata = {}) {
  const subject = `Dispute Update: ${clientName}`;
  return sendEmailNotification('DISPUTE_UPDATE', subject, updateMessage, metadata);
}

/**
 * Send fax confirmation notification
 */
export async function sendFaxConfirmation(bureau, status, metadata = {}) {
  const subject = `Fax ${status}: ${bureau}`;
  const message = `Dispute fax to ${bureau} ${status.toLowerCase()}`;
  return sendEmailNotification('DISPUTE_FAX', subject, message, metadata);
}

/**
 * Send credit report notification
 */
export async function sendCreditReportUpdate(clientName, reportType, metadata = {}) {
  const subject = `Credit Report: ${clientName}`;
  const message = `New ${reportType} available for ${clientName}`;
  return sendEmailNotification('CREDIT_REPORT', subject, message, metadata);
}

/**
 * Send payment success notification
 */
export async function sendPaymentSuccess(clientName, amount, method, metadata = {}) {
  const subject = `Payment Received: $${amount}`;
  const message = `${clientName} - ${method} payment of $${amount} confirmed`;
  return sendEmailNotification('PAYMENT_SUCCESS', subject, message, metadata);
}

/**
 * Send payment pending notification
 */
export async function sendPaymentPending(clientName, amount, method, metadata = {}) {
  const subject = `Payment Processing: $${amount}`;
  const message = `${clientName} - ${method} payment of $${amount} is processing`;
  return sendEmailNotification('PAYMENT_PENDING', subject, message, metadata);
}

/**
 * Send payment failed notification
 */
export async function sendPaymentFailed(clientName, amount, reason, metadata = {}) {
  const subject = `Payment Failed: ${clientName}`;
  const message = `${method} payment of $${amount} failed: ${reason}`;
  return sendEmailNotification('PAYMENT_FAILED', subject, message, metadata);
}

/**
 * Send billing reminder
 */
export async function sendBillingReminder(clientName, amount, dueDate, metadata = {}) {
  const subject = `Invoice Due: ${clientName}`;
  const message = `Invoice of $${amount} due on ${dueDate}`;
  return sendEmailNotification('BILLING_REMINDER', subject, message, metadata);
}

/**
 * Send client message notification
 */
export async function sendClientMessage(clientName, messagePreview, metadata = {}) {
  const subject = `New Message: ${clientName}`;
  return sendEmailNotification('CLIENT_MESSAGE', subject, messagePreview, metadata);
}

/**
 * Send document upload notification
 */
export async function sendDocumentUpload(clientName, documentType, metadata = {}) {
  const subject = `Document Uploaded: ${clientName}`;
  const message = `${clientName} uploaded ${documentType}`;
  return sendEmailNotification('DOCUMENT_UPLOAD', subject, message, metadata);
}

/**
 * Send task reminder
 */
export async function sendTaskReminder(taskTitle, dueDate, metadata = {}) {
  const subject = `Task Due: ${taskTitle}`;
  const message = `Task "${taskTitle}" is due ${dueDate}`;
  return sendEmailNotification('TASK_REMINDER', subject, message, metadata);
}

/**
 * Send appointment reminder
 */
export async function sendAppointmentReminder(clientName, appointmentTime, metadata = {}) {
  const subject = `Appointment: ${clientName}`;
  const message = `Appointment with ${clientName} at ${appointmentTime}`;
  return sendEmailNotification('APPOINTMENT_REMINDER', subject, message, metadata);
}

/**
 * Send affiliate update
 */
export async function sendAffiliateUpdate(eventType, details, metadata = {}) {
  const subject = `Affiliate: ${eventType}`;
  return sendEmailNotification('AFFILIATE_UPDATE', subject, details, metadata);
}

/**
 * Send system notification
 */
export async function sendSystemNotification(subject, message, metadata = {}) {
  return sendEmailNotification('SYSTEM_NOTIFICATION', subject, message, metadata);
}

/**
 * Send admin alert
 */
export async function sendAdminAlert(subject, message, metadata = {}) {
  return sendEmailNotification('ADMIN_ALERT', subject, message, metadata);
}

// ===================================================================
// MOBILE APP INTEGRATION
// ===================================================================

/**
 * Initialize notification monitoring for mobile app
 * This should be called when the mobile app starts
 *
 * @param {Function} onNotificationReceived - Callback when new notification arrives
 * @param {number} pollInterval - How often to check for emails (milliseconds)
 * @returns {Object} - Polling controller
 */
export function startNotificationMonitoring(onNotificationReceived, pollInterval = 30000) {
  let lastCheck = new Date().toISOString();
  let isRunning = true;

  const poll = async () => {
    if (!isRunning) return;

    try {
      const notifications = await pollEmailNotifications(lastCheck);

      if (notifications.length > 0) {
        notifications.forEach(notification => {
          // Add route information
          notification.route = getNotificationRoute(notification);

          // Call callback with notification
          onNotificationReceived(notification);
        });

        // Update last check time
        lastCheck = new Date().toISOString();
      }
    } catch (error) {
      console.error('Error in notification monitoring:', error);
    }

    // Schedule next poll
    if (isRunning) {
      setTimeout(poll, pollInterval);
    }
  };

  // Start polling
  poll();

  // Return controller
  return {
    stop: () => {
      isRunning = false;
    },
    restart: () => {
      isRunning = true;
      poll();
    },
    updateInterval: (newInterval) => {
      pollInterval = newInterval;
    }
  };
}

// ===================================================================
// BATCH OPERATIONS
// ===================================================================

/**
 * Send multiple notifications at once
 *
 * @param {Array<Object>} notifications - Array of notification objects
 * @returns {Promise<Array>} - Results for each notification
 */
export async function sendBatchNotifications(notifications) {
  const results = await Promise.allSettled(
    notifications.map(({ type, subject, message, metadata }) =>
      sendEmailNotification(type, subject, message, metadata)
    )
  );

  return results.map((result, index) => ({
    notification: notifications[index],
    success: result.status === 'fulfilled',
    result: result.status === 'fulfilled' ? result.value : result.reason
  }));
}

// ===================================================================
// ANALYTICS
// ===================================================================

/**
 * Track notification analytics
 *
 * @param {string} notificationId - ID of the notification
 * @param {string} action - Action taken (delivered, opened, clicked, dismissed)
 * @param {Object} metadata - Additional tracking data
 */
export async function trackNotificationAnalytics(notificationId, action, metadata = {}) {
  try {
    await fetch('/api/analytics/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        notificationId,
        action,
        timestamp: new Date().toISOString(),
        metadata
      })
    });
  } catch (error) {
    console.error('Error tracking notification analytics:', error);
  }
}

// ===================================================================
// EXPORT
// ===================================================================

export default {
  // Monitoring
  pollEmailNotifications,
  startNotificationMonitoring,

  // Sending
  sendEmailNotification,
  sendBatchNotifications,

  // Specific notification types
  sendUrgentAlert,
  sendDisputeUpdate,
  sendFaxConfirmation,
  sendCreditReportUpdate,
  sendPaymentSuccess,
  sendPaymentPending,
  sendPaymentFailed,
  sendBillingReminder,
  sendClientMessage,
  sendDocumentUpload,
  sendTaskReminder,
  sendAppointmentReminder,
  sendAffiliateUpdate,
  sendSystemNotification,
  sendAdminAlert,

  // Analytics
  trackNotificationAnalytics
};
