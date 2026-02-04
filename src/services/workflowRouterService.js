// ============================================================================
// WORKFLOW ROUTER SERVICE
// ============================================================================
// Path: src/services/workflowRouterService.js
// Purpose: Route contacts to the correct workflow step based on their progress
// 
// This service is the CENTRAL BRAIN that knows where each contact is in the
// workflow and routes them to the correct component automatically.
//
// © 1995-2026 Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved
// ============================================================================

import { doc, getDoc, updateDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// ============================================================================
// WORKFLOW STAGES DEFINITION
// ============================================================================
// These stages represent the complete Contact → Client journey
// Each stage has a numeric value for easy comparison and tracking

export const WORKFLOW_STAGES = {
  // ===== INITIAL CONTACT =====
  CONTACT_CREATED: 0,           // Contact just entered the system
  WELCOME_EMAIL_SENT: 1,        // Welcome email triggered
  
  // ===== IDIQ ENROLLMENT PHASE =====
  IDIQ_ENROLLMENT_STARTED: 2,   // Started the IDIQ enrollment form
  IDIQ_ENROLLMENT_COMPLETE: 3,  // IDIQ membership created
  CREDIT_REPORT_PULLED: 4,      // Credit report successfully pulled
  AI_ANALYSIS_COMPLETE: 5,      // AI has analyzed the credit report
  
  // ===== SALES PHASE =====
  SERVICE_PLAN_SELECTED: 6,     // Client selected a service plan
  
  // ===== CONTRACT PHASE =====
  CONTRACT_GENERATED: 7,        // Contract documents generated
  CONTRACT_SIGNED: 8,           // Client signed all contracts
  
  // ===== PAYMENT PHASE =====
  ACH_AUTHORIZED: 9,            // ACH payment authorized
  
  // ===== ACTIVE CLIENT PHASE =====
  DISPUTE_LETTERS_CREATED: 10,  // Dispute letters generated
  DISPUTES_FAXED: 11,           // Disputes sent via Telnyx
  ACTIVE_CLIENT: 12,            // Fully active, ongoing service
};

// ============================================================================
// STAGE TO ROUTE MAPPING
// ============================================================================
// Maps each workflow stage to the correct route in the application

export const STAGE_ROUTES = {
  0: '/contacts-pipeline',       // Just created, needs to enter pipeline
  1: '/contacts-pipeline',       // Welcome sent, waiting for response
  2: '/complete-enrollment',     // Started IDIQ enrollment
  3: '/complete-enrollment',     // IDIQ complete, viewing report
  4: '/complete-enrollment',     // Report pulled
  5: '/select-plan',             // AI analysis done, needs to select plan
  6: '/contract-signing',        // Plan selected, needs to sign contract
  7: '/contract-signing',        // Contract generated, waiting for signature
  8: '/ach-authorization',       // Contract signed, needs payment setup
  9: '/client-portal',           // ACH authorized, now a client
  10: '/client-portal',          // Disputes created
  11: '/client-portal',          // Disputes faxed
  12: '/client-portal',          // Active client
};

// ============================================================================
// STAGE LABELS (for UI display)
// ============================================================================

export const STAGE_LABELS = {
  0: 'New Contact',
  1: 'Welcome Sent',
  2: 'Enrollment Started',
  3: 'Enrolled',
  4: 'Report Pulled',
  5: 'Analysis Complete',
  6: 'Plan Selected',
  7: 'Contract Ready',
  8: 'Contract Signed',
  9: 'Payment Setup',
  10: 'Disputes Created',
  11: 'Disputes Sent',
  12: 'Active Client',
};

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * Get the current workflow stage for a contact
 * @param {string} contactId - The contact's Firestore ID
 * @returns {Promise<number>} - The current workflow stage number
 */
export async function getContactWorkflowStage(contactId) {
  try {
    console.log('📊 Getting workflow stage for contact:', contactId);
    
    const contactRef = doc(db, 'contacts', contactId);
    const contactSnap = await getDoc(contactRef);
    
    if (!contactSnap.exists()) {
      console.error('❌ Contact not found:', contactId);
      return 0;
    }
    
    const data = contactSnap.data();
    const stage = data.workflowStage || 0;
    
    console.log(`✅ Contact ${contactId} is at stage ${stage} (${STAGE_LABELS[stage]})`);
    return stage;
  } catch (error) {
    console.error('❌ Error getting workflow stage:', error);
    return 0;
  }
}

/**
 * Update the workflow stage for a contact
 * @param {string} contactId - The contact's Firestore ID
 * @param {number} newStage - The new workflow stage
 * @param {object} additionalData - Any additional data to update
 * @returns {Promise<boolean>} - Success status
 */
export async function updateContactWorkflowStage(contactId, newStage, additionalData = {}) {
  try {
    console.log(`🔄 Updating contact ${contactId} to stage ${newStage}`);
    
    const contactRef = doc(db, 'contacts', contactId);
    
    // Build the update object
    const updateData = {
      workflowStage: newStage,
      workflowStageUpdatedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ...additionalData,
    };
    
    // Add to workflow history
    updateData[`workflowHistory.stage_${newStage}`] = {
      completedAt: serverTimestamp(),
      previousStage: await getContactWorkflowStage(contactId),
      ...additionalData,
    };
    
    // Special handling for stage transitions
    if (newStage === WORKFLOW_STAGES.ACH_AUTHORIZED) {
      // Contact becomes a client when ACH is authorized
      updateData.status = 'client';
      updateData.roles = ['contact', 'client'];
      updateData.clientSince = serverTimestamp();
    }
    
    await updateDoc(contactRef, updateData);
    
    console.log(`✅ Contact ${contactId} advanced to stage ${newStage} (${STAGE_LABELS[newStage]})`);
    
    // Log the stage transition
    await logStageTransition(contactId, newStage, additionalData);
    
    return true;
  } catch (error) {
    console.error('❌ Error updating workflow stage:', error);
    return false;
  }
}

/**
 * Log a workflow stage transition for analytics
 * @param {string} contactId - The contact's Firestore ID
 * @param {number} newStage - The new workflow stage
 * @param {object} metadata - Additional metadata
 */
async function logStageTransition(contactId, newStage, metadata = {}) {
  try {
    await addDoc(collection(db, 'workflowTransitions'), {
      contactId,
      newStage,
      stageLabel: STAGE_LABELS[newStage],
      transitionedAt: serverTimestamp(),
      metadata,
    });
  } catch (error) {
    console.error('Error logging stage transition:', error);
    // Don't throw - logging should not break the main flow
  }
}

/**
 * Get the route for a contact's current workflow stage
 * @param {string} contactId - The contact's Firestore ID
 * @returns {Promise<string>} - The route path to redirect to
 */
export async function getWorkflowRouteForContact(contactId) {
  const stage = await getContactWorkflowStage(contactId);
  const baseRoute = STAGE_ROUTES[stage] || '/contacts-pipeline';
  
  console.log(`🛤️ Route for contact ${contactId} at stage ${stage}: ${baseRoute}`);
  
  // Add contactId to routes that need it
  const routesNeedingContactId = ['/select-plan', '/contract-signing', '/ach-authorization'];
  if (routesNeedingContactId.includes(baseRoute)) {
    return `${baseRoute}/${contactId}`;
  }
  
  // For complete-enrollment, use query params
  if (baseRoute === '/complete-enrollment') {
    return `${baseRoute}?contactId=${contactId}&resume=true`;
  }
  
  return baseRoute;
}

/**
 * Check if a contact can advance to the next stage
 * @param {string} contactId - The contact's Firestore ID
 * @param {number} targetStage - The stage to advance to
 * @returns {Promise<{canAdvance: boolean, reason: string, missingData: array}>}
 */
export async function canAdvanceToStage(contactId, targetStage) {
  const currentStage = await getContactWorkflowStage(contactId);
  
  // Can only advance by 1 stage at a time (or stay at same stage)
  if (targetStage > currentStage + 1) {
    return {
      canAdvance: false,
      reason: `Cannot skip stages. Current: ${currentStage} (${STAGE_LABELS[currentStage]}), Target: ${targetStage} (${STAGE_LABELS[targetStage]})`,
      missingData: [],
    };
  }
  
  // Get contact data to check requirements
  const contactRef = doc(db, 'contacts', contactId);
  const contactSnap = await getDoc(contactRef);
  
  if (!contactSnap.exists()) {
    return {
      canAdvance: false,
      reason: 'Contact not found',
      missingData: ['contact'],
    };
  }
  
  const data = contactSnap.data();
  const missingData = [];
  
  // Check stage-specific requirements
  switch (targetStage) {
    case WORKFLOW_STAGES.WELCOME_EMAIL_SENT:
      if (!data.email) missingData.push('email');
      break;
      
    case WORKFLOW_STAGES.IDIQ_ENROLLMENT_STARTED:
      if (!data.email) missingData.push('email');
      if (!data.firstName) missingData.push('firstName');
      if (!data.lastName) missingData.push('lastName');
      break;
      
    case WORKFLOW_STAGES.IDIQ_ENROLLMENT_COMPLETE:
      if (!data.idiqMemberId) missingData.push('idiqMemberId');
      break;
      
    case WORKFLOW_STAGES.CREDIT_REPORT_PULLED:
      if (!data.creditReportId) missingData.push('creditReportId');
      break;
      
    case WORKFLOW_STAGES.AI_ANALYSIS_COMPLETE:
      if (!data.aiAnalysisId) missingData.push('aiAnalysisId');
      break;
      
    case WORKFLOW_STAGES.SERVICE_PLAN_SELECTED:
      if (!data.selectedPlanId) missingData.push('selectedPlanId');
      break;
      
    case WORKFLOW_STAGES.CONTRACT_GENERATED:
      if (!data.contractId) missingData.push('contractId');
      break;
      
    case WORKFLOW_STAGES.CONTRACT_SIGNED:
      if (!data.contractSignedAt) missingData.push('contractSignedAt');
      break;
      
    case WORKFLOW_STAGES.ACH_AUTHORIZED:
      if (!data.achAuthorizedAt) missingData.push('achAuthorizedAt');
      break;
      
    case WORKFLOW_STAGES.DISPUTE_LETTERS_CREATED:
      if (!data.disputeIds || data.disputeIds.length === 0) missingData.push('disputeIds');
      break;
      
    case WORKFLOW_STAGES.DISPUTES_FAXED:
      if (!data.disputesFaxedAt) missingData.push('disputesFaxedAt');
      break;
  }
  
  if (missingData.length > 0) {
    return {
      canAdvance: false,
      reason: `Missing required data: ${missingData.join(', ')}`,
      missingData,
    };
  }
  
  return {
    canAdvance: true,
    reason: 'All requirements met',
    missingData: [],
  };
}

/**
 * Generate a magic link for a contact to continue their workflow
 * @param {string} contactId - The contact's Firestore ID
 * @param {string} baseUrl - The base URL (defaults to current origin)
 * @returns {Promise<string>} - The magic link URL
 */
export async function generateContinueLink(contactId, baseUrl = null) {
  const route = await getWorkflowRouteForContact(contactId);
  const origin = baseUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://myclevercrm.com');
  
  const link = `${origin}${route}`;
  console.log(`🔗 Generated continue link for ${contactId}: ${link}`);
  
  return link;
}

/**
 * Get the next step in the workflow
 * @param {string} contactId - The contact's Firestore ID
 * @returns {Promise<{nextStage: number, nextStageLabel: string, nextRoute: string}>}
 */
export async function getNextWorkflowStep(contactId) {
  const currentStage = await getContactWorkflowStage(contactId);
  const nextStage = Math.min(currentStage + 1, WORKFLOW_STAGES.ACTIVE_CLIENT);
  
  return {
    currentStage,
    currentStageLabel: STAGE_LABELS[currentStage],
    nextStage,
    nextStageLabel: STAGE_LABELS[nextStage],
    nextRoute: await getWorkflowRouteForContact(contactId),
  };
}

/**
 * Get a summary of a contact's workflow progress
 * @param {string} contactId - The contact's Firestore ID
 * @returns {Promise<object>} - Workflow summary
 */
export async function getWorkflowSummary(contactId) {
  try {
    const contactRef = doc(db, 'contacts', contactId);
    const contactSnap = await getDoc(contactRef);
    
    if (!contactSnap.exists()) {
      return null;
    }
    
    const data = contactSnap.data();
    const currentStage = data.workflowStage || 0;
    const totalStages = Object.keys(WORKFLOW_STAGES).length;
    const progressPercent = Math.round((currentStage / (totalStages - 1)) * 100);
    
    return {
      contactId,
      contactName: `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Unknown',
      currentStage,
      currentStageLabel: STAGE_LABELS[currentStage],
      totalStages,
      progressPercent,
      status: data.status || 'contact',
      workflowHistory: data.workflowHistory || {},
      nextStep: STAGE_LABELS[Math.min(currentStage + 1, WORKFLOW_STAGES.ACTIVE_CLIENT)],
      isComplete: currentStage >= WORKFLOW_STAGES.ACTIVE_CLIENT,
      isClient: data.status === 'client',
    };
  } catch (error) {
    console.error('Error getting workflow summary:', error);
    return null;
  }
}

// ============================================================================
// BATCH OPERATIONS (for admin tools)
// ============================================================================

/**
 * Get all contacts at a specific workflow stage
 * @param {number} stage - The workflow stage to filter by
 * @returns {Promise<array>} - Array of contacts at that stage
 */
export async function getContactsAtStage(stage) {
  // This would use a Firestore query - implement based on your needs
  console.log(`📊 Getting contacts at stage ${stage}`);
  // TODO: Implement query
  return [];
}

/**
 * Calculate workflow metrics
 * @returns {Promise<object>} - Workflow metrics
 */
export async function calculateWorkflowMetrics() {
  // This would calculate conversion rates, avg time per stage, etc.
  console.log('📈 Calculating workflow metrics');
  // TODO: Implement metrics calculation
  return {
    totalContacts: 0,
    conversionRate: 0,
    avgTimeToClient: 0,
  };
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  // Constants
  WORKFLOW_STAGES,
  STAGE_ROUTES,
  STAGE_LABELS,
  
  // Core functions
  getContactWorkflowStage,
  updateContactWorkflowStage,
  getWorkflowRouteForContact,
  canAdvanceToStage,
  generateContinueLink,
  getNextWorkflowStep,
  getWorkflowSummary,
  
  // Batch operations
  getContactsAtStage,
  calculateWorkflowMetrics,
};