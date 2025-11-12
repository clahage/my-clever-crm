// ===================================================================
// emailPrefixConfig.js - Email Prefix Configuration & Management
// ===================================================================
// Purpose: Production email routing system using Google Workspace
//          28 configured aliases routing to chris@speedycreditrepair.com
//
// Google Workspace Setup:
// - Primary: chris@speedycreditrepair.com
// - Aliases: 28/30 configured (2 remaining slots available)
// - All aliases route to primary inbox
// - Supports unlimited aliases per domain with Google Workspace
//
// Features:
// - 28 active email aliases mapped to categories
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
// EMAIL PREFIX CATEGORIES - ACTUAL GOOGLE WORKSPACE CONFIGURATION
// ===================================================================

// --------------------------------------------------------------------
// 1. CRITICAL ALERTS (1 alias)
// --------------------------------------------------------------------
export const CRITICAL_ALERTS = {
  category: 'Critical Alerts',
  description: 'System-critical notifications requiring immediate attention',
  icon: '🚨',
  prefixes: {
    'urgent@speedycreditrepair.com': {
      label: 'Urgent Alerts',
      priority: PRIORITY_LEVELS.CRITICAL,
      color: '#FF0000',
      backgroundColor: '#FFE5E5',
      sound: SOUND_ALERTS.CRITICAL,
      vibration: VIBRATION_PATTERNS.CRITICAL,
      autoNotify: true,
      keywords: ['urgent', 'critical', 'emergency', 'immediate', 'alert', 'failure', 'error', 'down', 'security breach'],
      description: 'System errors, payment failures, security alerts',
      alias: 'urgent@'
    }
  }
};

// --------------------------------------------------------------------
// 2. PAYMENT PROCESSING (4 aliases)
// --------------------------------------------------------------------
export const PAYMENTS = {
  category: 'Payments',
  description: 'Payment processing, confirmations, and billing',
  icon: '💳',
  prefixes: {
    'payment-success@speedycreditrepair.com': {
      label: 'Payment Confirmations',
      priority: PRIORITY_LEVELS.HIGH,
      color: '#4CAF50',
      backgroundColor: '#E8F5E9',
      sound: SOUND_ALERTS.PAYMENT,
      vibration: VIBRATION_PATTERNS.CUSTOM_SUCCESS,
      autoNotify: true,
      keywords: ['payment received', 'payment successful', 'ACH processed', 'Zelle received', 'payment confirmed', 'transaction complete'],
      description: 'Successful ACH/Zelle payment confirmations',
      alias: 'payment-success@'
    },
    'payment-failed@speedycreditrepair.com': {
      label: 'Failed Payments',
      priority: PRIORITY_LEVELS.CRITICAL,
      color: '#F44336',
      backgroundColor: '#FFEBEE',
      sound: SOUND_ALERTS.CRITICAL,
      vibration: VIBRATION_PATTERNS.CRITICAL,
      autoNotify: true,
      keywords: ['payment failed', 'declined', 'insufficient funds', 'payment error', 'bank rejected', 'NSF'],
      description: 'Payment failures requiring immediate attention',
      alias: 'payment-failed@'
    },
    'payment-reminder@speedycreditrepair.com': {
      label: 'Payment Reminders',
      priority: PRIORITY_LEVELS.MEDIUM,
      color: '#FF9800',
      backgroundColor: '#FFF3E0',
      sound: SOUND_ALERTS.NORMAL,
      vibration: VIBRATION_PATTERNS.NORMAL,
      autoNotify: true,
      keywords: ['payment due', 'invoice reminder', 'upcoming payment', 'payment scheduled', 'balance due'],
      description: 'Automated payment reminders and invoice notifications',
      alias: 'payment-reminder@'
    },
    'noreply@speedycreditrepair.com': {
      label: 'Automated Notifications',
      priority: PRIORITY_LEVELS.LOW,
      color: '#9E9E9E',
      backgroundColor: '#F5F5F5',
      sound: SOUND_ALERTS.LOW,
      vibration: VIBRATION_PATTERNS.LOW,
      autoNotify: false,
      keywords: ['automated', 'do not reply', 'noreply', 'system generated'],
      description: 'System-generated automated emails',
      alias: 'noreply@'
    }
  }
};

