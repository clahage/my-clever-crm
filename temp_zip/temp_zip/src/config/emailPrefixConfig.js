// ===================================================================
// Email Prefix Notification System Configuration
// Domain: @speedycreditrepair.com (Google Workspace)
//
// This system uses email prefixes instead of SMS for mobile app
// notifications, as Twilio doesn't allow credit repair companies.
//
// Mobile app monitors these email addresses and triggers
// appropriate in-app notifications based on the prefix.
// ===================================================================

export const EMAIL_DOMAIN = '@speedycreditrepair.com';
export const BASE_DOMAIN = 'speedycreditrepair.com';

// ===================================================================
// EMAIL PREFIX DEFINITIONS
// ===================================================================

export const EMAIL_PREFIXES = {
  // CRITICAL ALERTS (Immediate attention required)
  URGENT: {
    prefix: 'urgent',
    email: 'urgent@speedycreditrepair.com',
    priority: 'critical',
    color: '#EF4444', // Red
    sound: 'urgent_alert',
    vibration: 'strong',
    description: 'Critical alerts requiring immediate attention',
    examples: [
      'System errors',
      'Payment failures',
      'Security alerts',
      'Account suspensions'
    ]
  },

  // DISPUTE MANAGEMENT
  DISPUTE_UPDATE: {
    prefix: 'disputes',
    email: 'disputes@speedycreditrepair.com',
    priority: 'high',
    color: '#F59E0B', // Amber
    sound: 'notification',
    vibration: 'medium',
    description: 'Dispute status updates and bureau responses',
    examples: [
      'Bureau response received',
      'Dispute round completed',
      'Items deleted/verified',
      'New dispute created'
    ]
  },

  DISPUTE_FAX: {
    prefix: 'dispute-fax',
    email: 'dispute-fax@speedycreditrepair.com',
    priority: 'high',
    color: '#F59E0B', // Amber
    sound: 'notification',
    vibration: 'medium',
    description: 'Fax transmission confirmations for disputes',
    examples: [
      'Fax sent successfully',
      'Fax failed to send',
      'Bureau fax received confirmation'
    ]
  },

  // CREDIT REPORTS
  CREDIT_REPORT: {
    prefix: 'reports',
    email: 'reports@speedycreditrepair.com',
    priority: 'high',
    color: '#8B5CF6', // Purple
    sound: 'notification',
    vibration: 'medium',
    description: 'Credit report updates and score changes',
    examples: [
      'New credit report pulled',
      'Score increased/decreased',
      'Monthly report available',
      'IDIQ update available'
    ]
  },

  CREDIT_MONITORING: {
    prefix: 'monitoring',
    email: 'monitoring@speedycreditrepair.com',
    priority: 'medium',
    color: '#8B5CF6', // Purple
    sound: 'soft_notification',
    vibration: 'light',
    description: 'Ongoing credit monitoring alerts',
    examples: [
      'New inquiry detected',
      'Account status changed',
      'Public record added/removed'
    ]
  },

  // PAYMENTS & BILLING
  PAYMENT_SUCCESS: {
    prefix: 'payments',
    email: 'payments@speedycreditrepair.com',
    priority: 'high',
    color: '#10B981', // Green
    sound: 'success',
    vibration: 'light',
    description: 'Payment confirmations and billing notifications',
    examples: [
      'ACH payment cleared',
      'Zelle payment received',
      'Invoice paid',
      'Payment plan activated'
    ]
  },

  PAYMENT_PENDING: {
    prefix: 'payment-pending',
    email: 'payment-pending@speedycreditrepair.com',
    priority: 'medium',
    color: '#F59E0B', // Amber
    sound: 'notification',
    vibration: 'light',
    description: 'Pending payment notifications',
    examples: [
      'ACH initiated (waiting for clearing)',
      'Payment processing',
      'Payment verification needed'
    ]
  },

  PAYMENT_FAILED: {
    prefix: 'payment-failed',
    email: 'payment-failed@speedycreditrepair.com',
    priority: 'critical',
    color: '#EF4444', // Red
    sound: 'urgent_alert',
    vibration: 'strong',
    description: 'Failed payment alerts',
    examples: [
      'ACH payment failed',
      'Insufficient funds',
      'Payment declined',
      'Account verification needed'
    ]
  },

  BILLING_REMINDER: {
    prefix: 'billing',
    email: 'billing@speedycreditrepair.com',
    priority: 'medium',
    color: '#3B82F6', // Blue
    sound: 'reminder',
    vibration: 'light',
    description: 'Billing reminders and invoice notifications',
    examples: [
      'Invoice due soon',
      'Payment reminder',
      'Subscription renewal',
      'New invoice available'
    ]
  },

  // CLIENT COMMUNICATIONS
  CLIENT_MESSAGE: {
    prefix: 'messages',
    email: 'messages@speedycreditrepair.com',
    priority: 'medium',
    color: '#3B82F6', // Blue
    sound: 'message',
    vibration: 'light',
    description: 'New client messages and communications',
    examples: [
      'New client message',
      'Client replied to email',
      'Chat message received',
      'Client uploaded document'
    ]
  },

  DOCUMENT_UPLOAD: {
    prefix: 'documents',
    email: 'documents@speedycreditrepair.com',
    priority: 'medium',
    color: '#6366F1', // Indigo
    sound: 'notification',
    vibration: 'light',
    description: 'Document upload and verification notifications',
    examples: [
      'Client uploaded ID',
      'New document received',
      'Document verification needed',
      'Signature completed'
    ]
  },

  // TASKS & REMINDERS
  TASK_REMINDER: {
    prefix: 'tasks',
    email: 'tasks@speedycreditrepair.com',
    priority: 'medium',
    color: '#EC4899', // Pink
    sound: 'reminder',
    vibration: 'light',
    description: 'Task reminders and due date alerts',
    examples: [
      'Task due today',
      'Overdue task',
      'New task assigned',
      'Task completed by team'
    ]
  },

  APPOINTMENT_REMINDER: {
    prefix: 'appointments',
    email: 'appointments@speedycreditrepair.com',
    priority: 'high',
    color: '#EC4899', // Pink
    sound: 'reminder',
    vibration: 'medium',
    description: 'Appointment and calendar reminders',
    examples: [
      'Appointment in 1 hour',
      'Appointment tomorrow',
      'Client rescheduled',
      'Appointment cancelled'
    ]
  },

  // AFFILIATE PROGRAM
  AFFILIATE_UPDATE: {
    prefix: 'affiliates',
    email: 'affiliates@speedycreditrepair.com',
    priority: 'medium',
    color: '#14B8A6', // Teal
    sound: 'notification',
    vibration: 'light',
    description: 'Affiliate program updates and commissions',
    examples: [
      'New referral signup',
      'Commission earned',
      'Payout processed',
      'Referral milestone reached'
    ]
  },

  REFERRAL_REWARD: {
    prefix: 'referrals',
    email: 'referrals@speedycreditrepair.com',
    priority: 'medium',
    color: '#14B8A6', // Teal
    sound: 'success',
    vibration: 'light',
    description: 'Referral rewards and bonuses',
    examples: [
      'Referral bonus earned',
      'Friend signed up',
      'Reward unlocked'
    ]
  },

  // SYSTEM & ADMIN
  SYSTEM_NOTIFICATION: {
    prefix: 'system',
    email: 'system@speedycreditrepair.com',
    priority: 'low',
    color: '#6B7280', // Gray
    sound: 'soft_notification',
    vibration: 'none',
    description: 'System updates and maintenance notifications',
    examples: [
      'System update available',
      'Maintenance scheduled',
      'New feature released',
      'Integration connected'
    ]
  },

  ADMIN_ALERT: {
    prefix: 'admin',
    email: 'admin@speedycreditrepair.com',
    priority: 'high',
    color: '#DC2626', // Dark red
    sound: 'urgent_alert',
    vibration: 'strong',
    description: 'Admin-only alerts and system issues',
    examples: [
      'User reported issue',
      'Database backup completed',
      'Security event',
      'Service degradation'
    ]
  },

  // TEAM COLLABORATION
  TEAM_UPDATE: {
    prefix: 'team',
    email: 'team@speedycreditrepair.com',
    priority: 'low',
    color: '#8B5CF6', // Purple
    sound: 'soft_notification',
    vibration: 'light',
    description: 'Team collaboration and updates',
    examples: [
      'Team member mentioned you',
      'Shared note updated',
      'Team announcement',
      'Workflow assigned'
    ]
  },

  // MARKETING & CAMPAIGNS
  CAMPAIGN_UPDATE: {
    prefix: 'campaigns',
    email: 'campaigns@speedycreditrepair.com',
    priority: 'low',
    color: '#F59E0B', // Amber
    sound: 'soft_notification',
    vibration: 'none',
    description: 'Marketing campaign performance updates',
    examples: [
      'Campaign milestone reached',
      'High open rate alert',
      'Campaign completed',
      'A/B test results'
    ]
  },

  // GENERAL NOTIFICATIONS
  GENERAL: {
    prefix: 'notifications',
    email: 'notifications@speedycreditrepair.com',
    priority: 'low',
    color: '#3B82F6', // Blue
    sound: 'soft_notification',
    vibration: 'none',
    description: 'General notifications and updates',
    examples: [
      'Account update',
      'Profile completed',
      'Goal achieved',
      'Milestone reached'
    ]
  },

  // SUPPORT & HELP
  SUPPORT_TICKET: {
    prefix: 'support',
    email: 'support@speedycreditrepair.com',
    priority: 'medium',
    color: '#3B82F6', // Blue
    sound: 'notification',
    vibration: 'light',
    description: 'Support ticket updates',
    examples: [
      'Support ticket created',
      'Support responded',
      'Ticket resolved',
      'Follow-up needed'
    ]
  }
};

