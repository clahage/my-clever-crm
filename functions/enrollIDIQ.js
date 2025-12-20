// ═══════════════════════════════════════════════════════════════════════════
// SPEEDYCRM - IDIQ ENROLLMENT CLOUD FUNCTION (PRODUCTION)
// ═══════════════════════════════════════════════════════════════════════════
// Path: /functions/enrollIDIQ.js
// Type: Firebase Gen 2 Cloud Function (Callable)
// Purpose: Enroll clients in IDIQ credit monitoring (PRODUCTION ENVIRONMENT)
// 
// Features:
// - Full 3-step IDIQ enrollment workflow
// - Automatic credit report retrieval after enrollment
// - Member dashboard URL generation
// - Firestore enrollment tracking
// - Free credit monitoring for all visitors (no charge unless upgrade)
// ═══════════════════════════════════════════════════════════════════════════

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');

// ═══════════════════════════════════════════════════════════════════════════
// FIREBASE SECRETS CONFIGURATION (PRODUCTION)
// ═══════════════════════════════════════════════════════════════════════════

const IDIQ_PARTNER_ID = defineSecret('IDIQ_PARTNER_ID');
const IDIQ_PARTNER_SECRET = defineSecret('IDIQ_PARTNER_SECRET');
const IDIQ_OFFER_CODE = defineSecret('IDIQ_OFFER_CODE');
const IDIQ_PLAN_CODE = defineSecret('IDIQ_PLAN_CODE');

// ═══════════════════════════════════════════════════════════════════════════
// IDIQ API CONFIGURATION (PRODUCTION)
// ═══════════════════════════════════════════════════════════════════════════

