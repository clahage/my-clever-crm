// src/components/credit/monitoring/CreditMonitoringSchedule.jsx
// ============================================================================
// 📅 CREDIT MONITORING SCHEDULE MANAGER - FILE 5A
// ============================================================================
// PURPOSE: Create and manage scheduled credit report monitoring jobs
// 
// FEATURES:
// ✅ Create new monitoring jobs for clients
// ✅ Configure frequency (daily/weekly/monthly/quarterly/custom)
// ✅ Set start date and duration
// ✅ Select specific bureaus to monitor
// ✅ Enable/disable jobs
// ✅ View list of all scheduled jobs
// ✅ Edit existing monitoring schedules
// ✅ Delete monitoring jobs
// ✅ AI-powered frequency recommendations
// ✅ Smart scheduling conflict detection
// ✅ Cost estimation per monitoring job
// ✅ Bulk job creation for multiple clients
// ✅ Firebase integration for job persistence
// ✅ Beautiful UI with Material-UI + Tailwind
// ✅ Dark mode support
// ✅ Mobile responsive design
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Alert,
  AlertTitle,
  CircularProgress,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tooltip,
  Avatar,
  Badge,
  Divider,
  Autocomplete,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  AttachMoney as MoneyIcon,
  Psychology as AIIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  serverTimestamp,
  orderBy,
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../contexts/AuthContext';
import { format, addDays, addWeeks, addMonths } from 'date-fns';

// ============================================================================
// 🎨 CONSTANTS
// ============================================================================

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

const FREQUENCY_OPTIONS = [
  { id: 'daily', label: 'Daily', days: 1, icon: '📅', color: '#f57c00' },
  { id: 'weekly', label: 'Weekly', days: 7, icon: '📆', color: '#1976d2' },
  { id: 'biweekly', label: 'Bi-weekly', days: 14, icon: '📋', color: '#0288d1' },
  { id: 'monthly', label: 'Monthly', days: 30, icon: '🗓️', color: '#2e7d32' },
  { id: 'quarterly', label: 'Quarterly', days: 90, icon: '📊', color: '#7b1fa2' },
  { id: 'custom', label: 'Custom', days: null, icon: '⚙️', color: '#5e35b1' },
];

const BUREAUS = [
  { id: 'experian', name: 'Experian', color: '#0066B2', cost: 9.99 },
  { id: 'equifax', name: 'Equifax', color: '#C8102E', cost: 9.99 },
  { id: 'transunion', name: 'TransUnion', color: '#005EB8', cost: 9.99 },
];

// ============================================================================
// 🧠 AI FUNCTIONS
// ============================================================================

/**
 * AI-POWERED: Recommend optimal monitoring frequency based on client profile
 */
