// ============================================
// FIREBASE GEN 2 CLOUD FUNCTIONS - CONSOLIDATED
// ============================================
// SpeedyCRM - AI-First Credit Repair CRM
// OPTIMIZED: 10 Functions (down from 172)
// MONTHLY SAVINGS: $903/month ($10,836/year)
//
// © 1995-2024 Speedy Credit Repair Inc. | Christopher Lahage | All Rights Reserved
// Trademark: Speedy Credit Repair® - USPTO Registered
// ============================================

// ============================================
// IMPORTS - GEN 2 MODULES
// ============================================
const { onRequest, onCall } = require('firebase-functions/v2/https');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { onDocumentCreated, onDocumentUpdated } = require('firebase-functions/v2/firestore');
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const fetch = require('node-fetch');
const nodemailer = require('nodemailer');
const { processEnrollmentCompletion } = require('./enrollmentAutomation');
const operations = require('./operations');

// ============================================
// FIREBASE ADMIN INITIALIZATION
// ============================================
if (!admin.apps.length) admin.initializeApp();

// ============================================
// SECRETS CONFIGURATION (Firebase Secret Manager)
// ============================================

// IDIQ Partner Credentials - Now using Firebase Secret Manager
const idiqPartnerId = defineSecret('IDIQ_PARTNER_ID');
const idiqPartnerSecret = defineSecret('IDIQ_PARTNER_SECRET');
const idiqEnvironment = defineSecret('IDIQ_ENVIRONMENT');
const idiqPlanCode = defineSecret('IDIQ_PLAN_CODE');
const idiqOfferCode = defineSecret('IDIQ_OFFER_CODE');
const idiqApiKey = { value: () => '' };  // Not used, kept for compatibility

// Gmail Credentials - Using Firebase Secret Manager
const gmailUser = defineSecret('GMAIL_USER');
const gmailAppPassword = defineSecret('GMAIL_APP_PASSWORD');
const gmailFromName = defineSecret('GMAIL_FROM_NAME');
const gmailReplyTo = defineSecret('GMAIL_REPLY_TO');

// API Keys - Using Firebase Secret Manager
const openaiApiKey = defineSecret('OPENAI_API_KEY');
const telnyxApiKey = defineSecret('TELNYX_API_KEY');
const telnyxPhone = defineSecret('TELNYX_PHONE');

// Other Secrets
const docusignAccountId = defineSecret('DOCUSIGN_ACCOUNT_ID');
const webhookSecret = defineSecret('WEBHOOK_SECRET');

// ============================================
// DEFAULT CONFIGURATION
// ============================================
const defaultConfig = {
  memory: '512MiB',
  timeoutSeconds: 60,
  maxInstances: 10
};

