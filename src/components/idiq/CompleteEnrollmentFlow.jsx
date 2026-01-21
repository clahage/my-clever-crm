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
// ✅ DUAL MODE: Public (landing page) + CRM (staff enrollment)
// ✅ AutoSave every 30 seconds with session recovery
// ✅ CRM pre-fill from Firestore contact
// ✅ Connection monitoring (online/offline)
// ✅ 3-tier verification failure escalation with AI helpers
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
  Link,
  Badge,
  Fade,
  Zoom,
  Slide,
  Radio,
  RadioGroup,
  FormLabel,
  Slider,
  Snackbar,
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
  Save as SaveIcon,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
  Restore as RestoreIcon,
  Business as BusinessIcon,
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
import { collection, addDoc, doc, updateDoc, getDoc, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from '@/lib/firebase';
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
  logConversion
} from '@/services/enrollmentTrackingService';
import ViewCreditReportButton from '../credit/ViewCreditReportButton';

// ===== PHONE CORRUPTION DETECTION IMPORTS =====
import { 
  detectAndCorrectPhoneCorruption,
  processContactPhoneData,
  processLandingPageData,
  getPhoneForIDIQEnrollment,
  createPhoneCorrectionNotification,
  trackPhoneCorruption
} from '@/utils/phoneCorruptionFix';

// ============================================================================
// AUTOSAVE CONSTANTS
// ============================================================================
const AUTOSAVE_INTERVAL = 30000; // 30 seconds
const AUTOSAVE_KEY = 'speedycrm_enrollment_autosave';
const SESSION_EXPIRY_HOURS = 24;

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

