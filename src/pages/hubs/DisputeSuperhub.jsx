  // --- BEGIN ADMIN PANEL STATE ---
  const [adminActiveTab, setAdminActiveTab] = useState(0);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [roles, setRoles] = useState([
    { id: 'admin', name: 'Administrator', level: 100 },
    { id: 'manager', name: 'Manager', level: 75 },
    { id: 'agent', name: 'Agent', level: 50 },
    { id: 'viewer', name: 'Viewer', level: 25 }
  ]);
  const [systemSettings, setSystemSettings] = useState({
    aiEnabled: true,
    autoSave: true,
    autoFollowUp: true,
    responseTracking: true,
    batchProcessing: true,
    certifiedMailIntegration: true,
    faxIntegration: true,
    emailIntegration: true,
    portalUpload: true,
    maxDisputesPerDay: 100,
    defaultStrategy: 'moderate',
    requireApproval: false,
    notificationEmail: '',
    webhookUrl: '',
    apiRateLimit: 100,
    dataRetentionDays: 365,
    debugMode: false
  });
  const [automationRules, setAutomationRules] = useState([
    {
      id: 'rule-1',
      name: 'Auto Follow-up',
      trigger: 'no_response_30_days',
      action: 'send_followup',
      enabled: true,
      conditions: { daysSinceSent: 30, status: 'sent' }
    },
    {
      id: 'rule-2',
      name: 'Escalation',
      trigger: 'no_response_45_days',
      action: 'escalate_to_cfpb',
      enabled: false,
      conditions: { daysSinceSent: 45, status: 'sent' }
    }
  ]);
  const [templateStats, setTemplateStats] = useState({
    total: 0,
    aiOptimized: 0,
    customTemplates: 0,
    averageSuccessRate: 0
  });
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    activeDisputes: 0,
    successRate: 0,
    avgResponseTime: 0,
    aiUsage: 0,
    systemLoad: 0,
    errorRate: 0,
    apiCalls: 0
  });
  const permissionCategories = {
    disputes: {
      name: 'Dispute Management',
      icon: <FileText />,
      permissions: [
        { key: 'create_disputes', label: 'Create Disputes', description: 'Create new dispute letters' },
        { key: 'edit_disputes', label: 'Edit Disputes', description: 'Modify existing disputes' },
        { key: 'delete_disputes', label: 'Delete Disputes', description: 'Remove dispute letters' },
        { key: 'send_disputes', label: 'Send Disputes', description: 'Send letters via any method' },
        { key: 'export_disputes', label: 'Export Disputes', description: 'Export to PDF/CSV' },
        { key: 'bulk_operations', label: 'Bulk Operations', description: 'Perform batch actions' }
      ]
    },
    templates: {
      name: 'Template Management',
      icon: <FileText />,
      permissions: [
        { key: 'view_templates', label: 'View Templates', description: 'Access template library' },
        { key: 'create_templates', label: 'Create Templates', description: 'Add new templates' },
        { key: 'edit_templates', label: 'Edit Templates', description: 'Modify existing templates' },
        { key: 'delete_templates', label: 'Delete Templates', description: 'Remove templates' },
        { key: 'approve_templates', label: 'Approve Templates', description: 'Approve user submissions' }
      ]
    },
    ai: {
      name: 'AI Features',
      icon: <Brain />,
      permissions: [
        { key: 'use_ai_generation', label: 'AI Generation', description: 'Use AI to generate letters' },
        { key: 'ai_analysis', label: 'AI Analysis', description: 'Access AI analytics' },
        { key: 'ai_batch', label: 'AI Batch Processing', description: 'Bulk AI operations' },
        { key: 'ai_strategy', label: 'AI Strategy Settings', description: 'Configure AI strategies' },
        { key: 'ai_training', label: 'AI Training', description: 'Train AI models' }
      ]
    },
    delivery: {
      name: 'Delivery Methods',
      icon: <Send />,
      permissions: [
        { key: 'mail_delivery', label: 'Regular Mail', description: 'Send via regular mail' },
        { key: 'certified_mail', label: 'Certified Mail', description: 'Send certified letters' },
        { key: 'fax_delivery', label: 'Fax', description: 'Send via fax' },
        { key: 'email_delivery', label: 'Email', description: 'Send via email' },
        { key: 'portal_upload', label: 'Portal Upload', description: 'Upload to bureau portals' }
      ]
    },
    clients: {
      name: 'Client Management',
      icon: <Users />,
      permissions: [
        { key: 'view_all_clients', label: 'View All Clients', description: 'Access all client data' },
        { key: 'edit_clients', label: 'Edit Clients', description: 'Modify client information' },
        { key: 'delete_clients', label: 'Delete Clients', description: 'Remove client records' },
        { key: 'export_clients', label: 'Export Clients', description: 'Export client data' }
      ]
    },
    admin: {
      name: 'Administration',
      icon: <Shield />,
      permissions: [
        { key: 'manage_users', label: 'Manage Users', description: 'User administration' },
        { key: 'manage_permissions', label: 'Manage Permissions', description: 'Set user permissions' },
        { key: 'system_settings', label: 'System Settings', description: 'Configure system' },
        { key: 'view_logs', label: 'View Logs', description: 'Access system logs' },
        { key: 'api_access', label: 'API Access', description: 'Manage API keys' }
      ]
    }
  };
  // --- END ADMIN PANEL STATE ---
// ============================================================================
// DisputeHub.jsx - CONSOLIDATED ULTIMATE DISPUTE & BUREAU MANAGEMENT HUB
// ============================================================================
// VERSION: 2.0.0 - CONSOLIDATED WITH BUREAU COMMUNICATION HUB
// AUTHOR: SpeedyCRM Development Team
// LAST UPDATED: 2025-11-22
//
// DESCRIPTION:
// Complete dispute AND bureau communication management hub with tabbed interface.
// Consolidates DisputeHub + BureauCommunicationHub into unified workflow.
//
// CONSOLIDATION NOTES:
// - Merged DisputeHub (9 tabs) + BureauCommunicationHub (8 tabs)
// - Eliminated redundancy: Dispute Tracker + Bureau Dispute Tracker combined
// - Enhanced features: Better bureau-specific tracking
// - Total tabs: 10 (from 17 - eliminated 7 redundant tabs)
//
// FEATURES:
// - 10 comprehensive tabs for all dispute & bureau functions
// - Bureau-specific tracking (Experian, Equifax, TransUnion)
// - Role-based tab visibility
// - Tab state persistence
// - Beautiful Material-UI interface
// - Dark mode support
// - AI-powered features throughout
// - Real-time statistics
// - Notification system
// - Responsive design
// - Mobile optimized
//
// DEPENDENCIES:
// - React, Material-UI, Firebase, Recharts
// - AIDisputeGenerator.jsx
// - DisputeTrackingSystem.jsx
// - BureauResponseProcessor.jsx
// - DisputeTemplateManager.jsx
// - DisputeStrategyAnalyzer.jsx
// - DisputeAnalyticsDashboard.jsx
// - AutomatedFollowupSystem.jsx
// - DisputeHubConfig.jsx
// - AIDisputeCoach.jsx
//
// USAGE:
// import DisputeHub from './pages/hubs/DisputeHub';
// <Route path="/dispute-hub" element={<DisputeHub />} />
//
// ============================================================================

