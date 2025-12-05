/**
 * AI NATURAL LANGUAGE WORKFLOW BUILDER
 *
 * Purpose:
 * Allows Christopher to create workflows by describing them in plain English,
 * rather than using complex visual builders or writing code.
 *
 * What It Does:
 * - Interprets natural language descriptions of workflows
 * - Converts conversational instructions into structured workflow steps
 * - Asks clarifying questions when ambiguous
 * - Suggests best practices and compliance checks
 * - Generates complete, ready-to-use workflows
 * - Allows iterative refinement ("actually, send that email 3 days later instead")
 *
 * Why It's Important:
 * - No technical knowledge needed to create workflows
 * - Dramatically faster than visual workflow builders
 * - Natural way to express business logic
 * - AI ensures workflows follow best practices
 * - Reduces errors from misconfigured steps
 *
 * Example Conversations:
 *
 * User: "Create a workflow for new Standard tier clients"
 * AI: "I'll create a Standard tier onboarding workflow. What should happen first?"
 *
 * User: "Send a welcome email, then wait 2 days, then offer IDIQ credit report"
 * AI: "Got it. After IDIQ offer, what happens if they sign up vs don't sign up?"
 *
 * User: "If they sign up, send them instructions. If not, remind them after 3 days."
 * AI: "Perfect! Should we also assign them to Laurie for follow-up?"
 *
 * User: "Yes, and score them as a lead"
 * AI: "Great! Here's your workflow: [shows 7-step workflow]. Want to test it?"
 *
 * User: "Actually, change the wait to 3 days instead of 2"
 * AI: "Updated! Step 2 now waits 3 days. Anything else?"
 *
 * User: "No, save it"
 * AI: "Workflow saved! Want to activate it for all new Standard tier contacts?"
 *
 * Created: 2025-12-05
 * Part of: Speedy Credit Repair AI Workflow System
 */

import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

// ============================================================================
// CONVERSATION STATE
// ============================================================================

/**
 * Tracks the current state of the workflow building conversation
 */
class WorkflowBuildingSession {
  constructor() {
    this.workflowId = null;
    this.workflowName = null;
    this.description = null;
    this.steps = [];
    this.currentStepIndex = null;
    this.conversationHistory = [];
    this.pendingQuestions = [];
    this.context = {};
    this.isComplete = false;
  }

  /**
   * Adds a message to conversation history
   */
  addMessage(role, content, metadata = {}) {
    this.conversationHistory.push({
      role,
      content,
      metadata,
      timestamp: new Date()
    });
  }

  /**
   * Adds a step to the workflow
   */
  addStep(step) {
    this.steps.push({
      ...step,
      id: `step_${this.steps.length}`,
      createdAt: new Date()
    });

    return this.steps.length - 1;
  }

  /**
   * Updates an existing step
   */
  updateStep(stepIndex, updates) {
    if (stepIndex >= 0 && stepIndex < this.steps.length) {
      this.steps[stepIndex] = {
        ...this.steps[stepIndex],
        ...updates,
        updatedAt: new Date()
      };
    }
  }

  /**
   * Removes a step
   */
  removeStep(stepIndex) {
    if (stepIndex >= 0 && stepIndex < this.steps.length) {
      this.steps.splice(stepIndex, 1);

      // Re-index remaining steps
      this.steps.forEach((step, index) => {
        step.id = `step_${index}`;
      });
    }
  }

  /**
   * Gets current workflow structure
   */
  getWorkflow() {
    return {
      id: this.workflowId,
      name: this.workflowName,
      description: this.description,
      steps: this.steps,
      metadata: {
        createdVia: 'natural_language_builder',
        conversationHistory: this.conversationHistory,
        createdAt: new Date()
      }
    };
  }
}

// ============================================================================
// MAIN BUILDER CLASS
// ============================================================================

/**
 * Main Natural Language Workflow Builder
 */
export class NLWorkflowBuilder {
  constructor() {
    this.session = null;
  }

