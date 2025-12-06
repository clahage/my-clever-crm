// ===================================================================
// RoleBasedTraining.jsx - Role-Specific Learning Paths
// ===================================================================
// Purpose: Personalized training paths based on user roles
// Features:
// - Role-specific curriculum
// - Custom learning tracks
// - Progressive skill development
// - Milestone tracking
// - Role transition pathways
// - Personalized recommendations
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
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  CircularProgress,
  Tabs,
  Tab
} from '@mui/material';
import {
  User,
  Users,
  UserCog,
  Crown,
  Target,
  TrendingUp,
  CheckCircle,
  Clock,
  Award,
  Zap,
  BookOpen,
  Video,
  Star,
  ChevronRight
} from 'lucide-react';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc
} from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';

// ===================================================================
// ROLE-BASED LEARNING PATHS
// ===================================================================

const LEARNING_PATHS = {
  client: {
    role: 'Client',
    icon: <User />,
    color: 'from-blue-500 to-blue-600',
    description: 'Understanding credit repair and your client portal',
    tracks: [
      {
        id: 'client-basics',
        title: 'Getting Started',
        description: 'Essential knowledge for new clients',
        estimatedTime: '2 hours',
        modules: [
          { title: 'Welcome to Speedy Credit Repair', duration: '15 min', status: 'required' },
          { title: 'Understanding Your Credit Report', duration: '30 min', status: 'required' },
          { title: 'How Credit Repair Works', duration: '25 min', status: 'required' },
          { title: 'Using Your Client Portal', duration: '20 min', status: 'required' },
          { title: 'Setting Realistic Goals', duration: '15 min', status: 'required' }
        ]
      },
      {
        id: 'client-advanced',
        title: 'Credit Mastery',
        description: 'Advanced credit knowledge',
        estimatedTime: '3 hours',
        modules: [
          { title: 'Credit Score Factors Deep Dive', duration: '45 min', status: 'optional' },
          { title: 'Building Credit After Repair', duration: '40 min', status: 'optional' },
          { title: 'Maintaining Good Credit', duration: '30 min', status: 'optional' },
          { title: 'Financial Planning Basics', duration: '45 min', status: 'optional' }
        ]
      }
    ]
  },
  user: {
    role: 'Credit Specialist',
    icon: <UserCog />,
    color: 'from-green-500 to-green-600',
    description: 'Core skills for credit repair specialists',
    tracks: [
      {
        id: 'specialist-foundation',
        title: 'Foundation Track',
        description: 'Essential credit repair skills',
        estimatedTime: '10 hours',
        modules: [
          { title: 'Platform Overview', duration: '45 min', status: 'required' },
          { title: 'Credit Report Analysis', duration: '1.5 hr', status: 'required' },
          { title: 'Dispute Letter Writing', duration: '2 hr', status: 'required' },
          { title: 'Client Communication', duration: '1 hr', status: 'required' },
          { title: 'FCRA Fundamentals', duration: '1.5 hr', status: 'required' },
          { title: 'Case Management', duration: '1 hr', status: 'required' },
          { title: 'Documentation Best Practices', duration: '45 min', status: 'required' }
        ]
      },
      {
        id: 'specialist-advanced',
        title: 'Advanced Techniques',
        description: 'Expert-level credit repair strategies',
        estimatedTime: '8 hours',
        modules: [
          { title: 'Complex Dispute Strategies', duration: '2 hr', status: 'optional' },
          { title: 'Bureau Negotiations', duration: '1.5 hr', status: 'optional' },
          { title: 'Legal Considerations', duration: '1.5 hr', status: 'optional' },
          { title: 'Advanced Client Scenarios', duration: '2 hr', status: 'optional' }
        ]
      }
    ]
  },
  manager: {
    role: 'Manager',
    icon: <Users />,
    color: 'from-purple-500 to-purple-600',
    description: 'Leadership and team management skills',
    tracks: [
      {
        id: 'manager-foundation',
        title: 'Leadership Essentials',
        description: 'Core management skills',
        estimatedTime: '12 hours',
        modules: [
          { title: 'All Specialist Training', duration: '10 hr', status: 'required' },
          { title: 'Team Leadership', duration: '2 hr', status: 'required' },
          { title: 'Performance Management', duration: '1.5 hr', status: 'required' },
          { title: 'Quality Assurance', duration: '1 hr', status: 'required' },
          { title: 'Coaching & Mentoring', duration: '1.5 hr', status: 'required' },
          { title: 'Workflow Optimization', duration: '1 hr', status: 'required' }
        ]
      },
      {
        id: 'manager-advanced',
        title: 'Strategic Management',
        description: 'Advanced leadership topics',
        estimatedTime: '6 hours',
        modules: [
          { title: 'Strategic Planning', duration: '1.5 hr', status: 'optional' },
          { title: 'Conflict Resolution', duration: '1 hr', status: 'optional' },
          { title: 'Analytics & Reporting', duration: '1.5 hr', status: 'optional' },
          { title: 'Client Escalations', duration: '1 hr', status: 'optional' }
        ]
      }
    ]
  },
  admin: {
    role: 'Administrator',
    icon: <Crown />,
    color: 'from-orange-500 to-orange-600',
    description: 'System administration and business operations',
    tracks: [
      {
        id: 'admin-foundation',
        title: 'Admin Fundamentals',
        description: 'System administration basics',
        estimatedTime: '15 hours',
        modules: [
          { title: 'All Manager Training', duration: '12 hr', status: 'required' },
          { title: 'System Administration', duration: '2 hr', status: 'required' },
          { title: 'User Management', duration: '1 hr', status: 'required' },
          { title: 'Security & Compliance', duration: '1.5 hr', status: 'required' },
          { title: 'Business Operations', duration: '2 hr', status: 'required' },
          { title: 'Financial Management', duration: '1.5 hr', status: 'required' }
        ]
      },
      {
        id: 'admin-advanced',
        title: 'Advanced Operations',
        description: 'Strategic business management',
        estimatedTime: '8 hours',
        modules: [
          { title: 'Business Strategy', duration: '2 hr', status: 'optional' },
          { title: 'Growth & Scaling', duration: '2 hr', status: 'optional' },
          { title: 'Advanced Analytics', duration: '2 hr', status: 'optional' },
          { title: 'Automation & AI', duration: '2 hr', status: 'optional' }
        ]
      }
    ]
  }
};

