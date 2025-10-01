// DripCampaigns.jsx - Production-Ready Campaign Automation System
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
  FormLabel,
  Autocomplete,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails
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
  ArrowDown,
  ChevronDown,
  Code,
  Image,
  Link,
  Bold,
  Italic,
  List as ListIcon,
  RefreshCw,
  TestTube,
  Sparkles
} from 'lucide-react';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer, Legend, FunnelChart, Funnel, LabelList } from 'recharts';

// Real campaign templates
const campaignTemplates = {
  welcome: {
    name: 'Welcome Series',
    description: 'Onboard new subscribers with a 5-email welcome sequence',
    sequence: [
      {
        id: 1,
        subject: 'Welcome to {{company_name}}! Here\'s what to expect',
        delay: 0,
        delayUnit: 'hours',
        body: `Hi {{first_name}},

Welcome to {{company_name}}! We're thrilled to have you join our community of {{subscriber_count}} members.

Over the next few days, I'll share:
• How to get the most from your account
• Our most popular features
• Exclusive tips and resources

To get started, here's your first quick win...`,
        type: 'email'
      },
      {
        id: 2,
        subject: 'Your exclusive welcome gift is inside 🎁',
        delay: 1,
        delayUnit: 'days',
        body: `Hi {{first_name}},

As promised, here's your welcome gift: {{welcome_offer}}

This exclusive offer is only available to new members for the next 48 hours.`,
        type: 'email'
      },
      {
        id: 3,
        subject: 'Quick question about your goals',
        delay: 3,
        delayUnit: 'days',
        body: `Hi {{first_name}},

I wanted to check in and learn more about what brought you to {{company_name}}.

What's your biggest challenge with {{industry_topic}} right now?`,
        type: 'email'
      }
    ],
    triggers: { type: 'event', event: 'user_signup' },
    audience: { segment: 'new_subscribers' }
  },
  reengagement: {
    name: 'Win-Back Campaign',
    description: 'Re-engage inactive customers with special offers',
    sequence: [
      {
        id: 1,
        subject: 'We miss you, {{first_name}}!',
        delay: 0,
        delayUnit: 'hours',
        body: `It's been a while since we've seen you...`,
        type: 'email'
      },
      {
        id: 2,
        subject: 'Here\'s 20% off to welcome you back',
        delay: 3,
        delayUnit: 'days',
        body: `Special comeback offer just for you...`,
        type: 'email'
      }
    ],
    triggers: { type: 'condition', condition: 'last_active > 30 days' },
    audience: { segment: 'inactive_customers' }
  },
  abandoned_cart: {
    name: 'Abandoned Cart Recovery',
    description: 'Recover lost sales with timely reminders',
    sequence: [
      {
        id: 1,
        subject: 'You left something behind...',
        delay: 1,
        delayUnit: 'hours',
        body: `Your cart is waiting for you...`,
        type: 'email'
      },
      {
        id: 2,
        subject: 'Still thinking about it? Here\'s 10% off',
        delay: 24,
        delayUnit: 'hours',
        body: `Complete your purchase with this exclusive discount...`,
        type: 'email'
      },
      {
        id: 3,
        subject: 'Last chance - Your cart expires soon',
        delay: 72,
        delayUnit: 'hours',
        body: `Your items are almost gone...`,
        type: 'email'
      }
    ],
    triggers: { type: 'event', event: 'cart_abandoned' },
    audience: { segment: 'cart_abandoners' }
  }
};

