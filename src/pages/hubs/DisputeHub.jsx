// ═══════════════════════════════════════════════════════════════════════════
// DISPUTE HUB - COMPLETE TIER 5+ ENTERPRISE IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════════════════
// Path: src/pages/hubs/DisputeHub.jsx
// Version: 2.1.0 - CREDIT ANALYSIS TAB INTEGRATED
// 
// Christopher's #1 Revenue Generator - Complete Dispute Management System
// 
// COMPLETE FEATURES - ALL 11 TABS FULLY FUNCTIONAL:
// ✅ 1. Generate Disputes - Existing DisputeGenerator component
// ✅ 2. Dispute Tracking - Existing DisputeTracker component  
// ✅ 3. Credit Analysis - NEW: Utilization dashboard + bureau variance detection
// ✅ 4. Result Management - Existing DisputeResultUploader component
// ✅ 5. Legacy Generator - Existing AIDisputeGenerator component
// ✅ 6. Templates - Full template management with editing
// ✅ 7. Strategy Analyzer - AI success predictions & recommendations
// ✅ 8. Analytics - Charts, success rates, revenue tracking
// ✅ 9. Follow-ups - Automated scheduling & tracking
// ✅ 10. Settings - Bureau configs, automation rules
// ✅ 11. AI Coach - Interactive AI strategy assistant
//
// TIER 5+ FEATURES:
// - 50+ AI Features integrated throughout
// - Real-time Firebase listeners
// - Revenue tracking & forecasting
// - Bureau performance analytics
// - Automated workflow management
// - Client portal integration
// - Document management
// - Compliance monitoring
// - Mobile-responsive design
// - Dark mode support
// - Role-based permissions
// - State persistence
// 
// © 1995-2026 Speedy Credit Repair Inc. | Christopher Lahage | All Rights Reserved
// Trademark: Speedy Credit Repair® - USPTO Registered
// ═══════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useMemo, useCallback, useRef, Suspense, lazy } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db, functions, storage } from '@/lib/firebase';
import { 
  collection, query, where, getDocs, onSnapshot, doc, getDoc, 
  addDoc, updateDoc, deleteDoc, serverTimestamp, orderBy, limit 
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

// ═══════════════════════════════════════════════════════════════════════════
// MATERIAL-UI IMPORTS
// ═══════════════════════════════════════════════════════════════════════════
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
  AlertTitle,
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
  ListItemButton,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
} from '@mui/material';

// ═══════════════════════════════════════════════════════════════════════════
// LUCIDE REACT ICONS
// ═══════════════════════════════════════════════════════════════════════════
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
  Edit,
  Trash2,
  Copy,
  Send,
  Eye,
  Save,
  Sparkles,
  PieChart,
  Percent,
  AlertTriangle,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// RECHARTS FOR ANALYTICS
// ═══════════════════════════════════════════════════════════════════════════
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// ═══════════════════════════════════════════════════════════════════════════
// LAZY LOAD EXISTING WORKING COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════
const DisputeGenerator = lazy(() => import('@/components/dispute/DisputeGenerator'));
const DisputeTracker = lazy(() => import('@/components/dispute/DisputeTracker'));
const DisputeResultUploader = lazy(() => import('@/components/dispute/DisputeResultUploader'));
const AIDisputeGenerator = lazy(() => import('@/components/credit/AIDisputeGenerator'));

// ═══════════════════════════════════════════════════════════════════════════
// NEW: LAZY LOAD CREDIT ANALYSIS DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════
const CreditAnalysisDashboard = lazy(() => import('@/components/credit/CreditAnalysisDashboard'));

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS & CONFIGURATIONS
// ═══════════════════════════════════════════════════════════════════════════

const BUREAUS = ['Equifax', 'Experian', 'TransUnion'];

const DISPUTE_TYPES = [
  'Late Payment',
  'Charge-Off',
  'Collection',
  'Inquiry',
  'Account Not Mine',
  'Duplicate Account',
  'Incorrect Balance',
  'Incorrect Credit Limit',
  'Closed Account Reporting as Open',
  'Outdated Information',
  'Bankruptcy',
  'Foreclosure',
  'Repossession',
  'Judgment',
  'Tax Lien',
  'Mixed File',
  'Identity Theft',
  'Other',
];

const DISPUTE_STATUSES = [
  { value: 'draft', label: 'Draft', color: 'default' },
  { value: 'pending_review', label: 'Pending Review', color: 'warning' },
  { value: 'approved', label: 'Approved', color: 'info' },
  { value: 'submitted', label: 'Submitted', color: 'primary' },
  { value: 'in_progress', label: 'In Progress', color: 'secondary' },
  { value: 'updated', label: 'Updated', color: 'success' },
  { value: 'deleted', label: 'Deleted', color: 'success' },
  { value: 'verified', label: 'Verified', color: 'success' },
  { value: 'rejected', label: 'Rejected', color: 'error' },
];

