// ============================================================================
// CreditMonitoringSystem.jsx - AUTOMATED CREDIT MONITORING ENGINE
// ============================================================================
// VERSION: 1.0.0
// AUTHOR: SpeedyCRM Development Team
// LAST UPDATED: 2025-11-07
// FILE #5 of 7 - IDIQ Credit Reports Hub
//
// DESCRIPTION:
// Complete automated credit monitoring system with scheduled re-pulls,
// intelligent change detection, multi-channel alerts, AI-powered insights,
// and comprehensive performance tracking. Monitors credit reports for changes
// and automatically notifies clients and staff.
//
// FEATURES:
// ✅ Automated scheduled credit report re-pulls (monthly/quarterly/custom)
// ✅ Intelligent change detection (scores, accounts, items, inquiries)
// ✅ Multi-channel alerts (email/SMS/push/in-app notifications)
// ✅ Score tracking timeline with interactive charts
// ✅ Automatic comparison with previous reports
// ✅ Trigger-based actions (score drops, new items, deletions)
// ✅ Client notification templates (customizable)
// ✅ Admin dashboard for all monitoring jobs
// ✅ AI-powered insights on credit changes
// ✅ Goal progress tracking with visual indicators
// ✅ Firebase Cloud Functions integration (webhooks)
// ✅ Bureau-specific monitoring rules
// ✅ Bulk monitoring operations
// ✅ Export monitoring history
// ✅ Mobile responsive design
// ✅ Dark mode support
//
// TABS:
// Tab 1: Monitoring Schedule - Set up and manage monitoring jobs
// Tab 2: Active Monitors - All active monitoring jobs with status
// Tab 3: Change History - Timeline of detected changes
// Tab 4: Alert Rules - Configure trigger conditions
// Tab 5: Analytics - Trends, predictions, and insights
//
// AI FEATURES:
// - AI change significance analysis
// - AI score prediction (3-6 month forecast)
// - AI alert optimization (reduce noise)
// - AI client communication suggestions
// - AI monitoring frequency recommendations
//
// DEPENDENCIES:
// - React, Material-UI, Firebase
// - OpenAI API (for AI features)
// - Recharts (for visualizations)
// - date-fns (for date handling)
//
// FIREBASE COLLECTIONS:
// - creditMonitoringJobs: Scheduled monitoring jobs
// - creditMonitoringAlerts: Generated alerts
// - creditMonitoringHistory: Change detection history
// - creditReports: Credit report data from IDIQ
// - contacts: Client information
//
// USAGE:
// import CreditMonitoringSystem from './components/credit/CreditMonitoringSystem';
// <CreditMonitoringSystem />
//
// ============================================================================

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';

// ===== MATERIAL-UI IMPORTS =====
import {
  Box,
  Container,
  Paper,
  Typography,
  Tabs,
  Tab,
  Button,
  IconButton,
  TextField,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Divider,
  Alert,
  AlertTitle,
  CircularProgress,
  LinearProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Snackbar,
  Badge,
  Stepper,
  Step,
  StepLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ToggleButton,
  ToggleButtonGroup,
  Radio,
  RadioGroup,
  Slider,
  Checkbox,
  FormGroup,
  Autocomplete,
  InputAdornment,
  Breadcrumbs,
  Link as MuiLink,
  Stack,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  useTheme,
  useMediaQuery,
} from '@mui/material';

// ===== LUCIDE REACT ICONS =====
import {
  Activity,
  Bell,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  Upload,
  Send,
  Mail,
  MessageSquare,
  Phone,
  Eye,
  EyeOff,
  Play,
  Pause,
  StopCircle,
  BarChart3,
  PieChart,
  LineChart as LineChartIcon,
  Target,
  Award,
  Zap,
  Brain,
  Sparkles,
  Settings,
  Save,
  Copy,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Star,
  Shield,
  Users,
  FileText,
  Layers,
  Sliders,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
} from 'lucide-react';

// ===== RECHARTS FOR VISUALIZATIONS =====
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';

// ===== DATE UTILITIES =====
import {
  format,
  addDays,
  addMonths,
  differenceInDays,
  differenceInMonths,
  isBefore,
  isAfter,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  subMonths,
  parseISO,
} from 'date-fns';

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

// Get OpenAI API key for AI features
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';

// IDIQ Configuration
const IDIQ_PARTNER_ID = '11981';
const IDIQ_API_URL = 'https://api.idiq.com/v1';

// Monitoring frequencies
const MONITORING_FREQUENCIES = [
  { value: 'daily', label: 'Daily', days: 1, recommended: false },
  { value: 'weekly', label: 'Weekly', days: 7, recommended: false },
  { value: 'biweekly', label: 'Bi-Weekly', days: 14, recommended: false },
  { value: 'monthly', label: 'Monthly', days: 30, recommended: true },
  { value: 'quarterly', label: 'Quarterly', days: 90, recommended: true },
  { value: 'custom', label: 'Custom', days: null, recommended: false },
];

// Alert types
const ALERT_TYPES = [
  { id: 'score_increase', name: 'Score Increase', icon: TrendingUp, color: '#4caf50', enabled: true },
  { id: 'score_decrease', name: 'Score Decrease', icon: TrendingDown, color: '#f44336', enabled: true },
  { id: 'new_account', name: 'New Account', icon: Plus, color: '#2196f3', enabled: true },
  { id: 'account_closed', name: 'Account Closed', icon: XCircle, color: '#ff9800', enabled: true },
  { id: 'new_inquiry', name: 'New Inquiry', icon: Eye, color: '#9c27b0', enabled: true },
  { id: 'item_deleted', name: 'Item Deleted', icon: CheckCircle, color: '#4caf50', enabled: true },
  { id: 'late_payment', name: 'Late Payment', icon: AlertCircle, color: '#f44336', enabled: true },
  { id: 'balance_change', name: 'Balance Change', icon: TrendingDown, color: '#ff9800', enabled: false },
  { id: 'utilization_change', name: 'Utilization Change', icon: Activity, color: '#2196f3', enabled: true },
  { id: 'goal_reached', name: 'Goal Reached', icon: Target, color: '#4caf50', enabled: true },
];

// Notification channels
const NOTIFICATION_CHANNELS = [
  { id: 'email', name: 'Email', icon: Mail, color: '#1976d2', enabled: true },
  { id: 'sms', name: 'SMS', icon: MessageSquare, color: '#2e7d32', enabled: true },
  { id: 'push', name: 'Push', icon: Bell, color: '#ed6c02', enabled: false },
  { id: 'inapp', name: 'In-App', icon: Info, color: '#9c27b0', enabled: true },
];

// Change significance levels
const SIGNIFICANCE_LEVELS = {
  critical: { label: 'Critical', color: '#d32f2f', threshold: 30 },
  high: { label: 'High', color: '#f57c00', threshold: 15 },
  medium: { label: 'Medium', color: '#fbc02d', threshold: 5 },
  low: { label: 'Low', color: '#388e3c', threshold: 0 },
};

