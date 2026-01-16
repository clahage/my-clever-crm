/**
 * Path: /functions/operations.js
 * Operations Helper Functions
 * 
 * NOTE: These are HELPER FUNCTIONS, not Cloud Functions
 * They are called by operationsManager in index.js
 * 
 * UPDATED: January 16, 2026
 * - Added abandonment tracking (5-minute check)
 * - Removed immediate welcome email (wait for completion OR abandonment)
 * - Added enrollment completion workflow support
 * 
 * © 1995-2026 Speedy Credit Repair Inc. | Christopher Lahage | All Rights Reserved
 * Trademark: Speedy Credit Repair® - USPTO Registered
 */

const { getFirestore, FieldValue, Timestamp } = require('firebase-admin/firestore');

// ============================================
// CONFIGURATION
// ============================================
const ABANDONMENT_DELAY_MINUTES = 5;  // Send abandonment email after 5 minutes

// ============================================
// WEB LEAD CAPTURE HELPER
// Updated: January 16, 2026
// ============================================

/**
 * Capture web lead from landing page
 * Creates contact with abandonment tracking - NO immediate email
 * Email is sent either:
 *   1. After enrollment completes (welcome-new-client)
 *   2. After 5 minutes if abandoned (abandoned-cart)
 * 
 * @param {Object} data - Lead data (firstName, lastName, email, phone)
 * @param {string} userId - User ID (defaults to 'system')
 * @returns {Promise<Object>} - Result with success, contactId, existed, message
 */
