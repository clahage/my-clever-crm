// ===================================================================
// emailPrefixConfig.js - Email Prefix Configuration & Management
// ===================================================================
// Purpose: Comprehensive email routing system using Google Workspace
//          unlimited email domain prefixes for intelligent notification
//          categorization, priority management, and mobile app integration
//
// Features:
// - 20+ email prefix categories
// - Priority levels (1-5, 1 being highest)
// - Color coding for visual identification
// - Sound alerts for different notification types
// - Vibration patterns for mobile app
// - Helper functions for mobile app integration
// - Smart routing based on email content
// - Automated categorization and tagging
// ===================================================================

// ===================================================================
// PRIORITY LEVELS
// ===================================================================
export const PRIORITY_LEVELS = {
  CRITICAL: 1,    // Immediate action required
  HIGH: 2,        // Action required within hours
  MEDIUM: 3,      // Action required within 1-2 days
  NORMAL: 4,      // Regular workflow
  LOW: 5          // Informational only
};

// ===================================================================
// VIBRATION PATTERNS (for mobile app)
// ===================================================================
export const VIBRATION_PATTERNS = {
  CRITICAL: [100, 50, 100, 50, 100],      // Triple burst
  HIGH: [100, 100, 100],                   // Double burst
  MEDIUM: [200],                           // Single long
  NORMAL: [100],                           // Single short
  LOW: [50],                               // Very short
  CUSTOM_URGENT: [50, 50, 100, 50, 100, 50, 200], // SOS pattern
  CUSTOM_SUCCESS: [100, 50, 50, 50, 100], // Success melody
  CUSTOM_WARNING: [200, 100, 200]         // Warning pulse
};

// ===================================================================
// SOUND ALERTS
// ===================================================================
export const SOUND_ALERTS = {
  CRITICAL: 'alert-critical.mp3',
  HIGH: 'alert-high.mp3',
  MEDIUM: 'alert-medium.mp3',
  NORMAL: 'notification.mp3',
  LOW: 'soft-ding.mp3',
  SUCCESS: 'success-chime.mp3',
  WARNING: 'warning-beep.mp3',
  PAYMENT: 'payment-success.mp3',
  DISPUTE: 'document-received.mp3',
  MESSAGE: 'message-pop.mp3'
};

// ===================================================================
// EMAIL PREFIX CATEGORIES
// ===================================================================

// --------------------------------------------------------------------
// 1. CRITICAL ALERTS
// --------------------------------------------------------------------
export const CRITICAL_ALERTS = {
  category: 'Critical Alerts',
  description: 'System-critical notifications requiring immediate attention',
  icon: '🚨',
  prefixes: {
    'urgent@': {
      label: 'Urgent Alerts',
      priority: PRIORITY_LEVELS.CRITICAL,
      color: '#FF0000',
      backgroundColor: '#FFE5E5',
      sound: SOUND_ALERTS.CRITICAL,
      vibration: VIBRATION_PATTERNS.CRITICAL,
      autoNotify: true,
      keywords: ['urgent', 'critical', 'emergency', 'immediate', 'alert', 'failure', 'error'],
      description: 'System errors, payment failures, security alerts'
    }
  }
};

// --------------------------------------------------------------------
// 2. DISPUTES & CREDIT BUREAU COMMUNICATIONS
// --------------------------------------------------------------------
export const DISPUTES = {
  category: 'Disputes',
  description: 'Credit bureau dispute tracking and responses',
  icon: '📋',
  prefixes: {
    'disputes@': {
      label: 'Dispute Responses',
      priority: PRIORITY_LEVELS.HIGH,
      color: '#FF6B00',
      backgroundColor: '#FFF4E5',
      sound: SOUND_ALERTS.DISPUTE,
      vibration: VIBRATION_PATTERNS.HIGH,
      autoNotify: true,
      keywords: ['dispute', 'investigation', 'deleted', 'updated', 'verified', 'bureau response'],
      description: 'Bureau responses, item deletions, investigation updates'
    },
    'dispute-fax@': {
      label: 'Fax Confirmations',
      priority: PRIORITY_LEVELS.HIGH,
      color: '#FF8C00',
      backgroundColor: '#FFF8E5',
      sound: SOUND_ALERTS.SUCCESS,
      vibration: VIBRATION_PATTERNS.CUSTOM_SUCCESS,
      autoNotify: true,
      keywords: ['fax sent', 'fax received', 'confirmation', 'delivered'],
      description: 'Fax confirmations for dispute letters'
    }
  }
};

