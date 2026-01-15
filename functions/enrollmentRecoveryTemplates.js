/**
 * ============================================================================
 * ENROLLMENT RECOVERY EMAIL TEMPLATES - SpeedyCRM
 * ============================================================================
 * Path: /functions/enrollmentRecoveryTemplates.js
 *
 * PURPOSE:
 * Professional HTML email templates for recovering failed/abandoned enrollments
 *
 * TEMPLATES INCLUDED:
 * 1. recovery-failed-enrollment - When IDIQ API fails (5 min trigger)
 * 2. recovery-abandoned-30min - When user abandons form (30 min trigger)
 * 3. drip-day-1 - First nurture email (24 hours)
 * 4. drip-day-3 - Social proof email (3 days)
 * 5. drip-day-7 - Limited time offer (7 days)
 * 6. drip-day-14 - Final re-engagement (14 days)
 *
 * INTEGRATES WITH:
 * - emailWorkflowEngine.js (sending)
 * - emailBrandingConfig.js (styling)
 * - processWorkflowStages (scheduling)
 *
 * BRAND COLORS:
 * - Primary Green: #009900
 * - Hover Green: #008500
 * - Text: #333333
 * - Font: Roboto
 *
 * © 1995-2026 Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved
 * Trademark: Speedy Credit Repair® - USPTO Registered
 * ============================================================================
 */

// ============================================================================
// BRAND CONFIGURATION
// ============================================================================

const RECOVERY_BRANDING = {
  primaryGreen: '#009900',
  hoverGreen: '#008500',
  textColor: '#333333',
  lightGray: '#f9fafb',
  borderGray: '#e5e7eb',
  fontFamily: 'Roboto, Arial, sans-serif',

  company: {
    name: 'Speedy Credit Repair',
    tagline: 'Trusted Since 1995',
    phone: '1-888-724-7344',
    phoneDisplay: '(888) 724-7344',
    email: 'Contact@speedycreditrepair.com',
    website: 'https://speedycreditrepair.com',
    portalUrl: 'https://myclevercrm.com',
    address: '117 Main St #202, Huntington Beach, CA 92648',
    ownerName: 'Chris Lahage',
    bbbRating: 'A+',
    googleRating: '4.9',
    reviewCount: '580+',
    yearsInBusiness: '30'
  }
};

// ============================================================================
// BASE EMAIL WRAPPER
// ============================================================================

/**
 * Wraps email content in professional HTML template with Speedy branding
 * @param {Object} options - Template options
 * @param {string} options.content - Main HTML content
 * @param {string} options.subject - Email subject
 * @param {Object} options.data - Contact data for personalization
 * @param {string} options.ctaText - Call-to-action button text
 * @param {string} options.ctaUrl - Call-to-action URL
 * @returns {string} Complete HTML email
 */