// ===================================================================
// MAIN ROLE-BASED TRAINING COMPONENT
// ===================================================================

const RoleBasedTraining = () => {
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [currentPath, setCurrentPath] = useState(null);
  const [trackProgress, setTrackProgress] = useState({});
  const [activeTrack, setActiveTrack] = useState(0);

  // ===============================================================
  // LOAD USER DATA AND PROGRESS
  // ===============================================================

  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    console.log('🎯 RoleBasedTraining: Loading user role and progress');

    const unsubscribers = [];

    // Load user profile
    const userDocRef = doc(db, 'userProfiles', auth.currentUser.uid);
    const unsubUser = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        setUserProfile(userData);

        // Set learning path based on role
        const role = userData.role || 'client';
        setCurrentPath(LEARNING_PATHS[role] || LEARNING_PATHS.client);
        
        console.log('👤 User role:', role);
      }
    }, (err) => {
      console.error('❌ Error loading user:', err);
    });
    unsubscribers.push(unsubUser);

    // Load training progress
    const progressRef = collection(db, 'trainingProgress');
    const progressQuery = query(
      progressRef,
      where('userId', '==', auth.currentUser.uid)
    );
    const unsubProgress = onSnapshot(progressQuery, (snapshot) => {
      const progress = {};
      snapshot.forEach((doc) => {
        const data = doc.data();
        progress[data.courseId] = data.progress || 0;
      });
      setTrackProgress(progress);
      console.log('📊 Progress loaded for', Object.keys(progress).length, 'items');
    }, (err) => {
      console.error('❌ Error loading progress:', err);
    });
    unsubscribers.push(unsubProgress);

    setLoading(false);

    return () => {
      console.log('🧹 Cleaning up RoleBasedTraining listeners');
      unsubscribers.forEach(unsub => unsub());
    };
  }, []);

  // ===============================================================
  // CALCULATE TRACK PROGRESS
  // ===============================================================

  const calculateTrackProgress = (track) => {
    if (!track || !track.modules) return 0;
    
    const completed = track.modules.filter(m => 
      trackProgress[`${track.id}-${m.title}`] === 100
    ).length;
    
    return Math.round((completed / track.modules.length) * 100);
  };

  const calculateOverallProgress = () => {
    if (!currentPath || !currentPath.tracks) return 0;

    let totalModules = 0;
    let completedModules = 0;

    currentPath.tracks.forEach(track => {
      totalModules += track.modules.length;
      completedModules += track.modules.filter(m => 
        trackProgress[`${track.id}-${m.title}`] === 100
      ).length;
    });

    return totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
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
            Loading your learning path...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (!currentPath) {
    return (
      <Alert severity="info">
        Unable to load learning path. Please contact support.
      </Alert>
    );
  }

  // ===============================================================
  // MAIN RENDER
  // ===============================================================

  return (
    <Box>
      {/* Role Header */}
      <Paper className={`p-6 mb-6 bg-gradient-to-r ${currentPath.color} text-white`}>
        <Box className="flex items-center gap-4">
          <Box className="p-4 bg-white/20 rounded-xl">
            {currentPath.icon}
          </Box>
          <Box className="flex-1">
            <Typography variant="h4" className="font-bold mb-2">
              {currentPath.role} Learning Path
            </Typography>
            <Typography variant="body1" className="opacity-90 mb-3">
              {currentPath.description}
            </Typography>
            <Box className="flex items-center gap-4">
              <Box>
                <Typography variant="caption" className="opacity-80">
                  Overall Progress
                </Typography>
                <Typography variant="h6" className="font-bold">
                  {calculateOverallProgress()}%
                </Typography>
              </Box>
              <Box className="flex-1">
                <LinearProgress 
                  variant="determinate" 
                  value={calculateOverallProgress()}
                  className="h-2 rounded bg-white/20"
                  sx={{
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: 'white'
                    }
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Learning Tracks */}
      <Grid container spacing={3}>
        {currentPath.tracks.map((track, trackIndex) => {
          const progress = calculateTrackProgress(track);
          const isActive = activeTrack === trackIndex;

          return (
            <Grid item xs={12} key={track.id}>
              <Card className={isActive ? 'ring-2 ring-blue-500' : ''}>
                <CardContent>
                  <Box className="flex items-start justify-between mb-4">
                    <Box className="flex-1">
                      <Box className="flex items-center gap-2 mb-2">
                        <Typography variant="h5" className="font-bold text-gray-900 dark:text-white">
                          {track.title}
                        </Typography>
                        {progress === 100 && (
                          <Chip
                            label="Completed"
                            size="small"
                            icon={<CheckCircle size={16} />}
                            color="success"
                          />
                        )}
                      </Box>
                      <Typography className="text-gray-600 dark:text-gray-400 mb-2">
                        {track.description}
                      </Typography>
                      <Box className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <Box className="flex items-center gap-1">
                          <Clock size={14} />
                          <span>{track.estimatedTime}</span>
                        </Box>
                        <Box className="flex items-center gap-1">
                          <BookOpen size={14} />
                          <span>{track.modules.length} modules</span>
                        </Box>
                      </Box>
                    </Box>
                    <Button
                      variant={isActive ? 'contained' : 'outlined'}
                      onClick={() => setActiveTrack(trackIndex)}
                    >
                      {isActive ? 'Current Track' : 'View Track'}
                    </Button>
                  </Box>

                  {/* Progress Bar */}
                  <Box className="mb-4">
                    <Box className="flex justify-between items-center mb-1">
                      <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                        Progress
                      </Typography>
                      <Typography variant="body2" className="font-semibold">
                        {progress}%
                      </Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={progress} className="h-2 rounded" />
                  </Box>

                  {/* Module List */}
                  {isActive && (
                    <Box className="mt-4">
                      <Stepper orientation="vertical" activeStep={-1}>
                        {track.modules.map((module, moduleIndex) => {
                          const moduleProgress = trackProgress[`${track.id}-${module.title}`] || 0;
                          const isCompleted = moduleProgress === 100;

                          return (
                            <Step key={moduleIndex} completed={isCompleted}>
                              <StepLabel
                                StepIconComponent={() => (
                                  isCompleted ? (
                                    <CheckCircle className="text-green-600" size={24} />
                                  ) : (
                                    <Box className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center">
                                      <Typography variant="caption">{moduleIndex + 1}</Typography>
                                    </Box>
                                  )
                                )}
                              >
                                <Box className="flex items-center justify-between">
                                  <Box className="flex-1">
                                    <Typography className="font-semibold text-gray-900 dark:text-white">
                                      {module.title}
                                    </Typography>
                                    <Box className="flex items-center gap-2 mt-1">
                                      <Chip
                                        label={module.duration}
                                        size="small"
                                        icon={<Clock size={12} />}
                                        className="h-6"
                                      />
                                      <Chip
                                        label={module.status}
                                        size="small"
                                        color={module.status === 'required' ? 'error' : 'default'}
                                        className="h-6"
                                      />
                                    </Box>
                                  </Box>
                                  <Button
                                    size="small"
                                    variant={isCompleted ? 'outlined' : 'contained'}
                                    startIcon={isCompleted ? <CheckCircle /> : <Video />}
                                  >
                                    {isCompleted ? 'Review' : 'Start'}
                                  </Button>
                                </Box>
                              </StepLabel>
                              <StepContent>
                                {moduleProgress > 0 && moduleProgress < 100 && (
                                  <Box className="mt-2 mb-2">
                                    <LinearProgress 
                                      variant="determinate" 
                                      value={moduleProgress}
                                      className="h-1 rounded"
                                    />
                                  </Box>
                                )}
                              </StepContent>
                            </Step>
                          );
                        })}
                      </Stepper>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Next Steps */}
      <Paper className="mt-6 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
        <Box className="flex items-start gap-3">
          <Zap className="text-yellow-500 mt-1" />
          <Box>
            <Typography variant="h6" className="font-semibold mb-2 text-gray-900 dark:text-white">
              Your Next Steps
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <Target className="text-blue-600" size={20} />
                </ListItemIcon>
                <ListItemText 
                  primary="Complete all required modules in your foundation track"
                  secondary="Build your core competencies"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Award className="text-purple-600" size={20} />
                </ListItemIcon>
                <ListItemText 
                  primary="Earn your role certification"
                  secondary="Validate your skills with an official certification"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <TrendingUp className="text-green-600" size={20} />
                </ListItemIcon>
                <ListItemText 
                  primary="Explore advanced topics"
                  secondary="Continue growing your expertise"
                />
              </ListItem>
            </List>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default RoleBasedTraining;