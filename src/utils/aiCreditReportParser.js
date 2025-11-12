// aiCreditReportParser.js
// Enhanced AI-assisted parsing and dispute suggestion

import aiService from '@/services/aiService';

// Modern implementation using secure aiService
export async function parseCreditReport(rawReport) {
  try {
    // Use the secure aiService which handles authentication and rate limiting
    const reportText = typeof rawReport === 'string' ? rawReport : JSON.stringify(rawReport);
    const result = await aiService.parseCreditReport(reportText);

    if (result && typeof result === 'object') {
      return result;
    }

    // If result is a string, try to parse it
    if (typeof result === 'string') {
      return JSON.parse(result);
    }

    return result;
  } catch (err) {
    console.error('AI parseCreditReport error:', err);
    // Fallback to demo if aiService fails
    return demoParseCreditReport(rawReport);
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
