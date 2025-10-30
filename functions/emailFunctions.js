/**
 * Email Automation Cloud Functions for SpeedyCRM
 * 
 * Enterprise-grade Firebase Functions for automated email workflows
 * with AI-powered personalization and intelligent scheduling.
 * 
 * @author SpeedyCRM Team
 * @date October 2025
 */

const functions = require('firebase-functions');
const { db, admin } = require('./firebaseAdmin');
const { workflowEngine } = require('./emailWorkflowEngine');
const { generateAIEmail } = require('./aiEmailService');
const { sendEmail, processWebhook } = require('./sendGridService');
const { checkApplicationStatus, batchCheckApplications } = require('./idiqApplicationTracker');

/**
 * FUNCTION 1: Trigger when new contact is created
 * Automatically starts appropriate email workflow
 */
exports.onContactCreated = functions.firestore
  .document('contacts/{contactId}')
  .onCreate(async (snap, context) => {
    try {
      const contactId = context.params.contactId;
      const contactData = snap.data();

      console.log(`New contact created: ${contactId}`, {
        name: contactData.name,
        email: contactData.email,
        source: contactData.source
      });

      // Validate email exists
      if (!contactData.email || !isValidEmail(contactData.email)) {
        console.log(`Skipping workflow - invalid email: ${contactData.email}`);
        return null;
      }

      // Determine workflow based on source
      let workflowId = 'manual';
      let context_data = {
        source: contactData.source || 'unknown',
        entryMethod: 'contact_created'
      };

      // AI Receptionist source
      if (contactData.source === 'ai-receptionist' || contactData.aiReceptionist) {
        workflowId = 'ai-receptionist';
        context_data.hasTranscript = !!contactData.callTranscript;
        context_data.leadScore = contactData.leadScore || 5;
      }
      // Website form source
      else if (contactData.source === 'website' || contactData.source === 'landing-page') {
        workflowId = 'website-form';
        context_data.formData = contactData.formData || {};
      }
      // Manual entry
      else {
        workflowId = 'manual';
      }

      // Start workflow
      const result = await workflowEngine.startWorkflow(
        contactId,
        workflowId,
        context_data
      );

      if (result.success) {
        console.log(`Workflow ${workflowId} started successfully for ${contactId}`);
        
        // Log event
        await logWorkflowEvent(contactId, 'workflow_started', {
          workflowId,
          source: contactData.source
        });
      } else {
        console.log(`Failed to start workflow for ${contactId}:`, result.reason);
      }

      return result;

    } catch (error) {
      console.error('Error in onContactCreated:', error);
      
      // Log error but don't fail
      await logError('onContactCreated', error, {
        contactId: context.params.contactId
      });
      
      return null;
    }
  });

/**
 * FUNCTION 2: Scheduled function to process workflow stages
 * Runs every hour to execute due stages
 */
exports.processScheduledStages = functions.pubsub
  .schedule('every 1 hours')
  .timeZone('America/Los_Angeles')
  .onRun(async (context) => {
    try {
      console.log('Starting scheduled stage processing...');

      const result = await workflowEngine.processScheduledStages();

      console.log('Scheduled stage processing complete:', result);

      // Log summary
      await db.collection('systemLogs').add({
        type: 'scheduled_processing',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        result
      });

      return result;

    } catch (error) {
      console.error('Error in processScheduledStages:', error);
      await logError('processScheduledStages', error);
      throw error;
    }
  });

/**
 * FUNCTION 3: HTTP endpoint for SendGrid webhooks
 * Processes email events (open, click, bounce, etc.)
 */
exports.handleSendGridWebhook = functions.https.onRequest(async (req, res) => {
  try {
    // Verify SendGrid webhook signature
    const isValid = verifyWebhookSignature(req);
    
    if (!isValid) {
      console.error('Invalid webhook signature');
      res.status(401).send('Unauthorized');
      return;
    }

    // Parse webhook events
    const events = req.body;

    if (!Array.isArray(events)) {
      console.error('Invalid webhook payload - expected array');
      res.status(400).send('Bad Request');
      return;
    }

    console.log(`Processing ${events.length} SendGrid webhook events`);

    // Process each event
    const results = await Promise.allSettled(
      events.map(event => processWebhookEvent(event))
    );

    const succeeded = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log(`Webhook processing complete: ${succeeded} succeeded, ${failed} failed`);

    res.status(200).json({
      success: true,
      processed: events.length,
      succeeded,
      failed
    });

  } catch (error) {
    console.error('Error in handleSendGridWebhook:', error);
    await logError('handleSendGridWebhook', error);
    res.status(500).send('Internal Server Error');
  }
});

