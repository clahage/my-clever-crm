// ============================================================================
// DOCUSIGN WEBHOOK HANDLER - CLOUD FUNCTION
// ============================================================================
// Path: /functions/src/docusignWebhook.js
//
// PURPOSE:
// Handle DocuSign Connect webhook events and update contract status in
// real-time as clients view, sign, decline, or void contracts
//
// Created By: Chris Lahage - Speedy Credit Repair Inc.
// © 1995-2025 Speedy Credit Repair Inc. All Rights Reserved
// ============================================================================

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const crypto = require('crypto');
const { Storage } = require('@google-cloud/storage');
const axios = require('axios');
const xml2js = require('xml2js');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const storage = new Storage();
const bucketName = functions.config().firebase?.storageBucket || process.env.FIREBASE_STORAGE_BUCKET;

/**
 * DocuSign webhook secret for HMAC verification
 */
const DOCUSIGN_WEBHOOK_SECRET = functions.config().docusign?.webhook_secret || process.env.DOCUSIGN_WEBHOOK_SECRET;

/**
 * DocuSign IP whitelist for additional security
 */
const DOCUSIGN_IP_WHITELIST = [
  '162.248.184.0/24',
  '208.91.52.0/24',
  '34.197.0.0/16',
  '34.224.0.0/16'
];

/**
 * DocuSign event to internal status mapping
 */
const EVENT_STATUS_MAP = {
  'envelope-sent': 'sent',
  'envelope-delivered': 'delivered',
  'envelope-completed': 'signed',
  'envelope-declined': 'declined',
  'envelope-voided': 'voided',
  'recipient-viewing': 'viewing',
  'recipient-signed': 'partially_signed',
  'recipient-declined': 'declined',
  'recipient-completed': 'recipient_completed'
};

/**
 * DocuSign webhook handler
 */
exports.docusignWebhook = functions.https.onRequest(async (req, res) => {
  const startTime = Date.now();

  try {
    functions.logger.info('DocuSign webhook received', {
      method: req.method,
      contentType: req.get('content-type'),
      userAgent: req.get('user-agent')
    });

    // Only accept POST requests
    if (req.method !== 'POST') {
      functions.logger.warn('Invalid request method', { method: req.method });
      res.status(200).send('OK');
      return;
    }

    // Verify IP address (optional additional security)
    const clientIp = req.ip || req.connection.remoteAddress;
    functions.logger.info('Request from IP', { clientIp });

    // Verify HMAC signature if enabled
    if (DOCUSIGN_WEBHOOK_SECRET) {
      const signature = req.get('x-docusign-signature-1');

      if (!signature) {
        functions.logger.error('Missing DocuSign signature header');
        res.status(200).send('OK');
        return;
      }

      const isValid = verifyHmacSignature(req.rawBody, signature);

      if (!isValid) {
        functions.logger.error('Invalid HMAC signature');
        res.status(200).send('OK');
        return;
      }

      functions.logger.info('HMAC signature verified');
    }

    // Parse payload (could be XML or JSON)
    const contentType = req.get('content-type') || '';
    let payload;

    if (contentType.includes('application/json')) {
      payload = req.body;
    } else if (contentType.includes('application/xml') || contentType.includes('text/xml')) {
      payload = await parseXmlPayload(req.body);
    } else {
      functions.logger.warn('Unsupported content type', { contentType });
      res.status(200).send('OK');
      return;
    }

    functions.logger.info('Payload parsed', {
      hasPayload: !!payload,
      keys: payload ? Object.keys(payload) : []
    });

    // Extract envelope data
    const envelopeData = extractEnvelopeData(payload);

    if (!envelopeData) {
      functions.logger.error('Failed to extract envelope data from payload');
      res.status(200).send('OK');
      return;
    }

    functions.logger.info('Envelope data extracted', {
      envelopeId: envelopeData.envelopeId,
      status: envelopeData.status,
      event: envelopeData.event
    });

    // Process the webhook event
    await processWebhookEvent(envelopeData);

    functions.logger.info('Webhook processed successfully', {
      envelopeId: envelopeData.envelopeId,
      processingTimeMs: Date.now() - startTime
    });

    // Always return 200 OK to DocuSign (even on errors to prevent retries)
    res.status(200).send('OK');

  } catch (error) {
    functions.logger.error('Webhook processing error', {
      error: error.message,
      stack: error.stack
    });

    // Still return 200 OK to prevent DocuSign retries
    res.status(200).send('OK');
  }
});

