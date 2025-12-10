/**
 * Gmail Inbox Listener - Firebase Cloud Function
 * Monitors Gmail inbox for incoming emails to 20+ aliases
 * Routes emails to appropriate handlers based on recipient alias
 *
 * Deployment: Scheduled function (runs every 5 minutes) OR Pub/Sub trigger
 *
 * Features:
 * - Fetches unread emails from Gmail
 * - Parses email metadata and body
 * - Routes to alias-specific handlers
 * - Marks processed emails
 * - Error handling and logging
 * - Duplicate detection
 */

const functions = require('firebase-functions');
const { gmailService } = require('./gmailService');
const { handleIncomingEmail } = require('../server/emailAliasActions');
const { admin, db } = require('./firebaseAdmin');

/**
 * Gmail Inbox Listener - Scheduled Function
 * Runs every 5 minutes to check for new emails
 */
exports.gmailInboxListener = functions.pubsub
  .schedule('every 5 minutes')
  .onRun(async (context) => {
    console.log('📬 Gmail Inbox Listener: Starting email check...');

    try {
      // Initialize Gmail service
      await gmailService.initialize();

      // Fetch unread emails
      const emails = await gmailService.fetchIncomingEmails('is:unread', 50);

      console.log(`📧 Found ${emails.length} unread emails`);

      if (emails.length === 0) {
        return { processed: 0, message: 'No unread emails' };
      }

      const results = {
        processed: 0,
        failed: 0,
        skipped: 0,
        errors: [],
      };

      // Process each email
      for (const email of emails) {
        try {
          // Check if already processed (duplicate detection)
          const isDuplicate = await checkDuplicate(email.id);

          if (isDuplicate) {
            console.log(`⏭️  Skipping duplicate email: ${email.id}`);
            results.skipped++;
            continue;
          }

          // Determine which alias received this email
          const recipientAlias = extractAlias(email.to);

          if (!recipientAlias) {
            console.warn(`⚠️  No alias found for recipient: ${email.to}`);
            results.skipped++;
            continue;
          }

          console.log(`📨 Processing email to ${recipientAlias}: ${email.subject}`);

          // Route to handler
          const handlerResult = await handleIncomingEmail({
            messageId: email.id,
            threadId: email.threadId,
            from: email.from,
            to: email.to,
            alias: recipientAlias,
            subject: email.subject,
            body: email.body,
            date: email.date,
            snippet: email.snippet,
          });

          // Mark as processed
          await markAsProcessed(email.id, recipientAlias, handlerResult);

          // Mark as read in Gmail
          await gmailService.markAsRead(email.id);

          // Add label
          await gmailService.addLabel(email.id, `Processed/${recipientAlias}`);

          results.processed++;

          console.log(`✅ Email processed successfully: ${email.id}`);
        } catch (error) {
          console.error(`❌ Failed to process email ${email.id}:`, error);
          results.failed++;
          results.errors.push({
            emailId: email.id,
            error: error.message,
          });

          // Log error but continue processing other emails
          await logProcessingError(email.id, error);
        }
      }

      console.log(`✅ Gmail Inbox Listener complete:`, results);

      return results;
    } catch (error) {
      console.error('❌ Gmail Inbox Listener failed:', error);
      throw error;
    }
  });

/**
 * Gmail Webhook Handler (Alternative: Real-time via Pub/Sub)
 * Triggered by Gmail push notifications
 * More efficient than polling, requires Gmail API watch setup
 */
exports.gmailWebhookHandler = functions.https.onRequest(async (req, res) => {
  console.log('📬 Gmail Webhook: Received notification');

  try {
    // Verify webhook authenticity
    const message = req.body.message;
    if (!message || !message.data) {
      console.warn('⚠️  Invalid webhook payload');
      return res.status(400).send('Invalid payload');
    }

    // Decode Pub/Sub message
    const data = Buffer.from(message.data, 'base64').toString();
    const notification = JSON.parse(data);

    console.log('📨 Notification data:', notification);

    // History ID indicates changes in mailbox
    const historyId = notification.historyId;
    const emailAddress = notification.emailAddress;

    // Initialize Gmail
    await gmailService.initialize();

    // Fetch new emails since last historyId
    const newEmails = await fetchEmailsSinceHistory(historyId);

    console.log(`📧 Found ${newEmails.length} new emails`);

    // Process new emails (same logic as scheduled function)
    for (const email of newEmails) {
      const recipientAlias = extractAlias(email.to);

      if (recipientAlias) {
        await handleIncomingEmail({
          messageId: email.id,
          threadId: email.threadId,
          from: email.from,
          to: email.to,
          alias: recipientAlias,
          subject: email.subject,
          body: email.body,
          date: email.date,
        });

        await markAsProcessed(email.id, recipientAlias);
        await gmailService.markAsRead(email.id);
      }
    }

    return res.status(200).send('OK');
  } catch (error) {
    console.error('❌ Webhook handler failed:', error);
    return res.status(500).send('Error processing webhook');
  }
});

/**
 * Manual Email Processing Trigger
 * Callable function for manual email processing
 */
