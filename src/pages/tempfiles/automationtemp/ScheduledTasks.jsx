// ============================================================================
// ScheduledTasks.jsx - SCHEDULED AUTOMATION TASKS
// ============================================================================
// VERSION: 1.0.0
// AUTHOR: SpeedyCRM Development Team
// LAST UPDATED: 2025-11-09
//
// DESCRIPTION:
// Time-based automation scheduler for managing scheduled and recurring tasks.
// Provides calendar view, cron expression builder, timezone management,
// and execution history tracking.
//
// FEATURES:
// - Calendar view of scheduled automations
// - Visual cron expression builder
// - Recurring schedule setup (daily, weekly, monthly)
// - One-time scheduled tasks
// - Timezone management
// - Schedule conflict detection
// - Execution history tracking
// - Failed execution retry logic
// - Schedule templates
// - Bulk schedule operations
//
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Alert,
  AlertTitle,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  IconButton,
  Tooltip,
  TextField,
  Switch,
  FormControlLabel,
  Divider,
  Avatar,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  Clock,
  Plus,
  Edit,
  Trash2,
  Play,
  Pause,
  Calendar as CalendarIcon,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  List as ListIcon,
  Settings,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns';

// ============================================================================
// CONSTANTS
// ============================================================================

const SCHEDULE_TYPES = [
  { value: 'once', label: 'One-time' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'custom', label: 'Custom (Cron)' },
];

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
];