// --------------------------------------------------------------------
// 3. CREDIT MONITORING
// --------------------------------------------------------------------
export const CREDIT_MONITORING = {
  category: 'Credit Monitoring',
  description: 'Credit report updates and score changes',
  icon: '📊',
  prefixes: {
    'reports@': {
      label: 'Credit Reports',
      priority: PRIORITY_LEVELS.HIGH,
      color: '#1976D2',
      backgroundColor: '#E3F2FD',
      sound: SOUND_ALERTS.HIGH,
      vibration: VIBRATION_PATTERNS.MEDIUM,
      autoNotify: true,
      keywords: ['credit report', 'new report', 'report available', 'tri-merge'],
      description: 'New credit reports available'
    },
    'monitoring@': {
      label: 'Monitoring Alerts',
      priority: PRIORITY_LEVELS.MEDIUM,
      color: '#0288D1',
      backgroundColor: '#E1F5FE',
      sound: SOUND_ALERTS.MEDIUM,
      vibration: VIBRATION_PATTERNS.NORMAL,
      autoNotify: true,
      keywords: ['score change', 'new inquiry', 'account opened', 'balance change', 'credit alert'],
      description: 'Score changes, new inquiries, account changes'
    }
  }
};

// --------------------------------------------------------------------
// 4. PAYMENTS & BILLING
// --------------------------------------------------------------------
export const PAYMENTS = {
  category: 'Payments',
  description: 'Payment processing, invoicing, and billing alerts',
  icon: '💳',
  prefixes: {
    'payments@': {
      label: 'Payment Confirmations',
      priority: PRIORITY_LEVELS.HIGH,
      color: '#4CAF50',
      backgroundColor: '#E8F5E9',
      sound: SOUND_ALERTS.PAYMENT,
      vibration: VIBRATION_PATTERNS.CUSTOM_SUCCESS,
      autoNotify: true,
      keywords: ['payment received', 'payment successful', 'ACH processed', 'Zelle received'],
      description: 'ACH/Zelle payment confirmations'
    },
    'payment-pending@': {
      label: 'Pending Payments',
      priority: PRIORITY_LEVELS.MEDIUM,
      color: '#FFC107',
      backgroundColor: '#FFFDE7',
      sound: SOUND_ALERTS.NORMAL,
      vibration: VIBRATION_PATTERNS.NORMAL,
      autoNotify: true,
      keywords: ['payment pending', 'processing', 'awaiting confirmation', 'scheduled payment'],
      description: 'Payments being processed'
    },
    'payment-failed@': {
      label: 'Failed Payments',
      priority: PRIORITY_LEVELS.CRITICAL,
      color: '#F44336',
      backgroundColor: '#FFEBEE',
      sound: SOUND_ALERTS.CRITICAL,
      vibration: VIBRATION_PATTERNS.CRITICAL,
      autoNotify: true,
      keywords: ['payment failed', 'declined', 'insufficient funds', 'payment error'],
      description: 'Payment failures requiring immediate attention'
    },
    'billing@': {
      label: 'Invoices & Billing',
      priority: PRIORITY_LEVELS.MEDIUM,
      color: '#009688',
      backgroundColor: '#E0F2F1',
      sound: SOUND_ALERTS.NORMAL,
      vibration: VIBRATION_PATTERNS.NORMAL,
      autoNotify: false,
      keywords: ['invoice', 'billing', 'statement', 'due date', 'reminder'],
      description: 'Invoice reminders, billing statements'
    }
  }
};

// --------------------------------------------------------------------
// 5. CLIENT COMMUNICATIONS
// --------------------------------------------------------------------
export const CLIENT_COMMUNICATIONS = {
  category: 'Client Communications',
  description: 'Direct client messages and document uploads',
  icon: '💬',
  prefixes: {
    'messages@': {
      label: 'Client Messages',
      priority: PRIORITY_LEVELS.MEDIUM,
      color: '#9C27B0',
      backgroundColor: '#F3E5F5',
      sound: SOUND_ALERTS.MESSAGE,
      vibration: VIBRATION_PATTERNS.NORMAL,
      autoNotify: true,
      keywords: ['message from', 'client replied', 'question', 'inquiry'],
      description: 'Direct messages from clients'
    },
    'documents@': {
      label: 'Document Uploads',
      priority: PRIORITY_LEVELS.MEDIUM,
      color: '#673AB7',
      backgroundColor: '#EDE7F6',
      sound: SOUND_ALERTS.NORMAL,
      vibration: VIBRATION_PATTERNS.NORMAL,
      autoNotify: true,
      keywords: ['document uploaded', 'file received', 'attachment', 'scan received'],
      description: 'Client document uploads and ID verification'
    }
  }
};

