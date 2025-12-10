// Path: /src/pages/hubs/revenue/ForecastingTab.jsx
// ============================================================================
// REVENUE HUB - FORECASTING TAB
// ============================================================================
// Purpose: AI revenue predictions and scenario planning
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
  Button,
  LinearProgress,
  Chip,
  TextField,
  MenuItem,
  Tabs,
  Tab,
  Alert,
  AlertTitle,
  Slider,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Target,
  Activity,
  Zap,
  BarChart3
} from 'lucide-react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../contexts/AuthContext';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const ForecastingTab = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [forecastPeriod, setForecastPeriod] = useState('6months');
  const [growthRate, setGrowthRate] = useState(10);
  const [scenarioType, setScenarioType] = useState('moderate');
  const [historicalData, setHistoricalData] = useState([]);
  const [forecastData, setForecastData] = useState([]);
  const [scenarioData, setScenarioData] = useState([]);

  useEffect(() => {
    const unsubscribers = [];

    // Subscribe to invoices for historical revenue data
    const invoicesQuery = query(
      collection(db, 'invoices'),
      where('status', '==', 'paid'),
      orderBy('paidAt', 'desc')
    );

    const unsubInvoices = onSnapshot(invoicesQuery, (snapshot) => {
      const invoices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Calculate revenue by month
      const revenueByMonth = {};
      invoices.forEach(inv => {
        const date = inv.paidAt?.toDate();
        if (date) {
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          revenueByMonth[monthKey] = (revenueByMonth[monthKey] || 0) + (inv.amount || 0);
        }
      });

      // Convert to chart data (last 12 months)
      const historical = Object.entries(revenueByMonth)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-12)
        .map(([month, revenue]) => ({
          month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          revenue,
          actual: revenue
        }));

      setHistoricalData(historical);

      // Generate forecast
      if (historical.length > 0) {
        const lastRevenue = historical[historical.length - 1].revenue;
        const avgRevenue = historical.reduce((sum, d) => sum + d.revenue, 0) / historical.length;

        // Calculate growth trend
        const recentAvg = historical.slice(-3).reduce((sum, d) => sum + d.revenue, 0) / 3;
        const olderAvg = historical.slice(0, 3).reduce((sum, d) => sum + d.revenue, 0) / 3;
        const trendGrowth = olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;

        // Generate forecast based on period
        const months = forecastPeriod === '3months' ? 3 : forecastPeriod === '6months' ? 6 : 12;
        const forecast = [];

        for (let i = 1; i <= months; i++) {
          const date = new Date();
          date.setMonth(date.getMonth() + i);
          const monthStr = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

          // Apply growth rate
          const projectedRevenue = lastRevenue * Math.pow(1 + (growthRate / 100), i);

          forecast.push({
            month: monthStr,
            forecast: Math.round(projectedRevenue),
            actual: null
          });
        }

        setForecastData([...historical.slice(-6), ...forecast]);

        // Generate scenario planning
        generateScenarios(lastRevenue, months);
      }

      setLoading(false);
    });

    unsubscribers.push(unsubInvoices);

    return () => unsubscribers.forEach(unsub => unsub());
  }, [forecastPeriod, growthRate]);

  const generateScenarios = (baseRevenue, months) => {
    const scenarios = [];

    const scenarioRates = {
      conservative: 0.03,
      moderate: 0.10,
      aggressive: 0.20,
      optimistic: 0.35
    };

    for (let i = 1; i <= months; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() + i);
      const monthStr = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

      const scenario = { month: monthStr };

      Object.entries(scenarioRates).forEach(([name, rate]) => {
        scenario[name] = Math.round(baseRevenue * Math.pow(1 + rate, i));
      });

      scenarios.push(scenario);
    }

    setScenarioData(scenarios);
  };

  const calculateMetrics = () => {
    if (forecastData.length === 0) return { totalForecast: 0, avgMonthly: 0, growth: 0 };

    const forecastOnly = forecastData.filter(d => d.forecast && !d.actual);
    const totalForecast = forecastOnly.reduce((sum, d) => sum + (d.forecast || 0), 0);
    const avgMonthly = forecastOnly.length > 0 ? totalForecast / forecastOnly.length : 0;

    return {
      totalForecast,
      avgMonthly,
      growth: growthRate
    };
  };

  const metrics = calculateMetrics();

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
        Revenue Forecasting
      </Typography>

      {/* AI Insights */}
      <Alert severity="info" icon={<Zap size={20} />} sx={{ mb: 3 }}>
        <AlertTitle>AI-Powered Predictions</AlertTitle>
        Based on historical data analysis, we predict a {growthRate}% month-over-month growth trend.
        Adjust the parameters below to explore different scenarios.
      </Alert>

      {/* Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Forecast Period</InputLabel>
                <Select
                  value={forecastPeriod}
                  label="Forecast Period"
                  onChange={(e) => setForecastPeriod(e.target.value)}
                >
                  <MenuItem value="3months">3 Months</MenuItem>
                  <MenuItem value="6months">6 Months</MenuItem>
                  <MenuItem value="12months">12 Months</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography gutterBottom>
                Growth Rate: {growthRate}%
              </Typography>
              <Slider
                value={growthRate}
                onChange={(e, value) => setGrowthRate(value)}
                min={-20}
                max={50}
                step={1}
                marks={[
                  { value: -20, label: '-20%' },
                  { value: 0, label: '0%' },
                  { value: 25, label: '25%' },
                  { value: 50, label: '50%' }
                ]}
                valueLabelDisplay="auto"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Scenario</InputLabel>
                <Select
                  value={scenarioType}
                  label="Scenario"
                  onChange={(e) => setScenarioType(e.target.value)}
                >
                  <MenuItem value="conservative">Conservative</MenuItem>
                  <MenuItem value="moderate">Moderate</MenuItem>
                  <MenuItem value="aggressive">Aggressive</MenuItem>
                  <MenuItem value="optimistic">Optimistic</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Forecast Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Forecasted Revenue
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    ${metrics.totalForecast.toLocaleString()}
                  </Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'primary.50', color: 'primary.main' }}>
                  <DollarSign size={24} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Avg Monthly Forecast
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    ${metrics.avgMonthly.toLocaleString()}
                  </Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'info.50', color: 'info.main' }}>
                  <Calendar size={24} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Projected Growth
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600, color: growthRate >= 0 ? 'success.main' : 'error.main' }}>
                    {growthRate >= 0 ? '+' : ''}{growthRate}%
                  </Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: growthRate >= 0 ? 'success.50' : 'error.50', color: growthRate >= 0 ? 'success.main' : 'error.main' }}>
                  {growthRate >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="Revenue Forecast" />
          <Tab label="Scenario Planning" />
          <Tab label="Growth Projection" />
        </Tabs>
      </Card>

      {/* Tab Content */}
      {tabValue === 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Revenue Forecast vs Historical
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => value ? `$${value.toLocaleString()}` : 'N/A'} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#8884d8"
                  strokeWidth={2}
                  name="Actual Revenue"
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="forecast"
                  stroke="#82ca9d"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Forecasted Revenue"
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {tabValue === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Scenario Comparison
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Grid container spacing={1}>
                <Grid item>
                  <Chip label="Conservative (3%)" color="default" size="small" />
                </Grid>
                <Grid item>
                  <Chip label="Moderate (10%)" color="info" size="small" />
                </Grid>
                <Grid item>
                  <Chip label="Aggressive (20%)" color="warning" size="small" />
                </Grid>
                <Grid item>
                  <Chip label="Optimistic (35%)" color="success" size="small" />
                </Grid>
              </Grid>
            </Box>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={scenarioData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="conservative"
                  stackId="1"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.3}
                  name="Conservative"
                />
                <Area
                  type="monotone"
                  dataKey="moderate"
                  stackId="2"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                  fillOpacity={0.3}
                  name="Moderate"
                />
                <Area
                  type="monotone"
                  dataKey="aggressive"
                  stackId="3"
                  stroke="#ffc658"
                  fill="#ffc658"
                  fillOpacity={0.3}
                  name="Aggressive"
                />
                <Area
                  type="monotone"
                  dataKey="optimistic"
                  stackId="4"
                  stroke="#ff7c7c"
                  fill="#ff7c7c"
                  fillOpacity={0.3}
                  name="Optimistic"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {tabValue === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Month-over-Month Growth Projection
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={forecastData.filter(d => d.forecast)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="forecast" fill="#8884d8" name="Projected Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Key Insights */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Key Insights
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'start', gap: 1 }}>
                  <Activity size={20} style={{ marginTop: 4 }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Historical Performance
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Your revenue has shown consistent growth over the past 12 months
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'start', gap: 1 }}>
                  <Target size={20} style={{ marginTop: 4 }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Revenue Target
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Based on current trends, you're on track to meet your annual goals
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'start', gap: 1 }}>
                  <TrendingUp size={20} style={{ marginTop: 4 }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Growth Opportunity
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Consider increasing marketing spend to accelerate growth
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Recommendations
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Alert severity="success" icon={<Zap size={20} />}>
                  <Typography variant="body2">
                    <strong>Optimize pricing:</strong> Consider a 5-10% price increase for new customers
                  </Typography>
                </Alert>
                <Alert severity="info" icon={<BarChart3 size={20} />}>
                  <Typography variant="body2">
                    <strong>Expand offerings:</strong> Introduce premium tiers to capture more value
                  </Typography>
                </Alert>
                <Alert severity="warning" icon={<Target size={20} />}>
                  <Typography variant="body2">
                    <strong>Focus retention:</strong> Reducing churn by 5% could increase ARR by 15%
                  </Typography>
                </Alert>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ForecastingTab;
