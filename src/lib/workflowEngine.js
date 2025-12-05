// ============================================================================
// WORKFLOW ENGINE - Core Execution System
// ============================================================================
// Path: /src/lib/workflowEngine.js
//
// This is the heart of the Speedy Credit Repair workflow system. It handles:
// - Workflow execution (step-by-step and full automation)
// - Test mode support (for WorkflowTestingSimulator)
// - IDIQ enforcement and lapse handling
// - AI-powered decision making
// - Event injection for testing
// - State management and persistence
//
// IMPORTANT: This file integrates with:
// - Firebase Cloud Functions (server-side execution)
// - AI services (GPT-4 for recommendations)
// - IDIQ API (credit report retrieval)
// - Email system (workflow-triggered emails)
//
// Last updated: December 2024
// Owner: Christopher - Speedy Credit Repair
// ============================================================================

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../firebase';
import { SERVICE_PLANS, IDIQ_CONFIG } from '../config/servicePlans';

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Workflow execution status
 */
export const WORKFLOW_STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
};

/**
 * Workflow step types
 */
export const STEP_TYPES = {
  AI_ANALYSIS: 'ai_analysis',
  ROLE_ASSIGNMENT: 'role_assignment',
  EMAIL_SEND: 'email_send',
  SMS_SEND: 'sms_send',
  TASK_CREATE: 'task_create',
  WAIT: 'wait',
  DELAY: 'delay',
  CONDITIONAL_BRANCH: 'conditional_branch',
  IDIQ_ENROLLMENT: 'idiq_enrollment',
  IDIQ_CHECK: 'idiq_check',
  SERVICE_RECOMMENDATION: 'service_recommendation',
  UPDATE_CONTACT: 'update_contact',
  UPDATE_LEAD_SCORE: 'update_lead_score',
  AFFILIATE_RECOMMENDATION: 'affiliate_recommendation',
  WEBHOOK: 'webhook',
  CUSTOM: 'custom'
};

/**
 * Test mode speed settings
 */
export const TEST_SPEED = {
  REALTIME: 'realtime',     // Actual delays (hours, days)
  FAST: 'fast',             // 10x acceleration
  INSTANT: 'instant'        // No delays
};

/**
 * Contact action types (for simulation)
 */
export const CONTACT_ACTIONS = {
  EMAIL_OPEN: 'email_open',
  EMAIL_CLICK: 'email_click',
  FORM_SUBMIT: 'form_submit',
  CALL_BACK: 'call_back',
  UNSUBSCRIBE: 'unsubscribe',
  REPLY_EMAIL: 'reply_email',
  IGNORE: 'ignore'
};

// ============================================================================
// MAIN WORKFLOW EXECUTION
// ============================================================================

/**
 * Execute a complete workflow
 *
 * @param {string} workflowId - The workflow to execute
 * @param {string} contactId - The contact to run workflow for
 * @param {Object} options - Execution options
 * @param {boolean} options.testMode - Run in test mode (default: false)
 * @param {string} options.speed - Test speed (default: 'instant')
 * @param {number} options.pauseOnStep - Pause at specific step (default: null)
 * @param {string} options.executionId - Resume existing execution (default: null)
 * @returns {Promise<Object>} Execution result
 */
