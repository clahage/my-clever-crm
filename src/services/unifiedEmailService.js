/**
 * Unified Email Service for Speedy Credit Repair
 * Intelligently routes emails between Gmail API (20+ aliases) and SendGrid
 *
 * Features:
 * - Multi-alias support with automatic routing
 * - Gmail API for personalized aliases
 * - SendGrid fallback for high-volume campaigns
 * - Unified API for all email sending
 * - Automatic failover on errors
 * - Rate limiting per alias
 * - Smart provider selection
 */

import aliasService, { EMAIL_ALIASES } from './aliasService';
import { sendEmail as sendGridEmail, sendBulkEmail as sendGridBulk } from './emailService';
import { db } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Configuration
 */
const USE_GMAIL_FOR_ALIASES = import.meta.env.VITE_USE_GMAIL_ALIASES === 'true';
const GMAIL_RATE_LIMIT_PER_SECOND = 5;
const SENDGRID_RATE_LIMIT_PER_SECOND = 10;

/**
 * Unified Email Service Class
 */
class UnifiedEmailService {
  constructor() {
    this.gmailService = null;
    this.gmailInitialized = false;
    this.sendQueue = [];
    this.processing = false;
  }

  /**
   * Initialize Gmail service (lazy loading)
   * Only loads when Gmail is actually needed
   */
  async initializeGmail(userId = null) {
    if (this.gmailInitialized) {
      return true;
    }

    try {
      // Import gmailService dynamically (only in Node.js environment)
      if (typeof window === 'undefined') {
        const { gmailService } = await import('../../functions/gmailService.js');
        await gmailService.initialize(userId);
        this.gmailService = gmailService;
        this.gmailInitialized = true;
        console.log('✅ Gmail service initialized');
        return true;
      } else {
        // In browser, Gmail operations will be handled by Cloud Functions
        console.log('ℹ️ Gmail operations will use Cloud Functions');
        return false;
      }
    } catch (error) {
      console.error('❌ Gmail initialization failed:', error);
      return false;
    }
  }

  /**
   * Send email using appropriate provider based on alias
   * @param {Object} options - Email options
   * @returns {Promise<Object>} Send result
   */
  async send(options) {
    const {
      to,
      subject,
      html,
      text,
      from,
      fromName,
      replyTo,
      alias = 'contact',
      priority = 'normal',
      attachments = [],
      trackingSettings = {},
      metadata = {},
      userId = null,
    } = options;

    try {
      // Get alias configuration
      const aliasConfig = aliasService.getAlias(alias);

      if (!aliasConfig) {
        throw new Error(`Unknown alias: ${alias}`);
      }

      // Determine sender email and name
      const senderEmail = from || aliasConfig.email;
      const senderName = fromName || aliasConfig.name;
      const replyToEmail = replyTo || aliasConfig.email;

      // Check if user has permission to use this alias
      if (userId) {
        const canUse = await aliasService.canUseAlias(userId, alias);
        if (!canUse) {
          throw new Error(`User ${userId} not permitted to use alias ${alias}`);
        }
      }

      // Check rate limits for alias
      if (this.gmailInitialized && this.gmailService) {
        const canSend = await this.gmailService.canSend(senderEmail);
        if (!canSend) {
          console.warn(`⚠️ Rate limit exceeded for ${senderEmail}, falling back to SendGrid`);
          return await this.sendViaSendGrid({
            to,
            subject,
            html,
            text,
            from: senderEmail,
            replyTo: replyToEmail,
            priority,
            attachments,
            trackingSettings,
            metadata: { ...metadata, alias, provider: 'sendgrid-fallback' },
          });
        }
      }

      // Route to appropriate provider
      if (USE_GMAIL_FOR_ALIASES && this.gmailService) {
        // Use Gmail for personalized aliases
        return await this.sendViaGmail({
          to,
          subject,
          html,
          text,
          from: senderEmail,
          fromName: senderName,
          replyTo: replyToEmail,
          attachments,
          metadata: { ...metadata, alias, provider: 'gmail' },
        });
      } else {
        // Use SendGrid (default)
        return await this.sendViaSendGrid({
          to,
          subject,
          html,
          text,
          from: senderEmail,
          replyTo: replyToEmail,
          priority,
          attachments,
          trackingSettings,
          metadata: { ...metadata, alias, provider: 'sendgrid' },
        });
      }
    } catch (error) {
      console.error('❌ Unified email send failed:', error);

      // Try failover to SendGrid if Gmail failed
      if (error.message.includes('Gmail') || error.message.includes('gmail')) {
        console.log('⏳ Attempting SendGrid failover...');
        try {
          return await this.sendViaSendGrid(options);
        } catch (fallbackError) {
          console.error('❌ SendGrid failover also failed:', fallbackError);
          throw fallbackError;
        }
      }

      throw error;
    }
  }

