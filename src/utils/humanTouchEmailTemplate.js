// Path: src/utils/humanTouchEmailTemplate.js
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * HUMAN TOUCH EMAIL TEMPLATE - AI CREDIT REVIEW
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Email template that emphasizes personal expert involvement rather than
 * automated AI processing. Makes prospects feel they're getting personal
 * attention from a real credit expert.
 * 
 * KEY MESSAGING:
 * - "I personally reviewed your report" (not "AI analyzed")
 * - Current Finance Director credentials
 * - "Call and ask for me directly"
 * - Personal touch throughout
 * 
 * @version 1.0.0
 * @date February 2026
 * 
 * © 1995-2026 Speedy Credit Repair Inc. | All Rights Reserved
 */

// ═══════════════════════════════════════════════════════════════════════════
// CHRIS LAHAGE CREDENTIALS (for email signatures)
// ═══════════════════════════════════════════════════════════════════════════

export const CHRIS_CREDENTIALS = {
  name: 'Chris Lahage',
  title: 'Credit Expert & Owner',
  company: 'Speedy Credit Repair Inc.',
  experience: '30 Years Credit Repair Experience',
  currentPosition: 'Current Finance Director at one of Toyota\'s top franchises',
  phone: '(888) 724-7344',
  phoneNote: 'Call and ask for me directly',
  email: 'chris@speedycreditrepair.com',
  website: 'https://speedycreditrepair.com',
  bbbRating: 'A+ BBB Rating',
  googleRating: '4.9★ Google (580+ Reviews)',
  established: '1995'
};

// ═══════════════════════════════════════════════════════════════════════════
// HUMAN TOUCH EMAIL GENERATOR
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate a personalized credit review email with human touch
 * @param {Object} params - Email parameters
 * @param {string} params.firstName - Prospect's first name
 * @param {number} params.creditScore - Current credit score
 * @param {number} params.negativeItems - Number of negative items
 * @param {number} params.inquiries - Number of hard inquiries
 * @param {string} params.scoreCategory - Score category (Very Poor, Fair, Good, etc.)
 * @param {Array} params.topIssues - Top issues found in credit report
 * @param {string} params.recommendedPlan - Recommended service plan
 * @param {string} params.contactId - Contact ID for tracking links
 * @returns {Object} - { subject, body, html }
 */
