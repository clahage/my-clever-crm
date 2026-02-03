// ═══════════════════════════════════════════════════════════════════════════════════════════
// DOCUMENT REMINDER DRIP CAMPAIGN - AUTOMATED FOLLOW-UP SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════════════════
// Path: src/services/documentReminderDrip.js
// Version: 1.0.0 - ENTERPRISE EDITION
// 
// PURPOSE: Automatically remind clients to upload required documents
// Triggers when PostSigningSetup documents are skipped
// Schedule: Day 3, Day 7, Day 14 reminders
// 
// FEATURES:
// ✅ Automated drip campaign scheduling
// ✅ Human touch messaging from Chris
// ✅ Escalating urgency in messaging
// ✅ Firebase Cloud Functions compatible
// ✅ Integrates with emailWorkflowEngine.js
// ✅ Tracks reminder history
// ✅ Stops when documents uploaded
// ✅ SMS fallback option
//
// USAGE:
// 1. Call scheduleDocumentReminders(contactId) when client skips documents
// 2. Call cancelDocumentReminders(contactId) when documents uploaded
// 3. Cloud Function runs daily to send pending reminders
//
// © 1995-2026 Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved
// ═══════════════════════════════════════════════════════════════════════════════════════════

import { db, functions } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';
import {
  collection, doc, addDoc, updateDoc, getDoc, getDocs, query, where,
  serverTimestamp, Timestamp, deleteDoc, orderBy
} from 'firebase/firestore';
import { addDays, format, isAfter, isBefore, startOfDay } from 'date-fns';

// ═══════════════════════════════════════════════════════════════════════════════════════════
// CHRIS LAHAGE CONTACT INFO
// ═══════════════════════════════════════════════════════════════════════════════════════════
const CHRIS_INFO = {
  name: 'Chris Lahage',
  title: 'Credit Expert & Owner',
  company: 'Speedy Credit Repair Inc.',
  phone: '(888) 724-7344',
  email: 'chris@speedycreditrepair.com',
  experience: '30 Years Credit Repair Experience',
  currentPosition: 'Current Finance Director at one of Toyota\'s top franchises'
};

// ═══════════════════════════════════════════════════════════════════════════════════════════
// DRIP SCHEDULE CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════════════════
const DRIP_SCHEDULE = [
  {
    day: 3,
    type: 'email',
    urgency: 'friendly',
    subject: 'Quick reminder about your documents',
    templateKey: 'docReminder_day3'
  },
  {
    day: 7,
    type: 'email',
    urgency: 'moderate',
    subject: 'We need your documents to continue',
    templateKey: 'docReminder_day7'
  },
  {
    day: 10,
    type: 'sms',
    urgency: 'moderate',
    message: 'Hi {firstName}, Chris here from Speedy Credit Repair. We still need your ID docs to start disputing items on your credit. Upload at {portalLink} or call me at (888) 724-7344.',
    templateKey: 'docReminder_sms'
  },
  {
    day: 14,
    type: 'email',
    urgency: 'urgent',
    subject: 'URGENT: Your credit repair is on hold',
    templateKey: 'docReminder_day14'
  },
  {
    day: 21,
    type: 'phone_task',
    urgency: 'critical',
    note: 'Call client - documents still not submitted after 3 weeks',
    templateKey: 'docReminder_phoneTask'
  }
];