async function captureWebLead(data, userId = 'system') {
  const db = getFirestore();
  
  const { firstName, lastName, email, phone } = data;
  
  console.log('📋 Capturing web lead:', { firstName, lastName, email, phone });
  
  // Validate required fields
  if (!firstName || !lastName || !email || !phone) {
    throw new Error('Missing required fields: firstName, lastName, email, phone');
  }
  
  // Normalize data
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPhone = phone.trim().replace(/\D/g, ''); // Remove non-digits
  
  // Calculate abandonment check time (5 minutes from now)
  const abandonmentCheckAt = new Date(Date.now() + ABANDONMENT_DELAY_MINUTES * 60 * 1000);
  
  // Check for existing contact with same email
  const existingSnapshot = await db.collection('contacts')
    .where('email', '==', normalizedEmail)
    .limit(1)
    .get();
  
  if (!existingSnapshot.empty) {
    const existingContact = existingSnapshot.docs[0];
    const contactId = existingContact.id;
    const contactData = existingContact.data();
    
    console.log('ℹ️  Contact already exists:', contactId);
    
    // Update enrollment status if not already enrolled
    if (contactData.enrollmentStatus !== 'enrolled' && contactData.enrollmentStatus !== 'completed') {
      await db.collection('contacts').doc(contactId).update({
        // Enrollment tracking
        enrollmentStatus: 'started',
        enrollmentStartedAt: FieldValue.serverTimestamp(),
        
        // Abandonment tracking - reset timer
        abandonmentCheckAt: Timestamp.fromDate(abandonmentCheckAt),
        abandonmentEmailSent: false,
        abandonmentCancelled: false,
        
        // Activity
        lastActivityAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      });
      
      console.log('✅ Updated existing contact - enrollment restarted, abandonment timer reset');
    }
    
    return {
      success: true,
      contactId: contactId,
      existed: true,
      message: 'Existing contact updated - enrollment restarted',
      abandonmentCheckAt: abandonmentCheckAt.toISOString()
    };
  }
  
  // Create new contact in Firestore
  const contactRef = await db.collection('contacts').add({
    // ===== BASIC INFO =====
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: normalizedEmail,
    phone: normalizedPhone,
    
    // ===== ROLE SETUP =====
    roles: ['contact', 'lead'],
    primaryRole: 'lead',
    
    // ===== LEAD TRACKING =====
    leadSource: 'website',
    leadStatus: 'new',
    leadScore: 5, // Initial score
    
    // ===== ENROLLMENT TRACKING =====
    enrollmentStatus: 'started',
    enrollmentStartedAt: FieldValue.serverTimestamp(),
    enrollmentCompletedAt: null,
    
    // ===== ABANDONMENT TRACKING (NEW) =====
    abandonmentCheckAt: Timestamp.fromDate(abandonmentCheckAt),
    abandonmentEmailSent: false,
    abandonmentCancelled: false,
    
    // ===== EMAIL WORKFLOW TRACKING =====
    welcomeEmailSent: false,
    welcomeEmailSentAt: null,
    
    // ===== ACTIVITY TRACKING =====
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    lastActivityAt: FieldValue.serverTimestamp(),
    
    // ===== COMMUNICATION PREFERENCES =====
    emailOptIn: true,
    smsOptIn: true,
    
    // ===== FLAGS =====
    isActive: true,
    isTest: false,
    
    // ===== METADATA =====
    createdBy: 'web-landing-page',
    createdVia: 'landing-page-form'
  });
  
  const contactId = contactRef.id;
  
  console.log('✅ Contact created:', contactId);
  console.log(`⏰ Abandonment check scheduled for: ${abandonmentCheckAt.toISOString()}`);
  
  // ===== NO IMMEDIATE WELCOME EMAIL =====
  // Email will be sent by:
  // 1. processAbandonmentEmails (if not completed in 5 min) → abandoned-cart
  // 2. onContactUpdated (if enrollment completes) → welcome-new-client
  
  // Create initial task for follow-up
  try {
    await db.collection('tasks').add({
      title: `Follow up with new lead: ${firstName} ${lastName}`,
      description: `New lead captured from website.\n\nEmail: ${normalizedEmail}\nPhone: ${normalizedPhone}\n\nAbandon check at: ${abandonmentCheckAt.toISOString()}`,
      assignedTo: null,
      assignedBy: 'system',
      priority: 'high',
      status: 'pending',
      category: 'auto_lead',
      clientId: contactId,
      contactId: contactId,
      tags: ['web-lead', 'new-lead', 'follow-up', 'abandonment-tracking'],
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      completedAt: null,
      completedBy: null,
      comments: [],
      attachments: []
    });
    
    console.log('✅ Follow-up task created');
  } catch (taskErr) {
    console.error('⚠️  Task creation failed (non-blocking):', taskErr);
  }
  
  // Log to activity for tracking
  try {
    await db.collection('activityLogs').add({
      type: 'lead_captured',
      contactId: contactId,
      action: 'web_form_submission',
      details: {
        source: 'landing-page',
        abandonmentCheckAt: abandonmentCheckAt.toISOString(),
        email: normalizedEmail
      },
      createdAt: FieldValue.serverTimestamp(),
      createdBy: 'system'
    });
  } catch (logErr) {
    console.error('⚠️  Activity log failed (non-blocking):', logErr);
  }
  
  return {
    success: true,
    contactId: contactId,
    existed: false,
    message: 'Lead captured successfully - abandonment tracking active',
    abandonmentCheckAt: abandonmentCheckAt.toISOString()
  };
}


// ============================================
// SEND ABANDONMENT EMAIL HELPER
// Called by processAbandonmentEmails in index.js
// ============================================

/**
 * Send abandonment email for a specific contact
 * @param {string} contactId - Contact document ID
 * @param {Object} contactData - Contact data from Firestore
 * @param {Object} transporter - Nodemailer transporter
 * @param {Object} emailConfig - Email configuration (from, name, etc.)
 * @returns {Promise<Object>} - Result with success status
 */