const wrapInTemplate = ({ content, subject, data, ctaText, ctaUrl }) => {
  const firstName = data.firstName || 'Friend';
  const unsubscribeUrl = `${RECOVERY_BRANDING.company.portalUrl}/unsubscribe?email=${encodeURIComponent(data.email || '')}`;
  const trackingPixel = data.trackingPixelUrl || '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${subject}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    /* Reset styles for email clients */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }

    body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      font-family: ${RECOVERY_BRANDING.fontFamily};
      background-color: ${RECOVERY_BRANDING.lightGray};
      color: ${RECOVERY_BRANDING.textColor};
    }

    /* Mobile responsive */
    @media only screen and (max-width: 600px) {
      .email-container { width: 100% !important; }
      .email-content { padding: 25px 20px !important; }
      .cta-button { padding: 16px 24px !important; font-size: 16px !important; }
      h1 { font-size: 24px !important; }
      .trust-badge { display: block !important; margin: 10px auto !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${RECOVERY_BRANDING.lightGray};">

  <!-- Tracking Pixel -->
  ${trackingPixel ? `<img src="${trackingPixel}" width="1" height="1" style="display:none;" alt="" />` : ''}

  <!-- Email Container -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 600px; margin: 0 auto;">
    <tr>
      <td style="padding: 20px 10px;">

        <!-- Main Card -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">

          <!-- Header with Green Gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, ${RECOVERY_BRANDING.primaryGreen} 0%, ${RECOVERY_BRANDING.hoverGreen} 100%); padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; font-family: ${RECOVERY_BRANDING.fontFamily};">
                Speedy Credit Repair
              </h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 14px; font-weight: 500;">
                ${RECOVERY_BRANDING.company.tagline} | ${RECOVERY_BRANDING.company.bbbRating} BBB Rating | ${RECOVERY_BRANDING.company.googleRating}★ Google Reviews
              </p>
            </td>
          </tr>

          <!-- Content Area -->
          <tr>
            <td class="email-content" style="padding: 40px;">

              <!-- Greeting -->
              <p style="margin: 0 0 20px; font-size: 18px; color: ${RECOVERY_BRANDING.textColor}; font-weight: 600;">
                Hi ${firstName},
              </p>

              <!-- Main Content -->
              ${content}

              <!-- CTA Button -->
              ${ctaText && ctaUrl ? `
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 30px auto;">
                <tr>
                  <td>
                    <a href="${ctaUrl}" class="cta-button" style="display: inline-block; padding: 18px 36px; background-color: ${RECOVERY_BRANDING.primaryGreen}; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 17px; font-family: ${RECOVERY_BRANDING.fontFamily}; box-shadow: 0 4px 12px rgba(0, 153, 0, 0.3);">
                      ${ctaText}
                    </a>
                  </td>
                </tr>
              </table>
              ` : ''}

              <!-- Contact Info Box -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 30px 0; background-color: #f0fdf4; border-radius: 8px; border: 1px solid #bbf7d0;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 10px; font-weight: 700; color: ${RECOVERY_BRANDING.primaryGreen}; font-size: 16px;">
                      Need Help? We're Here For You!
                    </p>
                    <p style="margin: 0 0 5px; color: ${RECOVERY_BRANDING.textColor}; font-size: 14px;">
                      📞 Call: <a href="tel:${RECOVERY_BRANDING.company.phone}" style="color: ${RECOVERY_BRANDING.primaryGreen}; text-decoration: none; font-weight: 600;">${RECOVERY_BRANDING.company.phoneDisplay}</a>
                    </p>
                    <p style="margin: 0 0 5px; color: ${RECOVERY_BRANDING.textColor}; font-size: 14px;">
                      ✉️ Email: <a href="mailto:${RECOVERY_BRANDING.company.email}" style="color: ${RECOVERY_BRANDING.primaryGreen}; text-decoration: none; font-weight: 600;">${RECOVERY_BRANDING.company.email}</a>
                    </p>
                    <p style="margin: 0; color: ${RECOVERY_BRANDING.textColor}; font-size: 14px;">
                      🌐 Portal: <a href="${RECOVERY_BRANDING.company.portalUrl}" style="color: ${RECOVERY_BRANDING.primaryGreen}; text-decoration: none; font-weight: 600;">myclevercrm.com</a>
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Signature -->
              <p style="margin: 20px 0 0; color: ${RECOVERY_BRANDING.textColor}; font-size: 15px; line-height: 1.6;">
                To your credit success,<br>
                <strong>${RECOVERY_BRANDING.company.ownerName}</strong><br>
                <span style="color: #6b7280; font-size: 14px;">Founder & Credit Expert</span><br>
                <span style="color: #6b7280; font-size: 14px;">${RECOVERY_BRANDING.company.name} | Est. 1995</span>
              </p>

            </td>
          </tr>

          <!-- Trust Badges Section -->
          <tr>
            <td style="padding: 25px 40px; background-color: ${RECOVERY_BRANDING.lightGray}; border-top: 1px solid ${RECOVERY_BRANDING.borderGray}; text-align: center;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
                <tr>
                  <td class="trust-badge" style="padding: 0 15px; text-align: center;">
                    <span style="font-size: 28px; display: block;">⭐</span>
                    <span style="font-size: 14px; font-weight: 700; color: ${RECOVERY_BRANDING.textColor};">${RECOVERY_BRANDING.company.googleRating} Stars</span>
                    <span style="font-size: 12px; color: #6b7280; display: block;">${RECOVERY_BRANDING.company.reviewCount} Reviews</span>
                  </td>
                  <td class="trust-badge" style="padding: 0 15px; text-align: center;">
                    <span style="font-size: 28px; display: block;">🏆</span>
                    <span style="font-size: 14px; font-weight: 700; color: ${RECOVERY_BRANDING.textColor};">${RECOVERY_BRANDING.company.bbbRating} BBB</span>
                    <span style="font-size: 12px; color: #6b7280; display: block;">Rating</span>
                  </td>
                  <td class="trust-badge" style="padding: 0 15px; text-align: center;">
                    <span style="font-size: 28px; display: block;">📅</span>
                    <span style="font-size: 14px; font-weight: 700; color: ${RECOVERY_BRANDING.textColor};">${RECOVERY_BRANDING.company.yearsInBusiness} Years</span>
                    <span style="font-size: 12px; color: #6b7280; display: block;">Experience</span>
                  </td>
                  <td class="trust-badge" style="padding: 0 15px; text-align: center;">
                    <span style="font-size: 28px; display: block;">✅</span>
                    <span style="font-size: 14px; font-weight: 700; color: ${RECOVERY_BRANDING.textColor};">10,000+</span>
                    <span style="font-size: 12px; color: #6b7280; display: block;">Clients Helped</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 25px 40px; background-color: #1f2937; text-align: center;">
              <p style="margin: 0 0 10px; color: #ffffff; font-size: 14px; font-weight: 600;">
                ${RECOVERY_BRANDING.company.name} Inc.
              </p>
              <p style="margin: 0 0 10px; color: #9ca3af; font-size: 13px;">
                ${RECOVERY_BRANDING.company.address}
              </p>
              <p style="margin: 0 0 15px; color: #9ca3af; font-size: 13px;">
                📞 ${RECOVERY_BRANDING.company.phoneDisplay} | ✉️ ${RECOVERY_BRANDING.company.email}
              </p>
              <p style="margin: 0 0 10px; color: #9ca3af; font-size: 12px;">
                © 1995-${new Date().getFullYear()} ${RECOVERY_BRANDING.company.name} Inc. | ${RECOVERY_BRANDING.company.ownerName} | All Rights Reserved
              </p>
              <p style="margin: 0 0 10px; color: #9ca3af; font-size: 11px;">
                Trademark: Speedy Credit Repair® - USPTO Registered
              </p>
              <p style="margin: 0; color: #6b7280; font-size: 11px;">
                <a href="${unsubscribeUrl}" style="color: #6b7280; text-decoration: underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
  `;
};

// ============================================================================
// TEMPLATE 1: FAILED ENROLLMENT RECOVERY (5-minute trigger)
// ============================================================================

const recoveryFailedEnrollment = {
  id: 'recovery-failed-enrollment',
  name: 'Failed Enrollment Recovery',
  description: 'Sent when IDIQ enrollment fails (5 minutes after)',
  trigger: 'failed_enrollment',
  delayMinutes: 5,

  subject: (data) => {
    const subjects = [
      `Quick Question About Your Credit Report, ${data.firstName || 'Friend'}`,
      `${data.firstName || 'Hi'}, We Noticed a Small Issue - Easy Fix!`,
      `Your Free Credit Report is Almost Ready, ${data.firstName || 'Friend'}`
    ];
    // A/B test by returning random variant (or use variant selection logic)
    return data.variant === 'B' ? subjects[1] : subjects[0];
  },

  html: (data) => {
    const resumeUrl = `${RECOVERY_BRANDING.company.portalUrl}/complete-enrollment?contactId=${data.contactId}&source=recovery_email`;

    const content = `
      <p style="margin: 0 0 15px; color: ${RECOVERY_BRANDING.textColor}; font-size: 16px; line-height: 1.7;">
        I noticed you started getting your free credit report but we hit a small technical bump.
        <strong>This happens sometimes</strong> - and it's an easy fix!
      </p>

      <p style="margin: 0 0 15px; color: ${RECOVERY_BRANDING.textColor}; font-size: 16px; line-height: 1.7;">
        Your free 3-bureau credit report and personalized analysis are waiting for you.
        Let me help you get it sorted out.
      </p>

      <!-- Highlight Box -->
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 25px 0; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
        <tr>
          <td style="padding: 20px;">
            <p style="margin: 0 0 10px; font-weight: 700; color: #92400e; font-size: 16px;">
              What You Can Try:
            </p>
            <ul style="margin: 0; padding-left: 20px; color: ${RECOVERY_BRANDING.textColor}; font-size: 15px; line-height: 1.8;">
              <li>Double-check your Social Security Number (common typos happen!)</li>
              <li>Make sure your address matches what's on your ID exactly</li>
              <li>Try again - sometimes a simple refresh does the trick</li>
            </ul>
          </td>
        </tr>
      </table>

      <p style="margin: 0 0 15px; color: ${RECOVERY_BRANDING.textColor}; font-size: 16px; line-height: 1.7;">
        If you're still having trouble, <strong>give us a call at ${RECOVERY_BRANDING.company.phoneDisplay}</strong> and
        we'll get you sorted in minutes. We're here to help!
      </p>
    `;

    return wrapInTemplate({
      content,
      subject: recoveryFailedEnrollment.subject(data),
      data,
      ctaText: 'Try Again - Get My Free Report',
      ctaUrl: resumeUrl
    });
  },

  text: (data) => {
    return `
Hi ${data.firstName || 'Friend'},

I noticed you started getting your free credit report but we hit a small technical bump. This happens sometimes - and it's an easy fix!

What you can try:
- Double-check your Social Security Number (common typos happen!)
- Make sure your address matches what's on your ID exactly
- Try again - sometimes a simple refresh does the trick

If you're still having trouble, give us a call at ${RECOVERY_BRANDING.company.phoneDisplay} and we'll get you sorted in minutes.

Resume your enrollment: ${RECOVERY_BRANDING.company.portalUrl}/complete-enrollment?contactId=${data.contactId}

To your credit success,
${RECOVERY_BRANDING.company.ownerName}
${RECOVERY_BRANDING.company.name}
    `.trim();
  }
};

// ============================================================================
// TEMPLATE 2: ABANDONMENT RECOVERY (30-minute trigger)
// ============================================================================

const recoveryAbandoned30min = {
  id: 'recovery-abandoned-30min',
  name: 'Abandonment Recovery - 30 Minutes',
  description: 'Sent when user abandons enrollment form (30 minutes)',
  trigger: 'abandoned_enrollment',
  delayMinutes: 30,

  subject: (data) => {
    const subjects = [
      `Your Free Credit Report is Waiting, ${data.firstName || 'Friend'}!`,
      `${data.firstName || 'Hi'}, Don't Miss Your Free Credit Analysis`,
      `Still There? Your Report is Ready - ${data.firstName || 'Friend'}`
    ];
    return data.variant === 'B' ? subjects[1] : subjects[0];
  },

  html: (data) => {
    const resumeUrl = `${RECOVERY_BRANDING.company.portalUrl}/complete-enrollment?contactId=${data.contactId}&source=abandonment_email`;

    const content = `
      <p style="margin: 0 0 15px; color: ${RECOVERY_BRANDING.textColor}; font-size: 16px; line-height: 1.7;">
        I noticed you started your free credit report but didn't finish.
        <strong>Life gets busy - I totally get it!</strong>
      </p>

      <p style="margin: 0 0 15px; color: ${RECOVERY_BRANDING.textColor}; font-size: 16px; line-height: 1.7;">
        The good news? Your information is saved, and you can pick up right where you left off.
        It only takes about 2 more minutes to complete.
      </p>

      <!-- Benefits Box -->
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 25px 0; background-color: #f0fdf4; border-left: 4px solid ${RECOVERY_BRANDING.primaryGreen}; border-radius: 4px;">
        <tr>
          <td style="padding: 20px;">
            <p style="margin: 0 0 10px; font-weight: 700; color: ${RECOVERY_BRANDING.primaryGreen}; font-size: 16px;">
              What You'll Get (100% Free):
            </p>
            <ul style="margin: 0; padding-left: 20px; color: ${RECOVERY_BRANDING.textColor}; font-size: 15px; line-height: 1.8;">
              <li>Complete 3-bureau credit report (Experian, TransUnion, Equifax)</li>
              <li>Detailed analysis of every item affecting your score</li>
              <li>Personalized action plan to improve your credit</li>
              <li>Expert recommendations from our 30 years of experience</li>
            </ul>
          </td>
        </tr>
      </table>

      <!-- Testimonial -->
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 25px 0; background-color: #f9fafb; border-left: 4px solid #3b82f6; border-radius: 4px;">
        <tr>
          <td style="padding: 20px;">
            <p style="margin: 0 0 10px; font-style: italic; color: ${RECOVERY_BRANDING.textColor}; font-size: 15px; line-height: 1.7;">
              "I was skeptical at first, but Speedy Credit Repair helped me raise my score by 127 points
              in just 4 months. Now I qualified for my dream home!"
            </p>
            <p style="margin: 0; font-weight: 600; color: ${RECOVERY_BRANDING.primaryGreen}; font-size: 14px;">
              — Maria T., California ⭐⭐⭐⭐⭐
            </p>
          </td>
        </tr>
      </table>
    `;

    return wrapInTemplate({
      content,
      subject: recoveryAbandoned30min.subject(data),
      data,
      ctaText: 'Complete My Free Report',
      ctaUrl: resumeUrl
    });
  },

  text: (data) => {
    return `
Hi ${data.firstName || 'Friend'},

I noticed you started your free credit report but didn't finish. Life gets busy - I totally get it!

The good news? Your information is saved, and you can pick up right where you left off. It only takes about 2 more minutes to complete.

What You'll Get (100% Free):
- Complete 3-bureau credit report (Experian, TransUnion, Equifax)
- Detailed analysis of every item affecting your score
- Personalized action plan to improve your credit
- Expert recommendations from our 30 years of experience

Resume your enrollment: ${RECOVERY_BRANDING.company.portalUrl}/complete-enrollment?contactId=${data.contactId}

To your credit success,
${RECOVERY_BRANDING.company.ownerName}
${RECOVERY_BRANDING.company.name}
    `.trim();
  }
};