// ═══════════════════════════════════════════════════════════════════════════════════════════
// EMAIL TEMPLATES (HUMAN TOUCH)
// ═══════════════════════════════════════════════════════════════════════════════════════════
const EMAIL_TEMPLATES = {
  // ===== DAY 3: FRIENDLY REMINDER =====
  docReminder_day3: {
    subject: 'Quick reminder about your documents - {firstName}',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="https://speedycreditrepair.com/logo.png" alt="Speedy Credit Repair" style="max-width: 200px;" />
        </div>
        
        <p style="font-size: 16px; line-height: 1.6;">Hi ${data.firstName},</p>
        
        <p style="font-size: 16px; line-height: 1.6;">
          I hope this message finds you well! I wanted to reach out personally because I noticed 
          we're still waiting on a few documents to get your credit repair started.
        </p>
        
        <p style="font-size: 16px; line-height: 1.6;">
          <strong>We need these to verify your identity and start disputing items on your behalf:</strong>
        </p>
        
        <ul style="font-size: 16px; line-height: 1.8;">
          ${data.missingDocs?.map(doc => `<li>${doc}</li>`).join('') || '<li>Government-issued ID</li><li>Proof of address</li><li>Social Security card</li>'}
        </ul>
        
        <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px;">
            <strong>📱 Easy Upload:</strong> Just take a photo with your phone and upload it in your 
            <a href="${data.portalLink || 'https://myclevercrm.com/client-portal'}" style="color: #059669;">client portal</a>.
          </p>
        </div>
        
        <p style="font-size: 16px; line-height: 1.6;">
          If you have any questions or need help, don't hesitate to call me directly at 
          <strong>${CHRIS_INFO.phone}</strong>. I'm here to help!
        </p>
        
        <p style="font-size: 16px; line-height: 1.6;">
          Looking forward to getting started on improving your credit!
        </p>
        
        <p style="font-size: 16px; line-height: 1.6;">
          Best regards,<br/>
          <strong>${CHRIS_INFO.name}</strong><br/>
          ${CHRIS_INFO.title}<br/>
          ${CHRIS_INFO.experience}<br/>
          <span style="color: #059669;">${CHRIS_INFO.currentPosition}</span>
        </p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
        
        <p style="font-size: 12px; color: #6b7280; text-align: center;">
          © ${new Date().getFullYear()} ${CHRIS_INFO.company} | A+ BBB Rating | 4.9★ Google Reviews<br/>
          <a href="tel:${CHRIS_INFO.phone.replace(/[^\d]/g, '')}" style="color: #059669;">${CHRIS_INFO.phone}</a> | 
          <a href="mailto:${CHRIS_INFO.email}" style="color: #059669;">${CHRIS_INFO.email}</a>
        </p>
      </div>
    `
  },

  // ===== DAY 7: MODERATE URGENCY =====
  docReminder_day7: {
    subject: 'We need your documents to continue, {firstName}',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="https://speedycreditrepair.com/logo.png" alt="Speedy Credit Repair" style="max-width: 200px;" />
        </div>
        
        <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
          <p style="margin: 0; font-size: 14px; color: #92400e;">
            ⏳ <strong>Your credit repair is on hold</strong> until we receive your verification documents.
          </p>
        </div>
        
        <p style="font-size: 16px; line-height: 1.6;">Hi ${data.firstName},</p>
        
        <p style="font-size: 16px; line-height: 1.6;">
          It's been about a week since you signed up, and I'm eager to get started on disputing 
          those negative items we found on your credit report. However, I can't take any action 
          until we verify your identity.
        </p>
        
        <p style="font-size: 16px; line-height: 1.6;">
          <strong>Here's what I found on your credit report that we can work on:</strong>
        </p>
        
        <ul style="font-size: 16px; line-height: 1.8; color: #dc2626;">
          <li>${data.negativeItemCount || 5} negative items impacting your score</li>
          <li>Estimated ${data.potentialImprovement || '60-120'} point improvement possible</li>
          <li>Approximately $${(data.negativeBalance || 15000).toLocaleString()} in disputed balances</li>
        </ul>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.portalLink || 'https://myclevercrm.com/client-portal'}" 
             style="background: #059669; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Upload Documents Now →
          </a>
        </div>
        
        <p style="font-size: 16px; line-height: 1.6;">
          <strong>Documents needed:</strong>
        </p>
        <ol style="font-size: 16px; line-height: 1.8;">
          ${data.missingDocs?.map(doc => `<li>${doc}</li>`).join('') || '<li>Government-issued ID (driver\'s license or passport)</li><li>Proof of current address (utility bill or bank statement)</li><li>Social Security card</li>'}
        </ol>
        
        <p style="font-size: 16px; line-height: 1.6;">
          If you're having any trouble uploading or have questions, please call me directly at 
          <strong>${CHRIS_INFO.phone}</strong>. I answer my own phone!
        </p>
        
        <p style="font-size: 16px; line-height: 1.6;">
          Let's get your credit back on track!
        </p>
        
        <p style="font-size: 16px; line-height: 1.6;">
          Warm regards,<br/>
          <strong>${CHRIS_INFO.name}</strong><br/>
          ${CHRIS_INFO.title}<br/>
          <span style="color: #059669;">${CHRIS_INFO.currentPosition}</span>
        </p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
        
        <p style="font-size: 12px; color: #6b7280; text-align: center;">
          © ${new Date().getFullYear()} ${CHRIS_INFO.company} | A+ BBB Rating | 4.9★ Google Reviews<br/>
          <a href="tel:${CHRIS_INFO.phone.replace(/[^\d]/g, '')}" style="color: #059669;">${CHRIS_INFO.phone}</a>
        </p>
      </div>
    `
  },

  // ===== DAY 14: URGENT =====
  docReminder_day14: {
    subject: 'URGENT: Your credit repair is on hold, {firstName}',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="https://speedycreditrepair.com/logo.png" alt="Speedy Credit Repair" style="max-width: 200px;" />
        </div>
        
        <div style="background: #fee2e2; border: 2px solid #dc2626; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <p style="margin: 0; font-size: 16px; color: #991b1b; font-weight: bold;">
            🚨 URGENT: Your credit repair has been paused for 2 weeks
          </p>
          <p style="margin: 10px 0 0 0; font-size: 14px; color: #991b1b;">
            We cannot dispute items on your credit report without identity verification documents.
          </p>
        </div>
        
        <p style="font-size: 16px; line-height: 1.6;">Hi ${data.firstName},</p>
        
        <p style="font-size: 16px; line-height: 1.6;">
          I'm reaching out one more time because I genuinely want to help you improve your credit. 
          It's been two weeks since you enrolled, and unfortunately, I haven't been able to file 
          a single dispute on your behalf because we're still waiting for your verification documents.
        </p>
        
        <p style="font-size: 16px; line-height: 1.6;">
          <strong>Every day that passes is a day we could be working to improve your score.</strong>
        </p>
        
        <div style="background: #f0fdf4; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0; font-weight: bold; color: #065f46;">What you're missing out on:</p>
          <ul style="margin: 0; padding-left: 20px; color: #065f46;">
            <li>First round of disputes to all 3 credit bureaus</li>
            <li>Potential removal of ${data.negativeItemCount || 5} negative items</li>
            <li>Estimated ${data.potentialImprovement || '60-120'} point score increase</li>
            <li>Better interest rates on loans and credit cards</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.portalLink || 'https://myclevercrm.com/client-portal'}" 
             style="background: #dc2626; color: white; padding: 18px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px; display: inline-block;">
            Upload Documents Now →
          </a>
          <p style="font-size: 12px; color: #6b7280; margin-top: 10px;">
            Takes less than 5 minutes with your phone camera
          </p>
        </div>
        
        <p style="font-size: 16px; line-height: 1.6;">
          <strong>Need help?</strong> Call me right now at <a href="tel:${CHRIS_INFO.phone.replace(/[^\d]/g, '')}" style="color: #059669; font-weight: bold;">${CHRIS_INFO.phone}</a> 
          and I'll personally walk you through the process. I answer my own phone and I'm available 
          to help you get this done today.
        </p>
        
        <p style="font-size: 16px; line-height: 1.6;">
          Your credit score matters. Let's work on it together.
        </p>
        
        <p style="font-size: 16px; line-height: 1.6;">
          Sincerely,<br/>
          <strong>${CHRIS_INFO.name}</strong><br/>
          ${CHRIS_INFO.title}<br/>
          ${CHRIS_INFO.experience}<br/>
          <span style="color: #059669;">${CHRIS_INFO.currentPosition}</span><br/>
          <strong>Direct Line: ${CHRIS_INFO.phone}</strong>
        </p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
        
        <p style="font-size: 12px; color: #6b7280; text-align: center;">
          © ${new Date().getFullYear()} ${CHRIS_INFO.company} | Est. 1995 | A+ BBB Rating<br/>
          <a href="tel:${CHRIS_INFO.phone.replace(/[^\d]/g, '')}" style="color: #059669;">${CHRIS_INFO.phone}</a>
        </p>
      </div>
    `
  }
};

// ═══════════════════════════════════════════════════════════════════════════════════════════
// MAIN FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════════════

/**
 * Schedule document reminder drip campaign for a contact
 * Call this when client skips document upload in PostSigningSetup
 * 
 * @param {string} contactId - The contact ID
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - Scheduled reminders info
 */
export const scheduleDocumentReminders = async (contactId, options = {}) => {
  try {
    console.log('📅 Scheduling document reminder drip for contact:', contactId);
    
    // ===== GET CONTACT DATA =====
    const contactRef = doc(db, 'contacts', contactId);
    const contactDoc = await getDoc(contactRef);
    
    if (!contactDoc.exists()) {
      throw new Error('Contact not found');
    }
    
    const contact = contactDoc.data();
    const startDate = new Date();
    
    // ===== CHECK IF DRIP ALREADY SCHEDULED =====
    const existingQuery = query(
      collection(db, 'scheduledEmails'),
      where('contactId', '==', contactId),
      where('campaignType', '==', 'documentReminder'),
      where('status', '==', 'pending')
    );
    const existingDocs = await getDocs(existingQuery);
    
    if (!existingDocs.empty) {
      console.log('⚠️ Document reminder drip already scheduled for this contact');
      return { success: true, message: 'Drip already scheduled', existingCount: existingDocs.size };
    }
    
    // ===== IDENTIFY MISSING DOCUMENTS =====
    const missingDocs = [];
    if (!contact.idVerified && !contact.documents?.id) {
      missingDocs.push('Government-issued ID (driver\'s license or passport)');
    }
    if (!contact.addressVerified && !contact.documents?.address) {
      missingDocs.push('Proof of current address (utility bill or bank statement)');
    }
    if (!contact.ssnVerified && !contact.documents?.ssn) {
      missingDocs.push('Social Security card');
    }
    
    if (missingDocs.length === 0) {
      missingDocs.push('Government-issued ID', 'Proof of address', 'Social Security card');
    }
    
    // ===== CREATE SCHEDULED EMAILS FOR EACH DRIP =====
    const scheduledReminders = [];
    
    for (const drip of DRIP_SCHEDULE) {
      const sendDate = addDays(startDate, drip.day);
      
      const reminderData = {
        contactId,
        contactEmail: contact.email,
        contactPhone: contact.phone,
        firstName: contact.firstName,
        lastName: contact.lastName,
        campaignType: 'documentReminder',
        templateKey: drip.templateKey,
        type: drip.type,
        urgency: drip.urgency,
        subject: drip.subject?.replace('{firstName}', contact.firstName) || null,
        scheduledFor: Timestamp.fromDate(sendDate),
        scheduledDay: drip.day,
        status: 'pending',
        templateData: {
          firstName: contact.firstName,
          lastName: contact.lastName,
          email: contact.email,
          phone: contact.phone,
          missingDocs,
          negativeItemCount: contact.negativeItemCount || options.negativeItemCount || 5,
          potentialImprovement: contact.potentialImprovement || options.potentialImprovement || '60-120',
          negativeBalance: contact.negativeBalance || options.negativeBalance || 15000,
          portalLink: `https://myclevercrm.com/client-portal?contactId=${contactId}`
        },
        createdAt: serverTimestamp(),
        createdBy: 'system',
        attempts: 0,
        maxAttempts: 3
      };
      
      const docRef = await addDoc(collection(db, 'scheduledEmails'), reminderData);
      scheduledReminders.push({ id: docRef.id, ...reminderData });
      
      console.log(`✅ Scheduled ${drip.type} reminder for Day ${drip.day}:`, format(sendDate, 'MMM d, yyyy'));
    }
    
    // ===== UPDATE CONTACT WITH DRIP STATUS =====
    await updateDoc(contactRef, {
      documentReminderDripStarted: serverTimestamp(),
      documentReminderDripStatus: 'active',
      updatedAt: serverTimestamp()
    });
    
    console.log(`📧 Scheduled ${scheduledReminders.length} document reminders for ${contact.firstName}`);
    
    return {
      success: true,
      message: `Scheduled ${scheduledReminders.length} reminders`,
      reminders: scheduledReminders,
      contactId
    };
    
  } catch (error) {
    console.error('❌ Error scheduling document reminders:', error);
    throw error;
  }
};

