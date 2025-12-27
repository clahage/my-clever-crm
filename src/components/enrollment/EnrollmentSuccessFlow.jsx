// ============================================================================
// EnrollmentSuccessFlow.jsx - Post-Success Guidance Component
// ============================================================================
// Guides user through next steps after successful IDIQ enrollment
//
// Steps:
// 1. CELEBRATION - Confetti & score display
// 2. REPORT_TOUR - Guided tour of credit report
// 3. CREDIT_REVIEW - AI summary of credit profile
// 4. SERVICE_RECOMMENDATION - Recommended plans
// 5. CONSULTATION_OFFER - Schedule consultation
// 6. DOCUMENT_COLLECTION - Document upload
// ============================================================================

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  AlertTitle,
  LinearProgress,
  Avatar,
  Divider,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  Celebration as CelebrationIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as ReportIcon,
  Star as StarIcon,
  Schedule as ScheduleIcon,
  Upload as UploadIcon,
  CheckCircle as CheckIcon,
  ArrowForward as ArrowIcon,
  ArrowBack as BackIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Description as DocumentIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Lightbulb as TipIcon,
} from '@mui/icons-material';
import confetti from 'canvas-confetti';

// ============================================================================
// CONSTANTS
// ============================================================================

const STEPS = [
  { id: 'celebration', label: 'Congratulations!', icon: CelebrationIcon },
  { id: 'report', label: 'Your Credit Report', icon: ReportIcon },
  { id: 'review', label: 'Credit Analysis', icon: TrendingUpIcon },
  { id: 'plans', label: 'Service Options', icon: StarIcon },
  { id: 'consultation', label: 'Free Consultation', icon: ScheduleIcon },
  { id: 'documents', label: 'Document Upload', icon: UploadIcon },
];

const SERVICE_PLANS = [
  {
    id: 'basic',
    name: 'Credit Tune-Up',
    price: 99,
    period: 'month',
    features: [
      'Monthly credit monitoring',
      'Up to 5 dispute letters/month',
      'Email support',
      'Basic credit coaching',
    ],
    recommended: false,
    popular: false,
  },
  {
    id: 'standard',
    name: 'Credit Repair Pro',
    price: 149,
    period: 'month',
    features: [
      'Full 3-bureau monitoring',
      'Unlimited dispute letters',
      'Priority phone support',
      'Personalized credit coaching',
      'Debt negotiation assistance',
      'Monthly progress reports',
    ],
    recommended: true,
    popular: true,
  },
  {
    id: 'premium',
    name: 'Credit Transformation',
    price: 249,
    period: 'month',
    features: [
      'Everything in Pro, plus:',
      'Dedicated credit specialist',
      'Rapid dispute processing',
      'Identity theft protection',
      'Credit builder program',
      'Loan pre-qualification help',
      'VIP support line',
    ],
    recommended: false,
    popular: false,
  },
];

const REQUIRED_DOCUMENTS = [
  { id: 'id', label: 'Government-issued ID', description: 'Driver\'s license or passport' },
  { id: 'ssn_card', label: 'Social Security Card', description: 'Or SSN verification letter' },
  { id: 'proof_of_address', label: 'Proof of Address', description: 'Utility bill or bank statement' },
];

// ============================================================================
// CELEBRATION STEP COMPONENT
// ============================================================================

