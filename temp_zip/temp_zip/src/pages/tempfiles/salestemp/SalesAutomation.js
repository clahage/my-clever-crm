// ============================================
// SALES AUTOMATION ENGINE
// Path: /src/utils/SalesAutomation.js
// ============================================
// Automated workflow engine for sales processes
// Trigger-based actions, sequences, task automation
// ============================================

import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

// ============================================
// AUTOMATION CONFIGURATION
// ============================================

const AUTOMATION_TRIGGERS = {
  // Lead triggers
  'lead.created': 'New lead created',
  'lead.scored': 'Lead score updated',
  'lead.qualified': 'Lead qualified',
  'lead.hot': 'Lead became hot',
  
  // Deal triggers
  'deal.created': 'New deal created',
  'deal.stageChanged': 'Deal stage changed',
  'deal.valueChanged': 'Deal value changed',
  'deal.stale': 'Deal inactive for X days',
  'deal.closeDate': 'Deal close date approaching',
  
  // Communication triggers
  'email.opened': 'Email opened',
  'email.clicked': 'Email link clicked',
  'email.replied': 'Email replied to',
  'call.completed': 'Call completed',
  'call.missed': 'Call missed',
  'meeting.scheduled': 'Meeting scheduled',
  'meeting.completed': 'Meeting completed',
  
  // Time-based triggers
  'time.daily': 'Daily schedule',
  'time.weekly': 'Weekly schedule',
  'time.monthly': 'Monthly schedule',
  'time.custom': 'Custom schedule',
};

const AUTOMATION_ACTIONS = {
  'email.send': 'Send email',
  'sms.send': 'Send SMS',
  'task.create': 'Create task',
  'notification.send': 'Send notification',
  'deal.update': 'Update deal',
  'lead.update': 'Update lead score',
  'tag.add': 'Add tag',
  'tag.remove': 'Remove tag',
  'workflow.start': 'Start workflow',
  'webhook.call': 'Call webhook',
};

const EMAIL_SEQUENCES = {
  'new-lead': {
    name: 'New Lead Nurture',
    steps: [
      { day: 0, template: 'welcome', subject: 'Welcome to Speedy Credit Repair!' },
      { day: 2, template: 'education-1', subject: 'How Credit Repair Works' },
      { day: 5, template: 'case-study', subject: 'Success Story: Jane\'s Journey' },
      { day: 8, template: 'consultation', subject: 'Ready for Your Free Consultation?' },
      { day: 12, template: 'urgency', subject: 'Limited Time Offer - Act Now!' },
    ],
  },
  'qualified-lead': {
    name: 'Qualified Lead Follow-up',
    steps: [
      { day: 0, template: 'qualified', subject: 'Great News - You Qualify!' },
      { day: 1, template: 'next-steps', subject: 'Your Credit Repair Action Plan' },
      { day: 3, template: 'testimonials', subject: 'What Our Clients Say' },
      { day: 5, template: 'closing', subject: 'Let\'s Get Started Today' },
    ],
  },
  'proposal-sent': {
    name: 'Proposal Follow-up',
    steps: [
      { day: 0, template: 'proposal-sent', subject: 'Your Custom Credit Repair Proposal' },
      { day: 2, template: 'proposal-check', subject: 'Questions About Your Proposal?' },
      { day: 4, template: 'proposal-reminder', subject: 'Still Considering? Let\'s Talk' },
      { day: 7, template: 'proposal-final', subject: 'Final Reminder - Proposal Expires Soon' },
    ],
  },
  'cold-lead': {
    name: 'Re-engagement Campaign',
    steps: [
      { day: 0, template: 'reengagement-1', subject: 'We Miss You!' },
      { day: 3, template: 'reengagement-2', subject: 'New Credit Repair Strategies' },
      { day: 7, template: 'reengagement-3', subject: 'Special Offer Just for You' },
      { day: 14, template: 'reengagement-final', subject: 'Last Chance - Don\'t Miss Out!' },
    ],
  },
};

