/**
 * EMAIL PREVIEW RENDERER
 *
 * Purpose:
 * Renders email templates with personalization, exactly as contacts will see them.
 * Used in the WorkflowTestingSimulator to show realistic email previews.
 *
 * What It Does:
 * - Replaces personalization variables ({{firstName}}, {{creditScore}}, etc.)
 * - Applies professional email styling
 * - Renders CTAs as buttons
 * - Shows unsubscribe link and footer
 * - Handles rich text formatting
 * - Displays sender information
 * - Mobile-responsive design
 *
 * Why It's Important:
 * - Christopher sees EXACTLY what contacts will receive
 * - Catches personalization errors before sending
 * - Verifies formatting works correctly
 * - Tests CTA button placement and styling
 * - Ensures compliance elements are visible
 *
 * Example:
 * Template: "Hi {{firstName}}, your credit score is {{creditScore}}"
 * Contact: { firstName: "John", creditScore: 580 }
 * Rendered: "Hi John, your credit score is 580"
 *
 * Created: 2025-12-05
 * Part of: Speedy Credit Repair AI Workflow System
 */

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Divider,
  Link,
  Stack,
  Chip
} from '@mui/material';
import {
  Email as EmailIcon,
  CheckCircle as CheckIcon,
  Circle as UnreadIcon
} from '@mui/icons-material';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function EmailPreviewRenderer({
  template,
  contact,
  isOpened = false,
  isClicked = false,
  onOpen,
  onClickCTA,
  showControls = true,
  variant = 'preview' // 'preview' or 'inline'
}) {
  // --------------------------------------------------------------------------
  // PERSONALIZATION
  // --------------------------------------------------------------------------

  /**
   * Replaces all personalization variables with actual contact data
   */
  const personalizeContent = (content) => {
    if (!content) return '';

    let personalized = content;

    // Replace standard personalization fields
    const replacements = {
      '{{firstName}}': contact.firstName || 'there',
      '{{lastName}}': contact.lastName || '',
      '{{fullName}}': `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'there',
      '{{email}}': contact.email || '',
      '{{phone}}': contact.phone || '',
      '{{creditScore}}': contact.creditScore || 'N/A',
      '{{negativeItemCount}}': contact.negativeItemCount || '0',
      '{{serviceTier}}': contact.serviceTier || 'Standard',
      '{{monthlyPrice}}': contact.monthlyPrice || '179',

      // Company info
      '{{companyName}}': 'Speedy Credit Repair',
      '{{companyPhone}}': '(555) 123-4567',
      '{{companyEmail}}': 'support@speedycreditrepair.com',
      '{{companyAddress}}': '123 Main Street, Suite 100, City, ST 12345',

      // Dynamic links
      '{{unsubscribeLink}}': '#unsubscribe',
      '{{ctaUrl}}': template.ctaUrl || '#',
      '{{idiqEnrollmentLink}}': '#idiq-enroll',
      '{{scheduleCallLink}}': '#schedule-call',

      // Dates
      '{{currentDate}}': new Date().toLocaleDateString(),
      '{{currentYear}}': new Date().getFullYear().toString()
    };

    Object.keys(replacements).forEach(placeholder => {
      const regex = new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g');
      personalized = personalized.replace(regex, replacements[placeholder]);
    });

    return personalized;
  };

  /**
   * Processes email body to handle formatting
   */
  const formatEmailBody = (body) => {
    if (!body) return '';

    let formatted = personalizeContent(body);

    // Convert line breaks to <br> tags
    formatted = formatted.split('\n').join('<br />');

    // Bold text: **text** → <strong>text</strong>
    formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Italic text: *text* → <em>text</em>
    formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Links: [text](url) → <a href="url">text</a>
    formatted = formatted.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" style="color: #1976d2; text-decoration: none;">$1</a>');

    return formatted;
  };

  // --------------------------------------------------------------------------
  // RENDERING
  // --------------------------------------------------------------------------

  const subject = personalizeContent(template.subject || 'No Subject');
  const body = formatEmailBody(template.body || 'No content');
  const ctaText = personalizeContent(template.cta?.text || 'Click Here');
  const ctaUrl = personalizeContent(template.cta?.url || template.ctaUrl || '#');

  // Email header
  const renderHeader = () => (
    <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderBottom: 1, borderColor: 'divider' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="caption" color="text.secondary" display="block">
            From: Christopher @ Speedy Credit Repair
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            To: {contact.email}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center">
          {isOpened ? (
            <Chip
              icon={<CheckIcon />}
              label="Opened"
              size="small"
              color="success"
            />
          ) : (
            <Chip
              icon={<UnreadIcon />}
              label="Unread"
              size="small"
            />
          )}

          {template.sentAt && (
            <Typography variant="caption" color="text.secondary">
              {new Date(template.sentAt).toLocaleString()}
            </Typography>
          )}
        </Stack>
      </Stack>

      <Typography
        variant="h6"
        sx={{
          mt: 1,
          fontWeight: isOpened ? 'normal' : 'bold',
          color: isOpened ? 'text.primary' : 'text.primary'
        }}
      >
        {subject}
      </Typography>
    </Box>
  );

  // Email body
  const renderBody = () => (
    <Box sx={{ p: 3, bgcolor: 'white' }}>
      {/* Email content */}
      <Box
        sx={{
          fontFamily: 'Arial, sans-serif',
          fontSize: '14px',
          lineHeight: 1.6,
          color: '#333'
        }}
        dangerouslySetInnerHTML={{ __html: body }}
      />

      {/* CTA Button */}
      {template.cta && (
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button
            variant="contained"
            size="large"
            href={ctaUrl}
            onClick={(e) => {
              if (onClickCTA) {
                e.preventDefault();
                onClickCTA();
              }
            }}
            disabled={isClicked}
            sx={{
              px: 4,
              py: 1.5,
              fontSize: '16px',
              fontWeight: 'bold',
              bgcolor: '#1976d2',
              '&:hover': {
                bgcolor: '#1565c0'
              }
            }}
          >
            {isClicked ? '✓ Clicked' : ctaText}
          </Button>
        </Box>
      )}

      {/* Signature */}
      <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="body2" sx={{ mb: 0.5 }}>
          Best regards,
        </Typography>
        <Typography variant="body2" fontWeight="bold">
          Christopher
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Speedy Credit Repair
        </Typography>
        <Typography variant="body2" color="text.secondary">
          (555) 123-4567
        </Typography>
      </Box>
    </Box>
  );

  // Email footer (compliance)
  const renderFooter = () => (
    <Box
      sx={{
        p: 2,
        bgcolor: '#f9f9f9',
        borderTop: 1,
        borderColor: 'divider',
        textAlign: 'center'
      }}
    >
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
        Speedy Credit Repair
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
        123 Main Street, Suite 100, City, ST 12345
      </Typography>
      <Link
        href="#unsubscribe"
        variant="caption"
        sx={{ color: 'text.secondary', textDecoration: 'underline' }}
      >
        Unsubscribe from these emails
      </Link>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
        You received this email because you signed up for Speedy Credit Repair services.
      </Typography>
    </Box>
  );

  // Simulation controls
  const renderControls = () => (
    <Box
      sx={{
        p: 2,
        bgcolor: '#e3f2fd',
        borderTop: 1,
        borderColor: 'divider',
        display: 'flex',
        gap: 1,
        justifyContent: 'center'
      }}
    >
      {!isOpened && (
        <Button
          size="small"
          variant="outlined"
          onClick={onOpen}
        >
          📧 Simulate: Open Email
        </Button>
      )}

      {isOpened && !isClicked && template.cta && (
        <Button
          size="small"
          variant="outlined"
          onClick={onClickCTA}
        >
          🖱️ Simulate: Click CTA
        </Button>
      )}

      {isClicked && (
        <Chip
          label="✓ All interactions simulated"
          size="small"
          color="success"
        />
      )}
    </Box>
  );

  // --------------------------------------------------------------------------
  // MAIN RENDER
  // --------------------------------------------------------------------------

  if (variant === 'inline') {
    // Simplified inline view (for smaller displays)
    return (
      <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
        <Box sx={{ p: 2, bgcolor: '#f5f5f5' }}>
          <Typography variant="subtitle2" fontWeight="bold">
            {subject}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            From: Christopher @ Speedy Credit Repair
          </Typography>
        </Box>
        <Box sx={{ p: 2 }}>
          <Typography
            variant="body2"
            sx={{ whiteSpace: 'pre-wrap' }}
            dangerouslySetInnerHTML={{ __html: body }}
          />
          {template.cta && (
            <Button variant="contained" size="small" sx={{ mt: 2 }}>
              {ctaText}
            </Button>
          )}
        </Box>
      </Paper>
    );
  }

  // Full preview view
  return (
    <Paper
      elevation={3}
      sx={{
        maxWidth: 600,
        mx: 'auto',
        overflow: 'hidden',
        border: 1,
        borderColor: 'divider'
      }}
    >
      {renderHeader()}

      {isOpened ? (
        <>
          {renderBody()}
          {renderFooter()}
        </>
      ) : (
        <Box sx={{ p: 3, textAlign: 'center', bgcolor: '#f9f9f9' }}>
          <EmailIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            Click "Simulate: Open Email" to see full content
          </Typography>
        </Box>
      )}

      {showControls && renderControls()}
    </Paper>
  );
}

// ============================================================================
// EMAIL TEMPLATE EXAMPLES
// ============================================================================

/**
 * Pre-built email templates for common scenarios
 */
export const EMAIL_TEMPLATES = {
  welcome_standard: {
    subject: 'Welcome to Speedy Credit Repair, {{firstName}}!',
    body: `Hi {{firstName}},

Thank you for choosing Speedy Credit Repair! We're excited to help you improve your credit score.

**Here's what happens next:**

1. We'll analyze your credit report within 24 hours
2. You'll receive a personalized action plan
3. We'll start disputing negative items immediately
4. You'll get weekly progress updates

Your current credit score is **{{creditScore}}**, and we've identified **{{negativeItemCount}}** items we can dispute.

With our Standard plan, we typically help clients improve their scores by 50-100 points within 3-6 months.

**Ready to get started?**

Click the button below to access your free IDIQ credit report (worth $19.95):`,
    cta: {
      text: 'Get My Free Credit Report',
      url: '{{idiqEnrollmentLink}}'
    },
    ctaUrl: '{{idiqEnrollmentLink}}'
  },

  idiq_offer: {
    subject: '{{firstName}}, your free credit report is ready 📊',
    body: `Hi {{firstName}},

Great news! Your free IDIQ credit report is ready and waiting for you.

**Why you need this report:**

• See exactly what's hurting your credit score
• Identify errors and inaccuracies
• Get personalized recommendations
• Track your progress over time

This is a **$19.95 value**, but it's 100% free for Speedy Credit Repair clients.

**Get your report now (takes 2 minutes):**`,
    cta: {
      text: 'Access My Free Report',
      url: '{{idiqEnrollmentLink}}'
    },
    ctaUrl: '{{idiqEnrollmentLink}}'
  },

  idiq_reminder: {
    subject: 'Don\'t miss your free credit report, {{firstName}}',
    body: `Hi {{firstName}},

Just a friendly reminder that your free IDIQ credit report is still waiting for you!

**Why this matters:**

We can't start working on your credit until we see your full report. The sooner you access it, the sooner we can start improving your score.

**It only takes 2 minutes to claim:**`,
    cta: {
      text: 'Claim My Free Report Now',
      url: '{{idiqEnrollmentLink}}'
    },
    ctaUrl: '{{idiqEnrollmentLink}}'
  },

  service_recommendation: {
    subject: 'Your personalized credit repair plan, {{firstName}}',
    body: `Hi {{firstName}},

Based on your credit profile (score: **{{creditScore}}**, negative items: **{{negativeItemCount}}**), I've created a personalized recommendation for you.

**Recommended Plan: {{serviceTier}}**

This plan is perfect for your situation because:

• You have {{negativeItemCount}} items to dispute
• Your credit score has room for significant improvement
• This tier provides the right balance of service and value

**Investment:** ${{monthlyPrice}}/month

**What's included:**

✓ Unlimited disputes with all 3 bureaus
✓ Monthly credit monitoring
✓ Direct access to me and my team
✓ 6-month commitment (cancel after 3 months)

**Ready to get started?**`,
    cta: {
      text: 'Schedule Free Consultation',
      url: '{{scheduleCallLink}}'
    },
    ctaUrl: '{{scheduleCallLink}}'
  },

  idiq_lapse_urgent: {
    subject: '⚠️ URGENT: Your IDIQ subscription has lapsed',
    body: `Hi {{firstName}},

**Important:** Your IDIQ credit monitoring subscription has lapsed.

**Why this matters:**

Without active IDIQ monitoring, we cannot:
• Track your credit score changes
• Verify dispute results
• Continue credit repair services

**Action needed:**

Please renew your IDIQ subscription ($20/month) to continue service.

**Renew now to avoid service interruption:**`,
    cta: {
      text: 'Renew IDIQ Subscription',
      url: '{{idiqEnrollmentLink}}'
    },
    ctaUrl: '{{idiqEnrollmentLink}}'
  },

  contract_ready: {
    subject: 'Your contract is ready to sign, {{firstName}}',
    body: `Hi {{firstName}},

Great news! Your Speedy Credit Repair contract is ready for your signature.

**Plan:** {{serviceTier}}
**Monthly Investment:** ${{monthlyPrice}}
**Start Date:** {{currentDate}}

**What happens after you sign:**

1. We immediately start disputing negative items
2. You'll receive your personalized action plan within 24 hours
3. Weekly progress updates via email
4. Direct access to me and my team

**Important legal information:**

• You have a 3-day right to cancel after signing
• No upfront fees (first payment due after Month 1)
• 6-month commitment with 3-month opt-out clause

**Ready to improve your credit?**`,
    cta: {
      text: 'Review & Sign Contract',
      url: '{{ctaUrl}}'
    }
  },

  onboarding_complete: {
    subject: 'You\'re all set! Here\'s what to expect, {{firstName}}',
    body: `Hi {{firstName}},

**Welcome to the Speedy Credit Repair family!** 🎉

Your onboarding is complete, and we're ready to start improving your credit score.

**Your next steps:**

**Week 1:**
• We'll analyze your IDIQ report and create your action plan
• First round of dispute letters sent to all 3 bureaus
• You'll receive your personalized dashboard access

**Weeks 2-4:**
• Monitor bureau responses
• File additional disputes as needed
• Weekly progress email updates

**Month 2+:**
• Continue dispute process
• Celebrate your credit score improvements!
• Adjust strategy based on results

**Questions?**

Reply to this email or call me directly at (555) 123-4567.

Let's do this!`,
    cta: {
      text: 'Access Your Dashboard',
      url: '{{ctaUrl}}'
    }
  }
};

/**
 * Helper function to get template by name
 */
export function getEmailTemplate(templateName) {
  return EMAIL_TEMPLATES[templateName] || null;
}

/**
 * Helper function to render template with contact data
 */
export function renderEmailTemplate(templateName, contactData) {
  const template = getEmailTemplate(templateName);
  if (!template) {
    return null;
  }

  return {
    template,
    contactData
  };
}