  /**
   * Starts a new workflow building session
   *
   * @param {string} initialPrompt - User's initial description
   * @returns {Object} AI's first response
   */
  async startSession(initialPrompt) {
    this.session = new WorkflowBuildingSession();
    this.session.addMessage('user', initialPrompt);

    console.log(`[NLWorkflowBuilder] Starting new session: "${initialPrompt}"`);

    // Send to GPT-4 for interpretation
    const response = await this.processMessage(initialPrompt);

    this.session.addMessage('assistant', response.message, response.metadata);

    return {
      message: response.message,
      suggestedSteps: response.suggestedSteps || [],
      questions: response.questions || [],
      isComplete: false
    };
  }

  /**
   * Continues the conversation with user input
   *
   * @param {string} userMessage - User's response
   * @returns {Object} AI's response
   */
  async continueSession(userMessage) {
    if (!this.session) {
      throw new Error('No active session. Call startSession() first.');
    }

    this.session.addMessage('user', userMessage);

    console.log(`[NLWorkflowBuilder] User: ${userMessage}`);

    // Process user's message
    const response = await this.processMessage(userMessage);

    this.session.addMessage('assistant', response.message, response.metadata);

    // Check if workflow is complete
    if (response.isComplete) {
      this.session.isComplete = true;
    }

    return {
      message: response.message,
      workflowPreview: response.workflowPreview,
      suggestedSteps: response.suggestedSteps || [],
      questions: response.questions || [],
      isComplete: response.isComplete || false,
      readyToSave: response.readyToSave || false
    };
  }

  /**
   * Processes a message using GPT-4
   */
  async processMessage(message) {
    try {
      const buildWorkflowNL = httpsCallable(functions, 'aiBuildWorkflowFromNaturalLanguage');

      const result = await buildWorkflowNL({
        message,
        conversationHistory: this.session.conversationHistory,
        currentWorkflow: this.session.getWorkflow(),
        context: this.session.context
      });

      const data = result.data;

      // Apply any workflow updates from AI
      if (data.workflowUpdates) {
        this.applyWorkflowUpdates(data.workflowUpdates);
      }

      return {
        message: data.message,
        suggestedSteps: data.suggestedSteps,
        questions: data.questions,
        workflowPreview: this.session.getWorkflow(),
        isComplete: data.isComplete,
        readyToSave: data.readyToSave,
        metadata: data.metadata
      };

    } catch (error) {
      console.error('[NLWorkflowBuilder] Error processing message:', error);

      // Fallback to rule-based processing
      return this.fallbackProcessing(message);
    }
  }

  /**
   * Applies workflow updates from AI response
   */
  applyWorkflowUpdates(updates) {
    if (updates.name) {
      this.session.workflowName = updates.name;
    }

    if (updates.description) {
      this.session.description = updates.description;
    }

    if (updates.addSteps) {
      updates.addSteps.forEach(step => {
        this.session.addStep(step);
      });
    }

    if (updates.updateSteps) {
      updates.updateSteps.forEach(({ index, changes }) => {
        this.session.updateStep(index, changes);
      });
    }

    if (updates.removeSteps) {
      // Remove in reverse order to maintain indices
      updates.removeSteps.sort((a, b) => b - a).forEach(index => {
        this.session.removeStep(index);
      });
    }

    if (updates.context) {
      this.session.context = {
        ...this.session.context,
        ...updates.context
      };
    }
  }

