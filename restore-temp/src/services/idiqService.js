// src/services/idiqService.js
// Unified IDIQ Credit Report Service
// Handles authentication, report pulling, and data management

import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

// ============================================================================
// CONFIGURATION
// ============================================================================

const IDIQ_CONFIG = {
  tokenUrl: import.meta.env.VITE_IDIQ_API_ENDPOINT,
  partnerId: import.meta.env.VITE_IDIQ_PARTNER_ID,
  partnerSecret: import.meta.env.VITE_IDIQ_PARTNER_SECRET,
  secretPhrase: import.meta.env.VITE_IDIQ_SECRET_PHRASE,
  environment: import.meta.env.VITE_IDIQ_ENV || 'prod',
  offerCode: import.meta.env.VITE_IDIQ_OFFER_CODE,
  planCode: import.meta.env.VITE_IDIQ_PLAN_CODE
};

// Token cache (prevents unnecessary API calls)
let cachedToken = null;
let tokenExpiry = null;

// ============================================================================
// AUTHENTICATION
// ============================================================================

/**
 * Get IDIQ Partner Token via Cloud Function
 * Uses your existing working endpoint
 */
export async function getIDIQToken(forceRefresh = false) {
  // Return cached token if still valid
  if (!forceRefresh && cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    console.log('🔑 Using cached IDIQ token');
    return cachedToken;
  }

  console.log('🔑 Fetching new IDIQ token...');

  try {
    const response = await fetch(IDIQ_CONFIG.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`IDIQ token fetch failed (${response.status}): ${errorText}`);
    }

    const data = await response.json();

    if (!data?.success || !data?.token) {
      throw new Error('IDIQ token not returned in response');
    }

    // Cache the token
    cachedToken = data.token;
    tokenExpiry = Date.now() + (data.expiresIn ? data.expiresIn * 1000 : 3600000); // Default 1 hour

    console.log('✅ IDIQ token obtained successfully');
    return cachedToken;

  } catch (error) {
    console.error('❌ IDIQ token fetch error:', error);
    throw new Error(`Failed to obtain IDIQ token: ${error.message}`);
  }
}

// ============================================================================
// CREDIT REPORT OPERATIONS
// ============================================================================

/**
 * Enroll member and pull credit report
 * This is your "free credit report" offer flow
 */
export async function enrollMemberAndPullReport(memberData) {
  console.log('📋 Enrolling member and pulling credit report...', memberData.email);

  try {
    // Step 1: Get authentication token
    const token = await getIDIQToken();

    // Step 2: Enroll member with IDIQ
    const enrollmentPayload = {
      firstName: memberData.firstName,
      lastName: memberData.lastName,
      email: memberData.email,
      dateOfBirth: memberData.birthDate,
      ssn: memberData.ssn,
      address: {
        street: memberData.street,
        city: memberData.city,
        state: memberData.state,
        zip: memberData.zip
      },
      offerCode: IDIQ_CONFIG.offerCode,
      planCode: IDIQ_CONFIG.planCode,
      partnerId: IDIQ_CONFIG.partnerId,
      secretPhrase: IDIQ_CONFIG.secretPhrase
    };

    // Make enrollment request to IDIQ API
    const enrollResponse = await fetch('https://api.idiq.com/v1/enroll', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(enrollmentPayload)
    });

    if (!enrollResponse.ok) {
      const errorData = await enrollResponse.json();
      throw new Error(`Enrollment failed: ${errorData.message || enrollResponse.statusText}`);
    }

    const enrollResult = await enrollResponse.json();

    // Step 3: Store enrollment in Firestore
    const firestoreData = {
      memberId: enrollResult.memberId || null,
      email: memberData.email,
      firstName: memberData.firstName,
      lastName: memberData.lastName,
      enrolledAt: new Date().toISOString(),
      status: 'enrolled',
      idiqResponse: enrollResult,
      reportStatus: 'pending'
    };

    const docRef = await addDoc(collection(db, 'creditReportRequests'), firestoreData);

    console.log('✅ Member enrolled successfully:', docRef.id);

    return {
      success: true,
      requestId: docRef.id,
      memberId: enrollResult.memberId,
      message: 'Enrollment successful. Credit report will be available shortly.'
    };

  } catch (error) {
    console.error('❌ Enrollment error:', error);
    throw error;
  }
}

