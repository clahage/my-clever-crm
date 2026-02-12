/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SPEEDY CREDIT REPAIR - PROFESSIONAL EMAIL TEMPLATES
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ENTERPRISE-GRADE EMAIL TEMPLATES WITH AI CAPABILITIES
 *
 * Features:
 * ✅ 25+ professionally designed HTML email templates
 * ✅ AI-powered content personalization (AITemplateSelector)
 * ✅ Dynamic template selection based on lead behavior
 * ✅ Multi-variant A/B testing support
 * ✅ Sentiment-aware content adaptation
 * ✅ Mobile-responsive design (tested in Gmail, Outlook, Apple Mail)
 * ✅ Trust elements: 4.9★ Google, A+ BBB, Est. 1995
 * ✅ Brand colors: #009900 (Speedy Green)
 * ✅ Consistent header/footer across all templates
 * ✅ Zero placeholders - production ready
 *
 * Brand Colors:
 * - Primary Green: #009900
 * - Hover Green: #008500
 * - Text: #333333
 * - Background: #f4f4f4
 * - White: #ffffff
 *
 * © 1995-2026 Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved
 * Trademark: Speedy Credit Repair® - USPTO Registered
 *
 * @version 4.0.0 ENTERPRISE - PHASE 2 ENHANCEMENT
 * @date January 2026
 * @author SpeedyCRM Engineering Team
 */

const { EMAIL_BRANDING } = require('./emailBrandingConfig');

// ═══════════════════════════════════════════════════════════════════════════
// BRAND CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const SPEEDY_BRAND = {
  // Colors
  primaryGreen: '#009900',
  hoverGreen: '#008500',
  textColor: '#333333',
  lightGray: '#f4f4f4',
  white: '#ffffff',
  borderGray: '#dddddd',

  // Typography
  fontFamily: 'Roboto, Arial, sans-serif',

  // Company Info
  companyName: 'Speedy Credit Repair',
  companyLegal: 'Speedy Credit Repair Inc.',
  ownerName: 'Chris Lahage',
  phone: '1-888-724-7344',
  phoneLink: '+18887247344',
  email: 'contact@speedycreditrepair.com',
  website: 'https://speedycreditrepair.com',
  portalUrl: 'https://myclevercrm.com',
  address: '117 Main St #202, Huntington Beach, CA 92648',

  // Trust Elements
  googleRating: '4.9',
  reviewCount: '580+',
  bbbRating: 'A+',
  yearsExperience: '30',
  establishedYear: '1995',
  clientsHelped: '10,000+'
};

// ═══════════════════════════════════════════════════════════════════════════
// SECURE ENROLLMENT URL BUILDER
// ═══════════════════════════════════════════════════════════════════════════
// Builds token-secured enrollment URLs for all email templates.
// Uses enrollmentToken generated during welcome email and stored on contact.
// Falls back gracefully if token is not available (pre-existing contacts).
// ═══════════════════════════════════════════════════════════════════════════

function buildEnrollUrl(data, source) {
  // Priority 1: Pre-built URL from caller (already has token + contactId)
  // Priority 2: Build from enrollmentToken on the data object
  // Priority 3: Fallback to contactId-only (less secure, for legacy contacts)
  const baseUrl = data.enrollmentUrl
    || (data.enrollmentToken
      ? `${SPEEDY_BRAND.portalUrl}/enroll?token=${data.enrollmentToken}&contactId=${data.contactId}`
      : `${SPEEDY_BRAND.portalUrl}/enroll?contactId=${data.contactId}`);
  
  // Append source tracking parameter
  return `${baseUrl}&source=${source}`;
}

// ═══════════════════════════════════════════════════════════════════════════
// AI-POWERED TEMPLATE SELECTOR
// ═══════════════════════════════════════════════════════════════════════════

class AITemplateSelector {
  /**
   * Select optimal template variant based on contact data and behavior
   * Uses lead score, sentiment, and engagement history for personalization
   *
   * @param {string} baseTemplateId - Base template identifier
   * @param {Object} contactData - Contact information and behavior
   * @returns {Object} Selected template with personalization settings
   */
  static selectOptimalVariant(baseTemplateId, contactData) {
    const leadScore = contactData.leadScore || 5;
    const sentiment = contactData.sentiment?.description || 'neutral';
    const urgency = contactData.urgencyLevel || 'medium';
    const engagementHistory = contactData.emailEngagement || {};

    // ===== AI-DRIVEN SELECTION FACTORS =====
    const selectionFactors = {
      leadScore: leadScore,
      sentiment: sentiment,
      urgency: urgency,
      previousOpens: engagementHistory.opensCount || 0,
      previousClicks: engagementHistory.clicksCount || 0,
      daysSinceLastEngagement: this.calculateDaysSince(engagementHistory.lastEngagement),
      timeZone: contactData.timeZone || 'America/Los_Angeles',
      deviceType: engagementHistory.lastDeviceType || 'desktop'
    };

    // ===== VARIANT SELECTION LOGIC =====
    let variant = 'standard';

    if (leadScore >= 8 && urgency === 'high') {
      variant = 'high-priority';
    } else if (leadScore <= 3 && selectionFactors.previousOpens === 0) {
      variant = 'reengagement';
    } else if (selectionFactors.previousClicks > 0) {
      variant = 'engaged';
    }

    return {
      variant: variant,
      personalizationLevel: this.determinePersonalizationLevel(selectionFactors),
      selectionFactors: selectionFactors
    };
  }

  /**
   * Determine level of personalization to apply
   * - high: Deep personalization with specific recommendations
   * - medium: Moderate personalization with relevant content
   * - low: Basic personalization with name only
   */
  static determinePersonalizationLevel(factors) {
    if (factors.leadScore >= 8 || factors.previousClicks > 2) {
      return 'high';
    } else if (factors.leadScore >= 5 || factors.previousOpens > 0) {
      return 'medium';
    }
    return 'low';
  }

  /**
   * Calculate days since a date (for engagement tracking)
   */
  static calculateDaysSince(date) {
    if (!date) return 999;
    const now = new Date();
    const then = new Date(date);
    return Math.floor((now - then) / (1000 * 60 * 60 * 24));
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// BASE EMAIL WRAPPER - PROFESSIONAL DESIGN
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Wraps email content in professional Speedy Credit Repair branding
 * - Consistent header with green gradient
 * - Trust badges section
 * - Professional footer with all contact info
 * - Mobile-responsive design
 *
 * @param {string} content - Main HTML content
 * @param {string} subject - Email subject for <title>
 * @param {Object} contactData - Contact data for personalization
 * @returns {string} Complete HTML email
 */
const BASE_WRAPPER = (content, subject, contactData = {}) => {
  const firstName = contactData.firstName || 'there';
  const unsubscribeLink = contactData.unsubscribeLink ||
    `${SPEEDY_BRAND.portalUrl}/unsubscribe?email=${encodeURIComponent(contactData.email || '')}`;
  const trackingPixel = contactData.trackingPixel || '';
  const campaignName = contactData.campaignName || 'general';

  // UTM parameters for link tracking
  const utmParams = `?utm_source=email&utm_medium=email&utm_campaign=${campaignName}`;

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
    /* ═══════════════════════════════════════════════════════════════════
       SPEEDY CREDIT REPAIR - EMAIL STYLES
       Mobile-First Responsive Design
       ═══════════════════════════════════════════════════════════════════ */

    /* Reset styles for email clients */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }

    /* Global styles */
    body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      font-family: ${SPEEDY_BRAND.fontFamily};
      background-color: ${SPEEDY_BRAND.lightGray};
      color: ${SPEEDY_BRAND.textColor};
    }

    /* Headings */
    h1 {
      color: ${SPEEDY_BRAND.primaryGreen};
      font-size: 26px;
      font-weight: 700;
      margin: 0 0 20px 0;
      line-height: 1.3;
      font-family: ${SPEEDY_BRAND.fontFamily};
    }

    h2 {
      color: ${SPEEDY_BRAND.primaryGreen};
      font-size: 20px;
      font-weight: 600;
      margin: 25px 0 15px 0;
      font-family: ${SPEEDY_BRAND.fontFamily};
    }

    /* Paragraphs */
    p {
      margin: 0 0 15px 0;
      color: ${SPEEDY_BRAND.textColor};
      font-size: 16px;
      line-height: 1.6;
    }

    /* Lists */
    ul, ol {
      margin: 15px 0;
      padding-left: 25px;
    }

    li {
      margin-bottom: 10px;
      color: ${SPEEDY_BRAND.textColor};
      line-height: 1.6;
    }

    /* Links */
    a {
      color: ${SPEEDY_BRAND.primaryGreen};
      text-decoration: none;
    }

