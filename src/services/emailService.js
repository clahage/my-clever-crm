// ============================================================================
// EMAIL SERVICE - ENTERPRISE GOOGLE WORKSPACE INTEGRATION
// ============================================================================
// VERSION: 1.0.0
// PURPOSE: Intelligent email service with automatic alias selection
// PROVIDER: Google Workspace (smtp.gmail.com)
// ALIASES: 20+ specialized email addresses for different purposes
// FEATURES: Smart routing, templates, tracking, retry logic
// ============================================================================

import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db, functions } from '@/lib/firebase';
import { auth } from '../lib/firebase';
import { httpsCallable } from 'firebase/functions';

// ============================================================================
// EMAIL ALIAS CONFIGURATION
// ============================================================================

export const EMAIL_ALIASES = {
  // Primary
  CHRIS: {
    email: 'Contact@speedycreditrepair.com',
    name: 'Chris Lahage - Speedy Credit Repair',
    purpose: 'Personal communications, high-value clients',
    replyTo: 'Contact@speedycreditrepair.com',
  },
  LAURIE: {
    email: 'laurie@speedycreditrepair.com',
    name: 'Laurie - Speedy Credit Repair',
    purpose: 'Operations, client management',
    replyTo: 'Contact@speedycreditrepair.com',
  },

  // Automated Systems
  NOREPLY: {
    email: 'noreply@speedycreditrepair.com',
    name: 'Speedy Credit Repair',
    purpose: 'Automated notifications, no reply needed',
    replyTo: null,
  },
  URGENT: {
    email: 'Contact@speedycreditrepair.com',
    name: 'Speedy Credit Repair - URGENT',
    purpose: 'Time-sensitive alerts, critical notifications',
    replyTo: 'Contact@speedycreditrepair.com',
  },

  // Customer Service
  SUPPORT: {
    email: 'Contact@speedycreditrepair.com',
    name: 'Speedy Credit Repair Support',
    purpose: 'Customer support, help requests',
    replyTo: 'Contact@speedycreditrepair.com',
  },
  INFO: {
    email: 'Contact@speedycreditrepair.com',
    name: 'Speedy Credit Repair',
    purpose: 'General information requests',
    replyTo: 'Contact@speedycreditrepair.com',
  },

  // Payment & Billing
  PAYMENT_SUCCESS: {
    email: 'payment-success@speedycreditrepair.com',
    name: 'Speedy Credit Repair - Payment Confirmation',
    purpose: 'Payment confirmations, receipts',
    replyTo: 'Contact@speedycreditrepair.com',
  },
  PAYMENT_FAILED: {
    email: 'payment-failed@speedycreditrepair.com',
    name: 'Speedy Credit Repair - Payment Alert',
    purpose: 'Failed payment notifications',
    replyTo: 'Contact@speedycreditrepair.com',
  },
  PAYMENT_REMINDER: {
    email: 'payment-reminder@speedycreditrepair.com',
    name: 'Speedy Credit Repair - Payment Reminder',
    purpose: 'Upcoming payment reminders',
    replyTo: 'Contact@speedycreditrepair.com',
  },

  // Onboarding & Welcome
  WELCOME: {
    email: 'welcome@speedycreditrepair.com',
    name: 'Speedy Credit Repair - Welcome!',
    purpose: 'Welcome emails for new clients',
    replyTo: 'Contact@speedycreditrepair.com',
  },
  ONBOARDING: {
    email: 'onboarding@speedycreditrepair.com',
    name: 'Speedy Credit Repair - Getting Started',
    purpose: 'Onboarding sequences, setup instructions',
    replyTo: 'Contact@speedycreditrepair.com',
  },

  // Credit & Disputes
  DISPUTE_UPDATE: {
    email: 'dispute-update@speedycreditrepair.com',
    name: 'Speedy Credit Repair - Dispute Update',
    purpose: 'Dispute status updates, results',
    replyTo: 'Contact@speedycreditrepair.com',
  },
  CREDIT_REPORT: {
    email: 'credit-report@speedycreditrepair.com',
    name: 'Speedy Credit Repair - Credit Report',
    purpose: 'Credit report delivery, analysis',
    replyTo: 'Contact@speedycreditrepair.com',
  },
  SCORE_UPDATE: {
    email: 'score-update@speedycreditrepair.com',
    name: 'Speedy Credit Repair - Score Update',
    purpose: 'Credit score change notifications',
    replyTo: 'Contact@speedycreditrepair.com',
  },

  // Appointments & Tasks
  APPOINTMENT: {
    email: 'appointment@speedycreditrepair.com',
    name: 'Speedy Credit Repair - Appointment',
    purpose: 'Appointment confirmations, reminders',
    replyTo: 'Contact@speedycreditrepair.com',
  },
  REMINDER: {
    email: 'reminder@speedycreditrepair.com',
    name: 'Speedy Credit Repair - Reminder',
    purpose: 'General reminders, follow-ups',
    replyTo: 'Contact@speedycreditrepair.com',
  },
  TASK_ASSIGNED: {
    email: 'task-assigned@speedycreditrepair.com',
    name: 'Speedy Credit Repair - New Task',
    purpose: 'Task assignments, workflow notifications',
    replyTo: 'Contact@speedycreditrepair.com',
  },

  // Documents & Signatures
  DOCUMENT_READY: {
    email: 'document-ready@speedycreditrepair.com',
    name: 'Speedy Credit Repair - Document Ready',
    purpose: 'Document delivery, download links',
    replyTo: 'Contact@speedycreditrepair.com',
  },
  SIGNATURE_REQUIRED: {
    email: 'signature-required@speedycreditrepair.com',
    name: 'Speedy Credit Repair - Signature Needed',
    purpose: 'E-signature requests, contract signing',
    replyTo: 'Contact@speedycreditrepair.com',
  },

  // Compliance & Admin
  COMPLIANCE_ALERT: {
    email: 'compliance-alert@speedycreditrepair.com',
    name: 'Speedy Credit Repair - Compliance',
    purpose: 'Compliance notifications, regulatory alerts',
    replyTo: 'Contact@speedycreditrepair.com',
  },
  ADMIN: {
    email: 'Contact@speedycreditrepair.com',
    name: 'Speedy Credit Repair Administration',
    purpose: 'Administrative communications',
    replyTo: 'Contact@speedycreditrepair.com',
  },

  // Marketing & Engagement
  REVIEW_REQUEST: {
    email: 'review-request@speedycreditrepair.com',
    name: 'Speedy Credit Repair - Review Request',
    purpose: 'Review requests, testimonials',
    replyTo: 'Contact@speedycreditrepair.com',
  },
  NEWSLETTER: {
    email: 'newsletter@speedycreditrepair.com',
    name: 'Speedy Credit Repair Newsletter',
    purpose: 'Monthly newsletters, updates',
    replyTo: 'Contact@speedycreditrepair.com',
  },
  PROMO: {
    email: 'promo@speedycreditrepair.com',
    name: 'Speedy Credit Repair - Special Offer',
    purpose: 'Promotional emails, special offers',
    replyTo: 'Contact@speedycreditrepair.com',
  },
  REFERRAL: {
    email: 'referral@speedycreditrepair.com',
    name: 'Speedy Credit Repair - Referral Program',
    purpose: 'Referral program communications',
    replyTo: 'Contact@speedycreditrepair.com',
  },
};

