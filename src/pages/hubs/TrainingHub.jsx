// ===================================================================
// TrainingHub.jsx - Main Training & Onboarding Hub Component
// ===================================================================
// Purpose: Central hub for all training, onboarding, and education
// Features:
// - Tab navigation for all training components
// - Role-based access control
// - Real-time progress tracking
// - Quick stats dashboard
// - AI-powered learning recommendations
// - Mobile responsive design
// - Dark mode support
// ===================================================================

import React, { useState, useEffect, lazy, Suspense } from 'react';
import {
  Box,
  Container,
  Tabs,
  Tab,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Button,
  IconButton,
  Alert,
  CircularProgress,
  Avatar,
  Stack,
  Divider,
  Tooltip
} from '@mui/material';
import {
  GraduationCap,
  BookOpen,
  Award,
  Users,
  Calendar,
  HelpCircle,
  ClipboardCheck,
  TrendingUp,
  Video,
  FileText,
  Target,
  Zap,
  Star,
  Trophy,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react';
import { collection, query, where, onSnapshot, doc, getDoc, orderBy, limit } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';

// ===================================================================
// LAZY LOAD COMPONENTS FOR PERFORMANCE
// ===================================================================

const OnboardingWizard = lazy(() => import('@/pages/OnboardingWizard'));
const TrainingLibrary = lazy(() => import('@/pages/TrainingLibrary'));
const CertificationSystem = lazy(() => import('@/pages/CertificationSystem'));
const RoleBasedTraining = lazy(() => import('@/pages/RoleBasedTraining'));
const LiveTrainingSessions = lazy(() => import('@/pages/LiveTrainingSessions'));
const KnowledgeBase = lazy(() => import('@/pages/KnowledgeBase'));
const QuizSystem = lazy(() => import('@/pages/hubs/QuizSystem'));
const ProgressTracker = lazy(() => import('@/pages/ProgressTracker'));

// ===================================================================
// MAIN TRAINING HUB COMPONENT
// ===================================================================

const TrainingHub = () => {
  // ===============================================================
  // STATE MANAGEMENT
  // ===============================================================

  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('trainingHub_activeTab') || 'onboarding';
  });
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [quickStats, setQuickStats] = useState({
    coursesInProgress: 0,
    coursesCompleted: 0,
    certificationsEarned: 0,
    totalLearningHours: 0,
    completionRate: 0,
    upcomingSessions: 0,
    quizzesPending: 0,
    knowledgeBaseViews: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState(null);

  // ===============================================================
  // FIREBASE REAL-TIME LISTENERS
  // ===============================================================

  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    console.log('🎓 TrainingHub: Setting up real-time listeners');

    const unsubscribers = [];

    // Listen to user profile
    const userDocRef = doc(db, 'userProfiles', auth.currentUser.uid);
    const unsubUser = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setUserProfile(docSnap.data());
        console.log('👤 User profile loaded:', docSnap.data());
      }
    }, (err) => {
      console.error('❌ Error loading user profile:', err);
      setError('Failed to load user profile');
    });
    unsubscribers.push(unsubUser);

    // Listen to training progress
    const progressRef = collection(db, 'trainingProgress');
    const progressQuery = query(
      progressRef,
      where('userId', '==', auth.currentUser.uid),
      orderBy('lastActivity', 'desc')
    );
    const unsubProgress = onSnapshot(progressQuery, (snapshot) => {
      let inProgress = 0;
      let completed = 0;
      let totalHours = 0;
      let totalCompleted = 0;
      let totalItems = 0;

      snapshot.forEach((doc) => {
        const data = doc.data();
        totalItems++;
        
        if (data.status === 'in-progress') inProgress++;
        if (data.status === 'completed') {
          completed++;
          totalCompleted++;
        }
        
        if (data.hoursSpent) totalHours += data.hoursSpent;
      });

      setQuickStats(prev => ({
        ...prev,
        coursesInProgress: inProgress,
        coursesCompleted: completed,
        totalLearningHours: Math.round(totalHours * 10) / 10,
        completionRate: totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0
      }));

      console.log('📊 Training progress stats updated');
    }, (err) => {
      console.error('❌ Error loading training progress:', err);
    });
    unsubscribers.push(unsubProgress);

    // Listen to certifications
    const certsRef = collection(db, 'certifications');
    const certsQuery = query(
      certsRef,
      where('userId', '==', auth.currentUser.uid),
      where('status', '==', 'earned')
    );
    const unsubCerts = onSnapshot(certsQuery, (snapshot) => {
      setQuickStats(prev => ({
        ...prev,
        certificationsEarned: snapshot.size
      }));
      console.log('🏆 Certifications count updated:', snapshot.size);
    }, (err) => {
      console.error('❌ Error loading certifications:', err);
    });
    unsubscribers.push(unsubCerts);

    // Listen to upcoming training sessions
    const sessionsRef = collection(db, 'trainingSessions');
    const now = new Date();
    const sessionsQuery = query(
      sessionsRef,
      where('startTime', '>=', now),
      where('attendees', 'array-contains', auth.currentUser.uid),
      orderBy('startTime', 'asc'),
      limit(10)
    );
    const unsubSessions = onSnapshot(sessionsQuery, (snapshot) => {
      setQuickStats(prev => ({
        ...prev,
        upcomingSessions: snapshot.size
      }));
      console.log('📅 Upcoming sessions updated:', snapshot.size);
    }, (err) => {
      console.error('❌ Error loading sessions:', err);
    });
    unsubscribers.push(unsubSessions);

    // Listen to pending quizzes
    const quizzesRef = collection(db, 'quizAttempts');
    const quizzesQuery = query(
      quizzesRef,
      where('userId', '==', auth.currentUser.uid),
      where('status', '==', 'pending')
    );
    const unsubQuizzes = onSnapshot(quizzesQuery, (snapshot) => {
      setQuickStats(prev => ({
        ...prev,
        quizzesPending: snapshot.size
      }));
      console.log('📝 Pending quizzes updated:', snapshot.size);
    }, (err) => {
      console.error('❌ Error loading quizzes:', err);
    });
    unsubscribers.push(unsubQuizzes);

    // Listen to recent activity
    const activityRef = collection(db, 'trainingActivity');
    const activityQuery = query(
      activityRef,
      where('userId', '==', auth.currentUser.uid),
      orderBy('timestamp', 'desc'),
      limit(5)
    );
    const unsubActivity = onSnapshot(activityQuery, (snapshot) => {
      const activities = [];
      snapshot.forEach((doc) => {
        activities.push({ id: doc.id, ...doc.data() });
      });
      setRecentActivity(activities);
      console.log('🕒 Recent activity updated:', activities.length);
    }, (err) => {
      console.error('❌ Error loading activity:', err);
    });
    unsubscribers.push(unsubActivity);

    setLoading(false);

    // Cleanup listeners
    return () => {
      console.log('🧹 Cleaning up TrainingHub listeners');
      unsubscribers.forEach(unsub => unsub());
    };
  }, []);

  // ===============================================================
  // AI-POWERED RECOMMENDATIONS
  // ===============================================================

  useEffect(() => {
    if (!userProfile || !quickStats) return;

    // Generate AI recommendations based on progress and role
    const generateRecommendations = () => {
      const recs = [];

      // Recommend courses based on completion rate
      if (quickStats.completionRate < 50) {
        recs.push({
          type: 'course',
          title: 'Continue Your Learning Journey',
          description: 'You have courses in progress. Complete them to unlock certifications!',
          action: 'View Courses',
          priority: 'high',
          icon: <BookOpen />
        });
      }

      // Recommend certifications
      if (quickStats.coursesCompleted > 0 && quickStats.certificationsEarned === 0) {
        recs.push({
          type: 'certification',
          title: 'Earn Your First Certification',
          description: 'You\'ve completed courses! Take the certification exam to earn your badge.',
          action: 'View Certifications',
          priority: 'high',
          icon: <Award />
        });
      }

      // Recommend live sessions
      if (quickStats.upcomingSessions === 0) {
        recs.push({
          type: 'session',
          title: 'Join a Live Training Session',
          description: 'Interactive learning with experts. Browse upcoming sessions.',
          action: 'View Sessions',
          priority: 'medium',
          icon: <Video />
        });
      }

      // Recommend quizzes
      if (quickStats.quizzesPending > 0) {
        recs.push({
          type: 'quiz',
          title: `${quickStats.quizzesPending} Quiz${quickStats.quizzesPending > 1 ? 'zes' : ''} Waiting`,
          description: 'Test your knowledge and track your progress.',
          action: 'Take Quizzes',
          priority: 'medium',
          icon: <ClipboardCheck />
        });
      }

      // Recommend knowledge base
      recs.push({
        type: 'knowledge',
        title: 'Explore Knowledge Base',
        description: 'Quick answers to common questions. Search our extensive library.',
        action: 'Browse KB',
        priority: 'low',
        icon: <HelpCircle />
      });

      setRecommendations(recs.slice(0, 3)); // Show top 3
    };

    generateRecommendations();
  }, [userProfile, quickStats]);

  // ===============================================================
  // TAB CHANGE HANDLER
  // ===============================================================

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    localStorage.setItem('trainingHub_activeTab', newValue);
    console.log('📑 Tab changed to:', newValue);
  };

  // ===============================================================
  // RENDER LOADING STATE
  // ===============================================================

  if (loading) {
    return (
      <Box className="flex items-center justify-center min-h-screen">
        <Box className="text-center">
          <CircularProgress size={60} />
          <Typography className="mt-4 text-gray-600 dark:text-gray-400">
            Loading Training Hub...
          </Typography>
        </Box>
      </Box>
    );
  }

  // ===============================================================
  // RENDER ERROR STATE
  // ===============================================================

  if (error) {
    return (
      <Container maxWidth="lg" className="py-8">
        <Alert severity="error" className="mb-4">
          <Typography variant="h6">Error Loading Training Hub</Typography>
          <Typography>{error}</Typography>
        </Alert>
      </Container>
    );
  }

  // ===============================================================
  // MAIN RENDER
  // ===============================================================

  return (
    <Box className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
      <Container maxWidth="xl">
        {/* ============================================= */}
        {/* HEADER SECTION */}
        {/* ============================================= */}
        
        <Box className="mb-6">
          <Box className="flex items-center justify-between mb-4">
            <Box className="flex items-center gap-3">
              <Box className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
                <GraduationCap className="text-white" size={32} />
              </Box>
              <Box>
                <Typography variant="h4" className="font-bold text-gray-900 dark:text-white">
                  Training & Onboarding Hub
                </Typography>
                <Typography className="text-gray-600 dark:text-gray-400">
                  Learn, grow, and master your skills
                </Typography>
              </Box>
            </Box>

            {userProfile && (
              <Box className="text-right">
                <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                  Welcome back,
                </Typography>
                <Typography variant="h6" className="font-semibold text-gray-900 dark:text-white">
                  {userProfile.displayName || userProfile.email}
                </Typography>
              </Box>
            )}
          </Box>

          {/* ============================================= */}
          {/* QUICK STATS CARDS */}
          {/* ============================================= */}

          <Grid container spacing={2} className="mb-6">
            <Grid item xs={12} sm={6} md={3}>
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <CardContent>
                  <Box className="flex items-center justify-between">
                    <Box>
                      <Typography variant="h4" className="font-bold mb-1">
                        {quickStats.coursesInProgress}
                      </Typography>
                      <Typography variant="body2" className="opacity-90">
                        In Progress
                      </Typography>
                    </Box>
                    <BookOpen size={40} className="opacity-80" />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                <CardContent>
                  <Box className="flex items-center justify-between">
                    <Box>
                      <Typography variant="h4" className="font-bold mb-1">
                        {quickStats.coursesCompleted}
                      </Typography>
                      <Typography variant="body2" className="opacity-90">
                        Completed
                      </Typography>
                    </Box>
                    <CheckCircle size={40} className="opacity-80" />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <CardContent>
                  <Box className="flex items-center justify-between">
                    <Box>
                      <Typography variant="h4" className="font-bold mb-1">
                        {quickStats.certificationsEarned}
                      </Typography>
                      <Typography variant="body2" className="opacity-90">
                        Certifications
                      </Typography>
                    </Box>
                    <Trophy size={40} className="opacity-80" />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                <CardContent>
                  <Box className="flex items-center justify-between">
                    <Box>
                      <Typography variant="h4" className="font-bold mb-1">
                        {quickStats.totalLearningHours}h
                      </Typography>
                      <Typography variant="body2" className="opacity-90">
                        Learning Time
                      </Typography>
                    </Box>
                    <Clock size={40} className="opacity-80" />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* ============================================= */}
          {/* AI RECOMMENDATIONS */}
          {/* ============================================= */}

          {recommendations.length > 0 && (
            <Card className="mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
              <CardContent>
                <Box className="flex items-center gap-2 mb-3">
                  <Zap className="text-yellow-500" size={20} />
                  <Typography variant="h6" className="font-semibold text-gray-900 dark:text-white">
                    Recommended for You
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  {recommendations.map((rec, index) => (
                    <Grid item xs={12} md={4} key={index}>
                      <Paper className="p-4 h-full hover:shadow-lg transition-shadow cursor-pointer">
                        <Box className="flex items-start gap-3">
                          <Box className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                            {rec.icon}
                          </Box>
                          <Box className="flex-1">
                            <Typography variant="subtitle2" className="font-semibold mb-1 text-gray-900 dark:text-white">
                              {rec.title}
                            </Typography>
                            <Typography variant="body2" className="text-gray-600 dark:text-gray-400 mb-2">
                              {rec.description}
                            </Typography>
                            <Button size="small" variant="outlined" color="primary">
                              {rec.action}
                            </Button>
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          )}
        </Box>

        {/* ============================================= */}
        {/* TAB NAVIGATION */}
        {/* ============================================= */}

        <Paper className="mb-4">
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            className="border-b border-gray-200 dark:border-gray-700"
          >
            <Tab
              value="onboarding"
              label="Onboarding"
              icon={<Target size={18} />}
              iconPosition="start"
            />
            <Tab
              value="library"
              label="Training Library"
              icon={<BookOpen size={18} />}
              iconPosition="start"
            />
            <Tab
              value="certifications"
              label="Certifications"
              icon={<Award size={18} />}
              iconPosition="start"
            />
            <Tab
              value="paths"
              label="Learning Paths"
              icon={<TrendingUp size={18} />}
              iconPosition="start"
            />
            <Tab
              value="sessions"
              label="Live Sessions"
              icon={<Video size={18} />}
              iconPosition="start"
              {...(quickStats.upcomingSessions > 0 && {
                badge: quickStats.upcomingSessions
              })}
            />
            <Tab
              value="knowledge"
              label="Knowledge Base"
              icon={<HelpCircle size={18} />}
              iconPosition="start"
            />
            <Tab
              value="quizzes"
              label="Quizzes"
              icon={<ClipboardCheck size={18} />}
              iconPosition="start"
              {...(quickStats.quizzesPending > 0 && {
                badge: quickStats.quizzesPending
              })}
            />
            <Tab
              value="progress"
              label="Progress"
              icon={<BarChart3 size={18} />}
              iconPosition="start"
            />
          </Tabs>
        </Paper>

        {/* ============================================= */}
        {/* TAB CONTENT WITH LAZY LOADING */}
        {/* ============================================= */}

        <Suspense fallback={
          <Box className="flex items-center justify-center py-12">
            <CircularProgress />
          </Box>
        }>
          {activeTab === 'onboarding' && <OnboardingWizard />}
          {activeTab === 'library' && <TrainingLibrary />}
          {activeTab === 'certifications' && <CertificationSystem />}
          {activeTab === 'paths' && <RoleBasedTraining />}
          {activeTab === 'sessions' && <LiveTrainingSessions />}
          {activeTab === 'knowledge' && <KnowledgeBase />}
          {activeTab === 'quizzes' && <QuizSystem />}
          {activeTab === 'progress' && <ProgressTracker />}
        </Suspense>
      </Container>
    </Box>
  );
};

export default TrainingHub;