  /**
   * Send email via Gmail API
   * @param {Object} options - Email options
   * @returns {Promise<Object>} Send result
   */
  async sendViaGmail(options) {
    if (!this.gmailService) {
      throw new Error('Gmail service not initialized');
    }

    try {
      const result = await this.gmailService.sendEmail(options);

      console.log(`✅ Email sent via Gmail: ${options.to}`);

      return {
        success: true,
        provider: 'gmail',
        messageId: result.messageId,
        threadId: result.threadId,
      };
    } catch (error) {
      console.error('❌ Gmail send failed:', error);
      throw error;
    }
  }

  /**
   * Send email via SendGrid
   * @param {Object} options - Email options
   * @returns {Promise<Object>} Send result
   */
  async sendViaSendGrid(options) {
    try {
      const result = await sendGridEmail(options);

      console.log(`✅ Email sent via SendGrid: ${options.to}`);

      return {
        success: true,
        provider: 'sendgrid',
        messageId: result.messageId,
        logId: result.logId,
      };
    } catch (error) {
      console.error('❌ SendGrid send failed:', error);
      throw error;
    }
  }

  /**
   * Send bulk emails with intelligent provider selection
   * @param {Array} emails - Array of email objects
   * @param {Object} options - Bulk send options
   * @returns {Promise<Object>} Results summary
   */
  async sendBulk(emails, options = {}) {
    const {
      alias = 'noreply',
      useGmail = false,
      batchSize = 100,
      delayBetweenBatches = 1000,
    } = options;

    const results = {
      total: emails.length,
      sent: [],
      failed: [],
      provider: useGmail ? 'gmail' : 'sendgrid',
    };

    try {
      if (useGmail && this.gmailService) {
        // Send via Gmail with rate limiting
        for (let i = 0; i < emails.length; i += batchSize) {
          const batch = emails.slice(i, i + batchSize);

          for (const email of batch) {
            try {
              const result = await this.send({
                ...email,
                alias,
                userId: options.userId,
              });

              results.sent.push({ email: email.to, result });
            } catch (error) {
              results.failed.push({ email: email.to, error: error.message });
            }

            // Rate limiting delay
            await this.sleep(1000 / GMAIL_RATE_LIMIT_PER_SECOND);
          }

          // Delay between batches
          if (i + batchSize < emails.length) {
            console.log(`⏳ Batch ${i / batchSize + 1} complete, pausing...`);
            await this.sleep(delayBetweenBatches);
          }
        }
      } else {
        // Use SendGrid bulk API (more efficient for campaigns)
        const recipients = emails.map(e => ({
          email: e.to,
          name: e.toName || '',
          personalizations: e.personalizations || {},
        }));

        const bulkResult = await sendGridBulk(
          recipients,
          options.subject || emails[0]?.subject,
          options.htmlTemplate || emails[0]?.html,
          {
            from: aliasService.getAlias(alias)?.email,
            ...options,
          }
        );

        results.sent = bulkResult.sent || [];
        results.failed = bulkResult.errors || [];
      }

      console.log(`✅ Bulk send complete: ${results.sent.length} sent, ${results.failed.length} failed`);

      return results;
    } catch (error) {
      console.error('❌ Bulk send failed:', error);
      throw error;
    }
  }

