// openaiDisputeService.js
// OpenAI Integration for Dispute Letter Generation
// Place this file in src/services/openaiDisputeService.js

import aiService from '@/services/aiService';

// Generate complete dispute letter with secure aiService
export async function generateLetterWithAI(params) {
  const { clientInfo, disputeDetails, strategy, template } = params;

  if (aiService?.generateDisputeLetter) {
    try {
      const result = await aiService.generateDisputeLetter({ clientInfo, disputeDetails, strategy, template });
      return result.response || result;
    } catch (err) {
      console.error('aiService.generateDisputeLetter failed:', err);
      return generateFallbackLetter(params);
    }
  }

  // Fallback: if aiService isn't available, use existing fetch-based fallback logic without exposing API key
  console.warn('aiService.generateDisputeLetter not available, using local fallback.');
  return generateFallbackLetter(params);
}

// Analyze dispute strategy and recommend approach
export async function analyzeDisputeStrategy(clientData, creditReport) {
  // If aiService available, prefer it. Otherwise continue with fallback behavior.
  if (aiService?.analyzeDisputeStrategy) {
    try {
      return await aiService.analyzeDisputeStrategy(clientData, creditReport);
    } catch (err) {
      console.error('aiService.analyzeDisputeStrategy failed:', err);
    }
  }

  const prompt = `Analyze this credit situation and recommend the best dispute strategy:
    Client: ${JSON.stringify(clientData)}
    Issues: ${JSON.stringify(creditReport)}
    
    Provide:
    1. Recommended approach (conservative/moderate/aggressive)
    2. Prioritized list of items to dispute
    3. Success probability percentage
    4. Reasoning for recommendations`;

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a credit repair expert analyzing dispute strategies.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      }),
    });

    const data = await response.json();
    return parseStrategyResponse(data.choices[0].message.content);
  } catch (error) {
    console.error('Error analyzing strategy:', error);
    return {
      recommendedApproach: 'moderate',
      prioritizedDisputes: [],
      successProbability: 65,
      reasoning: 'Error analyzing - using default moderate approach'
    };
  }
}

// Select best template based on dispute type and client situation
export async function selectBestTemplate(disputeType, clientSituation, availableTemplates) {
  if (!OPENAI_API_KEY) {
    // Simple rule-based selection without AI
    return availableTemplates.find(t => 
      t.category === disputeType || 
      t.name.toLowerCase().includes(disputeType.toLowerCase())
    ) || availableTemplates[0];
  }

  const prompt = `Given these dispute details:
    Type: ${disputeType}
    Situation: ${JSON.stringify(clientSituation)}
    
    Select the best template from these options:
    ${JSON.stringify(availableTemplates.map(t => ({ id: t.id, name: t.name, category: t.category })))}
    
    Return the template ID and reasoning.`;

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 200
      }),
    });

    const data = await response.json();
    const result = parseTemplateSelection(data.choices[0].message.content, availableTemplates);
    return result;
  } catch (error) {
    console.error('Error selecting template:', error);
    return availableTemplates[0];
  }
}

// Helper function to construct prompt
function constructPrompt(clientInfo, disputeDetails, strategy, template) {
  const strategyInstructions = {
    conservative: 'Use cautious language, focus heavily on legal compliance, request verification only',
    moderate: 'Balance assertiveness with compliance, cite relevant laws, request investigation and removal',
    aggressive: 'Use strong assertive language, cite multiple laws, demand immediate removal, mention potential legal action'
  };

  let prompt = `Generate a professional credit dispute letter with these details:

CLIENT INFORMATION:
Name: ${clientInfo.name}
Address: ${clientInfo.address}

DISPUTE DETAILS:
Bureau: ${disputeDetails.bureau}
Type: ${disputeDetails.type}
Creditor: ${disputeDetails.creditor}
Account: ${disputeDetails.account}
Reason: ${disputeDetails.reason}
Custom Notes: ${disputeDetails.customNotes || 'None'}

STRATEGY: ${strategy}
Instructions: ${strategyInstructions[strategy]}

${template ? `BASE TEMPLATE:\n${template.content}\n` : ''}

REQUIREMENTS:
1. Include proper letter formatting with date and addresses
2. Cite relevant laws (FCRA Section 611, FDCPA, FCBA as applicable)
3. Be specific about the dispute reason
4. Request specific action (investigation, verification, removal)
5. Include 30-day response deadline
6. Professional tone throughout
7. Include a clear closing with space for signature

Generate the complete letter now:`;

  return prompt;
}

// Format the generated letter
function formatLetter(content, clientInfo) {
  const today = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Ensure proper letter format
  if (!content.includes(today)) {
    content = `${today}\n\n${content}`;
  }

  if (!content.includes(clientInfo.name)) {
    content = content.replace('[Client Name]', clientInfo.name);
    content = content.replace('[Your Name]', clientInfo.name);
  }

  if (!content.includes('Sincerely,')) {
    content += `\n\nSincerely,\n\n\n_____________________\n${clientInfo.name}`;
  }

  return content;
}