async function sendAbandonmentEmail(contactId, contactData, transporter, emailConfig) {
  const db = getFirestore();
  
  const { firstName, lastName, email } = contactData;
  
  console.log(`📧 Sending abandonment email to: ${email}`);
  
  // Build the email
  const subject = `${firstName}, your free credit analysis is waiting`;
  
  const htmlContent = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
    
    <!-- HEADER -->
    <tr>
      <td style="background: linear-gradient(135deg, #009900 0%, #006600 100%); padding: 30px 40px; text-align: center;">
        <h1 style="margin: 0; color: #ffffff; font-size: 24px;">⚡ Speedy Credit Repair</h1>
        <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 13px;">Established 1995 | A+ BBB Rating | 4.9★ Google Reviews</p>
      </td>
    </tr>
    
    <!-- CONTENT -->
    <tr>
      <td style="padding: 35px 40px;">
        <p style="margin: 0 0 20px; color: #1f2937; font-size: 17px; font-weight: 600;">Hi ${firstName},</p>
        
        <p style="margin: 0 0 15px; color: #374151; font-size: 16px; line-height: 1.6;">
          I noticed you started your <strong>free credit analysis</strong> but didn't get a chance to finish. 
          No worries—your information is saved and ready for you!
        </p>
        
        <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
          It only takes <strong>2 more minutes</strong> to complete, and you'll get:
        </p>
        
        <ul style="margin: 0 0 25px; padding-left: 20px; color: #374151; font-size: 15px; line-height: 1.8;">
          <li>✅ Your complete 3-bureau credit report</li>
          <li>✅ Your credit scores from all 3 bureaus</li>
          <li>✅ Personalized analysis of negative items</li>
          <li>✅ Custom strategy to improve your credit</li>
        </ul>
        
        <!-- CTA BUTTON -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 30px auto;">
          <tr>
            <td style="background: linear-gradient(135deg, #009900 0%, #006600 100%); border-radius: 8px;">
              <a href="https://myclevercrm.com/complete-enrollment?contactId=${contactId}&source=abandonment-email" 
                 style="display: inline-block; padding: 16px 40px; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 16px;">
                Complete My Free Analysis →
              </a>
            </td>
          </tr>
        </table>
        
        <p style="margin: 25px 0 15px; color: #374151; font-size: 16px; line-height: 1.6;">
          Questions? Just reply to this email or call us at 
          <a href="tel:+18887247344" style="color: #009900; font-weight: 600;">1-888-724-7344</a>.
        </p>
        
        <p style="margin: 25px 0 0 0; color: #374151; font-size: 16px;">
          Looking forward to helping you,<br/>
          <strong style="color: #1f2937;">Chris Lahage</strong><br/>
          <span style="color: #6b7280; font-size: 14px;">Founder & CEO, Speedy Credit Repair</span>
        </p>
      </td>
    </tr>
    
    <!-- FOOTER -->
    <tr>
      <td style="background-color: #f9fafb; padding: 25px 40px; border-top: 1px solid #e5e7eb; text-align: center;">
        <p style="margin: 0 0 8px; color: #374151; font-size: 14px; font-weight: bold;">Speedy Credit Repair Inc.</p>
        <p style="margin: 0 0 5px; color: #6b7280; font-size: 13px;">📞 (888) 724-7344 | 📧 contact@speedycreditrepair.com</p>
        <p style="margin: 0 0 5px; color: #6b7280; font-size: 13px;">117 Main St #202, Huntington Beach, CA 92648</p>
        <p style="margin: 15px 0 0; color: #9ca3af; font-size: 11px;">© 1995-${new Date().getFullYear()} Speedy Credit Repair Inc. | All Rights Reserved</p>
      </td>
    </tr>
    
  </table>
</body>
</html>
  `;
  
  try {
    // Send email
    const mailResult = await transporter.sendMail({
      from: `"${emailConfig.fromName}" <${emailConfig.fromEmail}>`,
      to: email,
      replyTo: emailConfig.replyTo,
      subject: subject,
      html: htmlContent
    });
    
    console.log(`✅ Abandonment email sent to ${email}:`, mailResult.messageId);
    
    // Update contact - mark abandonment email as sent
    await db.collection('contacts').doc(contactId).update({
      abandonmentEmailSent: true,
      abandonmentEmailSentAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });
    
    // Log to email history
    await db.collection('emailHistory').add({
      contactId: contactId,
      to: email,
      subject: subject,
      template: 'abandonment-5min',
      type: 'abandonment',
      status: 'sent',
      messageId: mailResult.messageId,
      sentAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp()
    });
    
    // Log activity
    await db.collection('activityLogs').add({
      type: 'email_sent',
      contactId: contactId,
      action: 'abandonment_email_sent',
      details: {
        template: 'abandonment-5min',
        email: email,
        messageId: mailResult.messageId
      },
      createdAt: FieldValue.serverTimestamp(),
      createdBy: 'system'
    });
    
    return {
      success: true,
      messageId: mailResult.messageId,
      email: email
    };
    
  } catch (error) {
    console.error(`❌ Failed to send abandonment email to ${email}:`, error);
    
    // Log the failure
    await db.collection('emailHistory').add({
      contactId: contactId,
      to: email,
      subject: subject,
      template: 'abandonment-5min',
      type: 'abandonment',
      status: 'failed',
      error: error.message,
      createdAt: FieldValue.serverTimestamp()
    });
    
    return {
      success: false,
      error: error.message,
      email: email
    };
  }
}


// ============================================
// SEND WELCOME CLIENT EMAIL HELPER
// Called by onContactUpdated in index.js when enrollment completes
// ============================================

/**
 * Send welcome email after enrollment completes
 * @param {string} contactId - Contact document ID
 * @param {Object} contactData - Contact data from Firestore
 * @param {Object} transporter - Nodemailer transporter
 * @param {Object} emailConfig - Email configuration (from, name, etc.)
 * @returns {Promise<Object>} - Result with success status
 */
async function sendWelcomeClientEmail(contactId, contactData, transporter, emailConfig) {
  const db = getFirestore();
  
  const { firstName, lastName, email } = contactData;
  
  console.log(`🎉 Sending welcome client email to: ${email}`);
  
  // Build the email
  const subject = `Welcome to the Speedy family, ${firstName}! Let's get started`;
  
  const htmlContent = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
    
    <!-- HEADER -->
    <tr>
      <td style="background: linear-gradient(135deg, #009900 0%, #006600 100%); padding: 30px 40px; text-align: center;">
        <h1 style="margin: 0; color: #ffffff; font-size: 24px;">🎉 Welcome to Speedy Credit Repair!</h1>
        <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 13px;">Established 1995 | A+ BBB Rating | 4.9★ Google Reviews</p>
      </td>
    </tr>
    
    <!-- CONTENT -->
    <tr>
      <td style="padding: 35px 40px;">
        <p style="margin: 0 0 20px; color: #1f2937; font-size: 17px; font-weight: 600;">Congratulations ${firstName}!</p>
        
        <div style="background-color: #ecfdf5; border-left: 4px solid #059669; padding: 15px 20px; margin: 0 0 25px; border-radius: 0 8px 8px 0;">
          <p style="margin: 0; color: #059669; font-weight: 700; font-size: 16px;">✅ Your Enrollment is Complete!</p>
          <p style="margin: 8px 0 0; color: #047857; font-size: 14px;">
            We've received your credit report and our team is already analyzing it.
          </p>
        </div>
        
        <p style="margin: 0 0 15px; color: #374151; font-size: 16px; line-height: 1.6;">
          Thank you for trusting us with your credit repair journey. You've taken an important first step, 
          and we're committed to helping you achieve your credit goals.
        </p>
        
        <h2 style="margin: 25px 0 15px; color: #1f2937; font-size: 18px;">What Happens Next:</h2>
        
        <ol style="margin: 0 0 25px; padding-left: 20px; color: #374151; font-size: 15px; line-height: 2;">
          <li><strong>Week 1:</strong> We complete our analysis and prepare your dispute strategy</li>
          <li><strong>Weeks 2-4:</strong> Disputes are sent to credit bureaus and creditors</li>
          <li><strong>Days 30-45:</strong> You'll start seeing responses and potential deletions</li>
          <li><strong>Ongoing:</strong> We continue working until all negative items are addressed</li>
        </ol>
        
        <!-- CTA BUTTON -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 30px auto;">
          <tr>
            <td style="background: linear-gradient(135deg, #009900 0%, #006600 100%); border-radius: 8px;">
              <a href="https://myclevercrm.com/portal?contactId=${contactId}" 
                 style="display: inline-block; padding: 16px 40px; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 16px;">
                🔐 Access Your Client Portal
              </a>
            </td>
          </tr>
        </table>
        
        <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
          <p style="margin: 0; color: #92400e; font-weight: 700; font-size: 14px;">📮 Important: Watch Your Mail!</p>
          <p style="margin: 8px 0 0; color: #92400e; font-size: 13px;">
            You'll receive response letters from credit bureaus. Please scan and upload them to your portal 
            or forward them to us immediately.
          </p>
        </div>
        
        <p style="margin: 25px 0 15px; color: #374151; font-size: 16px; line-height: 1.6;">
          Questions? Call us anytime at 
          <a href="tel:+18887247344" style="color: #009900; font-weight: 600;">1-888-724-7344</a> 
          or reply to this email.
        </p>
        
        <p style="margin: 25px 0 0 0; color: #374151; font-size: 16px;">
          Let's do this!<br/>
          <strong style="color: #1f2937;">Chris Lahage</strong> and the Speedy Team
        </p>
      </td>
    </tr>
    
    <!-- FOOTER -->
    <tr>
      <td style="background-color: #f9fafb; padding: 25px 40px; border-top: 1px solid #e5e7eb; text-align: center;">
        <p style="margin: 0 0 8px; color: #374151; font-size: 14px; font-weight: bold;">Speedy Credit Repair Inc.</p>
        <p style="margin: 0 0 5px; color: #6b7280; font-size: 13px;">📞 (888) 724-7344 | 📧 contact@speedycreditrepair.com</p>
        <p style="margin: 0 0 5px; color: #6b7280; font-size: 13px;">117 Main St #202, Huntington Beach, CA 92648</p>
        <p style="margin: 15px 0 0; color: #9ca3af; font-size: 11px;">© 1995-${new Date().getFullYear()} Speedy Credit Repair Inc. | All Rights Reserved</p>
      </td>
    </tr>
    
  </table>
</body>
</html>
  `;
  
  try {
    // Send email
    const mailResult = await transporter.sendMail({
      from: `"${emailConfig.fromName}" <${emailConfig.fromEmail}>`,
      to: email,
      replyTo: emailConfig.replyTo,
      subject: subject,
      html: htmlContent
    });
    
    console.log(`✅ Welcome client email sent to ${email}:`, mailResult.messageId);
    
    // Update contact - mark welcome email as sent, cancel abandonment
    await db.collection('contacts').doc(contactId).update({
      welcomeEmailSent: true,
      welcomeEmailSentAt: FieldValue.serverTimestamp(),
      abandonmentCancelled: true,
      updatedAt: FieldValue.serverTimestamp()
    });
    
    // Log to email history
    await db.collection('emailHistory').add({
      contactId: contactId,
      to: email,
      subject: subject,
      template: 'welcome-new-client',
      type: 'welcome',
      status: 'sent',
      messageId: mailResult.messageId,
      sentAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp()
    });
    
    // Log activity
    await db.collection('activityLogs').add({
      type: 'email_sent',
      contactId: contactId,
      action: 'welcome_client_email_sent',
      details: {
        template: 'welcome-new-client',
        email: email,
        messageId: mailResult.messageId
      },
      createdAt: FieldValue.serverTimestamp(),
      createdBy: 'system'
    });
    
    return {
      success: true,
      messageId: mailResult.messageId,
      email: email
    };
    
  } catch (error) {
    console.error(`❌ Failed to send welcome client email to ${email}:`, error);
    
    // Log the failure
    await db.collection('emailHistory').add({
      contactId: contactId,
      to: email,
      subject: subject,
      template: 'welcome-new-client',
      type: 'welcome',
      status: 'failed',
      error: error.message,
      createdAt: FieldValue.serverTimestamp()
    });
    
    return {
      success: false,
      error: error.message,
      email: email
    };
  }
}


// ============================================
// EXPORTS - Helper functions for index.js
// ============================================

module.exports = {
  captureWebLead,
  sendAbandonmentEmail,
  sendWelcomeClientEmail,
  ABANDONMENT_DELAY_MINUTES
};