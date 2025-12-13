// functions/automation/notificationService.js
// Handles all email and SMS notifications
// Schedule-aware notifications for Laurie

const admin = require('firebase-admin');
const functions = require('firebase-functions');

// Email service (you can use SendGrid, AWS SES, or Firebase Extensions)
// For now, using Firebase's built-in email capability
// TODO: Install email extension or configure SendGrid

/**
 * Notify Laurie about new lead
 * Only sends during work hours for hot/erupting leads
 */
exports.notifyLaurie = async (data) => {
  try {
    const { type, contact } = data;
    
    // Check if it's Laurie's work hours
    const isWorkHours = checkLaurieWorkHours();
    
    // During work hours: send immediate alerts for erupting/hot
    if (isWorkHours && (type === 'erupting' || type === 'hot')) {
      await sendEmailNotification({
        to: 'laurie@speedycreditrepair.com',
        subject: type === 'erupting' 
          ? '🔥🔥🔥 URGENT: Erupting Lead - Call NOW!' 
          : '🔥 Hot Lead - Call Today',
        body: buildLeadEmailBody(contact, type),
        priority: type === 'erupting' ? 'high' : 'normal'
      });
      
      console.log(`📧 Notified Laurie about ${type} lead:`, contact.id);
    }
    
    // After hours: queue for morning summary
    if (!isWorkHours && (type === 'erupting' || type === 'hot')) {
      await queueForMorningSummary(contact, type);
      console.log(`📋 Queued for morning summary:`, contact.id);
    }
    
  } catch (error) {
    console.error('Error notifying Laurie:', error);
  }
};

/**
 * Check if it's Laurie's work hours
 * Monday-Thursday, Saturday: 7:30am - 3:00pm Pacific
 * Friday, Sunday: Off
 */
function checkLaurieWorkHours() {
  // Get current time in Pacific timezone
  const now = new Date();
  const pacificTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
  
  const day = pacificTime.getDay(); // 0=Sun, 1=Mon, etc.
  const hour = pacificTime.getHours();
  const minute = pacificTime.getMinutes();
  const timeInMinutes = hour * 60 + minute;
  
  // Off days: Friday (5) and Sunday (0)
  if (day === 0 || day === 5) {
    return false;
  }
  
  // Work hours: 7:30am (450 min) to 3:00pm (900 min)
  const workStart = 7 * 60 + 30; // 7:30am
  const workEnd = 15 * 60; // 3:00pm
  
  return timeInMinutes >= workStart && timeInMinutes < workEnd;
}

/**
 * Queue lead for morning summary email
 */
async function queueForMorningSummary(contact, type) {
  const db = admin.firestore();
  
  await db.collection('morningSummaryQueue').add({
    contactId: contact.id,
    type: type,
    contactData: contact,
    queuedAt: admin.firestore.FieldValue.serverTimestamp(),
    processed: false
  });
}

/**
 * Build email body for lead notification
 */
function buildLeadEmailBody(contact, type) {
  const emoji = type === 'erupting' ? '🔥🔥🔥' : '🔥';
  const urgency = type === 'erupting' ? 'CALL WITHIN 1 HOUR' : 'CALL TODAY';
  
  return `
${emoji} ${urgency} ${emoji}

NEW ${type.toUpperCase()} LEAD:

Name: ${contact.firstName} ${contact.lastName}
Phone: ${contact.phone}
${contact.email ? `Email: ${contact.email}` : ''}

Lead Score: ${contact.leadScore}/100
Temperature: ${contact.temperature}

AI Summary:
${contact.aiObservations}

Recommended Actions:
${contact.aiRecommendations}

Call Details:
- Duration: ${contact.callDuration} seconds
- Sentiment: ${contact.sentiment?.positive || 0}% positive
- Source: AI Receptionist

[View in CRM] (link will be added in production)

---
This is an automated alert from SpeedyCRM
  `.trim();
}

/**
 * Send email notification
 * TODO: Configure with your email provider
 */