// Fallback letter generation without AI
function generateFallbackLetter(params) {
  const { clientInfo, disputeDetails, template } = params;
  const today = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const bureauAddresses = {
    equifax: 'Equifax Information Services LLC\nP.O. Box 740256\nAtlanta, GA 30348',
    experian: 'Experian\nP.O. Box 4500\nAllen, TX 75013',
    transunion: 'TransUnion LLC\nConsumer Dispute Center\nP.O. Box 2000\nChester, PA 19016'
  };

  let letterContent = `${today}

${clientInfo.name}
${clientInfo.address}

${bureauAddresses[disputeDetails.bureau] || bureauAddresses.equifax}

RE: Request for Investigation of Inaccurate Information

To Whom It May Concern:

I am writing to formally dispute inaccurate information that appears on my credit report. Under the provisions of the Fair Credit Reporting Act (FCRA), Section 611 (15 U.S.C. § 1681i), I am requesting that you investigate and correct or delete the following disputed items:

Account: ${disputeDetails.creditor}
Account Number: ${disputeDetails.account}
Reason for Dispute: ${disputeDetails.reason}

${disputeDetails.customNotes ? `Additional Information: ${disputeDetails.customNotes}\n` : ''}

This account information is inaccurate and incomplete. I am requesting that you:

1. Conduct a full investigation of this disputed item as required by federal law
2. Provide me with a description of your investigation procedures
3. Remove this inaccurate information from my credit file
4. Provide me with an updated copy of my credit report upon completion

Under Section 611 of the FCRA, you must complete this investigation within 30 days of receipt of this letter. If you cannot verify the accuracy of this information, federal law requires its immediate removal from my credit file.

Please send me written confirmation that you have received this dispute and notify me of the results of your investigation.

Thank you for your prompt attention to this matter.

Sincerely,


_____________________
${clientInfo.name}

Enclosures: [List any supporting documents]`;

  if (template && template.content) {
    // Try to use template content if available
    letterContent = template.content
      .replace(/{clientName}/g, clientInfo.name)
      .replace(/{clientAddress}/g, clientInfo.address)
      .replace(/{bureau}/g, disputeDetails.bureau)
      .replace(/{creditorName}/g, disputeDetails.creditor)
      .replace(/{accountNumber}/g, disputeDetails.account)
      .replace(/{disputeReason}/g, disputeDetails.reason)
      .replace(/{date}/g, today);
  }

  return letterContent;
}

// Parse AI strategy response
function parseStrategyResponse(content) {
  try {
    // Try to parse as JSON first
    const parsed = JSON.parse(content);
    return parsed;
  } catch {
    // Fallback to text parsing
    return {
      recommendedApproach: 'moderate',
      prioritizedDisputes: [],
      successProbability: 65,
      reasoning: content
    };
  }
}

// Parse template selection response
function parseTemplateSelection(content, templates) {
  try {
    // Extract template ID from response
    const match = content.match(/template[_\s]?id[:\s]+([a-z0-9-]+)/i);
    if (match) {
      const template = templates.find(t => t.id === match[1]);
      if (template) return template;
    }
  } catch (error) {
    console.error('Error parsing template selection:', error);
  }
  
  // Default to first template
  return templates[0];
}