// ===================================================================
// PRIORITY LEVELS
// ===================================================================

export const PRIORITY_LEVELS = {
  critical: {
    level: 4,
    label: 'Critical',
    color: '#EF4444',
    badge: 'red',
    timeout: null, // Doesn't auto-dismiss
    requiresAction: true
  },
  high: {
    level: 3,
    label: 'High',
    color: '#F59E0B',
    badge: 'amber',
    timeout: 30000, // 30 seconds
    requiresAction: false
  },
  medium: {
    level: 2,
    label: 'Medium',
    color: '#3B82F6',
    badge: 'blue',
    timeout: 10000, // 10 seconds
    requiresAction: false
  },
  low: {
    level: 1,
    label: 'Low',
    color: '#6B7280',
    badge: 'gray',
    timeout: 5000, // 5 seconds
    requiresAction: false
  }
};

// ===================================================================
// NOTIFICATION SOUNDS
// ===================================================================

export const NOTIFICATION_SOUNDS = {
  urgent_alert: '/sounds/urgent-alert.mp3',
  notification: '/sounds/notification.mp3',
  soft_notification: '/sounds/soft-notification.mp3',
  success: '/sounds/success.mp3',
  message: '/sounds/message.mp3',
  reminder: '/sounds/reminder.mp3'
};

