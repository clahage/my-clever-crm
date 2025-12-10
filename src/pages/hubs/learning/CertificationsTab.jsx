import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, Card, CardContent, LinearProgress,
  Chip, Avatar, Alert, CircularProgress, List, ListItem, ListItemText,
  ListItemAvatar, Button, Divider
} from '@mui/material';
import { Award, Trophy, CheckCircle, Lock } from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../contexts/AuthContext';

const CertificationsTab = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [certifications, setCertifications] = useState([]);
  const [userProgress, setUserProgress] = useState({});

  useEffect(() => {
    loadCertifications();
  }, [currentUser]);

  const loadCertifications = async () => {
    try {
      setLoading(true);
      setError('');

      // Load certifications
      const certsRef = collection(db, 'certifications');
      const certsSnap = await getDocs(certsRef);
      const certsData = certsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCertifications(certsData);

      // Load user progress
      const progressRef = collection(db, 'certificationProgress');
      const progressSnap = await getDocs(
        query(progressRef, where('userId', '==', currentUser.uid))
      );
      const progressData = {};
      progressSnap.docs.forEach(doc => {
        const data = doc.data();
        progressData[data.certificationId] = data;
      });
      setUserProgress(progressData);

    } catch (err) {
      console.error('Error loading certifications:', err);
      setError('Failed to load certifications');
    } finally {
      setLoading(false);
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
        <Award size={24} />
        <Typography variant="h5" fontWeight="bold">
          Certifications & Badges
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Trophy size={48} color="#FFD700" />
              <Typography variant="h4" fontWeight="bold" sx={{ mt: 2 }}>
                {Object.values(userProgress).filter(p => p.earned).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Certifications Earned
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Award size={48} color="#2196F3" />
              <Typography variant="h4" fontWeight="bold" sx={{ mt: 2 }}>
                {Object.values(userProgress).filter(p => p.progress > 0 && !p.earned).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                In Progress
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Lock size={48} color="#999" />
              <Typography variant="h4" fontWeight="bold" sx={{ mt: 2 }}>
                {certifications.length - Object.keys(userProgress).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Locked
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Certifications List */}
      <Grid container spacing={3}>
        {certifications.map((cert) => {
          const progress = userProgress[cert.id] || { progress: 0, earned: false };
          return (
            <Grid item xs={12} md={6} key={cert.id}>
              <Card sx={{ opacity: progress.earned ? 1 : 0.8 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'start', gap: 2, mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: progress.earned ? 'success.main' : 'grey.400',
                        width: 56,
                        height: 56
                      }}
                    >
                      {progress.earned ? <CheckCircle size={32} /> : <Lock size={32} />}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight="600">
                        {cert.title || 'Untitled Certification'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {cert.description || 'No description'}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="subtitle2" gutterBottom>
                    Requirements:
                  </Typography>
                  <List dense>
                    {cert.requirements?.map((req, index) => (
                      <ListItem key={index}>
                        <ListItemAvatar>
                          <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main' }}>
                            <Typography variant="caption">{index + 1}</Typography>
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText primary={req} />
                      </ListItem>
                    ))}
                  </List>

                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Progress</Typography>
                      <Typography variant="body2" fontWeight="600">
                        {progress.progress || 0}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={progress.progress || 0}
                      sx={{ height: 8, borderRadius: 1 }}
                    />
                  </Box>

                  {progress.earned && (
                    <Chip
                      label={`Earned on ${progress.earnedDate || 'N/A'}`}
                      color="success"
                      size="small"
                      sx={{ mt: 2 }}
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {certifications.length === 0 && (
        <Alert severity="info">
          No certifications available at this time.
        </Alert>
      )}
    </Box>
  );
};

export default CertificationsTab;
