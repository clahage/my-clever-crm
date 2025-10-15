// functions/automation/leadProcessor.js
// AI-powered lead classification with 4-tier temperature system
// Extracts contact info and scores leads automatically

const admin = require('firebase-admin');

/**
 * Classify lead based on AI Receptionist call data
 * Returns contact object ready to save to Firestore
 */
exports.classifyLead = async (callData) => {
  try {
    // Extract contact information
    const { firstName, lastName } = extractName(callData.transcript, callData.username);
    const email = extractEmail(callData.transcript);
    const phone = cleanPhoneNumber(callData.caller);

    // Calculate lead score
    const score = await calculateLeadScore(callData, firstName, email);

    // Determine temperature (4 tiers)
    let temperature = 'cold';
    if (score >= 95) temperature = 'erupting';
    else if (score >= 80) temperature = 'hot';
    else if (score >= 60) temperature = 'warm';

    // Determine priority
    let priority = 'medium';
    if (temperature === 'erupting') priority = 'urgent';
    else if (temperature === 'hot') priority = 'high';
    else if (temperature === 'warm') priority = 'medium';
    else priority = 'low';

    // Build contact object
    const contact = {
      // Basic Info
      firstName: firstName || 'Unknown',
      lastName: lastName || 'Caller',
      preferredName: firstName || '',
      
      // Contact Info
      email: email || '',
      phone: phone,
      phoneType: 'mobile',
      preferredContact: email ? 'email' : 'phone',
      
      // Roles (multi-role support)
      roles: ['contact', 'lead'],
      primaryRole: 'lead',
      
      // Status
      contactType: 'lead',
      status: 'new',
      
      // AI Scoring
      leadScore: score,
      temperature: temperature,
      engagementLevel: temperature,
      conversionProbability: Math.min(100, score),
      
      // AI Analysis
      aiObservations: callData.summary || 'No summary available',
      aiRecommendations: generateRecommendations(temperature, score, callData),
      
      // Sentiment
      sentiment: callData.sentiment || { positive: 0, neutral: 100, negative: 0 },
      
      // Source Tracking
      source: 'ai-receptionist',
      referralSource: 'phone-call',
      
      // Dates
      initialContactDate: callData.timestamp || new Date().toISOString(),
      lastContactDate: callData.timestamp || new Date().toISOString(),
      
      // Call Details
      callDuration: parseInt(callData.duration) || 0,
      callTranscript: callData.transcript || '',
      callInfoLink: callData.call_info_link || '',
      
      // Priority
      priority: priority,
      
      // Notes
      notes: buildNotesFromCall(callData),
      
      // Metadata
      createdBy: 'ai-receptionist-webhook',
      lastModifiedBy: 'ai-receptionist-webhook'
    };

    return contact;

  } catch (error) {
    console.error('Error classifying lead:', error);
    throw error;
  }
};

/**
 * Detect spam/bot callers
 * Returns true if call should be blocked
 */
exports.detectSpam = async (callData) => {
  try {
    const transcript = (callData.transcript || '').toLowerCase();
    const duration = parseInt(callData.duration) || 0;
    const username = (callData.username || '').toLowerCase();

    // Spam indicators
    const spamKeywords = [
      'extended warranty',
      'car warranty',
      'final notice',
      'irs',
      'lawsuit',
      'legal action',
      'social security',
      'medicare',
      'health insurance',
      'reduce your debt',
      'student loan forgiveness',
      'press 1',
      'this is not a sales call'
    ];

    // Check for spam keywords
    for (const keyword of spamKeywords) {
      if (transcript.includes(keyword)) {
        console.log('🚫 Spam keyword detected:', keyword);
        return true;
      }
    }

    // Very short calls (hung up on greeting)
    if (duration < 10) {
      console.log('🚫 Very short call:', duration, 'seconds');
      return true;
    }

    // Caller ID indicates spam
    if (username.includes('spam') || username.includes('scam') || username.includes('telemarketer')) {
      console.log('🚫 Spam caller ID:', username);
      return true;
    }

    // No engagement (assistant talked, user silent)
    const userMessages = (transcript.match(/user@/g) || []).length;
    if (userMessages === 0 && duration > 15) {
      console.log('🚫 No user engagement');
      return true;
    }

    return false;

  } catch (error) {
    console.error('Error detecting spam:', error);
    return false; // Don't block on error
  }
};

/**
 * Extract name from transcript or username
 */
