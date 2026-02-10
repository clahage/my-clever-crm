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
import CreditReportDisplay from '../credit/CreditReportDisplay';
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
  // ===== TABLE COMPONENTS (REQUIRED FOR ACCOUNTS DISPLAY) =====
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Person as PersonIcon,
  CreditCard as CreditIcon,
  CreditCard as CreditCardIcon,  // ADDED - alias for SSN card
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
  Visibility as ViewIcon,  // ADDED - alias for document viewing
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
  Delete as DeleteIcon,           // ADDED - for document deletion
  Folder as FolderIcon,           // ADDED - for additional docs section
  InsertDriveFile as FileIcon,    // ADDED - for file list items
  Add as AddIcon,                 // ADDED - for add document buttons
  ExpandMore as ExpandMoreIcon,   // ADDED - for expandable negative items
  ExpandLess as ExpandLessIcon,   // ADDED - for expandable negative items
  OpenInNew as OpenInNewIcon,     // ADDED - for external links
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
import { sendWelcomeEmail, sendIDIQInstructions } from '@/utils/emailTriggers';
import {
  trackEvent,
  trackPhaseComplete,
  trackFormStarted,
  initExitIntent,
  trackExitIntentResponse,
  initInactivityTimer,
  logConversion
} from '@/services/enrollmentTrackingService';
import { updateContactWorkflowStage, WORKFLOW_STAGES } from '@/services/workflowRouterService';
import ViewCreditReportButton from '../credit/ViewCreditReportButton';
import IDIQCreditReportViewer from '../credit/IDIQCreditReportViewer';

// ===== CREDIT ANALYSIS AUTOMATION IMPORT =====
import { runCreditAnalysis } from '@/services/creditAnalysisAutomation';
import { syncIDIQToContact } from '@/services/idiqContactSync';

// ===== PHONE CORRUPTION DETECTION IMPORTS =====
import { 
  detectAndCorrectPhoneCorruption,
  processContactPhoneData,
  getPhoneForIDIQEnrollment,
  trackPhoneCorruption
} from '@/utils/phoneCorruptionFix';

// Helper function for landing page data (not exported from phoneCorruptionFix)
const processLandingPageData = (data) => {
  if (!data) return data;
  const phone = data?.phone || data?.phoneNumber || '';
  const result = detectAndCorrectPhoneCorruption(phone);
  return {
    ...data,
    phone: result?.formatted || result?.cleaned || phone,
    phoneCorruption: result
  };
};

