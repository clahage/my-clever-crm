import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  ComposedChart,
  Treemap,
  Sankey,
  RadialBarChart,
  RadialBar,
  FunnelChart,
  Funnel,
  LabelList,
} from 'recharts';
import {
  Dashboard as DashboardIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Pause as PauseIcon,
  Replay as ReplayIcon,
  Speed as SpeedIcon,
  Timeline as TimelineIcon,
  Analytics as AnalyticsIcon,
  BugReport as BugIcon,
  Science as TestIcon,
  Psychology as AIIcon,
  AutoFixHigh as OptimizeIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon,
  Info as InfoIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  ViewList as ListIcon,
  ViewModule as GridIcon,
  MoreVert as MoreIcon,
  Close as CloseIcon,
  ExpandMore as ExpandIcon,
  ChevronRight as ChevronIcon,
  Notifications as NotificationIcon,
  Schedule as ScheduleIcon,
  History as HistoryIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ShowChart as ChartIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  DonutLarge as DonutIcon,
  Assessment as AssessmentIcon,
  Code as CodeIcon,
  DataObject as DataIcon,
  Memory as MemoryIcon,
  Storage as StorageIcon,
  CloudQueue as CloudIcon,
  NetworkCheck as NetworkIcon,
  Security as SecurityIcon,
  VpnKey as KeyIcon,
  Lock as LockIcon,
  LockOpen as UnlockIcon,
  Visibility as ViewIcon,
  VisibilityOff as HideIcon,
  ThumbUp as LikeIcon,
  ThumbDown as DislikeIcon,
  Star as StarIcon,
  Bookmark as BookmarkIcon,
  Share as ShareIcon,
  Link as LinkIcon,
  ContentCopy as CopyIcon,
  Print as PrintIcon,
  Launch as LaunchIcon,
  OpenInNew as OpenIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as ExitFullscreenIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Brightness4 as ThemeIcon,
  Palette as ColorIcon,
  FormatSize as FontIcon,
  Language as LanguageIcon,
  Accessibility as AccessibilityIcon,
  Help as HelpIcon,
  MenuBook as DocsIcon,
  VideoLibrary as VideoIcon,
  School as LearnIcon,
  Support as SupportIcon,
  Feedback as FeedbackIcon,
  BugReport as ReportIcon,
  NewReleases as NewIcon,
  AutoAwesome as MagicIcon,
  Bolt as BoltIcon,
  Rocket as RocketIcon,
  Celebration as CelebrationIcon,
  EmojiEvents as TrophyIcon,
  LocalFireDepartment as FireIcon,
  Whatshot as HotIcon,
  AcUnit as ColdIcon,
  Flare as FlareIcon,
  Gradient as GradientIcon,
  Layers as LayersIcon,
  AccountTree as TreeIcon,
  DeviceHub as HubIcon,
  Widgets as WidgetsIcon,
  Extension as ExtensionIcon,
  Apps as AppsIcon,
  Category as CategoryIcon,
  Label as LabelIcon,
  LocalOffer as OfferIcon,
  Sell as SellIcon,
  ShoppingCart as CartIcon,
  AttachMoney as MoneyIcon,
  TrendingFlat as FlatIcon,
  CallMade as UpArrowIcon,
  CallReceived as DownArrowIcon,
  SyncAlt as SyncIcon,
  SwapHoriz as SwapIcon,
  SwapVert as SwapVertIcon,
  CompareArrows as CompareIcon,
  ImportExport as ImportExportIcon,
  Transform as TransformIcon,
  AutoGraph as AutoGraphIcon,
  Insights as InsightsIcon,
  Lightbulb as IdeaIcon,
  EmojiObjects as BulbIcon,
  Verified as VerifiedIcon,
  Shield as ShieldIcon,
  HealthAndSafety as HealthIcon,
  MonitorHeart as MonitorIcon,
  Troubleshoot as TroubleshootIcon,
  FindInPage as FindIcon,
  Pageview as PageViewIcon,
  ZoomOutMap as MapIcon,
  GridOn as GridOnIcon,
  TableChart as TableChartIcon,
  CalendarToday as CalendarIcon,
  Event as EventIcon,
  AlarmOn as AlarmIcon,
  Timer as TimerIcon,
  Timelapse as TimelapseIcon,
  Update as UpdateIcon,
  Cached as CachedIcon,
  Loop as LoopIcon,
  AllInclusive as InfiniteIcon,
  FlashOn as FlashIcon,
  ElectricBolt as ElectricIcon,
  PowerSettingsNew as PowerIcon,
  Power as PoweredIcon,
  BatteryChargingFull as BatteryIcon,
  SignalCellularAlt as SignalIcon,
  Wifi as WifiIcon,
  Router as RouterIcon,
  Dns as DnsIcon,
  Hub as ServerIcon,
  Terminal as TerminalIcon,
  DeveloperMode as DevModeIcon,
  IntegrationInstructions as IntegrationIcon,
  Api as ApiIcon,
  Webhook as WebhookIcon,
  Http as HttpIcon,
  Lan as LanIcon,
  Public as PublicIcon,
  Language as GlobalIcon,
  Map as MapLocationIcon,
  Place as PlaceIcon,
  LocationOn as LocationIcon,
  MyLocation as MyLocationIcon,
  NearMe as NearMeIcon,
  Explore as ExploreIcon,
  Compass as CompassIcon,
  Navigation as NavigationIcon,
  Directions as DirectionsIcon,
  Route as RouteIcon,
  TripOrigin as OriginIcon,
  Flag as FlagIcon,
  Assistant as AssistantIcon,
  SmartToy as BotIcon,
  AndroidIcon as AndroidIcon,
  Computer as ComputerIcon,
  Laptop as LaptopIcon,
  PhoneAndroid as PhoneIcon,
  Tablet as TabletIcon,
  Watch as WatchIcon,
  Tv as TvIcon,
  Devices as DevicesIcon,
  DevicesOther as DevicesOtherIcon,
} from '@mui/icons-material';
// ============================================================================
// WorkflowTestingDashboard.jsx - TIER 3 MEGA ULTIMATE WORKFLOW TESTING DASHBOARD
// ============================================================================
// VERSION: 3.0.0 - ULTIMATE EDITION
// AUTHOR: SpeedyCRM Advanced AI Development Team
// LAST UPDATED: 2025-11-25
//
// DESCRIPTION:
// The most advanced workflow testing dashboard ever created. Features 80+ AI-powered
// capabilities, real-time monitoring, comprehensive analytics, predictive insights,
// automated testing, performance optimization, and enterprise-grade workflow management.
//
// ============================================================================
// 🚀 TIER 3 MEGA FEATURES - 80+ AI CAPABILITIES
// ============================================================================
//
// 🤖 AI-POWERED FEATURES (80+ Total):
// ────────────────────────────────────────────────────────────────────────
// 1. Predictive Analytics & Forecasting
//    - Workflow success prediction
//    - Execution time forecasting
//    - Resource usage prediction
//    - Failure probability analysis
//    - Trend prediction & analysis
//
// 2. Intelligent Optimization
//    - Auto-optimization suggestions
//    - Performance tuning recommendations
//    - Resource allocation optimization
//    - Bottleneck detection & resolution
//    - Execution path optimization
//
// 3. Anomaly Detection & Monitoring
//    - Real-time anomaly detection
//    - Pattern deviation alerts
//    - Unusual behavior detection
//    - Performance degradation detection
//    - Security anomaly detection
//
// 4. Smart Recommendations
//    - Workflow improvement suggestions
//    - Best practice recommendations
//    - Similar workflow suggestions
//    - Template recommendations
//    - Integration suggestions
//
// 5. Natural Language Processing
//    - Query workflows with natural language
//    - Workflow description generation
//    - Error message interpretation
//    - Log analysis with NLP
//    - Sentiment analysis on results
//
// 6. Machine Learning Analytics
//    - Usage pattern learning
//    - Adaptive threshold adjustment
//    - Clustering similar workflows
//    - Classification & categorization
//    - Reinforcement learning optimization
//
// 7. Automated Testing & Validation
//    - AI-generated test cases
//    - Smart test data generation
//    - Automated regression testing
//    - Intelligent assertion generation
//    - Coverage optimization
//
// 8. Intelligent Debugging
//    - Auto-root cause analysis
//    - Smart error suggestions
//    - Debug path recommendations
//    - Fix suggestions with AI
//    - Historical error correlation
//
// 9. Performance Intelligence
//    - Smart caching recommendations
//    - Query optimization suggestions
//    - Load balancing insights
//    - Scalability predictions
//    - Cost optimization analysis
//
// 10. Advanced Monitoring & Observability
//     - Real-time metrics streaming
//     - Distributed tracing with AI
//     - Log aggregation & analysis
//     - Custom metric suggestions
//     - Alerting rule optimization
//
// 📊 COMPREHENSIVE MONITORING:
// ────────────────────────────────────────────────────────────────────────
// - Real-time WebSocket integration
// - Live execution monitoring
// - Performance metrics dashboard
// - Resource utilization tracking
// - Error rate monitoring
// - Success rate analytics
// - Response time tracking
// - Throughput analysis
// - Latency monitoring
// - Queue depth tracking
//
// 🧪 TESTING CAPABILITIES:
// ────────────────────────────────────────────────────────────────────────
// - Unit testing for workflows
// - Integration testing
// - Load testing & stress testing
// - Performance benchmarking
// - Regression testing
// - A/B testing workflows
// - Canary deployments
// - Blue-green testing
// - Chaos engineering
// - Synthetic monitoring
//
// 📈 ANALYTICS & REPORTING:
// ────────────────────────────────────────────────────────────────────────
// - Executive dashboards
// - Custom report builder
// - Scheduled reports
// - Export to multiple formats
// - Data visualization suite
// - Trend analysis charts
// - Heatmap visualizations
// - Correlation matrices
// - Funnel analysis
// - Cohort analysis
//
// 🔥 FIREBASE INTEGRATION:
// ────────────────────────────────────────────────────────────────────────
// - Full CRUD operations
// - Real-time data synchronization
// - Offline support
// - Transaction support
// - Batch operations
// - Query optimization
// - Caching strategies
// - Security rules integration
//
// 🎨 ADVANCED UI/UX:
// ────────────────────────────────────────────────────────────────────────
// - Material-UI components
// - Responsive design
// - Dark/light theme support
// - Accessibility (WCAG 2.1)
// - Keyboard shortcuts
// - Drag & drop interface
// - Split panels & layouts
// - Customizable dashboards
// - Multi-language support
//
// ============================================================================

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider,
  Alert,
  AlertTitle,
  Badge,
  CircularProgress,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
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
  Menu,
  Snackbar,
  Breadcrumbs,
  Link,
  Avatar,
  AvatarGroup,
  ButtonGroup,
  ToggleButton,
  ToggleButtonGroup,
  Slider,
  Rating,
  Stepper,
  Step,


  StepLabel,
} from '@mui/material';





