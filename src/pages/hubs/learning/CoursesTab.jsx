import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, Card, CardContent, CardMedia, CardActions,
  Button, TextField, InputAdornment, FormControl, InputLabel, Select, MenuItem,
  Chip, Avatar, Alert, CircularProgress, Dialog, DialogTitle, DialogContent,
  DialogActions, Rating, Divider
} from '@mui/material';
import { BookOpen, Search, Filter, Clock, Users, Star, PlayCircle } from 'lucide-react';
import { collection, getDocs, addDoc, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../contexts/AuthContext';

const CoursesTab = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError('');

      const coursesRef = collection(db, 'courses');
      const coursesSnap = await getDocs(query(coursesRef, orderBy('createdAt', 'desc')));
      const coursesData = coursesSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCourses(coursesData);

    } catch (err) {
      console.error('Error loading courses:', err);
      setError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      setEnrolling(true);
      setError('');
      setSuccess('');

      const course = courses.find(c => c.id === courseId);

      // Check if already enrolled
      const enrollmentsRef = collection(db, 'courseEnrollments');
      const existingEnrollment = await getDocs(
        query(
          enrollmentsRef,
          where('userId', '==', currentUser.uid),
          where('courseId', '==', courseId)
        )
      );

      if (!existingEnrollment.empty) {
        setError('You are already enrolled in this course');
        return;
      }

      // Create enrollment
      await addDoc(enrollmentsRef, {
        userId: currentUser.uid,
        courseId,
        courseName: course.title,
        progress: 0,
        enrolledAt: serverTimestamp(),
        studyHours: 0,
        lastAccessedAt: serverTimestamp()
      });

      setSuccess(`Successfully enrolled in ${course.title}!`);
      setDialogOpen(false);

    } catch (err) {
      console.error('Error enrolling in course:', err);
      setError('Failed to enroll in course');
    } finally {
      setEnrolling(false);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = !searchQuery ||
      course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || course.category === categoryFilter;
    const matchesDifficulty = difficultyFilter === 'all' || course.difficulty === difficultyFilter;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const categories = ['all', 'credit-basics', 'dispute-letters', 'client-management', 'sales', 'compliance', 'advanced'];
  const difficulties = ['all', 'beginner', 'intermediate', 'advanced', 'expert'];

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
        <BookOpen size={24} />
        <Typography variant="h5" fontWeight="bold">
          Course Library
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

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
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
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                label="Category"
              >
                {categories.map(cat => (
                  <MenuItem key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Difficulty</InputLabel>
              <Select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                label="Difficulty"
              >
                {difficulties.map(diff => (
                  <MenuItem key={diff} value={diff}>
                    {diff === 'all' ? 'All Levels' : diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Course Grid */}
      <Grid container spacing={3}>
        {filteredCourses.length === 0 ? (
          <Grid item xs={12}>
            <Alert severity="info">
              No courses found. Try adjusting your filters or search query.
            </Alert>
          </Grid>
        ) : (
          filteredCourses.map((course) => (
            <Grid item xs={12} sm={6} md={4} key={course.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="div"
                  sx={{
                    height: 180,
                    bgcolor: 'primary.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <BookOpen size={64} color="white" />
                </CardMedia>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom fontWeight="600">
                    {course.title || 'Untitled Course'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {course.description || 'No description available'}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Chip
                      label={course.difficulty || 'Beginner'}
                      size="small"
                      color={
                        course.difficulty === 'beginner' ? 'success' :
                        course.difficulty === 'intermediate' ? 'warning' :
                        course.difficulty === 'advanced' ? 'error' : 'default'
                      }
                    />
                    <Chip
                      label={course.category || 'General'}
                      size="small"
                      variant="outlined"
                    />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Clock size={16} />
                      <Typography variant="caption">
                        {course.duration || '2h'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Users size={16} />
                      <Typography variant="caption">
                        {course.enrolledCount || 0} students
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Rating value={course.rating || 4.5} precision={0.5} size="small" readOnly />
                    <Typography variant="caption">
                      ({course.reviewCount || 0})
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<PlayCircle size={18} />}
                    onClick={() => {
                      setSelectedCourse(course);
                      setDialogOpen(true);
                    }}
                  >
                    Enroll Now
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Course Details Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedCourse?.title || 'Course Details'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            {selectedCourse?.description || 'No description available'}
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" gutterBottom>
            What you'll learn:
          </Typography>
          <Box component="ul" sx={{ pl: 2 }}>
            <li>Master credit repair fundamentals</li>
            <li>Learn effective dispute strategies</li>
            <li>Understand FCRA compliance</li>
            <li>Build client relationships</li>
          </Box>
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Chip label={`${selectedCourse?.lessons || 10} lessons`} />
            <Chip label={`${selectedCourse?.duration || '2h'} total`} />
            <Chip label={selectedCourse?.difficulty || 'Beginner'} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => handleEnroll(selectedCourse.id)}
            disabled={enrolling}
            startIcon={enrolling ? <CircularProgress size={20} /> : <PlayCircle size={18} />}
          >
            {enrolling ? 'Enrolling...' : 'Enroll Now'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CoursesTab;