// ============================================================================
// EMAIL TYPES (Auto-selects correct alias)
// ============================================================================

export const EMAIL_TYPES = {
  // Client Communications
  WELCOME_NEW_CLIENT: { alias: 'WELCOME', category: 'onboarding' },
  ONBOARDING_STEP: { alias: 'ONBOARDING', category: 'onboarding' },
  CLIENT_UPDATE: { alias: 'SUPPORT', category: 'support' },
  PERSONAL_MESSAGE: { alias: 'CHRIS', category: 'personal' },

  // Payments
  PAYMENT_CONFIRMATION: { alias: 'PAYMENT_SUCCESS', category: 'payment' },
  PAYMENT_FAILURE: { alias: 'PAYMENT_FAILED', category: 'payment' },
  PAYMENT_DUE_REMINDER: { alias: 'PAYMENT_REMINDER', category: 'payment' },
  INVOICE_SENT: { alias: 'PAYMENT_REMINDER', category: 'payment' },

  // Credit & Disputes
  CREDIT_REPORT_READY: { alias: 'CREDIT_REPORT', category: 'credit' },
  CREDIT_ANALYSIS_READY: { alias: 'CREDIT_REPORT', category: 'credit' },
  DISPUTE_FILED: { alias: 'DISPUTE_UPDATE', category: 'dispute' },
  DISPUTE_RESULT: { alias: 'DISPUTE_UPDATE', category: 'dispute' },
  SCORE_INCREASED: { alias: 'SCORE_UPDATE', category: 'success' },
  SCORE_CHANGED: { alias: 'SCORE_UPDATE', category: 'credit' },

  // Appointments
  APPOINTMENT_CONFIRMATION: { alias: 'APPOINTMENT', category: 'appointment' },
  APPOINTMENT_REMINDER: { alias: 'APPOINTMENT', category: 'appointment' },
  CONSULTATION_SCHEDULED: { alias: 'APPOINTMENT', category: 'appointment' },

  // Documents
  CONTRACT_READY: { alias: 'DOCUMENT_READY', category: 'document' },
  REPORT_READY: { alias: 'DOCUMENT_READY', category: 'document' },
  SIGNATURE_REQUEST: { alias: 'SIGNATURE_REQUIRED', category: 'document' },
  DOCUMENT_SIGNED: { alias: 'DOCUMENT_READY', category: 'document' },

  // Tasks & Reminders
  TASK_ASSIGNED: { alias: 'TASK_ASSIGNED', category: 'task' },
  REMINDER_GENERAL: { alias: 'REMINDER', category: 'reminder' },
  FOLLOW_UP: { alias: 'SUPPORT', category: 'support' },

  // Marketing
  NEWSLETTER: { alias: 'NEWSLETTER', category: 'marketing' },
  PROMOTIONAL: { alias: 'PROMO', category: 'marketing' },
  REVIEW_REQUEST: { alias: 'REVIEW_REQUEST', category: 'marketing' },
  REFERRAL_INVITATION: { alias: 'REFERRAL', category: 'marketing' },

  // Urgent
  URGENT_ALERT: { alias: 'URGENT', category: 'urgent' },
  COMPLIANCE_ISSUE: { alias: 'COMPLIANCE_ALERT', category: 'compliance' },

  // System
  AUTOMATED_NOTIFICATION: { alias: 'NOREPLY', category: 'system' },
  SYSTEM_ALERT: { alias: 'NOREPLY', category: 'system' },
};