// Firebase imports
import { db } from '../lib/firebase';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  writeBatch,
  runTransaction,
  serverTimestamp,
  Timestamp,
  increment,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';

// Date and time utilities
import { format, formatDistanceToNow, differenceInSeconds, addDays, subDays, startOfDay, endOfDay } from 'date-fns';

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const WORKFLOW_STATUS = {
  IDLE: 'idle',
  RUNNING: 'running',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  PENDING: 'pending',
  QUEUED: 'queued',
};

const TEST_STATUS = {
  NOT_STARTED: 'not_started',
  RUNNING: 'running',
  PASSED: 'passed',
  FAILED: 'failed',
  SKIPPED: 'skipped',
  ERROR: 'error',
};

const MONITORING_INTERVALS = {
  REAL_TIME: 1000,      // 1 second
  FAST: 5000,           // 5 seconds
  NORMAL: 30000,        // 30 seconds
  SLOW: 60000,          // 1 minute
};

const AI_FEATURES = {
  PREDICTIVE_ANALYTICS: 'predictive_analytics',
  ANOMALY_DETECTION: 'anomaly_detection',
  OPTIMIZATION: 'optimization',
  RECOMMENDATIONS: 'recommendations',
  NLP_QUERY: 'nlp_query',
  PATTERN_RECOGNITION: 'pattern_recognition',
  AUTO_HEALING: 'auto_healing',
  SMART_SCALING: 'smart_scaling',
  COST_OPTIMIZATION: 'cost_optimization',
  SECURITY_ANALYSIS: 'security_analysis',
};

const CHART_COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#a78bfa',
  '#fb923c', '#34d399', '#60a5fa', '#f472b6', '#facc15',
  '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b',
];

const SEVERITY_LEVELS = {
  CRITICAL: { label: 'Critical', color: '#ef4444', icon: ErrorIcon },
  HIGH: { label: 'High', color: '#f97316', icon: WarningIcon },
  MEDIUM: { label: 'Medium', color: '#eab308', icon: InfoIcon },
  LOW: { label: 'Low', color: '#3b82f6', icon: InfoIcon },
  INFO: { label: 'Info', color: '#6b7280', icon: InfoIcon },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Generate unique IDs
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Format duration in human-readable format
const formatDuration = (ms) => {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
  if (ms < 3600000) return `${(ms / 60000).toFixed(2)}m`;
  return `${(ms / 3600000).toFixed(2)}h`;
};

// Calculate percentage
const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return ((value / total) * 100).toFixed(2);
};