// --------------------------------------------------------------------
// 3. CREDIT MONITORING & DISPUTES (3 aliases)
// --------------------------------------------------------------------
export const CREDIT_MONITORING = {
  category: 'Credit Monitoring',
  description: 'Credit reports, score updates, and dispute tracking',
  icon: '📊',
  prefixes: {
    'credit-report@speedycreditrepair.com': {
      label: 'Credit Reports',
      priority: PRIORITY_LEVELS.HIGH,
      color: '#1976D2',
      backgroundColor: '#E3F2FD',
      sound: SOUND_ALERTS.HIGH,
      vibration: VIBRATION_PATTERNS.MEDIUM,
      autoNotify: true,
      keywords: ['credit report', 'new report', 'report available', 'tri-merge', 'IDIQ report', 'bureau report'],
      description: 'New credit reports from IDIQ and bureaus',
      alias: 'credit-report@'
    },
    'score-update@speedycreditrepair.com': {
      label: 'Score Changes',
      priority: PRIORITY_LEVELS.MEDIUM,
      color: '#0288D1',
      backgroundColor: '#E1F5FE',
      sound: SOUND_ALERTS.MEDIUM,
      vibration: VIBRATION_PATTERNS.NORMAL,
      autoNotify: true,
      keywords: ['score change', 'credit score', 'FICO update', 'score increased', 'score decreased', 'score alert'],
      description: 'Credit score changes and monitoring alerts',
      alias: 'score-update@'
    },
    'dispute-update@speedycreditrepair.com': {
      label: 'Dispute Updates',
      priority: PRIORITY_LEVELS.HIGH,
      color: '#FF6B00',
      backgroundColor: '#FFF4E5',
      sound: SOUND_ALERTS.DISPUTE,
      vibration: VIBRATION_PATTERNS.HIGH,
      autoNotify: true,
      keywords: ['dispute', 'investigation', 'deleted', 'updated', 'verified', 'bureau response', 'item removed'],
      description: 'Bureau dispute responses and item deletions',
      alias: 'dispute-update@'
    }
  }
};

// --------------------------------------------------------------------
// 4. CLIENT ONBOARDING & ENGAGEMENT (2 aliases)
// --------------------------------------------------------------------
export const ONBOARDING = {
  category: 'Client Onboarding',
  description: 'Welcome messages and onboarding workflows',
  icon: '👋',
  prefixes: {
    'welcome@speedycreditrepair.com': {
      label: 'Welcome Messages',
      priority: PRIORITY_LEVELS.NORMAL,
      color: '#8BC34A',
      backgroundColor: '#F1F8E9',
      sound: SOUND_ALERTS.SUCCESS,
      vibration: VIBRATION_PATTERNS.CUSTOM_SUCCESS,
      autoNotify: true,
      keywords: ['welcome', 'thank you for joining', 'getting started', 'new client', 'welcome aboard'],
      description: 'Welcome emails for new clients',
      alias: 'welcome@'
    },
    'onboarding@speedycreditrepair.com': {
      label: 'Onboarding Steps',
      priority: PRIORITY_LEVELS.MEDIUM,
      color: '#7CB342',
      backgroundColor: '#DCEDC8',
      sound: SOUND_ALERTS.NORMAL,
      vibration: VIBRATION_PATTERNS.NORMAL,
      autoNotify: true,
      keywords: ['onboarding', 'setup', 'next steps', 'getting started', 'complete your profile', 'verify'],
      description: 'Client onboarding workflow notifications',
      alias: 'onboarding@'
    }
  }
};

// --------------------------------------------------------------------
// 5. DOCUMENTS & SIGNATURES (2 aliases)
// --------------------------------------------------------------------
export const DOCUMENTS = {
  category: 'Documents',
  description: 'Document management and e-signature requests',
  icon: '📄',
  prefixes: {
    'document-ready@speedycreditrepair.com': {
      label: 'Documents Ready',
      priority: PRIORITY_LEVELS.MEDIUM,
      color: '#673AB7',
      backgroundColor: '#EDE7F6',
      sound: SOUND_ALERTS.NORMAL,
      vibration: VIBRATION_PATTERNS.NORMAL,
      autoNotify: true,
      keywords: ['document ready', 'file available', 'download ready', 'report complete', 'letter generated'],
      description: 'Documents ready for download or review',
      alias: 'document-ready@'
    },
    'signature-required@speedycreditrepair.com': {
      label: 'Signature Requests',
      priority: PRIORITY_LEVELS.HIGH,
      color: '#9C27B0',
      backgroundColor: '#F3E5F5',
      sound: SOUND_ALERTS.HIGH,
      vibration: VIBRATION_PATTERNS.HIGH,
      autoNotify: true,
      keywords: ['signature required', 'please sign', 'e-sign', 'DocuSign', 'awaiting signature', 'contract'],
      description: 'E-signature requests for contracts and agreements',
      alias: 'signature-required@'
    }
  }
};