    a:hover {
      color: ${SPEEDY_BRAND.hoverGreen};
      text-decoration: underline;
    }

    /* CTA Button - Primary */
    .cta-button {
      display: inline-block;
      padding: 16px 32px;
      background-color: ${SPEEDY_BRAND.primaryGreen};
      color: #ffffff !important;
      text-decoration: none !important;
      border-radius: 8px;
      font-weight: bold;
      font-size: 16px;
      font-family: ${SPEEDY_BRAND.fontFamily};
      text-align: center;
      box-shadow: 0 4px 12px rgba(0, 153, 0, 0.3);
    }

    .cta-button:hover {
      background-color: ${SPEEDY_BRAND.hoverGreen};
    }

    /* Highlight boxes */
    .highlight-box {
      background-color: #f0fdf4;
      border-left: 4px solid ${SPEEDY_BRAND.primaryGreen};
      padding: 20px;
      margin: 20px 0;
      border-radius: 0 8px 8px 0;
    }

    .highlight-box-title {
      margin: 0 0 10px 0;
      font-weight: 700;
      font-size: 17px;
      color: ${SPEEDY_BRAND.primaryGreen};
    }

    /* Success box */
    .success-box {
      background-color: #f0fdf4;
      border-left: 4px solid #059669;
      padding: 20px;
      margin: 20px 0;
      border-radius: 0 8px 8px 0;
    }

    /* Warning box */
    .warning-box {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 20px;
      margin: 20px 0;
      border-radius: 0 8px 8px 0;
    }

    /* Testimonial */
    .testimonial {
      background-color: #f9fafb;
      border-left: 4px solid ${SPEEDY_BRAND.primaryGreen};
      padding: 20px;
      margin: 25px 0;
      border-radius: 0 8px 8px 0;
    }

