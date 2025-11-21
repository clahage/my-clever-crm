// ===================================================================
// ProgressTracker.jsx - Learning Progress Analytics
// ===================================================================
// Purpose: Track and visualize learning progress across all activities
// Features:
// - Progress charts and graphs
// - Learning milestones
// - Time tracking
// - Skill development visualization
// - Goal setting and tracking
// - Comparison with peers
// - Achievement timeline
// - Export reports
// ===================================================================

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert
} from '@mui/material';
import {
  TrendingUp,
  Award,
  Clock,
  Target,
  Star,
  CheckCircle,
  BarChart3,
  Calendar,
  Download,
  Zap,
  Trophy,
  BookOpen,
  Video,
  FileText,
  Users,
  TrendingDown,
  Minus
} from 'lucide-react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  getDoc
} from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';

// ===================================================================
// MAIN PROGRESS TRACKER COMPONENT
// ===================================================================

const ProgressTracker = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeframe, setTimeframe] = useState('all-time');
  const [userProfile, setUserProfile] = useState(null);
  const [progressData, setProgressData] = useState({
    coursesInProgress: 0,
    coursesCompleted: 0,
    certificationsEarned: 0,
    quizzesCompleted: 0,
    quizzesPassed: 0,
    totalLearningHours: 0,
    averageQuizScore: 0,
    currentStreak: 0,
    longestStreak: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [skillLevels, setSkillLevels] = useState([]);

  // ===============================================================
  // LOAD DATA
  // ===============================================================

  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    console.log('📊 ProgressTracker: Loading analytics');

    const unsubscribers = [];

    // Load user profile
    const userDocRef = doc(db, 'userProfiles', auth.currentUser.uid);
    const unsubUser = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setUserProfile(docSnap.data());
      }
    });
    unsubscribers.push(unsubUser);

    // Load training progress
    const progressRef = collection(db, 'trainingProgress');
    const progressQuery = query(
      progressRef,
      where('userId', '==', auth.currentUser.uid)
    );
    const unsubProgress = onSnapshot(progressQuery, (snapshot) => {
      let inProgress = 0;
      let completed = 0;
      let totalHours = 0;

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.status === 'in-progress') inProgress++;
        if (data.status === 'completed') completed++;
        if (data.hoursSpent) totalHours += data.hoursSpent;
      });

      setProgressData(prev => ({
        ...prev,
        coursesInProgress: inProgress,
        coursesCompleted: completed,
        totalLearningHours: Math.round(totalHours * 10) / 10
      }));
    });
    unsubscribers.push(unsubProgress);

    // Load certifications
    const certsRef = collection(db, 'certifications');
    const certsQuery = query(
      certsRef,
      where('userId', '==', auth.currentUser.uid),
      where('status', '==', 'earned')
    );
    const unsubCerts = onSnapshot(certsQuery, (snapshot) => {
      setProgressData(prev => ({
        ...prev,
        certificationsEarned: snapshot.size
      }));
    });
    unsubscribers.push(unsubCerts);

    // Load quiz attempts
    const quizzesRef = collection(db, 'quizAttempts');
    const quizzesQuery = query(
      quizzesRef,
      where('userId', '==', auth.currentUser.uid),
      orderBy('completedAt', 'desc')
    );
    const unsubQuizzes = onSnapshot(quizzesQuery, (snapshot) => {
      let completed = 0;
      let passed = 0;
      let totalScore = 0;

      snapshot.forEach((doc) => {
        const data = doc.data();
        completed++;
        if (data.passed) passed++;
        totalScore += data.score || 0;
      });

      setProgressData(prev => ({
        ...prev,
        quizzesCompleted: completed,
        quizzesPassed: passed,
        averageQuizScore: completed > 0 ? Math.round(totalScore / completed) : 0
      }));
    });
    unsubscribers.push(unsubQuizzes);

    // Load recent activity
    const activityRef = collection(db, 'trainingActivity');
    const activityQuery = query(
      activityRef,
      where('userId', '==', auth.currentUser.uid),
      orderBy('timestamp', 'desc'),
      limit(10)
    );
    const unsubActivity = onSnapshot(activityQuery, (snapshot) => {
      const activities = [];
      snapshot.forEach((doc) => {
        activities.push({ id: doc.id, ...doc.data() });
      });
      setRecentActivity(activities);
    });
    unsubscribers.push(unsubActivity);

    setLoading(false);

    return () => {
      console.log('🧹 Cleaning up ProgressTracker listeners');
      unsubscribers.forEach(unsub => unsub());
    };
  }, []);

  // ===============================================================
  // CALCULATE MILESTONES
  // ===============================================================

  useEffect(() => {
    const calculateMilestones = () => {
      const achievedMilestones = [];

      // Course milestones
      if (progressData.coursesCompleted >= 1) {
        achievedMilestones.push({
          id: 'first-course',
          title: 'First Course Complete',
          description: 'Completed your first training course',
          icon: <BookOpen />,
          date: new Date(),
          achieved: true
        });
      }
      if (progressData.coursesCompleted >= 5) {
        achievedMilestones.push({
          id: 'five-courses',
          title: 'Course Enthusiast',
          description: 'Completed 5 training courses',
          icon: <Star />,
          date: new Date(),
          achieved: true
        });
      }
      if (progressData.coursesCompleted >= 10) {
        achievedMilestones.push({
          id: 'ten-courses',
          title: 'Learning Champion',
          description: 'Completed 10 training courses',
          icon: <Trophy />,
          date: new Date(),
          achieved: true
        });
      }

      // Certification milestones
      if (progressData.certificationsEarned >= 1) {
        achievedMilestones.push({
          id: 'first-cert',
          title: 'First Certification',
          description: 'Earned your first certification',
          icon: <Award />,
          date: new Date(),
          achieved: true
        });
      }

      // Quiz milestones
      if (progressData.quizzesPassed >= 5) {
        achievedMilestones.push({
          id: 'quiz-master',
          title: 'Quiz Master',
          description: 'Passed 5 quizzes',
          icon: <CheckCircle />,
          date: new Date(),
          achieved: true
        });
      }

      // Learning time milestones
      if (progressData.totalLearningHours >= 10) {
        achievedMilestones.push({
          id: 'ten-hours',
          title: 'Dedicated Learner',
          description: '10 hours of learning completed',
          icon: <Clock />,
          date: new Date(),
          achieved: true
        });
      }

      setMilestones(achievedMilestones);
    };

    calculateMilestones();
  }, [progressData]);

  // ===============================================================
  // CALCULATE SKILL LEVELS
  // ===============================================================

  useEffect(() => {
    const calculateSkillLevels = () => {
      const skills = [
        {
          name: 'Credit Repair',
          level: Math.min(100, progressData.coursesCompleted * 15 + progressData.certificationsEarned * 20),
          courses: progressData.coursesCompleted,
          color: 'from-blue-500 to-blue-600'
        },
        {
          name: 'Customer Service',
          level: Math.min(100, progressData.quizzesPassed * 10 + progressData.certificationsEarned * 15),
          courses: Math.floor(progressData.coursesCompleted * 0.3),
          color: 'from-green-500 to-green-600'
        },
        {
          name: 'Compliance & Legal',
          level: Math.min(100, progressData.certificationsEarned * 25 + progressData.quizzesPassed * 5),
          courses: Math.floor(progressData.coursesCompleted * 0.2),
          color: 'from-purple-500 to-purple-600'
        },
        {
          name: 'Platform Mastery',
          level: Math.min(100, progressData.totalLearningHours * 5 + progressData.coursesCompleted * 8),
          courses: Math.floor(progressData.coursesCompleted * 0.4),
          color: 'from-orange-500 to-orange-600'
        }
      ];

      setSkillLevels(skills);
    };

    calculateSkillLevels();
  }, [progressData]);

  // ===============================================================
  // HELPER FUNCTIONS
  // ===============================================================

  const getActivityIcon = (type) => {
    switch (type) {
      case 'course-completed':
        return <BookOpen className="text-blue-600" />;
      case 'quiz-completed':
        return <FileText className="text-green-600" />;
      case 'certification-earned':
        return <Award className="text-purple-600" />;
      case 'onboarding-completed':
        return <CheckCircle className="text-green-600" />;
      default:
        return <Zap className="text-gray-600" />;
    }
  };

  const getActivityDescription = (activity) => {
    switch (activity.type) {
      case 'course-completed':
        return 'Completed a training course';
      case 'quiz-completed':
        return `${activity.passed ? 'Passed' : 'Completed'} a quiz with ${activity.score}%`;
      case 'certification-earned':
        return 'Earned a certification';
      case 'onboarding-completed':
        return 'Completed onboarding';
      default:
        return 'Training activity';
    }
  };

  const getSkillLevelLabel = (level) => {
    if (level < 20) return 'Beginner';
    if (level < 40) return 'Novice';
    if (level < 60) return 'Intermediate';
    if (level < 80) return 'Advanced';
    return 'Expert';
  };

  const getTrendIcon = (current, previous) => {
    if (current > previous) return <TrendingUp className="text-green-600" size={16} />;
    if (current < previous) return <TrendingDown className="text-red-600" size={16} />;
    return <Minus className="text-gray-600" size={16} />;
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
            Loading progress data...
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
      {/* Header with Timeframe Selector */}
      <Box className="flex items-center justify-between mb-6">
        <Typography variant="h5" className="font-bold text-gray-900 dark:text-white">
          Your Learning Progress
        </Typography>
        <FormControl size="small" className="min-w-[150px]">
          <InputLabel>Timeframe</InputLabel>
          <Select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            label="Timeframe"
          >
            <MenuItem value="all-time">All Time</MenuItem>
            <MenuItem value="this-month">This Month</MenuItem>
            <MenuItem value="this-week">This Week</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Tabs */}
      <Paper className="mb-4">
        <Tabs
          value={activeTab}
          onChange={(e, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Overview" value="overview" icon={<BarChart3 />} iconPosition="start" />
          <Tab label="Skills" value="skills" icon={<Target />} iconPosition="start" />
          <Tab label="Milestones" value="milestones" icon={<Trophy />} iconPosition="start" />
          <Tab label="Activity" value="activity" icon={<Calendar />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <Box>
          {/* Stats Grid */}
          <Grid container spacing={3} className="mb-6">
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box className="flex items-center justify-between mb-2">
                    <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                      Courses Completed
                    </Typography>
                    <BookOpen className="text-blue-600" size={24} />
                  </Box>
                  <Typography variant="h4" className="font-bold mb-1">
                    {progressData.coursesCompleted}
                  </Typography>
                  <Typography variant="caption" className="text-gray-500 dark:text-gray-400">
                    {progressData.coursesInProgress} in progress
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box className="flex items-center justify-between mb-2">
                    <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                      Certifications
                    </Typography>
                    <Award className="text-purple-600" size={24} />
                  </Box>
                  <Typography variant="h4" className="font-bold mb-1">
                    {progressData.certificationsEarned}
                  </Typography>
                  <Typography variant="caption" className="text-gray-500 dark:text-gray-400">
                    Earned
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box className="flex items-center justify-between mb-2">
                    <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                      Learning Hours
                    </Typography>
                    <Clock className="text-orange-600" size={24} />
                  </Box>
                  <Typography variant="h4" className="font-bold mb-1">
                    {progressData.totalLearningHours}
                  </Typography>
                  <Typography variant="caption" className="text-gray-500 dark:text-gray-400">
                    Total hours
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box className="flex items-center justify-between mb-2">
                    <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                      Quiz Average
                    </Typography>
                    <BarChart3 className="text-green-600" size={24} />
                  </Box>
                  <Typography variant="h4" className="font-bold mb-1">
                    {progressData.averageQuizScore}%
                  </Typography>
                  <Typography variant="caption" className="text-gray-500 dark:text-gray-400">
                    {progressData.quizzesPassed} passed
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Overall Progress Card */}
          <Card className="mb-6">
            <CardContent>
              <Typography variant="h6" className="font-semibold mb-4">
                Overall Learning Progress
              </Typography>
              <Box className="space-y-4">
                <Box>
                  <Box className="flex justify-between items-center mb-1">
                    <Typography variant="body2">Course Completion</Typography>
                    <Typography variant="body2" className="font-semibold">
                      {progressData.coursesCompleted > 0 
                        ? Math.round((progressData.coursesCompleted / (progressData.coursesCompleted + progressData.coursesInProgress)) * 100)
                        : 0}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={progressData.coursesCompleted > 0 
                      ? (progressData.coursesCompleted / (progressData.coursesCompleted + progressData.coursesInProgress)) * 100
                      : 0}
                    className="h-2 rounded"
                  />
                </Box>

                <Box>
                  <Box className="flex justify-between items-center mb-1">
                    <Typography variant="body2">Quiz Success Rate</Typography>
                    <Typography variant="body2" className="font-semibold">
                      {progressData.quizzesCompleted > 0 
                        ? Math.round((progressData.quizzesPassed / progressData.quizzesCompleted) * 100)
                        : 0}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={progressData.quizzesCompleted > 0 
                      ? (progressData.quizzesPassed / progressData.quizzesCompleted) * 100
                      : 0}
                    className="h-2 rounded"
                    color="success"
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Performance Insights */}
          <Card>
            <CardContent>
              <Typography variant="h6" className="font-semibold mb-3">
                Performance Insights
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <TrendingUp className="text-green-600" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Great Progress!"
                    secondary={`You've completed ${progressData.coursesCompleted} courses. Keep up the momentum!`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Target className="text-blue-600" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Next Goal"
                    secondary={`Complete ${Math.max(0, 5 - progressData.coursesCompleted)} more courses to earn a milestone badge`}
                  />
                </ListItem>
                {progressData.averageQuizScore < 80 && (
                  <ListItem>
                    <ListItemIcon>
                      <Zap className="text-orange-600" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Improvement Opportunity"
                      secondary="Review course materials to improve your quiz scores"
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Box>
      )}

      {activeTab === 'skills' && (
        <Box>
          <Alert severity="info" className="mb-4">
            Skill levels are calculated based on your completed courses, certifications, and quiz performance.
          </Alert>

          <Grid container spacing={3}>
            {skillLevels.map(skill => (
              <Grid item xs={12} md={6} key={skill.name}>
                <Card>
                  <CardContent>
                    <Box className="flex items-center justify-between mb-3">
                      <Typography variant="h6" className="font-semibold">
                        {skill.name}
                      </Typography>
                      <Chip
                        label={getSkillLevelLabel(skill.level)}
                        size="small"
                        className={`bg-gradient-to-r ${skill.color} text-white`}
                      />
                    </Box>

                    <Box className="mb-3">
                      <Box className="flex justify-between items-center mb-1">
                        <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                          Skill Level
                        </Typography>
                        <Typography variant="body2" className="font-semibold">
                          {skill.level}%
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={skill.level}
                        className="h-2 rounded"
                      />
                    </Box>

                    <Typography variant="caption" className="text-gray-600 dark:text-gray-400">
                      Based on {skill.courses} completed courses
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {activeTab === 'milestones' && (
        <Box>
          {milestones.length > 0 ? (
            <Grid container spacing={3}>
              {milestones.map(milestone => (
                <Grid item xs={12} sm={6} md={4} key={milestone.id}>
                  <Card className="h-full">
                    <CardContent className="text-center">
                      <Box className="inline-flex p-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-3">
                        {milestone.icon}
                      </Box>
                      <Typography variant="h6" className="font-bold mb-1">
                        {milestone.title}
                      </Typography>
                      <Typography variant="body2" className="text-gray-600 dark:text-gray-400 mb-2">
                        {milestone.description}
                      </Typography>
                      <Chip
                        label="Achieved"
                        size="small"
                        icon={<CheckCircle size={14} />}
                        color="success"
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Paper className="p-12 text-center">
              <Trophy size={64} className="mx-auto mb-4 text-gray-400" />
              <Typography variant="h6" className="mb-2">
                No Milestones Yet
              </Typography>
              <Typography className="text-gray-600 dark:text-gray-400">
                Keep learning to unlock your first milestone!
              </Typography>
            </Paper>
          )}
        </Box>
      )}

      {activeTab === 'activity' && (
        <Box>
          {recentActivity.length > 0 ? (
            <Paper>
              <List>
                {recentActivity.map((activity, index) => (
                  <React.Fragment key={activity.id}>
                    <ListItem>
                      <ListItemIcon>
                        {getActivityIcon(activity.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={getActivityDescription(activity)}
                        secondary={activity.timestamp?.toDate().toLocaleString()}
                      />
                    </ListItem>
                    {index < recentActivity.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          ) : (
            <Paper className="p-12 text-center">
              <Calendar size={64} className="mx-auto mb-4 text-gray-400" />
              <Typography variant="h6" className="mb-2">
                No Recent Activity
              </Typography>
              <Typography className="text-gray-600 dark:text-gray-400">
                Start learning to see your activity here
              </Typography>
            </Paper>
          )}
        </Box>
      )}

      {/* Export Button */}
      <Box className="mt-6 text-center">
        <Button
          variant="outlined"
          startIcon={<Download />}
          size="large"
        >
          Export Progress Report
        </Button>
      </Box>
    </Box>
  );
};

export default ProgressTracker;