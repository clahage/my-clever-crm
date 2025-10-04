const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true }); // Primary CORS declaration

// Initialize admin
if (!admin.apps.length) {
  admin.initializeApp();
}

// ============================================
// EMAIL TRACKING FUNCTIONS
// ============================================

// Email Open Tracking Pixel Endpoint
// EXPLICITLY SET INVOKER TO PUBLIC to resolve deployment IAM error
exports.trackEmailOpen = functions.runWith({
  invoker: 'public'
}).https.onRequest(async (req, res) => {
  const trackingId = req.path.split('/').pop();
  
  if (!trackingId || trackingId === 'trackEmailOpen') {
    res.status(400).send('Missing tracking ID');
    return;
  }

  try {
    const trackingQuery = await admin.firestore().collection('emailTracking')
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
        await admin.firestore().collection('emails').doc(trackingData.emailId).update({
          opened: true,
          openedAt: trackingData.openedAt || admin.firestore.FieldValue.serverTimestamp(),
          openCount: admin.firestore.FieldValue.increment(1)
        });
      }
    }
  } catch (error) {
    console.error('Error tracking email open:', error);
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

// Email Link Click Tracking
// EXPLICITLY SET INVOKER TO PUBLIC to resolve deployment IAM error
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
    const trackingQuery = await admin.firestore().collection('emailTracking')
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
    }
  } catch (error) {
    console.error('Error tracking email click:', error);
  }
  
  res.redirect(destinationUrl);
});

// Website Visitor Tracking
// EXPLICITLY SET INVOKER TO PUBLIC to resolve deployment IAM error
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
      console.error('Error tracking website visitor:', error);
      res.status(500).json({ error: 'Failed to track' });
    }
  });
});

// ============================================
// IDIQ FUNCTIONS (Credential/Auth Helpers)
// ============================================

const fetch = require('node-fetch');
const { OpenAI } = require('openai');

// Allowlist of front-end origins that may call our HTTP function (preview + prod + localhost)
const ALLOW_ORIGINS = new Set([
  "https://my-clever-crm--preview-auth-mba1x04f.web.app",
  "https://my-clever-crm.web.app",
  "https://my-clever-crm.firebaseapp.com",
  "http://localhost:5173",
  "http://localhost:3000"
]);

function setCors(req, res) {
  const origin = req.headers.origin;
  // Reflect allowed origin (or fall back to wildcard if origin is absent)
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

// IDIQ API Configuration
const IDIQ_CONFIG = {
  STAGE_BASE_URL: 'https://api-stage.identityiq.com/pif-service/',
  PROD_BASE_URL: 'https://api.identityiq.com/pif-service/',
  OFFER_CODE: process.env.IDIQ_OFFER_CODE || '4312869N',
  PLAN_CODE: process.env.IDIQ_PLAN_CODE || 'PLAN03B'
};

const IDIQ_ENV = process.env.IDIQ_ENV || "stage"; // "stage" | "prod"
const IDIQ_PARTNER_TOKEN_PATH = process.env.IDIQ_PARTNER_TOKEN_PATH;

exports.getIDIQPartnerToken = functions.https.onRequest(async (req, res) => {
  setCors(req, res);
  if (req.method === "OPTIONS") {
    // Preflight
    return res.status(204).send(""); // 204 No Content is ideal for preflight
  }
  try {
  const partnerId = process.env.IDIQ_PARTNER_ID || functions.config().idiq?.partner_id || '';
  const partnerSecret = process.env.IDIQ_PARTNER_SECRET || functions.config().idiq?.partner_secret || '';
    if (!partnerId || !partnerSecret) throw new Error("Missing IDIQ credentials");
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
      // Use correct capitalization for the request body
      const requestBody = {
        partnerId: partnerId,
        partnerSecret: partnerSecret
      };
      // Log request details (partially masked)
      console.log('IDIQ Request Details:', {
        url: fullUrl,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          partnerId: partnerId.substring(0, 4) + '***',
          partnerSecret: 'LENGTH:' + partnerSecret.length
        }
      });
      // Optionally add extra headers if required by IDIQ
      const extraHeaders = {};
      // Uncomment and set if needed:
      // extraHeaders['API-Version'] = '1.0';
      // extraHeaders['X-Partner-ID'] = partnerId;
      // extraHeaders['Authorization'] = `Bearer ${partnerSecret}`;
      const r = await fetch(fullUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          ...extraHeaders
        },
        body: JSON.stringify(requestBody),
      });
      const raw = await r.text();
      // Log response details
      console.log('IDIQ Response:', {
        status: r.status,
        statusText: r.statusText,
        headers: Object.fromEntries(r.headers.entries()),
        body: raw
      });
      let data = null;
      try { data = raw ? JSON.parse(raw) : null; } catch { /* non-JSON */ }
      last = { status: r.status, raw, url: fullUrl, parsed: data };
      // Success shape (token present)
      const token = data?.token || data?.access_token || data?.partnerToken;
      if (r.ok && token) {
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
    console.error("[IDIQ partner-token] failed", last.status, last.url, last.raw?.slice(0, 500));
    return res.status(502).json(errorResponse);
  } catch (error) {
    console.error('IDIQ partner token error:', error);
    res.status(500).json({ error: error.message, environment: IDIQ_ENV });
  }
});

