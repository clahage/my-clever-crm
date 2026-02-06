// ============================================================================
// Path: /src/utils/zelleQRGenerator.js
// © 1995-2026 Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved
// Trademark registered USPTO, violations prosecuted.
//
// ZELLE QR CODE GENERATOR – PAYMENT QR CODE CREATION
// ============================================================================
// Generates QR codes for Zelle payments using Christopher's Zelle Tag
//
// CHRISTOPHER'S ZELLE SETUP (Chase Business Account):
//   - Zelle Tag: $SpeedyCredit (tag: SpeedyCredit)
//   - Business Name: SPEEDY CREDIT REPAIR INC.
//   - Account: Speedy ACH Checking (...2177)
//   - Alternative: chris@speedycreditrepair.com (backup email)
//
// HOW IT WORKS:
//   1. QR code contains Zelle tag: $SpeedyCredit
//   2. Clients scan → Zelle app opens with pre-filled info
//   3. Shows business name: "SPEEDY CREDIT REPAIR INC."
//   4. Amount and note auto-fill (if provided)
//   5. Client clicks "Send" - done!
//
// BENEFITS OF USING ZELLE TAG:
//   ✅ More professional than email/phone
//   ✅ Easy to remember and say
//   ✅ Unique to your business
//   ✅ Matches your brand perfectly
//   ✅ No email/phone confusion
// ============================================================================

// ===== DEFAULT CONFIGURATION =====
const ZELLE_CONFIG = {
  // Primary Zelle identifier (Zelle Tag - RECOMMENDED)
  ZELLE_TAG: 'SpeedyCredit',
  
  // Display name (with $ prefix for branding)
  DISPLAY_NAME: '$SpeedyCredit',
  
  // Backup Zelle email (if tag unavailable)
  BACKUP_EMAIL: 'chris@speedycreditrepair.com',
  
  // Business name (as registered with Chase)
  BUSINESS_NAME: 'SPEEDY CREDIT REPAIR INC.',
  
  // Default QR code settings
  DEFAULT_SIZE: 300,
  DEFAULT_COLOR: '#1a365d', // Speedy Credit Repair brand color
  ERROR_CORRECTION: 'H' // High error correction for better scanning
};

/**
 * Generate Zelle payment QR code using Zelle Tag
 * 
 * @param {Object} options - QR code options
 * @param {string} [options.tag] - Zelle tag (default: SpeedyCredit)
 * @param {number} [options.amount] - Payment amount (optional)
 * @param {string} [options.note] - Payment note/memo
 * @param {number} [options.size] - QR code size in pixels (default: 300)
 * @param {string} [options.color] - QR code color (default: #1a365d)
 * @param {boolean} [options.useEmail] - Use email instead of tag (default: false)
 * @returns {Promise<string>} Base64 PNG data URL
 */
export async function generateZelleQR({
  tag = ZELLE_CONFIG.ZELLE_TAG,
  amount,
  note,
  size = ZELLE_CONFIG.DEFAULT_SIZE,
  color = ZELLE_CONFIG.DEFAULT_COLOR,
  useEmail = false
}) {
  try {
    // Dynamic import of qrcode library
    const QRCode = (await import('qrcode')).default;

    // ===== Build Zelle payment URL =====
    // Format: zelle://pay?tag=SpeedyCredit&amount=99.00&note=Setup%20Fee
    // OR: zelle://pay?email=chris@speedycreditrepair.com&amount=99.00
    
    let zelleURL;
    
    if (useEmail) {
      // Use email as fallback
      zelleURL = `zelle://pay?email=${encodeURIComponent(ZELLE_CONFIG.BACKUP_EMAIL)}`;
    } else {
      // Use Zelle Tag (RECOMMENDED)
      zelleURL = `zelle://pay?tag=${encodeURIComponent(tag)}`;
    }
    
    if (amount && amount > 0) {
      zelleURL += `&amount=${amount.toFixed(2)}`;
    }
    
    if (note) {
      zelleURL += `&note=${encodeURIComponent(note)}`;
    }

    console.log('🔗 Generated Zelle URL:', zelleURL);

    // ===== Generate QR code =====
    const qrDataURL = await QRCode.toDataURL(zelleURL, {
      width: size,
      color: {
        dark: color,  // QR code color
        light: '#ffffff'  // Background color
      },
      errorCorrectionLevel: ZELLE_CONFIG.ERROR_CORRECTION,
      margin: 2
    });

    console.log('✅ Zelle QR code generated');
    console.log(`   Size: ${size}x${size}`);
    console.log(`   Tag: ${ZELLE_CONFIG.DISPLAY_NAME}`);
    if (amount) console.log(`   Amount: $${amount.toFixed(2)}`);

    return qrDataURL;

  } catch (error) {
    console.error('❌ Error generating Zelle QR code:', error);
    throw error;
  }
}

