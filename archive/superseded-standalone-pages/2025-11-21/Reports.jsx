// src/pages/Reports.jsx - Comprehensive Reporting & Analytics System
import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  IconButton,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Stack,
  LinearProgress,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  Slider,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  PieChart,
  Activity,
  FileText,
  Download,
  Calendar,
  Filter,
  Users,
  DollarSign,
  CreditCard,
  Target,
  Award,
  AlertCircle,
  CheckCircle,
  Clock,
  Mail,
  Phone,
  ChevronRight,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Printer,
  Share2,
  Settings,
  RefreshCw,
  Database,
  Shield,
  Zap,
  Info,
  Hash,
  Percent,
  Star,
  Building,
  Package,
  ShoppingCart,
  Globe,
  Map,
  Layers,
  GitBranch,
  Flag,
  BookOpen
} from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy,
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays, subMonths, subYears, differenceInDays } from 'date-fns';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Treemap,
  Scatter,
  ScatterChart,
  ComposedChart
} from 'recharts';

const Reports = () => {
  const { currentUser } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date()),
    preset: 'thisMonth'
  });
  
  // Report Types
  const [selectedReport, setSelectedReport] = useState('overview');
  const [reportData, setReportData] = useState(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState({
    clientType: 'all',
    disputeStatus: 'all',
    bureau: 'all',
    scoreRange: [0, 850],
    paymentStatus: 'all'
  });

  // Data Collections
  const [overviewData, setOverviewData] = useState({
    totalClients: 0,
    activeClients: 0,
    clientGrowth: 0,
    averageScore: 0,
    scoreImprovement: 0,
    totalDisputes: 0,
    disputeSuccess: 0,
    revenue: 0,
    revenueGrowth: 0,
    avgClientValue: 0,
    retentionRate: 0,
    conversionRate: 0
  });

  const [clientMetrics, setClientMetrics] = useState({
    byStatus: [],
    byScore: [],
    byLocation: [],
    bySource: [],
    byAge: [],
    churnRate: 0,
    lifetimeValue: 0,
    acquisitionCost: 0
  });

  const [disputeMetrics, setDisputeMetrics] = useState({
    byBureau: [],
    byType: [],
    byStatus: [],
    successRate: 0,
    averageResolutionTime: 0,
    itemsRemoved: 0,
    scoreImpact: []
  });

  const [financialMetrics, setFinancialMetrics] = useState({
    revenue: [],
    expenses: [],
    profit: [],
    byService: [],
    byPaymentMethod: [],
    outstandingBalance: 0,
    averagePaymentTime: 0,
    monthlyRecurring: 0
  });

  const [performanceMetrics, setPerformanceMetrics] = useState({
    teamPerformance: [],
    taskCompletion: 0,
    responseTime: 0,
    clientSatisfaction: 0,
    referralRate: 0,
    reviewScore: 0
  });

  // Chart colors
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6'];

  // Report Templates
  const reportTemplates = [
    {
      id: 'overview',
      name: 'Executive Overview',
      icon: BarChart3,
      description: 'High-level business metrics and KPIs',
      sections: ['summary', 'charts', 'trends', 'insights']
    },
    {
      id: 'client',
      name: 'Client Analytics',
      icon: Users,
      description: 'Client demographics, behavior, and segmentation',
      sections: ['demographics', 'activity', 'retention', 'segmentation']
    },
    {
      id: 'dispute',
      name: 'Dispute Performance',
      icon: FileText,
      description: 'Dispute success rates and bureau responses',
      sections: ['success', 'bureaus', 'timelines', 'impact']
    },
    {
      id: 'financial',
      name: 'Financial Reports',
      icon: DollarSign,
      description: 'Revenue, expenses, and profitability analysis',
      sections: ['revenue', 'expenses', 'profit', 'forecasting']
    },
    {
      id: 'score',
      name: 'Credit Score Impact',
      icon: TrendingUp,
      description: 'Score improvements and client progress',
      sections: ['improvements', 'distribution', 'timelines', 'predictions']
    },
    {
      id: 'marketing',
      name: 'Marketing & Acquisition',
      icon: Target,
      description: 'Campaign performance and lead conversion',
      sections: ['campaigns', 'sources', 'conversion', 'roi']
    },
    {
      id: 'operational',
      name: 'Operational Efficiency',
      icon: Activity,
      description: 'Team productivity and process optimization',
      sections: ['productivity', 'workflows', 'bottlenecks', 'optimization']
    },
    {
      id: 'compliance',
      name: 'Compliance & Risk',
      icon: Shield,
      description: 'Regulatory compliance and risk assessment',
      sections: ['compliance', 'disputes', 'documentation', 'risks']
    }
  ];

  // Date range presets
  const datePresets = [
    { label: 'Today', value: 'today' },
    { label: 'Yesterday', value: 'yesterday' },
    { label: 'This Week', value: 'thisWeek' },
    { label: 'Last Week', value: 'lastWeek' },
    { label: 'This Month', value: 'thisMonth' },
    { label: 'Last Month', value: 'lastMonth' },
    { label: 'This Quarter', value: 'thisQuarter' },
    { label: 'Last Quarter', value: 'lastQuarter' },
    { label: 'This Year', value: 'thisYear' },
    { label: 'Last Year', value: 'lastYear' },
    { label: 'Last 30 Days', value: 'last30' },
    { label: 'Last 90 Days', value: 'last90' },
    { label: 'Custom', value: 'custom' }
  ];

  // Load all report data
  const loadReportData = async () => {
    setLoading(true);
    try {
      // Load based on selected report type
      switch (selectedReport) {
        case 'overview':
          await loadOverviewData();
          break;
        case 'client':
          await loadClientData();
          break;
        case 'dispute':
          await loadDisputeData();
          break;
        case 'financial':
          await loadFinancialData();
          break;
        case 'score':
          await loadScoreData();
          break;
        case 'marketing':
          await loadMarketingData();
          break;
        case 'operational':
          await loadOperationalData();
          break;
        case 'compliance':
          await loadComplianceData();
          break;
        default:
          await loadOverviewData();
      }
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load overview data
  const loadOverviewData = async () => {
    // Clients
    const clientsQuery = query(
      collection(db, 'contacts'),
      where('userId', '==', currentUser.uid),
      where('createdAt', '>=', Timestamp.fromDate(dateRange.start)),
      where('createdAt', '<=', Timestamp.fromDate(dateRange.end))
    );
    const clientsSnapshot = await getDocs(clientsQuery);
    
    // Calculate client metrics
    let totalClients = 0;
    let activeClients = 0;
    let totalScores = 0;
    let scoreCount = 0;
    
    clientsSnapshot.forEach(doc => {
      const data = doc.data();
      totalClients++;
      if (data.status === 'active') activeClients++;
      if (data.creditScore) {
        totalScores += data.creditScore;
        scoreCount++;
      }
    });
    
    // Disputes
    const disputesQuery = query(
      collection(db, 'disputeLetters'),
      where('userId', '==', currentUser.uid),
      where('createdAt', '>=', Timestamp.fromDate(dateRange.start)),
      where('createdAt', '<=', Timestamp.fromDate(dateRange.end))
    );
    const disputesSnapshot = await getDocs(disputesQuery);
    
    let totalDisputes = 0;
    let successfulDisputes = 0;
    
    disputesSnapshot.forEach(doc => {
      const data = doc.data();
      totalDisputes++;
      if (data.status === 'successful') successfulDisputes++;
    });
    
    // Invoices/Revenue
    const invoicesQuery = query(
      collection(db, 'invoices'),
      where('userId', '==', currentUser.uid),
      where('createdAt', '>=', Timestamp.fromDate(dateRange.start)),
      where('createdAt', '<=', Timestamp.fromDate(dateRange.end)),
      where('status', '==', 'paid')
    );
    const invoicesSnapshot = await getDocs(invoicesQuery);
    
    let totalRevenue = 0;
    invoicesSnapshot.forEach(doc => {
      const data = doc.data();
      totalRevenue += data.total || 0;
    });
    
    // Calculate growth rates (compare with previous period)
    const previousStart = new Date(dateRange.start);
    previousStart.setMonth(previousStart.getMonth() - 1);
    const previousEnd = new Date(dateRange.end);
    previousEnd.setMonth(previousEnd.getMonth() - 1);
    
    const prevClientsQuery = query(
      collection(db, 'contacts'),
      where('userId', '==', currentUser.uid),
      where('createdAt', '>=', Timestamp.fromDate(previousStart)),
      where('createdAt', '<=', Timestamp.fromDate(previousEnd))
    );
    const prevClientsSnapshot = await getDocs(prevClientsQuery);
    const previousClients = prevClientsSnapshot.size;
    
    const clientGrowth = previousClients > 0 
      ? ((totalClients - previousClients) / previousClients * 100).toFixed(1)
      : 0;
    
    setOverviewData({
      totalClients,
      activeClients,
      clientGrowth,
      averageScore: scoreCount > 0 ? Math.round(totalScores / scoreCount) : 0,
      scoreImprovement: 35, // Mock data - would calculate from historical scores
      totalDisputes,
      disputeSuccess: totalDisputes > 0 ? Math.round(successfulDisputes / totalDisputes * 100) : 0,
      revenue: totalRevenue,
      revenueGrowth: 12.5, // Mock data - would calculate from previous period
      avgClientValue: activeClients > 0 ? totalRevenue / activeClients : 0,
      retentionRate: 89, // Mock data - would calculate from churn
      conversionRate: 28 // Mock data - would calculate from leads
    });
  };

  // Load client data
  const loadClientData = async () => {
    const clientsQuery = query(
      collection(db, 'contacts'),
      where('userId', '==', currentUser.uid)
    );
    const clientsSnapshot = await getDocs(clientsQuery);
    
    const statusBreakdown = {};
    const scoreRanges = {
      '300-499': 0,
      '500-599': 0,
      '600-699': 0,
      '700-799': 0,
      '800-850': 0
    };
    const locations = {};
    const sources = {};
    
    clientsSnapshot.forEach(doc => {
      const data = doc.data();
      
      // Status
      statusBreakdown[data.status || 'active'] = (statusBreakdown[data.status || 'active'] || 0) + 1;
      
      // Score ranges
      if (data.creditScore) {
        if (data.creditScore < 500) scoreRanges['300-499']++;
        else if (data.creditScore < 600) scoreRanges['500-599']++;
        else if (data.creditScore < 700) scoreRanges['600-699']++;
        else if (data.creditScore < 800) scoreRanges['700-799']++;
        else scoreRanges['800-850']++;
      }
      
      // Location
      if (data.state) {
        locations[data.state] = (locations[data.state] || 0) + 1;
      }
      
      // Source
      if (data.source) {
        sources[data.source] = (sources[data.source] || 0) + 1;
      }
    });
    
    setClientMetrics({
      byStatus: Object.entries(statusBreakdown).map(([name, value]) => ({ name, value })),
      byScore: Object.entries(scoreRanges).map(([name, value]) => ({ name, value })),
      byLocation: Object.entries(locations).map(([name, value]) => ({ name, value })).slice(0, 10),
      bySource: Object.entries(sources).map(([name, value]) => ({ name, value })),
      byAge: [], // Would calculate from creation dates
      churnRate: 8.5, // Mock data
      lifetimeValue: 1847, // Mock data
      acquisitionCost: 127 // Mock data
    });
  };

  // Load dispute data
  const loadDisputeData = async () => {
    const disputesQuery = query(
      collection(db, 'disputeLetters'),
      where('userId', '==', currentUser.uid),
      where('createdAt', '>=', Timestamp.fromDate(dateRange.start)),
      where('createdAt', '<=', Timestamp.fromDate(dateRange.end))
    );
    const disputesSnapshot = await getDocs(disputesQuery);
    
    const bureauBreakdown = { equifax: 0, experian: 0, transunion: 0 };
    const typeBreakdown = {};
    const statusBreakdown = {};
    let totalResolutionDays = 0;
    let resolvedCount = 0;
    
    disputesSnapshot.forEach(doc => {
      const data = doc.data();
      
      // Bureau
      if (data.bureau) {
        bureauBreakdown[data.bureau] = (bureauBreakdown[data.bureau] || 0) + 1;
      }
      
      // Type
      typeBreakdown[data.disputeType || 'other'] = (typeBreakdown[data.disputeType || 'other'] || 0) + 1;
      
      // Status
      statusBreakdown[data.status || 'pending'] = (statusBreakdown[data.status || 'pending'] || 0) + 1;
      
      // Resolution time
      if (data.status === 'resolved' && data.resolvedAt && data.createdAt) {
        const created = data.createdAt.toDate();
        const resolved = data.resolvedAt.toDate();
        const days = differenceInDays(resolved, created);
        totalResolutionDays += days;
        resolvedCount++;
      }
    });
    
    setDisputeMetrics({
      byBureau: Object.entries(bureauBreakdown).map(([name, value]) => ({ name, value })),
      byType: Object.entries(typeBreakdown).map(([name, value]) => ({ name, value })),
      byStatus: Object.entries(statusBreakdown).map(([name, value]) => ({ name, value })),
      successRate: 67, // Mock data
      averageResolutionTime: resolvedCount > 0 ? Math.round(totalResolutionDays / resolvedCount) : 0,
      itemsRemoved: 234, // Mock data
      scoreImpact: [
        { month: 'Jan', avgIncrease: 42 },
        { month: 'Feb', avgIncrease: 38 },
        { month: 'Mar', avgIncrease: 51 },
        { month: 'Apr', avgIncrease: 47 },
        { month: 'May', avgIncrease: 55 },
        { month: 'Jun', avgIncrease: 61 }
      ]
    });
  };

  // Load financial data
  const loadFinancialData = async () => {
    const invoicesQuery = query(
      collection(db, 'invoices'),
      where('userId', '==', currentUser.uid),
      where('createdAt', '>=', Timestamp.fromDate(dateRange.start)),
      where('createdAt', '<=', Timestamp.fromDate(dateRange.end))
    );
    const invoicesSnapshot = await getDocs(invoicesQuery);
    
    const monthlyRevenue = {};
    const serviceRevenue = {};
    const paymentMethods = {};
    let outstanding = 0;
    
    invoicesSnapshot.forEach(doc => {
      const data = doc.data();
      const month = format(data.createdAt.toDate(), 'MMM');
      
      if (data.status === 'paid') {
        monthlyRevenue[month] = (monthlyRevenue[month] || 0) + data.total;
        
        // By service (from invoice items)
        data.items?.forEach(item => {
          serviceRevenue[item.name] = (serviceRevenue[item.name] || 0) + item.total;
        });
        
        // Payment method
        if (data.paymentMethod) {
          paymentMethods[data.paymentMethod] = (paymentMethods[data.paymentMethod] || 0) + 1;
        }
      } else if (data.status === 'sent' || data.status === 'overdue') {
        outstanding += data.total;
      }
    });
    
    setFinancialMetrics({
      revenue: Object.entries(monthlyRevenue).map(([month, amount]) => ({ month, amount })),
      expenses: [], // Would load from expenses collection
      profit: [], // Calculate from revenue - expenses
      byService: Object.entries(serviceRevenue).map(([name, value]) => ({ name, value })),
      byPaymentMethod: Object.entries(paymentMethods).map(([name, value]) => ({ name, value })),
      outstandingBalance: outstanding,
      averagePaymentTime: 18, // Mock data
      monthlyRecurring: 24580 // Mock data
    });
  };

  // Stub functions for other report types
  const loadScoreData = async () => {
    // Implementation for score data
  };

  const loadMarketingData = async () => {
    // Implementation for marketing data
  };

  const loadOperationalData = async () => {
    // Implementation for operational data
  };

  const loadComplianceData = async () => {
    // Implementation for compliance data
  };

  // Export report as PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    const template = reportTemplates.find(t => t.id === selectedReport);
    
    // Header
    doc.setFontSize(20);
    doc.text(template.name, 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`${format(dateRange.start, 'MM/dd/yyyy')} - ${format(dateRange.end, 'MM/dd/yyyy')}`, 105, 30, { align: 'center' });
    
    // Add content based on report type
    let yPosition = 50;
    
    if (selectedReport === 'overview') {
      doc.text('Executive Summary', 20, yPosition);
      yPosition += 10;
      doc.setFontSize(10);
      doc.text(`Total Clients: ${overviewData.totalClients}`, 20, yPosition);
      yPosition += 7;
      doc.text(`Active Clients: ${overviewData.activeClients}`, 20, yPosition);
      yPosition += 7;
      doc.text(`Revenue: $${overviewData.revenue.toFixed(2)}`, 20, yPosition);
      yPosition += 7;
      doc.text(`Dispute Success Rate: ${overviewData.disputeSuccess}%`, 20, yPosition);
    }
    
    // Add tables, charts, etc. based on report type
    
    doc.save(`${template.name}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  // Export report as Excel
  const exportExcel = () => {
    const wb = XLSX.utils.book_new();
    const template = reportTemplates.find(t => t.id === selectedReport);
    
    // Create worksheet data based on report type
    let wsData = [];
    
    if (selectedReport === 'overview') {
      wsData = [
        ['Metric', 'Value'],
        ['Total Clients', overviewData.totalClients],
        ['Active Clients', overviewData.activeClients],
        ['Client Growth', `${overviewData.clientGrowth}%`],
        ['Average Score', overviewData.averageScore],
        ['Revenue', `$${overviewData.revenue.toFixed(2)}`],
        ['Dispute Success Rate', `${overviewData.disputeSuccess}%`]
      ];
    } else if (selectedReport === 'client') {
      wsData = [
        ['Client Metrics', ''],
        ['Status', 'Count'],
        ...clientMetrics.byStatus.map(item => [item.name, item.value])
      ];
    }
    
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, template.name);
    
    // Save file
    XLSX.writeFile(wb, `${template.name}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  // Handle date preset change
  const handleDatePresetChange = (preset) => {
    const now = new Date();
    let start, end;
    
    switch (preset) {
      case 'today':
        start = startOfDay(now);
        end = endOfDay(now);
        break;
      case 'yesterday':
        start = startOfDay(subDays(now, 1));
        end = endOfDay(subDays(now, 1));
        break;
      case 'thisWeek':
        start = startOfWeek(now);
        end = endOfWeek(now);
        break;
      case 'lastWeek':
        start = startOfWeek(subDays(now, 7));
        end = endOfWeek(subDays(now, 7));
        break;
      case 'thisMonth':
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
      case 'lastMonth':
        start = startOfMonth(subMonths(now, 1));
        end = endOfMonth(subMonths(now, 1));
        break;
      case 'thisQuarter':
        const quarter = Math.floor(now.getMonth() / 3);
        start = new Date(now.getFullYear(), quarter * 3, 1);
        end = new Date(now.getFullYear(), quarter * 3 + 3, 0);
        break;
      case 'thisYear':
        start = startOfYear(now);
        end = endOfYear(now);
        break;
      case 'last30':
        start = subDays(now, 30);
        end = now;
        break;
      case 'last90':
        start = subDays(now, 90);
        end = now;
        break;
      default:
        return;
    }
    
    setDateRange({ start, end, preset });
  };

  // Initialize
  useEffect(() => {
    if (currentUser) {
      loadReportData();
    }
  }, [currentUser, selectedReport, dateRange]);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight={600}>
              Reports & Analytics
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Comprehensive business intelligence and insights
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshCw size={20} />}
              onClick={loadReportData}
            >
              Refresh
            </Button>
            <Button
              variant="outlined"
              startIcon={<Download size={20} />}
              onClick={() => setExportDialogOpen(true)}
            >
              Export
            </Button>
            <Button
              variant="contained"
              startIcon={<Calendar size={20} />}
              onClick={() => setScheduleDialogOpen(true)}
            >
              Schedule Report
            </Button>
          </Box>
        </Box>

        {/* Date Range Selector */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <Select
                value={dateRange.preset}
                onChange={(e) => handleDatePresetChange(e.target.value)}
              >
                {datePresets.map(preset => (
                  <MenuItem key={preset.value} value={preset.value}>
                    {preset.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {dateRange.preset === 'custom' && (
              <>
                <DatePicker
                  label="Start Date"
                  value={dateRange.start}
                  onChange={(date) => setDateRange(prev => ({ ...prev, start: date }))}
                  renderInput={(params) => <TextField {...params} size="small" />}
                />
                <DatePicker
                  label="End Date"
                  value={dateRange.end}
                  onChange={(date) => setDateRange(prev => ({ ...prev, end: date }))}
                  renderInput={(params) => <TextField {...params} size="small" />}
                />
              </>
            )}
            
            <Typography variant="body2" color="text.secondary">
              Showing data from {format(dateRange.start, 'MMM dd, yyyy')} to {format(dateRange.end, 'MMM dd, yyyy')}
            </Typography>
          </Box>
        </Paper>

        {/* Report Type Selector */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {reportTemplates.map(template => {
            const Icon = template.icon;
            return (
              <Grid item xs={12} sm={6} md={3} key={template.id}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    border: selectedReport === template.id ? 2 : 0,
                    borderColor: 'primary.main'
                  }}
                  onClick={() => setSelectedReport(template.id)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Icon size={20} />
                      <Typography variant="h6" sx={{ ml: 1 }}>
                        {template.name}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {template.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Report Content */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Overview Report */}
            {selectedReport === 'overview' && (
              <Grid container spacing={3}>
                {/* KPI Cards */}
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">Total Clients</Typography>
                      <Typography variant="h4" fontWeight={600}>{overviewData.totalClients}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <TrendingUp size={16} color="#10B981" />
                        <Typography variant="caption" color="success.main" sx={{ ml: 1 }}>
                          {overviewData.clientGrowth}% growth
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">Revenue</Typography>
                      <Typography variant="h4" fontWeight={600}>
                        ${overviewData.revenue.toLocaleString()}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <TrendingUp size={16} color="#10B981" />
                        <Typography variant="caption" color="success.main" sx={{ ml: 1 }}>
                          {overviewData.revenueGrowth}% growth
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">Avg Credit Score</Typography>
                      <Typography variant="h4" fontWeight={600}>{overviewData.averageScore}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <ArrowUp size={16} color="#10B981" />
                        <Typography variant="caption" color="success.main" sx={{ ml: 1 }}>
                          +{overviewData.scoreImprovement} pts avg
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">Dispute Success</Typography>
                      <Typography variant="h4" fontWeight={600}>{overviewData.disputeSuccess}%</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <CheckCircle size={16} color="#10B981" />
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                          {overviewData.totalDisputes} total disputes
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Charts */}
                <Grid item xs={12} md={8}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>Revenue Trend</Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={financialMetrics.revenue}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <ChartTooltip />
                        <Area type="monotone" dataKey="amount" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>Client Distribution</Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsePieChart>
                        <Pie
                          data={clientMetrics.byStatus}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                        >
                          {clientMetrics.byStatus.map((entry, index) => (
                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <ChartTooltip />
                        <Legend />
                      </RechartsePieChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
              </Grid>
            )}

            {/* Client Analytics Report */}
            {selectedReport === 'client' && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>Credit Score Distribution</Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={clientMetrics.byScore}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <ChartTooltip />
                        <Bar dataKey="value" fill="#3B82F6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>Top Locations</Typography>
                    <List dense>
                      {clientMetrics.byLocation.slice(0, 5).map((location, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <MapPin size={16} />
                          </ListItemIcon>
                          <ListItemText primary={location.name} />
                          <Typography variant="body2">{location.value} clients</Typography>
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Grid>
              </Grid>
            )}

            {/* Dispute Performance Report */}
            {selectedReport === 'dispute' && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>By Bureau</Typography>
                    <ResponsiveContainer width="100%" height={250}>
                      <RechartsePieChart>
                        <Pie
                          data={disputeMetrics.byBureau}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                        >
                          {disputeMetrics.byBureau.map((entry, index) => (
                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <ChartTooltip />
                        <Legend />
                      </RechartsePieChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={8}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>Score Impact Over Time</Typography>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={disputeMetrics.scoreImpact}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <ChartTooltip />
                        <Line type="monotone" dataKey="avgIncrease" stroke="#10B981" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
              </Grid>
            )}
          </>
        )}

        {/* Export Dialog */}
        <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)}>
          <DialogTitle>Export Report</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Choose export format for {reportTemplates.find(t => t.id === selectedReport)?.name}
            </Typography>
            <Stack spacing={2}>
              <Button
                variant="outlined"
                startIcon={<FileText />}
                onClick={() => {
                  exportPDF();
                  setExportDialogOpen(false);
                }}
                fullWidth
              >
                Export as PDF
              </Button>
              <Button
                variant="outlined"
                startIcon={<FileText />}
                onClick={() => {
                  exportExcel();
                  setExportDialogOpen(false);
                }}
                fullWidth
              >
                Export as Excel
              </Button>
            </Stack>
          </DialogContent>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default Reports;