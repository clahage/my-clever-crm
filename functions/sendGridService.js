// sendGridService.js
// SendGrid Integration for Email Sending and Tracking
// Handles email delivery, webhooks, and engagement tracking

const sgMail = require('@sendgrid/mail');
const admin = require('firebase-admin');

/**
 * Initialize SendGrid with API key
 */
function initSendGrid() {
  const apiKey = process.env.SENDGRID_API_KEY;
  
  if (!apiKey) {
    throw new Error('SENDGRID_API_KEY environment variable is required');
  }
  
  sgMail.setApiKey(apiKey);
  return sgMail;
}

/**
 * Send email via SendGrid with tracking
 * @param {object} emailData - Email parameters
 * @returns {object} Send result
 */
async function sendEmail(emailData) {
  const {
    to,
    subject,
    textContent,
    htmlContent,
    from = {
      email: process.env.FROM_EMAIL || 'chris@speedycreditrepair.com',
      name: process.env.FROM_NAME || 'Chris Lahage - Speedy Credit Repair'
    },
    replyTo = process.env.REPLY_TO_EMAIL || 'chris@speedycreditrepair.com',
    trackingId, // Unique ID for this email
    contactId,
    emailType,
    metadata = {}
  } = emailData;
  
  console.log(`📧 Sending ${emailType} email to ${to}`);
  
  try {
    const sg = initSendGrid();
    
    // Prepare email message
    const msg = {
      to: to,
      from: from,
      replyTo: replyTo,
      subject: subject,
      text: textContent,
      html: htmlContent,
      
      // Enable tracking
      trackingSettings: {
        clickTracking: {
          enable: true,
          enableText: true
        },
        openTracking: {
          enable: true,
          substitutionTag: '%open-track%'
        }
      },
      
      // Custom args for webhook identification
      customArgs: {
        trackingId: trackingId,
        contactId: contactId,
        emailType: emailType,
        ...metadata
      }
    };
    
    // Send email
    const response = await sg.send(msg);
    
    console.log('✅ Email sent successfully via SendGrid');
    
    // Log email in Firestore
    await logEmailSent({
      trackingId,
      contactId,
      to,
      subject,
      emailType,
      sentAt: new Date(),
      sendGridMessageId: response[0].headers['x-message-id'],
      status: 'sent'
    });
    
    return {
      success: true,
      messageId: response[0].headers['x-message-id'],
      trackingId: trackingId
    };
    
  } catch (error) {
    console.error('❌ Error sending email:', error);
    
    // Log failed email
    await logEmailSent({
      trackingId,
      contactId,
      to,
      subject,
      emailType,
      sentAt: new Date(),
      status: 'failed',
      error: error.message
    });
    
    throw error;
  }
}

/**
 * Send bulk emails (for batch campaigns)
 * @param {array} emails - Array of email data objects
 * @returns {object} Batch send results
 */
async function sendBulkEmails(emails) {
  console.log(`📧 Sending ${emails.length} bulk emails`);
  
  const sg = initSendGrid();
  const results = {
    total: emails.length,
    sent: 0,
    failed: 0,
    errors: []
  };
  
  // SendGrid allows up to 1000 emails per request
  const batchSize = 1000;
  
  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);
    
    try {
      const messages = batch.map(email => ({
        to: email.to,
        from: email.from || {
          email: process.env.FROM_EMAIL || 'chris@speedycreditrepair.com',
          name: process.env.FROM_NAME || 'Chris Lahage'
        },
        subject: email.subject,
        text: email.textContent,
        html: email.htmlContent,
        trackingSettings: {
          clickTracking: { enable: true },
          openTracking: { enable: true }
        },
        customArgs: {
          trackingId: email.trackingId,
          contactId: email.contactId,
          emailType: email.emailType
        }
      }));
      
      await sg.send(messages);
      results.sent += batch.length;
      
      console.log(`✅ Batch ${Math.floor(i / batchSize) + 1} sent successfully`);
      
    } catch (error) {
      console.error(`❌ Error sending batch ${Math.floor(i / batchSize) + 1}:`, error);
      results.failed += batch.length;
      results.errors.push({
        batch: Math.floor(i / batchSize) + 1,
        error: error.message
      });
    }
  }
  
  console.log('✅ Bulk send complete:', results);
  return results;
}

/**
 * Process SendGrid webhook events
 * Handles: delivered, opened, clicked, bounced, unsubscribed, etc.
 */
