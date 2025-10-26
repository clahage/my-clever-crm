// functions/aiReceptionistProcessor.js
// Processes incoming AI Receptionist calls and creates/updates contacts

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const aiService = require('./aiService');

// Initialize if not already done
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Triggered when a new document is created in aiReceptionistCalls
 * Processes the call and creates/updates contact record
 */
exports.processAIReceptionistCall = functions.firestore
  .document('aiReceptionistCalls/{callId}')
  .onCreate(async (snap, context) => {
    const callData = snap.data();
    const callId = context.params.callId;

    console.log(`Processing AI Receptionist call: ${callId}`);

    try {
      // Step 1: Analyze call transcript with AI
      const analysis = await analyzeCallWithAI(callData);

      // Step 2: Search for existing contact
      const existingContact = await findExistingContact(callData);

      // Step 3: Create or update contact
      let contactId;
      if (existingContact) {
        contactId = existingContact.id;
        await updateExistingContact(existingContact, callData, analysis);
        console.log(`Updated existing contact: ${contactId}`);
      } else {
        contactId = await createNewContact(callData, analysis);
        console.log(`Created new contact: ${contactId}`);
      }

      // Step 4: Update aiReceptionistCall with processing status
      await snap.ref.update({
        processed: true,
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
        contactId: contactId,
        analysis: analysis
      });

      // Step 5: Create follow-up task if needed
      if (analysis.priority === 'urgent' || analysis.leadTemperature === 'hot') {
        await createFollowUpTask(contactId, analysis);
      }

      // Step 6: Send notification to appropriate team member
      await sendTeamNotification(contactId, analysis);

      return { success: true, contactId };

    } catch (error) {
      console.error('Error processing AI Receptionist call:', error);
      
      // Update call with error status
      await snap.ref.update({
        processed: false,
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
        error: error.message
      });

      // Alert admin about processing failure
      await alertAdmin(callId, error);

      throw error;
    }
  });

/**
 * Analyze call transcript using OpenAI
 */
async function analyzeCallWithAI(callData) {
  console.log('Analyzing call with AI...');

  const transcript = callData.transcript || callData.callNotes || '';
  
  const prompt = `Analyze this customer service call transcript and extract key information:

TRANSCRIPT:
${transcript}

CALLER INFO:
- Phone: ${callData.phone || callData.callerID || 'unknown'}
- Name: ${callData.firstName || ''} ${callData.lastName || ''}
- Email: ${callData.email || 'not provided'}

Provide a JSON response with:
1. roles: Array of roles (always include "contact", then add "lead", "client", "previousClient", "affiliate", or "vendor" as appropriate)
2. leadTemperature: "hot", "warm", or "cold" (only if lead role assigned)
3. urgencyScore: 1-10 based on caller's situation
4. priority: "urgent", "high", "medium", or "low"
5. callIntent: Brief summary of why they called
6. creditSituation: Summary of their credit issues (if mentioned)
7. goals: What they're trying to achieve
8. nextAction: Recommended next step
9. nextActionDue: When to follow up (ISO timestamp, relative to call time: ${callData.callTimestamp})
10. assignedTo: Suggested team member ("chris", "laurie", or "sales_team")
11. requiresOwnerAttention: true if urgent complaint or high-value opportunity
12. keyInsights: Array of important points from the call
13. sentiment: "positive", "neutral", or "negative"

DECISION RULES:
- Hot lead: Urgency 8-10, specific timeline, ready to act NOW
- Warm lead: Urgency 5-7, researching, interested but no immediate timeline
- Cold lead: Urgency 1-4, general inquiry
- Urgent priority: Time-sensitive loan application, complaint, or high urgency score
- Previous client: Mentions being a past customer
- Client: Mentions current account or recent agreement
- Requires owner attention: Complaint, high-value opportunity (mortgage, large purchase), or urgency 10

Return ONLY valid JSON, no other text.`;

  try {
    // Use the secure aiService
    const response = await aiService.complete({
      prompt: prompt,
      maxTokens: 1000,
      temperature: 0.3 // Lower temperature for more consistent analysis
    });

    const analysis = JSON.parse(response.text);
    
    // Ensure roles always includes "contact"
    if (!analysis.roles.includes('contact')) {
      analysis.roles.unshift('contact');
    }

    return analysis;

  } catch (error) {
    console.error('AI analysis failed:', error);
    
    // Return fallback analysis
    return {
      roles: ['contact', 'lead'],
      leadTemperature: 'warm',
      urgencyScore: 5,
      priority: 'medium',
      callIntent: 'Credit repair inquiry',
      nextAction: 'follow_up',
      nextActionDue: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      assignedTo: 'sales_team',
      requiresOwnerAttention: false,
      keyInsights: ['AI analysis failed - manual review needed'],
      sentiment: 'neutral'
    };
  }
}

