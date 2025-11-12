// src/pages/PredictiveAnalytics.jsx
// Predictive Analytics Dashboard - AI-Powered Business Intelligence
import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Paper, Typography, Grid, Card, CardContent, Button, Chip,
  Stack, Select, MenuItem, FormControl, InputLabel, LinearProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Avatar, Alert, CircularProgress, Tabs, Tab, Divider, IconButton,
  Tooltip, Badge
} from '@mui/material';
import {
  TrendingUp, TrendingDown, DollarSign, Users, Target, Activity,
  BarChart3, PieChart, Calendar, Clock, Award, AlertTriangle,
  CheckCircle, XCircle, ArrowUp, ArrowDown, Minus, Zap, Brain,
  ShoppingCart, CreditCard, Package, Star, Eye, RefreshCw,
  Download, Filter, Info, Sparkles, Crown, Flag
} from 'lucide-react';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import aiService from '@/services/aiService';

const PredictiveAnalytics = () => {
  const { currentUser } = useAuth();
  const [timeframe, setTimeframe] = useState('30');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  // Data States
  const [revenueData, setRevenueData] = useState([]);
  const [clientData, setClientData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [predictions, setPredictions] = useState(null);
  const [insights, setInsights] = useState([]);
  const [churnPredictions, setChurnPredictions] = useState([]);
  const [growthForecast, setGrowthForecast] = useState(null);

  const openai = {
    chat: {
      completions: {
        create: async (opts) => {
          const res = await aiService.complete(opts);
          return { choices: [{ message: { content: res.response || res || '' } }], usage: res.usage || {} };
        }
      }
    }
  };

  useEffect(() => {
    loadAnalyticsData();
  }, [currentUser, timeframe]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const days = parseInt(timeframe);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Load revenue data
      const revenueQuery = query(
        collection(db, 'transactions'),
        where('userId', '==', currentUser.uid),
        where('createdAt', '>=', Timestamp.fromDate(startDate)),
        orderBy('createdAt', 'desc')
      );
      const revenueSnapshot = await getDocs(revenueQuery);
      const revenue = revenueSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().createdAt?.toDate()
      }));
      setRevenueData(revenue);

      // Load client data
      const clientQuery = query(
        collection(db, 'contacts'),
        where('userId', '==', currentUser.uid)
      );
      const clientSnapshot = await getDocs(clientQuery);
      const clients = clientSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setClientData(clients);

      // Load product data
      const productQuery = query(
        collection(db, 'products'),
        where('userId', '==', currentUser.uid)
      );
      const productSnapshot = await getDocs(productQuery);
      const products = productSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProductData(products);

      // Generate AI predictions
      await generatePredictions(revenue, clients, products);

    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePredictions = async (revenue, clients, products) => {
    try {
      // Revenue forecast
      const revenueForecast = await predictRevenue(revenue);
      
      // Client churn prediction
      const churnAnalysis = await predictChurn(clients);
      
      // Growth opportunities
      const growthAnalysis = await analyzeGrowth(revenue, clients, products);
      
      // Business insights
      const businessInsights = await generateInsights(revenue, clients, products);

      setPredictions(revenueForecast);
      setChurnPredictions(churnAnalysis);
      setGrowthForecast(growthAnalysis);
      setInsights(businessInsights);

    } catch (error) {
      console.error('Error generating predictions:', error);
    }
  };

  const predictRevenue = async (revenueData) => {
    const totalRevenue = revenueData.reduce((sum, t) => sum + (t.amount || 0), 0);
    const avgTransaction = totalRevenue / revenueData.length || 0;

    const prompt = `Analyze this revenue data and predict the next 3 months:

Total Revenue: $${totalRevenue.toFixed(2)}
Transactions: ${revenueData.length}
Average Transaction: $${avgTransaction.toFixed(2)}
Period: Last ${timeframe} days

Provide predictions in JSON:
{
  "nextMonth": {
    "predicted": number,
    "lowEstimate": number,
    "highEstimate": number,
    "confidence": 0-100,
    "growth": percentage
  },
  "next3Months": {
    "predicted": number,
    "breakdown": [month1, month2, month3],
    "confidence": 0-100
  },
  "factors": ["factor1", "factor2"],
  "risks": ["risk1", "risk2"],
  "opportunities": ["opp1", "opp2"]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{
        role: "system",
        content: "You are a financial analyst specializing in revenue forecasting and business intelligence."
      }, {
        role: "user",
        content: prompt
      }],
      temperature: 0.3,
      max_tokens: 1000
    });

    return JSON.parse(response.choices[0].message.content);
  };

  const predictChurn = async (clients) => {
    const activeClients = clients.filter(c => c.status === 'active' || c.status === 'paying');
    const totalClients = clients.length;

    const prompt = `Analyze client data for churn prediction:

Total Clients: ${totalClients}
Active Clients: ${activeClients.length}

Identify high-risk clients and provide:
{
  "overallChurnRisk": "low/medium/high",
  "predictedChurnRate": percentage,
  "highRiskClients": number,
  "churnFactors": ["factor1", "factor2"],
  "retentionStrategies": ["strategy1", "strategy2"],
  "expectedLoss": dollarAmount,
  "preventionActions": [
    {
      "action": "description",
      "impact": "high/medium/low",
      "effort": "low/medium/high",
      "expectedRetention": percentage
    }
  ]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{
        role: "system",
        content: "You are a customer success analyst specializing in churn prediction and retention."
      }, {
        role: "user",
        content: prompt
      }],
      temperature: 0.4,
      max_tokens: 1200
    });

    return JSON.parse(response.choices[0].message.content);
  };

  const analyzeGrowth = async (revenue, clients, products) => {
    const prompt = `Analyze business data for growth opportunities:

Revenue Transactions: ${revenue.length}
Total Clients: ${clients.length}
Products: ${products.length}

Provide growth analysis:
{
  "growthPotential": 0-100,
  "topOpportunities": [
    {
      "opportunity": "description",
      "impact": "high/medium/low",
      "timeframe": "short/medium/long",
      "investmentNeeded": "low/medium/high",
      "expectedROI": percentage,
      "steps": ["step1", "step2"]
    }
  ],
  "marketTrends": ["trend1", "trend2"],
  "competitiveAdvantages": ["advantage1", "advantage2"],
  "recommendations": ["rec1", "rec2"]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{
        role: "system",
        content: "You are a business growth strategist with expertise in scaling service businesses."
      }, {
        role: "user",
        content: prompt
      }],
      temperature: 0.5,
      max_tokens: 1500
    });

    return JSON.parse(response.choices[0].message.content);
  };

  const generateInsights = async (revenue, clients, products) => {
    const totalRevenue = revenue.reduce((sum, t) => sum + (t.amount || 0), 0);
    const avgRevenue = totalRevenue / revenue.length || 0;

    const insights = [];

    if (revenue.length < 5) {
      insights.push({
        type: 'warning',
        title: 'Low Transaction Volume',
        message: 'Consider implementing marketing campaigns to increase sales.',
        priority: 'high'
      });
    }

    if (avgRevenue < 100) {
      insights.push({
        type: 'opportunity',
        title: 'Upsell Potential',
        message: 'Average transaction value is low. Consider bundling services or premium tiers.',
        priority: 'medium'
      });
    }

    if (clients.length > 50 && products.length < 3) {
      insights.push({
        type: 'opportunity',
        title: 'Product Expansion',
        message: 'Large client base with limited products. Time to expand offerings.',
        priority: 'high'
      });
    }

    return insights;
  };

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalRevenue = revenueData.reduce((sum, t) => sum + (t.amount || 0), 0);
    const activeClients = clientData.filter(c => c.status === 'active' || c.status === 'paying').length;
    const avgRevenue = totalRevenue / revenueData.length || 0;
    const conversionRate = (activeClients / clientData.length) * 100 || 0;

    return {
      totalRevenue,
      activeClients,
      totalClients: clientData.length,
      avgRevenue,
      conversionRate,
      transactions: revenueData.length
    };
  }, [revenueData, clientData]);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              <Brain size={32} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              Predictive Analytics & Business Intelligence
            </Typography>
            <Typography variant="body2" color="text.secondary">
              AI-powered forecasting, churn prediction, and growth analysis
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Timeframe</InputLabel>
              <Select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                label="Timeframe"
              >
                <MenuItem value="7">Last 7 Days</MenuItem>
                <MenuItem value="30">Last 30 Days</MenuItem>
                <MenuItem value="90">Last 90 Days</MenuItem>
                <MenuItem value="365">Last Year</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              startIcon={<RefreshCw />}
              onClick={loadAnalyticsData}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<Download />}
            >
              Export Report
            </Button>
          </Stack>
        </Stack>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Key Metrics */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="caption" color="text.secondary">Total Revenue</Typography>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>
                        ${metrics.totalRevenue.toFixed(2)}
                      </Typography>
                      {predictions && (
                        <Chip
                          label={`+${predictions.nextMonth.growth}% predicted`}
                          size="small"
                          color="success"
                          sx={{ mt: 1 }}
                        />
                      )}
                    </Box>
                    <Avatar sx={{ bgcolor: 'success.main' }}>
                      <DollarSign size={24} />
                    </Avatar>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="caption" color="text.secondary">Active Clients</Typography>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>
                        {metrics.activeClients}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {metrics.totalClients} total
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <Users size={24} />
                    </Avatar>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="caption" color="text.secondary">Avg Transaction</Typography>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>
                        ${metrics.avgRevenue.toFixed(2)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {metrics.transactions} transactions
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'warning.main' }}>
                      <ShoppingCart size={24} />
                    </Avatar>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="caption" color="text.secondary">Conversion Rate</Typography>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>
                        {metrics.conversionRate.toFixed(1)}%
                      </Typography>
                      {churnPredictions && (
                        <Chip
                          label={`${churnPredictions.overallChurnRisk} churn risk`}
                          size="small"
                          color={
                            churnPredictions.overallChurnRisk === 'low' ? 'success' :
                            churnPredictions.overallChurnRisk === 'medium' ? 'warning' : 'error'
                          }
                          sx={{ mt: 1 }}
                        />
                      )}
                    </Box>
                    <Avatar sx={{ bgcolor: 'info.main' }}>
                      <Target size={24} />
                    </Avatar>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* AI Insights */}
          {insights.length > 0 && (
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {insights.map((insight, idx) => (
                <Grid item xs={12} md={4} key={idx}>
                  <Alert
                    severity={
                      insight.type === 'warning' ? 'warning' :
                      insight.type === 'opportunity' ? 'info' : 'success'
                    }
                    icon={<Sparkles size={20} />}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      {insight.title}
                    </Typography>
                    <Typography variant="body2">{insight.message}</Typography>
                    <Chip
                      label={`${insight.priority} priority`}
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </Alert>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Tabs */}
          <Paper sx={{ mb: 3 }}>
            <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
              <Tab label="Revenue Forecast" icon={<TrendingUp size={18} />} iconPosition="start" />
              <Tab label="Churn Analysis" icon={<AlertTriangle size={18} />} iconPosition="start" />
              <Tab label="Growth Opportunities" icon={<Zap size={18} />} iconPosition="start" />
              <Tab label="Performance Metrics" icon={<BarChart3 size={18} />} iconPosition="start" />
            </Tabs>
          </Paper>

          {/* Tab Content */}
          {activeTab === 0 && predictions && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Next Month Forecast</Typography>
                    <Typography variant="h3" color="primary" sx={{ my: 2 }}>
                      ${predictions.nextMonth.predicted.toFixed(2)}
                    </Typography>
                    <Stack spacing={1}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Range</Typography>
                        <Typography variant="body2">
                          ${predictions.nextMonth.lowEstimate.toFixed(2)} - ${predictions.nextMonth.highEstimate.toFixed(2)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Confidence</Typography>
                        <LinearProgress
                          variant="determinate"
                          value={predictions.nextMonth.confidence}
                          sx={{ mt: 1, height: 8, borderRadius: 4 }}
                        />
                        <Typography variant="caption">{predictions.nextMonth.confidence}%</Typography>
                      </Box>
                      <Chip
                        label={`${predictions.nextMonth.growth}% growth`}
                        color="success"
                        icon={<TrendingUp size={14} />}
                      />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>3-Month Projection</Typography>
                  <Grid container spacing={2}>
                    {predictions.next3Months.breakdown.map((amount, idx) => (
                      <Grid item xs={4} key={idx}>
                        <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            Month {idx + 1}
                          </Typography>
                          <Typography variant="h5" color="primary" sx={{ my: 1 }}>
                            ${amount.toFixed(2)}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={(amount / predictions.next3Months.predicted) * 100}
                            sx={{ height: 6, borderRadius: 3 }}
                          />
                        </Box>
                      </Grid>
                    ))}
                  </Grid>

                  <Divider sx={{ my: 3 }} />

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Typography variant="subtitle2" gutterBottom>Growth Factors</Typography>
                      <Stack spacing={1}>
                        {predictions.factors.map((factor, idx) => (
                          <Chip
                            key={idx}
                            label={factor}
                            size="small"
                            icon={<ArrowUp size={14} />}
                            color="success"
                            variant="outlined"
                          />
                        ))}
                      </Stack>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <Typography variant="subtitle2" gutterBottom>Risk Factors</Typography>
                      <Stack spacing={1}>
                        {predictions.risks.map((risk, idx) => (
                          <Chip
                            key={idx}
                            label={risk}
                            size="small"
                            icon={<AlertTriangle size={14} />}
                            color="warning"
                            variant="outlined"
                          />
                        ))}
                      </Stack>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <Typography variant="subtitle2" gutterBottom>Opportunities</Typography>
                      <Stack spacing={1}>
                        {predictions.opportunities.map((opp, idx) => (
                          <Chip
                            key={idx}
                            label={opp}
                            size="small"
                            icon={<Sparkles size={14} />}
                            color="info"
                            variant="outlined"
                          />
                        ))}
                      </Stack>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          )}

          {activeTab === 1 && churnPredictions && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Churn Risk Level</Typography>
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        mx: 'auto',
                        my: 2,
                        bgcolor:
                          churnPredictions.overallChurnRisk === 'low' ? 'success.main' :
                          churnPredictions.overallChurnRisk === 'medium' ? 'warning.main' : 'error.main'
                      }}
                    >
                      <AlertTriangle size={40} />
                    </Avatar>
                    <Typography variant="h4" align="center" sx={{ textTransform: 'capitalize' }}>
                      {churnPredictions.overallChurnRisk}
                    </Typography>
                    <Typography variant="body2" align="center" color="text.secondary" sx={{ mt: 1 }}>
                      {churnPredictions.predictedChurnRate}% predicted churn
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>Retention Strategies</Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Action</TableCell>
                          <TableCell>Impact</TableCell>
                          <TableCell>Effort</TableCell>
                          <TableCell>Expected Retention</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {churnPredictions.preventionActions.map((action, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{action.action}</TableCell>
                            <TableCell>
                              <Chip
                                label={action.impact}
                                size="small"
                                color={
                                  action.impact === 'high' ? 'success' :
                                  action.impact === 'medium' ? 'warning' : 'default'
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={action.effort}
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="success.main">
                                +{action.expectedRetention}%
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Alert severity="info" icon={<Info />}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    High Risk Clients: {churnPredictions.highRiskClients}
                  </Typography>
                  <Typography variant="body2">
                    Potential Revenue Loss: ${churnPredictions.expectedLoss.toFixed(2)}
                  </Typography>
                </Alert>
              </Grid>
            </Grid>
          )}

          {activeTab === 2 && growthForecast && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                    <Typography variant="h6">Growth Opportunities</Typography>
                    <Chip
                      label={`${growthForecast.growthPotential}% Growth Potential`}
                      color="success"
                      icon={<TrendingUp size={16} />}
                    />
                  </Stack>

                  <Grid container spacing={3}>
                    {growthForecast.topOpportunities.map((opp, idx) => (
                      <Grid item xs={12} md={6} key={idx}>
                        <Card variant="outlined">
                          <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                              <Typography variant="h6">{opp.opportunity}</Typography>
                              <Chip
                                label={opp.impact}
                                size="small"
                                color={
                                  opp.impact === 'high' ? 'success' :
                                  opp.impact === 'medium' ? 'warning' : 'default'
                                }
                              />
                            </Stack>

                            <Grid container spacing={2} sx={{ mb: 2 }}>
                              <Grid item xs={4}>
                                <Typography variant="caption" color="text.secondary">Timeframe</Typography>
                                <Typography variant="body2">{opp.timeframe}</Typography>
                              </Grid>
                              <Grid item xs={4}>
                                <Typography variant="caption" color="text.secondary">Investment</Typography>
                                <Typography variant="body2">{opp.investmentNeeded}</Typography>
                              </Grid>
                              <Grid item xs={4}>
                                <Typography variant="caption" color="text.secondary">Expected ROI</Typography>
                                <Typography variant="body2" color="success.main">{opp.expectedROI}%</Typography>
                              </Grid>
                            </Grid>

                            <Divider sx={{ my: 2 }} />

                            <Typography variant="subtitle2" gutterBottom>Action Steps:</Typography>
                            <Stack spacing={0.5}>
                              {opp.steps.map((step, stepIdx) => (
                                <Chip
                                  key={stepIdx}
                                  label={step}
                                  size="small"
                                  variant="outlined"
                                  sx={{ justifyContent: 'flex-start' }}
                                />
                              ))}
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          )}

          {activeTab === 3 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>Performance Metrics</Typography>
                  <Alert severity="info">
                    Detailed performance metrics coming soon!
                  </Alert>
                </Paper>
              </Grid>
            </Grid>
          )}
        </>
      )}
    </Box>
  );
};

export default PredictiveAnalytics;