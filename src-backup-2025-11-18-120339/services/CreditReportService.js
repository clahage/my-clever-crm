// src/services/creditReportService.js
// MEGA ENHANCED Multi-Provider Credit Report Service
// Handles IDIQ, Manual Entry, and PDF Upload with Full Error Handling

import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  getDoc,
  orderBy, 
  limit, 
  doc, 
  updateDoc,
  Timestamp 
} from 'firebase/firestore';
import idiqService from '@/services/idiqService';
import { parseCreditReport } from '@/services/aiCreditReportParser';

// ============================================================================
// PROVIDER TYPES & CONSTANTS
// ============================================================================

export const PROVIDERS = {
  IDIQ: 'IDIQ',
  MANUAL: 'Manual',
  PDF: 'PDF',
  SMARTCREDIT: 'SmartCredit',
  IDENTITYIQ: 'IdentityIQ',
  CREDITKARMA: 'CreditKarma'
};

export const REPORT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  READY: 'ready',
  FAILED: 'failed',
  ARCHIVED: 'archived'
};

// ============================================================================
// MAIN ENTRY POINT
// ============================================================================

/**
 * Fetch credit report from any provider
 * This is your main entry point - routes to the correct handler
 * 
 * @param {string} provider - 'IDIQ', 'Manual', 'PDF'
 * @param {object} data - Client data or file
 * @returns {object} Complete report data with ID
 */
export async function fetchCreditReport(provider, data) {
  console.log(`📊 Starting credit report fetch from ${provider}...`);
  console.log('📋 Input data:', { provider, clientEmail: data.clientEmail });

  try {
    let reportData;

    // Route to correct provider handler
    switch (provider) {
      case PROVIDERS.IDIQ:
        console.log('🔵 Routing to IDIQ handler...');
        reportData = await fetchFromIDIQ(data);
        break;

      case PROVIDERS.MANUAL:
        console.log('✍️ Routing to Manual Entry handler...');
        reportData = await processManualEntry(data);
        break;

      case PROVIDERS.PDF:
        console.log('📄 Routing to PDF handler...');
        reportData = await processPDFUpload(data);
        break;

      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }

    // Store the report in Firestore and get the ID
    console.log('💾 Storing report in Firestore...');
    const reportId = await storeReport(reportData);
    console.log('✅ Report stored with ID:', reportId);

    // Return complete report object with ID
    const completeReport = {
      success: true,
      id: reportId,
      reportId: reportId, // Include both for compatibility
      provider: reportData.provider,
      clientEmail: reportData.clientEmail,
      clientName: reportData.clientName,
      pulledAt: reportData.pulledAt,
      scores: reportData.scores,
      parsedData: reportData.parsedData,
      status: reportData.status || REPORT_STATUS.READY
    };

    console.log('🎉 Credit report fetch complete:', {
      reportId: completeReport.reportId,
      provider: completeReport.provider,
      clientEmail: completeReport.clientEmail
    });

    return completeReport;

  } catch (error) {
    console.error('❌ Error in fetchCreditReport:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      provider,
      clientEmail: data?.clientEmail
    });
    
    throw new Error(`Credit report fetch failed: ${error.message}`);
  }
}

// ============================================================================
// IDIQ INTEGRATION
// ============================================================================

/**
 * Fetch report from IDIQ API
 * Uses your existing idiqService.js
 */
