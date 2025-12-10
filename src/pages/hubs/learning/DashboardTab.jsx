import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, Card, CardContent, LinearProgress,
  Chip, Avatar, Alert, CircularProgress, List, ListItem, ListItemText,
  ListItemAvatar, Button, Divider
} from '@mui/material';
import { LayoutDashboard, TrendingUp, BookOpen, Award, Clock, Target } from 'lucide-react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../contexts/AuthContext';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const CHART_COLORS = ['#2196F3', '#4CAF50', '#FF9800', '#F44336', '#9C27B0'];

const DashboardTab = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({
    totalEnrolled: 0,
    completed: 0,
    inProgress: 0,
    avgProgress: 0,
    studyHours: 0,
    streak: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, [currentUser]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load user's course enrollments
      const enrollmentsRef = collection(db, 'courseEnrollments');
      const enrollmentsQuery = query(
        enrollmentsRef,
        where('userId', '==', currentUser.uid),
        orderBy('enrolledAt', 'desc')
      );
      const enrollmentsSnap = await getDocs(enrollmentsQuery);
      const enrollmentsData = enrollmentsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEnrollments(enrollmentsData);

      // Load courses
      const coursesRef = collection(db, 'courses');
      const coursesSnap = await getDocs(coursesRef);
      const coursesData = coursesSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCourses(coursesData);

      // Calculate stats
      const completed = enrollmentsData.filter(e => e.progress === 100).length;
      const inProgress = enrollmentsData.filter(e => e.progress > 0 && e.progress < 100).length;
      const avgProgress = enrollmentsData.length > 0
        ? Math.round(enrollmentsData.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollmentsData.length)
        : 0;

      setStats({
        totalEnrolled: enrollmentsData.length,
        completed,
        inProgress,
        avgProgress,
        studyHours: enrollmentsData.reduce((sum, e) => sum + (e.studyHours || 0), 0),
        streak: 7 // Could calculate from activity logs
      });

    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const progressData = [
    { month: 'Jan', progress: 20 },
    { month: 'Feb', progress: 35 },
    { month: 'Mar', progress: 45 },
    { month: 'Apr', progress: 60 },
    { month: 'May', progress: 75 },
    { month: 'Jun', progress: stats.avgProgress },
  ];

  const categoryData = [
    { name: 'Credit Basics', value: 3 },
    { name: 'Dispute Letters', value: 2 },
    { name: 'Sales', value: 1 },
    { name: 'Compliance', value: 1 },
  ];

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
        <LayoutDashboard size={24} />
        <Typography variant="h5" fontWeight="bold">
          Learning Dashboard
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <BookOpen size={24} />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.totalEnrolled}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Enrolled Courses
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <Award size={24} />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.completed}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <Clock size={24} />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.studyHours}h
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Study Time
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'error.main' }}>
                  <Target size={24} />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.streak}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Day Streak
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Learning Progress Trend
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="progress" stroke="#2196F3" strokeWidth={2} name="Progress %" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Course Categories
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.name}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Enrolled Courses */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Your Enrolled Courses
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {enrollments.length === 0 ? (
          <Alert severity="info">
            You haven't enrolled in any courses yet. Browse the Course Library to get started!
          </Alert>
        ) : (
          <List>
            {enrollments.map((enrollment) => {
              const course = courses.find(c => c.id === enrollment.courseId);
              return (
                <ListItem key={enrollment.id} sx={{ mb: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <BookOpen size={20} />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" fontWeight="600">
                        {enrollment.courseName || course?.title || 'Unknown Course'}
                      </Typography>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Progress: {enrollment.progress || 0}%
                          </Typography>
                          <Chip
                            label={enrollment.progress === 100 ? 'Completed' : 'In Progress'}
                            size="small"
                            color={enrollment.progress === 100 ? 'success' : 'warning'}
                          />
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={enrollment.progress || 0}
                          sx={{ height: 8, borderRadius: 1 }}
                        />
                      </Box>
                    }
                  />
                  <Button variant="outlined" size="small">
                    Continue
                  </Button>
                </ListItem>
              );
            })}
          </List>
        )}
      </Paper>
    </Box>
  );
};

export default DashboardTab;