import React, { useState, useEffect, useMemo, useCallback, Suspense, lazy } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, onSnapshot, doc, getDoc, addDoc, updateDoc, deleteDoc, serverTimestamp, orderBy, limit } from 'firebase/firestore';

// ===== MATERIAL-UI IMPORTS =====
import {
  Box,
  Container,
  Paper,
  Tabs,
  Tab,
  Typography,
  Badge,
  CircularProgress,
  Alert,
  Snackbar,
  IconButton,
  Tooltip,
  Button,
  Chip,
  Avatar,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Divider,
  Grid,
  Card,
  CardContent,
  CardActions,
  LinearProgress,
  useTheme,
  useMediaQuery,
  Drawer,
  AppBar,
  Toolbar,
  Fade,
  Zoom,
  Slide,
  Collapse,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
} from '@mui/material';

// ===== LUCIDE REACT ICONS =====
import {
  FileText,
  TrendingUp,
  Mail,
  FileCheck,
  Settings,
  Brain,
  MessageSquare,
  Clock,
  Filter,
  Search,
  Plus,
  RefreshCw,
  Download,
  Upload,
  BarChart3,
  Target,
  Zap,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Bell,
  Menu as MenuIcon,
  X,
  ChevronRight,
  Calendar,
  Users,
  DollarSign,
  TrendingDown,
  Award,
  Activity,
  Building,
  Send,
  Edit,
  Trash2,
  Eye,
  Copy,
  Star,
  Sparkles,
} from 'lucide-react';

// ===== LAZY LOAD COMPONENTS (Performance Optimization) =====
const AIDisputeGenerator = lazy(() => import('@/components/credit/AIDisputeGenerator'));
const DisputeTrackingSystem = lazy(() => import('@/components/dispute/DisputeTrackingSystem'));
const BureauResponseProcessor = lazy(() => import('@/components/dispute/BureauResponseProcessor'));
const DisputeTemplateManager = lazy(() => import('@/components/dispute/DisputeTemplateManager'));
const DisputeStrategyAnalyzer = lazy(() => import('@/components/dispute/DisputeStrategyAnalyzer'));
const DisputeAnalyticsDashboard = lazy(() => import('@/components/dispute/DisputeAnalyticsDashboard'));
const AutomatedFollowupSystem = lazy(() => import('@/components/dispute/AutomatedFollowupSystem'));
const DisputeHubConfig = lazy(() => import('@/components/dispute/DisputeHubConfig'));
const AIDisputeCoach = lazy(() => import('@/components/dispute/AIDisputeCoach'));

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const COLORS = {
  experian: '#0066B2',
  equifax: '#C8102E',
  transunion: '#005EB8',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  primary: '#667eea',
  secondary: '#764ba2',
};

// Credit bureaus
const BUREAUS = [
  {
    id: 'experian',
    name: 'Experian',
    color: COLORS.experian,
    address: 'P.O. Box 4500, Allen, TX 75013',
    phone: '1-888-397-3742',
    website: 'https://www.experian.com',
    responseTime: 30,
    logo: '🔵',
  },
  {
    id: 'equifax',
    name: 'Equifax',
    color: COLORS.equifax,
    address: 'P.O. Box 740241, Atlanta, GA 30374',
    phone: '1-800-685-1111',
    website: 'https://www.equifax.com',
    responseTime: 30,
    logo: '🔴',
  },
  {
    id: 'transunion',
    name: 'TransUnion',
    color: COLORS.transunion,
    address: 'P.O. Box 2000, Chester, PA 19016',
    phone: '1-800-916-8800',
    website: 'https://www.transunion.com',
    responseTime: 30,
    logo: '🟢',
  },
];

// Dispute statuses
const DISPUTE_STATUSES = [
  { id: 'draft', label: 'Draft', color: '#6b7280', icon: Edit },
  { id: 'pending', label: 'Pending', color: '#f59e0b', icon: Clock },
  { id: 'sent', label: 'Sent', color: '#3b82f6', icon: Send },
  { id: 'received', label: 'Received', color: '#8b5cf6', icon: CheckCircle },
  { id: 'resolved-deleted', label: 'Deleted', color: '#10b981', icon: CheckCircle },
  { id: 'resolved-updated', label: 'Updated', color: '#10b981', icon: CheckCircle },
  { id: 'resolved-verified', label: 'Verified', color: '#ef4444', icon: XCircle },
  { id: 'escalated', label: 'Escalated', color: '#dc2626', icon: AlertCircle },
];

// Dispute item types
const DISPUTE_TYPES = [
  'Late Payment',
  'Charge-Off',
  'Collection',
  'Bankruptcy',
  'Foreclosure',
  'Repossession',
  'Inquiry',
  'Public Record',
  'Judgment',
  'Tax Lien',
  'Other',
];

// Letter templates categories
const TEMPLATE_CATEGORIES = [
  { id: 'initial', name: 'Initial Disputes', icon: FileText, count: 15 },
  { id: 'follow-up', name: 'Follow-Up Letters', icon: RefreshCw, count: 10 },
  { id: 'escalation', name: 'Escalation Letters', icon: AlertCircle, count: 8 },
  { id: 'goodwill', name: 'Goodwill Letters', icon: Star, count: 5 },
  { id: 'validation', name: 'Validation Requests', icon: Shield, count: 7 },
  { id: 'cease-desist', name: 'Cease & Desist', icon: XCircle, count: 5 },
];

