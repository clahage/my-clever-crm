// ============================================================================
// Path: /src/utils/scrSignatureGenerator.js
// © 1995-2026 Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved
// Trademark registered USPTO, violations prosecuted.
//
// SCR SIGNATURE GENERATOR — PROGRAMMATIC SIGNATURE CREATION
// ============================================================================
// Generates a professional digital signature for Christopher Lahage
// to be auto-applied to contracts when clients complete their signatures.
//
// FEATURES:
//   - Generates signature as base64 PNG data URL
//   - Professional cursive/script style font
//   - Consistent appearance across all documents
//   - Cached for performance (generate once, reuse)
//   - Optional upload to Firebase Storage for persistence
//
// USAGE:
//   import { generateSCRSignature } from '@/utils/scrSignatureGenerator';
//   
//   const signature = await generateSCRSignature();
//   // Returns: "data:image/png;base64,iVBORw0KGgoAAAANS..."
//
// INTEGRATION:
//   - ContractSigningPortal: Auto-applies when client finishes signing
//   - AdminAddendumFlow: Signs addendums automatically
//   - Any document requiring SCR signature
// ============================================================================

/**
 * Generates a professional signature image for Christopher Lahage
 * 
 * @param {Object} options - Generation options
 * @param {number} options.width - Canvas width (default: 600)
 * @param {number} options.height - Canvas height (default: 180)
 * @param {string} options.font - Font style (default: 'Dancing Script')
 * @param {string} options.color - Signature color (default: '#1a365d')
 * @returns {Promise<string>} Base64 PNG data URL
 */
export async function generateSCRSignature(options = {}) {
  const {
    width = 600,
    height = 180,
    font = 'Dancing Script', // Cursive font (must be loaded in app)
    color = '#1a365d',
    fontSize = 48
  } = options;

  return new Promise((resolve, reject) => {
    try {
      // ===== Create canvas element =====
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      // ===== Fill background with white =====
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // ===== Configure text style =====
      ctx.fillStyle = color;
      ctx.font = `${fontSize}px "${font}", cursive`;
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';

      // ===== Draw signature text =====
      const signatureText = 'Christopher Lahage';
      const x = 20; // Left padding
      const y = height / 2; // Vertical center

      ctx.fillText(signatureText, x, y);

      // ===== Add subtle underline =====
      const textWidth = ctx.measureText(signatureText).width;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y + 30);
      ctx.lineTo(x + textWidth, y + 30);
      ctx.stroke();

      // ===== Add title below =====
      ctx.font = `16px "Arial", sans-serif`;
      ctx.fillStyle = '#666';
      ctx.textAlign = 'left';
      ctx.fillText('Owner & CEO', x, y + 55);
      ctx.fillText('Speedy Credit Repair Inc.', x, y + 75);

      // ===== Add date on right side =====
      const currentDate = new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
      ctx.textAlign = 'right';
      ctx.fillText(currentDate, width - 20, y + 75);

      // ===== Convert to data URL =====
      const dataURL = canvas.toDataURL('image/png');

      console.log('✅ SCR signature generated successfully');
      console.log(`   Size: ${Math.round(dataURL.length / 1024)}KB`);

      resolve(dataURL);
    } catch (error) {
      console.error('❌ Error generating SCR signature:', error);
      reject(error);
    }
  });
}

/**
 * Simplified signature generator with minimal styling
 * (Fallback if font loading fails)
 * 
 * @param {Object} options - Generation options
 * @returns {Promise<string>} Base64 PNG data URL
 */
export async function generateSimpleSCRSignature(options = {}) {
  const {
    width = 600,
    height = 180,
    color = '#1a365d'
  } = options;

  return new Promise((resolve) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      // White background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // Simple signature text (fallback to system fonts)
      ctx.fillStyle = color;
      ctx.font = `italic bold 42px Georgia, serif`;
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';

      const x = 20;
      const y = height / 2;

      ctx.fillText('Christopher Lahage', x, y);

      // Underline
      const textWidth = ctx.measureText('Christopher Lahage').width;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y + 25);
      ctx.lineTo(x + textWidth, y + 25);
      ctx.stroke();

      // Title
      ctx.font = `14px Arial, sans-serif`;
      ctx.fillStyle = '#666';
      ctx.fillText('Owner & CEO, Speedy Credit Repair Inc.', x, y + 50);

      // Date
      const currentDate = new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
      ctx.textAlign = 'right';
      ctx.fillText(currentDate, width - 20, y + 50);

      const dataURL = canvas.toDataURL('image/png');
      resolve(dataURL);
    } catch (error) {
      console.error('❌ Error generating simple SCR signature:', error);
      // Return empty data URL as last resort
      resolve('data:image/png;base64,');
    }
  });
}

