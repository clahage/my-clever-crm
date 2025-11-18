// pdfParser.js - Fixed Firebase Storage imports
import { storage, db } from "@/lib/firebase"; // Import from your consolidated firebase.js
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Parse PDF and extract credit report data
 * @param {File} file - PDF file to parse
 * @param {string} clientId - Client ID for storage
 * @returns {Object} Parsed credit report data
 */
export const parseCreditReportPDF = async (file, clientId) => {
  try {
    // Upload PDF to Firebase Storage
    const storageRef = ref(storage, `credit-reports/${clientId}/${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    // Load PDF for parsing
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    // Extract text from all pages
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n';
    }

    // Parse credit report data
    const reportData = extractCreditData(fullText);
    
    // Save to Firestore
    await saveCreditReport(clientId, {
      ...reportData,
      pdfUrl: downloadURL,
      fileName: file.name,
      uploadedAt: serverTimestamp()
    });

    return {
      success: true,
      data: reportData,
      pdfUrl: downloadURL
    };
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error(`PDF parsing failed: ${error.message}`);
  }
};

/**
 * Extract credit data from text
 * @param {string} text - Full text from PDF
 * @returns {Object} Structured credit data
 */
const extractCreditData = (text) => {
  const data = {
    personalInfo: {},
    creditScores: {},
    accounts: [],
    inquiries: [],
    publicRecords: [],
    collections: []
  };

  // Extract credit scores (common patterns)
  const scorePatterns = {
    experian: /Experian[:\s]+(\d{3})/i,
    equifax: /Equifax[:\s]+(\d{3})/i,
    transunion: /TransUnion[:\s]+(\d{3})/i
  };

  for (const [bureau, pattern] of Object.entries(scorePatterns)) {
    const match = text.match(pattern);
    if (match) {
      data.creditScores[bureau] = parseInt(match[1]);
    }
  }

  // Extract SSN (partial)
  const ssnMatch = text.match(/SSN[:\s]+[*X-]*(\d{4})/i);
  if (ssnMatch) {
    data.personalInfo.ssnLast4 = ssnMatch[1];
  }

  // Extract accounts
  const accountPattern = /Account[:\s]+([^\n]+)[\s\S]*?Balance[:\s]+\$?([\d,]+)/gi;
  let accountMatch;
  while ((accountMatch = accountPattern.exec(text)) !== null) {
    data.accounts.push({
      name: accountMatch[1].trim(),
      balance: parseFloat(accountMatch[2].replace(/,/g, ''))
    });
  }

  // Extract collections
  const collectionPattern = /Collection[:\s]+([^\n]+)[\s\S]*?Amount[:\s]+\$?([\d,]+)/gi;
  let collectionMatch;
  while ((collectionMatch = collectionPattern.exec(text)) !== null) {
    data.collections.push({
      agency: collectionMatch[1].trim(),
      amount: parseFloat(collectionMatch[2].replace(/,/g, ''))
    });
  }

  return data;
};

/**
 * Save credit report to Firestore
 * @param {string} clientId - Client ID
 * @param {Object} reportData - Credit report data
 */
const saveCreditReport = async (clientId, reportData) => {
  try {
    const reportRef = doc(db, 'clients', clientId, 'creditReports', Date.now().toString());
    await setDoc(reportRef, reportData);
    console.log('Credit report saved successfully');
  } catch (error) {
    console.error('Error saving credit report:', error);
    throw error;
  }
};

/**
 * Upload PDF without parsing (for manual review)
 * @param {File} file - PDF file
 * @param {string} clientId - Client ID
 * @returns {string} Download URL
 */
export const uploadPDFOnly = async (file, clientId) => {
  try {
    const storageRef = ref(storage, `credit-reports/${clientId}/${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading PDF:', error);
    throw error;
  }
};

export default {
  parseCreditReportPDF,
  uploadPDFOnly,
  extractCreditData
};