/**
 * Email Workflow Engine for SpeedyCRM
 * 
 * Orchestrates automated email sequences based on contact behavior
 * and IDIQ application status. Works with emailSequences.js definitions.
 * 
 * @author SpeedyCRM Team
 * @date October 2025
 */

const { db, admin } = require('./firebaseAdmin');
const { WORKFLOWS, STAGES, getWorkflowById, getStageById } = require('./emailSequences');
const { generateAIEmail } = require('./aiEmailService');
const { sendEmail } = require('./sendGridService');
const { checkApplicationStatus } = require('./idiqApplicationTracker');
const { EMAIL_BRANDING } = require('./emailBrandingConfig');

/**
 * Main WorkflowEngine class
 */
class WorkflowEngine {
  constructor() {
    this.processing = false;
  }

  /**
   * Start a workflow for a new contact
   * 
   * @param {string} contactId - Firestore contact document ID
   * @param {string} workflowId - Workflow to start (ai-receptionist, website-form, manual)
   * @param {Object} context - Additional context data
   * @returns {Promise<Object>} Workflow state
   */
  async startWorkflow(contactId, workflowId, context = {}) {
    try {
      console.log(`Starting workflow ${workflowId} for contact ${contactId}`);

      const workflow = getWorkflowById(workflowId);
      if (!workflow) {
        throw new Error(`Workflow ${workflowId} not found`);
      }

      // Get contact data
      const contactRef = db.collection('contacts').doc(contactId);
      const contactSnap = await contactRef.get();
      
      if (!contactSnap.exists) {
        throw new Error(`Contact ${contactId} not found`);
      }

      const contactData = contactSnap.data();

      // Check entry conditions
      const canStart = this.checkEntryConditions(workflow, contactData, context);
      if (!canStart) {
        console.log(`Contact ${contactId} does not meet entry conditions for ${workflowId}`);
        return { success: false, reason: 'Entry conditions not met' };
      }

      // Initialize workflow state
      const workflowState = {
        workflowId,
        currentStage: workflow.stages[0], // First stage
        startedAt: admin.firestore.FieldValue.serverTimestamp(),
        status: 'active',
        stageHistory: [],
        emailsSent: [],
        context: {
          ...context,
          source: workflow.name,
          entryMethod: context.entryMethod || 'unknown'
        }
      };

      // Save workflow state to contact
      await contactRef.update({
        workflowState,
        lastWorkflowUpdate: admin.firestore.FieldValue.serverTimestamp()
      });

      // Execute first stage immediately
      await this.executeStage(contactId, workflow.stages[0]);

      console.log(`Workflow ${workflowId} started successfully for contact ${contactId}`);
      return { success: true, workflowState };

    } catch (error) {
      console.error('Error starting workflow:', error);
      throw error;
    }
  }

  /**
   * Check if contact meets workflow entry conditions
   * 
   * @param {Object} workflow - Workflow definition
   * @param {Object} contactData - Contact document data
   * @param {Object} context - Additional context
   * @returns {boolean} True if can enter workflow
   */
  checkEntryConditions(workflow, contactData, context) {
    if (!workflow.entryConditions) return true;

    const conditions = workflow.entryConditions;

    // Check has phone
    if (conditions.hasPhone && !contactData.phone) {
      return false;
    }

    // Check has email
    if (conditions.hasEmail && !contactData.email) {
      return false;
    }

    // Check source
    if (conditions.sources && conditions.sources.length > 0) {
      const source = contactData.source || context.source || 'unknown';
      if (!conditions.sources.includes(source)) {
        return false;
      }
    }

    // Check not in workflow
    if (conditions.notInWorkflow && contactData.workflowState?.status === 'active') {
      return false;
    }

    return true;
  }

