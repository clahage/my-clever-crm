/**
 * ═══════════════════════════════════════════════════════════════════════════
 * IDIQ AUTO-ENROLLMENT SYSTEM - SpeedyCRM
 * ═══════════════════════════════════════════════════════════════════════════
 * Path: /functions/idiqEnrollmentProcessor.js
 * 
 * AUTOMATED CREDIT REPORT ENROLLMENT WITH PARTNER ID 11981
 * 
 * Features:
 * ✅ Automatic enrollment via IDIQ API
 * ✅ Partner ID 11981 integration
 * ✅ Trial vs Paid subscription logic
 * ✅ Field mapping and validation
 * ✅ Webhook handler for report delivery
 * ✅ Error recovery and retry logic
 * ✅ Secure credential handling
 * ✅ Real-time status tracking
 * 
 * @version 1.0.0 PRODUCTION READY
 * @author Christopher - Speedy Credit Repair
 * @date November 2025
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');
const crypto = require('crypto');

if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

// ═══════════════════════════════════════════════════════════════════════════
// IDIQ CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const IDIQ_CONFIG = {
  partnerId: '11981',
  apiBaseUrl: functions.config().idiq?.api_url || 'https://api.partner.idiq.com',
  apiKey: functions.config().idiq?.api_key || process.env.IDIQ_API_KEY,
  apiSecret: functions.config().idiq?.api_secret || process.env.IDIQ_API_SECRET,
  webhookUrl: functions.config().idiq?.webhook_url || 'https://us-central1-speedycrm.cloudfunctions.net/idiqWebhookHandler',
  
  // Subscription types
  subscriptions: {
    trial: {
      productCode: 'TRIAL_7DAY',
      duration: 7,
      price: 0,
      description: '7-Day Free Trial'
    },
    basic: {
      productCode: 'BASIC_MONTHLY',
      duration: 30,
      price: 19.99,
      description: 'Basic Monthly Monitoring'
    },
    premium: {
      productCode: 'PREMIUM_MONTHLY',
      duration: 30,
      price: 39.99,
      description: 'Premium Monthly with Alerts'
    }
  }
};

if (!IDIQ_CONFIG.apiKey || !IDIQ_CONFIG.apiSecret) {
  console.error('⚠️ IDIQ credentials not configured');
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN ENROLLMENT PROCESSOR - Triggers on queue entry
// ═══════════════════════════════════════════════════════════════════════════

exports.processIDIQEnrollment = functions.runWith({
  memory: '512MB',
  timeoutSeconds: 60
}).firestore
  .document('idiqEnrollmentQueue/{enrollmentId}')
  .onCreate(async (snap, context) => {
    const enrollmentId = context.params.enrollmentId;
    const enrollmentData = snap.data();
    
    console.log(`===== IDIQ ENROLLMENT PROCESSOR STARTED =====`);
    console.log(`Processing enrollment: ${enrollmentId}`);
    console.log(`Contact ID: ${enrollmentData.contactId}`);
    console.log(`Type: ${enrollmentData.type}`);
    
    try {
      // ===== STEP 1: Validate enrollment data =====
      const validation = validateEnrollmentData(enrollmentData.contactData);
      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }
      
      // ===== STEP 2: Check for existing enrollment =====
      const existingEnrollment = await checkExistingEnrollment(enrollmentData.contactId);
      if (existingEnrollment) {
        console.log('Contact already enrolled in IDIQ');
        await updateEnrollmentStatus(enrollmentId, 'duplicate', {
          existingEnrollmentId: existingEnrollment.id,
          message: 'Contact already has IDIQ enrollment'
        });
        return null;
      }
      
      // ===== STEP 3: Prepare IDIQ API request =====
      const idiqRequest = prepareIDIQRequest(enrollmentData);
      console.log('IDIQ request prepared');
      
      // ===== STEP 4: Submit to IDIQ API =====
      const idiqResponse = await submitToIDIQ(idiqRequest);
      console.log(`IDIQ enrollment successful: ${idiqResponse.memberId}`);
      
      // ===== STEP 5: Store enrollment in database =====
      const enrollmentRecord = {
        contactId: enrollmentData.contactId,
        memberId: idiqResponse.memberId,
        username: idiqResponse.username,
        passwordHash: hashPassword(idiqResponse.temporaryPassword),
        secretWord: enrollmentData.contactData.lastName.toLowerCase(),
        enrollmentDate: admin.firestore.FieldValue.serverTimestamp(),
        subscriptionType: enrollmentData.type,
        productCode: IDIQ_CONFIG.subscriptions[enrollmentData.type]?.productCode,
        status: 'active',
        lastReportPull: null,
        monitoringActive: true,
        partnerId: IDIQ_CONFIG.partnerId,
        webhookEnabled: true,
        reportCount: 0,
        nextBillingDate: calculateNextBillingDate(enrollmentData.type),
        metadata: {
          enrollmentId: enrollmentId,
          apiResponse: idiqResponse,
          enrolledBy: 'automated_system',
          enrollmentSource: enrollmentData.leadSource || 'website'
        }
      };
      
      const idiqDocRef = await db.collection('idiqEnrollments').add(enrollmentRecord);
      console.log(`Enrollment saved: ${idiqDocRef.id}`);
      
      // ===== STEP 6: Update contact with IDIQ info =====
      await updateContactWithIDIQ(enrollmentData.contactId, {
        idiqMemberId: idiqResponse.memberId,
        idiqEnrollmentId: idiqDocRef.id,
        idiqStatus: 'enrolled',
        workflow: {
          stage: 'idiq_enrolled',
          nextAction: 'await_credit_report',
          lastAction: admin.firestore.FieldValue.serverTimestamp()
        }
      });
      
      // ===== STEP 7: Send welcome email with credentials =====
      await sendIDIQWelcomeEmail(
        enrollmentData.contactId,
        idiqResponse.memberId,
        idiqResponse.username,
        idiqResponse.temporaryPassword
      );
      
      // ===== STEP 8: Schedule first report pull =====
      await scheduleReportPull(enrollmentData.contactId, idiqDocRef.id);
      
      // ===== STEP 9: Update enrollment status =====
      await updateEnrollmentStatus(enrollmentId, 'completed', {
        memberId: idiqResponse.memberId,
        enrollmentDocId: idiqDocRef.id,
        processedAt: new Date().toISOString()
      });
      
      // ===== STEP 10: Log analytics =====
      await logEnrollmentAnalytics(enrollmentData.contactId, enrollmentData.type);
      
      console.log(`===== IDIQ ENROLLMENT COMPLETE =====`);
      return { success: true, memberId: idiqResponse.memberId };
      
    } catch (error) {
      console.error('IDIQ enrollment error:', error);
      
      // Update enrollment with error
      await updateEnrollmentStatus(enrollmentId, 'failed', {
        error: error.message,
        failedAt: new Date().toISOString(),
        willRetry: error.code !== 'INVALID_DATA'
      });
      
      // Update contact workflow
      await db.collection('contacts').doc(enrollmentData.contactId).update({
        workflow: {
          stage: 'idiq_enrollment_failed',
          error: error.message,
          lastAction: admin.firestore.FieldValue.serverTimestamp()
        }
      });
      
      // Retry if appropriate
      if (shouldRetryEnrollment(error)) {
        await scheduleEnrollmentRetry(enrollmentId, enrollmentData);
      }
      
      return { success: false, error: error.message };
    }
  });

// ═══════════════════════════════════════════════════════════════════════════
// VALIDATION FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function validateEnrollmentData(contactData) {
  const errors = [];
  
  // Required fields
  if (!contactData.firstName) errors.push('First name required');
  if (!contactData.lastName) errors.push('Last name required');
  if (!contactData.email) errors.push('Email required');
  if (!contactData.dateOfBirth) errors.push('Date of birth required');
  if (!contactData.ssn && !contactData.ssnLast4) errors.push('SSN required');
  
  // Address validation
  if (!contactData.address?.street) errors.push('Street address required');
  if (!contactData.address?.city) errors.push('City required');
  if (!contactData.address?.state) errors.push('State required');
  if (!contactData.address?.zip) errors.push('ZIP code required');
  
  // Format validation
  if (contactData.email && !isValidEmail(contactData.email)) {
    errors.push('Invalid email format');
  }
  
  if (contactData.phone && !isValidPhone(contactData.phone)) {
    errors.push('Invalid phone format');
  }
  
  // SSN validation
  const ssn = contactData.ssn || contactData.ssnLast4;
  if (ssn && !isValidSSN(ssn)) {
    errors.push('Invalid SSN format');
  }
  
  return {
    valid: errors.length === 0,
    errors: errors
  };
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10 || cleaned.length === 11;
}

function isValidSSN(ssn) {
  const cleaned = ssn.replace(/\D/g, '');
  return cleaned.length === 4 || cleaned.length === 9;
}

// ═══════════════════════════════════════════════════════════════════════════
// IDIQ API INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════

function prepareIDIQRequest(enrollmentData) {
  const contact = enrollmentData.contactData;
  const subscriptionType = enrollmentData.type || 'trial';
  
  // Format SSN (IDIQ requires full 9 digits or will generate temp)
  let ssn = contact.ssn || '';
  if (!ssn && contact.ssnLast4) {
    // Generate placeholder SSN with last 4 (IDIQ will verify)
    ssn = `9999${contact.ssnLast4}`;
  }
  
  // Format phone
  const phone = (contact.phone || '').replace(/\D/g, '');
  
  // Generate username
  const username = generateUsername(contact.firstName, contact.lastName);
  
  // Generate temporary password
  const tempPassword = generateTempPassword();
  
  return {
    partnerId: IDIQ_CONFIG.partnerId,
    productCode: IDIQ_CONFIG.subscriptions[subscriptionType].productCode,
    personalInfo: {
      firstName: contact.firstName,
      middleName: contact.middleName || '',
      lastName: contact.lastName,
      suffix: contact.suffix || '',
      dateOfBirth: formatDateForIDIQ(contact.dateOfBirth),
      ssn: ssn,
      email: contact.email,
      phone: phone,
      secretWord: contact.lastName.toLowerCase()
    },
    address: {
      street1: contact.address.street,
      street2: contact.address.street2 || '',
      city: contact.address.city,
      state: contact.address.state,
      zip: contact.address.zip,
      country: 'US'
    },
    accountInfo: {
      username: username,
      password: tempPassword,
      webhookUrl: IDIQ_CONFIG.webhookUrl,
      autoMonitoring: true,
      alertsEnabled: true
    },
    metadata: {
      contactId: enrollmentData.contactId,
      leadScore: enrollmentData.leadScore || 0,
      source: enrollmentData.leadSource || 'website',
      campaign: enrollmentData.campaign || 'organic'
    }
  };
}

async function submitToIDIQ(request) {
  // Generate API signature
  const timestamp = Date.now().toString();
  const signature = generateAPISignature(request, timestamp);
  
  try {
    const response = await axios.post(
      `${IDIQ_CONFIG.apiBaseUrl}/v2/enrollments`,
      request,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Partner-ID': IDIQ_CONFIG.partnerId,
          'X-API-Key': IDIQ_CONFIG.apiKey,
          'X-Timestamp': timestamp,
          'X-Signature': signature
        },
        timeout: 30000 // 30 second timeout
      }
    );
    
    if (response.data.success) {
      return {
        memberId: response.data.memberId,
        username: request.accountInfo.username,
        temporaryPassword: request.accountInfo.password,
        enrollmentId: response.data.enrollmentId,
        reportAvailableAt: response.data.reportAvailableAt,
        raw: response.data
      };
    } else {
      throw new Error(response.data.error || 'IDIQ enrollment failed');
    }
    
  } catch (error) {
    if (error.response) {
      // IDIQ API error
      console.error('IDIQ API error:', error.response.data);
      throw new Error(`IDIQ API: ${error.response.data.message || error.response.status}`);
    } else if (error.request) {
      // Network error
      console.error('Network error:', error.message);
      throw new Error('Network error connecting to IDIQ');
    } else {
      throw error;
    }
  }
}

function generateAPISignature(data, timestamp) {
  const payload = JSON.stringify(data) + timestamp + IDIQ_CONFIG.apiSecret;
  return crypto.createHash('sha256').update(payload).digest('hex');
}

// ═══════════════════════════════════════════════════════════════════════════
// WEBHOOK HANDLER FOR CREDIT REPORTS
// ═══════════════════════════════════════════════════════════════════════════

exports.idiqWebhookHandler = functions.runWith({
  memory: '512MB',
  timeoutSeconds: 60
}).https.onRequest(async (req, res) => {
  console.log('===== IDIQ WEBHOOK RECEIVED =====');
  
  // Verify webhook signature
  if (!verifyWebhookSignature(req)) {
    console.error('Invalid webhook signature');
    res.status(401).send('Unauthorized');
    return;
  }
  
  const webhookData = req.body;
  console.log(`Event type: ${webhookData.eventType}`);
  console.log(`Member ID: ${webhookData.memberId}`);
  
  try {
    switch (webhookData.eventType) {
      case 'report.ready':
        await handleReportReady(webhookData);
        break;
        
      case 'report.updated':
        await handleReportUpdated(webhookData);
        break;
        
      case 'subscription.expired':
        await handleSubscriptionExpired(webhookData);
        break;
        
      case 'alert.triggered':
        await handleAlertTriggered(webhookData);
        break;
        
      default:
        console.log(`Unknown event type: ${webhookData.eventType}`);
    }
    
    res.status(200).send({ received: true });
    
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).send({ error: error.message });
  }
});

function verifyWebhookSignature(req) {
  const signature = req.headers['x-idiq-signature'];
  const timestamp = req.headers['x-idiq-timestamp'];
  
  if (!signature || !timestamp) return false;
  
  // Check timestamp is recent (within 5 minutes)
  const now = Date.now();
  if (Math.abs(now - parseInt(timestamp)) > 300000) return false;
  
  // Verify signature
  const payload = JSON.stringify(req.body) + timestamp + IDIQ_CONFIG.apiSecret;
  const expectedSignature = crypto.createHash('sha256').update(payload).digest('hex');
  
  return signature === expectedSignature;
}

async function handleReportReady(webhookData) {
  console.log('Processing report ready event');
  
  // Find enrollment by member ID
  const enrollmentQuery = await db.collection('idiqEnrollments')
    .where('memberId', '==', webhookData.memberId)
    .limit(1)
    .get();
  
  if (enrollmentQuery.empty) {
    console.error(`No enrollment found for member ID: ${webhookData.memberId}`);
    return;
  }
  
  const enrollment = enrollmentQuery.docs[0];
  const enrollmentData = enrollment.data();
  
  // Fetch the actual report
  const reportData = await fetchCreditReport(webhookData.memberId, webhookData.reportId);
  
  // Store report in Firebase Storage
  const reportUrl = await storeReportInStorage(
    enrollmentData.contactId,
    reportData,
    webhookData.reportId
  );
  
  // Update enrollment with report info
  await enrollment.ref.update({
    lastReportPull: admin.firestore.FieldValue.serverTimestamp(),
    lastReportId: webhookData.reportId,
    lastReportUrl: reportUrl,
    reportCount: admin.firestore.FieldValue.increment(1),
    'metadata.lastWebhookReceived': new Date().toISOString()
  });
  
  // Trigger credit analysis
  await triggerCreditAnalysis(enrollmentData.contactId, reportData);
  
  // Update contact workflow
  await db.collection('contacts').doc(enrollmentData.contactId).update({
    workflow: {
      stage: 'credit_report_received',
      nextAction: 'analyze_credit',
      lastAction: admin.firestore.FieldValue.serverTimestamp()
    }
  });
  
  console.log('Report processed successfully');
}

async function fetchCreditReport(memberId, reportId) {
  const timestamp = Date.now().toString();
  const signature = generateAPISignature({ memberId, reportId }, timestamp);
  
  try {
    const response = await axios.get(
      `${IDIQ_CONFIG.apiBaseUrl}/v2/reports/${reportId}`,
      {
        headers: {
          'X-Partner-ID': IDIQ_CONFIG.partnerId,
          'X-API-Key': IDIQ_CONFIG.apiKey,
          'X-Timestamp': timestamp,
          'X-Signature': signature
        },
        timeout: 30000
      }
    );
    
    return response.data;
    
  } catch (error) {
    console.error('Failed to fetch credit report:', error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// STORAGE FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

async function storeReportInStorage(contactId, reportData, reportId) {
  const storage = admin.storage();
  const bucket = storage.bucket();
  
  const fileName = `credit-reports/${contactId}/${reportId}_${Date.now()}.json`;
  const file = bucket.file(fileName);
  
  await file.save(JSON.stringify(reportData, null, 2), {
    metadata: {
      contentType: 'application/json',
      metadata: {
        contactId: contactId,
        reportId: reportId,
        uploadedAt: new Date().toISOString()
      }
    }
  });
  
  // Generate signed URL (expires in 7 days)
  const [url] = await file.getSignedUrl({
    action: 'read',
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000
  });
  
  return url;
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

async function checkExistingEnrollment(contactId) {
  const existing = await db.collection('idiqEnrollments')
    .where('contactId', '==', contactId)
    .where('status', '==', 'active')
    .limit(1)
    .get();
  
  return existing.empty ? null : existing.docs[0].data();
}

function generateUsername(firstName, lastName) {
  const first = firstName.toLowerCase().substring(0, 3);
  const last = lastName.toLowerCase().substring(0, 3);
  const random = Math.floor(Math.random() * 10000);
  return `${first}${last}${random}`;
}

function generateTempPassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function formatDateForIDIQ(date) {
  if (!date) return '';
  
  // Handle various date formats
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

function calculateNextBillingDate(subscriptionType) {
  const duration = IDIQ_CONFIG.subscriptions[subscriptionType]?.duration || 30;
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + duration);
  return admin.firestore.Timestamp.fromDate(nextDate);
}

async function updateContactWithIDIQ(contactId, updates) {
  await db.collection('contacts').doc(contactId).update(updates);
}

async function updateEnrollmentStatus(enrollmentId, status, metadata) {
  await db.collection('idiqEnrollmentQueue').doc(enrollmentId).update({
    status: status,
    processedAt: admin.firestore.FieldValue.serverTimestamp(),
    metadata: metadata
  });
}

async function sendIDIQWelcomeEmail(contactId, memberId, username, tempPassword) {
  // Queue email for sending
  await db.collection('emailQueue').add({
    contactId: contactId,
    template: 'idiq_welcome',
    priority: 'high',
    data: {
      memberId: memberId,
      username: username,
      tempPassword: tempPassword,
      loginUrl: 'https://portal.idiq.com/login'
    },
    scheduledFor: admin.firestore.FieldValue.serverTimestamp(),
    status: 'pending'
  });
}

async function scheduleReportPull(contactId, enrollmentId) {
  // Schedule report pull for 24 hours later
  const scheduledTime = new Date();
  scheduledTime.setHours(scheduledTime.getHours() + 24);
  
  await db.collection('scheduledTasks').add({
    type: 'pull_credit_report',
    contactId: contactId,
    enrollmentId: enrollmentId,
    scheduledFor: admin.firestore.Timestamp.fromDate(scheduledTime),
    status: 'pending',
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
}

async function triggerCreditAnalysis(contactId, reportData) {
  // Queue credit analysis
  await db.collection('creditAnalysisQueue').add({
    contactId: contactId,
    reportData: reportData,
    requestedAt: admin.firestore.FieldValue.serverTimestamp(),
    status: 'pending',
    priority: 'normal'
  });
}

function shouldRetryEnrollment(error) {
  // Don't retry on validation errors
  if (error.code === 'INVALID_DATA') return false;
  
  // Don't retry on duplicate enrollments
  if (error.message?.includes('duplicate')) return false;
  
  // Retry on network or temporary errors
  return true;
}

async function scheduleEnrollmentRetry(enrollmentId, enrollmentData) {
  const retryCount = enrollmentData.retryCount || 0;
  
  if (retryCount >= 3) {
    console.log('Max retries reached, not scheduling another');
    return;
  }
  
  // Exponential backoff: 5 min, 15 min, 45 min
  const delayMinutes = Math.pow(3, retryCount) * 5;
  const retryTime = new Date();
  retryTime.setMinutes(retryTime.getMinutes() + delayMinutes);
  
  await db.collection('scheduledTasks').add({
    type: 'retry_idiq_enrollment',
    enrollmentId: enrollmentId,
    retryCount: retryCount + 1,
    scheduledFor: admin.firestore.Timestamp.fromDate(retryTime),
    status: 'pending',
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
  
  console.log(`Retry scheduled for ${delayMinutes} minutes`);
}

async function logEnrollmentAnalytics(contactId, subscriptionType) {
  await db.collection('analytics_events').add({
    event: 'idiq_enrollment',
    contactId: contactId,
    subscriptionType: subscriptionType,
    partnerId: IDIQ_CONFIG.partnerId,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    date: new Date().toISOString().split('T')[0]
  });
}

// Additional webhook handlers
async function handleReportUpdated(webhookData) {
  console.log('Report updated:', webhookData);
  // Handle report updates (score changes, new items, etc.)
  await handleReportReady(webhookData); // Reuse same logic
}

async function handleSubscriptionExpired(webhookData) {
  console.log('Subscription expired:', webhookData);
  
  const enrollmentQuery = await db.collection('idiqEnrollments')
    .where('memberId', '==', webhookData.memberId)
    .limit(1)
    .get();
  
  if (!enrollmentQuery.empty) {
    await enrollmentQuery.docs[0].ref.update({
      status: 'expired',
      expiredAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Create task for renewal
    await db.collection('tasks').add({
      type: 'subscription_renewal',
      contactId: enrollmentQuery.docs[0].data().contactId,
      priority: 'high',
      title: 'IDIQ Subscription Expired',
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }
}

async function handleAlertTriggered(webhookData) {
  console.log('Alert triggered:', webhookData);
  
  // Create notification for user
  const enrollmentQuery = await db.collection('idiqEnrollments')
    .where('memberId', '==', webhookData.memberId)
    .limit(1)
    .get();
  
  if (!enrollmentQuery.empty) {
    const contactId = enrollmentQuery.docs[0].data().contactId;
    
    await db.collection('notifications').add({
      contactId: contactId,
      type: 'credit_alert',
      title: webhookData.alertTitle || 'Credit Report Alert',
      message: webhookData.alertMessage || 'Your credit report has changed',
      priority: 'high',
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT ALL FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

module.exports = {
  processIDIQEnrollment: exports.processIDIQEnrollment,
  idiqWebhookHandler: exports.idiqWebhookHandler,
  
  // Exported for testing
  validateEnrollmentData,
  prepareIDIQRequest,
  generateUsername,
  generateTempPassword
};