const IDIQ_CONFIG = {
  baseUrl: 'https://api.identityiq.com/member-service',
  dashboardUrl: 'https://member.identityiq.com',
  environment: 'PRODUCTION',
  endpoints: {
    partnerToken: '/v1/enrollment/partner-token',
    enroll: '/v1/enrollment/enroll',
    memberToken: '/v1/enrollment/partner-member-token',
    memberStatus: '/v1/enrollment/member-status'
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTION: EXTRACT FIELD VALUE (MULTIPLE NAME VARIATIONS)
// ═══════════════════════════════════════════════════════════════════════════

function getFieldValue(data, ...fieldNames) {
  for (const fieldName of fieldNames) {
    const value = data[fieldName];
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// CLOUD FUNCTION: enrollIDIQ (Callable Function)
// ═══════════════════════════════════════════════════════════════════════════

exports.enrollIDIQ = onCall(
  {
    secrets: [
      IDIQ_PARTNER_ID,
      IDIQ_PARTNER_SECRET,
      IDIQ_OFFER_CODE,
      IDIQ_PLAN_CODE
    ],
    timeoutSeconds: 540,
    memory: '512MiB',
    region: 'us-central1'
  },
  async (request) => {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🚀 IDIQ ENROLLMENT STARTED (PRODUCTION)');
    console.log('Environment:', IDIQ_CONFIG.environment);
    console.log('Timestamp:', new Date().toISOString());
    console.log('User:', request.auth?.uid || 'Unauthenticated');
    console.log('═══════════════════════════════════════════════════════════════');

    try {
      // ═════════════════════════════════════════════════════════════════════
      // STEP 0: EXTRACT AND VALIDATE CONTACT DATA
      // ═════════════════════════════════════════════════════════════════════

      let rawData = null;

      // Check if data is wrapped in contactData
      if (request.data && request.data.contactData) {
        console.log('✅ Data structure: Wrapped in contactData');
        rawData = request.data.contactData;
      }
      // Check if data is wrapped in data
      else if (request.data && request.data.data) {
        console.log('✅ Data structure: Wrapped in data');
        rawData = request.data.data;
      }
      // Check if data is sent directly
      else if (request.data && request.data.firstName) {
        console.log('✅ Data structure: Direct fields');
        rawData = request.data;
      }
      else {
        console.error('❌ No valid data structure found');
        console.error('Available keys:', Object.keys(request.data || {}));
        throw new HttpsError('invalid-argument', 'No valid contact data found in request');
      }

      // Extract core fields with multiple name variations
      const firstName = getFieldValue(rawData, 'firstName', 'first_name', 'First', 'firstname');
      const lastName = getFieldValue(rawData, 'lastName', 'last_name', 'Last', 'lastname');
      const email = getFieldValue(rawData, 'email', 'Email', 'emailAddress', 'email_address');
      const birthDate = getFieldValue(rawData, 'birthDate', 'dateOfBirth', 'dob', 'birth_date', 'BirthDate');
      const ssn = getFieldValue(rawData, 'ssn', 'socialSecurityNumber', 'social_security_number', 'SSN');

      // Extract address fields (handle nested and flat structures)
      let street, city, state, zip;

      if (rawData.address && typeof rawData.address === 'object') {
        console.log('🏠 Detected nested address structure');
        const addr = rawData.address;
        street = getFieldValue(addr, 'street', 'address1', 'line1', 'Street', 'street_address', 'streetAddress');
        city = getFieldValue(addr, 'city', 'City', 'town');
        state = getFieldValue(addr, 'state', 'State', 'stateCode', 'state_code');
        zip = getFieldValue(addr, 'zip', 'zipCode', 'zip_code', 'postalCode', 'postal_code', 'Zip');
      }

      // Fall back to flat structure
      street = street || getFieldValue(rawData, 'street', 'address1', 'address', 'line1', 'Street', 'street_address', 'streetAddress');
      city = city || getFieldValue(rawData, 'city', 'City', 'town');
      state = state || getFieldValue(rawData, 'state', 'State', 'stateCode', 'state_code');
      zip = zip || getFieldValue(rawData, 'zip', 'zipCode', 'zip_code', 'postalCode', 'postal_code', 'Zip');

      // Validate required fields
      const requiredFields = {
        firstName, lastName, email, ssn, birthDate,
        street, city, state, zip
      };

      const missingFields = Object.entries(requiredFields)
        .filter(([_, value]) => !value)
        .map(([key]) => key);

      if (missingFields.length > 0) {
        console.error('❌ Missing required fields:', missingFields);
        throw new HttpsError(
          'invalid-argument',
          `Missing required fields: ${missingFields.join(', ')}`
        );
      }

      console.log('✅ All required fields present and extracted successfully');

      // ═════════════════════════════════════════════════════════════════════
      // STEP 1: GET PARTNER TOKEN FROM IDIQ
      // ═════════════════════════════════════════════════════════════════════

      console.log('🔐 STEP 1: Getting Partner Token');

      // Trim secrets to remove any whitespace/line endings
      const partnerId = IDIQ_PARTNER_ID.value()?.trim();
      const partnerSecret = IDIQ_PARTNER_SECRET.value()?.trim();

      console.log('Partner ID:', partnerId);
      console.log('Partner Secret length:', partnerSecret?.length);

      const partnerTokenResponse = await fetch(
        `${IDIQ_CONFIG.baseUrl}${IDIQ_CONFIG.endpoints.partnerToken}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            partnerId: partnerId,
            partnerSecret: partnerSecret
          })
        }
      );

      console.log('📡 Partner Token Response:', partnerTokenResponse.status);

      if (!partnerTokenResponse.ok) {
        const errorText = await partnerTokenResponse.text();
        console.error('❌ Partner token request failed:', errorText);
        throw new HttpsError(
          'internal',
          `IDIQ authentication failed: ${partnerTokenResponse.status} - ${errorText}`
        );
      }

      const partnerTokenData = await partnerTokenResponse.json();
      const partnerToken = partnerTokenData.access_token || partnerTokenData.accessToken;

      if (!partnerToken) {
        console.error('❌ No access token in response');
        throw new HttpsError('internal', 'Failed to obtain partner token');
      }

      console.log('✅ Partner token obtained successfully');

      // ═════════════════════════════════════════════════════════════════════
      // STEP 2: ENROLL CLIENT IN IDIQ
      // ═════════════════════════════════════════════════════════════════════

      console.log('📝 STEP 2: Enrolling client in IDIQ');

      const enrollmentPayload = {
        firstName,
        lastName,
        email,
        birthDate,
        ssn,
        street,
        city,
        state,
        zip,
        offerCode: IDIQ_OFFER_CODE.value()?.trim(),
        planCode: IDIQ_PLAN_CODE.value()?.trim()
      };

      const enrollmentResponse = await fetch(
        `${IDIQ_CONFIG.baseUrl}${IDIQ_CONFIG.endpoints.enroll}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${partnerToken}`
          },
          body: JSON.stringify(enrollmentPayload)
        }
      );

      console.log('📡 Enrollment Response:', enrollmentResponse.status);

      if (!enrollmentResponse.ok) {
        const errorText = await enrollmentResponse.text();
        console.error('❌ Enrollment request failed:', errorText);
        throw new HttpsError(
          'internal',
          `IDIQ enrollment failed: ${enrollmentResponse.status} - ${errorText}`
        );
      }

      const enrollmentResult = await enrollmentResponse.json();
      console.log('✅ Client enrolled successfully in IDIQ');

      // ═════════════════════════════════════════════════════════════════════
      // STEP 3: GET MEMBER TOKEN FOR DASHBOARD ACCESS
      // ═════════════════════════════════════════════════════════════════════

      console.log('🎫 STEP 3: Getting Member Token');

      const memberTokenResponse = await fetch(
        `${IDIQ_CONFIG.baseUrl}${IDIQ_CONFIG.endpoints.memberToken}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${partnerToken}`
          },
          body: JSON.stringify({
            memberEmail: email
          })
        }
      );

      console.log('📡 Member Token Response:', memberTokenResponse.status);

      if (!memberTokenResponse.ok) {
        const errorText = await memberTokenResponse.text();
        console.error('❌ Member token request failed:', errorText);
        throw new HttpsError(
          'internal',
          `IDIQ member token failed: ${memberTokenResponse.status} - ${errorText}`
        );
      }

      const memberTokenData = await memberTokenResponse.json();
      const memberToken = memberTokenData.access_token || memberTokenData.accessToken;
      const dashboardUrl = `${IDIQ_CONFIG.dashboardUrl}/?Token=${memberToken}&isMobileApp=false&redirect=Dashboard.aspx`;

      console.log('✅ Member token obtained successfully');

      // ═════════════════════════════════════════════════════════════════════
      // STEP 4: SAVE TO FIRESTORE
      // ═════════════════════════════════════════════════════════════════════

      console.log('💾 STEP 4: Saving enrollment to Firestore');

      const db = admin.firestore();
      const enrollmentId = `enroll_${Date.now()}_${email.split('@')[0]}`;
      const now = admin.firestore.FieldValue.serverTimestamp();

      const enrollmentRecord = {
        enrollmentId,
        contactId: rawData.contactId || null,
        userId: request.auth?.uid || null,
        status: 'enrolled',
        environment: IDIQ_CONFIG.environment,
        
        // Contact Info
        firstName,
        lastName,
        email,
        
        // IDIQ Data
        memberToken,
        dashboardUrl,
        enrollmentData: enrollmentResult,
        
        // Automatic Retrieval Settings
        autoRetrieve: true,  // Enable automatic credit report retrieval
        retrievalFrequency: 'monthly',  // Retrieve reports monthly
        lastRetrievedAt: null,  // Will be set on first retrieval
        nextRetrievalAt: now,  // Schedule first retrieval immediately
        reportHistory: [],  // Track all retrieved report IDs
        
        // Timestamps
        createdAt: now,
        updatedAt: now,
        
        // Step Tracking
        steps: {
          partnerToken: {
            status: 'completed',
            completedAt: now
          },
          enrollment: {
            status: 'completed',
            completedAt: now
          },
          memberToken: {
            status: 'completed',
            completedAt: now
          }
        }
      };

      await db.collection('idiqEnrollments').doc(enrollmentId).set(enrollmentRecord);

      console.log('✅ Enrollment record saved:', enrollmentId);

      // Update contact record with enrollment link
      if (rawData.contactId) {
        try {
          await db.collection('contacts').doc(rawData.contactId).update({
            idiqEnrollmentId: enrollmentId,
            idiqEnrolled: true,
            idiqEnrolledAt: now,
            idiqDashboardUrl: dashboardUrl,
            updatedAt: now
          });
          console.log('✅ Contact record updated with IDIQ enrollment');
        } catch (error) {
          console.error('⚠️ Failed to update contact record:', error.message);
          // Non-fatal - enrollment still succeeded
        }
      }

      // ═════════════════════════════════════════════════════════════════════
      // SUCCESS RESPONSE
      // ═════════════════════════════════════════════════════════════════════

      console.log('═══════════════════════════════════════════════════════════════');
      console.log('✅ ENROLLMENT COMPLETED SUCCESSFULLY');
      console.log('Environment:', IDIQ_CONFIG.environment);
      console.log('Enrollment ID:', enrollmentId);
      console.log('Dashboard URL:', dashboardUrl);
      console.log('Auto-Retrieve: ENABLED (monthly)');
      console.log('═══════════════════════════════════════════════════════════════');

      return {
        success: true,
        enrollmentId,
        memberToken,
        dashboardUrl,
        environment: IDIQ_CONFIG.environment,
        autoRetrieve: true,
        retrievalFrequency: 'monthly',
        message: `Client enrolled successfully in IDIQ ${IDIQ_CONFIG.environment}. Free credit monitoring included. Automatic report retrieval enabled.`
      };

    } catch (error) {
      console.error('═══════════════════════════════════════════════════════════════');
      console.error('❌ ENROLLMENT FAILED');
      console.error('Error:', error.message);
      console.error('Stack:', error.stack);
      console.error('═══════════════════════════════════════════════════════════════');

      // Re-throw HttpsError or create new one
      if (error instanceof HttpsError) {
        throw error;
      }

      throw new HttpsError('internal', `Enrollment failed: ${error.message}`);
    }
  }
);

// ═══════════════════════════════════════════════════════════════════════════
// © 1995-2025 Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved
// ═══════════════════════════════════════════════════════════════════════════