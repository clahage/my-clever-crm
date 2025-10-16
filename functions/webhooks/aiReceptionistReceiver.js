const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// Get webhook secret from Firebase config (set via: firebase functions:config:set)
const WEBHOOK_SECRET = functions.config().webhook?.secret;

/**
 * Secured webhook receiver with API Key authentication
 * NO PUBLIC ACCESS NEEDED - Only requests with valid secret can access
 */
exports.receiveAIReceptionistCall = functions.https.onRequest(async (req, res) => {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type, X-Webhook-Secret');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    // ⭐ SECURITY CHECK: Validate API Key from header
    const providedSecret = req.headers['x-webhook-secret'] || req.query.secret;
    
    if (!providedSecret || providedSecret !== WEBHOOK_SECRET) {
      console.log('❌ Unauthorized access attempt - invalid or missing secret');
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'Invalid or missing webhook secret' 
      });
    }

    console.log('✅ Webhook secret validated');
    console.log('📞 Received AI Receptionist call');
    console.log('Method:', req.method);
    console.log('Body:', req.body);

    // Only accept POST requests
    if (req.method !== 'POST') {
      return res.status(405).json({ 
        error: 'Method not allowed',
        message: 'Only POST requests are accepted' 
      });
    }

    const callData = req.body;

    // Validate required fields
    if (!callData || !callData.caller) {
      return res.status(400).json({ 
        error: 'Invalid data',
        message: 'Missing required field: caller' 
      });
    }

    // Save to aiReceptionistCalls collection
    const callRef = await db.collection('aiReceptionistCalls').add({
      ...callData,
      receivedAt: admin.firestore.FieldValue.serverTimestamp(),
      processed: false,
      createdAt: new Date().toISOString()
    });

    console.log('✅ Call saved to Firestore:', callRef.id);

    // Import and trigger processing (async)
    const { processAICallAsync } = require('./callProcessor');
    processAICallAsync(callRef.id, callData).catch(err => {
      console.error('❌ Error in async processing:', err);
    });

    // Return success immediately
    return res.status(200).json({ 
      success: true,
      message: 'Call received and queued for processing',
      callId: callRef.id 
    });

  } catch (error) {
    console.error('❌ Error in receiveAIReceptionistCall:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});