/**
 * Verify HMAC signature from DocuSign
 * @param {Buffer|string} body - Raw request body
 * @param {string} signature - Signature from header
 * @returns {boolean} True if valid
 */
function verifyHmacSignature(body, signature) {
  try {
    const bodyString = Buffer.isBuffer(body) ? body.toString('utf8') : body;
    const hmac = crypto.createHmac('sha256', DOCUSIGN_WEBHOOK_SECRET);
    hmac.update(bodyString);
    const calculatedSignature = hmac.digest('base64');

    return calculatedSignature === signature;
  } catch (error) {
    functions.logger.error('HMAC verification error', {
      error: error.message
    });
    return false;
  }
}

/**
 * Parse XML payload to JavaScript object
 * @param {string} xmlString - XML string
 * @returns {Promise<Object>} Parsed object
 */
async function parseXmlPayload(xmlString) {
  const parser = new xml2js.Parser({
    explicitArray: false,
    mergeAttrs: true
  });

  try {
    return await parser.parseStringPromise(xmlString);
  } catch (error) {
    functions.logger.error('XML parsing error', {
      error: error.message
    });
    return null;
  }
}

/**
 * Extract envelope data from payload (supports both XML and JSON formats)
 * @param {Object} payload - Parsed payload
 * @returns {Object|null} Envelope data
 */
function extractEnvelopeData(payload) {
  try {
    let envelopeData = {
      envelopeId: null,
      status: null,
      event: null,
      recipients: [],
      sentDateTime: null,
      completedDateTime: null,
      declinedDateTime: null,
      voidedDateTime: null,
      customFields: {}
    };

    // JSON format (DocuSign Connect v2)
    if (payload.event) {
      envelopeData.event = payload.event;
      envelopeData.envelopeId = payload.data?.envelopeId || payload.envelopeId;
      envelopeData.status = payload.data?.envelopeSummary?.status || payload.status;

      if (payload.data?.envelopeSummary) {
        const summary = payload.data.envelopeSummary;
        envelopeData.sentDateTime = summary.sentDateTime;
        envelopeData.completedDateTime = summary.completedDateTime;
        envelopeData.declinedDateTime = summary.declinedDateTime;
        envelopeData.voidedDateTime = summary.voidedDateTime;
      }

      if (payload.data?.recipients) {
        envelopeData.recipients = payload.data.recipients;
      }
    }
    // XML format (DocuSign Connect v1)
    else if (payload.DocuSignEnvelopeInformation) {
      const envelope = payload.DocuSignEnvelopeInformation.EnvelopeStatus;
      envelopeData.envelopeId = envelope.EnvelopeID;
      envelopeData.status = envelope.Status;
      envelopeData.event = `envelope-${envelope.Status.toLowerCase()}`;
      envelopeData.sentDateTime = envelope.Sent;
      envelopeData.completedDateTime = envelope.Completed;
      envelopeData.declinedDateTime = envelope.Declined;

      if (envelope.RecipientStatuses && envelope.RecipientStatuses.RecipientStatus) {
        const recipients = Array.isArray(envelope.RecipientStatuses.RecipientStatus)
          ? envelope.RecipientStatuses.RecipientStatus
          : [envelope.RecipientStatuses.RecipientStatus];

        envelopeData.recipients = recipients.map(r => ({
          email: r.Email,
          name: r.UserName,
          status: r.Status,
          signedDateTime: r.Signed,
          declinedDateTime: r.Declined,
          declinedReason: r.DeclineReason
        }));
      }

      if (envelope.CustomFields && envelope.CustomFields.CustomField) {
        const fields = Array.isArray(envelope.CustomFields.CustomField)
          ? envelope.CustomFields.CustomField
          : [envelope.CustomFields.CustomField];

        fields.forEach(field => {
          envelopeData.customFields[field.Name] = field.Value;
        });
      }
    }

    if (!envelopeData.envelopeId) {
      return null;
    }

    return envelopeData;
  } catch (error) {
    functions.logger.error('Error extracting envelope data', {
      error: error.message
    });
    return null;
  }
}

