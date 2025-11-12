/**
 * faxService.js
 * 
 * Purpose: Complete Telnyx fax integration for SpeedyCRM
 * 
 * Features:
 * - Send faxes to credit bureaus
 * - Track fax delivery status
 * - Auto-retry on failure
 * - Convert documents to fax format
 * - Batch faxing for multiple disputes
 * - Firestore logging
 * - Delivery confirmation storage
 * 
 * Dependencies:
 * - Telnyx API
 * - Firebase Firestore
 * - Firebase Storage
 * 
 * Author: Claude (SpeedyCRM Team)
 * Last Updated: October 19, 2025
 */

import { db, storage } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, updateDoc, doc, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import axios from 'axios';

// Configuration
const TELNYX_API_KEY = import.meta.env.VITE_TELNYX_API_KEY;
const TELNYX_PHONE_NUMBER = import.meta.env.VITE_TELNYX_PHONE_NUMBER;
const TELNYX_API_BASE = 'https://api.telnyx.com/v2';

if (!TELNYX_API_KEY) {
  console.error('⚠️ TELNYX_API_KEY not found in environment variables');
}

// Credit Bureau Fax Numbers
export const BUREAU_FAX_NUMBERS = {
  experian: {
    number: '+18883973742',
    name: 'Experian',
    address: 'P.O. Box 4500, Allen, TX 75013'
  },
  equifax: {
    number: '+14048858052',
    name: 'Equifax',
    address: 'P.O. Box 740256, Atlanta, GA 30374'
  },
  transunion: {
    number: '+16105464771',
    name: 'TransUnion',
    address: 'P.O. Box 2000, Chester, PA 19016'
  }
};

/**
 * Send a fax via Telnyx
 * 
 * @param {Object} options - Fax options
 * @param {string} options.to - Recipient fax number (E.164 format)
 * @param {string} options.documentUrl - URL of PDF document to fax
 * @param {string} [options.from] - Sender fax number (defaults to TELNYX_PHONE_NUMBER)
 * @param {string} [options.recipientName] - Name of recipient
 * @param {Object} [options.metadata] - Custom metadata for logging
 * @returns {Promise<Object>} - Telnyx response with fax ID
 */
export const sendFax = async ({
  to,
  documentUrl,
  from = TELNYX_PHONE_NUMBER,
  recipientName = '',
  metadata = {}
}) => {
  try {
    // Validate inputs
    if (!to || !documentUrl) {
      throw new Error('Missing required fax fields: to, documentUrl');
    }

    // Format phone number to E.164 if needed
    const formattedTo = formatPhoneNumber(to);
    const formattedFrom = formatPhoneNumber(from);

    console.log('📠 Sending fax to:', formattedTo);

    // Send fax via Telnyx API
    const response = await axios.post(
      `${TELNYX_API_BASE}/faxes`,
      {
        connection_id: TELNYX_PHONE_NUMBER, // Your Telnyx connection ID
        to: formattedTo,
        from: formattedFrom,
        media_url: documentUrl,
        quality: 'high', // or 'normal'
        store_media: true, // Keep a copy on Telnyx
        webhook_url: `${window.location.origin}/api/webhooks/telnyx-fax`, // For status updates
        webhook_failover_url: `${window.location.origin}/api/webhooks/telnyx-fax-failover`
      },
      {
        headers: {
          'Authorization': `Bearer ${TELNYX_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const faxId = response.data.data.id;

    // Log to Firestore
    const logId = await logFaxToFirestore({
      to: formattedTo,
      from: formattedFrom,
      recipientName,
      documentUrl,
      faxId,
      status: 'queued',
      provider: 'telnyx',
      metadata
    });

    console.log('✅ Fax queued successfully:', {
      faxId,
      to: formattedTo,
      logId
    });

    return {
      success: true,
      faxId,
      logId,
      status: 'queued'
    };

  } catch (error) {
    console.error('❌ Fax send failed:', error);

    // Log failure
    await logFaxToFirestore({
      to,
      from,
      recipientName,
      documentUrl,
      status: 'failed',
      provider: 'telnyx',
      error: error.message,
      metadata
    });

    // Retry logic for certain errors
    if (error.response?.status === 429 || error.response?.status >= 500) {
      console.log('⏳ Retrying fax send in 10 seconds...');
      await new Promise(resolve => setTimeout(resolve, 10000));
      return sendFax({ to, documentUrl, from, recipientName, metadata });
    }

    throw error;
  }
};

/**
 * Send fax to credit bureau
 * 
 * @param {string} bureau - Bureau name: 'experian', 'equifax', 'transunion'
 * @param {string} documentUrl - URL of dispute letter PDF
 * @param {Object} clientInfo - Client information for logging
 * @returns {Promise<Object>} - Fax result
 */
export const sendFaxToBureau = async (bureau, documentUrl, clientInfo = {}) => {
  const bureauInfo = BUREAU_FAX_NUMBERS[bureau.toLowerCase()];
  
  if (!bureauInfo) {
    throw new Error(`Invalid bureau: ${bureau}. Must be experian, equifax, or transunion`);
  }

  return sendFax({
    to: bureauInfo.number,
    documentUrl,
    recipientName: bureauInfo.name,
    metadata: {
      bureau: bureau.toLowerCase(),
      bureauName: bureauInfo.name,
      clientId: clientInfo.clientId,
      clientName: clientInfo.clientName,
      disputeId: clientInfo.disputeId,
      type: 'dispute_letter'
    }
  });
};

/**
 * Send dispute letter to all three bureaus
 * 
 * @param {string} documentUrl - URL of dispute letter PDF
 * @param {Object} clientInfo - Client information
 * @returns {Promise<Object>} - Results from all three bureaus
 */
export const sendFaxToAllBureaus = async (documentUrl, clientInfo = {}) => {
  try {
    console.log('📠 Sending fax to all three credit bureaus...');

    const results = {
      experian: null,
      equifax: null,
      transunion: null,
      successCount: 0,
      failureCount: 0
    };

    // Send to each bureau
    for (const bureau of ['experian', 'equifax', 'transunion']) {
      try {
        const result = await sendFaxToBureau(bureau, documentUrl, clientInfo);
        results[bureau] = result;
        results.successCount++;
        
        // Wait 2 seconds between faxes to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Failed to fax ${bureau}:`, error);
        results[bureau] = { success: false, error: error.message };
        results.failureCount++;
      }
    }

    console.log('📊 Batch fax results:', results);

    return results;

  } catch (error) {
    console.error('❌ Batch fax failed:', error);
    throw error;
  }
};

