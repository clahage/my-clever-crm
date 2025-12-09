// Mega-Enhanced DisputeLetters.jsx - Complete AI-Powered System
// Version 3.0 - Full Feature Set with Maximum AI Integration
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// Material-UI imports
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Chip,
  Alert,
  AlertTitle,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  ListItemSecondaryAction,
  Badge,
  Divider,
  Stack,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  InputAdornment,
  Container,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Avatar,
  AvatarGroup,
  CircularProgress,
  Snackbar,
  Autocomplete,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  LinearProgress,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Backdrop,
  Switch,
  Slider,
  Rating,
  ToggleButton,
  ToggleButtonGroup,
  Menu,
  Collapse,
  Drawer,
  AppBar,
  Toolbar,
  Breadcrumbs,
  Link as MuiLink,
  Fab,
  FormGroup,
  FormHelperText,
  FormLabel
} from '@mui/material';

// Date picker imports
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Lucide React Icons - Complete Set
import { 
  // Document & File Icons
  FileText,
  Download,
  Upload,
  Trash2,
  Copy,
  FileSignature,
  FilePlus,
  FileCheck,
  FileX,
  FolderOpen,
  Archive,
  
  // Action Icons
  Plus,
  Send,
  Save,
  Edit3,
  Eye,
  X,
  Check,
  
  // Status Icons
  CheckCircle,
  XCircle,
  AlertCircle,
  AlertTriangle,
  Clock,
  Timer,
  Hourglass,
  
  // UI Navigation Icons
  Search,
  Filter,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  MoreVertical,
  MoreHorizontal,
  Menu as MenuIcon,
  
  // Feature Icons
  Calendar,
  Shield,
  Building,
  DollarSign,
  Briefcase,
  Lock,
  Unlock,
  Star,
  Heart,
  BookOpen,
  Award,
  Trophy,
  Medal,
  Crown,
  
  // Communication Icons
  Mail,
  Phone,
  MessageSquare,
  MessageCircle,
  Video,
  Voicemail,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  
  // Data & Analytics Icons
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  PieChart,
  LineChart,
  
  // User Icons
  User,
  Users,
  UserCheck,
  UserPlus,
  UserX,
  
  // Tech & AI Icons
  Settings,
  HelpCircle,
  Info,
  RefreshCw,
  Zap,
  Tag,
  Hash,
  Sparkles,
  Brain,
  Wand2,
  Bot,
  Cpu,
  Network,
  Workflow,
  GitBranch,
  
  // Location Icons
  MapPin,
  Map,
  Navigation,
  Compass,
  Globe,
  
  // Print & Send Icons
  Printer,
  Wifi,
  WifiOff,
  
  // Special Icons
  Gauge,
  Package,
  PackageCheck,
  Layers,
  Database,
  Server,
  Cloud,
  CloudUpload,
  CloudDownload,
  Key,
  Fingerprint,
  CreditCard,
  Receipt,
  FileBarChart,
  Clipboard,
  ClipboardCheck,
  ClipboardX,
  Bookmark,
  Flag,
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Image,
  Film,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  HardDrive,
  Usb,
  Bluetooth,
  Battery,
  BatteryCharging,
  Power,
  PowerOff,
  Repeat,
  RotateCw,
  RotateCcw,
  Shuffle,
  Play,
  Pause,
  StopCircle,
  FastForward,
  Rewind,
  SkipForward,
  SkipBack,
  Maximize,
  Minimize,
  Expand,
  Shrink,
  Move,
  Share2,
  Share,
  Link2,
  Link,
  ExternalLink,
  Anchor,
  Paperclip,
  Code,
  Terminal,
  Command,
  Circle,
  Square,
  Triangle,
  Hexagon,
  Octagon,
  AlertOctagon
} from 'lucide-react';

// Context imports
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

// Firebase imports
import { db, storage } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  serverTimestamp,
  onSnapshot,
  getDoc,
  setDoc,
  limit,
  startAfter
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// PDF Generation
import html2pdf from 'html2pdf.js';

// TELNYX INTEGRATION - Import the Telnyx service
import { 
  sendFax, 
  getFaxStatus,
  sendBatchFaxes,
  cancelFax,
  listReceivedFaxes
} from '../services/faxService';

// Bureau fax numbers
const BUREAU_FAX_NUMBERS = {
  equifax: '+18884197495',
  experian: '+19729390007', 
  transunion: '+16109465906'
};

// OpenAI and Advanced Services
import { 
  generateLetterWithAI, 
  analyzeDisputeStrategy, 
  selectBestTemplate,
  generateBatchLetters,
  getOptimalDisputeTiming,
  calculateSuccessProbability,
  analyzeClientCreditProfile,
  predictDisputeOutcome,
  suggestNextActions,
  generateResponseAnalysis
} from '../services/openaiDisputeService';

// Utility functions
import { formatDate, formatCurrency, formatPhoneNumber } from '../utils/formatters';

// Zip Code API Service
const fetchCityStateFromZip = async (zipCode) => {
  try {
    const response = await fetch(`https://api.zippopotam.us/us/${zipCode}`);
    if (response.ok) {
      const data = await response.json();
      return {
        city: data.places[0]['place name'],
        state: data.places[0]['state abbreviation'],
        latitude: data.places[0].latitude,
        longitude: data.places[0].longitude
      };
    }
  } catch (error) {
    console.error('Error fetching zip code data:', error);
  }
  return null;
};