/**
 * Process webhook event and update contract
 * @param {Object} envelopeData - Envelope data
 * @returns {Promise<void>}
 */
async function processWebhookEvent(envelopeData) {
  const { envelopeId, status, event } = envelopeData;

  // Find contract by DocuSign envelope ID
  const contractsSnapshot = await db
    .collection('contracts')
    .where('signature.docusignEnvelopeId', '==', envelopeId)
    .limit(1)
    .get();

  if (contractsSnapshot.empty) {
    functions.logger.warn('Contract not found for envelope', {
      envelopeId
    });
    return;
  }

  const contractDoc = contractsSnapshot.docs[0];
  const contractId = contractDoc.id;
  const contract = contractDoc.data();

  functions.logger.info('Contract found', {
    contractId,
    currentStatus: contract.status
  });

  // Map DocuSign status to internal status
  const newStatus = EVENT_STATUS_MAP[event] || EVENT_STATUS_MAP[`envelope-${status.toLowerCase()}`] || contract.status;

  // Prepare update data
  const updateData = {
    status: newStatus,
    'signature.status': newStatus,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };

  // Handle envelope-delivered event
  if (event === 'envelope-delivered') {
    updateData['dates.deliveredAt'] = admin.firestore.FieldValue.serverTimestamp();
  }

  // Handle envelope-completed event
  if (event === 'envelope-completed' || status === 'completed') {
    updateData['signature.signedAt'] = admin.firestore.FieldValue.serverTimestamp();
    updateData['dates.signedAt'] = admin.firestore.FieldValue.serverTimestamp();

    // Extract signer information
    if (envelopeData.recipients && envelopeData.recipients.length > 0) {
      const signer = envelopeData.recipients[0];
      updateData['signature.signerName'] = signer.name;
      updateData['signature.signerEmail'] = signer.email;
    }

    // Download signed PDF
    try {
      await downloadSignedPdf(contractId, envelopeId);
      functions.logger.info('Signed PDF downloaded', { contractId });
    } catch (downloadError) {
      functions.logger.error('Failed to download signed PDF', {
        contractId,
        error: downloadError.message
      });
    }

    // Trigger follow-up actions
    await triggerContractActivation(contractId, contract);
  }

  // Handle envelope-declined event
  if (event === 'envelope-declined' || status === 'declined') {
    updateData['dates.declinedAt'] = admin.firestore.FieldValue.serverTimestamp();

    if (envelopeData.recipients && envelopeData.recipients.length > 0) {
      const decliner = envelopeData.recipients[0];
      updateData['signature.declinedBy'] = decliner.name;
      updateData['signature.declineReason'] = decliner.declinedReason || 'No reason provided';
    }
  }

  // Handle envelope-voided event
  if (event === 'envelope-voided' || status === 'voided') {
    updateData['dates.voidedAt'] = admin.firestore.FieldValue.serverTimestamp();
  }

  // Update contract
  await db.collection('contracts').doc(contractId).update(updateData);

  // Log activity
  await logContractActivity(contractId, event, {
    envelopeId,
    status: newStatus,
    recipients: envelopeData.recipients,
    details: `DocuSign webhook: ${event}`
  });

  functions.logger.info('Contract updated', {
    contractId,
    oldStatus: contract.status,
    newStatus,
    event
  });
}

