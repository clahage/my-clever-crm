// ============================================================================
// RECEIPT GENERATION SERVICE - Automatic PDF Receipt Creation
// ============================================================================
// Generates professional PDF receipts for completed payments
// Stores receipts in Firebase Storage and emails to clients
// ============================================================================

const functions = require('firebase-functions');
const { onDocumentUpdated } = require('firebase-functions/v2/firestore');
const admin = require('firebase-admin');
const sgMail = require('@sendgrid/mail');
const puppeteer = require('puppeteer');

const db = admin.firestore();
const storage = admin.storage();

// Initialize SendGrid
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

/**
 * HTML template for PDF receipt
 */
function generateReceiptHTML(receiptData) {
  const {
    receiptNumber,
    paymentDate,
    clientName,
    clientEmail,
    amount,
    paymentMethod,
    transactionId,
    description,
    companyName = 'Speedy Credit Repair Inc.',
    companyAddress = '123 Business St, Suite 100',
    companyCity = 'Your City, ST 12345',
    companyPhone = '(555) 123-4567',
    companyEmail = 'billing@speedycreditrepair.com'
  } = receiptData;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Arial', sans-serif;
      line-height: 1.6;
      color: #333;
      padding: 40px;
      background-color: #f9fafb;
    }

    .receipt-container {
      max-width: 800px;
      margin: 0 auto;
      background-color: white;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      border-radius: 8px;
      overflow: hidden;
    }

    .receipt-header {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: white;
      padding: 40px;
      text-align: center;
    }

    .receipt-header h1 {
      font-size: 36px;
      margin-bottom: 10px;
      font-weight: bold;
    }

    .receipt-header .subtitle {
      font-size: 18px;
      opacity: 0.9;
    }

    .company-info {
      background-color: #f3f4f6;
      padding: 30px 40px;
      border-bottom: 3px solid #2563eb;
    }

    .company-info h2 {
      color: #1f2937;
      font-size: 24px;
      margin-bottom: 10px;
    }

    .company-info p {
      color: #6b7280;
      margin: 5px 0;
    }

    .receipt-details {
      padding: 40px;
    }

    .detail-section {
      margin-bottom: 30px;
    }

    .detail-section h3 {
      color: #1f2937;
      font-size: 18px;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e5e7eb;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #e5e7eb;
    }

    .detail-row:last-child {
      border-bottom: none;
    }

    .detail-label {
      font-weight: 600;
      color: #6b7280;
      flex: 1;
    }

    .detail-value {
      font-weight: 500;
      color: #1f2937;
      flex: 2;
      text-align: right;
    }

    .amount-section {
      background-color: #f0fdf4;
      border: 2px solid #10b981;
      border-radius: 8px;
      padding: 30px;
      margin-top: 30px;
      text-align: center;
    }

    .amount-label {
      font-size: 18px;
      color: #065f46;
      font-weight: 600;
      margin-bottom: 10px;
    }

    .amount-value {
      font-size: 48px;
      color: #059669;
      font-weight: bold;
    }

    .payment-status {
      display: inline-block;
      background-color: #10b981;
      color: white;
      padding: 8px 20px;
      border-radius: 20px;
      font-weight: bold;
      margin-top: 15px;
      font-size: 14px;
    }

    .footer {
      background-color: #f9fafb;
      padding: 30px 40px;
      text-align: center;
      border-top: 3px solid #2563eb;
    }

    .footer p {
      color: #6b7280;
      margin: 5px 0;
      font-size: 12px;
    }

    .footer .thank-you {
      color: #1f2937;
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 15px;
    }

    .receipt-number {
      background-color: #dbeafe;
      color: #1e40af;
      padding: 15px;
      border-radius: 6px;
      text-align: center;
      font-weight: bold;
      margin-bottom: 20px;
      font-size: 14px;
    }

    .watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 120px;
      color: rgba(37, 99, 235, 0.05);
      font-weight: bold;
      z-index: -1;
      pointer-events: none;
    }
  </style>
