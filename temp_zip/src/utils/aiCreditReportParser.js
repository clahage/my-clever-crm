// aiCreditReportParser.js
// Enhanced AI-assisted parsing and dispute suggestion

import { getApiKey } from '../openaiConfig';
import { callOpenAI } from '../openaiService';

// In production, replace this with a call to OpenAI, Azure OpenAI, or similar LLM API
export async function parseCreditReport(rawReport) {
  const apiKey = getApiKey();
  if (!apiKey) {
    // fallback to demo if no key
    return demoParseCreditReport(rawReport);
  }
  try {
    const prompt = `Parse the following credit report JSON and extract tradelines, flag negative items, suggest dispute reasons, and provide a summary and recommendations.\n\nReport:\n${typeof rawReport === 'string' ? rawReport : JSON.stringify(rawReport)}`;
    const result = await callOpenAI([
      { role: 'system', content: 'You are an expert credit report analyst.' },
      { role: 'user', content: prompt }
    ], apiKey);
    // Expecting result as JSON string
    return JSON.parse(result);
  } catch (err) {
    console.error('OpenAI parseCreditReport error:', err);
    return { summary: 'Failed to parse report with OpenAI.' };
  }
}

// Demo fallback for local/dev
async function demoParseCreditReport(rawReport) {
  // Simulate advanced parsing: extract more fields, flag more dispute types, and suggest letter templates
  // In real use, send rawReport to an LLM with a detailed prompt
  return {
    tradelines: [
      {
        account: 'ABC Bank',
        type: 'Credit Card',
        status: 'Negative',
        balance: 1200,
        opened: '2021-03-15',
        lastReported: '2025-07-01',
        remarks: '30 days late',
        suggestedDispute: 'Late Payment',
        letterTemplate: 'Late Payment Challenge',
        aiNotes: 'Pattern of late payments detected. Recommend challenging most recent late mark.'
      },
      {
        account: 'XYZ Loan',
        type: 'Auto Loan',
        status: 'Negative',
        balance: 8000,
        opened: '2019-11-10',
        lastReported: '2025-06-15',
        remarks: 'Charged off',
        suggestedDispute: 'Charge-Off',
        letterTemplate: 'Charge-Off Challenge',
        aiNotes: 'Account charged off. Recommend requesting validation and removal.'
      },
      {
        account: 'QRS Credit',
        type: 'Credit Card',
        status: 'Positive',
        balance: 0,
        opened: '2022-01-01',
        lastReported: '2025-07-01',
        remarks: 'Paid as agreed',
        aiNotes: 'No dispute needed.'
      }
    ],
    summary: '3 tradelines found, 2 negative. 2 disputes recommended.',
    recommendations: [
      'Challenge late payment on ABC Bank using Late Payment Challenge letter.',
      'Dispute charge-off on XYZ Loan with Charge-Off Challenge letter.'
    ],
    aiSummary: 'AI detected 2 negative tradelines. Suggested dispute categories and letter templates for each. No action needed for positive tradelines.'
  };
}
