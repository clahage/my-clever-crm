// Path: /src/pages/hubs/clients/AppointmentsTab.jsx
// ============================================================================
// CLIENTS HUB - APPOINTMENTS TAB
// ============================================================================
// Purpose: Scheduling and calendar management for client appointments
// Version: 1.0.0
// Last Updated: 2025-12-10
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  Menu,
  Paper,
  Avatar,
  LinearProgress
} from '@mui/material';
import {
  Calendar,
  Clock,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Video,
  MapPin,
  Phone,
  User,
  MoreVertical,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../contexts/AuthContext';

const AppointmentsTab = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month');
  const [clients, setClients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [formData, setFormData] = useState({
    clientId: '',
    title: '',
    type: 'consultation',
    date: '',
    time: '',
    duration: 60,
    location: '',
    notes: '',
    status: 'scheduled'
  });

  useEffect(() => {
    const q = query(collection(db, 'clients'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const clientsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setClients(clientsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);

    const q = query(
      collection(db, 'appointments'),
      where('date', '>=', Timestamp.fromDate(startOfMonth)),
      where('date', '<=', Timestamp.fromDate(endOfMonth)),
      orderBy('date', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const appointmentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAppointments(appointmentsData);
    });

    return () => unsubscribe();
  }, [currentDate]);

  const handleAddAppointment = () => {
    setSelectedAppointment(null);
    setFormData({
      clientId: '',
      title: '',
      type: 'consultation',
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      duration: 60,
      location: '',
      notes: '',
      status: 'scheduled'
    });
    setDialogOpen(true);
  };

  const handleEditAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    const appointmentDate = appointment.date?.toDate();
    setFormData({
      clientId: appointment.clientId || '',
      title: appointment.title || '',
      type: appointment.type || 'consultation',
      date: appointmentDate ? appointmentDate.toISOString().split('T')[0] : '',
      time: appointmentDate ? appointmentDate.toTimeString().slice(0, 5) : '',
      duration: appointment.duration || 60,
      location: appointment.location || '',
      notes: appointment.notes || '',
      status: appointment.status || 'scheduled'
    });
    setDialogOpen(true);
    handleMenuClose();
  };

  const handleSaveAppointment = async () => {
    try {
      const dateTime = new Date(`${formData.date}T${formData.time}`);
      const client = clients.find(c => c.id === formData.clientId);

      const appointmentData = {
        ...formData,
        clientName: client?.name || 'Unknown Client',
        clientEmail: client?.email || '',
        date: Timestamp.fromDate(dateTime),
        updatedAt: serverTimestamp(),
        updatedBy: userProfile?.email
      };

      if (selectedAppointment) {
        await updateDoc(doc(db, 'appointments', selectedAppointment.id), appointmentData);
        setSnackbar({
          open: true,
          message: 'Appointment updated successfully',
          severity: 'success'
        });
      } else {
        await addDoc(collection(db, 'appointments'), {
          ...appointmentData,
          createdAt: serverTimestamp(),
          createdBy: userProfile?.email
        });
        setSnackbar({
          open: true,
          message: 'Appointment created successfully',
          severity: 'success'
        });
      }

      setDialogOpen(false);
      setSelectedAppointment(null);
    } catch (error) {
      console.error('Error saving appointment:', error);
      setSnackbar({
        open: true,
        message: 'Error saving appointment',
        severity: 'error'
      });
    }
  };

  const handleDeleteAppointment = async () => {
    try {
      await deleteDoc(doc(db, 'appointments', selectedAppointment.id));
      setSnackbar({
        open: true,
        message: 'Appointment deleted successfully',
        severity: 'success'
      });
      setDeleteDialogOpen(false);
      setSelectedAppointment(null);
    } catch (error) {
      console.error('Error deleting appointment:', error);
      setSnackbar({
        open: true,
        message: 'Error deleting appointment',
        severity: 'error'
      });
    }
  };

  const handleMenuOpen = (event, appointment) => {
    setAnchorEl(event.currentTarget);
    setSelectedAppointment(appointment);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const navigateMonth = (direction) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const getAppointmentsForDay = (day) => {
    if (!day) return [];
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return appointments.filter(apt => {
      const aptDate = apt.date?.toDate();
      return (
        aptDate &&
        aptDate.getDate() === targetDate.getDate() &&
        aptDate.getMonth() === targetDate.getMonth() &&
        aptDate.getFullYear() === targetDate.getFullYear()
      );
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'primary';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'no-show':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled':
        return <Clock size={16} />;
      case 'completed':
        return <CheckCircle size={16} />;
      case 'cancelled':
        return <XCircle size={16} />;
      case 'no-show':
        return <AlertCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'video':
        return <Video size={16} />;
      case 'in-person':
        return <MapPin size={16} />;
      case 'phone':
        return <Phone size={16} />;
      default:
        return <Calendar size={16} />;
    }
  };

  const upcomingAppointments = appointments
    .filter(apt => apt.date?.toDate() >= new Date() && apt.status === 'scheduled')
    .slice(0, 5);

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header Actions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton onClick={() => navigateMonth(-1)} size="small">
                  <ChevronLeft />
                </IconButton>
                <Typography variant="h6" sx={{ fontWeight: 600, minWidth: 200, textAlign: 'center' }}>
                  {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </Typography>
                <IconButton onClick={() => navigateMonth(1)} size="small">
                  <ChevronRight />
                </IconButton>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setCurrentDate(new Date())}
                >
                  Today
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<Plus size={18} />}
                onClick={handleAddAppointment}
              >
                New Appointment
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Calendar View */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <Box
                    key={day}
                    sx={{
                      p: 1,
                      textAlign: 'center',
                      fontWeight: 600,
                      borderBottom: 1,
                      borderColor: 'divider'
                    }}
                  >
                    {day}
                  </Box>
                ))}

                {getDaysInMonth().map((day, index) => {
                  const dayAppointments = getAppointmentsForDay(day);
                  const isToday =
                    day &&
                    day === new Date().getDate() &&
                    currentDate.getMonth() === new Date().getMonth() &&
                    currentDate.getFullYear() === new Date().getFullYear();

                  return (
                    <Paper
                      key={index}
                      variant="outlined"
                      sx={{
                        p: 1,
                        minHeight: 100,
                        bgcolor: day ? (isToday ? 'primary.50' : 'background.paper') : 'grey.50',
                        border: isToday ? 2 : 1,
                        borderColor: isToday ? 'primary.main' : 'divider'
                      }}
                    >
                      {day && (
                        <>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: isToday ? 600 : 400,
                              color: isToday ? 'primary.main' : 'text.primary',
                              mb: 0.5
                            }}
                          >
                            {day}
                          </Typography>
                          {dayAppointments.slice(0, 2).map((apt) => (
                            <Chip
                              key={apt.id}
                              label={apt.title}
                              size="small"
                              color={getStatusColor(apt.status)}
                              onClick={(e) => handleMenuOpen(e, apt)}
                              sx={{
                                width: '100%',
                                mb: 0.5,
                                height: 20,
                                fontSize: '0.65rem',
                                cursor: 'pointer'
                              }}
                            />
                          ))}
                          {dayAppointments.length > 2 && (
                            <Typography variant="caption" color="text.secondary">
                              +{dayAppointments.length - 2} more
                            </Typography>
                          )}
                        </>
                      )}
                    </Paper>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming Appointments */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Upcoming Appointments
              </Typography>
              <List>
                {upcomingAppointments.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Calendar size={48} color="#999" style={{ marginBottom: 16 }} />
                    <Typography variant="body2" color="text.secondary">
                      No upcoming appointments
                    </Typography>
                  </Box>
                ) : (
                  upcomingAppointments.map((appointment, index) => (
                    <React.Fragment key={appointment.id}>
                      {index > 0 && <Divider />}
                      <ListItem
                        secondaryAction={
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={(e) => handleMenuOpen(e, appointment)}
                          >
                            <MoreVertical size={18} />
                          </IconButton>
                        }
                      >
                        <ListItemIcon>
                          <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                            {getTypeIcon(appointment.type)}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={appointment.title}
                          secondary={
                            <Box>
                              <Typography variant="caption" display="block">
                                {appointment.clientName}
                              </Typography>
                              <Typography variant="caption" display="block">
                                {appointment.date?.toDate().toLocaleDateString()} at{' '}
                                {appointment.date?.toDate().toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </Typography>
                              <Chip
                                label={appointment.type}
                                size="small"
                                sx={{ mt: 0.5, height: 18, textTransform: 'capitalize' }}
                              />
                            </Box>
                          }
                        />
                      </ListItem>
                    </React.Fragment>
                  ))
                )}
              </List>
            </CardContent>
          </Card>

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Statistics
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Total Appointments"
                    secondary={appointments.length}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Scheduled"
                    secondary={appointments.filter(a => a.status === 'scheduled').length}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Completed"
                    secondary={appointments.filter(a => a.status === 'completed').length}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Cancelled"
                    secondary={appointments.filter(a => a.status === 'cancelled').length}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Context Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => handleEditAppointment(selectedAppointment)}>
          <Edit size={16} style={{ marginRight: 8 }} />
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            setDeleteDialogOpen(true);
            handleMenuClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Trash2 size={16} style={{ marginRight: 8 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedAppointment ? 'Edit Appointment' : 'New Appointment'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Client</InputLabel>
                <Select
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  label="Client"
                >
                  {clients.map((client) => (
                    <MenuItem key={client.id} value={client.id}>
                      {client.name} - {client.email}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Initial Consultation"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  label="Type"
                >
                  <MenuItem value="consultation">Consultation</MenuItem>
                  <MenuItem value="follow-up">Follow-up</MenuItem>
                  <MenuItem value="review">Review</MenuItem>
                  <MenuItem value="video">Video Call</MenuItem>
                  <MenuItem value="phone">Phone Call</MenuItem>
                  <MenuItem value="in-person">In-Person</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  label="Status"
                >
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                  <MenuItem value="no-show">No Show</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                type="date"
                label="Date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                type="time"
                label="Time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Duration</InputLabel>
                <Select
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  label="Duration"
                >
                  <MenuItem value={15}>15 minutes</MenuItem>
                  <MenuItem value={30}>30 minutes</MenuItem>
                  <MenuItem value={60}>1 hour</MenuItem>
                  <MenuItem value={90}>1.5 hours</MenuItem>
                  <MenuItem value={120}>2 hours</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location/Meeting Link"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Office address or video meeting link"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveAppointment} variant="contained">
            {selectedAppointment ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this appointment? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteAppointment} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

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
  );
};

export default AppointmentsTab;
