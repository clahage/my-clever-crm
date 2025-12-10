// Path: /src/pages/hubs/analytics/ExecutiveTab.jsx
// ============================================================================
// ANALYTICS HUB - EXECUTIVE DASHBOARD TAB
// ============================================================================
// Purpose: High-level business metrics and KPI dashboard for executives
// Version: 1.0.0
// Last Updated: 2025-12-10
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  LinearProgress,
  Avatar,
  Paper,
  Divider,
  Alert,
  AlertTitle
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Target,
  Activity,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart
} from 'recharts';
import { collection, query, getDocs, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../contexts/AuthContext';

const ExecutiveTab = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    revenueGrowth: 0,
    totalClients: 0,
    clientGrowth: 0,
    mrr: 0,
    mrrGrowth: 0,
    conversionRate: 0,
    conversionGrowth: 0
  });
  const [revenueData, setRevenueData] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetchExecutiveMetrics();
  }, []);

  const fetchExecutiveMetrics = async () => {
    try {
      setLoading(true);

      // Fetch revenue data
      const paymentsQuery = query(collection(db, 'payments'), orderBy('createdAt', 'desc'));
      const paymentsSnap = await getDocs(paymentsQuery);
      const payments = paymentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Calculate total revenue
      const totalRevenue = payments.reduce((sum, payment) => {
        return sum + (parseFloat(payment.amount) || 0);
      }, 0);

      // Fetch clients
      const clientsQuery = query(collection(db, 'clients'));
      const clientsSnap = await getDocs(clientsQuery);
      const totalClients = clientsSnap.size;

      // Calculate monthly revenue data
      const monthlyRevenue = calculateMonthlyRevenue(payments);
      setRevenueData(monthlyRevenue);

      // Calculate growth rates (simplified)
      const revenueGrowth = monthlyRevenue.length > 1 ?
        ((monthlyRevenue[monthlyRevenue.length - 1].revenue - monthlyRevenue[monthlyRevenue.length - 2].revenue) /
         monthlyRevenue[monthlyRevenue.length - 2].revenue * 100) : 0;

      setMetrics({
        totalRevenue,
        revenueGrowth,
        totalClients,
        clientGrowth: 8.5,
        mrr: totalRevenue / 6,
        mrrGrowth: 12.3,
        conversionRate: 32.5,
        conversionGrowth: 5.2
      });

      // Generate alerts
      generateAlerts(totalRevenue, totalClients, revenueGrowth);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching executive metrics:', error);
      setLoading(false);
    }
  };

  const calculateMonthlyRevenue = (payments) => {
    const monthlyData = {};
    payments.forEach(payment => {
      const date = payment.createdAt?.toDate();
      if (date) {
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { revenue: 0, count: 0 };
        }
        monthlyData[monthKey].revenue += parseFloat(payment.amount) || 0;
        monthlyData[monthKey].count += 1;
      }
    });

    return Object.keys(monthlyData)
      .sort()
      .slice(-6)
      .map(key => ({
        month: new Date(key + '-01').toLocaleDateString('en-US', { month: 'short' }),
        revenue: monthlyData[key].revenue,
        count: monthlyData[key].count
      }));
  };

  const generateAlerts = (revenue, clients, growth) => {
    const newAlerts = [];

    if (growth > 15) {
      newAlerts.push({
        severity: 'success',
        title: 'Strong Growth',
        message: `Revenue up ${growth.toFixed(1)}% - trending strongly`
      });
    } else if (growth < 0) {
      newAlerts.push({
        severity: 'warning',
        title: 'Revenue Decline',
        message: `Revenue down ${Math.abs(growth).toFixed(1)}% - needs attention`
      });
    }

    if (clients > 300) {
      newAlerts.push({
        severity: 'info',
        title: 'Milestone Reached',
        message: 'Exceeded 300 active clients'
      });
    }

    setAlerts(newAlerts);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const MetricCard = ({ title, value, change, icon: Icon, color, trend }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
              {value}
            </Typography>
            {change !== undefined && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {trend === 'up' ? (
                  <ArrowUpRight size={16} style={{ color: change >= 0 ? '#10b981' : '#ef4444' }} />
                ) : (
                  <ArrowDownRight size={16} style={{ color: change < 0 ? '#10b981' : '#ef4444' }} />
                )}
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    color: change >= 0 ? 'success.main' : 'error.main'
                  }}
                >
                  {change >= 0 ? '+' : ''}{change.toFixed(1)}%
                </Typography>
              </Box>
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
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Alerts */}
      {alerts.length > 0 && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {alerts.map((alert, idx) => (
            <Grid item xs={12} md={6} key={idx}>
              <Alert severity={alert.severity}>
                <AlertTitle>{alert.title}</AlertTitle>
                {alert.message}
              </Alert>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Revenue"
            value={formatCurrency(metrics.totalRevenue)}
            change={metrics.revenueGrowth}
            icon={DollarSign}
            color="primary"
            trend="up"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Clients"
            value={metrics.totalClients}
            change={metrics.clientGrowth}
            icon={Users}
            color="success"
            trend="up"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Monthly Recurring Revenue"
            value={formatCurrency(metrics.mrr)}
            change={metrics.mrrGrowth}
            icon={Activity}
            color="info"
            trend="up"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Conversion Rate"
            value={`${metrics.conversionRate}%`}
            change={metrics.conversionGrowth}
            icon={Target}
            color="warning"
            trend="up"
          />
        </Grid>
      </Grid>

      {/* Revenue Trend Chart */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Revenue Trend (Last 6 Months)
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip
              formatter={(value, name) => {
                if (name === 'Revenue') return formatCurrency(value);
                return value;
              }}
            />
            <Legend />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="revenue"
              fill="#3b82f6"
              stroke="#3b82f6"
              fillOpacity={0.3}
              name="Revenue"
            />
            <Bar
              yAxisId="right"
              dataKey="count"
              fill="#10b981"
              name="Payments"
              opacity={0.6}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </Paper>

      {/* Summary Insights */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <BarChart3 size={20} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Performance Summary
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Avg Revenue/Month</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {formatCurrency(metrics.mrr)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Revenue Growth</Typography>
                <Chip
                  label={`${metrics.revenueGrowth >= 0 ? '+' : ''}${metrics.revenueGrowth.toFixed(1)}%`}
                  size="small"
                  color={metrics.revenueGrowth >= 0 ? 'success' : 'error'}
                  sx={{ height: 20 }}
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Client Growth</Typography>
                <Chip
                  label={`+${metrics.clientGrowth.toFixed(1)}%`}
                  size="small"
                  color="success"
                  sx={{ height: 20 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Target size={20} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Goals Progress
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">Revenue Target</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    75%
                  </Typography>
                </Box>
                <LinearProgress variant="determinate" value={75} sx={{ height: 6, borderRadius: 3 }} />
              </Box>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">Client Target</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    85%
                  </Typography>
                </Box>
                <LinearProgress variant="determinate" value={85} color="success" sx={{ height: 6, borderRadius: 3 }} />
              </Box>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">Conversion Target</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    92%
                  </Typography>
                </Box>
                <LinearProgress variant="determinate" value={92} color="info" sx={{ height: 6, borderRadius: 3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <AlertCircle size={20} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Action Items
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                • Review high-value client accounts
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                • Optimize conversion funnel
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                • Schedule quarterly business review
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Analyze revenue trends
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ExecutiveTab;
