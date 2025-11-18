// ============================================
// CALENDAR & SCHEDULING HUB
// Path: /src/pages/scheduling/CalendarSchedulingHub.jsx
// ============================================
// Comprehensive appointment & scheduling system
// Google Calendar integration, team availability
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
  Badge,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Calendar,
  Clock,
  Users,
  Video,
  Phone,
  Mail,
  MapPin,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
  Upload,
  Bell,
  Settings,
  Repeat,
  AlertCircle,
  CheckCircle,
  XCircle,
  UserPlus,
  Link as LinkIcon,
  Copy,
  Send,
  Eye,
  TrendingUp,
  BarChart3,
  Activity,
  Target,
  Zap,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

// ============================================
// CONSTANTS & CONFIGURATION
// ============================================

const APPOINTMENT_TYPES = {
  consultation: {
    label: 'Free Consultation',
    duration: 30,
    color: '#3b82f6',
    icon: Users,
  },
  followup: {
    label: 'Follow-up Call',
    duration: 15,
    color: '#10b981',
    icon: Phone,
  },
  strategy: {
    label: 'Strategy Session',
    duration: 60,
    color: '#8b5cf6',
    icon: Target,
  },
  review: {
    label: 'Credit Review',
    duration: 45,
    color: '#f59e0b',
    icon: Activity,
  },
};

const APPOINTMENT_STATUSES = {
  scheduled: { label: 'Scheduled', color: '#3b82f6', icon: Clock },
  confirmed: { label: 'Confirmed', color: '#10b981', icon: CheckCircle },
  completed: { label: 'Completed', color: '#6b7280', icon: Check },
  cancelled: { label: 'Cancelled', color: '#ef4444', icon: XCircle },
  noshow: { label: 'No-Show', color: '#f59e0b', icon: AlertCircle },
};

const MEETING_PLATFORMS = {
  zoom: { label: 'Zoom', icon: Video, color: '#2d8cff' },
  teams: { label: 'Microsoft Teams', icon: Video, color: '#5b5fc7' },
  meet: { label: 'Google Meet', icon: Video, color: '#0f9d58' },
  phone: { label: 'Phone Call', icon: Phone, color: '#10b981' },
  inperson: { label: 'In-Person', icon: MapPin, color: '#f59e0b' },
};

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00',
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

// ============================================
// MAIN COMPONENT
// ============================================