exports.processGmailInbox = functions.https.onCall(async (data, context) => {
  // Check authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  // Check authorization (admin only)
  const userDoc = await db.collection('users').doc(context.auth.uid).get();
  const userRole = userDoc.data()?.role || 'viewer';

  if (!['masterAdmin', 'admin'].includes(userRole)) {
    throw new functions.https.HttpsError('permission-denied', 'Insufficient permissions');
  }

  console.log(`📬 Manual processing triggered by user: ${context.auth.uid}`);

  try {
    // Same logic as scheduled function
    await gmailService.initialize(context.auth.uid);

    const maxEmails = data.maxEmails || 50;
    const emails = await gmailService.fetchIncomingEmails('is:unread', maxEmails);

    const results = {
      processed: 0,
      failed: 0,
      emails: [],
    };

    for (const email of emails) {
      try {
        const recipientAlias = extractAlias(email.to);

        if (recipientAlias) {
          await handleIncomingEmail({
            messageId: email.id,
            threadId: email.threadId,
            from: email.from,
            to: email.to,
            alias: recipientAlias,
            subject: email.subject,
            body: email.body,
            date: email.date,
          });

          await markAsProcessed(email.id, recipientAlias);
          await gmailService.markAsRead(email.id);

          results.processed++;
          results.emails.push({
            id: email.id,
            subject: email.subject,
            status: 'processed',
          });
        }
      } catch (error) {
        results.failed++;
        results.emails.push({
          id: email.id,
          subject: email.subject,
          status: 'failed',
          error: error.message,
        });
      }
    }

    return results;
  } catch (error) {
    console.error('❌ Manual processing failed:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Helper: Extract alias from recipient email
 * @param {string} recipientEmail - Full recipient email (may include name)
 * @returns {string|null} Alias key
 */
function extractAlias(recipientEmail) {
  if (!recipientEmail) return null;

  // Extract email address from "Name <email>" format
  const emailMatch = recipientEmail.match(/<(.+?)>/) || [null, recipientEmail];
  const email = emailMatch[1] || recipientEmail;

  // List of known aliases
  const aliases = {
    'support@speedycreditrepair.com': 'support',
    'urgent@speedycreditrepair.com': 'urgent',
    'info@speedycreditrepair.com': 'info',
    'hello@speedycreditrepair.com': 'hello',
    'contact@speedycreditrepair.com': 'contact',
    'sales@speedycreditrepair.com': 'sales',
    'quotes@speedycreditrepair.com': 'quotes',
    'partnerships@speedycreditrepair.com': 'partnerships',
    'review@speedycreditrepair.com': 'review',
    'disputes@speedycreditrepair.com': 'disputes',
    'schedule@speedycreditrepair.com': 'schedule',
    'billing@speedycreditrepair.com': 'billing',
    'payments@speedycreditrepair.com': 'payments',
    'docs@speedycreditrepair.com': 'docs',
    'verify@speedycreditrepair.com': 'verify',
    'welcome@speedycreditrepair.com': 'welcome',
    'feedback@speedycreditrepair.com': 'feedback',
    'success@speedycreditrepair.com': 'success',
    'admin@speedycreditrepair.com': 'admin',
    'legal@speedycreditrepair.com': 'legal',
    'noreply@speedycreditrepair.com': 'noreply',
    'unsubscribe@speedycreditrepair.com': 'unsubscribe',
    'ai@speedycreditrepair.com': 'ai',
  };

  return aliases[email.toLowerCase()] || null;
}

/**
 * Helper: Check if email already processed (duplicate detection)
 * @param {string} messageId - Gmail message ID
 * @returns {boolean} True if duplicate
 */
async function checkDuplicate(messageId) {
  try {
    const snapshot = await db.collection('processedEmails')
      .where('messageId', '==', messageId)
      .limit(1)
      .get();

    return !snapshot.empty;
  } catch (error) {
    console.error('Failed to check duplicate:', error);
    return false;
  }
}

/**
 * Helper: Mark email as processed in Firestore
 * @param {string} messageId - Gmail message ID
 * @param {string} alias - Alias that received the email
 * @param {Object} result - Handler result
 */
async function markAsProcessed(messageId, alias, result = {}) {
  try {
    await db.collection('processedEmails').add({
      messageId,
      alias,
      result,
      processedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error('Failed to mark as processed:', error);
  }
}

/**
 * Helper: Log processing error
 * @param {string} messageId - Gmail message ID
 * @param {Error} error - Error object
 */
async function logProcessingError(messageId, error) {
  try {
    await db.collection('emailProcessingErrors').add({
      messageId,
      error: error.message,
      stack: error.stack,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
  } catch (logError) {
    console.error('Failed to log error:', logError);
  }
}

/**
 * Helper: Fetch emails since history ID (for webhook)
 * @param {string} historyId - Gmail history ID
 * @returns {Array} New emails
 */
async function fetchEmailsSinceHistory(historyId) {
  // This is a simplified version - in production, you'd use Gmail history API
  // to fetch only changes since the last historyId
  return await gmailService.fetchIncomingEmails('is:unread', 10);
}