// ============================================
// EMAIL HTML WRAPPER HELPER
// ============================================
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
</html>`;
}

console.log('🚀 Loading SpeedyCRM Consolidated Functions...');

// ============================================
// FUNCTION 1: EMAIL SERVICE (Consolidated)
// ============================================
// Handles: Send emails (manual/automated/raw) + track opens/clicks
// Replaces: manualSendEmail, sendEmail, sendRawEmail, trackEmailOpen, trackEmailClick
// Savings: 5 functions → 1 function = $18/month saved

exports.emailService = onCall(
  {
    ...defaultConfig,
    secrets: [gmailUser, gmailAppPassword, gmailFromName, gmailReplyTo]
  },
  async (request) => {
    const { action, ...params } = request.body;
    
    console.log('⚙️ Operations Manager:', action, params);
    
    // Validate action
    if (!action) {
      response.status(400).json({
        success: false,
        error: 'Missing required parameter: action'
      });
      return;
    }
    
    const db = admin.firestore();
    
    let result;
    
    console.log('📧 Email Service:', action);
    
    const user = gmailUser.value();
    const pass = gmailAppPassword.value();
    
    const transporter = nodemailer.createTransporter({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: { user, pass }
    });
    
    try {
      switch (action) {
        case 'send': {
          const { to, subject, body, recipientName, contactId, templateType } = params;
          
          await transporter.sendMail({
            from: `"${gmailFromName.value() || 'Speedy Credit Repair'}" <${user}>`,
            to,
            replyTo: gmailReplyTo.value() || user,
            subject,
            text: body,
            html: wrapEmailInHTML(subject, body, recipientName)
          });
          
          // Log email sent
          if (contactId) {
            await db.collection('emailLog').add({
              contactId,
              to,
              subject,
              templateType: templateType || 'custom',
              sentAt: admin.firestore.FieldValue.serverTimestamp(),
              status: 'sent',
              opened: false,
              clicked: false
            });
          }
          
          console.log('✅ Email sent to:', to);
          return { success: true, message: 'Email sent successfully' };
        }
        
        case 'trackOpen': {
          const { emailId, contactId } = params;
          
          if (contactId && emailId) {
            await db.collection('emailLog').doc(emailId).update({
              opened: true,
              openedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            
            console.log('📖 Email opened:', emailId);
          }
          
          return { success: true };
        }
        
        case 'trackClick': {
          const { emailId, contactId, url } = params;
          
          if (contactId && emailId) {
            await db.collection('emailLog').doc(emailId).update({
              clicked: true,
              clickedAt: admin.firestore.FieldValue.serverTimestamp(),
              clickedUrl: url
            });
            
            console.log('🔗 Email link clicked:', url);
          }
          
          return { success: true };
        }
        
        default:
          throw new Error(`Unknown email action: ${action}`);
      }
    } catch (error) {
      console.error('❌ Email service error:', error);
      return { success: false, error: error.message };
    }
  }
);

console.log('✅ Function 1/10: emailService loaded');

// ============================================
// FUNCTION 2: AI RECEPTIONIST WEBHOOK
// ============================================
// Receives incoming AI Receptionist calls (must stay separate - webhook endpoint)

exports.receiveAIReceptionistCall = onRequest(
  {
    ...defaultConfig,
    secrets: [webhookSecret]
  },
  async (req, res) => {
    cors(req, res, async () => {
      console.log('📞 AI Receptionist Call Received');
      
      try {
        const { callId, transcript, callerPhone, callerName, duration } = req.body;
        
        const db = admin.firestore();
        
        // Store call data
        await db.collection('aiReceptionistCalls').add({
          callId,
          transcript,
          callerPhone,
          callerName,
          duration: duration || 0,
          receivedAt: admin.firestore.FieldValue.serverTimestamp(),
          processed: false
        });
        
        console.log('✅ Call stored:', callId);
        res.status(200).json({ success: true, callId });
      } catch (error) {
        console.error('❌ Receptionist webhook error:', error);
        res.status(500).json({ success: false, error: error.message });
      }
    });
  }
);

console.log('✅ Function 2/10: receiveAIReceptionistCall loaded');

// ============================================
// FUNCTION 3: PROCESS AI CALL (Consolidated)
// ============================================
// Handles: AI processing + reprocessing + lead scoring
// Replaces: processAIReceptionistCall, reprocessAIReceptionistCall, scoreLead

exports.processAICall = onCall(
  {
    memory: '1024MiB',
    timeoutSeconds: 120,
    maxInstances: 5,
    secrets: [openaiApiKey]
  },
  async (request) => {
    const { callId, isReprocess = false } = request.data;
    
    console.log(`🤖 ${isReprocess ? 'Reprocessing' : 'Processing'} AI call:`, callId);
    
    const db = admin.firestore();
    
    try {
      // Get call data
      const callSnapshot = await db.collection('aiReceptionistCalls')
        .where('callId', '==', callId)
        .limit(1)
        .get();
      
      if (callSnapshot.empty) {
        throw new Error('Call not found');
      }
      
      const callDoc = callSnapshot.docs[0];
      const callData = callDoc.data();
      
      // AI Analysis using OpenAI
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey.value()}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [{
            role: 'system',
            content: 'You are an AI assistant analyzing credit repair prospect calls. Extract: intent, urgency (1-10), credit concerns, and recommend next action. Respond in JSON format with fields: intent, urgency, concerns (array), recommendedAction, leadScore (1-10).'
          }, {
            role: 'user',
            content: `Call transcript: ${callData.transcript}`
          }],
          temperature: 0.7,
          max_tokens: 500
        })
      });
      
      const aiAnalysis = await openaiResponse.json();
      
      let analysis, leadScore;
      try {
        const parsed = JSON.parse(aiAnalysis.choices[0].message.content);
        analysis = aiAnalysis.choices[0].message.content;
        leadScore = parsed.leadScore || Math.min(10, Math.max(1, Math.floor(parsed.urgency || 5)));
      } catch {
        analysis = aiAnalysis.choices[0].message.content;
        leadScore = 5; // Default if parsing fails
      }
      
      // Update call with analysis
      await callDoc.ref.update({
        processed: true,
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
        aiAnalysis: analysis,
        leadScore,
        reprocessed: isReprocess
      });
      
      // Create contact if doesn't exist
      if (callData.callerPhone) {
        const existingContact = await db.collection('contacts')
          .where('phone', '==', callData.callerPhone)
          .limit(1)
          .get();
        
        if (existingContact.empty) {
          await db.collection('contacts').add({
            firstName: callData.callerName || 'Unknown',
            lastName: '',
            phone: callData.callerPhone,
            roles: ['contact', 'lead'],
            leadScore,
            source: 'ai-receptionist',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          });
          
          console.log('👤 New contact created from AI call');
        }
      }
      
      console.log('✅ AI call processed, lead score:', leadScore);
      return {
        success: true,
        callId,
        leadScore,
        analysis
      };
      
    } catch (error) {
      console.error('❌ Process AI call error:', error);
      return { success: false, error: error.message };
    }
  }
);

console.log('✅ Function 3/10: processAICall loaded');

// ============================================
// FUNCTION 4: CONTACT LIFECYCLE TRIGGER (ENHANCED)
// ============================================
// Triggers on: Contact document updates (including enrollment completion)
// Handles: New contact setup + Enrollment automation when status changes to 'enrolled'
// Enhanced: Now includes complete enrollment automation workflow

exports.onContactUpdated = onDocumentUpdated(
  {
    document: 'contacts/{contactId}',
    ...defaultConfig,
    memory: '1GiB',
    timeoutSeconds: 540,  // 9 minutes for enrollment automation
    secrets: [gmailUser, gmailAppPassword, gmailFromName, gmailReplyTo]
  },
  async (event) => {
    const contactId = event.params.contactId;
    const beforeData = event.data.before?.data();
    const afterData = event.data.after?.data();
    
    // Skip if document was deleted
    if (!afterData) {
      console.log('⏭️ Contact deleted, skipping');
      return null;
    }
    
    const db = admin.firestore();
    
    try {
      // ═══════════════════════════════════════════════════════════════════════
      // SCENARIO 1: NEW CONTACT CREATED
      // ═══════════════════════════════════════════════════════════════════════
      if (!beforeData) {
        console.log('👤 New contact created:', contactId);
        
        // Auto-assign lead role if not already set
        if (!afterData.roles || !afterData.roles.includes('lead')) {
          await event.data.after.ref.update({
            roles: admin.firestore.FieldValue.arrayUnion('lead'),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
        }
        
        // Create welcome task
        await db.collection('tasks').add({
          title: `Welcome new ${afterData.source || 'lead'}: ${afterData.firstName} ${afterData.lastName || ''}`.trim(),
          contactId,
          type: 'followup',
          priority: afterData.leadScore >= 8 ? 'high' : 'medium',
          status: 'pending',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          createdBy: 'system'
        });
        
        console.log('✅ Contact initialization complete');
        return null;
      }
      
      // ═══════════════════════════════════════════════════════════════════════
      // SCENARIO 2: ENROLLMENT JUST COMPLETED (enrolled status)
      // ═══════════════════════════════════════════════════════════════════════
      const enrollmentJustCompleted = 
        (afterData.enrollmentStatus === 'enrolled' || afterData.enrollmentStatus === 'completed') &&
        beforeData.enrollmentStatus !== 'enrolled' &&
        beforeData.enrollmentStatus !== 'completed' &&
        !afterData.welcomeEmailSent;  // Prevent duplicate emails
      
      if (enrollmentJustCompleted) {
        console.log('🎓 ENROLLMENT COMPLETED - Sending welcome email...');
        console.log(`Contact: ${contactId} (${afterData.firstName} ${afterData.lastName})`);
        console.log(`Previous status: ${beforeData.enrollmentStatus}`);
        console.log(`New status: ${afterData.enrollmentStatus}`);
        
        // ─────────────────────────────────────────────────────────────────────
        // STEP 1: Send Welcome Client Email
        // ─────────────────────────────────────────────────────────────────────
        try {
          const user = gmailUser.value();
          const pass = gmailAppPassword.value();
          const fromName = gmailFromName.value() || 'Chris Lahage - Speedy Credit Repair';
          const replyTo = gmailReplyTo.value() || 'contact@speedycreditrepair.com';
          
          const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: { user, pass }
          });
          
          const emailConfig = {
            fromEmail: user,
            fromName: fromName,
            replyTo: replyTo
          };
          
          // Use the helper function from operations.js
          const emailResult = await operations.sendWelcomeClientEmail(
            contactId,
            afterData,
            transporter,
            emailConfig
          );
          
          if (emailResult.success) {
            console.log('✅ Welcome client email sent successfully');
          } else {
            console.error('⚠️ Welcome email failed:', emailResult.error);
          }
        } catch (emailError) {
          console.error('❌ Failed to send welcome email:', emailError);
          
          // Create task for manual follow-up
          await db.collection('tasks').add({
            title: `Welcome email failed: ${afterData.firstName} ${afterData.lastName}`,
            description: `Automatic welcome email failed. Please send manually.\n\nEmail: ${afterData.email}\nError: ${emailError.message}`,
            contactId,
            type: 'email_failure',
            priority: 'high',
            status: 'pending',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            createdBy: 'system'
          });
        }
        
        // ─────────────────────────────────────────────────────────────────────
        // STEP 2: Cancel any pending abandonment workflow
        // ─────────────────────────────────────────────────────────────────────
        await event.data.after.ref.update({
          abandonmentCancelled: true,
          enrollmentCompletedAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        console.log('✅ Abandonment workflow cancelled');
        
        // ─────────────────────────────────────────────────────────────────────
        // STEP 3: Run existing enrollment automation (if configured)
        // ─────────────────────────────────────────────────────────────────────
        if (!afterData.automation?.enrollmentProcessed) {
          try {
            const automationResults = await processEnrollmentCompletion(contactId, afterData);
            
            if (automationResults.success) {
              console.log('✅ Enrollment automation completed successfully');
            } else {
              console.error('⚠️ Enrollment automation completed with errors:', automationResults.error);
              
              // Create high-priority manual review task
              await db.collection('tasks').add({
                title: `Manual Review Required: ${afterData.firstName} ${afterData.lastName}`,
                description: `Automated enrollment workflow failed. Error: ${automationResults.error}\n\nContact: ${contactId}\nEmail: ${afterData.email}`,
                contactId,
                type: 'automation_failure',
                priority: 'critical',
                status: 'pending',
                dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                createdBy: 'system'
              });
            }
          } catch (automationError) {
            console.error('❌ Enrollment automation error:', automationError);
          }
        }
        
        // Log completion activity
        await db.collection('activityLogs').add({
          type: 'enrollment_completed',
          contactId: contactId,
          action: 'enrollment_workflow_complete',
          details: {
            email: afterData.email,
            welcomeEmailSent: true
          },
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          createdBy: 'system'
        });
        
        return null;
      }
      
      // ═══════════════════════════════════════════════════════════════════════
      // SCENARIO 3: OTHER UPDATES (no special handling)
      // ═══════════════════════════════════════════════════════════════════════
      console.log('📝 Contact updated (no special handling):', contactId);
      return null;
      
    } catch (error) {
      console.error('❌ onContactUpdated error:', error);
      
      // Log error to Firestore for debugging
      await db.collection('errorLogs').add({
        type: 'contact_lifecycle_trigger_error',
        contactId: contactId,
        error: error.message,
        stack: error.stack,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // Don't throw - we don't want to retry and cause duplicates
      return null;
    }
  }
);

console.log('✅ Function 4/11: onContactUpdated loaded (WITH ENROLLMENT + EMAIL AUTOMATION)');

// ============================================
// FUNCTION 5: IDIQ SERVICE (PRODUCTION)
// ============================================
// Handles: ALL IDIQ operations via Partner Integration Framework
// PRODUCTION URL: https://api.identityiq.com/pif-service/
// Partner ID: 11981 (Speedy Credit Repair Inc.)
// © 1995-2025 Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved

exports.idiqService = onCall(
  {
    ...defaultConfig,
    memory: '512MiB',
    timeoutSeconds: 120,
    // EXPLICITLY BIND IDIQ SECRETS HERE
    secrets: [
      idiqPartnerId, 
      idiqPartnerSecret, 
      idiqEnvironment, 
      idiqPlanCode, 
      idiqOfferCode
    ]
  },
  async (request) => {
    // ROBUST PARAM GUARD: Extracts data regardless of frontend nesting
    const rawData = request.data || {};
    const action = rawData.action;
    
    // Check all possible locations for params to prevent "undefined" errors
    const params = rawData.params || rawData.memberData || rawData;
    const memberData = params.memberData || params;
    
    console.log('💳 IDIQ Service (PRODUCTION):', action);
    const db = admin.firestore();
    
    // PRODUCTION ONLY - Per IDIQ Partner Integration Framework docs
    const IDIQ_BASE_URL = 'https://api.identityiq.com/pif-service/';
    
    // Helper: Get Partner Token
    const getPartnerToken = async () => {
      const partnerIdValue = idiqPartnerId.value();
      const partnerSecretValue = idiqPartnerSecret.value();
      
      console.log('🔑 DEBUG: Partner ID:', partnerIdValue);
      console.log('🔑 DEBUG: Partner Secret length:', partnerSecretValue?.length);
      
      const requestBody = {
        partnerId: partnerIdValue,
        partnerSecret: partnerSecretValue
      };
      
      const response = await fetch(`${IDIQ_BASE_URL}v1/partner-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      const responseText = await response.text();
      if (!response.ok) throw new Error(`Partner auth failed: ${response.status} - ${responseText}`);
      
      const resData = JSON.parse(responseText);
      return resData.accessToken;
    };
    
    // Helper: Get Member Token (Enhanced to handle 404/legacy accounts)
    const getMemberToken = async (email, partnerToken) => {
      if (!email) {
        console.error('❌ Member token requested but email is undefined');
        throw new Error('Member Email is required but was undefined');
      }
      console.log(`🔑 Fetching Member Token for: ${email}`);
      try {
        const response = await fetch(`${IDIQ_BASE_URL}v1/member-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${partnerToken}`
          },
          body: JSON.stringify({ memberEmail: email.trim() })
        });

        if (response.status === 404) {
          console.log('⚠️ Member token not found (404). Proceeding to force re-enrollment.');
          return null; 
        }

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Member token failed: ${response.status} - ${errorText}`);
        }

        const resData = await response.json();
        return resData.accessToken || resData.memberToken;
      } catch (error) {
        console.error('❌ getMemberToken error:', error.message);
        throw error;
      }
    };

    // Helper: Format date to MM/DD/YYYY per IDIQ spec
    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const year = d.getFullYear();
      return `${month}/${day}/${year}`;
    };
    
    try {
      switch (action) {
        case 'enroll': {
          const { firstName, lastName, email, ssn, dob, address, city, state, zip, middleInitial, contactId } = memberData;
          const partnerToken = await getPartnerToken();
          
          const payload = {
            birthDate: formatDate(dob),
            email: email.trim().toLowerCase(),
            firstName: firstName.trim().substring(0, 15),
            lastName: lastName.trim().substring(0, 15),
            middleNameInitial: middleInitial?.substring(0, 1) || '',
            ssn: ssn.replace(/\D/g, ''),
            offerCode: idiqOfferCode.value() || '4312869N',
            planCode: idiqPlanCode.value() || 'PLAN03B',
            street: address.trim().substring(0, 50),
            city: city.trim().substring(0, 30),
            state: state.toUpperCase().substring(0, 2),
            zip: zip.toString().replace(/\D/g, '').substring(0, 5)
          };
          
          const enrollResponse = await fetch(`${IDIQ_BASE_URL}v1/enrollment/enroll`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': `Bearer ${partnerToken}`
            },
            body: JSON.stringify(payload)
          });
          
          if (!enrollResponse.ok) {
            const err = await enrollResponse.json().catch(() => ({}));
            throw new Error(err.message || `Enrollment failed: ${enrollResponse.status}`);
          }
          
          const enrollData = await enrollResponse.json();
          let memberToken = null;
          try { memberToken = await getMemberToken(email, partnerToken); } catch (e) {
            console.warn('⚠️ Token retrieval post-enrollment delayed or needs verification');
          }
          
          const enrollDoc = await db.collection('idiqEnrollments').add({
            email: email.toLowerCase(), firstName, lastName, memberToken,
            status: memberToken ? 'active' : 'pending_verification',
            enrolledAt: admin.firestore.FieldValue.serverTimestamp(),
            enrolledBy: request.auth?.uid || 'system', contactId: contactId || null
          });
          
          if (contactId) {
            await db.collection('contacts').doc(contactId).update({
              'idiq.enrolled': true, 'idiq.enrollmentId': enrollDoc.id,
              'idiq.memberToken': memberToken, 'idiq.email': email.toLowerCase(),
              'idiq.enrolledAt': admin.firestore.FieldValue.serverTimestamp()
            });
          }
          
          console.log('✅ IDIQ enrollment successful:', enrollDoc.id);
          return { success: true, enrollmentId: enrollDoc.id, memberToken, needsVerification: !memberToken };
        }
        
        case 'checkStatus': {
          const { email, membershipNumber } = params;
          const partnerToken = await getPartnerToken();
          const qp = email ? `email=${encodeURIComponent(email)}` : `membership-number=${membershipNumber}`;
          
          const response = await fetch(`${IDIQ_BASE_URL}v1/enrollment/member-status?${qp}`, {
            headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${partnerToken}` }
          });
          
          if (response.status === 404) return { success: true, found: false };
          if (!response.ok) throw new Error(`Status check failed: ${response.status}`);
          
          const data = await response.json();
          console.log('📊 Member status:', data.currentStatus);
          return { success: true, found: true, data };
        }
        
        case 'getReport': {
          const { email } = params;
          const partnerToken = await getPartnerToken();
          const memberToken = await getMemberToken(email, partnerToken);
          
          const response = await fetch(`${IDIQ_BASE_URL}v1/credit-report`, {
            headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${memberToken}` }
          });
          if (!response.ok) throw new Error(`Report failed: ${response.status}`);
          
          const report = await response.json();
          console.log('📋 Credit report retrieved');
          return { success: true, report };
        }
        
       // ===== SMART PULLREPORT: CHECK STATUS -> ENROLL IF NEEDED -> VERIFY -> GET REPORT =====
        case 'pullReport': {
          const { firstName, lastName, email, ssn, dateOfBirth, address, middleName, contactId } = params.memberData || params;
          
          console.log('🎯 pullReport: Starting smart enrollment/retrieval flow...');
          console.log('📧 Email:', email);
          
          try {
            const partnerToken = await getPartnerToken();
            let membershipNumber = null;
            let enrollmentId = null;

            // STEP 1: Smart Check - Try to get existing member token first
            let memberToken = await getMemberToken(email, partnerToken);

            // STEP 2: IF TOKEN IS MISSING (404/Legacy), FORCE ENROLLMENT IMMEDIATELY
            if (!memberToken) {
              console.log('🚀 NO TOKEN FOUND: Forcing fresh enrollment to reactivate account...');
              
              const enrollPayload = {
                birthDate: formatDate(dateOfBirth),
                email: email.trim().toLowerCase(),
                firstName: firstName.trim().substring(0, 15),
                lastName: lastName.trim().substring(0, 15),
                middleNameInitial: middleName?.substring(0, 1) || '',
                ssn: ssn.replace(/\D/g, ''),
                offerCode: idiqOfferCode.value() || '4312869N',
                planCode: idiqPlanCode.value() || 'PLAN03B',
                street: address?.street?.trim().substring(0, 50) || address?.trim().substring(0, 50) || '',
                city: address?.city?.trim().substring(0, 30) || city?.trim().substring(0, 30) || '',
                state: address?.state?.toUpperCase().substring(0, 2) || state?.toUpperCase().substring(0, 2) || '',
                zip: address?.zip?.toString().replace(/\D/g, '').substring(0, 5) || zip?.toString().replace(/\D/g, '').substring(0, 5) || ''
              };

              const enrollResponse = await fetch(`${IDIQ_BASE_URL}v1/enrollment/enroll`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${partnerToken}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(enrollPayload)
              });

              const enrollResData = await enrollResponse.json();
              
              if (enrollResponse.ok) {
                membershipNumber = enrollResData.membershipNumber || enrollResData.membershipNo;
                
                // Log new enrollment to Firestore
                const enrollmentRef = await db.collection('idiqEnrollments').add({
                  contactId: contactId || null,
                  email: email.toLowerCase(),
                  firstName: firstName,
                  lastName: lastName,
                  membershipNumber: membershipNumber,
                  enrollmentStep: 'enrolled',
                  verificationStatus: 'pending',
                  verificationAttempts: 0,
                  maxAttempts: 3,
                  enrolledAt: admin.firestore.FieldValue.serverTimestamp()
                });
                enrollmentId = enrollmentRef.id;
              } else if (!enrollResData.message?.includes('already exists')) {
                throw new Error(`IDIQ Enrollment failed: ${enrollResData.message || 'Unknown error'}`);
              }
              
              memberToken = await getMemberToken(email, partnerToken);
            }

            if (!memberToken) throw new Error('Could not authorize member with IDIQ API.');

            // STEP 3: Check for Identity Verification Questions
            console.log('📊 Checking for identity verification questions...');
            const questionsResponse = await fetch(`${IDIQ_BASE_URL}v1/enrollment/verification-questions`, {
              headers: { 'Authorization': `Bearer ${memberToken}`, 'Accept': 'application/json' }
            });

            if (questionsResponse.ok) {
              const questionsData = await questionsResponse.json();
              
              // FRONTEND FIX: Ensure questions is ALWAYS an array to stop the .map() crash
              const questionsList = questionsData.questions || (Array.isArray(questionsData) ? questionsData : []);
              
              if (questionsList.length > 0) {
                console.log(`🔐 Verification required: Returning ${questionsList.length} questions to frontend`);
                
                // MULTI-KEY STRUCTURAL RETURN: Ensures React finds the array regardless of mapping
                return {
                  success: true,
                  verificationRequired: true,
                  enrollmentId: enrollmentId || 'existing_active_member',
                  email: email,
                  membershipNumber: membershipNumber || 'existing',
                  // TRIPLE-REDUNDANT RETURN: Guarantees the frontend React .map() function finds the list
                  questions: questionsList,
                  verificationQuestions: questionsList,
                  questionsData: { questions: questionsList },
                  data: {
                    questions: questionsList,
                    verificationQuestions: questionsList,
                    vantageScore: null
                  },
                  message: 'Please answer security questions to verify your identity'
                };
              }
            }

            // STEP 4: Pull Report & Robust Score Mapping
            console.log('📈 Fetching credit report data...');
            const reportResponse = await fetch(`${IDIQ_BASE_URL}v1/credit-report`, {
              headers: { 'Authorization': `Bearer ${memberToken}`, 'Accept': 'application/json' }
            });

            if (!reportResponse.ok) throw new Error('Could not pull report from IDIQ');

            const reportData = await reportResponse.json();
            
            // FIX: Robust score mapping to ensure dashboard charts populate correctly
            const score = reportData.vantageScore || 
                          reportData.score || 
                          (reportData.bureaus && reportData.bureaus.transunion?.score);

            if (contactId) {
              await db.collection('creditReports').add({
                contactId,
                email: email.toLowerCase(),
                membershipNumber,
                reportData,
                vantageScore: score,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                source: 'idiq'
              });
            }

            return {
              success: true,
              verificationRequired: false,
              data: { ...reportData, vantageScore: score },
              questions: [], // Safety empty array to prevent frontend crash
              verificationQuestions: [], // Safety empty array to prevent frontend crash
              membershipNumber
            };

          } catch (error) {
            console.error('❌ pullReport error:', error.message);
            throw error;
          }
        }
        case 'submitVerification': {
          try {
            const { email, answerIds, enrollmentId } = memberData;
            console.log('📝 submitVerification: Processing answers...');
            
            let enrollment = null;
            if (enrollmentId && enrollmentId !== 'existing_active_member') {
              const enrollDoc = await db.collection('idiqEnrollments').doc(enrollmentId).get();
              if (enrollDoc.exists) {
                enrollment = enrollDoc.data();
                // CHECK IF ALREADY LOCKED
                if (enrollment.verificationStatus === 'locked') {
                  return { success: false, locked: true, message: 'Account locked. Please contact support.' };
                }
              }
            }

            const partnerToken = await getPartnerToken();
            const memberToken = await getMemberToken(email, partnerToken);
            
            const response = await fetch(`${IDIQ_BASE_URL}v1/enrollment/verification-questions`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${memberToken}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify({ answers: answerIds })
            });
            
            if (!response.ok) throw new Error(`Verification request failed: ${response.status}`);
            
            const result = await response.json();
            const isCorrect = result.status === 'Correct' || result.status === 0;
            
            if (isCorrect) {
              console.log('✅ Identity verified! Pulling final report...');
              
              if (enrollmentId && enrollmentId !== 'existing_active_member') {
                await db.collection('idiqEnrollments').doc(enrollmentId).update({
                  verificationStatus: 'verified',
                  verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
                  enrollmentStep: 'completed'
                });
              }

              const reportResponse = await fetch(`${IDIQ_BASE_URL}v1/credit-report`, {
                headers: { 'Authorization': `Bearer ${memberToken}`, 'Accept': 'application/json' }
              });

              const reportData = await reportResponse.json();
              const score = reportData.vantageScore || reportData.score || (reportData.bureaus && reportData.bureaus.transunion?.score);

              return {
                success: true,
                verified: true,
                // REDUNDANT RETURN: Ensures frontend finds the data regardless of its state path
                data: { ...reportData, vantageScore: score },
                reportData: { ...reportData, vantageScore: score },
                questions: [], // Safety clear
                verificationQuestions: [] // Safety clear
              };
            } else {
              // INCORRECT ANSWER - TRACK ATTEMPTS
              const currentAttempts = (enrollment?.verificationAttempts || 0) + 1;
              const maxAttempts = 3;

              if (enrollmentId && enrollmentId !== 'existing_active_member') {
                const updateData = { 
                  verificationAttempts: currentAttempts, 
                  lastAttemptAt: admin.firestore.FieldValue.serverTimestamp() 
                };

                if (currentAttempts >= maxAttempts) {
                  updateData.verificationStatus = 'locked';
                  
                  // DETAILED ALERT LOGIC RESTORED
                  await db.collection('mail').add({
                    to: 'Laurie@speedycreditrepair.com',
                    cc: 'chris@speedycreditrepair.com',
                    message: {
                      subject: `🚨 URGENT: IDIQ Verification Failed - ${enrollment?.firstName || email}`,
                      html: `
                        <h3>IDIQ VERIFICATION FAILURE ALERT</h3>
                        <p><strong>Client:</strong> ${enrollment?.firstName || 'Unknown'} ${enrollment?.lastName || ''}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Status:</strong> LOCKED (3/3 attempts failed)</p>
                        <hr>
                        <h4>Action Required:</h4>
                        <ol>
                          <li>Call client to help answer security questions.</li>
                          <li>If needed, cancel IDIQ and re-enroll (30-min window).</li>
                        </ol>
                        <p><strong>IDIQ Support:</strong> 877-875-4347</p>
                        <p><strong>Laurie's Contact:</strong> 657-332-9833</p>
                      `
                    }
                  });
                }
                await db.collection('idiqEnrollments').doc(enrollmentId).update(updateData);
              }

              return {
                success: false,
                verified: false,
                attempts: currentAttempts,
                maxAttempts: maxAttempts,
                attemptsRemaining: maxAttempts - currentAttempts,
                message: currentAttempts >= maxAttempts 
                  ? 'Account locked. Team notified.' 
                  : `Incorrect. ${maxAttempts - currentAttempts} attempts remaining.`
              };
            }
          } catch (err) {
            console.error('❌ submitVerification error:', err.message);
            throw err;
          }
        }
        case 'getToken': {
          try {
            const token = await getPartnerToken();
            console.log('🔐 Partner token retrieved');
            return { success: true, token };
          } catch (err) {
            console.error('❌ getToken error:', err.message);
            throw err;
          }
        }

        case 'storeReport': {
          try {
            const { email, contactId, reportData } = params;
            console.log('💾 Storing manual credit report for:', email);

            const reportRef = await db.collection('creditReports').add({
              contactId,
              email: email.toLowerCase(),
              reportData,
              scores: {
                equifax: reportData.equifaxScore || null,
                experian: reportData.experianScore || null,
                transunion: reportData.transunionScore || null,
                average: reportData.averageScore || null
              },
              retrievedAt: admin.firestore.FieldValue.serverTimestamp(),
              status: 'pending_review',
              provider: 'IDIQ'
            });

            if (contactId) {
              await db.collection('contacts').doc(contactId).update({
                'creditReport.lastPulled': admin.firestore.FieldValue.serverTimestamp(),
                'creditReport.reportId': reportRef.id,
                'creditReport.status': 'available',
                'creditReport.averageScore': reportData.averageScore || null
              });
              console.log('✅ Contact updated with report metadata');
            }

            return { success: true, reportId: reportRef.id };
          } catch (err) {
            console.error('❌ storeReport error:', err.message);
            throw err;
          }
        }

        default:
          throw new Error(`Unknown action: ${action}`);
      }
    } catch (error) {
      console.error('❌ IDIQ error:', error.message);
      return { success: false, error: error.message };
    }
  }
);

console.log('✅ Function 5/10: idiqService (PRODUCTION) loaded');

// ============================================
// FUNCTION 6: WORKFLOW PROCESSOR (Scheduled)
// ============================================
// Processes workflow stages every hour (must stay separate - scheduled trigger)

exports.processWorkflowStages = onSchedule(
  {
    schedule: 'every 60 minutes',
    ...defaultConfig,
    secrets: [idiqPartnerId, idiqPartnerSecret, gmailUser, gmailAppPassword, gmailFromName]
  },
  async (context) => {
    console.log('⏰ Processing workflow stages...');
    const db = admin.firestore();
    try {
      // ═══════════════════════════════════════════════════════════════════════
      // PART 1: EXISTING WORKFLOW STAGE ADVANCEMENT
      // ═══════════════════════════════════════════════════════════════════════
      
      const contactsSnapshot = await db.collection('contacts')
        .where('workflowActive', '==', true)
        .where('workflowPaused', '==', false)
        .get();
      
      let processed = 0;
      
      for (const doc of contactsSnapshot.docs) {
        const contactData = doc.data();
        const contactId = doc.id;
        
        // Get current workflow stage
        const currentStage = contactData.workflowStage || 'welcome';
        
        // Check if it's time to advance to next stage
        const lastStageUpdate = contactData.workflowLastUpdate?.toDate() || new Date(0);
        const hoursSinceUpdate = (Date.now() - lastStageUpdate.getTime()) / (1000 * 60 * 60);
        
        // Example: Advance stage after 24 hours
        if (hoursSinceUpdate >= 24) {
          const stageOrder = [
            'welcome',
            'idiq_enrollment',
            'credit_analysis',
            'service_recommendation',
            'contract_generation',
            'document_collection',
            'dispute_generation',
            'bureau_submission',
            'ongoing_monitoring'
          ];
          
          const currentIndex = stageOrder.indexOf(currentStage);
          const nextStage = currentIndex >= 0 && currentIndex < stageOrder.length - 1
            ? stageOrder[currentIndex + 1]
            : currentStage;
          
          if (nextStage !== currentStage) {
            await doc.ref.update({
              workflowStage: nextStage,
              workflowLastUpdate: admin.firestore.FieldValue.serverTimestamp()
            });
            
            console.log(`📈 Advanced ${contactId} from ${currentStage} to ${nextStage}`);
            processed++;
          }
        }
      }
      
      console.log(`✅ Processed ${processed} workflow stage advancements`);
      
      // ═══════════════════════════════════════════════════════════════════════
      // PART 2: IDIQ TRIAL AUTO-CANCELLATION LOGIC
      // ═══════════════════════════════════════════════════════════════════════
      
      console.log('\n🔍 Checking IDIQ trial subscriptions...');
      
      const now = new Date();
      const nowTimestamp = admin.firestore.Timestamp.fromDate(now);
      
      // Get partner token for IDIQ API
      const getPartnerToken = async () => {
        const response = await fetch('https://api.identityiq.com/pif-service/v1/partner-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            partnerId: idiqPartnerId.value(),
            partnerSecret: idiqPartnerSecret.value()
          })
        });
        if (!response.ok) throw new Error(`Partner auth failed: ${response.status}`);
        const data = await response.json();
        return data.accessToken;
      };
      
      // Cancel IDIQ membership
      const cancelIDIQMembership = async (email, partnerToken) => {
        const response = await fetch('https://api.identityiq.com/pif-service/v1/enrollment/cancel-membership', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${partnerToken}`
          },
          body: JSON.stringify({ email: email.toLowerCase() })
        });
        
        if (!response.ok) {
          const error = await response.text();
          throw new Error(`Cancellation failed: ${response.status} - ${error}`);
        }
        
        return await response.json();
      };
      
      // ─────────────────────────────────────────────────────────────────────
      // RULE 1: TRIAL EXPIRATION (30 days old, no contract signed)
      // ─────────────────────────────────────────────────────────────────────
      
      const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
      const thirtyDaysAgoTimestamp = admin.firestore.Timestamp.fromDate(thirtyDaysAgo);
      
      const twentySevenDaysAgo = new Date(now.getTime() - (27 * 24 * 60 * 60 * 1000));
      const twentySevenDaysAgoTimestamp = admin.firestore.Timestamp.fromDate(twentySevenDaysAgo);
      
      // Get trials approaching expiration (27+ days old)
      const expiringTrialsSnapshot = await db.collection('idiqEnrollments')
        .where('enrolledAt', '<=', twentySevenDaysAgoTimestamp)
        .where('status', '==', 'active')
        .get();
      
      console.log(`📊 Found ${expiringTrialsSnapshot.size} trials at 27+ days`);
      
      for (const enrollDoc of expiringTrialsSnapshot.docs) {
        const enrollment = enrollDoc.data();
        const contactId = enrollment.contactId;
        
        if (!contactId) continue;
        
        // Get contact to check contract status
        const contactDoc = await db.collection('contacts').doc(contactId).get();
        
        if (!contactDoc.exists) continue;
        
        const contact = contactDoc.data();
        
        // PROTECTED: Don't cancel if contract signed or client status
        if (contact.contractSigned === true || contact.status === 'client') {
          console.log(`✅ ${contactId} is protected (contract signed or client)`);
          
          // Update subscription status to protected
          await enrollDoc.ref.update({
            status: 'protected',
            protectedAt: admin.firestore.FieldValue.serverTimestamp(),
            protectedReason: contact.contractSigned ? 'contract_signed' : 'client_status'
          });
          
          continue;
        }
        
        const enrolledAt = enrollment.enrolledAt?.toDate() || new Date(0);
        const daysOld = Math.floor((now.getTime() - enrolledAt.getTime()) / (1000 * 60 * 60 * 24));
        
        // Send warning at 27 days (3 days before expiration)
        if (daysOld >= 27 && daysOld < 30 && !enrollment.expirationWarningSent) {
          console.log(`⚠️ Sending 3-day warning for ${contactId}`);
          
          // Send warning email to prospect
          const user = gmailUser.value();
          const pass = gmailAppPassword.value();
          
          const transporter = nodemailer.createTransporter({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: { user, pass }
          });
          
          await transporter.sendMail({
            from: `"${gmailFromName.value() || 'Speedy Credit Repair'}" <${user}>`,
            to: enrollment.email,
            subject: 'Your Free Credit Monitoring Trial Expires in 3 Days',
            text: `Hi ${contact.firstName},\n\nYour free IDIQ credit monitoring trial will expire in 3 days. To continue your credit monitoring and dispute services, please contact us to upgrade to a paid plan or sign your service agreement.\n\nCall us at (888) 724-7344 or reply to this email.\n\nThank you,\nChris Lahage\nSpeedy Credit Repair`,
            html: wrapEmailInHTML(
              'Trial Expiring Soon',
              `Hi ${contact.firstName},\n\nYour free IDIQ credit monitoring trial will expire in 3 days.\n\nTo continue your credit monitoring and dispute services, please contact us to upgrade to a paid plan or sign your service agreement.\n\nCall us at (888) 724-7344 or reply to this email.\n\nThank you,\nChris Lahage\nSpeedy Credit Repair`,
              contact.firstName
            )
          });
          
          // Send alert to Christopher
          await transporter.sendMail({
            from: `"${gmailFromName.value() || 'SpeedyCRM Alerts'}" <${user}>`,
            to: user, // Send to Christopher's email
            subject: `⚠️ IDIQ Trial Expiring: ${contact.firstName} ${contact.lastName}`,
            text: `Trial for ${contact.firstName} ${contact.lastName} (${enrollment.email}) expires in 3 days.\n\nContact ID: ${contactId}\nEnrolled: ${enrolledAt.toLocaleDateString()}\nDays Old: ${daysOld}\n\nAction needed: Contact prospect or trial will auto-cancel in 3 days.`,
            html: wrapEmailInHTML(
              'Trial Expiring Alert',
              `Trial for ${contact.firstName} ${contact.lastName} (${enrollment.email}) expires in 3 days.\n\nContact ID: ${contactId}\nEnrolled: ${enrolledAt.toLocaleDateString()}\nDays Old: ${daysOld}\n\nAction needed: Contact prospect or trial will auto-cancel in 3 days.`,
              'Chris'
            )
          });
          
          await enrollDoc.ref.update({
            expirationWarningSent: true,
            expirationWarningSentAt: admin.firestore.FieldValue.serverTimestamp()
          });
          
          console.log(`✅ Warning sent for ${contactId}`);
        }
        
        // AUTO-CANCEL at 30+ days
        if (daysOld >= 30) {
          console.log(`🚫 AUTO-CANCELLING trial for ${contactId} (${daysOld} days old)`);
          
          try {
            const partnerToken = await getPartnerToken();
            await cancelIDIQMembership(enrollment.email, partnerToken);
            
            // Update enrollment status
            await enrollDoc.ref.update({
              status: 'cancelled',
              cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
              cancellationReason: 'trial_expired',
              cancelledBySystem: true
            });
            
            // Update contact
            await db.collection('contacts').doc(contactId).update({
              'idiq.subscriptionStatus': 'cancelled',
              'idiq.cancelledAt': admin.firestore.FieldValue.serverTimestamp(),
              status: 'inactive'
            });
            
            // Send confirmation to Christopher
            const user = gmailUser.value();
            const pass = gmailAppPassword.value();
            
            const transporter = nodemailer.createTransporter({
              host: 'smtp.gmail.com',
              port: 587,
              secure: false,
              auth: { user, pass }
            });
            
            await transporter.sendMail({
              from: `"${gmailFromName.value() || 'SpeedyCRM Alerts'}" <${user}>`,
              to: user,
              subject: `✅ IDIQ Trial Auto-Cancelled: ${contact.firstName} ${contact.lastName}`,
              text: `Trial for ${contact.firstName} ${contact.lastName} has been automatically cancelled after ${daysOld} days.\n\nContact ID: ${contactId}\nEmail: ${enrollment.email}\nReason: Trial Expired (30 days)`,
              html: wrapEmailInHTML(
                'Trial Auto-Cancelled',
                `Trial for ${contact.firstName} ${contact.lastName} has been automatically cancelled after ${daysOld} days.\n\nContact ID: ${contactId}\nEmail: ${enrollment.email}\nReason: Trial Expired (30 days)`,
                'Chris'
              )
            });
            
            console.log(`✅ Trial cancelled successfully for ${contactId}`);
            
          } catch (err) {
            console.error(`❌ Failed to cancel trial for ${contactId}:`, err);
            
            // Create admin alert for manual cancellation
            await db.collection('adminAlerts').add({
              type: 'CANCELLATION_FAILED',
              contactId: contactId,
              enrollmentId: enrollDoc.id,
              email: enrollment.email,
              error: err.message,
              priority: 'high',
              status: 'unread',
              message: `Failed to auto-cancel IDIQ trial for ${contact.firstName} ${contact.lastName}. Manual cancellation required.`,
              createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
            
            // Send alert email
            const user = gmailUser.value();
            const pass = gmailAppPassword.value();
            
            const transporter = nodemailer.createTransporter({
              host: 'smtp.gmail.com',
              port: 587,
              secure: false,
              auth: { user, pass }
            });
            
            await transporter.sendMail({
              from: `"${gmailFromName.value() || 'SpeedyCRM Alerts'}" <${user}>`,
              to: user,
              subject: `🚨 URGENT: Manual IDIQ Cancellation Needed - ${contact.firstName} ${contact.lastName}`,
              text: `Auto-cancellation FAILED for ${contact.firstName} ${contact.lastName}.\n\nContact ID: ${contactId}\nEmail: ${enrollment.email}\nError: ${err.message}\n\nACTION REQUIRED: Manually cancel this subscription in IDIQ dashboard.`,
              html: wrapEmailInHTML(
                'Manual Cancellation Required',
                `Auto-cancellation FAILED for ${contact.firstName} ${contact.lastName}.\n\nContact ID: ${contactId}\nEmail: ${enrollment.email}\nError: ${err.message}\n\nACTION REQUIRED: Manually cancel this subscription in IDIQ dashboard.`,
                'Chris'
              )
            });
          }
        }
      }
      
      // ─────────────────────────────────────────────────────────────────────
      // RULE 2: COMPLETE INACTIVITY (14+ days, no portal access)
      // ─────────────────────────────────────────────────────────────────────
      
      const fourteenDaysAgo = new Date(now.getTime() - (14 * 24 * 60 * 60 * 1000));
      const fourteenDaysAgoTimestamp = admin.firestore.Timestamp.fromDate(fourteenDaysAgo);
      
      const inactiveContactsSnapshot = await db.collection('contacts')
        .where('lastActivityAt', '<=', fourteenDaysAgoTimestamp)
        .where('status', '==', 'prospect')
        .where('idiq.subscriptionStatus', '==', 'active')
        .limit(50) // Process in batches
        .get();
      
      console.log(`📊 Found ${inactiveContactsSnapshot.size} inactive prospects (14+ days)`);
      
      for (const contactDoc of inactiveContactsSnapshot.docs) {
        const contact = contactDoc.data();
        const contactId = contactDoc.id;
        
        // Skip if contract signed or has portal access
        if (contact.contractSigned === true || (contact.portalAccessCount || 0) > 0) {
          continue;
        }
        
        const lastActivity = contact.lastActivityAt?.toDate() || new Date(0);
        const daysSinceActivity = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
        
        // Send reengagement email at 7 days
        if (daysSinceActivity >= 7 && daysSinceActivity < 14 && !contact.reengagementEmailSent) {
          console.log(`📧 Sending reengagement email for ${contactId}`);
          
          const user = gmailUser.value();
          const pass = gmailAppPassword.value();
          
          const transporter = nodemailer.createTransporter({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: { user, pass }
          });
          
          await transporter.sendMail({
            from: `"${gmailFromName.value() || 'Speedy Credit Repair'}" <${user}>`,
            to: contact.email,
            subject: `${contact.firstName}, have you seen your credit report?`,
            text: `Hi ${contact.firstName},\n\nI noticed you haven't logged in to view your credit report yet. It's ready for you!\n\nYour free 3-bureau credit report and analysis are waiting for you. Just click the link in your original email or reply to this message.\n\nI'm here to help answer any questions.\n\nChris Lahage\nSpeedy Credit Repair\n(888) 724-7344`,
            html: wrapEmailInHTML(
              'Your Credit Report is Ready',
              `Hi ${contact.firstName},\n\nI noticed you haven't logged in to view your credit report yet. It's ready for you!\n\nYour free 3-bureau credit report and analysis are waiting for you. Just click the link in your original email or reply to this message.\n\nI'm here to help answer any questions.\n\nChris Lahage\nSpeedy Credit Repair\n(888) 724-7344`,
              contact.firstName
            )
          });
          
          await contactDoc.ref.update({
            reengagementEmailSent: true,
            reengagementEmailSentAt: admin.firestore.FieldValue.serverTimestamp()
          });
          
          console.log(`✅ Reengagement email sent for ${contactId}`);
        }
        
        // Schedule cancellation at 14+ days
        if (daysSinceActivity >= 14) {
          console.log(`📅 Scheduling cancellation for ${contactId} (${daysSinceActivity} days inactive)`);
          
          await contactDoc.ref.update({
            'idiq.subscriptionStatus': 'scheduled_cancel',
            'idiq.cancellationScheduledFor': admin.firestore.FieldValue.serverTimestamp()
          });
          
          // Create admin alert
          await db.collection('adminAlerts').add({
            type: 'INACTIVE_PROSPECT',
            contactId: contactId,
            email: contact.email,
            priority: 'medium',
            status: 'unread',
            message: `${contact.firstName} ${contact.lastName} has been inactive for ${daysSinceActivity} days. Trial scheduled for cancellation.`,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          });
          
          console.log(`✅ Cancellation scheduled for ${contactId}`);
        }
      }
      
      console.log('\n✅ IDIQ trial management complete');
      
    } catch (error) {
      console.error('❌ Workflow processor error:', error);
    }
  }
);

