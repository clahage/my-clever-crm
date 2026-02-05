// ============================================================================
// Path: /src/utils/goodwillExtensionEmailTemplate.js
// © 1995-2026 Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved
// Trademark registered USPTO, violations prosecuted.
//
// GOODWILL EXTENSION EMAIL TEMPLATES
// ============================================================================
// Professional email templates for offering goodwill contract extensions
// to eligible clients. Based on Christopher's current version with AI
// enhancements and personalization.
//
// EMAIL SEQUENCE:
//   1. Initial Extension Offer (this file)
//   2. Grace Period Reminder Day 3 (friendly)
//   3. Grace Period Reminder Day 5 (professional urgency)
//   4. Grace Period Final Notice Day 7 (urgent)
//
// PERSONALIZATION TOKENS:
//   {{firstName}} - Client first name
//   {{lastName}} - Client last name
//   {{deletedItems}} - Number of items successfully deleted
//   {{totalItems}} - Total items disputed
//   {{monthsOfService}} - Months client has been with SCR
//   {{extensionMonths}} - Months of extension offered (3 or 6)
//   {{itemFee}} - Per-item fee amount ($25 or $75)
//   {{acceptanceLink}} - Link to accept extension
//
// INTEGRATION:
//   - AdminAddendumFlow: Sends when admin generates extension package
//   - Automated monthly review: Batch emails to eligible clients
// ============================================================================

/**
 * Generate goodwill extension offer email
 * 
 * @param {Object} params - Email parameters
 * @param {Object} params.contact - Contact data
 * @param {Object} params.analysisResult - AI extension eligibility analysis
 * @param {number} params.extensionMonths - 3 or 6
 * @param {number} params.itemFee - Per-item fee (25 or 75)
 * @param {string} params.acceptanceLink - Link to extension acceptance portal
 * @returns {Object} Email subject and HTML body
 */
