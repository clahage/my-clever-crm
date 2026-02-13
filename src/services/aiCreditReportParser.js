// ============================================================================
// AI CREDIT REPORT PARSER - TIER 5+ ENTERPRISE EDITION
// ============================================================================
// Path: src/services/aiCreditReportParser.js
//
// Enhanced AI-Assisted Credit Report Parsing
// Supports: IDIQ JSON, PDF uploads, text parsing, manual entry
//
// FEATURES:
// ✅ Multi-format detection and parsing (IDIQ, PDF, JSON, text)
// ✅ Server-side AI via Firebase Cloud Functions (secure)
// ✅ Comprehensive error handling with fallbacks
// ✅ Smart normalization and validation
// ✅ Automatic negative/positive item extraction
// ✅ Credit metrics calculation (utilization, age, balances)
// ✅ Bureau score extraction and validation
// ✅ Production-ready with full logging
//
// © 1995-2026 Speedy Credit Repair Inc. | Christopher Lahage
// ============================================================================

import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

// ============================================================================
// MAIN PARSING FUNCTION
// ============================================================================

/**
 * Parse credit report from any format
 * Uses AI to intelligently extract and normalize data
 * 
 * @param {object|string} rawReport - Raw report data (JSON, text, or structured)
 * @param {string} provider - Optional provider hint ('IDIQ', 'PDF', 'text', etc.)
 * @returns {Promise<object>} Parsed and normalized report data
 */
export async function parseCreditReport(rawReport, provider = null) {
  console.log('📄 AI Credit Report Parser - Starting...', provider || 'auto-detect');

  try {
    // ===== STEP 1: DETECT FORMAT =====
    const format = detectFormat(rawReport);
    console.log('✅ Detected format:', format);

    let parsedData;

    // ===== STEP 2: ROUTE TO APPROPRIATE PARSER =====
    switch (format) {
      case 'idiq-json':
        console.log('🔍 Using IDIQ JSON parser...');
        parsedData = await parseIDIQReport(rawReport);
        break;

      case 'json':
        console.log('🔍 Using generic JSON parser...');
        parsedData = await parseGenericJSON(rawReport);
        break;

      case 'text':
      case 'pdf':
        console.log('🔍 Using AI text parser (server-side)...');
        parsedData = await parseTextReport(rawReport);
        break;

      case 'structured':
        console.log('🔍 Using structured data normalizer...');
        parsedData = normalizeStructuredData(rawReport);
        break;

      default:
        console.warn('⚠️ Unknown format, attempting AI-assisted parse...');
        parsedData = await aiAssistedParse(rawReport);
    }

    // ===== STEP 3: VALIDATE AND NORMALIZE =====
    const normalized = normalizeData(parsedData);

    // ===== STEP 4: EXTRACT ADDITIONAL METRICS =====
    normalized.metrics = {
      utilization: normalized.utilization || 0,
      ageOfCredit: normalized.ageOfCredit || 0,
      totalAccounts: normalized.totalAccounts || 0,
      openAccounts: normalized.openAccounts || 0,
      totalBalances: normalized.totalBalances || 0,
      derogatory: normalized.negatives?.length || 0,
      collections: normalized.collections?.length || 0,
      latePayments: normalized.latePayments?.length || 0,
      hardInquiries: normalized.hardInquiries?.length || 0,
    };

    console.log('✅ Report parsed successfully');
    console.log(`   - Scores: ${Object.keys(normalized.scores || {}).length} bureaus`);
    console.log(`   - Tradelines: ${normalized.tradelines?.length || 0}`);
    console.log(`   - Negative Items: ${normalized.negatives?.length || 0}`);
    console.log(`   - Collections: ${normalized.collections?.length || 0}`);

    return normalized;

  } catch (error) {
    console.error('❌ Error parsing credit report:', error);
    console.error('   Stack:', error.stack);
    
    // Return fallback structure if parsing fails
    return getFallbackStructure(error.message);
  }
}

// ============================================================================
// FORMAT DETECTION
// ============================================================================

