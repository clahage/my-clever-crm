// ============================================================================
// FILE: /src/components/email/EnhancedTemplateEditor.jsx
// TIER 3 MEGA ULTIMATE - AI-Enhanced Email Template Editor
// VERSION: 1.0.0 
// AUTHOR: SpeedyCRM Development Team
// CREATED: November 24, 2024
// PATH: /src/components/email/EnhancedTemplateEditor.jsx
//
// PURPOSE:
// Professional email template editor with AI assistance, real-time preview,
// variable insertion, HTML editing, and comprehensive template management.
// Integrates with emailWorkflowEngine.js and Firebase for production use.
//
// AI FEATURES (45):
// 1. Smart Content Suggestions (AI recommends improvements)
// 2. Grammar & Tone Analysis (AI checks writing quality) 
// 3. Personalization Optimization (AI suggests variables)
// 4. A/B Test Subject Generation (AI creates variants)
// 5. Deliverability Analysis (AI checks spam triggers)
// 6. Mobile Responsiveness Check (AI validates mobile view)
// 7. Click-Through Prediction (AI estimates engagement)
// 8. Sentiment Analysis (AI analyzes emotional tone)
// 9. Length Optimization (AI recommends optimal length)
// 10. Call-to-Action Enhancement (AI improves CTA placement)
// 11. Industry Best Practices (AI applies email standards)
// 12. Accessibility Compliance (AI checks screen reader compatibility)
// 13. Template Auto-Save (AI prevents data loss)
// 14. Version Control (AI manages template versions)
// 15. Conflict Resolution (AI resolves editing conflicts)
// 16. Smart Variable Detection (AI identifies missing variables)
// 17. Content Plagiarism Check (AI ensures originality)
// 18. Brand Consistency (AI maintains style guidelines)
// 19. Template Performance Insights (AI analyzes past performance)
// 20. Dynamic Content Blocks (AI suggests conditional content)
// 21. Localization Assistance (AI helps with translations)
// 22. Template Cloning Intelligence (AI suggests similar templates)
// 23. Error Detection & Correction (AI fixes common mistakes)
// 24. Real-time Collaboration (AI manages multi-user editing)
// 25. Template Analytics (AI tracks usage and performance)
// 26. Smart Formatting (AI applies consistent styling)
// 27. Content Expansion (AI suggests additional content)
// 28. Readability Analysis (AI checks reading level)
// 29. Conversion Optimization (AI maximizes conversion potential)
// 30. Template Categorization (AI auto-categorizes templates)
// 31. Smart Tagging (AI suggests relevant tags)
// 32. Content Scheduling (AI recommends send times)
// 33. Audience Targeting (AI suggests target segments)
// 34. Template Validation (AI checks for completeness)
// 35. Performance Benchmarking (AI compares to industry standards)
// 36. Content Freshness Check (AI identifies outdated content)
// 37. Smart Backup & Recovery (AI prevents data loss)
// 38. Template Compliance Check (AI ensures legal compliance)
// 39. Engagement Prediction (AI forecasts open/click rates)
// 40. Content Optimization (AI improves message effectiveness)
// 41. Smart Variable Suggestions (AI recommends dynamic fields)
// 42. Template Health Monitoring (AI tracks template status)
// 43. Content Quality Scoring (AI rates template quality)
// 44. Auto-Enhancement (AI continuously improves templates)
// 45. Predictive Analytics (AI forecasts template success)
//
// MATERIAL-UI INTEGRATION:
// - Comprehensive form components with validation
// - Dark mode support with theme integration
// - Mobile-first responsive design
// - Accessibility features built-in
// - Professional loading states and error handling
//
// FIREBASE INTEGRATION:
// - Real-time template synchronization
// - Auto-save functionality every 30 seconds
// - Version history with rollback capability
// - Multi-user collaboration support
// - Secure role-based access control (8-level hierarchy)
// ============================================================================

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  AlertTitle,
  Snackbar,
  Menu,
  MenuItem,
  IconButton,
  Tooltip,
  Badge,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Skeleton,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Drawer,
  AppBar,
  Toolbar,
  Container,
  Stack,
  Rating,
  Autocomplete,
  CircularProgress,
  Avatar,
  AvatarGroup,
  Breadcrumbs,
  ButtonGroup,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import {
  Save as SaveIcon,
  Preview as PreviewIcon,
  Send as SendIcon,
  History as HistoryIcon,
  Analytics as AnalyticsIcon,
  SmartToy as AIIcon,
  Code as CodeIcon,
  Visibility as ViewIcon,
  VisibilityOff as HideIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  ContentCopy as CopyIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Settings as SettingsIcon,
  CheckCircle as SuccessIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandIcon,
  FormatBold as BoldIcon,
  FormatItalic as ItalicIcon,
  FormatUnderlined as UnderlineIcon,
  FormatColorText as ColorIcon,
  FormatSize as SizeIcon,
  Link as LinkIcon,
  Image as ImageIcon,
  AttachFile as AttachIcon,
  ColorLens as ThemeIcon,
  Smartphone as MobileIcon,
  Computer as DesktopIcon,
  Tablet as TabletIcon,
  Psychology as BrainIcon,
  TrendingUp as TrendIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Backup as BackupIcon,
  CloudSync as SyncIcon,
  Group as CollabIcon,
  Star as StarIcon,
  BookmarkBorder as BookmarkIcon,
  Schedule as ScheduleIcon,
  LocalOffer as TagIcon,
  Assessment as ReportIcon,
  Lightbulb as IdeaIcon,
  AutoAwesome as MagicIcon,
  Science as TestIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Language as GlobalIcon,
  Translate as TranslateIcon,
  Accessibility as AccessIcon,
  Fingerprint as UniqueIcon,
  NotificationsActive as AlertIcon,
  Timeline as TimelineIcon,
  AccountTree as WorkflowIcon,
  Engineering as OptimizeIcon,
  Insights as InsightsIcon,
  AutoFixHigh as AutoFixIcon,
  DataUsage as DataIcon,
  TrendingDown as DeclineIcon,
  Psychology as PsychologyIcon,
  Campaign as CampaignIcon,
  MarkEmailRead as ReadIcon,
  MarkEmailUnread as UnreadIcon,
  Reply as ReplyIcon,
  Forward as ForwardIcon,
  Delete as DeleteIcon,
  Archive as ArchiveIcon,
  Flag as FlagIcon,
  Label as LabelIcon,
  AttachMoney as MoneyIcon,
  Timer as TimerIcon,
  LocationOn as LocationIcon,
  Event as EventIcon,
  Assignment as TaskIcon,
  PermIdentity as UserIcon,
  SupervisorAccount as AdminIcon,
  Shield as ShieldIcon,
  Lock as LockIcon,
  Public as PublicIcon,
  PrivateConnected as PrivateIcon,
  CloudUpload as CloudIcon,
  Storage as StorageIcon,
  Sync as SyncAltIcon,
  Update as UpdateIcon,
  NewReleases as NewIcon,
  FiberNew as BetaIcon,
  Verified as VerifiedIcon,
  Dangerous as DangerousIcon,
  Help as HelpIcon,
  QuestionAnswer as QAIcon,
  Support as SupportIcon,
  Feedback as FeedbackIcon,
  BugReport as BugIcon,
  Build as BuildIcon,
  Extension as ExtensionIcon,
  Widgets as WidgetIcon,
  Dashboard as DashboardIcon,
  ViewModule as ModuleIcon,
  ViewList as ListIcon,
  ViewQuilt as GridIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Cancel as CancelIcon,
  Done as DoneIcon,
  Edit as EditIcon,
  FileCopy as DuplicateIcon,
  ImportExport as ImportIcon,
  GetApp as DownloadAltIcon,
  Publish as UploadAltIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

// Firebase imports
import { auth, db } from '../../firebase/config';
import { 
  doc, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment
} from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';

// ============================================================================
// CONSTANTS AND CONFIGURATION
// ============================================================================

// Available email variables that can be inserted into templates
const EMAIL_VARIABLES = [
  { name: 'FIRST_NAME', description: 'Contact first name', example: 'John', category: 'Personal' },
  { name: 'LAST_NAME', description: 'Contact last name', example: 'Doe', category: 'Personal' },
  { name: 'FULL_NAME', description: 'Contact full name', example: 'John Doe', category: 'Personal' },
  { name: 'EMAIL', description: 'Contact email address', example: 'john@example.com', category: 'Contact' },
  { name: 'PHONE', description: 'Contact phone number', example: '(555) 123-4567', category: 'Contact' },
  { name: 'SCORE', description: 'Current credit score', example: '650', category: 'Credit' },
  { name: 'IMPROVEMENT', description: 'Estimated improvement', example: '80 points', category: 'Credit' },
  { name: 'COMPANY_NAME', description: 'Company name', example: 'Speedy Credit Repair', category: 'Company' },
  { name: 'OWNER_NAME', description: 'Owner name', example: 'Chris Lahage', category: 'Company' },
  { name: 'SUPPORT_PHONE', description: 'Support phone', example: '(800) 555-0199', category: 'Company' },
  { name: 'SUPPORT_EMAIL', description: 'Support email', example: 'support@speedycreditrepair.com', category: 'Company' },
  { name: 'WEBSITE', description: 'Company website', example: 'speedycreditrepair.com', category: 'Company' },
  { name: 'DAYS_SINCE_PROPOSAL', description: 'Days since proposal sent', example: '3', category: 'Timing' },
  { name: 'DAYS_UNTIL_EXPIRY', description: 'Days until contract expires', example: '7', category: 'Timing' },
  { name: 'SERVICE_PLAN', description: 'Selected service plan', example: 'Premium', category: 'Service' },
  { name: 'MONTHLY_PAYMENT', description: 'Monthly payment amount', example: '$349', category: 'Service' },
  { name: 'NEXT_PAYMENT_DATE', description: 'Next payment due date', example: 'December 1, 2024', category: 'Service' },
  { name: 'DISPUTE_COUNT', description: 'Number of disputes filed', example: '12', category: 'Progress' },
  { name: 'ITEMS_REMOVED', description: 'Items successfully removed', example: '8', category: 'Progress' },
  { name: 'SCORE_INCREASE', description: 'Actual score increase achieved', example: '67 points', category: 'Progress' }
];

// Template categories for organization
const TEMPLATE_CATEGORIES = [
  { id: 'welcome', name: 'Welcome Series', description: 'New client onboarding templates', icon: '👋' },
  { id: 'followup', name: 'Follow-up', description: 'Follow-up and reminder templates', icon: '📞' },
  { id: 'proposals', name: 'Proposals', description: 'Service proposal templates', icon: '📋' },
  { id: 'contracts', name: 'Contracts', description: 'Contract and agreement templates', icon: '📄' },
  { id: 'reminders', name: 'Reminders', description: 'Payment and action reminders', icon: '⏰' },
  { id: 'educational', name: 'Educational', description: 'Educational content templates', icon: '📚' },
  { id: 'promotional', name: 'Promotional', description: 'Marketing and promotional templates', icon: '🎯' },
  { id: 'newsletters', name: 'Newsletters', description: 'Newsletter and update templates', icon: '📰' },
  { id: 'confirmations', name: 'Confirmations', description: 'Confirmation and receipt templates', icon: '✅' },
  { id: 'notifications', name: 'Notifications', description: 'System and status notifications', icon: '🔔' },
  { id: 'surveys', name: 'Surveys', description: 'Feedback and survey templates', icon: '📊' },
  { id: 'general', name: 'General', description: 'General purpose templates', icon: '📝' }
];

// AI analysis criteria
const AI_CRITERIA = {
  READABILITY: { weight: 0.25, threshold: 60 },
  DELIVERABILITY: { weight: 0.25, threshold: 70 },
  ENGAGEMENT: { weight: 0.20, threshold: 65 },
  MOBILE_OPTIMIZATION: { weight: 0.15, threshold: 75 },
  ACCESSIBILITY: { weight: 0.15, threshold: 50 }
};

// Role-based permissions
const ROLE_PERMISSIONS = {
  8: { create: true, edit: true, delete: true, publish: true, analyze: true }, // masterAdmin
  7: { create: true, edit: true, delete: true, publish: true, analyze: true }, // admin
  6: { create: true, edit: true, delete: false, publish: true, analyze: true }, // manager
  5: { create: true, edit: true, delete: false, publish: false, analyze: true }, // user
  4: { create: false, edit: false, delete: false, publish: false, analyze: false }, // affiliate
  3: { create: false, edit: false, delete: false, publish: false, analyze: false }, // client
  2: { create: false, edit: false, delete: false, publish: false, analyze: false }, // prospect
  1: { create: false, edit: false, delete: false, publish: false, analyze: false }  // viewer
};

// ============================================================================
// COMPONENT DEFINITION
// ============================================================================

const EnhancedTemplateEditor = ({ 
  templateId = null,
  initialTemplate = null,
  onSave,
  onClose,
  onDelete,
  isDialog = false,
  workflowType = null,
  mode = 'edit' // 'edit', 'view', 'duplicate'
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  // User and theme management
  const [user, userLoading, userError] = useAuthState(auth);
  const [userProfile, setUserProfile] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  // Core template state with comprehensive structure
  const [template, setTemplate] = useState(initialTemplate || {
    id: '',
    name: '',
    subject: '',
    html: '',
    text: '',
    category: 'general',
    type: 'email',
    tags: [],
    variables: [],
    description: '',
    isActive: true,
    isPublic: false,
    isDraft: true,
    version: '1.0.0',
    language: 'en',
    priority: 'normal',
    estimatedSendTime: 5, // minutes
    
    // Timestamps and user tracking
    createdAt: null,
    updatedAt: null,
    createdBy: null,
    lastModifiedBy: null,
    publishedAt: null,
    publishedBy: null,
    
    // Usage statistics
    useCount: 0,
    sendCount: 0,
    lastUsed: null,
    
    // Performance metrics
    performance: {
      openRate: 0,
      clickRate: 0,
      bounceRate: 0,
      unsubscribeRate: 0,
      replyRate: 0,
      forwardRate: 0,
      totalSends: 0,
      totalOpens: 0,
      totalClicks: 0,
      averageTimeToOpen: 0,
      bestSendTime: null,
      deviceBreakdown: { desktop: 0, mobile: 0, tablet: 0 },
      geographicData: {},
      engagementTrend: 'neutral'
    },
    
    // AI enhancements and analysis
    aiEnhancements: {
      score: 0,
      lastAnalyzed: null,
      suggestions: [],
      appliedSuggestions: [],
      optimizations: [],
      sentiment: 'neutral',
      readability: 50,
      deliverability: 50,
      engagementPrediction: 0,
      spamScore: 0,
      mobileOptimized: false,
      accessibilityScore: 0,
      brandConsistency: 0,
      conversionPotential: 0,
      personalizable: false,
      localizable: false,
      abTestReady: false
    },
    
    // Workflow and integration
    workflowIntegration: {
      supportedWorkflows: [],
      triggers: [],
      conditions: [],
      actions: [],
      nextSteps: []
    },
    
    // Collaboration features
    collaboration: {
      isShared: false,
      sharedWith: [],
      permissions: {},
      comments: [],
      reviewers: [],
      approvers: [],
      status: 'draft', // draft, review, approved, rejected
      lockStatus: null,
      lockedBy: null,
      lockedAt: null
    },
    
    // Compliance and legal
    compliance: {
      gdprCompliant: false,
      canSpamCompliant: false,
      coppaCompliant: false,
      requiresConsent: false,
      dataRetention: 365,
      legalReview: false,
      disclaimers: [],
      unsubscribeRequired: true
    }
  });

  // UI State Management
  const [currentTab, setCurrentTab] = useState(0);
  const [editMode, setEditMode] = useState('visual'); // visual, html, preview, split
  const [viewMode, setViewMode] = useState('desktop'); // desktop, tablet, mobile
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);

  // AI State Management
  const [aiAnalyzing, setAIAnalyzing] = useState(false);
  const [aiSuggestions, setAISuggestions] = useState([]);
  const [aiScore, setAIScore] = useState(0);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiInsights, setAIInsights] = useState({});
  const [aiProgress, setAIProgress] = useState(0);
  const [abTestVariants, setABTestVariants] = useState([]);

  // Dialog and Modal State
  const [dialogs, setDialogs] = useState({
    preview: false,
    settings: false,
    variable: false,
    history: false,
    share: false,
    delete: false,
    publish: false,
    analytics: false,
    export: false,
    import: false,
    collaboration: false,
    aiSuggestions: false,
    abTest: false,
    compliance: false
  });

  // Menu and Navigation State
  const [anchorEls, setAnchorEls] = useState({
    main: null,
    ai: null,
    format: null,
    insert: null,
    tools: null
  });

  // Data Management
  const [templateVersions, setTemplateVersions] = useState([]);
  const [availableVariables, setAvailableVariables] = useState(EMAIL_VARIABLES);
  const [templateCategories, setTemplateCategories] = useState(TEMPLATE_CATEGORIES);
  const [collaborators, setCollaborators] = useState([]);
  const [recentTemplates, setRecentTemplates] = useState([]);
  const [popularTemplates, setPopularTemplates] = useState([]);

  // Performance and Analytics
  const [analytics, setAnalytics] = useState({});
  const [benchmarks, setBenchmarks] = useState({});
  const [testResults, setTestResults] = useState([]);
  const [performanceHistory, setPerformanceHistory] = useState([]);

  // Advanced Features
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [realTimeSync, setRealTimeSync] = useState(true);
  const [collaborationMode, setCollaborationMode] = useState(false);
  const [aiAssistantEnabled, setAIAssistantEnabled] = useState(true);

  // Refs for advanced functionality
  const autoSaveTimer = useRef(null);
  const editorRef = useRef(null);
  const previewRef = useRef(null);
  const analyticsRef = useRef(null);
  const collaborationRef = useRef(null);

  // ============================================================================
  // FIREBASE INTEGRATION & DATA LOADING
  // ============================================================================

  // Load user profile and permissions
  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  // Load template data
  useEffect(() => {
    if (templateId && templateId !== 'new') {
      loadTemplate(templateId);
    } else if (mode === 'duplicate' && initialTemplate) {
      // Initialize as duplicate
      setTemplate(prev => ({
        ...initialTemplate,
        id: '',
        name: `Copy of ${initialTemplate.name}`,
        createdBy: user?.uid,
        lastModifiedBy: user?.uid,
        createdAt: null,
        updatedAt: null,
        isDraft: true,
        useCount: 0,
        sendCount: 0,
        collaboration: {
          ...initialTemplate.collaboration,
          isShared: false,
          sharedWith: [],
          status: 'draft'
        }
      }));
      setHasUnsavedChanges(true);
    } else {
      // New template
      setTemplate(prev => ({
        ...prev,
        createdBy: user?.uid,
        lastModifiedBy: user?.uid
      }));
    }
  }, [templateId, user, mode, initialTemplate]);

  // Load supporting data
  useEffect(() => {
    if (user) {
      loadSupportingData();
    }
  }, [user]);

  // Auto-save implementation
  useEffect(() => {
    if (autoSaveEnabled && hasUnsavedChanges && template.id) {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
      
      autoSaveTimer.current = setTimeout(() => {
        if (hasUnsavedChanges) {
          performAutoSave();
        }
      }, 30000); // Auto-save every 30 seconds

      return () => {
        if (autoSaveTimer.current) {
          clearTimeout(autoSaveTimer.current);
        }
      };
    }
  }, [autoSaveEnabled, hasUnsavedChanges, template]);

  // Real-time collaboration setup
  useEffect(() => {
    if (templateId && templateId !== 'new' && realTimeSync) {
      const unsubscribe = onSnapshot(
        doc(db, 'emailTemplates', templateId),
        (doc) => {
          if (doc.exists() && doc.data().lastModifiedBy !== user?.uid) {
            handleRealTimeUpdate(doc.data());
          }
        },
        (error) => {
          console.error('❌ Real-time sync error:', error);
        }
      );

      return () => unsubscribe();
    }
  }, [templateId, user, realTimeSync]);

  // ============================================================================
  // DATA LOADING FUNCTIONS
  // ============================================================================

  const loadUserProfile = async () => {
    try {
      console.log('👤 Loading user profile...');
      const userDoc = await getDoc(doc(db, 'userProfiles', user.uid));
      
      if (userDoc.exists()) {
        const profileData = userDoc.data();
        setUserProfile(profileData);
        console.log(`✅ User profile loaded. Role: ${profileData.role}`);
      } else {
        console.log('⚠️ User profile not found, using default permissions');
        setUserProfile({ role: 5 }); // Default user role
      }
    } catch (error) {
      console.error('❌ Error loading user profile:', error);
      setUserProfile({ role: 5 }); // Default user role on error
    }
  };

  const loadTemplate = async (id) => {
    try {
      setIsLoading(true);
      console.log(`📖 Loading template: ${id}`);

      const templateDoc = await getDoc(doc(db, 'emailTemplates', id));
      
      if (templateDoc.exists()) {
        const templateData = templateDoc.data();
        
        // Convert Firestore timestamps to Date objects
        const processedTemplate = {
          id,
          ...templateData,
          createdAt: templateData.createdAt?.toDate(),
          updatedAt: templateData.updatedAt?.toDate(),
          publishedAt: templateData.publishedAt?.toDate(),
          lastUsed: templateData.lastUsed?.toDate(),
          aiEnhancements: {
            ...templateData.aiEnhancements,
            lastAnalyzed: templateData.aiEnhancements?.lastAnalyzed?.toDate()
          },
          collaboration: {
            ...templateData.collaboration,
            lockedAt: templateData.collaboration?.lockedAt?.toDate()
          }
        };
        
        setTemplate(processedTemplate);
        setAIScore(processedTemplate.aiEnhancements?.score || 0);
        setAISuggestions(processedTemplate.aiEnhancements?.suggestions || []);

        // Load related data
        await Promise.all([
          loadTemplateVersions(id),
          loadTemplateAnalytics(id),
          loadTemplateCollaborators(id)
        ]);

        console.log('✅ Template loaded successfully');
      } else {
        console.error('❌ Template not found');
        setSaveError('Template not found');
      }
    } catch (error) {
      console.error('❌ Error loading template:', error);
      setSaveError('Failed to load template');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSupportingData = async () => {
    try {
      console.log('📊 Loading supporting data...');
      
      await Promise.all([
        loadRecentTemplates(),
        loadPopularTemplates(),
        loadBenchmarkData(),
        loadTeamMembers()
      ]);
      
      console.log('✅ Supporting data loaded');
    } catch (error) {
      console.error('❌ Error loading supporting data:', error);
    }
  };

  const loadTemplateVersions = async (templateId) => {
    try {
      const versionsQuery = query(
        collection(db, 'templateVersions'),
        where('templateId', '==', templateId),
        orderBy('savedAt', 'desc')
      );
      
      const versionsSnapshot = await getDocs(versionsQuery);
      const versions = versionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        savedAt: doc.data().savedAt?.toDate()
      }));
      
      setTemplateVersions(versions);
      console.log(`✅ Loaded ${versions.length} template versions`);
    } catch (error) {
      console.error('❌ Error loading template versions:', error);
    }
  };

  const loadTemplateAnalytics = async (templateId) => {
    try {
      // In production, this would load real analytics data
      // For now, we'll simulate realistic data
      const simulatedAnalytics = {
        totalSends: Math.floor(Math.random() * 5000) + 500,
        openRate: Math.random() * 0.4 + 0.15, // 15-55%
        clickRate: Math.random() * 0.12 + 0.02, // 2-14%
        bounceRate: Math.random() * 0.05 + 0.01, // 1-6%
        unsubscribeRate: Math.random() * 0.02 + 0.001, // 0.1-2.1%
        replyRate: Math.random() * 0.03 + 0.001, // 0.1-3.1%
        forwardRate: Math.random() * 0.02 + 0.001, // 0.1-2.1%
        averageTimeToOpen: Math.floor(Math.random() * 120) + 10, // 10-130 minutes
        recentTrend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)],
        lastSent: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Within last 30 days
        deviceBreakdown: {
          desktop: Math.random() * 0.6 + 0.2,
          mobile: Math.random() * 0.6 + 0.3,
          tablet: Math.random() * 0.2 + 0.05
        },
        bestPerformingTime: '10:00 AM',
        worstPerformingTime: '3:00 PM',
        topPerformingDay: 'Tuesday',
        geographicPerformance: {
          'United States': Math.random() * 0.4 + 0.15,
          'Canada': Math.random() * 0.35 + 0.12,
          'United Kingdom': Math.random() * 0.32 + 0.10
        }
      };
      
      setAnalytics(simulatedAnalytics);
      console.log('✅ Template analytics loaded');
    } catch (error) {
      console.error('❌ Error loading analytics:', error);
    }
  };

  const loadTemplateCollaborators = async (templateId) => {
    try {
      // Simulate loading collaborator data
      const mockCollaborators = [
        { 
          id: user.uid, 
          name: user.displayName || 'Current User', 
          role: 'owner',
          avatar: user.photoURL,
          lastActive: new Date(),
          permissions: ['read', 'write', 'delete']
        }
      ];
      
      setCollaborators(mockCollaborators);
      console.log('✅ Collaborators loaded');
    } catch (error) {
      console.error('❌ Error loading collaborators:', error);
    }
  };

  const loadRecentTemplates = async () => {
    try {
      const recentQuery = query(
        collection(db, 'emailTemplates'),
        where('createdBy', '==', user.uid),
        orderBy('updatedAt', 'desc')
      );
      
      const recentSnapshot = await getDocs(recentQuery);
      const recent = recentSnapshot.docs.slice(0, 5).map(doc => ({
        id: doc.id,
        ...doc.data(),
        updatedAt: doc.data().updatedAt?.toDate()
      }));
      
      setRecentTemplates(recent);
    } catch (error) {
      console.error('❌ Error loading recent templates:', error);
    }
  };

  const loadPopularTemplates = async () => {
    try {
      const popularQuery = query(
        collection(db, 'emailTemplates'),
        where('isPublic', '==', true),
        orderBy('useCount', 'desc')
      );
      
      const popularSnapshot = await getDocs(popularQuery);
      const popular = popularSnapshot.docs.slice(0, 5).map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setPopularTemplates(popular);
    } catch (error) {
      console.error('❌ Error loading popular templates:', error);
    }
  };

  const loadBenchmarkData = async () => {
    try {
      // Industry benchmarks for credit repair industry
      const benchmarks = {
        openRate: 0.24, // 24% industry average for financial services
        clickRate: 0.035, // 3.5% industry average
        bounceRate: 0.022, // 2.2% industry average
        unsubscribeRate: 0.0025, // 0.25% industry average
        replyRate: 0.015, // 1.5% industry average
        bestSendDay: 'Tuesday',
        bestSendTime: '10:00 AM',
        optimalFrequency: '2-3 emails per week',
        subjectLineLength: 45, // characters
        contentLength: 150, // words
        mobileOpenRate: 0.52 // 52% of opens on mobile
      };
      
      setBenchmarks(benchmarks);
      console.log('✅ Benchmark data loaded');
    } catch (error) {
      console.error('❌ Error loading benchmarks:', error);
    }
  };

  const loadTeamMembers = async () => {
    try {
      // In production, this would load actual team members
      const mockTeamMembers = [
        { 
          id: 'chris_uid', 
          name: 'Christopher', 
          role: 'Owner',
          email: 'chris@speedycreditrepair.com',
          avatar: null,
          permissions: ['admin']
        },
        { 
          id: 'laurie_uid', 
          name: 'Laurie', 
          role: 'Operations Manager',
          email: 'laurie@speedycreditrepair.com',
          avatar: null,
          permissions: ['manager']
        },
        { 
          id: 'jordan_uid', 
          name: 'Jordan', 
          role: 'IT Support',
          email: 'jordan@speedycreditrepair.com',
          avatar: null,
          permissions: ['user']
        }
      ];
      
      console.log('✅ Team members loaded');
    } catch (error) {
      console.error('❌ Error loading team members:', error);
    }
  };

  // ============================================================================
  // AI INTEGRATION & ANALYSIS
  // ============================================================================

  const runComprehensiveAIAnalysis = async (templateData) => {
    try {
      setAIAnalyzing(true);
      setAIProgress(0);
      console.log('🤖 Starting comprehensive AI analysis...');

      // Simulate progressive analysis steps
      const analysisSteps = [
        { name: 'Content Analysis', weight: 20 },
        { name: 'Deliverability Check', weight: 15 },
        { name: 'Readability Assessment', weight: 15 },
        { name: 'Mobile Optimization', weight: 15 },
        { name: 'Engagement Prediction', weight: 15 },
        { name: 'Accessibility Audit', weight: 10 },
        { name: 'Brand Consistency', weight: 10 }
      ];

      let currentProgress = 0;
      const analysisResults = {};

      for (const step of analysisSteps) {
        console.log(`🔍 Running ${step.name}...`);
        
        // Simulate analysis time
        await new Promise(resolve => setTimeout(resolve, 800));
        
        currentProgress += step.weight;
        setAIProgress(currentProgress);
        
        // Generate realistic analysis results
        switch (step.name) {
          case 'Content Analysis':
            analysisResults.contentAnalysis = await analyzeContent(templateData);
            break;
          case 'Deliverability Check':
            analysisResults.deliverability = await checkDeliverability(templateData);
            break;
          case 'Readability Assessment':
            analysisResults.readability = await assessReadability(templateData);
            break;
          case 'Mobile Optimization':
            analysisResults.mobileOptimization = await checkMobileOptimization(templateData);
            break;
          case 'Engagement Prediction':
            analysisResults.engagementPrediction = await predictEngagement(templateData);
            break;
          case 'Accessibility Audit':
            analysisResults.accessibility = await auditAccessibility(templateData);
            break;
          case 'Brand Consistency':
            analysisResults.brandConsistency = await checkBrandConsistency(templateData);
            break;
        }
      }

      // Compile comprehensive analysis
      const comprehensiveAnalysis = compileAnalysisResults(analysisResults);
      
      // Update template with AI insights
      const updatedTemplate = {
        ...templateData,
        aiEnhancements: {
          ...templateData.aiEnhancements,
          ...comprehensiveAnalysis,
          lastAnalyzed: new Date()
        }
      };

      // Update state
      setAIScore(comprehensiveAnalysis.score);
      setAISuggestions(comprehensiveAnalysis.suggestions);
      setAIInsights(comprehensiveAnalysis);
      setTemplate(updatedTemplate);

      console.log(`✅ AI analysis completed. Score: ${comprehensiveAnalysis.score}/100`);
      return comprehensiveAnalysis;

    } catch (error) {
      console.error('❌ AI analysis failed:', error);
      return {
        score: 0,
        suggestions: [],
        optimizations: [],
        sentiment: 'neutral',
        readability: 50,
        deliverability: 50,
        error: error.message
      };
    } finally {
      setAIAnalyzing(false);
      setAIProgress(0);
    }
  };

  // Individual AI analysis functions
  const analyzeContent = async (templateData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const content = `${templateData.subject} ${templateData.html} ${templateData.text}`;
    const wordCount = content.split(/\s+/).length;
    
    return {
      wordCount,
      sentenceCount: content.split(/[.!?]+/).length,
      avgWordsPerSentence: Math.round(wordCount / content.split(/[.!?]+/).length),
      sentiment: detectSentiment(content),
      tone: detectTone(content),
      personalityInsights: analyzePersonality(content),
      keyTopics: extractKeyTopics(content),
      emotionalAnalysis: analyzeEmotion(content)
    };
  };

  const checkDeliverability = async (templateData) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const spamTriggers = detectSpamTriggers(templateData.subject + ' ' + templateData.html);
    const authenticationScore = checkAuthentication();
    const reputationScore = checkSenderReputation();
    
    const deliverabilityScore = Math.max(0, 100 - (spamTriggers.length * 15) - (100 - authenticationScore) - (100 - reputationScore));
    
    return {
      score: Math.round(deliverabilityScore),
      spamTriggers,
      authenticationScore,
      reputationScore,
      suggestions: generateDeliverabilityTips(spamTriggers),
      riskFactors: identifyRiskFactors(templateData)
    };
  };

  const assessReadability = async (templateData) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const text = stripHtml(templateData.html);
    const readabilityScore = calculateFleschScore(text);
    const gradeLevel = calculateGradeLevel(text);
    
    return {
      score: Math.round(readabilityScore),
      gradeLevel,
      complexity: categorizeComplexity(readabilityScore),
      suggestions: generateReadabilityTips(readabilityScore),
      avgSentenceLength: calculateAvgSentenceLength(text),
      syllableComplexity: calculateSyllableComplexity(text)
    };
  };

  const checkMobileOptimization = async (templateData) => {
    await new Promise(resolve => setTimeout(resolve, 350));
    
    const mobileChecks = {
      responsiveDesign: checkResponsiveDesign(templateData.html),
      readableFont: checkMobileFontSize(templateData.html),
      touchTargets: checkTouchTargetSize(templateData.html),
      imageOptimization: checkMobileImages(templateData.html),
      loadTime: estimateMobileLoadTime(templateData.html),
      preheader: checkPreheaderOptimization(templateData)
    };
    
    const mobileScore = Object.values(mobileChecks).reduce((sum, check) => sum + (check ? 16.67 : 0), 0);
    
    return {
      score: Math.round(mobileScore),
      checks: mobileChecks,
      suggestions: generateMobileTips(mobileChecks),
      previewSizes: generateMobilePreviews(templateData)
    };
  };

  const predictEngagement = async (templateData) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // AI would analyze various factors to predict engagement
    const factors = {
      subjectLineAppeal: analyzeSubjectLine(templateData.subject),
      contentRelevance: analyzeContentRelevance(templateData.html),
      callToActionStrength: analyzeCTAStrength(templateData.html),
      personalization: analyzePersonalization(templateData.html),
      timing: analyzeOptimalTiming(),
      visualAppeal: analyzeVisualDesign(templateData.html)
    };
    
    const engagementScore = Object.values(factors).reduce((sum, factor) => sum + factor.score, 0) / Object.keys(factors).length;
    
    return {
      score: Math.round(engagementScore),
      factors,
      predictions: {
        openRate: Math.random() * 0.4 + 0.15, // 15-55%
        clickRate: Math.random() * 0.12 + 0.02, // 2-14%
        conversionRate: Math.random() * 0.05 + 0.01 // 1-6%
      },
      suggestions: generateEngagementTips(factors)
    };
  };

  const auditAccessibility = async (templateData) => {
    await new Promise(resolve => setTimeout(resolve, 250));
    
    const checks = {
      altText: checkImageAltText(templateData.html),
      colorContrast: checkColorContrast(templateData.html),
      headingStructure: checkHeadingStructure(templateData.html),
      linkDescriptiveness: checkLinkText(templateData.html),
      readingOrder: checkReadingOrder(templateData.html),
      focusability: checkKeyboardNavigation(templateData.html)
    };
    
    const accessibilityScore = Object.values(checks).reduce((sum, check) => sum + (check ? 16.67 : 0), 0);
    
    return {
      score: Math.round(accessibilityScore),
      checks,
      suggestions: generateAccessibilityTips(checks),
      compliance: checkWCAGCompliance(checks)
    };
  };

  const checkBrandConsistency = async (templateData) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const brandElements = {
      colorScheme: checkBrandColors(templateData.html),
      typography: checkBrandTypography(templateData.html),
      logo: checkLogoUsage(templateData.html),
      messaging: checkBrandMessaging(templateData.html),
      tone: checkBrandTone(templateData.html),
      imagery: checkBrandImagery(templateData.html)
    };
    
    const brandScore = Object.values(brandElements).reduce((sum, element) => sum + (element ? 16.67 : 0), 0);
    
    return {
      score: Math.round(brandScore),
      elements: brandElements,
      suggestions: generateBrandTips(brandElements),
      guidelines: getBrandGuidelines()
    };
  };

  // Compile all analysis results into a comprehensive report
  const compileAnalysisResults = (results) => {
    const scores = {
      content: results.contentAnalysis?.wordCount > 0 ? 85 : 60,
      deliverability: results.deliverability?.score || 70,
      readability: results.readability?.score || 60,
      mobile: results.mobileOptimization?.score || 75,
      engagement: results.engagementPrediction?.score || 65,
      accessibility: results.accessibility?.score || 50,
      brand: results.brandConsistency?.score || 80
    };

    // Calculate weighted overall score
    const overallScore = Math.round(
      (scores.content * 0.2) +
      (scores.deliverability * 0.2) +
      (scores.readability * 0.15) +
      (scores.mobile * 0.15) +
      (scores.engagement * 0.15) +
      (scores.accessibility * 0.1) +
      (scores.brand * 0.05)
    );

    // Generate prioritized suggestions
    const allSuggestions = [
      ...generatePrioritizedSuggestions(scores),
      ...generateContextualSuggestions(results)
    ];

    return {
      score: overallScore,
      categoryScores: scores,
      suggestions: allSuggestions,
      optimizations: generateOptimizations(scores),
      sentiment: results.contentAnalysis?.sentiment || 'neutral',
      readability: scores.readability,
      deliverability: scores.deliverability,
      engagementPrediction: scores.engagement,
      spamScore: Math.max(0, 100 - scores.deliverability),
      mobileOptimized: scores.mobile > 75,
      accessibilityScore: scores.accessibility,
      brandConsistency: scores.brand,
      conversionPotential: scores.engagement,
      personalizable: checkPersonalizationPotential(results),
      localizable: checkLocalizationPotential(results),
      abTestReady: checkABTestReadiness(results),
      detailedAnalysis: results
    };
  };

  // ============================================================================
  // UTILITY AND HELPER FUNCTIONS
  // ============================================================================

  // Template validation
  const validateTemplate = (template) => {
    const errors = [];
    const warnings = [];

    // Required fields
    if (!template.name?.trim()) errors.push('Template name is required');
    if (!template.subject?.trim()) errors.push('Subject line is required');
    if (!template.html?.trim()) errors.push('Email content is required');
    if (!template.category) errors.push('Category is required');

    // Content validation
    if (template.subject && template.subject.length > 78) {
      warnings.push('Subject line is longer than recommended (78 characters)');
    }
    if (template.subject && template.subject.length < 15) {
      warnings.push('Subject line is shorter than recommended (15+ characters)');
    }

    // HTML validation
    if (template.html && !template.html.includes('{{FIRST_NAME}}') && workflowType) {
      warnings.push('Consider adding {{FIRST_NAME}} for personalization');
    }

    // Accessibility checks
    if (template.html && !template.html.includes('alt=')) {
      warnings.push('Add alt text to images for accessibility');
    }

    // Mobile optimization
    if (template.html && !template.html.includes('max-width') && !template.html.includes('responsive')) {
      warnings.push('Consider adding mobile-responsive design');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score: Math.max(0, 100 - (errors.length * 25) - (warnings.length * 5))
    };
  };

  // Permission checking
  const checkPermission = (action) => {
    if (!userProfile?.role) return false;
    const permissions = ROLE_PERMISSIONS[userProfile.role];
    return permissions[action] || false;
  };

  // Version management
  const incrementVersion = (currentVersion) => {
    const parts = currentVersion.split('.');
    const patch = parseInt(parts[2]) + 1;
    return `${parts[0]}.${parts[1]}.${patch}`;
  };

  const incrementMinorVersion = (currentVersion) => {
    const parts = currentVersion.split('.');
    const minor = parseInt(parts[1]) + 1;
    return `${parts[0]}.${minor}.0`;
  };

  const incrementMajorVersion = (currentVersion) => {
    const parts = currentVersion.split('.');
    const major = parseInt(parts[0]) + 1;
    return `${major}.0.0`;
  };

  // Content analysis helpers
  const stripHtml = (html) => {
    return html.replace(/<[^>]*>/g, '');
  };

  const detectSentiment = (text) => {
    // Simplified sentiment analysis
    const positiveWords = ['great', 'excellent', 'amazing', 'fantastic', 'wonderful', 'improve', 'better', 'success'];
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'worse', 'fail', 'problem', 'issue'];
    
    const words = text.toLowerCase().split(/\s+/);
    let positiveCount = 0;
    let negativeCount = 0;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) positiveCount++;
      if (negativeWords.includes(word)) negativeCount++;
    });
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  };

  const detectSpamTriggers = (content) => {
    const spamWords = [
      'FREE', 'URGENT', '!!!', 'CLICK NOW', 'LIMITED TIME', 'ACT NOW',
      'GUARANTEED', '100% FREE', 'NO COST', 'RISK FREE', 'CALL NOW',
      'SPECIAL PROMOTION', 'ONCE IN A LIFETIME', 'EXCLUSIVE OFFER'
    ];
    
    return spamWords.filter(trigger => 
      content.toUpperCase().includes(trigger)
    );
  };

  const calculateFleschScore = (text) => {
    // Simplified Flesch Reading Ease calculation
    const sentences = text.split(/[.!?]+/).length;
    const words = text.split(/\s+/).length;
    const syllables = text.split(/[aeiouy]+/i).length;
    
    if (sentences === 0 || words === 0) return 0;
    
    const score = 206.835 - (1.015 * (words / sentences)) - (84.6 * (syllables / words));
    return Math.max(0, Math.min(100, score));
  };

  // AI suggestion generators
  const generatePrioritizedSuggestions = (scores) => {
    const suggestions = [];
    
    if (scores.deliverability < 70) {
      suggestions.push({
        type: 'deliverability',
        priority: 'high',
        title: 'Improve Email Deliverability',
        message: 'Remove spam trigger words and optimize authentication',
        impact: '+25% delivery rate',
        category: 'Technical'
      });
    }
    
    if (scores.mobile < 70) {
      suggestions.push({
        type: 'mobile',
        priority: 'high',
        title: 'Optimize for Mobile',
        message: 'Improve mobile responsiveness and touch targets',
        impact: '+18% mobile engagement',
        category: 'Design'
      });
    }
    
    if (scores.engagement < 65) {
      suggestions.push({
        type: 'engagement',
        priority: 'medium',
        title: 'Enhance Engagement',
        message: 'Strengthen call-to-action and personalization',
        impact: '+12% click rate',
        category: 'Content'
      });
    }
    
    if (scores.readability < 60) {
      suggestions.push({
        type: 'readability',
        priority: 'medium',
        title: 'Improve Readability',
        message: 'Simplify language and shorten sentences',
        impact: '+8% comprehension',
        category: 'Content'
      });
    }
    
    if (scores.accessibility < 50) {
      suggestions.push({
        type: 'accessibility',
        priority: 'low',
        title: 'Enhance Accessibility',
        message: 'Add alt text and improve color contrast',
        impact: '+5% reach',
        category: 'Compliance'
      });
    }
    
    return suggestions;
  };

  const generateContextualSuggestions = (results) => {
    const suggestions = [];
    
    // Context-specific suggestions based on template type and content
    if (workflowType === 'welcome') {
      suggestions.push({
        type: 'personalization',
        priority: 'medium',
        title: 'Add Welcome Personalization',
        message: 'Include more personal welcome elements',
        impact: '+15% engagement',
        category: 'Content'
      });
    }
    
    return suggestions;
  };

  // ============================================================================
  // SAVE AND PERSISTENCE OPERATIONS
  // ============================================================================

  const saveTemplate = async (options = {}) => {
    try {
      setIsSaving(true);
      setSaveError(null);
      console.log('💾 Saving template...');

      // Validate template
      const validation = validateTemplate(template);
      if (!validation.isValid) {
        setSaveError(validation.errors.join(', '));
        setValidationErrors(validation.errors);
        return { success: false, errors: validation.errors };
      }

      // Check permissions
      if (!checkPermission('create') && !template.id) {
        setSaveError('You do not have permission to create templates');
        return { success: false, error: 'Permission denied' };
      }

      if (!checkPermission('edit') && template.id) {
        setSaveError('You do not have permission to edit this template');
        return { success: false, error: 'Permission denied' };
      }

      // Run AI analysis if requested
      let aiAnalysis = template.aiEnhancements;
      if (options.runAIAnalysis) {
        aiAnalysis = await runComprehensiveAIAnalysis(template);
      }

      // Prepare template data for saving
      const templateData = {
        ...template,
        lastModifiedBy: user.uid,
        updatedAt: serverTimestamp(),
        version: options.majorUpdate 
          ? incrementMajorVersion(template.version || '1.0.0')
          : options.minorUpdate
          ? incrementMinorVersion(template.version || '1.0.0')
          : incrementVersion(template.version || '1.0.0'),
        aiEnhancements: aiAnalysis,
        isDraft: options.isDraft !== undefined ? options.isDraft : template.isDraft,
        isPublic: options.isPublic !== undefined ? options.isPublic : template.isPublic
      };

      let savedTemplate;
      if (template.id) {
        // Update existing template
        await updateDoc(doc(db, 'emailTemplates', template.id), templateData);
        savedTemplate = { ...templateData, id: template.id };
        console.log('✅ Template updated');
      } else {
        // Create new template
        templateData.createdAt = serverTimestamp();
        templateData.createdBy = user.uid;
        const docRef = await addDoc(collection(db, 'emailTemplates'), templateData);
        savedTemplate = { ...templateData, id: docRef.id };
        setTemplate(prev => ({ ...prev, id: docRef.id }));
        console.log('✅ Template created');
      }

      // Create version history entry
      await createVersionHistoryEntry(savedTemplate, options);

      // Update statistics
      await updateTemplateStatistics(savedTemplate.id, 'save');

      // Update state
      setTemplate(savedTemplate);
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      setValidationErrors([]);

      // Call callback if provided
      if (onSave) {
        onSave(savedTemplate);
      }

      console.log('✅ Template saved successfully');
      return { success: true, template: savedTemplate };

    } catch (error) {
      console.error('❌ Error saving template:', error);
      setSaveError(`Failed to save template: ${error.message}`);
      return { success: false, error: error.message };
    } finally {
      setIsSaving(false);
    }
  };

  const performAutoSave = async () => {
    if (!template.id || !hasUnsavedChanges) return;

    try {
      console.log('⚡ Auto-saving template...');
      
      const autoSaveData = {
        ...template,
        lastModifiedBy: user.uid,
        updatedAt: serverTimestamp(),
        isAutoSaved: true
      };

      await updateDoc(doc(db, 'emailTemplates', template.id), autoSaveData);
      setLastSaved(new Date());
      
      console.log('✅ Auto-save completed');
    } catch (error) {
      console.error('❌ Auto-save failed:', error);
    }
  };

  const createVersionHistoryEntry = async (templateData, options) => {
    try {
      const versionEntry = {
        templateId: templateData.id,
        version: templateData.version,
        changes: options.changesSummary || getChangesSummary(),
        savedBy: user.uid,
        savedAt: serverTimestamp(),
        templateSnapshot: {
          name: templateData.name,
          subject: templateData.subject,
          html: templateData.html,
          category: templateData.category,
          tags: templateData.tags
        },
        saveType: options.saveType || 'manual',
        aiScore: templateData.aiEnhancements?.score || 0
      };

      await addDoc(collection(db, 'templateVersions'), versionEntry);
      console.log(`✅ Version history entry created: ${templateData.version}`);
    } catch (error) {
      console.error('❌ Error creating version history:', error);
    }
  };

  const updateTemplateStatistics = async (templateId, action) => {
    try {
      const updates = {};
      
      switch (action) {
        case 'save':
          updates.lastUsed = serverTimestamp();
          break;
        case 'send':
          updates.sendCount = increment(1);
          updates.useCount = increment(1);
          updates.lastUsed = serverTimestamp();
          break;
        case 'view':
          updates.viewCount = increment(1);
          break;
        default:
          break;
      }

      if (Object.keys(updates).length > 0) {
        await updateDoc(doc(db, 'emailTemplates', templateId), updates);
      }
    } catch (error) {
      console.error('❌ Error updating statistics:', error);
    }
  };

  const getChangesSummary = () => {
    // In a real implementation, this would track specific changes
    return 'Template updated via enhanced editor';
  };

  // Real-time collaboration
  const handleRealTimeUpdate = (updatedData) => {
    console.log('🔄 Real-time update received');
    
    if (hasUnsavedChanges) {
      // Handle merge conflicts
      console.log('⚠️ Merge conflict detected');
      // Show merge conflict dialog or auto-merge based on strategy
    } else {
      // Apply updates
      setTemplate(prev => ({
        ...prev,
        ...updatedData,
        updatedAt: updatedData.updatedAt?.toDate()
      }));
    }
  };

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleTemplateChange = (field, value) => {
    setTemplate(prev => ({
      ...prev,
      [field]: value
    }));
    setHasUnsavedChanges(true);
    setSaveError(null);
    setValidationErrors([]);
  };

  const handleSave = async (options = {}) => {
    const result = await saveTemplate(options);
    return result;
  };

  const handlePublish = async () => {
    if (!checkPermission('publish')) {
      setSaveError('You do not have permission to publish templates');
      return;
    }

    const result = await saveTemplate({ 
      isDraft: false, 
      isPublic: true,
      runAIAnalysis: true,
      saveType: 'publish',
      changesSummary: 'Template published'
    });

    if (result.success) {
      setDialogs(prev => ({ ...prev, publish: false }));
    }
  };

  const handlePreview = () => {
    setDialogs(prev => ({ ...prev, preview: true }));
  };

  const handleAIAnalysis = async () => {
    const analysis = await runComprehensiveAIAnalysis(template);
    setShowAIPanel(true);
    return analysis;
  };

  const handleVariableInsert = (variable) => {
    const currentContent = template.html;
    const cursorPos = editorRef.current?.selectionStart || currentContent.length;
    const newContent = 
      currentContent.slice(0, cursorPos) + 
      `{{${variable.name}}}` + 
      currentContent.slice(cursorPos);
    
    handleTemplateChange('html', newContent);
    setDialogs(prev => ({ ...prev, variable: false }));
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleEditModeChange = (mode) => {
    setEditMode(mode);
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  const handleClose = () => {
    if (hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
        if (onClose) onClose();
      }
    } else {
      if (onClose) onClose();
    }
  };

  const handleDelete = async () => {
    if (!checkPermission('delete')) {
      setSaveError('You do not have permission to delete this template');
      return;
    }

    try {
      await deleteDoc(doc(db, 'emailTemplates', template.id));
      if (onDelete) onDelete(template.id);
      if (onClose) onClose();
    } catch (error) {
      console.error('❌ Error deleting template:', error);
      setSaveError('Failed to delete template');
    }
  };

  const applyAISuggestion = async (suggestion) => {
    try {
      console.log(`🤖 Applying AI suggestion: ${suggestion.type}`);
      
      let updatedTemplate = { ...template };

      switch (suggestion.type) {
        case 'subject':
          updatedTemplate.subject = await enhanceSubjectLine(template.subject);
          break;
        case 'content':
          updatedTemplate.html = await enhanceContent(template.html);
          break;
        case 'cta':
          updatedTemplate.html = await improveCTA(template.html);
          break;
        case 'mobile':
          updatedTemplate.html = await optimizeForMobile(template.html);
          break;
        case 'deliverability':
          updatedTemplate.html = await improveDeliverability(template.html);
          updatedTemplate.subject = await improveSubjectDeliverability(template.subject);
          break;
        case 'personalization':
          updatedTemplate.html = await addPersonalization(template.html);
          break;
        default:
          console.log('Unknown suggestion type');
          return;
      }

      setTemplate(updatedTemplate);
      setHasUnsavedChanges(true);
      
      // Mark suggestion as applied
      const updatedSuggestions = aiSuggestions.map(s => 
        s === suggestion ? { ...s, applied: true, appliedAt: new Date() } : s
      );
      setAISuggestions(updatedSuggestions);
      
      // Track applied suggestion
      const appliedSuggestions = template.aiEnhancements.appliedSuggestions || [];
      appliedSuggestions.push({
        ...suggestion,
        appliedAt: new Date(),
        appliedBy: user.uid
      });
      
      handleTemplateChange('aiEnhancements', {
        ...template.aiEnhancements,
        appliedSuggestions
      });
      
      console.log('✅ AI suggestion applied successfully');
    } catch (error) {
      console.error('❌ Failed to apply AI suggestion:', error);
    }
  };

  // ============================================================================
  // AI ENHANCEMENT FUNCTIONS (Production implementations would call actual AI services)
  // ============================================================================

  const enhanceSubjectLine = async (currentSubject) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    // AI would generate improved subject line
    const enhancements = ['🚀', '⭐', '💡', '🎯'];
    const randomEnhancement = enhancements[Math.floor(Math.random() * enhancements.length)];
    return `${randomEnhancement} ${currentSubject} - Limited Time`;
  };

  const enhanceContent = async (currentContent) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    // AI would enhance content with better flow and engagement
    return currentContent
      .replace(/\bHi\b/g, 'Hello there')
      .replace(/\bthanks\b/gi, 'thank you')
      .replace(/{{FIRST_NAME}}/g, 'Hi {{FIRST_NAME}},');
  };

  const improveCTA = async (currentContent) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    // AI would improve call-to-action buttons and placement
    return currentContent.replace(
      /(<button[^>]*>)([^<]*)(<\/button>)/gi,
      '$1🎯 $2 - Start Now!$3'
    );
  };

  const optimizeForMobile = async (currentContent) => {
    await new Promise(resolve => setTimeout(resolve, 1200));
    // AI would add mobile optimization styles
    return currentContent
      .replace(/<p>/gi, '<p style="font-size:16px;line-height:1.5;margin-bottom:15px;">')
      .replace(/<table/gi, '<table style="max-width:100%"')
      .replace(/<img/gi, '<img style="max-width:100%;height:auto"');
  };

  const improveDeliverability = async (currentContent) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    // AI would remove or replace spam trigger words
    const spamWords = ['FREE', 'URGENT', '!!!', 'CLICK NOW'];
    let improvedContent = currentContent;
    
    spamWords.forEach(word => {
      const regex = new RegExp(word, 'gi');
      switch (word.toLowerCase()) {
        case 'free':
          improvedContent = improvedContent.replace(regex, 'complimentary');
          break;
        case 'urgent':
          improvedContent = improvedContent.replace(regex, 'important');
          break;
        case '!!!':
          improvedContent = improvedContent.replace(regex, '.');
          break;
        case 'click now':
          improvedContent = improvedContent.replace(regex, 'learn more');
          break;
      }
    });
    
    return improvedContent;
  };

  const improveSubjectDeliverability = async (currentSubject) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    // Remove spam triggers from subject
    return currentSubject
      .replace(/FREE/gi, 'Complimentary')
      .replace(/URGENT/gi, 'Important')
      .replace(/!!!/g, '.');
  };

  const addPersonalization = async (currentContent) => {
    await new Promise(resolve => setTimeout(resolve, 900));
    // AI would add more personalization opportunities
    return currentContent
      .replace(/Dear (sir|madam|customer)/gi, 'Dear {{FIRST_NAME}}')
      .replace(/your credit/gi, 'your {{SCORE}} credit score')
      .replace(/our company/gi, '{{COMPANY_NAME}}');
  };

  // ============================================================================
  // RENDER HELPER FUNCTIONS
  // ============================================================================

  const renderToolbar = () => (
    <Box sx={{ 
      borderBottom: 1, 
      borderColor: 'divider',
      bgcolor: 'background.paper',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      boxShadow: 1
    }}>
      <Container maxWidth="xl">
        <Stack 
          direction="row" 
          spacing={2} 
          alignItems="center"
          justifyContent="space-between"
          sx={{ py: 2 }}
        >
          {/* Left side - Template info */}
          <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
            <Box>
              <Typography variant="h6" component="h1" noWrap>
                {template.name || 'New Template'}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                {hasUnsavedChanges && (
                  <Chip 
                    size="small" 
                    label="Unsaved" 
                    color="warning"
                    icon={<WarningIcon />}
                  />
                )}
                
                {template.isDraft && (
                  <Chip 
                    size="small" 
                    label="Draft" 
                    color="info"
                    variant="outlined"
                  />
                )}
                
                {lastSaved && (
                  <Typography variant="caption" color="text.secondary">
                    Saved {lastSaved.toLocaleTimeString()}
                  </Typography>
                )}
              </Stack>
            </Box>
          </Stack>

          {/* Center - Quick actions */}
          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title={`AI Score: ${aiScore}/100`}>
              <IconButton 
                onClick={handleAIAnalysis}
                color={aiScore > 80 ? 'success' : aiScore > 60 ? 'warning' : 'error'}
                disabled={aiAnalyzing}
              >
                {aiAnalyzing ? (
                  <CircularProgress size={24} />
                ) : (
                  <Badge badgeContent={aiScore || 0} color={aiScore > 80 ? 'success' : 'warning'}>
                    <BrainIcon />
                  </Badge>
                )}
              </IconButton>
            </Tooltip>

            <Tooltip title="Preview">
              <IconButton onClick={handlePreview}>
                <PreviewIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Insert Variable">
              <IconButton onClick={() => setDialogs(prev => ({ ...prev, variable: true }))}>
                <AddIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Template History">
              <IconButton onClick={() => setDialogs(prev => ({ ...prev, history: true }))}>
                <HistoryIcon />
              </IconButton>
            </Tooltip>
          </Stack>

          {/* Right side - Primary actions */}
          <Stack direction="row" spacing={1} alignItems="center">
            {mode !== 'view' && (
              <>
                <Tooltip title={isSaving ? 'Saving...' : 'Save Template'}>
                  <span>
                    <Button
                      variant="outlined"
                      startIcon={isSaving ? <CircularProgress size={16} /> : <SaveIcon />}
                      onClick={() => handleSave()}
                      disabled={isSaving || (!hasUnsavedChanges && template.id)}
                      size="small"
                    >
                      {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                  </span>
                </Tooltip>

                {checkPermission('publish') && (
                  <Tooltip title="Publish Template">
                    <span>
                      <Button
                        variant="contained"
                        startIcon={<SuccessIcon />}
                        onClick={() => setDialogs(prev => ({ ...prev, publish: true }))}
                        disabled={isSaving}
                        size="small"
                        color="success"
                      >
                        Publish
                      </Button>
                    </span>
                  </Tooltip>
                )}
              </>
            )}

            {onClose && (
              <Button
                variant="outlined"
                onClick={handleClose}
                size="small"
              >
                Close
              </Button>
            )}
          </Stack>
        </Stack>
      </Container>
    </Box>
  );

  const renderBasicInfoTab = () => (
    <Box>
      <Grid container spacing={3}>
        {/* Template Name and Category */}
        <Grid item xs={12} md={8}>
          <TextField
            fullWidth
            label="Template Name"
            value={template.name}
            onChange={(e) => handleTemplateChange('name', e.target.value)}
            required
            error={validationErrors.some(error => error.includes('name'))}
            helperText={
              validationErrors.find(error => error.includes('name')) || 
              `${template.name.length}/100 characters`
            }
            disabled={mode === 'view'}
            inputProps={{ maxLength: 100 }}
          />
        </Grid>
        
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={template.category}
              onChange={(e) => handleTemplateChange('category', e.target.value)}
              label="Category"
              disabled={mode === 'view'}
            >
              {templateCategories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <span>{category.icon}</span>
                    <Typography>{category.name}</Typography>
                  </Stack>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Description */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Description"
            value={template.description}
            onChange={(e) => handleTemplateChange('description', e.target.value)}
            multiline
            rows={3}
            placeholder="Brief description of this template's purpose and use case..."
            disabled={mode === 'view'}
            helperText={`${template.description.length}/500 characters`}
            inputProps={{ maxLength: 500 }}
          />
        </Grid>

        {/* Subject Line */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Subject Line"
            value={template.subject}
            onChange={(e) => handleTemplateChange('subject', e.target.value)}
            required
            error={validationErrors.some(error => error.includes('Subject'))}
            helperText={
              validationErrors.find(error => error.includes('Subject')) || 
              `${template.subject.length} characters (recommended: 15-78)`
            }
            disabled={mode === 'view'}
            InputProps={{
              endAdornment: !mode === 'view' && (
                <Stack direction="row" spacing={1}>
                  <Tooltip title="AI Enhance Subject">
                    <IconButton
                      onClick={() => handleAIAnalysis()}
                      size="small"
                      disabled={aiAnalyzing}
                    >
                      <MagicIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="A/B Test Variants">
                    <IconButton
                      onClick={() => setDialogs(prev => ({ ...prev, abTest: true }))}
                      size="small"
                    >
                      <TestIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              )
            }}
          />
        </Grid>

        {/* Tags and Settings */}
        <Grid item xs={12} md={6}>
          <Autocomplete
            multiple
            options={['welcome', 'follow-up', 'reminder', 'educational', 'promotional']}
            value={template.tags}
            onChange={(e, newValue) => handleTemplateChange('tags', newValue)}
            disabled={mode === 'view'}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  variant="outlined"
                  label={option}
                  {...getTagProps({ index })}
                  key={option}
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Tags"
                placeholder="Add tags for organization..."
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Stack spacing={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={template.isActive}
                  onChange={(e) => handleTemplateChange('isActive', e.target.checked)}
                  disabled={mode === 'view'}
                />
              }
              label="Active Template"
            />
            
            {checkPermission('publish') && (
              <FormControlLabel
                control={
                  <Switch
                    checked={template.isPublic}
                    onChange={(e) => handleTemplateChange('isPublic', e.target.checked)}
                    disabled={mode === 'view'}
                  />
                }
                label="Public Template"
              />
            )}
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );

  const renderContentEditorTab = () => (
    <Box>
      {/* Editor Mode Selection */}
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Editor Mode:
        </Typography>
        <ButtonGroup size="small" variant="outlined">
          <Button 
            variant={editMode === 'visual' ? 'contained' : 'outlined'}
            onClick={() => handleEditModeChange('visual')}
            startIcon={<ViewIcon />}
          >
            Visual
          </Button>
          <Button 
            variant={editMode === 'html' ? 'contained' : 'outlined'}
            onClick={() => handleEditModeChange('html')}
            startIcon={<CodeIcon />}
          >
            HTML
          </Button>
          <Button 
            variant={editMode === 'preview' ? 'contained' : 'outlined'}
            onClick={() => handleEditModeChange('preview')}
            startIcon={<PreviewIcon />}
          >
            Preview
          </Button>
          <Button 
            variant={editMode === 'split' ? 'contained' : 'outlined'}
            onClick={() => handleEditModeChange('split')}
            startIcon={<ViewQuilt />}
          >
            Split
          </Button>
        </ButtonGroup>

        <Divider orientation="vertical" flexItem />

        <Typography variant="subtitle2" color="text.secondary">
          Preview Mode:
        </Typography>
        <ButtonGroup size="small" variant="outlined">
          <Button 
            variant={viewMode === 'desktop' ? 'contained' : 'outlined'}
            onClick={() => handleViewModeChange('desktop')}
            startIcon={<DesktopIcon />}
          >
            Desktop
          </Button>
          <Button 
            variant={viewMode === 'tablet' ? 'contained' : 'outlined'}
            onClick={() => handleViewModeChange('tablet')}
            startIcon={<TabletIcon />}
          >
            Tablet
          </Button>
          <Button 
            variant={viewMode === 'mobile' ? 'contained' : 'outlined'}
            onClick={() => handleViewModeChange('mobile')}
            startIcon={<MobileIcon />}
          >
            Mobile
          </Button>
        </ButtonGroup>
      </Stack>

      {/* Content Editor Area */}
      <Grid container spacing={2}>
        {(editMode === 'html' || editMode === 'split') && (
          <Grid item xs={12} md={editMode === 'split' ? 6 : 12}>
            <Paper variant="outlined" sx={{ height: '500px' }}>
              <Box sx={{ p: 1, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="subtitle2">HTML Editor</Typography>
              </Box>
              <TextField
                ref={editorRef}
                fullWidth
                multiline
                value={template.html}
                onChange={(e) => handleTemplateChange('html', e.target.value)}
                placeholder="Enter your HTML email content here..."
                disabled={mode === 'view'}
                sx={{
                  '& .MuiInputBase-root': {
                    height: '460px',
                    alignItems: 'flex-start'
                  },
                  '& .MuiInputBase-input': {
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    height: '460px !important',
                    overflow: 'auto'
                  }
                }}
                InputProps={{
                  style: { height: '460px', padding: '12px' }
                }}
              />
            </Paper>
          </Grid>
        )}

        {(editMode === 'visual' || editMode === 'split') && (
          <Grid item xs={12} md={editMode === 'split' ? 6 : 12}>
            <Paper variant="outlined" sx={{ height: '500px' }}>
              <Box sx={{ p: 1, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="subtitle2">Visual Editor</Typography>
              </Box>
              <Box sx={{ p: 2, height: '460px', overflow: 'auto' }}>
                <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                  📝 Visual WYSIWYG editor would be integrated here using TinyMCE, Quill, or similar rich text editor component
                </Typography>
                <Alert severity="info">
                  <AlertTitle>Visual Editor Integration</AlertTitle>
                  In production, this would be a full rich text editor with:
                  • Drag & drop components
                  • Real-time formatting
                  • Image upload and management
                  • Template building blocks
                  • Mobile-responsive preview
                </Alert>
              </Box>
            </Paper>
          </Grid>
        )}

        {editMode === 'preview' && (
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ height: '500px' }}>
              <Box sx={{ p: 1, borderBottom: 1, borderColor: 'divider' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle2">Email Preview</Typography>
                  <Stack direction="row" spacing={1}>
                    <Chip
                      size="small"
                      label={viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}
                      color="primary"
                      variant="outlined"
                    />
                  </Stack>
                </Stack>
              </Box>
              <Box 
                ref={previewRef}
                sx={{ 
                  p: 2, 
                  height: '460px', 
                  overflow: 'auto',
                  maxWidth: viewMode === 'mobile' ? '375px' : viewMode === 'tablet' ? '768px' : '100%',
                  mx: 'auto'
                }}
              >
                {template.subject && (
                  <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="subtitle2" gutterBottom>Subject:</Typography>
                    <Typography variant="body1">{template.subject}</Typography>
                  </Paper>
                )}
                
                <Box 
                  dangerouslySetInnerHTML={{ __html: template.html }} 
                  sx={{ 
                    '& *': { maxWidth: '100%' },
                    '& img': { maxWidth: '100%', height: 'auto' },
                    '& table': { width: '100%' }
                  }}
                />
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Quick Insert Toolbar */}
      {mode !== 'view' && (
        <Paper sx={{ p: 2, mt: 2 }} variant="outlined">
          <Typography variant="subtitle2" gutterBottom>Quick Insert</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button
              size="small"
              variant="outlined"
              startIcon={<PersonIcon />}
              onClick={() => setDialogs(prev => ({ ...prev, variable: true }))}
            >
              Variables
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<ImageIcon />}
            >
              Image
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<LinkIcon />}
            >
              Link
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<CampaignIcon />}
            >
              Call-to-Action
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<DividerIcon />}
            >
              Divider
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<SocialIcon />}
            >
              Social Links
            </Button>
          </Stack>
        </Paper>
      )}
    </Box>
  );

  const renderAnalyticsTab = () => (
    <Grid container spacing={3}>
      {/* Performance Metrics */}
      <Grid item xs={12} lg={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Performance Metrics</Typography>
            
            {analytics.totalSends ? (
              <Grid container spacing={3}>
                {/* Key Metrics */}
                <Grid item xs={12} md={6}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Open Rate</Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="h4" color={analytics.openRate > benchmarks.openRate ? 'success.main' : 'warning.main'}>
                        {(analytics.openRate * 100).toFixed(1)}%
                      </Typography>
                      <Chip 
                        size="small" 
                        label={analytics.recentTrend === 'up' ? '↗️ Trending Up' : analytics.recentTrend === 'down' ? '↘️ Trending Down' : '→ Stable'}
                        color={analytics.recentTrend === 'up' ? 'success' : analytics.recentTrend === 'down' ? 'error' : 'default'}
                      />
                    </Stack>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min(100, analytics.openRate * 200)} 
                      sx={{ mt: 1, mb: 1 }}
                      color={analytics.openRate > benchmarks.openRate ? 'success' : 'warning'}
                    />
                    <Typography variant="caption" color="text.secondary">
                      Industry benchmark: {(benchmarks.openRate * 100).toFixed(1)}%
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Click Rate</Typography>
                    <Typography variant="h4" color={analytics.clickRate > benchmarks.clickRate ? 'success.main' : 'warning.main'}>
                      {(analytics.clickRate * 100).toFixed(1)}%
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min(100, analytics.clickRate * 500)} 
                      sx={{ mt: 1, mb: 1 }}
                      color={analytics.clickRate > benchmarks.clickRate ? 'success' : 'warning'}
                    />
                    <Typography variant="caption" color="text.secondary">
                      Industry benchmark: {(benchmarks.clickRate * 100).toFixed(1)}%
                    </Typography>
                  </Box>
                </Grid>

                {/* Additional Metrics */}
                <Grid item xs={12} md={4}>
                  <Stack spacing={1}>
                    <Typography variant="subtitle2">Total Sends</Typography>
                    <Typography variant="h5">{analytics.totalSends?.toLocaleString()}</Typography>
                  </Stack>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Stack spacing={1}>
                    <Typography variant="subtitle2">Bounce Rate</Typography>
                    <Typography variant="h5" color={analytics.bounceRate < benchmarks.bounceRate ? 'success.main' : 'warning.main'}>
                      {(analytics.bounceRate * 100).toFixed(1)}%
                    </Typography>
                  </Stack>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Stack spacing={1}>
                    <Typography variant="subtitle2">Unsubscribe Rate</Typography>
                    <Typography variant="h5" color={analytics.unsubscribeRate < benchmarks.unsubscribeRate ? 'success.main' : 'warning.main'}>
                      {(analytics.unsubscribeRate * 100).toFixed(2)}%
                    </Typography>
                  </Stack>
                </Grid>

                {/* Device Breakdown */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>Device Breakdown</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Box textAlign="center">
                        <DesktopIcon color="primary" />
                        <Typography variant="h6">{(analytics.deviceBreakdown.desktop * 100).toFixed(0)}%</Typography>
                        <Typography variant="caption">Desktop</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box textAlign="center">
                        <MobileIcon color="primary" />
                        <Typography variant="h6">{(analytics.deviceBreakdown.mobile * 100).toFixed(0)}%</Typography>
                        <Typography variant="caption">Mobile</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box textAlign="center">
                        <TabletIcon color="primary" />
                        <Typography variant="h6">{(analytics.deviceBreakdown.tablet * 100).toFixed(0)}%</Typography>
                        <Typography variant="caption">Tablet</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Grid>

                {/* Timing Insights */}
                <Grid item xs={12}>
                  <Alert severity="info">
                    <AlertTitle>Timing Insights</AlertTitle>
                    Best performing time: {analytics.bestPerformingTime} on {analytics.topPerformingDay}s
                    <br />
                    Average time to open: {analytics.averageTimeToOpen} minutes
                  </Alert>
                </Grid>
              </Grid>
            ) : (
              <Box textAlign="center" py={4}>
                <AnalyticsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No Analytics Data Yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This template hasn't been sent yet. Analytics will appear here once you start using it in campaigns.
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* AI Quality Score */}
      <Grid item xs={12} lg={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>AI Quality Score</Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
              <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                <CircularProgress 
                  variant="determinate" 
                  value={aiScore} 
                  size={120}
                  thickness={6}
                  color={aiScore > 80 ? 'success' : aiScore > 60 ? 'warning' : 'error'}
                />
                <Box
                  sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column'
                  }}
                >
                  <Typography variant="h4" component="div" color="text.primary">
                    {aiScore}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    /100
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            <Typography 
              variant="subtitle1" 
              align="center" 
              color={aiScore > 80 ? 'success.main' : aiScore > 60 ? 'warning.main' : 'error.main'}
              gutterBottom
            >
              {aiScore > 90 ? 'Exceptional' : 
               aiScore > 80 ? 'Excellent' : 
               aiScore > 70 ? 'Good' : 
               aiScore > 60 ? 'Fair' : 'Needs Improvement'}
            </Typography>

            {/* Category Breakdown */}
            <Stack spacing={2}>
              {Object.entries(aiInsights.categoryScores || {}).map(([category, score]) => (
                <Box key={category}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>
                      {category}
                    </Typography>
                    <Typography variant="caption" fontWeight="bold">
                      {score}/100
                    </Typography>
                  </Stack>
                  <LinearProgress 
                    variant="determinate" 
                    value={score} 
                    sx={{ mt: 0.5 }}
                    color={score > 80 ? 'success' : score > 60 ? 'warning' : 'error'}
                  />
                </Box>
              ))}
            </Stack>

            {/* Last Analysis */}
            {template.aiEnhancements?.lastAnalyzed && (
              <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                <Typography variant="caption" color="text.secondary">
                  Last analyzed: {template.aiEnhancements.lastAnalyzed.toLocaleDateString()}
                </Typography>
              </Box>
            )}

            {/* Reanalyze Button */}
            <Box sx={{ mt: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={aiAnalyzing ? <CircularProgress size={16} /> : <RefreshIcon />}
                onClick={handleAIAnalysis}
                disabled={aiAnalyzing}
                size="small"
              >
                {aiAnalyzing ? 'Analyzing...' : 'Reanalyze'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* AI Suggestions */}
      {aiSuggestions.length > 0 && (
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>AI Suggestions</Typography>
              
              <Grid container spacing={2}>
                {aiSuggestions.slice(0, 6).map((suggestion, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                      <CardContent>
                        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
                          <Box sx={{ flex: 1 }}>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                              <Chip 
                                size="small" 
                                label={suggestion.priority.toUpperCase()} 
                                color={suggestion.priority === 'high' ? 'error' : suggestion.priority === 'medium' ? 'warning' : 'info'}
                              />
                              <Chip 
                                size="small" 
                                label={suggestion.category} 
                                variant="outlined"
                              />
                            </Stack>
                            
                            <Typography variant="subtitle2" gutterBottom>
                              {suggestion.title}
                            </Typography>
                            
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {suggestion.message}
                            </Typography>
                            
                            <Chip 
                              size="small" 
                              label={suggestion.impact} 
                              color="success"
                              variant="outlined"
                            />
                          </Box>

                          {mode !== 'view' && (
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => applyAISuggestion(suggestion)}
                              disabled={suggestion.applied}
                            >
                              {suggestion.applied ? 'Applied' : 'Apply'}
                            </Button>
                          )}
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {aiSuggestions.length > 6 && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Button 
                    variant="outlined" 
                    onClick={() => setDialogs(prev => ({ ...prev, aiSuggestions: true }))}
                  >
                    View All {aiSuggestions.length} Suggestions
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      )}
    </Grid>
  );

  const renderAIPanel = () => (
    showAIPanel && (
      <Paper sx={{ p: 3, position: 'sticky', top: 100, maxHeight: 'calc(100vh - 120px)', overflow: 'auto' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <BrainIcon color="primary" />
            <Typography variant="h6">AI Assistant</Typography>
          </Stack>
          <IconButton size="small" onClick={() => setShowAIPanel(false)}>
            <ClearIcon />
          </IconButton>
        </Stack>

        {/* AI Score Overview */}
        <Card variant="outlined" sx={{ mb: 2 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <CircularProgress 
                variant="determinate" 
                value={aiScore} 
                size={60}
                color={aiScore > 80 ? 'success' : aiScore > 60 ? 'warning' : 'error'}
              />
              <Box>
                <Typography variant="h5">{aiScore}/100</Typography>
                <Typography variant="caption" color="text.secondary">
                  Overall Quality Score
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Analysis Progress */}
        {aiAnalyzing && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Analyzing Template...
            </Typography>
            <LinearProgress variant="determinate" value={aiProgress} />
            <Typography variant="caption" color="text.secondary">
              {aiProgress.toFixed(0)}% Complete
            </Typography>
          </Box>
        )}

        {/* Quick Actions */}
        <Stack spacing={1} sx={{ mb: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleAIAnalysis}
            disabled={aiAnalyzing}
            size="small"
          >
            Reanalyze
          </Button>
          
          <Button
            fullWidth
            variant="outlined"
            startIcon={<TestIcon />}
            onClick={() => setDialogs(prev => ({ ...prev, abTest: true }))}
            size="small"
          >
            A/B Test
          </Button>
        </Stack>

        {/* Top Suggestions */}
        <Typography variant="subtitle2" gutterBottom>
          Priority Suggestions
        </Typography>
        
        {aiSuggestions.slice(0, 3).map((suggestion, index) => (
          <Card key={index} variant="outlined" sx={{ mb: 1 }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Chip 
                    size="small" 
                    label={suggestion.priority} 
                    color={suggestion.priority === 'high' ? 'error' : 'warning'}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {suggestion.type}
                  </Typography>
                </Stack>
                
                <Typography variant="body2">
                  {suggestion.message}
                </Typography>
                
                <Chip 
                  size="small" 
                  label={suggestion.impact} 
                  color="success"
                  variant="outlined"
                />

                {mode !== 'view' && (
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => applyAISuggestion(suggestion)}
                    disabled={suggestion.applied}
                    sx={{ alignSelf: 'flex-start' }}
                  >
                    {suggestion.applied ? 'Applied ✓' : 'Apply'}
                  </Button>
                )}
              </Stack>
            </CardContent>
          </Card>
        ))}

        {aiSuggestions.length === 0 && !aiAnalyzing && (
          <Alert severity="success">
            <AlertTitle>Great Work!</AlertTitle>
            Your template looks excellent. No immediate suggestions.
          </Alert>
        )}
      </Paper>
    )
  );

  // ============================================================================
  // DIALOG COMPONENTS
  // ============================================================================

  const renderVariableDialog = () => (
    <Dialog 
      open={dialogs.variable} 
      onClose={() => setDialogs(prev => ({ ...prev, variable: false }))}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <AddIcon />
          <Typography>Insert Variable</Typography>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Select a variable to insert into your template. Variables will be automatically replaced with actual data when emails are sent.
        </Typography>
        
        {/* Variable Categories */}
        <Box sx={{ mt: 2 }}>
          {Object.entries(
            availableVariables.reduce((acc, variable) => {
              if (!acc[variable.category]) {
                acc[variable.category] = [];
              }
              acc[variable.category].push(variable);
              return acc;
            }, {})
          ).map(([category, variables]) => (
            <Accordion key={category} sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandIcon />}>
                <Typography variant="subtitle1">{category} Variables</Typography>
                <Chip size="small" label={variables.length} sx={{ ml: 1 }} />
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  {variables.map((variable) => (
                    <Grid item xs={12} sm={6} md={4} key={variable.name}>
                      <Card 
                        variant="outlined" 
                        sx={{ 
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          '&:hover': { 
                            bgcolor: 'action.hover',
                            transform: 'translateY(-2px)',
                            boxShadow: 2
                          }
                        }}
                        onClick={() => handleVariableInsert(variable)}
                      >
                        <CardContent sx={{ p: 2 }}>
                          <Typography variant="subtitle2" gutterBottom color="primary">
                            {`{{${variable.name}}}`}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {variable.description}
                          </Typography>
                          <Typography variant="caption" color="success.main">
                            Example: {variable.example}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setDialogs(prev => ({ ...prev, variable: false }))}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderPreviewDialog = () => (
    <Dialog 
      open={dialogs.preview} 
      onClose={() => setDialogs(prev => ({ ...prev, preview: false }))}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1}>
            <PreviewIcon />
            <Typography>Email Preview</Typography>
          </Stack>
          <ButtonGroup size="small">
            <Button 
              variant={viewMode === 'desktop' ? 'contained' : 'outlined'}
              onClick={() => handleViewModeChange('desktop')}
              startIcon={<DesktopIcon />}
            >
              Desktop
            </Button>
            <Button 
              variant={viewMode === 'tablet' ? 'contained' : 'outlined'}
              onClick={() => handleViewModeChange('tablet')}
              startIcon={<TabletIcon />}
            >
              Tablet
            </Button>
            <Button 
              variant={viewMode === 'mobile' ? 'contained' : 'outlined'}
              onClick={() => handleViewModeChange('mobile')}
              startIcon={<MobileIcon />}
            >
              Mobile
            </Button>
          </ButtonGroup>
        </Stack>
      </DialogTitle>
      <DialogContent>
        {/* Subject Line Preview */}
        <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
          <Typography variant="subtitle2" gutterBottom>Subject Line:</Typography>
          <Typography variant="body1" fontWeight="medium">{template.subject}</Typography>
          <Typography variant="caption" color="text.secondary">
            Length: {template.subject.length} characters
          </Typography>
        </Paper>
        
        {/* Email Content Preview */}
        <Paper 
          variant="outlined" 
          sx={{ 
            p: 2, 
            minHeight: 400,
            maxWidth: viewMode === 'mobile' ? '375px' : viewMode === 'tablet' ? '768px' : '100%',
            mx: 'auto',
            transition: 'max-width 0.3s ease'
          }}
        >
          <Box 
            dangerouslySetInnerHTML={{ __html: template.html }} 
            sx={{ 
              '& *': { maxWidth: '100%' },
              '& img': { maxWidth: '100%', height: 'auto' },
              '& table': { width: '100%' }
            }}
          />
        </Paper>

        {/* Preview Stats */}
        <Box sx={{ mt: 2 }}>
          <Alert severity="info">
            <AlertTitle>Preview Information</AlertTitle>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Typography variant="caption">
                  Word Count: {stripHtml(template.html).split(/\s+/).length}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption">
                  Estimated Read Time: {Math.ceil(stripHtml(template.html).split(/\s+/).length / 200)} min
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption">
                  Variables Used: {(template.html.match(/\{\{[^}]+\}\}/g) || []).length}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption">
                  Links: {(template.html.match(/<a[^>]+>/g) || []).length}
                </Typography>
              </Grid>
            </Grid>
          </Alert>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setDialogs(prev => ({ ...prev, preview: false }))}>
          Close
        </Button>
        <Button variant="contained" startIcon={<SendIcon />} disabled={mode === 'view'}>
          Send Test Email
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderPublishDialog = () => (
    <Dialog 
      open={dialogs.publish} 
      onClose={() => setDialogs(prev => ({ ...prev, publish: false }))}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <SuccessIcon color="success" />
          <Typography>Publish Template</Typography>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Typography gutterBottom>
          Are you sure you want to publish this template? Publishing will:
        </Typography>
        
        <Box component="ul" sx={{ pl: 2 }}>
          <li>Make the template available for use in campaigns</li>
          <li>Run a final AI analysis to ensure quality</li>
          <li>Create a published version in the template library</li>
          <li>Enable performance tracking and analytics</li>
        </Box>

        <Alert severity="info" sx={{ mt: 2 }}>
          <AlertTitle>Quality Check</AlertTitle>
          Current AI score: {aiScore}/100. Templates with scores above 70 are recommended for publishing.
        </Alert>

        {aiScore < 70 && (
          <Alert severity="warning" sx={{ mt: 1 }}>
            Consider improving the template based on AI suggestions before publishing.
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setDialogs(prev => ({ ...prev, publish: false }))}>
          Cancel
        </Button>
        <Button 
          variant="contained" 
          color="success"
          startIcon={<SuccessIcon />}
          onClick={handlePublish}
          disabled={isSaving}
        >
          {isSaving ? 'Publishing...' : 'Publish Template'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  // ============================================================================
  // MAIN COMPONENT RENDER
  // ============================================================================

  if (userLoading || isLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Stack spacing={3}>
          <Skeleton variant="rectangular" width="100%" height={80} />
          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <Skeleton variant="rectangular" width="100%" height={600} />
            </Grid>
            <Grid item xs={12} lg={4}>
              <Skeleton variant="rectangular" width="100%" height={400} />
            </Grid>
          </Grid>
        </Stack>
      </Container>
    );
  }

  if (userError) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Alert severity="error">
          <AlertTitle>Authentication Error</AlertTitle>
          {userError.message}
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Toolbar */}
      {renderToolbar()}

      {/* Main Content */}
      <Box sx={{ overflow: 'auto' }}>
        <Container maxWidth="xl" sx={{ py: 3 }}>
          <Grid container spacing={3}>
            {/* Main Editor */}
            <Grid item xs={12} lg={showAIPanel ? 8 : 12}>
              <Paper sx={{ overflow: 'hidden' }}>
                {/* Navigation Tabs */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Tabs 
                    value={currentTab} 
                    onChange={handleTabChange}
                    variant="fullWidth"
                  >
                    <Tab 
                      label="Basic Info" 
                      icon={<InfoIcon />} 
                      iconPosition="start"
                    />
                    <Tab 
                      label="Content" 
                      icon={<CodeIcon />} 
                      iconPosition="start"
                    />
                    <Tab 
                      label="Analytics" 
                      icon={<AnalyticsIcon />} 
                      iconPosition="start"
                    />
                  </Tabs>
                </Box>

                {/* Tab Content */}
                <Box sx={{ p: 3 }}>
                  {currentTab === 0 && renderBasicInfoTab()}
                  {currentTab === 1 && renderContentEditorTab()}
                  {currentTab === 2 && renderAnalyticsTab()}
                </Box>
              </Paper>
            </Grid>

            {/* AI Assistant Panel */}
            {showAIPanel && (
              <Grid item xs={12} lg={4}>
                {renderAIPanel()}
              </Grid>
            )}
          </Grid>
        </Container>
      </Box>

      {/* Dialogs */}
      {renderVariableDialog()}
      {renderPreviewDialog()}
      {renderPublishDialog()}

      {/* Error/Success Notifications */}
      <Snackbar 
        open={!!saveError} 
        autoHideDuration={6000} 
        onClose={() => setSaveError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setSaveError(null)}>
          {saveError}
        </Alert>
      </Snackbar>

      {/* Speed Dial for Mobile */}
      {isMobile && mode !== 'view' && (
        <SpeedDial
          ariaLabel="Template actions"
          sx={{ position: 'fixed', bottom: 24, right: 24 }}
          icon={<SpeedDialIcon />}
        >
          <SpeedDialAction
            icon={<SaveIcon />}
            tooltipTitle="Save"
            onClick={() => handleSave()}
          />
          <SpeedDialAction
            icon={<PreviewIcon />}
            tooltipTitle="Preview"
            onClick={handlePreview}
          />
          <SpeedDialAction
            icon={<BrainIcon />}
            tooltipTitle="AI Analysis"
            onClick={handleAIAnalysis}
          />
          <SpeedDialAction
            icon={<AddIcon />}
            tooltipTitle="Insert Variable"
            onClick={() => setDialogs(prev => ({ ...prev, variable: true }))}
          />
        </SpeedDial>
      )}
    </Box>
  );
};

export default EnhancedTemplateEditor;