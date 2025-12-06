/**
 * AI HELPERS - CLOUD FUNCTIONS
 *
 * Purpose:
 * Additional AI-powered Cloud Functions for advanced workflow features.
 * These support the 8 Tier 1 AI features in the frontend.
 *
 * Functions:
 * 1. aiGenerateEmail - Generate email content using GPT-4
 * 2. aiOptimizeEmail - Optimize existing email for better engagement
 * 3. aiGenerateEmailVariants - Create A/B test variants
 * 4. aiBuildWorkflowFromNaturalLanguage - Build workflow from description
 * 5. aiAnalyzeWorkflowPerformance - Analyze workflow metrics
 * 6. aiAnalyzeAnomalies - Detect unusual contact behavior patterns
 * 7. aiAnalyzeLeadQuality - Score lead quality with reasoning
 * 8. applyWorkflowOptimization - Apply optimization to workflow
 *
 * Created: 2025-12-05
 * Part of: Speedy Credit Repair AI Workflow System
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { Configuration, OpenAIApi } = require('openai');

const configuration = new Configuration({
  apiKey: functions.config().openai.key
});
const openai = new OpenAIApi(configuration);

// ============================================================================
// 1. AI GENERATE EMAIL
// ============================================================================

exports.aiGenerateEmail = functions.https.onCall(async (data, context) => {
  const { purpose, tone, targetAudience, context: emailContext, keyPoints } = data;

  try {
    const prompt = `Generate a professional email for Speedy Credit Repair with these parameters:

**Purpose:** ${purpose}
**Tone:** ${tone || 'professional and friendly'}
**Target Audience:** ${targetAudience || 'credit repair clients'}
**Context:** ${emailContext || 'standard onboarding'}
**Key Points to Include:**
${keyPoints?.map(point => `- ${point}`).join('\n') || '- Build trust\n- Explain next steps\n- Encourage action'}

**Requirements:**
- Subject line (40-60 characters, high open rate)
- Email body (personalized, action-oriented)
- Clear CTA
- Use personalization variables: {{firstName}}, {{lastName}}, {{creditScore}}, {{negativeItemCount}}
- Professional signature
- CAN-SPAM compliant

**Response Format (JSON):**
{
  "subject": "...",
  "body": "...",
  "cta": {"text": "...", "url": "..."},
  "estimatedOpenRate": 0.35,
  "estimatedClickRate": 0.08,
  "reasoning": "..."
}`;

    const response = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        {role: 'system', content: 'You are an expert email copywriter specializing in credit repair and financial services. You write high-converting, compliant emails.'},
        {role: 'user', content: prompt}
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const responseText = response.data.choices[0].message.content;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const emailData = jsonMatch ? JSON.parse(jsonMatch[0]) : {
      subject: 'Your Credit Repair Journey Starts Now',
      body: 'Hi {{firstName}},\n\nWelcome to Speedy Credit Repair...',
      cta: {text: 'Get Started', url: '{{portalLink}}'},
      estimatedOpenRate: 0.30,
      estimatedClickRate: 0.07,
      reasoning: 'AI generation temporarily unavailable'
    };

    return {
      success: true,
      email: emailData
    };

  } catch (error) {
    console.error('[aiGenerateEmail] Error:', error);
    return {
      success: false,
      email: {
        subject: 'Welcome to Speedy Credit Repair',
        body: 'Hi {{firstName}},\n\nWe\'re excited to help you improve your credit...',
        cta: {text: 'Get Started', url: '#'},
        estimatedOpenRate: 0.25,
        estimatedClickRate: 0.05,
        reasoning: 'Fallback template used'
      }
    };
  }
});

// ============================================================================
// 2. AI OPTIMIZE EMAIL
// ============================================================================

exports.aiOptimizeEmail = functions.https.onCall(async (data, context) => {
  const { subject, body, currentMetrics } = data;

  try {
    const prompt = `Optimize this email for better engagement:

**Current Subject:** ${subject}
**Current Body:**
${body}

**Current Metrics:**
- Open Rate: ${currentMetrics?.openRate || 'N/A'}
- Click Rate: ${currentMetrics?.clickRate || 'N/A'}
- Unsubscribe Rate: ${currentMetrics?.unsubscribeRate || 'N/A'}

**Your Task:**
Provide specific improvements to increase open rate and click-through rate.

**Response Format (JSON):**
{
  "optimizedSubject": "...",
  "optimizedBody": "...",
  "changes": [
    {"type": "subject", "before": "...", "after": "...", "reason": "..."},
    {"type": "body", "before": "...", "after": "...", "reason": "..."}
  ],
  "expectedImprovements": {
    "openRateIncrease": "+5%",
    "clickRateIncrease": "+12%"
  },
  "reasoning": "..."
}`;

    const response = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        {role: 'system', content: 'You are an expert email optimization specialist. You analyze emails and provide data-driven improvements.'},
        {role: 'user', content: prompt}
      ],
      temperature: 0.5,
      max_tokens: 1200
    });

    const responseText = response.data.choices[0].message.content;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const optimization = jsonMatch ? JSON.parse(jsonMatch[0]) : {
      optimizedSubject: subject,
      optimizedBody: body,
      changes: [],
      expectedImprovements: {openRateIncrease: '+0%', clickRateIncrease: '+0%'},
      reasoning: 'AI optimization temporarily unavailable'
    };

    return {
      success: true,
      optimization
    };

  } catch (error) {
    console.error('[aiOptimizeEmail] Error:', error);
    return {
      success: false,
      optimization: {
        optimizedSubject: subject,
        optimizedBody: body,
        changes: [],
        expectedImprovements: {openRateIncrease: '+0%', clickRateIncrease: '+0%'},
        reasoning: 'Optimization failed'
      }
    };
  }
});

// ============================================================================
// 3. AI GENERATE EMAIL VARIANTS
// ============================================================================

exports.aiGenerateEmailVariants = functions.https.onCall(async (data, context) => {
  const { baseSubject, baseBody, variantCount = 3, testFocus } = data;

  try {
    const prompt = `Create ${variantCount} A/B test variants of this email:

**Base Subject:** ${baseSubject}
**Base Body:**
${baseBody}

**Test Focus:** ${testFocus || 'subject line and CTA'}

**Your Task:**
Generate ${variantCount} distinct variants optimized for different psychological triggers:
- Variant A: Urgency/Scarcity
- Variant B: Social Proof/Authority
- Variant C: Value/Benefit Focused

**Response Format (JSON):**
{
  "variants": [
    {
      "name": "Variant A - Urgency",
      "subject": "...",
      "body": "...",
      "hypothesis": "Urgency will increase open rate by 15%",
      "expectedWinner": false
    },
    {
      "name": "Variant B - Social Proof",
      "subject": "...",
      "body": "...",
      "hypothesis": "Social proof will increase CTR by 20%",
      "expectedWinner": true
    }
  ],
  "recommendedTestSize": 300,
  "recommendedDuration": "48 hours"
}`;

    const response = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        {role: 'system', content: 'You are an A/B testing expert who creates high-performing email variants based on behavioral psychology.'},
        {role: 'user', content: prompt}
      ],
      temperature: 0.8,
      max_tokens: 1500
    });

    const responseText = response.data.choices[0].message.content;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const variantsData = jsonMatch ? JSON.parse(jsonMatch[0]) : {
      variants: [
        {name: 'Original', subject: baseSubject, body: baseBody, hypothesis: 'Control variant', expectedWinner: false}
      ],
      recommendedTestSize: 200,
      recommendedDuration: '24 hours'
    };

    return {
      success: true,
      variants: variantsData
    };

  } catch (error) {
    console.error('[aiGenerateEmailVariants] Error:', error);
    return {
      success: false,
      variants: {
        variants: [{name: 'Original', subject: baseSubject, body: baseBody, hypothesis: 'Control', expectedWinner: true}],
        recommendedTestSize: 100,
        recommendedDuration: '24 hours'
      }
    };
  }
});

// ============================================================================
// 4. AI BUILD WORKFLOW FROM NATURAL LANGUAGE
// ============================================================================

exports.aiBuildWorkflowFromNaturalLanguage = functions.https.onCall(async (data, context) => {
  const { description, tier } = data;

  try {
    const prompt = `Build a complete workflow from this description:

**Description:** ${description}
**Service Tier:** ${tier || 'standard'}

**Available Step Types:**
- email_send - Send email (requires: template, subject, body, cta)
- sms_send - Send SMS (requires: message, includeLink)
- wait - Delay (requires: duration, unit)
- conditional_branch - If/else logic (requires: condition, truePath, falsePath)
- ai_analysis - AI lead analysis (requires: analysisType)
- task_create - Create task (requires: title, assignTo, priority, dueDate)
- role_assignment - Assign role (requires: role)
- idiq_enrollment - IDIQ enrollment (requires: partnerId, offerType)
- service_recommendation - Recommend service tier
- update_contact - Update contact field (requires: field, value)
- workflow_complete - Mark workflow complete

**Response Format (JSON):**
{
  "workflow": {
    "id": "custom_workflow_123",
    "name": "...",
    "description": "...",
    "tier": "${tier || 'standard'}",
    "trigger": "manual",
    "steps": [
      {
        "id": "step_1",
        "name": "...",
        "type": "email_send",
        "description": "...",
        "config": {...}
      }
    ]
  },
  "estimatedDuration": "7 days",
  "estimatedCompletionRate": 0.75,
  "reasoning": "..."
}`;

    const response = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        {role: 'system', content: 'You are an expert workflow architect. You design optimal multi-step workflows for credit repair business automation.'},
        {role: 'user', content: prompt}
      ],
      temperature: 0.6,
      max_tokens: 2000
    });

    const responseText = response.data.choices[0].message.content;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const workflowData = jsonMatch ? JSON.parse(jsonMatch[0]) : {
      workflow: {
        id: `custom_${Date.now()}`,
        name: 'Custom Workflow',
        description: description,
        tier: tier || 'standard',
        trigger: 'manual',
        steps: [
          {id: 'step_1', name: 'Send Welcome Email', type: 'email_send', config: {template: 'welcome'}}
        ]
      },
      estimatedDuration: 'Unknown',
      estimatedCompletionRate: 0.50,
      reasoning: 'AI generation temporarily unavailable'
    };

    return {
      success: true,
      workflowData
    };

  } catch (error) {
    console.error('[aiBuildWorkflowFromNaturalLanguage] Error:', error);
    return {
      success: false,
      workflowData: {
        workflow: {
          id: `custom_${Date.now()}`,
          name: 'New Workflow',
          description: description,
          tier: tier || 'standard',
          trigger: 'manual',
          steps: []
        },
        estimatedDuration: 'Unknown',
        estimatedCompletionRate: 0,
        reasoning: 'Workflow generation failed'
      }
    };
  }
});

// ============================================================================
// 5. AI ANALYZE WORKFLOW PERFORMANCE
// ============================================================================

exports.aiAnalyzeWorkflowPerformance = functions.https.onCall(async (data, context) => {
  const { workflowId, timeRange = '30d' } = data;

  try {
    // Fetch workflow execution data
    const executionsSnapshot = await admin.firestore()
      .collection('workflowExecutions')
      .where('workflowId', '==', workflowId)
      .where('startedAt', '>=', getDateFromTimeRange(timeRange))
      .get();

    const executions = executionsSnapshot.docs.map(doc => doc.data());

    // Calculate metrics
    const totalExecutions = executions.length;
    const completedExecutions = executions.filter(e => e.status === 'completed').length;
    const failedExecutions = executions.filter(e => e.status === 'failed').length;
    const completionRate = totalExecutions > 0 ? (completedExecutions / totalExecutions) : 0;

    const avgDuration = executions.length > 0
      ? executions.reduce((sum, e) => sum + (e.duration || 0), 0) / executions.length
      : 0;

    // Step-level analysis
    const stepMetrics = {};
    executions.forEach(execution => {
      if (execution.steps) {
        execution.steps.forEach(step => {
          if (!stepMetrics[step.id]) {
            stepMetrics[step.id] = {
              executed: 0,
              completed: 0,
              failed: 0,
              avgDuration: 0
            };
          }
          stepMetrics[step.id].executed++;
          if (step.status === 'completed') stepMetrics[step.id].completed++;
          if (step.status === 'failed') stepMetrics[step.id].failed++;
        });
      }
    });

    const prompt = `Analyze this workflow performance and provide optimization suggestions:

**Workflow ID:** ${workflowId}
**Time Range:** ${timeRange}

**Metrics:**
- Total Executions: ${totalExecutions}
- Completion Rate: ${(completionRate * 100).toFixed(1)}%
- Failed Executions: ${failedExecutions}
- Avg Duration: ${Math.round(avgDuration / 1000 / 60)} minutes

**Step Performance:**
${Object.keys(stepMetrics).map(stepId => {
  const metrics = stepMetrics[stepId];
  const stepCompletionRate = metrics.executed > 0 ? (metrics.completed / metrics.executed * 100).toFixed(1) : 0;
  return `- ${stepId}: ${stepCompletionRate}% completion (${metrics.executed} executions, ${metrics.failed} failures)`;
}).join('\n')}

**Your Task:**
Identify bottlenecks, failure points, and provide specific optimization suggestions.

**Response Format (JSON):**
{
  "overallHealth": "good/fair/poor",
  "bottlenecks": [
    {"stepId": "...", "issue": "...", "impact": "high/medium/low"}
  ],
  "optimizations": [
    {
      "type": "remove_step/modify_step/add_step/reorder_steps",
      "stepId": "...",
      "suggestion": "...",
      "expectedImpact": "...",
      "priority": "high/medium/low"
    }
  ],
  "predictedImprovements": {
    "completionRate": "+10%",
    "avgDuration": "-20%",
    "failureRate": "-50%"
  }
}`;

    const response = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        {role: 'system', content: 'You are a workflow optimization expert. You analyze performance data and provide actionable improvements.'},
        {role: 'user', content: prompt}
      ],
      temperature: 0.4,
      max_tokens: 1500
    });

    const responseText = response.data.choices[0].message.content;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {
      overallHealth: 'fair',
      bottlenecks: [],
      optimizations: [],
      predictedImprovements: {completionRate: '+0%', avgDuration: '-0%', failureRate: '-0%'}
    };

    return {
      success: true,
      metrics: {
        totalExecutions,
        completionRate,
        failedExecutions,
        avgDuration,
        stepMetrics
      },
      analysis
    };

  } catch (error) {
    console.error('[aiAnalyzeWorkflowPerformance] Error:', error);
    return {
      success: false,
      analysis: {
        overallHealth: 'unknown',
        bottlenecks: [],
        optimizations: [],
        predictedImprovements: {}
      }
    };
  }
});

// ============================================================================
// 6. AI ANALYZE ANOMALIES
// ============================================================================

exports.aiAnalyzeAnomalies = functions.https.onCall(async (data, context) => {
  const { contactId, eventType, eventData } = data;

  try {
    // Fetch contact history
    const contactDoc = await admin.firestore().collection('contacts').doc(contactId).get();
    const contact = contactDoc.data();

    const eventsSnapshot = await admin.firestore()
      .collection('contactEvents')
      .where('contactId', '==', contactId)
      .orderBy('timestamp', 'desc')
      .limit(50)
      .get();

    const recentEvents = eventsSnapshot.docs.map(doc => doc.data());

    const prompt = `Analyze this contact behavior for anomalies:

**Contact:** ${contact.firstName} ${contact.lastName}
**Event:** ${eventType}
**Event Data:** ${JSON.stringify(eventData, null, 2)}

**Recent Behavior (last 50 events):**
${recentEvents.slice(0, 10).map(e => `- ${e.type} at ${e.timestamp}`).join('\n')}

**Contact Profile:**
- Lead Score: ${contact.leadScore || 'N/A'}
- Credit Score: ${contact.creditScore || 'N/A'}
- Service Tier: ${contact.serviceTier || 'N/A'}
- Engagement Level: ${contact.engagementLevel || 'N/A'}

**Your Task:**
Detect unusual patterns that might indicate:
- Fraud risk
- Payment issues
- High churn risk
- Technical problems
- Exceptional opportunity (hot lead)

**Response Format (JSON):**
{
  "anomalyDetected": true/false,
  "anomalyType": "fraud_risk/payment_issue/churn_risk/technical_issue/hot_opportunity/none",
  "severity": "critical/high/medium/low",
  "indicators": ["...", "..."],
  "recommendedActions": [
    {"action": "...", "priority": "immediate/high/medium/low", "assignTo": "christopher/laurie/system"}
  ],
  "reasoning": "..."
}`;

    const response = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        {role: 'system', content: 'You are an expert fraud detection and behavior analysis AI. You identify unusual patterns that require human attention.'},
        {role: 'user', content: prompt}
      ],
      temperature: 0.2,
      max_tokens: 800
    });

    const responseText = response.data.choices[0].message.content;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {
      anomalyDetected: false,
      anomalyType: 'none',
      severity: 'low',
      indicators: [],
      recommendedActions: [],
      reasoning: 'No anomalies detected'
    };

    // Log anomaly if detected
    if (analysis.anomalyDetected) {
      await admin.firestore().collection('anomalies').add({
        contactId,
        eventType,
        anomalyType: analysis.anomalyType,
        severity: analysis.severity,
        detectedAt: admin.firestore.FieldValue.serverTimestamp(),
        status: 'pending_review',
        analysis
      });
    }

    return {
      success: true,
      analysis
    };

  } catch (error) {
    console.error('[aiAnalyzeAnomalies] Error:', error);
    return {
      success: false,
      analysis: {
        anomalyDetected: false,
        anomalyType: 'none',
        severity: 'low',
        indicators: [],
        recommendedActions: [],
        reasoning: 'Analysis failed'
      }
    };
  }
});

// ============================================================================
// 7. AI ANALYZE LEAD QUALITY
// ============================================================================

exports.aiAnalyzeLeadQuality = functions.https.onCall(async (data, context) => {
  const { leadData, returnReasoning = false } = data;

  try {
    const prompt = `Score this lead's quality and potential:

**Lead Information:**
- Name: ${leadData.firstName} ${leadData.lastName}
- Email: ${leadData.email}
- Phone: ${leadData.phone || 'N/A'}
- Credit Score: ${leadData.creditScore || 'N/A'}
- Negative Items: ${leadData.negativeItemCount || 'N/A'}
- Source: ${leadData.source || 'N/A'}
- Initial Message: ${leadData.initialMessage || 'N/A'}

**Engagement Data:**
- Website visits: ${leadData.websiteVisits || 0}
- Pages viewed: ${leadData.pagesViewed || 0}
- Time on site: ${leadData.timeOnSite || 0} seconds
- Form completion rate: ${leadData.formCompletionRate || 'N/A'}

**Your Task:**
Assess lead quality on multiple dimensions.

**Response Format (JSON):**
{
  "leadScore": 0-100,
  "leadTier": "A/B/C/D",
  "temperature": "hot/warm/cold",
  "dimensions": {
    "intentToConvert": 0-100,
    "financialCapability": 0-100,
    "engagementLevel": 0-100,
    "urgency": 0-100,
    "fitForService": 0-100
  },
  "recommendedServiceTier": "vip/premium/acceleration/standard/diy",
  "recommendedFollowUpTiming": "immediate/within_2_hours/within_24_hours/within_week",
  "keyStrengths": ["...", "..."],
  "concernFlags": ["...", "..."],
  "reasoning": "..."
}`;

    const response = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        {role: 'system', content: 'You are a lead qualification expert for credit repair services. You assess lead quality with high accuracy.'},
        {role: 'user', content: prompt}
      ],
      temperature: 0.3,
      max_tokens: 1000
    });

    const responseText = response.data.choices[0].message.content;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {
      leadScore: 50,
      leadTier: 'C',
      temperature: 'warm',
      dimensions: {
        intentToConvert: 50,
        financialCapability: 50,
        engagementLevel: 50,
        urgency: 50,
        fitForService: 50
      },
      recommendedServiceTier: 'standard',
      recommendedFollowUpTiming: 'within_24_hours',
      keyStrengths: ['Submitted contact form'],
      concernFlags: [],
      reasoning: returnReasoning ? 'AI analysis temporarily unavailable' : undefined
    };

    return {
      success: true,
      analysis
    };

  } catch (error) {
    console.error('[aiAnalyzeLeadQuality] Error:', error);
    return {
      success: false,
      analysis: {
        leadScore: 50,
        leadTier: 'C',
        temperature: 'warm',
        recommendedServiceTier: 'standard',
        reasoning: 'Analysis failed'
      }
    };
  }
});

// ============================================================================
// 8. APPLY WORKFLOW OPTIMIZATION
// ============================================================================

exports.applyWorkflowOptimization = functions.https.onCall(async (data, context) => {
  const { workflowId, optimizations } = data;

  try {
    // Fetch current workflow
    const workflowDoc = await admin.firestore().collection('workflows').doc(workflowId).get();
    if (!workflowDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Workflow not found');
    }

    const workflow = workflowDoc.data();
    let modifiedSteps = [...workflow.steps];
    const appliedChanges = [];

    // Apply each optimization
    for (const optimization of optimizations) {
      switch (optimization.type) {
        case 'remove_step':
          modifiedSteps = modifiedSteps.filter(step => step.id !== optimization.stepId);
          appliedChanges.push({
            type: 'remove_step',
            stepId: optimization.stepId,
            reason: optimization.suggestion
          });
          break;

        case 'modify_step':
          const stepIndex = modifiedSteps.findIndex(step => step.id === optimization.stepId);
          if (stepIndex >= 0) {
            modifiedSteps[stepIndex] = {
              ...modifiedSteps[stepIndex],
              ...optimization.modifications
            };
            appliedChanges.push({
              type: 'modify_step',
              stepId: optimization.stepId,
              changes: optimization.modifications
            });
          }
          break;

        case 'add_step':
          const insertIndex = optimization.insertAfter
            ? modifiedSteps.findIndex(step => step.id === optimization.insertAfter) + 1
            : modifiedSteps.length;
          modifiedSteps.splice(insertIndex, 0, optimization.newStep);
          appliedChanges.push({
            type: 'add_step',
            stepId: optimization.newStep.id,
            position: insertIndex
          });
          break;

        case 'reorder_steps':
          const step = modifiedSteps.find(s => s.id === optimization.stepId);
          if (step) {
            modifiedSteps = modifiedSteps.filter(s => s.id !== optimization.stepId);
            modifiedSteps.splice(optimization.newPosition, 0, step);
            appliedChanges.push({
              type: 'reorder_steps',
              stepId: optimization.stepId,
              newPosition: optimization.newPosition
            });
          }
          break;
      }
    }

    // Create new version of workflow
    const newVersion = (workflow.version || 1) + 1;
    const optimizedWorkflow = {
      ...workflow,
      steps: modifiedSteps,
      version: newVersion,
      optimizedAt: admin.firestore.FieldValue.serverTimestamp(),
      optimizations: appliedChanges,
      previousVersion: workflow.version || 1
    };

    // Save optimized workflow
    await admin.firestore().collection('workflows').doc(workflowId).update(optimizedWorkflow);

    // Archive old version
    await admin.firestore().collection('workflowVersions').add({
      workflowId,
      version: workflow.version || 1,
      workflow,
      archivedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return {
      success: true,
      newVersion,
      appliedChanges,
      workflow: optimizedWorkflow
    };

  } catch (error) {
    console.error('[applyWorkflowOptimization] Error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getDateFromTimeRange(timeRange) {
  const now = new Date();
  const match = timeRange.match(/^(\d+)([dhm])$/);

  if (!match) return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // Default 30 days

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case 'd':
      return new Date(now.getTime() - value * 24 * 60 * 60 * 1000);
    case 'h':
      return new Date(now.getTime() - value * 60 * 60 * 1000);
    case 'm':
      return new Date(now.getTime() - value * 60 * 1000);
    default:
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
}
