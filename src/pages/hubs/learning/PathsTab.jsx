import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, Card, CardContent, CardActions,
  Button, Chip, Avatar, Alert, CircularProgress, Stepper, Step,
  StepLabel, StepContent, LinearProgress
} from '@mui/material';
import { GitBranch, CheckCircle, Circle, Lock } from 'lucide-react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../contexts/AuthContext';

const PathsTab = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paths, setPaths] = useState([]);
  const [selectedPath, setSelectedPath] = useState(null);
  const [userProgress, setUserProgress] = useState({});

  useEffect(() => {
    loadPaths();
  }, [currentUser]);

  const loadPaths = async () => {
    try {
      setLoading(true);
      setError('');

      // Load learning paths
      const pathsRef = collection(db, 'learningPaths');
      const pathsSnap = await getDocs(query(pathsRef, orderBy('order', 'asc')));
      const pathsData = pathsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPaths(pathsData);

      // Load user's course enrollments to track progress
      const enrollmentsRef = collection(db, 'courseEnrollments');
      const enrollmentsSnap = await getDocs(
        query(enrollmentsRef, where('userId', '==', currentUser.uid))
      );
      const progressData = {};
      enrollmentsSnap.docs.forEach(doc => {
        const data = doc.data();
        progressData[data.courseId] = data.progress || 0;
      });
      setUserProgress(progressData);

    } catch (err) {
      console.error('Error loading learning paths:', err);
      setError('Failed to load learning paths');
    } finally {
      setLoading(false);
    }
  };

  const calculatePathProgress = (path) => {
    if (!path.courses || path.courses.length === 0) return 0;
    const totalProgress = path.courses.reduce((sum, courseId) => {
      return sum + (userProgress[courseId] || 0);
    }, 0);
    return Math.round(totalProgress / path.courses.length);
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
        <GitBranch size={24} />
        <Typography variant="h5" fontWeight="bold">
          Learning Paths
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Alert severity="info" sx={{ mb: 3 }}>
        Follow structured learning paths designed for your role. Complete courses in sequence to build expertise.
      </Alert>

      <Grid container spacing={3}>
        {/* Paths List */}
        <Grid item xs={12} md={selectedPath ? 6 : 12}>
          <Grid container spacing={3}>
            {paths.length === 0 ? (
              <Grid item xs={12}>
                <Alert severity="info">
                  No learning paths available at this time.
                </Alert>
              </Grid>
            ) : (
              paths.map((path) => {
                const progress = calculatePathProgress(path);
                return (
                  <Grid item xs={12} key={path.id}>
                    <Card
                      sx={{
                        cursor: 'pointer',
                        border: selectedPath?.id === path.id ? 2 : 0,
                        borderColor: 'primary.main'
                      }}
                      onClick={() => setSelectedPath(path)}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'start', gap: 2, mb: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            <GitBranch size={24} />
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" fontWeight="600">
                              {path.title || 'Untitled Path'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {path.description || 'No description'}
                            </Typography>
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                          <Chip label={`${path.courses?.length || 0} courses`} size="small" />
                          <Chip label={path.level || 'All Levels'} size="small" color="primary" />
                          <Chip label={`${path.duration || '10'} hours`} size="small" variant="outlined" />
                        </Box>

                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">Your Progress</Typography>
                            <Typography variant="body2" fontWeight="600">
                              {progress}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={progress}
                            sx={{ height: 8, borderRadius: 1 }}
                          />
                        </Box>
                      </CardContent>
                      <CardActions>
                        <Button
                          fullWidth
                          variant={selectedPath?.id === path.id ? 'contained' : 'outlined'}
                        >
                          {selectedPath?.id === path.id ? 'Selected' : 'View Details'}
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                );
              })
            )}
          </Grid>
        </Grid>

        {/* Path Details */}
        {selectedPath && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                {selectedPath.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {selectedPath.description}
              </Typography>

              <Typography variant="subtitle2" gutterBottom>
                Course Curriculum
              </Typography>

              <Stepper orientation="vertical" sx={{ mt: 2 }}>
                {selectedPath.steps?.map((step, index) => {
                  const courseProgress = userProgress[step.courseId] || 0;
                  const isCompleted = courseProgress === 100;
                  const isInProgress = courseProgress > 0 && courseProgress < 100;

                  return (
                    <Step key={index} active expanded>
                      <StepLabel
                        StepIconComponent={() =>
                          isCompleted ? (
                            <CheckCircle size={24} color="#4CAF50" />
                          ) : isInProgress ? (
                            <Circle size={24} color="#2196F3" />
                          ) : (
                            <Lock size={24} color="#999" />
                          )
                        }
                      >
                        <Typography variant="subtitle2" fontWeight="600">
                          {step.title || `Step ${index + 1}`}
                        </Typography>
                      </StepLabel>
                      <StepContent>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {step.description || 'No description'}
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <LinearProgress
                            variant="determinate"
                            value={courseProgress}
                            sx={{ height: 6, borderRadius: 1 }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {courseProgress}% complete
                          </Typography>
                        </Box>
                        <Button
                          size="small"
                          variant={isCompleted ? 'outlined' : 'contained'}
                        >
                          {isCompleted ? 'Review' : isInProgress ? 'Continue' : 'Start'}
                        </Button>
                      </StepContent>
                    </Step>
                  );
                })}
              </Stepper>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default PathsTab;