</head>
<body>
  <div class="watermark">PAID</div>

  <div class="receipt-container">
    <!-- Header -->
    <div class="receipt-header">
      <h1>💳 Payment Receipt</h1>
      <p class="subtitle">Official Payment Confirmation</p>
    </div>

    <!-- Company Info -->
    <div class="company-info">
      <h2>${companyName}</h2>
      <p>${companyAddress}</p>
      <p>${companyCity}</p>
      <p>Phone: ${companyPhone}</p>
      <p>Email: ${companyEmail}</p>
    </div>

    <!-- Receipt Details -->
    <div class="receipt-details">
      <div class="receipt-number">
        Receipt Number: ${receiptNumber}
      </div>

      <!-- Customer Information -->
      <div class="detail-section">
        <h3>Customer Information</h3>
        <div class="detail-row">
          <span class="detail-label">Name:</span>
          <span class="detail-value">${clientName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Email:</span>
          <span class="detail-value">${clientEmail}</span>
        </div>
      </div>

      <!-- Payment Information -->
      <div class="detail-section">
        <h3>Payment Information</h3>
        <div class="detail-row">
          <span class="detail-label">Payment Date:</span>
          <span class="detail-value">${paymentDate}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Payment Method:</span>
          <span class="detail-value">${paymentMethod}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Transaction ID:</span>
          <span class="detail-value">${transactionId}</span>
        </div>
        ${description ? `
        <div class="detail-row">
          <span class="detail-label">Description:</span>
          <span class="detail-value">${description}</span>
        </div>
        ` : ''}
      </div>

      <!-- Amount -->
      <div class="amount-section">
        <div class="amount-label">Total Amount Paid</div>
        <div class="amount-value">$${parseFloat(amount).toFixed(2)}</div>
        <div class="payment-status">✓ PAID IN FULL</div>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p class="thank-you">Thank you for your payment!</p>
      <p>This receipt serves as proof of payment.</p>
      <p>For questions regarding this payment, please contact us at ${companyEmail}</p>
      <p style="margin-top: 15px; font-size: 10px;">
        Generated on: ${new Date().toLocaleString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generate PDF from HTML using Puppeteer
 */
async function generatePDF(html) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    });

    return pdfBuffer;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Upload PDF to Firebase Storage
 */
async function uploadToStorage(pdfBuffer, receiptNumber) {
  const bucket = storage.bucket();
  const fileName = `receipts/${receiptNumber}.pdf`;
  const file = bucket.file(fileName);

  await file.save(pdfBuffer, {
    metadata: {
      contentType: 'application/pdf',
      metadata: {
        generatedAt: new Date().toISOString()
      }
    }
  });

  // Make file publicly accessible (or use signed URLs for private access)
  await file.makePublic();

  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
  return publicUrl;
}

/**
 * Get client information
 */