// ============================================================================
// EMAIL SERVICE CLASS
// ============================================================================

class EmailService {
  constructor() {
    this.config = {
      host: import.meta.env.VITE_SMTP_HOST,
      port: parseInt(import.meta.env.VITE_SMTP_PORT),
      secure: import.meta.env.VITE_SMTP_SECURE === 'true',
      user: import.meta.env.VITE_GMAIL_USER,
      password: import.meta.env.VITE_GMAIL_APP_PASSWORD,
    };
  }

  /**
   * Send email using appropriate alias
   */
  async send({
    to,
    type, // EMAIL_TYPES key
    subject,
    html,
    text,
    attachments = [],
    cc = [],
    bcc = [],
    customAlias = null,
    trackOpens = true,
    trackClicks = true,
    metadata = {},
  }) {
    try {
      // Get alias configuration
      const emailType = EMAIL_TYPES[type];
      const aliasKey = customAlias || emailType.alias;
      const aliasConfig = EMAIL_ALIASES[aliasKey];

      if (!aliasConfig) {
        throw new Error(`Invalid email alias: ${aliasKey}`);
      }

      // Prepare email data
      const emailData = {
        from: {
          email: aliasConfig.email,
          name: aliasConfig.name,
        },
        to: Array.isArray(to) ? to : [to],
        subject,
        html: html || text,
        text: text || this.stripHtml(html),
        replyTo: aliasConfig.replyTo,
        cc,
        bcc,
        attachments,
        metadata: {
          ...metadata,
          type,
          category: emailType.category,
          alias: aliasKey,
          sentAt: new Date().toISOString(),
        },
      };

      // Add tracking pixels if enabled
      if (trackOpens) {
        emailData.html = this.addOpenTracking(emailData.html, emailData.metadata);
      }

      if (trackClicks) {
        emailData.html = this.addClickTracking(emailData.html, emailData.metadata);
      }

      // Send via Firebase Cloud Function (which uses Nodemailer with Gmail SMTP)
      const result = await this.sendViaCloudFunction(emailData);

      // Log to Firestore
      await this.logEmail({
        ...emailData,
        status: 'sent',
        messageId: result.messageId ?? 'no-message-id',
        sentAt: serverTimestamp(),
      });

      return {
        success: true,
        messageId: result.messageId,
        alias: aliasConfig.email,
      };

    } catch (error) {
      console.error('Email send error:', error);

      // Log error
      await this.logEmail({
        to,
        type,
        subject,
        status: 'failed',
        error: error.message,
        sentAt: serverTimestamp(),
      });

      throw error;
    }
  }