/**
 * Intelligently detect the format of the credit report
 * @param {any} rawReport - Raw report in any format
 * @returns {string} Format identifier
 */
function detectFormat(rawReport) {
  // Null/undefined check
  if (!rawReport) {
    return 'unknown';
  }

  // Already an object with known structure
  if (typeof rawReport === 'object' && rawReport !== null) {
    // Check if it's IDIQ format (has specific IDIQ properties)
    if (rawReport.creditScore || rawReport.vantageScore || 
        rawReport.tradelines || rawReport.BundleComponents) {
      return 'idiq-json';
    }
    
    // Check if it's already structured (has our normalized format)
    if (rawReport.scores && rawReport.tradelines && rawReport.negatives) {
      return 'structured';
    }

    // Check if it has common credit report properties
    if (rawReport.accounts || rawReport.creditScores || rawReport.bureaus) {
      return 'json';
    }
  }

  // String content - check what kind
  if (typeof rawReport === 'string') {
    const trimmed = rawReport.trim();
    
    // Try to parse as JSON
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        return detectFormat(parsed); // Recursive call with parsed object
      } catch (e) {
        // Not valid JSON, treat as text
      }
    }

    // Check for common credit report text patterns
    if (trimmed.includes('credit score') || trimmed.includes('FICO') || 
        trimmed.includes('VantageScore') || trimmed.includes('Equifax') ||
        trimmed.includes('Experian') || trimmed.includes('TransUnion')) {
      return 'text';
    }

    // Check for PDF-extracted text patterns
    if (trimmed.includes('Page ') || trimmed.includes('Credit Report')) {
      return 'pdf';
    }

    return 'text'; // Default for any string
  }

  return 'unknown';
}

// ============================================================================
// IDIQ FORMAT PARSER
// ============================================================================

/**
 * Parse IDIQ-specific credit report format
 * Handles their nested structure and extractS all relevant data
 */
async function parseIDIQReport(report) {
  console.log('📊 Parsing IDIQ report structure...');

  const result = {
    scores: {},
    tradelines: [],
    negatives: [],
    positives: [],
    hardInquiries: [],
    publicRecords: [],
    collections: [],
    latePayments: [],
  };

  try {
    // ===== EXTRACT SCORES =====
    result.scores = {
      vantage: report.vantageScore || report.creditScore || null,
      transunion: report.transunionScore || null,
      experian: report.experianScore || null,
      equifax: report.equifaxScore || null,
    };

    // Check BundleComponents structure (IDIQ specific)
    if (report.BundleComponents?.BundleComponent) {
      const bc = report.BundleComponents.BundleComponent;
      
      // Extract CreditScoreType
      if (bc.CreditScoreType?.['@riskScore']) {
        result.scores.vantage = parseInt(bc.CreditScoreType['@riskScore'], 10);
      }

      // Extract TrueLink Credit Report
      const trueLink = bc.TrueLinkCreditReportType;
      if (trueLink?.Borrower?.CreditScore) {
        const scores = Array.isArray(trueLink.Borrower.CreditScore) 
          ? trueLink.Borrower.CreditScore 
          : [trueLink.Borrower.CreditScore];
        
        scores.forEach(s => {
          const score = parseInt(s?.['@riskScore'] || s?.riskScore, 10);
          if (score >= 300 && score <= 850) {
            result.scores.vantage = score;
          }
        });
      }
    }

    // ===== EXTRACT TRADELINES =====
    const accounts = report.tradelines || report.accounts || [];
    result.tradelines = accounts.map(account => ({
      id: account.id || `tradeline-${Date.now()}-${Math.random()}`,
      creditorName: account.creditorName || account.name || 'Unknown',
      accountNumber: account.accountNumber || account.number || null,
      accountType: account.accountType || account.type || 'Unknown',
      status: account.status || 'Unknown',
      balance: parseFloat(account.balance || 0),
      creditLimit: parseFloat(account.creditLimit || account.limit || 0),
      paymentStatus: account.paymentStatus || account.status || 'Current',
      dateOpened: account.dateOpened || account.opened || null,
      lastPayment: account.lastPayment || null,
    }));

    // ===== EXTRACT NEGATIVE ITEMS =====
    result.negatives = extractNegativeItems(report);
    result.collections = extractCollections(report);
    result.latePayments = extractLatePayments(report);
    result.publicRecords = report.publicRecords || [];
    result.hardInquiries = report.inquiries || report.hardInquiries || [];

    // ===== EXTRACT POSITIVE ITEMS =====
    result.positives = extractPositiveItems(report);

    // ===== CALCULATE METRICS =====
    result.utilization = calculateUtilization(result.tradelines);
    result.ageOfCredit = calculateAgeOfCredit(result.tradelines);
    const balances = calculateTotalBalances(result.tradelines);
    result.totalBalances = balances.total;
    result.totalAccounts = result.tradelines.length;
    result.openAccounts = result.tradelines.filter(t => 
      t.status?.toLowerCase().includes('open')
    ).length;

    result.reportDate = report.reportDate || new Date().toISOString();
    result.bureaus = ['Equifax', 'Experian', 'TransUnion'];

    console.log('✅ IDIQ report parsed successfully');
    return result;

  } catch (error) {
    console.error('❌ Error parsing IDIQ report:', error);
    throw error;
  }
}