// --------------------------------------------------------------------
// 6. PRODUCTIVITY & TASK MANAGEMENT
// --------------------------------------------------------------------
export const PRODUCTIVITY = {
  category: 'Productivity',
  description: 'Tasks, appointments, and workflow reminders',
  icon: '✅',
  prefixes: {
    'tasks@': {
      label: 'Task Reminders',
      priority: PRIORITY_LEVELS.NORMAL,
      color: '#FF5722',
      backgroundColor: '#FBE9E7',
      sound: SOUND_ALERTS.NORMAL,
      vibration: VIBRATION_PATTERNS.NORMAL,
      autoNotify: true,
      keywords: ['task due', 'reminder', 'follow-up', 'action required'],
      description: 'Task reminders and deadlines'
    },
    'appointments@': {
      label: 'Appointments',
      priority: PRIORITY_LEVELS.HIGH,
      color: '#E91E63',
      backgroundColor: '#FCE4EC',
      sound: SOUND_ALERTS.HIGH,
      vibration: VIBRATION_PATTERNS.HIGH,
      autoNotify: true,
      keywords: ['appointment', 'meeting', 'consultation', 'scheduled call'],
      description: 'Appointment reminders and confirmations'
    }
  }
};

// --------------------------------------------------------------------
// 7. AFFILIATE PROGRAM
// --------------------------------------------------------------------
export const AFFILIATE_PROGRAM = {
  category: 'Affiliate Program',
  description: 'Partner referrals, commissions, and affiliate management',
  icon: '🤝',
  prefixes: {
    'affiliates@': {
      label: 'Affiliate Activity',
      priority: PRIORITY_LEVELS.MEDIUM,
      color: '#795548',
      backgroundColor: '#EFEBE9',
      sound: SOUND_ALERTS.NORMAL,
      vibration: VIBRATION_PATTERNS.NORMAL,
      autoNotify: true,
      keywords: ['new affiliate', 'affiliate signup', 'partner joined'],
      description: 'New affiliate signups and partner activity'
    },
    'referrals@': {
      label: 'Referrals',
      priority: PRIORITY_LEVELS.MEDIUM,
      color: '#8BC34A',
      backgroundColor: '#F1F8E9',
      sound: SOUND_ALERTS.SUCCESS,
      vibration: VIBRATION_PATTERNS.CUSTOM_SUCCESS,
      autoNotify: true,
      keywords: ['referral', 'referred by', 'new lead from partner'],
      description: 'Referrals from affiliate partners'
    },
    'commissions@': {
      label: 'Commissions',
      priority: PRIORITY_LEVELS.MEDIUM,
      color: '#CDDC39',
      backgroundColor: '#F9FBE7',
      sound: SOUND_ALERTS.PAYMENT,
      vibration: VIBRATION_PATTERNS.CUSTOM_SUCCESS,
      autoNotify: true,
      keywords: ['commission earned', 'payout', 'bonus', 'earnings'],
      description: 'Commission payments and bonuses'
    }
  }
};

