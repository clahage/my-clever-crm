// ═══════════════════════════════════════════════════════════════════════════
// SPEEDYCRM - IDIQ ENROLLMENT CLOUD FUNCTION (PRODUCTION-READY)
// ═══════════════════════════════════════════════════════════════════════════
// Path: /functions/enrollIDIQ.js
// Type: Firebase Gen 2 Cloud Function (Callable)
// Purpose: Enroll clients in IDIQ credit monitoring
// 
// FEATURES:
// ✅ Handles wrapped contactData and direct fields
// ✅ Accepts multiple field name variations
// ✅ Supports nested and flat address structures
// ✅ Trims secrets to remove line endings
// ✅ Comprehensive error logging
// ═══════════════════════════════════════════════════════════════════════════

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');

// ═══════════════════════════════════════════════════════════════════════════
// FIREBASE SECRETS CONFIGURATION (SANDBOX)
// ═══════════════════════════════════════════════════════════════════════════

const IDIQ_PARTNER_ID_SANDBOX = defineSecret('IDIQ_PARTNER_ID_SANDBOX');
const IDIQ_PARTNER_SECRET_SANDBOX = defineSecret('IDIQ_PARTNER_SECRET_SANDBOX');
const IDIQ_OFFER_CODE_SANDBOX = defineSecret('IDIQ_OFFER_CODE_SANDBOX');
const IDIQ_PLAN_CODE_SANDBOX = defineSecret('IDIQ_PLAN_CODE_SANDBOX');

// ═══════════════════════════════════════════════════════════════════════════
// IDIQ API CONFIGURATION (SANDBOX)
// ═══════════════════════════════════════════════════════════════════════════

