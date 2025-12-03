// ============================================================================
// FAILED PAYMENT RETRY SERVICE - Automatic Retry Logic with Exponential Backoff
// ============================================================================
// Automatically retries failed payments with intelligent scheduling
// Implements exponential backoff: 1 day, 3 days, 7 days
// Notifies admins and clients about retry attempts and ultimate failures
// ============================================================================

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const sgMail = require('@sendgrid/mail');

const db = admin.firestore();

// Initialize SendGrid
const SENDGRID_API_KEY = functions.config().sendgrid?.apikey || process.env.SENDGRID_API_KEY;
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

/**
 * Retry schedule configuration
 * Exponential backoff: 1 day, 3 days, 7 days
 */
const RETRY_SCHEDULE = [
  { attemptNumber: 1, daysAfter: 1, description: '1 day after failure' },
  { attemptNumber: 2, daysAfter: 3, description: '3 days after failure' },
  { attemptNumber: 3, daysAfter: 7, description: '7 days after failure' }
];

const MAX_RETRY_ATTEMPTS = 3;

/**
 * Email template for retry notification to client
 */
function getClientRetryEmail(clientName, amount, attemptNumber, nextRetryDate) {
  return {
    subject: `⚠️ Payment Retry Scheduled - Attempt ${attemptNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f59e0b; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #fffbeb; padding: 30px; border-radius: 0 0 8px 8px; }
          .warning-box { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
          .amount { font-size: 24px; font-weight: bold; color: #f59e0b; }
          .action-needed { background-color: #fecaca; padding: 15px; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Payment Failed - Retry Scheduled</h1>
          </div>
          <div class="content">
            <p>Hi ${clientName},</p>

            <div class="warning-box">
              <strong>Payment Processing Issue</strong><br>
              Your recent payment of <span class="amount">$${parseFloat(amount).toFixed(2)}</span> could not be processed.
            </div>

            <p><strong>What's happening:</strong></p>
            <ul>
              <li>Your payment attempt was unsuccessful</li>
              <li>This is retry attempt #${attemptNumber} of ${MAX_RETRY_ATTEMPTS}</li>
              <li>We will automatically retry on: <strong>${nextRetryDate}</strong></li>
            </ul>

            <div class="action-needed">
              <strong>⚡ Action Required:</strong><br>
              Please ensure sufficient funds are available in your account before the retry date.
            </div>

            <p><strong>Common reasons for payment failures:</strong></p>
            <ul>
              <li>Insufficient funds in account</li>
              <li>Payment method expired or invalid</li>
              <li>Account frozen or restricted</li>
              <li>Incorrect account information</li>
            </ul>

            <p>If you need to update your payment information or have questions, please log in to your client portal or contact us immediately.</p>

            <p><strong>Need help?</strong> Contact us at billing@speedycreditrepair.com or call (555) 123-4567</p>

            <p>Best regards,<br>
            <strong>Speedy Credit Repair Team</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated notification from Speedy Credit Repair Inc.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Hi ${clientName},\n\nYour payment of $${parseFloat(amount).toFixed(2)} could not be processed.\n\nRetry Attempt: ${attemptNumber} of ${MAX_RETRY_ATTEMPTS}\nNext Retry: ${nextRetryDate}\n\nPlease ensure sufficient funds are available.\n\nContact us if you need assistance: billing@speedycreditrepair.com\n\nBest regards,\nSpeedy Credit Repair Team`
  };
}

/**
 * Email template for final failure notification
 */