// ============================================================================
// TEMPLATE 3: DRIP DAY 1 (24-hour trigger)
// ============================================================================

const dripDay1 = {
  id: 'drip-day-1',
  name: 'Drip Day 1 - Educational',
  description: 'First drip email (24 hours after abandonment)',
  trigger: 'drip_sequence',
  delayMinutes: 1440, // 24 hours

  subject: (data) => {
    const subjects = [
      `${data.firstName || 'Friend'}, Here's What You're Missing`,
      `The Truth About Your Credit Score, ${data.firstName || 'Friend'}`,
      `Did You Know? Your Credit Affects These 5 Things`
    ];
    return data.variant === 'B' ? subjects[1] : subjects[0];
  },

  html: (data) => {
    const enrollUrl = `${RECOVERY_BRANDING.company.portalUrl}/complete-enrollment?contactId=${data.contactId}&source=drip_day1`;

    const content = `
      <p style="margin: 0 0 15px; color: ${RECOVERY_BRANDING.textColor}; font-size: 16px; line-height: 1.7;">
        I wanted to share something important that most people don't realize about credit...
      </p>

      <p style="margin: 0 0 15px; color: ${RECOVERY_BRANDING.textColor}; font-size: 16px; line-height: 1.7;">
        <strong>Your credit score affects way more than just loans.</strong>
        Here's what a low credit score could be costing you right now:
      </p>

      <!-- Impact List -->
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 20px 0;">
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid ${RECOVERY_BRANDING.borderGray};">
            <strong style="color: #dc2626;">🏠 Housing:</strong>
            <span style="color: ${RECOVERY_BRANDING.textColor};">Higher rent deposits, rejected lease applications</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid ${RECOVERY_BRANDING.borderGray};">
            <strong style="color: #dc2626;">🚗 Auto Insurance:</strong>
            <span style="color: ${RECOVERY_BRANDING.textColor};">Paying 20-50% more per month than you should</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid ${RECOVERY_BRANDING.borderGray};">
            <strong style="color: #dc2626;">💼 Employment:</strong>
            <span style="color: ${RECOVERY_BRANDING.textColor};">Many employers check credit for hiring decisions</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid ${RECOVERY_BRANDING.borderGray};">
            <strong style="color: #dc2626;">💡 Utilities:</strong>
            <span style="color: ${RECOVERY_BRANDING.textColor};">Required security deposits for electric, gas, phone</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 0;">
            <strong style="color: #dc2626;">💳 Interest Rates:</strong>
            <span style="color: ${RECOVERY_BRANDING.textColor};">Thousands more paid over the life of loans</span>
          </td>
        </tr>
      </table>

      <!-- Success Stats Box -->
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 25px 0; background: linear-gradient(135deg, ${RECOVERY_BRANDING.primaryGreen} 0%, ${RECOVERY_BRANDING.hoverGreen} 100%); border-radius: 8px;">
        <tr>
          <td style="padding: 25px; text-align: center;">
            <p style="margin: 0 0 5px; color: #ffffff; font-size: 32px; font-weight: 700;">
              127 Points
            </p>
            <p style="margin: 0; color: rgba(255,255,255,0.9); font-size: 15px;">
              Average score increase for our clients in the first 4 months
            </p>
          </td>
        </tr>
      </table>

      <p style="margin: 0 0 15px; color: ${RECOVERY_BRANDING.textColor}; font-size: 16px; line-height: 1.7;">
        The first step is knowing where you stand. Your <strong>free credit report and analysis</strong>
        takes just 2 minutes to get.
      </p>
    `;

    return wrapInTemplate({
      content,
      subject: dripDay1.subject(data),
      data,
      ctaText: 'Start My Journey',
      ctaUrl: enrollUrl
    });
  },

  text: (data) => {
    return `
Hi ${data.firstName || 'Friend'},

I wanted to share something important that most people don't realize about credit...

Your credit score affects way more than just loans. Here's what a low credit score could be costing you:

- Housing: Higher rent deposits, rejected lease applications
- Auto Insurance: Paying 20-50% more per month
- Employment: Many employers check credit for hiring
- Utilities: Required security deposits
- Interest Rates: Thousands more over loan life

Average score increase for our clients: 127 points in 4 months!

Get your free credit report: ${RECOVERY_BRANDING.company.portalUrl}/complete-enrollment?contactId=${data.contactId}

To your credit success,
${RECOVERY_BRANDING.company.ownerName}
${RECOVERY_BRANDING.company.name}
    `.trim();
  }
};

