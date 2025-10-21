// src/services/aiCreditReportParser.js
// Enhanced AI-Assisted Credit Report Parsing
// Supports: IDIQ, PDF uploads, manual entry, and other providers

import aiService from '@/services/aiService';

// Proxy to keep existing openai.chat.completions.create(...) calls working
const openai = {
  chat: {
    completions: {
      create: async (opts) => {
        // For parsing flows prefer aiService.parseCreditReport if available
        if (aiService.parseCreditReport) {
          const res = await aiService.parseCreditReport(opts);
          return { choices: [{ message: { content: res.response || res || '' } }] };
        }
        const res = await aiService.complete(opts);
        return { choices: [{ message: { content: res.response || res || '' } }] };
      }
    }
  }
};

// ============================================================================
// MAIN PARSING FUNCTION
// ============================================================================

/**
 * Parse credit report from any format
 * Uses AI to intelligently extract data
 * 
 * @param {object|string} rawReport - Raw report data (JSON, text, or structured)
 * @param {string} provider - Optional provider hint ('IDIQ', 'PDF', etc.)
 * @returns {object} Parsed and normalized report data
 */
export async function parseCreditReport(rawReport, provider = null) {
  console.log('📄 Parsing credit report...', provider || 'auto-detect');

  try {
    // Determine report format
    const format = detectFormat(rawReport);
    console.log('Detected format:', format);

    let parsedData;

    // Route to appropriate parser
    switch (format) {
      case 'idiq-json':
        parsedData = await parseIDIQReport(rawReport);
        break;

      case 'json':
        parsedData = await parseGenericJSON(rawReport);
        break;

      case 'text':
      case 'pdf':
        parsedData = await parseTextReport(rawReport);
        break;

      case 'structured':
        parsedData = normalizeStructuredData(rawReport);
        break;

      default:
        throw new Error(`Unsupported format: ${format}`);
    }

    // Validate and normalize
    const normalized = normalizeData(parsedData);

    console.log('✅ Report parsed successfully');
    return normalized;

  } catch (error) {
    console.error('❌ Error parsing credit report:', error);
    
    // Return fallback structure if parsing fails
    return getFallbackStructure();
  }
}

// ============================================================================
// FORMAT DETECTION
// ============================================================================

/**
 * Detect the format of the credit report
 */
function detectFormat(rawReport) {
  // Already an object with known structure
  if (typeof rawReport === 'object' && rawReport !== null) {
    // Check if it's IDIQ format
    if (rawReport.creditScore || rawReport.vantageScore || rawReport.tradelines) {
      return 'idiq-json';
    }
    
    // Check if it's already structured
    if (rawReport.scores && rawReport.tradelines) {
      return 'structured';
    }

    // Generic JSON
    return 'json';
  }

  // String - could be text or PDF content
  if (typeof rawReport === 'string') {
    // Check if it looks like JSON
    if (rawReport.trim().startsWith('{') || rawReport.trim().startsWith('[')) {
      try {
        JSON.parse(rawReport);
        return 'json';
      } catch (e) {
        // Not valid JSON, treat as text
      }
    }

    // Check if it's PDF content (base64 or text)
    if (rawReport.includes('PDF') || rawReport.length > 10000) {
      return 'pdf';
    }

    return 'text';
  }

  return 'unknown';
}

// ============================================================================
// IDIQ REPORT PARSER
// ============================================================================

/**
 * Parse IDIQ-specific report format
 */
