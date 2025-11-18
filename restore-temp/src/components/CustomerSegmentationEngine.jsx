// src/components/CustomerSegmentationEngine.jsx
// Advanced Customer Segmentation System with AI-powered insights
// RFM Analysis, Behavior Tracking, Predictive Segments, Automated Campaigns

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import {
  collection, addDoc, updateDoc, deleteDoc, doc, query, where,
  getDocs, onSnapshot, serverTimestamp, orderBy, writeBatch
} from 'firebase/firestore';

import {
  Box, Paper, Typography, Button, TextField, Grid, Card, CardContent,
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer,
  Dialog, DialogTitle, DialogContent, DialogActions, Chip, IconButton,
  Select, MenuItem, FormControl, InputLabel, Tabs, Tab, Alert, Snackbar,
  List, ListItem, ListItemText, Divider, Switch, CircularProgress,
  Avatar, Stack, ToggleButton, ToggleButtonGroup, Slider, Autocomplete,
  LinearProgress, CardHeader, CardActions, Checkbox, FormGroup, FormControlLabel,
  Radio, RadioGroup, Tooltip, Badge
} from '@mui/material';

import {
  Users, Filter, TrendingUp, Target, Zap, Mail, MessageSquare,
  DollarSign, Calendar, Award, AlertCircle, CheckCircle, XCircle,
  Plus, Edit2, Trash2, Download, Upload, RefreshCw, Eye, Send,
  BarChart2, PieChart, Activity, Clock, Star, Heart, ThumbsUp,
  Search, Settings, Copy, Share2, Play, Pause
} from 'lucide-react';

import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, ArcElement, Title, Tooltip as ChartTooltip,
  Legend, Filler
} from 'chart.js';
import { Bar, Doughnut, Line, Scatter } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, ChartTooltip, Legend, Filler
);