  /**
   * Fallback rule-based processing when GPT-4 is unavailable
   */
  fallbackProcessing(message) {
    const lowerMsg = message.toLowerCase();

    // Detect workflow name
    if (lowerMsg.includes('create a workflow') || lowerMsg.includes('build a workflow')) {
      const nameMatch = message.match(/(?:create|build) a workflow (?:for|called) (.+)/i);
      if (nameMatch) {
        this.session.workflowName = nameMatch[1].trim();
        return {
          message: `Great! I'll create a workflow called "${this.session.workflowName}". What should be the first step?`,
          questions: ['What should be the first step in this workflow?']
        };
      }
    }

    // Detect email send action
    if (lowerMsg.includes('send') && (lowerMsg.includes('email') || lowerMsg.includes('message'))) {
      const emailStep = {
        type: 'email_send',
        name: 'Send Email',
        config: {
          template: 'unknown',
          subject: 'Unknown subject - needs configuration'
        }
      };

      this.session.addStep(emailStep);

      return {
        message: `Added email send step. What email template should I use, or should I create a new one?`,
        questions: ['Which email template should be used?']
      };
    }

    // Detect wait/delay action
    if (lowerMsg.includes('wait') || lowerMsg.includes('delay')) {
      const durationMatch = message.match(/(\d+)\s*(day|hour|minute)s?/i);

      let duration = 24; // Default 24 hours
      let unit = 'hours';

      if (durationMatch) {
        const value = parseInt(durationMatch[1]);
        unit = durationMatch[2].toLowerCase() + 's';

        if (unit === 'days') duration = value * 24;
        else if (unit === 'hours') duration = value;
        else if (unit === 'minutes') duration = value / 60;
      }

      const waitStep = {
        type: 'wait',
        name: `Wait ${durationMatch ? durationMatch[0] : '24 hours'}`,
        config: {
          duration,
          unit: 'hours'
        }
      };

      this.session.addStep(waitStep);

      return {
        message: `Added wait step (${waitStep.name}). What happens next?`,
        questions: ['What should happen after the wait period?']
      };
    }

    // Detect conditional branching
    if (lowerMsg.includes('if') && (lowerMsg.includes('then') || lowerMsg.includes('else'))) {
      const branchStep = {
        type: 'conditional_branch',
        name: 'Conditional Branch',
        config: {
          condition: 'needs configuration',
          truePath: [],
          falsePath: []
        }
      };

      this.session.addStep(branchStep);

      return {
        message: `Added conditional branch. What condition should I check? (e.g., "if IDIQ enrolled", "if email opened", "if credit score < 600")`,
        questions: ['What condition should trigger the branch?', 'What happens if the condition is true?', 'What happens if the condition is false?']
      };
    }

    // Detect task creation
    if (lowerMsg.includes('create task') || lowerMsg.includes('assign to')) {
      const taskStep = {
        type: 'task_create',
        name: 'Create Task',
        config: {
          title: 'Follow up with contact',
          assignTo: lowerMsg.includes('laurie') ? 'laurie' : 'christopher',
          priority: lowerMsg.includes('urgent') ? 'high' : 'medium'
        }
      };

      this.session.addStep(taskStep);

      return {
        message: `Added task creation step (assigned to ${taskStep.config.assignTo}). What else should this workflow do?`,
        questions: []
      };
    }

    // Detect IDIQ enrollment
    if (lowerMsg.includes('idiq') || lowerMsg.includes('credit report')) {
      const idiqStep = {
        type: 'idiq_enrollment',
        name: 'IDIQ Enrollment',
        config: {
          offerType: lowerMsg.includes('free') ? 'free_trial' : 'paid',
          sendEmail: true
        }
      };

      this.session.addStep(idiqStep);

      return {
        message: `Added IDIQ enrollment step. Should I also send them enrollment instructions via email?`,
        questions: ['Send IDIQ enrollment email?']
      };
    }

    // Detect service recommendation
    if (lowerMsg.includes('recommend') && lowerMsg.includes('service')) {
      const recommendStep = {
        type: 'service_recommendation',
        name: 'AI Service Recommendation',
        config: {
          useAI: true,
          sendEmail: true
        }
      };

      this.session.addStep(recommendStep);

      return {
        message: `Added AI service recommendation step. This will analyze the contact's credit profile and recommend the best tier. What should happen after they receive the recommendation?`,
        questions: ['What happens if they accept the recommendation?', 'What happens if they decline?']
      };
    }

    // Generic response
    return {
      message: `I'm not sure I understood that. Could you rephrase? Try commands like:\n• "Send a welcome email"\n• "Wait 2 days"\n• "If they enrolled in IDIQ, then..."\n• "Create a task for Laurie"\n• "Recommend a service tier"`,
      questions: ['What would you like to add to the workflow?']
    };
  }

  /**
   * Saves the workflow to Firestore
   */
  async saveWorkflow() {
    if (!this.session) {
      throw new Error('No active session to save');
    }

    if (this.session.steps.length === 0) {
      throw new Error('Workflow has no steps - add at least one step before saving');
    }

    try {
      const workflow = this.session.getWorkflow();

      // Save to Firestore
      const workflowRef = await addDoc(collection(db, 'workflows'), {
        name: workflow.name || 'Untitled Workflow',
        description: workflow.description || 'Created via Natural Language Builder',
        steps: workflow.steps,
        status: 'draft',
        createdVia: 'natural_language_builder',
        conversationHistory: workflow.metadata.conversationHistory,
        createdAt: new Date(),
        createdBy: 'christopher'
      });

      this.session.workflowId = workflowRef.id;

      console.log(`[NLWorkflowBuilder] Saved workflow: ${workflowRef.id}`);

      return {
        workflowId: workflowRef.id,
        workflow: {
          id: workflowRef.id,
          ...workflow
        }
      };

    } catch (error) {
      console.error('[NLWorkflowBuilder] Error saving workflow:', error);
      throw error;
    }
  }

