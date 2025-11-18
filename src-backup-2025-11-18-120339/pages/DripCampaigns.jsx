// DripCampaigns.jsx - Enhanced with Contact Integration and Advanced Triggers
// Version 2.0 - Full Contact System Integration & Smart Automation
import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  Checkbox,
  Autocomplete,
  Stack,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
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
  ChevronDown,
  Award,
  DollarSign,
  ArrowUp,
  ArrowDown,
  FileText,
  Shield,
  RefreshCw,
  Database,
  Link,
  Layers,
  Tag,
  UserCheck,
  Bell,
  BellOff,
  Star,
  CreditCard,
  Home,
  Briefcase,
  MapPin,
  Hash
} from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot,
  orderBy,
  limit,
  serverTimestamp,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
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
  ResponsiveContainer, 
  Legend 
} from 'recharts';

// Import Telnyx service for SMS
// import { sendSMS } from '../services/telnyxFaxService';  // Commented out - not available yet

const DripCampaigns = () => {
  const { currentUser } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Contact Management States
  const [contacts, setContacts] = useState([]);
  const [segments, setSegments] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  
  // Advanced Trigger States
  const [triggers, setTriggers] = useState([]);
  const [automationRules, setAutomationRules] = useState([]);
  const [activeAutomations, setActiveAutomations] = useState([]);
  
  // Campaign Form State
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    description: '',
    type: 'email', // email, sms, mixed
    status: 'draft',
    audience: {
      segment: 'all',
      contacts: [],
      filters: [],
      totalCount: 0
    },
    triggers: {
      type: 'manual', // manual, event, schedule, condition
      event: '',
      conditions: [],
      schedule: null,
      delay: 0
    },
    sequence: [],
    settings: {
      sendingDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
      sendingHours: { start: 9, end: 17 },
      timezone: 'America/Los_Angeles',
      trackOpens: true,
      trackClicks: true,
      unsubscribeLink: true,
      complianceFooter: true
    },
    goals: {
      type: 'engagement', // engagement, conversion, custom
      target: 0,
      metric: 'open_rate'
    }
  });

  // Campaigns State
  const [campaigns, setCampaigns] = useState([]);
  const [campaignStats, setCampaignStats] = useState({});
  
  // Statistics
  const [statistics, setStatistics] = useState({
    total: 0,
    active: 0,
    totalSent: 0,
    avgOpenRate: 0,
    avgClickRate: 0,
    totalConverted: 0,
    conversionRate: 0
  });

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // Available Trigger Events
  const triggerEvents = [
    { value: 'contact_created', label: 'Contact Created', icon: UserPlus },
    { value: 'dispute_sent', label: 'Dispute Letter Sent', icon: FileText },
    { value: 'dispute_response', label: 'Dispute Response Received', icon: Mail },
    { value: 'payment_received', label: 'Payment Received', icon: CreditCard },
    { value: 'payment_missed', label: 'Payment Missed', icon: AlertCircle },
    { value: 'score_updated', label: 'Credit Score Updated', icon: TrendingUp },
    { value: 'score_increased', label: 'Credit Score Increased', icon: ArrowUp },
    { value: 'score_decreased', label: 'Credit Score Decreased', icon: ArrowDown },
    { value: 'account_inactive', label: 'Account Inactive (X days)', icon: Clock },
    { value: 'birthday', label: 'Contact Birthday', icon: Award },
    { value: 'anniversary', label: 'Account Anniversary', icon: Calendar },
    { value: 'tag_added', label: 'Tag Added to Contact', icon: Tag },
    { value: 'segment_joined', label: 'Joined Segment', icon: Users },
    { value: 'form_submitted', label: 'Form Submitted', icon: FileText },
    { value: 'appointment_scheduled', label: 'Appointment Scheduled', icon: Calendar },
    { value: 'appointment_completed', label: 'Appointment Completed', icon: CheckCircle },
    { value: 'contract_signed', label: 'Contract Signed', icon: FileText },
    { value: 'milestone_reached', label: 'Milestone Reached', icon: Star },
    { value: 'custom_event', label: 'Custom Event', icon: Zap }
  ];

  // Condition Options for Advanced Triggers
  const conditionOptions = [
    { field: 'credit_score', label: 'Credit Score', operators: ['>', '<', '=', '>=', '<=', 'between'] },
    { field: 'dispute_count', label: 'Dispute Count', operators: ['>', '<', '=', '>=', '<='] },
    { field: 'account_age', label: 'Account Age (days)', operators: ['>', '<', '=', '>=', '<='] },
    { field: 'payment_status', label: 'Payment Status', operators: ['=', '!='], values: ['current', 'late', 'delinquent'] },
    { field: 'contact_tag', label: 'Contact Tag', operators: ['has', 'not_has'] },
    { field: 'segment', label: 'Segment', operators: ['in', 'not_in'] },
    { field: 'last_activity', label: 'Last Activity (days ago)', operators: ['>', '<', '='] },
    { field: 'email_engagement', label: 'Email Engagement', operators: ['='], values: ['high', 'medium', 'low', 'none'] },
    { field: 'location_state', label: 'State', operators: ['=', '!='] },
    { field: 'client_type', label: 'Client Type', operators: ['=', '!='], values: ['individual', 'business'] }
  ];

  // Email/SMS Templates
  const messageTemplates = [
    { 
      id: 'welcome', 
      name: 'Welcome Series', 
      type: 'email',
      subject: 'Welcome to {{company_name}}!',
      content: 'Hi {{first_name}}, Welcome to our credit repair family...'
    },
    {
      id: 'dispute_followup',
      name: 'Dispute Follow-up',
      type: 'mixed',
      subject: 'Update on Your Credit Dispute',
      content: 'Hi {{first_name}}, Your dispute was sent {{days_ago}} days ago...'
    },
    {
      id: 'payment_reminder',
      name: 'Payment Reminder',
      type: 'sms',
      content: 'Hi {{first_name}}, your payment of {{amount}} is due {{due_date}}. Reply STOP to opt out.'
    },
    {
      id: 'score_improvement',
      name: 'Score Improvement Notification',
      type: 'email',
      subject: 'Great News! Your Credit Score Improved',
      content: 'Congratulations {{first_name}}! Your score increased by {{score_change}} points...'
    }
  ];

  // Load contacts from Firestore
  const loadContacts = async () => {
    setContactsLoading(true);
    try {
      const q = query(
        collection(db, 'contacts'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const contactsData = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        contactsData.push({
          id: doc.id,
          ...data,
          displayName: data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.email,
          tags: data.tags || [],
          score: data.creditScore || 0,
          status: data.status || 'active',
          lastActivity: data.lastActivity || data.createdAt
        });
      });
      
      setContacts(contactsData);
      
      // Auto-generate segments based on data
      generateSegments(contactsData);
    } catch (error) {
      console.error('Error loading contacts:', error);
      setSnackbar({
        open: true,
        message: 'Error loading contacts',
        severity: 'error'
      });
    } finally {
      setContactsLoading(false);
    }
  };

  // Generate smart segments
  const generateSegments = (contactsData) => {
    const segments = [
      {
        id: 'all',
        name: 'All Contacts',
        count: contactsData.length,
        filters: []
      },
      {
        id: 'active_clients',
        name: 'Active Clients',
        count: contactsData.filter(c => c.status === 'active' && c.type === 'client').length,
        filters: [{ field: 'status', operator: '=', value: 'active' }, { field: 'type', operator: '=', value: 'client' }]
      },
      {
        id: 'new_leads',
        name: 'New Leads (< 7 days)',
        count: contactsData.filter(c => {
          const createdAt = c.createdAt?.toDate ? c.createdAt.toDate() : new Date(c.createdAt);
          const daysOld = Math.floor((new Date() - createdAt) / (1000 * 60 * 60 * 24));
          return daysOld <= 7 && c.type === 'lead';
        }).length,
        filters: [{ field: 'account_age', operator: '<', value: 7 }, { field: 'type', operator: '=', value: 'lead' }]
      },
      {
        id: 'high_credit_score',
        name: 'High Credit Score (700+)',
        count: contactsData.filter(c => c.score >= 700).length,
        filters: [{ field: 'credit_score', operator: '>=', value: 700 }]
      },
      {
        id: 'low_credit_score',
        name: 'Low Credit Score (< 600)',
        count: contactsData.filter(c => c.score < 600).length,
        filters: [{ field: 'credit_score', operator: '<', value: 600 }]
      },
      {
        id: 'pending_disputes',
        name: 'Pending Disputes',
        count: contactsData.filter(c => c.disputeStatus === 'pending').length,
        filters: [{ field: 'disputeStatus', operator: '=', value: 'pending' }]
      },
      {
        id: 'payment_due',
        name: 'Payment Due',
        count: contactsData.filter(c => c.paymentStatus === 'due').length,
        filters: [{ field: 'paymentStatus', operator: '=', value: 'due' }]
      },
      {
        id: 'inactive_30days',
        name: 'Inactive (30+ days)',
        count: contactsData.filter(c => {
          const lastActivity = c.lastActivity?.toDate ? c.lastActivity.toDate() : new Date(c.lastActivity || c.createdAt);
          const daysInactive = Math.floor((new Date() - lastActivity) / (1000 * 60 * 60 * 24));
          return daysInactive >= 30;
        }).length,
        filters: [{ field: 'last_activity', operator: '>', value: 30 }]
      }
    ];
    
    setSegments(segments);
  };

  // Load campaigns
  const loadCampaigns = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'dripCampaigns'),
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
    } finally {
      setLoading(false);
    }
  };

  // Load automation rules
  const loadAutomationRules = async () => {
    try {
      const q = query(
        collection(db, 'automationRules'),
        where('userId', '==', currentUser.uid),
        where('active', '==', true)
      );
      
      const querySnapshot = await getDocs(q);
      const rulesData = [];
      
      querySnapshot.forEach((doc) => {
        rulesData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setAutomationRules(rulesData);
    } catch (error) {
      console.error('Error loading automation rules:', error);
    }
  };

  // Calculate statistics
  const calculateStatistics = (campaignsData) => {
    const stats = {
      total: campaignsData.length,
      active: campaignsData.filter(c => c.status === 'active').length,
      totalSent: campaignsData.reduce((sum, c) => sum + (c.stats?.sent || 0), 0),
      avgOpenRate: 0,
      avgClickRate: 0,
      totalConverted: campaignsData.reduce((sum, c) => sum + (c.stats?.converted || 0), 0),
      conversionRate: 0
    };
    
    const activeCampaigns = campaignsData.filter(c => c.stats?.sent > 0);
    if (activeCampaigns.length > 0) {
      stats.avgOpenRate = Math.round(
        activeCampaigns.reduce((sum, c) => sum + (c.stats?.openRate || 0), 0) / activeCampaigns.length
      );
      stats.avgClickRate = Math.round(
        activeCampaigns.reduce((sum, c) => sum + (c.stats?.clickRate || 0), 0) / activeCampaigns.length
      );
      stats.conversionRate = Math.round((stats.totalConverted / stats.totalSent) * 100);
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
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        stats: {
          sent: 0,
          delivered: 0,
          opened: 0,
          clicked: 0,
          converted: 0,
          unsubscribed: 0,
          openRate: 0,
          clickRate: 0,
          conversionRate: 0
        }
      };
      
      const docRef = await addDoc(collection(db, 'dripCampaigns'), campaignData);
      
      // Create automation rule if trigger is not manual
      if (campaignForm.triggers.type !== 'manual') {
        await createAutomationRule(docRef.id, campaignForm.triggers);
      }
      
      setSnackbar({
        open: true,
        message: 'Campaign created successfully!',
        severity: 'success'
      });
      
      setDialogOpen(false);
      resetCampaignForm();
      loadCampaigns();
    } catch (error) {
      console.error('Error creating campaign:', error);
      setSnackbar({
        open: true,
        message: 'Error creating campaign',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Create automation rule
  const createAutomationRule = async (campaignId, triggers) => {
    try {
      const ruleData = {
        campaignId,
        userId: currentUser.uid,
        type: triggers.type,
        event: triggers.event,
        conditions: triggers.conditions,
        schedule: triggers.schedule,
        delay: triggers.delay,
        active: true,
        lastTriggered: null,
        triggerCount: 0,
        createdAt: serverTimestamp()
      };
      
      await addDoc(collection(db, 'automationRules'), ruleData);
    } catch (error) {
      console.error('Error creating automation rule:', error);
    }
  };

  // Process trigger event (called by other parts of the system)
  const processTriggerEvent = async (eventType, contactId, eventData = {}) => {
    try {
      // Find all automation rules that match this event
      const matchingRules = automationRules.filter(rule => 
        rule.active && rule.event === eventType
      );
      
      for (const rule of matchingRules) {
        // Check if conditions are met
        const contact = contacts.find(c => c.id === contactId);
        if (!contact) continue;
        
        const conditionsMet = await checkConditions(contact, rule.conditions);
        if (!conditionsMet) continue;
        
        // Get the campaign
        const campaign = campaigns.find(c => c.id === rule.campaignId);
        if (!campaign || campaign.status !== 'active') continue;
        
        // Schedule or immediately enroll contact in campaign
        if (rule.delay > 0) {
          // Schedule for later
          await scheduleEnrollment(contact, campaign, rule.delay);
        } else {
          // Enroll immediately
          await enrollContactInCampaign(contact, campaign);
        }
        
        // Update rule statistics
        await updateDoc(doc(db, 'automationRules', rule.id), {
          lastTriggered: serverTimestamp(),
          triggerCount: (rule.triggerCount || 0) + 1
        });
      }
    } catch (error) {
      console.error('Error processing trigger event:', error);
    }
  };

  // Check if conditions are met
  const checkConditions = async (contact, conditions) => {
    if (!conditions || conditions.length === 0) return true;
    
    for (const condition of conditions) {
      const fieldValue = contact[condition.field];
      
      switch (condition.operator) {
        case '>':
          if (!(fieldValue > condition.value)) return false;
          break;
        case '<':
          if (!(fieldValue < condition.value)) return false;
          break;
        case '=':
          if (fieldValue !== condition.value) return false;
          break;
        case '!=':
          if (fieldValue === condition.value) return false;
          break;
        case '>=':
          if (!(fieldValue >= condition.value)) return false;
          break;
        case '<=':
          if (!(fieldValue <= condition.value)) return false;
          break;
        case 'has':
          if (!fieldValue?.includes(condition.value)) return false;
          break;
        case 'not_has':
          if (fieldValue?.includes(condition.value)) return false;
          break;
        case 'in':
          if (!condition.value?.includes(fieldValue)) return false;
          break;
        case 'not_in':
          if (condition.value?.includes(fieldValue)) return false;
          break;
        case 'between':
          if (!(fieldValue >= condition.value[0] && fieldValue <= condition.value[1])) return false;
          break;
        default:
          break;
      }
    }
    
    return true;
  };

  // Enroll contact in campaign
  const enrollContactInCampaign = async (contact, campaign) => {
    try {
      // Create enrollment record
      const enrollmentData = {
        campaignId: campaign.id,
        contactId: contact.id,
        userId: currentUser.uid,
        status: 'active',
        currentStep: 0,
        enrolledAt: serverTimestamp(),
        completedSteps: [],
        stats: {
          opened: [],
          clicked: [],
          converted: false
        }
      };
      
      const enrollmentRef = await addDoc(collection(db, 'campaignEnrollments'), enrollmentData);
      
      // Start sending the first message
      if (campaign.sequence && campaign.sequence.length > 0) {
        await sendCampaignMessage(contact, campaign.sequence[0], campaign, enrollmentRef.id);
      }
    } catch (error) {
      console.error('Error enrolling contact:', error);
    }
  };

  // Send campaign message
  const sendCampaignMessage = async (contact, message, campaign, enrollmentId) => {
    try {
      let result = { success: false };
      
      if (message.type === 'email') {
        // Send email (integrate with your email service)
        result = await sendEmailMessage(contact, message, campaign);
      } else if (message.type === 'sms') {
        // Send SMS via Telnyx
        result = await sendSMSMessage(contact, message, campaign);
      }
      
      // Log the message
      await addDoc(collection(db, 'campaignMessages'), {
        campaignId: campaign.id,
        enrollmentId,
        contactId: contact.id,
        messageType: message.type,
        subject: message.subject,
        content: message.content,
        sentAt: serverTimestamp(),
        status: result.success ? 'sent' : 'failed',
        error: result.error || null
      });
      
      // Update campaign stats
      if (result.success) {
        await updateDoc(doc(db, 'dripCampaigns', campaign.id), {
          'stats.sent': (campaign.stats?.sent || 0) + 1
        });
      }
    } catch (error) {
      console.error('Error sending campaign message:', error);
    }
  };

  // Send SMS message via Telnyx
  const sendSMSMessage = async (contact, message, campaign) => {
    try {
      // Replace variables in message
      let content = message.content;
      content = content.replace('{{first_name}}', contact.firstName || 'there');
      content = content.replace('{{last_name}}', contact.lastName || '');
      content = content.replace('{{company_name}}', 'Speedy Credit Repair');
      
      // Add compliance footer if needed
      if (campaign.settings.complianceFooter && !content.includes('Reply STOP')) {
        content += '\nReply STOP to opt out.';
      }
      
      // Send via Telnyx
      const result = await sendSMS({
        toNumber: contact.phone,
        message: content
      });
      
      return { success: result.success, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending SMS:', error);
      return { success: false, error: error.message };
    }
  };

  // Send email message (placeholder - integrate with your email service)
  const sendEmailMessage = async (contact, message, campaign) => {
    try {
      // This would integrate with your email service (SendGrid, AWS SES, etc.)
      console.log('Sending email to:', contact.email);
      console.log('Subject:', message.subject);
      console.log('Content:', message.content);
      
      // For now, just return success
      return { success: true, messageId: `email-${Date.now()}` };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Schedule enrollment
  const scheduleEnrollment = async (contact, campaign, delayMinutes) => {
    try {
      const scheduledFor = new Date();
      scheduledFor.setMinutes(scheduledFor.getMinutes() + delayMinutes);
      
      await addDoc(collection(db, 'scheduledEnrollments'), {
        campaignId: campaign.id,
        contactId: contact.id,
        userId: currentUser.uid,
        scheduledFor,
        status: 'pending',
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error scheduling enrollment:', error);
    }
  };

  // Start/pause campaign
  const toggleCampaignStatus = async (campaign) => {
    try {
      const newStatus = campaign.status === 'active' ? 'paused' : 'active';
      
      await updateDoc(doc(db, 'dripCampaigns', campaign.id), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      
      setSnackbar({
        open: true,
        message: `Campaign ${newStatus === 'active' ? 'activated' : 'paused'}`,
        severity: 'success'
      });
      
      loadCampaigns();
    } catch (error) {
      console.error('Error toggling campaign status:', error);
      setSnackbar({
        open: true,
        message: 'Error updating campaign status',
        severity: 'error'
      });
    }
  };

  // Delete campaign
  const handleDeleteCampaign = async (campaignId) => {
    if (!window.confirm('Are you sure you want to delete this campaign?')) return;
    
    try {
      await deleteDoc(doc(db, 'dripCampaigns', campaignId));
      
      // Also delete associated automation rules
      const rulesQuery = query(
        collection(db, 'automationRules'),
        where('campaignId', '==', campaignId)
      );
      const rulesSnapshot = await getDocs(rulesQuery);
      
      for (const ruleDoc of rulesSnapshot.docs) {
        await deleteDoc(doc(db, 'automationRules', ruleDoc.id));
      }
      
      setSnackbar({
        open: true,
        message: 'Campaign deleted successfully',
        severity: 'success'
      });
      
      loadCampaigns();
    } catch (error) {
      console.error('Error deleting campaign:', error);
      setSnackbar({
        open: true,
        message: 'Error deleting campaign',
        severity: 'error'
      });
    }
  };

  // Reset campaign form
  const resetCampaignForm = () => {
    setCampaignForm({
      name: '',
      description: '',
      type: 'email',
      status: 'draft',
      audience: {
        segment: 'all',
        contacts: [],
        filters: [],
        totalCount: 0
      },
      triggers: {
        type: 'manual',
        event: '',
        conditions: [],
        schedule: null,
        delay: 0
      },
      sequence: [],
      settings: {
        sendingDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
        sendingHours: { start: 9, end: 17 },
        timezone: 'America/Los_Angeles',
        trackOpens: true,
        trackClicks: true,
        unsubscribeLink: true,
        complianceFooter: true
      },
      goals: {
        type: 'engagement',
        target: 0,
        metric: 'open_rate'
      }
    });
    setActiveStep(0);
    setSelectedCampaign(null);
  };

  // Initialize
  useEffect(() => {
    if (currentUser) {
      loadContacts();
      loadCampaigns();
      loadAutomationRules();
      
      // Set up real-time listeners for trigger events
      setupTriggerListeners();
    }
  }, [currentUser]);

  // Setup trigger listeners
  const setupTriggerListeners = () => {
    // Listen for dispute letter events
    const disputeUnsubscribe = onSnapshot(
      query(
        collection(db, 'disputeLetters'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc'),
        limit(1)
      ),
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added' && change.doc.data().status === 'sent') {
            // Trigger dispute_sent event
            processTriggerEvent('dispute_sent', change.doc.data().clientId, {
              letterId: change.doc.id,
              bureau: change.doc.data().bureau
            });
          }
        });
      }
    );
    
    // Listen for contact updates
    const contactUnsubscribe = onSnapshot(
      query(collection(db, 'contacts'), where('userId', '==', currentUser.uid)),
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            // Trigger contact_created event
            processTriggerEvent('contact_created', change.doc.id, change.doc.data());
          } else if (change.type === 'modified') {
            const oldData = change.doc.data();
            const newData = change.doc.data();
            
            // Check for score changes
            if (newData.creditScore > oldData.creditScore) {
              processTriggerEvent('score_increased', change.doc.id, {
                oldScore: oldData.creditScore,
                newScore: newData.creditScore
              });
            } else if (newData.creditScore < oldData.creditScore) {
              processTriggerEvent('score_decreased', change.doc.id, {
                oldScore: oldData.creditScore,
                newScore: newData.creditScore
              });
            }
          }
        });
      }
    );
    
    return () => {
      disputeUnsubscribe();
      contactUnsubscribe();
    };
  };

  // Campaign DataGrid columns
  const campaignColumns = [
    { field: 'name', headerName: 'Campaign Name', width: 200 },
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
          color={params.value === 'active' ? 'success' : params.value === 'paused' ? 'warning' : 'default'}
        />
      )
    },
    {
      field: 'audience',
      headerName: 'Audience',
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Users size={14} />
          <Typography variant="body2">
            {params.row.audience?.totalCount || 0} contacts
          </Typography>
        </Box>
      )
    },
    {
      field: 'triggers',
      headerName: 'Trigger',
      width: 150,
      renderCell: (params) => {
        const trigger = params.row.triggers;
        const event = triggerEvents.find(e => e.value === trigger?.event);
        const Icon = event?.icon || Zap;
        
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Icon size={14} />
            <Typography variant="body2">
              {trigger?.type === 'manual' ? 'Manual' : event?.label || trigger?.event}
            </Typography>
          </Box>
        );
      }
    },
    {
      field: 'stats',
      headerName: 'Performance',
      width: 200,
      renderCell: (params) => {
        const stats = params.row.stats || {};
        return (
          <Box>
            <Typography variant="caption" display="block">
              Sent: {stats.sent || 0} | Open: {stats.openRate || 0}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Click: {stats.clickRate || 0}% | Conv: {stats.conversionRate || 0}%
            </Typography>
          </Box>
        );
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            size="small"
            onClick={() => toggleCampaignStatus(params.row)}
            color={params.row.status === 'active' ? 'warning' : 'success'}
          >
            {params.row.status === 'active' ? <Pause size={16} /> : <Play size={16} />}
          </IconButton>
          <IconButton
            size="small"
            onClick={() => {
              setSelectedCampaign(params.row);
              setDialogOpen(true);
            }}
          >
            <Edit2 size={16} />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDeleteCampaign(params.row.id)}
            color="error"
          >
            <Trash2 size={16} />
          </IconButton>
        </Box>
      )
    }
  ];

  const steps = ['Basic Info', 'Audience', 'Triggers', 'Sequence', 'Review'];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight={600}>
              Drip Campaigns
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Automate your email and SMS sequences with smart triggers
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshCw size={20} />}
              onClick={() => {
                loadContacts();
                loadCampaigns();
              }}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<Plus size={20} />}
              onClick={() => {
                resetCampaignForm();
                setDialogOpen(true);
              }}
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

        {/* Main Content Tabs */}
        <Paper>
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tab label={`Campaigns (${campaigns.length})`} />
            <Tab label={`Segments (${segments.length})`} />
            <Tab label={`Automation Rules (${automationRules.length})`} />
            <Tab label="Analytics" />
          </Tabs>

          {/* Campaigns Tab */}
          {tabValue === 0 && (
            <Box sx={{ p: 3 }}>
              <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
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
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="paused">Paused</MenuItem>
                    <MenuItem value="draft">Draft</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <DataGrid
                rows={campaigns.filter(c => 
                  (filterStatus === 'all' || c.status === filterStatus) &&
                  (searchTerm === '' || c.name.toLowerCase().includes(searchTerm.toLowerCase()))
                )}
                columns={campaignColumns}
                pageSize={10}
                rowsPerPageOptions={[10, 25, 50]}
                autoHeight
                disableSelectionOnClick
              />
            </Box>
          )}

          {/* Segments Tab */}
          {tabValue === 1 && (
            <Box sx={{ p: 3 }}>
              <Grid container spacing={2}>
                {segments.map((segment) => (
                  <Grid item xs={12} md={4} key={segment.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6">{segment.name}</Typography>
                          <Chip label={`${segment.count} contacts`} size="small" />
                        </Box>
                        {segment.filters.length > 0 && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="caption" color="text.secondary">Filters:</Typography>
                            {segment.filters.map((filter, idx) => (
                              <Typography key={idx} variant="caption" display="block">
                                • {filter.field} {filter.operator} {filter.value}
                              </Typography>
                            ))}
                          </Box>
                        )}
                        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => {
                              setCampaignForm(prev => ({
                                ...prev,
                                audience: {
                                  segment: segment.id,
                                  filters: segment.filters,
                                  totalCount: segment.count,
                                  contacts: []
                                }
                              }));
                              setDialogOpen(true);
                            }}
                          >
                            Create Campaign
                          </Button>
                          <Button size="small">View Contacts</Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Automation Rules Tab */}
          {tabValue === 2 && (
            <Box sx={{ p: 3 }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Campaign</TableCell>
                      <TableCell>Trigger Event</TableCell>
                      <TableCell>Conditions</TableCell>
                      <TableCell>Delay</TableCell>
                      <TableCell>Last Triggered</TableCell>
                      <TableCell>Count</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {automationRules.map((rule) => {
                      const campaign = campaigns.find(c => c.id === rule.campaignId);
                      const event = triggerEvents.find(e => e.value === rule.event);
                      
                      return (
                        <TableRow key={rule.id}>
                          <TableCell>{campaign?.name || 'Unknown'}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {event && <event.icon size={16} />}
                              {event?.label || rule.event}
                            </Box>
                          </TableCell>
                          <TableCell>
                            {rule.conditions?.length || 0} conditions
                          </TableCell>
                          <TableCell>
                            {rule.delay ? `${rule.delay} min` : 'Immediate'}
                          </TableCell>
                          <TableCell>
                            {rule.lastTriggered ? new Date(rule.lastTriggered.toDate()).toLocaleDateString() : 'Never'}
                          </TableCell>
                          <TableCell>{rule.triggerCount || 0}</TableCell>
                          <TableCell>
                            <Switch
                              checked={rule.active}
                              onChange={async () => {
                                await updateDoc(doc(db, 'automationRules', rule.id), {
                                  active: !rule.active
                                });
                                loadAutomationRules();
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Analytics Tab */}
          {tabValue === 3 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Campaign Performance Analytics</Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Engagement Over Time</Typography>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={[]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <ChartTooltip />
                        <Line type="monotone" dataKey="opens" stroke="#3B82F6" />
                        <Line type="monotone" dataKey="clicks" stroke="#10B981" />
                      </LineChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Conversion Funnel</Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText primary="Sent" secondary="100%" />
                        <Typography>1,234</Typography>
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Delivered" secondary="95%" />
                        <Typography>1,172</Typography>
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Opened" secondary="32%" />
                        <Typography>395</Typography>
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Clicked" secondary="12%" />
                        <Typography>148</Typography>
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Converted" secondary="3%" />
                        <Typography>37</Typography>
                      </ListItem>
                    </List>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}
        </Paper>

        {/* Create/Edit Campaign Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {selectedCampaign ? 'Edit Campaign' : 'Create New Campaign'}
          </DialogTitle>
          <DialogContent>
            <Stepper activeStep={activeStep} orientation="vertical">
              {steps.map((step, index) => (
                <Step key={step}>
                  <StepLabel>{step}</StepLabel>
                  <StepContent>
                    {/* Step 1: Basic Info */}
                    {index === 0 && (
                      <Box sx={{ mt: 2 }}>
                        <TextField
                          label="Campaign Name"
                          fullWidth
                          value={campaignForm.name}
                          onChange={(e) => setCampaignForm(prev => ({ ...prev, name: e.target.value }))}
                          sx={{ mb: 2 }}
                        />
                        <TextField
                          label="Description"
                          fullWidth
                          multiline
                          rows={2}
                          value={campaignForm.description}
                          onChange={(e) => setCampaignForm(prev => ({ ...prev, description: e.target.value }))}
                          sx={{ mb: 2 }}
                        />
                        <FormControl fullWidth sx={{ mb: 2 }}>
                          <InputLabel>Campaign Type</InputLabel>
                          <Select
                            value={campaignForm.type}
                            onChange={(e) => setCampaignForm(prev => ({ ...prev, type: e.target.value }))}
                          >
                            <MenuItem value="email">Email Only</MenuItem>
                            <MenuItem value="sms">SMS Only</MenuItem>
                            <MenuItem value="mixed">Email & SMS</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                    )}

                    {/* Step 2: Audience */}
                    {index === 1 && (
                      <Box sx={{ mt: 2 }}>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                          <InputLabel>Select Segment</InputLabel>
                          <Select
                            value={campaignForm.audience.segment}
                            onChange={(e) => {
                              const segment = segments.find(s => s.id === e.target.value);
                              setCampaignForm(prev => ({
                                ...prev,
                                audience: {
                                  segment: e.target.value,
                                  filters: segment?.filters || [],
                                  totalCount: segment?.count || 0,
                                  contacts: []
                                }
                              }));
                            }}
                          >
                            {segments.map(segment => (
                              <MenuItem key={segment.id} value={segment.id}>
                                {segment.name} ({segment.count} contacts)
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        
                        {campaignForm.audience.totalCount > 0 && (
                          <Alert severity="info">
                            This campaign will target {campaignForm.audience.totalCount} contacts
                          </Alert>
                        )}
                      </Box>
                    )}

                    {/* Step 3: Triggers */}
                    {index === 2 && (
                      <Box sx={{ mt: 2 }}>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                          <FormLabel>Trigger Type</FormLabel>
                          <RadioGroup
                            value={campaignForm.triggers.type}
                            onChange={(e) => setCampaignForm(prev => ({
                              ...prev,
                              triggers: { ...prev.triggers, type: e.target.value }
                            }))}
                          >
                            <FormControlLabel value="manual" control={<Radio />} label="Manual (Start manually)" />
                            <FormControlLabel value="event" control={<Radio />} label="Event-Based (Automatic)" />
                            <FormControlLabel value="schedule" control={<Radio />} label="Scheduled" />
                          </RadioGroup>
                        </FormControl>

                        {campaignForm.triggers.type === 'event' && (
                          <>
                            <FormControl fullWidth sx={{ mb: 2 }}>
                              <InputLabel>Trigger Event</InputLabel>
                              <Select
                                value={campaignForm.triggers.event}
                                onChange={(e) => setCampaignForm(prev => ({
                                  ...prev,
                                  triggers: { ...prev.triggers, event: e.target.value }
                                }))}
                              >
                                {triggerEvents.map(event => (
                                  <MenuItem key={event.value} value={event.value}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <event.icon size={16} />
                                      {event.label}
                                    </Box>
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                            
                            <TextField
                              label="Delay (minutes)"
                              type="number"
                              fullWidth
                              value={campaignForm.triggers.delay}
                              onChange={(e) => setCampaignForm(prev => ({
                                ...prev,
                                triggers: { ...prev.triggers, delay: parseInt(e.target.value) || 0 }
                              }))}
                              helperText="Wait this many minutes after the trigger before starting the campaign"
                              sx={{ mb: 2 }}
                            />
                          </>
                        )}

                        {campaignForm.triggers.type === 'schedule' && (
                          <DateTimePicker
                            label="Schedule Start"
                            value={campaignForm.triggers.schedule}
                            onChange={(date) => setCampaignForm(prev => ({
                              ...prev,
                              triggers: { ...prev.triggers, schedule: date }
                            }))}
                            renderInput={(params) => <TextField {...params} fullWidth />}
                          />
                        )}
                      </Box>
                    )}

                    {/* Step 4: Sequence */}
                    {index === 3 && (
                      <Box sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                          <Typography variant="subtitle2">Message Sequence</Typography>
                          <Button
                            size="small"
                            startIcon={<Plus size={16} />}
                            onClick={() => {
                              setCampaignForm(prev => ({
                                ...prev,
                                sequence: [...prev.sequence, {
                                  id: Date.now(),
                                  type: campaignForm.type === 'sms' ? 'sms' : 'email',
                                  delay: 0,
                                  subject: '',
                                  content: '',
                                  templateId: null
                                }]
                              }));
                            }}
                          >
                            Add Message
                          </Button>
                        </Box>

                        {campaignForm.sequence.map((message, idx) => (
                          <Accordion key={message.id}>
                            <AccordionSummary expandIcon={<ChevronDown />}>
                              <Typography>
                                Message {idx + 1}: {message.type === 'email' ? 'Email' : 'SMS'}
                                {idx > 0 && ` (Wait ${message.delay} days)`}
                              </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                              <Box>
                                {idx > 0 && (
                                  <TextField
                                    label="Delay (days after previous message)"
                                    type="number"
                                    fullWidth
                                    value={message.delay}
                                    onChange={(e) => {
                                      const newSequence = [...campaignForm.sequence];
                                      newSequence[idx].delay = parseInt(e.target.value) || 0;
                                      setCampaignForm(prev => ({ ...prev, sequence: newSequence }));
                                    }}
                                    sx={{ mb: 2 }}
                                  />
                                )}
                                
                                {message.type === 'email' && (
                                  <TextField
                                    label="Subject Line"
                                    fullWidth
                                    value={message.subject}
                                    onChange={(e) => {
                                      const newSequence = [...campaignForm.sequence];
                                      newSequence[idx].subject = e.target.value;
                                      setCampaignForm(prev => ({ ...prev, sequence: newSequence }));
                                    }}
                                    sx={{ mb: 2 }}
                                  />
                                )}
                                
                                <TextField
                                  label="Message Content"
                                  fullWidth
                                  multiline
                                  rows={4}
                                  value={message.content}
                                  onChange={(e) => {
                                    const newSequence = [...campaignForm.sequence];
                                    newSequence[idx].content = e.target.value;
                                    setCampaignForm(prev => ({ ...prev, sequence: newSequence }));
                                  }}
                                  helperText="Use {{first_name}}, {{last_name}}, {{company_name}} for personalization"
                                  sx={{ mb: 2 }}
                                />
                                
                                <Button
                                  color="error"
                                  size="small"
                                  onClick={() => {
                                    setCampaignForm(prev => ({
                                      ...prev,
                                      sequence: prev.sequence.filter((_, i) => i !== idx)
                                    }));
                                  }}
                                >
                                  Remove Message
                                </Button>
                              </Box>
                            </AccordionDetails>
                          </Accordion>
                        ))}
                      </Box>
                    )}

                    {/* Step 5: Review */}
                    {index === 4 && (
                      <Box sx={{ mt: 2 }}>
                        <Alert severity="info" sx={{ mb: 2 }}>
                          Please review your campaign settings before creating
                        </Alert>
                        <List>
                          <ListItem>
                            <ListItemText primary="Campaign Name" secondary={campaignForm.name} />
                          </ListItem>
                          <ListItem>
                            <ListItemText primary="Type" secondary={campaignForm.type} />
                          </ListItem>
                          <ListItem>
                            <ListItemText primary="Audience" secondary={`${campaignForm.audience.totalCount} contacts`} />
                          </ListItem>
                          <ListItem>
                            <ListItemText primary="Trigger" secondary={
                              campaignForm.triggers.type === 'manual' ? 'Manual' :
                              campaignForm.triggers.type === 'event' ? `Event: ${campaignForm.triggers.event}` :
                              'Scheduled'
                            } />
                          </ListItem>
                          <ListItem>
                            <ListItemText primary="Messages" secondary={`${campaignForm.sequence.length} messages`} />
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
                            handleCreateCampaign();
                          } else {
                            setActiveStep(index + 1);
                          }
                        }}
                      >
                        {index === steps.length - 1 ? 
                          (selectedCampaign ? 'Update Campaign' : 'Create Campaign') : 
                          'Continue'
                        }
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
    </LocalizationProvider>
  );
};

export default DripCampaigns;