const CustomerSegmentationEngine = () => {
  const { user } = useAuth();

  // State
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [segments, setSegments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [activities, setActivities] = useState([]);

  const [showCreateSegmentDialog, setShowCreateSegmentDialog] = useState(false);
  const [showCampaignDialog, setShowCampaignDialog] = useState(false);
  const [showCustomerDetailDialog, setShowCustomerDetailDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedSegment, setSelectedSegment] = useState(null);

  const [notification, setNotification] = useState({ show: false, message: '', type: 'info' });

  const [segmentForm, setSegmentForm] = useState({
    name: '',
    description: '',
    type: 'behavioral', // behavioral, demographic, rfm, predictive
    rules: [],
    color: '#3B82F6',
    autoUpdate: true
  });

  const [campaignForm, setCampaignForm] = useState({
    name: '',
    segmentId: '',
    channel: 'email',
    message: '',
    scheduledDate: '',
    status: 'draft'
  });

  const [filters, setFilters] = useState({
    scoreRange: [300, 850],
    revenueRange: [0, 100000],
    engagementLevel: 'all',
    status: 'all',
    joinedAfter: '',
    joinedBefore: ''
  });

  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalSegments: 0,
    avgCustomerValue: 0,
    churnRate: 0,
    highValueCustomers: 0,
    atRiskCustomers: 0,
    activeSegments: 0,
    campaignsSent: 0
  });

  // RFM Analysis State
  const [rfmData, setRfmData] = useState({
    champions: [],
    loyalCustomers: [],
    potentialLoyalists: [],
    atRisk: [],
    cantLoseThem: [],
    hibernating: [],
    lost: []
  });

  // Load Data
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadSegments(),
        loadCustomers(),
        loadCampaigns(),
        loadActivities()
      ]);
      calculateStats();
      performRFMAnalysis();
    } catch (error) {
      console.error('Error loading segmentation data:', error);
      showNotification('Error loading data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadSegments = async () => {
    const q = query(collection(db, 'customerSegments'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    setSegments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const loadCustomers = async () => {
    const q = query(collection(db, 'clients'), orderBy('joinedAt', 'desc'));
    const snapshot = await getDocs(q);
    const customersData = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      // Calculate derived metrics
      lifetimeValue: calculateLifetimeValue(doc.data()),
      engagementScore: calculateEngagementScore(doc.data()),
      churnRisk: calculateChurnRisk(doc.data())
    }));
    setCustomers(customersData);
  };

  const loadCampaigns = async () => {
    const q = query(collection(db, 'segmentCampaigns'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    setCampaigns(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const loadActivities = async () => {
    const q = query(
      collection(db, 'customerActivities'),
      orderBy('timestamp', 'desc'),
      // limit(500)
    );
    const snapshot = await getDocs(q);
    setActivities(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  // Calculations
  const calculateLifetimeValue = (customer) => {
    // Simple LTV calculation: total payments
    return customer.totalPaid || 0;
  };

  const calculateEngagementScore = (customer) => {
    // Engagement score based on activity
    let score = 0;
    if (customer.lastLoginAt) {
      const daysSinceLogin = (Date.now() - customer.lastLoginAt.toMillis()) / (1000 * 60 * 60 * 24);
      score += daysSinceLogin < 7 ? 30 : daysSinceLogin < 30 ? 20 : 10;
    }
    if (customer.emailOpens) score += Math.min(customer.emailOpens * 2, 30);
    if (customer.portalVisits) score += Math.min(customer.portalVisits * 1, 20);
    if (customer.documentUploads) score += customer.documentUploads * 5;
    return Math.min(score, 100);
  };

  const calculateChurnRisk = (customer) => {
    // Churn risk based on inactivity and payment issues
    let risk = 0;
    if (customer.lastLoginAt) {
      const daysSinceLogin = (Date.now() - customer.lastLoginAt.toMillis()) / (1000 * 60 * 60 * 24);
      if (daysSinceLogin > 90) risk += 40;
      else if (daysSinceLogin > 60) risk += 25;
      else if (daysSinceLogin > 30) risk += 10;
    }
    if (customer.failedPayments > 0) risk += customer.failedPayments * 15;
    if (customer.supportTickets > 5) risk += 10;
    if (customer.engagementScore < 20) risk += 20;
    return Math.min(risk, 100);
  };

  const performRFMAnalysis = () => {
    // RFM: Recency, Frequency, Monetary
    const now = Date.now();
    const analysisData = {
      champions: [],
      loyalCustomers: [],
      potentialLoyalists: [],
      atRisk: [],
      cantLoseThem: [],
      hibernating: [],
      lost: []
    };

    customers.forEach(customer => {
      const recency = customer.lastPurchaseAt 
        ? (now - customer.lastPurchaseAt.toMillis()) / (1000 * 60 * 60 * 24) 
        : 999;
      const frequency = customer.purchaseCount || 0;
      const monetary = customer.lifetimeValue || 0;

      // RFM Scoring (1-5 scale)
      const rScore = recency < 30 ? 5 : recency < 90 ? 4 : recency < 180 ? 3 : recency < 365 ? 2 : 1;
      const fScore = frequency > 10 ? 5 : frequency > 5 ? 4 : frequency > 2 ? 3 : frequency > 0 ? 2 : 1;
      const mScore = monetary > 10000 ? 5 : monetary > 5000 ? 4 : monetary > 1000 ? 3 : monetary > 100 ? 2 : 1;

      const rfmScore = rScore + fScore + mScore;

      // Segment assignment
      if (rScore >= 4 && fScore >= 4 && mScore >= 4) {
        analysisData.champions.push(customer);
      } else if (fScore >= 4 && mScore >= 4) {
        analysisData.loyalCustomers.push(customer);
      } else if (rScore >= 4 && fScore <= 2) {
        analysisData.potentialLoyalists.push(customer);
      } else if (rScore <= 2 && fScore >= 3 && mScore >= 3) {
        analysisData.cantLoseThem.push(customer);
      } else if (rScore <= 2 && fScore <= 2) {
        analysisData.atRisk.push(customer);
      } else if (rScore <= 1) {
        analysisData.lost.push(customer);
      } else {
        analysisData.hibernating.push(customer);
      }
    });

    setRfmData(analysisData);
  };

  const calculateStats = () => {
    const totalCustomers = customers.length;
    const totalSegments = segments.length;
    const avgCustomerValue = totalCustomers > 0
      ? customers.reduce((sum, c) => sum + (c.lifetimeValue || 0), 0) / totalCustomers
      : 0;
    
    const churnedCount = customers.filter(c => c.churnRisk > 70).length;
    const churnRate = totalCustomers > 0 ? (churnedCount / totalCustomers * 100).toFixed(1) : 0;
    
    const highValueCustomers = customers.filter(c => c.lifetimeValue > 5000).length;
    const atRiskCustomers = customers.filter(c => c.churnRisk > 60).length;
    const activeSegments = segments.filter(s => s.status === 'active').length;
    const campaignsSent = campaigns.filter(c => c.status === 'sent').length;

    setStats({
      totalCustomers,
      totalSegments,
      avgCustomerValue,
      churnRate,
      highValueCustomers,
      atRiskCustomers,
      activeSegments,
      campaignsSent
    });
  };

  // Handlers
  const handleCreateSegment = async () => {
    if (!segmentForm.name) {
      showNotification('Please enter segment name', 'warning');
      return;
    }

    try {
      const memberIds = applySegmentRules(segmentForm.rules);
      
      await addDoc(collection(db, 'customerSegments'), {
        ...segmentForm,
        memberIds,
        memberCount: memberIds.length,
        status: 'active',
        createdAt: serverTimestamp(),
        createdBy: user.uid
      });

      showNotification('Segment created!', 'success');
      setShowCreateSegmentDialog(false);
      setSegmentForm({
        name: '',
        description: '',
        type: 'behavioral',
        rules: [],
        color: '#3B82F6',
        autoUpdate: true
      });
      loadSegments();
      calculateStats();
    } catch (error) {
      console.error('Error creating segment:', error);
      showNotification('Error creating segment', 'error');
    }
  };

  const applySegmentRules = (rules) => {
    // Apply filtering rules to get matching customer IDs
    let filtered = [...customers];

    rules.forEach(rule => {
      filtered = filtered.filter(customer => {
        switch (rule.field) {
          case 'lifetimeValue':
            return rule.operator === 'greater' 
              ? customer.lifetimeValue > rule.value
              : customer.lifetimeValue < rule.value;
          case 'engagementScore':
            return rule.operator === 'greater'
              ? customer.engagementScore > rule.value
              : customer.engagementScore < rule.value;
          case 'churnRisk':
            return rule.operator === 'greater'
              ? customer.churnRisk > rule.value
              : customer.churnRisk < rule.value;
          case 'status':
            return customer.accountStatus === rule.value;
          case 'tier':
            return customer.tier === rule.value;
          default:
            return true;
        }
      });
    });

    return filtered.map(c => c.id);
  };

  const handleCreateCampaign = async () => {
    if (!campaignForm.name || !campaignForm.segmentId) {
      showNotification('Please fill required fields', 'warning');
      return;
    }

    try {
      const segment = segments.find(s => s.id === campaignForm.segmentId);
      
      await addDoc(collection(db, 'segmentCampaigns'), {
        ...campaignForm,
        recipientCount: segment?.memberCount || 0,
        createdAt: serverTimestamp(),
        createdBy: user.uid
      });

      showNotification('Campaign created!', 'success');
      setShowCampaignDialog(false);
      setCampaignForm({
        name: '',
        segmentId: '',
        channel: 'email',
        message: '',
        scheduledDate: '',
        status: 'draft'
      });
      loadCampaigns();
    } catch (error) {
      console.error('Error creating campaign:', error);
      showNotification('Error creating campaign', 'error');
    }
  };

  const handleDeleteSegment = async (segmentId) => {
    if (!window.confirm('Delete this segment?')) return;

    try {
      await deleteDoc(doc(db, 'customerSegments', segmentId));
      showNotification('Segment deleted', 'success');
      loadSegments();
      calculateStats();
    } catch (error) {
      console.error('Error deleting segment:', error);
      showNotification('Error deleting segment', 'error');
    }
  };

  const handleExportSegment = (segment) => {
    const segmentCustomers = customers.filter(c => segment.memberIds?.includes(c.id));
    const csv = convertToCSV(segmentCustomers);
    downloadCSV(csv, `segment_${segment.name}.csv`);
    showNotification('Segment exported!', 'success');
  };

  const convertToCSV = (data) => {
    const headers = ['Email', 'Name', 'Lifetime Value', 'Engagement Score', 'Churn Risk', 'Status'];
    const rows = data.map(c => [
      c.email,
      `${c.firstName || ''} ${c.lastName || ''}`,
      c.lifetimeValue || 0,
      c.engagementScore || 0,
      c.churnRisk || 0,
      c.accountStatus || 'active'
    ]);
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const downloadCSV = (csv, filename) => {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const showNotification = (message, type = 'info') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'info' }), 5000);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  // Filtered customers based on filters
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const avgScore = (c.experianScore + c.equifaxScore + c.transunionScore) / 3 || 0;
      const matchesScore = avgScore >= filters.scoreRange[0] && avgScore <= filters.scoreRange[1];
      const matchesRevenue = c.lifetimeValue >= filters.revenueRange[0] && c.lifetimeValue <= filters.revenueRange[1];
      const matchesEngagement = filters.engagementLevel === 'all' || 
        (filters.engagementLevel === 'high' && c.engagementScore > 70) ||
        (filters.engagementLevel === 'medium' && c.engagementScore > 40 && c.engagementScore <= 70) ||
        (filters.engagementLevel === 'low' && c.engagementScore <= 40);
      const matchesStatus = filters.status === 'all' || c.accountStatus === filters.status;
      
      return matchesScore && matchesRevenue && matchesEngagement && matchesStatus;
    });
  }, [customers, filters]);

  // Chart Data
  const getSegmentDistributionChart = () => {
    return {
      labels: segments.map(s => s.name),
      datasets: [{
        data: segments.map(s => s.memberCount || 0),
        backgroundColor: segments.map(s => s.color || '#3B82F6'),
        borderWidth: 2,
        borderColor: '#fff'
      }]
    };
  };

  const getRFMDistributionChart = () => {
    return {
      labels: ['Champions', 'Loyal', 'Potential', 'At Risk', "Can't Lose", 'Hibernating', 'Lost'],
      datasets: [{
        data: [
          rfmData.champions.length,
          rfmData.loyalCustomers.length,
          rfmData.potentialLoyalists.length,
          rfmData.atRisk.length,
          rfmData.cantLoseThem.length,
          rfmData.hibernating.length,
          rfmData.lost.length
        ],
        backgroundColor: [
          '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B',
          '#EF4444', '#6B7280', '#1F2937'
        ]
      }]
    };
  };

  const getEngagementScatterChart = () => {
    return {
      datasets: [{
        label: 'Customers',
        data: customers.map(c => ({
          x: c.engagementScore || 0,
          y: c.lifetimeValue || 0
        })),
        backgroundColor: customers.map(c => 
          c.churnRisk > 70 ? '#EF4444' : c.churnRisk > 40 ? '#F59E0B' : '#10B981'
        ),
        pointRadius: 6
      }]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'bottom' }
    }
  };

  const scatterOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { title: { display: true, text: 'Engagement Score' } },
      y: { title: { display: true, text: 'Lifetime Value ($)' } }
    },
    plugins: {
      legend: { display: false }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Customer Segmentation Engine
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" startIcon={<Download />}>Export All</Button>
          <Button variant="outlined" startIcon={<RefreshCw />} onClick={loadAllData}>Refresh</Button>
        </Stack>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="overline" sx={{ opacity: 0.9 }}>Total Customers</Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', my: 1 }}>
                {stats.totalCustomers}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                {stats.activeSegments} active segments
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="overline" sx={{ opacity: 0.9 }}>Avg Customer Value</Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', my: 1 }}>
                {formatCurrency(stats.avgCustomerValue)}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                {stats.highValueCustomers} high-value
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="overline" sx={{ opacity: 0.9 }}>Churn Risk</Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', my: 1 }}>
                {stats.churnRate}%
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                {stats.atRiskCustomers} at risk
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="overline" sx={{ opacity: 0.9 }}>Campaigns</Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', my: 1 }}>
                {stats.campaignsSent}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Sent this month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
          <Tab label="Segments" />
          <Tab label="RFM Analysis" />
          <Tab label="Customers" />
          <Tab label="Campaigns" />
        </Tabs>
      </Paper>

      {/* Segments Tab */}
      {activeTab === 0 && (
        <Box>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>All Segments</Typography>
            <Button variant="contained" startIcon={<Plus />} onClick={() => setShowCreateSegmentDialog(true)}>
              Create Segment
            </Button>
          </Box>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                  Segment Distribution
                </Typography>
                <Box sx={{ height: 300 }}>
                  {segments.length > 0 ? (
                    <Doughnut data={getSegmentDistributionChart()} options={chartOptions} />
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <Typography color="text.secondary">No segments created</Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                  Engagement vs Value
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Scatter data={getEngagementScatterChart()} options={scatterOptions} />
                </Box>
              </Paper>
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            {segments.map(segment => (
              <Grid item xs={12} md={6} lg={4} key={segment.id}>
                <Card>
                  <CardHeader
                    avatar={
                      <Avatar sx={{ bgcolor: segment.color }}>
                        {segment.name[0].toUpperCase()}
                      </Avatar>
                    }
                    title={segment.name}
                    subheader={segment.type.toUpperCase()}
                    action={
                      <Chip 
                        label={segment.status === 'active' ? 'Active' : 'Inactive'}
                        size="small"
                        color={segment.status === 'active' ? 'success' : 'default'}
                      />
                    }
                  />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {segment.description}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Members</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                          {segment.memberCount || 0}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Auto-Update</Typography>
                        <Typography variant="body2">
                          {segment.autoUpdate ? 'Enabled' : 'Disabled'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                  <CardActions>
                    <Button size="small" startIcon={<Eye />} onClick={() => setSelectedSegment(segment)}>
                      View
                    </Button>
                    <Button size="small" startIcon={<Send />}>Campaign</Button>
                    <Button size="small" startIcon={<Download />} onClick={() => handleExportSegment(segment)}>
                      Export
                    </Button>
                    <IconButton size="small" onClick={() => handleDeleteSegment(segment.id)}>
                      <Trash2 size={16} />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {segments.length === 0 && (
            <Paper sx={{ p: 8, textAlign: 'center' }}>
              <Users size={64} style={{ color: '#D1D5DB', marginBottom: 16 }} />
              <Typography variant="h6" gutterBottom>No segments created</Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                Create your first customer segment to start targeted campaigns
              </Typography>
              <Button variant="contained" startIcon={<Plus />} onClick={() => setShowCreateSegmentDialog(true)}>
                Create First Segment
              </Button>
            </Paper>
          )}
        </Box>
      )}

      {/* RFM Analysis Tab */}
      {activeTab === 1 && (
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
            RFM Analysis - Recency, Frequency, Monetary
          </Typography>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                  RFM Distribution
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Doughnut data={getRFMDistributionChart()} options={chartOptions} />
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                  Quick Stats
                </Typography>
                <List>
                  {[
                    { label: 'Champions', count: rfmData.champions.length, color: '#10B981', icon: <Star /> },
                    { label: 'Loyal Customers', count: rfmData.loyalCustomers.length, color: '#3B82F6', icon: <Heart /> },
                    { label: 'At Risk', count: rfmData.atRisk.length, color: '#F59E0B', icon: <AlertCircle /> },
                    { label: "Can't Lose Them", count: rfmData.cantLoseThem.length, color: '#EF4444', icon: <Award /> }
                  ].map((item, i) => (
                    <ListItem key={i} sx={{ px: 0 }}>
                      <Avatar sx={{ mr: 2, bgcolor: item.color + '20', color: item.color }}>
                        {item.icon}
                      </Avatar>
                      <ListItemText 
                        primary={item.label}
                        secondary={`${item.count} customers`}
                      />
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {item.count}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            {Object.entries(rfmData).map(([key, customers]) => (
              <Grid item xs={12} md={6} lg={4} key={key}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 2 }}>
                      {customers.length}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total LTV: {formatCurrency(customers.reduce((sum, c) => sum + (c.lifetimeValue || 0), 0))}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" startIcon={<Eye />}>View Customers</Button>
                    <Button size="small" startIcon={<Send />}>Send Campaign</Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Customers Tab */}
      {activeTab === 2 && (
        <Box>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Filter Customers</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Engagement Level</InputLabel>
                  <Select
                    value={filters.engagementLevel}
                    onChange={(e) => setFilters({ ...filters, engagementLevel: e.target.value })}
                    label="Engagement Level"
                  >
                    <MenuItem value="all">All Levels</MenuItem>
                    <MenuItem value="high">High (70+)</MenuItem>
                    <MenuItem value="medium">Medium (40-70)</MenuItem>
                    <MenuItem value="low">Low (&lt;40)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    label="Status"
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                    <MenuItem value="paused">Paused</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography gutterBottom variant="caption">Revenue Range</Typography>
                <Slider
                  value={filters.revenueRange}
                  onChange={(e, v) => setFilters({ ...filters, revenueRange: v })}
                  valueLabelDisplay="auto"
                  min={0}
                  max={100000}
                  step={1000}
                  valueLabelFormat={(v) => formatCurrency(v)}
                />
              </Grid>
            </Grid>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Customer</TableCell>
                  <TableCell>LTV</TableCell>
                  <TableCell>Engagement</TableCell>
                  <TableCell>Churn Risk</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCustomers.slice(0, 20).map(customer => (
                  <TableRow key={customer.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar>{customer.email?.[0].toUpperCase()}</Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {customer.firstName} {customer.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {customer.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(customer.lifetimeValue)}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={customer.engagementScore || 0}
                          sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                        />
                        <Typography variant="caption">{customer.engagementScore || 0}%</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={customer.churnRisk > 70 ? 'High' : customer.churnRisk > 40 ? 'Medium' : 'Low'}
                        size="small"
                        color={customer.churnRisk > 70 ? 'error' : customer.churnRisk > 40 ? 'warning' : 'success'}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={customer.accountStatus?.toUpperCase() || 'ACTIVE'}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => {
                        setSelectedCustomer(customer);
                        setShowCustomerDetailDialog(true);
                      }}>
                        <Eye size={16} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredCustomers.length === 0 && (
            <Paper sx={{ p: 8, textAlign: 'center' }}>
              <Typography color="text.secondary">No customers match the filters</Typography>
            </Paper>
          )}
        </Box>
      )}

      {/* Campaigns Tab */}
      {activeTab === 3 && (
        <Box>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Segment Campaigns</Typography>
            <Button variant="contained" startIcon={<Plus />} onClick={() => setShowCampaignDialog(true)}>
              Create Campaign
            </Button>
          </Box>

          <Grid container spacing={3}>
            {campaigns.map(campaign => (
              <Grid item xs={12} md={6} key={campaign.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {campaign.name}
                      </Typography>
                      <Chip
                        label={campaign.status.toUpperCase()}
                        size="small"
                        color={
                          campaign.status === 'sent' ? 'success' :
                          campaign.status === 'scheduled' ? 'info' : 'default'
                        }
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {campaign.message?.substring(0, 100)}...
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Channel</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {campaign.channel === 'email' ? 'Email' : campaign.channel === 'sms' ? 'SMS' : 'Push'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Recipients</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {campaign.recipientCount || 0}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                  <CardActions>
                    <Button size="small" startIcon={<Eye />}>View</Button>
                    <Button size="small" startIcon={<Play />}>Send Now</Button>
                    <IconButton size="small">
                      <Trash2 size={16} />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {campaigns.length === 0 && (
            <Paper sx={{ p: 8, textAlign: 'center' }}>
              <Send size={64} style={{ color: '#D1D5DB', marginBottom: 16 }} />
              <Typography variant="h6" gutterBottom>No campaigns created</Typography>
              <Button variant="contained" startIcon={<Plus />} onClick={() => setShowCampaignDialog(true)} sx={{ mt: 2 }}>
                Create First Campaign
              </Button>
            </Paper>
          )}
        </Box>
      )}

      {/* Create Segment Dialog */}
      <Dialog open={showCreateSegmentDialog} onClose={() => setShowCreateSegmentDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Segment</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Segment Name"
            value={segmentForm.name}
            onChange={(e) => setSegmentForm({ ...segmentForm, name: e.target.value })}
            sx={{ mt: 2, mb: 2 }}
          />

          <TextField
            fullWidth
            label="Description"
            multiline
            rows={2}
            value={segmentForm.description}
            onChange={(e) => setSegmentForm({ ...segmentForm, description: e.target.value })}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={segmentForm.type}
              onChange={(e) => setSegmentForm({ ...segmentForm, type: e.target.value })}
              label="Type"
            >
              <MenuItem value="behavioral">Behavioral</MenuItem>
              <MenuItem value="demographic">Demographic</MenuItem>
              <MenuItem value="rfm">RFM-Based</MenuItem>
              <MenuItem value="predictive">Predictive</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Color"
            type="color"
            value={segmentForm.color}
            onChange={(e) => setSegmentForm({ ...segmentForm, color: e.target.value })}
            sx={{ mb: 2 }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={segmentForm.autoUpdate}
                onChange={(e) => setSegmentForm({ ...segmentForm, autoUpdate: e.target.checked })}
              />
            }
            label="Auto-update segment members"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateSegmentDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateSegment}>Create Segment</Button>
        </DialogActions>
      </Dialog>

      {/* Create Campaign Dialog */}
      <Dialog open={showCampaignDialog} onClose={() => setShowCampaignDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Campaign</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Campaign Name"
            value={campaignForm.name}
            onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
            sx={{ mt: 2, mb: 2 }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Target Segment</InputLabel>
            <Select
              value={campaignForm.segmentId}
              onChange={(e) => setCampaignForm({ ...campaignForm, segmentId: e.target.value })}
              label="Target Segment"
            >
              {segments.map(s => (
                <MenuItem key={s.id} value={s.id}>
                  {s.name} ({s.memberCount} members)
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Channel</InputLabel>
            <Select
              value={campaignForm.channel}
              onChange={(e) => setCampaignForm({ ...campaignForm, channel: e.target.value })}
              label="Channel"
            >
              <MenuItem value="email">Email</MenuItem>
              <MenuItem value="sms">SMS</MenuItem>
              <MenuItem value="push">Push Notification</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Message"
            multiline
            rows={4}
            value={campaignForm.message}
            onChange={(e) => setCampaignForm({ ...campaignForm, message: e.target.value })}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Schedule Date (optional)"
            type="datetime-local"
            value={campaignForm.scheduledDate}
            onChange={(e) => setCampaignForm({ ...campaignForm, scheduledDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCampaignDialog(false)}>Cancel</Button>
          <Button variant="outlined" onClick={() => {
            setCampaignForm({ ...campaignForm, status: 'draft' });
            handleCreateCampaign();
          }}>
            Save as Draft
          </Button>
          <Button variant="contained" onClick={() => {
            setCampaignForm({ ...campaignForm, status: 'scheduled' });
            handleCreateCampaign();
          }}>
            Schedule Campaign
          </Button>
        </DialogActions>
      </Dialog>

      {/* Customer Detail Dialog */}
      <Dialog open={showCustomerDetailDialog} onClose={() => setShowCustomerDetailDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Customer Details</DialogTitle>
        <DialogContent>
          {selectedCustomer && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">Email</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedCustomer.email}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">Status</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedCustomer.accountStatus?.toUpperCase()}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="caption" color="text.secondary">Lifetime Value</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(selectedCustomer.lifetimeValue)}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="caption" color="text.secondary">Engagement Score</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    {selectedCustomer.engagementScore}%
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="caption" color="text.secondary">Churn Risk</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: 
                    selectedCustomer.churnRisk > 70 ? 'error.main' :
                    selectedCustomer.churnRisk > 40 ? 'warning.main' : 'success.main'
                  }}>
                    {selectedCustomer.churnRisk}%
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCustomerDetailDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.show}
        autoHideDuration={5000}
        onClose={() => setNotification({ ...notification, show: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setNotification({ ...notification, show: false })}
          severity={notification.type}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CustomerSegmentationEngine;