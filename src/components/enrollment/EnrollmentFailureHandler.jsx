// ============================================================================
// EnrollmentFailureHandler.jsx - Smart Error Recovery Flow
// ============================================================================
// Handles all IDIQ enrollment failures with guided recovery
//
// Error Types:
// - IDENTITY_NOT_VERIFIED
// - SECURITY_QUESTIONS_FAILED
// - ALREADY_ENROLLED
// - TECHNICAL_ERROR
// - FRAUD_ALERT
// ============================================================================

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  AlertTitle,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  Chip,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Collapse,
} from '@mui/material';
import {
  Error as ErrorIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Help as HelpIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Refresh as RetryIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  ArrowForward as ArrowIcon,
  Save as SaveIcon,
  Upload as UploadIcon,
  Security as SecurityIcon,
  ReportProblem as FraudIcon,
} from '@mui/icons-material';
import {
  logEnrollmentFailure,
  scheduleCallback,
  getIDIQStatus,
  IDIQ_CONTACT,
  SCR_CONTACT,
} from '../../services/EscalationService';
import { IDIQContactCard } from '../ai/SecurityQuestionHelper';

// ============================================================================
// ERROR CONFIGURATIONS
// ============================================================================

const ERROR_CONFIGS = {
  IDENTITY_NOT_VERIFIED: {
    title: 'Identity Verification Issue',
    icon: PersonIcon,
    color: 'warning',
    message: 'IDIQ couldn\'t verify your identity with the information provided.',
    recoverySteps: [
      'Double-check your Social Security Number for typos',
      'Verify your date of birth is correct (MM/DD/YYYY)',
      'Confirm your address matches your credit report',
      'Make sure your name is spelled exactly as on your ID',
    ],
    actions: ['review', 'retry', 'contact'],
    canRetry: true,
    urgency: 'high',
  },

  SECURITY_QUESTIONS_FAILED: {
    title: 'Security Questions Not Matched',
    icon: SecurityIcon,
    color: 'warning',
    message: 'The security question answers didn\'t match the credit bureau records.',
    recoverySteps: [
      '"None of the above" is often the correct answer',
      'Think back 5-10 years for addresses and accounts',
      'Credit reports may include old or forgotten information',
      'You can try again with different answers',
    ],
    actions: ['tips', 'retry', 'contact'],
    canRetry: true,
    urgency: 'medium',
  },

  ALREADY_ENROLLED: {
    title: 'Account Already Exists',
    icon: CheckIcon,
    color: 'info',
    message: 'Good news! You already have an IDIQ account.',
    recoverySteps: [
      'Try logging in with your existing credentials',
      'Use the password reset if you forgot your password',
      'Contact IDIQ if you need help accessing your account',
    ],
    actions: ['login', 'reset', 'contact'],
    canRetry: false,
    urgency: 'low',
  },

  TECHNICAL_ERROR: {
    title: 'Technical Difficulty',
    icon: ErrorIcon,
    color: 'error',
    message: 'We\'re experiencing technical difficulties. Don\'t worry - your information is saved.',
    recoverySteps: [
      'Your progress has been automatically saved',
      'Try again in a few minutes',
      'If the problem persists, we\'ll help you complete enrollment manually',
    ],
    actions: ['retry', 'callback', 'contact'],
    canRetry: true,
    urgency: 'medium',
  },

  FRAUD_ALERT: {
    title: 'Security Verification Required',
    icon: FraudIcon,
    color: 'error',
    message: 'For your security, we need to verify this is really you.',
    recoverySteps: [
      'This is a protective measure - your identity may have been flagged',
      'You may need to upload a copy of your ID',
      'A team member will help you complete verification',
    ],
    actions: ['upload', 'callback', 'contact'],
    canRetry: false,
    urgency: 'critical',
  },
};

// ============================================================================
// CALLBACK FORM COMPONENT
// ============================================================================