// --------------------------------------------------------------------
// 8. SYSTEM & TEAM
// --------------------------------------------------------------------
export const SYSTEM_TEAM = {
  category: 'System & Team',
  description: 'System updates, admin alerts, and team collaboration',
  icon: '⚙️',
  prefixes: {
    'system@': {
      label: 'System Updates',
      priority: PRIORITY_LEVELS.LOW,
      color: '#607D8B',
      backgroundColor: '#ECEFF1',
      sound: SOUND_ALERTS.LOW,
      vibration: VIBRATION_PATTERNS.LOW,
      autoNotify: false,
      keywords: ['system update', 'maintenance', 'backup completed', 'scheduled task'],
      description: 'System notifications and maintenance updates'
    },
    'admin@': {
      label: 'Admin Alerts',
      priority: PRIORITY_LEVELS.HIGH,
      color: '#FF9800',
      backgroundColor: '#FFF3E0',
      sound: SOUND_ALERTS.HIGH,
      vibration: VIBRATION_PATTERNS.HIGH,
      autoNotify: true,
      keywords: ['admin alert', 'security', 'user activity', 'permission change'],
      description: 'Administrative alerts and security notifications'
    },
    'team@': {
      label: 'Team Collaboration',
      priority: PRIORITY_LEVELS.NORMAL,
      color: '#00BCD4',
      backgroundColor: '#E0F7FA',
      sound: SOUND_ALERTS.NORMAL,
      vibration: VIBRATION_PATTERNS.NORMAL,
      autoNotify: true,
      keywords: ['team message', 'mentioned you', 'collaboration', 'shared with you'],
      description: 'Team messages and collaboration'
    },
    'campaigns@': {
      label: 'Marketing Campaigns',
      priority: PRIORITY_LEVELS.NORMAL,
      color: '#3F51B5',
      backgroundColor: '#E8EAF6',
      sound: SOUND_ALERTS.NORMAL,
      vibration: VIBRATION_PATTERNS.NORMAL,
      autoNotify: false,
      keywords: ['campaign', 'newsletter', 'email blast', 'marketing'],
      description: 'Marketing campaign reports and analytics'
    },
    'support@': {
      label: 'Support Tickets',
      priority: PRIORITY_LEVELS.MEDIUM,
      color: '#FF5252',
      backgroundColor: '#FFEBEE',
      sound: SOUND_ALERTS.MEDIUM,
      vibration: VIBRATION_PATTERNS.MEDIUM,
      autoNotify: true,
      keywords: ['support ticket', 'help request', 'issue reported', 'bug report'],
      description: 'Customer support tickets and requests'
    }
  }
};

// ===================================================================
// CONSOLIDATED EMAIL PREFIX CONFIGURATION
// ===================================================================
export const EMAIL_PREFIX_CONFIG = {
  ...CRITICAL_ALERTS.prefixes,
  ...DISPUTES.prefixes,
  ...CREDIT_MONITORING.prefixes,
  ...PAYMENTS.prefixes,
  ...CLIENT_COMMUNICATIONS.prefixes,
  ...PRODUCTIVITY.prefixes,
  ...AFFILIATE_PROGRAM.prefixes,
  ...SYSTEM_TEAM.prefixes
};

// ===================================================================
// CATEGORY GROUPS
// ===================================================================
export const CATEGORY_GROUPS = {
  CRITICAL_ALERTS,
  DISPUTES,
  CREDIT_MONITORING,
  PAYMENTS,
  CLIENT_COMMUNICATIONS,
  PRODUCTIVITY,
  AFFILIATE_PROGRAM,
  SYSTEM_TEAM
};

// ===================================================================
// HELPER FUNCTIONS FOR MOBILE APP
// ===================================================================

/**
 * Get email prefix configuration by email address
 * @param {string} email - The email address to check
 * @returns {object|null} - Configuration object or null if not found
 */
export function getConfigByEmail(email) {
  if (!email) return null;

  const prefix = email.split('@')[0] + '@';
  return EMAIL_PREFIX_CONFIG[prefix] || null;
}

/**
 * Extract email prefix from email address
 * @param {string} email - The email address
 * @returns {string|null} - The prefix or null
 */
export function extractPrefix(email) {
  if (!email || !email.includes('@')) return null;
  return email.split('@')[0] + '@';
}

/**
 * Get priority level for an email
 * @param {string} email - The email address
 * @returns {number} - Priority level (1-5)
 */
export function getPriority(email) {
  const config = getConfigByEmail(email);
  return config?.priority || PRIORITY_LEVELS.NORMAL;
}

/**
 * Check if email should trigger auto-notification
 * @param {string} email - The email address
 * @returns {boolean}
 */
export function shouldAutoNotify(email) {
  const config = getConfigByEmail(email);
  return config?.autoNotify ?? true;
}

/**
 * Get notification sound for an email
 * @param {string} email - The email address
 * @returns {string} - Sound file name
 */
export function getNotificationSound(email) {
  const config = getConfigByEmail(email);
  return config?.sound || SOUND_ALERTS.NORMAL;
}

/**
 * Get vibration pattern for an email
 * @param {string} email - The email address
 * @returns {array} - Vibration pattern array
 */
export function getVibrationPattern(email) {
  const config = getConfigByEmail(email);
  return config?.vibration || VIBRATION_PATTERNS.NORMAL;
}

/**
 * Get color styling for an email prefix
 * @param {string} email - The email address
 * @returns {object} - Color and backgroundColor
 */
export function getColorStyling(email) {
  const config = getConfigByEmail(email);
  return {
    color: config?.color || '#666666',
    backgroundColor: config?.backgroundColor || '#F5F5F5'
  };
}

