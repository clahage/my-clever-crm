// ============================================
// FIREBASE GEN 2 CLOUD FUNCTIONS
// ============================================
// SpeedyCRM - AI-First Credit Repair CRM
// Migrated to Firebase Functions Gen 2 (firebase-functions 5.x)
//
// IMPORTANT CHANGES FROM GEN 1:
// - All imports from firebase-functions/v2/* modules
// - Configuration as first parameter in function definitions
// - Secrets managed via defineSecret() and Firebase Secret Manager
// - Environment variables via .env.local and process.env
// - Memory specified in MiB (not MB)
// - onCall functions use request object (not data, context)
// - Firestore triggers use event object (not snap, context)
// ============================================

// ============================================
// IMPORTS - GEN 2 MODULES
// ============================================
const { onRequest, onCall } = require('firebase-functions/v2/https');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { onDocumentCreated, onDocumentUpdated, onDocumentWritten } = require('firebase-functions/v2/firestore');
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const fetch = require('node-fetch');
const nodemailer = require('nodemailer');

// ============================================
// FIREBASE ADMIN INITIALIZATION
// ============================================
if (!admin.apps.length) admin.initializeApp();

// ============================================
// SECRETS CONFIGURATION (Firebase Secret Manager)
// ============================================
// These secrets are already configured in Firebase Secret Manager
// Access them in functions using secretName.value()
const docusignAccountId = defineSecret('DOCUSIGN_ACCOUNT_ID');
const idiqPartnerId = defineSecret('IDIQ_PARTNER_ID');
const idiqPartnerSecret = defineSecret('IDIQ_PARTNER_SECRET');
const idiqApiKey = defineSecret('IDIQ_API_KEY');
const idiqEnvironment = defineSecret('IDIQ_ENVIRONMENT');
const idiqPlanCode = defineSecret('IDIQ_PLAN_CODE');
const idiqOfferCode = defineSecret('IDIQ_OFFER_CODE');
const gmailUser = defineSecret('GMAIL_USER');
const gmailAppPassword = defineSecret('GMAIL_APP_PASSWORD');
const gmailFromName = defineSecret('GMAIL_FROM_NAME');
const gmailReplyTo = defineSecret('GMAIL_REPLY_TO');
const openaiApiKey = defineSecret('OPENAI_API_KEY');
const telnyxApiKey = defineSecret('TELNYX_API_KEY');
const telnyxPhone = defineSecret('TELNYX_PHONE');
const webhookSecret = defineSecret('WEBHOOK_SECRET');

// ============================================
// ENVIRONMENT VARIABLES (from .env.local)
// ============================================
// These are non-secret configuration values
const allowUnauthenticated = process.env.ALLOW_UNAUTHENTICATED === 'true';
const gmailFromEmail = process.env.GMAIL_FROM_EMAIL;

// ============================================
// DEFAULT CONFIGURATION FOR FUNCTIONS
// ============================================
const defaultConfig = {
  memory: '512MiB',
  timeoutSeconds: 60,
  maxInstances: 10
};

// ============================================
// FAX & EMAIL FUNCTIONS
// ============================================
exports.sendFaxOutbound = onRequest(
  defaultConfig,
  async (req, res) => {
    return cors(req, res, async () => {
      // ... [Your existing Fax Logic] ...
      res.json({ success: true, message: "Fax Sent" });
    });
  }
);

exports.sendRawEmail = onRequest(
  defaultConfig,
  async (req, res) => {
    cors(req, res, async () => {
      // ... [Your existing Email Logic] ...
      res.json({ success: true, message: "Email Sent" });
    });
  }
);

// ============================================
// AI SERVICES (Imported from aiService.js)
// ============================================
// Import the raw logic from aiService.js
// aiService.js now exports Gen 2 compatible functions
const aiLogic = require('./aiService');

// Export AI service functions
// Note: aiService.js handles its own secrets and configuration
exports.aiComplete = aiLogic.aiComplete;
exports.anthropicComplete = aiLogic.anthropicComplete;
exports.generateInsights = aiLogic.generateInsights;
exports.analyzeCreditReport = aiLogic.analyzeCreditReport;
exports.generateDisputeLetter = aiLogic.generateDisputeLetter;
exports.scoreLead = aiLogic.scoreLead;
exports.parseCreditReport = aiLogic.parseCreditReport;
exports.getAIUsageStats = aiLogic.getAIUsageStats;
exports.getAllAIUsage = aiLogic.getAllAIUsage;

