/**
 * Client Experience Functions
 * Smart onboarding, AI communications, and client satisfaction
 */

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { defineSecret } = require('firebase-functions/params');

const openaiApiKey = defineSecret('OPENAI_API_KEY');

const ROLE_HIERARCHY = { admin: 4, manager: 3, user: 2, viewer: 1 };

// ============================================
// SMART CLIENT ONBOARDING
// ============================================

/**
 * Create onboarding session for new client
 */
exports.createOnboardingSession = onCall(
  { secrets: [openaiApiKey] },
  async (request) => {
    const db = getFirestore();
    const { clientId, clientName, clientEmail, clientPhone, creditGoals } = request.data;
    const userId = request.auth?.uid;

    if (!userId) throw new HttpsError('unauthenticated', 'Must be logged in');
    if (!clientId) throw new HttpsError('invalid-argument', 'Client ID required');

    // Create onboarding checklist based on goals
    const checklist = generateOnboardingChecklist(creditGoals || []);

    const session = {
      clientId,
      clientName,
      clientEmail,
      clientPhone,
      creditGoals: creditGoals || [],
      checklist,
      currentStep: 0,
      status: 'in_progress',
      createdBy: userId,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      completedAt: null,
      aiRecommendations: null,
      expectedTimeline: null
    };

    const docRef = await db.collection('onboardingSessions').add(session);

    // Generate AI recommendations based on goals
    const recommendations = await generateOnboardingRecommendations(
      creditGoals,
      openaiApiKey.value()
    );

    await docRef.update({
      aiRecommendations: recommendations.recommendations,
      expectedTimeline: recommendations.timeline
    });

    return {
      success: true,
      sessionId: docRef.id,
      checklist,
      recommendations: recommendations.recommendations,
      timeline: recommendations.timeline
    };
  }
);

function generateOnboardingChecklist(goals) {
  const baseChecklist = [
    { id: 'welcome', title: 'Welcome Call', description: 'Initial consultation and goal setting', required: true, completed: false },
    { id: 'agreement', title: 'Service Agreement', description: 'Sign credit repair service agreement', required: true, completed: false },
    { id: 'id_verification', title: 'ID Verification', description: 'Upload government-issued ID', required: true, completed: false },
    { id: 'ssn_verification', title: 'SSN Verification', description: 'Verify Social Security Number', required: true, completed: false },
    { id: 'credit_reports', title: 'Credit Reports', description: 'Obtain reports from all 3 bureaus', required: true, completed: false },
    { id: 'initial_analysis', title: 'Initial Analysis', description: 'AI analysis of credit reports', required: true, completed: false },
    { id: 'dispute_strategy', title: 'Dispute Strategy', description: 'Review and approve dispute plan', required: true, completed: false },
    { id: 'payment_setup', title: 'Payment Setup', description: 'Set up recurring payment method', required: true, completed: false }
  ];

  // Add goal-specific items
  if (goals.includes('auto_loan')) {
    baseChecklist.push({
      id: 'auto_prequalify',
      title: 'Auto Pre-Qualification',
      description: 'Initial assessment for auto financing readiness',
      required: false,
      completed: false
    });
  }

  if (goals.includes('mortgage')) {
    baseChecklist.push({
      id: 'mortgage_readiness',
      title: 'Mortgage Readiness Check',
      description: 'Assess timeline for mortgage qualification',
      required: false,
      completed: false
    });
  }

  if (goals.includes('business_credit')) {
    baseChecklist.push({
      id: 'business_setup',
      title: 'Business Credit Setup',
      description: 'Review business credit building strategy',
      required: false,
      completed: false
    });
  }

  return baseChecklist;
}

