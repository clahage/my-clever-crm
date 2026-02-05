// ============================================================================
// Path: /src/utils/zelleQRGenerator.js
// © 1995-2026 Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved
// Trademark registered USPTO, violations prosecuted.
//
// ZELLE QR CODE GENERATOR — PAYMENT QR CODE CREATION
// ============================================================================
// Generates QR codes for Zelle payments to mask the actual email address
// from public display while still allowing clients to pay easily.
//
// CHRISTOPHER'S REQUIREMENT:
//   "The correct information is CLahage@Gmail.com, but I would like to have
//    it changed to Pay@speedycreditrepair.com. Is it possible to create a
//    QR code for clients to use instead, or to somehow mask the email address?"
//
// SOLUTION:
//   1. Generate QR code with Zelle payment link (masks email)
//   2. Display branded "Pay with Zelle" button + QR code
//   3. Optional: Show friendly email (Pay@...) but link to actual (CLahage@...)
//
// NOTE: Zelle email forwarding setup required:
//   - Create email forward: Pay@speedycreditrepair.com → CLahage@Gmail.com
//   - Then use Pay@ everywhere for branding
//   - This utility generates QR for either email
//
// QR CODE LIBRARY:
//   Uses qrcode library (install: npm install qrcode)
//
// USAGE:
//   import { generateZelleQR } from '@/utils/zelleQRGenerator';
//   
//   const qrCode = await generateZelleQR({
//     email: 'CLahage@Gmail.com',
//     amount: 99,
//     note: 'Setup Fee - Contract #12345'
//   });
//   
//   // Returns: data URL string for <img src={qrCode} />
// ============================================================================

/**
 * Generate Zelle payment QR code
 * 
 * @param {Object} options - QR code options
 * @param {string} options.email - Zelle email (CLahage@Gmail.com or Pay@speedycreditrepair.com)
 * @param {number} [options.amount] - Payment amount (optional, user can enter in Zelle app)
 * @param {string} [options.note] - Payment note/memo
 * @param {number} [options.size] - QR code size in pixels (default: 300)
 * @param {string} [options.color] - QR code color (default: #1a365d)
 * @returns {Promise<string>} Base64 PNG data URL
 */
export async function generateZelleQR({
  email = 'CLahage@Gmail.com',
  amount,
  note,
  size = 300,
  color = '#1a365d'
}) {
  try {
    // Dynamic import of qrcode library
    const QRCode = (await import('qrcode')).default;

    // ===== Build Zelle payment URL =====
    // Format: zelle://pay?email=xxx&amount=xxx&note=xxx
    let zelleURL = `zelle://pay?email=${encodeURIComponent(email)}`;
    
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
      errorCorrectionLevel: 'H', // High error correction
      margin: 2
    });

    console.log('✅ Zelle QR code generated');
    console.log(`   Size: ${size}x${size}`);
    console.log(`   Email: ${email}`);
    if (amount) console.log(`   Amount: $${amount.toFixed(2)}`);

    return qrDataURL;

  } catch (error) {
    console.error('❌ Error generating Zelle QR code:', error);
    throw error;
  }
}

/**
 * Generate branded Zelle payment card (HTML element)
 * Includes QR code + instructions + branding
 * 
 * @param {Object} options - Card options
 * @param {string} options.email - Zelle email
 * @param {string} options.displayEmail - Email to show to user (for branding)
 * @param {number} [options.amount] - Payment amount
 * @param {string} [options.note] - Payment note
 * @param {string} [options.title] - Card title (default: "Pay with Zelle")
 * @param {string} [options.description] - Card description
 * @returns {Promise<Object>} HTML string and QR data URL
 */
