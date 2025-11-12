const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

exports.myaifrontdesk = functions.https.onRequest(async (req, res) => {
  console.log('Webhook received:', req.body);
  
  try {
    const { caller, transcript, name, email, sentiment } = req.body;
    
    const callData = {
      caller: caller || 'Unknown',
      name: name || 'Unknown', 
      email: email || '',
      transcript: transcript || '',
      sentiment: sentiment || {},
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      source: 'MyAIFrontDesk'
    };
    
    await db.collection('aiReceptionistCalls').add(callData);
    
    if (name || email) {
      await db.collection('contacts').add({
        name: name || 'Unknown',
        email: email || '',
        phone: caller || '',
        category: 'lead',
        urgency: 'High',
        source: 'AI Receptionist',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});