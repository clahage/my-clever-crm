// ═══════════════════════════════════════════════════════════════════════════
// SPEEDYCRM - IDIQ ENROLLMENT CLOUD FUNCTION (SANDBOX - CALLABLE VERSION)
// ═══════════════════════════════════════════════════════════════════════════
// Path: /functions/enrollIDIQ.js
// 
// Purpose: Enroll clients in IDIQ credit monitoring service (SANDBOX TESTING)
// Trigger: Firebase Callable Function (works with httpsCallable from client)
// 
// CORRECTED VERSION - Uses official IDIQ Enrollment API endpoints:
// - Endpoint: /member-service/v1/enrollment/partner-token ✅
// - Based on: IDIQ Enrollment API Endpoints Description (Apr 12, 2023)
// - Function Type: onCall (works with your existing IDIQSandboxTester.jsx)
//
// Deployment: firebase deploy --only functions:enrollIDIQ
// 
// © 1995-2025 Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved
// ═══════════════════════════════════════════════════════════════════════════

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');
const logger = require('firebase-functions/logger');

// ═══════════════════════════════════════════════════════════════════════════
// FIREBASE SECRET MANAGER CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const IDIQ_PARTNER_SECRET = defineSecret('IDIQ_PARTNER_SECRET_SANDBOX');
const IDIQ_PARTNER_ID = defineSecret('IDIQ_PARTNER_ID');
const IDIQ_OFFER_CODE = defineSecret('IDIQ_OFFER_CODE_SANDBOX');
const IDIQ_PLAN_CODE = defineSecret('IDIQ_PLAN_CODE_SANDBOX');
const OPENAI_API_KEY = defineSecret('OPENAI_API_KEY');

// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// ═══════════════════════════════════════════════════════════════════════════
// IDIQ API CONFIGURATION - SANDBOX ENVIRONMENT
// ═══════════════════════════════════════════════════════════════════════════

