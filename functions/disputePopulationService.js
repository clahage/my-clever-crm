/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DISPUTE POPULATION SERVICE - UPDATED FOR CREDITREPORTS COLLECTION
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Path: functions/disputePopulationService.js
 * Version: 2.0.0 - Now uses creditReports collection (where data actually lives)
 * 
 * WHAT CHANGED:
 * - Now checks creditReports collection FIRST (primary source)
 * - Falls back to idiqEnrollments if no creditReports found
 * - Parses JSON reportData instead of HTML
 * - Handles both formats for backwards compatibility
 * 
 * COLLECTIONS USED:
 * - creditReports: Primary source (JSON reportData)
 * - idiqEnrollments: Fallback source (HTML reportHtml)
 * - disputes: Where parsed disputable items are stored
 * - contacts: To link disputes to contacts
 * - creditReportAnalysis: Stores parsed credit data for quick access
 * 
 * © 1995-2026 Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved
 * Trademark: Speedy Credit Repair® - USPTO Registered
 * ═══════════════════════════════════════════════════════════════════════════
 */

const admin = require('firebase-admin');

// ═══════════════════════════════════════════════════════════════════════════
// INITIALIZE FIRESTORE (if not already initialized by index.js)
// ═══════════════════════════════════════════════════════════════════════════

