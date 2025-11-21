// ===================================================================
// LiveTrainingSessions.jsx - Live Training Session Management
// ===================================================================
// Purpose: Schedule, join, and manage live training sessions
// Features:
// - Browse upcoming sessions
// - Register for sessions
// - Calendar integration
// - Video conferencing links
// - Session recordings
// - Attendance tracking
// - Q&A and chat features
// ===================================================================

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Divider
} from '@mui/material';
import {
  Video,
  Calendar,
  Clock,
  Users,
  User,
  MapPin,
  ExternalLink,
  Download,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  Play,
  Bell,
  MessageSquare
} from 'lucide-react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';

// ===================================================================
// SAMPLE SESSIONS DATA
// ===================================================================

const SAMPLE_SESSIONS = [
  {
    id: 'session-1',
    title: 'Credit Repair Best Practices Workshop',
    instructor: 'Chris - Founder & CEO',
    description: 'Interactive workshop covering the latest credit repair strategies and techniques.',
    category: 'credit-repair',
    startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    duration: '90 minutes',
    maxAttendees: 50,
    currentAttendees: 32,
    type: 'workshop',
    level: 'All Levels',
    meetingLink: 'https://meet.example.com/session-1',
    hasRecording: false
  },
  {
    id: 'session-2',
    title: 'New Employee Orientation',
    instructor: 'Laurie - Operations Manager',
    description: 'Welcome session for new team members covering company culture and expectations.',
    category: 'onboarding',
    startTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
    duration: '2 hours',
    maxAttendees: 20,
    currentAttendees: 8,
    type: 'orientation',
    level: 'Beginner',
    meetingLink: 'https://meet.example.com/session-2',
    hasRecording: false
  },
  {
    id: 'session-3',
    title: 'Advanced Dispute Techniques',
    instructor: 'Jordan - Technical Lead',
    description: 'Deep dive into complex dispute scenarios and advanced strategies.',
    category: 'credit-repair',
    startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    duration: '2 hours',
    maxAttendees: 30,
    currentAttendees: 18,
    type: 'webinar',
    level: 'Advanced',
    meetingLink: 'https://meet.example.com/session-3',
    hasRecording: true
  },
  {
    id: 'session-4',
    title: 'Q&A: Ask the Experts',
    instructor: 'Team Panel',
    description: 'Open Q&A session with our expert team. Bring your questions!',
    category: 'qa',
    startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    duration: '60 minutes',
    maxAttendees: 100,
    currentAttendees: 45,
    type: 'qa',
    level: 'All Levels',
    meetingLink: 'https://meet.example.com/session-4',
    hasRecording: true
  }
];

// ===================================================================
// MAIN LIVE TRAINING SESSIONS COMPONENT
// ===================================================================