/**
 * Download signed PDF from DocuSign and upload to Firebase Storage
 * @param {string} contractId - Contract ID
 * @param {string} envelopeId - DocuSign envelope ID
 * @returns {Promise<void>}
 */
async function downloadSignedPdf(contractId, envelopeId) {
  const docusignAccountId = functions.config().docusign?.account_id;
  const docusignAccessToken = functions.config().docusign?.access_token;
  const docusignBaseUrl = functions.config().docusign?.base_url || 'https://demo.docusign.net/restapi';

  if (!docusignAccessToken) {
    throw new Error('DocuSign access token not configured');
  }

  // Download PDF from DocuSign
  const pdfUrl = `${docusignBaseUrl}/v2.1/accounts/${docusignAccountId}/envelopes/${envelopeId}/documents/combined`;

  const response = await axios.get(pdfUrl, {
    headers: {
      'Authorization': `Bearer ${docusignAccessToken}`
    },
    responseType: 'arraybuffer'
  });

  const pdfBuffer = Buffer.from(response.data);

  // Upload to Firebase Storage
  const storagePath = `contracts/${contractId}-signed.pdf`;
  const bucket = storage.bucket(bucketName);
  const file = bucket.file(storagePath);

  await file.save(pdfBuffer, {
    metadata: {
      contentType: 'application/pdf',
      metadata: {
        firebaseStorageDownloadTokens: generateDownloadToken(),
        source: 'docusign',
        envelopeId
      }
    }
  });

  await file.makePublic();

  const signedPdfUrl = `https://storage.googleapis.com/${bucketName}/${storagePath}`;

  // Update contract with signed PDF URL
  await db.collection('contracts').doc(contractId).update({
    'files.signedPdfUrl': signedPdfUrl,
    'files.signedStoragePath': storagePath
  });

  functions.logger.info('Signed PDF uploaded to Storage', {
    contractId,
    storagePath
  });
}

/**
 * Trigger contract activation follow-up actions
 * @param {string} contractId - Contract ID
 * @param {Object} contract - Contract data
 * @returns {Promise<void>}
 */
async function triggerContractActivation(contractId, contract) {
  try {
    // Update contact status
    await db.collection('contacts').doc(contract.contactId).update({
      status: 'active',
      activeContractId: contractId,
      contractSignedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Create welcome email task
    await db.collection('tasks').add({
      type: 'send_welcome_email',
      contactId: contract.contactId,
      contractId,
      status: 'pending',
      priority: 'high',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      scheduledFor: admin.firestore.FieldValue.serverTimestamp()
    });

    // Create team notification
    await db.collection('notifications').add({
      type: 'contract_signed',
      title: 'New Contract Signed',
      message: `${contract.contactName} has signed their service agreement`,
      data: {
        contractId,
        contactId: contract.contactId,
        planName: contract.planName
      },
      recipients: ['admin', 'sales'],
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Schedule first payment collection
    const firstPaymentDate = contract.dates.firstPaymentDate.toDate();
    await db.collection('scheduledPayments').add({
      contractId,
      contactId: contract.contactId,
      amount: contract.pricing.firstPaymentAmount,
      scheduledDate: admin.firestore.Timestamp.fromDate(firstPaymentDate),
      type: 'initial',
      status: 'scheduled',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    functions.logger.info('Contract activation triggered', { contractId });
  } catch (error) {
    functions.logger.error('Error triggering contract activation', {
      contractId,
      error: error.message
    });
  }
}

/**
 * Log contract activity
 * @param {string} contractId - Contract ID
 * @param {string} action - Action type
 * @param {Object} details - Activity details
 * @returns {Promise<void>}
 */
async function logContractActivity(contractId, action, details) {
  await db
    .collection('contracts')
    .doc(contractId)
    .collection('activity')
    .add({
      action,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      source: 'docusign_webhook',
      ...details
    });
}

/**
 * Generate download token for Storage file
 * @returns {string} Random token
 */
function generateDownloadToken() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