const CallbackForm = ({ formData, onSubmit, onCancel }) => {
  const [callbackData, setCallbackData] = useState({
    preferredDate: '',
    preferredTime: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...callbackData,
        contactName: `${formData.firstName || ''} ${formData.lastName || ''}`.trim(),
        contactPhone: formData.phone,
        contactEmail: formData.email,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
        Schedule a Callback
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        A team member will call you to help complete your enrollment.
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          label="Preferred Date"
          type="date"
          value={callbackData.preferredDate}
          onChange={(e) => setCallbackData({ ...callbackData, preferredDate: e.target.value })}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />
        <TextField
          label="Preferred Time"
          type="time"
          value={callbackData.preferredTime}
          onChange={(e) => setCallbackData({ ...callbackData, preferredTime: e.target.value })}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />
      </Box>

      <TextField
        label="Additional Notes (optional)"
        multiline
        rows={2}
        value={callbackData.notes}
        onChange={(e) => setCallbackData({ ...callbackData, notes: e.target.value })}
        fullWidth
        sx={{ mb: 2 }}
      />

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isSubmitting || !callbackData.preferredDate}
          startIcon={isSubmitting ? <CircularProgress size={16} /> : <ScheduleIcon />}
        >
          Schedule Callback
        </Button>
      </Box>
    </Paper>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const EnrollmentFailureHandler = ({
  error,
  errorType = 'TECHNICAL_ERROR',
  formData = {},
  contactId,
  onRetry,
  onReview,
  onEscalate,
  onClose,
  showProgress = true,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [showCallback, setShowCallback] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [isLogging, setIsLogging] = useState(false);
  const [callbackScheduled, setCallbackScheduled] = useState(false);

  // Get error configuration
  const errorConfig = useMemo(() => {
    return ERROR_CONFIGS[errorType] || ERROR_CONFIGS.TECHNICAL_ERROR;
  }, [errorType]);

  const IconComponent = errorConfig.icon;

  // Log failure on mount
  useEffect(() => {
    const logFailure = async () => {
      setIsLogging(true);
      try {
        await logEnrollmentFailure({
          contactId,
          errorType,
          errorMessage: error?.message || errorConfig.message,
          formData,
          step: formData?.currentStep || 0,
          userId: null,
        });
      } catch (err) {
        console.error('Error logging failure:', err);
      } finally {
        setIsLogging(false);
      }
    };

    logFailure();
  }, [contactId, errorType, error, errorConfig.message, formData]);

  // Handle callback scheduling
  const handleScheduleCallback = useCallback(async (callbackData) => {
    try {
      await scheduleCallback({
        contactId,
        ...callbackData,
        reason: `IDIQ Enrollment Failed: ${errorType}`,
      });
      setCallbackScheduled(true);
      setShowCallback(false);
    } catch (err) {
      console.error('Error scheduling callback:', err);
    }
  }, [contactId, errorType]);

  // Handle retry
  const handleRetry = useCallback(() => {
    if (onRetry) {
      onRetry();
    }
  }, [onRetry]);

  // Handle review
  const handleReview = useCallback(() => {
    if (onReview) {
      onReview();
    }
  }, [onReview]);

  return (
    <Paper
      elevation={4}
      sx={{
        p: 3,
        borderRadius: 3,
        border: '2px solid',
        borderColor: `${errorConfig.color}.main`,
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            backgroundColor: `${errorConfig.color}.lighter`,
          }}
        >
          <IconComponent color={errorConfig.color} sx={{ fontSize: 40 }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            {errorConfig.title}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {errorConfig.message}
          </Typography>
          {error?.message && error.message !== errorConfig.message && (
            <Alert severity="info" sx={{ mt: 1 }}>
              <Typography variant="body2">{error.message}</Typography>
            </Alert>
          )}
        </Box>
      </Box>

      {/* Progress Saved Notice */}
      {showProgress && (
        <Alert
          severity="success"
          icon={<SaveIcon />}
          sx={{ mb: 3 }}
        >
          <AlertTitle>Your progress has been saved</AlertTitle>
          <Typography variant="body2">
            Don't worry - your information is safe. You won't need to start over.
          </Typography>
        </Alert>
      )}

      {/* Recovery Steps */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          What to do next:
        </Typography>

        <Stepper activeStep={activeStep} orientation="vertical">
          {errorConfig.recoverySteps.map((step, index) => (
            <Step key={index} completed={index < activeStep}>
              <StepLabel
                onClick={() => setActiveStep(index)}
                sx={{ cursor: 'pointer' }}
              >
                <Typography variant="body2">{step}</Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        {errorConfig.canRetry && onRetry && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<RetryIcon />}
            onClick={handleRetry}
          >
            Try Again
          </Button>
        )}

        {errorConfig.actions.includes('review') && onReview && (
          <Button
            variant="outlined"
            color="primary"
            startIcon={<PersonIcon />}
            onClick={handleReview}
          >
            Review My Info
          </Button>
        )}

        {errorConfig.actions.includes('callback') && (
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<ScheduleIcon />}
            onClick={() => setShowCallback(true)}
            disabled={callbackScheduled}
          >
            {callbackScheduled ? 'Callback Scheduled' : 'Schedule a Callback'}
          </Button>
        )}

        <Button
          variant="outlined"
          startIcon={<HelpIcon />}
          onClick={() => setShowContact(true)}
        >
          I Need Human Help
        </Button>
      </Box>

      {/* Callback Scheduled Success */}
      {callbackScheduled && (
        <Alert severity="success" sx={{ mb: 3 }}>
          <AlertTitle>Callback Scheduled!</AlertTitle>
          <Typography variant="body2">
            A team member will call you at the scheduled time. You'll also receive a confirmation email.
          </Typography>
        </Alert>
      )}

      {/* Callback Form */}
      <Collapse in={showCallback}>
        <Box sx={{ mb: 3 }}>
          <CallbackForm
            formData={formData}
            onSubmit={handleScheduleCallback}
            onCancel={() => setShowCallback(false)}
          />
        </Box>
      </Collapse>

      <Divider sx={{ my: 3 }} />

      {/* Contact Cards */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
        {/* IDIQ Contact */}
        <Box sx={{ flex: 1 }}>
          <IDIQContactCard showSCR={false} />
        </Box>

        {/* SCR Contact */}
        <Paper variant="outlined" sx={{ flex: 1, p: 2, borderRadius: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Or Contact Speedy Credit Repair
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            We can help you through the process!
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PhoneIcon color="primary" fontSize="small" />
              <Typography variant="body1" fontWeight="bold">
                {SCR_CONTACT.phone}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EmailIcon color="primary" fontSize="small" />
              <Typography variant="body2">
                {SCR_CONTACT.email}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setShowCallback(true)}
            >
              Schedule Callback
            </Button>
            <Button
              variant="outlined"
              size="small"
              component="a"
              href={`mailto:${SCR_CONTACT.email}?subject=IDIQ Enrollment Help - ${errorType}`}
            >
              Send Email
            </Button>
          </Box>
        </Paper>
      </Box>

      {/* Human Help Dialog */}
      <Dialog open={showContact} onClose={() => setShowContact(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Get Human Help</DialogTitle>
        <DialogContent>
          <IDIQContactCard showSCR={true} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowContact(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export { ERROR_CONFIGS, CallbackForm };
export default EnrollmentFailureHandler;
