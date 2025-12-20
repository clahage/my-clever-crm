// ═══════════════════════════════════════════════════════════════════════════
// SPEEDYCRM - IDIQ ENROLLMENT CLOUD FUNCTION (PRODUCTION TEMPLATE)
// ═══════════════════════════════════════════════════════════════════════════
// Path: Keep this as enrollIDIQ_PRODUCTION.js (template file)
//       Copy to functions/enrollIDIQ.js when going live
// 
// Purpose: Enroll clients in IDIQ credit monitoring service (LIVE PRODUCTION)
// Environment: PRODUCTION - Uses api.identityiq.com
// 
// Firebase Secrets Used:
// - IDIQ_PARTNER_ID (11981)
// - IDIQ_PARTNER_SECRET (PRODUCTION)
// - IDIQ_OFFER_CODE (PRODUCTION)
// - IDIQ_PLAN_CODE (PRODUCTION)
// - OPENAI_API_KEY
//
// Based on: IDIQ Enrollment API Endpoints Description (Apr 12, 2023)
// 
// ⚠️  WARNING: This deploys to LIVE PRODUCTION servers!
//    Only deploy after SANDBOX testing is 100% successful!
// 
// © 1995-2025 Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved
// ═══════════════════════════════════════════════════════════════════════════

const { onRequest } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');
const logger = require('firebase-functions/logger');

// ═══════════════════════════════════════════════════════════════════════════
// FIREBASE SECRETS - PRODUCTION ENVIRONMENT
// ═══════════════════════════════════════════════════════════════════════════

const IDIQ_PARTNER_ID = defineSecret('IDIQ_PARTNER_ID');
const IDIQ_PARTNER_SECRET = defineSecret('IDIQ_PARTNER_SECRET');
const IDIQ_OFFER_CODE = defineSecret('IDIQ_OFFER_CODE');
const IDIQ_PLAN_CODE = defineSecret('IDIQ_PLAN_CODE');
const OPENAI_API_KEY = defineSecret('OPENAI_API_KEY');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// ═══════════════════════════════════════════════════════════════════════════
// IDIQ API CONFIGURATION - PRODUCTION
// ═══════════════════════════════════════════════════════════════════════════

