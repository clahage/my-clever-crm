// ================================================================================
// REAL PIPELINE AI SERVICE - USAGE EXAMPLES
// ================================================================================
// This file demonstrates how to use the Real Pipeline AI Service
// All examples are production-ready and tested
// ================================================================================

import realPipelineAI from './RealPipelineAIService';

// ================================================================================
// EXAMPLE 1: INTELLIGENT LEAD SCORING
// ================================================================================

export async function exampleLeadScoring() {
  console.log('=== EXAMPLE 1: AI Lead Scoring ===\n');

  const leadData = {
    caller: 'John Smith',
    phone: '+1-888-724-7344',
    email: 'john.smith@email.com',
    companyName: 'Self',
    jobTitle: 'Software Engineer',
    painPoints: [
      'Collections on credit report',
      'Denied for mortgage',
      'Credit score 580',
    ],
    budget: 150,
    timeline: 'ASAP',
    urgencyLevel: 'high',
    transcript: `
      Agent: Thank you for calling. How can I help you today?
      Caller: I really need help with my credit. I was just denied for a mortgage and I'm devastated.
      Agent: I'm sorry to hear that. Can you tell me more about your situation?
      Caller: Well, I have some collections from a few years ago, and my score is around 580.
              I need to close on a house in 3 months. Can you help me fast?
      Agent: Absolutely. We specialize in rapid credit repair. What's your budget?
      Caller: I can afford around $150 per month if it really works.
      Agent: That's perfect for our standard plan. Let me get some more details...
    `,
  };

  try {
    const scoring = await realPipelineAI.scoreLeadIntelligently(leadData);

    console.log('Lead Score:', scoring.leadScore, '/100');
    console.log('\nScore Breakdown:');
    console.log('  - Qualification:', scoring.scoreBreakdown.qualification, '/25');
    console.log('  - Engagement:', scoring.scoreBreakdown.engagement, '/25');
    console.log('  - Urgency:', scoring.scoreBreakdown.urgency, '/25');
    console.log('  - Fit:', scoring.scoreBreakdown.fit, '/25');

    console.log('\nReasoning:', scoring.reasoning);
    console.log('\nStrong Signals:', scoring.strongSignals.join(', '));
    console.log('Concerns:', scoring.concerns.join(', '));
    console.log('\nRecommended Actions:');
    scoring.recommendedActions.forEach((action, i) => {
      console.log(`  ${i + 1}. ${action}`);
    });
    console.log('\nEstimated Close Time:', scoring.estimatedCloseTime);
    console.log('Confidence:', scoring.confidence, '%');

    return scoring;
  } catch (error) {
    console.error('Error in lead scoring:', error.message);
    return null;
  }
}

// ================================================================================
// EXAMPLE 2: SENTIMENT ANALYSIS
// ================================================================================

export async function exampleSentimentAnalysis() {
  console.log('\n=== EXAMPLE 2: Sentiment Analysis ===\n');

  const conversations = [
    {
      text: 'I am so excited to get started! Your team has been incredibly helpful and I feel confident about improving my credit.',
      context: { contactId: 'contact_123', stage: 'onboarding' },
    },
    {
      text: 'I\'ve been waiting 3 weeks and haven\'t seen any updates. This is really frustrating and I\'m starting to think this was a waste of money.',
      context: { contactId: 'contact_456', stage: 'active' },
    },
    {
      text: 'Thanks for the update. I have a few questions about the process before we move forward.',
      context: { contactId: 'contact_789', stage: 'evaluation' },
    },
  ];

  for (const conv of conversations) {
    try {
      const analysis = await realPipelineAI.analyzeSentiment(conv.text, conv.context);

      console.log('Text:', conv.text.substring(0, 80) + '...');
      console.log('Sentiment:', analysis.sentiment);
      console.log('Confidence:', analysis.confidence, '%');
      console.log('Tone:', analysis.tone);
      console.log('Emotions:', analysis.emotions.join(', '));
      console.log('Recommended Response:', analysis.recommendedResponse);
      if (analysis.concerns.length > 0) {
        console.log('⚠️  Concerns:', analysis.concerns.join(', '));
      }
      console.log('---\n');
    } catch (error) {
      console.error('Error in sentiment analysis:', error.message);
    }
  }
}

// ================================================================================
// EXAMPLE 3: NEXT BEST ACTION
// ================================================================================

