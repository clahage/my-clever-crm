// ============================================================================
// SecurityQuestionHelper.jsx - IDIQ Verification Question Guidance
// ============================================================================
// Helps users answer IDIQ's identity verification questions
//
// Features:
// - Credit report source suggestions
// - Question type explanations
// - "None of the above" guidance
// - Timer display
// - IDIQ contact information
// ============================================================================

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  AlertTitle,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Link,
  LinearProgress,
} from '@mui/material';
import {
  Lightbulb as TipIcon,
  CheckCircle as CheckIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Help as HelpIcon,
  Close as CloseIcon,
  Phone as PhoneIcon,
  Schedule as ScheduleIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CreditCard as CreditIcon,
  Description as DocumentIcon,
  Security as SecurityIcon,
  Bookmark as BookmarkIcon,
} from '@mui/icons-material';
import { getIDIQStatus, IDIQ_CONTACT, SCR_CONTACT } from '../../services/EscalationService';

// ============================================================================
// CONSTANTS
// ============================================================================

const CREDIT_REPORT_SOURCES = [
  {
    name: 'Credit Karma',
    url: 'https://www.creditkarma.com',
    free: true,
    bureaus: ['TransUnion', 'Equifax'],
  },
  {
    name: 'Experian',
    url: 'https://www.experian.com/consumer-products/free-credit-report.html',
    free: true,
    bureaus: ['Experian'],
  },
  {
    name: 'NerdWallet',
    url: 'https://www.nerdwallet.com/free-credit-score',
    free: true,
    bureaus: ['TransUnion'],
  },
  {
    name: 'Credit Sesame',
    url: 'https://www.creditsesame.com',
    free: true,
    bureaus: ['TransUnion'],
  },
  {
    name: 'AnnualCreditReport.com',
    url: 'https://www.annualcreditreport.com',
    free: true,
    bureaus: ['All Three'],
    note: 'Official source - once per year',
  },
  {
    name: 'Your Bank or Credit Card App',
    url: null,
    free: true,
    bureaus: ['Varies'],
    note: 'Many banks offer free credit scores',
  },
  {
    name: 'MyFICO',
    url: 'https://www.myfico.com',
    free: false,
    bureaus: ['All Three'],
    note: 'Most detailed reports (paid)',
  },
];

const QUESTION_TYPES = {
  address: {
    title: 'Previous Addresses',
    icon: '🏠',
    tips: [
      'Think about where you lived 5-10 years ago',
      'Include addresses from college, apartments, or family homes',
      'Credit reports may show addresses you forgot about',
      '"None of the above" is often correct if you don\'t recognize any',
    ],
  },
  employer: {
    title: 'Previous Employers',
    icon: '💼',
    tips: [
      'Include part-time jobs and internships',
      'Some credit reports don\'t include employer info',
      'Think about jobs from the past 7-10 years',
    ],
  },
  loan: {
    title: 'Loan History',
    icon: '💰',
    tips: [
      'Include car loans, student loans, and mortgages',
      'Think about co-signed loans too',
      'The amount shown might be the original loan amount',
    ],
  },
  vehicle: {
    title: 'Vehicle History',
    icon: '🚗',
    tips: [
      'Include leased vehicles',
      'Think about cars from 5-10 years ago',
      'Vehicles may be listed under the finance company',
    ],
  },
  account: {
    title: 'Credit Accounts',
    icon: '💳',
    tips: [
      'Include store credit cards you may have forgotten',
      'Think about accounts you closed years ago',
      'The credit limit shown may be original or updated',
    ],
  },
  other: {
    title: 'Other Questions',
    icon: '❓',
    tips: [
      'Read each option carefully',
      '"None of the above" is a valid answer',
      'Think back 7-10 years',
    ],
  },
};

// ============================================================================
// PRO TIP BANNER COMPONENT
// ============================================================================

