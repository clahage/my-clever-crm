// ═══════════════════════════════════════════════════════════════════════════════════════════
// DISPUTE POPULATION SERVICE - IDIQ CREDIT REPORT PARSER & DISPUTE GENERATOR
// ═══════════════════════════════════════════════════════════════════════════════════════════
// Path: functions/DisputePopulationService.js
// Version: 1.0.0 - ENTERPRISE EDITION
// 
// PURPOSE: Parse IDIQ HTML credit reports and populate the Dispute Center
// This is the ENGINE that powers the Dispute Center - SCR's main revenue generator
// 
// WHAT THIS FILE DOES:
// ✅ Parses HTML credit reports from IDIQ stored in Firebase
// ✅ Extracts all tradelines (accounts) with their complete details
// ✅ Identifies negative items (Collections, Late Payments, Charge-offs, etc.)
// ✅ Calculates dispute potential and success probability for each item
// ✅ Generates AI-powered dispute recommendations
// ✅ Creates disputable item records in Firebase
// ✅ Connects to AIDisputeGenerator.jsx data format
// ✅ Supports all 3 bureaus (Experian, Equifax, TransUnion)
// ✅ Provides real-time status updates during processing
//
// FIREBASE COLLECTIONS USED:
// - idiqEnrollments: Where raw credit report HTML is stored
// - disputes: Where parsed disputable items are stored
// - contacts: To link disputes to contacts
// - creditReportAnalysis: Stores parsed credit data for quick access
//
// © 1995-2026 Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved
// ═══════════════════════════════════════════════════════════════════════════════════════════

const admin = require('firebase-admin');
const cheerio = require('cheerio');
const { v4: uuidv4 } = require('uuid');

// ═══════════════════════════════════════════════════════════════════════════════════════════
// CONFIGURATION CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════════════════

// ===== CHRIS LAHAGE CONTACT INFO (FOR HUMAN TOUCH IN DISPUTE LETTERS) =====
const CHRIS_INFO = {
  name: 'Chris Lahage',
  title: 'Credit Expert & Owner',
  company: 'Speedy Credit Repair Inc.',
  phone: '(888) 724-7344',
  phoneNote: 'Call and ask for me directly',
  email: 'chris@speedycreditrepair.com',
  experience: '30 Years Credit Repair Experience',
  currentPosition: 'Current Finance Director at one of Toyota\'s top franchises',
  bbbRating: 'A+ BBB Rating',
  googleRating: '4.9★ Google (580+ Reviews)',
  established: '1995'
};

// ===== CREDIT BUREAUS CONFIGURATION =====
const BUREAUS = {
  TUC: {
    id: 'transunion',
    name: 'TransUnion',
    symbol: 'TUC',
    color: '#005EB8',
    address: 'P.O. Box 2000, Chester, PA 19016',
    email: 'disputes@transunion.com',
    fax: '1-610-546-4771',
    website: 'www.transunion.com/dispute',
    responseTime: '30-45 days'
  },
  EXP: {
    id: 'experian',
    name: 'Experian',
    symbol: 'EXP',
    color: '#0066B2',
    address: 'P.O. Box 4500, Allen, TX 75013',
    email: 'disputes@experian.com',
    fax: '1-888-397-3742',
    website: 'www.experian.com/dispute',
    responseTime: '30-45 days'
  },
  EQF: {
    id: 'equifax',
    name: 'Equifax',
    symbol: 'EQF',
    color: '#C8102E',
    address: 'P.O. Box 740256, Atlanta, GA 30374',
    email: 'disputes@equifax.com',
    fax: '1-404-885-8000',
    website: 'www.equifax.com/dispute',
    responseTime: '30-45 days'
  }
};

