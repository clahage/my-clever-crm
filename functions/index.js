const { onRequest, onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret, defineString } = require("firebase-functions/params");
const IDIQ_PARTNER_SECRET = defineSecret("IDIQ_PARTNER_SECRET");
const IDIQ_PARTNER_ID = defineString("IDIQ_PARTNER_ID");
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const fetch = require('node-fetch');
const { OpenAI } = require('openai');

admin.initializeApp();

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

// Get IDIQ Partner Token (onRequest, with CORS header)
const IDIQ_ENV = process.env.IDIQ_ENV || "stage"; // "stage" | "prod"
const IDIQ_PARTNER_TOKEN_PATH = process.env.IDIQ_PARTNER_TOKEN_PATH;

exports.getIDIQPartnerToken = onRequest({ secrets: [IDIQ_PARTNER_SECRET] }, async (req, res) => {
  setCors(req, res);
  if (req.method === "OPTIONS") {
    // Preflight
    return res.status(204).send(""); // 204 No Content is ideal for preflight
  }
  try {
    const partnerId = IDIQ_PARTNER_ID.value();
    const partnerSecret = IDIQ_PARTNER_SECRET.value();
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
exports.getIDIQPartnerTokenCallable = onCall({ secrets: [IDIQ_PARTNER_SECRET] }, async (req) => {
  const partnerId = IDIQ_PARTNER_ID.value();
  const partnerSecret = IDIQ_PARTNER_SECRET.value();
  if (!partnerId || !partnerSecret) throw new HttpsError("failed-precondition", "Missing IDIQ credentials");
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
      throw new HttpsError("internal", result.message || 'Unknown error');
    }
  } catch (error) {
    console.error('IDIQ partner token error:', error);
    throw new HttpsError("internal", error.message);
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
exports.testFunction = functions.https.onRequest((req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
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
