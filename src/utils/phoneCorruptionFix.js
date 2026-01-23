// ===========================================================================
// Path: src/utils/phoneCorruptionFix.js
// Phone Corruption Detection and Fix Utility
// Handles phone numbers stored as strings, numbers, objects, or arrays
// © 1995-2026 Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved
// ===========================================================================

/**
 * Safely converts any phone value to a string
 * Handles: strings, numbers, objects, arrays, null, undefined
 */
const safeToString = (value) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (Array.isArray(value)) {
    // If array of phone objects, get first one
    const first = value[0];
    if (first?.number) return safeToString(first.number);
    if (first?.phone) return safeToString(first.phone);
    return safeToString(first);
  }
  if (typeof value === 'object') {
    // Handle phone object formats
    if (value.number) return safeToString(value.number);
    if (value.phone) return safeToString(value.phone);
    if (value.value) return safeToString(value.value);
    if (value.raw) return safeToString(value.raw);
    // Try to stringify as last resort
    try {
      return JSON.stringify(value);
    } catch (e) {
      return '';
    }
  }
  return String(value);
};

/**
 * Extracts phone number from various contact data formats
 * @param {Object} contactData - Contact data from Firestore
 * @returns {string} - Phone number as string
 */
const extractPhoneFromContact = (contactData) => {
  if (!contactData) return '';
  
  // Try different phone field locations
  const phoneLocations = [
    contactData.phone,
    contactData.phones?.[0]?.number,
    contactData.phones?.[0]?.phone,
    contactData.phones?.[0],
    contactData.phoneNumber,
    contactData.primaryPhone,
    contactData.mobilePhone,
    contactData.cellPhone,
    contactData.homePhone,
    contactData.workPhone
  ];
  
  for (const phone of phoneLocations) {
    const phoneStr = safeToString(phone);
    if (phoneStr && phoneStr.length >= 7) {
      return phoneStr;
    }
  }
  
  return '';
};

/**
 * Detects and corrects phone number corruption
 * @param {any} phoneInput - Phone value (string, number, object, etc.)
 * @returns {Object} - { corrected: boolean, phone: string, formatted: string, cleaned: string, original: string }
 */
export const detectAndCorrectPhoneCorruption = (phoneInput) => {
  const original = safeToString(phoneInput);
  
  if (!original) {
    return {
      corrected: false,
      phone: '',
      formatted: '',
      cleaned: '',
      original: '',
      error: null
    };
  }
  
  // Remove all non-numeric characters except + for country code
  const cleaned = original.replace(/[^\d+]/g, '');
  
  // Remove leading +1 or 1 for US numbers
  let digits = cleaned;
  if (digits.startsWith('+1')) digits = digits.slice(2);
  else if (digits.startsWith('1') && digits.length === 11) digits = digits.slice(1);
  
  // Validate: must be 10 digits for US phone
  if (digits.length !== 10) {
    return {
      corrected: false,
      phone: original,
      formatted: original,
      cleaned: digits,
      original: original,
      error: `Invalid phone length: ${digits.length} digits (expected 10)`
    };
  }
  
  // Format as (XXX) XXX-XXXX
  const formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  
  return {
    corrected: original !== formatted,
    phone: formatted,
    formatted: formatted,
    cleaned: digits,
    original: original,
    error: null
  };
};

/**
 * Processes contact phone data from Firestore
 * @param {Object} contactData - Full contact document from Firestore
 * @returns {Object} - Contact data with corrected phone
 */
export const processContactPhoneData = (contactData) => {
  if (!contactData) return contactData;
  
  try {
    // Extract phone from various possible locations
    const phone = extractPhoneFromContact(contactData);
    const result = detectAndCorrectPhoneCorruption(phone);
    
    return {
      ...contactData,
      phone: result.formatted || phone,
      phoneOriginal: phone,
      phoneCorruption: result,
      // Also update the phones array if it exists
      phones: contactData.phones?.map((p, idx) => {
        if (idx === 0) {
          const pResult = detectAndCorrectPhoneCorruption(p?.number || p);
          return {
            ...p,
            number: pResult.formatted || safeToString(p?.number || p),
            isPrimary: p?.isPrimary ?? true,
            type: p?.type || 'mobile'
          };
        }
        return p;
      }) || contactData.phones
    };
  } catch (error) {
    console.error('📞 Phone processing error:', error);
    return contactData;
  }
};

/**
 * Processes landing page data
 * @param {Object} data - Landing page form data
 * @returns {Object} - Data with corrected phone
 */
export const processLandingPageData = (data) => {
  if (!data) return data;
  
  try {
    const phone = safeToString(data?.phone || data?.phoneNumber || '');
    const result = detectAndCorrectPhoneCorruption(phone);
    
    return {
      ...data,
      phone: result.formatted || phone,
      phoneCorruption: result
    };
  } catch (error) {
    console.error('📞 Landing page phone processing error:', error);
    return data;
  }
};

/**
 * Gets phone number formatted for IDIQ enrollment API
 * IDIQ requires 10 digits only, no formatting
 * @param {any} phoneInput - Phone value in any format
 * @returns {string|null} - 10-digit string or null if invalid
 */
export const getPhoneForIDIQEnrollment = (phoneInput) => {
  const phoneStr = safeToString(phoneInput);
  if (!phoneStr) return null;
  
  // Extract only digits
  let digits = phoneStr.replace(/\D/g, '');
  
  // Handle country code
  if (digits.length === 11 && digits.startsWith('1')) {
    digits = digits.slice(1);
  }
  
  // Validate 10 digits
  if (digits.length === 10) {
    return digits;
  }
  
  console.warn(`📞 Invalid phone for IDIQ: "${phoneStr}" → ${digits.length} digits`);
  return null;
};

/**
 * Tracks phone corruption events for debugging
 * @param {Object} corruptionInfo - Result from detectAndCorrectPhoneCorruption
 * @param {string} source - Where the corruption was detected
 */
export const trackPhoneCorruption = (corruptionInfo, source) => {
  if (corruptionInfo?.corrected) {
    console.log(`📞 Phone corrected (${source}):`, {
      original: corruptionInfo.original,
      corrected: corruptionInfo.formatted,
      source
    });
  }
};

/**
 * Validates a phone number
 * @param {any} phoneInput - Phone value
 * @returns {Object} - { isValid: boolean, error: string|null, digits: string }
 */
export const validatePhone = (phoneInput) => {
  const phoneStr = safeToString(phoneInput);
  
  if (!phoneStr) {
    return { isValid: false, error: 'Phone number is required', digits: '' };
  }
  
  const digits = phoneStr.replace(/\D/g, '');
  
  if (digits.length < 10) {
    return { isValid: false, error: 'Phone number too short', digits };
  }
  
  if (digits.length > 11) {
    return { isValid: false, error: 'Phone number too long', digits };
  }
  
  if (digits.length === 11 && !digits.startsWith('1')) {
    return { isValid: false, error: 'Invalid country code', digits };
  }
  
  return { isValid: true, error: null, digits };
};

// ===== FIX FOR CHRISTOPHER'S SPECIFIC CASE =====
// This handles the "Christopher's case" where phones are stored as numbers in Firestore
export const fixPhoneCorruption = processContactPhoneData;

// Export all functions
export default {
  detectAndCorrectPhoneCorruption,
  processContactPhoneData,
  processLandingPageData,
  getPhoneForIDIQEnrollment,
  trackPhoneCorruption,
  validatePhone,
  fixPhoneCorruption,
  safeToString,
  extractPhoneFromContact
};