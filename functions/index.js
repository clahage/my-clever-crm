// ============================================
// AI Receptionist Webhook
const { receiveAIReceptionistCall, reprocessAIReceptionistCall } = require('./webhooks/aiReceptionistReceiver');
exports.receiveAIReceptionistCall = receiveAIReceptionistCall;
exports.reprocessAIReceptionistCall = reprocessAIReceptionistCall;

// Notifications
const { sendMorningSummary } = require('./automation/notificationService');
exports.sendMorningSummary = sendMorningSummary;

// Zelle Payments
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
// functions/index.js - Firebase Cloud Functions for SpeedyCRM
// VERSION: 2.0 - Enhanced with better error handling and organization
// Last Updated: 2025-10-11

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const fetch = require('node-fetch');
const { OpenAI } = require('openai');

// ============================================
// FIREBASE ADMIN INITIALIZATION
// ============================================
// ✅ Simple auto-authentication - No serviceAccountKey.json needed!
if (!admin.apps.length) {
  admin.initializeApp();
  console.log('✅ Firebase Admin initialized successfully');
}

// ============================================
// CONFIGURATION
// ============================================

// Master Admin UID (for secure operations)
const MASTER_ADMIN_UID = "BgTAnHE4zMOLr4ZhBqCBfFb3h6D3";

// IDIQ API Configuration
const IDIQ_CONFIG = {
  STAGE_BASE_URL: 'https://api-stage.identityiq.com/pif-service/',
  PROD_BASE_URL: 'https://api.identityiq.com/pif-service/',
  OFFER_CODE: process.env.IDIQ_OFFER_CODE || '4312869N',
  PLAN_CODE: process.env.IDIQ_PLAN_CODE || 'PLAN03B'
};

const IDIQ_ENV = process.env.IDIQ_ENV || "stage";
const IDIQ_PARTNER_TOKEN_PATH = process.env.IDIQ_PARTNER_TOKEN_PATH;

// Allowed origins for CORS
const ALLOW_ORIGINS = new Set([
  "https://my-clever-crm--preview-auth-mba1x04f.web.app",
  "https://my-clever-crm.web.app",
  "https://my-clever-crm.firebaseapp.com",
  "https://myclevercrm.com", // Added your custom domain
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
 * MyAIFrontDesk Webhook Handler - Enhanced with full processing
 */
exports.aiWebhook = functions.runWith({
  invoker: 'public'
}).https.onRequest(async (req, res) => {
  setCors(req, res);
  if (handlePreflight(req, res)) return;

  console.log('📞 AI Receptionist webhook received:', new Date().toISOString());

  try {
    // Save to aiReceptionistCalls collection
    const docRef = await admin.firestore()
      .collection('aiReceptionistCalls')
      .add({
        ...req.body,
        receivedAt: admin.firestore.FieldValue.serverTimestamp(),
        processed: false,
        source: 'ai-receptionist-public'
      });

    console.log('✅ Webhook saved:', docRef.id);

    // Trigger async processing using the sophisticated pipeline
    try {
      const { processAICallAsync } = require('./webhooks/callProcessor');
      processAICallAsync(docRef.id, req.body).catch(err => {
        console.error('❌ Error in async processing:', err);
      });
    } catch (err) {
      console.log('⚠️ Advanced processing not available, using basic processing');
      
      // Fallback to basic processing
      if (req.body.name || req.body.email) {
        await admin.firestore().collection('contacts').add({
          name: req.body.name || 'Unknown',
          email: req.body.email || '',
          phone: req.body.caller || '',
          category: 'lead',
          source: 'AI Receptionist',
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        console.log('✅ Basic lead created');
      }
    }

    res.status(200).json({ success: true, id: docRef.id });

  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(500).json({ error: error.message });
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