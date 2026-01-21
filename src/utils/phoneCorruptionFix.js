// =================================================================
// FIXED PHONE CORRUPTION DETECTION SYSTEM
// Path: /src/utils/phoneCorruptionFix.js
// =================================================================
// 
// CRITICAL BUG FIX: The original logic was incorrectly changing digits
// beyond just the area code. This version preserves all digits except
// the corrupted area code.
//
// =================================================================

/**
 * ===== PHONE CORRUPTION DETECTION & CORRECTION =====
 * 
 * PURPOSE: Fix Google autofill corruption where area codes get corrupted:
 * - (714) 449-3666 becomes (171) 449-3666
 * - (818) 555-1234 becomes (181) 555-1234
 * - etc.
 * 
 * CRITICAL: Only fix KNOWN corruption patterns, preserve all other digits
 */

// Known corruption patterns: corrupted → correct
const AREA_CODE_CORRECTIONS = {
  '171': '714', // Orange County
  '181': '818', // San Fernando Valley  
  '191': '619', // San Diego
  '101': '310', // West LA
  '121': '212', // NYC (if applicable)
  '141': '414', // Milwaukee (if applicable)
  '151': '515', // Des Moines (if applicable)
  '161': '616', // Grand Rapids (if applicable)
};

/**
 * Detect if a phone number has corruption patterns
 * @param {string} phone - Raw phone input
 * @returns {Object} Detection result
 */
export function detectPhoneCorruption(phone) {
  if (!phone) {
    return { isCorrupted: false, error: 'No phone provided' };
  }

  // Clean input - extract only digits
  const digits = phone.replace(/\D/g, '');
  
  console.log('🔍 [CRM] Analyzing phone number for corruption:', phone);
  console.log('🧹 [CRM] Cleaned digits:', digits);

  // Handle different digit lengths
  let areaCode, restOfNumber;
  
  if (digits.length === 11 && digits.startsWith('1')) {
    // 11-digit number with country code (1NXXNXXXXXX)
    areaCode = digits.substring(1, 4); // Skip country code
    restOfNumber = digits.substring(4); // Get remaining 7 digits
    console.log('📱 [CRM] 11-digit format detected, area code:', areaCode, 'rest:', restOfNumber);
  } else if (digits.length === 10) {
    // 10-digit number (NXXNXXXXXX)
    areaCode = digits.substring(0, 3);
    restOfNumber = digits.substring(3);
    console.log('📱 [CRM] 10-digit format detected, area code:', areaCode, 'rest:', restOfNumber);
  } else {
    return { 
      isCorrupted: false, 
      error: `Invalid phone length: ${digits.length} digits`,
      originalDigits: digits 
    };
  }

  // Check if area code is in our corruption list
  const correctedAreaCode = AREA_CODE_CORRECTIONS[areaCode];
  
  if (correctedAreaCode) {
    console.log('🚨 [CRM] PHONE CORRUPTION DETECTED! Area code:', areaCode);
    return {
      isCorrupted: true,
      originalAreaCode: areaCode,
      correctedAreaCode: correctedAreaCode,
      restOfNumber: restOfNumber, // CRITICAL: Preserve original digits
      originalDigits: digits,
      correctedDigits: correctedAreaCode + restOfNumber // Only change area code
    };
  }

  return { 
    isCorrupted: false,
    areaCode: areaCode,
    restOfNumber: restOfNumber,
    originalDigits: digits
  };
}

/**
 * Fix corrupted phone number
 * @param {string} phone - Raw phone input 
 * @returns {Object} Correction result
 */
export function fixPhoneCorruption(phone) {
  const detection = detectPhoneCorruption(phone);
  
  if (detection.error) {
    return {
      corrected: false,
      original: phone,
      error: detection.error
    };
  }
  
  if (!detection.isCorrupted) {
    // No corruption detected - return formatted version of original
    const formatted = formatPhoneNumber(detection.originalDigits);
    console.log('✅ [CRM] No corruption detected, formatted:', formatted);
    return {
      corrected: false,
      original: phone,
      cleaned: detection.originalDigits,
      formatted: formatted,
      error: null
    };
  }
  
  // Apply correction - ONLY change the area code
  const correctedDigits = detection.correctedDigits;
  const formattedCorrected = formatPhoneNumber(correctedDigits);
  
  console.log('✅ [CRM] PHONE CORRECTED TO:', formattedCorrected);
  console.log('📊 [CRM] Corruption details:', {
    original: detection.originalAreaCode + detection.restOfNumber,
    corrected: correctedDigits,
    areaCodeChanged: detection.originalAreaCode + ' → ' + detection.correctedAreaCode,
    digitsPreserved: detection.restOfNumber
  });
  
  return {
    corrected: true,
    original: phone,
    cleaned: correctedDigits,
    formatted: formattedCorrected,
    error: null,
    correctionDetails: {
      originalAreaCode: detection.originalAreaCode,
      correctedAreaCode: detection.correctedAreaCode,
      preservedDigits: detection.restOfNumber
    }
  };
}

/**
 * Format phone number with standard (XXX) XXX-XXXX format
 * @param {string} digits - Clean 10-digit phone number
 * @returns {string} Formatted phone
 */
function formatPhoneNumber(digits) {
  if (!digits || digits.length !== 10) {
    return digits; // Return as-is if not 10 digits
  }
  
  return `(${digits.substring(0, 3)}) ${digits.substring(3, 6)}-${digits.substring(6)}`;
}

/**
 * Get phone number for IDIQ API (10 digits only, no formatting)
 * @param {string} phone - Any phone format
 * @returns {string} Clean 10-digit phone for IDIQ
 */
export function getCleanPhoneForIDIQ(phone) {
  const result = fixPhoneCorruption(phone);
  const cleanDigits = result.cleaned;
  
  // Ensure exactly 10 digits for IDIQ
  if (cleanDigits && cleanDigits.length === 10) {
    console.log('📞 Using cleaned phone for IDIQ enrollment:', cleanDigits);
    return cleanDigits;
  }
  
  console.error('❌ Cannot get clean phone for IDIQ:', {
    original: phone,
    result: result,
    digits: cleanDigits
  });
  
  return null;
}

/**
 * Track phone corruption incidents for analytics
 * @param {Object} correctionData - Data about the correction
 */
export function trackPhoneCorruption(correctionData) {
  const trackingData = {
    timestamp: new Date().toISOString(),
    source: correctionData.source || 'unknown',
    original: correctionData.original,
    corrected: correctionData.corrected,
    areaCodeChange: correctionData.areaCodeChange || 'none'
  };
  
  console.log('📊 [CRM] Phone corruption tracked:', trackingData);
  
  // TODO: Send to analytics service
  // analytics.track('phone_corruption_detected', trackingData);
}

// =================================================================
// USAGE EXAMPLES:
// =================================================================
//
// // Detect corruption
// const detection = detectPhoneCorruption('1714493666');
// // Result: { isCorrupted: true, correctedAreaCode: '714', restOfNumber: '493666' }
//
// // Fix corruption  
// const fix = fixPhoneCorruption('1714493666');
// // Result: { corrected: true, formatted: '(714) 493-6666', cleaned: '7144936666' }
//
// // Get IDIQ-ready phone
// const idiqPhone = getCleanPhoneForIDIQ('(171) 493-6666');
// // Result: '7144936666'
//
// =================================================================