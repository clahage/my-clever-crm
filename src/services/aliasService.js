/**
 * Email Alias Management Service for Speedy Credit Repair
 * Manages 20+ Gmail aliases with routing, permissions, and analytics
 *
 * Features:
 * - 20+ predefined email aliases
 * - Alias selection logic
 * - Permission/access control
 * - Usage tracking and analytics
 * - Smart alias recommendations
 */

import { db } from '@/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';

/**
 * Email Aliases Registry
 * 20+ aliases for different business functions
 */
export const EMAIL_ALIASES = {
  // Primary Customer-Facing Aliases
  support: {
    email: 'support@speedycreditrepair.com',
    name: 'Speedy Credit Repair Support',
    purpose: 'General customer support inquiries',
    department: 'support',
    priority: 'medium',
    autoResponse: true,
    handler: 'supportHandler',
    category: 'customer-facing',
  },

  urgent: {
    email: 'urgent@speedycreditrepair.com',
    name: 'Urgent Priority Team',
    purpose: 'Urgent matters requiring immediate attention',
    department: 'urgent',
    priority: 'high',
    autoResponse: true,
    handler: 'urgentHandler',
    category: 'customer-facing',
  },

  info: {
    email: 'info@speedycreditrepair.com',
    name: 'Speedy Credit Repair Information',
    purpose: 'General information requests',
    department: 'sales',
    priority: 'low',
    autoResponse: true,
    handler: 'infoHandler',
    category: 'customer-facing',
  },

  hello: {
    email: 'hello@speedycreditrepair.com',
    name: 'Speedy Credit Repair',
    purpose: 'Friendly, welcoming initial contact',
    department: 'sales',
    priority: 'medium',
    autoResponse: true,
    handler: 'helloHandler',
    category: 'customer-facing',
  },

  contact: {
    email: 'contact@speedycreditrepair.com',
    name: 'Speedy Credit Repair Contact',
    purpose: 'Primary contact form submissions',
    department: 'sales',
    priority: 'medium',
    autoResponse: true,
    handler: 'contactHandler',
    category: 'customer-facing',
  },

  // Sales & Marketing Aliases
  sales: {
    email: 'sales@speedycreditrepair.com',
    name: 'Speedy Credit Repair Sales Team',
    purpose: 'Sales inquiries and new business',
    department: 'sales',
    priority: 'high',
    autoResponse: true,
    handler: 'salesHandler',
    category: 'sales',
  },

  quotes: {
    email: 'quotes@speedycreditrepair.com',
    name: 'Speedy Credit Repair Quotes',
    purpose: 'Price quotes and estimates',
    department: 'sales',
    priority: 'high',
    autoResponse: true,
    handler: 'quotesHandler',
    category: 'sales',
  },

  partnerships: {
    email: 'partnerships@speedycreditrepair.com',
    name: 'Speedy Credit Repair Partnerships',
    purpose: 'Partnership and affiliate inquiries',
    department: 'partnerships',
    priority: 'medium',
    autoResponse: false,
    handler: 'partnershipsHandler',
    category: 'business',
  },

  // Service-Specific Aliases
  review: {
    email: 'review@speedycreditrepair.com',
    name: 'Credit Review Team',
    purpose: 'Credit report review requests',
    department: 'operations',
    priority: 'high',
    autoResponse: true,
    handler: 'reviewHandler',
    category: 'service',
  },

  disputes: {
    email: 'disputes@speedycreditrepair.com',
    name: 'Dispute Resolution Team',
    purpose: 'Credit dispute submissions and updates',
    department: 'disputes',
    priority: 'high',
    autoResponse: true,
    handler: 'disputesHandler',
    category: 'service',
  },

  schedule: {
    email: 'schedule@speedycreditrepair.com',
    name: 'Scheduling Team',
    purpose: 'Appointment scheduling and calendar requests',
    department: 'scheduling',
    priority: 'medium',
    autoResponse: true,
    handler: 'scheduleHandler',
    category: 'service',
  },

  // Financial & Billing Aliases
  billing: {
    email: 'billing@speedycreditrepair.com',
    name: 'Billing Department',
    purpose: 'Billing, invoices, and payment questions',
    department: 'billing',
    priority: 'high',
    autoResponse: true,
    handler: 'billingHandler',
    category: 'financial',
  },

  payments: {
    email: 'payments@speedycreditrepair.com',
    name: 'Payment Processing',
    purpose: 'Payment confirmations and receipts',
    department: 'billing',
    priority: 'medium',
    autoResponse: false,
    handler: 'paymentsHandler',
    category: 'financial',
  },

  // Document & Verification Aliases
  docs: {
    email: 'docs@speedycreditrepair.com',
    name: 'Document Management',
    purpose: 'Document uploads and file attachments',
    department: 'operations',
    priority: 'medium',
    autoResponse: true,
    handler: 'docsHandler',
    category: 'operations',
  },

  verify: {
    email: 'verify@speedycreditrepair.com',
    name: 'Identity Verification',
    purpose: 'Identity verification requests',
    department: 'compliance',
    priority: 'high',
    autoResponse: true,
    handler: 'verifyHandler',
    category: 'operations',
  },

  // Customer Management Aliases
  welcome: {
    email: 'welcome@speedycreditrepair.com',
    name: 'Speedy Credit Repair Welcome Team',
    purpose: 'New client onboarding and welcome messages',
    department: 'onboarding',
    priority: 'high',
    autoResponse: false,
    handler: 'welcomeHandler',
    category: 'customer-management',
  },

  feedback: {
    email: 'feedback@speedycreditrepair.com',
    name: 'Customer Feedback Team',
    purpose: 'Client feedback, testimonials, and reviews',
    department: 'success',
    priority: 'medium',
    autoResponse: true,
    handler: 'feedbackHandler',
    category: 'customer-management',
  },

  success: {
    email: 'success@speedycreditrepair.com',
    name: 'Customer Success Team',
    purpose: 'Ongoing client success and satisfaction',
    department: 'success',
    priority: 'medium',
    autoResponse: false,
    handler: 'successHandler',
    category: 'customer-management',
  },

  // Administrative Aliases
  admin: {
    email: 'admin@speedycreditrepair.com',
    name: 'System Administrator',
    purpose: 'Administrative and system notifications',
    department: 'admin',
    priority: 'high',
    autoResponse: false,
    handler: 'adminHandler',
    category: 'administrative',
  },

  legal: {
    email: 'legal@speedycreditrepair.com',
    name: 'Legal Department',
    purpose: 'Legal inquiries, compliance, and disputes',
    department: 'legal',
    priority: 'high',
    autoResponse: true,
    handler: 'legalHandler',
    category: 'administrative',
  },

  // Special Purpose Aliases
  noreply: {
    email: 'noreply@speedycreditrepair.com',
    name: 'Speedy Credit Repair Notifications',
    purpose: 'System notifications and automated emails',
    department: 'system',
    priority: 'low',
    autoResponse: false,
    handler: null,
    category: 'system',
  },

  unsubscribe: {
    email: 'unsubscribe@speedycreditrepair.com',
    name: 'Unsubscribe Management',
    purpose: 'Email opt-out and unsubscribe requests',
    department: 'compliance',
    priority: 'high',
    autoResponse: true,
    handler: 'unsubscribeHandler',
    category: 'compliance',
  },

  ai: {
    email: 'ai@speedycreditrepair.com',
    name: 'AI Assistant',
    purpose: 'AI-powered automated responses and workflows',
    department: 'automation',
    priority: 'medium',
    autoResponse: false,
    handler: 'aiHandler',
    category: 'automation',
  },
};

