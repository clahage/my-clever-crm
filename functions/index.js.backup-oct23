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
 * Webhook endpoint for AI Receptionist calls from myaifrontdeskdashboard.com
 * URL: https://us-central1-my-clever-crm.cloudfunctions.net/aiWebhook
 * Method: POST
 */
exports.aiWebhook = functions.https.onRequest(async (req, res) => {
  // Set CORS headers to allow requests from any origin
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // API Key Authentication
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  if (!apiKey || apiKey !== WEBHOOK_API_KEY) {
    console.error('❌ Unauthorized webhook attempt - invalid or missing API key');
    return res.status(403).json({ 
      success: false,
      error: 'Forbidden - Invalid or missing API key',
      hint: 'Include x-api-key header or apiKey query parameter'
    });
  }
  console.log('✅ API key validated successfully');

  try {
    console.log('AI Receptionist webhook received:', JSON.stringify(req.body, null, 2));

    const callData = req.body;

    // Validate that we have some data
    if (!callData || Object.keys(callData).length === 0) {
      console.error('Empty webhook data received');
      return res.status(400).json({ 
        success: false,
        error: 'No data received in webhook' 
      });
    }

    // Helper function to normalize phone numbers
    function normalizePhone(phone) {
      if (!phone) return null;
      const digits = phone.replace(/\D/g, '');
      const cleaned = digits.startsWith('1') && digits.length === 11 
        ? digits.substring(1) 
        : digits;
      if (cleaned.length === 10) {
        return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6)}`;
      }
      return phone;
    }

    // Extract and normalize data from myaifrontdesk webhook
    // Adjust field names based on what myaifrontdesk actually sends
    const normalizedData = {
      // Call identification
      callId: callData.call_id || callData.id || `call_${Date.now()}`,
      callerID: normalizePhone(callData.caller_id || callData.from || callData.phone_number),
      
      // Timestamps
      callTimestamp: callData.timestamp || callData.call_time || callData.created_at || admin.firestore.FieldValue.serverTimestamp(),
      receivedAt: admin.firestore.FieldValue.serverTimestamp(),
      
      // Call content
      transcript: callData.transcript || callData.text || callData.message || callData.conversation || '',
      duration: callData.duration || callData.call_duration || null,
      recording_url: callData.recording_url || callData.recording || null,
      
      // Contact info (from AI questions in myaifrontdesk)
      phone: normalizePhone(callData.phone || callData.caller_id || callData.from),
      phoneConfirmed: callData.phone_confirmed || false,
      email: callData.email || callData.customer_email || null,
      firstName: callData.first_name || callData.firstName || (callData.name ? callData.name.split(' ')[0] : null),
      lastName: callData.last_name || callData.lastName || (callData.name ? callData.name.split(' ').slice(1).join(' ') : null),
      
      // Intent & Analysis
      intent: callData.intent || callData.purpose || callData.reason || null,
      sentiment: callData.sentiment || 'neutral',
      summary: callData.summary || null,
      
      // Questions & Answers (myaifrontdesk format)
      questionsAnswered: callData.questions || callData.answers || [],
      customFields: callData.custom_fields || callData.custom_data || {},
      
      // Status
      status: 'received',
      processed: false,
      
      // AI Agent info
      agentName: 'AI Receptionist',
      language: callData.language || 'en',
      
      // Transfer info
      transferRequested: callData.transfer_requested || callData.transferred || false,
      transferReason: callData.transfer_reason || null,
      
      // Additional metadata
      metadata: {
        webhookVersion: '1.0',
        source: 'myaifrontdesk',
        receivedFrom: req.headers['user-agent'] || 'unknown',
        rawData: callData // Store original for debugging
      }
    };

    // Save to aiReceptionistCalls collection
    const db = admin.firestore();
    const docRef = await db.collection('aiReceptionistCalls').add(normalizedData);
    
    console.log(`✅ AI Receptionist call saved successfully: ${docRef.id}`);

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Call received and queued for processing',
      callId: normalizedData.callId,
      documentId: docRef.id,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error processing AI Receptionist webhook:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
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
exports.processAIReceptionistCall = functions.firestore
  .document('aiReceptionistCalls/{docId}')
  .onCreate(async (snap, context) => {
    const data = snap.data();
    const docId = context.params.docId;
    
    console.log('🔄 Processing AI call:', docId);
    
    try {
      if (data.processed) {
        console.log('⏭️ Already processed, skipping');
        return null;
      }

      // Extract caller info
      const callerName = data['Intake Form: May I ask for your full name so I may help you with better accuracy?'] || 
                        data.name || 'Unknown';
      const callerEmail = data['Intake Form: Can you say or spell out your email address please?'] || 
                         data.email || '';
      const callerPhone = data.caller || '';
      
      // Clean email
      let cleanEmail = callerEmail.toLowerCase()
        .replace(/\s+at\s+/g, '@')
        .replace(/\s+dot\s+/g, '.')
        .replace(/\s+/g, '');
      
      console.log('📋 Extracted - Name:', callerName, 'Email:', cleanEmail, 'Phone:', callerPhone);
      
      // Calculate lead score
      let leadScore = 5;
      const duration = parseInt(data.duration) || 0;
      
      if (duration > 120) leadScore += 2;
      if (duration > 300) leadScore += 1;
      if (data.transcript && data.transcript.includes('credit')) leadScore += 1;
      if (data.transcript && data.transcript.includes('help')) leadScore += 1;
      
      const urgencyLevel = duration > 180 ? 'high' : 'medium';
      
      // Create contact data
      const [firstName, ...lastNameParts] = callerName.split(' ');
      const contactData = {
        firstName: firstName || '',
        lastName: lastNameParts.join(' ') || '',
        fullName: callerName,
        email: cleanEmail,
        phone: callerPhone.replace(/\D/g, ''),
        category: 'lead',
        leadScore: Math.min(10, leadScore),
        urgencyLevel,
        source: 'ai-receptionist',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastActivityDate: admin.firestore.FieldValue.serverTimestamp(),
        notes: `Call duration: ${duration}s\nFrom: ${data.username || 'Unknown'}\nTimestamp: ${data.timestamp}`,
        lifecycleStatus: 'new',
        primaryRole: 'lead',
        roles: ['lead']
      };
      
      // Check for existing contact
      let existingContact = null;
      
      if (callerPhone) {
        const phoneQuery = await admin.firestore()
          .collection('contacts')
          .where('phone', '==', contactData.phone)
          .limit(1)
          .get();
        
        if (!phoneQuery.empty) {
          existingContact = phoneQuery.docs[0];
          console.log('👤 Found existing contact:', existingContact.id);
        }
      }
      
      if (existingContact) {
        await existingContact.ref.update({
          lastActivityDate: admin.firestore.FieldValue.serverTimestamp(),
          leadScore: contactData.leadScore,
          urgencyLevel: contactData.urgencyLevel
        });
        console.log('✅ Updated existing contact');
      } else {
        const newContactRef = await admin.firestore()
          .collection('contacts')
          .add(contactData);
        console.log('✅ Created new contact:', newContactRef.id);
      }
      
      // Mark as processed
      await snap.ref.update({
        processed: true,
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
        leadScore,
        category: 'lead',
        urgencyLevel,
        callerName
      });
      
      console.log('✅ Successfully processed call');
      return { success: true };
      
    } catch (error) {
      console.error('❌ Error processing call:', error);
      
      await snap.ref.update({
        processed: false,
        processingError: error.message,
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