// Path: /src/pages/hubs/analytics/MobileAnalyticsTab.jsx
// ============================================================================
// ANALYTICS HUB - MOBILE ANALYTICS TAB
// ============================================================================
// Purpose: Mobile app analytics and user engagement metrics
// Version: 1.0.0
// Last Updated: 2025-12-10
// Firebase Collections: mobileAnalytics
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Smartphone,
  Users,
  Activity,
  Clock,
  TrendingUp,
  Download,
  Monitor,
  Tablet
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const MobileAnalyticsTab = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 1245,
    activeUsers: 892,
    dailyActiveUsers: 456,
    avgSessionDuration: 8.5,
    downloads: 3420,
    rating: 4.6
  });

  const [deviceData, setDeviceData] = useState([
    { device: 'iOS', users: 680, percentage: 54.6 },
    { device: 'Android', users: 565, percentage: 45.4 }
  ]);

  const [screenData, setScreenData] = useState([
    { screen: 'Dashboard', views: 12450, avgTime: 45 },
    { screen: 'Clients', views: 8920, avgTime: 62 },
    { screen: 'Analytics', views: 5230, avgTime: 95 },
    { screen: 'Settings', views: 3140, avgTime: 38 },
    { screen: 'Reports', views: 2850, avgTime: 72 }
  ]);

  const [usageData, setUsageData] = useState([
    { day: 'Mon', sessions: 145 },
    { day: 'Tue', sessions: 167 },
    { day: 'Wed', sessions: 182 },
    { day: 'Thu', sessions: 159 },
    { day: 'Fri', sessions: 195 },
    { day: 'Sat', sessions: 128 },
    { day: 'Sun', sessions: 112 }
  ]);

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

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
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Mobile Users"
            value={stats.totalUsers.toLocaleString()}
            subtitle="All-time users"
            icon={Smartphone}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Daily Active Users"
            value={stats.dailyActiveUsers}
            subtitle={`${((stats.dailyActiveUsers / stats.totalUsers) * 100).toFixed(1)}% of total`}
            icon={Activity}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Avg Session Duration"
            value={`${stats.avgSessionDuration} min`}
            subtitle="Per user session"
            icon={Clock}
            color="info"
          />
        </Grid>
      </Grid>

      {/* Usage Trend */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Daily Session Trend (Last 7 Days)
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={usageData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey="sessions"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.3}
              name="Sessions"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Paper>

      <Grid container spacing={3}>
        {/* Device Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Device Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.device}: ${entry.percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="users"
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <Box sx={{ mt: 2 }}>
              {deviceData.map((device, idx) => (
                <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: COLORS[idx] }} />
                    <Typography variant="body2">{device.device}</Typography>
                  </Box>
                  <Chip label={device.users.toLocaleString()} size="small" />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Top Screens */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Most Viewed Screens
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Screen</TableCell>
                    <TableCell align="right">Views</TableCell>
                    <TableCell align="right">Avg Time (s)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {screenData.map((screen, index) => (
                    <TableRow key={index}>
                      <TableCell sx={{ fontWeight: 600 }}>{screen.screen}</TableCell>
                      <TableCell align="right">
                        {screen.views.toLocaleString()}
                      </TableCell>
                      <TableCell align="right">
                        <Chip label={`${screen.avgTime}s`} size="small" color="primary" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Additional Metrics */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Mobile App Performance
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', mx: 'auto', mb: 1 }}>
                    <Download size={32} />
                  </Avatar>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {stats.downloads.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Downloads
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Avatar sx={{ width: 56, height: 56, bgcolor: 'success.main', mx: 'auto', mb: 1 }}>
                    <TrendingUp size={32} />
                  </Avatar>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {stats.rating}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    App Rating
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Avatar sx={{ width: 56, height: 56, bgcolor: 'info.main', mx: 'auto', mb: 1 }}>
                    <Users size={32} />
                  </Avatar>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {stats.activeUsers}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Users
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Avatar sx={{ width: 56, height: 56, bgcolor: 'warning.main', mx: 'auto', mb: 1 }}>
                    <Clock size={32} />
                  </Avatar>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {stats.avgSessionDuration}m
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Session Duration
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

export default MobileAnalyticsTab;