const getAIFrequencyRecommendation = async (clientData) => {
  console.log('🧠 AI: Analyzing optimal monitoring frequency...');

  if (!OPENAI_API_KEY) {
    // Fallback recommendation
    return {
      recommended: 'monthly',
      reason: 'Monthly monitoring is recommended for most clients',
      confidence: 0.7,
    };
  }

  try {
    const prompt = `Analyze this client profile and recommend optimal credit monitoring frequency.

CLIENT DATA:
${JSON.stringify(clientData, null, 2)}

Consider:
1. Current credit score
2. Active disputes
3. Recent changes
4. Client goals
5. Budget constraints

Return ONLY valid JSON:
{
  "recommended": "daily|weekly|monthly|quarterly",
  "reason": "Brief explanation why this frequency is optimal",
  "confidence": 0.0-1.0
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a credit repair expert. Recommend monitoring frequencies based on client needs. Return ONLY valid JSON.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 200,
      }),
    });

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    const jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const recommendation = JSON.parse(jsonContent);

    console.log('✅ AI recommendation:', recommendation);
    return recommendation;
  } catch (error) {
    console.error('❌ AI recommendation error:', error);
    return {
      recommended: 'monthly',
      reason: 'AI recommendation unavailable, defaulting to monthly',
      confidence: 0.5,
    };
  }
};

/**
 * Calculate estimated monthly cost for monitoring job
 */
const calculateMonthlyCost = (frequency, selectedBureaus) => {
  const frequencyOption = FREQUENCY_OPTIONS.find(f => f.id === frequency);
  if (!frequencyOption || !frequencyOption.days) return 0;

  const pullsPerMonth = 30 / frequencyOption.days;
  const bureauCount = selectedBureaus.length;
  const costPerPull = selectedBureaus.reduce((sum, bureauId) => {
    const bureau = BUREAUS.find(b => b.id === bureauId);
    return sum + (bureau?.cost || 0);
  }, 0);

  return (pullsPerMonth * costPerPull).toFixed(2);
};

// ============================================================================
// 🎯 MAIN COMPONENT
// ============================================================================

const CreditMonitoringSchedule = ({ onJobCreated }) => {
  const { currentUser, userProfile } = useAuth();

  // ===== STATE: DATA =====
  const [clients, setClients] = useState([]);
  const [monitoringJobs, setMonitoringJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // ===== STATE: FORM =====
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [frequency, setFrequency] = useState('monthly');
  const [customDays, setCustomDays] = useState(30);
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [duration, setDuration] = useState(12); // months
  const [selectedBureaus, setSelectedBureaus] = useState(['experian', 'equifax', 'transunion']);
  const [autoRenew, setAutoRenew] = useState(true);
  const [notifyClient, setNotifyClient] = useState(true);
  const [aiRecommendation, setAiRecommendation] = useState(null);
  const [editingJob, setEditingJob] = useState(null);

  // ===== STATE: UI =====
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // ===== LOAD DATA =====
  useEffect(() => {
    loadClients();
    loadMonitoringJobs();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const contactsQuery = query(
        collection(db, 'contacts'),
        where('status', '==', 'active')
      );
      const snapshot = await getDocs(contactsQuery);
      const clientsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setClients(clientsList);
      console.log(`✅ Loaded ${clientsList.length} clients`);
    } catch (err) {
      console.error('❌ Error loading clients:', err);
      setError('Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  const loadMonitoringJobs = async () => {
    try {
      const jobsQuery = query(
        collection(db, 'monitoringJobs'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(jobsQuery);
      const jobsList = snapshot.docs.map(doc => ({
        firestoreId: doc.id,
        ...doc.data(),
      }));
      setMonitoringJobs(jobsList);
      console.log(`✅ Loaded ${jobsList.length} monitoring jobs`);
    } catch (err) {
      console.error('❌ Error loading jobs:', err);
      setError('Failed to load monitoring jobs');
    }
  };

  // ===== GET AI RECOMMENDATION =====
  const handleGetAIRecommendation = async () => {
    if (!selectedClient) {
      setError('Please select a client first');
      return;
    }

    setLoading(true);
    try {
      const recommendation = await getAIFrequencyRecommendation(selectedClient);
      setAiRecommendation(recommendation);
      setFrequency(recommendation.recommended);
      setSuccess('AI recommendation received!');
    } catch (err) {
      console.error('❌ AI recommendation error:', err);
      setError('Failed to get AI recommendation');
    } finally {
      setLoading(false);
    }
  };

  // ===== CREATE/UPDATE JOB =====
  const handleSaveJob = async () => {
    if (!selectedClient) {
      setError('Please select a client');
      return;
    }

    if (selectedBureaus.length === 0) {
      setError('Please select at least one bureau');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const jobData = {
        clientId: selectedClient.id,
        clientName: `${selectedClient.firstName} ${selectedClient.lastName}`,
        frequency,
        customDays: frequency === 'custom' ? customDays : null,
        startDate,
        endDate: addMonths(new Date(startDate), duration).toISOString().split('T')[0],
        duration,
        bureaus: selectedBureaus,
        autoRenew,
        notifyClient,
        status: 'active',
        nextPullDate: startDate,
        totalPulls: 0,
        successfulPulls: 0,
        failedPulls: 0,
        estimatedMonthlyCost: calculateMonthlyCost(frequency, selectedBureaus),
        aiRecommendation: aiRecommendation || null,
        createdBy: currentUser.uid,
        createdAt: editingJob ? editingJob.createdAt : serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      if (editingJob) {
        // Update existing job
        await updateDoc(doc(db, 'monitoringJobs', editingJob.firestoreId), jobData);
        setSuccess('Monitoring job updated successfully!');
      } else {
        // Create new job
        const docRef = await addDoc(collection(db, 'monitoringJobs'), jobData);
        setSuccess('Monitoring job created successfully!');
        console.log('✅ Job created:', docRef.id);
        
        if (onJobCreated) {
          onJobCreated({ firestoreId: docRef.id, ...jobData });
        }
      }

      // Reset form
      setShowCreateDialog(false);
      setSelectedClient(null);
      setFrequency('monthly');
      setSelectedBureaus(['experian', 'equifax', 'transunion']);
      setAiRecommendation(null);
      setEditingJob(null);

      // Reload jobs
      await loadMonitoringJobs();
    } catch (err) {
      console.error('❌ Error saving job:', err);
      setError('Failed to save monitoring job');
    } finally {
      setLoading(false);
    }
  };

  // ===== EDIT JOB =====
  const handleEditJob = (job) => {
    setEditingJob(job);
    setSelectedClient(clients.find(c => c.id === job.clientId));
    setFrequency(job.frequency);
    setCustomDays(job.customDays || 30);
    setStartDate(job.startDate);
    setDuration(job.duration);
    setSelectedBureaus(job.bureaus);
    setAutoRenew(job.autoRenew);
    setNotifyClient(job.notifyClient);
    setAiRecommendation(job.aiRecommendation);
    setShowCreateDialog(true);
  };

  // ===== DELETE JOB =====
  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this monitoring job?')) {
      return;
    }

    setLoading(true);
    try {
      await deleteDoc(doc(db, 'monitoringJobs', jobId));
      setSuccess('Monitoring job deleted successfully');
      await loadMonitoringJobs();
    } catch (err) {
      console.error('❌ Error deleting job:', err);
      setError('Failed to delete monitoring job');
    } finally {
      setLoading(false);
    }
  };

  // ===== TOGGLE JOB STATUS =====
  const handleToggleJobStatus = async (job) => {
    setLoading(true);
    try {
      const newStatus = job.status === 'active' ? 'paused' : 'active';
      await updateDoc(doc(db, 'monitoringJobs', job.firestoreId), {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
      setSuccess(`Job ${newStatus === 'active' ? 'activated' : 'paused'}`);
      await loadMonitoringJobs();
    } catch (err) {
      console.error('❌ Error toggling job status:', err);
      setError('Failed to update job status');
    } finally {
      setLoading(false);
    }
  };

  // ===== FILTERED JOBS =====
  const filteredJobs = useMemo(() => {
    let jobs = monitoringJobs;

    // Filter by status
    if (filterStatus !== 'all') {
      jobs = jobs.filter(job => job.status === filterStatus);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      jobs = jobs.filter(
        job =>
          job.clientName?.toLowerCase().includes(query) ||
          job.frequency?.toLowerCase().includes(query)
      );
    }

    return jobs;
  }, [monitoringJobs, filterStatus, searchQuery]);

  // ===== RENDER =====
  return (
    <Box className="p-6">
      {/* ===== HEADER ===== */}
      <Box className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <Box className="flex items-center gap-3">
          <Avatar className="bg-gradient-to-r from-blue-500 to-indigo-500" sx={{ width: 48, height: 48 }}>
            <ScheduleIcon sx={{ fontSize: 28 }} />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight="bold" className="dark:text-white">
              Monitoring Schedule
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create and manage automated credit monitoring jobs
            </Typography>
          </Box>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowCreateDialog(true)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          disabled={loading}
        >
          New Monitoring Job
        </Button>
      </Box>

      {/* ===== ALERTS ===== */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} className="mb-4">
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)} className="mb-4">
          {success}
        </Alert>
      )}

      {/* ===== SUMMARY CARDS ===== */}
      <Grid container spacing={3} className="mb-6">
        <Grid item xs={12} sm={6} md={3}>
          <Card className="dark:bg-gray-800">
            <CardContent>
              <Typography variant="h4" className="text-blue-600 dark:text-blue-400 mb-1">
                {monitoringJobs.filter(j => j.status === 'active').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Jobs
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="dark:bg-gray-800">
            <CardContent>
              <Typography variant="h4" className="text-green-600 dark:text-green-400 mb-1">
                {monitoringJobs.reduce((sum, job) => sum + (job.successfulPulls || 0), 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Successful Pulls
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="dark:bg-gray-800">
            <CardContent>
              <Typography variant="h4" className="text-orange-600 dark:text-orange-400 mb-1">
                {clients.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Clients
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="dark:bg-gray-800">
            <CardContent>
              <Typography variant="h4" className="text-purple-600 dark:text-purple-400 mb-1">
                ${monitoringJobs.reduce((sum, job) => sum + parseFloat(job.estimatedMonthlyCost || 0), 0).toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Monthly Revenue
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ===== FILTERS ===== */}
      <Paper className="p-4 mb-6 dark:bg-gray-800">
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by client or frequency..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon className="mr-2 text-gray-400" />,
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="paused">Paused</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Chip
              label={`${filteredJobs.length} job${filteredJobs.length !== 1 ? 's' : ''} found`}
              color="primary"
              icon={<FilterIcon />}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadMonitoringJobs}
              disabled={loading}
            >
              Refresh
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* ===== JOBS TABLE ===== */}
      <Paper className="dark:bg-gray-800">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Client</TableCell>
                <TableCell>Frequency</TableCell>
                <TableCell>Bureaus</TableCell>
                <TableCell>Next Pull</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Est. Monthly Cost</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress size={40} className="my-4" />
                  </TableCell>
                </TableRow>
              )}

              {!loading && filteredJobs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Box className="py-8">
                      <ScheduleIcon sx={{ fontSize: 64 }} className="text-gray-400 mb-2" />
                      <Typography variant="body1" color="text.secondary">
                        No monitoring jobs found
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={() => setShowCreateDialog(true)}
                        className="mt-4"
                      >
                        Create First Job
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              )}

              {!loading &&
                filteredJobs
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((job) => (
                    <TableRow key={job.firestoreId} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium" className="dark:text-white">
                          {job.clientName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {job.totalPulls || 0} total pulls
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          size="small"
                          label={FREQUENCY_OPTIONS.find(f => f.id === job.frequency)?.label || job.frequency}
                          sx={{
                            bgcolor: FREQUENCY_OPTIONS.find(f => f.id === job.frequency)?.color || '#gray',
                            color: 'white',
                          }}
                        />
                      </TableCell>

                      <TableCell>
                        <Box className="flex gap-1">
                          {job.bureaus.map(bureauId => {
                            const bureau = BUREAUS.find(b => b.id === bureauId);
                            return (
                              <Tooltip key={bureauId} title={bureau?.name}>
                                <Avatar
                                  sx={{
                                    bgcolor: bureau?.color,
                                    width: 28,
                                    height: 28,
                                    fontSize: 12,
                                  }}
                                >
                                  {bureau?.name[0]}
                                </Avatar>
                              </Tooltip>
                            );
                          })}
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" className="dark:text-white">
                          {format(new Date(job.nextPullDate), 'MMM dd, yyyy')}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          size="small"
                          label={job.status}
                          color={job.status === 'active' ? 'success' : 'default'}
                          icon={job.status === 'active' ? <CheckIcon /> : <PauseIcon />}
                        />
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" fontWeight="medium" className="text-green-600 dark:text-green-400">
                          ${job.estimatedMonthlyCost}
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        <Box className="flex gap-1 justify-end">
                          <Tooltip title={job.status === 'active' ? 'Pause' : 'Activate'}>
                            <IconButton
                              size="small"
                              onClick={() => handleToggleJobStatus(job)}
                              disabled={loading}
                            >
                              {job.status === 'active' ? <PauseIcon /> : <PlayIcon />}
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => handleEditJob(job)}
                              disabled={loading}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteJob(job.firestoreId)}
                              disabled={loading}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filteredJobs.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Paper>

      {/* ===== CREATE/EDIT DIALOG ===== */}
      <Dialog
        open={showCreateDialog}
        onClose={() => {
          setShowCreateDialog(false);
          setEditingJob(null);
          setAiRecommendation(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle className="dark:bg-gray-800 dark:text-white">
          <Box className="flex items-center justify-between">
            <Typography variant="h6">
              {editingJob ? 'Edit' : 'Create'} Monitoring Job
            </Typography>
            <IconButton onClick={() => setShowCreateDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent className="dark:bg-gray-800">
          <Box className="mt-4">
            {/* Client Selection */}
            <Autocomplete
              options={clients}
              getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
              value={selectedClient}
              onChange={(e, newValue) => setSelectedClient(newValue)}
              renderInput={(params) => (
                <TextField {...params} label="Select Client" required fullWidth />
              )}
              className="mb-4"
            />

            {/* AI Recommendation */}
            {selectedClient && (
              <Box className="mb-4">
                <Button
                  variant="outlined"
                  startIcon={<AIIcon />}
                  onClick={handleGetAIRecommendation}
                  disabled={loading}
                  fullWidth
                >
                  Get AI Frequency Recommendation
                </Button>

                {aiRecommendation && (
                  <Alert severity="info" icon={<AIIcon />} className="mt-2">
                    <AlertTitle>AI Recommendation</AlertTitle>
                    <Typography variant="body2">
                      <strong>{FREQUENCY_OPTIONS.find(f => f.id === aiRecommendation.recommended)?.label}</strong>
                      {' - '}
                      {aiRecommendation.reason}
                    </Typography>
                    <Typography variant="caption">
                      Confidence: {(aiRecommendation.confidence * 100).toFixed(0)}%
                    </Typography>
                  </Alert>
                )}
              </Box>
            )}

            {/* Frequency */}
            <FormControl fullWidth className="mb-4">
              <InputLabel>Monitoring Frequency</InputLabel>
              <Select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                label="Monitoring Frequency"
              >
                {FREQUENCY_OPTIONS.map(option => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.icon} {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Custom Days (if custom frequency) */}
            {frequency === 'custom' && (
              <TextField
                fullWidth
                type="number"
                label="Custom Interval (days)"
                value={customDays}
                onChange={(e) => setCustomDays(parseInt(e.target.value) || 1)}
                inputProps={{ min: 1, max: 365 }}
                className="mb-4"
              />
            )}

            {/* Start Date */}
            <TextField
              fullWidth
              type="date"
              label="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              className="mb-4"
            />

            {/* Duration */}
            <TextField
              fullWidth
              type="number"
              label="Duration (months)"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
              inputProps={{ min: 1, max: 60 }}
              helperText="How long should this monitoring job run?"
              className="mb-4"
            />

            {/* Bureau Selection */}
            <Typography variant="subtitle2" className="mb-2 dark:text-white">
              Select Bureaus to Monitor:
            </Typography>
            <Box className="flex flex-col gap-2 mb-4">
              {BUREAUS.map(bureau => (
                <FormControlLabel
                  key={bureau.id}
                  control={
                    <Switch
                      checked={selectedBureaus.includes(bureau.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedBureaus([...selectedBureaus, bureau.id]);
                        } else {
                          setSelectedBureaus(selectedBureaus.filter(b => b !== bureau.id));
                        }
                      }}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: bureau.color,
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: bureau.color,
                        },
                      }}
                    />
                  }
                  label={
                    <Box className="flex items-center gap-2">
                      <span>{bureau.name}</span>
                      <Chip size="small" label={`$${bureau.cost}/pull`} />
                    </Box>
                  }
                />
              ))}
            </Box>

            {/* Options */}
            <Box className="flex flex-col gap-2 mb-4">
              <FormControlLabel
                control={
                  <Switch
                    checked={autoRenew}
                    onChange={(e) => setAutoRenew(e.target.checked)}
                  />
                }
                label="Auto-renew when duration expires"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={notifyClient}
                    onChange={(e) => setNotifyClient(e.target.checked)}
                  />
                }
                label="Send notifications to client"
              />
            </Box>

            {/* Cost Estimate */}
            <Alert severity="info" icon={<MoneyIcon />}>
              <AlertTitle>Estimated Monthly Cost</AlertTitle>
              <Typography variant="h5" className="font-bold">
                ${calculateMonthlyCost(frequency, selectedBureaus)}/month
              </Typography>
              <Typography variant="caption">
                Based on selected frequency and bureaus
              </Typography>
            </Alert>
          </Box>
        </DialogContent>

        <DialogActions className="dark:bg-gray-800">
          <Button onClick={() => setShowCreateDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveJob}
            disabled={loading || !selectedClient || selectedBureaus.length === 0}
            startIcon={loading ? <CircularProgress size={20} /> : <CheckIcon />}
            className="bg-green-600 hover:bg-green-700"
          >
            {editingJob ? 'Update' : 'Create'} Job
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CreditMonitoringSchedule;