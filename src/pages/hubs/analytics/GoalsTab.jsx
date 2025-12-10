// Path: /src/pages/hubs/analytics/GoalsTab.jsx
// ============================================================================
// ANALYTICS HUB - GOAL TRACKING TAB
// ============================================================================
// Purpose: Business goals and targets with progress tracking
// Version: 1.0.0
// Last Updated: 2025-12-10
// Firebase Collections: goals
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Paper,
  Chip,
  Button,
  IconButton,
  Divider,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Trophy,
  Target,
  TrendingUp,
  CheckCircle,
  Clock,
  Plus,
  Edit,
  Calendar,
  DollarSign,
  Users,
  BarChart3,
  Award
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar
} from 'recharts';
import { collection, query, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../contexts/AuthContext';

const GoalsTab = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [goals, setGoals] = useState([
    {
      id: 1,
      title: 'Q4 Revenue Target',
      target: 500000,
      current: 375000,
      unit: '$',
      category: 'Revenue',
      deadline: '2025-12-31',
      status: 'on-track',
      icon: DollarSign,
      color: 'success'
    },
    {
      id: 2,
      title: 'New Client Acquisition',
      target: 100,
      current: 75,
      unit: '',
      category: 'Growth',
      deadline: '2025-12-31',
      status: 'on-track',
      icon: Users,
      color: 'primary'
    },
    {
      id: 3,
      title: 'Customer Retention Rate',
      target: 95,
      current: 94.2,
      unit: '%',
      category: 'Retention',
      deadline: '2025-12-31',
      status: 'at-risk',
      icon: Target,
      color: 'warning'
    },
    {
      id: 4,
      title: 'Monthly Recurring Revenue',
      target: 50000,
      current: 42300,
      unit: '$',
      category: 'Revenue',
      deadline: '2025-12-31',
      status: 'on-track',
      icon: TrendingUp,
      color: 'info'
    }
  ]);

  const [progressData, setProgressData] = useState([
    { month: 'Jul', revenue: 350000, target: 375000 },
    { month: 'Aug', revenue: 360000, target: 400000 },
    { month: 'Sep', revenue: 365000, target: 425000 },
    { month: 'Oct', revenue: 370000, target: 450000 },
    { month: 'Nov', revenue: 375000, target: 475000 },
    { month: 'Dec', revenue: 0, target: 500000 }
  ]);

  const [newGoal, setNewGoal] = useState({
    title: '',
    target: '',
    category: 'Revenue',
    deadline: ''
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      // In production, fetch from Firebase goals collection
      setTimeout(() => {
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching goals:', error);
      setLoading(false);
    }
  };

  const handleCreateGoal = async () => {
    try {
      // In production, save to Firebase
      const goal = {
        ...newGoal,
        current: 0,
        status: 'not-started',
        createdBy: userProfile?.uid,
        createdAt: new Date()
      };

      setGoals([...goals, { ...goal, id: goals.length + 1 }]);
      setOpenDialog(false);
      setNewGoal({ title: '', target: '', category: 'Revenue', deadline: '' });
    } catch (error) {
      console.error('Error creating goal:', error);
    }
  };

  const calculateProgress = (current, target) => {
    return Math.min((current / target) * 100, 100);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'on-track':
        return 'info';
      case 'at-risk':
        return 'warning';
      case 'behind':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatValue = (value, unit) => {
    if (unit === '$') {
      return `$${value.toLocaleString()}`;
    }
    return `${value}${unit}`;
  };

  const GoalCard = ({ goal }) => {
    const Icon = goal.icon;
    const progress = calculateProgress(goal.current, goal.target);

    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, flex: 1 }}>
              <Avatar sx={{ bgcolor: `${goal.color}.100`, color: `${goal.color}.main` }}>
                <Icon size={24} />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {goal.title}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <Chip label={goal.category} size="small" />
                  <Chip
                    label={goal.status}
                    size="small"
                    color={getStatusColor(goal.status)}
                    sx={{ textTransform: 'capitalize' }}
                  />
                </Box>
              </Box>
            </Box>
            <IconButton size="small">
              <Edit size={18} />
            </IconButton>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Progress
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {formatValue(goal.current, goal.unit)} / {formatValue(goal.target, goal.unit)}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              color={goal.color}
              sx={{ height: 8, borderRadius: 4, mb: 0.5 }}
            />
            <Typography variant="caption" color="text.secondary">
              {progress.toFixed(1)}% Complete
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Calendar size={14} />
            <Typography variant="caption" color="text.secondary">
              Deadline: {new Date(goal.deadline).toLocaleDateString()}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return <Box sx={{ width: '100%' }}><LinearProgress /></Box>;
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
            Business Goals & Targets
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track progress towards your business objectives
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={() => setOpenDialog(true)}
        >
          Add Goal
        </Button>
      </Box>

      {/* Summary Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Goals
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {goals.length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.100', color: 'primary.main' }}>
                  <Target size={24} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    On Track
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {goals.filter(g => g.status === 'on-track').length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.100', color: 'success.main' }}>
                  <CheckCircle size={24} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    At Risk
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {goals.filter(g => g.status === 'at-risk').length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.100', color: 'warning.main' }}>
                  <Clock size={24} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Avg Progress
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {(goals.reduce((sum, g) => sum + calculateProgress(g.current, g.target), 0) / goals.length).toFixed(0)}%
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.100', color: 'info.main' }}>
                  <TrendingUp size={24} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Progress Chart */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Revenue Goal Progress
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={progressData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip
              formatter={(value) => `$${value.toLocaleString()}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Actual"
              dot={{ fill: '#3b82f6', r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="target"
              stroke="#10b981"
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Target"
              dot={{ fill: '#10b981', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Paper>

      {/* Goals Grid */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Active Goals
      </Typography>
      <Grid container spacing={3}>
        {goals.map((goal) => (
          <Grid item xs={12} md={6} key={goal.id}>
            <GoalCard goal={goal} />
          </Grid>
        ))}
      </Grid>

      {/* Achievements */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Award size={20} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Recent Achievements
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2, bgcolor: 'success.50', borderRadius: 2, textAlign: 'center' }}>
              <Trophy size={32} color="#10b981" style={{ marginBottom: 8 }} />
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                Revenue Milestone
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Reached 75% of Q4 revenue target
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2, bgcolor: 'info.50', borderRadius: 2, textAlign: 'center' }}>
              <Trophy size={32} color="#3b82f6" style={{ marginBottom: 8 }} />
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                Client Growth
              </Typography>
              <Typography variant="caption" color="text.secondary">
                75 new clients acquired this quarter
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2, bgcolor: 'warning.50', borderRadius: 2, textAlign: 'center' }}>
              <Trophy size={32} color="#f59e0b" style={{ marginBottom: 8 }} />
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                High Retention
              </Typography>
              <Typography variant="caption" color="text.secondary">
                94.2% customer retention rate maintained
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Create Goal Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Goal</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Goal Title"
              fullWidth
              value={newGoal.title}
              onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
            />
            <TextField
              label="Target Value"
              type="number"
              fullWidth
              value={newGoal.target}
              onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={newGoal.category}
                onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                label="Category"
              >
                <MenuItem value="Revenue">Revenue</MenuItem>
                <MenuItem value="Growth">Growth</MenuItem>
                <MenuItem value="Retention">Retention</MenuItem>
                <MenuItem value="Efficiency">Efficiency</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Deadline"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={newGoal.deadline}
              onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateGoal}>
            Create Goal
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GoalsTab;
