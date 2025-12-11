// ============================================================================
// CONTRACT GENERATOR - CLOUD FUNCTION
// ============================================================================
// Path: /functions/src/contractGenerator.js
//
// PURPOSE:
// Generate service agreements from templates, create PDFs, upload to Storage,
// and send for signature via DocuSign integration
//
// Created By: Chris Lahage - Speedy Credit Repair Inc.
// © 1995-2025 Speedy Credit Repair Inc. All Rights Reserved
// ============================================================================

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const puppeteer = require('puppeteer');
const Mustache = require('mustache');
const { Storage } = require('@google-cloud/storage');
const path = require('path');
const fs = require('fs').promises;

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const storage = new Storage();
const bucketName = functions.config().firebase?.storageBucket || process.env.FIREBASE_STORAGE_BUCKET;

/**
 * State-specific contract requirements
 */
const STATE_REQUIREMENTS = {
  CA: { cancelPeriod: 5, requiresPOA: true, maxSetupFee: 150 },
  NY: { cancelPeriod: 3, requiresPOA: true, maxSetupFee: 200 },
  TX: { cancelPeriod: 3, requiresPOA: true, maxSetupFee: null },
  FL: { cancelPeriod: 3, requiresPOA: true, maxSetupFee: null },
  DEFAULT: { cancelPeriod: 3, requiresPOA: true, maxSetupFee: null }
};

/**
 * Generate service agreement contract
 * @param {Object} data - Request data
 * @param {string} data.contactId - Contact ID
 * @param {string} data.planId - Service plan ID
 * @param {Object} data.customizations - Optional customizations
 * @param {Object} context - Firebase auth context
 * @returns {Promise<Object>} Contract generation result
 */
