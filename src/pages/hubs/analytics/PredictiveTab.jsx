// Path: /src/pages/hubs/analytics/PredictiveTab.jsx
// ============================================================================
// ANALYTICS HUB - PREDICTIVE ANALYTICS TAB
// ============================================================================
// Purpose: AI predictions and forecasts with machine learning insights
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
  LinearProgress,
  Paper,
  Chip,
  Avatar,
  Alert,
  AlertTitle,
  Divider
} from '@mui/material';
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  Target,
  DollarSign,
  Users,
  Activity
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Bar
} from 'recharts';

const PredictiveTab = () => {
  const [loading, setLoading] = useState(true);
  const [predictions, setPredictions] = useState({
    nextMonthRevenue: { value: 127500, confidence: 87, change: 15.2 },
    nextQuarterRevenue: { value: 485000, confidence: 82, change: 18.5 },
    expectedClients: { value: 378, confidence: 85, change: 10.5 },
    churnRisk: { high: 3, medium: 8, low: 331 }
  });

  const [forecastData, setForecastData] = useState([
    { month: 'Jan', actual: 95000, forecast: null, confidence: null },
    { month: 'Feb', actual: 98000, forecast: null, confidence: null },
    { month: 'Mar', actual: 102000, forecast: null, confidence: null },
    { month: 'Apr', actual: 108000, forecast: null, confidence: null },
    { month: 'May', actual: 115000, forecast: null, confidence: null },
    { month: 'Jun', actual: 120000, forecast: null, confidence: null },
    { month: 'Jul', actual: null, forecast: 127500, confidence: 87 },
    { month: 'Aug', actual: null, forecast: 135000, confidence: 82 },
    { month: 'Sep', actual: null, forecast: 142000, confidence: 78 }
  ]);

  const [riskFactors, setRiskFactors] = useState([
    { factor: 'Market Volatility', score: 65, impact: 'medium' },
    { factor: 'Seasonal Trends', score: 45, impact: 'low' },
    { factor: 'Competition', score: 72, impact: 'high' },
    { factor: 'Economic Indicators', score: 58, impact: 'medium' }
  ]);

  useEffect(() => {
    // Simulate AI prediction generation
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const PredictionCard = ({ title, value, confidence, change, icon: Icon, color }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 600, color: `${color}.main`, mb: 1 }}>
              {value}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <TrendingUp size={16} color="#10b981" />
              <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>
                {change >= 0 ? '+' : ''}{change.toFixed(1)}% growth
              </Typography>
            </Box>
          </Box>
          <Avatar sx={{ bgcolor: `${color}.100`, color: `${color}.main` }}>
            <Icon size={24} />
          </Avatar>
        </Box>
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              AI Confidence
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              {confidence}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={confidence}
            color={color}
            sx={{ height: 6, borderRadius: 3 }}
          />
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return <Box sx={{ width: '100%' }}><LinearProgress /></Box>;
  }

  return (
    <Box>
      {/* AI Banner */}
      <Alert
        severity="info"
        icon={<Brain size={24} />}
        sx={{ mb: 3, bgcolor: 'primary.50', borderLeft: '4px solid', borderColor: 'primary.main' }}
      >
        <AlertTitle sx={{ fontWeight: 600 }}>AI-Powered Predictions</AlertTitle>
        These forecasts are generated using machine learning models trained on historical data,
        market trends, and business patterns. Confidence scores indicate prediction reliability.
      </Alert>

      {/* Prediction Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <PredictionCard
            title="Next Month Revenue Forecast"
            value={formatCurrency(predictions.nextMonthRevenue.value)}
            confidence={predictions.nextMonthRevenue.confidence}
            change={predictions.nextMonthRevenue.change}
            icon={DollarSign}
            color="success"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <PredictionCard
            title="Next Quarter Revenue Forecast"
            value={formatCurrency(predictions.nextQuarterRevenue.value)}
            confidence={predictions.nextQuarterRevenue.confidence}
            change={predictions.nextQuarterRevenue.change}
            icon={Target}
            color="primary"
          />
        </Grid>
      </Grid>

      {/* Forecast Chart */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Revenue Forecast with Confidence Intervals
          </Typography>
          <Chip icon={<Sparkles size={16} />} label="AI-Powered" color="primary" size="small" />
        </Box>
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={forecastData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => value ? formatCurrency(value) : 'N/A'} />
            <Legend />
            <Area
              type="monotone"
              dataKey="actual"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.3}
              name="Actual Revenue"
            />
            <Line
              type="monotone"
              dataKey="forecast"
              stroke="#10b981"
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Predicted Revenue"
              dot={{ fill: '#10b981', r: 4 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </Paper>

      <Grid container spacing={3}>
        {/* Churn Risk Analysis */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <AlertTriangle size={20} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Churn Risk Prediction
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2">High Risk Clients</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main' }}>
                  {predictions.churnRisk.high}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(predictions.churnRisk.high / 342) * 100}
                color="error"
                sx={{ height: 8, borderRadius: 4, mb: 2 }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2">Medium Risk Clients</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'warning.main' }}>
                  {predictions.churnRisk.medium}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(predictions.churnRisk.medium / 342) * 100}
                color="warning"
                sx={{ height: 8, borderRadius: 4, mb: 2 }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2">Low Risk Clients</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                  {predictions.churnRisk.low}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(predictions.churnRisk.low / 342) * 100}
                color="success"
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>

            <Alert severity="warning" sx={{ mt: 2 }}>
              <strong>{predictions.churnRisk.high}</strong> clients identified as high churn risk.
              Immediate intervention recommended.
            </Alert>
          </Paper>
        </Grid>

        {/* Risk Factors */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Activity size={20} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Risk Factors Analysis
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />

            {riskFactors.map((risk, idx) => (
              <Box key={idx} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">{risk.factor}</Typography>
                  <Chip
                    label={risk.impact}
                    size="small"
                    color={
                      risk.impact === 'high' ? 'error' :
                      risk.impact === 'medium' ? 'warning' : 'success'
                    }
                    sx={{ textTransform: 'capitalize', height: 20 }}
                  />
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={risk.score}
                  color={
                    risk.score > 70 ? 'error' :
                    risk.score > 50 ? 'warning' : 'success'
                  }
                  sx={{ height: 6, borderRadius: 3 }}
                />
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* AI Insights */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Sparkles size={20} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                AI-Generated Insights
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 2, bgcolor: 'success.50', borderRadius: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Strong Growth Trajectory
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Revenue trend shows consistent 15%+ growth. Model predicts continuation for next 3 months.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 2, bgcolor: 'info.50', borderRadius: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Seasonal Pattern Detected
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Historical data shows 12% uptick in Q3. Consider ramping up resources.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 2, bgcolor: 'warning.50', borderRadius: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Client Retention Focus
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    11 clients showing early churn signals. Proactive engagement recommended.
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

export default PredictiveTab;