// --------------------------------------------------------------------
// 6. SCHEDULING & REMINDERS (3 aliases)
// --------------------------------------------------------------------
export const SCHEDULING = {
  category: 'Scheduling',
  description: 'Appointments, tasks, and reminders',
  icon: '📅',
  prefixes: {
    'appointment@speedycreditrepair.com': {
      label: 'Appointments',
      priority: PRIORITY_LEVELS.HIGH,
      color: '#E91E63',
      backgroundColor: '#FCE4EC',
      sound: SOUND_ALERTS.HIGH,
      vibration: VIBRATION_PATTERNS.HIGH,
      autoNotify: true,
      keywords: ['appointment', 'meeting', 'consultation', 'scheduled call', 'calendar invite', 'reschedule'],
      description: 'Appointment confirmations and reminders',
      alias: 'appointment@'
    },
    'reminder@speedycreditrepair.com': {
      label: 'General Reminders',
      priority: PRIORITY_LEVELS.NORMAL,
      color: '#FF5722',
      backgroundColor: '#FBE9E7',
      sound: SOUND_ALERTS.NORMAL,
      vibration: VIBRATION_PATTERNS.NORMAL,
      autoNotify: true,
      keywords: ['reminder', 'don\'t forget', 'upcoming', 'due soon', 'follow-up'],
      description: 'General reminders and follow-ups',
      alias: 'reminder@'
    },
    'task-assigned@speedycreditrepair.com': {
      label: 'Task Assignments',
      priority: PRIORITY_LEVELS.MEDIUM,
      color: '#FF7043',
      backgroundColor: '#FFCCBC',
      sound: SOUND_ALERTS.NORMAL,
      vibration: VIBRATION_PATTERNS.NORMAL,
      autoNotify: true,
      keywords: ['task assigned', 'new task', 'action required', 'assigned to you', 'deadline'],
      description: 'Task assignments and deadlines',
      alias: 'task-assigned@'
    }
  }
};

// --------------------------------------------------------------------
// 7. COMPLIANCE & ADMIN (2 aliases)
// --------------------------------------------------------------------
export const COMPLIANCE = {
  category: 'Compliance',
  description: 'Compliance alerts and administrative notices',
  icon: '⚖️',
  prefixes: {
    'compliance-alert@speedycreditrepair.com': {
      label: 'Compliance Alerts',
      priority: PRIORITY_LEVELS.CRITICAL,
      color: '#D32F2F',
      backgroundColor: '#FFCDD2',
      sound: SOUND_ALERTS.CRITICAL,
      vibration: VIBRATION_PATTERNS.CRITICAL,
      autoNotify: true,
      keywords: ['compliance', 'violation', 'FCRA', 'FDCPA', 'regulatory', 'audit', 'legal'],
      description: 'Compliance violations and regulatory alerts',
      alias: 'compliance-alert@'
    },
    'admin@speedycreditrepair.com': {
      label: 'Admin Alerts',
      priority: PRIORITY_LEVELS.HIGH,
      color: '#FF9800',
      backgroundColor: '#FFF3E0',
      sound: SOUND_ALERTS.HIGH,
      vibration: VIBRATION_PATTERNS.HIGH,
      autoNotify: true,
      keywords: ['admin alert', 'security', 'user activity', 'permission change', 'system admin'],
      description: 'Administrative alerts and security notifications',
      alias: 'admin@'
    }
  }
};

// --------------------------------------------------------------------
// 8. REFERRALS & REVIEWS (2 aliases)
// --------------------------------------------------------------------
export const MARKETING = {
  category: 'Marketing',
  description: 'Referral program and reputation management',
  icon: '⭐',
  prefixes: {
    'referral@speedycreditrepair.com': {
      label: 'Referrals',
      priority: PRIORITY_LEVELS.MEDIUM,
      color: '#CDDC39',
      backgroundColor: '#F9FBE7',
      sound: SOUND_ALERTS.SUCCESS,
      vibration: VIBRATION_PATTERNS.CUSTOM_SUCCESS,
      autoNotify: true,
      keywords: ['referral', 'referred by', 'new lead from partner', 'commission earned', 'bonus'],
      description: 'Referral notifications and partner commissions',
      alias: 'referral@'
    },
    'review-request@speedycreditrepair.com': {
      label: 'Review Requests',
      priority: PRIORITY_LEVELS.NORMAL,
      color: '#FFC107',
      backgroundColor: '#FFFDE7',
      sound: SOUND_ALERTS.NORMAL,
      vibration: VIBRATION_PATTERNS.NORMAL,
      autoNotify: false,
      keywords: ['review', 'feedback', 'testimonial', 'rate us', 'Google review', 'Yelp'],
      description: 'Customer review and feedback requests',
      alias: 'review-request@'
    }
  }
};