/**
 * Generate branded Zelle payment card (HTML element)
 * Includes QR code + instructions + business branding
 * 
 * @param {Object} options - Card options
 * @param {number} [options.amount] - Payment amount
 * @param {string} [options.note] - Payment note
 * @param {string} [options.title] - Card title (default: "Pay with Zelle")
 * @param {string} [options.description] - Card description
 * @returns {Promise<Object>} HTML string and QR data URL
 */
export async function generateZellePaymentCard({
  amount,
  note,
  title = 'Pay with Zelle',
  description = 'Scan this QR code with your banking app to send payment via Zelle'
}) {
  // Generate QR code using Zelle Tag
  const qrDataURL = await generateZelleQR({ 
    tag: ZELLE_CONFIG.ZELLE_TAG, 
    amount, 
    note 
  });

  const htmlCard = `
    <div style="
      max-width: 400px;
      margin: 0 auto;
      padding: 30px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      text-align: center;
      color: white;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    ">
      <!-- Title -->
      <h2 style="margin: 0 0 10px 0; font-size: 24px; font-weight: 600;">${title}</h2>
      <p style="margin: 0 0 20px 0; opacity: 0.9; font-size: 14px;">${description}</p>
      
      <!-- QR Code -->
      <div style="
        background: white;
        padding: 20px;
        border-radius: 12px;
        display: inline-block;
        margin: 20px 0;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      ">
        <img src="${qrDataURL}" alt="Zelle QR Code" style="display: block; width: 250px; height: 250px;" />
      </div>
      
      <!-- Amount (if provided) -->
      ${amount ? `
      <div style="
        background: rgba(255,255,255,0.15);
        padding: 15px;
        border-radius: 8px;
        margin: 20px 0;
      ">
        <p style="margin: 0; font-size: 14px; opacity: 0.9;">Amount</p>
        <p style="margin: 5px 0 0 0; font-size: 36px; font-weight: bold;">$${amount.toFixed(2)}</p>
      </div>
      ` : ''}
      
      <!-- Zelle Tag Display -->
      <div style="
        background: rgba(255,255,255,0.15);
        padding: 15px;
        border-radius: 8px;
        margin: 20px 0;
      ">
        <p style="margin: 0 0 5px 0; font-size: 12px; opacity: 0.8;">Send Payment To:</p>
        <p style="margin: 0; font-size: 22px; font-weight: bold;">${ZELLE_CONFIG.DISPLAY_NAME}</p>
        <p style="margin: 5px 0 0 0; font-size: 13px; opacity: 0.8;">${ZELLE_CONFIG.BUSINESS_NAME}</p>
      </div>
      
      <!-- Instructions -->
      <div style="text-align: left; margin-top: 20px; font-size: 13px; opacity: 0.9; line-height: 1.6;">
        <p style="margin: 0 0 10px 0; font-weight: 600;">How to Pay:</p>
        <ol style="margin: 0; padding-left: 20px;">
          <li style="margin-bottom: 8px;">Open your banking app</li>
          <li style="margin-bottom: 8px;">Go to <strong>Zelle</strong> or <strong>Send Money</strong></li>
          <li style="margin-bottom: 8px;"><strong>Scan this QR code</strong> (easiest!) OR search for <strong>${ZELLE_CONFIG.DISPLAY_NAME}</strong></li>
          <li>Verify the amount and tap <strong>Send</strong></li>
        </ol>
      </div>
      
      <!-- Payment Note (if provided) -->
      ${note ? `
      <div style="
        margin-top: 20px;
        padding: 12px;
        background: rgba(255,255,255,0.1);
        border-radius: 6px;
        font-size: 12px;
        opacity: 0.9;
      ">
        <strong>Payment Note:</strong> ${note}
      </div>
      ` : ''}
      
      <!-- Zelle Disclaimer -->
      <p style="
        margin-top: 25px;
        font-size: 10px;
        opacity: 0.6;
        line-height: 1.4;
      ">
        Zelle® and the Zelle® related marks are property of Early Warning Services, LLC.
      </p>
    </div>
  `;

  return {
    qrDataURL,
    htmlCard,
    zelleTag: ZELLE_CONFIG.ZELLE_TAG,
    displayName: ZELLE_CONFIG.DISPLAY_NAME,
    businessName: ZELLE_CONFIG.BUSINESS_NAME
  };
}

/**
 * Generate simple Zelle button props for React components
 * 
 * @param {Object} options - Button options
 * @param {number} [options.amount] - Payment amount
 * @param {string} [options.note] - Payment note
 * @param {string} [options.buttonText] - Button text (default: "Pay with Zelle")
 * @returns {Promise<Object>} Component props
 */