async function processWebhookEvent(event) {
  const {
    event: eventType,
    email,
    timestamp,
    sg_message_id: messageId,
    trackingId,
    contactId,
    emailType,
    url // For click events
  } = event;
  
  console.log(`📨 Processing webhook: ${eventType} for ${email}`);
  
  try {
    const db = admin.firestore();
    
    // Update email log
    const emailLogRef = db.collection('emailLogs').doc(trackingId);
    const emailLog = await emailLogRef.get();
    
    if (!emailLog.exists) {
      console.log('⚠️ Email log not found for trackingId:', trackingId);
      return;
    }
    
    // Update with event data
    const updateData = {
      [`events.${eventType}`]: {
        timestamp: new Date(timestamp * 1000),
        processed: true
      },
      lastEventType: eventType,
      lastEventTime: new Date(timestamp * 1000),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    // Special handling for specific events
    switch (eventType) {
      case 'open':
        updateData.opened = true;
        updateData.openedAt = new Date(timestamp * 1000);
        break;
        
      case 'click':
        updateData.clicked = true;
        updateData.clickedAt = new Date(timestamp * 1000);
        updateData.clickedUrl = url;
        break;
        
      case 'bounce':
      case 'dropped':
        updateData.bounced = true;
        updateData.bouncedAt = new Date(timestamp * 1000);
        break;
        
      case 'unsubscribe':
        updateData.unsubscribed = true;
        updateData.unsubscribedAt = new Date(timestamp * 1000);
        break;
        
      case 'spam_report':
        updateData.spamReported = true;
        updateData.spamReportedAt = new Date(timestamp * 1000);
        break;
    }
    
    await emailLogRef.update(updateData);
    
    // Update contact engagement
    if (contactId) {
      await updateContactEngagement(contactId, eventType, {
        emailType,
        timestamp: new Date(timestamp * 1000),
        url
      });
    }
    
    // Trigger workflow actions based on event
    await triggerWorkflowActions(contactId, emailType, eventType);
    
    console.log('✅ Webhook event processed');
    
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    throw error;
  }
}

/**
 * Update contact with engagement data
 */
async function updateContactEngagement(contactId, eventType, details) {
  const db = admin.firestore();
  
  try {
    const contactRef = db.collection('contacts').doc(contactId);
    
    const updateData = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    // Track engagement metrics
    switch (eventType) {
      case 'open':
        updateData['emailEngagement.totalOpens'] = admin.firestore.FieldValue.increment(1);
        updateData['emailEngagement.lastOpened'] = details.timestamp;
        break;
        
      case 'click':
        updateData['emailEngagement.totalClicks'] = admin.firestore.FieldValue.increment(1);
        updateData['emailEngagement.lastClicked'] = details.timestamp;
        updateData['emailEngagement.lastClickedUrl'] = details.url;
        break;
        
      case 'unsubscribe':
        updateData.unsubscribed = true;
        updateData.unsubscribedAt = details.timestamp;
        break;
    }
    
    await contactRef.update(updateData);
    console.log(`✅ Contact ${contactId} engagement updated`);
    
  } catch (error) {
    console.error('❌ Error updating contact engagement:', error);
  }
}

/**
 * Trigger workflow actions based on email events
 */
async function triggerWorkflowActions(contactId, emailType, eventType) {
  // This will be handled by emailWorkflowEngine.js
  // Just log for now
  console.log(`🔔 Workflow trigger: ${eventType} on ${emailType} for contact ${contactId}`);
}

/**
 * Log email send to Firestore
 */
async function logEmailSent(emailData) {
  const db = admin.firestore();
  
  try {
    await db.collection('emailLogs').doc(emailData.trackingId).set({
      ...emailData,
      events: {},
      opened: false,
      clicked: false,
      bounced: false,
      unsubscribed: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('✅ Email logged in Firestore');
    
  } catch (error) {
    console.error('❌ Error logging email:', error);
  }
}

/**
 * Check if email address is unsubscribed
 */
async function isUnsubscribed(email) {
  const db = admin.firestore();
  
  try {
    const contactSnapshot = await db.collection('contacts')
      .where('email', '==', email)
      .where('unsubscribed', '==', true)
      .limit(1)
      .get();
    
    return !contactSnapshot.empty;
    
  } catch (error) {
    console.error('❌ Error checking unsubscribe status:', error);
    return false; // Default to not unsubscribed on error
  }
}

/**
 * Add email to unsubscribe list
 */
async function unsubscribeEmail(email, reason = 'user_request') {
  const db = admin.firestore();
  
  try {
    // Find contact by email
    const contactSnapshot = await db.collection('contacts')
      .where('email', '==', email)
      .limit(1)
      .get();
    
    if (!contactSnapshot.empty) {
      const contactDoc = contactSnapshot.docs[0];
      
      await contactDoc.ref.update({
        unsubscribed: true,
        unsubscribedAt: admin.firestore.FieldValue.serverTimestamp(),
        unsubscribeReason: reason,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log(`✅ Email ${email} unsubscribed`);
      return true;
    }
    
    return false;
    
  } catch (error) {
    console.error('❌ Error unsubscribing email:', error);
    return false;
  }
}

/**
 * Get email delivery statistics
 */
async function getEmailStats(options = {}) {
  const {
    contactId = null,
    emailType = null,
    startDate = null,
    endDate = null
  } = options;
  
  const db = admin.firestore();
  
  try {
    let query = db.collection('emailLogs');
    
    // Apply filters
    if (contactId) {
      query = query.where('contactId', '==', contactId);
    }
    
    if (emailType) {
      query = query.where('emailType', '==', emailType);
    }
    
    if (startDate) {
      query = query.where('sentAt', '>=', startDate);
    }
    
    if (endDate) {
      query = query.where('sentAt', '<=', endDate);
    }
    
    const snapshot = await query.get();
    
    const stats = {
      total: 0,
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
      unsubscribed: 0,
      failed: 0
    };
    
    snapshot.forEach(doc => {
      const email = doc.data();
      stats.total++;
      
      if (email.status === 'sent') stats.sent++;
      if (email.status === 'failed') stats.failed++;
      if (email.opened) stats.opened++;
      if (email.clicked) stats.clicked++;
      if (email.bounced) stats.bounced++;
      if (email.unsubscribed) stats.unsubscribed++;
    });
    
    // Calculate rates
    stats.openRate = stats.sent > 0 ? (stats.opened / stats.sent * 100).toFixed(2) + '%' : '0%';
    stats.clickRate = stats.sent > 0 ? (stats.clicked / stats.sent * 100).toFixed(2) + '%' : '0%';
    stats.bounceRate = stats.sent > 0 ? (stats.bounced / stats.sent * 100).toFixed(2) + '%' : '0%';
    
    return stats;
    
  } catch (error) {
    console.error('❌ Error getting email stats:', error);
    return null;
  }
}

module.exports = {
  sendEmail,
  sendBulkEmails,
  processWebhookEvent,
  isUnsubscribed,
  unsubscribeEmail,
  getEmailStats,
  updateContactEngagement
};