// --------------------------------------------------------------------
// 9. NEWSLETTERS & PROMOTIONS (2 aliases)
// --------------------------------------------------------------------
export const CONTENT = {
  category: 'Content & Promotions',
  description: 'Newsletters, promotions, and educational content',
  icon: '📰',
  prefixes: {
    'newsletter@speedycreditrepair.com': {
      label: 'Newsletters',
      priority: PRIORITY_LEVELS.LOW,
      color: '#3F51B5',
      backgroundColor: '#E8EAF6',
      sound: SOUND_ALERTS.LOW,
      vibration: VIBRATION_PATTERNS.LOW,
      autoNotify: false,
      keywords: ['newsletter', 'monthly update', 'tips', 'credit advice', 'industry news'],
      description: 'Monthly newsletters and updates',
      alias: 'newsletter@'
    },
    'promo@speedycreditrepair.com': {
      label: 'Promotions',
      priority: PRIORITY_LEVELS.LOW,
      color: '#9C27B0',
      backgroundColor: '#F3E5F5',
      sound: SOUND_ALERTS.LOW,
      vibration: VIBRATION_PATTERNS.LOW,
      autoNotify: false,
      keywords: ['promotion', 'special offer', 'discount', 'sale', 'limited time', 'coupon'],
      description: 'Special offers and promotional campaigns',
      alias: 'promo@'
    }
  }
};

// --------------------------------------------------------------------
// 10. SUPPORT & HELP (3 aliases)
// --------------------------------------------------------------------
export const SUPPORT = {
  category: 'Support',
  description: 'Customer support and help requests',
  icon: '🆘',
  prefixes: {
    'support@speedycreditrepair.com': {
      label: 'Support Tickets',
      priority: PRIORITY_LEVELS.MEDIUM,
      color: '#FF5252',
      backgroundColor: '#FFEBEE',
      sound: SOUND_ALERTS.MEDIUM,
      vibration: VIBRATION_PATTERNS.MEDIUM,
      autoNotify: true,
      keywords: ['support ticket', 'help request', 'issue reported', 'bug report', 'need help'],
      description: 'Customer support tickets and requests',
      alias: 'support@'
    },
    'help@speedycreditrepair.com': {
      label: 'Help Requests',
      priority: PRIORITY_LEVELS.MEDIUM,
      color: '#FF6E40',
      backgroundColor: '#FFCCBC',
      sound: SOUND_ALERTS.MEDIUM,
      vibration: VIBRATION_PATTERNS.MEDIUM,
      autoNotify: true,
      keywords: ['help', 'assistance', 'question', 'how do I', 'need help with'],
      description: 'General help and assistance requests',
      alias: 'help@'
    },
    'contact@speedycreditrepair.com': {
      label: 'Contact Form',
      priority: PRIORITY_LEVELS.MEDIUM,
      color: '#00BCD4',
      backgroundColor: '#E0F7FA',
      sound: SOUND_ALERTS.NORMAL,
      vibration: VIBRATION_PATTERNS.NORMAL,
      autoNotify: true,
      keywords: ['contact form', 'inquiry', 'get in touch', 'message from website', 'contact us'],
      description: 'Website contact form submissions',
      alias: 'contact@'
    }
  }
};