/**
 * Alias Service Class
 */
class AliasService {
  /**
   * Get all available aliases
   * @param {Object} filters - Filter options
   * @returns {Array} Array of alias objects
   */
  getAllAliases(filters = {}) {
    let aliases = Object.entries(EMAIL_ALIASES).map(([key, config]) => ({
      key,
      ...config,
    }));

    // Apply filters
    if (filters.category) {
      aliases = aliases.filter(a => a.category === filters.category);
    }

    if (filters.department) {
      aliases = aliases.filter(a => a.department === filters.department);
    }

    if (filters.priority) {
      aliases = aliases.filter(a => a.priority === filters.priority);
    }

    return aliases;
  }

  /**
   * Get alias by key or email
   * @param {string} identifier - Alias key or email address
   * @returns {Object} Alias configuration
   */
  getAlias(identifier) {
    // Try by key first
    if (EMAIL_ALIASES[identifier]) {
      return { key: identifier, ...EMAIL_ALIASES[identifier] };
    }

    // Try by email
    const entry = Object.entries(EMAIL_ALIASES).find(([_, config]) =>
      config.email === identifier
    );

    if (entry) {
      return { key: entry[0], ...entry[1] };
    }

    return null;
  }

  /**
   * Get user's permitted aliases based on role
   * @param {string} userRole - User role
   * @returns {Array} Permitted alias keys
   */
  getPermittedAliases(userRole) {
    // Role-based permissions
    const rolePermissions = {
      masterAdmin: 'all',
      admin: ['support', 'urgent', 'info', 'hello', 'contact', 'sales', 'quotes', 'review', 'disputes', 'schedule', 'billing', 'docs', 'verify', 'welcome', 'feedback', 'success', 'admin'],
      manager: ['support', 'urgent', 'info', 'hello', 'contact', 'sales', 'review', 'disputes', 'schedule', 'billing', 'docs', 'welcome', 'feedback', 'success'],
      supervisor: ['support', 'info', 'hello', 'contact', 'review', 'disputes', 'schedule', 'docs', 'feedback'],
      seniorAgent: ['support', 'info', 'contact', 'review', 'disputes', 'docs', 'feedback'],
      agent: ['support', 'info', 'contact', 'feedback'],
      trainee: ['support', 'info'],
      viewer: [],
    };

    if (rolePermissions[userRole] === 'all') {
      return Object.keys(EMAIL_ALIASES);
    }

    return rolePermissions[userRole] || [];
  }