async function generateOnboardingRecommendations(goals, apiKey) {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are a credit repair expert helping set client expectations.
            Provide realistic timelines and actionable recommendations.
            Be encouraging but honest about the process.`
          },
          {
            role: 'user',
            content: `A new client wants to improve their credit for: ${goals.join(', ') || 'general improvement'}.

            Provide:
            1. 3-5 specific recommendations for their situation
            2. A realistic timeline expectation (in months)
            3. Key milestones they should expect

            Return as JSON: { recommendations: string[], timeline: { minimum: number, typical: number, maximum: number }, milestones: string[] }`
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7
      })
    });

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return {
      recommendations: [
        'Review all three credit reports carefully',
        'Identify and dispute any inaccurate information',
        'Pay down credit card balances below 30%',
        'Avoid opening new credit accounts during repair',
        'Set up payment reminders to avoid late payments'
      ],
      timeline: { minimum: 3, typical: 6, maximum: 12 },
      milestones: [
        'First round of disputes sent',
        'Initial bureau responses received',
        'Score improvement visible',
        'Goal credit score achieved'
      ]
    };
  }
}

/**
 * Update onboarding step completion
 */
exports.updateOnboardingStep = onCall(async (request) => {
  const db = getFirestore();
  const { sessionId, stepId, completed, notes } = request.data;
  const userId = request.auth?.uid;

  if (!userId) throw new HttpsError('unauthenticated', 'Must be logged in');
  if (!sessionId || !stepId) throw new HttpsError('invalid-argument', 'Session ID and Step ID required');

  const sessionRef = db.collection('onboardingSessions').doc(sessionId);
  const sessionDoc = await sessionRef.get();

  if (!sessionDoc.exists) {
    throw new HttpsError('not-found', 'Onboarding session not found');
  }

  const session = sessionDoc.data();
  const updatedChecklist = session.checklist.map(item => {
    if (item.id === stepId) {
      return { ...item, completed, completedAt: completed ? new Date().toISOString() : null, notes };
    }
    return item;
  });

  // Check if all required steps are complete
  const allRequiredComplete = updatedChecklist
    .filter(item => item.required)
    .every(item => item.completed);

  await sessionRef.update({
    checklist: updatedChecklist,
    status: allRequiredComplete ? 'completed' : 'in_progress',
    completedAt: allRequiredComplete ? FieldValue.serverTimestamp() : null,
    updatedAt: FieldValue.serverTimestamp()
  });

  return { success: true, allRequiredComplete };
});

/**
 * Get onboarding session
 */
exports.getOnboardingSession = onCall(async (request) => {
  const db = getFirestore();
  const { sessionId, clientId } = request.data;
  const userId = request.auth?.uid;

  if (!userId) throw new HttpsError('unauthenticated', 'Must be logged in');

  let query;
  if (sessionId) {
    const doc = await db.collection('onboardingSessions').doc(sessionId).get();
    if (!doc.exists) throw new HttpsError('not-found', 'Session not found');
    return { session: { id: doc.id, ...doc.data() } };
  } else if (clientId) {
    query = db.collection('onboardingSessions')
      .where('clientId', '==', clientId)
      .orderBy('createdAt', 'desc')
      .limit(1);
    const snapshot = await query.get();
    if (snapshot.empty) return { session: null };
    const doc = snapshot.docs[0];
    return { session: { id: doc.id, ...doc.data() } };
  }

  throw new HttpsError('invalid-argument', 'Session ID or Client ID required');
});

// ============================================
// AI COMMUNICATION CENTER
// ============================================

/**
 * Generate AI-powered client communication
 */
exports.generateClientCommunication = onCall(
  { secrets: [openaiApiKey] },
  async (request) => {
    const db = getFirestore();
    const { clientId, communicationType, context, channel } = request.data;
    const userId = request.auth?.uid;

    if (!userId) throw new HttpsError('unauthenticated', 'Must be logged in');
    if (!communicationType) throw new HttpsError('invalid-argument', 'Communication type required');

    // Get client info if provided
    let clientInfo = {};
    if (clientId) {
      const clientDoc = await db.collection('clients').doc(clientId).get();
      if (clientDoc.exists) {
        clientInfo = clientDoc.data();
      }
    }

    const communication = await generateCommunication(
      communicationType,
      clientInfo,
      context || {},
      channel || 'email',
      openaiApiKey.value()
    );

    // Log communication generation
    await db.collection('communicationLog').add({
      clientId,
      communicationType,
      channel,
      content: communication,
      generatedBy: userId,
      generatedAt: FieldValue.serverTimestamp(),
      sent: false
    });

    return { success: true, communication };
  }
);

async function generateCommunication(type, clientInfo, context, channel, apiKey) {
  const templates = {
    welcome: 'Welcome email for new credit repair client',
    dispute_update: 'Update on dispute progress and status',
    score_milestone: 'Celebration of credit score improvement milestone',
    payment_reminder: 'Friendly payment reminder',
    document_request: 'Request for additional documents',
    monthly_update: 'Monthly progress report summary',
    reengagement: 'Re-engagement message for inactive client',
    referral_request: 'Request for referrals after successful outcome',
    auto_opportunity: 'Notification about auto financing opportunity',
    review_request: 'Request for online review after positive experience'
  };

  const channelInstructions = {
    email: 'Write a professional email with subject line and body. Use proper salutation and signature.',
    sms: 'Write a concise SMS message under 160 characters. Be friendly but brief.',
    phone_script: 'Write a phone call script with key talking points and potential responses.'
  };

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are a professional credit repair company communication specialist.
            Write warm, professional, and compliant communications.
            Never make promises about specific outcomes.
            Always maintain FCRA and CROA compliance.
            Company: Speedy Credit Repair Inc.`
          },
          {
            role: 'user',
            content: `Generate a ${type} communication.

            Type description: ${templates[type] || type}
            Channel: ${channel}
            ${channelInstructions[channel]}

            Client name: ${clientInfo.name || clientInfo.firstName || 'Valued Client'}
            ${context.scoreIncrease ? `Score increase: ${context.scoreIncrease} points` : ''}
            ${context.disputeCount ? `Active disputes: ${context.disputeCount}` : ''}
            ${context.customContext ? `Additional context: ${context.customContext}` : ''}

            Return as JSON: {
              subject: string (for email only),
              body: string,
              callToAction: string,
              followUpDate: string (suggested follow-up in days)
            }`
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7
      })
    });

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error('Error generating communication:', error);
    throw new HttpsError('internal', 'Failed to generate communication');
  }
}

