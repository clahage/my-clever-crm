// ...existing code...
// ═══════════════════════════════════════════════════════════════════════════
// LEAD SCORING DASHBOARD - MEGA ENTERPRISE UI
// ═══════════════════════════════════════════════════════════════════════════
// Real-time lead scoring visualization and management interface
// Version: 2.0.0 | Author: Christopher | Company: Speedy Credit Repair

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box, Paper, Typography, Button, Grid, Card, CardContent, CardActions,
  Chip, Avatar, IconButton, Tooltip, Badge, LinearProgress, Rating,
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Select, MenuItem, FormControl, InputLabel, Alert, Snackbar,
  Tabs, Tab, Divider, Stack, CircularProgress, ToggleButtonGroup,
  ToggleButton, Skeleton, Accordion, AccordionSummary, AccordionDetails,
  List, ListItem, ListItemText, ListItemIcon, ListItemSecondaryAction,
  SpeedDial, SpeedDialAction, SpeedDialIcon, Fab, Zoom, Fade, Grow
} from '@mui/material';

// Date utilities
import { format, formatDistanceToNow, addDays, isAfter, isBefore } from 'date-fns';

// Recharts for analytics
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, RadarChart, Radar,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  Legend, ResponsiveContainer, Cell, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

// Lucide Icons
import {
  TrendingUp, TrendingDown, Target, Award, Brain, Zap, Clock, Phone,
  Mail, MessageSquare, User, Users, DollarSign, AlertCircle, CheckCircle,
  XCircle, Activity, BarChart3, PieChart as PieChartIcon, Settings,
  RefreshCw, Download, Upload, Filter, Search, ChevronRight, ChevronDown,
  Star, Sparkles, Gauge, Timer, Calendar, Flag, Shield, ThumbsUp,
  ThumbsDown, Eye, Edit, Trash2, Plus, Send, Archive, MoreVertical,
  ArrowUpRight, ArrowDownRight, Info, HelpCircle, ExternalLink
} from 'lucide-react';

