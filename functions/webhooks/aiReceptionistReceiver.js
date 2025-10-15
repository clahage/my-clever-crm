// functions/webhooks/aiReceptionistReceiver.js
// Direct webhook receiver - replaces Pipedream
// Receives AI Receptionist calls and processes them automatically

const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * HTTP Endpoint for AI Receptionist Webhook
 * 
 * SETUP INSTRUCTIONS:
 * 1. Deploy this function: firebase deploy --only functions:receiveAIReceptionistCall
 * 2. Get the function URL from Firebase Console
 * 3. Update AI Receptionist webhook to: https://YOUR-REGION-YOUR-PROJECT.cloudfunctions.net/receiveAIReceptionistCall
 * 4. Replace Pipedream webhook with this URL
 */
exports.receiveAIReceptionistCall = functions.https.onRequest(async (req, res) => {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    res.status(405).send({ error: 'Method not allowed' });
    return;
  }

  try {
    const callData = req.body;
    
    console.log('📞 Received AI Receptionist call:', {
      caller: callData.caller,
      timestamp: callData.timestamp,
      summary: callData.summary
    });

    // 1. Save to aiReceptionistCalls collection (existing behavior)
    const callRef = await db.collection('aiReceptionistCalls').add({
      ...callData,
      receivedAt: admin.firestore.FieldValue.serverTimestamp(),
      processed: false
    });

    console.log('✅ Saved to aiReceptionistCalls:', callRef.id);

    // 2. Process asynchronously (don't make webhook wait)
    // This runs in background after responding to webhook
    processAICallAsync(callRef.id, callData).catch(error => {
      console.error('❌ Background processing error:', error);
    });

    // 3. Respond immediately to webhook
    res.status(200).send({ 
      success: true, 
      callId: callRef.id,
      message: 'Call received and processing'
    });

  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(500).send({ 
      error: error.message,
      details: 'Failed to process AI Receptionist call'
    });
  }
});

/**
 * Process AI Receptionist Call Asynchronously
 * Runs in background after webhook responds
 */
async function processAICallAsync(callId, callData) {
  try {
    console.log('🔄 Processing call:', callId);

    // Import processing modules
    const { classifyLead, detectSpam } = require('../automation/leadProcessor');
    const { notifyLaurie } = require('../automation/notificationService');

    // 1. Check for spam/bot
    const isSpam = await detectSpam(callData);
    if (isSpam) {
      console.log('🚫 Spam detected, blocking:', callData.caller);
      
      await db.collection('blockedNumbers').add({
        phoneNumber: callData.caller,
        reason: 'Auto-detected spam',
        callData: callData,
        blockedAt: admin.firestore.FieldValue.serverTimestamp(),
        blockedBy: 'auto-system',
        reviewed: false
      });

      // Mark call as processed
      await db.collection('aiReceptionistCalls').doc(callId).update({
        processed: true,
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
        result: 'blocked-spam'
      });

      return;
    }

    // 2. Classify lead and extract info
    const leadData = await classifyLead(callData);
    
    console.log('📊 Lead classified:', {
      name: `${leadData.firstName} ${leadData.lastName}`,
      score: leadData.leadScore,
      temperature: leadData.temperature
    });

    // 3. Check for duplicate contact
    let contactRef = null;
    
    if (leadData.phone) {
      const existingContact = await db.collection('contacts')
        .where('phone', '==', leadData.phone)
        .limit(1)
        .get();

      if (!existingContact.empty) {
        // Update existing contact
        contactRef = existingContact.docs[0].ref;
        await contactRef.update({
          ...leadData,
          lastContactDate: admin.firestore.FieldValue.serverTimestamp(),
          callHistory: admin.firestore.FieldValue.arrayUnion({
            callId: callId,
            timestamp: callData.timestamp,
            summary: callData.summary,
            temperature: leadData.temperature
          }),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log('📝 Updated existing contact:', contactRef.id);
      }
    }

    // 4. Create new contact if not duplicate
    if (!contactRef) {
      contactRef = await db.collection('contacts').add({
        ...leadData,
        aiReceptionistCallId: callId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log('✨ Created new contact:', contactRef.id);
    }

    // 5. Create task if erupting or hot lead
    if (leadData.temperature === 'erupting' || leadData.temperature === 'hot') {
      await db.collection('tasks').add({
        type: 'follow-up-lead',
        priority: leadData.temperature === 'erupting' ? 'urgent' : 'high',
        assignedTo: 'laurie@speedycreditrepair.com',
        contactId: contactRef.id,
        title: `Call ${leadData.firstName} ${leadData.lastName}`,
        description: leadData.aiObservations,
        dueDate: admin.firestore.FieldValue.serverTimestamp(),
        status: 'pending',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log('📋 Created task for Laurie');
    }

    // 6. Notify Laurie for erupting/hot leads
    if (leadData.temperature === 'erupting' || leadData.temperature === 'hot') {
      await notifyLaurie({
        type: leadData.temperature,
        contact: {
          id: contactRef.id,
          ...leadData
        }
      });
      console.log('📧 Notified Laurie');
    }

    // 7. Mark call as processed
    await db.collection('aiReceptionistCalls').doc(callId).update({
      processed: true,
      processedAt: admin.firestore.FieldValue.serverTimestamp(),
      contactId: contactRef.id,
      result: 'success'
    });

    console.log('✅ Call processing complete:', callId);

  } catch (error) {
    console.error('❌ Error processing call:', error);
    
    // Log error but don't throw (already responded to webhook)
    await db.collection('aiReceptionistCalls').doc(callId).update({
      processed: true,
      processedAt: admin.firestore.FieldValue.serverTimestamp(),
      result: 'error',
      error: error.message
    });
  }
}

/**
 * Manual reprocessing function (for testing or fixing failed calls)
 * Usage: Call this from Firebase Console or create a UI button
 */
exports.reprocessAIReceptionistCall = functions.https.onCall(async (data, context) => {
  // Require authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  }

  const { callId } = data;

  try {
    // Get call data
    const callDoc = await db.collection('aiReceptionistCalls').doc(callId).get();
    
    if (!callDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Call not found');
    }

    const callData = callDoc.data();

    // Reprocess
    await processAICallAsync(callId, callData);

    return { success: true, message: 'Call reprocessed successfully' };

  } catch (error) {
    console.error('Reprocessing error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});