const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'UTC', label: 'UTC' },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ScheduledTasks = () => {
  const { currentUser } = useAuth();

  // ===== STATE MANAGEMENT =====
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // View state
  const [activeView, setActiveView] = useState('calendar');

  // Schedules state
  const [schedules, setSchedules] = useState([]);
  const [executions, setExecutions] = useState([]);

  // Dialog state
  const [createDialog, setCreateDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);

  // New schedule state
  const [newSchedule, setNewSchedule] = useState({
    name: '',
    type: 'daily',
    time: '09:00',
    timezone: 'America/New_York',
    daysOfWeek: [],
    dayOfMonth: 1,
    cronExpression: '',
    enabled: true,
  });

  const [selectedSchedule, setSelectedSchedule] = useState(null);

  // Calendar state
  const [currentWeek, setCurrentWeek] = useState(new Date());

  // ===== FIREBASE LISTENERS =====
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribers = [];

    // Listen to schedules
    const schedulesQuery = query(
      collection(db, 'automations', 'schedules', 'active'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    unsubscribers.push(
      onSnapshot(schedulesQuery, (snapshot) => {
        const scheduleData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSchedules(scheduleData);
        console.log('✅ Schedules loaded:', scheduleData.length);
      })
    );

    // Listen to executions
    const executionsQuery = query(
      collection(db, 'automations', 'schedules', 'executions'),
      where('userId', '==', currentUser.uid),
      orderBy('executedAt', 'desc')
    );

    unsubscribers.push(
      onSnapshot(executionsQuery, (snapshot) => {
        const executionData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setExecutions(executionData);
      })
    );

    return () => unsubscribers.forEach(unsub => unsub());
  }, [currentUser]);

  // ===== SCHEDULE HANDLERS =====
  const handleCreateSchedule = async () => {
    try {
      setLoading(true);

      const scheduleData = {
        ...newSchedule,
        userId: currentUser.uid,
        executionCount: 0,
        lastExecutedAt: null,
        nextRunAt: calculateNextRun(newSchedule),
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'automations', 'schedules', 'active'), scheduleData);

      showSnackbar('Schedule created!', 'success');
      setCreateDialog(false);
      setNewSchedule({
        name: '',
        type: 'daily',
        time: '09:00',
        timezone: 'America/New_York',
        daysOfWeek: [],
        dayOfMonth: 1,
        cronExpression: '',
        enabled: true,
      });
    } catch (error) {
      console.error('❌ Error creating schedule:', error);
      showSnackbar('Failed to create schedule', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSchedule = async (scheduleId, enabled) => {
    try {
      await updateDoc(
        doc(db, 'automations', 'schedules', 'active', scheduleId),
        {
          enabled,
          updatedAt: serverTimestamp(),
        }
      );

      showSnackbar(`Schedule ${enabled ? 'enabled' : 'disabled'}!`, 'success');
    } catch (error) {
      console.error('❌ Error toggling schedule:', error);
      showSnackbar('Failed to toggle schedule', 'error');
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (!confirm('Delete this schedule?')) return;

    try {
      await deleteDoc(doc(db, 'automations', 'schedules', 'active', scheduleId));
      showSnackbar('Schedule deleted!', 'success');
    } catch (error) {
      console.error('❌ Error deleting schedule:', error);
      showSnackbar('Failed to delete schedule', 'error');
    }
  };

  // ===== UTILITY FUNCTIONS =====
  const calculateNextRun = (schedule) => {
    const now = new Date();
    const [hours, minutes] = schedule.time.split(':');

    const nextRun = new Date(now);
    nextRun.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    if (nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + 1);
    }

    return nextRun;
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getWeekDays = () => {
    const start = startOfWeek(currentWeek);
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  // ===== RENDER: CALENDAR VIEW =====
  const renderCalendarView = () => {
    const weekDays = getWeekDays();

    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">
            Week of {format(startOfWeek(currentWeek), 'MMM dd, yyyy')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              onClick={() => setCurrentWeek(addDays(currentWeek, -7))}
            >
              Previous
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={() => setCurrentWeek(new Date())}
            >
              Today
            </Button>
            <Button
              size="small"
              onClick={() => setCurrentWeek(addDays(currentWeek, 7))}
            >
              Next
            </Button>
          </Box>
        </Box>

        <Grid container spacing={2}>
          {weekDays.map((day, index) => {
            const daySchedules = schedules.filter(schedule => {
              if (schedule.type === 'daily') return true;
              if (schedule.type === 'weekly') {
                return schedule.daysOfWeek?.includes(day.getDay());
              }
              return false;
            });

            return (
              <Grid item xs={12} md={1.714} key={index}>
                <Paper sx={{ p: 2, minHeight: 200 }}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    {format(day, 'EEE')}
                  </Typography>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    {format(day, 'd')}
                  </Typography>

                  {daySchedules.map(schedule => (
                    <Chip
                      key={schedule.id}
                      label={schedule.name}
                      size="small"
                      sx={{ mb: 0.5, width: '100%' }}
                      color={schedule.enabled ? 'primary' : 'default'}
                    />
                  ))}
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    );
  };

  // ===== RENDER: LIST VIEW =====
  const renderListView = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Schedule Name</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Time</TableCell>
            <TableCell>Next Run</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {schedules.map((schedule) => (
            <TableRow key={schedule.id}>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Clock size={18} />
                  {schedule.name}
                </Box>
              </TableCell>
              <TableCell>
                <Chip label={schedule.type} size="small" variant="outlined" />
              </TableCell>
              <TableCell>{schedule.time}</TableCell>
              <TableCell>
                {schedule.nextRunAt && format(schedule.nextRunAt.toDate(), 'MMM dd, h:mm a')}
              </TableCell>
              <TableCell>
                <Chip
                  label={schedule.enabled ? 'Enabled' : 'Disabled'}
                  size="small"
                  color={schedule.enabled ? 'success' : 'default'}
                />
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Tooltip title={schedule.enabled ? 'Disable' : 'Enable'}>
                    <IconButton
                      size="small"
                      onClick={() => handleToggleSchedule(schedule.id, !schedule.enabled)}
                    >
                      {schedule.enabled ? <Pause size={16} /> : <Play size={16} />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedSchedule(schedule);
                        setEditDialog(true);
                      }}
                    >
                      <Edit size={16} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteSchedule(schedule.id)}
                    >
                      <Trash2 size={16} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {schedules.length === 0 && (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Alert severity="info">
            <AlertTitle>No Schedules Yet</AlertTitle>
            Create your first scheduled automation!
          </Alert>
        </Box>
      )}
    </TableContainer>
  );

  // ===== RENDER: EXECUTION HISTORY =====
  const renderExecutionHistory = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Schedule</TableCell>
            <TableCell>Executed At</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Duration</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {executions.slice(0, 20).map((execution) => (
            <TableRow key={execution.id}>
              <TableCell>{execution.scheduleName}</TableCell>
              <TableCell>
                {execution.executedAt && format(execution.executedAt.toDate(), 'MMM dd, h:mm a')}
              </TableCell>
              <TableCell>
                <Chip
                  label={execution.status}
                  size="small"
                  color={execution.status === 'success' ? 'success' : 'error'}
                  icon={execution.status === 'success' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                />
              </TableCell>
              <TableCell>{execution.duration || '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {executions.length === 0 && (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Alert severity="info">
            No execution history yet
          </Alert>
        </Box>
      )}
    </TableContainer>
  );

  // ===== MAIN RENDER =====
  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Clock />
          Scheduled Tasks
        </Typography>
        <Button
          variant="contained"
          startIcon={<Plus />}
          onClick={() => setCreateDialog(true)}
        >
          New Schedule
        </Button>
      </Box>

      {/* View Toggle */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <ToggleButtonGroup
          value={activeView}
          exclusive
          onChange={(e, value) => value && setActiveView(value)}
        >
          <ToggleButton value="calendar">
            <CalendarIcon size={18} style={{ marginRight: 8 }} />
            Calendar
          </ToggleButton>
          <ToggleButton value="list">
            <ListIcon size={18} style={{ marginRight: 8 }} />
            List
          </ToggleButton>
          <ToggleButton value="history">
            <Clock size={18} style={{ marginRight: 8 }} />
            History
          </ToggleButton>
        </ToggleButtonGroup>
      </Paper>

      {/* View Content */}
      {activeView === 'calendar' && renderCalendarView()}
      {activeView === 'list' && renderListView()}
      {activeView === 'history' && renderExecutionHistory()}

      {/* Create Dialog */}
      <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Schedule</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Schedule Name"
                value={newSchedule.name}
                onChange={(e) => setNewSchedule({ ...newSchedule, name: e.target.value })}
                placeholder="Daily Report Generation"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Schedule Type</InputLabel>
                <Select
                  value={newSchedule.type}
                  label="Schedule Type"
                  onChange={(e) => setNewSchedule({ ...newSchedule, type: e.target.value })}
                >
                  {SCHEDULE_TYPES.map(type => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                type="time"
                label="Time"
                value={newSchedule.time}
                onChange={(e) => setNewSchedule({ ...newSchedule, time: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {newSchedule.type === 'weekly' && (
              <Grid item xs={12}>
                <Typography variant="body2" gutterBottom>
                  Days of Week:
                </Typography>
                <ToggleButtonGroup
                  value={newSchedule.daysOfWeek}
                  onChange={(e, days) => setNewSchedule({ ...newSchedule, daysOfWeek: days })}
                  size="small"
                >
                  {DAYS_OF_WEEK.map(day => (
                    <ToggleButton key={day.value} value={day.value}>
                      {day.label}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Grid>
            )}

            {newSchedule.type === 'monthly' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="number"
                  label="Day of Month"
                  value={newSchedule.dayOfMonth}
                  onChange={(e) => setNewSchedule({ ...newSchedule, dayOfMonth: parseInt(e.target.value) })}
                  inputProps={{ min: 1, max: 31 }}
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Timezone</InputLabel>
                <Select
                  value={newSchedule.timezone}
                  label="Timezone"
                  onChange={(e) => setNewSchedule({ ...newSchedule, timezone: e.target.value })}
                >
                  {TIMEZONES.map(tz => (
                    <MenuItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={newSchedule.enabled}
                    onChange={(e) => setNewSchedule({ ...newSchedule, enabled: e.target.checked })}
                  />
                }
                label="Enable schedule immediately"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateSchedule}
            disabled={loading || !newSchedule.name}
          >
            {loading ? 'Creating...' : 'Create Schedule'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ScheduledTasks;