// ============================================================================
// TEMPLATE 4: DRIP DAY 3 (Social Proof)
// ============================================================================

const dripDay3 = {
  id: 'drip-day-3',
  name: 'Drip Day 3 - Social Proof',
  description: 'Social proof email (3 days after)',
  trigger: 'drip_sequence',
  delayMinutes: 4320, // 72 hours

  subject: (data) => {
    const subjects = [
      `Real Results from Real Clients, ${data.firstName || 'Friend'}`,
      `${data.firstName || 'Friend'}, See What Others Achieved`,
      `How Sarah Raised Her Score 156 Points...`
    ];
    return data.variant === 'B' ? subjects[2] : subjects[0];
  },

  html: (data) => {
    const enrollUrl = `${RECOVERY_BRANDING.company.portalUrl}/complete-enrollment?contactId=${data.contactId}&source=drip_day3`;

    const content = `
      <p style="margin: 0 0 15px; color: ${RECOVERY_BRANDING.textColor}; font-size: 16px; line-height: 1.7;">
        I wanted to share some real success stories from clients just like you.
        <strong>These aren't hypothetical - these are real people who took action.</strong>
      </p>

      <!-- Testimonial 1 -->
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 20px 0; background-color: #f9fafb; border-radius: 8px;">
        <tr>
          <td style="padding: 20px;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td style="width: 60px; vertical-align: top;">
                  <div style="width: 50px; height: 50px; background: linear-gradient(135deg, ${RECOVERY_BRANDING.primaryGreen}, ${RECOVERY_BRANDING.hoverGreen}); border-radius: 50%; text-align: center; line-height: 50px; font-size: 24px; color: #fff;">S</div>
                </td>
                <td style="vertical-align: top;">
                  <p style="margin: 0 0 8px; font-size: 15px; color: ${RECOVERY_BRANDING.textColor}; line-height: 1.6;">
                    <em>"I had 7 collections and thought my credit was beyond repair. Speedy removed 6 of them
                    in the first 45 days! My score went from 512 to 668 in 3 months."</em>
                  </p>
                  <p style="margin: 0; font-weight: 600; color: ${RECOVERY_BRANDING.primaryGreen}; font-size: 14px;">
                    — Sarah M., Texas | Score: 512 → 668 (+156 points) ⭐⭐⭐⭐⭐
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- Testimonial 2 -->
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 20px 0; background-color: #f9fafb; border-radius: 8px;">
        <tr>
          <td style="padding: 20px;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td style="width: 60px; vertical-align: top;">
                  <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #3b82f6, #2563eb); border-radius: 50%; text-align: center; line-height: 50px; font-size: 24px; color: #fff;">M</div>
                </td>
                <td style="vertical-align: top;">
                  <p style="margin: 0 0 8px; font-size: 15px; color: ${RECOVERY_BRANDING.textColor}; line-height: 1.6;">
                    <em>"After my divorce, my credit was a disaster. Chris and his team were so patient
                    and understanding. 8 months later, I bought my first home on my own!"</em>
                  </p>
                  <p style="margin: 0; font-weight: 600; color: ${RECOVERY_BRANDING.primaryGreen}; font-size: 14px;">
                    — Michael R., California | Score: 589 → 724 (+135 points) ⭐⭐⭐⭐⭐
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- Stats Section -->
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 25px 0; text-align: center;">
        <tr>
          <td style="padding: 15px; background-color: #fef3c7; border-radius: 8px 0 0 8px;">
            <p style="margin: 0; font-size: 28px; font-weight: 700; color: #92400e;">98%</p>
            <p style="margin: 5px 0 0; font-size: 12px; color: #92400e;">Success Rate</p>
          </td>
          <td style="padding: 15px; background-color: #f0fdf4;">
            <p style="margin: 0; font-size: 28px; font-weight: 700; color: ${RECOVERY_BRANDING.primaryGreen};">127</p>
            <p style="margin: 5px 0 0; font-size: 12px; color: ${RECOVERY_BRANDING.primaryGreen};">Avg. Point Increase</p>
          </td>
          <td style="padding: 15px; background-color: #eff6ff; border-radius: 0 8px 8px 0;">
            <p style="margin: 0; font-size: 28px; font-weight: 700; color: #1d4ed8;">10K+</p>
            <p style="margin: 5px 0 0; font-size: 12px; color: #1d4ed8;">Clients Helped</p>
          </td>
        </tr>
      </table>

      <p style="margin: 0 0 15px; color: ${RECOVERY_BRANDING.textColor}; font-size: 16px; line-height: 1.7;">
        <strong>Your story could be next.</strong> The first step is seeing where you stand with your free credit report.
      </p>
    `;

    return wrapInTemplate({
      content,
      subject: dripDay3.subject(data),
      data,
      ctaText: 'See My Potential',
      ctaUrl: enrollUrl
    });
  },

  text: (data) => {
    return `
Hi ${data.firstName || 'Friend'},

I wanted to share some real success stories from clients just like you.

"I had 7 collections and thought my credit was beyond repair. Speedy removed 6 of them in the first 45 days! My score went from 512 to 668 in 3 months."
— Sarah M., Texas (+156 points)

"After my divorce, my credit was a disaster. 8 months later, I bought my first home on my own!"
— Michael R., California (+135 points)

Our Stats: 98% Success Rate | 127 Avg Point Increase | 10K+ Clients

Your story could be next. Get your free report: ${RECOVERY_BRANDING.company.portalUrl}/complete-enrollment?contactId=${data.contactId}

To your credit success,
${RECOVERY_BRANDING.company.ownerName}
${RECOVERY_BRANDING.company.name}
    `.trim();
  }
};

