// =================================================================
// EMAIL AUTOMATION TRIGGERS - USE EXISTING FUNCTIONS
// Path: /src/utils/emailTriggers.js
// =================================================================

import { getFunctions, httpsCallable } from 'firebase/functions';
import { db } from '../lib/firebase';

// Initialize Firebase Functions
const functions = getFunctions();

// Get reference to your existing emailService function
const emailService = httpsCallable(functions, 'emailService');

/**
 * ===== WELCOME EMAIL TRIGGER =====
 * Calls your existing emailService function
 */
export async function sendWelcomeEmail(contactId, contactData) {
  try {
    console.log('📧 Sending welcome email via existing emailService function...');
    
    const { firstName, lastName, email } = contactData;
    
    if (!email) {
      console.warn('⚠️ No email provided for welcome email');
      return { success: false, error: 'No email address' };
    }

    const welcomeBody = `Welcome to Speedy Credit Repair!

Thank you for choosing us to help improve your credit score. With 30 years of experience and an A+ BBB rating, you're in great hands!

What happens next:
• Complete your IDIQ credit monitoring enrollment ($21.86/month)
• Upload required documents (ID, proof of address, etc.)
• Review and sign your service agreement
• Begin your personalized credit repair journey

We're here to help every step of the way. If you have questions, just reply to this email or call us at (888) 724-7344.

Your credit repair journey starts now!

Best regards,
The Speedy Credit Repair Team`;

    // Call your existing emailService function
    const result = await emailService({
      action: 'send',
      to: email,
      subject: '🎉 Welcome to Speedy Credit Repair - Let\'s Get Started!',
      body: welcomeBody,
      recipientName: firstName,
      contactId: contactId,
      templateType: 'welcome'
    });

    console.log('✅ Welcome email sent successfully:', result.data);
    return result.data;

  } catch (error) {
    console.error('❌ Welcome email failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * ===== IDIQ ENROLLMENT INSTRUCTIONS EMAIL =====
 * Sends after successful IDIQ enrollment
 */
export async function sendIDIQInstructions(contactId, contactData, membershipNumber) {
  try {
    console.log('📧 Sending IDIQ instructions via existing emailService function...');
    
    const { firstName, lastName, email } = contactData;
    
    if (!email) {
      console.warn('⚠️ No email provided for IDIQ instructions');
      return { success: false, error: 'No email address' };
    }

    const idiqBody = `Your Credit Monitoring is Now Active!

Hi ${firstName},

Great news! Your IDIQ credit monitoring has been successfully set up.

📊 Your Membership Details:
• Membership #: ${membershipNumber}
• Plan: 3-Bureau Credit Monitoring  
• Monthly Cost: $21.86 (billed directly by IDIQ)
• Coverage: Equifax, Experian, TransUnion

📧 What to Expect:
You should receive a separate email from IDIQ with instructions to complete your account setup and access your member portal.

📋 Next Steps:
1. Check your email for IDIQ account setup instructions
2. Upload your documents in our client portal
3. Review your service plan options

Questions about your membership? Contact IDIQ directly at 877-875-4347 or reply to this email.

Welcome to the Speedy Credit Repair family!

Best regards,
Christopher Lahage & Team`;

    // Call your existing emailService function
    const result = await emailService({
      action: 'send',
      to: email,
      subject: '✅ Your Credit Monitoring is Active - Next Steps Inside',
      body: idiqBody,
      recipientName: firstName,
      contactId: contactId,
      templateType: 'idiq_instructions'
    });

    console.log('✅ IDIQ instructions sent successfully:', result.data);
    return result.data;

  } catch (error) {
    console.error('❌ IDIQ instructions email failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * ===== DOCUMENT UPLOAD CONFIRMATION EMAIL =====
 * Sends when customer uploads documents
 */
export async function sendDocumentConfirmation(contactId, contactData, documentType) {
  try {
    console.log('📧 Sending document confirmation via existing emailService function...');
    
    const { firstName, email } = contactData;
    
    if (!email) return { success: false, error: 'No email address' };

    const docBody = `Document Received - Thank You!

Hi ${firstName},

We've successfully received your ${documentType}. Thank you for providing this important information!

✅ Document Status: Received and processing
📅 Received: ${new Date().toLocaleDateString()}
⏱️ Processing Time: 1-2 business days

Our team will review your document and contact you if we need any additional information.

Next Steps:
• Upload any remaining required documents
• Watch for email updates on your application status
• Call us at (888) 724-7344 with any questions

Thank you for choosing Speedy Credit Repair!

Best regards,
The Processing Team`;

    const result = await emailService({
      action: 'send',
      to: email,
      subject: `📄 Document Received: ${documentType}`,
      body: docBody,
      recipientName: firstName,
      contactId: contactId,
      templateType: 'document_confirmation'
    });

    console.log('✅ Document confirmation sent successfully:', result.data);
    return result.data;

  } catch (error) {
    console.error('❌ Document confirmation email failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * ===== ENROLLMENT ABANDONMENT EMAIL =====
 * For users who start but don't complete enrollment
 */
export async function sendAbandonmentEmail(contactId, contactData, abandonmentStage) {
  try {
    console.log('📧 Sending abandonment email via existing emailService function...');
    
    const { firstName, email } = contactData;
    
    if (!email) return { success: false, error: 'No email address' };

    const abandonmentBody = `Don't Let Poor Credit Hold You Back!

Hi ${firstName},

I noticed you started your credit repair application but haven't finished yet. I wanted to personally reach out because I understand how overwhelming the process can seem.

As someone who has helped thousands of people improve their credit over 30 years, I can tell you that the hardest part is taking the first step - which you've already done!

🎯 Why Complete Your Application:
• Average 73-point credit score increase
• Remove negative items in 60-120 days  
• Qualify for better rates on loans & credit cards
• Save thousands in interest over your lifetime

⏰ Your Application Status: ${abandonmentStage}
📱 Complete in just 5 minutes: [Continue Application]

Don't let another day pass with poor credit affecting your financial future. Click the link above or call me directly at (888) 724-7344.

I'm here to help personally guide you through any questions.

Best regards,
Christopher Lahage
Owner, Speedy Credit Repair`;

    const result = await emailService({
      action: 'send',
      to: email,
      subject: `${firstName}, Don't Give Up on Better Credit! (Just 5 Minutes Left)`,
      body: abandonmentBody,
      recipientName: firstName,
      contactId: contactId,
      templateType: 'abandonment'
    });

    console.log('✅ Abandonment email sent successfully:', result.data);
    return result.data;

  } catch (error) {
    console.error('❌ Abandonment email failed:', error);
    return { success: false, error: error.message };
  }
}

// =================================================================
// USAGE EXAMPLES:
// =================================================================
//
// // After contact creation
// await sendWelcomeEmail(contactId, contactData);
//
// // After IDIQ enrollment
// await sendIDIQInstructions(contactId, contactData, membershipNumber);
//
// // After document upload  
// await sendDocumentConfirmation(contactId, contactData, 'Driver License');
//
// // For abandonment (called by scheduled function)
// await sendAbandonmentEmail(contactId, contactData, 'IDIQ Enrollment');
//
// =================================================================