export async function generateZelleButton({
  amount,
  note,
  buttonText = 'Pay with Zelle'
}) {
  const qrDataURL = await generateZelleQR({ 
    tag: ZELLE_CONFIG.ZELLE_TAG, 
    amount, 
    note 
  });

  return {
    buttonText,
    qrDataURL,
    zelleTag: ZELLE_CONFIG.ZELLE_TAG,
    displayName: ZELLE_CONFIG.DISPLAY_NAME,
    businessName: ZELLE_CONFIG.BUSINESS_NAME,
    amount,
    note
  };
}

/**
 * Validate Zelle tag format
 * Chase requirements: 6-40 characters, letters only OR 2+ letters with numbers/hyphens
 * 
 * @param {string} tag - Tag to validate
 * @returns {boolean} True if valid Zelle tag format
 */
export function isValidZelleTag(tag) {
  // Must be 6-40 characters
  if (tag.length < 6 || tag.length > 40) return false;
  
  // Option 1: Letters only
  if (/^[a-zA-Z]+$/.test(tag)) return true;
  
  // Option 2: At least 2 letters mixed with numbers or hyphens
  const hasAtLeastTwoLetters = (tag.match(/[a-zA-Z]/g) || []).length >= 2;
  const onlyValidChars = /^[a-zA-Z0-9-]+$/.test(tag);
  
  return hasAtLeastTwoLetters && onlyValidChars;
}

/**
 * Format amount for Zelle (max 2 decimal places)
 * 
 * @param {number} amount - Amount to format
 * @returns {number} Formatted amount
 */
export function formatZelleAmount(amount) {
  return Math.round(amount * 100) / 100;
}

/**
 * Get current Zelle configuration
 * Useful for displaying in admin settings
 * 
 * @returns {Object} Current Zelle config
 */
export function getZelleConfig() {
  return {
    zelleTag: ZELLE_CONFIG.ZELLE_TAG,
    displayName: ZELLE_CONFIG.DISPLAY_NAME,
    businessName: ZELLE_CONFIG.BUSINESS_NAME,
    backupEmail: ZELLE_CONFIG.BACKUP_EMAIL,
    accountName: 'Speedy ACH Checking (...2177)',
    note: 'Zelle Tag $SpeedyCredit registered with Chase Business'
  };
}

/**
 * EXPORT ALL FUNCTIONS
 */
export default {
  generateZelleQR,
  generateZellePaymentCard,
  generateZelleButton,
  isValidZelleTag,
  formatZelleAmount,
  getZelleConfig
};

/**
 * ============================================================================
 * USAGE EXAMPLE IN CONTRACT SIGNING PORTAL:
 * ============================================================================
 * 
 * import { generateZellePaymentCard } from '@/utils/zelleQRGenerator';
 * 
 * // When client defers banking and has setup fee:
 * const setupFee = 99;
 * 
 * const zelleCard = await generateZellePaymentCard({
 *   amount: setupFee,
 *   note: `Setup Fee - Contract #${contractId}`,
 *   title: 'Pay Setup Fee via Zelle',
 *   description: 'Start your service immediately by paying the setup fee'
 * });
 * 
 * // Display the payment card:
 * <Box dangerouslySetInnerHTML={{ __html: zelleCard.htmlCard }} />
 * 
 * // Or just the QR code:
 * <img src={zelleCard.qrDataURL} alt="Pay $SpeedyCredit" width="250" />
 * 
 * ============================================================================
 * HOW IT WORKS FOR CLIENTS:
 * ============================================================================
 * 
 * 1. Client sees payment card with QR code
 * 2. Card displays: "Send Payment To: $SpeedyCredit"
 * 3. Client opens their banking app
 * 4. Client taps "Zelle" or "Send Money"
 * 5. Client scans QR code
 * 6. Zelle app auto-fills:
 *    - Recipient: SPEEDY CREDIT REPAIR INC.
 *    - Zelle Tag: $SpeedyCredit
 *    - Amount: $99.00 (if provided)
 *    - Note: "Setup Fee - Contract #12345" (if provided)
 * 7. Client verifies and taps "Send"
 * 8. Payment instantly arrives in Speedy ACH Checking (...2177)
 * 9. Christopher receives notification from Chase
 * 
 * BENEFITS:
 * - ✅ No email/phone confusion
 * - ✅ Professional business name displays
 * - ✅ Instant payment confirmation
 * - ✅ Amount pre-filled (no typos)
 * - ✅ Payment note included automatically
 * - ✅ Works with ALL U.S. banks that support Zelle
 * 
 * ============================================================================
 */