async function fetchFromIDIQ(clientData) {
  console.log('🔵 Fetching from IDIQ API...');
  console.log('Client data:', {
    email: clientData.email,
    firstName: clientData.firstName,
    lastName: clientData.lastName
  });

  try {
    // Validate required fields
    if (!clientData.email || !clientData.firstName || !clientData.lastName) {
      throw new Error('Missing required IDIQ client data (email, firstName, lastName)');
    }

    // Step 1: Enroll member and pull report
    console.log('📝 Enrolling member with IDIQ...');
    const enrollResult = await idiqService.enrollMemberAndPullReport(clientData);

    if (!enrollResult.success) {
      throw new Error(`IDIQ enrollment failed: ${enrollResult.error || 'Unknown error'}`);
    }

    console.log('✅ Member enrolled, Member ID:', enrollResult.memberId);

    // Step 2: Wait for report to be ready (IDIQ processing time)
    console.log('⏳ Waiting for IDIQ report generation...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 3: Fetch the actual report
    console.log('📥 Pulling credit report from IDIQ...');
    const reportData = await idiqService.pullCreditReport(clientData.email);

    if (!reportData || !reportData.report) {
      throw new Error('IDIQ returned empty report data');
    }

    // Step 4: Extract scores
    console.log('📊 Extracting credit scores...');
    const scores = idiqService.extractScores(reportData.report);

    // Step 5: Parse the report for tradelines and details
    console.log('🔍 Parsing credit report details...');
    const parsedData = await parseCreditReport(reportData.report, PROVIDERS.IDIQ);

    const structuredReport = {
      provider: PROVIDERS.IDIQ,
      clientEmail: clientData.email,
      clientName: `${clientData.firstName} ${clientData.lastName}`,
      pulledAt: new Date().toISOString(),
      rawData: reportData.report,
      parsedData: parsedData,
      scores: scores,
      idiqMemberId: enrollResult.memberId,
      status: REPORT_STATUS.READY,
      metadata: {
        apiVersion: reportData.apiVersion || '1.0',
        processingTime: Date.now(),
        source: 'IDIQ API'
      }
    };

    console.log('✅ IDIQ report processed successfully');
    return structuredReport;

  } catch (error) {
    console.error('❌ IDIQ fetch error:', error);
    throw new Error(`IDIQ integration error: ${error.message}`);
  }
}

// ============================================================================
// MANUAL ENTRY (ENHANCED)
// ============================================================================

/**
 * Process manually entered credit report data
 * For when staff enters data from a physical report or phone call
 */
async function processManualEntry(manualData) {
  console.log('✍️ Processing manual entry...');
  console.log('Manual data received:', {
    clientEmail: manualData.clientEmail,
    clientName: manualData.clientName,
    hasScores: !!manualData.scores
  });

  try {
    // Validate required fields
    if (!manualData.clientEmail) {
      throw new Error('Client email is required for manual entry');
    }

    if (!manualData.clientName && !manualData.firstName) {
      throw new Error('Client name is required for manual entry');
    }

    // Build client name
    const clientName = manualData.clientName || 
                      `${manualData.firstName || ''} ${manualData.lastName || ''}`.trim() ||
                      'Unknown Client';

    // Process scores - handle various input formats
    const processedScores = processManualScores(manualData.scores || {});

    // Structure the complete report
    const structuredReport = {
      provider: PROVIDERS.MANUAL,
      clientEmail: manualData.clientEmail.toLowerCase().trim(),
      clientName: clientName,
      pulledAt: manualData.reportDate || new Date().toISOString(),
      rawData: manualData,
      parsedData: {
        tradelines: manualData.tradelines || [],
        inquiries: manualData.inquiries || [],
        publicRecords: manualData.publicRecords || [],
        collections: manualData.collections || [],
        summary: {
          totalAccounts: (manualData.tradelines || []).length,
          openAccounts: (manualData.tradelines || []).filter(t => t.status === 'open').length,
          negativeItems: calculateNegativeItems(manualData)
        }
      },
      scores: processedScores,
      status: REPORT_STATUS.READY,
      metadata: {
        enteredBy: manualData.enteredBy || 'admin',
        enteredAt: new Date().toISOString(),
        notes: manualData.notes || '',
        source: 'Manual Entry',
        primaryGoal: manualData.primaryGoal || 'Not specified'
      }
    };

    console.log('✅ Manual entry processed successfully');
    console.log('Processed scores:', structuredReport.scores);

    return structuredReport;

  } catch (error) {
    console.error('❌ Manual entry processing error:', error);
    throw new Error(`Manual entry failed: ${error.message}`);
  }
}

/**
 * Process manual scores from various input formats
 */
function processManualScores(inputScores) {
  console.log('Processing manual scores:', inputScores);

  return {
    vantage: {
      score: parseInt(inputScores.vantage) || null,
      version: '3.0',
      date: new Date().toISOString()
    },
    fico: {
      fico8: { 
        score: parseInt(inputScores.fico8) || null, 
        estimated: !inputScores.fico8,
        source: inputScores.fico8 ? 'Reported' : 'Not Available'
      },
      ficoAuto: { 
        score: parseInt(inputScores.ficoAuto) || null, 
        estimated: !inputScores.ficoAuto,
        source: inputScores.ficoAuto ? 'Reported' : 'Not Available'
      },
      ficoMortgage: { 
        score: parseInt(inputScores.ficoMortgage) || null, 
        estimated: !inputScores.ficoMortgage,
        source: inputScores.ficoMortgage ? 'Reported' : 'Not Available'
      }
    },
    bureaus: {
      experian: parseInt(inputScores.experian) || null,
      equifax: parseInt(inputScores.equifax) || null,
      transunion: parseInt(inputScores.transunion) || null
    }
  };
}

/**
 * Calculate negative items count
 */
function calculateNegativeItems(data) {
  let count = 0;
  
  if (data.tradelines) {
    count += data.tradelines.filter(t => 
      t.status === 'delinquent' || 
      t.latePayments > 0 || 
      t.chargeOff
    ).length;
  }
  
  if (data.publicRecords) {
    count += data.publicRecords.length;
  }
  
  if (data.collections) {
    count += data.collections.length;
  }
  
  return count;
}

// ============================================================================
// PDF UPLOAD (ENHANCED)
// ============================================================================

/**
 * Process uploaded PDF credit report
 * Uses AI to parse the PDF content
 */
async function processPDFUpload(fileData) {
  console.log('📄 Processing PDF upload...');
  console.log('File info:', {
    name: fileData.file?.name,
    size: fileData.file?.size,
    type: fileData.file?.type
  });

  try {
    // Validate file
    if (!fileData.file) {
      throw new Error('No file provided for PDF upload');
    }

    if (!fileData.clientEmail) {
      throw new Error('Client email is required for PDF upload');
    }

    // Validate file type
    if (!fileData.file.type.includes('pdf') && !fileData.file.name.endsWith('.pdf')) {
      throw new Error('File must be a PDF');
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (fileData.file.size > maxSize) {
      throw new Error('PDF file size must be less than 10MB');
    }

    console.log('✅ File validation passed');

    // Step 1: Read the PDF file
    console.log('📖 Reading PDF file...');
    const fileContent = await readPDFFile(fileData.file);

    // Step 2: Use AI to parse the PDF
    console.log('🤖 Parsing PDF with AI...');
    const parsedData = await parseCreditReport(fileContent, PROVIDERS.PDF);

    // Step 3: Extract scores from parsed data
    console.log('📊 Extracting scores...');
    const scores = extractScoresFromParsed(parsedData);

    // Build client name
    const clientName = fileData.clientName || 
                      `${fileData.firstName || ''} ${fileData.lastName || ''}`.trim() ||
                      'Unknown Client';

    const structuredReport = {
      provider: PROVIDERS.PDF,
      clientEmail: fileData.clientEmail.toLowerCase().trim(),
      clientName: clientName,
      pulledAt: parsedData.reportDate || new Date().toISOString(),
      rawData: fileContent,
      parsedData: parsedData,
      scores: scores,
      status: REPORT_STATUS.READY,
      metadata: {
        fileName: fileData.file.name,
        fileSize: fileData.file.size,
        fileType: fileData.file.type,
        uploadedAt: new Date().toISOString(),
        uploadedBy: fileData.uploadedBy || 'admin',
        source: 'PDF Upload'
      }
    };

    console.log('✅ PDF processed successfully');
    return structuredReport;

  } catch (error) {
    console.error('❌ PDF processing error:', error);
    throw new Error(`PDF processing failed: ${error.message}`);
  }
}

/**
 * Read PDF file content
 */
async function readPDFFile(file) {
  console.log('📖 Reading PDF file...');
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      console.log('✅ PDF file read successfully');
      resolve(e.target.result);
    };

    reader.onerror = (e) => {
      console.error('❌ PDF file read error:', e);
      reject(new Error('Failed to read PDF file'));
    };

    // Read as text (in production, use pdf-parse or similar library)
    reader.readAsText(file);
  });
}

