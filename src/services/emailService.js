// Path: /src/services/emailService.js
// ENTERPRISE EMAIL SERVICE - 800+ LINES
// Maximum AI Integration - All Gmail Aliases with Smart Routing
// Firebase Cloud Function Integration for SpeedyCRM

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc,
  getDocs,
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  getFirestore
} from 'firebase/firestore';
import { httpsCallable, getFunctions } from 'firebase/functions';

// ===== GMAIL ALIASES CONFIGURATION =====
export const EMAIL_ALIASES = {
  CHRIS: {
    email: 'chris@speedycreditrepair.com',
    name: 'Chris Lahage - Speedy Credit Repair',
    purpose: 'Personal communications, high-value clients',
    replyTo: 'contact@speedycreditrepair.com',
    priority: 'high',
    autoRespond: false
  },
  LAURIE: {
    email: 'laurie@speedycreditrepair.com',
    name: 'Laurie - Speedy Credit Repair Operations',
    purpose: 'Operations, client management',
    replyTo: 'support@speedycreditrepair.com',
    priority: 'high',
    autoRespond: false
  },
  SUPPORT: {
    email: 'support@speedycreditrepair.com',
    name: 'Speedy Credit Repair Support',
    purpose: 'Customer support, general inquiries',
    replyTo: 'support@speedycreditrepair.com',
    priority: 'medium',
    autoRespond: true
  },
  NOREPLY: {
    email: 'noreply@speedycreditrepair.com',
    name: 'Speedy Credit Repair',
    purpose: 'Automated emails, no response expected',
    replyTo: null,
    priority: 'low',
    autoRespond: false
  },
  URGENT: {
    email: 'urgent@speedycreditrepair.com',
    name: 'Speedy Credit Repair - URGENT',
    purpose: 'Urgent communications, immediate attention',
    replyTo: 'chris@speedycreditrepair.com',
    priority: 'critical',
    autoRespond: false
  },
  INFO: {
    email: 'info@speedycreditrepair.com',
    name: 'Speedy Credit Repair Info',
    purpose: 'General information, inquiries',
    replyTo: 'support@speedycreditrepair.com',
    priority: 'medium',
    autoRespond: true
  },
  PAYMENT_SUCCESS: {
    email: 'payment-success@speedycreditrepair.com',
    name: 'Speedy Credit Repair - Payment Confirmation',
    purpose: 'Payment confirmations, receipts',
    replyTo: 'support@speedycreditrepair.com',
    priority: 'high',
    autoRespond: false
  },
  PAYMENT_FAILED: {
    email: 'payment-failed@speedycreditrepair.com',
    name: 'Speedy Credit Repair - Payment Issue',
    purpose: 'Payment failures, billing issues',
    replyTo: 'support@speedycreditrepair.com',
    priority: 'critical',
    autoRespond: true
  },
  PAYMENT_REMINDER: {
    email: 'payment-reminder@speedycreditrepair.com',
    name: 'Speedy Credit Repair - Payment Reminder',
    purpose: 'Payment reminders, billing notices',
    replyTo: 'support@speedycreditrepair.com',
    priority: 'high',
    autoRespond: false
  },
  WELCOME: {
    email: 'welcome@speedycreditrepair.com',
    name: 'Speedy Credit Repair - Welcome',
    purpose: 'Welcome emails, getting started',
    replyTo: 'support@speedycreditrepair.com',
    priority: 'medium',
    autoRespond: false
  },
  ONBOARDING: {
    email: 'onboarding@speedycreditrepair.com',
    name: 'Speedy Credit Repair - Onboarding',
    purpose: 'Onboarding sequences, setup guides',
    replyTo: 'support@speedycreditrepair.com',
    priority: 'medium',
    autoRespond: false
  },
  DISPUTE_UPDATE: {
    email: 'dispute-update@speedycreditrepair.com',
    name: 'Speedy Credit Repair - Dispute Update',
    purpose: 'Dispute status updates, results',
    replyTo: 'support@speedycreditrepair.com',
    priority: 'high',
    autoRespond: false
  },
  CREDIT_REPORT: {
    email: 'credit-report@speedycreditrepair.com',
    name: 'Speedy Credit Repair - Credit Report',
    purpose: 'Credit report delivery, analysis',
    replyTo: 'support@speedycreditrepair.com',
    priority: 'high',
    autoRespond: false
  },
  SCORE_UPDATE: {
    email: 'score-update@speedycreditrepair.com',
    name: 'Speedy Credit Repair - Score Update',
    purpose: 'Credit score updates, improvements',
    replyTo: 'support@speedycreditrepair.com',
    priority: 'high',
    autoRespond: false
  },
  APPOINTMENT: {
    email: 'appointment@speedycreditrepair.com',
    name: 'Speedy Credit Repair - Appointments',
    purpose: 'Appointment scheduling, confirmations',
    replyTo: 'support@speedycreditrepair.com',
    priority: 'medium',
    autoRespond: true
  },
  REMINDER: {
    email: 'reminder@speedycreditrepair.com',
    name: 'Speedy Credit Repair - Reminder',
    purpose: 'General reminders, follow-ups',
    replyTo: 'support@speedycreditrepair.com',
    priority: 'medium',
    autoRespond: false
  },
  TASK_ASSIGNED: {
    email: 'task-assigned@speedycreditrepair.com',
    name: 'Speedy Credit Repair - Task Assignment',
    purpose: 'Task assignments, workflow notifications',
    replyTo: 'support@speedycreditrepair.com',
    priority: 'medium',
    autoRespond: false
  },
  DOCUMENT_READY: {
    email: 'document-ready@speedycreditrepair.com',
    name: 'Speedy Credit Repair - Document Ready',
    purpose: 'Document delivery, file notifications',
    replyTo: 'support@speedycreditrepair.com',
    priority: 'medium',
    autoRespond: false
  },
  SIGNATURE_REQUIRED: {
    email: 'signature-required@speedycreditrepair.com',
    name: 'Speedy Credit Repair - Signature Required',
    purpose: 'DocuSign requests, contract signing',
    replyTo: 'support@speedycreditrepair.com',
    priority: 'high',
    autoRespond: false
  },
  COMPLIANCE_ALERT: {
    email: 'compliance-alert@speedycreditrepair.com',
    name: 'Speedy Credit Repair - Compliance Alert',
    purpose: 'Compliance notifications, regulatory updates',
    replyTo: 'admin@speedycreditrepair.com',
    priority: 'critical',
    autoRespond: false
  },
  ADMIN: {
    email: 'admin@speedycreditrepair.com',
    name: 'Speedy Credit Repair - Administration',
    purpose: 'Administrative communications, system alerts',
    replyTo: 'chris@speedycreditrepair.com',
    priority: 'high',
    autoRespond: false
  },
  REVIEW_REQUEST: {
    email: 'review-request@speedycreditrepair.com',
    name: 'Speedy Credit Repair - Review Request',
    purpose: 'Review requests, feedback collection',
    replyTo: 'support@speedycreditrepair.com',
    priority: 'low',
    autoRespond: false
  },
  NEWSLETTER: {
    email: 'newsletter@speedycreditrepair.com',
    name: 'Speedy Credit Repair Newsletter',
    purpose: 'Newsletters, educational content',
    replyTo: 'info@speedycreditrepair.com',
    priority: 'low',
    autoRespond: false
  },
  PROMO: {
    email: 'promo@speedycreditrepair.com',
    name: 'Speedy Credit Repair - Special Offer',
    purpose: 'Promotional emails, special offers',
    replyTo: 'info@speedycreditrepair.com',
    priority: 'low',
    autoRespond: false
  },
  REFERRAL: {
    email: 'referral@speedycreditrepair.com',
    name: 'Speedy Credit Repair - Referral Program',
    purpose: 'Referral program, partner communications',
    replyTo: 'info@speedycreditrepair.com',
    priority: 'medium',
    autoRespond: true
  }
};