async function parseIDIQReport(report) {
  console.log('🔵 Parsing IDIQ report format');

  try {
    return {
      // Scores
      scores: {
        vantage: report.vantageScore || report.creditScore || null,
        fico8: report.fico8Score || null,
        experian: report.experianScore || null,
        equifax: report.equifaxScore || null,
        transunion: report.transunionScore || null
      },

      // Tradelines (accounts)
      tradelines: (report.tradelines || report.accounts || []).map(account => ({
        accountId: account.accountNumber || account.id,
        accountName: account.creditorName || account.accountName,
        accountType: account.accountType || 'Unknown',
        status: account.paymentStatus || account.status,
        balance: parseFloat(account.currentBalance || account.balance || 0),
        creditLimit: parseFloat(account.creditLimit || account.highCredit || 0),
        openedDate: account.dateOpened || account.openDate,
        closedDate: account.dateClosed || null,
        lastReported: account.dateReported || account.lastReportedDate,
        paymentHistory: account.paymentHistory || [],
        remarks: account.remarks || account.comments || ''
      })),

      // Negative items
      negatives: extractNegativeItems(report),

      // Positive items
      positives: extractPositiveItems(report),

      // Hard inquiries
      hardInquiries: (report.inquiries || report.hardInquiries || []).map(inq => ({
        creditor: inq.creditorName || inq.name,
        date: inq.inquiryDate || inq.date,
        type: 'hard'
      })),

      // Public records
      publicRecords: (report.publicRecords || []).map(record => ({
        type: record.type,
        status: record.status,
        filingDate: record.filingDate,
        amount: parseFloat(record.amount || 0),
        court: record.court || '',
        caseNumber: record.caseNumber || ''
      })),

      // Collections
      collections: extractCollections(report),

      // Late payments
      latePayments: extractLatePayments(report),

      // Calculated metrics
      utilization: calculateUtilization(report.tradelines || report.accounts || []),
      ageOfCredit: calculateAgeOfCredit(report.tradelines || report.accounts || []),
      totalAccounts: (report.tradelines || report.accounts || []).length,
      openAccounts: (report.tradelines || report.accounts || []).filter(a => !a.dateClosed).length,
      totalBalances: calculateTotalBalances(report.tradelines || report.accounts || []),

      // Report metadata
      reportDate: report.reportDate || report.pulledDate || new Date().toISOString(),
      bureaus: report.bureaus || ['Experian', 'Equifax', 'TransUnion']
    };

  } catch (error) {
    console.error('❌ IDIQ parsing error:', error);
    throw error;
  }
}

// ============================================================================
// GENERIC JSON PARSER
// ============================================================================

/**
 * Parse generic JSON credit report
 */
async function parseGenericJSON(report) {
  console.log('📋 Parsing generic JSON format');

  // Try to intelligently map fields
  const reportObj = typeof report === 'string' ? JSON.parse(report) : report;

  // Use AI to help parse unknown JSON structure
  return await aiAssistedParse(reportObj);
}

// ============================================================================
// TEXT/PDF PARSER
// ============================================================================

/**
 * Parse text or PDF credit report using AI
 */
