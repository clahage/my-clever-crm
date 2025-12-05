/**
 * SMS PREVIEW RENDERER
 *
 * Purpose:
 * Renders SMS messages exactly as they'll appear on contact's phone.
 * Used in WorkflowTestingSimulator to show realistic SMS previews.
 *
 * What It Does:
 * - Renders SMS in mobile-style chat bubbles
 * - Replaces personalization variables
 * - Shows character count and segment info
 * - Simulates reply functionality
 * - Displays timestamps
 * - Mobile-style conversation view
 * - TCPA compliance indicators
 *
 * Why It's Important:
 * - SMS has 160-character limits per segment
 * - Different visual style than email
 * - Must include opt-out language
 * - See exactly how message will display on phone
 * - Catch personalization errors
 *
 * Example:
 * Template: "Hi {{firstName}}! Your credit report is ready: {{link}}"
 * Contact: { firstName: "John" }
 * Rendered: "Hi John! Your credit report is ready: bit.ly/abc123"
 * Character count: 54/160 (1 segment)
 *
 * Created: 2025-12-05
 * Part of: Speedy Credit Repair AI Workflow System
 */

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Chip,
  Stack,
  Alert,
  Divider
} from '@mui/material';
import {
  Sms as SmsIcon,
  Send as SendIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

// ============================================================================
// CONSTANTS
// ============================================================================

const SMS_SEGMENT_LENGTH = 160;
const SMS_MULTIPART_SEGMENT_LENGTH = 153; // Slightly less for multipart
const MAX_SMS_LENGTH = 1600; // 10 segments max

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function SMSPreviewRenderer({
  template,
  contact,
  isReplied = false,
  replyMessage = '',
  onReply,
  showControls = true,
  variant = 'mobile' // 'mobile' or 'compact'
}) {
  // --------------------------------------------------------------------------
  // STATE
  // --------------------------------------------------------------------------

  const [replyText, setReplyText] = useState('');
  const [showReplyBox, setShowReplyBox] = useState(false);

  // --------------------------------------------------------------------------
  // PERSONALIZATION
  // --------------------------------------------------------------------------

  /**
   * Replaces personalization variables with contact data
   */
  const personalizeContent = (content) => {
    if (!content) return '';

    let personalized = content;

    const replacements = {
      '{{firstName}}': contact.firstName || 'there',
      '{{lastName}}': contact.lastName || '',
      '{{creditScore}}': contact.creditScore || 'N/A',
      '{{negativeItemCount}}': contact.negativeItemCount || '0',
      '{{companyName}}': 'Speedy Credit Repair',
      '{{companyPhone}}': '(555) 123-4567',
      '{{link}}': template.link || 'bit.ly/speedy123',
      '{{idiqLink}}': 'bit.ly/idiq-enroll',
      '{{scheduleLink}}': 'bit.ly/schedule-call'
    };

    Object.keys(replacements).forEach(placeholder => {
      const regex = new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g');
      personalized = personalized.replace(regex, replacements[placeholder]);
    });

    return personalized;
  };

  // --------------------------------------------------------------------------
  // SMS ANALYSIS
  // --------------------------------------------------------------------------

  const message = personalizeContent(template.message || '');
  const messageLength = message.length;
  const segmentCount = calculateSegmentCount(message);
  const hasOptOut = message.toLowerCase().includes('stop') || message.toLowerCase().includes('reply stop');
  const hasLink = /https?:\/\/|bit\.ly|www\./i.test(message);

  /**
   * Calculates how many SMS segments this message will use
   */
  function calculateSegmentCount(text) {
    if (text.length === 0) return 0;
    if (text.length <= SMS_SEGMENT_LENGTH) return 1;

    return Math.ceil(text.length / SMS_MULTIPART_SEGMENT_LENGTH);
  }

  /**
   * Checks if message is too long
   */
  const isTooLong = messageLength > MAX_SMS_LENGTH;

  /**
   * Gets warning color based on length
   */
  const getLengthColor = () => {
    if (isTooLong) return 'error';
    if (segmentCount > 3) return 'warning';
    if (segmentCount > 1) return 'info';
    return 'success';
  };

  // --------------------------------------------------------------------------
  // HANDLERS
  // --------------------------------------------------------------------------

  const handleSendReply = () => {
    if (onReply && replyText.trim()) {
      onReply(replyText.trim());
      setReplyText('');
      setShowReplyBox(false);
    }
  };

  // --------------------------------------------------------------------------
  // RENDERING
  // --------------------------------------------------------------------------

  /**
   * Renders mobile phone-style view
   */
  const renderMobileView = () => (
    <Paper
      elevation={3}
      sx={{
        maxWidth: 375,
        mx: 'auto',
        overflow: 'hidden',
        bgcolor: '#f0f0f0',
        borderRadius: 4
      }}
    >
      {/* Phone header */}
      <Box
        sx={{
          p: 1.5,
          bgcolor: '#1976d2',
          color: 'white',
          textAlign: 'center'
        }}
      >
        <Typography variant="caption" display="block">
          Speedy Credit Repair
        </Typography>
        <Typography variant="caption" display="block" sx={{ opacity: 0.8 }}>
          (555) 123-4567
        </Typography>
      </Box>

      {/* Conversation area */}
      <Box
        sx={{
          p: 2,
          minHeight: 300,
          maxHeight: 500,
          overflow: 'auto',
          bgcolor: '#e5ddd5',
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M0 0h100v100H0z" fill="none"/%3E%3C/svg%3E")'
        }}
      >
        {/* Incoming message (from Speedy) */}
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-start' }}>
          <Paper
            sx={{
              p: 1.5,
              maxWidth: '75%',
              bgcolor: 'white',
              borderRadius: 2,
              borderBottomLeftRadius: 4,
              boxShadow: 1
            }}
          >
            <Typography
              variant="body2"
              sx={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontSize: '14px',
                lineHeight: 1.4
              }}
            >
              {message}
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', mt: 0.5, textAlign: 'right' }}
            >
              {template.sentAt ? new Date(template.sentAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              }) : 'Just now'}
            </Typography>
          </Paper>
        </Box>

        {/* Reply message (if exists) */}
        {isReplied && replyMessage && (
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Paper
              sx={{
                p: 1.5,
                maxWidth: '75%',
                bgcolor: '#dcf8c6',
                borderRadius: 2,
                borderBottomRightRadius: 4,
                boxShadow: 1
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  fontSize: '14px',
                  lineHeight: 1.4
                }}
              >
                {replyMessage}
              </Typography>

              <Stack
                direction="row"
                spacing={0.5}
                alignItems="center"
                justifyContent="flex-end"
                sx={{ mt: 0.5 }}
              >
                <Typography variant="caption" color="text.secondary">
                  {new Date().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Typography>
                <CheckIcon sx={{ fontSize: 14, color: '#4caf50' }} />
              </Stack>
            </Paper>
          </Box>
        )}
      </Box>

      {/* Reply input area */}
      {showControls && !isReplied && (
        <Box sx={{ p: 1.5, bgcolor: 'white', borderTop: 1, borderColor: 'divider' }}>
          {!showReplyBox ? (
            <Button
              fullWidth
              variant="outlined"
              startIcon={<SendIcon />}
              onClick={() => setShowReplyBox(true)}
              size="small"
            >
              Reply as Contact
            </Button>
          ) : (
            <Stack spacing={1}>
              <TextField
                fullWidth
                multiline
                rows={2}
                placeholder="Type reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                size="small"
                autoFocus
              />
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<SendIcon />}
                  onClick={handleSendReply}
                  disabled={!replyText.trim()}
                >
                  Send
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setShowReplyBox(false);
                    setReplyText('');
                  }}
                >
                  Cancel
                </Button>
              </Stack>
            </Stack>
          )}
        </Box>
      )}

      {/* Message info footer */}
      <Box sx={{ p: 1.5, bgcolor: '#fafafa', borderTop: 1, borderColor: 'divider' }}>
        <Stack spacing={1}>
          {/* Character count */}
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="caption" color="text.secondary">
              Characters
            </Typography>
            <Chip
              label={`${messageLength}/${SMS_SEGMENT_LENGTH * segmentCount}`}
              size="small"
              color={getLengthColor()}
            />
          </Box>

          {/* Segment count */}
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="caption" color="text.secondary">
              SMS Segments
            </Typography>
            <Chip
              label={`${segmentCount} segment${segmentCount > 1 ? 's' : ''}`}
              size="small"
              color={getLengthColor()}
            />
          </Box>

          {/* Cost estimate */}
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="caption" color="text.secondary">
              Estimated Cost
            </Typography>
            <Typography variant="caption" fontWeight="bold">
              ${(segmentCount * 0.0075).toFixed(4)} per send
            </Typography>
          </Box>

          {/* Warnings */}
          {isTooLong && (
            <Alert severity="error" sx={{ mt: 1 }}>
              Message too long! Maximum {MAX_SMS_LENGTH} characters ({MAX_SMS_LENGTH / SMS_MULTIPART_SEGMENT_LENGTH} segments).
            </Alert>
          )}

          {!hasOptOut && (
            <Alert severity="warning" sx={{ mt: 1 }} icon={<WarningIcon />}>
              Missing opt-out language. Add "Reply STOP to unsubscribe" for TCPA compliance.
            </Alert>
          )}

          {hasLink && (
            <Alert severity="info" sx={{ mt: 1 }}>
              Contains link. Consider using a URL shortener (bit.ly) to save characters.
            </Alert>
          )}
        </Stack>
      </Box>
    </Paper>
  );

  /**
   * Renders compact view (for smaller displays)
   */
  const renderCompactView = () => (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={2}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="start">
          <Box>
            <Typography variant="subtitle2" fontWeight="bold">
              <SmsIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
              SMS Message
            </Typography>
            <Typography variant="caption" color="text.secondary">
              From: Speedy Credit Repair
            </Typography>
          </Box>

          <Chip
            label={`${segmentCount} segment${segmentCount > 1 ? 's' : ''}`}
            size="small"
            color={getLengthColor()}
          />
        </Box>

        <Divider />

        {/* Message content */}
        <Paper
          sx={{
            p: 1.5,
            bgcolor: '#f5f5f5',
            border: 1,
            borderColor: 'divider'
          }}
        >
          <Typography
            variant="body2"
            sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
          >
            {message}
          </Typography>
        </Paper>

        {/* Reply (if exists) */}
        {isReplied && replyMessage && (
          <Paper
            sx={{
              p: 1.5,
              bgcolor: '#e8f5e9',
              border: 1,
              borderColor: 'success.main'
            }}
          >
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              Contact replied:
            </Typography>
            <Typography
              variant="body2"
              sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
            >
              {replyMessage}
            </Typography>
          </Paper>
        )}

        {/* Stats */}
        <Stack direction="row" spacing={2} justifyContent="space-between">
          <Typography variant="caption" color="text.secondary">
            {messageLength} characters
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ${(segmentCount * 0.0075).toFixed(4)} per send
          </Typography>
        </Stack>

        {/* Warnings */}
        {!hasOptOut && (
          <Alert severity="warning" icon={<WarningIcon />}>
            Add "Reply STOP to unsubscribe" for TCPA compliance
          </Alert>
        )}

        {/* Reply controls */}
        {showControls && !isReplied && (
          <Button
            size="small"
            variant="outlined"
            onClick={() => onReply && onReply('YES')}
          >
            Simulate Reply
          </Button>
        )}
      </Stack>
    </Paper>
  );

  // --------------------------------------------------------------------------
  // MAIN RENDER
  // --------------------------------------------------------------------------

  return variant === 'mobile' ? renderMobileView() : renderCompactView();
}