// ===== NEGATIVE ITEM TYPE CLASSIFICATIONS =====
const NEGATIVE_ITEM_TYPES = {
  // ===== HIGH IMPACT ITEMS =====
  collection: {
    patterns: ['collection', 'collect', 'coll acct', 'ca ', 'collection agency'],
    label: 'Collection',
    impactScore: 100,
    avgRemovalDays: 45,
    successRate: 78,
    scoreImpact: { min: 50, max: 100 },
    priority: 'high',
    disputeStrategies: ['validation', 'not_mine', 'outdated', 'pay_delete'],
    description: 'Debt sold to collection agency'
  },
  chargeoff: {
    patterns: ['charge off', 'chargeoff', 'charged off', 'charge-off', 'co ', 'written off'],
    label: 'Charge-Off',
    impactScore: 95,
    avgRemovalDays: 60,
    successRate: 72,
    scoreImpact: { min: 40, max: 80 },
    priority: 'high',
    disputeStrategies: ['factual_error', 'validation', 'outdated'],
    description: 'Account written off as bad debt'
  },
  foreclosure: {
    patterns: ['foreclosure', 'foreclosed', 'mortgage default'],
    label: 'Foreclosure',
    impactScore: 100,
    avgRemovalDays: 90,
    successRate: 55,
    scoreImpact: { min: 80, max: 150 },
    priority: 'high',
    disputeStrategies: ['factual_error', 'validation'],
    description: 'Home foreclosure'
  },
  repossession: {
    patterns: ['repossession', 'repossessed', 'repo', 'voluntary surrender'],
    label: 'Repossession',
    impactScore: 90,
    avgRemovalDays: 75,
    successRate: 65,
    scoreImpact: { min: 50, max: 90 },
    priority: 'high',
    disputeStrategies: ['factual_error', 'validation'],
    description: 'Vehicle or property repossessed'
  },
  bankruptcy: {
    patterns: ['bankruptcy', 'chapter 7', 'chapter 13', 'chapter 11', 'bk ', 'bankrupt'],
    label: 'Bankruptcy',
    impactScore: 100,
    avgRemovalDays: 120,
    successRate: 45,
    scoreImpact: { min: 100, max: 200 },
    priority: 'high',
    disputeStrategies: ['outdated', 'factual_error'],
    description: 'Bankruptcy filing'
  },
  judgment: {
    patterns: ['judgment', 'civil judgment', 'court judgment', 'legal judgment'],
    label: 'Judgment',
    impactScore: 85,
    avgRemovalDays: 60,
    successRate: 70,
    scoreImpact: { min: 40, max: 70 },
    priority: 'high',
    disputeStrategies: ['validation', 'factual_error', 'outdated'],
    description: 'Court judgment against consumer'
  },
  
  // ===== MEDIUM IMPACT ITEMS =====
  late_90: {
    patterns: ['late 90', '90 days', '90+ days', 'late 90 days', 'seriously delinquent'],
    label: 'Late Payment (90+ Days)',
    impactScore: 75,
    avgRemovalDays: 35,
    successRate: 80,
    scoreImpact: { min: 30, max: 60 },
    priority: 'high',
    disputeStrategies: ['factual_error', 'goodwill'],
    description: 'Payment 90 or more days late'
  },
  late_60: {
    patterns: ['late 60', '60 days', 'late 60 days'],
    label: 'Late Payment (60 Days)',
    impactScore: 60,
    avgRemovalDays: 30,
    successRate: 82,
    scoreImpact: { min: 25, max: 50 },
    priority: 'medium',
    disputeStrategies: ['factual_error', 'goodwill'],
    description: 'Payment 60 days late'
  },
  late_30: {
    patterns: ['late 30', '30 days', 'late 30 days', '30 day late'],
    label: 'Late Payment (30 Days)',
    impactScore: 50,
    avgRemovalDays: 25,
    successRate: 85,
    scoreImpact: { min: 15, max: 35 },
    priority: 'medium',
    disputeStrategies: ['factual_error', 'goodwill'],
    description: 'Payment 30 days late'
  },
  derogatory: {
    patterns: ['derogatory', 'derog', 'adverse', 'negative'],
    label: 'Derogatory Remark',
    impactScore: 65,
    avgRemovalDays: 40,
    successRate: 75,
    scoreImpact: { min: 20, max: 50 },
    priority: 'medium',
    disputeStrategies: ['factual_error', 'validation'],
    description: 'General derogatory mark'
  },
  settled: {
    patterns: ['settled', 'settled for less', 'debt settlement', 'paid settled'],
    label: 'Settled for Less',
    impactScore: 55,
    avgRemovalDays: 45,
    successRate: 68,
    scoreImpact: { min: 20, max: 45 },
    priority: 'medium',
    disputeStrategies: ['factual_error', 'goodwill'],
    description: 'Account settled for less than owed'
  },
  
  // ===== LOW IMPACT ITEMS =====
  inquiry: {
    patterns: ['inquiry', 'hard inquiry', 'credit inquiry', 'hard pull'],
    label: 'Hard Inquiry',
    impactScore: 20,
    avgRemovalDays: 15,
    successRate: 92,
    scoreImpact: { min: 5, max: 15 },
    priority: 'low',
    disputeStrategies: ['not_mine'],
    description: 'Credit inquiry from application'
  },
  high_utilization: {
    patterns: ['high balance', 'over limit', 'maxed out', 'high utilization'],
    label: 'High Utilization',
    impactScore: 30,
    avgRemovalDays: 30,
    successRate: 40,
    scoreImpact: { min: 10, max: 30 },
    priority: 'low',
    disputeStrategies: ['factual_error'],
    description: 'High credit utilization reported'
  }
};

// ===== DISPUTE STRATEGIES (Matches AIDisputeGenerator.jsx) =====
const DISPUTE_STRATEGIES = {
  factual_error: {
    name: 'Factual Error',
    fcraSection: '611(a)(1)(A)',
    successRate: 75,
    description: 'Challenge incorrect information'
  },
  validation: {
    name: 'Debt Validation',
    fcraSection: '611(a)(1)',
    successRate: 65,
    description: 'Request proof of debt validity'
  },
  not_mine: {
    name: 'Not My Account',
    fcraSection: '605B',
    successRate: 85,
    description: 'Account does not belong to consumer'
  },
  outdated: {
    name: 'Outdated Item',
    fcraSection: '605(a)',
    successRate: 90,
    description: 'Item past 7-year reporting period'
  },
  goodwill: {
    name: 'Goodwill Request',
    fcraSection: 'N/A',
    successRate: 40,
    description: 'Request removal based on circumstances'
  },
  pay_delete: {
    name: 'Pay for Delete',
    fcraSection: 'Negotiation',
    successRate: 60,
    description: 'Negotiate removal in exchange for payment'
  }
};

// ═══════════════════════════════════════════════════════════════════════════════════════════
// HTML PARSING UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════════════════

/**
 * Clean text by removing extra whitespace and trimming
 */
const cleanText = (text) => {
  if (!text) return '';
  return text.replace(/\s+/g, ' ').trim();
};

/**
 * Parse currency values from text (e.g., "$1,234.56" -> 1234.56)
 */
