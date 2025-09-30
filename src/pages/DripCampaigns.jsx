// DripCampaigns.jsx - Consolidated Drip Campaign Management
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
  Snackbar,
  Tooltip,
  Switch,
  FormControlLabel,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
  LinearProgress,
  Badge,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  ListItemIcon,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  ToggleButton,
  ToggleButtonGroup,
  Avatar,
  AvatarGroup,
  Menu,
  Slider,
  RadioGroup,
  Radio,
  FormLabel
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  Activity,
  Plus,
  Edit2,
  Trash2,
  Play,
  Pause,
  Square,
  Mail,
  MessageSquare,
  Phone,
  Clock,
  Calendar,
  Users,
  UserPlus,
  Target,
  TrendingUp,
  BarChart3,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Download,
  Upload,
  Copy,
  MoreVertical,
  Settings,
  Zap,
  Send,
  Eye,
  GitBranch,
  Repeat,
  ChevronRight,
  Award,
  DollarSign,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer, Legend } from 'recharts';

const DripCampaigns = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [activeStep, setActiveStep] = useState(0);

  // Campaign form state
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    description: '',
    type: 'email',
    status: 'draft',
    triggers: {
      type: 'immediate',
      delay: 0,
      delayUnit: 'hours',
      condition: ''
    },
    audience: {
      segment: 'all',
      tags: [],
      filters: []
    },
    sequence: [],
    settings: {
      sendDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
      sendTimeStart: '09:00',
      sendTimeEnd: '17:00',
      timezone: 'PST',
      stopOnReply: true,
      stopOnConversion: true,
      trackOpens: true,
      trackClicks: true
    },
    metrics: {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      replied: 0,
      converted: 0,
      unsubscribed: 0
    }
  });

  // Email template for sequence
  const [emailTemplate, setEmailTemplate] = useState({
    subject: '',
    body: '',
    delay: 1,
    delayUnit: 'days',
    type: 'email'
  });

  // Fetch campaigns on mount
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const q = query(collection(db, 'dripCampaigns'), where('userId', '==', user.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const campaignData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setCampaigns(campaignData);
          setLoading(false);
        });
        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching campaigns:', error);
        setLoading(false);
      }
    };

    if (user) {
      fetchCampaigns();
    }
  }, [user]);

  // Statistics
  const statistics = useMemo(() => {
    const active = campaigns.filter(c => c.status === 'active').length;
    const totalSent = campaigns.reduce((sum, c) => sum + (c.metrics?.sent || 0), 0);
    const totalConverted = campaigns.reduce((sum, c) => sum + (c.metrics?.converted || 0), 0);
    const avgOpenRate = campaigns.length > 0
      ? campaigns.reduce((sum, c) => {
          const sent = c.metrics?.sent || 0;
          const opened = c.metrics?.opened || 0;
          return sum + (sent > 0 ? (opened / sent) * 100 : 0);
        }, 0) / campaigns.length
      : 0;

    return {
      total: campaigns.length,
      active,
      paused: campaigns.filter(c => c.status === 'paused').length,
      draft: campaigns.filter(c => c.status === 'draft').length,
      totalSent,
      totalConverted,
      avgOpenRate: avgOpenRate.toFixed(1),
      conversionRate: totalSent > 0 ? ((totalConverted / totalSent) * 100).toFixed(1) : 0
    };
  }, [campaigns]);

  // Performance data for charts
  const performanceData = useMemo(() => {
    const last7Days = [...Array(7)].map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      return {
        day: dateStr,
        sent: Math.floor(Math.random() * 1000),
        opened: Math.floor(Math.random() * 700),
        clicked: Math.floor(Math.random() * 300),
        converted: Math.floor(Math.random() * 100)
      };
    }).reverse();
    
    return last7Days;
  }, []);

  const channelDistribution = [
    { name: 'Email', value: 65, color: '#3B82F6' },
    { name: 'SMS', value: 25, color: '#10B981' },
    { name: 'Call', value: 10, color: '#F59E0B' }
  ];

  // Handle campaign creation
  const handleCreateCampaign = async () => {
    try {
      await addDoc(collection(db, 'dripCampaigns'), {
        ...campaignForm,
        userId: user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      setSnackbar({ open: true, message: 'Campaign created successfully!', severity: 'success' });
      handleCloseDialog();
    } catch (error) {
      setSnackbar({ open: true, message: 'Error creating campaign', severity: 'error' });
    }
  };

  // Handle campaign update
  const handleUpdateCampaign = async () => {
    try {
      const campaignRef = doc(db, 'dripCampaigns', selectedCampaign.id);
      await updateDoc(campaignRef, {
        ...campaignForm,
        updatedAt: new Date().toISOString()
      });
      
      setSnackbar({ open: true, message: 'Campaign updated successfully!', severity: 'success' });
      handleCloseDialog();
    } catch (error) {
      setSnackbar({ open: true, message: 'Error updating campaign', severity: 'error' });
    }
  };

  // Handle campaign deletion
  const handleDeleteCampaign = async (campaignId) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      try {
        await deleteDoc(doc(db, 'dripCampaigns', campaignId));
        setSnackbar({ open: true, message: 'Campaign deleted successfully!', severity: 'success' });
      } catch (error) {
        setSnackbar({ open: true, message: 'Error deleting campaign', severity: 'error' });
      }
    }
  };

  // Toggle campaign status
  const handleToggleCampaignStatus = async (campaignId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    try {
      const campaignRef = doc(db, 'dripCampaigns', campaignId);
      await updateDoc(campaignRef, {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      
      setSnackbar({ 
        open: true, 
        message: `Campaign ${newStatus === 'active' ? 'activated' : 'paused'} successfully!`, 
        severity: 'success' 
      });
    } catch (error) {
      setSnackbar({ open: true, message: 'Error updating campaign status', severity: 'error' });
    }
  };

  // Add email to sequence
  const handleAddToSequence = () => {
    const newSequence = [...campaignForm.sequence, { ...emailTemplate, id: Date.now() }];
    setCampaignForm({ ...campaignForm, sequence: newSequence });
    setEmailTemplate({
      subject: '',
      body: '',
      delay: 1,
      delayUnit: 'days',
      type: 'email'
    });
  };

  // Remove from sequence
  const handleRemoveFromSequence = (id) => {
    const newSequence = campaignForm.sequence.filter(item => item.id !== id);
    setCampaignForm({ ...campaignForm, sequence: newSequence });
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedCampaign(null);
    setActiveStep(0);
    setCampaignForm({
      name: '',
      description: '',
      type: 'email',
      status: 'draft',
      triggers: {
        type: 'immediate',
        delay: 0,
        delayUnit: 'hours',
        condition: ''
      },
      audience: {
        segment: 'all',
        tags: [],
        filters: []
      },
      sequence: [],
      settings: {
        sendDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
        sendTimeStart: '09:00',
        sendTimeEnd: '17:00',
        timezone: 'PST',
        stopOnReply: true,
        stopOnConversion: true,
        trackOpens: true,
        trackClicks: true
      },
      metrics: {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        replied: 0,
        converted: 0,
        unsubscribed: 0
      }
    });
  };

  // Open edit dialog
  const handleEditCampaign = (campaign) => {
    setSelectedCampaign(campaign);
    setCampaignForm(campaign);
    setDialogOpen(true);
  };

  // Filtered campaigns
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(campaign => {
      const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || campaign.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [campaigns, searchTerm, filterStatus]);

  // DataGrid columns
  const columns = [
    { 
      field: 'name', 
      headerName: 'Campaign Name', 
      flex: 1.5,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Activity size={16} />
          <Typography variant="body2" fontWeight={500}>{params.value}</Typography>
        </Box>
      )
    },
    { 
      field: 'type', 
      headerName: 'Type', 
      width: 100,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          size="small"
          icon={params.value === 'email' ? <Mail size={14} /> : <MessageSquare size={14} />}
        />
      )
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          size="small"
          color={
            params.value === 'active' ? 'success' : 
            params.value === 'paused' ? 'warning' : 
            'default'
          }
          icon={
            params.value === 'active' ? <Play size={14} /> : 
            params.value === 'paused' ? <Pause size={14} /> : 
            <Square size={14} />
          }
        />
      )
    },
    { 
      field: 'sequence', 
      headerName: 'Steps', 
      width: 80,
      renderCell: (params) => (
        <Badge badgeContent={params.row.sequence?.length || 0} color="primary">
          <GitBranch size={16} />
        </Badge>
      )
    },
    { 
      field: 'sent', 
      headerName: 'Sent', 
      width: 100,
      renderCell: (params) => (
        <Typography variant="body2">{params.row.metrics?.sent || 0}</Typography>
      )
    },
    { 
      field: 'openRate', 
      headerName: 'Open Rate', 
      width: 120,
      renderCell: (params) => {
        const sent = params.row.metrics?.sent || 0;
        const opened = params.row.metrics?.opened || 0;
        const rate = sent > 0 ? ((opened / sent) * 100).toFixed(1) : 0;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <LinearProgress 
              variant="determinate" 
              value={rate} 
              sx={{ width: 50, height: 6, borderRadius: 3 }}
            />
            <Typography variant="caption">{rate}%</Typography>
          </Box>
        );
      }
    },
    { 
      field: 'conversions', 
      headerName: 'Conversions', 
      width: 120,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Award size={14} color="#10B981" />
          <Typography variant="body2">{params.row.metrics?.converted || 0}</Typography>
        </Box>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Box>
          <IconButton 
            size="small" 
            onClick={() => handleToggleCampaignStatus(params.row.id, params.row.status)}
          >
            {params.row.status === 'active' ? <Pause size={16} /> : <Play size={16} />}
          </IconButton>
          <IconButton size="small" onClick={() => handleEditCampaign(params.row)}>
            <Edit2 size={16} />
          </IconButton>
          <IconButton size="small" onClick={() => handleDeleteCampaign(params.row.id)}>
            <Trash2 size={16} />
          </IconButton>
        </Box>
      )
    }
  ];

  const steps = ['Campaign Info', 'Audience', 'Sequence', 'Settings', 'Review'];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={600}>
            Drip Campaigns
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Automate your email and SMS sequences
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Download size={20} />}
          >
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={<Plus size={20} />}
            onClick={() => setDialogOpen(true)}
          >
            Create Campaign
          </Button>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Total Campaigns</Typography>
                  <Typography variant="h4" fontWeight={600}>{statistics.total}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {statistics.active} active
                  </Typography>
                </Box>
                <Activity size={24} color="#3B82F6" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Total Sent</Typography>
                  <Typography variant="h4" fontWeight={600}>{statistics.totalSent.toLocaleString()}</Typography>
                  <Typography variant="caption" color="success.main">
                    <ArrowUp size={12} /> 12% from last month
                  </Typography>
                </Box>
                <Send size={24} color="#10B981" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Avg Open Rate</Typography>
                  <Typography variant="h4" fontWeight={600}>{statistics.avgOpenRate}%</Typography>
                  <Typography variant="caption" color="error.main">
                    <ArrowDown size={12} /> 3% from last month
                  </Typography>
                </Box>
                <Eye size={24} color="#F59E0B" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Conversions</Typography>
                  <Typography variant="h4" fontWeight={600}>{statistics.totalConverted}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {statistics.conversionRate}% rate
                  </Typography>
                </Box>
                <Award size={24} color="#8B5CF6" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="Campaigns" />
          <Tab label="Performance" />
          <Tab label="Templates" />
          <Tab label="Automation Rules" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {tabValue === 0 && (
        <Paper sx={{ p: 2 }}>
          {/* Search, Filter, and View Toggle */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
            <TextField
              placeholder="Search campaigns..."
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={20} />
                  </InputAdornment>
                )
              }}
              sx={{ flex: 1, maxWidth: 400 }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="paused">Paused</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
              </Select>
            </FormControl>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, v) => v && setViewMode(v)}
              size="small"
            >
              <ToggleButton value="grid">
                <BarChart3 size={18} />
              </ToggleButton>
              <ToggleButton value="list">
                <Activity size={18} />
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Campaigns Display */}
          {viewMode === 'list' ? (
            <DataGrid
              rows={filteredCampaigns}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10, 25, 50]}
              disableSelectionOnClick
              autoHeight
              sx={{ minHeight: 400 }}
            />
          ) : (
            <Grid container spacing={2}>
              {filteredCampaigns.map(campaign => (
                <Grid item xs={12} md={6} lg={4} key={campaign.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box>
                          <Typography variant="h6">{campaign.name}</Typography>
                          <Chip 
                            label={campaign.status} 
                            size="small"
                            color={
                              campaign.status === 'active' ? 'success' : 
                              campaign.status === 'paused' ? 'warning' : 
                              'default'
                            }
                          />
                        </Box>
                        <IconButton size="small" onClick={() => handleEditCampaign(campaign)}>
                          <MoreVertical size={16} />
                        </IconButton>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {campaign.description || 'No description'}
                      </Typography>
                      
                      <Grid container spacing={1} sx={{ mb: 2 }}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Steps</Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {campaign.sequence?.length || 0}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Sent</Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {campaign.metrics?.sent || 0}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Open Rate</Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {campaign.metrics?.sent > 0 
                              ? ((campaign.metrics.opened / campaign.metrics.sent) * 100).toFixed(1) 
                              : 0}%
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Conversions</Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {campaign.metrics?.converted || 0}
                          </Typography>
                        </Grid>
                      </Grid>
                      
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant={campaign.status === 'active' ? 'outlined' : 'contained'}
                          startIcon={campaign.status === 'active' ? <Pause size={16} /> : <Play size={16} />}
                          onClick={() => handleToggleCampaignStatus(campaign.id, campaign.status)}
                        >
                          {campaign.status === 'active' ? 'Pause' : 'Activate'}
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Eye size={16} />}
                        >
                          View
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      )}

      {tabValue === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Campaign Performance</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <ChartTooltip />
                  <Legend />
                  <Area type="monotone" dataKey="sent" stackId="1" stroke="#3B82F6" fill="#3B82F6" />
                  <Area type="monotone" dataKey="opened" stackId="1" stroke="#10B981" fill="#10B981" />
                  <Area type="monotone" dataKey="clicked" stackId="1" stroke="#F59E0B" fill="#F59E0B" />
                  <Area type="monotone" dataKey="converted" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Channel Distribution</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={channelDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {channelDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {tabValue === 2 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Email Templates Library</Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            Pre-built templates for common drip campaign scenarios
          </Alert>
          <Grid container spacing={2}>
            {['Welcome Series', 'Onboarding', 'Re-engagement', 'Abandoned Cart', 'Post-Purchase'].map(template => (
              <Grid item xs={12} md={4} key={template}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>{template}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Professional template for {template.toLowerCase()} campaigns
                    </Typography>
                    <Button size="small" sx={{ mt: 2 }}>Use Template</Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {tabValue === 3 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Automation Rules</Typography>
          <List>
            {[
              { name: 'New Lead Welcome', trigger: 'Lead Created', action: 'Send Welcome Email' },
              { name: 'Inactive Re-engagement', trigger: 'No Activity 30 Days', action: 'Send Re-engagement Series' },
              { name: 'Birthday Greetings', trigger: 'Contact Birthday', action: 'Send Birthday Email' }
            ].map((rule, index) => (
              <ListItem key={index} divider>
                <ListItemIcon>
                  <Zap size={20} />
                </ListItemIcon>
                <ListItemText
                  primary={rule.name}
                  secondary={`Trigger: ${rule.trigger} → Action: ${rule.action}`}
                />
                <Switch defaultChecked />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* Create/Edit Campaign Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedCampaign ? 'Edit Campaign' : 'Create New Drip Campaign'}
        </DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep} orientation="vertical" sx={{ mt: 2 }}>
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
                <StepContent>
                  {index === 0 && (
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Campaign Name"
                          value={campaignForm.name}
                          onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Description"
                          value={campaignForm.description}
                          onChange={(e) => setCampaignForm({ ...campaignForm, description: e.target.value })}
                          multiline
                          rows={3}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <InputLabel>Campaign Type</InputLabel>
                          <Select
                            value={campaignForm.type}
                            onChange={(e) => setCampaignForm({ ...campaignForm, type: e.target.value })}
                            label="Campaign Type"
                          >
                            <MenuItem value="email">Email</MenuItem>
                            <MenuItem value="sms">SMS</MenuItem>
                            <MenuItem value="mixed">Email + SMS</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <InputLabel>Trigger Type</InputLabel>
                          <Select
                            value={campaignForm.triggers.type}
                            onChange={(e) => setCampaignForm({ 
                              ...campaignForm, 
                              triggers: { ...campaignForm.triggers, type: e.target.value }
                            })}
                            label="Trigger Type"
                          >
                            <MenuItem value="immediate">Immediate</MenuItem>
                            <MenuItem value="scheduled">Scheduled</MenuItem>
                            <MenuItem value="event">Event-based</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  )}

                  {index === 1 && (
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <FormControl component="fieldset">
                          <FormLabel component="legend">Target Audience</FormLabel>
                          <RadioGroup
                            value={campaignForm.audience.segment}
                            onChange={(e) => setCampaignForm({
                              ...campaignForm,
                              audience: { ...campaignForm.audience, segment: e.target.value }
                            })}
                          >
                            <FormControlLabel value="all" control={<Radio />} label="All Contacts" />
                            <FormControlLabel value="leads" control={<Radio />} label="Leads Only" />
                            <FormControlLabel value="customers" control={<Radio />} label="Customers Only" />
                            <FormControlLabel value="custom" control={<Radio />} label="Custom Segment" />
                          </RadioGroup>
                        </FormControl>
                      </Grid>
                    </Grid>
                  )}

                  {index === 2 && (
                    <Box>
                      <Typography variant="subtitle1" gutterBottom>Email Sequence</Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Email Subject"
                            value={emailTemplate.subject}
                            onChange={(e) => setEmailTemplate({ ...emailTemplate, subject: e.target.value })}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Email Body"
                            value={emailTemplate.body}
                            onChange={(e) => setEmailTemplate({ ...emailTemplate, body: e.target.value })}
                            multiline
                            rows={4}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            label="Delay"
                            type="number"
                            value={emailTemplate.delay}
                            onChange={(e) => setEmailTemplate({ ...emailTemplate, delay: e.target.value })}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <FormControl fullWidth>
                            <InputLabel>Unit</InputLabel>
                            <Select
                              value={emailTemplate.delayUnit}
                              onChange={(e) => setEmailTemplate({ ...emailTemplate, delayUnit: e.target.value })}
                              label="Unit"
                            >
                              <MenuItem value="hours">Hours</MenuItem>
                              <MenuItem value="days">Days</MenuItem>
                              <MenuItem value="weeks">Weeks</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                          <Button 
                            variant="outlined" 
                            startIcon={<Plus size={16} />}
                            onClick={handleAddToSequence}
                          >
                            Add to Sequence
                          </Button>
                        </Grid>
                      </Grid>
                      
                      {campaignForm.sequence.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>Current Sequence</Typography>
                          <List>
                            {campaignForm.sequence.map((item, index) => (
                              <ListItem key={item.id} divider>
                                <ListItemIcon>
                                  <Badge badgeContent={index + 1} color="primary">
                                    <Mail size={20} />
                                  </Badge>
                                </ListItemIcon>
                                <ListItemText
                                  primary={item.subject}
                                  secondary={`After ${item.delay} ${item.delayUnit}`}
                                />
                                <IconButton onClick={() => handleRemoveFromSequence(item.id)}>
                                  <Trash2 size={16} />
                                </IconButton>
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      )}
                    </Box>
                  )}

                  {index === 3 && (
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={campaignForm.settings.stopOnReply}
                              onChange={(e) => setCampaignForm({
                                ...campaignForm,
                                settings: { ...campaignForm.settings, stopOnReply: e.target.checked }
                              })}
                            />
                          }
                          label="Stop campaign on reply"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={campaignForm.settings.stopOnConversion}
                              onChange={(e) => setCampaignForm({
                                ...campaignForm,
                                settings: { ...campaignForm.settings, stopOnConversion: e.target.checked }
                              })}
                            />
                          }
                          label="Stop campaign on conversion"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={campaignForm.settings.trackOpens}
                              onChange={(e) => setCampaignForm({
                                ...campaignForm,
                                settings: { ...campaignForm.settings, trackOpens: e.target.checked }
                              })}
                            />
                          }
                          label="Track email opens"
                        />
                      </Grid>
                    </Grid>
                  )}

                  {index === 4 && (
                    <Box>
                      <Alert severity="success" sx={{ mb: 2 }}>
                        Campaign is ready to be created!
                      </Alert>
                      <Typography variant="h6" gutterBottom>Campaign Summary</Typography>
                      <List>
                        <ListItem>
                          <ListItemText primary="Name" secondary={campaignForm.name || 'Not set'} />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="Type" secondary={campaignForm.type} />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="Audience" secondary={campaignForm.audience.segment} />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="Sequence Steps" secondary={campaignForm.sequence.length} />
                        </ListItem>
                      </List>
                    </Box>
                  )}

                  <Box sx={{ mt: 2 }}>
                    <Button
                      disabled={index === 0}
                      onClick={() => setActiveStep(index - 1)}
                      sx={{ mr: 1 }}
                    >
                      Back
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => {
                        if (index === steps.length - 1) {
                          selectedCampaign ? handleUpdateCampaign() : handleCreateCampaign();
                        } else {
                          setActiveStep(index + 1);
                        }
                      }}
                    >
                      {index === steps.length - 1 ? 'Create Campaign' : 'Continue'}
                    </Button>
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </DialogContent>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DripCampaigns;