/**
 * Search for existing contact by phone, email, or name
 */
async function findExistingContact(callData) {
  console.log('Searching for existing contact...');

  // Normalize phone number for search
  const normalizedPhone = normalizePhoneNumber(callData.phone || callData.callerID);

  // Search by phone number first (most reliable)
  if (normalizedPhone) {
    const phoneQuery = await db.collection('contacts')
      .where('phone', '==', normalizedPhone)
      .limit(1)
      .get();

    if (!phoneQuery.empty) {
      return { id: phoneQuery.docs[0].id, ...phoneQuery.docs[0].data() };
    }
  }

  // Search by email if provided
  if (callData.email) {
    const emailQuery = await db.collection('contacts')
      .where('email', '==', callData.email.toLowerCase())
      .limit(1)
      .get();

    if (!emailQuery.empty) {
      return { id: emailQuery.docs[0].id, ...emailQuery.docs[0].data() };
    }
  }

  // Search by name combination (less reliable, requires both first and last)
  if (callData.firstName && callData.lastName) {
    const nameQuery = await db.collection('contacts')
      .where('firstName', '==', callData.firstName)
      .where('lastName', '==', callData.lastName)
      .limit(1)
      .get();

    if (!nameQuery.empty) {
      return { id: nameQuery.docs[0].id, ...nameQuery.docs[0].data() };
    }
  }

  return null; // No existing contact found
}

/**
 * Create new contact from call data
 */
async function createNewContact(callData, analysis) {
  console.log('Creating new contact...');

  const contactData = {
    // Basic Info
    firstName: callData.firstName || 'Unknown',
    lastName: callData.lastName || 'Caller',
    email: callData.email ? callData.email.toLowerCase() : null,
    phone: normalizePhoneNumber(callData.phone || callData.callerID),

    // Address (if provided)
    address: callData.address || {
      street: callData.street || null,
      city: callData.city || null,
      state: callData.state || null,
      zipCode: callData.zipCode || null,
      county: callData.county || null,
      timeZone: callData.timeZone || null
    },

    // Identity
    dateOfBirth: callData.dateOfBirth || null,
    ssn_last4: callData.ssn_last4 || null,
    needsFullSSN: callData.needsFullSSN || true,

    // Contact Preferences
    preferredContactMethod: callData.preferredContactMethod || ['phone'],
    bestTimeToContact: callData.bestTimeToContact || null,

    // Lead Intelligence (from AI analysis)
    roles: analysis.roles,
    leadTemperature: analysis.leadTemperature || null,
    urgencyScore: analysis.urgencyScore || 5,
    priority: analysis.priority,

    // Call Details
    callIntent: analysis.callIntent,
    creditSituation: analysis.creditSituation || null,
    goals: analysis.goals || null,
    callNotes: callData.transcript || callData.callNotes || '',
    additionalNotes: callData.additionalNotes || null,

    // Metadata
    source: 'aiReceptionist',
    callTimestamp: callData.callTimestamp || admin.firestore.FieldValue.serverTimestamp(),
    callerID: callData.callerID || callData.phone,

    // Status & Assignment
    status: 'new',
    assignedTo: analysis.assignedTo || null,
    nextAction: analysis.nextAction,
    nextActionDue: analysis.nextActionDue ? admin.firestore.Timestamp.fromDate(new Date(analysis.nextActionDue)) : null,
    requiresOwnerAttention: analysis.requiresOwnerAttention || false,

    // Sentiment & Insights
    sentiment: analysis.sentiment || 'neutral',
    keyInsights: analysis.keyInsights || [],

    // Tracking
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    createdBy: 'aiReceptionist',
    lastContactedAt: admin.firestore.FieldValue.serverTimestamp(),

    // Activity Log
    activityLog: [{
      type: 'call',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      notes: `AI Receptionist call: ${analysis.callIntent}`,
      createdBy: 'aiReceptionist'
    }]
  };

  // Remove null values
  Object.keys(contactData).forEach(key => {
    if (contactData[key] === null || contactData[key] === undefined) {
      delete contactData[key];
    }
  });

  const contactRef = await db.collection('contacts').add(contactData);
  return contactRef.id;
}

/**
 * Update existing contact with new call information
 */
