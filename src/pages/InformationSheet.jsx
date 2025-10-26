// InformationSheet.jsx - Complete Enterprise Client Information Collection
// Full-featured client intake form with advanced validation, document upload, and credit analysis

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  AccordionActions,
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
  SpeedDial,
  SpeedDialIcon,
  SpeedDialAction,
  ToggleButton,
  ToggleButtonGroup,
  InputAdornment,
  Menu,
  Autocomplete,
  Breadcrumbs,
  Link,
  Backdrop,
  Skeleton,
  Fade,
  Zoom,
  Collapse,
  Stack,
  Rating,
  Tooltip,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Drawer,
  AppBar,
  Toolbar,
  Container,
  Snackbar
} from '@mui/material';
import {
  Assignment,
  AssignmentTurnedIn,
  Person,
  Phone,
  Email,
  Home,
  Work,
  AttachMoney,
  CreditCard,
  AccountBalance,
  TrendingUp,
  TrendingDown,
  Assessment,
  Timeline,
  Business,
  DirectionsCar,
  School,
  LocalHospital,
  Gavel,
  MoneyOff,
  CheckCircle,
  Cancel,
  Warning,
  Info,
  Schedule,
  Timer,
  Save,
  Send,
  Print,
  Download,
  Upload,
  CloudUpload,
  Delete,
  Edit,
  Add,
  Remove,
  ExpandMore,
  ExpandLess,
  NavigateNext,
  NavigateBefore,
  MoreVert,
  Settings,
  Help,
  Lock,
  LockOpen,
  Visibility,
  VisibilityOff,
  VerifiedUser,
  Security,
  Flag,
  Star,
  StarBorder,
  FolderOpen,
  Description,
  AttachFile,
  PhotoCamera,
  Mic,
  Videocam,
  Calculate,
  Analytics,
  PieChart,
  BarChart,
  ShowChart,
  DateRange,
  CalendarToday,
  AccessTime,
  History,
  Refresh,
  Sync,
  SyncDisabled,
  CloudDone,
  CloudOff,
  WifiOff,
  SignalWifiOff,
  Battery20,
  BatteryFull,
  Speed,
  HighQuality,
  CheckCircleOutline,
  ErrorOutline,
  ReportProblem,
  NewReleases,
  Announcement,
  Campaign,
  Celebration,
  EmojiEvents,
  ThumbUp,
  ThumbDown,
  SentimentVerySatisfied,
  SentimentVeryDissatisfied,
  Psychology,
  AutoAwesome,
  AutoGraph,
  TipsAndUpdates,
  Lightbulb,
  Policy,
  FactCheck,
  TaskAlt,
  Rule,
  Balance,
  Receipt,
  RequestQuote,
  CreditScore,
  AccountBalanceWallet,
  Savings,
  Payment,
  ShoppingCart,
  Store,
  Storefront,
  LocalAtm,
  CurrencyExchange,
  ManageAccounts,
  Badge as BadgeIcon,
  VerifiedUserOutlined,
  AdminPanelSettings,
  SupervisorAccount,
  GroupAdd,
  PersonAdd,
  PersonRemove,
  Block,
  ReportOff,
  PrivacyTip,
  HealthAndSafety,
  Coronavirus,
  MedicalServices,
  Medication,
  Vaccines,
  Healing,
  Spa,
  SelfImprovement,
  FitnessCenter,
  SportsMartialArts,
  DirectionsRun,
  DirectionsBike,
  Pool,
  Surfing,
  Snowboarding,
  Skateboarding,
  IceSkating,
  Sledding,
  Paragliding,
  
} from '@mui/icons-material';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { doc, setDoc, getDoc, updateDoc, deleteDoc, collection, query, where, orderBy, limit, getDocs, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { format, formatDistanceToNow, parseISO, isBefore, isAfter, addMonths, differenceInMonths, differenceInYears } from 'date-fns';

// Section definitions with icons and descriptions
const INFO_SECTIONS = {
  personal: {
    label: 'Personal Information',
    icon: <Person />,
    description: 'Basic personal details and identification'
  },
  contact: {
    label: 'Contact Information',
    icon: <Phone />,
    description: 'Phone, email, and preferred contact methods'
  },
  address: {
    label: 'Address History',
    icon: <Home />,
    description: 'Current and previous addresses'
  },
  employment: {
    label: 'Employment Information',
    icon: <Work />,
    description: 'Current and previous employment details'
  },
  income: {
    label: 'Income & Expenses',
    icon: <AttachMoney />,
    description: 'Monthly income sources and expenses'
  },
  credit: {
    label: 'Credit Accounts',
    icon: <CreditCard />,
    description: 'Current credit accounts and debts'
  },
  goals: {
    label: 'Credit Goals',
    icon: <TrendingUp />,
    description: 'What you want to achieve with credit repair'
  },
  documents: {
    label: 'Documents',
    icon: <FolderOpen />,
    description: 'Upload supporting documents'
  },
  consent: {
    label: 'Consent & Authorization',
    icon: <VerifiedUser />,
    description: 'Legal agreements and permissions'
  }
};

// Credit account types
const ACCOUNT_TYPES = [
  'Credit Card',
  'Personal Loan',
  'Auto Loan',
  'Mortgage',
  'Student Loan',
  'Medical Debt',
  'Collections',
  'Charge-off',
  'Bankruptcy',
  'Tax Lien',
  'Judgment',
  'Other'
];

// Income sources
const INCOME_SOURCES = [
  'Employment',
  'Self-Employment',
  'Business Income',
  'Rental Income',
  'Investment Income',
  'Social Security',
  'Pension',
  'Disability',
  'Alimony',
  'Child Support',
  'Other'
];

// Goals categories
const GOAL_CATEGORIES = {
  score: { label: 'Credit Score Improvement', icon: <TrendingUp />, color: '#4ECDC4' },
  mortgage: { label: 'Home Purchase', icon: <Home />, color: '#95E77E' },
  auto: { label: 'Auto Financing', icon: <DirectionsCar />, color: '#FFE66D' },
  business: { label: 'Business Credit', icon: <Business />, color: '#FF6B6B' },
  cards: { label: 'Credit Cards', icon: <CreditCard />, color: '#A8E6CF' },
  debt: { label: 'Debt Reduction', icon: <MoneyOff />, color: '#C7CEEA' }
};

const InformationSheet = ({ 
  clientId = null,
  mode = 'create', // 'create', 'edit', 'view'
  onComplete,
  autoSave = true
}) => {
  const { user } = useAuth();
  const { showSuccess, showError, showInfo } = useNotification();
  
  // React Hook Form setup
  const { control, handleSubmit, watch, setValue, getValues, formState: { errors, isDirty } } = useForm({
    defaultValues: {
      // Personal Information
      firstName: '',
      middleName: '',
      lastName: '',
      suffix: '',
      dateOfBirth: '',
      ssn: '',
      driverLicense: '',
      dlState: '',
      
      // Contact Information
      primaryPhone: '',
      secondaryPhone: '',
      primaryEmail: '',
      secondaryEmail: '',
      preferredContact: 'email',
      bestTimeToCall: 'morning',
      
      // Current Address
      currentAddress: '',
      currentCity: '',
      currentState: '',
      currentZip: '',
      currentResidenceType: 'rent',
      currentMonthlyPayment: '',
      currentMoveInDate: '',
      
      // Previous Address
      previousAddress: '',
      previousCity: '',
      previousState: '',
      previousZip: '',
      previousMoveInDate: '',
      previousMoveOutDate: '',
      
      // Employment
      employerName: '',
      employerPhone: '',
      employerAddress: '',
      jobTitle: '',
      employmentStartDate: '',
      monthlyIncome: '',
      employmentType: 'full-time',
      
      // Previous Employment
      previousEmployerName: '',
      previousJobTitle: '',
      previousEmploymentDates: '',
      
      // Income Sources
      incomeSources: [],
      monthlyExpenses: {
        rent: 0,
        utilities: 0,
        insurance: 0,
        carPayment: 0,
        creditCards: 0,
        loans: 0,
        other: 0
      },
      
      // Credit Goals
      creditGoals: [],
      targetScore: '',
      targetDate: '',
      specificGoals: '',
      
      // Authorization
      agreeToTerms: false,
      authorizeCredit: false,
      authorizeDisputes: false,
      electronicSignature: '',
      signatureDate: new Date().toISOString().split('T')[0]
    }
  });
  
  // Field arrays for dynamic sections
  const { fields: creditAccounts, append: appendAccount, remove: removeAccount } = useFieldArray({
    control,
    name: 'creditAccounts'
  });
  
  const { fields: incomeSources, append: appendIncome, remove: removeIncome } = useFieldArray({
    control,
    name: 'incomeSources'
  });
  
  // State management
  const [activeSection, setActiveSection] = useState('personal');
  const [completedSections, setCompletedSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(autoSave);
  const [lastSaved, setLastSaved] = useState(null);
  const [creditScore, setCreditScore] = useState(null);
  const [debtToIncomeRatio, setDebtToIncomeRatio] = useState(null);
  const [monthlyDisposableIncome, setMonthlyDisposableIncome] = useState(null);
  
  // Refs
  const autoSaveTimer = useRef(null);
  const fileInputRef = useRef(null);
  
  // Load existing data if editing
  useEffect(() => {
    if (mode !== 'create' && clientId) {
      loadClientData();
    }
  }, [clientId, mode]);
  
  // Auto-save functionality
  useEffect(() => {
    if (autoSaveEnabled && isDirty && mode !== 'view') {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
      
      autoSaveTimer.current = setTimeout(() => {
        saveProgress();
      }, 3000); // Save after 3 seconds of inactivity
    }
    
    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, [watch(), autoSaveEnabled, isDirty]);
  
  // Calculate financial metrics
  const calculatedData = useMemo(() => {
    const formData = getValues();
    const totalIncome = parseFloat(formData.monthlyIncome || 0) + 
      (incomeSources?.reduce((sum, source) => sum + parseFloat(source.amount || 0), 0) || 0);
    
    const totalExpenses = Object.values(formData.monthlyExpenses || {})
      .reduce((sum, expense) => sum + parseFloat(expense || 0), 0);
    
    const totalDebt = creditAccounts?.reduce((sum, account) => {
      if (account.type === 'Mortgage' || account.type === 'Auto Loan') {
        return sum + parseFloat(account.balance || 0);
      }
      return sum + parseFloat(account.balance || 0);
    }, 0) || 0;
    
    const monthlyDebtPayments = creditAccounts?.reduce((sum, account) => 
      sum + parseFloat(account.monthlyPayment || 0), 0) || 0;
    
    const dti = totalIncome > 0 ? ((monthlyDebtPayments / totalIncome) * 100).toFixed(2) : 0;
    const disposable = totalIncome - totalExpenses;
    
    return {
      totalIncome,
      totalExpenses,
      totalDebt,
      monthlyDebtPayments,
      debtToIncomeRatio: dti,
      monthlyDisposableIncome: disposable,
      utilizationRate: calculateUtilizationRate()
    };
  }, [watch(), creditAccounts, incomeSources]);
  
  const calculateUtilizationRate = () => {
    const creditCards = creditAccounts?.filter(acc => acc.type === 'Credit Card') || [];
    if (creditCards.length === 0) return 0;
    
    const totalLimit = creditCards.reduce((sum, card) => sum + parseFloat(card.limit || 0), 0);
    const totalBalance = creditCards.reduce((sum, card) => sum + parseFloat(card.balance || 0), 0);
    
    return totalLimit > 0 ? ((totalBalance / totalLimit) * 100).toFixed(2) : 0;
  };
  
  const loadClientData = async () => {
    try {
      setLoading(true);
      const docRef = doc(db, 'clients', clientId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        Object.keys(data).forEach(key => {
          setValue(key, data[key]);
        });
        
        // Load documents
        if (data.documents) {
          setDocuments(data.documents);
        }
        
        // Set completed sections
        setCompletedSections(data.completedSections || []);
        
        showSuccess('Client information loaded');
      }
    } catch (error) {
      console.error('Error loading client data:', error);
      showError('Failed to load client information');
    } finally {
      setLoading(false);
    }
  };
  
  const saveProgress = async () => {
    try {
      setSaving(true);
      const formData = getValues();
      
      const dataToSave = {
        ...formData,
        creditAccounts,
        incomeSources,
        documents,
        completedSections,
        lastUpdated: serverTimestamp(),
        updatedBy: user.uid,
        calculatedMetrics: calculatedData
      };
      
      if (clientId) {
        await updateDoc(doc(db, 'clients', clientId), dataToSave);
      } else {
        // Create temporary draft
        await setDoc(doc(db, 'drafts', `${user.uid}_information_sheet`), dataToSave);
      }
      
      setLastSaved(new Date());
      showInfo('Progress saved');
    } catch (error) {
      console.error('Error saving progress:', error);
      showError('Failed to save progress');
    } finally {
      setSaving(false);
    }
  };
  
  const validateSection = (sectionName) => {
    const errors = {};
    const data = getValues();
    
    switch (sectionName) {
      case 'personal':
        if (!data.firstName) errors.firstName = 'First name is required';
        if (!data.lastName) errors.lastName = 'Last name is required';
        if (!data.dateOfBirth) errors.dateOfBirth = 'Date of birth is required';
        if (!data.ssn || data.ssn.length !== 11) errors.ssn = 'Valid SSN is required';
        break;
      
      case 'contact':
        if (!data.primaryPhone) errors.primaryPhone = 'Primary phone is required';
        if (!data.primaryEmail) errors.primaryEmail = 'Primary email is required';
        if (data.primaryEmail && !isValidEmail(data.primaryEmail)) {
          errors.primaryEmail = 'Valid email is required';
        }
        break;
      
      case 'address':
        if (!data.currentAddress) errors.currentAddress = 'Current address is required';
        if (!data.currentCity) errors.currentCity = 'City is required';
        if (!data.currentState) errors.currentState = 'State is required';
        if (!data.currentZip) errors.currentZip = 'ZIP code is required';
        break;
      
      case 'employment':
        if (!data.employerName) errors.employerName = 'Employer name is required';
        if (!data.jobTitle) errors.jobTitle = 'Job title is required';
        if (!data.monthlyIncome) errors.monthlyIncome = 'Monthly income is required';
        break;
      
      case 'consent':
        if (!data.agreeToTerms) errors.agreeToTerms = 'You must agree to terms';
        if (!data.authorizeCredit) errors.authorizeCredit = 'Credit authorization required';
        if (!data.electronicSignature) errors.electronicSignature = 'Signature is required';
        break;
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
  
  const handleSectionComplete = (sectionName) => {
    if (validateSection(sectionName)) {
      setCompletedSections(prev => {
        if (!prev.includes(sectionName)) {
          return [...prev, sectionName];
        }
        return prev;
      });
      
      // Move to next section
      const sections = Object.keys(INFO_SECTIONS);
      const currentIndex = sections.indexOf(sectionName);
      if (currentIndex < sections.length - 1) {
        setActiveSection(sections[currentIndex + 1]);
      }
    } else {
      showError('Please complete all required fields');
    }
  };
  
  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    
    for (const file of files) {
      try {
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
        
        // Create storage reference
        const storageRef = ref(storage, `clients/${clientId || 'temp'}/${Date.now()}_${file.name}`);
        
        // Upload file
        const uploadTask = uploadBytes(storageRef, file);
        
        // Monitor progress
        uploadTask.on('state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(prev => ({ ...prev, [file.name]: progress }));
          },
          (error) => {
            console.error('Upload error:', error);
            showError(`Failed to upload ${file.name}`);
          },
          async () => {
            const downloadURL = await getDownloadURL(storageRef);
            
            const newDocument = {
              id: Date.now().toString(),
              name: file.name,
              url: downloadURL,
              type: file.type,
              size: file.size,
              uploadedAt: new Date().toISOString(),
              uploadedBy: user.uid
            };
            
            setDocuments(prev => [...prev, newDocument]);
            showSuccess(`${file.name} uploaded successfully`);
            
            // Clear progress
            setTimeout(() => {
              setUploadProgress(prev => {
                const newProgress = { ...prev };
                delete newProgress[file.name];
                return newProgress;
              });
            }, 2000);
          }
        );
      } catch (error) {
        console.error('Error uploading file:', error);
        showError(`Failed to upload ${file.name}`);
      }
    }
  };
  
  const handleRemoveDocument = async (documentId) => {
    try {
      const document = documents.find(doc => doc.id === documentId);
      if (document?.url) {
        const storageRef = ref(storage, document.url);
        await deleteObject(storageRef);
      }
      
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      showSuccess('Document removed');
    } catch (error) {
      console.error('Error removing document:', error);
      showError('Failed to remove document');
    }
  };
  
  const handleAddCreditAccount = () => {
    appendAccount({
      type: 'Credit Card',
      creditor: '',
      accountNumber: '',
      balance: 0,
      limit: 0,
      monthlyPayment: 0,
      status: 'current',
      dateOpened: '',
      lastPayment: ''
    });
  };
  
  const handleAddIncomeSource = () => {
    appendIncome({
      source: 'Employment',
      description: '',
      amount: 0,
      frequency: 'monthly'
    });
  };
  
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      // Validate all sections
      const allSectionsValid = Object.keys(INFO_SECTIONS).every(section => 
        validateSection(section)
      );
      
      if (!allSectionsValid) {
        showError('Please complete all required sections');
        return;
      }
      
      // Prepare final data
      const finalData = {
        ...data,
        creditAccounts,
        incomeSources,
        documents,
        completedSections: Object.keys(INFO_SECTIONS),
        calculatedMetrics: calculatedData,
        status: 'complete',
        submittedAt: serverTimestamp(),
        submittedBy: user.uid
      };
      
      // Save to Firestore
      let docId = clientId;
      if (!docId) {
        const docRef = await setDoc(collection(db, 'clients'), finalData);
        docId = docRef.id;
      } else {
        await updateDoc(doc(db, 'clients', clientId), finalData);
      }
      
      // Send notification
      await sendCompletionNotification(docId, finalData);
      
      showSuccess('Information sheet submitted successfully!');
      
      if (onComplete) {
        onComplete({ ...finalData, id: docId });
      }
    } catch (error) {
      console.error('Error submitting information:', error);
      showError('Failed to submit information');
    } finally {
      setLoading(false);
    }
  };
  
  const sendCompletionNotification = async (clientId, data) => {
    await setDoc(doc(collection(db, 'notifications')), {
      type: 'information_sheet_complete',
      clientId,
      clientName: `${data.firstName} ${data.lastName}`,
      clientEmail: data.primaryEmail,
      createdAt: serverTimestamp(),
      read: false
    });
  };
  
  const exportData = () => {
    const data = {
      ...getValues(),
      creditAccounts,
      incomeSources,
      calculatedMetrics: calculatedData,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `client_information_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showSuccess('Data exported successfully');
  };
  
  const sections = Object.entries(INFO_SECTIONS);
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }
  
  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                <Assignment />
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  Client Information Sheet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Complete client intake and assessment
                </Typography>
              </Box>
            </Box>
            
            <Box display="flex" gap={2} alignItems="center">
              {saving && (
                <Chip
                  icon={<CircularProgress size={16} />}
                  label="Saving..."
                  color="primary"
                  variant="outlined"
                />
              )}
              <Chip
                icon={<CheckCircle />}
                label={`${completedSections.length}/${sections.length} Complete`}
                color={completedSections.length === sections.length ? 'success' : 'default'}
              />
              <IconButton onClick={() => setShowPreview(true)}>
                <Visibility />
              </IconButton>
              <IconButton onClick={exportData}>
                <Download />
              </IconButton>
            </Box>
          </Box>
          
          {/* Progress Bar */}
          <Box sx={{ mt: 2 }}>
            <LinearProgress 
              variant="determinate" 
              value={(completedSections.length / sections.length) * 100}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
        </CardContent>
      </Card>
      
      {/* Financial Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Monthly Income
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    ${calculatedData.totalIncome.toLocaleString()}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.light' }}>
                  <TrendingUp />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Monthly Expenses
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    ${calculatedData.totalExpenses.toLocaleString()}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'error.light' }}>
                  <TrendingDown />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Debt-to-Income
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {calculatedData.debtToIncomeRatio}%
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.light' }}>
                  <Assessment />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Disposable Income
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    ${calculatedData.monthlyDisposableIncome.toLocaleString()}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.light' }}>
                  <AccountBalanceWallet />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Section Navigation */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Sections
              </Typography>
              <List>
                {sections.map(([key, section]) => (
                  <ListItem
                    key={key}
                    button
                    selected={activeSection === key}
                    onClick={() => setActiveSection(key)}
                    sx={{
                      borderRadius: 1,
                      mb: 1,
                      backgroundColor: completedSections.includes(key) 
                        ? 'success.lighter' 
                        : activeSection === key 
                        ? 'primary.lighter' 
                        : 'transparent'
                    }}
                  >
                    <ListItemIcon>
                      {completedSections.includes(key) ? (
                        <Avatar sx={{ bgcolor: 'success.main', width: 32, height: 32 }}>
                          <CheckCircle sx={{ fontSize: 20 }} />
                        </Avatar>
                      ) : (
                        <Avatar sx={{ 
                          bgcolor: activeSection === key ? 'primary.main' : 'grey.300',
                          width: 32,
                          height: 32
                        }}>
                          {section.icon}
                        </Avatar>
                      )}
                    </ListItemIcon>
                    <ListItemText 
                      primary={section.label}
                      secondary={section.description}
                    />
                  </ListItem>
                ))}
              </List>
              
              {lastSaved && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  <AlertTitle>Auto-Save Active</AlertTitle>
                  Last saved {formatDistanceToNow(lastSaved)} ago
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Form Content */}
        <Grid item xs={12} md={9}>
          <Card>
            <CardContent>
              {/* Personal Information Section */}
              {activeSection === 'personal' && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Personal Information
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={4}>
                      <Controller
                        name="firstName"
                        control={control}
                        rules={{ required: 'First name is required' }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="First Name"
                            error={Boolean(errors.firstName || validationErrors.firstName)}
                            helperText={errors.firstName?.message || validationErrors.firstName}
                            disabled={mode === 'view'}
                          />
                        )}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={4}>
                      <Controller
                        name="middleName"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Middle Name"
                            disabled={mode === 'view'}
                          />
                        )}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={4}>
                      <Controller
                        name="lastName"
                        control={control}
                        rules={{ required: 'Last name is required' }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Last Name"
                            error={Boolean(errors.lastName || validationErrors.lastName)}
                            helperText={errors.lastName?.message || validationErrors.lastName}
                            disabled={mode === 'view'}
                          />
                        )}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="dateOfBirth"
                        control={control}
                        rules={{ required: 'Date of birth is required' }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Date of Birth"
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            error={Boolean(errors.dateOfBirth || validationErrors.dateOfBirth)}
                            helperText={errors.dateOfBirth?.message || validationErrors.dateOfBirth}
                            disabled={mode === 'view'}
                          />
                        )}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="ssn"
                        control={control}
                        rules={{ 
                          required: 'SSN is required',
                          pattern: {
                            value: /^\d{3}-\d{2}-\d{4}$/,
                            message: 'SSN format: XXX-XX-XXXX'
                          }
                        }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Social Security Number"
                            placeholder="XXX-XX-XXXX"
                            error={Boolean(errors.ssn || validationErrors.ssn)}
                            helperText={errors.ssn?.message || validationErrors.ssn}
                            disabled={mode === 'view'}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <Lock />
                                </InputAdornment>
                              )
                            }}
                          />
                        )}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="driverLicense"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Driver's License Number"
                            disabled={mode === 'view'}
                          />
                        )}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="dlState"
                        control={control}
                        render={({ field }) => (
                          <FormControl fullWidth>
                            <InputLabel>DL State</InputLabel>
                            <Select
                              {...field}
                              label="DL State"
                              disabled={mode === 'view'}
                            >
                              <MenuItem value="">Select State</MenuItem>
                              <MenuItem value="CA">California</MenuItem>
                              <MenuItem value="TX">Texas</MenuItem>
                              <MenuItem value="FL">Florida</MenuItem>
                              <MenuItem value="NY">New York</MenuItem>
                              {/* Add more states as needed */}
                            </Select>
                          </FormControl>
                        )}
                      />
                    </Grid>
                  </Grid>
                  
                  <Box display="flex" justifyContent="flex-end" gap={2} sx={{ mt: 3 }}>
                    <Button
                      variant="outlined"
                      onClick={saveProgress}
                      disabled={saving}
                    >
                      Save Progress
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => handleSectionComplete('personal')}
                      endIcon={<NavigateNext />}
                    >
                      Next Section
                    </Button>
                  </Box>
                </Box>
              )}
              
              {/* Contact Information Section */}
              {activeSection === 'contact' && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Contact Information
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="primaryPhone"
                        control={control}
                        rules={{ required: 'Primary phone is required' }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Primary Phone"
                            placeholder="(555) 123-4567"
                            error={Boolean(errors.primaryPhone || validationErrors.primaryPhone)}
                            helperText={errors.primaryPhone?.message || validationErrors.primaryPhone}
                            disabled={mode === 'view'}
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
                        name="secondaryPhone"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Secondary Phone"
                            placeholder="(555) 123-4567"
                            disabled={mode === 'view'}
                          />
                        )}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="primaryEmail"
                        control={control}
                        rules={{ 
                          required: 'Primary email is required',
                          pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: 'Invalid email format'
                          }
                        }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Primary Email"
                            type="email"
                            error={Boolean(errors.primaryEmail || validationErrors.primaryEmail)}
                            helperText={errors.primaryEmail?.message || validationErrors.primaryEmail}
                            disabled={mode === 'view'}
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
                        name="secondaryEmail"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Secondary Email"
                            type="email"
                            disabled={mode === 'view'}
                          />
                        )}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="preferredContact"
                        control={control}
                        render={({ field }) => (
                          <FormControl fullWidth>
                            <InputLabel>Preferred Contact Method</InputLabel>
                            <Select
                              {...field}
                              label="Preferred Contact Method"
                              disabled={mode === 'view'}
                            >
                              <MenuItem value="email">Email</MenuItem>
                              <MenuItem value="phone">Phone</MenuItem>
                              <MenuItem value="text">Text Message</MenuItem>
                              <MenuItem value="mail">Mail</MenuItem>
                            </Select>
                          </FormControl>
                        )}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="bestTimeToCall"
                        control={control}
                        render={({ field }) => (
                          <FormControl fullWidth>
                            <InputLabel>Best Time to Call</InputLabel>
                            <Select
                              {...field}
                              label="Best Time to Call"
                              disabled={mode === 'view'}
                            >
                              <MenuItem value="morning">Morning (9am-12pm)</MenuItem>
                              <MenuItem value="afternoon">Afternoon (12pm-5pm)</MenuItem>
                              <MenuItem value="evening">Evening (5pm-8pm)</MenuItem>
                              <MenuItem value="weekend">Weekend</MenuItem>
                            </Select>
                          </FormControl>
                        )}
                      />
                    </Grid>
                  </Grid>
                  
                  <Box display="flex" justifyContent="space-between" sx={{ mt: 3 }}>
                    <Button
                      variant="outlined"
                      onClick={() => setActiveSection('personal')}
                      startIcon={<NavigateBefore />}
                    >
                      Previous
                    </Button>
                    <Box display="flex" gap={2}>
                      <Button
                        variant="outlined"
                        onClick={saveProgress}
                        disabled={saving}
                      >
                        Save Progress
                      </Button>
                      <Button
                        variant="contained"
                        onClick={() => handleSectionComplete('contact')}
                        endIcon={<NavigateNext />}
                      >
                        Next Section
                      </Button>
                    </Box>
                  </Box>
                </Box>
              )}
              
              {/* Credit Accounts Section */}
              {activeSection === 'credit' && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Credit Accounts
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  
                  <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="body1">
                      List all your credit accounts (credit cards, loans, mortgages, etc.)
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<Add />}
                      onClick={handleAddCreditAccount}
                    >
                      Add Account
                    </Button>
                  </Box>
                  
                  {creditAccounts.map((account, index) => (
                    <Accordion key={account.id} sx={{ mb: 2 }}>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
                          <Typography>
                            {account.creditor || `Account ${index + 1}`} - {account.type}
                          </Typography>
                          <Chip 
                            label={`$${account.balance?.toLocaleString() || 0}`}
                            color={account.status === 'current' ? 'success' : 'error'}
                            size="small"
                          />
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Controller
                              name={`creditAccounts.${index}.type`}
                              control={control}
                              render={({ field }) => (
                                <FormControl fullWidth>
                                  <InputLabel>Account Type</InputLabel>
                                  <Select {...field} label="Account Type">
                                    {ACCOUNT_TYPES.map(type => (
                                      <MenuItem key={type} value={type}>{type}</MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              )}
                            />
                          </Grid>
                          
                          <Grid item xs={12} sm={6}>
                            <Controller
                              name={`creditAccounts.${index}.creditor`}
                              control={control}
                              render={({ field }) => (
                                <TextField
                                  {...field}
                                  fullWidth
                                  label="Creditor Name"
                                />
                              )}
                            />
                          </Grid>
                          
                          <Grid item xs={12} sm={6}>
                            <Controller
                              name={`creditAccounts.${index}.accountNumber`}
                              control={control}
                              render={({ field }) => (
                                <TextField
                                  {...field}
                                  fullWidth
                                  label="Account Number (last 4 digits)"
                                  placeholder="XXXX"
                                />
                              )}
                            />
                          </Grid>
                          
                          <Grid item xs={12} sm={6}>
                            <Controller
                              name={`creditAccounts.${index}.balance`}
                              control={control}
                              render={({ field }) => (
                                <TextField
                                  {...field}
                                  fullWidth
                                  label="Current Balance"
                                  type="number"
                                  InputProps={{
                                    startAdornment: <InputAdornment position="start">$</InputAdornment>
                                  }}
                                />
                              )}
                            />
                          </Grid>
                          
                          <Grid item xs={12} sm={6}>
                            <Controller
                              name={`creditAccounts.${index}.limit`}
                              control={control}
                              render={({ field }) => (
                                <TextField
                                  {...field}
                                  fullWidth
                                  label="Credit Limit (if applicable)"
                                  type="number"
                                  InputProps={{
                                    startAdornment: <InputAdornment position="start">$</InputAdornment>
                                  }}
                                />
                              )}
                            />
                          </Grid>
                          
                          <Grid item xs={12} sm={6}>
                            <Controller
                              name={`creditAccounts.${index}.monthlyPayment`}
                              control={control}
                              render={({ field }) => (
                                <TextField
                                  {...field}
                                  fullWidth
                                  label="Monthly Payment"
                                  type="number"
                                  InputProps={{
                                    startAdornment: <InputAdornment position="start">$</InputAdornment>
                                  }}
                                />
                              )}
                            />
                          </Grid>
                          
                          <Grid item xs={12} sm={6}>
                            <Controller
                              name={`creditAccounts.${index}.status`}
                              control={control}
                              render={({ field }) => (
                                <FormControl fullWidth>
                                  <InputLabel>Account Status</InputLabel>
                                  <Select {...field} label="Account Status">
                                    <MenuItem value="current">Current</MenuItem>
                                    <MenuItem value="late">Late</MenuItem>
                                    <MenuItem value="collections">Collections</MenuItem>
                                    <MenuItem value="chargeoff">Charge-off</MenuItem>
                                    <MenuItem value="paid">Paid Off</MenuItem>
                                  </Select>
                                </FormControl>
                              )}
                            />
                          </Grid>
                          
                          <Grid item xs={12} sm={6}>
                            <Controller
                              name={`creditAccounts.${index}.dateOpened`}
                              control={control}
                              render={({ field }) => (
                                <TextField
                                  {...field}
                                  fullWidth
                                  label="Date Opened"
                                  type="date"
                                  InputLabelProps={{ shrink: true }}
                                />
                              )}
                            />
                          </Grid>
                        </Grid>
                      </AccordionDetails>
                      <AccordionActions>
                        <Button
                          color="error"
                          startIcon={<Delete />}
                          onClick={() => removeAccount(index)}
                        >
                          Remove
                        </Button>
                      </AccordionActions>
                    </Accordion>
                  ))}
                  
                  {/* Credit Summary */}
                  <Paper sx={{ p: 2, mt: 3, bgcolor: 'grey.50' }}>
                    <Typography variant="h6" gutterBottom>
                      Credit Summary
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="text.secondary">
                          Total Debt
                        </Typography>
                        <Typography variant="h6">
                          ${calculatedData.totalDebt.toLocaleString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="text.secondary">
                          Credit Utilization
                        </Typography>
                        <Typography variant="h6">
                          {calculatedData.utilizationRate}%
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="text.secondary">
                          Monthly Payments
                        </Typography>
                        <Typography variant="h6">
                          ${calculatedData.monthlyDebtPayments.toLocaleString()}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                  
                  <Box display="flex" justifyContent="space-between" sx={{ mt: 3 }}>
                    <Button
                      variant="outlined"
                      onClick={() => setActiveSection('income')}
                      startIcon={<NavigateBefore />}
                    >
                      Previous
                    </Button>
                    <Box display="flex" gap={2}>
                      <Button
                        variant="outlined"
                        onClick={saveProgress}
                        disabled={saving}
                      >
                        Save Progress
                      </Button>
                      <Button
                        variant="contained"
                        onClick={() => handleSectionComplete('credit')}
                        endIcon={<NavigateNext />}
                      >
                        Next Section
                      </Button>
                    </Box>
                  </Box>
                </Box>
              )}
              
              {/* Documents Section */}
              {activeSection === 'documents' && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Upload Documents
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  
                  <Alert severity="info" sx={{ mb: 3 }}>
                    <AlertTitle>Required Documents</AlertTitle>
                    Please upload the following documents to help us process your case:
                    <ul>
                      <li>Government-issued ID (Driver's License or Passport)</li>
                      <li>Proof of Income (Pay stubs, W2, or Tax Returns)</li>
                      <li>Recent Credit Reports</li>
                      <li>Any dispute letters or correspondence with creditors</li>
                    </ul>
                  </Alert>
                  
                  {/* Upload Area */}
                  <Paper
                    sx={{
                      p: 3,
                      border: '2px dashed',
                      borderColor: 'primary.main',
                      bgcolor: 'primary.lighter',
                      textAlign: 'center',
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: 'primary.light'
                      }
                    }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Click to upload or drag and drop
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      PDF, JPG, PNG up to 10MB
                    </Typography>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      hidden
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                    />
                  </Paper>
                  
                  {/* Upload Progress */}
                  {Object.keys(uploadProgress).length > 0 && (
                    <Box sx={{ mt: 3 }}>
                      {Object.entries(uploadProgress).map(([fileName, progress]) => (
                        <Box key={fileName} sx={{ mb: 2 }}>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2">{fileName}</Typography>
                            <Typography variant="body2">{Math.round(progress)}%</Typography>
                          </Box>
                          <LinearProgress variant="determinate" value={progress} />
                        </Box>
                      ))}
                    </Box>
                  )}
                  
                  {/* Uploaded Documents List */}
                  {documents.length > 0 && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Uploaded Documents
                      </Typography>
                      <List>
                        {documents.map((doc) => (
                          <ListItem
                            key={doc.id}
                            sx={{
                              border: 1,
                              borderColor: 'divider',
                              borderRadius: 1,
                              mb: 1
                            }}
                          >
                            <ListItemAvatar>
                              <Avatar>
                                <Description />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={doc.name}
                              secondary={`Uploaded ${formatDistanceToNow(new Date(doc.uploadedAt))} ago`}
                            />
                            <ListItemSecondaryAction>
                              <IconButton onClick={() => window.open(doc.url, '_blank')}>
                                <Visibility />
                              </IconButton>
                              <IconButton onClick={() => handleRemoveDocument(doc.id)}>
                                <Delete />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                  
                  <Box display="flex" justifyContent="space-between" sx={{ mt: 3 }}>
                    <Button
                      variant="outlined"
                      onClick={() => setActiveSection('goals')}
                      startIcon={<NavigateBefore />}
                    >
                      Previous
                    </Button>
                    <Box display="flex" gap={2}>
                      <Button
                        variant="outlined"
                        onClick={saveProgress}
                        disabled={saving}
                      >
                        Save Progress
                      </Button>
                      <Button
                        variant="contained"
                        onClick={() => handleSectionComplete('documents')}
                        endIcon={<NavigateNext />}
                      >
                        Next Section
                      </Button>
                    </Box>
                  </Box>
                </Box>
              )}
              
              {/* Consent & Authorization Section */}
              {activeSection === 'consent' && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Consent & Authorization
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  
                  <Alert severity="warning" sx={{ mb: 3 }}>
                    <AlertTitle>Important</AlertTitle>
                    Please read and agree to the following terms and authorizations before submitting your information.
                  </Alert>
                  
                  <Paper sx={{ p: 3, mb: 3, bgcolor: 'grey.50' }}>
                    <Typography variant="h6" gutterBottom>
                      Terms of Service
                    </Typography>
                    <Typography variant="body2" paragraph>
                      By submitting this information sheet, I acknowledge that I am providing accurate
                      information to the best of my knowledge. I understand that false or misleading
                      information may result in termination of services.
                    </Typography>
                    <Controller
                      name="agreeToTerms"
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={<Checkbox {...field} checked={field.value} />}
                          label="I agree to the Terms of Service"
                        />
                      )}
                    />
                  </Paper>
                  
                  <Paper sx={{ p: 3, mb: 3, bgcolor: 'grey.50' }}>
                    <Typography variant="h6" gutterBottom>
                      Credit Report Authorization
                    </Typography>
                    <Typography variant="body2" paragraph>
                      I authorize the company to obtain my credit reports from all three credit bureaus
                      (Experian, Equifax, and TransUnion) for the purpose of credit repair services.
                    </Typography>
                    <Controller
                      name="authorizeCredit"
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={<Checkbox {...field} checked={field.value} />}
                          label="I authorize credit report access"
                        />
                      )}
                    />
                  </Paper>
                  
                  <Paper sx={{ p: 3, mb: 3, bgcolor: 'grey.50' }}>
                    <Typography variant="h6" gutterBottom>
                      Dispute Authorization
                    </Typography>
                    <Typography variant="body2" paragraph>
                      I authorize the company to send dispute letters on my behalf to credit bureaus,
                      creditors, and collection agencies for the purpose of correcting inaccurate information.
                    </Typography>
                    <Controller
                      name="authorizeDisputes"
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={<Checkbox {...field} checked={field.value} />}
                          label="I authorize dispute submissions"
                        />
                      )}
                    />
                  </Paper>
                  
                  <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
                    <Typography variant="h6" gutterBottom>
                      Electronic Signature
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={8}>
                        <Controller
                          name="electronicSignature"
                          control={control}
                          rules={{ required: 'Electronic signature is required' }}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              label="Type your full legal name"
                              placeholder="John Doe"
                              error={Boolean(errors.electronicSignature || validationErrors.electronicSignature)}
                              helperText={errors.electronicSignature?.message || validationErrors.electronicSignature}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Controller
                          name="signatureDate"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              label="Date"
                              type="date"
                              InputLabelProps={{ shrink: true }}
                              disabled
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                  
                  <Box display="flex" justifyContent="space-between" sx={{ mt: 3 }}>
                    <Button
                      variant="outlined"
                      onClick={() => setActiveSection('documents')}
                      startIcon={<NavigateBefore />}
                    >
                      Previous
                    </Button>
                  <Box display="flex" gap={2}>
                      <Button
                        variant="outlined"
                        onClick={saveProgress}
                        disabled={saving}
                      >
                        Save Progress
                      </Button>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={handleSubmit(onSubmit)}
                        disabled={loading || !completedSections.includes('consent')}
                        startIcon={<Send />}
                      >
                        Submit Information Sheet
                      </Button>
                    </Box>
                  </Box>
                </Box>
              )}
              
              {/* Address History Section */}
              {activeSection === 'address' && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Address History
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  
                  <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                    Current Address
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Controller
                        name="currentAddress"
                        control={control}
                        rules={{ required: 'Current address is required' }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Street Address"
                            error={Boolean(errors.currentAddress || validationErrors.currentAddress)}
                            helperText={errors.currentAddress?.message || validationErrors.currentAddress}
                            disabled={mode === 'view'}
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
                    
                    <Grid item xs={12} sm={5}>
                      <Controller
                        name="currentCity"
                        control={control}
                        rules={{ required: 'City is required' }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="City"
                            error={Boolean(errors.currentCity || validationErrors.currentCity)}
                            helperText={errors.currentCity?.message || validationErrors.currentCity}
                            disabled={mode === 'view'}
                          />
                        )}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={3}>
                      <Controller
                        name="currentState"
                        control={control}
                        rules={{ required: 'State is required' }}
                        render={({ field }) => (
                          <FormControl fullWidth error={Boolean(errors.currentState || validationErrors.currentState)}>
                            <InputLabel>State</InputLabel>
                            <Select
                              {...field}
                              label="State"
                              disabled={mode === 'view'}
                            >
                              <MenuItem value="">Select State</MenuItem>
                              <MenuItem value="AL">Alabama</MenuItem>
                              <MenuItem value="AK">Alaska</MenuItem>
                              <MenuItem value="AZ">Arizona</MenuItem>
                              <MenuItem value="AR">Arkansas</MenuItem>
                              <MenuItem value="CA">California</MenuItem>
                              <MenuItem value="CO">Colorado</MenuItem>
                              <MenuItem value="CT">Connecticut</MenuItem>
                              <MenuItem value="DE">Delaware</MenuItem>
                              <MenuItem value="FL">Florida</MenuItem>
                              <MenuItem value="GA">Georgia</MenuItem>
                              <MenuItem value="HI">Hawaii</MenuItem>
                              <MenuItem value="ID">Idaho</MenuItem>
                              <MenuItem value="IL">Illinois</MenuItem>
                              <MenuItem value="IN">Indiana</MenuItem>
                              <MenuItem value="IA">Iowa</MenuItem>
                              <MenuItem value="KS">Kansas</MenuItem>
                              <MenuItem value="KY">Kentucky</MenuItem>
                              <MenuItem value="LA">Louisiana</MenuItem>
                              <MenuItem value="ME">Maine</MenuItem>
                              <MenuItem value="MD">Maryland</MenuItem>
                              <MenuItem value="MA">Massachusetts</MenuItem>
                              <MenuItem value="MI">Michigan</MenuItem>
                              <MenuItem value="MN">Minnesota</MenuItem>
                              <MenuItem value="MS">Mississippi</MenuItem>
                              <MenuItem value="MO">Missouri</MenuItem>
                              <MenuItem value="MT">Montana</MenuItem>
                              <MenuItem value="NE">Nebraska</MenuItem>
                              <MenuItem value="NV">Nevada</MenuItem>
                              <MenuItem value="NH">New Hampshire</MenuItem>
                              <MenuItem value="NJ">New Jersey</MenuItem>
                              <MenuItem value="NM">New Mexico</MenuItem>
                              <MenuItem value="NY">New York</MenuItem>
                              <MenuItem value="NC">North Carolina</MenuItem>
                              <MenuItem value="ND">North Dakota</MenuItem>
                              <MenuItem value="OH">Ohio</MenuItem>
                              <MenuItem value="OK">Oklahoma</MenuItem>
                              <MenuItem value="OR">Oregon</MenuItem>
                              <MenuItem value="PA">Pennsylvania</MenuItem>
                              <MenuItem value="RI">Rhode Island</MenuItem>
                              <MenuItem value="SC">South Carolina</MenuItem>
                              <MenuItem value="SD">South Dakota</MenuItem>
                              <MenuItem value="TN">Tennessee</MenuItem>
                              <MenuItem value="TX">Texas</MenuItem>
                              <MenuItem value="UT">Utah</MenuItem>
                              <MenuItem value="VT">Vermont</MenuItem>
                              <MenuItem value="VA">Virginia</MenuItem>
                              <MenuItem value="WA">Washington</MenuItem>
                              <MenuItem value="WV">West Virginia</MenuItem>
                              <MenuItem value="WI">Wisconsin</MenuItem>
                              <MenuItem value="WY">Wyoming</MenuItem>
                            </Select>
                          </FormControl>
                        )}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={4}>
                      <Controller
                        name="currentZip"
                        control={control}
                        rules={{ 
                          required: 'ZIP code is required',
                          pattern: {
                            value: /^\d{5}(-\d{4})?$/,
                            message: 'Invalid ZIP code format'
                          }
                        }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="ZIP Code"
                            placeholder="12345"
                            error={Boolean(errors.currentZip || validationErrors.currentZip)}
                            helperText={errors.currentZip?.message || validationErrors.currentZip}
                            disabled={mode === 'view'}
                          />
                        )}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="currentResidenceType"
                        control={control}
                        render={({ field }) => (
                          <FormControl fullWidth>
                            <InputLabel>Residence Type</InputLabel>
                            <Select
                              {...field}
                              label="Residence Type"
                              disabled={mode === 'view'}
                            >
                              <MenuItem value="own">Own</MenuItem>
                              <MenuItem value="rent">Rent</MenuItem>
                              <MenuItem value="family">Living with Family</MenuItem>
                              <MenuItem value="other">Other</MenuItem>
                            </Select>
                          </FormControl>
                        )}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="currentMonthlyPayment"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Monthly Rent/Mortgage Payment"
                            type="number"
                            disabled={mode === 'view'}
                            InputProps={{
                              startAdornment: <InputAdornment position="start">$</InputAdornment>
                            }}
                          />
                        )}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="currentMoveInDate"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Move-In Date"
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            disabled={mode === 'view'}
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                  
                  <Divider sx={{ my: 4 }} />
                  
                  <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                    Previous Address (if less than 2 years at current address)
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Controller
                        name="previousAddress"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Street Address"
                            disabled={mode === 'view'}
                          />
                        )}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={5}>
                      <Controller
                        name="previousCity"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="City"
                            disabled={mode === 'view'}
                          />
                        )}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={3}>
                      <Controller
                        name="previousState"
                        control={control}
                        render={({ field }) => (
                          <FormControl fullWidth>
                            <InputLabel>State</InputLabel>
                            <Select
                              {...field}
                              label="State"
                              disabled={mode === 'view'}
                            >
                              <MenuItem value="">Select State</MenuItem>
                              {/* Same state list as above */}
                            </Select>
                          </FormControl>
                        )}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={4}>
                      <Controller
                        name="previousZip"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="ZIP Code"
                            disabled={mode === 'view'}
                          />
                        )}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="previousMoveInDate"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Move-In Date"
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            disabled={mode === 'view'}
                          />
                        )}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="previousMoveOutDate"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Move-Out Date"
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            disabled={mode === 'view'}
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                  
                  <Box display="flex" justifyContent="space-between" sx={{ mt: 3 }}>
                    <Button
                      variant="outlined"
                      onClick={() => setActiveSection('contact')}
                      startIcon={<NavigateBefore />}
                    >
                      Previous
                    </Button>
                    <Box display="flex" gap={2}>
                      <Button
                        variant="outlined"
                        onClick={saveProgress}
                        disabled={saving}
                      >
                        Save Progress
                      </Button>
                      <Button
                        variant="contained"
                        onClick={() => handleSectionComplete('address')}
                        endIcon={<NavigateNext />}
                      >
                        Next Section
                      </Button>
                    </Box>
                  </Box>
                </Box>
              )}
              
              {/* Employment Section */}
              {activeSection === 'employment' && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Employment Information
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  
                  <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                    Current Employment
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={8}>
                      <Controller
                        name="employerName"
                        control={control}
                        rules={{ required: 'Employer name is required' }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Employer Name"
                            error={Boolean(errors.employerName || validationErrors.employerName)}
                            helperText={errors.employerName?.message || validationErrors.employerName}
                            disabled={mode === 'view'}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Work />
                                </InputAdornment>
                              )
                            }}
                          />
                        )}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={4}>
                      <Controller
                        name="employerPhone"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Employer Phone"
                            placeholder="(555) 123-4567"
                            disabled={mode === 'view'}
                          />
                        )}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Controller
                        name="employerAddress"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Employer Address"
                            disabled={mode === 'view'}
                          />
                        )}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="jobTitle"
                        control={control}
                        rules={{ required: 'Job title is required' }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Job Title/Position"
                            error={Boolean(errors.jobTitle || validationErrors.jobTitle)}
                            helperText={errors.jobTitle?.message || validationErrors.jobTitle}
                            disabled={mode === 'view'}
                          />
                        )}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="employmentType"
                        control={control}
                        render={({ field }) => (
                          <FormControl fullWidth>
                            <InputLabel>Employment Type</InputLabel>
                            <Select
                              {...field}
                              label="Employment Type"
                              disabled={mode === 'view'}
                            >
                              <MenuItem value="full-time">Full-Time</MenuItem>
                              <MenuItem value="part-time">Part-Time</MenuItem>
                              <MenuItem value="self-employed">Self-Employed</MenuItem>
                              <MenuItem value="contract">Contract</MenuItem>
                              <MenuItem value="unemployed">Unemployed</MenuItem>
                              <MenuItem value="retired">Retired</MenuItem>
                            </Select>
                          </FormControl>
                        )}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="employmentStartDate"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Start Date"
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            disabled={mode === 'view'}
                          />
                        )}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="monthlyIncome"
                        control={control}
                        rules={{ required: 'Monthly income is required' }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Gross Monthly Income"
                            type="number"
                            error={Boolean(errors.monthlyIncome || validationErrors.monthlyIncome)}
                            helperText={errors.monthlyIncome?.message || validationErrors.monthlyIncome}
                            disabled={mode === 'view'}
                            InputProps={{
                              startAdornment: <InputAdornment position="start">$</InputAdornment>
                            }}
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                  
                  <Divider sx={{ my: 4 }} />
                  
                  <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                    Previous Employment (if less than 2 years at current job)
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="previousEmployerName"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Previous Employer Name"
                            disabled={mode === 'view'}
                          />
                        )}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="previousJobTitle"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Previous Job Title"
                            disabled={mode === 'view'}
                          />
                        )}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Controller
                        name="previousEmploymentDates"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Employment Period (e.g., Jan 2020 - Dec 2022)"
                            disabled={mode === 'view'}
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                  
                  <Box display="flex" justifyContent="space-between" sx={{ mt: 3 }}>
                    <Button
                      variant="outlined"
                      onClick={() => setActiveSection('address')}
                      startIcon={<NavigateBefore />}
                    >
                      Previous
                    </Button>
                    <Box display="flex" gap={2}>
                      <Button
                        variant="outlined"
                        onClick={saveProgress}
                        disabled={saving}
                      >
                        Save Progress
                      </Button>
                      <Button
                        variant="contained"
                        onClick={() => handleSectionComplete('employment')}
                        endIcon={<NavigateNext />}
                      >
                        Next Section
                      </Button>
                    </Box>
                  </Box>
                </Box>
              )}
              
              {/* Income & Expenses Section */}
              {activeSection === 'income' && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Income & Expenses
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  
                  {/* Additional Income Sources */}
                  <Box sx={{ mb: 4 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        Additional Income Sources
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<Add />}
                        onClick={handleAddIncomeSource}
                      >
                        Add Income
                      </Button>
                    </Box>
                    
                    {incomeSources.map((income, index) => (
                      <Paper key={income.id} sx={{ p: 2, mb: 2 }}>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={4}>
                            <Controller
                              name={`incomeSources.${index}.source`}
                              control={control}
                              render={({ field }) => (
                                <FormControl fullWidth>
                                  <InputLabel>Income Type</InputLabel>
                                  <Select {...field} label="Income Type">
                                    {INCOME_SOURCES.map(source => (
                                      <MenuItem key={source} value={source}>{source}</MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              )}
                            />
                          </Grid>
                          
                          <Grid item xs={12} sm={4}>
                            <Controller
                              name={`incomeSources.${index}.description`}
                              control={control}
                              render={({ field }) => (
                                <TextField
                                  {...field}
                                  fullWidth
                                  label="Description"
                                />
                              )}
                            />
                          </Grid>
                          
                          <Grid item xs={12} sm={3}>
                            <Controller
                              name={`incomeSources.${index}.amount`}
                              control={control}
                              render={({ field }) => (
                                <TextField
                                  {...field}
                                  fullWidth
                                  label="Monthly Amount"
                                  type="number"
                                  InputProps={{
                                    startAdornment: <InputAdornment position="start">$</InputAdornment>
                                  }}
                                />
                              )}
                            />
                          </Grid>
                          
                          <Grid item xs={12} sm={1}>
                            <IconButton
                              color="error"
                              onClick={() => removeIncome(index)}
                            >
                              <Delete />
                            </IconButton>
                          </Grid>
                        </Grid>
                      </Paper>
                    ))}
                  </Box>
                  
                  <Divider sx={{ my: 4 }} />
                  
                  {/* Monthly Expenses */}
                  <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                    Monthly Expenses
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="monthlyExpenses.rent"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Rent/Mortgage"
                            type="number"
                            InputProps={{
                              startAdornment: <InputAdornment position="start">$</InputAdornment>
                            }}
                          />
                        )}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="monthlyExpenses.utilities"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Utilities (Electric, Gas, Water)"
                            type="number"
                            InputProps={{
                              startAdornment: <InputAdornment position="start">$</InputAdornment>
                            }}
                          />
                        )}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="monthlyExpenses.insurance"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Insurance (Auto, Health, Life)"
                            type="number"
                            InputProps={{
                              startAdornment: <InputAdornment position="start">$</InputAdornment>
                            }}
                          />
                        )}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="monthlyExpenses.carPayment"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Car Payment"
                            type="number"
                            InputProps={{
                              startAdornment: <InputAdornment position="start">$</InputAdornment>
                            }}
                          />
                        )}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="monthlyExpenses.creditCards"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Credit Card Payments"
                            type="number"
                            InputProps={{
                              startAdornment: <InputAdornment position="start">$</InputAdornment>
                            }}
                          />
                        )}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="monthlyExpenses.loans"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Other Loan Payments"
                            type="number"
                            InputProps={{
                              startAdornment: <InputAdornment position="start">$</InputAdornment>
                            }}
                          />
                        )}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Controller
                        name="monthlyExpenses.other"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Other Monthly Expenses"
                            type="number"
                            InputProps={{
                              startAdornment: <InputAdornment position="start">$</InputAdornment>
                            }}
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                  
                  <Box display="flex" justifyContent="space-between" sx={{ mt: 3 }}>
                    <Button
                      variant="outlined"
                      onClick={() => setActiveSection('employment')}
                      startIcon={<NavigateBefore />}
                    >
                      Previous
                    </Button>
                    <Box display="flex" gap={2}>
                      <Button
                        variant="outlined"
                        onClick={saveProgress}
                        disabled={saving}
                      >
                        Save Progress
                      </Button>
                      <Button
                        variant="contained"
                        onClick={() => handleSectionComplete('income')}
                        endIcon={<NavigateNext />}
                      >
                        Next Section
                      </Button>
                    </Box>
                  </Box>
                </Box>
              )}
              
              {/* Goals Section */}
              {activeSection === 'goals' && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Credit Goals & Objectives
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" gutterBottom>
                        What are your primary credit goals? (Select all that apply)
                      </Typography>
                      <Controller
                        name="creditGoals"
                        control={control}
                        render={({ field }) => (
                          <Box display="flex" flexWrap="wrap" gap={2}>
                            {Object.entries(GOAL_CATEGORIES).map(([key, goal]) => (
                              <Chip
                                key={key}
                                icon={goal.icon}
                                label={goal.label}
                                onClick={() => {
                                  const current = field.value || [];
                                  const newValue = current.includes(key)
                                    ? current.filter(g => g !== key)
                                    : [...current, key];
                                  field.onChange(newValue);
                                }}
                                color={field.value?.includes(key) ? 'primary' : 'default'}
                                variant={field.value?.includes(key) ? 'filled' : 'outlined'}
                                sx={{ 
                                  bgcolor: field.value?.includes(key) ? goal.color : 'transparent',
                                  '&:hover': { bgcolor: goal.color, opacity: 0.8 }
                                }}
                              />
                            ))}
                          </Box>
                        )}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="targetScore"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Target Credit Score"
                            type="number"
                            placeholder="720"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <TrendingUp />
                                </InputAdornment>
                              )
                            }}
                          />
                        )}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="targetDate"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Target Date"
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <CalendarToday />
                                </InputAdornment>
                              )
                            }}
                          />
                        )}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Controller
                        name="specificGoals"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            multiline
                            rows={4}
                            label="Specific Goals & Plans"
                            placeholder="Tell us more about your credit goals and what you hope to achieve..."
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                  
                  <Box display="flex" justifyContent="space-between" sx={{ mt: 3 }}>
                    <Button
                      variant="outlined"
                      onClick={() => setActiveSection('credit')}
                      startIcon={<NavigateBefore />}
                    >
                      Previous
                    </Button>
                    <Box display="flex" gap={2}>
                      <Button
                        variant="outlined"
                        onClick={saveProgress}
                        disabled={saving}
                      >
                        Save Progress
                      </Button>
                      <Button
                        variant="contained"
                        onClick={() => handleSectionComplete('goals')}
                        endIcon={<NavigateNext />}
                      >
                        Next Section
                      </Button>
                    </Box>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Preview Dialog */}
      <Dialog
        open={showPreview}
        onClose={() => setShowPreview(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Information Sheet Preview
        </DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Summary</Typography>
            <Divider sx={{ mb: 2 }} />
            
            {/* Preview content here */}
            <Typography variant="body2">
              Name: {watch('firstName')} {watch('lastName')}
            </Typography>
            <Typography variant="body2">
              Email: {watch('primaryEmail')}
            </Typography>
            <Typography variant="body2">
              Total Income: ${calculatedData.totalIncome.toLocaleString()}
            </Typography>
            <Typography variant="body2">
              DTI Ratio: {calculatedData.debtToIncomeRatio}%
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPreview(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={Boolean(lastSaved)}
        autoHideDuration={3000}
        message={`Last saved ${lastSaved ? formatDistanceToNow(lastSaved) : ''} ago`}
      />
    </Box>
  );
};

export default InformationSheet;