export const generateHumanTouchEmail = ({
  firstName,
  creditScore,
  negativeItems,
  inquiries,
  scoreCategory,
  topIssues = [],
  recommendedPlan,
  contactId
}) => {
  const planRecommenderLink = `https://myclevercrm.com/service-plan-recommender?contactId=${contactId}`;
  const portalPreviewLink = `https://myclevercrm.com/portal-preview?contactId=${contactId}`;
  
  // Determine urgency based on score
  let urgencyMessage = '';
  if (creditScore < 580) {
    urgencyMessage = 'I want you to know - your score can absolutely be improved. I\'ve helped thousands of people in similar situations.';
  } else if (creditScore < 670) {
    urgencyMessage = 'You\'re closer than you might think to a score that opens real doors.';
  } else {
    urgencyMessage = 'With some targeted work, we can push your score into excellent territory.';
  }
  
  // Generate issue summary
  const issuesSummary = topIssues.length > 0 
    ? topIssues.map(issue => `• ${issue}`).join('\n')
    : `• ${negativeItems} negative items affecting your score\n• ${inquiries} hard inquiries on your report`;
  
  // Plain text version
  const body = `Dear ${firstName},

I hope this finds you well. This is Chris Lahage from Speedy Credit Repair - I wanted to reach out personally because I just finished reviewing your credit report this morning.

First, let me be direct with you: your current VantageScore 3.0 is ${creditScore}, which puts you in the "${scoreCategory}" range. ${urgencyMessage}

WHAT I FOUND IN YOUR REPORT:
${issuesSummary}

After 30 years in credit repair and currently serving as Finance Director at one of Toyota's top franchises, I can tell you exactly what these items mean for your financial future:

• Getting approved for mortgages, car loans, and credit cards becomes harder
• When you ARE approved, you pay significantly higher interest rates
• Landlords may deny rental applications
• Some employers check credit for hiring decisions

THE GOOD NEWS:
Many of these items may be disputable. In my experience, we typically see 70% or more of negative items successfully removed or corrected through proper dispute processes.

I've put together a personalized recommendation for your situation. You can see exactly which service plan I recommend and why here:
${planRecommenderLink}

You can also preview what your personal Client Progress Portal will look like - using your actual credit data - so you can see exactly how we'll track your improvement:
${portalPreviewLink}

I'd genuinely love to help you turn this around, ${firstName}. This is what my family has dedicated our business to since 1995.

Have questions? Call and ask for me directly: ${CHRIS_CREDENTIALS.phone}
Or reply to this email - I read them all personally.

Looking forward to helping you,

Chris Lahage
Credit Expert & Owner
Speedy Credit Repair Inc.

📞 ${CHRIS_CREDENTIALS.phone} (Call and ask for me directly)
📧 ${CHRIS_CREDENTIALS.email}
🌐 ${CHRIS_CREDENTIALS.website}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${CHRIS_CREDENTIALS.experience}
${CHRIS_CREDENTIALS.currentPosition}
${CHRIS_CREDENTIALS.bbbRating} | ${CHRIS_CREDENTIALS.googleRating}
Family-owned since ${CHRIS_CREDENTIALS.established} | Serving all 50 States
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

  // HTML version
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Personal Credit Review</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <!-- Header -->
  <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%); border-radius: 12px;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Your Personal Credit Review</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0;">From Chris Lahage, Speedy Credit Repair</p>
  </div>
  
  <!-- Personal Greeting -->
  <p>Dear ${firstName},</p>
  
  <p>I hope this finds you well. This is Chris Lahage from Speedy Credit Repair - I wanted to reach out <strong>personally</strong> because I just finished reviewing your credit report this morning.</p>
  
  <!-- Score Card -->
  <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 8px;">
    <p style="margin: 0 0 10px 0;"><strong>Your Current Score:</strong></p>
    <p style="font-size: 36px; font-weight: bold; color: ${creditScore < 580 ? '#ef4444' : creditScore < 670 ? '#f59e0b' : '#22c55e'}; margin: 0;">
      ${creditScore}
    </p>
    <p style="margin: 5px 0 0 0; color: #666;">VantageScore 3.0 - "${scoreCategory}"</p>
  </div>
  
  <p>${urgencyMessage}</p>
  
  <!-- What I Found -->
  <div style="background: #fee2e2; border-radius: 8px; padding: 20px; margin: 20px 0;">
    <h3 style="color: #991b1b; margin: 0 0 10px 0;">📋 What I Found in Your Report:</h3>
    <ul style="margin: 0; padding-left: 20px; color: #991b1b;">
      <li><strong>${negativeItems}</strong> negative items affecting your score</li>
      <li><strong>${inquiries}</strong> hard inquiries on your report</li>
      ${topIssues.map(issue => `<li>${issue}</li>`).join('')}
    </ul>
  </div>
  
  <!-- Experience Note -->
  <p>After <strong>30 years in credit repair</strong> and currently serving as Finance Director at one of Toyota's top franchises, I can tell you exactly what these items mean for your financial future:</p>
  
  <ul style="color: #666;">
    <li>Getting approved for mortgages, car loans, and credit cards becomes harder</li>
    <li>When you ARE approved, you pay significantly higher interest rates</li>
    <li>Landlords may deny rental applications</li>
    <li>Some employers check credit for hiring decisions</li>
  </ul>
  
  <!-- Good News -->
  <div style="background: #dcfce7; border-radius: 8px; padding: 20px; margin: 20px 0;">
    <h3 style="color: #166534; margin: 0 0 10px 0;">✅ The Good News:</h3>
    <p style="color: #166534; margin: 0;">
      Many of these items may be disputable. In my experience, we typically see <strong>70% or more</strong> of negative items successfully removed or corrected through proper dispute processes.
    </p>
  </div>
  
  <!-- CTA Buttons -->
  <div style="text-align: center; margin: 30px 0;">
    <a href="${planRecommenderLink}" style="display: inline-block; background: #22c55e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 5px;">
      See My Recommended Plan →
    </a>
    <br><br>
    <a href="${portalPreviewLink}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-size: 14px;">
      Preview Your Progress Dashboard
    </a>
  </div>
  
  <p>I'd genuinely love to help you turn this around, ${firstName}. This is what my family has dedicated our business to since 1995.</p>
  
  <!-- Contact Card -->
  <div style="background: #f3f4f6; border-radius: 12px; padding: 20px; margin: 30px 0;">
    <table style="width: 100%;">
      <tr>
        <td style="width: 80px; vertical-align: top;">
          <div style="width: 70px; height: 70px; background: #1e40af; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; font-weight: bold; text-align: center; line-height: 70px;">
            CL
          </div>
        </td>
        <td style="vertical-align: top; padding-left: 15px;">
          <p style="margin: 0; font-weight: bold; font-size: 18px;">Chris Lahage</p>
          <p style="margin: 3px 0; color: #666; font-size: 14px;">Credit Expert & Owner, Speedy Credit Repair Inc.</p>
          <p style="margin: 3px 0; color: #666; font-size: 12px;">
            📞 <a href="tel:8887247344" style="color: #1e40af;">(888) 724-7344</a> 
            <em style="color: #22c55e;">(Call and ask for me directly)</em>
          </p>
          <p style="margin: 3px 0; color: #666; font-size: 12px;">
            📧 <a href="mailto:chris@speedycreditrepair.com" style="color: #1e40af;">chris@speedycreditrepair.com</a>
          </p>
        </td>
      </tr>
    </table>
  </div>
  
  <p>Looking forward to helping you,<br><strong>Chris Lahage</strong></p>
  
  <!-- Footer -->
  <div style="border-top: 1px solid #e5e7eb; margin-top: 30px; padding-top: 20px; text-align: center; color: #666; font-size: 12px;">
    <p style="margin: 5px 0;"><strong>Speedy Credit Repair Inc.</strong></p>
    <p style="margin: 5px 0;">${CHRIS_CREDENTIALS.experience} | ${CHRIS_CREDENTIALS.currentPosition}</p>
    <p style="margin: 5px 0;">${CHRIS_CREDENTIALS.bbbRating} | ${CHRIS_CREDENTIALS.googleRating}</p>
    <p style="margin: 5px 0;">Family-owned since 1995 | Serving all 50 States</p>
    <p style="margin: 15px 0 0 0; color: #999;">
      © 1995-${new Date().getFullYear()} Speedy Credit Repair Inc. All Rights Reserved.
    </p>
  </div>
  
</body>
</html>
`;

  return {
    subject: `${firstName}, I've Personally Reviewed Your Credit Report`,
    body,
    html
  };
};