// ============================================================================
// SMS TEMPLATE EXAMPLES
// ============================================================================

/**
 * Pre-built SMS templates for common scenarios
 */
export const SMS_TEMPLATES = {
  welcome: {
    message: `Hi {{firstName}}! Welcome to Speedy Credit Repair. Your free credit report is ready: {{idiqLink}} Reply STOP to opt out.`,
    link: '{{idiqLink}}'
  },

  idiq_offer: {
    message: `{{firstName}}, your free IDIQ credit report ($19.95 value) is ready. Get it now: {{idiqLink}} Reply STOP to unsubscribe.`,
    link: '{{idiqLink}}'
  },

  idiq_reminder: {
    message: `Quick reminder {{firstName}} - claim your free credit report before it expires: {{idiqLink}} Text STOP to opt out.`,
    link: '{{idiqLink}}'
  },

  idiq_lapse_urgent: {
    message: `URGENT: {{firstName}}, your IDIQ subscription lapsed. Renew now to continue service: {{idiqLink}} Reply STOP to unsubscribe.`,
    link: '{{idiqLink}}'
  },

  appointment_reminder: {
    message: `Hi {{firstName}}, reminder: Your credit consultation with Christopher is tomorrow at 2pm. Call (555) 123-4567 or reschedule: {{scheduleLink}} Reply STOP to opt out.`,
    link: '{{scheduleLink}}'
  },

  progress_update: {
    message: `Great news {{firstName}}! We successfully removed {{negativeItemCount}} items from your credit report this month. Your score should improve soon! Reply STOP to unsubscribe.`,
    link: null
  },

  contract_ready: {
    message: `{{firstName}}, your Speedy Credit Repair contract is ready to sign: {{link}} Questions? Call (555) 123-4567. Reply STOP to opt out.`,
    link: '{{link}}'
  },

  payment_reminder: {
    message: `Hi {{firstName}}, your monthly payment of ${{monthlyPrice}} is due. Update payment method: {{link}} Need help? Call (555) 123-4567. Text STOP to unsubscribe.`,
    link: '{{link}}'
  },

  score_improvement: {
    message: `🎉 {{firstName}}! Your credit score improved by 25 points! Keep up the great work. View details: {{link}} Reply STOP to opt out.`,
    link: '{{link}}'
  },

  check_in: {
    message: `Hi {{firstName}}, just checking in! How's everything going? Reply with any questions or call me at (555) 123-4567. Text STOP to unsubscribe.`,
    link: null
  }
};