// ============================================================================
// GENERIC JSON PARSER
// ============================================================================

/**
 * Parse generic JSON credit report formats
 * Uses AI assistance when needed
 */
async function parseGenericJSON(report) {
  console.log('📊 Parsing generic JSON report...');

  const reportObj = typeof report === 'string' ? JSON.parse(report) : report;

  // If it looks complex or non-standard, use AI
  if (!reportObj.accounts && !reportObj.tradelines && !reportObj.scores) {
    console.log('⚡ Using AI-assisted parsing for complex JSON...');
    return await aiAssistedParse(reportObj);
  }

  // Otherwise, try to extract what we can
  return {
    scores: reportObj.scores || reportObj.creditScores || {},
    tradelines: reportObj.tradelines || reportObj.accounts || [],
    negatives: reportObj.negatives || reportObj.derogatories || [],
    positives: reportObj.positives || [],
    hardInquiries: reportObj.inquiries || reportObj.hardInquiries || [],
    publicRecords: reportObj.publicRecords || [],
    collections: reportObj.collections || [],
    latePayments: reportObj.latePayments || [],
    utilization: reportObj.utilization || 0,
    ageOfCredit: reportObj.ageOfCredit || 0,
    totalAccounts: reportObj.totalAccounts || 0,
    openAccounts: reportObj.openAccounts || 0,
    totalBalances: reportObj.totalBalances || 0,
    reportDate: reportObj.reportDate || new Date().toISOString(),
    bureaus: reportObj.bureaus || [],
  };
}

// ============================================================================
// TEXT REPORT PARSER (AI-POWERED VIA CLOUD FUNCTIONS)
// ============================================================================

/**
 * Parse text/PDF credit report using AI
 * Routes to Cloud Functions for secure AI processing
 */
async function parseTextReport(textContent) {
  console.log('📝 Parsing text report via AI (Cloud Functions)...');

  try {
    // ===== CALL CLOUD FUNCTION FOR AI PARSING =====
    const aiContentGenerator = httpsCallable(functions, 'aiContentGenerator');
    
    const result = await aiContentGenerator({
      type: 'parseCreditReportText',
      text: textContent.substring(0, 12000), // Limit to 12k chars for API
    });

    if (result.data?.success && result.data?.parsed) {
      console.log('✅ AI parsing successful');
      return result.data.parsed;
    } else {
      console.warn('⚠️ AI parsing failed, using fallback extraction');
      return extractFromText(textContent);
    }

  } catch (error) {
    console.error('❌ AI text parsing error:', error);
    console.log('⚡ Falling back to regex extraction...');
    return extractFromText(textContent);
  }
}

// ============================================================================
// AI-ASSISTED PARSING (VIA CLOUD FUNCTIONS)
// ============================================================================

/**
 * Use AI to parse complex or unknown report formats
 * Secure server-side processing via Firebase Cloud Functions
 */