exports.generateContract = functions
  .runWith({
    timeoutSeconds: 300,
    memory: '2GB'
  })
  .https.onCall(async (data, context) => {
    const startTime = Date.now();
    let browser = null;

    try {
      // Authentication check
      if (!context.auth) {
        throw new functions.https.HttpsError(
          'unauthenticated',
          'User must be authenticated to generate contracts'
        );
      }

      // Input validation
      if (!data.contactId) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'contactId is required'
        );
      }

      if (!data.planId) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'planId is required'
        );
      }

      functions.logger.info('Starting contract generation', {
        contactId: data.contactId,
        planId: data.planId,
        userId: context.auth.uid
      });

      // Fetch contact
      const contactDoc = await db.collection('contacts').doc(data.contactId).get();

      if (!contactDoc.exists) {
        throw new functions.https.HttpsError(
          'not-found',
          'Contact not found'
        );
      }

      const contact = contactDoc.data();

      // Fetch service plan
      const planDoc = await db.collection('servicePlans').doc(data.planId).get();

      if (!planDoc.exists) {
        throw new functions.https.HttpsError(
          'not-found',
          'Service plan not found'
        );
      }

      const plan = planDoc.data();

      // Generate contract number
      const contractNumber = generateContractNumber();

      // Get state requirements
      const stateCode = contact.state || 'DEFAULT';
      const stateReqs = STATE_REQUIREMENTS[stateCode] || STATE_REQUIREMENTS.DEFAULT;

      // Validate setup fee against state maximum
      let setupFee = plan.setupFee || 0;
      if (stateReqs.maxSetupFee && setupFee > stateReqs.maxSetupFee) {
        functions.logger.warn('Setup fee exceeds state maximum', {
          state: stateCode,
          requestedFee: setupFee,
          maxFee: stateReqs.maxSetupFee
        });
        setupFee = stateReqs.maxSetupFee;
      }

      // Prepare template variables
      const today = new Date();
      const startDate = data.customizations?.startDate || today;
      const paymentSchedule = calculatePaymentSchedule(plan, startDate);

      const templateVars = {
        // Contract details
        CONTRACT_NUMBER: contractNumber,
        CONTRACT_DATE: formatDate(today),
        EFFECTIVE_DATE: formatDate(startDate),

        // Client information
        CLIENT_NAME: `${contact.firstName} ${contact.lastName}`,
        CLIENT_FIRST_NAME: contact.firstName,
        CLIENT_LAST_NAME: contact.lastName,
        CLIENT_EMAIL: contact.email,
        CLIENT_PHONE: contact.phone || '',
        CLIENT_ADDRESS: formatAddress(contact),
        CLIENT_CITY: contact.city || '',
        CLIENT_STATE: contact.state || '',
        CLIENT_ZIP: contact.zipCode || '',

        // Plan details
        PLAN_NAME: plan.name,
        PLAN_DESCRIPTION: plan.description || '',
        MONTHLY_PRICE: formatCurrency(plan.monthlyPrice),
        MONTHLY_PRICE_NUMERIC: plan.monthlyPrice.toFixed(2),
        SETUP_FEE: formatCurrency(setupFee),
        SETUP_FEE_NUMERIC: setupFee.toFixed(2),
        DELETION_FEE: formatCurrency(plan.deletionFee || 0),
        DELETION_FEE_NUMERIC: (plan.deletionFee || 0).toFixed(2),
        HAS_SETUP_FEE: setupFee > 0,
        HAS_DELETION_FEE: (plan.deletionFee || 0) > 0,

        // State-specific requirements
        CANCEL_PERIOD_DAYS: stateReqs.cancelPeriod,
        REQUIRES_POA: stateReqs.requiresPOA,
        STATE_NAME: getStateName(stateCode),

        // Payment schedule
        FIRST_PAYMENT_DATE: formatDate(paymentSchedule.firstPayment),
        SECOND_PAYMENT_DATE: formatDate(paymentSchedule.secondPayment),
        PAYMENT_DAY: paymentSchedule.dayOfMonth,

        // Company information
        COMPANY_NAME: 'Speedy Credit Repair Inc.',
        COMPANY_ADDRESS: '1234 Main Street',
        COMPANY_CITY: 'Los Angeles',
        COMPANY_STATE: 'CA',
        COMPANY_ZIP: '90001',
        COMPANY_PHONE: '(800) 555-CREDIT',
        COMPANY_EMAIL: 'support@speedycredit.com',

        // Legal
        YEAR: today.getFullYear(),
        COPYRIGHT: '© 1995-2025 Speedy Credit Repair Inc. All Rights Reserved',

        // Customizations
        ...data.customizations
      };

      // Load contract template
      const templatePath = path.join(
        __dirname,
        '..',
        'templates',
        'contracts',
        `service-agreement-${data.planId}.html`
      );

      let templateHtml;

      try {
        templateHtml = await fs.readFile(templatePath, 'utf-8');
      } catch (error) {
        // Fallback to default template
        functions.logger.warn('Plan-specific template not found, using default', {
          planId: data.planId
        });

        const defaultTemplatePath = path.join(
          __dirname,
          '..',
          'templates',
          'contracts',
          'service-agreement-default.html'
        );

        templateHtml = await fs.readFile(defaultTemplatePath, 'utf-8');
      }

      // Inject state-specific clauses
      templateHtml = injectStateClauses(stateCode, templateHtml, stateReqs);

      // Render template with Mustache
      const renderedHtml = Mustache.render(templateHtml, templateVars);

      // Generate PDF using Puppeteer
      functions.logger.info('Launching Puppeteer to generate PDF');

      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu'
        ]
      });

      const page = await browser.newPage();
      await page.setContent(renderedHtml, {
        waitUntil: 'networkidle0'
      });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm'
        },
        printBackground: true
      });

      await browser.close();
      browser = null;

      functions.logger.info('PDF generated successfully', {
        sizeBytes: pdfBuffer.length
      });

      // Upload to Firebase Storage
      const contractId = db.collection('contracts').doc().id;
      const storagePath = `contracts/${contractId}.pdf`;

      await uploadToStorage(pdfBuffer, storagePath);

      const pdfUrl = `https://storage.googleapis.com/${bucketName}/${storagePath}`;

      functions.logger.info('PDF uploaded to Storage', {
        contractId,
        storagePath
      });

      // Create contract record in Firestore
      const contractData = {
        contractId,
        contractNumber,
        contactId: data.contactId,
        contactName: `${contact.firstName} ${contact.lastName}`,
        planId: data.planId,
        planName: plan.name,
        status: 'draft',
        pricing: {
          monthlyPrice: plan.monthlyPrice,
          setupFee,
          deletionFee: plan.deletionFee || 0,
          firstPaymentAmount: setupFee + plan.monthlyPrice,
          recurringPaymentAmount: plan.monthlyPrice
        },
        dates: {
          created: admin.firestore.FieldValue.serverTimestamp(),
          effectiveDate: admin.firestore.Timestamp.fromDate(new Date(startDate)),
          firstPaymentDate: admin.firestore.Timestamp.fromDate(paymentSchedule.firstPayment),
          expiresAt: null
        },
        files: {
          pdfUrl,
          storagePath,
          signedPdfUrl: null,
          signedStoragePath: null
        },
        signature: {
          status: 'pending',
          signedAt: null,
          ipAddress: null,
          userAgent: null,
          docusignEnvelopeId: null
        },
        stateRequirements: stateReqs,
        createdBy: context.auth.uid,
        metadata: {
          generationTimeMs: Date.now() - startTime,
          templateUsed: `service-agreement-${data.planId}.html`,
          customizations: data.customizations || {}
        }
      };

      await db.collection('contracts').doc(contractId).set(contractData);

      // Log activity
      await logContractActivity(contractId, 'created', {
        userId: context.auth.uid,
        details: 'Contract generated and PDF created'
      });

      functions.logger.info('Contract created successfully', {
        contractId,
        contractNumber,
        processingTimeMs: Date.now() - startTime
      });

      return {
        success: true,
        data: {
          contractId,
          contractNumber,
          pdfUrl,
          status: 'draft'
        },
        error: null
      };

    } catch (error) {
      // Clean up browser if still open
      if (browser) {
        try {
          await browser.close();
        } catch (closeError) {
          functions.logger.warn('Failed to close browser', {
            error: closeError.message
          });
        }
      }

      functions.logger.error('Contract generation failed', {
        error: error.message,
        stack: error.stack,
        contactId: data.contactId,
        planId: data.planId
      });

      if (error instanceof functions.https.HttpsError) {
        throw error;
      }

      throw new functions.https.HttpsError(
        'internal',
        'Failed to generate contract',
        { originalError: error.message }
      );
    }
  });