// Callable: getIDIQPartnerTokenCallable
exports.getIDIQPartnerTokenCallable = functions.https.onCall(async (data, context) => {
  const partnerId = process.env.IDIQ_PARTNER_ID || functions.config().idiq?.partner_id || '';
  const partnerSecret = process.env.IDIQ_PARTNER_SECRET || functions.config().idiq?.partner_secret || '';
  if (!partnerId || !partnerSecret) throw new functions.https.HttpsError("failed-precondition", "Missing IDIQ credentials");
  try {
    const response = await fetch(`${IDIQ_CONFIG.STAGE_BASE_URL}v1/enrollment/partner-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ partnerId, partnerSecret })
    });
    const result = await response.json();
    if (response.status === 200) {
      return { success: true, token: result.accessToken, expiresIn: result.expiresIn };
    } else {
      throw new functions.https.HttpsError("internal", result.message || 'Unknown error');
    }
  } catch (error) {
    console.error('IDIQ partner token error:', error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});

// Enroll Member in IDIQ
exports.enrollIDIQMember = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.status(200).send('');
    return;
  }
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
    if (response.status === 200) {
      res.json({ success: true, message: 'Member enrolled successfully' });
    } else {
      const error = await response.json();
      res.status(500).json({ error: error.message || 'Unknown error' });
    }
  } catch (error) {
    console.error('IDIQ enrollment error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get Member Token
exports.getIDIQMemberToken = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.status(200).send('');
    return;
  }
  try {
    const { partnerToken, memberEmail } = req.body;
    const response = await fetch(`${IDIQ_CONFIG.STAGE_BASE_URL}v1/enrollment/partner-member-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${partnerToken}`
      },
      body: JSON.stringify({ memberEmail: memberEmail })
    });
    const result = await response.json();
    if (response.status === 200) {
      res.json({ success: true, memberToken: result.accessToken, expiresIn: result.expiresIn });
    } else {
      res.status(500).json({ error: result.message || 'Unknown error' });
    }
  } catch (error) {
    console.error('IDIQ member token error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get Verification Questions
exports.getVerificationQuestions = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.status(200).send('');
    return;
  }
  try {
    const { memberToken } = req.body;
    const response = await fetch(`${IDIQ_CONFIG.STAGE_BASE_URL}v1/enrollment/verification-questions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${memberToken}`
      }
    });
    const result = await response.json();
    if (response.status === 200 && result.isSuccess) {
      res.json({ success: true, questions: result.questions });
    } else {
      res.status(500).json({ error: result.message || 'Unknown error' });
    }
  } catch (error) {
    console.error('IDIQ verification questions error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Submit Verification Answers
exports.submitVerificationAnswers = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.status(200).send('');
    return;
  }
  try {
    const { memberToken, answers } = req.body;
    const response = await fetch(`${IDIQ_CONFIG.STAGE_BASE_URL}v1/enrollment/verification-questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${memberToken}`
      },
      body: JSON.stringify({ answers: answers })
    });
    const result = await response.json();
    if (response.status === 200) {
      res.json({ success: true, verificationResult: result });
    } else {
      res.status(500).json({ error: result.message || 'Unknown error' });
    }
  } catch (error) {
    console.error('IDIQ verification error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate IDIQ Dashboard URL
exports.getIDIQDashboardURL = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.status(200).send('');
    return;
  }
  try {
    const { memberToken } = req.body;
    const dashboardURL = `https://gcpstage.identityiq.com/?Token=${memberToken}&isMobileApp=false&redirect=Dashboard.aspx`;
    res.json({ success: true, dashboardURL: dashboardURL });
  } catch (error) {
    console.error('IDIQ dashboard URL error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get Credit Score
exports.getIDIQCreditScore = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.status(200).send('');
    return;
  }
  try {
    const { memberToken } = req.body;
    const response = await fetch(`${IDIQ_CONFIG.STAGE_BASE_URL}v1/credit-score`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${memberToken}` }
    });
    const result = await response.json();
    if (response.status === 200) {
      res.json({ success: true, score: result.score, date: result.date });
    } else {
      res.status(500).json({ error: 'Failed to retrieve credit score' });
    }
  } catch (error) {
    console.error('IDIQ credit score error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get Quick View Report
exports.getIDIQQuickViewReport = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.status(200).send('');
    return;
  }
  try {
    const { memberToken } = req.body;
    const response = await fetch(`${IDIQ_CONFIG.STAGE_BASE_URL}v1/quick-view-report`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${memberToken}` }
    });
    const result = await response.json();
    if (response.status === 200) {
      res.json({ success: true, reportData: result });
    } else {
      res.status(500).json({ error: 'Failed to retrieve quick view report' });
    }
  } catch (error) {
    console.error('IDIQ quick view report error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get Full Credit Report
exports.getIDIQCreditReport = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.status(200).send('');
    return;
  }
  try {
    const { memberToken } = req.body;
    const response = await fetch(`${IDIQ_CONFIG.STAGE_BASE_URL}v1/credit-report`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${memberToken}` }
    });
    const result = await response.json();
    if (response.status === 200) {
      res.json({ success: true, reportData: result });
    } else {
      res.status(500).json({ error: 'Failed to retrieve credit report' });
    }
  } catch (error) {
    console.error('IDIQ credit report error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Submit Dispute
exports.submitIDIQDispute = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.status(200).send('');
    return;
  }
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
    if (response.status === 200) {
      res.json({ success: true, disputeResult: result });
    } else {
      res.status(500).json({ error: 'Failed to submit dispute' });
    }
  } catch (error) {
    console.error('IDIQ dispute submission error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get Dispute Status
exports.getIDIQDisputeStatus = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.status(200).send('');
    return;
  }
  try {
    const { memberToken, disputeId } = req.body;
    const response = await fetch(`${IDIQ_CONFIG.STAGE_BASE_URL}v1/dispute/${disputeId}/status`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${memberToken}` }
    });
    const result = await response.json();
    if (response.status === 200) {
      res.json({ success: true, disputeStatus: result });
    } else {
      res.status(500).json({ error: 'Failed to get dispute status' });
    }
  } catch (error) {
    console.error('IDIQ dispute status error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test Function
exports.testFunction = functions.runWith({
  invoker: 'public'
}).https.onRequest((req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  res.json({ 
    status: 'success', 
    message: 'Firebase Functions are working!',
    timestamp: new Date().toISOString()
  });
});

// Replace with MY UID (I can get it from auth.currentUser.uid in console)
const MASTER_ADMIN_UID = "BgTAnHE4zMOLr4ZhBqCBfFb3h6D3";

exports.setUserClaims = functions.https.onCall(async (data, context) => {
  // CORS is handled automatically for onCall functions by Firebase
  if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "Sign in first.");
  if (context.auth.uid !== MASTER_ADMIN_UID) throw new functions.https.HttpsError("permission-denied", "Admins only.");

  const { email, claims } = data;
  if (!email || !claims) throw new functions.https.HttpsError("invalid-argument", "Provide email + claims.");

  const user = await admin.auth().getUserByEmail(email);
  await admin.auth().setCustomUserClaims(user.uid, claims);
  return { ok: true, uid: user.uid, claims };
});

// AI Receptionist Lead Scoring Endpoint
exports.scoreLead = functions.https.onRequest(async (req, res) => {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).send('');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' });
  try {
    const { lead } = req.body;
    if (!lead || !lead.transcript) {
      return res.status(400).json({ error: 'Missing lead transcript' });
    }
    // Use OpenAI to analyze transcript and score lead
    const apiKey = functions.config().openai?.key;
    if (!apiKey) return res.status(500).json({ error: 'Missing OpenAI key in functions config (openai.key)' });
    const client = new OpenAI({ apiKey });
    const prompt = `Analyze this transcript and score the lead from 0-100 for sales readiness.\nTranscript:\n${lead.transcript}`;
    const completion = await client.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        { role: 'system', content: 'You are a lead scoring expert.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 100,
    });
    const text = completion.choices?.[0]?.message?.content ?? '';
    // Try to extract score from response
    const score = parseInt(text.match(/\d+/)?.[0] || '50', 10);
    return res.status(200).json({ score, raw: text });
  } catch (err) {
    console.error('Lead scoring error', err);
    return res.status(500).json({ error: 'Failed to score lead', detail: err.message || String(err) });
  }
});

