// ============================================================================
// FieldGuidance.jsx - Per-field Tooltips & Help Component
// ============================================================================
// Provides contextual help and validation guidance for form fields
//
// Features:
// - Field-specific tooltips
// - Validation feedback
// - Tips and examples
// - Error explanations
// - Multi-language support
// ============================================================================

import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Tooltip,
  IconButton,
  Paper,
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Alert,
} from '@mui/material';
import {
  HelpOutline as HelpIcon,
  Info as InfoIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Lightbulb as TipIcon,
  Security as SecurityIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';

// ============================================================================
// FIELD GUIDANCE DATA
// ============================================================================

const FIELD_GUIDANCE_DATA = {
  // Personal Information
  firstName: {
    label: 'First Name',
    description: 'Enter your legal first name as it appears on your government-issued ID.',
    tips: [
      'Use your legal name, not a nickname',
      'Spell it exactly as on your ID',
      'Include middle name only if part of your legal first name',
    ],
    examples: ['John', 'Mary Jane', 'Jose'],
    validation: {
      required: true,
      minLength: 2,
      pattern: /^[a-zA-Z\s'-]+$/,
      message: 'Please enter a valid first name (letters only)',
    },
    security: false,
  },

  lastName: {
    label: 'Last Name',
    description: 'Enter your legal last name as it appears on your government-issued ID.',
    tips: [
      'Include any suffixes (Jr., Sr., III) if on your ID',
      'Hyphenated names should include the hyphen',
      'Maiden names: use your current legal name',
    ],
    examples: ['Smith', 'Garcia-Lopez', 'O\'Connor'],
    validation: {
      required: true,
      minLength: 2,
      pattern: /^[a-zA-Z\s'-]+$/,
      message: 'Please enter a valid last name (letters only)',
    },
    security: false,
  },

  ssn: {
    label: 'Social Security Number',
    description: 'Your SSN is required for identity verification with credit bureaus.',
    tips: [
      'Your SSN is encrypted with bank-level security',
      'We never store your full SSN',
      'Required for credit report access',
      'IDIQ uses this only for verification',
    ],
    examples: ['123-45-6789'],
    validation: {
      required: true,
      pattern: /^(?!000|666|9\d{2})\d{3}-?(?!00)\d{2}-?(?!0000)\d{4}$/,
      message: 'Please enter a valid 9-digit SSN',
    },
    security: true,
    securityNote: 'Your SSN is encrypted and protected. We use bank-level security.',
  },

  dateOfBirth: {
    label: 'Date of Birth',
    description: 'Enter your date of birth as it appears on your ID.',
    tips: [
      'Format: MM/DD/YYYY',
      'Must match your government ID exactly',
      'You must be 18 or older to enroll',
    ],
    examples: ['01/15/1985', '12/31/1990'],
    validation: {
      required: true,
      pattern: /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/,
      message: 'Please enter a valid date (MM/DD/YYYY)',
    },
    security: false,
  },

  dob: {
    label: 'Date of Birth',
    description: 'Enter your date of birth as it appears on your ID.',
    tips: [
      'Format: MM/DD/YYYY',
      'Must match your government ID exactly',
      'You must be 18 or older to enroll',
    ],
    examples: ['01/15/1985', '12/31/1990'],
    validation: {
      required: true,
      message: 'Please enter your date of birth',
    },
    security: false,
  },

  // Contact Information
  phone: {
    label: 'Phone Number',
    description: 'Enter your best contact phone number.',
    tips: [
      'Mobile numbers are preferred for text updates',
      'We may call to verify your identity',
      'Include area code',
    ],
    examples: ['(714) 555-1234', '714-555-1234'],
    validation: {
      required: true,
      pattern: /^\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})$/,
      message: 'Please enter a valid 10-digit phone number',
    },
    security: false,
  },

  email: {
    label: 'Email Address',
    description: 'Enter the email address where you want to receive updates.',
    tips: [
      'Use an email you check regularly',
      'Your credit report will be sent here',
      'Account notifications will come to this email',
    ],
    examples: ['john.smith@email.com'],
    validation: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Please enter a valid email address',
    },
    security: false,
  },

  // Address Information
  address: {
    label: 'Street Address',
    description: 'Enter your current residential address.',
    tips: [
      'Use your address as it appears on your credit report',
      'Include apartment/unit number if applicable',
      'Do not use a P.O. Box',
    ],
    examples: ['123 Main Street', '456 Oak Ave, Apt 2B'],
    validation: {
      required: true,
      minLength: 5,
      message: 'Please enter a valid street address',
    },
    security: false,
  },

  city: {
    label: 'City',
    description: 'Enter your city of residence.',
    tips: [
      'Will auto-fill when you enter ZIP code',
      'Use official city name',
    ],
    examples: ['Los Angeles', 'New York', 'Houston'],
    validation: {
      required: true,
      minLength: 2,
      message: 'Please enter a valid city name',
    },
    security: false,
  },

  state: {
    label: 'State',
    description: 'Select your state of residence.',
    tips: [
      'Will auto-fill when you enter ZIP code',
      'Use the state where you currently live',
    ],
    validation: {
      required: true,
      message: 'Please select your state',
    },
    security: false,
  },

  zip: {
    label: 'ZIP Code',
    description: 'Enter your 5-digit ZIP code.',
    tips: [
      'City and state will auto-fill',
      'Use your current address ZIP',
      'Must be a valid US ZIP code',
    ],
    examples: ['92647', '10001', '90210'],
    validation: {
      required: true,
      pattern: /^\d{5}(-\d{4})?$/,
      message: 'Please enter a valid 5-digit ZIP code',
    },
    security: false,
  },

  // Security Questions
  securityQuestion: {
    label: 'Security Question',
    description: 'Answer this verification question based on your credit history.',
    tips: [
      '"None of the above" is often correct',
      'Think back 5-10 years for addresses and accounts',
      'Credit reports may include old information',
      'Take your time - there\'s no rush',
    ],
    validation: {
      required: true,
      message: 'Please select an answer',
    },
    security: true,
    securityNote: 'These questions help verify your identity.',
  },
};

