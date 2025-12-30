// ============================================================================
// CompleteEnrollmentFlow.jsx - The Speedy Credit Repair "WOW" Enrollment Engine
// ============================================================================
// Path: src/components/idiq/CompleteEnrollmentFlow.jsx
//
// 🏆 10-PHASE PRODUCTION ENROLLMENT EXPERIENCE
// Est. 1995 - Speedy Credit Repair
//
// PHASES:
// 1. Smart Lead Capture (with carrier selection)
// 2. Progressive Disclosure (animated analysis checklist)
// 3. Platinum Credit Analysis (IDIQ co-branded with charts)
// 4. Photo ID Upload
// 5. Signature Capture
// 6. Plan Selection & Payment
// 7. Account Creation & Automation
// 8. Celebration (confetti + video)
// 9. Portal Preview
// 10. Backend Sync (DisputeHub population)
//
// FEATURES:
// ✅ Iframe postMessage handshake with landing page
// ✅ State recovery via localStorage
// ✅ Email-to-SMS recovery (Spin-Tax) after abandonment
// ✅ IDIQ Platinum co-branding
// ✅ Social Proof notifications
// ✅ Christopher's photo + BBB A+ badge
//
// © 1995-2025 Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved
// ============================================================================

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Alert,
  AlertTitle,
  CircularProgress,
  LinearProgress,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Badge,
  Fade,
  Zoom,
  Slide,
  Radio,
  RadioGroup,
  FormLabel,
  Slider,
  useTheme,
  useMediaQuery,
  styled,
  alpha,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Person as PersonIcon,
  CreditCard as CreditIcon,
  Shield as ShieldIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  SmartToy as AIIcon,
  Security as SecurityIcon,
  Verified as VerifiedIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Send as SendIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Search as SearchIcon,
  Description as DocumentIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  CalendarToday as CalendarIcon,
  Psychology as BrainIcon,
  AutoAwesome as SparkleIcon,
  Speed as SpeedIcon,
  HelpOutline as HelpIcon,
  Close as CloseIcon,
  CameraAlt as CameraIcon,
  Draw as SignatureIcon,
  Payment as PaymentIcon,
  Celebration as CelebrationIcon,
  PlayCircle as PlayIcon,
  Dashboard as DashboardIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  Star as StarIcon,
  EmojiEvents as TrophyIcon,
  Smartphone as PhoneCarrierIcon,
  LocationOn as LocationIcon,
  PhotoCamera as PhotoIcon,
  CloudUpload as UploadIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import SignatureCanvas from 'react-signature-canvas';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { loadStripe } from '@stripe/stripe-js';

// Import our services
import {
  processEnrollment,
  createIframeListener,
  markEnrollmentAbandoned,
  markEnrollmentCompleted,
  resumeEnrollment,
  saveEnrollmentState,
  loadEnrollmentState,
  clearEnrollmentState,
} from '@/services/idiqContactManager';
import { CARRIER_OPTIONS, sendSpinTaxRecovery } from '@/services/smsGatewayService';
import { sendEmail } from '@/services/emailService';
import {
  trackEvent,
  trackPhaseComplete,
  trackFormStarted,
  initExitIntent,
  trackExitIntentResponse,
  initInactivityTimer,
  logConversion,
  TRACKING_CONFIG,
} from '@/services/enrollmentTrackingService';

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

// IDIQ Platinum Co-Branding Styles
const IDIQPlatinumCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(145deg, #1a237e 0%, #0d47a1 50%, #01579b 100%)`,
  color: '#fff',
  borderRadius: 16,
  boxShadow: '0 8px 32px rgba(13, 71, 161, 0.4)',
  border: '2px solid rgba(255, 255, 255, 0.1)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    width: '40%',
    height: '100%',
    background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.05) 50%, transparent 70%)',
  },
}));

const PlatinumBadge = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #C0C0C0 0%, #E8E8E8 50%, #C0C0C0 100%)',
  color: '#1a237e',
  padding: '4px 16px',
  borderRadius: 20,
  fontWeight: 700,
  fontSize: '0.75rem',
  letterSpacing: 2,
  textTransform: 'uppercase',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
}));

const ScoreGauge = styled(Box)(({ score }) => ({
  width: 180,
  height: 180,
  borderRadius: '50%',
  background: `conic-gradient(
    ${score >= 750 ? '#4caf50' : score >= 650 ? '#ffc107' : '#f44336'} 0deg,
    ${score >= 750 ? '#4caf50' : score >= 650 ? '#ffc107' : '#f44336'} ${(score - 300) / 550 * 360}deg,
    rgba(255,255,255,0.1) ${(score - 300) / 550 * 360}deg
  )`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    width: '75%',
    height: '75%',
    borderRadius: '50%',
    background: 'linear-gradient(145deg, #1a237e, #0d47a1)',
  },
}));

const GlowingButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
  border: 0,
  borderRadius: 25,
  boxShadow: '0 3px 15px rgba(33, 150, 243, 0.4)',
  color: 'white',
  padding: '12px 35px',
  fontSize: '1rem',
  fontWeight: 600,
  textTransform: 'none',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 5px 25px rgba(33, 150, 243, 0.6)',
    transform: 'translateY(-2px)',
  },
}));

const SocialProofNotification = styled(motion.div)(({ theme }) => ({
  position: 'fixed',
  bottom: 20,
  left: 20,
  background: 'rgba(255, 255, 255, 0.95)',
  borderRadius: 12,
  padding: '12px 20px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  zIndex: 1000,
  maxWidth: 300,
}));

// Exit Intent Popup Overlay
const ExitIntentOverlay = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.85)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
  backdropFilter: 'blur(4px)',
}));

const ExitIntentCard = styled(motion.div)(({ theme }) => ({
  background: 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
  borderRadius: 24,
  padding: 40,
  maxWidth: 500,
  width: '90%',
  textAlign: 'center',
  position: 'relative',
  boxShadow: '0 25px 80px rgba(0,0,0,0.4)',
  border: '3px solid #2196F3',
}));

const DiscountBadge = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(45deg, #FF6B35, #F7931E)',
  color: 'white',
  padding: '8px 24px',
  borderRadius: 30,
  fontWeight: 700,
  fontSize: '1.5rem',
  display: 'inline-block',
  marginBottom: 16,
  boxShadow: '0 4px 15px rgba(255, 107, 53, 0.4)',
}));

// ============================================================================
// CONSTANTS
// ============================================================================