// AutoSave Indicator
const AutoSaveIndicator = styled(Box)(({ theme }) => ({
  position: 'fixed',
  bottom: 20,
  right: 20,
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '8px 16px',
  borderRadius: 20,
  background: theme.palette.mode === 'dark' ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
  boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
  border: `1px solid ${theme.palette.divider}`,
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

// CRM Mode uses fewer phases (skips welcome screens)
const CRM_PHASES = [
  { id: 1, label: 'Client Info', icon: PersonIcon, description: 'Verify details' },
  { id: 2, label: 'Analysis', icon: SearchIcon, description: 'Pull credit report' },
  { id: 3, label: 'Results', icon: AssessmentIcon, description: 'Review report' },
  { id: 4, label: 'Documents', icon: DocumentIcon, description: 'Upload docs' },
  { id: 5, label: 'Agreement', icon: SignatureIcon, description: 'Digital signature' },
  { id: 6, label: 'Plan', icon: CreditIcon, description: 'Select plan' },
  { id: 7, label: 'Complete', icon: CheckIcon, description: 'Finalize' },
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
    id: 'diy',
    name: 'DIY Credit Repair',
    price: 39,
    description: 'Tools & templates for self-repair',
    features: ['Dispute Letter Templates', 'Credit Education Portal', 'Email Support', 'Monthly Score Updates'],
    popular: false,
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 149,
    description: 'Our most popular plan',
    features: ['Everything in DIY', '6 Disputes/Month', 'Priority Support', 'Weekly Reports', 'AI Recommendations'],
    popular: true,
  },
  {
    id: 'acceleration',
    name: 'Acceleration',
    price: 199,
    description: 'Faster results, more disputes',
    features: ['Everything in Standard', '12 Disputes/Month', 'Dedicated Analyst', 'Bi-Weekly Calls', 'Rush Processing'],
    popular: false,
  },
  {
    id: 'premium',
    name: 'VIP Premium',
    price: 349,
    description: 'Maximum results, fastest timeline',
    features: ['Everything in Acceleration', 'Unlimited Disputes', '24/7 Phone Support', 'Daily Monitoring', 'Personal Advisor', 'Credit Building Tools'],
    popular: false,
  },
  {
    id: 'hybrid',
    name: 'Hybrid',
    price: 99,
    description: 'Mix of DIY + professional help',
    features: ['DIY Tools', '3 Professional Disputes/Month', 'Monthly Strategy Call', 'Email Support'],
    popular: false,
  },
  {
    id: 'payfordelete',
    name: 'Pay-For-Delete',
    price: 0,
    setupFee: 99,
    deletionFee: 149,
    description: 'Only pay when items are removed',
    features: ['$99 Setup Fee', '$149 Per Deletion', 'No Monthly Fee', 'Results-Based Pricing'],
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

const CompleteEnrollmentFlow = ({ 
  // Legacy props (for backward compatibility)
  initialData = null, 
  resumeContactId = null,
  
  // NEW: Dual mode props
  mode = 'public',                    // 'public' (landing page) or 'crm' (staff enrollment)
  preFilledContactId = null,          // Firestore contact ID for CRM mode
  onComplete = null,                  // Callback when enrollment completes (CRM mode)
  skipPayment = false,                // Skip payment step (for staff-initiated)
  skipCelebration = false,            // Skip celebration phase (for efficiency)
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Determine if we're in CRM mode
  const isCRMMode = mode === 'crm' || !!preFilledContactId;

  // ===== REFS =====
  const signatureRef = useRef(null);
  const idUploadRef = useRef(null);
  const utilityUploadRef = useRef(null);
  const autoSaveTimerRef = useRef(null);

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
    password: '',
    phone: '',
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
    agreeToAddress: false,
    // Source tracking
    source: isCRMMode ? 'crm_enrollment' : 'landing_page',
    utmSource: '',
    utmMedium: '',
    utmCampaign: '',
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
  const [selectedPlan, setSelectedPlan] = useState('standard');
  const [paymentComplete, setPaymentComplete] = useState(false);

  // Social proof
  const [showSocialProof, setShowSocialProof] = useState(false);
  const [socialProofCity, setSocialProofCity] = useState('');

  // Animated score counter
  const [displayedScore, setDisplayedScore] = useState(0);

  // SSN visibility
  const [showSSN, setShowSSN] = useState(false);
  
  // Password visibility (for IDIQ portal password field)
  const [showPassword, setShowPassword] = useState(false);  

  // ===== VERIFICATION STATE =====
  const [verificationRequired, setVerificationRequired] = useState(false);
  const [verificationQuestions, setVerificationQuestions] = useState([]);
  const [verificationAnswers, setVerificationAnswers] = useState({});
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  const [maxVerificationAttempts] = useState(3);
  const [enrollmentId, setEnrollmentId] = useState(null);
  const [membershipNumber, setMembershipNumber] = useState(null);
  const [verificationError, setVerificationError] = useState(null);

  // Exit intent popup state
  const [showExitIntent, setShowExitIntent] = useState(false);
  const [exitIntentData, setExitIntentData] = useState(null);
  const [discountApplied, setDiscountApplied] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  // Tracking state
  const [trackingInitialized, setTrackingInitialized] = useState(false);

  // ===== NEW: AUTOSAVE STATE =====
  const [autoSaveStatus, setAutoSaveStatus] = useState('idle'); // 'idle', 'saving', 'saved', 'error'
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);
  const [recoveryData, setRecoveryData] = useState(null);

  // ===== NEW: CONNECTION STATE =====
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // ===== NEW: CRM MODE STATE =====
  const [crmContactData, setCrmContactData] = useState(null);
  const [crmContactLoading, setCrmContactLoading] = useState(false);

  // ===== NEW: PHONE CORRUPTION DETECTION STATE =====
  const [phoneCorrectionInfo, setPhoneCorrectionInfo] = useState(null);
  const [showPhoneCorrectionAlert, setShowPhoneCorrectionAlert] = useState(false);


  // ===== FIREBASE FUNCTIONS =====
  const functions = getFunctions();
  const idiqService = httpsCallable(functions, 'idiqService');
  const createStripeCheckout = httpsCallable(functions, 'createStripeCheckout');
  const operationsManager = httpsCallable(functions, 'operationsManager');

  // ============================================================================
  // AUTOSAVE FUNCTIONS
  // ============================================================================

  // Save current form state to localStorage
  const saveToLocalStorage = useCallback(() => {
    try {
      const dataToSave = {
        formData,
        currentPhase,
        contactId,
        creditReport,
        selectedPlan,
        idPhotoUrl,
        utilityPhotoUrl,
        signatureData,
        enrollmentId,
        membershipNumber,
        verificationAnswers,
        savedAt: new Date().toISOString(),
        mode: isCRMMode ? 'crm' : 'public',
        preFilledContactId,
      };
      
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(dataToSave));
      setAutoSaveStatus('saved');
      setLastSavedAt(new Date());
      console.log('✅ AutoSave: Form data saved at', new Date().toLocaleTimeString());
      
      // Reset status after 3 seconds
      setTimeout(() => setAutoSaveStatus('idle'), 3000);
      
    } catch (err) {
      console.error('❌ AutoSave failed:', err);
      setAutoSaveStatus('error');
    }
  }, [formData, currentPhase, contactId, creditReport, selectedPlan, idPhotoUrl, utilityPhotoUrl, signatureData, enrollmentId, membershipNumber, verificationAnswers, isCRMMode, preFilledContactId]);

  // Check for saved session on mount
  const checkForSavedSession = useCallback(() => {
    try {
      const saved = localStorage.getItem(AUTOSAVE_KEY);
      if (!saved) return;
      
      const parsedData = JSON.parse(saved);
      const savedTime = new Date(parsedData.savedAt);
      const now = new Date();
      const hoursDiff = (now - savedTime) / (1000 * 60 * 60);
      
      // Only offer recovery if less than 24 hours old
      if (hoursDiff < SESSION_EXPIRY_HOURS) {
        const savedMode = parsedData.mode || 'public';
        const currentMode = isCRMMode ? 'crm' : 'public';
        
        if (savedMode === currentMode || parsedData.formData?.email) {
          console.log('💾 Found saved session from', savedTime.toLocaleString());
          setRecoveryData(parsedData);
          setShowRecoveryDialog(true);
        }
      } else {
        localStorage.removeItem(AUTOSAVE_KEY);
        console.log('🗑️ Cleared expired session (>24 hours old)');
      }
    } catch (err) {
      console.error('Error checking saved session:', err);
      localStorage.removeItem(AUTOSAVE_KEY);
    }
  }, [isCRMMode]);

  // Restore saved session
  const restoreSession = useCallback(() => {
    if (!recoveryData) return;
    
    try {
      setFormData(recoveryData.formData || formData);
      setCurrentPhase(recoveryData.currentPhase || 1);
      setContactId(recoveryData.contactId || null);
      setCreditReport(recoveryData.creditReport || null);
      setSelectedPlan(recoveryData.selectedPlan || 'standard');
      setIdPhotoUrl(recoveryData.idPhotoUrl || null);
      setUtilityPhotoUrl(recoveryData.utilityPhotoUrl || null);
      setSignatureData(recoveryData.signatureData || null);
      setEnrollmentId(recoveryData.enrollmentId || null);
      setMembershipNumber(recoveryData.membershipNumber || null);
      setVerificationAnswers(recoveryData.verificationAnswers || {});
      
      setShowRecoveryDialog(false);
      setSuccess('Session restored! Continuing where you left off...');
      console.log('✅ Session restored successfully');
      
    } catch (err) {
      console.error('Error restoring session:', err);
      setError('Failed to restore session. Starting fresh.');
      setShowRecoveryDialog(false);
    }
  }, [recoveryData]);

  // Discard saved session
  const discardSession = useCallback(() => {
    localStorage.removeItem(AUTOSAVE_KEY);
    setShowRecoveryDialog(false);
    setRecoveryData(null);
    console.log('🗑️ Saved session discarded');
  }, []);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Check for saved session on mount
  useEffect(() => {
    if (!resumeContactId && !preFilledContactId) {
      checkForSavedSession();
    }
  }, []);

  // AutoSave timer - save every 30 seconds
  useEffect(() => {
    if (currentPhase > 1 || formData.email || formData.firstName) {
      autoSaveTimerRef.current = setInterval(() => {
        setAutoSaveStatus('saving');
        saveToLocalStorage();
      }, AUTOSAVE_INTERVAL);
      
      return () => {
        if (autoSaveTimerRef.current) {
          clearInterval(autoSaveTimerRef.current);
        }
      };
    }
  }, [currentPhase, formData.email, formData.firstName, saveToLocalStorage]);

  // Save on beforeunload (page close/refresh)
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (currentPhase > 1 && currentPhase < 8) {
        saveToLocalStorage();
        
        if (contactId) {
          markEnrollmentAbandoned(contactId, {
            ...formData,
            currentPhase,
          });

          trackEvent({
            eventType: 'form_abandoned',
            contactId,
            email: formData.email,
            firstName: formData.firstName,
            middleName: formData.middleName,
            phone: formData.phone,
            phase: currentPhase,
          });
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [contactId, currentPhase, formData, saveToLocalStorage]);

  // Connection monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('✅ Connection restored');
      saveToLocalStorage();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      console.warn('⚠️ Connection lost - AutoSave will continue locally');
      saveToLocalStorage();
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [saveToLocalStorage]);

  // ===== CRM MODE - Load contact from Firestore =====
  useEffect(() => {
    const loadContactData = async () => {
      if (isCRMMode && preFilledContactId) {
        setCrmContactLoading(true);
        try {
          console.log('📂 CRM Mode: Loading contact', preFilledContactId);
          const contactRef = doc(db, 'contacts', preFilledContactId);
          const contactSnap = await getDoc(contactRef);
          
          if (contactSnap.exists()) {
            const data = contactSnap.data();
            setCrmContactData(data);
            setContactId(preFilledContactId);
            
            // ===== PHONE CORRUPTION DETECTION FOR CRM CONTACT =====
            const processedContactData = processContactPhoneData(data);
            
            // Check if phone was corrected
            if (processedContactData.phoneCorruption?.corrected) {
              console.log('🔧 Phone corruption fixed for contact:', preFilledContactId);
              
              // Show user notification
              setPhoneCorrectionInfo(createPhoneCorrectionNotification({
                corrected: true,
                message: processedContactData.phoneCorruption.message
              }));
              setShowPhoneCorrectionAlert(true);
              
              // Track the correction
              trackPhoneCorruption({
                corrected: true,
                original: processedContactData.phoneOriginal,
                formatted: processedContactData.phone,
                message: processedContactData.phoneCorruption.message
              }, 'contact_preload');
            }

            // Pre-fill form with contact data (using processed data)
            setFormData(prev => ({
              ...prev,
              firstName: processedContactData.firstName || prev.firstName,
              middleName: processedContactData.middleName || prev.middleName,
              lastName: processedContactData.lastName || prev.lastName,
              email: processedContactData.email || prev.email,
              phone: processedContactData.phone || prev.phone, // This is now corrected!
              carrier: processedContactData.carrier || prev.carrier,
              street: processedContactData.address?.street || processedContactData.street || prev.street,
              city: processedContactData.address?.city || processedContactData.city || prev.city,
              state: processedContactData.address?.state || processedContactData.state || prev.state,
              zip: processedContactData.address?.zip || processedContactData.zipCode || processedContactData.zip || prev.zip,
              dateOfBirth: processedContactData.dateOfBirth || prev.dateOfBirth,
              employer: processedContactData.employer || prev.employer,
              income: processedContactData.income || prev.income,
              source: 'crm_enrollment',
            }));
            
            console.log('✅ CRM Mode: Contact data pre-filled', data.firstName, data.lastName);
          } else {
            console.warn('⚠️ Contact not found:', preFilledContactId);
            setError('Contact not found. Please select a different contact.');
          }
        } catch (err) {
          console.error('❌ Error loading contact:', err);
          setError('Failed to load contact data. Please try again.');
        } finally {
          setCrmContactLoading(false);
        }
      }
    };
    
    loadContactData();
  }, [isCRMMode, preFilledContactId]);

  // Iframe listener for landing page handshake (PUBLIC MODE ONLY)
  useEffect(() => {
    if (isCRMMode) return;
    
    const cleanup = createIframeListener((data) => {
      console.log('📨 Received data from landing page:', data);
      
      // ===== PROCESS LANDING PAGE DATA WITH PHONE FIX =====
      const processedLandingData = processLandingPageData(data);
      
      // Check if phone was corrected from landing page
      if (processedLandingData.landingPageCorruption) {
        console.log('🌐 Phone corruption fixed from landing page');
        
        // Show user notification
        setPhoneCorrectionInfo(createPhoneCorrectionNotification({
          corrected: true,
          message: processedLandingData.correctionMessage
        }));
        setShowPhoneCorrectionAlert(true);
        
        // Track the correction
        trackPhoneCorruption({
          corrected: true,
          original: processedLandingData.phoneOriginal,
          formatted: processedLandingData.phone,
          message: processedLandingData.correctionMessage
        }, 'landing_page');
      }
      
      setFormData((prev) => ({
        ...prev,
        firstName: processedLandingData.firstName || prev.firstName,
        middleName: processedLandingData.middleName || prev.middleName,
        lastName: processedLandingData.lastName || prev.lastName,
        email: processedLandingData.email || prev.email,
        phone: processedLandingData.phone || prev.phone, // CORRECTED PHONE!
        carrier: processedLandingData.carrier || prev.carrier,
        street: processedLandingData.street || prev.street,
        city: processedLandingData.city || prev.city,
        state: processedLandingData.state || prev.state,
        zip: processedLandingData.zip || prev.zip,
        source: 'landing_page',
        utmSource: processedLandingData.utmSource || prev.utmSource,
        utmMedium: processedLandingData.utmMedium || prev.utmMedium,
        utmCampaign: processedLandingData.utmCampaign || prev.utmCampaign,
      }));
    });

    return cleanup;
  }, [isCRMMode]);

  // Window postMessage listener (for popup windows) - PUBLIC MODE ONLY
  useEffect(() => {
    if (isCRMMode) return;
    
    const handleMessage = (event) => {
      console.log('📨 Received postMessage:', event.data);
      
      if (event.data.type === 'ENROLLMENT_DATA' && event.data.data) {
        const data = event.data.data;
        console.log('✅ Processing enrollment data:', data);
        
        // ===== PROCESS LANDING PAGE DATA WITH PHONE FIX =====
        const processedLandingData = processLandingPageData(data);
        
        // Check if phone was corrected from landing page
        if (processedLandingData.landingPageCorruption) {
          console.log('🌐 Phone corruption fixed from postMessage');
          
          // Show user notification
          setPhoneCorrectionInfo(createPhoneCorrectionNotification({
            corrected: true,
            message: processedLandingData.correctionMessage
          }));
          setShowPhoneCorrectionAlert(true);
          
          // Track the correction
          trackPhoneCorruption({
            corrected: true,
            original: processedLandingData.phoneOriginal,
            formatted: processedLandingData.phone,
            message: processedLandingData.correctionMessage
          }, 'landing_page_postmessage');
        }
        
        setFormData((prev) => ({
          ...prev,
          firstName: processedLandingData.firstName || prev.firstName,
          middleName: processedLandingData.middleName || prev.middleName,
          lastName: processedLandingData.lastName || prev.lastName,
          email: processedLandingData.email || prev.email,
          phone: processedLandingData.phone || prev.phone, // CORRECTED PHONE!
          carrier: processedLandingData.carrier || prev.carrier,
          street: processedLandingData.street || prev.street,
          city: processedLandingData.city || prev.city,
          state: processedLandingData.state || prev.state,
          zip: processedLandingData.zip || prev.zip,
          source: 'landing_page',
        }));
        
        console.log('✅ Form data pre-populated from landing page!');
        
        if (event.source) {
          event.source.postMessage({ type: 'DATA_RECEIVED' }, '*');
        }
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isCRMMode]);

  // Load saved state from localStorage (legacy)
  useEffect(() => {
    const savedState = loadEnrollmentState();
    if (savedState && !resumeContactId && !preFilledContactId) {
      console.log('📂 Restoring saved enrollment state (legacy)');
      setFormData(savedState.formData || formData);
      setCurrentPhase(savedState.currentPhase || 1);
      setContactId(savedState.contactId);
      if (savedState.creditReport) setCreditReport(savedState.creditReport);
    }
  }, []);

  // Resume from recovery link (legacy)
  useEffect(() => {
    if (resumeContactId) {
      handleResumeEnrollment(resumeContactId);
    }
  }, [resumeContactId]);

  // Save state on changes (legacy)
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

  // Social proof notifications (PUBLIC MODE ONLY)
  useEffect(() => {
    if (isCRMMode) return;
    
    const showRandomSocialProof = () => {
      const city = SOCIAL_PROOF_CITIES[Math.floor(Math.random() * SOCIAL_PROOF_CITIES.length)];
      setSocialProofCity(city);
      setShowSocialProof(true);
      setTimeout(() => setShowSocialProof(false), 4000);
    };

    const interval = setInterval(showRandomSocialProof, 30000);
    const timeout = setTimeout(showRandomSocialProof, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isCRMMode]);

  // Initialize exit intent tracking (PUBLIC MODE ONLY)
  useEffect(() => {
    if (isCRMMode) return;
    if (!trackingInitialized || currentPhase >= 5) return;

    const exitIntentShown = sessionStorage.getItem('exitIntentShown');
    if (exitIntentShown) return;

    const delayTimer = setTimeout(() => {
      const cleanup = initExitIntent({
        currentPhase,
        contactId,
        email: formData.email,
        onExitIntent: (data) => {
          sessionStorage.setItem('exitIntentShown', 'true');
          setExitIntentData(data);
          setShowExitIntent(true);
        },
      });

      return cleanup;
    }, 30000);

    return () => clearTimeout(delayTimer);
  }, [trackingInitialized, currentPhase, contactId, formData.email, isCRMMode]);

  // Initialize inactivity timer for abandoned cart recovery
  useEffect(() => {
    if (!contactId || currentPhase < 1 || currentPhase >= 8) return;

    const cleanup = initInactivityTimer({
      contactId,
      email: formData.email,
      firstName: formData.firstName,
      middleName: formData.middleName,
      phone: formData.phone,
      currentPhase,
      formData,
      timeoutMs: 15 * 60 * 1000,
      onInactive: async (data) => {
        console.log('⏰ User inactive - triggering recovery');

        if (!isCRMMode && formData.phone && formData.carrier) {
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
  }, [contactId, currentPhase, formData, isCRMMode]);

  // Track phase changes
  useEffect(() => {
    if (contactId && currentPhase > 0) {
      trackPhaseComplete({
        phase: currentPhase,
        contactId,
        email: formData.email,
        phone: formData.phone,
        firstName: formData.firstName,
        middleName: formData.middleName,
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
    // CRM mode may skip address verification
    if (!isCRMMode && !formData.agreeToAddress) {
      setError('You must confirm you have been at your address for at least 6 months.');
      return false;
    }
    return true;
  };

  const handlePhase1Submit = async () => {
    if (!validatePhase1()) return;

    setLoading(true);
    setError(null);

    const cleanPhone = formData.phone.replace(/\D/g, '');
    const submissionData = { ...formData, phone: cleanPhone };

    try {
      await trackFormStarted({
        contactId: contactId || null,
        email: formData.email,
        firstName: formData.firstName,
        middleName: formData.middleName,
      });

      // For CRM mode with existing contact, just update
      if (isCRMMode && contactId) {
        await updateDoc(doc(db, 'contacts', contactId), {
          ...submissionData,
          updatedAt: serverTimestamp(),
          enrollmentStartedAt: serverTimestamp(),
          enrollmentSource: 'crm_enrollment',
        });
      } else {
        const result = await processEnrollment(formData, { forceCreate: false });

        let newContactId = null;
        if (result.isDuplicate) {
          const updateResult = await processEnrollment(formData, { updateExisting: true });
          newContactId = updateResult.contactId;
        } else if (result.success) {
          newContactId = result.contactId;
        }

        setContactId(newContactId);
      }
      
      await trackPhaseComplete({
        phase: 1,
        contactId: contactId,
        email: formData.email,
        phone: formData.phone,
        firstName: formData.firstName,
        middleName: formData.middleName,
        formData,
      });
      
      await logInteraction('enrollment_started', {
        description: 'Started Complete Enrollment Flow',
        phase: 1,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        leadSource: isCRMMode ? 'CRM Enrollment' : 'Website',
        mode: isCRMMode ? 'crm' : 'public',
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

    await trackExitIntentResponse({
      accepted: false,
      contactId,
      email: formData.email,
      phase: currentPhase,
      discountApplied: false,
    });
  };

  const startCreditAnalysis = async () => {
    const cleanSSN = formData.ssn.replace(/\D/g, '');
    
    // ===== USE CLEANED PHONE FOR IDIQ =====
    const cleanPhone = getPhoneForIDIQEnrollment(formData.phone);
    
    if (!cleanPhone) {
      setError('Invalid phone number format. Please check and try again.');
      setLoading(false);
      return;
    }
    
    console.log('📞 Using cleaned phone for IDIQ enrollment:', cleanPhone);
    
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
      console.log("🚀 Calling IDIQ API...");
      const response = await idiqService({
        action: 'pullReport',
        memberData: {
          firstName: formData.firstName,
          middleName: formData.middleName,
          lastName: formData.lastName,
          email: formData.email,
          phone: cleanPhone, // ===== USING CLEANED PHONE =====
          password: formData.password,
          dateOfBirth: formData.dateOfBirth,
          ssn: cleanSSN,
          address: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            zip: formData.zip,
          },
        },
        contactId: contactId || null
      });

      console.log("✅ IDIQ Response:", response.data);

      // Check if verification is required
      if (response.data.verificationRequired) {
        console.log("🔐 Verification required - showing security questions");
        
        setVerificationRequired(true);
        
        const extractedQuestions = 
          response.data.questions || 
          response.data.verificationQuestions || 
          response.data.data?.questions || 
          [];

        setVerificationQuestions(extractedQuestions);
        setEnrollmentId(response.data.enrollmentId);
        setMembershipNumber(response.data.membershipNumber);
        setAnalysisComplete(true);
        setLoading(false);
        
        return;
      }

      // No verification needed - process report directly
      const resData = response.data?.data || response.data || {};
      setCreditReport(resData);
      setAnalysisComplete(true);

      try {
        await updateDoc(doc(db, 'contacts', contactId), {
          idiqEnrollment: {
            status: 'active',
            enrollmentId: response.data.enrollmentId || `ENR-${Date.now()}`,
            membershipNumber: response.data.membershipNumber || null,
            enrolledAt: serverTimestamp(),
            creditScore: resData.vantageScore || resData.score || null,
            enrollmentSource: isCRMMode ? 'crm' : 'website',
            plan: selectedPlan || 'not_selected_yet'
          },
          enrollmentStatus: 'active',
          idiqActive: true,
          status: 'enrolled',
          updatedAt: serverTimestamp()
        });
        
        await logInteraction('idiq_enrollment_completed', {
          description: 'IDIQ enrollment completed successfully without verification',
          enrollmentId: response.data.enrollmentId,
          membershipNumber: response.data.membershipNumber,
          creditScore: resData.vantageScore || resData.score,
          plan: selectedPlan,
          verificationRequired: false
        });
        
        console.log('✅ IDIQ enrollment status updated (no verification)');
      } catch (updateErr) {
        console.error('❌ Failed to update IDIQ enrollment status:', updateErr);
      }
      
      setCurrentPhase(3);

      const targetScore = 
        resData.vantageScore || 
        resData.score || 
        resData.bureaus?.transunion?.score || 
        resData.bureaus?.experian?.score || 
        resData.bureaus?.equifax?.score || 
        300;

      console.log("🎯 Final Score Detected for Animation:", targetScore);
      animateScore(targetScore);
    
    } catch (err) {
      console.error('❌ IDIQ CREDIT REPORT PULL FAILED:', err);
      setLoading(false);
      setError(
        `Failed to pull credit report from IDIQ API. ` +
        `Error: ${err.message || 'Unknown error'}. ` +
        `\n\nPlease check your credentials and SSN format.`
      );
    } finally {
      setLoading(false);
    }
  };
  
  // ===== SUBMIT VERIFICATION ANSWERS =====
  const submitVerificationAnswers = async () => {
    setLoading(true);
    setVerificationError(null);

    try {
      console.log("📝 Submitting verification answers...");

      const answerIds = verificationQuestions.map((q, idx) => {
        const selectedAnswer = verificationAnswers[idx];
        if (!selectedAnswer) {
          throw new Error(`Please answer question ${idx + 1}`);
        }
        
        const options = q.answers || q.answer || [];
        const foundOption = options.find(a => (a.answer || a.choice || a.text) === selectedAnswer);
        
        return foundOption ? foundOption.id : selectedAnswer;
      });

      console.log("🔐 Submitting answer IDs for enrollment:", enrollmentId);

      const response = await idiqService({
        action: 'submitVerification',
        memberData: {
          email: formData.email,
          answerIds: answerIds,
          enrollmentId: enrollmentId
        }
      });

      const resData = response.data?.data || response.data || {};
      const successFlag = response.data?.success && response.data?.verified;

      console.log("✅ Verification response:", response.data);

      if (successFlag) {
        console.log("🎉 Verification successful!");
        
        setCreditReport(resData);
        setVerificationRequired(false);
        
        try {
          await updateDoc(doc(db, 'contacts', contactId), {
            idiqEnrollment: {
              status: 'active',
              enrollmentId: enrollmentId || `ENR-${Date.now()}`,
              membershipNumber: membershipNumber || response.data.membershipNumber || null,
              enrolledAt: serverTimestamp(),
              verifiedAt: serverTimestamp(),
              creditScore: resData.vantageScore || resData.score || null,
              enrollmentSource: isCRMMode ? 'crm' : 'website',
              plan: selectedPlan || 'not_selected_yet'
            },
            enrollmentStatus: 'active',
            idiqActive: true,
            status: 'enrolled',
            leadSource: formData.leadSource || (isCRMMode ? 'CRM Enrollment' : 'Website - Complete Enrollment'),
            employer: formData.employer || '',
            income: formData.income || '',
            'idiq.enrolled': true,
            'idiq.enrolledAt': serverTimestamp(),
            'idiq.lastEnrollmentAt': serverTimestamp(),
            'idiq.membershipNumber': membershipNumber || response.data.membershipNumber || null,
            'idiq.reportRequested': true,
            updatedAt: serverTimestamp()
          });
          
          await logInteraction('idiq_enrollment_completed', {
            description: 'IDIQ enrollment completed successfully with verification',
            enrollmentId: enrollmentId,
            membershipNumber: membershipNumber || response.data.membershipNumber,
            creditScore: resData.vantageScore || resData.score,
            plan: selectedPlan,
            verificationRequired: true
          });
        } catch (updateErr) {
          console.error('❌ Failed to update IDIQ enrollment status:', updateErr);
        }
        
        setCurrentPhase(3);
        
        const targetScore = resData.vantageScore || resData.score || 300;
        animateScore(targetScore);
        
      } else if (response.data?.locked) {
        console.log("🚫 Account locked - notifying support");
        setVerificationError({
          type: 'locked',
          message: response.data.message || 'Account locked. Please contact support.',
          attemptsRemaining: 0
        });
        
        // Send alert email to Laurie for locked accounts
        try {
          await sendEmail({
            to: 'Laurie@speedycreditrepair.com',
            type: 'VERIFICATION_LOCKED_ALERT',
            subject: `🚨 IDIQ Verification Locked - ${formData.firstName} ${formData.lastName}`,
            html: `
              <h2>Client Verification Locked</h2>
              <p><strong>Name:</strong> ${formData.firstName} ${formData.lastName}</p>
              <p><strong>Email:</strong> ${formData.email}</p>
              <p><strong>Phone:</strong> ${formData.phone}</p>
              <p><strong>Enrollment ID:</strong> ${enrollmentId}</p>
              <p>The client has failed IDIQ security questions 3 times. Please reach out to assist.</p>
            `,
            contactId: contactId,
          });
        } catch (emailErr) {
          console.error('Failed to send locked alert email:', emailErr);
        }
        
      } else {
        console.log("❌ Answer incorrect - tracking attempt statistics");
        setVerificationAttempts(response.data?.attempts || 0);
        setVerificationError({
          type: 'incorrect',
          message: response.data?.message || 'Verification failed. Please try again.',
          attemptsRemaining: response.data?.attemptsRemaining,
          attempts: response.data?.attempts,
          maxAttempts: response.data?.maxAttempts
        });
        
        setVerificationAnswers({});
      }

    } catch (err) {
      console.error('❌ Verification submission failed:', err);
      setVerificationError({
        type: 'error',
        message: err.message || 'Failed to submit verification answers'
      });
    } finally {
      setLoading(false);
    }
  };

  const animateScore = (targetScore) => {
    const duration = 2000;
    const start = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayedScore(Math.round(300 + (targetScore - 300) * eased));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  };

  // ===== INTERACTION LOGGING HELPER =====
  const logInteraction = async (type, details) => {
    if (!contactId) {
      console.warn('⚠️ Cannot log interaction: no contactId');
      return;
    }
    
    try {
      await addDoc(collection(db, 'interactions'), {
        contactId: contactId,
        type: type,
        details: details,
        createdAt: serverTimestamp(),
        createdBy: auth.currentUser?.email || 'system',
        source: isCRMMode ? 'CRM Enrollment Flow' : 'Complete Enrollment Flow',
        phase: currentPhase
      });
      
      await updateDoc(doc(db, 'contacts', contactId), {
        timeline: arrayUnion({
          type: type,
          description: details.description || type.replace(/_/g, ' '),
          timestamp: new Date().toISOString(),
          id: Date.now(),
          metadata: {
            ...details,
            source: 'enrollment'
          }
        })
      });
      
      console.log('✅ Interaction logged:', type, details);
    } catch (err) {
      console.error('❌ Failed to log interaction:', err);
    }
  };

  const handlePhotoUpload = async (file, type) => {
    if (!file) return;

    const validTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf'
    ];
    
    if (!validTypes.includes(file.type)) {
      setError('Please upload an image (JPG, PNG, GIF, WebP) or PDF file');
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setLoading(true);
    try {
      const fileExtension = file.name.split('.').pop();
      const storageRef = ref(storage, `enrollments/${contactId}/${type}-${Date.now()}.${fileExtension}`);
      
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      if (type === 'id') {
        setIdPhotoUrl(url);
      } else {
        setUtilityPhotoUrl(url);
      }

      const checklistField = type === 'id' ? 'photoId' : 'utilityBill';
      
      await updateDoc(doc(db, 'contacts', contactId), {
        [`documents.${type}`]: url,
        [`documents.${type}Type`]: file.type,
        [`documents.${type}Name`]: file.name,
        [`documentsChecklist.${checklistField}`]: {
          checked: true,
          uploadedAt: serverTimestamp(),
          uploadedBy: auth.currentUser?.email || 'system',
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type
        },
        updatedAt: serverTimestamp(),
      });

      await logInteraction('document_uploaded', {
        documentType: type === 'id' ? 'Photo ID' : 'Utility Bill',
        fileName: file.name,
        fileSize: file.size,
        phase: currentPhase
      });

      setSuccess(`${type === 'id' ? 'ID' : 'Utility bill'} uploaded successfully!`);
      
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload document. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignatureSave = async () => {
    if (signatureRef.current && !signatureRef.current.isEmpty()) {
      setLoading(true);
      try {
        const dataUrl = signatureRef.current.toDataURL();
        setSignatureData(dataUrl);

        await updateDoc(doc(db, 'contacts', contactId), {
          signature: dataUrl,
          signedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        await logInteraction('signature_captured', {
          description: 'Digital signature captured',
          phase: currentPhase,
          signatureMethod: 'canvas'
        });

        console.log('✅ Signature saved and logged');
        setCurrentPhase(6);
      } catch (err) {
        setError('Failed to save signature. Please try again.');
        console.error('❌ Signature save error:', err);
      } finally {
        setLoading(false);
      }
    } else {
      setError('Please provide a signature before continuing.');
    }
  };

  const handlePlanSelect = (planId) => {
    setSelectedPlan(planId);
    console.log('✅ Plan selected:', planId);
  };

  const handlePayment = async () => {
    const plan = SERVICE_PLANS.find((p) => p.id === selectedPlan);
    const finalPrice = Math.max(plan.price - appliedDiscount, 0);

    console.log('💳 Processing payment:', { plan: plan.name, price: finalPrice });

    // Skip payment if CRM mode with skipPayment flag
    if (skipPayment || finalPrice <= 0) {
      setLoading(true);
      try {
        console.log('🎁 Activating free trial/promotional enrollment');
        
        await logInteraction('payment_completed', {
          description: `${skipPayment ? 'Payment skipped (CRM)' : 'Free trial activated'} - ${plan.name} plan`,
          plan: plan.name,
          planId: selectedPlan,
          amount: 0,
          paymentMethod: skipPayment ? 'crm_skip' : 'free_trial',
          phase: currentPhase
        });
        
        await finalizeEnrollment();
        return;
      } catch (err) {
        console.error('❌ Trial activation error:', err);
        setError('Error activating trial account. Please contact support.');
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    try {
      console.log('💳 Creating Stripe checkout session...');
      
      const response = await createStripeCheckout({
        productId: plan.id,
        productName: `Speedy Credit Repair - ${plan.name}`,
        amount: finalPrice * 100,
        currency: 'usd',
        contactId: contactId,
        billingDay: formData.billingDay,
        successUrl: `${window.location.origin}/enrollment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/enrollment?phase=6`,
      });

      const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
      const { error } = await stripe.redirectToCheckout({ sessionId: response.data.sessionId });
      
      if (error) throw error;

    } catch (err) {
      console.error('Payment error:', err);
      setError('Payment failed or was cancelled. Please try again to activate your account.');
      setLoading(false);
    }
  };

  const finalizeEnrollment = async () => {
    setPaymentComplete(true);
    
    const selectedPlanData = SERVICE_PLANS.find((p) => p.id === selectedPlan) || SERVICE_PLANS[1];
    await logInteraction('payment_completed', {
      description: `Payment completed - ${selectedPlanData.name} plan`,
      plan: selectedPlan,
      planName: selectedPlanData.name,
      price: selectedPlanData.price,
      discountApplied: appliedDiscount
    });
    
    // Skip celebration phase in CRM mode if requested
    if (isCRMMode && skipCelebration) {
      setCurrentPhase(10);
    } else {
      setCurrentPhase(8);
    }
    
    try {
      await operationsManager({
        action: 'createClientAccount',
        contactId: contactId,
        plan: selectedPlan,
        billingDay: formData.billingDay,
        discountApplied: appliedDiscount,
      });

      await updateDoc(doc(db, 'contacts', contactId), {
        status: 'client',
        roles: arrayUnion('client'),
        enrollmentCompletedAt: serverTimestamp(),
        selectedPlan: selectedPlan,
        updatedAt: serverTimestamp(),
      });

      await sendWelcomeEmail();

      // Trigger celebration effects (PUBLIC MODE ONLY)
      if (!isCRMMode) {
        triggerCelebration();
      }

      // Call onComplete callback (CRM MODE)
      if (isCRMMode && onComplete) {
        onComplete(contactId, {
          enrollmentId,
          membershipNumber,
          plan: selectedPlan,
          creditScore: creditReport?.vantageScore,
        });
      }

    } catch (err) {
      console.warn('Backend sync partial failure:', err);
    } finally {
      setLoading(false);
    }
  };

  const sendWelcomeEmail = async () => {
    try {
      await sendEmail({
        to: formData.email,
        type: 'WELCOME_NEW_CLIENT',
        subject: `Welcome to Speedy Credit Repair, ${formData.firstName}!`,
        html: `
          <h1>Welcome to the Family!</h1>
          <p>Hi ${formData.firstName},</p>
          <p>Congratulations! Your account is now active and we are ready to start working for you today.</p>
          <p><strong>Next Steps:</strong></p>
          <ul>
            <li>Analyst Review: 24-48 Hours</li>
            <li>First Dispute Round: Starting Immediately</li>
            <li>Portal Access: Enabled</li>
          </ul>
          <p>Access your portal here: <a href="https://myclevercrm.com/client-portal">Client Portal</a></p>
          <p>Best,<br/>Christopher Lahage</p>
        `,
        variables: {
          firstName: formData.firstName,
          middleName: formData.middleName,
          lastName: formData.lastName,
        },
        contactId: contactId,
      });
    } catch (err) {
      console.error('Welcome email failed:', err);
    }
  };

  const triggerCelebration = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        particleCount,
        startVelocity: 30,
        spread: 360,
        origin: { x: randomInRange(0.1, 0.9), y: Math.random() - 0.2 },
        colors: ['#2196F3', '#4CAF50', '#FFC107', '#E91E63', '#9C27B0'],
      });
    }, 250);
  };

  const handleDownloadPDF = async () => {
    setLoading(true);
    try {
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
    
    // Clear AutoSave data
    localStorage.removeItem(AUTOSAVE_KEY);

    try {
      await updateDoc(doc(db, 'contacts', contactId), {
        idiqEnrollment: {
          status: 'active',
          enrollmentId: enrollmentId || `ENR-${Date.now()}`,
          membershipNumber: membershipNumber || null,
          enrolledAt: serverTimestamp(),
          completedAt: serverTimestamp(),
          creditScore: creditReport?.vantageScore || null,
          enrollmentSource: isCRMMode ? 'crm' : 'website',
          plan: selectedPlan
        },
        enrollmentStatus: 'enrolled',
        idiqActive: true,
        status: 'enrolled',
        leadSource: formData.leadSource || (isCRMMode ? 'CRM Enrollment' : 'Website - Complete Enrollment'),
        employer: formData.employer || '',
        income: formData.income || '',
        'idiq.enrolled': true,
        'idiq.enrolledAt': serverTimestamp(),
        'idiq.lastEnrollmentAt': serverTimestamp(),
        'idiq.membershipNumber': membershipNumber || null,
        'idiq.reportRequested': true,
        'idiq.enrollmentCompleted': true,
        updatedAt: serverTimestamp()
      });

      await logInteraction('enrollment_completed', {
        description: 'Complete enrollment flow finished successfully',
        enrollmentId: enrollmentId,
        membershipNumber: membershipNumber,
        creditScore: creditReport?.vantageScore,
        plan: selectedPlan,
        phase: 10,
        mode: isCRMMode ? 'crm' : 'public',
      });

    } catch (err) {
      console.error('❌ Failed to update enrollment status:', err);
    }

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
        
        await logInteraction('disputes_created', {
          description: `Created ${creditReport.negativeItems.length} dispute items`,
          count: creditReport.negativeItems.length
        });
      } catch (err) {
        console.error('Failed to populate disputes:', err);
      }
    }

    setCurrentPhase(10);
    
    // Call onComplete callback (CRM MODE)
    if (isCRMMode && onComplete) {
      onComplete(contactId, {
        enrollmentId,
        membershipNumber,
        plan: selectedPlan,
        creditScore: creditReport?.vantageScore,
        completed: true,
      });
    }
  };

  // ===== RENDER HELPERS =====

  const renderPhaseIndicator = () => {
    const phases = isCRMMode ? CRM_PHASES : PHASES;
    
    return (
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
          {phases.slice(0, isMobile ? 5 : phases.length).map((phase) => (
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
  };

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
        {isCRMMode && (
          <Chip
            icon={<BusinessIcon />}
            label="Staff Enrollment"
            color="secondary"
            variant="filled"
          />
        )}
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

  // ===== SESSION RECOVERY DIALOG =====
  const renderRecoveryDialog = () => (
    <Dialog
      open={showRecoveryDialog}
      onClose={() => setShowRecoveryDialog(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <RestoreIcon color="primary" />
        Resume Previous Session?
      </DialogTitle>
      <DialogContent>
        <Alert severity="info" sx={{ mb: 2 }}>
          We found a saved enrollment session from{' '}
          <strong>
            {recoveryData?.savedAt
              ? new Date(recoveryData.savedAt).toLocaleString()
              : 'recently'}
          </strong>
        </Alert>
        
        {recoveryData?.formData && (
          <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Saved Information:
            </Typography>
            <Typography variant="body2">
              <strong>Name:</strong> {recoveryData.formData.firstName} {recoveryData.formData.lastName}
            </Typography>
            <Typography variant="body2">
              <strong>Email:</strong> {recoveryData.formData.email}
            </Typography>
            <Typography variant="body2">
              <strong>Progress:</strong> Phase {recoveryData.currentPhase} of {isCRMMode ? 7 : 10}
            </Typography>
          </Box>
        )}
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Would you like to continue where you left off, or start fresh?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={discardSession} color="inherit">
          Start Fresh
        </Button>
        <Button onClick={restoreSession} variant="contained" startIcon={<RestoreIcon />}>
          Resume Session
        </Button>
      </DialogActions>
    </Dialog>
  );

  // ===== CRM MODE HEADER =====
  const renderCRMHeader = () => {
    if (!isCRMMode || !crmContactData) return null;
    
    return (
      <Alert
        severity="info"
        icon={<BusinessIcon />}
        sx={{ mb: 3 }}
      >
        <AlertTitle>Staff Enrollment Mode</AlertTitle>
        Enrolling: <strong>{crmContactData.firstName} {crmContactData.lastName}</strong> ({crmContactData.email})
      </Alert>
    );
  };

  // ===== AUTOSAVE INDICATOR =====
  const renderAutoSaveIndicator = () => (
    <AutoSaveIndicator>
      {/* Connection Status */}
      {isOnline ? (
        <WifiIcon fontSize="small" color="success" />
      ) : (
        <WifiOffIcon fontSize="small" color="error" />
      )}
      
      {/* Save Status */}
      {autoSaveStatus === 'saving' && (
        <>
          <CircularProgress size={16} />
          <Typography variant="caption">Saving...</Typography>
        </>
      )}
      {autoSaveStatus === 'saved' && (
        <>
          <CheckIcon fontSize="small" color="success" />
          <Typography variant="caption" color="success.main">Saved!</Typography>
        </>
      )}
      {autoSaveStatus === 'error' && (
        <>
          <ErrorIcon fontSize="small" color="error" />
          <Typography variant="caption" color="error">Save failed</Typography>
        </>
      )}
      {autoSaveStatus === 'idle' && lastSavedAt && (
        <Typography variant="caption" color="text.secondary">
          Last saved: {lastSavedAt.toLocaleTimeString()}
        </Typography>
      )}
      
      {/* Manual Save Button */}
      <Tooltip title="Save now">
        <IconButton size="small" onClick={saveToLocalStorage}>
          <SaveIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </AutoSaveIndicator>
  );

  // ===== PHASE RENDERERS =====

  const renderPhase1 = () => (
    <Fade in timeout={500}>
      <Box>
        {/* CRM Mode Header */}
        {renderCRMHeader()}
        {/* Phone Correction Alert */}
        {showPhoneCorrectionAlert && phoneCorrectionInfo && (
          <Alert 
            severity="success" 
            onClose={() => setShowPhoneCorrectionAlert(false)}
            sx={{ mb: 2 }}
          >
            <AlertTitle>{phoneCorrectionInfo.title}</AlertTitle>
            {phoneCorrectionInfo.message}
          </Alert>
        )}
        
        {/* CRM Loading State */}
        {crmContactLoading && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>Loading contact information...</Typography>
          </Box>
        )}
        
        {!crmContactLoading && (
          <>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              {isCRMMode ? 'Verify Client Information' : "Let's Get Started!"}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              {isCRMMode 
                ? 'Please verify and complete the client information below.'
                : 'Your journey to better credit begins here. Fill in your details to receive your FREE Credit Analysis.'
              }
            </Typography>

            {!isCRMMode && renderChristopherCard()}

            <Grid container spacing={3}>
              <Grid item xs={12} sm={5}>
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
              <Grid item xs={12} sm={2}>
                <TextField
                  fullWidth
                  label="Middle Initial"
                  value={formData.middleName}
                  onChange={handleFormChange('middleName')}
                  inputProps={{ maxLength: 1 }}
                  placeholder="M"
                  helperText="Optional"
                />
              </Grid>
              <Grid item xs={12} sm={5}>
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
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleFormChange('password')}
                  required
                  autoComplete="new-password"
                  placeholder="Create portal password"
                  helperText="For your IDIQ credit monitoring portal"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SecurityIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => {
                    const newPhone = e.target.value;
                    
                    // ===== PHONE CORRUPTION DETECTION =====
                    const phoneResult = detectAndCorrectPhoneCorruption(newPhone);
                    
                    // Use corrected phone if correction was made
                    const phoneToSet = phoneResult.corrected ? phoneResult.formatted : newPhone;
                    
                    handleFormChange('phone')({ target: { value: phoneToSet } });
                    
                    // Show correction notification if needed
                    if (phoneResult.corrected && !showPhoneCorrectionAlert) {
                      setPhoneCorrectionInfo(createPhoneCorrectionNotification(phoneResult));
                      setShowPhoneCorrectionAlert(true);
                      trackPhoneCorruption(phoneResult, 'manual_entry');
                    }
                  }}
                  required
                  placeholder="Enter your phone number"
                  helperText="10-digit US phone number"
                  autoComplete="tel"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
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
              {/* ===== STATE DROPDOWN FIX ===== */}
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel 
                    id="state-select-label"
                    shrink={true}
                    sx={{
                      backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : 'white',
                      px: 0.5,
                    }}
                  >
                    State
                  </InputLabel>
                  <Select
                    labelId="state-select-label"
                    value={formData.state}
                    onChange={handleFormChange('state')}
                    label="State"
                    notched={true}
                    displayEmpty
                  >
                    <MenuItem value="" disabled>
                      <em>Select State</em>
                    </MenuItem>
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
                  inputProps={{ maxLength: 5 }}
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
                  required
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
                  value={formData.ssn}
                  onChange={handleFormChange('ssn')}
                  required
                  type={showSSN ? 'text' : 'password'}
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
                  helperText="Required for credit report access - encrypted & secure"
                />
              </Grid>
            </Grid>

            {/* Agreement checkboxes - PUBLIC MODE ONLY */}
            {!isCRMMode && (
              <Box sx={{ mt: 4 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.agreeToAddress}
                      onChange={handleFormChange('agreeToAddress')}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2">
                      I confirm I have lived at my current address for at least 6 months
                    </Typography>
                  }
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.agreeToTerms}
                      onChange={handleFormChange('agreeToTerms')}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2">
                      By checking this box and clicking 'AGREE & NEXT' you agree to be bound by the{' '}
                      <Link href="https://www.idiq.com/terms-of-service" target="_blank" rel="noopener">Terms of Service</Link>,{' '}
                      <Link href="https://www.idiq.com/privacy-policy" target="_blank" rel="noopener">Privacy Policy</Link>, and to receive important{' '}
                      <Link href="https://www.idiq.com/electronic-communications" target="_blank" rel="noopener">notices and other communications electronically</Link>.
                    </Typography>
                  }
                />
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, pl: 4 }}>
                  You are providing express written consent for IDIQ, parties calling on behalf of IDIQ, network partners, or any authorized 
                  third party on their behalf to e-mail, or to call or text you (including through automated means, e.g., through an automatic 
                  telephone dialing system or through the use of pre-recorded or artificial voice messages), to any telephone number you provide, 
                  even if your telephone number is listed on any internal, corporate, state, federal, or national Do-Not-Call (DNC) list, for 
                  any purpose, including marketing. Texts include SMS and MMS - charges may apply. This consent to such communications is not 
                  required as a condition to obtain any goods or services, and you may choose to speak with an individual customer service 
                  representative by contacting 877-875-4347.
                </Typography>
              </Box>
            )}

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
              <GlowingButton
                onClick={handlePhase1Submit}
                disabled={loading || (!isCRMMode && (!formData.agreeToAddress || !formData.agreeToTerms))}
                endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ArrowForwardIcon />}
                sx={{ px: 6, py: 2 }}
              >
                {loading ? 'Processing...' : (isCRMMode ? 'Continue Enrollment' : 'AGREE & NEXT')}
              </GlowingButton>
            </Box>
          </>
        )}
      </Box>
    </Fade>
  );

  const renderPhase2 = () => {
    // Show verification questions if required
    if (verificationRequired) {
      return (
        <Fade in timeout={500}>
          <Box sx={{ maxWidth: 700, mx: 'auto', py: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <SecurityIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h4" fontWeight={700} gutterBottom>
                Identity Verification
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                To protect your identity, please answer these security questions based on your credit history.
              </Typography>
              <Chip 
                label={`Attempt ${verificationAttempts + 1} of ${maxVerificationAttempts}`}
                color={verificationAttempts === 0 ? 'primary' : verificationAttempts === 1 ? 'warning' : 'error'}
                sx={{ fontWeight: 600 }}
              />
            </Box>

            {/* Show error messages with 3-tier escalation */}
            {verificationError && (
              <Alert 
                severity={verificationError.type === 'locked' ? 'error' : 'warning'}
                sx={{ mb: 3 }}
              >
                <AlertTitle>
                  {verificationError.type === 'locked' ? '🚫 Verification Locked' : 
                   verificationError.type === 'incorrect' ? '❌ Incorrect Answers' : 
                   '⚠️ Error'}
                </AlertTitle>
                {verificationError.message}
                
                {/* First failure - Show credit report tip */}
                {verificationError.type === 'incorrect' && verificationError.attempts === 1 && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'info.lighter', borderRadius: 1 }}>
                    <Typography variant="body2" fontWeight={600} gutterBottom>
                      💡 Helpful Tip:
                    </Typography>
                    <Typography variant="body2">
                      These questions come from your credit history. Having a copy of a recent credit report 
                      from any bureau (Experian, Equifax, or TransUnion) may help you answer more accurately.
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      <strong>Already have your credit report?</strong> ✅<br />
                      <strong>Need to get one?</strong> Visit <Link href="https://www.annualcreditreport.com" target="_blank">AnnualCreditReport.com</Link> (free)
                    </Typography>
                  </Box>
                )}

                {/* Second failure - Escalate to support */}
                {verificationError.type === 'incorrect' && verificationError.attempts === 2 && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'warning.lighter', borderRadius: 1 }}>
                    <Typography variant="body2" fontWeight={600} gutterBottom>
                      ⚠️ Still having trouble? You have 1 attempt remaining.
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      We're here to help you complete this process:
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      href="tel:888-724-7344"
                      startIcon={<PhoneIcon />}
                      sx={{ mr: 1, mb: 1 }}
                    >
                      Call 888-724-7344 (24/7)
                    </Button>
                    <Button
                      variant="outlined"
                      color="primary"
                      href="sms:657-332-9833"
                      startIcon={<PhoneIcon />}
                      sx={{ mb: 1 }}
                    >
                      Text Laurie: 657-332-9833
                    </Button>
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      Our 24/7 AI assistant can connect you to live agents during business hours
                    </Typography>
                  </Box>
                )}

                {/* Third failure - Full support intervention */}
                {verificationError.type === 'locked' && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'error.lighter', borderRadius: 1 }}>
                    <Typography variant="body2" fontWeight={600} gutterBottom>
                      Don't worry - Laurie from Speedy Credit Repair is standing by to help!
                    </Typography>
                    
                    <Box sx={{ my: 2 }}>
                      <Button
                        variant="contained"
                        color="error"
                        href="sms:657-332-9833?body=Hi Laurie, I need help with IDIQ verification"
                        startIcon={<PhoneIcon />}
                        fullWidth
                        sx={{ mb: 1 }}
                      >
                        TEXT LAURIE DIRECTLY: 657-332-9833
                      </Button>
                      <Typography variant="caption" display="block" sx={{ textAlign: 'center', mb: 2 }}>
                        ✅ Fastest response during business hours (Mon-Thu, Sat 7:30am-3pm PT)
                      </Typography>

                      <Button
                        variant="outlined"
                        href="mailto:Laurie@speedycreditrepair.com"
                        startIcon={<EmailIcon />}
                        fullWidth
                        sx={{ mb: 1 }}
                      >
                        EMAIL: Laurie@speedycreditrepair.com
                      </Button>

                      <Button
                        variant="outlined"
                        href="tel:888-724-7344"
                        startIcon={<PhoneIcon />}
                        fullWidth
                        sx={{ mb: 2 }}
                      >
                        CALL 24/7: 888-724-7344
                      </Button>
                      
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                        We've alerted our team - expect contact during business hours.
                      </Typography>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="body2" fontWeight={600} gutterBottom>
                      Alternative: Call IDIQ directly
                    </Typography>
                    <Button
                      variant="outlined"
                      color="primary"
                      href="tel:877-875-4347"
                      startIcon={<PhoneIcon />}
                      fullWidth
                    >
                      IDIQ: 877-875-4347
                    </Button>
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      Hours: Mon-Fri 5am-4pm PT | Sat 6:30am-3pm PT
                    </Typography>
                  </Box>
                )}
              </Alert>
            )}

            {/* Verification Questions */}
            {!verificationError?.locked && (
              <>
                <Paper sx={{ p: 3, mb: 3 }}>
                  {(Array.isArray(verificationQuestions) ? verificationQuestions : []).map((question, index) => (
                    <Box key={index} sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                        Question {index + 1} of {(verificationQuestions?.length || 0)}
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {question.question}
                      </Typography>
                      
                      <RadioGroup
                        value={verificationAnswers[index] || ''}
                        onChange={(e) => {
                          setVerificationAnswers(prev => ({
                            ...prev,
                            [index]: e.target.value
                          }));
                        }}
                      >
                        {(question.answers || question.answer || question.choices || []).map((ans, ansIdx) => (
                          <FormControlLabel
                            key={ansIdx}
                            value={ans.id || ans.choice || ans.answer || ans.text || ""}
                            control={<Radio />}
                            label={ans.answer || ans.text || ans.choice || "Select this option"}
                            sx={{ mb: 1 }}
                          />
                        ))}
                      </RadioGroup>
                    </Box>
                  ))}
                </Paper>

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={submitVerificationAnswers}
                    disabled={loading || Object.keys(verificationAnswers).length !== (verificationQuestions?.length || 0)}
                    startIcon={loading ? <CircularProgress size={20} /> : <CheckIcon />}
                  >
                    {loading ? 'Verifying...' : 'Submit Answers'}
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </Fade>
      );
    }

    // Show normal analysis animation
    return (
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
  };

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

        {/* Negative Items Summary */}
        {creditReport?.negativeItems && creditReport.negativeItems.length > 0 && (
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Items We Can Help With ({creditReport.negativeItems.length})
              </Typography>
              <List>
                {creditReport.negativeItems.slice(0, 5).map((item, index) => (
                  <ListItem key={index} divider>
                    <ListItemIcon>
                      <WarningIcon color="error" />
                    </ListItemIcon>
                    <ListItemText
                      primary={`${item.type} - ${item.creditor}`}
                      secondary={`${item.amount ? `$${item.amount}` : ''} ${item.date ? `• ${item.date}` : ''} • ${item.bureau}`}
                    />
                  </ListItem>
                ))}
              </List>
              {creditReport.negativeItems.length > 5 && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  + {creditReport.negativeItems.length - 5} more items
                </Typography>
              )}
            </CardContent>
          </Card>
        )}

        {/* Projected Improvement */}
        <Card sx={{ mb: 4, bgcolor: 'success.50' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TrendingUpIcon sx={{ fontSize: 48, color: 'success.main' }} />
              <Box>
                <Typography variant="h5" fontWeight={700} color="success.main">
                  +{creditReport?.projectedImprovement || 85} Point Potential
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Based on our analysis, we project significant improvement within {creditReport?.improvementTimeline || 6} months
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button onClick={() => setCurrentPhase(1)} startIcon={<ArrowBackIcon />}>
            Back
          </Button>
          <GlowingButton
            onClick={() => setCurrentPhase(4)}
            endIcon={<ArrowForwardIcon />}
          >
            Continue to Document Upload
          </GlowingButton>
        </Box>
      </Box>
    </Fade>
  );

  const renderPhase4 = () => (
    <Fade in timeout={500}>
      <Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Document Upload
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Upload your identification documents to verify your identity.
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
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,application/pdf"
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
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,application/pdf"
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

  // ===== MAIN RENDER =====

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: isCRMMode ? 'transparent' : 'grey.50', py: isCRMMode ? 2 : 4 }}>
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

      {/* Social Proof Notification (PUBLIC MODE ONLY) */}
      {!isCRMMode && (
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
      )}

      {/* Exit Intent Popup (PUBLIC MODE ONLY) */}
      {!isCRMMode && renderExitIntentPopup()}

      {/* Discount Applied Badge */}
      <AnimatePresence>
        {discountApplied && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            style={{
              position: 'fixed',
              bottom: 80,
              right: 80,
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

      {/* AutoSave Indicator */}
      {(currentPhase > 1 || formData.email) && renderAutoSaveIndicator()}

      {/* Session Recovery Dialog */}
      {renderRecoveryDialog()}
    </Box>
  );
};

export default CompleteEnrollmentFlow;