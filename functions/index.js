// ============================================
// functions/index.js - Firebase Cloud Functions for SpeedyCRM
// VERSION: 3.0 - AUDIT REMEDIATION: Added secure AI service
// Last Updated: 2025-10-20
// ============================================

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const fetch = require('node-fetch');

// Webhook API Key for external services
const WEBHOOK_API_KEY = 'scr-webhook-2025-secure-key-abc123';

// ⚠️ REMOVED: OpenAI direct import (security risk)
// OpenAI is now handled securely in aiService.js
// const { OpenAI } = require('openai');

// ============================================
// FIREBASE ADMIN INITIALIZATION
// ============================================
// ✅ BEST PRACTICE: Simple auto-authentication - No serviceAccountKey.json needed!
if (!admin.apps.length) {
  admin.initializeApp();
  console.log('✅ Firebase Admin initialized successfully');
}

// ============================================
// SECURE AI SERVICE (NEW - CRITICAL SECURITY FIX)
// ============================================
// ✅ BEST PRACTICE: Import AI service module for secure OpenAI access
const aiService = require('./aiService');

// Export all AI endpoints
exports.aiComplete = aiService.aiComplete;
exports.analyzeCreditReport = aiService.analyzeCreditReport;
exports.generateDisputeLetter = aiService.generateDisputeLetter;
exports.scoreLead = aiService.scoreLead;
exports.parseCreditReport = aiService.parseCreditReport;
exports.getAIUsageStats = aiService.getAIUsageStats;
exports.getAllAIUsage = aiService.getAllAIUsage;

// ============================================
// AI RECEPTIONIST WEBHOOK
// ============================================
// ✅ BEST PRACTICE: Group related functions together
const { 
  receiveAIReceptionistCall, 
  reprocessAIReceptionistCall 
} = require('./webhooks/aiReceptionistReceiver');
exports.receiveAIReceptionistCall = receiveAIReceptionistCall;
exports.reprocessAIReceptionistCall = reprocessAIReceptionistCall;

// Processor utilities for AI receptionist handling
const { processAIReceptionistCall, extractNameFromEmail } = require('./aiReceptionistProcessor');

// ============================================
// NOTIFICATIONS
// ============================================
const { sendMorningSummary } = require('./automation/notificationService');
exports.sendMorningSummary = sendMorningSummary;

// ============================================
// ZELLE PAYMENTS
// ============================================
// ✅ BEST PRACTICE: Destructure all related exports at once
const {
  reportZellePayment,
  confirmZellePayment,
  markZelleNotReceived,
  getPendingZellePayments,
  sendZelleConfirmationReminders
} = require('./payments/zelleHandler');

exports.reportZellePayment = reportZellePayment;
exports.confirmZellePayment = confirmZellePayment;
exports.markZelleNotReceived = markZelleNotReceived;
exports.getPendingZellePayments = getPendingZellePayments;
exports.sendZelleConfirmationReminders = sendZelleConfirmationReminders;

// ============================================
// CONFIGURATION
// ============================================

// ✅ BEST PRACTICE: Store sensitive UIDs as constants at top level
const MASTER_ADMIN_UID = "BgTAnHE4zMOLr4ZhBqCBfFb3h6D3";

// ✅ BEST PRACTICE: Environment-specific configuration with fallbacks
const IDIQ_CONFIG = {
  STAGE_BASE_URL: 'https://api-stage.identityiq.com/pif-service/',
  PROD_BASE_URL: 'https://api.identityiq.com/pif-service/',
  OFFER_CODE: process.env.IDIQ_OFFER_CODE || '4312869N',
  PLAN_CODE: process.env.IDIQ_PLAN_CODE || 'PLAN03B'
};

const IDIQ_ENV = process.env.IDIQ_ENV || "stage";
const IDIQ_PARTNER_TOKEN_PATH = process.env.IDIQ_PARTNER_TOKEN_PATH;

// ✅ BEST PRACTICE: Use Set for O(1) lookup performance
const ALLOW_ORIGINS = new Set([
  "https://my-clever-crm--preview-auth-mba1x04f.web.app",
  "https://my-clever-crm.web.app",
  "https://my-clever-crm.firebaseapp.com",
  "https://myclevercrm.com",
  "http://localhost:5173",
  "http://localhost:3000"
]);

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Set CORS headers for HTTP functions
 */
function setCors(req, res) {
  const origin = req.headers.origin;
  if (origin && ALLOW_ORIGINS.has(origin)) {
    res.set("Access-Control-Allow-Origin", origin);
    res.set("Vary", "Origin");
  } else {
    res.set("Access-Control-Allow-Origin", "*");
  }
  res.set("Access-Control-Allow-Headers", "content-type, authorization");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Max-Age", "3600");
}

/**
 * Handle CORS preflight requests
 */
function handlePreflight(req, res) {
  if (req.method === 'OPTIONS') {
    setCors(req, res);
    res.status(204).send('');
    return true;
  }
  return false;
}

// ============================================
// EMAIL TRACKING FUNCTIONS
// ============================================

/**
 * Track email opens via 1x1 tracking pixel
 */