async function aiAssistedParse(reportObj) {
  console.log('🤖 Using AI-assisted parsing via Cloud Functions...');

  try {
    // Convert report to string for AI processing
    const reportString = typeof reportObj === 'string' 
      ? reportObj 
      : JSON.stringify(reportObj, null, 2);

    // Truncate to reasonable size (12k characters)
    const truncated = reportString.substring(0, 12000);

    // Call Cloud Function
    const aiContentGenerator = httpsCallable(functions, 'aiContentGenerator');
    
    const result = await aiContentGenerator({
      type: 'parseCreditReportJSON',
      json: truncated,
    });

    if (result.data?.success && result.data?.parsed) {
      console.log('✅ AI-assisted parsing successful');
      return result.data.parsed;
    } else {
      throw new Error('AI parsing returned no data');
    }

  } catch (error) {
    console.error('❌ AI-assisted parse failed:', error);
    
    // Fallback: Try to extract what we can manually
    console.log('⚡ Attempting manual extraction...');
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
      error: 'AI parsing failed. Manual data entry recommended.',
    };
  }
}

// ============================================================================
// UTILITY FUNCTIONS: EXTRACTION
// ============================================================================

/**
 * Extract negative items from report
 */
function extractNegativeItems(report) {
  const negatives = [];

  // Check various possible locations for negative items
  const sources = [
    report.negativeItems,
    report.negatives,
    report.derogatories,
    report.adverseItems,
  ].filter(Boolean);

  sources.forEach(source => {
    if (Array.isArray(source)) {
      source.forEach(item => {
        negatives.push({
          id: item.id || `neg-${Date.now()}-${Math.random()}`,
          type: item.type || determineNegativeType(item.status),
          creditorName: item.creditorName || item.name || 'Unknown',
          accountNumber: item.accountNumber || null,
          status: item.status || 'Negative',
          balance: parseFloat(item.balance || 0),
          dateOpened: item.dateOpened || null,
          dateReported: item.dateReported || item.lastReported || null,
          description: item.description || null,
        });
      });
    }
  });

  // Also check tradelines for negative status
  const tradelines = report.tradelines || report.accounts || [];
  tradelines.forEach(account => {
    const status = (account.status || account.paymentStatus || '').toLowerCase();
    if (status.includes('late') || status.includes('delinquent') || 
        status.includes('charge') || status.includes('collection')) {
      negatives.push({
        id: `neg-from-tradeline-${account.id}`,
        type: determineNegativeType(status),
        creditorName: account.creditorName || account.name || 'Unknown',
        accountNumber: account.accountNumber || null,
        status: account.status || 'Negative',
        balance: parseFloat(account.balance || 0),
        dateOpened: account.dateOpened || null,
        dateReported: account.lastReported || null,
        description: `${status} - from tradelines`,
      });
    }
  });

  return negatives;
}

/**
 * Extract positive items (on-time payments, good standing accounts)
 */
function extractPositiveItems(report) {
  const positives = [];
  const tradelines = report.tradelines || report.accounts || [];

  tradelines.forEach(account => {
    const status = (account.status || account.paymentStatus || '').toLowerCase();
    
    // Consider account positive if current/open/paid/good standing
    if (status.includes('current') || status.includes('open') || 
        status.includes('paid') || status.includes('good')) {
      positives.push({
        id: account.id || `pos-${Date.now()}-${Math.random()}`,
        creditorName: account.creditorName || account.name || 'Unknown',
        accountNumber: account.accountNumber || null,
        accountType: account.accountType || account.type || 'Unknown',
        status: account.status || 'Current',
        balance: parseFloat(account.balance || 0),
        creditLimit: parseFloat(account.creditLimit || account.limit || 0),
        paymentHistory: account.paymentHistory || null,
        dateOpened: account.dateOpened || null,
      });
    }
  });

  return positives;
}

/**
 * Extract collection accounts
 */