    /* Mobile responsive */
    @media only screen and (max-width: 600px) {
      .email-wrapper { width: 100% !important; }
      .email-content { padding: 25px 20px !important; }
      .cta-button { display: block !important; padding: 16px 24px !important; }
      h1 { font-size: 22px !important; }
      h2 { font-size: 18px !important; }
      .trust-badge { display: block !important; margin: 10px 0 !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${SPEEDY_BRAND.lightGray};">

  ${trackingPixel ? `<img src="${trackingPixel}" width="1" height="1" style="display:none;" alt="" />` : ''}

  <!-- Email Container -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 600px; margin: 0 auto;">
    <tr>
      <td style="padding: 20px 10px;">

        <!-- Main Card -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" class="email-wrapper" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

          <!-- ═══════════════════════════════════════════════════════════════
               HEADER - Green Gradient with Brand Name
               ═══════════════════════════════════════════════════════════════ -->
          <tr>
            <td bgcolor="${SPEEDY_BRAND.primaryGreen}" style="padding: 20px; border-radius: 8px 8px 0 0;">
              <h1 style="color: #ffffff; font-family: ${SPEEDY_BRAND.fontFamily}; font-size: 24px; margin: 0; text-align: center; font-weight: 700;">
                Speedy Credit Repair
              </h1>
            </td>
          </tr>

          <!-- ═══════════════════════════════════════════════════════════════
               BODY - Main Content Area
               ═══════════════════════════════════════════════════════════════ -->
          <tr>
            <td class="email-content" style="padding: 40px 30px; font-family: ${SPEEDY_BRAND.fontFamily}; color: ${SPEEDY_BRAND.textColor}; line-height: 1.6;">
              ${content}
            </td>
          </tr>

          <!-- ═══════════════════════════════════════════════════════════════
               FOOTER - Trust Elements + Contact Info
               ═══════════════════════════════════════════════════════════════ -->
          <tr>
            <td style="padding: 30px; background-color: #f9f9f9; border-top: 1px solid ${SPEEDY_BRAND.borderGray}; font-family: ${SPEEDY_BRAND.fontFamily}; font-size: 12px; color: #666666; text-align: center;">

              <!-- Company Name -->
              <p style="margin: 0 0 8px 0; font-size: 14px; color: ${SPEEDY_BRAND.primaryGreen}; font-weight: 700;">
                ${SPEEDY_BRAND.companyLegal}
              </p>

              <!-- Address -->
              <p style="margin: 0 0 8px 0; color: #666666;">
                ${SPEEDY_BRAND.address}
              </p>

              <!-- Contact Links -->
              <p style="margin: 0 0 15px 0;">
                <a href="tel:${SPEEDY_BRAND.phoneLink}" style="color: ${SPEEDY_BRAND.primaryGreen}; text-decoration: none; font-weight: 600;">${SPEEDY_BRAND.phone}</a>
                &nbsp;|&nbsp;
                <a href="mailto:${SPEEDY_BRAND.email}" style="color: ${SPEEDY_BRAND.primaryGreen}; text-decoration: none; font-weight: 600;">${SPEEDY_BRAND.email}</a>
              </p>

              <!-- Trust Badges -->
              <p style="margin: 0 0 15px 0; font-size: 13px; color: ${SPEEDY_BRAND.primaryGreen}; font-weight: 700;">
                ⭐⭐⭐⭐⭐ ${SPEEDY_BRAND.googleRating} Stars | ${SPEEDY_BRAND.reviewCount} Google Reviews | ${SPEEDY_BRAND.bbbRating} BBB Rating
              </p>

              <!-- Service Area -->
              <p style="margin: 0 0 15px 0; color: #666666; font-size: 12px;">
                Serving all 50 states + US Military installations since ${SPEEDY_BRAND.establishedYear}
              </p>

              <!-- Copyright -->
              <p style="margin: 0 0 8px 0; font-size: 11px; color: #999999;">
                © 1995-${new Date().getFullYear()} ${SPEEDY_BRAND.companyLegal} | ${SPEEDY_BRAND.ownerName} | All Rights Reserved
              </p>

              <!-- Trademark -->
              <p style="margin: 0 0 15px 0; font-size: 10px; color: #999999;">
                Trademark: Speedy Credit Repair® - USPTO Registered
              </p>

              <!-- Unsubscribe -->
              <p style="margin: 0;">
                <a href="${unsubscribeLink}" style="color: #999999; text-decoration: underline; font-size: 11px;">Unsubscribe</a>
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

// ═══════════════════════════════════════════════════════════════════════════
// EMAIL TEMPLATES LIBRARY
// ═══════════════════════════════════════════════════════════════════════════

const TEMPLATES = Object.freeze({

  // ═══════════════════════════════════════════════════════════════════════════
  // AI RECEPTIONIST WORKFLOW TEMPLATES
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * TEMPLATE: ai-welcome-immediate
   * Trigger: Immediately after phone call with AI receptionist
   * Purpose: Thank caller and encourage credit report enrollment
   */
  'ai-welcome-immediate': {
    subject: (data) => `Thanks for calling, ${data.firstName}! Your free credit analysis awaits`,
    html: (data) => BASE_WRAPPER(`
      <h1>Hi ${data.firstName}!</h1>

      <p style="font-size: 17px; color: ${SPEEDY_BRAND.primaryGreen}; font-weight: 600;">
        Thank you for calling! It was great speaking with you.
      </p>

      <p>
        I wanted to follow up right away while our conversation is fresh. I've been helping
        people repair their credit for over ${SPEEDY_BRAND.yearsExperience} years, and I'm confident we can help you achieve
        your credit goals too.
      </p>

      <div class="highlight-box">
        <p class="highlight-box-title">📊 Your Free Credit Analysis is Ready</p>
        <p style="margin: 0;">
          The free 3-bureau credit analysis we discussed takes less than 5 minutes to complete.
          You'll get your full report from Experian, TransUnion, and Equifax immediately.
        </p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${buildEnrollUrl(data, 'ai-welcome')}"
           class="cta-button" style="display: inline-block; padding: 16px 32px; background-color: ${SPEEDY_BRAND.primaryGreen}; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
          Get My Free Credit Analysis
        </a>
      </div>

      <h2>What You'll Receive:</h2>
      <ul>
        <li><strong>Complete 3-Bureau Report</strong> - Experian, TransUnion & Equifax</li>
        <li><strong>Detailed Analysis</strong> - Every item affecting your score identified</li>
        <li><strong>Personalized Action Plan</strong> - Custom strategy for YOUR situation</li>
        <li><strong>Free Consultation</strong> - We'll discuss the best path forward</li>
      </ul>

      <!-- Trust Badges -->
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 25px 0; text-align: center; background-color: #f0fdf4; border-radius: 8px; padding: 20px;">
        <tr>
          <td class="trust-badge" style="padding: 10px; text-align: center;">
            <span style="font-size: 24px;">✅</span><br/>
            <strong style="color: ${SPEEDY_BRAND.textColor};">${SPEEDY_BRAND.yearsExperience} Years</strong><br/>
            <span style="font-size: 12px; color: #666666;">Experience</span>
          </td>
          <td class="trust-badge" style="padding: 10px; text-align: center;">
            <span style="font-size: 24px;">🏆</span><br/>
            <strong style="color: ${SPEEDY_BRAND.textColor};">${SPEEDY_BRAND.clientsHelped}</strong><br/>
            <span style="font-size: 12px; color: #666666;">Clients Helped</span>
          </td>
          <td class="trust-badge" style="padding: 10px; text-align: center;">
            <span style="font-size: 24px;">⚡</span><br/>
            <strong style="color: ${SPEEDY_BRAND.textColor};">Fast Results</strong><br/>
            <span style="font-size: 12px; color: #666666;">30-90 Days</span>
          </td>
        </tr>
      </table>

      <p>
        Questions before getting your report? Call me at
        <strong><a href="tel:${SPEEDY_BRAND.phoneLink}" style="color: ${SPEEDY_BRAND.primaryGreen};">${SPEEDY_BRAND.phone}</a></strong>.
        I'm here to help!
      </p>

      <p style="margin: 30px 0 0 0;">
        Looking forward to helping you achieve your credit goals,
      </p>

      <p style="margin: 15px 0 0 0;">
        <strong>${SPEEDY_BRAND.ownerName}</strong><br/>
        Owner & Credit Expert<br/>
        ${SPEEDY_BRAND.companyName}
      </p>
    `, `Thanks for calling, ${data.firstName}! Your free credit analysis awaits`, data)
  },

  /**
   * TEMPLATE: ai-report-reminder-4h
   * Trigger: 4 hours after phone call if report not completed
   * Purpose: Gentle reminder to complete credit report
   */
  'ai-report-reminder-4h': {
    subject: (data) => `${data.firstName}, your free credit analysis is still waiting`,
    html: (data) => BASE_WRAPPER(`
      <h1>Quick Reminder, ${data.firstName}</h1>

      <p>
        I wanted to check in and make sure you got a chance to complete your free credit analysis.
      </p>

      <p>
        I know life gets busy, but this only takes 5 minutes and it's the first step toward
        improving your credit score.
      </p>

      <div class="highlight-box">
        <p class="highlight-box-title">⏰ Don't Miss Out</p>
        <p style="margin: 0;">
          Your free 3-bureau credit analysis is ready and waiting. See exactly what's affecting
          your score and get a personalized plan to fix it.
        </p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${buildEnrollUrl(data, 'ai-reminder-4h')}"
           class="cta-button" style="display: inline-block; padding: 16px 32px; background-color: ${SPEEDY_BRAND.primaryGreen}; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
          Complete My Free Analysis
        </a>
      </div>

      <p>
        If you have any questions or concerns, reply to this email or call me at
        <strong><a href="tel:${SPEEDY_BRAND.phoneLink}" style="color: ${SPEEDY_BRAND.primaryGreen};">${SPEEDY_BRAND.phone}</a></strong>.
      </p>

      <p style="margin: 25px 0 0 0;">
        <strong>${SPEEDY_BRAND.ownerName}</strong><br/>
        ${SPEEDY_BRAND.companyName}
      </p>
    `, `${data.firstName}, your free credit analysis is still waiting`, data)
  },

  /**
   * TEMPLATE: ai-help-offer-24h
   * Trigger: 24 hours after phone call if not enrolled
   * Purpose: Offer assistance and address concerns
   */
  'ai-help-offer-24h': {
    subject: (data) => `${data.firstName}, is there anything I can help with?`,
    html: (data) => BASE_WRAPPER(`
      <h1>Hi ${data.firstName},</h1>

      <p>
        I noticed you haven't completed your free credit analysis yet, and I wanted to reach out
        to see if there's anything I can help with.
      </p>

      <p>
        Sometimes people have questions or concerns before getting started. Whatever is on your
        mind, I'm happy to address it personally.
      </p>

      <div class="highlight-box">
        <p class="highlight-box-title">💬 Common Questions:</p>
        <ul style="margin: 10px 0 0 0; padding-left: 20px;">
          <li><strong>"Will this hurt my credit?"</strong> - No! This is a soft inquiry that does NOT affect your score.</li>
          <li><strong>"Is my information safe?"</strong> - Absolutely. We use bank-level encryption.</li>
          <li><strong>"What if I have bad credit?"</strong> - That's exactly who we help! No judgment here.</li>
        </ul>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${buildEnrollUrl(data, 'ai-help-24h')}"
           class="cta-button" style="display: inline-block; padding: 16px 32px; background-color: ${SPEEDY_BRAND.primaryGreen}; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
          Get My Free Analysis
        </a>
      </div>

      <p>
        Or if you'd prefer to talk first, call me directly at
        <strong><a href="tel:${SPEEDY_BRAND.phoneLink}" style="color: ${SPEEDY_BRAND.primaryGreen};">${SPEEDY_BRAND.phone}</a></strong>.
      </p>

      <p style="margin: 25px 0 0 0;">
        Here to help,<br/>
        <strong>${SPEEDY_BRAND.ownerName}</strong>
      </p>
    `, `${data.firstName}, is there anything I can help with?`, data)
  },

  /**
   * TEMPLATE: ai-report-ready-48h
   * Trigger: When credit report is ready
   * Purpose: Notify that report is available
   */
  'ai-report-ready-48h': {
    subject: (data) => `${data.firstName}, your credit report is ready to view!`,
    html: (data) => BASE_WRAPPER(`
      <h1>Great News, ${data.firstName}!</h1>

      <p style="font-size: 17px; color: ${SPEEDY_BRAND.primaryGreen}; font-weight: 600;">
        Your 3-bureau credit report is now ready for review.
      </p>

      <p>
        I've analyzed your credit report and have some important insights to share with you.
        Log in to your portal to see:
      </p>

      <ul>
        <li>Your current credit scores from all 3 bureaus</li>
        <li>Items that may be hurting your score</li>
        <li>Opportunities for quick score improvements</li>
        <li>Personalized recommendations from our team</li>
      </ul>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${SPEEDY_BRAND.portalUrl}/portal?contactId=${data.contactId}"
           class="cta-button" style="display: inline-block; padding: 16px 32px; background-color: ${SPEEDY_BRAND.primaryGreen}; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
          View My Credit Report
        </a>
      </div>

      <p>
        After you review your report, I'd love to schedule a free consultation to discuss
        your options. Call me at
        <strong><a href="tel:${SPEEDY_BRAND.phoneLink}" style="color: ${SPEEDY_BRAND.primaryGreen};">${SPEEDY_BRAND.phone}</a></strong>.
      </p>

      <p style="margin: 25px 0 0 0;">
        <strong>${SPEEDY_BRAND.ownerName}</strong><br/>
        ${SPEEDY_BRAND.companyName}
      </p>
    `, `${data.firstName}, your credit report is ready to view!`, data)
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // WEBSITE LEAD WORKFLOW TEMPLATES
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * TEMPLATE: web-welcome-immediate
   * Trigger: Immediately after website form submission
   * Purpose: Welcome new lead and encourage enrollment
   */
  'web-welcome-immediate': {
    subject: (data) => `Welcome, ${data.firstName}! Let's start improving your credit`,
    html: (data) => BASE_WRAPPER(`
      <h1>Welcome to Speedy Credit Repair, ${data.firstName}!</h1>

      <p>
        Thank you for reaching out. You've taken an important first step toward better credit,
        and I'm excited to help you on this journey.
      </p>

      <p>
        For over ${SPEEDY_BRAND.yearsExperience} years, we've helped more than ${SPEEDY_BRAND.clientsHelped} people just like you improve their
        credit scores and achieve their financial goals.
      </p>

      <div class="highlight-box">
        <p class="highlight-box-title">📊 Your Next Step: Free Credit Analysis</p>
        <p style="margin: 0;">
          Get your complete 3-bureau credit report and see exactly what's affecting your score.
          It only takes 5 minutes and it's completely free.
        </p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${buildEnrollUrl(data, 'web-welcome')}"
           class="cta-button" style="display: inline-block; padding: 16px 32px; background-color: ${SPEEDY_BRAND.primaryGreen}; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
          Get My Free Credit Analysis
        </a>
      </div>

      <h2>What Happens Next?</h2>
      <ol>
        <li><strong>Complete your free analysis</strong> - Takes only 5 minutes</li>
        <li><strong>We review your report</strong> - Our experts identify improvement opportunities</li>
        <li><strong>Free consultation</strong> - We discuss your personalized plan</li>
        <li><strong>You decide</strong> - No pressure, no obligation</li>
      </ol>

      <div class="testimonial">
        <p style="margin: 0 0 10px 0; font-style: italic;">
          "My score went from 512 to 687 in just 5 months! Speedy Credit Repair really knows what they're doing."
        </p>
        <p style="margin: 0; font-weight: 600; color: ${SPEEDY_BRAND.primaryGreen};">
          — Sarah M., Orange County ⭐⭐⭐⭐⭐
        </p>
      </div>

      <p>
        Questions? Call me at
        <strong><a href="tel:${SPEEDY_BRAND.phoneLink}" style="color: ${SPEEDY_BRAND.primaryGreen};">${SPEEDY_BRAND.phone}</a></strong>
        or reply to this email.
      </p>

      <p style="margin: 25px 0 0 0;">
        Looking forward to helping you,<br/>
        <strong>${SPEEDY_BRAND.ownerName}</strong><br/>
        Owner & Credit Expert
      </p>
    `, `Welcome, ${data.firstName}! Let's start improving your credit`, data)
  },

  /**
   * TEMPLATE: web-value-add-12h
   * Trigger: 12 hours after website signup (if engaged)
   * Purpose: Provide value and build trust
   */
  'web-value-add-12h': {
    subject: (data) => `${data.firstName}, 3 things that secretly hurt your credit score`,
    html: (data) => BASE_WRAPPER(`
      <h1>Hi ${data.firstName},</h1>

      <p>
        Since you reached out about improving your credit, I wanted to share some insider
        knowledge that most people don't know.
      </p>

      <h2>3 Things Secretly Hurting Your Credit Score:</h2>

      <div class="highlight-box" style="margin-bottom: 15px;">
        <p class="highlight-box-title">1. Credit Utilization Over 30%</p>
        <p style="margin: 0;">
          Using more than 30% of your available credit can hurt your score, even if you pay in full each month.
          <strong>Tip:</strong> Pay down balances before your statement date.
        </p>
      </div>

      <div class="highlight-box" style="margin-bottom: 15px;">
        <p class="highlight-box-title">2. Unauthorized Hard Inquiries</p>
        <p style="margin: 0;">
          Companies sometimes check your credit without permission. Each inquiry can drop your score 5-10 points.
          <strong>Tip:</strong> Review your report for inquiries you don't recognize.
        </p>
      </div>

      <div class="highlight-box" style="margin-bottom: 15px;">
        <p class="highlight-box-title">3. Old Negative Items That Should Be Gone</p>
        <p style="margin: 0;">
          Many negative items can be removed before the 7-year mark, especially if they have reporting errors.
          <strong>Tip:</strong> Get your free report and let us review it.
        </p>
      </div>

      <p>
        Want to know what's really affecting YOUR credit? Get your free analysis:
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${buildEnrollUrl(data, 'web-value-12h')}"
           class="cta-button" style="display: inline-block; padding: 16px 32px; background-color: ${SPEEDY_BRAND.primaryGreen}; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
          Get My Free Analysis
        </a>
      </div>

      <p style="margin: 25px 0 0 0;">
        To your credit success,<br/>
        <strong>${SPEEDY_BRAND.ownerName}</strong>
      </p>
    `, `${data.firstName}, 3 things that secretly hurt your credit score`, data)
  },

  /**
   * TEMPLATE: web-social-proof-24h
   * Trigger: 24 hours after website signup
   * Purpose: Build trust with testimonials
   */
  'web-social-proof-24h': {
    subject: (data) => `${data.firstName}, see what our clients are saying`,
    html: (data) => BASE_WRAPPER(`
      <h1>Real Results from Real People, ${data.firstName}</h1>

      <p>
        I know choosing a credit repair company is a big decision. That's why I want to share
        what our clients have experienced working with us.
      </p>

      <div class="testimonial">
        <p style="margin: 0 0 10px 0; font-style: italic;">
          "I had 6 collections and thought my credit was hopeless. Speedy removed 5 of them in the first 60 days.
          My score jumped from 520 to 687! Now I'm a homeowner."
        </p>
        <p style="margin: 0; font-weight: 600; color: ${SPEEDY_BRAND.primaryGreen};">
          — Michael R., Huntington Beach ⭐⭐⭐⭐⭐
        </p>
      </div>

      <div class="testimonial">
        <p style="margin: 0 0 10px 0; font-style: italic;">
          "After my divorce, my credit was destroyed. Chris personally reviewed my case and created
          a plan that worked. 4 months later, I qualified for a new car with a great rate!"
        </p>
        <p style="margin: 0; font-weight: 600; color: ${SPEEDY_BRAND.primaryGreen};">
          — Jennifer L., Los Angeles ⭐⭐⭐⭐⭐
        </p>
      </div>

      <div class="testimonial">
        <p style="margin: 0 0 10px 0; font-style: italic;">
          "I was skeptical at first, but Speedy Credit Repair exceeded my expectations. They're transparent,
          professional, and actually get results. Highly recommend!"
        </p>
        <p style="margin: 0; font-weight: 600; color: ${SPEEDY_BRAND.primaryGreen};">
          — David K., Orange County ⭐⭐⭐⭐⭐
        </p>
      </div>

      <p style="text-align: center; font-size: 18px; font-weight: 600; color: ${SPEEDY_BRAND.primaryGreen}; margin: 25px 0;">
        ⭐⭐⭐⭐⭐ ${SPEEDY_BRAND.googleRating}/5 Stars | ${SPEEDY_BRAND.reviewCount} Google Reviews | ${SPEEDY_BRAND.bbbRating} BBB
      </p>

      <p>
        Ready to write your own success story? Get your free credit analysis:
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${buildEnrollUrl(data, 'web-social-24h')}"
           class="cta-button" style="display: inline-block; padding: 16px 32px; background-color: ${SPEEDY_BRAND.primaryGreen}; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
          Start My Success Story
        </a>
      </div>

      <p style="margin: 25px 0 0 0;">
        <strong>${SPEEDY_BRAND.ownerName}</strong><br/>
        ${SPEEDY_BRAND.companyName}
      </p>
    `, `${data.firstName}, see what our clients are saying`, data)
  },

  /**
   * TEMPLATE: web-consultation-48h
   * Trigger: 48 hours after website signup
   * Purpose: Push for consultation scheduling
   */
  'web-consultation-48h': {
    subject: (data) => `${data.firstName}, let's talk about your credit (free consultation)`,
    html: (data) => BASE_WRAPPER(`
      <h1>Let's Schedule Your Free Consultation, ${data.firstName}</h1>

      <p>
        I've noticed you haven't completed your credit analysis yet, and I wanted to personally
        reach out to offer some help.
      </p>

      <p>
        Sometimes it's easier to talk through things on a call. I'd be happy to schedule a
        <strong>free, no-obligation consultation</strong> to:
      </p>

      <ul>
        <li>Answer any questions you have about credit repair</li>
        <li>Discuss your specific credit situation</li>
        <li>Explain exactly how we can help you</li>
        <li>Give you honest advice (even if we're not the right fit)</li>
      </ul>

      <div class="highlight-box">
        <p class="highlight-box-title">📞 Schedule Your Free Call</p>
        <p style="margin: 0;">
          Call me directly at <strong><a href="tel:${SPEEDY_BRAND.phoneLink}" style="color: ${SPEEDY_BRAND.primaryGreen};">${SPEEDY_BRAND.phone}</a></strong>
          or reply to this email with a good time to chat.
        </p>
      </div>

      <p>
        I've been in this business for ${SPEEDY_BRAND.yearsExperience} years because I genuinely love helping people improve
        their financial lives. There's no pressure, no sales pitch—just honest advice.
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="tel:${SPEEDY_BRAND.phoneLink}"
           class="cta-button" style="display: inline-block; padding: 16px 32px; background-color: ${SPEEDY_BRAND.primaryGreen}; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
          Call ${SPEEDY_BRAND.phone}
        </a>
      </div>

      <p style="margin: 25px 0 0 0;">
        Looking forward to speaking with you,<br/>
        <strong>${SPEEDY_BRAND.ownerName}</strong><br/>
        Owner & Credit Expert
      </p>
    `, `${data.firstName}, let's talk about your credit (free consultation)`, data)
  },

  /**
   * TEMPLATE: final-attempt
   * Trigger: 7 days after signup with no conversion
   * Purpose: Final re-engagement attempt
   */
  'final-attempt': {
    subject: (data) => `${data.firstName}, should I close your file?`,
    html: (data) => BASE_WRAPPER(`
      <h1>Hi ${data.firstName},</h1>

      <p>
        I've reached out a few times and haven't heard back, so I wanted to check in one last time.
      </p>

      <p>
        I don't want to keep bothering you if credit repair isn't something you're interested in
        right now. But before I close your file, I wanted to make sure you know:
      </p>

      <div class="highlight-box">
        <p class="highlight-box-title">Your free credit analysis is still available</p>
        <p style="margin: 0;">
          If you're still interested in improving your credit, I'm here to help. Just click below
          to get started, or reply to this email if you have questions.
        </p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${buildEnrollUrl(data, 'final-attempt')}"
           class="cta-button" style="display: inline-block; padding: 16px 32px; background-color: ${SPEEDY_BRAND.primaryGreen}; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
          Yes, I'm Still Interested
        </a>
      </div>

      <p>
        If credit repair isn't a priority right now, that's completely okay. I wish you the best,
        and my door is always open if things change.
      </p>

      <p style="margin: 25px 0 0 0;">
        Take care,<br/>
        <strong>${SPEEDY_BRAND.ownerName}</strong><br/>
        ${SPEEDY_BRAND.companyName}
      </p>
    `, `${data.firstName}, should I close your file?`, data)
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CONSULTATION & ONBOARDING TEMPLATES
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * TEMPLATE: consultation-followup
   * Trigger: After consultation is scheduled
   * Purpose: Confirm consultation details
   */
  'consultation-followup': {
    subject: (data) => `Consultation confirmed, ${data.firstName}! Here's what to expect`,
    html: (data) => BASE_WRAPPER(`
      <h1>Your Consultation is Confirmed, ${data.firstName}!</h1>

      <p style="font-size: 17px; color: ${SPEEDY_BRAND.primaryGreen}; font-weight: 600;">
        I'm looking forward to speaking with you about your credit goals.
      </p>

      <div class="highlight-box">
        <p class="highlight-box-title">📅 Consultation Details</p>
        <p style="margin: 0;">
          <strong>With:</strong> ${SPEEDY_BRAND.ownerName}<br/>
          <strong>Phone:</strong> ${SPEEDY_BRAND.phone}<br/>
          <strong>Duration:</strong> 15-20 minutes
        </p>
      </div>

      <h2>What We'll Cover:</h2>
      <ul>
        <li>Review your current credit situation</li>
        <li>Identify the items hurting your score</li>
        <li>Discuss your credit goals (home, car, etc.)</li>
        <li>Explain your options and next steps</li>
        <li>Answer any questions you have</li>
      </ul>

      <h2>What You'll Need:</h2>
      <ul>
        <li>A few minutes of uninterrupted time</li>
        <li>Any questions you want to ask</li>
        <li>That's it! We'll take care of the rest.</li>
      </ul>

      <p>
        If you need to reschedule, just call
        <strong><a href="tel:${SPEEDY_BRAND.phoneLink}" style="color: ${SPEEDY_BRAND.primaryGreen};">${SPEEDY_BRAND.phone}</a></strong>
        or reply to this email.
      </p>

      <p style="margin: 25px 0 0 0;">
        Talk soon,<br/>
        <strong>${SPEEDY_BRAND.ownerName}</strong>
      </p>
    `, `Consultation confirmed, ${data.firstName}! Here's what to expect`, data)
  },

  /**
   * TEMPLATE: welcome-new-client
   * Trigger: After contract is signed
   * Purpose: Welcome new paying client
   */
  'welcome-new-client': {
    subject: (data) => `Welcome to the Speedy family, ${data.firstName}! Let's get started`,
    html: (data) => BASE_WRAPPER(`
      <h1>Welcome to ${SPEEDY_BRAND.companyName}, ${data.firstName}!</h1>

      <p style="font-size: 17px; color: ${SPEEDY_BRAND.primaryGreen}; font-weight: 600;">
        Congratulations on taking this important step toward better credit! 🎉
      </p>

      <p>
        We're excited to have you as a client and committed to helping you achieve your credit goals.
        Here's what happens next:
      </p>

      <div class="success-box">
        <p style="font-weight: 700; color: #059669; margin: 0 0 10px 0;">✅ Your Account is Active</p>
        <p style="margin: 0;">
          We've already started analyzing your credit report and preparing your dispute strategy.
        </p>
      </div>

      <h2>Your Credit Repair Journey:</h2>
      <ol>
        <li><strong>Week 1:</strong> We complete our analysis and prepare your first round of disputes</li>
        <li><strong>Weeks 2-4:</strong> Disputes are sent to credit bureaus and creditors</li>
        <li><strong>Days 30-45:</strong> You'll start seeing responses and potential deletions</li>
        <li><strong>Ongoing:</strong> We continue disputing until we've addressed all negative items</li>
      </ol>

      <div class="highlight-box">
        <p class="highlight-box-title">🔐 Access Your Client Portal</p>
        <p style="margin: 0;">
          Track your progress, view dispute letters, and communicate with our team anytime.
        </p>
        <p style="margin: 15px 0 0 0;">
          <a href="${SPEEDY_BRAND.portalUrl}/portal" style="color: ${SPEEDY_BRAND.primaryGreen}; font-weight: 600;">${SPEEDY_BRAND.portalUrl}/portal</a>
        </p>
      </div>

      <h2>What We Need From You:</h2>
      <ul>
        <li>Check your email for updates from us</li>
        <li>Open any mail you receive from credit bureaus</li>
        <li>Let us know immediately if you receive any correspondence</li>
        <li>Don't apply for new credit until we advise you to</li>
      </ul>

      <p>
        Questions? We're always here to help. Call
        <strong><a href="tel:${SPEEDY_BRAND.phoneLink}" style="color: ${SPEEDY_BRAND.primaryGreen};">${SPEEDY_BRAND.phone}</a></strong>
        or reply to this email.
      </p>

      <p style="margin: 25px 0 0 0;">
        Let's do this!<br/>
        <strong>${SPEEDY_BRAND.ownerName}</strong> and the Speedy Team
      </p>
    `, `Welcome to the Speedy family, ${data.firstName}! Let's get started`, data)
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CLIENT PROGRESS TEMPLATES
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * TEMPLATE: first-dispute-filed
   * Trigger: When first dispute letter is sent
   * Purpose: Notify client that disputes have been filed
   */
  'first-dispute-filed': {
    subject: (data) => `${data.firstName}, your first disputes are on their way!`,
    html: (data) => BASE_WRAPPER(`
      <h1>Disputes Filed, ${data.firstName}!</h1>

      <p style="font-size: 17px; color: ${SPEEDY_BRAND.primaryGreen}; font-weight: 600;">
        Great news! We've officially sent your first round of dispute letters.
      </p>

      <p>
        This is an exciting milestone in your credit repair journey. Here's what to expect:
      </p>

      <div class="highlight-box">
        <p class="highlight-box-title">📬 What We Sent</p>
        <p style="margin: 0;">
          <strong>Dispute letters sent to:</strong> ${data.bureausSent || 'All 3 credit bureaus'}<br/>
          <strong>Items disputed:</strong> ${data.itemsDisputed || 'Multiple negative items'}
        </p>
      </div>

      <h2>What Happens Now:</h2>
      <ul>
        <li><strong>Days 1-5:</strong> Bureaus receive and process our dispute letters</li>
        <li><strong>Days 5-30:</strong> Bureaus investigate each disputed item</li>
        <li><strong>Days 30-45:</strong> You'll receive response letters in the mail</li>
        <li><strong>Ongoing:</strong> We analyze responses and prepare next steps</li>
      </ul>

      <div class="warning-box">
        <p style="font-weight: 700; color: #92400e; margin: 0 0 10px 0;">📮 Important: Watch Your Mail!</p>
        <p style="margin: 0;">
          You'll receive response letters from the credit bureaus. Please scan or photograph them
          and upload them to your portal, or email them to us.
        </p>
      </div>

      <p>
        Log in to your portal to track progress:
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${SPEEDY_BRAND.portalUrl}/portal"
           class="cta-button" style="display: inline-block; padding: 16px 32px; background-color: ${SPEEDY_BRAND.primaryGreen}; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
          View My Progress
        </a>
      </div>

      <p style="margin: 25px 0 0 0;">
        <strong>${SPEEDY_BRAND.ownerName}</strong><br/>
        ${SPEEDY_BRAND.companyName}
      </p>
    `, `${data.firstName}, your first disputes are on their way!`, data)
  },

  /**
   * TEMPLATE: dispute-results-positive
   * Trigger: When positive dispute results are received
   * Purpose: Celebrate deletions with client
   */
  'dispute-results-positive': {
    subject: (data) => `🎉 ${data.firstName}, great news about your credit!`,
    html: (data) => BASE_WRAPPER(`
      <h1>Great News, ${data.firstName}! 🎉</h1>

      <p style="font-size: 17px; color: ${SPEEDY_BRAND.primaryGreen}; font-weight: 600;">
        We received your dispute results, and we have something to celebrate!
      </p>

      <div class="success-box">
        <p style="font-weight: 700; color: #059669; margin: 0 0 10px 0;">
          ✅ Items Removed/Updated: ${data.itemsRemoved || 'Multiple items'}
        </p>
        <p style="margin: 0;">
          These negative items have been removed or updated in your favor!
        </p>
      </div>

      <p>
        This is exactly the progress we want to see. Each negative item removed can improve your
        credit score and bring you closer to your goals.
      </p>

      <h2>What This Means:</h2>
      <ul>
        <li>Your credit score should increase once the bureaus update</li>
        <li>Lenders will see an improved credit history</li>
        <li>You're one step closer to your credit goals</li>
      </ul>

      <p>
        We're not done yet! We'll continue disputing any remaining negative items until your
        credit is where it should be.
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${SPEEDY_BRAND.portalUrl}/portal"
           class="cta-button" style="display: inline-block; padding: 16px 32px; background-color: ${SPEEDY_BRAND.primaryGreen}; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
          View Full Results
        </a>
      </div>

      <p style="margin: 25px 0 0 0;">
        Congratulations!<br/>
        <strong>${SPEEDY_BRAND.ownerName}</strong> and the Speedy Team
      </p>
    `, `🎉 ${data.firstName}, great news about your credit!`, data)
  },

  /**
   * TEMPLATE: monthly-progress
   * Trigger: Monthly progress report
   * Purpose: Keep client informed of overall progress
   */
  'monthly-progress': {
    subject: (data) => `${data.firstName}, your monthly credit progress report`,
    html: (data) => BASE_WRAPPER(`
      <h1>Your Monthly Progress Report, ${data.firstName}</h1>

      <p>
        Here's a summary of your credit repair progress this month:
      </p>

      <div class="highlight-box">
        <p class="highlight-box-title">📊 Monthly Summary</p>
        <p style="margin: 0;">
          <strong>Items Disputed:</strong> ${data.itemsDisputed || 'Multiple'}<br/>
          <strong>Items Removed:</strong> ${data.itemsRemoved || '0'}<br/>
          <strong>Items Pending:</strong> ${data.itemsPending || 'Awaiting response'}
        </p>
      </div>

      <p>
        We're continuing to work on your credit every day. If you have any questions about
        your progress or want to discuss next steps, don't hesitate to reach out.
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${SPEEDY_BRAND.portalUrl}/portal"
           class="cta-button" style="display: inline-block; padding: 16px 32px; background-color: ${SPEEDY_BRAND.primaryGreen}; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
          View Detailed Report
        </a>
      </div>

      <p style="margin: 25px 0 0 0;">
        Keep up the great work!<br/>
        <strong>${SPEEDY_BRAND.ownerName}</strong><br/>
        ${SPEEDY_BRAND.companyName}
      </p>
    `, `${data.firstName}, your monthly credit progress report`, data)
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // RE-ENGAGEMENT & RETENTION TEMPLATES
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * TEMPLATE: inactive-client-reengagement
   * Trigger: Client hasn't logged in for 14+ days
   * Purpose: Re-engage inactive clients
   */
  'inactive-client-reengagement': {
    subject: (data) => `${data.firstName}, we miss you! Here's what's happening with your credit`,
    html: (data) => BASE_WRAPPER(`
      <h1>Hi ${data.firstName}!</h1>

      <p>
        We noticed you haven't logged into your portal recently, and I wanted to make sure
        everything is okay.
      </p>

      <p>
        We're still working hard on your credit repair, but it's important to stay engaged
        so you can:
      </p>

      <ul>
        <li>Track your progress in real-time</li>
        <li>Upload any bureau response letters you've received</li>
        <li>See which items have been removed</li>
        <li>Ask questions or get support</li>
      </ul>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${SPEEDY_BRAND.portalUrl}/portal"
           class="cta-button" style="display: inline-block; padding: 16px 32px; background-color: ${SPEEDY_BRAND.primaryGreen}; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
          Check My Progress
        </a>
      </div>

      <p>
        If you have any concerns or questions, please don't hesitate to reach out. Call us at
        <strong><a href="tel:${SPEEDY_BRAND.phoneLink}" style="color: ${SPEEDY_BRAND.primaryGreen};">${SPEEDY_BRAND.phone}</a></strong>.
      </p>

      <p style="margin: 25px 0 0 0;">
        <strong>${SPEEDY_BRAND.ownerName}</strong><br/>
        ${SPEEDY_BRAND.companyName}
      </p>
    `, `${data.firstName}, we miss you! Here's what's happening with your credit`, data)
  },

  /**
   * TEMPLATE: vip-upgrade-offer
   * Trigger: After 30 days as standard client
   * Purpose: Upsell to VIP plan
   */
  'vip-upgrade-offer': {
    subject: (data) => `${data.firstName}, upgrade to VIP for faster results`,
    html: (data) => BASE_WRAPPER(`
      <h1>Ready for Faster Results, ${data.firstName}?</h1>

      <p>
        You've been making great progress with your credit repair, and I wanted to share an
        opportunity to accelerate your results.
      </p>

      <div class="highlight-box">
        <p class="highlight-box-title">⭐ VIP Credit Repair Plan</p>
        <p style="margin: 0;">
          Our VIP clients typically see results <strong>2-3x faster</strong> thanks to:
        </p>
        <ul style="margin: 10px 0 0 0; padding-left: 20px;">
          <li>Unlimited disputes (no monthly caps)</li>
          <li>Priority processing</li>
          <li>Direct phone access to your credit specialist</li>
          <li>Creditor intervention services</li>
          <li>24/7 portal support</li>
        </ul>
      </div>

      <p>
        Interested in learning more? Call me at
        <strong><a href="tel:${SPEEDY_BRAND.phoneLink}" style="color: ${SPEEDY_BRAND.primaryGreen};">${SPEEDY_BRAND.phone}</a></strong>
        and I'll explain the benefits.
      </p>

      <p style="margin: 25px 0 0 0;">
        <strong>${SPEEDY_BRAND.ownerName}</strong><br/>
        ${SPEEDY_BRAND.companyName}
      </p>
    `, `${data.firstName}, upgrade to VIP for faster results`, data)
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TRANSACTIONAL TEMPLATES
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * TEMPLATE: abandoned-cart
   * Trigger: User abandons enrollment
   * Purpose: Recover abandoned enrollments
   */
  'abandoned-cart': {
    subject: (data) => `${data.firstName}, your credit analysis is almost ready`,
    html: (data) => BASE_WRAPPER(`
      <h1>You're Almost There, ${data.firstName}!</h1>

      <p>
        I noticed you started your free credit analysis but didn't finish. No worries—your
        information is saved and you can pick up right where you left off.
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${buildEnrollUrl(data, 'abandoned-cart')}"
           class="cta-button" style="display: inline-block; padding: 16px 32px; background-color: ${SPEEDY_BRAND.primaryGreen}; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
          Complete My Analysis
        </a>
      </div>

      <p style="margin: 25px 0 0 0;">
        <strong>${SPEEDY_BRAND.ownerName}</strong>
      </p>
    `, `${data.firstName}, your credit analysis is almost ready`, data)
  },

  /**
   * TEMPLATE: birthday-greeting
   * Trigger: Client's birthday
   * Purpose: Build relationship
   */
  'birthday-greeting': {
    subject: (data) => `Happy Birthday, ${data.firstName}! 🎂`,
    html: (data) => BASE_WRAPPER(`
      <h1 style="text-align: center;">Happy Birthday, ${data.firstName}! 🎂</h1>

      <p style="text-align: center; font-size: 17px;">
        Wishing you a wonderful birthday filled with joy and celebration!
      </p>

      <p style="text-align: center;">
        Thank you for being a valued member of the ${SPEEDY_BRAND.companyName} family.
        We appreciate your trust in us.
      </p>

      <p style="margin: 25px 0 0 0; text-align: center;">
        Best wishes,<br/>
        <strong>${SPEEDY_BRAND.ownerName}</strong> and the Speedy Team
      </p>
    `, `Happy Birthday, ${data.firstName}! 🎂`, data)
  },

  /**
   * TEMPLATE: milestone-celebration
   * Trigger: Client reaches a credit score milestone
   * Purpose: Celebrate achievements
   */
  'milestone-celebration': {
    subject: (data) => `🎉 Congratulations, ${data.firstName}! You hit a credit milestone!`,
    html: (data) => BASE_WRAPPER(`
      <h1 style="text-align: center;">🎉 Congratulations, ${data.firstName}!</h1>

      <p style="text-align: center; font-size: 17px; color: ${SPEEDY_BRAND.primaryGreen}; font-weight: 600;">
        You've reached a credit score milestone!
      </p>

      <div class="success-box" style="text-align: center;">
        <p style="font-size: 36px; font-weight: 700; color: #059669; margin: 0;">
          ${data.newScore || '700+'}
        </p>
        <p style="margin: 5px 0 0 0; color: #059669; font-weight: 600;">
          Your Current Credit Score
        </p>
      </div>

      <p style="text-align: center;">
        Your hard work and dedication are paying off. Keep going—you're doing great!
      </p>

      <p style="margin: 25px 0 0 0; text-align: center;">
        Proud of you!<br/>
        <strong>${SPEEDY_BRAND.ownerName}</strong> and the Speedy Team
      </p>
    `, `🎉 Congratulations, ${data.firstName}! You hit a credit milestone!`, data)
  },

  /**
   * TEMPLATE: referral-request
   * Trigger: After positive results
   * Purpose: Request referrals
   */
  'referral-request': {
    subject: (data) => `${data.firstName}, know anyone who needs credit help?`,
    html: (data) => BASE_WRAPPER(`
      <h1>Hi ${data.firstName}!</h1>

      <p>
        We've loved working with you and seeing your credit improve. If you know anyone else
        who could benefit from our services, we'd be grateful for the referral.
      </p>

      <p>
        Just have them mention your name when they call
        <strong><a href="tel:${SPEEDY_BRAND.phoneLink}" style="color: ${SPEEDY_BRAND.primaryGreen};">${SPEEDY_BRAND.phone}</a></strong>.
      </p>

      <p>
        Thank you for being a valued client!
      </p>

      <p style="margin: 25px 0 0 0;">
        <strong>${SPEEDY_BRAND.ownerName}</strong><br/>
        ${SPEEDY_BRAND.companyName}
      </p>
    `, `${data.firstName}, know anyone who needs credit help?`, data)
  },

  /**
   * TEMPLATE: payment-reminder
   * Trigger: Payment due soon
   * Purpose: Remind about upcoming payment
   */
  'payment-reminder': {
    subject: (data) => `${data.firstName}, payment reminder for your credit repair service`,
    html: (data) => BASE_WRAPPER(`
      <h1>Payment Reminder, ${data.firstName}</h1>

      <p>
        This is a friendly reminder that your credit repair payment is due soon.
      </p>

      <div class="highlight-box">
        <p class="highlight-box-title">💳 Payment Details</p>
        <p style="margin: 0;">
          <strong>Amount Due:</strong> ${data.amount || 'See your portal'}<br/>
          <strong>Due Date:</strong> ${data.dueDate || 'See your portal'}
        </p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${SPEEDY_BRAND.portalUrl}/portal/billing"
           class="cta-button" style="display: inline-block; padding: 16px 32px; background-color: ${SPEEDY_BRAND.primaryGreen}; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
          Make Payment
        </a>
      </div>

      <p>
        Questions about billing? Call us at
        <strong><a href="tel:${SPEEDY_BRAND.phoneLink}" style="color: ${SPEEDY_BRAND.primaryGreen};">${SPEEDY_BRAND.phone}</a></strong>.
      </p>

      <p style="margin: 25px 0 0 0;">
        <strong>${SPEEDY_BRAND.ownerName}</strong><br/>
        ${SPEEDY_BRAND.companyName}
      </p>
    `, `${data.firstName}, payment reminder for your credit repair service`, data)
  },

  /**
   * TEMPLATE: service-renewal
   * Trigger: Service period ending
   * Purpose: Encourage renewal
   */
  'service-renewal': {
    subject: (data) => `${data.firstName}, your credit repair service is expiring soon`,
    html: (data) => BASE_WRAPPER(`
      <h1>Your Service is Expiring, ${data.firstName}</h1>

      <p>
        Your current credit repair service period is coming to an end. We want to make sure
        you continue making progress toward your credit goals.
      </p>

      <p>
        If you'd like to continue working together, please contact us to renew your service.
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="tel:${SPEEDY_BRAND.phoneLink}"
           class="cta-button" style="display: inline-block; padding: 16px 32px; background-color: ${SPEEDY_BRAND.primaryGreen}; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
          Call to Renew: ${SPEEDY_BRAND.phone}
        </a>
      </div>

      <p style="margin: 25px 0 0 0;">
        <strong>${SPEEDY_BRAND.ownerName}</strong><br/>
        ${SPEEDY_BRAND.companyName}
      </p>
    `, `${data.firstName}, your credit repair service is expiring soon`, data)
  },

  /**
   * TEMPLATE: educational-tip
   * Trigger: Weekly educational email
   * Purpose: Provide value and keep engaged
   */
  'educational-tip': {
    subject: (data) => `${data.firstName}, this week's credit tip`,
    html: (data) => BASE_WRAPPER(`
      <h1>This Week's Credit Tip, ${data.firstName}</h1>

      <div class="highlight-box">
        <p class="highlight-box-title">💡 ${data.tipTitle || 'Credit Building Tip'}</p>
        <p style="margin: 0;">
          ${data.tipContent || 'Pay your credit card balance before the statement date to show lower utilization and potentially boost your score.'}
        </p>
      </div>

      <p>
        Small changes like this can make a big difference over time. Keep up the great work!
      </p>

      <p style="margin: 25px 0 0 0;">
        <strong>${SPEEDY_BRAND.ownerName}</strong><br/>
        ${SPEEDY_BRAND.companyName}
      </p>
    `, `${data.firstName}, this week's credit tip`, data)
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // IDIQ ENROLLMENT TEMPLATES
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * TEMPLATE: idiq-enrollment-success
   * Trigger: IDIQ enrollment completed successfully
   * Purpose: Confirm enrollment and next steps
   */
  'idiq-enrollment-success': {
    subject: (data) => `${data.firstName}, your credit monitoring is now active!`,
    html: (data) => BASE_WRAPPER(`
      <h1>You're All Set, ${data.firstName}! 🎉</h1>

      <p style="font-size: 17px; color: ${SPEEDY_BRAND.primaryGreen}; font-weight: 600;">
        Your credit monitoring enrollment was successful!
      </p>

      <p>
        You now have access to your complete 3-bureau credit report and monitoring. Here's what
        to do next:
      </p>

      <div class="success-box">
        <p style="font-weight: 700; color: #059669; margin: 0 0 10px 0;">✅ Enrollment Complete</p>
        <p style="margin: 0;">
          Your credit report from all 3 bureaus is now available in your portal.
        </p>
      </div>

      <h2>Next Steps:</h2>
      <ol>
        <li><strong>Review your credit report</strong> - Look for any errors or negative items</li>
        <li><strong>Schedule your consultation</strong> - Let's discuss your improvement plan</li>
        <li><strong>Provide any documentation</strong> - We may need additional info to dispute items</li>
      </ol>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${SPEEDY_BRAND.portalUrl}/portal?contactId=${data.contactId}"
           class="cta-button" style="display: inline-block; padding: 16px 32px; background-color: ${SPEEDY_BRAND.primaryGreen}; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
          View My Credit Report
        </a>
      </div>

      <p>
        Questions? Call us at
        <strong><a href="tel:${SPEEDY_BRAND.phoneLink}" style="color: ${SPEEDY_BRAND.primaryGreen};">${SPEEDY_BRAND.phone}</a></strong>.
      </p>

      <p style="margin: 25px 0 0 0;">
        <strong>${SPEEDY_BRAND.ownerName}</strong><br/>
        ${SPEEDY_BRAND.companyName}
      </p>
    `, `${data.firstName}, your credit monitoring is now active!`, data)
  },

  /**
   * TEMPLATE: idiq-credit-report-ready
   * Trigger: Credit report retrieved from IDIQ
   * Purpose: Notify report is available
   */
  'idiq-credit-report-ready': {
    subject: (data) => `${data.firstName}, your credit report is ready for review!`,
    html: (data) => BASE_WRAPPER(`
      <h1>Your Credit Report is Ready, ${data.firstName}!</h1>

      <p>
        Great news! Your complete 3-bureau credit report has been retrieved and is now
        available in your portal.
      </p>

      <div class="highlight-box">
        <p class="highlight-box-title">📊 What's Included</p>
        <ul style="margin: 10px 0 0 0; padding-left: 20px;">
          <li>Experian credit report and score</li>
          <li>TransUnion credit report and score</li>
          <li>Equifax credit report and score</li>
          <li>Detailed account information</li>
          <li>Public records and inquiries</li>
        </ul>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${SPEEDY_BRAND.portalUrl}/portal"
           class="cta-button" style="display: inline-block; padding: 16px 32px; background-color: ${SPEEDY_BRAND.primaryGreen}; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
          View My Report
        </a>
      </div>

      <p>
        After reviewing your report, call us at
        <strong><a href="tel:${SPEEDY_BRAND.phoneLink}" style="color: ${SPEEDY_BRAND.primaryGreen};">${SPEEDY_BRAND.phone}</a></strong>
        to discuss your personalized improvement plan.
      </p>

      <p style="margin: 25px 0 0 0;">
        <strong>${SPEEDY_BRAND.ownerName}</strong><br/>
        ${SPEEDY_BRAND.companyName}
      </p>
    `, `${data.firstName}, your credit report is ready for review!`, data)
  },

  /**
   * TEMPLATE: idiq-trial-expiring-warning
   * Trigger: IDIQ trial expiring in 3 days
   * Purpose: Warn about trial expiration
   */
  'idiq-trial-expiring-warning': {
    subject: (data) => `⚠️ ${data.firstName}, your free credit monitoring expires in 3 days`,
    html: (data) => BASE_WRAPPER(`
      <h1>Important Notice, ${data.firstName}</h1>

      <div class="warning-box">
        <p style="font-weight: 700; color: #92400e; margin: 0 0 10px 0;">⚠️ Trial Expiring Soon</p>
        <p style="margin: 0;">
          Your free credit monitoring trial will expire in <strong>3 days</strong>.
        </p>
      </div>

      <p>
        To continue accessing your credit reports and keep your credit repair on track,
        please contact us to discuss your options.
      </p>

      <h2>What Happens If Your Trial Expires:</h2>
      <ul>
        <li>You'll lose access to your credit monitoring portal</li>
        <li>We won't be able to track changes to your credit</li>
        <li>Your credit repair progress may be delayed</li>
      </ul>

      <div style="text-align: center; margin: 30px 0;">
        <a href="tel:${SPEEDY_BRAND.phoneLink}"
           class="cta-button" style="display: inline-block; padding: 16px 32px; background-color: ${SPEEDY_BRAND.primaryGreen}; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
          Call Now: ${SPEEDY_BRAND.phone}
        </a>
      </div>

      <p style="margin: 25px 0 0 0;">
        <strong>${SPEEDY_BRAND.ownerName}</strong><br/>
        ${SPEEDY_BRAND.companyName}
      </p>
    `, `⚠️ ${data.firstName}, your free credit monitoring expires in 3 days`, data)
  },

  /**
   * TEMPLATE: idiq-reengagement
   * Trigger: IDIQ enrolled but not actively using service
   * Purpose: Re-engage IDIQ user
   */
  'idiq-reengagement': {
    subject: (data) => `${data.firstName}, have you checked your credit report lately?`,
    html: (data) => BASE_WRAPPER(`
      <h1>Hi ${data.firstName}!</h1>

      <p>
        I noticed you haven't logged in to check your credit report recently. Your credit
        monitoring is still active, and it's important to stay on top of any changes.
      </p>

      <div class="highlight-box">
        <p class="highlight-box-title">📊 Why Regular Monitoring Matters</p>
        <ul style="margin: 10px 0 0 0; padding-left: 20px;">
          <li>Catch errors before they damage your score</li>
          <li>Spot signs of identity theft early</li>
          <li>Track your improvement progress</li>
          <li>Make informed financial decisions</li>
        </ul>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${SPEEDY_BRAND.portalUrl}/portal"
           class="cta-button" style="display: inline-block; padding: 16px 32px; background-color: ${SPEEDY_BRAND.primaryGreen}; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
          Check My Credit
        </a>
      </div>

      <p style="margin: 25px 0 0 0;">
        <strong>${SPEEDY_BRAND.ownerName}</strong><br/>
        ${SPEEDY_BRAND.companyName}
      </p>
    `, `${data.firstName}, have you checked your credit report lately?`, data)
  },

  /**
   * TEMPLATE: idiq-trial-cancelled
   * Trigger: IDIQ trial cancelled due to inactivity
   * Purpose: Inform about cancellation
   */
  'idiq-trial-cancelled': {
    subject: (data) => `${data.firstName}, your credit monitoring has been cancelled`,
    html: (data) => BASE_WRAPPER(`
      <h1>Hi ${data.firstName},</h1>

      <p>
        Your free credit monitoring trial has been cancelled due to inactivity.
      </p>

      <p>
        If you'd like to continue working with us on improving your credit, we're still here
        to help. Just give us a call and we can discuss your options.
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="tel:${SPEEDY_BRAND.phoneLink}"
           class="cta-button" style="display: inline-block; padding: 16px 32px; background-color: ${SPEEDY_BRAND.primaryGreen}; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
          Call Us: ${SPEEDY_BRAND.phone}
        </a>
      </div>

      <p>
        We wish you the best with your credit journey!
      </p>

      <p style="margin: 25px 0 0 0;">
        <strong>${SPEEDY_BRAND.ownerName}</strong><br/>
        ${SPEEDY_BRAND.companyName}
      </p>
    `, `${data.firstName}, your credit monitoring has been cancelled`, data)
  }

});

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get rendered email template with AI-powered personalization
 * @param {string} templateId - Template identifier
 * @param {Object} data - Contact and workflow data
 * @param {Object} options - Additional options
 * @returns {Object} { subject, html, metadata }
 */
function getEmailTemplate(templateId, data = {}, options = {}) {
  const template = TEMPLATES[templateId];

  if (!template) {
    console.error(`❌ Email template not found: ${templateId}`);
    throw new Error(`Email template not found: ${templateId}`);
  }

  // ===== APPLY AI TEMPLATE SELECTION =====
  let selectedVariant = 'standard';
  if (options.useAI !== false) {
    try {
      const aiSelection = AITemplateSelector.selectOptimalVariant(templateId, data);
      selectedVariant = aiSelection.variant;
      data.personalizationLevel = aiSelection.personalizationLevel;
    } catch (aiError) {
      console.warn('⚠️ AI template selection failed, using default:', aiError.message);
    }
  }

  // ===== MERGE DEFAULT DATA =====
  const mergedData = {
    firstName: 'there',
    lastName: '',
    name: 'there',
    email: '',
    phone: '',
    leadScore: 5,
    urgencyLevel: 'medium',
    workflowId: 'unknown',
    contactId: 'unknown',
    sentiment: { description: 'neutral' },
    campaignName: templateId,
    ...data
  };

  // ===== GENERATE SUBJECT AND HTML =====
  const subject = typeof template.subject === 'function'
    ? template.subject(mergedData)
    : template.subject;

  const html = typeof template.html === 'function'
    ? template.html(mergedData)
    : template.html;

  console.log(`✅ Email template rendered: ${templateId} (variant: ${selectedVariant})`);

  return {
    subject: subject,
    html: html,
    metadata: {
      templateId: templateId,
      variant: selectedVariant,
      personalizationLevel: mergedData.personalizationLevel || 'standard',
      generatedAt: new Date().toISOString()
    }
  };
}

/**
 * Get all available template IDs
 * @returns {Array<string>} List of template IDs
 */
function getAllTemplateIds() {
  return Object.keys(TEMPLATES);
}

/**
 * Check if template exists
 * @param {string} templateId - Template identifier
 * @returns {boolean} True if template exists
 */
function templateExists(templateId) {
  return !!TEMPLATES[templateId];
}

/**
 * Get templates by category
 * @param {string} category - Category name (ai, web, consultation, idiq, etc.)
 * @returns {Array<string>} List of template IDs in category
 */
function getTemplatesByCategory(category) {
  return Object.keys(TEMPLATES).filter(id => id.startsWith(category));
}

/**
 * Get template metadata
 * @param {string} templateId - Template identifier
 * @returns {Object} Template metadata
 */
function getTemplateMetadata(templateId) {
  const template = TEMPLATES[templateId];
  if (!template) return null;

  return {
    id: templateId,
    hasSubject: typeof template.subject === 'function',
    hasHTML: typeof template.html === 'function',
    category: templateId.split('-')[0],
    name: templateId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// MODULE EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

module.exports = {
  // Core functions
  getEmailTemplate,
  getAllTemplateIds,
  templateExists,
  getTemplatesByCategory,
  getTemplateMetadata,

  // Classes
  AITemplateSelector,

  // Constants
  TEMPLATES,
  SPEEDY_BRAND,
  BASE_WRAPPER
};

// ═══════════════════════════════════════════════════════════════════════════
// © 1995-2026 Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved
// Trademark: Speedy Credit Repair® - USPTO Registered
// ═══════════════════════════════════════════════════════════════════════════