function getDb() {
  // Firebase Admin is already initialized by index.js, just get the reference
  return admin.firestore();
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN FUNCTION: Populate Disputes from Credit Report
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Main entry point - called from aiContentGenerator
 * Supports multiple data sources:
 * - creditReports collection (JSON from IDIQ API)
 * - idiqEnrollments collection (HTML reports)
 * - Uploaded PDFs (future)
 * - Uploaded images with OCR (future)
 * 
 * @param {string} contactId - The contact ID to process
 * @param {object} [dbInstance] - Optional Firestore instance (uses default if not provided)
 * @returns {object} - Result with success status and dispute data
 */
async function populateDisputesFromIDIQ(contactId, dbInstance = null) {
  // Use provided db or get default
  const db = dbInstance || getDb();
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('🚀 disputePopulationService: Processing contact', contactId);
  console.log('═══════════════════════════════════════════════════════════════════');
  
  try {
    // ═════════════════════════════════════════════════════════════════════════
    // STEP 1: Try to fetch from creditReports collection FIRST
    // ═════════════════════════════════════════════════════════════════════════
    
    console.log('📥 Step 1: Fetching credit report from creditReports collection...');
    
    let reportData = null;
    let reportSource = null;
    let enrollmentId = null;
    
    // Try creditReports first (primary source)
    const creditReportQuery = await db.collection('creditReports')
      .where('contactId', '==', contactId)
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();
    
    if (!creditReportQuery.empty) {
      const reportDoc = creditReportQuery.docs[0];
      enrollmentId = reportDoc.id;
      reportData = reportDoc.data().reportData;
      reportSource = 'creditReports';
      console.log('✅ Found credit report in creditReports:', enrollmentId);
      console.log('📄 Report data type:', typeof reportData);
    }
    
    // ═════════════════════════════════════════════════════════════════════════
    // STEP 1B: Fallback to idiqEnrollments if no creditReports found
    // ═════════════════════════════════════════════════════════════════════════
    
    if (!reportData) {
      console.log('⚠️ No creditReports found, trying idiqEnrollments...');
      
      // Try with createdAt first
      let enrollmentQuery = await db.collection('idiqEnrollments')
        .where('contactId', '==', contactId)
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get();
      
      // If empty, try with enrolledAt
      if (enrollmentQuery.empty) {
        console.log('⚠️ Trying with enrolledAt timestamp...');
        enrollmentQuery = await db.collection('idiqEnrollments')
          .where('contactId', '==', contactId)
          .orderBy('enrolledAt', 'desc')
          .limit(1)
          .get();
      }
      
      // If still empty, try without ordering (in case timestamp is missing)
      if (enrollmentQuery.empty) {
        console.log('⚠️ Trying without timestamp ordering...');
        enrollmentQuery = await db.collection('idiqEnrollments')
          .where('contactId', '==', contactId)
          .limit(1)
          .get();
      }
      
      if (!enrollmentQuery.empty) {
        const enrollmentDoc = enrollmentQuery.docs[0];
        enrollmentId = enrollmentDoc.id;
        const enrollmentData = enrollmentDoc.data();
        
        // Check for reportHtml (old format)
        if (enrollmentData.reportHtml) {
          reportData = enrollmentData.reportHtml;
          reportSource = 'idiqEnrollments-html';
          console.log('✅ Found HTML report in idiqEnrollments:', enrollmentId);
        }
        // Check for reportJson (new format)
        else if (enrollmentData.reportJson) {
          try {
            reportData = JSON.parse(enrollmentData.reportJson);
            reportSource = 'idiqEnrollments-json';
            console.log('✅ Found JSON report in idiqEnrollments:', enrollmentId);
          } catch (e) {
            console.log('⚠️ Could not parse reportJson');
          }
        }
      }
    }
    
    // ═════════════════════════════════════════════════════════════════════════
    // STEP 2: Validate we have report data
    // ═════════════════════════════════════════════════════════════════════════
    
    if (!reportData) {
      console.log('❌ No credit report found for contact:', contactId);
      return {
        success: false,
        error: 'No credit report found',
        contactId,
        message: 'No credit report found in creditReports or idiqEnrollments collections. Please ensure the client has completed IDIQ enrollment and their credit report has been pulled.'
      };
    }
    
    console.log('✅ Found credit report from:', reportSource);
    console.log('📄 Report data type:', typeof reportData);
    
    // ═════════════════════════════════════════════════════════════════════════
    // STEP 3: Parse credit report data
    // ═════════════════════════════════════════════════════════════════════════
    
    console.log('🔍 Step 3: Parsing credit report data...');
    
    let parsedData;
    
    if (typeof reportData === 'string') {
      // HTML format - parse with cheerio or regex
      console.log('🔍 Parsing HTML format...');
      parsedData = parseHTMLReport(reportData);
    } else if (typeof reportData === 'object') {
      // JSON format - parse directly
      console.log('🔍 Parsing JSON format...');
      parsedData = parseJSONReport(reportData);
    } else {
      console.log('❌ Unknown report format:', typeof reportData);
      return {
        success: false,
        error: 'Unknown report format',
        contactId
      };
    }
    
    console.log('📊 Credit Scores - TU:', parsedData.scores.transunion, 
                'EXP:', parsedData.scores.experian, 
                'EQF:', parsedData.scores.equifax);
    console.log('📋 Total tradelines found:', parsedData.tradelines.length);
    console.log('🔍 Total inquiries found:', parsedData.inquiries.length);
    
    // ═════════════════════════════════════════════════════════════════════════
    // STEP 4: Identify negative/disputable items
    // ═════════════════════════════════════════════════════════════════════════
    
    console.log('⚠️ Step 4: Identifying negative items...');
    
    const negativeItems = identifyNegativeItems(parsedData);
    
    console.log('⚠️ Total negative items identified:', negativeItems.length);
    
    // ═════════════════════════════════════════════════════════════════════════
    // STEP 5: Save parsed data and create disputes
    // ═════════════════════════════════════════════════════════════════════════
    
    console.log('💾 Step 5: Saving to Firebase...');
    
    // Save parsed credit data for quick access
    const creditAnalysis = {
      contactId,
      enrollmentId,
      reportSource,
      scores: parsedData.scores,
      accountSummary: parsedData.accountSummary,
      tradelineCount: parsedData.tradelines.length,
      inquiryCount: parsedData.inquiries.length,
      negativeItemCount: negativeItems.length,
      parsedAt: admin.firestore.FieldValue.serverTimestamp(),
      tradelines: parsedData.tradelines.map(t => ({
        creditorName: t.creditorName,
        accountNumber: t.accountNumber,
        accountType: t.accountType,
        balance: t.balance,
        paymentStatus: t.paymentStatus,
        bureaus: t.bureaus
      }))
    };
    
    const analysisRef = await db.collection('creditReportAnalysis').add(creditAnalysis);
    console.log('✅ Saved credit analysis:', analysisRef.id);
    
    // Create dispute documents for negative items
    const disputeIds = [];
    const disputeSummary = {
      total: 0,
      byType: {
        collection: 0,
        latePayment: 0,
        chargeOff: 0,
        inquiry: 0,
        publicRecord: 0,
        other: 0
      },
      byBureau: {
        transunion: 0,
        experian: 0,
        equifax: 0
      },
      byPriority: {
        high: 0,
        medium: 0,
        low: 0
      },
      totalScoreImpact: {
        min: 0,
        max: 0
      }
    };
    
    // ═══════════════════════════════════════════════════════════════════════════
    // DUPLICATE DETECTION: Get existing disputes for this contact
    // ═══════════════════════════════════════════════════════════════════════════
    console.log('🔍 Checking for existing disputes to prevent duplicates...');
    
    const existingDisputesSnap = await db.collection('disputes')
      .where('contactId', '==', contactId)
      .get();
    
    const existingAccountNumbers = new Set();
    existingDisputesSnap.docs.forEach(doc => {
      const data = doc.data();
      if (data.accountNumber) {
        existingAccountNumbers.add(data.accountNumber);
      }
    });
    
    console.log(`📋 Found ${existingAccountNumbers.size} existing disputes for this contact`);
    
    let skippedDuplicates = 0;
    
    for (const item of negativeItems) {
      // ═══════════════════════════════════════════════════════════════════════
      // SKIP if dispute already exists for this account number
      // ═══════════════════════════════════════════════════════════════════════
      if (existingAccountNumbers.has(item.accountNumber)) {
        console.log(`⏭️ Skipping duplicate: ${item.creditorName} (${item.accountNumber})`);
        skippedDuplicates++;
        continue;
      }
      
      const disputeDoc = {
        contactId,
        creditReportId: enrollmentId,
        analysisId: analysisRef.id,
        
        // Item details
        creditorName: item.creditorName,
        accountNumber: item.accountNumber,
        accountType: item.accountType,
        balance: item.balance,
        paymentStatus: item.paymentStatus,
        negativeReason: item.negativeReason,
        
        // Bureau info
        bureaus: item.bureaus,
        bureauDetails: item.bureauDetails || {},
        
        // Dispute metadata
        priority: item.priority,
        estimatedScoreImpact: item.estimatedScoreImpact,
        recommendedStrategy: item.recommendedStrategy,
        suggestedDisputeReason: item.suggestedDisputeReason,
        
        // Status tracking
        status: 'pending',
        stage: 'identified',
        
        // Timestamps
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        
        // Source
        source: 'auto_scan',
        scanSource: reportSource
      };
      
      const disputeRef = await db.collection('disputes').add(disputeDoc);
      disputeIds.push(disputeRef.id);
      
      // Update summary
      disputeSummary.total++;
      disputeSummary.byType[item.category] = (disputeSummary.byType[item.category] || 0) + 1;
      disputeSummary.byPriority[item.priority] = (disputeSummary.byPriority[item.priority] || 0) + 1;
      
      // Count bureaus
      if (item.bureaus.includes('TU') || item.bureaus.includes('TUC') || item.bureaus.includes('TransUnion')) {
        disputeSummary.byBureau.transunion++;
      }
      if (item.bureaus.includes('EXP') || item.bureaus.includes('Experian')) {
        disputeSummary.byBureau.experian++;
      }
      if (item.bureaus.includes('EQF') || item.bureaus.includes('Equifax')) {
        disputeSummary.byBureau.equifax++;
      }
      
      // Sum score impact
      disputeSummary.totalScoreImpact.min += item.estimatedScoreImpact?.min || 0;
      disputeSummary.totalScoreImpact.max += item.estimatedScoreImpact?.max || 0;
    }
    
    console.log('✅ Saved', disputeIds.length, 'disputable items');
    
    // ═════════════════════════════════════════════════════════════════════════
    // STEP 6: Update contact record
    // ═════════════════════════════════════════════════════════════════════════
    
    console.log('📝 Step 6: Updating contact record...');
    
    await db.collection('contacts').doc(contactId).update({
      'disputes.lastScan': admin.firestore.FieldValue.serverTimestamp(),
      'disputes.itemCount': negativeItems.length,
      'disputes.analysisId': analysisRef.id,
      'creditReport.lastAnalyzed': admin.firestore.FieldValue.serverTimestamp(),
      'creditReport.negativeItems': negativeItems.length,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // ═════════════════════════════════════════════════════════════════════════
    // COMPLETE
    // ═════════════════════════════════════════════════════════════════════════
    
    console.log('═══════════════════════════════════════════════════════════════════');
    console.log('✅ DISPUTE POPULATION COMPLETE');
    console.log('   Contact:', contactId);
    console.log('   Source:', reportSource);
    console.log('   Tradelines:', parsedData.tradelines.length);
    console.log('   Negative Items:', negativeItems.length);
    console.log('   Disputes Created:', disputeIds.length);
    console.log('   Est. Score Impact:', disputeSummary.totalScoreImpact.min, '-', disputeSummary.totalScoreImpact.max, 'points');
    console.log('   Duplicates Skipped:', skippedDuplicates);
    console.log('═══════════════════════════════════════════════════════════════════');
    
    return {
      success: true,
      contactId,
      enrollmentId,
      reportSource,
      disputeCount: disputeIds.length,
      disputeIds,
      summary: disputeSummary,
      creditScores: parsedData.scores,
      skippedDuplicates,
      totalScanned: negativeItems.length,
      message: `Created ${disputeIds.length} new disputes from ${negativeItems.length} negative items${skippedDuplicates > 0 ? ` (${skippedDuplicates} duplicates skipped)` : ''}`
    };
    
  } catch (error) {
    console.error('❌ disputePopulationService error:', error);
    return {
      success: false,
      error: error.message,
      contactId
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PARSE JSON REPORT (Primary Format from IDIQ API)
// ═══════════════════════════════════════════════════════════════════════════

function parseJSONReport(reportData) {
  console.log('🔍 parseJSONReport: Starting JSON parsing...');
  
  const result = {
    scores: {
      transunion: 0,
      experian: 0,
      equifax: 0
    },
    accountSummary: {
      totalAccounts: 0,
      openAccounts: 0,
      closedAccounts: 0,
      delinquentAccounts: 0,
      derogatoryAccounts: 0,
      collectionAccounts: 0
    },
    tradelines: [],
    inquiries: [],
    publicRecords: []
  };
  
  try {
    // ═════════════════════════════════════════════════════════════════════════
    // EXTRACT CREDIT SCORES
    // ═════════════════════════════════════════════════════════════════════════
    
    // Try various paths where scores might be
    if (reportData.bureaus) {
      result.scores.transunion = reportData.bureaus.transunion?.score || 
                                 reportData.bureaus.tu?.score || 0;
      result.scores.experian = reportData.bureaus.experian?.score || 
                               reportData.bureaus.exp?.score || 0;
      result.scores.equifax = reportData.bureaus.equifax?.score || 
                              reportData.bureaus.eqf?.score || 0;
    }
    
    if (reportData.scores) {
      result.scores.transunion = reportData.scores.transunion || 
                                 reportData.scores.tu || result.scores.transunion;
      result.scores.experian = reportData.scores.experian || 
                               reportData.scores.exp || result.scores.experian;
      result.scores.equifax = reportData.scores.equifax || 
                              reportData.scores.eqf || result.scores.equifax;
    }
    
    // Direct score fields
    result.scores.transunion = reportData.transunionScore || 
                               reportData.tuScore || result.scores.transunion;
    result.scores.experian = reportData.experianScore || 
                             reportData.expScore || result.scores.experian;
    result.scores.equifax = reportData.equifaxScore || 
                            reportData.eqfScore || result.scores.equifax;
    
    // Vantage score as fallback
    if (reportData.vantageScore && !result.scores.transunion) {
      result.scores.transunion = reportData.vantageScore;
      result.scores.experian = reportData.vantageScore;
      result.scores.equifax = reportData.vantageScore;
    }
    
    console.log('📊 Extracted scores:', result.scores);
    
    // ═════════════════════════════════════════════════════════════════════════
    // EXTRACT TRADELINES/ACCOUNTS
    // ═════════════════════════════════════════════════════════════════════════
    
    const tradelines = reportData.tradelines || 
                       reportData.accounts || 
                       reportData.tradelineAccounts ||
                       reportData.creditAccounts ||
                       reportData.tradeLines ||
                       [];
    
    console.log('📋 Found', tradelines.length, 'tradelines in report');
    
    for (const trade of tradelines) {
      const tradeline = {
        creditorName: trade.creditorName || trade.accountName || trade.companyName || 
                      trade.subscriberName || trade.name || 'Unknown',
        accountNumber: trade.accountNumber || trade.accountNum || trade.acctNumber || '****',
        accountType: trade.accountType || trade.type || trade.accountTypeDescription || 'Unknown',
        accountStatus: trade.accountStatus || trade.status || trade.accountCondition || 'Unknown',
        balance: parseFloat(trade.balance || trade.currentBalance || trade.balanceAmount || 0),
        creditLimit: parseFloat(trade.creditLimit || trade.highCredit || 0),
        paymentStatus: trade.paymentStatus || trade.payStatus || trade.conditionCode || 
                       trade.accountRating || 'Unknown',
        dateOpened: trade.dateOpened || trade.openDate || trade.accountOpenedDate || null,
        dateReported: trade.dateReported || trade.reportedDate || null,
        lastPaymentDate: trade.lastPaymentDate || trade.lastPayment || null,
        monthsReviewed: trade.monthsReviewed || trade.termsMonths || 0,
        
        // Payment history
        paymentHistory: trade.paymentHistory || trade.paymentPattern || null,
        latePayments: {
          '30': trade.late30 || trade.times30DaysLate || 0,
          '60': trade.late60 || trade.times60DaysLate || 0,
          '90': trade.late90 || trade.times90DaysLate || 0
        },
        
        // Bureau reporting
        bureaus: extractBureaus(trade),
        bureauDetails: {
          transunion: trade.transunion || trade.tu || trade.bureaus?.transunion || null,
          experian: trade.experian || trade.exp || trade.bureaus?.experian || null,
          equifax: trade.equifax || trade.eqf || trade.bureaus?.equifax || null
        },
        
        // Raw data for reference
        rawData: trade
      };
      
      result.tradelines.push(tradeline);
      
      // Update account summary
      result.accountSummary.totalAccounts++;
      
      const status = (tradeline.accountStatus || '').toLowerCase();
      const payStatus = (tradeline.paymentStatus || '').toLowerCase();
      
      if (status.includes('open') || status.includes('active')) {
        result.accountSummary.openAccounts++;
      } else if (status.includes('closed')) {
        result.accountSummary.closedAccounts++;
      }
      
      if (status.includes('delinquent') || payStatus.includes('late') || 
          payStatus.includes('past due')) {
        result.accountSummary.delinquentAccounts++;
      }
      
      if (status.includes('derogatory') || status.includes('negative') ||
          payStatus.includes('chargeoff') || payStatus.includes('charge-off') ||
          payStatus.includes('collection')) {
        result.accountSummary.derogatoryAccounts++;
      }
      
      if (tradeline.accountType?.toLowerCase().includes('collection') ||
          status.includes('collection')) {
        result.accountSummary.collectionAccounts++;
      }
    }
    
    // ═════════════════════════════════════════════════════════════════════════
    // EXTRACT INQUIRIES
    // ═════════════════════════════════════════════════════════════════════════
    
    const inquiries = reportData.inquiries || 
                      reportData.creditInquiries ||
                      reportData.hardInquiries ||
                      [];
    
    console.log('🔍 Found', inquiries.length, 'inquiries');
    
    for (const inq of inquiries) {
      result.inquiries.push({
        creditorName: inq.creditorName || inq.companyName || inq.subscriberName || 'Unknown',
        inquiryDate: inq.inquiryDate || inq.date || inq.dateOfInquiry || null,
        inquiryType: inq.inquiryType || inq.type || 'Hard',
        bureaus: extractBureaus(inq),
        rawData: inq
      });
    }
    
    // ═════════════════════════════════════════════════════════════════════════
    // EXTRACT PUBLIC RECORDS
    // ═════════════════════════════════════════════════════════════════════════
    
    const publicRecords = reportData.publicRecords || 
                          reportData.publicRecord ||
                          [];
    
    for (const record of publicRecords) {
      result.publicRecords.push({
        type: record.type || record.publicRecordType || 'Unknown',
        court: record.court || record.courtName || null,
        filedDate: record.filedDate || record.dateReported || null,
        status: record.status || 'Unknown',
        bureaus: extractBureaus(record),
        rawData: record
      });
    }
    
    console.log('📊 Account Summary:', result.accountSummary);
    
  } catch (error) {
    console.error('❌ Error parsing JSON report:', error);
  }
  
  return result;
}

// ═══════════════════════════════════════════════════════════════════════════
// PARSE HTML REPORT (Fallback for legacy data)
// ═══════════════════════════════════════════════════════════════════════════

function parseHTMLReport(htmlString) {
  console.log('🔍 parseHTMLReport: Starting HTML parsing...');
  console.log('📄 HTML length:', htmlString.length, 'characters');
  
  const result = {
    scores: {
      transunion: 0,
      experian: 0,
      equifax: 0
    },
    accountSummary: {
      totalAccounts: 0,
      openAccounts: 0,
      closedAccounts: 0,
      delinquentAccounts: 0,
      derogatoryAccounts: 0,
      collectionAccounts: 0
    },
    tradelines: [],
    inquiries: [],
    publicRecords: []
  };
  
  try {
    // Try to use cheerio if available
    let $;
    try {
      const cheerio = require('cheerio');
      $ = cheerio.load(htmlString);
      console.log('✅ Using Cheerio for HTML parsing');
    } catch (e) {
      console.log('⚠️ Cheerio not available, using regex parsing');
      return parseHTMLWithRegex(htmlString, result);
    }
    
    // ═════════════════════════════════════════════════════════════════════════
    // PARSE TRADELINES FROM HTML
    // ═════════════════════════════════════════════════════════════════════════
    
    // Look for tradeline divs
    $('.tradeline, .account, .trade-line, [data-account]').each((i, el) => {
      const tradeline = {
        creditorName: $(el).find('h3, .creditor-name, .account-name').first().text().trim() ||
                      $(el).attr('data-account') || 'Unknown',
        accountNumber: extractTableValue($, el, 'Account #') || 
                       extractTableValue($, el, 'Account Number') || '****',
        accountType: extractTableValue($, el, 'Account Type') || 'Unknown',
        accountStatus: extractTableValue($, el, 'Account Status') || 'Unknown',
        balance: parseFloat(extractTableValue($, el, 'Balance')?.replace(/[$,]/g, '') || 0),
        paymentStatus: extractTableValue($, el, 'Payment Status') || 'Unknown',
        dateOpened: extractTableValue($, el, 'Date Opened') || null,
        bureaus: [],
        bureauDetails: {}
      };
      
      // Extract bureau reporting
      $(el).find('.bureau, [data-bureau]').each((j, bureau) => {
        const bureauCode = $(bureau).attr('data-bureau') || $(bureau).text().trim();
        if (bureauCode) {
          tradeline.bureaus.push(bureauCode);
        }
      });
      
      // If no bureaus found, default to all three
      if (tradeline.bureaus.length === 0) {
        tradeline.bureaus = ['TUC', 'EXP', 'EQF'];
      }
      
      result.tradelines.push(tradeline);
      result.accountSummary.totalAccounts++;
      
      // Categorize
      const status = tradeline.accountStatus.toLowerCase();
      const payStatus = tradeline.paymentStatus.toLowerCase();
      
      if (status.includes('derogatory') || payStatus.includes('collection') || 
          payStatus.includes('chargeoff')) {
        result.accountSummary.derogatoryAccounts++;
      }
    });
    
    // ═════════════════════════════════════════════════════════════════════════
    // PARSE INQUIRIES FROM HTML
    // ═════════════════════════════════════════════════════════════════════════
    
    $('.inquiry, .credit-inquiry, [data-creditor]').each((i, el) => {
      result.inquiries.push({
        creditorName: $(el).find('.creditor').text().trim() || 
                      $(el).attr('data-creditor') || 'Unknown',
        inquiryDate: $(el).find('.date').text().trim() || null,
        inquiryType: $(el).find('.type').text().trim() || 'Hard',
        bureaus: ['TUC', 'EXP', 'EQF']
      });
    });
    
    console.log('📋 Parsed', result.tradelines.length, 'tradelines from HTML');
    console.log('🔍 Parsed', result.inquiries.length, 'inquiries from HTML');
    
  } catch (error) {
    console.error('❌ Error parsing HTML report:', error);
  }
  
  return result;
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER: Parse HTML with Regex (fallback)
// ═══════════════════════════════════════════════════════════════════════════

function parseHTMLWithRegex(htmlString, result) {
  console.log('🔍 Using regex fallback for HTML parsing...');
  
  // Extract tradelines using regex
  const tradelineRegex = /<div[^>]*class="[^"]*tradeline[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;
  let match;
  
  while ((match = tradelineRegex.exec(htmlString)) !== null) {
    const tradelineHtml = match[1];
    
    const tradeline = {
      creditorName: extractRegexValue(tradelineHtml, /<h3[^>]*>(.*?)<\/h3>/i) || 'Unknown',
      accountNumber: extractRegexValue(tradelineHtml, /Account #[^<]*<\/td>\s*<td[^>]*>([^<]+)/i) || '****',
      accountType: extractRegexValue(tradelineHtml, /Account Type[^<]*<\/td>\s*<td[^>]*>([^<]+)/i) || 'Unknown',
      accountStatus: extractRegexValue(tradelineHtml, /Account Status[^<]*<\/td>\s*<td[^>]*>([^<]+)/i) || 'Unknown',
      balance: parseFloat(extractRegexValue(tradelineHtml, /Balance[^<]*<\/td>\s*<td[^>]*>\$?([^<]+)/i)?.replace(/[$,]/g, '') || 0),
      paymentStatus: extractRegexValue(tradelineHtml, /Payment Status[^<]*<\/td>\s*<td[^>]*>([^<]+)/i) || 'Unknown',
      dateOpened: extractRegexValue(tradelineHtml, /Date Opened[^<]*<\/td>\s*<td[^>]*>([^<]+)/i) || null,
      bureaus: []
    };
    
    // Extract bureaus
    const bureauRegex = /data-bureau="([^"]+)"/gi;
    let bureauMatch;
    while ((bureauMatch = bureauRegex.exec(tradelineHtml)) !== null) {
      tradeline.bureaus.push(bureauMatch[1]);
    }
    
    if (tradeline.bureaus.length === 0) {
      tradeline.bureaus = ['TUC', 'EXP', 'EQF'];
    }
    
    result.tradelines.push(tradeline);
    result.accountSummary.totalAccounts++;
  }
  
  console.log('📋 Regex parsed', result.tradelines.length, 'tradelines');
  
  return result;
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER: Extract bureaus from any object
// ═══════════════════════════════════════════════════════════════════════════

function extractBureaus(item) {
  const bureaus = [];
  
  // Check explicit bureau fields
  if (item.transunion || item.tu || item.TU) bureaus.push('TU');
  if (item.experian || item.exp || item.EXP) bureaus.push('EXP');
  if (item.equifax || item.eqf || item.EQF) bureaus.push('EQF');
  
  // Check bureaus array
  if (Array.isArray(item.bureaus)) {
    for (const b of item.bureaus) {
      if (typeof b === 'string') {
        if (b.toLowerCase().includes('trans')) bureaus.push('TU');
        else if (b.toLowerCase().includes('exp')) bureaus.push('EXP');
        else if (b.toLowerCase().includes('equi')) bureaus.push('EQF');
        else bureaus.push(b);
      }
    }
  }
  
  // Check reportingBureaus
  if (item.reportingBureaus) {
    if (item.reportingBureaus.transunion) bureaus.push('TU');
    if (item.reportingBureaus.experian) bureaus.push('EXP');
    if (item.reportingBureaus.equifax) bureaus.push('EQF');
  }
  
  // Default to all three if none found
  if (bureaus.length === 0) {
    return ['TU', 'EXP', 'EQF'];
  }
  
  // Deduplicate
  return [...new Set(bureaus)];
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER: Extract table value from HTML element
// ═══════════════════════════════════════════════════════════════════════════

function extractTableValue($, el, label) {
  const row = $(el).find(`td:contains("${label}")`).closest('tr');
  return row.find('td').last().text().trim() || null;
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER: Extract value using regex
// ═══════════════════════════════════════════════════════════════════════════

function extractRegexValue(html, regex) {
  const match = html.match(regex);
  return match ? match[1].trim() : null;
}

// ═══════════════════════════════════════════════════════════════════════════
// IDENTIFY NEGATIVE ITEMS FOR DISPUTE
// ═══════════════════════════════════════════════════════════════════════════

function identifyNegativeItems(parsedData) {
  console.log('🔎 disputePopulationService: Identifying negative items...');
  
  const negativeItems = [];
  
  // ═════════════════════════════════════════════════════════════════════════
  // CHECK TRADELINES FOR NEGATIVE ITEMS
  // ═════════════════════════════════════════════════════════════════════════
  
  for (const tradeline of parsedData.tradelines) {
    const status = (tradeline.accountStatus || '').toLowerCase();
    const payStatus = (tradeline.paymentStatus || '').toLowerCase();
    const accountType = (tradeline.accountType || '').toLowerCase();
    
    let isNegative = false;
    let negativeReason = '';
    let category = 'other';
    let priority = 'low';
    let estimatedImpact = { min: 0, max: 0 };
    let strategy = '';
    let disputeReason = '';
    
    // ═══════════════════════════════════════════════════════════════════════
    // COLLECTION ACCOUNTS - HIGH PRIORITY
    // ═══════════════════════════════════════════════════════════════════════
    
    if (accountType.includes('collection') || status.includes('collection') ||
        payStatus.includes('collection')) {
      isNegative = true;
      negativeReason = 'Collection Account';
      category = 'collection';
      priority = 'high';
      estimatedImpact = { min: 50, max: 100 };
      strategy = 'Request debt validation, dispute accuracy of amount and dates';
      disputeReason = 'This collection account is not accurate. Please provide complete documentation including the original creditor agreement, chain of custody, and itemized accounting of the balance claimed.';
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // CHARGE-OFFS - HIGH PRIORITY
    // ═══════════════════════════════════════════════════════════════════════
    
    else if (payStatus.includes('chargeoff') || payStatus.includes('charge-off') ||
             payStatus.includes('charge off') || status.includes('charged off')) {
      isNegative = true;
      negativeReason = 'Charge-Off';
      category = 'chargeOff';
      priority = 'high';
      estimatedImpact = { min: 40, max: 80 };
      strategy = 'Dispute balance accuracy, request validation of debt';
      disputeReason = 'This charge-off is being reported inaccurately. The balance, dates, and payment history contain errors that require investigation and correction.';
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // LATE PAYMENTS - MEDIUM PRIORITY
    // ═══════════════════════════════════════════════════════════════════════
    
    else if (payStatus.includes('late') || payStatus.includes('past due') ||
             payStatus.includes('30 days') || payStatus.includes('60 days') ||
             payStatus.includes('90 days') || payStatus.includes('120 days')) {
      isNegative = true;
      negativeReason = 'Late Payment History';
      category = 'latePayment';
      priority = 'medium';
      estimatedImpact = { min: 15, max: 40 };
      strategy = 'Request goodwill adjustment or dispute accuracy of reported late payments';
      disputeReason = 'The late payment(s) reported on this account are not accurate. Please verify the payment dates and provide documentation supporting the reported delinquency.';
    }
    
    // Check late payment counts
    else if (tradeline.latePayments) {
      const totalLate = (tradeline.latePayments['30'] || 0) +
                        (tradeline.latePayments['60'] || 0) +
                        (tradeline.latePayments['90'] || 0);
      
      if (totalLate > 0) {
        isNegative = true;
        negativeReason = `${totalLate} Late Payment(s) Reported`;
        category = 'latePayment';
        priority = totalLate > 3 ? 'high' : 'medium';
        estimatedImpact = { min: 10 * totalLate, max: 25 * totalLate };
        strategy = 'Request goodwill adjustment or dispute payment reporting dates';
        disputeReason = 'The late payment history on this account contains inaccuracies. Please provide complete payment records to verify the reported delinquencies.';
      }
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // DEROGATORY STATUS - MEDIUM PRIORITY
    // ═══════════════════════════════════════════════════════════════════════
    
    else if (status.includes('derogatory') || status.includes('negative')) {
      isNegative = true;
      negativeReason = 'Derogatory Status';
      category = 'other';
      priority = 'medium';
      estimatedImpact = { min: 20, max: 50 };
      strategy = 'Request full account verification and documentation';
      disputeReason = 'This account is reporting a derogatory status that I believe to be inaccurate. Please investigate and provide documentation supporting this status.';
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // ADD TO NEGATIVE ITEMS IF APPLICABLE
    // ═══════════════════════════════════════════════════════════════════════
    
    if (isNegative) {
      negativeItems.push({
        ...tradeline,
        negativeReason,
        category,
        priority,
        estimatedScoreImpact: estimatedImpact,
        recommendedStrategy: strategy,
        suggestedDisputeReason: disputeReason,
        itemType: 'tradeline'
      });
    }
  }
  
  // ═════════════════════════════════════════════════════════════════════════
  // CHECK INQUIRIES (OPTIONAL - LOWER PRIORITY)
  // ═════════════════════════════════════════════════════════════════════════
  
  const recentInquiries = parsedData.inquiries.filter(inq => {
    if (!inq.inquiryDate) return true; // Include if no date
    
    const inquiryDate = new Date(inq.inquiryDate);
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    
    return inquiryDate > twoYearsAgo;
  });
  
  // Only flag excessive inquiries
  if (recentInquiries.length > 5) {
    for (const inquiry of recentInquiries.slice(5)) { // Skip first 5
      negativeItems.push({
        creditorName: inquiry.creditorName,
        accountNumber: 'N/A',
        accountType: 'Hard Inquiry',
        negativeReason: 'Excessive Hard Inquiry',
        category: 'inquiry',
        priority: 'low',
        estimatedScoreImpact: { min: 2, max: 5 },
        recommendedStrategy: 'Dispute unauthorized inquiry',
        suggestedDisputeReason: 'I do not recall authorizing this inquiry. Please provide proof of authorization or remove this inquiry from my credit report.',
        bureaus: inquiry.bureaus,
        itemType: 'inquiry'
      });
    }
  }
  
  // ═════════════════════════════════════════════════════════════════════════
  // CHECK PUBLIC RECORDS - HIGHEST PRIORITY
  // ═════════════════════════════════════════════════════════════════════════
  
  for (const record of parsedData.publicRecords) {
    negativeItems.push({
      creditorName: record.court || 'Public Record',
      accountNumber: 'N/A',
      accountType: record.type,
      negativeReason: `Public Record: ${record.type}`,
      category: 'publicRecord',
      priority: 'high',
      estimatedScoreImpact: { min: 50, max: 150 },
      recommendedStrategy: 'Verify accuracy of all details, request court documentation',
      suggestedDisputeReason: 'This public record contains inaccuracies and should be investigated. Please verify all details with the court records.',
      bureaus: record.bureaus,
      itemType: 'publicRecord'
    });
  }
  
  console.log('⚠️ Total negative items identified:', negativeItems.length);
  
  return negativeItems;
}

// ═══════════════════════════════════════════════════════════════════════════
// MULTI-SOURCE PARSER: Detect and Route to Appropriate Parser
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Parse credit report from any source
 * Supports: JSON, HTML, PDF (future), Image/OCR (future)
 * 
 * @param {string|object|Buffer} data - The credit report data
 * @param {string} sourceType - 'json', 'html', 'pdf', 'image', or 'auto'
 * @returns {object} - Parsed credit report data
 */
async function parseFromAnySource(data, sourceType = 'auto') {
  console.log('🔄 parseFromAnySource: Detecting source type...');
  
  let detectedType = sourceType;
  
  // ═════════════════════════════════════════════════════════════════════════
  // AUTO-DETECT SOURCE TYPE
  // ═════════════════════════════════════════════════════════════════════════
  
  if (sourceType === 'auto') {
    if (typeof data === 'object' && !Buffer.isBuffer(data)) {
      detectedType = 'json';
    } else if (typeof data === 'string') {
      if (data.trim().startsWith('{') || data.trim().startsWith('[')) {
        // Might be JSON string
        try {
          JSON.parse(data);
          detectedType = 'json';
        } catch {
          detectedType = 'html';
        }
      } else if (data.includes('<html') || data.includes('<body') || data.includes('<div')) {
        detectedType = 'html';
      } else if (data.startsWith('%PDF')) {
        detectedType = 'pdf';
      } else {
        // Default to HTML for unknown strings
        detectedType = 'html';
      }
    } else if (Buffer.isBuffer(data)) {
      // Check magic bytes
      const header = data.slice(0, 4).toString();
      if (header === '%PDF') {
        detectedType = 'pdf';
      } else if (data[0] === 0xFF && data[1] === 0xD8) {
        detectedType = 'image'; // JPEG
      } else if (data[0] === 0x89 && data.slice(1, 4).toString() === 'PNG') {
        detectedType = 'image'; // PNG
      } else {
        detectedType = 'unknown';
      }
    }
  }
  
  console.log('📋 Detected source type:', detectedType);
  
  // ═════════════════════════════════════════════════════════════════════════
  // ROUTE TO APPROPRIATE PARSER
  // ═════════════════════════════════════════════════════════════════════════
  
  switch (detectedType) {
    case 'json':
      const jsonData = typeof data === 'string' ? JSON.parse(data) : data;
      return parseJSONReport(jsonData);
      
    case 'html':
      return parseHTMLReport(data);
      
    case 'pdf':
      return await parsePDFReport(data);
      
    case 'image':
      return await parseImageReport(data);
      
    default:
      console.log('⚠️ Unknown source type, attempting HTML parse');
      return parseHTMLReport(String(data));
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PDF PARSER (Placeholder for future implementation)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Parse credit report from PDF
 * Requires: pdf-parse or similar library
 * 
 * @param {Buffer|string} pdfData - PDF file data or path
 * @returns {object} - Parsed credit report data
 */
async function parsePDFReport(pdfData) {
  console.log('📄 parsePDFReport: Starting PDF parsing...');
  
  try {
    // Try to load pdf-parse if available
    let pdfParse;
    try {
      pdfParse = require('pdf-parse');
    } catch (e) {
      console.log('⚠️ pdf-parse not installed. Install with: npm install pdf-parse');
      return {
        success: false,
        error: 'PDF parsing not available. Install pdf-parse package.',
        scores: { transunion: 0, experian: 0, equifax: 0 },
        accountSummary: { totalAccounts: 0 },
        tradelines: [],
        inquiries: [],
        publicRecords: []
      };
    }
    
    // Parse PDF
    const pdfResult = await pdfParse(pdfData);
    const text = pdfResult.text;
    
    console.log('📋 Extracted', text.length, 'characters from PDF');
    
    // Parse the extracted text
    return parseTextReport(text);
    
  } catch (error) {
    console.error('❌ PDF parsing error:', error);
    return {
      success: false,
      error: error.message,
      scores: { transunion: 0, experian: 0, equifax: 0 },
      accountSummary: { totalAccounts: 0 },
      tradelines: [],
      inquiries: [],
      publicRecords: []
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// IMAGE/OCR PARSER (Placeholder for future implementation)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Parse credit report from image using OCR
 * Requires: Tesseract.js or Google Cloud Vision
 * 
 * @param {Buffer|string} imageData - Image file data or path
 * @returns {object} - Parsed credit report data
 */
async function parseImageReport(imageData) {
  console.log('🖼️ parseImageReport: Starting OCR...');
  
  try {
    // Try to load tesseract if available
    let Tesseract;
    try {
      Tesseract = require('tesseract.js');
    } catch (e) {
      console.log('⚠️ tesseract.js not installed. Install with: npm install tesseract.js');
      return {
        success: false,
        error: 'OCR not available. Install tesseract.js package.',
        scores: { transunion: 0, experian: 0, equifax: 0 },
        accountSummary: { totalAccounts: 0 },
        tradelines: [],
        inquiries: [],
        publicRecords: []
      };
    }
    
    // Run OCR
    const result = await Tesseract.recognize(imageData, 'eng');
    const text = result.data.text;
    
    console.log('📋 Extracted', text.length, 'characters via OCR');
    
    // Parse the extracted text
    return parseTextReport(text);
    
  } catch (error) {
    console.error('❌ OCR error:', error);
    return {
      success: false,
      error: error.message,
      scores: { transunion: 0, experian: 0, equifax: 0 },
      accountSummary: { totalAccounts: 0 },
      tradelines: [],
      inquiries: [],
      publicRecords: []
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// TEXT PARSER (For PDF/OCR extracted text)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Parse credit report from plain text (extracted from PDF or OCR)
 * Uses pattern matching to identify accounts, scores, etc.
 * 
 * @param {string} text - Plain text credit report
 * @returns {object} - Parsed credit report data
 */
function parseTextReport(text) {
  console.log('📝 parseTextReport: Parsing extracted text...');
  
  const result = {
    scores: { transunion: 0, experian: 0, equifax: 0 },
    accountSummary: {
      totalAccounts: 0,
      openAccounts: 0,
      closedAccounts: 0,
      delinquentAccounts: 0,
      derogatoryAccounts: 0,
      collectionAccounts: 0
    },
    tradelines: [],
    inquiries: [],
    publicRecords: []
  };
  
  // ═════════════════════════════════════════════════════════════════════════
  // EXTRACT CREDIT SCORES
  // ═════════════════════════════════════════════════════════════════════════
  
  // Common patterns for credit scores
  const scorePatterns = [
    /TransUnion[:\s]+(\d{3})/i,
    /TU[:\s]+(\d{3})/i,
    /Experian[:\s]+(\d{3})/i,
    /EXP[:\s]+(\d{3})/i,
    /Equifax[:\s]+(\d{3})/i,
    /EQF[:\s]+(\d{3})/i,
    /FICO[:\s]+(\d{3})/i,
    /VantageScore[:\s]+(\d{3})/i,
    /Credit Score[:\s]+(\d{3})/i
  ];
  
  for (const pattern of scorePatterns) {
    const match = text.match(pattern);
    if (match) {
      const score = parseInt(match[1]);
      const patternStr = pattern.toString().toLowerCase();
      
      if (patternStr.includes('transunion') || patternStr.includes('tu')) {
        result.scores.transunion = score;
      } else if (patternStr.includes('experian') || patternStr.includes('exp')) {
        result.scores.experian = score;
      } else if (patternStr.includes('equifax') || patternStr.includes('eqf')) {
        result.scores.equifax = score;
      }
    }
  }
  
  // ═════════════════════════════════════════════════════════════════════════
  // EXTRACT ACCOUNTS/TRADELINES
  // ═════════════════════════════════════════════════════════════════════════
  
  // Common creditor names to look for
  const creditorPatterns = [
    /([A-Z][A-Z\s&]+(?:BANK|CREDIT|FINANCIAL|CARD|AUTO|MORTGAGE|LOAN|COLLECTION))[^\n]*Account[^\n]*(\d+[\*X]+\d*)/gi,
    /Account Name[:\s]+([^\n]+)/gi,
    /Creditor[:\s]+([^\n]+)/gi
  ];
  
  // Look for account patterns
  const accountRegex = /(?:Account|Creditor)[:\s]+([^\n]+)[\s\S]*?(?:Account\s*(?:#|Number)[:\s]*)(\d+[\*X]+\d*)[\s\S]*?(?:Balance[:\s]*\$?([\d,]+))[\s\S]*?(?:Status[:\s]*)([^\n]+)/gi;
  
  let accountMatch;
  while ((accountMatch = accountRegex.exec(text)) !== null) {
    const tradeline = {
      creditorName: accountMatch[1]?.trim() || 'Unknown',
      accountNumber: accountMatch[2]?.trim() || '****',
      balance: parseFloat((accountMatch[3] || '0').replace(/,/g, '')),
      accountStatus: accountMatch[4]?.trim() || 'Unknown',
      bureaus: ['TU', 'EXP', 'EQF'],
      paymentStatus: 'Unknown',
      accountType: 'Unknown'
    };
    
    // Try to determine if negative
    const statusLower = tradeline.accountStatus.toLowerCase();
    if (statusLower.includes('collection') || statusLower.includes('chargeoff') ||
        statusLower.includes('late') || statusLower.includes('delinquent')) {
      result.accountSummary.derogatoryAccounts++;
    }
    
    result.tradelines.push(tradeline);
    result.accountSummary.totalAccounts++;
  }
  
  // ═════════════════════════════════════════════════════════════════════════
  // EXTRACT INQUIRIES
  // ═════════════════════════════════════════════════════════════════════════
  
  const inquiryRegex = /(?:Inquiry|Hard Pull)[:\s]+([^\n]+)[\s\S]*?(?:Date[:\s]*)(\d{1,2}\/\d{1,2}\/\d{2,4})/gi;
  
  let inquiryMatch;
  while ((inquiryMatch = inquiryRegex.exec(text)) !== null) {
    result.inquiries.push({
      creditorName: inquiryMatch[1]?.trim() || 'Unknown',
      inquiryDate: inquiryMatch[2]?.trim() || null,
      inquiryType: 'Hard',
      bureaus: ['TU', 'EXP', 'EQF']
    });
  }
  
  console.log('📊 Parsed from text:', result.accountSummary.totalAccounts, 'accounts');
  
  return result;
}

// ═══════════════════════════════════════════════════════════════════════════
// POPULATE DISPUTES FROM UPLOADED FILE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Populate disputes from an uploaded file (PDF, image, etc.)
 * Called when user uploads a credit report file directly
 * 
 * @param {string} contactId - The contact ID
 * @param {string} fileUrl - Firebase Storage URL of the uploaded file
 * @param {string} fileType - 'pdf', 'image', or 'auto'
 * @returns {object} - Result with success status and dispute data
 */
async function populateDisputesFromUpload(contactId, fileUrl, fileType = 'auto') {
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('🚀 populateDisputesFromUpload: Processing uploaded file');
  console.log('   Contact:', contactId);
  console.log('   File:', fileUrl);
  console.log('   Type:', fileType);
  console.log('═══════════════════════════════════════════════════════════════════');
  
  const db = getDb();
  
  try {
    // Download file from Firebase Storage
    const admin = require('firebase-admin');
    const bucket = admin.storage().bucket();
    
    // Extract file path from URL
    const urlPath = new URL(fileUrl).pathname;
    const filePath = decodeURIComponent(urlPath.split('/o/')[1]?.split('?')[0] || '');
    
    if (!filePath) {
      throw new Error('Invalid file URL');
    }
    
    console.log('📥 Downloading file from:', filePath);
    
    const file = bucket.file(filePath);
    const [fileBuffer] = await file.download();
    
    console.log('✅ Downloaded', fileBuffer.length, 'bytes');
    
    // Detect file type if auto
    if (fileType === 'auto') {
      if (filePath.toLowerCase().endsWith('.pdf')) {
        fileType = 'pdf';
      } else if (filePath.match(/\.(jpg|jpeg|png|gif|bmp)$/i)) {
        fileType = 'image';
      }
    }
    
    // Parse the file
    const parsedData = await parseFromAnySource(fileBuffer, fileType);
    
    // Continue with normal dispute identification flow
    const negativeItems = identifyNegativeItems(parsedData);
    
    // Save results (same as main function)
    // ... [saving logic would go here - similar to populateDisputesFromIDIQ]
    
    console.log('✅ Found', negativeItems.length, 'disputable items from uploaded file');
    
    return {
      success: true,
      contactId,
      source: 'upload',
      fileType,
      disputeCount: negativeItems.length,
      message: `Found ${negativeItems.length} disputable items from uploaded ${fileType} file`
    };
    
  } catch (error) {
    console.error('❌ populateDisputesFromUpload error:', error);
    return {
      success: false,
      error: error.message,
      contactId
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

module.exports = {
  // Main functions
  populateDisputesFromIDIQ,
  populateDisputesFromUpload,
  
  // Parsers
  parseJSONReport,
  parseHTMLReport,
  parsePDFReport,
  parseImageReport,
  parseTextReport,
  parseFromAnySource,
  
  // Utilities
  identifyNegativeItems,
  getDb
};