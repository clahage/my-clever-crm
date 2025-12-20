// ============================================================================
// AI BUSINESS INTELLIGENCE DASHBOARD
// ============================================================================
// Comprehensive AI-powered business analytics and insights
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Tooltip,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Badge,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AttachMoney,
  People,
  Warning,
  CheckCircle,
  Lightbulb,
  Refresh,
  BarChart,
  PieChart,
  Timeline,
  Speed,
  Flag,
  Star,
  ArrowUpward,
  ArrowDownward,
  Remove,
  Info,
  Email,
  Sms,
} from '@mui/icons-material';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/firebase/config';
import { useAuth } from '@/contexts/AuthContext';

// KPI Card Component
const KPICard = ({ title, value, subtitle, trend, trendValue, icon: Icon, color }) => {
  const getTrendIcon = () => {
    if (trend === 'up') return <ArrowUpward sx={{ fontSize: 16, color: 'success.main' }} />;
    if (trend === 'down') return <ArrowDownward sx={{ fontSize: 16, color: 'error.main' }} />;
    return <Remove sx={{ fontSize: 16, color: 'text.secondary' }} />;
  };

  return (
    <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ color }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar sx={{ bgcolor: `${color}20`, color }}>
            <Icon />
          </Avatar>
        </Box>
        {trendValue && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 0.5 }}>
            {getTrendIcon()}
            <Typography
              variant="caption"
              sx={{ color: trend === 'up' ? 'success.main' : trend === 'down' ? 'error.main' : 'text.secondary' }}
            >
              {trendValue}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// Churn Risk Badge
const ChurnRiskBadge = ({ level }) => {
  const config = {
    critical: { color: 'error', label: 'Critical' },
    high: { color: 'warning', label: 'High' },
    medium: { color: 'info', label: 'Medium' },
    low: { color: 'success', label: 'Low' },
  };
  const cfg = config[level] || config.low;
  return <Chip label={cfg.label} color={cfg.color} size="small" />;
};