function extractName(transcript, username) {
  try {
    const text = transcript || '';
    
    // Look for "My name is..." or "I'm..." or "This is..."
    const patterns = [
      /(?:name is|i'm|this is|call me)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
      /user@\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const fullName = match[1].trim();
        
        // Filter out common false positives
        const ignore = ['unknown', 'caller', 'user', 'customer', 'client'];
        if (ignore.some(word => fullName.toLowerCase().includes(word))) {
          continue;
        }

        const parts = fullName.split(' ').filter(p => p.length > 0);
        
        if (parts.length >= 2) {
          return {
            firstName: parts[0],
            lastName: parts.slice(1).join(' ')
          };
        } else if (parts.length === 1) {
          return {
            firstName: parts[0],
            lastName: ''
          };
        }
      }
    }

    // Fallback to username if not "Clahage" (that's Chris)
    if (username && username !== 'Clahage' && username.length > 2) {
      const parts = username.split(' ').filter(p => p.length > 0);
      if (parts.length >= 2) {
        return {
          firstName: parts[0],
          lastName: parts.slice(1).join(' ')
        };
      } else if (parts.length === 1) {
        return {
          firstName: parts[0],
          lastName: ''
        };
      }
    }

    // No name found
    return { firstName: '', lastName: '' };

  } catch (error) {
    console.error('Error extracting name:', error);
    return { firstName: '', lastName: '' };
  }
}

/**
 * Extract email from transcript
 */
function extractEmail(transcript) {
  try {
    const text = transcript || '';
    
    // Email pattern
    const emailPattern = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/;
    const match = text.match(emailPattern);
    
    return match ? match[1] : '';

  } catch (error) {
    console.error('Error extracting email:', error);
    return '';
  }
}

/**
 * Clean and format phone number
 */
function cleanPhoneNumber(phone) {
  if (!phone) return '';
  
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // Ensure it starts with country code
  if (digits.length === 10) {
    return '+1' + digits; // Add US country code
  } else if (digits.length === 11 && digits.startsWith('1')) {
    return '+' + digits;
  }
  
  return phone; // Return as-is if format unclear
}

/**
 * Calculate lead score (0-100)
 */
async function calculateLeadScore(callData, firstName, email) {
  let score = 30; // Base score for calling

  // Name provided (+20 points)
  if (firstName && firstName !== 'Unknown') {
    score += 20;
  }

  // Email provided (+25 points)
  if (email) {
    score += 25;
  }

  // Call duration (longer = more interested)
  const duration = parseInt(callData.duration) || 0;
  if (duration > 120) score += 15; // 2+ minutes
  else if (duration > 60) score += 10; // 1+ minute
  else if (duration > 30) score += 5; // 30+ seconds

  // Sentiment analysis
  const sentiment = callData.sentiment || {};
  if (sentiment.positive > 60) score += 15;
  else if (sentiment.positive > 40) score += 10;
  else if (sentiment.negative > 40) score -= 10;

  // Specific credit repair keywords in transcript
  const transcript = (callData.transcript || '').toLowerCase();
  const goodKeywords = [
    'credit score',
    'bankruptcy',
    'collections',
    'dispute',
    'credit report',
    'ready to start',
    'when can we begin',
    'how much',
    'pricing',
    'sign up'
  ];

  let keywordMatches = 0;
  for (const keyword of goodKeywords) {
    if (transcript.includes(keyword)) {
      keywordMatches++;
    }
  }
  score += keywordMatches * 5; // 5 points per keyword

  // Cap at 100
  return Math.min(100, Math.max(0, score));
}

/**
 * Generate AI recommendations based on temperature and score
 */
function generateRecommendations(temperature, score, callData) {
  const recommendations = [];

  if (temperature === 'erupting') {
    recommendations.push('🔥 URGENT: Call within 1 hour - prospect is ready to sign');
    recommendations.push('📧 Send immediate follow-up email with next steps');
    recommendations.push('📄 Have service agreement ready to send');
  } else if (temperature === 'hot') {
    recommendations.push('📞 Call today - high conversion probability');
    recommendations.push('📧 Send information packet and success stories');
    recommendations.push('📅 Schedule consultation call');
  } else if (temperature === 'warm') {
    recommendations.push('📧 Add to email nurture campaign');
    recommendations.push('📞 Follow up call within 3-5 days');
    recommendations.push('📱 Send text with free credit report offer');
  } else {
    recommendations.push('📋 Add to low-priority follow-up queue');
    recommendations.push('🤖 Include in automated drip campaign');
    recommendations.push('👀 Review if prospect reaches out again');
  }

  return recommendations.join('\n');
}

/**
 * Build notes from call data
 */
function buildNotesFromCall(callData) {
  const lines = [];
  
  lines.push('📞 AI RECEPTIONIST CALL');
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push('');
  lines.push(`📅 Date: ${callData.timestamp || 'Unknown'}`);
  lines.push(`⏱️ Duration: ${callData.duration || 'Unknown'} seconds`);
  lines.push(`📱 Phone: ${callData.caller || 'Unknown'}`);
  lines.push('');
  
  if (callData.summary) {
    lines.push('📝 SUMMARY:');
    lines.push(callData.summary);
    lines.push('');
  }

  if (callData.sentiment) {
    lines.push('💭 SENTIMENT:');
    lines.push(`  Positive: ${callData.sentiment.positive || 0}%`);
    lines.push(`  Neutral: ${callData.sentiment.neutral || 0}%`);
    lines.push(`  Negative: ${callData.sentiment.negative || 0}%`);
    lines.push('');
  }

  if (callData.transcript) {
    lines.push('📄 FULL TRANSCRIPT:');
    lines.push(callData.transcript);
  }

  return lines.join('\n');
}