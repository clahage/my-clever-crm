// ================================================================================
// QUICK TEST SCRIPT FOR REAL PIPELINE AI SERVICE (ES Module)
// ================================================================================
// Usage: node src/services/testRealAI.mjs
// ================================================================================

import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

// 1. SETUP ENVIRONMENT
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// specific path to your .env file
const envPath = resolve(__dirname, '../../.env');

console.log('--------------------------------------------------');
console.log(`📂 Looking for .env file at: ${envPath}`);

if (!fs.existsSync(envPath)) {
  console.error('❌ CRITICAL ERROR: .env file not found!');
  process.exit(1);
}

// Load the variables
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('❌ Error parsing .env file:', result.error);
} else {
  console.log('✅ .env file loaded successfully');
}

// Debug print (masked)
const key = process.env.VITE_FIREBASE_API_KEY;
console.log(`🔑 Firebase Key Status: ${key ? 'Found (' + key.slice(0, 4) + '...)' : 'MISSING'}`);
console.log('--------------------------------------------------\n');

// 2. DYNAMIC IMPORT (CRITICAL FIX)
// We import the service HERE, so it happens AFTER .env is loaded
console.log('🚀 Importing AI Service...');
const module = await import('./RealPipelineAIService.js');
const realPipelineAI = module.default || module;

async function quickTest() {
  console.log('\n🧪 Testing Real Pipeline AI Service');
  console.log('='.repeat(60));

  // Test 1: Configuration Check
  console.log('\n1️⃣  Configuration Check');
  console.log('-'.repeat(60));
  
  if (!realPipelineAI || typeof realPipelineAI.isConfigured !== 'function') {
    console.error("❌ Error: 'isConfigured' method not found.");
    return;
  }

  const isConfigured = realPipelineAI.isConfigured();
  console.log(`API Key Configured: ${isConfigured ? '✅ YES' : '❌ NO'}`);

  if (!isConfigured) {
    console.log('\n⚠️  OpenAI API key not found in Service!');
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
  }

  // Test 3: Lead Scoring
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
    console.log(`💭 Reasoning: ${scoring.reasoning}`);
  } catch (error) {
    console.log(`❌ Lead scoring test failed: ${error.message}`);
  }

  // Test 4: Sentiment Analysis
  console.log('\n4️⃣  Sentiment Analysis Test');
  console.log('-'.repeat(60));
  try {
    const testMessage = "I'm really excited to get started! Your team has been so helpful.";
    const sentiment = await realPipelineAI.analyzeSentiment(testMessage, { contactId: 'test_123' });

    console.log(`\n✅ Sentiment: ${sentiment.sentiment ? sentiment.sentiment.toUpperCase() : 'UNKNOWN'}`);
    console.log(`📈 Confidence: ${sentiment.confidence}%`);
  } catch (error) {
    console.log(`❌ Sentiment analysis test failed: ${error.message}`);
  }

  // Test 5: Fallback Logic
  console.log('\n5️⃣  Fallback Logic Test');
  console.log('-'.repeat(60));
  try {
    const fallbackScore = realPipelineAI.fallbackLeadScore({
      email: 'test@example.com',
      painPoints: ['Collections'],
      urgencyLevel: 'high',
      budget: 150,
    });
    console.log(`✅ Fallback scoring works: ${fallbackScore.leadScore}/100`);
  } catch (e) {
    console.log(`❌ Fallback test error: ${e.message}`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ TEST SEQUENCE COMPLETE');
  console.log('='.repeat(60));
}

// Run the test
quickTest().catch(error => {
  console.error('\n💥 Test script crashed:', error);
});