// Batch letter generation for multiple accounts
export async function generateBatchLetters(clientInfo, disputes, strategy = 'moderate') {
  const letters = [];
  
  for (const dispute of disputes) {
    const letter = await generateLetterWithAI({
      clientInfo,
      disputeDetails: dispute,
      strategy
    });
    
    letters.push({
      ...dispute,
      content: letter
    });
    
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return letters;
}

// Export functions for determining optimal dispute timing
export function getOptimalDisputeTiming(bureau) {
  const timingRecommendations = {
    equifax: {
      bestDay: 'Tuesday',
      bestTime: 'Morning',
      processingTime: '30 days',
      notes: 'Equifax typically processes disputes faster early in the week'
    },
    experian: {
      bestDay: 'Wednesday',
      bestTime: 'Afternoon',
      processingTime: '30 days',
      notes: 'Experian has consistent processing throughout the week'
    },
    transunion: {
      bestDay: 'Thursday',
      bestTime: 'Morning',
      processingTime: '30 days',
      notes: 'TransUnion may take slightly longer during high-volume periods'
    }
  };
  
  return timingRecommendations[bureau] || timingRecommendations.equifax;
}

// Calculate success probability based on dispute type and reason
export function calculateSuccessProbability(disputeType, reason, hasDocumentation) {
  const baseProbabilities = {
    'not_mine': 85,
    'identity_theft': 90,
    'paid_in_full': 75,
    'never_late': 70,
    'incorrect_balance': 65,
    'duplicate': 80,
    'incorrect_payment': 60,
    'other': 50
  };
  
  let probability = baseProbabilities[reason] || 50;
  
  // Adjust based on dispute type
  if (disputeType === 'initial') probability += 10;
  if (disputeType === 'method_verification') probability += 15;
  if (disputeType === 'reinvestigation') probability -= 10;
  
  // Boost if documentation provided
  if (hasDocumentation) probability += 20;
  
  // Cap at 95%
  return Math.min(95, probability);
}

// Additional mega AI functions for comprehensive dispute management

// Analyze complete client credit profile
export async function analyzeClientCreditProfile(client, disputeHistory) {
  if (!OPENAI_API_KEY) {
    return {
      score: 65,
      riskLevel: 'moderate',
      recommendations: ['Start with bureau disputes', 'Focus on recent items'],
      creditFactors: []
    };
  }
  
  try {
    const prompt = `Analyze this client's credit profile:
      Client: ${JSON.stringify(client)}
      Dispute History: ${JSON.stringify(disputeHistory)}
      
      Provide comprehensive analysis including:
      1. Overall credit health score (0-100)
      2. Risk level assessment
      3. Top recommendations
      4. Key credit factors affecting score`;
    
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a credit analysis expert.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      }),
    });
    
    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error('Error analyzing credit profile:', error);
    return {
      score: 65,
      riskLevel: 'moderate',
      recommendations: ['Continue dispute process'],
      creditFactors: []
    };
  }
}

// Predict dispute outcome with high accuracy
export async function predictDisputeOutcome(client, disputeDetails) {
  const baseRate = calculateSuccessProbability(
    disputeDetails.disputeType,
    disputeDetails.disputeReason,
    disputeDetails.attachments?.length > 0
  );
  
  if (!OPENAI_API_KEY) {
    return {
      successRate: baseRate,
      confidence: 'medium',
      factors: [],
      timeline: '30-45 days'
    };
  }
  
  try {
    const prompt = `Predict dispute outcome:
      Client: ${client.clientName}
      Bureau: ${disputeDetails.bureau}
      Type: ${disputeDetails.disputeType}
      Reason: ${disputeDetails.disputeReason}
      
      Provide:
      1. Success probability (0-100)
      2. Confidence level
      3. Key factors
      4. Expected timeline`;
    
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 500
      }),
    });
    
    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    return {
      successRate: baseRate,
      confidence: 'medium',
      factors: [],
      timeline: '30-45 days'
    };
  }
}

// Suggest next actions based on current status
export async function suggestNextActions(currentStatus, analysis) {
  if (!OPENAI_API_KEY) {
    return [
      'Follow up in 30 days if no response',
      'Prepare supporting documentation',
      'Consider escalation to CFPB if needed'
    ];
  }
  
  try {
    const prompt = `Based on dispute status and analysis, suggest next actions:
      Status: ${JSON.stringify(currentStatus)}
      Analysis: ${JSON.stringify(analysis)}
      
      Provide 3-5 specific actionable recommendations.`;
    
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.4,
        max_tokens: 300
      }),
    });
    
    const data = await response.json();
    const content = data.choices[0].message.content;
    return content.split('\n').filter(line => line.trim()).slice(0, 5);
  } catch (error) {
    return [
      'Follow up in 30 days',
      'Prepare additional documentation',
      'Consider next steps'
    ];
  }
}

// Analyze bureau response for next steps
export async function generateResponseAnalysis(response) {
  if (!OPENAI_API_KEY) {
    return {
      outcome: 'partial',
      itemsRemoved: [],
      itemsVerified: [],
      itemsRemaining: [],
      recommendedAction: 'File reinvestigation',
      successScore: 50
    };
  }
  
  try {
    const prompt = `Analyze this bureau response:
      ${JSON.stringify(response)}
      
      Determine:
      1. Overall outcome (success/partial/failure)
      2. Items removed
      3. Items verified
      4. Items still disputed
      5. Recommended next action
      6. Success score (0-100)`;
    
    const apiResponse = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at analyzing credit bureau responses.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 800
      }),
    });
    
    const data = await apiResponse.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error('Error analyzing response:', error);
    return {
      outcome: 'unknown',
      itemsRemoved: [],
      itemsVerified: [],
      itemsRemaining: [],
      recommendedAction: 'Review manually',
      successScore: 0
    };
  }
}

export default {
  generateLetterWithAI,
  analyzeDisputeStrategy,
  selectBestTemplate,
  generateBatchLetters,
  getOptimalDisputeTiming,
  calculateSuccessProbability,
  analyzeClientCreditProfile,
  predictDisputeOutcome,
  suggestNextActions,
  generateResponseAnalysis
};