// ===== SMART EMAIL ROUTING SYSTEM =====
export const EMAIL_TYPES = {
  // Payment Related
  PAYMENT_CONFIRMATION: { alias: 'PAYMENT_SUCCESS', category: 'payment', urgency: 'high' },
  PAYMENT_FAILURE: { alias: 'PAYMENT_FAILED', category: 'payment', urgency: 'critical' },
  PAYMENT_REMINDER: { alias: 'PAYMENT_REMINDER', category: 'payment', urgency: 'high' },
  BILLING_NOTICE: { alias: 'PAYMENT_REMINDER', category: 'payment', urgency: 'medium' },
  
  // Dispute Related
  DISPUTE_FILED: { alias: 'DISPUTE_UPDATE', category: 'dispute', urgency: 'high' },
  DISPUTE_RESULT: { alias: 'DISPUTE_UPDATE', category: 'dispute', urgency: 'high' },
  DISPUTE_STATUS_CHANGE: { alias: 'DISPUTE_UPDATE', category: 'dispute', urgency: 'medium' },
  DISPUTE_DEADLINE: { alias: 'DISPUTE_UPDATE', category: 'dispute', urgency: 'critical' },
  
  // Client Lifecycle
  WELCOME_NEW_CLIENT: { alias: 'WELCOME', category: 'onboarding', urgency: 'medium' },
  ONBOARDING_STEP: { alias: 'ONBOARDING', category: 'onboarding', urgency: 'medium' },
  ONBOARDING_COMPLETE: { alias: 'WELCOME', category: 'onboarding', urgency: 'low' },
  
  // Credit Reports & Scores
  CREDIT_REPORT_READY: { alias: 'CREDIT_REPORT', category: 'reports', urgency: 'high' },
  SCORE_IMPROVEMENT: { alias: 'SCORE_UPDATE', category: 'reports', urgency: 'high' },
  SCORE_DECREASE: { alias: 'SCORE_UPDATE', category: 'reports', urgency: 'critical' },
  MONTHLY_REPORT: { alias: 'CREDIT_REPORT', category: 'reports', urgency: 'medium' },
  
  // Communications
  APPOINTMENT_CONFIRMATION: { alias: 'APPOINTMENT', category: 'scheduling', urgency: 'medium' },
  APPOINTMENT_REMINDER: { alias: 'REMINDER', category: 'scheduling', urgency: 'high' },
  APPOINTMENT_CANCELLED: { alias: 'APPOINTMENT', category: 'scheduling', urgency: 'high' },
  APPOINTMENT_RESCHEDULED: { alias: 'APPOINTMENT', category: 'scheduling', urgency: 'medium' },
  
  // Tasks & Workflow
  TASK_NOTIFICATION: { alias: 'TASK_ASSIGNED', category: 'workflow', urgency: 'medium' },
  TASK_REMINDER: { alias: 'REMINDER', category: 'workflow', urgency: 'low' },
  TASK_OVERDUE: { alias: 'URGENT', category: 'workflow', urgency: 'critical' },
  
  // Documents
  DOCUMENT_DELIVERY: { alias: 'DOCUMENT_READY', category: 'documents', urgency: 'medium' },
  SIGNATURE_REQUEST: { alias: 'SIGNATURE_REQUIRED', category: 'documents', urgency: 'high' },
  DOCUMENT_SIGNED: { alias: 'DOCUMENT_READY', category: 'documents', urgency: 'medium' },
  CONTRACT_EXPIRING: { alias: 'URGENT', category: 'documents', urgency: 'critical' },
  
  // Marketing
  NEWSLETTER_SEND: { alias: 'NEWSLETTER', category: 'marketing', urgency: 'low' },
  PROMOTIONAL_OFFER: { alias: 'PROMO', category: 'marketing', urgency: 'low' },
  REFERRAL_INVITATION: { alias: 'REFERRAL', category: 'marketing', urgency: 'medium' },
  EDUCATIONAL_CONTENT: { alias: 'NEWSLETTER', category: 'marketing', urgency: 'low' },
  
  // Administrative
  COMPLIANCE_NOTIFICATION: { alias: 'COMPLIANCE_ALERT', category: 'admin', urgency: 'critical' },
  SYSTEM_ALERT: { alias: 'ADMIN', category: 'admin', urgency: 'high' },
  SECURITY_ALERT: { alias: 'URGENT', category: 'admin', urgency: 'critical' },
  MAINTENANCE_NOTICE: { alias: 'ADMIN', category: 'admin', urgency: 'medium' },
  
  // Support
  SUPPORT_RESPONSE: { alias: 'SUPPORT', category: 'support', urgency: 'medium' },
  URGENT_COMMUNICATION: { alias: 'URGENT', category: 'urgent', urgency: 'critical' },
  EMERGENCY_CONTACT: { alias: 'URGENT', category: 'urgent', urgency: 'critical' },
  
  // Feedback
  REVIEW_REQUEST: { alias: 'REVIEW_REQUEST', category: 'feedback', urgency: 'low' },
  SATISFACTION_SURVEY: { alias: 'REVIEW_REQUEST', category: 'feedback', urgency: 'low' },
  
  // Generic/Fallback
  GENERAL_INFO: { alias: 'INFO', category: 'general', urgency: 'low' },
  AUTOMATED_NOTIFICATION: { alias: 'NOREPLY', category: 'automated', urgency: 'low' }
};

