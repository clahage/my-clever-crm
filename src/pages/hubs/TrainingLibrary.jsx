// ===================================================================
// TrainingLibrary.jsx - Training Content Library
// ===================================================================
// Purpose: Browse and access training videos, courses, and tutorials
// Features:
// - Video course library with categories
// - Progress tracking for each course
// - Search and filter functionality
// - AI-powered course recommendations
// - Bookmarks and favorites
// - Course ratings and reviews
// - Downloadable resources
// - Interactive video player
// - Quiz integration
// - Certificate generation
// ===================================================================

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  LinearProgress,
  Avatar,
  Rating,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  CircularProgress,
  Tooltip,
  Badge,
  Stack
} from '@mui/material';
import {
  Search,
  Filter,
  BookOpen,
  Video,
  PlayCircle,
  Clock,
  Star,
  Bookmark,
  BookmarkCheck,
  Download,
  CheckCircle,
  TrendingUp,
  Award,
  Users,
  Calendar,
  FileText,
  Zap,
  Target,
  Settings,
  MessageSquare,
  ThumbsUp,
  Share2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  increment,
  getDocs
} from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';

// ===================================================================
// COURSE CATEGORIES
// ===================================================================

const COURSE_CATEGORIES = [
  { id: 'all', label: 'All Courses', icon: <BookOpen /> },
  { id: 'getting-started', label: 'Getting Started', icon: <Target /> },
  { id: 'credit-repair', label: 'Credit Repair', icon: <TrendingUp /> },
  { id: 'customer-service', label: 'Customer Service', icon: <Users /> },
  { id: 'sales', label: 'Sales & Marketing', icon: <Target /> },
  { id: 'compliance', label: 'Compliance & Legal', icon: <FileText /> },
  { id: 'technology', label: 'Technology & Tools', icon: <Settings /> },
  { id: 'leadership', label: 'Leadership & Management', icon: <Award /> }
];

// ===================================================================
// SAMPLE COURSES DATA (In production, load from Firebase)
// ===================================================================

const SAMPLE_COURSES = [
  {
    id: 'course-1',
    title: 'SpeedyCRM Platform Overview',
    description: 'Complete introduction to the SpeedyCRM platform, navigation, and core features.',
    category: 'getting-started',
    duration: '45 min',
    videos: 8,
    difficulty: 'Beginner',
    rating: 4.8,
    enrolledCount: 1250,
    thumbnailUrl: '/placeholder-course-1.jpg',
    instructor: 'Jordan - Technical Lead',
    topics: ['Navigation', 'Dashboard', 'Client Management', 'Basic Operations'],
    resources: 3,
    hasQuiz: true,
    hasCertificate: true
  },
  {
    id: 'course-2',
    title: 'Credit Repair Fundamentals',
    description: 'Master the fundamentals of credit repair, dispute strategies, and client communication.',
    category: 'credit-repair',
    duration: '2h 15min',
    videos: 12,
    difficulty: 'Beginner',
    rating: 4.9,
    enrolledCount: 980,
    thumbnailUrl: '/placeholder-course-2.jpg',
    instructor: 'Chris - Founder & CEO',
    topics: ['Credit Scores', 'Dispute Letters', 'Bureau Communication', 'Client Education'],
    resources: 8,
    hasQuiz: true,
    hasCertificate: true
  },
  {
    id: 'course-3',
    title: 'Advanced Dispute Strategies',
    description: 'Advanced techniques for handling complex credit disputes and achieving results.',
    category: 'credit-repair',
    duration: '3h 30min',
    videos: 15,
    difficulty: 'Advanced',
    rating: 4.7,
    enrolledCount: 450,
    thumbnailUrl: '/placeholder-course-3.jpg',
    instructor: 'Laurie - Operations Manager',
    topics: ['Complex Cases', 'Legal Strategies', 'Bureau Negotiations', 'Advanced Techniques'],
    resources: 12,
    hasQuiz: true,
    hasCertificate: true
  },
  {
    id: 'course-4',
    title: 'Customer Service Excellence',
    description: 'Deliver exceptional customer service and build lasting client relationships.',
    category: 'customer-service',
    duration: '1h 45min',
    videos: 10,
    difficulty: 'Intermediate',
    rating: 4.6,
    enrolledCount: 720,
    thumbnailUrl: '/placeholder-course-4.jpg',
    instructor: 'Sarah - Customer Success',
    topics: ['Communication', 'Problem Solving', 'Client Retention', 'Service Recovery'],
    resources: 5,
    hasQuiz: true,
    hasCertificate: false
  },
  {
    id: 'course-5',
    title: 'FCRA Compliance Training',
    description: 'Essential FCRA compliance knowledge for credit repair professionals.',
    category: 'compliance',
    duration: '2h 0min',
    videos: 11,
    difficulty: 'Intermediate',
    rating: 4.8,
    enrolledCount: 890,
    thumbnailUrl: '/placeholder-course-5.jpg',
    instructor: 'Legal Team',
    topics: ['FCRA Basics', 'Client Rights', 'Dispute Rules', 'Compliance Best Practices'],
    resources: 10,
    hasQuiz: true,
    hasCertificate: true
  },
  {
    id: 'course-6',
    title: 'AI Tools & Automation',
    description: 'Leverage AI and automation tools to streamline your workflow.',
    category: 'technology',
    duration: '1h 30min',
    videos: 9,
    difficulty: 'Intermediate',
    rating: 4.9,
    enrolledCount: 650,
    thumbnailUrl: '/placeholder-course-6.jpg',
    instructor: 'Jordan - Technical Lead',
    topics: ['AI Features', 'Automation Workflows', 'Efficiency Tips', 'Tool Mastery'],
    resources: 6,
    hasQuiz: true,
    hasCertificate: false
  }
];