export async function exampleNextBestAction() {
  console.log('=== EXAMPLE 3: Next Best Action Recommendation ===\n');

  const contact = {
    id: 'contact_123',
    name: 'Sarah Johnson',
    status: 'active',
    stage: 'evaluation',
    leadScore: 8.5,
    lastContact: {
      toDate: () => new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    },
    completedActions: ['initial_call', 'sent_pricing'],
    painPoints: ['low credit score', 'collections'],
    budget: 200,
  };

  const recentInteractions = [
    { type: 'call', summary: 'Discussed pricing and services', date: '2024-11-26' },
    { type: 'email', summary: 'Sent pricing proposal', date: '2024-11-27' },
    { type: 'email_opened', summary: 'Client opened pricing email', date: '2024-11-28' },
  ];

  try {
    const recommendation = await realPipelineAI.suggestNextAction(contact, recentInteractions);

    console.log('Recommended Action:', recommendation.action);
    console.log('Priority:', recommendation.priority.toUpperCase());
    console.log('Timing:', recommendation.timing);
    console.log('Channel:', recommendation.channel);
    console.log('\nReasoning:', recommendation.reasoning);
    console.log('\nDraft Message:');
    console.log('---');
    console.log(recommendation.messageTemplate);
    console.log('---');
    console.log('\nExpected Outcome:', recommendation.expectedOutcome);
    console.log('\nAlternative Actions:');
    recommendation.alternatives.forEach((alt, i) => {
      console.log(`  ${i + 1}. ${alt}`);
    });

    return recommendation;
  } catch (error) {
    console.error('Error in next action suggestion:', error.message);
    return null;
  }
}

// ================================================================================
// EXAMPLE 4: CONVERSATION INTELLIGENCE
// ================================================================================

export async function exampleConversationAnalysis() {
  console.log('\n=== EXAMPLE 4: Conversation Intelligence ===\n');

  const transcript = `
Sales Rep: Hi Michael, thanks for taking my call. I understand you're interested in credit repair?

Michael: Yes, I spoke with someone last week. I'm comparing a few different companies right now.

Sales Rep: That's smart to do your research. What's most important to you in choosing a provider?

Michael: Honestly, I need results fast. My wife and I are trying to buy a house in the next 90 days.
We were pre-approved but then they saw some collections on my report.

Sales Rep: I completely understand the urgency. How much are those collections affecting your score?

Michael: My score dropped from 680 to 610 because of three collections totaling about $2,500.
If I can get back above 650, the lender said we'd be good to go.

Sales Rep: That's very achievable in your timeframe. We have a 90-day rapid results program specifically
for situations like yours. What's your budget for this?

Michael: I saw your competitor charges $99 per month. What do you charge?

Sales Rep: Our program is $149 monthly, but it includes direct bureau challenges, creditor negotiations,
and a score improvement guarantee. We also have a dedicated case manager.

Michael: Interesting. Let me talk to my wife tonight and I'll get back to you tomorrow.

Sales Rep: Perfect. I'll send over our program details and some case studies. What time works best tomorrow?

Michael: Call me around 2pm.
  `;

  const metadata = {
    contactId: 'contact_999',
    repName: 'Sales Rep',
    duration: '12:30',
    date: '2024-12-01',
  };

  try {
    const analysis = await realPipelineAI.analyzeConversation(transcript, metadata);

    console.log('Summary:', analysis.summary);
    console.log('\n📌 Pain Points:');
    analysis.painPoints.forEach(point => console.log(`  - ${point}`));

    console.log('\n⚠️  Objections:');
    analysis.objections.forEach(obj => console.log(`  - ${obj}`));

    console.log('\n✅ Buying Signals:');
    analysis.buyingSignals.forEach(signal => console.log(`  - ${signal}`));

    console.log('\n❓ Questions Asked by Prospect:');
    analysis.questionsAsked.forEach(q => console.log(`  - ${q}`));

    console.log('\n📋 Next Steps:');
    analysis.nextSteps.forEach(step => console.log(`  - ${step}`));

    console.log('\n💰 Budget:', analysis.budget);
    console.log('⏰ Timeline:', analysis.timeline);

    if (analysis.competitors?.length > 0) {
      console.log('\n🏢 Competitors Mentioned:', analysis.competitors.join(', '));
    }

    console.log('\n💡 Coaching Tips for Rep:');
    analysis.coachingTips.forEach(tip => console.log(`  - ${tip}`));

    return analysis;
  } catch (error) {
    console.error('Error in conversation analysis:', error.message);
    return null;
  }
}

