/**
 * FIREBASE CLOUD FUNCTIONS - INDEX
 *
 * Purpose:
 * Main entry point for all Firebase Cloud Functions used by Speedy Credit Repair
 * workflow system. Exports all functions for deployment.
 *
 * Functions:
 * Tier 1 (Core):
 * 1. aiAnalyzeContact - AI-powered lead analysis and scoring
 * 2. sendWorkflowEmail - Send emails with personalization and tracking
 * 3. aiAnalyzeWorkflowStep - Real-time step analysis for AI Consultant
 * 4. aiRecommendServiceTier - Recommend best service tier based on credit profile
 * 5. handleIDIQWebhook - Process IDIQ credit report webhooks
 *
 * Tier 3 (Advanced):
 * 6. aiAnalyzeCompetitors - Competitive intelligence and market analysis
 * 7. aiTrackPriceChange - Track competitor price changes
 * 8. aiGetCompetitiveIntelligence - Quick competitive overview
 * 9. aiPredictClientSuccess - Predict client outcomes and success rates
 * 10. aiValidatePredictionAccuracy - Validate prediction model accuracy
 * 11. aiBatchPredictSuccess - Batch predict success for multiple clients
 * 12. aiAnalyzeWorkflowHealth - Analyze workflow health and issues
 * 13. aiRepairWorkflow - Auto-repair workflow issues
 * 14. aiBatchAnalyzeWorkflows - Batch analyze workflow health
 * 15. dailyWorkflowHealthCheck - Scheduled daily health checks
 * 16. aiCalculateTimeToValue - Calculate client ROI and value
 * 17. aiGenerateROIReport - Generate formatted ROI reports
 * 18. aiBatchCalculateROI - Batch calculate ROI for multiple clients
 * 19. monthlyROIReporting - Scheduled monthly ROI reports
 *
 * Created: 2025-12-05
 * Part of: Speedy Credit Repair AI Workflow System
 */

const admin = require('firebase-admin');
admin.initializeApp();

// ========================================
// TIER 1: Core Cloud Functions
// ========================================
exports.aiAnalyzeContact = require('./aiAnalyzeContact').aiAnalyzeContact;
exports.sendWorkflowEmail = require('./sendWorkflowEmail').sendWorkflowEmail;
exports.aiAnalyzeWorkflowStep = require('./aiAnalyzeWorkflowStep').aiAnalyzeWorkflowStep;
exports.aiRecommendServiceTier = require('./aiRecommendServiceTier').aiRecommendServiceTier;
exports.handleIDIQWebhook = require('./handleIDIQWebhook').handleIDIQWebhook;

// ========================================
// TIER 2: Helper Functions
// ========================================
exports.aiGenerateEmail = require('./aiHelpers').aiGenerateEmail;
exports.aiOptimizeEmail = require('./aiHelpers').aiOptimizeEmail;
exports.aiGenerateEmailVariants = require('./aiHelpers').aiGenerateEmailVariants;
exports.aiBuildWorkflowFromNaturalLanguage = require('./aiHelpers').aiBuildWorkflowFromNaturalLanguage;
exports.aiAnalyzeWorkflowPerformance = require('./aiHelpers').aiAnalyzeWorkflowPerformance;
exports.aiAnalyzeAnomalies = require('./aiHelpers').aiAnalyzeAnomalies;
exports.aiAnalyzeLeadQuality = require('./aiHelpers').aiAnalyzeLeadQuality;
exports.applyWorkflowOptimization = require('./aiHelpers').applyWorkflowOptimization;

// ========================================
// TIER 3: Advanced AI Features
// ========================================

// Competitor Analysis
exports.aiAnalyzeCompetitors = require('./aiAnalyzeCompetitors').aiAnalyzeCompetitors;
exports.aiTrackPriceChange = require('./aiAnalyzeCompetitors').aiTrackPriceChange;
exports.aiGetCompetitiveIntelligence = require('./aiAnalyzeCompetitors').aiGetCompetitiveIntelligence;

// Success Prediction
exports.aiPredictClientSuccess = require('./aiPredictSuccess').aiPredictClientSuccess;
exports.aiValidatePredictionAccuracy = require('./aiPredictSuccess').aiValidatePredictionAccuracy;
exports.aiBatchPredictSuccess = require('./aiPredictSuccess').aiBatchPredictSuccess;

// Workflow Repair
exports.aiAnalyzeWorkflowHealth = require('./aiRepairWorkflow').aiAnalyzeWorkflowHealth;
exports.aiRepairWorkflow = require('./aiRepairWorkflow').aiRepairWorkflow;
exports.aiBatchAnalyzeWorkflows = require('./aiRepairWorkflow').aiBatchAnalyzeWorkflows;
exports.dailyWorkflowHealthCheck = require('./aiRepairWorkflow').dailyWorkflowHealthCheck;

// Time-to-Value / ROI Calculation
exports.aiCalculateTimeToValue = require('./aiCalculateTimeToValue').aiCalculateTimeToValue;
exports.aiGenerateROIReport = require('./aiCalculateTimeToValue').aiGenerateROIReport;
exports.aiBatchCalculateROI = require('./aiCalculateTimeToValue').aiBatchCalculateROI;
exports.monthlyROIReporting = require('./aiCalculateTimeToValue').monthlyROIReporting;
