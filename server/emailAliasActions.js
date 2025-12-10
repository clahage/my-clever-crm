/**
 * Email Alias Action Handlers for Speedy Credit Repair
 * Production-ready handlers for 20+ Gmail aliases
 *
 * Each handler processes incoming emails and performs CRM actions
 */

const { admin, db } = require('../functions/firebaseAdmin');
const { gmailService } = require('../functions/gmailService');

/**
 * Main handler router
 * Routes incoming emails to appropriate alias handler
 * @param {Object} email - Parsed email object
 * @returns {Object} Handler result
 */
async function handleIncomingEmail(email) {
  const { alias, from, subject, body, messageId, threadId } = email;

  console.log(`📨 Routing email to ${alias} handler`);

  try {
    // Get handler for this alias
    const handler = ALIAS_HANDLERS[alias];

    if (!handler) {
      console.warn(`⚠️  No handler found for alias: ${alias}`);
      return { success: false, error: 'No handler found' };
    }

    // Execute handler
    const result = await handler({
      from,
      subject,
      body,
      messageId,
      threadId,
      date: email.date,
      snippet: email.snippet,
    });

    console.log(`✅ Handler executed successfully for ${alias}`);

    // Send auto-response if configured
    if (handler.autoResponse) {
      await sendAutoResponse(email, alias);
    }

    return { success: true, result };
  } catch (error) {
    console.error(`❌ Handler failed for ${alias}:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Alias Handler Definitions
 * Each handler is an async function that processes the email
 */
const ALIAS_HANDLERS = {
  /**
   * Support Alias - Create support ticket
   */
  support: async (email) => {
    const { from, subject, body } = email;

    // Extract sender email
    const senderEmail = extractEmail(from);

    // Find or create contact
    const contact = await findOrCreateContact(senderEmail);

    // Create support ticket
    const ticketRef = await db.collection('supportTickets').add({
      contactId: contact.id,
      contactEmail: senderEmail,
      subject,
      message: body,
      status: 'open',
      priority: 'normal',
      source: 'email',
      alias: 'support',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Log activity
    await logActivity(contact.id, 'support_ticket_created', {
      ticketId: ticketRef.id,
      subject,
    });

    return { ticketId: ticketRef.id, contactId: contact.id };
  },

  /**
   * Urgent Alias - Flag as urgent and create high-priority ticket
   */
  urgent: async (email) => {
    const { from, subject, body } = email;
    const senderEmail = extractEmail(from);

    // Find or create contact
    const contact = await findOrCreateContact(senderEmail);

    // Flag contact as urgent
    await db.collection('contacts').doc(contact.id).update({
      urgency: 'urgent',
      urgentFlaggedAt: admin.firestore.FieldValue.serverTimestamp(),
      urgentReason: `Email: ${subject}`,
    });

    // Create high-priority ticket
    const ticketRef = await db.collection('supportTickets').add({
      contactId: contact.id,
      contactEmail: senderEmail,
      subject: `[URGENT] ${subject}`,
      message: body,
      status: 'open',
      priority: 'urgent',
      source: 'email',
      alias: 'urgent',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Notify admins
    await notifyAdmins('urgent_ticket', {
      contactId: contact.id,
      ticketId: ticketRef.id,
      subject,
    });

    // Log activity
    await logActivity(contact.id, 'flagged_urgent', {
      ticketId: ticketRef.id,
      reason: subject,
    });

    return { ticketId: ticketRef.id, contactId: contact.id, urgency: 'urgent' };
  },

  /**
   * Info/Contact Alias - Create lead
   */
  info: async (email) => {
    return await ALIAS_HANDLERS.contact(email);
  },

  hello: async (email) => {
    return await ALIAS_HANDLERS.contact(email);
  },

  contact: async (email) => {
    const { from, subject, body } = email;
    const senderEmail = extractEmail(from);

    // Create or update contact as lead
    const contact = await findOrCreateContact(senderEmail, {
      source: 'email',
      journeyStage: 'awareness',
      status: 'lead',
    });

    // Log communication
    await db.collection('communications').add({
      contactId: contact.id,
      type: 'email_inbound',
      subject,
      message: body,
      from: senderEmail,
      to: 'contact@speedycreditrepair.com',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Log activity
    await logActivity(contact.id, 'email_received', {
      subject,
      alias: 'contact',
    });

    return { contactId: contact.id, action: 'lead_created' };
  },

  /**
   * Sales Alias - Create sales opportunity
   */
  sales: async (email) => {
    const { from, subject, body } = email;
    const senderEmail = extractEmail(from);

    // Find or create contact
    const contact = await findOrCreateContact(senderEmail, {
      source: 'email',
      journeyStage: 'consideration',
      status: 'lead',
    });

    // Create sales opportunity
    const oppRef = await db.collection('opportunities').add({
      contactId: contact.id,
      title: subject,
      description: body,
      stage: 'lead',
      source: 'email',
      value: 0,
      probability: 25,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Log activity
    await logActivity(contact.id, 'opportunity_created', {
      opportunityId: oppRef.id,
      subject,
    });

    return { opportunityId: oppRef.id, contactId: contact.id };
  },

  /**
   * Quotes Alias - Create quote request
   */
  quotes: async (email) => {
    const { from, subject, body } = email;
    const senderEmail = extractEmail(from);

    // Find or create contact
    const contact = await findOrCreateContact(senderEmail);

    // Create quote request
    const quoteRef = await db.collection('quoteRequests').add({
      contactId: contact.id,
      contactEmail: senderEmail,
      subject,
      details: body,
      status: 'pending',
      requestedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Log activity
    await logActivity(contact.id, 'quote_requested', {
      quoteId: quoteRef.id,
    });

    return { quoteId: quoteRef.id, contactId: contact.id };
  },

  /**
   * Review Alias - Trigger credit review
   */
  review: async (email) => {
    const { from, subject, body } = email;
    const senderEmail = extractEmail(from);

    // Find contact
    const contact = await findContact(senderEmail);

    if (!contact) {
      return { error: 'Contact not found', action: 'contact_not_found' };
    }

    // Create credit review task
    const reviewRef = await db.collection('creditReviews').add({
      contactId: contact.id,
      status: 'pending',
      requestedVia: 'email',
      requestDetails: body,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Log activity
    await logActivity(contact.id, 'credit_review_requested', {
      reviewId: reviewRef.id,
    });

    return { reviewId: reviewRef.id, contactId: contact.id };
  },

  /**
   * Disputes Alias - Log dispute communication
   */
  disputes: async (email) => {
    const { from, subject, body } = email;
    const senderEmail = extractEmail(from);

    // Find contact
    const contact = await findContact(senderEmail);

    if (!contact) {
      return { error: 'Contact not found' };
    }

    // Log dispute communication
    await db.collection('disputeCommunications').add({
      contactId: contact.id,
      subject,
      message: body,
      direction: 'inbound',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Log activity
    await logActivity(contact.id, 'dispute_communication', {
      subject,
    });

    return { contactId: contact.id, action: 'communication_logged' };
  },

  /**
   * Schedule Alias - Create scheduling request
   */
  schedule: async (email) => {
    const { from, subject, body } = email;
    const senderEmail = extractEmail(from);

    // Find or create contact
    const contact = await findOrCreateContact(senderEmail);

    // Create scheduling request
    const scheduleRef = await db.collection('schedulingRequests').add({
      contactId: contact.id,
      contactEmail: senderEmail,
      details: body,
      status: 'pending',
      requestedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Log activity
    await logActivity(contact.id, 'scheduling_requested', {
      requestId: scheduleRef.id,
    });

    return { scheduleId: scheduleRef.id, contactId: contact.id };
  },

  /**
   * Billing Alias - Create billing inquiry
   */
  billing: async (email) => {
    const { from, subject, body } = email;
    const senderEmail = extractEmail(from);

    // Find contact
    const contact = await findContact(senderEmail);

    if (!contact) {
      return { error: 'Contact not found' };
    }

    // Create billing inquiry
    const inquiryRef = await db.collection('billingInquiries').add({
      contactId: contact.id,
      subject,
      message: body,
      status: 'open',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Log activity
    await logActivity(contact.id, 'billing_inquiry', {
      inquiryId: inquiryRef.id,
    });

    return { inquiryId: inquiryRef.id, contactId: contact.id };
  },

  /**
   * Docs Alias - Process document attachments
   */
  docs: async (email) => {
    const { from, subject, body, attachments = [] } = email;
    const senderEmail = extractEmail(from);

    // Find contact
    const contact = await findContact(senderEmail);

    if (!contact) {
      return { error: 'Contact not found' };
    }

    // Log document receipt
    const docRef = await db.collection('documentSubmissions').add({
      contactId: contact.id,
      subject,
      notes: body,
      attachmentCount: attachments.length,
      status: 'received',
      receivedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Log activity
    await logActivity(contact.id, 'documents_received', {
      submissionId: docRef.id,
      count: attachments.length,
    });

    return { submissionId: docRef.id, contactId: contact.id };
  },

  /**
   * Verify Alias - Create verification request
   */
  verify: async (email) => {
    const { from, subject, body } = email;
    const senderEmail = extractEmail(from);

    // Find contact
    const contact = await findContact(senderEmail);

    if (!contact) {
      return { error: 'Contact not found' };
    }

    // Create verification request
    const verifyRef = await db.collection('verificationRequests').add({
      contactId: contact.id,
      type: 'identity',
      status: 'pending',
      requestedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Log activity
    await logActivity(contact.id, 'verification_requested', {
      verificationId: verifyRef.id,
    });

    return { verificationId: verifyRef.id, contactId: contact.id };
  },

  /**
   * Feedback Alias - Log customer feedback
   */
  feedback: async (email) => {
    const { from, subject, body } = email;
    const senderEmail = extractEmail(from);

    // Find or create contact
    const contact = await findOrCreateContact(senderEmail);

    // Log feedback
    const feedbackRef = await db.collection('feedback').add({
      contactId: contact.id,
      contactEmail: senderEmail,
      subject,
      message: body,
      sentiment: 'unknown', // Could use AI sentiment analysis
      source: 'email',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Log activity
    await logActivity(contact.id, 'feedback_received', {
      feedbackId: feedbackRef.id,
    });

    return { feedbackId: feedbackRef.id, contactId: contact.id };
  },

  /**
   * Unsubscribe Alias - Process opt-out request
   */
  unsubscribe: async (email) => {
    const { from } = email;
    const senderEmail = extractEmail(from);

    // Find contact
    const contact = await findContact(senderEmail);

    if (!contact) {
      return { error: 'Contact not found' };
    }

    // Update contact preferences
    await db.collection('contacts').doc(contact.id).update({
      emailOptOut: true,
      emailOptOutDate: admin.firestore.FieldValue.serverTimestamp(),
      emailOptOutReason: 'Email to unsubscribe@',
    });

    // Log activity
    await logActivity(contact.id, 'unsubscribed', {
      method: 'email',
    });

    return { contactId: contact.id, action: 'unsubscribed' };
  },

  /**
   * AI Alias - Smart AI-powered handling
   */
  ai: async (email) => {
    // Placeholder for AI-powered custom logic
    const { from, subject, body } = email;
    const senderEmail = extractEmail(from);

    // Find or create contact
    const contact = await findOrCreateContact(senderEmail);

    // Log for AI processing
    await db.collection('aiEmailQueue').add({
      contactId: contact.id,
      subject,
      body,
      status: 'queued',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { contactId: contact.id, action: 'queued_for_ai' };
  },
};

/**
 * Helper: Extract email address from "Name <email>" format
 */
function extractEmail(emailString) {
  if (!emailString) return null;

  const match = emailString.match(/<(.+?)>/);
  return match ? match[1] : emailString;
}

/**
 * Helper: Find contact by email
 */
async function findContact(email) {
  const snapshot = await db.collection('contacts')
    .where('email', '==', email)
    .limit(1)
    .get();

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
}

/**
 * Helper: Find or create contact
 */
async function findOrCreateContact(email, additionalData = {}) {
  let contact = await findContact(email);

  if (!contact) {
    // Create new contact
    const contactRef = await db.collection('contacts').add({
      email,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      source: 'email',
      status: 'lead',
      ...additionalData,
    });

    contact = { id: contactRef.id, email, ...additionalData };
  }

  return contact;
}

/**
 * Helper: Log activity to contact timeline
 */
async function logActivity(contactId, activityType, data = {}) {
  await db.collection('activities').add({
    contactId,
    type: activityType,
    data,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });
}

/**
 * Helper: Notify admins of important events
 */
async function notifyAdmins(notificationType, data) {
  // Get admin users
  const adminsSnapshot = await db.collection('users')
    .where('role', 'in', ['masterAdmin', 'admin'])
    .get();

  // Create notifications
  const notifications = adminsSnapshot.docs.map(doc => ({
    userId: doc.id,
    type: notificationType,
    data,
    read: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  }));

  // Batch write
  const batch = db.batch();
  notifications.forEach(notification => {
    const ref = db.collection('notifications').doc();
    batch.set(ref, notification);
  });

  await batch.commit();
}

/**
 * Helper: Send auto-response email
 */
async function sendAutoResponse(email, alias) {
  const { from, subject } = email;
  const senderEmail = extractEmail(from);

  const responses = {
    support: {
      subject: 'Re: ' + subject,
      html: `
        <div style="font-family: Arial, sans-serif;">
          <p>Thank you for contacting Speedy Credit Repair Support.</p>
          <p>We have received your message and a team member will respond within 24 hours.</p>
          <p>Reference: ${Date.now()}</p>
          <hr>
          <p style="font-size: 12px; color: #666;">
            Speedy Credit Repair | Est. 1995<br>
            Phone: +1 (888) 724-7344<br>
            support@speedycreditrepair.com
          </p>
        </div>
      `,
    },
    urgent: {
      subject: 'Re: [URGENT] ' + subject,
      html: `
        <div style="font-family: Arial, sans-serif;">
          <p><strong>URGENT REQUEST RECEIVED</strong></p>
          <p>Your urgent matter has been flagged for immediate attention.</p>
          <p>A senior team member will contact you within 4 hours.</p>
          <p>If this is a billing emergency, please call: +1 (888) 724-7344</p>
          <hr>
          <p style="font-size: 12px; color: #666;">Speedy Credit Repair</p>
        </div>
      `,
    },
  };

  const response = responses[alias];

  if (response && gmailService) {
    try {
      await gmailService.sendEmail({
        to: senderEmail,
        subject: response.subject,
        html: response.html,
        from: `${alias}@speedycreditrepair.com`,
        fromName: 'Speedy Credit Repair',
      });

      console.log(`✅ Auto-response sent to ${senderEmail}`);
    } catch (error) {
      console.error(`❌ Auto-response failed: ${error.message}`);
    }
  }
}

// Set auto-response flags
ALIAS_HANDLERS.support.autoResponse = true;
ALIAS_HANDLERS.urgent.autoResponse = true;
ALIAS_HANDLERS.info.autoResponse = true;
ALIAS_HANDLERS.hello.autoResponse = true;
ALIAS_HANDLERS.contact.autoResponse = true;

module.exports = {
  handleIncomingEmail,
  ALIAS_HANDLERS,
};