// Main Component
const DisputeLetters = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const fileInputRef = useRef(null);

  // Core State Management
  const [activeTab, setActiveTab] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [editingLetter, setEditingLetter] = useState(false);
  const [letterContent, setLetterContent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [activeStep, setActiveStep] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savedLetters, setSavedLetters] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clients, setClients] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [showTemplateCreator, setShowTemplateCreator] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  
  // Advanced Features State
  const [batchMode, setBatchMode] = useState(false);
  const [selectedDisputes, setSelectedDisputes] = useState([]);
  const [deliveryMethod, setDeliveryMethod] = useState('mail'); // mail, fax, email, certified, upload
  const [certifiedOptions, setCertifiedOptions] = useState({
    returnReceipt: true,
    signatureRequired: true,
    restrictedDelivery: false
  });
  const [faxNumber, setFaxNumber] = useState('');
  const [emailSettings, setEmailSettings] = useState({
    to: '',
    cc: '',
    subject: 'Credit Report Dispute',
    attachPDF: true
  });
  const [responseTracking, setResponseTracking] = useState([]);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [disputeHistory, setDisputeHistory] = useState([]);
  const [automationRules, setAutomationRules] = useState([]);
  const [adminMode, setAdminMode] = useState(false);
  const [permissions, setPermissions] = useState({});
  const [metrics, setMetrics] = useState({
    totalDisputes: 0,
    successRate: 0,
    avgResponseTime: 0,
    pendingResponses: 0
  });
  const [previewMode, setPreviewMode] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [bulkActions, setBulkActions] = useState([]);
  const [notificationSettings, setNotificationSettings] = useState({
    emailAlerts: true,
    smsAlerts: false,
    inAppAlerts: true,
    responseDeadlines: true
  });
  
  // Form data with all fields
  const [formData, setFormData] = useState({
    // Client Information
    clientId: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientAddress: '',
    clientCity: '',
    clientState: '',
    clientZip: '',
    clientSSN: '',
    clientDOB: null,
    
    // Dispute Information
    bureau: 'equifax',
    disputeType: 'initial',
    accountType: '',
    creditorName: '',
    accountNumber: '',
    disputeReason: '',
    customDispute: '',
    
    // Advanced Options
    attachments: [],
    templateId: '',
    useAI: true,
    aiStrategy: 'aggressive',
    priority: 'normal',
    followUpDate: null,
    internalNotes: '',
    
    // Delivery Options
    deliveryMethod: 'mail',
    certifiedMail: false,
    returnReceipt: false,
    signatureRequired: false,
    faxNumber: '',
    emailRecipient: '',
    
    // Tracking
    trackingNumber: '',
    sentDate: null,
    expectedResponseDate: null,
    actualResponseDate: null,
    responseReceived: false,
    outcome: '',
    
    // AI Features
    aiScore: 0,
    aiRecommendations: [],
    predictedSuccess: 0,
    suggestedStrategy: '',
    riskAssessment: 'low'
  });

  // Sample templates with full data
  const defaultTemplates = [
    {
      id: 'template-1',
      name: 'Round 1 - Initial Dispute (Basic)',
      category: 'bureau',
      type: 'initial',
      content: `[Date]

[Your Name]
[Your Address]
[City, State ZIP]

[Credit Bureau Name]
[Credit Bureau Address]

RE: Request for Investigation of Inaccurate Information

To Whom It May Concern:

I am writing to dispute the following inaccurate information in my file. I have circled the items I dispute on the attached copy of my credit report.

This item (identify item disputed by name of source, such as creditors or tax court, and identify type of item, such as credit account, judgment, etc.) is (inaccurate or incomplete) because (describe what is inaccurate or incomplete and why). I am requesting that the item be removed (or request another specific change) to correct the information.

Enclosed are copies of (use this sentence if applicable and describe any enclosed documentation, such as payment records and court documents) supporting my position. Please investigate this matter and (delete or correct) the disputed item as soon as possible.

Sincerely,
[Your signature]
[Your name]

Enclosures: (List what you are enclosing)`,
      variables: ['clientName', 'clientAddress', 'bureau', 'creditorName', 'accountNumber'],
      successRate: 75,
      avgResponseTime: 28,
      usageCount: 1543,
      aiOptimized: true,
      lastUpdated: '2024-01-15',
      tags: ['initial', 'basic', 'fcra'],
      requiredDocs: ['Credit report copy', 'ID proof'],
      legalCitations: ['FCRA Section 611', '15 U.S.C. § 1681i']
    },
    {
      id: 'template-2',
      name: 'Round 2 - Method of Verification Request',
      category: 'bureau',
      type: 'mov',
      content: `[Date]

[Your Name]
[Your Address]

[Credit Bureau]
[Address]

RE: Method of Verification Request - Previous Dispute Reference #[Reference]

Dear Sir/Madam:

I am writing in response to your recent investigation results dated [date]. You verified several accounts that I continue to dispute as inaccurate.

Under Section 611 of the Fair Credit Reporting Act, I am requesting that you provide me with the following:

1. The name, address, and telephone number of each person contacted regarding the disputed items
2. Copies of all documents provided to you by the creditors
3. The method of verification you used to verify the accuracy of the disputed items
4. A description of the reinvestigation procedure used

The following accounts remain disputed:
[List accounts]

Please conduct a thorough reinvestigation and provide the requested documentation.

Sincerely,
[Your signature]
[Your name]`,
      variables: ['clientName', 'bureau', 'referenceNumber', 'disputeDate'],
      successRate: 82,
      avgResponseTime: 25,
      usageCount: 987,
      aiOptimized: true,
      lastUpdated: '2024-01-20',
      tags: ['mov', 'round2', 'verification'],
      requiredDocs: ['Previous dispute response', 'Credit report'],
      legalCitations: ['FCRA Section 611(a)(6)', '15 U.S.C. § 1681i']
    },
    {
      id: 'template-3',
      name: 'Goodwill Letter - Late Payment Removal',
      category: 'creditor',
      type: 'goodwill',
      content: `[Date]

[Your Name]
[Your Address]

[Creditor Name]
Attn: Customer Relations
[Creditor Address]

RE: Goodwill Adjustment Request - Account #[Account Number]

Dear [Creditor Name] Customer Relations:

I am writing to request a goodwill adjustment to my credit report regarding my account with your company.

I have been a loyal customer for [time period] and have maintained an excellent payment history except for [number] late payment(s) reported on [dates].

[Explain circumstances - job loss, medical emergency, etc.]

Since that time, I have:
- Made all payments on time
- Maintained excellent credit with all other creditors
- [Other positive actions]

I am requesting that you make a goodwill adjustment to remove the late payment(s) from my credit report. This would greatly help me [explain goal - refinance, get mortgage, etc.].

I value my relationship with [Creditor] and hope you will consider this request.

Thank you for your consideration.

Sincerely,
[Your signature]
[Your name]

Account Number: [Account]
Phone: [Phone]`,
      variables: ['clientName', 'creditorName', 'accountNumber', 'latePaymentDates'],
      successRate: 45,
      avgResponseTime: 35,
      usageCount: 756,
      aiOptimized: false,
      lastUpdated: '2024-01-10',
      tags: ['goodwill', 'creditor', 'late-payment'],
      requiredDocs: ['Payment history', 'Account statements'],
      legalCitations: []
    },
    {
      id: 'template-4',
      name: 'Debt Validation Letter - Collections',
      category: 'collector',
      type: 'validation',
      content: `[Date]

[Your Name]
[Your Address]

[Collection Agency Name]
[Collection Agency Address]

RE: Debt Validation Request - Account #[Account Number]

Dear Sir/Madam:

I am requesting validation of the alleged debt referenced above that you claim I owe.

Under the Fair Debt Collection Practices Act (FDCPA), Section 809(b), I have the right to request validation of this debt. I am requesting that you provide me with the following:

1. The amount of the debt
2. The name of the original creditor
3. Proof that you are licensed to collect debt in my state
4. Proof that the debt was assigned or sold to your company
5. A copy of the original signed contract or agreement
6. An accounting of all charges, fees, and interest added
7. Proof that the statute of limitations has not expired

Until you provide proper validation, please:
- Cease all collection activities
- Remove any negative information from my credit reports
- Do not sell or assign this alleged debt to another party

This is not a refusal to pay, but a notice of my right to dispute and request validation.

Sincerely,
[Your signature]
[Your name]

Sent via Certified Mail #[Tracking]`,
      variables: ['clientName', 'collectorName', 'accountNumber'],
      successRate: 88,
      avgResponseTime: 30,
      usageCount: 1234,
      aiOptimized: true,
      lastUpdated: '2024-01-18',
      tags: ['validation', 'fdcpa', 'collections'],
      requiredDocs: ['Collection notice'],
      legalCitations: ['FDCPA Section 809(b)', '15 U.S.C. § 1692g']
    },
    {
      id: 'template-5',
      name: 'Identity Theft Dispute',
      category: 'bureau',
      type: 'identity_theft',
      content: `[Full identity theft template content...]`,
      variables: ['clientName', 'bureau', 'fraudulentAccounts'],
      successRate: 91,
      avgResponseTime: 21,
      usageCount: 432,
      aiOptimized: true,
      lastUpdated: '2024-01-22',
      tags: ['identity-theft', 'fraud', 'urgent'],
      requiredDocs: ['Police report', 'FTC affidavit', 'ID proof'],
      legalCitations: ['FCRA Section 605B', '15 U.S.C. § 1681c-2']
    },
    {
      id: 'template-6',
      name: 'Pay for Delete Negotiation',
      category: 'creditor',
      type: 'pay_for_delete',
      content: `[Full pay for delete template content...]`,
      variables: ['clientName', 'creditorName', 'accountNumber', 'settlementAmount'],
      successRate: 62,
      avgResponseTime: 40,
      usageCount: 543,
      aiOptimized: true,
      lastUpdated: '2024-01-12',
      tags: ['settlement', 'negotiation', 'pay-delete'],
      requiredDocs: ['Account statement', 'Settlement offer'],
      legalCitations: []
    }
  ];

  // Sample saved letters
  const sampleSavedLetters = [
    {
      id: 'letter-1',
      clientName: 'John Smith',
      clientId: 'client-123',
      bureau: 'Equifax',
      disputeType: 'initial',
      templateUsed: 'Round 1 - Initial Dispute',
      createdDate: '2024-01-15',
      sentDate: '2024-01-16',
      status: 'sent',
      trackingNumber: 'USPS123456789',
      responseDate: null,
      outcome: 'pending',
      aiScore: 85,
      predictedSuccess: 78
    },
    {
      id: 'letter-2',
      clientName: 'Sarah Johnson',
      clientId: 'client-456',
      bureau: 'TransUnion',
      disputeType: 'mov',
      templateUsed: 'Method of Verification',
      createdDate: '2024-01-10',
      sentDate: '2024-01-11',
      status: 'responded',
      trackingNumber: 'USPS987654321',
      responseDate: '2024-02-05',
      outcome: 'partial_success',
      aiScore: 91,
      predictedSuccess: 82
    }
  ];

  // Load all data on mount
  useEffect(() => {
    if (!currentUser) return;
    
    // Load clients
    loadClients();
    // Load templates
    loadTemplates();
    // Load saved letters
    loadSavedLetters();
    // Load dispute history
    loadDisputeHistory();
    // Load metrics
    loadMetrics();
    // Setup real-time listeners
    setupRealtimeListeners();
    
    return () => {
      // Cleanup listeners
    };
  }, [currentUser]);

  // Load clients from Firestore
  const loadClients = async () => {
    try {
      const q = query(
        collection(db, 'contacts'),
        where('userId', '==', currentUser.uid)
      );
      
      const querySnapshot = await getDocs(q);
      const clientsData = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        clientsData.push({ 
          id: doc.id, 
          ...data,
          displayName: data.displayName || data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.email || 'Unnamed Contact'
        });
      });
      
      // Sort by displayName
      clientsData.sort((a, b) => {
        const nameA = a.displayName.toLowerCase();
        const nameB = b.displayName.toLowerCase();
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        return 0;
      });
      
      setClients(clientsData);
      console.log('Loaded clients:', clientsData.length);
      
      if (clientsData.length === 0) {
        setSnackbar({ 
          open: true, 
          message: 'No contacts found. You can add a new client manually.', 
          severity: 'info' 
        });
      }
    } catch (error) {
      console.error('Error loading clients:', error);
      if (error.code === 'failed-precondition') {
        // Index not ready, try without orderBy
        try {
          const q = query(
            collection(db, 'contacts'),
            where('userId', '==', currentUser.uid)
          );
          const querySnapshot = await getDocs(q);
          const clientsData = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            clientsData.push({ 
              id: doc.id, 
              ...data,
              displayName: data.displayName || data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.email || 'Unnamed Contact'
            });
          });
          setClients(clientsData);
          console.log('Loaded clients (without sort):', clientsData.length);
        } catch (retryError) {
          console.error('Error loading clients (retry):', retryError);
          setClients([]);
          setSnackbar({ 
            open: true, 
            message: 'Could not load contacts. You can still enter client details manually.', 
            severity: 'warning' 
          });
        }
      } else {
        setClients([]);
        setSnackbar({ 
          open: true, 
          message: 'Error loading contacts. Using manual entry.', 
          severity: 'warning' 
        });
      }
    }
  };

  // Load templates
  const loadTemplates = async () => {
    try {
      // First, try to load from Firestore
      const q = query(
        collection(db, 'disputeTemplates'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const templatesData = [];
      
      querySnapshot.forEach((doc) => {
        templatesData.push({ id: doc.id, ...doc.data() });
      });
      
      // If no templates in database, use defaults
      if (templatesData.length === 0) {
        setTemplates(defaultTemplates);
        // Optionally save defaults to Firestore
        saveDefaultTemplates();
      } else {
        // Merge with defaults to ensure we have all templates
        const mergedTemplates = [...defaultTemplates];
        templatesData.forEach(dbTemplate => {
          const existingIndex = mergedTemplates.findIndex(t => t.id === dbTemplate.id);
          if (existingIndex >= 0) {
            mergedTemplates[existingIndex] = dbTemplate;
          } else {
            mergedTemplates.push(dbTemplate);
          }
        });
        setTemplates(mergedTemplates);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      // Fall back to default templates
      setTemplates(defaultTemplates);
    }
  };

  // Save default templates to Firestore
  const saveDefaultTemplates = async () => {
    try {
      for (const template of defaultTemplates) {
        await setDoc(doc(db, 'disputeTemplates', template.id), {
          ...template,
          createdAt: serverTimestamp(),
          userId: currentUser.uid
        });
      }
    } catch (error) {
      console.error('Error saving default templates:', error);
    }
  };

  // Load saved letters
  const loadSavedLetters = async () => {
    try {
      const q = query(
        collection(db, 'disputeLetters'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      
      const querySnapshot = await getDocs(q);
      const lettersData = [];
      
      querySnapshot.forEach((doc) => {
        lettersData.push({ id: doc.id, ...doc.data() });
      });
      
      // If no saved letters, use samples for demo
      if (lettersData.length === 0) {
        setSavedLetters(sampleSavedLetters);
      } else {
        setSavedLetters(lettersData);
      }
    } catch (error) {
      console.error('Error loading saved letters:', error);
      // Use sample data as fallback
      setSavedLetters(sampleSavedLetters);
    }
  };

  // Load dispute history
  const loadDisputeHistory = async () => {
    try {
      const q = query(
        collection(db, 'disputeHistory'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc'),
        limit(100)
      );
      
      const querySnapshot = await getDocs(q);
      const historyData = [];
      
      querySnapshot.forEach((doc) => {
        historyData.push({ id: doc.id, ...doc.data() });
      });
      
      setDisputeHistory(historyData);
    } catch (error) {
      console.error('Error loading dispute history:', error);
    }
  };

  // Load metrics
  const loadMetrics = async () => {
    try {
      // Calculate metrics from saved letters and history
      const totalDisputes = savedLetters.length + disputeHistory.length;
      const successfulDisputes = savedLetters.filter(l => 
        l.outcome === 'success' || l.outcome === 'partial_success'
      ).length;
      const successRate = totalDisputes > 0 ? (successfulDisputes / totalDisputes) * 100 : 0;
      
      const responseTimes = savedLetters
        .filter(l => l.responseDate && l.sentDate)
        .map(l => {
          const sent = new Date(l.sentDate);
          const response = new Date(l.responseDate);
          return Math.floor((response - sent) / (1000 * 60 * 60 * 24));
        });
      
      const avgResponseTime = responseTimes.length > 0
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
        : 30;
      
      const pendingResponses = savedLetters.filter(l => 
        l.status === 'sent' && !l.responseDate
      ).length;
      
      setMetrics({
        totalDisputes,
        successRate: Math.round(successRate),
        avgResponseTime: Math.round(avgResponseTime),
        pendingResponses
      });
    } catch (error) {
      console.error('Error calculating metrics:', error);
    }
  };

  // Setup real-time listeners
  const setupRealtimeListeners = () => {
    // Listen for new responses
    const unsubscribe = onSnapshot(
      query(
        collection(db, 'disputeResponses'),
        where('userId', '==', currentUser.uid),
        orderBy('receivedDate', 'desc')
      ),
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const response = change.doc.data();
            handleNewResponse(response);
          }
        });
      }
    );
    
    return unsubscribe;
  };

  // Handle new response
  const handleNewResponse = (response) => {
    setSnackbar({
      open: true,
      message: `New response received for ${response.clientName}!`,
      severity: 'info'
    });
    
    // Update saved letters
    loadSavedLetters();
    
    // Run AI analysis on response
    analyzeResponse(response);
  };

  // Analyze response with AI
  const analyzeResponse = async (response) => {
    try {
      const analysis = await generateResponseAnalysis(response);
      
      // Update the letter with analysis
      await updateDoc(doc(db, 'disputeLetters', response.letterId), {
        responseAnalysis: analysis,
        updatedAt: serverTimestamp()
      });
      
      // Suggest next actions
      const nextActions = await suggestNextActions(response, analysis);
      
      setAiAnalysis({
        response,
        analysis,
        nextActions
      });
    } catch (error) {
      console.error('Error analyzing response:', error);
    }
  };

  // Handle client selection
  const handleClientSelect = (client) => {
    if (client && client.id !== 'manual') {
      setSelectedClient(client);
      setFormData(prev => ({
        ...prev,
        clientId: client.id,
        clientName: client.displayName || client.name || '',
        clientEmail: client.email || '',
        clientPhone: client.phone || '',
        clientAddress: client.address || '',
        clientCity: client.city || '',
        clientState: client.state || '',
        clientZip: client.zip || ''
      }));
      
      // Load client's dispute history
      loadClientDisputeHistory(client.id);
      
      // AI analysis of client profile
      analyzeClientProfile(client);
    } else {
      // Manual entry mode
      setSelectedClient(null);
      setFormData(prev => ({
        ...prev,
        clientId: '',
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        clientAddress: '',
        clientCity: '',
        clientState: '',
        clientZip: ''
      }));
    }
  };

  // Load client dispute history
  const loadClientDisputeHistory = async (clientId) => {
    try {
      const q = query(
        collection(db, 'disputeLetters'),
        where('clientId', '==', clientId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const history = [];
      
      querySnapshot.forEach((doc) => {
        history.push({ id: doc.id, ...doc.data() });
      });
      
      // Update dispute history for this client
      setDisputeHistory(history);
    } catch (error) {
      console.error('Error loading client history:', error);
    }
  };

  // Analyze client profile with AI
  const analyzeClientProfile = async (client) => {
    try {
      setAiLoading(true);
      
      const profile = await analyzeClientCreditProfile(client, disputeHistory);
      const strategy = await analyzeDisputeStrategy(client, profile);
      const prediction = await predictDisputeOutcome(client, formData);
      
      setFormData(prev => ({
        ...prev,
        aiScore: profile.score || 0,
        aiRecommendations: strategy.recommendations || [],
        predictedSuccess: prediction.successRate || 0,
        suggestedStrategy: strategy.approach || 'moderate',
        riskAssessment: profile.riskLevel || 'low'
      }));
      
      setAiAnalysis({
        profile,
        strategy,
        prediction
      });
    } catch (error) {
      console.error('Error analyzing client profile:', error);
    } finally {
      setAiLoading(false);
    }
  };

  // Handle zip code change with autofill
  const handleZipCodeChange = async (e) => {
    const zip = e.target.value;
    setFormData(prev => ({ ...prev, clientZip: zip }));
    
    if (zip.length === 5) {
      const location = await fetchCityStateFromZip(zip);
      if (location) {
        setFormData(prev => ({
          ...prev,
          clientCity: location.city,
          clientState: location.state
        }));
        setSnackbar({ 
          open: true, 
          message: `Location found: ${location.city}, ${location.state}`, 
          severity: 'success' 
        });
      }
    }
  };

  // Generate letter with AI
  const handleGenerateWithAI = async () => {
    setAiLoading(true);
    try {
      const aiResponse = await generateLetterWithAI({
        clientInfo: {
          name: formData.clientName,
          address: `${formData.clientAddress}, ${formData.clientCity}, ${formData.clientState} ${formData.clientZip}`,
          email: formData.clientEmail,
          phone: formData.clientPhone
        },
        disputeDetails: {
          bureau: formData.bureau,
          type: formData.disputeType,
          reason: formData.disputeReason,
          creditor: formData.creditorName,
          account: formData.accountNumber,
          customNotes: formData.customDispute
        },
        strategy: formData.aiStrategy,
        template: selectedTemplate,
        history: disputeHistory
      });
      
      setLetterContent(aiResponse);
      
      // Calculate success probability
      const probability = await calculateSuccessProbability(
        formData.disputeType,
        formData.disputeReason,
        formData.attachments.length > 0
      );
      
      setFormData(prev => ({ ...prev, predictedSuccess: probability }));
      
      setSnackbar({ 
        open: true, 
        message: `AI Letter generated! Success probability: ${probability}%`, 
        severity: 'success' 
      });
    } catch (error) {
      console.error('AI generation error:', error);
      setSnackbar({ 
        open: true, 
        message: 'AI generation failed, using template', 
        severity: 'warning' 
      });
      handleTemplateSelect(selectedTemplate);
    } finally {
      setAiLoading(false);
    }
  };

  // Handle template selection
  const handleTemplateSelect = (template) => {
    if (!template) {
      setSnackbar({ 
        open: true, 
        message: 'Please select a template first', 
        severity: 'warning' 
      });
      return;
    }
    
    setSelectedTemplate(template);
    
    // Replace variables in template
    let content = template.content;
    const variables = {
      Date: new Date().toLocaleDateString(),
      'Your Name': formData.clientName,
      'Your Address': formData.clientAddress,
      'City, State ZIP': `${formData.clientCity}, ${formData.clientState} ${formData.clientZip}`,
      'Credit Bureau Name': formData.bureau.charAt(0).toUpperCase() + formData.bureau.slice(1),
      'Credit Bureau Address': getBureauAddress(formData.bureau),
      clientName: formData.clientName,
      clientAddress: `${formData.clientAddress}, ${formData.clientCity}, ${formData.clientState} ${formData.clientZip}`,
      accountNumber: formData.accountNumber,
      creditorName: formData.creditorName,
      Account: formData.accountNumber,
      'Account Number': formData.accountNumber,
      'Creditor Name': formData.creditorName,
      disputeDate: new Date().toLocaleDateString(),
      bureau: formData.bureau.charAt(0).toUpperCase() + formData.bureau.slice(1),
      Phone: formData.clientPhone
    };
    
    // Replace all bracketed variables
    Object.keys(variables).forEach(key => {
      content = content.replace(new RegExp(`\\[${key}\\]`, 'g'), variables[key]);
      content = content.replace(new RegExp(`{${key}}`, 'g'), variables[key]);
    });
    
    setLetterContent(content);
  };

  // Get bureau address
  const getBureauAddress = (bureau) => {
    const addresses = {
      equifax: 'Equifax Information Services LLC\nP.O. Box 740256\nAtlanta, GA 30348',
      experian: 'Experian\nP.O. Box 4500\nAllen, TX 75013',
      transunion: 'TransUnion LLC\nConsumer Dispute Center\nP.O. Box 2000\nChester, PA 19016'
    };
    return addresses[bureau] || addresses.equifax;
  };

  // Save letter to Firestore
  const handleSaveLetter = async () => {
    if (!letterContent || !formData.clientName) {
      setSnackbar({ 
        open: true, 
        message: 'Please complete the letter first', 
        severity: 'error' 
      });
      return;
    }
    
    setLoading(true);
    try {
      const letterData = {
        ...formData,
        content: letterContent,
        templateId: selectedTemplate?.id,
        templateName: selectedTemplate?.name,
        status: 'draft',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        userId: currentUser.uid,
        aiScore: formData.aiScore,
        predictedSuccess: formData.predictedSuccess
      };
      
      const docRef = await addDoc(collection(db, 'disputeLetters'), letterData);
      
      // Add to saved letters state
      setSavedLetters(prev => [{ id: docRef.id, ...letterData }, ...prev]);
      
      // Log to history
      await addDoc(collection(db, 'disputeHistory'), {
        action: 'letter_created',
        letterId: docRef.id,
        clientId: formData.clientId,
        clientName: formData.clientName,
        timestamp: serverTimestamp(),
        userId: currentUser.uid
      });
      
      setSnackbar({ 
        open: true, 
        message: 'Letter saved successfully!', 
        severity: 'success' 
      });
      
      // Reset form for next letter
      if (window.confirm('Letter saved! Would you like to create another?')) {
        resetForm();
      }
    } catch (error) {
      console.error('Error saving letter:', error);
      setSnackbar({ 
        open: true, 
        message: 'Error saving letter. Please try again.', 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setActiveStep(0);
    setSelectedTemplate(null);
    setLetterContent('');
    setSelectedClient(null);
    setFormData({
      clientId: '',
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      clientAddress: '',
      clientCity: '',
      clientState: '',
      clientZip: '',
      clientSSN: '',
      clientDOB: null,
      bureau: 'equifax',
      disputeType: 'initial',
      accountType: '',
      creditorName: '',
      accountNumber: '',
      disputeReason: '',
      customDispute: '',
      attachments: [],
      templateId: '',
      useAI: true,
      aiStrategy: 'aggressive',
      priority: 'normal',
      followUpDate: null,
      internalNotes: '',
      deliveryMethod: 'mail',
      certifiedMail: false,
      returnReceipt: false,
      signatureRequired: false,
      faxNumber: '',
      emailRecipient: '',
      trackingNumber: '',
      sentDate: null,
      expectedResponseDate: null,
      actualResponseDate: null,
      responseReceived: false,
      outcome: '',
      aiScore: 0,
      aiRecommendations: [],
      predictedSuccess: 0,
      suggestedStrategy: '',
      riskAssessment: 'low'
    });
  };

  // Export to PDF
  const handleExportPDF = (letterToExport = null) => {
    const content = letterToExport?.content || letterContent;
    
    if (!content) {
      setSnackbar({ 
        open: true, 
        message: 'No letter to export', 
        severity: 'error' 
      });
      return;
    }
    
    const element = document.getElementById('letter-content-export');
    if (!element) {
      // Create temporary element for export
      const tempDiv = document.createElement('div');
      tempDiv.id = 'letter-content-export';
      tempDiv.innerHTML = `
        <div style="padding: 40px; font-family: Arial, sans-serif;">
          <pre style="white-space: pre-wrap; font-family: Arial, sans-serif; font-size: 12pt; line-height: 1.6;">
${content}
          </pre>
        </div>
      `;
      document.body.appendChild(tempDiv);
      
      const opt = {
        margin: 1,
        filename: `dispute_letter_${formData.clientName || 'client'}_${new Date().getTime()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      
      html2pdf().from(tempDiv).set(opt).save().then(() => {
        document.body.removeChild(tempDiv);
      });
    } else {
      const opt = {
        margin: 1,
        filename: `dispute_letter_${formData.clientName || 'client'}_${new Date().getTime()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      
      html2pdf().from(element).set(opt).save();
    }
    
    setSnackbar({ 
      open: true, 
      message: 'PDF exported successfully!', 
      severity: 'success' 
    });
  };

  // Preview letter
  const handlePreviewLetter = (letter) => {
    setSelectedLetter(letter);
    setPreviewMode(true);
  };

  // Edit template
  const handleEditTemplate = (template) => {
    setSelectedTemplate(template);
    setShowTemplateCreator(true);
  };

  // Delete template
  const handleDeleteTemplate = async (templateId) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;
    
    try {
      await deleteDoc(doc(db, 'disputeTemplates', templateId));
      setTemplates(prev => prev.filter(t => t.id !== templateId));
      setSnackbar({ 
        open: true, 
        message: 'Template deleted', 
        severity: 'success' 
      });
    } catch (error) {
      console.error('Error deleting template:', error);
      setSnackbar({ 
        open: true, 
        message: 'Error deleting template', 
        severity: 'error' 
      });
    }
  };

  // Send letter via selected method
  const handleSendLetter = async () => {
    if (!letterContent) {
      setSnackbar({ 
        open: true, 
        message: 'No letter to send', 
        severity: 'error' 
      });
      return;
    }
    
    setLoading(true);
    
    try {
      switch (deliveryMethod) {
        case 'mail':
        case 'certified':
          // Generate mailing instructions
          await handleMailDelivery();
          break;
        
        case 'fax':
          // Send via fax API
          await handleFaxDelivery();
          break;
        
        case 'email':
          // Send via email
          await handleEmailDelivery();
          break;
        
        case 'upload':
          // Upload to bureau portal
          await handlePortalUpload();
          break;
        
        default:
          throw new Error('Invalid delivery method');
      }
      
      // Update letter status
      if (selectedLetter?.id) {
        await updateDoc(doc(db, 'disputeLetters', selectedLetter.id), {
          status: 'sent',
          sentDate: serverTimestamp(),
          deliveryMethod,
          expectedResponseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          updatedAt: serverTimestamp()
        });
      }
      
      setSnackbar({ 
        open: true, 
        message: `Letter sent via ${deliveryMethod}!`, 
        severity: 'success' 
      });
      
    } catch (error) {
      console.error('Error sending letter:', error);
      setSnackbar({ 
        open: true, 
        message: 'Error sending letter', 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle mail delivery
  const handleMailDelivery = async () => {
    // Generate PDF
    handleExportPDF();
    
    // Generate mailing label
    const mailingLabel = {
      to: getBureauAddress(formData.bureau),
      from: `${formData.clientName}\n${formData.clientAddress}\n${formData.clientCity}, ${formData.clientState} ${formData.clientZip}`,
      certified: deliveryMethod === 'certified',
      returnReceipt: certifiedOptions.returnReceipt,
      signatureRequired: certifiedOptions.signatureRequired,
      restrictedDelivery: certifiedOptions.restrictedDelivery
    };
    
    // Save mailing instructions
    await addDoc(collection(db, 'mailingQueue'), {
      letterId: selectedLetter?.id,
      clientId: formData.clientId,
      mailingLabel,
      createdAt: serverTimestamp(),
      userId: currentUser.uid
    });
    
    // Show mailing instructions dialog
    alert(`Mailing Instructions:\n\n1. Print the PDF letter\n2. Print mailing label\n3. ${deliveryMethod === 'certified' ? 'Take to post office for certified mail' : 'Mail via regular post'}\n4. Enter tracking number when available`);
  };

 // Handle fax delivery
  const handleFaxDelivery = async () => {
    setFaxLoading(true);
    try {
      // Determine fax number
      let targetFaxNumber = faxNumber;
      
      // If no custom fax number, use bureau fax
      if (!targetFaxNumber && BUREAU_FAX_NUMBERS[formData.bureau]) {
        targetFaxNumber = BUREAU_FAX_NUMBERS[formData.bureau];
      }
      
      if (!targetFaxNumber) {
        throw new Error('No fax number specified');
      }
      
      // Generate PDF as base64
      setSnackbar({ 
        open: true, 
        message: 'Generating PDF for fax...', 
        severity: 'info' 
      });
      
      const pdfBase64 = await generatePDFBase64();
      
      // Send fax via Telnyx using YOUR service
      setSnackbar({ 
        open: true, 
        message: 'Sending fax via Telnyx...', 
        severity: 'info' 
      });
      
      const faxResult = await sendFax({
        toNumber: targetFaxNumber,
        pdfContent: pdfBase64,
        clientName: formData.clientName,
        userId: currentUser.uid,
        letterId: selectedLetter?.id || null,
        metadata: {
          bureau: formData.bureau,
          disputeType: formData.disputeType,
          accountNumber: formData.accountNumber
        }
      });
      
      if (faxResult.success) {
        setFaxStatus({
          id: faxResult.faxId,
          status: faxResult.status,
          sentTo: faxResult.toNumber,
          pageCount: faxResult.pageCount
        });
        
        // Save fax record to database
        await addDoc(collection(db, 'faxTransmissions'), {
          letterId: selectedLetter?.id || null,
          clientId: formData.clientId,
          clientName: formData.clientName,
          bureau: formData.bureau,
          faxId: faxResult.faxId,
          toNumber: faxResult.toNumber,
          status: faxResult.status,
          sentAt: serverTimestamp(),
          userId: currentUser.uid,
          pageCount: faxResult.pageCount,
          estimatedDelivery: faxResult.estimatedDelivery
        });
        
        setSnackbar({ 
          open: true, 
          message: `Fax sent successfully! ID: ${faxResult.faxId}`, 
          severity: 'success' 
        });
        
        // Start checking fax status
        checkFaxStatus(faxResult.faxId);
      } else {
        throw new Error('Fax transmission failed');
      }
    } catch (error) {
      console.error('Fax error:', error);
      setSnackbar({ 
        open: true, 
        message: `Fax failed: ${error.message}`, 
        severity: 'error' 
      });
    } finally {
      setFaxLoading(false);
    }
  };

  // Check fax status periodically
  const checkFaxStatus = async (faxId) => {
    let attempts = 0;
    const maxAttempts = 10;
    
    const checkStatus = async () => {
      try {
        const statusResult = await getFaxStatus(faxId);
        
        if (statusResult) {
          setFaxStatus(prev => ({
            ...prev,
            status: statusResult.status,
            completedAt: statusResult.completedAt,
            failureReason: statusResult.failureReason
          }));
          
          if (statusResult.status === 'delivered') {
            setSnackbar({ 
              open: true, 
              message: 'Fax delivered successfully!', 
              severity: 'success' 
            });
            
            // Update database
            const q = query(
              collection(db, 'faxTransmissions'),
              where('faxId', '==', faxId)
            );
            const snapshot = await getDocs(q);
            snapshot.forEach(doc => {
              updateDoc(doc.ref, {
                status: statusResult.status,
                deliveredAt: serverTimestamp()
              });
            });
          } else if (statusResult.status === 'failed') {
            setSnackbar({ 
              open: true, 
              message: `Fax failed: ${statusResult.failureReason || 'Unknown error'}`, 
              severity: 'error' 
            });
          } else if (statusResult.status === 'sending' || statusResult.status === 'queued') {
            // Still processing, check again
            if (attempts < maxAttempts) {
              setTimeout(() => {
                attempts++;
                checkStatus();
              }, 10000); // Check every 10 seconds
            }
          }
        }
      } catch (error) {
        console.error('Error checking fax status:', error);
      }
    };
    
    // Start checking after 5 seconds
    setTimeout(checkStatus, 5000);
  };

  // Handle email delivery
  const handleEmailDelivery = async () => {
    // This would integrate with email service
    // For now, we'll create a mailto link with the PDF attached
    const subject = encodeURIComponent(emailSettings.subject || 'Credit Report Dispute');
    const body = encodeURIComponent(letterContent);
    const mailto = `mailto:${emailSettings.to}?subject=${subject}&body=${body}`;
    
    window.open(mailto);
    
    setSnackbar({ 
      open: true, 
      message: 'Email client opened. Please attach the PDF manually.', 
      severity: 'info' 
    });
    
    // Also generate PDF for attachment
    handleExportPDF();
  };

  // Handle portal upload
  const handlePortalUpload = async () => {
    // Instructions for manual upload
    const bureauPortals = {
      equifax: 'https://www.equifax.com/personal/disputes',
      experian: 'https://www.experian.com/disputes/main.html',
      transunion: 'https://www.transunion.com/credit-disputes/dispute-your-credit'
    };
    
    window.open(bureauPortals[formData.bureau], '_blank');
    
    setSnackbar({ 
      open: true, 
      message: 'Bureau portal opened. Upload your letter there.', 
      severity: 'info' 
    });
    
    // Generate PDF for upload
    handleExportPDF();
  };

  // Render the main component
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="xl">
        <Box sx={{ py: 3 }}>
          {/* Header with metrics */}
          <Paper elevation={3} sx={{ p: 3, mb: 3, background: isDarkMode ? '#1e1e1e' : '#fff' }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={6}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Shield size={40} color="#1976d2" />
                  <Box>
                    <Typography variant="h4" component="h1">
                      Dispute Letters Command Center
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      AI-Powered Credit Dispute Management System
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Tooltip title="Total Disputes">
                    <Chip
                      icon={<FileText size={16} />}
                      label={`${metrics.totalDisputes} Disputes`}
                      color="primary"
                    />
                  </Tooltip>
                  <Tooltip title="Success Rate">
                    <Chip
                      icon={<Trophy size={16} />}
                      label={`${metrics.successRate}% Success`}
                      color="success"
                    />
                  </Tooltip>
                  <Tooltip title="Average Response Time">
                    <Chip
                      icon={<Clock size={16} />}
                      label={`${metrics.avgResponseTime} Days Avg`}
                      color="info"
                    />
                  </Tooltip>
                  <Tooltip title="Pending Responses">
                    <Chip
                      icon={<Hourglass size={16} />}
                      label={`${metrics.pendingResponses} Pending`}
                      color="warning"
                    />
                  </Tooltip>
                </Stack>
              </Grid>
            </Grid>

            {/* Action buttons */}
            <Box display="flex" gap={1} mt={2} flexWrap="wrap">
              <Button
                variant="contained"
                startIcon={<Plus />}
                onClick={() => setActiveTab(0)}
                size="small"
              >
                New Letter
              </Button>
              <Button
                variant="outlined"
                startIcon={<Brain />}
                onClick={() => setBatchMode(!batchMode)}
                size="small"
              >
                {batchMode ? 'Single Mode' : 'Batch Mode'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={handleExportPDF}
                size="small"
              >
                Export PDF
              </Button>
              <Button
                variant="outlined"
                startIcon={<Printer />}
                onClick={() => window.print()}
                size="small"
              >
                Print
              </Button>
              <Button
                variant="outlined"
                startIcon={<HelpCircle />}
                onClick={() => setShowInstructions(true)}
                size="small"
              >
                Help
              </Button>
              {adminMode && (
                <Button
                  variant="outlined"
                  startIcon={<Settings />}
                  onClick={() => navigate('/admin/disputes')}
                  size="small"
                  color="secondary"
                >
                  Admin Panel
                </Button>
              )}
            </Box>

            {/* Tabs */}
            <Tabs 
              value={activeTab} 
              onChange={(e, v) => setActiveTab(v)} 
              variant="scrollable"
              scrollButtons="auto"
              sx={{ mt: 2 }}
            >
              <Tab label="Create Letter" icon={<Plus size={16} />} iconPosition="start" />
              <Tab label="Templates" icon={<FileText size={16} />} iconPosition="start" />
              <Tab label="Saved Letters" icon={<Save size={16} />} iconPosition="start" />
              <Tab label="AI Assistant" icon={<Brain size={16} />} iconPosition="start" />
              <Tab label="Response Tracking" icon={<Activity size={16} />} iconPosition="start" />
              <Tab label="Analytics" icon={<BarChart3 size={16} />} iconPosition="start" />
              <Tab label="Instructions" icon={<BookOpen size={16} />} iconPosition="start" />
            </Tabs>
          </Paper>

          {/* Tab Content */}
          <Paper elevation={3} sx={{ p: 3, minHeight: '600px' }}>
            {/* Create Letter Tab */}
            {activeTab === 0 && (
              <Box>
                {/* AI Recommendations Banner */}
                {aiAnalysis && (
                  <Alert 
                    severity="info" 
                    icon={<Brain />}
                    action={
                      <Button size="small" onClick={() => setAiAnalysis(null)}>
                        Dismiss
                      </Button>
                    }
                    sx={{ mb: 2 }}
                  >
                    <AlertTitle>AI Recommendations</AlertTitle>
                    {aiAnalysis.strategy?.recommendations?.map((rec, idx) => (
                      <Typography key={idx} variant="body2">• {rec}</Typography>
                    ))}
                  </Alert>
                )}

                <Stepper activeStep={activeStep} orientation="vertical">
                  {/* Step 1: Client Selection */}
                  <Step>
                    <StepLabel 
                      optional={
                        selectedClient && (
                          <Typography variant="caption">
                            Selected: {selectedClient.displayName}
                          </Typography>
                        )
                      }
                    >
                      Select or Add Contact
                    </StepLabel>
                    <StepContent>
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
  <Autocomplete
    options={[
      { id: 'manual', displayName: '➕ Manual Entry (New Contact)', name: 'Manual Entry', email: '' },
      ...clients.map(client => ({
        ...client,
        displayName: client.displayName || client.name || `${client.firstName || ''} ${client.lastName || ''}`.trim() || 'Unnamed Contact'
      }))
    ]}
    getOptionLabel={(option) => {
      if (!option) return '';
      if (option.id === 'manual') return '➕ Manual Entry (New Contact)';
      return option.displayName || option.name || 'Unnamed';
    }}
    renderOption={(props, option) => {
      const { key, ...otherProps } = props;
      return (
        <Box component="li" key={key} {...otherProps}>
          <ListItemIcon>
            {option.id === 'manual' ? <Plus /> : <User />}
          </ListItemIcon>
          <ListItemText
            primary={option.id === 'manual' ? 'Manual Entry (New Contact)' : (option.displayName || option.name)}
            secondary={option.id === 'manual' ? 'Enter contact details manually' : option.email}
          />
        </Box>
      );
    }}
    renderInput={(params) => (
      <TextField
        {...params}
        label="Select Client"
        variant="outlined"
        fullWidth
        helperText={clients.length > 0 ? `${clients.length} clients available` : 'Loading clients...'}
      />
    )}
    onChange={(e, value) => {
      if (!value) {
        handleClientSelect(null);
      } else if (value.id === 'manual') {
        handleClientSelect(null);
      } else {
        handleClientSelect(value);
      }
    }}
    value={selectedClient}
    isOptionEqualToValue={(option, value) => {
      if (!option || !value) return false;
      return option.id === value.id;
    }}
  />
</Grid>
                        
                        {(!selectedClient || selectedClient?.id === 'manual') && (
                          <>
                            <Grid item xs={12} md={6}>
                              <TextField
                                label="Client Name *"
                                value={formData.clientName}
                                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                                fullWidth
                                required
                                error={!formData.clientName && activeStep > 0}
                                helperText={!formData.clientName && activeStep > 0 ? 'Required' : ''}
                              />
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <TextField
                                label="Email"
                                type="email"
                                value={formData.clientEmail}
                                onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                                fullWidth
                                InputProps={{
                                  startAdornment: <Mail size={16} style={{ marginRight: 8 }} />
                                }}
                              />
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <TextField
                                label="Phone"
                                value={formData.clientPhone}
                                onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                                fullWidth
                                InputProps={{
                                  startAdornment: <Phone size={16} style={{ marginRight: 8 }} />
                                }}
                              />
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <TextField
                                label="SSN (Last 4)"
                                value={formData.clientSSN}
                                onChange={(e) => setFormData({ ...formData, clientSSN: e.target.value })}
                                fullWidth
                                inputProps={{ maxLength: 4 }}
                                InputProps={{
                                  startAdornment: <Lock size={16} style={{ marginRight: 8 }} />
                                }}
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <TextField
                                label="Street Address"
                                value={formData.clientAddress}
                                onChange={(e) => setFormData({ ...formData, clientAddress: e.target.value })}
                                fullWidth
                                InputProps={{
                                  startAdornment: <MapPin size={16} style={{ marginRight: 8 }} />
                                }}
                              />
                            </Grid>
                            <Grid item xs={12} md={4}>
                              <TextField
                                label="ZIP Code"
                                value={formData.clientZip}
                                onChange={handleZipCodeChange}
                                fullWidth
                                inputProps={{ maxLength: 5 }}
                                helperText="Enter ZIP to auto-fill city/state"
                                InputProps={{
                                  endAdornment: formData.clientZip.length === 5 && (
                                    <CheckCircle size={16} color="green" />
                                  )
                                }}
                              />
                            </Grid>
                            <Grid item xs={12} md={4}>
                              <TextField
                                label="City"
                                value={formData.clientCity}
                                onChange={(e) => setFormData({ ...formData, clientCity: e.target.value })}
                                fullWidth
                                InputProps={{
                                  startAdornment: formData.clientCity && (
                                    <Building size={16} style={{ marginRight: 8 }} />
                                  )
                                }}
                              />
                            </Grid>
                            <Grid item xs={12} md={4}>
                              <TextField
                                label="State"
                                value={formData.clientState}
                                onChange={(e) => setFormData({ ...formData, clientState: e.target.value })}
                                fullWidth
                                inputProps={{ maxLength: 2 }}
                              />
                            </Grid>
                          </>
                        )}

                        {/* AI Score Display */}
                        {formData.aiScore > 0 && (
                          <Grid item xs={12}>
                            <Alert severity={formData.aiScore > 70 ? 'success' : 'warning'}>
                              AI Credit Score Analysis: {formData.aiScore}/100
                            </Alert>
                          </Grid>
                        )}
                      </Grid>
                      
                      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        <Button
                          variant="contained"
                          onClick={() => setActiveStep(1)}
                          disabled={!formData.clientName}
                          endIcon={<ArrowRight />}
                        >
                          Continue
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={resetForm}
                        >
                          Reset
                        </Button>
                      </Box>
                    </StepContent>
                  </Step>

                  {/* Step 2: Dispute Details */}
                  <Step>
                    <StepLabel>Dispute Details</StepLabel>
                    <StepContent>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <FormControl fullWidth>
                            <InputLabel>Credit Bureau *</InputLabel>
                            <Select
                              value={formData.bureau}
                              onChange={(e) => setFormData({ ...formData, bureau: e.target.value })}
                              label="Credit Bureau *"
                            >
                              <MenuItem value="equifax">
                                <ListItemIcon><Building size={16} /></ListItemIcon>
                                Equifax
                              </MenuItem>
                              <MenuItem value="experian">
                                <ListItemIcon><Building size={16} /></ListItemIcon>
                                Experian
                              </MenuItem>
                              <MenuItem value="transunion">
                                <ListItemIcon><Building size={16} /></ListItemIcon>
                                TransUnion
                              </MenuItem>
                              <MenuItem value="all">
                                <ListItemIcon><Globe size={16} /></ListItemIcon>
                                All Bureaus
                              </MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <FormControl fullWidth>
                            <InputLabel>Dispute Type *</InputLabel>
                            <Select
                              value={formData.disputeType}
                              onChange={(e) => setFormData({ ...formData, disputeType: e.target.value })}
                              label="Dispute Type *"
                            >
                              <MenuItem value="initial">Initial Dispute</MenuItem>
                              <MenuItem value="reinvestigation">Reinvestigation</MenuItem>
                              <MenuItem value="method_verification">Method of Verification</MenuItem>
                              <MenuItem value="goodwill">Goodwill Letter</MenuItem>
                              <MenuItem value="validation">Debt Validation</MenuItem>
                              <MenuItem value="cease_desist">Cease and Desist</MenuItem>
                              <MenuItem value="identity_theft">Identity Theft</MenuItem>
                              <MenuItem value="pay_for_delete">Pay for Delete</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            label="Creditor/Collection Agency"
                            value={formData.creditorName}
                            onChange={(e) => setFormData({ ...formData, creditorName: e.target.value })}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            label="Account Number"
                            value={formData.accountNumber}
                            onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <FormControl fullWidth>
                            <InputLabel>Dispute Reason *</InputLabel>
                            <Select
                              value={formData.disputeReason}
                              onChange={(e) => setFormData({ ...formData, disputeReason: e.target.value })}
                              label="Dispute Reason *"
                            >
                              <MenuItem value="not_mine">Account is not mine</MenuItem>
                              <MenuItem value="incorrect_balance">Incorrect balance</MenuItem>
                              <MenuItem value="incorrect_payment">Incorrect payment status</MenuItem>
                              <MenuItem value="duplicate">Duplicate account</MenuItem>
                              <MenuItem value="identity_theft">Identity theft</MenuItem>
                              <MenuItem value="paid_in_full">Paid in full</MenuItem>
                              <MenuItem value="never_late">Never late</MenuItem>
                              <MenuItem value="closed">Account closed</MenuItem>
                              <MenuItem value="unauthorized">Unauthorized inquiry</MenuItem>
                              <MenuItem value="outdated">Outdated information</MenuItem>
                              <MenuItem value="other">Other (specify below)</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            label="Additional Details / Custom Dispute"
                            value={formData.customDispute}
                            onChange={(e) => setFormData({ ...formData, customDispute: e.target.value })}
                            multiline
                            rows={4}
                            fullWidth
                            helperText="Provide specific details about the dispute"
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <FormControl fullWidth>
                            <InputLabel>Priority</InputLabel>
                            <Select
                              value={formData.priority}
                              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                              label="Priority"
                            >
                              <MenuItem value="low">Low Priority</MenuItem>
                              <MenuItem value="normal">Normal Priority</MenuItem>
                              <MenuItem value="high">High Priority</MenuItem>
                              <MenuItem value="urgent">Urgent</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <DatePicker
                            label="Follow-up Date"
                            value={formData.followUpDate}
                            onChange={(date) => setFormData({ ...formData, followUpDate: date })}
                            renderInput={(params) => <TextField {...params} fullWidth />}
                          />
                        </Grid>
                      </Grid>
                      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        <Button onClick={() => setActiveStep(0)} startIcon={<ArrowLeft />}>
                          Back
                        </Button>
                        <Button 
                          variant="contained" 
                          onClick={() => setActiveStep(2)}
                          endIcon={<ArrowRight />}
                        >
                          Continue
                        </Button>
                      </Box>
                    </StepContent>
                  </Step>

                  {/* Step 3: Template & AI Selection */}
                  <Step>
                    <StepLabel>Select Template & AI Settings</StepLabel>
                    <StepContent>
                      {/* Template Selection */}
                      <Typography variant="h6" gutterBottom>
                        Choose Template
                      </Typography>
                      <Grid container spacing={2} sx={{ mb: 3 }}>
                        {templates
                          .filter(t => t.category === 'bureau' || formData.disputeType === t.type)
                          .map((template) => (
                          <Grid item xs={12} md={6} lg={4} key={template.id}>
                            <Card
                              sx={{
                                cursor: 'pointer',
                                border: selectedTemplate?.id === template.id ? 3 : 1,
                                borderColor: selectedTemplate?.id === template.id ? 'primary.main' : 'divider',
                                '&:hover': { boxShadow: 3 }
                              }}
                              onClick={() => handleTemplateSelect(template)}
                            >
                              <CardContent>
                                <Typography variant="h6" gutterBottom>
                                  {template.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" paragraph>
                                  Type: {template.type} | Category: {template.category}
                                </Typography>
                                <Box display="flex" gap={0.5} flexWrap="wrap">
                                  {template.successRate && (
                                    <Chip
                                      label={`${template.successRate}% Success`}
                                      size="small"
                                      color={template.successRate > 70 ? 'success' : 'warning'}
                                      icon={<Trophy size={14} />}
                                    />
                                  )}
                                  {template.aiOptimized && (
                                    <Chip
                                      icon={<Brain size={14} />}
                                      label="AI"
                                      size="small"
                                      color="primary"
                                    />
                                  )}
                                  {template.avgResponseTime && (
                                    <Chip
                                      icon={<Clock size={14} />}
                                      label={`${template.avgResponseTime}d`}
                                      size="small"
                                    />
                                  )}
                                </Box>
                                {template.tags && (
                                  <Box sx={{ mt: 1 }}>
                                    {template.tags.slice(0, 3).map(tag => (
                                      <Chip 
                                        key={tag} 
                                        label={tag} 
                                        size="small" 
                                        sx={{ mr: 0.5, mb: 0.5 }}
                                      />
                                    ))}
                                  </Box>
                                )}
                              </CardContent>
                              <CardActions>
                                <Button 
                                  size="small" 
                                  startIcon={<Eye />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePreviewLetter(template);
                                  }}
                                >
                                  Preview
                                </Button>
                                <Button 
                                  size="small" 
                                  startIcon={<Edit3 />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditTemplate(template);
                                  }}
                                >
                                  Edit
                                </Button>
                              </CardActions>
                            </Card>
                          </Grid>
                        ))}
                        <Grid item xs={12} md={6} lg={4}>
                          <Card
                            sx={{
                              cursor: 'pointer',
                              border: '2px dashed',
                              borderColor: 'divider',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              minHeight: 200
                            }}
                            onClick={() => setShowTemplateCreator(true)}
                          >
                            <CardContent sx={{ textAlign: 'center' }}>
                              <Plus size={40} />
                              <Typography variant="h6">Create New Template</Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      </Grid>

                      {/* AI Settings */}
                      <Typography variant="h6" gutterBottom>
                        AI Enhancement Settings
                      </Typography>
                      <Paper sx={{ p: 2, mb: 2 }}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={formData.useAI}
                              onChange={(e) => setFormData({ ...formData, useAI: e.target.checked })}
                              color="primary"
                            />
                          }
                          label="Enable AI Enhancement"
                        />
                        
                        {formData.useAI && (
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              AI Strategy Level
                            </Typography>
                            <RadioGroup
                              value={formData.aiStrategy}
                              onChange={(e) => setFormData({ ...formData, aiStrategy: e.target.value })}
                            >
                              <FormControlLabel 
                                value="conservative" 
                                control={<Radio />} 
                                label={
                                  <Box>
                                    <Typography variant="body2">Conservative</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      Focus on compliance and safety (65-70% success)
                                    </Typography>
                                  </Box>
                                }
                              />
                              <FormControlLabel 
                                value="moderate" 
                                control={<Radio />} 
                                label={
                                  <Box>
                                    <Typography variant="body2">Moderate</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      Balanced approach (70-80% success)
                                    </Typography>
                                  </Box>
                                }
                              />
                              <FormControlLabel 
                                value="aggressive" 
                                control={<Radio />} 
                                label={
                                  <Box>
                                    <Typography variant="body2">Aggressive</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      Maximum impact (75-85% success)
                                    </Typography>
                                  </Box>
                                }
                              />
                            </RadioGroup>
                            
                            {/* AI Features */}
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="subtitle2" gutterBottom>
                                AI Features to Apply:
                              </Typography>
                              <FormGroup>
                                <FormControlLabel 
                                  control={<Checkbox defaultChecked />} 
                                  label="Legal citation optimization" 
                                />
                                <FormControlLabel 
                                  control={<Checkbox defaultChecked />} 
                                  label="Bureau-specific formatting" 
                                />
                                <FormControlLabel 
                                  control={<Checkbox defaultChecked />} 
                                  label="Success pattern matching" 
                                />
                                <FormControlLabel 
                                  control={<Checkbox defaultChecked />} 
                                  label="Timing recommendations" 
                                />
                                <FormControlLabel 
                                  control={<Checkbox />} 
                                  label="Emotional tone adjustment" 
                                />
                              </FormGroup>
                            </Box>
                            
                            {/* Success Prediction */}
                            {formData.predictedSuccess > 0 && (
                              <Alert severity={formData.predictedSuccess > 70 ? 'success' : 'warning'} sx={{ mt: 2 }}>
                                <AlertTitle>AI Success Prediction</AlertTitle>
                                {formData.predictedSuccess}% probability of success based on similar disputes
                              </Alert>
                            )}
                          </Box>
                        )}
                      </Paper>

                      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        <Button onClick={() => setActiveStep(1)} startIcon={<ArrowLeft />}>
                          Back
                        </Button>
                        <Button
                          variant="contained"
                          onClick={() => {
                            if (formData.useAI) {
                              handleGenerateWithAI();
                            } else if (selectedTemplate) {
                              handleTemplateSelect(selectedTemplate);
                            }
                            setActiveStep(3);
                          }}
                          disabled={!selectedTemplate}
                          endIcon={aiLoading ? <CircularProgress size={16} /> : <Wand2 />}
                        >
                          {aiLoading ? 'Generating...' : 'Generate Letter'}
                        </Button>
                      </Box>
                    </StepContent>
                  </Step>

                  {/* Step 4: Review, Edit & Send */}
                  <Step>
                    <StepLabel>Review, Edit & Send</StepLabel>
                    <StepContent>
                      {/* Letter Content */}
                      <Paper
                        id="letter-content"
                        sx={{
                          p: 3,
                          mb: 2,
                          minHeight: 400,
                          backgroundColor: 'background.paper',
                          border: editingLetter ? '2px solid' : '1px solid',
                          borderColor: editingLetter ? 'primary.main' : 'divider'
                        }}
                      >
                        <TextField
                          value={letterContent}
                          onChange={(e) => setLetterContent(e.target.value)}
                          multiline
                          fullWidth
                          rows={20}
                          variant={editingLetter ? 'outlined' : 'standard'}
                          InputProps={{
                            disableUnderline: !editingLetter,
                            readOnly: !editingLetter,
                            style: {
                              fontFamily: 'monospace',
                              fontSize: '12pt',
                              lineHeight: 1.6
                            }
                          }}
                          placeholder="Letter content will appear here..."
                        />
                      </Paper>
                      
                      {/* Delivery Options */}
                      <Accordion sx={{ mb: 2 }}>
                        <AccordionSummary expandIcon={<ChevronDown />}>
                          <Typography>Delivery Options</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Grid container spacing={2}>
                            <Grid item xs={12}>
                              <ToggleButtonGroup
                                value={deliveryMethod}
                                exclusive
                                onChange={(e, v) => v && setDeliveryMethod(v)}
                                fullWidth
                              >
                                <ToggleButton value="mail">
                                  <Mail /> Regular Mail
                                </ToggleButton>
                                <ToggleButton value="certified">
                                  <FileSignature /> Certified Mail
                                </ToggleButton>
                                <ToggleButton value="fax">
                                  <Phone /> Fax
                                </ToggleButton>
                                <ToggleButton value="email">
                                  <Mail /> Email
                                </ToggleButton>
                                <ToggleButton value="upload">
                                  <Upload /> Portal Upload
                                </ToggleButton>
                              </ToggleButtonGroup>
                            </Grid>
                            
                            {deliveryMethod === 'certified' && (
                              <>
                                <Grid item xs={12}>
                                  <Typography variant="subtitle2" gutterBottom>
                                    Certified Mail Options
                                  </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                  <FormGroup>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={certifiedOptions.returnReceipt}
                                          onChange={(e) => setCertifiedOptions({
                                            ...certifiedOptions,
                                            returnReceipt: e.target.checked
                                          })}
                                        />
                                      }
                                      label="Return Receipt Requested"
                                    />
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={certifiedOptions.signatureRequired}
                                          onChange={(e) => setCertifiedOptions({
                                            ...certifiedOptions,
                                            signatureRequired: e.target.checked
                                          })}
                                        />
                                      }
                                      label="Signature Required"
                                    />
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={certifiedOptions.restrictedDelivery}
                                          onChange={(e) => setCertifiedOptions({
                                            ...certifiedOptions,
                                            restrictedDelivery: e.target.checked
                                          })}
                                        />
                                      }
                                      label="Restricted Delivery"
                                    />
                                  </FormGroup>
                                </Grid>
                              </>
                            )}
                            
                            {deliveryMethod === 'fax' && (
                              <Grid item xs={12}>
                                <TextField
                                  label="Fax Number"
                                  value={faxNumber}
                                  onChange={(e) => setFaxNumber(e.target.value)}
                                  fullWidth
                                  placeholder="1-800-555-0123"
                                />
                              </Grid>
                            )}
                            
                            {deliveryMethod === 'email' && (
                              <>
                                <Grid item xs={12} md={6}>
                                  <TextField
                                    label="To Email"
                                    value={emailSettings.to}
                                    onChange={(e) => setEmailSettings({
                                      ...emailSettings,
                                      to: e.target.value
                                    })}
                                    fullWidth
                                  />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                  <TextField
                                    label="CC Email"
                                    value={emailSettings.cc}
                                    onChange={(e) => setEmailSettings({
                                      ...emailSettings,
                                      cc: e.target.value
                                    })}
                                    fullWidth
                                  />
                                </Grid>
                                <Grid item xs={12}>
                                  <TextField
                                    label="Subject"
                                    value={emailSettings.subject}
                                    onChange={(e) => setEmailSettings({
                                      ...emailSettings,
                                      subject: e.target.value
                                    })}
                                    fullWidth
                                  />
                                </Grid>
                              </>
                            )}
                          </Grid>
                        </AccordionDetails>
                      </Accordion>
                      
                      {/* Action Buttons */}
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Button onClick={() => setActiveStep(2)} startIcon={<ArrowLeft />}>
                          Back
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={editingLetter ? <Save /> : <Edit3 />}
                          onClick={() => setEditingLetter(!editingLetter)}
                        >
                          {editingLetter ? 'Save Edits' : 'Edit Letter'}
                        </Button>
                        <Button
                          variant="contained"
                          startIcon={<Save />}
                          onClick={handleSaveLetter}
                          disabled={loading || !letterContent}
                        >
                          Save to Database
                        </Button>
                        <Button
                          variant="contained"
                          color="success"
                          startIcon={<Download />}
                          onClick={() => handleExportPDF()}
                          disabled={!letterContent}
                        >
                          Export PDF
                        </Button>
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<Send />}
                          onClick={handleSendLetter}
                          disabled={!letterContent || loading}
                        >
                          Send via {deliveryMethod}
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<Printer />}
                          onClick={() => window.print()}
                          disabled={!letterContent}
                        >
                          Print
                        </Button>
                      </Box>
                    </StepContent>
                  </Step>
                </Stepper>
              </Box>
            )}

            {/* Templates Tab */}
            {activeTab === 1 && (
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography variant="h5">Letter Templates Library</Typography>
                  <Box display="flex" gap={1}>
                    <TextField
                      placeholder="Search templates..."
                      size="small"
                      InputProps={{
                        startAdornment: <Search size={16} style={{ marginRight: 8 }} />
                      }}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Button
                      variant="contained"
                      startIcon={<Plus />}
                      onClick={() => setShowTemplateCreator(true)}
                    >
                      Create Template
                    </Button>
                  </Box>
                </Box>
                
                {/* Template Categories */}
                <Tabs value={filterCategory} onChange={(e, v) => setFilterCategory(v)} sx={{ mb: 2 }}>
                  <Tab label="All" value="all" />
                  <Tab label="Bureau" value="bureau" />
                  <Tab label="Creditor" value="creditor" />
                  <Tab label="Collector" value="collector" />
                  <Tab label="Custom" value="custom" />
                </Tabs>
                
                <Grid container spacing={2}>
                  {templates
                    .filter(t => 
                      (filterCategory === 'all' || t.category === filterCategory) &&
                      (searchTerm === '' || t.name.toLowerCase().includes(searchTerm.toLowerCase()))
                    )
                    .map((template) => (
                    <Grid item xs={12} md={6} lg={4} key={template.id}>
                      <Card>
                        <CardContent>
                          <Box display="flex" justifyContent="space-between" alignItems="start">
                            <Typography variant="h6" gutterBottom>
                              {template.name}
                            </Typography>
                            <IconButton size="small" onClick={() => handleDeleteTemplate(template.id)}>
                              <Trash2 size={16} />
                            </IconButton>
                          </Box>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            Category: {template.category} | Type: {template.type || 'General'}
                          </Typography>
                          
                          <Box display="flex" gap={0.5} flexWrap="wrap" mb={1}>
                            {template.successRate && (
                              <Chip
                                label={`${template.successRate}% Success`}
                                size="small"
                                color={template.successRate > 70 ? 'success' : 'warning'}
                                icon={<Trophy size={14} />}
                              />
                            )}
                            {template.aiOptimized && (
                              <Chip
                                icon={<Brain size={14} />}
                                label="AI Optimized"
                                size="small"
                                color="primary"
                              />
                            )}
                            {template.usageCount && (
                              <Chip
                                label={`Used ${template.usageCount} times`}
                                size="small"
                                variant="outlined"
                              />
                            )}
                          </Box>
                          
                          {template.legalCitations && template.legalCitations.length > 0 && (
                            <Typography variant="caption" display="block" sx={{ mb: 1 }}>
                              Legal: {template.legalCitations.join(', ')}
                            </Typography>
                          )}
                          
                          {template.tags && (
                            <Box>
                              {template.tags.map(tag => (
                                <Chip 
                                  key={tag} 
                                  label={tag} 
                                  size="small" 
                                  sx={{ mr: 0.5, mb: 0.5 }} 
                                />
                              ))}
                            </Box>
                          )}
                        </CardContent>
                        <CardActions>
                          <Button 
                            size="small" 
                            startIcon={<Eye />}
                            onClick={() => handlePreviewLetter(template)}
                          >
                            Preview
                          </Button>
                          <Button 
                            size="small" 
                            startIcon={<Edit3 />}
                            onClick={() => handleEditTemplate(template)}
                          >
                            Edit
                          </Button>
                          <Button 
                            size="small" 
                            startIcon={<Copy />}
                            onClick={() => {
                              setSelectedTemplate(template);
                              setActiveTab(0);
                            }}
                          >
                            Use
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* Saved Letters Tab */}
            {activeTab === 2 && (
              <Box>
                <Typography variant="h5" gutterBottom>Saved Letters</Typography>
                
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Client</TableCell>
                        <TableCell>Bureau</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Created</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>AI Score</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {savedLetters.map((letter) => (
                        <TableRow key={letter.id}>
                          <TableCell>{letter.clientName}</TableCell>
                          <TableCell>{letter.bureau}</TableCell>
                          <TableCell>{letter.disputeType}</TableCell>
                          <TableCell>
                            {letter.createdDate || new Date(letter.createdAt?.seconds * 1000).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={letter.status} 
                              size="small"
                              color={
                                letter.status === 'sent' ? 'primary' :
                                letter.status === 'responded' ? 'success' :
                                'default'
                              }
                            />
                          </TableCell>
                          <TableCell>
                            {letter.aiScore > 0 && (
                              <Chip 
                                label={`${letter.aiScore}%`} 
                                size="small"
                                color={letter.aiScore > 70 ? 'success' : 'warning'}
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            <IconButton size="small" onClick={() => handlePreviewLetter(letter)}>
                              <Eye size={16} />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleExportPDF(letter)}>
                              <Download size={16} />
                            </IconButton>
                            <IconButton size="small">
                              <Send size={16} />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                {savedLetters.length === 0 && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    No saved letters yet. Create your first dispute letter to get started!
                  </Alert>
                )}
              </Box>
            )}

            {/* AI Assistant Tab */}
            {activeTab === 3 && (
              <Box>
                <Typography variant="h5" gutterBottom>
                  AI Dispute Assistant - Mega Features
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          <Brain /> AI Capabilities
                        </Typography>
                        <List>
                          <ListItem>
                            <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                            <ListItemText 
                              primary="Smart Template Selection"
                              secondary="AI selects best template based on dispute type and history"
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                            <ListItemText 
                              primary="Legal Citation Insertion"
                              secondary="Automatically adds FCRA, FDCPA, FCBA citations"
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                            <ListItemText 
                              primary="Success Prediction"
                              secondary="Predicts dispute success rate based on patterns"
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                            <ListItemText 
                              primary="Response Analysis"
                              secondary="Analyzes bureau responses and suggests next steps"
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                            <ListItemText 
                              primary="Batch Processing"
                              secondary="Generate multiple letters simultaneously"
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                            <ListItemText 
                              primary="Timing Optimization"
                              secondary="Suggests best days/times to send disputes"
                            />
                          </ListItem>
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          <Workflow /> Automation Features
                        </Typography>
                        <List>
                          <ListItem>
                            <ListItemIcon><Bot /></ListItemIcon>
                            <ListItemText 
                              primary="Auto Follow-up"
                              secondary="Automatically generates follow-up letters"
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon><Bot /></ListItemIcon>
                            <ListItemText 
                              primary="Response Tracking"
                              secondary="Monitors and alerts for bureau responses"
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon><Bot /></ListItemIcon>
                            <ListItemText 
                              primary="Escalation Logic"
                              secondary="Automatically escalates unresolved disputes"
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon><Bot /></ListItemIcon>
                            <ListItemText 
                              primary="Document Management"
                              secondary="Auto-attaches supporting documents"
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon><Bot /></ListItemIcon>
                            <ListItemText 
                              primary="Client Updates"
                              secondary="Automatic status updates to clients"
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon><Bot /></ListItemIcon>
                            <ListItemText 
                              primary="Compliance Monitoring"
                              secondary="Ensures all letters meet legal requirements"
                            />
                          </ListItem>
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          <Gauge /> Performance Metrics
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={6} md={3}>
                            <Box textAlign="center">
                              <Typography variant="h3" color="primary">
                                {metrics.successRate}%
                              </Typography>
                              <Typography variant="body2">Success Rate</Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6} md={3}>
                            <Box textAlign="center">
                              <Typography variant="h3" color="secondary">
                                {metrics.avgResponseTime}
                              </Typography>
                              <Typography variant="body2">Avg Response Days</Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6} md={3}>
                            <Box textAlign="center">
                              <Typography variant="h3" color="success">
                                {metrics.totalDisputes}
                              </Typography>
                              <Typography variant="body2">Total Disputes</Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6} md={3}>
                            <Box textAlign="center">
                              <Typography variant="h3" color="warning">
                                {metrics.pendingResponses}
                              </Typography>
                              <Typography variant="body2">Pending</Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Response Tracking Tab */}
            {activeTab === 4 && (
              <Box>
                <Typography variant="h5" gutterBottom>Response Tracking</Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <AlertTitle>AI-Powered Response Monitoring</AlertTitle>
                  System automatically tracks bureau responses, analyzes outcomes, and suggests next actions.
                </Alert>
                
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Letter ID</TableCell>
                        <TableCell>Client</TableCell>
                        <TableCell>Sent Date</TableCell>
                        <TableCell>Expected Response</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>AI Analysis</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {savedLetters
                        .filter(l => l.status === 'sent')
                        .map(letter => (
                        <TableRow key={letter.id}>
                          <TableCell>{letter.id.slice(-6)}</TableCell>
                          <TableCell>{letter.clientName}</TableCell>
                          <TableCell>{letter.sentDate || 'N/A'}</TableCell>
                          <TableCell>{letter.expectedResponseDate || 'N/A'}</TableCell>
                          <TableCell>
                            <Chip 
                              label={letter.responseReceived ? 'Received' : 'Waiting'}
                              color={letter.responseReceived ? 'success' : 'warning'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {letter.responseAnalysis ? (
                              <Chip label="Analyzed" size="small" />
                            ) : (
                              <Button size="small" onClick={() => analyzeResponse(letter)}>
                                Analyze
                              </Button>
                            )}
                          </TableCell>
                          <TableCell>
                            <IconButton size="small">
                              <Eye size={16} />
                            </IconButton>
                            <IconButton size="small">
                              <RefreshCw size={16} />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {/* Analytics Tab */}
            {activeTab === 5 && (
              <Box>
                <Typography variant="h5" gutterBottom>Analytics Dashboard</Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>Success by Bureau</Typography>
                        <List>
                          <ListItem>
                            <ListItemText primary="Equifax" secondary="82% success rate" />
                          </ListItem>
                          <ListItem>
                            <ListItemText primary="Experian" secondary="78% success rate" />
                          </ListItem>
                          <ListItem>
                            <ListItemText primary="TransUnion" secondary="75% success rate" />
                          </ListItem>
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>Top Dispute Reasons</Typography>
                        <List>
                          <ListItem>
                            <ListItemText primary="Not Mine" secondary="45 disputes" />
                          </ListItem>
                          <ListItem>
                            <ListItemText primary="Incorrect Balance" secondary="32 disputes" />
                          </ListItem>
                          <ListItem>
                            <ListItemText primary="Identity Theft" secondary="28 disputes" />
                          </ListItem>
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>Monthly Trends</Typography>
                        <List>
                          <ListItem>
                            <ListItemText primary="January" secondary="124 disputes filed" />
                          </ListItem>
                          <ListItem>
                            <ListItemText primary="February" secondary="98 disputes filed" />
                          </ListItem>
                          <ListItem>
                            <ListItemText primary="March" secondary="Projected: 145 disputes" />
                          </ListItem>
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Instructions Tab */}
            {activeTab === 6 && (
              <Box>
                <Typography variant="h5" gutterBottom>
                  <BookOpen /> Complete Training & Instructions
                </Typography>
                
                <Alert severity="success" sx={{ mb: 2 }}>
                  <AlertTitle>Welcome to the Dispute Letters System!</AlertTitle>
                  This comprehensive guide will help you master every feature.
                </Alert>
                
                <Accordion defaultExpanded>
                  <AccordionSummary expandIcon={<ChevronDown />}>
                    <Typography variant="h6">🚀 Quick Start Guide</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography component="div">
                      <h4>Step 1: Select or Add Contact</h4>
                      <ul>
                        <li>Choose from existing clients in dropdown (pulls from your Contacts)</li>
                        <li>Select "Manual Entry" to add new client</li>
                        <li>Enter ZIP code first - city/state auto-fill!</li>
                        <li>All client data saves automatically</li>
                      </ul>
                      
                      <h4>Step 2: Enter Dispute Details</h4>
                      <ul>
                        <li>Select bureau (Equifax, Experian, TransUnion, or All)</li>
                        <li>Choose dispute type (Initial, MOV, Goodwill, etc.)</li>
                        <li>Enter creditor and account details</li>
                        <li>Select dispute reason from dropdown</li>
                        <li>Add custom details if needed</li>
                      </ul>
                      
                      <h4>Step 3: Template & AI Selection</h4>
                      <ul>
                        <li>Browse templates with success rates</li>
                        <li>Look for AI-optimized badges</li>
                        <li>Preview templates before selection</li>
                        <li>Enable AI enhancement for better results</li>
                        <li>Choose strategy level (Conservative/Moderate/Aggressive)</li>
                      </ul>
                      
                      <h4>Step 4: Generate & Send</h4>
                      <ul>
                        <li>AI generates optimized letter</li>
                        <li>Edit if needed</li>
                        <li>Choose delivery method (Mail, Fax, Email, Certified)</li>
                        <li>Export PDF or send directly</li>
                        <li>Track all correspondence</li>
                      </ul>
                    </Typography>
                  </AccordionDetails>
                </Accordion>
                
                <Accordion>
                  <AccordionSummary expandIcon={<ChevronDown />}>
                    <Typography variant="h6">🤖 AI Features Explained</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography component="div">
                      <h4>AI Strategy Levels:</h4>
                      <ul>
                        <li><strong>Conservative (65-70% success):</strong> Safe approach, heavy compliance focus</li>
                        <li><strong>Moderate (70-80% success):</strong> Balanced effectiveness and caution</li>
                        <li><strong>Aggressive (75-85% success):</strong> Maximum legal pressure</li>
                      </ul>
                      
                      <h4>AI Optimizations:</h4>
                      <ul>
                        <li>Automatic legal citation insertion (FCRA, FDCPA, FCBA)</li>
                        <li>Bureau-specific formatting</li>
                        <li>Success pattern matching from database</li>
                        <li>Optimal timing recommendations</li>
                        <li>Response prediction and analysis</li>
                      </ul>
                      
                      <h4>Automation Features:</h4>
                      <ul>
                        <li>Auto follow-up generation</li>
                        <li>Response deadline tracking</li>
                        <li>Escalation suggestions</li>
                        <li>Client update automation</li>
                      </ul>
                    </Typography>
                  </AccordionDetails>
                </Accordion>
                
                <Accordion>
                  <AccordionSummary expandIcon={<ChevronDown />}>
                    <Typography variant="h6">📨 Delivery Methods</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography component="div">
                      <h4>Regular Mail:</h4>
                      <ul>
                        <li>Standard postal delivery</li>
                        <li>Print PDF and mail yourself</li>
                        <li>Tracking number optional</li>
                      </ul>
                      
                      <h4>Certified Mail:</h4>
                      <ul>
                        <li>Proof of delivery</li>
                        <li>Return receipt available</li>
                        <li>Signature confirmation</li>
                        <li>Best for legal disputes</li>
                      </ul>
                      
                      <h4>Fax Delivery:</h4>
                      <ul>
                        <li>Instant transmission</li>
                        <li>Confirmation page provided</li>
                        <li>Good for urgent disputes</li>
                      </ul>
                      
                      <h4>Email Delivery:</h4>
                      <ul>
                        <li>PDF attachment</li>
                        <li>Read receipts available</li>
                        <li>Fastest delivery method</li>
                      </ul>
                      
                      <h4>Portal Upload:</h4>
                      <ul>
                        <li>Direct to bureau websites</li>
                        <li>Instant confirmation</li>
                        <li>No mailing costs</li>
                      </ul>
                    </Typography>
                  </AccordionDetails>
                </Accordion>
                
                <Accordion>
                  <AccordionSummary expandIcon={<ChevronDown />}>
                    <Typography variant="h6">⚖️ Legal Compliance</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography component="div">
                      <h4>Key Laws:</h4>
                      <ul>
                        <li><strong>FCRA Section 611:</strong> Right to dispute inaccurate information</li>
                        <li><strong>30-day requirement:</strong> Bureaus must investigate within 30 days</li>
                        <li><strong>FDCPA:</strong> Protection from collector harassment</li>
                        <li><strong>FCBA:</strong> Billing error dispute rights</li>
                      </ul>
                      
                      <h4>Required Elements:</h4>
                      <ul>
                        <li>Full legal name</li>
                        <li>Complete address</li>
                        <li>Specific disputed items</li>
                        <li>Clear dispute reason</li>
                        <li>Request for action</li>
                        <li>Response deadline</li>
                      </ul>
                    </Typography>
                  </AccordionDetails>
                </Accordion>
                
                <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    <Download /> Resources & Support
                  </Typography>
                  <Stack direction="row" spacing={2} flexWrap="wrap">
                    <Button 
                      variant="outlined" 
                      startIcon={<FileText />}
                      onClick={() => window.open('/dispute-letters-guide.pdf', '_blank')}
                    >
                      Download PDF Guide
                    </Button>
                    <Button 
                      variant="outlined" 
                      startIcon={<Video />}
                      onClick={() => window.open('https://youtube.com/watch?v=training', '_blank')}
                    >
                      Watch Training Video
                    </Button>
                    <Button 
                      variant="outlined" 
                      startIcon={<MessageSquare />}
                      onClick={() => navigate('/support')}
                    >
                      Contact Support
                    </Button>
                  </Stack>
                </Box>
              </Box>
            )}
          </Paper>
        </Box>

        {/* Dialogs */}
        
        {/* Template Creator/Editor Dialog */}
        <Dialog
          open={showTemplateCreator}
          onClose={() => setShowTemplateCreator(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {selectedTemplate ? 'Edit Template' : 'Create New Template'}
          </DialogTitle>
          <DialogContent>
            <TemplateCreator 
              template={selectedTemplate}
              onSave={async (templateData) => {
                try {
                  if (selectedTemplate) {
                    // Update existing
                    await updateDoc(doc(db, 'disputeTemplates', selectedTemplate.id), {
                      ...templateData,
                      updatedAt: serverTimestamp()
                    });
                    setTemplates(prev => prev.map(t => 
                      t.id === selectedTemplate.id ? { ...t, ...templateData } : t
                    ));
                  } else {
                    // Create new
                    const docRef = await addDoc(collection(db, 'disputeTemplates'), {
                      ...templateData,
                      createdAt: serverTimestamp(),
                      userId: currentUser.uid
                    });
                    setTemplates(prev => [...prev, { id: docRef.id, ...templateData }]);
                  }
                  setShowTemplateCreator(false);
                  setSelectedTemplate(null);
                  setSnackbar({ 
                    open: true, 
                    message: 'Template saved successfully!', 
                    severity: 'success' 
                  });
                } catch (error) {
                  console.error('Error saving template:', error);
                  setSnackbar({ 
                    open: true, 
                    message: 'Error saving template', 
                    severity: 'error' 
                  });
                }
              }}
            />
          </DialogContent>
        </Dialog>

        {/* Letter Preview Dialog */}
        <Dialog
          open={previewMode}
          onClose={() => setPreviewMode(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Letter Preview</DialogTitle>
          <DialogContent>
            <Paper sx={{ p: 2 }}>
              <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                {selectedLetter?.content || selectedTemplate?.content || 'No content to preview'}
              </pre>
            </Paper>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPreviewMode(false)}>Close</Button>
            <Button variant="contained" onClick={() => handleExportPDF(selectedLetter)}>
              Export PDF
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            severity={snackbar.severity} 
            onClose={() => setSnackbar({ ...snackbar, open: false })}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

        {/* Speed Dial for quick actions */}
        <SpeedDial
          ariaLabel="Quick actions"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          icon={<SpeedDialIcon />}
        >
          <SpeedDialAction
            icon={<Plus />}
            tooltipTitle="New Letter"
            onClick={() => {
              resetForm();
              setActiveTab(0);
            }}
          />
          <SpeedDialAction
            icon={<Brain />}
            tooltipTitle="AI Assistant"
            onClick={() => setActiveTab(3)}
          />
          <SpeedDialAction
            icon={<Download />}
            tooltipTitle="Export All"
            onClick={() => {
              // Export all letters
            }}
          />
        </SpeedDial>
      </Container>
    </LocalizationProvider>
  );
};

// Template Creator Component
const TemplateCreator = ({ template, onSave }) => {
  const [templateData, setTemplateData] = useState({
    name: template?.name || '',
    category: template?.category || 'bureau',
    type: template?.type || 'general',
    content: template?.content || '',
    variables: template?.variables || [],
    aiOptimized: template?.aiOptimized || false,
    tags: template?.tags || [],
    legalCitations: template?.legalCitations || [],
    requiredDocs: template?.requiredDocs || []
  });
  
  const [newTag, setNewTag] = useState('');

  const handleSave = () => {
    if (!templateData.name || !templateData.content) {
      alert('Please provide template name and content');
      return;
    }
    onSave(templateData);
  };

  const addTag = () => {
    if (newTag && !templateData.tags.includes(newTag)) {
      setTemplateData({ ...templateData, tags: [...templateData.tags, newTag] });
      setNewTag('');
    }
  };

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            label="Template Name"
            value={templateData.name}
            onChange={(e) => setTemplateData({ ...templateData, name: e.target.value })}
            fullWidth
            required
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={templateData.category}
              onChange={(e) => setTemplateData({ ...templateData, category: e.target.value })}
              label="Category"
            >
              <MenuItem value="bureau">Credit Bureau</MenuItem>
              <MenuItem value="creditor">Creditor</MenuItem>
              <MenuItem value="collector">Debt Collector</MenuItem>
              <MenuItem value="custom">Custom</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select
              value={templateData.type}
              onChange={(e) => setTemplateData({ ...templateData, type: e.target.value })}
              label="Type"
            >
              <MenuItem value="general">General</MenuItem>
              <MenuItem value="initial">Initial Dispute</MenuItem>
              <MenuItem value="mov">Method of Verification</MenuItem>
              <MenuItem value="goodwill">Goodwill</MenuItem>
              <MenuItem value="validation">Validation</MenuItem>
              <MenuItem value="identity_theft">Identity Theft</MenuItem>
              <MenuItem value="cease_desist">Cease & Desist</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Template Content"
            value={templateData.content}
            onChange={(e) => setTemplateData({ ...templateData, content: e.target.value })}
            multiline
            rows={15}
            fullWidth
            required
            helperText="Use [variableName] for dynamic content (e.g., [Client Name], [Account Number])"
          />
        </Grid>
        <Grid item xs={12}>
          <Box display="flex" gap={1} alignItems="center">
            <TextField
              label="Add Tag"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              size="small"
              onKeyPress={(e) => e.key === 'Enter' && addTag()}
            />
            <Button onClick={addTag} size="small">Add</Button>
          </Box>
          <Box sx={{ mt: 1 }}>
            {templateData.tags.map((tag, idx) => (
              <Chip 
                key={idx} 
                label={tag} 
                onDelete={() => setTemplateData({
                  ...templateData,
                  tags: templateData.tags.filter((_, i) => i !== idx)
                })}
                sx={{ mr: 0.5, mb: 0.5 }}
              />
            ))}
          </Box>
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={templateData.aiOptimized}
                onChange={(e) => setTemplateData({ ...templateData, aiOptimized: e.target.checked })}
              />
            }
            label="Enable AI Optimization"
          />
        </Grid>
      </Grid>
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <Button onClick={handleSave} variant="contained">
          Save Template
        </Button>
      </Box>
    </Box>
  );
};

export default DisputeLetters;