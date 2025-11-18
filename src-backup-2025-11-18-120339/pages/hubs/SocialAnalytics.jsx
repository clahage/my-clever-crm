// ============================================================================
// SocialAnalytics.jsx - SOCIAL MEDIA ANALYTICS
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  LinearProgress,
} from '@mui/material';
import {
  BarChart,
  TrendingUp,
  Users,
  Heart,
  MessageCircle,
  Share2,
  Eye,
  ThumbsUp,
} from 'lucide-react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useAuth } from '@/contexts/AuthContext';

const COLORS = ['#1877f2', '#e4405f', '#1da1f2', '#0a66c2'];

const SocialAnalytics = () => {
  const { currentUser } = useAuth();
  const [timeRange, setTimeRange] = useState('7days');
  
  const [metrics, setMetrics] = useState({
    totalReach: 12450,
    totalEngagement: 3200,
    totalFollowers: 1850,
    engagementRate: 4.2,
  });

  const [platformData] = useState([
    { platform: 'Facebook', followers: 850, engagement: 1200 },
    { platform: 'Instagram', followers: 650, engagement: 950 },
    { platform: 'Twitter', followers: 250, engagement: 680 },
    { platform: 'LinkedIn', followers: 100, engagement: 370 },
  ]);

  const [performanceData] = useState([
    { date: 'Mon', posts: 5, engagement: 420, reach: 1850 },
    { date: 'Tue', posts: 3, engagement: 380, reach: 1620 },
    { date: 'Wed', posts: 7, engagement: 520, reach: 2100 },
    { date: 'Thu', posts: 4, engagement: 450, reach: 1900 },
    { date: 'Fri', posts: 6, engagement: 580, reach: 2400 },
    { date: 'Sat', posts: 2, engagement: 320, reach: 1400 },
    { date: 'Sun', posts: 3, engagement: 380, reach: 1650 },
  ]);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Social Media Analytics</Typography>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Time Range</InputLabel>
          <Select value={timeRange} label="Time Range" onChange={(e) => setTimeRange(e.target.value)}>
            <MenuItem value="7days">Last 7 Days</MenuItem>
            <MenuItem value="30days">Last 30 Days</MenuItem>
            <MenuItem value="90days">Last 90 Days</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <Eye size={24} />
                </Avatar>
                <Box>
                  <Typography variant="h5">{metrics.totalReach.toLocaleString()}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Reach
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
                  <Heart size={24} />
                </Avatar>
                <Box>
                  <Typography variant="h5">{metrics.totalEngagement.toLocaleString()}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Engagement
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
                  <Users size={24} />
                </Avatar>
                <Box>
                  <Typography variant="h5">{metrics.totalFollowers.toLocaleString()}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Followers
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
                  <TrendingUp size={24} />
                </Avatar>
                <Box>
                  <Typography variant="h5">{metrics.engagementRate}%</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Engagement Rate
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
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Performance Overview
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="engagement" stroke="#8884d8" strokeWidth={2} />
                  <Line type="monotone" dataKey="reach" stroke="#82ca9d" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Platform Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={platformData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ platform, percent }) => `${platform} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="followers"
                  >
                    {platformData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Platform Performance */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Platform Performance
          </Typography>
          <Grid container spacing={2}>
            {platformData.map((platform, index) => (
              <Grid item xs={12} sm={6} md={3} key={platform.platform}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {platform.platform}
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h5">{platform.followers}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Followers
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Engagement: {platform.engagement}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={(platform.engagement / 1500) * 100}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SocialAnalytics;