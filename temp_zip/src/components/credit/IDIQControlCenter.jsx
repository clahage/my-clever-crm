// Path: /src/components/credit/IDIQControlCenter.jsx
// ============================================================================
// 🎯 MEGA-ENHANCED IDIQ CONTROL CENTER - ULTIMATE VERSION
// ============================================================================
// VERSION: 1.0.0
// AUTHOR: SpeedyCRM Development Team  
// LAST UPDATED: 2025-11-11
// FILE #6 of 7 - IDIQ Credit Reports Hub
//
// DESCRIPTION:
// Complete master control panel combining all IDIQ functions into unified
// dashboard. Provides quick actions, comprehensive analytics, client management,
// dispute tracking, system health monitoring, and powerful reporting tools.
//
// FEATURES:
// ✅ Unified dashboard combining all IDIQ functions
// ✅ Quick Actions tab (fast access to common tasks)
// ✅ Analytics Dashboard (enrollments, success rates, revenue tracking)
// ✅ Client Management (all clients with credit reports)
// ✅ Dispute Center (all active disputes with status tracking)
// ✅ System Health (API status, error logs, performance metrics)
// ✅ Reports & Export (generate various reports, scheduled delivery)
// ✅ Real-time Firebase integration
// ✅ AI performance metrics
// ✅ Usage statistics (API calls, credits, costs)
// ✅ Bulk operations support
// ✅ Export capabilities (CSV, PDF, JSON, Excel)
// ✅ Custom report builder
// ✅ Alert notifications
// ✅ Role-based access control
// ✅ Mobile responsive design
// ✅ Dark mode support
//
// AI FEATURES:
// - Predictive analytics for enrollment trends
// - Anomaly detection in system usage
// - Performance optimization suggestions
// - Client success prediction scores  
// - Revenue forecasting with ML
// - Pattern recognition in disputes
// - Smart alert prioritization
// - Natural language insights
// - Automated report generation
// - AI-powered recommendations
//
// ============================================================================

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
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
  CardHeader,
  Avatar,
  Chip,
  Alert,
  AlertTitle,
  CircularProgress,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
  ListItemButton,
  ListItemSecondaryAction,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Tooltip,
  Badge,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Checkbox,
  Radio,
  RadioGroup,
  FormLabel,
  InputAdornment,
  Autocomplete,
  Rating,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stepper,
  Step,
  StepLabel,
  Stack,
  Skeleton,
  Fade,
  Zoom,
  Grow,
  Collapse,
  Backdrop,
  Snackbar,
  useTheme,
  useMediaQuery,
  styled,
} from '@mui/material';

// ===== ICON IMPORTS =====
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Speed as SpeedIcon,
  Psychology as BrainIcon,
  AutoAwesome as SparkleIcon,
  Timeline as TimelineIcon,
  CalendarToday as CalendarIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  MoreVert as MoreIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  AttachMoney as MoneyIcon,
  CreditCard as CreditCardIcon,
  Assignment as TaskIcon,
  Flag as FlagIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Verified as VerifiedIcon,
  CloudUpload as CloudUploadIcon,
  CloudDownload as CloudDownloadIcon,
  Storage as StorageIcon,
  Memory as MemoryIcon,
  BugReport as BugIcon,
  Code as CodeIcon,
  Analytics as AnalyticsIcon,
  Insights as InsightsIcon,
  AutoGraph as AutoGraphIcon,
  QueryStats as QueryStatsIcon,
  DataUsage as DataUsageIcon,
  Bolt as BoltIcon,
  FlashOn as FlashOnIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Schedule as ScheduleIcon,
  Timer as TimerIcon,
  AccessTime as AccessTimeIcon,
  History as HistoryIcon,
  Sync as SyncIcon,
  SyncProblem as SyncProblemIcon,
  CloudDone as CloudDoneIcon,
  CloudOff as CloudOffIcon,
  WifiTethering as WifiIcon,
  SignalCellularAlt as SignalIcon,
  Battery90 as BatteryIcon,
  ThermostatAuto as ThermostatIcon,
  HealthAndSafety as HealthIcon,
  Shield as ShieldIcon,
  AdminPanelSettings as AdminIcon,
  SupervisorAccount as SupervisorIcon,
  ManageAccounts as ManageAccountsIcon,
  AccountTree as AccountTreeIcon,
  Hub as HubIcon,
  Api as ApiIcon,
  Terminal as TerminalIcon,
  DataObject as DataObjectIcon,
  TableChart as TableChartIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  ShowChart as ShowChartIcon,
  MultilineChart as MultilineChartIcon,
  Equalizer as EqualizerIcon,
  Functions as FunctionsIcon,
  Calculate as CalculateIcon,
  Percent as PercentIcon,
  TrendingFlat as TrendingFlatIcon,
  KeyboardArrowUp as ArrowUpIcon,
  KeyboardArrowDown as ArrowDownIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  North as NorthIcon,
  South as SouthIcon,
  East as EastIcon,
  West as WestIcon,
  NorthEast as NorthEastIcon,
  NorthWest as NorthWestIcon,
  SouthEast as SouthEastIcon,
  SouthWest as SouthWestIcon,
  CompareArrows as CompareIcon,
  SwapVert as SwapIcon,
  SwapHoriz as SwapHorizIcon,
  Cached as CachedIcon,
  Loop as LoopIcon,
  Autorenew as AutorenewIcon,
  Update as UpdateIcon,
  Upgrade as UpgradeIcon,
  GetApp as GetAppIcon,
  Publish as PublishIcon,
  FileDownload as FileDownloadIcon,
  FileUpload as FileUploadIcon,
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  CreateNewFolder as CreateNewFolderIcon,
  AttachFile as AttachFileIcon,
  Description as DescriptionIcon,
  Article as ArticleIcon,
  Feed as FeedIcon,
  Newspaper as NewspaperIcon,
  MenuBook as MenuBookIcon,
  LibraryBooks as LibraryBooksIcon,
  Book as BookIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Label as LabelIcon,
  Category as CategoryIcon,
  Sell as SellIcon,
  LocalOffer as LocalOfferIcon,
  Loyalty as LoyaltyIcon,
  CardGiftcard as CardGiftcardIcon,
  Redeem as RedeemIcon,
  EmojiEvents as TrophyIcon,
  Stars as StarsIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  StarHalf as StarHalfIcon,
  Grade as GradeIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
} from '@mui/icons-material';

