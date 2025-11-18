/**
 * emailService.js
 * 
 * Purpose: Complete SendGrid email integration for SpeedyCRM
 * 
 * Features:
 * - Send individual emails
 * - Send bulk emails (campaigns)
 * - Email templates with variable substitution
 * - Email tracking (opens, clicks)
 * - Attachment support
 * - Priority levels
 * - Auto-retry on failure
 * - Firestore logging
 * 
 * Dependencies:
 * - @sendgrid/mail
 * - Firebase Firestore
 * 
 * Author: Claude (SpeedyCRM Team)
 * Last Updated: October 19, 2025
 */

import sgMail from '@sendgrid/mail';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';

// Initialize SendGrid
const SENDGRID_API_KEY = import.meta.env.VITE_SENDGRID_API_KEY;

if (!SENDGRID_API_KEY) {
  console.error('⚠️ SENDGRID_API_KEY not found in environment variables');
} else {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

// Configuration
const FROM_EMAIL = import.meta.env.VITE_SENDGRID_FROM_EMAIL || 'noreply@speedycreditrepair.com';
const SUPPORT_EMAIL = 'support@speedycreditrepair.com';
const URGENT_EMAIL = 'urgent@speedycreditrepair.com';
const BILLING_EMAIL = 'billing@speedycreditrepair.com';
const DISPUTES_EMAIL = 'disputes@speedycreditrepair.com';

/**
 * Send a single email via SendGrid
 * 
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML email body
 * @param {string} [options.text] - Plain text email body (optional, auto-generated if not provided)
 * @param {string} [options.from] - Sender email (defaults to FROM_EMAIL)
 * @param {string} [options.replyTo] - Reply-to email
 * @param {string} [options.priority] - Priority: 'high', 'normal', 'low' (default: 'normal')
 * @param {Array} [options.attachments] - Array of attachment objects
 * @param {Object} [options.trackingSettings] - SendGrid tracking settings
 * @param {Object} [options.metadata] - Custom metadata for logging
 * @returns {Promise<Object>} - SendGrid response with messageId
 */
export const sendEmail = async ({
  to,
  subject,
  html,
  text = null,
  from = FROM_EMAIL,
  replyTo = SUPPORT_EMAIL,
  priority = 'normal',
  attachments = [],
  trackingSettings = {},
  metadata = {}
}) => {
  try {
    // Validate inputs
    if (!to || !subject || !html) {
      throw new Error('Missing required email fields: to, subject, html');
    }

    // Build email message
    const msg = {
      to,
      from: {
        email: from,
        name: 'Speedy Credit Repair'
      },
      replyTo: {
        email: replyTo,
        name: 'Speedy Credit Repair Support'
      },
      subject,
      html,
      text: text || stripHtml(html), // Auto-generate plain text if not provided
      
      // Priority settings
      headers: {
        'X-Priority': priority === 'high' ? '1' : priority === 'low' ? '5' : '3',
        'X-MSMail-Priority': priority === 'high' ? 'High' : priority === 'low' ? 'Low' : 'Normal'
      },
      
      // Attachments
      attachments: attachments.map(att => ({
        content: att.content, // Base64 encoded
        filename: att.filename,
        type: att.type || 'application/octet-stream',
        disposition: 'attachment'
      })),
      
      // Tracking
      trackingSettings: {
        clickTracking: {
          enable: trackingSettings.clickTracking !== false
        },
        openTracking: {
          enable: trackingSettings.openTracking !== false
        },
        subscriptionTracking: {
          enable: false // Disable unsubscribe link by default
        }
      },
      
      // Custom args for webhooks
      customArgs: {
        ...metadata,
        sentAt: new Date().toISOString()
      }
    };

    // Send via SendGrid
    const response = await sgMail.send(msg);
    
    // Log to Firestore
    const logId = await logEmailToFirestore({
      to,
      from,
      subject,
      status: 'sent',
      provider: 'sendgrid',
      messageId: response[0].headers['x-message-id'],
      metadata
    });

    console.log('✅ Email sent successfully:', {
      to,
      subject,
      messageId: response[0].headers['x-message-id']
    });

    return {
      success: true,
      messageId: response[0].headers['x-message-id'],
      logId
    };

  } catch (error) {
    console.error('❌ Email send failed:', error);

    // Log failure to Firestore
    await logEmailToFirestore({
      to,
      from,
      subject,
      status: 'failed',
      provider: 'sendgrid',
      error: error.message,
      metadata
    });

    // Retry logic (optional)
    if (error.code === 429 || error.code >= 500) {
      console.log('⏳ Retrying email send in 5 seconds...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      return sendEmail({ to, subject, html, text, from, replyTo, priority, attachments, trackingSettings, metadata });
    }

    throw error;
  }
};

/**
 * Send bulk emails (campaign)
 * 
 * @param {Array} recipients - Array of recipient objects: [{ email, name, personalizations }]
 * @param {string} subject - Email subject (can include {{variables}})
 * @param {string} htmlTemplate - HTML email template (can include {{variables}})
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - Results with success/failure counts
 */
export const sendBulkEmail = async (recipients, subject, htmlTemplate, options = {}) => {
  try {
    const results = {
      total: recipients.length,
      sent: 0,
      failed: 0,
      errors: []
    };

    // Send in batches of 1000 (SendGrid limit)
    const batchSize = 1000;
    const batches = [];
    
    for (let i = 0; i < recipients.length; i += batchSize) {
      batches.push(recipients.slice(i, i + batchSize));
    }

    for (const batch of batches) {
      const messages = batch.map(recipient => {
        // Replace variables in subject and body
        let personalizedSubject = subject;
        let personalizedHtml = htmlTemplate;
        
        if (recipient.personalizations) {
          Object.keys(recipient.personalizations).forEach(key => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            personalizedSubject = personalizedSubject.replace(regex, recipient.personalizations[key]);
            personalizedHtml = personalizedHtml.replace(regex, recipient.personalizations[key]);
          });
        }

        return {
          to: recipient.email,
          from: {
            email: options.from || FROM_EMAIL,
            name: 'Speedy Credit Repair'
          },
          subject: personalizedSubject,
          html: personalizedHtml
        };
      });

      try {
        await sgMail.send(messages);
        results.sent += batch.length;
      } catch (error) {
        results.failed += batch.length;
        results.errors.push({
          batch: batches.indexOf(batch),
          error: error.message
        });
      }
    }

    // Log campaign to Firestore
    await addDoc(collection(db, 'emailCampaigns'), {
      subject,
      recipientCount: recipients.length,
      sentCount: results.sent,
      failedCount: results.failed,
      sentAt: serverTimestamp(),
      ...options.metadata
    });

    console.log('📧 Bulk email campaign completed:', results);

    return results;

  } catch (error) {
    console.error('❌ Bulk email campaign failed:', error);
    throw error;
  }
};

/**
 * Send email using predefined template
 * 
 * @param {string} templateId - Template identifier
 * @param {string} to - Recipient email
 * @param {Object} variables - Template variables
 * @returns {Promise<Object>} - Send result
 */
export const sendTemplateEmail = async (templateId, to, variables = {}) => {
  const templates = {
    // Welcome email
    'welcome': {
      subject: 'Welcome to Speedy Credit Repair! 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #009E60;">Welcome, {{firstName}}! 👋</h1>
          <p>Thank you for choosing Speedy Credit Repair. We're excited to help you achieve your credit goals!</p>
          <p>Your account has been created and you can now access your client portal:</p>
          <a href="{{portalUrl}}" style="background: #009E60; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Access Your Portal
          </a>
          <p style="margin-top: 24px;">If you have any questions, don't hesitate to reach out!</p>
          <p>Best regards,<br>The Speedy Credit Repair Team</p>
        </div>
      `
    },
    
    // Dispute update
    'dispute-update': {
      subject: 'Update on Your Credit Dispute #{{disputeId}}',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Dispute Update</h2>
          <p>Hi {{firstName}},</p>
          <p>We have an update regarding your dispute:</p>
          <div style="background: #f5f5f5; padding: 16px; border-radius: 4px; margin: 16px 0;">
            <strong>Dispute #{{disputeId}}</strong><br>
            <strong>Bureau:</strong> {{bureau}}<br>
            <strong>Status:</strong> {{status}}<br>
            <strong>Details:</strong> {{details}}
          </div>
          <a href="{{portalUrl}}" style="background: #1D4ED8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            View Full Details
          </a>
          <p style="margin-top: 24px;">Best regards,<br>Speedy Credit Repair Team</p>
        </div>
      `
    },
    
    // Payment receipt
    'payment-receipt': {
      subject: 'Payment Receipt - Speedy Credit Repair',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Payment Received ✓</h2>
          <p>Hi {{firstName}},</p>
          <p>Thank you for your payment!</p>
          <div style="background: #f5f5f5; padding: 16px; border-radius: 4px; margin: 16px 0;">
            <strong>Receipt #{{receiptId}}</strong><br>
            <strong>Amount:</strong> ${{amount}}<br>
            <strong>Date:</strong> {{date}}<br>
            <strong>Method:</strong> {{method}}
          </div>
          <p>Your payment has been successfully processed.</p>
          <a href="{{invoiceUrl}}" style="color: #1D4ED8; text-decoration: underline;">Download Invoice</a>
          <p style="margin-top: 24px;">Best regards,<br>Speedy Credit Repair Team</p>
        </div>
      `
    },
    
    // Urgent alert
    'urgent-alert': {
      subject: '🚨 URGENT: {{alertTitle}}',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 2px solid #ff0000; padding: 16px;">
          <h2 style="color: #ff0000;">⚠️ Urgent Alert</h2>
          <p>Hi {{firstName}},</p>
          <p><strong>{{alertTitle}}</strong></p>
          <p>{{alertMessage}}</p>
          <a href="{{actionUrl}}" style="background: #ff0000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Take Action Now
          </a>
          <p style="margin-top: 24px;">This requires immediate attention. Please contact us if you have questions.</p>
          <p>Best regards,<br>Speedy Credit Repair Team</p>
        </div>
      `
    }
  };

  const template = templates[templateId];
  
  if (!template) {
    throw new Error(`Template not found: ${templateId}`);
  }

  // Replace variables
  let subject = template.subject;
  let html = template.html;
  
  Object.keys(variables).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    subject = subject.replace(regex, variables[key]);
    html = html.replace(regex, variables[key]);
  });

  return sendEmail({
    to,
    subject,
    html,
    metadata: { templateId }
  });
};