// ═══════════════════════════════════════════════════════════════════════════
// FOLLOW-UP EMAIL TEMPLATES
// ═══════════════════════════════════════════════════════════════════════════

export const FOLLOW_UP_TEMPLATES = {
  // Day 2 follow-up if no response
  day2: (firstName, creditScore, contactId) => ({
    subject: `${firstName}, quick follow-up on your credit review`,
    body: `Hi ${firstName},

I wanted to follow up on the credit review I sent you yesterday. I know life gets busy, but I didn't want you to miss the insights I found in your report.

Your score of ${creditScore} has real room for improvement, and I'd hate to see you continue paying higher interest rates or getting denied for credit when we could likely help.

Have 5 minutes? Here's the personalized plan I put together:
https://myclevercrm.com/service-plan-recommender?contactId=${contactId}

Or just call me directly: (888) 724-7344 - ask for Chris.

Here to help,
Chris Lahage
Speedy Credit Repair`
  }),

  // Day 5 follow-up
  day5: (firstName, contactId) => ({
    subject: `${firstName}, one more thought about your credit`,
    body: `Hi ${firstName},

I'll keep this short - I've been thinking about your credit situation and wanted to share one thing:

Every month that passes with negative items on your report is another month of:
• Higher interest rates on any new credit
• Potential denials for apartments, loans, or even jobs
• Missed opportunities

The disputes we file typically show results in 30-45 days. That means if you start today, you could see improvement within a month or two.

No pressure at all - just wanted you to have that perspective. When you're ready:
https://myclevercrm.com/service-plan-recommender?contactId=${contactId}

Wishing you the best,
Chris Lahage
(888) 724-7344`
  })
};

// ═══════════════════════════════════════════════════════════════════════════
// DOCUMENT REMINDER EMAIL
// ═══════════════════════════════════════════════════════════════════════════

export const generateDocumentReminderEmail = (firstName, documentsNeeded = []) => ({
  subject: `${firstName}, quick request to speed up your credit repair`,
  body: `Hi ${firstName},

I wanted to reach out because there's something that could really speed up your credit repair process.

The credit bureaus sometimes request proof of identity before processing disputes - it's often a stalling tactic they use. Having these documents ready can save us 2-4 weeks:

${documentsNeeded.length > 0 
  ? documentsNeeded.map(doc => `• ${doc}`).join('\n')
  : `• Driver's License or State ID (front and back)
• Utility Bill or Bank Statement (for address verification)
• Social Security Card`}

You can upload these securely through your client portal anytime.

No rush if you don't have them handy right now - but having them ready means we can respond immediately if the bureaus request verification.

Thanks!
Chris Lahage
Speedy Credit Repair
(888) 724-7344`
});

export default {
  CHRIS_CREDENTIALS,
  generateHumanTouchEmail,
  FOLLOW_UP_TEMPLATES,
  generateDocumentReminderEmail
};