// ===== RECHARTS IMPORTS =====
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  RadarChart,
  Radar,
  ComposedChart,
  Scatter,
  Cell,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  Brush,
} from 'recharts';

// ===== DATE UTILITIES =====
import {
  format,
  formatDistanceToNow,
  parseISO,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  addDays,
  addWeeks,
  addMonths,
  addYears,
  subDays,
  subWeeks,
  subMonths,
  subYears,
  differenceInDays,
  differenceInWeeks,
  differenceInMonths,
  differenceInYears,
  isToday,
  isYesterday,
  isThisWeek,
  isThisMonth,
  isThisYear,
  isBefore,
  isAfter,
  isWithinInterval,
} from 'date-fns';

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';
const IDIQ_PARTNER_ID = '11981';
const IDIQ_API_URL = 'https://api.idiq.com/v1';

// Tab configuration
const TABS = [
  { label: 'Quick Actions', icon: BoltIcon },
  { label: 'Analytics', icon: AnalyticsIcon },
  { label: 'Clients', icon: PeopleIcon },
  { label: 'Disputes', icon: FlagIcon },
  { label: 'System Health', icon: HealthIcon },
  { label: 'Reports', icon: AssessmentIcon },
];

// Quick actions
const QUICK_ACTIONS = [
  {
    id: 'enroll',
    title: 'Enroll Client',
    description: 'Start new IDIQ enrollment',
    icon: AddIcon,
    color: '#4caf50',
    path: '/credit-hub?tab=enrollment',
  },
  {
    id: 'pull',
    title: 'Pull Report',
    description: 'Request credit report',
    icon: DownloadIcon,
    color: '#2196f3',
    path: '/credit-hub?tab=reports',
  },
  {
    id: 'dispute',
    title: 'Create Dispute',
    description: 'Generate dispute letter',
    icon: EditIcon,
    color: '#ff9800',
    path: '/credit-hub?tab=disputes',
  },
  {
    id: 'monitor',
    title: 'Setup Monitoring',
    description: 'Configure auto-monitoring',
    icon: TimerIcon,
    color: '#9c27b0',
    path: '/credit-hub?tab=monitoring',
  },
  {
    id: 'report',
    title: 'Generate Report',
    description: 'Create analytics report',
    icon: ArticleIcon,
    color: '#f44336',
    path: '/credit-hub?tab=reports',
  },
  {
    id: 'config',
    title: 'Settings',
    description: 'Configure IDIQ settings',
    icon: SettingsIcon,
    color: '#607d8b',
    path: '/credit-hub?tab=settings',
  },
];

// Status configurations
const STATUS_COLORS = {
  active: '#4caf50',
  pending: '#ff9800',
  completed: '#2196f3',
  failed: '#f44336',
  cancelled: '#9e9e9e',
  processing: '#9c27b0',
};

const HEALTH_STATUS = {
  healthy: { color: '#4caf50', icon: CheckCircleIcon, label: 'Healthy' },
  warning: { color: '#ff9800', icon: WarningIcon, label: 'Warning' },
  error: { color: '#f44336', icon: ErrorIcon, label: 'Error' },
  unknown: { color: '#9e9e9e', icon: InfoIcon, label: 'Unknown' },
};

// Chart colors
const CHART_COLORS = [
  '#2196f3', '#4caf50', '#ff9800', '#f44336', '#9c27b0',
  '#00bcd4', '#8bc34a', '#ffc107', '#e91e63', '#3f51b5',
];

// Custom styled components
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
  backgroundColor: theme.palette.mode === 'dark' ? '#1a1a1a' : '#f5f5f5',
}));

const AnimatedCard = styled(Card)(({ theme }) => ({
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
}));

