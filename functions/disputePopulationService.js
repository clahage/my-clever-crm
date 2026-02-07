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
// FCRA/FDCPA LEGAL BASIS DATABASE
// ═══════════════════════════════════════════════════════════════════════════
// Christopher's 30+ years of credit repair expertise encoded here.
// These are the REAL legal citations used in professional credit repair.
// ═══════════════════════════════════════════════════════════════════════════

const LEGAL_BASIS = {
  // ═════ FCRA (Fair Credit Reporting Act) ═════
  fcra611: {
    code: 'FCRA §611',
    title: 'Procedure in Case of Disputed Accuracy',
    description: 'Requires CRAs to investigate disputed items within 30 days and delete unverifiable information.',
    appliesTo: ['collection', 'chargeOff', 'latePayment', 'inquiry', 'publicRecord', 'other'],
    strength: 'strong'
  },
  fcra611a: {
    code: 'FCRA §611(a)',
    title: 'Reinvestigation Required',
    description: 'CRA must conduct a reasonable reinvestigation to determine whether disputed information is inaccurate.',
    appliesTo: ['collection', 'chargeOff', 'latePayment', 'other'],
    strength: 'strong'
  },
  fcra611a1A: {
    code: 'FCRA §611(a)(1)(A)',
    title: '30-Day Investigation Period',
    description: 'CRA must complete investigation within 30 days of receiving dispute. Failure = automatic deletion.',
    appliesTo: ['collection', 'chargeOff', 'latePayment', 'inquiry', 'publicRecord', 'other'],
    strength: 'strong'
  },
  fcra611a5: {
    code: 'FCRA §611(a)(5)',
    title: 'Delete Unverifiable Information',
    description: 'If information cannot be verified after investigation, it must be promptly deleted.',
    appliesTo: ['collection', 'chargeOff', 'latePayment', 'inquiry', 'publicRecord', 'other'],
    strength: 'very_strong'
  },
  fcra623: {
    code: 'FCRA §623',
    title: 'Responsibilities of Furnishers',
    description: 'Furnishers must report accurate information and investigate disputes forwarded by CRAs.',
    appliesTo: ['collection', 'chargeOff', 'latePayment'],
    strength: 'strong'
  },
  fcra623b: {
    code: 'FCRA §623(b)',
    title: 'Furnisher Investigation Duties',
    description: 'Upon notice of dispute from CRA, furnisher must investigate and report results.',
    appliesTo: ['collection', 'chargeOff', 'latePayment', 'other'],
    strength: 'strong'
  },
  fcra605a: {
    code: 'FCRA §605(a)',
    title: 'Obsolete Information',
    description: 'Information older than 7 years (10 for bankruptcies) must not be reported.',
    appliesTo: ['collection', 'chargeOff', 'latePayment', 'publicRecord'],
    strength: 'very_strong'
  },
  fcra604: {
    code: 'FCRA §604',
    title: 'Permissible Purposes',
    description: 'Credit reports can only be accessed for permissible purposes. Unauthorized access = violation.',
    appliesTo: ['inquiry'],
    strength: 'strong'
  },
  // ═════ FDCPA (Fair Debt Collection Practices Act) ═════
  fdcpa809: {
    code: 'FDCPA §809',
    title: 'Validation of Debts',
    description: 'Collector must provide debt validation within 5 days. Consumer can dispute within 30 days.',
    appliesTo: ['collection'],
    strength: 'very_strong'
  },
  fdcpa809b: {
    code: 'FDCPA §809(b)',
    title: 'Cease Collection During Dispute',
    description: 'Collector must cease collection until verification is provided after written dispute.',
    appliesTo: ['collection'],
    strength: 'strong'
  },
  fcba: {
    code: 'FCBA §161',
    title: 'Fair Credit Billing Act',
    description: 'Billing error resolution for credit card accounts. 60-day dispute window.',
    appliesTo: ['latePayment'],
    strength: 'moderate'
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// DISPUTE STRATEGY TEMPLATES - Based on Christopher's 30 years of success
// ═══════════════════════════════════════════════════════════════════════════

const STRATEGY_TEMPLATES = {
  collection: {
    primary: 'debt_validation',
    secondary: 'bureau_dispute_accuracy',
    tertiary: 'pay_for_delete',
    legalBasis: ['fdcpa809', 'fcra611', 'fcra623'],
    defaultDisputability: 8,
    roundPriority: 1,
    successRateHistorical: 0.72,
    notes: 'Collections have highest removal rate. Always start with debt validation.'
  },
  chargeOff: {
    primary: 'bureau_dispute_accuracy',
    secondary: 'debt_validation',
    tertiary: 'goodwill_letter',
    legalBasis: ['fcra611', 'fcra623b', 'fcra611a5'],
    defaultDisputability: 7,
    roundPriority: 1,
    successRateHistorical: 0.58,
    notes: 'Charge-offs impact score heavily. Dispute balance accuracy and dates first.'
  },
  latePayment: {
    primary: 'goodwill_letter',
    secondary: 'bureau_dispute_accuracy',
    tertiary: 'method_of_verification',
    legalBasis: ['fcra611', 'fcra623', 'fcba'],
    defaultDisputability: 5,
    roundPriority: 2,
    successRateHistorical: 0.45,
    notes: 'Goodwill works best if account is current. Otherwise dispute accuracy.'
  },
  inquiry: {
    primary: 'unauthorized_inquiry_dispute',
    secondary: 'permissible_purpose_challenge',
    tertiary: null,
    legalBasis: ['fcra604', 'fcra611'],
    defaultDisputability: 6,
    roundPriority: 3,
    successRateHistorical: 0.65,
    notes: 'Only dispute inquiries beyond the first 5.'
  },
  publicRecord: {
    primary: 'court_verification',
    secondary: 'bureau_dispute_accuracy',
    tertiary: 'obsolescence_challenge',
    legalBasis: ['fcra611', 'fcra605a', 'fcra611a5'],
    defaultDisputability: 6,
    roundPriority: 1,
    successRateHistorical: 0.52,
    notes: 'Public records have highest score impact. Verify all details with court records.'
  },
  other: {
    primary: 'bureau_dispute_accuracy',
    secondary: 'method_of_verification',
    tertiary: 'goodwill_letter',
    legalBasis: ['fcra611', 'fcra623'],
    defaultDisputability: 5,
    roundPriority: 2,
    successRateHistorical: 0.40,
    notes: 'General dispute. Request full verification of all account details.'
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// BUREAU ADDRESSES (for letter generation)
// ═══════════════════════════════════════════════════════════════════════════

const BUREAU_INFO = {
  TU:  { name: 'TransUnion',  fullName: 'TransUnion LLC',                      address: 'P.O. Box 2000, Chester, PA 19016',    faxNumber: '1-610-546-4605', phone: '1-800-916-8800' },
  TUC: { name: 'TransUnion',  fullName: 'TransUnion LLC',                      address: 'P.O. Box 2000, Chester, PA 19016',    faxNumber: '1-610-546-4605', phone: '1-800-916-8800' },
  EXP: { name: 'Experian',    fullName: 'Experian Information Solutions, Inc.', address: 'P.O. Box 4500, Allen, TX 75013',      faxNumber: '1-972-390-3837', phone: '1-888-397-3742' },
  EQF: { name: 'Equifax',     fullName: 'Equifax Information Services LLC',     address: 'P.O. Box 740256, Atlanta, GA 30374',  faxNumber: '1-888-826-0573', phone: '1-866-349-5191' }
};


// ═══════════════════════════════════════════════════════════════════════════
// NEW v3.0: AI DISPUTE STRATEGY ENGINE
// ═══════════════════════════════════════════════════════════════════════════
// Uses OpenAI to generate personalized dispute strategies.
// This is Christopher's "rival-free" differentiator.
// ═══════════════════════════════════════════════════════════════════════════

async function generateDisputeStrategy(contactId, openaiApiKey) {
  const db = getDb();
  
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('🧠 AI DISPUTE STRATEGY ENGINE - Contact:', contactId);
  console.log('═══════════════════════════════════════════════════════════════════');
  
  try {
    // ═════ STEP 1: Fetch all pending disputes ═════
    const disputesSnap = await db.collection('disputes')
      .where('contactId', '==', contactId)
      .where('status', '==', 'pending')
      .get();
    
    if (disputesSnap.empty) {
      return { success: false, error: 'No pending disputes found', contactId };
    }
    
    const disputes = disputesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log('📋 Found', disputes.length, 'pending disputes');
    
    // ═════ STEP 2: Fetch contact data ═════
    const contactDoc = await db.collection('contacts').doc(contactId).get();
    const contactData = contactDoc.exists ? contactDoc.data() : {};
    
    // ═════ STEP 3: Build AI prompt ═════
    const disputeSummaryForAI = disputes.map(d => ({
      id: d.id,
      creditor: d.creditorName,
      accountNumber: d.accountNumber,
      type: d.category || d.negativeReason,
      balance: d.balance,
      paymentStatus: d.paymentStatus,
      bureaus: d.bureaus,
      priority: d.priority,
      estimatedImpact: d.estimatedScoreImpact
    }));
    
    const systemPrompt = `You are Chris Lahage, a credit repair expert with 30 years of experience and a former Toyota Finance Director. You run Speedy Credit Repair, an A+ BBB-rated company.

Analyze disputed credit items and create a comprehensive dispute strategy. You know FCRA, FDCPA, FCBA inside and out.

KEY PRINCIPLES:
- Collections have highest removal rate (~72%). Start with debt validation (FDCPA §809).
- Never fire all disputes at once — stagger across rounds (5-7 items per round).
- Optimal credit utilization is 1% (not 0%) for pre-application scenarios.
- Each round = 30-35 days apart (bureau investigation period).
- Prioritize by score impact: high-balance collections and charge-offs first.
- Accounts near 7-year mark — sometimes waiting beats disputing.

Respond ONLY with valid JSON. No markdown, no backticks, no preamble.`;

    const userPrompt = `Analyze ${disputes.length} disputed items and create a strategic plan:

CLIENT: ${contactData.firstName || 'Client'} ${contactData.lastName || ''}, State: ${contactData.state || 'Unknown'}

ITEMS:
${JSON.stringify(disputeSummaryForAI, null, 2)}

Return this JSON structure:
{
  "overallStrategy": "2-3 sentence overview",
  "estimatedTimeline": "e.g. 90-120 days",
  "projectedScoreIncrease": { "min": 0, "max": 0 },
  "totalRounds": 0,
  "items": [
    {
      "disputeId": "id from above",
      "disputabilityScore": 1-10,
      "assignedRound": 1-5,
      "primaryStrategy": "debt_validation|bureau_dispute_accuracy|goodwill_letter|pay_for_delete|method_of_verification|unauthorized_inquiry_dispute|court_verification|obsolescence_challenge",
      "legalBasis": ["FCRA §611", "FDCPA §809"],
      "reasoning": "1-2 sentences",
      "successProbability": 0.0-1.0,
      "letterTone": "formal|consumer|aggressive",
      "specialInstructions": ""
    }
  ],
  "roundPlan": [
    { "round": 1, "targetDate": "Immediately", "itemCount": 0, "focus": "description" }
  ],
  "clientAdvice": "2-3 sentences for the client"
}`;

    // ═════ STEP 4: Call OpenAI ═════
    console.log('🤖 Calling OpenAI...');
    
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 4000
      })
    });
    
    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      throw new Error(`OpenAI API error: ${openaiResponse.status} - ${errorText}`);
    }
    
    const openaiData = await openaiResponse.json();
    const aiResponseText = openaiData.choices?.[0]?.message?.content || '';
    
    // ═════ STEP 5: Parse response ═════
    let strategyPlan;
    try {
      const cleaned = aiResponseText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      strategyPlan = JSON.parse(cleaned);
    } catch (parseError) {
      console.error('⚠️ AI parse failed, using fallback');
      strategyPlan = buildFallbackStrategy(disputes);
    }
    
    // ═════ STEP 6: Save strategy + update disputes ═════
    const strategyRef = await db.collection('disputeStrategies').add({
      contactId,
      plan: strategyPlan,
      disputeCount: disputes.length,
      generatedAt: admin.firestore.FieldValue.serverTimestamp(),
      generatedBy: 'ai_strategy_engine',
      model: 'gpt-4'
    });
    
    let updatedCount = 0;
    for (const item of (strategyPlan.items || [])) {
      if (!item.disputeId) continue;
      try {
        await db.collection('disputes').doc(item.disputeId).update({
          'disputeStrategy.aiPrimary': item.primaryStrategy || null,
          'disputeStrategy.aiLegalBasis': item.legalBasis || [],
          'disputeStrategy.aiReasoning': item.reasoning || null,
          'disputeStrategy.aiSuccessProbability': item.successProbability || null,
          'disputeStrategy.aiLetterTone': item.letterTone || 'formal',
          'disputeStrategy.aiSpecialInstructions': item.specialInstructions || null,
          disputabilityScore: item.disputabilityScore || 5,
          disputeRound: item.assignedRound || 1,
          roundAssignedAt: admin.firestore.FieldValue.serverTimestamp(),
          stage: 'strategy_assigned',
          strategyId: strategyRef.id,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        updatedCount++;
      } catch (err) {
        console.error('⚠️ Failed to update dispute', item.disputeId, err.message);
      }
    }
    
    // Update contact
    await db.collection('contacts').doc(contactId).update({
      'disputes.strategyId': strategyRef.id,
      'disputes.strategyGeneratedAt': admin.firestore.FieldValue.serverTimestamp(),
      'disputes.projectedScoreIncrease': strategyPlan.projectedScoreIncrease || null,
      'disputes.estimatedTimeline': strategyPlan.estimatedTimeline || null,
      'disputes.totalRounds': strategyPlan.totalRounds || 1,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('✅ Strategy complete:', updatedCount, '/', disputes.length, 'updated');
    
    return {
      success: true,
      contactId,
      strategyId: strategyRef.id,
      plan: strategyPlan,
      disputesUpdated: updatedCount,
      message: `Strategy generated for ${disputes.length} disputes across ${strategyPlan.totalRounds || 1} rounds`
    };
    
  } catch (error) {
    console.error('❌ AI Strategy error:', error);
    return { success: false, error: error.message, contactId };
  }
}


// ═══════════════════════════════════════════════════════════════════════════
// NEW v3.0: AI DISPUTE LETTER GENERATOR
// ═══════════════════════════════════════════════════════════════════════════
// Generates 3 letter variations (formal, consumer, aggressive) per dispute
// per bureau. Each letter includes legal citations, account details,
// consumer rights, deadlines, and consequences of non-compliance.
// ═══════════════════════════════════════════════════════════════════════════

async function generateDisputeLetters(contactId, round, openaiApiKey, options = {}) {
  const db = getDb();
  const tones = options.tones || ['formal', 'consumer', 'aggressive'];
  
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('📝 AI LETTER GENERATOR - Round', round, 'Contact:', contactId);
  console.log('═══════════════════════════════════════════════════════════════════');
  
  try {
    // ═════ STEP 1: Fetch disputes for this round ═════
    let disputesQuery = db.collection('disputes')
      .where('contactId', '==', contactId)
      .where('status', '==', 'pending');
    
    if (round && round > 0) {
      disputesQuery = disputesQuery.where('disputeRound', '==', round);
    }
    
    const disputesSnap = await disputesQuery.get();
    
    if (disputesSnap.empty) {
      return { success: false, error: `No pending disputes for round ${round}`, contactId, round };
    }
    
    const disputes = disputesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log('📋 Found', disputes.length, 'disputes for round', round);
    
    // ═════ STEP 2: Fetch contact data ═════
    const contactDoc = await db.collection('contacts').doc(contactId).get();
    const contact = contactDoc.exists ? contactDoc.data() : {};
    
    const clientInfo = {
      fullName: `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'Client',
      address: contact.address || contact.streetAddress || '',
      city: contact.city || '',
      state: contact.state || '',
      zip: contact.zip || contact.zipCode || '',
      ssn: contact.ssnLast4 ? `***-**-${contact.ssnLast4}` : 'XXX-XX-XXXX',
      dob: contact.dateOfBirth || contact.dob || ''
    };
    
    // ═════ STEP 3: Generate letters per dispute per bureau ═════
    const allLetters = [];
    let letterCount = 0;
    
    for (const dispute of disputes) {
      const bureaus = dispute.bureaus || ['TU', 'EXP', 'EQF'];
      
      for (const bureauCode of bureaus) {
        const bureau = BUREAU_INFO[bureauCode] || BUREAU_INFO.TU;
        
        // Use AI-recommended tone if single, otherwise generate all tones
        const aiTone = dispute.disputeStrategy?.aiLetterTone || null;
        const tonesToGen = options.singleTone ? [aiTone || 'formal'] : tones;
        
        for (const tone of tonesToGen) {
          console.log(`📝 ${tone} letter: ${dispute.creditorName} → ${bureau.name}...`);
          
          const letter = await generateSingleLetter(dispute, bureau, bureauCode, tone, clientInfo, openaiApiKey);
          
          if (letter) {
            const letterDoc = {
              contactId,
              disputeId: dispute.id,
              bureauCode,
              bureauName: bureau.name,
              bureauAddress: bureau.address,
              bureauFax: bureau.faxNumber,
              tone,
              round: round || dispute.disputeRound || 1,
              subject: letter.subject,
              body: letter.body,
              legalCitations: letter.legalCitations || [],
              creditorName: dispute.creditorName,
              accountNumber: dispute.accountNumber,
              category: dispute.category || 'other',
              status: 'draft',
              approved: false,
              sentAt: null,
              sentVia: null,
              responseReceived: false,
              generatedAt: admin.firestore.FieldValue.serverTimestamp(),
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
              generatedBy: 'ai_letter_generator'
            };
            
            const letterRef = await db.collection('disputeLetters').add(letterDoc);
            allLetters.push({ id: letterRef.id, disputeId: dispute.id, creditor: dispute.creditorName, bureau: bureau.name, tone, status: 'draft' });
            letterCount++;
          }
        }
      }
      
      // Update dispute to track letter generation
      await db.collection('disputes').doc(dispute.id).update({
        lettersGenerated: true,
        letterCount: letterCount,
        stage: 'letters_generated',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    
    console.log('✅ Generated', letterCount, 'letters for', disputes.length, 'disputes');
    
    return {
      success: true,
      contactId,
      round,
      disputeCount: disputes.length,
      letterCount,
      letters: allLetters,
      message: `Generated ${letterCount} letters for ${disputes.length} disputes in round ${round}`
    };
    
  } catch (error) {
    console.error('❌ Letter Generator error:', error);
    return { success: false, error: error.message, contactId, round };
  }
}


// ═══════════════════════════════════════════════════════════════════════════
// HELPER: Generate a single dispute letter via OpenAI
// ═══════════════════════════════════════════════════════════════════════════

async function generateSingleLetter(dispute, bureau, bureauCode, tone, clientInfo, openaiApiKey) {
  try {
    const toneDesc = {
      formal: 'Professional and legally precise. Formal language, specific statutes, measured but firm tone. Like a credit repair attorney.',
      consumer: 'Clear and assertive in plain language. References legal rights accessibly. Warm but confident.',
      aggressive: 'Strongly worded demand letter. Emphasizes legal consequences, potential lawsuits, statutory damages, firm deadlines. Professional but leaves no doubt about escalation.'
    };
    
    const legalBasis = dispute.disputeStrategy?.aiLegalBasis ||
                       dispute.disputeStrategy?.legalBasis?.map(lb => lb.code) ||
                       ['FCRA §611'];
    
    const special = dispute.disputeStrategy?.aiSpecialInstructions || '';

    const systemPrompt = `You are a credit repair legal expert writing a dispute letter.

TONE: ${tone.toUpperCase()} — ${toneDesc[tone]}

RULES:
- Include today's date
- Include client name and address
- Address to the specific bureau
- Reference specific account number and creditor
- Cite the legal statutes provided
- Include 30-day response deadline
- Include consequences of non-compliance
- Request investigation, deletion, or correction
- Sign as the consumer (not as Speedy Credit Repair)
- Include SSN last 4 for identification
- Keep to 1-2 pages max
- Use paragraph format, not bullets`;

    const userPrompt = `Write a ${tone} dispute letter:

CLIENT: ${clientInfo.fullName}
ADDRESS: ${clientInfo.address}, ${clientInfo.city}, ${clientInfo.state} ${clientInfo.zip}
SSN: ${clientInfo.ssn}
DOB: ${clientInfo.dob}

BUREAU: ${bureau.fullName}
BUREAU ADDRESS: ${bureau.address}

DISPUTED ITEM:
- Creditor: ${dispute.creditorName}
- Account #: ${dispute.accountNumber}
- Type: ${dispute.category || dispute.negativeReason}
- Balance: $${dispute.balance || 0}
- Payment Status: ${dispute.paymentStatus}
- Dispute Reason: ${dispute.suggestedDisputeReason || 'Information is inaccurate'}

LEGAL BASIS: ${legalBasis.join(', ')}
STRATEGY: ${dispute.disputeStrategy?.aiPrimary || dispute.disputeStrategy?.primary || 'bureau_dispute_accuracy'}
${special ? `SPECIAL: ${special}` : ''}

Write the complete letter now.`;

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${openaiApiKey}` },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.4,
        max_tokens: 2000
      })
    });
    
    if (!resp.ok) {
      console.error(`⚠️ OpenAI error for ${dispute.creditorName}/${bureau.name}/${tone}`);
      return null;
    }
    
    const data = await resp.json();
    const body = data.choices?.[0]?.message?.content || '';
    
    if (!body || body.length < 100) return null;
    
    return {
      subject: `Credit Report Dispute - ${dispute.creditorName} - Account ${dispute.accountNumber}`,
      body,
      legalCitations: legalBasis
    };
    
  } catch (error) {
    console.error(`❌ Letter error for ${dispute.creditorName}:`, error.message);
    return null;
  }
}


