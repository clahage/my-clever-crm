import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, Card, CardContent, LinearProgress,
  Chip, Avatar, Alert, CircularProgress, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow
} from '@mui/material';
import { TrendingUp, Award, Clock, Target, BookOpen, CheckCircle } from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../contexts/AuthContext';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const CHART_COLORS = ['#2196F3', '#4CAF50', '#FF9800', '#F44336', '#9C27B0'];

const ProgressTab = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enrollments, setEnrollments] = useState([]);
  const [quizResults, setQuizResults] = useState([]);
  const [stats, setStats] = useState({
    totalEnrolled: 0,
    completed: 0,
    avgProgress: 0,
    studyHours: 0,
    avgQuizScore: 0,
    streak: 0
  });

  useEffect(() => {
    loadProgressData();
  }, [currentUser]);

  const loadProgressData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load enrollments
      const enrollmentsRef = collection(db, 'courseEnrollments');
      const enrollmentsSnap = await getDocs(
        query(enrollmentsRef, where('userId', '==', currentUser.uid))
      );
      const enrollmentsData = enrollmentsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEnrollments(enrollmentsData);

      // Load quiz results
      const quizResultsRef = collection(db, 'quizResults');
      const quizResultsSnap = await getDocs(
        query(quizResultsRef, where('userId', '==', currentUser.uid))
      );
      const quizResultsData = quizResultsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setQuizResults(quizResultsData);

      // Calculate stats
      const completed = enrollmentsData.filter(e => e.progress === 100).length;
      const avgProgress = enrollmentsData.length > 0
        ? Math.round(enrollmentsData.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollmentsData.length)
        : 0;
      const avgQuizScore = quizResultsData.length > 0
        ? Math.round(quizResultsData.reduce((sum, r) => sum + (r.score || 0), 0) / quizResultsData.length)
        : 0;
      const studyHours = enrollmentsData.reduce((sum, e) => sum + (e.studyHours || 0), 0);

      setStats({
        totalEnrolled: enrollmentsData.length,
        completed,
        avgProgress,
        studyHours,
        avgQuizScore,
        streak: 7 // Calculate from activity logs
      });

    } catch (err) {
      console.error('Error loading progress data:', err);
      setError('Failed to load progress data');
    } finally {
      setLoading(false);
    }
  };

  const progressOverTime = [
    { month: 'Jan', progress: 20 },
    { month: 'Feb', progress: 35 },
    { month: 'Mar', progress: 45 },
    { month: 'Apr', progress: 60 },
    { month: 'May', progress: 75 },
    { month: 'Jun', progress: stats.avgProgress },
  ];

  const categoryProgress = [
    { category: 'Credit Basics', completed: 3, total: 5 },
    { category: 'Dispute Letters', completed: 2, total: 4 },
    { category: 'Sales', completed: 1, total: 3 },
    { category: 'Compliance', completed: 1, total: 2 },
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
        <TrendingUp size={24} />
        <Typography variant="h5" fontWeight="bold">
          Progress & Analytics
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
                    Courses Enrolled
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
                  <CheckCircle size={24} />
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
                <Avatar sx={{ bgcolor: 'info.main' }}>
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
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <Award size={24} />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.avgQuizScore}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg Quiz Score
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
              Progress Over Time
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={progressOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="progress"
                  stroke="#2196F3"
                  strokeWidth={2}
                  name="Progress %"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Completion Rate
            </Typography>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress
                variant="determinate"
                value={stats.avgProgress}
                size={150}
                thickness={5}
              />
              <Typography variant="h3" fontWeight="bold" sx={{ mt: 2 }}>
                {stats.avgProgress}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Overall Progress
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Category Progress */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Progress by Category
        </Typography>
        <Grid container spacing={2}>
          {categoryProgress.map((cat) => {
            const progress = Math.round((cat.completed / cat.total) * 100);
            return (
              <Grid item xs={12} sm={6} key={cat.category}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">{cat.category}</Typography>
                    <Typography variant="body2" fontWeight="600">
                      {cat.completed}/{cat.total} ({progress}%)
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Paper>

      {/* Recent Quiz Results */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Recent Quiz Results
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Quiz</TableCell>
                <TableCell>Score</TableCell>
                <TableCell>Result</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {quizResults.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No quiz results yet
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                quizResults.slice(0, 5).map((result) => (
                  <TableRow key={result.id}>
                    <TableCell>{result.quizTitle || 'Untitled Quiz'}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="600">
                        {result.score}%
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={result.passed ? 'Passed' : 'Failed'}
                        color={result.passed ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {result.completedAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default ProgressTab;