/**
 * Preload cursive font for signature generation
 * Call this in app initialization to ensure font is ready
 * 
 * @returns {Promise<boolean>} True if font loaded successfully
 */
export async function preloadSignatureFont() {
  try {
    // Check if Dancing Script font is available
    await document.fonts.load('48px "Dancing Script"');
    console.log('✅ Signature font loaded');
    return true;
  } catch (error) {
    console.warn('⚠️ Signature font not available, will use fallback');
    return false;
  }
}

/**
 * Generate and cache SCR signature
 * Stores in localStorage for quick reuse
 * 
 * @param {boolean} forceRegenerate - Force new generation even if cached
 * @returns {Promise<string>} Base64 PNG data URL
 */
export async function getCachedSCRSignature(forceRegenerate = false) {
  const cacheKey = 'scr_signature_cache';
  const cacheTimestampKey = 'scr_signature_timestamp';

  // Check cache
  if (!forceRegenerate) {
    const cached = localStorage.getItem(cacheKey);
    const timestamp = localStorage.getItem(cacheTimestampKey);

    // Cache valid for 30 days
    const cacheAge = Date.now() - parseInt(timestamp || '0');
    const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days

    if (cached && cacheAge < maxAge) {
      console.log('📦 Using cached SCR signature');
      return cached;
    }
  }

  // Generate new signature
  console.log('🎨 Generating new SCR signature...');
  let signature;

  try {
    // Try fancy version first
    await preloadSignatureFont();
    signature = await generateSCRSignature();
  } catch (error) {
    console.warn('⚠️ Falling back to simple signature');
    signature = await generateSimpleSCRSignature();
  }

  // Cache for future use
  try {
    localStorage.setItem(cacheKey, signature);
    localStorage.setItem(cacheTimestampKey, Date.now().toString());
    console.log('💾 Cached SCR signature');
  } catch (error) {
    console.warn('⚠️ Could not cache signature:', error);
  }

  return signature;
}

/**
 * Upload SCR signature to Firebase Storage
 * (Optional - for persistence across devices)
 * 
 * @param {Object} storage - Firebase storage instance
 * @param {string} signatureDataURL - Base64 data URL
 * @returns {Promise<string>} Download URL
 */
export async function uploadSCRSignature(storage, signatureDataURL) {
  const { ref, uploadString, getDownloadURL } = await import('firebase/storage');

  try {
    const storageRef = ref(storage, 'signatures/scr_christopher_lahage.png');
    
    // Upload base64 data
    await uploadString(storageRef, signatureDataURL, 'data_url');
    
    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);
    
    console.log('✅ SCR signature uploaded to Firebase Storage');
    console.log(`   URL: ${downloadURL}`);
    
    return downloadURL;
  } catch (error) {
    console.error('❌ Error uploading SCR signature:', error);
    throw error;
  }
}

/**
 * EXAMPLE USAGE:
 * 
 * // In ContractSigningPortal:
 * import { getCachedSCRSignature } from '@/utils/scrSignatureGenerator';
 * 
 * useEffect(() => {
 *   const checkAllSignatures = async () => {
 *     if (allClientSignaturesComplete && !scrSignatureApplied) {
 *       const scrSig = await getCachedSCRSignature();
 *       applySCRSignature(scrSig);
 *     }
 *   };
 *   checkAllSignatures();
 * }, [signatures, initials]);
 * 
 * 
 * // To force regeneration (e.g., if signature style changes):
 * const newSig = await getCachedSCRSignature(true);
 * 
 * 
 * // To upload to Firebase (one-time setup):
 * import { storage } from '@/lib/firebase';
 * const signature = await getCachedSCRSignature();
 * const url = await uploadSCRSignature(storage, signature);
 * console.log('Signature URL:', url);
 */

export default {
  generateSCRSignature,
  generateSimpleSCRSignature,
  preloadSignatureFont,
  getCachedSCRSignature,
  uploadSCRSignature
};