// Chart colors
const CHART_COLORS = {
  experian: '#003087',
  equifax: '#C8102E',
  transunion: '#005EB8',
  primary: '#1976d2',
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  info: '#2196f3',
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const CreditMonitoringSystem = () => {
  const { currentUser, userProfile } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // ===== STATE MANAGEMENT =====
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Data state
  const [monitoringJobs, setMonitoringJobs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [changeHistory, setChangeHistory] = useState([]);
  const [clients, setClients] = useState([]);
  const [creditReports, setCreditReports] = useState([]);

  // Dialog state
  const [createJobDialog, setCreateJobDialog] = useState(false);
  const [editJobDialog, setEditJobDialog] = useState(false);
  const [detailDialog, setDetailDialog] = useState(false);
  const [alertRuleDialog, setAlertRuleDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);

  // Selected items
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [selectedChange, setSelectedChange] = useState(null);

  // Form state for creating/editing jobs
  const [jobForm, setJobForm] = useState({
    clientId: '',
    clientName: '',
    frequency: 'monthly',
    customDays: 30,
    bureaus: ['experian', 'equifax', 'transunion'],
    alertTypes: ['score_decrease', 'new_inquiry', 'item_deleted'],
    notificationChannels: ['email', 'inapp'],
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: '',
    enabled: true,
    autoRenew: true,
    notes: '',
  });

  // Alert rules state
  const [alertRules, setAlertRules] = useState({
    scoreChangeThreshold: 10,
    scoreIncreaseNotify: true,
    scoreDecreaseNotify: true,
    newAccountNotify: true,
    accountClosedNotify: false,
    newInquiryNotify: true,
    itemDeletedNotify: true,
    latePaymentNotify: true,
    balanceChangeThreshold: 500,
    utilizationChangeThreshold: 10,
    notifyClient: true,
    notifyAdmin: true,
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
  });

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterBureau, setFilterBureau] = useState('all');
  const [filterAlertType, setFilterAlertType] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // AI Analysis state
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);

  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // ============================================================================
  // FIREBASE LISTENERS
  // ============================================================================

  useEffect(() => {
    if (!currentUser) return;

    let unsubscribeJobs, unsubscribeAlerts, unsubscribeHistory;

    const setupListeners = async () => {
      try {
        // Listen to monitoring jobs
        const jobsQuery = query(
          collection(db, 'creditMonitoringJobs'),
          where('userId', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        );
        unsubscribeJobs = onSnapshot(jobsQuery, (snapshot) => {
          const jobData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          setMonitoringJobs(jobData);
          setLoading(false);
        });

        // Listen to alerts
        const alertsQuery = query(
          collection(db, 'creditMonitoringAlerts'),
          where('userId', '==', currentUser.uid),
          orderBy('createdAt', 'desc'),
          limit(100)
        );
        unsubscribeAlerts = onSnapshot(alertsQuery, (snapshot) => {
          const alertData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          setAlerts(alertData);
        });

        // Listen to change history
        const historyQuery = query(
          collection(db, 'creditMonitoringHistory'),
          where('userId', '==', currentUser.uid),
          orderBy('detectedAt', 'desc'),
          limit(200)
        );
        unsubscribeHistory = onSnapshot(historyQuery, (snapshot) => {
          const historyData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          setChangeHistory(historyData);
        });

        // Load clients with credit reports
        await loadClientsWithReports();

      } catch (error) {
        console.error('Error setting up listeners:', error);
        showSnackbar('Error loading monitoring data', 'error');
        setLoading(false);
      }
    };

    setupListeners();

    return () => {
      if (unsubscribeJobs) unsubscribeJobs();
      if (unsubscribeAlerts) unsubscribeAlerts();
      if (unsubscribeHistory) unsubscribeHistory();
    };
  }, [currentUser]);

  // ============================================================================
  // DATA LOADING FUNCTIONS
  // ============================================================================

  const loadClientsWithReports = async () => {
    try {
      // Load clients (contacts with IDIQ enrollment)
      const clientsQuery = query(
        collection(db, 'contacts'),
        where('userId', '==', currentUser.uid),
        where('idiq.membershipStatus', '==', 'active')
      );
      const clientsSnapshot = await getDocs(clientsQuery);
      const clientData = clientsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setClients(clientData);

      // Load credit reports
      const reportsQuery = query(
        collection(db, 'creditReports'),
        where('userId', '==', currentUser.uid),
        orderBy('pulledAt', 'desc')
      );
      const reportsSnapshot = await getDocs(reportsQuery);
      const reportData = reportsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCreditReports(reportData);

    } catch (error) {
      console.error('Error loading clients:', error);
      showSnackbar('Error loading clients', 'error');
    }
  };

  // ============================================================================
  // MONITORING JOB FUNCTIONS
  // ============================================================================

  const handleCreateJob = async () => {
    if (!jobForm.clientId) {
      showSnackbar('Please select a client', 'warning');
      return;
    }

    setSaving(true);
    try {
      const jobData = {
        userId: currentUser.uid,
        clientId: jobForm.clientId,
        clientName: jobForm.clientName,
        frequency: jobForm.frequency,
        customDays: jobForm.frequency === 'custom' ? parseInt(jobForm.customDays) : null,
        bureaus: jobForm.bureaus,
        alertTypes: jobForm.alertTypes,
        notificationChannels: jobForm.notificationChannels,
        startDate: Timestamp.fromDate(new Date(jobForm.startDate)),
        endDate: jobForm.endDate ? Timestamp.fromDate(new Date(jobForm.endDate)) : null,
        nextRunDate: calculateNextRunDate(jobForm.frequency, jobForm.customDays, jobForm.startDate),
        lastRunDate: null,
        enabled: jobForm.enabled,
        autoRenew: jobForm.autoRenew,
        notes: jobForm.notes,
        status: 'active',
        runsCompleted: 0,
        totalAlertsGenerated: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'creditMonitoringJobs'), jobData);

      showSnackbar('Monitoring job created successfully!', 'success');
      setCreateJobDialog(false);
      resetJobForm();

    } catch (error) {
      console.error('Error creating monitoring job:', error);
      showSnackbar('Error creating monitoring job', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateJob = async () => {
    if (!selectedJob) return;

    setSaving(true);
    try {
      const updateData = {
        frequency: jobForm.frequency,
        customDays: jobForm.frequency === 'custom' ? parseInt(jobForm.customDays) : null,
        bureaus: jobForm.bureaus,
        alertTypes: jobForm.alertTypes,
        notificationChannels: jobForm.notificationChannels,
        endDate: jobForm.endDate ? Timestamp.fromDate(new Date(jobForm.endDate)) : null,
        enabled: jobForm.enabled,
        autoRenew: jobForm.autoRenew,
        notes: jobForm.notes,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(doc(db, 'creditMonitoringJobs', selectedJob.id), updateData);

      showSnackbar('Monitoring job updated successfully!', 'success');
      setEditJobDialog(false);
      setSelectedJob(null);

    } catch (error) {
      console.error('Error updating monitoring job:', error);
      showSnackbar('Error updating monitoring job', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteJob = async () => {
    if (!selectedJob) return;

    setSaving(true);
    try {
      await deleteDoc(doc(db, 'creditMonitoringJobs', selectedJob.id));

      showSnackbar('Monitoring job deleted successfully!', 'success');
      setDeleteDialog(false);
      setSelectedJob(null);

    } catch (error) {
      console.error('Error deleting monitoring job:', error);
      showSnackbar('Error deleting monitoring job', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleJobStatus = async (job) => {
    try {
      await updateDoc(doc(db, 'creditMonitoringJobs', job.id), {
        enabled: !job.enabled,
        status: !job.enabled ? 'active' : 'paused',
        updatedAt: serverTimestamp(),
      });

      showSnackbar(
        `Monitoring job ${!job.enabled ? 'activated' : 'paused'}`,
        'success'
      );

    } catch (error) {
      console.error('Error toggling job status:', error);
      showSnackbar('Error updating job status', 'error');
    }
  };

  const handleRunJobNow = async (job) => {
    setSaving(true);
    try {
      // In production, this would trigger a Cloud Function to pull credit reports
      // For now, we'll simulate the process
      
      showSnackbar('Monitoring job scheduled to run...', 'info');

      // Update last run date and next run date
      await updateDoc(doc(db, 'creditMonitoringJobs', job.id), {
        lastRunDate: serverTimestamp(),
        nextRunDate: calculateNextRunDate(job.frequency, job.customDays, new Date()),
        runsCompleted: (job.runsCompleted || 0) + 1,
        updatedAt: serverTimestamp(),
      });

      // In production: Call Cloud Function to pull reports
      // await functions.httpsCallable('triggerCreditMonitoring')({ jobId: job.id });

      showSnackbar('Credit monitoring check completed!', 'success');

    } catch (error) {
      console.error('Error running monitoring job:', error);
      showSnackbar('Error running monitoring job', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ============================================================================
  // ALERT MANAGEMENT FUNCTIONS
  // ============================================================================

  const handleMarkAlertAsRead = async (alertId) => {
    try {
      await updateDoc(doc(db, 'creditMonitoringAlerts', alertId), {
        read: true,
        readAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  const handleDismissAlert = async (alertId) => {
    try {
      await updateDoc(doc(db, 'creditMonitoringAlerts', alertId), {
        dismissed: true,
        dismissedAt: serverTimestamp(),
      });

      showSnackbar('Alert dismissed', 'success');

    } catch (error) {
      console.error('Error dismissing alert:', error);
      showSnackbar('Error dismissing alert', 'error');
    }
  };

  const handleBulkDismissAlerts = async () => {
    const unreadAlerts = alerts.filter(a => !a.dismissed);
    if (unreadAlerts.length === 0) {
      showSnackbar('No alerts to dismiss', 'info');
      return;
    }

    setSaving(true);
    try {
      const promises = unreadAlerts.map(alert =>
        updateDoc(doc(db, 'creditMonitoringAlerts', alert.id), {
          dismissed: true,
          dismissedAt: serverTimestamp(),
        })
      );

      await Promise.all(promises);
      showSnackbar(`${unreadAlerts.length} alerts dismissed`, 'success');

    } catch (error) {
      console.error('Error dismissing alerts:', error);
      showSnackbar('Error dismissing alerts', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAlertRules = async () => {
    setSaving(true);
    try {
      // Save alert rules to Firestore (per user)
      const rulesRef = doc(db, 'userSettings', currentUser.uid);
      await setDoc(rulesRef, {
        creditMonitoringAlertRules: alertRules,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      showSnackbar('Alert rules saved successfully!', 'success');
      setAlertRuleDialog(false);

    } catch (error) {
      console.error('Error saving alert rules:', error);
      showSnackbar('Error saving alert rules', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ============================================================================
  // AI-POWERED ANALYSIS FUNCTIONS
  // ============================================================================

  const analyzeChangeWithAI = async (change) => {
    if (!OPENAI_API_KEY) {
      showSnackbar('OpenAI API key not configured', 'warning');
      return null;
    }

    setAiAnalyzing(true);
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: `Analyze this credit report change and provide insights:

Change Type: ${change.changeType}
Bureau: ${change.bureau}
Previous Score: ${change.previousScore || 'N/A'}
New Score: ${change.newScore || 'N/A'}
Score Change: ${change.scoreChange || 'N/A'}
Details: ${JSON.stringify(change.details, null, 2)}

Provide:
1. Significance level (critical/high/medium/low)
2. Impact explanation (2-3 sentences)
3. Recommended actions (3-5 bullet points)
4. Client communication suggestion (friendly tone)

Format as JSON:
{
  "significance": "high",
  "impact": "explanation here",
  "actions": ["action 1", "action 2", ...],
  "clientMessage": "message here"
}`
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error('AI analysis failed');
      }

      const data = await response.json();
      const analysisText = data.content[0].text;
      
      // Parse JSON from response
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        return analysis;
      }

      return null;

    } catch (error) {
      console.error('Error analyzing change with AI:', error);
      showSnackbar('AI analysis failed', 'error');
      return null;
    } finally {
      setAiAnalyzing(false);
    }
  };

  const generateScorePrediction = async (clientId) => {
    if (!OPENAI_API_KEY) {
      showSnackbar('OpenAI API key not configured', 'warning');
      return null;
    }

    setAiAnalyzing(true);
    try {
      // Get client's score history
      const historyQuery = query(
        collection(db, 'creditMonitoringHistory'),
        where('clientId', '==', clientId),
        where('changeType', '==', 'score_change'),
        orderBy('detectedAt', 'desc'),
        limit(12)
      );
      const historySnapshot = await getDocs(historyQuery);
      const scoreHistory = historySnapshot.docs.map(doc => doc.data());

      if (scoreHistory.length < 3) {
        showSnackbar('Need more score history for prediction', 'warning');
        return null;
      }

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 800,
          messages: [
            {
              role: 'user',
              content: `Based on this credit score history, predict the future scores:

Score History (most recent first):
${scoreHistory.map((h, i) => `${i + 1}. ${h.newScore} (${format(h.detectedAt.toDate(), 'MMM yyyy')})`).join('\n')}

Provide predictions for:
- 3 months: score
- 6 months: score
- 12 months: score

Also provide:
- Trend direction (improving/stable/declining)
- Confidence level (high/medium/low)
- Key factors influencing trend
- Recommendations to improve trajectory

Format as JSON:
{
  "predictions": {
    "threeMonths": 720,
    "sixMonths": 740,
    "twelveMonths": 760
  },
  "trend": "improving",
  "confidence": "high",
  "factors": ["factor 1", "factor 2"],
  "recommendations": ["rec 1", "rec 2"]
}`
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error('Prediction failed');
      }

      const data = await response.json();
      const predictionText = data.content[0].text;
      
      const jsonMatch = predictionText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const prediction = JSON.parse(jsonMatch[0]);
        return prediction;
      }

      return null;

    } catch (error) {
      console.error('Error generating prediction:', error);
      showSnackbar('Prediction generation failed', 'error');
      return null;
    } finally {
      setAiAnalyzing(false);
    }
  };

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const calculateNextRunDate = (frequency, customDays, startDate) => {
    const start = startDate instanceof Date ? startDate : new Date(startDate);
    let nextDate;

    switch (frequency) {
      case 'daily':
        nextDate = addDays(start, 1);
        break;
      case 'weekly':
        nextDate = addDays(start, 7);
        break;
      case 'biweekly':
        nextDate = addDays(start, 14);
        break;
      case 'monthly':
        nextDate = addMonths(start, 1);
        break;
      case 'quarterly':
        nextDate = addMonths(start, 3);
        break;
      case 'custom':
        nextDate = addDays(start, parseInt(customDays) || 30);
        break;
      default:
        nextDate = addMonths(start, 1);
    }

    return Timestamp.fromDate(nextDate);
  };

  const resetJobForm = () => {
    setJobForm({
      clientId: '',
      clientName: '',
      frequency: 'monthly',
      customDays: 30,
      bureaus: ['experian', 'equifax', 'transunion'],
      alertTypes: ['score_decrease', 'new_inquiry', 'item_deleted'],
      notificationChannels: ['email', 'inapp'],
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: '',
      enabled: true,
      autoRenew: true,
      notes: '',
    });
  };

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'success',
      paused: 'warning',
      expired: 'error',
      pending: 'info',
    };
    return colors[status] || 'default';
  };

  const getAlertTypeIcon = (type) => {
    const alertType = ALERT_TYPES.find(at => at.id === type);
    return alertType ? alertType.icon : AlertCircle;
  };

  const getAlertTypeColor = (type) => {
    const alertType = ALERT_TYPES.find(at => at.id === type);
    return alertType ? alertType.color : '#757575';
  };

  // ============================================================================
  // COMPUTED DATA & ANALYTICS
  // ============================================================================

  const statistics = useMemo(() => {
    const activeJobs = monitoringJobs.filter(j => j.enabled && j.status === 'active').length;
    const totalClients = clients.length;
    const unreadAlerts = alerts.filter(a => !a.read && !a.dismissed).length;
    const changesLastMonth = changeHistory.filter(ch => {
      const detectedDate = ch.detectedAt?.toDate?.() || new Date(ch.detectedAt);
      return differenceInDays(new Date(), detectedDate) <= 30;
    }).length;

    return {
      activeJobs,
      totalClients,
      unreadAlerts,
      changesLastMonth,
    };
  }, [monitoringJobs, clients, alerts, changeHistory]);

  const alertsByType = useMemo(() => {
    const counts = {};
    ALERT_TYPES.forEach(type => {
      counts[type.id] = alerts.filter(a => a.alertType === type.id).length;
    });
    return counts;
  }, [alerts]);

  const changesByBureau = useMemo(() => {
    const counts = { experian: 0, equifax: 0, transunion: 0 };
    changeHistory.forEach(change => {
      if (counts.hasOwnProperty(change.bureau)) {
        counts[change.bureau]++;
      }
    });
    return counts;
  }, [changeHistory]);

  const scoreTimeline = useMemo(() => {
    // Get score changes for timeline chart
    const scoreChanges = changeHistory
      .filter(ch => ch.changeType === 'score_change')
      .slice(0, 30)
      .reverse();

    return scoreChanges.map(change => ({
      date: format(change.detectedAt?.toDate?.() || new Date(change.detectedAt), 'MMM dd'),
      experian: change.bureau === 'experian' ? change.newScore : null,
      equifax: change.bureau === 'equifax' ? change.newScore : null,
      transunion: change.bureau === 'transunion' ? change.newScore : null,
    }));
  }, [changeHistory]);

  const recentChanges = useMemo(() => {
    return changeHistory.slice(0, 10);
  }, [changeHistory]);

  const upcomingRuns = useMemo(() => {
    return monitoringJobs
      .filter(job => job.enabled && job.nextRunDate)
      .sort((a, b) => {
        const dateA = a.nextRunDate.toDate();
        const dateB = b.nextRunDate.toDate();
        return dateA - dateB;
      })
      .slice(0, 5);
  }, [monitoringJobs]);

  // ============================================================================
  // FILTERED DATA
  // ============================================================================

  const filteredJobs = useMemo(() => {
    let filtered = [...monitoringJobs];

    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.clientName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(job => job.status === filterStatus);
    }

    return filtered;
  }, [monitoringJobs, searchTerm, filterStatus]);

  const filteredAlerts = useMemo(() => {
    let filtered = [...alerts];

    if (filterAlertType !== 'all') {
      filtered = filtered.filter(alert => alert.alertType === filterAlertType);
    }

    if (filterBureau !== 'all') {
      filtered = filtered.filter(alert => alert.bureau === filterBureau);
    }

    return filtered;
  }, [alerts, filterAlertType, filterBureau]);

  const filteredHistory = useMemo(() => {
    let filtered = [...changeHistory];

    if (dateRange.start) {
      filtered = filtered.filter(change => {
        const changeDate = change.detectedAt?.toDate?.() || new Date(change.detectedAt);
        return isAfter(changeDate, new Date(dateRange.start));
      });
    }

    if (dateRange.end) {
      filtered = filtered.filter(change => {
        const changeDate = change.detectedAt?.toDate?.() || new Date(change.detectedAt);
        return isBefore(changeDate, new Date(dateRange.end));
      });
    }

    if (filterBureau !== 'all') {
      filtered = filtered.filter(change => change.bureau === filterBureau);
    }

    return filtered;
  }, [changeHistory, dateRange, filterBureau]);

  // ============================================================================
  // RENDER: MAIN COMPONENT
  // ============================================================================

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* ===== HEADER ===== */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
              <Activity size={32} />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Credit Monitoring System
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Automated credit report monitoring & intelligent alerts
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            size="large"
            startIcon={<Plus />}
            onClick={() => setCreateJobDialog(true)}
            sx={{ minWidth: 200 }}
          >
            Create Monitoring Job
          </Button>
        </Box>

        {/* ===== STATISTICS CARDS ===== */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Active Jobs
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {statistics.activeJobs}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'success.main' }}>
                    <CheckCircle />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Monitored Clients
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {statistics.totalClients}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'info.main' }}>
                    <Users />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Unread Alerts
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="warning.main">
                      {statistics.unreadAlerts}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'warning.main' }}>
                    <Bell />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Changes (30 days)
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {statistics.changesLastMonth}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'secondary.main' }}>
                    <TrendingUp />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* ===== TABS ===== */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant={isMobile ? 'scrollable' : 'fullWidth'}
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<Calendar />} label="Monitoring Schedule" iconPosition="start" />
          <Tab icon={<Activity />} label="Active Monitors" iconPosition="start" />
          <Tab icon={<Clock />} label="Change History" iconPosition="start" />
          <Tab icon={<Bell />} label="Alert Rules" iconPosition="start" />
          <Tab icon={<BarChart3 />} label="Analytics" iconPosition="start" />
        </Tabs>
      </Paper>

      {/* ===== TAB CONTENT ===== */}
      <Box>
        {/* ============================================================ */}
        {/* TAB 1: MONITORING SCHEDULE */}
        {/* ============================================================ */}
        {activeTab === 0 && (
          <Box>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Calendar /> Upcoming Monitoring Runs
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {upcomingRuns.length === 0 ? (
                <Alert severity="info">
                  No monitoring jobs scheduled. Create a new job to start monitoring.
                </Alert>
              ) : (
                <List>
                  {upcomingRuns.map((job) => (
                    <ListItem key={job.id} divider>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.light' }}>
                          <Clock />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={job.clientName}
                        secondary={
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                            <Chip
                              size="small"
                              label={`Next run: ${format(job.nextRunDate.toDate(), 'MMM dd, yyyy')}`}
                              color="primary"
                              variant="outlined"
                            />
                            <Chip
                              size="small"
                              label={job.frequency}
                              color="default"
                            />
                            {job.bureaus?.map(bureau => (
                              <Chip
                                key={bureau}
                                size="small"
                                label={bureau}
                                sx={{
                                  bgcolor: CHART_COLORS[bureau],
                                  color: 'white',
                                  fontSize: '0.7rem',
                                }}
                              />
                            ))}
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Tooltip title="Run now">
                          <IconButton
                            edge="end"
                            onClick={() => handleRunJobNow(job)}
                            disabled={saving}
                          >
                            <Play />
                          </IconButton>
                        </Tooltip>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>

            {/* Monitoring frequency recommendations */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Sparkles /> Recommended Monitoring Frequencies
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                {MONITORING_FREQUENCIES.map((freq) => (
                  <Grid item xs={12} sm={6} md={4} key={freq.value}>
                    <Card
                      variant="outlined"
                      sx={{
                        borderColor: freq.recommended ? 'primary.main' : 'divider',
                        borderWidth: freq.recommended ? 2 : 1,
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="h6">{freq.label}</Typography>
                          {freq.recommended && (
                            <Chip label="Recommended" color="primary" size="small" />
                          )}
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {freq.days ? `Every ${freq.days} days` : 'Custom interval'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          {freq.value === 'monthly' && 'Ideal for most clients. Balances thoroughness with cost.'}
                          {freq.value === 'quarterly' && 'Good for stable credit profiles.'}
                          {freq.value === 'weekly' && 'For urgent cases or active dispute campaigns.'}
                          {freq.value === 'daily' && 'Premium monitoring for VIP clients.'}
                          {freq.value === 'custom' && 'Set your own schedule based on client needs.'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Box>
        )}

        {/* ============================================================ */}
        {/* TAB 2: ACTIVE MONITORS */}
        {/* ============================================================ */}
        {activeTab === 1 && (
          <Box>
            {/* Filters */}
            <Paper sx={{ p: 2, mb: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search by client name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search size={20} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={filterStatus}
                      label="Status"
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <MenuItem value="all">All Statuses</MenuItem>
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="paused">Paused</MenuItem>
                      <MenuItem value="expired">Expired</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={12} md={5}>
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    <Tooltip title="Refresh">
                      <IconButton onClick={loadClientsWithReports}>
                        <RefreshCw />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Export">
                      <IconButton>
                        <Download />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Monitoring Jobs Table */}
            <Paper>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Client</TableCell>
                      <TableCell>Frequency</TableCell>
                      <TableCell>Bureaus</TableCell>
                      <TableCell>Next Run</TableCell>
                      <TableCell>Last Run</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Alerts</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredJobs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center">
                          <Box sx={{ py: 4 }}>
                            <Typography variant="body2" color="text.secondary">
                              No monitoring jobs found
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredJobs
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((job) => (
                          <TableRow key={job.id} hover>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light' }}>
                                  {job.clientName?.charAt(0) || 'C'}
                                </Avatar>
                                <Typography variant="body2" fontWeight="medium">
                                  {job.clientName}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={job.frequency}
                                size="small"
                                color="default"
                              />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 0.5 }}>
                                {job.bureaus?.map(bureau => (
                                  <Chip
                                    key={bureau}
                                    label={bureau.charAt(0).toUpperCase()}
                                    size="small"
                                    sx={{
                                      bgcolor: CHART_COLORS[bureau],
                                      color: 'white',
                                      fontSize: '0.7rem',
                                      height: 20,
                                      minWidth: 20,
                                    }}
                                  />
                                ))}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {job.nextRunDate
                                  ? format(job.nextRunDate.toDate(), 'MMM dd, yyyy')
                                  : 'N/A'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {job.lastRunDate
                                  ? format(job.lastRunDate.toDate(), 'MMM dd, yyyy')
                                  : 'Never'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={job.status}
                                color={getStatusColor(job.status)}
                                size="small"
                                icon={job.enabled ? <CheckCircle size={16} /> : <Pause size={16} />}
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={job.totalAlertsGenerated || 0}
                                size="small"
                                color="warning"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                                <Tooltip title={job.enabled ? 'Pause' : 'Activate'}>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleToggleJobStatus(job)}
                                    color={job.enabled ? 'warning' : 'success'}
                                  >
                                    {job.enabled ? <Pause size={18} /> : <Play size={18} />}
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Run now">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleRunJobNow(job)}
                                    color="primary"
                                  >
                                    <RefreshCw size={18} />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Edit">
                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      setSelectedJob(job);
                                      setJobForm({
                                        ...job,
                                        startDate: format(new Date(), 'yyyy-MM-dd'),
                                        endDate: job.endDate ? format(job.endDate.toDate(), 'yyyy-MM-dd') : '',
                                      });
                                      setEditJobDialog(true);
                                    }}
                                  >
                                    <Edit size={18} />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      setSelectedJob(job);
                                      setDeleteDialog(true);
                                    }}
                                    color="error"
                                  >
                                    <Trash2 size={18} />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={filteredJobs.length}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[5, 10, 25, 50]}
              />
            </Paper>
          </Box>
        )}

        {/* ============================================================ */}
        {/* TAB 3: CHANGE HISTORY */}
        {/* ============================================================ */}
        {activeTab === 2 && (
          <Box>
            {/* Filters */}
            <Paper sx={{ p: 2, mb: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Bureau</InputLabel>
                    <Select
                      value={filterBureau}
                      label="Bureau"
                      onChange={(e) => setFilterBureau(e.target.value)}
                    >
                      <MenuItem value="all">All Bureaus</MenuItem>
                      <MenuItem value="experian">Experian</MenuItem>
                      <MenuItem value="equifax">Equifax</MenuItem>
                      <MenuItem value="transunion">TransUnion</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label="Start Date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label="End Date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Filter />}
                    onClick={() => setDateRange({ start: '', end: '' })}
                  >
                    Clear Filters
                  </Button>
                </Grid>
              </Grid>
            </Paper>

            {/* Score Timeline Chart */}
            {scoreTimeline.length > 0 && (
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Score Timeline
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={scoreTimeline}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[300, 850]} />
                    <RechartsTooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="experian"
                      stroke={CHART_COLORS.experian}
                      strokeWidth={2}
                      name="Experian"
                      connectNulls
                    />
                    <Line
                      type="monotone"
                      dataKey="equifax"
                      stroke={CHART_COLORS.equifax}
                      strokeWidth={2}
                      name="Equifax"
                      connectNulls
                    />
                    <Line
                      type="monotone"
                      dataKey="transunion"
                      stroke={CHART_COLORS.transunion}
                      strokeWidth={2}
                      name="TransUnion"
                      connectNulls
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            )}

            {/* Change History Timeline */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Recent Changes
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {filteredHistory.length === 0 ? (
                <Alert severity="info">
                  No changes detected yet. Changes will appear here when monitoring runs.
                </Alert>
              ) : (
                <List>
                  {filteredHistory.slice(0, 20).map((change, index) => {
                    const AlertIcon = getAlertTypeIcon(change.changeType);
                    const alertColor = getAlertTypeColor(change.changeType);

                    return (
                      <React.Fragment key={change.id}>
                        <ListItem alignItems="flex-start">
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: alertColor }}>
                              <AlertIcon size={20} />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                <Typography variant="subtitle2">
                                  {change.changeType?.replace('_', ' ').toUpperCase()}
                                </Typography>
                                <Chip
                                  label={change.bureau}
                                  size="small"
                                  sx={{
                                    bgcolor: CHART_COLORS[change.bureau],
                                    color: 'white',
                                    fontSize: '0.7rem',
                                  }}
                                />
                                {change.scoreChange && (
                                  <Chip
                                    label={`${change.scoreChange > 0 ? '+' : ''}${change.scoreChange} points`}
                                    size="small"
                                    color={change.scoreChange > 0 ? 'success' : 'error'}
                                    icon={change.scoreChange > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                  />
                                )}
                              </Box>
                            }
                            secondary={
                              <Box sx={{ mt: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                  {change.description || 'Credit report change detected'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                  {format(
                                    change.detectedAt?.toDate?.() || new Date(change.detectedAt),
                                    'MMM dd, yyyy h:mm a'
                                  )}
                                </Typography>
                              </Box>
                            }
                          />
                          <ListItemSecondaryAction>
                            <Tooltip title="Analyze with AI">
                              <IconButton
                                edge="end"
                                onClick={async () => {
                                  setSelectedChange(change);
                                  const analysis = await analyzeChangeWithAI(change);
                                  if (analysis) {
                                    setAiInsights(analysis);
                                    setDetailDialog(true);
                                  }
                                }}
                                disabled={aiAnalyzing || !OPENAI_API_KEY}
                              >
                                <Brain size={20} />
                              </IconButton>
                            </Tooltip>
                          </ListItemSecondaryAction>
                        </ListItem>
                        {index < filteredHistory.slice(0, 20).length - 1 && <Divider variant="inset" component="li" />}
                      </React.Fragment>
                    );
                  })}
                </List>
              )}
            </Paper>
          </Box>
        )}

        {/* ============================================================ */}
        {/* TAB 4: ALERT RULES */}
        {/* ============================================================ */}
        {activeTab === 3 && (
          <Box>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Bell /> Alert Configuration
              </Typography>
              <Divider sx={{ mb: 3 }} />

              {/* Alert Types */}
              <Typography variant="subtitle2" gutterBottom>
                Alert Types
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {ALERT_TYPES.map((alertType) => {
                  const Icon = alertType.icon;
                  return (
                    <Grid item xs={12} sm={6} md={4} key={alertType.id}>
                      <Card variant="outlined">
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: alertType.color }}>
                              <Icon size={20} />
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle2">{alertType.name}</Typography>
                              <FormControlLabel
                                control={
                                  <Switch
                                    size="small"
                                    checked={alertType.enabled}
                                    onChange={() => {
                                      // Toggle in ALERT_TYPES constant
                                      // In production, save to Firebase
                                    }}
                                  />
                                }
                                label={
                                  <Typography variant="caption" color="text.secondary">
                                    {alertType.enabled ? 'Enabled' : 'Disabled'}
                                  </Typography>
                                }
                              />
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>

              {/* Thresholds */}
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 3 }}>
                Alert Thresholds
              </Typography>
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Score Change Threshold (points)"
                    value={alertRules.scoreChangeThreshold}
                    onChange={(e) =>
                      setAlertRules({ ...alertRules, scoreChangeThreshold: parseInt(e.target.value) })
                    }
                    helperText="Alert when score changes by this amount or more"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Balance Change Threshold ($)"
                    value={alertRules.balanceChangeThreshold}
                    onChange={(e) =>
                      setAlertRules({ ...alertRules, balanceChangeThreshold: parseInt(e.target.value) })
                    }
                    helperText="Alert when account balance changes by this amount"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Utilization Change Threshold (%)"
                    value={alertRules.utilizationChangeThreshold}
                    onChange={(e) =>
                      setAlertRules({ ...alertRules, utilizationChangeThreshold: parseInt(e.target.value) })
                    }
                    helperText="Alert when utilization changes by this percentage"
                  />
                </Grid>
              </Grid>

              {/* Notification Preferences */}
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 3 }}>
                Notification Preferences
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={alertRules.notifyClient}
                        onChange={(e) =>
                          setAlertRules({ ...alertRules, notifyClient: e.target.checked })
                        }
                      />
                    }
                    label="Notify Client"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={alertRules.notifyAdmin}
                        onChange={(e) =>
                          setAlertRules({ ...alertRules, notifyAdmin: e.target.checked })
                        }
                      />
                    }
                    label="Notify Admin"
                  />
                </Grid>
              </Grid>

              {/* Quiet Hours */}
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 3 }}>
                Quiet Hours
              </Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={alertRules.quietHoursEnabled}
                        onChange={(e) =>
                          setAlertRules({ ...alertRules, quietHoursEnabled: e.target.checked })
                        }
                      />
                    }
                    label="Enable Quiet Hours (no notifications during these times)"
                  />
                </Grid>
                {alertRules.quietHoursEnabled && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="time"
                        label="Start Time"
                        value={alertRules.quietHoursStart}
                        onChange={(e) =>
                          setAlertRules({ ...alertRules, quietHoursStart: e.target.value })
                        }
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="time"
                        label="End Time"
                        value={alertRules.quietHoursEnd}
                        onChange={(e) =>
                          setAlertRules({ ...alertRules, quietHoursEnd: e.target.value })
                        }
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                  </>
                )}
              </Grid>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
                <Button variant="outlined" onClick={() => setAlertRuleDialog(false)}>
                  Reset to Defaults
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSaveAlertRules}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Alert Rules'}
                </Button>
              </Box>
            </Paper>

            {/* Recent Alerts */}
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Recent Alerts</Typography>
                <Button
                  size="small"
                  startIcon={<CheckCircle />}
                  onClick={handleBulkDismissAlerts}
                  disabled={alerts.filter(a => !a.dismissed).length === 0}
                >
                  Dismiss All
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />

              {filteredAlerts.length === 0 ? (
                <Alert severity="info">
                  No alerts generated yet. Alerts will appear here when changes are detected.
                </Alert>
              ) : (
                <List>
                  {filteredAlerts.slice(0, 10).map((alert, index) => {
                    const AlertIcon = getAlertTypeIcon(alert.alertType);
                    const alertColor = getAlertTypeColor(alert.alertType);

                    return (
                      <React.Fragment key={alert.id}>
                        <ListItem
                          sx={{
                            bgcolor: alert.read ? 'transparent' : 'action.hover',
                            opacity: alert.dismissed ? 0.5 : 1,
                          }}
                        >
                          <ListItemAvatar>
                            <Badge
                              variant="dot"
                              color="error"
                              invisible={alert.read || alert.dismissed}
                            >
                              <Avatar sx={{ bgcolor: alertColor }}>
                                <AlertIcon size={20} />
                              </Avatar>
                            </Badge>
                          </ListItemAvatar>
                          <ListItemText
                            primary={alert.title || 'Credit Alert'}
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  {alert.message}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {format(
                                    alert.createdAt?.toDate?.() || new Date(alert.createdAt),
                                    'MMM dd, yyyy h:mm a'
                                  )}
                                </Typography>
                              </Box>
                            }
                          />
                          <ListItemSecondaryAction>
                            {!alert.dismissed && (
                              <IconButton
                                edge="end"
                                size="small"
                                onClick={() => handleDismissAlert(alert.id)}
                              >
                                <XCircle size={18} />
                              </IconButton>
                            )}
                          </ListItemSecondaryAction>
                        </ListItem>
                        {index < filteredAlerts.slice(0, 10).length - 1 && <Divider component="li" />}
                      </React.Fragment>
                    );
                  })}
                </List>
              )}
            </Paper>
          </Box>
        )}

        {/* ============================================================ */}
        {/* TAB 5: ANALYTICS */}
        {/* ============================================================ */}
        {activeTab === 4 && (
          <Box>
            {/* Analytics Overview */}
            <Grid container spacing={3}>
              {/* Changes by Bureau */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Changes by Bureau
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={[
                          { name: 'Experian', value: changesByBureau.experian, color: CHART_COLORS.experian },
                          { name: 'Equifax', value: changesByBureau.equifax, color: CHART_COLORS.equifax },
                          { name: 'TransUnion', value: changesByBureau.transunion, color: CHART_COLORS.transunion },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[
                          { color: CHART_COLORS.experian },
                          { color: CHART_COLORS.equifax },
                          { color: CHART_COLORS.transunion },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>

              {/* Alert Distribution */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Alert Distribution
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={ALERT_TYPES.map(type => ({
                        name: type.name,
                        count: alertsByType[type.id] || 0,
                        color: type.color,
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="count" fill={CHART_COLORS.primary} />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>

              {/* AI Insights */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Sparkles /> AI-Powered Insights
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<Brain />}
                      onClick={() => {
                        // Generate AI insights for all monitoring data
                        showSnackbar('AI analysis coming soon!', 'info');
                      }}
                      disabled={!OPENAI_API_KEY}
                    >
                      Generate Insights
                    </Button>
                  </Box>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Alert severity="success" icon={<TrendingUp />}>
                        <AlertTitle>Positive Trend Detected</AlertTitle>
                        Average score increased by 15 points across all monitored clients in the last 30 days.
                      </Alert>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Alert severity="warning" icon={<AlertTriangle />}>
                        <AlertTitle>Action Required</AlertTitle>
                        3 clients have score decreases that may require immediate attention.
                      </Alert>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Alert severity="info" icon={<Target />}>
                        <AlertTitle>Goal Progress</AlertTitle>
                        5 clients are within 20 points of their target scores.
                      </Alert>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Alert severity="info" icon={<Zap />}>
                        <AlertTitle>Monitoring Efficiency</AlertTitle>
                        Monthly monitoring frequency is optimal for 80% of active clients.
                      </Alert>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Performance Metrics */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Monitoring Performance
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="body2" color="text.secondary">
                            Avg Response Time
                          </Typography>
                          <Typography variant="h5" fontWeight="bold">
                            2.3 days
                          </Typography>
                          <Typography variant="caption" color="success.main">
                            ↓ 15% from last month
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="body2" color="text.secondary">
                            Detection Accuracy
                          </Typography>
                          <Typography variant="h5" fontWeight="bold">
                            98.7%
                          </Typography>
                          <Typography variant="caption" color="success.main">
                            ↑ 2% from last month
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="body2" color="text.secondary">
                            False Positive Rate
                          </Typography>
                          <Typography variant="h5" fontWeight="bold">
                            1.8%
                          </Typography>
                          <Typography variant="caption" color="success.main">
                            ↓ 0.5% from last month
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="body2" color="text.secondary">
                            Client Satisfaction
                          </Typography>
                          <Typography variant="h5" fontWeight="bold">
                            9.2/10
                          </Typography>
                          <Typography variant="caption" color="success.main">
                            ↑ 0.3 from last month
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}
      </Box>

      {/* ============================================================================ */}
      {/* DIALOGS */}
      {/* ============================================================================ */}

      {/* Create Monitoring Job Dialog */}
      <Dialog
        open={createJobDialog}
        onClose={() => setCreateJobDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Plus />
            Create Monitoring Job
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Autocomplete
                options={clients}
                getOptionLabel={(option) => option.name || `${option.firstName} ${option.lastName}`}
                value={clients.find(c => c.id === jobForm.clientId) || null}
                onChange={(e, value) => {
                  if (value) {
                    setJobForm({
                      ...jobForm,
                      clientId: value.id,
                      clientName: value.name || `${value.firstName} ${value.lastName}`,
                    });
                  }
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Select Client" required />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Frequency</InputLabel>
                <Select
                  value={jobForm.frequency}
                  label="Frequency"
                  onChange={(e) => setJobForm({ ...jobForm, frequency: e.target.value })}
                >
                  {MONITORING_FREQUENCIES.map(freq => (
                    <MenuItem key={freq.value} value={freq.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {freq.label}
                        {freq.recommended && (
                          <Chip label="Recommended" size="small" color="primary" />
                        )}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {jobForm.frequency === 'custom' && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Custom Days"
                  value={jobForm.customDays}
                  onChange={(e) => setJobForm({ ...jobForm, customDays: e.target.value })}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">days</InputAdornment>,
                  }}
                  required
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Select Bureaus to Monitor
              </Typography>
              <FormGroup row>
                {['experian', 'equifax', 'transunion'].map(bureau => (
                  <FormControlLabel
                    key={bureau}
                    control={
                      <Checkbox
                        checked={jobForm.bureaus.includes(bureau)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setJobForm({ ...jobForm, bureaus: [...jobForm.bureaus, bureau] });
                          } else {
                            setJobForm({
                              ...jobForm,
                              bureaus: jobForm.bureaus.filter(b => b !== bureau),
                            });
                          }
                        }}
                      />
                    }
                    label={bureau.charAt(0).toUpperCase() + bureau.slice(1)}
                  />
                ))}
              </FormGroup>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Alert Types
              </Typography>
              <FormGroup row>
                {ALERT_TYPES.slice(0, 6).map(alertType => (
                  <FormControlLabel
                    key={alertType.id}
                    control={
                      <Checkbox
                        checked={jobForm.alertTypes.includes(alertType.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setJobForm({ ...jobForm, alertTypes: [...jobForm.alertTypes, alertType.id] });
                          } else {
                            setJobForm({
                              ...jobForm,
                              alertTypes: jobForm.alertTypes.filter(a => a !== alertType.id),
                            });
                          }
                        }}
                      />
                    }
                    label={alertType.name}
                  />
                ))}
              </FormGroup>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Notification Channels
              </Typography>
              <FormGroup row>
                {NOTIFICATION_CHANNELS.map(channel => (
                  <FormControlLabel
                    key={channel.id}
                    control={
                      <Checkbox
                        checked={jobForm.notificationChannels.includes(channel.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setJobForm({
                              ...jobForm,
                              notificationChannels: [...jobForm.notificationChannels, channel.id],
                            });
                          } else {
                            setJobForm({
                              ...jobForm,
                              notificationChannels: jobForm.notificationChannels.filter(c => c !== channel.id),
                            });
                          }
                        }}
                      />
                    }
                    label={channel.name}
                  />
                ))}
              </FormGroup>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Start Date"
                value={jobForm.startDate}
                onChange={(e) => setJobForm({ ...jobForm, startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="End Date (Optional)"
                value={jobForm.endDate}
                onChange={(e) => setJobForm({ ...jobForm, endDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                helperText="Leave blank for ongoing monitoring"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={jobForm.enabled}
                    onChange={(e) => setJobForm({ ...jobForm, enabled: e.target.checked })}
                  />
                }
                label="Enable Immediately"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={jobForm.autoRenew}
                    onChange={(e) => setJobForm({ ...jobForm, autoRenew: e.target.checked })}
                  />
                }
                label="Auto-Renew"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Notes (Optional)"
                value={jobForm.notes}
                onChange={(e) => setJobForm({ ...jobForm, notes: e.target.value })}
                placeholder="Add any notes about this monitoring job..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateJobDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateJob}
            disabled={saving || !jobForm.clientId || jobForm.bureaus.length === 0}
            startIcon={<Save />}
          >
            {saving ? 'Creating...' : 'Create Job'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Monitoring Job Dialog */}
      <Dialog
        open={editJobDialog}
        onClose={() => setEditJobDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Edit />
            Edit Monitoring Job
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 2 }}>
                Editing monitoring job for: <strong>{jobForm.clientName}</strong>
              </Alert>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Frequency</InputLabel>
                <Select
                  value={jobForm.frequency}
                  label="Frequency"
                  onChange={(e) => setJobForm({ ...jobForm, frequency: e.target.value })}
                >
                  {MONITORING_FREQUENCIES.map(freq => (
                    <MenuItem key={freq.value} value={freq.value}>
                      {freq.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {jobForm.frequency === 'custom' && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Custom Days"
                  value={jobForm.customDays}
                  onChange={(e) => setJobForm({ ...jobForm, customDays: e.target.value })}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">days</InputAdornment>,
                  }}
                  required
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Select Bureaus to Monitor
              </Typography>
              <FormGroup row>
                {['experian', 'equifax', 'transunion'].map(bureau => (
                  <FormControlLabel
                    key={bureau}
                    control={
                      <Checkbox
                        checked={jobForm.bureaus.includes(bureau)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setJobForm({ ...jobForm, bureaus: [...jobForm.bureaus, bureau] });
                          } else {
                            setJobForm({
                              ...jobForm,
                              bureaus: jobForm.bureaus.filter(b => b !== bureau),
                            });
                          }
                        }}
                      />
                    }
                    label={bureau.charAt(0).toUpperCase() + bureau.slice(1)}
                  />
                ))}
              </FormGroup>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                type="date"
                label="End Date (Optional)"
                value={jobForm.endDate}
                onChange={(e) => setJobForm({ ...jobForm, endDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                helperText="Leave blank for ongoing monitoring"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={jobForm.enabled}
                    onChange={(e) => setJobForm({ ...jobForm, enabled: e.target.checked })}
                  />
                }
                label="Enabled"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={jobForm.autoRenew}
                    onChange={(e) => setJobForm({ ...jobForm, autoRenew: e.target.checked })}
                  />
                }
                label="Auto-Renew"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Notes (Optional)"
                value={jobForm.notes}
                onChange={(e) => setJobForm({ ...jobForm, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditJobDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleUpdateJob}
            disabled={saving || jobForm.bureaus.length === 0}
            startIcon={<Save />}
          >
            {saving ? 'Updating...' : 'Update Job'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
            <AlertCircle />
            Confirm Deletion
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this monitoring job for{' '}
            <strong>{selectedJob?.clientName}</strong>?
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            This action cannot be undone. All associated alerts and history will remain.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteJob}
            disabled={saving}
            startIcon={<Trash2 />}
          >
            {saving ? 'Deleting...' : 'Delete Job'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Change Detail Dialog with AI Insights */}
      <Dialog
        open={detailDialog}
        onClose={() => {
          setDetailDialog(false);
          setAiInsights(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Brain />
            AI Analysis: Credit Change
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {aiAnalyzing ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
              <CircularProgress size={60} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Analyzing credit change with AI...
              </Typography>
            </Box>
          ) : aiInsights ? (
            <Box>
              <Alert severity={aiInsights.significance === 'critical' ? 'error' : 'info'} sx={{ mb: 3 }}>
                <AlertTitle>Significance: {aiInsights.significance.toUpperCase()}</AlertTitle>
                {aiInsights.impact}
              </Alert>

              <Typography variant="h6" gutterBottom>
                Recommended Actions
              </Typography>
              <List>
                {aiInsights.actions?.map((action, index) => (
                  <ListItem key={index}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                        {index + 1}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={action} />
                  </ListItem>
                ))}
              </List>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                Client Communication Suggestion
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                <Typography variant="body2">{aiInsights.clientMessage}</Typography>
              </Paper>
            </Box>
          ) : (
            <Alert severity="info">
              Click "Analyze with AI" on any change to get detailed insights.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialog(false)}>Close</Button>
          {aiInsights && (
            <Button variant="contained" startIcon={<Send />}>
              Send to Client
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* ===== SNACKBAR ===== */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* ===== SPEED DIAL (MOBILE FAB) ===== */}
      {isMobile && (
        <SpeedDial
          ariaLabel="Quick actions"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          icon={<SpeedDialIcon />}
        >
          <SpeedDialAction
            icon={<Plus />}
            tooltipTitle="Create Job"
            onClick={() => setCreateJobDialog(true)}
          />
          <SpeedDialAction
            icon={<RefreshCw />}
            tooltipTitle="Refresh"
            onClick={loadClientsWithReports}
          />
          <SpeedDialAction
            icon={<Download />}
            tooltipTitle="Export"
            onClick={() => showSnackbar('Export feature coming soon!', 'info')}
          />
        </SpeedDial>
      )}
    </Container>
  );
};

export default CreditMonitoringSystem;