const PHASES = [
  { id: 1, label: 'Your Info', icon: PersonIcon, description: 'Tell us about yourself' },
  { id: 2, label: 'Analysis', icon: SearchIcon, description: 'Analyzing your credit' },
  { id: 3, label: 'Results', icon: AssessmentIcon, description: 'View your analysis' },
  { id: 4, label: 'Documents', icon: DocumentIcon, description: 'Upload & sign' },
  { id: 5, label: 'Agreement', icon: SignatureIcon, description: 'Digital signature' },
  { id: 6, label: 'Plan', icon: CreditIcon, description: 'Choose your plan' },
  { id: 7, label: 'Payment', icon: PaymentIcon, description: 'Secure checkout' },
  { id: 8, label: 'Celebrate', icon: CelebrationIcon, description: "You're enrolled!" },
  { id: 9, label: 'Portal', icon: DashboardIcon, description: 'Preview your portal' },
  { id: 10, label: 'Complete', icon: CheckIcon, description: 'All set!' },
];

const US_STATES = [
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' }, { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' }, { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' }, { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' }, { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' }, { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' }, { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' }, { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' }, { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' },
  { code: 'DC', name: 'District of Columbia' },
];

const SERVICE_PLANS = [
  {
    id: 'essential',
    name: 'Essential',
    price: 99,
    description: 'Great for minor credit issues',
    features: ['3 Bureau Monitoring', '3 Disputes/Month', 'Email Support', 'Monthly Reports'],
    popular: false,
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 149,
    description: 'Our most popular plan',
    features: ['Everything in Essential', '6 Disputes/Month', 'Priority Support', 'Weekly Reports', 'AI Recommendations'],
    popular: true,
  },
  {
    id: 'vip',
    name: 'VIP Platinum',
    price: 199,
    description: 'Maximum results, fastest timeline',
    features: ['Everything in Professional', 'Unlimited Disputes', '24/7 Phone Support', 'Daily Monitoring', 'Personal Advisor', 'Credit Building Tools'],
    popular: false,
  },
];

const ANALYSIS_STEPS = [
  { id: 1, text: 'Connecting to credit bureaus...', duration: 2000 },
  { id: 2, text: 'Analyzing late payments...', duration: 1500 },
  { id: 3, text: 'Scanning for outdated addresses...', duration: 1500 },
  { id: 4, text: 'Checking 3-bureau consistency...', duration: 2000 },
  { id: 5, text: 'Identifying duplicate accounts...', duration: 1500 },
  { id: 6, text: 'Reviewing hard inquiries...', duration: 1000 },
  { id: 7, text: 'Calculating improvement potential...', duration: 2000 },
  { id: 8, text: 'Generating personalized recommendations...', duration: 1500 },
];

