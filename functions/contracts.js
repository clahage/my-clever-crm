// ============================================================================
// CONTRACT OPERATIONS CLOUD FUNCTIONS
// ============================================================================
// Firebase Cloud Functions for contract generation, e-signature, and AI recommendations
// ALL AI OPERATIONS ARE SERVER-SIDE ONLY (OpenAI API keys never exposed to client)
//
// Functions:
// 1. generateContract - Merge data and generate contract PDF
// 2. sendForSignature - Send contract for e-signature (DocuSign/HelloSign)
// 3. handleSignatureWebhook - Process signature completion events
// 4. getServicePlanRecommendation - AI-powered plan recommendation
//
// Created By: Chris Lahage - Speedy Credit Repair Inc.
// © 1995-2025 Speedy Credit Repair Inc. All Rights Reserved
// ============================================================================

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const {Storage} = require('@google-cloud/storage');

// Initialize Firebase Admin (if not already initialized)
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const storage = new Storage();

// ===== HELPER: LOAD HTML TEMPLATE =====
const loadTemplate = async (templateName) => {
  try {
    const bucket = storage.bucket(process.env.FIREBASE_STORAGE_BUCKET);
    const file = bucket.file(`templates/contracts/${templateName}`);
    const [contents] = await file.download();
    return contents.toString('utf8');
  } catch (error) {
    console.error('Error loading template:', error);
    throw new functions.https.HttpsError('internal', 'Failed to load contract template');
  }
};

// ===== HELPER: MERGE TEMPLATE DATA =====
const mergeTemplateData = (template, clientData, planData, additionalData = {}) => {
  let merged = template;

  const mergeFields = {
    // Client info
    CLIENT_NAME: `${clientData.firstName || ''} ${clientData.lastName || ''}`.trim(),
    CLIENT_FIRST_NAME: clientData.firstName || '',
    CLIENT_LAST_NAME: clientData.lastName || '',
    CLIENT_EMAIL: clientData.email || '',
    CLIENT_PHONE: clientData.phone || '',
    CLIENT_ADDRESS: clientData.address?.street1 || '',
    CLIENT_CITY: clientData.address?.city || '',
    CLIENT_STATE: clientData.address?.state || '',
    CLIENT_ZIP: clientData.address?.zip || '',

    // Plan info
    PLAN_NAME: planData.name || '',
    PLAN_DESCRIPTION: planData.description || '',
    MONTHLY_FEE: `$${planData.pricing?.monthly || 0}`,
    SETUP_FEE: `$${planData.pricing?.setupFee || 0}`,
    PER_DELETION_FEE: `$${planData.pricing?.perDeletion || 0}`,
    CONTRACT_MONTHS: planData.pricing?.contractMonths || 0,
    PLAN_FEATURES: planData.features ? '<ul>' + planData.features.map(f => `<li>${f}</li>`).join('') + '</ul>' : '',

    // Contract metadata
    CONTRACT_NUMBER: additionalData.contractNumber || 'PENDING',
    CONTRACT_DATE: new Date().toLocaleDateString(),
    CONTRACT_START_DATE: additionalData.startDate || new Date().toLocaleDateString(),

    // Company info
    COMPANY_NAME: 'Speedy Credit Repair Inc.',
    COMPANY_PHONE: '(800) 555-0123',
    COMPANY_EMAIL: 'Contact@speedycreditrepair.com',
    COMPANY_WEBSITE: 'https://myclevercrm.com',
    OWNER_NAME: 'Chris Lahage',
    CURRENT_YEAR: new Date().getFullYear(),

    ...additionalData
  };

  // Replace all merge fields
  Object.entries(mergeFields).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    merged = merged.replace(regex, value || '');
  });

  return merged;
};

