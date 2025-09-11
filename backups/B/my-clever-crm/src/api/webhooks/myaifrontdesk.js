// Webhook receiver for MyAIFrontDesk
// Receives POST requests with AI receptionist call data
// Uses Firebase config from src/firebaseConfig.js

const { db } = require('../../firebaseConfig');
const { collection, addDoc, updateDoc, getDocs, query, where, doc } = require('firebase/firestore');
const { aiLeadScoring } = require('../../services/aiLeadScoring.js');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const data = req.body;
  // Validate incoming data
  const requiredFields = [
    'username', 'timestamp', 'caller', 'transcript', 'sentiment', 'duration', 'satisfaction', 'summary', 'texts_sent'
  ];
  for (const field of requiredFields) {
    if (!(field in data)) {
      return res.status(400).json({ error: `Missing field: ${field}` });
    }
  }

  // Parse caller phone number
  const phone = data.caller.replace(/[^\d+]/g, '');

  // Call AI lead scoring service
  let aiScore, openAICost = 0;
  try {
    aiScore = await aiLeadScoring(data);
    openAICost = aiScore?.cost || 0;
  } catch (err) {
    aiScore = {
      leadScore: 1,
      painPoints: [],
      urgencyLevel: 'medium',
      conversionProbability: 10,
      aiCategory: 'standard_lead',
      scoringBreakdown: {},
      fallback: true,
      cost: 0
    };
  }

  // Find existing contact by phone
  let contactId = null;
  let contactDoc = null;
  try {
    const contactsRef = collection(db, 'contacts');
    const q = query(contactsRef, where('phone', '==', phone));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      contactDoc = snapshot.docs[0];
      contactId = contactDoc.id;
    }
  } catch (err) {
    return res.status(500).json({ error: 'Error searching contacts', details: err.message });
  }

  // Prepare contact data (all enhanced fields + AI scoring)
  const contactData = {
    firstName: data.username || '',
    phone,
    source: 'AI Receptionist',
    category: 'Lead',
    urgencyLevel: aiScore.urgencyLevel || 'Medium',
    timeline: 'ASAP',
    responseStatus: 'Pending',
    notes: data.summary || '',
    conversationNotes: data.transcript || '',
    leadScore: aiScore.leadScore,
    painPoints: aiScore.painPoints,
    conversionProbability: aiScore.conversionProbability,
    aiCategory: aiScore.urgencyLevel === 'high' ? 'hot_lead' : 'standard_lead',
    platformResponseTime: '',
    budgetMentioned: '',
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    email: '',
    prefix: '',
    middleName: '',
    lastName: '',
    suffix: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Create or update contact
  try {
    if (contactId) {
      await updateDoc(doc(db, 'contacts', contactId), {
        ...contactData,
        updatedAt: new Date().toISOString(),
      });
    } else {
      await addDoc(collection(db, 'contacts'), contactData);
    }
  } catch (err) {
    return res.status(500).json({ error: 'Error saving contact', details: err.message });
  }

  // Store call data in aiReceptionistCalls collection (include scoring breakdown)
  try {
    await addDoc(collection(db, 'aiReceptionistCalls'), {
      ...data,
      phone,
      leadScore: aiScore.leadScore,
      painPoints: aiScore.painPoints,
      urgencyLevel: aiScore.urgencyLevel,
      conversionProbability: aiScore.conversionProbability,
      aiCategory: aiScore.urgencyLevel === 'high' ? 'hot_lead' : 'standard_lead',
      scoringBreakdown: aiScore.scoringBreakdown,
      processedAt: new Date().toISOString(),
      openAICost,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Error saving call data', details: err.message });
  }

  // Real-time dashboard notification for high-scoring leads
  if (aiScore.leadScore >= 8) {
    try {
      await addDoc(collection(db, 'notifications'), {
        type: 'hot_lead',
        message: `Hot lead: ${data.username} (${phone}) scored ${aiScore.leadScore}/10`,
        timestamp: new Date().toISOString(),
        details: {
          leadScore: aiScore.leadScore,
          painPoints: aiScore.painPoints,
          urgencyLevel: aiScore.urgencyLevel,
          conversionProbability: aiScore.conversionProbability
        }
      });
    } catch (err) {
      // Notification error, do not block
    }
  }

  return res.status(200).json({ success: true, leadScore: aiScore.leadScore, openAICost, scoringBreakdown: aiScore.scoringBreakdown });
};