/**
 * Match email content to appropriate prefix using keywords
 * @param {string} subject - Email subject
 * @param {string} body - Email body
 * @returns {string|null} - Suggested prefix or null
 */
export function suggestPrefix(subject, body) {
  const content = `${subject} ${body}`.toLowerCase();

  for (const [prefix, config] of Object.entries(EMAIL_PREFIX_CONFIG)) {
    if (config.keywords && config.keywords.some(keyword => content.includes(keyword.toLowerCase()))) {
      return prefix;
    }
  }

  return null;
}

/**
 * Get all prefixes sorted by priority
 * @returns {array} - Array of prefix objects sorted by priority
 */
export function getPrefixesByPriority() {
  return Object.entries(EMAIL_PREFIX_CONFIG)
    .map(([prefix, config]) => ({ prefix, ...config }))
    .sort((a, b) => a.priority - b.priority);
}

/**
 * Get prefixes by category
 * @param {string} category - Category name
 * @returns {array} - Array of prefix objects
 */
export function getPrefixesByCategory(category) {
  const categoryGroup = Object.values(CATEGORY_GROUPS).find(
    group => group.category === category
  );

  if (!categoryGroup) return [];

  return Object.entries(categoryGroup.prefixes).map(([prefix, config]) => ({
    prefix,
    ...config
  }));
}

/**
 * Validate email prefix
 * @param {string} prefix - The prefix to validate
 * @returns {boolean}
 */
export function isValidPrefix(prefix) {
  return prefix in EMAIL_PREFIX_CONFIG;
}

/**
 * Get category for a prefix
 * @param {string} prefix - The email prefix
 * @returns {string|null} - Category name or null
 */
export function getCategoryForPrefix(prefix) {
  for (const group of Object.values(CATEGORY_GROUPS)) {
    if (prefix in group.prefixes) {
      return group.category;
    }
  }
  return null;
}

/**
 * Format notification message for mobile app
 * @param {string} email - The email address
 * @param {string} subject - Email subject
 * @param {string} from - Sender
 * @returns {object} - Formatted notification object
 */
export function formatMobileNotification(email, subject, from) {
  const config = getConfigByEmail(email);
  const colors = getColorStyling(email);

  return {
    title: config?.label || 'New Email',
    body: `From: ${from}\n${subject}`,
    priority: getPriority(email),
    sound: getNotificationSound(email),
    vibration: getVibrationPattern(email),
    color: colors.color,
    backgroundColor: colors.backgroundColor,
    icon: getCategoryIcon(email),
    autoNotify: shouldAutoNotify(email),
    category: getCategoryForPrefix(extractPrefix(email))
  };
}

/**
 * Get category icon for a prefix
 * @param {string} email - The email address
 * @returns {string} - Emoji icon
 */
export function getCategoryIcon(email) {
  const category = getCategoryForPrefix(extractPrefix(email));
  const group = Object.values(CATEGORY_GROUPS).find(g => g.category === category);
  return group?.icon || '📧';
}

/**
 * Get all unique categories
 * @returns {array} - Array of category names
 */
export function getAllCategories() {
  return Object.values(CATEGORY_GROUPS).map(group => group.category);
}

/**
 * Get statistics for prefix usage
 * @param {array} emails - Array of email addresses
 * @returns {object} - Statistics object
 */
export function getEmailStatistics(emails) {
  const stats = {
    total: emails.length,
    byPrefix: {},
    byCategory: {},
    byPriority: {}
  };

  emails.forEach(email => {
    const prefix = extractPrefix(email);
    const category = getCategoryForPrefix(prefix);
    const priority = getPriority(email);

    stats.byPrefix[prefix] = (stats.byPrefix[prefix] || 0) + 1;
    stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
    stats.byPriority[priority] = (stats.byPriority[priority] || 0) + 1;
  });

  return stats;
}

// ===================================================================
// EXPORT DEFAULT
// ===================================================================
export default {
  EMAIL_PREFIX_CONFIG,
  CATEGORY_GROUPS,
  PRIORITY_LEVELS,
  VIBRATION_PATTERNS,
  SOUND_ALERTS,
  // Helper functions
  getConfigByEmail,
  extractPrefix,
  getPriority,
  shouldAutoNotify,
  getNotificationSound,
  getVibrationPattern,
  getColorStyling,
  suggestPrefix,
  getPrefixesByPriority,
  getPrefixesByCategory,
  isValidPrefix,
  getCategoryForPrefix,
  formatMobileNotification,
  getCategoryIcon,
  getAllCategories,
  getEmailStatistics
};