/**
 * Save communication template
 */
exports.saveCommunicationTemplate = onCall(async (request) => {
  const db = getFirestore();
  const { templateId, name, type, channel, subject, body, variables } = request.data;
  const userId = request.auth?.uid;

  if (!userId) throw new HttpsError('unauthenticated', 'Must be logged in');

  const userDoc = await db.collection('users').doc(userId).get();
  const userRole = userDoc.exists ? userDoc.data().role : 'viewer';
  if (ROLE_HIERARCHY[userRole] < ROLE_HIERARCHY['manager']) {
    throw new HttpsError('permission-denied', 'Manager access required');
  }

  const template = {
    name,
    type,
    channel,
    subject,
    body,
    variables: variables || [],
    createdBy: userId,
    updatedAt: FieldValue.serverTimestamp()
  };

  if (templateId) {
    await db.collection('communicationTemplates').doc(templateId).update(template);
    return { success: true, templateId };
  } else {
    template.createdAt = FieldValue.serverTimestamp();
    const docRef = await db.collection('communicationTemplates').add(template);
    return { success: true, templateId: docRef.id };
  }
});

/**
 * Get communication templates
 */
exports.getCommunicationTemplates = onCall(async (request) => {
  const db = getFirestore();
  const { type, channel } = request.data;
  const userId = request.auth?.uid;

  if (!userId) throw new HttpsError('unauthenticated', 'Must be logged in');

  let query = db.collection('communicationTemplates');

  if (type) query = query.where('type', '==', type);
  if (channel) query = query.where('channel', '==', channel);

  const snapshot = await query.orderBy('name').get();
  const templates = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  return { templates };
});

/**
 * Log sent communication
 */
exports.logSentCommunication = onCall(async (request) => {
  const db = getFirestore();
  const { clientId, channel, type, content, recipient } = request.data;
  const userId = request.auth?.uid;

  if (!userId) throw new HttpsError('unauthenticated', 'Must be logged in');

  await db.collection('communicationLog').add({
    clientId,
    channel,
    type,
    content,
    recipient,
    sentBy: userId,
    sentAt: FieldValue.serverTimestamp(),
    sent: true
  });

  // Update client's last contact date
  if (clientId) {
    await db.collection('clients').doc(clientId).update({
      lastContactDate: FieldValue.serverTimestamp(),
      lastContactType: type,
      lastContactChannel: channel
    });
  }

  return { success: true };
});

// ============================================
// CLIENT SATISFACTION & NPS
// ============================================

/**
 * Create satisfaction survey
 */
exports.createSatisfactionSurvey = onCall(async (request) => {
  const db = getFirestore();
  const { clientId, surveyType, triggerEvent } = request.data;
  const userId = request.auth?.uid;

  if (!userId) throw new HttpsError('unauthenticated', 'Must be logged in');
  if (!clientId) throw new HttpsError('invalid-argument', 'Client ID required');

  const survey = {
    clientId,
    surveyType: surveyType || 'nps',
    triggerEvent: triggerEvent || 'manual',
    status: 'pending',
    createdBy: userId,
    createdAt: FieldValue.serverTimestamp(),
    sentAt: null,
    completedAt: null,
    responses: null,
    npsScore: null
  };

  const docRef = await db.collection('satisfactionSurveys').add(survey);

  return { success: true, surveyId: docRef.id };
});

/**
 * Submit survey response
 */