// ============================================================================
// TEMPLATE 5: DRIP DAY 7 (Limited Time Offer)
// ============================================================================

const dripDay7 = {
  id: 'drip-day-7',
  name: 'Drip Day 7 - Limited Time',
  description: 'Urgency email (7 days after)',
  trigger: 'drip_sequence',
  delayMinutes: 10080, // 7 days

  subject: (data) => {
    const subjects = [
      `Limited Time: Free Credit Analysis, ${data.firstName || 'Friend'}`,
      `${data.firstName || 'Friend'}, Special Offer Expires Soon`,
      `Don't Miss This - Expires in 48 Hours`
    ];
    return data.variant === 'B' ? subjects[2] : subjects[0];
  },

  html: (data) => {
    const enrollUrl = `${RECOVERY_BRANDING.company.portalUrl}/complete-enrollment?contactId=${data.contactId}&source=drip_day7`;

    const content = `
      <p style="margin: 0 0 15px; color: ${RECOVERY_BRANDING.textColor}; font-size: 16px; line-height: 1.7;">
        I hope you've been doing well! I wanted to reach out one more time with something special...
      </p>

      <!-- Special Offer Box -->
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 25px 0; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px dashed #f59e0b; border-radius: 12px;">
        <tr>
          <td style="padding: 25px; text-align: center;">
            <p style="margin: 0 0 10px; font-size: 14px; font-weight: 600; color: #92400e; text-transform: uppercase; letter-spacing: 1px;">
              Limited Time Offer
            </p>
            <p style="margin: 0 0 15px; font-size: 24px; font-weight: 700; color: #92400e;">
              FREE Comprehensive Credit Analysis
            </p>
            <p style="margin: 0; font-size: 15px; color: #92400e;">
              Normally $150 - <strong>Yours FREE</strong> when you complete your enrollment
            </p>
          </td>
        </tr>
      </table>

      <p style="margin: 0 0 15px; color: ${RECOVERY_BRANDING.textColor}; font-size: 16px; line-height: 1.7;">
        Here's what you'll get with your <strong>FREE credit analysis</strong>:
      </p>

      <ul style="margin: 0 0 20px; padding-left: 20px; color: ${RECOVERY_BRANDING.textColor}; font-size: 15px; line-height: 1.8;">
        <li>Complete review of all 3 credit bureaus</li>
        <li>Identification of all disputable items</li>
        <li>Personalized score improvement roadmap</li>
        <li>Timeline estimate for your situation</li>
        <li>One-on-one consultation with a credit expert</li>
      </ul>

      <!-- Urgency Box -->
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 25px 0; background-color: #fef2f2; border-left: 4px solid #dc2626; border-radius: 4px;">
        <tr>
          <td style="padding: 15px;">
            <p style="margin: 0; font-weight: 600; color: #dc2626; font-size: 15px;">
              ⏰ This offer expires in 48 hours
            </p>
          </td>
        </tr>
      </table>

      <p style="margin: 0 0 15px; color: ${RECOVERY_BRANDING.textColor}; font-size: 16px; line-height: 1.7;">
        Don't let this opportunity pass you by. <strong>Your better credit future starts with one simple step.</strong>
      </p>
    `;

    return wrapInTemplate({
      content,
      subject: dripDay7.subject(data),
      data,
      ctaText: 'Claim My Free Analysis',
      ctaUrl: enrollUrl
    });
  },

  text: (data) => {
    return `
Hi ${data.firstName || 'Friend'},

I wanted to reach out one more time with something special...

LIMITED TIME OFFER: FREE Comprehensive Credit Analysis
Normally $150 - Yours FREE when you complete your enrollment

What you'll get:
- Complete review of all 3 credit bureaus
- Identification of all disputable items
- Personalized score improvement roadmap
- Timeline estimate for your situation
- One-on-one consultation with a credit expert

This offer expires in 48 hours!

Claim your free analysis: ${RECOVERY_BRANDING.company.portalUrl}/complete-enrollment?contactId=${data.contactId}

To your credit success,
${RECOVERY_BRANDING.company.ownerName}
${RECOVERY_BRANDING.company.name}
    `.trim();
  }
};