export async function executeWorkflow(workflowId, contactId, options = {}) {
  const {
    testMode = false,
    speed = TEST_SPEED.INSTANT,
    pauseOnStep = null,
    executionId = null
  } = options;

  console.log(`[WorkflowEngine] Executing workflow: ${workflowId} for contact: ${contactId}`);
  console.log(`[WorkflowEngine] Test mode: ${testMode}, Speed: ${speed}`);

  try {
    // Get workflow configuration
    const workflowRef = doc(db, 'workflows', workflowId);
    const workflowSnap = await getDoc(workflowRef);

    if (!workflowSnap.exists()) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    const workflow = { id: workflowSnap.id, ...workflowSnap.data() };

    // Get contact data
    const contactRef = doc(db, 'contacts', contactId);
    const contactSnap = await getDoc(contactRef);

    if (!contactSnap.exists()) {
      throw new Error(`Contact not found: ${contactId}`);
    }

    const contact = { id: contactSnap.id, ...contactSnap.data() };

    // Create or resume execution record
    let execution;
    if (executionId) {
      // Resume existing execution
      const executionRef = doc(db, 'workflowExecutions', executionId);
      const executionSnap = await getDoc(executionRef);
      execution = { id: executionSnap.id, ...executionSnap.data() };

      console.log(`[WorkflowEngine] Resuming execution: ${executionId} from step ${execution.currentStepIndex}`);
    } else {
      // Create new execution
      const executionData = {
        workflowId,
        contactId,
        status: WORKFLOW_STATUS.RUNNING,
        currentStep: null,
        currentStepIndex: 0,
        testMode,
        speed,
        executionLog: [],
        startedAt: serverTimestamp(),
        completedAt: null,
        pausedAt: null,
        metadata: {
          totalSteps: workflow.steps.length,
          completedSteps: 0,
          failedSteps: 0,
          aiDecisions: 0,
          emailsSent: 0,
          tasksCreated: 0
        }
      };

      const executionRef = await addDoc(collection(db, 'workflowExecutions'), executionData);
      execution = { id: executionRef.id, ...executionData };

      console.log(`[WorkflowEngine] Created new execution: ${execution.id}`);
    }

    // Execute steps sequentially
    for (let i = execution.currentStepIndex; i < workflow.steps.length; i++) {
      const step = workflow.steps[i];

      console.log(`[WorkflowEngine] Executing step ${i + 1}/${workflow.steps.length}: ${step.name} (${step.type})`);

      // Check if we should pause at this step
      if (pauseOnStep !== null && i === pauseOnStep) {
        console.log(`[WorkflowEngine] Pausing at step ${i + 1} as requested`);
        await updateExecutionStatus(execution.id, WORKFLOW_STATUS.PAUSED, i);
        return {
          success: true,
          paused: true,
          executionId: execution.id,
          currentStep: i,
          message: `Paused at step ${i + 1}: ${step.name}`
        };
      }

      // Execute the step
      const stepResult = await executeStep(
        step,
        contact,
        execution,
        testMode,
        speed
      );

      // Log step execution
      await logStepExecution(execution.id, step, stepResult, i);

      // Update execution state
      await updateDoc(doc(db, 'workflowExecutions', execution.id), {
        currentStep: step.id,
        currentStepIndex: i + 1,
        [`metadata.completedSteps`]: i + 1
      });

      // Handle step result
      if (!stepResult.success) {
        console.error(`[WorkflowEngine] Step failed: ${step.name}`, stepResult.error);
        await updateExecutionStatus(execution.id, WORKFLOW_STATUS.FAILED, i);

        return {
          success: false,
          executionId: execution.id,
          failedStep: i,
          error: stepResult.error
        };
      }

      // Handle conditional branching
      if (step.type === STEP_TYPES.CONDITIONAL_BRANCH && stepResult.nextStepId) {
        // Find the index of the next step
        const nextStepIndex = workflow.steps.findIndex(s => s.id === stepResult.nextStepId);
        if (nextStepIndex !== -1) {
          console.log(`[WorkflowEngine] Branching to step: ${stepResult.nextStepId}`);
          i = nextStepIndex - 1; // -1 because loop will increment
        }
      }

      // Handle wait/delay steps
      if (step.type === STEP_TYPES.WAIT || step.type === STEP_TYPES.DELAY) {
        const delayMs = calculateDelay(step.config.duration, speed, testMode);
        if (delayMs > 0) {
          console.log(`[WorkflowEngine] Waiting ${delayMs}ms (${step.config.duration} at ${speed} speed)`);
          await sleep(delayMs);
        }
      }
    }

    // Workflow completed successfully
    console.log(`[WorkflowEngine] Workflow completed successfully: ${workflowId}`);
    await updateExecutionStatus(execution.id, WORKFLOW_STATUS.COMPLETED, workflow.steps.length);

    return {
      success: true,
      executionId: execution.id,
      message: 'Workflow completed successfully'
    };

  } catch (error) {
    console.error('[WorkflowEngine] Workflow execution failed:', error);
    throw error;
  }
}

/**
 * Execute a single workflow step
 *
 * @param {Object} step - The step configuration
 * @param {Object} contact - The contact data
 * @param {Object} execution - The execution record
 * @param {boolean} testMode - Test mode flag
 * @param {string} speed - Test speed setting
 * @returns {Promise<Object>} Step result
 */