// ================================================================================
// EXAMPLE 5: PREDICTIVE ANALYTICS
// ================================================================================

export async function examplePredictiveAnalytics() {
  console.log('\n=== EXAMPLE 5: Predictive Analytics ===\n');

  const contact = {
    id: 'contact_555',
    name: 'Emily Davis',
    leadScore: 7.5,
    engagementScore: 8,
    createdAt: {
      toDate: () => new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 21 days ago
    },
    lastContact: {
      toDate: () => new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    },
    responseRate: 85,
    status: 'lead',
    stage: 'evaluation',
  };

  const historicalData = [
    { type: 'call', outcome: 'connected' },
    { type: 'email', outcome: 'opened' },
    { type: 'call', outcome: 'connected' },
    { type: 'email', outcome: 'clicked' },
    { type: 'call', outcome: 'voicemail' },
    { type: 'email', outcome: 'replied' },
    { type: 'meeting', outcome: 'completed' },
  ];

  try {
    const prediction = await realPipelineAI.predictOutcomes(contact, historicalData);

    console.log('📊 Conversion Probability:', prediction.conversionProbability, '%');
    console.log('⚠️  Churn Risk:', prediction.churnRisk, '%');
    console.log('📅 Estimated Close Date:', prediction.estimatedCloseDate);
    console.log('💵 Projected Lifetime Value: $', prediction.projectedLifetimeValue);

    if (prediction.riskFactors.length > 0) {
      console.log('\n🚨 Risk Factors:');
      prediction.riskFactors.forEach(risk => console.log(`  - ${risk}`));
    }

    console.log('\n🎯 Growth Opportunities:');
    prediction.growthOpportunities.forEach(opp => console.log(`  - ${opp}`));

    console.log('\n💡 Recommended Interventions:');
    prediction.recommendedInterventions.forEach(int => console.log(`  - ${int}`));

    console.log('\n📈 Confidence:', prediction.confidence, '%');
    console.log('💭 Reasoning:', prediction.reasoning);

    return prediction;
  } catch (error) {
    console.error('Error in predictive analytics:', error.message);
    return null;
  }
}

// ================================================================================
// EXAMPLE 6: EMAIL GENERATION
// ================================================================================

export async function exampleEmailGeneration() {
  console.log('\n=== EXAMPLE 6: AI Email Generation ===\n');

  const contact = {
    id: 'contact_777',
    name: 'Robert Chen',
    leadScore: 9,
    stage: 'proposal',
    painPoints: ['Bankruptcy on record', 'Need mortgage approval', 'Timeline pressure'],
  };

  const emailTypes = [
    { purpose: 'follow-up after demo', context: { hadDemo: true, interested: true } },
    { purpose: 're-engagement', context: { daysSinceContact: 30 } },
    { purpose: 'proposal', context: { package: 'Premium', price: 299 } },
  ];

  for (const emailType of emailTypes) {
    try {
      console.log(`\n--- ${emailType.purpose.toUpperCase()} EMAIL ---\n`);

      const email = await realPipelineAI.generateEmail(
        contact,
        emailType.purpose,
        emailType.context
      );

      console.log('Subject:', email.subject);
      console.log('\nBody:');
      console.log('---');
      console.log(email.body);
      console.log('---');
      console.log('\nCall to Action:', email.callToAction);
      console.log('Tone:', email.tone);
      console.log('\nAlternative Subjects:');
      console.log('  A:', email.alternatives.subject2);
      console.log('  B:', email.alternatives.subject3);
      console.log('\n');
    } catch (error) {
      console.error('Error generating email:', error.message);
    }
  }
}

// ================================================================================
// EXAMPLE 7: OBJECTION HANDLING
// ================================================================================

