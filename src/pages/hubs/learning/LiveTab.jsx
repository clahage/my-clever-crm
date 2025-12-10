import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, Card, CardContent, CardActions,
  Button, Chip, Alert, CircularProgress, List, ListItem, ListItemText,
  ListItemAvatar, Avatar, Divider, TextField
} from '@mui/material';
import { Users, Calendar, Clock, Video, MapPin } from 'lucide-react';
import { collection, getDocs, addDoc, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../contexts/AuthContext';

const LiveTab = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sessions, setSessions] = useState([]);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      setError('');

      const sessionsRef = collection(db, 'liveSessions');
      const sessionsSnap = await getDocs(
        query(sessionsRef, orderBy('scheduledDate', 'asc'))
      );
      const sessionsData = sessionsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSessions(sessionsData);

    } catch (err) {
      console.error('Error loading live sessions:', err);
      setError('Failed to load live sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (sessionId) => {
    try {
      setRegistering(true);
      setError('');
      setSuccess('');

      const session = sessions.find(s => s.id === sessionId);

      await addDoc(collection(db, 'sessionRegistrations'), {
        userId: currentUser.uid,
        sessionId,
        sessionTitle: session.title,
        registeredAt: serverTimestamp()
      });

      setSuccess(`Registered for ${session.title}!`);

    } catch (err) {
      console.error('Error registering for session:', err);
      setError('Failed to register for session');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Users size={24} />
        <Typography variant="h5" fontWeight="bold">
          Live Training Sessions
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Upcoming Sessions */}
      <Grid container spacing={3}>
        {sessions.length === 0 ? (
          <Grid item xs={12}>
            <Alert severity="info">
              No upcoming live training sessions scheduled. Check back soon!
            </Alert>
          </Grid>
        ) : (
          sessions.map((session) => (
            <Grid item xs={12} md={6} key={session.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'start', gap: 2, mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <Video size={24} />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight="600">
                        {session.title || 'Untitled Session'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {session.instructor || 'TBA'}
                      </Typography>
                    </Box>
                    <Chip
                      label={session.status || 'Upcoming'}
                      color={session.status === 'live' ? 'error' : 'primary'}
                      size="small"
                    />
                  </Box>

                  <Typography variant="body2" paragraph>
                    {session.description || 'No description available'}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Calendar size={16} />
                      <Typography variant="body2">
                        {session.date || 'TBA'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Clock size={16} />
                      <Typography variant="body2">
                        {session.time || 'TBA'} ({session.duration || '60 min'})
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Users size={16} />
                      <Typography variant="body2">
                        {session.registered || 0}/{session.capacity || 100} registered
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => handleRegister(session.id)}
                    disabled={registering || session.status === 'full'}
                  >
                    {session.status === 'full' ? 'Full' : 'Register'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
};

export default LiveTab;