  /**
   * Gets a preview of the current workflow
   */
  getPreview() {
    if (!this.session) {
      return null;
    }

    return {
      workflow: this.session.getWorkflow(),
      stepCount: this.session.steps.length,
      isComplete: this.session.isComplete,
      summary: this.generateSummary()
    };
  }

  /**
   * Generates a human-readable summary of the workflow
   */
  generateSummary() {
    if (!this.session || this.session.steps.length === 0) {
      return 'Empty workflow';
    }

    const lines = [];
    lines.push(`**${this.session.workflowName || 'Untitled Workflow'}**`);
    lines.push('');

    this.session.steps.forEach((step, index) => {
      lines.push(`${index + 1}. ${this.stepToSummary(step)}`);
    });

    return lines.join('\n');
  }

  /**
   * Converts a step to human-readable summary
   */
  stepToSummary(step) {
    switch (step.type) {
      case 'email_send':
        return `Send email: "${step.config.subject || step.config.template}"`;

      case 'sms_send':
        return `Send SMS: "${step.config.message?.substring(0, 50) || 'Message'}"`;

      case 'wait':
        return `Wait ${step.config.duration} ${step.config.unit}`;

      case 'conditional_branch':
        return `If ${step.config.condition}, then branch`;

      case 'task_create':
        return `Create task for ${step.config.assignTo}: "${step.config.title}"`;

      case 'idiq_enrollment':
        return `Enroll in IDIQ (${step.config.offerType})`;

      case 'service_recommendation':
        return `AI recommends best service tier`;

      case 'ai_analysis':
        return `AI analyzes contact profile`;

      case 'role_assignment':
        return `Assign contact role automatically`;

      case 'update_contact':
        return `Update contact: ${JSON.stringify(step.config.updates)}`;

      default:
        return step.name || step.type;
    }
  }

