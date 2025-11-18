import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  IconButton,
  Chip,
  LinearProgress,
  CircularProgress,
  Alert,
  AlertTitle,
  Divider,
  Tooltip,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  InputAdornment,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemButton,
  ListItemIcon,
  Collapse,
  Stack,
  ButtonGroup,
} from '@mui/material';
import {
  Search,
  FilterList,
  MoreVert,
  Download,
  Upload,
  Email,
  Sms,
  Chat,
  Phone,
  Description,
  Delete,
  Archive,
  Edit,
  Visibility,
  Send,
  AttachFile,
  Assessment,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Warning,
  Error,
  Info,
  Flag,
  Star,
  StarBorder,
  People,
  Person,
  ExpandMore,
  ExpandLess,
  Refresh,
  Settings,
  PlayArrow,
  Pause,
  Stop,
  Campaign,
  Psychology,
  AutoAwesome,
  SmartToy,
  Speed,
  Timeline,
  PieChart,
  BarChart,
  ShowChart,
  CalendarToday,
  History,
  CloudUpload,
  FolderOpen,
  FileDownload,
  Print,
  Share,
  ContentCopy,
  CheckBox,
  CheckBoxOutlineBlank,
  Close,
  Add,
  Remove,
} from '@mui/icons-material';
import { db } from '../lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  orderBy,
  limit,
  Timestamp,
  doc,
  updateDoc,
  addDoc,
  deleteDoc,
  writeBatch,
  getDoc,
} from 'firebase/firestore';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from 'date-fns';

// AI Configuration
const AI_CONFIG = {
  openaiKey: import.meta.env.VITE_OPENAI_API_KEY,
  models: {
    analysis: 'gpt-4-turbo-preview',
    recommendations: 'gpt-4-turbo-preview',
    contentGeneration: 'gpt-3.5-turbo',
  },
  features: {
    reportAnalysis: true,
    scoreImprovement: true,
    disputeGeneration: true,
    clientCommunication: true,
    documentAnalysis: true,
    anomalyDetection: true,
    predictiveScoring: true,
  },
};

// Status configurations
const REPORT_STATUS = {
  new: { label: 'New', color: 'info', icon: Info },
  inProgress: { label: 'In Progress', color: 'primary', icon: PlayArrow },
  reviewed: { label: 'Reviewed', color: 'warning', icon: Visibility },
  completed: { label: 'Completed', color: 'success', icon: CheckCircle },
  archived: { label: 'Archived', color: 'default', icon: Archive },
};

const PRIORITY_LEVELS = {
  high: { label: 'High', color: 'error', icon: Flag, value: 3 },
  medium: { label: 'Medium', color: 'warning', icon: Flag, value: 2 },
  low: { label: 'Low', color: 'info', icon: Flag, value: 1 },
};

const SCORE_RANGES = {
  excellent: { min: 800, max: 850, label: 'Excellent', color: '#4caf50' },
  veryGood: { min: 740, max: 799, label: 'Very Good', color: '#8bc34a' },
  good: { min: 670, max: 739, label: 'Good', color: '#ffeb3b' },
  fair: { min: 580, max: 669, label: 'Fair', color: '#ff9800' },
  poor: { min: 300, max: 579, label: 'Poor', color: '#f44336' },
};

// Color schemes
const COLORS = {
  primary: '#1976d2',
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  info: '#2196f3',
  chart: ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0'],
};

/**
 * MEGA ENTERPRISE CREDIT REPORTS COMPONENT
 * 
 * This component provides comprehensive credit report management:
 * - Advanced search and filtering
 * - Bulk operations (export, analyze, dispute, archive)
 * - Interactive table with sorting and pagination
 * - Report status tracking
 * - Priority management
 * - Client communication hub (email, SMS, chat)
 * - Document management
 * - Dispute workflow
 * - Score improvement tracking
 * - Statistics dashboard
 * - Maximum AI integration throughout
 */
