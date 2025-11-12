// FullAgreement.jsx - Comprehensive Credit Repair Service Agreement
// Enterprise-grade agreement with all terms, pricing, guarantees, and legal provisions

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardActions,
  CardHeader,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Grid,
  Divider,
  Chip,
  Avatar,
  Alert,
  AlertTitle,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
  ListItemSecondaryAction,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Switch,
  Radio,
  RadioGroup,
  Tabs,
  Tab,
  CircularProgress,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  StepButton,
  InputAdornment,
  Tooltip,
  Badge,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  AccordionActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  ToggleButton,
  ToggleButtonGroup,
  Backdrop,
  SpeedDial,
  SpeedDialIcon,
  SpeedDialAction,
  Collapse,
  Fade,
  Zoom,
  Slide,
  Grow,
  Snackbar,
  Rating,
  Breadcrumbs,
  Link,
  Drawer,
  AppBar,
  Toolbar,
  Container,
  ButtonGroup
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent
} from '@mui/lab';
import {
  Description,
  Assignment,
  Gavel,
  AttachMoney,
  CreditCard,
  AccountBalance,
  CheckCircle,
  Cancel,
  Warning,
  Info,
  Error,
  Security,
  VerifiedUser,
  Policy,
  BusinessCenter,
  Handshake,
  DocumentScanner,
  Receipt,
  RequestQuote,
  PriceCheck,
  MoneyOff,
  Payment,
  Payments,
  PaymentsOutlined,
  CreditScore,
  TrendingUp,
  Timeline as TimelineIcon,
  DateRange,
  CalendarToday,
  Schedule,
  Timer,
  AccessTime,
  History,
  Update,
  Autorenew,
  Loop,
  Cached,
  Save,
  Send,
  Print,
  Download,
  Upload,
  Share,
  Email,
  Phone,
  Person,
  People,
  Group,
  Business,
  Home,
  LocationOn,
  Flag,
  Star,
  StarBorder,
  Favorite,
  FavoriteBorder,
  ThumbUp,
  ThumbDown,
  Done,
  DoneAll,
  DoneOutline,
  Close,
  Clear,
  Delete,
  Edit,
  Add,
  Remove,
  ExpandMore,
  ExpandLess,
  ChevronRight,
  ChevronLeft,
  NavigateNext,
  NavigateBefore,
  MoreVert,
  MoreHoriz,
  Settings,
  Tune,
  Build,
  Extension,
  Widgets,
  Dashboard,
  Assessment,
  Analytics,
  Insights,
  TipsAndUpdates,
  Lightbulb,
  AutoAwesome,
  Psychology,
  School,
  MenuBook,
  LibraryBooks,
  Article,
  Newspaper,
  Feed,
  RssFeed,
  Forum,
  QuestionAnswer,
  LiveHelp,
  SupportAgent,
  ContactSupport,
  Help,
  HelpOutline,
  HelpCenter,
  NotListedLocation,
  Quiz,
  FactCheck,
  Rule,
  Balance,
  Scale,
  GavelOutlined,
  PolicyOutlined,
  PrivacyTip,
  Shield,
  AdminPanelSettings,
  SupervisorAccount,
  ManageAccounts,
  BadgeOutlined,
  WorkOutline,
  WorkHistory,
  Engineering,
  Construction,
  Handyman,
  CleaningServices,
  Plumbing,
  ElectricalServices,
  HomeRepairService,
  MedicalServices,
  HealthAndSafety,
  Coronavirus,
  LocalHospital,
  EmergencyShare,
  ReportProblem,
  NewReleases,
  Announcement,
  Campaign,
  NotificationImportant,
  CircleNotifications,
  NotificationsActive,
  NotificationAdd,
  MarkEmailRead,
  ForwardToInbox,
  MarkChatRead,
  Unsubscribe,
  CancelScheduleSend,
  EventAvailable,
  EventBusy,
  EventNote,
  EventRepeat,
  PermContactCalendar,
  DateRangeOutlined,
  TodayOutlined,
  EventOutlined,
  AlarmOn,
  AlarmOff,
  Alarm,
  AlarmAdd,
  Snooze,
  WatchLater,
  MoreTime,
  Timelapse,
  TimerOff,
  Timer3,
  Timer10,
  HourglassEmpty,
  HourglassFull,
  HourglassTop,
  HourglassBottom,
  PendingActions,
  PendingOutlined,
  RunningWithErrors,
  CloudDone,
  CloudSync,
  CloudOff,
  CloudQueue,
  CloudUpload,
  CloudDownload,
  CloudCircle,
  Backup,
  SettingsBackupRestore,
  RestoreFromTrash,
  RestorePage,
  HistoryEdu,
  HistoryToggleOff,
  UpdateDisabled,
  SystemUpdate,
  SystemUpdateAlt,
  SecurityUpdate,
  SecurityUpdateGood,
  SecurityUpdateWarning,
  Visibility,
  Check
} from '@mui/icons-material';
import SignatureCanvas from 'react-signature-canvas';
import { useForm, Controller, useFieldArray, useWatch } from 'react-hook-form';
import { doc, setDoc, getDoc, updateDoc, collection, serverTimestamp, query, where, getDocs, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { format, formatDistanceToNow, addMonths, addDays, differenceInDays, differenceInMonths, isBefore, isAfter } from 'date-fns';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';

// Service Packages
const SERVICE_PACKAGES = {
  basic: {
    name: 'Basic Credit Repair',
    price: 99.99,
    setupFee: 99,
    duration: 6,
    features: [
      'Credit report analysis',
      'Up to 5 dispute letters per month',
      'Credit monitoring',
      'Email support',
      'Monthly progress reports'
    ],
    guarantees: [
      '30-day money back guarantee',
      'Minimum 10 point score improvement'
    ]
  },
  professional: {
    name: 'Professional Credit Restoration',
    price: 149.99,
    setupFee: 149,
    duration: 6,
    features: [
      'Everything in Basic',
      'Unlimited dispute letters',
      'Creditor negotiations',
      'Debt validation assistance',
      'Identity theft recovery',
      'Phone & email support',
      'Bi-weekly progress reports'
    ],
    guarantees: [
      '60-day money back guarantee',
      'Minimum 35 point score improvement',
      'Guaranteed dispute responses'
    ]
  },
  premium: {
    name: 'Premium Credit Transformation',
    price: 299.99,
    setupFee: 199,
    duration: 12,
    features: [
      'Everything in Professional',
      'Dedicated account manager',
      'Legal team consultation',
      'Cease and desist letters',
      'Credit building strategies',
      'Financial planning consultation',
      '24/7 priority support',
      'Weekly progress reports',
      'Credit education resources'
    ],
    guarantees: [
      '90-day money back guarantee',
      'Minimum 50 point score improvement',
      'Guaranteed results or full refund',
      'Legal protection coverage'
    ]
  },
  enterprise: {
    name: 'Enterprise Solution',
    price: 'Custom',
    setupFee: 'Custom',
    duration: 12,
    features: [
      'Everything in Premium',
      'White-label options',
      'API access',
      'Bulk processing',
      'Custom reporting',
      'Dedicated success team',
      'SLA guarantees',
      'Custom integrations'
    ],
    guarantees: [
      'Custom SLA',
      'Performance-based pricing available',
      'Dedicated legal team'
    ]
  }
};

// Payment Methods
const PAYMENT_METHODS = [
  { id: 'credit_card', label: 'Credit Card', icon: <CreditCard /> },
  { id: 'debit_card', label: 'Debit Card', icon: <Payment /> },
  { id: 'ach', label: 'Bank Transfer (ACH)', icon: <AccountBalance /> },
  { id: 'paypal', label: 'PayPal', icon: <Payments /> },
  { id: 'check', label: 'Check', icon: <Receipt /> },
  { id: 'wire', label: 'Wire Transfer', icon: <PaymentsOutlined /> }
];

// Agreement Sections
const AGREEMENT_SECTIONS = [
  'Services',
  'Pricing & Payment',
  'Term & Cancellation',
  'Guarantees',
  'Client Obligations',
  'Company Obligations',
  'Dispute Process',
  'Confidentiality',
  'Liability',
  'Legal Provisions'
];

// Cancellation Reasons
const CANCELLATION_REASONS = [
  'Service completed successfully',
  'Moving to different provider',
  'Financial constraints',
  'Not seeing expected results',
  'No longer need service',
  'Other'
];

const FullAgreement = ({
  clientId = null,
  mode = 'create', // 'create', 'edit', 'view', 'sign', 'renew', 'cancel'
  existingAgreementId = null,
  onComplete,
  requireCosigner = false,
  allowCustomTerms = false
}) => {
  const { user } = useAuth();
  const { showSuccess, showError, showInfo, showWarning } = useNotification();
  
  // Form setup
  const { control, handleSubmit, watch, setValue, getValues, reset, formState: { errors, isDirty } } = useForm({
    defaultValues: {
      // Client Information
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      clientAddress: '',
      clientCity: '',
      clientState: '',
      clientZip: '',
      clientDOB: '',
      clientSSN: '',
      
      // Co-signer Information (if required)
      cosignerName: '',
      cosignerEmail: '',
      cosignerPhone: '',
      cosignerRelation: '',
      
      // Service Details
      packageType: 'professional',
      customPackage: null,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      autoRenew: true,
      renewalTerm: 6,
      
      // Pricing
      monthlyFee: 149.99,
      setupFee: 149,
      discount: 0,
      discountType: 'percentage', // 'percentage' or 'fixed'
      promotionCode: '',
      totalAmount: 0,
      
      // Payment
      paymentMethod: 'credit_card',
      billingCycle: 'monthly', // 'monthly', 'quarterly', 'semi-annual', 'annual'
      paymentDueDate: 1, // Day of month
      autopayEnabled: true,
      
      // Payment Details
      cardNumber: '',
      cardName: '',
      cardExpiry: '',
      cardCVV: '',
      bankName: '',
      routingNumber: '',
      accountNumber: '',
      accountType: 'checking',
      
      // Guarantees
      acceptedGuarantees: [],
      customGuarantees: [],
      moneyBackPeriod: 60,
      minimumScoreImprovement: 35,
      
      // Terms Acceptance
      acceptServiceTerms: false,
      acceptPrivacyPolicy: false,
      acceptBillingTerms: false,
      acceptDisputeProcess: false,
      acceptLiability: false,
      acceptAll: false,
      
      // Additional Options
      addCreditMonitoring: true,
      addIdentityProtection: false,
      addFinancialCounseling: false,
      addLegalConsultation: false,
      addRushService: false,
      
      // Custom Terms (if allowed)
      customTerms: '',
      specialRequests: '',
      internalNotes: '',
      
      // Signatures
      clientSignature: '',
      clientSignDate: '',
      cosignerSignature: '',
      cosignerSignDate: '',
      companyRepSignature: '',
      companyRepName: '',
      companyRepTitle: '',
      companyRepDate: '',
      
      // Agreement Metadata
      agreementNumber: '',
      version: '2.0',
      status: 'draft',
      createdAt: '',
      modifiedAt: '',
      executedAt: '',
      expiresAt: '',
      renewedFrom: '',
      cancelledAt: '',
      cancellationReason: '',
      cancellationNotes: ''
    }
  });
  
  // Watch form values
  const watchedPackage = watch('packageType');
  const watchedBillingCycle = watch('billingCycle');
  const watchedDiscount = watch('discount');
  const watchedDiscountType = watch('discountType');
  const watchedAddOns = watch(['addCreditMonitoring', 'addIdentityProtection', 'addFinancialCounseling', 'addLegalConsultation', 'addRushService']);
  const watchedAcceptAll = watch('acceptAll');
  
  // State
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [agreementId, setAgreementId] = useState(existingAgreementId);
  const [signatureDialogOpen, setSignatureDialogOpen] = useState(false);
  const [currentSignatureField, setCurrentSignatureField] = useState(null);
  const [signatures, setSignatures] = useState({});
  const [expandedSection, setExpandedSection] = useState('Services');
  const [showPreview, setShowPreview] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [agreementHistory, setAgreementHistory] = useState([]);
  const [amendments, setAmendments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [qrCode, setQrCode] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [ipAddress, setIpAddress] = useState('');
  const [userAgent, setUserAgent] = useState('');
  const [geolocation, setGeolocation] = useState(null);
  
  // Refs
  const signaturePadRef = useRef();
  const agreementRef = useRef();
  const printRef = useRef();
  
  // Calculate pricing
  const calculatePricing = useMemo(() => {
    const selectedPackage = SERVICE_PACKAGES[watchedPackage];
    if (!selectedPackage) return { monthly: 0, setup: 0, addOns: 0, discount: 0, total: 0 };
    
    let monthlyBase = selectedPackage.price === 'Custom' ? watch('monthlyFee') : selectedPackage.price;
    let setupBase = selectedPackage.setupFee === 'Custom' ? watch('setupFee') : selectedPackage.setupFee;
    
    // Add-on pricing
    let addOnsMonthly = 0;
    if (watch('addCreditMonitoring')) addOnsMonthly += 19.99;
    if (watch('addIdentityProtection')) addOnsMonthly += 14.99;
    if (watch('addFinancialCounseling')) addOnsMonthly += 49.99;
    if (watch('addLegalConsultation')) addOnsMonthly += 99.99;
    if (watch('addRushService')) addOnsMonthly += 29.99;
    
    // Calculate discount
    let discountAmount = 0;
    if (watchedDiscount > 0) {
      if (watchedDiscountType === 'percentage') {
        discountAmount = (monthlyBase + addOnsMonthly) * (watchedDiscount / 100);
      } else {
        discountAmount = watchedDiscount;
      }
    }
    
    // Billing cycle adjustment
    let cycleMultiplier = 1;
    let cycleDiscount = 0;
    switch (watchedBillingCycle) {
      case 'quarterly':
        cycleMultiplier = 3;
        cycleDiscount = 0.05; // 5% discount
        break;
      case 'semi-annual':
        cycleMultiplier = 6;
        cycleDiscount = 0.10; // 10% discount
        break;
      case 'annual':
        cycleMultiplier = 12;
        cycleDiscount = 0.15; // 15% discount
        break;
    }
    
    const monthlyTotal = monthlyBase + addOnsMonthly - discountAmount;
    const cycleTotal = monthlyTotal * cycleMultiplier * (1 - cycleDiscount);
    const firstPayment = setupBase + cycleTotal;
    
    return {
      monthly: monthlyBase,
      setup: setupBase,
      addOns: addOnsMonthly,
      discount: discountAmount,
      cycleDiscount: cycleTotal * cycleDiscount,
      monthlyTotal,
      cycleTotal,
      firstPayment,
      savings: cycleTotal * cycleDiscount
    };
  }, [watchedPackage, watchedBillingCycle, watchedDiscount, watchedDiscountType, watchedAddOns]);
  
  // Load existing agreement
  useEffect(() => {
    if (existingAgreementId) {
      loadAgreement();
    } else {
      generateAgreementNumber();
    }
    
    // Get user environment
    getUserEnvironment();
  }, [existingAgreementId]);
  
  // Generate QR code when agreement is created
  useEffect(() => {
    if (agreementId) {
      generateQRCode();
    }
  }, [agreementId]);
  
  // Handle accept all checkbox
  useEffect(() => {
    if (watchedAcceptAll) {
      setValue('acceptServiceTerms', true);
      setValue('acceptPrivacyPolicy', true);
      setValue('acceptBillingTerms', true);
      setValue('acceptDisputeProcess', true);
      setValue('acceptLiability', true);
    }
  }, [watchedAcceptAll]);
  
  const getUserEnvironment = async () => {
    // Get IP address
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      setIpAddress(data.ip);
    } catch (error) {
      console.error('Error fetching IP:', error);
    }
    
    // Get user agent
    setUserAgent(navigator.userAgent);
    
    // Get geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGeolocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          console.log('Geolocation denied');
        }
      );
    }
  };
  
  const generateAgreementNumber = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const agreementNum = `AGR-${timestamp}-${random}`;
    setValue('agreementNumber', agreementNum);
  };
  
  const generateQRCode = async () => {
    try {
      const verificationUrl = `${window.location.origin}/verify/agreement/${agreementId}`;
      const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCode(qrDataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };
  
  const loadAgreement = async () => {
    try {
      setLoading(true);
      const docRef = doc(db, 'agreements', existingAgreementId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        reset(data);
        setAgreementId(docSnap.id);
        setSignatures(data.signatures || {});
        
        // Load related data
        await loadAgreementHistory();
        await loadAmendments();
        
        showSuccess('Agreement loaded successfully');
      } else {
        showError('Agreement not found');
      }
    } catch (error) {
      console.error('Error loading agreement:', error);
      showError('Failed to load agreement');
    } finally {
      setLoading(false);
    }
  };
  
  const loadAgreementHistory = async () => {
    try {
      const q = query(
        collection(db, 'agreementHistory'),
        where('agreementId', '==', existingAgreementId)
      );
      const querySnapshot = await getDocs(q);
      const history = [];
      querySnapshot.forEach((doc) => {
        history.push({ id: doc.id, ...doc.data() });
      });
      setAgreementHistory(history.sort((a, b) => b.timestamp - a.timestamp));
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };
  
  const loadAmendments = async () => {
    try {
      const q = query(
        collection(db, 'amendments'),
        where('agreementId', '==', existingAgreementId)
      );
      const querySnapshot = await getDocs(q);
      const amends = [];
      querySnapshot.forEach((doc) => {
        amends.push({ id: doc.id, ...doc.data() });
      });
      setAmendments(amends.sort((a, b) => b.createdAt - a.createdAt));
    } catch (error) {
      console.error('Error loading amendments:', error);
    }
  };
  
  const validateStep = (stepIndex) => {
    const errors = {};
    const data = getValues();
    
    switch (stepIndex) {
      case 0: // Client Information
        if (!data.clientName) errors.clientName = 'Name is required';
        if (!data.clientEmail) errors.clientEmail = 'Email is required';
        if (!data.clientPhone) errors.clientPhone = 'Phone is required';
        if (!data.clientAddress) errors.clientAddress = 'Address is required';
        if (!data.clientCity) errors.clientCity = 'City is required';
        if (!data.clientState) errors.clientState = 'State is required';
        if (!data.clientZip) errors.clientZip = 'ZIP code is required';
        if (!data.clientDOB) errors.clientDOB = 'Date of birth is required';
        if (!data.clientSSN) errors.clientSSN = 'SSN is required';
        
        if (requireCosigner) {
          if (!data.cosignerName) errors.cosignerName = 'Co-signer name is required';
          if (!data.cosignerEmail) errors.cosignerEmail = 'Co-signer email is required';
          if (!data.cosignerPhone) errors.cosignerPhone = 'Co-signer phone is required';
          if (!data.cosignerRelation) errors.cosignerRelation = 'Relationship is required';
        }
        break;
        
      case 1: // Service Selection
        if (!data.packageType) errors.packageType = 'Package selection is required';
        if (!data.startDate) errors.startDate = 'Start date is required';
        break;
        
      case 2: // Payment Information
        if (!data.paymentMethod) errors.paymentMethod = 'Payment method is required';
        
        if (data.paymentMethod === 'credit_card' || data.paymentMethod === 'debit_card') {
          if (!data.cardNumber) errors.cardNumber = 'Card number is required';
          if (!data.cardName) errors.cardName = 'Cardholder name is required';
          if (!data.cardExpiry) errors.cardExpiry = 'Expiry date is required';
          if (!data.cardCVV) errors.cardCVV = 'CVV is required';
        }
        
        if (data.paymentMethod === 'ach') {
          if (!data.bankName) errors.bankName = 'Bank name is required';
          if (!data.routingNumber) errors.routingNumber = 'Routing number is required';
          if (!data.accountNumber) errors.accountNumber = 'Account number is required';
        }
        break;
        
      case 3: // Terms Review
        if (!data.acceptServiceTerms) errors.acceptServiceTerms = 'Must accept service terms';
        if (!data.acceptPrivacyPolicy) errors.acceptPrivacyPolicy = 'Must accept privacy policy';
        if (!data.acceptBillingTerms) errors.acceptBillingTerms = 'Must accept billing terms';
        if (!data.acceptDisputeProcess) errors.acceptDisputeProcess = 'Must accept dispute process';
        if (!data.acceptLiability) errors.acceptLiability = 'Must accept liability terms';
        break;
        
      case 4: // Signatures
        if (!signatures.client) errors.clientSignature = 'Client signature is required';
        if (requireCosigner && !signatures.cosigner) errors.cosignerSignature = 'Co-signer signature is required';
        break;
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
      saveProgress();
    } else {
      showError('Please complete all required fields');
    }
  };
  
  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };
  
  const saveProgress = async () => {
    if (!isDirty) return;
    
    try {
      setSaving(true);
      const formData = getValues();
      
      const dataToSave = {
        ...formData,
        signatures,
        lastModified: serverTimestamp(),
        modifiedBy: user.uid,
        currentStep: activeStep,
        pricing: calculatePricing
      };
      
      if (agreementId) {
        await updateDoc(doc(db, 'agreements', agreementId), dataToSave);
      } else {
        const docRef = await addDoc(collection(db, 'agreements'), {
          ...dataToSave,
          createdAt: serverTimestamp(),
          createdBy: user.uid,
          status: 'draft'
        });
        setAgreementId(docRef.id);
      }
      
      // Add to history
      await addDoc(collection(db, 'agreementHistory'), {
        agreementId: agreementId || docRef.id,
        action: 'progress_saved',
        step: activeStep,
        timestamp: serverTimestamp(),
        userId: user.uid
      });
      
      showInfo('Progress saved');
    } catch (error) {
      console.error('Error saving progress:', error);
      showError('Failed to save progress');
    } finally {
      setSaving(false);
    }
  };
  
  const openSignatureDialog = (field) => {
    setCurrentSignatureField(field);
    setSignatureDialogOpen(true);
  };
  
  const handleSignatureSave = () => {
    if (signaturePadRef.current && !signaturePadRef.current.isEmpty()) {
      const signatureData = signaturePadRef.current.toDataURL();
      const signatureInfo = {
        signature: signatureData,
        timestamp: new Date().toISOString(),
        ipAddress,
        userAgent,
        geolocation,
        signedBy: currentSignatureField === 'client' ? getValues('clientName') : 
                  currentSignatureField === 'cosigner' ? getValues('cosignerName') :
                  getValues('companyRepName')
      };
      
      setSignatures(prev => ({
        ...prev,
        [currentSignatureField]: signatureInfo
      }));
      
      setValue(`${currentSignatureField}Signature`, signatureData);
      setValue(`${currentSignatureField}SignDate`, new Date().toISOString());
      
      setSignatureDialogOpen(false);
      showSuccess('Signature captured');
    } else {
      showError('Please provide a signature');
    }
  };
  
  const handleSignatureClear = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
    }
  };
  
  const processPayment = async () => {
    setProcessingPayment(true);
    try {
      // Simulate payment processing
      // In production, integrate with payment gateway (Stripe, PayPal, etc.)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Record payment
      await addDoc(collection(db, 'payments'), {
        agreementId,
        amount: calculatePricing.firstPayment,
        type: 'setup_and_first_payment',
        method: getValues('paymentMethod'),
        status: 'completed',
        processedAt: serverTimestamp(),
        clientId: clientId || user.uid
      });
      
      setPaymentStatus('success');
      showSuccess('Payment processed successfully');
      return true;
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('failed');
      showError('Payment failed. Please try again.');
      return false;
    } finally {
      setProcessingPayment(false);
    }
  };
  
  const generatePDF = async () => {
    try {
      setLoading(true);
      const element = printRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 10;
      
      // Add first page
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      // Add additional pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // Add QR code
      if (qrCode) {
        pdf.addImage(qrCode, 'PNG', pageWidth - 40, 10, 30, 30);
      }
      
      // Save PDF
      const pdfBlob = pdf.output('blob');
      
      // Upload to storage
      const storageRef = ref(storage, `agreements/${agreementId}/agreement_${Date.now()}.pdf`);
      const uploadResult = await uploadBytes(storageRef, pdfBlob);
      const downloadURL = await getDownloadURL(uploadResult.ref);
      
      setPdfUrl(downloadURL);
      
      // Update agreement with PDF URL
      await updateDoc(doc(db, 'agreements', agreementId), {
        pdfUrl: downloadURL,
        pdfGeneratedAt: serverTimestamp()
      });
      
      // Download PDF
      pdf.save(`Agreement_${getValues('agreementNumber')}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
      
      showSuccess('PDF generated successfully');
      return downloadURL;
    } catch (error) {
      console.error('Error generating PDF:', error);
      showError('Failed to generate PDF');
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  const sendAgreementEmail = async (pdfUrl) => {
    try {
      const emailData = {
        to: getValues('clientEmail'),
        cc: requireCosigner ? getValues('cosignerEmail') : null,
        template: {
          name: 'agreement-executed',
          data: {
            clientName: getValues('clientName'),
            agreementNumber: getValues('agreementNumber'),
            packageName: SERVICE_PACKAGES[getValues('packageType')].name,
            monthlyFee: calculatePricing.monthlyTotal,
            startDate: getValues('startDate'),
            pdfUrl: pdfUrl || pdfUrl
          }
        }
      };
      
      await addDoc(collection(db, 'mail'), emailData);
      
      setEmailSent(true);
      showSuccess('Agreement sent via email');
    } catch (error) {
      console.error('Error sending email:', error);
      showError('Failed to send email');
    }
  };
  
  const executeAgreement = async () => {
    try {
      setLoading(true);
      
      // Validate all steps
      for (let i = 0; i <= 4; i++) {
        if (!validateStep(i)) {
          setActiveStep(i);
          showError('Please complete all required fields');
          return;
        }
      }
      
      // Process payment
      const paymentSuccess = await processPayment();
      if (!paymentSuccess) {
        return;
      }
      
      // Generate PDF
      const pdfUrl = await generatePDF();
      
      // Update agreement status
      const executionData = {
        ...getValues(),
        signatures,
        status: 'executed',
        executedAt: serverTimestamp(),
        executedBy: user.uid,
        pdfUrl,
        ipAddress,
        userAgent,
        geolocation,
        pricing: calculatePricing
      };
      
      await updateDoc(doc(db, 'agreements', agreementId), executionData);
      
      // Create client record if new
      if (!clientId) {
        await addDoc(collection(db, 'clients'), {
          name: getValues('clientName'),
          email: getValues('clientEmail'),
          phone: getValues('clientPhone'),
          agreementId,
          packageType: getValues('packageType'),
          status: 'active',
          createdAt: serverTimestamp(),
          createdBy: user.uid
        });
      }
      
      // Send notifications
      await sendAgreementEmail(pdfUrl);
      
      // Add to history
      await addDoc(collection(db, 'agreementHistory'), {
        agreementId,
        action: 'executed',
        timestamp: serverTimestamp(),
        userId: user.uid,
        details: {
          clientName: getValues('clientName'),
          package: getValues('packageType'),
          amount: calculatePricing.firstPayment
        }
      });
      
      showSuccess('Agreement executed successfully!');
      
      if (onComplete) {
        onComplete({
          agreementId,
          ...executionData
        });
      }
    } catch (error) {
      console.error('Error executing agreement:', error);
      showError('Failed to execute agreement');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRenewAgreement = async () => {
    try {
      setLoading(true);
      
      // Create renewal agreement
      const renewalData = {
        ...getValues(),
        renewedFrom: agreementId,
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: format(addMonths(new Date(), getValues('renewalTerm')), 'yyyy-MM-dd'),
        status: 'draft',
        createdAt: serverTimestamp(),
        createdBy: user.uid
      };
      
      const renewalRef = await addDoc(collection(db, 'agreements'), renewalData);
      
      // Update current agreement
      await updateDoc(doc(db, 'agreements', agreementId), {
        renewedTo: renewalRef.id,
        renewedAt: serverTimestamp(),
        status: 'renewed'
      });
      
      showSuccess('Agreement renewed successfully');
      
      // Navigate to new agreement
      if (onComplete) {
        onComplete({
          action: 'renewed',
          newAgreementId: renewalRef.id
        });
      }
    } catch (error) {
      console.error('Error renewing agreement:', error);
      showError('Failed to renew agreement');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancelAgreement = async (reason, notes) => {
    try {
      setLoading(true);
      
      await updateDoc(doc(db, 'agreements', agreementId), {
        status: 'cancelled',
        cancelledAt: serverTimestamp(),
        cancelledBy: user.uid,
        cancellationReason: reason,
        cancellationNotes: notes
      });
      
      // Add to history
      await addDoc(collection(db, 'agreementHistory'), {
        agreementId,
        action: 'cancelled',
        timestamp: serverTimestamp(),
        userId: user.uid,
        details: {
          reason,
          notes
        }
      });
      
      showSuccess('Agreement cancelled');
      
      if (onComplete) {
        onComplete({
          action: 'cancelled',
          agreementId
        });
      }
    } catch (error) {
      console.error('Error cancelling agreement:', error);
      showError('Failed to cancel agreement');
    } finally {
      setLoading(false);
    }
  };
  
  const steps = [
    'Client Information',
    'Service Selection',
    'Payment Information',
    'Terms Review',
    'Signatures'
  ];
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }
  
  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                <Gavel />
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  Service Agreement
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Agreement #{watch('agreementNumber')}
                </Typography>
              </Box>
            </Box>
            
            <Box display="flex" gap={2} alignItems="center">
              <Chip
                icon={watch('status') === 'executed' ? <CheckCircle /> : <Schedule />}
                label={watch('status')?.toUpperCase() || 'DRAFT'}
                color={watch('status') === 'executed' ? 'success' : 'default'}
              />
              <IconButton onClick={() => setShowPreview(true)}>
                <Visibility />
              </IconButton>
              <IconButton onClick={generatePDF} disabled={!agreementId}>
                <Download />
              </IconButton>
              <IconButton onClick={() => sendAgreementEmail(pdfUrl)} disabled={!emailSent}>
                <Email />
              </IconButton>
            </Box>
          </Box>
          
          {/* Progress Bar */}
          <LinearProgress 
            variant="determinate" 
            value={(activeStep / (steps.length - 1)) * 100}
            sx={{ mt: 2, height: 6, borderRadius: 3 }}
          />
        </CardContent>
      </Card>
      
      {/* Pricing Summary (Always Visible) */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={6} md={2}>
              <Box textAlign="center">
                <Typography variant="caption" color="text.secondary">Package</Typography>
                <Typography variant="h6">
                  {SERVICE_PACKAGES[watchedPackage]?.name.split(' ')[0]}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Box textAlign="center">
                <Typography variant="caption" color="text.secondary">Monthly</Typography>
                <Typography variant="h6">
                  ${calculatePricing.monthlyTotal.toFixed(2)}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Box textAlign="center">
                <Typography variant="caption" color="text.secondary">Setup Fee</Typography>
                <Typography variant="h6">
                  ${calculatePricing.setup}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Box textAlign="center">
                <Typography variant="caption" color="text.secondary">Cycle Total</Typography>
                <Typography variant="h6">
                  ${calculatePricing.cycleTotal.toFixed(2)}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Box textAlign="center">
                <Typography variant="caption" color="text.secondary">Savings</Typography>
                <Typography variant="h6" color="success.main">
                  ${calculatePricing.savings.toFixed(2)}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Box textAlign="center">
                <Typography variant="caption" color="text.secondary">Due Today</Typography>
                <Typography variant="h5" color="primary">
                  ${calculatePricing.firstPayment.toFixed(2)}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      {/* Main Stepper */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>
      
      {/* Step Content */}
      <Card>
        <CardContent sx={{ minHeight: 400 }}>
          {/* Step 0: Client Information */}
          {activeStep === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Client Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="billingCycle"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Billing Cycle</InputLabel>
                        <Select
                          {...field}
                          label="Billing Cycle"
                        >
                          <MenuItem value="monthly">Monthly</MenuItem>
                          <MenuItem value="quarterly">Quarterly (5% discount)</MenuItem>
                          <MenuItem value="semi-annual">Semi-Annual (10% discount)</MenuItem>
                          <MenuItem value="annual">Annual (15% discount)</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="autoRenew"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Switch {...field} checked={field.value} />}
                        label="Auto-Renewal Enabled"
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="promotionCode"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Promotion Code (Optional)"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <Button size="small">Apply</Button>
                            </InputAdornment>
                          )
                        }}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
          
          {/* Step 2: Payment Information */}
          {activeStep === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Payment Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Alert severity="info" sx={{ mb: 3 }}>
                <AlertTitle>Secure Payment</AlertTitle>
                Your payment information is encrypted and processed securely. We never store your full card details.
              </Alert>
              
              <Controller
                name="paymentMethod"
                control={control}
                rules={{ required: 'Payment method is required' }}
                render={({ field }) => (
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    {PAYMENT_METHODS.map((method) => (
                      <Grid item xs={6} sm={4} md={2} key={method.id}>
                        <Paper
                          sx={{
                            p: 2,
                            textAlign: 'center',
                            cursor: 'pointer',
                            border: 2,
                            borderColor: field.value === method.id ? 'primary.main' : 'divider',
                            '&:hover': {
                              borderColor: 'primary.main',
                              bgcolor: 'action.hover'
                            }
                          }}
                          onClick={() => field.onChange(method.id)}
                        >
                          <Box display="flex" flexDirection="column" alignItems="center">
                            {method.icon}
                            <Typography variant="caption" sx={{ mt: 1 }}>
                              {method.label}
                            </Typography>
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                )}
              />
              
              {/* Credit/Debit Card Fields */}
              {(watch('paymentMethod') === 'credit_card' || watch('paymentMethod') === 'debit_card') && (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Controller
                      name="cardNumber"
                      control={control}
                      rules={{ required: 'Card number is required' }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Card Number"
                          placeholder="1234 5678 9012 3456"
                          error={Boolean(errors.cardNumber)}
                          helperText={errors.cardNumber?.message}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <CreditCard />
                              </InputAdornment>
                            )
                          }}
                        />
                      )}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Controller
                      name="cardName"
                      control={control}
                      rules={{ required: 'Cardholder name is required' }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Cardholder Name"
                          placeholder="As it appears on card"
                          error={Boolean(errors.cardName)}
                          helperText={errors.cardName?.message}
                        />
                      )}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="cardExpiry"
                      control={control}
                      rules={{ required: 'Expiry date is required' }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Expiry Date"
                          placeholder="MM/YY"
                          error={Boolean(errors.cardExpiry)}
                          helperText={errors.cardExpiry?.message}
                        />
                      )}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="cardCVV"
                      control={control}
                      rules={{ required: 'CVV is required' }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="CVV"
                          placeholder="123"
                          error={Boolean(errors.cardCVV)}
                          helperText={errors.cardCVV?.message}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <Tooltip title="3-digit code on back of card">
                                  <Help />
                                </Tooltip>
                              </InputAdornment>
                            )
                          }}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              )}
              
              {/* ACH Bank Transfer Fields */}
              {watch('paymentMethod') === 'ach' && (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Controller
                      name="bankName"
                      control={control}
                      rules={{ required: 'Bank name is required' }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Bank Name"
                          error={Boolean(errors.bankName)}
                          helperText={errors.bankName?.message}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <AccountBalance />
                              </InputAdornment>
                            )
                          }}
                        />
                      )}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="routingNumber"
                      control={control}
                      rules={{ required: 'Routing number is required' }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Routing Number"
                          placeholder="9 digits"
                          error={Boolean(errors.routingNumber)}
                          helperText={errors.routingNumber?.message}
                        />
                      )}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="accountNumber"
                      control={control}
                      rules={{ required: 'Account number is required' }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Account Number"
                          error={Boolean(errors.accountNumber)}
                          helperText={errors.accountNumber?.message}
                        />
                      )}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Controller
                      name="accountType"
                      control={control}
                      render={({ field }) => (
                        <RadioGroup {...field} row>
                          <FormControlLabel value="checking" control={<Radio />} label="Checking" />
                          <FormControlLabel value="savings" control={<Radio />} label="Savings" />
                        </RadioGroup>
                      )}
                    />
                  </Grid>
                </Grid>
              )}
              
              {/* Billing Settings */}
              <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                Billing Settings
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="paymentDueDate"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Payment Due Date</InputLabel>
                        <Select
                          {...field}
                          label="Payment Due Date"
                        >
                          <MenuItem value={1}>1st of month</MenuItem>
                          <MenuItem value={5}>5th of month</MenuItem>
                          <MenuItem value={10}>10th of month</MenuItem>
                          <MenuItem value={15}>15th of month</MenuItem>
                          <MenuItem value={20}>20th of month</MenuItem>
                          <MenuItem value={25}>25th of month</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="autopayEnabled"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Switch {...field} checked={field.value} />}
                        label="Enable AutoPay"
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
          
          {/* Step 3: Terms Review */}
          {activeStep === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Terms & Conditions Review
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Alert severity="warning" sx={{ mb: 3 }}>
                <AlertTitle>Important</AlertTitle>
                Please carefully review all terms and conditions before accepting. These form a legally binding agreement.
              </Alert>
              
              {/* Agreement Sections */}
              {AGREEMENT_SECTIONS.map((section) => (
                <Accordion
                  key={section}
                  expanded={expandedSection === section}
                  onChange={() => setExpandedSection(expandedSection === section ? null : section)}
                  sx={{ mb: 2 }}
                >
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {section}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                      {section === 'Services' && (
                        <>
                          <Typography paragraph>
                            Speedy Credit Repair LLC ("Company") agrees to provide credit repair services 
                            as outlined in the selected service package. Services include but are not limited to:
                          </Typography>
                          <List>
                            {SERVICE_PACKAGES[watch('packageType')].features.map((feature, idx) => (
                              <ListItem key={idx}>
                                <ListItemIcon>
                                  <CheckCircle color="success" />
                                </ListItemIcon>
                                <ListItemText primary={feature} />
                              </ListItem>
                            ))}
                          </List>
                        </>
                      )}
                      
                      {section === 'Pricing & Payment' && (
                        <>
                          <Typography paragraph>
                            Client agrees to pay the following fees:
                          </Typography>
                          <Table size="small">
                            <TableBody>
                              <TableRow>
                                <TableCell>Monthly Service Fee</TableCell>
                                <TableCell align="right">${calculatePricing.monthlyTotal.toFixed(2)}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>One-Time Setup Fee</TableCell>
                                <TableCell align="right">${calculatePricing.setup}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>Billing Cycle</TableCell>
                                <TableCell align="right">{watch('billingCycle')}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>Total Due Today</TableCell>
                                <TableCell align="right">
                                  <strong>${calculatePricing.firstPayment.toFixed(2)}</strong>
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                          <Typography paragraph sx={{ mt: 2 }}>
                            Payments are processed on the {watch('paymentDueDate')}th of each month.
                            Late payments may result in service suspension.
                          </Typography>
                        </>
                      )}
                      
                      {section === 'Term & Cancellation' && (
                        <>
                          <Typography paragraph>
                            This agreement begins on {watch('startDate')} and continues on a 
                            month-to-month basis until cancelled by either party.
                          </Typography>
                          <Typography paragraph>
                            <strong>Cancellation Policy:</strong> Either party may cancel this agreement 
                            with 5 days written notice. Cancellations are effective at the end of the 
                            current billing period. No refunds for partial months.
                          </Typography>
                          <Typography paragraph>
                            <strong>Auto-Renewal:</strong> {watch('autoRenew') ? 'Enabled' : 'Disabled'}. 
                            Services will {watch('autoRenew') ? 'automatically' : 'not'} renew at the 
                            end of each billing period.
                          </Typography>
                        </>
                      )}
                      
                      {section === 'Guarantees' && (
                        <>
                          <Typography paragraph>
                            <strong>Our Guarantees:</strong>
                          </Typography>
                          <List>
                            {SERVICE_PACKAGES[watch('packageType')].guarantees.map((guarantee, idx) => (
                              <ListItem key={idx}>
                                <ListItemIcon>
                                  <VerifiedUser color="primary" />
                                </ListItemIcon>
                                <ListItemText primary={guarantee} />
                              </ListItem>
                            ))}
                          </List>
                          <Typography paragraph sx={{ mt: 2 }}>
                            Results vary based on individual circumstances. While we guarantee our 
                            service quality, specific credit score improvements depend on various factors 
                            beyond our control.
                          </Typography>
                        </>
                      )}
                      
                      {section === 'Client Obligations' && (
                        <>
                          <Typography paragraph>
                            Client agrees to:
                          </Typography>
                          <List>
                            <ListItem>
                              <ListItemText primary="Provide accurate and complete information" />
                            </ListItem>
                            <ListItem>
                              <ListItemText primary="Promptly respond to requests for documentation" />
                            </ListItem>
                            <ListItem>
                              <ListItemText primary="Maintain current contact information" />
                            </ListItem>
                            <ListItem>
                              <ListItemText primary="Make timely payments as agreed" />
                            </ListItem>
                            <ListItem>
                              <ListItemText primary="Not engage in fraudulent or illegal activities" />
                            </ListItem>
                          </List>
                        </>
                      )}
                      
                      {section === 'Company Obligations' && (
                        <>
                          <Typography paragraph>
                            Company agrees to:
                          </Typography>
                          <List>
                            <ListItem>
                              <ListItemText primary="Provide services as described in the service package" />
                            </ListItem>
                            <ListItem>
                              <ListItemText primary="Maintain confidentiality of client information" />
                            </ListItem>
                            <ListItem>
                              <ListItemText primary="Comply with all applicable laws and regulations" />
                            </ListItem>
                            <ListItem>
                              <ListItemText primary="Provide regular updates on progress" />
                            </ListItem>
                            <ListItem>
                              <ListItemText primary="Respond to client inquiries within 48 business hours" />
                            </ListItem>
                          </List>
                        </>
                      )}
                      
                      {section === 'Dispute Process' && (
                        <>
                          <Typography paragraph>
                            Company will dispute inaccurate, incomplete, or unverifiable information 
                            on client's credit reports with credit bureaus, creditors, and collection agencies.
                          </Typography>
                          <Typography paragraph>
                            <strong>Process:</strong>
                          </Typography>
                          <List>
                            <ListItem>
                              <ListItemText primary="Client will provide necessary documentation and authorization to proceed with disputes." />
                            </ListItem>
                          </List>
                        </>
                      )}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))}

                <Grid item xs={12} sm={6}>
                
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="clientEmail"
                    control={control}
                    rules={{ 
                      required: 'Email is required',
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Invalid email address'
                      }
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Email Address"
                        type="email"
                        error={Boolean(errors.clientEmail || validationErrors.clientEmail)}
                        helperText={errors.clientEmail?.message || validationErrors.clientEmail}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Email />
                            </InputAdornment>
                          )
                        }}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="clientPhone"
                    control={control}
                    rules={{ required: 'Phone is required' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Phone Number"
                        error={Boolean(errors.clientPhone || validationErrors.clientPhone)}
                        helperText={errors.clientPhone?.message || validationErrors.clientPhone}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Phone />
                            </InputAdornment>
                          )
                        }}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="clientDOB"
                    control={control}
                    rules={{ required: 'Date of birth is required' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Date of Birth"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        error={Boolean(errors.clientDOB || validationErrors.clientDOB)}
                        helperText={errors.clientDOB?.message || validationErrors.clientDOB}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Controller
                    name="clientAddress"
                    control={control}
                    rules={{ required: 'Address is required' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Street Address"
                        error={Boolean(errors.clientAddress || validationErrors.clientAddress)}
                        helperText={errors.clientAddress?.message || validationErrors.clientAddress}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Home />
                            </InputAdornment>
                          )
                        }}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Controller
                    name="clientCity"
                    control={control}
                    rules={{ required: 'City is required' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="City"
                        error={Boolean(errors.clientCity || validationErrors.clientCity)}
                        helperText={errors.clientCity?.message || validationErrors.clientCity}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Controller
                    name="clientState"
                    control={control}
                    rules={{ required: 'State is required' }}
                    render={({ field }) => (
                      <FormControl fullWidth error={Boolean(errors.clientState || validationErrors.clientState)}>
                        <InputLabel>State</InputLabel>
                        <Select
                          {...field}
                          label="State"
                        >
                          <MenuItem value="">Select State</MenuItem>
                          <MenuItem value="CA">California</MenuItem>
                          <MenuItem value="TX">Texas</MenuItem>
                          <MenuItem value="FL">Florida</MenuItem>
                          <MenuItem value="NY">New York</MenuItem>
                          {/* Add all states */}
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Controller
                    name="clientZip"
                    control={control}
                    rules={{ required: 'ZIP code is required' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="ZIP Code"
                        error={Boolean(errors.clientZip || validationErrors.clientZip)}
                        helperText={errors.clientZip?.message || validationErrors.clientZip}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Controller
                    name="clientSSN"
                    control={control}
                    rules={{ 
                      required: 'SSN is required',
                      pattern: {
                        value: /^\d{3}-\d{2}-\d{4}$/,
                        message: 'Format: XXX-XX-XXXX'
                      }
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Social Security Number"
                        placeholder="XXX-XX-XXXX"
                        error={Boolean(errors.clientSSN || validationErrors.clientSSN)}
                        helperText={errors.clientSSN?.message || validationErrors.clientSSN}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Security />
                            </InputAdornment>
                          )
                        }}
                      />
                    )}
                  />
                </Grid>
                
                {/* Co-signer Section (if required) */}
                {requireCosigner && (
                  <>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }}>
                        <Chip label="Co-signer Information" />
                      </Divider>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="cosignerName"
                        control={control}
                        rules={{ required: requireCosigner ? 'Co-signer name is required' : false }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Co-signer Full Name"
                            error={Boolean(errors.cosignerName)}
                            helperText={errors.cosignerName?.message}
                          />
                        )}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="cosignerRelation"
                        control={control}
                        rules={{ required: requireCosigner ? 'Relationship is required' : false }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Relationship to Client"
                            error={Boolean(errors.cosignerRelation)}
                            helperText={errors.cosignerRelation?.message}
                          />
                        )}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="cosignerEmail"
                        control={control}
                        rules={{ 
                          required: requireCosigner ? 'Co-signer email is required' : false,
                          pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: 'Invalid email address'
                          }
                        }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Co-signer Email"
                            type="email"
                            error={Boolean(errors.cosignerEmail)}
                            helperText={errors.cosignerEmail?.message}
                          />
                        )}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="cosignerPhone"
                        control={control}
                        rules={{ required: requireCosigner ? 'Co-signer phone is required' : false }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Co-signer Phone"
                            error={Boolean(errors.cosignerPhone)}
                            helperText={errors.cosignerPhone?.message}
                          />
                        )}
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </Box>
          )}
          
          {/* Step 1: Service Selection */}
          {activeStep === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Service Selection
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Controller
                name="packageType"
                control={control}
                rules={{ required: 'Package selection is required' }}
                render={({ field }) => (
                  <Grid container spacing={3}>
                    {Object.entries(SERVICE_PACKAGES).map(([key, pkg]) => (
                      <Grid item xs={12} sm={6} md={3} key={key}>
                        <Card
                          sx={{
                            border: 2,
                            borderColor: field.value === key ? 'primary.main' : 'divider',
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            '&:hover': {
                              borderColor: 'primary.main',
                              transform: 'translateY(-4px)',
                              boxShadow: 3
                            }
                          }}
                          onClick={() => field.onChange(key)}
                        >
                          <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                              <Typography variant="h6" gutterBottom>
                                {pkg.name}
                              </Typography>
                              {field.value === key && (
                                <CheckCircle color="primary" />
                              )}
                            </Box>
                            
                            <Typography variant="h4" color="primary" gutterBottom>
                              {pkg.price === 'Custom' ? 'Custom' : `$${pkg.price}`}
                              {pkg.price !== 'Custom' && (
                                <Typography variant="caption" color="text.secondary">
                                  /month
                                </Typography>
                              )}
                            </Typography>
                            
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Setup: {pkg.setupFee === 'Custom' ? 'Custom' : `$${pkg.setupFee}`}
                            </Typography>
                            
                            <Divider sx={{ my: 2 }} />
                            
                            <Typography variant="subtitle2" gutterBottom>
                              Features:
                            </Typography>
                            <List dense>
                              {pkg.features.slice(0, 5).map((feature, idx) => (
                                <ListItem key={idx} sx={{ px: 0 }}>
                                  <ListItemIcon sx={{ minWidth: 30 }}>
                                    <CheckCircle fontSize="small" color="success" />
                                  </ListItemIcon>
                                  <ListItemText 
                                    primary={<Typography variant="caption">{feature}</Typography>} 
                                  />
                                </ListItem>
                              ))}
                            </List>
                            
                            {pkg.features.length > 5 && (
                              <Typography variant="caption" color="primary" sx={{ cursor: 'pointer' }}>
                                +{pkg.features.length - 5} more features
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              />
              
              {/* Add-ons Section */}
              <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                Additional Services
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="addCreditMonitoring"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Checkbox {...field} checked={field.value} />}
                        label={
                          <Box>
                            <Typography variant="body1">
                              Credit Monitoring (+$19.99/mo)
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Real-time alerts for credit changes
                            </Typography>
                          </Box>
                        }
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="addIdentityProtection"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Checkbox {...field} checked={field.value} />}
                        label={
                          <Box>
                            <Typography variant="body1">
                              Identity Protection (+$14.99/mo)
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Monitor for identity theft and fraud
                            </Typography>
                          </Box>
                        }
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="addFinancialCounseling"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Checkbox {...field} checked={field.value} />}
                        label={
                          <Box>
                            <Typography variant="body1">
                              Financial Counseling (+$49.99/mo)
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Monthly sessions with financial advisor
                            </Typography>
                          </Box>
                        }
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="addLegalConsultation"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Checkbox {...field} checked={field.value} />}
                        label={
                          <Box>
                            <Typography variant="body1">
                              Legal Consultation (+$99.99/mo)
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Access to credit repair attorneys
                            </Typography>
                          </Box>
                        }
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="addRushService"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Checkbox {...field} checked={field.value} />}
                        label={
                          <Box>
                            <Typography variant="body1">
                              Rush Service (+$29.99/mo)
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Priority processing and support
                            </Typography>
                          </Box>
                        }
                      />
                    )}
                  />
                </Grid>
              </Grid>
              
              {/* Term Selection */}
              <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                Service Terms
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="startDate"
                    control={control}
                    rules={{ required: 'Start date is required' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Service Start Date"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        error={Boolean(errors.startDate)}
                        helperText={errors.startDate?.message}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                    <Controller
                      name="duration"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Contract Duration</InputLabel>
                        <Select
                          {...field}
                          label="Contract Duration"
                        >
                          <MenuItem value={3}>3 Months</MenuItem>
                          <MenuItem value={6}>6 Months</MenuItem>
                          <MenuItem value={12}>12 Months</MenuItem>
                          <MenuItem value={24}>24 Months</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="autoRenew"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Switch {...field} checked={field.value} />}
                        label="Auto-Renewal"
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="renewalTerm"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth disabled={!watch('autoRenew')}>
                        <InputLabel>Renewal Term</InputLabel>
                        <Select
                          {...field}
                          label="Renewal Term"
                        >
                          <MenuItem value={3}>3 Months</MenuItem>
                          <MenuItem value={6}>6 Months</MenuItem>
                          <MenuItem value={12}>12 Months</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
          
          {/* Complete Step 3: Terms Review - Continuing from dispute process */}
          {activeStep === 3 && expandedSection === 'Dispute Process' && (
            <Box sx={{ p: 2 }}>
              <Typography paragraph>
                1. Initial credit report analysis and dispute identification
              </Typography>
              <Typography paragraph>
                2. Preparation and submission of dispute letters
              </Typography>
              <Typography paragraph>
                3. Follow-up with credit bureaus and furnishers
              </Typography>
              <Typography paragraph>
                4. Re-investigation requests as needed
              </Typography>
              <Typography paragraph>
                5. Escalation to regulatory agencies if necessary
              </Typography>
              <Typography paragraph>
                <strong>Timeline:</strong> Credit bureaus have 30-45 days to investigate disputes. 
                Full process may take 3-6 months depending on complexity.
              </Typography>
            </Box>
          )}
          
          {activeStep === 3 && expandedSection === 'Confidentiality' && (
            <Box sx={{ p: 2 }}>
              <Typography paragraph>
                All client information, including but not limited to personal data, financial information, 
                credit reports, and communications, will be kept strictly confidential.
              </Typography>
              <Typography paragraph>
                Company will not share, sell, or disclose client information to third parties without 
                explicit written consent, except as required by law or necessary to provide services.
              </Typography>
              <Typography paragraph>
                Client data is protected using industry-standard security measures including encryption, 
                secure storage, and access controls.
              </Typography>
            </Box>
          )}
          
          {activeStep === 3 && expandedSection === 'Liability' && (
            <Box sx={{ p: 2 }}>
              <Typography paragraph>
                <strong>Limitation of Liability:</strong> Company's total liability shall not exceed 
                the total fees paid by client in the preceding 12 months.
              </Typography>
              <Typography paragraph>
                Company is not liable for:
              </Typography>
              <List>
                <ListItem>
                  <ListItemText primary="Actions or inactions of credit bureaus, creditors, or collection agencies" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Changes in credit scores due to factors outside our control" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Consequences of client providing false or incomplete information" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Indirect, incidental, or consequential damages" />
                </ListItem>
              </List>
            </Box>
          )}
          
          {activeStep === 3 && expandedSection === 'Legal Provisions' && (
            <Box sx={{ p: 2 }}>
              <Typography paragraph>
                <strong>Governing Law:</strong> This agreement shall be governed by the laws of 
                the State of California.
              </Typography>
              <Typography paragraph>
                <strong>Arbitration:</strong> Any disputes arising from this agreement shall be 
                resolved through binding arbitration under AAA rules.
              </Typography>
              <Typography paragraph>
                <strong>Severability:</strong> If any provision is found unenforceable, the 
                remaining provisions shall continue in full force.
              </Typography>
              <Typography paragraph>
                <strong>Entire Agreement:</strong> This constitutes the entire agreement between 
                parties and supersedes all prior agreements.
              </Typography>
              <Typography paragraph>
                <strong>Amendments:</strong> Any modifications must be in writing and signed by 
                both parties.
              </Typography>
            </Box>
          )}
          
          {/* Terms Acceptance Checkboxes */}
          {activeStep === 3 && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Accept Terms
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Stack spacing={2}>
                <Controller
                  name="acceptServiceTerms"
                  control={control}
                  rules={{ required: 'You must accept the service terms' }}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Checkbox {...field} checked={field.value} />}
                      label="I accept the Service Terms"
                      sx={{ 
                        border: validationErrors.acceptServiceTerms ? '1px solid red' : 'none',
                        p: 1,
                        borderRadius: 1
                      }}
                    />
                  )}
                />
                
                <Controller
                  name="acceptPrivacyPolicy"
                  control={control}
                  rules={{ required: 'You must accept the privacy policy' }}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Checkbox {...field} checked={field.value} />}
                      label="I accept the Privacy Policy"
                      sx={{ 
                        border: validationErrors.acceptPrivacyPolicy ? '1px solid red' : 'none',
                        p: 1,
                        borderRadius: 1
                      }}
                    />
                  )}
                />
                
                <Controller
                  name="acceptBillingTerms"
                  control={control}
                  rules={{ required: 'You must accept the billing terms' }}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Checkbox {...field} checked={field.value} />}
                      label="I accept the Billing Terms"
                      sx={{ 
                        border: validationErrors.acceptBillingTerms ? '1px solid red' : 'none',
                        p: 1,
                        borderRadius: 1
                      }}
                    />
                  )}
                />
                
                <Controller
                  name="acceptDisputeProcess"
                  control={control}
                  rules={{ required: 'You must accept the dispute process' }}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Checkbox {...field} checked={field.value} />}
                      label="I understand the Dispute Process"
                      sx={{ 
                        border: validationErrors.acceptDisputeProcess ? '1px solid red' : 'none',
                        p: 1,
                        borderRadius: 1
                      }}
                    />
                  )}
                />
                
                <Controller
                  name="acceptLiability"
                  control={control}
                  rules={{ required: 'You must accept the liability terms' }}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Checkbox {...field} checked={field.value} />}
                      label="I accept the Liability Terms"
                      sx={{ 
                        border: validationErrors.acceptLiability ? '1px solid red' : 'none',
                        p: 1,
                        borderRadius: 1
                      }}
                    />
                  )}
                />
                
                <Divider />
                
                <Controller
                  name="acceptAll"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Checkbox 
                          {...field} 
                          checked={field.value}
                          color="primary"
                        />
                      }
                      label={
                        <Typography fontWeight="bold">
                          I accept all terms and conditions
                        </Typography>
                      }
                      sx={{ bgcolor: 'action.hover', p: 1, borderRadius: 1 }}
                    />
                  )}
                />
              </Stack>
            </Box>
          )}
          
          {/* Step 4: Signatures */}
          {activeStep === 4 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Electronic Signatures
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Alert severity="info" sx={{ mb: 3 }}>
                <AlertTitle>Legal Electronic Signature</AlertTitle>
                By signing below, you acknowledge that you have read, understood, and agree to be 
                bound by all terms and conditions of this agreement. Electronic signatures are 
                legally binding under the ESIGN Act.
              </Alert>
              
              {/* Client Signature */}
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Client Signature
                </Typography>
                
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  {signatures.client ? (
                    <Box sx={{ border: '1px solid', borderColor: 'divider', p: 2, borderRadius: 1 }}>
                      <img 
                        src={signatures.client.signature} 
                        alt="Client Signature" 
                        style={{ maxHeight: 60 }}
                      />
                      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                        Signed on: {format(new Date(signatures.client.timestamp), 'MMM dd, yyyy hh:mm a')}
                      </Typography>
                      <Typography variant="caption" display="block">
                        IP: {signatures.client.ipAddress}
                      </Typography>
                    </Box>
                  ) : (
                    <Button
                      variant="outlined"
                      size="large"
                      startIcon={<Edit />}
                      onClick={() => openSignatureDialog('client')}
                      sx={{ minHeight: 80, minWidth: 200 }}
                    >
                      Click to Sign
                    </Button>
                  )}
                  
                  {signatures.client && (
                    <IconButton onClick={() => {
                      setSignatures(prev => ({ ...prev, client: null }));
                      setValue('clientSignature', '');
                    }}>
                      <Clear />
                    </IconButton>
                  )}
                </Box>
                
                <TextField
                  fullWidth
                  label="Print Name"
                  value={watch('clientName')}
                  disabled
                  sx={{ mb: 2 }}
                />
                
                <TextField
                  fullWidth
                  label="Date"
                  value={signatures.client ? format(new Date(signatures.client.timestamp), 'MM/dd/yyyy') : ''}
                  disabled
                />
              </Paper>
              
              {/* Co-signer Signature (if required) */}
              {requireCosigner && (
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Co-signer Signature
                  </Typography>
                  
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    {signatures.cosigner ? (
                      <Box sx={{ border: '1px solid', borderColor: 'divider', p: 2, borderRadius: 1 }}>
                        <img 
                          src={signatures.cosigner.signature} 
                          alt="Co-signer Signature" 
                          style={{ maxHeight: 60 }}
                        />
                        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                          Signed on: {format(new Date(signatures.cosigner.timestamp), 'MMM dd, yyyy hh:mm a')}
                        </Typography>
                        <Typography variant="caption" display="block">
                          IP: {signatures.cosigner.ipAddress}
                        </Typography>
                      </Box>
                    ) : (
                      <Button
                        variant="outlined"
                        size="large"
                        startIcon={<Edit />}
                        onClick={() => openSignatureDialog('cosigner')}
                        sx={{ minHeight: 80, minWidth: 200 }}
                      >
                        Click to Sign
                      </Button>
                    )}
                    
                    {signatures.cosigner && (
                      <IconButton onClick={() => {
                        setSignatures(prev => ({ ...prev, cosigner: null }));
                        setValue('cosignerSignature', '');
                      }}>
                        <Clear />
                      </IconButton>
                    )}
                  </Box>
                  
                  <TextField
                    fullWidth
                    label="Print Name"
                    value={watch('cosignerName')}
                    disabled
                    sx={{ mb: 2 }}
                  />
                  
                  <TextField
                    fullWidth
                    label="Date"
                    value={signatures.cosigner ? format(new Date(signatures.cosigner.timestamp), 'MM/dd/yyyy') : ''}
                    disabled
                  />
                </Paper>
              )}
              
              {/* Company Representative Signature */}
              <Paper sx={{ p: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Company Representative
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="companyRepName"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Representative Name"
                          defaultValue={user?.displayName || ''}
                        />
                      )}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="companyRepTitle"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Title"
                          defaultValue="Credit Repair Specialist"
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Paper>
              
              {/* Verification QR Code */}
              {qrCode && (
                <Box textAlign="center" mt={3}>
                  <Typography variant="subtitle2" gutterBottom>
                    Agreement Verification Code
                  </Typography>
                  <img src={qrCode} alt="Verification QR Code" />
                  <Typography variant="caption" display="block">
                    Scan to verify authenticity
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </CardContent>
        
        {/* Navigation Buttons */}
        <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            startIcon={<NavigateBefore />}
          >
            Previous
          </Button>
          
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              onClick={saveProgress}
              disabled={saving}
              startIcon={saving ? <CircularProgress size={20} /> : <Save />}
            >
              Save Progress
            </Button>
            
            {activeStep < steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={<NavigateNext />}
              >
                Next
              </Button>
            ) : (
              <Button
                variant="contained"
                color="success"
                onClick={executeAgreement}
                disabled={loading || !validateStep(4)}
                startIcon={loading ? <CircularProgress size={20} /> : <CheckCircle />}
              >
                Execute Agreement
              </Button>
            )}
          </Box>
        </CardActions>
      </Card>
      
      {/* History Timeline (for existing agreements) */}
      {agreementHistory.length > 0 && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Agreement History
            </Typography>
            <Timeline>
              {agreementHistory.map((event, index) => (
                <TimelineItem key={event.id}>
                  <TimelineOppositeContent color="text.secondary">
                    {format(event.timestamp.toDate(), 'MMM dd, yyyy hh:mm a')}
                  </TimelineOppositeContent>
                  <TimelineSeparator>
                    <TimelineDot color={
                      event.action === 'executed' ? 'success' :
                      event.action === 'cancelled' ? 'error' :
                      'primary'
                    }>
                      {event.action === 'executed' ? <CheckCircle /> :
                       event.action === 'cancelled' ? <Cancel /> :
                       event.action === 'renewed' ? <Autorenew /> :
                       <Update />}
                    </TimelineDot>
                    {index < agreementHistory.length - 1 && <TimelineConnector />}
                  </TimelineSeparator>
                  <TimelineContent>
                    <Typography variant="subtitle2">
                      {event.action.replace('_', ' ').toUpperCase()}
                    </Typography>
                    {event.details && (
                      <Typography variant="body2" color="text.secondary">
                        {JSON.stringify(event.details)}
                      </Typography>
                    )}
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          </CardContent>
        </Card>
      )}
      
      {/* Signature Dialog */}
      <Dialog
        open={signatureDialogOpen}
        onClose={() => setSignatureDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Electronic Signature
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Please sign in the box below using your mouse or touch screen
          </Alert>
          
          <Paper 
            sx={{ 
              border: '2px dashed', 
              borderColor: 'divider',
              borderRadius: 1,
              overflow: 'hidden'
            }}
          >
            <SignatureCanvas
              ref={signaturePadRef}
              penColor="black"
              canvasProps={{
                width: 500,
                height: 200,
                className: 'signature-canvas',
                style: { width: '100%', height: '200px' }
              }}
            />
          </Paper>
          
          <Box display="flex" justifyContent="space-between" mt={2}>
            <Button
              onClick={handleSignatureClear}
              startIcon={<Clear />}
            >
              Clear
            </Button>
            <Typography variant="caption" color="text.secondary">
              Sign above
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSignatureDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSignatureSave}
            variant="contained"
            startIcon={<Check />}
          >
            Accept Signature
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Preview Dialog */}
      <Dialog
        open={showPreview}
        onClose={() => setShowPreview(false)}
        fullScreen
      >
        <AppBar position="relative">
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => setShowPreview(false)}
            >
              <Close />
            </IconButton>
            <Typography variant="h6" sx={{ ml: 2, flex: 1 }}>
              Agreement Preview
            </Typography>
            <Button color="inherit" onClick={generatePDF}>
              Download PDF
            </Button>
          </Toolbar>
        </AppBar>
        
        <Container sx={{ mt: 3, mb: 3 }} ref={printRef}>
          {/* Agreement Header */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box textAlign="center">
              <Typography variant="h4" gutterBottom>
                CREDIT REPAIR SERVICE AGREEMENT
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Agreement Number: {watch('agreementNumber')}
              </Typography>
              <Typography variant="body1">
                Date: {format(new Date(), 'MMMM dd, yyyy')}
              </Typography>
            </Box>
          </Paper>
          
          {/* Parties */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              PARTIES
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle2" gutterBottom>
                  SERVICE PROVIDER:
                </Typography>
                <Typography>
                  Speedy Credit Repair LLC<br />
                  123 Main Street<br />
                  Los Angeles, CA 90001<br />
                  Phone: (555) 123-4567<br />
                  Email: support@speedycreditrepair.com
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="subtitle2" gutterBottom>
                  CLIENT:
                </Typography>
                <Typography>
                  {watch('clientName')}<br />
                  {watch('clientAddress')}<br />
                  {watch('clientCity')}, {watch('clientState')} {watch('clientZip')}<br />
                  Phone: {watch('clientPhone')}<br />
                  Email: {watch('clientEmail')}
                </Typography>
              </Grid>
            </Grid>
            
            {requireCosigner && watch('cosignerName') && (
              <>
                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                  CO-SIGNER:
                </Typography>
                <Typography>
                  {watch('cosignerName')}<br />
                  Relationship: {watch('cosignerRelation')}<br />
                  Phone: {watch('cosignerPhone')}<br />
                  Email: {watch('cosignerEmail')}
                </Typography>
              </>
            )}
          </Paper>
          
          {/* Services */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              SERVICES
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Typography variant="subtitle1" gutterBottom>
              Package: {SERVICE_PACKAGES[watch('packageType')].name}
            </Typography>
            
            <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
              Included Services:
            </Typography>
            <List>
              {SERVICE_PACKAGES[watch('packageType')].features.map((feature, idx) => (
                <ListItem key={idx}>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText primary={feature} />
                </ListItem>
              ))}
            </List>
            
            {(watch('addCreditMonitoring') || watch('addIdentityProtection') || 
              watch('addFinancialCounseling') || watch('addLegalConsultation') || 
              watch('addRushService')) && (
              <>
                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                  Additional Services:
                </Typography>
                <List>
                  {watch('addCreditMonitoring') && (
                    <ListItem>
                      <ListItemIcon><CheckCircle color="primary" /></ListItemIcon>
                      <ListItemText primary="Credit Monitoring (+$19.99/mo)" />
                    </ListItem>
                  )}
                  {watch('addIdentityProtection') && (
                    <ListItem>
                      <ListItemIcon><CheckCircle color="primary" /></ListItemIcon>
                      <ListItemText primary="Identity Protection (+$14.99/mo)" />
                    </ListItem>
                  )}
                  {watch('addFinancialCounseling') && (
                    <ListItem>
                      <ListItemIcon><CheckCircle color="primary" /></ListItemIcon>
                      <ListItemText primary="Financial Counseling (+$49.99/mo)" />
                    </ListItem>
                  )}
                  {watch('addLegalConsultation') && (
                    <ListItem>
                      <ListItemIcon><CheckCircle color="primary" /></ListItemIcon>
                      <ListItemText primary="Legal Consultation (+$99.99/mo)" />
                    </ListItem>
                  )}
                  {watch('addRushService') && (
                    <ListItem>
                      <ListItemIcon><CheckCircle color="primary" /></ListItemIcon>
                      <ListItemText primary="Rush Service (+$29.99/mo)" />
                    </ListItem>
                  )}
                </List>
              </>
            )}
          </Paper>
          
          {/* Pricing */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              PRICING & PAYMENT TERMS
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell>Monthly Service Fee</TableCell>
                  <TableCell align="right">
                    ${calculatePricing.monthly.toFixed(2)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Add-on Services</TableCell>
                  <TableCell align="right">
                    ${calculatePricing.addOns.toFixed(2)}/mo
                  </TableCell>
                </TableRow>
                {calculatePricing.discount > 0 && (
                  <TableRow>
                    <TableCell>Discount</TableCell>
                    <TableCell align="right">
                      -${calculatePricing.discount.toFixed(2)}
                    </TableCell>
                  </TableRow>
                )}
                <TableRow>
                  <TableCell>
                    <strong>Total Monthly</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>${calculatePricing.monthlyTotal.toFixed(2)}</strong>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Setup Fee (one-time)</TableCell>
                  <TableCell align="right">
                    ${calculatePricing.setup}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Billing Cycle</TableCell>
                  <TableCell align="right">
                    {watch('billingCycle')}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Typography variant="h6">Due Today</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="h6" color="primary">
                      ${calculatePricing.firstPayment.toFixed(2)}
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
            
            <Typography variant="body2" sx={{ mt: 2 }}>
              Payment Method: {PAYMENT_METHODS.find(m => m.id === watch('paymentMethod'))?.label}<br />
              Payment Due Date: {watch('paymentDueDate')}th of each month<br />
              AutoPay: {watch('autopayEnabled') ? 'Enabled' : 'Disabled'}
            </Typography>
          </Paper>
          
          {/* Terms */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              TERMS & CONDITIONS
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Typography variant="body2" paragraph>
              Service Start Date: {watch('startDate')}<br />
              Auto-Renewal: {watch('autoRenew') ? 'Yes' : 'No'}<br />
              {watch('autoRenew') && `Renewal Term: ${watch('renewalTerm')} months`}
            </Typography>
            
            <Typography variant="body2" paragraph>
              This agreement contains the complete terms and conditions governing the 
              credit repair services to be provided. By signing below, both parties 
              acknowledge they have read, understood, and agree to be bound by all terms 
              herein.
            </Typography>
          </Paper>
          
          {/* Signatures */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              SIGNATURES
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={4}>
              <Grid item xs={6}>
                <Box>
                  {signatures.client && (
                    <img 
                      src={signatures.client.signature} 
                      alt="Client Signature" 
                      style={{ maxHeight: 60, marginBottom: 8 }}
                    />
                  )}
                  <Typography variant="body2">
                    _________________________________<br />
                    {watch('clientName')}<br />
                    Client<br />
                    Date: {signatures.client ? 
                      format(new Date(signatures.client.timestamp), 'MM/dd/yyyy') : 
                      '_____________'}
                  </Typography>
                </Box>
              </Grid>
              
              {requireCosigner && (
                <Grid item xs={6}>
                  <Box>
                    {signatures.cosigner && (
                      <img 
                        src={signatures.cosigner.signature} 
                        alt="Co-signer Signature" 
                        style={{ maxHeight: 60, marginBottom: 8 }}
                      />
                    )}
                    <Typography variant="body2">
                      _________________________________<br />
                      {watch('cosignerName')}<br />
                      Co-signer<br />
                      Date: {signatures.cosigner ? 
                        format(new Date(signatures.cosigner.timestamp), 'MM/dd/yyyy') : 
                        '_____________'}
                    </Typography>
                  </Box>
                </Grid>
              )}
              
              <Grid item xs={6}>
                <Box>
                  <Typography variant="body2">
                    _________________________________<br />
                    {watch('companyRepName') || 'Authorized Representative'}<br />
                    {watch('companyRepTitle') || 'Speedy Credit Repair LLC'}<br />
                    Date: {format(new Date(), 'MM/dd/yyyy')}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            
            {qrCode && (
              <Box textAlign="center" mt={3}>
                <img src={qrCode} alt="Verification QR" style={{ width: 100 }} />
                <Typography variant="caption" display="block">
                  Agreement Verification Code
                </Typography>
              </Box>
            )}
          </Paper>
        </Container>
      </Dialog>
      
      {/* Payment Processing Dialog */}
      <Dialog
        open={showPaymentDialog}
        onClose={() => !processingPayment && setShowPaymentDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Process Payment
        </DialogTitle>
        <DialogContent>
          {processingPayment ? (
            <Box textAlign="center" py={4}>
              <CircularProgress size={60} />
              <Typography variant="h6" sx={{ mt: 2 }}>
                Processing Payment...
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Please wait while we securely process your payment
              </Typography>
            </Box>
          ) : paymentStatus === 'success' ? (
            <Box textAlign="center" py={4}>
              <CheckCircle color="success" sx={{ fontSize: 60 }} />
              <Typography variant="h6" sx={{ mt: 2 }}>
                Payment Successful!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your agreement has been executed successfully
              </Typography>
            </Box>
          ) : paymentStatus === 'failed' ? (
            <Box textAlign="center" py={4}>
              <Cancel color="error" sx={{ fontSize: 60 }} />
              <Typography variant="h6" sx={{ mt: 2 }}>
                Payment Failed
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Please check your payment information and try again
              </Typography>
            </Box>
          ) : (
            <>
              <Alert severity="info" sx={{ mb: 2 }}>
                <AlertTitle>Secure Payment Processing</AlertTitle>
                Amount to charge: ${calculatePricing.firstPayment.toFixed(2)}
              </Alert>
              
              <Typography variant="body2" paragraph>
                By confirming, you authorize us to charge the payment method on file.
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          {!processingPayment && paymentStatus !== 'success' && (
            <>
              <Button onClick={() => setShowPaymentDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={processPayment}
                variant="contained"
                color="primary"
                disabled={paymentStatus === 'failed'}
              >
                {paymentStatus === 'failed' ? 'Retry Payment' : 'Confirm Payment'}
              </Button>
            </>
          )}
          {paymentStatus === 'success' && (
            <Button onClick={() => {
              setShowPaymentDialog(false);
              if (onComplete) onComplete({ agreementId, status: 'executed' });
            }}>
              Close
            </Button>
          )}
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for auto-save */}
      <Snackbar
        open={saving}
        autoHideDuration={2000}
        message="Saving progress..."
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      />
    </Box>
  );
};

export default FullAgreement;