function extractCollections(report) {
  const collections = [];
  
  if (report.collections && Array.isArray(report.collections)) {
    return report.collections;
  }

  // Check tradelines and negatives for collections
  const allItems = [
    ...(report.tradelines || []),
    ...(report.negatives || []),
    ...(report.accounts || []),
  ];

  allItems.forEach(item => {
    const status = (item.status || '').toLowerCase();
    if (status.includes('collection')) {
      collections.push(item);
    }
  });

  return collections;
}

/**
 * Extract late payment records
 */
function extractLatePayments(report) {
  const latePayments = [];

  if (report.latePayments && Array.isArray(report.latePayments)) {
    return report.latePayments;
  }

  // Check payment history in tradelines
  const tradelines = report.tradelines || report.accounts || [];
  tradelines.forEach(account => {
    if (account.paymentHistory) {
      const history = Array.isArray(account.paymentHistory) 
        ? account.paymentHistory 
        : [account.paymentHistory];
      
      history.forEach(payment => {
        const status = (payment.status || '').toLowerCase();
        if (status.includes('late') || status.includes('30') || 
            status.includes('60') || status.includes('90')) {
          latePayments.push({
            accountId: account.id,
            creditorName: account.creditorName || account.name,
            date: payment.date || null,
            daysLate: payment.daysLate || 30,
            status: payment.status,
          });
        }
      });
    }
  });

  return latePayments;
}

// ============================================================================
// UTILITY FUNCTIONS: CALCULATIONS
// ============================================================================

/**
 * Calculate credit utilization percentage
 */
function calculateUtilization(accounts) {
  if (!accounts || accounts.length === 0) return 0;

  let totalBalance = 0;
  let totalLimit = 0;

  accounts.forEach(account => {
    const balance = parseFloat(account.balance || 0);
    const limit = parseFloat(account.creditLimit || account.limit || 0);
    
    if (limit > 0) {
      totalBalance += balance;
      totalLimit += limit;
    }
  });

  if (totalLimit === 0) return 0;

  const utilization = (totalBalance / totalLimit) * 100;
  return Math.round(utilization * 10) / 10; // Round to 1 decimal
}

/**
 * Calculate average age of credit in years
 */
function calculateAgeOfCredit(accounts) {
  if (!accounts || accounts.length === 0) return 0;

  const dates = accounts
    .map(a => a.dateOpened)
    .filter(Boolean)
    .map(d => new Date(d).getTime());

  if (dates.length === 0) return 0;

  const oldest = new Date(Math.min(...dates));
  const now = new Date();
  const ageInYears = (now - oldest) / (1000 * 60 * 60 * 24 * 365);

  return Math.round(ageInYears * 10) / 10; // Round to 1 decimal
}

/**
 * Calculate total balances across all accounts
 */
