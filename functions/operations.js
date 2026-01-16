/**
 * Path: /functions/operations.js
 * Operations Helper Functions
 * 
 * NOTE: These are HELPER FUNCTIONS, not Cloud Functions
 * They are called by operationsManager in index.js
 * 
 * © 1995-2026 Speedy Credit Repair Inc. | Christopher Lahage | All Rights Reserved
 * Trademark: Speedy Credit Repair® - USPTO Registered
 */

const { getFirestore, FieldValue } = require('firebase-admin/firestore');

// ============================================
// WEB LEAD CAPTURE HELPER
// Added: January 16, 2026
// ============================================

/**
 * Capture web lead from landing page
 * Creates contact immediately, triggers email workflow, enables drip campaigns
 * 
 * @param {Object} data - Lead data (firstName, lastName, email, phone)
 * @param {string} userId - User ID (defaults to 'system')
 * @returns {Promise<Object>} - Result with success, contactId, existed, message
 */
async function captureWebLead(data, userId = 'system') {
  const db = getFirestore();
  
  const { firstName, lastName, email, phone } = data;
  
  console.log('📋 Capturing web lead:', { firstName, lastName, email, phone });
  
  // Validate required fields
  if (!firstName || !lastName || !email || !phone) {
    throw new Error('Missing required fields: firstName, lastName, email, phone');
  }
  
  // Normalize data
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPhone = phone.trim().replace(/\D/g, ''); // Remove non-digits
  
  // Check for existing contact with same email
  const existingSnapshot = await db.collection('contacts')
    .where('email', '==', normalizedEmail)
    .limit(1)
    .get();
  
  if (!existingSnapshot.empty) {
    const existingContact = existingSnapshot.docs[0];
    const contactId = existingContact.id;
    const contactData = existingContact.data();
    
    console.log('ℹ️  Contact already exists:', contactId);
    
    // Update enrollment status if not already enrolled
    if (contactData.enrollmentStatus !== 'completed') {
      await db.collection('contacts').doc(contactId).update({
        enrollmentStatus: 'started',
        enrollmentStartedAt: FieldValue.serverTimestamp(),
        lastActivityAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      });
      
      console.log('✅ Updated existing contact enrollment status');
    }
    
    return {
      success: true,
      contactId: contactId,
      existed: true,
      message: 'Existing contact updated'
    };
  }
  
  // Create new contact in Firestore
  const contactRef = await db.collection('contacts').add({
    // Basic info
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: normalizedEmail,
    phone: normalizedPhone,
    
    // Role setup
    roles: ['contact', 'lead'],
    primaryRole: 'lead',
    
    // Lead tracking
    leadSource: 'website',
    leadStatus: 'new',
    leadScore: 5, // Initial score
    
    // Enrollment tracking
    enrollmentStatus: 'started',
    enrollmentStartedAt: FieldValue.serverTimestamp(),
    enrollmentCompletedAt: null,
    
    // Activity tracking
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    lastActivityAt: FieldValue.serverTimestamp(),
    
    // Communication preferences
    emailOptIn: true,
    smsOptIn: true,
    
    // Flags
    isActive: true,
    isTest: false,
    
    // Metadata
    createdBy: 'web-landing-page',
    createdVia: 'landing-page-form'
  });
  
  const contactId = contactRef.id;
  
  console.log('✅ Contact created:', contactId);
  
  // Trigger welcome email workflow
  try {
    await db.collection('emailQueue').add({
      to: normalizedEmail,
      template: 'welcome-lead',
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        contactId: contactId
      },
      status: 'pending',
      priority: 'high',
      createdAt: FieldValue.serverTimestamp(),
      attempts: 0
    });
    
    console.log('📧 Welcome email queued');
  } catch (emailErr) {
    console.error('⚠️  Email queue failed (non-blocking):', emailErr);
  }
  
  // Create initial task for follow-up
  try {
    await db.collection('tasks').add({
      title: `Follow up with new lead: ${firstName} ${lastName}`,
      description: `New lead captured from website. Email: ${normalizedEmail}, Phone: ${normalizedPhone}`,
      assignedTo: null,
      assignedBy: 'system',
      priority: 'high',
      status: 'pending',
      category: 'auto_lead',
      clientId: contactId,
      tags: ['web-lead', 'new-lead', 'follow-up'],
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      completedAt: null,
      completedBy: null,
      comments: [],
      attachments: []
    });
    
    console.log('✅ Follow-up task created');
  } catch (taskErr) {
    console.error('⚠️  Task creation failed (non-blocking):', taskErr);
  }
  
  return {
    success: true,
    contactId: contactId,
    existed: false,
    message: 'Lead captured successfully'
  };
}

// ============================================
// EXPORTS - Helper functions for index.js
// ============================================

module.exports = {
  captureWebLead
};