// ===================================================================
// VIBRATION PATTERNS
// ===================================================================

export const VIBRATION_PATTERNS = {
  strong: [200, 100, 200, 100, 200], // Three strong pulses
  medium: [100, 50, 100], // Two medium pulses
  light: [50], // Single light pulse
  none: [] // No vibration
};

// ===================================================================
// HELPER FUNCTIONS
// ===================================================================

/**
 * Get email prefix configuration by prefix name
 * @param {string} prefix - The prefix name (e.g., 'urgent', 'disputes')
 * @returns {Object|null} - Email prefix configuration or null
 */
export const getEmailPrefixConfig = (prefix) => {
  return Object.values(EMAIL_PREFIXES).find(
    config => config.prefix === prefix
  ) || null;
};

/**
 * Get email prefix configuration by full email address
 * @param {string} email - Full email address
 * @returns {Object|null} - Email prefix configuration or null
 */
export const getConfigByEmail = (email) => {
  return Object.values(EMAIL_PREFIXES).find(
    config => config.email === email
  ) || null;
};

/**
 * Get all email addresses for monitoring
 * @returns {Array<string>} - Array of all email addresses
 */
export const getAllMonitoredEmails = () => {
  return Object.values(EMAIL_PREFIXES).map(config => config.email);
};

/**
 * Get email addresses by priority level
 * @param {string} priority - Priority level (critical, high, medium, low)
 * @returns {Array<string>} - Array of email addresses with that priority
 */
