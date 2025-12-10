// Path: /src/pages/hubs/analytics/AIInsightsTab.jsx
// ============================================================================
// ANALYTICS HUB - AI INSIGHTS TAB
// ============================================================================
// Purpose: AI-generated insights with automated recommendations
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
  Alert,
  AlertTitle,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  Avatar
} from '@mui/material';
import {
  Sparkles,
  Brain,
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Target,
  Zap,
  BarChart3,
  Users,
  DollarSign,
  RefreshCw
} from 'lucide-react';

const AIInsightsTab = () => {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState({
    critical: [
      {
        title: 'Revenue Acceleration Detected',
        description: 'Your revenue growth rate has increased by 23% in the last 30 days, outpacing the previous 90-day average.',
        impact: 'high',
        action: 'Analyze successful strategies and scale them',
        confidence: 92
      },
      {
        title: 'Client Retention Risk',
        description: '3 high-value clients showing decreased engagement. Average session time dropped by 45%.',
        impact: 'high',
        action: 'Immediate outreach recommended',
        confidence: 87
      }
    ],
    opportunities: [
      {
        title: 'Upsell Opportunity',
        description: '15 clients consistently using 90%+ of their current plan limits.',
        impact: 'medium',
        action: 'Launch targeted upgrade campaign',
        confidence: 84
      },
      {
        title: 'Conversion Funnel Optimization',
        description: 'Lead to qualified stage has 62% dropoff. Industry average is 45%.',
        impact: 'medium',
        action: 'Review qualification criteria and process',
        confidence: 79
      },
      {
        title: 'Seasonal Trend Pattern',
        description: 'Historical data shows 18% revenue increase in Q3. Consider resource planning.',
        impact: 'medium',
        action: 'Prepare for seasonal surge',
        confidence: 88
      }
    ],
    optimizations: [
      {
        title: 'Process Efficiency Gain',
        description: 'Task automation could save 12.5 hours per week based on current patterns.',
        impact: 'low',
        action: 'Implement workflow automation',
        confidence: 76
      },
      {
        title: 'Feature Adoption Gap',
        description: 'Only 23% of users utilizing advanced reporting features.',
        impact: 'low',
        action: 'Create user education content',
        confidence: 81
      }
    ]
  });

  const [predictions, setPredictions] = useState([
    {
      metric: 'Revenue Next Month',
      prediction: '$127,500',
      change: '+15.2%',
      confidence: 87,
      trend: 'up'
    },
    {
      metric: 'Client Growth',
      prediction: '378 clients',
      change: '+10.5%',
      confidence: 85,
      trend: 'up'
    },
    {
      metric: 'Churn Risk',
      prediction: '11 clients',
      change: '-2 from avg',
      confidence: 82,
      trend: 'down'
    }
  ]);

  const [recommendations, setRecommendations] = useState([
    'Focus marketing spend on channels with 3x+ ROI (Social Media, Email)',
    'Schedule quarterly business reviews with top 20% of clients',
    'Optimize onboarding flow to reduce time-to-value by 30%',
    'Implement proactive churn prevention for at-risk segments',
    'Launch referral program - current NPS of 68 indicates high advocacy'
  ]);

  const handleRefreshInsights = () => {
    setLoading(true);
    // Simulate AI processing
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  };

  const InsightCard = ({ insight, type }) => {
    const getIcon = () => {
      switch (type) {
        case 'critical':
          return <AlertTriangle size={20} />;
        case 'opportunities':
          return <Lightbulb size={20} />;
        case 'optimizations':
          return <Target size={20} />;
        default:
          return <Sparkles size={20} />;
      }
    };

    const getColor = () => {
      switch (insight.impact) {
        case 'high':
          return 'error';
        case 'medium':
          return 'warning';
        case 'low':
          return 'info';
        default:
          return 'default';
      }
    };

    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, flex: 1 }}>
              <Avatar sx={{ bgcolor: `${getColor()}.100`, color: `${getColor()}.main` }}>
                {getIcon()}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {insight.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {insight.description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                  <Chip
                    label={`${insight.impact} impact`}
                    size="small"
                    color={getColor()}
                    sx={{ textTransform: 'capitalize' }}
                  />
                  <Chip
                    label={`${insight.confidence}% confidence`}
                    size="small"
                    variant="outlined"
                  />
                </Box>
                <Alert severity="info" sx={{ mt: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Recommended Action:
                  </Typography>
                  <Typography variant="body2">
                    {insight.action}
                  </Typography>
                </Alert>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box>
      {/* AI Banner */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Brain size={48} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                AI-Powered Business Intelligence
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Automated insights generated from your business data using machine learning
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={loading ? <RefreshCw className="animate-spin" size={18} /> : <RefreshCw size={18} />}
            onClick={handleRefreshInsights}
            disabled={loading}
            sx={{
              bgcolor: 'rgba(255,255,255,0.2)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
            }}
          >
            Refresh Insights
          </Button>
        </Box>
      </Paper>

      {loading && <LinearProgress sx={{ mb: 3 }} />}

      {/* Predictions */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Zap size={20} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            AI Predictions
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          {predictions.map((pred, idx) => (
            <Grid item xs={12} md={4} key={idx}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {pred.metric}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                    {pred.prediction}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <TrendingUp size={16} color={pred.trend === 'up' ? '#10b981' : '#ef4444'} />
                    <Typography variant="body2" sx={{ color: pred.trend === 'up' ? 'success.main' : 'error.main' }}>
                      {pred.change}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={pred.confidence}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    {pred.confidence}% confidence
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Critical Insights */}
      {insights.critical.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <AlertTriangle size={20} color="#ef4444" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Critical Insights
            </Typography>
            <Chip label={insights.critical.length} size="small" color="error" />
          </Box>
          {insights.critical.map((insight, idx) => (
            <InsightCard key={idx} insight={insight} type="critical" />
          ))}
        </Box>
      )}

      {/* Opportunities */}
      {insights.opportunities.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Lightbulb size={20} color="#f59e0b" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Growth Opportunities
            </Typography>
            <Chip label={insights.opportunities.length} size="small" color="warning" />
          </Box>
          {insights.opportunities.map((insight, idx) => (
            <InsightCard key={idx} insight={insight} type="opportunities" />
          ))}
        </Box>
      )}

      {/* Optimizations */}
      {insights.optimizations.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Target size={20} color="#3b82f6" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Optimization Suggestions
            </Typography>
            <Chip label={insights.optimizations.length} size="small" color="info" />
          </Box>
          {insights.optimizations.map((insight, idx) => (
            <InsightCard key={idx} insight={insight} type="optimizations" />
          ))}
        </Box>
      )}

      {/* Recommendations */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <CheckCircle size={20} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            AI Recommendations
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <List>
          {recommendations.map((rec, idx) => (
            <ListItem key={idx} sx={{ py: 1 }}>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle size={18} color="#10b981" />
                    <Typography variant="body2">
                      {rec}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default AIInsightsTab;