// --------------------------------------------------------------------
// 11. GENERAL & INFORMATIONAL (4 aliases)
// --------------------------------------------------------------------
export const GENERAL = {
  category: 'General',
  description: 'General inquiries and informational emails',
  icon: 'ℹ️',
  prefixes: {
    'info@speedycreditrepair.com': {
      label: 'General Info',
      priority: PRIORITY_LEVELS.NORMAL,
      color: '#00ACC1',
      backgroundColor: '#B2EBF2',
      sound: SOUND_ALERTS.NORMAL,
      vibration: VIBRATION_PATTERNS.NORMAL,
      autoNotify: true,
      keywords: ['information', 'inquiry', 'question', 'tell me more', 'details'],
      description: 'General information requests and inquiries',
      alias: 'info@'
    },
    'details@speedycreditrepair.com': {
      label: 'Account Details',
      priority: PRIORITY_LEVELS.NORMAL,
      color: '#0097A7',
      backgroundColor: '#B2DFDB',
      sound: SOUND_ALERTS.NORMAL,
      vibration: VIBRATION_PATTERNS.NORMAL,
      autoNotify: false,
      keywords: ['account details', 'summary', 'statement', 'account info', 'profile'],
      description: 'Account details and statements',
      alias: 'details@'
    },
    'about@speedycreditrepair.com': {
      label: 'Company Info',
      priority: PRIORITY_LEVELS.LOW,
      color: '#00838F',
      backgroundColor: '#E0F2F1',
      sound: SOUND_ALERTS.LOW,
      vibration: VIBRATION_PATTERNS.LOW,
      autoNotify: false,
      keywords: ['about us', 'company info', 'who we are', 'our story', 'team'],
      description: 'Company information and background',
      alias: 'about@'
    },
    'learn@speedycreditrepair.com': {
      label: 'Educational Content',
      priority: PRIORITY_LEVELS.LOW,
      color: '#006064',
      backgroundColor: '#E0F7FA',
      sound: SOUND_ALERTS.LOW,
      vibration: VIBRATION_PATTERNS.LOW,
      autoNotify: false,
      keywords: ['learn', 'education', 'training', 'course', 'tutorial', 'how to'],
      description: 'Educational content and training materials',
      alias: 'learn@'
    }
  }
};

// ===================================================================
// CONSOLIDATED EMAIL PREFIX CONFIGURATION
// ===================================================================
export const EMAIL_PREFIX_CONFIG = {
  ...CRITICAL_ALERTS.prefixes,
  ...PAYMENTS.prefixes,
  ...CREDIT_MONITORING.prefixes,
  ...ONBOARDING.prefixes,
  ...DOCUMENTS.prefixes,
  ...SCHEDULING.prefixes,
  ...COMPLIANCE.prefixes,
  ...MARKETING.prefixes,
  ...CONTENT.prefixes,
  ...SUPPORT.prefixes,
  ...GENERAL.prefixes
};

// ===================================================================
// CATEGORY GROUPS
// ===================================================================
export const CATEGORY_GROUPS = {
  CRITICAL_ALERTS,
  PAYMENTS,
  CREDIT_MONITORING,
  ONBOARDING,
  DOCUMENTS,
  SCHEDULING,
  COMPLIANCE,
  MARKETING,
  CONTENT,
  SUPPORT,
  GENERAL
};

// ===================================================================
// GOOGLE WORKSPACE CONFIGURATION SUMMARY
// ===================================================================
export const GOOGLE_WORKSPACE_CONFIG = {
  primaryEmail: 'chris@speedycreditrepair.com',
  aliasCount: 28,
  aliasLimit: 30,
  remainingSlots: 2,
  domain: 'speedycreditrepair.com',
  additionalUsers: ['laurie@speedycreditrepair.com'],
  allAliases: Object.keys(EMAIL_PREFIX_CONFIG)
};

// ===================================================================
// HELPER FUNCTIONS FOR MOBILE APP
// ===================================================================

/**
 * Get email prefix configuration by full email address
 * @param {string} email - The full email address
 * @returns {object|null} - Configuration object or null if not found
 */
export function getConfigByEmail(email) {
  if (!email) return null;

  // Normalize email to lowercase
  const normalizedEmail = email.toLowerCase().trim();

  // Try exact match first
  if (EMAIL_PREFIX_CONFIG[normalizedEmail]) {
    return EMAIL_PREFIX_CONFIG[normalizedEmail];
  }

  // Try matching just the alias part (before @)
  const alias = normalizedEmail.split('@')[0] + '@speedycreditrepair.com';
  return EMAIL_PREFIX_CONFIG[alias] || null;
}

/**
 * Extract full email alias from email address
 * @param {string} email - The email address
 * @returns {string|null} - The full alias or null
 */