exports.submitSurveyResponse = onCall(async (request) => {
  const db = getFirestore();
  const { surveyId, npsScore, feedback, wouldRefer } = request.data;

  if (!surveyId) throw new HttpsError('invalid-argument', 'Survey ID required');
  if (npsScore === undefined || npsScore < 0 || npsScore > 10) {
    throw new HttpsError('invalid-argument', 'NPS score must be 0-10');
  }

  const surveyRef = db.collection('satisfactionSurveys').doc(surveyId);
  const surveyDoc = await surveyRef.get();

  if (!surveyDoc.exists) {
    throw new HttpsError('not-found', 'Survey not found');
  }

  await surveyRef.update({
    status: 'completed',
    completedAt: FieldValue.serverTimestamp(),
    npsScore,
    responses: {
      feedback: feedback || '',
      wouldRefer: wouldRefer || false
    }
  });

  // Categorize response
  let category;
  if (npsScore >= 9) category = 'promoter';
  else if (npsScore >= 7) category = 'passive';
  else category = 'detractor';

  // If promoter, trigger referral/review request workflow
  if (category === 'promoter') {
    await db.collection('referralOpportunities').add({
      clientId: surveyDoc.data().clientId,
      surveyId,
      npsScore,
      status: 'pending_outreach',
      createdAt: FieldValue.serverTimestamp()
    });
  }

  return { success: true, category };
});

/**
 * Get NPS analytics
 */
exports.getNPSAnalytics = onCall(async (request) => {
  const db = getFirestore();
  const { startDate, endDate } = request.data;
  const userId = request.auth?.uid;

  if (!userId) throw new HttpsError('unauthenticated', 'Must be logged in');

  let query = db.collection('satisfactionSurveys').where('status', '==', 'completed');

  if (startDate) {
    query = query.where('completedAt', '>=', new Date(startDate));
  }
  if (endDate) {
    query = query.where('completedAt', '<=', new Date(endDate));
  }

  const snapshot = await query.get();
  const surveys = snapshot.docs.map(doc => doc.data());

  if (surveys.length === 0) {
    return {
      totalResponses: 0,
      npsScore: null,
      promoters: 0,
      passives: 0,
      detractors: 0,
      promoterPercentage: 0,
      detractorPercentage: 0
    };
  }

  let promoters = 0, passives = 0, detractors = 0;
  surveys.forEach(survey => {
    if (survey.npsScore >= 9) promoters++;
    else if (survey.npsScore >= 7) passives++;
    else detractors++;
  });

  const total = surveys.length;
  const npsScore = Math.round(((promoters - detractors) / total) * 100);

  return {
    totalResponses: total,
    npsScore,
    promoters,
    passives,
    detractors,
    promoterPercentage: Math.round((promoters / total) * 100),
    detractorPercentage: Math.round((detractors / total) * 100),
    averageScore: (surveys.reduce((sum, s) => sum + s.npsScore, 0) / total).toFixed(1)
  };
});

// ============================================
// AUTOMATED TRIGGERS
// ============================================

/**
 * Check for milestone triggers and send appropriate communications
 * Runs daily at 10 AM
 */
exports.checkMilestoneTriggers = onSchedule('0 10 * * *', async (event) => {
  const db = getFirestore();

  // Get clients with recent score improvements
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const clientsSnapshot = await db.collection('clients')
    .where('lastScoreUpdate', '>=', thirtyDaysAgo)
    .get();

  const triggers = [];

  for (const clientDoc of clientsSnapshot.docs) {
    const client = clientDoc.data();

    // Check for significant score improvement (20+ points)
    if (client.scoreImprovement && client.scoreImprovement >= 20) {
      // Check if we already sent a milestone communication
      const existingComm = await db.collection('communicationLog')
        .where('clientId', '==', clientDoc.id)
        .where('type', '==', 'score_milestone')
        .where('sentAt', '>=', thirtyDaysAgo)
        .limit(1)
        .get();

      if (existingComm.empty) {
        triggers.push({
          clientId: clientDoc.id,
          clientName: client.name || client.firstName,
          type: 'score_milestone',
          scoreImprovement: client.scoreImprovement
        });
      }
    }

    // Check for clients reaching goal
    if (client.currentScore && client.goalScore && client.currentScore >= client.goalScore) {
      const existingComm = await db.collection('communicationLog')
        .where('clientId', '==', clientDoc.id)
        .where('type', '==', 'goal_reached')
        .limit(1)
        .get();

      if (existingComm.empty) {
        triggers.push({
          clientId: clientDoc.id,
          clientName: client.name || client.firstName,
          type: 'goal_reached',
          currentScore: client.currentScore,
          goalScore: client.goalScore
        });

        // Also create NPS survey
        await db.collection('satisfactionSurveys').add({
          clientId: clientDoc.id,
          surveyType: 'nps',
          triggerEvent: 'goal_reached',
          status: 'pending',
          createdAt: FieldValue.serverTimestamp()
        });
      }
    }
  }

  // Log triggers for manual follow-up
  if (triggers.length > 0) {
    await db.collection('milestoneTriggers').add({
      triggers,
      processedAt: FieldValue.serverTimestamp(),
      count: triggers.length
    });
  }

  console.log(`Processed ${clientsSnapshot.size} clients, found ${triggers.length} milestone triggers`);
});