async function parseTextReport(textContent) {
  console.log('📝 Parsing text/PDF format with AI');

  try {
    const prompt = `Parse this credit report and extract all information into JSON format.

CREDIT REPORT TEXT:
${textContent.substring(0, 8000)} // Limit to avoid token limits

Extract and return ONLY valid JSON with this structure:
{
  "scores": {
    "vantage": number or null,
    "fico8": number or null,
    "experian": number or null,
    "equifax": number or null,
    "transunion": number or null
  },
  "tradelines": [
    {
      "accountName": "string",
      "accountType": "string",
      "status": "string",
      "balance": number,
      "creditLimit": number,
      "openedDate": "YYYY-MM-DD",
      "paymentStatus": "string"
    }
  ],
  "negativeItems": [
    {
      "type": "string",
      "account": "string",
      "date": "YYYY-MM-DD",
      "status": "string"
    }
  ],
  "inquiries": [
    {
      "creditor": "string",
      "date": "YYYY-MM-DD"
    }
  ],
  "publicRecords": [],
  "collections": [],
  "utilization": number (0-100),
  "totalAccounts": number
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a credit report parser. Extract ALL information accurately. Return ONLY valid JSON, no explanatory text.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1, // Low temperature for accuracy
      max_tokens: 3000
    });

    const parsed = JSON.parse(response.choices[0].message.content);

    // Convert to our standard format
    return {
      scores: parsed.scores || {},
      tradelines: parsed.tradelines || [],
      negatives: parsed.negativeItems || [],
      positives: [], // Will be derived
      hardInquiries: parsed.inquiries || [],
      publicRecords: parsed.publicRecords || [],
      collections: parsed.collections || [],
      latePayments: [], // Will be derived
      utilization: parsed.utilization || 50,
      ageOfCredit: calculateAgeOfCredit(parsed.tradelines || []),
      totalAccounts: parsed.totalAccounts || (parsed.tradelines || []).length,
      openAccounts: (parsed.tradelines || []).filter(t => t.status !== 'closed').length,
      totalBalances: calculateTotalBalances(parsed.tradelines || []),
      reportDate: new Date().toISOString(),
      bureaus: ['Unknown']
    };

  } catch (error) {
    console.error('❌ AI text parsing error:', error);
    
    // Fallback to basic text extraction
    return basicTextExtraction(textContent);
  }
}

// ============================================================================
// AI-ASSISTED PARSING
// ============================================================================

/**
 * Use AI to parse unknown JSON structures
 */
async function aiAssistedParse(reportObj) {
  console.log('🤖 Using AI to parse unknown structure');

  try {
    const reportString = JSON.stringify(reportObj, null, 2).substring(0, 6000);

    const prompt = `Convert this credit report JSON to our standard format.

INPUT JSON:
${reportString}

Return ONLY valid JSON with this exact structure (no additional text):
{
  "scores": {"vantage": number, "fico8": number, "experian": number, "equifax": number, "transunion": number},
  "tradelines": [{"accountName": "", "accountType": "", "status": "", "balance": 0, "creditLimit": 0, "openedDate": ""}],
  "negatives": [{"type": "", "account": "", "status": ""}],
  "hardInquiries": [{"creditor": "", "date": ""}],
  "publicRecords": [],
  "collections": [],
  "utilization": 0,
  "totalAccounts": 0
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a data transformer. Convert credit report data to the specified format. Return ONLY valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 2500
    });

    return JSON.parse(response.choices[0].message.content);

  } catch (error) {
    console.error('❌ AI-assisted parse error:', error);
    return getFallbackStructure();
  }
}

// ============================================================================
// DATA EXTRACTION HELPERS
// ============================================================================

/**
 * Extract negative items from report
 */
function extractNegativeItems(report) {
  const negatives = [];

  // From tradelines
  (report.tradelines || report.accounts || []).forEach(account => {
    if (account.paymentStatus && 
        (account.paymentStatus.toLowerCase().includes('late') ||
         account.paymentStatus.toLowerCase().includes('delinquent') ||
         account.paymentStatus.toLowerCase().includes('charge') ||
         account.paymentStatus.toLowerCase().includes('collection'))) {
      
      negatives.push({
        type: determineNegativeType(account.paymentStatus),
        account: account.creditorName || account.accountName,
        amount: account.currentBalance || account.balance,
        status: account.paymentStatus,
        date: account.dateReported || account.lastReportedDate,
        age: calculateAge(account.dateReported || account.dateOpened)
      });
    }
  });

  // From collections
  (report.collections || []).forEach(collection => {
    negatives.push({
      type: 'collection',
      account: collection.creditorName || collection.originalCreditor,
      amount: collection.balance,
      status: collection.status,
      date: collection.dateReported,
      age: calculateAge(collection.dateReported)
    });
  });

  // From public records
  (report.publicRecords || []).forEach(record => {
    negatives.push({
      type: record.type || 'public_record',
      account: record.court || 'Public Record',
      amount: record.amount,
      status: record.status,
      date: record.filingDate,
      age: calculateAge(record.filingDate)
    });
  });

  return negatives;
}

/**
 * Extract positive items from report
 */