// Helper function for phone correction notification
const createPhoneCorrectionNotification = (info) => ({
  show: info?.corrected || false,
  message: info?.message || 'Phone number was corrected',
  severity: 'info'
});
// ============================================================================
// AUTOSAVE CONSTANTS
// ============================================================================
// ============================================================================
// BUG #13 FIX: AUTOSAVE KEY NAMESPACED BY MODE
// ============================================================================
// The old key 'speedycrm_enrollment_autosave' was shared between admin and
// public sessions, causing Christopher's admin session name to bleed into
// public enrollment forms. Now we use separate keys per mode.
//
// Public enrollments:  speedycrm_enrollment_public
// CRM staff enrollments: speedycrm_enrollment_crm
// This prevents cross-contamination between windows/tabs.
// ============================================================================
const AUTOSAVE_INTERVAL = 30000; // 30 seconds
const AUTOSAVE_KEY_PREFIX = 'speedycrm_enrollment_';
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
    id: 'essentials',
    name: 'Essentials',
    price: 79,
    setupFee: 49,
    description: 'Take control of your credit with AI-powered tools',
    features: ['AI Credit Analysis & Strategy', 'Dispute Letter Templates', 'Client Portal & Progress Tracking', 'Email Support (24-48hr)'],
    popular: false,
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 149,
    setupFee: 0,
    perDeletion: 25,
    description: 'We handle everything for you',
    features: ['Full-Service Disputes (mail + fax)', 'Dedicated Account Manager', 'Phone + Email Support', 'Monthly AI Analysis', '$25/item deleted/bureau'],
    popular: true,
  },
  {
    id: 'vip',
    name: 'VIP Concierge',
    price: 299,
    setupFee: 0,
    description: 'Maximum results, maximum speed',
    features: ['Everything in Professional', 'Bi-Weekly Cycles (2x faster)', 'ALL Deletion Fees Included', '90-Day Guarantee', 'Direct Cell Access', 'Weekly Reports'],
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

  // ===== BUG #13 FIX (ENHANCED): Computed localStorage key per mode + contactId =====
  // Public sessions:  'speedycrm_enrollment_public'  (one public session at a time)
  // CRM sessions:     'speedycrm_enrollment_crm_CONTACTID'  (per-contact so enrollments
  //                    for different clients don't contaminate each other)
  // This prevents admin data from bleeding into public forms AND prevents
  // one CRM enrollment from loading another client's saved data.
  const AUTOSAVE_KEY = isCRMMode && preFilledContactId
    ? `${AUTOSAVE_KEY_PREFIX}crm_${preFilledContactId}`
    : `${AUTOSAVE_KEY_PREFIX}${isCRMMode ? 'crm' : 'public'}`;

  // ===== REFS =====
  const signatureRef = useRef(null);
  const idUploadRef = useRef(null);
  const utilityUploadRef = useRef(null);
  const autoSaveTimerRef = useRef(null);
  const ssnUploadRef = useRef(null);

  // ===== STATE =====
  const [currentPhase, setCurrentPhase] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Contact/Lead data
  const [contactId, setContactId] = useState(null);
  const [enrollmentToken, setEnrollmentToken] = useState(null);
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
// ===== PRE-FILL FROM INITIAL DATA (Landing Page) =====
// When PublicEnrollmentRoute passes contact data via initialData prop,
// this populates the form fields so the user doesn't have to re-type
// their name, email, and phone number.
useEffect(() => {
if (initialData && typeof initialData === 'object') {
console.log('📝 Pre-filling form from initialData:', initialData);
setFormData(prev => ({
...prev,
firstName: initialData.firstName || prev.firstName,
lastName: initialData.lastName || prev.lastName,
email: initialData.email || prev.email,
phone: initialData.phone || prev.phone,
}));
// If initialData includes a contactId, set it
if (initialData.contactId) {
setContactId(initialData.contactId);
}
// If initialData includes an enrollment token (from PublicEnrollmentRoute), store it
// This is used to call markTokenUsed after Phase 1 submit succeeds
if (initialData.enrollmentToken) {
setEnrollmentToken(initialData.enrollmentToken);
console.log('🔑 Enrollment token stored from initialData');
}
}
}, [initialData]);
// Analysis state
const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentAnalysisStep, setCurrentAnalysisStep] = useState(0);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [creditReport, setCreditReport] = useState(null);
  const [showAllNegativeItems, setShowAllNegativeItems] = useState(false);
  

  // Document state
  const [idPhotoUrl, setIdPhotoUrl] = useState(null);
  const [utilityPhotoUrl, setUtilityPhotoUrl] = useState(null);
  const [ssnCardUrl, setSsnCardUrl] = useState(null);
  const [bankStatementUrls, setBankStatementUrls] = useState([]);
  const [additionalDocs, setAdditionalDocs] = useState([]);
  const [uploadingDoc, setUploadingDoc] = useState(null); // Track which doc type is uploading
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const [viewingDocument, setViewingDocument] = useState(null);
  const [signatureData, setSignatureData] = useState(null);

  // Plan & Payment
  const [selectedPlan, setSelectedPlan] = useState('professional');
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);

  // ===== NMI PAYMENT FORM STATE =====
  // paymentMethod: Which tab is selected — 'ach' (bank account) or 'cc' (credit card)
  // paymentFields: All the input values for the payment form
  // paymentError: Specific error message for payment failures (separate from global 'error')
  const [paymentMethod, setPaymentMethod] = useState('ach');  // Default to ACH (most popular)
  const [paymentError, setPaymentError] = useState(null);
  const [paymentFields, setPaymentFields] = useState({
    // ===== ACH (Bank Account) Fields =====
    checkName: '',       // Account holder name (e.g., "John A. Doe")
    checkAba: '',        // Routing number (9 digits)
    checkAccount: '',    // Account number
    accountType: 'checking',  // 'checking' or 'savings'
    bankName: '',        // Bank name (e.g., "Chase")
    // ===== Credit Card Fields =====
    ccNumber: '',        // Full card number (13-19 digits)
    ccExp: '',           // Expiration in MMYY format (e.g., "1228")
    cvv: '',             // CVV (3 or 4 digits)
    cardholderName: '',  // Name on card
  });

  // ===== Auto-fill payment name fields from formData =====
  // When the user enters Phase 7, we pre-populate the "Account Holder Name"
  // and "Cardholder Name" fields with their first + last name from Phase 1.
  // This saves them typing and reduces errors.
  useEffect(() => {
    if (currentPhase === 7 && formData.firstName && formData.lastName) {
      const fullName = `${formData.firstName} ${formData.lastName}`;
      setPaymentFields(prev => ({
        ...prev,
        checkName: prev.checkName || fullName,
        cardholderName: prev.cardholderName || fullName,
      }));
    }
  }, [currentPhase, formData.firstName, formData.lastName]);

  

  // Social proof
  const [showSocialProof, setShowSocialProof] = useState(false);
  const [socialProofCity, setSocialProofCity] = useState('');

  // Animated score counter
  const [displayedScore, setDisplayedScore] = useState(0);

  // SSN visibility
  const [showSSN, setShowSSN] = useState(false);

  // ===== Bug #9 FIX: Floating "Continue" timer on credit report page =====
  // After 8 seconds on Phase 3, a floating button appears at the bottom
  // of the screen so the user knows to continue (they may not scroll down).
  const [showFloatingContinue, setShowFloatingContinue] = useState(false);
  const [floatingCountdown, setFloatingCountdown] = useState(15);
  
  useEffect(() => {
    // Only activate on Phase 3 (credit report review page)
    if (currentPhase !== 3) {
      setShowFloatingContinue(false);
      setFloatingCountdown(15);
      return;
    }
    
    // Show the floating button after 8 seconds
    const showTimer = setTimeout(() => {
      setShowFloatingContinue(true);
    }, 8000);
    
    // Start a 15-second countdown once floating button is shown
    // When countdown reaches 0, auto-scrolls to the Continue button
    let countdownInterval;
    const countdownTimer = setTimeout(() => {
      countdownInterval = setInterval(() => {
        setFloatingCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            // Auto-scroll to the bottom Continue button
            const continueBtn = document.getElementById('phase3-continue-btn');
            if (continueBtn) {
              continueBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, 8000);
    
    return () => {
      clearTimeout(showTimer);
      clearTimeout(countdownTimer);
      if (countdownInterval) clearInterval(countdownInterval);
    };
  }, [currentPhase]);
  
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

  // ===== CREDIT ANALYSIS STATE =====
const [creditAnalysisRunning, setCreditAnalysisRunning] = useState(false);
const [creditAnalysisComplete, setCreditAnalysisComplete] = useState(false);
const [creditAnalysisResult, setCreditAnalysisResult] = useState(null);
const [creditAnalysisError, setCreditAnalysisError] = useState(null);

  // ===== NEW: PHONE CORRUPTION DETECTION STATE =====
  const [phoneCorrectionInfo, setPhoneCorrectionInfo] = useState(null);
  const [showPhoneCorrectionAlert, setShowPhoneCorrectionAlert] = useState(false);

  // ===== NEW: IDIQ CREDIT REPORT WIDGET STATE =====
  const [showFullCreditReport, setShowFullCreditReport] = useState(false);
  const [creditReportMemberToken, setCreditReportMemberToken] = useState(null);
  const [pendingWidgetVerification, setPendingWidgetVerification] = useState(false);

  // ===== SCORE LOADING TIMEOUT STATE (prevents perpetual loading) =====
  const [scoreLoadingTimeout, setScoreLoadingTimeout] = useState(false);
  const [scoreLoadingStartTime, setScoreLoadingStartTime] = useState(null);


  // ===== FIREBASE FUNCTIONS =====
  const functions = getFunctions();
  const idiqService = httpsCallable(functions, 'idiqService');
  const operationsManager = httpsCallable(functions, 'operationsManager');
  const emailService = httpsCallable(functions, 'emailService');

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
      
      // ===== SERVER-SIDE PROGRESS SAVE (for cross-device recovery) =====
      // Only saves lightweight progress data, not the full form.
      // Full form data is already on the contact from Phase 1 submit.
      if (contactId && currentPhase > 1) {
        updateDoc(doc(db, 'contacts', contactId), {
          enrollmentProgress: {
            currentPhase,
            selectedPlan: selectedPlan || null,
            hasIdPhoto: !!idPhotoUrl,
            hasUtilityPhoto: !!utilityPhotoUrl,
            hasSignature: !!signatureData,
            enrollmentId: enrollmentId || null,
            membershipNumber: membershipNumber || null,
            lastSavedAt: serverTimestamp(),
            abandoned: false
          }
        }).catch(err => console.warn('⚠️ Server-side progress save failed:', err.message));
      }
      
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
      setSelectedPlan(recoveryData.selectedPlan || 'professional');
      setIdPhotoUrl(recoveryData.idPhotoUrl || null);
      setUtilityPhotoUrl(recoveryData.utilityPhotoUrl || null);
      setSignatureData(recoveryData.signatureData || null);
      setEnrollmentId(recoveryData.enrollmentId || null);
      setMembershipNumber(recoveryData.membershipNumber || null);
      setVerificationAnswers(recoveryData.verificationAnswers || {});
      
      // Clear the abandoned flag in Firebase so we don't offer recovery again
      if (recoveryData.contactId) {
        updateDoc(doc(db, 'contacts', recoveryData.contactId), {
          'enrollmentProgress.abandoned': false,
          'enrollmentProgress.resumedAt': serverTimestamp()
        }).catch(err => console.warn('⚠️ Failed to clear abandoned flag:', err.message));
      }
      
      setShowRecoveryDialog(false);
      setSuccess(
        recoveryData.source === 'server'
          ? '🔄 Enrollment recovered from our servers! Continuing where you left off...'
          : 'Session restored! Continuing where you left off...'
      );
      console.log('✅ Session restored successfully', recoveryData.source === 'server' ? '(from server)' : '(from localStorage)');
      
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

  // ===== SERVER-SIDE ENROLLMENT RECOVERY =====
  // When someone opens enrollment on a different device/browser,
  // there's no localStorage data. Check Firebase for abandoned progress.
  useEffect(() => {
    const checkServerRecovery = async () => {
      // Only check if we have a contactId from initialData (public flow)
      // AND there's no localStorage recovery already showing
      if (!contactId || showRecoveryDialog || currentPhase > 1) return;
      
      // Check if localStorage already has data (handled by checkForSavedSession)
      const localData = localStorage.getItem(AUTOSAVE_KEY);
      if (localData) return; // localStorage recovery takes priority
      
      try {
        const contactRef = doc(db, 'contacts', contactId);
        const contactSnap = await getDoc(contactRef);
        
        if (!contactSnap.exists()) return;
        
        const contact = contactSnap.data();
        const progress = contact.enrollmentProgress;
        
        // Only offer recovery if enrollment was abandoned and past Phase 1
        if (progress?.abandoned && progress?.currentPhase > 1) {
          const abandonedAt = progress.abandonedAt ? new Date(progress.abandonedAt) : null;
          const hoursSinceAbandoned = abandonedAt 
            ? (Date.now() - abandonedAt.getTime()) / (1000 * 60 * 60) 
            : 999;
          
          // Only recover if abandoned less than 48 hours ago
          if (hoursSinceAbandoned < 48) {
            console.log('🔄 Found abandoned enrollment on server - Phase', progress.currentPhase);
            
            // Build recovery data from the contact document
            setRecoveryData({
              formData: {
                firstName: contact.firstName || '',
                lastName: contact.lastName || '',
                email: contact.email || '',
                phone: contact.phone || '',
                street: contact.street || '',
                city: contact.city || '',
                state: contact.state || '',
                zip: contact.zip || '',
                dateOfBirth: contact.dateOfBirth || '',
              },
              currentPhase: progress.currentPhase,
              contactId: contactId,
              selectedPlan: progress.selectedPlan || 'professional',
              enrollmentId: progress.enrollmentId || null,
              membershipNumber: progress.membershipNumber || null,
              savedAt: progress.abandonedAt || new Date().toISOString(),
              source: 'server', // Flag so we know this came from Firebase, not localStorage
            });
            setShowRecoveryDialog(true);
          }
        }
      } catch (err) {
        console.warn('⚠️ Server recovery check failed:', err.message);
      }
    };
    
    // Small delay to let localStorage check run first
    const timer = setTimeout(checkServerRecovery, 1000);
    return () => clearTimeout(timer);
  }, [contactId, showRecoveryDialog, currentPhase]);

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

  // ===== SCORE LOADING TIMEOUT HANDLER =====
  // Prevents perpetual loading spinner by showing fallback UI after 15 seconds
  useEffect(() => {
    // Only activate when in phase 3 with credit report showing but no score yet
    if (currentPhase === 3 && showFullCreditReport && creditReportMemberToken && !displayedScore) {
      // Start the timer if not already started
      if (!scoreLoadingStartTime) {
        console.log('⏱️ Starting score loading timeout timer...');
        setScoreLoadingStartTime(Date.now());
      }
      
      // Set timeout to show fallback after 15 seconds
      const timeoutId = setTimeout(() => {
        if (!displayedScore) {
          console.log('⚠️ Score loading timed out after 15 seconds - showing fallback UI');
          setScoreLoadingTimeout(true);
        }
      }, 15000); // 15 seconds
      
      return () => clearTimeout(timeoutId);
    }
  }, [currentPhase, showFullCreditReport, creditReportMemberToken, displayedScore, scoreLoadingStartTime]);

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

          // Mark server-side progress as abandoned for cross-device recovery
          updateDoc(doc(db, 'contacts', contactId), {
            'enrollmentProgress.abandoned': true,
            'enrollmentProgress.abandonedAt': new Date().toISOString(),
            'enrollmentProgress.abandonedPhase': currentPhase
          }).catch(() => {}); // Fire-and-forget on page close

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
    // ============================================================================
// FIXED loadContactData FUNCTION
// ============================================================================
// REPLACE lines 820-890 in CompleteEnrollmentFlow.jsx with this code
//
// FIXES:
// 1. Maps emails[0].address → email
// 2. Maps phones[0].number → phone  
// 3. Maps addresses[0] → street, city, state, zip
// 4. Maps ssn field
// 5. Maps dateOfBirth field
// 6. Maps employment fields
//
// © 1995-2026 Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved
// ============================================================================

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
            
            // ===== EXTRACT DATA FROM ARRAY STRUCTURES =====
            // Get primary email from emails array
            const primaryEmail = data.emails?.find(e => e.isPrimary)?.address || 
                                data.emails?.[0]?.address || 
                                data.email || '';
            
            // Get primary phone from phones array
            const primaryPhone = data.phones?.find(p => p.isPrimary)?.number || 
                                data.phones?.[0]?.number || 
                                data.phone || '';
            
            // Get primary address from addresses array
            const primaryAddress = data.addresses?.find(a => a.isPrimary) || 
                                  data.addresses?.[0] || 
                                  data.address || {};
            
            // Get employment data
            const employment = data.employment || {};
            
            console.log('📋 Extracted contact data:', {
              email: primaryEmail,
              phone: primaryPhone,
              address: primaryAddress,
              ssn: data.ssn ? '***-**-' + (data.ssn?.slice(-4) || data.ssnLast4) : 'none',
              dob: data.dateOfBirth
            });
            
            // ===== PHONE CORRUPTION DETECTION FOR CRM CONTACT =====
            // Create a flat object for phone processing
            const flatContactData = {
              ...data,
              email: primaryEmail,
              phone: primaryPhone,
              street: primaryAddress.street || '',
              city: primaryAddress.city || '',
              state: primaryAddress.state || '',
              zip: primaryAddress.zip || primaryAddress.zipCode || '',
            };
            
            const processedContactData = processContactPhoneData(flatContactData);
            
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

            // ===== PRE-FILL FORM WITH ALL CONTACT DATA =====
            setFormData(prev => ({
              ...prev,
              // Basic Info
              firstName: data.firstName || prev.firstName,
              middleName: data.middleName || prev.middleName,
              lastName: data.lastName || prev.lastName,
              suffix: data.suffix || prev.suffix,
              
              // Contact Info (from arrays)
              email: primaryEmail || prev.email,
              phone: processedContactData.phone || primaryPhone || prev.phone,
              carrier: data.carrier || processedContactData.carrier || prev.carrier,
              
              // Address (from addresses array)
              street: primaryAddress.street || prev.street,
              unit: primaryAddress.unit || prev.unit,
              city: primaryAddress.city || prev.city,
              state: primaryAddress.state || prev.state,
              zip: primaryAddress.zip || primaryAddress.zipCode || prev.zip,
              
              // Sensitive Info
              ssn: data.ssn || prev.ssn,
              dateOfBirth: data.dateOfBirth || prev.dateOfBirth,
              
              // Employment Info
              employer: employment.employer || data.employer || prev.employer,
              income: employment.monthlyIncome || data.income || prev.income,
              occupation: employment.jobTitle || data.occupation || prev.occupation,
              
              // IDIQ specific
              secretWord: data.idiq?.secretWord || data.secretWord || prev.secretWord,
              
              // Tracking
              source: 'crm_enrollment',
            }));
            
            console.log('✅ CRM Mode: Contact data pre-filled successfully');
            console.log('   Name:', data.firstName, data.lastName);
            console.log('   Email:', primaryEmail);
            console.log('   Phone:', processedContactData.phone || primaryPhone);
            console.log('   Address:', primaryAddress.street, primaryAddress.city, primaryAddress.state, primaryAddress.zip);
            console.log('   SSN:', data.ssn ? 'Present (hidden)' : 'Not provided');
            console.log('   DOB:', data.dateOfBirth || 'Not provided');
            // ===== PRE-LOAD UPLOADED DOCUMENTS FROM CONTACT =====
            // Photo ID - check multiple possible field locations
            const existingIdPhoto = data.photoIdUrl || 
                                   data.documents?.idFileUrl || 
                                   data.idFileUrl || 
                                   null;
            
            if (existingIdPhoto) {
              console.log('📄 Found existing Photo ID, pre-loading...');
              setIdPhotoUrl(existingIdPhoto);
            }
            
            // Utility Bill / Proof of Address - check multiple possible field locations
            const existingUtilityBill = data.utilityBillUrl || 
                                        data.documents?.proofOfAddressFileUrl || 
                                        data.proofOfAddressFileUrl ||
                                        data.documents?.utilityBillUrl ||
                                        null;
            
            if (existingUtilityBill) {
              console.log('📄 Found existing Utility Bill, pre-loading...');
              setUtilityPhotoUrl(existingUtilityBill);
            }
            
            // SSN Card - check for existing
            const existingSSNCard = data.documents?.ssnCardFileUrl || 
                                   data.ssnCardFileUrl || 
                                   null;
            
            if (existingSSNCard) {
              console.log('📄 Found existing SSN Card, pre-loading...');
              setSsnCardUrl(existingSSNCard);
            }
            
            // Bank Statements - check for existing
            const existingBankStatements = data.documents?.bankStatementsFileUrls || 
                                          data.bankStatementsFileUrls || 
                                          [];
            
            if (existingBankStatements.length > 0) {
              console.log('📄 Found existing Bank Statements:', existingBankStatements.length);
              setBankStatementUrls(existingBankStatements);
            }
            
            // Additional/Misc Documents - check for existing
            const existingAdditionalDocs = data.documents?.additionalDocs || 
                                          data.additionalDocs || 
                                          [];
            
            if (existingAdditionalDocs.length > 0) {
              console.log('📄 Found existing Additional Docs:', existingAdditionalDocs.length);
              setAdditionalDocs(existingAdditionalDocs);
            }
            
            console.log('📄 Documents pre-loaded:', {
              photoId: existingIdPhoto ? 'Yes' : 'No',
              utilityBill: existingUtilityBill ? 'Yes' : 'No',
              ssnCard: existingSSNCard ? 'Yes' : 'No',
              bankStatements: existingBankStatements.length,
              additionalDocs: existingAdditionalDocs.length
            });
            
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
      // Only restore creditReport if we don't have fresh API data
      if (savedState.creditReport) {
        console.log('📂 Checking if should restore creditReport from localStorage...');
        setCreditReport(prev => {
          if (prev?._freshFromAPI) {
            console.log('🚫 Skipping - fresh API data exists with', prev.accounts?.length, 'accounts');
            return prev;
          }
          console.log('📂 Restoring creditReport from localStorage');
          return savedState.creditReport;
        });
      }
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
    // ===== REQUIRED FIELDS =====
    // carrier is OPTIONAL (many people don't know theirs)
    // password is REQUIRED (becomes SpeedyCRM + IDIQ login)
    const required = ['firstName', 'lastName', 'email', 'phone', 'password'];
    for (const field of required) {
      if (!formData[field]) {
        const friendlyName = field === 'password'
          ? 'password (this will be your portal & credit monitoring login)'
          : field.replace(/([A-Z])/g, ' $1').toLowerCase();
        setError(`Please fill in your ${friendlyName}`);
        return false;
      }
    }
    // ===== EMAIL VALIDATION =====
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    // ===== PASSWORD VALIDATION (IDIQ-grade) =====
    // Must be 8+ chars with: uppercase, lowercase, number, symbol
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return false;
    }
    if (!/[A-Z]/.test(formData.password)) {
      setError('Password must include at least one uppercase letter (A-Z).');
      return false;
    }
    if (!/[a-z]/.test(formData.password)) {
      setError('Password must include at least one lowercase letter (a-z).');
      return false;
    }
    if (!/[0-9]/.test(formData.password)) {
      setError('Password must include at least one number (0-9).');
      return false;
    }
    if (!/[^A-Za-z0-9]/.test(formData.password)) {
      setError('Password must include at least one symbol (!@#$%^& etc.).');
      return false;
    }
    // ===== ADDRESS VERIFICATION =====
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

      // ===== SMART CONTACT HANDLING =====
  // If contactId exists (from landing page or CRM mode), UPDATE it.
  // This ensures all new fields (address, DOB, SSN, carrier, etc.)
  // get saved to the SAME contact created by the landing page.
  if (contactId) {
    console.log('📝 Updating existing contact:', contactId);
    const cleanedData = Object.fromEntries(
      Object.entries(submissionData).filter(([_, value]) => value !== undefined)
    );
    
    // ===== BUILD STRUCTURED DATA FOR CONTACT FORM =====
    // UltimateContactForm reads from nested arrays (addresses, phones, emails)
    // so we must update BOTH flat fields AND structured arrays.
    const structuredUpdate = {
      ...cleanedData,
      updatedAt: serverTimestamp(),
      enrollmentStartedAt: serverTimestamp(),
      enrollmentSource: isCRMMode ? 'crm_enrollment' : 'landing_page',
      pipeline: 'enrollment-started',
    };

    // Update addresses array if we have address data
    if (submissionData.street || submissionData.city || submissionData.state || submissionData.zip) {
      structuredUpdate['addresses'] = [{
        street: submissionData.street || '',
        city: submissionData.city || '',
        state: submissionData.state || '',
        zip: submissionData.zip || '',
        type: 'home',
        isPrimary: true,
        verified: false,
        verifiedDate: null,
        unit: '',
        rentOrOwn: 'rent',
        monthlyPayment: '',
        moveInDate: '',
      }];
    }

    // Update phones array if we have phone data
    if (cleanedData.phone) {
      structuredUpdate['phones'] = [{
        number: cleanedData.phone,
        type: 'mobile',
        isPrimary: true,
        canCall: true,
        canText: true,
        verified: false,
      }];
    }

    // Update emails array if we have email data
    if (cleanedData.email) {
      structuredUpdate['emails'] = [{
        address: cleanedData.email,
        type: 'personal',
        isPrimary: true,
        verified: false,
        lastOpened: null,
      }];
    }

    // Update dateOfBirth if provided
    if (submissionData.dateOfBirth) {
      structuredUpdate['dateOfBirth'] = submissionData.dateOfBirth;
    }

    // Update SSN last 4 if provided (never store full SSN)
    if (submissionData.ssn) {
      const cleanSSN = submissionData.ssn.replace(/\D/g, '');
      structuredUpdate['ssnLast4'] = cleanSSN.slice(-4);
      // Remove full SSN from the update - security!
      delete structuredUpdate.ssn;
    }

    // Remove password from contact document - security!
    delete structuredUpdate.password;

    await updateDoc(doc(db, 'contacts', contactId), structuredUpdate);
    console.log('✅ Existing contact updated with structured data:', contactId);
  } else {
    console.log('👤 No existing contact, creating new one...');
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

      // ===== MARK TOKEN AS USED (prevents reuse of enrollment link) =====
      // Only runs for public flow where enrollmentToken was passed via initialData
      // Uses the operationsManager already declared at top of component
      if (enrollmentToken && contactId) {
        try {
          await operationsManager({
            action: 'markTokenUsed',
            token: enrollmentToken,
            contactId: contactId
          });
          console.log('✅ Enrollment token marked as used');
        } catch (tokenErr) {
          // Non-blocking: if this fails, enrollment still continues
          console.warn('⚠️ Failed to mark token as used (non-blocking):', tokenErr.message);
        }
      }

      // ============================================================================
      // BUG #11 FIX: CREATE PORTAL ACCOUNT AT PHASE 1 (not Phase 10)
      // ============================================================================
      // Christopher's decision: Create Firebase Auth account the moment they
      // submit Phase 1 (name, email, phone, password). This gives us:
      //   - Login credentials for recovery/drip campaigns
      //   - Email with account info sent immediately
      //   - Full campaign capability even if they abandon at Phase 2+
      //
      // Non-blocking: enrollment continues even if this fails.
      // The createPortalAccount case in operationsManager handles:
      //   1. Creates Firebase Auth user (email + password)
      //   2. Creates userProfiles doc (role: 'client', permissions)
      //   3. Updates contact with portalUserId
      // If account already exists (auth/email-already-exists), it's caught gracefully.
      // ============================================================================
      if (formData.email && formData.password && !isCRMMode) {
        try {
          console.log('🔑 Creating portal account at Phase 1 for:', formData.email);
          const portalResult = await operationsManager({
            action: 'createPortalAccount',
            contactId: contactId,
            email: formData.email,
            password: formData.password,
            firstName: formData.firstName || '',
            lastName: formData.lastName || '',
          });

          if (portalResult.data?.success) {
            console.log('✅ Portal account created at Phase 1! UID:', portalResult.data.portalUserId);
          } else {
            console.warn('⚠️ Portal account creation returned:', portalResult.data?.error);
          }
        } catch (portalErr) {
          // Common case: account already exists — that's fine, means they've been here before
          console.warn('⚠️ Phase 1 portal account creation failed (non-blocking):', portalErr.message);
        }
      }

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
  console.log("📋 Full response structure:", JSON.stringify(response.data, null, 2).substring(0, 1000));
  console.log("🔍 verificationRequired:", response.data.verificationRequired);
  console.log("🔍 needsWidgetVerification:", response.data.needsWidgetVerification);
  console.log("🔍 questions:", response.data.questions?.length || 0);
  console.log("🔍 verificationQuestions:", response.data.verificationQuestions?.length || 0);

      // ===== HANDLE WIDGET-BASED VERIFICATION =====
      // This happens when IDIQ couldn't generate security questions but member still needs verification
      if (response.data.needsWidgetVerification && !response.data.vantageScore && !response.data.data?.vantageScore) {
        console.log("🔐 Widget verification required - no credit data yet");
        
        // Store member token for widget
        if (response.data?.memberToken) {
          setCreditReportMemberToken(response.data.memberToken);
          console.log('✅ Member token stored for widget verification');
        }
        
        // Set flag to indicate verification is pending
        setPendingWidgetVerification(true);
        
        // Show the widget which will handle identity verification
        setShowFullCreditReport(true);
        setAnalysisComplete(true);
        setCurrentPhase(3);
        setLoading(false);
        
        // Set a flag to indicate widget verification is in progress
        console.log('📋 IDIQ widget will handle identity verification');
        
        return;
      }

      // Check if verification is required (security questions path)
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
      
      // ===== CRITICAL: Extract accounts from all possible paths =====
      const extractedAccounts = 
        response.data?.accounts ||           // Top level accounts
        response.data?.data?.accounts ||     // Nested in data
        resData?.accounts ||                 // In resData
        [];
      
      // ===== CRITICAL: Build complete credit report object =====
      const completeCreditReport = {
        ...resData,
        vantageScore: response.data?.vantageScore || resData?.vantageScore || response.data?.data?.vantageScore,
        accounts: extractedAccounts,
        accountCount: extractedAccounts.length,
      };
      
      console.log('📊 Extracted accounts:', extractedAccounts.length);
      console.log('📊 Complete credit report object:', {
        hasVantageScore: !!completeCreditReport.vantageScore,
        accountCount: completeCreditReport.accounts?.length || 0,
        sampleAccount: completeCreditReport.accounts?.[0] || 'none'
      });
      
      // ===== CRITICAL: Store member token for widget =====
      if (response.data?.memberToken) {
        setCreditReportMemberToken(response.data.memberToken);
        console.log('✅ Member token stored for credit report widget');
      }
      setShowFullCreditReport(true);
      // ===== CRITICAL: Set fresh creditReport with accounts =====
      console.log('🔥 Setting FRESH creditReport with', completeCreditReport.accounts?.length, 'accounts');
      setCreditReport({
        ...completeCreditReport,
        _freshFromAPI: true,
        _fetchedAt: Date.now()
      });
      
      // ===== CRITICAL: Store member token for widget =====
      if (response.data?.memberToken) {
        setCreditReportMemberToken(response.data.memberToken);
        console.log('✅ Member token stored for credit report widget');
      }
      setShowFullCreditReport(true);
      setEnrollmentId(response.data.enrollmentId || `ENR-${Date.now()}`);
      setAnalysisComplete(true);

      try {
        await updateDoc(doc(db, 'contacts', contactId), {
          idiqEnrollment: {
            status: 'active',
            enrollmentId: response.data.enrollmentId || `ENR-${Date.now()}`,
            membershipNumber: response.data.membershipNumber || null,
            enrolledAt: serverTimestamp(),
            creditScore: resData.vantageScore || resData.score || null,
            // ===== CRITICAL: Save account counts for AI Review Generator =====
            accountCount: extractedAccounts?.length || resData?.accounts?.length || 0,
            negativeItemCount: resData?.negativeItems?.length || 0,
            inquiryCount: resData?.inquiries?.length || 0,
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
          enrollmentId: response.data.enrollmentId || null,
          membershipNumber: response.data.membershipNumber || null,
          creditScore: resData.vantageScore || resData.score || null,
          plan: selectedPlan || null,
          verificationRequired: false
        });
        
        // ===== UPDATE WORKFLOW STAGE =====
        await updateContactWorkflowStage(contactId, WORKFLOW_STAGES.CREDIT_REPORT_PULLED, {
          idiqMemberId: response.data.membershipNumber || null,
          creditScore: resData.vantageScore || resData.score || null
        });
        
        console.log('✅ IDIQ enrollment status updated (no verification)');

        // ============================================================================
        // BUG #6 FIX: Store full credit report data to Firestore
        // ============================================================================
        // Previously, only summary data (score, counts) was saved to the contact.
        // The full tradeline/account data stayed in React state only, which means:
        //   - AI can't analyze the report (no data in Firestore)
        //   - Client portal has nothing to display
        //   - Dispute strategy can't be generated
        //
        // Now we save the full report to a 'creditReports' subcollection under the contact.
        // We strip internal fields (_freshFromAPI, _fetchedAt) before saving.
        // Non-blocking: if this fails, enrollment still continues.
        // ============================================================================
        try {
          const reportToSave = { ...completeCreditReport };
          // Remove internal flags that shouldn't go to Firestore
          delete reportToSave._freshFromAPI;
          delete reportToSave._fetchedAt;

          await addDoc(collection(db, 'contacts', contactId, 'creditReports'), {
            source: 'idiq',
            fetchedAt: serverTimestamp(),
            vantageScore: completeCreditReport.vantageScore || null,
            accountCount: extractedAccounts?.length || 0,
            negativeItemCount: completeCreditReport.negativeItems?.length || 0,
            inquiryCount: completeCreditReport.inquiries?.length || 0,
            membershipNumber: response.data.membershipNumber || null,
            enrollmentId: response.data.enrollmentId || null,
            reportData: reportToSave,
          });
          console.log('✅ Full credit report data stored to Firestore (creditReports subcollection)');
        } catch (reportSaveErr) {
          console.error('⚠️ Failed to save full credit report to Firestore (non-blocking):', reportSaveErr.message);
        }
      } catch (updateErr) {
        console.error('❌ Failed to update IDIQ enrollment status:', updateErr);
      }
      
      // ===== TRIGGER CREDIT ANALYSIS AUTOMATION =====
      // All fields use || null to prevent Firebase "Unsupported field value: undefined" errors
      await handleCreditAnalysis({
        memberToken: response.data.memberToken || null,
        idiqMemberToken: response.data.memberToken || null,
        membershipNumber: response.data.membershipNumber || null,
        idiqMembershipNumber: response.data.membershipNumber || null,
        enrollmentId: response.data.enrollmentId || null,
        creditScore: resData.vantageScore || resData.score || null,
        ...response.data
      });
      
      // Note: handleCreditAnalysis will auto-advance to Phase 3
      // ===== IMPROVED SCORE EXTRACTION (handles IDIQ BundleComponent structure) =====
      const extractScoreFromResponse = (data) => {
        // Path 1: Direct vantageScore (backend extracted)
        if (data?.vantageScore) return parseInt(data.vantageScore, 10);
        if (data?.score) return parseInt(data.score, 10);
        
        // Path 2: Nested data.vantageScore
        if (data?.data?.vantageScore) return parseInt(data.data.vantageScore, 10);
        
        // Path 3: BundleComponent CreditScoreType (IDIQ raw response)
        const bc = data?.BundleComponents?.BundleComponent || 
                   data?.data?.BundleComponents?.BundleComponent;
        if (bc?.CreditScoreType?.['@riskScore']) {
          return parseInt(bc.CreditScoreType['@riskScore'], 10);
        }
        
        // Path 4: TrueLink Borrower CreditScore (thin files like Roman)
        const trueLink = bc?.TrueLinkCreditReportType;
        if (trueLink?.Borrower?.CreditScore) {
          const scores = Array.isArray(trueLink.Borrower.CreditScore) 
            ? trueLink.Borrower.CreditScore 
            : [trueLink.Borrower.CreditScore];
          for (const s of scores) {
            const score = parseInt(s?.['@riskScore'] || s?.riskScore, 10);
            if (score >= 300 && score <= 850) return score;
          }
        }
        
        // Path 5: Bureau-specific scores
        const bureaus = data?.bureaus || data?.data?.bureaus;
        if (bureaus) {
          return bureaus?.transunion?.score || bureaus?.experian?.score || bureaus?.equifax?.score;
        }
        
        return null;
      };
      
      const targetScore = extractScoreFromResponse(resData);

      console.log("🎯 Final Score Detected for Animation:", targetScore);
      console.log("📊 Response structure:", { 
        hasVantageScore: !!resData.vantageScore,
        hasDataVantageScore: !!resData.data?.vantageScore,
        hasReportDataVantageScore: !!resData.reportData?.vantageScore,
        hasAccountsArray: !!resData.data?.accounts,
        accountCount: resData.data?.accounts?.length || 0
      });
      if (targetScore) {
        animateScore(targetScore);
      } else {
        console.warn("⚠️ No credit score found in report data");
        setDisplayedScore(null);
      }
    
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
      
      // ===== CRITICAL: Store member token for widget =====
      if (response.data?.memberToken) {
        setCreditReportMemberToken(response.data.memberToken);
        console.log('✅ Member token stored for credit report widget');
      }
      setShowFullCreditReport(true);
    const successFlag = response.data?.success && response.data?.verified;

    console.log("✅ Verification response:", response.data);

    if (successFlag) {
      console.log("🎉 Verification successful!");
      
      setCreditReport(resData);
      setVerificationRequired(false);
      
      // ===== NEW: Store member token and show full credit report =====
      if (response.data?.memberToken) {
        setCreditReportMemberToken(response.data.memberToken);
        console.log('✅ Member token received for credit report widget');
      }
      setShowFullCreditReport(true);
      console.log('📊 Enabling full credit report display');
      
      try {
        await updateDoc(doc(db, 'contacts', contactId), {
          idiqEnrollment: {
            status: 'active',
            enrollmentId: enrollmentId || `ENR-${Date.now()}`,
            membershipNumber: membershipNumber || response.data.membershipNumber || null,
            enrolledAt: serverTimestamp(),
            verifiedAt: serverTimestamp(),
            creditScore: resData.vantageScore || resData.score || null,
            // ===== CRITICAL: Save account counts for AI Review Generator =====
            accountCount: resData?.accounts?.length || resData?.data?.accounts?.length || 0,
            negativeItemCount: resData?.negativeItems?.length || resData?.data?.negativeItems?.length || 0,
            inquiryCount: resData?.inquiries?.length || resData?.data?.inquiries?.length || 0,
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
          enrollmentId: enrollmentId || null,
          membershipNumber: membershipNumber || response.data.membershipNumber || null,
          creditScore: resData.vantageScore || resData.score || null,
          plan: selectedPlan || null,
          verificationRequired: true
        });

        // ===== 🚀 CRITICAL FIX: TRIGGER CUSTOMER EMAILS =====
        console.log('📧 Triggering customer email automation...');
        
        try {
          // Import the working email triggers (add this to imports at top of file)
          const { sendWelcomeEmail, sendIDIQInstructions } = await import('@/utils/emailTriggers');
          
          // Send IDIQ instructions email immediately
          const idiqEmailResult = await sendIDIQInstructions(contactId, {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email
          }, membershipNumber || response.data.membershipNumber || 'See IDIQ Email');
          
          if (idiqEmailResult?.success) {
            console.log('✅ IDIQ instructions email sent successfully');
          } else {
            console.error('❌ IDIQ instructions email failed:', idiqEmailResult?.error);
          }
          
          // Send welcome email (if not already sent)
          const welcomeEmailResult = await sendWelcomeEmail(contactId, {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email
          });
          
          if (welcomeEmailResult?.success) {
            console.log('✅ Welcome email sent successfully');
          } else {
            console.error('❌ Welcome email failed:', welcomeEmailResult?.error);
          }
          
        } catch (emailError) {
          console.error('❌ Customer email automation failed:', emailError);
          // Don't block the enrollment process if emails fail
        }
        // ===== END EMAIL AUTOMATION FIX =====

        // ============================================================================
        // BUG #6 FIX: Store full credit report data (verification path)
        // ============================================================================
        try {
          await addDoc(collection(db, 'contacts', contactId, 'creditReports'), {
            source: 'idiq',
            fetchedAt: serverTimestamp(),
            vantageScore: resData.vantageScore || resData.score || null,
            accountCount: resData?.accounts?.length || 0,
            negativeItemCount: resData?.negativeItems?.length || 0,
            inquiryCount: resData?.inquiries?.length || 0,
            membershipNumber: membershipNumber || response.data.membershipNumber || null,
            enrollmentId: enrollmentId || null,
            verificationRequired: true,
            reportData: resData,
          });
          console.log('✅ Full credit report saved to Firestore (verified path)');
        } catch (reportSaveErr) {
          console.error('⚠️ Failed to save credit report to Firestore (non-blocking):', reportSaveErr.message);
        }
        
      } catch (updateErr) {
        console.error('❌ Failed to update IDIQ enrollment status:', updateErr);
      }
      
      setCurrentPhase(3);
      
      const targetScore = 
        resData.vantageScore || 
        resData.score || 
        resData.data?.vantageScore || 
        resData.data?.reportData?.vantageScore || 
        resData.reportData?.vantageScore || 
        null;
      if (targetScore) {
        animateScore(targetScore);
      } else {
        console.warn("⚠️ No credit score available");
        setDisplayedScore(null);
      }
      
    } else if (response.data?.locked) {
      console.log("🚫 Account locked - notifying support");
      setVerificationError({
        type: 'locked',
        message: response.data.message || 'Account locked. Please contact support.',
        attemptsRemaining: 0
      });
      
      // Send alert email to Laurie for locked accounts
      try {
        // Use the working emailService function instead of broken sendEmail
        await emailService({
          action: 'send',
          to: 'Laurie@speedycreditrepair.com',
          subject: `🚨 IDIQ Verification Locked - ${formData.firstName} ${formData.lastName}`,
          body: `Client Verification Locked

Name: ${formData.firstName} ${formData.lastName}
Email: ${formData.email}
Phone: ${formData.phone}
Enrollment ID: ${enrollmentId}

The customer has been locked out of IDIQ verification. Please contact them immediately and assist with manual verification.

Time: ${new Date().toLocaleString()}`,
          recipientName: 'Laurie',
          contactId: contactId,
          templateType: 'admin_alert'
        });
        
        console.log('✅ Admin alert email sent to Laurie');
      } catch (alertEmailError) {
        console.error('❌ Failed to send admin alert email:', alertEmailError);
      }
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
      setDisplayedScore(Math.round(targetScore * eased));

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

  // ============================================================================
  // handleNMIPayment — MAIN PAYMENT HANDLER
  // ============================================================================
  // This is called when the user clicks "Complete Payment" in Phase 7.
  // It validates the payment fields, then calls our Cloud Function
  // (operationsManager → processNewEnrollment), which talks to NMI server-side.
  //
  // FLOW:
  //   1. Validate all required fields based on payment method (ACH or CC)
  //   2. Build the params object with customer info + payment info
  //   3. Call operationsManager({ action: 'processNewEnrollment', ... })
  //   4. If success → finalizeEnrollment() (moves to Phase 8)
  //   5. If failure → show error message to user
  //
  // SECURITY:
  //   - Bank/card numbers are sent over HTTPS to our Cloud Function
  //   - Cloud Function sends them to NMI (server-side, never exposed)
  //   - NMI returns a vault token — that's all we store in Firestore
  //   - Raw numbers are NEVER stored anywhere in our system
  // ============================================================================
  const handleNMIPayment = async () => {
    // ===== Clear any previous errors =====
    setPaymentError(null);
    setError(null);

    // ===== Get the selected plan data =====
    const plan = SERVICE_PLANS.find((p) => p.id === selectedPlan);
    const finalPrice = Math.max(plan.price - appliedDiscount, 0);

    console.log('💳 handleNMIPayment called:', {
      plan: plan.name,
      price: finalPrice,
      method: paymentMethod,
      contactId: contactId,
    });

    // ─────────────────────────────────────────────
    // SKIP PAYMENT — CRM mode or free trial
    // ─────────────────────────────────────────────
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
          phase: currentPhase,
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

    // ─────────────────────────────────────────────
    // VALIDATE — ACH fields
    // ─────────────────────────────────────────────
    if (paymentMethod === 'ach') {
      if (!paymentFields.checkName.trim()) {
        setPaymentError('Please enter the account holder name.');
        return;
      }
      if (!paymentFields.checkAba || paymentFields.checkAba.length !== 9) {
        setPaymentError('Please enter a valid 9-digit routing number.');
        return;
      }
      if (!paymentFields.checkAccount || paymentFields.checkAccount.length < 4) {
        setPaymentError('Please enter a valid account number (at least 4 digits).');
        return;
      }
    }

    // ─────────────────────────────────────────────
    // VALIDATE — Credit Card fields
    // ─────────────────────────────────────────────
    if (paymentMethod === 'cc') {
      if (!paymentFields.ccNumber || paymentFields.ccNumber.length < 13) {
        setPaymentError('Please enter a valid card number (13-19 digits).');
        return;
      }
      if (!paymentFields.ccExp || paymentFields.ccExp.length !== 4) {
        setPaymentError('Please enter the expiration date in MMYY format (e.g. 1228).');
        return;
      }
      // ===== Basic month validation =====
      const expMonth = parseInt(paymentFields.ccExp.slice(0, 2), 10);
      if (expMonth < 1 || expMonth > 12) {
        setPaymentError('Invalid expiration month. Please use MMYY format (01-12 for month).');
        return;
      }
      if (!paymentFields.cvv || paymentFields.cvv.length < 3) {
        setPaymentError('Please enter a valid CVV (3 or 4 digits).');
        return;
      }
    }

    // ─────────────────────────────────────────────
    // CALL NMI via operationsManager Cloud Function
    // ─────────────────────────────────────────────
    setLoading(true);
    try {
      console.log('🚀 Calling operationsManager → processNewEnrollment...');

      // ===== Build the params for the Cloud Function =====
      // These match what paymentGateway.js → processNewEnrollment() expects
      const nmiParams = {
        action: 'processNewEnrollment',
        contactId: contactId,
        planId: selectedPlan,
        // ===== Customer info (from form data collected in earlier phases) =====
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.street,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        // ===== Billing preferences =====
        billingDay: formData.billingDay || 1,
        discountApplied: appliedDiscount,
      };

      // ===== Add ACH-specific fields =====
      if (paymentMethod === 'ach') {
        nmiParams.checkAccount = paymentFields.checkAccount;
        nmiParams.checkAba = paymentFields.checkAba;
        nmiParams.checkName = paymentFields.checkName;
        nmiParams.accountType = paymentFields.accountType;     // 'checking' or 'savings'
        nmiParams.bankName = paymentFields.bankName || '';
      }

      // ===== Add Credit Card-specific fields =====
      if (paymentMethod === 'cc') {
        nmiParams.ccNumber = paymentFields.ccNumber;
        nmiParams.ccExp = paymentFields.ccExp;                 // MMYY format
        nmiParams.cvv = paymentFields.cvv;
      }

      // ===== Make the actual Cloud Function call =====
      const response = await operationsManager(nmiParams);
      const result = response.data;

      console.log('📦 NMI enrollment result:', result);

      // ─────────────────────────────────────────────
      // HANDLE RESPONSE
      // ─────────────────────────────────────────────
      if (result.success) {
        // ===== SUCCESS! Payment method vaulted + recurring set up =====
        console.log('✅ NMI enrollment succeeded!', {
          vaultId: result.vaultId,
          subscriptionId: result.subscriptionId,
        });

        // Log the successful payment interaction
        await logInteraction('payment_completed', {
          description: `Payment completed via ${paymentMethod.toUpperCase()} - ${plan.name} plan`,
          plan: plan.name,
          planId: selectedPlan,
          amount: plan.setupFee || finalPrice,
          paymentMethod: paymentMethod,
          nmiVaultId: result.vaultId,
          nmiSubscriptionId: result.subscriptionId,
          phase: currentPhase,
        });

        // Clear sensitive payment fields from memory immediately
        setPaymentFields({
          checkName: '',
          checkAba: '',
          checkAccount: '',
          accountType: 'checking',
          bankName: '',
          ccNumber: '',
          ccExp: '',
          cvv: '',
          cardholderName: '',
        });

        // Move to celebration phase!
        await finalizeEnrollment();

      } else {
        // ===== PAYMENT FAILED — Show user-friendly error =====
        console.error('❌ NMI enrollment failed:', result.error);

        // ===== Map common NMI errors to friendly messages =====
        let friendlyError = result.error || 'Payment could not be processed.';
        if (friendlyError.includes('DECLINE') || friendlyError.includes('decline')) {
          friendlyError = 'Your payment was declined. Please check your information and try again, or use a different payment method.';
        } else if (friendlyError.includes('routing') || friendlyError.includes('ABA')) {
          friendlyError = 'The routing number appears to be invalid. Please double-check it (9 digits, bottom-left of your check).';
        } else if (friendlyError.includes('account')) {
          friendlyError = 'The account number could not be verified. Please check and try again.';
        } else if (friendlyError.includes('expired')) {
          friendlyError = 'This card appears to be expired. Please use a different card.';
        }

        setPaymentError(friendlyError + ' If you continue to have trouble, call us at (888) 724-7344.');
        setLoading(false);
      }

    } catch (callError) {
      // ===== Cloud Function itself failed (network error, timeout, etc.) =====
      console.error('❌ operationsManager call failed:', callError);
      setPaymentError(
        'We couldn\'t connect to our payment processor. Please check your internet connection and try again. ' +
        'If this continues, call us at (888) 724-7344 and we\'ll process your payment over the phone.'
      );
      setLoading(false);
    }
  };

  // ============================================================================
  // handleZelleFallback — Alternative payment for customers who prefer Zelle
  // ============================================================================
  // Some customers don't want to enter bank/card info online. This sends them
  // Zelle payment instructions via email and finalizes enrollment.
  // The payment team follows up manually to confirm receipt.
  // ============================================================================
  const handleZelleFallback = async () => {
    setLoading(true);
    setPaymentError(null);
    try {
      const plan = SERVICE_PLANS.find((p) => p.id === selectedPlan);
      const setupFee = plan.setupFee || 0;

      console.log('📱 Processing Zelle fallback payment...');

      // ===== Create a pending payment record in Firestore =====
      await addDoc(collection(db, 'paymentIntents'), {
        contactId: contactId,
        type: 'zelle_pending',
        planId: selectedPlan,
        planName: plan.name,
        setupFee: setupFee,
        monthlyAmount: plan.price,
        status: 'pending_zelle',
        paymentMethod: 'zelle',
        customerInfo: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // ===== Send Zelle instructions email =====
      try {
        await emailService({
          action: 'send',
          to: formData.email,
          subject: 'Zelle Payment Instructions - Speedy Credit Repair',
          body: `Hi ${formData.firstName},\n\nThank you for selecting the ${plan.name} plan!\n\n` +
            `ZELLE PAYMENT:\n` +
            `${setupFee > 0 ? `• Setup Fee: $${setupFee} (pay now)\n` : ''}` +
            `• Monthly Fee: $${plan.price} (starts in 30 days)\n\n` +
            `PAY NOW WITH ZELLE:\n` +
            `1. Open your banking app\n` +
            `2. Select "Send with Zelle"\n` +
            `3. Send to: billing@speedycreditrepair.com\n` +
            `4. Amount: $${setupFee > 0 ? setupFee : plan.price}\n` +
            `5. Memo: "${formData.firstName} ${formData.lastName} Setup"\n\n` +
            `We'll activate your account within 2 hours!\n\n` +
            `Best regards,\nChristopher Lahage & Team`,
          recipientName: formData.firstName,
          contactId: contactId,
          templateType: 'zelle_instructions',
        });
        console.log('✅ Zelle instructions email sent');
      } catch (emailErr) {
        // ===== Email failure is non-blocking — log but continue =====
        console.error('⚠️ Zelle email failed (non-blocking):', emailErr);
      }

      // ===== Log the interaction =====
      await logInteraction('payment_completed', {
        description: `Zelle payment selected - ${plan.name} plan (pending confirmation)`,
        plan: plan.name,
        planId: selectedPlan,
        amount: setupFee > 0 ? setupFee : plan.price,
        paymentMethod: 'zelle',
        status: 'pending_confirmation',
        phase: currentPhase,
      });

      await finalizeEnrollment();

    } catch (error) {
      console.error('❌ Zelle fallback error:', error);
      setPaymentError('Something went wrong. Please call (888) 724-7344 for assistance.');
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

      await sendWelcomeEmailLocal();

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

  const sendWelcomeEmailLocal = async () => {
  try {
    console.log('📧 Triggering welcome email via imported emailTriggers...');
    
    const { sendWelcomeEmail: sendWelcomeImported } = await import('@/utils/emailTriggers');
    const result = await sendWelcomeImported(contactId, {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email
    });
    
    console.log('✅ Welcome email result:', result);
  } catch (err) {
    console.error('❌ Welcome email error:', err);
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
    
    // Clear AutoSave data (localStorage + server-side progress)
    localStorage.removeItem(AUTOSAVE_KEY);
    if (contactId) {
      updateDoc(doc(db, 'contacts', contactId), {
        'enrollmentProgress.abandoned': false,
        'enrollmentProgress.completed': true,
        'enrollmentProgress.completedAt': serverTimestamp()
      }).catch(() => {}); // Non-blocking
    }

    try {
      await updateDoc(doc(db, 'contacts', contactId), {
        idiqEnrollment: {
          status: 'active',
          enrollmentId: enrollmentId || `ENR-${Date.now()}`,
          membershipNumber: membershipNumber || null,
          enrolledAt: serverTimestamp(),
          completedAt: serverTimestamp(),
          creditScore: creditReport?.vantageScore || null,
          // ===== CRITICAL: Save account counts for AI Review Generator =====
          accountCount: creditReport?.accounts?.length || 0,
          negativeItemCount: creditReport?.negativeItems?.length || 0,
          inquiryCount: creditReport?.inquiries?.length || 0,
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
    
    // ===== PORTAL ACCOUNT — Already created at Phase 1 submit (Bug #11 fix) =====
    // No need to create here. If it failed at Phase 1, it was non-blocking.
    // The createPortalAccount case handles auth/email-already-exists gracefully.

    // ═════ AI DISPUTE PIPELINE - RIVAL-FREE SYSTEM ═════
    // Instead of a simple loop, we now trigger the full AI dispute pipeline:
    // 1. populateDisputes: Parses credit report, creates dispute docs with strategy templates
    // 2. generateDisputeStrategy: AI analyzes all items and assigns strategies + rounds
    // 3. generateDisputeLetters: AI generates 3 letter tones for Round 1 items
    // This runs server-side via aiContentGenerator Cloud Function.
    // Non-blocking — enrollment completes even if pipeline has issues.
    try {
      console.log('🚀 Triggering AI Dispute Pipeline...');
      
      const aiContentGenerator = httpsCallable(functions, 'aiContentGenerator');
      
      const pipelineResult = await aiContentGenerator({
        type: 'runFullDisputePipeline',
        contactId: contactId
      });
      
      console.log('✅ Dispute Pipeline result:', pipelineResult.data);
      
      if (pipelineResult.data?.success) {
        const disputeCount = pipelineResult.data.populate?.disputeCount || 0;
        const letterCount = pipelineResult.data.letters?.letterCount || 0;
        const totalRounds = pipelineResult.data.strategy?.plan?.totalRounds || 0;
        
        await logInteraction('dispute_pipeline_complete', {
          description: `AI Dispute Pipeline: ${disputeCount} disputes identified, ${totalRounds} rounds planned, ${letterCount} letters generated`,
          disputeCount,
          letterCount,
          totalRounds,
          strategyId: pipelineResult.data.strategy?.strategyId || null
        });
        
        console.log(`🎉 Pipeline: ${disputeCount} disputes, ${totalRounds} rounds, ${letterCount} letters`);
      } else {
        // Pipeline had issues but enrollment still succeeded
        console.warn('⚠️ Dispute pipeline incomplete:', pipelineResult.data?.error || 'Unknown');
        
        await logInteraction('dispute_pipeline_partial', {
          description: 'Dispute pipeline completed with issues - manual review needed',
          error: pipelineResult.data?.error || 'Unknown',
          populateSuccess: pipelineResult.data?.populate?.success || false,
          strategySuccess: pipelineResult.data?.strategy?.success || false,
          lettersSuccess: pipelineResult.data?.letters?.success || false
        });
      }
    } catch (pipelineErr) {
      // Non-blocking — enrollment already succeeded, pipeline is a bonus
      console.error('⚠️ Dispute pipeline error (non-blocking):', pipelineErr);
      
      try {
        await logInteraction('dispute_pipeline_error', {
          description: 'AI Dispute Pipeline failed - manual review needed',
          error: pipelineErr.message || 'Unknown error'
        });
      } catch (logErr) {
        console.error('Failed to log pipeline error:', logErr);
      }
    }

    // ===== SEND ENROLLMENT CONFIRMATION EMAIL =====
    // Comprehensive email with welcome, IDIQ credentials, next steps, and contact info.
    // Sent to the enrollee after all enrollment steps are complete.
    try {
      console.log('📧 Sending enrollment confirmation email...');
      
      const planNames = {
        'essentials': 'Essentials ($79/mo)',
        'professional': 'Professional ($149/mo)',
        'vip': 'VIP Concierge ($299/mo)'
      };
      
      const selectedPlanName = planNames[selectedPlan] || selectedPlan || 'Professional';
      const confirmCreditScore = creditReport?.vantageScore || 'Pending';
      const negativeCount = creditReport?.negativeItems?.length || 0;
      
      await emailService({
        action: 'send',
        to: formData.email,
        subject: `🎉 Welcome to Speedy Credit Repair, ${formData.firstName}! Your enrollment is complete.`,
        body: `Hi ${formData.firstName},

Congratulations! Your enrollment with Speedy Credit Repair is now complete. Here's everything you need to get started:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
YOUR ACCOUNT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Client Portal: https://myclevercrm.com
Login Email: ${formData.email}
Selected Plan: ${selectedPlanName}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
YOUR IDIQ CREDIT MONITORING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

IDIQ Dashboard: https://member.identityiq.com
IDIQ Username: ${formData.email}
Membership #: ${membershipNumber || 'Check your IDIQ welcome email'}

Important: Please log into your IDIQ account within 48 hours to:
1. Change your temporary password
2. Answer security verification questions
3. Access your full 3-bureau credit report

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
YOUR CREDIT SNAPSHOT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Current Score: ${confirmCreditScore}
Negative Items Found: ${negativeCount}
${negativeCount > 0 ? `Our AI-powered dispute system has already analyzed these items and is preparing personalized dispute letters for each bureau. Your first round of disputes will be ready within 24 hours.

Here is what our system found:
- ${negativeCount} items identified for dispute
- Legal basis established for each item (FCRA/FDCPA)
- Dispute letters being generated in multiple formats
- Strategic round plan created to maximize your score improvement

Your dedicated credit analyst will review everything before any letters are sent.` : 'Great news - your credit report looks clean! We will continue monitoring for any changes.'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHAT HAPPENS NEXT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Our credit analysts will review your full 3-bureau report
2. You'll receive a personalized credit improvement plan within 24 hours
3. We'll begin disputing negative items on your behalf
4. You can track progress anytime at https://myclevercrm.com

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONTACT US
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Phone: 1-888-724-7344
Email: chris@speedycreditrepair.com
Hours: Monday-Friday 9AM-6PM PST

Thank you for trusting Speedy Credit Repair with your credit journey. We've been helping families improve their credit since 1995, and we're excited to help you too!

Best regards,
Christopher Lahage
CEO, Speedy Credit Repair Inc.
A+ BBB Rating | 4.9 Google (580+ reviews)

(c) 1995-2026 Speedy Credit Repair Inc. | All Rights Reserved`,
        recipientName: formData.firstName,
        contactId: contactId,
        templateType: 'enrollment_confirmation'
      });
      
      console.log('✅ Enrollment confirmation email sent to:', formData.email);
      
    } catch (emailErr) {
      // Non-blocking - enrollment is already complete
      console.error('❌ Confirmation email failed (non-blocking):', emailErr.message);
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
              label="Create Password *"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleFormChange('password')}
              required
              autoComplete="new-password"
              placeholder="Min 8 chars: Aa1!..."
              helperText="This becomes your SpeedyCRM portal & IDIQ login. Must have: uppercase, lowercase, number, and symbol."
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
              {/* ===== ZIP CODE FIRST - Auto-populates City & State ===== */}
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="ZIP Code"
              value={formData.zip}
              onChange={async (e) => {
                const zipValue = e.target.value.replace(/\D/g, '').slice(0, 5);
                handleFormChange('zip')({ target: { value: zipValue } });
                
                // ===== AUTO-POPULATE CITY & STATE FROM ZIP =====
                // Uses free zippopotam.us API (no API key needed)
                if (zipValue.length === 5) {
                  try {
                    const response = await fetch(`https://api.zippopotam.us/us/${zipValue}`);
                    if (response.ok) {
                      const data = await response.json();
                      const place = data.places?.[0];
                      if (place) {
                        console.log('📍 ZIP lookup:', zipValue, '→', place['place name'], place['state abbreviation']);
                        setFormData(prev => ({
                          ...prev,
                          city: place['place name'] || prev.city,
                          state: place['state abbreviation'] || prev.state,
                        }));
                      }
                    }
                  } catch (err) {
                    // ZIP lookup failed - user can still type manually
                    console.log('⚠️ ZIP lookup failed:', err.message);
                  }
                }
              }}
              inputProps={{ maxLength: 5 }}
              helperText="City & state auto-fill from ZIP"
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
          {/* ===== STATE DROPDOWN ===== */}
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
            {(true) && (
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
        {/* ===== CREDIT ANALYSIS LOADING STATE ===== */}
        {creditAnalysisRunning && (
          <Paper sx={{ p: 4, mb: 3, textAlign: 'center', bgcolor: 'primary.light' }}>
            <CircularProgress size={60} sx={{ mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              🤖 AI Credit Analysis in Progress...
            </Typography>
            <Typography color="text.secondary" paragraph>
              Our AI is analyzing your credit report to identify opportunities for improvement.
              This typically takes 20-30 seconds.
            </Typography>
            <LinearProgress sx={{ mt: 2 }} />
          </Paper>
        )}

        {/* ===== CREDIT ANALYSIS ERROR STATE ===== */}
        {creditAnalysisError && !creditAnalysisRunning && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <AlertTitle>Manual Review Required</AlertTitle>
            {typeof creditAnalysisError === 'string' ? creditAnalysisError : 'Analysis encountered an issue. Our team will review manually.'}
            <Typography variant="body2" sx={{ mt: 1 }}>
              Don't worry! Our expert team will review your credit report and email you 
              a detailed analysis within 24 hours.
            </Typography>
          </Alert>
        )}

        {/* ===== CREDIT ANALYSIS SUCCESS STATE ===== */}
        {creditAnalysisComplete && creditAnalysisResult && (
          <Card sx={{ mb: 3, bgcolor: 'success.light' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CheckIcon sx={{ fontSize: 48, color: 'success.main' }} />
                <Box>
                  <Typography variant="h6" gutterBottom>
                    ✅ Credit Analysis Complete!
                  </Typography>
                  <Typography variant="body2">
                    Credit Score: <strong>{creditAnalysisResult.creditScore ?? 'Pending'}</strong> • 
                    Negative Items: <strong>{creditAnalysisResult.negativeItemsCount ?? 0}</strong> • 
                    Projected Improvement: <strong>+{creditAnalysisResult.gameplan?.projectedScoreIncrease ?? 0} pts</strong>
                  </Typography>
                  <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                    📧 Detailed analysis sent to your email!
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}              
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
                  {displayedScore ? (
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
                  ) : scoreLoadingTimeout ? (
                    <Box sx={{ 
                      textAlign: 'center', 
                      py: 4,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 2
                    }}>
                      <Alert 
                        severity="info" 
                        sx={{ 
                          bgcolor: 'rgba(255,255,255,0.15)', 
                          color: 'white',
                          maxWidth: 400,
                          '& .MuiAlert-icon': { color: '#64b5f6' }
                        }}
                      >
                        <AlertTitle>Score Display Delayed</AlertTitle>
                        Your credit report loaded successfully. View the full report below.
                      </Alert>
                    </Box>
                  ) : (
                    <Box sx={{ 
                      textAlign: 'center', 
                      py: 6,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 2
                    }}>
                      <CircularProgress size={60} sx={{ color: 'white' }} />
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                        Loading credit score...
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                        This usually takes a few seconds
                      </Typography>
                    </Box>
                  )}
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
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Items We Can Help With ({creditReport.negativeItems.length})
                </Typography>
                <Button
                  size="small"
                  onClick={() => setShowAllNegativeItems(!showAllNegativeItems)}
                  endIcon={showAllNegativeItems ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                >
                  {showAllNegativeItems ? 'Show Less' : `Show All ${creditReport.negativeItems.length}`}
                </Button>
              </Box>
              <List>
                {(showAllNegativeItems 
                  ? creditReport.negativeItems 
                  : creditReport.negativeItems.slice(0, 5)
                ).map((item, index) => (
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
              {!showAllNegativeItems && creditReport.negativeItems.length > 5 && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                  + {creditReport.negativeItems.length - 5} more items (click "Show All" above)
                </Typography>
              )}
            </CardContent>
          </Card>
        )}

        {/* ===== ALL CREDIT ACCOUNTS TABLE - HIDDEN FOR NOW =====
            The IDIQ API only returns TransUnion data (27 accounts), but the
            IDIQ widget displays all 91 accounts from all 3 bureaus.
            
            FUTURE ENHANCEMENT: AI will analyze the full credit report from
            the widget and generate a comprehensive report with:
            - All 3 credit scores (TransUnion, Experian, Equifax)
            - All 91 accounts organized by bureau
            - Negative items highlighted
            - Dispute recommendations
            - Credit improvement action plan
            
            For now, users view the full report in the IDIQ widget above.
        ===== */}

        {/* Projected Improvement */}
        {/* ===== Bug #8 FIX: Calculate real improvement potential ===== */}
        {/* Instead of the hardcoded "85", we calculate based on:         */}
        {/*   - Number of negative items (each removal = ~10-20 pts)      */}
        {/*   - Current credit score (lower scores improve faster)        */}
        {/*   - Timeline based on how many items need disputing           */}
        <Card sx={{ mb: 4, bgcolor: 'success.50' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TrendingUpIcon sx={{ fontSize: 48, color: 'success.main' }} />
              <Box>
                <Typography variant="h5" fontWeight={700} color="success.main">
                  +{(() => {
                    // ===== CALCULATE PROJECTED IMPROVEMENT =====
                    // If the analysis already calculated it, use that value
                    if (creditReport?.projectedImprovement) return creditReport.projectedImprovement;
                    
                    // Otherwise, estimate based on negative items and current score
                    const negCount = creditReport?.negativeItems?.length
                      || creditReport?.negativeItemCount
                      || creditAnalysisResult?.negativeItemsCount
                      || 0;
                    const currentScore = creditReport?.vantageScore
                      || creditReport?.creditScore
                      || creditAnalysisResult?.creditScore
                      || 0;
                    
                    // No data at all? Show a conservative range instead of a fake number
                    if (negCount === 0 && currentScore === 0) return '40-100';
                    
                    // Each negative item removal can improve score by 10-20 points
                    // Lower scores see bigger jumps per item removed
                    let perItemImprovement;
                    if (currentScore > 0 && currentScore < 550) {
                      perItemImprovement = 18;  // Low scores improve more per item
                    } else if (currentScore < 650) {
                      perItemImprovement = 14;  // Mid-range scores
                    } else {
                      perItemImprovement = 10;  // Higher scores improve less per item
                    }
                    
                    // Calculate total, cap at 200 (realistic max improvement)
                    const projected = Math.min(negCount * perItemImprovement, 200);
                    
                    // Minimum 20 if they have any negative items
                    return negCount > 0 ? Math.max(projected, 20) : '20-40';
                  })()} Point Potential
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {(() => {
                    // ===== CALCULATE TIMELINE =====
                    const negCount = creditReport?.negativeItems?.length
                      || creditReport?.negativeItemCount
                      || creditAnalysisResult?.negativeItemsCount
                      || 0;
                    
                    if (creditReport?.improvementTimeline) {
                      return `Based on our analysis, we project significant improvement within ${creditReport.improvementTimeline} months`;
                    }
                    
                    // Estimate timeline: ~2 items per dispute round, rounds every 35 days
                    if (negCount <= 3) return 'Based on your report, we project significant improvement within 3-4 months';
                    if (negCount <= 8) return 'Based on your report, we project significant improvement within 4-6 months';
                    if (negCount <= 15) return 'Based on your report, we project significant improvement within 6-9 months';
                    return 'Based on your report, we project significant improvement within 9-12 months';
                  })()}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* ===== FULL IDIQ CREDIT REPORT WIDGET ===== */}
        {/* This shows the complete credit report using IDIQ's MicroFrontend */}
        {/* Show widget if we have a member token - works for both verified and needs-verification cases */}
        {showFullCreditReport && creditReportMemberToken && (
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={700}>
                  📊 Complete Credit Report
                </Typography>
                <Chip 
                  label={pendingWidgetVerification ? "VERIFICATION PENDING" : "LIVE FROM IDIQ"}
                  color={pendingWidgetVerification ? "warning" : "primary"}
                  size="small"
                  icon={<ShieldIcon sx={{ fontSize: 16 }} />}
                />
              </Box>
              
              {/* Show verification pending message if needed */}
              {pendingWidgetVerification ? (
                <Alert 
                  severity="warning" 
                  sx={{ 
                    mb: 3,
                    '& .MuiAlert-message': { width: '100%' }
                  }}
                >
                  <AlertTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip 
                      label="VERIFICATION PENDING" 
                      size="small" 
                      sx={{ 
                        bgcolor: '#ff9800', 
                        color: 'white', 
                        fontWeight: 'bold',
                        fontSize: '0.7rem'
                      }} 
                    />
                    Additional Verification Required
                  </AlertTitle>
                  
                  <Typography variant="body2" sx={{ mt: 1, mb: 2 }}>
                    The credit bureaus require additional verification for your identity. 
                    This can happen for several reasons:
                  </Typography>
                  
                  <Box component="ul" sx={{ 
                    m: 0, 
                    pl: 2.5,
                    '& li': { mb: 0.75, fontSize: '0.875rem' }
                  }}>
                    <li><strong>Thin credit file</strong> - Limited credit history makes verification harder</li>
                    <li><strong>Recent address change</strong> - New addresses may not be in the bureaus' records yet</li>
                    <li><strong>Existing IDIQ account</strong> - You may already have an IDIQ account with a different email</li>
                    <li><strong>Credit freeze or fraud alert</strong> - Security measures on your credit file</li>
                    <li><strong>Name variations</strong> - Different name spellings across your credit accounts</li>
                  </Box>
                  
                  <Divider sx={{ my: 2, borderColor: 'rgba(255, 152, 0, 0.3)' }} />
                  
                  <Typography variant="body2" sx={{ fontWeight: 500, mb: 1.5 }}>
                    Your options:
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    <Button
                      variant="contained"
                      color="warning"
                      size="small"
                      startIcon={<OpenInNewIcon />}
                      onClick={() => window.open('https://member.identityiq.com/', '_blank')}
                      sx={{ textTransform: 'none' }}
                    >
                      Complete Verification at IDIQ
                    </Button>
                    
                    <Button
                      variant="outlined"
                      color="warning"
                      size="small"
                      startIcon={<RefreshIcon />}
                      onClick={() => window.location.reload()}
                      sx={{ textTransform: 'none' }}
                    >
                      Refresh After Verification
                    </Button>
                    
                    <Button
                      variant="outlined"
                      color="inherit"
                      size="small"
                      startIcon={<PhoneIcon />}
                      onClick={() => window.open('tel:+18887247344')}
                      sx={{ textTransform: 'none', color: 'text.secondary' }}
                    >
                      Call Support: (888) 724-7344
                    </Button>
                  </Box>
                  
                  <Typography variant="caption" sx={{ display: 'block', mt: 2, opacity: 0.8 }}>
                    <strong>Already have an IDIQ account?</strong> You can log into your existing account 
                    at member.identityiq.com to view your credit report, or contact us to link your 
                    existing account to SpeedyCRM.
                  </Typography>
                </Alert>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  This is your full tri-merge credit report from all three bureaus. 
                  Review all accounts, inquiries, and public records below.
                </Typography>
              )}
              
              <IDIQCreditReportViewer
                memberToken={creditReportMemberToken}
                enrollmentId={enrollmentId}
                contactId={contactId}
                showHeader={false}
                minHeight={pendingWidgetVerification ? 400 : 800}
                onReportLoaded={(data) => {
                  console.log('✅ Full credit report loaded in enrollment flow:', data);
                  // AI can analyze this data for disputes and recommendations
                  if (data?.token) {
                    setCreditReportMemberToken(data.token);
                  }
                }}
                onError={(err) => {
                  console.error('❌ Credit report widget error:', err);
                  // Don't block enrollment if widget fails - they can view later
                }}
              />
              
              <Alert severity="info" sx={{ mt: 2 }}>
                <AlertTitle>What Happens Next?</AlertTitle>
                <Typography variant="body2">
                  Our AI is analyzing your credit report to identify disputable items and 
                  recommend the best service plan for your situation. You'll receive a 
                  personalized credit review via email within 24 hours.
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* Toggle button to show/hide full report */}
        {enrollmentId && !showFullCreditReport && (
          <Button
            variant="outlined"
            fullWidth
            sx={{ mb: 4 }}
            onClick={() => setShowFullCreditReport(true)}
            startIcon={<AssessmentIcon />}
          >
            View Complete Credit Report
          </Button>
        )}

        {/* ===== ENROLLMENT INCOMPLETE WARNING ===== */}
        {/* Shows when IDIQ enrollment failed but user reached Phase 3 */}
        {!enrollmentId && !creditReport && !creditAnalysisRunning && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <AlertTitle>Enrollment Incomplete</AlertTitle>
            Your credit report could not be retrieved automatically. Don't worry — our team 
            has been notified and will assist you. You can still continue with document upload 
            or contact us at 1-888-724-7344.
          </Alert>
        )}

        {/* ===== Bug #9 FIX: Floating Continue prompt ===== */}
        {/* This appears after 8 seconds so users know to continue, even if they */}
        {/* haven't scrolled past the tall IDIQ credit report widget.             */}
        {showFloatingContinue && (
          <Box
            sx={{
              position: 'fixed',
              bottom: 20,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1200,
              bgcolor: 'primary.main',
              color: 'white',
              px: 3,
              py: 1.5,
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              cursor: 'pointer',
              transition: 'all 0.3s',
              '&:hover': { transform: 'translateX(-50%) translateY(-2px)', boxShadow: '0 6px 25px rgba(0,0,0,0.4)' },
              maxWidth: '90vw',
            }}
            onClick={() => {
              setShowFloatingContinue(false);
              setCurrentPhase(4);
            }}
          >
            <Typography variant="body1" fontWeight={600}>
              Ready to continue?
            </Typography>
            <ArrowForwardIcon />
            {floatingCountdown > 0 && (
              <Chip
                label={`${floatingCountdown}s`}
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600 }}
              />
            )}
          </Box>
        )}

        <Box id="phase3-continue-btn" sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button onClick={() => setCurrentPhase(1)} startIcon={<ArrowBackIcon />}>
            Back
          </Button>
          <GlowingButton
            onClick={() => { setShowFloatingContinue(false); setCurrentPhase(4); }}
            endIcon={<ArrowForwardIcon />}
          >
            Continue to Document Upload
          </GlowingButton>
        </Box>
      </Box>
    </Fade>
  );

  // ============================================================================
// EDIT 3: Enhanced renderPhase4 Function
// ============================================================================
// REPLACE lines 3223-3337 in CompleteEnrollmentFlow.jsx with this code
//
// FEATURES:
// - Photo ID upload with preview
// - Utility Bill / Proof of Address upload with preview
// - SSN Card upload with preview
// - Bank Statements (multiple) with list
// - Additional/Misc Documents (multiple) with list
// - Document viewer modal
// - Delete document option
// - Pre-populated documents show checkmark
//
// © 1995-2026 Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved
// ============================================================================

  // ===== ADDITIONAL DOCUMENT UPLOAD HANDLER =====
  const handleAdditionalDocUpload = async (file) => {
    if (!file) return;
    
    setUploadingDoc('additional');
    try {
      const timestamp = Date.now();
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const path = `contact-documents/${contactId || 'temp'}/additional_${timestamp}_${safeFileName}`;
      
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      
      const newDoc = {
        id: timestamp,
        name: file.name,
        url: url,
        type: file.type,
        uploadedAt: new Date().toISOString(),
      };
      
      setAdditionalDocs(prev => [...prev, newDoc]);
      setSuccess('Document uploaded successfully!');
      
      console.log('📄 Additional document uploaded:', file.name);
    } catch (err) {
      console.error('❌ Error uploading additional document:', err);
      setError('Failed to upload document. Please try again.');
    } finally {
      setUploadingDoc(null);
    }
  };

  // ===== BANK STATEMENT UPLOAD HANDLER =====
  const handleBankStatementUpload = async (file) => {
    if (!file) return;
    
    setUploadingDoc('bank');
    try {
      const timestamp = Date.now();
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const path = `contact-documents/${contactId || 'temp'}/bank_${timestamp}_${safeFileName}`;
      
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      
      setBankStatementUrls(prev => [...prev, { 
        id: timestamp, 
        name: file.name, 
        url: url,
        uploadedAt: new Date().toISOString()
      }]);
      setSuccess('Bank statement uploaded successfully!');
      
      console.log('📄 Bank statement uploaded:', file.name);
    } catch (err) {
      console.error('❌ Error uploading bank statement:', err);
      setError('Failed to upload bank statement. Please try again.');
    } finally {
      setUploadingDoc(null);
    }
  };

  // ===== SSN CARD UPLOAD HANDLER =====
  const handleSSNCardUpload = async (file) => {
    if (!file) return;
    
    setUploadingDoc('ssn');
    try {
      const timestamp = Date.now();
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const path = `contact-documents/${contactId || 'temp'}/ssn_${timestamp}_${safeFileName}`;
      
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      
      setSsnCardUrl(url);
      setSuccess('SSN Card uploaded successfully!');
      
      console.log('📄 SSN Card uploaded');
    } catch (err) {
      console.error('❌ Error uploading SSN card:', err);
      setError('Failed to upload SSN card. Please try again.');
    } finally {
      setUploadingDoc(null);
    }
  };

  // ===== DELETE DOCUMENT HANDLER =====
  const handleDeleteDocument = (type, docId = null) => {
    switch(type) {
      case 'id':
        setIdPhotoUrl(null);
        break;
      case 'utility':
        setUtilityPhotoUrl(null);
        break;
      case 'ssn':
        setSsnCardUrl(null);
        break;
      case 'bank':
        setBankStatementUrls(prev => prev.filter(d => d.id !== docId));
        break;
      case 'additional':
        setAdditionalDocs(prev => prev.filter(d => d.id !== docId));
        break;
    }
    setSuccess('Document removed.');
  };

  // ===== VIEW DOCUMENT HANDLER =====
  const handleViewDocument = (url, name) => {
    setViewingDocument({ url, name });
    setShowDocumentViewer(true);
  };
  // ============================================================================
  // CREDIT ANALYSIS AUTOMATION HANDLER
  // ============================================================================
  const handleCreditAnalysis = async (idiqData) => {
    console.log('===== TRIGGERING CREDIT ANALYSIS AUTOMATION =====');
    console.log('🎯 IDIQ Data:', idiqData);
    console.log('📋 Contact ID:', contactId);

    try {
      // Update UI state
      setCreditAnalysisRunning(true);
      setCreditAnalysisError(null);
      setSuccess('Credit analysis in progress... This will take about 30 seconds.');

      // Sync IDIQ data to contact
      console.log('📥 Syncing IDIQ data to contact...');
      
      await syncIDIQToContact(contactId, {
        ...formData,
        ...idiqData,
        memberToken: idiqData.memberToken || idiqData.idiqMemberToken,
        membershipNumber: idiqData.membershipNumber || idiqData.idiqMembershipNumber,
        enrollmentComplete: true
      });

      console.log('✅ IDIQ data synced');

      // Run credit analysis automation
      console.log('🤖 Running credit analysis...');
      
      const analysisResult = await runCreditAnalysis(
        contactId, 
        {
          memberToken: idiqData.memberToken || idiqData.idiqMemberToken,
          membershipNumber: idiqData.membershipNumber || idiqData.idiqMembershipNumber,
          ...idiqData
        },
        {
          autoDisputeEnabled: false
        }
      );

      console.log('📊 Analysis Result:', analysisResult);

      // Update state with results
      if (analysisResult.success) {
        console.log('✅ Analysis completed!');
        
        setCreditAnalysisComplete(true);
        setCreditAnalysisResult(analysisResult);
        setCreditReport(analysisResult.analysis);
        
        setSuccess(`🎉 Analysis Complete! Score: ${analysisResult.creditScore} | Negative Items: ${analysisResult.negativeItemsCount}`);

        // Auto-advance after 3 seconds
       setTimeout(() => {
       setCurrentPhase(3);
    }, 3000);

      } else {
        console.error('❌ Analysis failed:', analysisResult.error);
        
        setCreditAnalysisError(
          typeof analysisResult.error === 'string' 
            ? analysisResult.error 
            : analysisResult.error?.message || 'Analysis failed. Manual review will follow.'
        );
        // ===== Bug #10 FIX: Clear the "in progress" success message =====
        // Previously, the success "Analysis in progress..." stayed visible
        // while the error "Analysis encountered an issue" also appeared.
        // Now we clear the success state so only the error shows.
        setSuccess(null);
        setError('Analysis encountered an issue. Our team will review manually within 24 hours.');
        
        // Still advance
        setTimeout(() => {
        setCurrentPhase(3);
    },  5000);
      }

    } catch (error) {
      console.error('❌ Analysis error:', error);
      
      setCreditAnalysisError(error.message);
      // ===== Bug #10 FIX: Clear "in progress" success message in catch block too =====
      setSuccess(null);
      setError('Unable to complete automatic analysis. Manual review will follow.');
      
      // Log error to Firestore
      await logAnalysisError(contactId, error);
      
      // Still advance
      setTimeout(() => {
        setCurrentPhase(3);
      }, 5000);
      
    } finally {
      setCreditAnalysisRunning(false);
    }
  };

  // Helper to log analysis errors
  const logAnalysisError = async (contactId, error) => {
    try {
      const { doc, collection, setDoc, serverTimestamp } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      
      const errorRef = doc(collection(db, 'analysisErrors'));
      await setDoc(errorRef, {
        contactId,
        error: error.message,
        stack: error.stack,
        timestamp: serverTimestamp(),
        source: 'CompleteEnrollmentFlow'
      });
    } catch (err) {
      console.error('Failed to log error:', err);
    }
  };

  // ===== DOCUMENT VIEWER MODAL =====
  const DocumentViewerModal = () => (
    <Dialog
      open={showDocumentViewer}
      onClose={() => setShowDocumentViewer(false)}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">{viewingDocument?.name || 'Document Viewer'}</Typography>
        <IconButton onClick={() => setShowDocumentViewer(false)}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {viewingDocument?.url && (
          viewingDocument.url.toLowerCase().includes('.pdf') ? (
            <iframe 
              src={viewingDocument.url} 
              style={{ width: '100%', height: '70vh', border: 'none' }}
              title="Document Viewer"
            />
          ) : (
            <Box sx={{ textAlign: 'center' }}>
              <img 
                src={viewingDocument.url} 
                alt={viewingDocument.name}
                style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }}
              />
            </Box>
          )
        )}
      </DialogContent>
      <DialogActions>
        <Button 
          startIcon={<DownloadIcon />}
          onClick={() => window.open(viewingDocument?.url, '_blank')}
        >
          Download
        </Button>
        <Button onClick={() => setShowDocumentViewer(false)}>Close</Button>
      </DialogActions>
    </Dialog>
  );

  // ===== DOCUMENT CARD COMPONENT =====
  const DocumentCard = ({ 
    title, 
    subtitle, 
    icon: Icon, 
    url, 
    onUpload, 
    onDelete, 
    onView,
    inputRef,
    type,
    isUploading,
    accept = "image/jpeg,image/jpg,image/png,image/gif,image/webp,application/pdf"
  }) => (
    <Card
      sx={{
        p: 2,
        border: url ? '2px solid #4CAF50' : '2px dashed #ccc',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': { borderColor: '#2196F3', transform: 'translateY(-2px)' },
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
      onClick={() => !url && inputRef?.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        capture="environment"
        hidden
        onChange={(e) => onUpload(e.target.files[0])}
      />
      
      {isUploading ? (
        <Box sx={{ py: 2 }}>
          <CircularProgress size={40} />
          <Typography variant="body2" sx={{ mt: 1 }}>Uploading...</Typography>
        </Box>
      ) : url ? (
        <Box>
          <CheckIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
          <Typography variant="subtitle1" color="success.main" fontWeight={600}>
            {title} ✓
          </Typography>
          
          {/* Preview thumbnail */}
          {!url.toLowerCase().includes('.pdf') && (
            <Box sx={{ my: 1 }}>
              <img 
                src={url} 
                alt={title} 
                style={{ maxWidth: 120, maxHeight: 80, objectFit: 'cover', borderRadius: 4 }} 
              />
            </Box>
          )}
          
          {/* Action buttons */}
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mt: 1 }}>
            <Tooltip title="View Document">
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); onView(url, title); }}>
                <ViewIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Replace Document">
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); inputRef?.current?.click(); }}>
                <UploadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Document">
              <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); onDelete(type); }}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      ) : (
        <Box>
          <Icon sx={{ fontSize: 40, mb: 1, color: 'primary.main' }} />
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            {title}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            {subtitle}
          </Typography>
          <Button variant="outlined" size="small" startIcon={<UploadIcon />}>
            Upload
          </Button>
        </Box>
      )}
    </Card>
  );

  // ===== RENDER PHASE 4 - ENHANCED DOCUMENT UPLOAD =====
  const renderPhase4 = () => (
    <Fade in timeout={500}>
      <Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          📄 Document Upload
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Upload your identification documents to verify your identity. Required documents are marked with *.
        </Typography>

        {/* Required Documents Section */}
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'primary.50' }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ShieldIcon /> Required Documents
          </Typography>
          
          <Grid container spacing={2}>
            {/* Photo ID - REQUIRED */}
            <Grid item xs={12} sm={6} md={4}>
              <DocumentCard
                title="Photo ID"
                subtitle="Driver's License, Passport, or State ID (optional)"
                icon={CameraIcon}
                url={idPhotoUrl}
                onUpload={(file) => handlePhotoUpload(file, 'id')}
                onDelete={() => handleDeleteDocument('id')}
                onView={handleViewDocument}
                inputRef={idUploadRef}
                type="id"
                isUploading={uploadingDoc === 'id'}
              />
            </Grid>
            
            {/* Utility Bill - REQUIRED */}
            <Grid item xs={12} sm={6} md={4}>
              <DocumentCard
                title="Proof of Address"
                subtitle="Utility Bill, Bank Statement, or Lease (optional)"
                icon={DocumentIcon}
                url={utilityPhotoUrl}
                onUpload={(file) => handlePhotoUpload(file, 'utility')}
                onDelete={() => handleDeleteDocument('utility')}
                onView={handleViewDocument}
                inputRef={utilityUploadRef}
                type="utility"
                isUploading={uploadingDoc === 'utility'}
              />
            </Grid>
            
            {/* SSN Card - OPTIONAL but helpful */}
            <Grid item xs={12} sm={6} md={4}>
              <DocumentCard
                title="SSN Card"
                subtitle="Social Security Card (Optional)"
                icon={CreditCardIcon}
                url={ssnCardUrl}
                onUpload={handleSSNCardUpload}
                onDelete={() => handleDeleteDocument('ssn')}
                onView={handleViewDocument}
                inputRef={ssnUploadRef}
                type="ssn"
                isUploading={uploadingDoc === 'ssn'}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Additional Documents Section */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FolderIcon /> Additional Documents (Optional)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Upload bank statements, pay stubs, or any other supporting documents.
          </Typography>
          
          <Grid container spacing={2}>
            {/* Bank Statements Upload */}
            <Grid item xs={12} sm={6}>
              <Card sx={{ p: 2, border: '1px dashed #ccc' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    📊 Bank Statements ({bankStatementUrls.length})
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={uploadingDoc === 'bank' ? <CircularProgress size={16} /> : <AddIcon />}
                    onClick={() => document.getElementById('bank-upload').click()}
                    disabled={uploadingDoc === 'bank'}
                  >
                    Add
                  </Button>
                  <input
                    id="bank-upload"
                    type="file"
                    accept="image/*,application/pdf"
                    hidden
                    onChange={(e) => handleBankStatementUpload(e.target.files[0])}
                  />
                </Box>
                
                {bankStatementUrls.length > 0 ? (
                  <List dense sx={{ maxHeight: 150, overflow: 'auto' }}>
                    {bankStatementUrls.map((doc) => (
                      <ListItem 
                        key={doc.id}
                        secondaryAction={
                          <Box>
                            <IconButton size="small" onClick={() => handleViewDocument(doc.url, doc.name)}>
                              <ViewIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" color="error" onClick={() => handleDeleteDocument('bank', doc.id)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        }
                      >
                        <ListItemIcon><FileIcon fontSize="small" /></ListItemIcon>
                        <ListItemText 
                          primary={doc.name} 
                          secondary={new Date(doc.uploadedAt).toLocaleDateString()}
                          primaryTypographyProps={{ variant: 'body2', noWrap: true }}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="caption" color="text.disabled">No bank statements uploaded</Typography>
                )}
              </Card>
            </Grid>
            
            {/* Miscellaneous Documents Upload */}
            <Grid item xs={12} sm={6}>
              <Card sx={{ p: 2, border: '1px dashed #ccc' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    📁 Other Documents ({additionalDocs.length})
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={uploadingDoc === 'additional' ? <CircularProgress size={16} /> : <AddIcon />}
                    onClick={() => document.getElementById('additional-upload').click()}
                    disabled={uploadingDoc === 'additional'}
                  >
                    Add
                  </Button>
                  <input
                    id="additional-upload"
                    type="file"
                    accept="image/*,application/pdf,.doc,.docx"
                    hidden
                    onChange={(e) => handleAdditionalDocUpload(e.target.files[0])}
                  />
                </Box>
                
                {additionalDocs.length > 0 ? (
                  <List dense sx={{ maxHeight: 150, overflow: 'auto' }}>
                    {additionalDocs.map((doc) => (
                      <ListItem 
                        key={doc.id}
                        secondaryAction={
                          <Box>
                            <IconButton size="small" onClick={() => handleViewDocument(doc.url, doc.name)}>
                              <ViewIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" color="error" onClick={() => handleDeleteDocument('additional', doc.id)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        }
                      >
                        <ListItemIcon><FileIcon fontSize="small" /></ListItemIcon>
                        <ListItemText 
                          primary={doc.name} 
                          secondary={new Date(doc.uploadedAt).toLocaleDateString()}
                          primaryTypographyProps={{ variant: 'body2', noWrap: true }}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="caption" color="text.disabled">No additional documents uploaded</Typography>
                )}
              </Card>
            </Grid>
          </Grid>
        </Paper>

        {/* Progress indicator */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Document Progress: {[idPhotoUrl, utilityPhotoUrl].filter(Boolean).length}/2 uploaded (optional — you can add these later)
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={([idPhotoUrl, utilityPhotoUrl].filter(Boolean).length / 2) * 100}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        {/* Navigation Buttons */}
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
          <Button onClick={() => setCurrentPhase(3)} startIcon={<ArrowBackIcon />}>
            Back
          </Button>
          <GlowingButton
            onClick={() => setCurrentPhase(5)}
            disabled={false}
            endIcon={<ArrowForwardIcon />}
          >
            Continue to Signature
          </GlowingButton>
        </Box>

        {/* Document Viewer Modal */}
        <DocumentViewerModal />
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

  // ============================================================================
  // PHASE 7: NMI PAYMENT FORM — ACH (Bank Account) + Credit Card
  // ============================================================================
  // This renders the actual payment form that collects bank or card info
  // and sends it to operationsManager → processNewEnrollment → NMI gateway.
  //
  // HOW IT WORKS:
  //   1. Customer picks ACH (bank) or Credit Card tab
  //   2. Fills in their info (routing/account # OR card #)
  //   3. Clicks "Complete Payment"
  //   4. handleNMIPayment() sends everything to our Cloud Function
  //   5. Cloud Function talks to NMI (server-side, PCI compliant)
  //   6. NMI vaults the payment method + sets up recurring billing
  //   7. On success → finalizeEnrollment() → Phase 8 celebration
  //
  // SECURITY NOTE:
  //   Bank/card numbers are sent ONCE to our Cloud Function over HTTPS,
  //   then stored in NMI's PCI-compliant Customer Vault as a token.
  //   We NEVER store raw account/card numbers in Firestore.
  // ============================================================================
  const renderPhase7 = () => {
    const selectedPlanData = SERVICE_PLANS.find((p) => p.id === selectedPlan) || SERVICE_PLANS[1];
    const finalPrice = Math.max(selectedPlanData.price - appliedDiscount, 0);

    // ===== Calculate what's due today =====
    // Setup fee (if any) is charged today. Monthly starts in 30 days.
    const setupFee = selectedPlanData.setupFee || 0;
    const dueToday = setupFee + (appliedDiscount > 0 ? Math.max(selectedPlanData.price - appliedDiscount, 0) : 0);

    return (
      <Fade in timeout={500}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Secure Payment
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Your payment information is encrypted and sent securely. We never store your full account or card numbers.
          </Typography>

          {/* ===== Discount Banner ===== */}
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

          {/* ===== Payment Error Display ===== */}
          {paymentError && (
            <Alert severity="error" onClose={() => setPaymentError(null)} sx={{ mb: 3 }}>
              <AlertTitle>Payment Issue</AlertTitle>
              {paymentError}
            </Alert>
          )}

          <Grid container spacing={4}>
            {/* ===== LEFT COLUMN: Payment Form ===== */}
            <Grid item xs={12} md={8}>
              <Card sx={{ p: 3 }}>
                {/* ===== Security Badge ===== */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <ShieldIcon color="success" />
                  <Typography variant="body1">
                    256-bit SSL encrypted • PCI compliant
                  </Typography>
                </Box>

                {/* ===== Payment Method Tabs: ACH vs Credit Card ===== */}
                <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                  {/* ACH Tab Button */}
                  <Button
                    variant={paymentMethod === 'ach' ? 'contained' : 'outlined'}
                    onClick={() => setPaymentMethod('ach')}
                    startIcon={<span>🏦</span>}
                    sx={{
                      flex: 1,
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: paymentMethod === 'ach' ? 700 : 400,
                    }}
                  >
                    Bank Account (ACH)
                  </Button>
                  {/* Credit Card Tab Button */}
                  <Button
                    variant={paymentMethod === 'cc' ? 'contained' : 'outlined'}
                    onClick={() => setPaymentMethod('cc')}
                    startIcon={<CreditIcon />}
                    sx={{
                      flex: 1,
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: paymentMethod === 'cc' ? 700 : 400,
                    }}
                  >
                    Credit / Debit Card
                  </Button>
                </Box>

                {/* ================================================================ */}
                {/* ACH (BANK ACCOUNT) FORM                                          */}
                {/* Shows when paymentMethod === 'ach'                               */}
                {/* Collects: account holder name, bank name, routing #, account #,  */}
                {/*           and whether it's checking or savings                   */}
                {/* ================================================================ */}
                {paymentMethod === 'ach' && (
                  <Box>
                    <Alert severity="info" sx={{ mb: 3 }}>
                      <AlertTitle>ACH Bank Transfer — Most Popular</AlertTitle>
                      Pay directly from your bank account. Lower fees and automatic monthly billing.
                      Your routing and account numbers are on the bottom of your checks.
                    </Alert>

                    {/* Row 1: Account Holder Name + Bank Name */}
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Account Holder Name"
                          placeholder="John A. Doe"
                          value={paymentFields.checkName}
                          onChange={(e) => setPaymentFields(prev => ({ ...prev, checkName: e.target.value }))}
                          helperText="Name on the bank account"
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Bank Name"
                          placeholder="Chase, Wells Fargo, etc."
                          value={paymentFields.bankName}
                          onChange={(e) => setPaymentFields(prev => ({ ...prev, bankName: e.target.value }))}
                          helperText="Your bank's name"
                        />
                      </Grid>
                    </Grid>

                    {/* Row 2: Routing Number + Account Number */}
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Routing Number (9 digits)"
                          placeholder="021000021"
                          value={paymentFields.checkAba}
                          onChange={(e) => {
                            // ===== Only allow digits, max 9 =====
                            const val = e.target.value.replace(/\D/g, '').slice(0, 9);
                            setPaymentFields(prev => ({ ...prev, checkAba: val }));
                          }}
                          inputProps={{ maxLength: 9, inputMode: 'numeric' }}
                          helperText={
                            paymentFields.checkAba.length > 0 && paymentFields.checkAba.length !== 9
                              ? `${paymentFields.checkAba.length}/9 digits entered`
                              : 'Bottom-left of your check'
                          }
                          error={paymentFields.checkAba.length > 0 && paymentFields.checkAba.length !== 9}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Account Number"
                          placeholder="123456789"
                          value={paymentFields.checkAccount}
                          onChange={(e) => {
                            // ===== Only allow digits, max 17 =====
                            const val = e.target.value.replace(/\D/g, '').slice(0, 17);
                            setPaymentFields(prev => ({ ...prev, checkAccount: val }));
                          }}
                          inputProps={{ maxLength: 17, inputMode: 'numeric' }}
                          helperText="Bottom-center of your check"
                          required
                        />
                      </Grid>
                    </Grid>

                    {/* Row 3: Account Type (Checking / Savings) */}
                    <FormControl component="fieldset" sx={{ mb: 2 }}>
                      <FormLabel component="legend">Account Type</FormLabel>
                      <RadioGroup
                        row
                        value={paymentFields.accountType}
                        onChange={(e) => setPaymentFields(prev => ({ ...prev, accountType: e.target.value }))}
                      >
                        <FormControlLabel value="checking" control={<Radio />} label="Checking" />
                        <FormControlLabel value="savings" control={<Radio />} label="Savings" />
                      </RadioGroup>
                    </FormControl>

                    {/* ===== Visual Check Diagram ===== */}
                    <Box
                      sx={{
                        p: 2,
                        border: '1px dashed',
                        borderColor: 'divider',
                        borderRadius: 2,
                        bgcolor: 'grey.50',
                        mb: 2,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 600 }}>
                        Where to find your numbers:
                      </Typography>
                      <Box sx={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'text.secondary' }}>
                        <Typography variant="caption" component="div">
                          ┌─────────────────────────────────────┐
                        </Typography>
                        <Typography variant="caption" component="div">
                          │&nbsp;&nbsp;YOUR NAME&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│
                        </Typography>
                        <Typography variant="caption" component="div">
                          │&nbsp;&nbsp;123 Main St&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│
                        </Typography>
                        <Typography variant="caption" component="div">
                          │&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│
                        </Typography>
                        <Typography variant="caption" component="div">
                          │&nbsp;&nbsp;⮟ Routing #&nbsp;&nbsp;&nbsp;⮟ Account #&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│
                        </Typography>
                        <Typography variant="caption" component="div">
                          │&nbsp;&nbsp;⌊021000021⌋&nbsp;&nbsp;⌊123456789⌋&nbsp;&nbsp;1001&nbsp;&nbsp;&nbsp;│
                        </Typography>
                        <Typography variant="caption" component="div">
                          └─────────────────────────────────────┘
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                )}

                {/* ================================================================ */}
                {/* CREDIT / DEBIT CARD FORM                                         */}
                {/* Shows when paymentMethod === 'cc'                                */}
                {/* Collects: card number, expiration (MM/YY), CVV                   */}
                {/* ================================================================ */}
                {paymentMethod === 'cc' && (
                  <Box>
                    <Alert severity="info" sx={{ mb: 3 }}>
                      <AlertTitle>Credit or Debit Card</AlertTitle>
                      We accept Visa, Mastercard, Discover, and American Express.
                    </Alert>

                    {/* Card Number */}
                    <TextField
                      fullWidth
                      label="Card Number"
                      placeholder="4111 1111 1111 1111"
                      value={paymentFields.ccNumber}
                      onChange={(e) => {
                        // ===== Only allow digits, max 19 (some cards are 16-19) =====
                        const val = e.target.value.replace(/\D/g, '').slice(0, 19);
                        setPaymentFields(prev => ({ ...prev, ccNumber: val }));
                      }}
                      inputProps={{ maxLength: 19, inputMode: 'numeric' }}
                      helperText="Enter your full card number (no spaces)"
                      sx={{ mb: 2 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CreditIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                      required
                    />

                    {/* Expiration + CVV Row */}
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Expiration (MMYY)"
                          placeholder="1228"
                          value={paymentFields.ccExp}
                          onChange={(e) => {
                            // ===== Only digits, max 4 (MMYY format) =====
                            const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                            setPaymentFields(prev => ({ ...prev, ccExp: val }));
                          }}
                          inputProps={{ maxLength: 4, inputMode: 'numeric' }}
                          helperText="Format: MMYY (e.g. 1228 = Dec 2028)"
                          error={paymentFields.ccExp.length > 0 && paymentFields.ccExp.length !== 4}
                          required
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="CVV"
                          placeholder="123"
                          value={paymentFields.cvv}
                          onChange={(e) => {
                            // ===== Only digits, max 4 (AmEx has 4-digit CVV) =====
                            const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                            setPaymentFields(prev => ({ ...prev, cvv: val }));
                          }}
                          inputProps={{ maxLength: 4, inputMode: 'numeric' }}
                          helperText="3 or 4 digits on back of card"
                          required
                        />
                      </Grid>
                    </Grid>

                    {/* Cardholder Name (optional, helps NMI with verification) */}
                    <TextField
                      fullWidth
                      label="Cardholder Name"
                      placeholder="John A. Doe"
                      value={paymentFields.cardholderName}
                      onChange={(e) => setPaymentFields(prev => ({ ...prev, cardholderName: e.target.value }))}
                      helperText="Name as it appears on the card"
                      sx={{ mb: 2 }}
                    />
                  </Box>
                )}

                {/* ===== Authorization Disclaimer ===== */}
                <Alert severity="warning" sx={{ mb: 3, mt: 1 }}>
                  <Typography variant="body2">
                    By clicking "Complete Payment" you authorize Speedy Credit Repair Inc. to{' '}
                    {setupFee > 0
                      ? `charge a one-time setup fee of $${setupFee} today and `
                      : ''}
                    set up recurring monthly billing of ${finalPrice}/mo beginning 30 days from today.
                    You may cancel at any time by calling (888) 724-7344.
                  </Typography>
                </Alert>

                {/* ===== SUBMIT BUTTON ===== */}
                <GlowingButton
                  fullWidth
                  onClick={handleNMIPayment}
                  disabled={loading}
                  size="large"
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PaymentIcon />}
                  sx={discountApplied ? { background: 'linear-gradient(45deg, #4CAF50, #8BC34A)' } : {}}
                >
                  {loading ? 'Processing securely...' : `Complete Payment — $${setupFee > 0 ? setupFee + ' today' : finalPrice + '/mo'}`}
                </GlowingButton>

                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, textAlign: 'center' }}>
                  Cancel anytime. No long-term contracts. 30-day satisfaction guarantee.
                </Typography>

                {/* ===== Zelle Fallback Option ===== */}
                <Divider sx={{ my: 3 }}>
                  <Chip label="OR" size="small" />
                </Divider>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Prefer to pay a different way?
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleZelleFallback}
                    disabled={loading}
                    sx={{ textTransform: 'none' }}
                  >
                    📱 Pay with Zelle Instead
                  </Button>
                </Box>
              </Card>
            </Grid>

            {/* ===== RIGHT COLUMN: Order Summary ===== */}
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 3, bgcolor: discountApplied ? 'success.50' : 'grey.50' }}>
                <Typography variant="h6" gutterBottom>
                  Order Summary
                </Typography>
                <Divider sx={{ my: 2 }} />

                {/* Plan Name + Monthly Price */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>{selectedPlanData.name} Plan</Typography>
                  <Typography
                    fontWeight={600}
                    sx={discountApplied ? { textDecoration: 'line-through', color: 'text.disabled' } : {}}
                  >
                    ${selectedPlanData.price}/mo
                  </Typography>
                </Box>

                {/* Discount Line (only if discount applied) */}
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

                {/* Setup Fee Line */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography color="text.secondary">Setup Fee</Typography>
                  <Typography fontWeight={600} color={setupFee > 0 ? 'text.primary' : 'success.main'}>
                    {setupFee > 0 ? `$${setupFee}` : '$0 (Waived)'}
                  </Typography>
                </Box>

                {/* Per-Deletion Fee Note (Professional plan) */}
                {selectedPlanData.perDeletion && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography color="text.secondary" variant="body2">Per Deletion</Typography>
                    <Typography variant="body2">${selectedPlanData.perDeletion}/item</Typography>
                  </Box>
                )}

                <Divider sx={{ my: 2 }} />

                {/* Due Today */}
                {setupFee > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600}>Due Today (Setup)</Typography>
                    <Typography variant="subtitle1" fontWeight={700} color="primary">
                      ${setupFee}
                    </Typography>
                  </Box>
                )}

                {/* Monthly Amount */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6">{setupFee > 0 ? 'Monthly (starts in 30 days)' : 'Monthly Amount'}</Typography>
                  <Typography variant="h6" fontWeight={700} color={discountApplied ? 'success.main' : 'primary'}>
                    ${finalPrice}/mo
                  </Typography>
                </Box>

                {discountApplied && (
                  <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
                    You're saving ${appliedDiscount}!
                  </Typography>
                )}

                {/* ===== Trust Badges ===== */}
                <Divider sx={{ my: 2 }} />
                <Box sx={{ textAlign: 'center' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                    <Chip icon={<ShieldIcon />} label="SSL Encrypted" size="small" variant="outlined" />
                    <Chip icon={<VerifiedIcon />} label="PCI Compliant" size="small" variant="outlined" />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    A+ BBB Rated • 30 Years in Business
                  </Typography>
                </Box>
              </Card>

              {/* ===== Billing Day Reminder ===== */}
              <Card sx={{ p: 2, mt: 2, bgcolor: 'info.50' }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Billing Day:</strong> {formData.billingDay || 1}
                  {formData.billingDay === 1
                    ? 'st'
                    : formData.billingDay === 2
                    ? 'nd'
                    : formData.billingDay === 3
                    ? 'rd'
                    : 'th'}{' '}
                  of each month, starting 30 days from today.
                </Typography>
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

        {/* Show CreditReportDisplay after enrollment completes */}
        <CreditReportDisplay
          score={creditReport?.vantageScore}
          accounts={creditReport?.accounts}
          loading={isLoading}
        />

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
      {(true) && (
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
{/* ===== NMI Payment is now handled inline in renderPhase7() ===== */}
    </Box>
  );
};

export default CompleteEnrollmentFlow;