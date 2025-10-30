/**
 * Email Workflow Dashboard for SpeedyCRM
 * 
 * Enterprise-grade React component for monitoring and managing
 * automated email workflows with real-time analytics.
 * 
 * Features:
 * - Real-time workflow monitoring
 * - Contact email journey visualization
 * - Manual workflow controls (pause/resume/send)
 * - Performance metrics and analytics
 * - Advanced filtering and search
 * 
 * @author SpeedyCRM Team
 * @date October 2025
 */

import React, { useState, useEffect } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Tooltip,
  Alert,
  Tabs,
  Tab,
  Badge
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Email as EmailIcon,
  Timeline as TimelineIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, limit, onSnapshot, getDocs } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';

const EmailWorkflowDashboard = () => {
  // State Management
  const [activeTab, setActiveTab] = useState(0);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);
  const [stats, setStats] = useState({
    totalActive: 0,
    totalPaused: 0,
    totalCompleted: 0,
    emailsSent: 0,
    openRate: 0,
    clickRate: 0
  });
  
  // Filtering
  const [filters, setFilters] = useState({
    status: 'all',
    workflow: 'all',
    search: ''
  });
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Dialogs
  const [sendEmailDialog, setSendEmailDialog] = useState(false);
  const [emailContent, setEmailContent] = useState({ subject: '', body: '' });
  
  // Firebase Functions
  const functions = getFunctions();
  const manualSendEmail = httpsCallable(functions, 'manualSendEmail');
  const pauseWorkflow = httpsCallable(functions, 'pauseWorkflow');
  const resumeWorkflow = httpsCallable(functions, 'resumeWorkflow');

  // Load contacts with real-time updates
  useEffect(() => {
    loadContacts();
  }, [filters]);

  // Load statistics
  useEffect(() => {
    loadStatistics();
  }, []);

  /**
   * Load contacts from Firestore with real-time listener
   */
  const loadContacts = () => {
    setLoading(true);
    
    try {
      let q = query(
        collection(db, 'contacts'),
        orderBy('lastWorkflowUpdate', 'desc')
      );

      // Apply filters
      if (filters.status !== 'all') {
        q = query(q, where('workflowState.status', '==', filters.status));
      }

      if (filters.workflow !== 'all') {
        q = query(q, where('workflowState.workflowId', '==', filters.workflow));
      }

      // Real-time listener
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const contactsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Apply search filter (client-side)
        const filtered = filters.search
          ? contactsData.filter(c => 
              c.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
              c.email?.toLowerCase().includes(filters.search.toLowerCase())
            )
          : contactsData;

        setContacts(filtered);
        setLoading(false);
      });

      return () => unsubscribe();

    } catch (error) {
      console.error('Error loading contacts:', error);
      setLoading(false);
    }
  };

  /**
   * Load dashboard statistics
   */
  const loadStatistics = async () => {
    try {
      // Get all contacts with workflows
      const contactsSnap = await getDocs(
        query(collection(db, 'contacts'), where('workflowState', '!=', null))
      );

      let totalActive = 0;
      let totalPaused = 0;
      let totalCompleted = 0;
      let emailsSent = 0;
      let totalOpens = 0;
      let totalClicks = 0;

      contactsSnap.forEach(doc => {
        const data = doc.data();
        const status = data.workflowState?.status;
        
        if (status === 'active') totalActive++;
        else if (status === 'paused') totalPaused++;
        else if (status === 'completed') totalCompleted++;

        emailsSent += data.workflowState?.emailsSent?.length || 0;
        totalOpens += data.emailEngagement?.opens || 0;
        totalClicks += data.emailEngagement?.clicks || 0;
      });

      const openRate = emailsSent > 0 ? ((totalOpens / emailsSent) * 100).toFixed(1) : 0;
      const clickRate = emailsSent > 0 ? ((totalClicks / emailsSent) * 100).toFixed(1) : 0;

      setStats({
        totalActive,
        totalPaused,
        totalCompleted,
        emailsSent,
        openRate,
        clickRate
      });

    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  /**
   * Handle pause workflow
   */
  const handlePauseWorkflow = async (contactId) => {
    try {
      await pauseWorkflow({ contactId, reason: 'Paused by admin' });
      alert('Workflow paused successfully');
    } catch (error) {
      console.error('Error pausing workflow:', error);
      alert('Failed to pause workflow');
    }
  };

  /**
   * Handle resume workflow
   */
  const handleResumeWorkflow = async (contactId) => {
    try {
      await resumeWorkflow({ contactId });
      alert('Workflow resumed successfully');
    } catch (error) {
      console.error('Error resuming workflow:', error);
      alert('Failed to resume workflow');
    }
  };

  /**
   * Handle manual email send
   */
  const handleSendEmail = async () => {
    if (!selectedContact || !emailContent.subject || !emailContent.body) {
      alert('Please fill in all fields');
      return;
    }

    try {
      await manualSendEmail({
        contactId: selectedContact.id,
        customSubject: emailContent.subject,
        customBody: emailContent.body
      });
      
      alert('Email sent successfully');
      setSendEmailDialog(false);
      setEmailContent({ subject: '', body: '' });
      setSelectedContact(null);

    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email');
    }
  };

  /**
   * Get status color
   */
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'paused': return 'warning';
      case 'completed': return 'info';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  /**
   * Format date
   */
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp.toMillis()).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * Export data to CSV
   */
  const exportToCSV = () => {
    const csvData = contacts.map(c => ({
      Name: c.name,
      Email: c.email,
      Status: c.workflowState?.status,
      Workflow: c.workflowState?.workflowId,
      EmailsSent: c.workflowState?.emailsSent?.length || 0,
      Opens: c.emailEngagement?.opens || 0,
      Clicks: c.emailEngagement?.clicks || 0
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `email-workflows-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Render Statistics Cards
  const renderStats = () => (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid item xs={12} sm={6} md={4}>
        <Card elevation={3}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="textSecondary" gutterBottom variant="subtitle2">
                  Active Workflows
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#059669' }}>
                  {stats.totalActive}
                </Typography>
              </Box>
              <TrendingUpIcon sx={{ fontSize: 48, color: '#059669', opacity: 0.3 }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={4}>
        <Card elevation={3}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="textSecondary" gutterBottom variant="subtitle2">
                  Emails Sent
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e40af' }}>
                  {stats.emailsSent}
                </Typography>
              </Box>
              <EmailIcon sx={{ fontSize: 48, color: '#1e40af', opacity: 0.3 }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={4}>
        <Card elevation={3}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="textSecondary" gutterBottom variant="subtitle2">
                  Open / Click Rate
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#f59e0b' }}>
                  {stats.openRate}% / {stats.clickRate}%
                </Typography>
              </Box>
              <PeopleIcon sx={{ fontSize: 48, color: '#f59e0b', opacity: 0.3 }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // Render Filters
  const renderFilters = () => (
    <Paper sx={{ p: 2, mb: 3 }} elevation={2}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search by name or email..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status}
              label="Status"
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="paused">Paused</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Workflow</InputLabel>
            <Select
              value={filters.workflow}
              label="Workflow"
              onChange={(e) => setFilters({ ...filters, workflow: e.target.value })}
            >
              <MenuItem value="all">All Workflows</MenuItem>
              <MenuItem value="ai-receptionist">AI Receptionist</MenuItem>
              <MenuItem value="website-form">Website Form</MenuItem>
              <MenuItem value="manual">Manual Entry</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Box display="flex" gap={1}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadContacts}
            >
              Refresh
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={exportToCSV}
            >
              Export
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );

  // Render Contacts Table
  const renderContactsTable = () => (
    <TableContainer component={Paper} elevation={2}>
      <Table>
        <TableHead sx={{ bgcolor: '#f9fafb' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 700 }}>Contact</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Workflow</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Stage</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Emails</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Engagement</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Last Update</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {contacts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((contact) => (
            <TableRow key={contact.id} hover>
              <TableCell>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {contact.name || 'No Name'}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {contact.email}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Chip 
                  label={contact.workflowState?.workflowId || 'None'} 
                  size="small"
                  sx={{ textTransform: 'capitalize' }}
                />
              </TableCell>
              <TableCell>
                <Chip 
                  label={contact.workflowState?.status || 'None'}
                  color={getStatusColor(contact.workflowState?.status)}
                  size="small"
                  sx={{ textTransform: 'capitalize' }}
                />
              </TableCell>
              <TableCell>
                <Typography variant="caption">
                  {contact.workflowState?.currentStage || 'N/A'}
                </Typography>
              </TableCell>
              <TableCell>
                <Badge badgeContent={contact.workflowState?.emailsSent?.length || 0} color="primary">
                  <EmailIcon fontSize="small" />
                </Badge>
              </TableCell>
              <TableCell>
                <Box>
                  <Typography variant="caption" display="block">
                    Opens: {contact.emailEngagement?.opens || 0}
                  </Typography>
                  <Typography variant="caption" display="block">
                    Clicks: {contact.emailEngagement?.clicks || 0}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="caption">
                  {formatDate(contact.lastWorkflowUpdate)}
                </Typography>
              </TableCell>
              <TableCell>
                <Box display="flex" gap={0.5}>
                  {contact.workflowState?.status === 'active' ? (
                    <Tooltip title="Pause Workflow">
                      <IconButton 
                        size="small" 
                        color="warning"
                        onClick={() => handlePauseWorkflow(contact.id)}
                      >
                        <PauseIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Tooltip title="Resume Workflow">
                      <IconButton 
                        size="small" 
                        color="success"
                        onClick={() => handleResumeWorkflow(contact.id)}
                      >
                        <PlayIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  
                  <Tooltip title="Send Email">
                    <IconButton 
                      size="small" 
                      color="primary"
                      onClick={() => {
                        setSelectedContact(contact);
                        setSendEmailDialog(true);
                      }}
                    >
                      <EmailIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="View Timeline">
                    <IconButton size="small" color="info">
                      <TimelineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        component="div"
        count={contacts.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
      />
    </TableContainer>
  );

  // Render Send Email Dialog
  const renderSendEmailDialog = () => (
    <Dialog open={sendEmailDialog} onClose={() => setSendEmailDialog(false)} maxWidth="md" fullWidth>
      <DialogTitle>
        Send Email to {selectedContact?.name}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Subject"
            value={emailContent.subject}
            onChange={(e) => setEmailContent({ ...emailContent, subject: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Email Body"
            multiline
            rows={10}
            value={emailContent.body}
            onChange={(e) => setEmailContent({ ...emailContent, body: e.target.value })}
            placeholder="Enter HTML email content..."
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setSendEmailDialog(false)}>Cancel</Button>
        <Button variant="contained" onClick={handleSendEmail}>
          Send Email
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Main Render
  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Email Workflow Dashboard
        </Typography>
        <Chip 
          label={`${contacts.length} Total Contacts`}
          color="primary"
          icon={<PeopleIcon />}
        />
      </Box>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {renderStats()}
      {renderFilters()}
      {renderContactsTable()}
      {renderSendEmailDialog()}
    </Box>
  );
};

export default EmailWorkflowDashboard;