export function generateExtensionOfferEmail({
  contact,
  analysisResult,
  extensionMonths = 3,
  itemFee = 25,
  acceptanceLink
}) {
  const firstName = contact.firstName || 'Valued Client';
  const lastName = contact.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim();
  
  const deletedItems = analysisResult?.outcomeMetrics?.deletedItems || 0;
  const totalItems = analysisResult?.outcomeMetrics?.totalItems || 0;
  const monthsOfService = analysisResult?.outcomeMetrics?.monthsOfService || 3;

  const subject = `${firstName}, Let's Continue Your Credit Repair Journey — Special Extension Offer`;

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f4f4f4;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 40px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #1976d2;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #1976d2;
      margin-bottom: 10px;
    }
    .tagline {
      font-size: 14px;
      color: #666;
      font-style: italic;
    }
    h1 {
      color: #1a365d;
      font-size: 24px;
      margin-bottom: 20px;
      text-align: center;
    }
    .highlight-box {
      background-color: #e3f2fd;
      border-left: 4px solid #1976d2;
      padding: 20px;
      margin: 25px 0;
      border-radius: 4px;
    }
    .highlight-box h2 {
      color: #1976d2;
      font-size: 18px;
      margin-top: 0;
    }
    .stats {
      display: flex;
      justify-content: space-around;
      margin: 25px 0;
      padding: 20px;
      background-color: #f8f9fa;
      border-radius: 4px;
    }
    .stat {
      text-align: center;
    }
    .stat-number {
      font-size: 32px;
      font-weight: bold;
      color: #1976d2;
    }
    .stat-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
    }
    .benefits {
      margin: 25px 0;
    }
    .benefit-item {
      padding: 12px 0;
      border-bottom: 1px solid #e0e0e0;
    }
    .benefit-item:last-child {
      border-bottom: none;
    }
    .benefit-item strong {
      color: #1976d2;
    }
    .cta-button {
      display: inline-block;
      background-color: #1976d2;
      color: #ffffff;
      padding: 16px 32px;
      text-decoration: none;
      border-radius: 4px;
      font-weight: bold;
      font-size: 16px;
      text-align: center;
      margin: 25px 0;
    }
    .cta-button:hover {
      background-color: #1565c0;
    }
    .cta-container {
      text-align: center;
      margin: 30px 0;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      font-size: 12px;
      color: #666;
      text-align: center;
    }
    .contact-info {
      margin: 20px 0;
      padding: 15px;
      background-color: #f8f9fa;
      border-radius: 4px;
    }
    .signature {
      margin-top: 30px;
      font-style: italic;
    }
    @media only screen and (max-width: 600px) {
      .container {
        padding: 20px;
      }
      .stats {
        flex-direction: column;
      }
      .stat {
        margin-bottom: 15px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="logo">Speedy Credit Repair Inc.</div>
      <div class="tagline">Your Path to Financial Freedom</div>
    </div>

    <!-- Greeting -->
    <p style="font-size: 16px; color: #1a365d;"><strong>Dear ${fullName},</strong></p>

    <!-- Main Headline -->
    <h1>There's More To Achieve Together</h1>

    <!-- Opening Paragraph -->
    <p>
      I'm reaching out because your service agreement with Speedy Credit Repair has recently come to an end. 
      While I appreciate the opportunity to work on your file over the past ${monthsOfService} months, I understand 
      you may still have goals to achieve in building your credit score and financial future.
    </p>

    <!-- Your Progress Stats -->
    ${totalItems > 0 ? `
    <div class="stats">
      <div class="stat">
        <div class="stat-number">${totalItems}</div>
        <div class="stat-label">Items Disputed</div>
      </div>
      <div class="stat">
        <div class="stat-number">${deletedItems}</div>
        <div class="stat-label">Successfully Deleted</div>
      </div>
      <div class="stat">
        <div class="stat-number">${monthsOfService}</div>
        <div class="stat-label">Months of Service</div>
      </div>
    </div>
    ` : ''}

    <!-- The Offer -->
    <div class="highlight-box">
      <h2>🎁 Exclusive Extension Opportunity</h2>
      <p>
        At Speedy Credit Repair, we're committed to helping clients reach their financial goals. 
        That's why I'm excited to offer you a <strong>limited-time opportunity</strong> to continue 
        your credit repair journey with us for an additional <strong>${extensionMonths} months</strong> — 
        <em>without the monthly service charge</em>.
      </p>
    </div>

    <!-- How It Works -->
    <div class="benefits">
      <h2 style="color: #1a365d; margin-bottom: 15px;">How This Works:</h2>
      
      <div class="benefit-item">
        <strong>✓ No Monthly Fees:</strong> 
        Your monthly service fee is completely waived for the extension period.
      </div>
      
      <div class="benefit-item">
        <strong>✓ Pay Only For Results:</strong> 
        You'll only pay $${itemFee} per item when we successfully dispute and remove negative items from your credit report.
      </div>
      
      <div class="benefit-item">
        <strong>✓ Maintain Credit Monitoring:</strong> 
        Continue your IDIQ credit monitoring subscription ($21.86/month) so we can track your progress and identify new opportunities for improvement.
      </div>
      
      <div class="benefit-item">
        <strong>✓ Same Great Service:</strong> 
        Full access to our team, dispute services, and credit repair expertise — just without the monthly fee.
      </div>
    </div>

    <!-- Why You Were Selected -->
    <p style="margin-top: 25px;">
      <strong>Why is this offer exclusive to you?</strong><br>
      We carefully select clients who we believe can benefit from continued service. Based on our work 
      together and the items still present on your credit reports, I feel there is genuine potential 
      for further success with your credit score over these additional months.
    </p>

    <!-- Call to Action -->
    <div class="cta-container">
      <p style="font-size: 18px; margin-bottom: 15px;">
        <strong>Ready to Continue Your Journey?</strong>
      </p>
      <a href="${acceptanceLink}" class="cta-button">
        Accept Your ${extensionMonths}-Month Extension
      </a>
      <p style="font-size: 14px; color: #666; margin-top: 10px;">
        Or simply reply to this email to discuss your options
      </p>
    </div>

    <!-- Urgency (Soft) -->
    <p style="background-color: #fff3cd; padding: 15px; border-radius: 4px; border-left: 4px solid #ffc107; margin: 25px 0;">
      <strong>⏰ This is a limited-time offer.</strong> Don't miss this chance to improve your credit score 
      and unlock new financial opportunities. The extension terms are only available for the next 14 days.
    </p>

    <!-- Signature -->
    <div class="signature">
      <p>With Kind Regards,</p>
      <p style="margin: 10px 0;">
        <strong style="font-size: 16px; color: #1a365d;">Chris Lahage</strong><br>
        <span style="color: #666;">Owner & CEO</span><br>
        <span style="color: #666;">Speedy Credit Repair Inc.</span>
      </p>
    </div>

    <!-- Contact Info -->
    <div class="contact-info">
      <p style="margin: 5px 0;"><strong>📞 Phone:</strong> 714-594-3688</p>
      <p style="margin: 5px 0;"><strong>✉️ Email:</strong> contact@speedycreditrepair.com</p>
      <p style="margin: 5px 0;"><strong>📍 Location:</strong> 117 Main Street #202, Huntington Beach, CA 92648</p>
    </div>

    <!-- Social Proof -->
    <div style="text-align: center; margin: 25px 0; padding: 20px; background-color: #f0f7ff; border-radius: 4px;">
      <p style="margin: 0; color: #1976d2; font-weight: bold;">
        ⭐⭐⭐⭐⭐ Rated 5 Stars on Yelp! and Google
      </p>
      <p style="margin: 5px 0; font-size: 14px; color: #666;">
        A+ Rating with BBB | Over 30 Years in Business
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p style="margin-bottom: 10px;">
        <strong>Speedy Credit Repair</strong> is a Nationally Registered Trademark<br>
        #4662906 Serial #86274062
      </p>
      <p>
        Copyright © ${new Date().getFullYear()} Speedy Credit Repair Inc. All rights reserved.
      </p>
      <p style="margin-top: 15px; font-size: 11px;">
        <a href="{{unsubscribeLink}}" style="color: #666; text-decoration: underline;">
          Unsubscribe from these emails
        </a>
      </p>
    </div>
  </div>
</body>
</html>
  `;

  const textBody = `
Dear ${fullName},

THERE'S MORE TO ACHIEVE TOGETHER

I'm reaching out because your service agreement with Speedy Credit Repair has recently come to an end. While I appreciate the opportunity to work on your file over the past ${monthsOfService} months, I understand you may still have goals to achieve in building your credit score and financial future.

YOUR PROGRESS:
- ${totalItems} items disputed
- ${deletedItems} successfully deleted
- ${monthsOfService} months of service

🎁 EXCLUSIVE EXTENSION OPPORTUNITY

At Speedy Credit Repair, we're committed to helping clients reach their financial goals. That's why I'm excited to offer you a limited-time opportunity to continue your credit repair journey with us for an additional ${extensionMonths} months — without the monthly service charge.

HOW THIS WORKS:

✓ NO MONTHLY FEES: Your monthly service fee is completely waived for the extension period.

✓ PAY ONLY FOR RESULTS: You'll only pay $${itemFee} per item when we successfully dispute and remove negative items from your credit report.

✓ MAINTAIN CREDIT MONITORING: Continue your IDIQ credit monitoring subscription ($21.86/month) so we can track your progress and identify new opportunities for improvement.

✓ SAME GREAT SERVICE: Full access to our team, dispute services, and credit repair expertise — just without the monthly fee.

WHY IS THIS OFFER EXCLUSIVE TO YOU?

We carefully select clients who we believe can benefit from continued service. Based on our work together and the items still present on your credit reports, I feel there is genuine potential for further success with your credit score over these additional months.

READY TO CONTINUE YOUR JOURNEY?

Click here to accept your ${extensionMonths}-month extension:
${acceptanceLink}

Or simply reply to this email to discuss your options.

⏰ This is a limited-time offer. Don't miss this chance to improve your credit score and unlock new financial opportunities. The extension terms are only available for the next 14 days.

With Kind Regards,

Chris Lahage
Owner & CEO
Speedy Credit Repair Inc.

---
📞 Phone: 714-594-3688
✉️ Email: contact@speedycreditrepair.com
📍 Location: 117 Main Street #202, Huntington Beach, CA 92648

⭐⭐⭐⭐⭐ Rated 5 Stars on Yelp! and Google
A+ Rating with BBB | Over 30 Years in Business

Speedy Credit Repair is a Nationally Registered Trademark #4662906 Serial #86274062
Copyright © ${new Date().getFullYear()} Speedy Credit Repair Inc. All rights reserved.

To unsubscribe: {{unsubscribeLink}}
  `;

  return {
    subject,
    htmlBody,
    textBody,
    metadata: {
      templateVersion: '2.0',
      generatedAt: new Date().toISOString(),
      extensionMonths,
      itemFee,
      contactId: contact.id,
      aiRecommendation: analysisResult?.recommendation
    }
  };
}

/**
 * Generate grace period reminder email (Day 3 - Friendly)
 */
export function generateGracePeriodReminder_Day3({
  contact,
  extensionMonths,
  acceptanceLink
}) {
  const firstName = contact.firstName || 'Valued Client';

  const subject = `${firstName}, Quick Reminder: Your Extension Offer Awaits`;

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .container { background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .button { display: inline-block; background-color: #1976d2; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 4px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <h2 style="color: #1976d2;">Hi ${firstName},</h2>
    
    <p>Just a friendly reminder about your ${extensionMonths}-month extension offer I sent a few days ago.</p>
    
    <p>I wanted to make sure you saw this opportunity to continue your credit repair journey with <strong>no monthly fees</strong> — just per-item charges when we get results.</p>
    
    <p style="text-align: center; margin: 30px 0;">
      <a href="${acceptanceLink}" class="button">Review Your Extension Offer</a>
    </p>
    
    <p>If you have any questions or would like to discuss this further, please don't hesitate to reply to this email or give me a call.</p>
    
    <p>Looking forward to continuing to help you achieve your credit goals!</p>
    
    <p style="margin-top: 30px;">
      <strong>Chris Lahage</strong><br>
      Speedy Credit Repair Inc.<br>
      📞 714-594-3688
    </p>
  </div>
</body>
</html>
  `;

  return { subject, htmlBody };
}

/**
 * Generate grace period reminder email (Day 5 - More Urgent)
 */
export function generateGracePeriodReminder_Day5({
  contact,
  extensionMonths,
  acceptanceLink
}) {
  const firstName = contact.firstName || 'Valued Client';

  const subject = `${firstName}, Your Extension Offer Expires Soon — Act Now`;

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .container { background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .urgent-banner { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .button { display: inline-block; background-color: #d32f2f; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <h2 style="color: #d32f2f;">Important: Extension Offer Expires in 48 Hours</h2>
    
    <p>Hi ${firstName},</p>
    
    <div class="urgent-banner">
      <p style="margin: 0;"><strong>⏰ Time is running out!</strong> Your exclusive ${extensionMonths}-month extension offer will expire in just 2 days.</p>
    </div>
    
    <p>I don't want you to miss this opportunity to:</p>
    
    <ul>
      <li>Continue improving your credit score with <strong>zero monthly fees</strong></li>
      <li>Pay only when we successfully remove negative items</li>
      <li>Get ${extensionMonths} more months of expert credit repair service</li>
    </ul>
    
    <p style="text-align: center; margin: 30px 0;">
      <a href="${acceptanceLink}" class="button">Claim Your Extension Now</a>
    </p>
    
    <p>After the deadline, this special pricing will no longer be available. If you'd like to discuss this before deciding, please call me directly at 714-594-3688.</p>
    
    <p style="margin-top: 30px;">
      <strong>Chris Lahage</strong><br>
      Owner & CEO<br>
      Speedy Credit Repair Inc.<br>
      📞 714-594-3688
    </p>
  </div>
</body>
</html>
  `;

  return { subject, htmlBody };
}

/**
 * Generate final notice email (Day 7 - Final Warning)
 */
export function generateGracePeriodFinal_Day7({
  contact,
  extensionMonths,
  acceptanceLink
}) {
  const firstName = contact.firstName || 'Valued Client';

  const subject = `${firstName}, FINAL NOTICE: Extension Offer Expires Tonight`;

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .container { background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border: 3px solid #d32f2f; }
    .final-banner { background-color: #ffebee; border: 2px solid #d32f2f; padding: 20px; margin: 20px 0; border-radius: 4px; text-align: center; }
    .button { display: inline-block; background-color: #d32f2f; color: #ffffff; padding: 18px 36px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 18px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="final-banner">
      <h2 style="color: #d32f2f; margin: 0 0 10px 0;">⚠️ FINAL NOTICE</h2>
      <p style="font-size: 20px; font-weight: bold; margin: 0; color: #d32f2f;">
        Extension Offer Expires at Midnight Tonight
      </p>
    </div>
    
    <p style="font-size: 16px;">Dear ${firstName},</p>
    
    <p style="font-size: 16px;">
      This is your final opportunity to accept your exclusive ${extensionMonths}-month extension with <strong>zero monthly fees</strong>. 
      After tonight at midnight, this offer will no longer be available at these special terms.
    </p>
    
    <p style="text-align: center; margin: 40px 0;">
      <a href="${acceptanceLink}" class="button">Accept Before Midnight</a>
    </p>
    
    <p>
      <strong>What happens if you don't accept:</strong><br>
      After midnight, your account will remain closed and this extension opportunity will no longer be available. 
      To restart service in the future, standard pricing and terms would apply.
    </p>
    
    <p>
      <strong>Questions? Call me now:</strong><br>
      📞 714-594-3688 (I'm available until 8 PM PST tonight)
    </p>
    
    <p style="margin-top: 40px; font-size: 14px; color: #666;">
      I genuinely want to help you continue your credit improvement journey. If there's anything holding you back from accepting this offer, please let me know so we can address it together.
    </p>
    
    <p style="margin-top: 30px;">
      <strong>Chris Lahage</strong><br>
      Owner & CEO<br>
      Speedy Credit Repair Inc.<br>
      📞 714-594-3688
    </p>
  </div>
</body>
</html>
  `;

  return { subject, htmlBody };
}

/**
 * EXPORT ALL TEMPLATES
 */
export default {
  generateExtensionOfferEmail,
  generateGracePeriodReminder_Day3,
  generateGracePeriodReminder_Day5,
  generateGracePeriodFinal_Day7
};