/**
 * Extract scores from AI-parsed data
 */
function extractScoresFromParsed(parsedData) {
  console.log('Extracting scores from parsed data...');
  
  return {
    vantage: {
      score: parsedData.scores?.vantage || parsedData.vantageScore || null,
      version: '3.0',
      date: parsedData.reportDate || new Date().toISOString()
    },
    fico: {
      fico8: { 
        score: parsedData.scores?.fico8 || null, 
        estimated: !parsedData.scores?.fico8,
        source: parsedData.scores?.fico8 ? 'PDF Report' : 'Not Available'
      },
      ficoAuto: { 
        score: parsedData.scores?.ficoAuto || null, 
        estimated: !parsedData.scores?.ficoAuto,
        source: parsedData.scores?.ficoAuto ? 'PDF Report' : 'Not Available'
      },
      ficoMortgage: { 
        score: parsedData.scores?.ficoMortgage || null, 
        estimated: !parsedData.scores?.ficoMortgage,
        source: parsedData.scores?.ficoMortgage ? 'PDF Report' : 'Not Available'
      }
    },
    bureaus: {
      experian: parsedData.scores?.experian || null,
      equifax: parsedData.scores?.equifax || null,
      transunion: parsedData.scores?.transunion || null
    }
  };
}

// ============================================================================
// FIRESTORE OPERATIONS (ENHANCED)
// ============================================================================

