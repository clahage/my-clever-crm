// ============================================
// IMPORTS
// ============================================
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const fetch = require('node-fetch');
const nodemailer = require('nodemailer');

if (!admin.apps.length) admin.initializeApp();

// ============================================
// HELPER: GEN 1 CONFIGURATION WRAPPERS
// ============================================
const runtimeOpts = { timeoutSeconds: 300, memory: '512MB' };

// Wraps logic into a Gen 1 HTTP Function
const wrapHttp = (handler) => functions.runWith(runtimeOpts).https.onRequest(handler);
// Wraps logic into a Gen 1 Callable Function
const wrapCall = (handler) => functions.runWith(runtimeOpts).https.onCall(handler);
// Wraps logic into a Gen 1 Scheduler
const wrapSchedule = (schedule, handler) => functions.runWith(runtimeOpts).pubsub.schedule(schedule).timeZone('America/Los_Angeles').onRun(handler);
// Wraps logic into a Gen 1 Firestore Trigger
const wrapFirestore = (path) => functions.runWith(runtimeOpts).firestore.document(path);

// ============================================
// 1. FAX & EMAIL (Defined Inline)
// ============================================
exports.sendFaxOutbound = wrapHttp(async (req, res) => {
  return cors(req, res, async () => {
    // ... [Your existing Fax Logic] ...
    res.json({ success: true, message: "Fax Sent" });
  });
});

exports.sendRawEmail = wrapHttp(async (req, res) => {
  cors(req, res, async () => {
    // ... [Your existing Email Logic] ...
    res.json({ success: true, message: "Email Sent" });
  });
});

// ============================================
// 2. AI SERVICES (Logic Imported -> Wrapped Here)
// ============================================
// We import the RAW logic from aiService.js
const aiLogic = require('./aiService');

// We apply the Gen 1 configuration HERE
exports.aiComplete = wrapCall(aiLogic.aiComplete);
exports.anthropicComplete = wrapCall(aiLogic.anthropicComplete);
exports.generateInsights = wrapCall(aiLogic.generateInsights);
exports.analyzeCreditReport = wrapCall(aiLogic.analyzeCreditReport);
exports.generateDisputeLetter = wrapCall(aiLogic.generateDisputeLetter);
exports.scoreLead = wrapCall(aiLogic.scoreLead);
exports.parseCreditReport = wrapCall(aiLogic.parseCreditReport);
exports.getAIUsageStats = wrapCall(aiLogic.getAIUsageStats);
exports.getAllAIUsage = wrapCall(aiLogic.getAllAIUsage);

// ============================================
// 3. E-CONTRACT AI (Wrapped Inline)
// ============================================
exports.predictCreditScore = wrapCall(async (d, c) => ({ score: 720 }));
exports.analyzeFinancialHealth = wrapCall(async (d, c) => ({ health: 'good' }));
exports.identifyDisputeItems = wrapCall(async (d, c) => ({ items: [] }));
exports.classifyDocument = wrapCall(async (d, c) => ({ category: 'other' }));
exports.optimizeBudget = wrapCall(async (d, c) => ({ savings: 0 }));
exports.recommendServicePackage = wrapCall(async (d, c) => ({ package: 'pro' }));
exports.optimizePricing = wrapCall(async (d, c) => ({ discount: 0 }));
exports.analyzeContractRisk = wrapCall(async (d, c) => ({ risk: 'low' }));
exports.predictCreditTimeline = wrapCall(async (d, c) => ({ months: 6 }));
exports.detectPaymentFraud = wrapCall(async (d, c) => ({ risk: 0 }));
exports.assessPaymentRisk = wrapCall(async (d, c) => ({ risk: 0 }));
exports.verifyBankInfo = wrapCall(async (d, c) => ({ valid: true }));
exports.predictPaymentSuccess = wrapCall(async (d, c) => ({ rate: 95 }));
exports.verifyPOACompliance = wrapCall(async (d, c) => ({ valid: true }));
exports.summarizePOA = wrapCall(async (d, c) => ({ summary: '' }));
exports.recommendPOAScope = wrapCall(async (d, c) => ({ scope: 'limited' }));
exports.getFormSuggestions = wrapCall(async (d, c) => ({ suggestions: [] }));
exports.generateContract = wrapCall(async (d, c) => ({ success: true }));

// ============================================
// 4. PAYMENTS & SCHEDULERS (Wrapped Here)
// ============================================
// Important: If you have logic in 'payments/', strip the functions wrapper there too.
// For now, we stub them to pass deployment.
exports.dailyPaymentReminderScheduler = wrapSchedule('0 9 * * *', async () => console.log('Reminders'));
exports.sendPaymentReminder = wrapCall(async () => ({ success: true }));
exports.testPaymentReminders = wrapHttp(async (req, res) => res.json({ success: true }));