// ===== EMAIL TEMPLATE VARIABLES =====
export const TEMPLATE_VARIABLES = {
  // Contact Information
  '{{firstName}}': 'contact.firstName',
  '{{lastName}}': 'contact.lastName',
  '{{fullName}}': 'contact.firstName + " " + contact.lastName',
  '{{email}}': 'contact.email',
  '{{phone}}': 'contact.phone',
  '{{contactId}}': 'contact.id',
  
  // Company Information
  '{{companyName}}': '"Speedy Credit Repair"',
  '{{companyPhone}}': '"(888) 724-7344"',
  '{{companyEmail}}': '"contact@speedycreditrepair.com"',
  '{{websiteUrl}}': '"https://speedycreditrepair.com"',
  '{{portalUrl}}': '"https://myclevercrm.com/client-portal"',
  
  // Date/Time Variables
  '{{currentDate}}': 'new Date().toLocaleDateString()',
  '{{currentTime}}': 'new Date().toLocaleTimeString()',
  '{{currentYear}}': 'new Date().getFullYear()',
  
  // Dynamic Content
  '{{creditScore}}': 'contact.creditScore || "N/A"',
  '{{leadScore}}': 'contact.leadScore || 0',
  '{{serviceLevel}}': 'contact.serviceLevel || "Standard"',
  '{{nextAppointment}}': 'contact.nextAppointment || "TBD"',
  
  // Personalization
  '{{personalGreeting}}': 'getPersonalizedGreeting(contact)',
  '{{serviceRecommendation}}': 'getServiceRecommendation(contact)',
  '{{nextSteps}}': 'getNextSteps(contact)'
};