/**
 * FUNCTION 4: Callable function to manually send email
 * For admin dashboard manual email sending
 */
exports.manualSendEmail = functions.https.onCall(async (data, context) => {
  try {
    // Check authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Must be authenticated to send emails'
      );
    }

    // Check admin role
    const userDoc = await db.collection('users').doc(context.auth.uid).get();
    const userRole = userDoc.data()?.role || 0;
    
    if (userRole < 7) { // Must be admin or higher
      throw new functions.https.HttpsError(
        'permission-denied',
        'Must be admin to manually send emails'
      );
    }

    const { contactId, emailType, customSubject, customBody } = data;

    // Validate inputs
    if (!contactId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Contact ID is required'
      );
    }

    // Get contact data
    const contactDoc = await db.collection('contacts').doc(contactId).get();
    
    if (!contactDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Contact not found'
      );
    }

    const contactData = contactDoc.data();

    if (!contactData.email) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Contact has no email address'
      );
    }

    // Determine email content
    let subject, body;

    if (customSubject && customBody) {
      // Use custom content
      subject = customSubject;
      body = customBody;
    } else if (emailType) {
      // Generate from template
      const templateContent = await loadEmailTemplate(emailType, contactData);
      subject = templateContent.subject;
      body = templateContent.body;
    } else {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Must provide either custom content or email type'
      );
    }

    // Send email
    const sendResult = await sendEmail({
      to: contactData.email,
      from: process.env.FROM_EMAIL || 'chris@speedycreditrepair.com',
      subject,
      html: body,
      metadata: {
        contactId,
        source: 'manual_send',
        sentBy: context.auth.uid
      }
    });

    // Log manual send
    await db.collection('contacts').doc(contactId).update({
      'workflowState.emailsSent': admin.firestore.FieldValue.arrayUnion({
        type: 'manual',
        emailType: emailType || 'custom',
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
        sentBy: context.auth.uid,
        subject,
        messageId: sendResult.messageId
      })
    });

    console.log(`Manual email sent to ${contactData.email} by user ${context.auth.uid}`);

    return {
      success: true,
      messageId: sendResult.messageId,
      sentTo: contactData.email
    };

  } catch (error) {
    console.error('Error in manualSendEmail:', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError(
      'internal',
      error.message
    );
  }
});

/**
 * FUNCTION 5: Callable function to pause workflow
 * For admin dashboard workflow control
 */