export async function generateZellePaymentCard({
  email = 'CLahage@Gmail.com',
  displayEmail = 'Pay@speedycreditrepair.com',
  amount,
  note,
  title = 'Pay with Zelle',
  description = 'Scan this QR code with your banking app to send payment via Zelle'
}) {
  const qrDataURL = await generateZelleQR({ email, amount, note });

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
      <h2 style="margin: 0 0 10px 0; font-size: 24px;">${title}</h2>
      <p style="margin: 0 0 20px 0; opacity: 0.9; font-size: 14px;">${description}</p>
      
      <!-- QR Code -->
      <div style="
        background: white;
        padding: 20px;
        border-radius: 12px;
        display: inline-block;
        margin: 20px 0;
      ">
        <img src="${qrDataURL}" alt="Zelle QR Code" style="display: block; width: 250px; height: 250px;" />
      </div>
      
      <!-- Payment Details -->
      ${amount ? `
      <div style="
        background: rgba(255,255,255,0.15);
        padding: 15px;
        border-radius: 8px;
        margin: 20px 0;
      ">
        <p style="margin: 0; font-size: 14px; opacity: 0.9;">Amount</p>
        <p style="margin: 5px 0 0 0; font-size: 32px; font-weight: bold;">$${amount.toFixed(2)}</p>
      </div>
      ` : ''}
      
      <!-- Zelle Email (Branded) -->
      <div style="
        background: rgba(255,255,255,0.15);
        padding: 15px;
        border-radius: 8px;
        margin: 20px 0;
      ">
        <p style="margin: 0 0 5px 0; font-size: 12px; opacity: 0.8;">Send Payment To:</p>
        <p style="margin: 0; font-size: 18px; font-weight: bold;">${displayEmail}</p>
      </div>
      
      <!-- Instructions -->
      <div style="text-align: left; margin-top: 20px; font-size: 13px; opacity: 0.9;">
        <p style="margin: 0 0 10px 0;"><strong>How to Pay:</strong></p>
        <ol style="margin: 0; padding-left: 20px;">
          <li>Open your banking app</li>
          <li>Go to Zelle / Send Money</li>
          <li>Scan this QR code OR enter the email above</li>
          <li>Confirm the amount and send</li>
        </ol>
      </div>
      
      ${note ? `
      <p style="
        margin-top: 20px;
        padding: 10px;
        background: rgba(255,255,255,0.1);
        border-radius: 6px;
        font-size: 12px;
        opacity: 0.85;
      ">
        <strong>Payment Note:</strong> ${note}
      </p>
      ` : ''}
    </div>
  `;

  return {
    qrDataURL,
    htmlCard,
    zelleEmail: email,
    displayEmail
  };
}

/**
 * Generate simple Zelle button with QR modal
 * Returns React-friendly component code
 * 
 * @param {Object} options - Button options
 * @param {string} options.email - Zelle email
 * @param {string} options.displayEmail - Email to show
 * @param {number} [options.amount] - Payment amount
 * @param {string} [options.note] - Payment note
 * @param {string} [options.buttonText] - Button text (default: "Pay with Zelle")
 * @returns {Promise<Object>} Component props
 */
export async function generateZelleButton({
  email = 'CLahage@Gmail.com',
  displayEmail = 'Pay@speedycreditrepair.com',
  amount,
  note,
  buttonText = 'Pay with Zelle'
}) {
  const qrDataURL = await generateZelleQR({ email, amount, note });

  return {
    buttonText,
    qrDataURL,
    zelleEmail: email,
    displayEmail,
    amount,
    note,
    
    // React component usage example:
    reactExample: `
      const [showZelleModal, setShowZelleModal] = useState(false);
      
      <Button onClick={() => setShowZelleModal(true)}>
        Pay with Zelle
      </Button>
      
      <Dialog open={showZelleModal} onClose={() => setShowZelleModal(false)}>
        <DialogContent>
          <img src="${qrDataURL}" alt="Zelle QR Code" />
          <Typography>Scan to pay ${displayEmail}</Typography>
          ${amount ? `<Typography variant="h4">$${amount.toFixed(2)}</Typography>` : ''}
        </DialogContent>
      </Dialog>
    `
  };
}

/**
 * Create email forwarding instructions for Christopher
 * (To set up Pay@speedycreditrepair.com → CLahage@Gmail.com)
 * 
 * @returns {string} HTML instructions
 */
export function getEmailForwardingInstructions() {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px;">
      <h2>📧 Setting Up Zelle Email Forwarding</h2>
      
      <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Goal:</strong> Make Pay@speedycreditrepair.com receive Zelle payments that actually go to CLahage@Gmail.com</p>
      </div>
      
      <h3>Option 1: Google Workspace Email Forwarding (Recommended)</h3>
      <p>If you have Google Workspace for speedycreditrepair.com:</p>
      <ol>
        <li>Log into Google Admin console: <a href="https://admin.google.com">admin.google.com</a></li>
        <li>Go to <strong>Apps → Google Workspace → Gmail → Routing</strong></li>
        <li>Click <strong>Add Another Rule</strong></li>
        <li>Configure:
          <ul>
            <li><strong>From:</strong> Pay@speedycreditrepair.com</li>
            <li><strong>Forward to:</strong> CLahage@Gmail.com</li>
            <li><strong>Mark as spam:</strong> No</li>
          </ul>
        </li>
        <li>Save changes</li>
      </ol>
      
      <h3>Option 2: Create Alias in Bank Account</h3>
      <p>Many banks allow multiple email addresses for the same Zelle account:</p>
      <ol>
        <li>Log into your bank account</li>
        <li>Go to Zelle settings</li>
        <li>Look for "Manage Email Addresses" or "Add Email"</li>
        <li>Add Pay@speedycreditrepair.com as an alias</li>
        <li>Verify the email (they'll send a confirmation code)</li>
        <li>Now both emails work for the same Zelle account!</li>
      </ol>
      
      <h3>Option 3: Use Current Email with Branded Display</h3>
      <p>If forwarding isn't possible, we can use CLahage@Gmail.com in the QR code but show Pay@speedycreditrepair.com to clients:</p>
      <ul>
        <li>QR code contains: CLahage@Gmail.com (actual Zelle email)</li>
        <li>Display shows: "Send payment to Pay@speedycreditrepair.com"</li>
        <li>When they scan QR, it auto-fills CLahage@Gmail.com</li>
        <li>Client never sees the personal email directly</li>
      </ul>
      
      <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0;"><strong>⚠️ Note:</strong> Some Zelle users may see a "name mismatch" warning if the displayed email doesn't match the registered email. Using the QR code minimizes this issue.</p>
      </div>
      
      <h3>Recommended Approach for SpeedyCRM:</h3>
      <p>Use <strong>Option 3</strong> immediately while setting up Option 1 or 2 for long-term branding. The QR code generator already supports this by allowing separate <code>email</code> (actual) and <code>displayEmail</code> (branded) parameters.</p>
      
      <pre style="background: #f5f5f5; padding: 15px; border-radius: 4px; overflow-x: auto;">
const zelleCard = await generateZellePaymentCard({
  email: 'CLahage@Gmail.com',        // Actual Zelle email
  displayEmail: 'Pay@speedycreditrepair.com',  // What client sees
  amount: 99,
  note: 'Setup Fee'
});
      </pre>
    </div>
  `;
}

