// ============================================
// Path: /c/my-clever-crm/functions/enrollmentAutomation.js
// ============================================
// POST-ENROLLMENT AUTOMATION
// Triggers on contact updates when enrollmentStatus changes to 'enrolled'
// 
// CRITICAL FIX (Jan 14, 2026):
// - Sets role as 'prospect' NOT 'client' after enrollment
// - Client role only assigned after service plan selection
// 
// Workflow:
// 1. Detect enrollment completion
// 2. Create portal account (Firebase Auth + userProfile)
// 3. Send welcome email with portal link
// 4. Schedule AI credit review (when report ready)
// 5. Generate dispute suggestions
// 6. Create initial tasks
// 7. Update pipeline stage
// ============================================

const admin = require('firebase-admin');
const fetch = require('node-fetch');

// ============================================
// MAIN AUTOMATION HANDLER
// ============================================
async function processEnrollment(contactId, contactData, change) {
  console.log('\n==============================================');
  console.log('🚀 STARTING ENROLLMENT AUTOMATION');
  console.log(`Contact: ${contactId}`);
  console.log(`Name: ${contactData.firstName} ${contactData.lastName}`);
  console.log('==============================================\n');

  const db = admin.firestore();
  const results = {
    contactId,
    startTime: new Date().toISOString(),
    steps: {}
  };

  try {
    // ============================================
    // STEP 1: Create Portal Account
    // ============================================
    console.log('\n--- STEP 1: CREATE PORTAL ACCOUNT ---');
    
    const portalResult = await createPortalAccount(contactId, contactData);
    results.steps.portalAccount = portalResult;
    
    if (!portalResult.success) {
      throw new Error(`Portal creation failed: ${portalResult.error}`);
    }

    const userId = portalResult.userId;
    console.log(`✅ Portal account created: ${userId}`);

    // ============================================
    // STEP 2: Send Welcome Email
    // ============================================
    console.log('\n--- STEP 2: SEND WELCOME EMAIL ---');
    
    const emailResult = await sendWelcomeEmail(contactData, userId);
    results.steps.welcomeEmail = emailResult;
    
    if (!emailResult.success) {
      console.warn(`⚠️ Welcome email failed: ${emailResult.error}`);
    } else {
      console.log('✅ Welcome email sent');
    }

    // ============================================
    // STEP 3: Schedule AI Credit Review
    // ============================================
    console.log('\n--- STEP 3: SCHEDULE AI CREDIT REVIEW ---');
    
    const reviewResult = await scheduleAICreditReview(contactId, contactData);
    results.steps.creditReview = reviewResult;
    
    if (!reviewResult.success) {
      console.warn(`⚠️ Credit review scheduling failed: ${reviewResult.error}`);
    } else {
      console.log('✅ AI credit review scheduled');
    }

    // ============================================
    // STEP 4: Generate Dispute Suggestions (if report ready)
    // ============================================
    console.log('\n--- STEP 4: GENERATE DISPUTE SUGGESTIONS ---');
    
    const disputeResult = await generateDisputeSuggestions(contactId, contactData);
    results.steps.disputeSuggestions = disputeResult;
    
    if (!disputeResult.success) {
      console.warn(`⚠️ Dispute suggestions failed: ${disputeResult.error}`);
    } else {
      console.log('✅ Dispute suggestions generated');
    }

    // ============================================
    // STEP 5: Create Initial Tasks
    // ============================================
    console.log('\n--- STEP 5: CREATE INITIAL TASKS ---');
    
    const tasksResult = await createInitialTasks(contactId, contactData, userId);
    results.steps.initialTasks = tasksResult;
    
    if (!tasksResult.success) {
      console.warn(`⚠️ Task creation failed: ${tasksResult.error}`);
    } else {
      console.log('✅ Initial tasks created');
    }

    // ============================================
    // STEP 6: Update Pipeline Stage
    // ============================================
    console.log('\n--- STEP 6: UPDATE PIPELINE STAGE ---');
    
    const pipelineResult = await updatePipelineStage(contactId, contactData);
    results.steps.pipeline = pipelineResult;
    
    if (!pipelineResult.success) {
      console.warn(`⚠️ Pipeline update failed: ${pipelineResult.error}`);
    } else {
      console.log('✅ Pipeline stage updated');
    }

    // ============================================
    // FINAL: Update Contact with Automation Results
    // ============================================
    console.log('\n--- FINAL: UPDATE CONTACT ---');
    await db.collection('contacts').doc(contactId).update({
      'automation.enrollmentProcessed': true,
      'automation.processedAt': admin.firestore.FieldValue.serverTimestamp(),
      'automation.results': results,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    results.endTime = new Date().toISOString();
    results.success = true;
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ ENROLLMENT AUTOMATION COMPLETED`);
    console.log(`Duration: ${new Date(results.endTime) - new Date(results.startTime)}ms`);
    console.log(`${'='.repeat(60)}\n`);
    
    return results;
    
  } catch (error) {
    console.error('\n❌ ENROLLMENT AUTOMATION FAILED:', error);
    
    results.endTime = new Date().toISOString();
    results.success = false;
    results.error = error.message;
    
    // Log critical error
    await db.collection('errorLogs').add({
      type: 'enrollment_automation_failed',
      contactId: contactId,
      error: error.message,
      stack: error.stack,
      results: results,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return results;
  }
}

// ============================================
// STEP 1: CREATE PORTAL ACCOUNT
// ============================================
// ✅ CRITICAL FIX: Sets role as 'prospect' NOT 'client'
// Client status only after service plan selection
//
// Creates:
// - Firebase Auth user account
// - userProfiles document with 'prospect' role
// - Links userId to contact document
// ============================================

async function createPortalAccount(contactId, contactData) {
  console.log('🔐 Creating portal account...');
  
  const db = admin.firestore();
  
  try {
    const email = contactData.email.toLowerCase();
    const displayName = `${contactData.firstName} ${contactData.lastName}`;

    // Check if user already exists
    let userRecord;
    try {
      userRecord = await admin.auth().getUserByEmail(email);
      console.log('ℹ️ User already exists:', userRecord.uid);
      
      // Update existing user
      await admin.auth().updateUser(userRecord.uid, {
        displayName,
        disabled: false
      });

    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        // Create new Firebase Auth user
        userRecord = await admin.auth().createUser({
          email,
          displayName,
          emailVerified: false,
          disabled: false
        });
        
        console.log('👤 New Firebase Auth user created:', userRecord.uid);
      } else {
        throw error;
      }
    }

    // ============================================
    // ✅ CRITICAL FIX: Set role as 'prospect', NOT 'client'
    // ============================================
    await db.collection('userProfiles').doc(userRecord.uid).set({
      contactId,
      email,
      firstName: contactData.firstName,
      lastName: contactData.lastName,
      displayName,
      
      // ✅ CORRECT: Set as prospect (enrolled but not yet client)
      role: 'prospect',
      roles: ['contact', 'lead', 'prospect'],
      primaryRole: 'prospect',
      
      // Portal access flags
      portalAccess: true,
      portalActivatedAt: admin.firestore.FieldValue.serverTimestamp(),
      
      // Service status tracking
      serviceSelected: false,  // ✅ Track when they select a plan
      servicePlanId: null,
      servicePlanName: null,
      servicePlanPrice: null,
      
      // IDIQ subscription tracking
      idiqEnrolled: true,
      idiqEnrollmentId: contactData.idiqEnrollmentId || null,
      idiqMemberToken: contactData.idiqMemberToken || null,
      idiqSubscriptionType: 'trial',  // ✅ Starts as trial
      idiqSubscriptionStatus: 'active',
      idiqEnrolledAt: admin.firestore.FieldValue.serverTimestamp(),
      
      // Contract status
      contractSigned: false,
      contractDocumentId: null,
      
      // Timestamps
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    console.log('✅ userProfile created with role: prospect');

    // ============================================
    // Update contact document with userId and portal info
    // ============================================
    await db.collection('contacts').doc(contactId).update({
      userId: userRecord.uid,
      portalAccess: true,
      portalCreatedAt: admin.firestore.FieldValue.serverTimestamp(),
      
      // ✅ CORRECT: Add 'prospect' role, NOT 'client'
      roles: admin.firestore.FieldValue.arrayUnion('prospect'),
      primaryRole: 'prospect',
      
      // Service tracking
      enrollmentCompleted: true,
      serviceSelected: false,  // ✅ Track service selection
      
      // IDIQ tracking
      idiqSubscriptionType: 'trial',
      idiqSubscriptionStatus: 'active',
      
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('✅ Contact updated with userId and prospect role');

    return {
      success: true,
      userId: userRecord.uid,
      email: email,
      role: 'prospect'
    };

  } catch (error) {
    console.error('❌ Portal account creation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================
// STEP 2: SEND WELCOME EMAIL
// ============================================
async function sendWelcomeEmail(contactData, userId) {
  console.log('📧 Sending welcome email...');
  
  try {
    // Get email configuration from Firebase secrets
    const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
    const FROM_EMAIL = process.env.FROM_EMAIL || 'portal@speedycreditrepair.com';
    
    if (!SENDGRID_API_KEY) {
      throw new Error('SENDGRID_API_KEY not configured');
    }

    const portalUrl = `https://myclevercrm.com/portal`;
    const resetPasswordUrl = `https://myclevercrm.com/reset-password`;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1976d2;">Welcome to Speedy Credit Repair! 🎉</h2>
        
        <p>Hi ${contactData.firstName},</p>
        
        <p>Great news! Your IDIQ credit report enrollment is complete, and your client portal is now ready.</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Your Portal Access:</h3>
          <p><strong>Email:</strong> ${contactData.email}</p>
          <p><strong>Portal URL:</strong> <a href="${portalUrl}">${portalUrl}</a></p>
        </div>
        
        <h3>Next Steps:</h3>
        <ol>
          <li><strong>Set Your Password:</strong> Visit the <a href="${resetPasswordUrl}">password reset page</a> to create your password</li>
          <li><strong>Review Your Credit Report:</strong> Once available, your credit analysis will appear in your portal</li>
          <li><strong>Review AI Recommendations:</strong> Our AI will generate personalized dispute recommendations</li>
          <li><strong>Select Your Service Plan:</strong> Choose the plan that best fits your needs</li>
        </ol>
        
        <div style="background-color: #fff3e0; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>📞 Need Help?</strong></p>
          <p>Our team is here to assist you:</p>
          <p>
            Phone: (951) 225-1671<br>
            Email: info@speedycreditrepair.com<br>
            Hours: Monday-Friday, 9am-6pm PST
          </p>
        </div>
        
        <p>We're excited to help you achieve your credit goals!</p>
        
        <p>
          Best regards,<br>
          <strong>Speedy Credit Repair Team</strong><br>
          Established 1995 | BBB A+ Rating
        </p>
        
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
        <p style="font-size: 12px; color: #666;">
          © 1995-${new Date().getFullYear()} Speedy Credit Repair Inc. | All Rights Reserved
        </p>
      </div>
    `;

    // Send via SendGrid
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: contactData.email, name: `${contactData.firstName} ${contactData.lastName}` }],
          subject: 'Welcome to Speedy Credit Repair - Portal Access Ready! 🎉'
        }],
        from: { email: FROM_EMAIL, name: 'Speedy Credit Repair' },
        content: [{
          type: 'text/html',
          value: emailHtml
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`SendGrid API error: ${response.statusText}`);
    }

    console.log('✅ Welcome email sent via SendGrid');
    
    return {
      success: true,
      emailSent: true,
      recipient: contactData.email
    };

  } catch (error) {
    console.error('❌ Welcome email error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================
// STEP 3: SCHEDULE AI CREDIT REVIEW
// ============================================
async function scheduleAICreditReview(contactId, contactData) {
  console.log('🤖 Scheduling AI credit review...');
  
  const db = admin.firestore();
  
  try {
    // Check if credit report is already available
    const idiqEnrollmentDoc = await db.collection('idiqEnrollments')
      .where('contactId', '==', contactId)
      .limit(1)
      .get();

    if (idiqEnrollmentDoc.empty) {
      console.log('ℹ️ No IDIQ enrollment found - will process when report is ready');
      
      // Create a scheduled task to check for report later
      await db.collection('tasks').add({
        contactId,
        type: 'ai_credit_review',
        status: 'pending',
        priority: 'high',
        title: 'AI Credit Report Analysis',
        description: 'Waiting for credit report to become available',
        scheduledFor: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return {
        success: true,
        scheduled: true,
        message: 'Review will process when report is ready'
      };
    }

    const enrollmentData = idiqEnrollmentDoc.docs[0].data();
    
    if (!enrollmentData.creditReport || !enrollmentData.creditReportPulled) {
      console.log('ℹ️ Credit report not yet pulled - scheduling for later');
      
      await db.collection('tasks').add({
        contactId,
        enrollmentId: idiqEnrollmentDoc.docs[0].id,
        type: 'ai_credit_review',
        status: 'pending',
        priority: 'high',
        title: 'AI Credit Report Analysis',
        description: 'Waiting for credit report to be pulled',
        scheduledFor: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return {
        success: true,
        scheduled: true,
        message: 'Review scheduled for when report is pulled'
      };
    }

    // Report is available - trigger AI analysis
    console.log('✅ Credit report available - triggering AI analysis');
    
    // This would call your AI analysis function
    // For now, we'll create a task for manual processing
    await db.collection('tasks').add({
      contactId,
      enrollmentId: idiqEnrollmentDoc.docs[0].id,
      type: 'ai_credit_review',
      status: 'ready',
      priority: 'high',
      title: 'AI Credit Report Analysis - Ready',
      description: 'Credit report available and ready for AI analysis',
      scheduledFor: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return {
      success: true,
      scheduled: true,
      reportAvailable: true
    };

  } catch (error) {
    console.error('❌ AI credit review scheduling error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================
// STEP 4: GENERATE DISPUTE SUGGESTIONS
// ============================================
async function generateDisputeSuggestions(contactId, contactData) {
  console.log('📋 Generating dispute suggestions...');
  
  const db = admin.firestore();
  
  try {
    // Check if we have credit report data
    const idiqEnrollmentDoc = await db.collection('idiqEnrollments')
      .where('contactId', '==', contactId)
      .limit(1)
      .get();

    if (idiqEnrollmentDoc.empty || !idiqEnrollmentDoc.docs[0].data().creditReportPulled) {
      console.log('ℹ️ Credit report not available - will generate suggestions later');
      return {
        success: true,
        generated: false,
        message: 'Waiting for credit report'
      };
    }

    // For now, create a placeholder task
    // This would integrate with your AI dispute generation system
    await db.collection('tasks').add({
      contactId,
      type: 'generate_disputes',
      status: 'ready',
      priority: 'high',
      title: 'Generate AI Dispute Suggestions',
      description: 'Credit report available - ready to generate personalized dispute recommendations',
      scheduledFor: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('✅ Dispute suggestion task created');

    return {
      success: true,
      generated: true
    };

  } catch (error) {
    console.error('❌ Dispute suggestions error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================
// STEP 5: CREATE INITIAL TASKS
// ============================================
async function createInitialTasks(contactId, contactData, userId) {
  console.log('📝 Creating initial tasks...');
  
  const db = admin.firestore();
  
  try {
    const tasks = [
      {
        contactId,
        userId,
        type: 'onboarding',
        status: 'pending',
        priority: 'high',
        title: 'Welcome Call',
        description: `Schedule welcome call with ${contactData.firstName} ${contactData.lastName}`,
        assignedTo: null,
        dueDate: null,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        contactId,
        userId,
        type: 'enrollment',
        status: 'completed',
        priority: 'high',
        title: 'IDIQ Enrollment Completed',
        description: 'Credit report enrollment successfully completed',
        completedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        contactId,
        userId,
        type: 'portal',
        status: 'completed',
        priority: 'medium',
        title: 'Portal Account Created',
        description: 'Client portal account created and welcome email sent',
        completedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      }
    ];

    // Create all tasks
    const batch = db.batch();
    tasks.forEach(task => {
      const taskRef = db.collection('tasks').doc();
      batch.set(taskRef, task);
    });
    await batch.commit();

    console.log(`✅ Created ${tasks.length} initial tasks`);

    return {
      success: true,
      tasksCreated: tasks.length
    };

  } catch (error) {
    console.error('❌ Task creation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================
// STEP 6: UPDATE PIPELINE STAGE
// ============================================
async function updatePipelineStage(contactId, contactData) {
  console.log('🎯 Updating pipeline stage...');
  
  const db = admin.firestore();
  
  try {
    await db.collection('contacts').doc(contactId).update({
      // ✅ CORRECT: Move to "Enrolled" stage (not "Client")
      pipelineStage: 'enrolled',
      pipelineStatus: 'active',
      pipelineUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
      
      // Track lifecycle progression
      lifecycle: {
        capturedAt: contactData.createdAt || admin.firestore.FieldValue.serverTimestamp(),
        qualifiedAt: contactData.qualifiedAt || admin.firestore.FieldValue.serverTimestamp(),
        enrolledAt: admin.firestore.FieldValue.serverTimestamp(),
        clientAt: null  // ✅ Will be set when they select plan
      },
      
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('✅ Pipeline stage updated to: enrolled');

    return {
      success: true,
      stage: 'enrolled'
    };

  } catch (error) {
    console.error('❌ Pipeline update error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================
// NEW: CONVERT PROSPECT → CLIENT (After Plan Selection)
// ============================================
// ✅ Call this when user selects and signs service plan
//
// Prerequisites:
// 1. IDIQ subscription upgraded to paid
// 2. Service plan selected
// 3. Contract signed
//
// Updates:
// - userProfile: role 'prospect' → 'client'
// - contact: primaryRole 'prospect' → 'client'
// - pipelineStage: 'enrolled' → 'client'
// ============================================

async function convertProspectToClient(contactId, userId, servicePlanData) {
  console.log('💰 Converting prospect to CLIENT after plan selection...');
  console.log(`Contact: ${contactId}, User: ${userId}`);
  
  const db = admin.firestore();
  
  try {
    // ============================================
    // VALIDATION: Ensure IDIQ is upgraded to paid
    // ============================================
    const userProfile = await db.collection('userProfiles').doc(userId).get();
    
    if (!userProfile.exists) {
      throw new Error('User profile not found');
    }

    const userData = userProfile.data();
    
    if (userData.idiqSubscriptionType !== 'paid') {
      throw new Error('IDIQ subscription must be upgraded to paid before client conversion');
    }

    console.log('✅ IDIQ subscription verified as paid');

    // ============================================
    // UPDATE: userProfile (prospect → client)
    // ============================================
    await db.collection('userProfiles').doc(userId).update({
      // Role progression
      role: 'client',
      roles: admin.firestore.FieldValue.arrayUnion('client'),
      primaryRole: 'client',
      
      // Service plan details
      serviceSelected: true,
      servicePlanId: servicePlanData.planId,
      servicePlanName: servicePlanData.planName,
      servicePlanPrice: servicePlanData.price,
      servicePlanStartDate: admin.firestore.FieldValue.serverTimestamp(),
      
      // Contract details
      contractSigned: true,
      contractSignedAt: admin.firestore.FieldValue.serverTimestamp(),
      contractDocumentId: servicePlanData.contractId || null,
      
      // IDIQ should be paid at this point
      idiqSubscriptionType: 'paid',  // ✅ Must be upgraded before becoming client
      idiqSubscriptionStatus: 'active',
      
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('✅ userProfile updated: prospect → client');

    // ============================================
    // UPDATE: contact (prospect → client)
    // ============================================
    await db.collection('contacts').doc(contactId).update({
      // Role progression
      roles: admin.firestore.FieldValue.arrayUnion('client'),
      primaryRole: 'client',
      
      // Service tracking
      serviceSelected: true,
      servicePlanId: servicePlanData.planId,
      servicePlanName: servicePlanData.planName,
      servicePlanPrice: servicePlanData.price,
      servicePlanStartDate: admin.firestore.FieldValue.serverTimestamp(),
      
      // Contract tracking
      contractSigned: true,
      contractSignedAt: admin.firestore.FieldValue.serverTimestamp(),
      contractDocumentId: servicePlanData.contractId || null,
      
      // Pipeline progression
      pipelineStage: 'client',
      pipelineStatus: 'active',
      pipelineUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
      
      // Lifecycle tracking
      'lifecycle.clientAt': admin.firestore.FieldValue.serverTimestamp(),
      
      // IDIQ tracking
      idiqSubscriptionType: 'paid',
      idiqSubscriptionStatus: 'active',
      
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('✅ contact updated: prospect → client');

    // ============================================
    // CREATE: Initial client tasks
    // ============================================
    await db.collection('tasks').add({
      contactId,
      userId,
      type: 'client_onboarding',
      status: 'pending',
      priority: 'high',
      title: 'Client Onboarding',
      description: `New client onboarding: ${servicePlanData.planName} plan`,
      assignedTo: null,
      dueDate: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('✅ Client onboarding task created');

    // ============================================
    // SEND: Client welcome email
    // ============================================
    const contactDoc = await db.collection('contacts').doc(contactId).get();
    const contactData = contactDoc.data();

    await sendClientWelcomeEmail(contactData, servicePlanData);

    console.log('✅ Client welcome email sent');

    console.log('\n==============================================');
    console.log('✅ PROSPECT → CLIENT CONVERSION COMPLETE');
    console.log('==============================================\n');

    return {
      success: true,
      userId,
      contactId,
      role: 'client',
      servicePlan: servicePlanData.planName
    };

  } catch (error) {
    console.error('\n❌ PROSPECT → CLIENT CONVERSION FAILED:', error);
    
    // Log error
    await db.collection('errorLogs').add({
      type: 'prospect_to_client_conversion_failed',
      contactId,
      userId,
      error: error.message,
      stack: error.stack,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================
// HELPER: SEND CLIENT WELCOME EMAIL
// ============================================
async function sendClientWelcomeEmail(contactData, servicePlanData) {
  console.log('📧 Sending client welcome email...');
  
  try {
    const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
    const FROM_EMAIL = process.env.FROM_EMAIL || 'portal@speedycreditrepair.com';
    
    if (!SENDGRID_API_KEY) {
      throw new Error('SENDGRID_API_KEY not configured');
    }

    const portalUrl = `https://myclevercrm.com/portal`;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1976d2;">Welcome to the Speedy Family! 🎊</h2>
        
        <p>Hi ${contactData.firstName},</p>
        
        <p>Thank you for choosing Speedy Credit Repair! We're excited to partner with you on your credit repair journey.</p>
        
        <div style="background-color: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Your Service Plan:</h3>
          <p><strong>${servicePlanData.planName}</strong></p>
          <p>${servicePlanData.price}/month</p>
        </div>
        
        <h3>What Happens Next:</h3>
        <ol>
          <li><strong>Credit Analysis:</strong> Our team will complete a comprehensive analysis of your credit report</li>
          <li><strong>Dispute Strategy:</strong> We'll develop a personalized dispute strategy based on AI recommendations</li>
          <li><strong>Initial Disputes:</strong> Your first round of disputes will be prepared and sent to credit bureaus</li>
          <li><strong>Monthly Updates:</strong> You'll receive monthly progress reports in your portal</li>
        </ol>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Access Your Portal:</h3>
          <p><a href="${portalUrl}" style="background-color: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Go to Portal</a></p>
        </div>
        
        <div style="background-color: #fff3e0; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>📞 Your Dedicated Support:</strong></p>
          <p>
            Phone: (951) 225-1671<br>
            Email: info@speedycreditrepair.com<br>
            Hours: Monday-Friday, 9am-6pm PST
          </p>
        </div>
        
        <p>We're here to help you every step of the way!</p>
        
        <p>
          Best regards,<br>
          <strong>The Speedy Credit Repair Team</strong><br>
          Established 1995 | BBB A+ Rating | 4.9★ Google Reviews
        </p>
        
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
        <p style="font-size: 12px; color: #666;">
          © 1995-${new Date().getFullYear()} Speedy Credit Repair Inc. | All Rights Reserved
        </p>
      </div>
    `;

    // Send via SendGrid
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: contactData.email, name: `${contactData.firstName} ${contactData.lastName}` }],
          subject: `Welcome to Speedy Credit Repair - ${servicePlanData.planName} Plan! 🎊`
        }],
        from: { email: FROM_EMAIL, name: 'Speedy Credit Repair' },
        content: [{
          type: 'text/html',
          value: emailHtml
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`SendGrid API error: ${response.statusText}`);
    }

    console.log('✅ Client welcome email sent');
    
    return true;

  } catch (error) {
    console.error('❌ Client welcome email error:', error);
    return false;
  }
}

// ============================================
// EXPORTS
// ============================================
module.exports = {
  processEnrollment,
  createPortalAccount,
  sendWelcomeEmail,
  scheduleAICreditReview,
  generateDisputeSuggestions,
  createInitialTasks,
  updatePipelineStage,
  convertProspectToClient,  // ✅ NEW: For plan selection flow
  sendClientWelcomeEmail
};

// ============================================
// © 1995-2026 Speedy Credit Repair Inc. | All Rights Reserved
// ============================================