// ===================================================================
// MAIN TRAINING LIBRARY COMPONENT
// ===================================================================

const TrainingLibrary = () => {
  // ===============================================================
  // STATE MANAGEMENT
  // ===============================================================

  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState(SAMPLE_COURSES);
  const [filteredCourses, setFilteredCourses] = useState(SAMPLE_COURSES);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [userProgress, setUserProgress] = useState({});
  const [bookmarkedCourses, setBookmarkedCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showCourseDialog, setShowCourseDialog] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [viewMode, setViewMode] = useState('all'); // 'all', 'in-progress', 'completed', 'bookmarked'

  // ===============================================================
  // LOAD USER DATA AND PROGRESS
  // ===============================================================

  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    console.log('📚 TrainingLibrary: Loading user progress');

    const unsubscribers = [];

    // Listen to user's training progress
    const progressRef = collection(db, 'trainingProgress');
    const progressQuery = query(
      progressRef,
      where('userId', '==', auth.currentUser.uid)
    );
    const unsubProgress = onSnapshot(progressQuery, (snapshot) => {
      const progress = {};
      snapshot.forEach((doc) => {
        const data = doc.data();
        progress[data.courseId] = {
          status: data.status,
          progress: data.progress || 0,
          completedVideos: data.completedVideos || [],
          lastAccessed: data.lastAccessed,
          hoursSpent: data.hoursSpent || 0
        };
      });
      setUserProgress(progress);
      console.log('📊 Progress loaded for', Object.keys(progress).length, 'courses');
    }, (err) => {
      console.error('❌ Error loading progress:', err);
    });
    unsubscribers.push(unsubProgress);

    // Listen to bookmarked courses
    const bookmarksRef = collection(db, 'courseBookmarks');
    const bookmarksQuery = query(
      bookmarksRef,
      where('userId', '==', auth.currentUser.uid)
    );
    const unsubBookmarks = onSnapshot(bookmarksQuery, (snapshot) => {
      const bookmarks = [];
      snapshot.forEach((doc) => {
        bookmarks.push(doc.data().courseId);
      });
      setBookmarkedCourses(bookmarks);
      console.log('🔖 Bookmarks loaded:', bookmarks.length);
    }, (err) => {
      console.error('❌ Error loading bookmarks:', err);
    });
    unsubscribers.push(unsubBookmarks);

    setLoading(false);

    // Cleanup
    return () => {
      console.log('🧹 Cleaning up TrainingLibrary listeners');
      unsubscribers.forEach(unsub => unsub());
    };
  }, []);

  // ===============================================================
  // GENERATE AI RECOMMENDATIONS
  // ===============================================================

  useEffect(() => {
    if (Object.keys(userProgress).length === 0) return;

    // AI logic to recommend courses based on progress
    const generateRecommendations = () => {
      const recs = [];

      // Recommend next courses in sequence
      const completedCourses = Object.keys(userProgress).filter(
        id => userProgress[id].status === 'completed'
      );

      // If completed beginner courses, recommend intermediate
      const hasBeginnerComplete = courses.some(
        c => completedCourses.includes(c.id) && c.difficulty === 'Beginner'
      );

      if (hasBeginnerComplete) {
        const intermediateCourses = courses.filter(
          c => c.difficulty === 'Intermediate' && !completedCourses.includes(c.id)
        );
        if (intermediateCourses.length > 0) {
          recs.push(intermediateCourses[0]);
        }
      }

      // Recommend popular courses not yet started
      const notStarted = courses.filter(
        c => !Object.keys(userProgress).includes(c.id)
      ).sort((a, b) => b.enrolledCount - a.enrolledCount);

      if (notStarted.length > 0 && recs.length < 3) {
        recs.push(...notStarted.slice(0, 3 - recs.length));
      }

      setRecommendations(recs);
    };

    generateRecommendations();
  }, [userProgress, courses]);

  // ===============================================================
  // FILTER AND SEARCH LOGIC
  // ===============================================================

  useEffect(() => {
    let filtered = courses;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(c => c.category === selectedCategory);
    }

    // Filter by view mode
    if (viewMode === 'in-progress') {
      filtered = filtered.filter(c => 
        userProgress[c.id] && userProgress[c.id].status === 'in-progress'
      );
    } else if (viewMode === 'completed') {
      filtered = filtered.filter(c => 
        userProgress[c.id] && userProgress[c.id].status === 'completed'
      );
    } else if (viewMode === 'bookmarked') {
      filtered = filtered.filter(c => bookmarkedCourses.includes(c.id));
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        c.topics.some(t => t.toLowerCase().includes(query))
      );
    }

    // Sort
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => b.enrolledCount - a.enrolledCount);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        // Would sort by createdAt in production
        break;
      case 'duration':
        filtered.sort((a, b) => {
          const getDuration = (str) => {
            const match = str.match(/(\d+)/);
            return match ? parseInt(match[0]) : 0;
          };
          return getDuration(a.duration) - getDuration(b.duration);
        });
        break;
      default:
        break;
    }

    setFilteredCourses(filtered);
  }, [courses, selectedCategory, searchQuery, sortBy, viewMode, userProgress, bookmarkedCourses]);

  // ===============================================================
  // COURSE INTERACTION HANDLERS
  // ===============================================================

  const handleEnrollCourse = async (courseId) => {
    if (!auth.currentUser) return;

    try {
      const progressDoc = doc(db, 'trainingProgress', `${auth.currentUser.uid}_${courseId}`);
      await setDoc(progressDoc, {
        userId: auth.currentUser.uid,
        courseId: courseId,
        status: 'in-progress',
        progress: 0,
        completedVideos: [],
        startedAt: serverTimestamp(),
        lastAccessed: serverTimestamp()
      });

      // Log activity
      await setDoc(doc(collection(db, 'trainingActivity')), {
        userId: auth.currentUser.uid,
        type: 'course-enrolled',
        courseId: courseId,
        timestamp: serverTimestamp()
      });

      console.log('✅ Enrolled in course:', courseId);
      // Open course viewer
      setSelectedCourse(courses.find(c => c.id === courseId));
      setShowCourseDialog(true);
    } catch (err) {
      console.error('❌ Error enrolling:', err);
    }
  };

  const handleToggleBookmark = async (courseId) => {
    if (!auth.currentUser) return;

    const bookmarkDoc = doc(db, 'courseBookmarks', `${auth.currentUser.uid}_${courseId}`);

    try {
      if (bookmarkedCourses.includes(courseId)) {
        // Remove bookmark
        await updateDoc(bookmarkDoc, {
          active: false
        });
        console.log('🔖 Bookmark removed:', courseId);
      } else {
        // Add bookmark
        await setDoc(bookmarkDoc, {
          userId: auth.currentUser.uid,
          courseId: courseId,
          active: true,
          createdAt: serverTimestamp()
        });
        console.log('🔖 Bookmark added:', courseId);
      }
    } catch (err) {
      console.error('❌ Error toggling bookmark:', err);
    }
  };

  const handleContinueCourse = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    setSelectedCourse(course);
    setShowCourseDialog(true);
  };

  // ===============================================================
  // RENDER COURSE CARD
  // ===============================================================

  const renderCourseCard = (course) => {
    const progress = userProgress[course.id];
    const isBookmarked = bookmarkedCourses.includes(course.id);
    const isCompleted = progress?.status === 'completed';
    const isInProgress = progress?.status === 'in-progress';

    return (
      <Grid item xs={12} sm={6} md={4} key={course.id}>
        <Card className="h-full flex flex-col hover:shadow-xl transition-shadow">
          {/* Thumbnail */}
          <Box className="relative">
            <Box className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <PlayCircle size={64} className="text-white opacity-80" />
            </Box>
            
            {/* Status Badge */}
            {isCompleted && (
              <Chip
                label="Completed"
                size="small"
                icon={<CheckCircle size={16} />}
                className="absolute top-2 left-2 bg-green-600 text-white"
              />
            )}
            {isInProgress && (
              <Chip
                label="In Progress"
                size="small"
                className="absolute top-2 left-2 bg-blue-600 text-white"
              />
            )}

            {/* Bookmark Button */}
            <IconButton
              size="small"
              className="absolute top-2 right-2 bg-white/90 hover:bg-white"
              onClick={() => handleToggleBookmark(course.id)}
            >
              {isBookmarked ? (
                <BookmarkCheck className="text-yellow-600" size={20} />
              ) : (
                <Bookmark className="text-gray-600" size={20} />
              )}
            </IconButton>

            {/* Progress Bar */}
            {progress && progress.progress > 0 && (
              <LinearProgress 
                variant="determinate" 
                value={progress.progress}
                className="absolute bottom-0 left-0 right-0"
              />
            )}
          </Box>

          {/* Content */}
          <CardContent className="flex-1">
            <Box className="flex items-start justify-between mb-2">
              <Chip 
                label={COURSE_CATEGORIES.find(cat => cat.id === course.category)?.label || 'General'}
                size="small"
                className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
              />
              <Box className="flex items-center gap-1">
                <Star size={16} className="text-yellow-500" fill="currentColor" />
                <Typography variant="body2" className="font-semibold">
                  {course.rating}
                </Typography>
              </Box>
            </Box>

            <Typography variant="h6" className="font-bold mb-2 text-gray-900 dark:text-white line-clamp-2">
              {course.title}
            </Typography>

            <Typography variant="body2" className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
              {course.description}
            </Typography>

            <Box className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-3">
              <Box className="flex items-center gap-1">
                <Clock size={14} />
                <span>{course.duration}</span>
              </Box>
              <Box className="flex items-center gap-1">
                <Video size={14} />
                <span>{course.videos} videos</span>
              </Box>
              <Box className="flex items-center gap-1">
                <Users size={14} />
                <span>{course.enrolledCount}</span>
              </Box>
            </Box>

            <Box className="flex items-center gap-2 mb-3">
              <Chip 
                label={course.difficulty} 
                size="small"
                className={`
                  ${course.difficulty === 'Beginner' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : ''}
                  ${course.difficulty === 'Intermediate' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' : ''}
                  ${course.difficulty === 'Advanced' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : ''}
                `}
              />
              {course.hasCertificate && (
                <Tooltip title="Certificate available">
                  <Award size={18} className="text-purple-600" />
                </Tooltip>
              )}
              {course.hasQuiz && (
                <Tooltip title="Includes quiz">
                  <FileText size={18} className="text-blue-600" />
                </Tooltip>
              )}
            </Box>

            <Typography variant="caption" className="text-gray-500 dark:text-gray-400">
              Instructor: {course.instructor}
            </Typography>
          </CardContent>

          {/* Actions */}
          <CardActions className="p-4 pt-0">
            {!progress ? (
              <Button
                fullWidth
                variant="contained"
                onClick={() => handleEnrollCourse(course.id)}
                startIcon={<PlayCircle />}
              >
                Start Course
              </Button>
            ) : isCompleted ? (
              <Button
                fullWidth
                variant="outlined"
                onClick={() => handleContinueCourse(course.id)}
                startIcon={<CheckCircle />}
              >
                Review Course
              </Button>
            ) : (
              <Button
                fullWidth
                variant="contained"
                onClick={() => handleContinueCourse(course.id)}
                startIcon={<PlayCircle />}
              >
                Continue Learning
              </Button>
            )}
          </CardActions>
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
            Loading training library...
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
      {/* AI Recommendations */}
      {recommendations.length > 0 && (
        <Paper className="p-6 mb-6 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
          <Box className="flex items-center gap-2 mb-4">
            <Zap className="text-yellow-500" />
            <Typography variant="h6" className="font-semibold text-gray-900 dark:text-white">
              Recommended for You
            </Typography>
          </Box>
          <Grid container spacing={3}>
            {recommendations.map(course => (
              <Grid item xs={12} md={4} key={course.id}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent>
                    <Typography variant="subtitle1" className="font-bold mb-2 text-gray-900 dark:text-white">
                      {course.title}
                    </Typography>
                    <Box className="flex items-center gap-2 mb-2">
                      <Chip label={course.difficulty} size="small" />
                      <Box className="flex items-center gap-1 text-sm">
                        <Clock size={14} />
                        <span>{course.duration}</span>
                      </Box>
                    </Box>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleEnrollCourse(course.id)}
                      startIcon={<PlayCircle />}
                    >
                      Start Now
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* Filters and Search */}
      <Paper className="p-4 mb-6">
        <Grid container spacing={3} alignItems="center">
          {/* Search */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search courses..."
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

          {/* View Mode */}
          <Grid item xs={12} md={3}>
            <Tabs 
              value={viewMode} 
              onChange={(e, val) => setViewMode(val)}
              variant="scrollable"
            >
              <Tab label="All" value="all" />
              <Tab 
                label="In Progress" 
                value="in-progress"
                icon={
                  <Badge 
                    badgeContent={Object.values(userProgress).filter(p => p.status === 'in-progress').length} 
                    color="primary"
                  />
                }
              />
              <Tab 
                label="Completed" 
                value="completed"
                icon={
                  <Badge 
                    badgeContent={Object.values(userProgress).filter(p => p.status === 'completed').length} 
                    color="success"
                  />
                }
              />
              <Tab 
                label="Bookmarked" 
                value="bookmarked"
                icon={
                  <Badge 
                    badgeContent={bookmarkedCourses.length} 
                    color="warning"
                  />
                }
              />
            </Tabs>
          </Grid>

          {/* Category Filter */}
          <Grid item xs={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                label="Category"
              >
                {COURSE_CATEGORIES.map(cat => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Sort */}
          <Grid item xs={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label="Sort By"
              >
                <MenuItem value="popular">Most Popular</MenuItem>
                <MenuItem value="rating">Highest Rated</MenuItem>
                <MenuItem value="newest">Newest</MenuItem>
                <MenuItem value="duration">Shortest First</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Active Filters */}
        {(selectedCategory !== 'all' || searchQuery || viewMode !== 'all') && (
          <Box className="mt-3 flex items-center gap-2 flex-wrap">
            <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
              Active filters:
            </Typography>
            {selectedCategory !== 'all' && (
              <Chip
                label={COURSE_CATEGORIES.find(c => c.id === selectedCategory)?.label}
                size="small"
                onDelete={() => setSelectedCategory('all')}
              />
            )}
            {searchQuery && (
              <Chip
                label={`Search: "${searchQuery}"`}
                size="small"
                onDelete={() => setSearchQuery('')}
              />
            )}
            {viewMode !== 'all' && (
              <Chip
                label={viewMode.replace('-', ' ')}
                size="small"
                onDelete={() => setViewMode('all')}
              />
            )}
            <Button
              size="small"
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
                setViewMode('all');
              }}
            >
              Clear All
            </Button>
          </Box>
        )}
      </Paper>

      {/* Course Grid */}
      {filteredCourses.length > 0 ? (
        <Grid container spacing={3}>
          {filteredCourses.map(course => renderCourseCard(course))}
        </Grid>
      ) : (
        <Paper className="p-12 text-center">
          <BookOpen size={64} className="mx-auto mb-4 text-gray-400" />
          <Typography variant="h6" className="mb-2 text-gray-900 dark:text-white">
            No courses found
          </Typography>
          <Typography className="text-gray-600 dark:text-gray-400 mb-4">
            Try adjusting your filters or search query
          </Typography>
          <Button
            variant="outlined"
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
              setViewMode('all');
            }}
          >
            Clear Filters
          </Button>
        </Paper>
      )}

      {/* Course Detail Dialog */}
      <Dialog
        open={showCourseDialog}
        onClose={() => setShowCourseDialog(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedCourse && (
          <>
            <DialogTitle>
              <Box className="flex items-start justify-between">
                <Box>
                  <Typography variant="h5" className="font-bold mb-1">
                    {selectedCourse.title}
                  </Typography>
                  <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                    {selectedCourse.instructor}
                  </Typography>
                </Box>
                <IconButton onClick={() => setShowCourseDialog(false)}>
                  <ChevronRight />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box className="space-y-4">
                {/* Course Stats */}
                <Grid container spacing={2}>
                  <Grid item xs={6} md={3}>
                    <Box className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                      <Clock className="mx-auto mb-1 text-blue-600" />
                      <Typography variant="body2">{selectedCourse.duration}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Box className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded">
                      <Video className="mx-auto mb-1 text-green-600" />
                      <Typography variant="body2">{selectedCourse.videos} videos</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Box className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded">
                      <FileText className="mx-auto mb-1 text-purple-600" />
                      <Typography variant="body2">{selectedCourse.resources} resources</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Box className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                      <Star className="mx-auto mb-1 text-yellow-600" />
                      <Typography variant="body2">{selectedCourse.rating} rating</Typography>
                    </Box>
                  </Grid>
                </Grid>

                {/* Description */}
                <Box>
                  <Typography variant="h6" className="font-semibold mb-2">
                    About This Course
                  </Typography>
                  <Typography className="text-gray-600 dark:text-gray-400">
                    {selectedCourse.description}
                  </Typography>
                </Box>

                {/* Topics Covered */}
                <Box>
                  <Typography variant="h6" className="font-semibold mb-2">
                    What You'll Learn
                  </Typography>
                  <Grid container spacing={1}>
                    {selectedCourse.topics.map((topic, index) => (
                      <Grid item xs={12} sm={6} key={index}>
                        <Box className="flex items-center gap-2">
                          <CheckCircle size={16} className="text-green-600" />
                          <Typography variant="body2">{topic}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>

                {/* Features */}
                <Box>
                  <Typography variant="h6" className="font-semibold mb-2">
                    Course Features
                  </Typography>
                  <Box className="flex flex-wrap gap-2">
                    <Chip label={selectedCourse.difficulty} size="small" />
                    {selectedCourse.hasCertificate && (
                      <Chip label="Certificate" icon={<Award size={16} />} size="small" />
                    )}
                    {selectedCourse.hasQuiz && (
                      <Chip label="Quiz" icon={<FileText size={16} />} size="small" />
                    )}
                    <Chip label={`${selectedCourse.resources} Resources`} icon={<Download size={16} />} size="small" />
                  </Box>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions className="p-4">
              <Button onClick={() => setShowCourseDialog(false)}>
                Close
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  handleEnrollCourse(selectedCourse.id);
                  setShowCourseDialog(false);
                }}
                startIcon={<PlayCircle />}
              >
                {userProgress[selectedCourse.id] ? 'Continue' : 'Start'} Course
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default TrainingLibrary;