const CelebrationStep = ({ creditScore, onNext }) => {
  useEffect(() => {
    // Trigger confetti
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#1976d2', '#4caf50', '#ff9800'],
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#1976d2', '#4caf50', '#ff9800'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  const getScoreColor = (score) => {
    if (score >= 750) return 'success';
    if (score >= 670) return 'info';
    if (score >= 580) return 'warning';
    return 'error';
  };

  const getScoreLabel = (score) => {
    if (score >= 750) return 'Excellent';
    if (score >= 670) return 'Good';
    if (score >= 580) return 'Fair';
    return 'Needs Work';
  };

  return (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <Box
        sx={{
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #1976d2 0%, #4caf50 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          animation: 'pulse 2s infinite',
          '@keyframes pulse': {
            '0%, 100%': { transform: 'scale(1)' },
            '50%': { transform: 'scale(1.05)' },
          },
        }}
      >
        <CelebrationIcon sx={{ fontSize: 60, color: 'white' }} />
      </Box>

      <Typography variant="h3" fontWeight="bold" gutterBottom>
        Congratulations! 🎉
      </Typography>

      <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
        Your credit report is ready!
      </Typography>

      {creditScore && (
        <Paper
          elevation={3}
          sx={{
            p: 3,
            maxWidth: 300,
            margin: '0 auto',
            borderRadius: 3,
            background: 'linear-gradient(135deg, #f5f5f5 0%, #fff 100%)',
          }}
        >
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Your Credit Score
          </Typography>
          <Typography
            variant="h2"
            fontWeight="bold"
            color={`${getScoreColor(creditScore)}.main`}
          >
            {creditScore}
          </Typography>
          <Chip
            label={getScoreLabel(creditScore)}
            color={getScoreColor(creditScore)}
            sx={{ mt: 1 }}
          />
        </Paper>
      )}

      <Button
        variant="contained"
        size="large"
        endIcon={<ArrowIcon />}
        onClick={onNext}
        sx={{ mt: 4 }}
      >
        View My Credit Report
      </Button>
    </Box>
  );
};

// ============================================================================
// CREDIT REVIEW STEP COMPONENT
// ============================================================================

const CreditReviewStep = ({ creditData, onNext, onBack }) => {
  const issues = creditData?.issues || [];
  const opportunities = creditData?.opportunities || [];

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Your Credit Profile Summary
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <AlertTitle>AI-Powered Analysis</AlertTitle>
        We've analyzed your credit report and identified key areas for improvement.
      </Alert>

      <Grid container spacing={3}>
        {/* Issues Found */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2, height: '100%', borderColor: 'warning.main' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <TipIcon color="warning" />
              <Typography variant="subtitle1" fontWeight="bold">
                Issues Found ({issues.length})
              </Typography>
            </Box>
            <List dense>
              {issues.length > 0 ? (
                issues.map((issue, index) => (
                  <ListItem key={index}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Typography variant="body2" color="warning.main">
                        {index + 1}.
                      </Typography>
                    </ListItemIcon>
                    <ListItemText
                      primary={issue.title || issue}
                      secondary={issue.description}
                    />
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemText
                    primary="No major issues found"
                    secondary="Your credit report looks clean!"
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Opportunities */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2, height: '100%', borderColor: 'success.main' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <TrendingUpIcon color="success" />
              <Typography variant="subtitle1" fontWeight="bold">
                Improvement Opportunities
              </Typography>
            </Box>
            <List dense>
              {opportunities.length > 0 ? (
                opportunities.map((opp, index) => (
                  <ListItem key={index}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <CheckIcon color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={opp.title || opp}
                      secondary={opp.description}
                    />
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemText
                    primary="Continue monitoring"
                    secondary="Keep up the good work!"
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'flex-end' }}>
        <Button variant="outlined" startIcon={<BackIcon />} onClick={onBack}>
          Back
        </Button>
        <Button variant="contained" endIcon={<ArrowIcon />} onClick={onNext}>
          See Service Options
        </Button>
      </Box>
    </Box>
  );
};

// ============================================================================
// SERVICE PLANS STEP COMPONENT
// ============================================================================

const ServicePlansStep = ({ onSelectPlan, onNext, onBack }) => {
  const [selectedPlan, setSelectedPlan] = useState(null);

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Choose Your Credit Repair Plan
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Select the plan that best fits your needs. All plans include a 30-day money-back guarantee.
      </Typography>

      <Grid container spacing={3}>
        {SERVICE_PLANS.map((plan) => (
          <Grid item xs={12} md={4} key={plan.id}>
            <Card
              elevation={plan.popular ? 8 : 2}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                border: selectedPlan === plan.id ? '3px solid' : plan.popular ? '2px solid' : 'none',
                borderColor: selectedPlan === plan.id ? 'primary.main' : 'success.main',
                position: 'relative',
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                },
              }}
              onClick={() => setSelectedPlan(plan.id)}
            >
              {plan.popular && (
                <Chip
                  label="Most Popular"
                  color="success"
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: -10,
                    right: 16,
                  }}
                />
              )}
              {plan.recommended && (
                <Chip
                  label="Recommended for You"
                  color="primary"
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: -10,
                    left: 16,
                  }}
                />
              )}

              <CardContent sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {plan.name}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 2 }}>
                  <Typography variant="h3" fontWeight="bold" color="primary.main">
                    ${plan.price}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    /{plan.period}
                  </Typography>
                </Box>

                <List dense disablePadding>
                  {plan.features.map((feature, index) => (
                    <ListItem key={index} disablePadding sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 28 }}>
                        <CheckIcon fontSize="small" color="success" />
                      </ListItemIcon>
                      <ListItemText
                        primary={feature}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>

              <CardActions sx={{ p: 2 }}>
                <Button
                  fullWidth
                  variant={selectedPlan === plan.id ? 'contained' : 'outlined'}
                  color={plan.popular ? 'success' : 'primary'}
                >
                  {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'flex-end' }}>
        <Button variant="outlined" startIcon={<BackIcon />} onClick={onBack}>
          Back
        </Button>
        <Button
          variant="contained"
          endIcon={<ArrowIcon />}
          onClick={() => {
            if (onSelectPlan) onSelectPlan(selectedPlan);
            onNext();
          }}
          disabled={!selectedPlan}
        >
          Continue
        </Button>
      </Box>
    </Box>
  );
};

