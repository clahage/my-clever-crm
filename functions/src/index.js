/**
 * FIREBASE CLOUD FUNCTIONS - INDEX
 *
 * Purpose:
 * Main entry point for all Firebase Cloud Functions used by Speedy Credit Repair
 * workflow system. Exports all functions for deployment.
 *
 * Functions:
 * 1. aiAnalyzeContact - AI-powered lead analysis and scoring
 * 2. sendWorkflowEmail - Send emails with personalization and tracking
 * 3. aiAnalyzeWorkflowStep - Real-time step analysis for AI Consultant
 * 4. aiRecommendServiceTier - Recommend best service tier based on credit profile
 * 5. handleIDIQWebhook - Process IDIQ credit report webhooks
 *
 * Created: 2025-12-05
 * Part of: Speedy Credit Repair AI Workflow System
 */

const admin = require('firebase-admin');
admin.initializeApp();

// Export all Cloud Functions
exports.aiAnalyzeContact = require('./aiAnalyzeContact').aiAnalyzeContact;
exports.sendWorkflowEmail = require('./sendWorkflowEmail').sendWorkflowEmail;
exports.aiAnalyzeWorkflowStep = require('./aiAnalyzeWorkflowStep').aiAnalyzeWorkflowStep;
exports.aiRecommendServiceTier = require('./aiRecommendServiceTier').aiRecommendServiceTier;
exports.handleIDIQWebhook = require('./handleIDIQWebhook').handleIDIQWebhook;

// Additional helper functions
exports.aiGenerateEmail = require('./aiHelpers').aiGenerateEmail;
exports.aiOptimizeEmail = require('./aiHelpers').aiOptimizeEmail;
exports.aiGenerateEmailVariants = require('./aiHelpers').aiGenerateEmailVariants;
exports.aiBuildWorkflowFromNaturalLanguage = require('./aiHelpers').aiBuildWorkflowFromNaturalLanguage;
exports.aiAnalyzeWorkflowPerformance = require('./aiHelpers').aiAnalyzeWorkflowPerformance;
exports.aiAnalyzeAnomalies = require('./aiHelpers').aiAnalyzeAnomalies;
exports.aiAnalyzeLeadQuality = require('./aiHelpers').aiAnalyzeLeadQuality;
exports.applyWorkflowOptimization = require('./aiHelpers').applyWorkflowOptimization;