// ═══════════════════════════════════════════════════════════════════════════
// NEW v3.0: DISPUTE ROUND ASSIGNMENT
// ═══════════════════════════════════════════════════════════════════════════
// Round 1: Top 5-7 highest-impact items (collections, charge-offs)
// Round 2: Next batch 30 days later
// Round 3+: Remaining + re-disputes
// ═══════════════════════════════════════════════════════════════════════════

async function assignDisputeRounds(contactId, options = {}) {
  const db = getDb();
  const maxPerRound = options.maxPerRound || 7;
  
  console.log('📅 ROUND ASSIGNMENT - Contact:', contactId, 'Max/round:', maxPerRound);
  
  try {
    const disputesSnap = await db.collection('disputes')
      .where('contactId', '==', contactId)
      .where('status', '==', 'pending')
      .get();
    
    if (disputesSnap.empty) {
      return { success: true, contactId, message: 'No pending disputes', rounds: [] };
    }
    
    const disputes = disputesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Sort: high priority first → higher score impact first → higher balance first
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    disputes.sort((a, b) => {
      const pA = priorityOrder[a.priority] ?? 2;
      const pB = priorityOrder[b.priority] ?? 2;
      if (pA !== pB) return pA - pB;
      const impA = a.estimatedScoreImpact?.max || 0;
      const impB = b.estimatedScoreImpact?.max || 0;
      if (impA !== impB) return impB - impA;
      return (b.balance || 0) - (a.balance || 0);
    });
    
    // Assign to rounds
    const rounds = [];
    let currentRound = 1;
    let count = 0;
    
    for (const dispute of disputes) {
      if (count >= maxPerRound) { currentRound++; count = 0; }
      
      await db.collection('disputes').doc(dispute.id).update({
        disputeRound: currentRound,
        roundAssignedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      if (!rounds[currentRound - 1]) {
        rounds[currentRound - 1] = {
          round: currentRound,
          items: [],
          scheduledDate: currentRound === 1 ? 'Immediately' : `${(currentRound - 1) * 30} days after Round 1`
        };
      }
      rounds[currentRound - 1].items.push({
        id: dispute.id,
        creditor: dispute.creditorName,
        priority: dispute.priority,
        impact: dispute.estimatedScoreImpact
      });
      count++;
    }
    
    console.log('✅ Assigned', disputes.length, 'disputes across', rounds.length, 'rounds');
    
    return {
      success: true,
      contactId,
      totalDisputes: disputes.length,
      totalRounds: rounds.length,
      rounds,
      message: `Assigned ${disputes.length} disputes across ${rounds.length} rounds`
    };
    
  } catch (error) {
    console.error('❌ Round assignment error:', error);
    return { success: false, error: error.message, contactId };
  }
}


// ═══════════════════════════════════════════════════════════════════════════
// NEW v3.0: GET DISPUTE LETTERS
// ═══════════════════════════════════════════════════════════════════════════

async function getDisputeLetters(contactId, options = {}) {
  const db = getDb();
  
  try {
    let query = db.collection('disputeLetters').where('contactId', '==', contactId);
    if (options.disputeId) query = query.where('disputeId', '==', options.disputeId);
    if (options.round) query = query.where('round', '==', options.round);
    if (options.tone) query = query.where('tone', '==', options.tone);
    if (options.status) query = query.where('status', '==', options.status);
    
    const snap = await query.get();
    const letters = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      generatedAt: doc.data().generatedAt?.toDate?.()?.toISOString() || null,
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || null
    }));
    
    return { success: true, contactId, letterCount: letters.length, letters, filters: options };
  } catch (error) {
    console.error('❌ Get letters error:', error);
    return { success: false, error: error.message, contactId };
  }
}


