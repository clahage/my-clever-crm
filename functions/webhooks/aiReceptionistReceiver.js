const functions = require('firebase-functions');
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

/**
 * Secured webhook receiver with API Key authentication
 * FIXED: Added .runWith({ memory: '256MB' })
 */
exports.receiveAIReceptionistCall = functions.runWith({
  timeoutSeconds: 60,
  memory: '512MB'
}).https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type, X-Webhook-Secret');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    const providedSecret = req.headers['x-webhook-secret'] || req.query.secret;
    
    if (!providedSecret || providedSecret !== WEBHOOK_SECRET) {
      console.log('❌ Unauthorized access attempt');
      return res.status(403).json({ error: 'Forbidden', message: 'Invalid secret' });
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const callData = req.body;
    if (!callData || !callData.caller) {
      return res.status(400).json({ error: 'Invalid data', message: 'Missing caller' });
    }

    const callRef = await db.collection('aiReceptionistCalls').add({
      ...callData,
      receivedAt: admin.firestore.FieldValue.serverTimestamp(),
      processed: false,
      createdAt: new Date().toISOString()
    });

    console.log('✅ Call saved:', callRef.id);

    // Trigger async processing
    const { processAICallAsync } = require('./callProcessor');
    processAICallAsync(callRef.id, callData).catch(err => console.error(err));

    return res.status(200).json({ success: true, callId: callRef.id });

  } catch (error) {
    console.error('❌ Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Reprocess a call (Callable)
 * Added to fix missing export error in index.js
 */
exports.reprocessAIReceptionistCall = functions.runWith({
  timeoutSeconds: 60,
  memory: '512MB'
}).https.onCall(async (data, context) => {
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError('permission-denied', 'Admin only');
  }
  const { callId } = data;
  const doc = await db.collection('aiReceptionistCalls').doc(callId).get();
  if (!doc.exists) throw new functions.https.HttpsError('not-found', 'Call not found');
  
  const { processAICallAsync } = require('./callProcessor');
  await processAICallAsync(callId, doc.data());
  return { success: true, message: 'Reprocessing started' };
});