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

  // Store call data in aiReceptionistCalls collection FIRST (with processed: false)
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
      processed: false,  // ADD THIS - marks call as unprocessed for QuickContactConverter
      openAICost,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Error saving call data', details: err.message });
  }

  // Note: We're NOT creating contacts automatically anymore
  // The QuickContactConverter will handle converting calls to contacts
  // This prevents duplicates and gives users control over contact creation

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
      console.log('Notification error (non-blocking):', err.message);
    }
  }

  return res.status(200).json({ 
    success: true, 
    leadScore: aiScore.leadScore, 
    openAICost, 
    scoringBreakdown: aiScore.scoringBreakdown,
    message: 'Call saved to aiReceptionistCalls for processing'
  });
};