// src/services/telnyxFaxService.js
// Telnyx Fax Service Integration for High-Volume Dispute Letters

const TELNYX_API_KEY = import.meta.env.VITE_TELNYX_API_KEY;
const TELNYX_FAX_NUMBER = import.meta.env.VITE_TELNYX_FAX_NUMBER;
const TELNYX_CONNECTION_ID = import.meta.env.VITE_TELNYX_CONNECTION_ID;
const TELNYX_API_URL = 'https://api.telnyx.com/v2';

// Send fax via Telnyx
export async function sendFax(params) {
  const { 
    toNumber, 
    pdfContent, 
    clientName, 
    userId, 
    letterId,
    metadata = {} 
  } = params;

  if (!TELNYX_API_KEY) {
    throw new Error('Telnyx API key not configured');
  }

  try {
    // Convert PDF to base64 if needed
    const base64Pdf = typeof pdfContent === 'string' 
      ? pdfContent 
      : await convertPdfToBase64(pdfContent);

    const response = await fetch(`${TELNYX_API_URL}/faxes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TELNYX_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        connection_id: TELNYX_CONNECTION_ID,
        to: toNumber,
        from: TELNYX_FAX_NUMBER,
        media_url: null, // We'll use base64 instead
        media_base64: base64Pdf,
        quality: 'high',
        // Telnyx doesn't require cover pages!
        header_info: {
          header_enabled: false, // No cover page
        },
        // Metadata for tracking
        metadata: {
          client_name: clientName,
          user_id: userId,
          letter_id: letterId,
          ...metadata
        },
        // Webhook for status updates
        webhook_url: `${window.location.origin}/api/webhooks/telnyx/fax-status`
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.errors?.[0]?.detail || 'Failed to send fax');
    }

    const data = await response.json();
    
    return {
      success: true,
      faxId: data.data.id,
      status: data.data.status,
      toNumber: data.data.to,
      createdAt: data.data.created_at,
      estimatedDelivery: data.data.estimated_delivery,
      pageCount: data.data.page_count
    };
  } catch (error) {
    console.error('Telnyx fax error:', error);
    throw error;
  }
}

// Get fax status
export async function getFaxStatus(faxId) {
  if (!TELNYX_API_KEY || !faxId) {
    return null;
  }

  try {
    const response = await fetch(`${TELNYX_API_URL}/faxes/${faxId}`, {
      headers: {
        'Authorization': `Bearer ${TELNYX_API_KEY}`,
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get fax status');
    }

    const data = await response.json();
    
    return {
      id: data.data.id,
      status: data.data.status, // queued, sending, delivered, failed
      toNumber: data.data.to,
      pageCount: data.data.page_count,
      completedAt: data.data.completed_at,
      failureReason: data.data.failure_reason
    };
  } catch (error) {
    console.error('Error getting fax status:', error);
    return null;
  }
}

// List received faxes
export async function listReceivedFaxes(params = {}) {
  const { 
    limit = 20, 
    dateFrom = null,
    dateTo = null 
  } = params;

  if (!TELNYX_API_KEY) {
    return [];
  }

  try {
    const queryParams = new URLSearchParams({
      'filter[direction]': 'inbound',
      'page[size]': limit,
      ...(dateFrom && { 'filter[created_at][gte]': dateFrom }),
      ...(dateTo && { 'filter[created_at][lte]': dateTo })
    });

    const response = await fetch(`${TELNYX_API_URL}/faxes?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${TELNYX_API_KEY}`,
      }
    });

    if (!response.ok) {
      throw new Error('Failed to list received faxes');
    }

    const data = await response.json();
    
    return data.data.map(fax => ({
      id: fax.id,
      fromNumber: fax.from,
      receivedAt: fax.created_at,
      pageCount: fax.page_count,
      mediaUrl: fax.media_url,
      status: fax.status
    }));
  } catch (error) {
    console.error('Error listing received faxes:', error);
    return [];
  }
}

// Download received fax
export async function downloadReceivedFax(faxId) {
  if (!TELNYX_API_KEY || !faxId) {
    return null;
  }

  try {
    const response = await fetch(`${TELNYX_API_URL}/faxes/${faxId}/media`, {
      headers: {
        'Authorization': `Bearer ${TELNYX_API_KEY}`,
      }
    });

    if (!response.ok) {
      throw new Error('Failed to download fax');
    }

    const blob = await response.blob();
    return blob;
  } catch (error) {
    console.error('Error downloading fax:', error);
    return null;
  }
}

// Cancel queued fax
export async function cancelFax(faxId) {
  if (!TELNYX_API_KEY || !faxId) {
    return false;
  }

  try {
    const response = await fetch(`${TELNYX_API_URL}/faxes/${faxId}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TELNYX_API_KEY}`,
      }
    });

    if (!response.ok) {
      throw new Error('Failed to cancel fax');
    }

    return true;
  } catch (error) {
    console.error('Error cancelling fax:', error);
    return false;
  }
}

// Helper function to convert PDF to base64
async function convertPdfToBase64(pdfBlob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(pdfBlob);
  });
}

// Get Telnyx account balance
export async function getAccountBalance() {
  if (!TELNYX_API_KEY) {
    return null;
  }

  try {
    const response = await fetch(`${TELNYX_API_URL}/balance`, {
      headers: {
        'Authorization': `Bearer ${TELNYX_API_KEY}`,
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get balance');
    }

    const data = await response.json();
    
    return {
      balance: data.data.balance,
      currency: data.data.currency,
      creditLimit: data.data.credit_limit
    };
  } catch (error) {
    console.error('Error getting balance:', error);
    return null;
  }
}

// Batch fax sending for multiple disputes
export async function sendBatchFaxes(faxList) {
  const results = [];
  
  for (const fax of faxList) {
    try {
      const result = await sendFax(fax);
      results.push({
        ...fax,
        ...result,
        success: true
      });
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      results.push({
        ...fax,
        success: false,
        error: error.message
      });
    }
  }
  
  return results;
}

// Webhook handler for Telnyx fax status updates
export async function handleTelnyxWebhook(payload) {
  const { event_type, data } = payload;
  
  switch (event_type) {
    case 'fax.delivered':
      console.log('Fax delivered:', data.id);
      // Update database with delivery status
      await updateFaxStatus(data.id, 'delivered', data);
      break;
      
    case 'fax.failed':
      console.error('Fax failed:', data.id, data.failure_reason);
      // Update database with failure
      await updateFaxStatus(data.id, 'failed', data);
      // Trigger retry logic if needed
      break;
      
    case 'fax.received':
      console.log('Fax received from:', data.from);
      // Process incoming fax (bureau response)
      await processIncomingFax(data);
      break;
      
    default:
      console.log('Unknown webhook event:', event_type);
  }
}

// Update fax status in database
async function updateFaxStatus(faxId, status, data) {
  // Update your Firestore database
  try {
    const { db } = await import('../lib/firebase');
    const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
    
    await updateDoc(doc(db, 'faxTransmissions', faxId), {
      status,
      completedAt: data.completed_at || serverTimestamp(),
      failureReason: data.failure_reason || null,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating fax status:', error);
  }
}

// Process incoming fax (bureau response)
async function processIncomingFax(faxData) {
  try {
    const { db } = await import('../lib/firebase');
    const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
    
    // Save to disputeResponses collection
    await addDoc(collection(db, 'disputeResponses'), {
      type: 'fax',
      fromNumber: faxData.from,
      receivedAt: faxData.created_at,
      pageCount: faxData.page_count,
      mediaUrl: faxData.media_url,
      telnyxFaxId: faxData.id,
      status: 'pending_review',
      createdAt: serverTimestamp()
    });
    
    // Trigger notification to user
    // You can add email/SMS notification here
  } catch (error) {
    console.error('Error processing incoming fax:', error);
  }
}

export default {
  sendFax,
  getFaxStatus,
  listReceivedFaxes,
  downloadReceivedFax,
  cancelFax,
  getAccountBalance,
  sendBatchFaxes,
  handleTelnyxWebhook
};