// ============================================
// WORKFLOW AUTOMATION FUNCTIONS
// ============================================

/**
 * Execute automation workflow
 * Main function that processes triggers and executes actions
 */
export const executeWorkflow = async (trigger, data) => {
  console.log('🤖 Executing workflow for trigger:', trigger);
  
  try {
    // Get active workflows for this trigger
    const workflowsRef = collection(db, 'automationWorkflows');
    const workflowsQuery = query(
      workflowsRef,
      where('trigger', '==', trigger),
      where('active', '==', true)
    );
    
    const workflowsSnapshot = await getDocs(workflowsQuery);
    const workflows = workflowsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    console.log('Found', workflows.length, 'active workflows');
    
    // Execute each workflow
    for (const workflow of workflows) {
      try {
        // Check conditions
        if (!checkConditions(workflow.conditions, data)) {
          console.log('⏭️ Skipping workflow (conditions not met):', workflow.name);
          continue;
        }
        
        // Execute actions
        for (const action of workflow.actions) {
          await executeAction(action, data);
        }
        
        // Log execution
        await logWorkflowExecution(workflow.id, trigger, data, 'success');
        
      } catch (error) {
        console.error('❌ Error executing workflow:', workflow.name, error);
        await logWorkflowExecution(workflow.id, trigger, data, 'failed', error.message);
      }
    }
    
    console.log('✅ Workflow execution complete');
    return true;
    
  } catch (error) {
    console.error('❌ Error executing workflows:', error);
    return false;
  }
};

/**
 * Check if workflow conditions are met
 */
