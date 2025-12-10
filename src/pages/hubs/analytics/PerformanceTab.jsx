// Path: /src/pages/hubs/analytics/PerformanceTab.jsx
// ============================================================================
// ANALYTICS HUB - PERFORMANCE KPIs TAB
// ============================================================================
// Purpose: Key performance indicators and goal tracking
// Version: 1.0.0
// Last Updated: 2025-12-10
// Firebase Collections: kpis, goals
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
  Divider
} from '@mui/material';
import {
  Target,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertCircle,
  Activity,
  Award,
  BarChart3
} from 'lucide-react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

const PerformanceTab = () => {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState([
    {
      name: 'Customer Acquisition Cost',
      current: 285,
      target: 300,
      unit: '$',
      trend: 'down',
      status: 'good',
      change: -5.2
    },
    {
      name: 'Customer Lifetime Value',
      current: 4250,
      target: 4000,
      unit: '$',
      trend: 'up',
      status: 'excellent',
      change: 6.3
    },
    {
      name: 'Churn Rate',
      current: 5.8,
      target: 8.0,
      unit: '%',
      trend: 'down',
      status: 'good',
      change: -1.2
    },
    {
      name: 'Net Promoter Score',
      current: 68,
      target: 60,
      unit: '',
      trend: 'up',
      status: 'excellent',
      change: 8.0
    },
    {
      name: 'Monthly Recurring Revenue',
      current: 42300,
      target: 40000,
      unit: '$',
      trend: 'up',
      status: 'excellent',
      change: 5.8
    },
    {
      name: 'Sales Cycle Length',
      current: 14,
      target: 21,
      unit: ' days',
      trend: 'down',
      status: 'excellent',
      change: -33.3
    }
  ]);

  const [radarData, setRadarData] = useState([
    { metric: 'Revenue', current: 85, target: 100 },
    { metric: 'Growth', current: 78, target: 100 },
    { metric: 'Retention', current: 92, target: 100 },
    { metric: 'Satisfaction', current: 88, target: 100 },
    { metric: 'Efficiency', current: 75, target: 100 }
  ]);

  useEffect(() => {
    fetchKPIData();
  }, []);

  const fetchKPIData = async () => {
    try {
      setLoading(true);
      // In production, fetch from Firebase kpis and goals collections
      setLoading(false);
    } catch (error) {
      console.error('Error fetching KPI data:', error);
      setLoading(false);
    }
  };

  const formatValue = (value, unit) => {
    if (unit === '$') {
      return `$${value.toLocaleString()}`;
    }
    return `${value}${unit}`;
  };

  const getProgressColor = (current, target, trend) => {
    const ratio = current / target;
    if (trend === 'down') {
      // For metrics where lower is better
      return ratio <= 1 ? 'success' : ratio <= 1.2 ? 'warning' : 'error';
    } else {
      // For metrics where higher is better
      return ratio >= 1 ? 'success' : ratio >= 0.8 ? 'warning' : 'error';
    }
  };

  const calculateProgress = (current, target, trend) => {
    if (trend === 'down') {
      // For metrics where lower is better
      return Math.min((target / current) * 100, 100);
    } else {
      // For metrics where higher is better
      return Math.min((current / target) * 100, 100);
    }
  };

  if (loading) {
    return <Box sx={{ width: '100%' }}><LinearProgress /></Box>;
  }

  return (
    <Box>
      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {kpis.map((kpi, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {kpi.name}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {formatValue(kpi.current, kpi.unit)}
                    </Typography>
                  </Box>
                  <Chip
                    label={kpi.status}
                    size="small"
                    color={kpi.status === 'excellent' ? 'success' : 'primary'}
                    sx={{ textTransform: 'capitalize' }}
                  />
                </Box>

                <Box sx={{ mb: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      Target: {formatValue(kpi.target, kpi.unit)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {calculateProgress(kpi.current, kpi.target, kpi.trend).toFixed(0)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={calculateProgress(kpi.current, kpi.target, kpi.trend)}
                    color={getProgressColor(kpi.current, kpi.target, kpi.trend)}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                  {kpi.trend === 'up' ? (
                    <TrendingUp size={16} color={kpi.change > 0 ? '#10b981' : '#ef4444'} />
                  ) : (
                    <TrendingDown size={16} color={kpi.change < 0 ? '#10b981' : '#ef4444'} />
                  )}
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      color: Math.abs(kpi.change) > 0 ? 'success.main' : 'error.main'
                    }}
                  >
                    {kpi.change > 0 ? '+' : ''}{kpi.change.toFixed(1)}% vs last period
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Performance Radar Chart */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Overall Performance Score
        </Typography>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="metric" />
            <PolarRadiusAxis angle={90} domain={[0, 100]} />
            <Radar
              name="Current"
              dataKey="current"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.6}
            />
            <Radar
              name="Target"
              dataKey="target"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.3}
            />
            <Legend />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </Paper>

      {/* Performance Summary */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Award size={20} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Achievements
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {kpis.filter(kpi => kpi.status === 'excellent').map((kpi, idx) => (
              <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <CheckCircle size={18} color="#10b981" />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {kpi.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Exceeding target by {(((kpi.current / kpi.target) - 1) * 100).toFixed(1)}%
                  </Typography>
                </Box>
              </Box>
            ))}
            {kpis.filter(kpi => kpi.status === 'excellent').length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No achievements to display
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Target size={20} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Improvement Areas
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {kpis.filter(kpi => kpi.status !== 'excellent').map((kpi, idx) => (
              <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <AlertCircle size={18} color="#f59e0b" />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {kpi.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {((1 - (kpi.current / kpi.target)) * 100).toFixed(1)}% below target
                  </Typography>
                </Box>
              </Box>
            ))}
            {kpis.filter(kpi => kpi.status !== 'excellent').length === 0 && (
              <Box sx={{ p: 2, bgcolor: 'success.50', borderRadius: 2, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                  All KPIs are meeting or exceeding targets!
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Quick Stats */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Performance Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Avatar sx={{ width: 56, height: 56, bgcolor: 'success.main', mx: 'auto', mb: 1 }}>
                    <CheckCircle size={32} />
                  </Avatar>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {kpis.filter(kpi => kpi.status === 'excellent').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    KPIs Exceeding Target
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', mx: 'auto', mb: 1 }}>
                    <Target size={32} />
                  </Avatar>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {kpis.filter(kpi => kpi.status === 'good').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    KPIs On Track
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Avatar sx={{ width: 56, height: 56, bgcolor: 'info.main', mx: 'auto', mb: 1 }}>
                    <Activity size={32} />
                  </Avatar>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {((kpis.filter(kpi => kpi.status === 'excellent' || kpi.status === 'good').length / kpis.length) * 100).toFixed(0)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Overall Success Rate
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

export default PerformanceTab;
