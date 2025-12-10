/**
 * Gmail API Service for Speedy Credit Repair
 * Handles Gmail API integration for 20+ email aliases
 *
 * Features:
 * - Multi-alias email sending via Gmail API
 * - OAuth 2.0 token management
 * - Incoming email parsing and routing
 * - Thread management and labels
 * - Rate limiting per alias
 * - Failover to SendGrid
 */

const { google } = require('googleapis');
const { admin, db } = require('./firebaseAdmin');
const nodemailer = require('nodemailer');

// Gmail API scopes required
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.labels',
];

/**
 * Gmail Service Class
 * Manages Gmail API operations for multiple aliases
 */
class GmailService {
  constructor() {
    this.oauth2Client = null;
    this.gmail = null;
    this.initialized = false;
  }

  /**
   * Initialize Gmail API with OAuth credentials
   * @param {string} userId - Firebase user ID for credential lookup
   */
  async initialize(userId = null) {
    try {
      // Get OAuth credentials from environment or Firestore
      const credentials = await this.getCredentials(userId);

      this.oauth2Client = new google.auth.OAuth2(
        credentials.clientId,
        credentials.clientSecret,
        credentials.redirectUri
      );

      // Set credentials
      this.oauth2Client.setCredentials({
        access_token: credentials.accessToken,
        refresh_token: credentials.refreshToken,
        expiry_date: credentials.expiryDate,
      });

      // Auto-refresh tokens
      this.oauth2Client.on('tokens', async (tokens) => {
        await this.saveTokens(userId, tokens);
      });

      this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
      this.initialized = true;

      console.log('✅ Gmail API initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Gmail API initialization failed:', error);
      throw new Error(`Gmail initialization failed: ${error.message}`);
    }
  }

  /**
   * Get OAuth credentials from Firestore or environment
   * @param {string} userId - User ID for credential lookup
   * @returns {Object} Credentials object
   */
  async getCredentials(userId) {
    // Try Firestore first for user-specific credentials
    if (userId) {
      const credDoc = await db.collection('gmailCredentials').doc(userId).get();
      if (credDoc.exists) {
        return credDoc.data();
      }
    }

    // Fall back to environment variables (system-wide credentials)
    return {
      clientId: process.env.GMAIL_CLIENT_ID,
      clientSecret: process.env.GMAIL_CLIENT_SECRET,
      redirectUri: process.env.GMAIL_REDIRECT_URI || 'http://localhost:3000/oauth/callback',
      accessToken: process.env.GMAIL_ACCESS_TOKEN,
      refreshToken: process.env.GMAIL_REFRESH_TOKEN,
      expiryDate: parseInt(process.env.GMAIL_TOKEN_EXPIRY || '0'),
    };
  }

  /**
   * Save refreshed OAuth tokens to Firestore
   * @param {string} userId - User ID
   * @param {Object} tokens - New token data
   */
  async saveTokens(userId, tokens) {
    if (!userId) return;

    try {
      await db.collection('gmailCredentials').doc(userId).set({
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || undefined,
        expiryDate: tokens.expiry_date,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });

      console.log('✅ Gmail tokens refreshed and saved');
    } catch (error) {
      console.error('❌ Failed to save tokens:', error);
    }
  }