const IDIQ_CONFIG = {
  baseUrl: 'https://api-stage.identityiq.com/member-service',
  dashboardUrl: 'https://gcpstage.identityiq.com',
  environment: 'SANDBOX',
  endpoints: {
    partnerToken: '/v1/enrollment/partner-token',
    enroll: '/v1/enrollment/enroll',
    memberToken: '/v1/enrollment/partner-member-token'
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
      IDIQ_PARTNER_ID_SANDBOX,
      IDIQ_PARTNER_SECRET_SANDBOX,
      IDIQ_OFFER_CODE_SANDBOX,
      IDIQ_PLAN_CODE_SANDBOX
    ],
    timeoutSeconds: 540,
    memory: '512MiB',
    region: 'us-central1'
  },
  async (request) => {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🚀 IDIQ ENROLLMENT CLOUD FUNCTION STARTED (SANDBOX)');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📦 RAW REQUEST DATA:', JSON.stringify(request.data, null, 2));
    console.log('📦 REQUEST DATA KEYS:', Object.keys(request.data || {}));

    try {
      // ═════════════════════════════════════════════════════════════════════
      // STEP 0A: EXTRACT CONTACT DATA FROM REQUEST
      // ═════════════════════════════════════════════════════════════════════
      // Handle both wrapped (contactData) and unwrapped data structures
      // ═════════════════════════════════════════════════════════════════════

      let rawData = null;

      if (request.data && request.data.contactData) {
        console.log('✅ Data structure: Wrapped in contactData');
        rawData = request.data.contactData;
      } else if (request.data && request.data.data) {
        console.log('✅ Data structure: Wrapped in data');
        rawData = request.data.data;
      } else if (request.data && request.data.firstName) {
        console.log('✅ Data structure: Direct fields');
        rawData = request.data;
      } else {
        console.error('❌ No valid data structure found');
        console.error('Available keys:', Object.keys(request.data || {}));
        throw new HttpsError('invalid-argument', 'No valid contact data found in request');
      }

      console.log('📋 Extracted Raw Data:', JSON.stringify(rawData, null, 2));

      // ═════════════════════════════════════════════════════════════════════
      // STEP 0B: EXTRACT FIELDS WITH MULTIPLE NAME VARIATIONS
      // ═════════════════════════════════════════════════════════════════════

      const firstName = getFieldValue(rawData, 'firstName', 'first_name', 'First', 'firstname');
      const lastName = getFieldValue(rawData, 'lastName', 'last_name', 'Last', 'lastname');
      const email = getFieldValue(rawData, 'email', 'Email', 'emailAddress', 'email_address');
      const birthDate = getFieldValue(rawData, 'birthDate', 'dateOfBirth', 'dob', 'birth_date', 'BirthDate');
      const ssn = getFieldValue(rawData, 'ssn', 'socialSecurityNumber', 'social_security_number', 'SSN');

      console.log('🔍 Extracted Core Fields:');
      console.log('  - firstName:', firstName);
      console.log('  - lastName:', lastName);
      console.log('  - email:', email);
      console.log('  - birthDate:', birthDate);
      console.log('  - ssn:', ssn ? '***-**-' + ssn.slice(-4) : 'MISSING');

      // ═════════════════════════════════════════════════════════════════════
      // STEP 0C: EXTRACT ADDRESS (FLAT OR NESTED)
      // ═════════════════════════════════════════════════════════════════════

      let street, city, state, zip;

      if (rawData.address && typeof rawData.address === 'object') {
        console.log('🏠 Detected nested address structure');
        const addr = rawData.address;
        street = getFieldValue(addr, 'street', 'address1', 'Street', 'street_address', 'streetAddress');
        city = getFieldValue(addr, 'city', 'City');
        state = getFieldValue(addr, 'state', 'State', 'stateCode', 'state_code');
        zip = getFieldValue(addr, 'zip', 'zipCode', 'zip_code', 'postalCode', 'postal_code', 'Zip');
      }

      street = street || getFieldValue(rawData, 'street', 'address1', 'Street', 'street_address', 'streetAddress');
      city = city || getFieldValue(rawData, 'city', 'City');
      state = state || getFieldValue(rawData, 'state', 'State', 'stateCode', 'state_code');
      zip = zip || getFieldValue(rawData, 'zip', 'zipCode', 'zip_code', 'postalCode', 'postal_code', 'Zip');

      console.log('🏠 Extracted Address Fields:');
      console.log('  - street:', street);
      console.log('  - city:', city);
      console.log('  - state:', state);
      console.log('  - zip:', zip);

      // ═════════════════════════════════════════════════════════════════════
      // STEP 0D: VALIDATE REQUIRED FIELDS
      // ═════════════════════════════════════════════════════════════════════

      const requiredFields = {
        firstName,
        lastName,
        email,
        ssn,
        birthDate,
        street,
        city,
        state,
        zip
      };

      const missingFields = Object.keys(requiredFields).filter(
        field => !requiredFields[field]
      );

      if (missingFields.length > 0) {
        console.error('❌ Missing required fields:', missingFields);
        console.error('📋 Current data:', JSON.stringify(requiredFields, null, 2));
        throw new HttpsError(
          'invalid-argument',
          `Missing required fields: ${missingFields.join(', ')}`
        );
      }

      console.log('✅ All required fields present and extracted successfully');

      // ═════════════════════════════════════════════════════════════════════
      // STEP 1: GET PARTNER TOKEN FROM IDIQ
      // ═════════════════════════════════════════════════════════════════════

      console.log('🔐 STEP 1: GETTING PARTNER TOKEN');
      console.log('Token URL:', `${IDIQ_CONFIG.baseUrl}${IDIQ_CONFIG.endpoints.partnerToken}`);

      // CRITICAL: Trim secrets to remove any line endings (\r\n)
      const partnerId = IDIQ_PARTNER_ID_SANDBOX.value().trim();
      const partnerSecret = IDIQ_PARTNER_SECRET_SANDBOX.value().trim();

      console.log('Partner ID:', partnerId);
      console.log('Partner ID length:', partnerId.length);
      console.log('Partner Secret length:', partnerSecret.length);

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

      console.log('📡 Partner Token Response Status:', partnerTokenResponse.status);

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
        console.error('❌ No access token in response:', partnerTokenData);
        throw new HttpsError('internal', 'Failed to obtain partner token');
      }

      console.log('✅ Partner token obtained successfully');
      console.log('Token expires in:', partnerTokenData.expires_in || partnerTokenData.expiresIn, 'seconds');

      // ═════════════════════════════════════════════════════════════════════
      // STEP 2: ENROLL CLIENT IN IDIQ
      // ═════════════════════════════════════════════════════════════════════

      console.log('📝 STEP 2: ENROLLING CLIENT IN IDIQ');
      console.log('Enrollment URL:', `${IDIQ_CONFIG.baseUrl}${IDIQ_CONFIG.endpoints.enroll}`);

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
        offerCode: IDIQ_OFFER_CODE_SANDBOX.value().trim(),
        planCode: IDIQ_PLAN_CODE_SANDBOX.value().trim()
      };

      console.log('📦 Enrollment Payload:', {
        ...enrollmentPayload,
        ssn: `***-**-${ssn.slice(-4)}`
      });

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

      console.log('📡 Enrollment Response Status:', enrollmentResponse.status);

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
      console.log('Enrollment Result:', JSON.stringify(enrollmentResult, null, 2));

      // ═════════════════════════════════════════════════════════════════════
      // STEP 3: GET MEMBER TOKEN FOR DASHBOARD ACCESS
      // ═════════════════════════════════════════════════════════════════════

      console.log('🎫 STEP 3: GETTING MEMBER TOKEN');

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

      console.log('📡 Member Token Response Status:', memberTokenResponse.status);

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
      const dashboardUrl = `${IDIQ_CONFIG.dashboardUrl}/?Token=${memberToken}`;

      console.log('✅ Member token obtained successfully');
      console.log('Dashboard URL generated:', dashboardUrl);

      // ═════════════════════════════════════════════════════════════════════
      // STEP 4: SAVE TO FIRESTORE
      // ═════════════════════════════════════════════════════════════════════

      console.log('💾 STEP 4: SAVING TO FIRESTORE');

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

      console.log('✅ Enrollment record saved to Firestore:', enrollmentId);

      // ═════════════════════════════════════════════════════════════════════
      // SUCCESS RESPONSE
      // ═════════════════════════════════════════════════════════════════════

      console.log('═══════════════════════════════════════════════════════════════');
      console.log('✅ ENROLLMENT COMPLETED SUCCESSFULLY (SANDBOX)');
      console.log('═══════════════════════════════════════════════════════════════');

      return {
        success: true,
        enrollmentId,
        memberToken,
        dashboardUrl,
        environment: IDIQ_CONFIG.environment,
        message: 'Client enrolled successfully in IDIQ (SANDBOX)'
      };

    } catch (error) {
      console.error('═══════════════════════════════════════════════════════════════');
      console.error('❌ ENROLLMENT FAILED');
      console.error('Error:', error);
      console.error('Error stack:', error.stack);
      console.error('═══════════════════════════════════════════════════════════════');

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