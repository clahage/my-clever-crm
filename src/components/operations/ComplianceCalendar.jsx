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
  FormControlLabel,
  Switch,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Tooltip,
  Divider,
  useTheme
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Add as AddIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  Gavel as GavelIcon,
  School as TrainingIcon,
  Assignment as AuditIcon,
  Description as FilingIcon,
  Repeat as RecurringIcon,
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
  Today as TodayIcon
} from '@mui/icons-material';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

const EVENT_TYPES = [
  { value: 'deadline', label: 'Deadline', icon: ScheduleIcon, color: 'error' },
  { value: 'review', label: 'Review', icon: CheckIcon, color: 'primary' },
  { value: 'training', label: 'Training', icon: TrainingIcon, color: 'info' },
  { value: 'filing', label: 'Filing', icon: FilingIcon, color: 'warning' },
  { value: 'audit', label: 'Audit', icon: AuditIcon, color: 'secondary' }
];

const REGULATIONS = [
  { value: 'FCRA', label: 'Fair Credit Reporting Act', description: 'Credit bureau dispute timelines' },
  { value: 'CROA', label: 'Credit Repair Organizations Act', description: 'Client agreements and disclosures' },
  { value: 'FDCPA', label: 'Fair Debt Collection Practices Act', description: 'Debt collection communications' },
  { value: 'state-specific', label: 'State Regulations', description: 'State licensing and bonding' }
];

const RECURRENCE_PATTERNS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annually', label: 'Annually' }
];

const STATUS_CONFIG = {
  upcoming: { color: 'info', icon: ScheduleIcon, label: 'Upcoming' },
  due: { color: 'warning', icon: WarningIcon, label: 'Due' },
  overdue: { color: 'error', icon: ErrorIcon, label: 'Overdue' },
  completed: { color: 'success', icon: CheckIcon, label: 'Completed' }
};