async function updateExistingContact(existingContact, callData, analysis) {
  console.log(`Updating existing contact: ${existingContact.id}`);

  const updates = {
    // Always update these
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    lastContactedAt: admin.firestore.FieldValue.serverTimestamp(),

    // Add new role if AI assigned one that doesn't exist
    roles: admin.firestore.FieldValue.arrayUnion(...analysis.roles),

    // Update lead temperature if this is a warmer lead
    ...(shouldUpdateLeadTemperature(existingContact, analysis) && {
      leadTemperature: analysis.leadTemperature,
      urgencyScore: analysis.urgencyScore,
      priority: analysis.priority
    }),

    // Update contact info if it was missing or caller provided new info
    ...(callData.email && !existingContact.email && {
      email: callData.email.toLowerCase()
    }),
    
    ...(callData.address && !existingContact.address && {
      address: callData.address
    }),

    // Add to activity log
    activityLog: admin.firestore.FieldValue.arrayUnion({
      type: 'call',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      notes: `AI Receptionist call: ${analysis.callIntent}`,
      sentiment: analysis.sentiment,
      createdBy: 'aiReceptionist'
    }),

    // Flag if requires owner attention
    ...(analysis.requiresOwnerAttention && {
      requiresOwnerAttention: true,
      assignedTo: 'chris'
    })
  };

  await db.collection('contacts').doc(existingContact.id).update(updates);
}

/**
 * Determine if lead temperature should be updated
 */
function shouldUpdateLeadTemperature(existingContact, analysis) {
  if (!existingContact.roles.includes('lead')) return true;
  
  const tempOrder = { cold: 1, warm: 2, hot: 3 };
  const existingTemp = tempOrder[existingContact.leadTemperature] || 0;
  const newTemp = tempOrder[analysis.leadTemperature] || 0;
  
  return newTemp > existingTemp; // Only update if getting warmer
}

/**
 * Normalize phone number to (XXX) XXX-XXXX format
 */
function normalizePhoneNumber(phone) {
  if (!phone) return null;
  
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // Remove leading 1 if present (US country code)
  const cleaned = digits.startsWith('1') && digits.length === 11 
    ? digits.substring(1) 
    : digits;
  
  // Format as (XXX) XXX-XXXX
  if (cleaned.length === 10) {
    return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6)}`;
  }
  
  return phone; // Return original if can't normalize
}

/**
 * Create follow-up task for urgent/hot leads
 */
async function createFollowUpTask(contactId, analysis) {
  console.log('Creating follow-up task...');

  const taskData = {
    contactId: contactId,
    type: 'callback',
    priority: analysis.priority,
    title: `Follow up: ${analysis.callIntent}`,
    description: `AI Receptionist call - ${analysis.leadTemperature} lead\n\nKey insights:\n${analysis.keyInsights.join('\n')}`,
    dueDate: analysis.nextActionDue ? admin.firestore.Timestamp.fromDate(new Date(analysis.nextActionDue)) : null,
    assignedTo: analysis.assignedTo,
    status: 'pending',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    createdBy: 'aiReceptionist'
  };

  await db.collection('tasks').add(taskData);
}

/**
 * Send notification to team member
 */
async function sendTeamNotification(contactId, analysis) {
  console.log('Sending team notification...');

  // Get contact data for notification
  const contactDoc = await db.collection('contacts').doc(contactId).get();
  const contact = contactDoc.data();

  const notificationData = {
    type: 'new_lead',
    priority: analysis.priority,
    title: `New ${analysis.leadTemperature} lead from AI Receptionist`,
    message: `${contact.firstName} ${contact.lastName} called about: ${analysis.callIntent}`,
    contactId: contactId,
    assignedTo: analysis.assignedTo,
    requiresOwnerAttention: analysis.requiresOwnerAttention,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    read: false,
    metadata: {
      leadTemperature: analysis.leadTemperature,
      urgencyScore: analysis.urgencyScore,
      sentiment: analysis.sentiment,
      keyInsights: analysis.keyInsights
    }
  };

  await db.collection('notifications').add(notificationData);
}

/**
 * Alert admin about processing failure
 */
async function alertAdmin(callId, error) {
  console.error('Alerting admin about processing failure...');

  const alertData = {
    type: 'system_error',
    priority: 'urgent',
    title: 'AI Receptionist Call Processing Failed',
    message: `Call ${callId} could not be processed: ${error.message}`,
    assignedTo: 'chris',
    requiresOwnerAttention: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    read: false,
    metadata: {
      callId: callId,
      error: error.message,
      stack: error.stack
    }
  };

  await db.collection('notifications').add(alertData);
}

module.exports = {
  processAIReceptionistCall: exports.processAIReceptionistCall
};