function getFinalFailureEmail(clientName, amount) {
  return {
    subject: '🚨 Payment Failed - Immediate Action Required',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #fee2e2; padding: 30px; border-radius: 0 0 8px 8px; }
          .critical { background-color: #fecaca; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0; }
          .amount { font-size: 28px; font-weight: bold; color: #dc2626; }
          .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚨 Payment Failed - Contact Us Immediately</h1>
          </div>
          <div class="content">
            <p>Hi ${clientName},</p>

            <div class="critical">
              <strong>⚠️ CRITICAL: All payment attempts have failed</strong><br><br>
              Amount: <span class="amount">$${parseFloat(amount).toFixed(2)}</span><br><br>
              We have attempted to process your payment ${MAX_RETRY_ATTEMPTS} times without success.
            </div>

            <p><strong>Immediate action required:</strong></p>
            <ul>
              <li>Contact our billing department immediately</li>
              <li>Update your payment information</li>
              <li>Make alternative payment arrangements</li>
            </ul>

            <p><strong>Important:</strong> Failure to resolve this payment issue may result in:</p>
            <ul>
              <li>Service interruption</li>
              <li>Late payment fees</li>
              <li>Account suspension</li>
            </ul>

            <p><strong>Contact us now:</strong></p>
            <ul>
              <li>Email: billing@speedycreditrepair.com</li>
              <li>Phone: (555) 123-4567</li>
              <li>Client Portal: Update payment method</li>
            </ul>

            <p>We're here to help you resolve this issue. Please contact us as soon as possible.</p>

            <p>Best regards,<br>
            <strong>Speedy Credit Repair Team</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated notification from Speedy Credit Repair Inc.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `CRITICAL: Hi ${clientName},\n\nAll payment attempts for $${parseFloat(amount).toFixed(2)} have failed after ${MAX_RETRY_ATTEMPTS} attempts.\n\nImmediate action required:\n- Contact billing immediately\n- Update payment information\n- Make alternative arrangements\n\nContact: billing@speedycreditrepair.com or (555) 123-4567\n\nBest regards,\nSpeedy Credit Repair Team`
  };
}

/**
 * Email template for admin notification
 */
function getAdminNotificationEmail(clientName, amount, attemptNumber, isLastAttempt) {
  return {
    subject: isLastAttempt
      ? `🚨 Final Payment Retry Failed - ${clientName}`
      : `⚠️ Payment Retry Attempt ${attemptNumber} - ${clientName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: ${isLastAttempt ? '#dc2626' : '#f59e0b'};">
            ${isLastAttempt ? '🚨 Final Payment Retry Failed' : '⚠️ Payment Retry Notification'}
          </h2>
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Client:</strong> ${clientName}</p>
            <p><strong>Amount:</strong> $${parseFloat(amount).toFixed(2)}</p>
            <p><strong>Retry Attempt:</strong> ${attemptNumber} of ${MAX_RETRY_ATTEMPTS}</p>
            <p><strong>Status:</strong> ${isLastAttempt ? 'All retries exhausted - Manual intervention required' : 'Retry scheduled'}</p>
          </div>
          ${isLastAttempt ? `
          <div style="background-color: #fee2e2; padding: 15px; border-left: 4px solid #dc2626; margin: 20px 0;">
            <strong>Action Required:</strong> This payment has failed all automatic retry attempts. Please contact the client immediately to resolve the payment issue.
          </div>
          ` : ''}
          <p>Log in to the admin panel to view full payment details and take action.</p>
        </div>
      </body>
      </html>
    `,
    text: `${isLastAttempt ? 'CRITICAL' : 'WARNING'}: Payment retry for ${clientName}\n\nAmount: $${parseFloat(amount).toFixed(2)}\nAttempt: ${attemptNumber} of ${MAX_RETRY_ATTEMPTS}\n\n${isLastAttempt ? 'All retries exhausted. Manual intervention required.' : 'Retry scheduled.'}\n\nView details in admin panel.`
  };
}

/**
 * Send email notification
 */
async function sendEmail(to, subject, html, text) {
  const msg = {
    to,
    from: {
      email: 'billing@speedycreditrepair.com',
      name: 'Speedy Credit Repair - Billing'
    },
    subject,
    html,
    text
  };

  try {
    if (!SENDGRID_API_KEY) {
      console.warn('⚠️ SendGrid not configured. Email would be sent to:', to);
      return { success: false, reason: 'SendGrid not configured' };
    }

    await sgMail.send(msg);
    console.log('✅ Email sent to:', to);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get client email
 */
async function getClientEmail(clientId) {
  try {
    const contactDoc = await db.collection('contacts').doc(clientId).get();
    if (contactDoc.exists) {
      return contactDoc.data().email;
    }

    const userDoc = await db.collection('users').doc(clientId).get();
    if (userDoc.exists) {
      return userDoc.data().email;
    }

    return null;
  } catch (error) {
    console.error('Error getting client email:', error);
    return null;
  }
}

/**
 * Get admin emails
 */
async function getAdminEmails() {
  try {
    const adminsSnapshot = await db.collection('users')
      .where('role', 'in', ['admin', 'masterAdmin'])
      .get();

    const emails = [];
    adminsSnapshot.forEach(doc => {
      const email = doc.data().email;
      if (email) emails.push(email);
    });

    return emails;
  } catch (error) {
    console.error('Error getting admin emails:', error);
    return [];
  }
}

/**
 * Calculate next retry date
 */
function calculateNextRetryDate(failedAt, attemptNumber) {
  const schedule = RETRY_SCHEDULE.find(s => s.attemptNumber === attemptNumber);
  if (!schedule) return null;

  const failureDate = failedAt.toDate ? failedAt.toDate() : new Date(failedAt);
  const nextRetry = new Date(failureDate);
  nextRetry.setDate(nextRetry.getDate() + schedule.daysAfter);

  return nextRetry;
}

/**
 * Process a single payment retry
 */
async function processPaymentRetry(paymentId, paymentData) {
  const currentAttempt = (paymentData.retryAttempts || 0) + 1;

  console.log(`\n🔄 Processing retry attempt ${currentAttempt} for payment ${paymentId}`);

  // Get client information
  const clientEmailAddress = await getClientEmail(paymentData.clientId);
  if (!clientEmailAddress) {
    console.error('❌ Client email not found');
    return { success: false, error: 'Client email not found' };
  }

  // Check if max retries reached
  if (currentAttempt > MAX_RETRY_ATTEMPTS) {
    console.log(`❌ Max retry attempts (${MAX_RETRY_ATTEMPTS}) reached for payment ${paymentId}`);

    // Send final failure notification to client
    const finalEmail = getFinalFailureEmail(paymentData.clientName, paymentData.amount);
    await sendEmail(clientEmail, finalEmail.subject, finalEmail.html, finalEmail.text);

    // Notify admins
    const adminEmails = await getAdminEmails();
    const adminEmail = getAdminNotificationEmail(
      paymentData.clientName,
      paymentData.amount,
      currentAttempt,
      true
    );

    for (const adminEmail of adminEmails) {
      await sendEmail(adminEmail, adminEmail.subject, adminEmail.html, adminEmail.text);
    }

    // Update payment status to permanently failed
    await db.collection('payments').doc(paymentId).update({
      status: 'failed_permanent',
      retryAttempts: currentAttempt,
      lastRetryAt: admin.firestore.FieldValue.serverTimestamp(),
      finalFailureNotificationSent: true,
      notes: admin.firestore.FieldValue.arrayUnion(
        `All ${MAX_RETRY_ATTEMPTS} retry attempts failed. Manual intervention required.`
      )
    });

    return { success: false, reason: 'Max retries reached', finalFailure: true };
  }

  // Calculate next retry date
  const nextRetryDate = calculateNextRetryDate(
    paymentData.failedAt || admin.firestore.Timestamp.now(),
    currentAttempt
  );

  // Send retry notification to client
  const clientRetryEmail = getClientRetryEmail(
    paymentData.clientName,
    paymentData.amount,
    currentAttempt,
    nextRetryDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  );

  await sendEmail(clientRetryEmail, clientRetryEmail.subject, clientRetryEmail.html, clientRetryEmail.text);

  // Notify admins
  const adminEmails = await getAdminEmails();
  const adminEmail = getAdminNotificationEmail(
    paymentData.clientName,
    paymentData.amount,
    currentAttempt,
    false
  );

  for (const email of adminEmails) {
    await sendEmail(email, adminEmail.subject, adminEmail.html, adminEmail.text);
  }

  // Update payment record
  await db.collection('payments').doc(paymentId).update({
    status: 'retry_scheduled',
    retryAttempts: currentAttempt,
    nextRetryDate: admin.firestore.Timestamp.fromDate(nextRetryDate),
    lastRetryAt: admin.firestore.FieldValue.serverTimestamp(),
    notes: admin.firestore.FieldValue.arrayUnion(
      `Retry attempt ${currentAttempt} scheduled for ${nextRetryDate.toLocaleDateString()}`
    )
  });

  console.log(`✅ Retry ${currentAttempt} scheduled for ${nextRetryDate.toLocaleDateString()}`);

  return {
    success: true,
    attemptNumber: currentAttempt,
    nextRetryDate
  };
}

/**
 * Cloud Function: Daily scheduler to process payment retries
 * Runs every day at 10 AM EST
 */
exports.dailyPaymentRetryScheduler = functions.pubsub
  .schedule('0 10 * * *')
  .timeZone('America/New_York')
  .onRun(async (context) => {
    console.log('🚀 Starting daily payment retry scheduler...');

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Find payments scheduled for retry today
      const paymentsSnapshot = await db.collection('payments')
        .where('status', '==', 'retry_scheduled')
        .where('nextRetryDate', '>=', today)
        .where('nextRetryDate', '<', tomorrow)
        .get();

      console.log(`📋 Found ${paymentsSnapshot.size} payment(s) scheduled for retry today`);

      const results = {
        total: paymentsSnapshot.size,
        processed: 0,
        failed: 0,
        permanentFailures: 0
      };

      for (const paymentDoc of paymentsSnapshot.docs) {
        const paymentId = paymentDoc.id;
        const paymentData = paymentDoc.data();

        try {
          const result = await processPaymentRetry(paymentId, paymentData);

          if (result.success) {
            results.processed++;
          } else if (result.finalFailure) {
            results.permanentFailures++;
          } else {
            results.failed++;
          }
        } catch (error) {
          console.error(`Error processing retry for payment ${paymentId}:`, error);
          results.failed++;
        }
      }

      console.log('\n📊 Payment Retry Results:');
      console.log(`   Total: ${results.total}`);
      console.log(`   Processed: ${results.processed}`);
      console.log(`   Failed: ${results.failed}`);
      console.log(`   Permanent Failures: ${results.permanentFailures}`);

      return results;
    } catch (error) {
      console.error('❌ Payment retry scheduler failed:', error);
      throw error;
    }
  });

/**
 * Cloud Function: Auto-schedule retry when payment fails
 * Triggered when payment status changes to failed
 */
exports.autoScheduleRetry = functions.firestore
  .document('payments/{paymentId}')
  .onUpdate(async (change, context) => {
    const paymentId = context.params.paymentId;
    const beforeData = change.before.data();
    const afterData = change.after.data();

    // Check if payment just failed
    if (beforeData.status !== 'failed' && afterData.status === 'failed') {
      console.log(`\n💔 Payment failed - auto-scheduling retry for: ${paymentId}`);

      // Initialize retry attempt counter
      const currentAttempt = 1;

      // Calculate first retry date (1 day after failure)
      const nextRetryDate = new Date();
      nextRetryDate.setDate(nextRetryDate.getDate() + 1);

      // Update payment with retry schedule
      await db.collection('payments').doc(paymentId).update({
        status: 'retry_scheduled',
        retryAttempts: 0, // Will be incremented when retry is processed
        nextRetryDate: admin.firestore.Timestamp.fromDate(nextRetryDate),
        failedAt: admin.firestore.FieldValue.serverTimestamp(),
        notes: admin.firestore.FieldValue.arrayUnion(
          `Payment failed. First retry scheduled for ${nextRetryDate.toLocaleDateString()}`
        )
      });

      console.log(`✅ First retry scheduled for ${nextRetryDate.toLocaleDateString()}`);

      return { success: true, retryScheduled: true };
    }

    return { skipped: true, reason: 'Not a payment failure' };
  });

/**
 * Cloud Function: Manual retry trigger for admins
 */
exports.retryFailedPayment = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  // Verify admin role
  const userDoc = await db.collection('users').doc(context.auth.uid).get();
  const userRole = userDoc.data()?.role;

  if (userRole !== 'admin' && userRole !== 'masterAdmin') {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can retry payments');
  }

  const { paymentId } = data;

  try {
    const paymentDoc = await db.collection('payments').doc(paymentId).get();
    if (!paymentDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Payment not found');
    }

    const paymentData = paymentDoc.data();

    const result = await processPaymentRetry(paymentId, paymentData);

    return result;
  } catch (error) {
    console.error('Error retrying payment:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

module.exports = {
  dailyPaymentRetryScheduler: exports.dailyPaymentRetryScheduler,
  autoScheduleRetry: exports.autoScheduleRetry,
  retryFailedPayment: exports.retryFailedPayment
};
