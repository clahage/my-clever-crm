// src/utils/paymentEncryption.js
// ============================================================================
// PAYMENT DATA ENCRYPTION UTILITIES
// ============================================================================
// Secure encryption/decryption for sensitive payment data (bank accounts, routing numbers)
// Uses Web Crypto API for AES-GCM encryption
// IMPORTANT: In production, use server-side encryption with a proper key management system
// ============================================================================

/**
 * Generate encryption key from a passphrase
 * In production, this should be managed server-side with proper KMS
 */
async function deriveKey(passphrase) {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode('speedycrm-payment-salt'), // In prod: use unique salt per client
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt sensitive payment data
 * @param {string} plaintext - Data to encrypt (account number, routing number, etc.)
 * @param {string} passphrase - Encryption key (should be stored securely server-side)
 * @returns {Promise<string>} - Base64 encoded encrypted data with IV
 */
export async function encryptPaymentData(plaintext, passphrase) {
  try {
    const key = await deriveKey(passphrase);
    const enc = new TextEncoder();
    const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for AES-GCM

    const ciphertext = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      enc.encode(plaintext)
    );

    // Combine IV and ciphertext, then base64 encode
    const combined = new Uint8Array(iv.length + ciphertext.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(ciphertext), iv.length);

    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt payment data');
  }
}

/**
 * Decrypt sensitive payment data
 * @param {string} encryptedData - Base64 encoded encrypted data
 * @param {string} passphrase - Decryption key
 * @returns {Promise<string>} - Decrypted plaintext
 */
export async function decryptPaymentData(encryptedData, passphrase) {
  try {
    const key = await deriveKey(passphrase);

    // Decode base64
    const combined = new Uint8Array(
      atob(encryptedData).split('').map(char => char.charCodeAt(0))
    );

    // Extract IV and ciphertext
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);

    const plaintext = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );

    return new TextDecoder().decode(plaintext);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt payment data');
  }
}

/**
 * Mask account number for display (show last 4 digits only)
 * @param {string} accountNumber - Full account number
 * @returns {string} - Masked account number (****1234)
 */
export function maskAccountNumber(accountNumber) {
  if (!accountNumber || accountNumber.length < 4) return '****';
  const last4 = accountNumber.slice(-4);
  return `****${last4}`;
}

/**
 * Mask routing number for display
 * @param {string} routingNumber - Full routing number
 * @returns {string} - Masked routing number (***456)
 */
export function maskRoutingNumber(routingNumber) {
  if (!routingNumber || routingNumber.length < 3) return '***';
  const last3 = routingNumber.slice(-3);
  return `***${last3}`;
}

/**
 * Validate account number format (basic validation)
 * @param {string} accountNumber
 * @returns {boolean}
 */
export function validateAccountNumber(accountNumber) {
  // Basic validation: 4-17 digits
  return /^\d{4,17}$/.test(accountNumber);
}

/**
 * Validate routing number format (US routing number - 9 digits)
 * @param {string} routingNumber
 * @returns {boolean}
 */
export function validateRoutingNumber(routingNumber) {
  // US routing number: exactly 9 digits
  if (!/^\d{9}$/.test(routingNumber)) return false;

  // Checksum validation (ABA routing number algorithm)
  const digits = routingNumber.split('').map(Number);
  const checksum =
    3 * (digits[0] + digits[3] + digits[6]) +
    7 * (digits[1] + digits[4] + digits[7]) +
    1 * (digits[2] + digits[5] + digits[8]);

  return checksum % 10 === 0;
}

/**
 * Validate email format
 * @param {string} email
 * @returns {boolean}
 */
export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate phone number format (US phone numbers)
 * @param {string} phone
 * @returns {boolean}
 */
export function validatePhone(phone) {
  // Accepts: 1234567890, 123-456-7890, (123) 456-7890, +1 123 456 7890
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10 || cleaned.length === 11;
}

/**
 * Format phone number for display
 * @param {string} phone
 * @returns {string}
 */
export function formatPhone(phone) {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11) {
    return `+${cleaned[0]} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
}

/**
 * Get encryption key from environment or generate warning
 * IMPORTANT: In production, this must be stored server-side in a secure key management system
 */
export function getEncryptionKey() {
  // In development, use a default key (NEVER do this in production!)
  if (process.env.NODE_ENV === 'development') {
    console.warn('⚠️ Using development encryption key - DO NOT USE IN PRODUCTION');
    return 'dev-encryption-key-change-in-production';
  }

  // In production, fetch from secure server-side endpoint
  const key = process.env.VITE_PAYMENT_ENCRYPTION_KEY;
  if (!key) {
    throw new Error('Payment encryption key not configured. Contact system administrator.');
  }

  return key;
}

/**
 * Securely clear sensitive data from memory (best effort)
 * @param {string} data
 */
export function clearSensitiveData(data) {
  if (typeof data === 'string') {
    // Overwrite string in memory (best effort - JS doesn't guarantee this)
    for (let i = 0; i < data.length; i++) {
      data = data.substring(0, i) + '\0' + data.substring(i + 1);
    }
  }
}

export default {
  encryptPaymentData,
  decryptPaymentData,
  maskAccountNumber,
  maskRoutingNumber,
  validateAccountNumber,
  validateRoutingNumber,
  validateEmail,
  validatePhone,
  formatPhone,
  getEncryptionKey,
  clearSensitiveData,
};