export const getEmailsByPriority = (priority) => {
  return Object.values(EMAIL_PREFIXES)
    .filter(config => config.priority === priority)
    .map(config => config.email);
};

/**
 * Create notification payload from email
 * @param {string} fromEmail - The email address notification came from
 * @param {string} subject - Email subject
 * @param {string} body - Email body
 * @param {Object} metadata - Additional metadata
 * @returns {Object} - Notification payload for mobile app
 */
export const createNotificationPayload = (fromEmail, subject, body, metadata = {}) => {
  const config = getConfigByEmail(fromEmail);

  if (!config) {
    return null;
  }

  const priorityConfig = PRIORITY_LEVELS[config.priority];

  return {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: config.prefix,
    email: fromEmail,
    priority: config.priority,
    priorityLevel: priorityConfig.level,
    title: subject,
    message: body,
    color: config.color,
    badge: priorityConfig.badge,
    sound: config.sound,
    soundFile: NOTIFICATION_SOUNDS[config.sound],
    vibration: config.vibration,
    vibrationPattern: VIBRATION_PATTERNS[config.vibration],
    timeout: priorityConfig.timeout,
    requiresAction: priorityConfig.requiresAction,
    timestamp: new Date().toISOString(),
    metadata: {
      ...metadata,
      description: config.description
    }
  };
};

/**
 * Route notification to appropriate handler
 * @param {Object} notification - Notification payload
 * @returns {string} - Handler route
 */
export const getNotificationRoute = (notification) => {
  const routeMap = {
    'urgent': '/alerts',
    'disputes': '/dispute-hub',
    'dispute-fax': '/dispute-hub',
    'reports': '/credit-hub',
    'monitoring': '/credit-hub',
    'payments': '/billing-hub',
    'payment-pending': '/billing-hub',
    'payment-failed': '/billing-hub',
    'billing': '/billing-hub',
    'messages': '/comms-hub',
    'documents': '/documents-hub',
    'tasks': '/tasks-hub',
    'appointments': '/calendar-hub',
    'affiliates': '/affiliates-hub',
    'referrals': '/referral-engine-hub',
    'system': '/settings-hub',
    'admin': '/dashboard-hub',
    'team': '/team',
    'campaigns': '/marketing-hub',
    'notifications': '/dashboard',
    'support': '/support-hub'
  };

  return routeMap[notification.type] || '/dashboard';
};

// ===================================================================
// EXPORT ALL
// ===================================================================

export default {
  EMAIL_DOMAIN,
  BASE_DOMAIN,
  EMAIL_PREFIXES,
  PRIORITY_LEVELS,
  NOTIFICATION_SOUNDS,
  VIBRATION_PATTERNS,
  getEmailPrefixConfig,
  getConfigByEmail,
  getAllMonitoredEmails,
  getEmailsByPriority,
  createNotificationPayload,
  getNotificationRoute
};
