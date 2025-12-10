// Path: /src/pages/hubs/analytics/FunnelTab.jsx
// ============================================================================
// ANALYTICS HUB - CONVERSION FUNNEL TAB
// ============================================================================
// Purpose: Sales funnel optimization and conversion rate analysis
// Version: 1.0.0
// Last Updated: 2025-12-10
// Firebase Collections: conversions, funnelSteps
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
  GitBranch,
  TrendingUp,
  Target,
  Users,
  UserCheck,
  ArrowRight
} from 'lucide-react';
import {
  FunnelChart,
  Funnel,
  LabelList,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from 'recharts';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const FunnelTab = () => {
  const [loading, setLoading] = useState(true);
  const [funnelData, setFunnelData] = useState([
    { stage: 'Visitors', value: 10000, conversion: 100 },
    { stage: 'Leads', value: 3500, conversion: 35 },
    { stage: 'Qualified', value: 1400, conversion: 40 },
    { stage: 'Proposals', value: 700, conversion: 50 },
    { stage: 'Clients', value: 350, conversion: 50 }
  ]);
  const [conversionRates, setConversionRates] = useState([]);
  const [stats, setStats] = useState({
    totalVisitors: 0,
    totalConversions: 0,
    overallConversionRate: 0,
    dropoffRate: 0
  });

  useEffect(() => {
    fetchFunnelData();
  }, []);

  const fetchFunnelData = async () => {
    try {
      setLoading(true);

      // In production, fetch from Firebase
      // For now, using sample data with calculations
      const totalVisitors = funnelData[0].value;
      const totalConversions = funnelData[funnelData.length - 1].value;
      const overallConversion = (totalConversions / totalVisitors) * 100;

      // Calculate conversion rates between stages
      const rates = [];
      for (let i = 0; i < funnelData.length - 1; i++) {
        const current = funnelData[i];
        const next = funnelData[i + 1];
        const rate = (next.value / current.value) * 100;
        rates.push({
          from: current.stage,
          to: next.stage,
          rate: rate,
          dropoff: 100 - rate
        });
      }
      setConversionRates(rates);

      // Calculate average dropoff
      const avgDropoff = rates.reduce((sum, r) => sum + r.dropoff, 0) / rates.length;

      setStats({
        totalVisitors,
        totalConversions,
        overallConversionRate: overallConversion,
        dropoffRate: avgDropoff
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching funnel data:', error);
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
            title="Total Visitors"
            value={stats.totalVisitors.toLocaleString()}
            subtitle="Top of funnel"
            icon={Users}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Conversions"
            value={stats.totalConversions}
            subtitle="New clients"
            icon={UserCheck}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Conversion Rate"
            value={`${stats.overallConversionRate.toFixed(2)}%`}
            subtitle="Overall funnel"
            icon={Target}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Avg Dropoff"
            value={`${stats.dropoffRate.toFixed(1)}%`}
            subtitle="Per stage"
            icon={TrendingUp}
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Funnel Visualization */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Conversion Funnel Visualization
        </Typography>
        <ResponsiveContainer width="100%" height={350}>
          <FunnelChart>
            <Tooltip />
            <Funnel
              dataKey="value"
              data={funnelData}
              isAnimationActive
            >
              <LabelList position="right" fill="#000" stroke="none" dataKey="stage" />
              <LabelList position="inside" fill="#fff" stroke="none" dataKey="value" />
              {funnelData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Funnel>
          </FunnelChart>
        </ResponsiveContainer>

        {/* Funnel Stage Cards */}
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {funnelData.map((stage, idx) => (
            <Grid item xs={12} sm={6} md key={idx}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    {stage.stage}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {stage.value.toLocaleString()}
                  </Typography>
                  <Chip
                    label={`${stage.conversion}%`}
                    size="small"
                    color="primary"
                    sx={{ mt: 1 }}
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Conversion Rates Table */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Stage-by-Stage Conversion Analysis
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>From Stage</TableCell>
                <TableCell>To Stage</TableCell>
                <TableCell align="right">Conversion Rate</TableCell>
                <TableCell align="right">Dropoff Rate</TableCell>
                <TableCell align="right">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {conversionRates.map((rate, index) => (
                <TableRow key={index}>
                  <TableCell>{rate.from}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ArrowRight size={16} />
                      {rate.to}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      label={`${rate.rate.toFixed(1)}%`}
                      size="small"
                      color="success"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      label={`${rate.dropoff.toFixed(1)}%`}
                      size="small"
                      color={rate.dropoff > 60 ? 'error' : 'warning'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {rate.rate > 40 ? (
                      <Chip label="Good" size="small" color="success" />
                    ) : rate.rate > 25 ? (
                      <Chip label="Fair" size="small" color="warning" />
                    ) : (
                      <Chip label="Needs Improvement" size="small" color="error" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Optimization Recommendations */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Optimization Recommendations
        </Typography>
        <Grid container spacing={2}>
          {conversionRates.map((rate, idx) => (
            rate.dropoff > 55 && (
              <Grid item xs={12} md={6} key={idx}>
                <Box sx={{ p: 2, bgcolor: 'warning.50', borderRadius: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    High Dropoff: {rate.from} to {rate.to}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {rate.dropoff.toFixed(1)}% dropoff detected. Consider:
                  </Typography>
                  <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                    • Simplify the process between these stages
                  </Typography>
                  <Typography variant="caption" display="block" color="text.secondary">
                    • Add follow-up automation
                  </Typography>
                  <Typography variant="caption" display="block" color="text.secondary">
                    • Improve lead qualification
                  </Typography>
                </Box>
              </Grid>
            )
          ))}
          {!conversionRates.some(rate => rate.dropoff > 55) && (
            <Grid item xs={12}>
              <Box sx={{ p: 2, bgcolor: 'success.50', borderRadius: 2, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Funnel is performing well! All stages have healthy conversion rates.
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Box>
  );
};

export default FunnelTab;