// ============================================================================
// CONSULTATION STEP COMPONENT
// ============================================================================

const ConsultationStep = ({ onSchedule, onSkip, onBack }) => {
  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Schedule Your Free Consultation
      </Typography>

      <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
            <ScheduleIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              Talk to a Credit Expert
            </Typography>
            <Typography variant="body2" color="text.secondary">
              15-minute call with a certified credit specialist
            </Typography>
          </Box>
        </Box>

        <List>
          <ListItem>
            <ListItemIcon>
              <CheckIcon color="success" />
            </ListItemIcon>
            <ListItemText primary="Review your credit report in detail" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckIcon color="success" />
            </ListItemIcon>
            <ListItemText primary="Create a personalized improvement plan" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckIcon color="success" />
            </ListItemIcon>
            <ListItemText primary="Answer all your questions" />
          </ListItem>
        </List>

        <Alert severity="success" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>100% Free</strong> - No obligation or pressure. Just helpful advice!
          </Typography>
        </Alert>
      </Paper>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button
          variant="contained"
          size="large"
          startIcon={<ScheduleIcon />}
          onClick={onSchedule}
        >
          Schedule Now
        </Button>
        <Button
          variant="text"
          onClick={onSkip}
        >
          Maybe Later
        </Button>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Typography variant="body2" color="text.secondary" textAlign="center">
        Or call us directly: <strong>(888) 724-7344</strong>
      </Typography>
    </Box>
  );
};

// ============================================================================
// DOCUMENT UPLOAD STEP COMPONENT
// ============================================================================