/**
 * Helper function to get template by name
 */
export function getSMSTemplate(templateName) {
  return SMS_TEMPLATES[templateName] || null;
}

/**
 * Helper function to validate SMS compliance
 */
export function validateSMSCompliance(message) {
  const issues = [];

  // Check opt-out language
  if (!message.toLowerCase().includes('stop')) {
    issues.push({
      severity: 'critical',
      message: 'Missing opt-out language (TCPA violation)',
      suggestion: 'Add "Reply STOP to unsubscribe" or similar'
    });
  }

  // Check length
  const segmentCount = Math.ceil(message.length / SMS_MULTIPART_SEGMENT_LENGTH);
  if (segmentCount > 10) {
    issues.push({
      severity: 'error',
      message: `Message too long (${message.length} chars, ${segmentCount} segments)`,
      suggestion: 'Keep SMS under 1600 characters (10 segments)'
    });
  } else if (segmentCount > 3) {
    issues.push({
      severity: 'warning',
      message: `Message uses ${segmentCount} segments (${message.length} chars)`,
      suggestion: 'Consider shortening to reduce cost'
    });
  }

  // Check for personalization
  const hasPersonalization = /\{\{[a-zA-Z]+\}\}/.test(message);
  if (!hasPersonalization) {
    issues.push({
      severity: 'info',
      message: 'No personalization detected',
      suggestion: 'Add {{firstName}} to improve engagement'
    });
  }

  return {
    isValid: issues.filter(i => i.severity === 'critical').length === 0,
    issues,
    segmentCount,
    characterCount: message.length,
    estimatedCost: segmentCount * 0.0075
  };
}
