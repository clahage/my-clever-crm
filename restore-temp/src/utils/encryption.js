// src/utils/encryption.js
import CryptoJS from 'crypto-js';

// Get encryption key from environment variable
const SECRET_KEY = import.meta.env.VITE_ENCRYPTION_KEY;

if (!SECRET_KEY) {
  console.error('VITE_ENCRYPTION_KEY is not set in environment variables!');
}

/**
 * Encrypt sensitive data (like SSN) before storing in Firestore
 * @param {string} data - The data to encrypt
 * @returns {string} - Encrypted string
 */
export const encryptData = (data) => {
  if (!data) return '';
  try {
    return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

/**
 * Decrypt sensitive data when retrieving from Firestore
 * @param {string} encryptedData - The encrypted string
 * @returns {string} - Decrypted original data
 */
export const decryptData = (encryptedData) => {
  if (!encryptedData) return '';
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
};

/**
 * Hash data (one-way) for verification purposes
 * @param {string} data - The data to hash
 * @returns {string} - SHA256 hash
 */
export const hashData = (data) => {
  if (!data) return '';
  return CryptoJS.SHA256(data).toString();
};

/**
 * Format SSN for display (XXX-XX-1234)
 * @param {string} ssn - Full SSN
 * @returns {string} - Masked SSN
 */
export const maskSSN = (ssn) => {
  if (!ssn || ssn.length < 4) return '***-**-****';
  const last4 = ssn.slice(-4);
  return `***-**-${last4}`;
};

/**
 * Validate SSN format (XXX-XX-XXXX or XXXXXXXXX)
 * @param {string} ssn - SSN to validate
 * @returns {boolean} - True if valid format
 */
export const isValidSSN = (ssn) => {
  if (!ssn) return false;
  // Remove any dashes or spaces
  const cleaned = ssn.replace(/[-\s]/g, '');
  // Must be exactly 9 digits
  return /^\d{9}$/.test(cleaned);
};

/**
 * Clean SSN for API submission (remove dashes/spaces)
 * @param {string} ssn - SSN with possible formatting
 * @returns {string} - Clean 9-digit SSN
 */
export const cleanSSN = (ssn) => {
  if (!ssn) return '';
  return ssn.replace(/[-\s]/g, '');
};

/**
 * Format SSN for display (adds dashes)
 * @param {string} ssn - Clean 9-digit SSN
 * @returns {string} - Formatted SSN (XXX-XX-XXXX)
 */
export const formatSSN = (ssn) => {
  if (!ssn) return '';
  const cleaned = cleanSSN(ssn);
  if (cleaned.length !== 9) return ssn;
  return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5)}`;
};

export default {
  encryptData,
  decryptData,
  hashData,
  maskSSN,
  isValidSSN,
  cleanSSN,
  formatSSN
};