  /**
   * Send email via Gmail API using specified alias
   * @param {Object} options - Email options
   * @param {string} options.from - Sender email (alias)
   * @param {string} options.fromName - Sender display name
   * @param {string|Array} options.to - Recipient email(s)
   * @param {string} options.subject - Email subject
   * @param {string} options.html - HTML body
   * @param {string} options.text - Plain text body
   * @param {Array} options.attachments - Attachments
   * @param {string} options.replyTo - Reply-to address
   * @param {Object} options.headers - Custom headers
   * @returns {Object} Result with messageId and threadId
   */
  async sendEmail(options) {
    if (!this.initialized) {
      throw new Error('Gmail service not initialized. Call initialize() first.');
    }

    try {
      // Build email message
      const message = await this.buildMessage(options);

      // Send via Gmail API
      const result = await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: message,
        },
      });

      console.log(`✅ Email sent via Gmail: ${result.data.id}`);

      // Log to Firestore for tracking
      await this.logEmail({
        messageId: result.data.id,
        threadId: result.data.threadId,
        from: options.from,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
        provider: 'gmail',
        status: 'sent',
      });

      return {
        success: true,
        messageId: result.data.id,
        threadId: result.data.threadId,
        provider: 'gmail',
      };
    } catch (error) {
      console.error('❌ Gmail send failed:', error);

      // Log failure
      await this.logEmail({
        from: options.from,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
        provider: 'gmail',
        status: 'failed',
        error: error.message,
      });

      throw error;
    }
  }

  /**
   * Build RFC 2822 email message for Gmail API
   * @param {Object} options - Email options
   * @returns {string} Base64-encoded message
   */
  async buildMessage(options) {
    const { from, fromName, to, subject, html, text, replyTo, headers = {}, attachments = [] } = options;

    // Build email lines
    const lines = [];

    // Headers
    lines.push(`From: ${fromName ? `"${fromName}" <${from}>` : from}`);
    lines.push(`To: ${Array.isArray(to) ? to.join(', ') : to}`);
    lines.push(`Subject: ${subject}`);

    if (replyTo) {
      lines.push(`Reply-To: ${replyTo}`);
    }

    // Custom headers
    Object.entries(headers).forEach(([key, value]) => {
      lines.push(`${key}: ${value}`);
    });

    lines.push('MIME-Version: 1.0');

    // Simple message (no attachments)
    if (attachments.length === 0) {
      if (html && text) {
        // Multipart alternative
        const boundary = `boundary_${Date.now()}`;
        lines.push(`Content-Type: multipart/alternative; boundary="${boundary}"`);
        lines.push('');
        lines.push(`--${boundary}`);
        lines.push('Content-Type: text/plain; charset=UTF-8');
        lines.push('');
        lines.push(text);
        lines.push('');
        lines.push(`--${boundary}`);
        lines.push('Content-Type: text/html; charset=UTF-8');
        lines.push('');
        lines.push(html);
        lines.push('');
        lines.push(`--${boundary}--`);
      } else if (html) {
        lines.push('Content-Type: text/html; charset=UTF-8');
        lines.push('');
        lines.push(html);
      } else {
        lines.push('Content-Type: text/plain; charset=UTF-8');
        lines.push('');
        lines.push(text);
      }
    } else {
      // With attachments (multipart/mixed)
      const boundary = `boundary_${Date.now()}`;
      lines.push(`Content-Type: multipart/mixed; boundary="${boundary}"`);
      lines.push('');

      // Email body part
      lines.push(`--${boundary}`);
      if (html) {
        lines.push('Content-Type: text/html; charset=UTF-8');
        lines.push('');
        lines.push(html);
      } else {
        lines.push('Content-Type: text/plain; charset=UTF-8');
        lines.push('');
        lines.push(text);
      }

      // Attachment parts
      attachments.forEach((attachment) => {
        lines.push('');
        lines.push(`--${boundary}`);
        lines.push(`Content-Type: ${attachment.contentType || 'application/octet-stream'}`);
        lines.push(`Content-Disposition: attachment; filename="${attachment.filename}"`);
        lines.push('Content-Transfer-Encoding: base64');
        lines.push('');
        lines.push(attachment.content); // Should be base64-encoded
      });

      lines.push('');
      lines.push(`--${boundary}--`);
    }

    // Convert to base64url
    const message = lines.join('\r\n');
    return Buffer.from(message).toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  /**
   * Send bulk emails with rate limiting
   * @param {Array} emails - Array of email options objects
   * @param {Object} rateLimits - Rate limiting config
   * @returns {Object} Results summary
   */
  async sendBulkEmails(emails, rateLimits = { perSecond: 5, perMinute: 100 }) {
    const results = {
      success: [],
      failed: [],
      total: emails.length,
    };

    // Gmail rate limits: 100 per second for G Suite, lower for free accounts
    const delay = Math.ceil(1000 / rateLimits.perSecond);

    for (let i = 0; i < emails.length; i++) {
      try {
        const result = await this.sendEmail(emails[i]);
        results.success.push(result);
      } catch (error) {
        results.failed.push({
          email: emails[i].to,
          error: error.message,
        });
      }

      // Rate limiting delay
      if (i < emails.length - 1) {
        await this.sleep(delay);
      }

      // Log progress
      if ((i + 1) % 10 === 0) {
        console.log(`📧 Bulk send progress: ${i + 1}/${emails.length}`);
      }
    }

    console.log(`✅ Bulk send complete: ${results.success.length} sent, ${results.failed.length} failed`);
    return results;
  }

  /**
   * Fetch incoming emails for alias processing
   * @param {string} query - Gmail search query
   * @param {number} maxResults - Max emails to fetch
   * @returns {Array} Parsed email objects
   */
  async fetchIncomingEmails(query = 'is:unread', maxResults = 50) {
    if (!this.initialized) {
      throw new Error('Gmail service not initialized');
    }

    try {
      // List messages matching query
      const response = await this.gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults,
      });

      const messages = response.data.messages || [];
      console.log(`📬 Found ${messages.length} messages`);

      // Fetch full message details
      const emails = [];
      for (const msg of messages) {
        const email = await this.parseMessage(msg.id);
        if (email) {
          emails.push(email);
        }
      }

      return emails;
    } catch (error) {
      console.error('❌ Failed to fetch emails:', error);
      throw error;
    }
  }

  /**
   * Parse a Gmail message into structured data
   * @param {string} messageId - Gmail message ID
   * @returns {Object} Parsed email object
   */
  async parseMessage(messageId) {
    try {
      const response = await this.gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full',
      });

      const message = response.data;
      const headers = message.payload.headers;

      // Extract headers
      const getHeader = (name) => {
        const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
        return header ? header.value : null;
      };

      // Get body
      let body = '';
      if (message.payload.body.data) {
        body = Buffer.from(message.payload.body.data, 'base64').toString('utf-8');
      } else if (message.payload.parts) {
        const textPart = message.payload.parts.find(p => p.mimeType === 'text/plain' || p.mimeType === 'text/html');
        if (textPart && textPart.body.data) {
          body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
        }
      }

      return {
        id: message.id,
        threadId: message.threadId,
        from: getHeader('From'),
        to: getHeader('To'),
        subject: getHeader('Subject'),
        date: getHeader('Date'),
        body,
        labels: message.labelIds || [],
        snippet: message.snippet,
      };
    } catch (error) {
      console.error(`❌ Failed to parse message ${messageId}:`, error);
      return null;
    }
  }

  /**
   * Mark message as read
   * @param {string} messageId - Gmail message ID
   */
  async markAsRead(messageId) {
    try {
      await this.gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        requestBody: {
          removeLabelIds: ['UNREAD'],
        },
      });
    } catch (error) {
      console.error(`❌ Failed to mark message ${messageId} as read:`, error);
    }
  }

  /**
   * Add label to message
   * @param {string} messageId - Gmail message ID
   * @param {string} labelName - Label name
   */
  async addLabel(messageId, labelName) {
    try {
      // Get or create label
      const labelId = await this.getOrCreateLabel(labelName);

      await this.gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        requestBody: {
          addLabelIds: [labelId],
        },
      });
    } catch (error) {
      console.error(`❌ Failed to add label to message ${messageId}:`, error);
    }
  }

  /**
   * Get or create Gmail label
   * @param {string} name - Label name
   * @returns {string} Label ID
   */
  async getOrCreateLabel(name) {
    try {
      // List existing labels
      const response = await this.gmail.users.labels.list({ userId: 'me' });
      const existing = response.data.labels.find(l => l.name === name);

      if (existing) {
        return existing.id;
      }

      // Create new label
      const createResponse = await this.gmail.users.labels.create({
        userId: 'me',
        requestBody: {
          name,
          labelListVisibility: 'labelShow',
          messageListVisibility: 'show',
        },
      });

      return createResponse.data.id;
    } catch (error) {
      console.error(`❌ Failed to get/create label "${name}":`, error);
      throw error;
    }
  }

  /**
   * Log email to Firestore for tracking
   * @param {Object} data - Email log data
   */
  async logEmail(data) {
    try {
      await db.collection('emailLogs').add({
        ...data,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch (error) {
      console.error('❌ Failed to log email:', error);
    }
  }

  /**
   * Get alias configuration from Firestore
   * @param {string} alias - Email alias
   * @returns {Object} Alias configuration
   */
  async getAliasConfig(alias) {
    try {
      const doc = await db.collection('emailAliases').doc(alias).get();
      if (doc.exists) {
        return doc.data();
      }

      // Return defaults if not configured
      return {
        enabled: true,
        handler: null,
        rateLimitPerHour: 100,
        rateLimitPerDay: 1000,
      };
    } catch (error) {
      console.error(`❌ Failed to get alias config for ${alias}:`, error);
      return null;
    }
  }

  /**
   * Get alias usage stats for rate limiting
   * @param {string} alias - Email alias
   * @param {string} period - Time period ('hour' or 'day')
   * @returns {number} Email count
   */
  async getAliasUsage(alias, period = 'hour') {
    try {
      const now = new Date();
      const cutoff = new Date();

      if (period === 'hour') {
        cutoff.setHours(cutoff.getHours() - 1);
      } else if (period === 'day') {
        cutoff.setDate(cutoff.getDate() - 1);
      }

      const snapshot = await db.collection('emailLogs')
        .where('from', '==', alias)
        .where('timestamp', '>=', cutoff)
        .get();

      return snapshot.size;
    } catch (error) {
      console.error(`❌ Failed to get usage for ${alias}:`, error);
      return 0;
    }
  }

  /**
   * Check if alias can send (rate limiting)
   * @param {string} alias - Email alias
   * @returns {boolean} True if can send
   */
  async canSend(alias) {
    try {
      const config = await this.getAliasConfig(alias);
      const hourlyUsage = await this.getAliasUsage(alias, 'hour');
      const dailyUsage = await this.getAliasUsage(alias, 'day');

      if (hourlyUsage >= config.rateLimitPerHour) {
        console.warn(`⚠️ Alias ${alias} hit hourly limit: ${hourlyUsage}/${config.rateLimitPerHour}`);
        return false;
      }

      if (dailyUsage >= config.rateLimitPerDay) {
        console.warn(`⚠️ Alias ${alias} hit daily limit: ${dailyUsage}/${config.rateLimitPerDay}`);
        return false;
      }

      return true;
    } catch (error) {
      console.error(`❌ Failed to check rate limit for ${alias}:`, error);
      return false;
    }
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
const gmailService = new GmailService();

module.exports = {
  GmailService,
  gmailService,
  SCOPES,
};
