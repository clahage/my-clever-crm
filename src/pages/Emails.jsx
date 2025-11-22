// src/pages/Email.jsx - Complete Email Campaign Management System
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Box, Paper, Typography, Button, TextField, IconButton, Tabs, Tab,
  Dialog, DialogTitle, DialogContent, DialogActions, Chip, Alert,
  Snackbar, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TablePagination, Menu, MenuItem, FormControl, InputLabel,
  Select, Card, CardContent, Grid, Avatar, Stack, Tooltip, Badge,
  CircularProgress, LinearProgress, List, ListItem, ListItemText,
  ListItemIcon, ListItemSecondaryAction, Divider, Switch,
  FormControlLabel, Checkbox, RadioGroup, Radio, Autocomplete,
  InputAdornment, ToggleButton, ToggleButtonGroup, Slider,
  Stepper, Step, StepLabel, SpeedDial, SpeedDialIcon, SpeedDialAction,
  Accordion, AccordionSummary, AccordionDetails, Rating, Fab
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  Mail, Send, Edit, Trash2, Search, Filter, Calendar, Clock,
  CheckCircle, XCircle, AlertCircle, Eye, Copy, Archive, Settings,
  TrendingUp, Users, Target, Zap, BarChart2, PieChart,
  Globe, Smartphone, Monitor, RefreshCw, Pause, Play, Star,
  FileText, Image, Link2, Code, Bold, Italic, Underline,
  AlignLeft, AlignCenter, AlignRight, List as ListIcon, Hash,
  Paperclip, Smile, Video, Music, MapPin, Gift, Award, Shield,
  Activity, Download, Upload, FolderPlus, Tag, UserPlus,
  MessageSquare, Heart, ThumbsUp, Share2, Bookmark, MoreVertical,
  ChevronRight, ExternalLink, Layers, Database, Cpu, Wifi,
  Plus, Grid as GridIcon  // Added missing icons
} from 'lucide-react';
import { 
  collection, query, where, getDocs, addDoc, updateDoc, deleteDoc,
  doc, orderBy, limit, serverTimestamp, onSnapshot, getDoc, setDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { format, addDays, subDays, differenceInMinutes, parseISO } from 'date-fns';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import ContactAutocomplete from '@/components/ContactAutocomplete';
import ImpersonationSelector, { useImpersonation } from '@/components/ImpersonationSelector';

const Email = () => {
  const { currentUser, userProfile } = useAuth();
  const { canImpersonate, impersonatedUser, setImpersonatedUser, impersonationData, isImpersonating } = useImpersonation();
  const [tabValue, setTabValue] = useState(0);
  const [campaigns, setCampaigns] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const editorRef = useRef(null);

  // Campaign Form State
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    subject: '',
    preheader: '',
    fromName: '',
    fromEmail: '',
    replyTo: '',
    content: '',
    template: null,
    recipients: [],
    segments: [],
    schedule: {
      type: 'immediate', // immediate, scheduled, recurring
      sendAt: null,
      timezone: 'America/Los_Angeles',
      recurringPattern: 'daily' // daily, weekly, monthly
    },
    tracking: {
      opens: true,
      clicks: true,
      unsubscribes: true,
      bounces: true
    },
    automation: {
      enabled: false,
      trigger: 'signup', // signup, purchase, birthday, etc.
      delay: 0,
      delayUnit: 'hours'
    },
    abTesting: {
      enabled: false,
      variants: [],
      testSize: 20,
      winnerCriteria: 'opens' // opens, clicks, conversions
    },
    personalization: {
      enabled: true,
      mergeTags: []
    },
    settings: {
      footerRequired: true,
      unsubscribeLink: true,
      trackingPixel: true
    }
  });

  // Template Form State
  const [templateForm, setTemplateForm] = useState({
    name: '',
    category: 'general',
    subject: '',
    content: '',
    thumbnail: '',
    variables: [],
    isPublic: false
  });

  // Statistics
  const [statistics, setStatistics] = useState({
    totalSent: 0,
    totalOpened: 0,
    totalClicked: 0,
    avgOpenRate: 0,
    avgClickRate: 0,
    totalBounced: 0,
    totalUnsubscribed: 0,
    recentActivity: []
  });

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // Email Editor Modules
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link', 'image', 'video'],
      [{ 'color': [] }, { 'background': [] }],
      ['clean']
    ],
  };

  // Predefined Email Templates
  const emailTemplates = [
    {
      id: 'welcome',
      name: 'Welcome Series',
      category: 'onboarding',
      subject: 'Welcome to {{company}}!',
      content: `<h2>Welcome aboard, {{firstName}}!</h2>
        <p>We're thrilled to have you join our credit repair journey.</p>
        <p>Here's what you can expect:</p>
        <ul>
          <li>Personalized credit analysis</li>
          <li>Monthly progress reports</li>
          <li>Expert support team</li>
        </ul>
        <a href="{{ctaLink}}" style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Get Started</a>`
    },
    {
      id: 'progress',
      name: 'Progress Update',
      category: 'engagement',
      subject: '{{firstName}}, your credit score improved!',
      content: `<h2>Great news, {{firstName}}!</h2>
        <p>Your credit score has increased by {{scoreIncrease}} points!</p>
        <p>Current Score: <strong>{{currentScore}}</strong></p>
        <p>Keep up the great work!</p>`
    },
    {
      id: 'reminder',
      name: 'Payment Reminder',
      category: 'transactional',
      subject: 'Payment Reminder - Due {{dueDate}}',
      content: `<p>Hi {{firstName}},</p>
        <p>This is a friendly reminder that your payment of {{amount}} is due on {{dueDate}}.</p>
        <a href="{{paymentLink}}">Make Payment</a>`
    }
  ];

  // Load campaigns
  const loadCampaigns = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'emailCampaigns'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const campaignsData = [];
      
      querySnapshot.forEach((doc) => {
        campaignsData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setCampaigns(campaignsData);
      calculateStatistics(campaignsData);
    } catch (error) {
      console.error('Error loading campaigns:', error);
      showSnackbar('Error loading campaigns', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Load templates
  const loadTemplates = async () => {
    try {
      const q = query(
        collection(db, 'emailTemplates'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const templatesData = [];
      
      querySnapshot.forEach((doc) => {
        templatesData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setTemplates([...emailTemplates, ...templatesData]);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  // Load contacts
  const loadContacts = async () => {
    try {
      const q = query(
        collection(db, 'contacts'),
        where('userId', '==', currentUser.uid),
        orderBy('name')
      );
      
      const querySnapshot = await getDocs(q);
      const contactsData = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        contactsData.push({
          id: doc.id,
          ...data,
          displayName: data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.email
        });
      });
      
      setContacts(contactsData);
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  // Calculate statistics
  const calculateStatistics = (campaignsData) => {
    const stats = {
      totalSent: 0,
      totalOpened: 0,
      totalClicked: 0,
      avgOpenRate: 0,
      avgClickRate: 0,
      totalBounced: 0,
      totalUnsubscribed: 0,
      recentActivity: []
    };

    campaignsData.forEach(campaign => {
      if (campaign.stats) {
        stats.totalSent += campaign.stats.sent || 0;
        stats.totalOpened += campaign.stats.opened || 0;
        stats.totalClicked += campaign.stats.clicked || 0;
        stats.totalBounced += campaign.stats.bounced || 0;
        stats.totalUnsubscribed += campaign.stats.unsubscribed || 0;
      }
    });

    if (stats.totalSent > 0) {
      stats.avgOpenRate = (stats.totalOpened / stats.totalSent) * 100;
      stats.avgClickRate = (stats.totalClicked / stats.totalSent) * 100;
    }

    setStatistics(stats);
  };

  // Create campaign
  const handleCreateCampaign = async () => {
    setLoading(true);
    try {
      const campaignData = {
        ...campaignForm,
        userId: currentUser.uid,
        status: 'draft',
        stats: {
          sent: 0,
          opened: 0,
          clicked: 0,
          bounced: 0,
          unsubscribed: 0
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await addDoc(collection(db, 'emailCampaigns'), campaignData);
      
      showSnackbar('Campaign created successfully!', 'success');
      setDialogOpen(false);
      resetCampaignForm();
      loadCampaigns();
    } catch (error) {
      console.error('Error creating campaign:', error);
      showSnackbar('Error creating campaign', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Send campaign
  const handleSendCampaign = async (campaign) => {
    try {
      // Update campaign status
      await updateDoc(doc(db, 'emailCampaigns', campaign.id), {
        status: 'sending',
        sentAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      // In production, this would trigger actual email sending
      // For now, we'll simulate it
      setTimeout(async () => {
        await updateDoc(doc(db, 'emailCampaigns', campaign.id), {
          status: 'sent',
          'stats.sent': campaign.recipients?.length || 0,
          updatedAt: serverTimestamp()
        });
        
        showSnackbar('Campaign sent successfully!', 'success');
        loadCampaigns();
      }, 2000);
      
    } catch (error) {
      console.error('Error sending campaign:', error);
      showSnackbar('Error sending campaign', 'error');
    }
  };

  // Duplicate campaign
  const duplicateCampaign = async (campaign) => {
    try {
      const newCampaign = {
        ...campaign,
        name: `${campaign.name} (Copy)`,
        status: 'draft',
        stats: {
          sent: 0,
          opened: 0,
          clicked: 0,
          bounced: 0,
          unsubscribed: 0
        }
      };
      
      delete newCampaign.id;
      delete newCampaign.createdAt;
      delete newCampaign.updatedAt;
      delete newCampaign.sentAt;
      
      await addDoc(collection(db, 'emailCampaigns'), {
        ...newCampaign,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      showSnackbar('Campaign duplicated successfully!', 'success');
      loadCampaigns();
    } catch (error) {
      console.error('Error duplicating campaign:', error);
      showSnackbar('Error duplicating campaign', 'error');
    }
  };

  // Delete campaign
  const handleDeleteCampaign = async (campaignId) => {
    if (!window.confirm('Are you sure you want to delete this campaign?')) return;
    
    try {
      await deleteDoc(doc(db, 'emailCampaigns', campaignId));
      showSnackbar('Campaign deleted successfully', 'success');
      loadCampaigns();
    } catch (error) {
      console.error('Error deleting campaign:', error);
      showSnackbar('Error deleting campaign', 'error');
    }
  };

  // Create template
  const handleCreateTemplate = async () => {
    setLoading(true);
    try {
      const templateData = {
        ...templateForm,
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await addDoc(collection(db, 'emailTemplates'), templateData);
      
      showSnackbar('Template created successfully!', 'success');
      setTemplateDialogOpen(false);
      resetTemplateForm();
      loadTemplates();
    } catch (error) {
      console.error('Error creating template:', error);
      showSnackbar('Error creating template', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Apply template
  const applyTemplate = (template) => {
    setCampaignForm(prev => ({
      ...prev,
      subject: template.subject,
      content: template.content,
      template: template
    }));
    showSnackbar('Template applied!', 'success');
  };

  // Reset forms
  const resetCampaignForm = () => {
    setCampaignForm({
      name: '',
      subject: '',
      preheader: '',
      fromName: '',
      fromEmail: '',
      replyTo: '',
      content: '',
      template: null,
      recipients: [],
      segments: [],
      schedule: {
        type: 'immediate',
        sendAt: null,
        timezone: 'America/Los_Angeles',
        recurringPattern: 'daily'
      },
      tracking: {
        opens: true,
        clicks: true,
        unsubscribes: true,
        bounces: true
      },
      automation: {
        enabled: false,
        trigger: 'signup',
        delay: 0,
        delayUnit: 'hours'
      },
      abTesting: {
        enabled: false,
        variants: [],
        testSize: 20,
        winnerCriteria: 'opens'
      },
      personalization: {
        enabled: true,
        mergeTags: []
      },
      settings: {
        footerRequired: true,
        unsubscribeLink: true,
        trackingPixel: true
      }
    });
    setSelectedCampaign(null);
  };

  const resetTemplateForm = () => {
    setTemplateForm({
      name: '',
      category: 'general',
      subject: '',
      content: '',
      thumbnail: '',
      variables: [],
      isPublic: false
    });
  };

  // Show snackbar
  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  // Initialize
  useEffect(() => {
    if (currentUser) {
      loadCampaigns();
      loadTemplates();
      loadContacts();
    }
  }, [currentUser]);

  // Filter campaigns
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(campaign => {
      if (filterStatus !== 'all' && campaign.status !== filterStatus) return false;
      
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          campaign.name?.toLowerCase().includes(search) ||
          campaign.subject?.toLowerCase().includes(search)
        );
      }
      
      return true;
    });
  }, [campaigns, filterStatus, searchTerm]);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight={600}>
              Email Campaigns
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create and manage email marketing campaigns
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<FileText size={20} />}
              onClick={() => setTemplateDialogOpen(true)}
            >
              Templates
            </Button>
            <Button
              variant="contained"
              startIcon={<Send size={20} />}
              onClick={() => {
                resetCampaignForm();
                setDialogOpen(true);
              }}
            >
              Create Campaign
            </Button>
          </Stack>
        </Box>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Total Sent</Typography>
                    <Typography variant="h4" fontWeight={600}>
                      {statistics.totalSent.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="success.main">
                      <TrendingUp size={12} /> Active campaigns
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
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Open Rate</Typography>
                    <Typography variant="h4" fontWeight={600}>
                      {statistics.avgOpenRate.toFixed(1)}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Industry avg: 21.5%
                    </Typography>
                  </Box>
                  <Eye size={24} color="#3B82F6" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Click Rate</Typography>
                    <Typography variant="h4" fontWeight={600}>
                      {statistics.avgClickRate.toFixed(1)}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Industry avg: 2.6%
                    </Typography>
                  </Box>
                  <Target size={24} color="#8B5CF6" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Bounce Rate</Typography>
                    <Typography variant="h4" fontWeight={600}>
                      {statistics.totalBounced > 0 ? 
                        ((statistics.totalBounced / statistics.totalSent) * 100).toFixed(1) : 0}%
                    </Typography>
                    <Typography variant="caption" color="error.main">
                      Keep below 2%
                    </Typography>
                  </Box>
                  <AlertCircle size={24} color="#EF4444" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Paper>
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tab label="Campaigns" />
            <Tab label="Automation" />
            <Tab label="Analytics" />
            <Tab label="Templates" />
          </Tabs>

          {/* Campaigns Tab */}
          {tabValue === 0 && (
            <Box sx={{ p: 3 }}>
              {/* Filters */}
              <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                  placeholder="Search campaigns..."
                  size="small"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <Search size={18} />
                  }}
                  sx={{ width: 300 }}
                />
                
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="draft">Draft</MenuItem>
                    <MenuItem value="scheduled">Scheduled</MenuItem>
                    <MenuItem value="sending">Sending</MenuItem>
                    <MenuItem value="sent">Sent</MenuItem>
                    <MenuItem value="paused">Paused</MenuItem>
                  </Select>
                </FormControl>

                <Box sx={{ flexGrow: 1 }} />

                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={(e, v) => v && setViewMode(v)}
                  size="small"
                >
                  <ToggleButton value="list">
                    <ListIcon size={18} />
                  </ToggleButton>
                  <ToggleButton value="grid">
                    <GridIcon size={18} />
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {/* Campaigns List/Grid */}
              {viewMode === 'list' ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Campaign</TableCell>
                        <TableCell>Recipients</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Sent</TableCell>
                        <TableCell>Opens</TableCell>
                        <TableCell>Clicks</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredCampaigns
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((campaign) => (
                          <TableRow key={campaign.id}>
                            <TableCell>
                              <Box>
                                <Typography variant="body2" fontWeight={500}>
                                  {campaign.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {campaign.subject}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                icon={<Users size={14} />}
                                label={campaign.recipients?.length || 0}
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={campaign.status}
                                size="small"
                                color={
                                  campaign.status === 'sent' ? 'success' :
                                  campaign.status === 'sending' ? 'warning' :
                                  campaign.status === 'scheduled' ? 'info' :
                                  'default'
                                }
                              />
                            </TableCell>
                            <TableCell>{campaign.stats?.sent || 0}</TableCell>
                            <TableCell>
                              {campaign.stats?.sent > 0 ? (
                                <Box>
                                  <Typography variant="body2">
                                    {((campaign.stats?.opened / campaign.stats?.sent) * 100).toFixed(1)}%
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {campaign.stats?.opened} opens
                                  </Typography>
                                </Box>
                              ) : '-'}
                            </TableCell>
                            <TableCell>
                              {campaign.stats?.sent > 0 ? (
                                <Box>
                                  <Typography variant="body2">
                                    {((campaign.stats?.clicked / campaign.stats?.sent) * 100).toFixed(1)}%
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {campaign.stats?.clicked} clicks
                                  </Typography>
                                </Box>
                              ) : '-'}
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={1}>
                                {campaign.status === 'draft' && (
                                  <Tooltip title="Send">
                                    <IconButton 
                                      size="small"
                                      onClick={() => handleSendCampaign(campaign)}
                                    >
                                      <Send size={16} />
                                    </IconButton>
                                  </Tooltip>
                                )}
                                
                                <Tooltip title="View">
                                  <IconButton size="small">
                                    <Eye size={16} />
                                  </IconButton>
                                </Tooltip>
                                
                                <Tooltip title="Duplicate">
                                  <IconButton 
                                    size="small"
                                    onClick={() => duplicateCampaign(campaign)}
                                  >
                                    <Copy size={16} />
                                  </IconButton>
                                </Tooltip>
                                
                                <Tooltip title="Delete">
                                  <IconButton 
                                    size="small" 
                                    color="error"
                                    onClick={() => handleDeleteCampaign(campaign.id)}
                                  >
                                    <Trash2 size={16} />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Grid container spacing={3}>
                  {filteredCampaigns.map((campaign) => (
                    <Grid item xs={12} md={4} key={campaign.id}>
                      <Card>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="h6" noWrap>
                              {campaign.name}
                            </Typography>
                            <Chip
                              label={campaign.status}
                              size="small"
                              color={
                                campaign.status === 'sent' ? 'success' :
                                campaign.status === 'sending' ? 'warning' :
                                'default'
                              }
                            />
                          </Box>
                          
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {campaign.subject}
                          </Typography>
                          
                          <Divider sx={{ my: 2 }} />
                          
                          <Grid container spacing={2}>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="text.secondary">
                                Recipients
                              </Typography>
                              <Typography variant="body2">
                                {campaign.recipients?.length || 0}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="text.secondary">
                                Open Rate
                              </Typography>
                              <Typography variant="body2">
                                {campaign.stats?.sent > 0 ? 
                                  `${((campaign.stats?.opened / campaign.stats?.sent) * 100).toFixed(1)}%` : 
                                  '-'
                                }
                              </Typography>
                            </Grid>
                          </Grid>
                          
                          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                            {campaign.status === 'draft' && (
                              <Button
                                size="small"
                                variant="contained"
                                onClick={() => handleSendCampaign(campaign)}
                              >
                                Send
                              </Button>
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
              
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredCampaigns.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
              />
            </Box>
          )}

          {/* Automation Tab */}
          {tabValue === 1 && (
            <Box sx={{ p: 3 }}>
              <Alert severity="info" sx={{ mb: 3 }}>
                Set up automated email workflows based on triggers like signups, purchases, or custom events.
              </Alert>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Card sx={{ borderTop: '4px solid #10B981' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Welcome Series</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Automatically send welcome emails to new subscribers
                      </Typography>
                      <Button variant="outlined" fullWidth sx={{ mt: 2 }}>
                        Configure
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Card sx={{ borderTop: '4px solid #3B82F6' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Birthday Email</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Send personalized birthday wishes with special offers
                      </Typography>
                      <Button variant="outlined" fullWidth sx={{ mt: 2 }}>
                        Configure
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Card sx={{ borderTop: '4px solid #8B5CF6' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Re-engagement</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Win back inactive subscribers with targeted campaigns
                      </Typography>
                      <Button variant="outlined" fullWidth sx={{ mt: 2 }}>
                        Configure
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Analytics Tab */}
          {tabValue === 2 && (
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>Campaign Performance</Typography>
                    <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography color="text.secondary">
                        Performance chart will be displayed here
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>Top Performing</Typography>
                    <List dense>
                      {campaigns.slice(0, 5).map((campaign) => (
                        <ListItem key={campaign.id}>
                          <ListItemText
                            primary={campaign.name}
                            secondary={`Open rate: ${
                              campaign.stats?.sent > 0 ? 
                              ((campaign.stats?.opened / campaign.stats?.sent) * 100).toFixed(1) : 
                              0}%`
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Templates Tab */}
          {tabValue === 3 && (
            <Box sx={{ p: 3 }}>
              <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6">Email Templates</Typography>
                <Button
                  variant="contained"
                  startIcon={<Plus size={20} />}
                  onClick={() => setTemplateDialogOpen(true)}
                >
                  Create Template
                </Button>
              </Box>
              
              <Grid container spacing={3}>
                {templates.map((template) => (
                  <Grid item xs={12} md={4} key={template.id || template.name}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                          <Typography variant="subtitle1" fontWeight={500}>
                            {template.name}
                          </Typography>
                          <Chip 
                            label={template.category}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {template.subject}
                        </Typography>
                        
                        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => applyTemplate(template)}
                          >
                            Use Template
                          </Button>
                          <IconButton size="small">
                            <Eye size={16} />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Paper>

        {/* Create Campaign Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="lg" fullWidth>
          <DialogTitle>Create Email Campaign</DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Campaign Name"
                  fullWidth
                  value={campaignForm.name}
                  onChange={(e) => setCampaignForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Subject Line"
                  fullWidth
                  value={campaignForm.subject}
                  onChange={(e) => setCampaignForm(prev => ({ ...prev, subject: e.target.value }))}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="From Name"
                  fullWidth
                  value={campaignForm.fromName}
                  onChange={(e) => setCampaignForm(prev => ({ ...prev, fromName: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="From Email"
                  fullWidth
                  value={campaignForm.fromEmail}
                  onChange={(e) => setCampaignForm(prev => ({ ...prev, fromEmail: e.target.value }))}
                />
              </Grid>
              
              {/* Impersonation Selector */}
              {canImpersonate && (
                <Grid item xs={12}>
                  <ImpersonationSelector
                    value={impersonatedUser}
                    onChange={setImpersonatedUser}
                  />
                </Grid>
              )}
              
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  options={contacts}
                  getOptionLabel={(option) => option.displayName || option.email}
                  value={campaignForm.recipients}
                  onChange={(e, value) => setCampaignForm(prev => ({ ...prev, recipients: value }))}
                  renderInput={(params) => (
                    <TextField {...params} label="Recipients" placeholder="Select contacts" />
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Email Content
                </Typography>
                <ReactQuill
                  ref={editorRef}
                  theme="snow"
                  value={campaignForm.content}
                  onChange={(content) => setCampaignForm(prev => ({ ...prev, content }))}
                  modules={modules}
                  style={{ height: 300, marginBottom: 50 }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Schedule Type</InputLabel>
                  <Select
                    value={campaignForm.schedule.type}
                    onChange={(e) => setCampaignForm(prev => ({ 
                      ...prev, 
                      schedule: { ...prev.schedule, type: e.target.value }
                    }))}
                  >
                    <MenuItem value="immediate">Send Immediately</MenuItem>
                    <MenuItem value="scheduled">Schedule for Later</MenuItem>
                    <MenuItem value="recurring">Recurring</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              {campaignForm.schedule.type === 'scheduled' && (
                <Grid item xs={12} md={6}>
                  <DateTimePicker
                    label="Send At"
                    value={campaignForm.schedule.sendAt}
                    onChange={(date) => setCampaignForm(prev => ({ 
                      ...prev, 
                      schedule: { ...prev.schedule, sendAt: date }
                    }))}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleCreateCampaign}>
              Create Campaign
            </Button>
          </DialogActions>
        </Dialog>

        {/* Create Template Dialog */}
        <Dialog open={templateDialogOpen} onClose={() => setTemplateDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Create Email Template</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Template Name"
                  fullWidth
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={templateForm.category}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, category: e.target.value }))}
                  >
                    <MenuItem value="general">General</MenuItem>
                    <MenuItem value="onboarding">Onboarding</MenuItem>
                    <MenuItem value="transactional">Transactional</MenuItem>
                    <MenuItem value="engagement">Engagement</MenuItem>
                    <MenuItem value="promotional">Promotional</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Subject Line"
                  fullWidth
                  value={templateForm.subject}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, subject: e.target.value }))}
                  helperText="Use {{firstName}}, {{lastName}}, {{email}} for personalization"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Template Content
                </Typography>
                <ReactQuill
                  theme="snow"
                  value={templateForm.content}
                  onChange={(content) => setTemplateForm(prev => ({ ...prev, content }))}
                  modules={modules}
                  style={{ height: 300, marginBottom: 50 }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTemplateDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleCreateTemplate}>
              Create Template
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
};

export default Email;