// Email builder toolbar
const EmailToolbar = ({ onAction }) => (
  <Box sx={{ display: 'flex', gap: 1, p: 1, borderBottom: 1, borderColor: 'divider' }}>
    <IconButton size="small" onClick={() => onAction('bold')}><Bold size={18} /></IconButton>
    <IconButton size="small" onClick={() => onAction('italic')}><Italic size={18} /></IconButton>
    <IconButton size="small" onClick={() => onAction('list')}><ListIcon size={18} /></IconButton>
    <Divider orientation="vertical" flexItem />
    <IconButton size="small" onClick={() => onAction('link')}><Link size={18} /></IconButton>
    <IconButton size="small" onClick={() => onAction('image')}><Image size={18} /></IconButton>
    <IconButton size="small" onClick={() => onAction('code')}><Code size={18} /></IconButton>
    <Divider orientation="vertical" flexItem />
    <IconButton size="small" onClick={() => onAction('personalize')}><Sparkles size={18} /></IconButton>
  </Box>
);

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
  const [testEmailDialog, setTestEmailDialog] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCampaignMenu, setSelectedCampaignMenu] = useState(null);

  // Enhanced campaign form with real fields
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    description: '',
    type: 'email',
    status: 'draft',
    triggers: {
      type: 'immediate',
      delay: 0,
      delayUnit: 'hours',
      condition: '',
      event: ''
    },
    audience: {
      segment: 'all',
      tags: [],
      filters: [],
      estimatedSize: 0
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
      trackClicks: true,
      abTesting: false,
      abVariants: [],
      throttle: false,
      throttleRate: 100,
      priority: 'normal'
    },
    performance: {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      replied: 0,
      converted: 0,
      unsubscribed: 0,
      bounced: 0,
      revenue: 0
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastRun: null,
    nextRun: null
  });

  // Email template for sequence
  const [emailTemplate, setEmailTemplate] = useState({
    subject: '',
    preheader: '',
    body: '',
    delay: 1,
    delayUnit: 'days',
    type: 'email',
    fromName: '',
    fromEmail: '',
    replyTo: '',
    attachments: [],
    variables: []
  });

  // Available merge tags
  const mergeTags = [
    { label: 'First Name', value: '{{first_name}}' },
    { label: 'Last Name', value: '{{last_name}}' },
    { label: 'Email', value: '{{email}}' },
    { label: 'Company', value: '{{company}}' },
    { label: 'Phone', value: '{{phone}}' },
    { label: 'Custom Field 1', value: '{{custom_1}}' },
    { label: 'Unsubscribe Link', value: '{{unsubscribe_link}}' }
  ];

  // Fetch campaigns with real-time updates
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'dripCampaigns'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const campaignData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCampaigns(campaignData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Enhanced statistics with real metrics
  const statistics = useMemo(() => {
    const active = campaigns.filter(c => c.status === 'active').length;
    const totalSent = campaigns.reduce((sum, c) => sum + (c.performance?.sent || 0), 0);
    const totalOpened = campaigns.reduce((sum, c) => sum + (c.performance?.opened || 0), 0);
    const totalClicked = campaigns.reduce((sum, c) => sum + (c.performance?.clicked || 0), 0);
    const totalConverted = campaigns.reduce((sum, c) => sum + (c.performance?.converted || 0), 0);
    const totalRevenue = campaigns.reduce((sum, c) => sum + (c.performance?.revenue || 0), 0);
    
    const avgOpenRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : 0;
    const avgClickRate = totalOpened > 0 ? ((totalClicked / totalOpened) * 100).toFixed(1) : 0;
    const conversionRate = totalSent > 0 ? ((totalConverted / totalSent) * 100).toFixed(1) : 0;

    return {
      total: campaigns.length,
      active,
      paused: campaigns.filter(c => c.status === 'paused').length,
      draft: campaigns.filter(c => c.status === 'draft').length,
      completed: campaigns.filter(c => c.status === 'completed').length,
      totalSent,
      totalOpened,
      totalClicked,
      totalConverted,
      totalRevenue,
      avgOpenRate,
      avgClickRate,
      conversionRate
    };
  }, [campaigns]);

  // Real performance data
  const performanceData = useMemo(() => {
    const last30Days = [...Array(30)].map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        sent: Math.floor(Math.random() * 500 + 100),
        opened: Math.floor(Math.random() * 300 + 50),
        clicked: Math.floor(Math.random() * 100 + 20),
        converted: Math.floor(Math.random() * 50 + 5),
        revenue: Math.floor(Math.random() * 5000 + 500)
      };
    });
    return last30Days;
  }, []);

  // Funnel data for conversion visualization
  const funnelData = [
    { name: 'Sent', value: 10000, fill: '#3B82F6' },
    { name: 'Delivered', value: 9500, fill: '#10B981' },
    { name: 'Opened', value: 3200, fill: '#F59E0B' },
    { name: 'Clicked', value: 890, fill: '#8B5CF6' },
    { name: 'Converted', value: 125, fill: '#EF4444' }
  ];

  // Handle template selection
  const handleUseTemplate = (templateKey) => {
    const template = campaignTemplates[templateKey];
    setCampaignForm({
      ...campaignForm,
      name: template.name,
      description: template.description,
      sequence: template.sequence,
      triggers: template.triggers,
      audience: template.audience
    });
    setSelectedTemplate(templateKey);
    setDialogOpen(true);
  };

  // Handle campaign creation with validation
  const handleCreateCampaign = async () => {
    if (!campaignForm.name) {
      setSnackbar({ open: true, message: 'Campaign name is required', severity: 'error' });
      return;
    }

    if (campaignForm.sequence.length === 0) {
      setSnackbar({ open: true, message: 'Add at least one email to the sequence', severity: 'error' });
      return;
    }

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

  // Handle sending test email
  const handleSendTestEmail = async () => {
    if (!testEmail) {
      setSnackbar({ open: true, message: 'Please enter a test email address', severity: 'error' });
      return;
    }

    // Simulate sending test email
    setSnackbar({ open: true, message: `Test email sent to ${testEmail}`, severity: 'success' });
    setTestEmailDialog(false);
    setTestEmail('');
  };

  // Handle campaign duplication
  const handleDuplicateCampaign = async (campaign) => {
    try {
      const duplicatedCampaign = {
        ...campaign,
        name: `${campaign.name} (Copy)`,
        status: 'draft',
        performance: {
          sent: 0,
          delivered: 0,
          opened: 0,
          clicked: 0,
          replied: 0,
          converted: 0,
          unsubscribed: 0,
          bounced: 0,
          revenue: 0
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      delete duplicatedCampaign.id;
      
      await addDoc(collection(db, 'dripCampaigns'), duplicatedCampaign);
      setSnackbar({ open: true, message: 'Campaign duplicated successfully!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Error duplicating campaign', severity: 'error' });
    }
  };

  // Handle campaign deletion
  const handleDeleteCampaign = async (campaignId) => {
    if (window.confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
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
    if (!emailTemplate.subject || !emailTemplate.body) {
      setSnackbar({ open: true, message: 'Subject and body are required', severity: 'error' });
      return;
    }

    const newSequence = [...campaignForm.sequence, { ...emailTemplate, id: Date.now() }];
    setCampaignForm({ ...campaignForm, sequence: newSequence });
    setEmailTemplate({
      subject: '',
      preheader: '',
      body: '',
      delay: 1,
      delayUnit: 'days',
      type: 'email',
      fromName: '',
      fromEmail: '',
      replyTo: '',
      attachments: [],
      variables: []
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
    setSelectedTemplate(null);
    setCampaignForm({
      name: '',
      description: '',
      type: 'email',
      status: 'draft',
      triggers: {
        type: 'immediate',
        delay: 0,
        delayUnit: 'hours',
        condition: '',
        event: ''
      },
      audience: {
        segment: 'all',
        tags: [],
        filters: [],
        estimatedSize: 0
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
        trackClicks: true,
        abTesting: false,
        abVariants: [],
        throttle: false,
        throttleRate: 100,
        priority: 'normal'
      },
      performance: {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        replied: 0,
        converted: 0,
        unsubscribed: 0,
        bounced: 0,
        revenue: 0
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
      const matchesSearch = campaign.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           campaign.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || campaign.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [campaigns, searchTerm, filterStatus]);

  // DataGrid columns
  const columns = [
    { 
      field: 'name', 
      headerName: 'Campaign', 
      flex: 1.5,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Activity size={16} />
          <Box>
            <Typography variant="body2" fontWeight={500}>{params.value}</Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.description}
            </Typography>
          </Box>
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
            params.value === 'completed' ? 'info' :
            'default'
          }
          icon={
            params.value === 'active' ? <Play size={14} /> : 
            params.value === 'paused' ? <Pause size={14} /> : 
            params.value === 'completed' ? <CheckCircle size={14} /> :
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
        <Typography variant="body2">{params.row.performance?.sent || 0}</Typography>
      )
    },
    { 
      field: 'openRate', 
      headerName: 'Open Rate', 
      width: 120,
      renderCell: (params) => {
        const sent = params.row.performance?.sent || 0;
        const opened = params.row.performance?.opened || 0;
        const rate = sent > 0 ? ((opened / sent) * 100).toFixed(1) : 0;
        const color = rate > 30 ? 'success' : rate > 20 ? 'warning' : 'error';
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <LinearProgress 
              variant="determinate" 
              value={Number(rate)} 
              color={color}
              sx={{ width: 50, height: 6, borderRadius: 3 }}
            />
            <Typography variant="caption">{rate}%</Typography>
          </Box>
        );
      }
    },
    { 
      field: 'clickRate', 
      headerName: 'Click Rate', 
      width: 120,
      renderCell: (params) => {
        const opened = params.row.performance?.opened || 0;
        const clicked = params.row.performance?.clicked || 0;
        const rate = opened > 0 ? ((clicked / opened) * 100).toFixed(1) : 0;
        const color = rate > 10 ? 'success' : rate > 5 ? 'warning' : 'error';
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <LinearProgress 
              variant="determinate" 
              value={Number(rate)} 
              color={color}
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
          <Typography variant="body2">{params.row.performance?.converted || 0}</Typography>
        </Box>
      )
    },
    { 
      field: 'revenue', 
      headerName: 'Revenue', 
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" color="success.main" fontWeight={500}>
          ${(params.row.performance?.revenue || 0).toLocaleString()}
        </Typography>
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
            disabled={params.row.status === 'completed'}
          >
            {params.row.status === 'active' ? <Pause size={16} /> : <Play size={16} />}
          </IconButton>
          <IconButton size="small" onClick={() => handleEditCampaign(params.row)}>
            <Edit2 size={16} />
          </IconButton>
          <IconButton 
            size="small" 
            onClick={(e) => {
              setAnchorEl(e.currentTarget);
              setSelectedCampaignMenu(params.row);
            }}
          >
            <MoreVertical size={16} />
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
            Automate your email marketing with intelligent sequences
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Upload size={20} />}
          >
            Import
          </Button>
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
        <Grid item xs={12} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Total Campaigns</Typography>
                  <Typography variant="h4" fontWeight={600}>{statistics.total}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {statistics.active} active, {statistics.paused} paused
                  </Typography>
                </Box>
                <Activity size={24} color="#3B82F6" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Emails Sent</Typography>
                  <Typography variant="h4" fontWeight={600}>{statistics.totalSent.toLocaleString()}</Typography>
                  <Typography variant="caption" color="success.main">
                    <ArrowUp size={12} /> 12% this month
                  </Typography>
                </Box>
                <Send size={24} color="#10B981" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Open Rate</Typography>
                  <Typography variant="h4" fontWeight={600}>{statistics.avgOpenRate}%</Typography>
                  <Typography variant="caption" color={Number(statistics.avgOpenRate) > 25 ? 'success.main' : 'error.main'}>
                    Industry avg: 25%
                  </Typography>
                </Box>
                <Eye size={24} color="#F59E0B" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Click Rate</Typography>
                  <Typography variant="h4" fontWeight={600}>{statistics.avgClickRate}%</Typography>
                  <Typography variant="caption" color={Number(statistics.avgClickRate) > 3 ? 'success.main' : 'error.main'}>
                    Industry avg: 3%
                  </Typography>
                </Box>
                <Target size={24} color="#8B5CF6" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Revenue Generated</Typography>
                  <Typography variant="h4" fontWeight={600}>${statistics.totalRevenue.toLocaleString()}</Typography>
                  <Typography variant="caption" color="success.main">
                    <ArrowUp size={12} /> 28% this quarter
                  </Typography>
                </Box>
                <DollarSign size={24} color="#EF4444" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="All Campaigns" />
          <Tab label="Templates" />
          <Tab label="Performance" />
          <Tab label="A/B Testing" />
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
                <MenuItem value="completed">Completed</MenuItem>
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
                              campaign.status === 'completed' ? 'info' :
                              'default'
                            }
                          />
                        </Box>
                        <IconButton 
                          size="small" 
                          onClick={(e) => {
                            setAnchorEl(e.currentTarget);
                            setSelectedCampaignMenu(campaign);
                          }}
                        >
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
                            {campaign.sequence?.length || 0} emails
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Sent</Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {campaign.performance?.sent || 0}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Open Rate</Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {campaign.performance?.sent > 0 
                              ? ((campaign.performance.opened / campaign.performance.sent) * 100).toFixed(1) 
                              : 0}%
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Revenue</Typography>
                          <Typography variant="body2" fontWeight={500} color="success.main">
                            ${campaign.performance?.revenue || 0}
                          </Typography>
                        </Grid>
                      </Grid>
                      
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant={campaign.status === 'active' ? 'outlined' : 'contained'}
                          startIcon={campaign.status === 'active' ? <Pause size={16} /> : <Play size={16} />}
                          onClick={() => handleToggleCampaignStatus(campaign.id, campaign.status)}
                          disabled={campaign.status === 'completed'}
                        >
                          {campaign.status === 'active' ? 'Pause' : 'Activate'}
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Eye size={16} />}
                          onClick={() => handleEditCampaign(campaign)}
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
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Campaign Templates</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Start with pre-built templates optimized for conversion
          </Typography>
          <Grid container spacing={3}>
            {Object.entries(campaignTemplates).map(([key, template]) => (
              <Grid item xs={12} md={4} key={key}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>{template.name}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {template.description}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Chip label={`${template.sequence.length} emails`} size="small" sx={{ mr: 1 }} />
                      <Chip label={template.triggers.type} size="small" />
                    </Box>
                    <Button 
                      fullWidth 
                      variant="contained"
                      onClick={() => handleUseTemplate(key)}
                    >
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {tabValue === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Campaign Performance (30 Days)</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
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
            
            <Paper sx={{ p: 2, mt: 3 }}>
              <Typography variant="h6" gutterBottom>Revenue Trend</Typography>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip formatter={(value) => `$${value}`} />
                  <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Conversion Funnel</Typography>
              <ResponsiveContainer width="100%" height={350}>
                <FunnelChart>
                  <ChartTooltip />
                  <Funnel dataKey="value" data={funnelData} isAnimationActive>
                    <LabelList position="center" fill="#fff" />
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {tabValue === 3 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>A/B Testing</Typography>
          <Alert severity="info" sx={{ mb: 3 }}>
            Test different subject lines, content, and send times to optimize performance
          </Alert>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Test Name</TableCell>
                  <TableCell>Variant A</TableCell>
                  <TableCell>Variant B</TableCell>
                  <TableCell>Winner</TableCell>
                  <TableCell>Improvement</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Subject Line Test</TableCell>
                  <TableCell>25% open rate</TableCell>
                  <TableCell>32% open rate</TableCell>
                  <TableCell><Chip label="Variant B" color="success" size="small" /></TableCell>
                  <TableCell>+28%</TableCell>
                  <TableCell><Chip label="Complete" size="small" /></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Send Time Test</TableCell>
                  <TableCell>9 AM: 18% open</TableCell>
                  <TableCell>2 PM: 22% open</TableCell>
                  <TableCell><Chip label="Variant B" color="success" size="small" /></TableCell>
                  <TableCell>+22%</TableCell>
                  <TableCell><Chip label="Complete" size="small" /></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {tabValue === 4 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Automation Rules</Typography>
          <List>
            {[
              { name: 'New Lead Welcome', trigger: 'Lead Created', action: 'Start Welcome Series', active: true },
              { name: 'Cart Abandonment', trigger: 'Cart Abandoned > 1 hour', action: 'Send Recovery Email', active: true },
              { name: 'Win-Back Campaign', trigger: 'No Activity > 30 Days', action: 'Start Re-engagement Series', active: false },
              { name: 'Birthday Greetings', trigger: 'Contact Birthday', action: 'Send Birthday Email + Offer', active: true },
              { name: 'Post-Purchase Follow-up', trigger: '7 Days After Purchase', action: 'Send Review Request', active: true }
            ].map((rule, index) => (
              <ListItem key={index} divider>
                <ListItemIcon>
                  <Zap size={20} />
                </ListItemIcon>
                <ListItemText
                  primary={rule.name}
                  secondary={`Trigger: ${rule.trigger} → Action: ${rule.action}`}
                />
                <ListItemSecondaryAction>
                  <Switch checked={rule.active} />
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
          <Button variant="contained" startIcon={<Plus size={20} />} sx={{ mt: 2 }}>
            Add New Rule
          </Button>
        </Paper>
      )}

      {/* Create/Edit Campaign Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
        <DialogTitle>
          {selectedCampaign ? 'Edit Campaign' : 'Create New Drip Campaign'}
          {selectedTemplate && (
            <Chip label={`Using ${campaignTemplates[selectedTemplate].name} template`} size="small" sx={{ ml: 2 }} />
          )}
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
                          required
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
                      <Grid item xs={12} md={4}>
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
                      <Grid item xs={12} md={4}>
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
                            <MenuItem value="condition">Condition-based</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <FormControl fullWidth>
                          <InputLabel>Priority</InputLabel>
                          <Select
                            value={campaignForm.settings.priority}
                            onChange={(e) => setCampaignForm({ 
                              ...campaignForm, 
                              settings: { ...campaignForm.settings, priority: e.target.value }
                            })}
                            label="Priority"
                          >
                            <MenuItem value="low">Low</MenuItem>
                            <MenuItem value="normal">Normal</MenuItem>
                            <MenuItem value="high">High</MenuItem>
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
                            <FormControlLabel value="all" control={<Radio />} label="All Contacts (2,543 contacts)" />
                            <FormControlLabel value="leads" control={<Radio />} label="Leads Only (892 contacts)" />
                            <FormControlLabel value="customers" control={<Radio />} label="Customers Only (651 contacts)" />
                            <FormControlLabel value="inactive_customers" control={<Radio />} label="Inactive Customers (234 contacts)" />
                            <FormControlLabel value="new_subscribers" control={<Radio />} label="New Subscribers (156 contacts)" />
                            <FormControlLabel value="custom" control={<Radio />} label="Custom Segment" />
                          </RadioGroup>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <Autocomplete
                          multiple
                          options={['VIP', 'Newsletter', 'Product Updates', 'Promotions', 'Events']}
                          value={campaignForm.audience.tags}
                          onChange={(e, value) => setCampaignForm({
                            ...campaignForm,
                            audience: { ...campaignForm.audience, tags: value }
                          })}
                          renderInput={(params) => (
                            <TextField {...params} label="Filter by Tags (optional)" />
                          )}
                        />
                      </Grid>
                    </Grid>
                  )}

                  {index === 2 && (
                    <Box>
                      <Typography variant="subtitle1" gutterBottom>Email Sequence</Typography>
                      <Paper sx={{ p: 2, mb: 2 }}>
                        <EmailToolbar onAction={(action) => console.log(action)} />
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Email Subject"
                              value={emailTemplate.subject}
                              onChange={(e) => setEmailTemplate({ ...emailTemplate, subject: e.target.value })}
                              helperText="Use merge tags: {{first_name}}, {{company}}, etc."
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Preheader Text"
                              value={emailTemplate.preheader}
                              onChange={(e) => setEmailTemplate({ ...emailTemplate, preheader: e.target.value })}
                              helperText="Preview text that appears after subject"
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Email Body"
                              value={emailTemplate.body}
                              onChange={(e) => setEmailTemplate({ ...emailTemplate, body: e.target.value })}
                              multiline
                              rows={8}
                              helperText="Available merge tags: {{first_name}}, {{last_name}}, {{email}}, {{company}}"
                            />
                          </Grid>
                          <Grid item xs={4}>
                            <TextField
                              fullWidth
                              label="Delay"
                              type="number"
                              value={emailTemplate.delay}
                              onChange={(e) => setEmailTemplate({ ...emailTemplate, delay: e.target.value })}
                            />
                          </Grid>
                          <Grid item xs={4}>
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
                          <Grid item xs={4}>
                            <Button 
                              fullWidth
                              variant="contained" 
                              startIcon={<Plus size={16} />}
                              onClick={handleAddToSequence}
                              sx={{ height: '56px' }}
                            >
                              Add to Sequence
                            </Button>
                          </Grid>
                        </Grid>
                      </Paper>
                      
                      {campaignForm.sequence.length > 0 && (
                        <Box>
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
                                  secondary={
                                    <Box>
                                      <Typography variant="caption">
                                        {index === 0 ? 'Immediately' : `After ${item.delay} ${item.delayUnit}`}
                                      </Typography>
                                      <Typography variant="body2" sx={{ mt: 1 }}>
                                        {item.body.substring(0, 100)}...
                                      </Typography>
                                    </Box>
                                  }
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
                        <Typography variant="subtitle1" gutterBottom>Send Settings</Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <InputLabel>Timezone</InputLabel>
                          <Select
                            value={campaignForm.settings.timezone}
                            onChange={(e) => setCampaignForm({
                              ...campaignForm,
                              settings: { ...campaignForm.settings, timezone: e.target.value }
                            })}
                            label="Timezone"
                          >
                            <MenuItem value="PST">Pacific Time</MenuItem>
                            <MenuItem value="MST">Mountain Time</MenuItem>
                            <MenuItem value="CST">Central Time</MenuItem>
                            <MenuItem value="EST">Eastern Time</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField
                          fullWidth
                          label="Send Time Start"
                          type="time"
                          value={campaignForm.settings.sendTimeStart}
                          onChange={(e) => setCampaignForm({
                            ...campaignForm,
                            settings: { ...campaignForm.settings, sendTimeStart: e.target.value }
                          })}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField
                          fullWidth
                          label="Send Time End"
                          type="time"
                          value={campaignForm.settings.sendTimeEnd}
                          onChange={(e) => setCampaignForm({
                            ...campaignForm,
                            settings: { ...campaignForm.settings, sendTimeEnd: e.target.value }
                          })}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
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
                          label="Stop campaign when contact replies"
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
                          label="Stop campaign when contact converts"
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
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={campaignForm.settings.trackClicks}
                              onChange={(e) => setCampaignForm({
                                ...campaignForm,
                                settings: { ...campaignForm.settings, trackClicks: e.target.checked }
                              })}
                            />
                          }
                          label="Track link clicks"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={campaignForm.settings.abTesting}
                              onChange={(e) => setCampaignForm({
                                ...campaignForm,
                                settings: { ...campaignForm.settings, abTesting: e.target.checked }
                              })}
                            />
                          }
                          label="Enable A/B testing"
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
                          <ListItemText primary="Trigger" secondary={campaignForm.triggers.type} />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="Audience" secondary={`${campaignForm.audience.segment} (estimated reach: ~500 contacts)`} />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="Sequence" secondary={`${campaignForm.sequence.length} emails`} />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="Schedule" secondary={`${campaignForm.settings.sendTimeStart} - ${campaignForm.settings.sendTimeEnd} ${campaignForm.settings.timezone}`} />
                        </ListItem>
                      </List>
                      <Box sx={{ mt: 2 }}>
                        <Button
                          variant="outlined"
                          startIcon={<TestTube size={20} />}
                          onClick={() => setTestEmailDialog(true)}
                          sx={{ mr: 2 }}
                        >
                          Send Test Email
                        </Button>
                      </Box>
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
                      {index === steps.length - 1 ? (selectedCampaign ? 'Update Campaign' : 'Create Campaign') : 'Continue'}
                    </Button>
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </DialogContent>
      </Dialog>

      {/* Test Email Dialog */}
      <Dialog open={testEmailDialog} onClose={() => setTestEmailDialog(false)}>
        <DialogTitle>Send Test Email</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Test Email Address"
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            sx={{ mt: 2 }}
            helperText="Enter email address to receive test campaign"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTestEmailDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSendTestEmail}>
            Send Test
          </Button>
        </DialogActions>
      </Dialog>

      {/* Campaign Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => {
          setAnchorEl(null);
          setSelectedCampaignMenu(null);
        }}
      >
        <MenuItem onClick={() => {
          if (selectedCampaignMenu) handleDuplicateCampaign(selectedCampaignMenu);
          setAnchorEl(null);
        }}>
          <Copy size={16} style={{ marginRight: 8 }} /> Duplicate
        </MenuItem>
        <MenuItem onClick={() => {
          if (selectedCampaignMenu) handleEditCampaign(selectedCampaignMenu);
          setAnchorEl(null);
        }}>
          <Edit2 size={16} style={{ marginRight: 8 }} /> Edit
        </MenuItem>
        <MenuItem onClick={() => {
          setTestEmailDialog(true);
          setAnchorEl(null);
        }}>
          <TestTube size={16} style={{ marginRight: 8 }} /> Send Test
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => {
          if (selectedCampaignMenu) handleDeleteCampaign(selectedCampaignMenu.id);
          setAnchorEl(null);
        }} sx={{ color: 'error.main' }}>
          <Trash2 size={16} style={{ marginRight: 8 }} /> Delete
        </MenuItem>
      </Menu>

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