exports.trackEmailOpen = functions.runWith({
  invoker: 'public'
}).https.onRequest(async (req, res) => {
  const trackingId = req.path.split('/').pop();
  
  if (!trackingId || trackingId === 'trackEmailOpen') {
    res.status(400).send('Missing tracking ID');
    return;
  }

  try {
    const trackingQuery = await admin.firestore()
      .collection('emailTracking')
      .where('trackingId', '==', trackingId)
      .limit(1)
      .get();

    if (!trackingQuery.empty) {
      const trackingDoc = trackingQuery.docs[0];
      const trackingData = trackingDoc.data();
      
      await trackingDoc.ref.update({
        opened: true,
        openedAt: trackingData.openedAt || admin.firestore.FieldValue.serverTimestamp(),
        openCount: admin.firestore.FieldValue.increment(1),
        lastOpenedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      if (trackingData.emailId) {
        await admin.firestore()
          .collection('emails')
          .doc(trackingData.emailId)
          .update({
            opened: true,
            openedAt: trackingData.openedAt || admin.firestore.FieldValue.serverTimestamp(),
            openCount: admin.firestore.FieldValue.increment(1)
          });
      }
      
      console.log(`✅ Email opened: ${trackingId}`);
    }
  } catch (error) {
    console.error('❌ Error tracking email open:', error);
  }
  
  // Return 1x1 transparent pixel
  const pixel = Buffer.from(
    'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    'base64'
  );
  
  res.set({
    'Content-Type': 'image/gif',
    'Content-Length': pixel.length,
    'Cache-Control': 'no-store, no-cache, must-revalidate, private'
  });
  
  res.end(pixel);
});

/**
 * NEW FUNCTION: Fix existing "Unknown" contacts
 * Call this once to retroactively fix contacts with missing names
 * URL: https://us-central1-my-clever-crm.cloudfunctions.net/fixUnknownContacts?apiKey=YOUR_KEY
 */
exports.fixUnknownContacts = functions.https.onRequest(async (req, res) => {
  // Security check
  const apiKey = req.query.apiKey;
  const WEBHOOK_API_KEY = 'scr-webhook-2025-secure-key-abc123';
  
  if (apiKey !== WEBHOOK_API_KEY) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  
  try {
    const db = admin.firestore();
    
    // Find all contacts with firstName = "Unknown" or empty
    const unknownContactsQuery = await db.collection('contacts')
      .where('firstName', 'in', ['Unknown', '', null])
      .get();
    
    console.log(`📊 Found ${unknownContactsQuery.size} contacts with missing names`);
    
    const results = {
      total: unknownContactsQuery.size,
      fixed: 0,
      flagged: 0,
      skipped: 0,
      details: []
    };
    
    for (const doc of unknownContactsQuery.docs) {
      const contact = doc.data();
      const contactId = doc.id;
      
      let action = 'skipped';
      let newFirstName = contact.firstName;
      let newLastName = contact.lastName || '';
      let nameSource = 'unknown';
      
      // Try to extract name from email
      if (contact.email) {
        const extracted = extractNameFromEmail(contact.email);
        
        if (extracted.firstName && extracted.firstName !== '') {
          newFirstName = extracted.firstName;
          newLastName = extracted.lastName;
          nameSource = 'email';
          action = 'fixed';
          results.fixed++;
          
          // Update contact
          await db.collection('contacts').doc(contactId).update({
            firstName: newFirstName,
            lastName: newLastName,
            fullName: newLastName ? `${newFirstName} ${newLastName}` : newFirstName,
            nameSource: nameSource,
            dataFlags: admin.firestore.FieldValue.arrayUnion('NAME_FROM_EMAIL'),
            tags: admin.firestore.FieldValue.arrayUnion('verify-name'),
            needsManualReview: true,
            dataQuality: 'fair',
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            notes: `${contact.notes || ''}\n\n⚠️ AUTOMATED UPDATE: Name extracted from email address. Please verify with caller.`
          });
          
          console.log(`✅ Fixed contact ${contactId}: ${newFirstName} ${newLastName}`);
        } else {
          // Couldn't extract name - just flag it
          action = 'flagged';
          results.flagged++;
          
          await db.collection('contacts').doc(contactId).update({
            dataFlags: admin.firestore.FieldValue.arrayUnion('MISSING_NAME'),
            tags: admin.firestore.FieldValue.arrayUnion('name-needed'),
            needsManualReview: true,
            dataQuality: 'poor',
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          
          console.log(`⚠️ Flagged contact ${contactId}: Could not extract name`);
        }
      } else {
        // No email - just flag it
        action = 'flagged';
        results.flagged++;
        
        await db.collection('contacts').doc(contactId).update({
          dataFlags: admin.firestore.FieldValue.arrayUnion('MISSING_NAME', 'MISSING_EMAIL'),
          tags: admin.firestore.FieldValue.arrayUnion('name-needed', 'needs-info'),
          needsManualReview: true,
          dataQuality: 'poor',
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        console.log(`⚠️ Flagged contact ${contactId}: No email available`);
      }
      
      results.details.push({
        contactId: contactId,
        oldName: contact.firstName || 'Unknown',
        newName: newFirstName,
        email: contact.email || 'none',
        action: action
      });
      
      if (action === 'skipped') {
        results.skipped++;
      }
    }
    
    console.log(`✅ Batch fix complete:`, results);
    
    return res.status(200).json({
      success: true,
      message: 'Unknown contacts processed',
      results: results
    });
    
  } catch (error) {
    console.error('❌ Error fixing unknown contacts:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * NEW FUNCTION: Get contacts that need manual review
 * URL: https://us-central1-my-clever-crm.cloudfunctions.net/getReviewNeededContacts?apiKey=YOUR_KEY
 */
exports.getReviewNeededContacts = functions.https.onRequest(async (req, res) => {
  const apiKey = req.query.apiKey;
  const WEBHOOK_API_KEY = 'scr-webhook-2025-secure-key-abc123';
  
  if (apiKey !== WEBHOOK_API_KEY) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  
  try {
    const db = admin.firestore();
    
    // Get all contacts that need review
    const reviewQuery = await db.collection('contacts')
      .where('needsManualReview', '==', true)
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get();
    
    const contacts = [];
    reviewQuery.forEach(doc => {
      const data = doc.data();
      contacts.push({
        id: doc.id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        nameSource: data.nameSource,
        dataQuality: data.dataQuality,
        dataFlags: data.dataFlags || [],
        leadScore: data.leadScore,
        createdAt: data.createdAt,
        aiReceptionistCallId: data.aiReceptionistCallId
      });
    });
    
    return res.status(200).json({
      success: true,
      count: contacts.length,
      contacts: contacts
    });
    
  } catch (error) {
    console.error('❌ Error getting review contacts:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Track email link clicks
 */
exports.trackEmailClick = functions.runWith({
  invoker: 'public'
}).https.onRequest(async (req, res) => {
  const pathParts = req.path.split('/');
  const trackingId = pathParts[pathParts.length - 1];
  const destinationUrl = req.query.url;
  
  if (!trackingId || !destinationUrl) {
    res.status(400).send('Missing parameters');
    return;
  }

  try {
    const trackingQuery = await admin.firestore()
      .collection('emailTracking')
      .where('trackingId', '==', trackingId)
      .limit(1)
      .get();

    if (!trackingQuery.empty) {
      const trackingDoc = trackingQuery.docs[0];
      const trackingData = trackingDoc.data();
      
      await trackingDoc.ref.update({
        clicked: true,
        clickedAt: trackingData.clickedAt || admin.firestore.FieldValue.serverTimestamp(),
        clickCount: admin.firestore.FieldValue.increment(1),
        lastClickedAt: admin.firestore.FieldValue.serverTimestamp(),
        lastClickedLink: destinationUrl
      });
      
      console.log(`✅ Email clicked: ${trackingId} → ${destinationUrl}`);
    }
  } catch (error) {
    console.error('❌ Error tracking email click:', error);
  }
  
  res.redirect(destinationUrl);
});

/**
 * Track website visitor events
 */
exports.trackWebsite = functions.runWith({
  invoker: 'public'
}).https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    const { type, data } = req.body;
    
    try {
      await admin.firestore().collection('websiteTracking').add({
        type,
        data,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        processed: false,
        source: 'website'
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error('❌ Error tracking website visitor:', error);
      res.status(500).json({ error: 'Failed to track' });
    }
  });
});

// ============================================
// IDIQ INTEGRATION FUNCTIONS
// ============================================

/**
 * Get IDIQ Partner Token
 */
exports.getIDIQPartnerToken = functions.https.onRequest(async (req, res) => {
  setCors(req, res);
  if (handlePreflight(req, res)) return;

  try {
    const partnerId = process.env.IDIQ_PARTNER_ID || '';
    const partnerSecret = process.env.IDIQ_PARTNER_SECRET || '';
    
    if (!partnerId || !partnerSecret) {
      throw new Error("Missing IDIQ credentials");
    }

    const idiqEnv = IDIQ_ENV;
    const base = idiqEnv === "prod" ? IDIQ_CONFIG.PROD_BASE_URL : IDIQ_CONFIG.STAGE_BASE_URL;
    
    let candidates;
    if (IDIQ_PARTNER_TOKEN_PATH) {
      candidates = [base.replace(/\/+$/, "") + "/" + IDIQ_PARTNER_TOKEN_PATH.replace(/^\/+/, "")];
    } else {
      candidates = [
        "v1/enrollment/partner-token",
        "enrollment/partner-token",
        "v1/partner-token",
        "partner-token",
        "api/v1/partner/token",
        "api/partner/token",
        "v1/auth/partner-token",
        "auth/partner-token",
        "partner/auth/token",
        "pif/v1/partner-token"
      ].map(p => base.replace(/\/+$/, "") + "/" + p);
    }

    let last = { status: 0, raw: "", url: "", parsed: null };
    let all404 = true;

    for (const fullUrl of candidates) {
      const requestBody = {
        partnerId: partnerId,
        partnerSecret: partnerSecret
      };

      console.log('🔍 IDIQ Request:', {
        url: fullUrl,
        partnerId: partnerId.substring(0, 4) + '***',
        secretLength: partnerSecret.length
      });

      const r = await fetch(fullUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(requestBody),
      });

      const raw = await r.text();
      let data = null;
      
      try {
        data = raw ? JSON.parse(raw) : null;
      } catch (e) {
        console.error('❌ Non-JSON response:', raw.substring(0, 200));
      }

      last = { status: r.status, raw, url: fullUrl, parsed: data };

      const token = data?.token || data?.access_token || data?.partnerToken;
      
      if (r.ok && token) {
        console.log('✅ IDIQ Token received successfully');
        return res.status(200).json({
          success: true,
          token,
          expiresIn: data.expiresIn || data.expires_in || null,
          via: fullUrl,
          environment: idiqEnv
        });
      }

      if (r.status !== 404) all404 = false;
      if (r.status === 404) continue;
      break;
    }

    const errorResponse = {
      error: "IDIQ partner-token failed",
      vendorStatus: last.status,
      tried: candidates,
      vendorRaw: (last.raw || "").slice(0, 500),
      environment: idiqEnv
    };

    if (all404) {
      errorResponse.suggestion = "Try setting IDIQ_ENV=prod to test production endpoints";
    }

    console.error('❌ IDIQ token failed:', last.status, last.url);
    return res.status(502).json(errorResponse);

  } catch (error) {
    console.error('❌ IDIQ partner token error:', error);
    res.status(500).json({ error: error.message, environment: IDIQ_ENV });
  }
});

/**
 * Get IDIQ Partner Token (Callable version)
 */
exports.getIDIQPartnerTokenCallable = functions.https.onCall(async (data, context) => {
  const partnerId = process.env.IDIQ_PARTNER_ID || functions.config().idiq?.partner_id || '';
  const partnerSecret = process.env.IDIQ_PARTNER_SECRET || functions.config().idiq?.partner_secret || '';
  
  if (!partnerId || !partnerSecret) {
    throw new functions.https.HttpsError("failed-precondition", "Missing IDIQ credentials");
  }

  try {
    const response = await fetch(`${IDIQ_CONFIG.STAGE_BASE_URL}v1/enrollment/partner-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ partnerId, partnerSecret })
    });

    const result = await response.json();

    if (response.ok) {
      return {
        success: true,
        token: result.accessToken,
        expiresIn: result.expiresIn
      };
    } else {
      throw new functions.https.HttpsError("internal", result.message || 'Unknown error');
    }
  } catch (error) {
    console.error('❌ IDIQ token error:', error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});

/**
 * Enroll Member in IDIQ
 */
exports.enrollIDIQMember = functions.https.onRequest(async (req, res) => {
  setCors(req, res);
  if (handlePreflight(req, res)) return;

  try {
    const { partnerToken, memberData } = req.body;

    const enrollmentData = {
      birthDate: memberData.birthDate,
      email: memberData.email,
      firstName: memberData.firstName,
      lastName: memberData.lastName,
      middleNameInitial: memberData.middleNameInitial || '',
      ssn: memberData.ssn,
      offerCode: IDIQ_CONFIG.OFFER_CODE,
      planCode: IDIQ_CONFIG.PLAN_CODE,
      street: memberData.street,
      city: memberData.city,
      state: memberData.state,
      zip: memberData.zip
    };

    const response = await fetch(`${IDIQ_CONFIG.STAGE_BASE_URL}v1/enrollment/enroll`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${partnerToken}`
      },
      body: JSON.stringify(enrollmentData)
    });

    if (response.ok) {
      console.log('✅ Member enrolled:', memberData.email);
      res.json({ success: true, message: 'Member enrolled successfully' });
    } else {
      const error = await response.json();
      console.error('❌ Enrollment failed:', error);
      res.status(500).json({ error: error.message || 'Unknown error' });
    }
  } catch (error) {
    console.error('❌ IDIQ enrollment error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get Member Token
 */
exports.getIDIQMemberToken = functions.https.onRequest(async (req, res) => {
  setCors(req, res);
  if (handlePreflight(req, res)) return;

  try {
    const { partnerToken, memberEmail } = req.body;

    const response = await fetch(`${IDIQ_CONFIG.STAGE_BASE_URL}v1/enrollment/partner-member-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${partnerToken}`
      },
      body: JSON.stringify({ memberEmail })
    });

    const result = await response.json();

    if (response.ok) {
      res.json({
        success: true,
        memberToken: result.accessToken,
        expiresIn: result.expiresIn
      });
    } else {
      res.status(500).json({ error: result.message || 'Unknown error' });
    }
  } catch (error) {
    console.error('❌ IDIQ member token error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get Verification Questions
 */
exports.getVerificationQuestions = functions.https.onRequest(async (req, res) => {
  setCors(req, res);
  if (handlePreflight(req, res)) return;

  try {
    const { memberToken } = req.body;

    const response = await fetch(`${IDIQ_CONFIG.STAGE_BASE_URL}v1/enrollment/verification-questions`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${memberToken}` }
    });

    const result = await response.json();

    if (response.ok && result.isSuccess) {
      res.json({ success: true, questions: result.questions });
    } else {
      res.status(500).json({ error: result.message || 'Unknown error' });
    }
  } catch (error) {
    console.error('❌ IDIQ verification questions error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Submit Verification Answers
 */
exports.submitVerificationAnswers = functions.https.onRequest(async (req, res) => {
  setCors(req, res);
  if (handlePreflight(req, res)) return;

  try {
    const { memberToken, answers } = req.body;

    const response = await fetch(`${IDIQ_CONFIG.STAGE_BASE_URL}v1/enrollment/verification-questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${memberToken}`
      },
      body: JSON.stringify({ answers })
    });

    const result = await response.json();

    if (response.ok) {
      res.json({ success: true, verificationResult: result });
    } else {
      res.status(500).json({ error: result.message || 'Unknown error' });
    }
  } catch (error) {
    console.error('❌ IDIQ verification error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Generate IDIQ Dashboard URL
 */
exports.getIDIQDashboardURL = functions.https.onRequest(async (req, res) => {
  setCors(req, res);
  if (handlePreflight(req, res)) return;

  try {
    const { memberToken } = req.body;
    const dashboardURL = `https://gcpstage.identityiq.com/?Token=${memberToken}&isMobileApp=false&redirect=Dashboard.aspx`;
    res.json({ success: true, dashboardURL });
  } catch (error) {
    console.error('❌ IDIQ dashboard URL error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get Credit Score
 */
exports.getIDIQCreditScore = functions.https.onRequest(async (req, res) => {
  setCors(req, res);
  if (handlePreflight(req, res)) return;

  try {
    const { memberToken } = req.body;

    const response = await fetch(`${IDIQ_CONFIG.STAGE_BASE_URL}v1/credit-score`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${memberToken}` }
    });

    const result = await response.json();

    if (response.ok) {
      res.json({ success: true, score: result.score, date: result.date });
    } else {
      res.status(500).json({ error: 'Failed to retrieve credit score' });
    }
  } catch (error) {
    console.error('❌ IDIQ credit score error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get Quick View Report
 */
exports.getIDIQQuickViewReport = functions.https.onRequest(async (req, res) => {
  setCors(req, res);
  if (handlePreflight(req, res)) return;

  try {
    const { memberToken } = req.body;

    const response = await fetch(`${IDIQ_CONFIG.STAGE_BASE_URL}v1/quick-view-report`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${memberToken}` }
    });

    const result = await response.json();

    if (response.ok) {
      res.json({ success: true, reportData: result });
    } else {
      res.status(500).json({ error: 'Failed to retrieve quick view report' });
    }
  } catch (error) {
    console.error('❌ IDIQ quick view report error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get Full Credit Report
 */
exports.getIDIQCreditReport = functions.https.onRequest(async (req, res) => {
  setCors(req, res);
  if (handlePreflight(req, res)) return;

  try {
    const { memberToken } = req.body;

    const response = await fetch(`${IDIQ_CONFIG.STAGE_BASE_URL}v1/credit-report`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${memberToken}` }
    });

    const result = await response.json();

    if (response.ok) {
      res.json({ success: true, reportData: result });
    } else {
      res.status(500).json({ error: 'Failed to retrieve credit report' });
    }
  } catch (error) {
    console.error('❌ IDIQ credit report error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Submit Dispute
 */
exports.submitIDIQDispute = functions.https.onRequest(async (req, res) => {
  setCors(req, res);
  if (handlePreflight(req, res)) return;

  try {
    const { memberToken, disputeData } = req.body;

    const response = await fetch(`${IDIQ_CONFIG.STAGE_BASE_URL}v1/dispute/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${memberToken}`
      },
      body: JSON.stringify(disputeData)
    });

    const result = await response.json();

    if (response.ok) {
      res.json({ success: true, disputeResult: result });
    } else {
      res.status(500).json({ error: 'Failed to submit dispute' });
    }
  } catch (error) {
    console.error('❌ IDIQ dispute submission error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get Dispute Status
 */
exports.getIDIQDisputeStatus = functions.https.onRequest(async (req, res) => {
  setCors(req, res);
  if (handlePreflight(req, res)) return;

  try {
    const { memberToken, disputeId } = req.body;

    const response = await fetch(`${IDIQ_CONFIG.STAGE_BASE_URL}v1/dispute/${disputeId}/status`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${memberToken}` }
    });

    const result = await response.json();

    if (response.ok) {
      res.json({ success: true, disputeStatus: result });
    } else {
      res.status(500).json({ error: 'Failed to get dispute status' });
    }
  } catch (error) {
    console.error('❌ IDIQ dispute status error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// ADMIN FUNCTIONS
// ============================================

/**
 * Set User Custom Claims (Master Admin Only)
 */
exports.setUserClaims = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Sign in first.");
  }

  if (context.auth.uid !== MASTER_ADMIN_UID) {
    throw new functions.https.HttpsError("permission-denied", "Master admin access required.");
  }

  const { email, claims } = data;

  if (!email || !claims) {
    throw new functions.https.HttpsError("invalid-argument", "Provide email and claims.");
  }

  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, claims);
    
    console.log(`✅ Claims set for ${email}:`, claims);
    return { ok: true, uid: user.uid, claims };
  } catch (error) {
    console.error('❌ Error setting claims:', error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});

// ============================================
// AI RECEPTIONIST FUNCTIONS
// ============================================

/**
 * AI Lead Scoring
 */
exports.scoreLead = functions.https.onRequest(async (req, res) => {
  setCors(req, res);
  if (handlePreflight(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Use POST' });
  }

  try {
    const { lead } = req.body;

    if (!lead || !lead.transcript) {
      return res.status(400).json({ error: 'Missing lead transcript' });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: 'Missing OpenAI API key' });
    }

    const client = new OpenAI({ apiKey });

    const prompt = `Analyze this call transcript and score the lead from 0-100 for sales readiness.\nTranscript:\n${lead.transcript}`;

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a lead scoring expert. Analyze transcripts and provide a numerical score from 0-100.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 100,
    });

    const text = completion.choices?.[0]?.message?.content ?? '';
    const score = parseInt(text.match(/\d+/)?.[0] || '50', 10);

    console.log(`✅ Lead scored: ${score}/100`);
    return res.status(200).json({ score, analysis: text });

  } catch (error) {
    console.error('❌ Lead scoring error:', error);
    return res.status(500).json({ error: 'Failed to score lead', detail: error.message });
  }
});

/**
 * Updated AI Webhook with improved name handling
 * This replaces your existing aiWebhook function
 */
exports.aiWebhook = functions.https.onRequest(async (req, res) => {
  // Security check
  const apiKey = req.query.apiKey || req.body.apiKey;
  const WEBHOOK_API_KEY = 'scr-webhook-2025-secure-key-abc123';
  
  if (apiKey !== WEBHOOK_API_KEY) {
    console.error('❌ Unauthorized webhook access attempt');
    return res.status(403).json({ error: 'Unauthorized' });
  }
  
  try {
    const callData = req.body;
    console.log('📞 AI Receptionist webhook triggered');
    
    // Save to aiReceptionistCalls collection first
    const callRef = await admin.firestore().collection('aiReceptionistCalls').add({
      ...callData,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      processed: false
    });
    
    const callId = callRef.id;
    console.log(`✅ Call saved: ${callId}`);
    
    // Process the call with improved name handling
    const result = await processAIReceptionistCall(callData, callId);
    
    // Log result
    console.log(`✅ Processing complete:`, {
      contactId: result.contactId,
      action: result.action,
      quality: result.quality,
      needsReview: result.needsReview,
      flags: result.flags
    });
    
    // Send notification if needs review
    if (result.needsReview) {
      console.log(`🔔 Contact ${result.contactId} flagged for manual review`);
      // TODO: Send notification to admin
    }
    
    return res.status(200).json({
      success: true,
      callId: callId,
      contactId: result.contactId,
      action: result.action,
      message: 'Call processed successfully',
      quality: result.quality,
      needsReview: result.needsReview
    });
    
  } catch (error) {
    console.error('❌ Webhook error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Test endpoint to verify webhook is working
 * Call this URL manually: https://us-central1-my-clever-crm.cloudfunctions.net/testAiWebhook
 */
exports.testAiWebhook = functions.https.onRequest(async (req, res) => {
  try {
    // API Key Authentication
    const apiKey = req.headers['x-api-key'] || req.query.apiKey;
    if (!apiKey || apiKey !== WEBHOOK_API_KEY) {
      console.error('❌ Unauthorized test webhook attempt - invalid or missing API key');
      return res.status(403).json({ 
        success: false,
        error: 'Forbidden - Invalid or missing API key',
        hint: 'Include x-api-key header or apiKey query parameter'
      });
    }
    console.log('✅ API key validated successfully');
    const db = admin.firestore();
    
    // Create test call data
    const testCallData = {
      callId: 'test_' + Date.now(),
      callerID: '(555) 123-4567',
      callTimestamp: admin.firestore.FieldValue.serverTimestamp(),
      receivedAt: admin.firestore.FieldValue.serverTimestamp(),
      transcript: 'This is a test call transcript. The caller asked about credit repair services.',
      phone: '(555) 123-4567',
      phoneConfirmed: true,
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      intent: 'credit repair inquiry',
      sentiment: 'positive',
      status: 'test',
      processed: false,
      metadata: {
        source: 'manual_test',
        note: 'Created via testAiWebhook endpoint'
      }
    };

    // Save to collection
    const docRef = await db.collection('aiReceptionistCalls').add(testCallData);

    console.log(`✅ Test call created: ${docRef.id}`);

    res.status(200).json({
      success: true,
      message: 'Test call created successfully! Check Firestore aiReceptionistCalls collection.',
      documentId: docRef.id,
      testData: testCallData,
      instructions: 'Go to Firebase Console → Firestore → aiReceptionistCalls to see this test record'
    });

  } catch (error) {
    console.error('❌ Error creating test call:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Process AI Receptionist Calls (Firestore Trigger)
 */
// ============================================
// AI RECEPTIONIST CALL PROCESSING (REAL FIX WITH PHONE PARSING)
// Hybrid approach: Use intake form + parse transcript for missing critical data
// ============================================

const { OpenAI } = require('openai');

/**
 * Parse phone number from transcript
 * Handles formats like "5 5 5 8 5 5 5 4 1 0" or "555-855-5410"
 */
function parsePhoneFromTranscript(transcript) {
  console.log('🔍 Parsing phone number from transcript...');
  
  // Look for patterns like "my phone number is X X X..."
  const patterns = [
    /(?:my )?phone (?:number )?is[:\s]+(\d[\s\-\d]+\d)/gi,
    /call me (?:at|on)[:\s]+(\d[\s\-\d]+\d)/gi,
    /reach me at[:\s]+(\d[\s\-\d]+\d)/gi,
    /contact (?:me )?(?:at|on)[:\s]+(\d[\s\-\d]+\d)/gi
  ];
  
  for (const pattern of patterns) {
    const match = transcript.match(pattern);
    if (match && match[0]) {
      // Extract just the digits
      const digits = match[0].replace(/\D/g, '');
      
      // Valid US phone number should be 10 digits
      if (digits.length === 10) {
        console.log('✅ Found phone in transcript:', digits);
        return digits;
      }
    }
  }
  
  // Try to find 10 consecutive digits or digits with spaces/dashes
  const allDigits = transcript.match(/\d[\s\-\d]{8,}\d/g);
  if (allDigits) {
    for (const digitStr of allDigits) {
      const cleaned = digitStr.replace(/\D/g, '');
      if (cleaned.length === 10) {
        console.log('✅ Found phone pattern in transcript:', cleaned);
        return cleaned;
      }
    }
  }
  
  console.log('⚠️ No phone number found in transcript');
  return null;
}

/**
 * Extract data from rawPayload intake form fields
 */
function extractFromIntakeForm(rawPayload) {
  console.log('📋 Checking rawPayload for intake form data...');
  
  if (!rawPayload || typeof rawPayload !== 'object') {
    console.log('⚠️ No rawPayload found');
    return null;
  }
  
  // Extract data from intake form fields
  const fullName = rawPayload['Intake Form: May I ask for your full name so I may help you with better accuracy?'] || '';
  const phoneResponse = rawPayload['Intake Form: Is the number you\'re calling from the best way to reach you?'] || '';
  const email = rawPayload['Intake Form: Can you say or spell out your email address please?'] || '';
  
  // If we have at least a name, we can work with this
  if (fullName && fullName.trim().length > 0) {
    console.log('✅ Found intake form data:', { fullName, phoneResponse, email });
    
    // Parse name
    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    // Clean email (convert spoken format to email format)
    const cleanEmail = email
      .toLowerCase()
      .replace(/\s+at\s+/g, '@')
      .replace(/\s+dot\s+/g, '.')
      .replace(/\s+/g, '');
    
    // Parse phone - only use if it's actual digits, not "Yes" or other text
    let phone = phoneResponse.replace(/\D/g, '');
    if (phone.length !== 10) {
      // Invalid or missing phone in intake form
      phone = null;
    }
    
    return {
      firstName,
      lastName,
      phone: phone, // May be null if not in intake form
      email: cleanEmail,
      source: 'intake-form'
    };
  }
  
  console.log('⚠️ No intake form data found in rawPayload');
  return null;
}

/**
 * Helper function: Use OpenAI to extract structured data from transcript
 */
async function extractContactDataFromTranscript(transcript, summary) {
  const openaiKey = functions.config().openai?.api_key;
  
  if (!openaiKey) {
    console.error('❌ OpenAI API key not configured in Firebase');
    throw new Error('OpenAI API key not found');
  }
  
  const openai = new OpenAI({ apiKey: openaiKey });
  
  const prompt = `You are a data extraction expert. Extract contact information from this phone call transcript.

TRANSCRIPT:
${transcript}

SUMMARY:
${summary}

Extract the following information and return ONLY valid JSON (no markdown, no code blocks):
{
  "firstName": "extracted first name or empty string",
  "lastName": "extracted last name or empty string", 
  "phone": "extracted phone number digits only or empty string",
  "email": "extracted email or empty string",
  "address": {
    "street": "street address or empty string",
    "city": "city or empty string",
    "state": "state abbreviation (2 letters) or empty string",
    "zipCode": "zip code or empty string"
  },
  "creditScore": "estimated credit score as number or null",
  "issues": ["array of credit issues mentioned like collections, student loans, etc"],
  "bestTimeToCall": "preferred callback time or empty string",
  "interestLevel": "high, medium, or low based on conversation",
  "callbackRequested": true or false
}

CRITICAL INSTRUCTIONS:
- For phone numbers spelled out like "5 5 5 8 5 5 5 4 1 0", combine them: "5558555410"
- Parse addresses carefully: "Huntington Beach, California" = city: "Huntington Beach", state: "CA"
- Return ONLY the JSON object, no other text
- Use empty strings for missing text fields, null for missing numbers, empty arrays for lists`;

  try {
    console.log('🤖 Calling OpenAI to extract contact data from transcript...');
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a data extraction expert. Return only valid JSON, no markdown.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 500
    });

    const extractedText = completion.choices[0].message.content.trim();
    
    // Remove markdown code blocks if present
    const jsonText = extractedText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    const extracted = JSON.parse(jsonText);
    console.log('✅ AI extraction complete:', JSON.stringify(extracted, null, 2));
    return extracted;

  } catch (error) {
    console.error('❌ Error extracting contact data:', error);
    return {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      address: { street: '', city: '', state: '', zipCode: '' },
      creditScore: null,
      issues: [],
      bestTimeToCall: '',
      interestLevel: 'medium',
      callbackRequested: false
    };
  }
}

/**
 * Process AI Receptionist Calls (Firestore Trigger)
 * ✅ HYBRID APPROACH: Use intake form + parse transcript for complete data
 * ✅ TRIGGERS ON: Both CREATE and UPDATE events (so you can reprocess by changing processed flag)
 */
exports.processAIReceptionistCall = functions.firestore
  .document('aiReceptionistCalls/{docId}')
  .onWrite(async (change, context) => {
    // Handle both create and update events
    const snap = change.after;
    
    // If document was deleted, do nothing
    if (!snap.exists) {
      console.log('Document deleted, skipping');
      return null;
    }
    
    const data = snap.data();
    const docId = context.params.docId;
    
    console.log('🔄 Processing AI call:', docId);
    
    try {
      if (data.processed) {
        console.log('⏭️ Already processed, skipping');
        return null;
      }

      const transcript = data.transcript || '';
      const summary = data.summary || '';
      
      if (!transcript || transcript.length < 10) {
        console.error('❌ Transcript too short or missing');
        await snap.ref.update({
          processed: true,
          processedAt: admin.firestore.FieldValue.serverTimestamp(),
          processingError: 'Transcript missing or too short'
        });
        return null;
      }
      
      // ✅ HYBRID APPROACH: Combine intake form + transcript parsing + AI extraction
      
      let extracted = {
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        address: { street: '', city: '', state: '', zipCode: '' },
        creditScore: null,
        issues: [],
        bestTimeToCall: '',
        interestLevel: 'medium',
        callbackRequested: false
      };
      
      let extractionMethods = [];
      
      // STEP 1: Try intake form first (fast & free)
      const intakeFormData = extractFromIntakeForm(data.rawPayload);
      if (intakeFormData) {
        console.log('✅ Using intake form data');
        extractionMethods.push('intake-form');
        extracted.firstName = intakeFormData.firstName || extracted.firstName;
        extracted.lastName = intakeFormData.lastName || extracted.lastName;
        extracted.email = intakeFormData.email || extracted.email;
        if (intakeFormData.phone && intakeFormData.phone.length === 10) {
          extracted.phone = intakeFormData.phone;
        }
      }
      
      // STEP 2: Parse phone from transcript if still missing
      if (!extracted.phone || extracted.phone.length !== 10) {
        console.log('📞 Phone missing from intake form, parsing transcript...');
        const phoneFromTranscript = parsePhoneFromTranscript(transcript);
        if (phoneFromTranscript) {
          extracted.phone = phoneFromTranscript;
          extractionMethods.push('transcript-parse');
        }
      }
      
      // STEP 3: Use AI to fill in remaining gaps
      console.log('🤖 Using AI to extract additional details...');
      const aiExtracted = await extractContactDataFromTranscript(transcript, summary);
      extractionMethods.push('ai-extraction');
      
      // Merge AI data for missing fields
      if (!extracted.firstName) extracted.firstName = aiExtracted.firstName;
      if (!extracted.lastName) extracted.lastName = aiExtracted.lastName;
      if (!extracted.phone) extracted.phone = aiExtracted.phone;
      if (!extracted.email) extracted.email = aiExtracted.email;
      
      // Always use AI for address (more complete)
      extracted.address = aiExtracted.address;
      extracted.creditScore = aiExtracted.creditScore;
      extracted.issues = aiExtracted.issues;
      extracted.bestTimeToCall = aiExtracted.bestTimeToCall;
      extracted.interestLevel = aiExtracted.interestLevel;
      extracted.callbackRequested = aiExtracted.callbackRequested;
      
      const extractionMethod = extractionMethods.join('+');
      
      console.log('✅ Combined extraction complete:', {
        method: extractionMethod,
        firstName: extracted.firstName,
        lastName: extracted.lastName,
        phone: extracted.phone,
        email: extracted.email
      });
      
      // Validate we have minimum required data
      if (!extracted.phone || extracted.phone.length !== 10) {
        console.error('❌ CRITICAL: Phone number not extracted!');
        console.error('Transcript sample:', transcript.substring(0, 500));
      }
      
      // Calculate lead score
      let leadScore = 5;
      const duration = parseInt(data.callDuration || data.duration || 0);
      
      if (duration > 120) leadScore += 2;
      if (duration > 300) leadScore += 1;
      if (extracted.interestLevel === 'high') leadScore += 2;
      if (extracted.callbackRequested) leadScore += 1;
      if (extracted.creditScore && extracted.creditScore < 600) leadScore += 1;
      
      leadScore = Math.min(10, leadScore);
      
      // Determine urgency
      let urgencyLevel = 'medium';
      if (extracted.interestLevel === 'high' || extracted.callbackRequested) {
        urgencyLevel = 'high';
      }
      if (duration < 60) {
        urgencyLevel = 'low';
      }
      
      // Clean phone number
      const cleanPhone = extracted.phone.replace(/\D/g, '');
      
      // Create contact data
      const contactData = {
        firstName: extracted.firstName || 'Unknown',
        lastName: extracted.lastName || '',
        fullName: `${extracted.firstName || 'Unknown'} ${extracted.lastName || ''}`.trim(),
        email: extracted.email || '',
        phone: cleanPhone,
        
        address: extracted.address && extracted.address.city ? {
          street: extracted.address.street || '',
          city: extracted.address.city,
          state: extracted.address.state,
          zipCode: extracted.address.zipCode || ''
        } : null,
        
        creditInfo: {
          estimatedScore: extracted.creditScore,
          issues: extracted.issues || [],
          goals: 'Credit repair',
          source: 'ai-receptionist-call'
        },
        
        category: 'lead',
        leadScore: leadScore,
        urgencyLevel: urgencyLevel,
        source: 'ai-receptionist',
        
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastActivityDate: admin.firestore.FieldValue.serverTimestamp(),
        callDate: admin.firestore.Timestamp.now(),
        
        bestTimeToCall: extracted.bestTimeToCall || '',
        preferredContact: 'phone',
        
        lifecycleStatus: 'new',
        primaryRole: 'lead',
        roles: ['lead'],
        
        notes: [
          `📞 Call Date: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
          `⏱️ Duration: ${Math.floor(duration / 60)}m ${duration % 60}s`,
          `📊 Lead Score: ${leadScore}/10`,
          `💡 Interest Level: ${extracted.interestLevel}`,
          extracted.issues.length > 0 ? `⚠️ Issues: ${extracted.issues.join(', ')}` : '',
          extracted.bestTimeToCall ? `⏰ Best Time: ${extracted.bestTimeToCall}` : '',
          `🔗 Call Recording: ${data.rawPayload?.call_info_link || 'N/A'}`,
          `🤖 Extraction: ${extractionMethod}`
        ].filter(Boolean).join('\n'),
        
        aiReceptionistCallId: docId,
        sentiment: data.sentiment || null,
        extractionMethod: extractionMethod
      };
      
      console.log('📋 Final contact data:', {
        name: contactData.fullName,
        email: contactData.email,
        phone: contactData.phone,
        method: extractionMethod
      });
      
      // Check for existing contact
      let existingContact = null;
      
      if (cleanPhone && cleanPhone.length === 10) {
        const phoneQuery = await admin.firestore()
          .collection('contacts')
          .where('phone', '==', cleanPhone)
          .limit(1)
          .get();
        
        if (!phoneQuery.empty) {
          existingContact = phoneQuery.docs[0];
          console.log('👤 Found existing contact:', existingContact.id);
        }
      }
      
      // Create or update contact
      if (existingContact) {
        await existingContact.ref.update({
          lastActivityDate: admin.firestore.FieldValue.serverTimestamp(),
          leadScore: contactData.leadScore,
          urgencyLevel: contactData.urgencyLevel,
          notes: admin.firestore.FieldValue.arrayUnion(
            `📞 Follow-up call: ${new Date().toLocaleDateString()} - Score: ${leadScore}/10`
          )
        });
        console.log('✅ Updated existing contact:', existingContact.id);
      } else {
        const newContactRef = await admin.firestore()
          .collection('contacts')
          .add(contactData);
        console.log('✅ Created new contact:', newContactRef.id);
      }
      
      // Update aiReceptionistCall document
      await snap.ref.update({
        processed: true,
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
        
        extractedData: {
          firstName: extracted.firstName,
          lastName: extracted.lastName,
          phone: extracted.phone,
          email: extracted.email,
          address: extracted.address,
          creditScore: extracted.creditScore,
          issues: extracted.issues,
          bestTimeToCall: extracted.bestTimeToCall,
          interestLevel: extracted.interestLevel
        },
        
        leadScore: leadScore,
        category: 'lead',
        urgencyLevel: urgencyLevel,
        extractionMethod: extractionMethod,
        
        callerName: contactData.fullName,
        customerName: contactData.fullName,
        customerPhone: extracted.phone,
        intent: extracted.issues.join(', ') || 'credit repair inquiry'
      });
      
      console.log('✅ Successfully processed with', extractionMethod);
      return { success: true, leadScore, contactName: contactData.fullName, method: extractionMethod };
      
    } catch (error) {
      console.error('❌ Error processing call:', error);
      
      await snap.ref.update({
        processed: false,
        processingError: error.message,
        processingErrorStack: error.stack,
        processingAttemptedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      return null;
    }
  });

// ============================================
// TEST FUNCTION
// ============================================

/**
 * Simple test endpoint to verify functions are working
 */
exports.testFunction = functions.runWith({
  invoker: 'public'
}).https.onRequest((req, res) => {
  setCors(req, res);
  if (handlePreflight(req, res)) return;

  res.json({ 
    status: 'success', 
    message: '✅ Firebase Functions are working perfectly!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
});

console.log('🚀 SpeedyCRM Functions loaded successfully!');

// ============================================================================
// EMAIL AUTOMATION SYSTEM (Added Oct 2025)
// ============================================================================

// ═══════════════════════════════════════════════════════════════════════════
// EMAIL WORKFLOW SYSTEM - Complete Migration to New Engine
// ═══════════════════════════════════════════════════════════════════════════

const { 
  startWorkflow,
  processScheduledStages,
  pauseWorkflow,
  resumeWorkflow,
  stopWorkflow,
  sendManualEmail,
  getWorkflowStatus,
  runContactAnalytics,
  SendGridService,
  checkIDIQApplications,
  generateAIEmailContent
} = require('./emailWorkflowEngine');

// ═══════════════════════════════════════════════════════════════════════════
// EMAIL WORKFLOW SYSTEM
// ═══════════════════════════════════════════════════════════════════════════

// Trigger: When contact is created
exports.onContactCreated = functions.firestore
  .document('contacts/{contactId}')
  .onCreate(async (snap, context) => {
    const contactId = context.params.contactId;
    const contactData = snap.data();
    
    try {
      console.log(`📞 New contact created: ${contactId}`);
      
      // Start email workflow
      const result = await startWorkflow(contactId, contactData);
      
      if (result && result.success) {
        console.log(`✅ Workflow started: ${result.workflowId}`);
      } else {
        console.log(`⚠️ Workflow not started: ${result && result.reason ? result.reason : 'unknown reason'}`);
      }
      
    } catch (error) {
      console.error('❌ Error starting workflow:', error);
    }
  });

// Scheduled: Process due workflow stages
exports.processWorkflowStages = functions.pubsub
  .schedule('every 15 minutes')
  .timeZone('America/Los_Angeles')
  .onRun(async (context) => {
    console.log('⏰ Processing due workflow stages...');
    
    try {
      await processScheduledStages();
      console.log('✅ Workflow stages processed');
    } catch (error) {
      console.error('❌ Error processing stages:', error);
    }
    
    return null;
  });

// Webhook: Handle SendGrid events (opens, clicks, bounces, etc.)
exports.handleSendGridWebhook = functions.https.onRequest(async (req, res) => {
  try {
    const events = req.body;
    
    if (!Array.isArray(events)) {
      res.status(400).send('Invalid payload');
      return;
    }
    
    await SendGridService.handleWebhook(events);
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Error');
  }
});

// ───────────────────────────────────────────────────────────────────────────
// EXPORTS - Cloud Functions (wire to engine implementations)
// ───────────────────────────────────────────────────────────────────────────

// Note: scheduled Pub/Sub function defined above is the single exporter for processing stages

// Manual send (callable)
exports.manualSendEmail = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  }
  try {
    const { contactId, templateId, customData } = data;
    await sendManualEmail(contactId, templateId, customData);
    return { success: true };
  } catch (error) {
    console.error('Manual email error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Pause/resume wrappers
exports.pauseWorkflowForContact = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  }
  try {
    await pauseWorkflow(data.contactId, data.reason);
    return { success: true };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});

exports.resumeWorkflowForContact = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  }
  try {
    await resumeWorkflow(data.contactId);
    return { success: true };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Get workflow status
exports.getContactWorkflowStatus = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  }
  try {
    const status = await getWorkflowStatus(data.contactId);
    return status;
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Legacy compatibility callables
exports.checkIDIQApplications = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  }
  try {
    const summary = await checkIDIQApplications(data.contactIds || []);
    return summary;
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});

exports.generateAIEmailContent = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  }
  try {
    const content = await generateAIEmailContent(
      data.templateId,
      data.contactData,
      data.options || {}
    );
    return content;
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});

console.log('📧 Email Automation Functions exported successfully!');