// ============================================================================
// TAB CONFIGURATION
// ============================================================================
const TABS = [
  {
    id: 'generator',
    label: 'AI Generator',
    icon: FileText,
    description: 'Create AI-powered dispute letters',
    component: AIDisputeGenerator,
    roles: ['user', 'manager', 'admin', 'masterAdmin'],
    color: '#2196f3',
    badge: 'AI',
  },
  {
    id: 'tracking',
    label: 'Active Disputes',
    icon: TrendingUp,
    description: 'Track all active disputes',
    component: DisputeTrackingSystem,
    roles: ['user', 'manager', 'admin', 'masterAdmin'],
    color: '#4caf50',
    badge: null,
  },
  {
    id: 'bureau-communication',
    label: 'Bureau Tracker',
    icon: Building,
    description: 'Bureau-specific dispute tracking',
    component: null, // Custom component rendered inline
    roles: ['user', 'manager', 'admin', 'masterAdmin'],
    color: '#9c27b0',
    badge: 'NEW',
  },
  {
    id: 'responses',
    label: 'Bureau Responses',
    icon: Mail,
    description: 'Process bureau responses',
    component: BureauResponseProcessor,
    roles: ['user', 'manager', 'admin', 'masterAdmin'],
    color: '#ff9800',
    badge: null,
  },
  {
    id: 'templates',
    label: 'Templates',
    icon: FileCheck,
    description: 'Manage dispute templates',
    component: DisputeTemplateManager,
    roles: ['user', 'manager', 'admin', 'masterAdmin'],
    color: '#9c27b0',
    badge: null,
  },
  {
    id: 'deadlines',
    label: 'Deadlines',
    icon: Clock,
    description: '30-day deadline tracking',
    component: null, // Custom component rendered inline
    roles: ['user', 'manager', 'admin', 'masterAdmin'],
    color: '#ff5722',
    badge: null,
  },
  {
    id: 'strategy',
    label: 'Strategy Analyzer',
    icon: Brain,
    description: 'AI-powered strategy recommendations',
    component: DisputeStrategyAnalyzer,
    roles: ['user', 'manager', 'admin', 'masterAdmin'],
    color: '#e91e63',
    badge: 'AI',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    description: 'Success rates & insights',
    component: DisputeAnalyticsDashboard,
    roles: ['manager', 'admin', 'masterAdmin'],
    color: '#00bcd4',
    badge: null,
  },
  {
    id: 'followups',
    label: 'Follow-ups',
    icon: RefreshCw,
    description: 'Automated follow-up system',
    component: AutomatedFollowupSystem,
    roles: ['user', 'manager', 'admin', 'masterAdmin'],
    color: '#ff5722',
    badge: 'AUTO',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    description: 'Configure dispute system',
    component: DisputeHubConfig,
    roles: ['admin', 'masterAdmin'],
    color: '#607d8b',
    badge: null,
  },
];

// ============================================================================
// LOADING FALLBACK COMPONENT
// ============================================================================
const LoadingFallback = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '400px',
      gap: 2,
    }}
  >
    <CircularProgress size={60} thickness={4} />
    <Typography variant="h6" color="text.secondary">
      Loading Component...
    </Typography>
  </Box>
);

