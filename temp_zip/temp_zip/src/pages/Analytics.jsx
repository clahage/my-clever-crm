// Analytics.jsx - Professional Analytics Dashboard for Credit Repair CRM
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Chip,
  Alert,
  IconButton,
  Tooltip,
  LinearProgress,
  Switch,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
  Avatar,
  Badge,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Container
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Activity,
  Award,
  AlertCircle,
  Calendar,
  Clock,
  Target,
  BarChart3,
  PieChart,
  Download,
  Filter,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  CreditCard,
  FileText,
  CheckCircle,
  XCircle,
  Star,
  Zap,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Building,
  UserCheck,
  UserX,
  Mail,
  Phone,
  MessageSquare
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as ReChartPie,
  Pie,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Cell,
  ComposedChart,
  Scatter,
  ScatterChart,
  Treemap
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

const Analytics = () => {
  const { currentUser } = useAuth();
  const [timeRange, setTimeRange] = useState('30days');
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('overview');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  
  // Mock data state (replace with real Firebase data)
  const [analyticsData, setAnalyticsData] = useState({
    revenue: {
      current: 48750,
      previous: 42300,
      trend: 15.2,
      mrr: 12500,
      arr: 150000
    },
    clients: {
      total: 347,
      active: 289,
      new: 23,
      churned: 5,
      retention: 94.8
    },
    disputes: {
      total: 1247,
      resolved: 987,
      pending: 189,
      success_rate: 79.2,
      avg_resolution_days: 21
    },
    scores: {
      average_improvement: 87,
      best_improvement: 215,
      clients_improved: 92,
      avg_starting: 543,
      avg_current: 630
    }
  });

  // Revenue trend data
  const revenueData = [
    { month: 'Jan', revenue: 35000, clients: 280, avgTicket: 125 },
    { month: 'Feb', revenue: 38000, clients: 295, avgTicket: 129 },
    { month: 'Mar', revenue: 41000, clients: 310, avgTicket: 132 },
    { month: 'Apr', revenue: 39500, clients: 305, avgTicket: 130 },
    { month: 'May', revenue: 44000, clients: 325, avgTicket: 135 },
    { month: 'Jun', revenue: 48750, clients: 347, avgTicket: 141 }
  ];

  // Client acquisition data
  const acquisitionData = [
    { source: 'Referrals', clients: 142, revenue: 18500, conversion: 32 },
    { source: 'Google Ads', clients: 89, revenue: 11200, conversion: 18 },
    { source: 'Social Media', clients: 67, revenue: 8400, conversion: 22 },
    { source: 'Direct', clients: 31, revenue: 4200, conversion: 45 },
    { source: 'Partners', clients: 18, revenue: 6450, conversion: 67 }
  ];

  // Service performance data
  const serviceData = [
    { service: 'Credit Repair', clients: 289, revenue: 28900, satisfaction: 4.7 },
    { service: 'Business Credit', clients: 124, revenue: 18600, satisfaction: 4.8 },
    { service: 'Credit Monitoring', clients: 201, revenue: 4020, satisfaction: 4.5 },
    { service: 'Consultation', clients: 67, revenue: 3350, satisfaction: 4.9 }
  ];

  // Score improvement distribution
  const scoreDistribution = [
    { range: '0-25', count: 12 },
    { range: '26-50', count: 34 },
    { range: '51-75', count: 67 },
    { range: '76-100', count: 89 },
    { range: '101-150', count: 72 },
    { range: '150+', count: 15 }
  ];

  // Team performance data
  const teamPerformance = [
    { name: 'Sarah Johnson', clients: 67, revenue: 12450, satisfaction: 4.8, disputes: 234 },
    { name: 'Mike Chen', clients: 54, revenue: 10200, satisfaction: 4.7, disputes: 189 },
    { name: 'Lisa Williams', clients: 48, revenue: 8900, satisfaction: 4.9, disputes: 167 },
    { name: 'James Davis', clients: 42, revenue: 7800, satisfaction: 4.6, disputes: 145 },
    { name: 'Emily Brown', clients: 38, revenue: 6900, satisfaction: 4.7, disputes: 123 }
  ];

  // Predictive revenue forecast
  const forecastData = [
    { month: 'Jul', predicted: 52000, optimistic: 55000, conservative: 49000 },
    { month: 'Aug', predicted: 54500, optimistic: 58000, conservative: 51000 },
    { month: 'Sep', predicted: 57000, optimistic: 61000, conservative: 53000 },
    { month: 'Oct', predicted: 58500, optimistic: 63000, conservative: 54000 },
    { month: 'Nov', predicted: 60000, optimistic: 65000, conservative: 55000 },
    { month: 'Dec', predicted: 62000, optimistic: 68000, conservative: 56000 }
  ];

  // Client lifetime value cohort
  const cohortData = [
    { cohort: 'Q1 2024', clients: 87, ltv: 1850, retention: 92 },
    { cohort: 'Q2 2024', clients: 92, ltv: 1920, retention: 94 },
    { cohort: 'Q3 2024', clients: 78, ltv: 1780, retention: 89 },
    { cohort: 'Q4 2024', clients: 103, ltv: 2100, retention: 96 }
  ];

  // Activity heatmap data
  const activityData = Array.from({ length: 24 }, (_, hour) => ({
    hour: `${hour}:00`,
    monday: Math.floor(Math.random() * 50),
    tuesday: Math.floor(Math.random() * 50),
    wednesday: Math.floor(Math.random() * 50),
    thursday: Math.floor(Math.random() * 50),
    friday: Math.floor(Math.random() * 50),
    saturday: Math.floor(Math.random() * 30),
    sunday: Math.floor(Math.random() * 20)
  }));

  // Colors for charts
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  // Calculate growth percentage
  const calculateGrowth = (current, previous) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(value);
  };

  // Load analytics data from Firebase
  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true);
      try {
        // This would be replaced with actual Firebase queries
        // Example:
        // const contactsQuery = query(
        //   collection(db, 'contacts'),
        //   where('userId', '==', currentUser.uid),
        //   orderBy('createdAt', 'desc')
        // );
        // const snapshot = await getDocs(contactsQuery);
        
        // Simulate loading
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error loading analytics:', error);
        setLoading(false);
      }
    };

    if (currentUser) {
      loadAnalytics();
    }
  }, [currentUser, timeRange]);

  // Export data function
  const exportData = () => {
    // Implement CSV/Excel export
    console.log('Exporting analytics data...');
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BarChart3 /> Analytics Dashboard
            </Typography>
            <Typography color="text.secondary">
              Comprehensive insights for {currentUser?.email || 'your business'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mt: { xs: 2, sm: 0 } }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                displayEmpty
              >
                <MenuItem value="7days">Last 7 days</MenuItem>
                <MenuItem value="30days">Last 30 days</MenuItem>
                <MenuItem value="90days">Last 90 days</MenuItem>
                <MenuItem value="12months">Last 12 months</MenuItem>
                <MenuItem value="custom">Custom Range</MenuItem>
              </Select>
            </FormControl>
            <Button startIcon={<RefreshCw />} variant="outlined" onClick={() => window.location.reload()}>
              Refresh
            </Button>
            <Button startIcon={<Download />} variant="contained" onClick={exportData}>
              Export
            </Button>
          </Box>
        </Box>

        {/* Key Metrics Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                      Monthly Revenue
                    </Typography>
                    <Typography variant="h4" sx={{ my: 1 }}>
                      {formatCurrency(analyticsData.revenue.current)}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {analyticsData.revenue.trend > 0 ? (
                        <ArrowUpRight size={16} />
                      ) : (
                        <ArrowDownRight size={16} />
                      )}
                      <Typography variant="body2">
                        {analyticsData.revenue.trend}% from last month
                      </Typography>
                    </Box>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}>
                    <DollarSign />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                      Active Clients
                    </Typography>
                    <Typography variant="h4" sx={{ my: 1 }}>
                      {analyticsData.clients.active}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <UserCheck size={16} />
                      <Typography variant="body2">
                        {analyticsData.clients.new} new this month
                      </Typography>
                    </Box>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}>
                    <Users />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                      Dispute Success Rate
                    </Typography>
                    <Typography variant="h4" sx={{ my: 1 }}>
                      {analyticsData.disputes.success_rate}%
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <CheckCircle size={16} />
                      <Typography variant="body2">
                        {analyticsData.disputes.resolved} resolved
                      </Typography>
                    </Box>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}>
                    <FileText />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'info.main', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                      Avg Score Improvement
                    </Typography>
                    <Typography variant="h4" sx={{ my: 1 }}>
                      +{analyticsData.scores.average_improvement}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <TrendingUp size={16} />
                      <Typography variant="body2">
                        {analyticsData.scores.clients_improved}% improved
                      </Typography>
                    </Box>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}>
                    <Target />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Main Content Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs 
            value={activeTab} 
            onChange={(e, v) => setActiveTab(v)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Revenue Analytics" icon={<DollarSign size={20} />} />
            <Tab label="Client Insights" icon={<Users size={20} />} />
            <Tab label="Service Performance" icon={<Activity size={20} />} />
            <Tab label="Team Metrics" icon={<Award size={20} />} />
            <Tab label="Predictive Analysis" icon={<TrendingUp size={20} />} />
          </Tabs>
        </Paper>

        {/* Revenue Analytics Tab */}
        {activeTab === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Revenue Trend
                </Typography>
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Legend />
                    <Bar yAxisId="left" dataKey="revenue" fill="#3B82F6" name="Revenue ($)" />
                    <Line yAxisId="right" type="monotone" dataKey="avgTicket" stroke="#10B981" name="Avg Ticket ($)" strokeWidth={2} />
                    <Line yAxisId="right" type="monotone" dataKey="clients" stroke="#F59E0B" name="Client Count" strokeDasharray="5 5" />
                  </ComposedChart>
                </ResponsiveContainer>
              </Paper>

              <Paper sx={{ p: 3, mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Revenue by Source
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Source</TableCell>
                        <TableCell align="right">Clients</TableCell>
                        <TableCell align="right">Revenue</TableCell>
                        <TableCell align="right">Conversion</TableCell>
                        <TableCell align="right">Avg Value</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {acquisitionData.map((row) => (
                        <TableRow key={row.source}>
                          <TableCell>{row.source}</TableCell>
                          <TableCell align="right">{row.clients}</TableCell>
                          <TableCell align="right">{formatCurrency(row.revenue)}</TableCell>
                          <TableCell align="right">
                            <Chip 
                              label={`${row.conversion}%`}
                              size="small"
                              color={row.conversion > 30 ? 'success' : 'default'}
                            />
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(row.revenue / row.clients)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>

            <Grid item xs={12} lg={4}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Revenue Breakdown
                </Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={serviceData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="revenue"
                      label={({ service, percent }) => `${service}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {serviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                <Divider sx={{ my: 2 }} />

                <List>
                  <ListItem>
                    <ListItemText primary="Monthly Recurring Revenue" />
                    <Typography variant="h6" color="primary">
                      {formatCurrency(analyticsData.revenue.mrr)}
                    </Typography>
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Annual Run Rate" />
                    <Typography variant="h6" color="success.main">
                      {formatCurrency(analyticsData.revenue.arr)}
                    </Typography>
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Avg Customer Value" />
                    <Typography variant="h6">
                      {formatCurrency(analyticsData.revenue.current / analyticsData.clients.active)}
                    </Typography>
                  </ListItem>
                </List>
              </Paper>

              <Paper sx={{ p: 3, mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Quick Stats
                </Typography>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Collection Rate</Typography>
                    <Typography variant="body2" fontWeight="bold">96.5%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={96.5} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Retention Rate</Typography>
                    <Typography variant="body2" fontWeight="bold">{analyticsData.clients.retention}%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={analyticsData.clients.retention} color="success" />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Upsell Rate</Typography>
                    <Typography variant="body2" fontWeight="bold">23%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={23} color="warning" />
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Client Insights Tab */}
        {activeTab === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Client Acquisition Trend
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Area type="monotone" dataKey="clients" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Score Improvement Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={scoreDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Bar dataKey="count" fill="#10B981">
                      {scoreDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Client Lifetime Value by Cohort
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={cohortData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="cohort" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Legend />
                    <Bar yAxisId="left" dataKey="ltv" fill="#3B82F6" name="LTV ($)" />
                    <Bar yAxisId="left" dataKey="clients" fill="#10B981" name="Clients" />
                    <Line yAxisId="right" type="monotone" dataKey="retention" stroke="#F59E0B" name="Retention (%)" strokeWidth={2} />
                  </ComposedChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Client Status
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <Badge badgeContent={analyticsData.clients.active} color="success">
                        <UserCheck />
                      </Badge>
                    </ListItemIcon>
                    <ListItemText primary="Active Clients" secondary="Currently enrolled" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Badge badgeContent={analyticsData.clients.new} color="primary">
                        <Users />
                      </Badge>
                    </ListItemIcon>
                    <ListItemText primary="New This Month" secondary="Recent signups" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Badge badgeContent={analyticsData.clients.churned} color="error">
                        <UserX />
                      </Badge>
                    </ListItemIcon>
                    <ListItemText primary="Churned" secondary="Lost this month" />
                  </ListItem>
                </List>
              </Paper>
            </Grid>

            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Engagement Metrics
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Avatar sx={{ mx: 'auto', mb: 1, bgcolor: 'primary.main' }}>
                        <Mail />
                      </Avatar>
                      <Typography variant="h6">87%</Typography>
                      <Typography variant="caption">Email Open Rate</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Avatar sx={{ mx: 'auto', mb: 1, bgcolor: 'success.main' }}>
                        <Phone />
                      </Avatar>
                      <Typography variant="h6">62%</Typography>
                      <Typography variant="caption">Call Answer Rate</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Avatar sx={{ mx: 'auto', mb: 1, bgcolor: 'warning.main' }}>
                        <MessageSquare />
                      </Avatar>
                      <Typography variant="h6">4.2</Typography>
                      <Typography variant="caption">Avg Messages/Client</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Avatar sx={{ mx: 'auto', mb: 1, bgcolor: 'info.main' }}>
                        <Clock />
                      </Avatar>
                      <Typography variant="h6">18m</Typography>
                      <Typography variant="caption">Avg Response Time</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Service Performance Tab */}
        {activeTab === 2 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Service Performance Matrix
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Service</TableCell>
                        <TableCell align="center">Active Clients</TableCell>
                        <TableCell align="center">Revenue</TableCell>
                        <TableCell align="center">Avg Duration</TableCell>
                        <TableCell align="center">Success Rate</TableCell>
                        <TableCell align="center">Satisfaction</TableCell>
                        <TableCell align="center">Trend</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {serviceData.map((service) => (
                        <TableRow key={service.service}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CreditCard size={20} />
                              {service.service}
                            </Box>
                          </TableCell>
                          <TableCell align="center">{service.clients}</TableCell>
                          <TableCell align="center">{formatCurrency(service.revenue)}</TableCell>
                          <TableCell align="center">4.2 months</TableCell>
                          <TableCell align="center">
                            <Chip label="82%" color="success" size="small" />
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                              <Star size={16} color="#F59E0B" />
                              {service.satisfaction}
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <TrendingUp size={20} color="#10B981" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>

            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Dispute Resolution Timeline
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#3B82F6" name="Submitted" strokeWidth={2} />
                    <Line type="monotone" dataKey="clients" stroke="#10B981" name="Resolved" strokeWidth={2} />
                    <Line type="monotone" dataKey="avgTicket" stroke="#F59E0B" name="Pending" strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Resolution Stats
                </Typography>
                <Stack spacing={3}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Average Resolution Time</Typography>
                      <Typography variant="body2" fontWeight="bold">21 days</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={65} />
                  </Box>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">First Response Time</Typography>
                      <Typography variant="body2" fontWeight="bold">2.4 hours</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={85} color="success" />
                  </Box>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Customer Effort Score</Typography>
                      <Typography variant="body2" fontWeight="bold">3.2/5</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={64} color="warning" />
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Team Metrics Tab */}
        {activeTab === 3 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Team Performance Dashboard
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Team Member</TableCell>
                        <TableCell align="center">Active Clients</TableCell>
                        <TableCell align="center">Revenue Generated</TableCell>
                        <TableCell align="center">Disputes Handled</TableCell>
                        <TableCell align="center">Satisfaction Score</TableCell>
                        <TableCell align="center">Performance</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {teamPerformance.map((member) => (
                        <TableRow key={member.name}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar sx={{ width: 32, height: 32 }}>
                                {member.name.split(' ').map(n => n[0]).join('')}
                              </Avatar>
                              {member.name}
                            </Box>
                          </TableCell>
                          <TableCell align="center">{member.clients}</TableCell>
                          <TableCell align="center">{formatCurrency(member.revenue)}</TableCell>
                          <TableCell align="center">{member.disputes}</TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                              <Star size={16} color="#F59E0B" />
                              {member.satisfaction}
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <LinearProgress 
                              variant="determinate" 
                              value={member.satisfaction * 20} 
                              sx={{ width: 100 }}
                              color={member.satisfaction >= 4.7 ? 'success' : 'warning'}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Team Productivity Trend
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={[
                    { metric: 'Clients', value: 85 },
                    { metric: 'Revenue', value: 92 },
                    { metric: 'Disputes', value: 78 },
                    { metric: 'Satisfaction', value: 94 },
                    { metric: 'Efficiency', value: 87 },
                    { metric: 'Growth', value: 73 }
                  ]}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="Team Average" dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Activity Heatmap (This Week)
                </Typography>
                <Box sx={{ overflowX: 'auto' }}>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 0.5, minWidth: 400 }}>
                    <Box />
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                      <Typography key={day} variant="caption" sx={{ textAlign: 'center' }}>
                        {day}
                      </Typography>
                    ))}
                    {['9AM', '12PM', '3PM', '6PM'].map(time => (
                      <React.Fragment key={time}>
                        <Typography variant="caption">{time}</Typography>
                        {[1, 2, 3, 4, 5, 6, 7].map(day => {
                          const intensity = Math.random();
                          return (
                            <Box
                              key={`${time}-${day}`}
                              sx={{
                                bgcolor: `rgba(59, 130, 246, ${intensity})`,
                                borderRadius: 0.5,
                                aspectRatio: '1/1'
                              }}
                            />
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Predictive Analysis Tab */}
        {activeTab === 4 && (
          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Revenue Forecast (Next 6 Months)
                </Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Based on historical data, seasonality, and current growth rate
                </Alert>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={forecastData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Legend />
                    <Area type="monotone" dataKey="conservative" stackId="1" stroke="#94A3B8" fill="#94A3B8" fillOpacity={0.4} name="Conservative" />
                    <Area type="monotone" dataKey="predicted" stackId="2" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} name="Predicted" />
                    <Area type="monotone" dataKey="optimistic" stackId="3" stroke="#10B981" fill="#10B981" fillOpacity={0.4} name="Optimistic" />
                  </AreaChart>
                </ResponsiveContainer>
              </Paper>

              <Paper sx={{ p: 3, mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Churn Risk Analysis
                </Typography>
                <List>
                  {[
                    { name: 'John Smith', risk: 85, reason: 'No engagement for 30 days', value: 250 },
                    { name: 'Mary Johnson', risk: 72, reason: 'Payment failed twice', value: 180 },
                    { name: 'David Wilson', risk: 68, reason: 'Low satisfaction score', value: 320 },
                    { name: 'Lisa Anderson', risk: 45, reason: 'Reduced activity', value: 150 }
                  ].map((client) => (
                    <ListItem key={client.name} sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: client.risk > 70 ? 'error.main' : 'warning.main' }}>
                          {client.risk}%
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={client.name}
                        secondary={client.reason}
                      />
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body2" fontWeight="bold">
                          {formatCurrency(client.value)}/mo
                        </Typography>
                        <Button size="small" color="primary">
                          Take Action
                        </Button>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>

            <Grid item xs={12} lg={4}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Predicted Outcomes
                </Typography>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Q3 Revenue Target
                    </Typography>
                    <Typography variant="h4" color="primary">
                      {formatCurrency(175000)}
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={72} 
                      sx={{ mt: 1 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      72% confidence level
                    </Typography>
                  </Box>

                  <Divider />

                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Expected New Clients
                    </Typography>
                    <Typography variant="h4" color="success.main">
                      +127
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Based on current conversion rate
                    </Typography>
                  </Box>

                  <Divider />

                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Churn Risk
                    </Typography>
                    <Typography variant="h4" color="warning.main">
                      12 clients
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Require immediate attention
                    </Typography>
                  </Box>
                </Stack>
              </Paper>

              <Paper sx={{ p: 3, mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Growth Opportunities
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <Zap size={20} color="#10B981" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Upsell Business Credit"
                      secondary="47 clients qualified"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <TrendingUp size={20} color="#3B82F6" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Referral Campaign"
                      secondary="Est. 23 new clients"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Users size={20} color="#F59E0B" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Win-back Campaign"
                      secondary="38 former clients"
                    />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Footer */}
        <Box sx={{ mt: 4, py: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Analytics data refreshes every hour • Last updated: {new Date().toLocaleTimeString()}
          </Typography>
        </Box>
      </Container>
    </LocalizationProvider>
  );
};

export default Analytics;