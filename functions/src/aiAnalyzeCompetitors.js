/**
 * AI ANALYZE COMPETITORS CLOUD FUNCTION
 *
 * Purpose:
 * Analyzes competitors in the credit repair industry to provide strategic
 * insights and competitive intelligence for Speedy Credit Repair.
 *
 * What It Does:
 * - Analyzes competitor pricing, features, and positioning
 * - Tracks competitor price changes over time
 * - Generates competitive score and strategic recommendations
 * - Identifies market opportunities and threats
 * - Provides actionable insights for staying ahead
 *
 * Why It's Important:
 * - Enables data-driven pricing decisions
 * - Identifies differentiation opportunities
 * - Helps maintain competitive advantage
 * - Tracks market trends and shifts
 * - Informs strategic planning
 *
 * Called by: Tier3Dashboard component
 *
 * Created: 2025-12-05
 * Part of: Speedy Credit Repair Tier 3 AI Features
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

/**
 * Cloud Function: aiAnalyzeCompetitors
 *
 * @param {Object} data - Request data
 * @param {string} data.focusArea - Area to analyze ('all', 'pricing', 'features', etc.)
 * @param {boolean} data.includeRecommendations - Include strategic recommendations (default: true)
 * @param {Object} context - Function context
 * @returns {Object} Competitive analysis results
 */
exports.aiAnalyzeCompetitors = functions.https.onCall(async (data, context) => {
  const { focusArea = 'all', includeRecommendations = true } = data;

  console.log(`[aiAnalyzeCompetitors] Analyzing competitors, focus: ${focusArea}`);

  try {
    // Import the competitor analysis module
    const { analyzeCompetitors, getCompetitiveIntelligence } = require('../../src/lib/ai/competitorAnalysis');

    // Run competitive analysis
    const analysis = await analyzeCompetitors(focusArea);

    // Get quick intelligence overview
    const intelligence = await getCompetitiveIntelligence();

    // Store analysis in Firestore for tracking
    await admin.firestore().collection('competitiveAnalyses').add({
      focusArea,
      competitiveScore: analysis.competitiveScore,
      status: analysis.status,
      analysisDate: admin.firestore.FieldValue.serverTimestamp(),
      recommendationCount: analysis.recommendations.length,
      topThreats: analysis.threats.slice(0, 3),
      topOpportunities: analysis.opportunities.slice(0, 3)
    });

    console.log(`[aiAnalyzeCompetitors] Analysis complete. Score: ${analysis.competitiveScore}`);

    return {
      success: true,
      analysis,
      intelligence: includeRecommendations ? intelligence : undefined,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('[aiAnalyzeCompetitors] Error:', error);
    throw new functions.https.HttpsError('internal', `Competitor analysis failed: ${error.message}`);
  }
});

/**
 * Cloud Function: aiTrackPriceChange
 *
 * @param {Object} data - Request data
 * @param {string} data.competitorId - Competitor identifier
 * @param {Object} data.priceChange - Price change details
 * @param {Object} context - Function context
 * @returns {Object} Tracking result
 */
exports.aiTrackPriceChange = functions.https.onCall(async (data, context) => {
  const { competitorId, priceChange } = data;

  console.log(`[aiTrackPriceChange] Tracking price change for ${competitorId}`);

  try {
    if (!competitorId || !priceChange) {
      throw new functions.https.HttpsError('invalid-argument', 'Missing competitorId or priceChange');
    }

    // Import the competitor analysis module
    const { trackPriceChange } = require('../../src/lib/ai/competitorAnalysis');

    // Track the price change
    const result = await trackPriceChange(competitorId, priceChange);

    console.log(`[aiTrackPriceChange] Price change tracked successfully`);

    return {
      success: true,
      result,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('[aiTrackPriceChange] Error:', error);
    throw new functions.https.HttpsError('internal', `Price tracking failed: ${error.message}`);
  }
});

/**
 * Cloud Function: aiGetCompetitiveIntelligence
 *
 * Quick endpoint for getting competitive intelligence overview
 *
 * @param {Object} data - Request data (empty)
 * @param {Object} context - Function context
 * @returns {Object} Competitive intelligence
 */
exports.aiGetCompetitiveIntelligence = functions.https.onCall(async (data, context) => {
  console.log(`[aiGetCompetitiveIntelligence] Fetching competitive intelligence`);

  try {
    // Import the competitor analysis module
    const { getCompetitiveIntelligence } = require('../../src/lib/ai/competitorAnalysis');

    // Get intelligence
    const intelligence = await getCompetitiveIntelligence();

    console.log(`[aiGetCompetitiveIntelligence] Intelligence retrieved`);

    return {
      success: true,
      intelligence,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('[aiGetCompetitiveIntelligence] Error:', error);
    throw new functions.https.HttpsError('internal', `Intelligence retrieval failed: ${error.message}`);
  }
});