/**
 * Cancel document reminder drip campaign
 * Call this when client uploads their documents
 * 
 * @param {string} contactId - The contact ID
 * @returns {Promise<Object>} - Cancellation result
 */
export const cancelDocumentReminders = async (contactId) => {
  try {
    console.log('🚫 Cancelling document reminder drip for contact:', contactId);
    
    // ===== FIND ALL PENDING REMINDERS =====
    const pendingQuery = query(
      collection(db, 'scheduledEmails'),
      where('contactId', '==', contactId),
      where('campaignType', '==', 'documentReminder'),
      where('status', '==', 'pending')
    );
    
    const pendingDocs = await getDocs(pendingQuery);
    let cancelledCount = 0;
    
    // ===== CANCEL EACH PENDING REMINDER =====
    for (const reminderDoc of pendingDocs.docs) {
      await updateDoc(doc(db, 'scheduledEmails', reminderDoc.id), {
        status: 'cancelled',
        cancelledAt: serverTimestamp(),
        cancelReason: 'Documents uploaded'
      });
      cancelledCount++;
    }
    
    // ===== UPDATE CONTACT STATUS =====
    const contactRef = doc(db, 'contacts', contactId);
    await updateDoc(contactRef, {
      documentReminderDripStatus: 'completed',
      documentReminderDripCompletedAt: serverTimestamp(),
      documentsUploaded: true,
      updatedAt: serverTimestamp()
    });
    
    console.log(`✅ Cancelled ${cancelledCount} pending document reminders`);
    
    return {
      success: true,
      message: `Cancelled ${cancelledCount} reminders`,
      cancelledCount
    };
    
  } catch (error) {
    console.error('❌ Error cancelling document reminders:', error);
    throw error;
  }
};