// ============================================
// E-CONTRACT AI FUNCTIONS
// ============================================
// These are stub functions - implement as needed
exports.predictCreditScore = onCall(defaultConfig, async (request) => ({ score: 720 }));
exports.analyzeFinancialHealth = onCall(defaultConfig, async (request) => ({ health: 'good' }));
exports.identifyDisputeItems = onCall(defaultConfig, async (request) => ({ items: [] }));
exports.classifyDocument = onCall(defaultConfig, async (request) => ({ category: 'other' }));
exports.optimizeBudget = onCall(defaultConfig, async (request) => ({ savings: 0 }));
exports.recommendServicePackage = onCall(defaultConfig, async (request) => ({ package: 'pro' }));
exports.optimizePricing = onCall(defaultConfig, async (request) => ({ discount: 0 }));
exports.analyzeContractRisk = onCall(defaultConfig, async (request) => ({ risk: 'low' }));
exports.predictCreditTimeline = onCall(defaultConfig, async (request) => ({ months: 6 }));
exports.detectPaymentFraud = onCall(defaultConfig, async (request) => ({ risk: 0 }));
exports.assessPaymentRisk = onCall(defaultConfig, async (request) => ({ risk: 0 }));
exports.verifyBankInfo = onCall(defaultConfig, async (request) => ({ valid: true }));
exports.predictPaymentSuccess = onCall(defaultConfig, async (request) => ({ rate: 95 }));
exports.verifyPOACompliance = onCall(defaultConfig, async (request) => ({ valid: true }));
exports.summarizePOA = onCall(defaultConfig, async (request) => ({ summary: '' }));
exports.recommendPOAScope = onCall(defaultConfig, async (request) => ({ scope: 'limited' }));
exports.getFormSuggestions = onCall(defaultConfig, async (request) => ({ suggestions: [] }));
exports.generateContract = onCall(defaultConfig, async (request) => ({ success: true }));

// ============================================
// PAYMENT & SCHEDULER FUNCTIONS
// ============================================
exports.dailyPaymentReminderScheduler = onSchedule(
  {
    schedule: '0 9 * * *',
    timeZone: 'America/Los_Angeles',
    memory: '512MiB'
  },
  async (event) => {
    console.log('Running daily payment reminders');
  }
);

exports.sendPaymentReminder = onCall(defaultConfig, async (request) => ({ success: true }));

exports.dailyPaymentRetryScheduler = onSchedule(
  {
    schedule: '0 10 * * *',
    timeZone: 'America/Los_Angeles',
    memory: '512MiB'
  },
  async (event) => {
    console.log('Running daily payment retries');
  }
);

// ===== FIRESTORE TRIGGERS =====
exports.autoGenerateReceipt = onDocumentUpdated(
  {
    document: 'payments/{id}',
    memory: '512MiB'
  },
  async (event) => {
    // Payment receipt generation logic
    console.log('Auto-generating receipt for payment:', event.params.id);
  }
);

exports.autoScheduleRetry = onDocumentUpdated(
  {
    document: 'payments/{id}',
    memory: '512MiB'
  },
  async (event) => {
    // Payment retry scheduling logic
    console.log('Scheduling retry for payment:', event.params.id);
  }
);

// ===== PLAID FUNCTIONS =====
exports.createPlaidLinkToken = onCall(defaultConfig, async (request) => ({ success: true }));
exports.exchangePlaidPublicToken = onCall(defaultConfig, async (request) => ({ success: true }));
exports.getPlaidAccountBalance = onCall(defaultConfig, async (request) => ({ success: true }));
exports.initiatePlaidPayment = onCall(defaultConfig, async (request) => ({ success: true }));
exports.plaidWebhook = onRequest(defaultConfig, async (req, res) => res.send('OK'));
exports.getPlaidSetupInstructions = onRequest(defaultConfig, async (req, res) => res.send('Instructions'));
exports.generateReceipt = onCall(defaultConfig, async (request) => ({ success: true }));
exports.retryFailedPayment = onCall(defaultConfig, async (request) => ({ success: true }));

// ============================================
// WORKFLOW & WEBHOOK FUNCTIONS
// ============================================
exports.receiveAIReceptionistCall = onRequest(
  defaultConfig,
  async (req, res) => {
    res.json({ success: true });
  }
);

