/**
 * AI ANALYZE WORKFLOW STEP
 * Provides real-time analysis and suggestions for AI Workflow Consultant
 */

const functions = require('firebase-functions');
const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: functions.config().openai.key });

// Export a plain handler for gen 2 onRequest
const aiAnalyzeWorkflowStep = async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  const { workflowId, stepIndex, contactData, executionData } = req.body;

  try {
    const prompt = `Analyze this workflow step and provide guidance:

**Workflow:** ${workflowId}
**Current Step:** ${stepIndex + 1}
**Contact:** ${contactData.firstName} (Score: ${contactData.creditScore}, Items: ${contactData.negativeItemCount})

**Your Task:**
Provide:
1. What's working well ✅
2. Issues detected ⚠️
3. Specific suggestions 💡
4. Missing features 🔍

**Response Format (JSON):**
{
  "working": ["..."],
  "issues": ["..."],
  "suggestions": [{"summary": "...", "priority": "high/medium/low", "implementation": {...}}],
  "missingFeatures": ["..."]
}`;

    const response = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        {role: 'system', content: 'You are an expert workflow consultant providing real-time guidance.'},
        {role: 'user', content: prompt}
      ],
      temperature: 0.7,
      max_tokens: 800
    });

    const analysisText = response.data.choices[0].message.content;
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {
      working: ['Step structure looks good'],
      issues: [],
      suggestions: [],
      missingFeatures: []
    };

    res.status(200).json({
      success: true,
      analysis
    });

  } catch (error) {
    console.error('[aiAnalyzeWorkflowStep] Error:', error);
    res.status(500).json({
      success: false,
      analysis: {
        working: [],
        issues: ['AI analysis temporarily unavailable'],
        suggestions: [],
        missingFeatures: []
      }
    });
  }
};

module.exports = { aiAnalyzeWorkflowStep };