const checkConditions = (conditions, data) => {
  if (!conditions || conditions.length === 0) return true;
  
  try {
    for (const condition of conditions) {
      const { field, operator, value } = condition;
      const dataValue = getNestedValue(data, field);
      
      switch (operator) {
        case 'equals':
          if (dataValue !== value) return false;
          break;
        case 'notEquals':
          if (dataValue === value) return false;
          break;
        case 'greaterThan':
          if (parseFloat(dataValue) <= parseFloat(value)) return false;
          break;
        case 'lessThan':
          if (parseFloat(dataValue) >= parseFloat(value)) return false;
          break;
        case 'contains':
          if (!String(dataValue).includes(value)) return false;
          break;
        case 'notContains':
          if (String(dataValue).includes(value)) return false;
          break;
        default:
          return false;
      }
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Error checking conditions:', error);
    return false;
  }
};

/**
 * Execute a single automation action
 */
const executeAction = async (action, data) => {
  console.log('⚡ Executing action:', action.type);
  
  try {
    switch (action.type) {
      case 'email.send':
        await sendAutomatedEmail(action, data);
        break;
        
      case 'sms.send':
        await sendAutomatedSMS(action, data);
        break;
        
      case 'task.create':
        await createAutomatedTask(action, data);
        break;
        
      case 'notification.send':
        await sendAutomatedNotification(action, data);
        break;
        
      case 'deal.update':
        await updateDeal(action, data);
        break;
        
      case 'lead.update':
        await updateLeadScore(action, data);
        break;
        
      case 'tag.add':
        await addTag(action, data);
        break;
        
      case 'tag.remove':
        await removeTag(action, data);
        break;
        
      case 'workflow.start':
        await startWorkflow(action, data);
        break;
        
      case 'webhook.call':
        await callWebhook(action, data);
        break;
        
      default:
        console.warn('⚠️ Unknown action type:', action.type);
    }
    
    console.log('✅ Action executed successfully');
    return true;
    
  } catch (error) {
    console.error('❌ Error executing action:', error);
    throw error;
  }
};

/**
 * Send automated email
 */
const sendAutomatedEmail = async (action, data) => {
  console.log('📧 Sending automated email');
  
  try {
    const emailData = {
      to: data.email || data.contact?.email,
      subject: replaceVariables(action.subject, data),
      body: replaceVariables(action.body, data),
      from: action.from || 'noreply@speedycreditrepair.com',
      template: action.template,
      automationId: action.id,
      sentAt: serverTimestamp(),
    };
    
    // Save to emails collection
    const emailsRef = collection(db, 'emails');
    await setDoc(doc(emailsRef), emailData);
    
    // Track in interactions
    const interactionsRef = collection(db, 'interactions');
    await setDoc(doc(interactionsRef), {
      type: 'email_sent',
      leadId: data.id || data.leadId,
      dealId: data.dealId,
      automated: true,
      timestamp: serverTimestamp(),
    });
    
    console.log('✅ Email queued for sending');
    return true;
    
  } catch (error) {
    console.error('❌ Error sending automated email:', error);
    throw error;
  }
};

/**
 * Send automated SMS
 */
const sendAutomatedSMS = async (action, data) => {
  console.log('💬 Sending automated SMS');
  
  try {
    const smsData = {
      to: data.phone || data.contact?.phone,
      message: replaceVariables(action.message, data),
      automationId: action.id,
      sentAt: serverTimestamp(),
    };
    
    // Save to SMS collection
    const smsRef = collection(db, 'sms');
    await setDoc(doc(smsRef), smsData);
    
    // Track in interactions
    const interactionsRef = collection(db, 'interactions');
    await setDoc(doc(interactionsRef), {
      type: 'sms_sent',
      leadId: data.id || data.leadId,
      dealId: data.dealId,
      automated: true,
      timestamp: serverTimestamp(),
    });
    
    console.log('✅ SMS queued for sending');
    return true;
    
  } catch (error) {
    console.error('❌ Error sending automated SMS:', error);
    throw error;
  }
};

/**
 * Create automated task
 */
const createAutomatedTask = async (action, data) => {
  console.log('✅ Creating automated task');
  
  try {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (action.daysUntilDue || 1));
    
    const taskData = {
      title: replaceVariables(action.title, data),
      description: replaceVariables(action.description, data),
      assignedTo: action.assignTo || data.ownerId,
      relatedTo: data.id || data.leadId || data.dealId,
      relatedType: data.type || 'lead',
      dueDate: Timestamp.fromDate(dueDate),
      priority: action.priority || 'medium',
      status: 'pending',
      automated: true,
      createdAt: serverTimestamp(),
    };
    
    const tasksRef = collection(db, 'tasks');
    await setDoc(doc(tasksRef), taskData);
    
    console.log('✅ Task created successfully');
    return true;
    
  } catch (error) {
    console.error('❌ Error creating automated task:', error);
    throw error;
  }
};

/**
 * Send automated notification
 */
const sendAutomatedNotification = async (action, data) => {
  console.log('🔔 Sending automated notification');
  
  try {
    const notificationData = {
      userId: action.sendTo || data.ownerId,
      title: replaceVariables(action.title, data),
      message: replaceVariables(action.message, data),
      type: action.notificationType || 'info',
      relatedTo: data.id || data.leadId || data.dealId,
      relatedType: data.type || 'lead',
      read: false,
      automated: true,
      createdAt: serverTimestamp(),
    };
    
    const notificationsRef = collection(db, 'notifications');
    await setDoc(doc(notificationsRef), notificationData);
    
    console.log('✅ Notification created successfully');
    return true;
    
  } catch (error) {
    console.error('❌ Error sending automated notification:', error);
    throw error;
  }
};

/**
 * Update deal
 */