/**
 * Generate unique contract number
 * @returns {string} Contract number in format SCR-YYYYMMDD-XXXXX
 */
function generateContractNumber() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 90000) + 10000;

  return `SCR-${year}${month}${day}-${random}`;
}

/**
 * Inject state-specific legal clauses into template
 * @param {string} state - State code
 * @param {string} html - Template HTML
 * @param {Object} stateReqs - State requirements
 * @returns {string} Modified HTML
 */
function injectStateClauses(state, html, stateReqs) {
  let modifiedHtml = html;

  // California-specific clauses
  if (state === 'CA') {
    const caClause = `
      <div class="state-clause california-clause">
        <h3>California Consumer Rights</h3>
        <p>
          Under California law, you have the right to cancel this contract within
          ${stateReqs.cancelPeriod} business days of signing. The maximum credit services
          organization setup fee in California is $150.
        </p>
        <p>
          You have the right to proceed against the bond required under California law
          for any violation of the Credit Services Organization Act.
        </p>
      </div>
    `;

    modifiedHtml = modifiedHtml.replace(
      '<!-- STATE_CLAUSES -->',
      caClause
    );
  }

  // New York-specific clauses
  if (state === 'NY') {
    const nyClause = `
      <div class="state-clause newyork-clause">
        <h3>New York Consumer Rights</h3>
        <p>
          Under New York law, you have the right to cancel this contract within
          ${stateReqs.cancelPeriod} business days of signing. Any services promised
          must be completed within 6 months or a refund will be issued.
        </p>
      </div>
    `;

    modifiedHtml = modifiedHtml.replace(
      '<!-- STATE_CLAUSES -->',
      nyClause
    );
  }

  // Texas-specific clauses
  if (state === 'TX') {
    const txClause = `
      <div class="state-clause texas-clause">
        <h3>Texas Consumer Rights</h3>
        <p>
          Under Texas law, you have the right to cancel this contract within
          ${stateReqs.cancelPeriod} business days of signing. This credit services
          organization is registered with the Texas Secretary of State.
        </p>
      </div>
    `;

    modifiedHtml = modifiedHtml.replace(
      '<!-- STATE_CLAUSES -->',
      txClause
    );
  }

  // Generic cancellation clause for all other states
  if (!['CA', 'NY', 'TX'].includes(state)) {
    const genericClause = `
      <div class="state-clause generic-clause">
        <h3>Consumer Rights</h3>
        <p>
          You have the right to cancel this contract within ${stateReqs.cancelPeriod}
          business days of signing by providing written notice to Speedy Credit Repair Inc.
        </p>
      </div>
    `;

    modifiedHtml = modifiedHtml.replace(
      '<!-- STATE_CLAUSES -->',
      genericClause
    );
  }

  return modifiedHtml;
}