  /**
   * Execute a specific stage for a contact
   * 
   * @param {string} contactId - Contact ID
   * @param {string} stageId - Stage ID to execute
   * @returns {Promise<Object>} Execution result
   */
  async executeStage(contactId, stageId) {
    try {
      console.log(`Executing stage ${stageId} for contact ${contactId}`);

      const stage = getStageById(stageId);
      if (!stage) {
        throw new Error(`Stage ${stageId} not found`);
      }

      // Get contact data
      const contactRef = db.collection('contacts').doc(contactId);
      const contactSnap = await contactRef.get();
      const contactData = contactSnap.data();

      // Check if workflow is paused
      if (contactData.workflowState?.status === 'paused') {
        console.log(`Workflow paused for contact ${contactId}, skipping stage execution`);
        return { success: false, reason: 'Workflow paused' };
      }

      // Execute stage action
      let result;
      switch (stage.action) {
        case 'send_email':
          result = await this.sendStageEmail(contactId, stage, contactData);
          break;
        
        case 'check_idiq':
          result = await this.checkIDIQStatus(contactId, contactData);
          break;
        
        case 'wait':
          result = await this.scheduleNextStage(contactId, stage, contactData);
          break;
        
        case 'end_workflow':
          result = await this.endWorkflow(contactId, stage.reason || 'completed');
          break;
        
        default:
          throw new Error(`Unknown stage action: ${stage.action}`);
      }

      // Update stage history
      await contactRef.update({
        'workflowState.stageHistory': admin.firestore.FieldValue.arrayUnion({
          stageId,
          stageName: stage.name,
          executedAt: admin.firestore.FieldValue.serverTimestamp(),
          result
        }),
        'workflowState.currentStage': stageId,
        lastWorkflowUpdate: admin.firestore.FieldValue.serverTimestamp()
      });

      // Determine next stage
      if (result.success && stage.nextStage) {
        const nextStage = this.determineNextStage(stage, result, contactData);
        
        if (nextStage === 'END') {
          await this.endWorkflow(contactId, 'completed');
        } else if (nextStage) {
          // Schedule next stage based on delay
          const nextStageObj = getStageById(nextStage);
          if (nextStageObj && nextStageObj.delay > 0) {
            await this.scheduleStage(contactId, nextStage, nextStageObj.delay);
          } else {
            // Execute immediately
            await this.executeStage(contactId, nextStage);
          }
        }
      }

      console.log(`Stage ${stageId} executed successfully for contact ${contactId}`);
      return result;

    } catch (error) {
      console.error('Error executing stage:', error);
      
      // Log error to contact record
      await db.collection('contacts').doc(contactId).update({
        'workflowState.lastError': {
          message: error.message,
          stageId,
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        }
      });

      throw error;
    }
  }