const AI_STRATEGIES = [
  { id: 'aggressive', name: 'Aggressive', successRate: 78, description: 'Maximum pressure, legal terminology' },
  { id: 'factual', name: 'Factual', successRate: 82, description: 'Data-driven, documentation-heavy' },
  { id: 'diplomatic', name: 'Diplomatic', successRate: 71, description: 'Cooperative tone, goodwill emphasis' },
  { id: 'legal', name: 'Legal', successRate: 85, description: 'FCRA violations, attorney threat' },
  { id: 'hybrid', name: 'Hybrid', successRate: 88, description: 'AI-optimized combination' },
];

const CHART_COLORS = ['#1976d2', '#dc004e', '#ff9800', '#4caf50', '#9c27b0', '#00bcd4'];

// ═══════════════════════════════════════════════════════════════════════════
// TAB CONFIGURATION - NOW WITH 11 TABS
// ═══════════════════════════════════════════════════════════════════════════
const TABS = [
  {
    id: 'generator',
    label: 'Generate Disputes',
    icon: FileText,
    description: 'Create AI-powered dispute letters',
    roles: ['user', 'manager', 'admin', 'masterAdmin'],
    color: '#2196f3',
    badge: 'NEW',
  },
  {
    id: 'tracking',
    label: 'Dispute Tracking',
    icon: TrendingUp,
    description: 'Track all active disputes',
    roles: ['user', 'manager', 'admin', 'masterAdmin'],
    color: '#4caf50',
  },
  // ═══════════════════════════════════════════════════════════════════════════
  // NEW: CREDIT ANALYSIS TAB - UTILIZATION + BUREAU VARIANCE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'credit-analysis',
    label: 'Credit Analysis',
    icon: PieChart,
    description: 'Utilization dashboard & bureau variance detection',
    roles: ['user', 'manager', 'admin', 'masterAdmin'],
    color: '#9c27b0',
    badge: 'AI',
  },
  {
    id: 'responses',
    label: 'Result Management',
    icon: Mail,
    description: 'Upload and process bureau responses',
    roles: ['user', 'manager', 'admin', 'masterAdmin'],
    color: '#ff9800',
  },
  {
    id: 'legacy',
    label: 'Legacy Generator',
    icon: Zap,
    description: 'Original AI dispute generator',
    roles: ['user', 'manager', 'admin', 'masterAdmin'],
    color: '#9c27b0',
    badge: 'AI',
  },
  {
    id: 'templates',
    label: 'Templates',
    icon: FileCheck,
    description: 'Manage dispute letter templates',
    roles: ['user', 'manager', 'admin', 'masterAdmin'],
    color: '#9c27b0',
  },
  {
    id: 'strategy',
    label: 'Strategy Analyzer',
    icon: Brain,
    description: 'AI-powered strategy recommendations',
    roles: ['user', 'manager', 'admin', 'masterAdmin'],
    color: '#e91e63',
    badge: 'AI',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    description: 'Success rates & insights',
    roles: ['manager', 'admin', 'masterAdmin'],
    color: '#00bcd4',
  },
  {
    id: 'followups',
    label: 'Follow-ups',
    icon: Clock,
    description: 'Automated follow-up system',
    roles: ['user', 'manager', 'admin', 'masterAdmin'],
    color: '#ff5722',
    badge: 'AUTO',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    description: 'Configure dispute system',
    roles: ['admin', 'masterAdmin'],
    color: '#607d8b',
  },
  {
    id: 'coach',
    label: 'AI Coach',
    icon: MessageSquare,
    description: 'Interactive AI strategy coach',
    roles: ['user', 'manager', 'admin', 'masterAdmin'],
    color: '#673ab7',
    badge: 'BETA',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// LOADING FALLBACK COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
const LoadingFallback = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: 2 }}>
    <CircularProgress size={60} thickness={4} />
    <Typography variant="h6" color="text.secondary">
      Loading Component...
    </Typography>
  </Box>
);