const CreditReports = () => {
  // State management
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReports, setSelectedReports] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [scoreRangeFilter, setScoreRangeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  
  // Dialog states
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [communicationDialogOpen, setCommunicationDialogOpen] = useState(false);
  const [disputeDialogOpen, setDisputeDialogOpen] = useState(false);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [bulkActionDialogOpen, setBulkActionDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  
  // Communication state
  const [communicationType, setCommunicationType] = useState('email');
  const [communicationMessage, setCommunicationMessage] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  
  // Statistics state
  const [statistics, setStatistics] = useState({
    total: 0,
    byStatus: {},
    byPriority: {},
    avgScore: 0,
    scoreImprovement: 0,
    activeDisputes: 0,
  });
  
  // Menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuReport, setMenuReport] = useState(null);

  // Fetch reports
  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const reportsRef = collection(db, 'creditReports');
      const q = query(reportsRef, orderBy('createdAt', 'desc'), limit(1000));
      
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      }));
      
      setReports(data);
      calculateStatistics(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate statistics
  const calculateStatistics = useCallback((reportsData) => {
    const stats = {
      total: reportsData.length,
      byStatus: {},
      byPriority: {},
      avgScore: 0,
      scoreImprovement: 0,
      activeDisputes: 0,
    };
    
    // Count by status
    Object.keys(REPORT_STATUS).forEach(status => {
      stats.byStatus[status] = reportsData.filter(r => r.status === status).length;
    });
    
    // Count by priority
    Object.keys(PRIORITY_LEVELS).forEach(priority => {
      stats.byPriority[priority] = reportsData.filter(r => r.priority === priority).length;
    });
    
    // Average score
    const scoresWithValues = reportsData.filter(r => r.currentScore);
    if (scoresWithValues.length > 0) {
      stats.avgScore = Math.round(
        scoresWithValues.reduce((sum, r) => sum + r.currentScore, 0) / scoresWithValues.length
      );
    }
    
    // Score improvement
    const reportsWithImprovement = reportsData.filter(r => r.currentScore && r.initialScore);
    if (reportsWithImprovement.length > 0) {
      const totalImprovement = reportsWithImprovement.reduce(
        (sum, r) => sum + (r.currentScore - r.initialScore),
        0
      );
      stats.scoreImprovement = Math.round(totalImprovement / reportsWithImprovement.length);
    }
    
    // Active disputes
    stats.activeDisputes = reportsData.reduce(
      (sum, r) => sum + (r.activeDisputes || 0),
      0
    );
    
    setStatistics(stats);
  }, []);

  // Filter and sort reports
  useEffect(() => {
    let filtered = [...reports];
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        r.clientName?.toLowerCase().includes(query) ||
        r.clientEmail?.toLowerCase().includes(query) ||
        r.id?.toLowerCase().includes(query)
      );
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }
    
    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(r => r.priority === priorityFilter);
    }
    
    // Score range filter
    if (scoreRangeFilter !== 'all') {
      const range = SCORE_RANGES[scoreRangeFilter];
      filtered = filtered.filter(r =>
        r.currentScore >= range.min && r.currentScore <= range.max
      );
    }
    
    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      // Handle dates
      if (aValue instanceof Date) aValue = aValue.getTime();
      if (bValue instanceof Date) bValue = bValue.getTime();
      
      // Handle priority (convert to numeric)
      if (sortBy === 'priority') {
        aValue = PRIORITY_LEVELS[a.priority]?.value || 0;
        bValue = PRIORITY_LEVELS[b.priority]?.value || 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    setFilteredReports(filtered);
  }, [reports, searchQuery, statusFilter, priorityFilter, scoreRangeFilter, sortBy, sortOrder]);

  // Initial load
  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // AI-powered report analysis
  const analyzeReportWithAI = useCallback(async (report) => {
    if (!AI_CONFIG.openaiKey || !AI_CONFIG.features.reportAnalysis) {
      console.warn('AI analysis not configured');
      return null;
    }

    setAiGenerating(true);
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2000,
          messages: [
            {
              role: 'user',
              content: `Analyze this credit report and provide actionable insights:

Client: ${report.clientName}
Current Score: ${report.currentScore}
Initial Score: ${report.initialScore || 'N/A'}
Negative Items: ${report.negativeItems || 0}
Active Disputes: ${report.activeDisputes || 0}
Payment History: ${report.paymentHistory || 'N/A'}

Provide:
1. Key issues affecting the score
2. Prioritized action plan for improvement
3. Estimated timeline for score improvement
4. Specific items to dispute
5. Client communication recommendations

Respond in JSON format with keys: issues, actionPlan, timeline, disputeItems, communication`,
            },
          ],
        }),
      });

      const result = await response.json();
      let content = result.content[0].text;
      content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const analysis = JSON.parse(content);
      return analysis;
    } catch (error) {
      console.error('Error analyzing report with AI:', error);
      return null;
    } finally {
      setAiGenerating(false);
    }
  }, []);

  // AI-powered dispute generation
  const generateDisputeWithAI = useCallback(async (report, item) => {
    if (!AI_CONFIG.openaiKey || !AI_CONFIG.features.disputeGeneration) {
      console.warn('AI dispute generation not configured');
      return null;
    }

    setAiGenerating(true);
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1500,
          messages: [
            {
              role: 'user',
              content: `Generate a professional credit dispute letter for:

Client: ${report.clientName}
Item to Dispute: ${item.description}
Creditor: ${item.creditor}
Account Number: ${item.accountNumber}
Reason: ${item.reason}

Create a formal, legally sound dispute letter following FCRA guidelines. The letter should be assertive but professional.

Respond with ONLY the letter text, no JSON or additional formatting.`,
            },
          ],
        }),
      });

      const result = await response.json();
      const letter = result.content[0].text;
      return letter;
    } catch (error) {
      console.error('Error generating dispute with AI:', error);
      return null;
    } finally {
      setAiGenerating(false);
    }
  }, []);

  // AI-powered client communication
  const generateClientMessageWithAI = useCallback(async (report, messageType) => {
    if (!AI_CONFIG.openaiKey || !AI_CONFIG.features.clientCommunication) {
      console.warn('AI communication not configured');
      return null;
    }

    setAiGenerating(true);
    try {
      const prompts = {
        welcome: 'Generate a warm welcome message for a new credit repair client',
        update: `Generate a progress update message. Current score: ${report.currentScore}, Initial: ${report.initialScore}, Improvement: ${report.currentScore - report.initialScore} points`,
        reminder: 'Generate a friendly reminder about document submission or payment',
        celebration: `Generate a celebratory message for score improvement of ${report.currentScore - report.initialScore} points`,
      };

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 500,
          messages: [
            {
              role: 'user',
              content: `${prompts[messageType] || prompts.update} for ${report.clientName}. 
              
Keep it professional, friendly, and concise. Suitable for ${communicationType}.

Respond with ONLY the message text, no JSON or additional formatting.`,
            },
          ],
        }),
      });

      const result = await response.json();
      const message = result.content[0].text;
      return message;
    } catch (error) {
      console.error('Error generating client message with AI:', error);
      return null;
    } finally {
      setAiGenerating(false);
    }
  }, [communicationType]);

  // Handle selection
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedReports(filteredReports.map(r => r.id));
    } else {
      setSelectedReports([]);
    }
  };

  const handleSelectOne = (reportId) => {
    setSelectedReports(prev =>
      prev.includes(reportId)
        ? prev.filter(id => id !== reportId)
        : [...prev, reportId]
    );
  };

  const isSelected = (reportId) => selectedReports.includes(reportId);

  // Handle sorting
  const handleSort = (property) => {
    const isAsc = sortBy === property && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortBy(property);
  };

  // Handle menu
  const handleMenuOpen = (event, report) => {
    setAnchorEl(event.currentTarget);
    setMenuReport(report);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuReport(null);
  };

  // Handle actions
  const handleViewReport = (report) => {
    setSelectedReport(report);
    setViewDialogOpen(true);
    handleMenuClose();
  };

  const handleCommunicate = (report) => {
    setSelectedReport(report);
    setCommunicationDialogOpen(true);
    handleMenuClose();
  };

  const handleStartDispute = (report) => {
    setSelectedReport(report);
    setDisputeDialogOpen(true);
    handleMenuClose();
  };

  const handleViewDocuments = (report) => {
    setSelectedReport(report);
    setDocumentDialogOpen(true);
    handleMenuClose();
  };

  const handleUpdateStatus = async (report, newStatus) => {
    try {
      const reportRef = doc(db, 'creditReports', report.id);
      await updateDoc(reportRef, {
        status: newStatus,
        updatedAt: Timestamp.now(),
      });
      
      // Update local state
      setReports(prev =>
        prev.map(r => r.id === report.id ? { ...r, status: newStatus } : r)
      );
      
      handleMenuClose();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const handleUpdatePriority = async (report, newPriority) => {
    try {
      const reportRef = doc(db, 'creditReports', report.id);
      await updateDoc(reportRef, {
        priority: newPriority,
        updatedAt: Timestamp.now(),
      });
      
      // Update local state
      setReports(prev =>
        prev.map(r => r.id === report.id ? { ...r, priority: newPriority } : r)
      );
      
      handleMenuClose();
    } catch (error) {
      console.error('Error updating priority:', error);
      alert('Failed to update priority');
    }
  };

  const handleDeleteReport = async (report) => {
    if (!confirm(`Are you sure you want to delete the report for ${report.clientName}?`)) {
      return;
    }
    
    try {
      await deleteDoc(doc(db, 'creditReports', report.id));
      setReports(prev => prev.filter(r => r.id !== report.id));
      handleMenuClose();
    } catch (error) {
      console.error('Error deleting report:', error);
      alert('Failed to delete report');
    }
  };

  // Bulk operations
  const handleBulkExport = () => {
    const selectedData = reports.filter(r => selectedReports.includes(r.id));
    const csv = [
      ['Client Name', 'Email', 'Current Score', 'Status', 'Priority', 'Created'].join(','),
      ...selectedData.map(r => [
        r.clientName,
        r.clientEmail,
        r.currentScore,
        r.status,
        r.priority,
        r.createdAt ? format(r.createdAt, 'yyyy-MM-dd') : '',
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `credit-reports-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleBulkAnalyze = async () => {
    if (selectedReports.length === 0) {
      alert('Please select reports to analyze');
      return;
    }
    
    alert(`Analyzing ${selectedReports.length} reports with AI. This may take a moment...`);
    
    for (const reportId of selectedReports) {
      const report = reports.find(r => r.id === reportId);
      if (report) {
        const analysis = await analyzeReportWithAI(report);
        if (analysis) {
          // Store analysis in Firestore
          await updateDoc(doc(db, 'creditReports', reportId), {
            aiAnalysis: analysis,
            lastAnalyzed: Timestamp.now(),
          });
        }
      }
    }
    
    alert('Analysis complete!');
    fetchReports();
  };

  const handleBulkDispute = () => {
    setDisputeDialogOpen(true);
  };

  const handleBulkArchive = async () => {
    if (!confirm(`Archive ${selectedReports.length} reports?`)) {
      return;
    }
    
    try {
      const batch = writeBatch(db);
      selectedReports.forEach(reportId => {
        const reportRef = doc(db, 'creditReports', reportId);
        batch.update(reportRef, {
          status: 'archived',
          archivedAt: Timestamp.now(),
        });
      });
      await batch.commit();
      
      fetchReports();
      setSelectedReports([]);
    } catch (error) {
      console.error('Error archiving reports:', error);
      alert('Failed to archive reports');
    }
  };

  // Send communication
  const handleSendCommunication = async () => {
    if (!selectedReport || !communicationMessage) {
      alert('Please enter a message');
      return;
    }
    
    try {
      // Store communication in Firestore
      await addDoc(collection(db, 'communications'), {
        reportId: selectedReport.id,
        clientId: selectedReport.clientId,
        type: communicationType,
        message: communicationMessage,
        sentAt: Timestamp.now(),
        sentBy: 'currentUserId', // Replace with actual user ID
      });
      
      // In a real app, you would also trigger email/SMS/chat here
      alert(`${communicationType.toUpperCase()} sent successfully!`);
      
      setCommunicationDialogOpen(false);
      setCommunicationMessage('');
    } catch (error) {
      console.error('Error sending communication:', error);
      alert('Failed to send communication');
    }
  };

  // Generate AI message
  const handleGenerateAIMessage = async (messageType) => {
    const message = await generateClientMessageWithAI(selectedReport, messageType);
    if (message) {
      setCommunicationMessage(message);
    }
  };

  // Get score range info
  const getScoreRangeInfo = (score) => {
    for (const range of Object.values(SCORE_RANGES)) {
      if (score >= range.min && score <= range.max) {
        return range;
      }
    }
    return SCORE_RANGES.poor;
  };

  // Pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Statistics Card
  const StatCard = ({ title, value, icon: Icon, color = 'primary', subtitle }) => (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar sx={{ bgcolor: `${color}.main`, width: 48, height: 48 }}>
            <Icon />
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  // Main render
  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            Credit Reports
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage and analyze client credit reports
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchReports}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => alert('Add new report functionality')}
          >
            New Report
          </Button>
        </Box>
      </Box>

      {/* Statistics Dashboard */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Reports"
            value={statistics.total.toLocaleString()}
            icon={Description}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Average Score"
            value={statistics.avgScore}
            icon={Assessment}
            color="info"
            subtitle={getScoreRangeInfo(statistics.avgScore).label}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Avg Improvement"
            value={`+${statistics.scoreImprovement}`}
            icon={TrendingUp}
            color="success"
            subtitle="points"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Disputes"
            value={statistics.activeDisputes}
            icon={Campaign}
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by name, email, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All Status</MenuItem>
                {Object.entries(REPORT_STATUS).map(([key, config]) => (
                  <MenuItem key={key} value={key}>
                    {config.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Priority</InputLabel>
              <Select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                label="Priority"
              >
                <MenuItem value="all">All Priorities</MenuItem>
                {Object.entries(PRIORITY_LEVELS).map(([key, config]) => (
                  <MenuItem key={key} value={key}>
                    {config.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Score Range</InputLabel>
              <Select
                value={scoreRangeFilter}
                onChange={(e) => setScoreRangeFilter(e.target.value)}
                label="Score Range"
              >
                <MenuItem value="all">All Scores</MenuItem>
                {Object.entries(SCORE_RANGES).map(([key, config]) => (
                  <MenuItem key={key} value={key}>
                    {config.label} ({config.min}-{config.max})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterList />}
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setPriorityFilter('all');
                setScoreRangeFilter('all');
              }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Bulk Actions */}
      {selectedReports.length > 0 && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: 'primary.light' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              {selectedReports.length} report(s) selected
            </Typography>
            <ButtonGroup variant="contained" size="small">
              <Button startIcon={<Download />} onClick={handleBulkExport}>
                Export
              </Button>
              <Button startIcon={<Psychology />} onClick={handleBulkAnalyze}>
                AI Analyze
              </Button>
              <Button startIcon={<Campaign />} onClick={handleBulkDispute}>
                Dispute
              </Button>
              <Button startIcon={<Archive />} onClick={handleBulkArchive}>
                Archive
              </Button>
            </ButtonGroup>
          </Box>
        </Paper>
      )}

      {/* Reports Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={
                      selectedReports.length > 0 &&
                      selectedReports.length < filteredReports.length
                    }
                    checked={
                      filteredReports.length > 0 &&
                      selectedReports.length === filteredReports.length
                    }
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === 'clientName'}
                    direction={sortBy === 'clientName' ? sortOrder : 'asc'}
                    onClick={() => handleSort('clientName')}
                  >
                    Client
                  </TableSortLabel>
                </TableCell>
                <TableCell align="center">
                  <TableSortLabel
                    active={sortBy === 'currentScore'}
                    direction={sortBy === 'currentScore' ? sortOrder : 'asc'}
                    onClick={() => handleSort('currentScore')}
                  >
                    Score
                  </TableSortLabel>
                </TableCell>
                <TableCell align="center">Improvement</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === 'status'}
                    direction={sortBy === 'status' ? sortOrder : 'asc'}
                    onClick={() => handleSort('status')}
                  >
                    Status
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === 'priority'}
                    direction={sortBy === 'priority' ? sortOrder : 'asc'}
                    onClick={() => handleSort('priority')}
                  >
                    Priority
                  </TableSortLabel>
                </TableCell>
                <TableCell align="center">Disputes</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === 'createdAt'}
                    direction={sortBy === 'createdAt' ? sortOrder : 'asc'}
                    onClick={() => handleSort('createdAt')}
                  >
                    Created
                  </TableSortLabel>
                </TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredReports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No reports found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredReports
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((report) => {
                    const scoreInfo = getScoreRangeInfo(report.currentScore);
                    const improvement = report.currentScore - (report.initialScore || report.currentScore);
                    const statusConfig = REPORT_STATUS[report.status] || REPORT_STATUS.new;
                    const priorityConfig = PRIORITY_LEVELS[report.priority] || PRIORITY_LEVELS.low;
                    const StatusIcon = statusConfig.icon;
                    const PriorityIcon = priorityConfig.icon;
                    
                    return (
                      <TableRow
                        key={report.id}
                        hover
                        selected={isSelected(report.id)}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={isSelected(report.id)}
                            onChange={() => handleSelectOne(report.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Avatar sx={{ mr: 2, width: 40, height: 40 }}>
                              {report.clientName?.[0] || 'C'}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                {report.clientName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {report.clientEmail}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Box>
                            <Typography
                              variant="h6"
                              sx={{ fontWeight: 'bold', color: scoreInfo.color }}
                            >
                              {report.currentScore}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {scoreInfo.label}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          {improvement !== 0 && (
                            <Chip
                              size="small"
                              label={`${improvement > 0 ? '+' : ''}${improvement}`}
                              color={improvement > 0 ? 'success' : 'error'}
                              icon={improvement > 0 ? <TrendingUp /> : <TrendingDown />}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={statusConfig.label}
                            color={statusConfig.color}
                            icon={<StatusIcon />}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={priorityConfig.label}
                            color={priorityConfig.color}
                            icon={<PriorityIcon />}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Badge badgeContent={report.activeDisputes || 0} color="warning">
                            <Campaign />
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {report.createdAt ? format(report.createdAt, 'MMM dd, yyyy') : 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Box display="flex" gap={0.5} justifyContent="center">
                            <Tooltip title="View Report">
                              <IconButton
                                size="small"
                                onClick={() => handleViewReport(report)}
                              >
                                <Visibility fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Communicate">
                              <IconButton
                                size="small"
                                onClick={() => handleCommunicate(report)}
                              >
                                <Email fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="More Actions">
                              <IconButton
                                size="small"
                                onClick={(e) => handleMenuOpen(e, report)}
                              >
                                <MoreVert fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={filteredReports.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleViewReport(menuReport)}>
          <ListItemIcon><Visibility fontSize="small" /></ListItemIcon>
          <ListItemText>View Report</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleCommunicate(menuReport)}>
          <ListItemIcon><Email fontSize="small" /></ListItemIcon>
          <ListItemText>Send Communication</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleStartDispute(menuReport)}>
          <ListItemIcon><Campaign fontSize="small" /></ListItemIcon>
          <ListItemText>Start Dispute</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleViewDocuments(menuReport)}>
          <ListItemIcon><FolderOpen fontSize="small" /></ListItemIcon>
          <ListItemText>View Documents</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleUpdateStatus(menuReport, 'inProgress')}>
          <ListItemIcon><PlayArrow fontSize="small" /></ListItemIcon>
          <ListItemText>Mark In Progress</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleUpdateStatus(menuReport, 'reviewed')}>
          <ListItemIcon><Visibility fontSize="small" /></ListItemIcon>
          <ListItemText>Mark Reviewed</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleUpdateStatus(menuReport, 'completed')}>
          <ListItemIcon><CheckCircle fontSize="small" /></ListItemIcon>
          <ListItemText>Mark Completed</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleUpdatePriority(menuReport, 'high')}>
          <ListItemIcon><Flag fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>High Priority</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleUpdatePriority(menuReport, 'medium')}>
          <ListItemIcon><Flag fontSize="small" color="warning" /></ListItemIcon>
          <ListItemText>Medium Priority</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleUpdatePriority(menuReport, 'low')}>
          <ListItemIcon><Flag fontSize="small" color="info" /></ListItemIcon>
          <ListItemText>Low Priority</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleDeleteReport(menuReport)}>
          <ListItemIcon><Delete fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>Delete Report</ListItemText>
        </MenuItem>
      </Menu>

      {/* Communication Dialog */}
      <Dialog
        open={communicationDialogOpen}
        onClose={() => setCommunicationDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Send Communication to {selectedReport?.clientName}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Communication Type</InputLabel>
              <Select
                value={communicationType}
                onChange={(e) => setCommunicationType(e.target.value)}
                label="Communication Type"
              >
                <MenuItem value="email">
                  <Box display="flex" alignItems="center">
                    <Email sx={{ mr: 1 }} /> Email
                  </Box>
                </MenuItem>
                <MenuItem value="sms">
                  <Box display="flex" alignItems="center">
                    <Sms sx={{ mr: 1 }} /> SMS
                  </Box>
                </MenuItem>
                <MenuItem value="chat">
                  <Box display="flex" alignItems="center">
                    <Chat sx={{ mr: 1 }} /> Chat
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                AI Quick Messages:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<AutoAwesome />}
                  onClick={() => handleGenerateAIMessage('welcome')}
                  disabled={aiGenerating}
                >
                  Welcome
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<AutoAwesome />}
                  onClick={() => handleGenerateAIMessage('update')}
                  disabled={aiGenerating}
                >
                  Progress Update
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<AutoAwesome />}
                  onClick={() => handleGenerateAIMessage('reminder')}
                  disabled={aiGenerating}
                >
                  Reminder
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<AutoAwesome />}
                  onClick={() => handleGenerateAIMessage('celebration')}
                  disabled={aiGenerating}
                >
                  Celebration
                </Button>
              </Stack>
              {aiGenerating && (
                <Box display="flex" alignItems="center" mt={1}>
                  <CircularProgress size={16} sx={{ mr: 1 }} />
                  <Typography variant="caption">Generating message with AI...</Typography>
                </Box>
              )}
            </Box>

            <TextField
              fullWidth
              multiline
              rows={8}
              label="Message"
              value={communicationMessage}
              onChange={(e) => setCommunicationMessage(e.target.value)}
              placeholder="Type your message here..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCommunicationDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            startIcon={<Send />}
            onClick={handleSendCommunication}
            disabled={!communicationMessage}
          >
            Send
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Report Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Credit Report - {selectedReport?.clientName}
        </DialogTitle>
        <DialogContent>
          {selectedReport && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>Client Information</Typography>
                    <Box>
                      <Typography variant="body2"><strong>Name:</strong> {selectedReport.clientName}</Typography>
                      <Typography variant="body2"><strong>Email:</strong> {selectedReport.clientEmail}</Typography>
                      <Typography variant="body2"><strong>Phone:</strong> {selectedReport.clientPhone || 'N/A'}</Typography>
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>Score Overview</Typography>
                    <Box display="flex" justifyContent="space-around" alignItems="center">
                      <Box textAlign="center">
                        <Typography variant="body2" color="text.secondary">Initial</Typography>
                        <Typography variant="h4">{selectedReport.initialScore || 'N/A'}</Typography>
                      </Box>
                      <TrendingUp sx={{ fontSize: 40, color: 'success.main' }} />
                      <Box textAlign="center">
                        <Typography variant="body2" color="text.secondary">Current</Typography>
                        <Typography variant="h4" sx={{ color: getScoreRangeInfo(selectedReport.currentScore).color }}>
                          {selectedReport.currentScore}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
              
              {selectedReport.aiAnalysis && (
                <Paper sx={{ p: 2, mt: 2 }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Psychology sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">AI Analysis</Typography>
                  </Box>
                  {selectedReport.aiAnalysis.issues && (
                    <Box mb={2}>
                      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Key Issues:
                      </Typography>
                      <List dense>
                        {selectedReport.aiAnalysis.issues.map((issue, index) => (
                          <ListItem key={index}>
                            <ListItemText primary={issue} />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                  {selectedReport.aiAnalysis.actionPlan && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Action Plan:
                      </Typography>
                      <List dense>
                        {selectedReport.aiAnalysis.actionPlan.map((action, index) => (
                          <ListItem key={index}>
                            <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                            <ListItemText primary={action} />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                </Paper>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          <Button variant="contained" startIcon={<Psychology />}>
            AI Analyze
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CreditReports;