  /**
   * Send an email for a stage
   * 
   * @param {string} contactId - Contact ID
   * @param {Object} stage - Stage definition
   * @param {Object} contactData - Contact data
   * @returns {Promise<Object>} Send result
   */
  async sendStageEmail(contactId, stage, contactData) {
    try {
      let emailContent;
      let subject;

      // Generate AI email if transcript available and AI should be used
      if (stage.emailType === 'ai-welcome' && contactData.callTranscript) {
        const aiResult = await generateAIEmail(
          contactData.callTranscript,
          contactData,
          'welcome'
        );
        
        subject = aiResult.subject;
        emailContent = aiResult.body;
      } else {
        // Use template-based email
        subject = this.personalizeSubject(stage.subject, contactData);
        emailContent = await this.loadEmailTemplate(stage.emailType, contactData);
      }

      // Send email via SendGrid
      const sendResult = await sendEmail({
        to: contactData.email,
        from: EMAIL_BRANDING.email,
        subject,
        html: emailContent,
        metadata: {
          contactId,
          stageId: stage.id,
          stageName: stage.name,
          workflowId: contactData.workflowState?.workflowId
        }
      });

      // Update contact with email sent
      await db.collection('contacts').doc(contactId).update({
        'workflowState.emailsSent': admin.firestore.FieldValue.arrayUnion({
          stageId: stage.id,
          emailType: stage.emailType,
          sentAt: admin.firestore.FieldValue.serverTimestamp(),
          subject,
          messageId: sendResult.messageId
        }),
        lastEmailSent: admin.firestore.FieldValue.serverTimestamp()
      });

      return {
        success: true,
        messageId: sendResult.messageId,
        subject
      };

    } catch (error) {
      console.error('Error sending stage email:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Check IDIQ application status
   * 
   * @param {string} contactId - Contact ID
   * @param {Object} contactData - Contact data
   * @returns {Promise<Object>} Status check result
   */
  async checkIDIQStatus(contactId, contactData) {
    try {
      const status = await checkApplicationStatus(contactId);

      // Update contact with latest status
      await db.collection('contacts').doc(contactId).update({
        'idiqApplication.lastChecked': admin.firestore.FieldValue.serverTimestamp(),
        'idiqApplication.status': status.status,
        'idiqApplication.details': status.details || {}
      });

      return {
        success: true,
        status: status.status,
        details: status.details
      };

    } catch (error) {
      console.error('Error checking IDIQ status:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Schedule next stage execution
   * 
   * @param {string} contactId - Contact ID
   * @param {Object} stage - Current stage
   * @param {Object} contactData - Contact data
   * @returns {Promise<Object>} Schedule result
   */
  async scheduleNextStage(contactId, stage, contactData) {
    const nextStage = stage.nextStage;
    const nextStageObj = getStageById(nextStage);

    if (!nextStageObj) {
      return { success: false, reason: 'No next stage found' };
    }

    await this.scheduleStage(contactId, nextStage, nextStageObj.delay);

    return {
      success: true,
      nextStage,
      scheduledFor: new Date(Date.now() + nextStageObj.delay * 60 * 60 * 1000)
    };
  }

  /**
   * Schedule a stage to execute later
   * 
   * @param {string} contactId - Contact ID
   * @param {string} stageId - Stage to schedule
   * @param {number} delayHours - Hours to delay
   * @returns {Promise<void>}
   */
  async scheduleStage(contactId, stageId, delayHours) {
    const executeAt = new Date(Date.now() + delayHours * 60 * 60 * 1000);

    await db.collection('scheduledStages').add({
      contactId,
      stageId,
      executeAt: admin.firestore.Timestamp.fromDate(executeAt),
      status: 'scheduled',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`Scheduled stage ${stageId} for contact ${contactId} at ${executeAt}`);
  }

  /**
   * Determine next stage based on conditions
   * 
   * @param {Object} stage - Current stage
   * @param {Object} result - Stage execution result
   * @param {Object} contactData - Contact data
   * @returns {string|null} Next stage ID
   */
  determineNextStage(stage, result, contactData) {
    // If stage has conditional next stages
    if (stage.conditionalNext) {
      for (const condition of stage.conditionalNext) {
        if (this.evaluateCondition(condition, result, contactData)) {
          return condition.stageId;
        }
      }
    }

    // Default next stage
    return stage.nextStage || null;
  }

  /**
   * Evaluate a condition
   * 
   * @param {Object} condition - Condition to evaluate
   * @param {Object} result - Stage execution result
   * @param {Object} contactData - Contact data
   * @returns {boolean} True if condition met
   */
  evaluateCondition(condition, result, contactData) {
    switch (condition.type) {
      case 'idiq_status':
        return result.status === condition.value;
      
      case 'email_opened':
        return contactData.emailEngagement?.lastOpened != null;
      
      case 'email_clicked':
        return contactData.emailEngagement?.lastClicked != null;
      
      case 'application_completed':
        return contactData.idiqApplication?.status === 'completed';
      
      case 'days_since_contact':
        const daysSince = (Date.now() - contactData.createdAt?.toMillis()) / (1000 * 60 * 60 * 24);
        return daysSince >= condition.value;
      
      default:
        return false;
    }
  }

  /**
   * End a workflow
   * 
   * @param {string} contactId - Contact ID
   * @param {string} reason - Reason for ending
   * @returns {Promise<Object>} End result
   */
  async endWorkflow(contactId, reason = 'completed') {
    await db.collection('contacts').doc(contactId).update({
      'workflowState.status': 'completed',
      'workflowState.completedAt': admin.firestore.FieldValue.serverTimestamp(),
      'workflowState.completionReason': reason,
      lastWorkflowUpdate: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`Workflow ended for contact ${contactId}: ${reason}`);

    return { success: true, reason };
  }

  /**
   * Pause a workflow
   * 
   * @param {string} contactId - Contact ID
   * @param {string} reason - Reason for pausing
   * @returns {Promise<void>}
   */
  async pauseWorkflow(contactId, reason = 'manual') {
    await db.collection('contacts').doc(contactId).update({
      'workflowState.status': 'paused',
      'workflowState.pausedAt': admin.firestore.FieldValue.serverTimestamp(),
      'workflowState.pauseReason': reason,
      lastWorkflowUpdate: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`Workflow paused for contact ${contactId}: ${reason}`);
  }

  /**
   * Resume a paused workflow
   * 
   * @param {string} contactId - Contact ID
   * @returns {Promise<void>}
   */
  async resumeWorkflow(contactId) {
    const contactRef = db.collection('contacts').doc(contactId);
    const contactSnap = await contactRef.get();
    const contactData = contactSnap.data();

    if (contactData.workflowState?.status !== 'paused') {
      throw new Error('Workflow is not paused');
    }

    await contactRef.update({
      'workflowState.status': 'active',
      'workflowState.resumedAt': admin.firestore.FieldValue.serverTimestamp(),
      lastWorkflowUpdate: admin.firestore.FieldValue.serverTimestamp()
    });

    // Resume from current stage
    const currentStage = contactData.workflowState.currentStage;
    if (currentStage) {
      await this.executeStage(contactId, currentStage);
    }

    console.log(`Workflow resumed for contact ${contactId}`);
  }

  /**
   * Process all scheduled stages that are due
   * Called by cron job every hour
   * 
   * @returns {Promise<Object>} Processing results
   */
  async processScheduledStages() {
    if (this.processing) {
      console.log('Already processing scheduled stages, skipping...');
      return { success: false, reason: 'Already processing' };
    }

    this.processing = true;
    const results = {
      processed: 0,
      succeeded: 0,
      failed: 0,
      errors: []
    };

    try {
      const now = admin.firestore.Timestamp.now();

      // Get all scheduled stages that are due
      const scheduledSnap = await db.collection('scheduledStages')
        .where('status', '==', 'scheduled')
        .where('executeAt', '<=', now)
        .limit(50) // Process max 50 at a time
        .get();

      console.log(`Found ${scheduledSnap.size} scheduled stages to process`);

      for (const doc of scheduledSnap.docs) {
        results.processed++;
        
        try {
          const { contactId, stageId } = doc.data();
          
          // Execute the stage
          await this.executeStage(contactId, stageId);
          
          // Mark as executed
          await doc.ref.update({
            status: 'executed',
            executedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          
          results.succeeded++;
          
        } catch (error) {
          console.error(`Error processing scheduled stage ${doc.id}:`, error);
          
          // Mark as failed
          await doc.ref.update({
            status: 'failed',
            error: error.message,
            failedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          
          results.failed++;
          results.errors.push({
            docId: doc.id,
            error: error.message
          });
        }
      }

      console.log('Scheduled stages processing complete:', results);
      return { success: true, results };

    } catch (error) {
      console.error('Error processing scheduled stages:', error);
      return { success: false, error: error.message };
      
    } finally {
      this.processing = false;
    }
  }

  /**
   * Handle email event (open, click, etc.)
   * 
   * @param {string} contactId - Contact ID
   * @param {string} eventType - Event type (open, click, bounce, etc.)
   * @param {Object} eventData - Event data from SendGrid
   * @returns {Promise<void>}
   */
  async handleEmailEvent(contactId, eventType, eventData) {
    try {
      const contactRef = db.collection('contacts').doc(contactId);
      const contactSnap = await contactRef.get();
      
      if (!contactSnap.exists) {
        console.error(`Contact ${contactId} not found for email event`);
        return;
      }

      const contactData = contactSnap.data();
      const updateData = {};

      // Update engagement tracking
      switch (eventType) {
        case 'open':
          updateData['emailEngagement.opens'] = admin.firestore.FieldValue.increment(1);
          updateData['emailEngagement.lastOpened'] = admin.firestore.FieldValue.serverTimestamp();
          break;

        case 'click':
          updateData['emailEngagement.clicks'] = admin.firestore.FieldValue.increment(1);
          updateData['emailEngagement.lastClicked'] = admin.firestore.FieldValue.serverTimestamp();
          
          // If clicked IDIQ link, check if workflow should advance
          if (eventData.url && eventData.url.includes('identityiq.com')) {
            // Schedule IDIQ status check in 5 minutes
            await this.scheduleStage(contactId, 'check-idiq-status-1', 0.083); // ~5 minutes
          }
          break;

        case 'bounce':
          updateData['emailEngagement.bounced'] = true;
          updateData['emailEngagement.bounceReason'] = eventData.reason || 'unknown';
          
          // Pause workflow on hard bounce
          if (eventData.bounceType === 'hard') {
            await this.pauseWorkflow(contactId, 'email_bounced');
          }
          break;

        case 'unsubscribe':
          updateData['emailEngagement.unsubscribed'] = true;
          updateData['emailEngagement.unsubscribedAt'] = admin.firestore.FieldValue.serverTimestamp();
          
          // End workflow
          await this.endWorkflow(contactId, 'unsubscribed');
          break;
      }

      if (Object.keys(updateData).length > 0) {
        await contactRef.update(updateData);
        console.log(`Email event ${eventType} processed for contact ${contactId}`);
      }

    } catch (error) {
      console.error('Error handling email event:', error);
      throw error;
    }
  }

  /**
   * Personalize email subject with contact data
   * 
   * @param {string} template - Subject template
   * @param {Object} contactData - Contact data
   * @returns {string} Personalized subject
   */
  personalizeSubject(template, contactData) {
    return template
      .replace('{{firstName}}', contactData.firstName || contactData.name?.split(' ')[0] || 'there')
      .replace('{{name}}', contactData.name || 'there');
  }

  /**
   * Load and personalize email template
   * 
   * @param {string} templateType - Template type
   * @param {Object} contactData - Contact data
   * @returns {Promise<string>} HTML email content
   */
  async loadEmailTemplate(templateType, contactData) {
    // This would load from email-templates/ directory
    // For now, return placeholder - will be implemented with actual templates
    
    const firstName = contactData.firstName || contactData.name?.split(' ')[0] || 'there';
    
    return `
      <h1>Hello ${firstName}!</h1>
      <p>Template: ${templateType}</p>
      <p>This will be replaced with actual HTML templates.</p>
    `;
  }

  /**
   * Get workflow status for a contact
   * 
   * @param {string} contactId - Contact ID
   * @returns {Promise<Object>} Workflow status
   */
  async getWorkflowStatus(contactId) {
    const contactSnap = await db.collection('contacts').doc(contactId).get();
    
    if (!contactSnap.exists) {
      throw new Error(`Contact ${contactId} not found`);
    }

    const workflowState = contactSnap.data().workflowState || {};
    
    return {
      contactId,
      workflowId: workflowState.workflowId,
      status: workflowState.status || 'none',
      currentStage: workflowState.currentStage,
      startedAt: workflowState.startedAt,
      emailsSent: workflowState.emailsSent?.length || 0,
      stageHistory: workflowState.stageHistory || []
    };
  }
}

// Export singleton instance
const workflowEngine = new WorkflowEngine();

module.exports = {
  workflowEngine,
  WorkflowEngine
};