// ============================================================================
// TEMPLATE 6: DRIP DAY 14 (Final Re-engagement)
// ============================================================================

const dripDay14 = {
  id: 'drip-day-14',
  name: 'Drip Day 14 - Final Re-engagement',
  description: 'Final re-engagement email (14 days after)',
  trigger: 'drip_sequence',
  delayMinutes: 20160, // 14 days

  subject: (data) => {
    const subjects = [
      `${data.firstName || 'Friend'}, Are You Still Interested?`,
      `Last Chance: Your Free Credit Report`,
      `Quick Question, ${data.firstName || 'Friend'}...`
    ];
    return data.variant === 'B' ? subjects[1] : subjects[0];
  },

  html: (data) => {
    const enrollUrl = `${RECOVERY_BRANDING.company.portalUrl}/complete-enrollment?contactId=${data.contactId}&source=drip_day14`;

    const content = `
      <p style="margin: 0 0 15px; color: ${RECOVERY_BRANDING.textColor}; font-size: 16px; line-height: 1.7;">
        I've reached out a few times, and I don't want to be a bother. But before I stop,
        I had a quick question for you...
      </p>

      <p style="margin: 0 0 20px; color: ${RECOVERY_BRANDING.textColor}; font-size: 18px; font-weight: 600; line-height: 1.7;">
        Is there something holding you back from getting your free credit report?
      </p>

      <!-- Common Concerns -->
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 20px 0;">
        <tr>
          <td style="padding: 15px; background-color: #f0fdf4; border-radius: 8px; margin-bottom: 10px;">
            <p style="margin: 0 0 5px; font-weight: 600; color: ${RECOVERY_BRANDING.primaryGreen};">
              😟 "I'm worried it will hurt my score"
            </p>
            <p style="margin: 0; font-size: 14px; color: ${RECOVERY_BRANDING.textColor};">
              Don't worry - getting your credit report through us is a "soft pull" that does NOT affect your credit score.
            </p>
          </td>
        </tr>
        <tr><td style="height: 10px;"></td></tr>
        <tr>
          <td style="padding: 15px; background-color: #f0fdf4; border-radius: 8px; margin-bottom: 10px;">
            <p style="margin: 0 0 5px; font-weight: 600; color: ${RECOVERY_BRANDING.primaryGreen};">
              😟 "I don't have time right now"
            </p>
            <p style="margin: 0; font-size: 14px; color: ${RECOVERY_BRANDING.textColor};">
              It takes less than 3 minutes. Your information is saved, so you can pause and come back anytime.
            </p>
          </td>
        </tr>
        <tr><td style="height: 10px;"></td></tr>
        <tr>
          <td style="padding: 15px; background-color: #f0fdf4; border-radius: 8px;">
            <p style="margin: 0 0 5px; font-weight: 600; color: ${RECOVERY_BRANDING.primaryGreen};">
              😟 "I'm not sure if this is right for me"
            </p>
            <p style="margin: 0; font-size: 14px; color: ${RECOVERY_BRANDING.textColor};">
              There's zero obligation. Get your free report, see what's there, and decide if you need help. No pressure, ever.
            </p>
          </td>
        </tr>
      </table>

      <p style="margin: 0 0 15px; color: ${RECOVERY_BRANDING.textColor}; font-size: 16px; line-height: 1.7;">
        If you have any other questions or concerns, just hit reply to this email or call us at
        <strong>${RECOVERY_BRANDING.company.phoneDisplay}</strong>. We're here to help.
      </p>

      <p style="margin: 0 0 15px; color: ${RECOVERY_BRANDING.textColor}; font-size: 16px; line-height: 1.7;">
        If credit repair isn't something you're interested in right now, that's totally fine too.
        I'll stop reaching out after this email. But <strong>I hope you'll give yourself the chance to see where you stand.</strong>
      </p>
    `;

    return wrapInTemplate({
      content,
      subject: dripDay14.subject(data),
      data,
      ctaText: 'Talk to an Expert',
      ctaUrl: enrollUrl
    });
  },

  text: (data) => {
    return `
Hi ${data.firstName || 'Friend'},

I've reached out a few times, and I don't want to be a bother. Before I stop, I had a quick question...

Is there something holding you back from getting your free credit report?

Common concerns:

"I'm worried it will hurt my score"
Don't worry - it's a "soft pull" that does NOT affect your credit score.

"I don't have time right now"
It takes less than 3 minutes, and you can pause anytime.

"I'm not sure if this is right for me"
Zero obligation. Get your free report and decide. No pressure.

Have questions? Just reply or call ${RECOVERY_BRANDING.company.phoneDisplay}.

If credit repair isn't for you right now, that's fine. But I hope you'll give yourself the chance to see where you stand.

Get your free report: ${RECOVERY_BRANDING.company.portalUrl}/complete-enrollment?contactId=${data.contactId}

To your credit success,
${RECOVERY_BRANDING.company.ownerName}
${RECOVERY_BRANDING.company.name}
    `.trim();
  }
};

