import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Tab,
  Tabs,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  AlertTitle,
  LinearProgress,
  CircularProgress,
  Tooltip,
  Divider,
  Select,
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
  TextField,
  Switch,
  FormControlLabel,
  Avatar,
  AvatarGroup,
  Badge,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  People as PeopleIcon,
  SmartToy as AIIcon,
  AttachMoney as MoneyIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  MoreVert as MoreIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  CalendarToday as CalendarIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Message as MessageIcon,
  Assessment as AssessmentIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Psychology as PsychologyIcon,
  Favorite as HeartIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Stars as StarsIcon,
  EmojiEmotions as HappyIcon,
  SentimentDissatisfied as SadIcon,
  SentimentNeutral as NeutralIcon,
  LocalFireDepartment as HotIcon,
  AcUnit as ColdIcon,
  Whatshot as WarmIcon,
  Verified as VerifiedIcon,
  Block as BlockIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  FunnelChart,
  Funnel,
  LabelList,
} from 'recharts';
import { collection, query, where, getDocs, onSnapshot, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { format, subDays, subHours, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { ROLE_HIERARCHY } from '../layout/navConfig';

// Color palette for charts
const COLORS = {
  primary: '#1976d2',
  success: '#2e7d32',
  warning: '#ed6c02',
  error: '#d32f2f',
  info: '#0288d1',
  hot: '#ff5722',
  warm: '#ff9800',
  qualified: '#4caf50',
  cold: '#607d8b',
};

const CHART_COLORS = ['#1976d2', '#2e7d32', '#ed6c02', '#d32f2f', '#9c27b0', '#00bcd4', '#ff5722', '#8bc34a'];

// Lead temperature definitions
const LEAD_TEMPERATURES = {
  HOT: { label: 'Hot', color: COLORS.hot, icon: HotIcon, minScore: 8 },
  WARM: { label: 'Warm', color: COLORS.warm, icon: WarmIcon, minScore: 6 },
  QUALIFIED: { label: 'Qualified', color: COLORS.qualified, icon: VerifiedIcon, minScore: 4 },
  COLD: { label: 'Cold', color: COLORS.cold, icon: ColdIcon, minScore: 0 },
};

// Sentiment definitions
const SENTIMENTS = {
  POSITIVE: { label: 'Positive', color: COLORS.success, icon: HappyIcon },
  NEUTRAL: { label: 'Neutral', color: COLORS.info, icon: NeutralIcon },
  NEGATIVE: { label: 'Negative', color: COLORS.error, icon: SadIcon },
};

// AI Quality thresholds
const AI_QUALITY_THRESHOLDS = {
  EXCELLENT: { min: 90, color: COLORS.success, label: 'Excellent' },
  GOOD: { min: 75, color: COLORS.info, label: 'Good' },
  FAIR: { min: 60, color: COLORS.warning, label: 'Fair' },
  POOR: { min: 0, color: COLORS.error, label: 'Poor' },
};

  const IDIQDashboard = () => {
  // 🔧 FIX: Get userProfile from useAuth, then extract role
  const { currentUser, userProfile } = useAuth();
  const userRole = userProfile?.role || currentUser?.role || 'user';

  // 🔍 DEBUG - CHECK WHAT WE'RE GETTING
  console.log('=== IDIQ DASHBOARD DEBUG ===');
  console.log('currentUser:', currentUser);
  console.log('userRole:', userRole);
  console.log('userRole type:', typeof userRole);
  console.log('ROLE_HIERARCHY:', ROLE_HIERARCHY);
  console.log('userRoleLevel:', ROLE_HIERARCHY[userRole]);
  console.log('============================');
  
  // State management
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [timeRange, setTimeRange] = useState('7d'); // 24h, 7d, 30d, 90d, all
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  const [lastRefresh, setLastRefresh] = useState(new Date());
  
  // Data state
  const [enrollmentData, setEnrollmentData] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    failed: 0,
    averageTime: 0,
    successRate: 0,
    trend: [],
  });
  
  const [leadData, setLeadData] = useState({
    total: 0,
    hot: 0,
    warm: 0,
    qualified: 0,
    cold: 0,
    averageScore: 0,
    distribution: [],
    scoreDistribution: [],
  });
  
  const [funnelData, setFunnelData] = useState({
    stages: [],
    conversionRates: {},
    dropOffPoints: [],
    totalEntries: 0,
    totalConversions: 0,
  });
  
  const [aiPerformance, setAiPerformance] = useState({
    totalInteractions: 0,
    averageQuality: 0,
    satisfactionScore: 0,
    escalationRate: 0,
    sentimentBreakdown: { positive: 0, neutral: 0, negative: 0 },
    responseTime: 0,
    resolutionRate: 0,
    qualityTrend: [],
    topIssues: [],
  });
  
  const [revenueData, setRevenueData] = useState({
    totalRevenue: 0,
    projectedRevenue: 0,
    averageClientValue: 0,
    roi: 0,
    revenueBySource: [],
    revenueTrend: [],
    conversionValue: 0,
  });
  
  const [activityData, setActivityData] = useState({
    recentEnrollments: [],
    liveChats: [],
    disputes: [],
    systemAlerts: [],
  });
  
  const [alerts, setAlerts] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [selectedExportFormat, setSelectedExportFormat] = useState('csv');

  // Debug: Check what userRole contains
console.log('🔍 DEBUG: userRole =', userRole, 'type:', typeof userRole);
console.log('🔍 DEBUG: userRoleLevel =', ROLE_HIERARCHY[userRole]);
console.log('🔍 DEBUG: hasAccess =', ROLE_HIERARCHY[userRole] >= 6);
  
  // Permission check - Convert string role to numeric level
const userRoleLevel = ROLE_HIERARCHY[userRole] || 0;
const hasAccess = userRoleLevel >= 6; // Manager level and above

console.log('🔐 Permission Check:', {
  userRole,
  userRoleLevel,
  hasAccess,
  required: 6
});
  
  // Date range calculation
  const getDateRange = useCallback(() => {
    const now = new Date();
    switch (timeRange) {
      case '24h':
        return { start: subHours(now, 24), end: now };
      case '7d':
        return { start: subDays(now, 7), end: now };
      case '30d':
        return { start: subDays(now, 30), end: now };
      case '90d':
        return { start: subDays(now, 90), end: now };
      case 'all':
        return { start: new Date(2020, 0, 1), end: now };
      default:
        return { start: subDays(now, 7), end: now };
    }
  }, [timeRange]);
  
  // Fetch enrollment data with AI insights
  const fetchEnrollmentData = useCallback(async () => {
    try {
      const { start, end } = getDateRange();
      const enrollmentsRef = collection(db, 'idiqEnrollments');
      const q = query(
        enrollmentsRef,
        where('createdAt', '>=', Timestamp.fromDate(start)),
        where('createdAt', '<=', Timestamp.fromDate(end)),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const enrollments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      }));
      
      // Calculate metrics
      const total = enrollments.length;
      const completed = enrollments.filter(e => e.status === 'completed').length;
      const inProgress = enrollments.filter(e => e.status === 'in_progress').length;
      const failed = enrollments.filter(e => e.status === 'failed').length;
      const successRate = total > 0 ? (completed / total) * 100 : 0;
      
      // Calculate average completion time
      const completedEnrollments = enrollments.filter(e => e.status === 'completed' && e.completedAt);
      const totalTime = completedEnrollments.reduce((sum, e) => {
        const duration = (e.completedAt?.toDate() - e.createdAt) / 1000 / 60; // minutes
        return sum + duration;
      }, 0);
      const averageTime = completedEnrollments.length > 0 ? totalTime / completedEnrollments.length : 0;
      
      // Generate trend data (last 7 days)
      const trendDays = 7;
      const trend = Array.from({ length: trendDays }, (_, i) => {
        const date = subDays(new Date(), trendDays - 1 - i);
        const dayStart = startOfDay(date);
        const dayEnd = endOfDay(date);
        
        const dayEnrollments = enrollments.filter(e => 
          e.createdAt >= dayStart && e.createdAt <= dayEnd
        );
        
        return {
          date: format(date, 'MMM dd'),
          total: dayEnrollments.length,
          completed: dayEnrollments.filter(e => e.status === 'completed').length,
          failed: dayEnrollments.filter(e => e.status === 'failed').length,
        };
      });
      
      setEnrollmentData({
        total,
        completed,
        inProgress,
        failed,
        averageTime: Math.round(averageTime),
        successRate: Math.round(successRate * 10) / 10,
        trend,
      });
      
      // Check for alerts
      const newAlerts = [];
      if (successRate < 70) {
        newAlerts.push({
          severity: 'warning',
          title: 'Low Success Rate',
          message: `Enrollment success rate is ${successRate.toFixed(1)}%. Consider reviewing the enrollment process.`,
        });
      }
      if (failed > total * 0.15) {
        newAlerts.push({
          severity: 'error',
          title: 'High Failure Rate',
          message: `${failed} enrollments failed (${((failed/total)*100).toFixed(1)}%). Immediate attention needed.`,
        });
      }
      
      return newAlerts;
    } catch (error) {
      console.error('Error fetching enrollment data:', error);
      return [];
    }
  }, [getDateRange]);
  
  // Fetch lead scoring data with AI analysis
  const fetchLeadData = useCallback(async () => {
    try {
      const { start, end } = getDateRange();
      const contactsRef = collection(db, 'contacts');
      const q = query(
        contactsRef,
        where('createdAt', '>=', Timestamp.fromDate(start)),
        where('createdAt', '<=', Timestamp.fromDate(end)),
        where('roles', 'array-contains', 'lead')
      );
      
      const snapshot = await getDocs(q);
      const leads = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      }));
      
      const total = leads.length;
      
      // Categorize by temperature based on lead score
      const hot = leads.filter(l => l.leadScore >= 8).length;
      const warm = leads.filter(l => l.leadScore >= 6 && l.leadScore < 8).length;
      const qualified = leads.filter(l => l.leadScore >= 4 && l.leadScore < 6).length;
      const cold = leads.filter(l => l.leadScore < 4).length;
      
      // Calculate average score
      const totalScore = leads.reduce((sum, l) => sum + (l.leadScore || 0), 0);
      const averageScore = total > 0 ? totalScore / total : 0;
      
      // Distribution data for pie chart
      const distribution = [
        { name: 'Hot', value: hot, color: COLORS.hot },
        { name: 'Warm', value: warm, color: COLORS.warm },
        { name: 'Qualified', value: qualified, color: COLORS.qualified },
        { name: 'Cold', value: cold, color: COLORS.cold },
      ].filter(item => item.value > 0);
      
      // Score distribution for bar chart (0-10)
      const scoreDistribution = Array.from({ length: 11 }, (_, i) => ({
        score: i,
        count: leads.filter(l => Math.floor(l.leadScore) === i).length,
      }));
      
      setLeadData({
        total,
        hot,
        warm,
        qualified,
        cold,
        averageScore: Math.round(averageScore * 10) / 10,
        distribution,
        scoreDistribution,
      });
      
      // Check for alerts
      const newAlerts = [];
      if (averageScore < 5) {
        newAlerts.push({
          severity: 'warning',
          title: 'Low Lead Quality',
          message: `Average lead score is ${averageScore.toFixed(1)}. Consider improving lead sources.`,
        });
      }
      if (cold > total * 0.4) {
        newAlerts.push({
          severity: 'info',
          title: 'High Cold Lead Percentage',
          message: `${((cold/total)*100).toFixed(1)}% of leads are cold. Review qualification criteria.`,
        });
      }
      
      return newAlerts;
    } catch (error) {
      console.error('Error fetching lead data:', error);
      return [];
    }
  }, [getDateRange]);
  
  // Fetch funnel data with conversion analysis
  const fetchFunnelData = useCallback(async () => {
    try {
      const { start, end } = getDateRange();
      
      // Fetch all contacts in date range
      const contactsRef = collection(db, 'contacts');
      const q = query(
        contactsRef,
        where('createdAt', '>=', Timestamp.fromDate(start)),
        where('createdAt', '<=', Timestamp.fromDate(end))
      );
      
      const snapshot = await getDocs(q);
      const contacts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      // Define funnel stages
      const totalEntries = contacts.length;
      const qualified = contacts.filter(c => c.roles?.includes('lead')).length;
      const engaged = contacts.filter(c => c.roles?.includes('lead') && c.lastContactDate).length;
      const enrolled = contacts.filter(c => c.roles?.includes('client')).length;
      const active = contacts.filter(c => c.roles?.includes('client') && c.status === 'active').length;
      
      const stages = [
        { name: 'Visitors', value: totalEntries, fill: CHART_COLORS[0] },
        { name: 'Qualified', value: qualified, fill: CHART_COLORS[1] },
        { name: 'Engaged', value: engaged, fill: CHART_COLORS[2] },
        { name: 'Enrolled', value: enrolled, fill: CHART_COLORS[3] },
        { name: 'Active', value: active, fill: CHART_COLORS[4] },
      ];
      
      // Calculate conversion rates between stages
      const conversionRates = {
        visitorsToQualified: totalEntries > 0 ? (qualified / totalEntries) * 100 : 0,
        qualifiedToEngaged: qualified > 0 ? (engaged / qualified) * 100 : 0,
        engagedToEnrolled: engaged > 0 ? (enrolled / engaged) * 100 : 0,
        enrolledToActive: enrolled > 0 ? (active / enrolled) * 100 : 0,
        overallConversion: totalEntries > 0 ? (active / totalEntries) * 100 : 0,
      };
      
      // Identify drop-off points (stages with <50% conversion)
      const dropOffPoints = [];
      if (conversionRates.visitorsToQualified < 50) {
        dropOffPoints.push({ stage: 'Visitors → Qualified', rate: conversionRates.visitorsToQualified });
      }
      if (conversionRates.qualifiedToEngaged < 50) {
        dropOffPoints.push({ stage: 'Qualified → Engaged', rate: conversionRates.qualifiedToEngaged });
      }
      if (conversionRates.engagedToEnrolled < 50) {
        dropOffPoints.push({ stage: 'Engaged → Enrolled', rate: conversionRates.engagedToEnrolled });
      }
      if (conversionRates.enrolledToActive < 50) {
        dropOffPoints.push({ stage: 'Enrolled → Active', rate: conversionRates.enrolledToActive });
      }
      
      setFunnelData({
        stages,
        conversionRates,
        dropOffPoints,
        totalEntries,
        totalConversions: active,
      });
      
      // Check for alerts
      const newAlerts = [];
      dropOffPoints.forEach(point => {
        newAlerts.push({
          severity: 'warning',
          title: 'Conversion Drop-Off',
          message: `${point.stage}: ${point.rate.toFixed(1)}% conversion rate. Investigate friction points.`,
        });
      });
      if (conversionRates.overallConversion < 2) {
        newAlerts.push({
          severity: 'error',
          title: 'Low Overall Conversion',
          message: `Overall conversion rate is ${conversionRates.overallConversion.toFixed(2)}%. Urgent optimization needed.`,
        });
      }
      
      return newAlerts;
    } catch (error) {
      console.error('Error fetching funnel data:', error);
      return [];
    }
  }, [getDateRange]);
  
  // Fetch AI performance data with quality metrics
  const fetchAIPerformance = useCallback(async () => {
    try {
      const { start, end } = getDateRange();
      
      // Fetch AI interactions
      const interactionsRef = collection(db, 'aiInteractions');
      const q = query(
        interactionsRef,
        where('timestamp', '>=', Timestamp.fromDate(start)),
        where('timestamp', '<=', Timestamp.fromDate(end)),
        orderBy('timestamp', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const interactions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate(),
      }));
      
      const totalInteractions = interactions.length;
      
      // Calculate quality score (0-100)
      const qualityScores = interactions
        .filter(i => i.qualityScore !== undefined)
        .map(i => i.qualityScore);
      const averageQuality = qualityScores.length > 0
        ? qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length
        : 0;
      
      // Calculate satisfaction score (1-5)
      const satisfactionScores = interactions
        .filter(i => i.satisfactionScore !== undefined)
        .map(i => i.satisfactionScore);
      const satisfactionScore = satisfactionScores.length > 0
        ? satisfactionScores.reduce((sum, score) => sum + score, 0) / satisfactionScores.length
        : 0;
      
      // Calculate escalation rate
      const escalated = interactions.filter(i => i.escalated === true).length;
      const escalationRate = totalInteractions > 0 ? (escalated / totalInteractions) * 100 : 0;
      
      // Sentiment breakdown
      const sentimentBreakdown = {
        positive: interactions.filter(i => i.sentiment === 'positive').length,
        neutral: interactions.filter(i => i.sentiment === 'neutral').length,
        negative: interactions.filter(i => i.sentiment === 'negative').length,
      };
      
      // Calculate average response time (seconds)
      const responseTimes = interactions
        .filter(i => i.responseTime !== undefined)
        .map(i => i.responseTime);
      const responseTime = responseTimes.length > 0
        ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
        : 0;
      
      // Calculate resolution rate
      const resolved = interactions.filter(i => i.resolved === true).length;
      const resolutionRate = totalInteractions > 0 ? (resolved / totalInteractions) * 100 : 0;
      
      // Generate quality trend (last 7 days)
      const trendDays = 7;
      const qualityTrend = Array.from({ length: trendDays }, (_, i) => {
        const date = subDays(new Date(), trendDays - 1 - i);
        const dayStart = startOfDay(date);
        const dayEnd = endOfDay(date);
        
        const dayInteractions = interactions.filter(int => 
          int.timestamp >= dayStart && int.timestamp <= dayEnd
        );
        
        const dayQuality = dayInteractions
          .filter(i => i.qualityScore !== undefined)
          .map(i => i.qualityScore);
        
        const daySatisfaction = dayInteractions
          .filter(i => i.satisfactionScore !== undefined)
          .map(i => i.satisfactionScore);
        
        return {
          date: format(date, 'MMM dd'),
          quality: dayQuality.length > 0 
            ? dayQuality.reduce((sum, s) => sum + s, 0) / dayQuality.length 
            : 0,
          satisfaction: daySatisfaction.length > 0
            ? (daySatisfaction.reduce((sum, s) => sum + s, 0) / daySatisfaction.length) * 20 // Convert 1-5 to 0-100 scale
            : 0,
          interactions: dayInteractions.length,
        };
      });
      
      // Top issues
      const issuesMap = {};
      interactions.forEach(int => {
        if (int.issue) {
          issuesMap[int.issue] = (issuesMap[int.issue] || 0) + 1;
        }
      });
      const topIssues = Object.entries(issuesMap)
        .map(([issue, count]) => ({ issue, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      
      setAiPerformance({
        totalInteractions,
        averageQuality: Math.round(averageQuality * 10) / 10,
        satisfactionScore: Math.round(satisfactionScore * 10) / 10,
        escalationRate: Math.round(escalationRate * 10) / 10,
        sentimentBreakdown,
        responseTime: Math.round(responseTime * 10) / 10,
        resolutionRate: Math.round(resolutionRate * 10) / 10,
        qualityTrend,
        topIssues,
      });
      
      // Check for alerts
      const newAlerts = [];
      if (averageQuality < 70) {
        newAlerts.push({
          severity: 'error',
          title: 'Low AI Quality',
          message: `AI quality score is ${averageQuality.toFixed(1)}%. Review AI prompts and training data.`,
        });
      }
      if (escalationRate > 15) {
        newAlerts.push({
          severity: 'warning',
          title: 'High Escalation Rate',
          message: `${escalationRate.toFixed(1)}% of interactions are escalated. AI may need improvement.`,
        });
      }
      if (satisfactionScore < 3.5) {
        newAlerts.push({
          severity: 'warning',
          title: 'Low Satisfaction',
          message: `Average satisfaction is ${satisfactionScore.toFixed(1)}/5. Consider user feedback.`,
        });
      }
      
      return newAlerts;
    } catch (error) {
      console.error('Error fetching AI performance:', error);
      return [];
    }
  }, [getDateRange]);
  
  // Fetch revenue data and projections
  const fetchRevenueData = useCallback(async () => {
    try {
      const { start, end } = getDateRange();
      
      // Fetch clients
      const contactsRef = collection(db, 'contacts');
      const clientsQuery = query(
        contactsRef,
        where('roles', 'array-contains', 'client'),
        where('createdAt', '>=', Timestamp.fromDate(start)),
        where('createdAt', '<=', Timestamp.fromDate(end))
      );
      
      const snapshot = await getDocs(clientsQuery);
      const clients = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      }));
      
      // Calculate revenue (assuming $150/month per client)
      const monthlyRate = 150;
      const totalRevenue = clients.length * monthlyRate;
      
      // Project next 3 months based on trend
      const daysInRange = (end - start) / (1000 * 60 * 60 * 24);
      const clientsPerDay = clients.length / daysInRange;
      const projectedClients = clientsPerDay * 90; // 90 days
      const projectedRevenue = projectedClients * monthlyRate;
      
      // Average client value (lifetime value estimate: 6 months average)
      const averageLifetimeMonths = 6;
      const averageClientValue = monthlyRate * averageLifetimeMonths;
      
      // Calculate ROI (simplified: revenue vs. cost of acquisition)
      const estimatedCostPerLead = 50; // Estimate
      const totalCost = clients.length * estimatedCostPerLead;
      const roi = totalCost > 0 ? ((totalRevenue - totalCost) / totalCost) * 100 : 0;
      
      // Revenue by source
      const sourceMap = {};
      clients.forEach(client => {
        const source = client.source || 'Unknown';
        sourceMap[source] = (sourceMap[source] || 0) + monthlyRate;
      });
      const revenueBySource = Object.entries(sourceMap)
        .map(([source, revenue]) => ({ source, revenue }))
        .sort((a, b) => b.revenue - a.revenue);
      
      // Revenue trend (last 7 days)
      const trendDays = 7;
      const revenueTrend = Array.from({ length: trendDays }, (_, i) => {
        const date = subDays(new Date(), trendDays - 1 - i);
        const dayStart = startOfDay(date);
        const dayEnd = endOfDay(date);
        
        const dayClients = clients.filter(c => 
          c.createdAt >= dayStart && c.createdAt <= dayEnd
        );
        
        return {
          date: format(date, 'MMM dd'),
          revenue: dayClients.length * monthlyRate,
          clients: dayClients.length,
        };
      });
      
      // Calculate conversion value (revenue per conversion)
      const conversionValue = clients.length > 0 ? totalRevenue / clients.length : 0;
      
      setRevenueData({
        totalRevenue,
        projectedRevenue,
        averageClientValue,
        roi: Math.round(roi * 10) / 10,
        revenueBySource,
        revenueTrend,
        conversionValue,
      });
      
      return []; // No alerts for revenue (informational only)
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      return [];
    }
  }, [getDateRange]);
  
  // Fetch recent activity and live data
  const fetchActivityData = useCallback(async () => {
    try {
      // Recent enrollments (last 10)
      const enrollmentsRef = collection(db, 'idiqEnrollments');
      const enrollmentsQuery = query(
        enrollmentsRef,
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
      const recentEnrollments = enrollmentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      }));
      
      // Live chats (active)
      const chatsRef = collection(db, 'aiInteractions');
      const chatsQuery = query(
        chatsRef,
        where('status', '==', 'active'),
        orderBy('timestamp', 'desc'),
        limit(10)
      );
      const chatsSnapshot = await getDocs(chatsQuery);
      const liveChats = chatsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate(),
      }));
      
      // Recent disputes (last 10)
      const disputesRef = collection(db, 'disputes');
      const disputesQuery = query(
        disputesRef,
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      const disputesSnapshot = await getDocs(disputesQuery);
      const disputes = disputesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      }));
      
      setActivityData({
        recentEnrollments,
        liveChats,
        disputes,
        systemAlerts: [], // Would come from system monitoring
      });
      
      return [];
    } catch (error) {
      console.error('Error fetching activity data:', error);
      return [];
    }
  }, []);
  
  // Aggregate all alerts
  const aggregateAlerts = useCallback(async () => {
    const allAlerts = [];
    
    const enrollmentAlerts = await fetchEnrollmentData();
    const leadAlerts = await fetchLeadData();
    const funnelAlerts = await fetchFunnelData();
    const aiAlerts = await fetchAIPerformance();
    const revenueAlerts = await fetchRevenueData();
    
    allAlerts.push(...enrollmentAlerts, ...leadAlerts, ...funnelAlerts, ...aiAlerts, ...revenueAlerts);
    
    setAlerts(allAlerts);
  }, [fetchEnrollmentData, fetchLeadData, fetchFunnelData, fetchAIPerformance, fetchRevenueData]);
  
  // Main data fetch function
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        aggregateAlerts(),
        fetchActivityData(),
      ]);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [aggregateAlerts, fetchActivityData]);
  
  // Initial load
  useEffect(() => {
    if (hasAccess) {
      fetchAllData();
    }
  }, [hasAccess, fetchAllData, timeRange]);
  
  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || !hasAccess) return;
    
    const interval = setInterval(() => {
      fetchAllData();
    }, refreshInterval);
    
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, hasAccess, fetchAllData]);
  
  // Export functionality
  const handleExport = (format) => {
    const data = {
      enrollment: enrollmentData,
      leads: leadData,
      funnel: funnelData,
      aiPerformance: aiPerformance,
      revenue: revenueData,
      activity: activityData,
      alerts: alerts,
      exportDate: new Date().toISOString(),
      timeRange: timeRange,
    };
    
    switch (format) {
      case 'csv':
        exportToCSV(data);
        break;
      case 'json':
        exportToJSON(data);
        break;
      case 'pdf':
        exportToPDF(data);
        break;
      default:
        console.error('Unknown export format:', format);
    }
    
    setExportDialogOpen(false);
  };
  
  const exportToCSV = (data) => {
    // Simplified CSV export - in production, use a proper library
    const csv = [
      ['Metric', 'Value'],
      ['Total Enrollments', data.enrollment.total],
      ['Completed Enrollments', data.enrollment.completed],
      ['Success Rate', `${data.enrollment.successRate}%`],
      ['Total Leads', data.leads.total],
      ['Average Lead Score', data.leads.averageScore],
      ['Hot Leads', data.leads.hot],
      ['AI Quality Score', data.aiPerformance.averageQuality],
      ['Total Revenue', `$${data.revenue.totalRevenue}`],
      ['ROI', `${data.revenue.roi}%`],
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `idiq-dashboard-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };
  
  const exportToJSON = (data) => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `idiq-dashboard-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
  };
  
  const exportToPDF = (data) => {
    // In production, use a proper PDF library like jsPDF
    alert('PDF export would be implemented with jsPDF library');
  };
  
  // Render helpers
  const renderStatCard = (title, value, icon, trend, color = 'primary') => (
    <Card elevation={2}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" color={color}>
              {value}
            </Typography>
            {trend !== undefined && (
              <Box display="flex" alignItems="center" mt={1}>
                {trend >= 0 ? (
                  <TrendingUpIcon fontSize="small" color="success" />
                ) : (
                  <TrendingDownIcon fontSize="small" color="error" />
                )}
                <Typography
                  variant="body2"
                  color={trend >= 0 ? 'success.main' : 'error.main'}
                  ml={0.5}
                >
                  {Math.abs(trend)}%
                </Typography>
              </Box>
            )}
          </Box>
          <Avatar sx={{ bgcolor: `${color}.main` }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
  
  // Permission check
  if (!hasAccess) {
    return (
      <Box p={3}>
        <Alert severity="error">
          <AlertTitle>Access Denied</AlertTitle>
          You need manager-level permissions or higher to view this dashboard.
        </Alert>
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            IDIQ Dashboard
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Real-time enrollment metrics and AI performance insights
          </Typography>
        </Box>
        <Box display="flex" gap={2} alignItems="center">
          {/* Time Range Selector */}
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="24h">Last 24 Hours</MenuItem>
              <MenuItem value="7d">Last 7 Days</MenuItem>
              <MenuItem value="30d">Last 30 Days</MenuItem>
              <MenuItem value="90d">Last 90 Days</MenuItem>
              <MenuItem value="all">All Time</MenuItem>
            </Select>
          </FormControl>
          
          {/* Auto-refresh Toggle */}
          <FormControlLabel
            control={
              <Switch
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
            }
            label="Auto-refresh"
          />
          
          {/* Manual Refresh */}
          <Tooltip title={`Last updated: ${format(lastRefresh, 'HH:mm:ss')}`}>
            <IconButton onClick={fetchAllData} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          
          {/* Export Button */}
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => setExportDialogOpen(true)}
          >
            Export
          </Button>
        </Box>
      </Box>
      
      {/* Alerts Section */}
      {alerts.length > 0 && (
        <Box mb={3}>
          {alerts.map((alert, index) => (
            <Alert key={index} severity={alert.severity} sx={{ mb: 1 }}>
              <AlertTitle>{alert.title}</AlertTitle>
              {alert.message}
            </Alert>
          ))}
        </Box>
      )}
      
      {/* Loading State */}
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      
      {/* Tabs */}
      <Paper elevation={2}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<DashboardIcon />} label="Overview" />
          <Tab icon={<TimelineIcon />} label="Funnel" />
          <Tab icon={<PeopleIcon />} label="Leads" />
          <Tab icon={<AIIcon />} label="AI Performance" />
          <Tab icon={<AssessmentIcon />} label="Activity" />
          <Tab icon={<MoneyIcon />} label="Revenue" />
        </Tabs>
        
        <Box p={3}>
          {/* Tab 0: Overview */}
          {activeTab === 0 && (
            <Box>
              <Grid container spacing={3}>
                {/* Enrollment Stats */}
                <Grid item xs={12} md={3}>
                  {renderStatCard(
                    'Total Enrollments',
                    enrollmentData.total,
                    <PeopleIcon />,
                    undefined,
                    'primary'
                  )}
                </Grid>
                <Grid item xs={12} md={3}>
                  {renderStatCard(
                    'Success Rate',
                    `${enrollmentData.successRate}%`,
                    <CheckIcon />,
                    undefined,
                    'success'
                  )}
                </Grid>
                <Grid item xs={12} md={3}>
                  {renderStatCard(
                    'Avg. Completion Time',
                    `${enrollmentData.averageTime}m`,
                    <SpeedIcon />,
                    undefined,
                    'info'
                  )}
                </Grid>
                <Grid item xs={12} md={3}>
                  {renderStatCard(
                    'Failed Enrollments',
                    enrollmentData.failed,
                    <ErrorIcon />,
                    undefined,
                    'error'
                  )}
                </Grid>
                
                {/* Enrollment Trend Chart */}
                <Grid item xs={12}>
                  <Card elevation={2}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Enrollment Trend
                      </Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={enrollmentData.trend}>
                          <defs>
                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8}/>
                              <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.8}/>
                              <stop offset="95%" stopColor={COLORS.success} stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <RechartsTooltip />
                          <Legend />
                          <Area
                            type="monotone"
                            dataKey="total"
                            stroke={COLORS.primary}
                            fillOpacity={1}
                            fill="url(#colorTotal)"
                            name="Total"
                          />
                          <Area
                            type="monotone"
                            dataKey="completed"
                            stroke={COLORS.success}
                            fillOpacity={1}
                            fill="url(#colorCompleted)"
                            name="Completed"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
                
                {/* Lead Quality Overview */}
                <Grid item xs={12} md={6}>
                  <Card elevation={2}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Lead Quality Distribution
                      </Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={leadData.distribution}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {leadData.distribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <Box mt={2} textAlign="center">
                        <Typography variant="body2" color="textSecondary">
                          Average Lead Score: <strong>{leadData.averageScore}/10</strong>
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                {/* AI Performance Overview */}
                <Grid item xs={12} md={6}>
                  <Card elevation={2}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        AI Performance Metrics
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Box textAlign="center" p={2}>
                            <Typography variant="h3" color="primary">
                              {aiPerformance.averageQuality}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Quality Score
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box textAlign="center" p={2}>
                            <Typography variant="h3" color="success">
                              {aiPerformance.satisfactionScore}/5
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Satisfaction
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box textAlign="center" p={2}>
                            <Typography variant="h3" color="info">
                              {aiPerformance.escalationRate}%
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Escalation Rate
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box textAlign="center" p={2}>
                            <Typography variant="h3" color="warning">
                              {aiPerformance.responseTime}s
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Avg Response
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
          
          {/* Tab 1: Funnel Analysis */}
          {activeTab === 1 && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card elevation={2}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Conversion Funnel
                      </Typography>
                      <ResponsiveContainer width="100%" height={400}>
                        <FunnelChart>
                          <Funnel
                            dataKey="value"
                            data={funnelData.stages}
                            isAnimationActive
                          >
                            <LabelList position="right" fill="#000" stroke="none" dataKey="name" />
                          </Funnel>
                        </FunnelChart>
                      </ResponsiveContainer>
                      <Box mt={2}>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          <strong>Overall Conversion:</strong> {funnelData.totalConversions} / {funnelData.totalEntries} (
                          {funnelData.totalEntries > 0 
                            ? ((funnelData.totalConversions / funnelData.totalEntries) * 100).toFixed(2)
                            : 0}%)
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                {/* Conversion Rates */}
                <Grid item xs={12}>
                  <Card elevation={2}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Stage Conversion Rates
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={3}>
                          <Box textAlign="center" p={2} bgcolor="grey.100" borderRadius={1}>
                            <Typography variant="h4" color="primary">
                              {funnelData.conversionRates.visitorsToQualified?.toFixed(1)}%
                            </Typography>
                            <Typography variant="body2">
                              Visitors → Qualified
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <Box textAlign="center" p={2} bgcolor="grey.100" borderRadius={1}>
                            <Typography variant="h4" color="success">
                              {funnelData.conversionRates.qualifiedToEngaged?.toFixed(1)}%
                            </Typography>
                            <Typography variant="body2">
                              Qualified → Engaged
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <Box textAlign="center" p={2} bgcolor="grey.100" borderRadius={1}>
                            <Typography variant="h4" color="info">
                              {funnelData.conversionRates.engagedToEnrolled?.toFixed(1)}%
                            </Typography>
                            <Typography variant="body2">
                              Engaged → Enrolled
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <Box textAlign="center" p={2} bgcolor="grey.100" borderRadius={1}>
                            <Typography variant="h4" color="warning">
                              {funnelData.conversionRates.enrolledToActive?.toFixed(1)}%
                            </Typography>
                            <Typography variant="body2">
                              Enrolled → Active
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
                
                {/* Drop-off Points */}
                {funnelData.dropOffPoints.length > 0 && (
                  <Grid item xs={12}>
                    <Card elevation={2}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom color="error">
                          ⚠️ Drop-off Points Requiring Attention
                        </Typography>
                        <Grid container spacing={2}>
                          {funnelData.dropOffPoints.map((point, index) => (
                            <Grid item xs={12} md={6} key={index}>
                              <Alert severity="warning">
                                <AlertTitle>{point.stage}</AlertTitle>
                                Conversion rate: {point.rate.toFixed(1)}% (below 50% threshold)
                              </Alert>
                            </Grid>
                          ))}
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
          
          {/* Tab 2: Lead Scoring */}
          {activeTab === 2 && (
            <Box>
              <Grid container spacing={3}>
                {/* Lead Temperature Cards */}
                <Grid item xs={12} md={3}>
                  <Card elevation={2} sx={{ borderLeft: `4px solid ${COLORS.hot}` }}>
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={1}>
                        <HotIcon sx={{ color: COLORS.hot, mr: 1 }} />
                        <Typography variant="h6">Hot Leads</Typography>
                      </Box>
                      <Typography variant="h3">{leadData.hot}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        Score ≥ 8
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card elevation={2} sx={{ borderLeft: `4px solid ${COLORS.warm}` }}>
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={1}>
                        <WarmIcon sx={{ color: COLORS.warm, mr: 1 }} />
                        <Typography variant="h6">Warm Leads</Typography>
                      </Box>
                      <Typography variant="h3">{leadData.warm}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        Score 6-7
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card elevation={2} sx={{ borderLeft: `4px solid ${COLORS.qualified}` }}>
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={1}>
                        <VerifiedIcon sx={{ color: COLORS.qualified, mr: 1 }} />
                        <Typography variant="h6">Qualified</Typography>
                      </Box>
                      <Typography variant="h3">{leadData.qualified}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        Score 4-5
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card elevation={2} sx={{ borderLeft: `4px solid ${COLORS.cold}` }}>
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={1}>
                        <ColdIcon sx={{ color: COLORS.cold, mr: 1 }} />
                        <Typography variant="h6">Cold Leads</Typography>
                      </Box>
                      <Typography variant="h3">{leadData.cold}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        Score &lt; 4
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                {/* Score Distribution */}
                <Grid item xs={12}>
                  <Card elevation={2}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Lead Score Distribution
                      </Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={leadData.scoreDistribution}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="score" label={{ value: 'Lead Score', position: 'insideBottom', offset: -5 }} />
                          <YAxis label={{ value: 'Number of Leads', angle: -90, position: 'insideLeft' }} />
                          <RechartsTooltip />
                          <Bar dataKey="count" fill={COLORS.primary}>
                            {leadData.scoreDistribution.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={
                                  entry.score >= 8 ? COLORS.hot :
                                  entry.score >= 6 ? COLORS.warm :
                                  entry.score >= 4 ? COLORS.qualified :
                                  COLORS.cold
                                } 
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
          
          {/* Tab 3: AI Performance */}
          {activeTab === 3 && (
            <Box>
              <Grid container spacing={3}>
                {/* AI Metrics Cards */}
                <Grid item xs={12} md={3}>
                  {renderStatCard(
                    'Total Interactions',
                    aiPerformance.totalInteractions,
                    <AIIcon />,
                    undefined,
                    'primary'
                  )}
                </Grid>
                <Grid item xs={12} md={3}>
                  {renderStatCard(
                    'Quality Score',
                    aiPerformance.averageQuality,
                    <StarsIcon />,
                    undefined,
                    aiPerformance.averageQuality >= 80 ? 'success' : 
                    aiPerformance.averageQuality >= 60 ? 'warning' : 'error'
                  )}
                </Grid>
                <Grid item xs={12} md={3}>
                  {renderStatCard(
                    'Satisfaction',
                    `${aiPerformance.satisfactionScore}/5`,
                    <HeartIcon />,
                    undefined,
                    'success'
                  )}
                </Grid>
                <Grid item xs={12} md={3}>
                  {renderStatCard(
                    'Resolution Rate',
                    `${aiPerformance.resolutionRate}%`,
                    <CheckIcon />,
                    undefined,
                    'info'
                  )}
                </Grid>
                
                {/* Quality Trend */}
                <Grid item xs={12}>
                  <Card elevation={2}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        AI Performance Trend
                      </Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={aiPerformance.qualityTrend}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <RechartsTooltip />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="quality"
                            stroke={COLORS.primary}
                            strokeWidth={2}
                            name="Quality Score"
                          />
                          <Line
                            type="monotone"
                            dataKey="satisfaction"
                            stroke={COLORS.success}
                            strokeWidth={2}
                            name="Satisfaction Score"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
                
                {/* Sentiment Breakdown */}
                <Grid item xs={12} md={6}>
                  <Card elevation={2}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Sentiment Analysis
                      </Typography>
                      <Box mt={2}>
                        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                          <Box display="flex" alignItems="center">
                            <HappyIcon sx={{ color: COLORS.success, mr: 1 }} />
                            <Typography>Positive</Typography>
                          </Box>
                          <Typography variant="h6">{aiPerformance.sentimentBreakdown.positive}</Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={aiPerformance.totalInteractions > 0 
                            ? (aiPerformance.sentimentBreakdown.positive / aiPerformance.totalInteractions) * 100 
                            : 0}
                          sx={{ mb: 3, height: 8, borderRadius: 1, bgcolor: 'grey.200',
                            '& .MuiLinearProgress-bar': { bgcolor: COLORS.success }
                          }}
                        />
                        
                        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                          <Box display="flex" alignItems="center">
                            <NeutralIcon sx={{ color: COLORS.info, mr: 1 }} />
                            <Typography>Neutral</Typography>
                          </Box>
                          <Typography variant="h6">{aiPerformance.sentimentBreakdown.neutral}</Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={aiPerformance.totalInteractions > 0 
                            ? (aiPerformance.sentimentBreakdown.neutral / aiPerformance.totalInteractions) * 100 
                            : 0}
                          sx={{ mb: 3, height: 8, borderRadius: 1, bgcolor: 'grey.200',
                            '& .MuiLinearProgress-bar': { bgcolor: COLORS.info }
                          }}
                        />
                        
                        <Box display="flex" alignments="center" justifyContent="space-between" mb={2}>
                          <Box display="flex" alignItems="center">
                            <SadIcon sx={{ color: COLORS.error, mr: 1 }} />
                            <Typography>Negative</Typography>
                          </Box>
                          <Typography variant="h6">{aiPerformance.sentimentBreakdown.negative}</Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={aiPerformance.totalInteractions > 0 
                            ? (aiPerformance.sentimentBreakdown.negative / aiPerformance.totalInteractions) * 100 
                            : 0}
                          sx={{ height: 8, borderRadius: 1, bgcolor: 'grey.200',
                            '& .MuiLinearProgress-bar': { bgcolor: COLORS.error }
                          }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                {/* Top Issues */}
                <Grid item xs={12} md={6}>
                  <Card elevation={2}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Top Issues
                      </Typography>
                      {aiPerformance.topIssues.length > 0 ? (
                        <Box mt={2}>
                          {aiPerformance.topIssues.map((issue, index) => (
                            <Box key={index} mb={2}>
                              <Box display="flex" justifyContent="space-between" mb={0.5}>
                                <Typography variant="body2">{issue.issue}</Typography>
                                <Typography variant="body2" fontWeight="bold">{issue.count}</Typography>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={(issue.count / aiPerformance.totalInteractions) * 100}
                                sx={{ height: 6, borderRadius: 1 }}
                              />
                            </Box>
                          ))}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          No issues reported
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                
                {/* Additional AI Metrics */}
                <Grid item xs={12}>
                  <Card elevation={2}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Additional Metrics
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                          <Box textAlign="center" p={2} bgcolor="grey.100" borderRadius={1}>
                            <Typography variant="h4">{aiPerformance.responseTime}s</Typography>
                            <Typography variant="body2" color="textSecondary">
                              Average Response Time
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Box textAlign="center" p={2} bgcolor="grey.100" borderRadius={1}>
                            <Typography variant="h4" color={aiPerformance.escalationRate > 15 ? 'error' : 'success'}>
                              {aiPerformance.escalationRate}%
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Escalation Rate
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Box textAlign="center" p={2} bgcolor="grey.100" borderRadius={1}>
                            <Typography variant="h4" color="success">
                              {aiPerformance.resolutionRate}%
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Resolution Rate
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
          
          {/* Tab 4: Activity Feed */}
          {activeTab === 4 && (
            <Box>
              <Grid container spacing={3}>
                {/* Recent Enrollments */}
                <Grid item xs={12} md={6}>
                  <Card elevation={2}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Recent Enrollments
                      </Typography>
                      {activityData.recentEnrollments.length > 0 ? (
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Time</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Status</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {activityData.recentEnrollments.map((enrollment) => (
                                <TableRow key={enrollment.id}>
                                  <TableCell>
                                    {enrollment.createdAt ? format(enrollment.createdAt, 'HH:mm:ss') : 'N/A'}
                                  </TableCell>
                                  <TableCell>{enrollment.firstName} {enrollment.lastName}</TableCell>
                                  <TableCell>
                                    <Chip
                                      size="small"
                                      label={enrollment.status}
                                      color={
                                        enrollment.status === 'completed' ? 'success' :
                                        enrollment.status === 'in_progress' ? 'info' :
                                        'error'
                                      }
                                    />
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          No recent enrollments
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                
                {/* Live Chats */}
                <Grid item xs={12} md={6}>
                  <Card elevation={2}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Live AI Chats
                      </Typography>
                      {activityData.liveChats.length > 0 ? (
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Contact</TableCell>
                                <TableCell>Duration</TableCell>
                                <TableCell>Sentiment</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {activityData.liveChats.map((chat) => (
                                <TableRow key={chat.id}>
                                  <TableCell>{chat.contactName || 'Anonymous'}</TableCell>
                                  <TableCell>
                                    {chat.timestamp 
                                      ? `${Math.floor((new Date() - chat.timestamp) / 60000)}m`
                                      : 'N/A'}
                                  </TableCell>
                                  <TableCell>
                                    <Box display="flex" alignItems="center">
                                      {chat.sentiment === 'positive' && <HappyIcon fontSize="small" color="success" />}
                                      {chat.sentiment === 'neutral' && <NeutralIcon fontSize="small" color="info" />}
                                      {chat.sentiment === 'negative' && <SadIcon fontSize="small" color="error" />}
                                    </Box>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          No active chats
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                
                {/* Recent Disputes */}
                <Grid item xs={12}>
                  <Card elevation={2}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Recent Disputes
                      </Typography>
                      {activityData.disputes.length > 0 ? (
                        <TableContainer>
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell>Date</TableCell>
                                <TableCell>Client</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Actions</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {activityData.disputes.map((dispute) => (
                                <TableRow key={dispute.id}>
                                  <TableCell>
                                    {dispute.createdAt ? format(dispute.createdAt, 'MMM dd, yyyy') : 'N/A'}
                                  </TableCell>
                                  <TableCell>{dispute.clientName}</TableCell>
                                  <TableCell>{dispute.type}</TableCell>
                                  <TableCell>
                                    <Chip
                                      size="small"
                                      label={dispute.status}
                                      color={
                                        dispute.status === 'resolved' ? 'success' :
                                        dispute.status === 'pending' ? 'warning' :
                                        'default'
                                      }
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <IconButton size="small">
                                      <MoreIcon fontSize="small" />
                                    </IconButton>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          No recent disputes
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
          
          {/* Tab 5: Revenue */}
          {activeTab === 5 && (
            <Box>
              <Grid container spacing={3}>
                {/* Revenue Metrics */}
                <Grid item xs={12} md={3}>
                  {renderStatCard(
                    'Total Revenue',
                    `$${revenueData.totalRevenue.toLocaleString()}`,
                    <MoneyIcon />,
                    undefined,
                    'success'
                  )}
                </Grid>
                <Grid item xs={12} md={3}>
                  {renderStatCard(
                    'Projected Revenue (90d)',
                    `$${Math.round(revenueData.projectedRevenue).toLocaleString()}`,
                    <TrendingUpIcon />,
                    undefined,
                    'info'
                  )}
                </Grid>
                <Grid item xs={12} md={3}>
                  {renderStatCard(
                    'Avg Client Value',
                    `$${revenueData.averageClientValue.toLocaleString()}`,
                    <PeopleIcon />,
                    undefined,
                    'primary'
                  )}
                </Grid>
                <Grid item xs={12} md={3}>
                  {renderStatCard(
                    'ROI',
                    `${revenueData.roi}%`,
                    <AssessmentIcon />,
                    undefined,
                    revenueData.roi >= 100 ? 'success' : 'warning'
                  )}
                </Grid>
                
                {/* Revenue Trend */}
                <Grid item xs={12}>
                  <Card elevation={2}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Revenue Trend
                      </Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={revenueData.revenueTrend}>
                          <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.8}/>
                              <stop offset="95%" stopColor={COLORS.success} stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <RechartsTooltip />
                          <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke={COLORS.success}
                            fillOpacity={1}
                            fill="url(#colorRevenue)"
                            name="Revenue ($)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
                
                {/* Revenue by Source */}
                <Grid item xs={12}>
                  <Card elevation={2}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Revenue by Source
                      </Typography>
                      {revenueData.revenueBySource.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={revenueData.revenueBySource}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="source" />
                            <YAxis />
                            <RechartsTooltip />
                            <Bar dataKey="revenue" fill={COLORS.success}>
                              {revenueData.revenueBySource.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          No revenue data available
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </Box>
      </Paper>
      
      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)}>
        <DialogTitle>Export Dashboard Data</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Export Format</InputLabel>
            <Select
              value={selectedExportFormat}
              label="Export Format"
              onChange={(e) => setSelectedExportFormat(e.target.value)}
            >
              <MenuItem value="csv">CSV</MenuItem>
              <MenuItem value="json">JSON</MenuItem>
              <MenuItem value="pdf">PDF</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)}>Cancel</Button>
          <Button onClick={() => handleExport(selectedExportFormat)} variant="contained">
            Export
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IDIQDashboard;