/**
 * Store credit report in Firestore with full error handling
 */
async function storeReport(reportData) {
  console.log('💾 Storing report in Firestore...');
  console.log('Report data to store:', {
    provider: reportData.provider,
    clientEmail: reportData.clientEmail,
    hasScores: !!reportData.scores
  });

  try {
    // Validate report data
    if (!reportData.provider) {
      throw new Error('Report provider is required');
    }
    if (!reportData.clientEmail) {
      throw new Error('Client email is required');
    }

    // Create the document with all data
    const docData = {
      ...reportData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      version: 1,
      archived: false,
      // Ensure these fields exist
      status: reportData.status || REPORT_STATUS.READY,
      scores: reportData.scores || {},
      parsedData: reportData.parsedData || {}
    };

    console.log('📝 Creating Firestore document...');
    const docRef = await addDoc(collection(db, 'creditReports'), docData);

    console.log('✅ Report stored successfully with ID:', docRef.id);
    return docRef.id;

  } catch (error) {
    console.error('❌ Firestore storage error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    throw new Error(`Failed to store report in Firestore: ${error.message}`);
  }
}

/**
 * Get latest report for a client
 */
export async function getLatestReport(clientEmail) {
  console.log('📥 Fetching latest report for:', clientEmail);
  
  try {
    const q = query(
      collection(db, 'creditReports'),
      where('clientEmail', '==', clientEmail.toLowerCase().trim()),
      where('archived', '==', false),
      orderBy('pulledAt', 'desc'),
      limit(1)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log('ℹ️ No reports found for client');
      return null;
    }

    const docData = snapshot.docs[0];
    const report = {
      id: docData.id,
      ...docData.data()
    };

    console.log('✅ Latest report found:', report.id);
    return report;

  } catch (error) {
    console.error('❌ Error fetching latest report:', error);
    throw error;
  }
}

/**
 * Get report history for a client
 */
export async function getReportHistory(clientEmail, limitCount = 12) {
  console.log('📋 Fetching report history for:', clientEmail);
  
  try {
    const q = query(
      collection(db, 'creditReports'),
      where('clientEmail', '==', clientEmail.toLowerCase().trim()),
      where('archived', '==', false),
      orderBy('pulledAt', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);

    const reports = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`✅ Found ${reports.length} reports in history`);
    return reports;

  } catch (error) {
    console.error('❌ Error fetching report history:', error);
    throw error;
  }
}

/**
 * Get specific report by ID
 */
export async function getReportById(reportId) {
  console.log('📥 Fetching report by ID:', reportId);
  
  try {
    if (!reportId) {
      throw new Error('Report ID is required');
    }

    const docRef = doc(db, 'creditReports', reportId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.log('ℹ️ Report not found:', reportId);
      return null;
    }

    const report = {
      id: docSnap.id,
      ...docSnap.data()
    };

    console.log('✅ Report found:', report.id);
    return report;

  } catch (error) {
    console.error('❌ Error fetching report:', error);
    throw error;
  }
}

/**
 * Update report status
 */
export async function updateReportStatus(reportId, status) {
  console.log(`🔄 Updating report ${reportId} status to ${status}...`);
  
  try {
    if (!Object.values(REPORT_STATUS).includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }

    const docRef = doc(db, 'creditReports', reportId);
    await updateDoc(docRef, {
      status,
      updatedAt: Timestamp.now()
    });

    console.log(`✅ Report ${reportId} status updated to ${status}`);

  } catch (error) {
    console.error('❌ Error updating report status:', error);
    throw error;
  }
}

/**
 * Archive old report
 */
export async function archiveReport(reportId) {
  console.log(`🗄️ Archiving report ${reportId}...`);
  
  try {
    const docRef = doc(db, 'creditReports', reportId);
    await updateDoc(docRef, {
      archived: true,
      archivedAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    console.log(`✅ Report ${reportId} archived successfully`);

  } catch (error) {
    console.error('❌ Error archiving report:', error);
    throw error;
  }
}

/**
 * Link AI review to report
 */
export async function linkAIReview(reportId, reviewId) {
  console.log(`🔗 Linking AI review ${reviewId} to report ${reportId}...`);
  
  try {
    const docRef = doc(db, 'creditReports', reportId);
    await updateDoc(docRef, {
      aiReviewId: reviewId,
      hasAIReview: true,
      updatedAt: Timestamp.now()
    });

    console.log(`✅ AI review linked successfully`);

  } catch (error) {
    console.error('❌ Error linking AI review:', error);
    throw error;
  }
}

// ============================================================================
// UTILITY FUNCTIONS (ENHANCED)
// ============================================================================

/**
 * Auto-detect provider from uploaded file name
 */
export function detectProvider(file) {
  if (!file || !file.name) return PROVIDERS.PDF;
  
  const fileName = file.name.toLowerCase();

  if (fileName.includes('idiq')) return PROVIDERS.IDIQ;
  if (fileName.includes('smartcredit') || fileName.includes('smart_credit')) return PROVIDERS.SMARTCREDIT;
  if (fileName.includes('identityiq') || fileName.includes('identity_iq')) return PROVIDERS.IDENTITYIQ;
  if (fileName.includes('creditkarma') || fileName.includes('credit_karma')) return PROVIDERS.CREDITKARMA;

  return PROVIDERS.PDF;
}

/**
 * Validate client data before processing
 */
export function validateClientData(data) {
  const errors = [];

  if (!data.email) errors.push('Email is required');
  if (data.email && !isValidEmail(data.email)) errors.push('Invalid email format');

  // Name validation - require at least one
  const hasName = data.clientName || (data.firstName && data.lastName) || data.firstName;
  if (!hasName) errors.push('Client name is required');

  if (errors.length > 0) {
    throw new Error(`Validation failed: ${errors.join(', ')}`);
  }

  return true;
}

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Format report for display in UI
 */
export function formatReportForDisplay(report) {
  if (!report) return null;

  return {
    id: report.id,
    clientName: report.clientName || 'Unknown',
    clientEmail: report.clientEmail || 'N/A',
    provider: report.provider || 'Unknown',
    date: report.pulledAt ? new Date(report.pulledAt).toLocaleDateString() : 'N/A',
    vantageScore: report.scores?.vantage?.score || 'N/A',
    fico8Score: report.scores?.fico?.fico8?.score || 'N/A',
    experianScore: report.scores?.bureaus?.experian || 'N/A',
    equifaxScore: report.scores?.bureaus?.equifax || 'N/A',
    transunionScore: report.scores?.bureaus?.transunion || 'N/A',
    status: report.status || REPORT_STATUS.READY,
    hasAIReview: report.aiReviewId ? true : false,
    aiReviewId: report.aiReviewId || null
  };
}

/**
 * Calculate score tier (Poor, Fair, Good, Very Good, Excellent)
 */
export function getScoreTier(score) {
  if (!score || score < 300) return 'Unknown';
  if (score < 580) return 'Poor';
  if (score < 670) return 'Fair';
  if (score < 740) return 'Good';
  if (score < 800) return 'Very Good';
  return 'Excellent';
}

/**
 * Get all reports count for admin dashboard
 */
export async function getReportsCount() {
  try {
    const snapshot = await getDocs(collection(db, 'creditReports'));
    return snapshot.size;
  } catch (error) {
    console.error('Error getting reports count:', error);
    return 0;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  // Main functions
  fetchCreditReport,
  getLatestReport,
  getReportHistory,
  getReportById,
  updateReportStatus,
  archiveReport,
  linkAIReview,
  
  // Utilities
  detectProvider,
  validateClientData,
  formatReportForDisplay,
  getScoreTier,
  getReportsCount,
  
  // Constants
  PROVIDERS,
  REPORT_STATUS
};