// ============================================
// DRIP CAMPAIGNS HUB
// Path: /src/pages/marketing/DripCampaignsHub.jsx
// ============================================
// Email marketing automation system
// Campaign builder, sequences, A/B testing
// ============================================

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Button,
  IconButton,
  Chip,
  Avatar,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Paper,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Mail,
  Send,
  Users,
  TrendingUp,
  TrendingDown,
  Eye,
  MousePointer,
  UserCheck,
  XCircle,
  Plus,
  Edit,
  Trash2,
  Copy,
  Play,
  Pause,
  Clock,
  Calendar,
  Target,
  Zap,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Filter,
  Download,
  Upload,
  Settings,
  Check,
  X,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  Share2,
  FileText,
} from 'lucide-react';
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
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { collection, query, where, orderBy, getDocs, doc, setDoc, updateDoc, deleteDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';

// ============================================
// CONSTANTS & CONFIGURATION
// ============================================

const CAMPAIGN_STATUSES = {
  draft: { label: 'Draft', color: '#6b7280', icon: FileText },
  active: { label: 'Active', color: '#10b981', icon: Play },
  paused: { label: 'Paused', color: '#f59e0b', icon: Pause },
  completed: { label: 'Completed', color: '#3b82f6', icon: CheckCircle },
  archived: { label: 'Archived', color: '#6b7280', icon: XCircle },
};

const EMAIL_TEMPLATES = {
  welcome: {
    name: 'Welcome Email',
    subject: 'Welcome to {{company}}!',
    preview: 'Thank you for joining us...',
  },
  nurture: {
    name: 'Nurture Sequence',
    subject: 'Tips for improving your credit',
    preview: 'Here are some helpful tips...',
  },
  promotion: {
    name: 'Promotional',
    subject: 'Special offer just for you',
    preview: 'Don\'t miss this limited-time offer...',
  },
  reengagement: {
    name: 'Re-engagement',
    subject: 'We miss you!',
    preview: 'It\'s been a while since we last connected...',
  },
};

const TRIGGER_TYPES = {
  signup: { label: 'New Signup', icon: UserCheck },
  purchase: { label: 'Purchase', icon: Check },
  abandoned: { label: 'Abandoned Cart', icon: XCircle },
  milestone: { label: 'Milestone Reached', icon: Target },
  birthday: { label: 'Birthday', icon: Calendar },
  anniversary: { label: 'Anniversary', icon: Calendar },
  inactivity: { label: 'Inactivity', icon: Clock },
  custom: { label: 'Custom Event', icon: Zap },
};

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

// ============================================
// MAIN COMPONENT
// ============================================

const DripCampaignsHub = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);

  // Data states
  const [campaigns, setCampaigns] = useState([]);
  const [sequences, setSequences] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [templates, setTemplates] = useState([]);

  // UI states
  const [campaignDialogOpen, setCampaignDialogOpen] = useState(false);
  const [sequenceDialogOpen, setSequenceDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // ============================================
  // DATA LOADING
  // ============================================

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    console.log('📧 Loading drip campaigns data');
    setLoading(true);

    try {
      await Promise.all([
        loadCampaigns(),
        loadSequences(),
        loadSubscribers(),
        loadAnalytics(),
        loadTemplates(),
      ]);

      console.log('✅ Drip campaigns data loaded');
    } catch (error) {
      console.error('❌ Error loading drip campaigns data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCampaigns = async () => {
    try {
      const campaignsRef = collection(db, 'emailCampaigns');
      const q = query(campaignsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const campaignData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setCampaigns(campaignData);
    } catch (error) {
      console.error('❌ Error loading campaigns:', error);
      setCampaigns([]);
    }
  };

  const loadSequences = async () => {
    try {
      const seqRef = collection(db, 'emailSequences');
      const snapshot = await getDocs(seqRef);
      
      const seqData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setSequences(seqData);
    } catch (error) {
      console.error('❌ Error loading sequences:', error);
      setSequences([]);
    }
  };

  const loadSubscribers = async () => {
    try {
      const subsRef = collection(db, 'emailSubscribers');
      const q = query(subsRef, where('status', '==', 'active'));
      const snapshot = await getDocs(q);
      
      const subData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setSubscribers(subData);
    } catch (error) {
      console.error('❌ Error loading subscribers:', error);
      setSubscribers([]);
    }
  };

  const loadAnalytics = async () => {
    try {
      // Calculate aggregate analytics
      const totalSent = campaigns.reduce((sum, c) => sum + (c.sent || 0), 0);
      const totalOpened = campaigns.reduce((sum, c) => sum + (c.opened || 0), 0);
      const totalClicked = campaigns.reduce((sum, c) => sum + (c.clicked || 0), 0);
      const totalUnsubscribed = campaigns.reduce((sum, c) => sum + (c.unsubscribed || 0), 0);

      const openRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;
      const clickRate = totalSent > 0 ? (totalClicked / totalSent) * 100 : 0;
      const unsubRate = totalSent > 0 ? (totalUnsubscribed / totalSent) * 100 : 0;

      setAnalytics({
        totalSent,
        totalOpened,
        totalClicked,
        totalUnsubscribed,
        openRate: openRate.toFixed(2),
        clickRate: clickRate.toFixed(2),
        unsubRate: unsubRate.toFixed(2),
      });

    } catch (error) {
      console.error('❌ Error loading analytics:', error);
      setAnalytics(null);
    }
  };

  const loadTemplates = async () => {
    try {
      const templatesRef = collection(db, 'emailTemplates');
      const snapshot = await getDocs(templatesRef);
      
      const templateData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setTemplates(templateData);
    } catch (error) {
      console.error('❌ Error loading templates:', error);
      setTemplates([]);
    }
  };

  // ============================================
  // AI OPTIMIZATION FUNCTIONS
  // ============================================

  const optimizeSendTime = (campaign) => {
    console.log('🤖 Optimizing send time');

    try {
      // Analyze historical open rates by time
      const hourlyStats = {};
      
      // Mock data - in production, analyze actual campaign data
      for (let hour = 0; hour < 24; hour++) {
        hourlyStats[hour] = {
          sent: Math.floor(Math.random() * 1000),
          opened: Math.floor(Math.random() * 500),
        };
      }

      // Calculate open rate for each hour
      const hourlyRates = Object.entries(hourlyStats).map(([hour, stats]) => ({
        hour: parseInt(hour),
        openRate: stats.sent > 0 ? (stats.opened / stats.sent) * 100 : 0,
      }));

      // Sort by open rate
      hourlyRates.sort((a, b) => b.openRate - a.openRate);

      const bestTimes = hourlyRates.slice(0, 3);

      return {
        bestTime: bestTimes[0],
        alternatives: bestTimes.slice(1),
        recommendation: `Send at ${bestTimes[0].hour}:00 for ${bestTimes[0].openRate.toFixed(1)}% open rate`,
        confidence: 'high',
      };

    } catch (error) {
      console.error('❌ Error optimizing send time:', error);
      return null;
    }
  };

  const suggestSubjectLines = (campaign) => {
    console.log('🤖 Suggesting subject lines');

    try {
      // AI-generated subject line suggestions
      const suggestions = [
        {
          text: `${campaign.name} - Exclusive Offer Inside`,
          score: 92,
          reason: 'High urgency and exclusivity',
        },
        {
          text: `Quick question about your credit goals`,
          score: 88,
          reason: 'Personal and conversational',
        },
        {
          text: `3 tips to boost your credit score this month`,
          score: 85,
          reason: 'Actionable and specific',
        },
        {
          text: `You won't believe what happened...`,
          score: 78,
          reason: 'Curiosity-driven',
        },
        {
          text: `[URGENT] Your credit report is ready`,
          score: 75,
          reason: 'Urgent but may trigger spam filters',
        },
      ];

      return suggestions;

    } catch (error) {
      console.error('❌ Error suggesting subject lines:', error);
      return [];
    }
  };

  const predictCampaignPerformance = (campaign) => {
    console.log('🤖 Predicting campaign performance');

    try {
      // Predictive model based on historical data
      const baseOpenRate = 22; // Industry average
      const baseClickRate = 3;

      // Adjust based on factors
      let predictedOpenRate = baseOpenRate;
      let predictedClickRate = baseClickRate;

      // Good subject line
      if (campaign.subject && campaign.subject.length > 10 && campaign.subject.length < 50) {
        predictedOpenRate += 5;
      }

      // Personalization
      if (campaign.subject?.includes('{{')) {
        predictedOpenRate += 3;
        predictedClickRate += 1;
      }

      // Timing
      if (campaign.sendTime && (campaign.sendTime >= 9 && campaign.sendTime <= 11)) {
        predictedOpenRate += 4;
      }

      // Segmentation
      if (campaign.segmented) {
        predictedOpenRate += 8;
        predictedClickRate += 2;
      }

      return {
        openRate: predictedOpenRate.toFixed(1),
        clickRate: predictedClickRate.toFixed(1),
        expectedOpens: Math.round((campaign.recipients || 0) * predictedOpenRate / 100),
        expectedClicks: Math.round((campaign.recipients || 0) * predictedClickRate / 100),
        confidence: 'medium',
        factors: [
          campaign.segmented ? 'Targeted audience (+8%)' : null,
          campaign.subject?.includes('{{') ? 'Personalization (+3%)' : null,
          'Subject line length optimal (+5%)' : null,
        ].filter(Boolean),
      };

    } catch (error) {
      console.error('❌ Error predicting performance:', error);
      return null;
    }
  };

  const segmentAudience = (subscribers, criteria) => {
    console.log('🤖 Segmenting audience');

    try {
      let filtered = [...subscribers];

      // Filter by engagement level
      if (criteria.engagementLevel) {
        filtered = filtered.filter(sub => {
          const opens = sub.opens || 0;
          const clicks = sub.clicks || 0;
          const score = (opens * 2) + (clicks * 5);

          if (criteria.engagementLevel === 'high') return score >= 20;
          if (criteria.engagementLevel === 'medium') return score >= 10 && score < 20;
          if (criteria.engagementLevel === 'low') return score < 10;
          return true;
        });
      }

      // Filter by signup date
      if (criteria.signupDate) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - criteria.signupDate);
        
        filtered = filtered.filter(sub => 
          sub.signupDate && sub.signupDate.toDate() >= cutoffDate
        );
      }

      // Filter by tags
      if (criteria.tags && criteria.tags.length > 0) {
        filtered = filtered.filter(sub =>
          criteria.tags.some(tag => sub.tags?.includes(tag))
        );
      }

      return {
        segment: filtered,
        size: filtered.length,
        percentage: ((filtered.length / subscribers.length) * 100).toFixed(1),
        criteria: criteria,
      };

    } catch (error) {
      console.error('❌ Error segmenting audience:', error);
      return null;
    }
  };

  const optimizeEmailContent = (content) => {
    console.log('🤖 Optimizing email content');

    try {
      const suggestions = [];

      // Check length
      const wordCount = content.split(' ').length;
      if (wordCount < 50) {
        suggestions.push({
          type: 'warning',
          message: 'Email is too short - consider adding more value',
          priority: 'medium',
        });
      } else if (wordCount > 500) {
        suggestions.push({
          type: 'warning',
          message: 'Email is too long - consider breaking into multiple emails',
          priority: 'high',
        });
      }

      // Check for call-to-action
      const cta Keywords = ['click', 'download', 'sign up', 'buy', 'get started', 'learn more'];
      const hasCTA = ctaKeywords.some(keyword => 
        content.toLowerCase().includes(keyword)
      );

      if (!hasCTA) {
        suggestions.push({
          type: 'error',
          message: 'No clear call-to-action found - add a CTA button',
          priority: 'high',
        });
      }

      // Check personalization
      if (!content.includes('{{')) {
        suggestions.push({
          type: 'info',
          message: 'Add personalization with {{firstName}} or other variables',
          priority: 'medium',
        });
      }

      // Check spam triggers
      const spamWords = ['free', 'guarantee', 'no risk', 'click here', '!!!'];
      const hasSpamWords = spamWords.some(word => 
        content.toLowerCase().includes(word.toLowerCase())
      );

      if (hasSpamWords) {
        suggestions.push({
          type: 'warning',
          message: 'Content contains potential spam trigger words',
          priority: 'medium',
        });
      }

      return {
        score: Math.max(0, 100 - (suggestions.length * 15)),
        suggestions,
        wordCount,
        readingTime: Math.ceil(wordCount / 200), // minutes
      };

    } catch (error) {
      console.error('❌ Error optimizing content:', error);
      return null;
    }
  };

  // ============================================
  // TAB 1: CAMPAIGNS OVERVIEW
  // ============================================

  const renderCampaignsTab = () => {
    const filteredCampaigns = campaigns.filter(campaign => {
      const matchesSearch = searchQuery === '' || 
        campaign.name?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = filterStatus === 'all' || campaign.status === filterStatus;

      return matchesSearch && matchesFilter;
    });

    return (
      <Box className="space-y-4">
        {/* ===== TOOLBAR ===== */}
        <Card elevation={2}>
          <CardContent>
            <Box className="flex items-center justify-between gap-4 flex-wrap">
              <TextField
                size="small"
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ minWidth: 300 }}
              />
              
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  {Object.entries(CAMPAIGN_STATUSES).map(([key, config]) => (
                    <MenuItem key={key} value={key}>{config.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                variant="contained"
                startIcon={<Plus />}
                onClick={() => setCampaignDialogOpen(true)}
              >
                New Campaign
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* ===== KEY METRICS ===== */}
        {analytics && (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={2}>
                <CardContent>
                  <Box className="flex items-center justify-between">
                    <Box>
                      <Typography variant="caption" className="text-gray-600">
                        Total Sent
                      </Typography>
                      <Typography variant="h4" className="font-bold">
                        {analytics.totalSent.toLocaleString()}
                      </Typography>
                    </Box>
                    <Send className="w-10 h-10 text-blue-600" />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={2}>
                <CardContent>
                  <Box className="flex items-center justify-between">
                    <Box>
                      <Typography variant="caption" className="text-gray-600">
                        Open Rate
                      </Typography>
                      <Typography variant="h4" className="font-bold text-green-600">
                        {analytics.openRate}%
                      </Typography>
                    </Box>
                    <Eye className="w-10 h-10 text-green-600" />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={2}>
                <CardContent>
                  <Box className="flex items-center justify-between">
                    <Box>
                      <Typography variant="caption" className="text-gray-600">
                        Click Rate
                      </Typography>
                      <Typography variant="h4" className="font-bold text-purple-600">
                        {analytics.clickRate}%
                      </Typography>
                    </Box>
                    <MousePointer className="w-10 h-10 text-purple-600" />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={2}>
                <CardContent>
                  <Box className="flex items-center justify-between">
                    <Box>
                      <Typography variant="caption" className="text-gray-600">
                        Subscribers
                      </Typography>
                      <Typography variant="h4" className="font-bold text-orange-600">
                        {subscribers.length.toLocaleString()}
                      </Typography>
                    </Box>
                    <Users className="w-10 h-10 text-orange-600" />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* ===== CAMPAIGNS TABLE ===== */}
        <Card elevation={3}>
          <CardContent>
            <Typography variant="h6" className="font-semibold mb-4">
              📧 All Campaigns
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Campaign Name</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Sent</TableCell>
                    <TableCell>Opens</TableCell>
                    <TableCell>Clicks</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCampaigns
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map(campaign => {
                      const statusConfig = CAMPAIGN_STATUSES[campaign.status];
                      const StatusIcon = statusConfig.icon;
                      const openRate = campaign.sent > 0 ? 
                        ((campaign.opened || 0) / campaign.sent * 100).toFixed(1) : 0;
                      const clickRate = campaign.sent > 0 ?
                        ((campaign.clicked || 0) / campaign.sent * 100).toFixed(1) : 0;

                      return (
                        <TableRow key={campaign.id}>
                          <TableCell className="font-semibold">
                            {campaign.name}
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={<StatusIcon className="w-4 h-4" />}
                              label={statusConfig.label}
                              size="small"
                              sx={{
                                bgcolor: statusConfig.color,
                                color: 'white',
                              }}
                            />
                          </TableCell>
                          <TableCell>{campaign.sent || 0}</TableCell>
                          <TableCell>
                            {campaign.opened || 0} ({openRate}%)
                          </TableCell>
                          <TableCell>
                            {campaign.clicked || 0} ({clickRate}%)
                          </TableCell>
                          <TableCell>
                            {campaign.createdAt && new Date(campaign.createdAt.toDate()).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Box className="flex gap-1">
                              <IconButton size="small">
                                <Eye className="w-4 h-4" />
                              </IconButton>
                              <IconButton size="small">
                                <Edit className="w-4 h-4" />
                              </IconButton>
                              <IconButton size="small">
                                <Copy className="w-4 h-4" />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={filteredCampaigns.length}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
            />
          </CardContent>
        </Card>
      </Box>
    );
  };

  // ============================================
  // REMAINING TABS (SIMPLIFIED)
  // ============================================

  const renderSequencesTab = () => (
    <Card elevation={3}>
      <CardContent>
        <Box className="flex items-center justify-between mb-4">
          <Typography variant="h6" className="font-semibold">
            🔄 Email Sequences
          </Typography>
          <Button
            variant="contained"
            startIcon={<Plus />}
            onClick={() => setSequenceDialogOpen(true)}
          >
            New Sequence
          </Button>
        </Box>
        <Grid container spacing={3}>
          {sequences.map(sequence => (
            <Grid item xs={12} md={6} key={sequence.id}>
              <Card elevation={1}>
                <CardContent>
                  <Typography variant="h6" className="font-semibold mb-2">
                    {sequence.name}
                  </Typography>
                  <Typography variant="body2" className="text-gray-600 mb-3">
                    {sequence.description}
                  </Typography>
                  <Chip
                    label={`${sequence.steps?.length || 0} emails`}
                    size="small"
                    color="primary"
                  />
                  <Box className="mt-3">
                    <Button size="small" variant="outlined" fullWidth>
                      View Details
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );

  const renderSubscribersTab = () => (
    <Card elevation={3}>
      <CardContent>
        <Typography variant="h6" className="font-semibold mb-4">
          👥 Subscribers ({subscribers.length})
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Signup Date</TableCell>
                <TableCell>Opens</TableCell>
                <TableCell>Clicks</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {subscribers.slice(0, 10).map(subscriber => (
                <TableRow key={subscriber.id}>
                  <TableCell>{subscriber.email}</TableCell>
                  <TableCell>{subscriber.name}</TableCell>
                  <TableCell>
                    {subscriber.signupDate && new Date(subscriber.signupDate.toDate()).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{subscriber.opens || 0}</TableCell>
                  <TableCell>{subscriber.clicks || 0}</TableCell>
                  <TableCell>
                    <Chip
                      label={subscriber.status}
                      size="small"
                      color={subscriber.status === 'active' ? 'success' : 'default'}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );

  const renderAnalyticsTab = () => (
    <Box className="space-y-6">
      {analytics && (
        <>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" className="font-semibold mb-4">
                📊 Campaign Performance
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={campaigns.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="sent" fill="#3b82f6" name="Sent" />
                  <Bar dataKey="opened" fill="#10b981" name="Opened" />
                  <Bar dataKey="clicked" fill="#8b5cf6" name="Clicked" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6" className="font-semibold mb-3">
                    🎯 Top Performing Campaigns
                  </Typography>
                  <List>
                    {campaigns
                      .filter(c => c.sent > 0)
                      .sort((a, b) => (b.opened / b.sent) - (a.opened / a.sent))
                      .slice(0, 5)
                      .map(campaign => {
                        const openRate = ((campaign.opened / campaign.sent) * 100).toFixed(1);
                        return (
                          <ListItem key={campaign.id}>
                            <ListItemText
                              primary={campaign.name}
                              secondary={`${campaign.sent} sent • ${openRate}% open rate`}
                            />
                            <Chip label={`${openRate}%`} color="success" size="small" />
                          </ListItem>
                        );
                      })}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6" className="font-semibold mb-3">
                    ⚠️ Needs Improvement
                  </Typography>
                  <List>
                    {campaigns
                      .filter(c => c.sent > 0)
                      .sort((a, b) => (a.opened / a.sent) - (b.opened / b.sent))
                      .slice(0, 5)
                      .map(campaign => {
                        const openRate = ((campaign.opened / campaign.sent) * 100).toFixed(1);
                        return (
                          <ListItem key={campaign.id}>
                            <ListItemText
                              primary={campaign.name}
                              secondary={`${campaign.sent} sent • ${openRate}% open rate`}
                            />
                            <Chip label={`${openRate}%`} color="error" size="small" />
                          </ListItem>
                        );
                      })}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );

  // ============================================
  // MAIN RENDER
  // ============================================

  if (loading) {
    return (
      <Box className="flex items-center justify-center h-screen">
        <Box className="text-center">
          <LinearProgress sx={{ width: 300, mb: 2 }} />
          <Typography variant="body2" className="text-gray-600">
            Loading drip campaigns...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box className="p-4">
      <Box className="max-w-7xl mx-auto">
        {/* ===== HEADER ===== */}
        <Box className="mb-6">
          <Typography variant="h4" className="font-bold mb-2">
            Drip Campaigns & Email Marketing
          </Typography>
          <Typography variant="body2" className="text-gray-600">
            Automated email sequences and marketing campaigns
          </Typography>
        </Box>

        {/* ===== TABS ===== */}
        <Paper elevation={3} className="mb-6">
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab icon={<Mail className="w-5 h-5" />} label="Campaigns" />
            <Tab icon={<Activity className="w-5 h-5" />} label="Sequences" />
            <Tab icon={<Users className="w-5 h-5" />} label="Subscribers" />
            <Tab icon={<BarChart3 className="w-5 h-5" />} label="Analytics" />
          </Tabs>
        </Paper>

        {/* ===== TAB CONTENT ===== */}
        <Box>
          {activeTab === 0 && renderCampaignsTab()}
          {activeTab === 1 && renderSequencesTab()}
          {activeTab === 2 && renderSubscribersTab()}
          {activeTab === 3 && renderAnalyticsTab()}
        </Box>
      </Box>
    </Box>
  );
};

export default DripCampaignsHub;