// ============================================================================
// FIELD GUIDANCE COMPONENT
// ============================================================================

const FieldGuidance = ({
  fieldName,
  value,
  error,
  touched,
  showInline = false,
  showExamples = true,
  showTips = true,
  compact = false,
  language = 'en',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Get guidance for this field
  const guidance = useMemo(() => {
    return FIELD_GUIDANCE_DATA[fieldName] || {
      label: fieldName,
      description: 'Enter your information.',
      tips: [],
      validation: { required: false },
      security: false,
    };
  }, [fieldName]);

  // Validate value
  const validationStatus = useMemo(() => {
    if (!touched) return null;
    if (!value && guidance.validation?.required) return 'error';
    if (guidance.validation?.pattern && value && !guidance.validation.pattern.test(value)) {
      return 'error';
    }
    if (guidance.validation?.minLength && value && value.length < guidance.validation.minLength) {
      return 'error';
    }
    if (value) return 'success';
    return null;
  }, [value, touched, guidance.validation]);

  // Tooltip content
  const tooltipContent = (
    <Box sx={{ maxWidth: 280 }}>
      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
        {guidance.label}
      </Typography>
      <Typography variant="body2" sx={{ mb: 1 }}>
        {guidance.description}
      </Typography>

      {guidance.security && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
          <SecurityIcon color="success" fontSize="small" />
          <Typography variant="caption" color="success.main">
            {guidance.securityNote || 'Your information is secure'}
          </Typography>
        </Box>
      )}

      {showTips && guidance.tips && guidance.tips.length > 0 && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" fontWeight="bold" color="warning.main">
            Tips:
          </Typography>
          <List dense disablePadding>
            {guidance.tips.slice(0, 3).map((tip, index) => (
              <ListItem key={index} disablePadding sx={{ py: 0.25 }}>
                <ListItemIcon sx={{ minWidth: 24 }}>
                  <TipIcon fontSize="small" color="warning" />
                </ListItemIcon>
                <ListItemText
                  primary={tip}
                  primaryTypographyProps={{ variant: 'caption' }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {showExamples && guidance.examples && guidance.examples.length > 0 && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Examples: {guidance.examples.join(', ')}
          </Typography>
        </Box>
      )}
    </Box>
  );

  // Compact mode - just an icon with tooltip
  if (compact) {
    return (
      <Tooltip title={tooltipContent} arrow placement="right">
        <IconButton size="small" sx={{ ml: 0.5 }}>
          <HelpIcon fontSize="small" color="action" />
        </IconButton>
      </Tooltip>
    );
  }

  // Inline mode - expandable help text
  if (showInline) {
    return (
      <Box sx={{ mt: 0.5 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
          }}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <HelpIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
          <Typography variant="caption" color="text.secondary">
            {isExpanded ? 'Hide help' : 'Show help'}
          </Typography>
        </Box>

        <Collapse in={isExpanded}>
          <Paper variant="outlined" sx={{ p: 1.5, mt: 1, backgroundColor: 'grey.50' }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              {guidance.description}
            </Typography>

            {guidance.security && (
              <Chip
                icon={<SecurityIcon />}
                label="Secure & Encrypted"
                size="small"
                color="success"
                variant="outlined"
                sx={{ mb: 1 }}
              />
            )}

            {showTips && guidance.tips && guidance.tips.length > 0 && (
              <List dense disablePadding>
                {guidance.tips.map((tip, index) => (
                  <ListItem key={index} disablePadding sx={{ py: 0.25 }}>
                    <ListItemIcon sx={{ minWidth: 24 }}>
                      <TipIcon fontSize="small" color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary={tip}
                      primaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                ))}
              </List>
            )}

            {showExamples && guidance.examples && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Examples: {guidance.examples.join(', ')}
              </Typography>
            )}
          </Paper>
        </Collapse>

        {/* Validation feedback */}
        {error && touched && (
          <Alert severity="error" sx={{ mt: 1, py: 0 }} icon={<ErrorIcon fontSize="small" />}>
            <Typography variant="caption">
              {error || guidance.validation?.message}
            </Typography>
          </Alert>
        )}

        {validationStatus === 'success' && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
            <CheckIcon fontSize="small" color="success" />
            <Typography variant="caption" color="success.main">
              Looks good!
            </Typography>
          </Box>
        )}
      </Box>
    );
  }

  // Default - tooltip only
  return (
    <Tooltip title={tooltipContent} arrow placement="right">
      <IconButton size="small">
        <HelpIcon fontSize="small" color="action" />
      </IconButton>
    </Tooltip>
  );
};

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

/**
 * Field Label with Help Icon
 */
export const FieldLabelWithHelp = ({ fieldName, label, required }) => {
  const guidance = FIELD_GUIDANCE_DATA[fieldName];

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Typography variant="body2" component="span">
        {label || guidance?.label || fieldName}
        {required && <span style={{ color: 'red' }}> *</span>}
      </Typography>
      <FieldGuidance fieldName={fieldName} compact />
    </Box>
  );
};

/**
 * Security Badge for sensitive fields
 */
export const SecurityBadge = ({ fieldName }) => {
  const guidance = FIELD_GUIDANCE_DATA[fieldName];

  if (!guidance?.security) return null;

  return (
    <Tooltip title={guidance.securityNote || 'Your information is encrypted and secure'}>
      <Chip
        icon={<SecurityIcon />}
        label="Secure"
        size="small"
        color="success"
        variant="outlined"
        sx={{ ml: 1 }}
      />
    </Tooltip>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export { FIELD_GUIDANCE_DATA };
export default FieldGuidance;
