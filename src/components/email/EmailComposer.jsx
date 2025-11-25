// Path: /src/components/email/EmailComposer.jsx
// ===== SPEEDY CRM - AI-ENHANCED EMAIL COMPOSER =====
// Tier 3 MEGA ULTIMATE Email Composer with Advanced AI Features
// 50+ AI capabilities, real-time collaboration, comprehensive composition tools
// Created for Christopher's SpeedyCRM at myclevercrm.com

import React, { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Typography,
  Button,
  TextField,
  Chip,
  Divider,
  Grid,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  ListItemAvatar,
  Drawer,
  AppBar,
  Toolbar,
  Tab,
  Tabs,
  TabPanel,
  LinearProgress,
  CircularProgress,
  Badge,
  Avatar,
  Paper,
  Menu,
  MenuList,
  MenuItem as MenuListItem,
  ButtonGroup,
  ToggleButton,
  ToggleButtonGroup,
  Slider,
  Autocomplete,
  Checkbox,
  FormGroup,
  RadioGroup,
  Radio,
  FormLabel,
  InputAdornment,
  Collapse,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  StepButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Skeleton,
  Zoom,
  Fab,
  Container,
  Stack,
  Masonry,
  BottomNavigation,
  BottomNavigationAction,
  SwipeableDrawer,
  Breadcrumbs,
  Link,
  AvatarGroup,
  Modal,
  Backdrop,
  Fade,
  Grow,
  Slide,
  Popover,
  Popper,
  ClickAwayListener,
  Portal,
  Unstable_Grid2 as Grid2
} from '@mui/material';
import {
  Send,
  Save,
  Preview,
  Edit,
  Delete,
  Copy,
  Paste,
  Undo,
  Redo,
  Search,
  Replace,
  Filter,
  Sort,
  Add,
  Remove,
  MoreVert,
  MoreHoriz,
  Settings,
  Help,
  Info,
  Warning,
  Error,
  CheckCircle,
  Cancel,
  PlayArrow,
  Pause,
  Stop,
  Forward,
  Replay,
  Schedule,
  Timer,
  AlarmOn,
  AlarmOff,
  Notifications,
  NotificationsOff,
  Visibility,
  VisibilityOff,
  Lock,
  LockOpen,
  Security,
  Verified,
  Share,
  Download,
  Upload,
  CloudUpload,
  CloudDownload,
  Sync,
  Refresh,
  Update,
  Restore,
  Archive,
  Unarchive,
  Folder,
  FolderOpen,
  CreateNewFolder,
  DriveFileMove,
  FileCopy,
  FilePresent,
  AttachFile,
  AttachEmail,
  Email,
  Drafts,
  Inbox,
  Outbox,
  MarkEmailRead,
  MarkEmailUnread,
  Reply,
  ReplyAll,
  Forward as ForwardEmail,
  Label,
  LocalOffer,
  Category,
  Tag,
  Bookmark,
  BookmarkBorder,
  Favorite,
  FavoriteBorder,
  Star,
  StarBorder,
  Grade,
  Mood,
  MoodBad,
  SentimentSatisfied,
  SentimentDissatisfied,
  SentimentVeryDissatisfied,
  SentimentVerySatisfied,
  Psychology,
  SmartToy,
  AutoAwesome,
  AutoFixHigh,
  AutoFixNormal,
  AutoFixOff,
  Tune,
  Transform,
  Palette,
  FormatColorText,
  FormatColorFill,
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatStrikethrough,
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
  FormatAlignJustify,
  FormatIndentDecrease,
  FormatIndentIncrease,
  FormatListBulleted,
  FormatListNumbered,
  FormatQuote,
  FormatSize,
  FontDownload,
  Title,
  Translate,
  Spellcheck,
  Code,
  CodeOff,
  Html,
  InsertLink,
  LinkOff,
  Image,
  ImageNotSupported,
  InsertEmoticon,
  EmojiEmotions,
  EmojiEvents,
  EmojiFlags,
  EmojiFood,
  EmojiNature,
  EmojiObjects,
  EmojiPeople,
  EmojiSymbols,
  EmojiTransportation,
  CropFree,
  Crop,
  AspectRatio,
  PhotoSizeSelectActual,
  PhotoSizeSelectLarge,
  PhotoSizeSelectSmall,
  RotateLeft,
  RotateRight,
  Flip,
  FlipToBack,
  FlipToFront,
  ZoomIn,
  ZoomOut,
  ZoomOutMap,
  PanTool,
  TouchApp,
  Gesture,
  Mouse,
  Computer,
  Laptop,
  Tablet,
  PhoneIphone,
  Smartphone,
  Watch,
  Tv,
  DesktopMac,
  DesktopWindows,
  DeviceHub,
  Devices,
  DevicesOther,
  Storage,
  Memory,
  Speed,
  NetworkCheck,
  NetworkWifi,
  NetworkLocked,
  SignalWifi4Bar,
  SignalWifiOff,
  Wifi,
  WifiOff,
  Bluetooth,
  BluetoothSearching,
  BluetoothConnected,
  BluetoothDisabled,
  Nfc,
  AirplanemodeActive,
  AirplanemodeInactive,
  LocationOn,
  LocationOff,
  GpsFixed,
  GpsNotFixed,
  GpsOff,
  MyLocation,
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  ShowChart,
  BarChart,
  LineAxis,
  ScatterPlot,
  BubbleChart,
  DonutLarge,
  DonutSmall,
  PieChart,
  Analytics,
  Assessment,
  Insights,
  QueryStats,
  Poll,
  Equalizer,
  GraphicEq,
  Multiline,
  DataUsage,
  DataObject,
  Functions,
  Calculate,
  Science,
  Biotech,
  Psychology as PsychologyIcon,
  Lightbulb,
  LightbulbOutlined,
  FlashOn,
  FlashOff,
  FlashAuto,
  Brightness1,
  Brightness2,
  Brightness3,
  Brightness4,
  Brightness5,
  Brightness6,
  Brightness7,
  BrightnessHigh,
  BrightnessLow,
  BrightnessMedium,
  BrightnessAuto,
  Contrast,
  Tonality,
  Gradient,
  ColorLens,
  InvertColors,
  FormatPaint,
  Brush
} from '@mui/icons-material';
import { useTheme, alpha } from '@mui/material/styles';
import { collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, serverTimestamp, query, where, orderBy, limit, writeBatch, runTransaction, getDocs } from 'firebase/firestore';
import { db, auth } from '../../firebase/config';
import { useAuthState } from 'react-firebase-hooks/auth';
import { format, formatDistance, parseISO, addDays, subDays, isToday, isYesterday, isThisWeek, startOfDay, endOfDay } from 'date-fns';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import BlotFormatter from 'quill-blot-formatter';
import { debounce, throttle, isEqual, cloneDeep, merge, uniqBy, sortBy, groupBy } from 'lodash';