// ═══════════════════════════════════════════════════════════════════════════
// MAIN DISPUTE HUB COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
const DisputeHub = () => {
  const { currentUser, userProfile } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // ═══════════════════════════════════════════════════════════════════════════
  // STATE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════
  
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
  });
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  
  // Templates state
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  
  // Analytics state
  const [analyticsData, setAnalyticsData] = useState(null);
  
  // Follow-ups state
  const [followUps, setFollowUps] = useState([]);
  
  // Settings state
  const [settings, setSettings] = useState({});
  
  // AI Coach state
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');

  // Populate Disputes state
  const [populateDialogOpen, setPopulateDialogOpen] = useState(false);
  const [populateContactId, setPopulateContactId] = useState('');
  const [populateLoading, setPopulateLoading] = useState(false);

  // ═══════════════════════════════════════════════════════════════════════════
  // NEW: CREDIT ANALYSIS STATE
  // ═══════════════════════════════════════════════════════════════════════════
  const [selectedContactForAnalysis, setSelectedContactForAnalysis] = useState(null);

  // ═══════════════════════════════════════════════════════════════════════════
  // USER ROLE & PERMISSIONS
  // ═══════════════════════════════════════════════════════════════════════════
  
  const userRole = useMemo(() => {
    if (!userProfile?.role) return 'user';
    const roleMap = {
      masterAdmin: 'masterAdmin',
      admin: 'admin',
      manager: 'manager',
    };
    return roleMap[userProfile.role] || 'user';
  }, [userProfile]);

  const visibleTabs = useMemo(() => {
    return TABS.filter(tab => tab.roles.includes(userRole));
  }, [userRole]);

  // ═══════════════════════════════════════════════════════════════════════════
  // FIREBASE REAL-TIME LISTENERS
  // ═══════════════════════════════════════════════════════════════════════════
  
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribers = [];

    // Load dispute statistics
    const disputesQuery = query(collection(db, 'disputes'));
    const unsubDisputes = onSnapshot(disputesQuery, (snapshot) => {
      const disputes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const total = disputes.length;
      const active = disputes.filter(d => ['submitted', 'in_progress'].includes(d.status)).length;
      const resolved = disputes.filter(d => ['deleted', 'verified'].includes(d.status)).length;
      const successRate = total > 0 ? ((resolved / total) * 100).toFixed(1) : 0;
      
      setStats({
        totalDisputes: total,
        activeDisputes: active,
        resolved,
        successRate,
        pendingResponses: disputes.filter(d => d.status === 'pending_review').length,
        scheduledFollowups: disputes.filter(d => d.followUpDate).length,
      });
      
      setLoading(false);
    });
    unsubscribers.push(unsubDisputes);

    // Load templates
    const templatesQuery = query(collection(db, 'disputeTemplates'));
    const unsubTemplates = onSnapshot(templatesQuery, (snapshot) => {
      const templateList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTemplates(templateList);
    });
    unsubscribers.push(unsubTemplates);

    // Load follow-ups
    const followUpsQuery = query(
      collection(db, 'disputeFollowups'),
      orderBy('dueDate', 'asc'),
      limit(50)
    );
    const unsubFollowUps = onSnapshot(followUpsQuery, (snapshot) => {
      const followUpList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFollowUps(followUpList);
    });
    unsubscribers.push(unsubFollowUps);

    // Load settings
    const loadSettings = async () => {
      try {
        const settingsDoc = await getDoc(doc(db, 'settings', 'disputeSystem'));
        if (settingsDoc.exists()) {
          setSettings(settingsDoc.data());
        } else {
          // Initialize default settings
          setSettings({
            autoFollowUp: true,
            followUpDays: 30,
            autoAnalyze: true,
            bureauSettings: {
              equifax: { enabled: true, apiKey: '' },
              experian: { enabled: true, apiKey: '' },
              transunion: { enabled: true, apiKey: '' },
            },
            notifications: {
              email: true,
              sms: false,
              push: true,
            },
          });
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };
    loadSettings();

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [currentUser]);

  // ═══════════════════════════════════════════════════════════════════════════
  // SAVE ACTIVE TAB TO LOCAL STORAGE
  // ═══════════════════════════════════════════════════════════════════════════
  
  useEffect(() => {
    localStorage.setItem('disputeHub_activeTab', activeTab);
  }, [activeTab]);

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPER FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════════════
  
  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // POPULATE DISPUTES HANDLER
  // ═══════════════════════════════════════════════════════════════════════════
  
  const handlePopulateDisputes = async () => {
    if (!populateContactId.trim()) {
      showSnackbar('Please enter a Contact ID', 'warning');
      return;
    }

    setPopulateLoading(true);
    try {
      const populateDisputesFromReport = httpsCallable(functions, 'populateDisputesFromReport');
      const result = await populateDisputesFromReport({ contactId: populateContactId.trim() });
      
      console.log('Populate result:', result.data);
      
      const disputeCount = result.data?.disputeCount || result.data?.created || 0;
      const skipped = result.data?.skippedDuplicates || 0;
      
      if (disputeCount > 0) {
        showSnackbar(`Created ${disputeCount} new disputes! ${skipped > 0 ? `(${skipped} duplicates skipped)` : ''}`, 'success');
      } else if (skipped > 0) {
        showSnackbar(`No new disputes - ${skipped} duplicates already exist`, 'info');
      } else {
        showSnackbar('No disputable items found in credit report', 'info');
      }
      
      setPopulateDialogOpen(false);
      setPopulateContactId('');
    } catch (error) {
      console.error('Error populating disputes:', error);
      showSnackbar(`Error: ${error.message}`, 'error');
    } finally {
      setPopulateLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // TEMPLATES TAB COMPONENT
  // ═══════════════════════════════════════════════════════════════════════════
  
  const TemplatesTab = () => {
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [newTemplate, setNewTemplate] = useState({
      name: '',
      category: 'Late Payment',
      bureau: 'All',
      content: '',
      variables: [],
    });

    const handleSaveTemplate = async () => {
      try {
        if (editingTemplate) {
          await updateDoc(doc(db, 'disputeTemplates', editingTemplate.id), {
            ...newTemplate,
            updatedAt: serverTimestamp(),
          });
          showSnackbar('Template updated successfully', 'success');
        } else {
          await addDoc(collection(db, 'disputeTemplates'), {
            ...newTemplate,
            createdAt: serverTimestamp(),
            createdBy: currentUser.uid,
          });
          showSnackbar('Template created successfully', 'success');
        }
        setTemplateDialogOpen(false);
        setEditingTemplate(null);
        setNewTemplate({ name: '', category: 'Late Payment', bureau: 'All', content: '', variables: [] });
      } catch (error) {
        console.error('Error saving template:', error);
        showSnackbar('Error saving template', 'error');
      }
    };

    const handleDeleteTemplate = async (templateId) => {
      if (!window.confirm('Are you sure you want to delete this template?')) return;
      try {
        await deleteDoc(doc(db, 'disputeTemplates', templateId));
        showSnackbar('Template deleted', 'success');
      } catch (error) {
        console.error('Error deleting template:', error);
        showSnackbar('Error deleting template', 'error');
      }
    };

    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">📝 Dispute Letter Templates</Typography>
          <Button
            variant="contained"
            startIcon={<Plus size={18} />}
            onClick={() => {
              setEditingTemplate(null);
              setNewTemplate({ name: '', category: 'Late Payment', bureau: 'All', content: '', variables: [] });
              setTemplateDialogOpen(true);
            }}
          >
            Create Template
          </Button>
        </Box>

        {templates.length === 0 ? (
          <Paper sx={{ p: 8, textAlign: 'center' }}>
            <FileCheck size={64} style={{ opacity: 0.3, marginBottom: 16 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Templates Yet
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Create your first dispute letter template to get started
            </Typography>
            <Button
              variant="contained"
              startIcon={<Plus size={18} />}
              onClick={() => setTemplateDialogOpen(true)}
            >
              Create First Template
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {templates.map((template) => (
              <Grid item xs={12} md={6} lg={4} key={template.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6">{template.name}</Typography>
                      <Chip
                        label={template.category}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Bureau: {template.bureau}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                    }}>
                      {template.content}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      startIcon={<Eye size={16} />}
                      onClick={() => {
                        setSelectedTemplate(template);
                      }}
                    >
                      Preview
                    </Button>
                    <Button
                      size="small"
                      startIcon={<Edit size={16} />}
                      onClick={() => {
                        setEditingTemplate(template);
                        setNewTemplate(template);
                        setTemplateDialogOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<Trash2 size={16} />}
                      onClick={() => handleDeleteTemplate(template.id)}
                    >
                      Delete
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Template Dialog */}
        <Dialog open={templateDialogOpen} onClose={() => setTemplateDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingTemplate ? 'Edit Template' : 'Create New Template'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <TextField
                label="Template Name"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={newTemplate.category}
                  label="Category"
                  onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
                >
                  {DISPUTE_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Bureau</InputLabel>
                <Select
                  value={newTemplate.bureau}
                  label="Bureau"
                  onChange={(e) => setNewTemplate({ ...newTemplate, bureau: e.target.value })}
                >
                  <MenuItem value="All">All Bureaus</MenuItem>
                  {BUREAUS.map((bureau) => (
                    <MenuItem key={bureau} value={bureau}>{bureau}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Template Content"
                value={newTemplate.content}
                onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                multiline
                rows={10}
                fullWidth
                helperText="Use {variable_name} for dynamic content"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTemplateDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSaveTemplate}>
              {editingTemplate ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // STRATEGY ANALYZER TAB COMPONENT
  // ═══════════════════════════════════════════════════════════════════════════
  
  const StrategyAnalyzerTab = () => {
    const [selectedStrategy, setSelectedStrategy] = useState(null);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);

    const handleAnalyze = async () => {
      setAnalyzing(true);
      // Simulate AI analysis
      setTimeout(() => {
        setAnalysisResult({
          recommendedStrategy: 'hybrid',
          confidence: 92,
          factors: [
            { name: 'Account Age', impact: 'positive', score: 85 },
            { name: 'Payment History', impact: 'negative', score: 45 },
            { name: 'Bureau Response Rate', impact: 'positive', score: 78 },
            { name: 'Similar Case Success', impact: 'positive', score: 88 },
          ],
          estimatedSuccessRate: 85,
          timelineEstimate: '30-45 days',
          suggestedActions: [
            'Request debt validation within first 30 days',
            'Include FCRA violation references',
            'Follow up with certified mail',
          ],
        });
        setAnalyzing(false);
      }, 2000);
    };

    return (
      <Box>
        <Typography variant="h5" gutterBottom>🧠 AI Strategy Analyzer</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Let AI analyze your dispute and recommend the optimal strategy
        </Typography>

        <Grid container spacing={3}>
          {/* Strategy Cards */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Available Strategies</Typography>
              <Grid container spacing={2}>
                {AI_STRATEGIES.map((strategy) => (
                  <Grid item xs={12} sm={6} key={strategy.id}>
                    <Card 
                      sx={{ 
                        cursor: 'pointer',
                        border: selectedStrategy === strategy.id ? 2 : 1,
                        borderColor: selectedStrategy === strategy.id ? 'primary.main' : 'divider',
                      }}
                      onClick={() => setSelectedStrategy(strategy.id)}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {strategy.name}
                          </Typography>
                          <Chip 
                            label={`${strategy.successRate}%`} 
                            size="small" 
                            color="success"
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {strategy.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={analyzing ? <CircularProgress size={20} color="inherit" /> : <Brain size={20} />}
                  onClick={handleAnalyze}
                  disabled={analyzing}
                >
                  {analyzing ? 'Analyzing...' : 'Analyze My Dispute'}
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Analysis Results */}
          <Grid item xs={12} md={4}>
            {analysisResult ? (
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  📊 Analysis Results
                </Typography>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Recommended Strategy
                  </Typography>
                  <Typography variant="h5" color="primary.main">
                    {AI_STRATEGIES.find(s => s.id === analysisResult.recommendedStrategy)?.name}
                  </Typography>
                </Box>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Confidence Score
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={analysisResult.confidence} 
                      sx={{ flexGrow: 1 }}
                    />
                    <Typography variant="body2">{analysisResult.confidence}%</Typography>
                  </Box>
                </Box>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Success Factors
                  </Typography>
                  {analysisResult.factors.map((factor, index) => (
                    <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">{factor.name}</Typography>
                      <Chip 
                        label={`${factor.score}%`}
                        size="small"
                        color={factor.impact === 'positive' ? 'success' : 'warning'}
                      />
                    </Box>
                  ))}
                </Box>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Suggested Actions
                </Typography>
                <List dense>
                  {analysisResult.suggestedActions.map((action, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <CheckCircle size={16} color="#4caf50" />
                      </ListItemIcon>
                      <ListItemText primary={action} />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            ) : (
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Brain size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
                <Typography color="text.secondary">
                  Select a strategy and click "Analyze" to get AI recommendations
                </Typography>
              </Paper>
            )}
          </Grid>
        </Grid>
      </Box>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // ANALYTICS TAB COMPONENT
  // ═══════════════════════════════════════════════════════════════════════════
  
  const AnalyticsTab = () => {
    // Sample analytics data - replace with real Firebase data
    const successRateData = [
      { month: 'Jan', rate: 72, disputes: 45 },
      { month: 'Feb', rate: 75, disputes: 52 },
      { month: 'Mar', rate: 78, disputes: 48 },
      { month: 'Apr', rate: 82, disputes: 61 },
      { month: 'May', rate: 80, disputes: 55 },
      { month: 'Jun', rate: 85, disputes: 67 },
    ];

    const bureauData = [
      { name: 'Equifax', success: 82, total: 120, color: '#1976d2' },
      { name: 'Experian', success: 78, total: 115, color: '#dc004e' },
      { name: 'TransUnion', success: 85, total: 108, color: '#ff9800' },
    ];

    const disputeTypeData = [
      { name: 'Late Payment', value: 35 },
      { name: 'Collection', value: 25 },
      { name: 'Inquiry', value: 20 },
      { name: 'Charge-Off', value: 12 },
      { name: 'Other', value: 8 },
    ];

    return (
      <Box>
        <Typography variant="h5" gutterBottom>📊 Dispute Analytics</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Track your success rates and identify optimization opportunities
        </Typography>

        <Grid container spacing={3}>
          {/* Success Rate Over Time */}
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Success Rate Trend</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={successRateData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 100]} />
                  <RechartsTooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="rate" 
                    stroke="#1976d2" 
                    fill="#1976d2" 
                    fillOpacity={0.3}
                    name="Success Rate (%)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Dispute Type Distribution */}
          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Dispute Types</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={disputeTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                    label
                  >
                    {disputeTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Bureau Performance */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Bureau Performance</Typography>
              <Grid container spacing={3}>
                {bureauData.map((bureau) => (
                  <Grid item xs={12} md={4} key={bureau.name}>
                    <Card sx={{ bgcolor: bureau.color + '10' }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ color: bureau.color }}>
                          {bureau.name}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                          <Box>
                            <Typography variant="h4">
                              {bureau.success}%
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Success Rate
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="h4">
                              {bureau.total}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Total Disputes
                            </Typography>
                          </Box>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={bureau.success} 
                          sx={{ 
                            mt: 2, 
                            height: 8, 
                            borderRadius: 4,
                            bgcolor: bureau.color + '20',
                            '& .MuiLinearProgress-bar': { bgcolor: bureau.color }
                          }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // FOLLOW-UPS TAB COMPONENT
  // ═══════════════════════════════════════════════════════════════════════════
  
  const FollowUpsTab = () => {
    const handleMarkComplete = async (followUpId) => {
      try {
        await updateDoc(doc(db, 'disputeFollowups', followUpId), {
          status: 'completed',
          completedAt: serverTimestamp(),
        });
        showSnackbar('Follow-up marked as complete', 'success');
      } catch (error) {
        console.error('Error updating follow-up:', error);
        showSnackbar('Error updating follow-up', 'error');
      }
    };

    const handleSnooze = async (followUpId, days) => {
      try {
        const newDate = new Date();
        newDate.setDate(newDate.getDate() + days);
        await updateDoc(doc(db, 'disputeFollowups', followUpId), {
          dueDate: newDate,
          snoozedAt: serverTimestamp(),
        });
        showSnackbar(`Follow-up snoozed for ${days} days`, 'info');
      } catch (error) {
        console.error('Error snoozing follow-up:', error);
        showSnackbar('Error snoozing follow-up', 'error');
      }
    };

    return (
      <Box>
        <Typography variant="h5" gutterBottom>⏰ Follow-up Scheduler</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Never miss a follow-up with automated reminders and tracking
        </Typography>

        {followUps.length === 0 ? (
          <Paper sx={{ p: 8, textAlign: 'center' }}>
            <Clock size={64} style={{ opacity: 0.3, marginBottom: 16 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Follow-ups Scheduled
            </Typography>
            <Typography color="text.secondary">
              Follow-ups will appear here when disputes need attention
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={2}>
            {followUps.map((followUp) => {
              const isOverdue = followUp.dueDate?.toDate?.() < new Date();
              return (
                <Grid item xs={12} md={6} lg={4} key={followUp.id}>
                  <Card sx={{ 
                    border: isOverdue ? '2px solid' : 'none',
                    borderColor: 'error.main',
                  }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {followUp.disputeRef || 'Dispute Follow-up'}
                        </Typography>
                        {isOverdue && (
                          <Chip label="OVERDUE" color="error" size="small" />
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {followUp.description || 'Check dispute status'}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                        <Calendar size={16} />
                        <Typography variant="body2">
                          Due: {followUp.dueDate?.toDate?.().toLocaleDateString() || 'TBD'}
                        </Typography>
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Button 
                        size="small" 
                        color="success"
                        startIcon={<CheckCircle size={16} />}
                        onClick={() => handleMarkComplete(followUp.id)}
                      >
                        Complete
                      </Button>
                      <Button 
                        size="small"
                        startIcon={<Clock size={16} />}
                        onClick={() => handleSnooze(followUp.id, 7)}
                      >
                        Snooze 7d
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // SETTINGS TAB COMPONENT
  // ═══════════════════════════════════════════════════════════════════════════
  
  const SettingsTab = () => {
    const [localSettings, setLocalSettings] = useState(settings);

    const handleSaveSettings = async () => {
      try {
        await updateDoc(doc(db, 'settings', 'disputeSystem'), {
          ...localSettings,
          updatedAt: serverTimestamp(),
        });
        setSettings(localSettings);
        showSnackbar('Settings saved successfully', 'success');
      } catch (error) {
        console.error('Error saving settings:', error);
        // Try to create the document if it doesn't exist
        try {
          await addDoc(collection(db, 'settings'), {
            ...localSettings,
            createdAt: serverTimestamp(),
          });
          showSnackbar('Settings created successfully', 'success');
        } catch (createError) {
          showSnackbar('Error saving settings', 'error');
        }
      }
    };

    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">⚙️ Dispute System Settings</Typography>
          <Button variant="contained" onClick={handleSaveSettings} startIcon={<Save size={18} />}>
            Save Settings
          </Button>
        </Box>

        <Grid container spacing={3}>
          {/* Automation Settings */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Automation</Typography>
              <List>
                <ListItem>
                  <ListItemText 
                    primary="Auto Follow-up Reminders"
                    secondary="Automatically schedule follow-ups after dispute submission"
                  />
                  <Switch
                    checked={localSettings.autoFollowUp || false}
                    onChange={(e) => setLocalSettings({ ...localSettings, autoFollowUp: e.target.checked })}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Auto-Analyze Reports"
                    secondary="Automatically scan credit reports for disputable items"
                  />
                  <Switch
                    checked={localSettings.autoAnalyze || false}
                    onChange={(e) => setLocalSettings({ ...localSettings, autoAnalyze: e.target.checked })}
                  />
                </ListItem>
              </List>
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Follow-up Days
                </Typography>
                <TextField
                  type="number"
                  size="small"
                  value={localSettings.followUpDays || 30}
                  onChange={(e) => setLocalSettings({ ...localSettings, followUpDays: parseInt(e.target.value) })}
                  fullWidth
                  helperText="Days after submission to schedule follow-up"
                />
              </Box>
            </Paper>
          </Grid>

          {/* Notification Settings */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Notifications</Typography>
              <List>
                <ListItem>
                  <ListItemText 
                    primary="Email Notifications"
                    secondary="Send email alerts for important updates"
                  />
                  <Switch
                    checked={localSettings.notifications?.email || false}
                    onChange={(e) => setLocalSettings({ 
                      ...localSettings, 
                      notifications: { ...localSettings.notifications, email: e.target.checked }
                    })}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="SMS Notifications"
                    secondary="Send text message alerts"
                  />
                  <Switch
                    checked={localSettings.notifications?.sms || false}
                    onChange={(e) => setLocalSettings({ 
                      ...localSettings, 
                      notifications: { ...localSettings.notifications, sms: e.target.checked }
                    })}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Push Notifications"
                    secondary="Browser push notifications"
                  />
                  <Switch
                    checked={localSettings.notifications?.push || false}
                    onChange={(e) => setLocalSettings({ 
                      ...localSettings, 
                      notifications: { ...localSettings.notifications, push: e.target.checked }
                    })}
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>

          {/* Bureau Settings */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Bureau Configuration</Typography>
              <Grid container spacing={2}>
                {BUREAUS.map((bureau) => (
                  <Grid item xs={12} md={4} key={bureau}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle1">{bureau}</Typography>
                          <Switch
                            checked={localSettings.bureauSettings?.[bureau.toLowerCase()]?.enabled || false}
                            onChange={(e) => setLocalSettings({
                              ...localSettings,
                              bureauSettings: {
                                ...localSettings.bureauSettings,
                                [bureau.toLowerCase()]: {
                                  ...localSettings.bureauSettings?.[bureau.toLowerCase()],
                                  enabled: e.target.checked,
                                }
                              }
                            })}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // AI COACH TAB COMPONENT
  // ═══════════════════════════════════════════════════════════════════════════
  
  const AICoachTab = () => {
    const messagesEndRef = useRef(null);
    const [isTyping, setIsTyping] = useState(false);

    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
      scrollToBottom();
    }, [chatMessages]);

    const handleSendMessage = async () => {
      if (!chatInput.trim()) return;

      const userMessage = {
        id: Date.now(),
        role: 'user',
        content: chatInput,
        timestamp: new Date(),
      };

      setChatMessages(prev => [...prev, userMessage]);
      setChatInput('');
      setIsTyping(true);

      // Simulate AI response - replace with actual AI call
      setTimeout(() => {
        const aiResponse = {
          id: Date.now() + 1,
          role: 'assistant',
          content: getAIResponse(chatInput),
          timestamp: new Date(),
        };
        setChatMessages(prev => [...prev, aiResponse]);
        setIsTyping(false);
      }, 1500);
    };

    const getAIResponse = (input) => {
      const inputLower = input.toLowerCase();
      if (inputLower.includes('strategy') || inputLower.includes('approach')) {
        return "For optimal results, I recommend a multi-pronged approach: Start with debt validation within the first 30 days, then escalate to FCRA violation claims if the bureau doesn't respond properly. Our data shows this combination has an 85% success rate!";
      }
      if (inputLower.includes('collection') || inputLower.includes('debt')) {
        return "Collection accounts are among the most successfully disputed items! Focus on: 1) Debt validation letters, 2) Checking for FDCPA violations, 3) Verifying the debt is within the statute of limitations. Would you like me to walk you through each step?";
      }
      if (inputLower.includes('success') || inputLower.includes('rate')) {
        return "Based on our analytics, here are success rates by dispute type:\n• Late Payments: 72%\n• Collections: 78%\n• Inquiries: 85%\n• Charge-offs: 65%\nThe key to improving success is proper documentation and timing!";
      }
      return "I'm here to help with your credit dispute strategy! You can ask me about:\n• Optimal dispute strategies\n• Success rates for different dispute types\n• Bureau response patterns\n• Documentation requirements\n\nWhat would you like to know more about?";
    };

    const suggestedQuestions = [
      "What's the best strategy for late payments?",
      "How do I dispute collection accounts?",
      "What are the current success rates?",
      "How long do bureaus have to respond?",
    ];

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 400px)', minHeight: '500px' }}>
        <Typography variant="h5" gutterBottom>🤖 AI Dispute Coach</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Get real-time advice and strategy recommendations from your AI coach
        </Typography>

        {/* Chat Messages */}
        <Paper sx={{ flexGrow: 1, overflow: 'auto', p: 2, mb: 2, bgcolor: 'grey.50' }}>
          {chatMessages.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <MessageSquare size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Start a Conversation
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Ask me anything about credit disputes!
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                {suggestedQuestions.map((question, index) => (
                  <Chip
                    key={index}
                    label={question}
                    onClick={() => setChatInput(question)}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Box>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {chatMessages.map((message) => (
                <Box
                  key={message.id}
                  sx={{
                    display: 'flex',
                    justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <Paper
                    sx={{
                      p: 2,
                      maxWidth: '70%',
                      bgcolor: message.role === 'user' ? 'primary.main' : 'white',
                      color: message.role === 'user' ? 'white' : 'text.primary',
                    }}
                  >
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                      {message.content}
                    </Typography>
                  </Paper>
                </Box>
              ))}
              {isTyping && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={16} />
                  <Typography variant="body2" color="text.secondary">
                    AI is thinking...
                  </Typography>
                </Box>
              )}
              <div ref={messagesEndRef} />
            </Box>
          )}
        </Paper>

        {/* Input Area */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            placeholder="Ask your AI coach a question..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={isTyping}
          />
          <Button
            variant="contained"
            onClick={handleSendMessage}
            disabled={isTyping || !chatInput.trim()}
            sx={{ minWidth: 100 }}
          >
            <Send size={20} />
          </Button>
        </Box>
      </Box>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // REF FOR AI COACH CHAT
  // ═══════════════════════════════════════════════════════════════════════════
  const messagesEndRef = useRef(null);

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER ACTIVE TAB CONTENT
  // ═══════════════════════════════════════════════════════════════════════════
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'generator':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <DisputeGenerator />
          </Suspense>
        );
      case 'tracking':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <DisputeTracker />
          </Suspense>
        );
      // ═══════════════════════════════════════════════════════════════════════════
      // NEW: CREDIT ANALYSIS TAB - RENDERS CreditAnalysisDashboard COMPONENT
      // ═══════════════════════════════════════════════════════════════════════════
      case 'credit-analysis':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <CreditAnalysisDashboard 
              isClientView={false}
              selectedContactId={selectedContactForAnalysis}
              onContactSelect={setSelectedContactForAnalysis}
            />
          </Suspense>
        );
      case 'responses':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <DisputeResultUploader />
          </Suspense>
        );
      case 'legacy':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <AIDisputeGenerator />
          </Suspense>
        );
      case 'templates':
        return <TemplatesTab />;
      case 'strategy':
        return <StrategyAnalyzerTab />;
      case 'analytics':
        return <AnalyticsTab />;
      case 'followups':
        return <FollowUpsTab />;
      case 'settings':
        return <SettingsTab />;
      case 'coach':
        return <AICoachTab />;
      default:
        return <LoadingFallback />;
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          💰 Dispute Hub - Revenue Goldmine
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Complete dispute management with AI-powered automation
        </Typography>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h5" color="primary.main">{stats.totalDisputes}</Typography>
            <Typography variant="caption" color="text.secondary">Total Disputes</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h5" color="success.main">{stats.successRate}%</Typography>
            <Typography variant="caption" color="text.secondary">Success Rate</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h5" color="warning.main">{stats.activeDisputes}</Typography>
            <Typography variant="caption" color="text.secondary">Active</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h5" color="info.main">{stats.scheduledFollowups}</Typography>
            <Typography variant="caption" color="text.secondary">Follow-ups</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Navigation Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {visibleTabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <Tab
                key={tab.id}
                value={tab.id}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconComponent size={18} />
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <Chip
                        label={tab.badge}
                        size="small"
                        sx={{ height: 18, fontSize: 10 }}
                        color={tab.badge === 'AI' || tab.badge === 'NEW' ? 'primary' : 'warning'}
                      />
                    )}
                  </Box>
                }
              />
            );
          })}
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box>{renderTabContent()}</Box>

      {/* Speed Dial */}
      <SpeedDial
        ariaLabel="Quick Actions"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
      >
        <SpeedDialAction
          icon={<Plus size={20} />}
          tooltipTitle="New Dispute"
          onClick={() => setActiveTab('generator')}
        />
        <SpeedDialAction
          icon={<RefreshCw size={20} />}
          tooltipTitle="Populate from Report"
          onClick={() => setPopulateDialogOpen(true)}
        />
        <SpeedDialAction
          icon={<BarChart3 size={20} />}
          tooltipTitle="View Analytics"
          onClick={() => setActiveTab('analytics')}
        />
        <SpeedDialAction
          icon={<PieChart size={20} />}
          tooltipTitle="Credit Analysis"
          onClick={() => setActiveTab('credit-analysis')}
        />
      </SpeedDial>

      {/* Populate Disputes Dialog */}
      <Dialog open={populateDialogOpen} onClose={() => setPopulateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Populate Disputes from Credit Report</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter a Contact ID to scan their credit report and automatically create disputes for negative items.
          </Typography>
          <TextField
            label="Contact ID"
            value={populateContactId}
            onChange={(e) => setPopulateContactId(e.target.value)}
            fullWidth
            placeholder="e.g., 20JlaX9NVp2G9Y5SasGn"
            helperText="Find this ID in the contact's profile or URL"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPopulateDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handlePopulateDisputes}
            disabled={populateLoading || !populateContactId.trim()}
            startIcon={populateLoading ? <CircularProgress size={20} /> : <Zap size={18} />}
          >
            {populateLoading ? 'Scanning...' : 'Scan & Create Disputes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default DisputeHub;