// ===== MAIN EMAIL SERVICE CLASS =====
class EmailService {
  constructor() {
    this.db = getFirestore();
    this.functions = getFunctions();
    this.aliases = EMAIL_ALIASES;
    this.types = EMAIL_TYPES;
    this.templateVars = TEMPLATE_VARIABLES;
    
    // Rate limiting tracking
    this.rateLimitCounters = {
      hourly: { count: 0, resetAt: Date.now() + 3600000 }, // 1 hour
      daily: { count: 0, resetAt: Date.now() + 86400000 }  // 1 day
    };
  }

  // ===== CORE SENDING METHOD =====
  async send({
    to,
    type, // EMAIL_TYPES key for automatic alias selection
    subject,
    html,
    text = null,
    variables = {}, // For template personalization
    attachments = [],
    trackOpens = true,
    trackClicks = true,
    priority = 'normal', // low, normal, high, critical
    scheduledFor = null, // Send later
    campaignId = null,
    contactId = null,
    suppressAutoReply = false
  }) {
    try {
      console.log(`📧 EmailService: Preparing to send email type "${type}" to ${to}`);
      
      // Validate rate limits
      await this.checkRateLimit();
      
      // Get email type configuration and alias
      const emailType = this.types[type];
      if (!emailType) {
        throw new Error(`Unknown email type: ${type}`);
      }
      
      const aliasConfig = this.aliases[emailType.alias];
      if (!aliasConfig) {
        throw new Error(`Unknown alias: ${emailType.alias}`);
      }
      
      // Personalize content with variables
      const personalizedSubject = this.personalizeContent(subject, variables);
      const personalizedHtml = this.personalizeContent(html, variables);
      const personalizedText = text ? this.personalizeContent(text, variables) : null;
      
      // Add tracking if enabled
      let finalHtml = personalizedHtml;
      if (trackOpens) {
        finalHtml = this.addOpenTracking(finalHtml, to, contactId);
      }
      if (trackClicks) {
        finalHtml = this.addClickTracking(finalHtml, to, contactId);
      }
      
      // Prepare email data for Cloud Function
      const emailData = {
        from: {
          email: aliasConfig.email,
          name: aliasConfig.name,
        },
        to: Array.isArray(to) ? to : [to],
        subject: personalizedSubject,
        html: finalHtml,
        text: personalizedText,
        replyTo: aliasConfig.replyTo,
        attachments,
        priority: this.mapPriority(priority),
        scheduledFor,
        metadata: {
          type,
          alias: emailType.alias,
          category: emailType.category,
          urgency: emailType.urgency,
          campaignId,
          contactId,
          trackOpens,
          trackClicks,
          suppressAutoReply,
          sentVia: 'EmailService',
          sentAt: new Date().toISOString()
        }
      };
      
      // Send via Firebase Cloud Function
      console.log(`📧 EmailService: Sending via Cloud Function to ${aliasConfig.email}`);
      const sendEmailFunction = httpsCallable(this.functions, 'sendEmail');
      const result = await sendEmailFunction(emailData);
      
      // Log email to Firestore
      await this.logEmail(emailData, result.data);
      
      // Update rate limit counters
      this.updateRateLimitCounters();
      
      console.log(`✅ EmailService: Email sent successfully via ${aliasConfig.email}`);
      
      return {
        success: true,
        messageId: result.data.messageId,
        alias: emailType.alias,
        type,
        sentAt: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('❌ EmailService: Send failed:', error);
      
      // Log failed attempt
      await this.logFailedEmail({ to, type, subject, error: error.message });
      
      throw new Error(`Email send failed: ${error.message}`);
    }
  }

  // ===== BULK SENDING WITH RATE LIMITING =====
  async sendBulk(emails, options = {}) {
    const {
      batchSize = 50,
      delayBetweenBatches = 2000, // 2 seconds
      maxRetries = 3,
      continueOnError = true
    } = options;
    
    console.log(`📧 EmailService: Starting bulk send of ${emails.length} emails`);
    
    const results = [];
    const batches = this.chunkArray(emails, batchSize);
    
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      
      console.log(`📧 EmailService: Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} emails)`);
      
      // Process batch with Promise.allSettled for error handling
      const batchPromises = batch.map(async (email, emailIndex) => {
        let attempts = 0;
        let lastError = null;
        
        while (attempts < maxRetries) {
          try {
            const result = await this.send(email);
            return { success: true, email, result };
          } catch (error) {
            lastError = error;
            attempts++;
            
            if (attempts < maxRetries) {
              // Wait before retry (exponential backoff)
              const delay = Math.pow(2, attempts) * 1000;
              console.log(`⏳ EmailService: Retrying email ${emailIndex + 1} in ${delay}ms (attempt ${attempts + 1}/${maxRetries})`);
              await this.delay(delay);
            }
          }
        }
        
        // All retries failed
        console.error(`❌ EmailService: Email ${emailIndex + 1} failed after ${maxRetries} attempts:`, lastError);
        
        if (!continueOnError) {
          throw lastError;
        }
        
        return { success: false, email, error: lastError };
      });
      
      const batchResults = await Promise.allSettled(batchPromises);
      results.push(...batchResults.map(result => 
        result.status === 'fulfilled' ? result.value : { success: false, error: result.reason }
      ));
      
      // Delay between batches (except last batch)
      if (batchIndex < batches.length - 1) {
        console.log(`⏳ EmailService: Waiting ${delayBetweenBatches}ms before next batch`);
        await this.delay(delayBetweenBatches);
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;
    
    console.log(`✅ EmailService: Bulk send complete - ${successCount} sent, ${failureCount} failed`);
    
    return {
      total: emails.length,
      successful: successCount,
      failed: failureCount,
      results
    };
  }

  // ===== TEMPLATE PERSONALIZATION =====
  personalizeContent(content, variables) {
    if (!content) return content;
    
    let personalizedContent = content;
    
    // Apply provided variables
    Object.keys(variables).forEach(key => {
      const placeholder = key.startsWith('{{') ? key : `{{${key}}}`;
      const value = variables[key] || '';
      personalizedContent = personalizedContent.replace(new RegExp(placeholder, 'g'), value);
    });
    
    // Apply default template variables
    Object.keys(this.templateVars).forEach(placeholder => {
      if (personalizedContent.includes(placeholder)) {
        try {
          // This would be executed in a more sophisticated template engine
          // For now, just replace common ones
          switch (placeholder) {
            case '{{companyName}}':
              personalizedContent = personalizedContent.replace(placeholder, 'Speedy Credit Repair');
              break;
            case '{{companyPhone}}':
              personalizedContent = personalizedContent.replace(placeholder, '(888) 724-7344');
              break;
            case '{{currentYear}}':
              personalizedContent = personalizedContent.replace(placeholder, new Date().getFullYear());
              break;
            case '{{currentDate}}':
              personalizedContent = personalizedContent.replace(placeholder, new Date().toLocaleDateString());
              break;
            default:
              // Keep placeholder if no value available
              break;
          }
        } catch (error) {
          console.warn(`⚠️ EmailService: Failed to process template variable ${placeholder}:`, error);
        }
      }
    });
    
    return personalizedContent;
  }

  // ===== TRACKING IMPLEMENTATION =====
  addOpenTracking(html, recipient, contactId) {
    const trackingId = this.generateTrackingId(recipient, contactId, 'open');
    const trackingPixel = `<img src="https://myclevercrm.com/api/email-tracking/open?id=${trackingId}" width="1" height="1" style="display:none;" alt="" />`;
    
    // Insert before closing body tag
    if (html.includes('</body>')) {
      return html.replace('</body>', trackingPixel + '</body>');
    } else {
      return html + trackingPixel;
    }
  }
  
  addClickTracking(html, recipient, contactId) {
    // Find all links and wrap them with tracking
    return html.replace(/<a\s+([^>]*href=["']([^"']+)["'][^>]*)>/gi, (match, attributes, originalUrl) => {
      const trackingId = this.generateTrackingId(recipient, contactId, 'click');
      const trackingUrl = `https://myclevercrm.com/api/email-tracking/click?id=${trackingId}&url=${encodeURIComponent(originalUrl)}`;
      
      return `<a ${attributes.replace(/href=["'][^"']+["']/, `href="${trackingUrl}"`)}`;
    });
  }
  
  generateTrackingId(recipient, contactId, type) {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2);
    return `${type}_${contactId || 'unknown'}_${timestamp}_${randomId}`;
  }

  // ===== RATE LIMITING =====
  async checkRateLimit() {
    const now = Date.now();
    
    // Reset counters if time windows have passed
    if (now > this.rateLimitCounters.hourly.resetAt) {
      this.rateLimitCounters.hourly = { count: 0, resetAt: now + 3600000 };
    }
    if (now > this.rateLimitCounters.daily.resetAt) {
      this.rateLimitCounters.daily = { count: 0, resetAt: now + 86400000 };
    }
    
    // Check limits (Gmail SMTP: 2000/day, 500/hour)
    if (this.rateLimitCounters.hourly.count >= 500) {
      const waitTime = this.rateLimitCounters.hourly.resetAt - now;
      throw new Error(`Hourly rate limit reached. Wait ${Math.ceil(waitTime / 60000)} minutes.`);
    }
    
    if (this.rateLimitCounters.daily.count >= 2000) {
      const waitTime = this.rateLimitCounters.daily.resetAt - now;
      throw new Error(`Daily rate limit reached. Wait ${Math.ceil(waitTime / 3600000)} hours.`);
    }
  }
  
  updateRateLimitCounters() {
    this.rateLimitCounters.hourly.count++;
    this.rateLimitCounters.daily.count++;
  }

  // ===== EMAIL LOGGING =====
  async logEmail(emailData, result) {
    try {
      const logEntry = {
        to: emailData.to,
        from: emailData.from.email,
        alias: emailData.metadata.alias,
        type: emailData.metadata.type,
        category: emailData.metadata.category,
        urgency: emailData.metadata.urgency,
        subject: emailData.subject,
        sentAt: serverTimestamp(),
        messageId: result.messageId,
        status: 'sent',
        trackOpens: emailData.metadata.trackOpens,
        trackClicks: emailData.metadata.trackClicks,
        campaignId: emailData.metadata.campaignId,
        contactId: emailData.metadata.contactId,
        priority: emailData.priority,
        opens: 0,
        clicks: 0,
        lastOpened: null,
        lastClicked: null
      };
      
      await addDoc(collection(this.db, 'emailLogs'), logEntry);
      console.log(`📝 EmailService: Email logged to Firestore`);
    } catch (error) {
      console.error('❌ EmailService: Failed to log email:', error);
    }
  }
  
  async logFailedEmail({ to, type, subject, error }) {
    try {
      const logEntry = {
        to,
        type,
        subject,
        status: 'failed',
        error,
        attemptedAt: serverTimestamp()
      };
      
      await addDoc(collection(this.db, 'emailFailures'), logEntry);
    } catch (logError) {
      console.error('❌ EmailService: Failed to log failed email:', logError);
    }
  }

  // ===== ANALYTICS METHODS =====
  async getEmailAnalytics(emailId) {
    try {
      const emailDoc = await doc(this.db, 'emailLogs', emailId);
      const emailData = (await emailDoc.get()).data();
      
      if (!emailData) {
        throw new Error('Email not found');
      }
      
      return {
        id: emailId,
        sent: emailData.sentAt?.toDate(),
        opens: emailData.opens || 0,
        clicks: emailData.clicks || 0,
        lastOpened: emailData.lastOpened?.toDate(),
        lastClicked: emailData.lastClicked?.toDate(),
        openRate: emailData.opens > 0 ? 100 : 0,
        clickRate: emailData.clicks > 0 ? ((emailData.clicks / Math.max(emailData.opens, 1)) * 100).toFixed(2) : 0,
        status: emailData.status
      };
    } catch (error) {
      console.error('❌ EmailService: Failed to get email analytics:', error);
      throw error;
    }
  }
  
  async getCampaignAnalytics(campaignId) {
    try {
      const campaignQuery = query(
        collection(this.db, 'emailLogs'),
        where('campaignId', '==', campaignId),
        orderBy('sentAt', 'desc')
      );
      
      const querySnapshot = await getDocs(campaignQuery);
      const emails = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const totalEmails = emails.length;
      const totalOpens = emails.reduce((sum, email) => sum + (email.opens || 0), 0);
      const totalClicks = emails.reduce((sum, email) => sum + (email.clicks || 0), 0);
      const uniqueOpens = emails.filter(email => email.opens > 0).length;
      const uniqueClicks = emails.filter(email => email.clicks > 0).length;
      
      return {
        campaignId,
        totalEmails,
        totalOpens,
        totalClicks,
        uniqueOpens,
        uniqueClicks,
        openRate: totalEmails > 0 ? ((uniqueOpens / totalEmails) * 100).toFixed(2) : 0,
        clickRate: uniqueOpens > 0 ? ((uniqueClicks / uniqueOpens) * 100).toFixed(2) : 0,
        clickToOpenRate: totalOpens > 0 ? ((totalClicks / totalOpens) * 100).toFixed(2) : 0
      };
    } catch (error) {
      console.error('❌ EmailService: Failed to get campaign analytics:', error);
      throw error;
    }
  }
  
  async getAliasUsageStats() {
    try {
      const statsQuery = query(
        collection(this.db, 'emailLogs'),
        orderBy('sentAt', 'desc'),
        limit(1000) // Last 1000 emails
      );
      
      const querySnapshot = await getDocs(statsQuery);
      const emails = querySnapshot.docs.map(doc => doc.data());
      
      const aliasCounts = {};
      const categoryCounts = {};
      
      emails.forEach(email => {
        aliasCounts[email.alias] = (aliasCounts[email.alias] || 0) + 1;
        categoryCounts[email.category] = (categoryCounts[email.category] || 0) + 1;
      });
      
      return {
        totalEmails: emails.length,
        aliasCounts,
        categoryCounts,
        mostUsedAlias: Object.keys(aliasCounts).reduce((a, b) => 
          aliasCounts[a] > aliasCounts[b] ? a : b, ''),
        mostUsedCategory: Object.keys(categoryCounts).reduce((a, b) => 
          categoryCounts[a] > categoryCounts[b] ? a : b, '')
      };
    } catch (error) {
      console.error('❌ EmailService: Failed to get alias usage stats:', error);
      throw error;
    }
  }

  // ===== UTILITY METHODS =====
  chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  mapPriority(priority) {
    switch (priority) {
      case 'critical': return 1;
      case 'high': return 2;
      case 'normal': return 3;
      case 'low': return 4;
      default: return 3;
    }
  }
  
  validateEmailAddress(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  generateCampaignId(prefix = 'campaign') {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2);
    return `${prefix}_${timestamp}_${randomId}`;
  }
}

// ===== QUICK ACCESS FUNCTIONS =====

// Create singleton instance
const emailService = new EmailService();

// Quick send function for common use cases
export const sendEmail = async (options) => {
  return emailService.send(options);
};

// Quick bulk send function
export const sendBulkEmails = async (emails, options = {}) => {
  return emailService.sendBulk(emails, options);
};

// Analytics functions
export const getEmailAnalytics = async (emailId) => {
  return emailService.getEmailAnalytics(emailId);
};

export const getCampaignAnalytics = async (campaignId) => {
  return emailService.getCampaignAnalytics(campaignId);
};

// Export the main service instance
export default emailService;

// ===== USAGE EXAMPLES =====

// Example 1: Send welcome email
/*
await sendEmail({
  to: 'client@example.com',
  type: 'WELCOME_NEW_CLIENT',
  subject: 'Welcome to Speedy Credit Repair, {{firstName}}!',
  html: '<h1>Welcome {{firstName}}!</h1><p>We are excited to help you improve your credit!</p>',
  variables: {
    firstName: 'John',
    lastName: 'Doe'
  },
  contactId: 'contact_123'
});
*/

// Example 2: Send payment confirmation
/*
await sendEmail({
  to: 'client@example.com',
  type: 'PAYMENT_CONFIRMATION',
  subject: 'Payment Received - Thank You!',
  html: '<p>Your payment of ${{amount}} has been received. Thank you!</p>',
  variables: {
    amount: '199.00',
    firstName: 'John'
  }
});
*/

// Example 3: Bulk marketing campaign
/*
const recipients = [
  { to: 'client1@example.com', variables: { firstName: 'John' } },
  { to: 'client2@example.com', variables: { firstName: 'Jane' } },
  // ... more recipients
];

const bulkEmails = recipients.map(recipient => ({
  to: recipient.to,
  type: 'NEWSLETTER_SEND',
  subject: 'Monthly Credit Tips for {{firstName}}',
  html: '<h1>Hi {{firstName}}!</h1><p>Here are this month\'s credit tips...</p>',
  variables: recipient.variables
}));

await sendBulkEmails(bulkEmails, { batchSize: 50, delayBetweenBatches: 3000 });
*/

/*
© 1995-2025 Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved.
Trademark registered USPTO, violations prosecuted.
*/