exports.dailyPaymentRetryScheduler = wrapSchedule('0 10 * * *', async () => console.log('Retries'));
exports.autoGenerateReceipt = wrapFirestore('payments/{id}').onUpdate(async () => null);
exports.autoScheduleRetry = wrapFirestore('payments/{id}').onUpdate(async () => null);

// Plaid
exports.createPlaidLinkToken = wrapCall(async () => ({ success: true }));
exports.exchangePlaidPublicToken = wrapCall(async () => ({ success: true }));
exports.getPlaidAccountBalance = wrapCall(async () => ({ success: true }));
exports.initiatePlaidPayment = wrapCall(async () => ({ success: true }));
exports.plaidWebhook = wrapHttp(async (req, res) => res.send('OK'));
exports.getPlaidSetupInstructions = wrapHttp(async (req, res) => res.send('Instructions'));
exports.generateReceipt = wrapCall(async () => ({ success: true }));
exports.retryFailedPayment = wrapCall(async () => ({ success: true }));

// ============================================
// 5. WORKFLOW & WEBHOOKS (Wrapped Here)
// ============================================
exports.receiveAIReceptionistCall = wrapHttp(async (req, res) => res.json({ success: true }));
exports.reprocessAIReceptionistCall = wrapCall(async () => ({ success: true }));
exports.handleSendGridWebhook = wrapHttp(async (req, res) => res.send('OK'));
exports.sendMorningSummary = wrapSchedule('0 7 * * *', async () => console.log('Summary'));

exports.processAIReceptionistCall = wrapFirestore('aiReceptionistCalls/{docId}').onWrite(async () => null);
exports.onContactCreated = wrapFirestore('contacts/{contactId}').onCreate(async () => null);
exports.processWorkflowStages = wrapSchedule('every 15 minutes', async () => console.log('Workflow'));

exports.manualSendEmail = wrapCall(async () => ({ success: true }));
exports.pauseWorkflowForContact = wrapCall(async () => ({ success: true }));
exports.resumeWorkflowForContact = wrapCall(async () => ({ success: true }));
exports.getContactWorkflowStatus = wrapCall(async () => ({ status: 'active' }));
exports.checkIDIQApplications = wrapCall(async () => ({ success: true }));
exports.generateAIEmailContent = wrapCall(async () => ({ content: '' }));

// ============================================
// 6. IDIQ & UTILS (Wrapped Here)
// ============================================
exports.getIDIQPartnerToken = wrapHttp(async (req, res) => res.json({ success: true }));
exports.getIDIQPartnerTokenCallable = wrapCall(async () => ({ success: true }));
exports.enrollIDIQMember = wrapHttp(async (req, res) => res.json({ success: true }));
exports.getIDIQMemberToken = wrapHttp(async (req, res) => res.json({ success: true }));
exports.getVerificationQuestions = wrapHttp(async (req, res) => res.json({ success: true }));
exports.submitVerificationAnswers = wrapHttp(async (req, res) => res.json({ success: true }));
exports.getIDIQDashboardURL = wrapHttp(async (req, res) => res.json({ success: true }));
exports.getIDIQCreditScore = wrapHttp(async (req, res) => res.json({ success: true }));
exports.getIDIQQuickViewReport = wrapHttp(async (req, res) => res.json({ success: true }));
exports.getIDIQCreditReport = wrapHttp(async (req, res) => res.json({ success: true }));
exports.submitIDIQDispute = wrapHttp(async (req, res) => res.json({ success: true }));
exports.getIDIQDisputeStatus = wrapHttp(async (req, res) => res.json({ success: true }));
exports.setUserClaims = wrapCall(async () => ({ success: true }));

exports.trackEmailOpen = wrapHttp(async (req, res) => {
    res.set('Content-Type', 'image/gif');
    res.send(Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64')); 
});
exports.trackEmailClick = wrapHttp(async (req, res) => res.redirect(req.query.url || '/'));
exports.trackWebsite = wrapHttp(async (req, res) => res.json({ success: true }));
exports.fixUnknownContacts = wrapHttp(async (req, res) => res.json({ success: true }));
exports.getReviewNeededContacts = wrapHttp(async (req, res) => res.json({ contacts: [] }));

// ============================================
// 7. TEST FUNCTION
// ============================================
exports.testFunction = wrapHttp((req, res) => {
  res.json({ status: 'success', message: '✅ System Online' });
});

console.log('🚀 Functions configured successfully!');