const AIBusinessDashboard = () => {
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState({});
  const [error, setError] = useState(null);

  // Data states
  const [revenueData, setRevenueData] = useState(null);
  const [churnData, setChurnData] = useState(null);
  const [insightsData, setInsightsData] = useState(null);

  // Load revenue forecast
  const loadRevenueForecast = async () => {
    setLoading(prev => ({ ...prev, revenue: true }));
    setError(null);
    try {
      const forecast = httpsCallable(functions, 'forecastRevenue');
      const result = await forecast({ months: 6 });
      if (result.data.success) {
        setRevenueData(result.data);
      }
    } catch (err) {
      console.error('Revenue forecast error:', err);
      setError(err.message);
    } finally {
      setLoading(prev => ({ ...prev, revenue: false }));
    }
  };

  // Load churn predictions
  const loadChurnPredictions = async () => {
    setLoading(prev => ({ ...prev, churn: true }));
    try {
      const predict = httpsCallable(functions, 'predictChurn');
      const result = await predict({ limit: 100 });
      if (result.data.success) {
        setChurnData(result.data);
      }
    } catch (err) {
      console.error('Churn prediction error:', err);
    } finally {
      setLoading(prev => ({ ...prev, churn: false }));
    }
  };

  // Load business insights
  const loadInsights = async () => {
    setLoading(prev => ({ ...prev, insights: true }));
    try {
      const insights = httpsCallable(functions, 'generateBusinessInsights');
      const result = await insights({});
      if (result.data.success) {
        setInsightsData(result.data);
      }
    } catch (err) {
      console.error('Insights error:', err);
    } finally {
      setLoading(prev => ({ ...prev, insights: false }));
    }
  };

  // Load all data on mount
  useEffect(() => {
    loadRevenueForecast();
    loadChurnPredictions();
    loadInsights();
  }, []);

  // Refresh all
  const refreshAll = () => {
    loadRevenueForecast();
    loadChurnPredictions();
    loadInsights();
  };

  return (
    <Box>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2, width: 56, height: 56 }}>
              <BarChart sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="bold">
                AI Business Intelligence
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Revenue forecasting, churn prediction, and actionable insights
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={refreshAll}
            disabled={Object.values(loading).some(Boolean)}
            sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
          >
            Refresh All
          </Button>
        </Box>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} variant="fullWidth">
          <Tab icon={<AttachMoney />} label="Revenue Forecast" />
          <Tab icon={<Warning />} label={
            <Badge badgeContent={churnData?.summary?.criticalRisk || 0} color="error">
              Churn Risk
            </Badge>
          } />
          <Tab icon={<Lightbulb />} label="AI Insights" />
        </Tabs>
      </Paper>

      {/* Revenue Forecast Tab */}
      {activeTab === 0 && (
        <Box>
          {loading.revenue ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress size={60} />
            </Box>
          ) : revenueData ? (
            <>
              {/* KPI Cards */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <KPICard
                    title="Current MRR"
                    value={`$${(revenueData.currentMRR || 0).toLocaleString()}`}
                    icon={AttachMoney}
                    color="#4caf50"
                    trend="up"
                    trendValue={`${revenueData.growthRate || 0}% growth`}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <KPICard
                    title="Projected ARR"
                    value={`$${(revenueData.projectedAnnualRevenue || 0).toLocaleString()}`}
                    icon={TrendingUp}
                    color="#2196f3"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <KPICard
                    title="Customer LTV"
                    value={`$${(revenueData.keyMetrics?.customerLifetimeValue || 0).toLocaleString()}`}
                    icon={People}
                    color="#9c27b0"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <KPICard
                    title="Net Revenue Retention"
                    value={`${revenueData.keyMetrics?.netRevenueRetention || 0}%`}
                    icon={Speed}
                    color="#ff9800"
                  />
                </Grid>
              </Grid>

              {/* Scenarios */}
              <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>
                Revenue Scenarios (6-Month Forecast)
              </Typography>
              <Grid container spacing={3} sx={{ mb: 3 }}>
                {revenueData.scenarios && Object.entries(revenueData.scenarios).map(([key, scenario]) => (
                  <Grid item xs={12} md={4} key={key}>
                    <Card sx={{
                      height: '100%',
                      borderTop: `4px solid ${key === 'optimistic' ? '#4caf50' : key === 'realistic' ? '#2196f3' : '#ff9800'}`
                    }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ textTransform: 'capitalize' }}>
                          {key} Scenario
                        </Typography>
                        <Typography variant="h4" fontWeight="bold" color="primary">
                          ${(scenario.mrr || 0).toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {scenario.assumptions}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {/* Recommendations */}
              {revenueData.recommendations?.length > 0 && (
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <Lightbulb sx={{ mr: 1, color: 'warning.main' }} />
                    AI Recommendations
                  </Typography>
                  <List>
                    {revenueData.recommendations.map((rec, idx) => (
                      <ListItem key={idx}>
                        <ListItemIcon>
                          <Flag color={rec.priority === 'high' ? 'error' : rec.priority === 'medium' ? 'warning' : 'info'} />
                        </ListItemIcon>
                        <ListItemText
                          primary={rec.action}
                          secondary={rec.impact}
                        />
                        <Chip label={rec.priority} size="small" color={rec.priority === 'high' ? 'error' : 'default'} />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              )}
            </>
          ) : (
            <Paper sx={{ p: 6, textAlign: 'center' }}>
              <AttachMoney sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No revenue data available
              </Typography>
              <Button sx={{ mt: 2 }} onClick={loadRevenueForecast}>
                Generate Forecast
              </Button>
            </Paper>
          )}
        </Box>
      )}

      {/* Churn Risk Tab */}
      {activeTab === 1 && (
        <Box>
          {loading.churn ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress size={60} />
            </Box>
          ) : churnData ? (
            <>
              {/* Summary Cards */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={6} sm={3}>
                  <Card sx={{ bgcolor: 'error.light' }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h3" fontWeight="bold" color="error.dark">
                        {churnData.summary?.criticalRisk || 0}
                      </Typography>
                      <Typography variant="body2" color="error.dark">
                        Critical Risk
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Card sx={{ bgcolor: 'warning.light' }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h3" fontWeight="bold" color="warning.dark">
                        {churnData.summary?.highRisk || 0}
                      </Typography>
                      <Typography variant="body2" color="warning.dark">
                        High Risk
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Card sx={{ bgcolor: 'info.light' }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h3" fontWeight="bold" color="info.dark">
                        {churnData.summary?.mediumRisk || 0}
                      </Typography>
                      <Typography variant="body2" color="info.dark">
                        Medium Risk
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Card sx={{ bgcolor: 'success.light' }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h3" fontWeight="bold" color="success.dark">
                        {churnData.summary?.lowRisk || 0}
                      </Typography>
                      <Typography variant="body2" color="success.dark">
                        Low Risk
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* At-Risk Clients Table */}
              <Paper sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                  At-Risk Clients (Sorted by Risk Score)
                </Typography>
                <TableContainer sx={{ maxHeight: 500 }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Client</TableCell>
                        <TableCell>Risk Score</TableCell>
                        <TableCell>Risk Level</TableCell>
                        <TableCell>Risk Factors</TableCell>
                        <TableCell>Recommended Actions</TableCell>
                        <TableCell>Contact</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {churnData.clients?.slice(0, 20).map((client, idx) => (
                        <TableRow
                          key={client.clientId}
                          sx={{
                            bgcolor: client.riskLevel === 'critical' ? 'error.lighter' :
                                    client.riskLevel === 'high' ? 'warning.lighter' : 'inherit'
                          }}
                        >
                          <TableCell>
                            <Typography fontWeight="bold">{client.clientName}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {client.email}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={client.riskScore}
                                color={client.riskLevel === 'critical' ? 'error' : client.riskLevel === 'high' ? 'warning' : 'info'}
                                sx={{ width: 60, height: 8, borderRadius: 4 }}
                              />
                              <Typography variant="body2" fontWeight="bold">
                                {client.riskScore}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <ChurnRiskBadge level={client.riskLevel} />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {client.riskFactors?.slice(0, 2).map((factor, i) => (
                                <Chip key={i} label={factor} size="small" variant="outlined" />
                              ))}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption">
                              {client.recommendedActions?.[0]}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Tooltip title="Send Email">
                              <IconButton size="small" color="primary">
                                <Email fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Send SMS">
                              <IconButton size="small" color="secondary">
                                <Sms fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </>
          ) : (
            <Paper sx={{ p: 6, textAlign: 'center' }}>
              <Warning sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No churn data available
              </Typography>
              <Button sx={{ mt: 2 }} onClick={loadChurnPredictions}>
                Analyze Churn Risk
              </Button>
            </Paper>
          )}
        </Box>
      )}

      {/* AI Insights Tab */}
      {activeTab === 2 && (
        <Box>
          {loading.insights ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress size={60} />
            </Box>
          ) : insightsData ? (
            <>
              {/* Executive Summary */}
              <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.light' }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Star sx={{ mr: 1, color: 'primary.main' }} />
                  Executive Summary
                </Typography>
                <Typography variant="body1">
                  {insightsData.executiveSummary}
                </Typography>
              </Paper>

              {/* KPIs */}
              {insightsData.keyPerformanceIndicators?.length > 0 && (
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  {insightsData.keyPerformanceIndicators.map((kpi, idx) => (
                    <Grid item xs={12} sm={6} md={3} key={idx}>
                      <Card>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">
                              {kpi.metric}
                            </Typography>
                            {kpi.trend === 'up' && <TrendingUp color="success" />}
                            {kpi.trend === 'down' && <TrendingDown color="error" />}
                          </Box>
                          <Typography variant="h5" fontWeight="bold">
                            {kpi.value}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {kpi.insight}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}

              {/* Strengths & Improvements */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, height: '100%' }}>
                    <Typography variant="h6" gutterBottom color="success.main">
                      <CheckCircle sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Strengths
                    </Typography>
                    <List dense>
                      {insightsData.strengthsIdentified?.map((strength, idx) => (
                        <ListItem key={idx}>
                          <ListItemIcon>
                            <CheckCircle color="success" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={strength} />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, height: '100%' }}>
                    <Typography variant="h6" gutterBottom color="warning.main">
                      <Warning sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Areas for Improvement
                    </Typography>
                    <List dense>
                      {insightsData.areasForImprovement?.map((area, idx) => (
                        <ListItem key={idx}>
                          <ListItemIcon>
                            <Warning color="warning" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={area} />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Grid>
              </Grid>

              {/* Opportunities */}
              {insightsData.opportunities?.length > 0 && (
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    <Lightbulb sx={{ mr: 1, verticalAlign: 'middle', color: 'warning.main' }} />
                    Opportunities
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Opportunity</TableCell>
                          <TableCell>Potential Impact</TableCell>
                          <TableCell>Effort</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {insightsData.opportunities.map((opp, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{opp.opportunity}</TableCell>
                            <TableCell>{opp.potentialImpact}</TableCell>
                            <TableCell>
                              <Chip
                                label={opp.effort}
                                size="small"
                                color={opp.effort === 'low' ? 'success' : opp.effort === 'medium' ? 'warning' : 'error'}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              )}

              {/* Action Items */}
              {insightsData.actionItems?.length > 0 && (
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    <Flag sx={{ mr: 1, verticalAlign: 'middle', color: 'error.main' }} />
                    Action Items
                  </Typography>
                  <List>
                    {insightsData.actionItems.map((item, idx) => (
                      <ListItem key={idx} sx={{ bgcolor: 'action.hover', borderRadius: 1, mb: 1 }}>
                        <ListItemIcon>
                          <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.main', fontSize: '0.9rem' }}>
                            {idx + 1}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={item.action}
                          secondary={`Owner: ${item.owner} • Deadline: ${item.deadline}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              )}
            </>
          ) : (
            <Paper sx={{ p: 6, textAlign: 'center' }}>
              <Lightbulb sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No insights available
              </Typography>
              <Button sx={{ mt: 2 }} onClick={loadInsights}>
                Generate Insights
              </Button>
            </Paper>
          )}
        </Box>
      )}
    </Box>
  );
};

export default AIBusinessDashboard;