export async function exampleObjectionHandling() {
  console.log('=== EXAMPLE 7: AI Objection Handling ===\n');

  const objections = [
    {
      objection: "Your price is too high. Your competitor charges half that.",
      context: { leadScore: 8, budget: null, concerns: ['price'] },
    },
    {
      objection: "I'm not sure credit repair actually works. Isn't it a scam?",
      context: { leadScore: 6, budget: null, concerns: ['trust', 'legitimacy'] },
    },
    {
      objection: "I need to think about it and talk to my spouse first.",
      context: { leadScore: 7.5, budget: 150, concerns: ['commitment'] },
    },
  ];

  for (const obj of objections) {
    try {
      console.log('Objection:', obj.objection);
      console.log('---');

      const response = await realPipelineAI.handleObjection(obj.objection, obj.context);

      console.log('Type:', response.objectionType);
      console.log('\nSuggested Response:');
      console.log(response.response);

      console.log('\nFollow-up Questions:');
      response.followUpQuestions.forEach((q, i) => console.log(`  ${i + 1}. ${q}`));

      console.log('\nProof Points to Use:');
      response.proofPoints.forEach((p, i) => console.log(`  ${i + 1}. ${p}`));

      if (response.alternativeOffers.length > 0) {
        console.log('\nAlternative Offers:');
        response.alternativeOffers.forEach((o, i) => console.log(`  ${i + 1}. ${o}`));
      }

      if (response.redFlags.length > 0) {
        console.log('\n⚠️  Red Flags:', response.redFlags.join(', '));
      }

      console.log('\n================\n');
    } catch (error) {
      console.error('Error handling objection:', error.message);
    }
  }
}

// ================================================================================
// EXAMPLE 8: BATCH OPERATIONS
// ================================================================================

export async function exampleBatchScoring() {
  console.log('=== EXAMPLE 8: Batch Lead Scoring ===\n');

  const leads = [
    {
      id: 'lead_1',
      caller: 'Alice Brown',
      phone: '+1-555-001-0001',
      painPoints: ['Low credit score'],
      urgencyLevel: 'low',
    },
    {
      id: 'lead_2',
      caller: 'Bob Wilson',
      phone: '+1-555-002-0002',
      painPoints: ['Collections', 'Foreclosure threat'],
      urgencyLevel: 'high',
      budget: 200,
    },
    {
      id: 'lead_3',
      caller: 'Carol Martinez',
      phone: '+1-555-003-0003',
      painPoints: ['Bankruptcy', 'Denied for car loan'],
      urgencyLevel: 'medium',
      timeline: '60 days',
    },
  ];

  try {
    console.log(`Scoring ${leads.length} leads...\n`);
    const results = await realPipelineAI.batchScoreLeads(leads);

    results.forEach((result, i) => {
      console.log(`Lead ${i + 1} (${result.leadId}):`);
      if (result.error) {
        console.log(`  ❌ Error: ${result.error}`);
      } else {
        console.log(`  ✅ Score: ${result.score.leadScore}/100`);
        console.log(`  Actions: ${result.score.recommendedActions.join(', ')}`);
      }
      console.log('');
    });

    return results;
  } catch (error) {
    console.error('Error in batch scoring:', error.message);
    return null;
  }
}

// ================================================================================
// EXAMPLE 9: HEALTH CHECK
// ================================================================================

export async function exampleHealthCheck() {
  console.log('=== EXAMPLE 9: Service Health Check ===\n');

  console.log('Checking AI service configuration...');
  console.log('API Key Configured:', realPipelineAI.isConfigured() ? '✅ Yes' : '❌ No');

  if (!realPipelineAI.isConfigured()) {
    console.log('\n⚠️  To use AI features, set VITE_OPENAI_API_KEY in your .env file');
    return;
  }

  try {
    const health = await realPipelineAI.healthCheck();
    console.log('\nStatus:', health.status === 'healthy' ? '✅ Healthy' : '❌ Error');
    console.log('Message:', health.message);

    if (health.status === 'healthy') {
      console.log('\n✅ AI Service is ready to use!');
    }
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
  }
}

// ================================================================================
// RUN ALL EXAMPLES
// ================================================================================

export async function runAllExamples() {
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║   REAL PIPELINE AI SERVICE - USAGE EXAMPLES          ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');

  await exampleHealthCheck();

  if (!realPipelineAI.isConfigured()) {
    console.log('\n⚠️  Skipping AI examples - API key not configured');
    return;
  }

  console.log('\n\n');
  await exampleLeadScoring();

  console.log('\n\n');
  await exampleSentimentAnalysis();

  console.log('\n\n');
  await exampleNextBestAction();

  console.log('\n\n');
  await exampleConversationAnalysis();

  console.log('\n\n');
  await examplePredictiveAnalytics();

  console.log('\n\n');
  await exampleEmailGeneration();

  console.log('\n\n');
  await exampleObjectionHandling();

  console.log('\n\n');
  await exampleBatchScoring();

  console.log('\n\n╔═══════════════════════════════════════════════════════╗');
  console.log('║   ALL EXAMPLES COMPLETED                              ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');
}

// Uncomment to run all examples:
// runAllExamples();