function extractPositiveItems(report) {
  const positives = [];

  (report.tradelines || report.accounts || []).forEach(account => {
    if (account.paymentStatus && 
        (account.paymentStatus.toLowerCase().includes('current') ||
         account.paymentStatus.toLowerCase().includes('paid') ||
         account.paymentStatus.toLowerCase().includes('good'))) {
      
      positives.push({
        type: 'positive_account',
        account: account.creditorName || account.accountName,
        accountType: account.accountType,
        status: account.paymentStatus,
        openedDate: account.dateOpened,
        age: calculateAge(account.dateOpened)
      });
    }
  });

  return positives;
}

/**
 * Extract collections
 */
function extractCollections(report) {
  return (report.collections || []).map(collection => ({
    creditor: collection.creditorName || collection.originalCreditor,
    balance: parseFloat(collection.balance || 0),
    status: collection.status,
    dateReported: collection.dateReported,
    originalAmount: parseFloat(collection.originalAmount || 0),
    validationReceived: collection.validationReceived || false
  }));
}

/**
 * Extract late payments
 */
function extractLatePayments(report) {
  const latePayments = [];

  (report.tradelines || report.accounts || []).forEach(account => {
    if (account.paymentHistory) {
      account.paymentHistory.forEach(payment => {
        if (payment.status && payment.status.includes('late')) {
          latePayments.push({
            account: account.creditorName || account.accountName,
            date: payment.date,
            daysLate: payment.daysLate || 30,
            status: payment.status
          });
        }
      });
    }
  });

  return latePayments;
}

// ============================================================================
// CALCULATION HELPERS
// ============================================================================

/**
 * Calculate credit utilization
 */
function calculateUtilization(accounts) {
  let totalBalances = 0;
  let totalLimits = 0;

  accounts.forEach(account => {
    if (account.accountType && 
        (account.accountType.toLowerCase().includes('credit') ||
         account.accountType.toLowerCase().includes('card'))) {
      
      totalBalances += parseFloat(account.currentBalance || account.balance || 0);
      totalLimits += parseFloat(account.creditLimit || account.highCredit || 0);
    }
  });

  if (totalLimits === 0) return 0;

  return Math.round((totalBalances / totalLimits) * 100);
}

/**
 * Calculate age of credit in years
 */
function calculateAgeOfCredit(accounts) {
  if (accounts.length === 0) return 0;

  const dates = accounts
    .map(a => a.dateOpened || a.openDate)
    .filter(d => d)
    .map(d => new Date(d));

  if (dates.length === 0) return 0;

  const oldest = new Date(Math.min(...dates));
  const now = new Date();
  const ageInYears = (now - oldest) / (1000 * 60 * 60 * 24 * 365);

  return Math.round(ageInYears * 10) / 10; // Round to 1 decimal
}

/**
 * Calculate total balances
 */
function calculateTotalBalances(accounts) {
  return accounts.reduce((sum, account) => {
    return sum + parseFloat(account.currentBalance || account.balance || 0);
  }, 0);
}

/**
 * Calculate age of an item in years
 */
function calculateAge(date) {
  if (!date) return 0;
  
  const itemDate = new Date(date);
  const now = new Date();
  const ageInYears = (now - itemDate) / (1000 * 60 * 60 * 24 * 365);
  
  return Math.round(ageInYears * 10) / 10;
}

/**
 * Determine type of negative item
 */
function determineNegativeType(status) {
  const statusLower = status.toLowerCase();
  
  if (statusLower.includes('charge off')) return 'chargeoff';
  if (statusLower.includes('collection')) return 'collection';
  if (statusLower.includes('late')) return 'latePayment';
  if (statusLower.includes('delinquent')) return 'delinquent';
  if (statusLower.includes('foreclosure')) return 'foreclosure';
  if (statusLower.includes('repossession')) return 'repossession';
  
  return 'negative';
}