const CalendarSchedulingHub = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);

  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // month, week, day
  const [appointments, setAppointments] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [availability, setAvailability] = useState({});
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // UI states
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);
  const [availabilityDialogOpen, setAvailabilityDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [filterTeamMember, setFilterTeamMember] = useState('all');

  // ============================================
  // DATA LOADING
  // ============================================

  useEffect(() => {
    loadAllData();
  }, [currentDate, filterTeamMember]);

  const loadAllData = async () => {
    console.log('📅 Loading calendar & scheduling data');
    setLoading(true);

    try {
      await Promise.all([
        loadAppointments(),
        loadTeamMembers(),
        loadAvailability(),
      ]);

      console.log('✅ Calendar data loaded');
    } catch (error) {
      console.error('❌ Error loading calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAppointments = async () => {
    try {
      // Get appointments for current month
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const apptRef = collection(db, 'appointments');
      let q = query(
        apptRef,
        where('scheduledFor', '>=', Timestamp.fromDate(startOfMonth)),
        where('scheduledFor', '<=', Timestamp.fromDate(endOfMonth)),
        orderBy('scheduledFor', 'asc')
      );

      // Filter by team member if selected
      if (filterTeamMember !== 'all') {
        q = query(q, where('assignedTo', '==', filterTeamMember));
      }

      const snapshot = await getDocs(q);
      const apptData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setAppointments(apptData);
    } catch (error) {
      console.error('❌ Error loading appointments:', error);
      setAppointments([]);
    }
  };

  const loadTeamMembers = async () => {
    try {
      const teamRef = collection(db, 'contacts');
      const q = query(
        teamRef,
        where('roles', 'array-contains-any', ['user', 'manager', 'admin'])
      );

      const snapshot = await getDocs(q);
      const teamData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setTeamMembers(teamData);
    } catch (error) {
      console.error('❌ Error loading team members:', error);
      setTeamMembers([]);
    }
  };

  const loadAvailability = async () => {
    try {
      const availRef = collection(db, 'availability');
      const snapshot = await getDocs(availRef);
      
      const availData = {};
      snapshot.docs.forEach(doc => {
        availData[doc.id] = doc.data();
      });

      setAvailability(availData);
    } catch (error) {
      console.error('❌ Error loading availability:', error);
      setAvailability({});
    }
  };

  // ============================================
  // AI SCHEDULING FUNCTIONS
  // ============================================

  const findOptimalTimeSlot = (date, duration, teamMemberId) => {
    console.log('🤖 Finding optimal time slot');

    try {
      // Get all appointments for the date
      const dateAppts = appointments.filter(appt => {
        const apptDate = appt.scheduledFor.toDate();
        return apptDate.toDateString() === date.toDateString() &&
               (!teamMemberId || appt.assignedTo === teamMemberId);
      });

      // Get team member availability
      const teamAvail = availability[teamMemberId] || {};
      const dayOfWeek = date.getDay();
      const dayAvail = teamAvail[DAYS_OF_WEEK[dayOfWeek]] || {
        enabled: true,
        start: '09:00',
        end: '17:00',
      };

      if (!dayAvail.enabled) {
        return null;
      }

      // Find available slots
      const availableSlots = [];
      
      TIME_SLOTS.forEach(timeSlot => {
        if (timeSlot < dayAvail.start || timeSlot >= dayAvail.end) {
          return;
        }

        // Check if slot is available
        const slotTime = new Date(date);
        const [hours, minutes] = timeSlot.split(':');
        slotTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        const slotEnd = new Date(slotTime);
        slotEnd.setMinutes(slotEnd.getMinutes() + duration);

        const hasConflict = dateAppts.some(appt => {
          const apptStart = appt.scheduledFor.toDate();
          const apptEnd = new Date(apptStart);
          apptEnd.setMinutes(apptEnd.getMinutes() + appt.duration);

          return (slotTime < apptEnd && slotEnd > apptStart);
        });

        if (!hasConflict) {
          availableSlots.push({
            time: timeSlot,
            datetime: slotTime,
            score: calculateSlotScore(slotTime, dateAppts),
          });
        }
      });

      // Sort by score and return best slot
      availableSlots.sort((a, b) => b.score - a.score);
      
      return availableSlots.length > 0 ? availableSlots[0] : null;

    } catch (error) {
      console.error('❌ Error finding optimal time slot:', error);
      return null;
    }
  };

  const calculateSlotScore = (slotTime, existingAppts) => {
    let score = 100;

    const hour = slotTime.getHours();
    
    // Prefer mid-morning and early afternoon
    if (hour >= 10 && hour <= 11) {
      score += 20; // Best time
    } else if (hour >= 14 && hour <= 15) {
      score += 15; // Good time
    } else if (hour === 9 || hour === 13 || hour === 16) {
      score += 10; // Okay time
    }

    // Prefer slots with buffer time before/after
    const hasBufferBefore = !existingAppts.some(appt => {
      const apptEnd = new Date(appt.scheduledFor.toDate());
      apptEnd.setMinutes(apptEnd.getMinutes() + appt.duration);
      const timeDiff = Math.abs(slotTime - apptEnd) / 60000; // minutes
      return timeDiff < 15;
    });

    if (hasBufferBefore) {
      score += 10;
    }

    return score;
  };

  const suggestReschedule = (appointment) => {
    console.log('🤖 Suggesting reschedule options');

    try {
      const suggestions = [];
      const currentDate = new Date(appointment.scheduledFor.toDate());

      // Try next 7 days
      for (let i = 1; i <= 7; i++) {
        const testDate = new Date(currentDate);
        testDate.setDate(testDate.getDate() + i);

        const optimalSlot = findOptimalTimeSlot(
          testDate,
          appointment.duration,
          appointment.assignedTo
        );

        if (optimalSlot) {
          suggestions.push({
            date: testDate,
            time: optimalSlot.time,
            datetime: optimalSlot.datetime,
            score: optimalSlot.score,
            dayLabel: DAYS_OF_WEEK[testDate.getDay()],
          });
        }

        if (suggestions.length >= 3) break;
      }

      return suggestions;

    } catch (error) {
      console.error('❌ Error suggesting reschedule:', error);
      return [];
    }
  };

  const predictNoShow = (appointment) => {
    // AI prediction of no-show risk based on historical data
    let riskScore = 0;
    let risk = 'low';

    // Check if appointment is confirmed
    if (appointment.status !== 'confirmed') {
      riskScore += 30;
    }

    // Check time until appointment
    const now = new Date();
    const apptTime = appointment.scheduledFor.toDate();
    const hoursUntil = (apptTime - now) / (1000 * 60 * 60);

    if (hoursUntil < 2) {
      riskScore += 20; // Last minute
    }

    // Check if first appointment
    if (appointment.isFirstAppointment) {
      riskScore += 25;
    }

    // Determine risk level
    if (riskScore >= 50) {
      risk = 'high';
    } else if (riskScore >= 30) {
      risk = 'medium';
    } else {
      risk = 'low';
    }

    return {
      risk,
      score: riskScore,
      recommendations: [
        risk === 'high' ? 'Send confirmation reminder ASAP' : null,
        risk === 'high' || risk === 'medium' ? 'Call to confirm' : null,
        'Send calendar invite',
      ].filter(Boolean),
    };
  };

  const optimizeSchedule = (date, teamMemberId) => {
    console.log('🤖 Optimizing schedule');

    try {
      const dateAppts = appointments.filter(appt => {
        const apptDate = appt.scheduledFor.toDate();
        return apptDate.toDateString() === date.toDateString() &&
               (!teamMemberId || appt.assignedTo === teamMemberId);
      });

      // Calculate metrics
      const totalAppointments = dateAppts.length;
      const totalDuration = dateAppts.reduce((sum, appt) => sum + appt.duration, 0);
      
      // Sort by time
      dateAppts.sort((a, b) => a.scheduledFor.toDate() - b.scheduledFor.toDate());

      // Find gaps
      const gaps = [];
      for (let i = 0; i < dateAppts.length - 1; i++) {
        const current = dateAppts[i];
        const next = dateAppts[i + 1];
        
        const currentEnd = new Date(current.scheduledFor.toDate());
        currentEnd.setMinutes(currentEnd.getMinutes() + current.duration);
        
        const nextStart = next.scheduledFor.toDate();
        const gapMinutes = (nextStart - currentEnd) / 60000;

        if (gapMinutes > 30) {
          gaps.push({
            start: currentEnd,
            end: nextStart,
            duration: gapMinutes,
          });
        }
      }

      // Calculate utilization
      const workDayMinutes = 8 * 60; // 8 hour workday
      const utilization = (totalDuration / workDayMinutes) * 100;

      return {
        totalAppointments,
        totalDuration,
        utilization: utilization.toFixed(0),
        gaps,
        efficiency: gaps.length === 0 ? 'excellent' : gaps.length <= 2 ? 'good' : 'needs improvement',
        recommendations: [
          utilization < 50 ? 'Schedule more appointments' : null,
          utilization > 90 ? 'Consider adding buffer time' : null,
          gaps.length > 3 ? 'Consolidate appointments to reduce gaps' : null,
        ].filter(Boolean),
      };

    } catch (error) {
      console.error('❌ Error optimizing schedule:', error);
      return null;
    }
  };

  // ============================================
  // APPOINTMENT HANDLERS
  // ============================================

  const handleCreateAppointment = async (appointmentData) => {
    console.log('📅 Creating appointment');

    try {
      const apptRef = doc(collection(db, 'appointments'));
      await setDoc(apptRef, {
        ...appointmentData,
        createdAt: serverTimestamp(),
        createdBy: currentUser.uid,
      });

      // Send confirmation email
      await sendAppointmentEmail(apptRef.id, 'created');

      await loadAppointments();
      setAppointmentDialogOpen(false);

      console.log('✅ Appointment created successfully');
    } catch (error) {
      console.error('❌ Error creating appointment:', error);
    }
  };

  const handleUpdateAppointment = async (appointmentId, updates) => {
    console.log('📅 Updating appointment');

    try {
      const apptRef = doc(db, 'appointments', appointmentId);
      await updateDoc(apptRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });

      await loadAppointments();

      console.log('✅ Appointment updated successfully');
    } catch (error) {
      console.error('❌ Error updating appointment:', error);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    console.log('❌ Cancelling appointment');

    try {
      const apptRef = doc(db, 'appointments', appointmentId);
      await updateDoc(apptRef, {
        status: 'cancelled',
        cancelledAt: serverTimestamp(),
      });

      // Send cancellation email
      await sendAppointmentEmail(appointmentId, 'cancelled');

      await loadAppointments();

      console.log('✅ Appointment cancelled successfully');
    } catch (error) {
      console.error('❌ Error cancelling appointment:', error);
    }
  };

  const sendAppointmentEmail = async (appointmentId, type) => {
    // Placeholder for email sending logic
    console.log(`📧 Sending ${type} email for appointment:`, appointmentId);
  };

  // ============================================
  // CALENDAR RENDERING
  // ============================================

  const renderMonthView = () => {
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    let currentDay = new Date(startDate);

    while (currentDay <= lastDay || days.length < 35) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }

    return (
      <Grid container spacing={1}>
        {/* Day headers */}
        {DAYS_OF_WEEK.map(day => (
          <Grid item xs={12/7} key={day}>
            <Typography variant="caption" className="font-semibold text-center block">
              {day.substring(0, 3)}
            </Typography>
          </Grid>
        ))}

        {/* Calendar days */}
        {days.map((day, index) => {
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          const isToday = day.toDateString() === new Date().toDateString();
          const dayAppts = appointments.filter(appt =>
            appt.scheduledFor.toDate().toDateString() === day.toDateString()
          );

          return (
            <Grid item xs={12/7} key={index}>
              <Paper
                elevation={isToday ? 3 : 1}
                className="p-2 min-h-[100px] cursor-pointer hover:shadow-lg transition-shadow"
                sx={{
                  opacity: isCurrentMonth ? 1 : 0.5,
                  borderTop: isToday ? '3px solid #3b82f6' : 'none',
                }}
                onClick={() => setSelectedDate(day)}
              >
                <Typography
                  variant="body2"
                  className={`font-semibold mb-2 ${isToday ? 'text-blue-600' : ''}`}
                >
                  {day.getDate()}
                </Typography>
                
                {dayAppts.slice(0, 3).map(appt => {
                  const typeConfig = APPOINTMENT_TYPES[appt.type];
                  return (
                    <Chip
                      key={appt.id}
                      label={appt.clientName}
                      size="small"
                      sx={{
                        width: '100%',
                        mb: 0.5,
                        fontSize: '0.65rem',
                        bgcolor: typeConfig?.color,
                        color: 'white',
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAppointment(appt);
                      }}
                    />
                  );
                })}
                
                {dayAppts.length > 3 && (
                  <Typography variant="caption" className="text-gray-600">
                    +{dayAppts.length - 3} more
                  </Typography>
                )}
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    );
  };

  // ============================================
  // TAB 1: CALENDAR VIEW
  // ============================================

  const renderCalendarTab = () => {
    const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    return (
      <Box className="space-y-4">
        {/* ===== CALENDAR CONTROLS ===== */}
        <Card elevation={2}>
          <CardContent>
            <Box className="flex items-center justify-between flex-wrap gap-4">
              <Box className="flex items-center gap-2">
                <IconButton onClick={() => {
                  const newDate = new Date(currentDate);
                  newDate.setMonth(newDate.getMonth() - 1);
                  setCurrentDate(newDate);
                }}>
                  <ChevronLeft />
                </IconButton>
                
                <Typography variant="h6" className="font-semibold">
                  {monthName}
                </Typography>
                
                <IconButton onClick={() => {
                  const newDate = new Date(currentDate);
                  newDate.setMonth(newDate.getMonth() + 1);
                  setCurrentDate(newDate);
                }}>
                  <ChevronRight />
                </IconButton>

                <Button size="small" onClick={() => setCurrentDate(new Date())}>
                  Today
                </Button>
              </Box>

              <Box className="flex items-center gap-2">
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Team Member</InputLabel>
                  <Select
                    value={filterTeamMember}
                    onChange={(e) => setFilterTeamMember(e.target.value)}
                    label="Team Member"
                  >
                    <MenuItem value="all">All Team</MenuItem>
                    {teamMembers.map(member => (
                      <MenuItem key={member.id} value={member.id}>
                        {member.firstName} {member.lastName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Button
                  variant="contained"
                  startIcon={<Plus />}
                  onClick={() => setAppointmentDialogOpen(true)}
                >
                  New Appointment
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* ===== CALENDAR GRID ===== */}
        <Card elevation={3}>
          <CardContent>
            {renderMonthView()}
          </CardContent>
        </Card>

        {/* ===== UPCOMING APPOINTMENTS ===== */}
        <Card elevation={3}>
          <CardContent>
            <Typography variant="h6" className="font-semibold mb-3">
              📅 Upcoming Appointments
            </Typography>
            <List>
              {appointments
                .filter(appt => appt.scheduledFor.toDate() >= new Date())
                .slice(0, 5)
                .map(appt => {
                  const typeConfig = APPOINTMENT_TYPES[appt.type];
                  const statusConfig = APPOINTMENT_STATUSES[appt.status];
                  const TypeIcon = typeConfig?.icon || Calendar;
                  
                  return (
                    <ListItem key={appt.id}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: typeConfig?.color }}>
                          <TypeIcon className="w-5 h-5" />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={appt.clientName}
                        secondary={
                          <>
                            {appt.scheduledFor.toDate().toLocaleString()}
                            {' • '}
                            {appt.duration} min
                            {' • '}
                            {typeConfig?.label}
                          </>
                        }
                      />
                      <Chip
                        label={statusConfig.label}
                        size="small"
                        sx={{ bgcolor: statusConfig.color, color: 'white' }}
                      />
                    </ListItem>
                  );
                })}
            </List>
          </CardContent>
        </Card>
      </Box>
    );
  };

  // ============================================
  // REMAINING TABS (SIMPLIFIED)
  // ============================================

  const renderAppointmentsTab = () => (
    <Card elevation={3}>
      <CardContent>
        <Typography variant="h6" className="font-semibold mb-4">
          📋 All Appointments
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Client</TableCell>
                <TableCell>Date & Time</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointments.slice(0, 20).map(appt => {
                const typeConfig = APPOINTMENT_TYPES[appt.type];
                const statusConfig = APPOINTMENT_STATUSES[appt.status];
                
                return (
                  <TableRow key={appt.id}>
                    <TableCell>{appt.clientName}</TableCell>
                    <TableCell>{appt.scheduledFor.toDate().toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip
                        label={typeConfig?.label}
                        size="small"
                        sx={{ bgcolor: typeConfig?.color, color: 'white' }}
                      />
                    </TableCell>
                    <TableCell>{appt.duration} min</TableCell>
                    <TableCell>
                      <Chip
                        label={statusConfig.label}
                        size="small"
                        sx={{ bgcolor: statusConfig.color, color: 'white' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box className="flex gap-1">
                        <IconButton size="small">
                          <Edit className="w-4 h-4" />
                        </IconButton>
                        <IconButton size="small">
                          <Trash2 className="w-4 h-4" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );

  const renderAvailabilityTab = () => (
    <Card elevation={3}>
      <CardContent>
        <Box className="flex items-center justify-between mb-4">
          <Typography variant="h6" className="font-semibold">
            ⏰ Team Availability
          </Typography>
          <Button
            variant="contained"
            startIcon={<Settings />}
            onClick={() => setAvailabilityDialogOpen(true)}
          >
            Configure
          </Button>
        </Box>
        <Grid container spacing={3}>
          {teamMembers.map(member => {
            const memberAvail = availability[member.id] || {};
            
            return (
              <Grid item xs={12} md={6} key={member.id}>
                <Card elevation={1}>
                  <CardContent>
                    <Box className="flex items-center gap-3 mb-3">
                      <Avatar>
                        {member.firstName?.[0]}{member.lastName?.[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" className="font-semibold">
                          {member.firstName} {member.lastName}
                        </Typography>
                        <Typography variant="caption" className="text-gray-600">
                          {member.role || 'Team Member'}
                        </Typography>
                      </Box>
                    </Box>
                    <List dense>
                      {DAYS_OF_WEEK.slice(1, 6).map(day => {
                        const dayAvail = memberAvail[day] || { enabled: false };
                        return (
                          <ListItem key={day}>
                            <ListItemText
                              primary={day}
                              secondary={
                                dayAvail.enabled ?
                                  `${dayAvail.start || '09:00'} - ${dayAvail.end || '17:00'}` :
                                  'Unavailable'
                              }
                            />
                            <Switch checked={dayAvail.enabled} size="small" />
                          </ListItem>
                        );
                      })}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </CardContent>
    </Card>
  );

  const renderAnalyticsTab = () => {
    // Calculate analytics
    const totalAppts = appointments.length;
    const completedAppts = appointments.filter(a => a.status === 'completed').length;
    const noShows = appointments.filter(a => a.status === 'noshow').length;
    const showRate = totalAppts > 0 ? ((totalAppts - noShows) / totalAppts * 100).toFixed(0) : 0;

    return (
      <Box className="space-y-6">
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="caption" className="text-gray-600">
                  Total Appointments
                </Typography>
                <Typography variant="h4" className="font-bold">
                  {totalAppts}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="caption" className="text-gray-600">
                  Completed
                </Typography>
                <Typography variant="h4" className="font-bold text-green-600">
                  {completedAppts}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="caption" className="text-gray-600">
                  No-Shows
                </Typography>
                <Typography variant="h4" className="font-bold text-red-600">
                  {noShows}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="caption" className="text-gray-600">
                  Show Rate
                </Typography>
                <Typography variant="h4" className="font-bold text-blue-600">
                  {showRate}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  };

  // ============================================
  // MAIN RENDER
  // ============================================

  if (loading) {
    return (
      <Box className="flex items-center justify-center h-screen">
        <Box className="text-center">
          <LinearProgress sx={{ width: 300, mb: 2 }} />
          <Typography variant="body2" className="text-gray-600">
            Loading calendar...
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
            Calendar & Scheduling
          </Typography>
          <Typography variant="body2" className="text-gray-600">
            Manage appointments, availability, and team schedules
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
            <Tab icon={<Calendar className="w-5 h-5" />} label="Calendar" />
            <Tab icon={<Clock className="w-5 h-5" />} label="Appointments" />
            <Tab icon={<Users className="w-5 h-5" />} label="Availability" />
            <Tab icon={<BarChart3 className="w-5 h-5" />} label="Analytics" />
          </Tabs>
        </Paper>

        {/* ===== TAB CONTENT ===== */}
        <Box>
          {activeTab === 0 && renderCalendarTab()}
          {activeTab === 1 && renderAppointmentsTab()}
          {activeTab === 2 && renderAvailabilityTab()}
          {activeTab === 3 && renderAnalyticsTab()}
        </Box>
      </Box>
    </Box>
  );
};

export default CalendarSchedulingHub;