/**
 * Process pending document reminders
 * This should be called by a Cloud Function on a daily schedule
 * 
 * @returns {Promise<Object>} - Processing result
 */
export const processPendingDocumentReminders = async () => {
  try {
    console.log('⏰ Processing pending document reminders...');
    
    const today = startOfDay(new Date());
    
    // ===== FIND REMINDERS DUE TODAY OR EARLIER =====
    const dueQuery = query(
      collection(db, 'scheduledEmails'),
      where('campaignType', '==', 'documentReminder'),
      where('status', '==', 'pending'),
      where('scheduledFor', '<=', Timestamp.fromDate(today))
    );
    
    const dueDocs = await getDocs(dueQuery);
    console.log(`📬 Found ${dueDocs.size} document reminders due for sending`);
    
    let sentCount = 0;
    let errorCount = 0;
    const results = [];
    
    for (const reminderDoc of dueDocs.docs) {
      const reminder = reminderDoc.data();
      
      try {
        // ===== CHECK IF DOCUMENTS WERE UPLOADED =====
        const contactDoc = await getDoc(doc(db, 'contacts', reminder.contactId));
        const contact = contactDoc.data();
        
        if (contact?.documentsUploaded || contact?.documentReminderDripStatus === 'completed') {
          // Documents uploaded - cancel this reminder
          await updateDoc(doc(db, 'scheduledEmails', reminderDoc.id), {
            status: 'cancelled',
            cancelledAt: serverTimestamp(),
            cancelReason: 'Documents already uploaded'
          });
          results.push({ id: reminderDoc.id, status: 'cancelled', reason: 'Documents uploaded' });
          continue;
        }
        
        // ===== SEND THE REMINDER =====
        if (reminder.type === 'email') {
          const template = EMAIL_TEMPLATES[reminder.templateKey];
          if (template) {
            // Call email workflow engine or sendgrid
            const sendEmail = httpsCallable(functions, 'sendEmail');
            await sendEmail({
              to: reminder.contactEmail,
              subject: reminder.subject,
              html: template.html(reminder.templateData),
              contactId: reminder.contactId,
              campaignType: 'documentReminder'
            });
          }
        } else if (reminder.type === 'sms') {
          // Call SMS function
          const sendSMS = httpsCallable(functions, 'sendSMS');
          await sendSMS({
            to: reminder.contactPhone,
            message: reminder.message || `Hi ${reminder.firstName}, we need your documents to continue your credit repair. Upload at ${reminder.templateData.portalLink}`,
            contactId: reminder.contactId
          });
        } else if (reminder.type === 'phone_task') {
          // Create a task for the team
          await addDoc(collection(db, 'tasks'), {
            type: 'phone_call',
            title: `Call ${reminder.firstName} ${reminder.lastName} - Documents Missing`,
            description: reminder.note || 'Client has not submitted documents after 3 weeks. Call to follow up.',
            contactId: reminder.contactId,
            priority: 'high',
            status: 'pending',
            dueDate: Timestamp.fromDate(new Date()),
            createdAt: serverTimestamp(),
            createdBy: 'system'
          });
        }
        
        // ===== MARK AS SENT =====
        await updateDoc(doc(db, 'scheduledEmails', reminderDoc.id), {
          status: 'sent',
          sentAt: serverTimestamp(),
          attempts: (reminder.attempts || 0) + 1
        });
        
        sentCount++;
        results.push({ id: reminderDoc.id, status: 'sent', type: reminder.type });
        console.log(`✅ Sent Day ${reminder.scheduledDay} ${reminder.type} reminder to ${reminder.contactEmail}`);
        
      } catch (sendError) {
        console.error(`❌ Error sending reminder ${reminderDoc.id}:`, sendError);
        
        // ===== INCREMENT ATTEMPT COUNT =====
        const attempts = (reminder.attempts || 0) + 1;
        
        if (attempts >= (reminder.maxAttempts || 3)) {
          // Max attempts reached - mark as failed
          await updateDoc(doc(db, 'scheduledEmails', reminderDoc.id), {
            status: 'failed',
            failedAt: serverTimestamp(),
            error: sendError.message,
            attempts
          });
        } else {
          // Retry later
          await updateDoc(doc(db, 'scheduledEmails', reminderDoc.id), {
            attempts,
            lastError: sendError.message,
            lastAttemptAt: serverTimestamp()
          });
        }
        
        errorCount++;
        results.push({ id: reminderDoc.id, status: 'error', error: sendError.message });
      }
    }
    
    console.log(`📊 Document reminder processing complete: ${sentCount} sent, ${errorCount} errors`);
    
    return {
      success: true,
      processed: dueDocs.size,
      sent: sentCount,
      errors: errorCount,
      results
    };
    
  } catch (error) {
    console.error('❌ Error processing document reminders:', error);
    throw error;
  }
};