const ProTipBanner = ({ onDismiss, onGetReport, onContinue }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <Paper
      elevation={3}
      sx={{
        mb: 3,
        overflow: 'hidden',
        border: '2px solid',
        borderColor: 'warning.main',
        borderRadius: 2,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          backgroundColor: 'warning.lighter',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TipIcon color="warning" />
          <Typography variant="subtitle1" fontWeight="bold">
            PRO TIP
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {onDismiss && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onDismiss();
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
          {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </Box>
      </Box>

      {/* Content */}
      <Collapse in={isExpanded}>
        <Box sx={{ p: 2 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Having a recent credit report handy can help!
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Security questions are based on information from your credit report.
            Having a recent credit report nearby can help you answer accurately!
          </Typography>

          {/* Free Sources */}
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
            Where to get one (many are FREE):
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {CREDIT_REPORT_SOURCES.filter(s => s.free).slice(0, 6).map((source) => (
              <Chip
                key={source.name}
                label={source.name}
                size="small"
                variant="outlined"
                color="success"
                icon={<CheckIcon />}
                clickable={!!source.url}
                component={source.url ? 'a' : 'span'}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
              />
            ))}
          </Box>

          {/* What questions ask about */}
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
            Questions may ask about:
          </Typography>

          <List dense disablePadding>
            <ListItem disablePadding sx={{ py: 0.25 }}>
              <ListItemIcon sx={{ minWidth: 28 }}>
                <CheckIcon fontSize="small" color="success" />
              </ListItemIcon>
              <ListItemText
                primary="Previous addresses you've lived at"
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
            <ListItem disablePadding sx={{ py: 0.25 }}>
              <ListItemIcon sx={{ minWidth: 28 }}>
                <CheckIcon fontSize="small" color="success" />
              </ListItemIcon>
              <ListItemText
                primary="Loan amounts and lenders"
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
            <ListItem disablePadding sx={{ py: 0.25 }}>
              <ListItemIcon sx={{ minWidth: 28 }}>
                <CheckIcon fontSize="small" color="success" />
              </ListItemIcon>
              <ListItemText
                primary="Credit card accounts"
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
            <ListItem disablePadding sx={{ py: 0.25 }}>
              <ListItemIcon sx={{ minWidth: 28 }}>
                <CheckIcon fontSize="small" color="success" />
              </ListItemIcon>
              <ListItemText
                primary="Vehicle loans or leases"
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
          </List>

          {/* Encouragement Box */}
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              mt: 2,
              backgroundColor: 'success.lighter',
              borderColor: 'success.light',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Typography variant="h6" sx={{ lineHeight: 1 }}>
                🚀
              </Typography>
              <Box>
                <Typography variant="subtitle2" fontWeight="bold">
                  Don't have one? No problem!
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Most people answer these questions correctly from memory.
                  Go ahead and continue - you can always try again if needed!
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, mt: 2, justifyContent: 'flex-end' }}>
            {onGetReport && (
              <Button
                variant="outlined"
                color="inherit"
                onClick={onGetReport}
              >
                I'll grab one first
              </Button>
            )}
            {onContinue && (
              <Button
                variant="contained"
                color="primary"
                onClick={onContinue}
                endIcon={<CheckIcon />}
              >
                Got it, Continue
              </Button>
            )}
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
};

// ============================================================================
// IDIQ CONTACT CARD COMPONENT
// ============================================================================

const IDIQContactCard = ({ showSCR = true }) => {
  const idiqStatus = useMemo(() => getIDIQStatus(), []);

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <PhoneIcon color="primary" />
        <Typography variant="subtitle1" fontWeight="bold">
          Contact IDIQ Customer Service
        </Typography>
      </Box>

      {/* Phone Number */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight="bold" color="primary.main">
          {IDIQ_CONTACT.phone}
        </Typography>
        <Chip label="Toll-Free" size="small" color="success" sx={{ mt: 0.5 }} />
      </Box>

      {/* Hours */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Hours (Pacific Time):
        </Typography>
        <Paper variant="outlined" sx={{ p: 1.5, mt: 1, backgroundColor: 'grey.50' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2">Mon - Fri</Typography>
            <Typography variant="body2" fontWeight="medium">5:00 AM - 4:00 PM PT</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2">Saturday</Typography>
            <Typography variant="body2" fontWeight="medium">6:30 AM - 3:00 PM PT</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2">Sunday</Typography>
            <Typography variant="body2" color="text.secondary">Closed</Typography>
          </Box>
        </Paper>
      </Box>

      {/* Status */}
      <Alert severity={idiqStatus.isOpen ? 'success' : 'warning'} sx={{ mb: 2 }}>
        <Typography variant="body2" fontWeight="medium">
          Currently: {idiqStatus.isOpen ? 'OPEN' : 'CLOSED'} - {idiqStatus.message}
        </Typography>
        {idiqStatus.opensNext && (
          <Typography variant="caption">
            Opens: {idiqStatus.opensNext}
          </Typography>
        )}
      </Alert>

      {/* What they help with */}
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        IDIQ can help with:
      </Typography>
      <List dense disablePadding>
        {[
          'Identity verification issues',
          'Security question problems',
          'Account access',
          'Billing & membership questions',
        ].map((item, index) => (
          <ListItem key={index} disablePadding sx={{ py: 0.25 }}>
            <ListItemIcon sx={{ minWidth: 24 }}>
              <CheckIcon fontSize="small" color="success" />
            </ListItemIcon>
            <ListItemText
              primary={item}
              primaryTypographyProps={{ variant: 'body2' }}
            />
          </ListItem>
        ))}
      </List>

      <Chip
        icon={<SecurityIcon />}
        label="100% U.S.-based support"
        size="small"
        variant="outlined"
        sx={{ mt: 1 }}
      />

      {/* SCR Contact */}
      {showSCR && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" gutterBottom>
            Or Contact Speedy Credit Repair
          </Typography>
          <Typography variant="body2" color="text.secondary">
            We can help you through the process!
          </Typography>
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2">
              <PhoneIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
              {SCR_CONTACT.phone}
            </Typography>
            <Typography variant="body2">
              📧 {SCR_CONTACT.email}
            </Typography>
          </Box>
        </>
      )}
    </Paper>
  );
};

// ============================================================================
// QUESTION TIMER COMPONENT
// ============================================================================

const QuestionTimer = ({ timeLimit = 120, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState(timeLimit);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (onExpire) onExpire();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onExpire]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = (timeLeft / timeLimit) * 100;

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
        <ScheduleIcon fontSize="small" color={timeLeft < 30 ? 'error' : 'action'} />
        <Typography
          variant="body2"
          color={timeLeft < 30 ? 'error.main' : 'text.secondary'}
          fontWeight={timeLeft < 30 ? 'bold' : 'normal'}
        >
          Time remaining: {minutes}:{seconds.toString().padStart(2, '0')}
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={progress}
        color={timeLeft < 30 ? 'error' : 'primary'}
        sx={{ height: 6, borderRadius: 3 }}
      />
    </Box>
  );
};

// ============================================================================
// MAIN SECURITY QUESTION HELPER COMPONENT
// ============================================================================

const SecurityQuestionHelper = ({
  questionType = 'other',
  showProTip = true,
  showTimer = false,
  timeLimit = 120,
  onTimerExpire,
  onGetReport,
  onContinue,
  onDismissTip,
  showIDIQContact = false,
  compact = false,
}) => {
  const [tipDismissed, setTipDismissed] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);

  const questionInfo = QUESTION_TYPES[questionType] || QUESTION_TYPES.other;

  const handleDismissTip = useCallback(() => {
    setTipDismissed(true);
    if (onDismissTip) onDismissTip();
  }, [onDismissTip]);

  if (compact) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Chip
          icon={<TipIcon />}
          label={`${questionInfo.icon} ${questionInfo.title}`}
          size="small"
          color="warning"
          variant="outlined"
        />
        <IconButton
          size="small"
          onClick={() => setShowContactDialog(true)}
        >
          <HelpIcon fontSize="small" />
        </IconButton>

        <Dialog open={showContactDialog} onClose={() => setShowContactDialog(false)}>
          <DialogTitle>Need Help?</DialogTitle>
          <DialogContent>
            <IDIQContactCard />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowContactDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  return (
    <Box>
      {/* Pro Tip Banner */}
      {showProTip && !tipDismissed && (
        <ProTipBanner
          onDismiss={handleDismissTip}
          onGetReport={onGetReport}
          onContinue={onContinue}
        />
      )}

      {/* Timer */}
      {showTimer && (
        <QuestionTimer timeLimit={timeLimit} onExpire={onTimerExpire} />
      )}

      {/* Question-specific tips */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography variant="h6">{questionInfo.icon}</Typography>
          <Typography variant="subtitle2" fontWeight="bold">
            Tips for {questionInfo.title}
          </Typography>
        </Box>

        <List dense disablePadding>
          {questionInfo.tips.map((tip, index) => (
            <ListItem key={index} disablePadding sx={{ py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 28 }}>
                <TipIcon fontSize="small" color="warning" />
              </ListItemIcon>
              <ListItemText
                primary={tip}
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
          ))}
        </List>

        {/* "None of the above" reminder */}
        <Alert severity="info" sx={{ mt: 2 }}>
          <AlertTitle>Remember</AlertTitle>
          <Typography variant="body2">
            "None of the above" is often the correct answer!
            Security questions sometimes include fake options to verify your identity.
          </Typography>
        </Alert>
      </Paper>

      {/* IDIQ Contact */}
      {showIDIQContact && <IDIQContactCard />}
    </Box>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export {
  ProTipBanner,
  IDIQContactCard,
  QuestionTimer,
  CREDIT_REPORT_SOURCES,
  QUESTION_TYPES,
};

export default SecurityQuestionHelper;