async function sendEmailNotification({ to, subject, body, priority = 'normal' }) {
  try {
    // METHOD 1: Using Firebase Extensions - Email Trigger
    // Install: firebase ext:install firebase/firestore-send-email
    const db = admin.firestore();
    
    await db.collection('mail').add({
      to: to,
      message: {
        subject: subject,
        text: body,
        html: body.replace(/\n/g, '<br>')
      },
      priority: priority,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('✉️ Email queued:', to, subject);
    
    // METHOD 2: Using SendGrid (if you prefer)
    // Uncomment this block and comment out METHOD 1
    /*
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(functions.config().sendgrid.key);
    
    const msg = {
      to: to,
      from: 'notifications@speedycreditrepair.com',
      subject: subject,
      text: body,
      html: body.replace(/\n/g, '<br>')
    };
    
    await sgMail.send(msg);
    console.log('✉️ Email sent via SendGrid:', to);
    */
    
  } catch (error) {
    console.error('❌ Error sending email:', error);
    // Don't throw - log and continue
  }
}

/**
 * Send morning summary email to Laurie
 * Scheduled function that runs at 7:00am Mon-Thu, Sat
 */
exports.sendMorningSummary = functions.runWith({
  memory: '512MB',
  timeoutSeconds: 60
}).pubsub
  .schedule('0 7 * * 1,2,3,4,6') // 7am Mon-Thu, Sat
  .timeZone('America/Los_Angeles')
  .onRun(async (context) => {
    try {
      const db = admin.firestore();
      
      // Get all queued items from yesterday/after-hours
      const queueSnapshot = await db.collection('morningSummaryQueue')
        .where('processed', '==', false)
        .orderBy('queuedAt', 'desc')
        .get();
      
      if (queueSnapshot.empty) {
        console.log('📭 No items in morning summary queue');
        return null;
      }
      
      // Group by type
      const erupting = [];
      const hot = [];
      const warm = [];
      
      queueSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.type === 'erupting') erupting.push(data.contactData);
        else if (data.type === 'hot') hot.push(data.contactData);
        else if (data.type === 'warm') warm.push(data.contactData);
      });
      
      // Build summary email
      const subject = `☀️ Good Morning Laurie! ${erupting.length + hot.length} Priority Leads`;
      const body = buildMorningSummaryBody(erupting, hot, warm);
      
      // Send email
      await sendEmailNotification({
        to: 'laurie@speedycreditrepair.com',
        subject: subject,
        body: body,
        priority: 'high'
      });
      
      // Mark all as processed
      const batch = db.batch();
      queueSnapshot.forEach(doc => {
        batch.update(doc.ref, { 
          processed: true,
          processedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      });
      await batch.commit();
      
      console.log(`✅ Morning summary sent: ${erupting.length + hot.length + warm.length} leads`);
      
    } catch (error) {
      console.error('Error sending morning summary:', error);
    }
  });

/**
 * Build morning summary email body
 */
function buildMorningSummaryBody(erupting, hot, warm) {
  const lines = [];
  
  lines.push('☀️ Good Morning Laurie!');
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push('');
  
  if (erupting.length > 0) {
    lines.push(`🔥🔥🔥 ERUPTING LEADS - CALL FIRST (${erupting.length}):`);
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    erupting.forEach((contact, i) => {
      lines.push(`${i + 1}. ${contact.firstName} ${contact.lastName}`);
      lines.push(`   📞 ${contact.phone} ${contact.email ? `| 📧 ${contact.email}` : ''}`);
      lines.push(`   💬 "${contact.aiObservations}"`);
      lines.push(`   Score: ${contact.leadScore} | Called: ${contact.initialContactDate}`);
      lines.push('');
    });
  }
  
  if (hot.length > 0) {
    lines.push(`🔥 HOT LEADS - CALL TODAY (${hot.length}):`);
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    hot.forEach((contact, i) => {
      lines.push(`${i + 1}. ${contact.firstName} ${contact.lastName}`);
      lines.push(`   📞 ${contact.phone} ${contact.email ? `| 📧 ${contact.email}` : ''}`);
      lines.push(`   💬 "${contact.aiObservations}"`);
      lines.push('');
    });
  }
  
  if (warm.length > 0) {
    lines.push(`⚡ WARM LEADS (${warm.length}):`);
    lines.push('Follow up this week - details in CRM');
    lines.push('');
  }
  
  lines.push('[Open CRM Dashboard]');
  lines.push('');
  lines.push('Have a great day! 🌟');
  
  return lines.join('\n');
}

/**
 * Send Zelle payment notification
 */
exports.notifyZellePayment = async (clientData, amount) => {
  try {
    await sendEmailNotification({
      to: 'laurie@speedycreditrepair.com',
      subject: `💜 Zelle Payment Reported - ${clientData.firstName} ${clientData.lastName}`,
      body: `
Client reports they sent a Zelle payment:

Client: ${clientData.firstName} ${clientData.lastName}
Client #: ${clientData.clientNumber}
Amount: $${amount}
Time: ${new Date().toLocaleString()}

⚠️ ACTION REQUIRED:
1. Check your Chase app/email for Zelle receipt
2. Confirm receipt in CRM billing dashboard
3. System will auto-send receipt once confirmed

[Confirm Payment in CRM]
      `.trim(),
      priority: 'normal'
    });
    
    console.log('📧 Zelle payment notification sent');
    
  } catch (error) {
    console.error('Error sending Zelle notification:', error);
  }
};

/**
 * Send payment confirmation receipt to client
 */
exports.sendPaymentReceipt = async (clientEmail, paymentData) => {
  try {
    const { amount, method, date, transactionId, clientNumber } = paymentData;
    
    await sendEmailNotification({
      to: clientEmail,
      subject: '✅ Payment Received - Speedy Credit Repair',
      body: `
Thank you for your payment!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAYMENT RECEIPT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Amount: $${amount}
Payment Method: ${method.toUpperCase()}
Date: ${date}
Client #: ${clientNumber}
Transaction ID: ${transactionId}

Your account has been updated and your services will continue without interruption.

If you have any questions, please contact:
📧 billing@speedycreditrepair.com
📞 (888) 724-7344

Thank you for choosing Speedy Credit Repair!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `.trim(),
      priority: 'normal'
    });
    
    console.log('📧 Payment receipt sent to:', clientEmail);
    
  } catch (error) {
    console.error('Error sending payment receipt:', error);
  }
};