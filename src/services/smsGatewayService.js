// ============================================================================
// smsGatewayService.js - Email-to-SMS Gateway for Speedy Credit Repair
// ============================================================================
// Path: src/services/smsGatewayService.js
//
// PURPOSE: Send SMS messages via Gmail SMTP using carrier email-to-SMS gateways
// - No Twilio/SendGrid dependencies - uses native Gmail
// - Supports major US carriers
// - Includes "Spin-Tax" recovery workflow for abandoned enrollments
// - Integrates with Firebase Cloud Functions for SMTP sending
//
// © 1995-2025 Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved
// ============================================================================

import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';

// ============================================================================
// CARRIER EMAIL-TO-SMS GATEWAY MAPPING
// ============================================================================

export const CARRIER_GATEWAYS = {
  // === Major US Carriers ===
  verizon: {
    name: 'Verizon',
    smsGateway: '@vtext.com',
    mmsGateway: '@vzwpix.com',
    maxLength: 160
  },
  att: {
    name: 'AT&T',
    smsGateway: '@txt.att.net',
    mmsGateway: '@mms.att.net',
    maxLength: 160
  },
  tmobile: {
    name: 'T-Mobile',
    smsGateway: '@tmomail.net',
    mmsGateway: '@tmomail.net',
    maxLength: 160
  },
  sprint: {
    name: 'Sprint',
    smsGateway: '@messaging.sprintpcs.com',
    mmsGateway: '@pm.sprint.com',
    maxLength: 160
  },

  // === Regional & Prepaid Carriers ===
  boost: {
    name: 'Boost Mobile',
    smsGateway: '@sms.myboostmobile.com',
    mmsGateway: '@myboostmobile.com',
    maxLength: 160
  },
  cricket: {
    name: 'Cricket Wireless',
    smsGateway: '@sms.cricketwireless.net',
    mmsGateway: '@mms.cricketwireless.net',
    maxLength: 160
  },
  metro: {
    name: 'Metro by T-Mobile',
    smsGateway: '@mymetropcs.com',
    mmsGateway: '@mymetropcs.com',
    maxLength: 160
  },
  uscellular: {
    name: 'US Cellular',
    smsGateway: '@email.uscc.net',
    mmsGateway: '@mms.uscc.net',
    maxLength: 160
  },
  virgin: {
    name: 'Virgin Mobile',
    smsGateway: '@vmobl.com',
    mmsGateway: '@vmpix.com',
    maxLength: 160
  },
  tracfone: {
    name: 'TracFone',
    smsGateway: '@mmst5.tracfone.com',
    mmsGateway: '@mmst5.tracfone.com',
    maxLength: 160
  },
  straighttalk: {
    name: 'Straight Talk',
    smsGateway: '@vtext.com', // Uses Verizon network primarily
    mmsGateway: '@mypixmessages.com',
    maxLength: 160
  },
  mint: {
    name: 'Mint Mobile',
    smsGateway: '@tmomail.net', // Uses T-Mobile network
    mmsGateway: '@tmomail.net',
    maxLength: 160
  },
  visible: {
    name: 'Visible',
    smsGateway: '@vtext.com', // Uses Verizon network
    mmsGateway: '@vzwpix.com',
    maxLength: 160
  },
  googlefi: {
    name: 'Google Fi',
    smsGateway: '@msg.fi.google.com',
    mmsGateway: '@msg.fi.google.com',
    maxLength: 160
  },
  spectrum: {
    name: 'Spectrum Mobile',
    smsGateway: '@vtext.com', // Uses Verizon network
    mmsGateway: '@vzwpix.com',
    maxLength: 160
  },
  xfinity: {
    name: 'Xfinity Mobile',
    smsGateway: '@vtext.com', // Uses Verizon network
    mmsGateway: '@vzwpix.com',
    maxLength: 160
  },

  // === Fallback/Other ===
  other: {
    name: 'Other/Unknown',
    smsGateway: null, // Cannot send SMS without known gateway
    mmsGateway: null,
    maxLength: 160
  }
};

