// functions/webhooks/callProcessor.js
const admin = require('firebase-admin');
const db = admin.firestore();

/**
 * Process AI Receptionist Call Asynchronously
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

      await db.collection('aiReceptionistCalls').doc(callId).update({
        processed: true,
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
        result: 'blocked-spam'
      });

      return;
    }

    // 2. Classify lead
    const leadData = await classifyLead(callData);
    
    console.log('📊 Lead classified:', {
      name: `${leadData.firstName} ${leadData.lastName}`,
      score: leadData.leadScore,
      temperature: leadData.temperature
    });

    // 3. Check for duplicate
    let contactRef = null;
    
    if (leadData.phone) {
      const existingContact = await db.collection('contacts')
        .where('phone', '==', leadData.phone)
        .limit(1)
        .get();

      if (!existingContact.empty) {
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
        console.log('🔄 Updated existing contact:', contactRef.id);
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

    // 5. Notify for hot/erupting leads
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

    // 6. Mark as processed
    await db.collection('aiReceptionistCalls').doc(callId).update({
      processed: true,
      processedAt: admin.firestore.FieldValue.serverTimestamp(),
      contactId: contactRef.id,
      result: 'success'
    });

    console.log('✅ Call processing complete:', callId);

  } catch (error) {
    console.error('❌ Error processing call:', error);
    
    await db.collection('aiReceptionistCalls').doc(callId).update({
      processed: true,
      processedAt: admin.firestore.FieldValue.serverTimestamp(),
      result: 'error',
      error: error.message
    });
  }
}

module.exports = { processAICallAsync };