export function extractAlias(email) {
  if (!email || !email.includes('@')) return null;
  const normalized = email.toLowerCase().trim();

  // If it already has the full domain, return it
  if (normalized.includes('@speedycreditrepair.com')) {
    return normalized;
  }

  // Otherwise, append the domain
  return normalized.split('@')[0] + '@speedycreditrepair.com';
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
 * Get color styling for an email alias
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
 * Match email content to appropriate alias using keywords
 * @param {string} subject - Email subject
 * @param {string} body - Email body
 * @returns {string|null} - Suggested alias or null
 */
export function suggestAlias(subject, body) {
  const content = `${subject} ${body}`.toLowerCase();

  for (const [alias, config] of Object.entries(EMAIL_PREFIX_CONFIG)) {
    if (config.keywords && config.keywords.some(keyword => content.includes(keyword.toLowerCase()))) {
      return alias;
    }
  }

  return 'info@speedycreditrepair.com'; // Default to info@ if no match
}

/**
 * Get all aliases sorted by priority
 * @returns {array} - Array of alias objects sorted by priority
 */
export function getAliasesByPriority() {
  return Object.entries(EMAIL_PREFIX_CONFIG)
    .map(([alias, config]) => ({ alias, ...config }))
    .sort((a, b) => a.priority - b.priority);
}

/**
 * Get aliases by category
 * @param {string} category - Category name
 * @returns {array} - Array of alias objects
 */
export function getAliasesByCategory(category) {
  const categoryGroup = Object.values(CATEGORY_GROUPS).find(
    group => group.category === category
  );

  if (!categoryGroup) return [];

  return Object.entries(categoryGroup.prefixes).map(([alias, config]) => ({
    alias,
    ...config
  }));
}

/**
 * Validate email alias
 * @param {string} alias - The alias to validate
 * @returns {boolean}
 */
export function isValidAlias(alias) {
  const normalized = extractAlias(alias);
  return normalized && normalized in EMAIL_PREFIX_CONFIG;
}

/**
 * Get category for an alias
 * @param {string} alias - The email alias
 * @returns {string|null} - Category name or null
 */
export function getCategoryForAlias(alias) {
  const normalized = extractAlias(alias);
  for (const group of Object.values(CATEGORY_GROUPS)) {
    if (normalized in group.prefixes) {
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
    category: getCategoryForAlias(extractAlias(email)),
    alias: config?.alias || email
  };
}

/**
 * Get category icon for an alias
 * @param {string} email - The email address
 * @returns {string} - Emoji icon
 */
export function getCategoryIcon(email) {
  const category = getCategoryForAlias(extractAlias(email));
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
 * Get statistics for alias usage
 * @param {array} emails - Array of email addresses
 * @returns {object} - Statistics object
 */
export function getEmailStatistics(emails) {
  const stats = {
    total: emails.length,
    byAlias: {},
    byCategory: {},
    byPriority: {}
  };

  emails.forEach(email => {
    const alias = extractAlias(email);
    const category = getCategoryForAlias(alias);
    const priority = getPriority(email);

    stats.byAlias[alias] = (stats.byAlias[alias] || 0) + 1;
    stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
    stats.byPriority[priority] = (stats.byPriority[priority] || 0) + 1;
  });

  return stats;
}

/**
 * Get recommended aliases for remaining 2 slots
 * @returns {array} - Array of recommended alias objects
 */
export function getRecommendedAliases() {
  return [
    {
      alias: 'collections@speedycreditrepair.com',
      label: 'Collections & AR',
      priority: PRIORITY_LEVELS.HIGH,
      description: 'Past due accounts and collections follow-ups',
      category: 'Billing',
      useCase: 'Separate high-priority collections emails from regular billing'
    },
    {
      alias: 'alerts@speedycreditrepair.com',
      label: 'System Alerts',
      priority: PRIORITY_LEVELS.MEDIUM,
      description: 'Non-critical system alerts and monitoring',
      category: 'System',
      useCase: 'General system notifications that don\'t require immediate action'
    }
  ];
}

// ===================================================================
// EXPORT DEFAULT
// ===================================================================
export default {
  EMAIL_PREFIX_CONFIG,
  CATEGORY_GROUPS,
  GOOGLE_WORKSPACE_CONFIG,
  PRIORITY_LEVELS,
  VIBRATION_PATTERNS,
  SOUND_ALERTS,
  // Helper functions
  getConfigByEmail,
  extractAlias,
  getPriority,
  shouldAutoNotify,
  getNotificationSound,
  getVibrationPattern,
  getColorStyling,
  suggestAlias,
  getAliasesByPriority,
  getAliasesByCategory,
  isValidAlias,
  getCategoryForAlias,
  formatMobileNotification,
  getCategoryIcon,
  getAllCategories,
  getEmailStatistics,
  getRecommendedAliases
};
