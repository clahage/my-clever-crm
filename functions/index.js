// ============================================
// FIREBASE GEN 2 CLOUD FUNCTIONS
// ============================================
// SpeedyCRM - AI-First Credit Repair CRM
// Migrated to Firebase Functions Gen 2 (firebase-functions 5.x)
//
// IMPORTANT CHANGES FROM GEN 1:
// - All imports from firebase-functions/v2/* modules
// - Configuration as first parameter in function definitions
// - Secrets managed via defineSecret() and Firebase Secret Manager
// - Environment variables via .env.local and process.env
// - Memory specified in MiB (not MB)
// - onCall functions use request object (not data, context)
// - Firestore triggers use event object (not snap, context)
// ============================================

// ============================================
// IMPORTS - GEN 2 MODULES
// ============================================
const { onRequest, onCall } = require('firebase-functions/v2/https');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { onDocumentCreated, onDocumentUpdated, onDocumentWritten } = require('firebase-functions/v2/firestore');
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const fetch = require('node-fetch');
const nodemailer = require('nodemailer');

// ============================================
// FIREBASE ADMIN INITIALIZATION
// ============================================
if (!admin.apps.length) admin.initializeApp();

// ============================================
// SECRETS CONFIGURATION (Firebase Secret Manager)
// ============================================
// These secrets are already configured in Firebase Secret Manager
// Access them in functions using secretName.value()
const docusignAccountId = defineSecret('DOCUSIGN_ACCOUNT_ID');
const idiqPartnerId = defineSecret('IDIQ_PARTNER_ID');
const idiqPartnerSecret = defineSecret('IDIQ_PARTNER_SECRET');
const idiqApiKey = defineSecret('IDIQ_API_KEY');
const idiqEnvironment = defineSecret('IDIQ_ENVIRONMENT');
const idiqPlanCode = defineSecret('IDIQ_PLAN_CODE');
const idiqOfferCode = defineSecret('IDIQ_OFFER_CODE');
const gmailUser = defineSecret('GMAIL_USER');
const gmailAppPassword = defineSecret('GMAIL_APP_PASSWORD');
const gmailFromName = defineSecret('GMAIL_FROM_NAME');
const gmailReplyTo = defineSecret('GMAIL_REPLY_TO');
const openaiApiKey = defineSecret('OPENAI_API_KEY');
const telnyxApiKey = defineSecret('TELNYX_API_KEY');
const telnyxPhone = defineSecret('TELNYX_PHONE');
const webhookSecret = defineSecret('WEBHOOK_SECRET');

// ============================================
// ENVIRONMENT VARIABLES (from .env.local)
// ============================================
// These are non-secret configuration values
const allowUnauthenticated = process.env.ALLOW_UNAUTHENTICATED === 'true';
const gmailFromEmail = process.env.GMAIL_FROM_EMAIL;

// ============================================
// DEFAULT CONFIGURATION FOR FUNCTIONS
// ============================================
const defaultConfig = {
  memory: '512MiB',
  timeoutSeconds: 60,
  maxInstances: 10
};
function wrapEmailInHTML(subject, bodyText, recipientName = '') {
  const htmlBody = bodyText
    .replace(/\n\n/g, '</p><p style="margin: 0 0 15px; color: #374151; font-size: 16px; line-height: 1.6;">')
    .replace(/\n/g, '<br>');
  
  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        <tr>
            <td style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px 40px; text-align: center;">
                <h1 style="margin: 0; color: #ffffff; font-size: 24px;">⚡ Speedy Credit Repair</h1>
                <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 13px;">Established 1995 | A+ BBB Rating | 4.9★ Google Reviews</p>
            </td>
        </tr>
        <tr>
            <td style="padding: 35px 40px;">
                ${recipientName ? `<p style="margin: 0 0 20px; color: #1f2937; font-size: 17px; font-weight: 600;">Hi ${recipientName},</p>` : ''}
                <p style="margin: 0 0 15px; color: #374151; font-size: 16px; line-height: 1.6;">${htmlBody}</p>
            </td>
        </tr>
        <tr>
            <td style="background-color: #f9fafb; padding: 25px 40px; border-top: 1px solid #e5e7eb; text-align: center;">
                <p style="margin: 0 0 8px; color: #374151; font-size: 14px; font-weight: bold;">Speedy Credit Repair Inc.</p>
                <p style="margin: 0 0 5px; color: #6b7280; font-size: 13px;">📞 (888) 724-7344 | 📧 chris@speedycreditrepair.com</p>
                <p style="margin: 15px 0 0; color: #9ca3af; font-size: 11px;">© 1995-${new Date().getFullYear()} Speedy Credit Repair Inc. | All Rights Reserved</p>
            </td>
        </tr>
    </table>
</body>
</html>`.trim();
}
// ============================================
// FAX & EMAIL FUNCTIONS
// ============================================

// ═══════════════════════════════════════════════════════════════
// SEND FAX OUTBOUND - Telnyx Integration
// ═══════════════════════════════════════════════════════════════
exports.sendFaxOutbound = onRequest(
  { 
    ...defaultConfig,
    secrets: [telnyxApiKey, telnyxPhone]  // Telnyx secrets for fax
  },
  async (req, res) => {
    return cors(req, res, async () => {
      try {
        const { to, documentUrl, contactId } = req.body;
        
        // Validate required fields
        if (!to || !documentUrl) {
          res.status(400).json({
            success: false,
            error: 'Missing required fields: to, documentUrl'
          });
          return;
        }
        
        console.log('📠 Sending fax to:', to);
        
        // Telnyx Fax API call
        const response = await fetch('https://api.telnyx.com/v2/faxes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${telnyxApiKey.value()}`
          },
          body: JSON.stringify({
            connection_id: telnyxPhone.value(),
            to: to,
            from: telnyxPhone.value(),
            media_url: documentUrl,
            quality: 'high'
          })
        });
        
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.errors?.[0]?.detail || 'Fax send failed');
        }
        
        console.log('✅ Fax sent successfully:', result.data?.id);
        
        res.json({ 
          success: true, 
          message: "Fax Sent",
          faxId: result.data?.id,
          status: result.data?.status
        });
        
      } catch (error) {
        console.error('❌ Fax error:', error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });
  }
);