  /**
   * Send via Firebase Cloud Function
   */
  async sendViaCloudFunction(emailData) {
    try {
      const user = auth.currentUser;
      if (!user) {
        // Only throw if we are NOT in a strictly local/offline dev mode
        // But usually, we need a token even locally.
        console.warn("Attempting to send email without auth user...");
      }
      
      let token = '';
      if (user) {
        token = await user.getIdToken();
      }

      // === SMART URL SWITCHING ===
      // If we are on localhost, talk to the Emulator (Port 5001)
      // If we are in production, talk to the Live Cloud
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      
      // PROJECT ID: my-clever-crm
      // REGION: us-central1
      const endpoint = isLocal 
        ? 'http://127.0.0.1:5001/my-clever-crm/us-central1/sendRawEmail'
        : 'https://us-central1-my-clever-crm.cloudfunctions.net/sendRawEmail';

      console.log(`📧 Sending email via: ${endpoint}`);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(emailData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `Server Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Email send error:', error);
      throw error;
    }
  }

  /**
   * Send bulk emails (campaigns)
   */
  async sendBulk({ recipients, type, subject, html, text, batchSize = 50 }) {
    const results = [];

    // Process in batches to avoid rate limits
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);

      const batchPromises = batch.map(recipient =>
        this.send({
          to: recipient.email,
          type,
          subject: this.personalize(subject, recipient),
          html: this.personalize(html, recipient),
          text: text ? this.personalize(text, recipient) : undefined,
          metadata: { recipientId: recipient.id },
        }).catch(error => ({
          success: false,
          email: recipient.email,
          error: error.message,
        }))
      );

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Wait between batches to respect rate limits
      if (i + batchSize < recipients.length) {
        await this.delay(1000);
      }
    }

    return results;
  }

  /**
   * Personalize email content
   */
  personalize(content, data) {
    let personalized = content;

    // Replace placeholders like {{firstName}}, {{lastName}}, etc.
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      personalized = personalized.replace(regex, data[key] || '');
    });

    return personalized;
  }

  /**
   * Add open tracking pixel
   */
  addOpenTracking(html, metadata) {
    const trackingId = this.generateTrackingId();
    const pixel = `<img src="${window.location.origin}/api/email/track/open/${trackingId}" width="1" height="1" style="display:none;" />`;

    // Store tracking ID with metadata
    metadata.trackingId = trackingId;

    return html + pixel;
  }

  /**
   * Add click tracking to links
   */
  addClickTracking(html, metadata) {
    // Replace all <a> tags with tracked versions
    return html.replace(/<a\s+href="([^"]+)"/g, (match, url) => {
      const trackedUrl = `${window.location.origin}/api/email/track/click?url=${encodeURIComponent(url)}&tid=${metadata.trackingId}`;
      return `<a href="${trackedUrl}"`;
    });
  }

  /**
   * Log email to Firestore
   */
  async logEmail(emailData) {
    try {
      await addDoc(collection(db, 'emails'), {
        ...emailData,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Email logging error:', error);
    }
  }

  /**
   * Utility functions
   */
  stripHtml(html) {
    return html?.replace(/<[^>]*>/g, '') || '';
  }

  generateTrackingId() {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Test email configuration
   */
  async testConnection() {
    try {
      await this.send({
        to: this.config.user,
        type: 'AUTOMATED_NOTIFICATION',
        subject: 'Email Service Test',
        html: '<h1>Test Successful!</h1><p>Your email service is configured correctly.</p>',
      });

      return { success: true, message: 'Email sent successfully!' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}

// ============================================================================
// EXPORT SINGLETON
// ============================================================================

export const emailService = new EmailService();
export default emailService;

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/*
// Example 1: Welcome email
await emailService.send({
  to: 'client@example.com',
  type: 'WELCOME_NEW_CLIENT',
  subject: 'Welcome to Speedy Credit Repair!',
  html: '<h1>Welcome {{firstName}}!</h1>...',
  metadata: { clientId: '12345' },
});

// Example 2: Payment confirmation
await emailService.send({
  to: 'client@example.com',
  type: 'PAYMENT_CONFIRMATION',
  subject: 'Payment Received - Thank You!',
  html: paymentConfirmationTemplate,
  attachments: [{ filename: 'receipt.pdf', content: pdfBuffer }],
});

// Example 3: Dispute update
await emailService.send({
  to: 'client@example.com',
  type: 'DISPUTE_RESULT',
  subject: 'Great News! Dispute Successfully Removed',
  html: disputeSuccessTemplate,
});

// Example 4: Urgent alert
await emailService.send({
  to: 'Contact@speedycreditrepair.com',
  type: 'URGENT_ALERT',
  subject: 'URGENT: New Hot Lead - Score 95/100',
  html: hotLeadAlertTemplate,
});

// Example 5: Newsletter to all clients
await emailService.sendBulk({
  recipients: clients,
  type: 'NEWSLETTER',
  subject: 'Monthly Credit Tips - {{month}}',
  html: newsletterTemplate,
  batchSize: 100,
});
*/