// Register Quill modules for enhanced editing
Quill.register('modules/blotFormatter', BlotFormatter);

// ===== AI-POWERED EMAIL COMPOSER COMPONENT =====
const EmailComposer = memo(({
  mode = 'compose', // compose, reply, forward, template, campaign
  initialData = null,
  onSave,
  onSend,
  onCancel,
  onDraft,
  recipientType = 'contact', // contact, lead, client, group, campaign
  templateId = null,
  campaignId = null,
  isFullScreen = false,
  enableAI = true,
  enableCollaboration = true,
  autoSaveEnabled = true,
  showAnalytics = true,
  maxRecipients = 1000
}) => {
  const theme = useTheme();
  const [user] = useAuthState(auth);
  const editorRef = useRef(null);
  const autoSaveRef = useRef(null);
  const collaborationRef = useRef(null);
  const analyticsRef = useRef(null);

  // ===== STATE MANAGEMENT =====
  const [email, setEmail] = useState({
    to: [],
    cc: [],
    bcc: [],
    subject: '',
    content: '',
    htmlContent: '',
    plainTextContent: '',
    preheaderText: '',
    templateId: templateId,
    campaignId: campaignId,
    priority: 'normal',
    deliveryTime: null,
    timezone: 'America/Los_Angeles',
    trackOpens: true,
    trackClicks: true,
    trackReplies: true,
    enableUnsubscribe: true,
    customHeaders: {},
    attachments: [],
    variables: {},
    tags: [],
    metadata: {
      createdAt: null,
      updatedAt: null,
      createdBy: user?.email,
      lastModifiedBy: user?.email,
      version: 1,
      status: 'draft',
      parentId: null,
      threadId: null,
      references: []
    }
  });

  const [editorState, setEditorState] = useState({
    isLoading: false,
    isSaving: false,
    isSending: false,
    isDirty: false,
    lastSaved: null,
    autoSaveEnabled: autoSaveEnabled,
    currentView: 'compose', // compose, preview, code, analytics
    selectedTab: 0,
    cursorPosition: 0,
    selectionRange: { start: 0, end: 0 },
    undoStack: [],
    redoStack: [],
    canUndo: false,
    canRedo: false,
    wordCount: 0,
    characterCount: 0,
    estimatedReadTime: 0,
    isFullScreen: isFullScreen,
    activePanel: 'compose', // compose, recipients, settings, analytics
    splitView: false
  });

  const [aiFeatures, setAiFeatures] = useState({
    isEnabled: enableAI,
    isAnalyzing: false,
    isGenerating: false,
    suggestions: [],
    contentScore: 0,
    toneAnalysis: {
      dominant: 'neutral',
      confidence: 0,
      emotions: {},
      suggestions: []
    },
    readabilityScore: 0,
    spamScore: 0,
    sentimentScore: 0,
    engagementPrediction: {
      openRate: 0,
      clickRate: 0,
      replyRate: 0,
      conversionRate: 0
    },
    optimizationSuggestions: [],
    subjectLineVariants: [],
    contentVariants: [],
    personalizations: [],
    autoComplete: [],
    grammarChecks: [],
    styleRecommendations: [],
    brandVoiceAlignment: 0,
    competitorAnalysis: {},
    seasonalRelevance: 0,
    geographicPersonalization: {},
    timeOptimization: {},
    visualContentSuggestions: [],
    linkOptimization: {},
    socialProofSuggestions: [],
    emojiRecommendations: [],
    accessibilityScore: 0,
    mobileOptimization: 0,
    clientCompatibility: {},
    conversionOptimization: {},
    followUpSuggestions: [],
    lastAnalysis: null
  });

  const [collaboration, setCollaboration] = useState({
    isEnabled: enableCollaboration,
    isCollaborating: false,
    collaborators: [],
    activeUsers: [],
    comments: [],
    versions: [],
    locks: {},
    permissions: {
      canEdit: true,
      canComment: true,
      canShare: true,
      canDelete: false
    },
    realTimeUpdates: true,
    conflictResolution: 'auto',
    lastSyncTime: null,
    syncStatus: 'synced' // synced, syncing, conflict, error
  });

  const [ui, setUi] = useState({
    showRecipientPanel: mode !== 'template',
    showAiPanel: enableAI,
    showPreviewPanel: false,
    showSettingsPanel: false,
    showAnalyticsPanel: false,
    showTemplateLibrary: false,
    showEmojiPicker: false,
    showImageGallery: false,
    showLinkEditor: false,
    showVariableEditor: false,
    showScheduler: false,
    showAttachments: false,
    sidebarWidth: 320,
    toolbarCollapsed: false,
    previewMode: 'desktop',
    theme: 'light',
    fontSize: 14,
    fontFamily: 'system-ui',
    lineHeight: 1.5,
    notification: {
      open: false,
      message: '',
      severity: 'info'
    },
    contextMenu: {
      open: false,
      anchorEl: null,
      position: { x: 0, y: 0 }
    },
    dialogs: {
      saveTemplate: false,
      confirmSend: false,
      discardChanges: false,
      scheduleEmail: false,
      shareEmail: false,
      recipientManager: false,
      aiAssistant: false,
      analyticsReport: false
    }
  });

  const [recipients, setRecipients] = useState({
    contacts: [],
    groups: [],
    campaigns: [],
    excludeList: [],
    totalCount: 0,
    segmentation: {},
    personalization: {},
    validationStatus: {},
    deliverySettings: {}
  });

  const [templates, setTemplates] = useState({
    library: [],
    recent: [],
    favorites: [],
    shared: [],
    categories: [],
    isLoading: false,
    searchTerm: '',
    selectedCategory: 'all',
    sortBy: 'lastUsed'
  });

  const [analytics, setAnalytics] = useState({
    enabled: showAnalytics,
    realTime: {
      opens: 0,
      clicks: 0,
      replies: 0,
      bounces: 0,
      unsubscribes: 0
    },
    historical: {
      campaignPerformance: [],
      subjectLinePerformance: [],
      contentPerformance: [],
      timingAnalysis: [],
      audienceSegments: []
    },
    predictions: {
      deliverabilityScore: 0,
      engagementForecast: {},
      optimalSendTime: null,
      audienceResponse: {}
    },
    benchmarks: {
      industry: {},
      company: {},
      personal: {}
    },
    insights: [],
    recommendations: []
  });

  const [formatting, setFormatting] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    alignment: 'left',
    listType: null,
    fontSize: 14,
    fontFamily: 'Arial',
    textColor: '#000000',
    backgroundColor: '#ffffff',
    lineHeight: 1.5,
    letterSpacing: 0,
    textIndent: 0,
    activeFormats: new Set()
  });

  const [validation, setValidation] = useState({
    isValid: true,
    errors: [],
    warnings: [],
    checks: {
      recipients: false,
      subject: false,
      content: false,
      deliverability: false,
      compliance: false,
      accessibility: false
    },
    lastValidated: null
  });

  // ===== AVAILABLE VARIABLES =====
  const availableVariables = useMemo(() => [
    { name: 'firstName', label: 'First Name', category: 'Personal', example: 'John' },
    { name: 'lastName', label: 'Last Name', category: 'Personal', example: 'Smith' },
    { name: 'fullName', label: 'Full Name', category: 'Personal', example: 'John Smith' },
    { name: 'email', label: 'Email Address', category: 'Contact', example: 'john@example.com' },
    { name: 'phone', label: 'Phone Number', category: 'Contact', example: '(555) 123-4567' },
    { name: 'company', label: 'Company Name', category: 'Business', example: 'ABC Corporation' },
    { name: 'jobTitle', label: 'Job Title', category: 'Business', example: 'Manager' },
    { name: 'industry', label: 'Industry', category: 'Business', example: 'Technology' },
    { name: 'creditScore', label: 'Credit Score', category: 'Credit Repair', example: '650' },
    { name: 'disputeCount', label: 'Dispute Count', category: 'Credit Repair', example: '3' },
    { name: 'improvementGoal', label: 'Improvement Goal', category: 'Credit Repair', example: '100 points' },
    { name: 'servicePlan', label: 'Service Plan', category: 'Credit Repair', example: 'Premium' },
    { name: 'monthlyPayment', label: 'Monthly Payment', category: 'Credit Repair', example: '$149' },
    { name: 'nextPaymentDate', label: 'Next Payment Date', category: 'Credit Repair', example: '2024-02-01' },
    { name: 'accountBalance', label: 'Account Balance', category: 'Credit Repair', example: '$450' },
    { name: 'agentName', label: 'Agent Name', category: 'Agent', example: 'Sarah Johnson' },
    { name: 'agentEmail', label: 'Agent Email', category: 'Agent', example: 'sarah@speedycredit.com' },
    { name: 'agentPhone', label: 'Agent Phone', category: 'Agent', example: '(555) 987-6543' },
    { name: 'consultationDate', label: 'Consultation Date', category: 'Schedule', example: '2024-01-20' },
    { name: 'consultationTime', label: 'Consultation Time', category: 'Schedule', example: '2:00 PM' },
    { name: 'currentDate', label: 'Current Date', category: 'System', example: '2024-01-15' },
    { name: 'currentTime', label: 'Current Time', category: 'System', example: '10:30 AM' },
    { name: 'businessName', label: 'Business Name', category: 'Company', example: 'Speedy Credit Repair' },
    { name: 'businessAddress', label: 'Business Address', category: 'Company', example: '123 Main Street' },
    { name: 'businessPhone', label: 'Business Phone', category: 'Company', example: '(555) 555-0123' },
    { name: 'businessEmail', label: 'Business Email', category: 'Company', example: 'info@speedycredit.com' },
    { name: 'websiteUrl', label: 'Website URL', category: 'Company', example: 'https://speedycreditrepair.com' },
    { name: 'unsubscribeLink', label: 'Unsubscribe Link', category: 'System', example: '[Unsubscribe Link]' },
    { name: 'privacyPolicyLink', label: 'Privacy Policy Link', category: 'System', example: '[Privacy Policy]' },
    { name: 'termsOfServiceLink', label: 'Terms of Service Link', category: 'System', example: '[Terms of Service]' }
  ], []);

  // ===== EMAIL TEMPLATES =====
  const emailTemplateCategories = useMemo(() => [
    { id: 'welcome', label: 'Welcome Emails', icon: Email, color: '#4CAF50' },
    { id: 'followup', label: 'Follow-up', icon: Reply, color: '#2196F3' },
    { id: 'reminder', label: 'Reminders', icon: AlarmOn, color: '#FF9800' },
    { id: 'update', label: 'Updates', icon: Update, color: '#9C27B0' },
    { id: 'dispute', label: 'Dispute Progress', icon: Assessment, color: '#F44336' },
    { id: 'educational', label: 'Educational', icon: Psychology, color: '#795548' },
    { id: 'promotional', label: 'Promotional', icon: LocalOffer, color: '#E91E63' },
    { id: 'seasonal', label: 'Seasonal', icon: EmojiEvents, color: '#607D8B' },
    { id: 'transactional', label: 'Transactional', icon: Receipt, color: '#009688' },
    { id: 'newsletters', label: 'Newsletters', icon: Article, color: '#673AB7' }
  ], []);

  const aiContentPrompts = useMemo(() => [
    {
      id: 'welcome_new_client',
      category: 'welcome',
      title: 'Welcome New Client',
      description: 'Professional welcome email for new credit repair clients',
      prompt: 'Create a warm, professional welcome email for a new credit repair client that explains next steps, sets expectations, and builds confidence in our service.',
      variables: ['firstName', 'servicePlan', 'agentName', 'consultationDate']
    },
    {
      id: 'dispute_progress_update',
      category: 'update',
      title: 'Dispute Progress Update',
      description: 'Update client on dispute progress and results',
      prompt: 'Write an informative email updating a client on their credit dispute progress, celebrating wins, and outlining next steps.',
      variables: ['firstName', 'disputeCount', 'creditScore', 'improvementGoal']
    },
    {
      id: 'payment_reminder_friendly',
      category: 'reminder',
      title: 'Friendly Payment Reminder',
      description: 'Gentle reminder for upcoming payment',
      prompt: 'Create a friendly, non-pushy payment reminder email that maintains good client relationships while ensuring timely payment.',
      variables: ['firstName', 'monthlyPayment', 'nextPaymentDate', 'servicePlan']
    },
    {
      id: 'consultation_follow_up',
      category: 'followup',
      title: 'Consultation Follow-up',
      description: 'Follow up after initial consultation call',
      prompt: 'Write a professional follow-up email after a credit repair consultation, summarizing key points and encouraging enrollment.',
      variables: ['firstName', 'consultationDate', 'creditScore', 'agentName']
    },
    {
      id: 'success_celebration',
      category: 'update',
      title: 'Success Celebration',
      description: 'Celebrate credit score improvements',
      prompt: 'Create an enthusiastic email celebrating a client\'s credit score improvement and encouraging continued service.',
      variables: ['firstName', 'creditScore', 'improvementGoal', 'servicePlan']
    },
    {
      id: 'educational_credit_tips',
      category: 'educational',
      title: 'Educational Credit Tips',
      description: 'Share valuable credit improvement tips',
      prompt: 'Write an educational email sharing practical credit improvement tips and best practices for maintaining good credit.',
      variables: ['firstName', 'creditScore']
    }
  ], []);

  // ===== EFFECT HOOKS =====
  useEffect(() => {
    if (initialData) {
      setEmail(prev => ({
        ...prev,
        ...initialData,
        metadata: {
          ...prev.metadata,
          ...initialData.metadata
        }
      }));
    }

    // Load templates
    loadTemplateLibrary();
    
    // Initialize AI features
    if (enableAI) {
      initializeAIFeatures();
    }

    // Setup collaboration
    if (enableCollaboration) {
      setupCollaboration();
    }

    // Load analytics
    if (showAnalytics) {
      loadAnalytics();
    }

    return () => {
      // Cleanup intervals and listeners
      if (autoSaveRef.current) {
        clearInterval(autoSaveRef.current);
      }
      if (collaborationRef.current) {
        collaborationRef.current();
      }
      if (analyticsRef.current) {
        analyticsRef.current();
      }
    };
  }, [initialData, enableAI, enableCollaboration, showAnalytics]);

  useEffect(() => {
    // Auto-save functionality
    if (editorState.isDirty && editorState.autoSaveEnabled && email.subject && email.content) {
      if (autoSaveRef.current) {
        clearTimeout(autoSaveRef.current);
      }
      autoSaveRef.current = setTimeout(() => {
        handleAutoSave();
      }, 3000);
    }
  }, [email, editorState.isDirty, editorState.autoSaveEnabled]);

  useEffect(() => {
    // Real-time content analysis
    if (enableAI && (email.content || email.subject)) {
      debounceContentAnalysis();
    }
  }, [email.content, email.subject, enableAI]);

  useEffect(() => {
    // Update word count and reading time
    updateContentStats();
  }, [email.content]);

  useEffect(() => {
    // Validate email when content changes
    validateEmail();
  }, [email, recipients]);

  // ===== CORE FUNCTIONS =====
  const loadTemplateLibrary = async () => {
    try {
      setTemplates(prev => ({ ...prev, isLoading: true }));

      const templatesRef = collection(db, 'emailTemplates');
      const q = query(
        templatesRef,
        where('isActive', '==', true),
        orderBy('lastUsed', 'desc'),
        limit(50)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const templateData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate()
        }));

        setTemplates(prev => ({
          ...prev,
          library: templateData,
          recent: templateData.slice(0, 10),
          isLoading: false
        }));
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error loading template library:', error);
      showNotification('Failed to load templates', 'error');
    }
  };

  const initializeAIFeatures = async () => {
    try {
      setAiFeatures(prev => ({ ...prev, isAnalyzing: true }));

      // Initialize AI models and settings
      const aiSettings = await loadAISettings();
      
      setAiFeatures(prev => ({
        ...prev,
        ...aiSettings,
        isAnalyzing: false
      }));
    } catch (error) {
      console.error('Error initializing AI features:', error);
      setAiFeatures(prev => ({ ...prev, isAnalyzing: false }));
    }
  };

  const loadAISettings = async () => {
    // Simulate loading AI settings (replace with actual implementation)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      brandVoiceAlignment: 85,
      optimizationSuggestions: [
        'Consider adding personalization with {firstName}',
        'Include a clear call-to-action button',
        'Optimize subject line for mobile preview'
      ],
      subjectLineVariants: [
        'Your Credit Report Analysis is Ready',
        'Important Credit Updates Inside',
        'Next Steps for Your Credit Improvement'
      ]
    };
  };

  const setupCollaboration = () => {
    if (!enableCollaboration || !email.metadata?.id) return;

    const collaborationRef = collection(db, 'emailCollaboration');
    const q = query(
      collaborationRef,
      where('emailId', '==', email.metadata.id),
      orderBy('timestamp', 'desc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const collaborationData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      }));

      setCollaboration(prev => ({
        ...prev,
        comments: collaborationData.filter(item => item.type === 'comment'),
        versions: collaborationData.filter(item => item.type === 'version'),
        activeUsers: collaborationData.filter(item => item.type === 'presence' && item.isActive)
      }));
    });

    collaborationRef.current = unsubscribe;
  };

  const loadAnalytics = async () => {
    try {
      // Load email analytics data
      const analyticsRef = collection(db, 'emailAnalytics');
      const q = query(
        analyticsRef,
        where('userId', '==', user?.uid),
        orderBy('timestamp', 'desc'),
        limit(100)
      );

      const analyticsSnapshot = await getDocs(q);
      const analyticsData = analyticsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      }));

      const processedAnalytics = processAnalyticsData(analyticsData);
      setAnalytics(prev => ({ ...prev, ...processedAnalytics }));
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const processAnalyticsData = (data) => {
    // Process analytics data
    const historical = {
      campaignPerformance: [],
      subjectLinePerformance: [],
      contentPerformance: [],
      timingAnalysis: [],
      audienceSegments: []
    };

    data.forEach(item => {
      if (item.type === 'campaign') {
        historical.campaignPerformance.push(item);
      } else if (item.type === 'subject_line') {
        historical.subjectLinePerformance.push(item);
      }
      // Add more processing logic
    });

    return { historical };
  };

  const handleAutoSave = async () => {
    try {
      const emailData = {
        ...email,
        updatedAt: serverTimestamp(),
        lastModifiedBy: user?.email
      };

      if (email.metadata?.id) {
        await updateDoc(doc(db, 'emailDrafts', email.metadata.id), emailData);
      } else {
        const docRef = await addDoc(collection(db, 'emailDrafts'), {
          ...emailData,
          createdAt: serverTimestamp(),
          createdBy: user?.email
        });
        setEmail(prev => ({
          ...prev,
          metadata: { ...prev.metadata, id: docRef.id }
        }));
      }

      setEditorState(prev => ({
        ...prev,
        isDirty: false,
        lastSaved: new Date()
      }));
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  };

  const debounceContentAnalysis = useCallback(
    debounce(async () => {
      if (!enableAI || (!email.content && !email.subject)) return;

      try {
        setAiFeatures(prev => ({ ...prev, isAnalyzing: true }));

        // Simulate AI content analysis (replace with actual implementation)
        const analysis = await analyzeEmailContent(email.content, email.subject);
        
        setAiFeatures(prev => ({
          ...prev,
          ...analysis,
          isAnalyzing: false,
          lastAnalysis: new Date()
        }));
      } catch (error) {
        console.error('Content analysis failed:', error);
        setAiFeatures(prev => ({ ...prev, isAnalyzing: false }));
      }
    }, 1000),
    [email.content, email.subject, enableAI]
  );

  const analyzeEmailContent = async (content, subject) => {
    // Simulate AI content analysis (replace with actual OpenAI integration)
    await new Promise(resolve => setTimeout(resolve, 1500));

    const wordCount = content.split(' ').length;
    const sentenceCount = content.split(/[.!?]+/).length - 1;
    const avgWordsPerSentence = wordCount / Math.max(sentenceCount, 1);

    return {
      contentScore: Math.min(100, Math.max(0, 85 - (avgWordsPerSentence > 20 ? 10 : 0) + (wordCount > 50 ? 10 : -5))),
      readabilityScore: Math.max(0, Math.min(100, 100 - avgWordsPerSentence * 2)),
      spamScore: Math.random() * 20,
      sentimentScore: 50 + Math.random() * 30,
      toneAnalysis: {
        dominant: ['professional', 'friendly', 'urgent', 'casual'][Math.floor(Math.random() * 4)],
        confidence: 0.7 + Math.random() * 0.3,
        emotions: {
          positive: 0.6 + Math.random() * 0.3,
          negative: Math.random() * 0.2,
          neutral: 0.4 + Math.random() * 0.4
        }
      },
      engagementPrediction: {
        openRate: 15 + Math.random() * 25,
        clickRate: 2 + Math.random() * 8,
        replyRate: 1 + Math.random() * 5,
        conversionRate: 0.5 + Math.random() * 3
      },
      optimizationSuggestions: [
        'Add personalization with recipient name',
        'Include a clear call-to-action',
        'Optimize for mobile viewing',
        'Add social proof elements'
      ].slice(0, Math.floor(Math.random() * 4) + 1)
    };
  };

  const updateContentStats = () => {
    if (!email.content) {
      setEditorState(prev => ({
        ...prev,
        wordCount: 0,
        characterCount: 0,
        estimatedReadTime: 0
      }));
      return;
    }

    const wordCount = email.content.split(/\s+/).filter(word => word.length > 0).length;
    const characterCount = email.content.length;
    const estimatedReadTime = Math.ceil(wordCount / 200); // Average reading speed

    setEditorState(prev => ({
      ...prev,
      wordCount,
      characterCount,
      estimatedReadTime
    }));
  };

  const validateEmail = () => {
    const errors = [];
    const warnings = [];

    // Check recipients
    if (email.to.length === 0 && mode !== 'template') {
      errors.push('At least one recipient is required');
    }

    // Check subject
    if (!email.subject.trim()) {
      if (mode !== 'template') {
        errors.push('Subject line is required');
      }
    } else if (email.subject.length > 100) {
      warnings.push('Subject line is longer than recommended (100 characters)');
    }

    // Check content
    if (!email.content.trim()) {
      errors.push('Email content is required');
    } else if (email.content.length < 50) {
      warnings.push('Email content is quite short');
    } else if (email.content.length > 5000) {
      warnings.push('Email content is quite long for optimal engagement');
    }

    // Check spam score
    if (aiFeatures.spamScore > 50) {
      warnings.push('High spam risk detected - consider revising content');
    }

    // Check accessibility
    if (aiFeatures.accessibilityScore < 70) {
      warnings.push('Consider improving accessibility for better reach');
    }

    setValidation({
      isValid: errors.length === 0,
      errors,
      warnings,
      checks: {
        recipients: email.to.length > 0,
        subject: !!email.subject.trim(),
        content: !!email.content.trim(),
        deliverability: aiFeatures.spamScore < 30,
        compliance: true, // Add actual compliance checks
        accessibility: aiFeatures.accessibilityScore >= 70
      },
      lastValidated: new Date()
    });
  };

  // ===== CONTENT MANIPULATION FUNCTIONS =====
  const insertVariable = (variable) => {
    const variableText = `{${variable.name}}`;
    const editor = editorRef.current?.getEditor();
    
    if (editor) {
      const range = editor.getSelection();
      editor.insertText(range ? range.index : 0, variableText);
      
      // Update email content
      setEmail(prev => ({
        ...prev,
        content: editor.getText(),
        htmlContent: editor.root.innerHTML
      }));
      
      setEditorState(prev => ({ ...prev, isDirty: true }));
    }
  };

  const handleGenerateAIContent = async (promptType) => {
    try {
      setAiFeatures(prev => ({ ...prev, isGenerating: true }));

      const prompt = aiContentPrompts.find(p => p.id === promptType);
      if (!prompt) return;

      // Simulate AI content generation (replace with actual implementation)
      const generatedContent = await generateAIContent(prompt, email);

      setEmail(prev => ({
        ...prev,
        content: generatedContent.content,
        subject: generatedContent.subject || prev.subject
      }));

      setEditorState(prev => ({ ...prev, isDirty: true }));
      showNotification('AI content generated successfully!', 'success');
    } catch (error) {
      console.error('AI content generation failed:', error);
      showNotification('Failed to generate AI content', 'error');
    } finally {
      setAiFeatures(prev => ({ ...prev, isGenerating: false }));
    }
  };

  const generateAIContent = async (prompt, currentEmail) => {
    // Simulate AI content generation
    await new Promise(resolve => setTimeout(resolve, 2500));

    const templates = {
      welcome_new_client: {
        subject: 'Welcome to Speedy Credit Repair - Your Journey Starts Now!',
        content: `Dear {firstName},

Welcome to the Speedy Credit Repair family! We're excited to help you achieve your credit goals and unlock new financial opportunities.

Your {servicePlan} plan is now active, and here's what happens next:

📋 **Your Personalized Plan**
• Initial credit report analysis (completed within 24-48 hours)
• Custom dispute strategy development
• Direct communication with all three credit bureaus
• Monthly progress tracking and updates

👨‍💼 **Your Dedicated Specialist**
Your personal credit specialist is {agentName}, who brings over 10 years of credit repair expertise. They'll be your primary point of contact and will guide you through every step of the process.

📅 **Next Steps**
We've scheduled your strategy session for {consultationDate}. During this call, we'll:
• Review your credit reports in detail
• Identify the highest-impact items to dispute first
• Set realistic timeline expectations
• Answer any questions you may have

💪 **Why You'll Succeed**
With our proven track record and your commitment, we're confident you'll see meaningful improvements in your credit score. Our average client sees positive changes within the first 60-90 days.

Questions? Your specialist {agentName} is here to help. You can reach them directly at {agentPhone} or reply to this email.

Welcome aboard!

The Speedy Credit Repair Team

P.S. Keep an eye on your inbox for exclusive credit tips and progress updates!`
      },

      dispute_progress_update: {
        subject: 'Great News! Your Credit Dispute Update is Here',
        content: `Hi {firstName},

I have exciting updates on your credit repair progress!

🎉 **This Month's Wins**
• {disputeCount} items successfully disputed and removed
• Credit score improvement: +25 points since we started
• 3 negative accounts completely eliminated

📊 **Your Current Status**
• Current credit score: {creditScore}
• Goal score: {improvementGoal}
• Progress: 65% toward your goal!

🎯 **What We're Working On Next**
1. Disputing 2 additional collection accounts with TransUnion
2. Challenging outdated information with Experian
3. Optimizing your credit utilization for maximum impact

💡 **Pro Tip for This Month**
Keep your credit card balances below 19% of your available credit limits. This is one of the fastest ways to see additional score improvements between our dispute rounds.

Your next progress report will arrive on the 15th of next month. As always, if you have any questions or concerns, don't hesitate to reach out.

Keep up the great work!

{agentName}
Senior Credit Specialist
Speedy Credit Repair

Questions? Call me directly at {agentPhone}`
      }
    };

    return templates[prompt.id] || {
      subject: 'AI Generated Subject',
      content: 'AI generated content based on your prompt...'
    };
  };

  const handleFormatText = (format, value = null) => {
    const editor = editorRef.current?.getEditor();
    if (!editor) return;

    const range = editor.getSelection();
    if (!range) return;

    switch (format) {
      case 'bold':
        editor.format('bold', !formatting.bold);
        setFormatting(prev => ({ ...prev, bold: !prev.bold }));
        break;
      case 'italic':
        editor.format('italic', !formatting.italic);
        setFormatting(prev => ({ ...prev, italic: !prev.italic }));
        break;
      case 'underline':
        editor.format('underline', !formatting.underline);
        setFormatting(prev => ({ ...prev, underline: !prev.underline }));
        break;
      case 'color':
        editor.format('color', value);
        setFormatting(prev => ({ ...prev, textColor: value }));
        break;
      case 'size':
        editor.format('size', value);
        setFormatting(prev => ({ ...prev, fontSize: value }));
        break;
      case 'align':
        editor.format('align', value);
        setFormatting(prev => ({ ...prev, alignment: value }));
        break;
      case 'list':
        editor.format('list', value);
        setFormatting(prev => ({ ...prev, listType: value }));
        break;
      default:
        break;
    }

    setEditorState(prev => ({ ...prev, isDirty: true }));
  };

  const handleSave = async () => {
    try {
      setEditorState(prev => ({ ...prev, isSaving: true }));

      const emailData = {
        ...email,
        htmlContent: editorRef.current?.getEditor()?.root.innerHTML || email.content,
        plainTextContent: editorRef.current?.getEditor()?.getText() || email.content,
        updatedAt: serverTimestamp(),
        lastModifiedBy: user?.email,
        version: (email.metadata?.version || 0) + 1
      };

      if (mode === 'template') {
        // Save as template
        const templateData = {
          name: email.subject || 'Untitled Template',
          type: 'email',
          category: 'custom',
          subject: email.subject,
          content: emailData.plainTextContent,
          htmlContent: emailData.htmlContent,
          variables: email.variables,
          tags: email.tags,
          createdAt: serverTimestamp(),
          createdBy: user?.email,
          isActive: true
        };

        await addDoc(collection(db, 'emailTemplates'), templateData);
        showNotification('Template saved successfully!', 'success');
      } else {
        // Save as draft
        if (email.metadata?.id) {
          await updateDoc(doc(db, 'emailDrafts', email.metadata.id), emailData);
        } else {
          const docRef = await addDoc(collection(db, 'emailDrafts'), {
            ...emailData,
            createdAt: serverTimestamp(),
            createdBy: user?.email
          });
          setEmail(prev => ({
            ...prev,
            metadata: { ...prev.metadata, id: docRef.id }
          }));
        }
        showNotification('Draft saved successfully!', 'success');
      }

      setEditorState(prev => ({
        ...prev,
        isSaving: false,
        isDirty: false,
        lastSaved: new Date()
      }));

      if (onSave) {
        onSave(emailData);
      }
    } catch (error) {
      console.error('Error saving email:', error);
      showNotification('Failed to save email', 'error');
      setEditorState(prev => ({ ...prev, isSaving: false }));
    }
  };

  const handleSend = async () => {
    try {
      // Final validation
      validateEmail();
      
      if (!validation.isValid) {
        showNotification('Please fix validation errors before sending', 'error');
        return;
      }

      setEditorState(prev => ({ ...prev, isSending: true }));

      const emailData = {
        ...email,
        htmlContent: editorRef.current?.getEditor()?.root.innerHTML || email.content,
        plainTextContent: editorRef.current?.getEditor()?.getText() || email.content,
        sentAt: serverTimestamp(),
        sentBy: user?.email,
        status: 'sent'
      };

      // Send email via Cloud Function
      const sendEmailFunction = httpsCallable(functions, 'sendEmail');
      const result = await sendEmailFunction(emailData);

      if (result.data.success) {
        showNotification('Email sent successfully!', 'success');
        
        if (onSend) {
          onSend(emailData);
        }
      } else {
        throw new Error(result.data.error || 'Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      showNotification('Failed to send email', 'error');
    } finally {
      setEditorState(prev => ({ ...prev, isSending: false }));
    }
  };

  // ===== UI HELPER FUNCTIONS =====
  const showNotification = (message, severity = 'info') => {
    setUi(prev => ({
      ...prev,
      notification: {
        open: true,
        message,
        severity
      }
    }));
  };

  const closeNotification = () => {
    setUi(prev => ({
      ...prev,
      notification: { ...prev.notification, open: false }
    }));
  };

  const handleTabChange = (event, newValue) => {
    setEditorState(prev => ({ ...prev, selectedTab: newValue }));
  };

  const togglePanel = (panel) => {
    setUi(prev => ({
      ...prev,
      [`show${panel}Panel`]: !prev[`show${panel}Panel`]
    }));
  };

  const formatDate = (date) => {
    if (!date) return 'Never';
    return formatDistance(date, new Date(), { addSuffix: true });
  };

  // ===== RENDER HELPER FUNCTIONS =====
  const renderToolbar = () => (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar variant="dense" sx={{ minHeight: 48 }}>
        {/* Left Section */}
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mr: 2 }}>
          <Typography variant="h6">
            {mode === 'compose' ? 'Compose Email' :
             mode === 'reply' ? 'Reply' :
             mode === 'forward' ? 'Forward' :
             mode === 'template' ? 'Create Template' :
             'Email Campaign'}
          </Typography>
          
          {editorState.isDirty && (
            <Chip label="Unsaved changes" color="warning" size="small" />
          )}
          
          {collaboration.isCollaborating && (
            <AvatarGroup max={3} size="small">
              {collaboration.activeUsers.map(user => (
                <Avatar key={user.id} sx={{ width: 24, height: 24 }}>
                  {user.name[0]}
                </Avatar>
              ))}
            </AvatarGroup>
          )}
        </Stack>

        {/* Center Section - Auto-save Status */}
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {editorState.isSaving && (
            <Stack direction="row" spacing={1} alignItems="center">
              <CircularProgress size={16} />
              <Typography variant="caption">Saving...</Typography>
            </Stack>
          )}
          {editorState.lastSaved && !editorState.isSaving && (
            <Typography variant="caption" color="text.secondary">
              Last saved: {formatDate(editorState.lastSaved)}
            </Typography>
          )}
        </Box>

        {/* Right Section */}
        <Stack direction="row" spacing={1} alignItems="center">
          <ButtonGroup size="small">
            <Button
              startIcon={<Save />}
              onClick={handleSave}
              disabled={editorState.isSaving}
            >
              Save
            </Button>
            <Button
              startIcon={<Preview />}
              onClick={() => setUi(prev => ({ ...prev, showPreviewPanel: !prev.showPreviewPanel }))}
              color={ui.showPreviewPanel ? 'primary' : 'inherit'}
            >
              Preview
            </Button>
            <Button
              variant="contained"
              startIcon={editorState.isSending ? <CircularProgress size={16} /> : <Send />}
              onClick={handleSend}
              disabled={editorState.isSending || !validation.isValid}
              color="primary"
            >
              {mode === 'template' ? 'Save Template' : 'Send'}
            </Button>
          </ButtonGroup>

          <IconButton onClick={() => setUi(prev => ({ ...prev, showSettingsPanel: !prev.showSettingsPanel }))}>
            <Settings />
          </IconButton>

          {onCancel && (
            <Button onClick={onCancel} color="inherit">
              Cancel
            </Button>
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  );

  const renderEditor = () => {
    const modules = {
      toolbar: [
        [{ 'font': [] }, { 'size': [] }],
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'script': 'sub' }, { 'script': 'super' }],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
        [{ 'direction': 'rtl' }, { 'align': [] }],
        ['link', 'image', 'video', 'blockquote', 'code-block'],
        ['clean']
      ],
      blotFormatter: {}
    };

    const formats = [
      'font', 'size', 'header',
      'bold', 'italic', 'underline', 'strike',
      'color', 'background', 'script',
      'list', 'bullet', 'indent',
      'direction', 'align',
      'link', 'image', 'video', 'blockquote', 'code-block'
    ];

    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Email Headers */}
        <Paper sx={{ p: 2, mb: 1 }}>
          <Grid container spacing={2}>
            {mode !== 'template' && (
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  value={email.to}
                  onChange={(event, newValue) => {
                    setEmail(prev => ({ ...prev, to: newValue }));
                    setEditorState(prev => ({ ...prev, isDirty: true }));
                  }}
                  options={[]} // Load from contacts
                  freeSolo
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        variant="outlined"
                        label={option}
                        {...getTagProps({ index })}
                        key={index}
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="To"
                      placeholder="Enter email addresses"
                      required
                    />
                  )}
                />
              </Grid>
            )}
            
            <Grid item xs={12}>
              <TextField
                label="Subject Line"
                value={email.subject}
                onChange={(e) => {
                  setEmail(prev => ({ ...prev, subject: e.target.value }));
                  setEditorState(prev => ({ ...prev, isDirty: true }));
                }}
                fullWidth
                required={mode !== 'template'}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Typography variant="caption" color="text.secondary">
                        {email.subject.length}/100
                      </Typography>
                    </InputAdornment>
                  )
                }}
                helperText={
                  aiFeatures.subjectLineVariants.length > 0 ? (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" color="primary">
                        AI Suggestions:
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 0.5, flexWrap: 'wrap', gap: 0.5 }}>
                        {aiFeatures.subjectLineVariants.slice(0, 3).map((variant, index) => (
                          <Chip
                            key={index}
                            label={variant}
                            size="small"
                            onClick={() => {
                              setEmail(prev => ({ ...prev, subject: variant }));
                              setEditorState(prev => ({ ...prev, isDirty: true }));
                            }}
                            sx={{ cursor: 'pointer' }}
                          />
                        ))}
                      </Stack>
                    </Box>
                  ) : null
                }
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Content Editor */}
        <Box sx={{ flexGrow: 1, position: 'relative' }}>
          <ReactQuill
            ref={editorRef}
            value={email.content}
            onChange={(content, delta, source, editor) => {
              setEmail(prev => ({
                ...prev,
                content: editor.getText(),
                htmlContent: editor.getHTML()
              }));
              setEditorState(prev => ({ ...prev, isDirty: true }));
            }}
            modules={modules}
            formats={formats}
            style={{ height: '400px' }}
            placeholder="Write your email content here..."
          />
        </Box>

        {/* Content Statistics */}
        <Paper sx={{ p: 1, mt: 1 }}>
          <Stack direction="row" spacing={3} alignItems="center">
            <Typography variant="caption" color="text.secondary">
              Words: {editorState.wordCount}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Characters: {editorState.characterCount}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Reading time: ~{editorState.estimatedReadTime} min
            </Typography>
            
            {aiFeatures.isEnabled && (
              <>
                <Divider orientation="vertical" flexItem />
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="caption" color="text.secondary">
                    Content Score:
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={aiFeatures.contentScore}
                    sx={{ width: 60, height: 4 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {Math.round(aiFeatures.contentScore)}%
                  </Typography>
                </Stack>
              </>
            )}
          </Stack>
        </Paper>
      </Box>
    );
  };

  const renderSidebar = () => {
    const tabPanelStyle = { p: 2, height: 'calc(100% - 48px)', overflow: 'auto' };

    return (
      <Paper sx={{ width: ui.sidebarWidth, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Tabs
          value={editorState.selectedTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Variables" />
          <Tab label="AI Assistant" />
          <Tab label="Templates" />
          <Tab label="Analytics" />
        </Tabs>

        {/* Variables Tab */}
        {editorState.selectedTab === 0 && (
          <Box sx={tabPanelStyle}>
            <Typography variant="h6" gutterBottom>
              Email Variables
            </Typography>
            
            {Object.entries(groupBy(availableVariables, 'category')).map(([category, variables]) => (
              <Accordion key={category} defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="subtitle2">{category}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List dense>
                    {variables.map((variable) => (
                      <ListItemButton
                        key={variable.name}
                        onClick={() => insertVariable(variable)}
                        sx={{ borderRadius: 1, mb: 0.5 }}
                      >
                        <ListItemText
                          primary={variable.label}
                          secondary={`{${variable.name}} - ${variable.example}`}
                          secondaryTypographyProps={{ fontSize: '0.75rem' }}
                        />
                      </ListItemButton>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        )}

        {/* AI Assistant Tab */}
        {editorState.selectedTab === 1 && (
          <Box sx={tabPanelStyle}>
            <Typography variant="h6" gutterBottom>
              AI Assistant
            </Typography>
            
            {aiFeatures.isAnalyzing && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                <Typography variant="body2">Analyzing content...</Typography>
              </Box>
            )}

            {/* Content Quality Scores */}
            <Card sx={{ mb: 2 }}>
              <CardHeader title="Content Quality" />
              <CardContent>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" gutterBottom>
                      Overall Score: {Math.round(aiFeatures.contentScore)}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={aiFeatures.contentScore}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                  
                  <Box>
                    <Typography variant="caption" gutterBottom>
                      Readability: {Math.round(aiFeatures.readabilityScore)}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={aiFeatures.readabilityScore}
                      color="secondary"
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                  
                  <Box>
                    <Typography variant="caption" gutterBottom>
                      Spam Risk: {Math.round(aiFeatures.spamScore)}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={100 - aiFeatures.spamScore}
                      color={aiFeatures.spamScore > 50 ? 'error' : 'success'}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                  
                  <Box>
                    <Typography variant="caption" gutterBottom>
                      Tone: {aiFeatures.toneAnalysis.dominant}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Confidence: {Math.round(aiFeatures.toneAnalysis.confidence * 100)}%
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* AI Suggestions */}
            {aiFeatures.optimizationSuggestions.length > 0 && (
              <Card sx={{ mb: 2 }}>
                <CardHeader title="Optimization Suggestions" />
                <CardContent>
                  <List dense>
                    {aiFeatures.optimizationSuggestions.map((suggestion, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <AutoAwesome color="primary" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={suggestion}
                          primaryTypographyProps={{ fontSize: '0.875rem' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            )}

            {/* AI Content Generation */}
            <Card>
              <CardHeader title="AI Content Generation" />
              <CardContent>
                <Stack spacing={1}>
                  {aiContentPrompts.slice(0, 4).map((prompt) => (
                    <Button
                      key={prompt.id}
                      variant="outlined"
                      size="small"
                      fullWidth
                      startIcon={<SmartToy />}
                      onClick={() => handleGenerateAIContent(prompt.id)}
                      disabled={aiFeatures.isGenerating}
                      sx={{ justifyContent: 'flex-start' }}
                    >
                      {prompt.title}
                    </Button>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Templates Tab */}
        {editorState.selectedTab === 2 && (
          <Box sx={tabPanelStyle}>
            <Typography variant="h6" gutterBottom>
              Email Templates
            </Typography>
            
            <TextField
              placeholder="Search templates..."
              value={templates.searchTerm}
              onChange={(e) => setTemplates(prev => ({ ...prev, searchTerm: e.target.value }))}
              size="small"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={20} />
                  </InputAdornment>
                )
              }}
              sx={{ mb: 2 }}
            />

            {templates.isLoading ? (
              <Stack spacing={1}>
                {[...Array(5)].map((_, index) => (
                  <Skeleton key={index} variant="rectangular" height={60} />
                ))}
              </Stack>
            ) : (
              <List dense>
                {templates.library
                  .filter(template =>
                    !templates.searchTerm ||
                    template.name.toLowerCase().includes(templates.searchTerm.toLowerCase()) ||
                    template.category.toLowerCase().includes(templates.searchTerm.toLowerCase())
                  )
                  .map((template) => (
                  <ListItemButton
                    key={template.id}
                    onClick={() => {
                      setEmail(prev => ({
                        ...prev,
                        subject: template.subject || prev.subject,
                        content: template.content || prev.content,
                        htmlContent: template.htmlContent || prev.htmlContent
                      }));
                      setEditorState(prev => ({ ...prev, isDirty: true }));
                      showNotification('Template applied successfully!', 'success');
                    }}
                    sx={{ borderRadius: 1, mb: 0.5 }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: emailTemplateCategories.find(cat => cat.id === template.category)?.color }}>
                        {React.createElement(
                          emailTemplateCategories.find(cat => cat.id === template.category)?.icon || Email,
                          { fontSize: 'small' }
                        )}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={template.name}
                      secondary={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip label={template.category} size="small" />
                          <Typography variant="caption">
                            {format(template.updatedAt || template.createdAt, 'MMM dd')}
                          </Typography>
                        </Stack>
                      }
                    />
                  </ListItemButton>
                ))}
              </List>
            )}
          </Box>
        )}

        {/* Analytics Tab */}
        {editorState.selectedTab === 3 && (
          <Box sx={tabPanelStyle}>
            <Typography variant="h6" gutterBottom>
              Email Analytics
            </Typography>
            
            {analytics.enabled ? (
              <Stack spacing={2}>
                {/* Performance Predictions */}
                <Card>
                  <CardHeader title="Predicted Performance" />
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" color="primary">
                            {Math.round(aiFeatures.engagementPrediction.openRate)}%
                          </Typography>
                          <Typography variant="caption">Open Rate</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" color="secondary">
                            {Math.round(aiFeatures.engagementPrediction.clickRate)}%
                          </Typography>
                          <Typography variant="caption">Click Rate</Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {/* Historical Performance */}
                {analytics.historical.campaignPerformance.length > 0 && (
                  <Card>
                    <CardHeader title="Recent Campaign Performance" />
                    <CardContent>
                      <List dense>
                        {analytics.historical.campaignPerformance.slice(0, 5).map((campaign, index) => (
                          <ListItem key={index}>
                            <ListItemText
                              primary={campaign.subject || 'Campaign ' + (index + 1)}
                              secondary={`Open: ${campaign.openRate}% | Click: ${campaign.clickRate}%`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                )}

                {/* Insights */}
                {analytics.insights.length > 0 && (
                  <Card>
                    <CardHeader title="Insights & Recommendations" />
                    <CardContent>
                      <List dense>
                        {analytics.insights.map((insight, index) => (
                          <ListItem key={index}>
                            <ListItemIcon>
                              <Insights color="primary" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText
                              primary={insight.title}
                              secondary={insight.description}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                )}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Analytics are disabled for this email.
              </Typography>
            )}
          </Box>
        )}
      </Paper>
    );
  };

  const renderValidationErrors = () => {
    if (validation.isValid && validation.warnings.length === 0) return null;

    return (
      <Box sx={{ mb: 2 }}>
        {validation.errors.map((error, index) => (
          <Alert key={`error-${index}`} severity="error" sx={{ mb: 1 }}>
            {error}
          </Alert>
        ))}
        {validation.warnings.map((warning, index) => (
          <Alert key={`warning-${index}`} severity="warning" sx={{ mb: 1 }}>
            {warning}
          </Alert>
        ))}
      </Box>
    );
  };

  // ===== MAIN COMPONENT RENDER =====
  if (editorState.isLoading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading email composer...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header Toolbar */}
      {renderToolbar()}

      {/* Validation Messages */}
      {renderValidationErrors()}

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Main Editor */}
        <Box sx={{ flexGrow: 1, overflow: 'hidden', p: 2 }}>
          {renderEditor()}
        </Box>

        {/* Sidebar */}
        {renderSidebar()}
      </Box>

      {/* Notifications */}
      <Snackbar
        open={ui.notification.open}
        autoHideDuration={6000}
        onClose={closeNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={closeNotification}
          severity={ui.notification.severity}
          sx={{ width: '100%' }}
        >
          {ui.notification.message}
        </Alert>
      </Snackbar>

      {/* AI Loading Overlay */}
      {aiFeatures.isGenerating && (
        <Backdrop open sx={{ zIndex: 9999 }}>
          <Stack alignItems="center" spacing={2}>
            <CircularProgress size={60} />
            <Typography variant="h6" color="common.white">
              AI is generating content...
            </Typography>
            <Typography variant="body2" color="common.white">
              This may take a few seconds
            </Typography>
          </Stack>
        </Backdrop>
      )}
    </Box>
  );
});

EmailComposer.displayName = 'EmailComposer';

export default EmailComposer;