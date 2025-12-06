/**
 * AI ANALYZE CONTACT CLOUD FUNCTION
 *
 * Purpose:
 * Analyzes contact profiles using GPT-4 to generate lead scores, recommendations,
 * and insights. Called by workflowEngine during AI_ANALYSIS steps.
 *
 * What It Does:
 * - Analyzes contact data (credit score, negative items, engagement, etc.)
 * - Generates lead score (0-100) with transparent reasoning
 * - Recommends best-fit service tier
 * - Identifies red flags and opportunities
 * - Returns actionable insights for sales team
 *
 * Why It's Important:
 * - Automates lead qualification
 * - Ensures consistent scoring
 * - Provides reasoning for scores (not black box)
 * - Helps prioritize which leads to call first
 * - Suggests personalized approaches
 *
 * Called by: workflowEngine.executeStep() when step.type === 'ai_analysis'
 *
 * Created: 2025-12-05
 * Part of: Speedy Credit Repair AI Workflow System
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { Configuration, OpenAIApi } = require('openai');

// Initialize OpenAI
const configuration = new Configuration({
  apiKey: functions.config().openai.key
});
const openai = new OpenAIApi(configuration);

/**
 * Cloud Function: aiAnalyzeContact
 *
 * @param {Object} data - Request data
 * @param {string} data.contactId - Contact to analyze
 * @param {boolean} data.returnReasoning - Include detailed reasoning (default: false)
 * @param {Object} context - Function context
 * @returns {Object} Analysis results
 */
exports.aiAnalyzeContact = functions.https.onCall(async (data, context) => {
  const { contactId, returnReasoning = false } = data;

  console.log(`[aiAnalyzeContact] Analyzing contact: ${contactId}`);

  try {
    // Get contact data
    const contactDoc = await admin.firestore().collection('contacts').doc(contactId).get();

    if (!contactDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Contact not found');
    }

    const contact = { id: contactDoc.id, ...contactDoc.data() };

    // Prepare data for GPT-4
    const prompt = buildAnalysisPrompt(contact, returnReasoning);

    // Call GPT-4
    const response = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert credit repair consultant analyzing leads for Speedy Credit Repair. Provide data-driven, actionable insights.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3, // Lower temperature for consistent scoring
      max_tokens: 1000
    });

    const analysisText = response.data.choices[0].message.content;
    const analysis = parseAnalysisResponse(analysisText);

    // Update contact with analysis
    await admin.firestore().collection('contacts').doc(contactId).update({
      leadScore: analysis.leadScore,
      leadTier: analysis.leadTier,
      temperature: analysis.temperature,
      recommendedServiceTier: analysis.recommendedServiceTier,
      aiAnalysisDate: admin.firestore.FieldValue.serverTimestamp(),
      aiInsights: returnReasoning ? analysis.reasoning : null
    });

    console.log(`[aiAnalyzeContact] Analysis complete. Score: ${analysis.leadScore}, Tier: ${analysis.leadTier}`);

    return {
      success: true,
      leadScore: analysis.leadScore,
      leadTier: analysis.leadTier,
      temperature: analysis.temperature,
      recommendedServiceTier: analysis.recommendedServiceTier,
      reasoning: returnReasoning ? analysis.reasoning : undefined
    };

  } catch (error) {
    console.error('[aiAnalyzeContact] Error:', error);
    throw new functions.https.HttpsError('internal', `Analysis failed: ${error.message}`);
  }
});

/**
 * Builds GPT-4 prompt for contact analysis
 */
function buildAnalysisPrompt(contact, includeReasoning) {
  return `Analyze this credit repair lead and provide a structured assessment:

**Contact Information:**
Name: ${contact.firstName} ${contact.lastName}
Email: ${contact.email}
Phone: ${contact.phone || 'Not provided'}
Source: ${contact.source || 'Unknown'}

**Credit Profile:**
Credit Score: ${contact.creditScore || 'Unknown'}
Negative Items: ${contact.negativeItemCount || 0}
Has Bankruptcy: ${contact.hasBankruptcy ? 'Yes' : 'No'}
Has Foreclosure: ${contact.hasForeclosure ? 'Yes' : 'No'}
Has Judgments: ${contact.hasJudgments ? 'Yes' : 'No'}

**Financial Information:**
Annual Income: $${contact.annualIncome || 'Unknown'}
Employment Status: ${contact.employmentStatus || 'Unknown'}
Housing Status: ${contact.housingStatus || 'Unknown'}

**Engagement:**
Emails Opened: ${contact.emailEngagement?.opened || 0}
Emails Clicked: ${contact.emailEngagement?.clicked || 0}
Response Time: ${contact.firstResponseTime ? contact.firstResponseTime + ' minutes' : 'N/A'}

**Your Task:**
1. Assign a Lead Score (0-100) based on likelihood to convert
2. Assign a Lead Tier (A=Hot, B=Warm, C=Cool, D=Cold)
3. Assign a Temperature (hot/warm/cool/cold)
4. Recommend the best service tier (diy/standard/acceleration/premium/vip_elite)
${includeReasoning ? '5. Provide detailed reasoning for your assessment' : ''}

**Scoring Factors:**
- Engagement signals (opened emails, fast responses) = high score
- Credit repair need (low score + many items) = high score
- Financial capacity (income + employment) = moderate score
- Problem complexity (bankruptcy, judgments) = affects tier recommendation
- Lead source quality = moderate score

**Response Format (JSON):**
{
  "leadScore": 85,
  "leadTier": "A",
  "temperature": "hot",
  "recommendedServiceTier": "premium",
  ${includeReasoning ? '"reasoning": {"strengths": ["..."], "concerns": ["..."], "recommendation": "..."}' : ''}
}`;
}

/**
 * Parses GPT-4 response into structured data
 */
function parseAnalysisResponse(text) {
  try {
    // Try to extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        leadScore: parsed.leadScore || 50,
        leadTier: parsed.leadTier || 'C',
        temperature: parsed.temperature || 'cool',
        recommendedServiceTier: parsed.recommendedServiceTier || 'standard',
        reasoning: parsed.reasoning || null
      };
    }

    // Fallback: extract values from text
    const scoreMatch = text.match(/leadScore["\s:]+(\d+)/i);
    const tierMatch = text.match(/leadTier["\s:]+([A-D])/i);

    return {
      leadScore: scoreMatch ? parseInt(scoreMatch[1]) : 50,
      leadTier: tierMatch ? tierMatch[1] : 'C',
      temperature: 'cool',
      recommendedServiceTier: 'standard',
      reasoning: null
    };

  } catch (error) {
    console.error('[parseAnalysisResponse] Parse error:', error);
    // Return defaults if parsing fails
    return {
      leadScore: 50,
      leadTier: 'C',
      temperature: 'cool',
      recommendedServiceTier: 'standard',
      reasoning: null
    };
  }
}