  /**
   * Check if user can use specific alias
   * @param {string} userId - User ID
   * @param {string} aliasKey - Alias key
   * @returns {boolean} Permission granted
   */
  async canUseAlias(userId, aliasKey) {
    try {
      // Get user role from Firestore
      const userDoc = await getDoc(doc(db, 'users', userId));

      if (!userDoc.exists()) {
        return false;
      }

      const userRole = userDoc.data().role || 'viewer';
      const permittedAliases = this.getPermittedAliases(userRole);

      return permittedAliases.includes(aliasKey) || permittedAliases === 'all';
    } catch (error) {
      console.error('Failed to check alias permission:', error);
      return false;
    }
  }

  /**
   * Get alias usage statistics
   * @param {string} aliasKey - Alias key
   * @param {Object} options - Query options
   * @returns {Object} Usage statistics
   */
  async getAliasStats(aliasKey, options = {}) {
    const {
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      endDate = new Date()
    } = options;

    try {
      const alias = this.getAlias(aliasKey);
      if (!alias) {
        throw new Error(`Alias ${aliasKey} not found`);
      }

      // Query email logs
      const logsQuery = query(
        collection(db, 'emailLogs'),
        where('from', '==', alias.email),
        where('sentAt', '>=', startDate),
        where('sentAt', '<=', endDate),
        orderBy('sentAt', 'desc')
      );

      const snapshot = await getDocs(logsQuery);

      const stats = {
        totalSent: 0,
        successful: 0,
        failed: 0,
        opens: 0,
        clicks: 0,
        recipients: new Set(),
      };

      snapshot.forEach(doc => {
        const data = doc.data();
        stats.totalSent++;

        if (data.status === 'sent' || data.status === 'delivered') {
          stats.successful++;
        } else if (data.status === 'failed') {
          stats.failed++;
        }

        if (data.opened) stats.opens++;
        if (data.clicked) stats.clicks++;

        if (Array.isArray(data.to)) {
          data.to.forEach(recipient => stats.recipients.add(recipient));
        } else if (data.to) {
          stats.recipients.add(data.to);
        }
      });

      return {
        ...stats,
        recipients: stats.recipients.size,
        openRate: stats.successful > 0 ? (stats.opens / stats.successful * 100).toFixed(2) : 0,
        clickRate: stats.successful > 0 ? (stats.clicks / stats.successful * 100).toFixed(2) : 0,
        successRate: stats.totalSent > 0 ? (stats.successful / stats.totalSent * 100).toFixed(2) : 0,
        period: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      };
    } catch (error) {
      console.error(`Failed to get stats for alias ${aliasKey}:`, error);
      throw error;
    }
  }