// Firebase
import { 
  collection, query, where, orderBy, limit, onSnapshot, 
  doc, updateDoc, deleteDoc, addDoc, serverTimestamp, getDocs 
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS & CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const GRADE_COLORS = {
  'A+': '#4CAF50',
  'A': '#66BB6A',
  'A-': '#81C784',
  'B+': '#2196F3',
  'B': '#42A5F5',
  'B-': '#64B5F6',
  'C+': '#FF9800',
  'C': '#FFA726',
  'C-': '#FFB74D',
  'D': '#FF5722',
  'F': '#F44336'
};

const URGENCY_COLORS = {
  critical: '#F44336',
  high: '#FF9800',
  medium: '#2196F3',
  low: '#9E9E9E'
};

const SCORE_RANGES = [
  { min: 9, max: 10, label: 'Hot Lead', color: '#F44336', icon: Zap },
  { min: 7, max: 8.9, label: 'High Priority', color: '#FF9800', icon: Target },
  { min: 5, max: 6.9, label: 'Standard', color: '#2196F3', icon: User },
  { min: 3, max: 4.9, label: 'Nurture', color: '#9C27B0', icon: Timer },
  { min: 0, max: 2.9, label: 'Low Priority', color: '#607D8B', icon: Archive }
];

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const LeadScoringDashboard = ({ embedded = false, contactId = null }) => {
  const { currentUser } = useAuth();
  
  // ===== STATE MANAGEMENT =====
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [viewMode, setViewMode] = useState('grid'); // grid, list, kanban
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('score-desc');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [rescoreDialogOpen, setRescoreDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Analytics state
  const [analytics, setAnalytics] = useState({
    totalLeads: 0,
    averageScore: 0,
    conversionRate: 0,
    totalValue: 0,
    distribution: [],
    trends: [],
    performance: []
  });
  
  // ===== FIREBASE LISTENERS =====
  useEffect(() => {
    if (contactId) {
      // Single contact mode
      loadSingleContact();
    } else {
      // Dashboard mode
      loadAllLeads();
      loadAnalytics();
    }
  }, [contactId, filterStatus, sortBy]);
  
  // Load single contact score
  const loadSingleContact = async () => {
    setLoading(true);
    try {
      const contactDoc = await doc(db, 'contacts', contactId).get();
      if (contactDoc.exists()) {
        const data = { id: contactId, ...contactDoc.data() };
        setLeads([data]);
        setSelectedLead(data);
      }
    } catch (error) {
      console.error('Error loading contact:', error);
      showSnackbar('Error loading contact data', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Load all leads with real-time updates
  const loadAllLeads = () => {
    setLoading(true);
    
    let q = query(
      collection(db, 'contacts'),
      where('roles', 'array-contains', 'lead')
    );
    
    // Apply filters
    if (filterStatus !== 'all') {
      if (filterStatus === 'hot') {
        q = query(q, where('leadScore', '>=', 8));
      } else if (filterStatus === 'high') {
        q = query(q, where('leadScore', '>=', 6), where('leadScore', '<', 8));
      } else if (filterStatus === 'medium') {
        q = query(q, where('leadScore', '>=', 4), where('leadScore', '<', 6));
      } else if (filterStatus === 'low') {
        q = query(q, where('leadScore', '<', 4));
      }
    }
    
    // Apply sorting
    const [sortField, sortDirection] = sortBy.split('-');
    if (sortField === 'score') {
      q = query(q, orderBy('leadScore', sortDirection === 'asc' ? 'asc' : 'desc'));
    } else if (sortField === 'date') {
      q = query(q, orderBy('createdAt', sortDirection === 'asc' ? 'asc' : 'desc'));
    } else if (sortField === 'value') {
      q = query(q, orderBy('aiInsights.lifetimeValue', sortDirection === 'asc' ? 'asc' : 'desc'));
    }
    
    q = query(q, limit(100));
    
    // Set up real-time listener
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const leadData = [];
      snapshot.forEach((doc) => {
        leadData.push({ id: doc.id, ...doc.data() });
      });
      setLeads(leadData);
      setLoading(false);
    }, (error) => {
      console.error('Error loading leads:', error);
      showSnackbar('Error loading leads', 'error');
      setLoading(false);
    });
    
    return unsubscribe;
  };
  
  // Load analytics data
  const loadAnalytics = async () => {
    try {
      // Get all leads for analytics
      const leadsSnapshot = await getDocs(
        query(
          collection(db, 'contacts'),
          where('roles', 'array-contains', 'lead'),
          where('leadScore', '>', 0)
        )
      );
      
      let totalScore = 0;
      let totalValue = 0;
      let converted = 0;
      const distribution = { A: 0, B: 0, C: 0, D: 0, F: 0 };
      const scoreData = [];
      
      leadsSnapshot.forEach((doc) => {
        const data = doc.data();
        const score = data.leadScore || 0;
        const value = data.aiInsights?.lifetimeValue || 0;
        
        totalScore += score;
        totalValue += value;
        
        if (data.roles?.includes('client')) converted++;
        
        // Distribution
        const grade = data.leadGrade || 'F';
        const gradeCategory = grade[0]; // Get first letter
        distribution[gradeCategory] = (distribution[gradeCategory] || 0) + 1;
        
        // Score data for trends
        scoreData.push({
          date: data.createdAt?.toDate() || new Date(),
          score: score
        });
      });
      
      const totalLeads = leadsSnapshot.size;
      const averageScore = totalLeads > 0 ? (totalScore / totalLeads).toFixed(1) : 0;
      const conversionRate = totalLeads > 0 ? ((converted / totalLeads) * 100).toFixed(1) : 0;
      
      // Format distribution for pie chart
      const distributionData = Object.entries(distribution).map(([grade, count]) => ({
        name: `Grade ${grade}`,
        value: count,
        percentage: totalLeads > 0 ? ((count / totalLeads) * 100).toFixed(1) : 0
      }));
      
      // Create trend data (last 7 days)
      const trends = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const dayScores = scoreData.filter(s => {
          const scoreDate = new Date(s.date);
          scoreDate.setHours(0, 0, 0, 0);
          return scoreDate.getTime() === date.getTime();
        });
        
        trends.push({
          date: format(date, 'MMM dd'),
          leads: dayScores.length,
          avgScore: dayScores.length > 0 
            ? (dayScores.reduce((sum, s) => sum + s.score, 0) / dayScores.length).toFixed(1)
            : 0
        });
      }
      
      setAnalytics({
        totalLeads,
        averageScore,
        conversionRate,
        totalValue,
        distribution: distributionData,
        trends,
        performance: scoreData.slice(-10) // Last 10 scores
      });
      
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };
  
  // ===== ACTION HANDLERS =====
  
  // Score or rescore a lead
  const handleScoreLead = async (lead) => {
    setRefreshing(true);
    try {
      const scoreLead = httpsCallable(functions, 'scoreLead');
      const result = await scoreLead({
        contactId: lead.id,
        options: { useAI: true }
      });
      
      showSnackbar(`Lead rescored: ${result.data.score}/10`, 'success');
      
      // Refresh data
      if (!contactId) loadAllLeads();
      
    } catch (error) {
      console.error('Error scoring lead:', error);
      showSnackbar('Error scoring lead', 'error');
    } finally {
      setRefreshing(false);
    }
  };
  
  // Batch rescore leads
  const handleBatchRescore = async () => {
    setRescoreDialogOpen(false);
    setRefreshing(true);
    
    try {
      const leadIds = leads.slice(0, 10).map(l => l.id); // Top 10 leads
      
      for (const leadId of leadIds) {
        const scoreLead = httpsCallable(functions, 'scoreLead');
        await scoreLead({ contactId: leadId, options: { useAI: false } });
        
        // Small delay between calls
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      showSnackbar(`${leadIds.length} leads rescored successfully`, 'success');
      loadAllLeads();
      
    } catch (error) {
      console.error('Error batch rescoring:', error);
      showSnackbar('Error rescoring leads', 'error');
    } finally {
      setRefreshing(false);
    }
  };
  
  // Update lead status
  const handleUpdateStatus = async (lead, newStatus) => {
    try {
      await updateDoc(doc(db, 'contacts', lead.id), {
        leadStatus: newStatus,
        lastModified: serverTimestamp()
      });
      
      showSnackbar(`Lead status updated to ${newStatus}`, 'success');
      
    } catch (error) {
      console.error('Error updating status:', error);
      showSnackbar('Error updating lead status', 'error');
    }
  };
  
  // Start workflow for lead
  const handleStartWorkflow = async (lead) => {
    try {
      const startWorkflow = httpsCallable(functions, 'startWorkflow');
      await startWorkflow({
        contactId: lead.id,
        workflowType: lead.leadScore >= 7 ? 'high-value-lead' : 'standard-lead'
      });
      
      showSnackbar('Workflow started for lead', 'success');
      
    } catch (error) {
      console.error('Error starting workflow:', error);
      showSnackbar('Error starting workflow', 'error');
    }
  };
  
  // Helper function for snackbar
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };
  
  // ===== RENDER METHODS =====
  
  // Render score badge
  const renderScoreBadge = (score, grade) => {
    const color = GRADE_COLORS[grade] || '#9E9E9E';
    const range = SCORE_RANGES.find(r => score >= r.min && score <= r.max);
    const Icon = range?.icon || User;
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Avatar sx={{ 
          bgcolor: color, 
          width: 48, 
          height: 48,
          fontSize: '1.2rem',
          fontWeight: 'bold'
        }}>
          {score.toFixed(1)}
        </Avatar>
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 'bold', color }}>
            Grade {grade}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {range?.label || 'Unscored'}
          </Typography>
        </Box>
        <Icon size={20} style={{ color }} />
      </Box>
    );
  };
  
  // Render lead card (Grid View)
  const renderLeadCard = (lead) => {
    const urgencyColor = URGENCY_COLORS[lead.leadUrgency] || '#9E9E9E';
    const hasAI = lead.aiInsights?.conversionProbability > 0;
    
    return (
      <Card 
        key={lead.id}
        sx={{ 
          height: '100%',
          cursor: 'pointer',
          transition: 'all 0.3s',
          border: lead.leadScore >= 8 ? '2px solid' : '1px solid',
          borderColor: lead.leadScore >= 8 ? 'error.main' : 'divider',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 3
          }
        }}
        onClick={() => {
          setSelectedLead(lead);
          setDialogOpen(true);
        }}
      >
        <CardContent>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            {renderScoreBadge(lead.leadScore || 0, lead.leadGrade || 'F')}
            <Chip
              label={lead.leadUrgency || 'low'}
              size="small"
              sx={{
                bgcolor: urgencyColor,
                color: 'white',
                fontWeight: 'bold'
              }}
              icon={<Clock size={14} style={{ color: 'white' }} />}
            />
          </Box>
          
          {/* Contact Info */}
          <Typography variant="h6" gutterBottom>
            {lead.firstName} {lead.lastName}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {lead.email || 'No email'}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {lead.phone || 'No phone'}
          </Typography>
          
          {/* Credit Info */}
          <Box sx={{ mt: 2, p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Credit Score
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {lead.creditScore || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Negative Items
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {lead.negativeItems || '0'}
                </Typography>
              </Grid>
            </Grid>
          </Box>
          
          {/* AI Insights */}
          {hasAI && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                <Brain size={14} />
                <Typography variant="caption" fontWeight="bold">
                  AI Insights
                </Typography>
              </Box>
              
              <Stack direction="row" spacing={1}>
                <Chip
                  label={`${lead.aiInsights.conversionProbability}% conversion`}
                  size="small"
                  variant="outlined"
                  color="primary"
                />
                {lead.aiInsights.lifetimeValue > 0 && (
                  <Chip
                    label={`$${lead.aiInsights.lifetimeValue} LTV`}
                    size="small"
                    variant="outlined"
                    color="success"
                  />
                )}
              </Stack>
              
              {lead.aiInsights.recommendedPlan && (
                <Typography variant="caption" color="primary" sx={{ mt: 1, display: 'block' }}>
                  Recommended: {lead.aiInsights.recommendedPlan} Plan
                </Typography>
              )}
            </Box>
          )}
          
          {/* Date */}
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            {lead.createdAt ? formatDistanceToNow(lead.createdAt.toDate()) + ' ago' : 'Unknown'}
          </Typography>
        </CardContent>
        
        {/* Actions */}
        <CardActions>
          <IconButton size="small" onClick={(e) => {
            e.stopPropagation();
            window.location.href = `tel:${lead.phone}`;
          }}>
            <Phone size={18} />
          </IconButton>
          <IconButton size="small" onClick={(e) => {
            e.stopPropagation();
            window.location.href = `mailto:${lead.email}`;
          }}>
            <Mail size={18} />
          </IconButton>
          <IconButton size="small" onClick={(e) => {
            e.stopPropagation();
            handleScoreLead(lead);
          }}>
            <RefreshCw size={18} />
          </IconButton>
          <IconButton size="small" onClick={(e) => {
            e.stopPropagation();
            handleStartWorkflow(lead);
          }}>
            <Send size={18} />
          </IconButton>
        </CardActions>
      </Card>
    );
  };
  
  // ===== MAIN RENDER =====
  return (
    <Box sx={{ p: embedded ? 0 : 3 }}>
      {/* Header */}
      {!embedded && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Brain /> AI Lead Scoring Dashboard
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Real-time lead scoring with predictive analytics and AI insights
              </Typography>
            </Box>
            
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<RefreshCw />}
                onClick={() => {
                  setRefreshing(true);
                  loadAllLeads();
                  loadAnalytics();
                  setTimeout(() => setRefreshing(false), 1000);
                }}
                disabled={refreshing}
              >
                Refresh
              </Button>
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={() => {
                  // Export logic here
                  showSnackbar('Export feature coming soon', 'info');
                }}
              >
                Export
              </Button>
              <Button
                variant="contained"
                startIcon={<Sparkles />}
                onClick={() => setRescoreDialogOpen(true)}
              >
                AI Rescore All
              </Button>
            </Stack>
          </Box>
          
          {/* Summary Stats */}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" color="primary">
                  {analytics.totalLeads}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Leads
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" color="success.main">
                  {analytics.averageScore}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Average Score
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" color="warning.main">
                  {analytics.conversionRate}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Conversion Rate
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" color="info.main">
                  ${(analytics.totalValue / 1000).toFixed(1)}k
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Value
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}
      
      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Lead Board" icon={<Users />} />
          <Tab label="Analytics" icon={<BarChart3 />} />
          <Tab label="AI Insights" icon={<Brain />} />
          <Tab label="Automation" icon={<Zap />} />
        </Tabs>
      </Paper>
      
      {/* Tab Content */}
      {tabValue === 0 && (
        <Box>
          {/* Filters and View Controls */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Filter by Score</InputLabel>
                  <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    label="Filter by Score"
                  >
                    <MenuItem value="all">All Leads</MenuItem>
                    <MenuItem value="hot">Hot Leads (8+)</MenuItem>
                    <MenuItem value="high">High Priority (6-8)</MenuItem>
                    <MenuItem value="medium">Medium (4-6)</MenuItem>
                    <MenuItem value="low">Low Priority (&lt;4)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    label="Sort By"
                  >
                    <MenuItem value="score-desc">Score (High to Low)</MenuItem>
                    <MenuItem value="score-asc">Score (Low to High)</MenuItem>
                    <MenuItem value="date-desc">Newest First</MenuItem>
                    <MenuItem value="date-asc">Oldest First</MenuItem>
                    <MenuItem value="value-desc">Value (High to Low)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={(e, newMode) => newMode && setViewMode(newMode)}
                  size="small"
                  fullWidth
                >
                  <ToggleButton value="grid">
                    <Grid size={18} />
                  </ToggleButton>
                  <ToggleButton value="list">
                    <List size={18} />
                  </ToggleButton>
                  <ToggleButton value="kanban">
                    <Layers size={18} />
                  </ToggleButton>
                </ToggleButtonGroup>
              </Grid>
            </Grid>
          </Paper>
          
          {/* Lead Cards/List */}
          {loading ? (
            <Grid container spacing={3}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Grid item xs={12} sm={6} md={4} key={i}>
                  <Skeleton variant="rectangular" height={300} />
                </Grid>
              ))}
            </Grid>
          ) : leads.length === 0 ? (
            <Paper sx={{ p: 8, textAlign: 'center' }}>
              <Users size={48} style={{ opacity: 0.3 }} />
              <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
                No leads found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Leads will appear here as they are scored
              </Typography>
            </Paper>
          ) : viewMode === 'grid' ? (
            <Grid container spacing={3}>
              {leads.map((lead) => (
                <Grid item xs={12} sm={6} md={4} key={lead.id}>
                  {renderLeadCard(lead)}
                </Grid>
              ))}
            </Grid>
          ) : viewMode === 'list' ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Score</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Contact</TableCell>
                    <TableCell>Credit Info</TableCell>
                    <TableCell>AI Insights</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leads.map((lead) => (
                    <TableRow 
                      key={lead.id}
                      hover
                      onClick={() => {
                        setSelectedLead(lead);
                        setDialogOpen(true);
                      }}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>
                        {renderScoreBadge(lead.leadScore || 0, lead.leadGrade || 'F')}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {lead.firstName} {lead.lastName}
                        </Typography>
                        <Chip
                          label={lead.leadUrgency || 'low'}
                          size="small"
                          sx={{
                            bgcolor: URGENCY_COLORS[lead.leadUrgency] || '#9E9E9E',
                            color: 'white',
                            fontSize: '0.7rem',
                            height: 20,
                            mt: 0.5
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{lead.email}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {lead.phone}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          Score: {lead.creditScore || 'N/A'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {lead.negativeItems || 0} negative items
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {lead.aiInsights?.conversionProbability > 0 && (
                          <Box>
                            <Typography variant="body2">
                              {lead.aiInsights.conversionProbability}% conversion
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ${lead.aiInsights.lifetimeValue} LTV
                            </Typography>
                          </Box>
                        )}
                      </TableCell>
                      <TableCell>
                        {lead.createdAt && (
                          <Typography variant="caption">
                            {formatDistanceToNow(lead.createdAt.toDate())} ago
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5}>
                          <IconButton size="small" onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `tel:${lead.phone}`;
                          }}>
                            <Phone size={16} />
                          </IconButton>
                          <IconButton size="small" onClick={(e) => {
                            e.stopPropagation();
                            handleScoreLead(lead);
                          }}>
                            <RefreshCw size={16} />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            // Kanban View
            <Grid container spacing={2}>
              {SCORE_RANGES.map((range) => {
                const rangeLeads = leads.filter(l => 
                  l.leadScore >= range.min && l.leadScore <= range.max
                );
                const RangeIcon = range.icon;
                
                return (
                  <Grid item xs={12} sm={6} md={2.4} key={range.label}>
                    <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <RangeIcon size={20} style={{ color: range.color }} />
                        <Typography variant="subtitle2" fontWeight="bold">
                          {range.label}
                        </Typography>
                        <Chip label={rangeLeads.length} size="small" />
                      </Box>
                      
                      <Stack spacing={1}>
                        {rangeLeads.map((lead) => (
                          <Card
                            key={lead.id}
                            sx={{
                              p: 1.5,
                              cursor: 'pointer',
                              borderLeft: `4px solid ${range.color}`,
                              '&:hover': { bgcolor: 'action.hover' }
                            }}
                            onClick={() => {
                              setSelectedLead(lead);
                              setDialogOpen(true);
                            }}
                          >
                            <Typography variant="body2" fontWeight="bold">
                              {lead.firstName} {lead.lastName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Score: {lead.leadScore?.toFixed(1)}
                            </Typography>
                          </Card>
                        ))}
                      </Stack>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Box>
      )}
      
      {/* Analytics Tab */}
      {tabValue === 1 && (
        <Grid container spacing={3}>
          {/* Score Distribution */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Score Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.distribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ percentage }) => `${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics.distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={Object.values(GRADE_COLORS)[index]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          
          {/* Lead Trend */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                7-Day Lead Trend
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <RechartsTooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="leads"
                    stroke="#8884d8"
                    name="New Leads"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="avgScore"
                    stroke="#82ca9d"
                    name="Avg Score"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      )}
      
      {/* Lead Details Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedLead && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                  {selectedLead.firstName} {selectedLead.lastName}
                </Typography>
                {renderScoreBadge(selectedLead.leadScore || 0, selectedLead.leadGrade || 'F')}
              </Box>
            </DialogTitle>
            
            <DialogContent>
              {/* Add detailed lead view here */}
              <Typography>Detailed lead information would go here...</Typography>
            </DialogContent>
            
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>Close</Button>
              <Button variant="contained" startIcon={<Phone />}>Call Lead</Button>
              <Button variant="contained" color="primary" startIcon={<Send />}>
                Start Workflow
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Batch Rescore Dialog */}
      <Dialog
        open={rescoreDialogOpen}
        onClose={() => setRescoreDialogOpen(false)}
      >
        <DialogTitle>AI Batch Rescore</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            This will rescore your top 10 leads using the latest AI model.
            Each lead takes about 2 seconds to process.
          </Alert>
          <Typography>
            Are you sure you want to rescore {Math.min(10, leads.length)} leads?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRescoreDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleBatchRescore}
            startIcon={<Sparkles />}
          >
            Start Rescoring
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      
      {/* Speed Dial for Quick Actions */}
      {!embedded && (
        <SpeedDial
          ariaLabel="Quick Actions"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          icon={<SpeedDialIcon />}
        >
          <SpeedDialAction
            icon={<Plus />}
            tooltipTitle="Add Lead"
            onClick={() => {
              // Navigate to contact form
              window.location.href = '/contacts/new';
            }}
          />
          <SpeedDialAction
            icon={<RefreshCw />}
            tooltipTitle="Refresh"
            onClick={() => {
              loadAllLeads();
              loadAnalytics();
            }}
          />
          <SpeedDialAction
            icon={<Download />}
            tooltipTitle="Export"
            onClick={() => showSnackbar('Export coming soon', 'info')}
          />
        </SpeedDial>
      )}
    </Box>
  );
};

export default LeadScoringDashboard;