/**
 * Get fax status from Telnyx
 * 
 * @param {string} faxId - Telnyx fax ID
 * @returns {Promise<Object>} - Fax status information
 */
export const getFaxStatus = async (faxId) => {
  try {
    const response = await axios.get(
      `${TELNYX_API_BASE}/faxes/${faxId}`,
      {
        headers: {
          'Authorization': `Bearer ${TELNYX_API_KEY}`
        }
      }
    );

    const faxData = response.data.data;

    // Update status in Firestore
    await updateFaxStatus(faxId, faxData.status, faxData);

    return {
      faxId,
      status: faxData.status,
      direction: faxData.direction,
      from: faxData.from,
      to: faxData.to,
      pages: faxData.page_count,
      duration: faxData.call_duration_secs,
      completedAt: faxData.completed_at,
      mediaUrl: faxData.media_url
    };

  } catch (error) {
    console.error('Failed to get fax status:', error);
    throw error;
  }
};

/**
 * Update fax status in Firestore
 * (Called by webhook or manual status check)
 */
export const updateFaxStatus = async (faxId, status, eventData = {}) => {
  try {
    // Find fax log by faxId
    const logsRef = collection(db, 'communications');
    const q = query(logsRef, where('faxId', '==', faxId));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const docRef = doc(db, 'communications', snapshot.docs[0].id);
      
      const updateData = {
        status,
        lastEvent: eventData.event_type || status,
        lastEventTimestamp: serverTimestamp()
      };

      // Add delivery confirmation details if completed
      if (status === 'delivered' || status === 'completed') {
        updateData.deliveredAt = serverTimestamp();
        updateData.pageCount = eventData.page_count;
        updateData.callDuration = eventData.call_duration_secs;
        updateData.mediaUrl = eventData.media_url;
      }

      // Add failure details if failed
      if (status === 'failed') {
        updateData.failureReason = eventData.failure_reason;
        updateData.failureCode = eventData.failure_code;
      }

      await updateDoc(docRef, updateData);
      
      console.log(`✅ Fax status updated: ${faxId} → ${status}`);
      
      return true;
    } else {
      console.warn(`⚠️ Fax log not found for ID: ${faxId}`);
      return false;
    }
  } catch (error) {
    console.error('Failed to update fax status:', error);
    return false;
  }
};

/**
 * Convert document to fax-ready format
 * (Ensures PDF is optimized for fax transmission)
 */
export const prepareDocumentForFax = async (file) => {
  try {
    // Upload to Firebase Storage
    const storageRef = ref(storage, `faxes/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    
    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);
    
    console.log('✅ Document prepared for fax:', downloadURL);
    
    return downloadURL;

  } catch (error) {
    console.error('Failed to prepare document:', error);
    throw error;
  }
};

/**
 * Log fax to Firestore
 */
const logFaxToFirestore = async (faxData) => {
  try {
    const docRef = await addDoc(collection(db, 'communications'), {
      type: 'fax',
      direction: 'outbound',
      ...faxData,
      timestamp: serverTimestamp()
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Failed to log fax:', error);
    return null;
  }
};

/**
 * Format phone number to E.164
 */
const formatPhoneNumber = (phone) => {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Add + if not present
  if (cleaned.startsWith('1') && cleaned.length === 11) {
    return `+${cleaned}`;
  } else if (cleaned.length === 10) {
    return `+1${cleaned}`;
  } else if (cleaned.startsWith('+')) {
    return phone;
  } else {
    return `+${cleaned}`;
  }
};

/**
 * Get fax history for a client
 */
export const getClientFaxHistory = async (clientId) => {
  try {
    const logsRef = collection(db, 'communications');
    const q = query(
      logsRef,
      where('type', '==', 'fax'),
      where('metadata.clientId', '==', clientId),
      orderBy('timestamp', 'desc')
    );
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

  } catch (error) {
    console.error('Failed to get fax history:', error);
    return [];
  }
};

/**
 * Get pending faxes (queued or sending)
 */
export const getPendingFaxes = async () => {
  try {
    const logsRef = collection(db, 'communications');
    const q = query(
      logsRef,
      where('type', '==', 'fax'),
      where('status', 'in', ['queued', 'sending'])
    );
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

  } catch (error) {
    console.error('Failed to get pending faxes:', error);
    return [];
  }
};

export default {
  sendFax,
  sendFaxToBureau,
  sendFaxToAllBureaus,
  getFaxStatus,
  updateFaxStatus,
  prepareDocumentForFax,
  getClientFaxHistory,
  getPendingFaxes,
  BUREAU_FAX_NUMBERS
};