/**
 * Upload PDF buffer to Firebase Storage
 * @param {Buffer} pdfBuffer - PDF file buffer
 * @param {string} storagePath - Destination path in Storage
 * @returns {Promise<void>}
 */
async function uploadToStorage(pdfBuffer, storagePath) {
  const bucket = storage.bucket(bucketName);
  const file = bucket.file(storagePath);

  await file.save(pdfBuffer, {
    metadata: {
      contentType: 'application/pdf',
      metadata: {
        firebaseStorageDownloadTokens: generateDownloadToken()
      }
    }
  });

  // Make file publicly readable (or set up signed URLs)
  await file.makePublic();
}

/**
 * Calculate payment schedule
 * @param {Object} plan - Service plan
 * @param {Date} startDate - Contract start date
 * @returns {Object} Payment schedule
 */
function calculatePaymentSchedule(plan, startDate) {
  const start = new Date(startDate);

  // First payment is due immediately (includes setup fee if applicable)
  const firstPayment = new Date(start);

  // Second payment is due one month later
  const secondPayment = new Date(start);
  secondPayment.setMonth(secondPayment.getMonth() + 1);

  // Recurring payment day of month
  const dayOfMonth = start.getDate();

  return {
    firstPayment,
    secondPayment,
    dayOfMonth,
    frequency: 'monthly'
  };
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
      ...details
    });
}

/**
 * Format date as MM/DD/YYYY
 * @param {Date} date - Date to format
 * @returns {string} Formatted date
 */
function formatDate(date) {
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const year = d.getFullYear();

  return `${month}/${day}/${year}`;
}

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency
 */
function formatCurrency(amount) {
  return `$${amount.toFixed(2)}`;
}

/**
 * Format contact address
 * @param {Object} contact - Contact data
 * @returns {string} Formatted address
 */
function formatAddress(contact) {
  const parts = [];

  if (contact.address) parts.push(contact.address);
  if (contact.address2) parts.push(contact.address2);

  return parts.join(', ');
}

/**
 * Get full state name from code
 * @param {string} stateCode - State code
 * @returns {string} State name
 */
function getStateName(stateCode) {
  const stateNames = {
    CA: 'California',
    NY: 'New York',
    TX: 'Texas',
    FL: 'Florida',
    DEFAULT: stateCode
  };

  return stateNames[stateCode] || stateCode;
}

/**
 * Generate download token for Storage file
 * @returns {string} Random token
 */
function generateDownloadToken() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