const updateDeal = async (action, data) => {
  console.log('📊 Updating deal');
  
  try {
    const dealId = data.dealId || data.id;
    if (!dealId) {
      console.warn('⚠️ No deal ID provided');
      return false;
    }
    
    const dealRef = doc(db, 'deals', dealId);
    const updates = {};
    
    if (action.updateStage) {
      updates.stage = action.updateStage;
    }
    
    if (action.updateValue) {
      updates.value = parseFloat(action.updateValue);
    }
    
    if (action.addTags) {
      // Get current tags and add new ones
      const dealDoc = await getDoc(dealRef);
      const currentTags = dealDoc.data()?.tags || [];
      updates.tags = [...new Set([...currentTags, ...action.addTags])];
    }
    
    updates.lastAutomationUpdate = serverTimestamp();
    
    await updateDoc(dealRef, updates);
    
    console.log('✅ Deal updated successfully');
    return true;
    
  } catch (error) {
    console.error('❌ Error updating deal:', error);
    throw error;
  }
};

/**
 * Update lead score
 */
const updateLeadScore = async (action, data) => {
  console.log('📈 Updating lead score');
  
  try {
    const leadId = data.leadId || data.id;
    if (!leadId) {
      console.warn('⚠️ No lead ID provided');
      return false;
    }
    
    const leadRef = doc(db, 'contacts', leadId);
    
    // Import lead scoring engine
    const { calculateLeadScore } = await import('./LeadScoringEngine.js');
    
    // Get interactions
    const interactionsRef = collection(db, 'interactions');
    const interactionsQuery = query(
      interactionsRef,
      where('leadId', '==', leadId)
    );
    
    const interactionsSnapshot = await getDocs(interactionsQuery);
    const interactions = interactionsSnapshot.docs.map(doc => doc.data());
    
    // Recalculate score
    const scoreData = await calculateLeadScore(data, interactions);
    
    await updateDoc(leadRef, {
      leadScore: scoreData.totalScore,
      scoreCategory: scoreData.category,
      scoreBreakdown: scoreData.breakdown,
      lastScored: serverTimestamp(),
    });
    
    console.log('✅ Lead score updated successfully');
    return true;
    
  } catch (error) {
    console.error('❌ Error updating lead score:', error);
    throw error;
  }
};

/**
 * Add tag
 */
const addTag = async (action, data) => {
  console.log('🏷️ Adding tag');
  
  try {
    const docId = data.id || data.leadId || data.dealId;
    const docType = data.type || 'contacts';
    
    if (!docId) {
      console.warn('⚠️ No document ID provided');
      return false;
    }
    
    const docRef = doc(db, docType, docId);
    const docSnapshot = await getDoc(docRef);
    const currentTags = docSnapshot.data()?.tags || [];
    
    const newTags = [...new Set([...currentTags, action.tag])];
    
    await updateDoc(docRef, {
      tags: newTags,
      lastTagUpdate: serverTimestamp(),
    });
    
    console.log('✅ Tag added successfully');
    return true;
    
  } catch (error) {
    console.error('❌ Error adding tag:', error);
    throw error;
  }
};

/**
 * Remove tag
 */
const removeTag = async (action, data) => {
  console.log('🏷️ Removing tag');
  
  try {
    const docId = data.id || data.leadId || data.dealId;
    const docType = data.type || 'contacts';
    
    if (!docId) {
      console.warn('⚠️ No document ID provided');
      return false;
    }
    
    const docRef = doc(db, docType, docId);
    const docSnapshot = await getDoc(docRef);
    const currentTags = docSnapshot.data()?.tags || [];
    
    const newTags = currentTags.filter(tag => tag !== action.tag);
    
    await updateDoc(docRef, {
      tags: newTags,
      lastTagUpdate: serverTimestamp(),
    });
    
    console.log('✅ Tag removed successfully');
    return true;
    
  } catch (error) {
    console.error('❌ Error removing tag:', error);
    throw error;
  }
};

/**
 * Start another workflow
 */
const startWorkflow = async (action, data) => {
  console.log('🔄 Starting nested workflow');
  
  try {
    await executeWorkflow(action.workflowTrigger, data);
    
    console.log('✅ Nested workflow started');
    return true;
    
  } catch (error) {
    console.error('❌ Error starting nested workflow:', error);
    throw error;
  }
};