/**
 * Pull credit report for existing member
 * Used for monthly updates
 */
export async function pullCreditReport(memberEmail) {
  console.log('📊 Pulling credit report for:', memberEmail);

  try {
    const token = await getIDIQToken();

    // Call IDIQ API to get report
    const reportResponse = await fetch(`https://api.idiq.com/v1/report?email=${encodeURIComponent(memberEmail)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!reportResponse.ok) {
      throw new Error(`Failed to pull report: ${reportResponse.statusText}`);
    }

    const reportData = await reportResponse.json();

    // Store report in Firestore
    await addDoc(collection(db, 'creditReports'), {
      email: memberEmail,
      pulledAt: new Date().toISOString(),
      reportData: reportData,
      provider: 'IDIQ',
      status: 'ready'
    });

    console.log('✅ Credit report pulled successfully');

    return {
      success: true,
      report: reportData
    };

  } catch (error) {
    console.error('❌ Credit report pull error:', error);
    throw error;
  }
}

/**
 * Get latest credit report from Firestore
 */
export async function getLatestReport(memberEmail) {
  try {
    const q = query(
      collection(db, 'creditReports'),
      where('email', '==', memberEmail),
      orderBy('pulledAt', 'desc'),
      limit(1)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    };

  } catch (error) {
    console.error('❌ Error fetching latest report:', error);
    throw error;
  }
}

/**
 * Get report history for comparison
 */
export async function getReportHistory(memberEmail, limitCount = 12) {
  try {
    const q = query(
      collection(db, 'creditReports'),
      where('email', '==', memberEmail),
      orderBy('pulledAt', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

  } catch (error) {
    console.error('❌ Error fetching report history:', error);
    throw error;
  }
}

// ============================================================================
// VANTAGESCORE & FICO SCORE EXTRACTION
// ============================================================================

/**
 * Extract all score models from IDIQ report
 * IDIQ provides VantageScore, we'll calculate FICO estimates
 */
export function extractScores(reportData) {
  const scores = {
    vantage: {
      score: reportData.vantageScore || null,
      version: reportData.vantageVersion || '3.0',
      date: reportData.scoreDate || null
    },
    fico: {
      // IDIQ may not provide FICO directly, so we estimate or mark as unavailable
      fico8: estimateFICO8(reportData),
      ficoAuto: estimateFICOAuto(reportData),
      ficoMortgage: estimateFICOMortgage(reportData)
    },
    bureaus: {
      experian: reportData.experianScore || null,
      equifax: reportData.equifaxScore || null,
      transunion: reportData.transunionScore || null
    }
  };

  return scores;
}

/**
 * Estimate FICO 8 from VantageScore (rough approximation)
 */
function estimateFICO8(reportData) {
  const vantage = reportData.vantageScore;
  if (!vantage) return null;

  // Rough conversion: FICO tends to be 10-30 points lower than VantageScore
  const estimated = Math.round(vantage - 20);
  
  return {
    estimated: true,
    score: Math.max(300, Math.min(850, estimated)),
    note: 'Estimated from VantageScore'
  };
}

function estimateFICOAuto(reportData) {
  const fico8 = estimateFICO8(reportData);
  if (!fico8) return null;

  // Auto scores weight payment history more heavily
  return {
    estimated: true,
    score: fico8.score,
    note: 'Estimated from FICO 8'
  };
}

function estimateFICOMortgage(reportData) {
  const fico8 = estimateFICO8(reportData);
  if (!fico8) return null;

  // Mortgage scores are typically more conservative
  return {
    estimated: true,
    score: Math.max(300, fico8.score - 10),
    note: 'Estimated from FICO 8'
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Test IDIQ connection
 */
export async function testIDIQConnection() {
  try {
    const token = await getIDIQToken();
    return {
      success: true,
      message: 'IDIQ connection successful',
      hasToken: !!token
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * Clear token cache (useful for debugging)
 */
export function clearTokenCache() {
  cachedToken = null;
  tokenExpiry = null;
  console.log('🗑️ IDIQ token cache cleared');
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  getIDIQToken,
  enrollMemberAndPullReport,
  pullCreditReport,
  getLatestReport,
  getReportHistory,
  extractScores,
  testIDIQConnection,
  clearTokenCache
};