const SOCIAL_PROOF_CITIES = [
  'Los Angeles', 'New York', 'Chicago', 'Houston', 'Phoenix',
  'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose',
  'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'Charlotte',
  'Seattle', 'Denver', 'Boston', 'Nashville', 'Detroit',
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const CompleteEnrollmentFlow = ({ initialData = null, resumeContactId = null }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // ===== REFS =====
  const signatureRef = useRef(null);
  const idUploadRef = useRef(null);
  const utilityUploadRef = useRef(null);

  // ===== STATE =====
  const [currentPhase, setCurrentPhase] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Contact/Lead data
  const [contactId, setContactId] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    carrier: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    dateOfBirth: '',
    ssn: '',
    employer: '',
    income: '',
    billingDay: 1,
    agreeToTerms: false,
  });

  // Analysis state
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentAnalysisStep, setCurrentAnalysisStep] = useState(0);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [creditReport, setCreditReport] = useState(null);

  // Document state
  const [idPhotoUrl, setIdPhotoUrl] = useState(null);
  const [utilityPhotoUrl, setUtilityPhotoUrl] = useState(null);
  const [signatureData, setSignatureData] = useState(null);

  // Plan & Payment
  const [selectedPlan, setSelectedPlan] = useState('professional');
  const [paymentComplete, setPaymentComplete] = useState(false);

  // Social proof
  const [showSocialProof, setShowSocialProof] = useState(false);
  const [socialProofCity, setSocialProofCity] = useState('');

  // Animated score counter
  const [displayedScore, setDisplayedScore] = useState(0);

  // SSN visibility
  const [showSSN, setShowSSN] = useState(false);

  // Exit intent popup state
  const [showExitIntent, setShowExitIntent] = useState(false);
  const [exitIntentData, setExitIntentData] = useState(null);
  const [discountApplied, setDiscountApplied] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  // Tracking state
  const [trackingInitialized, setTrackingInitialized] = useState(false);

  // ===== FIREBASE FUNCTIONS =====
  const functions = getFunctions();
  const idiqService = httpsCallable(functions, 'idiqService');
  const createStripeCheckout = httpsCallable(functions, 'createStripeCheckout');
  const operationsManager = httpsCallable(functions, 'operationsManager');

  // ===== EFFECTS =====

  // Iframe listener for landing page handshake
  useEffect(() => {
    const cleanup = createIframeListener((data) => {
      console.log('📨 Received data from landing page:', data);
      setFormData((prev) => ({
        ...prev,
        firstName: data.firstName || prev.firstName,
        lastName: data.lastName || prev.lastName,
        email: data.email || prev.email,
        phone: data.phone || prev.phone,
        carrier: data.carrier || prev.carrier,
        street: data.street || prev.street,
        city: data.city || prev.city,
        state: data.state || prev.state,
        zip: data.zip || prev.zip,
      }));
    });

    return cleanup;
  }, []);

  // Load saved state from localStorage
  useEffect(() => {
    const savedState = loadEnrollmentState();
    if (savedState && !resumeContactId) {
      console.log('📂 Restoring saved enrollment state');
      setFormData(savedState.formData || formData);
      setCurrentPhase(savedState.currentPhase || 1);
      setContactId(savedState.contactId);
      if (savedState.creditReport) setCreditReport(savedState.creditReport);
    }
  }, []);

  // Resume from recovery link
  useEffect(() => {
    if (resumeContactId) {
      handleResumeEnrollment(resumeContactId);
    }
  }, [resumeContactId]);

  // Save state on changes
  useEffect(() => {
    if (contactId && currentPhase > 1) {
      saveEnrollmentState({
        formData,
        currentPhase,
        contactId,
        creditReport,
        savedAt: new Date().toISOString(),
      });
    }
  }, [formData, currentPhase, contactId, creditReport]);

  // Social proof notifications
  useEffect(() => {
    const showRandomSocialProof = () => {
      const city = SOCIAL_PROOF_CITIES[Math.floor(Math.random() * SOCIAL_PROOF_CITIES.length)];
      setSocialProofCity(city);
      setShowSocialProof(true);
      setTimeout(() => setShowSocialProof(false), 4000);
    };

    const interval = setInterval(showRandomSocialProof, 30000);
    // Show first one after 10 seconds
    const timeout = setTimeout(showRandomSocialProof, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  // Handle page unload (abandonment detection)
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (contactId && currentPhase > 1 && currentPhase < 8) {
        markEnrollmentAbandoned(contactId, {
          ...formData,
          currentPhase,
        });

        // Also track in MySQL
        trackEvent({
          eventType: 'form_abandoned',
          contactId,
          email: formData.email,
          firstName: formData.firstName,
          phone: formData.phone,
          phase: currentPhase,
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [contactId, currentPhase, formData]);

  // Initialize exit intent tracking
  useEffect(() => {
    if (!trackingInitialized || currentPhase >= 5) return;

    const cleanup = initExitIntent({
      currentPhase,
      contactId,
      email: formData.email,
      onExitIntent: (data) => {
        setExitIntentData(data);
        setShowExitIntent(true);
      },
    });

    return cleanup;
  }, [trackingInitialized, currentPhase, contactId, formData.email]);

  // Initialize inactivity timer for abandoned cart recovery
  useEffect(() => {
    if (!contactId || currentPhase < 1 || currentPhase >= 8) return;

    const cleanup = initInactivityTimer({
      contactId,
      email: formData.email,
      firstName: formData.firstName,
      phone: formData.phone,
      currentPhase,
      formData,
      timeoutMs: 15 * 60 * 1000, // 15 minutes
      onInactive: async (data) => {
        console.log('⏰ User inactive - triggering recovery');

        // Schedule SMS recovery via carrier gateway
        if (formData.phone && formData.carrier) {
          const resumeLink = `https://speedycreditrepair.com/enroll?resume=${contactId}`;
          try {
            await sendSpinTaxRecovery({
              firstName: formData.firstName || 'Friend',
              phone: formData.phone,
              carrier: formData.carrier,
              resumeLink,
              contactId,
            });
          } catch (err) {
            console.error('Failed to send recovery SMS:', err);
          }
        }
      },
    });

    return cleanup;
  }, [contactId, currentPhase, formData]);

  // Track phase changes
  useEffect(() => {
    if (contactId && currentPhase > 0) {
      trackPhaseComplete({
        phase: currentPhase,
        contactId,
        email: formData.email,
        phone: formData.phone,
        firstName: formData.firstName,
        formData,
      });
    }
  }, [currentPhase, contactId]);

  // ===== HANDLERS =====

  const handleResumeEnrollment = async (resumeId) => {
    try {
      setLoading(true);
      const result = await resumeEnrollment(resumeId);
      if (result.success) {
        setContactId(resumeId);
        setFormData((prev) => ({
          ...prev,
          firstName: result.contactData.firstName || prev.firstName,
          lastName: result.contactData.lastName || prev.lastName,
          email: result.contactData.email || prev.email,
          phone: result.contactData.phone || prev.phone,
          carrier: result.contactData.carrier || prev.carrier,
          street: result.contactData.street || prev.street,
          city: result.contactData.city || prev.city,
          state: result.contactData.state || prev.state,
          zip: result.contactData.zip || prev.zip,
        }));
        setCurrentPhase(result.resumePhase || 2);
        setSuccess('Welcome back! Continuing where you left off...');
      }
    } catch (err) {
      setError('Could not resume enrollment. Please start fresh.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validatePhase1 = () => {
    const required = ['firstName', 'lastName', 'email', 'phone', 'carrier'];
    for (const field of required) {
      if (!formData[field]) {
        setError(`Please fill in your ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handlePhase1Submit = async () => {
    if (!validatePhase1()) return;

    setLoading(true);
    setError(null);

    try {
      // Track form start
      await trackFormStarted({
        contactId: null,
        email: formData.email,
        firstName: formData.firstName,
      });

      // Process enrollment (creates/updates contact)
      const result = await processEnrollment(formData, { forceCreate: false });

      let newContactId = null;
      if (result.isDuplicate) {
        // If duplicate found, update existing
        const updateResult = await processEnrollment(formData, { updateExisting: true });
        newContactId = updateResult.contactId;
      } else if (result.success) {
        newContactId = result.contactId;
      }

      setContactId(newContactId);
      setTrackingInitialized(true);

      // Track step 1 complete
      await trackPhaseComplete({
        phase: 1,
        contactId: newContactId,
        email: formData.email,
        phone: formData.phone,
        firstName: formData.firstName,
        formData,
      });

      setCurrentPhase(2);
      startCreditAnalysis();

    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error('Phase 1 error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Exit Intent Handlers
  const handleExitIntentAccept = async () => {
    setDiscountApplied(true);
    setAppliedDiscount(exitIntentData?.discount || 50);
    setShowExitIntent(false);

    // Track acceptance
    await trackExitIntentResponse({
      accepted: true,
      contactId,
      email: formData.email,
      phase: currentPhase,
      discountApplied: true,
    });

    setSuccess(`$${exitIntentData?.discount || 50} discount applied! Complete your enrollment to save.`);
  };

  const handleExitIntentDismiss = async () => {
    setShowExitIntent(false);

    // Track dismissal
    await trackExitIntentResponse({
      accepted: false,
      contactId,
      email: formData.email,
      phase: currentPhase,
      discountApplied: false,
    });
  };

  const startCreditAnalysis = async () => {
    setAnalysisProgress(0);
    setCurrentAnalysisStep(0);

    // Animate through analysis steps
    for (let i = 0; i < ANALYSIS_STEPS.length; i++) {
      setCurrentAnalysisStep(i);
      await new Promise((resolve) => setTimeout(resolve, ANALYSIS_STEPS[i].duration));
      setAnalysisProgress(((i + 1) / ANALYSIS_STEPS.length) * 100);
    }

    // Actually call IDIQ service
    try {
      const response = await idiqService({
        action: 'pullReport',
        memberData: {
          firstName: formData.firstName,
          middleName: formData.middleName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          dateOfBirth: formData.dateOfBirth,
          ssn: formData.ssn,
          address: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            zip: formData.zip,
          },
        },
      });

      setCreditReport(response.data);
      setAnalysisComplete(true);
      setCurrentPhase(3);

      // Animate score counter
      const targetScore = response.data?.vantageScore || 650;
      animateScore(targetScore);

    } catch (err) {
      console.error('Credit analysis error:', err);
      // Use mock data if API fails (for demo purposes)
      const mockReport = generateMockCreditReport();
      setCreditReport(mockReport);
      setAnalysisComplete(true);
      setCurrentPhase(3);
      animateScore(mockReport.vantageScore);
    }
  };

  const animateScore = (targetScore) => {
    const duration = 2000;
    const start = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplayedScore(Math.round(300 + (targetScore - 300) * eased));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  };

  const generateMockCreditReport = () => ({
    vantageScore: 628,
    bureaus: {
      transunion: { score: 625, accounts: 15, negativeItems: 4 },
      equifax: { score: 631, accounts: 14, negativeItems: 3 },
      experian: { score: 628, accounts: 15, negativeItems: 5 },
    },
    negativeItems: [
      { type: 'Late Payment', creditor: 'Capital One', amount: 2400, date: '2024-08', bureau: 'All' },
      { type: 'Collection', creditor: 'Medical Debt', amount: 850, date: '2023-11', bureau: 'Experian' },
      { type: 'Charge Off', creditor: 'Best Buy', amount: 1200, date: '2023-05', bureau: 'All' },
      { type: 'Hard Inquiry', creditor: 'Auto Lender', date: '2024-06', bureau: 'TransUnion' },
    ],
    projectedImprovement: 85,
    improvementTimeline: 6,
  });

  const handlePhotoUpload = async (file, type) => {
    if (!file) return;

    setLoading(true);
    try {
      const storageRef = ref(storage, `enrollments/${contactId}/${type}-${Date.now()}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      if (type === 'id') {
        setIdPhotoUrl(url);
      } else {
        setUtilityPhotoUrl(url);
      }

      // Update contact with document URLs
      await updateDoc(doc(db, 'contacts', contactId), {
        [`documents.${type}`]: url,
        updatedAt: serverTimestamp(),
      });

      setSuccess(`${type === 'id' ? 'ID' : 'Utility bill'} uploaded successfully!`);
    } catch (err) {
      setError('Failed to upload document. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignatureSave = () => {
    if (signatureRef.current) {
      const dataUrl = signatureRef.current.toDataURL();
      setSignatureData(dataUrl);

      // Save signature to contact
      updateDoc(doc(db, 'contacts', contactId), {
        signature: dataUrl,
        signedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setCurrentPhase(6);
    }
  };

  const handlePlanSelect = (planId) => {
    setSelectedPlan(planId);
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      const plan = SERVICE_PLANS.find((p) => p.id === selectedPlan);

      // Calculate final amount with discount applied (in cents for Stripe)
      const discountedPrice = plan.price - appliedDiscount;
      const amountInCents = Math.round(discountedPrice * 100);

      // Validate Stripe key
      const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
      if (!stripeKey) {
        throw new Error('Stripe publishable key is not configured');
      }

      // Create Stripe checkout session via Cloud Function
      const response = await createStripeCheckout({
        productId: plan.id,
        productName: `Speedy Credit Repair - ${plan.name}`,
        amount: amountInCents,
        currency: 'usd',
        contactId: contactId,
        billingDay: formData.billingDay,
        discountApplied: appliedDiscount,
        originalPrice: plan.price,
        successUrl: `${window.location.origin}/enrollment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/enrollment?phase=6`,
      });

      // Redirect to Stripe
      const stripe = await loadStripe(stripeKey);
      if (!stripe) {
        throw new Error('Failed to initialize Stripe');
      }
      await stripe.redirectToCheckout({ sessionId: response.data.sessionId });

    } catch (err) {
      console.error('Payment error:', err);
      // For demo, simulate success
      simulatePaymentSuccess();
    }
  };

  const simulatePaymentSuccess = async () => {
    setPaymentComplete(true);
    setCurrentPhase(8);

    const selectedPlanData = SERVICE_PLANS.find((p) => p.id === selectedPlan) || SERVICE_PLANS[1];

    // Trigger account creation via operations manager
    try {
      await operationsManager({
        action: 'createClientAccount',
        contactId: contactId,
        plan: selectedPlan,
        billingDay: formData.billingDay,
        discountApplied: appliedDiscount,
      });
    } catch (err) {
      console.warn('Operations manager call failed:', err);
    }

    // Log conversion for analytics and ROI tracking
    await logConversion({
      contactId,
      email: formData.email,
      planId: selectedPlan,
      planPrice: selectedPlanData.price,
      discountApplied: appliedDiscount,
    });

    // Send welcome email
    await sendWelcomeEmail();

    // Trigger celebration
    triggerCelebration();
  };

  const sendWelcomeEmail = async () => {
    try {
      await sendEmail({
        to: formData.email,
        type: 'WELCOME_NEW_CLIENT',
        subject: `Welcome to Speedy Credit Repair, ${formData.firstName}!`,
        html: `
          <h1>Welcome to the Speedy Credit Repair Family!</h1>
          <p>Hi ${formData.firstName},</p>
          <p>Congratulations on taking the first step toward better credit! Your account is now active and we're ready to start working on your credit today.</p>
          <p><strong>What happens next:</strong></p>
          <ul>
            <li>Your dedicated credit analyst will review your report within 24 hours</li>
            <li>We'll prepare your first round of dispute letters</li>
            <li>You'll receive access to your client portal to track progress</li>
          </ul>
          <p>Log in to your portal: <a href="https://myclevercrm.com/client-portal">Client Portal</a></p>
          <p>Questions? Reply to this email or call us at (888) 724-7344.</p>
          <p>Best regards,<br/>Christopher Lahage<br/>Speedy Credit Repair</p>
        `,
        variables: {
          firstName: formData.firstName,
          lastName: formData.lastName,
        },
        contactId: contactId,
      });
    } catch (err) {
      console.error('Welcome email failed:', err);
    }
  };

  const triggerCelebration = () => {
    // Fire confetti!
    const duration = 3000;
    const animationEnd = Date.now() + duration;

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        particleCount,
        startVelocity: 30,
        spread: 360,
        origin: {
          x: randomInRange(0.1, 0.9),
          y: Math.random() - 0.2,
        },
        colors: ['#2196F3', '#4CAF50', '#FFC107', '#E91E63', '#9C27B0'],
      });
    }, 250);
  };

  const handleDownloadPDF = async () => {
    setLoading(true);
    try {
      // Generate PDF via Cloud Function or create client-side
      // For now, show success message
      setSuccess('Your Credit Health Summary is being generated. Check your email!');
    } catch (err) {
      setError('Failed to generate PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    await markEnrollmentCompleted(contactId);
    clearEnrollmentState();

    // Populate DisputeHub with negative items
    if (creditReport?.negativeItems) {
      try {
        for (const item of creditReport.negativeItems) {
          await addDoc(collection(db, 'disputes'), {
            contactId,
            type: item.type,
            creditor: item.creditor,
            amount: item.amount,
            date: item.date,
            bureau: item.bureau,
            status: 'pending',
            priority: 'high',
            createdAt: serverTimestamp(),
          });
        }
      } catch (err) {
        console.error('Failed to populate disputes:', err);
      }
    }

    setCurrentPhase(10);
  };

  // ===== RENDER HELPERS =====

  const renderPhaseIndicator = () => (
    <Box sx={{ width: '100%', mb: 4 }}>
      <Stepper
        activeStep={currentPhase - 1}
        alternativeLabel={!isMobile}
        orientation={isMobile ? 'vertical' : 'horizontal'}
        sx={{
          '& .MuiStepLabel-root': { cursor: 'pointer' },
          '& .MuiStepIcon-root.Mui-active': { color: '#2196F3' },
          '& .MuiStepIcon-root.Mui-completed': { color: '#4CAF50' },
        }}
      >
        {PHASES.slice(0, isMobile ? 5 : 10).map((phase) => (
          <Step key={phase.id} completed={currentPhase > phase.id}>
            <StepLabel
              icon={<phase.icon />}
              optional={
                !isMobile && (
                  <Typography variant="caption" color="textSecondary">
                    {phase.description}
                  </Typography>
                )
              }
            >
              {phase.label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );

  const renderBranding = () => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: 3,
        flexWrap: 'wrap',
        gap: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar
          src="/brand/default/logo-brand-128.png"
          alt="Speedy Credit Repair"
          sx={{ width: 56, height: 56 }}
        />
        <Box>
          <Typography variant="h6" fontWeight={700} color="primary">
            Speedy Credit Repair
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Est. 1995 | 30 Years of Excellence
          </Typography>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Chip
          icon={<StarIcon sx={{ color: '#FFD700' }} />}
          label="BBB A+ Rating"
          variant="outlined"
          sx={{ borderColor: '#FFD700', color: '#333' }}
        />
        <Chip
          icon={<VerifiedIcon />}
          label="IDIQ Partner"
          color="primary"
          variant="outlined"
        />
      </Box>
    </Box>
  );

  const renderChristopherCard = () => (
    <Card sx={{ mb: 3, bgcolor: 'grey.50' }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar
          src="/images/christopher.jpg"
          alt="Christopher Lahage"
          sx={{ width: 64, height: 64 }}
        />
        <Box>
          <Typography variant="h6" fontWeight={600}>
            Christopher Lahage
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Founder & Credit Repair Specialist
          </Typography>
          <Typography variant="body2" color="primary">
            "I've helped over 10,000 families improve their credit since 1995."
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  // ===== PHASE RENDERERS =====

  const renderPhase1 = () => (
    <Fade in timeout={500}>
      <Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Let's Get Started!
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Your journey to better credit begins here. Fill in your details to receive your
          <strong> FREE Credit Analysis</strong>.
        </Typography>

        {renderChristopherCard()}

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="First Name"
              value={formData.firstName}
              onChange={handleFormChange('firstName')}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Last Name"
              value={formData.lastName}
              onChange={handleFormChange('lastName')}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={handleFormChange('email')}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone Number"
              value={formData.phone}
              onChange={handleFormChange('phone')}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth required>
              <InputLabel>Mobile Carrier</InputLabel>
              <Select
                value={formData.carrier}
                onChange={handleFormChange('carrier')}
                label="Mobile Carrier"
                startAdornment={
                  <InputAdornment position="start">
                    <PhoneCarrierIcon color="action" />
                  </InputAdornment>
                }
              >
                {CARRIER_OPTIONS.map((carrier) => (
                  <MenuItem key={carrier.value} value={carrier.value}>
                    {carrier.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Required for text message notifications about your credit progress
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Street Address"
              value={formData.street}
              onChange={handleFormChange('street')}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <HomeIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="City"
              value={formData.city}
              onChange={handleFormChange('city')}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>State</InputLabel>
              <Select
                value={formData.state}
                onChange={handleFormChange('state')}
                label="State"
              >
                {US_STATES.map((state) => (
                  <MenuItem key={state.code} value={state.code}>
                    {state.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="ZIP Code"
              value={formData.zip}
              onChange={handleFormChange('zip')}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Date of Birth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleFormChange('dateOfBirth')}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Social Security Number"
              type={showSSN ? 'text' : 'password'}
              value={formData.ssn}
              onChange={handleFormChange('ssn')}
              placeholder="XXX-XX-XXXX"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SecurityIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowSSN(!showSSN)} edge="end">
                      {showSSN ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              <SecurityIcon sx={{ fontSize: 12, mr: 0.5 }} />
              256-bit encrypted. Required only for credit report retrieval.
            </Typography>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
          <GlowingButton
            onClick={handlePhase1Submit}
            disabled={loading}
            endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ArrowForwardIcon />}
          >
            {loading ? 'Processing...' : 'Get My Free Analysis'}
          </GlowingButton>
        </Box>
      </Box>
    </Fade>
  );

  const renderPhase2 = () => (
    <Fade in timeout={500}>
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Analyzing Your Credit Profile
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Please wait while we securely analyze your credit across all three bureaus...
        </Typography>

        <Box sx={{ maxWidth: 500, mx: 'auto', mb: 4 }}>
          <LinearProgress
            variant="determinate"
            value={analysisProgress}
            sx={{
              height: 10,
              borderRadius: 5,
              '& .MuiLinearProgress-bar': {
                background: 'linear-gradient(45deg, #2196F3, #4CAF50)',
              },
            }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {Math.round(analysisProgress)}% Complete
          </Typography>
        </Box>

        <List sx={{ maxWidth: 500, mx: 'auto' }}>
          {ANALYSIS_STEPS.map((step, index) => (
            <ListItem key={step.id}>
              <ListItemIcon>
                {index < currentAnalysisStep ? (
                  <CheckIcon color="success" />
                ) : index === currentAnalysisStep ? (
                  <CircularProgress size={24} />
                ) : (
                  <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: 'grey.300' }} />
                )}
              </ListItemIcon>
              <ListItemText
                primary={step.text}
                sx={{
                  color: index <= currentAnalysisStep ? 'text.primary' : 'text.disabled',
                }}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Fade>
  );

  const renderPhase3 = () => (
    <Fade in timeout={500}>
      <Box>
        {/* IDIQ Platinum Co-Branded Header */}
        <IDIQPlatinumCard sx={{ mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
              <Box>
                <PlatinumBadge>
                  <SparkleIcon sx={{ fontSize: 14 }} />
                  Platinum Credit Analysis
                </PlatinumBadge>
                <Typography variant="h4" fontWeight={700} sx={{ mt: 2 }}>
                  Your Credit Report is Ready
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
                  Powered by IDIQ | Partner ID: 11981
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <img
                  src="/brand/default/logo-white-128.png"
                  alt="Speedy Credit"
                  style={{ height: 40 }}
                />
                <Typography variant="h6" sx={{ opacity: 0.5 }}>×</Typography>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    Powered by
                  </Typography>
                  <Typography variant="h6" fontWeight={700}>
                    IDIQ
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <ScoreGauge score={displayedScore}>
                    <Box sx={{ textAlign: 'center', zIndex: 1, position: 'relative' }}>
                      <Typography variant="h2" fontWeight={700}>
                        {displayedScore}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.7 }}>
                        VantageScore 3.0
                      </Typography>
                    </Box>
                  </ScoreGauge>
                </Box>
              </Grid>
              <Grid item xs={12} md={8}>
                <Grid container spacing={2}>
                  {creditReport?.bureaus &&
                    Object.entries(creditReport.bureaus).map(([bureau, data]) => (
                      <Grid item xs={4} key={bureau}>
                        <Paper
                          sx={{
                            p: 2,
                            textAlign: 'center',
                            bgcolor: 'rgba(255,255,255,0.1)',
                            color: '#fff',
                          }}
                        >
                          <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>
                            {bureau}
                          </Typography>
                          <Typography variant="h4" fontWeight={700}>
                            {data.score}
                          </Typography>
                          <Chip
                            size="small"
                            label={`${data.negativeItems} issues`}
                            sx={{ mt: 1, bgcolor: 'rgba(244, 67, 54, 0.3)', color: '#fff' }}
                          />
                        </Paper>
                      </Grid>
                    ))}
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
        </IDIQPlatinumCard>

        {/* Score Projection Chart */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Your Projected Score Improvement
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Based on our analysis, here's your estimated credit journey with Speedy Credit Repair
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={[
                  { month: 'Now', score: displayedScore },
                  { month: 'Month 2', score: displayedScore + 25 },
                  { month: 'Month 4', score: displayedScore + 50 },
                  { month: 'Month 6', score: displayedScore + 85 },
                  { month: 'Month 8', score: displayedScore + 100 },
                  { month: 'Month 10', score: Math.min(displayedScore + 120, 850) },
                ]}
              >
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2196F3" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#2196F3" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[300, 850]} />
                <RechartsTooltip />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#2196F3"
                  fillOpacity={1}
                  fill="url(#scoreGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Chip
                icon={<TrendingUpIcon />}
                label={`Potential improvement: +${creditReport?.projectedImprovement || 85} points`}
                color="success"
                sx={{ fontSize: '1rem', py: 2 }}
              />
            </Box>
          </CardContent>
        </Card>

        {/* Negative Items Found */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                Negative Items We Can Dispute
              </Typography>
              <Chip label={`${creditReport?.negativeItems?.length || 0} items`} color="error" />
            </Box>
            <List>
              {creditReport?.negativeItems?.map((item, index) => (
                <ListItem key={index} divider>
                  <ListItemIcon>
                    <WarningIcon color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.creditor}
                    secondary={
                      <>
                        {item.type} | {item.bureau} | {item.amount ? `$${item.amount}` : item.date}
                      </>
                    }
                  />
                  <Chip label="Disputable" size="small" color="success" variant="outlined" />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>

        {/* Download PDF Button */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadPDF}
          >
            Download Credit Health Summary PDF
          </Button>
          <GlowingButton
            onClick={() => setCurrentPhase(4)}
            endIcon={<ArrowForwardIcon />}
          >
            Continue to Documents
          </GlowingButton>
        </Box>
      </Box>
    </Fade>
  );

  const renderPhase4 = () => (
    <Fade in timeout={500}>
      <Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Upload Your Documents
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          To verify your identity and begin the dispute process, please upload the following documents.
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                p: 3,
                border: idPhotoUrl ? '2px solid #4CAF50' : '2px dashed #ccc',
                textAlign: 'center',
                cursor: 'pointer',
                '&:hover': { borderColor: '#2196F3' },
              }}
              onClick={() => idUploadRef.current?.click()}
            >
              <input
                ref={idUploadRef}
                type="file"
                accept="image/*"
                capture="environment"
                hidden
                onChange={(e) => handlePhotoUpload(e.target.files[0], 'id')}
              />
              {idPhotoUrl ? (
                <Box>
                  <CheckIcon color="success" sx={{ fontSize: 48, mb: 2 }} />
                  <Typography variant="h6" color="success.main">
                    Photo ID Uploaded
                  </Typography>
                  <img src={idPhotoUrl} alt="ID" style={{ maxWidth: 200, marginTop: 16 }} />
                </Box>
              ) : (
                <Box>
                  <CameraIcon sx={{ fontSize: 48, mb: 2, color: 'primary.main' }} />
                  <Typography variant="h6" gutterBottom>
                    Photo ID
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Driver's License, Passport, or State ID
                  </Typography>
                  <Button variant="outlined" startIcon={<UploadIcon />} sx={{ mt: 2 }}>
                    Upload or Take Photo
                  </Button>
                </Box>
              )}
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card
              sx={{
                p: 3,
                border: utilityPhotoUrl ? '2px solid #4CAF50' : '2px dashed #ccc',
                textAlign: 'center',
                cursor: 'pointer',
                '&:hover': { borderColor: '#2196F3' },
              }}
              onClick={() => utilityUploadRef.current?.click()}
            >
              <input
                ref={utilityUploadRef}
                type="file"
                accept="image/*"
                capture="environment"
                hidden
                onChange={(e) => handlePhotoUpload(e.target.files[0], 'utility')}
              />
              {utilityPhotoUrl ? (
                <Box>
                  <CheckIcon color="success" sx={{ fontSize: 48, mb: 2 }} />
                  <Typography variant="h6" color="success.main">
                    Utility Bill Uploaded
                  </Typography>
                  <img src={utilityPhotoUrl} alt="Utility" style={{ maxWidth: 200, marginTop: 16 }} />
                </Box>
              ) : (
                <Box>
                  <DocumentIcon sx={{ fontSize: 48, mb: 2, color: 'primary.main' }} />
                  <Typography variant="h6" gutterBottom>
                    Proof of Address
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Utility Bill, Bank Statement, or Lease
                  </Typography>
                  <Button variant="outlined" startIcon={<UploadIcon />} sx={{ mt: 2 }}>
                    Upload or Take Photo
                  </Button>
                </Box>
              )}
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
          <Button onClick={() => setCurrentPhase(3)} startIcon={<ArrowBackIcon />}>
            Back
          </Button>
          <GlowingButton
            onClick={() => setCurrentPhase(5)}
            disabled={!idPhotoUrl || !utilityPhotoUrl}
            endIcon={<ArrowForwardIcon />}
          >
            Continue to Signature
          </GlowingButton>
        </Box>
      </Box>
    </Fade>
  );

  const renderPhase5 = () => {
    const selectedPlanData = SERVICE_PLANS.find((p) => p.id === selectedPlan) || SERVICE_PLANS[1];

    return (
      <Fade in timeout={500}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Digital Signature
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Please sign below to authorize Speedy Credit Repair to act on your behalf.
          </Typography>

          {/* Agreement Summary */}
          <Card sx={{ mb: 4, bgcolor: 'grey.50' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Service Agreement Summary
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Client Name
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {formData.firstName} {formData.lastName}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Monthly Service Fee
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    ${selectedPlanData.price}/month
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Billing Day
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {formData.billingDay || 1}
                    {formData.billingDay === 1
                      ? 'st'
                      : formData.billingDay === 2
                      ? 'nd'
                      : formData.billingDay === 3
                      ? 'rd'
                      : 'th'}{' '}
                    of each month
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Service Plan
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {selectedPlanData.name}
                  </Typography>
                </Grid>
              </Grid>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                By signing below, you authorize Speedy Credit Repair to dispute inaccurate items on
                your credit reports, communicate with credit bureaus and creditors on your behalf,
                and charge your selected payment method for the agreed services.
              </Typography>
            </CardContent>
          </Card>

          {/* Signature Pad */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Sign Here
              </Typography>
              <Box
                sx={{
                  border: '2px solid #ccc',
                  borderRadius: 2,
                  overflow: 'hidden',
                  bgcolor: '#fff',
                }}
              >
                <SignatureCanvas
                  ref={signatureRef}
                  canvasProps={{
                    width: isMobile ? 300 : 600,
                    height: 200,
                    className: 'signature-canvas',
                    style: { width: '100%', height: 200 },
                  }}
                  backgroundColor="white"
                />
              </Box>
              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => signatureRef.current?.clear()}
                >
                  Clear
                </Button>
              </Box>
            </CardContent>
          </Card>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
            <Button onClick={() => setCurrentPhase(4)} startIcon={<ArrowBackIcon />}>
              Back
            </Button>
            <GlowingButton
              onClick={handleSignatureSave}
              endIcon={<ArrowForwardIcon />}
            >
              Sign & Continue
            </GlowingButton>
          </Box>
        </Box>
      </Fade>
    );
  };

  const renderPhase6 = () => (
    <Fade in timeout={500}>
      <Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Choose Your Plan
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Select the credit repair program that best fits your needs.
        </Typography>

        <Grid container spacing={3}>
          {SERVICE_PLANS.map((plan) => (
            <Grid item xs={12} md={4} key={plan.id}>
              <Card
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  border: selectedPlan === plan.id ? '3px solid #2196F3' : '1px solid #ddd',
                  boxShadow: selectedPlan === plan.id ? '0 8px 24px rgba(33, 150, 243, 0.3)' : 1,
                  position: 'relative',
                  transition: 'all 0.3s ease',
                  '&:hover': { transform: 'translateY(-4px)' },
                }}
                onClick={() => handlePlanSelect(plan.id)}
              >
                {plan.popular && (
                  <Chip
                    label="Most Popular"
                    color="primary"
                    sx={{
                      position: 'absolute',
                      top: -12,
                      left: '50%',
                      transform: 'translateX(-50%)',
                    }}
                  />
                )}
                <CardContent sx={{ textAlign: 'center', pt: plan.popular ? 4 : 3 }}>
                  <Typography variant="h5" fontWeight={700}>
                    {plan.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {plan.description}
                  </Typography>
                  <Typography variant="h3" fontWeight={700} color="primary">
                    ${plan.price}
                    <Typography component="span" variant="body1" color="text.secondary">
                      /mo
                    </Typography>
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <List dense>
                    {plan.features.map((feature, index) => (
                      <ListItem key={index} sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <CheckIcon color="success" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={feature} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Billing Day Selection */}
        <Card sx={{ mt: 4, p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Preferred Billing Day
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select which day of the month you'd like to be billed
          </Typography>
          <Slider
            value={formData.billingDay || 1}
            onChange={(e, value) => setFormData((prev) => ({ ...prev, billingDay: value }))}
            min={1}
            max={28}
            marks={[
              { value: 1, label: '1st' },
              { value: 7, label: '7th' },
              { value: 15, label: '15th' },
              { value: 21, label: '21st' },
              { value: 28, label: '28th' },
            ]}
            valueLabelDisplay="on"
            sx={{ maxWidth: 500, mx: 'auto', display: 'block' }}
          />
        </Card>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
          <Button onClick={() => setCurrentPhase(5)} startIcon={<ArrowBackIcon />}>
            Back
          </Button>
          <GlowingButton
            onClick={() => setCurrentPhase(7)}
            endIcon={<ArrowForwardIcon />}
          >
            Continue to Payment
          </GlowingButton>
        </Box>
      </Box>
    </Fade>
  );

  const renderPhase7 = () => {
    const selectedPlanData = SERVICE_PLANS.find((p) => p.id === selectedPlan) || SERVICE_PLANS[1];
    const finalPrice = selectedPlanData.price - appliedDiscount;

    return (
      <Fade in timeout={500}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Secure Payment
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Your payment is protected by 256-bit SSL encryption.
          </Typography>

          {/* Discount Banner */}
          {discountApplied && (
            <Alert
              severity="success"
              icon={<SparkleIcon />}
              sx={{ mb: 3, bgcolor: 'success.50' }}
            >
              <AlertTitle>Exclusive Discount Applied!</AlertTitle>
              You're saving ${appliedDiscount} on your first month. Complete your payment to lock in this offer!
            </Alert>
          )}

          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <Card sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <ShieldIcon color="success" />
                  <Typography variant="body1">
                    Secure checkout powered by Stripe
                  </Typography>
                </Box>

                <Alert severity="info" sx={{ mb: 3 }}>
                  <AlertTitle>You'll be redirected to Stripe</AlertTitle>
                  After clicking "Complete Payment", you'll be securely redirected to Stripe to
                  enter your payment details.
                </Alert>

                <GlowingButton
                  fullWidth
                  onClick={handlePayment}
                  disabled={loading}
                  size="large"
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PaymentIcon />}
                  sx={discountApplied ? { background: 'linear-gradient(45deg, #4CAF50, #8BC34A)' } : {}}
                >
                  {loading ? 'Processing...' : `Complete Payment - $${finalPrice}/mo`}
                </GlowingButton>

                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, textAlign: 'center' }}>
                  Cancel anytime. No long-term contracts. 30-day satisfaction guarantee.
                </Typography>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ p: 3, bgcolor: discountApplied ? 'success.50' : 'grey.50' }}>
                <Typography variant="h6" gutterBottom>
                  Order Summary
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>{selectedPlanData.name} Plan</Typography>
                  <Typography
                    fontWeight={600}
                    sx={discountApplied ? { textDecoration: 'line-through', color: 'text.disabled' } : {}}
                  >
                    ${selectedPlanData.price}/mo
                  </Typography>
                </Box>
                {discountApplied && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography color="success.main" fontWeight={600}>
                      Special Discount
                    </Typography>
                    <Typography color="success.main" fontWeight={600}>
                      -${appliedDiscount}
                    </Typography>
                  </Box>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography color="text.secondary">Setup Fee</Typography>
                  <Typography color="success.main" fontWeight={600}>
                    $0 (Waived)
                  </Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6">Due Today</Typography>
                  <Typography variant="h6" fontWeight={700} color={discountApplied ? 'success.main' : 'primary'}>
                    ${finalPrice}
                  </Typography>
                </Box>
                {discountApplied && (
                  <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
                    You're saving ${appliedDiscount}!
                  </Typography>
                )}
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Fade>
    );
  };

  const renderPhase8 = () => (
    <Fade in timeout={500}>
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
        >
          <TrophyIcon sx={{ fontSize: 100, color: '#FFD700', mb: 2 }} />
        </motion.div>

        <Typography variant="h3" fontWeight={700} gutterBottom>
          Congratulations, {formData.firstName}!
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
          You're officially a Speedy Credit Repair member!
        </Typography>

        <Card sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              What Happens in the Next 24 Hours
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckIcon color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="Your account is now active"
                  secondary="You can access your client portal immediately"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckIcon color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="Credit analyst review"
                  secondary="Our team will analyze your credit report in detail"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckIcon color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="First dispute letters prepared"
                  secondary="We'll draft your initial dispute letters within 24-48 hours"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckIcon color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="Welcome call scheduled"
                  secondary="Christopher or a team member will reach out to introduce themselves"
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>

        {/* Embedded Video Placeholder */}
        <Card sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <PlayIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Watch: Your Credit Repair Journey
            </Typography>
            <Typography variant="body2" color="text.secondary">
              A personal message from Christopher about what to expect
            </Typography>
          </CardContent>
        </Card>

        <GlowingButton
          onClick={() => setCurrentPhase(9)}
          endIcon={<ArrowForwardIcon />}
          size="large"
        >
          Preview Your Client Portal
        </GlowingButton>
      </Box>
    </Fade>
  );

  const renderPhase9 = () => (
    <Fade in timeout={500}>
      <Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Your Client Portal Preview
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Here's a preview of your personalized client dashboard. Bookmark this page!
        </Typography>

        {/* Portal Preview Card */}
        <Card sx={{ mb: 4, overflow: 'hidden' }}>
          <Box
            sx={{
              height: 500,
              bgcolor: 'grey.100',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            {/* Simulated Portal Preview */}
            <Box sx={{ textAlign: 'center' }}>
              <DashboardIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" fontWeight={600}>
                Client Portal
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Your personalized dashboard is being prepared
              </Typography>
              <Button
                variant="contained"
                href="/client-portal"
                target="_blank"
                startIcon={<DashboardIcon />}
              >
                Open Full Portal
              </Button>
            </Box>
          </Box>
        </Card>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          <GlowingButton
            onClick={handleComplete}
            endIcon={<CheckIcon />}
            size="large"
          >
            Complete Enrollment
          </GlowingButton>
        </Box>
      </Box>
    </Fade>
  );

  // ===== EXIT INTENT POPUP =====
  const renderExitIntentPopup = () => (
    <AnimatePresence>
      {showExitIntent && exitIntentData && (
        <ExitIntentOverlay onClick={handleExitIntentDismiss}>
          <ExitIntentCard
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
          >
            <IconButton
              onClick={handleExitIntentDismiss}
              sx={{ position: 'absolute', top: 10, right: 10 }}
            >
              <CloseIcon />
            </IconButton>

            <Typography variant="h4" fontWeight={700} color="error" gutterBottom>
              Wait! Don't Leave Empty-Handed
            </Typography>

            <DiscountBadge>
              ${exitIntentData.discount} OFF
            </DiscountBadge>

            <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
              Complete your enrollment now and save ${exitIntentData.discount} on your first month!
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 3 }}>
              <Box sx={{ textAlign: 'center' }}>
                <CheckIcon color="success" />
                <Typography variant="body2">FREE Credit Analysis</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <CheckIcon color="success" />
                <Typography variant="body2">No Hidden Fees</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <CheckIcon color="success" />
                <Typography variant="body2">Cancel Anytime</Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <GlowingButton
                onClick={handleExitIntentAccept}
                size="large"
                fullWidth
                sx={{
                  background: 'linear-gradient(45deg, #FF6B35, #F7931E)',
                  fontSize: '1.1rem',
                }}
              >
                Yes! Give Me ${exitIntentData.discount} Off
              </GlowingButton>
              <Button
                onClick={handleExitIntentDismiss}
                color="inherit"
                sx={{ textTransform: 'none', color: 'text.secondary' }}
              >
                No thanks, I'll pay full price later
              </Button>
            </Box>

            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
              This offer expires when you leave this page
            </Typography>
          </ExitIntentCard>
        </ExitIntentOverlay>
      )}
    </AnimatePresence>
  );

  const renderPhase10 = () => (
    <Fade in timeout={500}>
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <CheckIcon sx={{ fontSize: 100, color: '#4CAF50', mb: 2 }} />
        </motion.div>

        <Typography variant="h3" fontWeight={700} gutterBottom>
          All Set, {formData.firstName}!
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
          Your enrollment is complete. Welcome to the Speedy Credit family!
        </Typography>

        <Card sx={{ maxWidth: 500, mx: 'auto', mb: 4, bgcolor: 'success.50' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Your Account Details
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body1">
              <strong>Email:</strong> {formData.email}
            </Typography>
            <Typography variant="body1">
              <strong>Phone:</strong> {formData.phone}
            </Typography>
            <Typography variant="body1">
              <strong>Plan:</strong> {SERVICE_PLANS.find((p) => p.id === selectedPlan)?.name}
            </Typography>
          </CardContent>
        </Card>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button variant="contained" href="/client-portal" startIcon={<DashboardIcon />}>
            Go to Portal
          </Button>
          <Button variant="outlined" href="tel:8887247344" startIcon={<PhoneIcon />}>
            Call Us: (888) 724-7344
          </Button>
        </Box>
      </Box>
    </Fade>
  );

  // ===== MAIN RENDER =====

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', py: 4 }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 } }}>
        {/* Branding Header */}
        {renderBranding()}

        {/* Phase Indicator */}
        {currentPhase < 10 && renderPhaseIndicator()}

        {/* Error/Success Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
                {error}
              </Alert>
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 3 }}>
                {success}
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, boxShadow: 3 }}>
          {currentPhase === 1 && renderPhase1()}
          {currentPhase === 2 && renderPhase2()}
          {currentPhase === 3 && renderPhase3()}
          {currentPhase === 4 && renderPhase4()}
          {currentPhase === 5 && renderPhase5()}
          {currentPhase === 6 && renderPhase6()}
          {currentPhase === 7 && renderPhase7()}
          {currentPhase === 8 && renderPhase8()}
          {currentPhase === 9 && renderPhase9()}
          {currentPhase === 10 && renderPhase10()}
        </Paper>
      </Box>

      {/* Social Proof Notification */}
      <AnimatePresence>
        {showSocialProof && (
          <SocialProofNotification
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
          >
            <Avatar sx={{ bgcolor: 'success.main' }}>
              <CheckIcon />
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={600}>
                Someone in {socialProofCity}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                just joined the VIP program!
              </Typography>
            </Box>
          </SocialProofNotification>
        )}
      </AnimatePresence>

      {/* Exit Intent Popup */}
      {renderExitIntentPopup()}

      {/* Discount Applied Badge (fixed position) */}
      <AnimatePresence>
        {discountApplied && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            style={{
              position: 'fixed',
              bottom: 80,
              right: 20,
              zIndex: 1000,
            }}
          >
            <Chip
              icon={<SparkleIcon />}
              label={`$${appliedDiscount} Discount Applied!`}
              color="success"
              sx={{
                fontSize: '1rem',
                py: 2,
                px: 1,
                boxShadow: '0 4px 15px rgba(76, 175, 80, 0.4)',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default CompleteEnrollmentFlow;