// ============================================================================
// TEMPLATE REGISTRY - Export all templates
// ============================================================================

const RECOVERY_TEMPLATES = {
  'recovery-failed-enrollment': recoveryFailedEnrollment,
  'recovery-abandoned-30min': recoveryAbandoned30min,
  'drip-day-1': dripDay1,
  'drip-day-3': dripDay3,
  'drip-day-7': dripDay7,
  'drip-day-14': dripDay14
};

/**
 * Get a recovery email template by ID
 * @param {string} templateId - Template identifier
 * @param {Object} data - Contact data for personalization
 * @returns {Object} Template with subject, html, and text
 */
function getRecoveryTemplate(templateId, data = {}) {
  const template = RECOVERY_TEMPLATES[templateId];

  if (!template) {
    console.error(`❌ Recovery template not found: ${templateId}`);
    return null;
  }

  return {
    id: template.id,
    name: template.name,
    subject: template.subject(data),
    html: template.html(data),
    text: template.text(data),
    trigger: template.trigger,
    delayMinutes: template.delayMinutes
  };
}

/**
 * Get all recovery templates with metadata
 * @returns {Array} Array of template metadata
 */
function listRecoveryTemplates() {
  return Object.values(RECOVERY_TEMPLATES).map(t => ({
    id: t.id,
    name: t.name,
    description: t.description,
    trigger: t.trigger,
    delayMinutes: t.delayMinutes
  }));
}

// ============================================================================
// MODULE EXPORTS
// ============================================================================

module.exports = {
  RECOVERY_TEMPLATES,
  RECOVERY_BRANDING,
  getRecoveryTemplate,
  listRecoveryTemplates,
  wrapInTemplate,

  // Individual template exports
  recoveryFailedEnrollment,
  recoveryAbandoned30min,
  dripDay1,
  dripDay3,
  dripDay7,
  dripDay14
};

// ============================================================================
// © 1995-2026 Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved
// Trademark: Speedy Credit Repair® - USPTO Registered
// ============================================================================
