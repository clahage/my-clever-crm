// utils/leadManagement.js
// Complete Enhanced Lead Management System

export const LEAD_TEMPERATURES = {
  BLAZING: {
    value: 'blazing',
    label: '🔥 Blazing',
    score: [9, 10],
    color: 'bg-red-600 text-white',
    borderColor: 'border-red-600',
    description: 'Ready to buy NOW - urgent need',
    actionRequired: 'Contact within 1 hour',
    priority: 1
  },
  HOT: {
    value: 'hot',
    label: '🌡️ Hot',
    score: [7, 8],
    color: 'bg-orange-500 text-white',
    borderColor: 'border-orange-500',
    description: 'High interest, timeline < 1 week',
    actionRequired: 'Contact within 4 hours',
    priority: 2
  },
  WARM: {
    value: 'warm',
    label: '☀️ Warm',
    score: [5, 6],
    color: 'bg-yellow-500 text-white',
    borderColor: 'border-yellow-500',
    description: 'Interested, timeline 1-4 weeks',
    actionRequired: 'Contact within 24 hours',
    priority: 3
  },
  LUKEWARM: {
    value: 'lukewarm',
    label: '🌤️ Lukewarm',
    score: [3, 4],
    color: 'bg-blue-400 text-white',
    borderColor: 'border-blue-400',
    description: 'Some interest, timeline 1-3 months',
    actionRequired: 'Contact within 3 days',
    priority: 4
  },
  COOL: {
    value: 'cool',
    label: '❄️ Cool',
    score: [1, 2],
    color: 'bg-blue-200 text-gray-800',
    borderColor: 'border-blue-200',
    description: 'Low interest, needs nurturing',
    actionRequired: 'Add to drip campaign',
    priority: 5
  },
  FROZEN: {
    value: 'frozen',
    label: '🧊 Frozen',
    score: [0, 0],
    color: 'bg-gray-400 text-white',
    borderColor: 'border-gray-400',
    description: 'No current interest',
    actionRequired: 'Long-term nurture or archive',
    priority: 6
  }
};

// Determine temperature based on multiple factors
export function calculateLeadTemperature(data) {
  const {
    leadScore = 0,
    urgencyLevel = 'low',
    conversionProbability = 0,
    lastContactDate,
    totalInteractions = 0,
    painPoints = [],
    sentiment = {}
  } = data;

  // Base score from AI
  let finalScore = leadScore;

  // Urgency modifier
  if (urgencyLevel === 'high' || urgencyLevel === 'hot') finalScore += 1;
  if (urgencyLevel === 'critical') finalScore += 2;

  // Conversion probability modifier
  if (conversionProbability >= 80) finalScore += 1;
  if (conversionProbability <= 20) finalScore -= 1;

  // Pain points modifier
  if (painPoints.length >= 3) finalScore += 1;

  // Sentiment modifier
  if (sentiment.score >= 0.8) finalScore += 1;
  if (sentiment.score <= 0.2) finalScore -= 1;

  // Time decay - reduce score if no recent contact
  if (lastContactDate) {
    const daysSinceContact = Math.floor((Date.now() - lastContactDate.toDate()) / (1000 * 60 * 60 * 24));
    if (daysSinceContact > 30) finalScore -= 2;
    else if (daysSinceContact > 14) finalScore -= 1;
  }

  // Ensure score stays within bounds
  finalScore = Math.max(0, Math.min(10, finalScore));

  // Find matching temperature
  for (const temp of Object.values(LEAD_TEMPERATURES)) {
    if (finalScore >= temp.score[0] && finalScore <= temp.score[1]) {
      return temp.value;
    }
  }

  return 'lukewarm'; // default
}

