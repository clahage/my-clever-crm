// ================================================================================
// QUICK TEST SCRIPT FOR REAL PIPELINE AI SERVICE
// ================================================================================
// Run this to verify the AI service is working
// Usage: node testRealAI.js or run in browser console
// ================================================================================

const realPipelineAI = require('./RealPipelineAIService.js');

async function quickTest() {
  console.log('🧪 Testing Real Pipeline AI Service\n');
  console.log('='.repeat(60));

  // Test 1: Check configuration
  console.log('\n1️⃣  Configuration Check');
  console.log('-'.repeat(60));
  const isConfigured = realPipelineAI.isConfigured();
  console.log(`API Key Configured: ${isConfigured ? '✅ YES' : '❌ NO'}`);

  if (!isConfigured) {
    console.log('\n⚠️  OpenAI API key not found!');
    console.log('💡 To fix: Add VITE_OPENAI_API_KEY=your-key-here to .env file\n');
    return;
  }

  // Test 2: Health check
  console.log('\n2️⃣  Health Check');
  console.log('-'.repeat(60));
  try {
    const health = await realPipelineAI.healthCheck();
    console.log(`Status: ${health.status === 'healthy' ? '✅ HEALTHY' : '❌ ERROR'}`);
    console.log(`Message: ${health.message}`);
  } catch (error) {
    console.log(`❌ Health check failed: ${error.message}`);
    return;
  }

  // Test 3: Lead Scoring (Fast Test)
  console.log('\n3️⃣  Lead Scoring Test');
  console.log('-'.repeat(60));
  try {
    const testLead = {
      caller: 'Test User',
      phone: '+1-555-TEST-001',
      email: 'test@example.com',
      painPoints: ['Low credit score', 'Collections'],
      urgencyLevel: 'high',
      transcript: 'I need help with my credit immediately. I have collections and my score is 580.',
    };

    console.log('Analyzing test lead...');
    const scoring = await realPipelineAI.scoreLeadIntelligently(testLead);

    console.log(`\n✅ Lead Score: ${scoring.leadScore}/100`);
    console.log(`📊 Breakdown:`);
    console.log(`   - Qualification: ${scoring.scoreBreakdown.qualification}/25`);
    console.log(`   - Engagement: ${scoring.scoreBreakdown.engagement}/25`);
    console.log(`   - Urgency: ${scoring.scoreBreakdown.urgency}/25`);
    console.log(`   - Fit: ${scoring.scoreBreakdown.fit}/25`);
    console.log(`\n💭 Reasoning: ${scoring.reasoning}`);
    console.log(`\n🎯 Recommended Actions:`);
    scoring.recommendedActions.forEach((action, i) => {
      console.log(`   ${i + 1}. ${action}`);
    });
    console.log(`\n⏰ Estimated Close: ${scoring.estimatedCloseTime}`);
    console.log(`📈 Confidence: ${scoring.confidence}%`);
  } catch (error) {
    console.log(`❌ Lead scoring test failed: ${error.message}`);
    console.log(`   (Fallback scoring should still work)`);
  }

  // Test 4: Sentiment Analysis (Fast Test)
  console.log('\n4️⃣  Sentiment Analysis Test');
  console.log('-'.repeat(60));
  try {
    const testMessage = "I'm really excited to get started! Your team has been so helpful.";
    console.log(`Message: "${testMessage}"`);

    const sentiment = await realPipelineAI.analyzeSentiment(testMessage, { contactId: 'test_123' });

    console.log(`\n✅ Sentiment: ${sentiment.sentiment.toUpperCase()}`);
    console.log(`😊 Emotions: ${sentiment.emotions.join(', ')}`);
    console.log(`🎭 Tone: ${sentiment.tone}`);
    console.log(`📈 Confidence: ${sentiment.confidence}%`);
    console.log(`💡 Recommended Response: ${sentiment.recommendedResponse}`);
  } catch (error) {
    console.log(`❌ Sentiment analysis test failed: ${error.message}`);
  }

  // Test 5: Verify fallback works (without making API call)
  console.log('\n5️⃣  Fallback Logic Test');
  console.log('-'.repeat(60));
  const fallbackScore = realPipelineAI.fallbackLeadScore({
    email: 'test@example.com',
    phone: '+1-555-1234',
    painPoints: ['Collections'],
    urgencyLevel: 'high',
    budget: 150,
  });
  console.log(`✅ Fallback scoring works: ${fallbackScore.leadScore}/100`);
  console.log(`   (Used when AI is unavailable)`);

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('✅ ALL TESTS COMPLETE');
  console.log('='.repeat(60));
  console.log('\n📚 Next Steps:');
  console.log('   1. Review the examples file: RealPipelineAIService.examples.js');
  console.log('   2. Read the documentation: REAL_AI_SERVICE_README.md');
  console.log('   3. Integrate into your CRM components');
  console.log('\n💡 Cost Estimate: ~$0.01 for these tests');
  console.log('💡 Monthly costs typically $2-20 for normal use\n');
}

// Run the test
  quickTest().catch(error => {
    console.error('\n💥 Test failed with error:', error);
    console.error('\nStack trace:', error.stack);
  });