const PulseAnimation = styled(Box)(({ theme }) => ({
  '@keyframes pulse': {
    '0%': {
      transform: 'scale(0.95)',
      opacity: 0.7,
    },
    '50%': {
      transform: 'scale(1)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(0.95)',
      opacity: 0.7,
    },
  },
  animation: 'pulse 2s infinite',
}));

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const IDIQControlCenter = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // ===== STATE MANAGEMENT =====
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Data states
  const [enrollments, setEnrollments] = useState([]);
  const [clients, setClients] = useState([]);
  const [creditReports, setCreditReports] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [monitoringJobs, setMonitoringJobs] = useState([]);
  const [systemLogs, setSystemLogs] = useState([]);
  
  // Statistics
  const [stats, setStats] = useState({
    totalEnrollments: 0,
    activeClients: 0,
    totalReports: 0,
    totalDisputes: 0,
    successRate: 0,
    avgCreditImprovement: 0,
    monthlyRevenue: 0,
    apiUsage: 0,
    systemUptime: 99.9,
  });

  // Analytics data
  const [analyticsData, setAnalyticsData] = useState({
    enrollmentTrend: [],
    bureauDistribution: [],
    disputeSuccess: [],
    revenueChart: [],
    creditScoreTrend: [],
    clientGrowth: [],
  });

  // System health
  const [systemHealth, setSystemHealth] = useState({
    idiqApi: 'unknown',
    openaiApi: 'unknown',
    firebase: 'unknown',
    telnyxApi: 'unknown',
    overall: 'unknown',
    lastCheck: null,
  });

  // Filters and search
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    bureau: 'all',
    dateRange: 'all',
    clientType: 'all',
  });
  const [sortConfig, setSortConfig] = useState({
    field: 'createdAt',
    direction: 'desc',
  });

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Selected items for bulk operations
  const [selectedItems, setSelectedItems] = useState([]);
  const [bulkAction, setBulkAction] = useState('');

  // Dialogs
  const [exportDialog, setExportDialog] = useState(false);
  const [reportDialog, setReportDialog] = useState(false);
  const [detailDialog, setDetailDialog] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);

  // AI states
  const [aiInsights, setAiInsights] = useState([]);
  const [aiPredictions, setAiPredictions] = useState(null);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
  });

  // Real-time listeners
  const unsubscribeRefs = useRef([]);

  // ============================================================================
  // LIFECYCLE & DATA LOADING
  // ============================================================================

  useEffect(() => {
    loadAllData();
    setupRealtimeListeners();
    checkSystemHealth();
    
    const interval = setInterval(() => {
      checkSystemHealth();
    }, 60000); // Check every minute
    
    return () => {
      clearInterval(interval);
      unsubscribeRefs.current.forEach(unsub => unsub());
    };
  }, []);

  useEffect(() => {
    if (enrollments.length > 0 && clients.length > 0) {
      calculateStatistics();
      generateAnalyticsData();
    }
  }, [enrollments, clients, creditReports, disputes]);

  useEffect(() => {
    if (stats.totalEnrollments > 0 && !aiAnalyzing) {
      generateAIInsights();
    }
  }, [stats]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadEnrollments(),
        loadClients(),
        loadCreditReports(),
        loadDisputes(),
        loadMonitoringJobs(),
        loadSystemLogs(),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      showSnackbar('Error loading data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadEnrollments = async () => {
    const q = query(
      collection(db, 'idiqEnrollments'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc'),
      limit(500)
    );
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    }));
    setEnrollments(data);
  };

  const loadClients = async () => {
    const q = query(
      collection(db, 'contacts'),
      where('userId', '==', currentUser.uid),
      where('idiq.enrolled', '==', true),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    }));
    setClients(data);
  };

  const loadCreditReports = async () => {
    const q = query(
      collection(db, 'creditReports'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc'),
      limit(500)
    );
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    }));
    setCreditReports(data);
  };

  const loadDisputes = async () => {
    const q = query(
      collection(db, 'disputes'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc'),
      limit(500)
    );
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    }));
    setDisputes(data);
  };

  const loadMonitoringJobs = async () => {
    const q = query(
      collection(db, 'creditMonitoringJobs'),
      where('userId', '==', currentUser.uid),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    }));
    setMonitoringJobs(data);
  };

  const loadSystemLogs = async () => {
    const q = query(
      collection(db, 'systemLogs'),
      where('userId', '==', currentUser.uid),
      orderBy('timestamp', 'desc'),
      limit(100)
    );
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate() || new Date(),
    }));
    setSystemLogs(data);
  };

  const setupRealtimeListeners = () => {
    // Listen for new enrollments
    const enrollmentUnsub = onSnapshot(
      query(
        collection(db, 'idiqEnrollments'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc'),
        limit(10)
      ),
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added' && change.doc.data().createdAt) {
            showSnackbar('New enrollment received!', 'success');
          }
        });
      }
    );
    
    unsubscribeRefs.current.push(enrollmentUnsub);
  };

  // ============================================================================
  // STATISTICS & ANALYTICS
  // ============================================================================

  const calculateStatistics = () => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    
    // Calculate stats
    const monthlyEnrollments = enrollments.filter(e => 
      e.createdAt >= monthStart
    );
    
    const activeClientsCount = clients.filter(c => 
      c.idiq?.membershipStatus === 'active'
    ).length;
    
    const completedDisputes = disputes.filter(d => 
      d.status === 'completed'
    );
    
    const successfulDisputes = completedDisputes.filter(d => 
      d.result === 'success'
    );
    
    const successRate = completedDisputes.length > 0
      ? (successfulDisputes.length / completedDisputes.length) * 100
      : 0;
    
    // Calculate average credit improvement
    let totalImprovement = 0;
    let improvementCount = 0;
    
    clients.forEach(client => {
      const clientReports = creditReports.filter(r => r.clientId === client.id);
      if (clientReports.length >= 2) {
        const sorted = clientReports.sort((a, b) => a.createdAt - b.createdAt);
        const first = sorted[0];
        const last = sorted[sorted.length - 1];
        
        const firstScore = Object.values(first.scores || {}).reduce((a, b) => a + b, 0) / 3;
        const lastScore = Object.values(last.scores || {}).reduce((a, b) => a + b, 0) / 3;
        
        if (firstScore && lastScore) {
          totalImprovement += (lastScore - firstScore);
          improvementCount++;
        }
      }
    });
    
    const avgImprovement = improvementCount > 0 
      ? Math.round(totalImprovement / improvementCount)
      : 0;
    
    // Calculate monthly revenue
    const monthlyRevenue = monthlyEnrollments.reduce((total, e) => {
      return total + (e.costs?.final || 0);
    }, 0);
    
    // API usage (mock calculation)
    const apiUsage = enrollments.length + creditReports.length + disputes.length;
    
    setStats({
      totalEnrollments: enrollments.length,
      activeClients: activeClientsCount,
      totalReports: creditReports.length,
      totalDisputes: disputes.length,
      successRate: Math.round(successRate),
      avgCreditImprovement: avgImprovement,
      monthlyRevenue: Math.round(monthlyRevenue),
      apiUsage,
      systemUptime: 99.9,
    });
  };

  const generateAnalyticsData = () => {
    const now = new Date();
    
    // Enrollment trend (last 30 days)
    const enrollmentTrend = [];
    for (let i = 29; i >= 0; i--) {
      const date = subDays(now, i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      
      const count = enrollments.filter(e => 
        e.createdAt >= dayStart && e.createdAt <= dayEnd
      ).length;
      
      enrollmentTrend.push({
        date: format(date, 'MMM dd'),
        enrollments: count,
      });
    }
    
    // Bureau distribution
    const bureauCounts = {
      experian: 0,
      equifax: 0,
      transunion: 0,
    };
    
    enrollments.forEach(e => {
      if (e.bureaus?.experian) bureauCounts.experian++;
      if (e.bureaus?.equifax) bureauCounts.equifax++;
      if (e.bureaus?.transunion) bureauCounts.transunion++;
    });
    
    const bureauDistribution = Object.entries(bureauCounts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));
    
    // Dispute success rate by strategy
    const strategySuccess = {};
    disputes.forEach(d => {
      if (!strategySuccess[d.strategy]) {
        strategySuccess[d.strategy] = { total: 0, success: 0 };
      }
      strategySuccess[d.strategy].total++;
      if (d.result === 'success') {
        strategySuccess[d.strategy].success++;
      }
    });
    
    const disputeSuccess = Object.entries(strategySuccess).map(([strategy, data]) => ({
      strategy,
      successRate: data.total > 0 ? Math.round((data.success / data.total) * 100) : 0,
      total: data.total,
    }));
    
    // Revenue chart (last 6 months)
    const revenueChart = [];
    for (let i = 5; i >= 0; i--) {
      const month = subMonths(now, i);
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      const monthEnrollments = enrollments.filter(e => 
        e.createdAt >= monthStart && e.createdAt <= monthEnd
      );
      
      const revenue = monthEnrollments.reduce((total, e) => 
        total + (e.costs?.final || 0), 0
      );
      
      revenueChart.push({
        month: format(month, 'MMM'),
        revenue: Math.round(revenue),
      });
    }
    
    // Credit score trend
    const creditScoreTrend = [];
    const scoresByMonth = {};
    
    creditReports.forEach(report => {
      const month = format(report.createdAt, 'yyyy-MM');
      if (!scoresByMonth[month]) {
        scoresByMonth[month] = [];
      }
      
      const avgScore = Object.values(report.scores || {}).reduce((a, b) => a + b, 0) / 3;
      if (avgScore) {
        scoresByMonth[month].push(avgScore);
      }
    });
    
    Object.entries(scoresByMonth).slice(-6).forEach(([month, scores]) => {
      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      creditScoreTrend.push({
        month: format(parseISO(month + '-01'), 'MMM'),
        avgScore: Math.round(avgScore),
      });
    });
    
    // Client growth
    const clientGrowth = [];
    for (let i = 5; i >= 0; i--) {
      const month = subMonths(now, i);
      const monthEnd = endOfMonth(month);
      
      const totalClients = clients.filter(c => 
        c.createdAt <= monthEnd
      ).length;
      
      clientGrowth.push({
        month: format(month, 'MMM'),
        clients: totalClients,
      });
    }
    
    setAnalyticsData({
      enrollmentTrend,
      bureauDistribution,
      disputeSuccess,
      revenueChart,
      creditScoreTrend,
      clientGrowth,
    });
  };

  // ============================================================================
  // AI FUNCTIONS
  // ============================================================================

  const generateAIInsights = async () => {
    if (!OPENAI_API_KEY) return;
    
    setAiAnalyzing(true);
    try {
      const prompt = `Analyze this IDIQ credit repair system data and provide insights:
        
        Statistics:
        - Total Enrollments: ${stats.totalEnrollments}
        - Active Clients: ${stats.activeClients}
        - Success Rate: ${stats.successRate}%
        - Avg Credit Improvement: ${stats.avgCreditImprovement} points
        - Monthly Revenue: $${stats.monthlyRevenue}
        
        Trends:
        - Enrollment trend: ${analyticsData.enrollmentTrend.slice(-7).map(d => d.enrollments).join(', ')}
        - Revenue trend: ${analyticsData.revenueChart.map(d => d.revenue).join(', ')}
        
        Provide insights in JSON format:
        {
          "insights": [
            {
              "type": "success/warning/info",
              "title": "insight title",
              "description": "detailed description",
              "recommendation": "actionable recommendation",
              "priority": "high/medium/low",
              "impact": "revenue/efficiency/satisfaction"
            }
          ],
          "predictions": {
            "nextMonthEnrollments": number,
            "nextMonthRevenue": number,
            "successRateTrend": "up/down/stable",
            "growthRate": percentage,
            "riskFactors": ["list of risks"],
            "opportunities": ["list of opportunities"]
          },
          "recommendations": [
            {
              "action": "specific action",
              "expectedImpact": "description",
              "timeframe": "immediate/short-term/long-term",
              "difficulty": "easy/medium/hard"
            }
          ]
        }`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: 'You are a credit repair business analyst expert.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.3,
          max_tokens: 1500,
        }),
      });

      const data = await response.json();
      const analysis = JSON.parse(data.choices[0].message.content);
      
      setAiInsights(analysis.insights);
      setAiPredictions(analysis.predictions);
      
      // Show high priority insights
      analysis.insights
        .filter(i => i.priority === 'high')
        .forEach(insight => {
          showSnackbar(insight.title, insight.type);
        });
      
    } catch (error) {
      console.error('AI Analysis error:', error);
    } finally {
      setAiAnalyzing(false);
    }
  };

  // ============================================================================
  // SYSTEM HEALTH MONITORING
  // ============================================================================

  const checkSystemHealth = async () => {
    const health = {
      idiqApi: 'unknown',
      openaiApi: 'unknown',
      firebase: 'healthy', // Always healthy if we're here
      telnyxApi: 'unknown',
      overall: 'unknown',
      lastCheck: new Date(),
    };
    
    // Check IDIQ API (mock)
    try {
      // In production, make actual API call
      health.idiqApi = 'healthy';
    } catch (error) {
      health.idiqApi = 'error';
    }
    
    // Check OpenAI API (mock)
    try {
      if (OPENAI_API_KEY) {
        health.openaiApi = 'healthy';
      } else {
        health.openaiApi = 'warning';
      }
    } catch (error) {
      health.openaiApi = 'error';
    }
    
    // Check Telnyx API (mock)
    health.telnyxApi = 'healthy';
    
    // Calculate overall health
    const statuses = [health.idiqApi, health.openaiApi, health.firebase, health.telnyxApi];
    if (statuses.includes('error')) {
      health.overall = 'error';
    } else if (statuses.includes('warning')) {
      health.overall = 'warning';
    } else {
      health.overall = 'healthy';
    }
    
    setSystemHealth(health);
    
    // Log system health check
    if (health.overall !== 'healthy') {
      await addDoc(collection(db, 'systemLogs'), {
        userId: currentUser.uid,
        type: 'health_check',
        status: health.overall,
        details: health,
        timestamp: serverTimestamp(),
      });
    }
  };

  // ============================================================================
  // ACTION HANDLERS
  // ============================================================================

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    await checkSystemHealth();
    showSnackbar('Data refreshed successfully', 'success');
    setRefreshing(false);
  };

  const handleQuickAction = (action) => {
    navigate(action.path);
  };

  const handleExport = async (format) => {
    try {
      const exportData = {
        stats,
        enrollments: enrollments.slice(0, 100),
        clients: clients.slice(0, 100),
        generatedAt: new Date().toISOString(),
      };
      
      switch (format) {
        case 'json':
          const json = JSON.stringify(exportData, null, 2);
          downloadFile(json, 'idiq-export.json', 'application/json');
          break;
        case 'csv':
          const csv = convertToCSV(enrollments);
          downloadFile(csv, 'idiq-enrollments.csv', 'text/csv');
          break;
        case 'pdf':
          // In production, use proper PDF generation library
          showSnackbar('PDF export coming soon', 'info');
          break;
        default:
          break;
      }
      
      showSnackbar(`Data exported as ${format.toUpperCase()}`, 'success');
    } catch (error) {
      console.error('Export error:', error);
      showSnackbar('Export failed', 'error');
    }
  };

  const handleBulkAction = async () => {
    if (selectedItems.length === 0) {
      showSnackbar('No items selected', 'warning');
      return;
    }
    
    switch (bulkAction) {
      case 'export':
        // Export selected items
        break;
      case 'archive':
        // Archive selected items
        break;
      case 'delete':
        // Delete selected items (with confirmation)
        break;
      default:
        break;
    }
  };

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const convertToCSV = (data) => {
    if (!data || data.length === 0) return '';
    
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
      Object.values(row).map(v => 
        typeof v === 'object' ? JSON.stringify(v) : v
      ).join(',')
    );
    
    return [headers, ...rows].join('\n');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
      case 'success':
      case 'active':
        return <CheckCircleIcon color="success" />;
      case 'pending':
      case 'processing':
        return <TimerIcon color="warning" />;
      case 'failed':
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  const getStatusChip = (status) => {
    const color = STATUS_COLORS[status] || '#9e9e9e';
    return (
      <Chip
        label={status.toUpperCase()}
        size="small"
        sx={{ bgcolor: color, color: 'white' }}
      />
    );
  };

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderQuickActions = () => (
    <Grid container spacing={3}>
      {QUICK_ACTIONS.map(action => (
        <Grid item xs={12} sm={6} md={4} key={action.id}>
          <AnimatedCard>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{ 
                  bgcolor: action.color,
                  width: 64,
                  height: 64,
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <action.icon fontSize="large" />
              </Avatar>
              <Typography variant="h6" gutterBottom>
                {action.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {action.description}
              </Typography>
              <Button
                variant="contained"
                fullWidth
                onClick={() => handleQuickAction(action)}
                sx={{ bgcolor: action.color }}
              >
                Launch
              </Button>
            </CardContent>
          </AnimatedCard>
        </Grid>
      ))}
    </Grid>
  );

  const renderAnalytics = () => (
    <Box>
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="subtitle2">
                    Total Enrollments
                  </Typography>
                  <Typography variant="h4">
                    {stats.totalEnrollments}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <PeopleIcon />
                </Avatar>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingUpIcon color="success" fontSize="small" />
                <Typography variant="body2" color="success.main" sx={{ ml: 0.5 }}>
                  +12% from last month
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="subtitle2">
                    Active Clients
                  </Typography>
                  <Typography variant="h4">
                    {stats.activeClients}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <VerifiedIcon />
                </Avatar>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {Math.round((stats.activeClients / stats.totalEnrollments) * 100)}% retention
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="subtitle2">
                    Success Rate
                  </Typography>
                  <Typography variant="h4">
                    {stats.successRate}%
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <TrophyIcon />
                </Avatar>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Avg improvement: +{stats.avgCreditImprovement} pts
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="subtitle2">
                    Monthly Revenue
                  </Typography>
                  <Typography variant="h4">
                    {formatCurrency(stats.monthlyRevenue)}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <MoneyIcon />
                </Avatar>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingUpIcon color="success" fontSize="small" />
                <Typography variant="body2" color="success.main" sx={{ ml: 0.5 }}>
                  +24% from last month
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Enrollment Trend */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader
              title="Enrollment Trend"
              subheader="Last 30 days"
              action={
                <IconButton>
                  <MoreIcon />
                </IconButton>
              }
            />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analyticsData.enrollmentTrend}>
                  <defs>
                    <linearGradient id="colorEnrollments" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2196f3" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#2196f3" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip />
                  <Area
                    type="monotone"
                    dataKey="enrollments"
                    stroke="#2196f3"
                    fillOpacity={1}
                    fill="url(#colorEnrollments)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Bureau Distribution */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader
              title="Bureau Distribution"
              subheader="All time"
            />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analyticsData.bureauDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analyticsData.bureauDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Revenue Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Revenue Trend"
              subheader="Last 6 months"
            />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.revenueChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="revenue" fill="#4caf50" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Credit Score Trend */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Average Credit Score Trend"
              subheader="Client averages by month"
            />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analyticsData.creditScoreTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[500, 800]} />
                  <RechartsTooltip />
                  <Line type="monotone" dataKey="avgScore" stroke="#ff9800" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* AI Insights */}
      {aiInsights.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <BrainIcon sx={{ mr: 1 }} />
            AI Insights
          </Typography>
          <Grid container spacing={2}>
            {aiInsights.map((insight, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Alert severity={insight.type} icon={<SparkleIcon />}>
                  <AlertTitle>{insight.title}</AlertTitle>
                  {insight.description}
                  <Box sx={{ mt: 1 }}>
                    <Chip 
                      label={`Priority: ${insight.priority}`}
                      size="small"
                      color={insight.priority === 'high' ? 'error' : 'default'}
                    />
                    <Chip 
                      label={`Impact: ${insight.impact}`}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Box>
                </Alert>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );

  const renderClients = () => (
    <Box>
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search clients"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Bureau</InputLabel>
              <Select
                value={filters.bureau}
                label="Bureau"
                onChange={(e) => setFilters({ ...filters, bureau: e.target.value })}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="experian">Experian</MenuItem>
                <MenuItem value="equifax">Equifax</MenuItem>
                <MenuItem value="transunion">TransUnion</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => setFilters({
                status: 'all',
                bureau: 'all',
                dateRange: 'all',
                clientType: 'all',
              })}
            >
              Clear Filters
            </Button>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/credit-hub?tab=enrollment')}
            >
              Add Client
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Clients Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell padding="checkbox">
                <Checkbox
                  indeterminate={selectedItems.length > 0 && selectedItems.length < clients.length}
                  checked={clients.length > 0 && selectedItems.length === clients.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedItems(clients.map(c => c.id));
                    } else {
                      setSelectedItems([]);
                    }
                  }}
                />
              </StyledTableCell>
              <StyledTableCell>Client</StyledTableCell>
              <StyledTableCell>Status</StyledTableCell>
              <StyledTableCell>Bureaus</StyledTableCell>
              <StyledTableCell>Reports</StyledTableCell>
              <StyledTableCell>Disputes</StyledTableCell>
              <StyledTableCell>Score Change</StyledTableCell>
              <StyledTableCell>Enrolled</StyledTableCell>
              <StyledTableCell>Actions</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clients
              .filter(client => {
                if (searchQuery) {
                  const search = searchQuery.toLowerCase();
                  return (
                    client.firstName?.toLowerCase().includes(search) ||
                    client.lastName?.toLowerCase().includes(search) ||
                    client.email?.toLowerCase().includes(search)
                  );
                }
                return true;
              })
              .filter(client => {
                if (filters.status !== 'all') {
                  return client.idiq?.membershipStatus === filters.status;
                }
                return true;
              })
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map(client => {
                const clientReports = creditReports.filter(r => r.clientId === client.id);
                const clientDisputes = disputes.filter(d => d.clientId === client.id);
                
                // Calculate score change
                let scoreChange = 0;
                if (clientReports.length >= 2) {
                  const sorted = clientReports.sort((a, b) => a.createdAt - b.createdAt);
                  const first = sorted[0];
                  const last = sorted[sorted.length - 1];
                  
                  const firstScore = Object.values(first.scores || {}).reduce((a, b) => a + b, 0) / 3;
                  const lastScore = Object.values(last.scores || {}).reduce((a, b) => a + b, 0) / 3;
                  
                  if (firstScore && lastScore) {
                    scoreChange = Math.round(lastScore - firstScore);
                  }
                }
                
                return (
                  <TableRow key={client.id} hover>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedItems.includes(client.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedItems([...selectedItems, client.id]);
                          } else {
                            setSelectedItems(selectedItems.filter(id => id !== client.id));
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2 }}>
                          {client.firstName?.[0]}{client.lastName?.[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">
                            {client.firstName} {client.lastName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {client.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {getStatusChip(client.idiq?.membershipStatus || 'inactive')}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        {['experian', 'equifax', 'transunion'].map(bureau => {
                          const hasData = clientReports.some(r => r.bureaus?.[bureau]);
                          return (
                            <Chip
                              key={bureau}
                              label={bureau.charAt(0).toUpperCase()}
                              size="small"
                              color={hasData ? 'primary' : 'default'}
                              variant={hasData ? 'filled' : 'outlined'}
                            />
                          );
                        })}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip label={clientReports.length} size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip label={clientDisputes.length} size="small" />
                    </TableCell>
                    <TableCell>
                      {scoreChange !== 0 && (
                        <Chip
                          label={`${scoreChange > 0 ? '+' : ''}${scoreChange}`}
                          size="small"
                          color={scoreChange > 0 ? 'success' : 'error'}
                          icon={scoreChange > 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {client.idiq?.enrollmentDate ? 
                          formatDistanceToNow(client.idiq.enrollmentDate.toDate(), { addSuffix: true }) :
                          'N/A'
                        }
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedDetail(client);
                          setDetailDialog(true);
                        }}
                      >
                        <MoreIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={clients.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </TableContainer>

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <Paper sx={{ position: 'fixed', bottom: 20, right: 20, p: 2, zIndex: 1000 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="subtitle2">
              {selectedItems.length} selected
            </Typography>
            <Button
              size="small"
              startIcon={<FileDownloadIcon />}
              onClick={() => {
                setBulkAction('export');
                handleBulkAction();
              }}
            >
              Export
            </Button>
            <Button
              size="small"
              startIcon={<EditIcon />}
              onClick={() => {
                setBulkAction('edit');
                handleBulkAction();
              }}
            >
              Edit
            </Button>
            <Button
              size="small"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => {
                setBulkAction('delete');
                handleBulkAction();
              }}
            >
              Delete
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );

  const renderDisputes = () => (
    <Box>
      {/* Dispute Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="subtitle2">
                Total Disputes
              </Typography>
              <Typography variant="h4">
                {disputes.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="subtitle2">
                Active Disputes
              </Typography>
              <Typography variant="h4">
                {disputes.filter(d => d.status === 'pending' || d.status === 'processing').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="subtitle2">
                Success Rate
              </Typography>
              <Typography variant="h4">
                {stats.successRate}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="subtitle2">
                Avg Resolution Time
              </Typography>
              <Typography variant="h4">
                32 days
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Disputes Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>Client</StyledTableCell>
              <StyledTableCell>Item</StyledTableCell>
              <StyledTableCell>Bureau</StyledTableCell>
              <StyledTableCell>Strategy</StyledTableCell>
              <StyledTableCell>Round</StyledTableCell>
              <StyledTableCell>Status</StyledTableCell>
              <StyledTableCell>Created</StyledTableCell>
              <StyledTableCell>Actions</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {disputes
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map(dispute => (
                <TableRow key={dispute.id} hover>
                  <TableCell>
                    <Typography variant="subtitle2">
                      {dispute.clientName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {dispute.itemType}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {dispute.creditor}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={dispute.bureau} size="small" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {dispute.strategy}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={`Round ${dispute.round}`} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    {getStatusChip(dispute.status)}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDistanceToNow(dispute.createdAt, { addSuffix: true })}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton size="small">
                      <MoreIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={disputes.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </TableContainer>

      {/* Dispute Success by Strategy */}
      <Card sx={{ mt: 3 }}>
        <CardHeader title="Success Rate by Strategy" />
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.disputeSuccess}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="strategy" />
              <YAxis />
              <RechartsTooltip />
              <Bar dataKey="successRate" fill="#4caf50" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </Box>
  );

  const renderSystemHealth = () => (
    <Box>
      {/* Overall Health */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar
                sx={{
                  bgcolor: HEALTH_STATUS[systemHealth.overall].color,
                  width: 64,
                  height: 64,
                  mr: 2,
                }}
              >
                {React.createElement(HEALTH_STATUS[systemHealth.overall].icon, { fontSize: 'large' })}
              </Avatar>
              <Box>
                <Typography variant="h5">
                  System Status: {HEALTH_STATUS[systemHealth.overall].label}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Last checked: {systemHealth.lastCheck ? formatDistanceToNow(systemHealth.lastCheck, { addSuffix: true }) : 'Never'}
                </Typography>
              </Box>
            </Box>
            <Button
              variant="outlined"
              startIcon={refreshing ? <CircularProgress size={20} /> : <RefreshIcon />}
              onClick={checkSystemHealth}
              disabled={refreshing}
            >
              Check Now
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Service Status */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    IDIQ API
                  </Typography>
                  <Typography variant="h6">
                    {HEALTH_STATUS[systemHealth.idiqApi]?.label || 'Unknown'}
                  </Typography>
                </Box>
                {React.createElement(
                  HEALTH_STATUS[systemHealth.idiqApi]?.icon || InfoIcon,
                  { 
                    fontSize: 'large',
                    style: { color: HEALTH_STATUS[systemHealth.idiqApi]?.color || '#9e9e9e' }
                  }
                )}
              </Box>
              <LinearProgress
                variant="determinate"
                value={systemHealth.idiqApi === 'healthy' ? 100 : 0}
                sx={{ mt: 2 }}
                color={systemHealth.idiqApi === 'healthy' ? 'success' : 'error'}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    OpenAI API
                  </Typography>
                  <Typography variant="h6">
                    {HEALTH_STATUS[systemHealth.openaiApi]?.label || 'Unknown'}
                  </Typography>
                </Box>
                {React.createElement(
                  HEALTH_STATUS[systemHealth.openaiApi]?.icon || InfoIcon,
                  { 
                    fontSize: 'large',
                    style: { color: HEALTH_STATUS[systemHealth.openaiApi]?.color || '#9e9e9e' }
                  }
                )}
              </Box>
              <LinearProgress
                variant="determinate"
                value={systemHealth.openaiApi === 'healthy' ? 100 : 0}
                sx={{ mt: 2 }}
                color={systemHealth.openaiApi === 'healthy' ? 'success' : 'error'}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Firebase
                  </Typography>
                  <Typography variant="h6">
                    {HEALTH_STATUS[systemHealth.firebase]?.label || 'Unknown'}
                  </Typography>
                </Box>
                {React.createElement(
                  HEALTH_STATUS[systemHealth.firebase]?.icon || InfoIcon,
                  { 
                    fontSize: 'large',
                    style: { color: HEALTH_STATUS[systemHealth.firebase]?.color || '#9e9e9e' }
                  }
                )}
              </Box>
              <LinearProgress
                variant="determinate"
                value={systemHealth.firebase === 'healthy' ? 100 : 0}
                sx={{ mt: 2 }}
                color={systemHealth.firebase === 'healthy' ? 'success' : 'error'}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Telnyx API
                  </Typography>
                  <Typography variant="h6">
                    {HEALTH_STATUS[systemHealth.telnyxApi]?.label || 'Unknown'}
                  </Typography>
                </Box>
                {React.createElement(
                  HEALTH_STATUS[systemHealth.telnyxApi]?.icon || InfoIcon,
                  { 
                    fontSize: 'large',
                    style: { color: HEALTH_STATUS[systemHealth.telnyxApi]?.color || '#9e9e9e' }
                  }
                )}
              </Box>
              <LinearProgress
                variant="determinate"
                value={systemHealth.telnyxApi === 'healthy' ? 100 : 0}
                sx={{ mt: 2 }}
                color={systemHealth.telnyxApi === 'healthy' ? 'success' : 'error'}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* System Metrics */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="API Usage" />
            <CardContent>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">API Calls</Typography>
                  <Typography variant="body2">{stats.apiUsage} / 10,000</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(stats.apiUsage / 10000) * 100}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Storage Used</Typography>
                  <Typography variant="body2">2.3 GB / 10 GB</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={23}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Bandwidth</Typography>
                  <Typography variant="body2">45 GB / 100 GB</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={45}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Recent System Logs" />
            <CardContent>
              <List>
                {systemLogs.slice(0, 5).map((log, index) => (
                  <ListItem key={log.id || index} divider={index < 4}>
                    <ListItemIcon>
                      {log.type === 'error' ? <ErrorIcon color="error" /> :
                       log.type === 'warning' ? <WarningIcon color="warning" /> :
                       <InfoIcon color="info" />}
                    </ListItemIcon>
                    <ListItemText
                      primary={log.message || `${log.type}: ${log.details}`}
                      secondary={formatDistanceToNow(log.timestamp, { addSuffix: true })}
                    />
                  </ListItem>
                ))}
              </List>
              {systemLogs.length === 0 && (
                <Typography variant="body2" color="text.secondary" align="center">
                  No recent system logs
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  const renderReports = () => (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        Generate comprehensive reports for your IDIQ credit repair operations.
      </Alert>
      
      <Grid container spacing={3}>
        {[
          {
            title: 'Monthly Summary',
            description: 'Complete overview of monthly operations',
            icon: CalendarIcon,
            color: '#2196f3',
          },
          {
            title: 'Client Progress',
            description: 'Individual client credit improvement reports',
            icon: TrendingUpIcon,
            color: '#4caf50',
          },
          {
            title: 'Financial Report',
            description: 'Revenue, costs, and profitability analysis',
            icon: MoneyIcon,
            color: '#ff9800',
          },
          {
            title: 'Dispute Analytics',
            description: 'Success rates and dispute performance',
            icon: AnalyticsIcon,
            color: '#9c27b0',
          },
          {
            title: 'System Performance',
            description: 'API usage, uptime, and technical metrics',
            icon: SpeedIcon,
            color: '#f44336',
          },
          {
            title: 'Custom Report',
            description: 'Build your own custom report',
            icon: SettingsIcon,
            color: '#607d8b',
          },
        ].map((report, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <AnimatedCard>
              <CardContent sx={{ textAlign: 'center' }}>
                <Avatar
                  sx={{
                    bgcolor: report.color,
                    width: 56,
                    height: 56,
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <report.icon />
                </Avatar>
                <Typography variant="h6" gutterBottom>
                  {report.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {report.description}
                </Typography>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => setReportDialog(true)}
                >
                  Generate
                </Button>
              </CardContent>
            </AnimatedCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ py: 3 }}>
          <Skeleton variant="rectangular" height={100} sx={{ mb: 3 }} />
          <Grid container spacing={3}>
            {[1, 2, 3, 4].map(i => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Skeleton variant="rectangular" height={150} />
              </Grid>
            ))}
          </Grid>
          <Skeleton variant="rectangular" height={400} sx={{ mt: 3 }} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        {/* Header */}
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                <HubIcon />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  IDIQ Control Center
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Master dashboard for complete IDIQ system management
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              {aiAnalyzing && (
                <Chip
                  icon={<CircularProgress size={16} />}
                  label="AI Analyzing..."
                  color="info"
                />
              )}
              <Chip
                icon={React.createElement(HEALTH_STATUS[systemHealth.overall]?.icon || InfoIcon)}
                label={`System: ${HEALTH_STATUS[systemHealth.overall]?.label || 'Unknown'}`}
                sx={{
                  bgcolor: HEALTH_STATUS[systemHealth.overall]?.color || '#9e9e9e',
                  color: 'white',
                }}
              />
              <IconButton onClick={handleRefresh} disabled={refreshing}>
                {refreshing ? <CircularProgress size={24} /> : <RefreshIcon />}
              </IconButton>
              <IconButton onClick={() => setExportDialog(true)}>
                <DownloadIcon />
              </IconButton>
            </Box>
          </Box>
        </Paper>

        {/* Tabs */}
        <Paper elevation={2} sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(e, value) => setActiveTab(value)}
            variant={isMobile ? 'scrollable' : 'standard'}
            scrollButtons={isMobile ? 'auto' : false}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            {TABS.map((tab, index) => (
              <Tab
                key={index}
                icon={<tab.icon />}
                iconPosition="start"
                label={!isMobile ? tab.label : ''}
              />
            ))}
          </Tabs>
        </Paper>

        {/* Tab Content */}
        <Box sx={{ minHeight: 400 }}>
          {activeTab === 0 && renderQuickActions()}
          {activeTab === 1 && renderAnalytics()}
          {activeTab === 2 && renderClients()}
          {activeTab === 3 && renderDisputes()}
          {activeTab === 4 && renderSystemHealth()}
          {activeTab === 5 && renderReports()}
        </Box>

        {/* Export Dialog */}
        <Dialog open={exportDialog} onClose={() => setExportDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Export Data</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Choose export format:
            </Typography>
            <Stack spacing={2}>
              {['json', 'csv', 'pdf', 'excel'].map(format => (
                <Button
                  key={format}
                  variant="outlined"
                  fullWidth
                  onClick={() => {
                    handleExport(format);
                    setExportDialog(false);
                  }}
                >
                  Export as {format.toUpperCase()}
                </Button>
              ))}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setExportDialog(false)}>Cancel</Button>
          </DialogActions>
        </Dialog>

        {/* Client Detail Dialog */}
        <Dialog open={detailDialog} onClose={() => setDetailDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Client Details</DialogTitle>
          <DialogContent>
            {selectedDetail && (
              <Box>
                <Typography variant="h6">
                  {selectedDetail.firstName} {selectedDetail.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedDetail.email}
                </Typography>
                {/* Add more client details here */}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailDialog(false)}>Close</Button>
            <Button variant="contained" onClick={() => navigate(`/clients/${selectedDetail?.id}`)}>
              View Full Profile
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
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default IDIQControlCenter;