const DocumentUploadStep = ({ onComplete, onBack }) => {
  const [documents, setDocuments] = useState({
    id: false,
    ssn_card: false,
    proof_of_address: false,
  });

  const handleDocumentCheck = (docId) => {
    setDocuments(prev => ({ ...prev, [docId]: !prev[docId] }));
  };

  const allComplete = Object.values(documents).every(Boolean);

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Upload Required Documents
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        We need these documents to begin working on your credit repair.
      </Typography>

      <List>
        {REQUIRED_DOCUMENTS.map((doc) => (
          <Paper
            key={doc.id}
            variant="outlined"
            sx={{
              mb: 2,
              p: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              borderColor: documents[doc.id] ? 'success.main' : 'divider',
              backgroundColor: documents[doc.id] ? 'success.lighter' : 'transparent',
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={documents[doc.id]}
                  onChange={() => handleDocumentCheck(doc.id)}
                  color="success"
                />
              }
              label=""
            />
            <DocumentIcon color={documents[doc.id] ? 'success' : 'action'} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold">
                {doc.label}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {doc.description}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              size="small"
              startIcon={<UploadIcon />}
              disabled={documents[doc.id]}
            >
              Upload
            </Button>
          </Paper>
        ))}
      </List>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          You can also email documents to <strong>docs@speedycreditrepair.com</strong>
        </Typography>
      </Alert>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button variant="outlined" startIcon={<BackIcon />} onClick={onBack}>
          Back
        </Button>
        <Button
          variant="contained"
          color="success"
          onClick={onComplete}
          disabled={!allComplete}
        >
          {allComplete ? 'Complete Setup' : 'Upload Documents to Continue'}
        </Button>
      </Box>
    </Box>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const EnrollmentSuccessFlow = ({
  creditReport,
  creditScore,
  creditData,
  contactId,
  onComplete,
  onScheduleConsultation,
  onSelectPlan,
  initialStep = 0,
}) => {
  const [activeStep, setActiveStep] = useState(initialStep);
  const [completedSteps, setCompletedSteps] = useState([]);

  const handleNext = useCallback(() => {
    setCompletedSteps(prev => [...prev, activeStep]);
    setActiveStep(prev => Math.min(prev + 1, STEPS.length - 1));
  }, [activeStep]);

  const handleBack = useCallback(() => {
    setActiveStep(prev => Math.max(prev - 1, 0));
  }, []);

  const handleComplete = useCallback(() => {
    if (onComplete) {
      onComplete({
        completedSteps,
        creditScore,
      });
    }
  }, [onComplete, completedSteps, creditScore]);

  const renderStepContent = () => {
    switch (STEPS[activeStep].id) {
      case 'celebration':
        return (
          <CelebrationStep
            creditScore={creditScore}
            onNext={handleNext}
          />
        );

      case 'report':
        return (
          <Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Your Credit Report
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Your full 3-bureau credit report is now available.
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<ReportIcon />}
              onClick={handleNext}
            >
              View Full Report
            </Button>
          </Box>
        );

      case 'review':
        return (
          <CreditReviewStep
            creditData={creditData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );

      case 'plans':
        return (
          <ServicePlansStep
            onSelectPlan={onSelectPlan}
            onNext={handleNext}
            onBack={handleBack}
          />
        );

      case 'consultation':
        return (
          <ConsultationStep
            onSchedule={onScheduleConsultation}
            onSkip={handleNext}
            onBack={handleBack}
          />
        );

      case 'documents':
        return (
          <DocumentUploadStep
            onComplete={handleComplete}
            onBack={handleBack}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
      {/* Progress Stepper */}
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {STEPS.map((step, index) => {
          const StepIcon = step.icon;
          return (
            <Step key={step.id} completed={completedSteps.includes(index)}>
              <StepLabel
                StepIconComponent={() => (
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: completedSteps.includes(index)
                        ? 'success.main'
                        : activeStep === index
                        ? 'primary.main'
                        : 'grey.300',
                    }}
                  >
                    <StepIcon fontSize="small" />
                  </Avatar>
                )}
              >
                <Typography variant="caption">{step.label}</Typography>
              </StepLabel>
            </Step>
          );
        })}
      </Stepper>

      {/* Step Content */}
      <Box sx={{ minHeight: 400 }}>
        {renderStepContent()}
      </Box>
    </Paper>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export {
  CelebrationStep,
  CreditReviewStep,
  ServicePlansStep,
  ConsultationStep,
  DocumentUploadStep,
  SERVICE_PLANS,
  REQUIRED_DOCUMENTS,
};

export default EnrollmentSuccessFlow;