/**
 * Log email to Firestore for tracking
 */
const logEmailToFirestore = async (emailData) => {
  try {
    const docRef = await addDoc(collection(db, 'communications'), {
      type: 'email',
      direction: 'outbound',
      ...emailData,
      timestamp: serverTimestamp()
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Failed to log email:', error);
    return null;
  }
};

/**
 * Strip HTML tags for plain text version
 */
const stripHtml = (html) => {
  return html
    .replace(/<style[^>]*>.*<\/style>/gm, '')
    .replace(/<script[^>]*>.*<\/script>/gm, '')
    .replace(/<[^>]+>/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Get email delivery status from SendGrid webhook
 * (This would be called by your webhook endpoint)
 */
export const updateEmailStatus = async (messageId, status, eventData = {}) => {
  try {
    // Find email log by messageId
    const logsRef = collection(db, 'communications');
    const q = query(logsRef, where('messageId', '==', messageId));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const docRef = doc(db, 'communications', snapshot.docs[0].id);
      await updateDoc(docRef, {
        status,
        lastEvent: eventData.event,
        lastEventTimestamp: serverTimestamp(),
        eventData
      });
      
      console.log(`✅ Email status updated: ${messageId} → ${status}`);
    }
  } catch (error) {
    console.error('Failed to update email status:', error);
  }
};

/**
 * Send to specific department email
 */
export const sendToDepartment = async (department, subject, html, options = {}) => {
  const departmentEmails = {
    support: SUPPORT_EMAIL,
    urgent: URGENT_EMAIL,
    billing: BILLING_EMAIL,
    disputes: DISPUTES_EMAIL
  };

  const to = departmentEmails[department] || SUPPORT_EMAIL;
  
  return sendEmail({
    to,
    subject,
    html,
    ...options,
    metadata: {
      ...options.metadata,
      department
    }
  });
};

export default {
  sendEmail,
  sendBulkEmail,
  sendTemplateEmail,
  updateEmailStatus,
  sendToDepartment,
  
  // Email addresses for reference
  FROM_EMAIL,
  SUPPORT_EMAIL,
  URGENT_EMAIL,
  BILLING_EMAIL,
  DISPUTES_EMAIL
};