/**
 * Get document reminder status for a contact
 * 
 * @param {string} contactId - The contact ID
 * @returns {Promise<Object>} - Drip status
 */
export const getDocumentReminderStatus = async (contactId) => {
  try {
    // ===== GET CONTACT DATA =====
    const contactDoc = await getDoc(doc(db, 'contacts', contactId));
    const contact = contactDoc.data();
    
    // ===== GET ALL REMINDERS FOR THIS CONTACT =====
    const remindersQuery = query(
      collection(db, 'scheduledEmails'),
      where('contactId', '==', contactId),
      where('campaignType', '==', 'documentReminder'),
      orderBy('scheduledDay', 'asc')
    );
    
    const remindersDocs = await getDocs(remindersQuery);
    const reminders = remindersDocs.docs.map(d => ({ id: d.id, ...d.data() }));
    
    return {
      contactId,
      dripStatus: contact?.documentReminderDripStatus || 'not_started',
      startedAt: contact?.documentReminderDripStarted,
      completedAt: contact?.documentReminderDripCompletedAt,
      documentsUploaded: contact?.documentsUploaded || false,
      totalReminders: reminders.length,
      pendingReminders: reminders.filter(r => r.status === 'pending').length,
      sentReminders: reminders.filter(r => r.status === 'sent').length,
      reminders: reminders.map(r => ({
        id: r.id,
        day: r.scheduledDay,
        type: r.type,
        status: r.status,
        scheduledFor: r.scheduledFor?.toDate(),
        sentAt: r.sentAt?.toDate()
      }))
    };
    
  } catch (error) {
    console.error('❌ Error getting document reminder status:', error);
    throw error;
  }
};

// ═══════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════
export default {
  scheduleDocumentReminders,
  cancelDocumentReminders,
  processPendingDocumentReminders,
  getDocumentReminderStatus,
  DRIP_SCHEDULE,
  EMAIL_TEMPLATES,
  CHRIS_INFO
};