  /**
   * Resets the session
   */
  resetSession() {
    this.session = null;
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Quick function to build a workflow from a single description
 *
 * @param {string} description - Full workflow description
 * @returns {Object} Generated workflow
 *
 * Example:
 * const workflow = await quickBuildWorkflow(
 *   "Send welcome email, wait 2 days, send IDIQ offer, if they enroll send instructions, otherwise remind after 3 days"
 * );
 */
export async function quickBuildWorkflow(description) {
  const builder = new NLWorkflowBuilder();

  // Start session
  await builder.startSession(description);

  // Auto-complete if possible (GPT-4 should build entire workflow from single description)
  if (builder.session.isComplete) {
    return await builder.saveWorkflow();
  }

  // If not complete, throw error (need more interaction)
  throw new Error('Workflow requires more details. Use NLWorkflowBuilder for interactive building.');
}

/**
 * Converts existing workflow to natural language description
 *
 * @param {Object} workflow - Workflow object
 * @returns {string} Natural language description
 */
export function workflowToNaturalLanguage(workflow) {
  if (!workflow || !workflow.steps || workflow.steps.length === 0) {
    return 'Empty workflow';
  }

  const builder = new NLWorkflowBuilder();
  builder.session = new WorkflowBuildingSession();
  builder.session.workflowName = workflow.name;
  builder.session.description = workflow.description;
  builder.session.steps = workflow.steps;

  return builder.generateSummary();
}

// ============================================================================
// EXAMPLE TEMPLATES
// ============================================================================

/**
 * Pre-built workflow templates that users can start from
 */
export const WORKFLOW_TEMPLATES = {
  standard_onboarding: {
    name: 'Standard Tier Onboarding',
    description: 'Complete onboarding workflow for Standard tier clients',
    naturalLanguageDescription: `
      When a new Standard tier contact is created:
      1. Send welcome email immediately
      2. Wait 4 hours
      3. Offer free IDIQ credit report
      4. If they enroll, send IDIQ instructions
      5. If they don't enroll within 2 days, send reminder
      6. AI analyzes their credit profile
      7. Recommend service plan (Standard fixed or performance)
      8. Create follow-up task for Christopher
      9. If they accept plan, send contract
      10. If they sign contract, send onboarding checklist
    `
  },

  premium_onboarding: {
    name: 'Premium Tier Onboarding',
    description: 'White-glove onboarding for Premium/VIP clients',
    naturalLanguageDescription: `
      When a new Premium tier contact is created:
      1. Send personalized welcome email from Christopher
      2. Wait 1 hour
      3. Create urgent task for Christopher: "Call within 1 hour"
      4. Offer free IDIQ credit report
      5. AI analyzes credit profile and generates detailed report
      6. If credit score < 600, recommend Premium tier
      7. If credit score >= 600, recommend Acceleration tier
      8. Send service recommendation with detailed pricing
      9. Wait 24 hours
      10. If no response, send follow-up email
      11. If still no response after 48 hours, create task for Laurie
    `
  },

  idiq_lapse_recovery: {
    name: 'IDIQ Lapse Recovery',
    description: '3-tier recovery workflow when IDIQ subscription lapses',
    naturalLanguageDescription: `
      When IDIQ subscription lapses:
      1. Immediately send urgent email: "Your IDIQ subscription has lapsed"
      2. Immediately send SMS: "URGENT: Renew IDIQ to continue service"
      3. Wait 48 hours
      4. If still not renewed, send second notice email
      5. Wait 48 hours more
      6. If still not renewed, create urgent task for Christopher
      7. Pause all credit repair services
      8. Send final warning email
    `
  },

  re_engagement: {
    name: 'Re-engagement Campaign',
    description: 'Brings cold leads back to life',
    naturalLanguageDescription: `
      For contacts who haven't engaged in 30 days:
      1. Send "We miss you" email with success stories
      2. Wait 3 days
      3. Send free credit education resource
      4. Wait 5 days
      5. Offer limited-time discount (10% off first month)
      6. Wait 7 days
      7. Send final "last chance" email
      8. If they engage at any point, move to active lead workflow
      9. If no engagement after 21 days, mark as cold lead
    `
  }
};

// ============================================================================
// EXPORTS
// ============================================================================

export default NLWorkflowBuilder;

/**
 * Example Usage:
 *
 * // Interactive workflow building
 * const builder = new NLWorkflowBuilder();
 *
 * // Start with user's description
 * let response = await builder.startSession(
 *   "Create a workflow for new Standard tier clients"
 * );
 * console.log(response.message);
 * // AI: "I'll create a Standard tier onboarding workflow. What should happen first?"
 *
 * // User responds
 * response = await builder.continueSession(
 *   "Send a welcome email, then wait 2 days, then offer IDIQ"
 * );
 * console.log(response.message);
 * // AI: "Got it! I've added 3 steps. What should happen if they sign up for IDIQ?"
 *
 * // Continue conversation
 * response = await builder.continueSession(
 *   "If they sign up, send instructions. If not, remind them after 3 days"
 * );
 *
 * // Keep going until complete
 * response = await builder.continueSession("That's it, save the workflow");
 *
 * // Save workflow
 * if (response.readyToSave) {
 *   const saved = await builder.saveWorkflow();
 *   console.log(`Workflow saved with ID: ${saved.workflowId}`);
 * }
 *
 * // Quick single-shot workflow creation
 * const workflow = await quickBuildWorkflow(
 *   "Send welcome email, wait 2 days, send IDIQ offer, create task for Christopher"
 * );
 *
 * // Convert existing workflow to English
 * const description = workflowToNaturalLanguage(existingWorkflow);
 * console.log(description);
 * // "1. Send email: 'Welcome to Speedy Credit Repair'"
 * // "2. Wait 48 hours"
 * // "3. Enroll in IDIQ (free trial)"
 * // "4. Create task for Christopher: 'Follow up with new client'"
 *
 * // Use a template as starting point
 * const template = WORKFLOW_TEMPLATES.standard_onboarding;
 * const builderFromTemplate = new NLWorkflowBuilder();
 * await builderFromTemplate.startSession(template.naturalLanguageDescription);
 */