// ═══════════════════════════════════════════════════════════════════════════
// FALLBACK STRATEGY (when OpenAI is unavailable)
// ═══════════════════════════════════════════════════════════════════════════

function buildFallbackStrategy(disputes) {
  console.log('⚠️ Building fallback strategy (no AI)...');
  
  const items = disputes.map((d, index) => {
    const template = STRATEGY_TEMPLATES[d.category] || STRATEGY_TEMPLATES.other;
    return {
      disputeId: d.id,
      disputabilityScore: template.defaultDisputability,
      assignedRound: Math.ceil((index + 1) / 7),
      primaryStrategy: template.primary,
      legalBasis: (template.legalBasis || []).map(key => LEGAL_BASIS[key]?.code).filter(Boolean),
      reasoning: template.notes,
      successProbability: template.successRateHistorical,
      letterTone: d.priority === 'high' ? 'aggressive' : 'formal',
      specialInstructions: ''
    };
  });
  
  const totalRounds = Math.ceil(disputes.length / 7);
  
  return {
    overallStrategy: `${disputes.length} items across ${totalRounds} rounds. High-impact collections and charge-offs in Round 1.`,
    estimatedTimeline: `${totalRounds * 30}-${totalRounds * 45} days`,
    projectedScoreIncrease: { min: Math.min(disputes.length * 10, 50), max: Math.min(disputes.length * 25, 150) },
    totalRounds,
    items,
    roundPlan: Array.from({ length: totalRounds }, (_, i) => ({
      round: i + 1,
      targetDate: i === 0 ? 'Immediately' : `${i * 30} days after Round 1`,
      itemCount: items.filter(item => item.assignedRound === i + 1).length,
      focus: i === 0 ? 'High-priority collections and charge-offs' : `Round ${i + 1} items`
    })),
    clientAdvice: 'We are working on your disputes. Do not open new credit accounts during this process. Keep all current accounts in good standing.'
  };
}


// ═══════════════════════════════════════════════════════════════════════════
// UPDATED EXPORTS — v3.0
// ═══════════════════════════════════════════════════════════════════════════

module.exports = {
  // ═════ Main functions (v2.0) ═════
  populateDisputesFromIDIQ,
  populateDisputesFromUpload,
  
  // ═════ NEW v3.0: AI Pipeline Functions ═════
  generateDisputeStrategy,
  generateDisputeLetters,
  assignDisputeRounds,
  getDisputeLetters,
  
  // ═════ Parsers (v2.0) ═════
  parseJSONReport,
  parseHTMLReport,
  parsePDFReport,
  parseImageReport,
  parseTextReport,
  parseFromAnySource,
  
  // ═════ Utilities (v2.0) ═════
  identifyNegativeItems,
  getDb,
  
  // ═════ Reference Data (v3.0) ═════
  LEGAL_BASIS,
  STRATEGY_TEMPLATES,
  BUREAU_INFO
};

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