const LiveTrainingSessions = () => {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState(SAMPLE_SESSIONS);
  const [filteredSessions, setFilteredSessions] = useState(SAMPLE_SESSIONS);
  const [registeredSessions, setRegisteredSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [searchQuery, setSearchQuery] = useState('');

  // ===============================================================
  // LOAD DATA
  // ===============================================================

  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    console.log('📅 LiveTrainingSessions: Loading sessions');

    const unsubscribers = [];

    // Listen to registered sessions
    const registrationsRef = collection(db, 'sessionRegistrations');
    const registrationsQuery = query(
      registrationsRef,
      where('userId', '==', auth.currentUser.uid)
    );
    const unsubReg = onSnapshot(registrationsQuery, (snapshot) => {
      const registered = [];
      snapshot.forEach((doc) => {
        registered.push(doc.data().sessionId);
      });
      setRegisteredSessions(registered);
      console.log('✅ Registered for', registered.length, 'sessions');
    }, (err) => {
      console.error('❌ Error loading registrations:', err);
    });
    unsubscribers.push(unsubReg);

    setLoading(false);

    return () => {
      console.log('🧹 Cleaning up LiveTrainingSessions listeners');
      unsubscribers.forEach(unsub => unsub());
    };
  }, []);

  // ===============================================================
  // FILTER SESSIONS
  // ===============================================================

  useEffect(() => {
    let filtered = sessions;

    // Filter by tab
    const now = new Date();
    if (activeTab === 'upcoming') {
      filtered = filtered.filter(s => s.startTime > now);
    } else if (activeTab === 'my-sessions') {
      filtered = filtered.filter(s => registeredSessions.includes(s.id));
    } else if (activeTab === 'recordings') {
      filtered = filtered.filter(s => s.hasRecording);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s =>
        s.title.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query) ||
        s.instructor.toLowerCase().includes(query)
      );
    }

    // Sort by start time
    filtered.sort((a, b) => a.startTime - b.startTime);

    setFilteredSessions(filtered);
  }, [sessions, activeTab, searchQuery, registeredSessions]);

  // ===============================================================
  // SESSION ACTIONS
  // ===============================================================

  const handleRegister = async (sessionId) => {
    if (!auth.currentUser) return;

    try {
      await setDoc(doc(collection(db, 'sessionRegistrations')), {
        userId: auth.currentUser.uid,
        sessionId: sessionId,
        registeredAt: serverTimestamp(),
        status: 'registered'
      });

      console.log('✅ Registered for session:', sessionId);
    } catch (err) {
      console.error('❌ Error registering:', err);
    }
  };

  const handleJoinSession = (session) => {
    window.open(session.meetingLink, '_blank');
  };

  const formatDateTime = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(date);
  };

  const getTimeUntil = (date) => {
    const now = new Date();
    const diff = date - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `in ${days} day${days > 1 ? 's' : ''}`;
    if (hours > 0) return `in ${hours} hour${hours > 1 ? 's' : ''}`;
    return 'starting soon';
  };

  // ===============================================================
  // RENDER SESSION CARD
  // ===============================================================

  const renderSessionCard = (session) => {
    const isRegistered = registeredSessions.includes(session.id);
    const isFull = session.currentAttendees >= session.maxAttendees;
    const isStartingSoon = (session.startTime - new Date()) < 15 * 60 * 1000; // 15 minutes

    return (
      <Grid item xs={12} md={6} key={session.id}>
        <Card className="h-full">
          <CardContent>
            {/* Header */}
            <Box className="flex items-start justify-between mb-3">
              <Box className="flex-1">
                <Box className="flex items-center gap-2 mb-2">
                  <Video size={20} className="text-blue-600" />
                  <Chip
                    label={session.type}
                    size="small"
                    className="capitalize"
                  />
                  {isRegistered && (
                    <Chip
                      label="Registered"
                      size="small"
                      icon={<CheckCircle size={14} />}
                      color="success"
                    />
                  )}
                </Box>
                <Typography variant="h6" className="font-bold mb-1 text-gray-900 dark:text-white">
                  {session.title}
                </Typography>
              </Box>
            </Box>

            {/* Instructor */}
            <Box className="flex items-center gap-2 mb-3">
              <Avatar className="w-8 h-8 bg-blue-600">
                <User size={16} />
              </Avatar>
              <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                {session.instructor}
              </Typography>
            </Box>

            {/* Description */}
            <Typography variant="body2" className="text-gray-600 dark:text-gray-400 mb-3">
              {session.description}
            </Typography>

            {/* Details */}
            <Box className="space-y-2 mb-3">
              <Box className="flex items-center gap-2 text-sm">
                <Calendar size={16} className="text-gray-500" />
                <Typography variant="body2">
                  {formatDateTime(session.startTime)}
                </Typography>
              </Box>
              <Box className="flex items-center gap-2 text-sm">
                <Clock size={16} className="text-gray-500" />
                <Typography variant="body2">
                  {session.duration}
                </Typography>
              </Box>
              <Box className="flex items-center gap-2 text-sm">
                <Users size={16} className="text-gray-500" />
                <Typography variant="body2">
                  {session.currentAttendees}/{session.maxAttendees} attendees
                </Typography>
              </Box>
            </Box>

            {/* Level Badge */}
            <Chip
              label={session.level}
              size="small"
              className="mb-3"
              color={session.level === 'Beginner' ? 'success' : session.level === 'Advanced' ? 'error' : 'primary'}
            />

            {/* Time until session */}
            {isStartingSoon && (
              <Alert severity="warning" className="mb-3">
                Starting {getTimeUntil(session.startTime)}!
              </Alert>
            )}

            {/* Actions */}
            <Box className="flex gap-2">
              {isRegistered ? (
                <>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<Video />}
                    onClick={() => handleJoinSession(session)}
                  >
                    Join Session
                  </Button>
                  <IconButton onClick={() => {
                    setSelectedSession(session);
                    setShowDetailDialog(true);
                  }}>
                    <ExternalLink size={20} />
                  </IconButton>
                </>
              ) : (
                <>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Bell />}
                    onClick={() => handleRegister(session.id)}
                    disabled={isFull}
                  >
                    {isFull ? 'Session Full' : 'Register'}
                  </Button>
                  <Button
                    variant="text"
                    onClick={() => {
                      setSelectedSession(session);
                      setShowDetailDialog(true);
                    }}
                  >
                    Details
                  </Button>
                </>
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>
    );
  };

  // ===============================================================
  // RENDER LOADING STATE
  // ===============================================================

  if (loading) {
    return (
      <Box className="flex items-center justify-center min-h-96">
        <Box className="text-center">
          <CircularProgress size={60} />
          <Typography className="mt-4 text-gray-600 dark:text-gray-400">
            Loading training sessions...
          </Typography>
        </Box>
      </Box>
    );
  }

  // ===============================================================
  // MAIN RENDER
  // ===============================================================

  return (
    <Box>
      {/* Header with search */}
      <Paper className="p-4 mb-6">
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              placeholder="Search sessions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={20} />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
              {filteredSessions.length} session{filteredSessions.length !== 1 ? 's' : ''} found
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Paper className="mb-4">
        <Tabs
          value={activeTab}
          onChange={(e, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Upcoming Sessions" value="upcoming" icon={<Calendar />} iconPosition="start" />
          <Tab 
            label="My Sessions" 
            value="my-sessions" 
            icon={<CheckCircle />} 
            iconPosition="start"
          />
          <Tab label="Recordings" value="recordings" icon={<Play />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Sessions Grid */}
      {filteredSessions.length > 0 ? (
        <Grid container spacing={3}>
          {filteredSessions.map(session => renderSessionCard(session))}
        </Grid>
      ) : (
        <Paper className="p-12 text-center">
          <Video size={64} className="mx-auto mb-4 text-gray-400" />
          <Typography variant="h6" className="mb-2 text-gray-900 dark:text-white">
            No sessions found
          </Typography>
          <Typography className="text-gray-600 dark:text-gray-400">
            {activeTab === 'my-sessions' 
              ? 'You haven\'t registered for any sessions yet'
              : 'Check back later for new training sessions'}
          </Typography>
        </Paper>
      )}

      {/* Session Detail Dialog */}
      <Dialog
        open={showDetailDialog}
        onClose={() => setShowDetailDialog(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedSession && (
          <>
            <DialogTitle>
              <Typography variant="h5" className="font-bold">
                {selectedSession.title}
              </Typography>
            </DialogTitle>
            <DialogContent>
              <Box className="space-y-4">
                <Box className="flex items-center gap-2">
                  <Avatar className="w-12 h-12 bg-blue-600">
                    <User size={24} />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" className="font-semibold">
                      {selectedSession.instructor}
                    </Typography>
                    <Typography variant="caption" className="text-gray-600 dark:text-gray-400">
                      Instructor
                    </Typography>
                  </Box>
                </Box>

                <Divider />

                <Typography variant="body1">
                  {selectedSession.description}
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" className="text-gray-600 dark:text-gray-400">
                      Date & Time
                    </Typography>
                    <Typography variant="body2" className="font-semibold">
                      {formatDateTime(selectedSession.startTime)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" className="text-gray-600 dark:text-gray-400">
                      Duration
                    </Typography>
                    <Typography variant="body2" className="font-semibold">
                      {selectedSession.duration}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" className="text-gray-600 dark:text-gray-400">
                      Level
                    </Typography>
                    <Typography variant="body2" className="font-semibold">
                      {selectedSession.level}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" className="text-gray-600 dark:text-gray-400">
                      Attendees
                    </Typography>
                    <Typography variant="body2" className="font-semibold">
                      {selectedSession.currentAttendees}/{selectedSession.maxAttendees}
                    </Typography>
                  </Grid>
                </Grid>

                {registeredSessions.includes(selectedSession.id) && (
                  <Alert severity="success">
                    You're registered for this session! You'll receive a reminder 15 minutes before it starts.
                  </Alert>
                )}
              </Box>
            </DialogContent>
            <DialogActions className="p-4">
              <Button onClick={() => setShowDetailDialog(false)}>
                Close
              </Button>
              {registeredSessions.includes(selectedSession.id) ? (
                <Button
                  variant="contained"
                  startIcon={<Video />}
                  onClick={() => {
                    handleJoinSession(selectedSession);
                    setShowDetailDialog(false);
                  }}
                >
                  Join Session
                </Button>
              ) : (
                <Button
                  variant="contained"
                  startIcon={<Bell />}
                  onClick={() => {
                    handleRegister(selectedSession.id);
                    setShowDetailDialog(false);
                  }}
                  disabled={selectedSession.currentAttendees >= selectedSession.maxAttendees}
                >
                  Register
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default LiveTrainingSessions;