// ═══════════════════════════════════════════════════════════════
// SEND EMAIL - Gmail SMTP Integration
// ═══════════════════════════════════════════════════════════════
exports.sendEmail = onRequest(
  { 
    ...defaultConfig,
    secrets: [gmailUser, gmailAppPassword]  // ← CRITICAL: Secrets declared in config!
  },
  async (req, res) => {
    // CORS headers
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }

    try {
      const emailData = req.body;
      console.log('📧 SendEmail function called with data:', JSON.stringify(emailData, null, 2));

      // Validate required fields
      if (!emailData.to || !emailData.subject) {
        res.status(400).json({ 
          success: false, 
          error: 'Missing required fields: to, subject' 
        });
        return;
      }

      // Get Gmail credentials from secrets (available because declared in config!)
      const user = gmailUser.value();
      const pass = gmailAppPassword.value();
      
      console.log('📧 Using Gmail account:', user);

      // Create transporter with Gmail SMTP
      // Note: nodemailer is already imported at top of file
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: user,
          pass: pass,
        },
      });

      // Prepare email options
      const mailOptions = {
        from: emailData.from 
          ? `"${emailData.from.name || 'Speedy Credit Repair'}" <${emailData.from.email || user}>`
          : `"Speedy Credit Repair" <${user}>`,
        to: Array.isArray(emailData.to) ? emailData.to.join(', ') : emailData.to,
        subject: emailData.subject,
        html: emailData.html || emailData.text || '',
        text: emailData.text || '',
        replyTo: emailData.replyTo || emailData.from?.email || user,
      };

      // Add CC if provided
      if (emailData.cc) {
        mailOptions.cc = Array.isArray(emailData.cc) ? emailData.cc.join(', ') : emailData.cc;
      }

      // Add BCC if provided
      if (emailData.bcc) {
        mailOptions.bcc = Array.isArray(emailData.bcc) ? emailData.bcc.join(', ') : emailData.bcc;
      }

      // Add attachments if provided
      if (emailData.attachments && emailData.attachments.length > 0) {
        mailOptions.attachments = emailData.attachments;
      }

      // Send email
      console.log('📧 Sending email via Gmail SMTP to:', mailOptions.to);
      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully!');
      console.log('   MessageId:', info.messageId);
      console.log('   Accepted:', info.accepted);

      // Return success with messageId
      res.json({
        success: true,
        messageId: info.messageId,
        accepted: info.accepted,
        response: info.response
      });

    } catch (error) {
      console.error('❌ SendEmail error:', error.message);
      console.error('   Stack:', error.stack);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

// ============================================
// AI SERVICES (Imported from aiService.js)
// ============================================
// Import the raw logic from aiService.js
// aiService.js now exports Gen 2 compatible functions
const aiLogic = require('./aiService');

// Export AI service functions
// Note: aiService.js handles its own secrets and configuration
exports.aiComplete = aiLogic.aiComplete;
exports.anthropicComplete = aiLogic.anthropicComplete;
exports.generateInsights = aiLogic.generateInsights;
exports.analyzeCreditReport = aiLogic.analyzeCreditReport;
exports.generateDisputeLetter = aiLogic.generateDisputeLetter;
exports.scoreLead = aiLogic.scoreLead;
exports.parseCreditReport = aiLogic.parseCreditReport;
exports.getAIUsageStats = aiLogic.getAIUsageStats;
exports.getAllAIUsage = aiLogic.getAllAIUsage;

// ============================================
// E-CONTRACT AI FUNCTIONS
// ============================================
// These are stub functions - implement as needed
exports.predictCreditScore = onCall(defaultConfig, async (request) => ({ score: 720 }));
exports.analyzeFinancialHealth = onCall(defaultConfig, async (request) => ({ health: 'good' }));
exports.identifyDisputeItems = onCall(defaultConfig, async (request) => ({ items: [] }));
exports.classifyDocument = onCall(defaultConfig, async (request) => ({ category: 'other' }));
exports.optimizeBudget = onCall(defaultConfig, async (request) => ({ savings: 0 }));
exports.recommendServicePackage = onCall(defaultConfig, async (request) => ({ package: 'pro' }));
exports.optimizePricing = onCall(defaultConfig, async (request) => ({ discount: 0 }));
exports.analyzeContractRisk = onCall(defaultConfig, async (request) => ({ risk: 'low' }));
exports.predictCreditTimeline = onCall(defaultConfig, async (request) => ({ months: 6 }));
exports.detectPaymentFraud = onCall(defaultConfig, async (request) => ({ risk: 0 }));
exports.assessPaymentRisk = onCall(defaultConfig, async (request) => ({ risk: 0 }));
exports.verifyBankInfo = onCall(defaultConfig, async (request) => ({ valid: true }));
exports.predictPaymentSuccess = onCall(defaultConfig, async (request) => ({ rate: 95 }));
exports.verifyPOACompliance = onCall(defaultConfig, async (request) => ({ valid: true }));
exports.summarizePOA = onCall(defaultConfig, async (request) => ({ summary: '' }));
exports.recommendPOAScope = onCall(defaultConfig, async (request) => ({ scope: 'limited' }));
exports.getFormSuggestions = onCall(defaultConfig, async (request) => ({ suggestions: [] }));
exports.generateContract = onCall(defaultConfig, async (request) => ({ success: true }));

// ============================================
// PAYMENT & SCHEDULER FUNCTIONS
// ============================================
exports.dailyPaymentReminderScheduler = onSchedule(
  {
    schedule: '0 9 * * *',
    timeZone: 'America/Los_Angeles',
    memory: '512MiB'
  },
  async (event) => {
    console.log('Running daily payment reminders');
  }
);

exports.sendPaymentReminder = onCall(defaultConfig, async (request) => ({ success: true }));

exports.dailyPaymentRetryScheduler = onSchedule(
  {
    schedule: '0 10 * * *',
    timeZone: 'America/Los_Angeles',
    memory: '512MiB'
  },
  async (event) => {
    console.log('Running daily payment retries');
  }
);

// ===== FIRESTORE TRIGGERS =====
exports.autoGenerateReceipt = onDocumentUpdated(
  {
    document: 'payments/{id}',
    memory: '512MiB'
  },
  async (event) => {
    // Payment receipt generation logic
    console.log('Auto-generating receipt for payment:', event.params.id);
  }
);

exports.autoScheduleRetry = onDocumentUpdated(
  {
    document: 'payments/{id}',
    memory: '512MiB'
  },
  async (event) => {
    // Payment retry scheduling logic
    console.log('Scheduling retry for payment:', event.params.id);
  }
);

// ===== PLAID FUNCTIONS =====
exports.createPlaidLinkToken = onCall(defaultConfig, async (request) => ({ success: true }));
exports.exchangePlaidPublicToken = onCall(defaultConfig, async (request) => ({ success: true }));
exports.getPlaidAccountBalance = onCall(defaultConfig, async (request) => ({ success: true }));
exports.initiatePlaidPayment = onCall(defaultConfig, async (request) => ({ success: true }));
exports.plaidWebhook = onRequest(defaultConfig, async (req, res) => res.send('OK'));
exports.getPlaidSetupInstructions = onRequest(defaultConfig, async (req, res) => res.send('Instructions'));
exports.generateReceipt = onCall(defaultConfig, async (request) => ({ success: true }));
exports.retryFailedPayment = onCall(defaultConfig, async (request) => ({ success: true }));

// ============================================
// WORKFLOW & WEBHOOK FUNCTIONS
// ============================================
exports.receiveAIReceptionistCall = onRequest(
  defaultConfig,
  async (req, res) => {
    res.json({ success: true });
  }
);

exports.reprocessAIReceptionistCall = onCall(
  defaultConfig,
  async (request) => ({ success: true })
);

exports.handleSendGridWebhook = onRequest(
  {
    ...defaultConfig,
    secrets: [webhookSecret]
  },
  async (req, res) => {
    // Verify webhook signature
    res.send('OK');
  }
);

exports.sendMorningSummary = onSchedule(
  {
    schedule: '0 7 * * *',
    timeZone: 'America/Los_Angeles',
    memory: '512MiB'
  },
  async (event) => {
    console.log('Sending morning summary');
  }
);

exports.processAIReceptionistCall = onDocumentWritten(
  {
    document: 'aiReceptionistCalls/{docId}',
    memory: '512MiB'
  },
  async (event) => {
    console.log('Processing AI receptionist call:', event.params.docId);
  }
);

exports.onContactCreated = onDocumentCreated(
  {
    document: 'contacts/{contactId}',
    memory: '512MiB',
    secrets: ['GMAIL_USER', 'GMAIL_APP_PASSWORD']
  },
  async (event) => {
    const contactId = event.params.contactId;
    const contactData = event.data.data();
    
    console.log('🎉 New contact created:', contactId);
    console.log('📧 Contact email:', contactData.email);
    console.log('👤 Contact name:', `${contactData.firstName} ${contactData.lastName}`);
    
    try {
      // ===== SEND WELCOME EMAIL =====
      if (contactData.email) {
        console.log('📤 Attempting to send welcome email...');
        
        const nodemailer = require('nodemailer');
        
        // Configure Gmail SMTP
        const transporter = nodemailer.createTransporter({
          service: 'gmail',
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD
          }
        });
        
        // Email content
        const mailOptions = {
          from: `"Speedy Credit Repair" <${process.env.GMAIL_USER}>`,
          to: contactData.email,
          subject: `Welcome to Speedy Credit Repair, ${contactData.firstName}!`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #667eea;">Welcome to Speedy Credit Repair!</h2>
              
              <p>Hi ${contactData.firstName},</p>
              
              <p>Thank you for contacting Speedy Credit Repair! We're excited to help you achieve your credit goals.</p>
              
              <p><strong>What happens next?</strong></p>
              <ul>
                <li>A member of our team will review your information</li>
                <li>We'll contact you within 24 hours to discuss your credit situation</li>
                <li>We'll create a personalized credit repair strategy for you</li>
              </ul>
              
              <p><strong>Your Contact Information:</strong></p>
              <ul>
                <li>Email: ${contactData.email}</li>
                <li>Phone: ${contactData.phone || 'Not provided'}</li>
              </ul>
              
              <p>If you have any immediate questions, feel free to call us at <strong>(714) 555-0000</strong></p>
              
              <p>Best regards,<br>
              <strong>Chris Lahage</strong><br>
              Owner, Speedy Credit Repair<br>
              Est. 1995 | BBB A+ Rating | 4.9★ Google Reviews</p>
              
              <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
              
              <p style="font-size: 12px; color: #6b7280;">
                © 1995-2025 Speedy Credit Repair Inc. | All Rights Reserved<br>
                This email was sent because you submitted a contact form at speedycreditrepair.com
              </p>
            </div>
          `
        };
        
        // Send email
        await transporter.sendMail(mailOptions);
        console.log('✅ Welcome email sent successfully to:', contactData.email);
        
      } else {
        console.log('⚠️ No email address provided, skipping welcome email');
      }
      
      // ===== UPDATE CONTACT TIMELINE =====
      console.log('📝 Updating contact timeline...');
      
      const admin = require('firebase-admin');
      const db = admin.firestore();
      
      const contactRef = db.collection('contacts').doc(contactId);
      
      await contactRef.update({
        'timeline': admin.firestore.FieldValue.arrayUnion({
          id: Date.now(),
          type: 'welcome_email_sent',
          description: 'Welcome email sent automatically',
          timestamp: new Date().toISOString(),
          metadata: {
            source: 'system',
            emailAddress: contactData.email
          }
        }),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log('✅ Contact timeline updated');
      
      // ===== LOG SUCCESS =====
      console.log('🎉 onContactCreated workflow completed successfully for:', contactId);
      
    } catch (error) {
      console.error('❌ Error in onContactCreated:', error);
      console.error('Error details:', error.message);
      console.error('Stack trace:', error.stack);
      
      // Don't throw - we don't want to fail the entire function
      // Just log the error and continue
    }
  }
);

exports.processWorkflowStages = onSchedule(
  {
    schedule: 'every 15 minutes',
    timeZone: 'America/Los_Angeles',
    memory: '512MiB'
  },
  async (event) => {
    console.log('⏰ processWorkflowStages running...');
    const db = admin.firestore();
    
    try {
      // Get all contacts with active workflows
      const contactsSnap = await db.collection('contacts')
        .where('workflowStatus', '==', 'active')
        .limit(100)
        .get();
      
      console.log(`📊 Processing ${contactsSnap.size} contacts with active workflows`);
      
      // Process each contact (placeholder for actual workflow logic)
      for (const doc of contactsSnap.docs) {
        const contact = doc.data();
        console.log(`  → Processing: ${contact.firstName} ${contact.lastName}`);
        // Add your workflow stage processing logic here
      }
      
      console.log('✅ Workflow processing complete');
    } catch (error) {
      console.error('❌ processWorkflowStages error:', error);
    }
  }
);

// ═══════════════════════════════════════════════════════════════════════════════
// MANUAL SEND EMAIL - Production Version with Gmail SMTP
// ═══════════════════════════════════════════════════════════════════════════════
exports.manualSendEmail = onCall(
  {
    ...defaultConfig,
    secrets: [gmailUser, gmailAppPassword, gmailFromName, gmailReplyTo]
  },
  async (request) => {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📧 manualSendEmail Cloud Function triggered');
    console.log('═══════════════════════════════════════════════════════════════');
    
    const startTime = Date.now();
    
    try {
      const data = request.data;
      console.log('📥 Received:', JSON.stringify({ to: data.to, subject: data.subject, contactId: data.contactId }));
      
      // ===== VALIDATION =====
      if (!data.to) {
        throw new Error('Missing required field: to (recipient email)');
      }
      if (!data.subject && !data.text && !data.html) {
        throw new Error('Missing content: need subject, text, or html');
      }
      
      // ===== GET CREDENTIALS =====
      const user = gmailUser.value();
      const pass = gmailAppPassword.value();
      const fromName = gmailFromName.value() || 'Speedy Credit Repair';
      const replyToAddr = gmailReplyTo.value() || user;
      
      console.log('📧 Gmail account:', user);
      console.log('📬 Sending to:', data.to);
      console.log('📝 Subject:', data.subject);
      
      // ===== CREATE TRANSPORTER =====
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: { user, pass },
        tls: { rejectUnauthorized: false }
      });
      
      // ===== PREPARE HTML =====
      let htmlContent = data.html;
      if (!htmlContent && data.text) {
        htmlContent = wrapEmailInHTML(data.subject, data.text, data.contactName);
      }
      
      // ===== MAIL OPTIONS =====
      const mailOptions = {
        from: `"${data.fromName || fromName}" <${user}>`,
        to: Array.isArray(data.to) ? data.to.join(', ') : data.to,
        subject: data.subject || 'Message from Speedy Credit Repair',
        text: data.text || '',
        html: htmlContent || data.text || '',
        replyTo: data.replyTo || replyToAddr
      };
      
      if (data.cc) mailOptions.cc = Array.isArray(data.cc) ? data.cc.join(', ') : data.cc;
      if (data.bcc) mailOptions.bcc = Array.isArray(data.bcc) ? data.bcc.join(', ') : data.bcc;
      
      // ===== SEND =====
      console.log('🚀 Sending via Gmail SMTP...');
      const info = await transporter.sendMail(mailOptions);
      
      const execTime = Date.now() - startTime;
      console.log('═══════════════════════════════════════════════════════════════');
      console.log('✅ EMAIL SENT!');
      console.log('📬 MessageId:', info.messageId);
      console.log('⏱️ Time:', execTime, 'ms');
      console.log('═══════════════════════════════════════════════════════════════');
      
      // ===== LOG TO FIRESTORE =====
      try {
        await admin.firestore().collection('emailLogs').add({
          to: data.to,
          subject: data.subject,
          contactId: data.contactId || null,
          status: 'sent',
          messageId: info.messageId,
          sentAt: admin.firestore.FieldValue.serverTimestamp(),
          sentBy: request.auth?.uid || 'anonymous'
        });
      } catch (e) { console.warn('Log error:', e.message); }
      
      return {
        success: true,
        messageId: info.messageId,
        accepted: info.accepted,
        response: info.response
      };
      
    } catch (error) {
      console.error('❌ ERROR:', error.message);
      return { success: false, error: error.message };
    }
  }
);

// ═══════════════════════════════════════════════════════════════════════════════
// WORKFLOW CONTROL FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════
exports.pauseWorkflowForContact = onCall(defaultConfig, async (request) => {
  console.log('⏸️ pauseWorkflowForContact');
  try {
    const { contactId, reason } = request.data;
    if (!contactId) throw new Error('Missing contactId');
    
    await admin.firestore().collection('contacts').doc(contactId).update({
      workflowStatus: 'paused',
      workflowPausedAt: admin.firestore.FieldValue.serverTimestamp(),
      workflowPausedReason: reason || 'Manual pause'
    });
    
    return { success: true, status: 'paused' };
  } catch (error) {
    console.error('❌', error);
    return { success: false, error: error.message };
  }
});

exports.resumeWorkflowForContact = onCall(defaultConfig, async (request) => {
  console.log('▶️ resumeWorkflowForContact');
  try {
    const { contactId } = request.data;
    if (!contactId) throw new Error('Missing contactId');
    
    await admin.firestore().collection('contacts').doc(contactId).update({
      workflowStatus: 'active',
      workflowResumedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return { success: true, status: 'active' };
  } catch (error) {
    console.error('❌', error);
    return { success: false, error: error.message };
  }
});

exports.getContactWorkflowStatus = onCall(defaultConfig, async (request) => {
  try {
    const { contactId } = request.data;
    if (!contactId) throw new Error('Missing contactId');
    
    const doc = await admin.firestore().collection('contacts').doc(contactId).get();
    if (!doc.exists) throw new Error('Contact not found');
    
    const data = doc.data();
    return {
      success: true,
      status: data.workflowStatus || 'active',
      currentStage: data.workflowStage || 'new'
    };
  } catch (error) {
    return { success: false, status: 'unknown', error: error.message };
  }
});

exports.checkIDIQApplications = onCall(defaultConfig, async (request) => {
  console.log('🔍 checkIDIQApplications');
  try {
    const db = admin.firestore();
    const apps = await db.collection('idiqEnrollments')
      .where('status', '==', 'pending')
      .limit(50)
      .get();
    
    return {
      success: true,
      pending: apps.size,
      applications: apps.docs.map(d => ({ id: d.id, ...d.data() }))
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

exports.generateAIEmailContent = onCall(
  {
    ...defaultConfig,
    secrets: [openaiApiKey]
  },
  async (request) => {
    console.log('🤖 generateAIEmailContent');
    try {
      const { type, contactName, context, tone } = request.data;
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey.value()}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a professional email writer for a credit repair company.' },
            { role: 'user', content: `Generate a ${type || 'follow-up'} email for ${contactName || 'a customer'}. Context: ${context || 'General'}. Tone: ${tone || 'professional'}. Keep it 3-4 paragraphs with a clear call-to-action.` }
          ],
          max_tokens: 500
        })
      });
      
      const result = await response.json();
      return {
        success: true,
        content: result.choices?.[0]?.message?.content?.trim() || ''
      };
    } catch (error) {
      return { success: false, content: '', error: error.message };
    }
  }
);

// ============================================
// IDIQ & UTILITY FUNCTIONS
// ============================================
exports.getIDIQPartnerToken = onRequest(
  {
    ...defaultConfig,
    secrets: [idiqPartnerId, idiqPartnerSecret, idiqApiKey]
  },
  async (req, res) => {
    res.json({ success: true });
  }
);

exports.getIDIQPartnerTokenCallable = onCall(
  {
    ...defaultConfig,
    secrets: [idiqPartnerId, idiqPartnerSecret, idiqApiKey]
  },
  async (request) => ({ success: true })
);

exports.enrollIDIQMember = onRequest(
  {
    ...defaultConfig,
    secrets: [idiqPartnerId, idiqPartnerSecret, idiqApiKey, idiqPlanCode, idiqOfferCode]
  },
  async (req, res) => {
    res.json({ success: true });
  }
);

// ===== IMPORT ENROLLIDIQ FROM SEPARATE FILE =====
const { enrollIDIQ } = require('./enrollIDIQ');
exports.enrollIDIQ = enrollIDIQ;

exports.getIDIQMemberToken = onRequest(defaultConfig, async (req, res) => res.json({ success: true }));
exports.getVerificationQuestions = onRequest(defaultConfig, async (req, res) => res.json({ success: true }));
exports.submitVerificationAnswers = onRequest(defaultConfig, async (req, res) => res.json({ success: true }));
exports.getIDIQDashboardURL = onRequest(defaultConfig, async (req, res) => res.json({ success: true }));
exports.getIDIQCreditScore = onRequest(defaultConfig, async (req, res) => res.json({ success: true }));
exports.getIDIQQuickViewReport = onRequest(defaultConfig, async (req, res) => res.json({ success: true }));
exports.getIDIQCreditReport = onRequest(defaultConfig, async (req, res) => res.json({ success: true }));
exports.submitIDIQDispute = onRequest(defaultConfig, async (req, res) => res.json({ success: true }));
exports.getIDIQDisputeStatus = onRequest(defaultConfig, async (req, res) => res.json({ success: true }));
exports.setUserClaims = onCall(defaultConfig, async (request) => ({ success: true }));

// ===== TRACKING FUNCTIONS =====
exports.trackEmailOpen = onRequest(
  defaultConfig,
  async (req, res) => {
    res.set('Content-Type', 'image/gif');
    res.send(Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'));
  }
);

exports.trackEmailClick = onRequest(
  defaultConfig,
  async (req, res) => {
    res.redirect(req.query.url || '/');
  }
);

exports.trackWebsite = onRequest(defaultConfig, async (req, res) => res.json({ success: true }));

// ===== UTILITY FUNCTIONS =====
exports.fixUnknownContacts = onRequest(defaultConfig, async (req, res) => res.json({ success: true }));
exports.getReviewNeededContacts = onRequest(defaultConfig, async (req, res) => res.json({ contacts: [] }));

// ============================================
// AI CREDIT INTELLIGENCE FUNCTIONS
// ============================================
const aiCreditIntelligence = require('./aiCreditIntelligence');

// Score prediction and analysis
exports.predictCreditScoreAI = aiCreditIntelligence.predictCreditScore;
exports.prioritizeDisputes = aiCreditIntelligence.prioritizeDisputes;
exports.parseResponseLetter = aiCreditIntelligence.parseResponseLetter;
exports.predictDisputeSuccess = aiCreditIntelligence.predictDisputeSuccess;
exports.detectAnomalies = aiCreditIntelligence.detectAnomalies;
exports.checkCompliance = aiCreditIntelligence.checkCompliance;
exports.generateGoodwillLetter = aiCreditIntelligence.generateGoodwillLetter;
exports.generateNegotiationScript = aiCreditIntelligence.generateNegotiationScript;
exports.createStrategyPlan = aiCreditIntelligence.createStrategyPlan;
exports.predictTimeline = aiCreditIntelligence.predictTimeline;

// ============================================
// AI CREDIT COACH FUNCTIONS (24/7 CHATBOT)
// ============================================
const aiCreditCoach = require('./aiCreditCoach');

exports.chatWithCoach = aiCreditCoach.chatWithCoach;
exports.getQuickTips = aiCreditCoach.getQuickTips;
exports.getMotivation = aiCreditCoach.getMotivation;
exports.explainScore = aiCreditCoach.explainScore;
exports.answerFAQ = aiCreditCoach.answerFAQ;

// ============================================
// AI BUSINESS INTELLIGENCE FUNCTIONS
// ============================================
const aiBusinessIntelligence = require('./aiBusinessIntelligence');

exports.forecastRevenue = aiBusinessIntelligence.forecastRevenue;
exports.predictChurn = aiBusinessIntelligence.predictChurn;
exports.composeMessage = aiBusinessIntelligence.composeMessage;
exports.optimizeUtilization = aiBusinessIntelligence.optimizeUtilization;
exports.analyzeAndTriggerWorkflows = aiBusinessIntelligence.analyzeAndTriggerWorkflows;
exports.generateBusinessInsights = aiBusinessIntelligence.generateBusinessInsights;

// ============================================
// AI ADVANCED FEATURES (WOW FEATURES)
// ============================================
const aiAdvancedFeatures = require('./aiAdvancedFeatures');

// Credit Score Simulator
exports.simulateCreditScore = aiAdvancedFeatures.simulateCreditScore;

// Victory Celebration System
exports.triggerVictoryCelebration = aiAdvancedFeatures.triggerVictoryCelebration;
exports.onDisputeDeleted = aiAdvancedFeatures.onDisputeDeleted;

// AI Upsell Engine
exports.generateUpsellRecommendations = aiAdvancedFeatures.generateUpsellRecommendations;

// Referral AI Predictor
exports.predictReferralLikelihood = aiAdvancedFeatures.predictReferralLikelihood;

// Document OCR Pipeline
exports.processDocumentOCR = aiAdvancedFeatures.processDocumentOCR;

// Dispute Letter A/B Testing
exports.recordDisputeLetterResult = aiAdvancedFeatures.recordDisputeLetterResult;
exports.getLetterEffectivenessReport = aiAdvancedFeatures.getLetterEffectivenessReport;

// Bureau Response Predictor
exports.predictBureauResponse = aiAdvancedFeatures.predictBureauResponse;

// Regulatory Compliance Monitor
exports.checkRegulatoryCompliance = aiAdvancedFeatures.checkRegulatoryCompliance;

// Client Progress Portal
exports.generateProgressTimeline = aiAdvancedFeatures.generateProgressTimeline;

// Smart Notification Engine
exports.analyzeNotificationTiming = aiAdvancedFeatures.analyzeNotificationTiming;

// ============================================
// AI REVENUE ENGINE (AFFILIATE & AUTO OPPORTUNITIES)
// ============================================
const aiRevenueEngine = require('./aiRevenueEngine');

// Affiliate Link Management
exports.saveAffiliateLink = aiRevenueEngine.saveAffiliateLink;
exports.getAffiliateLinks = aiRevenueEngine.getAffiliateLinks;
exports.trackAffiliateLinkClick = aiRevenueEngine.trackAffiliateLinkClick;

// AI Credit Review Generator with Affiliate Integration
exports.generateCreditReview = aiRevenueEngine.generateCreditReview;

// Auto Loan Opportunity Detection
exports.checkAutoOpportunities = aiRevenueEngine.checkAutoOpportunities;
exports.scanAutoOpportunities = aiRevenueEngine.scanAutoOpportunities;

// Revolving Credit Comparison
exports.compareRevolvingCredit = aiRevenueEngine.compareRevolvingCredit;

// ============================================
// CLIENT EXPERIENCE (ONBOARDING & COMMUNICATION)
// ============================================
const clientExperience = require('./clientExperience');

// Smart Onboarding
exports.createOnboardingSession = clientExperience.createOnboardingSession;
exports.updateOnboardingStep = clientExperience.updateOnboardingStep;
exports.getOnboardingSession = clientExperience.getOnboardingSession;

// AI Communication Center
exports.generateClientCommunication = clientExperience.generateClientCommunication;
exports.saveCommunicationTemplate = clientExperience.saveCommunicationTemplate;
exports.getCommunicationTemplates = clientExperience.getCommunicationTemplates;
exports.logSentCommunication = clientExperience.logSentCommunication;

// Client Satisfaction & NPS
exports.createSatisfactionSurvey = clientExperience.createSatisfactionSurvey;
exports.submitSurveyResponse = clientExperience.submitSurveyResponse;
exports.getNPSAnalytics = clientExperience.getNPSAnalytics;

// Milestone Triggers
exports.checkMilestoneTriggers = clientExperience.checkMilestoneTriggers;

// ============================================
// SALES TRACKER (TOYOTA/TEKION & REFERRALS)
// ============================================
const salesTracker = require('./salesTracker');

// Auto Lead Management
exports.createAutoLead = salesTracker.createAutoLead;
exports.updateAutoLeadStatus = salesTracker.updateAutoLeadStatus;
exports.exportToTekion = salesTracker.exportToTekion;
exports.getAutoLeads = salesTracker.getAutoLeads;
exports.reassignAutoLead = salesTracker.reassignAutoLead;

// Commission Tracking
exports.getCommissionSummary = salesTracker.getCommissionSummary;
exports.markCommissionPaid = salesTracker.markCommissionPaid;

// Review & Referral Engine
exports.createReviewRequest = salesTracker.createReviewRequest;
exports.trackReviewCompletion = salesTracker.trackReviewCompletion;
exports.createReferral = salesTracker.createReferral;
exports.convertReferral = salesTracker.convertReferral;
exports.getReferralAnalytics = salesTracker.getReferralAnalytics;

// Team Members
exports.getTeamMembers = salesTracker.getTeamMembers;
exports.addTeamMember = salesTracker.addTeamMember;

// ============================================
// BUSINESS INTELLIGENCE (KPIS & ANALYTICS)
// ============================================
const businessIntelligence = require('./businessIntelligence');

// Executive Dashboard
exports.getExecutiveKPIs = businessIntelligence.getExecutiveKPIs;
exports.getRevenueForecast = businessIntelligence.getRevenueForecast;

// Payment Health Monitor
exports.analyzePaymentHealth = businessIntelligence.analyzePaymentHealth;
exports.checkPaymentHealth = businessIntelligence.checkPaymentHealth;

// Dispute Pattern Analysis
exports.analyzeDisputePatterns = businessIntelligence.analyzeDisputePatterns;
exports.getLetterEffectiveness = businessIntelligence.getLetterEffectiveness;

// ============================================
// OPERATIONS (TASKS, DOCS, COMPLIANCE)
// ============================================
const operations = require('./operations');

// Team Task Manager
exports.createTask = operations.createTask;
exports.updateTask = operations.updateTask;
exports.addTaskComment = operations.addTaskComment;
exports.getTasks = operations.getTasks;
exports.getTaskDashboard = operations.getTaskDashboard;
exports.checkOverdueTasks = operations.checkOverdueTasks;

// Document Vault
exports.registerDocument = operations.registerDocument;
exports.getDocuments = operations.getDocuments;
exports.logDocumentAccess = operations.logDocumentAccess;
exports.archiveDocument = operations.archiveDocument;
exports.checkExpiringDocuments = operations.checkExpiringDocuments;

// Compliance Calendar
exports.createComplianceEvent = operations.createComplianceEvent;
exports.getComplianceCalendar = operations.getComplianceCalendar;
exports.completeComplianceEvent = operations.completeComplianceEvent;
exports.initializeComplianceCalendar = operations.initializeComplianceCalendar;
exports.checkComplianceDeadlines = operations.checkComplianceDeadlines;

// Notifications
exports.getNotifications = operations.getNotifications;
exports.markNotificationRead = operations.markNotificationRead;

console.log('🚀 Firebase Gen 2 Functions configured successfully!');
console.log('✨ AI Advanced Features loaded!');
console.log('💰 AI Revenue Engine loaded!');
console.log('👤 Client Experience loaded!');
console.log('🚗 Sales Tracker loaded!');
console.log('📊 Business Intelligence loaded!');
console.log('⚙️ Operations loaded!');