/**
 * Call external webhook
 */
const callWebhook = async (action, data) => {
  console.log('🌐 Calling webhook');
  
  try {
    const response = await fetch(action.webhookUrl, {
      method: action.method || 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...action.headers,
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.statusText}`);
    }
    
    console.log('✅ Webhook called successfully');
    return true;
    
  } catch (error) {
    console.error('❌ Error calling webhook:', error);
    throw error;
  }
};

// ============================================
// EMAIL SEQUENCE FUNCTIONS
// ============================================

/**
 * Start email sequence
 */
export const startEmailSequence = async (leadId, sequenceName) => {
  console.log('📧 Starting email sequence:', sequenceName, 'for lead:', leadId);
  
  try {
    const sequence = EMAIL_SEQUENCES[sequenceName];
    if (!sequence) {
      console.error('❌ Sequence not found:', sequenceName);
      return false;
    }
    
    // Save sequence enrollment
    const enrollmentRef = doc(collection(db, 'emailSequenceEnrollments'));
    await setDoc(enrollmentRef, {
      leadId,
      sequenceName,
      enrolledAt: serverTimestamp(),
      completedSteps: [],
      status: 'active',
    });
    
    // Schedule all steps
    for (const step of sequence.steps) {
      const sendDate = new Date();
      sendDate.setDate(sendDate.getDate() + step.day);
      
      await scheduleEmail(leadId, step, sendDate, enrollmentRef.id);
    }
    
    console.log('✅ Email sequence started with', sequence.steps.length, 'steps');
    return true;
    
  } catch (error) {
    console.error('❌ Error starting email sequence:', error);
    return false;
  }
};

/**
 * Schedule email for future sending
 */
const scheduleEmail = async (leadId, step, sendDate, enrollmentId) => {
  console.log('⏰ Scheduling email for:', sendDate);
  
  try {
    const scheduledEmailRef = doc(collection(db, 'scheduledEmails'));
    await setDoc(scheduledEmailRef, {
      leadId,
      enrollmentId,
      template: step.template,
      subject: step.subject,
      scheduledFor: Timestamp.fromDate(sendDate),
      status: 'scheduled',
      createdAt: serverTimestamp(),
    });
    
    console.log('✅ Email scheduled successfully');
    return true;
    
  } catch (error) {
    console.error('❌ Error scheduling email:', error);
    return false;
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Replace variables in strings
 */
const replaceVariables = (text, data) => {
  if (!text) return '';
  
  let result = text;
  
  // Replace {{variable}} with actual values
  const variables = {
    firstName: data.firstName || data.contact?.firstName || 'there',
    lastName: data.lastName || data.contact?.lastName || '',
    email: data.email || data.contact?.email || '',
    phone: data.phone || data.contact?.phone || '',
    company: data.company || '',
    dealName: data.name || data.dealName || '',
    dealValue: data.value || data.dealValue || '',
    leadScore: data.leadScore || '',
  };
  
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value);
  });
  
  return result;
};

/**
 * Get nested object value
 */
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, prop) => current?.[prop], obj);
};

/**
 * Log workflow execution
 */
const logWorkflowExecution = async (workflowId, trigger, data, status, error = null) => {
  try {
    const logRef = doc(collection(db, 'automationLogs'));
    await setDoc(logRef, {
      workflowId,
      trigger,
      dataSnapshot: JSON.stringify(data),
      status,
      error,
      timestamp: serverTimestamp(),
    });
  } catch (err) {
    console.error('❌ Error logging workflow execution:', err);
  }
};

// ============================================
// EXPORT ALL FUNCTIONS
// ============================================

export default {
  executeWorkflow,
  startEmailSequence,
  AUTOMATION_TRIGGERS,
  AUTOMATION_ACTIONS,
  EMAIL_SEQUENCES,
};