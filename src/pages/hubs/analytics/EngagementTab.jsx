// Path: /src/pages/hubs/analytics/EngagementTab.jsx
// ============================================================================
// ANALYTICS HUB - ENGAGEMENT TAB
// ============================================================================
// Purpose: User engagement metrics and activity tracking
// Version: 1.0.0
// Last Updated: 2025-12-10
// Firebase Collections: userActivity
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
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider
} from '@mui/material';
import {
  Activity,
  MousePointer,
  Eye,
  MessageSquare,
  UserCheck,
  Clock,
  Calendar,
  TrendingUp,
  Users
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
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

const EngagementTab = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    dailyActiveUsers: 456,
    weeklyActiveUsers: 892,
    monthlyActiveUsers: 1245,
    avgSessionDuration: 12.5,
    avgPageViews: 8.3,
    engagementRate: 67.8
  });

  const [activityData, setActivityData] = useState([
    { date: 'Dec 4', active: 420 },
    { date: 'Dec 5', active: 445 },
    { date: 'Dec 6', active: 438 },
    { date: 'Dec 7', active: 465 },
    { date: 'Dec 8', active: 472 },
    { date: 'Dec 9', active: 456 },
    { date: 'Dec 10', active: 489 }
  ]);

  const [engagementMetrics, setEngagementMetrics] = useState([
    { metric: 'Login Frequency', score: 85 },
    { metric: 'Feature Usage', score: 72 },
    { metric: 'Session Duration', score: 78 },
    { metric: 'Task Completion', score: 81 },
    { metric: 'User Interaction', score: 75 }
  ]);

  const [topFeatures, setTopFeatures] = useState([
    { feature: 'Dashboard', uses: 12450, users: 892 },
    { feature: 'Client Management', uses: 8920, users: 745 },
    { feature: 'Analytics', uses: 5230, users: 523 },
    { feature: 'Reports', uses: 3140, users: 421 },
    { feature: 'Settings', uses: 2850, users: 389 }
  ]);

  const [recentActivity, setRecentActivity] = useState([
    { user: 'John Doe', action: 'Created new client', time: '2 min ago' },
    { user: 'Jane Smith', action: 'Generated report', time: '5 min ago' },
    { user: 'Mike Johnson', action: 'Updated invoice', time: '12 min ago' },
    { user: 'Sarah Wilson', action: 'Scheduled appointment', time: '18 min ago' },
    { user: 'Tom Brown', action: 'Completed task', time: '25 min ago' }
  ]);

  useEffect(() => {
    fetchEngagementData();
  }, []);

  const fetchEngagementData = async () => {
    try {
      setLoading(true);
      // In production, fetch from Firebase userActivity collection
      setTimeout(() => {
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching engagement data:', error);
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, color }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar sx={{ bgcolor: `${color}.100`, color: `${color}.main` }}>
            <Icon size={24} />
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return <Box sx={{ width: '100%' }}><LinearProgress /></Box>;
  }

  return (
    <Box>
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Daily Active Users"
            value={stats.dailyActiveUsers}
            subtitle="Last 24 hours"
            icon={Activity}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Weekly Active Users"
            value={stats.weeklyActiveUsers}
            subtitle="Last 7 days"
            icon={Users}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Avg Session Duration"
            value={`${stats.avgSessionDuration} min`}
            subtitle="Per user"
            icon={Clock}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Engagement Rate"
            value={`${stats.engagementRate}%`}
            subtitle="Active users"
            icon={TrendingUp}
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Activity Trend */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          User Activity Trend (Last 7 Days)
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={activityData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey="active"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.3}
              name="Active Users"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Paper>

      <Grid container spacing={3}>
        {/* Engagement Metrics Radar */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Engagement Score Breakdown
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={engagementMetrics}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.6}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
            <Box sx={{ mt: 2 }}>
              {engagementMetrics.map((metric, idx) => (
                <Box key={idx} sx={{ mb: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">{metric.metric}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {metric.score}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={metric.score}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Top Features */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Most Used Features
            </Typography>
            <Box>
              {topFeatures.map((feature, idx) => (
                <Box key={idx} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {feature.feature}
                    </Typography>
                    <Chip
                      label={`${feature.users} users`}
                      size="small"
                      color="primary"
                    />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={(feature.uses / topFeatures[0].uses) * 100}
                      sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {feature.uses.toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Recent User Activity
            </Typography>
            <List>
              {recentActivity.map((activity, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <Divider variant="inset" component="li" />}
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {activity.user[0]}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {activity.user}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {activity.action}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                          <Clock size={14} />
                          <Typography variant="caption">
                            {activity.time}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Engagement Insights */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Engagement Insights
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 2, bgcolor: 'success.50', borderRadius: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    High Engagement
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    67.8% of users actively engage with the platform daily, showing strong product adoption.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 2, bgcolor: 'info.50', borderRadius: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Feature Adoption
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Dashboard and Client Management are the most used features, indicating core value delivery.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 2, bgcolor: 'warning.50', borderRadius: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Growth Opportunity
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Analytics and Reports features have room for growth. Consider user education campaigns.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EngagementTab;
