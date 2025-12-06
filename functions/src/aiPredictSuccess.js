/**
 * AI PREDICT SUCCESS CLOUD FUNCTION
 *
 * Purpose:
 * Predicts client success outcomes including credit score improvement,
 * timeline to completion, deletion success rates, and satisfaction scores.
 *
 * What It Does:
 * - Predicts credit score improvement with confidence ranges
 * - Estimates timeline to completion (in months)
 * - Calculates deletion success probability by item type
 * - Predicts client satisfaction (NPS score)
 * - Validates prediction accuracy against actual outcomes
 * - Identifies at-risk clients early
 *
 * Why It's Important:
 * - Sets realistic client expectations
 * - Identifies at-risk clients for intervention
 * - Optimizes resource allocation
 * - Tracks prediction model accuracy
 * - Improves service quality through insights
 *
 * Called by: Tier3Dashboard component
 *
 * Created: 2025-12-05
 * Part of: Speedy Credit Repair Tier 3 AI Features
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

/**
 * Cloud Function: aiPredictClientSuccess
 *
 * @param {Object} data - Request data
 * @param {string} data.contactId - Contact to predict success for
 * @param {boolean} data.includeInsights - Include detailed insights (default: true)
 * @param {Object} context - Function context
 * @returns {Object} Success prediction results
 */
exports.aiPredictClientSuccess = functions.https.onCall(async (data, context) => {
  const { contactId, includeInsights = true } = data;

  console.log(`[aiPredictClientSuccess] Predicting success for contact: ${contactId}`);

  try {
    if (!contactId) {
      throw new functions.https.HttpsError('invalid-argument', 'Missing contactId');
    }

    // Verify contact exists
    const contactDoc = await admin.firestore().collection('contacts').doc(contactId).get();
    if (!contactDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Contact not found');
    }

    // Import the success predictor module
    const { predictClientSuccess } = require('../../src/lib/ai/successPredictor');

    // Run prediction
    const prediction = await predictClientSuccess(contactId, { includeInsights });

    // Store prediction for accuracy tracking
    await admin.firestore().collection('successPredictions').add({
      contactId,
      predictionDate: admin.firestore.FieldValue.serverTimestamp(),
      creditScore: prediction.creditScore,
      timeline: prediction.timeline,
      completionProbability: prediction.completionProbability,
      expectedDeletions: prediction.deletions.expectedDeletions,
      totalItems: prediction.deletions.totalItems,
      satisfactionScore: prediction.satisfaction.npsScore,
      riskLevel: prediction.insights?.riskLevel || 'unknown'
    });

    // Update contact with latest prediction
    await admin.firestore().collection('contacts').doc(contactId).update({
      lastPredictionDate: admin.firestore.FieldValue.serverTimestamp(),
      predictedScoreImprovement: prediction.creditScore.improvement,
      predictedTimelineMonths: prediction.timeline.expectedMonths,
      completionProbability: prediction.completionProbability,
      riskLevel: prediction.insights?.riskLevel || 'low'
    });

    console.log(`[aiPredictClientSuccess] Prediction complete. Expected improvement: +${prediction.creditScore.improvement} points`);

    return {
      success: true,
      prediction,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('[aiPredictClientSuccess] Error:', error);
    throw new functions.https.HttpsError('internal', `Prediction failed: ${error.message}`);
  }
});

/**
 * Cloud Function: aiValidatePredictionAccuracy
 *
 * @param {Object} data - Request data
 * @param {string} data.contactId - Contact to validate predictions for
 * @param {Object} context - Function context
 * @returns {Object} Validation results
 */
exports.aiValidatePredictionAccuracy = functions.https.onCall(async (data, context) => {
  const { contactId } = data;

  console.log(`[aiValidatePredictionAccuracy] Validating predictions for contact: ${contactId}`);

  try {
    if (!contactId) {
      throw new functions.https.HttpsError('invalid-argument', 'Missing contactId');
    }

    // Import the success predictor module
    const { validatePredictionAccuracy } = require('../../src/lib/ai/successPredictor');

    // Validate predictions
    const validation = await validatePredictionAccuracy(contactId);

    // Store validation results
    await admin.firestore().collection('predictionValidations').add({
      contactId,
      validationDate: admin.firestore.FieldValue.serverTimestamp(),
      accuracy: validation.accuracy,
      scoreError: validation.scoreError,
      timelineError: validation.timelineError,
      modelVersion: validation.modelVersion || '1.0'
    });

    console.log(`[aiValidatePredictionAccuracy] Validation complete. Accuracy: ${validation.accuracy}%`);

    return {
      success: true,
      validation,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('[aiValidatePredictionAccuracy] Error:', error);
    throw new functions.https.HttpsError('internal', `Validation failed: ${error.message}`);
  }
});

/**
 * Cloud Function: aiBatchPredictSuccess
 *
 * Predict success for multiple contacts at once
 *
 * @param {Object} data - Request data
 * @param {Array<string>} data.contactIds - Array of contact IDs
 * @param {Object} context - Function context
 * @returns {Object} Batch prediction results
 */
exports.aiBatchPredictSuccess = functions.https.onCall(async (data, context) => {
  const { contactIds } = data;

  console.log(`[aiBatchPredictSuccess] Batch predicting for ${contactIds?.length || 0} contacts`);

  try {
    if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid contactIds array');
    }

    if (contactIds.length > 50) {
      throw new functions.https.HttpsError('invalid-argument', 'Maximum 50 contacts per batch');
    }

    // Import the success predictor module
    const { predictClientSuccess } = require('../../src/lib/ai/successPredictor');

    // Run predictions in parallel
    const predictions = await Promise.all(
      contactIds.map(async (contactId) => {
        try {
          const prediction = await predictClientSuccess(contactId, { includeInsights: false });
          return { contactId, success: true, prediction };
        } catch (error) {
          console.error(`[aiBatchPredictSuccess] Error predicting ${contactId}:`, error.message);
          return { contactId, success: false, error: error.message };
        }
      })
    );

    const successCount = predictions.filter(p => p.success).length;
    console.log(`[aiBatchPredictSuccess] Batch complete. ${successCount}/${contactIds.length} successful`);

    return {
      success: true,
      predictions,
      summary: {
        total: contactIds.length,
        successful: successCount,
        failed: contactIds.length - successCount
      },
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('[aiBatchPredictSuccess] Error:', error);
    throw new functions.https.HttpsError('internal', `Batch prediction failed: ${error.message}`);
  }
});