  /**
   * Recommend best alias for sending based on context
   * @param {Object} context - Email context
   * @returns {string} Recommended alias key
   */
  recommendAlias(context) {
    const {
      purpose,
      urgency,
      contactType,
      department,
      isAutomated = false
    } = context;

    // Urgent priority
    if (urgency === 'high' || urgency === 'urgent') {
      return 'urgent';
    }

    // Automated system emails
    if (isAutomated) {
      return 'noreply';
    }

    // Purpose-based routing
    if (purpose === 'billing' || purpose === 'payment' || purpose === 'invoice') {
      return 'billing';
    }

    if (purpose === 'dispute' || purpose === 'credit-dispute') {
      return 'disputes';
    }

    if (purpose === 'review' || purpose === 'credit-review') {
      return 'review';
    }

    if (purpose === 'schedule' || purpose === 'appointment') {
      return 'schedule';
    }

    if (purpose === 'document' || purpose === 'upload') {
      return 'docs';
    }

    if (purpose === 'verification' || purpose === 'identity') {
      return 'verify';
    }

    if (purpose === 'legal' || purpose === 'compliance') {
      return 'legal';
    }

    if (purpose === 'partnership' || purpose === 'affiliate') {
      return 'partnerships';
    }

    if (purpose === 'feedback' || purpose === 'review-request' || purpose === 'testimonial') {
      return 'feedback';
    }

    if (purpose === 'welcome' || purpose === 'onboarding') {
      return 'welcome';
    }

    if (purpose === 'unsubscribe' || purpose === 'opt-out') {
      return 'unsubscribe';
    }

    // Contact type
    if (contactType === 'lead' || contactType === 'prospect') {
      return 'sales';
    }

    if (contactType === 'client' || contactType === 'customer') {
      return 'support';
    }

    // Department-based
    if (department) {
      const aliasesByDept = this.getAllAliases({ department });
      if (aliasesByDept.length > 0) {
        return aliasesByDept[0].key;
      }
    }

    // Default fallback
    return 'contact';
  }

  /**
   * Save custom alias configuration
   * @param {string} aliasKey - Alias key
   * @param {Object} config - Configuration updates
   */
  async saveAliasConfig(aliasKey, config) {
    try {
      await setDoc(
        doc(db, 'emailAliasConfigs', aliasKey),
        {
          ...config,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      console.log(`✅ Alias config saved for ${aliasKey}`);
    } catch (error) {
      console.error(`Failed to save alias config for ${aliasKey}:`, error);
      throw error;
    }
  }

  /**
   * Get custom alias configuration
   * @param {string} aliasKey - Alias key
   * @returns {Object} Custom configuration
   */
  async getAliasConfig(aliasKey) {
    try {
      const configDoc = await getDoc(doc(db, 'emailAliasConfigs', aliasKey));

      if (configDoc.exists()) {
        return configDoc.data();
      }

      return null;
    } catch (error) {
      console.error(`Failed to get alias config for ${aliasKey}:`, error);
      return null;
    }
  }

  /**
   * Get aliases grouped by category
   * @returns {Object} Aliases grouped by category
   */
  getAliasesByCategory() {
    const grouped = {};

    Object.entries(EMAIL_ALIASES).forEach(([key, config]) => {
      const category = config.category || 'other';

      if (!grouped[category]) {
        grouped[category] = [];
      }

      grouped[category].push({ key, ...config });
    });

    return grouped;
  }

  /**
   * Search aliases by query
   * @param {string} searchQuery - Search term
   * @returns {Array} Matching aliases
   */
  searchAliases(searchQuery) {
    const query = searchQuery.toLowerCase();

    return Object.entries(EMAIL_ALIASES)
      .filter(([key, config]) => {
        return (
          key.toLowerCase().includes(query) ||
          config.email.toLowerCase().includes(query) ||
          config.name.toLowerCase().includes(query) ||
          config.purpose.toLowerCase().includes(query) ||
          config.department.toLowerCase().includes(query)
        );
      })
      .map(([key, config]) => ({ key, ...config }));
  }
}

// Export singleton instance
const aliasService = new AliasService();

export default aliasService;
export { AliasService, EMAIL_ALIASES };