// ============================================================================
// MAIN DISPUTE HUB COMPONENT
// ============================================================================
const DisputeHub = () => {
  const { currentUser, userProfile } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // ===== STATE MANAGEMENT =====
  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem('disputeHub_activeTab');
    return saved || 'generator';
  });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [stats, setStats] = useState({
    totalDisputes: 0,
    activeDisputes: 0,
    resolved: 0,
    successRate: 0,
    pendingResponses: 0,
    scheduledFollowups: 0,
    upcomingDeadlines: 0,
    // Bureau-specific stats
    experianDisputes: 0,
    equifaxDisputes: 0,
    transunionDisputes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [quickActions, setQuickActions] = useState([]);

  // Bureau tracking state
  const [disputes, setDisputes] = useState([]);
  const [responses, setResponses] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  
  // Filter state
  const [selectedBureau, setSelectedBureau] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog state
  const [openDisputeDialog, setOpenDisputeDialog] = useState(false);
  const [disputeForm, setDisputeForm] = useState({
    clientId: '',
    clientName: '',
    bureau: '',
    itemType: '',
    accountName: '',
    accountNumber: '',
    reason: '',
    template: '',
  });

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // ===== USER ROLE =====
  const userRole = useMemo(() => {
    return userProfile?.role || 'user';
  }, [userProfile]);

  // ===== FILTERED TABS BASED ON ROLE =====
  const visibleTabs = useMemo(() => {
    return TABS.filter(tab => tab.roles.includes(userRole));
  }, [userRole]);

  // ===== PERSIST ACTIVE TAB =====
  useEffect(() => {
    localStorage.setItem('disputeHub_activeTab', activeTab);
  }, [activeTab]);

  // ===== FETCH REAL-TIME DATA =====
  useEffect(() => {
    if (!currentUser) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          loadDisputes(),
          loadResponses(),
          loadTemplates(),
        ]);
      } catch (error) {
        console.error('❌ Error fetching data:', error);
        showSnackbar('Failed to load data', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  // ===== CALCULATE DEADLINES =====
  useEffect(() => {
    if (disputes.length > 0) {
      calculateDeadlines();
    }
  }, [disputes]);

  // ===== CALCULATE STATS =====
  useEffect(() => {
    calculateStats();
  }, [disputes, responses, deadlines]);

  // ============================================================================
  // DATA LOADING FUNCTIONS
  // ============================================================================

  const loadDisputes = async () => {
    try {
      const q = query(
        collection(db, 'disputes'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc',
        limit(100)
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDisputes(data);
      });

      return () => unsubscribe();
    } catch (err) {
      console.error('Error loading disputes:', err);
    }
  };

  const loadResponses = async () => {
    try {
      const q = query(
        collection(db, 'bureauResponses'),
        orderBy('receivedAt', 'desc'),
        limit(50)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setResponses(data);
    } catch (err) {
      console.error('Error loading responses:', err);
    }
  };

  const loadTemplates = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'disputeTemplates'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTemplates(data);
    } catch (err) {
      console.error('Error loading templates:', err);
    }
  };

  const calculateDeadlines = () => {
    try {
      const today = new Date();
      
      const activeDisputes = disputes.filter(d => 
        d.status === 'sent' || d.status === 'received'
      );
      
      const deadlineData = activeDisputes.map(dispute => {
        const sentDate = dispute.sentAt ? new Date(dispute.sentAt) : new Date();
        const deadlineDate = new Date(sentDate.getTime() + 30 * 24 * 60 * 60 * 1000);
        const daysRemaining = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
        
        return {
          disputeId: dispute.id,
          clientName: dispute.clientName || 'Unknown Client',
          bureau: dispute.bureau,
          sentDate,
          deadlineDate,
          daysRemaining,
          isOverdue: daysRemaining < 0,
          isUrgent: daysRemaining <= 5 && daysRemaining >= 0,
        };
      });
      
      setDeadlines(deadlineData.sort((a, b) => a.daysRemaining - b.daysRemaining));
    } catch (err) {
      console.error('Error calculating deadlines:', err);
    }
  };

  const calculateStats = () => {
    const total = disputes.length;
    const active = disputes.filter(d => 
      d.status === 'pending' || d.status === 'sent' || d.status === 'received'
    ).length;
    const resolved = disputes.filter(d => 
      d.status === 'resolved' || d.status === 'deleted' || d.status === 'resolved-deleted' || d.status === 'resolved-updated'
    ).length;
    const successRate = total > 0 ? ((resolved / total) * 100).toFixed(1) : 0;
    const pendingResp = responses.filter(r => !r.processed).length;
    const scheduled = disputes.filter(d => d.followupScheduled && new Date(d.followupDate) > new Date()).length;
    const upcoming = deadlines.filter(d => !d.isOverdue && d.daysRemaining <= 7).length;

    // Bureau-specific counts
    const experianCount = disputes.filter(d => d.bureau === 'experian').length;
    const equifaxCount = disputes.filter(d => d.bureau === 'equifax').length;
    const transunionCount = disputes.filter(d => d.bureau === 'transunion').length;

    setStats({
      totalDisputes: total,
      activeDisputes: active,
      resolved,
      successRate,
      pendingResponses: pendingResp,
      scheduledFollowups: scheduled,
      upcomingDeadlines: upcoming,
      experianDisputes: experianCount,
      equifaxDisputes: equifaxCount,
      transunionDisputes: transunionCount,
    });
  };

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleTabChange = useCallback((event, newValue) => {
    setActiveTab(newValue);
    if (isMobile) setDrawerOpen(false);
  }, [isMobile]);

  const handleRefreshStats = useCallback(async () => {
    showSnackbar('Refreshing statistics...', 'info');
    await loadDisputes();
    await loadResponses();
    setTimeout(() => {
      showSnackbar('Statistics updated!', 'success');
    }, 1000);
  }, []);

  const showSnackbar = useCallback((message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const handleCloseSnackbar = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  const handleCreateDispute = async () => {
    try {
      await addDoc(collection(db, 'disputes'), {
        ...disputeForm,
        userId: currentUser.uid,
        status: 'draft',
        createdAt: serverTimestamp(),
        createdBy: currentUser.uid,
      });
      
      showSnackbar('Dispute created successfully!', 'success');
      setOpenDisputeDialog(false);
      resetDisputeForm();
    } catch (err) {
      console.error('Error creating dispute:', err);
      showSnackbar('Failed to create dispute', 'error');
    }
  };

  const handleSendDispute = async (disputeId) => {
    try {
      await updateDoc(doc(db, 'disputes', disputeId), {
        status: 'sent',
        sentAt: new Date().toISOString(),
        updatedAt: serverTimestamp(),
      });
      
      showSnackbar('Dispute sent successfully!', 'success');
    } catch (err) {
      console.error('Error sending dispute:', err);
      showSnackbar('Failed to send dispute', 'error');
    }
  };

  const handleDeleteDispute = async (disputeId) => {
    if (!confirm('Are you sure you want to delete this dispute?')) return;
    
    try {
      await deleteDoc(doc(db, 'disputes', disputeId));
      showSnackbar('Dispute deleted successfully', 'success');
    } catch (err) {
      console.error('Error deleting dispute:', err);
      showSnackbar('Failed to delete dispute', 'error');
    }
  };

  const resetDisputeForm = () => {
    setDisputeForm({
      clientId: '',
      clientName: '',
      bureau: '',
      itemType: '',
      accountName: '',
      accountNumber: '',
      reason: '',
      template: '',
    });
  };

  // ===== QUICK ACTIONS CONFIGURATION =====
  useEffect(() => {
    const actions = [
      {
        icon: <Plus />,
        name: 'New Dispute',
        action: () => setOpenDisputeDialog(true),
      },
      {
        icon: <Search />,
        name: 'Find Dispute',
        action: () => handleTabChange(null, 'tracking'),
      },
      {
        icon: <Upload />,
        name: 'Upload Response',
        action: () => handleTabChange(null, 'responses'),
      },
      {
        icon: <RefreshCw />,
        name: 'Refresh Stats',
        action: handleRefreshStats,
      },
    ];

    if (userRole === 'admin' || userRole === 'masterAdmin') {
      actions.push({
        icon: <Settings />,
        name: 'Settings',
        action: () => handleTabChange(null, 'settings'),
      });
    }

    setQuickActions(actions);
  }, [userRole]);

  // ===== ACTIVE COMPONENT =====
  const ActiveComponent = useMemo(() => {
    const tab = TABS.find(t => t.id === activeTab);
    return tab?.component || null;
  }, [activeTab]);

  // --- BEGIN ADMIN PANEL INTEGRATION ---
  const [adminActiveTab, setAdminActiveTab] = useState(0);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [roles, setRoles] = useState([
    { id: 'admin', name: 'Administrator', level: 100 },
    { id: 'manager', name: 'Manager', level: 75 },
    { id: 'agent', name: 'Agent', level: 50 },
    { id: 'viewer', name: 'Viewer', level: 25 }
  ]);
  const [systemSettings, setSystemSettings] = useState({
    aiEnabled: true,
    autoSave: true,
    autoFollowUp: true,
    responseTracking: true,
    batchProcessing: true,
    certifiedMailIntegration: true,
    faxIntegration: true,
    emailIntegration: true,
    portalUpload: true,
    maxDisputesPerDay: 100,
    defaultStrategy: 'moderate',
    requireApproval: false,
    notificationEmail: '',
    webhookUrl: '',
    apiRateLimit: 100,
    dataRetentionDays: 365,
    debugMode: false
  });
  const [automationRules, setAutomationRules] = useState([
    {
      id: 'rule-1',
      name: 'Auto Follow-up',
      trigger: 'no_response_30_days',
      action: 'send_followup',
      enabled: true,
      conditions: { daysSinceSent: 30, status: 'sent' }
    },
    {
      id: 'rule-2',
      name: 'Escalation',
      trigger: 'no_response_45_days',
      action: 'escalate_to_cfpb',
      enabled: false,
      conditions: { daysSinceSent: 45, status: 'sent' }
    }
  ]);
  const [templateStats, setTemplateStats] = useState({
    total: 0,
    aiOptimized: 0,
    customTemplates: 0,
    averageSuccessRate: 0
  });
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    activeDisputes: 0,
    successRate: 0,
    avgResponseTime: 0,
    aiUsage: 0,
    systemLoad: 0,
    errorRate: 0,
    apiCalls: 0
  });
  const permissionCategories = {
    disputes: {
      name: 'Dispute Management',
      icon: <FileText />,
      permissions: [
        { key: 'create_disputes', label: 'Create Disputes', description: 'Create new dispute letters' },
        { key: 'edit_disputes', label: 'Edit Disputes', description: 'Modify existing disputes' },
        { key: 'delete_disputes', label: 'Delete Disputes', description: 'Remove dispute letters' },
        { key: 'send_disputes', label: 'Send Disputes', description: 'Send letters via any method' },
        { key: 'export_disputes', label: 'Export Disputes', description: 'Export to PDF/CSV' },
        { key: 'bulk_operations', label: 'Bulk Operations', description: 'Perform batch actions' }
      ]
    },
    templates: {
      name: 'Template Management',
      icon: <FileText />,
      permissions: [
        { key: 'view_templates', label: 'View Templates', description: 'Access template library' },
        { key: 'create_templates', label: 'Create Templates', description: 'Add new templates' },
        { key: 'edit_templates', label: 'Edit Templates', description: 'Modify existing templates' },
        { key: 'delete_templates', label: 'Delete Templates', description: 'Remove templates' },
        { key: 'approve_templates', label: 'Approve Templates', description: 'Approve user submissions' }
      ]
    },
    ai: {
      name: 'AI Features',
      icon: <Brain />,
      permissions: [
        { key: 'use_ai_generation', label: 'AI Generation', description: 'Use AI to generate letters' },
        { key: 'ai_analysis', label: 'AI Analysis', description: 'Access AI analytics' },
        { key: 'ai_batch', label: 'AI Batch Processing', description: 'Bulk AI operations' },
        { key: 'ai_strategy', label: 'AI Strategy Settings', description: 'Configure AI strategies' },
        { key: 'ai_training', label: 'AI Training', description: 'Train AI models' }
      ]
    },
    delivery: {
      name: 'Delivery Methods',
      icon: <Send />,
      permissions: [
        { key: 'mail_delivery', label: 'Regular Mail', description: 'Send via regular mail' },
        { key: 'certified_mail', label: 'Certified Mail', description: 'Send certified letters' },
        { key: 'fax_delivery', label: 'Fax', description: 'Send via fax' },
        { key: 'email_delivery', label: 'Email', description: 'Send via email' },
        { key: 'portal_upload', label: 'Portal Upload', description: 'Upload to bureau portals' }
      ]
    },
    clients: {
      name: 'Client Management',
      icon: <Users />,
      permissions: [
        { key: 'view_all_clients', label: 'View All Clients', description: 'Access all client data' },
        { key: 'edit_clients', label: 'Edit Clients', description: 'Modify client information' },
        { key: 'delete_clients', label: 'Delete Clients', description: 'Remove client records' },
        { key: 'export_clients', label: 'Export Clients', description: 'Export client data' }
      ]
    },
    admin: {
      name: 'Administration',
      icon: <Shield />,
      permissions: [
        { key: 'manage_users', label: 'Manage Users', description: 'User administration' },
        { key: 'manage_permissions', label: 'Manage Permissions', description: 'Set user permissions' },
        { key: 'system_settings', label: 'System Settings', description: 'Configure system' },
        { key: 'view_logs', label: 'View Logs', description: 'Access system logs' },
        { key: 'api_access', label: 'API Access', description: 'Manage API keys' }
      ]
    }
  };
  // --- END ADMIN PANEL INTEGRATION ---

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  // ===== RENDER STATS CARDS =====
  const renderStatsCards = () => (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid item xs={6} sm={4} md={2}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h4" color="primary" fontWeight="bold">
              {stats.totalDisputes}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Disputes
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={6} sm={4} md={2}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h4" color="warning.main" fontWeight="bold">
              {stats.activeDisputes}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={6} sm={4} md={2}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h4" color="success.main" fontWeight="bold">
              {stats.resolved}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Resolved
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={6} sm={4} md={2}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h4" color="info.main" fontWeight="bold">
              {stats.successRate}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Success Rate
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={6} sm={4} md={2}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h4" color="error.main" fontWeight="bold">
              {stats.pendingResponses}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pending Responses
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={6} sm={4} md={2}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h4" color="secondary.main" fontWeight="bold">
              {stats.upcomingDeadlines}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Upcoming Deadlines
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // ===== RENDER BUREAU COMMUNICATION TAB =====
  const renderBureauCommunication = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Bureau Communication Tracker
        </Typography>
        <Button
          variant="contained"
          startIcon={<Plus />}
          onClick={() => setOpenDisputeDialog(true)}
        >
          New Dispute
        </Button>
      </Box>

      {/* Bureau Performance Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {BUREAUS.map(bureau => {
          const bureauDisputes = disputes.filter(d => d.bureau === bureau.id);
          const bureauActive = bureauDisputes.filter(d => 
            d.status === 'sent' || d.status === 'received'
          ).length;
          const bureauSuccessful = bureauDisputes.filter(d => 
            d.status === 'resolved-deleted' || d.status === 'resolved-updated' || d.status === 'resolved'
          ).length;
          const successRate = bureauDisputes.length > 0 
            ? (bureauSuccessful / bureauDisputes.length * 100).toFixed(1) 
            : 0;

          return (
            <Grid item xs={12} md={4} key={bureau.id}>
              <Card 
                elevation={3}
                sx={{
                  borderTop: `4px solid ${bureau.color}`,
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h2" sx={{ mr: 1 }}>{bureau.logo}</Typography>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {bureau.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {bureauDisputes.length} total disputes
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption">Success Rate</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        {successRate}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={parseFloat(successRate)}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: '#e5e7eb',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: bureau.color,
                        },
                      }}
                    />
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Active</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {bureauActive}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Resolved</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {bureauSuccessful}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e5e7eb' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                      Contact Info
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block' }}>
                      {bureau.phone}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      {bureau.address}
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button size="small" fullWidth onClick={() => setSelectedBureau(bureau.id)}>
                    Filter {bureau.name}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Filters */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Bureau</InputLabel>
              <Select
                value={selectedBureau}
                onChange={(e) => setSelectedBureau(e.target.value)}
                label="Bureau"
              >
                <MenuItem value="all">All Bureaus</MenuItem>
                {BUREAUS.map(b => (
                  <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All Statuses</MenuItem>
                {DISPUTE_STATUSES.map(s => (
                  <MenuItem key={s.id} value={s.id}>{s.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search disputes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={20} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Disputes Table */}
      <Paper elevation={2}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f9fafb' }}>
                <TableCell sx={{ fontWeight: 700 }}>Client</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Bureau</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Item Type</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Sent Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Deadline</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {disputes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <FileText size={48} color="#ccc" style={{ marginBottom: 16 }} />
                    <Typography variant="body1" color="text.secondary">
                      No disputes yet. Create your first dispute!
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                disputes
                  .filter(d => {
                    if (selectedBureau !== 'all' && d.bureau !== selectedBureau) return false;
                    if (selectedStatus !== 'all' && d.status !== selectedStatus) return false;
                    if (searchQuery && !d.clientName?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
                    return true;
                  })
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map(dispute => {
                    const bureau = BUREAUS.find(b => b.id === dispute.bureau);
                    const status = DISPUTE_STATUSES.find(s => s.id === dispute.status);
                    
                    return (
                      <TableRow key={dispute.id} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {dispute.clientName || 'Unknown Client'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={bureau?.name || dispute.bureau}
                            size="small"
                            sx={{
                              bgcolor: bureau?.color + '20',
                              color: bureau?.color,
                              fontWeight: 600,
                            }}
                          />
                        </TableCell>
                        <TableCell>{dispute.itemType}</TableCell>
                        <TableCell>
                          <Chip
                            label={status?.label || dispute.status}
                            size="small"
                            sx={{
                              bgcolor: status?.color + '20',
                              color: status?.color,
                              fontWeight: 600,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {dispute.sentAt ? new Date(dispute.sentAt).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell>
                          {dispute.sentAt ? (
                            <Typography variant="caption">
                              {new Date(new Date(dispute.sentAt).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                            </Typography>
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title="View Details">
                              <IconButton size="small">
                                <Eye size={16} />
                              </IconButton>
                            </Tooltip>
                            {dispute.status === 'draft' && (
                              <Tooltip title="Send Dispute">
                                <IconButton size="small" onClick={() => handleSendDispute(dispute.id)}>
                                  <Send size={16} />
                                </IconButton>
                              </Tooltip>
                            )}
                            <Tooltip title="Delete">
                              <IconButton size="small" onClick={() => handleDeleteDispute(dispute.id)}>
                                <Trash2 size={16} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={disputes.filter(d => {
            if (selectedBureau !== 'all' && d.bureau !== selectedBureau) return false;
            if (selectedStatus !== 'all' && d.status !== selectedStatus) return false;
            if (searchQuery && !d.clientName?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
            return true;
          }).length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>
    </Box>
  );

  // ===== RENDER DEADLINES TAB =====
  const renderDeadlines = () => (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        Deadline Tracker (30-Day Response Window)
      </Typography>
      <Paper elevation={2} sx={{ p: 3 }}>
        {deadlines.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Clock size={48} color="#ccc" style={{ marginBottom: 16 }} />
            <Typography variant="body1" color="text.secondary">
              No active deadlines
            </Typography>
          </Box>
        ) : (
          <List>
            {deadlines.map(deadline => {
              const bureau = BUREAUS.find(b => b.id === deadline.bureau);
              return (
                <ListItem
                  key={deadline.disputeId}
                  sx={{
                    mb: 2,
                    p: 2,
                    borderRadius: 2,
                    bgcolor: deadline.isOverdue ? '#fee2e2' : deadline.isUrgent ? '#fef3c7' : '#f0f9ff',
                    border: `1px solid ${deadline.isOverdue ? '#fca5a5' : deadline.isUrgent ? '#fcd34d' : '#bfdbfe'}`,
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: bureau?.color }}>
                      {bureau?.logo}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {deadline.clientName}
                        </Typography>
                        <Chip
                          icon={deadline.isOverdue ? <AlertCircle size={14} /> : <Clock size={14} />}
                          label={
                            deadline.isOverdue 
                              ? `OVERDUE by ${Math.abs(deadline.daysRemaining)} days` 
                              : deadline.isUrgent 
                              ? `${deadline.daysRemaining} days left - URGENT`
                              : `${deadline.daysRemaining} days remaining`
                          }
                          size="small"
                          color={deadline.isOverdue ? 'error' : deadline.isUrgent ? 'warning' : 'info'}
                          sx={{ fontWeight: 700 }}
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="caption" sx={{ display: 'block' }}>
                          Sent: {deadline.sentDate.toLocaleDateString()} → 
                          Deadline: {deadline.deadlineDate.toLocaleDateString()}
                        </Typography>
                        <Chip
                          label={bureau?.name}
                          size="small"
                          sx={{
                            mt: 1,
                            bgcolor: bureau?.color + '20',
                            color: bureau?.color,
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                    }
                  />
                </ListItem>
              );
            })}
          </List>
        )}
      </Paper>
    </Box>
  );

  // ===== RENDER TAB PANELS =====
  const renderTabPanel = (tabId) => {
    if (tabId !== activeTab) return null;

    // Custom tabs rendered inline
    if (tabId === 'bureau-communication') {
      return (
        <Fade in={true} timeout={500}>
          <Box>{renderBureauCommunication()}</Box>
        </Fade>
      );
    }

    if (tabId === 'deadlines') {
      return (
        <Fade in={true} timeout={500}>
          <Box>{renderDeadlines()}</Box>
        </Fade>
      );
    }

    // ADMIN TAB: Only visible to admin users
    if (isAdmin && tabId === tabLabels[tabLabels.length - 1]) {
      return (
        <Paper sx={{ mt: 4, p: 3 }}>
          <Tabs value={adminActiveTab} onChange={(e, v) => setAdminActiveTab(v)}>
            <Tab label="User Management" />
            <Tab label="Permissions" />
            <Tab label="System Settings" />
            <Tab label="Automation" />
            <Tab label="Delivery Config" />
            <Tab label="AI Configuration" />
            <Tab label="Metrics" />
            <Tab label="Logs" />
          </Tabs>
          {/* Tab Content */}
          {adminActiveTab === 0 && (
            <Box mt={2}><Typography variant="h5" gutterBottom>User Management</Typography>{/* ...user management UI... */}</Box>
          )}
          {adminActiveTab === 1 && (
            <Box mt={2}><Typography variant="h5" gutterBottom>Permission Management</Typography>{/* ...permissions UI... */}</Box>
          )}
          {adminActiveTab === 2 && (
            <Box mt={2}><Typography variant="h5" gutterBottom>System Settings</Typography>{/* ...system settings UI... */}</Box>
          )}
          {adminActiveTab === 3 && (
            <Box mt={2}><Typography variant="h5" gutterBottom>Automation Rules</Typography>{/* ...automation UI... */}</Box>
          )}
          {adminActiveTab === 4 && (
            <Box mt={2}><Typography variant="h5" gutterBottom>Delivery Config</Typography>{/* ...delivery config UI... */}</Box>
          )}
          {adminActiveTab === 5 && (
            <Box mt={2}><Typography variant="h5" gutterBottom>AI Configuration</Typography>{/* ...AI config UI... */}</Box>
          )}
          {adminActiveTab === 6 && (
            <Box mt={2}><Typography variant="h5" gutterBottom>Metrics</Typography>{/* ...metrics UI... */}</Box>
          )}
          {adminActiveTab === 7 && (
            <Box mt={2}><Typography variant="h5" gutterBottom>Logs</Typography>{/* ...logs UI... */}</Box>
          )}
        </Paper>
      );
    }

    // Lazy-loaded component tabs
    return (
      <Fade in={true} timeout={500}>
        <Box>
          <Suspense fallback={<LoadingFallback />}>
            {ActiveComponent && <ActiveComponent />}
          </Suspense>
        </Box>
      </Fade>
    );
  };

  // ===== RENDER TABS (DESKTOP) =====
  const renderDesktopTabs = () => (
    <Paper sx={{ mb: 3 }}>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          '& .MuiTab-root': {
            minHeight: 72,
            textTransform: 'none',
            fontSize: '0.95rem',
          },
        }}
      >
        {visibleTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Tab
              key={tab.id}
              value={tab.id}
              label={
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Icon size={20} />
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <Chip
                        label={tab.badge}
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: '0.7rem',
                          fontWeight: 'bold',
                          bgcolor: tab.color,
                          color: 'white',
                        }}
                      />
                    )}
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    {tab.description}
                  </Typography>
                </Box>
              }
            />
          );
        })}
      </Tabs>
    </Paper>
  );

  // ===== RENDER MOBILE DRAWER =====
  const renderMobileDrawer = () => (
    <Drawer
      anchor="left"
      open={drawerOpen}
      onClose={() => setDrawerOpen(false)}
      sx={{
        '& .MuiDrawer-paper': {
          width: 280,
          bgcolor: 'background.default',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight="bold">
            Dispute & Bureau Hub
          </Typography>
          <IconButton onClick={() => setDrawerOpen(false)} size="small">
            <X size={20} />
          </IconButton>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        {visibleTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <Button
              key={tab.id}
              fullWidth
              onClick={() => handleTabChange(null, tab.id)}
              sx={{
                justifyContent: 'flex-start',
                textTransform: 'none',
                mb: 1,
                py: 1.5,
                bgcolor: isActive ? 'primary.main' : 'transparent',
                color: isActive ? 'white' : 'text.primary',
                '&:hover': {
                  bgcolor: isActive ? 'primary.dark' : 'action.hover',
                },
              }}
            >
              <Icon size={20} style={{ marginRight: 12 }} />
              <Box sx={{ flex: 1, textAlign: 'left' }}>
                <Typography variant="body1" fontWeight={isActive ? 'bold' : 'normal'}>
                  {tab.label}
                  {tab.badge && (
                    <Chip
                      label={tab.badge}
                      size="small"
                      sx={{
                        ml: 1,
                        height: 18,
                        fontSize: '0.65rem',
                        fontWeight: 'bold',
                        bgcolor: tab.color,
                        color: 'white',
                      }}
                    />
                  )}
                </Typography>
                <Typography variant="caption" color={isActive ? 'rgba(255,255,255,0.8)' : 'text.secondary'}>
                  {tab.description}
                </Typography>
              </Box>
              {isActive && <ChevronRight size={20} />}
            </Button>
          );
        })}
      </Box>
    </Drawer>
  );

  // ===== MAIN RENDER =====
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* MOBILE APP BAR */}
      {isMobile && (
        <AppBar position="sticky" elevation={1}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => setDrawerOpen(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              {TABS.find(t => t.id === activeTab)?.label || 'Dispute Hub'}
            </Typography>
            <IconButton color="inherit" onClick={handleRefreshStats}>
              <RefreshCw size={20} />
            </IconButton>
          </Toolbar>
        </AppBar>
      )}

      {/* MOBILE DRAWER */}
      {isMobile && renderMobileDrawer()}

      {/* MAIN CONTENT */}
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* HEADER */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Shield size={32} />
              Ultimate Dispute & Bureau Hub
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Complete dispute management & bureau communication system with AI-powered tools
            </Typography>
          </Box>
          
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Refresh Statistics">
                <IconButton onClick={handleRefreshStats} color="primary">
                  <RefreshCw size={20} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Download Report">
                <IconButton color="primary">
                  <Download size={20} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Help">
                <IconButton color="primary">
                  <Info size={20} />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>

        {/* LOADING INDICATOR */}
        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {/* STATISTICS CARDS */}
        {!loading && renderStatsCards()}

        {/* DESKTOP TABS */}
        {!isMobile && renderDesktopTabs()}

        {/* TAB CONTENT */}
        <Paper sx={{ p: 3, minHeight: '600px' }}>
          {visibleTabs.map((tab) => renderTabPanel(tab.id))}
        </Paper>
      </Container>

      {/* SPEED DIAL (Quick Actions) */}
      <SpeedDial
        ariaLabel="Quick Actions"
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        icon={<SpeedDialIcon icon={<Zap />} />}
      >
        {quickActions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={action.action}
          />
        ))}
      </SpeedDial>

      {/* CREATE DISPUTE DIALOG */}
      <Dialog open={openDisputeDialog} onClose={() => setOpenDisputeDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Dispute</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Client Name"
                  value={disputeForm.clientName}
                  onChange={(e) => setDisputeForm({ ...disputeForm, clientName: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Bureau</InputLabel>
                  <Select
                    value={disputeForm.bureau}
                    onChange={(e) => setDisputeForm({ ...disputeForm, bureau: e.target.value })}
                    label="Bureau"
                  >
                    {BUREAUS.map(b => (
                      <MenuItem key={b.id} value={b.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <span>{b.logo}</span>
                          <span>{b.name}</span>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Item Type</InputLabel>
                  <Select
                    value={disputeForm.itemType}
                    onChange={(e) => setDisputeForm({ ...disputeForm, itemType: e.target.value })}
                    label="Item Type"
                  >
                    {DISPUTE_TYPES.map(type => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Account Name"
                  value={disputeForm.accountName}
                  onChange={(e) => setDisputeForm({ ...disputeForm, accountName: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Account Number"
                  value={disputeForm.accountNumber}
                  onChange={(e) => setDisputeForm({ ...disputeForm, accountNumber: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Dispute Reason"
                  value={disputeForm.reason}
                  onChange={(e) => setDisputeForm({ ...disputeForm, reason: e.target.value })}
                  placeholder="Explain why this item should be removed..."
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenDisputeDialog(false); resetDisputeForm(); }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleCreateDispute}>
            Create Dispute
          </Button>
        </DialogActions>
      </Dialog>

      {/* SNACKBAR NOTIFICATIONS */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

    {/* ADMIN TAB: Only visible to admin users */}
    {userRole === 'admin' && (
      <Paper sx={{ mt: 4, p: 3 }}>
        <Tabs value={adminActiveTab} onChange={(e, v) => setAdminActiveTab(v)}>
          <Tab label="Users" />
          <Tab label="Roles" />
          <Tab label="Settings" />
          <Tab label="Automation" />
          <Tab label="Templates" />
          <Tab label="Metrics" />
          <Tab label="Logs" />
        </Tabs>
        {adminActiveTab === 0 && (
          <Box mt={2}>
            <Typography variant="h5" gutterBottom>User Management</Typography>
            <Button
              variant="contained"
              startIcon={<Plus />}
              onClick={() => setSelectedUser({})}
              sx={{ mb: 2 }}
            >
              Add New User
            </Button>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map(user => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>{user.active ? 'Active' : 'Inactive'}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleEditUser(user)}>
                          <Edit size={16} />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteUser(user.id)}>
                          <Trash2 size={16} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
        {adminActiveTab === 1 && (
          <Box mt={2}>
            <Typography variant="h5" gutterBottom>Role Management</Typography>
            <Button
              variant="contained"
              startIcon={<Plus />}
              onClick={() => handleAddRole()}
              sx={{ mb: 2 }}
            >
              Add New Role
            </Button>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Role Name</TableCell>
                    <TableCell>Level</TableCell>
                    <TableCell>Permissions</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {roles.map(role => (
                    <TableRow key={role.id}>
                      <TableCell>{role.name}</TableCell>
                      <TableCell>{role.level}</TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleEditRole(role)}
                        >
                          Edit Permissions
                        </Button>
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleDeleteRole(role.id)}>
                          <Trash2 size={16} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
        {adminActiveTab === 2 && (
          <Box mt={2}>
            <Typography variant="h5" gutterBottom>System Settings</Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={systemSettings.aiEnabled}
                  onChange={(e) => setSystemSettings({ ...systemSettings, aiEnabled: e.target.checked })}
                />
              }
              label="Enable AI Features"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={systemSettings.autoSave}
                  onChange={(e) => setSystemSettings({ ...systemSettings, autoSave: e.target.checked })}
                />
              }
              label="Enable Auto Save"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={systemSettings.autoFollowUp}
                  onChange={(e) => setSystemSettings({ ...systemSettings, autoFollowUp: e.target.checked })}
                />
              }
              label="Enable Auto Follow-Up"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={systemSettings.responseTracking}
                  onChange={(e) => setSystemSettings({ ...systemSettings, responseTracking: e.target.checked })}
                />
              }
              label="Enable Response Tracking"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={systemSettings.batchProcessing}
                  onChange={(e) => setSystemSettings({ ...systemSettings, batchProcessing: e.target.checked })}
                />
              }
              label="Enable Batch Processing"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={systemSettings.certifiedMailIntegration}
                  onChange={(e) => setSystemSettings({ ...systemSettings, certifiedMailIntegration: e.target.checked })}
                />
              }
              label="Enable Certified Mail Integration"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={systemSettings.faxIntegration}
                  onChange={(e) => setSystemSettings({ ...systemSettings, faxIntegration: e.target.checked })}
                />
              }
              label="Enable Fax Integration"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={systemSettings.emailIntegration}
                  onChange={(e) => setSystemSettings({ ...systemSettings, emailIntegration: e.target.checked })}
                />
              }
              label="Enable Email Integration"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={systemSettings.portalUpload}
                  onChange={(e) => setSystemSettings({ ...systemSettings, portalUpload: e.target.checked })}
                />
              }
              label="Enable Portal Upload"
            />
            <TextField
              fullWidth
              label="Max Disputes Per Day"
              type="number"
              value={systemSettings.maxDisputesPerDay}
              onChange={(e) => setSystemSettings({ ...systemSettings, maxDisputesPerDay: e.target.value })}
              sx={{ mt: 2 }}
            />
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Default Strategy</InputLabel>
              <Select
                value={systemSettings.defaultStrategy}
                onChange={(e) => setSystemSettings({ ...systemSettings, defaultStrategy: e.target.value })}
                label="Default Strategy"
              >
                <MenuItem value="lenient">Lenient</MenuItem>
                <MenuItem value="moderate">Moderate</MenuItem>
                <MenuItem value="strict">Strict</MenuItem>
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Switch
                  checked={systemSettings.requireApproval}
                  onChange={(e) => setSystemSettings({ ...systemSettings, requireApproval: e.target.checked })}
                />
              }
              label="Require Approval for Disputes"
            />
            <TextField
              fullWidth
              label="Notification Email"
              value={systemSettings.notificationEmail}
              onChange={(e) => setSystemSettings({ ...systemSettings, notificationEmail: e.target.value })}
              sx={{ mt: 2 }}
            />
            <TextField
              fullWidth
              label="Webhook URL"
              value={systemSettings.webhookUrl}
              onChange={(e) => setSystemSettings({ ...systemSettings, webhookUrl: e.target.value })}
              sx={{ mt: 2 }}
            />
            <TextField
              fullWidth
              label="API Rate Limit (requests per minute)"
              type="number"
              value={systemSettings.apiRateLimit}
              onChange={(e) => setSystemSettings({ ...systemSettings, apiRateLimit: e.target.value })}
              sx={{ mt: 2 }}
            />
            <TextField
              fullWidth
              label="Data Retention Period (days)"
              type="number"
              value={systemSettings.dataRetentionDays}
              onChange={(e) => setSystemSettings({ ...systemSettings, dataRetentionDays: e.target.value })}
              sx={{ mt: 2 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={systemSettings.debugMode}
                  onChange={(e) => setSystemSettings({ ...systemSettings, debugMode: e.target.checked })}
                />
              }
              label="Enable Debug Mode"
            />
          </Box>
        )}
        {adminActiveTab === 3 && (
          <Box mt={2}>
            <Typography variant="h5" gutterBottom>Automation Rules</Typography>
            <Button
              variant="contained"
              startIcon={<Plus />}
              onClick={() => handleAddRule()}
              sx={{ mb: 2 }}
            >
              Add New Rule
            </Button>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Trigger</TableCell>
                    <TableCell>Action</TableCell>
                    <TableCell>Enabled</TableCell>
                    <TableCell>Conditions</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {automationRules.map(rule => (
                    <TableRow key={rule.id}>
                      <TableCell>{rule.name}</TableCell>
                      <TableCell>{rule.trigger}</TableCell>
                      <TableCell>{rule.action}</TableCell>
                      <TableCell>
                        <Switch
                          checked={rule.enabled}
                          onChange={() => handleToggleRuleEnabled(rule.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleEditRuleConditions(rule)}
                        >
                          Edit Conditions
                        </Button>
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleDeleteRule(rule.id)}>
                          <Trash2 size={16} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
        {adminActiveTab === 4 && (
          <Box mt={2}>
            <Typography variant="h5" gutterBottom>Template Management</Typography>
            <Button
              variant="contained"
              startIcon={<Plus />}
              onClick={() => handleAddTemplate()}
              sx={{ mb: 2 }}
            >
              Add New Template
            </Button>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>AI Optimized</TableCell>
                    <TableCell>Success Rate</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {templates.map(template => (
                    <TableRow key={template.id}>
                      <TableCell>{template.name}</TableCell>
                      <TableCell>{template.category}</TableCell>
                      <TableCell>
                        <Switch
                          checked={template.aiOptimized}
                          onChange={() => handleToggleTemplateAI(template.id)}
                        />
                      </TableCell>
                      <TableCell>{template.successRate}%</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleEditTemplate(template)}>
                          <Edit size={16} />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteTemplate(template.id)}>
                          <Trash2 size={16} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
        {adminActiveTab === 5 && (
          <Box mt={2}>
            <Typography variant="h5" gutterBottom>System Metrics</Typography>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Total Users</Typography>
                <LinearProgress variant="determinate" value={metrics.totalUsers} />
                <Typography variant="caption" color="text.secondary">
                  {metrics.totalUsers} users
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Active Disputes</Typography>
                <LinearProgress variant="determinate" value={metrics.activeDisputes} />
                <Typography variant="caption" color="text.secondary">
                  {metrics.activeDisputes} disputes
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Success Rate</Typography>
                <LinearProgress variant="determinate" value={metrics.successRate} />
                <Typography variant="caption" color="text.secondary">
                  {metrics.successRate}%
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Average Response Time</Typography>
                <LinearProgress variant="determinate" value={metrics.avgResponseTime} />
                <Typography variant="caption" color="text.secondary">
                  {metrics.avgResponseTime} seconds
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>AI Usage</Typography>
                <LinearProgress variant="determinate" value={metrics.aiUsage} />
                <Typography variant="caption" color="text.secondary">
                  {metrics.aiUsage}%
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>System Load</Typography>
                <LinearProgress variant="determinate" value={metrics.systemLoad} />
                <Typography variant="caption" color="text.secondary">
                  {metrics.systemLoad}%
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Error Rate</Typography>
                <LinearProgress variant="determinate" value={metrics.errorRate} />
                <Typography variant="caption" color="text.secondary">
                  {metrics.errorRate}%
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>API Calls</Typography>
                <LinearProgress variant="determinate" value={metrics.apiCalls} />
                <Typography variant="caption" color="text.secondary">
                  {metrics.apiCalls} calls
                </Typography>
              </CardContent>
            </Card>
          </Box>
        )}
        {adminActiveTab === 6 && (
          <Box mt={2}>
            <Typography variant="h5" gutterBottom>System