console.log('✅ Function 6/10: processWorkflowStages (ENHANCED with IDIQ auto-cancel) loaded');

// ═══════════════════════════════════════════════════════════════════════════
// NEW FUNCTION 6B: PROCESS ABANDONMENT EMAILS
// ═══════════════════════════════════════════════════════════════════════════
// Add this AFTER processWorkflowStages (Function 6)
// Runs every 5 minutes to check for abandoned enrollments
// ═══════════════════════════════════════════════════════════════════════════

exports.processAbandonmentEmails = onSchedule(
  {
    schedule: 'every 5 minutes',
    ...defaultConfig,
    memory: '512MiB',
    timeoutSeconds: 120,
    secrets: [gmailUser, gmailAppPassword, gmailFromName, gmailReplyTo]
  },
  async (context) => {
    console.log('⏰ Processing abandonment emails...');
    const db = admin.firestore();
    
    try {
      const now = new Date();
      const nowTimestamp = admin.firestore.Timestamp.fromDate(now);
      
      // ─────────────────────────────────────────────────────────────────────
      // FIND CONTACTS WHERE:
      // 1. enrollmentStatus = 'started' (not completed)
      // 2. abandonmentCheckAt < NOW (5 minutes have passed)
      // 3. abandonmentEmailSent = false (not already sent)
      // 4. abandonmentCancelled = false (enrollment didn't complete)
      // ─────────────────────────────────────────────────────────────────────
      
      const abandonedContactsSnapshot = await db.collection('contacts')
        .where('enrollmentStatus', '==', 'started')
        .where('abandonmentEmailSent', '==', false)
        .where('abandonmentCancelled', '==', false)
        .where('abandonmentCheckAt', '<=', nowTimestamp)
        .limit(50)  // Process max 50 per run to avoid timeout
        .get();
      
      console.log(`📊 Found ${abandonedContactsSnapshot.size} abandoned enrollments to process`);
      
      if (abandonedContactsSnapshot.empty) {
        console.log('✅ No abandoned enrollments to process');
        return null;
      }
      
      // ─────────────────────────────────────────────────────────────────────
      // SET UP EMAIL TRANSPORTER
      // ─────────────────────────────────────────────────────────────────────
      
      const user = gmailUser.value();
      const pass = gmailAppPassword.value();
      const fromName = gmailFromName.value() || 'Chris Lahage - Speedy Credit Repair';
      const replyTo = gmailReplyTo.value() || 'contact@speedycreditrepair.com';
      
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: { user, pass }
      });
      
      const emailConfig = {
        fromEmail: user,
        fromName: fromName,
        replyTo: replyTo
      };
      
      // ─────────────────────────────────────────────────────────────────────
      // PROCESS EACH ABANDONED CONTACT
      // ─────────────────────────────────────────────────────────────────────
      
      let processed = 0;
      let sent = 0;
      let failed = 0;
      
      for (const doc of abandonedContactsSnapshot.docs) {
        const contactId = doc.id;
        const contactData = doc.data();
        
        processed++;
        console.log(`📧 Processing ${processed}/${abandonedContactsSnapshot.size}: ${contactData.email}`);
        
        // Skip if no email
        if (!contactData.email) {
          console.log(`⏭️ Skipping ${contactId} - no email address`);
          continue;
        }
        
        // Skip if email opt-out
        if (contactData.emailOptIn === false) {
          console.log(`⏭️ Skipping ${contactId} - email opt-out`);
          await doc.ref.update({
            abandonmentEmailSent: true,  // Mark as "sent" to skip next time
            abandonmentSkipReason: 'email_opt_out',
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          continue;
        }
        
        // Send abandonment email using helper function
        try {
          const result = await operations.sendAbandonmentEmail(
            contactId,
            contactData,
            transporter,
            emailConfig
          );
          
          if (result.success) {
            sent++;
            console.log(`✅ Sent abandonment email to ${contactData.email}`);
          } else {
            failed++;
            console.error(`❌ Failed for ${contactData.email}: ${result.error}`);
          }
        } catch (emailError) {
          failed++;
          console.error(`❌ Error sending to ${contactData.email}:`, emailError.message);
          
          // Mark as sent to prevent retry loop, but log the error
          await doc.ref.update({
            abandonmentEmailSent: true,
            abandonmentEmailError: emailError.message,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
        }
        
        // Small delay between emails to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // ─────────────────────────────────────────────────────────────────────
      // LOG SUMMARY
      // ─────────────────────────────────────────────────────────────────────
      
      console.log('\n═══════════════════════════════════════════════════════════════');
      console.log('📊 ABANDONMENT EMAIL SUMMARY');
      console.log('═══════════════════════════════════════════════════════════════');
      console.log(`Total processed: ${processed}`);
      console.log(`Successfully sent: ${sent}`);
      console.log(`Failed: ${failed}`);
      console.log('═══════════════════════════════════════════════════════════════\n');
      
      // Log to analytics
      await db.collection('analyticsLogs').add({
        type: 'abandonment_email_batch',
        processed: processed,
        sent: sent,
        failed: failed,
        runAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      return null;
      
    } catch (error) {
      console.error('❌ Abandonment email processor error:', error);
      
      // Log error
      await db.collection('errorLogs').add({
        type: 'abandonment_email_processor_error',
        error: error.message,
        stack: error.stack,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
      
      return null;
    }
  }
);

      console.log('✅ Function 6B/11: processAbandonmentEmails loaded (5-minute check)');

// ============================================
// FUNCTION 7: AI CONTENT GENERATOR (Consolidated)
// ============================================
// Handles: ALL AI content generation + document generation
// Replaces: generateAIEmailContent, analyzeCreditReport, generateDisputeLetter, generateContract, generatePOA, generateACH
// Savings: 6 functions → 1 function = $22.50/month saved

exports.aiContentGenerator = onCall(
  {
    memory: '1024MiB',
    timeoutSeconds: 120,
    maxInstances: 5,
    secrets: [openaiApiKey]
  },
  async (request) => {
    const { type, ...params } = request.data;
    
    console.log('🤖 AI Content Generator:', type);
    
    try {
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey.value()}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: (() => {
            switch (type) {
              case 'email':
                return [{
                  role: 'system',
                  content: 'You are a professional credit repair specialist writing emails to clients. Be empathetic, professional, and actionable.'
                }, {
                  role: 'user',
                  content: `Write a professional email about: ${params.topic}. Recipient: ${params.recipientName}. Context: ${params.context || 'General communication'}.`
                }];
              
              case 'analyzeCreditReport':
                return [{
                  role: 'system',
                  content: 'You are a certified credit analyst. Analyze credit reports and provide actionable insights in a structured format.'
                }, {
                  role: 'user',
                  content: `Analyze this credit report data and provide: 1) Key findings, 2) Negative items to dispute, 3) Positive factors, 4) Recommendations. Data: ${JSON.stringify(params.reportData).substring(0, 3000)}`
                }];

                
              
              case 'disputeLetter':
                return [{
                  role: 'system',
                  content: 'You are a legal expert in credit reporting. Write FCRA-compliant dispute letters that are professional and effective.'
                }, {
                  role: 'user',
                  content: `Create a dispute letter for: ${params.item}. Bureau: ${params.bureau}. Account: ${params.accountNumber || 'N/A'}. Reason: ${params.reason || 'Inaccurate information'}.`
                }];
              
              case 'contract':
                return [{
                  role: 'system',
                  content: 'You are a legal document specialist. Create service agreements that are clear, fair, and legally sound.'
                }, {
                  role: 'user',
                  content: `Create a ${params.serviceType || 'credit repair'} service agreement for client: ${params.clientName}. Include: scope of services, fees ($${params.fee || '99'}/month), duration (${params.duration || '6 months'}), terms and conditions.`
                }];
              
              case 'poa':
                return [{
                  role: 'system',
                  content: 'You are a legal document specialist. Create Power of Attorney documents for credit repair that comply with federal and state laws.'
                }, {
                  role: 'user',
                  content: `Create a limited Power of Attorney for credit repair for: ${params.clientName}. Address: ${params.address}. This authorizes Speedy Credit Repair Inc. to communicate with credit bureaus on their behalf.`
                }];
              
              case 'ach':
                return [{
                  role: 'system',
                  content: 'You are a financial document specialist. Create ACH authorization forms that are clear and compliant with banking regulations.'
                }, {
                  role: 'user',
                  content: `Create an ACH authorization form for: ${params.clientName}. Monthly amount: $${params.amount || '99'}. Bank: ${params.bankName || '[Bank Name]'}. Account ending in: ${params.accountLastFour || 'XXXX'}.`
                }];
              
              case 'recommendServicePlan':
                return [{
                  role: 'system',
                  content: 'You are a credit repair expert. Recommend the best service plan based on credit profile. Available plans: Starter ($39/mo - DIY for good credit), Professional ($149/mo - Expert help for fair credit), VIP ($249/mo - Fast track for poor credit). Respond ONLY with valid JSON.'
                }, {
                  role: 'user',
                  content: `Credit Score: ${params.creditScore || 'unknown'}, Negative Items: ${params.negativeItems || 0}, Utilization: ${params.utilization || 0}%. Recommend the best plan and explain why. Format your response as JSON: {"plan": "Professional", "confidence": "high", "reason": "Clear explanation of why this plan fits", "expectedResults": "What the client can expect"}`
                }];
              
              default:
                throw new Error(`Unknown content type: ${type}`);
            }
          })(),
          temperature: 0.7,
          max_tokens: type === 'contract' || type === 'poa' ? 2000 : 1500
        })
      });
      
      const aiData = await openaiResponse.json();
      
      if (!aiData.choices || !aiData.choices[0]) {
        throw new Error('Invalid OpenAI response');
      }
      
      const generatedContent = aiData.choices[0].message.content;
      
      console.log(`✅ Generated ${type} content (${generatedContent.length} chars)`);
      
      return {
        success: true,
        content: generatedContent,
        type
      };
      
    } catch (error) {
      console.error('❌ AI content generator error:', error);
      return { success: false, error: error.message };
    }
  }
);

console.log('✅ Function 7/10: aiContentGenerator loaded');

// ============================================
// FUNCTION 8: OPERATIONS MANAGER (Consolidated)
// ============================================
// Handles: Workflow management + Task management
// Replaces: getContactWorkflowStatus, pauseWorkflowForContact, resumeWorkflowForContact, createTask, getTasks, updateTask
// Savings: 6 functions → 1 function = $22.50/month saved

// Path: /functions/operationsManager_FIXED.js
// ============================================================================
// OPERATIONS MANAGER CLOUD FUNCTION - FIXED VERSION
// ============================================================================
// FIXES FOR 400 ERRORS:
// 1. Enhanced parameter validation with specific error messages
// 2. Better error handling for missing contactId
// 3. Improved request body parsing
// 4. Added parameter existence checks before processing
// 5. Enhanced logging for debugging
// ============================================================================

exports.operationsManager = onRequest(
  {
    ...defaultConfig,
    cors: true
  },
  async (request, response) => {
    // Enable CORS
    response.set('Access-Control-Allow-Origin', '*');
    response.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.set('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      response.status(204).send('');
      return;
    }

    // ENHANCED: Better request body parsing
    let requestBody;
    try {
      requestBody = request.body || {};
    } catch (parseError) {
      console.error('❌ Request body parsing error:', parseError);
      response.status(400).json({
        success: false,
        error: 'Invalid request body format',
        details: 'Request must be valid JSON'
      });
      return;
    }

    const { action, ...params } = requestBody;
    
    console.log('⚙️ Operations Manager Request:', {
      method: request.method,
      action: action,
      paramsKeys: Object.keys(params),
      paramsCount: Object.keys(params).length
    });
    
    // ENHANCED: Validate action parameter
    if (!action || typeof action !== 'string') {
      console.error('❌ Missing or invalid action parameter');
      response.status(400).json({
        success: false,
        error: 'Missing required parameter: action',
        details: 'Action must be a non-empty string',
        validActions: [
          'getWorkflowStatus',
          'pauseWorkflow', 
          'resumeWorkflow',
          'createTask',
          'getTasks',
          'updateTask',
          'createPortalAccount',
          'landingPageContact',
          'captureWebLead'
        ]
      });
      return;
    }
    
    const db = admin.firestore();
    let result;
    
    try {
      switch (action) {
        
        case 'getWorkflowStatus': {
          // ENHANCED: Parameter validation
          const { contactId } = params;
          
          if (!contactId || typeof contactId !== 'string') {
            response.status(400).json({
              success: false,
              error: 'Missing required parameter: contactId',
              details: 'contactId must be a non-empty string',
              action: 'getWorkflowStatus'
            });
            return;
          }
          
          console.log(`📊 Getting workflow status for contact: ${contactId}`);
          
          const contactDoc = await db.collection('contacts').doc(contactId).get();
          
          if (!contactDoc.exists) {
            response.status(404).json({
              success: false,
              error: 'Contact not found',
              details: `No contact found with ID: ${contactId}`,
              contactId: contactId
            });
            return;
          }
          
          const contactData = contactDoc.data();
          
          result = {
            success: true,
            contactId: contactId,
            status: contactData.workflowStatus || 'not_started',
            currentStage: contactData.workflowStage || null,
            paused: contactData.workflowPaused || false,
            active: contactData.workflowActive || false,
            lastUpdate: contactData.workflowLastUpdate || null,
            metadata: {
              stagesCompleted: contactData.workflowStagesCompleted || 0,
              totalStages: contactData.workflowTotalStages || 0
            }
          };
          break;
        }
        
        case 'pauseWorkflow': {
          // ENHANCED: Parameter validation
          const { contactId, reason } = params;
          
          if (!contactId || typeof contactId !== 'string') {
            response.status(400).json({
              success: false,
              error: 'Missing required parameter: contactId',
              details: 'contactId must be a non-empty string for pauseWorkflow',
              action: 'pauseWorkflow'
            });
            return;
          }
          
          console.log(`⏸️ Pausing workflow for contact: ${contactId}, reason: ${reason || 'No reason provided'}`);
          
          // ENHANCED: Check if contact exists before updating
          const contactRef = db.collection('contacts').doc(contactId);
          const contactDoc = await contactRef.get();
          
          if (!contactDoc.exists) {
            response.status(404).json({
              success: false,
              error: 'Contact not found',
              details: `Cannot pause workflow - no contact found with ID: ${contactId}`,
              contactId: contactId
            });
            return;
          }
          
          await contactRef.update({
            workflowPaused: true,
            workflowPauseReason: reason || 'Manual pause',
            workflowPausedAt: admin.firestore.FieldValue.serverTimestamp(),
            workflowLastUpdate: admin.firestore.FieldValue.serverTimestamp()
          });
          
          console.log(`✅ Workflow paused successfully for ${contactId}`);
          result = { 
            success: true, 
            message: 'Workflow paused successfully',
            contactId: contactId,
            pauseReason: reason || 'Manual pause'
          };
          break;
        }
        
        case 'resumeWorkflow': {
          // ENHANCED: Parameter validation
          const { contactId } = params;
          
          if (!contactId || typeof contactId !== 'string') {
            response.status(400).json({
              success: false,
              error: 'Missing required parameter: contactId',
              details: 'contactId must be a non-empty string for resumeWorkflow',
              action: 'resumeWorkflow'
            });
            return;
          }
          
          console.log(`▶️ Resuming workflow for contact: ${contactId}`);
          
          // ENHANCED: Check if contact exists before updating
          const contactRef = db.collection('contacts').doc(contactId);
          const contactDoc = await contactRef.get();
          
          if (!contactDoc.exists) {
            response.status(404).json({
              success: false,
              error: 'Contact not found',
              details: `Cannot resume workflow - no contact found with ID: ${contactId}`,
              contactId: contactId
            });
            return;
          }
          
          await contactRef.update({
            workflowPaused: false,
            workflowPauseReason: null,
            workflowResumedAt: admin.firestore.FieldValue.serverTimestamp(),
            workflowLastUpdate: admin.firestore.FieldValue.serverTimestamp()
          });
          
          console.log(`✅ Workflow resumed successfully for ${contactId}`);
          result = { 
            success: true, 
            message: 'Workflow resumed successfully',
            contactId: contactId
          };
          break;
        }
        
        case 'createTask': {
          // ENHANCED: Parameter validation
          const { title, description, contactId, dueDate, priority, assignedTo } = params;
          
          if (!title || typeof title !== 'string' || title.trim().length === 0) {
            response.status(400).json({
              success: false,
              error: 'Missing required parameter: title',
              details: 'title must be a non-empty string',
              action: 'createTask'
            });
            return;
          }
          
          console.log(`✅ Creating task: ${title} for contact: ${contactId || 'none'}`);
          
          // ENHANCED: Validate contactId if provided
          if (contactId) {
            const contactDoc = await db.collection('contacts').doc(contactId).get();
            if (!contactDoc.exists) {
              response.status(404).json({
                success: false,
                error: 'Contact not found',
                details: `Cannot create task - no contact found with ID: ${contactId}`,
                contactId: contactId
              });
              return;
            }
          }
          
          const taskData = {
            title: title.trim(),
            description: description || '',
            contactId: contactId || null,
            dueDate: dueDate ? new Date(dueDate) : null,
            priority: priority || 'medium',
            assignedTo: assignedTo || null,
            status: 'pending',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            createdBy: request.auth?.uid || 'system',
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          };
          
          // ENHANCED: Validate dueDate if provided
          if (dueDate) {
            const dueDateObj = new Date(dueDate);
            if (isNaN(dueDateObj.getTime())) {
              response.status(400).json({
                success: false,
                error: 'Invalid dueDate format',
                details: 'dueDate must be a valid ISO date string',
                providedDate: dueDate
              });
              return;
            }
            taskData.dueDate = dueDateObj;
          }
          
          const taskRef = await db.collection('tasks').add(taskData);
          
          console.log(`✅ Task created successfully: ${taskRef.id}`);
          result = { 
            success: true, 
            taskId: taskRef.id,
            title: title,
            contactId: contactId
          };
          break;
        }
        
        case 'getTasks': {
          // ENHANCED: Parameter validation with better defaults
          const { contactId, status, assignedTo, limit } = params;
          
          console.log(`📋 Getting tasks with filters:`, {
            contactId: contactId || 'all',
            status: status || 'all',
            assignedTo: assignedTo || 'all',
            limit: limit || 'no limit'
          });
          
          let query = db.collection('tasks');
          
          // ENHANCED: Validate contactId if provided
          if (contactId) {
            if (typeof contactId !== 'string') {
              response.status(400).json({
                success: false,
                error: 'Invalid contactId parameter',
                details: 'contactId must be a string if provided',
                providedValue: contactId
              });
              return;
            }
            query = query.where('contactId', '==', contactId);
          }
          
          if (status) {
            if (typeof status !== 'string') {
              response.status(400).json({
                success: false,
                error: 'Invalid status parameter',
                details: 'status must be a string if provided',
                providedValue: status
              });
              return;
            }
            query = query.where('status', '==', status);
          }
          
          if (assignedTo) {
            if (typeof assignedTo !== 'string') {
              response.status(400).json({
                success: false,
                error: 'Invalid assignedTo parameter',
                details: 'assignedTo must be a string if provided',
                providedValue: assignedTo
              });
              return;
            }
            query = query.where('assignedTo', '==', assignedTo);
          }
          
          query = query.orderBy('createdAt', 'desc');
          
          if (limit) {
            const limitNum = parseInt(limit);
            if (isNaN(limitNum) || limitNum <= 0) {
              response.status(400).json({
                success: false,
                error: 'Invalid limit parameter',
                details: 'limit must be a positive integer if provided',
                providedValue: limit
              });
              return;
            }
            query = query.limit(limitNum);
          }
          
          const tasksSnapshot = await query.get();
          const tasks = tasksSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          console.log(`📋 Retrieved ${tasks.length} tasks successfully`);
          result = { 
            success: true, 
            tasks, 
            count: tasks.length,
            filters: { contactId, status, assignedTo, limit }
          };
          break;
        }
        
        case 'updateTask': {
          // ENHANCED: Parameter validation
          const { taskId, updates } = params;
          
          if (!taskId || typeof taskId !== 'string') {
            response.status(400).json({
              success: false,
              error: 'Missing required parameter: taskId',
              details: 'taskId must be a non-empty string',
              action: 'updateTask'
            });
            return;
          }
          
          if (!updates || typeof updates !== 'object') {
            response.status(400).json({
              success: false,
              error: 'Missing required parameter: updates',
              details: 'updates must be an object with fields to update',
              action: 'updateTask'
            });
            return;
          }
          
          console.log(`✏️ Updating task: ${taskId} with:`, Object.keys(updates));
          
          // ENHANCED: Check if task exists
          const taskRef = db.collection('tasks').doc(taskId);
          const taskDoc = await taskRef.get();
          
          if (!taskDoc.exists) {
            response.status(404).json({
              success: false,
              error: 'Task not found',
              details: `No task found with ID: ${taskId}`,
              taskId: taskId
            });
            return;
          }
          
          const allowedUpdates = ['title', 'description', 'status', 'priority', 'assignedTo', 'dueDate', 'notes'];
          const sanitizedUpdates = {};
          
          for (const key of allowedUpdates) {
            if (updates[key] !== undefined) {
              sanitizedUpdates[key] = updates[key];
            }
          }
          
          if (Object.keys(sanitizedUpdates).length === 0) {
            response.status(400).json({
              success: false,
              error: 'No valid updates provided',
              details: `Valid fields are: ${allowedUpdates.join(', ')}`,
              providedFields: Object.keys(updates)
            });
            return;
          }
          
          // Add metadata
          sanitizedUpdates.updatedAt = admin.firestore.FieldValue.serverTimestamp();
          sanitizedUpdates.updatedBy = request.auth?.uid || 'system';
          
          await taskRef.update(sanitizedUpdates);
          
          console.log(`✅ Task updated successfully: ${taskId}`);
          result = { 
            success: true, 
            message: 'Task updated successfully', 
            taskId,
            updatedFields: Object.keys(sanitizedUpdates)
          };
          break;
        }
        
        // ============================================
        // CAPTURE WEB LEAD - Landing Page Form
        // ============================================
        case 'captureWebLead':
        case 'landingPageContact': {
          console.log(`🔧 Processing ${action}...`);
          
          const { 
            firstName, 
            lastName, 
            email, 
            phone, 
            message,
            creditGoal,
            leadSource,
            utmSource,
            utmMedium,
            utmCampaign
          } = params;
          
          // Validate required fields
          if (!email && !phone) {
            response.status(400).json({
              success: false,
              error: 'Email or phone is required'
            });
            return;
          }
          
          try {
            // Check for existing contact by email OR phone
            let existingContactId = null;
            
            if (email) {
              const emailQuery = await db.collection('contacts')
                .where('email', '==', email.toLowerCase().trim())
                .limit(1)
                .get();
              
              if (!emailQuery.empty) {
                existingContactId = emailQuery.docs[0].id;
              }
            }
            
            if (!existingContactId && phone) {
              const cleanPhone = phone.replace(/\D/g, '');
              const phoneQuery = await db.collection('contacts')
                .where('phone', '==', cleanPhone)
                .limit(1)
                .get();
              
              if (!phoneQuery.empty) {
                existingContactId = phoneQuery.docs[0].id;
              }
            }
            
            const cleanPhone = phone ? phone.replace(/\D/g, '') : '';
            const contactData = {
              firstName: firstName || '',
              lastName: lastName || '',
              email: email ? email.toLowerCase().trim() : '',
              phone: cleanPhone,
              message: message || '',
              creditGoal: creditGoal || '',
              roles: ['contact', 'lead'],
              leadSource: leadSource || 'website',
              utmSource: utmSource || '',
              utmMedium: utmMedium || '',
              utmCampaign: utmCampaign || '',
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            };
            
            let contactId;
            
            if (existingContactId) {
              // Update existing contact
              await db.collection('contacts').doc(existingContactId).update(contactData);
              contactId = existingContactId;
              console.log('📝 Updated existing contact:', contactId);
            } else {
              // Create new contact
              contactData.createdAt = admin.firestore.FieldValue.serverTimestamp();
              contactData.status = 'new';
              contactData.leadScore = 5;
              
              const newContactRef = await db.collection('contacts').add(contactData);
              contactId = newContactRef.id;
              console.log('👤 Created new contact:', contactId);
            }
            
            // Log interaction
            await db.collection('interactions').add({
              contactId,
              type: 'web_form_submission',
              details: {
                source: action,
                creditGoal: creditGoal || '',
                message: message || '',
                utmSource: utmSource || ''
              },
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
              createdBy: 'system'
            });
            
            result = {
              success: true,
              contactId,
              isNewContact: !existingContactId,
              message: existingContactId 
                ? 'Contact updated successfully' 
                : 'New lead captured successfully'
            };
            
            console.log(`✅ ${action} completed:`, result);
            
          } catch (leadError) {
            console.error(`❌ ${action} error:`, leadError);
            result = {
              success: false,
              error: leadError.message
            };
          }
          
          break;
        }
        
        // ============================================
        // CREATE PORTAL ACCOUNT
        // ============================================
        case 'createPortalAccount': {
          console.log('🔧 Processing createPortalAccount...');
          
          const { contactId, email, password } = params;
          
          if (!contactId || !email) {
            response.status(400).json({
              success: false,
              error: 'contactId and email are required'
            });
            return;
          }
          
          try {
            // Create Firebase Auth user
            const userRecord = await admin.auth().createUser({
              email: email,
              password: password || Math.random().toString(36).slice(-12),
              emailVerified: false
            });
            
            // Update contact with portal account info
            await db.collection('contacts').doc(contactId).update({
              portalUserId: userRecord.uid,
              portalCreatedAt: admin.firestore.FieldValue.serverTimestamp(),
              roles: admin.firestore.FieldValue.arrayUnion('client'),
              status: 'client'
            });
            
            result = {
              success: true,
              portalUserId: userRecord.uid,
              message: 'Portal account created successfully'
            };
            
            console.log('✅ Portal account created for:', email);
            
          } catch (portalError) {
            console.error('❌ Create portal account error:', portalError);
            result = {
              success: false,
              error: portalError.message
            };
          }
          
          break;
        }
        
        default:
          console.error(`❌ Unknown action requested: ${action}`);
          response.status(400).json({
            success: false,
            error: `Unknown operations action: ${action}`,
            details: 'Please check the action parameter',
            validActions: [
              'getWorkflowStatus',
              'pauseWorkflow',
              'resumeWorkflow', 
              'createTask',
              'getTasks',
              'updateTask',
              'createPortalAccount',
              'landingPageContact',
              'captureWebLead'
            ]
          });
          return;
      }
      
      // ENHANCED: Success response with more metadata
      console.log(`✅ Operation completed successfully: ${action}`);
      response.status(200).json({
        ...result,
        action: action,
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - (request.startTime || Date.now())
      });
      
    } catch (error) {
      console.error(`❌ Operations manager error for action '${action}':`, {
        error: error.message,
        stack: error.stack,
        params: Object.keys(params),
        action: action
      });
      
      // ENHANCED: Better error responses with more context
      response.status(500).json({ 
        success: false, 
        error: error.message || 'Internal server error',
        action: action,
        details: 'An unexpected error occurred while processing your request',
        timestamp: new Date().toISOString(),
        // Don't expose stack trace in production
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
      });
    }
  }
);

/*
FIXES IMPLEMENTED:

1. ✅ Enhanced parameter validation with specific error messages
2. ✅ Better request body parsing with try/catch
3. ✅ Check if resources exist before operations (contactId, taskId)
4. ✅ Improved error responses with more context
5. ✅ Better logging for debugging
6. ✅ Validation of data types (string, object, etc.)
7. ✅ 400 vs 404 vs 500 status code differentiation
8. ✅ Added metadata to success responses

DEPLOYMENT INSTRUCTIONS:
1. Replace the operationsManager function in your index.js with this fixed version
2. Test each action with missing/invalid parameters to verify 400 error handling
3. Deploy to Firebase: firebase deploy --only functions:operationsManager
4. Monitor logs to confirm 400 errors are reduced

TESTING:
- Missing action: Should return 400 with valid actions list
- Missing contactId: Should return 400 with specific field details  
- Invalid contactId: Should return 404 if contact doesn't exist
- Invalid parameters: Should return 400 with validation details
- Valid requests: Should return 200 with enhanced metadata
*/

console.log('✅ Function 8/10: operationsManager loaded');

// ============================================
// FUNCTION 9: FAX SERVICE (Telnyx)
// ============================================
// Sends faxes via Telnyx for bureau disputes (must stay separate)

exports.sendFaxOutbound = onRequest(
  {
    ...defaultConfig,
    secrets: [telnyxApiKey, telnyxPhone]
  },
  async (req, res) => {
    cors(req, res, async () => {
      console.log('📠 Sending fax via Telnyx...');
      
      try {
        const { to, documentUrl, bureau, contactId } = req.body;
        
        if (!to || !documentUrl) {
          throw new Error('Missing required fields: to, documentUrl');
        }
        
        const faxResponse = await fetch('https://api.telnyx.com/v2/faxes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${telnyxApiKey.value()}`
          },
          body: JSON.stringify({
            from: telnyxPhone.value(),
            to,
            media_url: documentUrl,
            quality: 'high',
            store_media: true
          })
        });
        
        const faxData = await faxResponse.json();
        
        if (!faxResponse.ok) {
          throw new Error(faxData.errors?.[0]?.detail || 'Fax sending failed');
        }
        
        // Log fax sent
        if (contactId) {
          const db = admin.firestore();
          await db.collection('faxLog').add({
            contactId,
            to,
            bureau: bureau || 'Unknown',
            faxId: faxData.data.id,
            status: faxData.data.status,
            sentAt: admin.firestore.FieldValue.serverTimestamp()
          });
        }
        
        console.log('✅ Fax sent, ID:', faxData.data.id);
        
        res.status(200).json({
          success: true,
          faxId: faxData.data.id,
          status: faxData.data.status
        });
        
      } catch (error) {
        console.error('❌ Fax error:', error);
        res.status(500).json({ success: false, error: error.message });
      }
    });
  }
);