/**
 * Validate Zelle email format
 * 
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email format
 */
export function isValidZelleEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
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
 * EXPORT ALL FUNCTIONS
 */
export default {
  generateZelleQR,
  generateZellePaymentCard,
  generateZelleButton,
  getEmailForwardingInstructions,
  isValidZelleEmail,
  formatZelleAmount
};

/**
 * USAGE EXAMPLE IN CONTRACT SIGNING PORTAL:
 * 
 * import { generateZellePaymentCard } from '@/utils/zelleQRGenerator';
 * 
 * // When client defers banking and has setup fee:
 * const setupFee = 99;
 * 
 * const zelleCard = await generateZellePaymentCard({
 *   email: 'CLahage@Gmail.com',
 *   displayEmail: 'Pay@speedycreditrepair.com',
 *   amount: setupFee,
 *   note: `Setup Fee - Contract #${contractId}`,
 *   title: 'Pay Setup Fee via Zelle',
 *   description: 'Start your service immediately by paying the setup fee'
 * });
 * 
 * // Display the card:
 * <Box dangerouslySetInnerHTML={{ __html: zelleCard.htmlCard }} />
 * 
 * // Or just the QR code:
 * <img src={zelleCard.qrDataURL} alt="Zelle Payment QR" width="250" />
 */