exports.pauseWorkflow = functions.https.onCall(async (data, context) => {
  try {
    // Check authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Must be authenticated'
      );
    }

    const { contactId, reason } = data;

    if (!contactId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Contact ID is required'
      );
    }

    // Check if contact exists
    const contactDoc = await db.collection('contacts').doc(contactId).get();
    
    if (!contactDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Contact not found'
      );
    }

    // Pause workflow
    await workflowEngine.pauseWorkflow(
      contactId,
      reason || `Paused by ${context.auth.email}`
    );

    // Log action
    await logWorkflowEvent(contactId, 'workflow_paused', {
      pausedBy: context.auth.uid,
      reason: reason || 'manual'
    });

    console.log(`Workflow paused for ${contactId} by ${context.auth.email}`);

    return {
      success: true,
      message: 'Workflow paused successfully'
    };

  } catch (error) {
    console.error('Error in pauseWorkflow:', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * FUNCTION 6: Callable function to resume workflow
 * For admin dashboard workflow control
 */
exports.resumeWorkflow = functions.https.onCall(async (data, context) => {
  try {
    // Check authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Must be authenticated'
      );
    }

    const { contactId } = data;

    if (!contactId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Contact ID is required'
      );
    }

    // Check if contact exists
    const contactDoc = await db.collection('contacts').doc(contactId).get();
    
    if (!contactDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Contact not found'
      );
    }

    // Resume workflow
    await workflowEngine.resumeWorkflow(contactId);

    // Log action
    await logWorkflowEvent(contactId, 'workflow_resumed', {
      resumedBy: context.auth.uid
    });

    console.log(`Workflow resumed for ${contactId} by ${context.auth.email}`);

    return {
      success: true,
      message: 'Workflow resumed successfully'
    };

  } catch (error) {
    console.error('Error in resumeWorkflow:', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * FUNCTION 7: Scheduled IDIQ application checker
 * Runs daily at 9 AM PST to check application statuses
 */
exports.checkIDIQApplications = functions.pubsub
  .schedule('0 9 * * *')
  .timeZone('America/Los_Angeles')
  .onRun(async (context) => {
    try {
      console.log('Starting daily IDIQ application check...');

      const result = await batchCheckApplications(100); // Check up to 100 contacts

      console.log('IDIQ application check complete:', result);

      // Log summary
      await db.collection('systemLogs').add({
        type: 'idiq_batch_check',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        result
      });

      // Send notification if too many failures
      if (result.failed > result.checked * 0.2) { // More than 20% failure rate
        await sendAdminNotification({
          type: 'idiq_check_failures',
          message: `IDIQ check had high failure rate: ${result.failed}/${result.checked}`,
          data: result
        });
      }

      return result;

    } catch (error) {
      console.error('Error in checkIDIQApplications:', error);
      await logError('checkIDIQApplications', error);
      throw error;
    }
  });

/**
 * FUNCTION 8: Generate AI-powered email content
 * Callable function for real-time AI email generation
 */
exports.generateAIEmailContent = functions.https.onCall(async (data, context) => {
  try {
    // Check authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Must be authenticated'
      );
    }

    const { contactId, emailType, customPrompt } = data;

    if (!contactId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Contact ID is required'
      );
    }

    // Get contact data
    const contactDoc = await db.collection('contacts').doc(contactId).get();
    
    if (!contactDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Contact not found'
      );
    }

    const contactData = contactDoc.data();

    // Generate AI email
    const aiResult = await generateAIEmail(
      contactData.callTranscript || customPrompt || '',
      contactData,
      emailType || 'custom'
    );

    console.log(`AI email generated for ${contactId}`);

    return {
      success: true,
      subject: aiResult.subject,
      body: aiResult.body,
      metadata: aiResult.metadata
    };

  } catch (error) {
    console.error('Error in generateAIEmailContent:', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Process a single webhook event
 */
async function processWebhookEvent(event) {
  try {
    const { contactId } = event.metadata || {};
    
    if (!contactId) {
      console.log('Webhook event has no contactId, skipping');
      return;
    }

    const eventType = event.event; // 'open', 'click', 'bounce', etc.

    // Handle event in workflow engine
    await workflowEngine.handleEmailEvent(contactId, eventType, event);

    // Log event
    await db.collection('emailEvents').add({
      contactId,
      eventType,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      data: event
    });

  } catch (error) {
    console.error('Error processing webhook event:', error);
    throw error;
  }
}

/**
 * Verify SendGrid webhook signature
 */
function verifyWebhookSignature(req) {
  // TODO: Implement actual signature verification
  // For now, just check if request has body
  return req.body && Array.isArray(req.body);
}

/**
 * Validate email address
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Load email template
 */
async function loadEmailTemplate(emailType, contactData) {
  // This would load from actual template files
  // For now, return placeholder
  return {
    subject: `Email: ${emailType}`,
    body: `<html><body><p>Template for ${emailType}</p></body></html>`
  };
}

/**
 * Log workflow event
 */
async function logWorkflowEvent(contactId, eventType, data = {}) {
  try {
    await db.collection('workflowEvents').add({
      contactId,
      eventType,
      data,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error('Error logging workflow event:', error);
  }
}

/**
 * Log error to Firestore
 */
async function logError(functionName, error, context = {}) {
  try {
    await db.collection('errorLogs').add({
      function: functionName,
      error: {
        message: error.message,
        stack: error.stack,
        code: error.code
      },
      context,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
  } catch (logError) {
    console.error('Error logging error:', logError);
  }
}

/**
 * Send notification to admin
 */
async function sendAdminNotification(notification) {
  try {
    // Send email to admin
    await sendEmail({
      to: 'chris@speedycreditrepair.com',
      from: 'system@speedycreditrepair.com',
      subject: `[SpeedyCRM Alert] ${notification.type}`,
      html: `
        <h2>System Alert</h2>
        <p>${notification.message}</p>
        <pre>${JSON.stringify(notification.data, null, 2)}</pre>
      `
    });

    // Log to Firestore
    await db.collection('adminNotifications').add({
      ...notification,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

  } catch (error) {
    console.error('Error sending admin notification:', error);
  }
}

// Export all functions
module.exports = {
  onContactCreated: exports.onContactCreated,
  processScheduledStages: exports.processScheduledStages,
  handleSendGridWebhook: exports.handleSendGridWebhook,
  manualSendEmail: exports.manualSendEmail,
  pauseWorkflow: exports.pauseWorkflow,
  resumeWorkflow: exports.resumeWorkflow,
  checkIDIQApplications: exports.checkIDIQApplications,
  generateAIEmailContent: exports.generateAIEmailContent
};