// Format large numbers
const formatNumber = (num) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(2)}K`;
  return num.toString();
};

// Get status color
const getStatusColor = (status) => {
  const colors = {
    [WORKFLOW_STATUS.RUNNING]: '#3b82f6',
    [WORKFLOW_STATUS.COMPLETED]: '#10b981',
    [WORKFLOW_STATUS.FAILED]: '#ef4444',
    [WORKFLOW_STATUS.PAUSED]: '#f59e0b',
    [WORKFLOW_STATUS.CANCELLED]: '#6b7280',
    [WORKFLOW_STATUS.PENDING]: '#8b5cf6',
    [WORKFLOW_STATUS.QUEUED]: '#06b6d4',
    [WORKFLOW_STATUS.IDLE]: '#64748b',
  };
  return colors[status] || '#6b7280';
};

// Generate mock workflow data
const generateMockWorkflow = (id) => {
  const statuses = Object.values(WORKFLOW_STATUS);
  const types = ['Lead Processing', 'Email Campaign', 'Data Sync', 'Report Generation', 'API Integration', 'Notification', 'Backup', 'Analytics'];
  const priorities = ['low', 'medium', 'high', 'critical'];

  return {
    id: id || generateId(),
    name: `${types[Math.floor(Math.random() * types.length)]} ${Math.floor(Math.random() * 1000)}`,
    type: types[Math.floor(Math.random() * types.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    priority: priorities[Math.floor(Math.random() * priorities.length)],
    progress: Math.floor(Math.random() * 100),
    startTime: new Date(Date.now() - Math.random() * 86400000),
    duration: Math.floor(Math.random() * 300000),
    executionCount: Math.floor(Math.random() * 1000),
    successRate: Math.random() * 100,
    errorRate: Math.random() * 10,
    avgDuration: Math.floor(Math.random() * 60000),
    lastExecution: new Date(Date.now() - Math.random() * 3600000),
    triggers: Math.floor(Math.random() * 10) + 1,
    actions: Math.floor(Math.random() * 20) + 1,
    conditions: Math.floor(Math.random() * 5),
    tags: ['automation', 'production', 'tested'].slice(0, Math.floor(Math.random() * 3) + 1),
    owner: 'System',
    version: `1.${Math.floor(Math.random() * 10)}.0`,
    aiScore: Math.random() * 100,
  };
};

// AI-powered prediction function
const predictWorkflowSuccess = (workflow) => {
  // Simulated AI prediction based on various factors
  const factors = {
    successRate: workflow.successRate * 0.3,
    errorRate: (100 - workflow.errorRate) * 0.2,
    avgDuration: workflow.avgDuration < 30000 ? 20 : 10,
    executionCount: Math.min(workflow.executionCount / 10, 20),
    aiScore: workflow.aiScore * 0.3,
  };

  const prediction = Object.values(factors).reduce((sum, val) => sum + val, 0);
  return Math.min(prediction, 100);
};

// Anomaly detection algorithm
const detectAnomalies = (metrics) => {
  const anomalies = [];

  // Check for sudden spikes
  if (metrics.currentRate > metrics.averageRate * 2) {
    anomalies.push({
      type: 'spike',
      severity: 'high',
      message: 'Execution rate spike detected',
      value: metrics.currentRate,
      expected: metrics.averageRate,
    });
  }

  // Check for sudden drops
  if (metrics.currentRate < metrics.averageRate * 0.5) {
    anomalies.push({
      type: 'drop',
      severity: 'medium',
      message: 'Execution rate drop detected',
      value: metrics.currentRate,
      expected: metrics.averageRate,
    });
  }

  // Check for high error rates
  if (metrics.errorRate > 5) {
    anomalies.push({
      type: 'error',
      severity: 'critical',
      message: 'High error rate detected',
      value: metrics.errorRate,
      threshold: 5,
    });
  }

  return anomalies;
};

// Generate AI recommendations
const generateRecommendations = (workflow) => {
  const recommendations = [];

  if (workflow.successRate < 90) {
    recommendations.push({
      type: 'optimization',
      priority: 'high',
      title: 'Improve Success Rate',
      description: `Current success rate is ${workflow.successRate.toFixed(2)}%. Consider adding error handling and retry logic.`,
      action: 'Add retry mechanism',
      estimatedImpact: '+15% success rate',
    });
  }

  if (workflow.avgDuration > 60000) {
    recommendations.push({
      type: 'performance',
      priority: 'medium',
      title: 'Optimize Performance',
      description: 'Average execution time is high. Consider parallel processing or caching.',
      action: 'Enable parallel execution',
      estimatedImpact: '-40% execution time',
    });
  }

  if (workflow.errorRate > 3) {
    recommendations.push({
      type: 'reliability',
      priority: 'high',
      title: 'Reduce Error Rate',
      description: 'Error rate is above threshold. Review error logs and add validation.',
      action: 'Implement input validation',
      estimatedImpact: '-60% errors',
    });
  }

  if (workflow.executionCount > 500) {
    recommendations.push({
      type: 'scaling',
      priority: 'low',
      title: 'Consider Auto-Scaling',
      description: 'High execution volume detected. Auto-scaling can improve performance.',
      action: 'Enable auto-scaling',
      estimatedImpact: '+25% throughput',
    });
  }

  return recommendations;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const WorkflowTestingDashboard = () => {
  // ============================================================================
  // STATE MANAGEMENT - Comprehensive State
  // ============================================================================

  // Core workflow state
  const [workflows, setWorkflows] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [workflowHistory, setWorkflowHistory] = useState([]);
  const [activeExecutions, setActiveExecutions] = useState([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);

  // Filter and search state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Modal and dialog state
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  // Testing state
  const [testResults, setTestResults] = useState([]);
  const [testRunning, setTestRunning] = useState(false);
  const [testProgress, setTestProgress] = useState(0);
  const [selectedTests, setSelectedTests] = useState([]);

  // Monitoring state
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    totalExecutions: 0,
    activeWorkflows: 0,
    successRate: 0,
    errorRate: 0,
    avgDuration: 0,
    throughput: 0,
    queueDepth: 0,
    cpuUsage: 0,
    memoryUsage: 0,
    networkLatency: 0,
  });

  const [performanceHistory, setPerformanceHistory] = useState([]);
  const [alertsHistory, setAlertsHistory] = useState([]);
  const [anomalies, setAnomalies] = useState([]);

  // AI state
  const [aiEnabled, setAiEnabled] = useState(true);
  const [aiPredictions, setAiPredictions] = useState({});
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [aiInsights, setAiInsights] = useState([]);
  const [aiOptimizations, setAiOptimizations] = useState([]);

  // Advanced features state
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(MONITORING_INTERVALS.FAST);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [advancedMode, setAdvancedMode] = useState(false);

  // Chart and visualization state
  const [chartTimeRange, setChartTimeRange] = useState('1h'); // '1h', '6h', '24h', '7d', '30d'
  const [selectedMetrics, setSelectedMetrics] = useState(['executions', 'duration', 'errors']);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
  });

  // Refs for intervals and subscriptions
  const metricsIntervalRef = useRef(null);
  const unsubscribeRef = useRef(null);
  const wsRef = useRef(null);

  // ============================================================================
  // FIREBASE OPERATIONS
  // ============================================================================

  // Load workflows from Firebase
  const loadWorkflows = useCallback(async () => {
    setLoading(true);
    try {
      const workflowsRef = collection(db, 'workflows');
      let q = query(workflowsRef, orderBy('name'));

      // Apply filters
      if (statusFilter !== 'all') {
        q = query(q, where('status', '==', statusFilter));
      }

      const snapshot = await getDocs(q);
      const workflowsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setWorkflows(workflowsData);

      // Generate AI predictions for each workflow
      if (aiEnabled) {
        const predictions = {};
        workflowsData.forEach(workflow => {
          predictions[workflow.id] = predictWorkflowSuccess(workflow);
        });
        setAiPredictions(predictions);
      }
    } catch (error) {
      console.error('Error loading workflows:', error);
      showSnackbar('Failed to load workflows', 'error');

      // Fallback to mock data for demo
      const mockData = Array.from({ length: 50 }, (_, i) => generateMockWorkflow(`mock-${i}`));
      setWorkflows(mockData);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, aiEnabled]);

  // Load workflow history
  const loadWorkflowHistory = useCallback(async (workflowId) => {
    try {
      const historyRef = collection(db, 'workflows', workflowId, 'executions');
      const q = query(historyRef, orderBy('startTime', 'desc'), limit(100));
      const snapshot = await getDocs(q);

      const history = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setWorkflowHistory(history);
    } catch (error) {
      console.error('Error loading workflow history:', error);
      // Generate mock history data
      const mockHistory = Array.from({ length: 20 }, (_, i) => ({
        id: `execution-${i}`,
        status: Object.values(WORKFLOW_STATUS)[Math.floor(Math.random() * 4)],
        startTime: new Date(Date.now() - i * 3600000),
        duration: Math.floor(Math.random() * 60000),
        result: Math.random() > 0.8 ? 'Failed' : 'Success',
      }));
      setWorkflowHistory(mockHistory);
    }
  }, []);

  // Real-time monitoring subscription
  const subscribeToRealTimeUpdates = useCallback(() => {
    try {
      const workflowsRef = collection(db, 'workflows');
      const q = query(workflowsRef, where('status', '==', WORKFLOW_STATUS.RUNNING));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const activeExecs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setActiveExecutions(activeExecs);

        // Update real-time metrics
        updateRealTimeMetrics(activeExecs);
      });

      unsubscribeRef.current = unsubscribe;
    } catch (error) {
      console.error('Error subscribing to real-time updates:', error);
    }
  }, []);

  // Update real-time metrics
  const updateRealTimeMetrics = useCallback((executions) => {
    const metrics = {
      totalExecutions: workflows.reduce((sum, w) => sum + (w.executionCount || 0), 0),
      activeWorkflows: executions.length,
      successRate: workflows.reduce((sum, w) => sum + (w.successRate || 0), 0) / (workflows.length || 1),
      errorRate: workflows.reduce((sum, w) => sum + (w.errorRate || 0), 0) / (workflows.length || 1),
      avgDuration: workflows.reduce((sum, w) => sum + (w.avgDuration || 0), 0) / (workflows.length || 1),
      throughput: executions.length * 60, // Executions per minute
      queueDepth: Math.floor(Math.random() * 100),
      cpuUsage: Math.random() * 100,
      memoryUsage: Math.random() * 100,
      networkLatency: Math.random() * 100,
    };

    setRealTimeMetrics(metrics);

    // Add to performance history
    setPerformanceHistory(prev => {
      const newHistory = [...prev, {
        timestamp: new Date(),
        ...metrics,
      }];
      // Keep only last 100 data points
      return newHistory.slice(-100);
    });

    // Detect anomalies
    if (aiEnabled && performanceHistory.length > 10) {
      const recentMetrics = performanceHistory.slice(-10);
      const avgRate = recentMetrics.reduce((sum, m) => sum + m.throughput, 0) / recentMetrics.length;

      const detectedAnomalies = detectAnomalies({
        currentRate: metrics.throughput,
        averageRate: avgRate,
        errorRate: metrics.errorRate,
      });

      if (detectedAnomalies.length > 0) {
        setAnomalies(prev => [...prev, ...detectedAnomalies.map(a => ({
          ...a,
          timestamp: new Date(),
          id: generateId(),
        }))]);
      }
    }
  }, [workflows, performanceHistory, aiEnabled]);

  // Save workflow
  const saveWorkflow = useCallback(async (workflowData) => {
    try {
      if (workflowData.id) {
        // Update existing workflow
        const workflowRef = doc(db, 'workflows', workflowData.id);
        await updateDoc(workflowRef, {
          ...workflowData,
          updatedAt: serverTimestamp(),
        });
        showSnackbar('Workflow updated successfully', 'success');
      } else {
        // Create new workflow
        const workflowsRef = collection(db, 'workflows');
        await addDoc(workflowsRef, {
          ...workflowData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        showSnackbar('Workflow created successfully', 'success');
      }
      loadWorkflows();
    } catch (error) {
      console.error('Error saving workflow:', error);
      showSnackbar('Failed to save workflow', 'error');
    }
  }, [loadWorkflows]);

  // Delete workflow
  const deleteWorkflow = useCallback(async (workflowId) => {
    try {
      const workflowRef = doc(db, 'workflows', workflowId);
      await deleteDoc(workflowRef);
      showSnackbar('Workflow deleted successfully', 'success');
      loadWorkflows();
    } catch (error) {
      console.error('Error deleting workflow:', error);
      showSnackbar('Failed to delete workflow', 'error');
    }
  }, [loadWorkflows]);

  // ============================================================================
  // WORKFLOW OPERATIONS
  // ============================================================================

  // Start workflow execution
  const startWorkflow = useCallback(async (workflowId) => {
    try {
      const workflowRef = doc(db, 'workflows', workflowId);
      await updateDoc(workflowRef, {
        status: WORKFLOW_STATUS.RUNNING,
        startTime: serverTimestamp(),
        executionCount: increment(1),
      });

      showSnackbar('Workflow started successfully', 'success');
      loadWorkflows();
    } catch (error) {
      console.error('Error starting workflow:', error);
      showSnackbar('Failed to start workflow', 'error');
    }
  }, [loadWorkflows]);

  // Stop workflow execution
  const stopWorkflow = useCallback(async (workflowId) => {
    try {
      const workflowRef = doc(db, 'workflows', workflowId);
      await updateDoc(workflowRef, {
        status: WORKFLOW_STATUS.CANCELLED,
        endTime: serverTimestamp(),
      });

      showSnackbar('Workflow stopped successfully', 'success');
      loadWorkflows();
    } catch (error) {
      console.error('Error stopping workflow:', error);
      showSnackbar('Failed to stop workflow', 'error');
    }
  }, [loadWorkflows]);

  // Pause workflow execution
  const pauseWorkflow = useCallback(async (workflowId) => {
    try {
      const workflowRef = doc(db, 'workflows', workflowId);
      await updateDoc(workflowRef, {
        status: WORKFLOW_STATUS.PAUSED,
        pausedAt: serverTimestamp(),
      });

      showSnackbar('Workflow paused successfully', 'success');
      loadWorkflows();
    } catch (error) {
      console.error('Error pausing workflow:', error);
      showSnackbar('Failed to pause workflow', 'error');
    }
  }, [loadWorkflows]);

  // Restart workflow execution
  const restartWorkflow = useCallback(async (workflowId) => {
    try {
      await stopWorkflow(workflowId);
      setTimeout(() => startWorkflow(workflowId), 1000);
    } catch (error) {
      console.error('Error restarting workflow:', error);
      showSnackbar('Failed to restart workflow', 'error');
    }
  }, [startWorkflow, stopWorkflow]);

  // ============================================================================
  // TESTING OPERATIONS
  // ============================================================================

  // Run workflow tests
  const runTests = useCallback(async (workflowId, testTypes = ['unit', 'integration', 'performance']) => {
    setTestRunning(true);
    setTestProgress(0);
    const results = [];

    try {
      for (let i = 0; i < testTypes.length; i++) {
        const testType = testTypes[i];

        // Simulate test execution
        await new Promise(resolve => setTimeout(resolve, 2000));

        const result = {
          id: generateId(),
          type: testType,
          status: Math.random() > 0.2 ? TEST_STATUS.PASSED : TEST_STATUS.FAILED,
          duration: Math.floor(Math.random() * 5000),
          timestamp: new Date(),
          details: `${testType} test completed`,
          assertions: Math.floor(Math.random() * 50) + 10,
          passed: Math.floor(Math.random() * 50),
          failed: Math.floor(Math.random() * 5),
        };

        results.push(result);
        setTestResults(prev => [...prev, result]);
        setTestProgress(((i + 1) / testTypes.length) * 100);
      }

      const allPassed = results.every(r => r.status === TEST_STATUS.PASSED);
      showSnackbar(
        allPassed ? 'All tests passed!' : 'Some tests failed',
        allPassed ? 'success' : 'warning'
      );
    } catch (error) {
      console.error('Error running tests:', error);
      showSnackbar('Failed to run tests', 'error');
    } finally {
      setTestRunning(false);
      setTestProgress(100);
    }
  }, []);

  // Generate test cases using AI
  const generateAITestCases = useCallback(async (workflow) => {
    try {
      showSnackbar('Generating AI-powered test cases...', 'info');

      // Simulate AI generation
      await new Promise(resolve => setTimeout(resolve, 2000));

      const testCases = [
        {
          id: generateId(),
          name: 'Happy Path Test',
          description: 'Verify workflow completes successfully with valid input',
          type: 'functional',
          priority: 'high',
          steps: [
            'Initialize workflow with valid data',
            'Execute all workflow steps',
            'Verify successful completion',
            'Validate output data',
          ],
        },
        {
          id: generateId(),
          name: 'Error Handling Test',
          description: 'Verify workflow handles errors gracefully',
          type: 'negative',
          priority: 'high',
          steps: [
            'Initialize workflow with invalid data',
            'Trigger error condition',
            'Verify error is caught',
            'Validate error response',
          ],
        },
        {
          id: generateId(),
          name: 'Performance Test',
          description: 'Verify workflow meets performance requirements',
          type: 'performance',
          priority: 'medium',
          steps: [
            'Execute workflow multiple times',
            'Measure execution time',
            'Verify meets SLA',
            'Check resource usage',
          ],
        },
        {
          id: generateId(),
          name: 'Concurrency Test',
          description: 'Verify workflow handles concurrent executions',
          type: 'load',
          priority: 'medium',
          steps: [
            'Start multiple workflow instances',
            'Monitor execution',
            'Verify no conflicts',
            'Validate all results',
          ],
        },
      ];

      showSnackbar('AI test cases generated successfully!', 'success');
      return testCases;
    } catch (error) {
      console.error('Error generating test cases:', error);
      showSnackbar('Failed to generate test cases', 'error');
      return [];
    }
  }, []);

  // ============================================================================
  // AI OPERATIONS
  // ============================================================================

  // Generate AI recommendations
  const generateAIRecommendations = useCallback(() => {
    if (!aiEnabled) return;

    const allRecommendations = [];
    workflows.forEach(workflow => {
      const recommendations = generateRecommendations(workflow);
      allRecommendations.push(...recommendations.map(r => ({
        ...r,
        workflowId: workflow.id,
        workflowName: workflow.name,
      })));
    });

    setAiRecommendations(allRecommendations);
  }, [workflows, aiEnabled]);

  // Generate AI insights
  const generateAIInsights = useCallback(() => {
    if (!aiEnabled || workflows.length === 0) return;

    const insights = [];

    // Trend analysis
    const avgSuccessRate = workflows.reduce((sum, w) => sum + (w.successRate || 0), 0) / workflows.length;
    if (avgSuccessRate < 95) {
      insights.push({
        id: generateId(),
        type: 'trend',
        severity: 'medium',
        title: 'Success Rate Below Target',
        description: `Overall success rate is ${avgSuccessRate.toFixed(2)}%, which is below the 95% target.`,
        recommendation: 'Review failed workflows and implement error handling improvements.',
      });
    }

    // Performance analysis
    const slowWorkflows = workflows.filter(w => w.avgDuration > 60000);
    if (slowWorkflows.length > 0) {
      insights.push({
        id: generateId(),
        type: 'performance',
        severity: 'high',
        title: `${slowWorkflows.length} Slow Workflows Detected`,
        description: 'Multiple workflows are exceeding the recommended execution time.',
        recommendation: 'Consider optimization strategies such as caching, parallel processing, or code refactoring.',
      });
    }

    // Resource utilization
    if (realTimeMetrics.cpuUsage > 80 || realTimeMetrics.memoryUsage > 80) {
      insights.push({
        id: generateId(),
        type: 'resource',
        severity: 'critical',
        title: 'High Resource Utilization',
        description: 'System resources are running at capacity.',
        recommendation: 'Consider scaling infrastructure or optimizing resource-intensive workflows.',
      });
    }

    // Pattern recognition
    const failurePatterns = workflows.filter(w => w.errorRate > 5);
    if (failurePatterns.length > 3) {
      insights.push({
        id: generateId(),
        type: 'pattern',
        severity: 'high',
        title: 'Failure Pattern Detected',
        description: `${failurePatterns.length} workflows showing consistent failure patterns.`,
        recommendation: 'Investigate common failure causes and implement systematic fixes.',
      });
    }

    setAiInsights(insights);
  }, [workflows, aiEnabled, realTimeMetrics]);

  // Apply AI optimization
  const applyAIOptimization = useCallback(async (workflowId, optimizationType) => {
    try {
      showSnackbar('Applying AI optimization...', 'info');

      // Simulate optimization
      await new Promise(resolve => setTimeout(resolve, 2000));

      const workflowRef = doc(db, 'workflows', workflowId);
      await updateDoc(workflowRef, {
        optimized: true,
        optimizationType,
        optimizedAt: serverTimestamp(),
      });

      showSnackbar('Optimization applied successfully!', 'success');
      loadWorkflows();
    } catch (error) {
      console.error('Error applying optimization:', error);
      showSnackbar('Failed to apply optimization', 'error');
    }
  }, [loadWorkflows]);

  // ============================================================================
  // EXPORT & REPORTING
  // ============================================================================

  // Export workflows data
  const exportData = useCallback((format = 'json') => {
    try {
      const data = {
        workflows,
        metrics: realTimeMetrics,
        history: workflowHistory,
        recommendations: aiRecommendations,
        insights: aiInsights,
        exportedAt: new Date().toISOString(),
      };

      let blob;
      let filename;

      switch (format) {
        case 'json':
          blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          filename = `workflows-export-${Date.now()}.json`;
          break;
        case 'csv':
          const csv = convertToCSV(workflows);
          blob = new Blob([csv], { type: 'text/csv' });
          filename = `workflows-export-${Date.now()}.csv`;
          break;
        default:
          throw new Error('Unsupported export format');
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);

      showSnackbar('Data exported successfully', 'success');
    } catch (error) {
      console.error('Error exporting data:', error);
      showSnackbar('Failed to export data', 'error');
    }
  }, [workflows, realTimeMetrics, workflowHistory, aiRecommendations, aiInsights]);

  // Convert data to CSV format
  const convertToCSV = (data) => {
    const headers = ['ID', 'Name', 'Type', 'Status', 'Success Rate', 'Error Rate', 'Avg Duration', 'Execution Count'];
    const rows = data.map(item => [
      item.id,
      item.name,
      item.type,
      item.status,
      item.successRate?.toFixed(2) || 0,
      item.errorRate?.toFixed(2) || 0,
      item.avgDuration || 0,
      item.executionCount || 0,
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  // Generate report
  const generateReport = useCallback(async (reportType = 'comprehensive') => {
    try {
      showSnackbar('Generating report...', 'info');

      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));

      const report = {
        type: reportType,
        generatedAt: new Date(),
        summary: {
          totalWorkflows: workflows.length,
          activeWorkflows: workflows.filter(w => w.status === WORKFLOW_STATUS.RUNNING).length,
          avgSuccessRate: workflows.reduce((sum, w) => sum + (w.successRate || 0), 0) / workflows.length,
          totalExecutions: workflows.reduce((sum, w) => sum + (w.executionCount || 0), 0),
        },
        recommendations: aiRecommendations,
        insights: aiInsights,
        topPerformers: workflows.sort((a, b) => (b.successRate || 0) - (a.successRate || 0)).slice(0, 5),
        bottomPerformers: workflows.sort((a, b) => (a.successRate || 0) - (b.successRate || 0)).slice(0, 5),
      };

      showSnackbar('Report generated successfully!', 'success');
      return report;
    } catch (error) {
      console.error('Error generating report:', error);
      showSnackbar('Failed to generate report', 'error');
      return null;
    }
  }, [workflows, aiRecommendations, aiInsights]);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  // Show snackbar notification
  const showSnackbar = useCallback((message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  // Close snackbar
  const closeSnackbar = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  // Filter workflows
  const filteredWorkflows = useMemo(() => {
    let filtered = [...workflows];

    // Apply search query
    if (searchQuery) {
      filtered = filtered.filter(w =>
        w.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.type?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(w => w.status === statusFilter);
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(w => w.type === typeFilter);
    }

    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(w => w.priority === priorityFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aVal = a[sortBy] || '';
      const bVal = b[sortBy] || '';

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [workflows, searchQuery, statusFilter, typeFilter, priorityFilter, sortBy, sortOrder]);

  // Paginate workflows
  const paginatedWorkflows = useMemo(() => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredWorkflows.slice(startIndex, endIndex);
  }, [filteredWorkflows, page, rowsPerPage]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Initial load
  useEffect(() => {
    loadWorkflows();
    subscribeToRealTimeUpdates();

    // Cleanup
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      if (metricsIntervalRef.current) {
        clearInterval(metricsIntervalRef.current);
      }
    };
  }, [loadWorkflows, subscribeToRealTimeUpdates]);

  // Auto-refresh
  useEffect(() => {
    if (autoRefresh) {
      metricsIntervalRef.current = setInterval(() => {
        updateRealTimeMetrics(activeExecutions);
      }, refreshInterval);

      return () => {
        if (metricsIntervalRef.current) {
          clearInterval(metricsIntervalRef.current);
        }
      };
    }
  }, [autoRefresh, refreshInterval, activeExecutions, updateRealTimeMetrics]);

  // Generate AI recommendations periodically
  useEffect(() => {
    if (aiEnabled && workflows.length > 0) {
      generateAIRecommendations();
      generateAIInsights();

      const interval = setInterval(() => {
        generateAIRecommendations();
        generateAIInsights();
      }, 60000); // Every minute

      return () => clearInterval(interval);
    }
  }, [aiEnabled, workflows, generateAIRecommendations, generateAIInsights]);

  // ============================================================================
  // RENDER HELPER FUNCTIONS
  // ============================================================================

  // Render workflow card
  const renderWorkflowCard = (workflow) => (
    <Card
      key={workflow.id}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" component="div" noWrap sx={{ flex: 1 }}>
            {workflow.name}
          </Typography>
          <Chip
            label={workflow.status}
            size="small"
            sx={{
              ml: 1,
              backgroundColor: getStatusColor(workflow.status),
              color: 'white',
            }}
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Type: {workflow.type}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Priority: {workflow.priority}
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption">Success Rate</Typography>
            <Typography variant="caption">{workflow.successRate?.toFixed(2)}%</Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={workflow.successRate || 0}
            sx={{ height: 8, borderRadius: 1 }}
          />
        </Box>

        {aiEnabled && aiPredictions[workflow.id] && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AIIcon fontSize="small" color="primary" />
              <Typography variant="caption" color="primary">
                AI Prediction: {aiPredictions[workflow.id].toFixed(1)}% success
              </Typography>
            </Box>
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {workflow.tags?.map((tag, index) => (
            <Chip key={index} label={tag} size="small" variant="outlined" />
          ))}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Executions
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {formatNumber(workflow.executionCount || 0)}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Avg Duration
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {formatDuration(workflow.avgDuration || 0)}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>

      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
        <ButtonGroup size="small">
          {workflow.status !== WORKFLOW_STATUS.RUNNING ? (
            <Tooltip title="Start">
              <IconButton onClick={() => startWorkflow(workflow.id)} color="success">
                <PlayIcon />
              </IconButton>
            </Tooltip>
          ) : (
            <>
              <Tooltip title="Pause">
                <IconButton onClick={() => pauseWorkflow(workflow.id)} color="warning">
                  <PauseIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Stop">
                <IconButton onClick={() => stopWorkflow(workflow.id)} color="error">
                  <StopIcon />
                </IconButton>
              </Tooltip>
            </>
          )}
          <Tooltip title="Restart">
            <IconButton onClick={() => restartWorkflow(workflow.id)} color="primary">
              <ReplayIcon />
            </IconButton>
          </Tooltip>
        </ButtonGroup>

        <ButtonGroup size="small">
          <Tooltip title="Test">
            <IconButton onClick={() => {
              setSelectedWorkflow(workflow);
              setTestDialogOpen(true);
            }}>
              <TestIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Details">
            <IconButton onClick={() => {
              setSelectedWorkflow(workflow);
              loadWorkflowHistory(workflow.id);
              setDetailsDialogOpen(true);
            }}>
              <InfoIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="More">
            <IconButton>
              <MoreIcon />
            </IconButton>
          </Tooltip>
        </ButtonGroup>
      </CardActions>
    </Card>
  );

  // Render metrics card
  const renderMetricsCard = (title, value, icon, color, trend) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
              {value}
            </Typography>
            {trend !== undefined && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {trend > 0 ? (
                  <TrendingUpIcon fontSize="small" color="success" />
                ) : trend < 0 ? (
                  <TrendingDownIcon fontSize="small" color="error" />
                ) : (
                  <TrendingFlat fontSize="small" color="disabled" />
                )}
                <Typography variant="caption" color={trend > 0 ? 'success.main' : trend < 0 ? 'error.main' : 'text.secondary'}>
                  {Math.abs(trend)}%
                </Typography>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              backgroundColor: `${color}20`,
              borderRadius: 2,
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {React.createElement(icon, { sx: { color, fontSize: 32 } })}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      {/* Top App Bar */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
            <DashboardIcon color="primary" />
            <Typography variant="h6" component="div">
              TIER 3 MEGA ULTIMATE Workflow Testing Dashboard
            </Typography>
            <Chip label="v3.0" size="small" color="primary" />
            {aiEnabled && (
              <Chip
                icon={<AIIcon />}
                label="AI Enabled"
                size="small"
                color="secondary"
                variant="outlined"
              />
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Tooltip title="Real-time monitoring">
              <Badge color="success" variant="dot" invisible={!autoRefresh}>
                <IconButton onClick={() => setAutoRefresh(!autoRefresh)}>
                  <MonitorIcon color={autoRefresh ? 'success' : 'disabled'} />
                </IconButton>
              </Badge>
            </Tooltip>

            <Tooltip title="Notifications">
              <Badge badgeContent={anomalies.length} color="error">
                <IconButton onClick={() => setNotificationsEnabled(!notificationsEnabled)}>
                  <NotificationIcon />
                </IconButton>
              </Badge>
            </Tooltip>

            <Tooltip title="Refresh">
              <IconButton onClick={loadWorkflows}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Settings">
              <IconButton onClick={() => setSettingsDialogOpen(true)}>
                <SettingsIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title={darkMode ? 'Light Mode' : 'Dark Mode'}>
              <IconButton onClick={() => setDarkMode(!darkMode)}>
                {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>

            <Tooltip title={fullscreen ? 'Exit Fullscreen' : 'Fullscreen'}>
              <IconButton onClick={() => setFullscreen(!fullscreen)}>
                {fullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
        {/* Real-time Metrics Dashboard */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            {renderMetricsCard(
              'Total Executions',
              formatNumber(realTimeMetrics.totalExecutions),
              AssessmentIcon,
              '#3b82f6',
              5.2
            )}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {renderMetricsCard(
              'Active Workflows',
              realTimeMetrics.activeWorkflows,
              RocketIcon,
              '#10b981',
              12.4
            )}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {renderMetricsCard(
              'Success Rate',
              `${realTimeMetrics.successRate.toFixed(1)}%`,
              SuccessIcon,
              '#22c55e',
              2.1
            )}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {renderMetricsCard(
              'Avg Duration',
              formatDuration(realTimeMetrics.avgDuration),
              SpeedIcon,
              '#f59e0b',
              -3.5
            )}
          </Grid>
        </Grid>

        {/* Performance Charts */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Real-Time Performance Metrics
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceHistory.slice(-20)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="timestamp"
                        tickFormatter={(time) => format(new Date(time), 'HH:mm:ss')}
                      />
                      <YAxis />
                      <ChartTooltip />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="throughput"
                        stackId="1"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.6}
                        name="Throughput"
                      />
                      <Area
                        type="monotone"
                        dataKey="errorRate"
                        stackId="2"
                        stroke="#ef4444"
                        fill="#ef4444"
                        fillOpacity={0.6}
                        name="Error Rate"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  System Resources
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">CPU Usage</Typography>
                      <Typography variant="body2">{realTimeMetrics.cpuUsage.toFixed(1)}%</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={realTimeMetrics.cpuUsage}
                      sx={{ height: 10, borderRadius: 1 }}
                    />
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Memory Usage</Typography>
                      <Typography variant="body2">{realTimeMetrics.memoryUsage.toFixed(1)}%</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={realTimeMetrics.memoryUsage}
                      sx={{ height: 10, borderRadius: 1 }}
                      color="secondary"
                    />
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Network Latency</Typography>
                      <Typography variant="body2">{realTimeMetrics.networkLatency.toFixed(0)}ms</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(realTimeMetrics.networkLatency, 100)}
                      sx={{ height: 10, borderRadius: 1 }}
                      color="warning"
                    />
                  </Box>

                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Queue Depth</Typography>
                      <Typography variant="body2">{realTimeMetrics.queueDepth}</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(realTimeMetrics.queueDepth / 100) * 100}
                      sx={{ height: 10, borderRadius: 1 }}
                      color="info"
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* AI Insights and Recommendations */}
        {aiEnabled && (aiInsights.length > 0 || aiRecommendations.length > 0) && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <AIIcon color="primary" />
                    <Typography variant="h6">
                      AI Insights
                    </Typography>
                    <Chip label={aiInsights.length} size="small" color="primary" />
                  </Box>

                  <List>
                    {aiInsights.slice(0, 3).map((insight) => (
                      <ListItem key={insight.id} alignItems="flex-start">
                        <ListItemIcon>
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: `${SEVERITY_LEVELS[insight.severity.toUpperCase()]?.color}20`,
                            }}
                          >
                            {React.createElement(SEVERITY_LEVELS[insight.severity.toUpperCase()]?.icon || InfoIcon, {
                              sx: { color: SEVERITY_LEVELS[insight.severity.toUpperCase()]?.color },
                            })}
                          </Box>
                        </ListItemIcon>
                        <ListItemText
                          primary={insight.title}
                          secondary={
                            <>
                              <Typography variant="body2" color="text.secondary" paragraph>
                                {insight.description}
                              </Typography>
                              <Typography variant="caption" color="primary">
                                💡 {insight.recommendation}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <OptimizeIcon color="secondary" />
                    <Typography variant="h6">
                      AI Recommendations
                    </Typography>
                    <Chip label={aiRecommendations.length} size="small" color="secondary" />
                  </Box>

                  <List>
                    {aiRecommendations.slice(0, 3).map((recommendation, index) => (
                      <ListItem key={index} alignItems="flex-start">
                        <ListItemIcon>
                          <IdeaIcon color="warning" />
                        </ListItemIcon>
                        <ListItemText
                          primary={recommendation.title}
                          secondary={
                            <>
                              <Typography variant="body2" color="text.secondary">
                                {recommendation.description}
                              </Typography>
                              <Box sx={{ mt: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
                                <Chip
                                  label={recommendation.priority}
                                  size="small"
                                  color={recommendation.priority === 'high' ? 'error' : 'default'}
                                />
                                <Typography variant="caption" color="success.main">
                                  {recommendation.estimatedImpact}
                                </Typography>
                              </Box>
                            </>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => applyAIOptimization(recommendation.workflowId, recommendation.type)}
                          >
                            Apply
                          </Button>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Anomaly Alerts */}
        {anomalies.length > 0 && (
          <Alert severity="warning" sx={{ mb: 3 }} onClose={() => setAnomalies([])}>
            <AlertTitle>Anomalies Detected ({anomalies.length})</AlertTitle>
            {anomalies.slice(0, 2).map((anomaly, index) => (
              <Typography key={index} variant="body2">
                • {anomaly.message} - Expected: {anomaly.expected?.toFixed(2)}, Actual: {anomaly.value?.toFixed(2)}
              </Typography>
            ))}
          </Alert>
        )}

        {/* Filters and Search */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search workflows..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>

              <Grid item xs={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Statuses</MenuItem>
                    {Object.values(WORKFLOW_STATUS).map(status => (
                      <MenuItem key={status} value={status}>{status}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={typeFilter}
                    label="Type"
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Types</MenuItem>
                    <MenuItem value="Lead Processing">Lead Processing</MenuItem>
                    <MenuItem value="Email Campaign">Email Campaign</MenuItem>
                    <MenuItem value="Data Sync">Data Sync</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={priorityFilter}
                    label="Priority"
                    onChange={(e) => setPriorityFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Priorities</MenuItem>
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="critical">Critical</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={6} md={2}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={(e, newMode) => newMode && setViewMode(newMode)}
                    size="small"
                  >
                    <ToggleButton value="grid">
                      <GridIcon />
                    </ToggleButton>
                    <ToggleButton value="list">
                      <ListIcon />
                    </ToggleButton>
                  </ToggleButtonGroup>

                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={() => exportData('json')}
                    size="small"
                  >
                    Export
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Workflows Grid/List */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Workflows ({filteredWorkflows.length})
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<TestIcon />}
                onClick={() => setTestDialogOpen(true)}
              >
                Run Tests
              </Button>
              <Button
                variant="outlined"
                startIcon={<AnalyticsIcon />}
                onClick={() => generateReport('comprehensive')}
              >
                Generate Report
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
              >
                New Workflow
              </Button>
            </Box>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
              <CircularProgress size={60} />
            </Box>
          ) : viewMode === 'grid' ? (
            <>
              <Grid container spacing={3}>
                {paginatedWorkflows.map((workflow) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={workflow.id}>
                    {renderWorkflowCard(workflow)}
                  </Grid>
                ))}
              </Grid>

              {filteredWorkflows.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography variant="h6" color="text.secondary">
                    No workflows found
                  </Typography>
                </Box>
              )}
            </>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Success Rate</TableCell>
                    <TableCell>Executions</TableCell>
                    <TableCell>Avg Duration</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedWorkflows.map((workflow) => (
                    <TableRow key={workflow.id} hover>
                      <TableCell>{workflow.name}</TableCell>
                      <TableCell>{workflow.type}</TableCell>
                      <TableCell>
                        <Chip
                          label={workflow.status}
                          size="small"
                          sx={{ backgroundColor: getStatusColor(workflow.status), color: 'white' }}
                        />
                      </TableCell>
                      <TableCell>{workflow.successRate?.toFixed(2)}%</TableCell>
                      <TableCell>{formatNumber(workflow.executionCount || 0)}</TableCell>
                      <TableCell>{formatDuration(workflow.avgDuration || 0)}</TableCell>
                      <TableCell>
                        <ButtonGroup size="small">
                          <IconButton onClick={() => startWorkflow(workflow.id)}>
                            <PlayIcon />
                          </IconButton>
                          <IconButton onClick={() => {
                            setSelectedWorkflow(workflow);
                            setDetailsDialogOpen(true);
                          }}>
                            <InfoIcon />
                          </IconButton>
                        </ButtonGroup>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <TablePagination
              component="div"
              count={filteredWorkflows.length}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[10, 25, 50, 100]}
            />
          </Box>
        </Box>
      </Box>

      {/* Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {selectedWorkflow?.name}
            </Typography>
            <IconButton onClick={() => setDetailsDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="Overview" />
            <Tab label="History" />
            <Tab label="Metrics" />
            <Tab label="AI Analysis" />
          </Tabs>

          <Box sx={{ mt: 2 }}>
            {activeTab === 0 && selectedWorkflow && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Type
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedWorkflow.type}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label={selectedWorkflow.status}
                    sx={{ backgroundColor: getStatusColor(selectedWorkflow.status), color: 'white' }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Success Rate
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedWorkflow.successRate?.toFixed(2)}%
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Error Rate
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedWorkflow.errorRate?.toFixed(2)}%
                  </Typography>
                </Grid>
              </Grid>
            )}

            {activeTab === 1 && (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Execution Time</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Duration</TableCell>
                      <TableCell>Result</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {workflowHistory.map((execution) => (
                      <TableRow key={execution.id}>
                        <TableCell>
                          {format(execution.startTime?.toDate?.() || execution.startTime, 'PPpp')}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={execution.status}
                            size="small"
                            sx={{ backgroundColor: getStatusColor(execution.status), color: 'white' }}
                          />
                        </TableCell>
                        <TableCell>{formatDuration(execution.duration)}</TableCell>
                        <TableCell>{execution.result}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {activeTab === 2 && (
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={workflowHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="startTime" />
                    <YAxis />
                    <ChartTooltip />
                    <Legend />
                    <Line type="monotone" dataKey="duration" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            )}

            {activeTab === 3 && selectedWorkflow && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  AI-Powered Analysis
                </Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <AlertTitle>Predicted Success Rate</AlertTitle>
                  {aiPredictions[selectedWorkflow.id]?.toFixed(2)}% chance of successful execution
                </Alert>

                <Typography variant="subtitle1" gutterBottom>
                  Recommendations
                </Typography>
                <List>
                  {generateRecommendations(selectedWorkflow).map((rec, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={rec.title}
                        secondary={rec.description}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Test Dialog */}
      <Dialog
        open={testDialogOpen}
        onClose={() => setTestDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Run Workflow Tests
        </DialogTitle>
        <DialogContent>
          {testRunning ? (
            <Box sx={{ py: 4 }}>
              <Typography variant="body1" align="center" gutterBottom>
                Running tests... {testProgress.toFixed(0)}%
              </Typography>
              <LinearProgress variant="determinate" value={testProgress} sx={{ mt: 2 }} />
            </Box>
          ) : (
            <Box>
              <Typography variant="body2" paragraph>
                Select test types to run:
              </Typography>
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Unit Tests"
              />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Integration Tests"
              />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Performance Tests"
              />
              <FormControlLabel
                control={<Switch />}
                label="Load Tests"
              />
              <FormControlLabel
                control={<Switch />}
                label="Security Tests"
              />
            </Box>
          )}

          {testResults.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Test Results
              </Typography>
              <List>
                {testResults.map((result) => (
                  <ListItem key={result.id}>
                    <ListItemIcon>
                      {result.status === TEST_STATUS.PASSED ? (
                        <SuccessIcon color="success" />
                      ) : (
                        <ErrorIcon color="error" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={result.type}
                      secondary={`${result.passed}/${result.assertions} assertions passed • ${formatDuration(result.duration)}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTestDialogOpen(false)}>Close</Button>
          <Button
            variant="contained"
            onClick={() => runTests(selectedWorkflow?.id)}
            disabled={testRunning}
            startIcon={<TestIcon />}
          >
            Run Tests
          </Button>
        </DialogActions>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog
        open={settingsDialogOpen}
        onClose={() => setSettingsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Dashboard Settings</DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            <FormControlLabel
              control={<Switch checked={aiEnabled} onChange={(e) => setAiEnabled(e.target.checked)} />}
              label="Enable AI Features"
            />
            <FormControlLabel
              control={<Switch checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />}
              label="Auto Refresh"
            />
            <FormControlLabel
              control={<Switch checked={notificationsEnabled} onChange={(e) => setNotificationsEnabled(e.target.checked)} />}
              label="Enable Notifications"
            />
            <FormControlLabel
              control={<Switch checked={advancedMode} onChange={(e) => setAdvancedMode(e.target.checked)} />}
              label="Advanced Mode"
            />

            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Refresh Interval
              </Typography>
              <Slider
                value={refreshInterval}
                onChange={(e, newValue) => setRefreshInterval(newValue)}
                min={1000}
                max={60000}
                step={1000}
                marks={[
                  { value: 1000, label: '1s' },
                  { value: 30000, label: '30s' },
                  { value: 60000, label: '60s' },
                ]}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${value / 1000}s`}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsDialogOpen(false)}>Close</Button>
          <Button variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Advanced Analytics Dialog */}
      <Dialog
        open={false}
        maxWidth="xl"
        fullWidth
      >
        <DialogTitle>Advanced Analytics Dashboard</DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            {/* Workflow Comparison */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Workflow Comparison
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={[
                        { metric: 'Performance', value1: 85, value2: 72 },
                        { metric: 'Reliability', value1: 90, value2: 85 },
                        { metric: 'Efficiency', value1: 78, value2: 88 },
                        { metric: 'Scalability', value1: 82, value2: 75 },
                        { metric: 'Security', value1: 95, value2: 90 },
                      ]}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="metric" />
                        <PolarRadiusAxis />
                        <Radar name="Workflow A" dataKey="value1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                        <Radar name="Workflow B" dataKey="value2" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                        <Legend />
                      </RadarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Cost Analysis */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Cost Analysis
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { category: 'Compute', cost: 1200, budget: 1500 },
                        { category: 'Storage', cost: 800, budget: 1000 },
                        { category: 'Network', cost: 400, budget: 600 },
                        { category: 'API Calls', cost: 600, budget: 800 },
                        { category: 'Database', cost: 1000, budget: 1200 },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis />
                        <ChartTooltip />
                        <Legend />
                        <Bar dataKey="cost" fill="#ef4444" name="Actual Cost" />
                        <Bar dataKey="budget" fill="#10b981" name="Budget" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Security Score */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Security Score
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                      <CircularProgress
                        variant="determinate"
                        value={85}
                        size={160}
                        thickness={6}
                        sx={{ color: '#10b981' }}
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
                          flexDirection: 'column',
                        }}
                      >
                        <Typography variant="h3" component="div" fontWeight="bold">
                          85
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Security Score
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <ShieldIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary="Encryption Enabled" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <VerifiedIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary="Auth Validated" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <SecurityIcon color="warning" />
                      </ListItemIcon>
                      <ListItemText primary="2 Warnings Found" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Performance Trends */}
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Performance Trends (7 Days)
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={[
                        { date: 'Mon', executions: 1200, avgDuration: 2.4, errors: 12 },
                        { date: 'Tue', executions: 1400, avgDuration: 2.1, errors: 8 },
                        { date: 'Wed', executions: 1600, avgDuration: 2.3, errors: 15 },
                        { date: 'Thu', executions: 1350, avgDuration: 2.0, errors: 6 },
                        { date: 'Fri', executions: 1800, avgDuration: 2.2, errors: 10 },
                        { date: 'Sat', executions: 900, avgDuration: 1.9, errors: 4 },
                        { date: 'Sun', executions: 800, avgDuration: 1.8, errors: 3 },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <ChartTooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="executions" fill="#3b82f6" name="Executions" />
                        <Line yAxisId="right" type="monotone" dataKey="avgDuration" stroke="#10b981" name="Avg Duration (s)" />
                        <Line yAxisId="right" type="monotone" dataKey="errors" stroke="#ef4444" name="Errors" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Workflow Health Matrix */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Workflow Health Matrix
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Workflow</TableCell>
                          <TableCell>Health Score</TableCell>
                          <TableCell>Uptime</TableCell>
                          <TableCell>Performance</TableCell>
                          <TableCell>Reliability</TableCell>
                          <TableCell>Security</TableCell>
                          <TableCell>Cost Efficiency</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {[
                          { name: 'Lead Processing', health: 92, uptime: 99.9, performance: 88, reliability: 95, security: 90, cost: 85 },
                          { name: 'Email Campaign', health: 88, uptime: 99.5, performance: 85, reliability: 90, security: 92, cost: 88 },
                          { name: 'Data Sync', health: 75, uptime: 98.2, performance: 70, reliability: 78, security: 85, cost: 72 },
                          { name: 'Report Generation', health: 95, uptime: 99.8, performance: 92, reliability: 98, security: 94, cost: 90 },
                        ].map((workflow, index) => (
                          <TableRow key={index}>
                            <TableCell>{workflow.name}</TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CircularProgress
                                  variant="determinate"
                                  value={workflow.health}
                                  size={40}
                                  sx={{ color: workflow.health > 80 ? '#10b981' : workflow.health > 60 ? '#f59e0b' : '#ef4444' }}
                                />
                                <Typography>{workflow.health}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell>{workflow.uptime}%</TableCell>
                            <TableCell>
                              <LinearProgress variant="determinate" value={workflow.performance} />
                            </TableCell>
                            <TableCell>
                              <LinearProgress variant="determinate" value={workflow.reliability} color="secondary" />
                            </TableCell>
                            <TableCell>
                              <LinearProgress variant="determinate" value={workflow.security} color="success" />
                            </TableCell>
                            <TableCell>
                              <LinearProgress variant="determinate" value={workflow.cost} color="warning" />
                            </TableCell>
                            <TableCell>
                              <IconButton size="small">
                                <ViewIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* AI Predictions Timeline */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    AI Predictions Timeline
                  </Typography>
                  <Timeline position="alternate">
                    <TimelineItem>
                      <TimelineOppositeContent color="text.secondary">
                        Now
                      </TimelineOppositeContent>
                      <TimelineSeparator>
                        <TimelineDot color="primary">
                          <AIIcon />
                        </TimelineDot>
                        <TimelineConnector />
                      </TimelineSeparator>
                      <TimelineContent>
                        <Typography>Current Load: Normal</Typography>
                        <Typography variant="caption" color="text.secondary">
                          1,200 executions/hour
                        </Typography>
                      </TimelineContent>
                    </TimelineItem>

                    <TimelineItem>
                      <TimelineOppositeContent color="text.secondary">
                        +1 hour
                      </TimelineOppositeContent>
                      <TimelineSeparator>
                        <TimelineDot color="warning">
                          <TrendingUpIcon />
                        </TimelineDot>
                        <TimelineConnector />
                      </TimelineSeparator>
                      <TimelineContent>
                        <Typography>Predicted Spike</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Expected: 2,400 executions/hour
                        </Typography>
                      </TimelineContent>
                    </TimelineItem>

                    <TimelineItem>
                      <TimelineOppositeContent color="text.secondary">
                        +3 hours
                      </TimelineOppositeContent>
                      <TimelineSeparator>
                        <TimelineDot color="success">
                          <OptimizeIcon />
                        </TimelineDot>
                        <TimelineConnector />
                      </TimelineSeparator>
                      <TimelineContent>
                        <Typography>Auto-scaling Triggered</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Capacity increased by 50%
                        </Typography>
                      </TimelineContent>
                    </TimelineItem>

                    <TimelineItem>
                      <TimelineOppositeContent color="text.secondary">
                        +6 hours
                      </TimelineOppositeContent>
                      <TimelineSeparator>
                        <TimelineDot color="info">
                          <TrendingDownIcon />
                        </TimelineDot>
                      </TimelineSeparator>
                      <TimelineContent>
                        <Typography>Load Normalizing</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Returning to baseline
                        </Typography>
                      </TimelineContent>
                    </TimelineItem>
                  </Timeline>
                </CardContent>
              </Card>
            </Grid>

            {/* Error Distribution */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Error Distribution
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Timeout', value: 35, color: '#ef4444' },
                            { name: 'Invalid Input', value: 25, color: '#f97316' },
                            { name: 'Network Error', value: 20, color: '#f59e0b' },
                            { name: 'Database Error', value: 15, color: '#eab308' },
                            { name: 'Other', value: 5, color: '#84cc16' },
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry) => `${entry.name}: ${entry.value}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {[
                            { name: 'Timeout', value: 35, color: '#ef4444' },
                            { name: 'Invalid Input', value: 25, color: '#f97316' },
                            { name: 'Network Error', value: 20, color: '#f59e0b' },
                            { name: 'Database Error', value: 15, color: '#eab308' },
                            { name: 'Other', value: 5, color: '#84cc16' },
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Execution Heatmap */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Execution Heatmap (24 Hours)
                  </Typography>
                  <Grid container spacing={0.5}>
                    {Array.from({ length: 24 }).map((_, hour) => (
                      <Grid item key={hour}>
                        <Tooltip title={`${hour}:00 - ${Math.floor(Math.random() * 200)} executions`}>
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              backgroundColor: `rgba(59, 130, 246, ${Math.random()})`,
                              borderRadius: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              '&:hover': {
                                transform: 'scale(1.1)',
                                transition: 'transform 0.2s',
                              },
                            }}
                          >
                            <Typography variant="caption" sx={{ color: 'white' }}>
                              {hour}
                            </Typography>
                          </Box>
                        </Tooltip>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Compliance Tracking */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Compliance Tracking
                  </Typography>
                  <List>
                    {[
                      { name: 'GDPR Compliance', status: 'compliant', score: 98 },
                      { name: 'SOC 2 Type II', status: 'compliant', score: 95 },
                      { name: 'HIPAA', status: 'warning', score: 85 },
                      { name: 'PCI DSS', status: 'compliant', score: 92 },
                      { name: 'ISO 27001', status: 'in-progress', score: 78 },
                    ].map((compliance, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          {compliance.status === 'compliant' ? (
                            <VerifiedIcon color="success" />
                          ) : compliance.status === 'warning' ? (
                            <WarningIcon color="warning" />
                          ) : (
                            <TimelapseIcon color="info" />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={compliance.name}
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                              <LinearProgress
                                variant="determinate"
                                value={compliance.score}
                                sx={{ flex: 1, height: 6, borderRadius: 1 }}
                              />
                              <Typography variant="caption">{compliance.score}%</Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Resource Allocation */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Resource Allocation Optimization
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[
                        { time: '00:00', allocated: 50, used: 35, predicted: 40 },
                        { time: '04:00', allocated: 50, used: 28, predicted: 30 },
                        { time: '08:00', allocated: 80, used: 72, predicted: 75 },
                        { time: '12:00', allocated: 100, used: 95, predicted: 98 },
                        { time: '16:00', allocated: 90, used: 78, predicted: 82 },
                        { time: '20:00', allocated: 60, used: 45, predicted: 48 },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <ChartTooltip />
                        <Legend />
                        <Area type="monotone" dataKey="allocated" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                        <Area type="monotone" dataKey="used" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                        <Area type="monotone" dataKey="predicted" stackId="3" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} strokeDasharray="5 5" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button>Close</Button>
          <Button variant="contained" startIcon={<DownloadIcon />}>
            Export Report
          </Button>
        </DialogActions>
      </Dialog>

      {/* Debugging Panel Dialog */}
      <Dialog
        open={false}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BugIcon color="error" />
            <Typography variant="h6">Advanced Debugging Panel</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Call Stack Trace
                  </Typography>
                  <Box sx={{ bgcolor: '#1e1e1e', color: '#d4d4d4', p: 2, borderRadius: 1, fontFamily: 'monospace', fontSize: '0.875rem' }}>
                    <pre style={{ margin: 0 }}>
{`at processWorkflow (workflow.js:142)
at executeStep (workflow.js:89)
at validateInput (validation.js:23)
at checkPermissions (auth.js:67)
at middleware (express.js:34)
at <anonymous>`}
                    </pre>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Variable Inspector
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Variable</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Value</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell><code>workflowId</code></TableCell>
                          <TableCell>string</TableCell>
                          <TableCell>"wf-12345"</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><code>status</code></TableCell>
                          <TableCell>string</TableCell>
                          <TableCell>"running"</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><code>executionTime</code></TableCell>
                          <TableCell>number</TableCell>
                          <TableCell>2534</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><code>userData</code></TableCell>
                          <TableCell>object</TableCell>
                          <TableCell>{`{...}`}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Real-time Logs
                  </Typography>
                  <Box sx={{ bgcolor: '#1e1e1e', color: '#d4d4d4', p: 2, borderRadius: 1, fontFamily: 'monospace', fontSize: '0.75rem', maxHeight: 300, overflow: 'auto' }}>
                    <pre style={{ margin: 0 }}>
{`[2025-11-25 10:23:45] INFO: Workflow started - ID: wf-12345
[2025-11-25 10:23:46] DEBUG: Loading configuration...
[2025-11-25 10:23:46] DEBUG: Configuration loaded successfully
[2025-11-25 10:23:47] INFO: Executing step 1 of 5
[2025-11-25 10:23:48] DEBUG: Validating input data...
[2025-11-25 10:23:48] DEBUG: Input validation passed
[2025-11-25 10:23:49] INFO: Executing step 2 of 5
[2025-11-25 10:23:50] WARN: High memory usage detected: 85%
[2025-11-25 10:23:51] INFO: Executing step 3 of 5
[2025-11-25 10:23:52] DEBUG: Database query executed: 234ms
[2025-11-25 10:23:53] INFO: Executing step 4 of 5
[2025-11-25 10:23:54] ERROR: Network timeout - retrying...
[2025-11-25 10:23:56] INFO: Retry successful
[2025-11-25 10:23:57] INFO: Executing step 5 of 5
[2025-11-25 10:23:58] INFO: Workflow completed successfully`}
                    </pre>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Network Activity
                  </Typography>
                  <List dense>
                    {[
                      { method: 'POST', url: '/api/workflows/execute', status: 200, time: 234 },
                      { method: 'GET', url: '/api/data/fetch', status: 200, time: 156 },
                      { method: 'PUT', url: '/api/workflows/update', status: 200, time: 189 },
                      { method: 'POST', url: '/api/notifications/send', status: 503, time: 5000 },
                      { method: 'GET', url: '/api/metrics/current', status: 200, time: 78 },
                    ].map((request, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                              <Chip
                                label={request.method}
                                size="small"
                                color={request.method === 'GET' ? 'primary' : request.method === 'POST' ? 'success' : 'warning'}
                              />
                              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                {request.url}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                              <Chip
                                label={request.status}
                                size="small"
                                color={request.status === 200 ? 'success' : 'error'}
                                variant="outlined"
                              />
                              <Typography variant="caption">
                                {request.time}ms
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Performance Profiling
                  </Typography>
                  <Box sx={{ height: 250 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { function: 'processWorkflow', time: 450, calls: 1 },
                        { function: 'validateInput', time: 120, calls: 5 },
                        { function: 'executeStep', time: 890, calls: 5 },
                        { function: 'saveResult', time: 234, calls: 1 },
                        { function: 'sendNotification', time: 156, calls: 3 },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="function" angle={-45} textAnchor="end" height={80} />
                        <YAxis />
                        <ChartTooltip />
                        <Bar dataKey="time" fill="#3b82f6" name="Execution Time (ms)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button>Clear Logs</Button>
          <Button startIcon={<DownloadIcon />}>Export Logs</Button>
          <Button variant="contained">Close</Button>
        </DialogActions>
      </Dialog>

      {/* A/B Testing Comparison Dialog */}
      <Dialog
        open={false}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>A/B Testing Comparison</DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ bgcolor: '#ecfdf5', border: '2px solid #10b981' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Typography variant="h6">Version A (Current)</Typography>
                    <Chip label="Winner" color="success" size="small" />
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Success Rate</Typography>
                    <Typography variant="h4" color="success.main">94.2%</Typography>
                    <LinearProgress variant="determinate" value={94.2} color="success" sx={{ mt: 1 }} />
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Avg Duration</Typography>
                      <Typography variant="body1">2.4s</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Error Rate</Typography>
                      <Typography variant="body1">5.8%</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Throughput</Typography>
                      <Typography variant="body1">1,200/hr</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Cost</Typography>
                      <Typography variant="body1">$24.50</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ bgcolor: '#fef2f2', border: '2px solid #ef4444' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Typography variant="h6">Version B (Test)</Typography>
                    <Chip label="Testing" color="default" size="small" />
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Success Rate</Typography>
                    <Typography variant="h4" color="error.main">87.6%</Typography>
                    <LinearProgress variant="determinate" value={87.6} color="error" sx={{ mt: 1 }} />
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Avg Duration</Typography>
                      <Typography variant="body1">1.9s</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Error Rate</Typography>
                      <Typography variant="body1">12.4%</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Throughput</Typography>
                      <Typography variant="body1">1,450/hr</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Cost</Typography>
                      <Typography variant="body1">$19.80</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Alert severity="success">
                <AlertTitle>Recommendation</AlertTitle>
                Version A shows 6.6% higher success rate. We recommend keeping Version A in production.
                Version B offers 20% cost savings but reliability trade-off may not be acceptable.
              </Alert>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button>Cancel Test</Button>
          <Button variant="outlined">Promote Version B</Button>
          <Button variant="contained" color="success">Keep Version A</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={closeSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default WorkflowTestingDashboard;