// Categorize call quality
export function categorizeCallQuality(call) {
  const {
    callerName,
    phone,
    email,
    transcript = '',
    summary = '',
    duration = 0,
    painPoints = []
  } = call;

  // Check for spam/robocall indicators
  const spamIndicators = [
    'warranty', 'insurance quote', 'credit card', 'IRS', 'social security',
    'Microsoft support', 'Amazon security', 'refund', 'virus detected'
  ].some(term => 
    transcript.toLowerCase().includes(term) || 
    summary.toLowerCase().includes(term)
  );

  // Check for vendor/sales indicators
  const vendorIndicators = [
    'we offer', 'special promotion', 'limited time', 'discount for you',
    'calling to offer', 'services for your business'
  ].some(term => 
    transcript.toLowerCase().includes(term) || 
    summary.toLowerCase().includes(term)
  );

  // Check completeness
  const hasName = callerName && callerName !== 'Unknown' && callerName.length > 2;
  const hasPhone = phone && phone.length >= 10;
  const hasEmail = email && email.includes('@');
  const hasSubstance = duration > 30 && (transcript.length > 100 || summary.length > 50);
  const hasPainPoints = painPoints.length > 0;

  // Scoring
  let qualityScore = 0;
  let category = 'unknown';
  let action = 'review';

  if (spamIndicators) {
    category = 'spam';
    action = 'block';
    qualityScore = -1;
  } else if (vendorIndicators) {
    category = 'vendor';
    action = 'archive';
    qualityScore = 0;
  } else if (hasName && (hasPhone || hasEmail) && hasSubstance) {
    category = 'legitimate';
    action = 'convert';
    qualityScore = 10;
  } else if (hasSubstance && hasPainPoints) {
    category = 'partial';
    action = 'followup';
    qualityScore = 5;
  } else if (duration < 15) {
    category = 'hangup';
    action = 'delete';
    qualityScore = 0;
  } else {
    category = 'incomplete';
    action = 'review';
    qualityScore = 3;
  }

  return {
    category,
    action,
    qualityScore,
    isComplete: hasName && hasPhone && hasEmail,
    missingFields: {
      name: !hasName,
      phone: !hasPhone,
      email: !hasEmail
    },
    recommendation: getRecommendation(category, action)
  };
}

function getRecommendation(category, action) {
  const recommendations = {
    spam: '🚫 Block this number in AI receptionist. Delete from system.',
    vendor: '📁 Archive for future reference. May be useful later.',
    legitimate: '✅ Convert to lead immediately. High quality prospect.',
    partial: '📞 Follow up to gather missing information.',
    hangup: '🗑️ Delete unless pattern emerges from same number.',
    incomplete: '👀 Manual review needed. Could be valuable or junk.',
    unknown: '❓ Requires human review to categorize.'
  };
  
  return recommendations[category] || recommendations.unknown;
}

// Drip campaign assignment
export function assignDripCampaign(lead) {
  const temperature = lead.temperature || lead.status;
  const campaigns = {
    blazing: null, // No drip - needs immediate human contact
    hot: null, // No drip - needs immediate human contact
    warm: 'short_nurture', // 7-day engagement series
    lukewarm: 'standard_nurture', // 30-day education series
    cool: 'long_nurture', // 90-day value series
    frozen: 'reactivation' // Quarterly check-ins
  };
  
  return campaigns[temperature];
}

// Lead routing logic
export function routeLead(lead) {
  const temperature = lead.temperature || lead.status;
  const routing = {
    blazing: {
      assignTo: 'senior_sales',
      notification: 'immediate',
      method: ['sms', 'email', 'slack']
    },
    hot: {
      assignTo: 'sales_team',
      notification: 'urgent',
      method: ['email', 'slack']
    },
    warm: {
      assignTo: 'sales_team',
      notification: 'normal',
      method: ['email']
    },
    lukewarm: {
      assignTo: 'junior_sales',
      notification: 'daily_digest',
      method: ['email']
    },
    cool: {
      assignTo: 'marketing',
      notification: 'weekly_digest',
      method: ['email']
    },
    frozen: {
      assignTo: 'marketing',
      notification: 'none',
      method: []
    }
  };
  
  return routing[temperature] || routing.lukewarm;
}

// Export all utilities
export default {
  LEAD_TEMPERATURES,
  calculateLeadTemperature,
  categorizeCallQuality,
  assignDripCampaign,
  routeLead
};