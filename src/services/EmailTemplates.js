/**
 * EmailTemplates.js
 *
 * Professional email templates for all 20+ SpeedyCreditRepair.com aliases
 * Uses personalization variables like {{firstName}}, {{companyName}}, etc.
 *
 * Template categories:
 * - Welcome & Onboarding
 * - Payment Processing
 * - Dispute Management
 * - Credit Reports & Scores
 * - Appointments & Reminders
 * - Document Signing
 * - Compliance & Admin
 * - Marketing & Engagement
 *
 * @author Claude Code
 * @date 2025-12-04
 */

// Base email wrapper for consistent branding
const emailWrapper = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Speedy Credit Repair</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .email-header {
      background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
      color: #ffffff;
      padding: 30px 20px;
      text-align: center;
    }
    .email-header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .email-header p {
      margin: 10px 0 0;
      font-size: 16px;
      opacity: 0.9;
    }
    .email-body {
      padding: 30px 20px;
    }
    .email-body h2 {
      color: #1976d2;
      font-size: 24px;
      margin-top: 0;
    }
    .email-body p {
      margin: 15px 0;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background-color: #1976d2;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 5px;
      font-weight: 600;
      margin: 20px 0;
    }
    .button:hover {
      background-color: #1565c0;
    }
    .info-box {
      background-color: #e3f2fd;
      border-left: 4px solid #1976d2;
      padding: 15px;
      margin: 20px 0;
    }
    .success-box {
      background-color: #e8f5e9;
      border-left: 4px solid #4caf50;
      padding: 15px;
      margin: 20px 0;
    }
    .warning-box {
      background-color: #fff3e0;
      border-left: 4px solid #ff9800;
      padding: 15px;
      margin: 20px 0;
    }
    .email-footer {
      background-color: #f9f9f9;
      padding: 20px;
      text-align: center;
      font-size: 14px;
      color: #666;
      border-top: 1px solid #e0e0e0;
    }
    .email-footer a {
      color: #1976d2;
      text-decoration: none;
    }
    .social-links {
      margin: 15px 0;
    }
    .social-links a {
      display: inline-block;
      margin: 0 10px;
      color: #1976d2;
      text-decoration: none;
    }
    ul {
      padding-left: 20px;
    }
    li {
      margin: 10px 0;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1>⚡ Speedy Credit Repair</h1>
      <p>Your Partner in Credit Excellence</p>
    </div>
    ${content}
    <div class="email-footer">
      <p><strong>Speedy Credit Repair</strong></p>
      <p>Phone: (800) 555-CREDIT | Email: support@speedycreditrepair.com</p>
      <p>Website: <a href="https://speedycreditrepair.com">speedycreditrepair.com</a></p>
      <div class="social-links">
        <a href="#">Facebook</a> | <a href="#">Twitter</a> | <a href="#">LinkedIn</a>
      </div>
      <p style="font-size: 12px; color: #999; margin-top: 20px;">
        © ${new Date().getFullYear()} Speedy Credit Repair. All rights reserved.<br>
        <a href="{{unsubscribeUrl}}">Unsubscribe</a> | <a href="{{preferencesUrl}}">Email Preferences</a>
      </p>
    </div>
  </div>
</body>
</html>
`;

// =============================================================================
// WELCOME & ONBOARDING TEMPLATES
// =============================================================================

export const WELCOME_NEW_CLIENT = {
  subject: 'Welcome to Speedy Credit Repair, {{firstName}}! 🎉',
  html: (vars) => emailWrapper(`
    <div class="email-body">
      <h2>Welcome Aboard, ${vars.firstName}! 🎉</h2>
      <p>Thank you for choosing Speedy Credit Repair! We're thrilled to partner with you on your journey to financial freedom.</p>

      <div class="success-box">
        <strong>Your account is now active!</strong><br>
        Account ID: <strong>${vars.accountId || 'SCR-XXXXX'}</strong>
      </div>

      <h3>What Happens Next?</h3>
      <ul>
        <li><strong>Step 1:</strong> Complete your onboarding questionnaire (5 minutes)</li>
        <li><strong>Step 2:</strong> Upload your credit reports or authorize us to pull them</li>
        <li><strong>Step 3:</strong> Our AI will analyze your reports within 24 hours</li>
        <li><strong>Step 4:</strong> Review your personalized action plan</li>
        <li><strong>Step 5:</strong> We'll begin disputing negative items immediately</li>
      </ul>

      <a href="${vars.dashboardUrl || 'https://myclevercrm.com/dashboard'}" class="button">Get Started Now</a>

      <p><strong>Need help?</strong> Our team is here for you:</p>
      <ul>
        <li>📧 Email: support@speedycreditrepair.com</li>
        <li>📞 Phone: (800) 555-CREDIT</li>
        <li>💬 Live Chat: Available in your dashboard</li>
      </ul>

      <p>To your credit success,<br>
      <strong>Chris Lahage & The Speedy Credit Repair Team</strong></p>
    </div>
  `),
  variables: ['firstName', 'accountId', 'dashboardUrl'],
};

export const ONBOARDING_STEP_1 = {
  subject: 'Complete Your Profile - Step 1 of 5',
  html: (vars) => emailWrapper(`
    <div class="email-body">
      <h2>Let's Get Your Profile Set Up, ${vars.firstName}</h2>
      <p>You're making great progress! Let's complete the first step of your onboarding.</p>

      <div class="info-box">
        <strong>Step 1: Basic Information</strong><br>
        This helps us understand your credit goals and tailor our services to your needs.
      </div>

      <p><strong>What we'll ask:</strong></p>
      <ul>
        <li>Your credit goals (buying a home, car, better rates, etc.)</li>
        <li>Current credit score range (if known)</li>
        <li>Timeline for credit improvement</li>
        <li>Any specific accounts you're concerned about</li>
      </ul>

      <a href="${vars.onboardingUrl || 'https://myclevercrm.com/onboarding'}" class="button">Continue Onboarding</a>

      <p>This will only take 3-5 minutes!</p>
    </div>
  `),
  variables: ['firstName', 'onboardingUrl'],
};

// =============================================================================
// PAYMENT TEMPLATES
// =============================================================================

export const PAYMENT_SUCCESS = {
  subject: 'Payment Received - Thank You! ✅',
  html: (vars) => emailWrapper(`
    <div class="email-body">
      <h2>Payment Confirmed, ${vars.firstName}!</h2>

      <div class="success-box">
        <strong>✅ Payment Successful</strong><br>
        Amount: <strong>$${vars.amount}</strong><br>
        Date: ${vars.paymentDate}<br>
        Receipt #: ${vars.receiptNumber}
      </div>

      <h3>Payment Details:</h3>
      <ul>
        <li><strong>Service:</strong> ${vars.serviceName || 'Credit Repair Services'}</li>
        <li><strong>Billing Period:</strong> ${vars.billingPeriod || 'Current Month'}</li>
        <li><strong>Payment Method:</strong> ${vars.paymentMethod || 'Credit Card ending in ' + (vars.last4 || 'XXXX')}</li>
        <li><strong>Next Billing Date:</strong> ${vars.nextBillingDate || 'N/A'}</li>
      </ul>

      <a href="${vars.receiptUrl || '#'}" class="button">Download Receipt</a>

      <p>Your account is up to date and all services remain active.</p>

      <p>Questions about your payment? Contact us at payment-success@speedycreditrepair.com</p>
    </div>
  `),
  variables: ['firstName', 'amount', 'paymentDate', 'receiptNumber', 'serviceName', 'billingPeriod', 'paymentMethod', 'last4', 'nextBillingDate', 'receiptUrl'],
};

export const PAYMENT_FAILED = {
  subject: 'Payment Issue - Action Required ⚠️',
  html: (vars) => emailWrapper(`
    <div class="email-body">
      <h2>Payment Issue Detected</h2>

      <div class="warning-box">
        <strong>⚠️ Payment Failed</strong><br>
        Amount: <strong>$${vars.amount}</strong><br>
        Date Attempted: ${vars.attemptDate}<br>
        Reason: ${vars.failureReason || 'Card declined'}
      </div>

      <p>Hi ${vars.firstName},</p>
      <p>We were unable to process your payment. This could be due to:</p>
      <ul>
        <li>Insufficient funds</li>
        <li>Expired or incorrect card details</li>
        <li>Card security restrictions</li>
        <li>Billing address mismatch</li>
      </ul>

      <h3>What You Need to Do:</h3>
      <p>Please update your payment method within <strong>3 days</strong> to avoid service interruption.</p>

      <a href="${vars.updatePaymentUrl || 'https://myclevercrm.com/billing'}" class="button">Update Payment Method</a>

      <p>Need assistance? Our billing team is here to help:<br>
      📧 payment-failed@speedycreditrepair.com<br>
      📞 (800) 555-CREDIT</p>
    </div>
  `),
  variables: ['firstName', 'amount', 'attemptDate', 'failureReason', 'updatePaymentUrl'],
};

export const PAYMENT_REMINDER = {
  subject: 'Payment Due in 3 Days - {{firstName}}',
  html: (vars) => emailWrapper(`
    <div class="email-body">
      <h2>Friendly Payment Reminder</h2>

      <div class="info-box">
        <strong>Payment Due Soon</strong><br>
        Amount: <strong>$${vars.amount}</strong><br>
        Due Date: <strong>${vars.dueDate}</strong><br>
        Days Remaining: <strong>${vars.daysRemaining || 3}</strong>
      </div>

      <p>Hi ${vars.firstName},</p>
      <p>This is a friendly reminder that your payment is due in ${vars.daysRemaining || 3} days.</p>

      <h3>Payment Details:</h3>
      <ul>
        <li><strong>Amount Due:</strong> $${vars.amount}</li>
        <li><strong>Service:</strong> ${vars.serviceName || 'Credit Repair Services'}</li>
        <li><strong>Payment Method:</strong> ${vars.paymentMethod || 'Card ending in ' + (vars.last4 || 'XXXX')}</li>
      </ul>

      <a href="${vars.payNowUrl || 'https://myclevercrm.com/billing'}" class="button">Pay Now</a>

      <p><strong>Auto-pay enabled?</strong> No action needed - we'll process your payment automatically on ${vars.dueDate}.</p>

      <p>Questions? Email payment-reminder@speedycreditrepair.com</p>
    </div>
  `),
  variables: ['firstName', 'amount', 'dueDate', 'daysRemaining', 'serviceName', 'paymentMethod', 'last4', 'payNowUrl'],
};

// =============================================================================
// DISPUTE MANAGEMENT TEMPLATES
// =============================================================================

export const DISPUTE_FILED = {
  subject: 'Dispute Filed Successfully - {{accountName}}',
  html: (vars) => emailWrapper(`
    <div class="email-body">
      <h2>Dispute Filed, ${vars.firstName}!</h2>

      <div class="success-box">
        <strong>✅ Dispute Submitted</strong><br>
        Account: <strong>${vars.accountName}</strong><br>
        Bureau(s): ${vars.bureaus || 'Experian, Equifax, TransUnion'}<br>
        Filed: ${vars.filedDate}
      </div>

      <h3>Dispute Details:</h3>
      <ul>
        <li><strong>Item Being Disputed:</strong> ${vars.accountName}</li>
        <li><strong>Dispute Reason:</strong> ${vars.disputeReason || 'Not Mine / Inaccurate'}</li>
        <li><strong>Method:</strong> ${vars.disputeMethod || 'Fax (Telnyx)'}</li>
        <li><strong>Expected Response:</strong> ${vars.responseDate || '30-45 days'}</li>
      </ul>

      <div class="info-box">
        <strong>What Happens Next?</strong><br>
        The credit bureau(s) have 30 days to investigate and respond. We'll monitor the status and notify you of any updates.
      </div>

      <a href="${vars.disputeTrackingUrl || 'https://myclevercrm.com/disputes'}" class="button">Track Dispute Status</a>

      <p>We'll send you updates as soon as we hear back from the bureaus.</p>
    </div>
  `),
  variables: ['firstName', 'accountName', 'bureaus', 'filedDate', 'disputeReason', 'disputeMethod', 'responseDate', 'disputeTrackingUrl'],
};

export const DISPUTE_UPDATE = {
  subject: 'Dispute Update - {{accountName}} {{status}}',
  html: (vars) => emailWrapper(`
    <div class="email-body">
      <h2>Dispute Update Available</h2>

      <div class="${vars.status === 'DELETED' ? 'success-box' : 'info-box'}">
        <strong>${vars.status === 'DELETED' ? '🎉 Great News!' : '📋 Status Update'}</strong><br>
        Account: <strong>${vars.accountName}</strong><br>
        Status: <strong>${vars.statusText || vars.status}</strong><br>
        Updated: ${vars.updateDate}
      </div>

      <p>Hi ${vars.firstName},</p>
      <p>${vars.updateMessage || 'We have an update on your dispute.'}</p>

      ${vars.status === 'DELETED' ? `
        <h3>🎉 Congratulations!</h3>
        <p>The negative item has been <strong>successfully removed</strong> from your ${vars.bureau || 'credit'} report!</p>

        <div class="success-box">
          <strong>Estimated Score Impact:</strong><br>
          Your credit score may increase by <strong>${vars.scoreImpact || '10-30'} points</strong> within the next reporting cycle.
        </div>
      ` : `
        <h3>Current Status:</h3>
        <p>${vars.statusDescription || 'The bureau is still investigating this dispute.'}</p>
      `}

      <a href="${vars.detailsUrl || 'https://myclevercrm.com/disputes'}" class="button">View Full Details</a>

      <p>We'll continue monitoring and keep you updated.</p>
    </div>
  `),
  variables: ['firstName', 'accountName', 'status', 'statusText', 'updateDate', 'updateMessage', 'bureau', 'scoreImpact', 'statusDescription', 'detailsUrl'],
};

// =============================================================================
// CREDIT REPORT & SCORE TEMPLATES
// =============================================================================

export const CREDIT_REPORT_READY = {
  subject: 'Your Credit Report is Ready 📊',
  html: (vars) => emailWrapper(`
    <div class="email-body">
      <h2>Your Credit Report is Ready, ${vars.firstName}!</h2>

      <div class="success-box">
        <strong>✅ Report Generated</strong><br>
        Bureaus: ${vars.bureaus || 'Experian, Equifax, TransUnion'}<br>
        Date: ${vars.reportDate}<br>
        Report ID: ${vars.reportId}
      </div>

      <h3>Report Summary:</h3>
      <ul>
        <li><strong>Total Accounts:</strong> ${vars.totalAccounts || 'N/A'}</li>
        <li><strong>Negative Items:</strong> ${vars.negativeItems || 'N/A'}</li>
        <li><strong>Inquiries:</strong> ${vars.inquiries || 'N/A'}</li>
        <li><strong>Utilization:</strong> ${vars.utilization || 'N/A'}%</li>
      </ul>

      ${vars.aiAnalysisComplete ? `
        <div class="info-box">
          <strong>🤖 AI Analysis Complete</strong><br>
          Our AI has identified <strong>${vars.disputeOpportunities || 0} items</strong> that we can dispute for potential removal.
        </div>
      ` : ''}

      <a href="${vars.reportUrl || 'https://myclevercrm.com/reports'}" class="button">View Full Report</a>

      <p>Questions about your report? Email credit-report@speedycreditrepair.com</p>
    </div>
  `),
  variables: ['firstName', 'bureaus', 'reportDate', 'reportId', 'totalAccounts', 'negativeItems', 'inquiries', 'utilization', 'aiAnalysisComplete', 'disputeOpportunities', 'reportUrl'],
};

export const SCORE_UPDATE = {
  subject: '📈 Credit Score Update - {{scoreChange}} Points!',
  html: (vars) => emailWrapper(`
    <div class="email-body">
      <h2>Credit Score Update</h2>

      <div class="${vars.scoreChange >= 0 ? 'success-box' : 'warning-box'}">
        <strong>${vars.scoreChange >= 0 ? '📈 Score Increased!' : '📉 Score Changed'}</strong><br>
        Previous Score: <strong>${vars.previousScore}</strong><br>
        Current Score: <strong>${vars.currentScore}</strong><br>
        Change: <strong>${vars.scoreChange >= 0 ? '+' : ''}${vars.scoreChange} points</strong>
      </div>

      <p>Hi ${vars.firstName},</p>
      <p>${vars.scoreChange >= 0
        ? `Great news! Your credit score has increased by ${vars.scoreChange} points!`
        : `Your credit score has changed. Let's review what happened and get back on track.`
      }</p>

      <h3>What Contributed to This Change:</h3>
      <ul>
        ${(vars.factors || []).map(factor => `<li>${factor}</li>`).join('')}
      </ul>

      ${vars.scoreChange >= 0 ? `
        <h3>Keep Up The Momentum!</h3>
        <p>Here's how to maintain and continue improving your score:</p>
        <ul>
          <li>Keep credit utilization below 30%</li>
          <li>Pay all bills on time</li>
          <li>Don't close old credit accounts</li>
          <li>Continue dispute process for negative items</li>
        </ul>
      ` : `
        <h3>Let's Get Back on Track</h3>
        <p>Our team is analyzing what happened. We'll reach out with recommendations within 24 hours.</p>
      `}

      <a href="${vars.scoreDetailsUrl || 'https://myclevercrm.com/scores'}" class="button">View Score Details</a>
    </div>
  `),
  variables: ['firstName', 'previousScore', 'currentScore', 'scoreChange', 'factors', 'scoreDetailsUrl'],
};

// =============================================================================
// APPOINTMENTS & REMINDERS
// =============================================================================

export const APPOINTMENT_CONFIRMATION = {
  subject: 'Appointment Confirmed - {{appointmentDate}}',
  html: (vars) => emailWrapper(`
    <div class="email-body">
      <h2>Appointment Confirmed</h2>

      <div class="success-box">
        <strong>✅ You're All Set!</strong><br>
        Date: <strong>${vars.appointmentDate}</strong><br>
        Time: <strong>${vars.appointmentTime}</strong><br>
        Duration: ${vars.duration || '30 minutes'}
      </div>

      <p>Hi ${vars.firstName},</p>
      <p>Your appointment with ${vars.repName || 'our team'} has been confirmed.</p>

      <h3>Meeting Details:</h3>
      <ul>
        <li><strong>Purpose:</strong> ${vars.purpose || 'Credit Review'}</li>
        <li><strong>Format:</strong> ${vars.format || 'Phone Call'}</li>
        ${vars.phoneNumber ? `<li><strong>We'll Call:</strong> ${vars.phoneNumber}</li>` : ''}
        ${vars.meetingLink ? `<li><strong>Video Link:</strong> <a href="${vars.meetingLink}">Join Meeting</a></li>` : ''}
      </ul>

      <div class="info-box">
        <strong>📋 What to Prepare:</strong><br>
        ${(vars.preparation || ['Have your latest credit reports handy', 'List any questions or concerns', 'Be in a quiet place for the call']).map(item => `• ${item}<br>`).join('')}
      </div>

      <a href="${vars.calendarUrl || '#'}" class="button">Add to Calendar</a>

      <p>Need to reschedule? Email appointment@speedycreditrepair.com</p>
    </div>
  `),
  variables: ['firstName', 'appointmentDate', 'appointmentTime', 'duration', 'repName', 'purpose', 'format', 'phoneNumber', 'meetingLink', 'preparation', 'calendarUrl'],
};

export const APPOINTMENT_REMINDER = {
  subject: 'Reminder: Appointment Tomorrow at {{appointmentTime}}',
  html: (vars) => emailWrapper(`
    <div class="email-body">
      <h2>Appointment Reminder</h2>

      <div class="warning-box">
        <strong>⏰ Appointment Tomorrow</strong><br>
        Date: <strong>${vars.appointmentDate}</strong><br>
        Time: <strong>${vars.appointmentTime}</strong><br>
        With: ${vars.repName || 'Our Team'}
      </div>

      <p>Hi ${vars.firstName},</p>
      <p>This is a friendly reminder about your appointment tomorrow.</p>

      ${vars.meetingLink ? `
        <a href="${vars.meetingLink}" class="button">Join Video Meeting</a>
      ` : `
        <p><strong>We'll call you at:</strong> ${vars.phoneNumber}</p>
      `}

      <p>See you tomorrow!</p>
    </div>
  `),
  variables: ['firstName', 'appointmentDate', 'appointmentTime', 'repName', 'meetingLink', 'phoneNumber'],
};

export const TASK_REMINDER = {
  subject: 'Task Reminder: {{taskName}}',
  html: (vars) => emailWrapper(`
    <div class="email-body">
      <h2>You Have a Pending Task</h2>

      <div class="info-box">
        <strong>📋 Task:</strong> ${vars.taskName}<br>
        <strong>Due:</strong> ${vars.dueDate}<br>
        <strong>Priority:</strong> ${vars.priority || 'Normal'}
      </div>

      <p>Hi ${vars.firstName},</p>
      <p>${vars.taskDescription || 'You have a task that needs your attention.'}</p>

      <a href="${vars.taskUrl || 'https://myclevercrm.com/tasks'}" class="button">Complete Task</a>

      <p>Questions? Reply to this email or contact your credit specialist.</p>
    </div>
  `),
  variables: ['firstName', 'taskName', 'dueDate', 'priority', 'taskDescription', 'taskUrl'],
};

// =============================================================================
// DOCUMENT SIGNING
// =============================================================================

export const DOCUMENT_READY = {
  subject: 'Document Ready for Signature - {{documentName}}',
  html: (vars) => emailWrapper(`
    <div class="email-body">
      <h2>Document Ready for Your Signature</h2>

      <div class="info-box">
        <strong>📄 Document:</strong> ${vars.documentName}<br>
        <strong>Sent:</strong> ${vars.sentDate}<br>
        <strong>Deadline:</strong> ${vars.deadline || 'Within 7 days'}
      </div>

      <p>Hi ${vars.firstName},</p>
      <p>We've prepared ${vars.documentName} for your review and signature.</p>

      <h3>What's in this document:</h3>
      <p>${vars.documentDescription || 'This document contains important information regarding your credit repair services.'}</p>

      <a href="${vars.signingUrl || '#'}" class="button">Review & Sign Document</a>

      <div class="info-box">
        <strong>⏱️ This should only take 2-3 minutes.</strong><br>
        The document is secure and uses electronic signature technology.
      </div>

      <p>Need help? Email document-ready@speedycreditrepair.com</p>
    </div>
  `),
  variables: ['firstName', 'documentName', 'sentDate', 'deadline', 'documentDescription', 'signingUrl'],
};

export const SIGNATURE_REQUIRED = {
  subject: 'Signature Required - Action Needed',
  html: (vars) => emailWrapper(`
    <div class="email-body">
      <h2>Signature Required</h2>

      <div class="warning-box">
        <strong>⚠️ Action Required</strong><br>
        Document: <strong>${vars.documentName}</strong><br>
        Days Remaining: <strong>${vars.daysRemaining || 3}</strong>
      </div>

      <p>Hi ${vars.firstName},</p>
      <p>We're still waiting for your signature on <strong>${vars.documentName}</strong>.</p>

      <p><strong>Why this is important:</strong><br>
      ${vars.importance || 'We cannot proceed with your credit repair services until this document is signed.'}</p>

      <a href="${vars.signingUrl || '#'}" class="button">Sign Now (2 minutes)</a>

      <p>Questions? We're here to help:<br>
      📧 signature-required@speedycreditrepair.com<br>
      📞 (800) 555-CREDIT</p>
    </div>
  `),
  variables: ['firstName', 'documentName', 'daysRemaining', 'importance', 'signingUrl'],
};

// =============================================================================
// COMPLIANCE & ADMIN
// =============================================================================

export const COMPLIANCE_ALERT = {
  subject: '🔒 Important Compliance Notice',
  html: (vars) => emailWrapper(`
    <div class="email-body">
      <h2>Important Compliance Notice</h2>

      <div class="warning-box">
        <strong>🔒 Action Required</strong><br>
        Type: ${vars.alertType}<br>
        Due: ${vars.dueDate}
      </div>

      <p>Hi ${vars.firstName},</p>
      <p>${vars.alertMessage}</p>

      ${vars.actionRequired ? `
        <h3>What You Need to Do:</h3>
        <p>${vars.actionRequired}</p>
        <a href="${vars.actionUrl || '#'}" class="button">Take Action</a>
      ` : ''}

      <p>This is an automated compliance notification. For questions, contact compliance-alert@speedycreditrepair.com</p>
    </div>
  `),
  variables: ['firstName', 'alertType', 'dueDate', 'alertMessage', 'actionRequired', 'actionUrl'],
};

// =============================================================================
// MARKETING & ENGAGEMENT
// =============================================================================

export const REVIEW_REQUEST = {
  subject: 'Share Your Experience? ⭐⭐⭐⭐⭐',
  html: (vars) => emailWrapper(`
    <div class="email-body">
      <h2>How Did We Do?</h2>

      <p>Hi ${vars.firstName},</p>
      <p>We hope you're thrilled with the progress we've made on your credit! ${vars.achievements ? `You've achieved amazing results: ${vars.achievements}` : ''}</p>

      <p>Would you mind sharing your experience? Your feedback helps us improve and helps others find the credit help they need.</p>

      <div style="text-align: center; margin: 30px 0;">
        <p style="font-size: 18px; margin-bottom: 20px;">How would you rate your experience?</p>
        <div style="font-size: 40px;">
          <a href="${vars.reviewUrl || '#'}?rating=5" style="text-decoration: none; margin: 0 5px;">⭐</a>
          <a href="${vars.reviewUrl || '#'}?rating=5" style="text-decoration: none; margin: 0 5px;">⭐</a>
          <a href="${vars.reviewUrl || '#'}?rating=5" style="text-decoration: none; margin: 0 5px;">⭐</a>
          <a href="${vars.reviewUrl || '#'}?rating=5" style="text-decoration: none; margin: 0 5px;">⭐</a>
          <a href="${vars.reviewUrl || '#'}?rating=5" style="text-decoration: none; margin: 0 5px;">⭐</a>
        </div>
      </div>

      <a href="${vars.reviewUrl || '#'}" class="button">Leave a Review</a>

      <p style="font-size: 14px; color: #666;">This will take less than 2 minutes and means the world to us!</p>
    </div>
  `),
  variables: ['firstName', 'achievements', 'reviewUrl'],
};

export const NEWSLETTER = {
  subject: '💡 {{newsletterTitle}} - Credit Tips & Updates',
  html: (vars) => emailWrapper(`
    <div class="email-body">
      <h2>${vars.newsletterTitle || 'Credit Tips & Updates'}</h2>

      <p>Hi ${vars.firstName},</p>

      ${vars.content || '<p>Welcome to this month\'s newsletter!</p>'}

      ${vars.tips ? `
        <h3>💡 Quick Credit Tips:</h3>
        <ul>
          ${vars.tips.map(tip => `<li>${tip}</li>`).join('')}
        </ul>
      ` : ''}

      ${vars.ctaText && vars.ctaUrl ? `
        <a href="${vars.ctaUrl}" class="button">${vars.ctaText}</a>
      ` : ''}

      <p>Stay informed and keep building your credit!</p>
    </div>
  `),
  variables: ['firstName', 'newsletterTitle', 'content', 'tips', 'ctaText', 'ctaUrl'],
};

export const REFERRAL_INVITATION = {
  subject: 'Give $50, Get $50 - Refer a Friend! 🎁',
  html: (vars) => emailWrapper(`
    <div class="email-body">
      <h2>Love Your Results? Share the Wealth! 💰</h2>

      <p>Hi ${vars.firstName},</p>
      <p>We're thrilled you're seeing great results with your credit repair journey!</p>

      <div class="success-box">
        <strong>🎁 Referral Rewards Program</strong><br>
        • Your friend gets <strong>$50 off</strong> their first month<br>
        • You get <strong>$50 credit</strong> when they sign up<br>
        • No limit on referrals!
      </div>

      <h3>Your Personal Referral Link:</h3>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <code style="font-size: 14px;">${vars.referralLink || 'https://speedycreditrepair.com/ref/YOURCODE'}</code>
      </div>

      <a href="${vars.referralLink || '#'}" class="button">Share Your Link</a>

      <p><strong>Know someone who needs credit help?</strong> Forward this email or share your link on social media!</p>

      <p>Thanks for spreading the word!<br>
      The Speedy Credit Repair Team</p>
    </div>
  `),
  variables: ['firstName', 'referralLink'],
};

export const PROMOTIONAL = {
  subject: '🎉 {{promoTitle}} - Limited Time Offer',
  html: (vars) => emailWrapper(`
    <div class="email-body">
      <h2>${vars.promoTitle || 'Special Offer Just for You!'}</h2>

      <div class="success-box">
        <strong>🎉 ${vars.promoHeadline || 'Limited Time Offer'}</strong><br>
        ${vars.promoDescription || 'Save big on our credit repair services!'}
      </div>

      <p>Hi ${vars.firstName},</p>

      ${vars.content || '<p>We have an exclusive offer just for you!</p>'}

      <div class="info-box">
        <strong>Offer Details:</strong><br>
        ${vars.offerDetails || 'Contact us to learn more'}
      </div>

      ${vars.expiryDate ? `
        <p><strong>⏰ Offer expires:</strong> ${vars.expiryDate}</p>
      ` : ''}

      <a href="${vars.ctaUrl || '#'}" class="button">${vars.ctaText || 'Claim Offer'}</a>

      <p>Don't miss out on this exclusive opportunity!</p>
    </div>
  `),
  variables: ['firstName', 'promoTitle', 'promoHeadline', 'promoDescription', 'content', 'offerDetails', 'expiryDate', 'ctaUrl', 'ctaText'],
};

// =============================================================================
// URGENT & SUPPORT TEMPLATES
// =============================================================================

export const URGENT_ACTION_REQUIRED = {
  subject: '🚨 URGENT: Action Required - {{subject}}',
  html: (vars) => emailWrapper(`
    <div class="email-body">
      <h2>🚨 Urgent Action Required</h2>

      <div class="warning-box" style="border-left-color: #f44336; background-color: #ffebee;">
        <strong>⚠️ URGENT</strong><br>
        ${vars.urgentMessage}
      </div>

      <p>Hi ${vars.firstName},</p>
      <p>${vars.detailMessage}</p>

      <a href="${vars.actionUrl || '#'}" class="button" style="background-color: #f44336;">Take Action Now</a>

      <p><strong>This requires immediate attention.</strong></p>
      <p>Contact us: urgent@speedycreditrepair.com | (800) 555-CREDIT</p>
    </div>
  `),
  variables: ['firstName', 'urgentMessage', 'detailMessage', 'actionUrl'],
};

export const SUPPORT_RESPONSE = {
  subject: 'Re: {{ticketSubject}} [Ticket #{{ticketId}}]',
  html: (vars) => emailWrapper(`
    <div class="email-body">
      <h2>Support Response</h2>

      <div class="info-box">
        <strong>Ticket #${vars.ticketId}</strong><br>
        Subject: ${vars.ticketSubject}<br>
        Status: ${vars.status || 'In Progress'}
      </div>

      <p>Hi ${vars.firstName},</p>
      <p>Thank you for contacting Speedy Credit Repair support.</p>

      ${vars.responseMessage}

      ${vars.nextSteps ? `
        <h3>Next Steps:</h3>
        <p>${vars.nextSteps}</p>
      ` : ''}

      <p>Need more help? Just reply to this email.</p>

      <p>Best regards,<br>
      ${vars.agentName || 'Support Team'}<br>
      Speedy Credit Repair</p>
    </div>
  `),
  variables: ['firstName', 'ticketId', 'ticketSubject', 'status', 'responseMessage', 'nextSteps', 'agentName'],
};

// =============================================================================
// NO REPLY TEMPLATES (System/Automated)
// =============================================================================

export const SYSTEM_NOTIFICATION = {
  subject: 'System Notification - {{notificationType}}',
  html: (vars) => emailWrapper(`
    <div class="email-body">
      <h2>System Notification</h2>

      <div class="info-box">
        <strong>${vars.notificationType || 'System Update'}</strong><br>
        ${vars.notificationMessage}
      </div>

      <p>This is an automated system notification. Please do not reply to this email.</p>

      ${vars.actionUrl ? `
        <a href="${vars.actionUrl}" class="button">View Details</a>
      ` : ''}

      <p>Questions? Contact support@speedycreditrepair.com</p>
    </div>
  `),
  variables: ['notificationType', 'notificationMessage', 'actionUrl'],
};

// =============================================================================
// TEMPLATE MAPPING (for easy access by type)
// =============================================================================

export const EMAIL_TEMPLATES = {
  // Welcome & Onboarding
  WELCOME_NEW_CLIENT,
  ONBOARDING_STEP_1,

  // Payments
  PAYMENT_SUCCESS,
  PAYMENT_FAILED,
  PAYMENT_REMINDER,

  // Disputes
  DISPUTE_FILED,
  DISPUTE_UPDATE,

  // Credit Reports
  CREDIT_REPORT_READY,
  SCORE_UPDATE,

  // Appointments
  APPOINTMENT_CONFIRMATION,
  APPOINTMENT_REMINDER,
  TASK_REMINDER,

  // Documents
  DOCUMENT_READY,
  SIGNATURE_REQUIRED,

  // Compliance
  COMPLIANCE_ALERT,

  // Marketing
  REVIEW_REQUEST,
  NEWSLETTER,
  REFERRAL_INVITATION,
  PROMOTIONAL,

  // Urgent & Support
  URGENT_ACTION_REQUIRED,
  SUPPORT_RESPONSE,

  // System
  SYSTEM_NOTIFICATION,
};

/**
 * Helper function to replace variables in template
 * @param {string} template - HTML template string
 * @param {Object} variables - Variables to replace
 * @returns {string} - Processed template
 */
export const processTemplate = (template, variables = {}) => {
  let processed = template;

  Object.keys(variables).forEach((key) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    processed = processed.replace(regex, variables[key] || '');
  });

  return processed;
};

/**
 * Get template by name
 * @param {string} templateName - Template name (e.g., 'WELCOME_NEW_CLIENT')
 * @param {Object} variables - Variables for the template
 * @returns {Object} - { subject, html }
 */
export const getTemplate = (templateName, variables = {}) => {
  const template = EMAIL_TEMPLATES[templateName];

  if (!template) {
    throw new Error(`Template "${templateName}" not found`);
  }

  return {
    subject: processTemplate(template.subject, variables),
    html: typeof template.html === 'function'
      ? template.html(variables)
      : processTemplate(template.html, variables),
  };
};

export default EMAIL_TEMPLATES;