// ===== FUNCTION 1: GENERATE CONTRACT =====
exports.generateContract = functions.runWith({
  memory: '512MB',
  timeoutSeconds: 60
}).https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    const { contactId, planId, contractNumber } = data;

    console.log(`Generating contract for contact ${contactId}, plan ${planId}`);

    // Load client data
    const contactDoc = await db.collection('contacts').doc(contactId).get();
    if (!contactDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Contact not found');
    }
    const clientData = contactDoc.data();

    // Load plan data
    const planDoc = await db.collection('servicePlans').doc(planId).get();
    if (!planDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Service plan not found');
    }
    const planData = planDoc.data();

    // Determine template file
    const templateFile = planData.contractTemplate || `service-agreement-${planId}.html`;

    // Load template
    const template = await loadTemplate(templateFile);

    // Merge data
    const mergedContract = mergeTemplateData(template, clientData, planData, {
      contractNumber,
      startDate: new Date().toLocaleDateString()
    });

    // Create contract document in Firestore
    const contractRef = await db.collection('contracts').add({
      contractNumber,
      contactId,
      planId,
      status: 'draft',
      htmlContent: mergedContract,
      metadata: {
        clientName: `${clientData.firstName} ${clientData.lastName}`,
        clientEmail: clientData.email,
        planName: planData.name,
        monthlyFee: planData.pricing.monthly
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: context.auth.uid
    });

    console.log(`Contract created: ${contractRef.id}`);

    return {
      success: true,
      contractId: contractRef.id,
      contractNumber,
      message: 'Contract generated successfully'
    };
  } catch (error) {
    console.error('Error generating contract:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// ===== FUNCTION 2: SEND FOR SIGNATURE =====
exports.sendForSignature = functions.runWith({
  memory: '512MB',
  timeoutSeconds: 60
}).https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    const { contractId } = data;

    console.log(`Sending contract ${contractId} for signature`);

    // Load contract
    const contractDoc = await db.collection('contracts').doc(contractId).get();
    if (!contractDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Contract not found');
    }

    const contractData = contractDoc.data();

    // TODO: Integrate with DocuSign or HelloSign
    // For now, just update status and send email notification

    // Update contract status
    await db.collection('contracts').doc(contractId).update({
      status: 'sent',
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // TODO: Send email with signature link
    console.log(`Email would be sent to: ${contractData.metadata.clientEmail}`);

    return {
      success: true,
      message: 'Contract sent for signature',
      contractId
    };
  } catch (error) {
    console.error('Error sending contract for signature:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// ===== FUNCTION 3: HANDLE SIGNATURE WEBHOOK =====
exports.handleSignatureWebhook = functions.runWith({
  memory: '512MB',
  timeoutSeconds: 60
}).https.onRequest(async (req, res) => {
  try {
    console.log('Signature webhook received:', req.body);

    // TODO: Verify webhook signature from DocuSign/HelloSign

    const { contractId, status } = req.body;

    if (status === 'completed') {
      await db.collection('contracts').doc(contractId).update({
        status: 'signed',
        signedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log(`Contract ${contractId} marked as signed`);
    }

    res.status(200).send({ success: true });
  } catch (error) {
    console.error('Error processing signature webhook:', error);
    res.status(500).send({ success: false, error: error.message });
  }
});

// ===== FUNCTION 4: AI SERVICE PLAN RECOMMENDATION =====
exports.getServicePlanRecommendation = functions.runWith({
  memory: '512MB',
  timeoutSeconds: 60
}).https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    const { contactId, idiqEnrollmentId } = data;

    console.log(`Getting AI recommendation for contact ${contactId}`);

    // Load IDIQ credit report data
    const enrollmentDoc = await db.collection('idiqEnrollments').doc(idiqEnrollmentId).get();
    if (!enrollmentDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'IDIQ enrollment not found');
    }

    const enrollmentData = enrollmentDoc.data();
    const creditReport = enrollmentData.creditReport || {};

    // Build credit profile
    const creditProfile = {
      avgScore: creditReport.scores?.average || 0,
      negativeItemCount: (creditReport.negativeItems || []).length,
      hasPublicRecords: (creditReport.publicRecords || []).length > 0,
      hasBankruptcy: (creditReport.negativeItems || []).some(item => item.type === 'bankruptcy'),
      hasForeclosure: (creditReport.negativeItems || []).some(item => item.type === 'foreclosure'),
      hasTaxLien: (creditReport.publicRecords || []).some(item => item.type === 'taxLien'),
      hasJudgment: (creditReport.publicRecords || []).some(item => item.type === 'judgment')
    };

    // ===== AI RECOMMENDATION LOGIC =====
    // NOTE: In production, this would call OpenAI API
    // For now, using rule-based logic

    const { OpenAI } = require('openai');
    const openai = new OpenAI({
      apiKey: functions.config().openai?.key || process.env.OPENAI_API_KEY
    });

    const prompt = `
You are a credit repair expert analyzing a client's credit profile to recommend the best service plan.

CREDIT PROFILE:
- Average Credit Score: ${creditProfile.avgScore}
- Number of Negative Items: ${creditProfile.negativeItemCount}
- Has Bankruptcy: ${creditProfile.hasBankruptcy}
- Has Foreclosure: ${creditProfile.hasForeclosure}
- Has Tax Lien: ${creditProfile.hasTaxLien}
- Has Judgments: ${creditProfile.hasJudgment}

AVAILABLE SERVICE PLANS:
1. DIY ($39/mo) - Self-service, 1-3 items, tech-savvy clients
2. Standard ($149/mo + $25/deletion) - Full-service, 4-10 items, typical cases
3. Acceleration ($199/mo) - Aggressive, 5-15 items, urgent complex cases
4. Pay-For-Delete ($0/mo + fees per deletion) - Results-only, 1-5 items, risk-averse
5. Hybrid ($99/mo + $75/deletion) - Mixed model, 3-8 items, cost-conscious
6. Premium ($349/mo + $199 setup) - Attorney-backed, 10+ items, complex legal issues

Recommend the BEST plan. Respond in JSON format:
{
  "recommendedPlan": "plan-id",
  "confidence": 0.95,
  "reasoning": "Detailed explanation...",
  "alternativePlans": ["plan-id-2", "plan-id-3"]
}
`;

    let recommendation;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      });

      recommendation = JSON.parse(response.choices[0].message.content);
    } catch (aiError) {
      console.error('OpenAI API error, using fallback logic:', aiError);

      // Fallback rule-based recommendation
      let recommendedPlan = 'standard';
      if (creditProfile.negativeItemCount <= 3) recommendedPlan = 'diy';
      if (creditProfile.negativeItemCount > 10 || creditProfile.hasBankruptcy) recommendedPlan = 'premium';
      if (creditProfile.negativeItemCount >= 5 && creditProfile.negativeItemCount <= 15) recommendedPlan = 'acceleration';

      recommendation = {
        recommendedPlan,
        confidence: 0.75,
        reasoning: `Based on ${creditProfile.negativeItemCount} negative items and credit profile complexity.`,
        alternativePlans: ['standard', 'hybrid']
      };
    }

    // Store recommendation in Firestore
    const recommendationRef = await db.collection('serviceRecommendations').add({
      contactId,
      idiqEnrollmentId,
      recommendedPlanId: recommendation.recommendedPlan,
      confidence: recommendation.confidence,
      reasoning: recommendation.reasoning,
      alternativePlans: recommendation.alternativePlans || [],
      creditProfile,
      aiAnalysis: recommendation,
      accepted: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`Recommendation created: ${recommendationRef.id}`);

    return {
      success: true,
      recommendation: {
        ...recommendation,
        recommendationId: recommendationRef.id
      }
    };
  } catch (error) {
    console.error('Error getting AI recommendation:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// ===== EXPORT ALL FUNCTIONS =====
module.exports = {
  generateContract: exports.generateContract,
  sendForSignature: exports.sendForSignature,
  handleSignatureWebhook: exports.handleSignatureWebhook,
  getServicePlanRecommendation: exports.getServicePlanRecommendation
};
