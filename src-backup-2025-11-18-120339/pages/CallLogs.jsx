// src/pages/CallLogs.jsx - Call Logging & Tracking System
import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, TextField, Grid, Dialog, DialogTitle,
  DialogContent, DialogActions, Chip, Alert, Snackbar, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TablePagination, Card,
  CardContent, FormControl, InputLabel, Select, MenuItem, IconButton, Stack,
  Autocomplete, Rating
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, PhoneOff, Edit, Trash2,
  Plus, Search, Clock, User, MessageSquare, CheckCircle, XCircle, Calendar,
  TrendingUp, Activity, AlertCircle
} from 'lucide-react';
import { 
  collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs,
  serverTimestamp, orderBy
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { format, differenceInMinutes, differenceInSeconds } from 'date-fns';

const CallLogs = () => {
  const { currentUser } = useAuth();
  const [calls, setCalls] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCall, setSelectedCall] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const [callForm, setCallForm] = useState({
    contact: null,
    type: 'outgoing', // outgoing, incoming, missed
    duration: 0, // in seconds
    startTime: new Date(),
    endTime: null,
    outcome: 'completed', // completed, no_answer, busy, voicemail, failed
    notes: '',
    followUpRequired: false,
    followUpDate: null,
    rating: 0, // 1-5 stars
    tags: []
  });

  const [statistics, setStatistics] = useState({
    totalCalls: 0,
    totalDuration: 0,
    avgDuration: 0,
    outgoingCalls: 0,
    incomingCalls: 0,
    missedCalls: 0
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  const callTypes = {
    outgoing: { icon: PhoneOutgoing, label: 'Outgoing', color: '#3B82F6' },
    incoming: { icon: PhoneIncoming, label: 'Incoming', color: '#10B981' },
    missed: { icon: PhoneMissed, label: 'Missed', color: '#EF4444' }
  };

  const outcomes = [
    'completed',
    'no_answer',
    'busy',
    'voicemail',
    'wrong_number',
    'failed'
  ];

  const callTags = [
    'Sales Call',
    'Follow-up',
    'Support',
    'Complaint',
    'Consultation',
    'Payment Discussion',
    'Progress Update',
    'Onboarding',
    'Cancellation',
    'General Inquiry'
  ];

  // Load calls
  const loadCalls = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'callLogs'),
        where('userId', '==', currentUser.uid),
        orderBy('startTime', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const callsData = [];
      
      querySnapshot.forEach((doc) => {
        callsData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setCalls(callsData);
      calculateStatistics(callsData);
    } catch (error) {
      console.error('Error loading calls:', error);
      showSnackbar('Error loading call logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Load contacts
  const loadContacts = async () => {
    try {
      const q = query(
        collection(db, 'contacts'),
        where('userId', '==', currentUser.uid)
      );
      
      const querySnapshot = await getDocs(q);
      const contactsData = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        contactsData.push({
          id: doc.id,
          ...data,
          displayName: data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim()
        });
      });
      
      setContacts(contactsData);
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadCalls();
      loadContacts();
    }
  }, [currentUser]);

  // Calculate statistics
  const calculateStatistics = (callsData) => {
    const stats = {
      totalCalls: callsData.length,
      totalDuration: 0,
      avgDuration: 0,
      outgoingCalls: 0,
      incomingCalls: 0,
      missedCalls: 0
    };

    callsData.forEach(call => {
      stats.totalDuration += call.duration || 0;
      
      if (call.type === 'outgoing') stats.outgoingCalls++;
      else if (call.type === 'incoming') stats.incomingCalls++;
      else if (call.type === 'missed') stats.missedCalls++;
    });

    if (stats.totalCalls > 0) {
      stats.avgDuration = stats.totalDuration / stats.totalCalls;
    }

    setStatistics(stats);
  };

  // Format duration
  const formatDuration = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  // Calculate duration from start/end times
  const calculateDuration = (startTime, endTime) => {
    if (!endTime) return 0;
    return differenceInSeconds(new Date(endTime), new Date(startTime));
  };

  // Create/Update call log
  const handleSaveCall = async () => {
    if (!callForm.contact) {
      showSnackbar('Please select a contact', 'warning');
      return;
    }

    setLoading(true);
    try {
      const callData = {
        ...callForm,
        userId: currentUser.uid,
        duration: callForm.endTime ? 
          calculateDuration(callForm.startTime, callForm.endTime) : 
          callForm.duration,
        updatedAt: serverTimestamp()
      };

      if (selectedCall?.id) {
        await updateDoc(doc(db, 'callLogs', selectedCall.id), callData);
        showSnackbar('Call log updated successfully', 'success');
      } else {
        await addDoc(collection(db, 'callLogs'), {
          ...callData,
          createdAt: serverTimestamp()
        });
        showSnackbar('Call log created successfully', 'success');
      }

      setDialogOpen(false);
      resetForm();
      loadCalls();
    } catch (error) {
      console.error('Error saving call log:', error);
      showSnackbar('Error saving call log', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Delete call log
  const handleDelete = async (callId) => {
    if (!window.confirm('Are you sure you want to delete this call log?')) return;

    try {
      await deleteDoc(doc(db, 'callLogs', callId));
      showSnackbar('Call log deleted', 'success');
      loadCalls();
    } catch (error) {
      console.error('Error deleting call log:', error);
      showSnackbar('Error deleting call log', 'error');
    }
  };

  // Reset form
  const resetForm = () => {
    setCallForm({
      contact: null,
      type: 'outgoing',
      duration: 0,
      startTime: new Date(),
      endTime: null,
      outcome: 'completed',
      notes: '',
      followUpRequired: false,
      followUpDate: null,
      rating: 0,
      tags: []
    });
    setSelectedCall(null);
  };

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  // Get outcome color
  const getOutcomeColor = (outcome) => {
    switch (outcome) {
      case 'completed': return 'success';
      case 'voicemail': return 'info';
      case 'no_answer':
      case 'busy': return 'warning';
      case 'failed':
      case 'wrong_number': return 'error';
      default: return 'default';
    }
  };

  // Filter calls
  const filteredCalls = calls.filter(call => {
    if (filterType !== 'all' && call.type !== filterType) return false;
    
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        call.contact?.displayName?.toLowerCase().includes(search) ||
        call.notes?.toLowerCase().includes(search)
      );
    }
    
    return true;
  });

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight={600}>
              Call Logs
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Track and manage phone call activity
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Plus size={20} />}
            onClick={() => {
              resetForm();
              setDialogOpen(true);
            }}
          >
            Log Call
          </Button>
        </Box>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Total Calls</Typography>
                    <Typography variant="h4" fontWeight={600}>
                      {statistics.totalCalls}
                    </Typography>
                  </Box>
                  <Phone size={24} color="#3B82F6" />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Outgoing</Typography>
                    <Typography variant="h4" fontWeight={600} color="primary.main">
                      {statistics.outgoingCalls}
                    </Typography>
                  </Box>
                  <PhoneOutgoing size={24} color="#3B82F6" />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Incoming</Typography>
                    <Typography variant="h4" fontWeight={600} color="success.main">
                      {statistics.incomingCalls}
                    </Typography>
                  </Box>
                  <PhoneIncoming size={24} color="#10B981" />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Avg Duration</Typography>
                    <Typography variant="h4" fontWeight={600}>
                      {formatDuration(Math.round(statistics.avgDuration))}
                    </Typography>
                  </Box>
                  <Clock size={24} color="#F59E0B" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search calls..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search size={18} style={{ marginRight: 8 }} />
                }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <MenuItem value="all">All Calls</MenuItem>
                  <MenuItem value="outgoing">Outgoing</MenuItem>
                  <MenuItem value="incoming">Incoming</MenuItem>
                  <MenuItem value="missed">Missed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Calls Table */}
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Date & Time</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Outcome</TableCell>
                  <TableCell>Notes</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCalls
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((call) => {
                    const TypeIcon = callTypes[call.type]?.icon || Phone;
                    
                    return (
                      <TableRow key={call.id}>
                        <TableCell>
                          <Chip
                            icon={<TypeIcon size={14} />}
                            label={callTypes[call.type]?.label}
                            size="small"
                            sx={{ backgroundColor: `${callTypes[call.type]?.color}20` }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {call.contact?.displayName || 'Unknown'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {call.contact?.phone}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {call.startTime && format(
                            call.startTime.toDate ? call.startTime.toDate() : new Date(call.startTime),
                            'MM/dd/yyyy h:mm a'
                          )}
                        </TableCell>
                        <TableCell>
                          {formatDuration(call.duration || 0)}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={call.outcome}
                            size="small"
                            color={getOutcomeColor(call.outcome)}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography 
                            variant="body2"
                            sx={{ 
                              maxWidth: 200,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {call.notes || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedCall(call);
                                setCallForm(call);
                                setDialogOpen(true);
                              }}
                            >
                              <Edit size={16} />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDelete(call.id)}
                            >
                              <Trash2 size={16} />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredCalls.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </Paper>

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {selectedCall ? 'Edit Call Log' : 'Log Call'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Autocomplete
                  options={contacts}
                  getOptionLabel={(option) => option.displayName || ''}
                  value={callForm.contact}
                  onChange={(e, value) => setCallForm(prev => ({ ...prev, contact: value }))}
                  renderInput={(params) => (
                    <TextField {...params} label="Contact *" fullWidth />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Call Type</InputLabel>
                  <Select
                    value={callForm.type}
                    onChange={(e) => setCallForm(prev => ({ ...prev, type: e.target.value }))}
                  >
                    {Object.entries(callTypes).map(([key, { label }]) => (
                      <MenuItem key={key} value={key}>{label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Outcome</InputLabel>
                  <Select
                    value={callForm.outcome}
                    onChange={(e) => setCallForm(prev => ({ ...prev, outcome: e.target.value }))}
                  >
                    {outcomes.map(outcome => (
                      <MenuItem key={outcome} value={outcome}>
                        {outcome.replace('_', ' ').toUpperCase()}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <DateTimePicker
                  label="Start Time"
                  value={callForm.startTime}
                  onChange={(date) => setCallForm(prev => ({ ...prev, startTime: date }))}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <DateTimePicker
                  label="End Time (Optional)"
                  value={callForm.endTime}
                  onChange={(date) => setCallForm(prev => ({ ...prev, endTime: date }))}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>

              {!callForm.endTime && (
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Duration (seconds)"
                    type="number"
                    fullWidth
                    value={callForm.duration}
                    onChange={(e) => setCallForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                  />
                </Grid>
              )}

              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Call Rating
                </Typography>
                <Rating
                  value={callForm.rating}
                  onChange={(e, value) => setCallForm(prev => ({ ...prev, rating: value || 0 }))}
                />
              </Grid>

              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  options={callTags}
                  value={callForm.tags}
                  onChange={(e, value) => setCallForm(prev => ({ ...prev, tags: value }))}
                  renderInput={(params) => (
                    <TextField {...params} label="Tags" placeholder="Add tags" />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Notes"
                  multiline
                  rows={4}
                  fullWidth
                  value={callForm.notes}
                  onChange={(e) => setCallForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="What was discussed..."
                />
              </Grid>

              <Grid item xs={12}>
                <Stack direction="row" spacing={2}>
                  <FormControl component="fieldset">
                    <Typography variant="subtitle2">Follow-up Required?</Typography>
                    <Button
                      variant={callForm.followUpRequired ? 'contained' : 'outlined'}
                      size="small"
                      onClick={() => setCallForm(prev => ({ ...prev, followUpRequired: !prev.followUpRequired }))}
                    >
                      {callForm.followUpRequired ? 'Yes' : 'No'}
                    </Button>
                  </FormControl>

                  {callForm.followUpRequired && (
                    <DateTimePicker
                      label="Follow-up Date"
                      value={callForm.followUpDate}
                      onChange={(date) => setCallForm(prev => ({ ...prev, followUpDate: date }))}
                      renderInput={(params) => <TextField {...params} />}
                    />
                  )}
                </Stack>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSaveCall} disabled={loading}>
              {selectedCall ? 'Update' : 'Save'} Call
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          <Alert severity={snackbar.severity}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
};

export default CallLogs;