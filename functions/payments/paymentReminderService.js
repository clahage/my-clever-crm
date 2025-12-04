// ============================================================================
// PAYMENT REMINDER SERVICE - Email Automation for Payment Due Dates
// ============================================================================
// Sends automated reminders: 3 days before, 1 day before, and day-of payment due
// Integrates with SendGrid for reliable email delivery
// ============================================================================

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const sgMail = require('@sendgrid/mail');

// Initialize SendGrid with API key from environment
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

const db = admin.firestore();

/**
 * Email Templates for Payment Reminders
 */
const emailTemplates = {
  threeDayReminder: (clientName, amount, dueDate, paymentMethod) => ({
    subject: '⏰ Payment Reminder - Due in 3 Days',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .amount { font-size: 32px; font-weight: bold; color: #2563eb; margin: 20px 0; }
          .details { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💳 Payment Reminder</h1>
          </div>
          <div class="content">
            <p>Hi ${clientName},</p>
            <p>This is a friendly reminder that your payment is due in <strong>3 days</strong>.</p>

            <div class="details">
              <div class="detail-row">
                <span>Amount Due:</span>
                <span class="amount">$${amount.toFixed(2)}</span>
              </div>
              <div class="detail-row">
                <span>Due Date:</span>
                <span><strong>${dueDate}</strong></span>
              </div>
              <div class="detail-row">
                <span>Payment Method:</span>
                <span>${paymentMethod}</span>
              </div>
            </div>

            <p>Please ensure sufficient funds are available in your account to avoid any processing issues.</p>

            <p>If you have any questions or need to update your payment information, please log in to your client portal or contact us.</p>

            <p>Thank you for your prompt attention to this matter!</p>

            <p>Best regards,<br>
            <strong>Speedy Credit Repair Team</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated reminder from Speedy Credit Repair Inc.</p>
            <p>If you believe you received this email in error, please contact us immediately.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Hi ${clientName},\n\nYour payment of $${amount.toFixed(2)} is due in 3 days on ${dueDate}.\n\nPayment Method: ${paymentMethod}\n\nPlease ensure sufficient funds are available.\n\nBest regards,\nSpeedy Credit Repair Team`
  }),

  oneDayReminder: (clientName, amount, dueDate, paymentMethod) => ({
    subject: '🔔 Payment Due Tomorrow - Action Required',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f59e0b; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #fffbeb; padding: 30px; border-radius: 0 0 8px 8px; }
          .amount { font-size: 32px; font-weight: bold; color: #f59e0b; margin: 20px 0; }
          .details { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .urgent { background-color: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; }
          .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Payment Due Tomorrow</h1>
          </div>
          <div class="content">
            <p>Hi ${clientName},</p>

            <div class="urgent">
              <strong>⏰ Urgent:</strong> Your payment is due <strong>tomorrow</strong>!
            </div>

            <div class="details">
              <div class="detail-row">
                <span>Amount Due:</span>
                <span class="amount">$${amount.toFixed(2)}</span>
              </div>
              <div class="detail-row">
                <span>Due Date:</span>
                <span><strong>${dueDate}</strong></span>
              </div>
              <div class="detail-row">
                <span>Payment Method:</span>
                <span>${paymentMethod}</span>
              </div>
            </div>

            <p><strong>Action Required:</strong> Please verify that your payment method has sufficient funds.</p>

            <p>If you need to update your payment information or have any concerns, please contact us immediately.</p>

            <p>Thank you for your immediate attention!</p>

            <p>Best regards,<br>
            <strong>Speedy Credit Repair Team</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated reminder from Speedy Credit Repair Inc.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `URGENT: Hi ${clientName},\n\nYour payment of $${amount.toFixed(2)} is due TOMORROW on ${dueDate}.\n\nPayment Method: ${paymentMethod}\n\nPlease verify sufficient funds are available.\n\nBest regards,\nSpeedy Credit Repair Team`
  }),

  dueTodayReminder: (clientName, amount, dueDate, paymentMethod) => ({
    subject: '🚨 Payment Due Today - Immediate Action Required',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #fee2e2; padding: 30px; border-radius: 0 0 8px 8px; }
          .amount { font-size: 36px; font-weight: bold; color: #dc2626; margin: 20px 0; }
          .details { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .critical { background-color: #fecaca; padding: 20px; border-left: 4px solid #dc2626; margin: 20px 0; font-weight: bold; }
          .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚨 Payment Due TODAY</h1>
          </div>
          <div class="content">
            <p>Hi ${clientName},</p>

            <div class="critical">
              ⚠️ CRITICAL: Your payment is due <strong>TODAY</strong> - ${dueDate}
            </div>

            <div class="details">
              <div class="detail-row">
                <span>Amount Due:</span>
                <span class="amount">$${amount.toFixed(2)}</span>
              </div>
              <div class="detail-row">
                <span>Due Date:</span>
                <span><strong>TODAY - ${dueDate}</strong></span>
              </div>
              <div class="detail-row">
                <span>Payment Method:</span>
                <span>${paymentMethod}</span>
              </div>
            </div>

            <p><strong>Immediate Action Required:</strong></p>
            <ul>
              <li>Verify sufficient funds in your account</li>
              <li>Contact us immediately if there are any issues</li>
              <li>Late payments may incur additional fees</li>
            </ul>

            <p>If you have already made this payment, please disregard this reminder and thank you!</p>

            <p>For immediate assistance, please call us or reply to this email.</p>

            <p>Thank you,<br>
            <strong>Speedy Credit Repair Team</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated reminder from Speedy Credit Repair Inc.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `CRITICAL: Hi ${clientName},\n\nYour payment of $${amount.toFixed(2)} is DUE TODAY - ${dueDate}.\n\nPayment Method: ${paymentMethod}\n\nPlease ensure payment is processed immediately.\n\nContact us if you need assistance.\n\nBest regards,\nSpeedy Credit Repair Team`
  })
};

/**
 * Send email using SendGrid
 */
async function sendEmail(to, subject, html, text) {
  const msg = {
    to,
    from: {
      email: 'payments@speedycreditrepair.com',
      name: 'Speedy Credit Repair - Payments'
    },
    subject,
    text,
    html,
  };

  try {
    if (!SENDGRID_API_KEY) {
      console.warn('⚠️ SendGrid API key not configured. Email would be sent to:', to);
      console.log('Subject:', subject);
      return { success: false, reason: 'SendGrid not configured' };
    }

    await sgMail.send(msg);
    console.log('✅ Email sent successfully to:', to);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get client email from Firestore
 */
async function getClientEmail(clientId) {
  try {
    const contactDoc = await db.collection('contacts').doc(clientId).get();
    if (contactDoc.exists) {
      return contactDoc.data().email;
    }

    // Try users collection if not in contacts
    const userDoc = await db.collection('users').doc(clientId).get();
    if (userDoc.exists) {
      return userDoc.data().email;
    }

    console.error('Client not found:', clientId);
    return null;
  } catch (error) {
    console.error('Error fetching client email:', error);
    return null;
  }
}

/**
 * Calculate days until due date
 */
function daysUntilDue(dueDate) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const due = dueDate.toDate ? dueDate.toDate() : new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  const diffTime = due - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Check if reminder has already been sent
 */
function hasReminderBeenSent(payment, reminderType) {
  if (!payment.reminders) return false;
  return payment.reminders[reminderType] === true;
}

/**
 * Mark reminder as sent
 */
async function markReminderSent(paymentId, reminderType) {
  try {
    await db.collection('payments').doc(paymentId).update({
      [`reminders.${reminderType}`]: true,
      [`reminders.${reminderType}SentAt`]: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log(`✅ Marked ${reminderType} reminder as sent for payment ${paymentId}`);
  } catch (error) {
    console.error(`Error marking reminder as sent:`, error);
  }
}

/**
 * Process payment reminders for a specific time window
 */
async function processPaymentReminders(daysBeforeDue, reminderType, templateFunction) {
  console.log(`\n🔍 Checking for payments due in ${daysBeforeDue} day(s)...`);

  const now = new Date();
  const targetDate = new Date(now);
  targetDate.setDate(targetDate.getDate() + daysBeforeDue);
  targetDate.setHours(0, 0, 0, 0);

  const nextDay = new Date(targetDate);
  nextDay.setDate(nextDay.getDate() + 1);

  try {
    // Query payments due on target date with pending/scheduled status
    const paymentsSnapshot = await db.collection('payments')
      .where('dueDate', '>=', targetDate)
      .where('dueDate', '<', nextDay)
      .where('status', 'in', ['pending', 'scheduled'])
      .get();

    console.log(`📧 Found ${paymentsSnapshot.size} payment(s) to process`);

    const results = {
      total: paymentsSnapshot.size,
      sent: 0,
      skipped: 0,
      failed: 0
    };

    for (const paymentDoc of paymentsSnapshot.docs) {
      const payment = paymentDoc.data();
      const paymentId = paymentDoc.id;

      // Skip if reminder already sent
      if (hasReminderBeenSent(payment, reminderType)) {
        console.log(`⏭️ Skipping ${paymentId} - ${reminderType} reminder already sent`);
        results.skipped++;
        continue;
      }

      // Get client email
      const clientEmail = await getClientEmail(payment.clientId);
      if (!clientEmail) {
        console.error(`❌ No email found for client ${payment.clientId}`);
        results.failed++;
        continue;
      }

      // Format due date
      const dueDate = payment.dueDate.toDate().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      // Generate email content
      const emailContent = templateFunction(
        payment.clientName,
        payment.amount,
        dueDate,
        payment.paymentMethod
      );

      // Send email
      const result = await sendEmail(
        clientEmail,
        emailContent.subject,
        emailContent.html,
        emailContent.text
      );

      if (result.success) {
        results.sent++;
        await markReminderSent(paymentId, reminderType);
      } else {
        results.failed++;
      }
    }

    console.log(`\n📊 Reminder Results for ${reminderType}:`);
    console.log(`   Total: ${results.total}`);
    console.log(`   Sent: ${results.sent}`);
    console.log(`   Skipped: ${results.skipped}`);
    console.log(`   Failed: ${results.failed}`);

    return results;
  } catch (error) {
    console.error('Error processing payment reminders:', error);
    throw error;
  }
}

/**
 * Cloud Function: Daily Payment Reminder Scheduler
 * Runs every day at 9 AM EST to send payment reminders
 */
exports.dailyPaymentReminderScheduler = functions.pubsub
  .schedule('0 9 * * *')
  .timeZone('America/New_York')
  .onRun(async (context) => {
    console.log('🚀 Starting daily payment reminder scheduler...');

    try {
      // Send 3-day reminders
      const threeDayResults = await processPaymentReminders(
        3,
        'threeDayReminder',
        emailTemplates.threeDayReminder
      );

      // Send 1-day reminders
      const oneDayResults = await processPaymentReminders(
        1,
        'oneDayReminder',
        emailTemplates.oneDayReminder
      );

      // Send day-of reminders
      const dueTodayResults = await processPaymentReminders(
        0,
        'dueTodayReminder',
        emailTemplates.dueTodayReminder
      );

      console.log('\n✅ Payment reminder scheduler completed successfully');

      return {
        success: true,
        threeDayResults,
        oneDayResults,
        dueTodayResults
      };
    } catch (error) {
      console.error('❌ Payment reminder scheduler failed:', error);
      throw error;
    }
  });

/**
 * Cloud Function: Manual trigger for testing payment reminders
 * Can be called via HTTP to test the reminder system
 */
exports.testPaymentReminders = functions.https.onRequest(async (req, res) => {
  // Simple authentication check
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== 'test-payment-reminders-key') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    console.log('🧪 Running payment reminder test...');

    const threeDayResults = await processPaymentReminders(
      3,
      'threeDayReminder',
      emailTemplates.threeDayReminder
    );

    const oneDayResults = await processPaymentReminders(
      1,
      'oneDayReminder',
      emailTemplates.oneDayReminder
    );

    const dueTodayResults = await processPaymentReminders(
      0,
      'dueTodayReminder',
      emailTemplates.dueTodayReminder
    );

    res.json({
      success: true,
      message: 'Payment reminder test completed',
      results: {
        threeDayResults,
        oneDayResults,
        dueTodayResults
      }
    });
  } catch (error) {
    console.error('Error in payment reminder test:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Cloud Function: Send immediate payment reminder
 * Triggered by HTTP request for specific payment
 */
exports.sendPaymentReminder = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated and is admin
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userDoc = await db.collection('users').doc(context.auth.uid).get();
  const userRole = userDoc.data()?.role;

  if (userRole !== 'admin' && userRole !== 'masterAdmin') {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can send payment reminders');
  }

  const { paymentId, reminderType } = data;

  try {
    const paymentDoc = await db.collection('payments').doc(paymentId).get();
    if (!paymentDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Payment not found');
    }

    const payment = paymentDoc.data();
    const clientEmail = await getClientEmail(payment.clientId);

    if (!clientEmail) {
      throw new functions.https.HttpsError('failed-precondition', 'Client email not found');
    }

    const dueDate = payment.dueDate.toDate().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Select template based on reminder type
    let templateFunction;
    switch (reminderType) {
      case 'threeDayReminder':
        templateFunction = emailTemplates.threeDayReminder;
        break;
      case 'oneDayReminder':
        templateFunction = emailTemplates.oneDayReminder;
        break;
      case 'dueTodayReminder':
        templateFunction = emailTemplates.dueTodayReminder;
        break;
      default:
        throw new functions.https.HttpsError('invalid-argument', 'Invalid reminder type');
    }

    const emailContent = templateFunction(
      payment.clientName,
      payment.amount,
      dueDate,
      payment.paymentMethod
    );

    const result = await sendEmail(
      clientEmail,
      emailContent.subject,
      emailContent.html,
      emailContent.text
    );

    if (result.success) {
      await markReminderSent(paymentId, reminderType);
      return { success: true, message: 'Reminder sent successfully' };
    } else {
      throw new functions.https.HttpsError('internal', 'Failed to send email');
    }
  } catch (error) {
    console.error('Error sending payment reminder:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

module.exports = {
  dailyPaymentReminderScheduler: exports.dailyPaymentReminderScheduler,
  testPaymentReminders: exports.testPaymentReminders,
  sendPaymentReminder: exports.sendPaymentReminder
};