// Carrier dropdown options for enrollment forms
export const CARRIER_OPTIONS = [
  { value: 'verizon', label: 'Verizon' },
  { value: 'att', label: 'AT&T' },
  { value: 'tmobile', label: 'T-Mobile' },
  { value: 'sprint', label: 'Sprint' },
  { value: 'boost', label: 'Boost Mobile' },
  { value: 'cricket', label: 'Cricket Wireless' },
  { value: 'metro', label: 'Metro by T-Mobile' },
  { value: 'uscellular', label: 'US Cellular' },
  { value: 'virgin', label: 'Virgin Mobile' },
  { value: 'tracfone', label: 'TracFone' },
  { value: 'straighttalk', label: 'Straight Talk' },
  { value: 'mint', label: 'Mint Mobile' },
  { value: 'visible', label: 'Visible' },
  { value: 'googlefi', label: 'Google Fi' },
  { value: 'spectrum', label: 'Spectrum Mobile' },
  { value: 'xfinity', label: 'Xfinity Mobile' },
  { value: 'other', label: 'Other' }
];

// ============================================================================
// SMS MESSAGE TEMPLATES
// ============================================================================

export const SMS_TEMPLATES = {
  // Spin-Tax Recovery Message (15 min after abandonment)
  SPIN_TAX_RECOVERY: {
    id: 'spin_tax_recovery',
    name: 'Spin-Tax Recovery',
    template: `Hi {{firstName}}, Christopher here. I have your analysis ready! {{link}}`,
    maxLength: 140, // Leave room for link
    triggerEvent: 'enrollment_abandoned',
    delayMinutes: 15
  },

  // Welcome Text
  WELCOME: {
    id: 'welcome',
    name: 'Welcome Message',
    template: `Welcome to Speedy Credit Repair, {{firstName}}! Your journey to better credit starts now. Login: {{portalLink}}`,
    maxLength: 140,
    triggerEvent: 'enrollment_complete'
  },

  // Credit Report Ready
  REPORT_READY: {
    id: 'report_ready',
    name: 'Credit Report Ready',
    template: `{{firstName}}, your credit analysis is ready! View it now: {{link}}`,
    maxLength: 140,
    triggerEvent: 'report_pulled'
  },

  // Payment Reminder
  PAYMENT_REMINDER: {
    id: 'payment_reminder',
    name: 'Payment Reminder',
    template: `Hi {{firstName}}, friendly reminder: your payment of ${{amount}} is due on {{dueDate}}. Questions? Reply to this text!`,
    maxLength: 140,
    triggerEvent: 'payment_due'
  },

  // Dispute Update
  DISPUTE_UPDATE: {
    id: 'dispute_update',
    name: 'Dispute Update',
    template: `Great news {{firstName}}! {{updateCount}} item(s) removed from your report. Check your portal: {{link}}`,
    maxLength: 140,
    triggerEvent: 'dispute_resolved'
  },

  // Appointment Reminder
  APPOINTMENT_REMINDER: {
    id: 'appointment_reminder',
    name: 'Appointment Reminder',
    template: `Reminder: Your call with Speedy Credit Repair is {{dateTime}}. Reply 1 to confirm or 2 to reschedule.`,
    maxLength: 140,
    triggerEvent: 'appointment_reminder'
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Clean phone number to 10-digit format
 */
export const cleanPhoneNumber = (phone) => {
  if (!phone) return null;

  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');

  // Handle different formats
  if (cleaned.length === 10) {
    return cleaned;
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return cleaned.slice(1);
  } else if (cleaned.length > 11) {
    // Take last 10 digits
    return cleaned.slice(-10);
  }

  return null; // Invalid phone number
};

/**
 * Build email-to-SMS address
 */
export const buildSmsEmail = (phone, carrierKey) => {
  const cleanedPhone = cleanPhoneNumber(phone);

  if (!cleanedPhone) {
    throw new Error('Invalid phone number format');
  }

  const carrier = CARRIER_GATEWAYS[carrierKey];

  if (!carrier || !carrier.smsGateway) {
    throw new Error(`Unknown or unsupported carrier: ${carrierKey}`);
  }

  return `${cleanedPhone}${carrier.smsGateway}`;
};

/**
 * Parse template with variables
 */
export const parseTemplate = (template, variables = {}) => {
  let parsed = template;

  Object.keys(variables).forEach(key => {
    const placeholder = `{{${key}}}`;
    parsed = parsed.replace(new RegExp(placeholder, 'g'), variables[key] || '');
  });

  return parsed;
};

/**
 * Truncate message to SMS length limit
 */
export const truncateMessage = (message, maxLength = 160) => {
  if (message.length <= maxLength) {
    return message;
  }
  return message.slice(0, maxLength - 3) + '...';
};

// ============================================================================
// CORE SMS SERVICE CLASS
// ============================================================================

class SMSGatewayService {
  constructor() {
    this.cloudFunctionUrl = 'https://sendemail-tvkxcewmxq-uc.a.run.app';
    this.carriers = CARRIER_GATEWAYS;
    this.templates = SMS_TEMPLATES;
  }

  /**
   * Send SMS via Email-to-SMS Gateway
   */
  async sendSMS({
    phone,
    carrier,
    message,
    contactId = null,
    templateId = null,
    variables = {},
    metadata = {}
  }) {
    console.log('📱 SMSGatewayService: Preparing to send SMS');

    try {
      // Validate carrier
      if (!carrier || !this.carriers[carrier]) {
        throw new Error(`Invalid carrier: ${carrier}`);
      }

      const carrierConfig = this.carriers[carrier];

      if (!carrierConfig.smsGateway) {
        throw new Error(`Carrier ${carrier} does not support email-to-SMS`);
      }

      // Build the email-to-SMS address
      const smsEmailAddress = buildSmsEmail(phone, carrier);

      // Parse message if template provided
      let finalMessage = message;
      if (templateId && this.templates[templateId]) {
        finalMessage = parseTemplate(this.templates[templateId].template, variables);
      }

      // Truncate if necessary
      finalMessage = truncateMessage(finalMessage, carrierConfig.maxLength);

      console.log(`📱 Sending to: ${smsEmailAddress}`);
      console.log(`📱 Message: ${finalMessage}`);

      // Prepare email data for Cloud Function
      // SMS via email should be plain text, no HTML
      const emailData = {
        from: {
          email: 'chris@speedycreditrepair.com',
          name: 'Chris - Speedy Credit'
        },
        to: [smsEmailAddress],
        subject: '', // SMS gateways ignore subject
        text: finalMessage,
        html: null, // Plain text only for SMS
        priority: 1, // High priority
        metadata: {
          type: 'SMS_GATEWAY',
          carrier: carrier,
          phone: phone,
          contactId: contactId,
          templateId: templateId,
          sentAt: new Date().toISOString(),
          ...metadata
        }
      };

      // Send via Cloud Function
      const response = await fetch(this.cloudFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailData)
      });

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(`SMS send failed: ${response.status} - ${responseText}`);
      }

      let result;
      try {
        result = JSON.parse(responseText);
      } catch {
        result = { success: true, message: responseText };
      }

      // Log to Firestore
      await this.logSMS({
        phone,
        carrier,
        message: finalMessage,
        contactId,
        templateId,
        status: 'sent',
        result
      });

      console.log('✅ SMS sent successfully');

      return {
        success: true,
        phone,
        carrier,
        message: finalMessage,
        messageId: result.messageId || `sms-${Date.now()}`
      };

    } catch (error) {
      console.error('❌ SMSGatewayService: Send failed:', error);

      // Log failed attempt
      await this.logSMS({
        phone,
        carrier,
        message,
        contactId,
        templateId,
        status: 'failed',
        error: error.message
      });

      throw error;
    }
  }

  /**
   * Send Spin-Tax Recovery SMS
   * Called 15 minutes after enrollment abandonment
   */
  async sendSpinTaxRecovery({ firstName, phone, carrier, resumeLink, contactId }) {
    console.log('🎰 Sending Spin-Tax recovery SMS to:', firstName);

    const variables = {
      firstName: firstName,
      link: resumeLink
    };

    return this.sendSMS({
      phone,
      carrier,
      templateId: 'SPIN_TAX_RECOVERY',
      message: parseTemplate(this.templates.SPIN_TAX_RECOVERY.template, variables),
      contactId,
      variables,
      metadata: {
        recoveryType: 'spin_tax',
        sentMinutesAfterAbandon: 15
      }
    });
  }

  /**
   * Schedule a recovery SMS (stores in Firestore, processed by Cloud Function)
   */
  async scheduleRecoverySMS({
    phone,
    carrier,
    firstName,
    contactId,
    resumeLink,
    delayMinutes = 15
  }) {
    console.log(`⏰ Scheduling recovery SMS in ${delayMinutes} minutes`);

    const scheduledFor = new Date(Date.now() + delayMinutes * 60 * 1000);

    const scheduledSMS = {
      phone,
      carrier,
      firstName,
      contactId,
      resumeLink,
      templateId: 'SPIN_TAX_RECOVERY',
      status: 'scheduled',
      scheduledFor: scheduledFor,
      createdAt: serverTimestamp(),
      processed: false
    };

    const docRef = await addDoc(collection(db, 'scheduledSMS'), scheduledSMS);

    console.log('✅ Recovery SMS scheduled:', docRef.id);

    return {
      success: true,
      scheduledId: docRef.id,
      scheduledFor: scheduledFor.toISOString()
    };
  }

  /**
   * Cancel a scheduled SMS
   */
  async cancelScheduledSMS(contactId) {
    console.log('🚫 Cancelling scheduled SMS for contact:', contactId);

    try {
      const q = query(
        collection(db, 'scheduledSMS'),
        where('contactId', '==', contactId),
        where('status', '==', 'scheduled')
      );

      const snapshot = await getDocs(q);

      const cancelPromises = snapshot.docs.map(async (docSnap) => {
        await updateDoc(doc(db, 'scheduledSMS', docSnap.id), {
          status: 'cancelled',
          cancelledAt: serverTimestamp()
        });
      });

      await Promise.all(cancelPromises);

      console.log(`✅ Cancelled ${snapshot.docs.length} scheduled SMS(s)`);

      return {
        success: true,
        cancelledCount: snapshot.docs.length
      };

    } catch (error) {
      console.error('❌ Failed to cancel scheduled SMS:', error);
      throw error;
    }
  }

  /**
   * Log SMS to Firestore
   */
  async logSMS({ phone, carrier, message, contactId, templateId, status, result, error }) {
    try {
      const logEntry = {
        phone,
        carrier,
        message,
        contactId,
        templateId,
        status,
        result: result || null,
        error: error || null,
        sentAt: serverTimestamp(),
        gateway: 'email-to-sms'
      };

      await addDoc(collection(db, 'smsLogs'), logEntry);

    } catch (logError) {
      console.error('❌ Failed to log SMS:', logError);
    }
  }

  /**
   * Get SMS history for a contact
   */
  async getSMSHistory(contactId, limitCount = 50) {
    try {
      const q = query(
        collection(db, 'smsLogs'),
        where('contactId', '==', contactId),
        orderBy('sentAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

    } catch (error) {
      console.error('❌ Failed to get SMS history:', error);
      throw error;
    }
  }

  /**
   * Get carrier from phone number (basic detection)
   * Note: This is not 100% accurate due to number portability
   */
  detectCarrier(phone) {
    const cleaned = cleanPhoneNumber(phone);
    if (!cleaned) return null;

    const areaCode = cleaned.slice(0, 3);

    // This is a simplified lookup - real carrier detection would use an API
    // For now, we require users to select their carrier in the form
    console.log(`📱 Area code ${areaCode} - carrier detection requires user input`);

    return null;
  }

  /**
   * Validate carrier selection
   */
  validateCarrier(carrierKey) {
    if (!carrierKey) return false;
    if (!this.carriers[carrierKey]) return false;
    if (!this.carriers[carrierKey].smsGateway) return false;
    return true;
  }
}

// ============================================================================
// SINGLETON INSTANCE & EXPORTS
// ============================================================================

const smsGatewayService = new SMSGatewayService();

// Quick access functions
export const sendSMS = (options) => smsGatewayService.sendSMS(options);
export const sendSpinTaxRecovery = (options) => smsGatewayService.sendSpinTaxRecovery(options);
export const scheduleRecoverySMS = (options) => smsGatewayService.scheduleRecoverySMS(options);
export const cancelScheduledSMS = (contactId) => smsGatewayService.cancelScheduledSMS(contactId);
export const getSMSHistory = (contactId, limit) => smsGatewayService.getSMSHistory(contactId, limit);

export default smsGatewayService;

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/*
// Example 1: Send direct SMS
await sendSMS({
  phone: '5551234567',
  carrier: 'verizon',
  message: 'Hi John! Your credit analysis is ready.',
  contactId: 'contact_123'
});

// Example 2: Send Spin-Tax recovery
await sendSpinTaxRecovery({
  firstName: 'John',
  phone: '5551234567',
  carrier: 'tmobile',
  resumeLink: 'https://speedycreditrepair.com/enroll?id=abc123',
  contactId: 'contact_123'
});

// Example 3: Schedule recovery SMS
await scheduleRecoverySMS({
  phone: '5551234567',
  carrier: 'att',
  firstName: 'John',
  contactId: 'contact_123',
  resumeLink: 'https://speedycreditrepair.com/enroll?id=abc123',
  delayMinutes: 15
});

// Example 4: Cancel if user completes enrollment
await cancelScheduledSMS('contact_123');
*/