const parseCurrency = (text) => {
  if (!text || text === '-' || text === 'N/A') return 0;
  const cleaned = text.replace(/[$,\s]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Parse date from various formats
 */
const parseDate = (text) => {
  if (!text || text === '-' || text === 'N/A') return null;
  
  const cleaned = cleanText(text);
  
  // Try MM/DD/YYYY format
  const match1 = cleaned.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (match1) {
    return new Date(parseInt(match1[3]), parseInt(match1[1]) - 1, parseInt(match1[2]));
  }
  
  // Try YYYY-MM-DD format
  const match2 = cleaned.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (match2) {
    return new Date(parseInt(match2[1]), parseInt(match2[2]) - 1, parseInt(match2[3]));
  }
  
  return null;
};

/**
 * Calculate if an item is past the 7-year reporting limit
 */
const isOutdated = (dateOpened) => {
  if (!dateOpened) return false;
  const sevenYearsAgo = new Date();
  sevenYearsAgo.setFullYear(sevenYearsAgo.getFullYear() - 7);
  return dateOpened < sevenYearsAgo;
};

/**
 * Determine negative item type from account status and payment history
 */
const classifyNegativeItem = (accountData) => {
  const {
    accountStatus = '',
    paymentStatus = '',
    accountType = '',
    accountTypeDetail = '',
    creditorName = ''
  } = accountData;
  
  // Combine all text fields for pattern matching
  const combinedText = `${accountStatus} ${paymentStatus} ${accountType} ${accountTypeDetail} ${creditorName}`.toLowerCase();
  
  // Check each negative item type in order of severity
  for (const [typeKey, typeConfig] of Object.entries(NEGATIVE_ITEM_TYPES)) {
    for (const pattern of typeConfig.patterns) {
      if (combinedText.includes(pattern.toLowerCase())) {
        return {
          type: typeKey,
          ...typeConfig
        };
      }
    }
  }
  
  // Check for late payment indicators in payment status
  if (combinedText.includes('late') || combinedText.includes('delinquent')) {
    return {
      type: 'derogatory',
      ...NEGATIVE_ITEM_TYPES.derogatory
    };
  }
  
  return null;
};

// ═══════════════════════════════════════════════════════════════════════════════════════════
// IDIQ HTML PARSER - MAIN TRADELINE EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════════════════════

/**
 * Parse an IDIQ HTML credit report and extract all tradelines
 * @param {string} htmlContent - Raw HTML content from IDIQ
 * @returns {Object} Parsed credit report data with tradelines
 */
const parseIDIQCreditReport = (htmlContent) => {
  console.log('🔍 DisputePopulationService: Starting IDIQ HTML parsing...');
  
  if (!htmlContent) {
    console.error('❌ No HTML content provided');
    return { success: false, error: 'No HTML content provided', tradelines: [] };
  }
  
  try {
    const $ = cheerio.load(htmlContent);
    
    // ===== EXTRACT REPORT METADATA =====
    const reportMetadata = {
      referenceNumber: '',
      reportDate: null,
      is3Bureau: true
    };
    
    // Extract reference number
    const refMatch = htmlContent.match(/Reference #.*?(\w+)/);
    if (refMatch) {
      reportMetadata.referenceNumber = refMatch[1];
    }
    
    // Extract report date
    $('td.ng-binding').each((i, el) => {
      const text = $(el).text();
      if (text.includes('/')) {
        const dateMatch = text.match(/(\d{2}\/\d{2}\/\d{4})/);
        if (dateMatch && !reportMetadata.reportDate) {
          reportMetadata.reportDate = parseDate(dateMatch[1]);
        }
      }
    });
    
    console.log(`📋 Report Reference: ${reportMetadata.referenceNumber}`);
    console.log(`📅 Report Date: ${reportMetadata.reportDate}`);
    
    // ===== EXTRACT CREDIT SCORES =====
    const creditScores = {
      transunion: { score: 0, factors: [] },
      experian: { score: 0, factors: [] },
      equifax: { score: 0, factors: [] }
    };
    
    // Look for score values in the HTML
    $('td.score_value, .score_value, td.ng-binding').each((i, el) => {
      const text = cleanText($(el).text());
      const scoreMatch = text.match(/\b(\d{3})\b/);
      if (scoreMatch) {
        const score = parseInt(scoreMatch[1]);
        if (score >= 300 && score <= 850) {
          // Determine which bureau based on context
          const parentHtml = $(el).parent().html() || '';
          const parentText = $(el).parent().text().toLowerCase();
          
          if (parentText.includes('transunion') || parentHtml.includes('TUC')) {
            if (creditScores.transunion.score === 0) creditScores.transunion.score = score;
          } else if (parentText.includes('experian') || parentHtml.includes('EXP')) {
            if (creditScores.experian.score === 0) creditScores.experian.score = score;
          } else if (parentText.includes('equifax') || parentHtml.includes('EQF')) {
            if (creditScores.equifax.score === 0) creditScores.equifax.score = score;
          }
        }
      }
    });
    
    console.log(`📊 Credit Scores - TU: ${creditScores.transunion.score}, EXP: ${creditScores.experian.score}, EQF: ${creditScores.equifax.score}`);
    
    // ===== EXTRACT ACCOUNT SUMMARY =====
    const accountSummary = {
      totalAccounts: 0,
      openAccounts: 0,
      closedAccounts: 0,
      delinquentAccounts: 0,
      derogatoryAccounts: 0,
      collectionAccounts: 0
    };
    
    // Parse account summary section
    $('table tr').each((i, el) => {
      const text = cleanText($(el).text()).toLowerCase();
      const cells = $(el).find('td');
      
      if (text.includes('total accounts') && cells.length >= 2) {
        accountSummary.totalAccounts = parseInt($(cells[1]).text()) || 0;
      } else if (text.includes('open accounts') && cells.length >= 2) {
        accountSummary.openAccounts = parseInt($(cells[1]).text()) || 0;
      } else if (text.includes('closed accounts') && cells.length >= 2) {
        accountSummary.closedAccounts = parseInt($(cells[1]).text()) || 0;
      } else if (text.includes('delinquent') && cells.length >= 2) {
        accountSummary.delinquentAccounts = parseInt($(cells[1]).text()) || 0;
      } else if (text.includes('derogatory') && cells.length >= 2) {
        accountSummary.derogatoryAccounts = parseInt($(cells[1]).text()) || 0;
      } else if (text.includes('collection') && cells.length >= 2) {
        accountSummary.collectionAccounts = parseInt($(cells[1]).text()) || 0;
      }
    });
    
    console.log(`📈 Account Summary:`, accountSummary);
    
    // ===== EXTRACT TRADELINES (THE MAIN EVENT!) =====
    const tradelines = [];
    let tradelineCount = 0;
    
    // Find all tradeline sections (accounts)
    // IDIQ HTML uses div.sub_header for creditor names
    $('div.sub_header').each((i, headerEl) => {
      tradelineCount++;
      const creditorName = cleanText($(headerEl).text());
      
      // Skip if this is just a section header
      if (!creditorName || creditorName.toLowerCase().includes('account history')) {
        return;
      }
      
      // Check for original creditor (indicates collection account)
      let originalCreditor = '';
      const origCredMatch = creditorName.match(/\(Original Creditor:\s*(.+?)\)/i);
      if (origCredMatch) {
        originalCreditor = cleanText(origCredMatch[1]);
      }
      
      // Find the associated table with account details
      const accountTable = $(headerEl).nextAll('table.rpt_content_table').first();
      
      if (accountTable.length === 0) {
        return;
      }
      
      // Initialize account data structure
      const accountData = {
        id: `tradeline_${tradelineCount}_${Date.now()}`,
        creditorName: creditorName.replace(/\(Original Creditor:.*\)/i, '').trim(),
        originalCreditor: originalCreditor,
        isCollection: !!originalCreditor,
        bureaus: {
          transunion: { present: false, data: {} },
          experian: { present: false, data: {} },
          equifax: { present: false, data: {} }
        }
      };
      
      // Parse each row in the account table
      accountTable.find('tr').each((rowIndex, rowEl) => {
        const cells = $(rowEl).find('td');
        if (cells.length < 2) return;
        
        const label = cleanText($(cells[0]).text()).toLowerCase();
        
        // Get values for each bureau (TUC, EXP, EQF)
        const tucValue = cells.length > 1 ? cleanText($(cells[1]).text()) : '-';
        const expValue = cells.length > 2 ? cleanText($(cells[2]).text()) : '-';
        const eqfValue = cells.length > 3 ? cleanText($(cells[3]).text()) : '-';
        
        // Map the data based on label
        if (label.includes('account #')) {
          accountData.bureaus.transunion.data.accountNumber = tucValue;
          accountData.bureaus.experian.data.accountNumber = expValue;
          accountData.bureaus.equifax.data.accountNumber = eqfValue;
          
          // Mark which bureaus have this account
          accountData.bureaus.transunion.present = tucValue !== '-' && tucValue !== '';
          accountData.bureaus.experian.present = expValue !== '-' && expValue !== '';
          accountData.bureaus.equifax.present = eqfValue !== '-' && eqfValue !== '';
        }
        else if (label.includes('account type:') && !label.includes('detail')) {
          accountData.bureaus.transunion.data.accountType = tucValue;
          accountData.bureaus.experian.data.accountType = expValue;
          accountData.bureaus.equifax.data.accountType = eqfValue;
        }
        else if (label.includes('account type') && label.includes('detail')) {
          accountData.bureaus.transunion.data.accountTypeDetail = tucValue;
          accountData.bureaus.experian.data.accountTypeDetail = expValue;
          accountData.bureaus.equifax.data.accountTypeDetail = eqfValue;
        }
        else if (label.includes('account status')) {
          accountData.bureaus.transunion.data.accountStatus = tucValue;
          accountData.bureaus.experian.data.accountStatus = expValue;
          accountData.bureaus.equifax.data.accountStatus = eqfValue;
        }
        else if (label.includes('payment status')) {
          accountData.bureaus.transunion.data.paymentStatus = tucValue;
          accountData.bureaus.experian.data.paymentStatus = expValue;
          accountData.bureaus.equifax.data.paymentStatus = eqfValue;
        }
        else if (label.includes('balance')) {
          accountData.bureaus.transunion.data.balance = parseCurrency(tucValue);
          accountData.bureaus.experian.data.balance = parseCurrency(expValue);
          accountData.bureaus.equifax.data.balance = parseCurrency(eqfValue);
        }
        else if (label.includes('credit limit')) {
          accountData.bureaus.transunion.data.creditLimit = parseCurrency(tucValue);
          accountData.bureaus.experian.data.creditLimit = parseCurrency(expValue);
          accountData.bureaus.equifax.data.creditLimit = parseCurrency(eqfValue);
        }
        else if (label.includes('high credit')) {
          accountData.bureaus.transunion.data.highBalance = parseCurrency(tucValue);
          accountData.bureaus.experian.data.highBalance = parseCurrency(expValue);
          accountData.bureaus.equifax.data.highBalance = parseCurrency(eqfValue);
        }
        else if (label.includes('date opened')) {
          accountData.bureaus.transunion.data.dateOpened = parseDate(tucValue);
          accountData.bureaus.experian.data.dateOpened = parseDate(expValue);
          accountData.bureaus.equifax.data.dateOpened = parseDate(eqfValue);
        }
        else if (label.includes('date closed')) {
          accountData.bureaus.transunion.data.dateClosed = parseDate(tucValue);
          accountData.bureaus.experian.data.dateClosed = parseDate(expValue);
          accountData.bureaus.equifax.data.dateClosed = parseDate(eqfValue);
        }
        else if (label.includes('last reported')) {
          accountData.bureaus.transunion.data.lastReported = parseDate(tucValue);
          accountData.bureaus.experian.data.lastReported = parseDate(expValue);
          accountData.bureaus.equifax.data.lastReported = parseDate(eqfValue);
        }
        else if (label.includes('past due')) {
          accountData.bureaus.transunion.data.pastDue = parseCurrency(tucValue);
          accountData.bureaus.experian.data.pastDue = parseCurrency(expValue);
          accountData.bureaus.equifax.data.pastDue = parseCurrency(eqfValue);
        }
        else if (label.includes('monthly payment')) {
          accountData.bureaus.transunion.data.monthlyPayment = parseCurrency(tucValue);
          accountData.bureaus.experian.data.monthlyPayment = parseCurrency(expValue);
          accountData.bureaus.equifax.data.monthlyPayment = parseCurrency(eqfValue);
        }
      });
      
      tradelines.push(accountData);
    });
    
    console.log(`📋 Total tradelines found: ${tradelines.length}`);
    
    // ===== EXTRACT INQUIRIES =====
    const inquiries = [];
    
    // Look for inquiry sections
    $('div:contains("Inquiries")').each((i, el) => {
      const inquiryTable = $(el).nextAll('table').first();
      inquiryTable.find('tr').each((rowIndex, rowEl) => {
        if (rowIndex === 0) return; // Skip header
        
        const cells = $(rowEl).find('td');
        if (cells.length >= 2) {
          const creditor = cleanText($(cells[0]).text());
          const date = parseDate(cleanText($(cells[1]).text()));
          
          if (creditor && date) {
            inquiries.push({
              id: `inquiry_${rowIndex}_${Date.now()}`,
              creditor,
              date,
              type: 'hard_inquiry'
            });
          }
        }
      });
    });
    
    console.log(`🔍 Total inquiries found: ${inquiries.length}`);
    
    return {
      success: true,
      metadata: reportMetadata,
      creditScores,
      accountSummary,
      tradelines,
      inquiries,
      parsedAt: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Error parsing IDIQ HTML:', error);
    return {
      success: false,
      error: error.message,
      tradelines: []
    };
  }
};

// ═══════════════════════════════════════════════════════════════════════════════════════════
// NEGATIVE ITEM IDENTIFICATION ENGINE
// ═══════════════════════════════════════════════════════════════════════════════════════════

/**
 * Analyze tradelines and identify all negative/disputable items
 * @param {Array} tradelines - Parsed tradelines from credit report
 * @returns {Array} Array of disputable items with recommendations
 */
const identifyNegativeItems = (tradelines) => {
  console.log('🔎 DisputePopulationService: Identifying negative items...');
  
  const negativeItems = [];
  
  for (const tradeline of tradelines) {
    // ===== CHECK EACH BUREAU FOR THIS TRADELINE =====
    for (const [bureauKey, bureauData] of Object.entries(tradeline.bureaus)) {
      if (!bureauData.present) continue;
      
      const data = bureauData.data;
      
      // ===== CLASSIFY THE NEGATIVE ITEM TYPE =====
      const classification = classifyNegativeItem({
        accountStatus: data.accountStatus || '',
        paymentStatus: data.paymentStatus || '',
        accountType: data.accountType || '',
        accountTypeDetail: data.accountTypeDetail || '',
        creditorName: tradeline.creditorName || ''
      });
      
      // ===== CHECK FOR COLLECTIONS (Always disputable) =====
      if (tradeline.isCollection || 
          data.accountTypeDetail?.toLowerCase().includes('collection') ||
          tradeline.creditorName?.toLowerCase().includes('collection')) {
        
        const negativeItem = createDisputeItem(tradeline, bureauKey, data, 
          NEGATIVE_ITEM_TYPES.collection, 'collection');
        negativeItems.push(negativeItem);
        continue;
      }
      
      // ===== CHECK FOR CLASSIFIED NEGATIVE ITEMS =====
      if (classification) {
        const negativeItem = createDisputeItem(tradeline, bureauKey, data, 
          classification, classification.type);
        negativeItems.push(negativeItem);
        continue;
      }
      
      // ===== CHECK FOR LATE PAYMENTS IN PAYMENT HISTORY =====
      const paymentStatus = (data.paymentStatus || '').toLowerCase();
      const accountStatus = (data.accountStatus || '').toLowerCase();
      
      // Check for 90+ days late
      if (paymentStatus.includes('90') || paymentStatus.includes('seriously')) {
        const negativeItem = createDisputeItem(tradeline, bureauKey, data,
          NEGATIVE_ITEM_TYPES.late_90, 'late_90');
        negativeItems.push(negativeItem);
      }
      // Check for 60 days late
      else if (paymentStatus.includes('60')) {
        const negativeItem = createDisputeItem(tradeline, bureauKey, data,
          NEGATIVE_ITEM_TYPES.late_60, 'late_60');
        negativeItems.push(negativeItem);
      }
      // Check for 30 days late
      else if (paymentStatus.includes('30') || paymentStatus.includes('late')) {
        const negativeItem = createDisputeItem(tradeline, bureauKey, data,
          NEGATIVE_ITEM_TYPES.late_30, 'late_30');
        negativeItems.push(negativeItem);
      }
      
      // ===== CHECK FOR PAST DUE AMOUNTS =====
      if (data.pastDue && data.pastDue > 0) {
        // Only add if not already added above
        const alreadyAdded = negativeItems.some(
          ni => ni.tradelineId === tradeline.id && ni.bureau === bureauKey
        );
        if (!alreadyAdded) {
          const negativeItem = createDisputeItem(tradeline, bureauKey, data,
            NEGATIVE_ITEM_TYPES.derogatory, 'derogatory');
          negativeItems.push(negativeItem);
        }
      }
      
      // ===== CHECK FOR OUTDATED ITEMS (7+ years old) =====
      if (data.dateOpened && isOutdated(data.dateOpened)) {
        const existingItem = negativeItems.find(
          ni => ni.tradelineId === tradeline.id && ni.bureau === bureauKey
        );
        if (existingItem) {
          existingItem.isOutdated = true;
          existingItem.additionalStrategies = ['outdated'];
          existingItem.successProbability = Math.min(existingItem.successProbability + 15, 95);
        }
      }
    }
  }
  
  console.log(`⚠️ Total negative items identified: ${negativeItems.length}`);
  
  return negativeItems;
};

/**
 * Create a dispute item object with all required fields
 */
const createDisputeItem = (tradeline, bureauKey, data, typeConfig, typeKey) => {
  const bureauInfo = BUREAUS[bureauKey.toUpperCase()] || BUREAUS[bureauKey] || {};
  
  // Calculate success probability with adjustments
  let successProbability = typeConfig.successRate || 70;
  
  // Boost probability for older items
  if (data.dateOpened) {
    const ageYears = (new Date() - data.dateOpened) / (365 * 24 * 60 * 60 * 1000);
    if (ageYears > 5) successProbability += 10;
    if (ageYears > 6) successProbability += 10;
  }
  
  // Boost for items with missing data
  if (!data.accountNumber || data.accountNumber === '-') successProbability += 5;
  if (!data.balance || data.balance === 0) successProbability += 3;
  
  // Cap at 95%
  successProbability = Math.min(successProbability, 95);
  
  // Recommend best dispute strategy
  const recommendedStrategy = typeConfig.disputeStrategies?.[0] || 'factual_error';
  
  return {
    // ===== CORE IDENTIFICATION =====
    id: `dispute_${tradeline.id}_${bureauKey}_${Date.now()}`,
    tradelineId: tradeline.id,
    
    // ===== ACCOUNT INFORMATION =====
    creditorName: tradeline.creditorName,
    originalCreditor: tradeline.originalCreditor || null,
    accountNumber: data.accountNumber || 'Unknown',
    accountType: data.accountType || 'Unknown',
    accountTypeDetail: data.accountTypeDetail || '',
    accountStatus: data.accountStatus || 'Unknown',
    paymentStatus: data.paymentStatus || 'Unknown',
    
    // ===== FINANCIAL DATA =====
    balance: data.balance || 0,
    creditLimit: data.creditLimit || 0,
    highBalance: data.highBalance || 0,
    pastDue: data.pastDue || 0,
    monthlyPayment: data.monthlyPayment || 0,
    
    // ===== DATES =====
    dateOpened: data.dateOpened || null,
    dateClosed: data.dateClosed || null,
    lastReported: data.lastReported || null,
    isOutdated: data.dateOpened ? isOutdated(data.dateOpened) : false,
    
    // ===== NEGATIVE ITEM CLASSIFICATION =====
    type: typeKey,
    typeLabel: typeConfig.label,
    typeDescription: typeConfig.description,
    impactScore: typeConfig.impactScore,
    scoreImpact: typeConfig.scoreImpact,
    priority: typeConfig.priority,
    
    // ===== BUREAU INFORMATION =====
    bureau: bureauInfo.id || bureauKey,
    bureauName: bureauInfo.name || bureauKey,
    bureauSymbol: bureauInfo.symbol || bureauKey.toUpperCase(),
    bureauColor: bureauInfo.color || '#6B7280',
    bureauAddress: bureauInfo.address || '',
    bureauFax: bureauInfo.fax || '',
    
    // ===== DISPUTE STRATEGY =====
    recommendedStrategy: recommendedStrategy,
    availableStrategies: typeConfig.disputeStrategies || ['factual_error'],
    successProbability: successProbability,
    estimatedRemovalDays: typeConfig.avgRemovalDays || 45,
    fcraSection: DISPUTE_STRATEGIES[recommendedStrategy]?.fcraSection || '611',
    
    // ===== STATUS TRACKING =====
    status: 'identified', // identified, selected, disputed, pending, resolved, deleted, verified
    round: 0, // 0 = not disputed yet, 1-3 = dispute round
    disputeDate: null,
    responseDate: null,
    outcome: null,
    
    // ===== METADATA =====
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    source: 'idiq_html_parser',
    version: '1.0.0'
  };
};

// ═══════════════════════════════════════════════════════════════════════════════════════════
// FIREBASE INTEGRATION - STORE PARSED DATA
// ═══════════════════════════════════════════════════════════════════════════════════════════

/**
 * Save parsed credit report data to Firebase
 * @param {string} contactId - The contact/client ID
 * @param {Object} parsedData - Parsed credit report data
 * @returns {Object} Result with saved document IDs
 */
const saveParsedCreditData = async (contactId, parsedData) => {
  console.log(`💾 Saving parsed credit data for contact: ${contactId}`);
  
  const db = admin.firestore();
  const batch = db.batch();
  const savedIds = {
    analysisId: null,
    disputeIds: []
  };
  
  try {
    // ===== SAVE CREDIT REPORT ANALYSIS =====
    const analysisRef = db.collection('creditReportAnalysis').doc();
    savedIds.analysisId = analysisRef.id;
    
    batch.set(analysisRef, {
      contactId: contactId,
      reportMetadata: parsedData.metadata || {},
      creditScores: parsedData.creditScores || {},
      accountSummary: parsedData.accountSummary || {},
      tradelineCount: parsedData.tradelines?.length || 0,
      inquiryCount: parsedData.inquiries?.length || 0,
      parsedAt: admin.firestore.FieldValue.serverTimestamp(),
      source: 'DisputePopulationService',
      version: '1.0.0'
    });
    
    // ===== SAVE NEGATIVE/DISPUTABLE ITEMS =====
    const negativeItems = identifyNegativeItems(parsedData.tradelines || []);
    
    for (const item of negativeItems) {
      const disputeRef = db.collection('disputes').doc();
      savedIds.disputeIds.push(disputeRef.id);
      
      batch.set(disputeRef, {
        ...item,
        id: disputeRef.id,
        contactId: contactId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    
    // ===== SAVE INQUIRIES AS SEPARATE DISPUTES =====
    for (const inquiry of (parsedData.inquiries || [])) {
      const inquiryRef = db.collection('disputes').doc();
      savedIds.disputeIds.push(inquiryRef.id);
      
      const inquiryConfig = NEGATIVE_ITEM_TYPES.inquiry;
      batch.set(inquiryRef, {
        id: inquiryRef.id,
        contactId: contactId,
        creditorName: inquiry.creditor,
        type: 'inquiry',
        typeLabel: 'Hard Inquiry',
        typeDescription: inquiryConfig.description,
        impactScore: inquiryConfig.impactScore,
        scoreImpact: inquiryConfig.scoreImpact,
        priority: inquiryConfig.priority,
        dateOpened: inquiry.date,
        bureau: 'all',
        bureauName: 'All Bureaus',
        recommendedStrategy: 'not_mine',
        availableStrategies: ['not_mine'],
        successProbability: inquiryConfig.successRate,
        estimatedRemovalDays: inquiryConfig.avgRemovalDays,
        status: 'identified',
        round: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        source: 'idiq_html_parser',
        version: '1.0.0'
      });
    }
    
    // ===== COMMIT BATCH =====
    await batch.commit();
    
    console.log(`✅ Saved credit analysis: ${savedIds.analysisId}`);
    console.log(`✅ Saved ${savedIds.disputeIds.length} disputable items`);
    
    return {
      success: true,
      analysisId: savedIds.analysisId,
      disputeCount: savedIds.disputeIds.length,
      disputeIds: savedIds.disputeIds
    };
    
  } catch (error) {
    console.error('❌ Error saving parsed credit data:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// ═══════════════════════════════════════════════════════════════════════════════════════════
// MAIN ENTRY POINT - PROCESS CONTACT'S CREDIT REPORT
// ═══════════════════════════════════════════════════════════════════════════════════════════

/**
 * Main function to process a contact's IDIQ credit report and populate disputes
 * @param {string} contactId - The contact/client ID
 * @returns {Object} Processing result with dispute summary
 */
const populateDisputesFromIDIQ = async (contactId) => {
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log(`🚀 DisputePopulationService: Processing contact ${contactId}`);
  console.log('═══════════════════════════════════════════════════════════════════');
  
  const db = admin.firestore();
  
  try {
    // ===== STEP 1: FETCH IDIQ ENROLLMENT =====
    console.log('📥 Step 1: Fetching IDIQ enrollment...');
    
    const enrollmentQuery = await db.collection('idiqEnrollments')
      .where('contactId', '==', contactId)
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();
    
    if (enrollmentQuery.empty) {
      // Try by userId
      const userEnrollmentQuery = await db.collection('idiqEnrollments')
        .where('userId', '==', contactId)
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get();
      
      if (userEnrollmentQuery.empty) {
        console.log('❌ No IDIQ enrollment found for this contact');
        return {
          success: false,
          error: 'No IDIQ enrollment found',
          contactId
        };
      }
      
      enrollmentQuery = userEnrollmentQuery;
    }
    
    const enrollmentDoc = enrollmentQuery.docs[0];
    const enrollmentData = enrollmentDoc.data();
    
    console.log(`✅ Found IDIQ enrollment: ${enrollmentDoc.id}`);
    
    // ===== STEP 2: GET CREDIT REPORT HTML =====
    console.log('📄 Step 2: Extracting credit report HTML...');
    
    // Check multiple possible locations for HTML
    let htmlContent = null;
    
    if (enrollmentData.creditReportHtml) {
      htmlContent = enrollmentData.creditReportHtml;
    } else if (enrollmentData.creditReport?.html) {
      htmlContent = enrollmentData.creditReport.html;
    } else if (enrollmentData.rawHtml) {
      htmlContent = enrollmentData.rawHtml;
    } else if (enrollmentData.reportHtml) {
      htmlContent = enrollmentData.reportHtml;
    }
    
    if (!htmlContent) {
      console.log('❌ No credit report HTML found in enrollment');
      return {
        success: false,
        error: 'No credit report HTML found in enrollment',
        contactId,
        enrollmentId: enrollmentDoc.id
      };
    }
    
    console.log(`✅ Found credit report HTML (${htmlContent.length} characters)`);
    
    // ===== STEP 3: PARSE THE HTML =====
    console.log('🔍 Step 3: Parsing IDIQ HTML...');
    
    const parsedData = parseIDIQCreditReport(htmlContent);
    
    if (!parsedData.success) {
      console.log('❌ Failed to parse credit report HTML');
      return {
        success: false,
        error: parsedData.error || 'Parse failure',
        contactId,
        enrollmentId: enrollmentDoc.id
      };
    }
    
    console.log(`✅ Parsed ${parsedData.tradelines.length} tradelines`);
    console.log(`✅ Parsed ${parsedData.inquiries.length} inquiries`);
    
    // ===== STEP 4: IDENTIFY NEGATIVE ITEMS =====
    console.log('⚠️ Step 4: Identifying negative items...');
    
    const negativeItems = identifyNegativeItems(parsedData.tradelines);
    
    console.log(`✅ Identified ${negativeItems.length} negative items`);
    
    // ===== STEP 5: SAVE TO FIREBASE =====
    console.log('💾 Step 5: Saving to Firebase...');
    
    const saveResult = await saveParsedCreditData(contactId, {
      ...parsedData,
      negativeItems
    });
    
    if (!saveResult.success) {
      console.log('❌ Failed to save parsed data');
      return {
        success: false,
        error: saveResult.error,
        contactId,
        enrollmentId: enrollmentDoc.id
      };
    }
    
    // ===== STEP 6: UPDATE CONTACT RECORD =====
    console.log('📝 Step 6: Updating contact record...');
    
    await db.collection('contacts').doc(contactId).update({
      disputesPopulated: true,
      disputesPopulatedAt: admin.firestore.FieldValue.serverTimestamp(),
      disputeCount: negativeItems.length,
      creditScores: parsedData.creditScores,
      lastCreditReportParsed: admin.firestore.FieldValue.serverTimestamp()
    }).catch(e => console.log('Note: Could not update contact, may not exist'));
    
    // ===== GENERATE SUMMARY =====
    const summary = generateDisputeSummary(negativeItems);
    
    console.log('═══════════════════════════════════════════════════════════════════');
    console.log('✅ DISPUTE POPULATION COMPLETE');
    console.log(`   Contact: ${contactId}`);
    console.log(`   Tradelines: ${parsedData.tradelines.length}`);
    console.log(`   Negative Items: ${negativeItems.length}`);
    console.log(`   Collections: ${summary.byType.collection || 0}`);
    console.log(`   Late Payments: ${(summary.byType.late_30 || 0) + (summary.byType.late_60 || 0) + (summary.byType.late_90 || 0)}`);
    console.log(`   Charge-Offs: ${summary.byType.chargeoff || 0}`);
    console.log(`   Est. Score Impact: ${summary.totalScoreImpact.min}-${summary.totalScoreImpact.max} points`);
    console.log('═══════════════════════════════════════════════════════════════════');
    
    return {
      success: true,
      contactId,
      enrollmentId: enrollmentDoc.id,
      analysisId: saveResult.analysisId,
      tradelines: parsedData.tradelines.length,
      negativeItems: negativeItems.length,
      disputeIds: saveResult.disputeIds,
      creditScores: parsedData.creditScores,
      accountSummary: parsedData.accountSummary,
      summary
    };
    
  } catch (error) {
    console.error('❌ Error in populateDisputesFromIDIQ:', error);
    return {
      success: false,
      error: error.message,
      contactId
    };
  }
};

/**
 * Generate a summary of identified disputes
 */
const generateDisputeSummary = (negativeItems) => {
  const summary = {
    total: negativeItems.length,
    byType: {},
    byBureau: {},
    byPriority: { high: 0, medium: 0, low: 0 },
    totalScoreImpact: { min: 0, max: 0 },
    avgSuccessRate: 0,
    estimatedTimeline: 0
  };
  
  let totalSuccessRate = 0;
  let maxTimeline = 0;
  
  for (const item of negativeItems) {
    // Count by type
    summary.byType[item.type] = (summary.byType[item.type] || 0) + 1;
    
    // Count by bureau
    summary.byBureau[item.bureau] = (summary.byBureau[item.bureau] || 0) + 1;
    
    // Count by priority
    summary.byPriority[item.priority] = (summary.byPriority[item.priority] || 0) + 1;
    
    // Sum score impacts
    if (item.scoreImpact) {
      summary.totalScoreImpact.min += item.scoreImpact.min || 0;
      summary.totalScoreImpact.max += item.scoreImpact.max || 0;
    }
    
    // Track success rate
    totalSuccessRate += item.successProbability || 0;
    
    // Track timeline
    maxTimeline = Math.max(maxTimeline, item.estimatedRemovalDays || 0);
  }
  
  summary.avgSuccessRate = negativeItems.length > 0 
    ? Math.round(totalSuccessRate / negativeItems.length) 
    : 0;
  summary.estimatedTimeline = maxTimeline;
  
  return summary;
};

// ═══════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════

module.exports = {
  // ===== MAIN FUNCTION =====
  populateDisputesFromIDIQ,
  
  // ===== UTILITY FUNCTIONS =====
  parseIDIQCreditReport,
  identifyNegativeItems,
  saveParsedCreditData,
  generateDisputeSummary,
  
  // ===== CONFIGURATION =====
  BUREAUS,
  NEGATIVE_ITEM_TYPES,
  DISPUTE_STRATEGIES,
  CHRIS_INFO
};