function EventCard({ event, onComplete, onView }) {
  const theme = useTheme();
  const eventType = EVENT_TYPES.find(t => t.value === event.eventType);
  const status = STATUS_CONFIG[event.status] || STATUS_CONFIG.upcoming;
  const Icon = eventType?.icon || ScheduleIcon;
  const StatusIcon = status.icon;

  const dueDate = event.dueDate?.toDate?.() || new Date(event.dueDate);
  const isToday = new Date().toDateString() === dueDate.toDateString();

  return (
    <Card
      sx={{
        borderLeft: 4,
        borderColor: `${status.color}.main`,
        cursor: 'pointer',
        '&:hover': { boxShadow: theme.shadows[4] }
      }}
      onClick={() => onView(event)}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 36, height: 36, bgcolor: `${eventType?.color || 'grey'}.100` }}>
              <Icon sx={{ color: `${eventType?.color || 'grey'}.main`, fontSize: 20 }} />
            </Avatar>
            <Box>
              <Typography variant="subtitle2" fontWeight="bold">
                {event.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {eventType?.label}
              </Typography>
            </Box>
          </Box>
          <Chip
            size="small"
            icon={<StatusIcon sx={{ fontSize: 14 }} />}
            label={status.label}
            color={status.color}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
          {event.regulation && (
            <Chip
              size="small"
              label={event.regulation}
              variant="outlined"
              icon={<GavelIcon sx={{ fontSize: 14 }} />}
            />
          )}
          {event.recurring && (
            <Chip
              size="small"
              label={event.recurrencePattern}
              variant="outlined"
              icon={<RecurringIcon sx={{ fontSize: 14 }} />}
            />
          )}
          {isToday && (
            <Chip size="small" label="TODAY" color="error" />
          )}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <Typography variant="caption" color={event.status === 'overdue' ? 'error' : 'text.secondary'}>
            <ScheduleIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
            {dueDate.toLocaleDateString()}
          </Typography>
          {event.status !== 'completed' && (
            <Button
              size="small"
              color="success"
              startIcon={<CheckIcon />}
              onClick={(e) => {
                e.stopPropagation();
                onComplete(event.id);
              }}
            >
              Complete
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

function CreateEventDialog({ open, onClose, onCreate }) {
  const [event, setEvent] = useState({
    title: '',
    description: '',
    eventType: 'deadline',
    dueDate: '',
    regulation: '',
    priority: 'medium',
    recurring: false,
    recurrencePattern: 'monthly'
  });
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!event.title || !event.dueDate) return;
    setLoading(true);
    await onCreate(event);
    setLoading(false);
    setEvent({
      title: '',
      description: '',
      eventType: 'deadline',
      dueDate: '',
      regulation: '',
      priority: 'medium',
      recurring: false,
      recurrencePattern: 'monthly'
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create Compliance Event</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Event Title"
              value={event.title}
              onChange={(e) => setEvent({ ...event, title: e.target.value })}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Description"
              value={event.description}
              onChange={(e) => setEvent({ ...event, description: e.target.value })}
            />
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Event Type</InputLabel>
              <Select
                value={event.eventType}
                label="Event Type"
                onChange={(e) => setEvent({ ...event, eventType: e.target.value })}
              >
                {EVENT_TYPES.map(type => (
                  <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              type="date"
              label="Due Date"
              value={event.dueDate}
              onChange={(e) => setEvent({ ...event, dueDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Regulation</InputLabel>
              <Select
                value={event.regulation}
                label="Regulation"
                onChange={(e) => setEvent({ ...event, regulation: e.target.value })}
              >
                <MenuItem value="">None</MenuItem>
                {REGULATIONS.map(reg => (
                  <MenuItem key={reg.value} value={reg.value}>
                    <Box>
                      <Typography variant="body2">{reg.label}</Typography>
                      <Typography variant="caption" color="text.secondary">{reg.description}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={event.recurring}
                  onChange={(e) => setEvent({ ...event, recurring: e.target.checked })}
                />
              }
              label="Recurring Event"
            />
          </Grid>
          {event.recurring && (
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Recurrence Pattern</InputLabel>
                <Select
                  value={event.recurrencePattern}
                  label="Recurrence Pattern"
                  onChange={(e) => setEvent({ ...event, recurrencePattern: e.target.value })}
                >
                  {RECURRENCE_PATTERNS.map(pattern => (
                    <MenuItem key={pattern.value} value={pattern.value}>{pattern.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleCreate}
          disabled={loading || !event.title || !event.dueDate}
          startIcon={loading ? <CircularProgress size={16} /> : <AddIcon />}
        >
          Create Event
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function ComplianceCalendar() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadEvents();
    loadAlerts();
  }, [currentMonth, statusFilter]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

      const getCalendar = httpsCallable(functions, 'getComplianceCalendar');
      const result = await getCalendar({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        status: statusFilter || undefined
      });
      setEvents(result.data.events || []);
    } catch (err) {
      console.error('Error loading events:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAlerts = async () => {
    // Would load compliance alerts - for demo using static
    setAlerts([]);
  };

  const createEvent = async (eventData) => {
    try {
      const createFn = httpsCallable(functions, 'createComplianceEvent');
      await createFn(eventData);
      loadEvents();
    } catch (err) {
      console.error('Error creating event:', err);
    }
  };

  const completeEvent = async (eventId) => {
    try {
      const completeFn = httpsCallable(functions, 'completeComplianceEvent');
      await completeFn({ eventId });
      loadEvents();
    } catch (err) {
      console.error('Error completing event:', err);
    }
  };

  const initializeCalendar = async () => {
    try {
      const initFn = httpsCallable(functions, 'initializeComplianceCalendar');
      await initFn({});
      loadEvents();
    } catch (err) {
      console.error('Error initializing calendar:', err);
    }
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentMonth(newDate);
  };

  const eventStats = {
    upcoming: events.filter(e => e.status === 'upcoming').length,
    due: events.filter(e => e.status === 'due').length,
    overdue: events.filter(e => e.status === 'overdue').length,
    completed: events.filter(e => e.status === 'completed').length
  };

  const groupedEvents = {
    overdue: events.filter(e => e.status === 'overdue'),
    due: events.filter(e => e.status === 'due'),
    upcoming: events.filter(e => e.status === 'upcoming'),
    completed: events.filter(e => e.status === 'completed')
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Compliance Calendar
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track FCRA, CROA, and other regulatory deadlines
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={initializeCalendar}
          >
            Initialize Standard Events
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateOpen(true)}
          >
            New Event
          </Button>
        </Box>
      </Box>

      {/* Alerts */}
      {eventStats.overdue > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight="bold">
            {eventStats.overdue} Overdue Compliance Items!
          </Typography>
          <Typography variant="body2">
            Immediate attention required to maintain compliance.
          </Typography>
        </Alert>
      )}

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <Paper
            sx={{
              p: 2,
              textAlign: 'center',
              bgcolor: 'error.50',
              cursor: 'pointer',
              border: statusFilter === 'overdue' ? 2 : 0,
              borderColor: 'error.main'
            }}
            onClick={() => setStatusFilter(statusFilter === 'overdue' ? '' : 'overdue')}
          >
            <ErrorIcon sx={{ color: 'error.main', mb: 1 }} />
            <Typography variant="h4" fontWeight="bold" color="error.main">
              {eventStats.overdue}
            </Typography>
            <Typography variant="body2">Overdue</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} md={3}>
          <Paper
            sx={{
              p: 2,
              textAlign: 'center',
              bgcolor: 'warning.50',
              cursor: 'pointer',
              border: statusFilter === 'due' ? 2 : 0,
              borderColor: 'warning.main'
            }}
            onClick={() => setStatusFilter(statusFilter === 'due' ? '' : 'due')}
          >
            <WarningIcon sx={{ color: 'warning.main', mb: 1 }} />
            <Typography variant="h4" fontWeight="bold" color="warning.main">
              {eventStats.due}
            </Typography>
            <Typography variant="body2">Due Now</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} md={3}>
          <Paper
            sx={{
              p: 2,
              textAlign: 'center',
              bgcolor: 'info.50',
              cursor: 'pointer',
              border: statusFilter === 'upcoming' ? 2 : 0,
              borderColor: 'info.main'
            }}
            onClick={() => setStatusFilter(statusFilter === 'upcoming' ? '' : 'upcoming')}
          >
            <ScheduleIcon sx={{ color: 'info.main', mb: 1 }} />
            <Typography variant="h4" fontWeight="bold" color="info.main">
              {eventStats.upcoming}
            </Typography>
            <Typography variant="body2">Upcoming</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} md={3}>
          <Paper
            sx={{
              p: 2,
              textAlign: 'center',
              bgcolor: 'success.50',
              cursor: 'pointer',
              border: statusFilter === 'completed' ? 2 : 0,
              borderColor: 'success.main'
            }}
            onClick={() => setStatusFilter(statusFilter === 'completed' ? '' : 'completed')}
          >
            <CheckIcon sx={{ color: 'success.main', mb: 1 }} />
            <Typography variant="h4" fontWeight="bold" color="success.main">
              {eventStats.completed}
            </Typography>
            <Typography variant="body2">Completed</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Month Navigation */}
      <Paper sx={{ p: 2, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <IconButton onClick={() => navigateMonth(-1)}>
          <PrevIcon />
        </IconButton>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6" fontWeight="bold">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Typography>
          <Button
            size="small"
            startIcon={<TodayIcon />}
            onClick={() => setCurrentMonth(new Date())}
          >
            Today
          </Button>
        </Box>
        <IconButton onClick={() => navigateMonth(1)}>
          <NextIcon />
        </IconButton>
      </Paper>

      {/* Events List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Overdue & Due */}
          {(groupedEvents.overdue.length > 0 || groupedEvents.due.length > 0) && (
            <Grid item xs={12} md={6}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: 'error.main' }}>
                ⚠️ Requires Attention
              </Typography>
              {[...groupedEvents.overdue, ...groupedEvents.due].map(event => (
                <Box key={event.id} sx={{ mb: 2 }}>
                  <EventCard
                    event={event}
                    onComplete={completeEvent}
                    onView={setSelectedEvent}
                  />
                </Box>
              ))}
            </Grid>
          )}

          {/* Upcoming */}
          <Grid item xs={12} md={groupedEvents.overdue.length > 0 || groupedEvents.due.length > 0 ? 6 : 12}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              📅 Upcoming Events
            </Typography>
            <Grid container spacing={2}>
              {groupedEvents.upcoming.map(event => (
                <Grid item xs={12} md={groupedEvents.overdue.length > 0 ? 12 : 6} key={event.id}>
                  <EventCard
                    event={event}
                    onComplete={completeEvent}
                    onView={setSelectedEvent}
                  />
                </Grid>
              ))}
            </Grid>
            {groupedEvents.upcoming.length === 0 && (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <CalendarIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                <Typography color="text.secondary">
                  No upcoming events this month
                </Typography>
              </Paper>
            )}
          </Grid>
        </Grid>
      )}

      {/* Regulation Quick Reference */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          📚 Compliance Quick Reference
        </Typography>
        <Grid container spacing={2}>
          {REGULATIONS.map(reg => (
            <Grid item xs={12} md={6} lg={3} key={reg.value}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    {reg.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {reg.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Create Event Dialog */}
      <CreateEventDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={createEvent}
      />
    </Box>
  );
}
