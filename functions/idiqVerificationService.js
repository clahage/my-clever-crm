// ============================================================================
// Path: functions/idiqVerificationService.js
// ============================================================================
// IDIQ VERIFICATION SERVICE - Complete Enrollment + Identity Verification
// ============================================================================
// This module adds the MISSING verification workflow to your IDIQ integration.
// 
// PROBLEM SOLVED:
// - Current flow: Enroll → IDIQ sends "complete your setup" email
// - Complete flow: Enroll → Member Token → Verification Questions → Submit → Report
//
// USAGE: Add these actions to your existing idiqService Firebase function
// 
// © 1995-2026 Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved
// ============================================================================

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const fetch = require('node-fetch');

// ============================================================================
// CONFIGURATION
// ============================================================================
// Production Base URL (use this for live enrollments)
const PIF_BASE_URL = 'https://api.identityiq.com/pif-service';

// Stage/Testing Base URL (use this for testing)
// const PIF_BASE_URL = 'https://api-stage.identityiq.com/pif-service';

// ============================================================================
// HELPER: Get Partner Token
// ============================================================================
// This gets your partner-level authentication token
// Required for: enrollment, getting member tokens
async function getPartnerToken() {
  try {
    // Get credentials from Firebase secrets
    const partnerId = process.env.IDIQ_PARTNER_ID || functions.config().idiq?.partner_id;
    const partnerSecret = process.env.IDIQ_PARTNER_SECRET || functions.config().idiq?.partner_secret;
    
    if (!partnerId || !partnerSecret) {
      throw new Error('IDIQ credentials not configured in Firebase secrets');
    }
    
    console.log('🔑 Getting IDIQ Partner Token...');
    
    const response = await fetch(`${PIF_BASE_URL}/v1/partner-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        partnerId: partnerId,
        partnerSecret: partnerSecret
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Partner token error:', response.status, errorText);
      throw new Error(`Failed to get partner token: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('✅ Partner token obtained, expires in:', data.expiresIn, 'seconds');
    
    return data.accessToken;
    
  } catch (error) {
    console.error('❌ getPartnerToken error:', error);
    throw error;
  }
}

// ============================================================================
// HELPER: Get Member Token
// ============================================================================
// This gets a member-specific authentication token
// Required for: verification questions, pulling credit reports
// MUST be called AFTER enrollment with the member's email
async function getMemberToken(partnerToken, memberEmail) {
  try {
    console.log('🔑 Getting IDIQ Member Token for:', memberEmail);
    
    const response = await fetch(`${PIF_BASE_URL}/v1/member-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${partnerToken}`
      },
      body: JSON.stringify({
        memberEmail: memberEmail
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Member token error:', response.status, errorText);
      throw new Error(`Failed to get member token: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('✅ Member token obtained, expires in:', data.expiresIn, 'seconds');
    
    return data.accessToken;
    
  } catch (error) {
    console.error('❌ getMemberToken error:', error);
    throw error;
  }
}

// ============================================================================
// ACTION: enrollMember
// ============================================================================
// Step 1 of the flow - Creates the IDIQ membership
// Returns: { success, membershipNumber, needsVerification: true }
async function enrollMember(data) {
  try {
    const { 
      firstName, lastName, middleNameInitial,
      email, ssn, birthDate,
      street, city, state, zip,
      offerCode, planCode,
      contactId  // Optional: Link to Firestore contact
    } = data;
    
    // Validate required fields
    if (!firstName || !lastName || !email || !ssn || !birthDate) {
      throw new Error('Missing required enrollment fields');
    }
    if (!street || !city || !state || !zip) {
      throw new Error('Missing required address fields');
    }
    if (!offerCode || !planCode) {
      throw new Error('Missing required plan/offer codes');
    }
    
    // Get partner token
    const partnerToken = await getPartnerToken();
    
    // Format birthDate to MM/DD/YYYY if needed
    let formattedBirthDate = birthDate;
    if (birthDate.includes('-')) {
      const [year, month, day] = birthDate.split('-');
      formattedBirthDate = `${month}/${day}/${year}`;
    }
    
    // Clean SSN (remove dashes/spaces)
    const cleanSSN = ssn.replace(/\D/g, '');
    if (cleanSSN.length !== 9) {
      throw new Error('SSN must be exactly 9 digits');
    }
    
    console.log('📝 Enrolling member:', email);
    
    const enrollResponse = await fetch(`${PIF_BASE_URL}/v1/enrollment/enroll`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${partnerToken}`
      },
      body: JSON.stringify({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        middleNameInitial: middleNameInitial || '',
        email: email.trim().toLowerCase(),
        ssn: cleanSSN,
        birthDate: formattedBirthDate,
        street: street.trim(),
        city: city.trim(),
        state: state.toUpperCase(),
        zip: zip.replace(/\D/g, ''),
        offerCode: offerCode,
        planCode: planCode
      })
    });
    
    if (!enrollResponse.ok) {
      const errorText = await enrollResponse.text();
      console.error('❌ Enrollment error:', enrollResponse.status, errorText);
      
      // Parse common error messages
      if (errorText.includes('already enrolled') || errorText.includes('already exists')) {
        throw new Error('This email is already enrolled with IDIQ. The user can log in at member.identityiq.com');
      }
      
      throw new Error(`Enrollment failed: ${errorText}`);
    }
    
    const enrollData = await enrollResponse.json();
    console.log('✅ Enrollment successful:', enrollData);
    
    // Store enrollment in Firestore for tracking
    const db = admin.firestore();
    const enrollmentDoc = {
      email: email.trim().toLowerCase(),
      membershipNumber: enrollData.membershipNumber || enrollData.MembershipNumber,
      contactId: contactId || null,
      enrollmentStep: 'enrolled', // enrolled → verification_pending → verified → completed
      verificationStatus: 'pending', // pending → verified → failed → locked
      verificationAttempts: 0,
      maxAttempts: 3,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastActivity: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await db.collection('idiqEnrollments').doc(email.trim().toLowerCase()).set(
      enrollmentDoc,
      { merge: true }
    );
    
    return {
      success: true,
      membershipNumber: enrollData.membershipNumber || enrollData.MembershipNumber,
      needsVerification: true,
      message: 'Enrollment successful! Identity verification required to access credit report.',
      nextStep: 'getVerificationQuestions'
    };
    
  } catch (error) {
    console.error('❌ enrollMember error:', error);
    throw error;
  }
}

// ============================================================================
// ACTION: getVerificationQuestions
// ============================================================================
// Step 2 of the flow - Gets identity verification questions from credit bureaus
// These are questions like:
// - "Which street name are you associated with?"
// - "What state was your SSN issued?"
// - "Which is a current or previous employer?"
//
// Returns: { success, questions: [...], isSuccess, message }
async function getVerificationQuestions(data) {
  try {
    const { email } = data;
    
    if (!email) {
      throw new Error('Email is required to get verification questions');
    }
    
    const cleanEmail = email.trim().toLowerCase();
    
    // Get tokens
    const partnerToken = await getPartnerToken();
    const memberToken = await getMemberToken(partnerToken, cleanEmail);
    
    console.log('❓ Getting verification questions for:', cleanEmail);
    
    const response = await fetch(`${PIF_BASE_URL}/v1/enrollment/verification-questions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${memberToken}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Verification questions error:', response.status, errorText);
      
      // Check if already verified
      if (errorText.includes('already verified') || response.status === 422) {
        return {
          success: true,
          alreadyVerified: true,
          message: 'Identity already verified. Ready to pull credit report.'
        };
      }
      
      throw new Error(`Failed to get verification questions: ${errorText}`);
    }
    
    const questionsData = await response.json();
    console.log('✅ Got verification questions:', questionsData.questions?.length || 0, 'questions');
    
    // Store questions in Firestore for reference (in case user refreshes page)
    const db = admin.firestore();
    await db.collection('idiqEnrollments').doc(cleanEmail).update({
      enrollmentStep: 'verification_pending',
      verificationQuestions: questionsData.questions,
      questionsReceivedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastActivity: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return {
      success: questionsData.isSuccess,
      questions: questionsData.questions,
      message: questionsData.message || 'Please answer the following identity verification questions.',
      tip: '💡 These questions come from your credit file. Select the answers that match your history. If none apply, choose "None of the Above".'
    };
    
  } catch (error) {
    console.error('❌ getVerificationQuestions error:', error);
    throw error;
  }
}

// ============================================================================
// ACTION: submitVerificationAnswers
// ============================================================================
// Step 3 of the flow - Submit the user's answers to verification questions
// 
// Input: { email, answers: ['answer-id-1', 'answer-id-2', ...] }
// 
// VerificationStatus responses:
// - Correct (0) = Verification passed! Can pull credit report now
// - MoreQuestions (1) = Additional questions required (returns new question)
// - Incorrect (2) = Wrong answers, try again (max 3 attempts)
// - AccountCodeMissing (3) = Configuration issue
// - Error (4) = API error
//
// Returns: { success, status, verified, nextStep, ... }
async function submitVerificationAnswers(data) {
  try {
    const { email, answers } = data;
    
    if (!email) {
      throw new Error('Email is required');
    }
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      throw new Error('Answers array is required');
    }
    
    const cleanEmail = email.trim().toLowerCase();
    const db = admin.firestore();
    
    // Check enrollment status and attempt count
    const enrollmentDoc = await db.collection('idiqEnrollments').doc(cleanEmail).get();
    if (!enrollmentDoc.exists) {
      throw new Error('No enrollment found for this email. Please start enrollment first.');
    }
    
    const enrollment = enrollmentDoc.data();
    
    // Check if already verified
    if (enrollment.verificationStatus === 'verified') {
      return {
        success: true,
        verified: true,
        message: 'Identity already verified. Ready to pull credit report.',
        nextStep: 'pullCreditReport'
      };
    }
    
    // Check if locked out
    if (enrollment.verificationStatus === 'locked') {
      return {
        success: false,
        verified: false,
        locked: true,
        message: 'Account locked due to too many failed verification attempts. Please contact IDIQ support at 1-877-875-4347 (Mon-Fri 5AM-4PM PT) or call Speedy Credit Repair for assistance.',
        nextStep: 'contactSupport'
      };
    }
    
    // Check attempt count
    const attempts = (enrollment.verificationAttempts || 0) + 1;
    if (attempts > 3) {
      await db.collection('idiqEnrollments').doc(cleanEmail).update({
        verificationStatus: 'locked',
        lastActivity: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // Send alert email to Laurie about locked account
      // (You can trigger your emailService here)
      console.log('⚠️ ALERT: Account locked for', cleanEmail, '- notify Laurie');
      
      return {
        success: false,
        verified: false,
        locked: true,
        message: 'Maximum verification attempts exceeded. Account locked.',
        nextStep: 'contactSupport'
      };
    }
    
    // Get tokens
    const partnerToken = await getPartnerToken();
    const memberToken = await getMemberToken(partnerToken, cleanEmail);
    
    console.log('📤 Submitting verification answers for:', cleanEmail, 'Attempt:', attempts);
    
    const response = await fetch(`${PIF_BASE_URL}/v1/enrollment/verification-questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${memberToken}`
      },
      body: JSON.stringify({
        answers: answers
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Submit answers error:', response.status, errorText);
      throw new Error(`Failed to submit verification answers: ${errorText}`);
    }
    
    const result = await response.json();
    console.log('📥 Verification result:', result);
    
    // Handle different status codes
    // Correct = 0, MoreQuestions = 1, Incorrect = 2, AccountCodeMissing = 3, Error = 4
    const statusMap = {
      'Correct': 0,
      'MoreQuestions': 1,
      'Incorrect': 2,
      'AccountCodeMissing': 3,
      'Error': 4
    };
    
    const statusCode = typeof result.status === 'number' ? result.status : statusMap[result.status];
    
    switch (statusCode) {
      // ============================================================
      // STATUS: CORRECT (0) - Verification Passed! 🎉
      // ============================================================
      case 0:
        console.log('✅ Verification PASSED for:', cleanEmail);
        
        await db.collection('idiqEnrollments').doc(cleanEmail).update({
          enrollmentStep: 'verified',
          verificationStatus: 'verified',
          verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
          lastActivity: admin.firestore.FieldValue.serverTimestamp()
        });
        
        return {
          success: true,
          verified: true,
          status: 'Correct',
          message: '✅ Identity verified successfully! Ready to pull your credit report.',
          nextStep: 'pullCreditReport'
        };
      
      // ============================================================
      // STATUS: MORE QUESTIONS (1) - Additional question needed
      // ============================================================
      case 1:
        console.log('❓ More questions required for:', cleanEmail);
        
        await db.collection('idiqEnrollments').doc(cleanEmail).update({
          additionalQuestion: result.question,
          lastActivity: admin.firestore.FieldValue.serverTimestamp()
        });
        
        return {
          success: true,
          verified: false,
          status: 'MoreQuestions',
          message: 'Please answer one more question to complete verification.',
          additionalQuestion: result.question,
          nextStep: 'answerAdditionalQuestion'
        };
      
      // ============================================================
      // STATUS: INCORRECT (2) - Wrong answers
      // ============================================================
      case 2:
        console.log('❌ Incorrect answers for:', cleanEmail, 'Attempt:', attempts);
        
        const attemptsRemaining = 3 - attempts;
        
        await db.collection('idiqEnrollments').doc(cleanEmail).update({
          verificationAttempts: attempts,
          verificationStatus: attemptsRemaining <= 0 ? 'locked' : 'pending',
          lastAttemptTimestamp: admin.firestore.FieldValue.serverTimestamp(),
          lastActivity: admin.firestore.FieldValue.serverTimestamp()
        });
        
        if (attemptsRemaining <= 0) {
          // Account is now locked
          return {
            success: false,
            verified: false,
            locked: true,
            status: 'Incorrect',
            message: 'Verification failed. Maximum attempts reached. Please contact IDIQ support at 1-877-875-4347.',
            attemptsRemaining: 0,
            nextStep: 'contactSupport'
          };
        }
        
        return {
          success: false,
          verified: false,
          status: 'Incorrect',
          message: `Verification failed. Please try again. You have ${attemptsRemaining} attempt(s) remaining.`,
          attemptsRemaining: attemptsRemaining,
          nextStep: 'retryVerification'
        };
      
      // ============================================================
      // STATUS: ACCOUNT CODE MISSING (3) - Configuration issue
      // ============================================================
      case 3:
        console.error('⚠️ AccountCodeMissing error for:', cleanEmail);
        return {
          success: false,
          verified: false,
          status: 'AccountCodeMissing',
          message: 'Configuration error. Please contact Speedy Credit Repair support.',
          nextStep: 'contactSupport'
        };
      
      // ============================================================
      // STATUS: ERROR (4) - API error
      // ============================================================
      case 4:
      default:
        console.error('⚠️ Verification error for:', cleanEmail, result);
        return {
          success: false,
          verified: false,
          status: 'Error',
          message: result.message || 'Verification error. Please try again or contact support.',
          nextStep: 'retry'
        };
    }
    
  } catch (error) {
    console.error('❌ submitVerificationAnswers error:', error);
    throw error;
  }
}

// ============================================================================
// ACTION: pullCreditReport
// ============================================================================
// Step 4 of the flow - Pull the credit report AFTER verification passes
// This is the final step that gets the actual credit data
async function pullCreditReport(data) {
  try {
    const { email } = data;
    
    if (!email) {
      throw new Error('Email is required');
    }
    
    const cleanEmail = email.trim().toLowerCase();
    const db = admin.firestore();
    
    // Check verification status first
    const enrollmentDoc = await db.collection('idiqEnrollments').doc(cleanEmail).get();
    if (!enrollmentDoc.exists) {
      throw new Error('No enrollment found for this email');
    }
    
    const enrollment = enrollmentDoc.data();
    
    // If not verified, return instructions
    if (enrollment.verificationStatus !== 'verified') {
      return {
        success: false,
        message: 'Identity verification required before pulling credit report.',
        verificationStatus: enrollment.verificationStatus,
        nextStep: enrollment.verificationStatus === 'locked' ? 'contactSupport' : 'getVerificationQuestions'
      };
    }
    
    // Get tokens
    const partnerToken = await getPartnerToken();
    const memberToken = await getMemberToken(partnerToken, cleanEmail);
    
    console.log('📊 Pulling credit report for:', cleanEmail);
    
    const response = await fetch(`${PIF_BASE_URL}/v1/credit-report`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${memberToken}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Credit report error:', response.status, errorText);
      
      // Handle "verification required" response
      if (response.status === 422) {
        return {
          success: false,
          message: 'Verification required. Please complete identity verification first.',
          needsVerification: true,
          nextStep: 'getVerificationQuestions'
        };
      }
      
      throw new Error(`Failed to pull credit report: ${errorText}`);
    }
    
    const reportData = await response.json();
    console.log('✅ Credit report pulled successfully');
    
    // Update enrollment status
    await db.collection('idiqEnrollments').doc(cleanEmail).update({
      enrollmentStep: 'completed',
      lastReportPulledAt: admin.firestore.FieldValue.serverTimestamp(),
      lastActivity: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Store the credit report in a separate collection for the client
    if (enrollment.contactId) {
      await db.collection('creditReports').doc(enrollment.contactId).set({
        contactId: enrollment.contactId,
        email: cleanEmail,
        reportData: reportData,
        pulledAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    }
    
    return {
      success: true,
      report: reportData,
      message: 'Credit report retrieved successfully!',
      membershipNumber: enrollment.membershipNumber
    };
    
  } catch (error) {
    console.error('❌ pullCreditReport error:', error);
    throw error;
  }
}

// ============================================================================
// ACTION: getQuickViewReport
// ============================================================================
// Gets a summary view of the credit report (faster, less detailed)
async function getQuickViewReport(data) {
  try {
    const { email } = data;
    
    if (!email) {
      throw new Error('Email is required');
    }
    
    const cleanEmail = email.trim().toLowerCase();
    
    // Get tokens
    const partnerToken = await getPartnerToken();
    const memberToken = await getMemberToken(partnerToken, cleanEmail);
    
    console.log('📊 Getting quick view report for:', cleanEmail);
    
    const response = await fetch(`${PIF_BASE_URL}/v1/quick-view-report`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${memberToken}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get quick view: ${errorText}`);
    }
    
    const quickView = await response.json();
    console.log('✅ Quick view retrieved');
    
    return {
      success: true,
      quickView: quickView
    };
    
  } catch (error) {
    console.error('❌ getQuickViewReport error:', error);
    throw error;
  }
}

// ============================================================================
// ACTION: getCreditScore
// ============================================================================
async function getCreditScore(data) {
  try {
    const { email } = data;
    
    if (!email) {
      throw new Error('Email is required');
    }
    
    const cleanEmail = email.trim().toLowerCase();
    
    // Get tokens
    const partnerToken = await getPartnerToken();
    const memberToken = await getMemberToken(partnerToken, cleanEmail);
    
    console.log('📈 Getting credit score for:', cleanEmail);
    
    const response = await fetch(`${PIF_BASE_URL}/v1/credit-score`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${memberToken}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get credit score: ${errorText}`);
    }
    
    const scoreData = await response.json();
    console.log('✅ Credit score retrieved:', scoreData.score);
    
    return {
      success: true,
      score: scoreData.score,
      date: scoreData.date
    };
    
  } catch (error) {
    console.error('❌ getCreditScore error:', error);
    throw error;
  }
}

// ============================================================================
// ACTION: checkEnrollmentStatus
// ============================================================================
// Check where the user is in the enrollment/verification flow
async function checkEnrollmentStatus(data) {
  try {
    const { email } = data;
    
    if (!email) {
      throw new Error('Email is required');
    }
    
    const cleanEmail = email.trim().toLowerCase();
    const db = admin.firestore();
    
    const enrollmentDoc = await db.collection('idiqEnrollments').doc(cleanEmail).get();
    
    if (!enrollmentDoc.exists) {
      return {
        enrolled: false,
        message: 'No enrollment found. Please start enrollment.',
        nextStep: 'enrollMember'
      };
    }
    
    const enrollment = enrollmentDoc.data();
    
    return {
      enrolled: true,
      membershipNumber: enrollment.membershipNumber,
      enrollmentStep: enrollment.enrollmentStep,
      verificationStatus: enrollment.verificationStatus,
      verificationAttempts: enrollment.verificationAttempts || 0,
      attemptsRemaining: 3 - (enrollment.verificationAttempts || 0),
      createdAt: enrollment.createdAt,
      verifiedAt: enrollment.verifiedAt || null,
      nextStep: getNextStep(enrollment)
    };
    
  } catch (error) {
    console.error('❌ checkEnrollmentStatus error:', error);
    throw error;
  }
}

// Helper to determine next step based on enrollment state
function getNextStep(enrollment) {
  if (enrollment.verificationStatus === 'locked') {
    return 'contactSupport';
  }
  if (enrollment.verificationStatus === 'verified') {
    return 'pullCreditReport';
  }
  if (enrollment.enrollmentStep === 'enrolled') {
    return 'getVerificationQuestions';
  }
  if (enrollment.enrollmentStep === 'verification_pending') {
    return 'submitVerificationAnswers';
  }
  return 'enrollMember';
}

// ============================================================================
// MAIN EXPORT: idiqService Cloud Function
// ============================================================================
// This is the main entry point. Add this to your functions/index.js
// 
// Usage from frontend:
//   const idiqService = httpsCallable(functions, 'idiqService');
//   const result = await idiqService({ action: 'enrollMember', ...data });
// ============================================================================
exports.idiqService = functions.https.onCall(async (data, context) => {
  try {
    const { action, ...params } = data;
    
    console.log('🚀 idiqService called with action:', action);
    
    switch (action) {
      // ========================================
      // ENROLLMENT FLOW
      // ========================================
      case 'enrollMember':
        return await enrollMember(params);
        
      case 'getVerificationQuestions':
        return await getVerificationQuestions(params);
        
      case 'submitVerificationAnswers':
        return await submitVerificationAnswers(params);
        
      // ========================================
      // CREDIT REPORTS
      // ========================================
      case 'pullCreditReport':
      case 'getReport':
        return await pullCreditReport(params);
        
      case 'getQuickView':
        return await getQuickViewReport(params);
        
      case 'getCreditScore':
      case 'getScore':
        return await getCreditScore(params);
        
      // ========================================
      // STATUS
      // ========================================
      case 'checkStatus':
        return await checkEnrollmentStatus(params);
        
      // ========================================
      // UNKNOWN ACTION
      // ========================================
      default:
        throw new Error(`Unknown action: ${action}. Valid actions: enrollMember, getVerificationQuestions, submitVerificationAnswers, pullCreditReport, getQuickView, getCreditScore, checkStatus`);
    }
    
  } catch (error) {
    console.error('❌ idiqService error:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred'
    };
  }
});

// ============================================================================
// MODULE EXPORTS (for testing or importing into existing functions)
// ============================================================================
module.exports = {
  enrollMember,
  getVerificationQuestions,
  submitVerificationAnswers,
  pullCreditReport,
  getQuickViewReport,
  getCreditScore,
  checkEnrollmentStatus,
  getPartnerToken,
  getMemberToken
};