// MyAIFrontDesk Webhook Handler
exports.aiWebhook = functions.runWith({
  invoker: 'public'
}).https.onRequest(async (req, res) => {
  // Add CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  console.log('MyAIFrontDesk webhook received at:', new Date().toISOString());
  console.log('Request body:', JSON.stringify(req.body));
  try {
    // Create the aiReceptionistCalls collection if it doesn't exist
    // and add the webhook data
    const docRef = await admin.firestore().collection('aiReceptionistCalls').add({
      ...req.body,
      receivedAt: admin.firestore.FieldValue.serverTimestamp(),
      processed: false
    });
    console.log('Webhook data saved with ID:', docRef.id);
    // Also create a lead if name or email exists
    if (req.body.name || req.body.email) {
      await admin.firestore().collection('contacts').add({
        name: req.body.name || 'Unknown',
        email: req.body.email || '',
        phone: req.body.caller || '',
        category: 'lead',
        source: 'AI Receptionist',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log('Lead created in contacts');
    }
    res.status(200).json({ success: true, id: docRef.id });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Process AI Receptionist Calls into Contacts (Keep this at the end)
exports.processAIReceptionistCall = functions.firestore
  .document('aiReceptionistCalls/{docId}')
  .onCreate(async (snap, context) => {
    const data = snap.data();
    const docId = context.params.docId;
    
    console.log('Processing new AI call:', docId);
    
    try {
      // Skip if already processed
      if (data.processed) {
        console.log('Call already processed, skipping');
        return null;
      }

      // Extract caller information from intake forms
      const callerName = data['Intake Form: May I ask for your full name so I may help you with better accuracy?'] || 
                        data.name || 'Unknown';
      const callerEmail = data['Intake Form: Can you say or spell out your email address please?'] || 
                         data.email || '';
      const callerPhone = data.caller || '';
      
      // Clean up spelled-out email
      let cleanEmail = callerEmail.toLowerCase()
        .replace(/\s+at\s+/g, '@')
        .replace(/\s+dot\s+/g, '.')
        .replace(/\s+/g, '');
      
      console.log('Extracted - Name:', callerName, 'Email:', cleanEmail, 'Phone:', callerPhone);
      
      // Basic lead scoring
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
        urgencyLevel: urgencyLevel,
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
        const phoneQuery = await admin.firestore().collection('contacts')
          .where('phone', '==', contactData.phone)
          .limit(1)
          .get();
        
        if (!phoneQuery.empty) {
          existingContact = phoneQuery.docs[0];
          console.log('Found existing contact:', existingContact.id);
        }
      }
      
      if (existingContact) {
        // Update existing contact
        await existingContact.ref.update({
          lastActivityDate: admin.firestore.FieldValue.serverTimestamp(),
          leadScore: contactData.leadScore,
          urgencyLevel: contactData.urgencyLevel
        });
        console.log('Updated existing contact');
      } else {
        // CREATE NEW CONTACT - THIS IS THE CRITICAL PART
        const newContactRef = await admin.firestore().collection('contacts').add(contactData);
        console.log('Created new contact:', newContactRef.id);
      }
      
      // Mark call as processed
      await snap.ref.update({
        processed: true,
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
        leadScore: leadScore,
        category: 'lead',
        urgencyLevel: urgencyLevel,
        callerName: callerName
      });
      
      console.log('Successfully processed call and created/updated contact');
      return { success: true };
      
    } catch (error) {
      console.error('Error processing call:', error);
      
      // Mark as failed
      await snap.ref.update({
        processed: false,
        processingError: error.message,
        processingAttemptedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      return null;
    }
  });
