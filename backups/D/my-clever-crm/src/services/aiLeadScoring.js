// AI Lead Scoring Service for MyAIFrontDesk webhook
// Uses OpenAI API and stores usage in Firebase

import { db } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export async function aiLeadScoring(callData) {
  // Prepare prompt for OpenAI
  const prompt = `Analyze the following call data for lead scoring in a credit repair business.\n\nTranscript: ${callData.transcript}\n\nSentiment: ${JSON.stringify(callData.sentiment)}\nSatisfaction: ${callData.satisfaction}\nDuration: ${callData.duration} seconds\nCaller: ${callData.caller}\n\nReturn a JSON object with:\n- leadScore (1-10, weighted: conversation quality 25%, pain points 30%, urgency 25%, demographics 15%, engagement 5%)\n- painPoints (array of specific issues)\n- urgencyLevel (high/medium/low)\n- conversionProbability (1-100%)\n- scoringBreakdown (object with weights and values)\n`;

  let aiResult = null;
  let fallback = false;
  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2
      })
    });
    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';
    aiResult = JSON.parse(text);
  } catch (err) {
    // Fallback to basic scoring
    fallback = true;
    const transcript = callData.transcript || '';
    const keywords = ['credit', 'repair', 'score', 'report', 'late payment', 'collections', 'bankruptcy', 'dispute', 'enroll', 'signup', 'help'];
    let painPoints = [];
    for (const kw of keywords) {
      if (transcript.toLowerCase().includes(kw)) painPoints.push(kw);
    }
    const sentimentScore = (callData.sentiment?.positive || 0) - (callData.sentiment?.negative || 0);
    let urgencyLevel = 'medium';
    if (transcript.toLowerCase().includes('urgent') || callData.duration > 180) urgencyLevel = 'high';
    if (callData.duration < 60) urgencyLevel = 'low';
    const leadScore = Math.max(1, Math.min(10, Math.round(
      (callData.duration / 60) + (sentimentScore / 20) + painPoints.length
    )));
    aiResult = {
      leadScore,
      painPoints,
      urgencyLevel,
      conversionProbability: Math.min(100, leadScore * 10),
      scoringBreakdown: {
        conversationQuality: callData.satisfaction * 5,
        painPoints: painPoints.length * 3,
        urgency: urgencyLevel === 'high' ? 25 : urgencyLevel === 'medium' ? 15 : 5,
        demographics: 10,
        engagement: callData.texts_sent?.length ? 5 : 0
      },
      fallback: true
    };
  }

  // Store usage tracking in Firebase
  try {
    await addDoc(collection(db, 'aiUsageTracking'), {
      timestamp: new Date().toISOString(),
      caller: callData.caller,
      transcript: callData.transcript,
      aiResult,
      fallback,
      source: 'aiLeadScoring'
    });
  } catch (err) {
    // Log error but do not block response
  }

  return aiResult;
}
