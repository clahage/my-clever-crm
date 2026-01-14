// ============================================
// ENROLLMENT AUTOMATION - HELPER FUNCTIONS
// ============================================
// SpeedyCRM - Automated Post-Enrollment Workflow
// Handles: IDIQ enrollment, AI review, portal creation, dispute generation
// Triggered by: onContactCreated when enrollmentStatus changes to 'enrolled'
//
// © 1995-2026 Speedy Credit Repair Inc. | All Rights Reserved
// ============================================

const admin = require('firebase-admin');

// ============================================
// STEP 1: ENROLL IN IDIQ & PULL CREDIT REPORT
// ============================================
/**
 * Enrolls contact in IDIQ and pulls credit report
 * Uses existing IDIQ Partner 11981 integration
 */
async function enrollInIDIQ(contactId, contactData) {
  console.log(`🎯 STEP 1: Enrolling ${contactId} in IDIQ...`);
  
  const db = admin.firestore();
  
  try {
    // Prepare enrollment data from contact
    const enrollmentData = {
      firstName: contactData.firstName,
      lastName: contactData.lastName,
      email: contactData.email,
      phone: contactData.phone,
      address: {
        street: contactData.street || '',
        city: contactData.city || '',
        state: contactData.state || '',
        zip: contactData.zip || ''
      },
      ssn: contactData.ssn || null, // If collected
      dob: contactData.dob || null  // If collected
    };
    
    // Create IDIQ enrollment record
    const enrollmentRef = await db.collection('idiqEnrollments').add({
      contactId: contactId,
      status: 'pending',
      enrollmentData: enrollmentData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      attempts: 0,
      maxAttempts: 3
    });
    
    console.log(`✅ IDIQ enrollment record created: ${enrollmentRef.id}`);
    
    // Update contact with enrollment ID
    await db.collection('contacts').doc(contactId).update({
      idiqEnrollmentId: enrollmentRef.id,
      'idiq.enrollmentPending': true,
      'idiq.enrollmentRequestedAt': admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // NOTE: Actual IDIQ API call happens via idiqService function
    // which monitors idiqEnrollments collection for pending enrollments
    // This is handled by existing processWorkflowStages scheduled function
    
    return {
      success: true,
      enrollmentId: enrollmentRef.id,
      message: 'IDIQ enrollment initiated'
    };
    
  } catch (error) {
    console.error('❌ IDIQ enrollment error:', error);
    
    // Log error but don't fail entire workflow
    await db.collection('errorLogs').add({
      type: 'idiq_enrollment_failed',
      contactId: contactId,
      error: error.message,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================
// STEP 2: WAIT FOR CREDIT REPORT
// ============================================
/**
 * Checks if credit report has been received
 * Returns report data or null if still pending
 */
async function checkCreditReportStatus(contactId) {
  console.log(`🔍 Checking credit report status for ${contactId}...`);
  
  const db = admin.firestore();
  
  try {
    // Check idiqEnrollments for completed report
    const enrollmentSnapshot = await db.collection('idiqEnrollments')
      .where('contactId', '==', contactId)
      .where('status', '==', 'completed')
      .orderBy('updatedAt', 'desc')
      .limit(1)
      .get();
    
    if (enrollmentSnapshot.empty) {
      console.log('⏳ Credit report not yet available');
      return null;
    }
    
    const enrollment = enrollmentSnapshot.docs[0];
    const enrollmentData = enrollment.data();
    
    // Check if credit report data exists
    if (!enrollmentData.creditReport) {
      console.log('⏳ Credit report data not populated yet');
      return null;
    }
    
    console.log('✅ Credit report available!');
    return {
      enrollmentId: enrollment.id,
      creditReport: enrollmentData.creditReport,
      membershipNumber: enrollmentData.membershipNumber
    };
    
  } catch (error) {
    console.error('❌ Error checking credit report:', error);
    return null;
  }
}

// ============================================
// STEP 3: GENERATE AI CREDIT REVIEW
// ============================================
/**
 * Generates AI-powered credit analysis and recommendations
 * Uses OpenAI via server-side call
 */
async function generateAIReview(contactId, creditReportData) {
  console.log(`🤖 STEP 3: Generating AI review for ${contactId}...`);
  
  const db = admin.firestore();
  
  try {
    // Get contact details for personalization
    const contactDoc = await db.collection('contacts').doc(contactId).get();
    const contactData = contactDoc.data();
    
    // Prepare credit analysis payload
    const analysisPayload = {
      contactId: contactId,
      contactName: `${contactData.firstName} ${contactData.lastName}`,
      creditScore: creditReportData.vantageScore || creditReportData.score,
      creditReport: creditReportData,
      goals: contactData.goals || 'Improve credit score',
      timeline: contactData.timeline || '6-12 months'
    };
    
    // Create AI review record (will be processed by aiContentGenerator function)
    const reviewRef = await db.collection('aiReviews').add({
      contactId: contactId,
      status: 'pending',
      type: 'initial_credit_analysis',
      payload: analysisPayload,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      attempts: 0,
      maxAttempts: 3
    });
    
    console.log(`✅ AI review queued: ${reviewRef.id}`);
    
    // Update contact
    await db.collection('contacts').doc(contactId).update({
      aiReviewId: reviewRef.id,
      'ai.reviewPending': true,
      'ai.reviewRequestedAt': admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // NOTE: Actual AI generation happens via aiContentGenerator function
    // which monitors aiReviews collection for pending reviews
    
    return {
      success: true,
      reviewId: reviewRef.id,
      message: 'AI review generation initiated'
    };
    
  } catch (error) {
    console.error('❌ AI review generation error:', error);
    
    await db.collection('errorLogs').add({
      type: 'ai_review_failed',
      contactId: contactId,
      error: error.message,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================
// STEP 4: GENERATE DISPUTE SUGGESTIONS
// ============================================
/**
 * Analyzes credit report and generates dispute recommendations
 */
async function generateDisputeSuggestions(contactId, creditReportData) {
  console.log(`⚖️ STEP 4: Generating dispute suggestions for ${contactId}...`);
  
  const db = admin.firestore();
  
  try {
    // Analyze credit report for negative items
    const negativeItems = [];
    
    // Check for late payments
    if (creditReportData.tradelines) {
      creditReportData.tradelines.forEach((tradeline, index) => {
        if (tradeline.paymentHistory?.includes('30') || 
            tradeline.paymentHistory?.includes('60') ||
            tradeline.paymentHistory?.includes('90')) {
          negativeItems.push({
            type: 'late_payment',
            creditor: tradeline.creditorName,
            accountNumber: tradeline.accountNumber,
            reason: 'Late payment history',
            priority: 'high',
            index: index
          });
        }
      });
    }
    
    // Check for collections
    if (creditReportData.collections) {
      creditReportData.collections.forEach((collection, index) => {
        negativeItems.push({
          type: 'collection',
          creditor: collection.creditorName,
          accountNumber: collection.accountNumber,
          amount: collection.balance,
          reason: 'Collection account',
          priority: 'high',
          index: index
        });
      });
    }
    
    // Check for inquiries (older than 6 months)
    if (creditReportData.inquiries) {
      creditReportData.inquiries.forEach((inquiry, index) => {
        const inquiryDate = new Date(inquiry.date);
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        if (inquiryDate < sixMonthsAgo) {
          negativeItems.push({
            type: 'inquiry',
            creditor: inquiry.creditorName,
            date: inquiry.date,
            reason: 'Unauthorized inquiry',
            priority: 'medium',
            index: index
          });
        }
      });
    }
    
    console.log(`📋 Found ${negativeItems.length} items for dispute`);
    
    // Create dispute suggestions document
    if (negativeItems.length > 0) {
      const disputeSuggestionsRef = await db.collection('disputeSuggestions').add({
        contactId: contactId,
        items: negativeItems,
        totalItems: negativeItems.length,
        status: 'suggested',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log(`✅ Dispute suggestions created: ${disputeSuggestionsRef.id}`);
      
      // Update contact
      await db.collection('contacts').doc(contactId).update({
        disputeSuggestionsId: disputeSuggestionsRef.id,
        'disputes.suggestionsCount': negativeItems.length,
        'disputes.suggestionsCreatedAt': admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      return {
        success: true,
        suggestionsId: disputeSuggestionsRef.id,
        itemCount: negativeItems.length
      };
    } else {
      console.log('ℹ️ No negative items found for dispute');
      return {
        success: true,
        itemCount: 0,
        message: 'Clean credit report - no disputes needed'
      };
    }
    
  } catch (error) {
    console.error('❌ Dispute suggestions error:', error);
    
    await db.collection('errorLogs').add({
      type: 'dispute_suggestions_failed',
      contactId: contactId,
      error: error.message,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================
// STEP 5: CREATE CLIENT PORTAL ACCOUNT
// ============================================
/**
 * Creates Firebase Auth account and userProfile for client portal access
 */
async function createPortalAccount(contactId, contactData) {
  console.log(`🔐 STEP 5: Creating portal account for ${contactId}...`);
  
  const db = admin.firestore();
  
  try {
    const email = contactData.email;
    const firstName = contactData.firstName;
    const lastName = contactData.lastName;
    
    // Check if account already exists
    try {
      const existingUser = await admin.auth().getUserByEmail(email);
      console.log(`ℹ️ Portal account already exists: ${existingUser.uid}`);
      
      // Update contact with existing userId
      await db.collection('contacts').doc(contactId).update({
        userId: existingUser.uid,
        portalAccess: true,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      return {
        success: true,
        userId: existingUser.uid,
        existed: true,
        message: 'Portal account already exists'
      };
    } catch (err) {
      // User doesn't exist, create new account
      if (err.code === 'auth/user-not-found') {
        console.log('✅ Creating new portal account...');
        
        // Create Firebase Auth user
        const userRecord = await admin.auth().createUser({
          email: email.toLowerCase(),
          displayName: `${firstName} ${lastName}`,
          emailVerified: false,
          disabled: false
        });
        
        console.log(`✅ Firebase Auth user created: ${userRecord.uid}`);
        
        // Create userProfile document
        await db.collection('userProfiles').doc(userRecord.uid).set({
          contactId: contactId,
          email: email.toLowerCase(),
          firstName: firstName,
          lastName: lastName,
          role: 'client',
          roles: ['contact', 'client'],
          portalAccess: true,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          lastLogin: null
        });
        
        console.log('✅ userProfile document created');
        
        // Update contact document
        await db.collection('contacts').doc(contactId).update({
          userId: userRecord.uid,
          portalAccess: true,
          roles: admin.firestore.FieldValue.arrayUnion('contact', 'client'),
          portalCreatedAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        console.log('✅ Contact document updated');
        
        // Generate password reset link (for first-time login)
        const passwordResetLink = await admin.auth().generatePasswordResetLink(email.toLowerCase());
        
        console.log('✅ Password reset link generated');
        
        return {
          success: true,
          userId: userRecord.uid,
          passwordResetLink: passwordResetLink,
          existed: false,
          message: 'Portal account created successfully'
        };
      } else {
        throw err; // Re-throw if different error
      }
    }
    
  } catch (error) {
    console.error('❌ Portal account creation error:', error);
    
    await db.collection('errorLogs').add({
      type: 'portal_creation_failed',
      contactId: contactId,
      error: error.message,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================
// STEP 6: SEND WELCOME EMAIL WITH CREDENTIALS
// ============================================
/**
 * Queues welcome email with portal access instructions
 */
async function sendPortalWelcomeEmail(contactId, contactData, passwordResetLink) {
  console.log(`📧 STEP 6: Queuing welcome email for ${contactId}...`);
  
  const db = admin.firestore();
  
  try {
    // Queue email in emailQueue collection
    const emailRef = await db.collection('emailQueue').add({
      to: contactData.email,
      template: 'portal-welcome',
      data: {
        firstName: contactData.firstName,
        lastName: contactData.lastName,
        contactId: contactId,
        passwordResetLink: passwordResetLink,
        portalUrl: 'https://myclevercrm.com/portal'
      },
      status: 'pending',
      priority: 'high',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      attempts: 0,
      maxAttempts: 3
    });
    
    console.log(`✅ Welcome email queued: ${emailRef.id}`);
    
    // NOTE: Email sending is handled by emailService function
    // which monitors emailQueue collection
    
    return {
      success: true,
      emailId: emailRef.id,
      message: 'Welcome email queued'
    };
    
  } catch (error) {
    console.error('❌ Email queueing error:', error);
    
    // Non-blocking error - log but continue
    await db.collection('errorLogs').add({
      type: 'email_queue_failed',
      contactId: contactId,
      error: error.message,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================
// ORCHESTRATOR: COMPLETE ENROLLMENT AUTOMATION
// ============================================
/**
 * Orchestrates the complete post-enrollment workflow
 * Called by onContactCreated trigger when enrollmentStatus changes to 'enrolled'
 */
async function processEnrollmentCompletion(contactId, contactData) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🚀 ENROLLMENT AUTOMATION STARTED`);
  console.log(`Contact: ${contactId} (${contactData.firstName} ${contactData.lastName})`);
  console.log(`Email: ${contactData.email}`);
  console.log(`${'='.repeat(60)}\n`);
  
  const db = admin.firestore();
  const results = {
    contactId: contactId,
    startTime: new Date().toISOString(),
    steps: {}
  };
  
  try {
    // STEP 1: Enroll in IDIQ
    console.log('\n--- STEP 1: IDIQ ENROLLMENT ---');
    const idiqResult = await enrollInIDIQ(contactId, contactData);
    results.steps.idiqEnrollment = idiqResult;
    
    if (!idiqResult.success) {
      console.log('⚠️ IDIQ enrollment failed, continuing with other steps...');
    }
    
    // STEP 2: Wait briefly for credit report (non-blocking)
    // Note: Credit report processing is async via processWorkflowStages
    // We'll check status and proceed if available, otherwise queue for later
    console.log('\n--- STEP 2: CREDIT REPORT CHECK ---');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    const reportData = await checkCreditReportStatus(contactId);
    results.steps.creditReport = reportData ? { available: true } : { available: false, queued: true };
    
    if (reportData) {
      console.log('✅ Credit report available immediately!');
      
      // STEP 3: Generate AI Review
      console.log('\n--- STEP 3: AI REVIEW ---');
      const reviewResult = await generateAIReview(contactId, reportData.creditReport);
      results.steps.aiReview = reviewResult;
      
      // STEP 4: Generate Dispute Suggestions
      console.log('\n--- STEP 4: DISPUTE SUGGESTIONS ---');
      const disputeResult = await generateDisputeSuggestions(contactId, reportData.creditReport);
      results.steps.disputeSuggestions = disputeResult;
    } else {
      console.log('⏳ Credit report not yet available - will process when ready');
      results.steps.aiReview = { queued: true, message: 'Waiting for credit report' };
      results.steps.disputeSuggestions = { queued: true, message: 'Waiting for credit report' };
    }
    
    // STEP 5: Create Portal Account
    console.log('\n--- STEP 5: PORTAL ACCOUNT ---');
    const portalResult = await createPortalAccount(contactId, contactData);
    results.steps.portalAccount = portalResult;
    
    // STEP 6: Send Welcome Email
    if (portalResult.success && portalResult.passwordResetLink) {
      console.log('\n--- STEP 6: WELCOME EMAIL ---');
      const emailResult = await sendPortalWelcomeEmail(
        contactId, 
        contactData, 
        portalResult.passwordResetLink
      );
      results.steps.welcomeEmail = emailResult;
    } else {
      results.steps.welcomeEmail = { skipped: true, reason: 'Portal account existed or failed' };
    }
    
    // Update contact with automation status
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
// EXPORTS
// ============================================
module.exports = {
  processEnrollmentCompletion,
  enrollInIDIQ,
  checkCreditReportStatus,
  generateAIReview,
  generateDisputeSuggestions,
  createPortalAccount,
  sendPortalWelcomeEmail
};