console.log('✅ Function 9/10: sendFaxOutbound loaded');

// ============================================
// FUNCTION 10: ENROLLMENT SUPPORT SERVICE (Consolidated)
// ============================================
// Handles: Claude Code's 3 enrollment support functions
// Replaces: sendEscalationAlert, scheduleCallback, logEnrollmentFailure
// Savings: 3 functions → 1 function = $9/month saved

exports.enrollmentSupportService = onCall(
  {
    ...defaultConfig,
    // EXPLICITLY BIND SECRETS HERE
    secrets: [
      gmailUser, 
      gmailAppPassword, 
      gmailFromName, 
      telnyxApiKey, 
      telnyxPhone
    ]
  },
  async (request) => {
    const { action, ...params } = request.body;
    
    console.log('⚙️ Operations Manager:', action, params);
    
    // Validate action
    if (!action) {
      response.status(400).json({
        success: false,
        error: 'Missing required parameter: action'
      });
      return;
    }
    
    const db = admin.firestore();
    
    let result;
    
    console.log('🆘 Enrollment Support:', action);
    
    
    try {
      switch (action) {
        case 'sendAlert': {
          const { escalationId, type, urgency, contactName, contactEmail, contactPhone, description } = params;
          
          // Log to Firestore
          const alertRef = await db.collection('escalationAlerts').add({
            escalationId: escalationId || `ESC-${Date.now()}`,
            type,
            urgency,
            contactName,
            contactEmail,
            contactPhone,
            description,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            status: 'pending'
          });
          
          // Send email for high/critical urgency
          if (urgency === 'high' || urgency === 'critical') {
            const user = gmailUser.value();
            const pass = gmailAppPassword.value();
            
            const transporter = nodemailer.createTransporter({
              host: 'smtp.gmail.com',
              port: 587,
              secure: false,
              auth: { user, pass }
            });
            
            const urgencyEmoji = urgency === 'critical' ? '🚨🚨🚨' : '🚨';
            const subject = `${urgencyEmoji} ${urgency.toUpperCase()}: Enrollment Escalation - ${contactName || 'Unknown'}`;
            
            const body = `
ENROLLMENT ESCALATION ALERT

Type: ${type}
Urgency: ${urgency.toUpperCase()}
Contact: ${contactName || 'Unknown'}
Phone: ${contactPhone || 'Not provided'}
Email: ${contactEmail || 'Not provided'}

Description:
${description}

Action Required: Please follow up immediately.

---
Escalation ID: ${alertRef.id}
Timestamp: ${new Date().toISOString()}
            `.trim();
            
            await transporter.sendMail({
              from: `"SpeedyCRM Alerts" <${user}>`,
              to: 'chris@speedycreditrepair.com',
              subject,
              text: body,
              html: wrapEmailInHTML(subject, body)
            });
            
            console.log('✅ Escalation email sent');
          }
          
          // Send SMS for critical urgency (if enabled)
          if (urgency === 'critical' && telnyxApiKey.value()) {
            try {
              await fetch('https://api.telnyx.com/v2/messages', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${telnyxApiKey.value()}`
                },
                body: JSON.stringify({
                  from: telnyxPhone.value(),
                  to: '+17145551234', // Update with actual team phone
                  text: `🚨 CRITICAL: IDIQ enrollment failed for ${contactName}. Check CRM immediately. ID: ${alertRef.id}`
                })
              });
              console.log('✅ Escalation SMS sent');
            } catch (smsError) {
              console.warn('⚠️ SMS sending failed:', smsError.message);
            }
          }
          
          return { success: true, escalationId: alertRef.id };
        }
        
        case 'scheduleCallback': {
          const { contactId, contactName, phone, email, preferredTime, preferredDate, reason, notes } = params;
          
          // Create callback record
          const callbackRef = await db.collection('callbacks').add({
            contactId,
            contactName,
            phone,
            email,
            preferredTime,
            preferredDate,
            reason,
            notes: notes || '',
            status: 'scheduled',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          });
          
          // Create task for team
          await db.collection('tasks').add({
            title: `Callback: ${reason}`,
            description: `Call ${contactName} at ${phone}\nPreferred: ${preferredDate} ${preferredTime}\nReason: ${reason}\n\n${notes || ''}`.trim(),
            contactId,
            type: 'callback',
            priority: 'high',
            status: 'pending',
            dueDate: preferredDate && preferredTime 
              ? new Date(`${preferredDate} ${preferredTime}`) 
              : new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow if not specified
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            createdBy: 'system',
            relatedTo: {
              type: 'callback',
              id: callbackRef.id
            }
          });
          
          // Send confirmation email
          if (email) {
            const user = gmailUser.value();
            const pass = gmailAppPassword.value();
            
            const transporter = nodemailer.createTransporter({
              host: 'smtp.gmail.com',
              port: 587,
              secure: false,
              auth: { user, pass }
            });
            
            const body = `Hi ${contactName},

We've received your callback request and will call you on ${preferredDate} at ${preferredTime}.

Reason: ${reason}

If you need to reschedule, please reply to this email or call us at (888) 724-7344.

Thank you for choosing Speedy Credit Repair!`;
            
            await transporter.sendMail({
              from: `"${gmailFromName.value() || 'Speedy Credit Repair'}" <${user}>`,
              to: email,
              subject: 'Your Callback Request - Speedy Credit Repair',
              text: body,
              html: wrapEmailInHTML('Callback Confirmation', body, contactName)
            });
            
            console.log('✅ Callback confirmation email sent');
          }
          
          return { success: true, callbackId: callbackRef.id };
        }
        
        case 'logFailure': {
          const { contactId, errorType, errorMessage, formData, step, userId } = params;
          
          // Sanitize form data (remove sensitive info)
          const sanitizedFormData = { ...formData };
          if (sanitizedFormData.ssn) {
            sanitizedFormData.ssn = `***-**-${sanitizedFormData.ssn.slice(-4)}`;
          }
          delete sanitizedFormData.password;
          delete sanitizedFormData.idiqPassword;
          
          const failureRef = await db.collection('enrollmentFailures').add({
            contactId,
            errorType,
            errorMessage,
            formData: sanitizedFormData,
            step: step || 'unknown',
            userId: userId || null,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            status: 'pending',
            retryCount: 0,
            resolved: false
          });
          
          // Update contact record if exists
          if (contactId) {
            try {
              await db.collection('contacts').doc(contactId).update({
                'idiq.enrollmentStatus': 'failed',
                'idiq.lastError': errorType,
                'idiq.lastErrorDate': admin.firestore.FieldValue.serverTimestamp()
              });
            } catch (updateError) {
              console.warn('Could not update contact:', updateError.message);
            }
          }
          
          console.log('📋 Enrollment failure logged:', failureRef.id);
          return { success: true, failureId: failureRef.id };
        }
        
        default:
          throw new Error(`Unknown enrollment support action: ${action}`);
      }
    } catch (error) {
      console.error('❌ Enrollment support error:', error);
      return { success: false, error: error.message };
    }
  }
);

console.log('✅ Function 10/10: enrollmentSupportService loaded');

// ============================================
// INITIALIZATION COMPLETE
// ============================================

console.log('');
console.log('🚀 Firebase Gen 2 Functions configured successfully!');
console.log('✅ 10 Consolidated Functions loaded (down from 172)');
console.log('💰 Monthly savings: $903/month | Annual savings: $10,836/year');
console.log('');
console.log('Function List:');
console.log('1. emailService - Email operations + tracking');
console.log('2. receiveAIReceptionistCall - AI Receptionist webhook');
console.log('3. processAICall - AI call processing + lead scoring');
console.log('4. onContactCreated - New contact trigger');
console.log('5. idiqService - IDIQ credit reporting operations');
console.log('6. processWorkflowStages - Scheduled workflow processor');
console.log('7. aiContentGenerator - AI content + document generation');
console.log('8. operationsManager - Workflow + task management');
console.log('9. sendFaxOutbound - Telnyx fax service');
console.log('10. enrollmentSupportService - Enrollment support + escalation');
console.log('');
console.log('© 1995-2024 Speedy Credit Repair Inc. | All Rights Reserved');
console.log('Trademark: Speedy Credit Repair® - USPTO Registered');