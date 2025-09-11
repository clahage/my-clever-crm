// OpenAI Service Utility
// Usage: import { generateLetter, analyzeCredit, recommendDispute, suggestCommunication } from './openaiService';

import { getApiKey } from '../openaiConfig';
// import { callOpenAI } from '../openaiService';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export async function callOpenAI(messages, apiKey) {
  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages,
        temperature: 0.7,
      }),
    });
    if (!response.ok) throw new Error('OpenAI API error');
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI Error:', error);
    return null;
  }
}


export async function generateLetter(form, apiKey) {
  // Accepts form: { disputeType, clientName, bureau }
  if (!apiKey) return 'Demo mode: OpenAI API key not set.';
  const prompt = `Generate a professional dispute letter for ${form.disputeType} for client ${form.clientName} to ${form.bureau}. Include all required details and optimize for success.`;
  return await callOpenAI([{ role: 'user', content: prompt }], apiKey);
}


export async function analyzeCredit(clientDetails, disputes, apiKey) {
  if (!apiKey) return 'Demo mode: OpenAI API key not set.';
  const prompt = `Analyze the credit profile for ${clientDetails.name}. Suggest improvement strategies, dispute priorities, and predict progress based on current disputes: ${JSON.stringify(disputes)}.`;
  return await callOpenAI([{ role: 'user', content: prompt }], apiKey);
}

export async function recommendDispute(disputeDetails, apiKey) {
  if (!apiKey) return 'Demo mode: OpenAI API key not set.';
  const prompt = `Given this dispute: ${JSON.stringify(disputeDetails)}, recommend the best approach and score its likely effectiveness.`;
  return await callOpenAI([{ role: 'user', content: prompt }], apiKey);
}

export async function suggestCommunication(clientDetails, apiKey) {
  if (!apiKey) return 'Demo mode: OpenAI API key not set.';
  const prompt = `Suggest the best communication strategy for client ${clientDetails.name} based on their credit profile and dispute history. Also suggest optimal follow-up timing.`;
  return await callOpenAI([{ role: 'user', content: prompt }], apiKey);
}

// Automatic categorization, heat scoring, urgency, and next-move recommendations
export async function categorizeContact(contact) {
  try {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error('No OpenAI API key');
    const prompt = `Given the following contact details, categorize as one of: lead, client, vendor, affiliate. Also provide a heat score (1-10), urgency (Low/Medium/High), and suggest the next best move.\nContact: ${JSON.stringify(contact)}`;
    const result = await callOpenAI([
      { role: 'system', content: 'You are a CRM contact categorization and sales expert.' },
      { role: 'user', content: prompt }
    ], apiKey);
    // Expecting JSON: { category, heatScore, urgency, nextMove }
    return JSON.parse(result);
  } catch (err) {
    console.error('Categorization error', err);
    return { category: 'lead', heatScore: 5, urgency: 'Medium', nextMove: 'Follow up within 3 days.' };
  }
}

export async function trackOpenAIUsage(action, cost = 0, status = 'success') {
  // Optionally log to Firestore or analytics endpoint
  try {
    // Example: send to /api/ai-usage or log locally
    // await fetch('/api/ai-usage', { method: 'POST', body: JSON.stringify({ action, cost, status, timestamp: new Date().toISOString() }) });
    // For now, just log
    console.log('AI Usage:', { action, cost, status, timestamp: new Date().toISOString() });
  } catch (err) {
    console.error('Failed to track AI usage', err);
  }
}

export async function scoreLead(transcript) {
  try {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error('No OpenAI API key');
    const response = await fetch('/scoreLead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lead: { transcript } })
    });
    if (!response.ok) throw new Error('Failed to score lead');
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('scoreLead error', err);
    return { score: 50, raw: 'Demo fallback' };
  }
}
