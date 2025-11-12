// src/config/faxPrivacyConfig.js
// Configuration to ensure faxes appear to come from clients, not company

export const faxConfig = {
  // Header configuration per bureau
  bureaus: {
    equifax: {
      faxNumber: '+14047407599', // Equifax dispute fax
      headerFormat: 'client_only',
      includeSSN: false, // Only last 4
      returnFax: 'client' // Use client's fax if available
    },
    experian: {
      faxNumber: '+19727908130', // Experian dispute fax
      headerFormat: 'client_only',
      includeSSN: false,
      returnFax: 'client'
    },
    transunion: {
      faxNumber: '+16103466980', // TransUnion dispute fax  
      headerFormat: 'client_only',
      includeSSN: false,
      returnFax: 'client'
    }
  },
  
  // Privacy settings
  privacy: {
    removeCompanyBranding: true,
    useClientInfo: true,
    hideCompanyName: true,
    maskCompanyPhone: true
  },
  
  // Transmission logging
  logging: {
    saveTransmissionReport: true,
    saveDeliveryConfirmation: true,
    notifyOnDelivery: true,
    notifyOnFailure: true,
    retryOnFailure: true,
    maxRetries: 3
  }
};

// Format fax header to appear from client
export function formatFaxHeader(clientInfo, bureauName) {
  return {
    // This appears at top of fax
    from: clientInfo.name,
    address: clientInfo.address,
    city: clientInfo.city,
    state: clientInfo.state,
    zip: clientInfo.zip,
    
    // Return fax (for responses)
    returnFax: clientInfo.faxNumber || getCompanyFaxAsBackup(),
    
    // Hidden metadata (not shown on fax)
    metadata: {
      companyId: 'speedy-credit-repair',
      userId: clientInfo.userId,
      timestamp: new Date().toISOString()
    }
  };
}

// Get backup fax without company name
function getCompanyFaxAsBackup() {
  // Your Telnyx number, but not identified as company
  return import.meta.env.VITE_TELNYX_FAX_NUMBER;
}

// Format dispute letter to look personally written
export function formatDisputeForFax(letterContent, clientInfo) {
  // Remove any company references
  let formatted = letterContent
    .replace(/Speedy Credit Repair/gi, '')
    .replace(/[Pp]repared by.*/g, '')
    .replace(/[Cc]lient.*/g, '');
  
  // Add personal touch
  const header = `
${clientInfo.name}
${clientInfo.address}
${clientInfo.city}, ${clientInfo.state} ${clientInfo.zip}

${new Date().toLocaleDateString()}

${getBureauAddress(letterContent)}

Dear Sir or Madam:

`;
  
  // Personal closing
  const footer = `

Sincerely,


${clientInfo.name}
SSN: XXX-XX-${clientInfo.ssnLast4 || 'XXXX'}
DOB: ${clientInfo.dob || '[Date of Birth]'}
`;
  
  return header + formatted + footer;
}

// Bureau addresses for letters
function getBureauAddress(letterContent) {
  if (letterContent.includes('Equifax')) {
    return `Equifax Information Services LLC
P.O. Box 740256
Atlanta, GA 30374-0256`;
  } else if (letterContent.includes('Experian')) {
    return `Experian
P.O. Box 4500
Allen, TX 75013`;
  } else if (letterContent.includes('TransUnion')) {
    return `TransUnion Consumer Solutions
P.O. Box 2000
Chester, PA 19016-2000`;
  }
  return '[Bureau Address]';
}

// Track all transmissions for legal records
export async function logFaxTransmission(faxDetails) {
  const { db } = await import('../lib/firebase');
  const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
  
  const record = {
    // Client info (what appears on fax)
    clientName: faxDetails.clientName,
    clientId: faxDetails.clientId,
    
    // Transmission details
    sentTo: faxDetails.toNumber,
    bureau: faxDetails.bureau,
    sentAt: serverTimestamp(),
    
    // Tracking
    telnyxId: faxDetails.telnyxId,
    confirmationCode: faxDetails.confirmationCode,
    pageCount: faxDetails.pageCount,
    transmissionTime: faxDetails.transmissionTime,
    
    // Status
    status: 'sent',
    deliveryStatus: 'pending',
    
    // Internal only (not on fax)
    sentByUserId: faxDetails.userId,
    companyAccount: 'speedy-credit-repair'
  };
  
  const docRef = await addDoc(collection(db, 'faxTransmissions'), record);
  
  return {
    id: docRef.id,
    ...record
  };
}

// Generate transmission report for legal proof
export function generateTransmissionReport(faxRecord) {
  return {
    title: 'FAX TRANSMISSION VERIFICATION',
    
    // What courts care about
    transmissionId: faxRecord.telnyxId,
    dateSent: faxRecord.sentAt,
    timeSent: faxRecord.sentAt,
    
    // Recipient
    sentTo: faxRecord.bureau,
    faxNumber: faxRecord.sentTo,
    
    // Confirmation
    deliveryStatus: faxRecord.deliveryStatus,
    confirmationCode: faxRecord.confirmationCode,
    pagesTransmitted: faxRecord.pageCount,
    transmissionDuration: faxRecord.transmissionTime,
    
    // Legal statement
    certification: 'This document certifies that the above-referenced fax was successfully transmitted on the date and time indicated. This transmission report is generated automatically and serves as legal proof of delivery.',
    
    // Can be used in:
    // - CFPB complaints
    // - Small claims court
    // - Bureau disputes
    // - Legal proceedings
  };
}

export default {
  faxConfig,
  formatFaxHeader,
  formatDisputeForFax,
  logFaxTransmission,
  generateTransmissionReport
};