// ============================================================================
// NORMALIZATION
// ============================================================================

/**
 * Normalize structured data to standard format
 */
function normalizeStructuredData(data) {
  return {
    scores: data.scores || {},
    tradelines: data.tradelines || [],
    negatives: data.negatives || data.negativeItems || [],
    positives: data.positives || data.positiveItems || [],
    hardInquiries: data.hardInquiries || data.inquiries || [],
    publicRecords: data.publicRecords || [],
    collections: data.collections || [],
    latePayments: data.latePayments || [],
    utilization: data.utilization || 50,
    ageOfCredit: data.ageOfCredit || 0,
    totalAccounts: data.totalAccounts || 0,
    openAccounts: data.openAccounts || 0,
    totalBalances: data.totalBalances || 0,
    reportDate: data.reportDate || new Date().toISOString(),
    bureaus: data.bureaus || []
  };
}

/**
 * Final normalization pass
 */
function normalizeData(parsedData) {
  // Ensure all required fields exist
  return {
    scores: parsedData.scores || {},
    tradelines: parsedData.tradelines || [],
    negatives: parsedData.negatives || [],
    positives: parsedData.positives || [],
    hardInquiries: parsedData.hardInquiries || [],
    publicRecords: parsedData.publicRecords || [],
    collections: parsedData.collections || [],
    latePayments: parsedData.latePayments || [],
    utilization: parsedData.utilization || 0,
    ageOfCredit: parsedData.ageOfCredit || 0,
    totalAccounts: parsedData.totalAccounts || 0,
    openAccounts: parsedData.openAccounts || 0,
    totalBalances: parsedData.totalBalances || 0,
    reportDate: parsedData.reportDate || new Date().toISOString(),
    bureaus: parsedData.bureaus || []
  };
}

// ============================================================================
// FALLBACK EXTRACTION
// ============================================================================

/**
 * Basic text extraction (no AI)
 */
function basicTextExtraction(text) {
  console.log('⚠️ Using basic text extraction (fallback)');

  const scores = {};
  
  // Try to extract scores using regex
  const scorePatterns = [
    /vantage.*?(\d{3})/i,
    /fico.*?(\d{3})/i,
    /credit score.*?(\d{3})/i,
    /experian.*?(\d{3})/i,
    /equifax.*?(\d{3})/i,
    /transunion.*?(\d{3})/i
  ];

  scorePatterns.forEach(pattern => {
    const match = text.match(pattern);
    if (match) {
      const score = parseInt(match[1]);
      if (score >= 300 && score <= 850) {
        if (pattern.source.includes('vantage')) scores.vantage = score;
        else if (pattern.source.includes('fico')) scores.fico8 = score;
        else if (pattern.source.includes('experian')) scores.experian = score;
        else if (pattern.source.includes('equifax')) scores.equifax = score;
        else if (pattern.source.includes('transunion')) scores.transunion = score;
      }
    }
  });

  return {
    scores,
    tradelines: [],
    negatives: [],
    positives: [],
    hardInquiries: [],
    publicRecords: [],
    collections: [],
    latePayments: [],
    utilization: 50,
    ageOfCredit: 0,
    totalAccounts: 0,
    openAccounts: 0,
    totalBalances: 0,
    reportDate: new Date().toISOString(),
    bureaus: [],
    note: 'Extracted using basic parsing. Manual verification recommended.'
  };
}

/**
 * Get fallback structure when all parsing fails
 */
function getFallbackStructure() {
  return {
    scores: {},
    tradelines: [],
    negatives: [],
    positives: [],
    hardInquiries: [],
    publicRecords: [],
    collections: [],
    latePayments: [],
    utilization: 0,
    ageOfCredit: 0,
    totalAccounts: 0,
    openAccounts: 0,
    totalBalances: 0,
    reportDate: new Date().toISOString(),
    bureaus: [],
    error: 'Failed to parse report. Please enter data manually.'
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  parseCreditReport
};