async function getClientInfo(clientId) {
  try {
    const contactDoc = await db.collection('contacts').doc(clientId).get();
    if (contactDoc.exists) {
      const data = contactDoc.data();
      return {
        name: data.name,
        email: data.email
      };
    }

    const userDoc = await db.collection('users').doc(clientId).get();
    if (userDoc.exists) {
      const data = userDoc.data();
      return {
        name: data.displayName || data.email?.split('@')[0],
        email: data.email
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting client info:', error);
    return null;
  }
}

/**
 * Send receipt email with PDF attachment
 */
async function sendReceiptEmail(clientEmail, clientName, receiptData, pdfBuffer) {
  const { receiptNumber, amount, paymentDate } = receiptData;

  const msg = {
    to: clientEmail,
    from: {
      email: 'billing@speedycreditrepair.com',
      name: 'Speedy Credit Repair - Billing'
    },
    subject: `Payment Receipt #${receiptNumber}`,
    text: `Hi ${clientName},\n\nThank you for your payment of $${parseFloat(amount).toFixed(2)} on ${paymentDate}.\n\nYour payment receipt is attached to this email.\n\nReceipt Number: ${receiptNumber}\n\nThank you for your business!\n\nBest regards,\nSpeedy Credit Repair Team`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">Payment Receipt</h1>
          </div>
          <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
            <p>Hi ${clientName},</p>
            <p>Thank you for your payment! Your transaction has been completed successfully.</p>

            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                <span style="font-weight: 600; color: #6b7280;">Receipt Number:</span>
                <span style="font-weight: 500;">${receiptNumber}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                <span style="font-weight: 600; color: #6b7280;">Payment Date:</span>
                <span style="font-weight: 500;">${paymentDate}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 10px 0;">
                <span style="font-weight: 600; color: #6b7280;">Amount Paid:</span>
                <span style="font-weight: bold; color: #059669; font-size: 20px;">$${parseFloat(amount).toFixed(2)}</span>
              </div>
            </div>

            <p>Your official receipt is attached to this email as a PDF document. Please save it for your records.</p>

            <p>If you have any questions about this payment, please don't hesitate to contact us.</p>

            <p style="margin-top: 30px;">Thank you for your business!</p>
            <p><strong>Speedy Credit Repair Team</strong></p>
          </div>
          <div style="text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px;">
            <p>This is an automated email from Speedy Credit Repair Inc.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    attachments: [
      {
        content: pdfBuffer.toString('base64'),
        filename: `receipt-${receiptNumber}.pdf`,
        type: 'application/pdf',
        disposition: 'attachment'
      }
    ]
  };

  try {
    if (!SENDGRID_API_KEY) {
      console.warn('⚠️ SendGrid not configured. Receipt email would be sent to:', clientEmail);
      return { success: false, reason: 'SendGrid not configured' };
    }

    await sgMail.send(msg);
    console.log('✅ Receipt email sent to:', clientEmail);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending receipt email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Generate receipt number
 */
function generateReceiptNumber(paymentId) {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `RCP-${timestamp}-${randomPart}`;
}

/**
 * Main function to generate and send receipt
 */
async function generateAndSendReceipt(paymentId, paymentData) {
  try {
    console.log(`\n📄 Generating receipt for payment: ${paymentId}`);

    // Get client information
    const clientInfo = await getClientInfo(paymentData.clientId);
    if (!clientInfo || !clientInfo.email) {
      console.error('❌ Client information not found');
      return { success: false, error: 'Client information not found' };
    }

    // Generate receipt number
    const receiptNumber = paymentData.receiptNumber || generateReceiptNumber(paymentId);

    // Prepare receipt data
    const receiptData = {
      receiptNumber,
      paymentDate: paymentData.clearedDate
        ? paymentData.clearedDate.toDate().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        : new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
      clientName: clientInfo.name,
      clientEmail: clientInfo.email,
      amount: paymentData.amount,
      paymentMethod: paymentData.paymentMethod,
      transactionId: paymentData.chaseTransactionId || paymentData.id || paymentId,
      description: `Credit Repair Services - ${paymentData.description || 'Monthly Payment'}`
    };

    // Generate HTML
    const html = generateReceiptHTML(receiptData);

    // Generate PDF
    console.log('📝 Generating PDF...');
    const pdfBuffer = await generatePDF(html);

    // Upload to storage
    console.log('☁️ Uploading to Firebase Storage...');
    const receiptUrl = await uploadToStorage(pdfBuffer, receiptNumber);

    // Update payment record with receipt info
    await db.collection('payments').doc(paymentId).update({
      receiptNumber,
      receiptUrl,
      receiptGeneratedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Send email
    console.log('📧 Sending receipt email...');
    const emailResult = await sendReceiptEmail(
      clientInfo.email,
      clientInfo.name,
      receiptData,
      pdfBuffer
    );

    console.log('✅ Receipt generation completed successfully');

    return {
      success: true,
      receiptNumber,
      receiptUrl,
      emailSent: emailResult.success
    };
  } catch (error) {
    console.error('❌ Error generating receipt:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Cloud Function: Auto-generate receipt when payment is completed
 * Triggered by Firestore payment document updates
 */
exports.autoGenerateReceipt = onDocumentUpdated('payments/{paymentId}', async (event) => {
  const paymentId = event.params.paymentId;
  const beforeData = event.data.before;
  const afterData = event.data.after;

    // Only generate receipt if payment just became completed and doesn't have a receipt yet
    if (
      beforeData.status !== 'completed' &&
      afterData.status === 'completed' &&
      !afterData.receiptNumber
    ) {
      console.log(`\n🎯 Payment completed - auto-generating receipt for: ${paymentId}`);
      const result = await generateAndSendReceipt(paymentId, afterData);

      if (result.success) {
        console.log(`✅ Receipt auto-generated: ${result.receiptNumber}`);
      } else {
        console.error(`❌ Failed to auto-generate receipt: ${result.error}`);
      }

      return result;
    }

    return { skipped: true, reason: 'No receipt generation needed' };
  });

/**
 * Cloud Function: Manually generate receipt
 * Can be called by admins to regenerate or generate missing receipts
 */
exports.generateReceipt = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  // Verify admin role
  const userDoc = await db.collection('users').doc(context.auth.uid).get();
  const userRole = userDoc.data()?.role;

  if (userRole !== 'admin' && userRole !== 'masterAdmin') {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can generate receipts');
  }

  const { paymentId } = data;

  try {
    // Get payment data
    const paymentDoc = await db.collection('payments').doc(paymentId).get();
    if (!paymentDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Payment not found');
    }

    const paymentData = paymentDoc.data();

    // Verify payment is completed
    if (paymentData.status !== 'completed') {
      throw new functions.https.HttpsError('failed-precondition', 'Can only generate receipts for completed payments');
    }

    // Generate receipt
    const result = await generateAndSendReceipt(paymentId, paymentData);

    if (result.success) {
      return {
        success: true,
        receiptNumber: result.receiptNumber,
        receiptUrl: result.receiptUrl,
        emailSent: result.emailSent
      };
    } else {
      throw new functions.https.HttpsError('internal', result.error);
    }
  } catch (error) {
    console.error('Error generating receipt:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

module.exports = {
  autoGenerateReceipt: exports.autoGenerateReceipt,
  generateReceipt: exports.generateReceipt,
  generateAndSendReceipt
};
