// OpenAI Service Utility
// Usage: import { generateLetter, analyzeCredit, recommendDispute, suggestCommunication } from './openaiService';

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