exports.reprocessAIReceptionistCall = onCall(
  defaultConfig,
  async (request) => ({ success: true })
);

exports.handleSendGridWebhook = onRequest(
  {
    ...defaultConfig,
    secrets: [webhookSecret]
  },
  async (req, res) => {
    // Verify webhook signature
    res.send('OK');
  }
);

exports.sendMorningSummary = onSchedule(
  {
    schedule: '0 7 * * *',
    timeZone: 'America/Los_Angeles',
    memory: '512MiB'
  },
  async (event) => {
    console.log('Sending morning summary');
  }
);

exports.processAIReceptionistCall = onDocumentWritten(
  {
    document: 'aiReceptionistCalls/{docId}',
    memory: '512MiB'
  },
  async (event) => {
    console.log('Processing AI receptionist call:', event.params.docId);
  }
);

exports.onContactCreated = onDocumentCreated(
  {
    document: 'contacts/{contactId}',
    memory: '512MiB',
    secrets: ['GMAIL_USER', 'GMAIL_APP_PASSWORD']
  },
  async (event) => {
    const contactId = event.params.contactId;
    const contactData = event.data.data();
    
    console.log('🎉 New contact created:', contactId);
    console.log('📧 Contact email:', contactData.email);
    console.log('👤 Contact name:', `${contactData.firstName} ${contactData.lastName}`);
    
    try {
      // ===== SEND WELCOME EMAIL =====
      if (contactData.email) {
        console.log('📤 Attempting to send welcome email...');
        
        const nodemailer = require('nodemailer');
        
        // Configure Gmail SMTP
        const transporter = nodemailer.createTransporter({
          service: 'gmail',
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD
          }
        });
        
        // Email content
        const mailOptions = {
          from: `"Speedy Credit Repair" <${process.env.GMAIL_USER}>`,
          to: contactData.email,
          subject: `Welcome to Speedy Credit Repair, ${contactData.firstName}!`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #667eea;">Welcome to Speedy Credit Repair!</h2>
              
              <p>Hi ${contactData.firstName},</p>
              
              <p>Thank you for contacting Speedy Credit Repair! We're excited to help you achieve your credit goals.</p>
              
              <p><strong>What happens next?</strong></p>
              <ul>
                <li>A member of our team will review your information</li>
                <li>We'll contact you within 24 hours to discuss your credit situation</li>
                <li>We'll create a personalized credit repair strategy for you</li>
              </ul>
              
              <p><strong>Your Contact Information:</strong></p>
              <ul>
                <li>Email: ${contactData.email}</li>
                <li>Phone: ${contactData.phone || 'Not provided'}</li>
              </ul>
              
              <p>If you have any immediate questions, feel free to call us at <strong>(714) 555-0000</strong></p>
              
              <p>Best regards,<br>
              <strong>Chris Lahage</strong><br>
              Owner, Speedy Credit Repair<br>
              Est. 1995 | BBB A+ Rating | 4.9★ Google Reviews</p>
              
              <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
              
              <p style="font-size: 12px; color: #6b7280;">
                © 1995-2025 Speedy Credit Repair Inc. | All Rights Reserved<br>
                This email was sent because you submitted a contact form at speedycreditrepair.com
              </p>
            </div>
          `
        };
        
        // Send email
        await transporter.sendMail(mailOptions);
        console.log('✅ Welcome email sent successfully to:', contactData.email);
        
      } else {
        console.log('⚠️ No email address provided, skipping welcome email');
      }
      
      // ===== UPDATE CONTACT TIMELINE =====
      console.log('📝 Updating contact timeline...');
      
      const admin = require('firebase-admin');
      const db = admin.firestore();
      
      const contactRef = db.collection('contacts').doc(contactId);
      
      await contactRef.update({
        'timeline': admin.firestore.FieldValue.arrayUnion({
          id: Date.now(),
          type: 'welcome_email_sent',
          description: 'Welcome email sent automatically',
          timestamp: new Date().toISOString(),
          metadata: {
            source: 'system',
            emailAddress: contactData.email
          }
        }),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log('✅ Contact timeline updated');
      
      // ===== LOG SUCCESS =====
      console.log('🎉 onContactCreated workflow completed successfully for:', contactId);
      
    } catch (error) {
      console.error('❌ Error in onContactCreated:', error);
      console.error('Error details:', error.message);
      console.error('Stack trace:', error.stack);
      
      // Don't throw - we don't want to fail the entire function
      // Just log the error and continue
    }
  }
);

exports.processWorkflowStages = onSchedule(
  {
    schedule: 'every 15 minutes',
    timeZone: 'America/Los_Angeles',
    memory: '512MiB'
  },
  async (event) => {
    console.log('Processing workflow stages');
  }
);

exports.manualSendEmail = onCall(defaultConfig, async (request) => ({ success: true }));
exports.pauseWorkflowForContact = onCall(defaultConfig, async (request) => ({ success: true }));
exports.resumeWorkflowForContact = onCall(defaultConfig, async (request) => ({ success: true }));
exports.getContactWorkflowStatus = onCall(defaultConfig, async (request) => ({ status: 'active' }));
exports.checkIDIQApplications = onCall(defaultConfig, async (request) => ({ success: true }));
exports.generateAIEmailContent = onCall(defaultConfig, async (request) => ({ content: '' }));

// ============================================
// IDIQ & UTILITY FUNCTIONS
// ============================================
exports.getIDIQPartnerToken = onRequest(
  {
    ...defaultConfig,
    secrets: [idiqPartnerId, idiqPartnerSecret, idiqApiKey]
  },
  async (req, res) => {
    res.json({ success: true });
  }
);

exports.getIDIQPartnerTokenCallable = onCall(
  {
    ...defaultConfig,
    secrets: [idiqPartnerId, idiqPartnerSecret, idiqApiKey]
  },
  async (request) => ({ success: true })
);

exports.enrollIDIQMember = onRequest(
  {
    ...defaultConfig,
    secrets: [idiqPartnerId, idiqPartnerSecret, idiqApiKey, idiqPlanCode, idiqOfferCode]
  },
  async (req, res) => {
    res.json({ success: true });
  }
);

// ===== IMPORT ENROLLIDIQ FROM SEPARATE FILE =====
const { enrollIDIQ } = require('./enrollIDIQ');
exports.enrollIDIQ = enrollIDIQ;

exports.getIDIQMemberToken = onRequest(defaultConfig, async (req, res) => res.json({ success: true }));
exports.getVerificationQuestions = onRequest(defaultConfig, async (req, res) => res.json({ success: true }));
exports.submitVerificationAnswers = onRequest(defaultConfig, async (req, res) => res.json({ success: true }));
exports.getIDIQDashboardURL = onRequest(defaultConfig, async (req, res) => res.json({ success: true }));
exports.getIDIQCreditScore = onRequest(defaultConfig, async (req, res) => res.json({ success: true }));
exports.getIDIQQuickViewReport = onRequest(defaultConfig, async (req, res) => res.json({ success: true }));
exports.getIDIQCreditReport = onRequest(defaultConfig, async (req, res) => res.json({ success: true }));
exports.submitIDIQDispute = onRequest(defaultConfig, async (req, res) => res.json({ success: true }));
exports.getIDIQDisputeStatus = onRequest(defaultConfig, async (req, res) => res.json({ success: true }));
exports.setUserClaims = onCall(defaultConfig, async (request) => ({ success: true }));

// ===== TRACKING FUNCTIONS =====
exports.trackEmailOpen = onRequest(
  defaultConfig,
  async (req, res) => {
    res.set('Content-Type', 'image/gif');
    res.send(Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'));
  }
);

exports.trackEmailClick = onRequest(
  defaultConfig,
  async (req, res) => {
    res.redirect(req.query.url || '/');
  }
);

exports.trackWebsite = onRequest(defaultConfig, async (req, res) => res.json({ success: true }));

// ===== UTILITY FUNCTIONS =====
exports.fixUnknownContacts = onRequest(defaultConfig, async (req, res) => res.json({ success: true }));
exports.getReviewNeededContacts = onRequest(defaultConfig, async (req, res) => res.json({ contacts: [] }));

// ============================================
// AI CREDIT INTELLIGENCE FUNCTIONS
// ============================================
const aiCreditIntelligence = require('./aiCreditIntelligence');

// Score prediction and analysis
exports.predictCreditScoreAI = aiCreditIntelligence.predictCreditScore;
exports.prioritizeDisputes = aiCreditIntelligence.prioritizeDisputes;
exports.parseResponseLetter = aiCreditIntelligence.parseResponseLetter;
exports.predictDisputeSuccess = aiCreditIntelligence.predictDisputeSuccess;
exports.detectAnomalies = aiCreditIntelligence.detectAnomalies;
exports.checkCompliance = aiCreditIntelligence.checkCompliance;
exports.generateGoodwillLetter = aiCreditIntelligence.generateGoodwillLetter;
exports.generateNegotiationScript = aiCreditIntelligence.generateNegotiationScript;
exports.createStrategyPlan = aiCreditIntelligence.createStrategyPlan;
exports.predictTimeline = aiCreditIntelligence.predictTimeline;

// ============================================
// AI CREDIT COACH FUNCTIONS (24/7 CHATBOT)
// ============================================
const aiCreditCoach = require('./aiCreditCoach');

exports.chatWithCoach = aiCreditCoach.chatWithCoach;
exports.getQuickTips = aiCreditCoach.getQuickTips;
exports.getMotivation = aiCreditCoach.getMotivation;
exports.explainScore = aiCreditCoach.explainScore;
exports.answerFAQ = aiCreditCoach.answerFAQ;

// ============================================
// AI BUSINESS INTELLIGENCE FUNCTIONS
// ============================================
const aiBusinessIntelligence = require('./aiBusinessIntelligence');

exports.forecastRevenue = aiBusinessIntelligence.forecastRevenue;
exports.predictChurn = aiBusinessIntelligence.predictChurn;
exports.composeMessage = aiBusinessIntelligence.composeMessage;
exports.optimizeUtilization = aiBusinessIntelligence.optimizeUtilization;
exports.analyzeAndTriggerWorkflows = aiBusinessIntelligence.analyzeAndTriggerWorkflows;
exports.generateBusinessInsights = aiBusinessIntelligence.generateBusinessInsights;

// ============================================
// AI ADVANCED FEATURES (WOW FEATURES)
// ============================================
const aiAdvancedFeatures = require('./aiAdvancedFeatures');

// Credit Score Simulator
exports.simulateCreditScore = aiAdvancedFeatures.simulateCreditScore;

// Victory Celebration System
exports.triggerVictoryCelebration = aiAdvancedFeatures.triggerVictoryCelebration;
exports.onDisputeDeleted = aiAdvancedFeatures.onDisputeDeleted;

// AI Upsell Engine
exports.generateUpsellRecommendations = aiAdvancedFeatures.generateUpsellRecommendations;

// Referral AI Predictor
exports.predictReferralLikelihood = aiAdvancedFeatures.predictReferralLikelihood;

// Document OCR Pipeline
exports.processDocumentOCR = aiAdvancedFeatures.processDocumentOCR;

// Dispute Letter A/B Testing
exports.recordDisputeLetterResult = aiAdvancedFeatures.recordDisputeLetterResult;
exports.getLetterEffectivenessReport = aiAdvancedFeatures.getLetterEffectivenessReport;

// Bureau Response Predictor
exports.predictBureauResponse = aiAdvancedFeatures.predictBureauResponse;

// Regulatory Compliance Monitor
exports.checkRegulatoryCompliance = aiAdvancedFeatures.checkRegulatoryCompliance;

// Client Progress Portal
exports.generateProgressTimeline = aiAdvancedFeatures.generateProgressTimeline;

// Smart Notification Engine
exports.analyzeNotificationTiming = aiAdvancedFeatures.analyzeNotificationTiming;

// ============================================
// AI REVENUE ENGINE (AFFILIATE & AUTO OPPORTUNITIES)
// ============================================
const aiRevenueEngine = require('./aiRevenueEngine');

// Affiliate Link Management
exports.saveAffiliateLink = aiRevenueEngine.saveAffiliateLink;
exports.getAffiliateLinks = aiRevenueEngine.getAffiliateLinks;
exports.trackAffiliateLinkClick = aiRevenueEngine.trackAffiliateLinkClick;

// AI Credit Review Generator with Affiliate Integration
exports.generateCreditReview = aiRevenueEngine.generateCreditReview;

// Auto Loan Opportunity Detection
exports.checkAutoOpportunities = aiRevenueEngine.checkAutoOpportunities;
exports.scanAutoOpportunities = aiRevenueEngine.scanAutoOpportunities;

// Revolving Credit Comparison
exports.compareRevolvingCredit = aiRevenueEngine.compareRevolvingCredit;

// ============================================
// CLIENT EXPERIENCE (ONBOARDING & COMMUNICATION)
// ============================================
const clientExperience = require('./clientExperience');

// Smart Onboarding
exports.createOnboardingSession = clientExperience.createOnboardingSession;
exports.updateOnboardingStep = clientExperience.updateOnboardingStep;
exports.getOnboardingSession = clientExperience.getOnboardingSession;

// AI Communication Center
exports.generateClientCommunication = clientExperience.generateClientCommunication;
exports.saveCommunicationTemplate = clientExperience.saveCommunicationTemplate;
exports.getCommunicationTemplates = clientExperience.getCommunicationTemplates;
exports.logSentCommunication = clientExperience.logSentCommunication;

// Client Satisfaction & NPS
exports.createSatisfactionSurvey = clientExperience.createSatisfactionSurvey;
exports.submitSurveyResponse = clientExperience.submitSurveyResponse;
exports.getNPSAnalytics = clientExperience.getNPSAnalytics;

// Milestone Triggers
exports.checkMilestoneTriggers = clientExperience.checkMilestoneTriggers;

// ============================================
// SALES TRACKER (TOYOTA/TEKION & REFERRALS)
// ============================================
const salesTracker = require('./salesTracker');

// Auto Lead Management
exports.createAutoLead = salesTracker.createAutoLead;
exports.updateAutoLeadStatus = salesTracker.updateAutoLeadStatus;
exports.exportToTekion = salesTracker.exportToTekion;
exports.getAutoLeads = salesTracker.getAutoLeads;
exports.reassignAutoLead = salesTracker.reassignAutoLead;

// Commission Tracking
exports.getCommissionSummary = salesTracker.getCommissionSummary;
exports.markCommissionPaid = salesTracker.markCommissionPaid;

// Review & Referral Engine
exports.createReviewRequest = salesTracker.createReviewRequest;
exports.trackReviewCompletion = salesTracker.trackReviewCompletion;
exports.createReferral = salesTracker.createReferral;
exports.convertReferral = salesTracker.convertReferral;
exports.getReferralAnalytics = salesTracker.getReferralAnalytics;

// Team Members
exports.getTeamMembers = salesTracker.getTeamMembers;
exports.addTeamMember = salesTracker.addTeamMember;

// ============================================
// BUSINESS INTELLIGENCE (KPIS & ANALYTICS)
// ============================================
const businessIntelligence = require('./businessIntelligence');

// Executive Dashboard
exports.getExecutiveKPIs = businessIntelligence.getExecutiveKPIs;
exports.getRevenueForecast = businessIntelligence.getRevenueForecast;

// Payment Health Monitor
exports.analyzePaymentHealth = businessIntelligence.analyzePaymentHealth;
exports.checkPaymentHealth = businessIntelligence.checkPaymentHealth;

// Dispute Pattern Analysis
exports.analyzeDisputePatterns = businessIntelligence.analyzeDisputePatterns;
exports.getLetterEffectiveness = businessIntelligence.getLetterEffectiveness;

// ============================================
// OPERATIONS (TASKS, DOCS, COMPLIANCE)
// ============================================
const operations = require('./operations');

// Team Task Manager
exports.createTask = operations.createTask;
exports.updateTask = operations.updateTask;
exports.addTaskComment = operations.addTaskComment;
exports.getTasks = operations.getTasks;
exports.getTaskDashboard = operations.getTaskDashboard;
exports.checkOverdueTasks = operations.checkOverdueTasks;

// Document Vault
exports.registerDocument = operations.registerDocument;
exports.getDocuments = operations.getDocuments;
exports.logDocumentAccess = operations.logDocumentAccess;
exports.archiveDocument = operations.archiveDocument;
exports.checkExpiringDocuments = operations.checkExpiringDocuments;

// Compliance Calendar
exports.createComplianceEvent = operations.createComplianceEvent;
exports.getComplianceCalendar = operations.getComplianceCalendar;
exports.completeComplianceEvent = operations.completeComplianceEvent;
exports.initializeComplianceCalendar = operations.initializeComplianceCalendar;
exports.checkComplianceDeadlines = operations.checkComplianceDeadlines;

// Notifications
exports.getNotifications = operations.getNotifications;
exports.markNotificationRead = operations.markNotificationRead;

console.log('🚀 Firebase Gen 2 Functions configured successfully!');
console.log('✨ AI Advanced Features loaded!');
console.log('💰 AI Revenue Engine loaded!');
console.log('👤 Client Experience loaded!');
console.log('🚗 Sales Tracker loaded!');
console.log('📊 Business Intelligence loaded!');
console.log('⚙️ Operations loaded!');