const IDIQ_CONFIG = {
  baseUrl: 'https://api.identityiq.com/member-service',
  endpoints: {
    partnerToken: '/v1/enrollment/partner-token',
    enroll: '/v1/enrollment/enroll',
    memberToken: '/v1/enrollment/partner-member-token'
  },
  dashboardUrl: 'https://member.identityiq.com',
  environment: 'PRODUCTION'
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN CLOUD FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

exports.enrollIDIQ = onRequest(
  {
    cors: true,
    secrets: [IDIQ_PARTNER_ID, IDIQ_PARTNER_SECRET, IDIQ_OFFER_CODE, IDIQ_PLAN_CODE, OPENAI_API_KEY],
    timeoutSeconds: 540,
    memory: '512MiB',
    region: 'us-central1'
  },
  async (req, res) => {
    console.log('═════════════════════════════════════════════════════════');
    console.log('🚀 IDIQ ENROLLMENT STARTED (PRODUCTION)');
    console.log('═════════════════════════════════════════════════════════');
    console.log('Timestamp:', new Date().toISOString());
    
    // CORS preflight
    if (req.method === 'OPTIONS') {
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.set('Access-Control-Max-Age', '3600');
      return res.status(204).send('');
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    let enrollmentId = null;

    try {
      // ═══════════════════════════════════════════════════════════════════════
      // VALIDATE REQUEST DATA
      // ═══════════════════════════════════════════════════════════════════════
      
      const {
        firstName, lastName, email, phone, ssn, dob,
        address, city, state, zip, contactId, middleNameInitial = ''
      } = req.body;

      console.log('📋 Request:', firstName, lastName, email);

      const missingFields = Object.entries({firstName, lastName, email, ssn, dob, address, city, state, zip})
        .filter(([k, v]) => !v).map(([k]) => k);

      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          error: `Missing fields: ${missingFields.join(', ')}`
        });
      }

      // Create enrollment record
      enrollmentId = `enroll_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await db.collection('idiqEnrollments').doc(enrollmentId).set({
        enrollmentId, contactId: contactId || null, status: 'pending',
        firstName, lastName, email, environment: 'PRODUCTION',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        steps: {
          partnerToken: { status: 'pending' },
          enrollment: { status: 'pending' },
          memberToken: { status: 'pending' }
        }
      });

      console.log('✅ Enrollment record created:', enrollmentId);

      // ═══════════════════════════════════════════════════════════════════════
      // STEP 1: GET PARTNER TOKEN
      // ═══════════════════════════════════════════════════════════════════════
      
      console.log('\n🔐 STEP 1: Getting Partner Token');
      const tokenUrl = `${IDIQ_CONFIG.baseUrl}${IDIQ_CONFIG.endpoints.partnerToken}`;
      console.log('URL:', tokenUrl);

      const tokenResponse = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          partnerId: IDIQ_PARTNER_ID.value(),
          partnerSecret: IDIQ_PARTNER_SECRET.value()
        })
      });

      const tokenText = await tokenResponse.text();
      console.log('Status:', tokenResponse.status);

      if (!tokenResponse.ok) {
        throw new Error(`Partner token failed: ${tokenResponse.status} - ${tokenText}`);
      }

      const tokenData = JSON.parse(tokenText);
      const partnerToken = tokenData.accessToken;

      if (!partnerToken) {
        throw new Error('No accessToken in response');
      }

      console.log('✅ Partner token obtained, expires in:', tokenData.expiresIn, 'seconds');

      await db.collection('idiqEnrollments').doc(enrollmentId).update({
        'steps.partnerToken.status': 'completed',
        'steps.partnerToken.completedAt': admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // ═══════════════════════════════════════════════════════════════════════
      // STEP 2: ENROLL CLIENT
      // ═══════════════════════════════════════════════════════════════════════
      
      console.log('\n📝 STEP 2: Enrolling Client');
      const enrollUrl = `${IDIQ_CONFIG.baseUrl}${IDIQ_CONFIG.endpoints.enroll}`;

      const enrollPayload = {
        birthDate: formatDateForIDIQ(dob),
        email, firstName, lastName, middleNameInitial,
        ssn: ssn.replace(/\D/g, ''),
        offerCode: IDIQ_OFFER_CODE.value(),
        planCode: IDIQ_PLAN_CODE.value(),
        street: address, city, state,
        zip: zip.replace(/\D/g, '').substring(0, 5)
      };

      console.log('Payload:', { ...enrollPayload, ssn: '[REDACTED]' });

      const enrollResponse = await fetch(enrollUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${partnerToken}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(enrollPayload)
      });

      const enrollText = await enrollResponse.text();
      console.log('Status:', enrollResponse.status);

      if (!enrollResponse.ok) {
        throw new Error(`Enrollment failed: ${enrollResponse.status} - ${enrollText}`);
      }

      console.log('✅ Client enrolled successfully');

      await db.collection('idiqEnrollments').doc(enrollmentId).update({
        'steps.enrollment.status': 'completed',
        'steps.enrollment.completedAt': admin.firestore.FieldValue.serverTimestamp(),
        status: 'enrolled',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // ═══════════════════════════════════════════════════════════════════════
      // STEP 3: GET MEMBER TOKEN
      // ═══════════════════════════════════════════════════════════════════════
      
      console.log('\n🎫 STEP 3: Getting Member Token');
      const memberTokenUrl = `${IDIQ_CONFIG.baseUrl}${IDIQ_CONFIG.endpoints.memberToken}`;

      const memberTokenResponse = await fetch(memberTokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${partnerToken}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({ memberEmail: email })
      });

      const memberTokenText = await memberTokenResponse.text();
      console.log('Status:', memberTokenResponse.status);

      let memberToken = null;
      let dashboardUrl = null;

      if (memberTokenResponse.ok) {
        const memberTokenData = JSON.parse(memberTokenText);
        memberToken = memberTokenData.accessToken;
        dashboardUrl = `${IDIQ_CONFIG.dashboardUrl}/?Token=${memberToken}&isMobileApp=false&redirect=Dashboard.aspx`;
        
        console.log('✅ Member token obtained');

        await db.collection('idiqEnrollments').doc(enrollmentId).update({
          'steps.memberToken.status': 'completed',
          'steps.memberToken.completedAt': admin.firestore.FieldValue.serverTimestamp(),
          memberToken, dashboardUrl,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      } else {
        console.log('⚠️  Member token failed (non-critical)');
      }

      // ═══════════════════════════════════════════════════════════════════════
      // UPDATE CONTACT RECORD
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
          console.error('⚠️  Contact update failed:', err.message);
        }
      }

      // ═══════════════════════════════════════════════════════════════════════
      // SUCCESS RESPONSE
      // ═══════════════════════════════════════════════════════════════════════
      
      console.log('\n✅ ENROLLMENT COMPLETED SUCCESSFULLY (PRODUCTION)');

      return res.status(200).json({
        success: true,
        enrollmentId,
        message: 'Successfully enrolled in IDIQ credit monitoring',
        environment: 'PRODUCTION',
        data: {
          memberToken: memberToken || null,
          dashboardUrl: dashboardUrl || null,
          email,
          enrolledAt: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('\n❌ ENROLLMENT FAILED:', error.message);

      if (enrollmentId) {
        try {
          await db.collection('idiqEnrollments').doc(enrollmentId).update({
            status: 'failed',
            error: { message: error.message, timestamp: admin.firestore.FieldValue.serverTimestamp() },
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
        } catch (e) {}
      }

      return res.status(500).json({
        success: false,
        enrollmentId,
        error: error.message,
        environment: 'PRODUCTION'
      });
    }
  }
);

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function formatDateForIDIQ(dateString) {
  try {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  } catch (error) {
    console.error('Date format error:', error);
    return dateString;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// END OF FILE
// ═══════════════════════════════════════════════════════════════════════════