const IDIQ_CONFIG_SANDBOX = {
  baseUrl: 'https://api-stage.identityiq.com/member-service',
  endpoints: {
    partnerToken: '/v1/enrollment/partner-token',
    enroll: '/v1/enrollment/enroll',
    memberToken: '/v1/enrollment/partner-member-token'
  },
  dashboardUrl: 'https://gcpstage.identityiq.com'
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN CLOUD FUNCTION - CALLABLE FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

exports.enrollIDIQ = onCall(
  {
    secrets: [IDIQ_PARTNER_SECRET, IDIQ_PARTNER_ID, IDIQ_OFFER_CODE, IDIQ_PLAN_CODE, OPENAI_API_KEY],
    timeoutSeconds: 540,
    memory: '512MiB',
    region: 'us-central1'
  },
  async (request) => {
    console.log('═════════════════════════════════════════════════════════');
    console.log('🚀 IDIQ ENROLLMENT STARTED (SANDBOX - CALLABLE)');
    console.log('═════════════════════════════════════════════════════════');
    console.log('Timestamp:', new Date().toISOString());
    console.log('User ID:', request.auth?.uid || 'Anonymous');

    let enrollmentId = null;

    try {
      // ═══════════════════════════════════════════════════════════════════════
      // STEP 0: EXTRACT AND VALIDATE REQUEST DATA
      // ═══════════════════════════════════════════════════════════════════════
      
      const data = request.data;
      
      const {
        firstName,
        lastName,
        email,
        phone,
        ssn,
        dob,
        address,
        city,
        state,
        zip,
        contactId,
        middleNameInitial = ''
      } = data;

      console.log('\n📋 Request Data Received:');
      console.log('- Name:', firstName, lastName);
      console.log('- Email:', email);
      console.log('- Contact ID:', contactId);
      console.log('- Environment: SANDBOX');

      // Validate required fields
      const requiredFields = {
        firstName,
        lastName,
        email,
        ssn,
        dob,
        address,
        city,
        state,
        zip
      };

      const missingFields = Object.entries(requiredFields)
        .filter(([key, value]) => !value)
        .map(([key]) => key);

      if (missingFields.length > 0) {
        console.error('❌ Missing required fields:', missingFields);
        throw new HttpsError(
          'invalid-argument',
          `Missing required fields: ${missingFields.join(', ')}`
        );
      }

      // Create enrollment record
      enrollmentId = `enroll_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log('\n📝 Created enrollment ID:', enrollmentId);

      const enrollmentData = {
        enrollmentId,
        contactId: contactId || null,
        userId: request.auth?.uid || null,
        status: 'pending',
        firstName,
        lastName,
        email,
        environment: 'SANDBOX',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        steps: {
          partnerToken: { status: 'pending' },
          enrollment: { status: 'pending' },
          memberToken: { status: 'pending' }
        }
      };

      // Save to Firestore
      await db.collection('idiqEnrollments').doc(enrollmentId).set(enrollmentData);
      console.log('✅ Enrollment record created in Firestore');

      // ═══════════════════════════════════════════════════════════════════════
      // STEP 1: GET PARTNER TOKEN (AUTHENTICATION)
      // ═══════════════════════════════════════════════════════════════════════
      
      console.log('\n═══════════════════════════════════════════════════════');
      console.log('🔐 STEP 1: GETTING PARTNER TOKEN');
      console.log('═══════════════════════════════════════════════════════');

      const tokenUrl = `${IDIQ_CONFIG_SANDBOX.baseUrl}${IDIQ_CONFIG_SANDBOX.endpoints.partnerToken}`;
      console.log('Token URL:', tokenUrl);
      console.log('Partner ID:', IDIQ_PARTNER_ID.value());

      const tokenRequestBody = {
        partnerId: IDIQ_PARTNER_ID.value(),
        partnerSecret: IDIQ_PARTNER_SECRET.value()
      };

      console.log('Request Body:', {
        partnerId: IDIQ_PARTNER_ID.value(),
        partnerSecret: '[REDACTED]'
      });

      const tokenResponse = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(tokenRequestBody)
      });

      const tokenResponseText = await tokenResponse.text();
      console.log('\n📥 Token Response:');
      console.log('Status:', tokenResponse.status, tokenResponse.statusText);
      console.log('Body:', tokenResponseText);

      if (!tokenResponse.ok) {
        console.error('❌ Partner token failed');
        throw new HttpsError(
          'internal',
          `IDIQ authentication failed: ${tokenResponse.status} - ${tokenResponseText}`
        );
      }

      const tokenData = JSON.parse(tokenResponseText);
      const partnerToken = tokenData.accessToken;

      if (!partnerToken) {
        throw new HttpsError('internal', 'No access token in IDIQ response');
      }

      console.log('✅ Partner token obtained successfully');
      console.log('Token expires in:', tokenData.expiresIn, 'seconds');

      // Update enrollment record
      await db.collection('idiqEnrollments').doc(enrollmentId).update({
        'steps.partnerToken': {
          status: 'completed',
          completedAt: admin.firestore.FieldValue.serverTimestamp(),
          expiresIn: tokenData.expiresIn
        },
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // ═══════════════════════════════════════════════════════════════════════
      // STEP 2: ENROLL CLIENT IN IDIQ
      // ═══════════════════════════════════════════════════════════════════════
      
      console.log('\n═══════════════════════════════════════════════════════');
      console.log('📝 STEP 2: ENROLLING CLIENT IN IDIQ');
      console.log('═══════════════════════════════════════════════════════');

      const enrollUrl = `${IDIQ_CONFIG_SANDBOX.baseUrl}${IDIQ_CONFIG_SANDBOX.endpoints.enroll}`;
      console.log('Enrollment URL:', enrollUrl);

      // Format data for IDIQ API
      const enrollmentPayload = {
        birthDate: formatDateForIDIQ(dob),
        email: email,
        firstName: firstName,
        lastName: lastName,
        middleNameInitial: middleNameInitial,
        ssn: ssn.replace(/\D/g, ''), // Remove dashes
        offerCode: IDIQ_OFFER_CODE.value(),
        planCode: IDIQ_PLAN_CODE.value(),
        street: address,
        city: city,
        state: state,
        zip: zip.replace(/\D/g, '').substring(0, 5)
      };

      console.log('Enrollment Payload (redacted):', {
        ...enrollmentPayload,
        ssn: '[REDACTED]',
        offerCode: IDIQ_OFFER_CODE.value(),
        planCode: IDIQ_PLAN_CODE.value()
      });

      const enrollResponse = await fetch(enrollUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${partnerToken}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(enrollmentPayload)
      });

      const enrollResponseText = await enrollResponse.text();
      console.log('\n📥 Enrollment Response:');
      console.log('Status:', enrollResponse.status, enrollResponse.statusText);
      console.log('Body:', enrollResponseText);

      if (!enrollResponse.ok) {
        console.error('❌ Enrollment failed');
        throw new HttpsError(
          'internal',
          `IDIQ enrollment failed: ${enrollResponse.status} - ${enrollResponseText}`
        );
      }

      console.log('✅ Client enrolled successfully in IDIQ');

      // Update enrollment record
      await db.collection('idiqEnrollments').doc(enrollmentId).update({
        'steps.enrollment': {
          status: 'completed',
          completedAt: admin.firestore.FieldValue.serverTimestamp()
        },
        status: 'enrolled',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // ═══════════════════════════════════════════════════════════════════════
      // STEP 3: GET MEMBER TOKEN
      // ═══════════════════════════════════════════════════════════════════════
      
      console.log('\n═══════════════════════════════════════════════════════');
      console.log('🎫 STEP 3: GETTING MEMBER TOKEN');
      console.log('═══════════════════════════════════════════════════════');

      const memberTokenUrl = `${IDIQ_CONFIG_SANDBOX.baseUrl}${IDIQ_CONFIG_SANDBOX.endpoints.memberToken}`;
      console.log('Member Token URL:', memberTokenUrl);

      const memberTokenResponse = await fetch(memberTokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${partnerToken}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          memberEmail: email
        })
      });

      const memberTokenResponseText = await memberTokenResponse.text();
      console.log('\n📥 Member Token Response:');
      console.log('Status:', memberTokenResponse.status, memberTokenResponse.statusText);

      let memberToken = null;
      let dashboardUrl = null;

      if (memberTokenResponse.ok) {
        const memberTokenData = JSON.parse(memberTokenResponseText);
        memberToken = memberTokenData.accessToken;
        dashboardUrl = `${IDIQ_CONFIG_SANDBOX.dashboardUrl}/?Token=${memberToken}&isMobileApp=false&redirect=Dashboard.aspx`;
        
        console.log('✅ Member token obtained successfully');

        await db.collection('idiqEnrollments').doc(enrollmentId).update({
          'steps.memberToken': {
            status: 'completed',
            completedAt: admin.firestore.FieldValue.serverTimestamp()
          },
          memberToken: memberToken,
          dashboardUrl: dashboardUrl,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      } else {
        console.log('⚠️  Member token request failed (non-critical)');
      }

      // ═══════════════════════════════════════════════════════════════════════
      // STEP 4: UPDATE CONTACT RECORD
      // ═══════════════════════════════════════════════════════════════════════
      
      if (contactId && memberToken) {
        try {
          await db.collection('contacts').doc(contactId).update({
            idiqEnrolled: true,
            idiqEnrollmentId: enrollmentId,
            idiqMemberToken: memberToken,
            idiqDashboardUrl: dashboardUrl,
            idiqEnrolledAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          console.log('✅ Contact record updated');
        } catch (err) {
          console.error('⚠️  Failed to update contact:', err.message);
        }
      }

      // ═══════════════════════════════════════════════════════════════════════
      // RETURN SUCCESS
      // ═══════════════════════════════════════════════════════════════════════
      
      console.log('\n═══════════════════════════════════════════════════════');
      console.log('✅ ENROLLMENT COMPLETED SUCCESSFULLY (SANDBOX)');
      console.log('═══════════════════════════════════════════════════════');

      return {
        success: true,
        enrollmentId,
        memberToken,
        dashboardUrl,
        email,
        environment: 'SANDBOX',
        message: 'Successfully enrolled in IDIQ credit monitoring (SANDBOX)'
      };

    } catch (error) {
      // ═══════════════════════════════════════════════════════════════════════
      // ERROR HANDLING
      // ═══════════════════════════════════════════════════════════════════════
      
      console.error('\n═══════════════════════════════════════════════════════');
      console.error('❌ ENROLLMENT FAILED (SANDBOX)');
      console.error('═══════════════════════════════════════════════════════');
      console.error('Error:', error.message);
      console.error('Stack:', error.stack);

      // Update enrollment record with error
      if (enrollmentId) {
        try {
          await db.collection('idiqEnrollments').doc(enrollmentId).update({
            status: 'failed',
            error: {
              message: error.message,
              timestamp: admin.firestore.FieldValue.serverTimestamp()
            },
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
        } catch (updateError) {
          console.error('Failed to update enrollment record:', updateError);
        }
      }

      // Re-throw as HttpsError if not already
      if (error instanceof HttpsError) {
        throw error;
      }

      throw new HttpsError('internal', error.message);
    }
  }
);

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Format date for IDIQ API (MM/DD/YYYY)
 */
function formatDateForIDIQ(dateString) {
  try {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  } catch (error) {
    console.error('Date formatting error:', error);
    return dateString;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// END OF FILE
// ═══════════════════════════════════════════════════════════════════════════