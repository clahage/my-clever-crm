// GEN1 Cloud Function — secure OpenAI proxy (name: ask)
const functions = require("firebase-functions");
const admin = require('firebase-admin');
const OpenAI = require("openai");
try { admin.initializeApp(); } catch (e) {}

// MyAIReceptionist Webhook Handler — receives leads and writes to Firestore
exports.receiveLead = functions.https.onRequest(async (req, res) => {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).send('');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' });

  try {
    const lead = req.body;
    // Basic validation (customize as needed)
    if (!lead.name || !lead.email) {
      return res.status(400).json({ error: 'Missing required lead fields (name, email)' });
    }
    // Write to Firestore 'leads' collection
    const ref = await admin.firestore().collection('leads').add({
      ...lead,
      receivedAt: new Date().toISOString(),
      source: lead.source || 'MyAIReceptionist',
      status: lead.status || 'New',
      score: lead.score || 50
    });
    return res.status(200).json({ success: true, id: ref.id });
  } catch (err) {
    console.error('Webhook error', err);
    return res.status(500).json({ error: 'Failed to process lead', detail: err.message || String(err) });
  }
});

// CORS allow-list
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://myclevercrm.com",
];

function setCors(req, res) {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.set("Access-Control-Allow-Origin", origin);
  }
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

exports.ask = functions.https.onRequest(async (req, res) => {
    setCors(req, res);

    if (req.method === "OPTIONS") return res.status(204).send("");
    if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });

    try {
      const {
        messages,
        model = "gpt-4.1-mini",
        temperature = 0.4,
        max_tokens = 500,
      } = req.body || {};

      if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: "Body must include { messages: [...] }" });
      }

      // Read OpenAI key from Firebase Functions config (you set openai.key earlier)
      const apiKey = functions.config().openai?.key;
      if (!apiKey) {
        return res.status(500).json({ error: "Missing OpenAI key in functions config (openai.key)" });
      }

      const client = new OpenAI({ apiKey });
      const completion = await client.chat.completions.create({
        model,
        messages,
        temperature,
        max_tokens,
      });

      const text = completion.choices?.[0]?.message?.content ?? "";
      return res.status(200).json({ text, raw: completion });
    } catch (err) {
      console.error("OpenAI error", err);
      return res.status(500).json({ error: "OpenAI request failed", detail: err.message || String(err) });
    }
  });
exports.ping = functions.https.onRequest((req, res) => { res.status(200).json({ ok: true, at: new Date().toISOString() }); });
