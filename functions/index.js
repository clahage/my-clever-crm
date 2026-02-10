// ============================================
// FIREBASE GEN 2 CLOUD FUNCTIONS - CONSOLIDATED
// ============================================
// SpeedyCRM - AI-First Credit Repair CRM
// OPTIMIZED: 10 Functions (down from 172)
// MONTHLY SAVINGS: $903/month ($10,836/year)
//
// © 1995-2024 Speedy Credit Repair Inc. | Christopher Lahage | All Rights Reserved
// Trademark: Speedy Credit Repair® - USPTO Registered
// ============================================

// ============================================
// IMPORTS - GEN 2 MODULES
// ============================================
const { onRequest, onCall } = require('firebase-functions/v2/https');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { onDocumentCreated, onDocumentUpdated } = require('firebase-functions/v2/firestore');
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const fetch = require('node-fetch');
const nodemailer = require('nodemailer');
const { processEnrollmentCompletion } = require('./enrollmentAutomation');
const operations = require('./operations');
const payment = require('./paymentGateway');

// ============================================
// FIREBASE ADMIN INITIALIZATION
// ============================================
if (!admin.apps.length) admin.initializeApp();

// ============================================
// SECRETS CONFIGURATION (Firebase Secret Manager)
// ============================================

// IDIQ Partner Credentials - Now using Firebase Secret Manager
const idiqPartnerId = defineSecret('IDIQ_PARTNER_ID');
const idiqPartnerSecret = defineSecret('IDIQ_PARTNER_SECRET');
const idiqEnvironment = defineSecret('IDIQ_ENVIRONMENT');
const idiqPlanCode = defineSecret('IDIQ_PLAN_CODE');
const idiqOfferCode = defineSecret('IDIQ_OFFER_CODE');
const idiqApiKey = { value: () => '' };  // Not used, kept for compatibility

// Gmail Credentials - Using Firebase Secret Manager
const gmailUser = defineSecret('GMAIL_USER');
const gmailAppPassword = defineSecret('GMAIL_APP_PASSWORD');
const gmailFromName = defineSecret('GMAIL_FROM_NAME');
const gmailReplyTo = defineSecret('GMAIL_REPLY_TO');

// API Keys - Using Firebase Secret Manager
const openaiApiKey = defineSecret('OPENAI_API_KEY');
const telnyxApiKey = defineSecret('TELNYX_API_KEY');
const telnyxPhone = defineSecret('TELNYX_PHONE');
const telnyxSmsPhone = defineSecret('TELNYX_SMS_PHONE');

// Other Secrets
const docusignAccountId = defineSecret('DOCUSIGN_ACCOUNT_ID');
const webhookSecret = defineSecret('WEBHOOK_SECRET');
const nmiSecurityKey = defineSecret('NMI_SECURITY_KEY');

// ============================================
// DEFAULT CONFIGURATION
// ============================================
const defaultConfig = {
  memory: '512MiB',
  timeoutSeconds: 60,
  maxInstances: 10
};

// ============================================================
// NEW 3-PLAN SERVICE_PLANS_CONFIG
// ============================================================
// Replace your existing SERVICE_PLANS_CONFIG in functions/index.js
// with this. Search for "SERVICE_PLANS_CONFIG" and swap the
// entire object.
//
// No legacy mapping needed — this is a fresh system.
// ============================================================

const SERVICE_PLANS_CONFIG = {
  ESSENTIALS: {
    id: 'essentials',
    name: 'Essentials',
    tagline: 'Take Control of Your Credit',
    monthlyPrice: 79,
    setupFee: 49,
    perDeletion: 0,
    timeline: '3-9 months (self-paced)',
    successRate: '55% (client-driven)',
    avgPointIncrease: '40-80 points',
    effortRequired: 'High (client does the work)',
    idealFor: [
      'Self-motivated individuals',
      'Minor credit issues (1-5 items)',
      'Budget-conscious clients',
      'DIY mindset with expert tools'
    ],
    keyFeatures: [
      'AI-powered credit analysis & dispute strategy',
      'Professional dispute letter templates (AI-populated)',
      'Step-by-step video guides',
      'Client portal with progress tracking',
      'Monthly AI strategy refresh',
      'Credit education library',
      'Email support (24-48hr response)',
      'Secured card recommendations'
    ],
    disputeMethod: 'Client sends (mail). Fax available à la carte ($10/letter).',
    consultationRate: 'Full price ($85/20min, $155/40min, $210/60min)'
  },
  PROFESSIONAL: {
    id: 'professional',
    name: 'Professional',
    tagline: 'We Handle Everything For You',
    monthlyPrice: 149,
    setupFee: 0,
    perDeletion: 25,
    timeline: '4-8 months',
    successRate: '82%',
    avgPointIncrease: '80-150 points',
    effortRequired: 'Zero (full service)',
    idealFor: [
      'Typical credit repair client',
      'Moderate-to-complex cases (5-15+ items)',
      'Wants professional help without lifting a finger',
      'Best overall value'
    ],
    keyFeatures: [
      'Full-service dispute management (we write, send, track)',
      'Unlimited dispute letters (mail + fax)',
      'Selective certified mail for legally significant items',
      'Unlimited phone consultations (20% off)',
      'Creditor intervention & negotiation',
      'Debt validation requests',
      'Goodwill & cease-and-desist letters',
      '30-day bureau response letters',
      'Monthly credit report refresh & AI analysis',
      'Dedicated account manager',
      'Same-day email + phone support',
      '$25 per item successfully deleted per bureau'
    ],
    disputeMethod: 'We send via mail + fax. Certified when warranted.',
    consultationRate: '20% off ($68/20min, $124/40min, $168/60min)'
  },
  VIP: {
    id: 'vip',
    name: 'VIP Concierge',
    tagline: 'Maximum Results, Maximum Speed',
    monthlyPrice: 299,
    setupFee: 0,
    perDeletion: 0,
    timeline: '2-5 months (accelerated)',
    successRate: '95%',
    avgPointIncrease: '120-250 points',
    effortRequired: 'Zero (white glove)',
    idealFor: [
      'Complex cases (15+ negative items)',
      'Urgency (home purchase, job requirement)',
      'Maximum speed needed',
      'Want zero surprise charges'
    ],
    keyFeatures: [
      'Everything in Professional',
      'Bi-weekly dispute cycles (2x faster)',
      'ALL deletion fees INCLUDED ($0 per-item)',
      'Direct-to-creditor escalation campaigns',
      'Aggressive multi-round goodwill campaigns',
      'Weekly progress reports',
      'Priority queue processing',
      'Full credit rebuilding strategy',
      '90-day money-back guarantee',
      'Direct cell phone access to senior specialist',
      '20 min/month expert consultation included',
      '15% off tradeline rentals',
      'Senior specialist assigned (not rotated)'
    ],
    disputeMethod: 'We send via mail + fax. Certified when warranted. Priority processing.',
    consultationRate: '20 min/mo included, then 20% off ($68/20min, $124/40min, $168/60min)'
  }
};

// ============================================
// EMAIL HTML WRAPPER HELPER (Original - Keep for backward compatibility)
// ============================================
function wrapEmailInHTML(subject, bodyText, recipientName = '', unsubscribeEmail = '') {
  const htmlBody = bodyText
    .replace(/\n\n/g, '</p><p style="margin: 0 0 15px; color: #374151; font-size: 16px; line-height: 1.6;">')
    .replace(/\n/g, '<br>');
  
  // Generate unsubscribe URL (base64-encoded email for one-click opt-out)
  const unsubUrl = `https://us-central1-my-clever-crm.cloudfunctions.net/operationsManager?action=unsubscribe&e=${unsubscribeEmail ? Buffer.from(unsubscribeEmail.toLowerCase()).toString('base64') : ''}`;
  
  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        <tr>
            <td style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px 40px; text-align: center;">
                <h1 style="margin: 0; color: #ffffff; font-size: 24px;">⚡ Speedy Credit Repair</h1>
                <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 13px;">Established 1995 | A+ BBB Rating | 4.9★ Google Reviews</p>
            </td>
        </tr>
        <tr>
            <td style="padding: 35px 40px;">
                ${recipientName ? `<p style="margin: 0 0 20px; color: #1f2937; font-size: 17px; font-weight: 600;">Hi ${recipientName},</p>` : ''}
                <p style="margin: 0 0 15px; color: #374151; font-size: 16px; line-height: 1.6;">${htmlBody}</p>
            </td>
        </tr>
        <tr>
            <td style="background-color: #f9fafb; padding: 25px 40px; border-top: 1px solid #e5e7eb; text-align: center;">
                <p style="margin: 0 0 8px; color: #374151; font-size: 14px; font-weight: bold;">Speedy Credit Repair Inc.</p>
                <p style="margin: 0 0 5px; color: #6b7280; font-size: 13px;">📞 (888) 724-7344 | 📧 chris@speedycreditrepair.com</p>
                <p style="margin: 0 0 5px; color: #9ca3af; font-size: 11px;">117 Main St #202, Huntington Beach, CA 92648</p>
                <p style="margin: 12px 0 0; color: #9ca3af; font-size: 11px;">© 1995-${new Date().getFullYear()} Speedy Credit Repair Inc. | All Rights Reserved</p>
                <p style="margin: 8px 0 0;"><a href="${unsubUrl}" style="color: #9ca3af; font-size: 11px; text-decoration: underline;">Unsubscribe from marketing emails</a></p>
            </td>
        </tr>
    </table>
</body>
</html>`;
}

// ============================================
// RICH PROFESSIONAL EMAIL TEMPLATES
// ============================================
// Ultra-professional email templates with:
// - Gradient headers with branding
// - Progress indicators (Step X of Y)
// - Clear CTAs with big colored buttons
// - Trust badges (A+ BBB, 30 years, 4.9★)
// - Urgency indicators (increasing color intensity)
// - Mobile-responsive design
// - Documents marked as OPTIONAL to prevent drop-off
// ============================================

const SPEEDY_BRAND = {
  primaryBlue: '#1e40af',
  primaryGreen: '#059669',
  accentOrange: '#f59e0b',
  urgentRed: '#dc2626',
  lightGray: '#f3f4f6',
  darkGray: '#374151',
  companyName: 'Speedy Credit Repair',
  phone: '(888) 724-7344',
  phoneLink: '8887247344',
  email: 'chris@speedycreditrepair.com',
  website: 'https://speedycreditrepair.com',
  portalUrl: 'https://myclevercrm.com',
  ownerName: 'Chris Lahage',
  established: '1995',
  bbbRating: 'A+',
  googleRating: '4.9',
  reviewCount: '580+',
  googleReviewUrl: 'https://g.page/r/speedycreditrepair/review'
};

// ═══════════════════════════════════════════════════════════════════════════
// MASTER RICH EMAIL WRAPPER - Ultra Professional Design
// ═══════════════════════════════════════════════════════════════════════════

function createRichEmail(options) {
  const {
    subject,
    preheader = '',
    recipientName = '',
    bodyContent,
    ctaButton = null,
    urgencyLevel = 'normal',
    showProgress = null,
    showTrustBadges = true,
    trackingPixelUrl = null,
    unsubscribeEmail = ''
  } = options;

  const urgencyColors = {
    normal: SPEEDY_BRAND.primaryBlue,
    medium: SPEEDY_BRAND.accentOrange,
    high: '#ea580c',
    critical: SPEEDY_BRAND.urgentRed
  };

  const headerColor = urgencyColors[urgencyLevel] || SPEEDY_BRAND.primaryBlue;
  
  const urgencyBanners = {
    normal: '',
    medium: `<tr><td style="background: #fef3c7; padding: 12px 20px; text-align: center; border-bottom: 2px solid #f59e0b;"><span style="color: #92400e; font-weight: 600;">⏰ Action Recommended</span></td></tr>`,
    high: `<tr><td style="background: #fed7aa; padding: 12px 20px; text-align: center; border-bottom: 2px solid #ea580c;"><span style="color: #9a3412; font-weight: 600;">⚠️ Important - Please Review</span></td></tr>`,
    critical: `<tr><td style="background: #fecaca; padding: 14px 20px; text-align: center; border-bottom: 3px solid #dc2626;"><span style="color: #991b1b; font-weight: 700; font-size: 15px;">🚨 URGENT ACTION REQUIRED</span></td></tr>`
  };

  const progressBarHtml = showProgress ? `
    <tr>
      <td style="padding: 20px 40px 0;">
        <div style="background: #e5e7eb; border-radius: 10px; height: 8px; overflow: hidden; margin-bottom: 8px;">
          <div style="background: linear-gradient(90deg, ${SPEEDY_BRAND.primaryGreen}, #10b981); width: ${(showProgress.current / showProgress.total) * 100}%; height: 100%; border-radius: 10px;"></div>
        </div>
        <p style="margin: 0; color: #6b7280; font-size: 13px; text-align: center;">${showProgress.label}</p>
      </td>
    </tr>
  ` : '';

  const ctaButtonHtml = ctaButton ? `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 25px auto;">
      <tr>
        <td style="border-radius: 8px; background: ${ctaButton.color === 'green' ? 'linear-gradient(135deg, #059669, #10b981)' : ctaButton.color === 'orange' ? 'linear-gradient(135deg, #f59e0b, #fbbf24)' : ctaButton.color === 'red' ? 'linear-gradient(135deg, #dc2626, #ef4444)' : 'linear-gradient(135deg, #1e40af, #3b82f6)'};">
          <a href="${ctaButton.url}" target="_blank" style="display: inline-block; padding: 16px 40px; font-family: Arial, sans-serif; font-size: 16px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 8px;">
            ${ctaButton.text}
          </a>
        </td>
      </tr>
    </table>
  ` : '';

  const trustBadgesHtml = showTrustBadges ? `
    <tr>
      <td style="padding: 20px 40px; background: #f9fafb; border-top: 1px solid #e5e7eb;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%">
          <tr>
            <td align="center" style="padding: 0 10px;">
              <p style="margin: 0; color: #059669; font-size: 13px; font-weight: 700;">⭐ ${SPEEDY_BRAND.googleRating}</p>
              <p style="margin: 2px 0 0; color: #6b7280; font-size: 11px;">${SPEEDY_BRAND.reviewCount} Reviews</p>
            </td>
            <td align="center" style="padding: 0 10px; border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #1e40af; font-size: 13px; font-weight: 700;">🏆 ${SPEEDY_BRAND.bbbRating} BBB</p>
              <p style="margin: 2px 0 0; color: #6b7280; font-size: 11px;">Accredited</p>
            </td>
            <td align="center" style="padding: 0 10px;">
              <p style="margin: 0; color: #7c3aed; font-size: 13px; font-weight: 700;">📅 Since ${SPEEDY_BRAND.established}</p>
              <p style="margin: 2px 0 0; color: #6b7280; font-size: 11px;">30 Years Experience</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  ` : '';

  const trackingPixelHtml = trackingPixelUrl ? 
    `<img src="${trackingPixelUrl}" width="1" height="1" style="display:none;border:0;" alt="" />` : '';

  const formattedBody = bodyContent
    .replace(/\n\n/g, '</p><p style="margin: 0 0 16px; color: #374151; font-size: 16px; line-height: 1.7;">')
    .replace(/\n/g, '<br>');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${subject}</title>
  ${preheader ? `<meta name="description" content="${preheader}">` : ''}
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6; -webkit-font-smoothing: antialiased;">
  ${preheader ? `<div style="display: none; max-height: 0; overflow: hidden;">${preheader}</div>` : ''}
  
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
    
    ${urgencyBanners[urgencyLevel] || ''}
    
    <tr>
      <td style="background: linear-gradient(135deg, ${headerColor} 0%, ${headerColor}dd 100%); padding: 35px 40px; text-align: center;">
        <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">⚡ ${SPEEDY_BRAND.companyName}</h1>
        <p style="margin: 12px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Established ${SPEEDY_BRAND.established} | ${SPEEDY_BRAND.bbbRating} BBB Rating | ${SPEEDY_BRAND.googleRating}★ Google Reviews</p>
      </td>
    </tr>
    
    ${progressBarHtml}
    
    <tr>
      <td style="padding: 35px 40px;">
        ${recipientName ? `<p style="margin: 0 0 20px; color: #1f2937; font-size: 18px; font-weight: 600;">Hi ${recipientName},</p>` : ''}
        <p style="margin: 0 0 16px; color: #374151; font-size: 16px; line-height: 1.7;">${formattedBody}</p>
        ${ctaButtonHtml}
      </td>
    </tr>
    
    ${trustBadgesHtml}
    
    <tr>
      <td style="background-color: #1f2937; padding: 30px 40px; text-align: center;">
        <p style="margin: 0 0 10px; color: #ffffff; font-size: 15px; font-weight: 600;">${SPEEDY_BRAND.companyName}</p>
        <p style="margin: 0 0 8px; color: #9ca3af; font-size: 13px;">
          📞 <a href="tel:${SPEEDY_BRAND.phoneLink}" style="color: #60a5fa; text-decoration: none;">${SPEEDY_BRAND.phone}</a> | 
          📧 <a href="mailto:${SPEEDY_BRAND.email}" style="color: #60a5fa; text-decoration: none;">${SPEEDY_BRAND.email}</a>
        </p>
        <p style="margin: 8px 0 0; color: #9ca3af; font-size: 11px;">
          117 Main St #202, Huntington Beach, CA 92648
        </p>
        <p style="margin: 15px 0 0; color: #6b7280; font-size: 11px;">
          © 1995-${new Date().getFullYear()} ${SPEEDY_BRAND.companyName} Inc. | All Rights Reserved
        </p>
        <p style="margin: 10px 0 0;">
          <a href="https://us-central1-my-clever-crm.cloudfunctions.net/operationsManager?action=unsubscribe&e=${unsubscribeEmail ? Buffer.from(unsubscribeEmail.toLowerCase()).toString('base64') : ''}" style="color: #9ca3af; font-size: 11px; text-decoration: underline;">Unsubscribe from marketing emails</a>
        </p>
      </td>
    </tr>
  </table>
  
  ${trackingPixelHtml}
</body>
</html>`;
}

// ═══════════════════════════════════════════════════════════════════════════
// PRE-BUILT EMAIL TEMPLATES
// ═══════════════════════════════════════════════════════════════════════════

const EMAIL_TEMPLATES = {
  
  // DOCUMENT UPLOAD REQUEST (After Contract Signed) - MARKED AS OPTIONAL
  documentUploadRequest: (contact, portalUrl) => createRichEmail({
    subject: `${contact.firstName}, just a few quick items to complete your setup`,
    preheader: 'Optional documents help us serve you better - takes just 2 minutes',
    recipientName: contact.firstName,
    urgencyLevel: 'normal',
    showProgress: { current: 3, total: 4, label: 'Step 3 of 4: Optional Documents' },
    bodyContent: `Great news! Your service agreement is complete and we're ready to start working on your credit.

To help us serve you even better, you can optionally upload a few documents to your secure client portal. These help us verify your identity and speed up the dispute process.

<strong style="color: #1e40af;">📄 Optional Documents:</strong>

- <strong>Government-issued ID</strong> (Driver's license or passport)
- <strong>Proof of address</strong> (Utility bill, bank statement, etc.)
- <strong>Social Security card</strong> (Helps verify identity with bureaus)

<span style="color: #059669; font-weight: 600;">💡 These are completely optional</span> - we can still begin your credit repair without them. However, having them on file can speed up the dispute resolution process.

Your documents are encrypted and stored securely. We never share your information with third parties.`,
    ctaButton: {
      text: '📤 Upload Documents (Optional)',
      url: `${portalUrl}/portal/documents?contactId=${contact.id || contact.contactId}`,
      color: 'blue'
    },
    showTrustBadges: true
  }),

  // ACH SETUP REQUEST (After Contract Signed)
  achSetupRequest: (contact, planName, monthlyAmount, portalUrl) => createRichEmail({
    subject: `${contact.firstName}, set up your payment method to activate service`,
    preheader: 'Quick 2-minute setup to start your credit repair journey',
    recipientName: contact.firstName,
    urgencyLevel: 'medium',
    showProgress: { current: 4, total: 4, label: 'Final Step: Payment Setup' },
    bodyContent: `You're almost there! Just one final step to activate your ${planName} service.

<strong style="color: #1e40af;">💳 Your Service Details:</strong>

- <strong>Plan:</strong> ${planName}
- <strong>Monthly Investment:</strong> $${monthlyAmount}
- <strong>Billing Date:</strong> Same day each month

<strong style="color: #059669;">🔒 Why ACH Bank Transfer?</strong>

Most of our clients choose ACH because:
✓ No credit card fees
✓ Automatic monthly payments
✓ Secure bank-level encryption
✓ Easy to cancel anytime

Setting up takes less than 2 minutes. Just have your bank routing and account numbers handy.

<span style="color: #6b7280; font-size: 14px;">Your first payment will process within 3 business days of setup.</span>`,
    ctaButton: {
      text: '🏦 Set Up Payment Now',
      url: `${portalUrl}/ach-authorization/${contact.id || contact.contactId}`,
      color: 'green'
    },
    showTrustBadges: true
  }),

  // IDIQ UPGRADE REMINDER - DAY 7 (Friendly - Normal urgency)
  idiqUpgradeReminder7: (contact, upgradeUrl) => createRichEmail({
    subject: `${contact.firstName}, your credit monitoring trial - quick update`,
    preheader: 'Keep your 3-bureau credit monitoring active',
    recipientName: contact.firstName,
    urgencyLevel: 'normal',
    bodyContent: `I wanted to check in about your IDIQ credit monitoring trial.

Your free trial has been active for about a week now, and I hope you've had a chance to review your 3-bureau credit report. Pretty eye-opening, right?

<strong style="color: #1e40af;">🔍 Why Keep Credit Monitoring?</strong>

As we work on disputing negative items, your credit monitoring helps us:
- Track when bureaus update your report
- See dispute results in real-time
- Catch any new issues immediately
- Document your credit score improvements

<strong style="color: #059669;">💰 The Investment:</strong> Just $21.86/month

This is billed directly by IDIQ (separate from our service). Many clients keep it even after credit repair is complete - it's great peace of mind!

<span style="color: #6b7280;">No pressure at all - just wanted to make sure you knew about the option.</span>`,
    ctaButton: {
      text: '✓ Upgrade My Monitoring',
      url: upgradeUrl,
      color: 'blue'
    },
    showTrustBadges: true
  }),

  // IDIQ UPGRADE REMINDER - DAY 14 (Increasing Urgency - Medium)
  idiqUpgradeReminder14: (contact, upgradeUrl, daysRemaining) => createRichEmail({
    subject: `⏰ ${contact.firstName}, your monitoring trial ends in ${daysRemaining} days`,
    preheader: `Action needed: Upgrade to keep your credit monitoring active`,
    recipientName: contact.firstName,
    urgencyLevel: 'medium',
    bodyContent: `Quick heads up - your free IDIQ credit monitoring trial is ending soon.

<strong style="color: #ea580c;">📅 Trial Status:</strong> ${daysRemaining} days remaining

If you don't upgrade, you'll lose access to:
- Your 3-bureau credit reports
- Real-time score updates
- Identity theft protection
- Our ability to track your dispute results

<strong style="color: #1e40af;">I recommend upgrading because:</strong>

We're actively working on your credit repair, and monitoring lets us see exactly when the bureaus make changes. Without it, we're working blind.

The cost is just $21.86/month - about 73 cents a day for complete credit visibility.

<span style="color: #059669; font-weight: 600;">Click below to upgrade in about 60 seconds:</span>`,
    ctaButton: {
      text: '🔓 Upgrade Now - Keep My Monitoring',
      url: upgradeUrl,
      color: 'orange'
    },
    showTrustBadges: true
  }),

  // IDIQ UPGRADE REMINDER - DAY 18 (Final Warning - High Urgency)
  idiqUpgradeFinal18: (contact, upgradeUrl, daysRemaining) => createRichEmail({
    subject: `🚨 FINAL NOTICE: ${contact.firstName}, ${daysRemaining} days until monitoring expires`,
    preheader: `Your credit monitoring will be cancelled unless you upgrade`,
    recipientName: contact.firstName,
    urgencyLevel: 'high',
    bodyContent: `This is my final reminder about your credit monitoring trial.

<strong style="color: #dc2626; font-size: 18px;">⚠️ Your monitoring expires in ${daysRemaining} days</strong>

After that, your IDIQ account will be automatically cancelled and you'll lose:

❌ Access to your 3-bureau credit reports
❌ Real-time credit score tracking
❌ Identity theft protection alerts
❌ Our ability to monitor your dispute progress

<strong style="color: #1e40af;">Here's the honest truth:</strong>

Without credit monitoring, our credit repair work becomes significantly less effective. We won't be able to see when bureaus respond to disputes or track your score improvements.

<strong style="color: #059669;">The solution is simple:</strong>

Upgrade to paid monitoring for $21.86/month. It takes about 60 seconds and ensures we can continue tracking your progress.

<span style="color: #6b7280; font-size: 14px;">If you've decided not to proceed with credit repair services, please let me know and we'll cancel your trial so you're not charged.</span>`,
    ctaButton: {
      text: '🚨 UPGRADE NOW - KEEP MY MONITORING',
      url: upgradeUrl,
      color: 'red'
    },
    showTrustBadges: true
  }),

  // WELCOME NEW CLIENT (After ACH Setup Complete) 🎉
  welcomeNewClient: (contact, planName) => createRichEmail({
    subject: `🎉 Welcome to the Speedy family, ${contact.firstName}! Let's get started`,
    preheader: 'Your credit repair journey officially begins today',
    recipientName: contact.firstName,
    urgencyLevel: 'normal',
    bodyContent: `<strong style="color: #059669; font-size: 20px;">Congratulations! You're officially a Speedy Credit Repair client! 🎉</strong>

Everything is set up and we're ready to start transforming your credit.

<strong style="color: #1e40af;">📋 Your Service Summary:</strong>

- <strong>Plan:</strong> ${planName}
- <strong>Status:</strong> Active - Work Begins Immediately
- <strong>Your Team:</strong> Chris Lahage + Dedicated Support Staff

<strong style="color: #059669;">🚀 What Happens Next:</strong>

<strong>Week 1:</strong> We complete our analysis and prepare your first round of disputes

<strong>Weeks 2-4:</strong> Disputes are sent to credit bureaus and creditors

<strong>Days 30-45:</strong> You'll start seeing responses and potential deletions

<strong>Ongoing:</strong> We continue disputing until we've addressed all negative items

<strong style="color: #1e40af;">📱 Your Client Portal:</strong>

You now have access to your personal client portal where you can:
- Track dispute status in real-time
- View your credit reports
- Upload documents securely
- Message our team directly
- See your credit score progress

<span style="color: #6b7280;">Questions? We're always here. Just reply to this email or call us anytime.</span>`,
    ctaButton: {
      text: '🔐 Access My Client Portal',
      url: `${SPEEDY_BRAND.portalUrl}/portal`,
      color: 'green'
    },
    showTrustBadges: true
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // TIER 1: POST-ACH DRIP CAMPAIGN (7 emails over 35 days)
  // Prevents cancellation during the 30-day dispute wait "silence period"
  // ═══════════════════════════════════════════════════════════════════════════

  // DRIP DAY 1: Welcome + Set Expectations (kills anxiety immediately)
  dripDay1Welcome: (contact) => createRichEmail({
    subject: `${contact.firstName}, here's exactly what happens next with your credit`,
    preheader: 'Your credit repair journey has officially begun — here\'s the roadmap',
    recipientName: contact.firstName,
    urgencyLevel: 'normal',
    bodyContent: `<strong style="color: #059669; font-size: 20px;">Welcome aboard, ${contact.firstName}! Your credit transformation starts now. 🚀</strong>

I'm Chris Lahage, and I'll personally be overseeing your case. I've been doing this for over 30 years, and I want you to know exactly what to expect so there are no surprises.

<strong style="color: #1e40af;">📋 Your Roadmap — The Next 45 Days:</strong>

<strong>This Week (Days 1-7):</strong> My team and I are analyzing your full 3-bureau credit report right now. We're identifying every item that can be challenged, building your personalized dispute strategy, and preparing your first round of dispute letters.

<strong>Next Week (Days 7-14):</strong> Your dispute letters are sent to all three credit bureaus (Experian, TransUnion, Equifax) and directly to creditors where appropriate. Each letter is customized — no cookie-cutter templates.

<strong>The Waiting Period (Days 14-45):</strong> By federal law (FCRA), credit bureaus have 30 days to investigate our disputes. <strong>This is normal.</strong> During this time, it may feel quiet — but the bureaus are working on your case.

<strong>Results (Days 30-45):</strong> You'll start seeing responses. We'll update your portal in real-time as results come in.

<strong style="color: #059669;">💡 What You Should Do Right Now:</strong>

✓ Watch your mail for bureau response letters (forward them to us)
✓ Don't open any new credit accounts while we're working
✓ Log into your client portal to see your dispute status anytime
✓ Breathe easy — we've got this

<span style="color: #6b7280;">I'll check in with you regularly. If you ever have questions, just reply to this email or call us anytime.</span>`,
    ctaButton: {
      text: '🔐 View My Case in the Portal',
      url: `${SPEEDY_BRAND.portalUrl}/portal`,
      color: 'green'
    },
    showTrustBadges: true
  }),

  // DRIP DAY 3: Education — How Disputes Work (builds confidence)
  dripDay3Education: (contact) => createRichEmail({
    subject: `How credit disputes actually work — a quick guide for ${contact.firstName}`,
    preheader: 'Understanding the process helps you stay confident while we work',
    recipientName: contact.firstName,
    urgencyLevel: 'normal',
    bodyContent: `I wanted to share something that helps a lot of our clients feel more confident during the process.

<strong style="color: #1e40af;">🔍 How Credit Disputes Actually Work:</strong>

When we send dispute letters, here's what happens behind the scenes:

<strong>Step 1 — We Challenge Inaccurate Items:</strong> Under the Fair Credit Reporting Act (FCRA), credit bureaus are legally required to verify every item on your report. If they can't verify it within 30 days, they must remove it.

<strong>Step 2 — Bureaus Investigate:</strong> The bureaus contact the original creditor and ask them to verify the debt details. Many creditors don't have complete records — especially for older debts.

<strong>Step 3 — Results Come In:</strong> Items are either verified (stays on report), updated (corrected in your favor), or deleted (removed entirely). Deletions are the home runs.

<strong style="color: #059669;">📊 Why This Works:</strong>

Studies show that <strong>79% of credit reports contain errors</strong>. We're not asking bureaus to remove legitimate debts — we're holding them accountable for accuracy. That's your legal right.

<strong>Common items that get removed:</strong>
- Collections with incorrect balances or dates
- Accounts reported by the wrong creditor
- Late payments that weren't actually late
- Duplicate entries (same debt reported twice)
- Items past the 7-year reporting limit

<span style="color: #6b7280;">Bottom line: the law is on your side, and we know how to use it effectively.</span>`,
    ctaButton: {
      text: '📚 Learn More in Your Portal',
      url: `${SPEEDY_BRAND.portalUrl}/portal`,
      color: 'blue'
    },
    showTrustBadges: true
  }),

  // DRIP DAY 7: Credit Building Tips (gives them something active to DO)
  dripDay7CreditTips: (contact) => createRichEmail({
    subject: `${contact.firstName}, 5 things you can do THIS WEEK to help your score`,
    preheader: 'While we handle disputes, here\'s how you can boost your score even faster',
    recipientName: contact.firstName,
    urgencyLevel: 'normal',
    bodyContent: `While we're working on removing negative items from your report, there are things <strong>you</strong> can do right now to accelerate your progress.

<strong style="color: #1e40af;">🚀 5 Score-Boosting Actions You Can Take This Week:</strong>

<strong>1. Pay Down Credit Card Balances</strong>
Credit utilization (how much of your available credit you're using) makes up 30% of your score. If you can get any card below 30% utilization — ideally below 10% — you'll see a bump.

<strong>2. Don't Close Old Accounts</strong>
Even if you don't use a card, keeping it open helps your "length of credit history." This is 15% of your score.

<strong>3. Become an Authorized User</strong>
If a family member with excellent credit adds you as an authorized user on their oldest card, their positive history can appear on your report. This is one of the fastest legal ways to boost a score.

<strong>4. Set Up Autopay on Everything</strong>
Payment history is 35% of your score — the single biggest factor. Even one missed payment can drop your score 50-100 points. Autopay prevents that.

<strong>5. Don't Apply for New Credit</strong>
Each application creates a "hard inquiry" that temporarily lowers your score. While we're repairing, avoid all new applications.

<strong style="color: #059669;">💡 Pro Tip from 30 Years of Experience:</strong>

The clients who see the fastest results are the ones who combine our dispute work with these personal habits. It's a team effort, and you're doing great.

<span style="color: #6b7280;">Questions about any of these tips? Just reply — I'm here to help.</span>`,
    ctaButton: {
      text: '📈 Check My Progress',
      url: `${SPEEDY_BRAND.portalUrl}/portal`,
      color: 'green'
    },
    showTrustBadges: true
  }),

  // DRIP DAY 14: Midpoint Check-in (personal touch, builds trust)
  dripDay14Checkin: (contact) => createRichEmail({
    subject: `Quick check-in, ${contact.firstName} — how are things going?`,
    preheader: 'We\'re halfway through the first dispute round — here\'s an update',
    recipientName: contact.firstName,
    urgencyLevel: 'normal',
    bodyContent: `I wanted to personally check in at the halfway mark.

<strong style="color: #1e40af;">📊 Where Things Stand:</strong>

Your first round of disputes was sent about two weeks ago. The credit bureaus are in their investigation window right now — they have 30 days from when they received our letters to respond.

This is the part of the process where things feel quiet, and I know that can be frustrating. But trust me — things are happening behind the scenes.

<strong style="color: #059669;">✅ What's Been Done So Far:</strong>

- Your full 3-bureau credit report was analyzed
- Dispute strategy was customized for your situation
- Dispute letters were sent to all relevant bureaus and creditors
- Your case is being monitored for any bureau responses

<strong style="color: #1e40af;">🔜 What's Coming Next:</strong>

In the next 2-3 weeks, you should start receiving response letters in the mail from the credit bureaus. <strong>Please forward these to us immediately</strong> — either scan/photograph them and upload to your portal, or simply email them as a reply to this message.

These responses tell us exactly what was verified, updated, or deleted. That's when the real progress becomes visible.

<span style="color: #6b7280;">If you have any questions or concerns at all, please don't hesitate to reach out. I'm always available at ${SPEEDY_BRAND.phone}.</span>`,
    ctaButton: {
      text: '💬 Reply With Questions',
      url: `mailto:${SPEEDY_BRAND.email}?subject=Question about my credit repair`,
      color: 'blue'
    },
    showTrustBadges: true
  }),

  // DRIP DAY 25: Anticipation Builder (gets them excited, reduces anxiety)
  dripDay25Anticipation: (contact) => createRichEmail({
    subject: `${contact.firstName}, results are just around the corner!`,
    preheader: 'The 30-day investigation window is almost up — here\'s what to watch for',
    recipientName: contact.firstName,
    urgencyLevel: 'normal',
    bodyContent: `<strong style="color: #059669; font-size: 18px;">The finish line for Round 1 is in sight! 🏁</strong>

The credit bureaus' 30-day investigation deadline is approaching. This means you could start seeing results any day now.

<strong style="color: #1e40af;">📬 What to Watch For in Your Mail:</strong>

You'll receive official letters from one or more of the three bureaus (Experian, TransUnion, Equifax). These letters will say one of three things:

✅ <strong>"Deleted"</strong> — The item has been removed. This is a WIN!
🔄 <strong>"Updated"</strong> — The item was modified (sometimes in your favor). We'll review the details.
❌ <strong>"Verified"</strong> — The creditor confirmed the item. Don't worry — we have next-round strategies for these.

<strong style="color: #059669;">📱 Important — Please Do This:</strong>

As soon as you receive ANY letter from a credit bureau:
1. Take a photo or scan it
2. Upload it to your client portal, OR
3. Reply to this email with the photo attached

This helps us move quickly into Round 2 for any items that weren't resolved.

<strong style="color: #1e40af;">💡 Success Story:</strong>

One of our recent clients had 12 negative items. After Round 1, 7 were deleted. After Round 2, 3 more were removed. Two rounds — 10 deletions — and a 127-point score increase. That's the power of persistence.

<span style="color: #6b7280;">Your results are coming. Stay positive!</span>`,
    ctaButton: {
      text: '📤 Upload Bureau Letters',
      url: `${SPEEDY_BRAND.portalUrl}/portal/documents`,
      color: 'green'
    },
    showTrustBadges: true
  }),

  // DRIP DAY 30: Bureau Response Window Open
  dripDay30BureauWindow: (contact) => createRichEmail({
    subject: `📬 ${contact.firstName}, the 30-day window just opened — check your mail!`,
    preheader: 'Bureau responses should be arriving this week',
    recipientName: contact.firstName,
    urgencyLevel: 'medium',
    bodyContent: `<strong style="color: #059669; font-size: 18px;">The 30-day mark has arrived! 📬</strong>

The credit bureaus' investigation deadline is here. This is when results start rolling in.

<strong style="color: #ea580c;">⚡ ACTION NEEDED:</strong>

Please check your mail daily this week. Bureau response letters typically arrive between days 30-45. The sooner you forward them to us, the sooner we can:

1. Update your case file with confirmed deletions
2. Calculate your projected score improvement
3. Prepare Round 2 disputes for any remaining items

<strong style="color: #1e40af;">📊 What Happens After We Get Your Results:</strong>

- We pull your updated credit reports
- We compare before/after to document all changes
- We prepare your next-round strategy
- We send Round 2 disputes within days

<strong style="color: #059669;">🎯 Remember:</strong>

Credit repair is a process, not a single event. Most clients see their biggest gains across 2-3 rounds of disputes. Round 1 softens the ground. Round 2 often brings the biggest deletions.

<span style="color: #6b7280;">Forward any bureau letters to us ASAP. You can reply to this email with photos or upload them to your portal.</span>`,
    ctaButton: {
      text: '📤 Upload My Bureau Letters',
      url: `${SPEEDY_BRAND.portalUrl}/portal/documents`,
      color: 'orange'
    },
    showTrustBadges: true
  }),

  // DRIP DAY 35: Next Round Preview + Success Stories
  dripDay35NextRound: (contact) => createRichEmail({
    subject: `${contact.firstName}, Round 2 strategy is ready — here's the plan`,
    preheader: 'We\'ve analyzed your Round 1 results and prepared your next attack',
    recipientName: contact.firstName,
    urgencyLevel: 'normal',
    bodyContent: `Your first round results are in, and we're already working on your next round of disputes.

<strong style="color: #1e40af;">🔄 Round 2 — What's Different:</strong>

Round 2 disputes use different strategies than Round 1:
- <strong>Method of verification requests</strong> — We demand the bureau show us exactly HOW they verified the item
- <strong>Direct creditor disputes</strong> — We go straight to the source, bypassing the bureaus
- <strong>Debt validation letters</strong> — We require creditors to prove they have the legal right to report the debt
- <strong>Goodwill letters</strong> — For legitimate items, we request removal based on your improved payment history

This multi-pronged approach is why Round 2 often produces even better results than Round 1.

<strong style="color: #059669;">📈 Client Success Averages:</strong>

After completing 2 rounds, our clients typically see:
- 3-7 negative items removed
- 80-150 point score improvement
- Significant reduction in collections and late payments

<strong style="color: #1e40af;">📱 Your Updated Portal:</strong>

We've updated your client portal with your Round 1 results. Log in to see:
- Which items were deleted, updated, or verified
- Your updated dispute strategy for Round 2
- Your projected timeline for completion

<span style="color: #6b7280;">We're just getting started. The best results are still ahead.</span>`,
    ctaButton: {
      text: '📊 View My Updated Results',
      url: `${SPEEDY_BRAND.portalUrl}/portal`,
      color: 'green'
    },
    showTrustBadges: true
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // TIER 1: ACH NOT COMPLETED FOLLOW-UPS (3 emails)
  // Recovers delayed revenue when contract signed but ACH not done
  // ═══════════════════════════════════════════════════════════════════════════

  // ACH REMINDER — 24 HOURS
  achReminder24h: (contact, portalUrl) => createRichEmail({
    subject: `${contact.firstName}, just one quick step left to start your credit repair`,
    preheader: 'Your payment setup takes 2 minutes — then we can start working on your credit',
    recipientName: contact.firstName,
    urgencyLevel: 'normal',
    bodyContent: `Hi ${contact.firstName}, quick follow-up!

I noticed your service agreement is signed (great!) but your payment method hasn't been set up yet. This is the final step before we can start working on your credit.

<strong style="color: #1e40af;">⏱️ It Only Takes 2 Minutes:</strong>

Just have your bank routing number and account number handy. The setup is secure, encrypted, and you can cancel anytime.

<strong style="color: #059669;">Why ACH (Bank Transfer)?</strong>

✓ No credit card fees or interest charges
✓ Automatic monthly billing — one less thing to worry about
✓ Bank-level security and encryption
✓ Easy to update or cancel anytime

Once payment is set up, we begin analyzing your credit report <strong>immediately</strong>. The sooner we start, the sooner you'll see results.

<span style="color: #6b7280;">Need help with setup? Just call us at ${SPEEDY_BRAND.phone} — we can walk you through it in under 2 minutes.</span>`,
    ctaButton: {
      text: '🏦 Complete Payment Setup',
      url: `${portalUrl}/ach-authorization/${contact.id || contact.contactId}`,
      color: 'green'
    },
    showTrustBadges: true
  }),

  // ACH REMINDER — 48 HOURS (increased urgency)
  achReminder48h: (contact, portalUrl) => createRichEmail({
    subject: `⏰ ${contact.firstName}, your credit repair is on hold — quick action needed`,
    preheader: 'We\'re ready to start but need your payment method first',
    recipientName: contact.firstName,
    urgencyLevel: 'medium',
    bodyContent: `Hi ${contact.firstName},

I wanted to let you know that your credit repair case is currently on hold. Everything is set up on our end — we just need your payment method to activate your service.

<strong style="color: #ea580c;">⏳ Why This Matters:</strong>

Every day without active credit repair is a day that:
- Negative items continue aging on your report
- You're paying higher interest rates on loans and cards
- Your credit goals get pushed further out

<strong style="color: #059669;">✅ Here's the Good News:</strong>

You're literally 2 minutes away from having your case activated. Once the payment is set up, my team starts working on your disputes <strong>the same day</strong>.

<strong style="color: #1e40af;">Need Help?</strong>

If you're having trouble with the setup, or if something changed and you have questions, please don't hesitate to reach out:
- <strong>Call:</strong> ${SPEEDY_BRAND.phone} (available 24/7)
- <strong>Email:</strong> Just reply to this message
- <strong>Portal:</strong> Complete setup online anytime

<span style="color: #6b7280;">We're here to help. Let's get your credit repair started!</span>`,
    ctaButton: {
      text: '🏦 Set Up Payment Now — 2 Minutes',
      url: `${portalUrl}/ach-authorization/${contact.id || contact.contactId}`,
      color: 'orange'
    },
    showTrustBadges: true
  }),

  // ACH REMINDER — 5 DAYS (final / urgent)
  achReminderFinal: (contact, portalUrl) => createRichEmail({
    subject: `${contact.firstName}, we're holding your spot — but need to hear from you`,
    preheader: 'Your case is reserved but we can\'t hold it indefinitely without payment setup',
    recipientName: contact.firstName,
    urgencyLevel: 'high',
    bodyContent: `Hi ${contact.firstName},

I'm reaching out personally because it's been several days since you signed your service agreement, and we still haven't received your payment setup.

<strong style="color: #dc2626;">⚠️ Your case is reserved, but we need to hear from you.</strong>

I understand life gets busy, and sometimes things slip through the cracks. If that's the case, this is a friendly nudge to complete the one final step.

<strong>But if something changed</strong> — if you have questions, concerns, or need to discuss your plan — I genuinely want to hear from you. After 30 years in this business, I know that the decision to repair your credit is a big one, and I want to make sure you feel 100% comfortable.

<strong style="color: #1e40af;">📞 Three Ways to Move Forward:</strong>

<strong>Option 1:</strong> Complete your payment setup online (takes 2 minutes)
<strong>Option 2:</strong> Call me at ${SPEEDY_BRAND.phone} — I'll walk you through it personally
<strong>Option 3:</strong> Reply to this email with any questions or concerns

<strong style="color: #059669;">Whatever you decide, there's no pressure.</strong> I just don't want you to miss out on improving your credit because of a small administrative step.

<span style="color: #6b7280;">Looking forward to hearing from you,<br/>Chris Lahage — Speedy Credit Repair</span>`,
    ctaButton: {
      text: '✅ Complete Setup — Start My Credit Repair',
      url: `${portalUrl}/ach-authorization/${contact.id || contact.contactId}`,
      color: 'red'
    },
    showTrustBadges: true
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // TIER 1: IDIQ ENROLLMENT FAILURE RECOVERY (1 email)
  // Sends client-facing recovery email when IDIQ enrollment fails
  // ═══════════════════════════════════════════════════════════════════════════

  idiqEnrollmentFailed: (contact, retryUrl) => createRichEmail({
    subject: `${contact.firstName}, we hit a small snag — easy fix inside`,
    preheader: 'Your credit report enrollment needs a quick retry — takes 30 seconds',
    recipientName: contact.firstName,
    urgencyLevel: 'medium',
    bodyContent: `Hi ${contact.firstName},

We tried to set up your free 3-bureau credit report, but ran into a small technical issue. <strong>This happens occasionally and is easy to fix.</strong>

<strong style="color: #1e40af;">🔧 What Happened:</strong>

The credit monitoring enrollment didn't complete on the first try. This is usually caused by:
- A temporary connection timeout
- An address format that needs a small adjustment
- A brief service interruption on the credit bureau's end

<strong style="color: #059669;">✅ The Fix (30 Seconds):</strong>

Just click the button below to retry the enrollment. In most cases, it goes through perfectly on the second attempt.

If it doesn't work on the second try, <strong>please call us at ${SPEEDY_BRAND.phone}</strong> and we'll complete the enrollment together over the phone. We do this all the time — it's quick and painless.

<strong style="color: #1e40af;">💡 Why This Matters:</strong>

The credit report is the foundation of everything we do. Without it, we can't identify the negative items to dispute or build your personalized strategy. The sooner we get this set up, the sooner we can start improving your credit.

<span style="color: #6b7280;">Don't worry — this is a minor hiccup, not a roadblock. We'll get it sorted!</span>`,
    ctaButton: {
      text: '🔄 Retry My Enrollment',
      url: retryUrl || `${SPEEDY_BRAND.portalUrl}/complete-enrollment?contactId=${contact.id || contact.contactId}`,
      color: 'orange'
    },
    showTrustBadges: true
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // TIER 2: DISPUTE LIFECYCLE EMAILS (5 emails)
  // Keeps clients engaged through the dispute process with real updates
  // ═══════════════════════════════════════════════════════════════════════════

  // DELETION CELEBRATION — When items are removed from credit report
  disputeDeletionCelebration: (contact, data) => createRichEmail({
    subject: `🎉 ${contact.firstName}, negative items were REMOVED from your report!`,
    preheader: `Great news — ${data.deletedCount || 'multiple'} item(s) deleted from your credit report`,
    recipientName: contact.firstName,
    urgencyLevel: 'normal',
    bodyContent: `<strong style="color: #059669; font-size: 22px;">🎉 CONGRATULATIONS, ${contact.firstName}!</strong>

We just got results back from the credit bureaus, and I'm thrilled to share this with you:

<div style="background: #f0fdf4; border: 2px solid #059669; border-radius: 12px; padding: 25px; text-align: center; margin: 20px 0;">
  <p style="font-size: 42px; margin: 0;">🏆</p>
  <p style="font-size: 24px; font-weight: 700; color: #059669; margin: 10px 0;">${data.deletedCount || 'Multiple'} Negative Item${(data.deletedCount || 0) !== 1 ? 's' : ''} DELETED</p>
  <p style="font-size: 15px; color: #374151; margin: 0;">${data.deletedItems || 'Items successfully removed from your credit report'}</p>
</div>

This means those items are no longer dragging down your credit score. Each deletion typically results in a score increase — sometimes significant.

<strong style="color: #1e40af;">📊 What This Means for You:</strong>

- Your credit score should increase when bureaus update (usually within 1-2 weeks)
- Lenders will see a cleaner credit history
- You may qualify for better interest rates and credit products
- We're one step closer to your credit goals

<strong style="color: #059669;">🔄 What's Next:</strong>

${data.remainingItems ? `We still have ${data.remainingItems} item(s) to address. We're already preparing the next round of disputes — the momentum is on our side!` : `We'll continue monitoring for any remaining items and keep pushing until your credit is where it should be.`}

<span style="color: #6b7280;">Log in to your portal to see the full details of what was removed.</span>`,
    ctaButton: {
      text: '🏆 View My Results',
      url: `${SPEEDY_BRAND.portalUrl}/portal`,
      color: 'green'
    },
    showTrustBadges: true
  }),

  // NO DELETIONS — Strategy Pivot (empathetic, maintains trust)
  disputeNoDeletions: (contact, data) => createRichEmail({
    subject: `${contact.firstName}, your Round ${data.roundNumber || 1} results are in — here's our next move`,
    preheader: 'The bureaus verified these items, but we have a stronger strategy ready',
    recipientName: contact.firstName,
    urgencyLevel: 'normal',
    bodyContent: `I wanted to give you an honest update on your dispute results.

<strong style="color: #1e40af;">📋 Round ${data.roundNumber || 1} Results:</strong>

The credit bureaus came back and verified the disputed items this round. I know that's not the news you were hoping for, and I want to be transparent with you about it.

<strong style="color: #059669;">But here's the important part — this is completely normal, and it's NOT the end of the road.</strong>

<strong style="color: #1e40af;">🔍 Why This Happens:</strong>

In Round 1, we cast a wide net challenging items across all three bureaus. Some creditors have their records organized well enough to verify quickly. That's okay — it actually gives us valuable information.

<strong style="color: #059669;">🎯 Our Next Strategy (Stronger Approach):</strong>

For the next round, we're switching to more aggressive tactics:

<strong>1. Method of Verification Demands</strong> — We're legally entitled to know exactly HOW the bureaus verified these items. Often, their verification process has flaws we can exploit.

<strong>2. Direct Creditor Challenges</strong> — Instead of going through the bureaus, we dispute directly with the creditor. Different rules, different results.

<strong>3. Debt Validation Letters</strong> — We require creditors to prove they have complete documentation. Many don't.

<strong>4. Regulatory Complaint Strategy</strong> — If bureaus aren't following proper procedures, we escalate to the CFPB.

<strong style="color: #1e40af;">📈 Success Rates by Round:</strong>

Many of our most successful cases had modest Round 1 results but saw major breakthroughs in Rounds 2-3. The first round softens the ground — the follow-up rounds are where we often see the biggest wins.

<span style="color: #6b7280;">I'm not giving up, and I don't want you to either. We're just getting started.</span>`,
    ctaButton: {
      text: '📊 View Full Results',
      url: `${SPEEDY_BRAND.portalUrl}/portal`,
      color: 'blue'
    },
    showTrustBadges: true
  }),

  // NEW DISPUTE ROUND STARTING — Notification
  disputeNewRound: (contact, data) => createRichEmail({
    subject: `${contact.firstName}, Round ${data.roundNumber || 2} disputes are going out!`,
    preheader: `New dispute letters prepared and ready to send — here's what we're targeting`,
    recipientName: contact.firstName,
    urgencyLevel: 'normal',
    bodyContent: `Great news — we've prepared your next round of dispute letters and they're going out now!

<strong style="color: #1e40af;">📬 Round ${data.roundNumber || 2} Details:</strong>

<div style="background: #eff6ff; border-left: 4px solid #1e40af; padding: 15px; margin: 15px 0; border-radius: 0 8px 8px 0;">
  <strong>Letters Being Sent:</strong> ${data.letterCount || 'Multiple'} dispute letters<br/>
  <strong>Bureaus Targeted:</strong> ${data.bureaus || 'Experian, TransUnion, Equifax'}<br/>
  <strong>Items Challenged:</strong> ${data.itemsChallenged || 'Multiple negative items'}<br/>
  <strong>Strategy:</strong> ${data.strategy || 'Enhanced verification demands + direct creditor challenges'}
</div>

<strong style="color: #059669;">🔄 What's Different This Round:</strong>

Each round builds on what we learned from the previous one. We use the bureau responses to identify weaknesses in their verification process and target those specifically. This is a strategic, multi-round approach — not a one-shot effort.

<strong style="color: #1e40af;">📅 Timeline:</strong>

- <strong>This Week:</strong> Letters sent to bureaus and creditors
- <strong>Days 5-30:</strong> Investigation period (bureaus have 30 days to respond)
- <strong>Days 30-45:</strong> Results arrive — watch your mail!

Same as before — please forward any bureau letters to us as soon as you receive them.

<span style="color: #6b7280;">We're making progress. Every round brings us closer to your credit goals!</span>`,
    ctaButton: {
      text: '📋 View Dispute Details',
      url: `${SPEEDY_BRAND.portalUrl}/portal`,
      color: 'green'
    },
    showTrustBadges: true
  }),

  // MONTHLY PROGRESS REPORT — Keeps client informed
  monthlyProgressReport: (contact, data) => createRichEmail({
    subject: `${contact.firstName}, your monthly credit repair progress report`,
    preheader: `Here's where things stand after ${data.monthsActive || '1'} month(s) of credit repair`,
    recipientName: contact.firstName,
    urgencyLevel: 'normal',
    bodyContent: `Here's your monthly progress update, ${contact.firstName}. I like to keep you informed every step of the way.

<div style="background: #f9fafb; border: 1px solid #d1d5db; border-radius: 12px; padding: 25px; margin: 15px 0;">
  <p style="font-size: 18px; font-weight: 700; color: #1e40af; margin: 0 0 15px;">📊 Monthly Summary</p>
  <table style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Months Active:</strong></td>
      <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${data.monthsActive || '1'}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Dispute Rounds Completed:</strong></td>
      <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${data.roundsCompleted || '1'}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Items Challenged:</strong></td>
      <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${data.itemsChallenged || '—'}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Items Deleted:</strong></td>
      <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right; color: #059669; font-weight: 700;">${data.itemsDeleted || '0'}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0;"><strong>Items Pending:</strong></td>
      <td style="padding: 8px 0; text-align: right;">${data.itemsPending || '—'}</td>
    </tr>
  </table>
</div>

${data.scoreChange ? `<div style="background: #f0fdf4; border: 1px solid #059669; border-radius: 8px; padding: 15px; text-align: center; margin: 15px 0;">
  <p style="margin: 0; font-size: 16px;">Estimated Score Change: <strong style="color: #059669; font-size: 20px;">${data.scoreChange > 0 ? '+' : ''}${data.scoreChange} points</strong></p>
</div>` : ''}

<strong style="color: #1e40af;">🔜 What's Coming Next:</strong>

${data.nextSteps || 'We\'re continuing to work on your remaining items and preparing the next phase of your dispute strategy.'}

<strong style="color: #059669;">💡 Reminder:</strong>

Your client portal is always up to date with the latest information on your case. You can check in anytime to see dispute statuses, uploaded documents, and more.

<span style="color: #6b7280;">Questions about anything in this report? Just reply to this email — I'm always here.</span>`,
    ctaButton: {
      text: '📈 View Full Report in Portal',
      url: `${SPEEDY_BRAND.portalUrl}/portal`,
      color: 'blue'
    },
    showTrustBadges: true
  }),

  // SCORE MILESTONE CELEBRATION — 600, 650, 700, 750+
  scoreMilestone: (contact, data) => createRichEmail({
    subject: `🎉 ${contact.firstName}, you just crossed ${data.milestone} — AMAZING!`,
    preheader: `Your credit score hit ${data.milestone}! Here's what this unlocks for you`,
    recipientName: contact.firstName,
    urgencyLevel: 'normal',
    bodyContent: `<div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); border-radius: 12px; padding: 30px; text-align: center; margin: 0 0 25px;">
  <p style="font-size: 48px; margin: 0;">🌟</p>
  <p style="font-size: 28px; font-weight: 700; color: white; margin: 10px 0;">SCORE MILESTONE!</p>
  <p style="font-size: 36px; font-weight: 800; color: white; margin: 0;">${data.milestone}+</p>
  <p style="font-size: 14px; color: rgba(255,255,255,0.9); margin: 10px 0 0;">Credit Score Achievement Unlocked</p>
</div>

${contact.firstName}, this is a <strong>huge</strong> accomplishment and I'm genuinely proud of the progress you've made!

<strong style="color: #1e40af;">🔓 What a ${data.milestone}+ Score Unlocks:</strong>

${data.milestone >= 750 ? `<strong>Excellent Credit (750+):</strong>
- The best interest rates on mortgages, auto loans, and credit cards
- Premium credit card approvals (travel rewards, cash back)
- Lower insurance premiums
- No security deposits on utilities and rentals
- Negotiating power with lenders` : 
data.milestone >= 700 ? `<strong>Good Credit (700+):</strong>
- Competitive mortgage rates (saves thousands over the life of a loan)
- Approval for most major credit cards
- Better auto loan terms
- Easier apartment rental approvals
- Lower insurance rates` :
data.milestone >= 650 ? `<strong>Fair-to-Good Credit (650+):</strong>
- Auto loan approvals with reasonable rates
- Many credit card approvals
- Easier apartment rental applications
- Better insurance rates than before
- You're now above the national average!` :
`<strong>Building Credit (600+):</strong>
- You've crossed out of the "poor" credit range — that's a big deal!
- More credit card options available to you now
- Auto loan approvals become possible
- Rental applications become easier
- Foundation for continued improvement`}

${data.previousScore ? `<div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 15px 0;">
  <strong>Your Journey:</strong> ${data.previousScore} → <strong style="color: #059669;">${data.currentScore || data.milestone}+</strong> (${data.pointsGained || (data.currentScore - data.previousScore)} points gained!)
</div>` : ''}

<strong style="color: #059669;">We're not done yet!</strong> Every point matters, and we'll keep pushing to maximize your score.

<span style="color: #6b7280;">Celebrate this win — you've earned it! 🎉</span>`,
    ctaButton: {
      text: '🏆 View My Progress',
      url: `${SPEEDY_BRAND.portalUrl}/portal`,
      color: 'green'
    },
    showTrustBadges: true
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // TIER 2: GRADUATION & POST-SERVICE (2 emails)
  // Celebrates completion and keeps them as a referral source
  // ═══════════════════════════════════════════════════════════════════════════

  // GRADUATION — Service Complete
  graduationComplete: (contact, data) => createRichEmail({
    subject: `🎓 ${contact.firstName}, CONGRATULATIONS — your credit repair is complete!`,
    preheader: 'You did it! Here\'s a summary of everything we accomplished together',
    recipientName: contact.firstName,
    urgencyLevel: 'normal',
    bodyContent: `<div style="background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%); border-radius: 12px; padding: 35px; text-align: center; margin: 0 0 25px;">
  <p style="font-size: 52px; margin: 0;">🎓</p>
  <p style="font-size: 26px; font-weight: 700; color: white; margin: 10px 0;">CREDIT REPAIR COMPLETE!</p>
  <p style="font-size: 16px; color: rgba(255,255,255,0.9); margin: 0;">Congratulations, ${contact.firstName}!</p>
</div>

It's been an honor working with you, ${contact.firstName}. Today marks the completion of your credit repair journey with Speedy Credit Repair, and I couldn't be more proud of what we accomplished together.

<strong style="color: #1e40af;">📊 Your Final Results:</strong>

<div style="background: #f9fafb; border: 1px solid #d1d5db; border-radius: 12px; padding: 20px; margin: 15px 0;">
  <table style="width: 100%; border-collapse: collapse;">
    ${data.startScore && data.endScore ? `<tr>
      <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Starting Score:</strong></td>
      <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${data.startScore}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Final Score:</strong></td>
      <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right; color: #059669; font-weight: 700;">${data.endScore}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Points Gained:</strong></td>
      <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right; color: #059669; font-weight: 700;">+${data.endScore - data.startScore}</td>
    </tr>` : ''}
    <tr>
      <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Items Removed:</strong></td>
      <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${data.totalItemsRemoved || '—'}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Dispute Rounds:</strong></td>
      <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${data.totalRounds || '—'}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0;"><strong>Months Active:</strong></td>
      <td style="padding: 8px 0; text-align: right;">${data.monthsActive || '—'}</td>
    </tr>
  </table>
</div>

<strong style="color: #059669;">🔜 What Happens Now:</strong>

Your service is complete and no further payments will be processed. Here's what to keep in mind going forward:

- <strong>Your portal stays active</strong> — you can still access your documents and history
- <strong>Watch for your final credit reports</strong> — scores may continue improving as bureaus update
- <strong>I'll send you maintenance tips</strong> in a few days to help protect your improved score

<strong style="color: #1e40af;">One Last Thing:</strong>

If you know anyone struggling with their credit, I'd be grateful for the referral. After 30 years in this business, most of my clients come from people like you who experienced the results firsthand.

<span style="color: #6b7280;">Thank you for trusting Speedy Credit Repair with your credit journey. It's been a privilege.</span>

<p style="margin: 25px 0 0 0;">With gratitude,<br/><strong>${SPEEDY_BRAND.ownerName}</strong><br/>${SPEEDY_BRAND.companyName}<br/><em>Helping families since ${SPEEDY_BRAND.established}</em></p>`,
    ctaButton: {
      text: '⭐ Leave Us a Google Review',
      url: SPEEDY_BRAND.googleReviewUrl,
      color: 'green'
    },
    showTrustBadges: true
  }),

  // MAINTENANCE TIPS — 7 Days After Graduation
  postGraduationTips: (contact) => createRichEmail({
    subject: `${contact.firstName}, 7 tips to PROTECT your improved credit score`,
    preheader: 'Now that your credit is repaired, here\'s how to keep it that way',
    recipientName: contact.firstName,
    urgencyLevel: 'normal',
    bodyContent: `Now that your credit repair is complete, I want to make sure your improved score stays that way. These are the same tips I share with every graduating client — they work.

<strong style="color: #1e40af;">🛡️ 7 Rules to Protect Your Credit Score:</strong>

<strong>1. Never Miss a Payment — Ever</strong>
Payment history is 35% of your score. Set up autopay on everything, even if it's just the minimum. One 30-day late payment can drop your score 50-100 points.

<strong>2. Keep Credit Utilization Below 30%</strong>
If your card limit is $1,000, keep the balance below $300. Below 10% is even better. This is 30% of your score.

<strong>3. Don't Close Your Oldest Cards</strong>
Length of credit history matters. Even if you don't use a card, keep it open. Cut it up if you need to — but don't close the account.

<strong>4. Limit Hard Inquiries</strong>
Only apply for credit when you truly need it. Each application creates a hard inquiry that temporarily lowers your score. Space applications at least 6 months apart.

<strong>5. Check Your Reports Every 4 Months</strong>
Pull one free report from AnnualCreditReport.com every 4 months (rotating between Experian, TransUnion, and Equifax). This way you're monitoring year-round for free.

<strong>6. Dispute Any New Errors Immediately</strong>
Errors happen. If you spot something wrong, dispute it right away. You now know the process — or call us and we'll help.

<strong>7. Build Positive Credit Strategically</strong>
Consider a credit builder loan or secured card if you want to strengthen your profile further. The key is small, manageable accounts that you pay on time every month.

<strong style="color: #059669;">📞 We're Always Here:</strong>

Even though your service is complete, you're always welcome to reach out if you have questions about your credit. Once a Speedy client, always part of the family.

<span style="color: #6b7280;">And if you know anyone who could use our help — family, friends, coworkers — we'd love the introduction. Call ${SPEEDY_BRAND.phone} or visit ${SPEEDY_BRAND.website}.</span>`,
    ctaButton: {
      text: '🔐 Access My Portal & Documents',
      url: `${SPEEDY_BRAND.portalUrl}/portal`,
      color: 'blue'
    },
    showTrustBadges: true
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // TIER 3: LONG-TERM GROWTH (Reviews, Referrals, Re-engagement)
  // Turns graduated clients into revenue-generating referral sources
  // ═══════════════════════════════════════════════════════════════════════════

  // REVIEW/TESTIMONIAL REQUEST — 30 Days After Graduation
  reviewRequest: (contact) => createRichEmail({
    subject: `${contact.firstName}, would you share your experience? (takes 30 seconds)`,
    preheader: 'Your review helps other families discover credit repair — and it means a lot to us',
    recipientName: contact.firstName,
    urgencyLevel: 'normal',
    bodyContent: `Hi ${contact.firstName},

It's been about a month since we completed your credit repair, and I hope you're enjoying your improved score!

I have a small favor to ask. If you're happy with the results we achieved together, <strong>would you take 30 seconds to leave us a quick Google review?</strong>

<strong style="color: #1e40af;">⭐ Why It Matters:</strong>

Honest reviews from real clients like you are the #1 way other families discover that credit repair actually works. Your story could be the thing that convinces someone in a tough spot to take that first step.

You don't need to write a novel — even a sentence or two about your experience makes a huge difference.

<strong style="color: #059669;">📝 What to Include (if you'd like):</strong>

- How your score improved
- What surprised you about the process
- How the improved credit has helped you (better rates, approvals, etc.)
- Whether you'd recommend us

<div style="background: #f0fdf4; border: 1px solid #059669; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
  <p style="margin: 0 0 5px; font-size: 14px; color: #374151;">We're currently rated</p>
  <p style="margin: 0; font-size: 24px; font-weight: 700; color: #059669;">⭐ ${SPEEDY_BRAND.googleRating} with ${SPEEDY_BRAND.reviewCount} Reviews</p>
  <p style="margin: 5px 0 0; font-size: 13px; color: #6b7280;">Your review keeps us going!</p>
</div>

<span style="color: #6b7280;">Either way, thank you for choosing Speedy Credit Repair. It was a privilege working with you.</span>`,
    ctaButton: {
      text: '⭐ Leave a Quick Review',
      url: SPEEDY_BRAND.googleReviewUrl,
      color: 'green'
    },
    showTrustBadges: true
  }),

  // REFERRAL PROGRAM INVITE — 45 Days After Graduation
  referralInvite: (contact) => createRichEmail({
    subject: `${contact.firstName}, earn rewards by helping someone you know fix their credit`,
    preheader: 'Know someone struggling with credit? You can help them AND earn a thank-you reward',
    recipientName: contact.firstName,
    urgencyLevel: 'normal',
    bodyContent: `Hi ${contact.firstName},

You experienced firsthand what professional credit repair can do. Now imagine being the person who helps a friend or family member get that same fresh start.

<strong style="color: #1e40af;">🎁 Our Client Referral Program:</strong>

<div style="background: #eff6ff; border: 2px solid #1e40af; border-radius: 12px; padding: 25px; margin: 15px 0;">
  <p style="font-size: 18px; font-weight: 700; color: #1e40af; margin: 0 0 15px; text-align: center;">Here's How It Works</p>
  
  <p style="margin: 8px 0;"><strong>Step 1:</strong> Tell someone you know about your experience with Speedy Credit Repair</p>
  <p style="margin: 8px 0;"><strong>Step 2:</strong> Have them mention your name when they call us at ${SPEEDY_BRAND.phone}</p>
  <p style="margin: 8px 0;"><strong>Step 3:</strong> When they sign up, you BOTH benefit!</p>
</div>

<strong style="color: #059669;">Who Should You Refer?</strong>

Think about people in your life who:
- Have been denied for a mortgage, car loan, or credit card
- Complain about high interest rates
- Are stressed about their credit score
- Want to buy a home but can't qualify
- Have collections, late payments, or other negative items

A simple "Hey, I used this company and they really helped me" can change someone's financial future.

<strong style="color: #1e40af;">📞 Two Easy Ways to Refer:</strong>

<strong>Option 1:</strong> Have them call us directly at <strong>${SPEEDY_BRAND.phone}</strong> and mention your name
<strong>Option 2:</strong> Reply to this email with their name and phone number, and we'll reach out

<span style="color: #6b7280;">After 30 years in business, over 80% of our clients come from referrals. That says everything about the results we deliver — and the trust our clients have in us.</span>`,
    ctaButton: {
      text: '📞 Share Our Number: ${SPEEDY_BRAND.phone}',
      url: `tel:${SPEEDY_BRAND.phoneLink}`,
      color: 'blue'
    },
    showTrustBadges: true
  }),

  // 6-MONTH ANNIVERSARY CHECK-IN
  anniversaryCheckIn6Mo: (contact) => createRichEmail({
    subject: `${contact.firstName}, it's been 6 months — how's your credit holding up?`,
    preheader: 'Quick check-in from Chris at Speedy Credit Repair — we\'re still here for you',
    recipientName: contact.firstName,
    urgencyLevel: 'normal',
    bodyContent: `Hi ${contact.firstName},

Can you believe it's been 6 months since we completed your credit repair? Time flies!

I wanted to check in and see how things are going. By now, the full impact of our work should be reflected across all three bureaus, and I hope you've been able to take advantage of your improved score.

<strong style="color: #1e40af;">📋 Quick Credit Health Checklist:</strong>

Take a minute to honestly assess — are you doing these things?

✅ Paying all bills on time (autopay set up?)
✅ Keeping credit card balances below 30%
✅ Not opening too many new accounts
✅ Checking your credit report at least quarterly
✅ Disputing any new errors immediately

If you answered "no" to any of these, that's okay — it's never too late to course-correct.

<strong style="color: #059669;">🔍 Free Credit Check Reminder:</strong>

You're entitled to one free report per year from each bureau at AnnualCreditReport.com. I recommend pulling one every 4 months (rotating bureaus) so you're covered year-round.

<strong style="color: #1e40af;">Need Help Again?</strong>

If new negative items have appeared, or if you're planning a major purchase (home, car) and want to make sure your credit is in top shape, don't hesitate to call me. Past clients always get priority service.

<span style="color: #6b7280;">And remember — if you know anyone who needs credit help, send them our way. Your referrals mean the world to us.</span>

<p style="margin: 25px 0 0;">Still in your corner,<br/><strong>${SPEEDY_BRAND.ownerName}</strong><br/>${SPEEDY_BRAND.companyName}<br/>${SPEEDY_BRAND.phone}</p>`,
    ctaButton: {
      text: '📞 Call Chris — Priority Service',
      url: `tel:${SPEEDY_BRAND.phoneLink}`,
      color: 'green'
    },
    showTrustBadges: true
  }),

  // 12-MONTH RE-ENGAGEMENT
  reEngagement12Mo: (contact) => createRichEmail({
    subject: `${contact.firstName}, it's been a year — let's make sure your credit is still strong`,
    preheader: 'Annual credit check-in from Speedy Credit Repair — free consultation for returning clients',
    recipientName: contact.firstName,
    urgencyLevel: 'normal',
    bodyContent: `Hi ${contact.firstName},

It's been about a year since we finished working together, and I wanted to reach out.

A lot can change in 12 months — new accounts, life events, maybe even some unexpected items on your report. That's completely normal, and it's exactly why I recommend an annual credit review.

<strong style="color: #1e40af;">📊 Why an Annual Review Matters:</strong>

- <strong>Identity theft</strong> is at an all-time high — new fraudulent accounts may have appeared
- <strong>Reporting errors</strong> happen more often than you'd think (79% of reports contain mistakes)
- <strong>Old items</strong> may now be past the 7-year limit and eligible for removal
- <strong>New goals</strong> (buying a home, refinancing, starting a business) may require a higher score

<strong style="color: #059669;">🎁 Special Offer for Returning Clients:</strong>

<div style="background: #f0fdf4; border: 2px solid #059669; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;">
  <p style="font-size: 18px; font-weight: 700; color: #059669; margin: 0;">FREE Credit Review Consultation</p>
  <p style="font-size: 14px; color: #374151; margin: 8px 0 0;">For past clients only — no obligation, no pressure</p>
</div>

Call me at <strong>${SPEEDY_BRAND.phone}</strong> and mention you're a returning client. I'll personally review your current reports and let you know if there's anything new that needs attention.

If your credit looks great — fantastic! I'll tell you that and we'll part ways with a handshake. If there are new issues, we'll discuss options with your returning-client discount.

<span style="color: #6b7280;">Either way, it's good to know where you stand. Talk soon!</span>

<p style="margin: 25px 0 0;">Here for you,<br/><strong>${SPEEDY_BRAND.ownerName}</strong><br/>${SPEEDY_BRAND.companyName}</p>`,
    ctaButton: {
      text: '📞 Schedule My Free Review',
      url: `tel:${SPEEDY_BRAND.phoneLink}`,
      color: 'green'
    },
    showTrustBadges: true
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // TIER 3: QUIZ LEAD NURTURE (2 emails)
  // Follows up with quiz leads who haven't enrolled
  // ═══════════════════════════════════════════════════════════════════════════

  // QUIZ NURTURE — 24 Hours After Quiz, No Enrollment
  quizNurture24h: (contact, data) => createRichEmail({
    subject: `${contact.firstName}, your credit assessment results + a personal note`,
    preheader: 'I reviewed your quiz answers personally — here\'s what I think you should do next',
    recipientName: contact.firstName,
    urgencyLevel: 'normal',
    bodyContent: `Hi ${contact.firstName},

Thanks for taking our free credit assessment yesterday! I took a look at your answers personally, and I wanted to follow up.

<strong style="color: #1e40af;">📊 Based on What You Shared:</strong>

<div style="background: #eff6ff; border-left: 4px solid #1e40af; padding: 15px; margin: 15px 0; border-radius: 0 8px 8px 0;">
  <strong>Your Goal:</strong> ${data.creditGoal || 'Improve credit score'}<br/>
  <strong>Current Range:</strong> ${data.scoreRange || 'Not specified'}<br/>
  <strong>Negative Items:</strong> ${data.negativeItems || 'Multiple items reported'}
</div>

Here's the honest truth: based on your situation, professional credit repair could likely make a meaningful difference. I've seen thousands of cases like yours over my 30 years in the industry, and the clients who take action sooner consistently see better results.

<strong style="color: #059669;">Why Acting Sooner Matters:</strong>

- Negative items do the most damage when they're recent — removing them now has the biggest impact
- Every month you wait is another month paying higher interest rates
- Credit bureaus have legal deadlines to respond to disputes — the clock starts when we file
- Your credit goal of "${data.creditGoal || 'improving your score'}" becomes more achievable the sooner we start

<strong style="color: #1e40af;">🔜 Your Next Step:</strong>

The first thing we do is pull your complete 3-bureau credit report (it's free and takes about 5 minutes). This shows us exactly what's on your report and lets us build your personalized dispute strategy.

No commitment required — just information.

<span style="color: #6b7280;">Questions? Reply to this email or call me directly at ${SPEEDY_BRAND.phone}. I'm happy to chat.</span>`,
    ctaButton: {
      text: '📊 Get My Free Credit Report',
      url: `${SPEEDY_BRAND.portalUrl}/complete-enrollment?contactId=${contact.id || contact.contactId}&source=quiz-nurture`,
      color: 'green'
    },
    showTrustBadges: true
  }),

  // QUIZ URGENCY — 72 Hours After Quiz, No Enrollment
  quizUrgency72h: (contact, data) => createRichEmail({
    subject: `${contact.firstName}, quick question about your credit goals`,
    preheader: 'I noticed you haven\'t started your free credit report yet — everything okay?',
    recipientName: contact.firstName,
    urgencyLevel: 'medium',
    bodyContent: `Hi ${contact.firstName},

I noticed you took our credit assessment a few days ago but haven't started the free credit report yet. I just wanted to check in — is everything okay?

<strong style="color: #1e40af;">Common Reasons People Hesitate:</strong>

<strong>"I'm worried about my score dropping."</strong>
Pulling your report through IDIQ is a <strong>soft inquiry</strong> — it does NOT affect your credit score at all. Zero impact.

<strong>"I'm not sure I can afford credit repair."</strong>
Our plans start at just $79/month, and most clients save far more than that in reduced interest rates within the first few months. It literally pays for itself.

<strong>"I'm not sure it will work for me."</strong>
After 30 years and thousands of clients, I can tell you that nearly every credit report has disputable items. Studies show 79% of reports contain errors. The question isn't IF we can help — it's how much.

<strong>"I just got busy."</strong>
Totally understandable! That's actually why I'm writing — a gentle nudge to get this done while it's on your mind. The enrollment takes about 5 minutes.

<strong style="color: #059669;">Here's My Promise:</strong>

If we pull your report and there's genuinely nothing we can do, I'll tell you that honestly. I've built my business on trust over 30 years — I'm not going to sell you something you don't need.

<div style="background: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px; padding: 15px; margin: 20px 0;">
  <p style="margin: 0; font-weight: 700; color: #991b1b;">⏰ The Cost of Waiting:</p>
  <p style="margin: 8px 0 0; color: #374151;">Every month with negative items on your report costs you an average of $200+ in higher interest rates across all your accounts. That's $2,400/year that could be in your pocket instead.</p>
</div>

<span style="color: #6b7280;">Take 5 minutes today. Future you will thank you.</span>`,
    ctaButton: {
      text: '✅ Start My Free Credit Report — 5 Minutes',
      url: `${SPEEDY_BRAND.portalUrl}/complete-enrollment?contactId=${contact.id || contact.contactId}&source=quiz-urgency`,
      color: 'orange'
    },
    showTrustBadges: true
  })
};

console.log('🚀 Loading SpeedyCRM Consolidated Functions...');

// ============================================
// FUNCTION 1: EMAIL SERVICE (Consolidated)
// ============================================
// Handles: Send emails (manual/automated/raw) + track opens/clicks
// Replaces: manualSendEmail, sendEmail, sendRawEmail, trackEmailOpen, trackEmailClick
// Savings: 5 functions → 1 function = $18/month saved

exports.emailService = onCall(
  {
    ...defaultConfig,
    secrets: [gmailUser, gmailAppPassword, gmailFromName, gmailReplyTo]
  },
  async (request) => {
    // ===== BUG #5 FIX: onCall uses request.data, NOT request.body =====
    // emailService is an onCall function (not onRequest), so:
    //   - Data comes from request.data (not request.body)
    //   - Errors are thrown (not sent via response.status())
    //   - Return values go directly to the client
    const { action, ...params } = request.data || {};
    
    console.log('📧 Email Service action:', action);
    
    // Validate action — onCall has no 'response' object, so we throw
    if (!action) {
      throw new Error('Missing required parameter: action');
    }
    
    const db = admin.firestore();
    
    let result;
    
    console.log('📧 Email Service:', action);
    
    const user = gmailUser.value();
    const pass = gmailAppPassword.value();
    
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: { user, pass }
    });
    
    try {
      switch (action) {
        case 'send': {
          const { to, subject, body, recipientName, contactId, templateType } = params;
          
          // ===== CAN-SPAM: Check suppression list before sending =====
          if (to) {
            try {
              const suppressionDoc = await db.collection('emailSuppressionList').doc(to.toLowerCase()).get();
              if (suppressionDoc.exists) {
                console.log(`⛔ Email blocked — ${to} is on suppression list`);
                return { success: false, message: 'Recipient has unsubscribed', blocked: true };
              }
            } catch (suppressErr) {
              console.warn('⚠️ Suppression list check failed (sending anyway):', suppressErr.message);
            }
            
            // Also check contact-level opt-out
            if (contactId) {
              try {
                const contactDoc = await db.collection('contacts').doc(contactId).get();
                if (contactDoc.exists) {
                  const contactData = contactDoc.data();
                  if (contactData.emailOptOut === true || contactData.unsubscribed === true) {
                    console.log(`⛔ Email blocked — contact ${contactId} opted out`);
                    return { success: false, message: 'Contact has opted out of emails', blocked: true };
                  }
                }
              } catch (optOutErr) {
                console.warn('⚠️ Contact opt-out check failed (sending anyway):', optOutErr.message);
              }
            }
          }
          
          await transporter.sendMail({
            from: `"${gmailFromName.value() || 'Speedy Credit Repair'}" <${user}>`,
            to,
            replyTo: gmailReplyTo.value() || user,
            subject,
            text: body,
            html: wrapEmailInHTML(subject, body, recipientName, to)
          });
          
          // Log email sent
          if (contactId) {
            await db.collection('emailLog').add({
              contactId,
              to,
              subject,
              templateType: templateType || 'custom',
              sentAt: admin.firestore.FieldValue.serverTimestamp(),
              status: 'sent',
              opened: false,
              clicked: false
            });
          }
          
          console.log('✅ Email sent to:', to);
          return { success: true, message: 'Email sent successfully' };
        }
        
        case 'trackOpen': {
          const { emailId, contactId } = params;
          
          if (contactId && emailId) {
            await db.collection('emailLog').doc(emailId).update({
              opened: true,
              openedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            
            console.log('📖 Email opened:', emailId);
          }
          
          return { success: true };
        }
        
        case 'trackClick': {
          const { emailId, contactId, url } = params;
          
          if (contactId && emailId) {
            await db.collection('emailLog').doc(emailId).update({
              clicked: true,
              clickedAt: admin.firestore.FieldValue.serverTimestamp(),
              clickedUrl: url
            });
            
            console.log('🔗 Email link clicked:', url);
          }
          
          return { success: true };
        }
        
        default:
          throw new Error(`Unknown email action: ${action}`);
      }
    } catch (error) {
      console.error('❌ Email service error:', error);
      return { success: false, error: error.message };
    }
  }
);

console.log('✅ Function 1/10: emailService loaded');

// ============================================
// FUNCTION 2: AI RECEPTIONIST WEBHOOK
// ============================================
// Receives incoming AI Receptionist calls (must stay separate - webhook endpoint)

exports.receiveAIReceptionistCall = onRequest(
  {
    ...defaultConfig,
    secrets: [webhookSecret]
  },
  async (req, res) => {
    cors(req, res, async () => {
      console.log('📞 AI Receptionist Call Received');
      
      try {
        const { callId, transcript, callerPhone, callerName, duration } = req.body;
        
        const db = admin.firestore();
        
        // Store call data
        await db.collection('aiReceptionistCalls').add({
          callId,
          transcript,
          callerPhone,
          callerName,
          duration: duration || 0,
          receivedAt: admin.firestore.FieldValue.serverTimestamp(),
          processed: false
        });
        
        console.log('✅ Call stored:', callId);
        res.status(200).json({ success: true, callId });
      } catch (error) {
        console.error('❌ Receptionist webhook error:', error);
        res.status(500).json({ success: false, error: error.message });
      }
    });
  }
);

console.log('✅ Function 2/10: receiveAIReceptionistCall loaded');

// ============================================
// FUNCTION 3: PROCESS AI CALL (Consolidated)
// ============================================
// Handles: AI processing + reprocessing + lead scoring
// Replaces: processAIReceptionistCall, reprocessAIReceptionistCall, scoreLead

exports.processAICall = onCall(
  {
    memory: '1024MiB',
    timeoutSeconds: 120,
    maxInstances: 5,
    secrets: [openaiApiKey]
  },
  async (request) => {
    const { callId, isReprocess = false } = request.data;
    
    console.log(`🤖 ${isReprocess ? 'Reprocessing' : 'Processing'} AI call:`, callId);
    
    const db = admin.firestore();
    
    try {
      // Get call data
      const callSnapshot = await db.collection('aiReceptionistCalls')
        .where('callId', '==', callId)
        .limit(1)
        .get();
      
      if (callSnapshot.empty) {
        throw new Error('Call not found');
      }
      
      const callDoc = callSnapshot.docs[0];
      const callData = callDoc.data();
      
      // AI Analysis using OpenAI
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey.value()}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [{
            role: 'system',
            content: 'You are an AI assistant analyzing credit repair prospect calls. Extract: intent, urgency (1-10), credit concerns, and recommend next action. Respond in JSON format with fields: intent, urgency, concerns (array), recommendedAction, leadScore (1-10).'
          }, {
            role: 'user',
            content: `Call transcript: ${callData.transcript}`
          }],
          temperature: 0.7,
          max_tokens: 500
        })
      });
      
      const aiAnalysis = await openaiResponse.json();
      
      let analysis, leadScore;
      try {
        const parsed = JSON.parse(aiAnalysis.choices[0].message.content);
        analysis = aiAnalysis.choices[0].message.content;
        leadScore = parsed.leadScore || Math.min(10, Math.max(1, Math.floor(parsed.urgency || 5)));
      } catch {
        analysis = aiAnalysis.choices[0].message.content;
        leadScore = 5; // Default if parsing fails
      }
      
      // Update call with analysis
      await callDoc.ref.update({
        processed: true,
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
        aiAnalysis: analysis,
        leadScore,
        reprocessed: isReprocess
      });
      
      // Create contact if doesn't exist
      if (callData.callerPhone) {
        const existingContact = await db.collection('contacts')
          .where('phone', '==', callData.callerPhone)
          .limit(1)
          .get();
        
        if (existingContact.empty) {
          await db.collection('contacts').add({
            firstName: callData.callerName || 'Unknown',
            lastName: '',
            phone: callData.callerPhone,
            roles: ['contact', 'lead'],
            leadScore,
            source: 'ai-receptionist',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          });
          
          console.log('👤 New contact created from AI call');
        }
      }
      
      console.log('✅ AI call processed, lead score:', leadScore);
      return {
        success: true,
        callId,
        leadScore,
        analysis
      };
      
    } catch (error) {
      console.error('❌ Process AI call error:', error);
      return { success: false, error: error.message };
    }
  }
);

console.log('✅ Function 3/10: processAICall loaded');

// ============================================
// FUNCTION 4: CONTACT LIFECYCLE TRIGGER (ENHANCED)
// ============================================
// Triggers on: Contact document updates (including enrollment completion)
// Handles: New contact setup + Enrollment automation when status changes to 'enrolled'
// Enhanced: Now includes complete enrollment automation workflow
// NEW: Auto-assigns "lead" role based on lead indicators

exports.onContactUpdated = onDocumentUpdated(
  {
    document: 'contacts/{contactId}',
    ...defaultConfig,
    memory: '1GiB',
    timeoutSeconds: 540,  // 9 minutes for enrollment automation
    secrets: [gmailUser, gmailAppPassword, gmailFromName, gmailReplyTo, telnyxApiKey, telnyxSmsPhone]
  },
  async (event) => {
    const contactId = event.params.contactId;
    const beforeData = event.data.before?.data();
    const afterData = event.data.after?.data();
    
    // Skip if document was deleted
    if (!afterData) {
      console.log('⏭️ Contact deleted, skipping');
      return null;
    }
    
    const db = admin.firestore();
    
    try {
      // ═══════════════════════════════════════════════════════════════════════
      // AUTO-ASSIGN LEAD ROLE BASED ON INDICATORS (Runs on ALL updates)
      // ═══════════════════════════════════════════════════════════════════════
      const needsLeadRole = !afterData.roles || !afterData.roles.includes('lead');
      const hasLeadIndicators = 
        afterData.leadScore >= 5 || 
        afterData.source === 'ai_receptionist' ||
        afterData.source === 'landing_page' ||
        afterData.source === 'referral' ||
        afterData.source === 'website' ||
        afterData.source === 'form' ||
        afterData.source === 'walk_in' ||
        afterData.source === 'phone_call' ||
        (afterData.emails && afterData.emails.length > 0) ||
        (afterData.phones && afterData.phones.length > 0) ||
        afterData.email ||
        afterData.phone;
      
      if (needsLeadRole && hasLeadIndicators) {
        console.log('📝 Auto-assigning lead role to contact:', contactId);
        console.log('   Lead indicators found:', {
          leadScore: afterData.leadScore,
          source: afterData.source,
          hasEmail: !!afterData.email || afterData.emails?.length > 0,
          hasPhone: !!afterData.phone || afterData.phones?.length > 0
        });
        
        try {
          await event.data.after.ref.update({
            roles: admin.firestore.FieldValue.arrayUnion('lead'),
            rolesUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
            rolesUpdatedBy: 'system:auto_role_assignment'
          });
          console.log('✅ Lead role added successfully to:', contactId);
        } catch (roleErr) {
          console.error('❌ Failed to add lead role:', roleErr);
        }
      }

      // ═══════════════════════════════════════════════════════════════════════
      // SCENARIO 1: NEW CONTACT CREATED
      // ═══════════════════════════════════════════════════════════════════════
      if (!beforeData) {
        console.log('👤 New contact created:', contactId);
        
        // Lead role already handled above, but ensure it's set for new contacts
        if (!afterData.roles || !afterData.roles.includes('lead')) {
          await event.data.after.ref.update({
            roles: admin.firestore.FieldValue.arrayUnion('lead'),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
        }
        
        // Create welcome task
        await db.collection('tasks').add({
          title: `Welcome new ${afterData.source || 'lead'}: ${afterData.firstName} ${afterData.lastName || ''}`.trim(),
          contactId,
          type: 'followup',
          priority: afterData.leadScore >= 8 ? 'high' : 'medium',
          status: 'pending',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          createdBy: 'system'
        });
        
        console.log('✅ Contact initialization complete');
        return null;
      }
      
      // ═══════════════════════════════════════════════════════════════════════
      // SCENARIO 2: ENROLLMENT JUST COMPLETED (enrolled status)
      // ═══════════════════════════════════════════════════════════════════════
      const enrollmentJustCompleted = 
        (afterData.enrollmentStatus === 'enrolled' || afterData.enrollmentStatus === 'completed') &&
        beforeData.enrollmentStatus !== 'enrolled' &&
        beforeData.enrollmentStatus !== 'completed' &&
        !afterData.welcomeEmailSent;  // Prevent duplicate emails
      
      if (enrollmentJustCompleted) {
        console.log('🎓 ENROLLMENT COMPLETED - Sending welcome email...');
        console.log(`Contact: ${contactId} (${afterData.firstName} ${afterData.lastName})`);
        console.log(`Previous status: ${beforeData.enrollmentStatus}`);
        console.log(`New status: ${afterData.enrollmentStatus}`);
        
        // ─────────────────────────────────────────────────────────────────────
        // STEP 1: Send Welcome Client Email
        // ─────────────────────────────────────────────────────────────────────
        try {
          const user = gmailUser.value();
          const pass = gmailAppPassword.value();
          const fromName = gmailFromName.value() || 'Chris Lahage - Speedy Credit Repair';
          const replyTo = gmailReplyTo.value() || 'contact@speedycreditrepair.com';
          
          const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: { user, pass }
          });
          
          const emailConfig = {
            fromEmail: user,
            fromName: fromName,
            replyTo: replyTo
          };
          
          // Use the helper function from operations.js
          const emailResult = await operations.sendWelcomeClientEmail(
            contactId,
            afterData,
            transporter,
            emailConfig
          );
          
          if (emailResult.success) {
            console.log('✅ Welcome client email sent successfully');
          } else {
            console.error('⚠️ Welcome email failed:', emailResult.error);
          }
        } catch (emailError) {
          console.error('❌ Failed to send welcome email:', emailError);
          
          // Create task for manual follow-up
          await db.collection('tasks').add({
            title: `Welcome email failed: ${afterData.firstName} ${afterData.lastName}`,
            description: `Automatic welcome email failed. Please send manually.\n\nEmail: ${afterData.email}\nError: ${emailError.message}`,
            contactId,
            type: 'email_failure',
            priority: 'high',
            status: 'pending',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            createdBy: 'system'
          });
        }
        
        // ─────────────────────────────────────────────────────────────────────
        // STEP 2: Cancel any pending abandonment workflow
        // ─────────────────────────────────────────────────────────────────────
        await event.data.after.ref.update({
          abandonmentCancelled: true,
          enrollmentCompletedAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        console.log('✅ Abandonment workflow cancelled');
        
        // ─────────────────────────────────────────────────────────────────────
        // STEP 3: Run existing enrollment automation (if configured)
        // ─────────────────────────────────────────────────────────────────────
        if (!afterData.automation?.enrollmentProcessed) {
          try {
            const automationResults = await processEnrollmentCompletion(contactId, afterData);
            
            if (automationResults.success) {
              console.log('✅ Enrollment automation completed successfully');
            } else {
              console.error('⚠️ Enrollment automation completed with errors:', automationResults.error);
              
              // Create high-priority manual review task
              await db.collection('tasks').add({
                title: `Manual Review Required: ${afterData.firstName} ${afterData.lastName}`,
                description: `Automated enrollment workflow failed. Error: ${automationResults.error}\n\nContact: ${contactId}\nEmail: ${afterData.email}`,
                contactId,
                type: 'automation_failure',
                priority: 'critical',
                status: 'pending',
                dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                createdBy: 'system'
              });
            }
          } catch (automationError) {
            console.error('❌ Enrollment automation error:', automationError);
          }
        }
        
        // Log completion activity
        await db.collection('activityLogs').add({
          type: 'enrollment_completed',
          contactId: contactId,
          action: 'enrollment_workflow_complete',
          details: {
            email: afterData.email,
            welcomeEmailSent: true
          },
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          createdBy: 'system'
        });
        
        return null;
      }
      
      // ═══════════════════════════════════════════════════════════════════════
      // SCENARIO 3: CONTRACT JUST SIGNED
      // Triggers: Document upload request (optional) + ACH setup request (delayed)
      // ═══════════════════════════════════════════════════════════════════════
      const contractJustSigned = 
        (afterData.contractSigned === true || afterData.workflowStage === 8) &&
        (beforeData.contractSigned !== true && beforeData.workflowStage !== 8) &&
        !afterData.contractSignedEmailsSent;
      
      if (contractJustSigned) {
        console.log('📄 CONTRACT SIGNED - Sending onboarding emails...');
        console.log(`Contact: ${contactId} (${afterData.firstName} ${afterData.lastName})`);
        
        try {
          const user = gmailUser.value();
          const pass = gmailAppPassword.value();
          const fromName = gmailFromName.value() || 'Chris Lahage - Speedy Credit Repair';
          
          const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: { user, pass }
          });
          
          const recipientEmail = afterData.email || afterData.emails?.[0]?.address;
          const planName = afterData.selectedPlanName || afterData.selectedPlan || 'Credit Repair Service';
          const monthlyAmount = afterData.selectedPlanPrice || afterData.monthlyPrice || '149';
          const portalUrl = 'https://myclevercrm.com';
          
          if (!recipientEmail) {
            console.error('❌ No email address found for contact:', contactId);
            return null;
          }
          
          // ─────────────────────────────────────────────────────────────────
          // EMAIL 1: Document Upload Request (Optional - prevents drop-off)
          // ─────────────────────────────────────────────────────────────────
          console.log('📧 Sending document upload request (optional)...');
          
          const docEmailHtml = EMAIL_TEMPLATES.documentUploadRequest(
            { ...afterData, id: contactId },
            portalUrl
          );
          
          await transporter.sendMail({
            from: `"${fromName}" <${user}>`,
            to: recipientEmail,
            subject: `${afterData.firstName}, just a few quick items to complete your setup`,
            html: docEmailHtml
          });
          
          console.log('✅ Document upload request sent (marked as optional)');
          
          // ─────────────────────────────────────────────────────────────────
          // EMAIL 2: ACH Setup Request (Delayed by 2 hours)
          // We schedule this to avoid overwhelming the client with emails
          // ─────────────────────────────────────────────────────────────────
          const achScheduledFor = new Date(Date.now() + (2 * 60 * 60 * 1000)); // 2 hours from now
          
          await db.collection('scheduledEmails').add({
            contactId: contactId,
            type: 'ach_setup_request',
            scheduledFor: admin.firestore.Timestamp.fromDate(achScheduledFor),
            status: 'pending',
            emailData: {
              recipientEmail,
              recipientName: afterData.firstName,
              planName,
              monthlyAmount,
              portalUrl
            },
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          });
          
          console.log('📅 ACH setup email scheduled for 2 hours from now');
          
          // ─────────────────────────────────────────────────────────────────
          // Mark emails as sent to prevent duplicates
          // ─────────────────────────────────────────────────────────────────
          await event.data.after.ref.update({
            contractSignedEmailsSent: true,
            contractSignedEmailsSentAt: admin.firestore.FieldValue.serverTimestamp(),
            documentRequestSent: true,
            documentRequestSentAt: admin.firestore.FieldValue.serverTimestamp(),
            achRequestScheduled: true,
            achRequestScheduledFor: admin.firestore.Timestamp.fromDate(achScheduledFor)
          });
          
          // Log activity
          await db.collection('activityLogs').add({
            type: 'contract_signed_emails',
            contactId: contactId,
            action: 'onboarding_emails_sent',
            details: {
              documentRequestSent: true,
              achRequestScheduled: true,
              achScheduledFor: achScheduledFor.toISOString()
            },
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            createdBy: 'system'
          });
          
          console.log('✅ Contract signed email sequence initiated');
          
        } catch (emailError) {
          console.error('❌ Error sending contract signed emails:', emailError);
          
          // Create task for manual follow-up
          await db.collection('tasks').add({
            title: `Contract signed emails failed: ${afterData.firstName} ${afterData.lastName}`,
            description: `Automatic onboarding emails failed. Please send manually.\n\nEmail: ${afterData.email}\nError: ${emailError.message}`,
            contactId,
            type: 'email_failure',
            priority: 'high',
            status: 'pending',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            createdBy: 'system'
          });
        }
        
        return null;
      }
      
      // ═══════════════════════════════════════════════════════════════════════
      // SCENARIO 4: ACH JUST COMPLETED (Prospect → Client Conversion)
      // This is the final step - convert to client and send welcome!
      // ═══════════════════════════════════════════════════════════════════════
      const achJustCompleted = 
        (afterData.achAuthorized === true || afterData.workflowStage === 9) &&
        (beforeData.achAuthorized !== true && beforeData.workflowStage !== 9) &&
        !afterData.welcomeClientEmailSent;
      
      if (achJustCompleted) {
        console.log('💳 ACH COMPLETED - Converting to client and sending welcome...');
        console.log(`Contact: ${contactId} (${afterData.firstName} ${afterData.lastName})`);
        
        try {
          const user = gmailUser.value();
          const pass = gmailAppPassword.value();
          const fromName = gmailFromName.value() || 'Chris Lahage - Speedy Credit Repair';
          
          const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: { user, pass }
          });
          
          const recipientEmail = afterData.email || afterData.emails?.[0]?.address;
          const planName = afterData.selectedPlanName || afterData.selectedPlan || 'Credit Repair Service';
          
          if (!recipientEmail) {
            console.error('❌ No email address found for contact:', contactId);
            return null;
          }
          
          // ─────────────────────────────────────────────────────────────────
          // UPDATE CONTACT TO CLIENT STATUS
          // ─────────────────────────────────────────────────────────────────
          await event.data.after.ref.update({
            status: 'client',
            roles: admin.firestore.FieldValue.arrayUnion('client'),
            convertedToClientAt: admin.firestore.FieldValue.serverTimestamp(),
            welcomeClientEmailSent: true,
            welcomeClientEmailSentAt: admin.firestore.FieldValue.serverTimestamp()
          });
          
          console.log('✅ Contact converted to client status');
          
          // ─────────────────────────────────────────────────────────────────
          // SEND WELCOME CLIENT EMAIL
          // ─────────────────────────────────────────────────────────────────
          const welcomeEmailHtml = EMAIL_TEMPLATES.welcomeNewClient(
            { ...afterData, id: contactId },
            planName
          );
          
          await transporter.sendMail({
            from: `"${fromName}" <${user}>`,
            to: recipientEmail,
            subject: `🎉 Welcome to the Speedy family, ${afterData.firstName}! Let's get started`,
            html: welcomeEmailHtml
          });
          
          console.log('✅ Welcome client email sent');
          
          // ─────────────────────────────────────────────────────────────────
          // ALERT TEAM OF NEW CLIENT 🎉
          // ─────────────────────────────────────────────────────────────────
          await transporter.sendMail({
            from: `"SpeedyCRM Alerts" <${user}>`,
            to: user, // Send to Christopher
            subject: `🎉 NEW CLIENT: ${afterData.firstName} ${afterData.lastName} - ${planName}`,
            html: wrapEmailInHTML(
              'New Client Alert',
              `Great news! A new client has completed signup!\n\n` +
              `<strong>Name:</strong> ${afterData.firstName} ${afterData.lastName}\n` +
              `<strong>Email:</strong> ${recipientEmail}\n` +
              `<strong>Plan:</strong> ${planName}\n` +
              `<strong>Contact ID:</strong> ${contactId}\n\n` +
              `The client has been converted to client status and welcome email has been sent.\n\n` +
              `Time to start the credit repair process! 🚀`,
              'Chris'
            )
          });
          
          console.log('✅ Team notified of new client');
          
          // Log activity
          await db.collection('activityLogs').add({
            type: 'client_conversion',
            contactId: contactId,
            action: 'prospect_to_client',
            details: {
              planName,
              convertedAt: new Date().toISOString()
            },
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            createdBy: 'system'
          });
          
        } catch (emailError) {
          console.error('❌ Error in client conversion:', emailError);
          
          await db.collection('tasks').add({
            title: `Client conversion failed: ${afterData.firstName} ${afterData.lastName}`,
            description: `ACH completed but welcome email failed. Please review.\n\nEmail: ${afterData.email}\nError: ${emailError.message}`,
            contactId,
            type: 'conversion_failure',
            priority: 'critical',
            status: 'pending',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            createdBy: 'system'
          });
        }
        
        return null;
      }
      
      // ═══════════════════════════════════════════════════════════════════════
      // SCENARIO 5: OTHER UPDATES (no special handling)
      // ═══════════════════════════════════════════════════════════════════════
      
      // ─────────────────────────────────────────────────────────────────────
      // SPEED-TO-LEAD AUTO-ENGAGEMENT
      // When leadScore crosses ≥ 7 (hot lead from AI Receptionist, etc.),
      // auto-send email + SMS within 60 seconds with enrollment link.
      // This dramatically improves conversion — studies show contacting a
      // lead within 1 minute is 391% more effective than waiting 1 hour.
      // ─────────────────────────────────────────────────────────────────────
      const leadScoreJustCrossedThreshold =
        afterData.leadScore >= 7 &&
        (!beforeData.leadScore || beforeData.leadScore < 7) &&
        !afterData.speedToLeadSent;
      
      // Only fire for contacts who haven't already enrolled or become clients
      const isPreEnrollment =
        afterData.enrollmentStatus !== 'enrolled' &&
        afterData.enrollmentStatus !== 'completed' &&
        afterData.status !== 'client';
      
      if (leadScoreJustCrossedThreshold && isPreEnrollment) {
        console.log('🔥 SPEED-TO-LEAD: Hot lead detected! leadScore went from', 
          beforeData.leadScore || 0, '→', afterData.leadScore);
        console.log(`   Contact: ${contactId} (${afterData.firstName} ${afterData.lastName})`);
        console.log(`   Source: ${afterData.source || afterData.leadSource || 'unknown'}`);
        
        try {
          // ─── Generate enrollment token so the lead can jump straight in ───
          const crypto = require('crypto');
          const token = crypto.randomBytes(32).toString('hex');
          const expiresAt = new Date();
          expiresAt.setHours(expiresAt.getHours() + 48); // 48-hour expiry for hot leads
          
          await db.collection('enrollmentTokens').add({
            contactId,
            token,
            expiresAt,
            used: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            createdBy: 'speed_to_lead',
            source: afterData.source || afterData.leadSource || 'unknown'
          });
          
          const enrollLink = `https://myclevercrm.com/enroll?token=${token}&contactId=${contactId}`;
          console.log('🔐 Enrollment token generated for speed-to-lead');
          
          // ─── SEND HOT-LEAD EMAIL ───────────────────────────────────────
          const recipientEmail = afterData.email || afterData.emails?.[0]?.address;
          
          if (recipientEmail) {
            const user = gmailUser.value();
            const pass = gmailAppPassword.value();
            const fromName = gmailFromName.value() || 'Chris Lahage - Speedy Credit Repair';
            const replyTo = gmailReplyTo.value() || 'contact@speedycreditrepair.com';
            
            const transporter = nodemailer.createTransport({
              host: 'smtp.gmail.com',
              port: 587,
              secure: false,
              auth: { user, pass }
            });
            
            const firstName = afterData.firstName || 'there';
            
            const emailBody = 
              `Thanks for reaching out to Speedy Credit Repair! I'm Chris Lahage, the founder, and I'd love to personally help you improve your credit.\n\n` +
              `I've set aside a <strong>free 3-bureau credit analysis</strong> just for you — it includes all 3 scores from Experian, Equifax, and TransUnion with zero cost and zero hard inquiries.\n\n` +
              `<strong><a href="${enrollLink}" style="color:#090;font-size:16px;">👉 Start Your Free Credit Analysis Now</a></strong>\n\n` +
              `It only takes about 2 minutes, and we'll show you exactly which negative items are hurting your score and how we can help remove them.\n\n` +
              `If you'd prefer to chat first, just reply to this email or call me directly at <strong>1-888-724-7344</strong> — we're available 7 days a week.\n\n` +
              `Looking forward to helping you!`;
            
            await transporter.sendMail({
              from: `"${fromName}" <${user}>`,
              replyTo: replyTo,
              to: recipientEmail,
              subject: `${firstName}, your free credit analysis is ready!`,
              html: wrapEmailInHTML(
                `${firstName}, your free credit analysis is ready!`,
                emailBody,
                firstName
              )
            });
            
            console.log(`📧 Speed-to-lead email sent to ${recipientEmail}`);
          } else {
            console.log('⏭️ No email address — skipping email');
          }
          
          // ─── SEND HOT-LEAD SMS via Telnyx ──────────────────────────────
          const contactPhone = afterData.phone || afterData.phones?.[0]?.number;
          
          if (contactPhone && afterData.smsConsent === true && telnyxApiKey.value() && telnyxSmsPhone.value()) {
            try {
              const cleanPhone = contactPhone.replace(/\D/g, '');
              const formattedPhone = cleanPhone.length === 10
                ? `+1${cleanPhone}`
                : `+${cleanPhone}`;
              
              const smsText = `Hi ${afterData.firstName || 'there'}! It's Chris from Speedy Credit Repair. Thanks for reaching out! I've got your free 3-bureau credit analysis ready — get started here: ${enrollLink} Reply STOP to opt out.`;
              
              const smsResponse = await fetch('https://api.telnyx.com/v2/messages', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${telnyxApiKey.value()}`
                },
                body: JSON.stringify({
                  from: telnyxSmsPhone.value(),   // +17144755501
                  to: formattedPhone,
                  text: smsText
                })
              });
              
              if (smsResponse.ok) {
                console.log(`📱 Speed-to-lead SMS sent to ${formattedPhone}`);
              } else {
                const smsErrorBody = await smsResponse.text();
                console.warn(`⚠️ Speed-to-lead SMS failed (${smsResponse.status}): ${smsErrorBody}`);
              }
            } catch (smsErr) {
              console.warn('⚠️ Speed-to-lead SMS error:', smsErr.message);
            }
          } else {
            console.log('⏭️ No phone/consent/Telnyx config — skipping SMS');
          }
          
          // ─── CREATE HIGH-PRIORITY FOLLOW-UP TASK ───────────────────────
          await db.collection('tasks').add({
            title: `🔥 HOT LEAD: ${afterData.firstName} ${afterData.lastName} (Score: ${afterData.leadScore})`,
            description: 
              `Speed-to-lead engagement sent automatically.\n\n` +
              `Lead Score: ${afterData.leadScore}\n` +
              `Source: ${afterData.source || afterData.leadSource || 'unknown'}\n` +
              `Email: ${afterData.email || 'N/A'}\n` +
              `Phone: ${afterData.phone || 'N/A'}\n\n` +
              `Auto-sent: Email ${recipientEmail ? '✅' : '❌'} | SMS ${(afterData.phone && afterData.smsConsent) ? '✅' : '❌'}\n\n` +
              `Follow up with a personal call within 5 minutes for best conversion!`,
            contactId,
            type: 'hot_lead_followup',
            priority: 'critical',
            status: 'pending',
            dueDate: new Date(Date.now() + 5 * 60 * 1000), // Due in 5 minutes
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            createdBy: 'system:speed_to_lead'
          });
          
          // ─── ALERT CHRISTOPHER via email ────────────────────────────────
          if (recipientEmail) {
            const user = gmailUser.value();
            const fromName = gmailFromName.value() || 'SpeedyCRM Alerts';
            
            const transporter = nodemailer.createTransport({
              host: 'smtp.gmail.com',
              port: 587,
              secure: false,
              auth: { user, pass: gmailAppPassword.value() }
            });
            
            await transporter.sendMail({
              from: `"SpeedyCRM Alerts" <${user}>`,
              to: user,
              subject: `🔥 HOT LEAD (Score ${afterData.leadScore}): ${afterData.firstName} ${afterData.lastName}`,
              html: wrapEmailInHTML(
                'Hot Lead Alert — Speed-to-Lead Triggered',
                `A hot lead just came in and auto-engagement was sent!\n\n` +
                `<strong>Name:</strong> ${afterData.firstName} ${afterData.lastName}\n` +
                `<strong>Score:</strong> ${afterData.leadScore}/10\n` +
                `<strong>Source:</strong> ${afterData.source || afterData.leadSource || 'unknown'}\n` +
                `<strong>Email:</strong> ${afterData.email || 'N/A'}\n` +
                `<strong>Phone:</strong> ${afterData.phone || 'N/A'}\n\n` +
                `<strong>Auto-sent:</strong> Email ${recipientEmail ? '✅' : '❌'} | SMS ${(afterData.phone && afterData.smsConsent) ? '✅' : '❌'}\n\n` +
                `⏰ <strong>Call them within 5 minutes for the best chance of conversion!</strong>\n\n` +
                `<a href="https://myclevercrm.com/contacts/${contactId}" style="color:#090;">View Contact in CRM →</a>`,
                'Chris'
              )
            });
            
            console.log('📧 Hot lead alert sent to Christopher');
          }
          
          // ─── UPDATE CONTACT: Mark speed-to-lead as sent ────────────────
          await event.data.after.ref.update({
            speedToLeadSent: true,
            speedToLeadSentAt: admin.firestore.FieldValue.serverTimestamp(),
            speedToLeadChannel: {
              email: !!recipientEmail,
              sms: !!(afterData.phone && afterData.smsConsent === true)
            },
            speedToLeadEnrollToken: token,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          
          // ─── LOG ACTIVITY ──────────────────────────────────────────────
          await db.collection('activityLogs').add({
            type: 'speed_to_lead',
            contactId,
            action: 'hot_lead_auto_engagement',
            details: {
              leadScore: afterData.leadScore,
              previousScore: beforeData.leadScore || 0,
              source: afterData.source || afterData.leadSource || 'unknown',
              emailSent: !!recipientEmail,
              smsSent: !!(afterData.phone && afterData.smsConsent === true),
              enrollmentLink: enrollLink
            },
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            createdBy: 'system:speed_to_lead'
          });
          
          // ─── STAFF NOTIFICATION: Hot Lead Alert (in-app real-time) ─────────
          // This fires the bell chime + toast + browser push in ProtectedLayout
          // ───────────────────────────────────────────────────────────────────
          try {
            await db.collection('staffNotifications').add({
              type: 'hot_lead',
              priority: 'critical',
              title: `🔥 HOT LEAD: ${afterData.firstName} ${afterData.lastName} (Score ${afterData.leadScore})`,
              message: `Speed-to-lead auto-engagement sent! Source: ${afterData.source || afterData.leadSource || 'unknown'} • Email: ${recipientEmail ? '✅' : '❌'} • SMS: ${(afterData.phone && afterData.smsConsent) ? '✅' : '❌'} • Call within 5 min for best conversion!`,
              contactId: contactId,
              contactName: `${afterData.firstName} ${afterData.lastName}`,
              contactEmail: recipientEmail || null,
              contactPhone: afterData.phone || null,
              leadScore: afterData.leadScore,
              source: afterData.source || afterData.leadSource || 'unknown',
              targetRoles: ['masterAdmin', 'admin', 'manager', 'user'],
              readBy: {},
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
              createdBy: 'system:speed_to_lead',
              speedToLeadDetails: {
                emailSent: !!recipientEmail,
                smsSent: !!(afterData.phone && afterData.smsConsent === true),
                previousScore: beforeData.leadScore || 0,
                newScore: afterData.leadScore,
                enrollmentLink: enrollLink
              }
            });
            console.log('🔔 Hot lead staff notification created');
          } catch (notifErr) {
            console.warn('⚠️ Hot lead staff notification failed (non-fatal):', notifErr.message);
          }
          
          console.log('✅ Speed-to-lead engagement complete for', contactId);
          
        } catch (speedErr) {
          console.error('❌ Speed-to-lead error for', contactId, ':', speedErr.message);
          
          // Still create a task so Christopher knows about the hot lead
          await db.collection('tasks').add({
            title: `🔥 HOT LEAD (auto-engagement FAILED): ${afterData.firstName} ${afterData.lastName}`,
            description: `Speed-to-lead automation failed. Please contact manually ASAP!\n\nError: ${speedErr.message}\n\nEmail: ${afterData.email || 'N/A'}\nPhone: ${afterData.phone || 'N/A'}\nLead Score: ${afterData.leadScore}`,
            contactId,
            type: 'hot_lead_followup',
            priority: 'critical',
            status: 'pending',
            dueDate: new Date(Date.now() + 5 * 60 * 1000),
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            createdBy: 'system:speed_to_lead'
          });
        }
        
        return null;
      }
      
      console.log('📝 Contact updated (no special handling):', contactId);
      return null;
      
    } catch (error) {
      console.error('❌ onContactUpdated error:', error);
      
      // Log error to Firestore for debugging
      await db.collection('errorLogs').add({
        type: 'contact_lifecycle_trigger_error',
        contactId: contactId,
        error: error.message,
        stack: error.stack,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // Don't throw - we don't want to retry and cause duplicates
      return null;
    }
  }
);

console.log('✅ Function 4/11: onContactUpdated loaded (WITH ENROLLMENT + EMAIL AUTOMATION + AUTO LEAD ROLE + SPEED-TO-LEAD)');

// ============================================
// FUNCTION 4B: ON CONTACT CREATED (NEW!)
// ============================================
// Triggers when a NEW contact document is created
// Handles: Auto-assign lead role based on AI assessment of contact data
// This ensures NEW contacts get proper role assignment immediately
// © 1995-2026 Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved

exports.onContactCreated = onDocumentCreated(
  {
    document: 'contacts/{contactId}',
    ...defaultConfig,
    memory: '512MiB',
    timeoutSeconds: 120,  // Increased from 60 — now sends email + logs + updates
    secrets: [gmailUser, gmailAppPassword, gmailFromName, gmailReplyTo]  // Gmail secrets for welcome email
  },
  async (event) => {
    const contactId = event.params.contactId;
    const contactData = event.data?.data();
    
    if (!contactData) {
      console.log('⏭️ No contact data, skipping');
      return null;
    }
    
    console.log('👤 NEW Contact Created:', contactId);
    console.log('   Name:', contactData.firstName, contactData.lastName);
    
    const db = admin.firestore();
    
    try {
      // ═══════════════════════════════════════════════════════════════════════
      // AI ROLE ASSESSMENT - Determine if contact should be assigned "lead" role
      // ═══════════════════════════════════════════════════════════════════════
      
      // Check if contact already has lead role (shouldn't on create, but safety check)
      const currentRoles = contactData.roles || ['contact'];
      const needsLeadRole = !currentRoles.includes('lead');
      
      // Lead indicators - AI assessment criteria
      const hasLeadIndicators = 
        // Score-based
        (contactData.leadScore && contactData.leadScore >= 5) || 
        
        // Source-based (high-intent sources)
        contactData.source === 'ai_receptionist' ||
        contactData.source === 'landing_page' ||
        contactData.source === 'referral' ||
        contactData.source === 'website' ||
        contactData.source === 'form' ||
        contactData.source === 'walk_in' ||
        contactData.source === 'phone_call' ||
        contactData.leadSource === 'ai_receptionist' ||
        contactData.leadSource === 'landing_page' ||
        contactData.leadSource === 'referral' ||
        contactData.leadSource === 'website' ||
        
        // Contact info present (indicates real prospect)
        (contactData.emails && contactData.emails.length > 0 && contactData.emails[0]?.address) ||
        (contactData.phones && contactData.phones.length > 0 && contactData.phones[0]?.number) ||
        contactData.email ||
        contactData.phone ||
        
        // Has AI receptionist interaction
        (contactData.aiTracking?.aiReceptionistCalls?.length > 0) ||
        (contactData.aiTracking?.totalInteractions > 0);
      
      console.log('🤖 AI Role Assessment for new contact:', {
        contactId,
        name: `${contactData.firstName} ${contactData.lastName}`,
        needsLeadRole,
        hasLeadIndicators,
        indicators: {
          leadScore: contactData.leadScore,
          source: contactData.source || contactData.leadSource,
          hasEmail: !!(contactData.email || contactData.emails?.length > 0),
          hasPhone: !!(contactData.phone || contactData.phones?.length > 0),
          hasAIInteraction: !!(contactData.aiTracking?.totalInteractions > 0)
        }
      });
      
      if (needsLeadRole && hasLeadIndicators) {
        console.log('📝 AI Assessment: Assigning LEAD role to new contact:', contactId);
        
        // Update contact with lead role
        await db.collection('contacts').doc(contactId).update({
          roles: admin.firestore.FieldValue.arrayUnion('lead'),
          rolesUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
          rolesUpdatedBy: 'system:ai_role_assessment',
          aiRoleAssessment: {
            assessedAt: admin.firestore.FieldValue.serverTimestamp(),
            assignedRole: 'lead',
            reason: 'Met lead indicator criteria on contact creation',
            indicators: {
              leadScore: contactData.leadScore || 0,
              source: contactData.source || contactData.leadSource || 'manual',
              hasEmail: !!(contactData.email || contactData.emails?.length > 0),
              hasPhone: !!(contactData.phone || contactData.phones?.length > 0)
            }
          }
        });
        
        console.log('✅ LEAD role assigned successfully to:', contactId);
        
        // Log to timeline
        await db.collection('contacts').doc(contactId).update({
          timeline: admin.firestore.FieldValue.arrayUnion({
            id: Date.now(),
            type: 'role_assigned',
            description: 'AI automatically assigned LEAD role based on contact profile assessment',
            timestamp: new Date().toISOString(),
            metadata: {
              role: 'lead',
              assessedBy: 'ai_role_assessment'
            },
            source: 'system'
          })
        });
        
      } else {
        console.log('ℹ️ AI Assessment: Contact does not meet lead criteria, keeping as contact only');
        console.log('   Reason: needsLeadRole=', needsLeadRole, ', hasLeadIndicators=', hasLeadIndicators);
      }
      
      // ═══════════════════════════════════════════════════════════════════════
      // WELCOME EMAIL WITH ENROLLMENT LINK — Sends to ALL new contacts
      // ═══════════════════════════════════════════════════════════════════════
      // This is the #1 conversion driver: every new contact gets an immediate
      // branded email with a direct link to start their free credit analysis.
      // Template is chosen based on how the contact entered the system.
      // ═══════════════════════════════════════════════════════════════════════
      
      let leadWelcomeEmailSent = false;
      
      try {
        // ===== CHECK: Does the contact have an email address? =====
        const contactEmail = contactData.email || 
          (contactData.emails && contactData.emails.length > 0 ? contactData.emails[0].address : null);
        
        if (!contactEmail) {
          console.log('📧 No email address found for contact — skipping welcome email');
          console.log('   Contact will need manual outreach (phone/SMS)');
          
          // ===== LOG: No-email contacts still get tracked =====
          await db.collection('contacts').doc(contactId).update({
            leadWelcomeEmailSent: false,
            leadWelcomeEmailSkipReason: 'no_email_address',
            leadWelcomeEmailCheckedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          
        } else {
          // ===== CHECK: Don't send if already enrolled or enrolling =====
          const enrollmentStatus = contactData.enrollmentStatus || 'not_started';
          if (enrollmentStatus === 'enrolled' || enrollmentStatus === 'completed' || enrollmentStatus === 'started') {
            console.log(`📧 Skipping welcome email — contact already has enrollmentStatus: ${enrollmentStatus}`);
            
          } else {
            // ===== DETERMINE: Which email template to use based on source =====
            const contactSource = (contactData.source || contactData.leadSource || 'manual').toLowerCase();
            
            // AI phone calls get the "thanks for calling" template
            // Everything else gets the warm welcome template
            const templateId = (contactSource === 'ai_receptionist' || contactSource === 'ai_phone' || contactSource === 'phone_call')
              ? 'ai-welcome-immediate'
              : 'web-welcome-immediate';
            
            console.log(`📧 Sending welcome email to ${contactEmail}`);
            console.log(`   Template: ${templateId}`);
            console.log(`   Source: ${contactSource}`);
            
            // ===== BUILD: Template data with contact info =====
            const templateData = {
              firstName: contactData.firstName || 'there',
              lastName: contactData.lastName || '',
              name: `${contactData.firstName || ''} ${contactData.lastName || ''}`.trim() || 'there',
              email: contactEmail,
              phone: contactData.phone || (contactData.phones && contactData.phones[0]?.number) || '',
              contactId: contactId,
              leadScore: contactData.leadScore || 5,
              sentiment: contactData.aiTracking?.sentiment || { description: 'neutral' },
              source: contactSource
            };
            
            // ===== RENDER: Get subject + HTML from emailTemplates.js =====
            const { getEmailTemplate } = require('./emailTemplates');
            const emailContent = getEmailTemplate(templateId, templateData);
            
            // ===== SEND: Via Gmail SMTP =====
            const user = gmailUser.value();
            const pass = gmailAppPassword.value();
            const fromName = gmailFromName.value() || 'Chris Lahage - Speedy Credit Repair';
            const replyTo = gmailReplyTo.value() || 'contact@speedycreditrepair.com';
            
            const transporter = nodemailer.createTransport({
              host: 'smtp.gmail.com',
              port: 587,
              secure: false,
              auth: { user, pass }
            });
            
            const mailResult = await transporter.sendMail({
              from: `"${fromName}" <${user}>`,
              replyTo: replyTo,
              to: contactEmail,
              subject: emailContent.subject,
              html: emailContent.html
            });
            
            console.log(`✅ Welcome email SENT to ${contactEmail} — MessageId: ${mailResult.messageId}`);
            leadWelcomeEmailSent = true;
            
            // ===== LOG: Record in emailLog collection for analytics =====
            await db.collection('emailLog').add({
              contactId: contactId,
              recipientEmail: contactEmail,
              recipientName: templateData.name,
              templateId: templateId,
              subject: emailContent.subject,
              type: 'welcome_email',
              source: contactSource,
              sentAt: admin.firestore.FieldValue.serverTimestamp(),
              messageId: mailResult.messageId,
              status: 'sent',
              metadata: emailContent.metadata || {},
              // ===== Tracking fields (for future open/click tracking) =====
              opened: false,
              openedAt: null,
              clicked: false,
              clickedAt: null,
              converted: false,
              convertedAt: null
            });
            
            // ===== UPDATE: Mark contact so we don't send duplicates =====
            await db.collection('contacts').doc(contactId).update({
              leadWelcomeEmailSent: true,
              leadWelcomeEmailSentAt: admin.firestore.FieldValue.serverTimestamp(),
              leadWelcomeEmailTemplate: templateId,
              // ===== Add to contact timeline =====
              timeline: admin.firestore.FieldValue.arrayUnion({
                id: Date.now() + 1,  // +1 to avoid collision with role assignment timeline entry
                type: 'email_sent',
                description: `Welcome email sent with enrollment link (template: ${templateId})`,
                timestamp: new Date().toISOString(),
                metadata: {
                  templateId: templateId,
                  recipientEmail: contactEmail,
                  messageId: mailResult.messageId,
                  source: contactSource
                },
                source: 'system'
              })
            });
            
            console.log(`✅ Contact ${contactId} marked as leadWelcomeEmailSent: true`);
          }
        }
        
      } catch (emailError) {
        // ===== SAFETY: Email failure should NEVER crash contact creation =====
        console.error('⚠️ Welcome email failed (non-fatal):', emailError.message);
        console.error('   Stack:', emailError.stack);
        
        // Still mark the attempt so we can retry or investigate
        try {
          await db.collection('contacts').doc(contactId).update({
            leadWelcomeEmailSent: false,
            leadWelcomeEmailError: emailError.message,
            leadWelcomeEmailAttemptedAt: admin.firestore.FieldValue.serverTimestamp()
          });
        } catch (updateError) {
          console.error('⚠️ Failed to log email error on contact:', updateError.message);
        }
      }
      
      // ═══════════════════════════════════════════════════════════════════════
      // STAFF NOTIFICATION — Real-time in-app alert for CRM dashboard
      // ═══════════════════════════════════════════════════════════════════════
      // Writes to staffNotifications collection which ProtectedLayout.jsx
      // listens to via onSnapshot. Staff see bell badge + toast + sound.
      // ═══════════════════════════════════════════════════════════════════════
      try {
        const contactName = `${contactData.firstName || ''} ${contactData.lastName || ''}`.trim() || 'Unknown';
        const contactSource = (contactData.source || contactData.leadSource || 'manual').toLowerCase();
        const staffNotifEmail = contactData.email || 
          (contactData.emails && contactData.emails.length > 0 ? contactData.emails[0].address : null);
        const score = contactData.leadScore || 0;
        
        const isHotLead = score >= 7;
        const notifPriority = isHotLead ? 'critical' : (score >= 5 ? 'high' : 'medium');
        const notifType = isHotLead ? 'hot_lead' : 'new_contact';
        
        let notifMessage = `New contact from ${contactSource}`;
        if (staffNotifEmail) notifMessage += ` • ${staffNotifEmail}`;
        if (contactData.phone) notifMessage += ` • ${contactData.phone}`;
        if (score > 0) notifMessage += ` • Score: ${score}/10`;
        if (leadWelcomeEmailSent) notifMessage += ' • Welcome email sent ✅';
        
        await db.collection('staffNotifications').add({
          type: notifType,
          priority: notifPriority,
          title: isHotLead
            ? `🔥 HOT LEAD: ${contactName} (Score ${score})`
            : `👤 New Contact: ${contactName}`,
          message: notifMessage,
          contactId: contactId,
          contactName: contactName,
          contactEmail: staffNotifEmail || null,
          contactPhone: contactData.phone || null,
          leadScore: score,
          source: contactSource,
          targetRoles: ['masterAdmin', 'admin', 'manager', 'user'],
          readBy: {},
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          createdBy: 'system:onContactCreated',
          welcomeEmailSent: leadWelcomeEmailSent,
          roleAssigned: (needsLeadRole && hasLeadIndicators) ? 'lead' : null
        });
        
        console.log(`🔔 Staff notification created for new contact: ${contactName} (${notifType})`);
      } catch (notifError) {
        console.error('⚠️ Staff notification failed (non-fatal):', notifError.message);
      }
      
      return { 
        success: true, 
        contactId, 
        roleAssigned: needsLeadRole && hasLeadIndicators ? 'lead' : null,
        welcomeEmailSent: leadWelcomeEmailSent
      };
      
    } catch (error) {
      console.error('❌ Error in onContactCreated AI role assessment:', error);
      return { success: false, error: error.message };
    }
  }
);

console.log('✅ Function 4B/11: onContactCreated loaded (AI ROLE ASSESSMENT + WELCOME EMAIL WITH ENROLLMENT LINK)');

// ============================================
// FUNCTION 5: IDIQ SERVICE (PRODUCTION)
// ============================================
// Handles: ALL IDIQ operations via Partner Integration Framework
// PRODUCTION URL: https://api.identityiq.com/pif-service/
// Partner ID: 11981 (Speedy Credit Repair Inc.)
// © 1995-2025 Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved

exports.idiqService = onCall(
  {
    ...defaultConfig,
    memory: '512MiB',
    timeoutSeconds: 120,
    // EXPLICITLY BIND IDIQ SECRETS HERE
    secrets: [
      idiqPartnerId, 
      idiqPartnerSecret, 
      idiqEnvironment, 
      idiqPlanCode, 
      idiqOfferCode
    ]
  },
  async (request) => {
    // ROBUST PARAM GUARD: Extracts data regardless of frontend nesting
    const rawData = request.data || {};
    const action = rawData.action;
    
    // Check all possible locations for params to prevent "undefined" errors
    const params = rawData.params || rawData.memberData || rawData;
    const memberData = params.memberData || params;
    
    console.log('💳 IDIQ Service (PRODUCTION):', action);
    const db = admin.firestore();
    
    // PRODUCTION ONLY - Per IDIQ Partner Integration Framework docs
    const IDIQ_BASE_URL = 'https://api.identityiq.com/pif-service/';
    
    // Helper: Get Partner Token
    const getPartnerToken = async () => {
      const partnerIdValue = idiqPartnerId.value();
      const partnerSecretValue = idiqPartnerSecret.value();
      
      console.log('🔑 DEBUG: Partner ID:', partnerIdValue);
      console.log('🔑 DEBUG: Partner Secret length:', partnerSecretValue?.length);
      
      const requestBody = {
        partnerId: partnerIdValue,
        partnerSecret: partnerSecretValue
      };
      
      const response = await fetch(`${IDIQ_BASE_URL}v1/partner-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      const responseText = await response.text();
      if (!response.ok) throw new Error(`Partner auth failed: ${response.status} - ${responseText}`);
      
      const resData = JSON.parse(responseText);
      return resData.accessToken;
    };
    
    // Helper: Get Member Token (Enhanced to handle 404/legacy accounts)
    const getMemberToken = async (email, partnerToken) => {
      if (!email) {
        console.error('❌ Member token requested but email is undefined');
        throw new Error('Member Email is required but was undefined');
      }
      console.log(`🔑 Fetching Member Token for: ${email}`);
      try {
        const response = await fetch(`${IDIQ_BASE_URL}v1/member-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${partnerToken}`
          },
          body: JSON.stringify({ memberEmail: email.trim() })
        });

        if (response.status === 404) {
          console.log('⚠️ Member token not found (404). Proceeding to force re-enrollment.');
          return null; 
        }

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Member token failed: ${response.status} - ${errorText}`);
        }

        const resData = await response.json();
        return resData.accessToken || resData.memberToken;
      } catch (error) {
        console.error('❌ getMemberToken error:', error.message);
        throw error;
      }
    };

    // Helper: Format date to MM/DD/YYYY per IDIQ spec
    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const year = d.getFullYear();
      return `${month}/${day}/${year}`;
    };
    
    try {
      switch (action) {
        case 'enroll': {
          const { firstName, lastName, email, ssn, dob, address, city, state, zip, middleInitial, contactId } = memberData;
          const partnerToken = await getPartnerToken();
          
          const payload = {
            birthDate: formatDate(dob),
            email: email.trim().toLowerCase(),
            firstName: firstName.trim().substring(0, 15),
            lastName: lastName.trim().substring(0, 15),
            middleNameInitial: middleInitial?.substring(0, 1) || '',
            ssn: ssn.replace(/\D/g, ''),
            offerCode: idiqOfferCode.value() || '4312869N',
            planCode: idiqPlanCode.value() || 'PLAN03B',
            street: address.trim().substring(0, 50),
            city: city.trim().substring(0, 30),
            state: state.toUpperCase().substring(0, 2),
            zip: zip.toString().replace(/\D/g, '').substring(0, 5)
          };
          
          const enrollResponse = await fetch(`${IDIQ_BASE_URL}v1/enrollment/enroll`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': `Bearer ${partnerToken}`
            },
            body: JSON.stringify(payload)
          });
          
          if (!enrollResponse.ok) {
            const err = await enrollResponse.json().catch(() => ({}));
            throw new Error(err.message || `Enrollment failed: ${enrollResponse.status}`);
          }
          
          const enrollData = await enrollResponse.json();
          let memberToken = null;
          try { memberToken = await getMemberToken(email, partnerToken); } catch (e) {
            console.warn('⚠️ Token retrieval post-enrollment delayed or needs verification');
          }
          
          const enrollDoc = await db.collection('idiqEnrollments').add({
            email: email.toLowerCase(), firstName, lastName, memberToken,
            status: memberToken ? 'active' : 'pending_verification',
            enrolledAt: admin.firestore.FieldValue.serverTimestamp(),
            enrolledBy: request.auth?.uid || 'system', contactId: contactId || null
          });
          
          if (contactId) {
            await db.collection('contacts').doc(contactId).update({
              'idiq.enrolled': true, 'idiq.enrollmentId': enrollDoc.id,
              'idiq.memberToken': memberToken, 'idiq.email': email.toLowerCase(),
              'idiq.enrolledAt': admin.firestore.FieldValue.serverTimestamp()
            });
          }
          
          console.log('✅ IDIQ enrollment successful:', enrollDoc.id);
          return { success: true, enrollmentId: enrollDoc.id, memberToken, needsVerification: !memberToken };
        }
        
        case 'checkStatus': {
          const { email, membershipNumber } = params;
          const partnerToken = await getPartnerToken();
          const qp = email ? `email=${encodeURIComponent(email)}` : `membership-number=${membershipNumber}`;
          
          const response = await fetch(`${IDIQ_BASE_URL}v1/enrollment/member-status?${qp}`, {
            headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${partnerToken}` }
          });
          
          if (response.status === 404) return { success: true, found: false };
          if (!response.ok) throw new Error(`Status check failed: ${response.status}`);
          
          const data = await response.json();
          console.log('📊 Member status:', data.currentStatus);
          return { success: true, found: true, data };
        }
        
        case 'getReport': {
          const { email } = params;
          const partnerToken = await getPartnerToken();
          const memberToken = await getMemberToken(email, partnerToken);
          
          const response = await fetch(`${IDIQ_BASE_URL}v1/credit-report`, {
            headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${memberToken}` }
          });
          if (!response.ok) throw new Error(`Report failed: ${response.status}`);
          
          const report = await response.json();
          console.log('📋 Credit report retrieved');
          return { success: true, report };
        }
        
       // ===== SMART PULLREPORT: CHECK STATUS -> ENROLL IF NEEDED -> VERIFY -> GET REPORT =====
        case 'pullReport': {
          const { firstName, lastName, email, ssn, dateOfBirth, address, middleName, contactId, phone } = params.memberData || params;
          
          console.log('🎯 pullReport: Starting smart enrollment/retrieval flow...');
          console.log('📧 Email:', email);
          
          try {
            const partnerToken = await getPartnerToken();
            let membershipNumber = null;
            let enrollmentId = null;

            // STEP 1: Try to get member token for existing member
            console.log('🔑 Checking for existing member token...');
            let memberToken = await getMemberToken(email, partnerToken);
            
            // ===== CRITICAL FIX: If token exists, verify it's still valid =====
            if (memberToken) {
              console.log('✅ Found existing member token, verifying it works...');
              
              // Try to use the token to get verification questions
              const testResponse = await fetch(`${IDIQ_BASE_URL}v1/enrollment/verification-questions`, {
                method: 'GET',
                headers: { 
                  'Authorization': `Bearer ${memberToken}`, 
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                }
              });
              
              const testStatus = testResponse.status;
              console.log(`📋 Token validation response: ${testStatus}`);
              
              // If token is invalid (401/403), force re-enrollment
              if (testStatus === 401 || testStatus === 403) {
                console.log('⚠️ Member token is invalid/expired - forcing re-enrollment');
                memberToken = null; // Clear it so we re-enroll below
              } else if (testStatus === 404) {
                console.log('⚠️ Member not found with this token - forcing re-enrollment');
                memberToken = null; // Clear it so we re-enroll below
              } else if (testStatus === 200) {
                console.log('✅ Member token is valid (or member already verified)');
                // Token is good, continue with existing flow
              } else {
                console.log(`⚠️ Unexpected status ${testStatus} - will retry with enrollment`);
                memberToken = null;
              }
            } else {
              console.log('ℹ️ No existing member token found');
            }

            // STEP 2: IF TOKEN IS MISSING OR INVALID, FORCE ENROLLMENT
            if (!memberToken) {
              console.log('🚀 NO VALID TOKEN: Forcing fresh enrollment...');
              
              // Force lowercase email for consistency with IDIQ
              const emailLower = email.trim().toLowerCase();
              
              const enrollPayload = {
                birthDate: formatDate(dateOfBirth),
                email: emailLower,
                firstName: firstName.trim().substring(0, 15),
                lastName: lastName.trim().substring(0, 15),
                middleNameInitial: middleName?.substring(0, 1) || '',
                ssn: ssn.replace(/\D/g, ''),
                offerCode: idiqOfferCode.value() || '4312869N',
                planCode: idiqPlanCode.value() || 'PLAN03B',
                street: address?.street?.trim().substring(0, 50) || address?.trim().substring(0, 50) || '',
                city: address?.city?.trim().substring(0, 30) || city?.trim().substring(0, 30) || '',
                state: address?.state?.toUpperCase().substring(0, 2) || state?.toUpperCase().substring(0, 2) || '',
                zip: address?.zip?.toString().replace(/\D/g, '').substring(0, 5) || zip?.toString().replace(/\D/g, '').substring(0, 5) || '',
                primaryPhone: phone?.replace(/\D/g, '').substring(0, 10) || ''
              };

              console.log('📤 Enrollment payload email:', enrollPayload.email);
              console.log('📞 Enrollment payload phone:', enrollPayload.primaryPhone);

              const enrollResponse = await fetch(`${IDIQ_BASE_URL}v1/enrollment/enroll`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${partnerToken}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(enrollPayload)
              });

              const enrollResData = await enrollResponse.json();
              console.log('📥 Enrollment response:', JSON.stringify(enrollResData).substring(0, 300));
              
              if (enrollResponse.ok) {
                membershipNumber = enrollResData.membershipNumber || enrollResData.membershipNo;
                console.log('✅ IDIQ Enrollment successful! Membership:', membershipNumber);
                
                // Log new enrollment to Firestore
                const enrollmentRef = await db.collection('idiqEnrollments').add({
                  contactId: contactId || null,
                  email: emailLower,
                  firstName: firstName,
                  lastName: lastName,
                  membershipNumber: membershipNumber,
                  enrollmentStep: 'enrolled',
                  verificationStatus: 'pending',
                  verificationAttempts: 0,
                  maxAttempts: 3,
                  enrolledAt: admin.firestore.FieldValue.serverTimestamp()
                });
                enrollmentId = enrollmentRef.id;
                console.log('✅ Enrollment saved to Firestore:', enrollmentId);
                
                // ===== CRITICAL FIX: Wait for IDIQ to propagate enrollment =====
                console.log('⏳ Waiting 5 seconds for IDIQ to propagate new enrollment...');
                await new Promise(resolve => setTimeout(resolve, 5000));
                
              } else {
                // ===== ENHANCED: Check for "already exists" error in multiple places =====
                const errorMessage = enrollResData.message || '';
                const errorArray = enrollResData.errors || [];
                const errorString = JSON.stringify(enrollResData).toLowerCase();
                
                const alreadyExists = 
                  errorMessage.toLowerCase().includes('already exists') ||
                  errorArray.some(e => typeof e === 'string' && e.toLowerCase().includes('already exists')) ||
                  errorString.includes('already exists') ||
                  errorString.includes('email already exists');
                
                if (alreadyExists) {
                  // Member already exists - that's fine, continue to get token
                  console.log('ℹ️ Member already exists in IDIQ (email previously enrolled)');
                  console.log('✅ Continuing with existing membership...');
                  
                  // Don't create a new enrollment record since member exists
                  // Just continue to token retrieval below
                } else {
                  // Some other enrollment error
                  console.error('❌ Enrollment failed:', enrollResData);
                  throw new Error(`IDIQ Enrollment failed: ${enrollResData.message || JSON.stringify(enrollResData)}`);
                }
              }
              
              // ===== CRITICAL FIX: Retry logic for member token =====
              const emailForToken = email.trim().toLowerCase();
              let retryCount = 0;
              const maxRetries = 3;
              
              while (!memberToken && retryCount < maxRetries) {
                console.log(`🔄 Attempting to get member token for ${emailForToken} (attempt ${retryCount + 1}/${maxRetries})...`);
                memberToken = await getMemberToken(emailForToken, partnerToken);
                
                if (!memberToken && retryCount < maxRetries - 1) {
                  console.log(`⏳ Member token not ready, waiting 3 seconds before retry...`);
                  await new Promise(resolve => setTimeout(resolve, 3000));
                }
                retryCount++;
              }
            }

            // ===== FINAL CHECK: If still no token, use widget fallback =====
            if (!memberToken) {
              console.log('⚠️ Could not get member token after retries - using widget fallback');
              
              // Store enrollment info for widget use
              if (enrollmentId) {
                try {
                  await db.collection('idiqEnrollments').doc(enrollmentId).update({
                    enrollmentStep: 'widget_fallback',
                    widgetFallbackReason: 'Member token unavailable after retries',
                    lastActivity: admin.firestore.FieldValue.serverTimestamp()
                  });
                } catch (saveErr) {
                  console.warn('⚠️ Could not update enrollment status:', saveErr.message);
                }
              }
              
              // Return with widget mode so frontend can use IDIQ's MicroFrontend
              return {
                success: true,
                useWidget: true,
                memberToken: null,
                enrollmentId: enrollmentId || 'enrollment_pending',
                email: email.toLowerCase(),
                membershipNumber: membershipNumber || null,
                verificationRequired: false,
                questions: [],
                verificationQuestions: [],
                data: {
                  vantageScore: null,
                  useWidget: true,
                  message: 'Member token unavailable. Please use the credit report viewer widget.'
                },
                message: 'Enrollment may still be processing. The credit report viewer will handle verification.',
                widgetUrl: 'https://idiq-prod-web-api.web.app/idiq-credit-report/index.js',
                tip: 'If verification questions appear in the widget, please answer them to complete setup.'
              };
            }
            
            console.log('✅ Member token obtained successfully!');

            // =====================================================================
            // STEP 3: Check for Identity Verification Questions
            // =====================================================================
            console.log('📊 Checking for identity verification questions...');
            
            // Add delay after fresh enrollment to ensure IDIQ backend is ready
            if (enrollmentId && enrollmentId !== 'existing_active_member') {
              console.log('⏳ Waiting 2 seconds for IDIQ to prepare verification questions...');
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
            
            const questionsResponse = await fetch(`${IDIQ_BASE_URL}v1/enrollment/verification-questions`, {
              method: 'GET',
              headers: { 
                'Authorization': `Bearer ${memberToken}`, 
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              }
            });
            
            const questionsStatus = questionsResponse.status;
            console.log('📋 Verification questions API status:', questionsStatus);

            if (questionsResponse.ok) {
              const questionsData = await questionsResponse.json();
              
              // DEBUG: Log raw response (first 500 chars)
              console.log('📋 Raw verification questions response:', JSON.stringify(questionsData).substring(0, 500));
              
              // Handle various response formats from IDIQ
              const questionsList = 
                questionsData.questions || 
                questionsData.Questions ||
                (questionsData.isSuccess !== false && questionsData.data?.questions) ||
                (Array.isArray(questionsData) ? questionsData : []);
              
              if (questionsList && questionsList.length > 0) {
                console.log(`🔐 Verification required: Found ${questionsList.length} questions`);
                
                // Store questions in Firestore for resume capability
                if (enrollmentId && enrollmentId !== 'existing_active_member') {
                  try {
                    await db.collection('idiqEnrollments').doc(enrollmentId).update({
                      enrollmentStep: 'verification_pending',
                      verificationQuestions: questionsList,
                      questionsReceivedAt: admin.firestore.FieldValue.serverTimestamp()
                    });
                    console.log('✅ Verification questions saved to Firestore');
                  } catch (saveErr) {
                    console.warn('⚠️ Could not save questions to Firestore:', saveErr.message);
                  }
                }
                
                return {
                  success: true,
                  verificationRequired: true,
                  enrollmentId: enrollmentId || 'existing_active_member',
                  email: email,
                  membershipNumber: membershipNumber || 'existing',
                  // Multiple keys for frontend compatibility
                  questions: questionsList,
                  verificationQuestions: questionsList,
                  questionsData: { questions: questionsList },
                  data: {
                    questions: questionsList,
                    verificationQuestions: questionsList,
                    vantageScore: null
                  },
                  message: 'Please answer security questions to verify your identity',
                  tip: 'These questions come from your credit file. Answer based on your history.'
                };
              } else {
                console.log('✅ No verification questions returned (user may already be verified)');
              }
            } else {
              // Log non-200 responses for debugging
              const errorBody = await questionsResponse.text();
              console.log(`⚠️ Verification questions API returned ${questionsStatus}:`, errorBody.substring(0, 300));
              
              if (questionsStatus === 422) {
                // Parse the error to check for "No Questions Retrieved"
                let errorData = {};
                try {
                  errorData = JSON.parse(errorBody);
                } catch (e) {
                  errorData = { errors: [errorBody] };
                }
                
                const noQuestionsError = errorData.errors?.some(e => 
                  typeof e === 'string' && (
                    e.toLowerCase().includes('no questions') || 
                    e.toLowerCase().includes('not retrieved')
                  )
                );
                
                if (noQuestionsError) {
                  console.log('⚠️ IDIQ returned "No Questions Retrieved" - trying to pull report directly');
                  
                  // Try to pull credit report - member might already be verified
                  try {
                    console.log('📊 Attempting direct credit report pull...');
                    const reportResponse = await fetch(`${IDIQ_BASE_URL}v1/credit-report`, {
                      method: 'GET',
                      headers: {
                        'Authorization': `Bearer ${memberToken}`,
                        'Accept': 'application/json'
                      }
                    });
                    
                    console.log('📋 Credit report response status:', reportResponse.status);
                    
                    if (reportResponse.ok) {
                      const reportData = await reportResponse.json();
                      console.log('✅ Credit report retrieved successfully!');
                      console.log('📋 Report keys:', Object.keys(reportData));
                      console.log('📋 BundleComponent keys:', Object.keys(reportData.BundleComponents?.BundleComponent || {}));
                      console.log('📋 Score found:', reportData.BundleComponents?.BundleComponent?.CreditScoreType?.['@riskScore']);
                      
                      // Log to find tradelines location
                      const bc = reportData.BundleComponents?.BundleComponent;
                      if (bc) {
                      console.log('📋 Looking for tradelines in:', Object.keys(bc).filter(k => k.toLowerCase().includes('trade') || k.toLowerCase().includes('account') || k.toLowerCase().includes('credit')));
                      console.log('📋 TrueLinkCreditReportType keys:', Object.keys(bc?.TrueLinkCreditReportType || {}));
                      }
                      
                      // ===== IMPROVED SCORE EXTRACTION (handles thin files like Roman's 793) =====
                      // Note: bc was already declared above at line 1277
                      const trueLinkData = bc?.TrueLinkCreditReportType;
                      
                      let score = null;
                      let scoreSource = 'not_found';
                      
                      // Path 1: CreditScoreType @riskScore (most common)
                      if (bc?.CreditScoreType?.['@riskScore']) {
                        score = parseInt(bc.CreditScoreType['@riskScore'], 10);
                        scoreSource = 'CreditScoreType.@riskScore';
                      }
                      // Path 2: Direct vantageScore
                      else if (reportData.vantageScore) {
                        score = reportData.vantageScore;
                        scoreSource = 'vantageScore';
                      }
                      // Path 3: Borrower.CreditScore array (thin files like Roman)
                      else if (trueLinkData?.Borrower?.CreditScore) {
                        const borrowerScores = Array.isArray(trueLinkData.Borrower.CreditScore) 
                          ? trueLinkData.Borrower.CreditScore 
                          : [trueLinkData.Borrower.CreditScore];
                        for (const scoreObj of borrowerScores) {
                          const s = parseInt(scoreObj?.['@riskScore'] || scoreObj?.riskScore, 10);
                          if (s >= 300 && s <= 850) {
                            score = s;
                            scoreSource = 'Borrower.CreditScore';
                            break;
                          }
                        }
                      }
                      // Path 4: CreditScore at TrueLink level
                      else if (trueLinkData?.CreditScore) {
                        const tlScores = Array.isArray(trueLinkData.CreditScore) 
                          ? trueLinkData.CreditScore 
                          : [trueLinkData.CreditScore];
                        for (const scoreObj of tlScores) {
                          const s = parseInt(scoreObj?.['@riskScore'] || scoreObj?.riskScore, 10);
                          if (s >= 300 && s <= 850) {
                            score = s;
                            scoreSource = 'TrueLink.CreditScore';
                            break;
                          }
                        }
                      }
                      // Path 5: Legacy paths
                      else {
                        score = reportData.score || 
                                reportData.CreditScore?.score ||
                                reportData.Borrower?.CreditScore?.[0]?.['@value'] ||
                                null;
                        if (score) scoreSource = 'legacy';
                      }
                      
                      console.log(`📊 Credit score extracted: ${score} (source: ${scoreSource})`);
                      if (!score) {
                        console.log('⚠️ No score found! TrueLinkCreditReportType keys:', Object.keys(trueLinkData || {}));
                        if (trueLinkData?.Borrower) {
                          console.log('📋 Borrower keys:', Object.keys(trueLinkData.Borrower));
                        }
                      }
                      
                      // ===== GET TRUELINK CREDIT REPORT (contains all tradelines) =====
                      const trueLinkReport = bc?.TrueLinkCreditReportType;
                      console.log('📋 TrueLinkCreditReportType keys:', Object.keys(trueLinkReport || {}));
                      
                      // ===== DIAGNOSTIC: Log ALL possible tradeline locations =====
                      console.log('🔍 DIAGNOSTIC - Searching for all tradeline locations...');
                      console.log('🔍 Borrower keys:', Object.keys(trueLinkReport?.Borrower || {}));
                      console.log('🔍 Summary keys:', Object.keys(trueLinkReport?.Summary || {}));
                      
                      // Check if there are bureau-specific sections
                      const borrower = trueLinkReport?.Borrower;
                      if (borrower?.BorrowerBureau) {
                        console.log('🔍 BorrowerBureau found!', Object.keys(borrower.BorrowerBureau));
                      }
                      if (borrower?.CreditFile) {
                        console.log('🔍 CreditFile found!', Object.keys(borrower.CreditFile));
                      }
                      
                      // Check Sources for bureau info
                      const sources = trueLinkReport?.Sources;
                      if (sources?.Source) {
                        const sourceArray = Array.isArray(sources.Source) ? sources.Source : [sources.Source];
                        console.log('🔍 Sources count:', sourceArray.length);
                        sourceArray.slice(0, 5).forEach((src, i) => {
                          console.log(`🔍 Source ${i}:`, src?.Bureau, src?.['@bureauCode']);
                        });
                      }
                      
                      // ===== BUREAU SYMBOL MAPPING =====
                      const BUREAU_MAP = {
                        'TUC': 'TransUnion',
                        'EXP': 'Experian', 
                        'EQF': 'Equifax',
                        'TU': 'TransUnion',
                        'EX': 'Experian',
                        'EQ': 'Equifax',
                        'XPN': 'Experian',
                        'TRU': 'TransUnion',
                        'EFX': 'Equifax',
                        'TransUnion': 'TransUnion',
                        'Experian': 'Experian',
                        'Equifax': 'Equifax'
                      };
                      // ===== ACCOUNT STATUS CODE MAPPING =====
                      const ACCOUNT_STATUS_MAP = {
                        'O': 'Open',
                        'C': 'Closed',
                        'F': 'Frozen',
                        'P': 'Paid',
                        'T': 'Transferred',
                        'R': 'Refinanced',
                        'D': 'Delinquent',
                        'ChargedOff': 'Charged Off',
                        'Collection': 'Collection',
                        'Bankruptcy': 'Bankruptcy',
                        'Foreclosure': 'Foreclosure',
                        'Repossession': 'Repossession',
                        'Current': 'Current',
                        'Open': 'Open',
                        'Closed': 'Closed',
                        'Paid': 'Paid'
                      };
                      
                      const PAYMENT_STATUS_MAP = {
                        'C': 'Current',
                        'CUR': 'Current',
                        'Current': 'Current',
                        'AsAgreed': 'As Agreed',
                        '30': '30 Days Late',
                        '60': '60 Days Late',
                        '90': '90 Days Late',
                        '120': '120 Days Late',
                        '150': '150+ Days Late',
                        'CO': 'Charged Off',
                        'ChargedOff': 'Charged Off',
                        'Collection': 'Collection',
                        'Delinquent': 'Delinquent',
                        'Late': 'Late',
                        'Paid': 'Paid',
                        'Unknown': 'Unknown'
                      };
                      
                      // ===== EXTRACT ALL ACCOUNTS FROM ALL BUREAUS =====
                      const accounts = [];
                      
                      const extractAccount = (tradeline, defaultBureau) => {
                        try {
                          // Get bureau from tradeline's Source.Bureau (can be @symbol or @description)
                          const bureauSymbol = tradeline?.Source?.Bureau?.['@symbol'] || 
                                              tradeline?.Source?.Bureau?.['@description'] ||
                                              tradeline?.Source?.Bureau?.['@abbreviation'] ||
                                              defaultBureau;
                          const bureau = BUREAU_MAP[bureauSymbol] || bureauSymbol || defaultBureau || 'Unknown';
                          
                          return {
                            bureau: bureau,
                            creditorName: tradeline?.Creditor?.CreditBusinessType?.Name?.['#text'] || 
                                         tradeline?.Creditor?.Name || 
                                         tradeline?.['@creditorName'] || 
                                         tradeline?.creditorName || 
                                         'Unknown',
                            accountNumber: tradeline?.AccountNumber || 
                                          tradeline?.['@accountNumber'] || 
                                          '****',
                            accountType: tradeline?.GrantedTrade?.AccountType?.['@description'] ||
                                        tradeline?.AccountType?.['@description'] ||
                                        tradeline?.['@accountType'] || 
                                        'Unknown',
                            currentBalance: tradeline?.GrantedTrade?.CurrentBalance?.['#text'] ||
                                           tradeline?.CurrentBalance ||
                                           tradeline?.['@currentBalance'] || 
                                           '0',
                            creditLimit: tradeline?.GrantedTrade?.CreditLimit?.['#text'] ||
                                        tradeline?.CreditLimit ||
                                        tradeline?.GrantedTrade?.HighCredit?.['#text'] ||
                                        tradeline?.['@highCredit'] || 
                                        '0',
                            paymentStatus: (() => {
                              const raw = tradeline?.GrantedTrade?.PayStatusType?.['@description'] ||
                                         tradeline?.GrantedTrade?.PayStatusType?.['@symbol'] ||
                                         tradeline?.PaymentStatus?.['@description'] ||
                                         tradeline?.PaymentStatus ||
                                         tradeline?.['@paymentStatus'] ||
                                         tradeline?.AccountCondition?.['@symbol'] ||
                                         '';
                              return PAYMENT_STATUS_MAP[raw] || raw || 'Current';
                            })(),
                            accountStatus: (() => {
                              const raw = tradeline?.AccountCondition?.['@description'] ||
                                         tradeline?.AccountCondition?.['@symbol'] ||
                                         tradeline?.GrantedTrade?.AccountStatus?.['@description'] ||
                                         tradeline?.GrantedTrade?.AccountStatus?.['@symbol'] ||
                                         tradeline?.GrantedTrade?.OpenOrClosed?.['@description'] ||
                                         tradeline?.GrantedTrade?.OpenOrClosed?.['@symbol'] ||
                                         tradeline?.GrantedTrade?.OpenClosed?.['@description'] ||
                                         tradeline?.GrantedTrade?.OpenClosed?.['@symbol'] ||
                                         tradeline?.AccountStatus?.['@description'] ||
                                         tradeline?.AccountStatus?.['@symbol'] ||
                                         tradeline?.AccountStatus ||
                                         tradeline?.['@accountStatus'] ||
                                         tradeline?.OpenClosed ||
                                         '';
                              const normalized = raw?.toString().trim().toUpperCase();
                              return ACCOUNT_STATUS_MAP[normalized] || ACCOUNT_STATUS_MAP[raw] || raw || 'Open';
                            })(),
                            dateOpened: tradeline?.GrantedTrade?.DateOpened?.['#text'] ||
                                       tradeline?.DateOpened ||
                                       tradeline?.['@dateOpened'] || 
                                       '',
                            dateReported: tradeline?.GrantedTrade?.DateReported?.['#text'] ||
                                         tradeline?.DateReported ||
                                         tradeline?.['@dateReported'] || 
                                         '',
                            monthlyPayment: tradeline?.GrantedTrade?.MonthlyPayment?.['#text'] ||
                                           tradeline?.MonthlyPayment ||
                                           tradeline?.['@monthlyPayment'] || 
                                           '0',
                            remarks: tradeline?.Remark?.RemarkCode?.['@description'] || ''
                          };
                        } catch (err) {
                          console.error('Error extracting account:', err);
                          return null;
                        }
                      };
                      
                      // ===== EXTRACT FROM TradeLinePartition =====
                      const tradePartitions = trueLinkReport?.TradeLinePartition || [];
                      const partitionArray = Array.isArray(tradePartitions) ? tradePartitions : [tradePartitions];
                      
                      console.log('📊 Found TradeLinePartition count:', partitionArray.length);
                      // Debug: Log first partition structure
                      if (partitionArray.length > 0) {
                        const fp = partitionArray[0];
                        const ft = fp?.Tradeline;
                        console.log('📋 First partition debug:', {
                          tradelineIsArray: Array.isArray(ft),
                          tradelineCount: Array.isArray(ft) ? ft.length : 1,
                          firstBureau: (Array.isArray(ft) ? ft[0] : ft)?.Source?.Bureau
                        });
                      }
                      
                      // Track accounts by bureau for logging
                      const bureauCounts = { TransUnion: 0, Experian: 0, Equifax: 0, Unknown: 0 };
                      
                      partitionArray.forEach((partition, index) => {
                        const tradelines = partition?.Tradeline || [];
                        const tradeArray = Array.isArray(tradelines) ? tradelines : [tradelines];
                        
                        // Each tradeline has its own bureau in Source.Bureau
                        tradeArray.forEach(tradeline => {
                        // ===== CRITICAL: Extract bureau from EACH tradeline =====
                        const tradeBureau = 
                          tradeline?.Source?.Bureau?.['@symbol'] ||      // PRIMARY - TUC, EXP, EQF
                          tradeline?.Source?.Bureau?.['@description'] ||
                          tradeline?.Source?.Bureau?.['@abbreviation'] ||
                          tradeline?.['@BureauCode'] ||
                          tradeline?.BureauCode ||
                          'Unknown';
                        
                        const account = extractAccount(tradeline, tradeBureau);
                        if (account && account.creditorName !== 'Unknown') {
                          accounts.push(account);
                          bureauCounts[account.bureau] = (bureauCounts[account.bureau] || 0) + 1;
                        }
                      });
                      });
                      
                      console.log('📊 Accounts by bureau:', bureauCounts);
                      console.log(`✅ Total accounts extracted from TradeLinePartition: ${accounts.length}`);
                      
                      // ===== FALLBACK: Try legacy paths if no accounts found =====
                      if (accounts.length === 0) {
                        console.log('📋 Trying legacy tradeline locations...');
                        
                        // Try direct Tradeline array on TrueLinkCreditReportType
                        const directTradelines = trueLinkReport?.Tradeline || [];
                        const directArray = Array.isArray(directTradelines) ? directTradelines : (directTradelines ? [directTradelines] : []);
                        
                        directArray.forEach(tradeline => {
                          const account = extractAccount(tradeline, 'Unknown');
                          if (account && account.creditorName !== 'Unknown') {
                            accounts.push(account);
                          }
                        });
                        
                        console.log(`📊 After legacy search: ${accounts.length} accounts`);
                      }
                      
                      console.log(`✅ Final total accounts extracted: ${accounts.length}`);
                      
                      return {
                        success: true,
                        verificationRequired: false,
                        useWidget: true,
                        memberToken: memberToken,
                        memberAccessToken: memberToken,
                        enrollmentId: enrollmentId,
                        membershipNumber: membershipNumber,
                        email: email,
                        data: {
                          vantageScore: score,
                          accounts: accounts,
                          accountCount: accounts.length,
                          reportData: reportData
                        },
                        vantageScore: score,
                        accounts: accounts,
                        accountCount: accounts.length
                      };
                    } else {
                      console.log('⚠️ Credit report not available yet, returning widget for verification');
                    }
                  } catch (reportErr) {
                    console.log('⚠️ Could not pull report directly:', reportErr.message);
                  }
                  
                  // Fallback to widget if report pull failed
                  console.log('🔄 Falling back to widget for verification');
                  return {
                    success: true,
                    verificationRequired: false,
                    useWidget: true,
                    needsWidgetVerification: true,
                    memberToken: memberToken,
                    memberAccessToken: memberToken,
                    enrollmentId: enrollmentId,
                    membershipNumber: membershipNumber,
                    email: email,
                    data: {},
                    questions: [],
                    verificationQuestions: [],
                    message: 'Please complete identity verification using the viewer below.',
                    widgetUrl: 'https://idiq-prod-web-api.web.app/idiq-credit-report/index.js'
                  };
                }
                
                console.log('ℹ️ 422 may indicate verification is already complete or another issue');
              }
            }

            // =====================================================================
            // STEP 4: Pull Credit Report (with retry on failure)
            // =====================================================================
            // ===== BUG #6 FIX: IDIQ API sometimes returns 400 if queried too =====
            // soon after enrollment or verification. We retry once with a delay.
            console.log('📈 Fetching credit report data...');
            
            let reportResponse;
            let retryAttempt = 0;
            const maxReportRetries = 2;  // Try up to 2 times
            
            while (retryAttempt < maxReportRetries) {
              reportResponse = await fetch(`${IDIQ_BASE_URL}v1/credit-report`, {
                method: 'GET',
                headers: { 
                  'Authorization': `Bearer ${memberToken}`, 
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                }
              });
              
              // If success or 422 (verification needed), stop retrying
              if (reportResponse.ok || reportResponse.status === 422) {
                break;
              }
              
              retryAttempt++;
              if (retryAttempt < maxReportRetries) {
                console.log(`⚠️ Credit report returned ${reportResponse.status} — retrying in 4 seconds (attempt ${retryAttempt}/${maxReportRetries})...`);
                await new Promise(resolve => setTimeout(resolve, 4000));
              }
            }
            
            console.log(`📋 Credit report final status: ${reportResponse.status} (after ${retryAttempt + 1} attempt(s))`);


            // ===== HANDLE 422 ERROR (Verification Required) =====
            if (reportResponse.status === 422) {
              const errorData = await reportResponse.text();
              console.log('⚠️ Credit report returned 422 - verification required:', errorData);
              
              // Retry getting verification questions
              console.log('🔄 Retrying verification questions fetch...');
              const retryResponse = await fetch(`${IDIQ_BASE_URL}v1/enrollment/verification-questions`, {
                method: 'GET',
                headers: { 
                  'Authorization': `Bearer ${memberToken}`, 
                  'Accept': 'application/json'
                }
              });
              
              if (retryResponse.ok) {
                const retryData = await retryResponse.json();
                console.log('📋 Retry questions raw:', JSON.stringify(retryData).substring(0, 300));
                const retryQuestions = retryData.questions || retryData.Questions || [];
                
                if (retryQuestions.length > 0) {
                  console.log(`🔐 Retry found ${retryQuestions.length} verification questions`);
                  return {
                    success: true,
                    verificationRequired: true,
                    enrollmentId: enrollmentId || 'existing_active_member',
                    email: email,
                    membershipNumber: membershipNumber || 'existing',
                    questions: retryQuestions,
                    verificationQuestions: retryQuestions,
                    data: { questions: retryQuestions, verificationQuestions: retryQuestions },
                    message: 'Identity verification required before accessing your credit report'
                  };
                }
              }
              
              // Can't get questions - return widget fallback instead of error
              console.log('⚠️ Cannot get verification questions - returning widget fallback');
              return {
                success: true,
                useWidget: true,
                memberToken: memberToken,
                memberAccessToken: memberToken,
                enrollmentId: enrollmentId || 'existing_active_member',
                email: email,
                membershipNumber: membershipNumber || 'existing',
                verificationRequired: false,
                questions: [],
                verificationQuestions: [],
                data: {
                  vantageScore: null,
                  useWidget: true,
                  message: 'Verification required. Please use the credit report viewer widget.'
                },
                message: 'Identity verification required. The credit report viewer will handle this.',
                widgetUrl: 'https://idiq-prod-web-api.web.app/idiq-credit-report/index.js',
                tip: 'The IDIQ widget will guide you through identity verification.'
              };
            }

            if (!reportResponse.ok) {
              const errorText = await reportResponse.text();
              console.error('❌ Credit report pull failed:', reportResponse.status, errorText);
              
              // Return widget fallback instead of throwing error
              console.log('⚠️ Credit report failed - returning widget fallback');
              return {
                success: true,
                useWidget: true,
                memberToken: memberToken,
                memberAccessToken: memberToken,
                enrollmentId: enrollmentId || 'existing_active_member',
                email: email,
                membershipNumber: membershipNumber || 'existing',
                verificationRequired: false,
                questions: [],
                verificationQuestions: [],
                data: {
                  vantageScore: null,
                  useWidget: true,
                  message: `Credit report temporarily unavailable. Please use the widget.`
                },
                message: 'Credit report viewer will display your report.',
                widgetUrl: 'https://idiq-prod-web-api.web.app/idiq-credit-report/index.js'
              };
            }

            const reportData = await reportResponse.json();
            console.log('✅ Credit report received successfully!');
            
            // FIX: Robust score mapping to ensure dashboard charts populate correctly
            const score = reportData.vantageScore || 
                          reportData.score || 
                          (reportData.bureaus && reportData.bureaus.transunion?.score);

            if (contactId) {
              await db.collection('creditReports').add({
                contactId,
                email: email.toLowerCase(),
                membershipNumber,
                reportData,
                vantageScore: score,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                source: 'idiq'
              });
              console.log('✅ Credit report saved to Firestore');
            }

            return {
  success: true,
  verificationRequired: false,
  memberToken: memberToken,           // ✅ ADD THIS
  memberAccessToken: memberToken,     // ✅ ADD THIS
  data: { ...reportData, vantageScore: score },
  questions: [],
  verificationQuestions: [],
  membershipNumber
};

          } catch (error) {
            console.error('❌ pullReport error:', error.message);
            throw error;
          }
        }
        
        case 'submitVerification': {
          try {
            const { email, answerIds, enrollmentId, contactId } = memberData;
            console.log('📝 submitVerification: Processing answers...');
            console.log('📧 Email:', email);
            console.log('🔑 EnrollmentId:', enrollmentId);
            console.log('👤 ContactId:', contactId);
            
            let enrollment = null;
            let membershipNumber = null;
            if (enrollmentId && enrollmentId !== 'existing_active_member') {
              const enrollDoc = await db.collection('idiqEnrollments').doc(enrollmentId).get();
              if (enrollDoc.exists) {
                enrollment = enrollDoc.data();
                membershipNumber = enrollment.membershipNumber;
                // CHECK IF ALREADY LOCKED
                if (enrollment.verificationStatus === 'locked') {
                  return { success: false, locked: true, message: 'Account locked. Please contact support.' };
                }
              }
            }

            const partnerToken = await getPartnerToken();
            const memberToken = await getMemberToken(email.toLowerCase(), partnerToken);
            
            if (!memberToken) {
              console.error('❌ Could not get member token for verification');
              return { 
                success: false, 
                error: 'Could not authorize with IDIQ. Please try again.',
                useWidget: true,
                widgetUrl: 'https://idiq-prod-web-api.web.app/idiq-credit-report/index.js'
              };
            }
            
            const response = await fetch(`${IDIQ_BASE_URL}v1/enrollment/verification-questions`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${memberToken}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify({ answers: answerIds })
            });
            
            if (!response.ok) {
              const errorText = await response.text();
              console.error('❌ Verification request failed:', response.status, errorText);
              throw new Error(`Verification request failed: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('📋 Verification result:', JSON.stringify(result).substring(0, 200));
            console.log('📋 FULL Verification result:', JSON.stringify(result));
            
            // ===== ENHANCED: Handle all IDIQ response statuses =====
            const status = result.status?.toLowerCase() || '';
            
            // SUCCESS CASE
            if (status === 'correct' || result.isCorrect === true || result.verified === true) {
              console.log('✅ Identity verified! Storing member token and pulling report...');
              
              // ===== STORE MEMBER TOKEN FOR CREDIT REPORT WIDGET =====
              if (enrollmentId && enrollmentId !== 'existing_active_member') {
                await db.collection('idiqEnrollments').doc(enrollmentId).update({
                  verificationStatus: 'verified',
                  verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
                  enrollmentStep: 'completed',
                  memberAccessToken: memberToken,
                  tokenExpiresAt: new Date(Date.now() + 3600000), // 1 hour
                  lastActivity: admin.firestore.FieldValue.serverTimestamp()
                });
                console.log('✅ Member token stored in enrollment for widget');
              }

              // ===== ADD DELAY: Give IDIQ time to process verification =====
              console.log('⏳ Waiting 3 seconds for IDIQ to process verification...');
              await new Promise(resolve => setTimeout(resolve, 3000));
              
              console.log('📊 Now fetching credit report...');
              const reportResponse = await fetch(`${IDIQ_BASE_URL}v1/credit-report`, {
                headers: { 'Authorization': `Bearer ${memberToken}`, 'Accept': 'application/json' }
              });

              const reportData = await reportResponse.json();
              console.log('📋 Raw credit report response:', JSON.stringify(reportData).substring(0, 1000));

              const score = reportData.vantageScore || 
                          reportData.score || 
                          reportData.bureaus?.transunion?.score ||
                          reportData.bureaus?.experian?.score ||
                          reportData.bureaus?.equifax?.score ||
                          null;

              console.log('📈 Extracted score:', score);

              if (!score) {
                console.warn('⚠️ No score found in credit report! Report may be empty.');
              }

              // ===== EXTRACT ALL ACCOUNTS FROM CREDIT REPORT =====
              console.log('📊 Starting account extraction from credit report...');
              const accounts = [];
              
              // Helper function to safely extract account data
              const extractAccount = (tradeline, bureau) => {
                if (!tradeline) return null;
                
                try {
                  return {
                    bureau: bureau,
                    creditorName: tradeline.creditorName || 
                                  tradeline.Creditor?.['@name'] || 
                                  tradeline['@creditorName'] ||
                                  tradeline.subscriberName ||
                                  'Unknown Creditor',
                    accountNumber: tradeline['@accountNumber'] || 
                                  tradeline.accountNumber || 
                                  tradeline['@subscriberCode'] ||
                                  '****',
                    accountType: tradeline['@accountType'] || 
                                tradeline.accountType || 
                                tradeline.AccountType ||
                                'Unknown',
                    currentBalance: tradeline['@currentBalance'] || 
                                   tradeline.currentBalance || 
                                   tradeline.Balance?.['@currentBalance'] ||
                                   '0',
                    highCredit: tradeline['@highCredit'] || 
                               tradeline.highCredit || 
                               tradeline.HighCredit?.['@amount'] ||
                               '0',
                    paymentStatus: tradeline['@paymentStatus'] || 
                                  tradeline.paymentStatus || 
                                  tradeline.PaymentStatus?.['@type'] ||
                                  'Unknown',
                    accountStatus: tradeline['@accountStatus'] || 
                                  tradeline.accountStatus || 
                                  tradeline.AccountStatus?.['@type'] ||
                                  'Unknown',
                    monthsReviewed: tradeline['@monthsReviewed'] || 
                                   tradeline.monthsReviewed || 
                                   '0',
                    dateOpened: tradeline['@dateOpened'] || 
                               tradeline.dateOpened || 
                               tradeline.DateOpened?.['@date'] ||
                               '',
                    dateReported: tradeline['@dateReported'] || 
                                 tradeline.dateReported || 
                                 tradeline.DateReported?.['@date'] ||
                                 '',
                    terms: tradeline['@terms'] || 
                          tradeline.terms || 
                          tradeline.Terms ||
                          '',
                    monthlyPayment: tradeline['@monthlyPayment'] || 
                                   tradeline.monthlyPayment || 
                                   tradeline.Payment?.['@monthlyPayment'] ||
                                   '0'
                  };
                } catch (err) {
                  console.error('❌ Error extracting account:', err.message);
                  return null;
                }
              };

              // Extract TransUnion accounts
              try {
                const tuTradelines = reportData.TransUnion?.Tradeline || 
                                   reportData.tradelines?.TransUnion || 
                                   reportData.TU?.Tradeline ||
                                   reportData.Borrower?.CreditFile?.TradeLinePartition?.[0]?.Tradeline;
                
                if (tuTradelines) {
                  const tuArray = Array.isArray(tuTradelines) ? tuTradelines : [tuTradelines];
                  console.log(`📊 Found ${tuArray.length} TransUnion tradelines`);
                  
                  tuArray.forEach((tradeline, index) => {
                    const account = extractAccount(tradeline, 'TransUnion');
                    if (account && account.creditorName !== 'Unknown Creditor') {
                      accounts.push(account);
                      if (index === 0) {
                        console.log('📋 Sample TU account:', account.creditorName);
                      }
                    }
                  });
                }
              } catch (err) {
                console.error('❌ Error processing TransUnion accounts:', err.message);
              }

              // Extract Experian accounts
              try {
                const expTradelines = reportData.Experian?.Tradeline || 
                                    reportData.tradelines?.Experian || 
                                    reportData.EXP?.Tradeline ||
                                    reportData.Borrower?.CreditFile?.TradeLinePartition?.[1]?.Tradeline;
                
                if (expTradelines) {
                  const expArray = Array.isArray(expTradelines) ? expTradelines : [expTradelines];
                  console.log(`📊 Found ${expArray.length} Experian tradelines`);
                  
                  expArray.forEach((tradeline, index) => {
                    const account = extractAccount(tradeline, 'Experian');
                    if (account && account.creditorName !== 'Unknown Creditor') {
                      accounts.push(account);
                      if (index === 0) {
                        console.log('📋 Sample EXP account:', account.creditorName);
                      }
                    }
                  });
                }
              } catch (err) {
                console.error('❌ Error processing Experian accounts:', err.message);
              }

              // Extract Equifax accounts
              try {
                const eqfTradelines = reportData.Equifax?.Tradeline || 
                                    reportData.tradelines?.Equifax || 
                                    reportData.EQF?.Tradeline ||
                                    reportData.Borrower?.CreditFile?.TradeLinePartition?.[2]?.Tradeline;
                
                if (eqfTradelines) {
                  const eqfArray = Array.isArray(eqfTradelines) ? eqfTradelines : [eqfTradelines];
                  console.log(`📊 Found ${eqfArray.length} Equifax tradelines`);
                  
                  eqfArray.forEach((tradeline, index) => {
                    const account = extractAccount(tradeline, 'Equifax');
                    if (account && account.creditorName !== 'Unknown Creditor') {
                      accounts.push(account);
                      if (index === 0) {
                        console.log('📋 Sample EQF account:', account.creditorName);
                      }
                    }
                  });
                }
              } catch (err) {
                console.error('❌ Error processing Equifax accounts:', err.message);
              }

              console.log(`✅ Successfully extracted ${accounts.length} total accounts from credit report`);
              
              if (accounts.length > 0) {
                console.log('📋 Account breakdown:', {
                  TransUnion: accounts.filter(a => a.bureau === 'TransUnion').length,
                  Experian: accounts.filter(a => a.bureau === 'Experian').length,
                  Equifax: accounts.filter(a => a.bureau === 'Equifax').length
                });
              } else {
                console.warn('⚠️ No accounts extracted - check report structure');
                console.log('📋 Report keys:', Object.keys(reportData).slice(0, 10));
              }

              // Save to Firestore with accounts
              if (contactId) {
                try {
                  await db.collection('creditReports').add({
                    contactId,
                    email: email.toLowerCase(),
                    membershipNumber: membershipNumber,
                    reportData,
                    vantageScore: score,
                    accounts: accounts,
                    accountCount: accounts.length,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    source: 'idiq'
                  });
                  console.log('✅ Credit report with accounts saved to Firestore');
                } catch (err) {
                  console.error('❌ Error saving to Firestore:', err.message);
                }
              }

              return {
                success: true,
                verified: true,
                memberToken: memberToken,
                data: { 
                  ...reportData, 
                  vantageScore: score,
                  accounts: accounts,
                  accountCount: accounts.length
                },
                reportData: { 
                  ...reportData, 
                  vantageScore: score,
                  accounts: accounts,
                  accountCount: accounts.length
                },
                questions: [],
                verificationQuestions: []
              };
            }
            
            // ===== MORE QUESTIONS NEEDED =====
            if (status === 'morequestions') {
              console.log('⚠️ IDIQ requires additional verification - answer all questions correctly');
              
              // Track attempt but don't lock - this isn't a wrong answer
              const currentAttempts = (enrollment?.verificationAttempts || 0) + 1;
              if (enrollmentId && enrollmentId !== 'existing_active_member') {
                await db.collection('idiqEnrollments').doc(enrollmentId).update({
                  verificationAttempts: currentAttempts,
                  lastAttemptAt: admin.firestore.FieldValue.serverTimestamp(),
                  lastStatus: 'more_questions_needed'
                });
              }
              
              return {
                success: false,
                verified: false,
                needsMoreQuestions: true,
                attempts: currentAttempts,
                maxAttempts: 3,
                attemptsRemaining: 3 - currentAttempts,
                message: 'Please ensure all security questions are answered correctly.'
              };
            }
            
            // ===== SESSION EXPIRED / ERROR =====
            if (status === 'error') {
              console.log('⚠️ IDIQ returned error status');
              console.log('📋 Error message:', result.message);
              
              const errorMessage = result.message || 'Session expired';
              
              // ===== SPECIAL CASE: "User is already authenticated" means SUCCESS! =====
              if (errorMessage.toLowerCase().includes('already authenticated')) {
                console.log('✅ User is already authenticated - fetching credit report!');
                
                // Update enrollment status
                if (enrollmentId && enrollmentId !== 'existing_active_member') {
                  await db.collection('idiqEnrollments').doc(enrollmentId).update({
                    verificationStatus: 'verified',
                    verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
                    enrollmentStep: 'completed',
                    memberAccessToken: memberToken,
                    tokenExpiresAt: new Date(Date.now() + 3600000),
                    lastActivity: admin.firestore.FieldValue.serverTimestamp()
                  });
                  console.log('✅ Enrollment marked as verified');
                }
                
                // Fetch the credit report
                console.log('📊 Fetching credit report for already-authenticated user...');
                const reportResponse = await fetch(`${IDIQ_BASE_URL}v1/credit-report`, {
                  headers: { 'Authorization': `Bearer ${memberToken}`, 'Accept': 'application/json' }
                });
                
                if (reportResponse.ok) {
                  const reportData = await reportResponse.json();
                  console.log('📋 Credit report retrieved for already-authenticated user');
                  
                // ===== IMPROVED SCORE EXTRACTION (handles thin files like Roman's 793) =====
                  const bc = reportData?.BundleComponents?.BundleComponent;
                  const trueLink = bc?.TrueLinkCreditReportType;
                  
                  // Try multiple paths to find the score
                  let score = null;
                  
                  // Path 1: Direct vantageScore
                  if (reportData.vantageScore) {
                    score = reportData.vantageScore;
                    console.log('📊 Score found via vantageScore:', score);
                  }
                  // Path 2: CreditScoreType @riskScore (most common)
                  else if (bc?.CreditScoreType?.['@riskScore']) {
                    score = parseInt(bc.CreditScoreType['@riskScore'], 10);
                    console.log('📊 Score found via CreditScoreType @riskScore:', score);
                  }
                  // Path 3: Borrower.CreditScore array (thin files like Roman)
                  else if (trueLink?.Borrower?.CreditScore) {
                    const borrowerScores = Array.isArray(trueLink.Borrower.CreditScore) 
                      ? trueLink.Borrower.CreditScore 
                      : [trueLink.Borrower.CreditScore];
                    for (const scoreObj of borrowerScores) {
                      const s = parseInt(scoreObj?.['@riskScore'] || scoreObj?.riskScore, 10);
                      if (s >= 300 && s <= 850) {
                        score = s;
                        console.log('📊 Score found via Borrower.CreditScore:', score);
                        break;
                      }
                    }
                  }
                  // Path 4: Bureau-specific scores
                  else if (reportData.bureaus) {
                    score = reportData.bureaus?.transunion?.score ||
                            reportData.bureaus?.experian?.score ||
                            reportData.bureaus?.equifax?.score;
                    if (score) console.log('📊 Score found via bureaus:', score);
                  }
                  
                  if (!score) {
                    console.log('⚠️ No score found in report. Keys:', Object.keys(reportData));
                    if (bc) console.log('📋 BundleComponent keys:', Object.keys(bc));
                  }
                  
                  console.log('📈 Extracted score:', score);
                  
                  return {
                    success: true,
                    verified: true,
                    alreadyAuthenticated: true,
                    memberToken: memberToken,
                    data: { 
                      ...reportData, 
                      vantageScore: score
                    },
                    reportData: { 
                      ...reportData, 
                      vantageScore: score
                    },
                    questions: [],
                    verificationQuestions: []
                  };
                } else {
                  console.log('⚠️ Could not fetch report, but user is verified');
                  return {
                    success: true,
                    verified: true,
                    alreadyAuthenticated: true,
                    memberToken: memberToken,
                    useWidget: true,
                    message: 'Identity verified! Use the widget to view your credit report.',
                    widgetUrl: 'https://idiq-prod-web-api.web.app/idiq-credit-report/index.js'
                  };
                }
              }
              
              // Regular session expired case
              // Don't count this as a failed attempt - it's a technical issue
              if (enrollmentId && enrollmentId !== 'existing_active_member') {
                await db.collection('idiqEnrollments').doc(enrollmentId).update({
                  lastAttemptAt: admin.firestore.FieldValue.serverTimestamp(),
                  lastStatus: 'session_expired',
                  lastErrorMessage: errorMessage
                });
              }
              
              return {
                success: false,
                verified: false,
                sessionExpired: true,
                message: errorMessage,
                action: 'Please request new verification questions and try again.',
                note: 'Session expired. This does not count as a failed attempt.'
              };
            }
            
            // ===== INCORRECT ANSWER =====
            if (status === 'incorrect') {
              console.log('❌ Verification answer incorrect');
              
              // INCORRECT ANSWER - TRACK ATTEMPTS
              const currentAttempts = (enrollment?.verificationAttempts || 0) + 1;
              const maxAttempts = 3;

              if (enrollmentId && enrollmentId !== 'existing_active_member') {
                const updateData = { 
                  verificationAttempts: currentAttempts, 
                  lastAttemptAt: admin.firestore.FieldValue.serverTimestamp(),
                  lastStatus: 'incorrect_answer'
                };

                if (currentAttempts >= maxAttempts) {
                  updateData.verificationStatus = 'locked';
                  
                  // DETAILED ALERT LOGIC RESTORED
                  await db.collection('mail').add({
                    to: 'Laurie@speedycreditrepair.com',
                    cc: 'chris@speedycreditrepair.com',
                    message: {
                      subject: `🚨 URGENT: IDIQ Verification Failed - ${enrollment?.firstName || email}`,
                      html: `
                        <h3>IDIQ VERIFICATION FAILURE ALERT</h3>
                        <p><strong>Client:</strong> ${enrollment?.firstName || 'Unknown'} ${enrollment?.lastName || ''}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Status:</strong> LOCKED (3/3 attempts failed)</p>
                        <hr>
                        <h4>Action Required:</h4>
                        <ol>
                          <li>Call client to help answer security questions.</li>
                          <li>If needed, cancel IDIQ and re-enroll (30-min window).</li>
                        </ol>
                        <p><strong>IDIQ Support:</strong> 877-875-4347</p>
                        <p><strong>Laurie's Contact:</strong> 657-332-9833</p>
                      `
                    }
                  });
                }
                await db.collection('idiqEnrollments').doc(enrollmentId).update(updateData);
              }

              return {
                success: false,
                verified: false,
                attempts: currentAttempts,
                maxAttempts: maxAttempts,
                attemptsRemaining: maxAttempts - currentAttempts,
                message: currentAttempts >= maxAttempts 
                  ? 'Account locked. Team notified.' 
                  : `Incorrect answer. ${maxAttempts - currentAttempts} attempts remaining.`
              };
            }
            
            // ===== UNKNOWN STATUS (FALLBACK) =====
            console.log('⚠️ Unknown verification status received:', result.status);
            console.log('📋 Full response:', JSON.stringify(result));
            
            // Track as potential error but don't lock account
            if (enrollmentId && enrollmentId !== 'existing_active_member') {
              await db.collection('idiqEnrollments').doc(enrollmentId).update({
                lastAttemptAt: admin.firestore.FieldValue.serverTimestamp(),
                lastStatus: 'unknown_status',
                lastUnknownResponse: JSON.stringify(result).substring(0, 500)
              });
            }
            
            return {
              success: false,
              verified: false,
              message: `Unexpected response from IDIQ: ${result.status || 'No status'}. Please contact support.`,
              debugInfo: result
            };
          } catch (err) {
            console.error('❌ submitVerification error:', err.message);
            throw err;
          }
        }

        // ===== NEW CASE: GET MEMBER TOKEN (for credit report widget) =====
        case 'getMemberToken': {
          console.log('🔑 getMemberToken: Starting...');
          
          const { enrollmentId, contactId } = data;
          
          if (!enrollmentId && !contactId) {
            return { success: false, error: 'enrollmentId or contactId required' };
          }
          
          // Find the enrollment
          let enrollmentDoc;
          let enrollmentData;
          
          if (enrollmentId) {
            enrollmentDoc = await db.collection('idiqEnrollments').doc(enrollmentId).get();
            if (enrollmentDoc.exists) {
              enrollmentData = enrollmentDoc.data();
            }
          }
          
          // If not found by enrollmentId, try contactId
          if (!enrollmentData && contactId) {
            const enrollments = await db.collection('idiqEnrollments')
              .where('contactId', '==', contactId)
              .where('status', 'in', ['active', 'verified', 'enrolled'])
              .orderBy('createdAt', 'desc')
              .limit(1)
              .get();
            
            if (!enrollments.empty) {
              enrollmentDoc = enrollments.docs[0];
              enrollmentData = enrollmentDoc.data();
            }
          }
          
          if (!enrollmentData) {
            console.log('❌ getMemberToken: Enrollment not found');
            return { success: false, error: 'Enrollment not found' };
          }
          
          const email = enrollmentData.email;
          if (!email) {
            console.log('❌ getMemberToken: Email not found in enrollment');
            return { success: false, error: 'Email not found in enrollment' };
          }
          
          try {
            // Get partner token first
            console.log('🔑 getMemberToken: Getting partner token...');
            const partnerToken = await getPartnerToken();
            
            // Get member token
            console.log('🔑 getMemberToken: Getting member token for:', email);
            const memberToken = await getMemberToken(email, partnerToken);
            
            // Store the token for future use (expires in 1 hour)
            const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now
            
            await enrollmentDoc.ref.update({
              memberAccessToken: memberToken,
              tokenExpiresAt: expiresAt,
              lastTokenRefresh: admin.firestore.FieldValue.serverTimestamp(),
              lastActivity: admin.firestore.FieldValue.serverTimestamp()
            });
            
            console.log('✅ getMemberToken: Success for', email);
            
            return {
              success: true,
              memberToken: memberToken,
              email: email,
              expiresAt: expiresAt.toISOString(),
              membershipNumber: enrollmentData.membershipNumber
            };
          } catch (error) {
            console.error('❌ getMemberToken error:', error);
            return { 
              success: false, 
              error: error.message || 'Failed to get member token'
            };
          }
        }
        case 'getToken': {
          try {
            const token = await getPartnerToken();
            console.log('🔐 Partner token retrieved');
            return { success: true, token };
          } catch (err) {
            console.error('❌ getToken error:', err.message);
            throw err;
          }
        }

        case 'storeReport': {
          try {
            const { email, contactId, reportData } = params;
            console.log('💾 Storing manual credit report for:', email);

            const reportRef = await db.collection('creditReports').add({
              contactId,
              email: email.toLowerCase(),
              reportData,
              scores: {
                equifax: reportData.equifaxScore || null,
                experian: reportData.experianScore || null,
                transunion: reportData.transunionScore || null,
                average: reportData.averageScore || null
              },
              retrievedAt: admin.firestore.FieldValue.serverTimestamp(),
              status: 'pending_review',
              provider: 'IDIQ'
            });

            if (contactId) {
              await db.collection('contacts').doc(contactId).update({
                'creditReport.lastPulled': admin.firestore.FieldValue.serverTimestamp(),
                'creditReport.reportId': reportRef.id,
                'creditReport.status': 'available',
                'creditReport.averageScore': reportData.averageScore || null
              });
              console.log('✅ Contact updated with report metadata');
            }

            return { success: true, reportId: reportRef.id };
          } catch (err) {
            console.error('❌ storeReport error:', err.message);
            throw err;
          }
        }

        default:
          throw new Error(`Unknown action: ${action}`);
      }
    } catch (error) {
      console.error('❌ IDIQ error:', error.message);
      return { success: false, error: error.message };
    }
  }
);

console.log('✅ Function 5/10: idiqService (PRODUCTION) loaded');

// ============================================
// FUNCTION 6: WORKFLOW PROCESSOR (Scheduled)
// ============================================
// Processes workflow stages every hour (must stay separate - scheduled trigger)

exports.processWorkflowStages = onSchedule(
  {
    schedule: 'every 60 minutes',
    ...defaultConfig,
    secrets: [idiqPartnerId, idiqPartnerSecret, gmailUser, gmailAppPassword, gmailFromName]
  },
  async (context) => {
    console.log('⏰ Processing workflow stages...');
    const db = admin.firestore();
    try {
      // ═══════════════════════════════════════════════════════════════════════
      // PART 1: EXISTING WORKFLOW STAGE ADVANCEMENT
      // ═══════════════════════════════════════════════════════════════════════
      
      const contactsSnapshot = await db.collection('contacts')
        .where('workflowActive', '==', true)
        .where('workflowPaused', '==', false)
        .get();
      
      let processed = 0;
      
      for (const doc of contactsSnapshot.docs) {
        const contactData = doc.data();
        const contactId = doc.id;
        
        // Get current workflow stage
        const currentStage = contactData.workflowStage || 'welcome';
        
        // Check if it's time to advance to next stage
        const lastStageUpdate = contactData.workflowLastUpdate?.toDate() || new Date(0);
        const hoursSinceUpdate = (Date.now() - lastStageUpdate.getTime()) / (1000 * 60 * 60);
        
        // Example: Advance stage after 24 hours
        if (hoursSinceUpdate >= 24) {
          const stageOrder = [
            'welcome',
            'idiq_enrollment',
            'credit_analysis',
            'service_recommendation',
            'contract_generation',
            'document_collection',
            'dispute_generation',
            'bureau_submission',
            'ongoing_monitoring'
          ];
          
          const currentIndex = stageOrder.indexOf(currentStage);
          const nextStage = currentIndex >= 0 && currentIndex < stageOrder.length - 1
            ? stageOrder[currentIndex + 1]
            : currentStage;
          
          if (nextStage !== currentStage) {
            await doc.ref.update({
              workflowStage: nextStage,
              workflowLastUpdate: admin.firestore.FieldValue.serverTimestamp()
            });
            
            console.log(`📈 Advanced ${contactId} from ${currentStage} to ${nextStage}`);
            processed++;
          }
        }
      }
      
      console.log(`✅ Processed ${processed} workflow stage advancements`);
      
      // ═══════════════════════════════════════════════════════════════════════
      // PART 2: IDIQ TRIAL AUTO-CANCELLATION LOGIC
      // ═══════════════════════════════════════════════════════════════════════
      
      console.log('\n🔍 Checking IDIQ trial subscriptions...');
      
      const now = new Date();
      const nowTimestamp = admin.firestore.Timestamp.fromDate(now);
      
      // Get partner token for IDIQ API
      const getPartnerToken = async () => {
        const response = await fetch('https://api.identityiq.com/pif-service/v1/partner-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            partnerId: idiqPartnerId.value(),
            partnerSecret: idiqPartnerSecret.value()
          })
        });
        if (!response.ok) throw new Error(`Partner auth failed: ${response.status}`);
        const data = await response.json();
        return data.accessToken;
      };
      
      // Cancel IDIQ membership
      const cancelIDIQMembership = async (email, partnerToken) => {
        const response = await fetch('https://api.identityiq.com/pif-service/v1/enrollment/cancel-membership', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${partnerToken}`
          },
          body: JSON.stringify({ email: email.toLowerCase() })
        });
        
        if (!response.ok) {
          const error = await response.text();
          throw new Error(`Cancellation failed: ${response.status} - ${error}`);
        }
        
        return await response.json();
      };
      
      // ─────────────────────────────────────────────────────────────────────
      // RULE 1: TRIAL EXPIRATION (30 days old, no contract signed)
      // ─────────────────────────────────────────────────────────────────────
      
      const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
      const thirtyDaysAgoTimestamp = admin.firestore.Timestamp.fromDate(thirtyDaysAgo);
      
      const twentySevenDaysAgo = new Date(now.getTime() - (27 * 24 * 60 * 60 * 1000));
      const twentySevenDaysAgoTimestamp = admin.firestore.Timestamp.fromDate(twentySevenDaysAgo);
      
      // Get trials approaching expiration (27+ days old)
      const expiringTrialsSnapshot = await db.collection('idiqEnrollments')
        .where('enrolledAt', '<=', twentySevenDaysAgoTimestamp)
        .where('status', '==', 'active')
        .get();
      
      console.log(`📊 Found ${expiringTrialsSnapshot.size} trials at 27+ days`);
      
      for (const enrollDoc of expiringTrialsSnapshot.docs) {
        const enrollment = enrollDoc.data();
        const contactId = enrollment.contactId;
        
        if (!contactId) continue;
        
        // Get contact to check contract status
        const contactDoc = await db.collection('contacts').doc(contactId).get();
        
        if (!contactDoc.exists) continue;
        
        const contact = contactDoc.data();
        
        // PROTECTED: Don't cancel if contract signed or client status
        if (contact.contractSigned === true || contact.status === 'client') {
          console.log(`✅ ${contactId} is protected (contract signed or client)`);
          
          // Update subscription status to protected
          await enrollDoc.ref.update({
            status: 'protected',
            protectedAt: admin.firestore.FieldValue.serverTimestamp(),
            protectedReason: contact.contractSigned ? 'contract_signed' : 'client_status'
          });
          
          continue;
        }
        
        const enrolledAt = enrollment.enrolledAt?.toDate() || new Date(0);
        const daysOld = Math.floor((now.getTime() - enrolledAt.getTime()) / (1000 * 60 * 60 * 24));
        
        // Send warning at 27 days (3 days before expiration)
        if (daysOld >= 27 && daysOld < 30 && !enrollment.expirationWarningSent) {
          console.log(`⚠️ Sending 3-day warning for ${contactId}`);
          
          // Send warning email to prospect
          const user = gmailUser.value();
          const pass = gmailAppPassword.value();
          
          const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: { user, pass }
          });
          
          await transporter.sendMail({
            from: `"${gmailFromName.value() || 'Speedy Credit Repair'}" <${user}>`,
            to: enrollment.email,
            subject: 'Your Free Credit Monitoring Trial Expires in 3 Days',
            text: `Hi ${contact.firstName},\n\nYour free IDIQ credit monitoring trial will expire in 3 days. To continue your credit monitoring and dispute services, please contact us to upgrade to a paid plan or sign your service agreement.\n\nCall us at (888) 724-7344 or reply to this email.\n\nThank you,\nChris Lahage\nSpeedy Credit Repair`,
            html: wrapEmailInHTML(
              'Trial Expiring Soon',
              `Hi ${contact.firstName},\n\nYour free IDIQ credit monitoring trial will expire in 3 days.\n\nTo continue your credit monitoring and dispute services, please contact us to upgrade to a paid plan or sign your service agreement.\n\nCall us at (888) 724-7344 or reply to this email.\n\nThank you,\nChris Lahage\nSpeedy Credit Repair`,
              contact.firstName
            )
          });
          
          // Send alert to Christopher
          await transporter.sendMail({
            from: `"${gmailFromName.value() || 'SpeedyCRM Alerts'}" <${user}>`,
            to: user, // Send to Christopher's email
            subject: `⚠️ IDIQ Trial Expiring: ${contact.firstName} ${contact.lastName}`,
            text: `Trial for ${contact.firstName} ${contact.lastName} (${enrollment.email}) expires in 3 days.\n\nContact ID: ${contactId}\nEnrolled: ${enrolledAt.toLocaleDateString()}\nDays Old: ${daysOld}\n\nAction needed: Contact prospect or trial will auto-cancel in 3 days.`,
            html: wrapEmailInHTML(
              'Trial Expiring Alert',
              `Trial for ${contact.firstName} ${contact.lastName} (${enrollment.email}) expires in 3 days.\n\nContact ID: ${contactId}\nEnrolled: ${enrolledAt.toLocaleDateString()}\nDays Old: ${daysOld}\n\nAction needed: Contact prospect or trial will auto-cancel in 3 days.`,
              'Chris'
            )
          });
          
          await enrollDoc.ref.update({
            expirationWarningSent: true,
            expirationWarningSentAt: admin.firestore.FieldValue.serverTimestamp()
          });
          
          console.log(`✅ Warning sent for ${contactId}`);
        }
        
        // AUTO-CANCEL at 30+ days
        if (daysOld >= 30) {
          console.log(`🚫 AUTO-CANCELLING trial for ${contactId} (${daysOld} days old)`);
          
          try {
            const partnerToken = await getPartnerToken();
            await cancelIDIQMembership(enrollment.email, partnerToken);
            
            // Update enrollment status
            await enrollDoc.ref.update({
              status: 'cancelled',
              cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
              cancellationReason: 'trial_expired',
              cancelledBySystem: true
            });
            
            // Update contact
            await db.collection('contacts').doc(contactId).update({
              'idiq.subscriptionStatus': 'cancelled',
              'idiq.cancelledAt': admin.firestore.FieldValue.serverTimestamp(),
              status: 'inactive'
            });
            
            // Send confirmation to Christopher
            const user = gmailUser.value();
            const pass = gmailAppPassword.value();
            
            const transporter = nodemailer.createTransport({
              host: 'smtp.gmail.com',
              port: 587,
              secure: false,
              auth: { user, pass }
            });
            
            await transporter.sendMail({
              from: `"${gmailFromName.value() || 'SpeedyCRM Alerts'}" <${user}>`,
              to: user,
              subject: `✅ IDIQ Trial Auto-Cancelled: ${contact.firstName} ${contact.lastName}`,
              text: `Trial for ${contact.firstName} ${contact.lastName} has been automatically cancelled after ${daysOld} days.\n\nContact ID: ${contactId}\nEmail: ${enrollment.email}\nReason: Trial Expired (30 days)`,
              html: wrapEmailInHTML(
                'Trial Auto-Cancelled',
                `Trial for ${contact.firstName} ${contact.lastName} has been automatically cancelled after ${daysOld} days.\n\nContact ID: ${contactId}\nEmail: ${enrollment.email}\nReason: Trial Expired (30 days)`,
                'Chris'
              )
            });
            
            console.log(`✅ Trial cancelled successfully for ${contactId}`);
            
          } catch (err) {
            console.error(`❌ Failed to cancel trial for ${contactId}:`, err);
            
            // Create admin alert for manual cancellation
            await db.collection('adminAlerts').add({
              type: 'CANCELLATION_FAILED',
              contactId: contactId,
              enrollmentId: enrollDoc.id,
              email: enrollment.email,
              error: err.message,
              priority: 'high',
              status: 'unread',
              message: `Failed to auto-cancel IDIQ trial for ${contact.firstName} ${contact.lastName}. Manual cancellation required.`,
              createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
            
            // Send alert email
            const user = gmailUser.value();
            const pass = gmailAppPassword.value();
            
            const transporter = nodemailer.createTransport({
              host: 'smtp.gmail.com',
              port: 587,
              secure: false,
              auth: { user, pass }
            });
            
            await transporter.sendMail({
              from: `"${gmailFromName.value() || 'SpeedyCRM Alerts'}" <${user}>`,
              to: user,
              subject: `🚨 URGENT: Manual IDIQ Cancellation Needed - ${contact.firstName} ${contact.lastName}`,
              text: `Auto-cancellation FAILED for ${contact.firstName} ${contact.lastName}.\n\nContact ID: ${contactId}\nEmail: ${enrollment.email}\nError: ${err.message}\n\nACTION REQUIRED: Manually cancel this subscription in IDIQ dashboard.`,
              html: wrapEmailInHTML(
                'Manual Cancellation Required',
                `Auto-cancellation FAILED for ${contact.firstName} ${contact.lastName}.\n\nContact ID: ${contactId}\nEmail: ${enrollment.email}\nError: ${err.message}\n\nACTION REQUIRED: Manually cancel this subscription in IDIQ dashboard.`,
                'Chris'
              )
            });
          }
        }
      }
      
      // ─────────────────────────────────────────────────────────────────────
      // RULE 3: IDIQ UPGRADE REMINDERS (7, 14, 18 days for signed clients)
      // Only for contacts who have signed contracts but haven't upgraded IDIQ
      // Increasing urgency at each stage
      // ─────────────────────────────────────────────────────────────────────
      
      console.log('\n📧 Checking IDIQ upgrade reminders for signed clients...');
      
      const IDIQ_UPGRADE_URL = 'https://member.identityiq.com/Account-Details.aspx?upgradepage=UPGRADE';
      let upgradeRemindersSent = 0;
      
      // Get contacts who have signed contracts but IDIQ is still on trial
      const signedButTrialSnapshot = await db.collection('contacts')
        .where('contractSigned', '==', true)
        .where('status', 'in', ['prospect', 'lead'])
        .limit(100)
        .get();
      
      console.log(`📊 Found ${signedButTrialSnapshot.size} signed clients to check for IDIQ upgrade`);
      
      for (const contactDoc of signedButTrialSnapshot.docs) {
        const contact = contactDoc.data();
        const contactId = contactDoc.id;
        
        // Skip if already upgraded to paid or marked as upgraded
        if (contact.idiq?.subscriptionType === 'paid' || 
            contact.idiq?.upgraded === true || 
            contact.idiqUpgraded === true) {
          continue;
        }
        
        // Get the IDIQ enrollment record
        const enrollmentSnapshot = await db.collection('idiqEnrollments')
          .where('contactId', '==', contactId)
          .where('status', 'in', ['active', 'trial'])
          .limit(1)
          .get();
        
        if (enrollmentSnapshot.empty) continue;
        
        const enrollment = enrollmentSnapshot.docs[0].data();
        const enrolledAt = enrollment.enrolledAt?.toDate() || contact.idiqEnrolledAt?.toDate() || new Date(0);
        const daysEnrolled = Math.floor((now.getTime() - enrolledAt.getTime()) / (1000 * 60 * 60 * 24));
        
        const recipientEmail = contact.email || contact.emails?.[0]?.address;
        if (!recipientEmail) continue;
        
        // ─────────────────────────────────────────────────────────────────
        // DAY 7: Friendly Reminder (Normal urgency)
        // ─────────────────────────────────────────────────────────────────
        if (daysEnrolled >= 7 && daysEnrolled < 14 && !contact.idiqUpgradeReminder7Sent) {
          console.log(`📧 Sending Day 7 upgrade reminder for ${contactId} (${contact.firstName})`);
          
          const emailHtml = EMAIL_TEMPLATES.idiqUpgradeReminder7(
            { ...contact, id: contactId },
            IDIQ_UPGRADE_URL
          );
          
          await transporter.sendMail({
            from: `"${gmailFromName.value() || 'Chris Lahage - Speedy Credit Repair'}" <${user}>`,
            to: recipientEmail,
            subject: `${contact.firstName}, your credit monitoring trial - quick update`,
            html: emailHtml
          });
          
          await contactDoc.ref.update({
            idiqUpgradeReminder7Sent: true,
            idiqUpgradeReminder7SentAt: admin.firestore.FieldValue.serverTimestamp()
          });
          
          upgradeRemindersSent++;
          console.log(`✅ Day 7 reminder sent for ${contactId}`);
        }
        
        // ─────────────────────────────────────────────────────────────────
        // DAY 14: Increasing Urgency (Medium urgency)
        // ─────────────────────────────────────────────────────────────────
        if (daysEnrolled >= 14 && daysEnrolled < 18 && !contact.idiqUpgradeReminder14Sent) {
          console.log(`📧 Sending Day 14 upgrade reminder for ${contactId} (${contact.firstName})`);
          
          const daysRemaining = 20 - daysEnrolled; // Based on 20-day soft deadline
          
          const emailHtml = EMAIL_TEMPLATES.idiqUpgradeReminder14(
            { ...contact, id: contactId },
            IDIQ_UPGRADE_URL,
            daysRemaining
          );
          
          await transporter.sendMail({
            from: `"${gmailFromName.value() || 'Chris Lahage - Speedy Credit Repair'}" <${user}>`,
            to: recipientEmail,
            subject: `⏰ ${contact.firstName}, your monitoring trial ends in ${daysRemaining} days`,
            html: emailHtml
          });
          
          await contactDoc.ref.update({
            idiqUpgradeReminder14Sent: true,
            idiqUpgradeReminder14SentAt: admin.firestore.FieldValue.serverTimestamp()
          });
          
          upgradeRemindersSent++;
          console.log(`✅ Day 14 reminder sent for ${contactId}`);
        }
        
        // ─────────────────────────────────────────────────────────────────
        // DAY 18: Final Warning (High Urgency - Red alert)
        // ─────────────────────────────────────────────────────────────────
        if (daysEnrolled >= 18 && daysEnrolled < 20 && !contact.idiqUpgradeFinalSent) {
          console.log(`📧 Sending Day 18 FINAL upgrade reminder for ${contactId} (${contact.firstName})`);
          
          const daysRemaining = 20 - daysEnrolled;
          
          const emailHtml = EMAIL_TEMPLATES.idiqUpgradeFinal18(
            { ...contact, id: contactId },
            IDIQ_UPGRADE_URL,
            daysRemaining
          );
          
          await transporter.sendMail({
            from: `"${gmailFromName.value() || 'Chris Lahage - Speedy Credit Repair'}" <${user}>`,
            to: recipientEmail,
            subject: `🚨 FINAL NOTICE: ${contact.firstName}, ${daysRemaining} days until monitoring expires`,
            html: emailHtml
          });
          
          // Also alert Christopher about this final warning
          await transporter.sendMail({
            from: `"SpeedyCRM Alerts" <${user}>`,
            to: user,
            subject: `⚠️ IDIQ Final Warning Sent: ${contact.firstName} ${contact.lastName}`,
            html: wrapEmailInHTML(
              'IDIQ Final Warning Alert',
              `Final upgrade warning sent to ${contact.firstName} ${contact.lastName}.\n\n` +
              `<strong>Contact ID:</strong> ${contactId}\n` +
              `<strong>Email:</strong> ${recipientEmail}\n` +
              `<strong>Days Enrolled:</strong> ${daysEnrolled}\n` +
              `<strong>Days Remaining:</strong> ${daysRemaining}\n\n` +
              `If they don't upgrade, their trial will be cancelled per your 20-day policy.\n\n` +
              `You may want to reach out personally.`,
              'Chris'
            )
          });
          
          await contactDoc.ref.update({
            idiqUpgradeFinalSent: true,
            idiqUpgradeFinalSentAt: admin.firestore.FieldValue.serverTimestamp()
          });
          
          upgradeRemindersSent++;
          console.log(`✅ Day 18 FINAL reminder sent for ${contactId}`);
        }
      }
      
      console.log(`✅ IDIQ upgrade reminders sent: ${upgradeRemindersSent}`);
      console.log('\n✅ IDIQ trial management complete');
      
    } catch (error) {
      console.error('❌ Workflow processor error:', error);
    }
  }
);

console.log('✅ Function 6/10: processWorkflowStages (ENHANCED with IDIQ auto-cancel + upgrade reminders) loaded');

// ═══════════════════════════════════════════════════════════════════════════
// NEW FUNCTION 6B: PROCESS ABANDONMENT EMAILS
// ═══════════════════════════════════════════════════════════════════════════
// Add this AFTER processWorkflowStages (Function 6)
// Runs every 5 minutes to check for abandoned enrollments
// ═══════════════════════════════════════════════════════════════════════════

exports.processAbandonmentEmails = onSchedule(
  {
    schedule: 'every 5 minutes',
    ...defaultConfig,
    memory: '1GiB',
    timeoutSeconds: 300,
    secrets: [gmailUser, gmailAppPassword, gmailFromName, gmailReplyTo, telnyxApiKey, telnyxSmsPhone]
  },
  async (context) => {
    console.log('⏰ Processing abandonment emails...');
    const db = admin.firestore();
    
    try {
      const now = new Date();
      const nowTimestamp = admin.firestore.Timestamp.fromDate(now);
      
      // ─────────────────────────────────────────────────────────────────────
      // SET UP EMAIL TRANSPORTER (initialized first so all 12 rules can use it)
      // ─────────────────────────────────────────────────────────────────────
      
      const user = gmailUser.value();
      const pass = gmailAppPassword.value();
      const fromName = gmailFromName.value() || 'Chris Lahage - Speedy Credit Repair';
      const replyTo = gmailReplyTo.value() || 'contact@speedycreditrepair.com';
      
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: { user, pass }
      });
      
      const emailConfig = {
        fromEmail: user,
        fromName: fromName,
        replyTo: replyTo
      };
      
      // ─────────────────────────────────────────────────────────────────────
      // FIND CONTACTS WHERE:
      // 1. enrollmentStatus = 'started' (not completed)
      // 2. abandonmentCheckAt < NOW (5 minutes have passed)
      // 3. abandonmentEmailSent = false (not already sent)
      // 4. abandonmentCancelled = false (enrollment didn't complete)
      // ─────────────────────────────────────────────────────────────────────
      
      const abandonedContactsSnapshot = await db.collection('contacts')
        .where('enrollmentStatus', '==', 'started')
        .where('abandonmentEmailSent', '==', false)
        .where('abandonmentCancelled', '==', false)
        .where('abandonmentCheckAt', '<=', nowTimestamp)
        .limit(50)  // Process max 50 per run to avoid timeout
        .get();
      
      console.log(`📊 Found ${abandonedContactsSnapshot.size} abandoned enrollments to process`);
      
      if (abandonedContactsSnapshot.empty) {
        console.log('✅ No abandoned enrollments to process — continuing to Rules 4-12...');
      }
      
      // ─────────────────────────────────────────────────────────────────────
      // PROCESS EACH ABANDONED CONTACT
      // ─────────────────────────────────────────────────────────────────────
      
      let processed = 0;
      let sent = 0;
      let failed = 0;
      
      for (const doc of abandonedContactsSnapshot.docs) {
        const contactId = doc.id;
        const contactData = doc.data();
        
        processed++;
        console.log(`📧 Processing ${processed}/${abandonedContactsSnapshot.size}: ${contactData.email}`);
        
        // Skip if no email
        if (!contactData.email) {
          console.log(`⏭️ Skipping ${contactId} - no email address`);
          continue;
        }
        
        // Skip if email opt-out
        if (contactData.emailOptIn === false) {
          console.log(`⏭️ Skipping ${contactId} - email opt-out`);
          await doc.ref.update({
            abandonmentEmailSent: true,  // Mark as "sent" to skip next time
            abandonmentSkipReason: 'email_opt_out',
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          continue;
        }
        
        // Send abandonment email using helper function
        try {
          const result = await operations.sendAbandonmentEmail(
            contactId,
            contactData,
            transporter,
            emailConfig
          );
          
          if (result.success) {
            sent++;
            console.log(`✅ Sent abandonment email to ${contactData.email}`);
            
            // ═══════════════════════════════════════════════════════════════
            // SMS ABANDONMENT RECOVERY via Telnyx
            // Sends a follow-up text message alongside the email for higher
            // recovery rates. Only fires if the contact has a phone number,
            // gave SMS consent (TCPA), and the Telnyx SMS secret is configured.
            // ═══════════════════════════════════════════════════════════════
            const contactPhone = contactData.phone || contactData.phones?.[0]?.number;
            if (contactPhone && contactData.smsConsent === true && telnyxApiKey.value() && telnyxSmsPhone.value()) {
              try {
                // Strip non-digits and format to E.164 (+1XXXXXXXXXX)
                const cleanPhone = contactPhone.replace(/\D/g, '');
                const formattedPhone = cleanPhone.length === 10
                  ? `+1${cleanPhone}`
                  : `+${cleanPhone}`;

                // Build the resume enrollment link for this contact
                const resumeLink = `https://myclevercrm.com/enroll?resume=${contactId}`;

                // Compose SMS — concise with clear CTA and TCPA opt-out
                const smsText = `Hi ${contactData.firstName || 'there'}! It's Chris from Speedy Credit Repair. Your free credit analysis is still waiting — pick up where you left off: ${resumeLink} Reply STOP to opt out.`;

                // Send via Telnyx REST API
                const smsResponse = await fetch('https://api.telnyx.com/v2/messages', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${telnyxApiKey.value()}`
                  },
                  body: JSON.stringify({
                    from: telnyxSmsPhone.value(),   // +17144755501 (Huntington Beach local)
                    to: formattedPhone,
                    text: smsText
                  })
                });

                if (smsResponse.ok) {
                  console.log(`📱 SMS abandonment recovery sent to ${formattedPhone}`);
                } else {
                  const smsErrorBody = await smsResponse.text();
                  console.warn(`⚠️ SMS API returned ${smsResponse.status} for ${contactId}: ${smsErrorBody}`);
                }

                // Record SMS delivery on the contact document
                await doc.ref.update({
                  abandonmentSmsSent: true,
                  abandonmentSmsSentAt: admin.firestore.FieldValue.serverTimestamp()
                });
              } catch (smsErr) {
                // SMS failure should never block the email flow
                console.warn(`⚠️ SMS failed for ${contactId}:`, smsErr.message);
              }
            }
          } else {
            failed++;
            console.error(`❌ Failed for ${contactData.email}: ${result.error}`);
          }
        } catch (emailError) {
          failed++;
          console.error(`❌ Error sending to ${contactData.email}:`, emailError.message);
          
          // Mark as sent to prevent retry loop, but log the error
          await doc.ref.update({
            abandonmentEmailSent: true,
            abandonmentEmailError: emailError.message,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
        }
        
        // Small delay between emails to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // ─────────────────────────────────────────────────────────────────────
      // LOG SUMMARY
      // ─────────────────────────────────────────────────────────────────────
      // ─────────────────────────────────────────────────────────────────────
      // PROCESS SCHEDULED EMAILS (ACH requests, contract follow-ups, etc.)
      // ─────────────────────────────────────────────────────────────────────
      
      console.log('\n📬 Processing scheduled emails...');
      
      const nowSchedule = admin.firestore.Timestamp.now();
      let scheduledSent = 0;
      let scheduledFailed = 0;
      
      const scheduledEmailsSnapshot = await db.collection('scheduledEmails')
        .where('status', '==', 'pending')
        .where('scheduledFor', '<=', nowSchedule)
        .limit(20)
        .get();
      
      console.log(`📊 Found ${scheduledEmailsSnapshot.size} scheduled emails to send`);
      
      for (const emailDoc of scheduledEmailsSnapshot.docs) {
        const scheduledEmail = emailDoc.data();
        
        try {
          if (scheduledEmail.type === 'ach_setup_request') {
            const { recipientEmail, recipientName, planName, monthlyAmount, portalUrl } = scheduledEmail.emailData;
            
            const achEmailHtml = EMAIL_TEMPLATES.achSetupRequest(
              { firstName: recipientName, id: scheduledEmail.contactId },
              planName,
              monthlyAmount,
              portalUrl
            );
            
            await transporter.sendMail({
              from: `"${gmailFromName.value() || 'Chris Lahage - Speedy Credit Repair'}" <${user}>`,
              to: recipientEmail,
              subject: `${recipientName}, set up your payment method to activate service`,
              html: achEmailHtml
            });
            
            // Update contact
            await db.collection('contacts').doc(scheduledEmail.contactId).update({
              achRequestSent: true,
              achRequestSentAt: admin.firestore.FieldValue.serverTimestamp()
            });
            
            console.log(`✅ ACH setup email sent to ${recipientEmail}`);
            scheduledSent++;
          }
          
          // Mark as sent
          await emailDoc.ref.update({
            status: 'sent',
            sentAt: admin.firestore.FieldValue.serverTimestamp()
          });
          
        } catch (scheduledEmailError) {
          console.error(`❌ Failed to send scheduled email ${emailDoc.id}:`, scheduledEmailError);
          scheduledFailed++;
          
          await emailDoc.ref.update({
            status: 'failed',
            error: scheduledEmailError.message,
            failedAt: admin.firestore.FieldValue.serverTimestamp()
          });
        }
      }
      
      console.log(`✅ Scheduled emails: ${scheduledSent} sent, ${scheduledFailed} failed`);
      
      // ─────────────────────────────────────────────────────────────────────
      // RULE 4: POST-ACH 30-DAY DRIP CAMPAIGN
      // Sends nurture emails on Days 1,3,7,14,25,30,35 after ACH completes
      // Also sends SMS on Days 1,7,30 if smsConsent + Telnyx configured
      // Creates call tasks for Chris on Days 14 and 30
      // ─────────────────────────────────────────────────────────────────────
      
      console.log('\n📬 Processing post-ACH drip campaign...');
      let dripSent = 0;
      let dripSmsSent = 0;
      let dripTasksCreated = 0;
      
      // Find active clients with ACH completed who haven't finished drip
      const dripEligibleSnapshot = await db.collection('contacts')
        .where('achAuthorized', '==', true)
        .where('dripCompleted', '==', false)
        .limit(100)
        .get();
      
      // Also check clients where dripCompleted doesn't exist yet
      let dripCandidates = dripEligibleSnapshot.docs;
      
      if (dripEligibleSnapshot.size < 100) {
        const dripMissingFieldSnapshot = await db.collection('contacts')
          .where('achAuthorized', '==', true)
          .limit(100)
          .get();
        
        // Filter to only those missing dripCompleted field
        const existingIds = new Set(dripCandidates.map(d => d.id));
        const additional = dripMissingFieldSnapshot.docs.filter(d => 
          !existingIds.has(d.id) && d.data().dripCompleted !== true
        );
        dripCandidates = [...dripCandidates, ...additional].slice(0, 100);
      }
      
      console.log(`📊 Found ${dripCandidates.length} ACH-complete clients to check for drip`);
      
      const DRIP_SCHEDULE = [
        { day: 1,  field: 'dripDay1Sent',  template: 'dripDay1Welcome',     sms: true,  task: false, smsMsg: (name) => `Hi ${name}! Chris from Speedy Credit Repair here. Your credit repair is officially underway! Check your email for your full roadmap. Questions? Call us anytime: 888-724-7344` },
        { day: 3,  field: 'dripDay3Sent',  template: 'dripDay3Education',    sms: false, task: false },
        { day: 7,  field: 'dripDay7Sent',  template: 'dripDay7CreditTips',   sms: true,  task: false, smsMsg: (name) => `${name}, quick tip from Speedy Credit Repair: While we handle your disputes, try to keep credit card balances below 30% of your limit. Small changes add up! Full tips in your email.` },
        { day: 14, field: 'dripDay14Sent', template: 'dripDay14Checkin',     sms: false, task: true,  taskTitle: '📞 Midpoint Check-in Call' },
        { day: 25, field: 'dripDay25Sent', template: 'dripDay25Anticipation', sms: false, task: false },
        { day: 30, field: 'dripDay30Sent', template: 'dripDay30BureauWindow', sms: true,  task: true,  taskTitle: '📞 30-Day Results Call', smsMsg: (name) => `${name}, it's Chris from Speedy Credit Repair. Your first dispute results should be arriving soon! Check your mail daily and forward any bureau letters to us. We'll call you soon with an update.` },
        { day: 35, field: 'dripDay35Sent', template: 'dripDay35NextRound',   sms: false, task: false }
      ];
      
      for (const contactDoc of dripCandidates) {
        const contact = contactDoc.data();
        const contactId = contactDoc.id;
        
        // Calculate days since ACH completed
        const achDate = contact.achCompletedAt?.toDate() || contact.achAuthorizedAt?.toDate();
        if (!achDate) continue;
        
        const daysSinceACH = Math.floor((now.getTime() - achDate.getTime()) / (1000 * 60 * 60 * 24));
        
        const recipientEmail = contact.email || contact.emails?.[0]?.address;
        if (!recipientEmail) continue;
        
        // If past day 35, mark drip as complete and skip
        if (daysSinceACH > 38) {
          if (!contact.dripCompleted) {
            await contactDoc.ref.update({ dripCompleted: true });
          }
          continue;
        }
        
        for (const step of DRIP_SCHEDULE) {
          // Skip if already sent or not time yet
          if (contact[step.field] || daysSinceACH < step.day) continue;
          
          // Only send if we're within the window (day to day+3)
          if (daysSinceACH > step.day + 3) {
            // Past the window — mark as sent to avoid stuck loops
            await contactDoc.ref.update({ [step.field]: true });
            continue;
          }
          
          try {
            // Send email
            const contactWithId = { ...contact, id: contactId };
            const emailHtml = EMAIL_TEMPLATES[step.template](contactWithId);
            
            // Extract subject from the template's createRichEmail call
            // The subject is embedded in the HTML <title> or we use a fallback
            const subjectMatch = emailHtml.match(/<title>(.*?)<\/title>/);
            const emailSubject = subjectMatch ? subjectMatch[1] : `Day ${step.day} Credit Repair Update — ${contact.firstName}`;
            
            await transporter.sendMail({
              from: `"${fromName}" <${user}>`,
              to: recipientEmail,
              subject: emailSubject,
              html: emailHtml
            });
            
            const updateData = {
              [step.field]: true,
              [`${step.field}At`]: admin.firestore.FieldValue.serverTimestamp()
            };
            
            // Send SMS if applicable
            if (step.sms && contact.smsConsent === true && contact.phone && telnyxApiKey.value() && telnyxSmsPhone.value()) {
              try {
                let smsPhone = (contact.phone || '').replace(/\D/g, '');
                if (smsPhone.length === 10) smsPhone = '+1' + smsPhone;
                else if (!smsPhone.startsWith('+')) smsPhone = '+' + smsPhone;
                
                const smsName = contact.firstName || 'there';
                
                await fetch('https://api.telnyx.com/v2/messages', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${telnyxApiKey.value()}` },
                  body: JSON.stringify({
                    from: telnyxSmsPhone.value(),
                    to: smsPhone,
                    text: step.smsMsg(smsName)
                  })
                });
                
                updateData[`${step.field}SmsSent`] = true;
                dripSmsSent++;
                console.log(`📱 Drip SMS Day ${step.day} sent to ${contactId}`);
              } catch (smsErr) {
                console.error(`⚠️ Drip SMS Day ${step.day} failed for ${contactId}:`, smsErr.message);
              }
            }
            
            // Create task if applicable
            if (step.task && step.taskTitle) {
              try {
                const taskDue = new Date();
                taskDue.setHours(10, 0, 0, 0); // Due at 10 AM today
                
                await db.collection('tasks').add({
                  title: `${step.taskTitle}: ${contact.firstName} ${contact.lastName || ''}`.trim(),
                  description: `Drip Day ${step.day} — Call client to check in.\n\nEmail: ${recipientEmail}\nPhone: ${contact.phone || 'N/A'}\nDays since ACH: ${daysSinceACH}\n\nCRM: https://myclevercrm.com/contacts/${contactId}`,
                  contactId: contactId,
                  status: 'pending',
                  priority: step.day === 30 ? 'high' : 'medium',
                  dueDate: admin.firestore.Timestamp.fromDate(taskDue),
                  createdAt: admin.firestore.FieldValue.serverTimestamp(),
                  createdBy: 'system:drip_campaign',
                  type: 'call'
                });
                dripTasksCreated++;
              } catch (taskErr) {
                console.error(`⚠️ Drip task failed for ${contactId}:`, taskErr.message);
              }
            }
            
            await contactDoc.ref.update(updateData);
            dripSent++;
            console.log(`✅ Drip Day ${step.day} email sent to ${contact.firstName} (${contactId})`);
            
            // Only send ONE drip email per contact per run
            break;
            
          } catch (dripError) {
            console.error(`❌ Drip Day ${step.day} failed for ${contactId}:`, dripError.message);
          }
        }
      }
      
      console.log(`✅ Drip campaign: ${dripSent} emails, ${dripSmsSent} SMS, ${dripTasksCreated} tasks`);
      
      // ─────────────────────────────────────────────────────────────────────
      // RULE 5: ACH NOT COMPLETED FOLLOW-UPS
      // Nudges contacts who signed contracts but haven't set up payment
      // 24 hours, 48 hours, 5 days after contract signing
      // ─────────────────────────────────────────────────────────────────────
      
      console.log('\n💳 Processing ACH follow-up reminders...');
      let achFollowUpsSent = 0;
      
      const achPendingSnapshot = await db.collection('contacts')
        .where('contractSigned', '==', true)
        .where('achAuthorized', '!=', true)
        .limit(100)
        .get();
      
      console.log(`📊 Found ${achPendingSnapshot.size} signed contracts without ACH`);
      
      for (const contactDoc of achPendingSnapshot.docs) {
        const contact = contactDoc.data();
        const contactId = contactDoc.id;
        
        // Skip if already marked as achAuthorized (belt and suspenders)
        if (contact.achAuthorized === true) continue;
        
        const contractDate = contact.contractSignedAt?.toDate() || contact.contractSigned?.toDate?.();
        if (!contractDate || !(contractDate instanceof Date) || isNaN(contractDate.getTime())) continue;
        
        const hoursSinceContract = (now.getTime() - contractDate.getTime()) / (1000 * 60 * 60);
        
        const recipientEmail = contact.email || contact.emails?.[0]?.address;
        if (!recipientEmail) continue;
        
        const portalUrl = SPEEDY_BRAND.portalUrl;
        
        try {
          // 24-hour reminder
          if (hoursSinceContract >= 24 && hoursSinceContract < 48 && !contact.achReminder24hSent) {
            const emailHtml = EMAIL_TEMPLATES.achReminder24h({ ...contact, id: contactId }, portalUrl);
            
            await transporter.sendMail({
              from: `"${fromName}" <${user}>`,
              to: recipientEmail,
              subject: `${contact.firstName}, just one quick step left to start your credit repair`,
              html: emailHtml
            });
            
            await contactDoc.ref.update({
              achReminder24hSent: true,
              achReminder24hSentAt: admin.firestore.FieldValue.serverTimestamp()
            });
            
            achFollowUpsSent++;
            console.log(`✅ ACH 24h reminder sent to ${contact.firstName} (${contactId})`);
          }
          
          // 48-hour reminder
          else if (hoursSinceContract >= 48 && hoursSinceContract < 120 && !contact.achReminder48hSent) {
            const emailHtml = EMAIL_TEMPLATES.achReminder48h({ ...contact, id: contactId }, portalUrl);
            
            await transporter.sendMail({
              from: `"${fromName}" <${user}>`,
              to: recipientEmail,
              subject: `⏰ ${contact.firstName}, your credit repair is on hold — quick action needed`,
              html: emailHtml
            });
            
            // Send SMS nudge if consent
            if (contact.smsConsent === true && contact.phone && telnyxApiKey.value() && telnyxSmsPhone.value()) {
              try {
                let smsPhone = (contact.phone || '').replace(/\D/g, '');
                if (smsPhone.length === 10) smsPhone = '+1' + smsPhone;
                else if (!smsPhone.startsWith('+')) smsPhone = '+' + smsPhone;
                
                await fetch('https://api.telnyx.com/v2/messages', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${telnyxApiKey.value()}` },
                  body: JSON.stringify({
                    from: telnyxSmsPhone.value(),
                    to: smsPhone,
                    text: `${contact.firstName}, your credit repair is on hold until payment is set up. It only takes 2 min! Complete it here or call us: 888-724-7344`
                  })
                });
                console.log(`📱 ACH 48h SMS sent to ${contactId}`);
              } catch (smsErr) {
                console.error(`⚠️ ACH 48h SMS failed:`, smsErr.message);
              }
            }
            
            await contactDoc.ref.update({
              achReminder48hSent: true,
              achReminder48hSentAt: admin.firestore.FieldValue.serverTimestamp()
            });
            
            achFollowUpsSent++;
            console.log(`✅ ACH 48h reminder sent to ${contact.firstName} (${contactId})`);
          }
          
          // 5-day final reminder
          else if (hoursSinceContract >= 120 && !contact.achReminderFinalSent) {
            const emailHtml = EMAIL_TEMPLATES.achReminderFinal({ ...contact, id: contactId }, portalUrl);
            
            await transporter.sendMail({
              from: `"${fromName}" <${user}>`,
              to: recipientEmail,
              subject: `${contact.firstName}, we're holding your spot — but need to hear from you`,
              html: emailHtml
            });
            
            // Create urgent task for Chris to personally call
            await db.collection('tasks').add({
              title: `🚨 ACH Missing 5+ Days: Call ${contact.firstName} ${contact.lastName || ''}`.trim(),
              description: `Contract signed but ACH not completed for 5+ days.\n\nEmail: ${recipientEmail}\nPhone: ${contact.phone || 'N/A'}\nContract signed: ${contractDate.toLocaleDateString()}\nHours since: ${Math.round(hoursSinceContract)}\n\nThis client may be having second thoughts. Personal call recommended.\n\nCRM: https://myclevercrm.com/contacts/${contactId}`,
              contactId: contactId,
              status: 'pending',
              priority: 'critical',
              dueDate: admin.firestore.Timestamp.fromDate(new Date()),
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
              createdBy: 'system:ach_followup',
              type: 'call'
            });
            
            await contactDoc.ref.update({
              achReminderFinalSent: true,
              achReminderFinalSentAt: admin.firestore.FieldValue.serverTimestamp()
            });
            
            achFollowUpsSent++;
            console.log(`✅ ACH FINAL reminder + task sent for ${contact.firstName} (${contactId})`);
          }
          
        } catch (achError) {
          console.error(`❌ ACH follow-up failed for ${contactId}:`, achError.message);
        }
      }
      
      console.log(`✅ ACH follow-ups sent: ${achFollowUpsSent}`);
      
      // ─────────────────────────────────────────────────────────────────────
      // RULE 6: IDIQ ENROLLMENT FAILURE RECOVERY
      // Sends client-facing email when IDIQ enrollment fails
      // Also sends SMS nudge if consent + creates recovery task
      // ─────────────────────────────────────────────────────────────────────
      
      console.log('\n🔧 Processing IDIQ enrollment failure recovery...');
      let idiqRecoverySent = 0;
      
      const idiqFailedSnapshot = await db.collection('contacts')
        .where('idiq.enrollmentStatus', '==', 'failed')
        .limit(50)
        .get();
      
      console.log(`📊 Found ${idiqFailedSnapshot.size} failed IDIQ enrollments to check`);
      
      for (const contactDoc of idiqFailedSnapshot.docs) {
        const contact = contactDoc.data();
        const contactId = contactDoc.id;
        
        // Skip if already sent recovery email
        if (contact.idiqFailureEmailSent === true) continue;
        
        const recipientEmail = contact.email || contact.emails?.[0]?.address;
        if (!recipientEmail) continue;
        
        try {
          const retryUrl = `${SPEEDY_BRAND.portalUrl}/complete-enrollment?contactId=${contactId}&retry=true`;
          
          const emailHtml = EMAIL_TEMPLATES.idiqEnrollmentFailed(
            { ...contact, id: contactId },
            retryUrl
          );
          
          await transporter.sendMail({
            from: `"${fromName}" <${user}>`,
            to: recipientEmail,
            subject: `${contact.firstName}, we hit a small snag — easy fix inside`,
            html: emailHtml
          });
          
          // SMS nudge if consent
          if (contact.smsConsent === true && contact.phone && telnyxApiKey.value() && telnyxSmsPhone.value()) {
            try {
              let smsPhone = (contact.phone || '').replace(/\D/g, '');
              if (smsPhone.length === 10) smsPhone = '+1' + smsPhone;
              else if (!smsPhone.startsWith('+')) smsPhone = '+' + smsPhone;
              
              await fetch('https://api.telnyx.com/v2/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${telnyxApiKey.value()}` },
                body: JSON.stringify({
                  from: telnyxSmsPhone.value(),
                  to: smsPhone,
                  text: `${contact.firstName}, your credit report enrollment needs a quick retry. Takes 30 seconds! Check your email for the link, or call us: 888-724-7344`
                })
              });
              console.log(`📱 IDIQ recovery SMS sent to ${contactId}`);
            } catch (smsErr) {
              console.error(`⚠️ IDIQ recovery SMS failed:`, smsErr.message);
            }
          }
          
          await contactDoc.ref.update({
            idiqFailureEmailSent: true,
            idiqFailureEmailSentAt: admin.firestore.FieldValue.serverTimestamp()
          });
          
          idiqRecoverySent++;
          console.log(`✅ IDIQ recovery email sent to ${contact.firstName} (${contactId})`);
          
        } catch (idiqError) {
          console.error(`❌ IDIQ recovery failed for ${contactId}:`, idiqError.message);
        }
      }
      
      console.log(`✅ IDIQ recovery emails sent: ${idiqRecoverySent}`);
      
      // ─────────────────────────────────────────────────────────────────────
      // RULE 7: DISPUTE RESULT NOTIFICATIONS
      // Sends celebration email for deletions, pivot strategy for no deletions,
      // and new round notification when disputes are filed
      // ─────────────────────────────────────────────────────────────────────
      
      console.log('\n📋 Processing dispute result notifications...');
      let disputeEmailsSent = 0;
      
      // 7A: DELETION CELEBRATIONS — contacts with recent deletions not yet celebrated
      const deletionSnapshot = await db.collection('contacts')
        .where('hasRecentDeletions', '==', true)
        .where('deletionCelebrationSent', '!=', true)
        .limit(50)
        .get();
      
      for (const contactDoc of deletionSnapshot.docs) {
        const contact = contactDoc.data();
        const contactId = contactDoc.id;
        if (contact.deletionCelebrationSent === true) continue;
        
        const recipientEmail = contact.email || contact.emails?.[0]?.address;
        if (!recipientEmail) continue;
        
        try {
          const emailHtml = EMAIL_TEMPLATES.disputeDeletionCelebration(
            { ...contact, id: contactId },
            {
              deletedCount: contact.recentDeletionCount || contact.totalItemsDeleted || 0,
              deletedItems: contact.recentDeletedItems || 'Negative items removed from your report',
              remainingItems: contact.remainingDisputeItems || 0
            }
          );
          
          await transporter.sendMail({
            from: `"${fromName}" <${user}>`,
            to: recipientEmail,
            subject: `🎉 ${contact.firstName}, negative items were REMOVED from your report!`,
            html: emailHtml
          });
          
          // Send celebration SMS if consent
          if (contact.smsConsent === true && contact.phone && telnyxApiKey.value() && telnyxSmsPhone.value()) {
            try {
              let smsPhone = (contact.phone || '').replace(/\D/g, '');
              if (smsPhone.length === 10) smsPhone = '+1' + smsPhone;
              else if (!smsPhone.startsWith('+')) smsPhone = '+' + smsPhone;
              
              await fetch('https://api.telnyx.com/v2/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${telnyxApiKey.value()}` },
                body: JSON.stringify({
                  from: telnyxSmsPhone.value(),
                  to: smsPhone,
                  text: `🎉 ${contact.firstName}, GREAT NEWS! ${contact.recentDeletionCount || 'Negative'} items were DELETED from your credit report! Check your email for full details. — Chris, Speedy Credit Repair`
                })
              });
            } catch (smsErr) {
              console.error(`⚠️ Deletion celebration SMS failed:`, smsErr.message);
            }
          }
          
          await contactDoc.ref.update({
            deletionCelebrationSent: true,
            deletionCelebrationSentAt: admin.firestore.FieldValue.serverTimestamp(),
            hasRecentDeletions: false // Reset flag for next round
          });
          
          disputeEmailsSent++;
          console.log(`✅ Deletion celebration sent to ${contact.firstName} (${contactId})`);
        } catch (err) {
          console.error(`❌ Deletion celebration failed for ${contactId}:`, err.message);
        }
      }
      
      // 7B: NO DELETIONS — STRATEGY PIVOT
      const noDeleteSnapshot = await db.collection('contacts')
        .where('hasRecentResults', '==', true)
        .where('recentDeletionCount', '==', 0)
        .where('noDeletePivotSent', '!=', true)
        .limit(50)
        .get();
      
      for (const contactDoc of noDeleteSnapshot.docs) {
        const contact = contactDoc.data();
        const contactId = contactDoc.id;
        if (contact.noDeletePivotSent === true) continue;
        
        const recipientEmail = contact.email || contact.emails?.[0]?.address;
        if (!recipientEmail) continue;
        
        try {
          const emailHtml = EMAIL_TEMPLATES.disputeNoDeletions(
            { ...contact, id: contactId },
            { roundNumber: contact.currentDisputeRound || 1 }
          );
          
          await transporter.sendMail({
            from: `"${fromName}" <${user}>`,
            to: recipientEmail,
            subject: `${contact.firstName}, your Round ${contact.currentDisputeRound || 1} results are in — here's our next move`,
            html: emailHtml
          });
          
          await contactDoc.ref.update({
            noDeletePivotSent: true,
            noDeletePivotSentAt: admin.firestore.FieldValue.serverTimestamp(),
            hasRecentResults: false
          });
          
          disputeEmailsSent++;
          console.log(`✅ No-deletion pivot sent to ${contact.firstName} (${contactId})`);
        } catch (err) {
          console.error(`❌ No-deletion pivot failed for ${contactId}:`, err.message);
        }
      }
      
      // 7C: NEW DISPUTE ROUND STARTING
      const newRoundSnapshot = await db.collection('contacts')
        .where('newRoundFiled', '==', true)
        .where('newRoundNotificationSent', '!=', true)
        .limit(50)
        .get();
      
      for (const contactDoc of newRoundSnapshot.docs) {
        const contact = contactDoc.data();
        const contactId = contactDoc.id;
        if (contact.newRoundNotificationSent === true) continue;
        
        const recipientEmail = contact.email || contact.emails?.[0]?.address;
        if (!recipientEmail) continue;
        
        try {
          const emailHtml = EMAIL_TEMPLATES.disputeNewRound(
            { ...contact, id: contactId },
            {
              roundNumber: contact.currentDisputeRound || 2,
              letterCount: contact.currentRoundLetterCount || 'Multiple',
              bureaus: contact.currentRoundBureaus || 'Experian, TransUnion, Equifax',
              itemsChallenged: contact.currentRoundItemCount || 'Multiple negative items',
              strategy: contact.currentRoundStrategy || 'Enhanced verification demands + direct creditor challenges'
            }
          );
          
          await transporter.sendMail({
            from: `"${fromName}" <${user}>`,
            to: recipientEmail,
            subject: `${contact.firstName}, Round ${contact.currentDisputeRound || 2} disputes are going out!`,
            html: emailHtml
          });
          
          await contactDoc.ref.update({
            newRoundNotificationSent: true,
            newRoundNotificationSentAt: admin.firestore.FieldValue.serverTimestamp(),
            newRoundFiled: false
          });
          
          disputeEmailsSent++;
          console.log(`✅ New round notification sent to ${contact.firstName} (${contactId})`);
        } catch (err) {
          console.error(`❌ New round notification failed for ${contactId}:`, err.message);
        }
      }
      
      console.log(`✅ Dispute notifications sent: ${disputeEmailsSent}`);
      
      // ─────────────────────────────────────────────────────────────────────
      // RULE 8: MONTHLY PROGRESS REPORTS
      // Sends once per month to active clients (role = 'client')
      // ─────────────────────────────────────────────────────────────────────
      
      console.log('\n📊 Processing monthly progress reports...');
      let monthlyReportsSent = 0;
      
      const activeClientsSnapshot = await db.collection('contacts')
        .where('role', '==', 'client')
        .where('serviceStatus', '==', 'active')
        .limit(100)
        .get();
      
      console.log(`📊 Found ${activeClientsSnapshot.size} active clients to check for monthly report`);
      
      for (const contactDoc of activeClientsSnapshot.docs) {
        const contact = contactDoc.data();
        const contactId = contactDoc.id;
        
        const recipientEmail = contact.email || contact.emails?.[0]?.address;
        if (!recipientEmail) continue;
        
        // Check if 30+ days since last monthly report (or never sent)
        const lastReport = contact.lastMonthlyReportSentAt?.toDate();
        if (lastReport) {
          const daysSinceReport = Math.floor((now.getTime() - lastReport.getTime()) / (1000 * 60 * 60 * 24));
          if (daysSinceReport < 28) continue; // Not due yet
        }
        
        // Calculate months active
        const serviceStartDate = contact.achCompletedAt?.toDate() || contact.serviceStartDate?.toDate() || contact.contractSignedAt?.toDate();
        const monthsActive = serviceStartDate ? Math.max(1, Math.floor((now.getTime() - serviceStartDate.getTime()) / (1000 * 60 * 60 * 24 * 30))) : 1;
        
        try {
          const emailHtml = EMAIL_TEMPLATES.monthlyProgressReport(
            { ...contact, id: contactId },
            {
              monthsActive: monthsActive,
              roundsCompleted: contact.totalDisputeRounds || contact.currentDisputeRound || 1,
              itemsChallenged: contact.totalItemsChallenged || '—',
              itemsDeleted: contact.totalItemsDeleted || '0',
              itemsPending: contact.pendingDisputeItems || '—',
              scoreChange: contact.scoreImprovement || null,
              nextSteps: contact.nextStepsDescription || 'We\'re continuing to work on your remaining items and preparing the next phase of your dispute strategy.'
            }
          );
          
          await transporter.sendMail({
            from: `"${fromName}" <${user}>`,
            to: recipientEmail,
            subject: `${contact.firstName}, your monthly credit repair progress report`,
            html: emailHtml
          });
          
          await contactDoc.ref.update({
            lastMonthlyReportSentAt: admin.firestore.FieldValue.serverTimestamp(),
            monthlyReportCount: admin.firestore.FieldValue.increment(1)
          });
          
          monthlyReportsSent++;
          console.log(`✅ Monthly report sent to ${contact.firstName} (${contactId})`);
        } catch (err) {
          console.error(`❌ Monthly report failed for ${contactId}:`, err.message);
        }
      }
      
      console.log(`✅ Monthly reports sent: ${monthlyReportsSent}`);
      
      // ─────────────────────────────────────────────────────────────────────
      // RULE 9: SCORE MILESTONE CELEBRATIONS
      // Triggers when creditScore crosses 600, 650, 700, or 750
      // ─────────────────────────────────────────────────────────────────────
      
      console.log('\n🏆 Processing score milestone celebrations...');
      let milestoneSent = 0;
      
      const MILESTONES = [600, 650, 700, 750];
      
      // Check active clients who have a credit score
      const scoredClientsSnapshot = await db.collection('contacts')
        .where('role', '==', 'client')
        .limit(200)
        .get();
      
      for (const contactDoc of scoredClientsSnapshot.docs) {
        const contact = contactDoc.data();
        const contactId = contactDoc.id;
        
        const currentScore = contact.creditScore || contact.currentCreditScore || 0;
        if (currentScore < 600) continue;
        
        const recipientEmail = contact.email || contact.emails?.[0]?.address;
        if (!recipientEmail) continue;
        
        // Find the highest milestone they've crossed
        const crossedMilestones = MILESTONES.filter(m => currentScore >= m);
        if (crossedMilestones.length === 0) continue;
        
        const highestMilestone = Math.max(...crossedMilestones);
        const milestoneField = `milestone${highestMilestone}Sent`;
        
        // Skip if already celebrated this milestone
        if (contact[milestoneField] === true) continue;
        
        try {
          const emailHtml = EMAIL_TEMPLATES.scoreMilestone(
            { ...contact, id: contactId },
            {
              milestone: highestMilestone,
              currentScore: currentScore,
              previousScore: contact.startingCreditScore || contact.initialCreditScore || null,
              pointsGained: contact.scoreImprovement || null
            }
          );
          
          await transporter.sendMail({
            from: `"${fromName}" <${user}>`,
            to: recipientEmail,
            subject: `🎉 ${contact.firstName}, you just crossed ${highestMilestone} — AMAZING!`,
            html: emailHtml
          });
          
          // Celebration SMS
          if (contact.smsConsent === true && contact.phone && telnyxApiKey.value() && telnyxSmsPhone.value()) {
            try {
              let smsPhone = (contact.phone || '').replace(/\D/g, '');
              if (smsPhone.length === 10) smsPhone = '+1' + smsPhone;
              else if (!smsPhone.startsWith('+')) smsPhone = '+' + smsPhone;
              
              await fetch('https://api.telnyx.com/v2/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${telnyxApiKey.value()}` },
                body: JSON.stringify({
                  from: telnyxSmsPhone.value(),
                  to: smsPhone,
                  text: `🎉 ${contact.firstName}, your credit score just crossed ${highestMilestone}! That's a huge milestone. Check your email for details on what this unlocks for you! — Chris, Speedy Credit Repair`
                })
              });
            } catch (smsErr) {
              console.error(`⚠️ Milestone SMS failed:`, smsErr.message);
            }
          }
          
          await contactDoc.ref.update({
            [milestoneField]: true,
            [`${milestoneField}At`]: admin.firestore.FieldValue.serverTimestamp()
          });
          
          milestoneSent++;
          console.log(`✅ Milestone ${highestMilestone} celebration sent to ${contact.firstName} (${contactId})`);
        } catch (err) {
          console.error(`❌ Milestone celebration failed for ${contactId}:`, err.message);
        }
      }
      
      console.log(`✅ Milestone celebrations sent: ${milestoneSent}`);
      
      // ─────────────────────────────────────────────────────────────────────
      // RULE 10: GRADUATION & POST-GRADUATION MAINTENANCE TIPS
      // Sends graduation email when serviceStatus = 'completed'
      // Sends maintenance tips 7 days later
      // ─────────────────────────────────────────────────────────────────────
      
      console.log('\n🎓 Processing graduation & maintenance emails...');
      let graduationSent = 0;
      
      const completedSnapshot = await db.collection('contacts')
        .where('serviceStatus', '==', 'completed')
        .limit(50)
        .get();
      
      console.log(`📊 Found ${completedSnapshot.size} completed-service clients to check`);
      
      for (const contactDoc of completedSnapshot.docs) {
        const contact = contactDoc.data();
        const contactId = contactDoc.id;
        
        const recipientEmail = contact.email || contact.emails?.[0]?.address;
        if (!recipientEmail) continue;
        
        try {
          // 10A: GRADUATION EMAIL (send once when service completes)
          if (!contact.graduationEmailSent) {
            const serviceStart = contact.achCompletedAt?.toDate() || contact.serviceStartDate?.toDate();
            const monthsActive = serviceStart ? Math.max(1, Math.floor((now.getTime() - serviceStart.getTime()) / (1000 * 60 * 60 * 24 * 30))) : null;
            
            const emailHtml = EMAIL_TEMPLATES.graduationComplete(
              { ...contact, id: contactId },
              {
                startScore: contact.startingCreditScore || contact.initialCreditScore || null,
                endScore: contact.creditScore || contact.currentCreditScore || null,
                totalItemsRemoved: contact.totalItemsDeleted || '—',
                totalRounds: contact.totalDisputeRounds || contact.currentDisputeRound || '—',
                monthsActive: monthsActive || '—'
              }
            );
            
            await transporter.sendMail({
              from: `"${fromName}" <${user}>`,
              to: recipientEmail,
              subject: `🎓 ${contact.firstName}, CONGRATULATIONS — your credit repair is complete!`,
              html: emailHtml
            });
            
            await contactDoc.ref.update({
              graduationEmailSent: true,
              graduationEmailSentAt: admin.firestore.FieldValue.serverTimestamp()
            });
            
            graduationSent++;
            console.log(`✅ Graduation email sent to ${contact.firstName} (${contactId})`);
            continue; // Don't send maintenance tips same run
          }
          
          // 10B: MAINTENANCE TIPS (7 days after graduation)
          if (contact.graduationEmailSent && !contact.maintenanceTipsSent) {
            const gradDate = contact.graduationEmailSentAt?.toDate();
            if (!gradDate) continue;
            
            const daysSinceGrad = Math.floor((now.getTime() - gradDate.getTime()) / (1000 * 60 * 60 * 24));
            if (daysSinceGrad < 7) continue;
            
            const emailHtml = EMAIL_TEMPLATES.postGraduationTips({ ...contact, id: contactId });
            
            await transporter.sendMail({
              from: `"${fromName}" <${user}>`,
              to: recipientEmail,
              subject: `${contact.firstName}, 7 tips to PROTECT your improved credit score`,
              html: emailHtml
            });
            
            await contactDoc.ref.update({
              maintenanceTipsSent: true,
              maintenanceTipsSentAt: admin.firestore.FieldValue.serverTimestamp()
            });
            
            graduationSent++;
            console.log(`✅ Maintenance tips sent to ${contact.firstName} (${contactId})`);
          }
          
        } catch (err) {
          console.error(`❌ Graduation/maintenance email failed for ${contactId}:`, err.message);
        }
      }
      
      console.log(`✅ Graduation/maintenance emails sent: ${graduationSent}`);
      
      // ─────────────────────────────────────────────────────────────────────
      // RULE 11: REVIEW REQUEST & REFERRAL INVITE & ANNIVERSARY CHECK-INS
      // 30 days post-grad → review request
      // 45 days post-grad → referral invite + SMS
      // 180 days post-service-start → 6-month check-in
      // 365 days post-service-start → 12-month re-engagement
      // ─────────────────────────────────────────────────────────────────────
      
      console.log('\n⭐ Processing reviews, referrals & anniversaries...');
      let growthEmailsSent = 0;
      
      // Re-use completedSnapshot from Rule 10 if still in scope, otherwise re-query
      const graduatedSnapshot = await db.collection('contacts')
        .where('graduationEmailSent', '==', true)
        .limit(100)
        .get();
      
      console.log(`📊 Found ${graduatedSnapshot.size} graduated clients to check for growth emails`);
      
      for (const contactDoc of graduatedSnapshot.docs) {
        const contact = contactDoc.data();
        const contactId = contactDoc.id;
        
        const recipientEmail = contact.email || contact.emails?.[0]?.address;
        if (!recipientEmail) continue;
        
        const gradDate = contact.graduationEmailSentAt?.toDate();
        if (!gradDate) continue;
        
        const daysSinceGrad = Math.floor((now.getTime() - gradDate.getTime()) / (1000 * 60 * 60 * 24));
        
        const serviceStart = contact.achCompletedAt?.toDate() || contact.serviceStartDate?.toDate() || contact.contractSignedAt?.toDate();
        const daysSinceStart = serviceStart ? Math.floor((now.getTime() - serviceStart.getTime()) / (1000 * 60 * 60 * 24)) : 0;
        
        try {
          // 11A: REVIEW REQUEST — 30 days after graduation
          if (daysSinceGrad >= 30 && daysSinceGrad < 45 && !contact.reviewRequestSent) {
            const emailHtml = EMAIL_TEMPLATES.reviewRequest({ ...contact, id: contactId });
            
            await transporter.sendMail({
              from: `"${fromName}" <${user}>`,
              to: recipientEmail,
              subject: `${contact.firstName}, would you share your experience? (takes 30 seconds)`,
              html: emailHtml
            });
            
            await contactDoc.ref.update({
              reviewRequestSent: true,
              reviewRequestSentAt: admin.firestore.FieldValue.serverTimestamp()
            });
            
            growthEmailsSent++;
            console.log(`✅ Review request sent to ${contact.firstName} (${contactId})`);
            continue; // One email per contact per run
          }
          
          // 11B: REFERRAL INVITE — 45 days after graduation
          if (daysSinceGrad >= 45 && !contact.referralInviteSent) {
            const emailHtml = EMAIL_TEMPLATES.referralInvite({ ...contact, id: contactId });
            
            await transporter.sendMail({
              from: `"${fromName}" <${user}>`,
              to: recipientEmail,
              subject: `${contact.firstName}, earn rewards by helping someone you know fix their credit`,
              html: emailHtml
            });
            
            // Referral SMS
            if (contact.smsConsent === true && contact.phone && telnyxApiKey.value() && telnyxSmsPhone.value()) {
              try {
                let smsPhone = (contact.phone || '').replace(/\D/g, '');
                if (smsPhone.length === 10) smsPhone = '+1' + smsPhone;
                else if (!smsPhone.startsWith('+')) smsPhone = '+' + smsPhone;
                
                await fetch('https://api.telnyx.com/v2/messages', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${telnyxApiKey.value()}` },
                  body: JSON.stringify({
                    from: telnyxSmsPhone.value(),
                    to: smsPhone,
                    text: `${contact.firstName}, know someone struggling with credit? Refer them to Speedy Credit Repair and earn a thank-you reward! Have them call 888-724-7344 and mention your name. — Chris`
                  })
                });
              } catch (smsErr) {
                console.error(`⚠️ Referral SMS failed:`, smsErr.message);
              }
            }
            
            await contactDoc.ref.update({
              referralInviteSent: true,
              referralInviteSentAt: admin.firestore.FieldValue.serverTimestamp()
            });
            
            growthEmailsSent++;
            console.log(`✅ Referral invite sent to ${contact.firstName} (${contactId})`);
            continue;
          }
          
          // 11C: 6-MONTH ANNIVERSARY CHECK-IN
          if (daysSinceStart >= 180 && daysSinceStart < 365 && !contact.anniversary6moSent) {
            const emailHtml = EMAIL_TEMPLATES.anniversaryCheckIn6Mo({ ...contact, id: contactId });
            
            await transporter.sendMail({
              from: `"${fromName}" <${user}>`,
              to: recipientEmail,
              subject: `${contact.firstName}, it's been 6 months — how's your credit holding up?`,
              html: emailHtml
            });
            
            await contactDoc.ref.update({
              anniversary6moSent: true,
              anniversary6moSentAt: admin.firestore.FieldValue.serverTimestamp()
            });
            
            growthEmailsSent++;
            console.log(`✅ 6-month check-in sent to ${contact.firstName} (${contactId})`);
            continue;
          }
          
          // 11D: 12-MONTH RE-ENGAGEMENT
          if (daysSinceStart >= 365 && !contact.reEngagement12moSent) {
            const emailHtml = EMAIL_TEMPLATES.reEngagement12Mo({ ...contact, id: contactId });
            
            await transporter.sendMail({
              from: `"${fromName}" <${user}>`,
              to: recipientEmail,
              subject: `${contact.firstName}, it's been a year — let's make sure your credit is still strong`,
              html: emailHtml
            });
            
            await contactDoc.ref.update({
              reEngagement12moSent: true,
              reEngagement12moSentAt: admin.firestore.FieldValue.serverTimestamp()
            });
            
            growthEmailsSent++;
            console.log(`✅ 12-month re-engagement sent to ${contact.firstName} (${contactId})`);
          }
          
        } catch (err) {
          console.error(`❌ Growth email failed for ${contactId}:`, err.message);
        }
      }
      
      console.log(`✅ Growth emails sent: ${growthEmailsSent}`);
      
      // ─────────────────────────────────────────────────────────────────────
      // RULE 12: QUIZ LEAD NURTURE (24h + 72h follow-ups)
      // Follows up with quiz leads who haven't enrolled
      // Triggered by source = 'quiz' + no enrollmentStatus
      // ─────────────────────────────────────────────────────────────────────
      
      console.log('\n📝 Processing quiz lead nurture...');
      let quizNurtureSent = 0;
      
      const quizLeadsSnapshot = await db.collection('contacts')
        .where('source', '==', 'quiz')
        .where('enrollmentStatus', '==', null)
        .limit(50)
        .get();
      
      // Also check for quiz leads without enrollmentStatus field at all
      let quizCandidates = quizLeadsSnapshot.docs;
      
      if (quizLeadsSnapshot.size < 50) {
        const quizAllSnapshot = await db.collection('contacts')
          .where('source', '==', 'quiz')
          .limit(100)
          .get();
        
        const existingIds = new Set(quizCandidates.map(d => d.id));
        const additional = quizAllSnapshot.docs.filter(d => {
          if (existingIds.has(d.id)) return false;
          const data = d.data();
          return !data.enrollmentStatus || data.enrollmentStatus === 'not_started';
        });
        quizCandidates = [...quizCandidates, ...additional].slice(0, 100);
      }
      
      console.log(`📊 Found ${quizCandidates.length} quiz leads to check for nurture`);
      
      for (const contactDoc of quizCandidates) {
        const contact = contactDoc.data();
        const contactId = contactDoc.id;
        
        // Skip if they've already enrolled
        if (contact.enrollmentStatus === 'enrolled' || contact.enrollmentStatus === 'completed' || contact.enrollmentStatus === 'started') continue;
        
        const recipientEmail = contact.email || contact.emails?.[0]?.address;
        if (!recipientEmail) continue;
        
        const createdAt = contact.createdAt?.toDate();
        if (!createdAt) continue;
        
        const hoursSinceQuiz = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
        
        try {
          // 12A: 24-HOUR QUIZ NURTURE
          if (hoursSinceQuiz >= 24 && hoursSinceQuiz < 72 && !contact.quizNurture24hSent) {
            const emailHtml = EMAIL_TEMPLATES.quizNurture24h(
              { ...contact, id: contactId },
              {
                creditGoal: contact.quizCreditGoal || contact.creditGoal || 'Improve credit score',
                scoreRange: contact.quizScoreRange || contact.scoreRange || 'Not specified',
                negativeItems: contact.quizNegativeItems || contact.negativeItems || 'Multiple items reported'
              }
            );
            
            await transporter.sendMail({
              from: `"${fromName}" <${user}>`,
              to: recipientEmail,
              subject: `${contact.firstName}, your credit assessment results + a personal note`,
              html: emailHtml
            });
            
            await contactDoc.ref.update({
              quizNurture24hSent: true,
              quizNurture24hSentAt: admin.firestore.FieldValue.serverTimestamp()
            });
            
            quizNurtureSent++;
            console.log(`✅ Quiz 24h nurture sent to ${contact.firstName} (${contactId})`);
          }
          
          // 12B: 72-HOUR QUIZ URGENCY
          else if (hoursSinceQuiz >= 72 && !contact.quizUrgency72hSent) {
            const emailHtml = EMAIL_TEMPLATES.quizUrgency72h(
              { ...contact, id: contactId },
              {
                creditGoal: contact.quizCreditGoal || contact.creditGoal || 'Improve credit score',
                scoreRange: contact.quizScoreRange || contact.scoreRange || 'Not specified',
                negativeItems: contact.quizNegativeItems || contact.negativeItems || 'Multiple items reported'
              }
            );
            
            await transporter.sendMail({
              from: `"${fromName}" <${user}>`,
              to: recipientEmail,
              subject: `${contact.firstName}, quick question about your credit goals`,
              html: emailHtml
            });
            
            // Urgency SMS
            if (contact.smsConsent === true && contact.phone && telnyxApiKey.value() && telnyxSmsPhone.value()) {
              try {
                let smsPhone = (contact.phone || '').replace(/\D/g, '');
                if (smsPhone.length === 10) smsPhone = '+1' + smsPhone;
                else if (!smsPhone.startsWith('+')) smsPhone = '+' + smsPhone;
                
                await fetch('https://api.telnyx.com/v2/messages', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${telnyxApiKey.value()}` },
                  body: JSON.stringify({
                    from: telnyxSmsPhone.value(),
                    to: smsPhone,
                    text: `${contact.firstName}, you took our credit quiz a few days ago — have you started your free credit report yet? It takes 5 min and won't affect your score. Questions? Call Chris: 888-724-7344`
                  })
                });
              } catch (smsErr) {
                console.error(`⚠️ Quiz urgency SMS failed:`, smsErr.message);
              }
            }
            
            await contactDoc.ref.update({
              quizUrgency72hSent: true,
              quizUrgency72hSentAt: admin.firestore.FieldValue.serverTimestamp()
            });
            
            quizNurtureSent++;
            console.log(`✅ Quiz 72h urgency sent to ${contact.firstName} (${contactId})`);
          }
          
        } catch (err) {
          console.error(`❌ Quiz nurture failed for ${contactId}:`, err.message);
        }
      }
      
      console.log(`✅ Quiz nurture emails sent: ${quizNurtureSent}`);
      
      // ─────────────────────────────────────────────────────────────────────
      // RULE 13: UNIVERSAL LEAD NURTURE DRIP (ALL NON-QUIZ SOURCES)
      // ─────────────────────────────────────────────────────────────────────
      // Sends timed nurture emails to ALL leads who received a welcome email
      // but haven't started enrollment. Uses templates from emailTemplates.js
      // which already have enrollment links, branding, and personalization.
      //
      // AI PHONE leads get: 4h → 24h → 48h → 7d (4 emails)
      // WEB/OTHER leads get: 12h → 24h → 48h → 7d → 14d (5 emails)
      //
      // Each step has its own sent flag to prevent duplicates.
      // Quiz leads are EXCLUDED (handled by Rule 12 above).
      // ─────────────────────────────────────────────────────────────────────
      
      console.log('\n📬 Processing universal lead nurture drip...');
      let leadNurtureSent = 0;
      let leadNurtureSmsSent = 0;
      
      // ===== QUERY: Contacts who got welcome email but haven't enrolled =====
      // leadWelcomeEmailSent: true means they entered the system and got Priority #1 email
      const nurtureSnapshot = await db.collection('contacts')
        .where('leadWelcomeEmailSent', '==', true)
        .limit(100)
        .get();
      
      console.log(`📊 Found ${nurtureSnapshot.size} contacts with welcome email sent — checking for nurture eligibility`);
      
      for (const contactDoc of nurtureSnapshot.docs) {
        const contact = contactDoc.data();
        const contactId = contactDoc.id;
        
        // ===== SKIP: Already enrolled or enrolling =====
        const enrollStatus = contact.enrollmentStatus || 'not_started';
        if (enrollStatus === 'enrolled' || enrollStatus === 'completed' || enrollStatus === 'started') continue;
        
        // ===== SKIP: Quiz leads (handled by Rule 12) =====
        const contactSource = (contact.source || contact.leadSource || 'manual').toLowerCase();
        if (contactSource === 'quiz') continue;
        
        // ===== SKIP: No email address =====
        const recipientEmail = contact.email || contact.emails?.[0]?.address;
        if (!recipientEmail) continue;
        
        // ===== SKIP: Contact opted out of emails =====
        if (contact.emailOptOut === true || contact.unsubscribed === true) continue;
        
        // ===== CALCULATE: Hours since contact was created =====
        const createdAt = contact.createdAt?.toDate?.() || contact.leadWelcomeEmailSentAt?.toDate?.();
        if (!createdAt) continue;
        
        const hoursSinceCreated = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
        
        // ===== DETERMINE: Is this an AI phone lead or web/other? =====
        const isAIPhoneLead = (contactSource === 'ai_receptionist' || contactSource === 'ai_phone' || contactSource === 'phone_call');
        
        // ===== TEMPLATE DATA: Same format used by all emailTemplates.js templates =====
        const templateData = {
          firstName: contact.firstName || 'there',
          lastName: contact.lastName || '',
          name: `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'there',
          email: recipientEmail,
          phone: contact.phone || contact.phones?.[0]?.number || '',
          contactId: contactId,
          leadScore: contact.leadScore || 5,
          sentiment: contact.aiTracking?.sentiment || { description: 'neutral' },
          source: contactSource
        };
        
        try {
          const { getEmailTemplate } = require('./emailTemplates');
          
          // ═══════════════════════════════════════════════════════════════════
          // AI PHONE LEAD NURTURE SEQUENCE (4h → 24h → 48h → 7d)
          // ═══════════════════════════════════════════════════════════════════
          if (isAIPhoneLead) {
            
            // 13A-AI: 4-HOUR REMINDER — "Your analysis is still waiting"
            if (hoursSinceCreated >= 4 && hoursSinceCreated < 24 && !contact.nurtureDrip4hSent) {
              const emailContent = getEmailTemplate('ai-report-reminder-4h', templateData);
              
              await transporter.sendMail({
                from: `"${fromName}" <${user}>`,
                replyTo: replyTo,
                to: recipientEmail,
                subject: emailContent.subject,
                html: emailContent.html
              });
              
              await contactDoc.ref.update({
                nurtureDrip4hSent: true,
                nurtureDrip4hSentAt: admin.firestore.FieldValue.serverTimestamp(),
                lastNurtureEmailAt: admin.firestore.FieldValue.serverTimestamp(),
                nurtureEmailCount: (contact.nurtureEmailCount || 0) + 1
              });
              
              // ===== LOG to emailLog =====
              await db.collection('emailLog').add({
                contactId, recipientEmail, templateId: 'ai-report-reminder-4h',
                subject: emailContent.subject, type: 'lead_nurture_drip',
                dripStep: '4h', source: contactSource,
                sentAt: admin.firestore.FieldValue.serverTimestamp(),
                status: 'sent', opened: false, clicked: false, converted: false
              });
              
              leadNurtureSent++;
              console.log(`✅ AI 4h nurture sent to ${contact.firstName} (${contactId})`);
              continue; // One email per contact per run
            }
            
            // 13B-AI: 24-HOUR HELP OFFER — "Is there anything I can help with?"
            if (hoursSinceCreated >= 24 && hoursSinceCreated < 48 && !contact.nurtureDrip24hSent) {
              const emailContent = getEmailTemplate('ai-help-offer-24h', templateData);
              
              await transporter.sendMail({
                from: `"${fromName}" <${user}>`,
                replyTo: replyTo,
                to: recipientEmail,
                subject: emailContent.subject,
                html: emailContent.html
              });
              
              await contactDoc.ref.update({
                nurtureDrip24hSent: true,
                nurtureDrip24hSentAt: admin.firestore.FieldValue.serverTimestamp(),
                lastNurtureEmailAt: admin.firestore.FieldValue.serverTimestamp(),
                nurtureEmailCount: (contact.nurtureEmailCount || 0) + 1
              });
              
              await db.collection('emailLog').add({
                contactId, recipientEmail, templateId: 'ai-help-offer-24h',
                subject: emailContent.subject, type: 'lead_nurture_drip',
                dripStep: '24h', source: contactSource,
                sentAt: admin.firestore.FieldValue.serverTimestamp(),
                status: 'sent', opened: false, clicked: false, converted: false
              });
              
              leadNurtureSent++;
              console.log(`✅ AI 24h nurture sent to ${contact.firstName} (${contactId})`);
              continue;
            }
            
            // 13C-AI: 48-HOUR REPORT READY — "Your report is ready and waiting"
            if (hoursSinceCreated >= 48 && hoursSinceCreated < (7 * 24) && !contact.nurtureDrip48hSent) {
              const emailContent = getEmailTemplate('ai-report-ready-48h', templateData);
              
              await transporter.sendMail({
                from: `"${fromName}" <${user}>`,
                replyTo: replyTo,
                to: recipientEmail,
                subject: emailContent.subject,
                html: emailContent.html
              });
              
              // ===== SMS at 48h for AI phone leads (they gave their phone number) =====
              if (contact.smsConsent !== false && contact.phone && telnyxApiKey.value() && telnyxSmsPhone.value()) {
                try {
                  let smsPhone = (contact.phone || '').replace(/\D/g, '');
                  if (smsPhone.length === 10) smsPhone = '+1' + smsPhone;
                  else if (!smsPhone.startsWith('+')) smsPhone = '+' + smsPhone;
                  
                  await fetch('https://api.telnyx.com/v2/messages', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${telnyxApiKey.value()}` },
                    body: JSON.stringify({
                      from: telnyxSmsPhone.value(),
                      to: smsPhone,
                      text: `Hi ${contact.firstName}, it's Chris from Speedy Credit Repair. Your free credit analysis is still waiting — takes just 5 min. Start here: https://myclevercrm.com/complete-enrollment?contactId=${contactId}&source=sms-48h`
                    })
                  });
                  leadNurtureSmsSent++;
                  console.log(`📱 48h SMS sent to ${contact.firstName}`);
                } catch (smsErr) {
                  console.error(`⚠️ 48h SMS failed for ${contactId}:`, smsErr.message);
                }
              }
              
              await contactDoc.ref.update({
                nurtureDrip48hSent: true,
                nurtureDrip48hSentAt: admin.firestore.FieldValue.serverTimestamp(),
                lastNurtureEmailAt: admin.firestore.FieldValue.serverTimestamp(),
                nurtureEmailCount: (contact.nurtureEmailCount || 0) + 1
              });
              
              await db.collection('emailLog').add({
                contactId, recipientEmail, templateId: 'ai-report-ready-48h',
                subject: emailContent.subject, type: 'lead_nurture_drip',
                dripStep: '48h', source: contactSource,
                sentAt: admin.firestore.FieldValue.serverTimestamp(),
                status: 'sent', opened: false, clicked: false, converted: false
              });
              
              leadNurtureSent++;
              console.log(`✅ AI 48h nurture sent to ${contact.firstName} (${contactId})`);
              continue;
            }
            
            // 13D-AI: 7-DAY FINAL ATTEMPT — Last chance before going cold
            if (hoursSinceCreated >= (7 * 24) && !contact.nurtureDripFinalSent) {
              const emailContent = getEmailTemplate('final-attempt', templateData);
              
              await transporter.sendMail({
                from: `"${fromName}" <${user}>`,
                replyTo: replyTo,
                to: recipientEmail,
                subject: emailContent.subject,
                html: emailContent.html
              });
              
              await contactDoc.ref.update({
                nurtureDripFinalSent: true,
                nurtureDripFinalSentAt: admin.firestore.FieldValue.serverTimestamp(),
                lastNurtureEmailAt: admin.firestore.FieldValue.serverTimestamp(),
                nurtureEmailCount: (contact.nurtureEmailCount || 0) + 1,
                nurtureDripCompleted: true,
                leadTemperature: 'cold' // Mark as cold after final attempt
              });
              
              await db.collection('emailLog').add({
                contactId, recipientEmail, templateId: 'final-attempt',
                subject: emailContent.subject, type: 'lead_nurture_drip',
                dripStep: '7d-final', source: contactSource,
                sentAt: admin.firestore.FieldValue.serverTimestamp(),
                status: 'sent', opened: false, clicked: false, converted: false
              });
              
              leadNurtureSent++;
              console.log(`✅ AI 7d final attempt sent to ${contact.firstName} (${contactId})`);
              continue;
            }
            
          // ═══════════════════════════════════════════════════════════════════
          // WEB / OTHER SOURCE NURTURE SEQUENCE (12h → 24h → 48h → 7d → 14d)
          // ═══════════════════════════════════════════════════════════════════
          } else {
            
            // 13A-WEB: 12-HOUR VALUE ADD — "Why credit repair matters"
            if (hoursSinceCreated >= 12 && hoursSinceCreated < 24 && !contact.nurtureDrip12hSent) {
              const emailContent = getEmailTemplate('web-value-add-12h', templateData);
              
              await transporter.sendMail({
                from: `"${fromName}" <${user}>`,
                replyTo: replyTo,
                to: recipientEmail,
                subject: emailContent.subject,
                html: emailContent.html
              });
              
              await contactDoc.ref.update({
                nurtureDrip12hSent: true,
                nurtureDrip12hSentAt: admin.firestore.FieldValue.serverTimestamp(),
                lastNurtureEmailAt: admin.firestore.FieldValue.serverTimestamp(),
                nurtureEmailCount: (contact.nurtureEmailCount || 0) + 1
              });
              
              await db.collection('emailLog').add({
                contactId, recipientEmail, templateId: 'web-value-add-12h',
                subject: emailContent.subject, type: 'lead_nurture_drip',
                dripStep: '12h', source: contactSource,
                sentAt: admin.firestore.FieldValue.serverTimestamp(),
                status: 'sent', opened: false, clicked: false, converted: false
              });
              
              leadNurtureSent++;
              console.log(`✅ Web 12h nurture sent to ${contact.firstName} (${contactId})`);
              continue;
            }
            
            // 13B-WEB: 24-HOUR SOCIAL PROOF — Testimonials + reviews
            if (hoursSinceCreated >= 24 && hoursSinceCreated < 48 && !contact.nurtureDrip24hSent) {
              const emailContent = getEmailTemplate('web-social-proof-24h', templateData);
              
              await transporter.sendMail({
                from: `"${fromName}" <${user}>`,
                replyTo: replyTo,
                to: recipientEmail,
                subject: emailContent.subject,
                html: emailContent.html
              });
              
              await contactDoc.ref.update({
                nurtureDrip24hSent: true,
                nurtureDrip24hSentAt: admin.firestore.FieldValue.serverTimestamp(),
                lastNurtureEmailAt: admin.firestore.FieldValue.serverTimestamp(),
                nurtureEmailCount: (contact.nurtureEmailCount || 0) + 1
              });
              
              await db.collection('emailLog').add({
                contactId, recipientEmail, templateId: 'web-social-proof-24h',
                subject: emailContent.subject, type: 'lead_nurture_drip',
                dripStep: '24h', source: contactSource,
                sentAt: admin.firestore.FieldValue.serverTimestamp(),
                status: 'sent', opened: false, clicked: false, converted: false
              });
              
              leadNurtureSent++;
              console.log(`✅ Web 24h nurture sent to ${contact.firstName} (${contactId})`);
              continue;
            }
            
            // 13C-WEB: 48-HOUR CONSULTATION OFFER — Free consultation CTA
            if (hoursSinceCreated >= 48 && hoursSinceCreated < (7 * 24) && !contact.nurtureDrip48hSent) {
              const emailContent = getEmailTemplate('web-consultation-48h', templateData);
              
              await transporter.sendMail({
                from: `"${fromName}" <${user}>`,
                replyTo: replyTo,
                to: recipientEmail,
                subject: emailContent.subject,
                html: emailContent.html
              });
              
              await contactDoc.ref.update({
                nurtureDrip48hSent: true,
                nurtureDrip48hSentAt: admin.firestore.FieldValue.serverTimestamp(),
                lastNurtureEmailAt: admin.firestore.FieldValue.serverTimestamp(),
                nurtureEmailCount: (contact.nurtureEmailCount || 0) + 1
              });
              
              await db.collection('emailLog').add({
                contactId, recipientEmail, templateId: 'web-consultation-48h',
                subject: emailContent.subject, type: 'lead_nurture_drip',
                dripStep: '48h', source: contactSource,
                sentAt: admin.firestore.FieldValue.serverTimestamp(),
                status: 'sent', opened: false, clicked: false, converted: false
              });
              
              leadNurtureSent++;
              console.log(`✅ Web 48h nurture sent to ${contact.firstName} (${contactId})`);
              continue;
            }
            
            // 13D-WEB: 7-DAY FINAL ATTEMPT — Last chance with urgency
            if (hoursSinceCreated >= (7 * 24) && hoursSinceCreated < (14 * 24) && !contact.nurtureDripFinalSent) {
              const emailContent = getEmailTemplate('final-attempt', templateData);
              
              await transporter.sendMail({
                from: `"${fromName}" <${user}>`,
                replyTo: replyTo,
                to: recipientEmail,
                subject: emailContent.subject,
                html: emailContent.html
              });
              
              // ===== SMS at 7 days for web leads with phone =====
              if (contact.smsConsent !== false && contact.phone && telnyxApiKey.value() && telnyxSmsPhone.value()) {
                try {
                  let smsPhone = (contact.phone || '').replace(/\D/g, '');
                  if (smsPhone.length === 10) smsPhone = '+1' + smsPhone;
                  else if (!smsPhone.startsWith('+')) smsPhone = '+' + smsPhone;
                  
                  await fetch('https://api.telnyx.com/v2/messages', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${telnyxApiKey.value()}` },
                    body: JSON.stringify({
                      from: telnyxSmsPhone.value(),
                      to: smsPhone,
                      text: `Hi ${contact.firstName}, Chris here from Speedy Credit Repair. We've been trying to reach you about your free credit analysis. Still interested? Takes 5 min: https://myclevercrm.com/complete-enrollment?contactId=${contactId}&source=sms-7d`
                    })
                  });
                  leadNurtureSmsSent++;
                  console.log(`📱 7d SMS sent to ${contact.firstName}`);
                } catch (smsErr) {
                  console.error(`⚠️ 7d SMS failed for ${contactId}:`, smsErr.message);
                }
              }
              
              await contactDoc.ref.update({
                nurtureDripFinalSent: true,
                nurtureDripFinalSentAt: admin.firestore.FieldValue.serverTimestamp(),
                lastNurtureEmailAt: admin.firestore.FieldValue.serverTimestamp(),
                nurtureEmailCount: (contact.nurtureEmailCount || 0) + 1
              });
              
              await db.collection('emailLog').add({
                contactId, recipientEmail, templateId: 'final-attempt',
                subject: emailContent.subject, type: 'lead_nurture_drip',
                dripStep: '7d-final', source: contactSource,
                sentAt: admin.firestore.FieldValue.serverTimestamp(),
                status: 'sent', opened: false, clicked: false, converted: false
              });
              
              leadNurtureSent++;
              console.log(`✅ Web 7d final attempt sent to ${contact.firstName} (${contactId})`);
              continue;
            }
            
            // 13E-WEB: 14-DAY EDUCATIONAL RE-ENGAGEMENT — Educational value (last email)
            if (hoursSinceCreated >= (14 * 24) && !contact.nurtureDripEducationalSent) {
              const emailContent = getEmailTemplate('educational-tip', templateData);
              
              await transporter.sendMail({
                from: `"${fromName}" <${user}>`,
                replyTo: replyTo,
                to: recipientEmail,
                subject: emailContent.subject,
                html: emailContent.html
              });
              
              await contactDoc.ref.update({
                nurtureDripEducationalSent: true,
                nurtureDripEducationalSentAt: admin.firestore.FieldValue.serverTimestamp(),
                lastNurtureEmailAt: admin.firestore.FieldValue.serverTimestamp(),
                nurtureEmailCount: (contact.nurtureEmailCount || 0) + 1,
                nurtureDripCompleted: true,
                leadTemperature: 'cold' // Mark as cold after all attempts exhausted
              });
              
              await db.collection('emailLog').add({
                contactId, recipientEmail, templateId: 'educational-tip',
                subject: emailContent.subject, type: 'lead_nurture_drip',
                dripStep: '14d-educational', source: contactSource,
                sentAt: admin.firestore.FieldValue.serverTimestamp(),
                status: 'sent', opened: false, clicked: false, converted: false
              });
              
              leadNurtureSent++;
              console.log(`✅ Web 14d educational sent to ${contact.firstName} (${contactId}) — drip complete`);
              continue;
            }
          }
          
        } catch (err) {
          console.error(`❌ Lead nurture failed for ${contactId}:`, err.message);
        }
      }
      
      console.log(`✅ Lead nurture drip: ${leadNurtureSent} emails, ${leadNurtureSmsSent} SMS sent`);
      
      // ─────────────────────────────────────────────────────────────────────
      // RULE 14: DOCUMENT UPLOAD REMINDER (24h after enrollment)
      // ─────────────────────────────────────────────────────────────────────
      // Clients who enrolled and got the initial document request email
      // but haven't uploaded documents within 24 hours get a gentle nudge.
      // Uses the existing documentUploadRequest template with reminder subject.
      // ─────────────────────────────────────────────────────────────────────
      
      console.log('\n📄 Processing document upload reminders...');
      let docRemindersSent = 0;
      
      const docReminderSnapshot = await db.collection('contacts')
        .where('documentRequestSent', '==', true)
        .limit(100)
        .get();
      
      console.log(`📊 Found ${docReminderSnapshot.size} contacts with document request sent — checking for reminder eligibility`);
      
      for (const contactDoc of docReminderSnapshot.docs) {
        const contact = contactDoc.data();
        const contactId = contactDoc.id;
        
        // ===== SKIP: Already sent reminder =====
        if (contact.documentReminderSent === true) continue;
        
        // ===== SKIP: Already uploaded documents =====
        if (contact.documentsUploaded === true || contact.documentsComplete === true) continue;
        
        // ===== SKIP: No email =====
        const recipientEmail = contact.email || contact.emails?.[0]?.address;
        if (!recipientEmail) continue;
        
        // ===== SKIP: Opted out =====
        if (contact.emailOptOut === true || contact.unsubscribed === true) continue;
        
        // ===== CHECK: Has it been 24+ hours since document request was sent? =====
        const docRequestSentAt = contact.documentRequestSentAt?.toDate?.();
        if (!docRequestSentAt) continue;
        
        const hoursSinceDocRequest = (now.getTime() - docRequestSentAt.getTime()) / (1000 * 60 * 60);
        if (hoursSinceDocRequest < 24 || hoursSinceDocRequest > (7 * 24)) continue; // 24h to 7d window
        
        // ===== CHECK: Do they actually have docs in clientDocuments? =====
        // Quick subcollection check — if they have any docs, skip
        try {
          const docsCheck = await db.collection('contacts').doc(contactId)
            .collection('clientDocuments').limit(1).get();
          if (!docsCheck.empty) {
            // They have docs — mark and skip
            await contactDoc.ref.update({ documentsUploaded: true });
            continue;
          }
        } catch (subErr) {
          // Subcollection might not exist — that's fine, means no docs
        }
        
        try {
          const portalUrl = 'https://myclevercrm.com';
          const reminderHtml = EMAIL_TEMPLATES.documentUploadRequest(
            { ...contact, id: contactId },
            portalUrl
          );
          
          await transporter.sendMail({
            from: `"${fromName}" <${user}>`,
            to: recipientEmail,
            subject: `Friendly reminder, ${contact.firstName} — a few optional documents to speed things up`,
            html: reminderHtml
          });
          
          await contactDoc.ref.update({
            documentReminderSent: true,
            documentReminderSentAt: admin.firestore.FieldValue.serverTimestamp(),
            // ===== Timeline entry =====
            timeline: admin.firestore.FieldValue.arrayUnion({
              id: Date.now(),
              type: 'email_sent',
              description: 'Document upload reminder sent (24h post-enrollment)',
              timestamp: new Date().toISOString(),
              metadata: { templateId: 'documentUploadRequest-reminder' },
              source: 'system'
            })
          });
          
          await db.collection('emailLog').add({
            contactId, recipientEmail, templateId: 'documentUploadRequest-reminder',
            subject: `Friendly reminder, ${contact.firstName} — a few optional documents to speed things up`,
            type: 'document_reminder',
            sentAt: admin.firestore.FieldValue.serverTimestamp(),
            status: 'sent', opened: false, clicked: false, converted: false
          });
          
          docRemindersSent++;
          console.log(`✅ Doc reminder sent to ${contact.firstName} (${contactId})`);
          
        } catch (err) {
          console.error(`❌ Doc reminder failed for ${contactId}:`, err.message);
        }
      }
      
      console.log(`✅ Document reminders sent: ${docRemindersSent}`);
      
      console.log('\n═══════════════════════════════════════════════════════════════');
      console.log('📊 FULL LIFECYCLE EMAIL SUMMARY');
      console.log('═══════════════════════════════════════════════════════════════');
      console.log(`Abandonment emails: ${sent} sent, ${failed} failed (of ${processed})`);
      console.log(`Scheduled emails: ${scheduledSent} sent, ${scheduledFailed} failed`);
      console.log(`Drip campaign: ${dripSent} emails, ${dripSmsSent} SMS, ${dripTasksCreated} tasks`);
      console.log(`ACH follow-ups: ${achFollowUpsSent} sent`);
      console.log(`IDIQ recovery: ${idiqRecoverySent} sent`);
      console.log(`Dispute notifications: ${disputeEmailsSent} sent`);
      console.log(`Monthly reports: ${monthlyReportsSent} sent`);
      console.log(`Milestone celebrations: ${milestoneSent} sent`);
      console.log(`Graduation/maintenance: ${graduationSent} sent`);
      console.log(`Growth (reviews/referrals/anniversaries): ${growthEmailsSent} sent`);
      console.log(`Quiz nurture: ${quizNurtureSent} sent`);
      console.log(`Lead nurture drip: ${leadNurtureSent} emails, ${leadNurtureSmsSent} SMS`);
      console.log(`Document reminders: ${docRemindersSent} sent`);
      console.log('═══════════════════════════════════════════════════════════════\n');
      
      // Log to analytics
      await db.collection('analyticsLogs').add({
        type: 'lifecycle_email_batch',
        abandonment: { processed, sent, failed },
        scheduled: { sent: scheduledSent, failed: scheduledFailed },
        drip: { sent: dripSent, smsSent: dripSmsSent, tasksCreated: dripTasksCreated },
        achFollowUps: { sent: achFollowUpsSent },
        idiqRecovery: { sent: idiqRecoverySent },
        disputeNotifications: { sent: disputeEmailsSent },
        monthlyReports: { sent: monthlyReportsSent },
        milestones: { sent: milestoneSent },
        graduation: { sent: graduationSent },
        growth: { sent: growthEmailsSent },
        quizNurture: { sent: quizNurtureSent },
        leadNurture: { sent: leadNurtureSent, smsSent: leadNurtureSmsSent },
        documentReminders: { sent: docRemindersSent },
        runAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      return null;
      
    } catch (error) {
      console.error('❌ Abandonment email processor error:', error);
      
      // Log error
      await db.collection('errorLogs').add({
        type: 'abandonment_email_processor_error',
        error: error.message,
        stack: error.stack,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
      
      return null;
    }
  }
);

      console.log('✅ Function 6B/11: processAbandonmentEmails loaded (FULL LIFECYCLE: 14 rules, 34 email types)');

// ============================================
// FUNCTION 7: AI CONTENT GENERATOR (Consolidated)
// ============================================
// Handles: ALL AI content generation + document generation
// Replaces: generateAIEmailContent, analyzeCreditReport, generateDisputeLetter, generateContract, generatePOA, generateACH
// Savings: 6 functions → 1 function = $22.50/month saved

exports.aiContentGenerator = onCall(
  {
    memory: '1024MiB',
    timeoutSeconds: 540,
    maxInstances: 5,
    secrets: [openaiApiKey]
  },
  async (request) => {
    const { type, ...params } = request.data;
    
    console.log('🤖 AI Content Generator:', type);
    
    try {
      // ===== ENHANCED: Intercept recommendServicePlan BEFORE the regular fetch =====
      // This type needs real Firestore data, so we handle it separately
      if (type === 'recommendServicePlan') {
        return await handleRecommendServicePlan(params, openaiApiKey);
      }
      
      // ===== DISPUTE POPULATION TYPES =====
      // These use the disputePopulationService module - NO new Cloud Functions!
      if (type === 'populateDisputes') {
        return await handlePopulateDisputes(params);
      }
      
      if (type === 'getDisputeSummary') {
        return await handleGetDisputeSummary(params);
      }
      
      // ═════════════════════════════════════════════════════════════════════
      // QUIZ ASSESSMENT: AI-Powered Free Credit Assessment
      // Called from quiz.php lead magnet page
      // ═════════════════════════════════════════════════════════════════════
      if (type === 'generateQuizAssessment') {
        console.log('📝 Quiz Assessment triggered for:', params.firstName);
        const { firstName, creditGoal, scoreRange, negativeItems } = params;
        if (!firstName || !creditGoal || !scoreRange) {
          return { success: false, error: 'Missing required quiz fields' };
        }
        try {
          const quizPrompt = `You are Chris Lahage, founder of Speedy Credit Repair (est. 1995) with 30 years of experience including as a former Toyota Finance Director. Generate a personalized credit assessment based on quiz answers.

QUIZ ANSWERS:
- Name: ${firstName}
- Primary Credit Goal: ${creditGoal}
- Approximate Credit Score Range: ${scoreRange}
- Reported Negative Items: ${Array.isArray(negativeItems) ? negativeItems.join(', ') : negativeItems || 'Not specified'}

RESPOND IN THIS EXACT JSON FORMAT (no markdown, no backticks):
{
  "headline": "A short encouraging headline for ${firstName} (10 words max)",
  "currentSituation": "2-3 sentences assessing their current situation based on score range and negative items. Be empathetic and specific.",
  "goalAnalysis": "2-3 sentences about their specific goal (${creditGoal}) and what score they likely need. Be practical.",
  "estimatedImpact": "1-2 sentences about potential score improvement with professional credit repair. Be realistic but optimistic.",
  "topRecommendations": ["Recommendation 1 (specific to their situation)", "Recommendation 2", "Recommendation 3"],
  "estimatedTimeline": "Estimated timeline to see results (e.g., '45-90 days for initial improvements')",
  "urgencyNote": "1 sentence about why acting now matters for their specific goal"
}`;
          const quizResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${openaiApiKey.value()}` },
            body: JSON.stringify({
              model: 'gpt-4',
              messages: [
                { role: 'system', content: 'You are a credit repair expert. Respond ONLY with valid JSON. No markdown, no backticks, no extra text.' },
                { role: 'user', content: quizPrompt }
              ],
              temperature: 0.7, max_tokens: 800
            })
          });
          const quizData = await quizResponse.json();
          if (!quizData.choices || !quizData.choices[0]) throw new Error('Invalid OpenAI response for quiz assessment');
          const rawContent = quizData.choices[0].message.content;
          const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
          if (!jsonMatch) throw new Error('Could not parse assessment JSON');
          const assessment = JSON.parse(jsonMatch[0]);
          console.log('✅ Quiz assessment generated for:', firstName);
          return { success: true, assessment, type: 'quizAssessment' };
        } catch (quizErr) {
          console.error('❌ Quiz assessment error:', quizErr);
          return {
            success: true,
            assessment: {
              headline: `${firstName}, there's good news ahead!`,
              currentSituation: `Based on your credit score range of ${scoreRange}, you're in a position where professional credit repair can make a significant difference. Many of our clients start in a similar place.`,
              goalAnalysis: `Your goal of "${creditGoal}" is very achievable. Most lenders look for specific score thresholds, and we can help you understand exactly where you need to be.`,
              estimatedImpact: `Our clients typically see improvements of 50-150 points within the first 3-6 months of working with us, depending on their specific situation.`,
              topRecommendations: [
                'Get a complete 3-bureau credit report to identify all disputable items',
                'Address negative items strategically, starting with the most impactful ones',
                'Build positive credit history while we work on removing negatives'
              ],
              estimatedTimeline: '45-90 days for initial improvements',
              urgencyNote: 'Every month with negative items on your report costs you money in higher interest rates.'
            },
            type: 'quizAssessment', fallback: true
          };
        }
      }
      // ═════════════════════════════════════════════════════════════════════
      // NEW v3.0: AI DISPUTE STRATEGY ENGINE
      // ═════════════════════════════════════════════════════════════════════
      // Generates AI-powered dispute strategies using OpenAI.
      // Called from frontend: aiContentGenerator({ type: 'generateDisputeStrategy', contactId: '...' })
      // ═════════════════════════════════════════════════════════════════════
      if (type === 'generateDisputeStrategy') {
        console.log('🧠 AI Dispute Strategy Engine triggered for:', params.contactId);
        
        if (!params.contactId) {
          return { success: false, error: 'contactId is required' };
        }
        
        try {
          const disputePopulationService = require('./disputePopulationService');
          const result = await disputePopulationService.generateDisputeStrategy(
            params.contactId,
            openaiApiKey.value()
          );
          
          console.log('✅ Strategy generation result:', result.success ? 'SUCCESS' : 'FAILED');
          return result;
        } catch (error) {
          console.error('❌ generateDisputeStrategy error:', error);
          return { success: false, error: error.message };
        }
      }

      // ═════════════════════════════════════════════════════════════════════
      // NEW v3.0: AI DISPUTE LETTER GENERATOR
      // ═════════════════════════════════════════════════════════════════════
      // Generates dispute letters (3 tones) for each dispute per bureau.
      // Called from frontend: aiContentGenerator({ type: 'generateDisputeLetters', contactId, round: 1 })
      // ═════════════════════════════════════════════════════════════════════
      if (type === 'generateDisputeLetters') {
        console.log('📝 AI Letter Generator triggered - Round:', params.round, 'Contact:', params.contactId);
        
        if (!params.contactId) {
          return { success: false, error: 'contactId is required' };
        }
        
        try {
          const disputePopulationService = require('./disputePopulationService');
          const result = await disputePopulationService.generateDisputeLetters(
            params.contactId,
            params.round || 1,
            openaiApiKey.value(),
            {
              tones: params.tones || ['formal', 'consumer', 'aggressive'],
              singleTone: params.singleTone || false
            }
          );
          
          console.log('✅ Letter generation result:', result.success ? `${result.letterCount} letters` : 'FAILED');
          return result;
        } catch (error) {
          console.error('❌ generateDisputeLetters error:', error);
          return { success: false, error: error.message };
        }
      }

      // ═════════════════════════════════════════════════════════════════════
      // NEW v3.0: DISPUTE ROUND ASSIGNMENT
      // ═════════════════════════════════════════════════════════════════════
      // Assigns disputes to rounds based on priority and score impact.
      // Called from frontend: aiContentGenerator({ type: 'assignDisputeRounds', contactId, maxPerRound: 7 })
      // ═════════════════════════════════════════════════════════════════════
      if (type === 'assignDisputeRounds') {
        console.log('📅 Round Assignment triggered for:', params.contactId);
        
        if (!params.contactId) {
          return { success: false, error: 'contactId is required' };
        }
        
        try {
          const disputePopulationService = require('./disputePopulationService');
          const result = await disputePopulationService.assignDisputeRounds(
            params.contactId,
            { maxPerRound: params.maxPerRound || 7 }
          );
          
          console.log('✅ Round assignment result:', result.success ? `${result.totalRounds} rounds` : 'FAILED');
          return result;
        } catch (error) {
          console.error('❌ assignDisputeRounds error:', error);
          return { success: false, error: error.message };
        }
      }

      // ═════════════════════════════════════════════════════════════════════
      // NEW v3.0: GET DISPUTE LETTERS
      // ═════════════════════════════════════════════════════════════════════
      // Retrieves generated letters, with optional filters.
      // Called from frontend: aiContentGenerator({ type: 'getDisputeLetters', contactId, round: 1, tone: 'formal' })
      // ═════════════════════════════════════════════════════════════════════
      if (type === 'getDisputeLetters') {
        console.log('📄 Get Dispute Letters for:', params.contactId);
        
        if (!params.contactId) {
          return { success: false, error: 'contactId is required' };
        }
        
        try {
          const disputePopulationService = require('./disputePopulationService');
          const result = await disputePopulationService.getDisputeLetters(
            params.contactId,
            {
              disputeId: params.disputeId || null,
              round: params.round || null,
              tone: params.tone || null,
              status: params.status || null
            }
          );
          
          return result;
        } catch (error) {
          console.error('❌ getDisputeLetters error:', error);
          return { success: false, error: error.message };
        }
      }

      // ═════════════════════════════════════════════════════════════════════
      // NEW v3.0: FULL DISPUTE PIPELINE (ALL-IN-ONE)
      // ═════════════════════════════════════════════════════════════════════
      // Runs the complete pipeline: populate → strategy → round assignment → letters
      // This is the "one-click" function for the enrollment flow.
      // Called from frontend: aiContentGenerator({ type: 'runFullDisputePipeline', contactId })
      // ═════════════════════════════════════════════════════════════════════
      if (type === 'runFullDisputePipeline') {
        console.log('🚀 FULL DISPUTE PIPELINE triggered for:', params.contactId);
        
        if (!params.contactId) {
          return { success: false, error: 'contactId is required' };
        }
        
        const pipelineResults = {
          populate: null,
          strategy: null,
          letters: null,
          success: false,
          contactId: params.contactId
        };
        
        try {
          const disputePopulationService = require('./disputePopulationService');
          
          // ═════ STEP 1: Populate disputes from credit report ═════
          console.log('🔍 Pipeline Step 1/3: Populating disputes...');
          pipelineResults.populate = await disputePopulationService.populateDisputesFromIDIQ(params.contactId);
          
          if (!pipelineResults.populate.success) {
            console.log('⚠️ Population failed, but continuing with existing disputes...');
          }
          
          // ═════ STEP 2: Generate AI strategy ═════
          console.log('🧠 Pipeline Step 2/3: Generating AI strategy...');
          pipelineResults.strategy = await disputePopulationService.generateDisputeStrategy(
            params.contactId,
            openaiApiKey.value()
          );
          
          // ═════ STEP 3: Generate Round 1 letters ═════
          if (pipelineResults.strategy.success) {
            console.log('📝 Pipeline Step 3/3: Generating Round 1 letters...');
            pipelineResults.letters = await disputePopulationService.generateDisputeLetters(
              params.contactId,
              1, // Round 1 only
              openaiApiKey.value(),
              { singleTone: true } // Generate AI-recommended tone only (faster)
            );
          } else {
            console.log('⚠️ Strategy failed, skipping letter generation');
            pipelineResults.letters = { success: false, error: 'Strategy generation failed' };
          }
          
          pipelineResults.success = true;
          pipelineResults.message = `Pipeline complete: ${pipelineResults.populate?.disputeCount || 0} disputes, ${pipelineResults.strategy?.plan?.totalRounds || 0} rounds, ${pipelineResults.letters?.letterCount || 0} letters`;
          
          console.log('═══════════════════════════════════════════════════════════════');
          console.log('✅ FULL DISPUTE PIPELINE COMPLETE');
          console.log('   Disputes:', pipelineResults.populate?.disputeCount || 0);
          console.log('   Strategy:', pipelineResults.strategy?.success ? 'Generated' : 'Failed');
          console.log('   Letters:', pipelineResults.letters?.letterCount || 0);
          console.log('═══════════════════════════════════════════════════════════════');
          
          return pipelineResults;
          
        } catch (error) {
          console.error('❌ Full pipeline error:', error);
          pipelineResults.error = error.message;
          return pipelineResults;
        }
      }


// ═══════════════════════════════════════════════════════════════════════════
// END OF NEW CASE BLOCKS
// ═══════════════════════════════════════════════════════════════════════════
// The existing line "// ===== All other content types use the regular OpenAI flow =====" 
// should come AFTER all of the above.
// ═══════════════════════════════════════════════════════════════════════════
      
      // ===== All other content types use the regular OpenAI flow =====
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey.value()}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: (() => {
            switch (type) {
              case 'email':
                return [{
                  role: 'system',
                  content: 'You are a professional credit repair specialist writing emails to clients. Be empathetic, professional, and actionable.'
                }, {
                  role: 'user',
                  content: `Write a professional email about: ${params.topic}. Recipient: ${params.recipientName}. Context: ${params.context || 'General communication'}.`
                }];
              
              case 'analyzeCreditReport':
                return [{
                  role: 'system',
                  content: 'You are a certified credit analyst. Analyze credit reports and provide actionable insights in a structured format.'
                }, {
                  role: 'user',
                  content: `Analyze this credit report data and provide: 1) Key findings, 2) Negative items to dispute, 3) Positive factors, 4) Recommendations. Data: ${JSON.stringify(params.reportData).substring(0, 3000)}`
                }];

                
              
              case 'disputeLetter':
                return [{
                  role: 'system',
                  content: 'You are a legal expert in credit reporting. Write FCRA-compliant dispute letters that are professional and effective.'
                }, {
                  role: 'user',
                  content: `Create a dispute letter for: ${params.item}. Bureau: ${params.bureau}. Account: ${params.accountNumber || 'N/A'}. Reason: ${params.reason || 'Inaccurate information'}.`
                }];
              
              case 'contract':
                return [{
                  role: 'system',
                  content: 'You are a legal document specialist. Create service agreements that are clear, fair, and legally sound.'
                }, {
                  role: 'user',
                  content: `Create a ${params.serviceType || 'credit repair'} service agreement for client: ${params.clientName}. Include: scope of services, fees ($${params.fee || '99'}/month), duration (${params.duration || '6 months'}), terms and conditions.`
                }];
              
              case 'poa':
                return [{
                  role: 'system',
                  content: 'You are a legal document specialist. Create Power of Attorney documents for credit repair that comply with federal and state laws.'
                }, {
                  role: 'user',
                  content: `Create a limited Power of Attorney for credit repair for: ${params.clientName}. Address: ${params.address}. This authorizes Speedy Credit Repair Inc. to communicate with credit bureaus on their behalf.`
                }];
              
              case 'ach':
                return [{
                  role: 'system',
                  content: 'You are a financial document specialist. Create ACH authorization forms that are clear and compliant with banking regulations.'
                }, {
                  role: 'user',
                  content: `Create an ACH authorization form for: ${params.clientName}. Monthly amount: $${params.amount || '99'}. Bank: ${params.bankName || '[Bank Name]'}. Account ending in: ${params.accountLastFour || 'XXXX'}.`
                }];
              
              // ===== ENHANCED: recommendServicePlan redirects to handler =====
              // This case now uses real data fetching - see handleRecommendServicePlan function
              // DO NOT use the default OpenAI call for this type - it's handled separately above
              
              // ===== NEW: Full Credit Review Email Generation =====
              // Used by AIReportGenerator.jsx for personalized credit reviews
              case 'generateCreditReview':
                const p = params.params || params; // Handle nested params from frontend
                return [{
                  role: 'system',
                  content: `You are Chris Lahage, a credit expert at Speedy Credit Repair with 30 years of experience as a former Toyota Finance Director. Write personalized, warm, professional credit review emails. Be encouraging but honest about challenges. Include specific actionable advice tailored to their situation. Always end with a call to action.

FORMAT YOUR RESPONSE AS JSON:
{
  "subject": "Your Personalized Credit Review - [First Name]",
  "body": "The full email body text here..."
}`
                }, {
                  role: 'user',
                  content: p.prompt || `Generate a personalized credit review email for ${p.firstName || 'Valued Customer'}.

CREDIT PROFILE:
- VantageScore 3.0: ${p.score || 'Unknown'} (${p.scoreRange?.label || 'Unknown range'})
- Total Accounts: ${p.accountCount || 0}
- Negative Items: ${p.negativeItemCount || 0}
- Hard Inquiries: ${p.inquiryCount || 0}

${p.negativeItems?.length > 0 ? `TOP NEGATIVE ITEMS TO ADDRESS:\n${p.negativeItems.slice(0,5).map((item, i) => `${i+1}. ${item.creditorName || 'Unknown'} - ${item.accountType || 'Account'} - Status: ${item.paymentStatus || 'Unknown'}`).join('\n')}` : 'No negative items identified.'}

REQUIREMENTS:
1. Be warm, encouraging, and professional
2. Explain their score in plain, understandable language
3. Identify the TOP factors affecting their score
4. Provide 3-5 SPECIFIC action items they can take immediately
5. ${p.score < 700 ? 'Include a soft recommendation for professional credit repair services' : 'Congratulate them on their good credit standing'}
6. End with clear call to action: Call (888) 724-7344 or reply to this email

TONE: Like a helpful friend who happens to be a credit expert
LENGTH: 400-600 words

SIGNATURE:
${p.settings?.signatureName || 'Chris Lahage'}
${p.settings?.signatureTitle || 'Credit Expert'}
Speedy Credit Repair Inc.
(888) 724-7344
chris@speedycreditrepair.com

Respond with valid JSON containing "subject" and "body" fields.`
                }];
              
              default:
                throw new Error(`Unknown content type: ${type}`);
            }
          })(),
          temperature: 0.7,
          max_tokens: type === 'contract' || type === 'poa' || type === 'generateCreditReview' ? 2000 : 1500
        })
      });
      
      const aiData = await openaiResponse.json();
      
      if (!aiData.choices || !aiData.choices[0]) {
        throw new Error('Invalid OpenAI response');
      }
      
      const generatedContent = aiData.choices[0].message.content;
      
      console.log(`✅ Generated ${type} content (${generatedContent.length} chars)`);
      
      // ===== Parse JSON response for generateCreditReview =====
      if (type === 'generateCreditReview') {
        try {
          // Try to parse as JSON
          const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
              success: true,
              review: {
                subject: parsed.subject || `Your Personalized Credit Review`,
                body: parsed.body || generatedContent,
                content: parsed.body || generatedContent
              },
              type
            };
          }
        } catch (parseErr) {
          console.log('⚠️ Could not parse as JSON, returning raw content');
        }
        // Fallback: return raw content
        return {
          success: true,
          review: {
            subject: `Your Personalized Credit Review`,
            body: generatedContent,
            content: generatedContent
          },
          type
        };
      }
      
      return {
        success: true,
        content: generatedContent,
        type
      };
      
    } catch (error) {
      console.error('❌ AI content generator error:', error);
      return { success: false, error: error.message };
    }
  }
);

console.log('✅ Function 7/10: aiContentGenerator loaded');

// ============================================
// ENHANCED: handleRecommendServicePlan
// ============================================
// This function fetches REAL data from Firestore and builds a comprehensive
// AI prompt for service plan recommendation
// 
// Data sources:
// 1. Contact document (with idiqEnrollment)
// 2. AI Receptionist call transcripts
// 3. Email/interaction history
// 4. Service plans configuration
// ============================================

async function handleRecommendServicePlan(params, openaiApiKey) {
  const db = admin.firestore();
  const { contactId } = params;
  
  console.log('🎯 Enhanced Service Plan Recommendation for contact:', contactId);
  
  // ===== VALIDATE CONTACT ID =====
  if (!contactId) {
    console.error('❌ Missing contactId parameter');
    return {
      success: false,
      error: 'contactId is required for service plan recommendation'
    };
  }
  
  try {
    // ===== 1. FETCH CONTACT DATA =====
    console.log('📋 Fetching contact data...');
    const contactDoc = await db.collection('contacts').doc(contactId).get();
    
    if (!contactDoc.exists) {
      console.error('❌ Contact not found:', contactId);
      return {
        success: false,
        error: `Contact not found: ${contactId}`
      };
    }
    
    const contact = contactDoc.data();
    console.log('✅ Contact found:', contact.firstName, contact.lastName);
    
    // Extract credit data from idiqEnrollment
    const idiqData = contact.idiqEnrollment || {};
    const creditScore = idiqData.creditScore || contact.creditScore || null;
    const accountCount = idiqData.accountCount || 0;
    const negativeItemCount = idiqData.negativeItemCount || 0;
    const inquiryCount = idiqData.inquiryCount || 0;
    
    // ===== 2. FETCH AI RECEPTIONIST TRANSCRIPTS =====
    console.log('📞 Fetching AI receptionist call transcripts...');
    let transcripts = [];
    let callSummary = '';
    
    try {
      const phoneToSearch = contact.phone || contact.phoneNumber || '';
      if (phoneToSearch) {
        const normalizedPhone = phoneToSearch.replace(/\D/g, '');
        const phoneVariants = [
          phoneToSearch,
          normalizedPhone,
          `+1${normalizedPhone}`,
          normalizedPhone.slice(-10)
        ];
        
        const callsQuery = await db.collection('aiReceptionistCalls')
          .where('caller', 'in', phoneVariants.slice(0, 10))
          .orderBy('timestamp', 'desc')
          .limit(5)
          .get();
        
        if (!callsQuery.empty) {
          transcripts = callsQuery.docs.map(doc => {
            const data = doc.data();
            return {
              timestamp: data.timestamp?.toDate?.() || data.timestamp,
              transcript: data.transcript || '',
              summary: data.summary || '',
              sentiment: data.sentiment || 'neutral',
              painPoints: data.painPoints || [],
              urgencyLevel: data.urgencyLevel || 'medium',
              primaryGoal: data.primaryGoal || ''
            };
          });
          
          console.log(`✅ Found ${transcripts.length} AI receptionist calls`);
          
          callSummary = transcripts.map((t, i) => 
            `Call ${i + 1}:\n- Summary: ${t.summary}\n- Sentiment: ${t.sentiment}\n- Urgency: ${t.urgencyLevel}\n- Pain Points: ${t.painPoints.join(', ') || 'None identified'}\n- Primary Goal: ${t.primaryGoal || 'Not specified'}`
          ).join('\n\n');
        }
      }
    } catch (callError) {
      console.warn('⚠️ Could not fetch AI calls (non-critical):', callError.message);
    }
    
    // ===== 3. FETCH INTERACTION HISTORY =====
    console.log('📧 Fetching interaction history...');
    let interactionSummary = '';
    
    try {
      const emailsQuery = await db.collection('emailLog')
        .where('contactId', '==', contactId)
        .orderBy('sentAt', 'desc')
        .limit(10)
        .get();
      
      if (!emailsQuery.empty) {
        const emails = emailsQuery.docs.map(doc => doc.data());
        const openedCount = emails.filter(e => e.opened).length;
        const clickedCount = emails.filter(e => e.clicked).length;
        
        interactionSummary = `Email Engagement: ${emails.length} emails sent, ${openedCount} opened (${Math.round(openedCount/emails.length*100)}% open rate), ${clickedCount} clicked`;
        console.log(`✅ Found ${emails.length} email interactions`);
      }
      
      const notesQuery = await db.collection('contacts').doc(contactId)
        .collection('notes')
        .orderBy('createdAt', 'desc')
        .limit(5)
        .get();
      
      if (!notesQuery.empty) {
        const notes = notesQuery.docs.map(doc => doc.data().content || '').join(' | ');
        interactionSummary += `\nRecent Notes: ${notes.substring(0, 500)}`;
      }
    } catch (interactionError) {
      console.warn('⚠️ Could not fetch interactions (non-critical):', interactionError.message);
    }
    
    // ===== 4. BUILD SERVICE PLANS CONTEXT =====
    const plansContext = Object.entries(SERVICE_PLANS_CONFIG).map(([key, plan]) => 
      `${plan.name} ($${plan.monthlyPrice}/mo${plan.setupFee ? ` + $${plan.setupFee} setup` : ''}${plan.perDeletion ? ` + $${plan.perDeletion}/deletion` : ''}):
- Timeline: ${plan.timeline}
- Success Rate: ${plan.successRate}
- Avg Improvement: ${plan.avgPointIncrease}
- Effort: ${plan.effortRequired}
- Ideal For: ${plan.idealFor.join(', ')}
- Key Features: ${plan.keyFeatures.slice(0, 5).join(', ')}`
    ).join('\n\n');
    
    // ===== 5. DETERMINE SCORE RANGE =====
    let scoreRange = 'Unknown';
    if (creditScore) {
      if (creditScore >= 750) scoreRange = 'Excellent (750+)';
      else if (creditScore >= 700) scoreRange = 'Good (700-749)';
      else if (creditScore >= 650) scoreRange = 'Fair (650-699)';
      else if (creditScore >= 600) scoreRange = 'Poor (600-649)';
      else if (creditScore >= 500) scoreRange = 'Very Poor (500-599)';
      else scoreRange = 'Deep Subprime (Below 500)';
    }
    
    // ===== 6. BUILD COMPREHENSIVE AI PROMPT =====
    const systemPrompt = `You are Chris Lahage, a credit repair expert with 30 years of experience and a former Toyota Finance Director. You work for Speedy Credit Repair Inc., a family-run business established in 1995 with an A+ BBB rating and 4.9-star Google reviews.

Your task is to recommend the BEST service plan for this prospect based on ALL available data. Consider their credit situation, goals, urgency, budget indicators, and interaction history.

CRITICAL: Respond ONLY with valid JSON in this EXACT format:
{
  "recommendedPlan": "PLAN_KEY",
  "confidence": "high|medium|low",
  "monthlyPrice": 149,
  "reasoning": {
    "primary": "Main reason for this recommendation",
    "creditFactors": "How their credit profile influenced the choice",
    "behavioralFactors": "How their interactions/calls influenced the choice",
    "urgencyAssessment": "Assessment of their timeline/urgency"
  },
  "alternativePlan": {
    "plan": "PLAN_KEY",
    "reason": "Why this could also work"
  },
  "personalizedPitch": "A 2-3 sentence personalized pitch for why this plan is perfect for them",
  "expectedResults": {
    "timeline": "Expected timeline for results",
    "pointIncrease": "Expected score improvement",
    "keyMilestones": ["Milestone 1", "Milestone 2", "Milestone 3"]
  },
  "objectionHandlers": {
    "price": "Response if they say it's too expensive",
    "time": "Response if they want faster results",
    "trust": "Response if they're skeptical"
  }
}

PLAN KEYS (use exactly): DIY, STANDARD, ACCELERATION, PFD, HYBRID, PREMIUM`;

    const userPrompt = `Analyze this prospect and recommend the best service plan:

═══════════════════════════════════════════════════════════════
PROSPECT PROFILE
═══════════════════════════════════════════════════════════════
Name: ${contact.firstName || 'Unknown'} ${contact.lastName || ''}
Email: ${contact.email || 'Not provided'}
Phone: ${contact.phone || contact.phoneNumber || 'Not provided'}
Lead Score: ${contact.leadScore || 'Not scored'}/10
Lead Source: ${contact.leadSource || 'Unknown'}
State: ${contact.state || 'Unknown'}

═══════════════════════════════════════════════════════════════
CREDIT PROFILE
═══════════════════════════════════════════════════════════════
Credit Score: ${creditScore || 'Unknown'} (${scoreRange})
Total Accounts: ${accountCount}
Negative Items: ${negativeItemCount}
Hard Inquiries: ${inquiryCount}
Primary Goal: ${contact.primaryGoal || idiqData.primaryGoal || transcripts[0]?.primaryGoal || 'Not specified'}
Timeline: ${contact.timeline || idiqData.timeline || 'Not specified'}

═══════════════════════════════════════════════════════════════
AI RECEPTIONIST CALL DATA
═══════════════════════════════════════════════════════════════
${callSummary || 'No AI receptionist calls recorded'}

═══════════════════════════════════════════════════════════════
INTERACTION HISTORY
═══════════════════════════════════════════════════════════════
${interactionSummary || 'No prior email interactions'}

═══════════════════════════════════════════════════════════════
AVAILABLE SERVICE PLANS
═══════════════════════════════════════════════════════════════
${plansContext}

═══════════════════════════════════════════════════════════════
RECOMMENDATION GUIDELINES
═══════════════════════════════════════════════════════════════
- Consider urgency: Home buyers and auto loan seekers need faster plans
- Consider budget: Low lead scores may indicate budget sensitivity
- Consider complexity: More negative items = more comprehensive plan needed
- Consider engagement: High email engagement = more invested prospect
- Consider sentiment: Frustrated callers may need Premium white-glove service
- Consider previous failures: PFD builds trust with risk-averse prospects

Provide your recommendation as valid JSON.`;

    // ===== 7. CALL OPENAI =====
    console.log('🤖 Calling OpenAI for recommendation...');
    
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey.value()}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });
    
    const aiData = await openaiResponse.json();
    
    if (!aiData.choices || !aiData.choices[0]) {
      throw new Error('Invalid OpenAI response');
    }
    
    const generatedContent = aiData.choices[0].message.content;
    console.log('✅ AI recommendation received');
    
    // ===== 8. PARSE AND VALIDATE RESPONSE =====
    let recommendation;
    try {
      const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        recommendation = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
      
      if (!recommendation.recommendedPlan || !SERVICE_PLANS_CONFIG[recommendation.recommendedPlan]) {
        console.warn('⚠️ Invalid plan key, defaulting to STANDARD');
        recommendation.recommendedPlan = 'STANDARD';
      }
      
      const planDetails = SERVICE_PLANS_CONFIG[recommendation.recommendedPlan];
      recommendation.planDetails = planDetails;
      recommendation.monthlyPrice = planDetails.monthlyPrice;
      
      if (recommendation.alternativePlan?.plan && SERVICE_PLANS_CONFIG[recommendation.alternativePlan.plan]) {
        recommendation.alternativePlan.details = SERVICE_PLANS_CONFIG[recommendation.alternativePlan.plan];
      }
      
    } catch (parseError) {
      console.error('❌ Failed to parse AI response:', parseError.message);
      recommendation = generateFallbackRecommendation(contact, creditScore, negativeItemCount, transcripts);
    }
    
    // ===== 9. LOG AND RETURN =====
    console.log(`🎯 Recommendation: ${recommendation.recommendedPlan} (${recommendation.confidence} confidence)`);
    
    try {
      await db.collection('planRecommendations').add({
        contactId,
        recommendation: recommendation.recommendedPlan,
        confidence: recommendation.confidence,
        creditScore,
        negativeItemCount,
        leadScore: contact.leadScore,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
    } catch (logError) {
      console.warn('⚠️ Could not log recommendation (non-critical)');
    }
    
    return {
      success: true,
      recommendation,
      contactSummary: {
        name: `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'Unknown',
        creditScore,
        scoreRange,
        negativeItemCount,
        inquiryCount,
        leadScore: contact.leadScore
      },
      dataSourcesUsed: {
        contactData: true,
        idiqEnrollment: !!idiqData.creditScore,
        aiCalls: transcripts.length > 0,
        emailHistory: !!interactionSummary
      },
      type: 'recommendServicePlan'
    };
    
  } catch (error) {
    console.error('❌ Service plan recommendation error:', error);
    return {
      success: false,
      error: error.message,
      type: 'recommendServicePlan'
    };
  }
}

// ============================================
// FALLBACK RECOMMENDATION (Rule-Based)
// ============================================
// Used when AI parsing fails - ensures we always return something useful

function generateFallbackRecommendation(contact, creditScore, negativeItemCount, transcripts) {
  console.log('⚠️ Using fallback rule-based recommendation');
  
  let recommendedPlan = 'STANDARD';
  let confidence = 'medium';
  let primaryReason = 'Based on typical credit repair needs';
  
  if (creditScore && creditScore < 500 && negativeItemCount > 10) {
    recommendedPlan = 'PREMIUM';
    confidence = 'high';
    primaryReason = 'Complex credit situation requires comprehensive support';
  } else if (transcripts.some(t => t.urgencyLevel === 'high' || t.primaryGoal?.includes('home'))) {
    recommendedPlan = 'ACCELERATION';
    confidence = 'high';
    primaryReason = 'Urgent timeline requires expedited service';
  } else if (contact.leadScore >= 8) {
    recommendedPlan = 'ACCELERATION';
    confidence = 'medium';
    primaryReason = 'High-value prospect benefits from premium speed';
  } else if (contact.leadScore <= 3 || negativeItemCount <= 3) {
    recommendedPlan = 'PFD';
    confidence = 'medium';
    primaryReason = 'Pay-for-delete offers risk-free results-based pricing';
  }
  
  const planDetails = SERVICE_PLANS_CONFIG[recommendedPlan];
  
  return {
    recommendedPlan,
    confidence,
    monthlyPrice: planDetails.monthlyPrice,
    reasoning: {
      primary: primaryReason,
      creditFactors: `Score: ${creditScore || 'Unknown'}, Negative Items: ${negativeItemCount}`,
      behavioralFactors: 'Based on available interaction data',
      urgencyAssessment: 'Standard timeline assumed'
    },
    alternativePlan: {
      plan: 'STANDARD',
      reason: 'Solid choice for most credit repair needs'
    },
    personalizedPitch: `Based on your credit profile, the ${planDetails.name} plan offers the best balance of results and value. With ${planDetails.successRate} success rate and typical improvement of ${planDetails.avgPointIncrease}, you can expect meaningful progress within ${planDetails.timeline}.`,
    expectedResults: {
      timeline: planDetails.timeline,
      pointIncrease: planDetails.avgPointIncrease,
      keyMilestones: ['Initial disputes submitted', 'First deletions received', 'Score improvement verified']
    },
    objectionHandlers: {
      price: `The ${planDetails.name} plan pays for itself when you consider the interest savings on future loans.`,
      time: 'We offer expedited processing to prioritize your disputes.',
      trust: 'We\'ve been in business since 1995 with an A+ BBB rating and over 580 five-star reviews.'
    },
    planDetails,
    fallbackUsed: true
  };
}
// ============================================
// DISPUTE POPULATION HANDLERS
// ============================================
// Integrated into aiContentGenerator to avoid adding new Cloud Functions
// Uses disputePopulationService module for IDIQ HTML parsing
// ============================================

async function handlePopulateDisputes(params) {
  const { contactId } = params;
  
  console.log('🔍 Populating disputes for contact:', contactId);
  
  if (!contactId) {
    return { success: false, error: 'contactId is required' };
  }
  
  try {
    const disputePopulationService = require('./disputePopulationService');
    const result = await disputePopulationService.populateDisputesFromIDIQ(contactId);
    
    if (!result.success) {
      console.error('❌ Dispute population failed:', result.error);
      return result;
    }
    
    console.log(`✅ Found ${result.negativeItems} disputable items`);
    
    return {
      success: true,
      contactId,
      disputeCount: result.negativeItems,
      disputeIds: result.disputeIds,
      summary: result.summary,
      creditScores: result.creditScores,
      message: `Found ${result.negativeItems} disputable items across ${result.tradelines} tradelines`
    };
    
  } catch (error) {
    console.error('❌ Error in handlePopulateDisputes:', error);
    return { success: false, error: error.message };
  }
}

async function handleGetDisputeSummary(params) {
  const { contactId } = params;
  const db = admin.firestore();
  
  console.log('📊 Getting dispute summary for contact:', contactId);
  
  if (!contactId) {
    return { success: false, error: 'contactId is required' };
  }
  
  try {
    // Fetch all disputes for this contact
    const disputesQuery = await db.collection('disputes')
      .where('contactId', '==', contactId)
      .get();
    
    if (disputesQuery.empty) {
      return {
        success: true,
        contactId,
        hasDisputes: false,
        summary: {
          total: 0,
          byType: {},
          byBureau: {},
          byStatus: {},
          byPriority: { high: 0, medium: 0, low: 0 }
        }
      };
    }
    
    // Process disputes into summary
    const disputes = disputesQuery.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    const summary = {
      total: disputes.length,
      byType: {},
      byBureau: {},
      byStatus: {},
      byPriority: { high: 0, medium: 0, low: 0 },
      totalScoreImpact: { min: 0, max: 0 },
      avgSuccessRate: 0
    };
    
    let totalSuccessRate = 0;
    
    for (const dispute of disputes) {
      // By type
      summary.byType[dispute.type] = (summary.byType[dispute.type] || 0) + 1;
      
      // By bureau
      summary.byBureau[dispute.bureau] = (summary.byBureau[dispute.bureau] || 0) + 1;
      
      // By status
      summary.byStatus[dispute.status] = (summary.byStatus[dispute.status] || 0) + 1;
      
      // By priority
      if (dispute.priority) {
        summary.byPriority[dispute.priority] = (summary.byPriority[dispute.priority] || 0) + 1;
      }
      
      // Score impact
      if (dispute.scoreImpact) {
        summary.totalScoreImpact.min += dispute.scoreImpact.min || 0;
        summary.totalScoreImpact.max += dispute.scoreImpact.max || 0;
      }
      
      // Success rate
      totalSuccessRate += dispute.successProbability || 70;
    }
    
    summary.avgSuccessRate = Math.round(totalSuccessRate / disputes.length);
    
    return {
      success: true,
      contactId,
      hasDisputes: true,
      summary,
      disputes: disputes.map(d => ({
        id: d.id,
        creditorName: d.creditorName,
        type: d.type,
        typeLabel: d.typeLabel,
        bureau: d.bureau,
        bureauName: d.bureauName,
        balance: d.balance,
        status: d.status,
        priority: d.priority,
        successProbability: d.successProbability,
        recommendedStrategy: d.recommendedStrategy
      }))
    };
    
  } catch (error) {
    console.error('❌ Error in handleGetDisputeSummary:', error);
    return { success: false, error: error.message };
  }
}
console.log('✅ Function 7/10: aiContentGenerator loaded (with ENHANCED recommendServicePlan)');

// ============================================
// FUNCTION 8: OPERATIONS MANAGER (Consolidated)
// ============================================
// Handles: Workflow management + Task management
// Replaces: getContactWorkflowStatus, pauseWorkflowForContact, resumeWorkflowForContact, createTask, getTasks, updateTask
// Savings: 6 functions → 1 function = $22.50/month saved

// Path: /functions/operationsManager_FIXED.js
// ============================================================================
// OPERATIONS MANAGER CLOUD FUNCTION - FIXED VERSION
// ============================================================================
// FIXES FOR 400 ERRORS:
// 1. Enhanced parameter validation with specific error messages
// 2. Better error handling for missing contactId
// 3. Improved request body parsing
// 4. Added parameter existence checks before processing
// 5. Enhanced logging for debugging
// ============================================================================

exports.operationsManager = onRequest(
  {
    ...defaultConfig,
    cors: true,
    secrets: [nmiSecurityKey, gmailUser, gmailAppPassword, gmailFromName, gmailReplyTo]
  },
  async (request, response) => {
    // Enable CORS
    response.set('Access-Control-Allow-Origin', '*');
    response.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.set('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      response.status(204).send('');
      return;
    }

    // ===================================================================
    // CAN-SPAM: Handle GET requests for one-click email unsubscribe
    // ===================================================================
    // When a user clicks the unsubscribe link in an email, it arrives as
    // a GET request with ?action=unsubscribe&e={base64_email}
    // This immediately processes the opt-out and shows a confirmation page.
    // ===================================================================
    if (request.method === 'GET' && request.query?.action === 'unsubscribe') {
      const encodedEmail = request.query.e || '';
      let decodedEmail = '';
      
      try {
        decodedEmail = Buffer.from(encodedEmail, 'base64').toString('utf-8').trim().toLowerCase();
      } catch (decodeErr) {
        decodedEmail = '';
      }
      
      console.log('📧 GET Unsubscribe request for:', decodedEmail || '(no email)');
      
      if (decodedEmail && decodedEmail.includes('@')) {
        // Process the unsubscribe
        const db = admin.firestore();
        try {
          // Update contact records
          const emailQuery = await db.collection('contacts')
            .where('email', '==', decodedEmail)
            .get();
          
          if (!emailQuery.empty) {
            const batch = admin.firestore().batch();
            emailQuery.docs.forEach(doc => {
              batch.update(doc.ref, {
                emailOptOut: true,
                unsubscribed: true,
                unsubscribedAt: admin.firestore.FieldValue.serverTimestamp(),
                unsubscribeSource: 'one_click_email',
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                timeline: admin.firestore.FieldValue.arrayUnion({
                  id: Date.now(),
                  type: 'unsubscribed',
                  description: 'Contact unsubscribed via one-click email link',
                  timestamp: new Date().toISOString(),
                  source: 'system'
                })
              });
            });
            await batch.commit();
          }
          
          // Add to suppression list (backup)
          await db.collection('emailSuppressionList').doc(decodedEmail).set({
            email: decodedEmail,
            reason: 'unsubscribe',
            source: 'one_click_email',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          });
          
          // Log the event
          await db.collection('activityLogs').add({
            type: 'unsubscribe',
            action: 'one_click_email_opt_out',
            email: decodedEmail,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            createdBy: 'system:unsubscribe'
          });
          
          console.log(`✅ One-click unsubscribe processed for: ${decodedEmail}`);
        } catch (unsubErr) {
          console.error('❌ One-click unsubscribe error:', unsubErr);
        }
      }
      
      // ===== SERVE CONFIRMATION HTML PAGE =====
      // This is what the user sees after clicking unsubscribe in their email.
      const confirmHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Unsubscribed — Speedy Credit Repair</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f3f4f6; margin: 0; padding: 40px 20px; }
    .card { max-width: 480px; margin: 0 auto; background: #fff; border-radius: 16px; padding: 40px; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .logo { font-size: 28px; font-weight: 700; color: #1e40af; margin-bottom: 8px; }
    .subtitle { color: #6b7280; font-size: 13px; margin-bottom: 30px; }
    .icon { font-size: 48px; margin-bottom: 16px; }
    h1 { color: #1f2937; font-size: 22px; margin: 0 0 12px; }
    p { color: #6b7280; font-size: 15px; line-height: 1.6; margin: 0 0 20px; }
    .email { color: #1e40af; font-weight: 600; }
    .note { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px 16px; font-size: 13px; color: #166534; margin: 20px 0; }
    .footer { margin-top: 30px; color: #9ca3af; font-size: 11px; }
    a { color: #1e40af; text-decoration: none; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">⚡ Speedy Credit Repair</div>
    <div class="subtitle">Established 1995 | A+ BBB Rating</div>
    <div class="icon">✅</div>
    <h1>You've Been Unsubscribed</h1>
    ${decodedEmail ? `<p>We've removed <span class="email">${decodedEmail}</span> from our marketing email list.</p>` : '<p>Your email has been removed from our marketing list.</p>'}
    <div class="note">
      <strong>Note:</strong> You may still receive essential service emails (payment confirmations, security alerts, and account updates) related to your active credit repair service.
    </div>
    <p>If you unsubscribed by mistake, simply reply to any of our previous emails or contact us:</p>
    <p>📞 <a href="tel:8887247344">(888) 724-7344</a> | 📧 <a href="mailto:chris@speedycreditrepair.com">chris@speedycreditrepair.com</a></p>
    <div class="footer">
      <p>© 1995-${new Date().getFullYear()} Speedy Credit Repair Inc. | All Rights Reserved</p>
      <p>117 Main St #202, Huntington Beach, CA 92648</p>
    </div>
  </div>
</body>
</html>`;
      
      response.status(200).send(confirmHtml);
      return;
    }

    // ENHANCED: Better request body parsing
    // ===== BUG #7 FIX: Handle httpsCallable data wrapper =====
    // When the frontend calls operationsManager via httpsCallable(),
    // Firebase wraps the data as { data: { action: '...', ... } }.
    // When called directly via REST, the body IS the data.
    // This line handles BOTH formats gracefully:
    //   - httpsCallable: request.body = { data: { action:'...', ... } } → unwraps
    //   - Direct REST:   request.body = { action:'...', ... } → stays as-is
    let requestBody;
    try {
      requestBody = request.body?.data || request.body || {};
    } catch (parseError) {
      console.error('❌ Request body parsing error:', parseError);
      response.status(400).json({
        success: false,
        error: 'Invalid request body format',
        details: 'Request must be valid JSON'
      });
      return;
    }

    const { action, ...params } = requestBody;
    
    console.log('⚙️ Operations Manager Request:', {
      method: request.method,
      action: action,
      paramsKeys: Object.keys(params),
      paramsCount: Object.keys(params).length
    });
    
    // ENHANCED: Validate action parameter
    if (!action || typeof action !== 'string') {
      console.error('❌ Missing or invalid action parameter');
      response.status(400).json({
        success: false,
        error: 'Missing required parameter: action',
        details: 'Action must be a non-empty string',
        validActions: [
          'getWorkflowStatus',
          'pauseWorkflow', 
          'resumeWorkflow',
          'createTask',
          'getTasks',
          'updateTask',
          'createPortalAccount',
          'landingPageContact',
          'captureWebLead',
          'validateEnrollmentToken',
          'markTokenUsed',
          'processNewEnrollment',
          'chargeCustomer',
          'cancelSubscription',
          'processRefund',
          'updatePaymentMethod',
          'chargeDeletionFee',
          'getPaymentStatus',
          'nmiWebhook',
          'processUnsubscribe'
        ]
      });
      return;
    }
    
    const db = admin.firestore();
    let result;
    
    try {
      switch (action) {
        
        case 'getWorkflowStatus': {
          // ENHANCED: Parameter validation
          const { contactId } = params;
          
          if (!contactId || typeof contactId !== 'string') {
            response.status(400).json({
              success: false,
              error: 'Missing required parameter: contactId',
              details: 'contactId must be a non-empty string',
              action: 'getWorkflowStatus'
            });
            return;
          }
          
          console.log(`📊 Getting workflow status for contact: ${contactId}`);
          
          const contactDoc = await db.collection('contacts').doc(contactId).get();
          
          if (!contactDoc.exists) {
            response.status(404).json({
              success: false,
              error: 'Contact not found',
              details: `No contact found with ID: ${contactId}`,
              contactId: contactId
            });
            return;
          }
          
          const contactData = contactDoc.data();
          
          result = {
            success: true,
            contactId: contactId,
            status: contactData.workflowStatus || 'not_started',
            currentStage: contactData.workflowStage || null,
            paused: contactData.workflowPaused || false,
            active: contactData.workflowActive || false,
            lastUpdate: contactData.workflowLastUpdate || null,
            metadata: {
              stagesCompleted: contactData.workflowStagesCompleted || 0,
              totalStages: contactData.workflowTotalStages || 0
            }
          };
          break;
        }
        
        case 'pauseWorkflow': {
          // ENHANCED: Parameter validation
          const { contactId, reason } = params;
          
          if (!contactId || typeof contactId !== 'string') {
            response.status(400).json({
              success: false,
              error: 'Missing required parameter: contactId',
              details: 'contactId must be a non-empty string for pauseWorkflow',
              action: 'pauseWorkflow'
            });
            return;
          }
          
          console.log(`⏸️ Pausing workflow for contact: ${contactId}, reason: ${reason || 'No reason provided'}`);
          
          // ENHANCED: Check if contact exists before updating
          const contactRef = db.collection('contacts').doc(contactId);
          const contactDoc = await contactRef.get();
          
          if (!contactDoc.exists) {
            response.status(404).json({
              success: false,
              error: 'Contact not found',
              details: `Cannot pause workflow - no contact found with ID: ${contactId}`,
              contactId: contactId
            });
            return;
          }
          
          await contactRef.update({
            workflowPaused: true,
            workflowPauseReason: reason || 'Manual pause',
            workflowPausedAt: admin.firestore.FieldValue.serverTimestamp(),
            workflowLastUpdate: admin.firestore.FieldValue.serverTimestamp()
          });
          
          console.log(`✅ Workflow paused successfully for ${contactId}`);
          result = { 
            success: true, 
            message: 'Workflow paused successfully',
            contactId: contactId,
            pauseReason: reason || 'Manual pause'
          };
          break;
        }
        
        case 'resumeWorkflow': {
          // ENHANCED: Parameter validation
          const { contactId } = params;
          
          if (!contactId || typeof contactId !== 'string') {
            response.status(400).json({
              success: false,
              error: 'Missing required parameter: contactId',
              details: 'contactId must be a non-empty string for resumeWorkflow',
              action: 'resumeWorkflow'
            });
            return;
          }
          
          console.log(`▶️ Resuming workflow for contact: ${contactId}`);
          
          // ENHANCED: Check if contact exists before updating
          const contactRef = db.collection('contacts').doc(contactId);
          const contactDoc = await contactRef.get();
          
          if (!contactDoc.exists) {
            response.status(404).json({
              success: false,
              error: 'Contact not found',
              details: `Cannot resume workflow - no contact found with ID: ${contactId}`,
              contactId: contactId
            });
            return;
          }
          
          await contactRef.update({
            workflowPaused: false,
            workflowPauseReason: null,
            workflowResumedAt: admin.firestore.FieldValue.serverTimestamp(),
            workflowLastUpdate: admin.firestore.FieldValue.serverTimestamp()
          });
          
          console.log(`✅ Workflow resumed successfully for ${contactId}`);
          result = { 
            success: true, 
            message: 'Workflow resumed successfully',
            contactId: contactId
          };
          break;
        }
        
        case 'createTask': {
          // ENHANCED: Parameter validation
          const { title, description, contactId, dueDate, priority, assignedTo } = params;
          
          if (!title || typeof title !== 'string' || title.trim().length === 0) {
            response.status(400).json({
              success: false,
              error: 'Missing required parameter: title',
              details: 'title must be a non-empty string',
              action: 'createTask'
            });
            return;
          }
          
          console.log(`✅ Creating task: ${title} for contact: ${contactId || 'none'}`);
          
          // ENHANCED: Validate contactId if provided
          if (contactId) {
            const contactDoc = await db.collection('contacts').doc(contactId).get();
            if (!contactDoc.exists) {
              response.status(404).json({
                success: false,
                error: 'Contact not found',
                details: `Cannot create task - no contact found with ID: ${contactId}`,
                contactId: contactId
              });
              return;
            }
          }
          
          const taskData = {
            title: title.trim(),
            description: description || '',
            contactId: contactId || null,
            dueDate: dueDate ? new Date(dueDate) : null,
            priority: priority || 'medium',
            assignedTo: assignedTo || null,
            status: 'pending',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            createdBy: request.auth?.uid || 'system',
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          };
          
          // ENHANCED: Validate dueDate if provided
          if (dueDate) {
            const dueDateObj = new Date(dueDate);
            if (isNaN(dueDateObj.getTime())) {
              response.status(400).json({
                success: false,
                error: 'Invalid dueDate format',
                details: 'dueDate must be a valid ISO date string',
                providedDate: dueDate
              });
              return;
            }
            taskData.dueDate = dueDateObj;
          }
          
          const taskRef = await db.collection('tasks').add(taskData);
          
          console.log(`✅ Task created successfully: ${taskRef.id}`);
          result = { 
            success: true, 
            taskId: taskRef.id,
            title: title,
            contactId: contactId
          };
          break;
        }
        
        case 'getTasks': {
          // ENHANCED: Parameter validation with better defaults
          const { contactId, status, assignedTo, limit } = params;
          
          console.log(`📋 Getting tasks with filters:`, {
            contactId: contactId || 'all',
            status: status || 'all',
            assignedTo: assignedTo || 'all',
            limit: limit || 'no limit'
          });
          
          let query = db.collection('tasks');
          
          // ENHANCED: Validate contactId if provided
          if (contactId) {
            if (typeof contactId !== 'string') {
              response.status(400).json({
                success: false,
                error: 'Invalid contactId parameter',
                details: 'contactId must be a string if provided',
                providedValue: contactId
              });
              return;
            }
            query = query.where('contactId', '==', contactId);
          }
          
          if (status) {
            if (typeof status !== 'string') {
              response.status(400).json({
                success: false,
                error: 'Invalid status parameter',
                details: 'status must be a string if provided',
                providedValue: status
              });
              return;
            }
            query = query.where('status', '==', status);
          }
          
          if (assignedTo) {
            if (typeof assignedTo !== 'string') {
              response.status(400).json({
                success: false,
                error: 'Invalid assignedTo parameter',
                details: 'assignedTo must be a string if provided',
                providedValue: assignedTo
              });
              return;
            }
            query = query.where('assignedTo', '==', assignedTo);
          }
          
          query = query.orderBy('createdAt', 'desc');
          
          if (limit) {
            const limitNum = parseInt(limit);
            if (isNaN(limitNum) || limitNum <= 0) {
              response.status(400).json({
                success: false,
                error: 'Invalid limit parameter',
                details: 'limit must be a positive integer if provided',
                providedValue: limit
              });
              return;
            }
            query = query.limit(limitNum);
          }
          
          const tasksSnapshot = await query.get();
          const tasks = tasksSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          console.log(`📋 Retrieved ${tasks.length} tasks successfully`);
          result = { 
            success: true, 
            tasks, 
            count: tasks.length,
            filters: { contactId, status, assignedTo, limit }
          };
          break;
        }
        
        case 'updateTask': {
          // ENHANCED: Parameter validation
          const { taskId, updates } = params;
          
          if (!taskId || typeof taskId !== 'string') {
            response.status(400).json({
              success: false,
              error: 'Missing required parameter: taskId',
              details: 'taskId must be a non-empty string',
              action: 'updateTask'
            });
            return;
          }
          
          if (!updates || typeof updates !== 'object') {
            response.status(400).json({
              success: false,
              error: 'Missing required parameter: updates',
              details: 'updates must be an object with fields to update',
              action: 'updateTask'
            });
            return;
          }
          
          console.log(`✏️ Updating task: ${taskId} with:`, Object.keys(updates));
          
          // ENHANCED: Check if task exists
          const taskRef = db.collection('tasks').doc(taskId);
          const taskDoc = await taskRef.get();
          
          if (!taskDoc.exists) {
            response.status(404).json({
              success: false,
              error: 'Task not found',
              details: `No task found with ID: ${taskId}`,
              taskId: taskId
            });
            return;
          }
          
          const allowedUpdates = ['title', 'description', 'status', 'priority', 'assignedTo', 'dueDate', 'notes'];
          const sanitizedUpdates = {};
          
          for (const key of allowedUpdates) {
            if (updates[key] !== undefined) {
              sanitizedUpdates[key] = updates[key];
            }
          }
          
          if (Object.keys(sanitizedUpdates).length === 0) {
            response.status(400).json({
              success: false,
              error: 'No valid updates provided',
              details: `Valid fields are: ${allowedUpdates.join(', ')}`,
              providedFields: Object.keys(updates)
            });
            return;
          }
          
          // Add metadata
          sanitizedUpdates.updatedAt = admin.firestore.FieldValue.serverTimestamp();
          sanitizedUpdates.updatedBy = request.auth?.uid || 'system';
          
          await taskRef.update(sanitizedUpdates);
          
          console.log(`✅ Task updated successfully: ${taskId}`);
          result = { 
            success: true, 
            message: 'Task updated successfully', 
            taskId,
            updatedFields: Object.keys(sanitizedUpdates)
          };
          break;
        }
        
        // ============================================
        // CAPTURE WEB LEAD - Landing Page Form
        // ============================================
        case 'captureWebLead':
        case 'landingPageContact': {
          console.log(`🔧 Processing ${action}...`);
          
          const { 
            firstName, 
            lastName, 
            email, 
            phone, 
            message,
            creditGoal,
            leadSource,
            utmSource,
            utmMedium,
            utmCampaign,
            smsConsent,
            smsConsentTimestamp
          } = params;
          
          // Validate required fields
          if (!email && !phone) {
            response.status(400).json({
              success: false,
              error: 'Email or phone is required'
            });
            return;
          }
          
          try {
            // Check for existing contact by email OR phone
            let existingContactId = null;
            
            if (email) {
              const emailQuery = await db.collection('contacts')
                .where('email', '==', email.toLowerCase().trim())
                .limit(1)
                .get();
              
              if (!emailQuery.empty) {
                existingContactId = emailQuery.docs[0].id;
              }
            }
            
            if (!existingContactId && phone) {
              const cleanPhone = phone.replace(/\D/g, '');
              const phoneQuery = await db.collection('contacts')
                .where('phone', '==', cleanPhone)
                .limit(1)
                .get();
              
              if (!phoneQuery.empty) {
                existingContactId = phoneQuery.docs[0].id;
              }
            }
            
            const cleanPhone = phone ? phone.replace(/\D/g, '') : '';
            const contactData = {
          firstName: firstName || '',
          lastName: lastName || '',
          email: email ? email.toLowerCase().trim() : '',
          phone: cleanPhone,
          message: message || '',
          creditGoal: creditGoal || '',
          roles: ['contact', 'applicant'],
          pipeline: 'landing-page-submitted',
          pipelineUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
          leadSource: leadSource || 'website',
          utmSource: utmSource || '',
          utmMedium: utmMedium || '',
          utmCampaign: utmCampaign || '',
          smsConsent: smsConsent === true,
          smsConsentTimestamp: smsConsentTimestamp || null,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
            
            let contactId;
            
            if (existingContactId) {
              // Update existing contact
              await db.collection('contacts').doc(existingContactId).update(contactData);
              contactId = existingContactId;
              console.log('📝 Updated existing contact:', contactId);
            } else {
              // Create new contact
              contactData.createdAt = admin.firestore.FieldValue.serverTimestamp();
              contactData.status = 'new';
              contactData.leadScore = 5;
              
              const newContactRef = await db.collection('contacts').add(contactData);
              contactId = newContactRef.id;
              console.log('👤 Created new contact:', contactId);
            }
            
            // Log interaction
            await db.collection('interactions').add({
              contactId,
              type: 'web_form_submission',
              details: {
                source: action,
                creditGoal: creditGoal || '',
                message: message || '',
                utmSource: utmSource || ''
              },
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
              createdBy: 'system'
            });
            
            // ===== GENERATE ENROLLMENT TOKEN =====
const crypto = require('crypto'); // ADD THIS AT TOP OF FILE (line ~20)

// Generate token (line 5181)
const token = crypto.randomBytes(32).toString('hex');
const expiresAt = new Date();
expiresAt.setHours(expiresAt.getHours() + 24);

// Store token in enrollmentTokens collection
await db.collection('enrollmentTokens').add({
  contactId,
  token,
  expiresAt,
  used: false,
  createdAt: admin.firestore.FieldValue.serverTimestamp(),
  createdBy: 'captureWebLead',
  ipAddress: request.ip || 'unknown',
  userAgent: request.headers['user-agent'] || 'unknown'
});

console.log('🔐 Enrollment token generated:', token.substring(0, 10) + '...');

            result = {
              success: true,
              contactId,
              token, // ← Token for enrollment redirect
              isNewContact: !existingContactId,
              message: existingContactId 
                ? 'Contact updated successfully' 
                : 'New lead captured successfully'
            };
            
            console.log(`✅ ${action} completed:`, result);
            
          } catch (leadError) {
            console.error(`❌ ${action} error:`, leadError);
            result = {
              success: false,
              error: leadError.message
            };
          }
          
          break;
        }
        
        // ============================================
        // CREATE PORTAL ACCOUNT
        // ============================================
        case 'createPortalAccount': {
          console.log('🔧 Processing createPortalAccount...');
          
          const { contactId, email, password } = params;
          
          if (!contactId || !email) {
            response.status(400).json({
              success: false,
              error: 'contactId and email are required'
            });
            return;
          }
          
          try {
            // Create Firebase Auth user
            const userRecord = await admin.auth().createUser({
              email: email,
              password: password || Math.random().toString(36).slice(-12),
              emailVerified: false
            });
            
            // Update contact with portal account info
            await db.collection('contacts').doc(contactId).update({
              portalUserId: userRecord.uid,
              portalCreatedAt: admin.firestore.FieldValue.serverTimestamp(),
              roles: admin.firestore.FieldValue.arrayUnion('client'),
              status: 'client'
            });
            
            // ===== CREATE USER PROFILE FOR AUTH/ROLE SYSTEM =====
            // AuthContext reads from userProfiles collection to determine
            // the user's role and permissions. Without this, the client
            // would get role: 'user' on first login instead of 'client'.
            await db.collection('userProfiles').doc(userRecord.uid).set({
              uid: userRecord.uid,
              email: email,
              displayName: params.firstName 
                ? `${params.firstName} ${params.lastName || ''}`.trim()
                : email,
              role: 'client',
              contactId: contactId,
              permissions: ['read_basic', 'client_portal'],
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            
            console.log('✅ userProfiles document created for:', email);
            
            result = {
              success: true,
              portalUserId: userRecord.uid,
              message: 'Portal account created successfully'
            };
            
            console.log('✅ Portal account created for:', email);
            
          } catch (portalError) {
            console.error('❌ Create portal account error:', portalError);
            result = {
              success: false,
              error: portalError.message
            };
          }
          
          break;
        }
        
        // ============================================
    // VALIDATE ENROLLMENT TOKEN
    // Called by PublicEnrollmentRoute.jsx when a prospect
    // clicks their enrollment link from the landing page.
    // Checks if the token is valid, not expired, not used.
    // ============================================
    case 'validateEnrollmentToken': {
      console.log('🔍 Processing validateEnrollmentToken...');
      
      const { token: enrollToken, contactId: tokenContactId } = params;
      
      // ===== VALIDATE REQUIRED FIELDS =====
      if (!enrollToken || !tokenContactId) {
        response.status(400).json({
          success: false,
          error: 'Token and contactId are required',
          valid: false
        });
        return;
      }
      
      try {
        // ===== FIND THE TOKEN IN FIRESTORE =====
        // We search the enrollmentTokens collection for a matching token
        const tokenQuery = await db.collection('enrollmentTokens')
          .where('token', '==', enrollToken)
          .where('contactId', '==', tokenContactId)
          .limit(1)
          .get();
        
        // ===== CHECK IF TOKEN EXISTS =====
        if (tokenQuery.empty) {
          console.log('❌ Token not found in database');
          result = {
            success: true,
            valid: false,
            error: 'Invalid enrollment link. Please request a new one.',
            invalid: true
          };
          break;
        }
        
        const tokenDoc = tokenQuery.docs[0];
        const tokenData = tokenDoc.data();
        
        // ===== CHECK IF TOKEN ALREADY USED =====
        if (tokenData.used === true) {
          console.log('⚠️ Token already used');
          result = {
            success: true,
            valid: false,
            error: 'This enrollment link has already been used. Please sign in to your account.',
            alreadyUsed: true
          };
          break;
        }
        
        // ===== CHECK IF TOKEN IS EXPIRED =====
        // Tokens expire after 24 hours
        const expiresAt = tokenData.expiresAt?.toDate 
          ? tokenData.expiresAt.toDate() 
          : new Date(tokenData.expiresAt);
        
        if (expiresAt < new Date()) {
          console.log('⏰ Token has expired');
          result = {
            success: true,
            valid: false,
            error: 'This enrollment link has expired. Please request a new one from our website.',
            expired: true
          };
          break;
        }
        
        // ===== TOKEN IS VALID - FETCH CONTACT DATA =====
        console.log('✅ Token is valid! Fetching contact data...');
        
        const contactDoc = await db.collection('contacts').doc(tokenContactId).get();
        
        if (!contactDoc.exists) {
          console.log('❌ Contact not found for token');
          result = {
            success: true,
            valid: false,
            error: 'Contact not found. Please request a new enrollment link.',
            invalid: true
          };
          break;
        }
        
        const contactData = contactDoc.data();
        
        // ===== RETURN SUCCESS WITH CONTACT DATA =====
        // PublicEnrollmentRoute will use this to pre-fill the form
        result = {
          success: true,
          valid: true,
          contact: {
            id: tokenContactId,
            firstName: contactData.firstName || '',
            lastName: contactData.lastName || '',
            email: contactData.email || '',
            phone: contactData.phone || ''
          }
        };
        
        console.log('✅ Token validated for:', contactData.firstName, contactData.lastName);
        
      } catch (validateError) {
        console.error('❌ Token validation error:', validateError);
        result = {
          success: false,
          valid: false,
          error: 'Failed to validate enrollment link. Please try again.'
        };
      }
      
      break;
    }
    
    // ============================================
    // MARK ENROLLMENT TOKEN AS USED
    // Called after a prospect successfully completes enrollment.
    // Prevents the same token from being used again.
    // ============================================
    case 'markTokenUsed': {
      console.log('🔒 Processing markTokenUsed...');
      
      const { token: usedToken, contactId: usedContactId } = params;
      
      // ===== VALIDATE REQUIRED FIELDS =====
      if (!usedToken || !usedContactId) {
        response.status(400).json({
          success: false,
          error: 'Token and contactId are required'
        });
        return;
      }
      
      try {
        // ===== FIND THE TOKEN =====
        const usedTokenQuery = await db.collection('enrollmentTokens')
          .where('token', '==', usedToken)
          .where('contactId', '==', usedContactId)
          .limit(1)
          .get();
        
        if (usedTokenQuery.empty) {
          console.log('⚠️ Token not found for marking as used');
          result = {
            success: false,
            error: 'Token not found'
          };
          break;
        }
        
        // ===== MARK TOKEN AS USED =====
        const usedTokenDoc = usedTokenQuery.docs[0];
        await usedTokenDoc.ref.update({
          used: true,
          usedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        console.log('✅ Token marked as used for contact:', usedContactId);
        
        result = {
          success: true,
          message: 'Token marked as used'
        };
        
      } catch (markError) {
        console.error('❌ Mark token used error:', markError);
        result = {
          success: false,
          error: markError.message
        };
      }
      
      break;
    }


    // ============================================================
    // PAYMENT PROCESSING CASES (NMI Gateway via paymentGateway.js)
    // ============================================================

    case 'processNewEnrollment': {
      console.log('💳 ===== PROCESS NEW ENROLLMENT =====');
      console.log(`Contact: ${params.contactId}, Plan: ${params.planId}`);

      // ===== Validate required fields =====
      if (!params.contactId) {
        response.status(400).json({ success: false, error: 'contactId is required' });
        return;
      }
      if (!params.planId) {
        response.status(400).json({ success: false, error: 'planId is required' });
        return;
      }
      if (!params.firstName || !params.lastName) {
        response.status(400).json({ success: false, error: 'firstName and lastName are required' });
        return;
      }

      // ===== Must have either bank account OR credit card =====
      const hasACH = params.checkAccount && params.checkAba;
      const hasCC = params.ccNumber && params.ccExp;
      if (!hasACH && !hasCC) {
        response.status(400).json({ success: false, error: 'Must provide bank account (checkAccount + checkAba) or credit card (ccNumber + ccExp)' });
        return;
      }

      try {
        const enrollResult = await payment.processNewEnrollment(params);

        // ===== If successful, update the contact document in Firestore =====
        if (enrollResult.success && enrollResult.firestoreData) {
          const contactRef = db.collection('contacts').doc(params.contactId);
          await contactRef.update({
            ...enrollResult.firestoreData,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          console.log(`✅ Contact ${params.contactId} updated with billing info`);

          // ===== Also log to payments collection for audit trail =====
          await db.collection('payments').add({
            contactId: params.contactId,
            type: 'enrollment',
            planId: params.planId,
            planName: enrollResult.planName,
            monthlyAmount: enrollResult.firestoreData.billingMonthlyAmount,
            setupFee: enrollResult.firestoreData.billingSetupFee,
            nmiVaultId: enrollResult.vaultId,
            nmiSubscriptionId: enrollResult.subscriptionId,
            setupFeeTransactionId: enrollResult.setupFeeTransactionId || null,
            status: 'active',
            steps: enrollResult.steps,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            createdBy: 'system',
          });
          console.log('✅ Payment audit log created');
        }

        result = {
          success: enrollResult.success,
          vaultId: enrollResult.vaultId || null,
          subscriptionId: enrollResult.subscriptionId || null,
          planName: enrollResult.planName || null,
          error: enrollResult.error || null,
          steps: enrollResult.steps || [],
        };

      } catch (enrollError) {
        console.error('❌ processNewEnrollment error:', enrollError);
        result = { success: false, error: enrollError.message };
      }

      break;
    }


    case 'chargeCustomer': {
      console.log('💰 ===== CHARGE CUSTOMER =====');

      if (!params.contactId) {
        response.status(400).json({ success: false, error: 'contactId is required' });
        return;
      }
      if (!params.amount || params.amount <= 0) {
        response.status(400).json({ success: false, error: 'Valid amount is required' });
        return;
      }

      try {
        // ===== Get the vault ID from the contact's Firestore document =====
        const chargeContactDoc = await db.collection('contacts').doc(params.contactId).get();
        if (!chargeContactDoc.exists) {
          result = { success: false, error: 'Contact not found' };
          break;
        }
        const chargeContact = chargeContactDoc.data();
        if (!chargeContact.nmiVaultId) {
          result = { success: false, error: 'No payment method on file. Client must complete ACH authorization first.' };
          break;
        }

        const chargeResult = await payment.chargeCustomer({
          vaultId: chargeContact.nmiVaultId,
          amount: params.amount,
          description: params.description || 'Speedy Credit Repair Service',
          orderId: `CHG-${params.contactId}-${Date.now()}`,
          paymentType: chargeContact.paymentType || 'ach',
        });

        // ===== Log to payments collection =====
        if (chargeResult.firestoreData) {
          await db.collection('payments').add({
            contactId: params.contactId,
            type: 'one_time',
            ...chargeResult.firestoreData,
            description: params.description || 'Service charge',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            createdBy: params.initiatedBy || 'system',
          });
        }

        result = {
          success: chargeResult.success,
          transactionId: chargeResult.transactionId || null,
          amount: params.amount,
          message: chargeResult.message,
          error: chargeResult.success ? null : chargeResult.message,
        };

      } catch (chargeError) {
        console.error('❌ chargeCustomer error:', chargeError);
        result = { success: false, error: chargeError.message };
      }

      break;
    }


    case 'cancelSubscription': {
      console.log('🛑 ===== CANCEL SUBSCRIPTION =====');

      if (!params.contactId) {
        response.status(400).json({ success: false, error: 'contactId is required' });
        return;
      }

      try {
        const cancelContactDoc = await db.collection('contacts').doc(params.contactId).get();
        if (!cancelContactDoc.exists) {
          result = { success: false, error: 'Contact not found' };
          break;
        }
        const cancelContact = cancelContactDoc.data();
        if (!cancelContact.nmiSubscriptionId) {
          result = { success: false, error: 'No active subscription found for this contact' };
          break;
        }

        const cancelResult = await payment.cancelRecurring({
          subscriptionId: cancelContact.nmiSubscriptionId,
        });

        // ===== Update contact document =====
        if (cancelResult.success) {
          await db.collection('contacts').doc(params.contactId).update({
            billingStatus: 'cancelled',
            billingCancelledAt: admin.firestore.FieldValue.serverTimestamp(),
            billingCancelReason: params.reason || 'Not specified',
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          // ===== Audit log =====
          await db.collection('payments').add({
            contactId: params.contactId,
            type: 'cancellation',
            nmiSubscriptionId: cancelContact.nmiSubscriptionId,
            reason: params.reason || 'Not specified',
            status: 'cancelled',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            createdBy: params.initiatedBy || 'admin',
          });
        }

        result = {
          success: cancelResult.success,
          message: cancelResult.message,
          error: cancelResult.success ? null : cancelResult.message,
        };

      } catch (cancelError) {
        console.error('❌ cancelSubscription error:', cancelError);
        result = { success: false, error: cancelError.message };
      }

      break;
    }


    case 'processRefund': {
      console.log('💸 ===== PROCESS REFUND =====');

      if (!params.transactionId) {
        response.status(400).json({ success: false, error: 'transactionId is required' });
        return;
      }

      try {
        const refundResult = await payment.processRefund({
          transactionId: params.transactionId,
          amount: params.amount || null,
        });

        // ===== Audit log =====
        if (refundResult.firestoreData) {
          await db.collection('payments').add({
            contactId: params.contactId || 'unknown',
            type: 'refund',
            originalTransactionId: params.transactionId,
            ...refundResult.firestoreData,
            reason: params.reason || 'Not specified',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            createdBy: params.initiatedBy || 'admin',
          });
        }

        result = {
          success: refundResult.success,
          refundTransactionId: refundResult.refundTransactionId || null,
          amount: refundResult.amount,
          message: refundResult.message,
          error: refundResult.success ? null : refundResult.message,
        };

      } catch (refundError) {
        console.error('❌ processRefund error:', refundError);
        result = { success: false, error: refundError.message };
      }

      break;
    }


    case 'updatePaymentMethod': {
      console.log('📝 ===== UPDATE PAYMENT METHOD =====');

      if (!params.contactId) {
        response.status(400).json({ success: false, error: 'contactId is required' });
        return;
      }

      try {
        const updateContactDoc = await db.collection('contacts').doc(params.contactId).get();
        if (!updateContactDoc.exists) {
          result = { success: false, error: 'Contact not found' };
          break;
        }
        const updateContact = updateContactDoc.data();
        if (!updateContact.nmiVaultId) {
          result = { success: false, error: 'No vault record found. Client must enroll first.' };
          break;
        }

        const updateResult = await payment.updateVault({
          vaultId: updateContact.nmiVaultId,
          ...params,
        });

        // ===== Update contact document with new payment info =====
        if (updateResult.success && updateResult.firestoreData) {
          await db.collection('contacts').doc(params.contactId).update({
            ...updateResult.firestoreData,
            bankName: params.bankName || updateContact.bankName,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          // ===== Audit log =====
          await db.collection('payments').add({
            contactId: params.contactId,
            type: 'payment_method_update',
            paymentType: updateResult.firestoreData.paymentType,
            lastFour: updateResult.firestoreData.lastFour,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            createdBy: params.initiatedBy || 'client',
          });
        }

        result = {
          success: updateResult.success,
          message: updateResult.message,
          error: updateResult.success ? null : updateResult.message,
        };

      } catch (updateError) {
        console.error('❌ updatePaymentMethod error:', updateError);
        result = { success: false, error: updateError.message };
      }

      break;
    }


    case 'chargeDeletionFee': {
      console.log('🎯 ===== CHARGE DELETION FEE =====');

      if (!params.contactId) {
        response.status(400).json({ success: false, error: 'contactId is required' });
        return;
      }

      try {
        const delContactDoc = await db.collection('contacts').doc(params.contactId).get();
        if (!delContactDoc.exists) {
          result = { success: false, error: 'Contact not found' };
          break;
        }
        const delContact = delContactDoc.data();
        if (!delContact.nmiVaultId) {
          result = { success: false, error: 'No payment method on file' };
          break;
        }

        const delResult = await payment.chargeDeletionFee({
          vaultId: delContact.nmiVaultId,
          contactId: params.contactId,
          itemName: params.itemName || 'Deleted Item',
          bureau: params.bureau || 'Bureau',
          planId: delContact.billingPlanId || 'professional',
          paymentType: delContact.paymentType || 'ach',
        });

        // ===== Audit log =====
        if (delResult.firestoreData && !delResult.skipped) {
          await db.collection('payments').add({
            contactId: params.contactId,
            ...delResult.firestoreData,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            createdBy: 'system',
          });
        }

        result = {
          success: delResult.success,
          amount: delResult.amount || 0,
          skipped: delResult.skipped || false,
          message: delResult.message,
          error: delResult.success ? null : delResult.message,
        };

      } catch (delError) {
        console.error('❌ chargeDeletionFee error:', delError);
        result = { success: false, error: delError.message };
      }

      break;
    }


    case 'getPaymentStatus': {
      console.log('📊 ===== GET PAYMENT STATUS =====');

      if (!params.contactId) {
        response.status(400).json({ success: false, error: 'contactId is required' });
        return;
      }

      try {
        const statusContactDoc = await db.collection('contacts').doc(params.contactId).get();
        if (!statusContactDoc.exists) {
          result = { success: false, error: 'Contact not found' };
          break;
        }
        const statusContact = statusContactDoc.data();

        // ===== Get recent payments =====
        const paymentsSnapshot = await db
          .collection('payments')
          .where('contactId', '==', params.contactId)
          .orderBy('createdAt', 'desc')
          .limit(10)
          .get();

        const recentPayments = paymentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
        }));

        result = {
          success: true,
          billing: {
            hasPaymentOnFile: !!statusContact.nmiVaultId,
            paymentType: statusContact.paymentType || null,
            lastFour: statusContact.lastFour || null,
            bankName: statusContact.bankName || null,
            planId: statusContact.billingPlanId || null,
            planName: statusContact.billingPlanName || null,
            monthlyAmount: statusContact.billingMonthlyAmount || null,
            status: statusContact.billingStatus || 'none',
            enrolledAt: statusContact.billingEnrolledAt || null,
            cancelledAt: statusContact.billingCancelledAt || null,
          },
          recentPayments: recentPayments,
        };

      } catch (statusError) {
        console.error('❌ getPaymentStatus error:', statusError);
        result = { success: false, error: statusError.message };
      }

      break;
    }

    // ============================================================
    // CAN-SPAM UNSUBSCRIBE — Process opt-out requests
    // ============================================================
    // Called when a user clicks the unsubscribe link in any email.
    // The link format is:
    //   POST { action: 'processUnsubscribe', email: 'user@example.com' }
    //   OR via GET (one-click from email): handled above in GET handler
    //
    // Sets emailOptOut=true on the contact, preventing all future
    // marketing emails. Transactional emails (payment receipts,
    // security alerts) are NOT affected per CAN-SPAM guidelines.
    // ============================================================
    case 'processUnsubscribe': {
      console.log('📧 ===== PROCESS UNSUBSCRIBE REQUEST =====');
      
      const unsubEmail = (params.email || '').trim().toLowerCase();
      
      if (!unsubEmail || !unsubEmail.includes('@')) {
        response.status(400).json({
          success: false,
          error: 'Valid email address is required'
        });
        return;
      }
      
      try {
        // ===== Find contact by email =====
        let contactFound = false;
        
        // Search primary email field
        const emailQuery = await db.collection('contacts')
          .where('email', '==', unsubEmail)
          .get();
        
        if (!emailQuery.empty) {
          const batch = admin.firestore().batch();
          emailQuery.docs.forEach(doc => {
            batch.update(doc.ref, {
              emailOptOut: true,
              unsubscribed: true,
              unsubscribedAt: admin.firestore.FieldValue.serverTimestamp(),
              unsubscribeSource: 'email_link',
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
              timeline: admin.firestore.FieldValue.arrayUnion({
                id: Date.now(),
                type: 'unsubscribed',
                description: 'Contact unsubscribed from marketing emails via CAN-SPAM link',
                timestamp: new Date().toISOString(),
                source: 'system'
              })
            });
          });
          await batch.commit();
          contactFound = true;
          console.log(`✅ Unsubscribed ${emailQuery.size} contact(s) for: ${unsubEmail}`);
        }
        
        // Also check emails array (some contacts store email in emails[].address)
        // Firestore doesn't support array-contains on nested fields, so we
        // add to a suppression list as a backup
        await db.collection('emailSuppressionList').doc(unsubEmail).set({
          email: unsubEmail,
          reason: 'unsubscribe',
          source: 'email_link',
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        console.log(`📝 Added ${unsubEmail} to suppression list`);
        
        // Log the unsubscribe event
        await db.collection('activityLogs').add({
          type: 'unsubscribe',
          action: 'email_opt_out',
          email: unsubEmail,
          contactFound: contactFound,
          contactCount: emailQuery?.size || 0,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          createdBy: 'system:unsubscribe'
        });
        
        result = {
          success: true,
          message: 'Successfully unsubscribed',
          email: unsubEmail
        };
        
      } catch (unsubError) {
        console.error('❌ Unsubscribe error:', unsubError);
        result = { success: false, error: 'Failed to process unsubscribe request' };
      }
      
      break;
    }

    // ============================================================
    // NMI PAYMENT WEBHOOK — Receives POST from NMI Gateway
    // ============================================================
    // NMI sends webhooks when payment events occur (success, failure,
    // refund, chargeback, etc.). Configure NMI to POST to:
    //   https://us-central1-<project>.cloudfunctions.net/operationsManager
    //   with body: { action: 'nmiWebhook', ...nmiFields }
    //
    // OR configure NMI to POST directly with its native format — this
    // handler auto-detects NMI's form-encoded data vs JSON.
    //
    // CRITICAL: Prevents silent revenue loss by alerting staff immediately
    // when a recurring payment fails, so they can contact the client.
    // ============================================================
    case 'nmiWebhook': {
      console.log('💳 ===== NMI WEBHOOK RECEIVED =====');
      
      // ===== PARSE NMI PAYLOAD =====
      // NMI can send form-encoded or JSON depending on config.
      // We normalize everything into a clean object.
      const nmiData = {
        eventType: params.event_type || params.eventType || params.type || 'unknown',
        condition: params.condition || params.status || 'unknown',
        transactionId: params.transaction_id || params.transactionId || null,
        orderId: params.order_id || params.orderId || null,
        amount: params.amount || '0.00',
        customerVaultId: params.customer_vault_id || params.customerVaultId || null,
        subscriptionId: params.subscription_id || params.subscriptionId || params.billing_id || null,
        firstName: params.first_name || params.firstName || '',
        lastName: params.last_name || params.lastName || '',
        email: params.email || '',
        responseText: params.responsetext || params.response_text || params.responseText || '',
        responseCode: params.response_code || params.responseCode || '',
        avsResponse: params.avsresponse || '',
        cvvResponse: params.cvvresponse || '',
      };
      
      console.log('💳 NMI Webhook Data:', {
        eventType: nmiData.eventType,
        condition: nmiData.condition,
        transactionId: nmiData.transactionId,
        amount: nmiData.amount,
        customerVaultId: nmiData.customerVaultId,
        subscriptionId: nmiData.subscriptionId,
        responseText: nmiData.responseText
      });
      
      // ===== FIND THE CONTACT in Firestore =====
      // Match by NMI vault ID first, then subscription ID as fallback
      let matchedContactId = null;
      let matchedContactData = null;
      
      try {
        // Try matching by vault ID (most reliable)
        if (nmiData.customerVaultId) {
          const vaultQuery = await db.collection('contacts')
            .where('nmiVaultId', '==', nmiData.customerVaultId)
            .limit(1)
            .get();
          
          if (!vaultQuery.empty) {
            matchedContactId = vaultQuery.docs[0].id;
            matchedContactData = vaultQuery.docs[0].data();
            console.log(`✅ Matched contact by vault ID: ${matchedContactId}`);
          }
        }
        
        // Fallback: match by subscription ID
        if (!matchedContactId && nmiData.subscriptionId) {
          const subQuery = await db.collection('contacts')
            .where('nmiSubscriptionId', '==', nmiData.subscriptionId)
            .limit(1)
            .get();
          
          if (!subQuery.empty) {
            matchedContactId = subQuery.docs[0].id;
            matchedContactData = subQuery.docs[0].data();
            console.log(`✅ Matched contact by subscription ID: ${matchedContactId}`);
          }
        }
      } catch (lookupErr) {
        console.error('❌ Contact lookup error:', lookupErr.message);
      }
      
      // ===== DETERMINE EVENT TYPE =====
      const isFailure = 
        nmiData.condition === 'failed' ||
        nmiData.condition === 'declined' ||
        nmiData.eventType === 'transaction.sale.failure' ||
        nmiData.eventType === 'payment_failed' ||
        nmiData.responseText?.toLowerCase().includes('decline') ||
        nmiData.responseText?.toLowerCase().includes('fail') ||
        (nmiData.responseCode && nmiData.responseCode !== '100' && nmiData.responseCode !== '00');
      
      const isSuccess = 
        nmiData.condition === 'complete' ||
        nmiData.condition === 'pendingsettlement' ||
        nmiData.eventType === 'transaction.sale.success' ||
        nmiData.responseCode === '100';
      
      const isRefund = 
        nmiData.eventType === 'refund' ||
        nmiData.eventType === 'transaction.refund.success' ||
        (nmiData.eventType || '').toLowerCase().includes('refund');
      
      const isChargeback = 
        nmiData.eventType === 'chargeback' ||
        (nmiData.eventType || '').toLowerCase().includes('chargeback');
      
      // ===== LOG TO PAYMENTS COLLECTION (always, for all event types) =====
      const paymentLogRef = await db.collection('payments').add({
        contactId: matchedContactId || 'unmatched',
        type: 'nmi_webhook',
        eventType: nmiData.eventType,
        condition: nmiData.condition,
        transactionId: nmiData.transactionId,
        orderId: nmiData.orderId,
        amount: parseFloat(nmiData.amount) || 0,
        customerVaultId: nmiData.customerVaultId,
        subscriptionId: nmiData.subscriptionId,
        responseText: nmiData.responseText,
        responseCode: nmiData.responseCode,
        status: isFailure ? 'failed' : isSuccess ? 'success' : isRefund ? 'refunded' : isChargeback ? 'chargeback' : 'unknown',
        rawPayload: params,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        source: 'nmi_webhook'
      });
      
      console.log(`📝 Payment event logged: ${paymentLogRef.id} (${isFailure ? 'FAILED' : isSuccess ? 'SUCCESS' : nmiData.condition})`);
      
      // ===== HANDLE PAYMENT FAILURE =====
      if (isFailure) {
        console.log('❌ PAYMENT FAILURE DETECTED — Alerting staff and client...');
        
        const contactName = matchedContactData
          ? `${matchedContactData.firstName || ''} ${matchedContactData.lastName || ''}`.trim()
          : `${nmiData.firstName} ${nmiData.lastName}`.trim() || 'Unknown Client';
        
        const contactEmail = matchedContactData?.email || 
          (matchedContactData?.emails && matchedContactData.emails[0]?.address) || 
          nmiData.email || null;
        
        const contactPhone = matchedContactData?.phone ||
          (matchedContactData?.phones && matchedContactData.phones[0]?.number) || null;
        
        // ─── 1) UPDATE CONTACT: Mark payment as failed ───────────────────
        if (matchedContactId) {
          try {
            await db.collection('contacts').doc(matchedContactId).update({
              billingStatus: 'payment_failed',
              billingLastFailure: admin.firestore.FieldValue.serverTimestamp(),
              billingFailureReason: nmiData.responseText || 'Payment declined',
              billingFailureCount: admin.firestore.FieldValue.increment(1),
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
              timeline: admin.firestore.FieldValue.arrayUnion({
                id: Date.now(),
                type: 'payment_failed',
                description: `Payment of $${nmiData.amount} failed: ${nmiData.responseText || 'Declined'}`,
                timestamp: new Date().toISOString(),
                metadata: {
                  transactionId: nmiData.transactionId,
                  amount: nmiData.amount,
                  reason: nmiData.responseText
                },
                source: 'system'
              })
            });
            console.log(`✅ Contact ${matchedContactId} marked as payment_failed`);
          } catch (updateErr) {
            console.error('⚠️ Failed to update contact billing status:', updateErr.message);
          }
        }
        
        // ─── 2) STAFF NOTIFICATION: Bell + Toast + Chime ─────────────────
        try {
          await db.collection('staffNotifications').add({
            type: 'warning',
            priority: 'critical',
            title: `💳 Payment Failed: ${contactName} — $${nmiData.amount}`,
            message: `Reason: ${nmiData.responseText || 'Declined'}. ${contactEmail ? `Email: ${contactEmail}` : ''} ${contactPhone ? `Phone: ${contactPhone}` : ''}. Contact client to update payment method.`,
            contactId: matchedContactId || null,
            contactName: contactName,
            contactEmail: contactEmail,
            contactPhone: contactPhone,
            leadScore: null,
            source: 'nmi_webhook',
            targetRoles: ['masterAdmin', 'admin', 'manager', 'user'],
            readBy: {},
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            createdBy: 'system:nmi_webhook',
            paymentDetails: {
              amount: nmiData.amount,
              transactionId: nmiData.transactionId,
              reason: nmiData.responseText,
              vaultId: nmiData.customerVaultId
            }
          });
          console.log('🔔 Staff notification created for payment failure');
        } catch (notifErr) {
          console.warn('⚠️ Staff notification for payment failure failed:', notifErr.message);
        }
        
        // ─── 3) CREATE FOLLOW-UP TASK ────────────────────────────────────
        try {
          await db.collection('tasks').add({
            title: `💳 Payment Failed: ${contactName} — $${nmiData.amount}`,
            description: 
              `A recurring payment has failed and needs attention.\n\n` +
              `Client: ${contactName}\n` +
              `Amount: $${nmiData.amount}\n` +
              `Reason: ${nmiData.responseText || 'Declined'}\n` +
              `Transaction ID: ${nmiData.transactionId || 'N/A'}\n` +
              `Email: ${contactEmail || 'N/A'}\n` +
              `Phone: ${contactPhone || 'N/A'}\n\n` +
              `Action needed: Contact client to update their payment method.\n` +
              `If not resolved within 48 hours, consider pausing their service.`,
            contactId: matchedContactId || null,
            type: 'payment_failure',
            priority: 'high',
            status: 'pending',
            dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Due in 24 hours
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            createdBy: 'system:nmi_webhook'
          });
          console.log('📋 Follow-up task created for payment failure');
        } catch (taskErr) {
          console.warn('⚠️ Follow-up task creation failed:', taskErr.message);
        }
        
        // ─── 4) EMAIL ALERT TO STAFF ─────────────────────────────────────
        try {
          const staffEmail = gmailUser.value();
          const staffPass = gmailAppPassword.value();
          
          if (staffEmail && staffPass) {
            const transporter = nodemailer.createTransport({
              host: 'smtp.gmail.com',
              port: 587,
              secure: false,
              auth: { user: staffEmail, pass: staffPass }
            });
            
            await transporter.sendMail({
              from: `"SpeedyCRM Alerts" <${staffEmail}>`,
              to: staffEmail,
              subject: `💳 PAYMENT FAILED: ${contactName} — $${nmiData.amount}`,
              html: wrapEmailInHTML(
                'Payment Failure Alert',
                `A recurring payment has failed.\n\n` +
                `<strong>Client:</strong> ${contactName}\n` +
                `<strong>Amount:</strong> $${nmiData.amount}\n` +
                `<strong>Reason:</strong> ${nmiData.responseText || 'Declined'}\n` +
                `<strong>Transaction:</strong> ${nmiData.transactionId || 'N/A'}\n` +
                `<strong>Email:</strong> ${contactEmail || 'N/A'}\n` +
                `<strong>Phone:</strong> ${contactPhone || 'N/A'}\n\n` +
                `<strong>⏰ Contact the client within 24 hours to update their payment method.</strong>\n\n` +
                (matchedContactId 
                  ? `<a href="https://myclevercrm.com/contacts/${matchedContactId}" style="color:#090;">View Contact in CRM →</a>`
                  : `⚠️ Could not match this payment to a contact. Vault ID: ${nmiData.customerVaultId || 'N/A'}`),
                'Chris'
              )
            });
            console.log('📧 Payment failure alert emailed to staff');
          }
        } catch (staffEmailErr) {
          console.warn('⚠️ Staff email alert failed:', staffEmailErr.message);
        }
        
        // ─── 5) EMAIL NOTIFICATION TO CLIENT ─────────────────────────────
        if (contactEmail) {
          try {
            const clientEmailUser = gmailUser.value();
            const clientEmailPass = gmailAppPassword.value();
            const fromName = gmailFromName.value() || 'Speedy Credit Repair';
            const replyTo = gmailReplyTo.value() || 'contact@speedycreditrepair.com';
            
            if (clientEmailUser && clientEmailPass) {
              const transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                auth: { user: clientEmailUser, pass: clientEmailPass }
              });
              
              const clientFirstName = matchedContactData?.firstName || nmiData.firstName || 'there';
              
              await transporter.sendMail({
                from: `"${fromName}" <${clientEmailUser}>`,
                replyTo: replyTo,
                to: contactEmail,
                subject: `Action Needed: Payment Update Required — Speedy Credit Repair`,
                html: wrapEmailInHTML(
                  'Payment Update Required',
                  `We noticed that your recent payment of <strong>$${nmiData.amount}</strong> was not processed successfully.\n\n` +
                  `Don't worry — this happens occasionally with card expirations, insufficient funds, or bank holds. Your credit repair service is still active, but we need you to update your payment information to avoid any interruption.\n\n` +
                  `<strong><a href="https://myclevercrm.com/client-portal" style="color:#090;font-size:16px;">👉 Update Your Payment Method</a></strong>\n\n` +
                  `Or simply reply to this email or call us at <strong>1-888-724-7344</strong> and we'll help you get it sorted out.\n\n` +
                  `We're here to help and want to make sure your credit repair journey continues without a hitch!`,
                  clientFirstName
                )
              });
              console.log(`📧 Payment failure notice sent to client: ${contactEmail}`);
              
              // Log the client email
              await db.collection('emailLog').add({
                contactId: matchedContactId || null,
                recipientEmail: contactEmail,
                recipientName: contactName,
                templateId: 'payment-failure-notice',
                subject: 'Action Needed: Payment Update Required — Speedy Credit Repair',
                type: 'payment_failure',
                source: 'nmi_webhook',
                sentAt: admin.firestore.FieldValue.serverTimestamp(),
                status: 'sent'
              });
            }
          } catch (clientEmailErr) {
            console.warn('⚠️ Client payment failure email failed:', clientEmailErr.message);
          }
        }
        
        // ─── 6) LOG ACTIVITY ─────────────────────────────────────────────
        try {
          await db.collection('activityLogs').add({
            type: 'payment_failed',
            contactId: matchedContactId || null,
            action: 'nmi_webhook_payment_failure',
            details: {
              amount: nmiData.amount,
              reason: nmiData.responseText,
              transactionId: nmiData.transactionId,
              vaultId: nmiData.customerVaultId,
              staffNotified: true,
              clientNotified: !!contactEmail,
              taskCreated: true
            },
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            createdBy: 'system:nmi_webhook'
          });
        } catch (logErr) {
          console.warn('⚠️ Activity log for payment failure failed:', logErr.message);
        }
      }
      
      // ===== HANDLE PAYMENT SUCCESS =====
      if (isSuccess && matchedContactId) {
        console.log(`✅ Payment SUCCESS for ${matchedContactId}: $${nmiData.amount}`);
        
        try {
          // Reset failure status if previously failed
          const resetFields = {
            billingStatus: 'active',
            billingLastPayment: admin.firestore.FieldValue.serverTimestamp(),
            billingLastPaymentAmount: parseFloat(nmiData.amount) || 0,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          };
          
          if (matchedContactData?.billingStatus === 'payment_failed') {
            resetFields.billingFailureCount = 0;
            resetFields.billingFailureReason = null;
            resetFields.timeline = admin.firestore.FieldValue.arrayUnion({
              id: Date.now(),
              type: 'payment_recovered',
              description: `Payment recovered: $${nmiData.amount} processed successfully after previous failure`,
              timestamp: new Date().toISOString(),
              metadata: { transactionId: nmiData.transactionId, amount: nmiData.amount },
              source: 'system'
            });
          }
          
          await db.collection('contacts').doc(matchedContactId).update(resetFields);
          console.log(`✅ Contact ${matchedContactId} billing status updated to active`);
        } catch (successErr) {
          console.warn('⚠️ Failed to update contact on payment success:', successErr.message);
        }
      }
      
      // ===== HANDLE CHARGEBACK =====
      if (isChargeback) {
        console.log('🚨 CHARGEBACK DETECTED — Immediate attention required!');
        
        const cbName = matchedContactData
          ? `${matchedContactData.firstName || ''} ${matchedContactData.lastName || ''}`.trim()
          : `${nmiData.firstName} ${nmiData.lastName}`.trim() || 'Unknown';
        
        try {
          await db.collection('staffNotifications').add({
            type: 'error',
            priority: 'critical',
            title: `🚨 CHARGEBACK: ${cbName} — $${nmiData.amount}`,
            message: `Chargeback received! Transaction: ${nmiData.transactionId || 'N/A'}. Respond within the chargeback window.`,
            contactId: matchedContactId || null,
            contactName: cbName,
            targetRoles: ['masterAdmin', 'admin'],
            readBy: {},
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            createdBy: 'system:nmi_webhook'
          });
        } catch (cbNotifErr) {
          console.warn('⚠️ Chargeback notification failed:', cbNotifErr.message);
        }
        
        try {
          await db.collection('tasks').add({
            title: `🚨 CHARGEBACK: ${cbName} — $${nmiData.amount}`,
            description: `A chargeback has been filed. Respond within the chargeback window (usually 7-14 days).\n\nTransaction: ${nmiData.transactionId || 'N/A'}\nAmount: $${nmiData.amount}\n\nGather: signed contract, service records, communications.`,
            contactId: matchedContactId || null,
            type: 'chargeback',
            priority: 'critical',
            status: 'pending',
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            createdBy: 'system:nmi_webhook'
          });
        } catch (cbTaskErr) {
          console.warn('⚠️ Chargeback task creation failed:', cbTaskErr.message);
        }
        
        if (matchedContactId) {
          try {
            await db.collection('contacts').doc(matchedContactId).update({
              billingStatus: 'chargeback',
              chargebackAt: admin.firestore.FieldValue.serverTimestamp(),
              chargebackAmount: parseFloat(nmiData.amount) || 0,
              chargebackTransactionId: nmiData.transactionId,
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
          } catch (cbUpdateErr) {
            console.warn('⚠️ Chargeback contact update failed:', cbUpdateErr.message);
          }
        }
      }
      
      // ===== ALWAYS RESPOND 200 to NMI =====
      // NMI expects 200. Errors cause retries and duplicate processing.
      result = {
        success: true,
        message: 'Webhook processed',
        eventType: nmiData.eventType,
        condition: nmiData.condition,
        contactMatched: !!matchedContactId,
        paymentLogId: paymentLogRef.id
      };
      break;
    }

    
    default:
      console.error(`❌ Unknown action requested: ${action}`);
      response.status(400).json({
        success: false,
        error: `Unknown operations action: ${action}`,
        details: 'Please check the action parameter',
        validActions: [
          'getWorkflowStatus',
          'pauseWorkflow',
          'resumeWorkflow', 
          'createTask',
          'getTasks',
          'updateTask',
          'createPortalAccount',
          'landingPageContact',
          'captureWebLead',
          'validateEnrollmentToken',
          'markTokenUsed',
          'processNewEnrollment',
          'chargeCustomer',
          'cancelSubscription',
          'processRefund',
          'updatePaymentMethod',
          'chargeDeletionFee',
          'getPaymentStatus',
          'nmiWebhook',
          'processUnsubscribe'
        ]
      });
      return;
      }
      
      // ENHANCED: Success response with more metadata
      console.log(`✅ Operation completed successfully: ${action}`);
      response.status(200).json({
        ...result,
        action: action,
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - (request.startTime || Date.now())
      });
      
    } catch (error) {
      console.error(`❌ Operations manager error for action '${action}':`, {
        error: error.message,
        stack: error.stack,
        params: Object.keys(params),
        action: action
      });
      
      // ENHANCED: Better error responses with more context
      response.status(500).json({ 
        success: false, 
        error: error.message || 'Internal server error',
        action: action,
        details: 'An unexpected error occurred while processing your request',
        timestamp: new Date().toISOString(),
        // Don't expose stack trace in production
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
      });
    }
  }
);

/*
FIXES IMPLEMENTED:

1. ✅ Enhanced parameter validation with specific error messages
2. ✅ Better request body parsing with try/catch
3. ✅ Check if resources exist before operations (contactId, taskId)
4. ✅ Improved error responses with more context
5. ✅ Better logging for debugging
6. ✅ Validation of data types (string, object, etc.)
7. ✅ 400 vs 404 vs 500 status code differentiation
8. ✅ Added metadata to success responses

DEPLOYMENT INSTRUCTIONS:
1. Replace the operationsManager function in your index.js with this fixed version
2. Test each action with missing/invalid parameters to verify 400 error handling
3. Deploy to Firebase: firebase deploy --only functions:operationsManager
4. Monitor logs to confirm 400 errors are reduced

TESTING:
- Missing action: Should return 400 with valid actions list
- Missing contactId: Should return 400 with specific field details  
- Invalid contactId: Should return 404 if contact doesn't exist
- Invalid parameters: Should return 400 with validation details
- Valid requests: Should return 200 with enhanced metadata
*/

console.log('✅ Function 8/10: operationsManager loaded');

// ============================================
// FUNCTION 9: FAX SERVICE (Telnyx)
// ============================================
// Sends faxes via Telnyx for bureau disputes (must stay separate)

exports.sendFaxOutbound = onRequest(
  {
    ...defaultConfig,
    secrets: [telnyxApiKey, telnyxPhone]
  },
  async (req, res) => {
    cors(req, res, async () => {
      console.log('📠 Sending fax via Telnyx...');
      
      try {
        const { to, documentUrl, bureau, contactId } = req.body;
        
        if (!to || !documentUrl) {
          throw new Error('Missing required fields: to, documentUrl');
        }
        
        const faxResponse = await fetch('https://api.telnyx.com/v2/faxes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${telnyxApiKey.value()}`
          },
          body: JSON.stringify({
            from: telnyxPhone.value(),
            to,
            media_url: documentUrl,
            quality: 'high',
            store_media: true
          })
        });
        
        const faxData = await faxResponse.json();
        
        if (!faxResponse.ok) {
          throw new Error(faxData.errors?.[0]?.detail || 'Fax sending failed');
        }
        
        // Log fax sent
        if (contactId) {
          const db = admin.firestore();
          await db.collection('faxLog').add({
            contactId,
            to,
            bureau: bureau || 'Unknown',
            faxId: faxData.data.id,
            status: faxData.data.status,
            sentAt: admin.firestore.FieldValue.serverTimestamp()
          });
        }
        
        console.log('✅ Fax sent, ID:', faxData.data.id);
        
        res.status(200).json({
          success: true,
          faxId: faxData.data.id,
          status: faxData.data.status
        });
        
      } catch (error) {
        console.error('❌ Fax error:', error);
        res.status(500).json({ success: false, error: error.message });
      }
    });
  }
);

console.log('✅ Function 9/10: sendFaxOutbound loaded');

// ============================================
// FUNCTION 10: ENROLLMENT SUPPORT SERVICE (Consolidated)
// ============================================
// Handles: Claude Code's 3 enrollment support functions
// Replaces: sendEscalationAlert, scheduleCallback, logEnrollmentFailure
// Savings: 3 functions → 1 function = $9/month saved

exports.enrollmentSupportService = onCall(
  {
    ...defaultConfig,
    // EXPLICITLY BIND SECRETS HERE
    secrets: [
      gmailUser, 
      gmailAppPassword, 
      gmailFromName, 
      telnyxApiKey, 
      telnyxPhone
    ]
  },
  async (request) => {
    // ===== SAME FIX AS emailService: onCall uses request.data =====
    const { action, ...params } = request.data || {};
    
    console.log('🆘 Enrollment Support action:', action);
    
    // Validate action — onCall has no 'response' object, so we throw
    if (!action) {
      throw new Error('Missing required parameter: action');
    }
    
    const db = admin.firestore();
    
    let result;
    
    console.log('🆘 Enrollment Support:', action);
    
    
    try {
      switch (action) {
        case 'sendAlert': {
          const { escalationId, type, urgency, contactName, contactEmail, contactPhone, description } = params;
          
          // Log to Firestore
          const alertRef = await db.collection('escalationAlerts').add({
            escalationId: escalationId || `ESC-${Date.now()}`,
            type,
            urgency,
            contactName,
            contactEmail,
            contactPhone,
            description,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            status: 'pending'
          });
          
          // Send email for high/critical urgency
          if (urgency === 'high' || urgency === 'critical') {
            const user = gmailUser.value();
            const pass = gmailAppPassword.value();
            
            const transporter = nodemailer.createTransport({
              host: 'smtp.gmail.com',
              port: 587,
              secure: false,
              auth: { user, pass }
            });
            
            const urgencyEmoji = urgency === 'critical' ? '🚨🚨🚨' : '🚨';
            const subject = `${urgencyEmoji} ${urgency.toUpperCase()}: Enrollment Escalation - ${contactName || 'Unknown'}`;
            
            const body = `
ENROLLMENT ESCALATION ALERT

Type: ${type}
Urgency: ${urgency.toUpperCase()}
Contact: ${contactName || 'Unknown'}
Phone: ${contactPhone || 'Not provided'}
Email: ${contactEmail || 'Not provided'}

Description:
${description}

Action Required: Please follow up immediately.

---
Escalation ID: ${alertRef.id}
Timestamp: ${new Date().toISOString()}
            `.trim();
            
            await transporter.sendMail({
              from: `"SpeedyCRM Alerts" <${user}>`,
              to: 'chris@speedycreditrepair.com',
              subject,
              text: body,
              html: wrapEmailInHTML(subject, body)
            });
            
            console.log('✅ Escalation email sent');
          }
          
          // Send SMS for critical urgency (if enabled)
          if (urgency === 'critical' && telnyxApiKey.value()) {
            try {
              await fetch('https://api.telnyx.com/v2/messages', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${telnyxApiKey.value()}`
                },
                body: JSON.stringify({
                  from: telnyxPhone.value(),
                  to: '+17145551234', // Update with actual team phone
                  text: `🚨 CRITICAL: IDIQ enrollment failed for ${contactName}. Check CRM immediately. ID: ${alertRef.id}`
                })
              });
              console.log('✅ Escalation SMS sent');
            } catch (smsError) {
              console.warn('⚠️ SMS sending failed:', smsError.message);
            }
          }
          
          return { success: true, escalationId: alertRef.id };
        }
        
        case 'scheduleCallback': {
          const { contactId, contactName, phone, email, preferredTime, preferredDate, reason, notes } = params;
          
          // Create callback record
          const callbackRef = await db.collection('callbacks').add({
            contactId,
            contactName,
            phone,
            email,
            preferredTime,
            preferredDate,
            reason,
            notes: notes || '',
            status: 'scheduled',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          });
          
          // Create task for team
          await db.collection('tasks').add({
            title: `Callback: ${reason}`,
            description: `Call ${contactName} at ${phone}\nPreferred: ${preferredDate} ${preferredTime}\nReason: ${reason}\n\n${notes || ''}`.trim(),
            contactId,
            type: 'callback',
            priority: 'high',
            status: 'pending',
            dueDate: preferredDate && preferredTime 
              ? new Date(`${preferredDate} ${preferredTime}`) 
              : new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow if not specified
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            createdBy: 'system',
            relatedTo: {
              type: 'callback',
              id: callbackRef.id
            }
          });
          
          // Send confirmation email
          if (email) {
            const user = gmailUser.value();
            const pass = gmailAppPassword.value();
            
            const transporter = nodemailer.createTransport({
              host: 'smtp.gmail.com',
              port: 587,
              secure: false,
              auth: { user, pass }
            });
            
            const body = `Hi ${contactName},

We've received your callback request and will call you on ${preferredDate} at ${preferredTime}.

Reason: ${reason}

If you need to reschedule, please reply to this email or call us at (888) 724-7344.

Thank you for choosing Speedy Credit Repair!`;
            
            await transporter.sendMail({
              from: `"${gmailFromName.value() || 'Speedy Credit Repair'}" <${user}>`,
              to: email,
              subject: 'Your Callback Request - Speedy Credit Repair',
              text: body,
              html: wrapEmailInHTML('Callback Confirmation', body, contactName)
            });
            
            console.log('✅ Callback confirmation email sent');
          }
          
          return { success: true, callbackId: callbackRef.id };
        }
        
        case 'logFailure': {
          const { contactId, errorType, errorMessage, formData, step, userId } = params;
          
          // Sanitize form data (remove sensitive info)
          const sanitizedFormData = { ...formData };
          if (sanitizedFormData.ssn) {
            sanitizedFormData.ssn = `***-**-${sanitizedFormData.ssn.slice(-4)}`;
          }
          delete sanitizedFormData.password;
          delete sanitizedFormData.idiqPassword;
          
          const failureRef = await db.collection('enrollmentFailures').add({
            contactId,
            errorType,
            errorMessage,
            formData: sanitizedFormData,
            step: step || 'unknown',
            userId: userId || null,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            status: 'pending',
            retryCount: 0,
            resolved: false
          });
          
          // Update contact record if exists
          if (contactId) {
            try {
              await db.collection('contacts').doc(contactId).update({
                'idiq.enrollmentStatus': 'failed',
                'idiq.lastError': errorType,
                'idiq.lastErrorDate': admin.firestore.FieldValue.serverTimestamp()
              });
            } catch (updateError) {
              console.warn('Could not update contact:', updateError.message);
            }
          }
          
          console.log('📋 Enrollment failure logged:', failureRef.id);
          return { success: true, failureId: failureRef.id };
        }
        
        default:
          throw new Error(`Unknown enrollment support action: ${action}`);
      }
    } catch (error) {
      console.error('❌ Enrollment support error:', error);
      return { success: false, error: error.message };
    }
  }
);

console.log('✅ Function 10/10: enrollmentSupportService loaded');

// ============================================
// INITIALIZATION COMPLETE
// ============================================

console.log('');
console.log('🚀 Firebase Gen 2 Functions configured successfully!');
console.log('✅ 10 Consolidated Functions loaded (down from 172)');
console.log('💰 Monthly savings: $903/month | Annual savings: $10,836/year');
console.log('');
console.log('Function List:');
console.log('1. emailService - Email operations + tracking');
console.log('2. receiveAIReceptionistCall - AI Receptionist webhook');
console.log('3. processAICall - AI call processing + lead scoring');
console.log('4. onContactUpdated - Contact update trigger (with enrollment + email automation + auto lead role + speed-to-lead)');
console.log('4B. onContactCreated - New contact trigger (AI role assessment)');
console.log('5. idiqService - IDIQ credit reporting operations');
console.log('6. processWorkflowStages - Scheduled workflow processor');
console.log('7. aiContentGenerator - AI content + document generation');
console.log('8. operationsManager - Workflow + task management');
console.log('9. sendFaxOutbound - Telnyx fax service');
console.log('10. enrollmentSupportService - Enrollment support + escalation');
console.log('');
console.log('© 1995-2024 Speedy Credit Repair Inc. | All Rights Reserved');
console.log('Trademark: Speedy Credit Repair® - USPTO Registered');// Force redeploy Fri, Jan 23, 2026  9:09:43 AM