  /**
   * Send email with smart alias recommendation
   * @param {Object} options - Email options
   * @param {Object} context - Context for alias recommendation
   * @returns {Promise<Object>} Send result
   */
  async sendSmart(options, context = {}) {
    // Recommend best alias based on context
    const recommendedAlias = aliasService.recommendAlias(context);

    console.log(`💡 Recommended alias: ${recommendedAlias} for context:`, context);

    return await this.send({
      ...options,
      alias: options.alias || recommendedAlias,
    });
  }

  /**
   * Send transactional email (high priority, personalized)
   * Uses Gmail for better deliverability
   * @param {Object} options - Email options
   * @returns {Promise<Object>} Send result
   */
  async sendTransactional(options) {
    return await this.send({
      ...options,
      priority: 'high',
      useGmail: true,
    });
  }

  /**
   * Send marketing email (bulk, via SendGrid)
   * @param {Array} recipients - Recipients list
   * @param {Object} campaign - Campaign details
   * @returns {Promise<Object>} Results
   */
  async sendMarketing(recipients, campaign) {
    return await this.sendBulk(
      recipients.map(r => ({
        to: r.email,
        toName: r.name,
        subject: campaign.subject,
        html: campaign.html,
        personalizations: r.personalizations,
      })),
      {
        alias: campaign.alias || 'sales',
        useGmail: false, // Always use SendGrid for marketing
        subject: campaign.subject,
        htmlTemplate: campaign.html,
      }
    );
  }

  /**
   * Send support email (uses support alias)
   * @param {Object} options - Email options
   * @returns {Promise<Object>} Send result
   */
  async sendSupport(options) {
    return await this.send({
      ...options,
      alias: 'support',
      priority: 'normal',
    });
  }

  /**
   * Send urgent email (uses urgent alias, high priority)
   * @param {Object} options - Email options
   * @returns {Promise<Object>} Send result
   */
  async sendUrgent(options) {
    return await this.send({
      ...options,
      alias: 'urgent',
      priority: 'high',
    });
  }

  /**
   * Get alias usage statistics
   * @param {string} alias - Alias key
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Statistics
   */
  async getAliasStats(alias, options = {}) {
    return await aliasService.getAliasStats(alias, options);
  }

  /**
   * Get all available aliases for user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Available aliases
   */
  async getAvailableAliases(userId) {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return [];
    }

    const userRole = userDoc.data().role || 'viewer';
    const permittedAliasKeys = aliasService.getPermittedAliases(userRole);

    return permittedAliasKeys.map(key => aliasService.getAlias(key));
  }

  /**
   * Test email configuration
   * Sends a test email to verify setup
   * @param {string} recipientEmail - Test recipient
   * @param {string} alias - Alias to test
   * @returns {Promise<Object>} Test result
   */
  async sendTestEmail(recipientEmail, alias = 'contact') {
    const aliasConfig = aliasService.getAlias(alias);

    if (!aliasConfig) {
      throw new Error(`Unknown alias: ${alias}`);
    }

    return await this.send({
      to: recipientEmail,
      subject: `Test Email from ${aliasConfig.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>✅ Email Configuration Test</h2>
          <p>This is a test email to verify your email configuration.</p>
          <hr>
          <p><strong>Alias:</strong> ${alias} (${aliasConfig.email})</p>
          <p><strong>Department:</strong> ${aliasConfig.department}</p>
          <p><strong>Purpose:</strong> ${aliasConfig.purpose}</p>
          <p><strong>Priority:</strong> ${aliasConfig.priority}</p>
          <hr>
          <p>If you received this email, your email system is working correctly!</p>
          <p style="color: #666; font-size: 12px;">Sent at: ${new Date().toLocaleString()}</p>
        </div>
      `,
      alias,
      metadata: {
        type: 'test',
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Helper: Sleep for specified milliseconds
   * @param {number} ms - Milliseconds to sleep
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
const unifiedEmailService = new UnifiedEmailService();

export default unifiedEmailService;
export { UnifiedEmailService };