function calculateTotalBalances(accounts) {
  if (!accounts || accounts.length === 0) {
    return { total: 0, revolving: 0, installment: 0 };
  }

  let total = 0;
  let revolving = 0;
  let installment = 0;

  accounts.forEach(account => {
    const balance = parseFloat(account.balance || 0);
    total += balance;

    const type = (account.accountType || '').toLowerCase();
    if (type.includes('revolving') || type.includes('credit card')) {
      revolving += balance;
    } else if (type.includes('installment') || type.includes('loan')) {
      installment += balance;
    }
  });

  return { total, revolving, installment };
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
 * Determine negative item type from status
 */
function determineNegativeType(status) {
  const statusLower = status.toLowerCase();

  if (statusLower.includes('collection')) return 'Collection';
  if (statusLower.includes('charge off') || statusLower.includes('chargeoff')) return 'Charge-Off';
  if (statusLower.includes('late') || statusLower.includes('delinquent')) return 'Late Payment';
  if (statusLower.includes('bankruptcy')) return 'Bankruptcy';
  if (statusLower.includes('foreclosure')) return 'Foreclosure';
  if (statusLower.includes('repossession')) return 'Repossession';
  if (statusLower.includes('judgment')) return 'Judgment';
  if (statusLower.includes('tax lien')) return 'Tax Lien';

  return 'Derogatory';
}

// ============================================================================
// NORMALIZATION FUNCTIONS
// ============================================================================

/**
 * Normalize structured data to standard format
 */
function normalizeStructuredData(data) {
  console.log('🔧 Normalizing structured data...');
  
  return {
    scores: data.scores || {},
    tradelines: data.tradelines || [],
    negatives: data.negatives || [],
    positives: data.positives || [],
    hardInquiries: data.hardInquiries || [],
    publicRecords: data.publicRecords || [],
    collections: data.collections || [],
    latePayments: data.latePayments || [],
    utilization: data.utilization || 0,
    ageOfCredit: data.ageOfCredit || 0,
    totalAccounts: data.totalAccounts || 0,
    openAccounts: data.openAccounts || 0,
    totalBalances: data.totalBalances || 0,
    reportDate: data.reportDate || new Date().toISOString(),
    bureaus: data.bureaus || [],
  };
}

/**
 * Final normalization pass - ensure all fields exist
 */
function normalizeData(parsedData) {
  console.log('🔧 Final normalization...');

  // Ensure all required fields exist
  const normalized = {
    scores: parsedData.scores || {},
    tradelines: Array.isArray(parsedData.tradelines) ? parsedData.tradelines : [],
    negatives: Array.isArray(parsedData.negatives) ? parsedData.negatives : [],
    positives: Array.isArray(parsedData.positives) ? parsedData.positives : [],
    hardInquiries: Array.isArray(parsedData.hardInquiries) ? parsedData.hardInquiries : [],
    publicRecords: Array.isArray(parsedData.publicRecords) ? parsedData.publicRecords : [],
    collections: Array.isArray(parsedData.collections) ? parsedData.collections : [],
    latePayments: Array.isArray(parsedData.latePayments) ? parsedData.latePayments : [],
    utilization: parsedData.utilization || 0,
    ageOfCredit: parsedData.ageOfCredit || 0,
    totalAccounts: parsedData.totalAccounts || parsedData.tradelines?.length || 0,
    openAccounts: parsedData.openAccounts || 0,
    totalBalances: parsedData.totalBalances || 0,
    reportDate: parsedData.reportDate || new Date().toISOString(),
    bureaus: Array.isArray(parsedData.bureaus) ? parsedData.bureaus : [],
  };

  // Validate scores are in valid range
  Object.keys(normalized.scores).forEach(bureau => {
    const score = parseInt(normalized.scores[bureau]);
    if (isNaN(score) || score < 300 || score > 850) {
      delete normalized.scores[bureau];
    }
  });

  return normalized;
}

// ============================================================================
// FALLBACK: BASIC TEXT EXTRACTION
// ============================================================================

/**
 * Fallback text extraction when AI fails
 * Uses regex patterns to extract basic info
 */
function extractFromText(text) {
  console.log('🔍 Using regex-based extraction...');

  const scores = {};
  
  // Try to extract scores using regex
  const scorePatterns = [
    { pattern: /vantage.*?(\d{3})/i, bureau: 'vantage' },
    { pattern: /fico.*?(\d{3})/i, bureau: 'fico8' },
    { pattern: /credit score.*?(\d{3})/i, bureau: 'general' },
    { pattern: /experian.*?(\d{3})/i, bureau: 'experian' },
    { pattern: /equifax.*?(\d{3})/i, bureau: 'equifax' },
    { pattern: /transunion.*?(\d{3})/i, bureau: 'transunion' },
  ];

  scorePatterns.forEach(({ pattern, bureau }) => {
    const match = text.match(pattern);
    if (match) {
      const score = parseInt(match[1]);
      if (score >= 300 && score <= 850) {
        scores[bureau] = score;
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
    utilization: 50, // Default estimate
    ageOfCredit: 0,
    totalAccounts: 0,
    openAccounts: 0,
    totalBalances: 0,
    reportDate: new Date().toISOString(),
    bureaus: [],
    note: 'Extracted using basic parsing. Manual verification recommended.',
  };
}

/**
 * Get fallback structure when all parsing fails
 */
function getFallbackStructure(errorMessage = 'Parsing failed') {
  console.warn('⚠️ Returning fallback structure');
  
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
    error: errorMessage,
    note: 'Failed to parse report. Please enter data manually.',
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  parseCreditReport,
};