export async function executeStep(step, contact, execution, testMode, speed) {
  console.log(`[WorkflowEngine] Executing step type: ${step.type}`);

  try {
    let result;

    switch (step.type) {
      case STEP_TYPES.AI_ANALYSIS:
        result = await executeAIAnalysis(step, contact, execution, testMode);
        break;

      case STEP_TYPES.ROLE_ASSIGNMENT:
        result = await executeRoleAssignment(step, contact, execution, testMode);
        break;

      case STEP_TYPES.EMAIL_SEND:
        result = await executeEmailSend(step, contact, execution, testMode);
        break;

      case STEP_TYPES.SMS_SEND:
        result = await executeSMSSend(step, contact, execution, testMode);
        break;

      case STEP_TYPES.TASK_CREATE:
        result = await executeTaskCreate(step, contact, execution, testMode);
        break;

      case STEP_TYPES.WAIT:
      case STEP_TYPES.DELAY:
        result = await executeWait(step, contact, execution, testMode, speed);
        break;

      case STEP_TYPES.CONDITIONAL_BRANCH:
        result = await executeConditionalBranch(step, contact, execution, testMode);
        break;

      case STEP_TYPES.IDIQ_ENROLLMENT:
        result = await executeIDIQEnrollment(step, contact, execution, testMode);
        break;

      case STEP_TYPES.IDIQ_CHECK:
        result = await executeIDIQCheck(step, contact, execution, testMode);
        break;

      case STEP_TYPES.SERVICE_RECOMMENDATION:
        result = await executeServiceRecommendation(step, contact, execution, testMode);
        break;

      case STEP_TYPES.UPDATE_CONTACT:
        result = await executeUpdateContact(step, contact, execution, testMode);
        break;

      case STEP_TYPES.UPDATE_LEAD_SCORE:
        result = await executeUpdateLeadScore(step, contact, execution, testMode);
        break;

      case STEP_TYPES.AFFILIATE_RECOMMENDATION:
        result = await executeAffiliateRecommendation(step, contact, execution, testMode);
        break;

      default:
        result = {
          success: false,
          error: `Unknown step type: ${step.type}`
        };
    }

    return result;

  } catch (error) {
    console.error(`[WorkflowEngine] Step execution failed:`, error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================================================
// STEP EXECUTION HANDLERS
// ============================================================================

/**
 * Execute AI analysis step
 */
async function executeAIAnalysis(step, contact, execution, testMode) {
  console.log('[WorkflowEngine] Executing AI analysis...');

  try {
    // Call Firebase Cloud Function for AI analysis
    const analyzeContact = httpsCallable(functions, 'aiAnalyzeContact');
    const result = await analyzeContact({
      contactId: contact.id,
      returnReasoning: testMode, // Include detailed reasoning in test mode
      testMode
    });

    const analysisData = result.data;

    console.log(`[WorkflowEngine] AI Analysis complete. Lead score: ${analysisData.leadScore}, Temperature: ${analysisData.temperature}`);

    // Update contact with analysis results
    if (!testMode) {
      await updateDoc(doc(db, 'contacts', contact.id), {
        leadScore: analysisData.leadScore,
        leadScoreReasoning: analysisData.reasoning || '',
        leadTemperature: analysisData.temperature,
        temperatureReasoning: analysisData.temperatureReasoning || '',
        aiContext: analysisData.context || '',
        updatedAt: serverTimestamp()
      });
    }

    return {
      success: true,
      data: analysisData,
      aiReasoning: analysisData.reasoning
    };

  } catch (error) {
    console.error('[WorkflowEngine] AI analysis failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Execute role assignment step
 */
async function executeRoleAssignment(step, contact, execution, testMode) {
  console.log('[WorkflowEngine] Executing role assignment...');

  try {
    // Call Firebase Cloud Function for AI role suggestion
    const assignRoles = httpsCallable(functions, 'aiAssignContactRoles');
    const result = await assignRoles({
      contactId: contact.id,
      returnReasoning: testMode,
      testMode
    });

    const rolesData = result.data;

    console.log(`[WorkflowEngine] Roles assigned: ${rolesData.roles.join(', ')}`);

    // Update contact with new roles
    if (!testMode) {
      await updateDoc(doc(db, 'contacts', contact.id), {
        roles: rolesData.roles,
        updatedAt: serverTimestamp()
      });
    }

    return {
      success: true,
      data: rolesData,
      aiReasoning: rolesData.reasoning
    };

  } catch (error) {
    console.error('[WorkflowEngine] Role assignment failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Execute email send step
 */
async function executeEmailSend(step, contact, execution, testMode) {
  console.log(`[WorkflowEngine] Sending email: ${step.config.template}`);

  try {
    // Call Firebase Cloud Function to send email
    const sendEmail = httpsCallable(functions, 'sendWorkflowEmail');
    const result = await sendEmail({
      contactId: contact.id,
      template: step.config.template,
      variables: step.config.variables || {},
      testMode
    });

    const emailData = result.data;

    console.log(`[WorkflowEngine] Email sent successfully to: ${contact.email}`);

    // Update execution metadata
    if (!testMode) {
      await updateDoc(doc(db, 'workflowExecutions', execution.id), {
        'metadata.emailsSent': (execution.metadata.emailsSent || 0) + 1
      });
    }

    return {
      success: true,
      data: emailData,
      contactView: emailData.htmlContent // What contact sees
    };

  } catch (error) {
    console.error('[WorkflowEngine] Email send failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Execute SMS send step
 */
async function executeSMSSend(step, contact, execution, testMode) {
  console.log(`[WorkflowEngine] Sending SMS to: ${contact.phone}`);

  try {
    if (!contact.phone) {
      return {
        success: false,
        error: 'Contact has no phone number'
      };
    }

    // Call Firebase Cloud Function to send SMS
    const sendSMS = httpsCallable(functions, 'sendWorkflowSMS');
    const result = await sendSMS({
      contactId: contact.id,
      phone: contact.phone,
      message: step.config.message,
      testMode
    });

    const smsData = result.data;

    console.log('[WorkflowEngine] SMS sent successfully');

    return {
      success: true,
      data: smsData,
      contactView: step.config.message
    };

  } catch (error) {
    console.error('[WorkflowEngine] SMS send failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Execute task creation step
 */
async function executeTaskCreate(step, contact, execution, testMode) {
  console.log(`[WorkflowEngine] Creating task: ${step.config.title}`);

  try {
    const taskData = {
      title: interpolateVariables(step.config.title, contact),
      description: interpolateVariables(step.config.description || '', contact),
      assignedTo: step.config.assignTo,
      contactId: contact.id,
      workflowId: execution.workflowId,
      executionId: execution.id,
      dueDate: calculateDueDate(step.config.dueIn),
      priority: step.config.priority || 'medium',
      status: 'pending',
      testMode,
      createdAt: serverTimestamp()
    };

    let taskId;
    if (!testMode) {
      const taskRef = await addDoc(collection(db, 'tasks'), taskData);
      taskId = taskRef.id;

      // Update execution metadata
      await updateDoc(doc(db, 'workflowExecutions', execution.id), {
        'metadata.tasksCreated': (execution.metadata.tasksCreated || 0) + 1
      });
    } else {
      taskId = 'test_task_' + Date.now();
    }

    console.log(`[WorkflowEngine] Task created: ${taskId}`);

    return {
      success: true,
      data: { taskId, ...taskData }
    };

  } catch (error) {
    console.error('[WorkflowEngine] Task creation failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Execute wait/delay step
 */
async function executeWait(step, contact, execution, testMode, speed) {
  const duration = step.config.duration; // e.g., "24 hours", "5 minutes"
  const delayMs = calculateDelay(duration, speed, testMode);

  console.log(`[WorkflowEngine] Waiting ${duration} (${delayMs}ms at ${speed} speed)`);

  return {
    success: true,
    data: {
      duration,
      actualDelayMs: delayMs,
      speed
    }
  };
}

/**
 * Execute conditional branch step
 */
async function executeConditionalBranch(step, contact, execution, testMode) {
  console.log('[WorkflowEngine] Evaluating conditional branch...');

  try {
    const { conditions, branches } = step.config;

    // Evaluate conditions
    for (const branch of branches) {
      const conditionMet = await evaluateCondition(branch.condition, contact, execution);

      if (conditionMet) {
        console.log(`[WorkflowEngine] Branch condition met: ${branch.label}`);
        return {
          success: true,
          nextStepId: branch.stepId,
          data: {
            branchTaken: branch.label,
            condition: branch.condition
          }
        };
      }
    }

    // No conditions met, use default branch if available
    const defaultBranch = branches.find(b => b.isDefault);
    if (defaultBranch) {
      console.log('[WorkflowEngine] Using default branch');
      return {
        success: true,
        nextStepId: defaultBranch.stepId,
        data: {
          branchTaken: 'default',
          condition: 'none met'
        }
      };
    }

    // No branch taken
    console.log('[WorkflowEngine] No branch conditions met, continuing to next step');
    return {
      success: true,
      nextStepId: null
    };

  } catch (error) {
    console.error('[WorkflowEngine] Conditional branch failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Execute IDIQ enrollment step
 */
async function executeIDIQEnrollment(step, contact, execution, testMode) {
  console.log('[WorkflowEngine] Executing IDIQ enrollment...');

  try {
    // Call Firebase Cloud Function for IDIQ enrollment
    const enrollIDIQ = httpsCallable(functions, 'enrollIDIQ');
    const result = await enrollIDIQ({
      contactId: contact.id,
      email: contact.email,
      phone: contact.phone,
      firstName: contact.firstName,
      lastName: contact.lastName,
      testMode
    });

    const enrollmentData = result.data;

    console.log(`[WorkflowEngine] IDIQ enrollment successful: ${enrollmentData.memberId}`);

    // Update contact with IDIQ info
    if (!testMode) {
      await updateDoc(doc(db, 'contacts', contact.id), {
        idiqMemberId: enrollmentData.memberId,
        idiqEnrolled: true,
        idiqEnrollmentDate: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }

    return {
      success: true,
      data: enrollmentData
    };

  } catch (error) {
    console.error('[WorkflowEngine] IDIQ enrollment failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Execute IDIQ status check step
 */
async function executeIDIQCheck(step, contact, execution, testMode) {
  console.log('[WorkflowEngine] Checking IDIQ status...');

  try {
    // Call Firebase Cloud Function to check IDIQ status
    const checkIDIQ = httpsCallable(functions, 'checkIDIQStatus');
    const result = await checkIDIQ({
      contactId: contact.id,
      testMode
    });

    const statusData = result.data;

    console.log(`[WorkflowEngine] IDIQ status: ${statusData.status}`);

    // If IDIQ has lapsed, trigger lapse handling
    if (statusData.status === 'lapsed' && !testMode) {
      await handleIDIQLapse(contact.id, 0); // Start tier 1 response
    }

    return {
      success: true,
      data: statusData
    };

  } catch (error) {
    console.error('[WorkflowEngine] IDIQ check failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Execute service recommendation step
 */
async function executeServiceRecommendation(step, contact, execution, testMode) {
  console.log('[WorkflowEngine] Generating service recommendation...');

  try {
    // Call Firebase Cloud Function for service recommendation
    const recommendPlan = httpsCallable(functions, 'recommendServicePlan');
    const result = await recommendPlan({
      contactId: contact.id,
      returnReasoning: testMode,
      testMode
    });

    const recommendationData = result.data;

    console.log(`[WorkflowEngine] Service recommended: ${recommendationData.recommendedPlanId} (${recommendationData.confidence}% confidence)`);

    // Update execution metadata
    if (!testMode) {
      await updateDoc(doc(db, 'workflowExecutions', execution.id), {
        'metadata.aiDecisions': (execution.metadata.aiDecisions || 0) + 1
      });
    }

    return {
      success: true,
      data: recommendationData,
      aiReasoning: recommendationData.reasoning
    };

  } catch (error) {
    console.error('[WorkflowEngine] Service recommendation failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Execute contact update step
 */
async function executeUpdateContact(step, contact, execution, testMode) {
  console.log('[WorkflowEngine] Updating contact...');

  try {
    const updates = step.config.updates;

    if (!testMode) {
      await updateDoc(doc(db, 'contacts', contact.id), {
        ...updates,
        updatedAt: serverTimestamp()
      });
    }

    console.log('[WorkflowEngine] Contact updated successfully');

    return {
      success: true,
      data: updates
    };

  } catch (error) {
    console.error('[WorkflowEngine] Contact update failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Execute lead score update step
 */
async function executeUpdateLeadScore(step, contact, execution, testMode) {
  console.log('[WorkflowEngine] Updating lead score...');

  try {
    // Call Firebase Cloud Function to calculate lead score
    const calculateScore = httpsCallable(functions, 'calculateAILeadScore');
    const result = await calculateScore({
      contactId: contact.id,
      returnReasoning: testMode,
      testMode
    });

    const scoreData = result.data;

    console.log(`[WorkflowEngine] Lead score updated: ${scoreData.score}/10`);

    // Update contact
    if (!testMode) {
      await updateDoc(doc(db, 'contacts', contact.id), {
        leadScore: scoreData.score,
        leadScoreReasoning: scoreData.reasoning || '',
        updatedAt: serverTimestamp()
      });
    }

    return {
      success: true,
      data: scoreData,
      aiReasoning: scoreData.reasoning
    };

  } catch (error) {
    console.error('[WorkflowEngine] Lead score update failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Execute affiliate recommendation step
 */
async function executeAffiliateRecommendation(step, contact, execution, testMode) {
  console.log('[WorkflowEngine] Generating affiliate recommendations...');

  try {
    // Call Firebase Cloud Function for affiliate recommendations
    const getRecommendations = httpsCallable(functions, 'getAffiliateRecommendations');
    const result = await getRecommendations({
      contactId: contact.id,
      testMode
    });

    const recommendations = result.data;

    console.log(`[WorkflowEngine] Generated ${recommendations.products.length} affiliate recommendations`);

    return {
      success: true,
      data: recommendations
    };

  } catch (error) {
    console.error('[WorkflowEngine] Affiliate recommendation failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================================================
// IDIQ LAPSE HANDLING (3-TIER RESPONSE)
// ============================================================================

/**
 * Handle IDIQ subscription lapse with 3-tier response
 *
 * @param {string} contactId - The contact ID
 * @param {number} tier - Response tier (0, 1, or 2 for tiers 1, 2, 3)
 * @returns {Promise<void>}
 */
export async function handleIDIQLapse(contactId, tier = 0) {
  console.log(`[WorkflowEngine] Handling IDIQ lapse for contact: ${contactId}, tier: ${tier + 1}`);

  try {
    const contact = await getDoc(doc(db, 'contacts', contactId));
    if (!contact.exists()) {
      throw new Error(`Contact not found: ${contactId}`);
    }

    const contactData = { id: contact.id, ...contact.data() };
    const lapseConfig = IDIQ_CONFIG.lapseHandling;

    switch (tier) {
      case 0: // TIER 1: Immediate email + SMS
        console.log('[WorkflowEngine] Executing Tier 1 IDIQ lapse response (immediate)');

        // Send urgent email
        const sendEmail1 = httpsCallable(functions, 'sendWorkflowEmail');
        await sendEmail1({
          contactId,
          template: lapseConfig.tier1.emailTemplate,
          variables: {
            firstName: contactData.firstName,
            idiqLink: 'https://identityiq.com/upgrade' // Your affiliate link
          }
        });

        // Send SMS
        if (contactData.phone) {
          const sendSMS1 = httpsCallable(functions, 'sendWorkflowSMS');
          await sendSMS1({
            contactId,
            phone: contactData.phone,
            template: lapseConfig.tier1.smsTemplate
          });
        }

        // Schedule tier 2 response in 48 hours
        await scheduleIDIQLapseTier(contactId, 1, 48);
        break;

      case 1: // TIER 2: Second notice + phone call
        console.log('[WorkflowEngine] Executing Tier 2 IDIQ lapse response (48 hours)');

        // Check if still lapsed
        const checkStatus = httpsCallable(functions, 'checkIDIQStatus');
        const statusResult = await checkStatus({ contactId });

        if (statusResult.data.status !== 'lapsed') {
          console.log('[WorkflowEngine] IDIQ reinstated, canceling tier 2 response');
          return;
        }

        // Send second notice
        const sendEmail2 = httpsCallable(functions, 'sendWorkflowEmail');
        await sendEmail2({
          contactId,
          template: lapseConfig.tier2.emailTemplate,
          variables: {
            firstName: contactData.firstName,
            daysLapsed: 2,
            idiqLink: 'https://identityiq.com/upgrade'
          }
        });

        // Schedule tier 3 response in another 48 hours
        await scheduleIDIQLapseTier(contactId, 2, 48);
        break;

      case 2: // TIER 3: Alert staff + pause service
        console.log('[WorkflowEngine] Executing Tier 3 IDIQ lapse response (96 hours - FINAL)');

        // Check if still lapsed
        const checkStatus3 = httpsCallable(functions, 'checkIDIQStatus');
        const statusResult3 = await checkStatus3({ contactId });

        if (statusResult3.data.status !== 'lapsed') {
          console.log('[WorkflowEngine] IDIQ reinstated, canceling tier 3 response');
          return;
        }

        // Create urgent task for Laurie
        await addDoc(collection(db, 'tasks'), {
          title: `URGENT - Client IDIQ Lapsed: ${contactData.firstName} ${contactData.lastName}`,
          description: `${contactData.firstName}'s IDIQ subscription has been lapsed for 4 days. Service must be paused. Contact them immediately to reinstate.`,
          assignedTo: 'laurie',
          contactId,
          priority: 'urgent',
          status: 'pending',
          createdAt: serverTimestamp()
        });

        // Pause service
        await updateDoc(doc(db, 'contacts', contactId), {
          status: 'paused_idiq_lapse',
          idiqLapseDate: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        // Send final email to client
        const sendEmail3 = httpsCallable(functions, 'sendWorkflowEmail');
        await sendEmail3({
          contactId,
          template: lapseConfig.tier3.emailTemplate,
          variables: {
            firstName: contactData.firstName,
            idiqLink: 'https://identityiq.com/upgrade'
          }
        });

        console.log('[WorkflowEngine] Service paused due to IDIQ lapse');
        break;

      default:
        console.error('[WorkflowEngine] Invalid IDIQ lapse tier:', tier);
    }

  } catch (error) {
    console.error('[WorkflowEngine] IDIQ lapse handling failed:', error);
    throw error;
  }
}

/**
 * Schedule IDIQ lapse tier response
 */
async function scheduleIDIQLapseTier(contactId, tier, delayHours) {
  // In production, this would use Firebase Cloud Scheduler or similar
  // For now, we'll create a scheduled task document
  await addDoc(collection(db, 'scheduledTasks'), {
    type: 'idiq_lapse_tier',
    contactId,
    tier,
    scheduledFor: new Date(Date.now() + delayHours * 60 * 60 * 1000),
    status: 'pending',
    createdAt: serverTimestamp()
  });

  console.log(`[WorkflowEngine] Scheduled IDIQ lapse tier ${tier + 1} in ${delayHours} hours`);
}

// ============================================================================
// TESTING SUPPORT FUNCTIONS
// ============================================================================

/**
 * Pause a running workflow
 */
export async function pauseWorkflow(executionId) {
  console.log(`[WorkflowEngine] Pausing workflow execution: ${executionId}`);

  await updateDoc(doc(db, 'workflowExecutions', executionId), {
    status: WORKFLOW_STATUS.PAUSED,
    pausedAt: serverTimestamp()
  });

  return { success: true, executionId };
}

/**
 * Resume a paused workflow
 */
export async function resumeWorkflow(executionId, fromStep = null) {
  console.log(`[WorkflowEngine] Resuming workflow execution: ${executionId}`);

  const executionRef = doc(db, 'workflowExecutions', executionId);
  const executionSnap = await getDoc(executionRef);

  if (!executionSnap.exists()) {
    throw new Error(`Execution not found: ${executionId}`);
  }

  const execution = { id: executionSnap.id, ...executionSnap.data() };

  // Update status to running
  await updateDoc(executionRef, {
    status: WORKFLOW_STATUS.RUNNING,
    currentStepIndex: fromStep !== null ? fromStep : execution.currentStepIndex,
    pausedAt: null
  });

  // Continue execution
  return await executeWorkflow(
    execution.workflowId,
    execution.contactId,
    {
      testMode: execution.testMode,
      speed: execution.speed,
      executionId
    }
  );
}

/**
 * Get current workflow execution state (for UI display)
 */
export async function getExecutionState(executionId) {
  console.log(`[WorkflowEngine] Getting execution state: ${executionId}`);

  const executionRef = doc(db, 'workflowExecutions', executionId);
  const executionSnap = await getDoc(executionRef);

  if (!executionSnap.exists()) {
    throw new Error(`Execution not found: ${executionId}`);
  }

  const execution = { id: executionSnap.id, ...executionSnap.data() };

  // Get workflow config
  const workflowRef = doc(db, 'workflows', execution.workflowId);
  const workflowSnap = await getDoc(workflowRef);
  const workflow = { id: workflowSnap.id, ...workflowSnap.data() };

  // Get contact data
  const contactRef = doc(db, 'contacts', execution.contactId);
  const contactSnap = await getDoc(contactRef);
  const contact = { id: contactSnap.id, ...contactSnap.data() };

  return {
    execution,
    workflow,
    contact,
    currentStep: workflow.steps[execution.currentStepIndex],
    progress: {
      completed: execution.currentStepIndex,
      total: workflow.steps.length,
      percentage: Math.round((execution.currentStepIndex / workflow.steps.length) * 100)
    }
  };
}

/**
 * Inject a test event into running workflow (for simulation)
 */
export async function injectTestEvent(executionId, eventType, eventData = {}) {
  console.log(`[WorkflowEngine] Injecting test event: ${eventType}`);

  const executionRef = doc(db, 'workflowExecutions', executionId);

  // Log the injected event
  const logEntry = {
    timestamp: new Date(),
    type: 'test_event_injected',
    eventType,
    eventData,
    stepIndex: null
  };

  await updateDoc(executionRef, {
    executionLog: [...(await getDoc(executionRef)).data().executionLog, logEntry]
  });

  // Handle the event based on type
  switch (eventType) {
    case CONTACT_ACTIONS.EMAIL_OPEN:
      console.log('[WorkflowEngine] Simulating: Contact opened email');
      break;

    case CONTACT_ACTIONS.EMAIL_CLICK:
      console.log('[WorkflowEngine] Simulating: Contact clicked email link');
      break;

    case CONTACT_ACTIONS.FORM_SUBMIT:
      console.log('[WorkflowEngine] Simulating: Contact submitted form');
      break;

    case CONTACT_ACTIONS.CALL_BACK:
      console.log('[WorkflowEngine] Simulating: Contact called back');
      break;

    default:
      console.log(`[WorkflowEngine] Unknown event type: ${eventType}`);
  }

  return { success: true, eventType, logged: true };
}

/**
 * Simulate a contact action (for testing UI)
 */
export async function simulateContactAction(executionId, action, actionData = {}) {
  console.log(`[WorkflowEngine] Simulating contact action: ${action}`);

  return await injectTestEvent(executionId, action, actionData);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Update execution status
 */
async function updateExecutionStatus(executionId, status, currentStep) {
  const updates = {
    status,
    currentStepIndex: currentStep
  };

  if (status === WORKFLOW_STATUS.COMPLETED) {
    updates.completedAt = serverTimestamp();
  } else if (status === WORKFLOW_STATUS.PAUSED) {
    updates.pausedAt = serverTimestamp();
  }

  await updateDoc(doc(db, 'workflowExecutions', executionId), updates);
}

/**
 * Log step execution to execution record
 */
async function logStepExecution(executionId, step, result, stepIndex) {
  const logEntry = {
    timestamp: new Date(),
    stepId: step.id,
    stepName: step.name,
    stepType: step.type,
    stepIndex,
    action: step.type,
    result: result.success ? 'success' : 'failed',
    data: result.data || null,
    error: result.error || null,
    aiReasoning: result.aiReasoning || null,
    contactView: result.contactView || null,
    duration: 0 // Could track actual execution time
  };

  const executionRef = doc(db, 'workflowExecutions', executionId);
  const executionSnap = await getDoc(executionRef);
  const currentLog = executionSnap.data().executionLog || [];

  await updateDoc(executionRef, {
    executionLog: [...currentLog, logEntry]
  });
}

/**
 * Calculate delay based on speed setting
 */
function calculateDelay(duration, speed, testMode) {
  if (!testMode || speed === TEST_SPEED.INSTANT) {
    return 0;
  }

  // Parse duration string (e.g., "24 hours", "5 minutes", "1 day")
  const match = duration.match(/(\d+)\s*(second|minute|hour|day|week)s?/i);
  if (!match) {
    console.warn(`[WorkflowEngine] Invalid duration format: ${duration}`);
    return 0;
  }

  const value = parseInt(match[1]);
  const unit = match[2].toLowerCase();

  // Convert to milliseconds
  let ms = 0;
  switch (unit) {
    case 'second':
      ms = value * 1000;
      break;
    case 'minute':
      ms = value * 60 * 1000;
      break;
    case 'hour':
      ms = value * 60 * 60 * 1000;
      break;
    case 'day':
      ms = value * 24 * 60 * 60 * 1000;
      break;
    case 'week':
      ms = value * 7 * 24 * 60 * 60 * 1000;
      break;
  }

  // Apply speed multiplier
  if (speed === TEST_SPEED.FAST) {
    ms = ms / 10; // 10x faster
  }

  return ms;
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Interpolate variables in string templates
 */
function interpolateVariables(template, contact) {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return contact[key] || match;
  });
}

/**
 * Calculate due date from duration string
 */
function calculateDueDate(dueIn) {
  const match = dueIn.match(/(\d+)\s*(second|minute|hour|day|week)s?/i);
  if (!match) {
    return new Date();
  }

  const value = parseInt(match[1]);
  const unit = match[2].toLowerCase();

  const now = new Date();
  switch (unit) {
    case 'second':
      return new Date(now.getTime() + value * 1000);
    case 'minute':
      return new Date(now.getTime() + value * 60 * 1000);
    case 'hour':
      return new Date(now.getTime() + value * 60 * 60 * 1000);
    case 'day':
      return new Date(now.getTime() + value * 24 * 60 * 60 * 1000);
    case 'week':
      return new Date(now.getTime() + value * 7 * 24 * 60 * 60 * 1000);
    default:
      return new Date();
  }
}

/**
 * Evaluate conditional statement
 */
async function evaluateCondition(condition, contact, execution) {
  // Condition format: "field operator value"
  // Examples: "leadScore > 7", "status == 'hot'", "leadTemperature in ['warm', 'hot']"

  console.log(`[WorkflowEngine] Evaluating condition: ${condition}`);

  try {
    // Simple evaluation (in production, use a proper expression parser)
    const conditionFn = new Function('contact', 'execution', `
      with(contact) {
        return ${condition};
      }
    `);

    return conditionFn(contact, execution);

  } catch (error) {
    console.error('[WorkflowEngine] Condition evaluation failed:', error);
    return false;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  executeWorkflow,
  executeStep,
  pauseWorkflow,
  resumeWorkflow,
  getExecutionState,
  injectTestEvent,
  simulateContactAction,
  handleIDIQLapse,
  WORKFLOW_STATUS,
  STEP_TYPES,
  TEST_SPEED,
  CONTACT_ACTIONS
};
