// Path: /src/pages/hubs/credit/AnalysisTab.jsx
// ============================================================================
// CREDIT HUB - AI ANALYSIS TAB
// ============================================================================
// Purpose: AI-powered credit analysis
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
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Target,
  Lightbulb,
  BarChart,
  RefreshCw,
  ChevronDown
} from 'lucide-react';
import { collection, query, onSnapshot, addDoc, serverTimestamp, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../contexts/AuthContext';

const AnalysisTab = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [creditReports, setCreditReports] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const unsubscribers = [];

    // Subscribe to latest analysis
    const clientId = userProfile?.role === 'client' ? userProfile.uid : null;
    const analysisQuery = clientId
      ? query(
          collection(db, 'creditAnalysis'),
          where('clientId', '==', clientId),
          orderBy('createdAt', 'desc'),
          limit(1)
        )
      : query(collection(db, 'creditAnalysis'), orderBy('createdAt', 'desc'), limit(1));

    const unsubAnalysis = onSnapshot(analysisQuery, (snapshot) => {
      if (!snapshot.empty) {
        setAnalysis({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
      }
      setLoading(false);
    });
    unsubscribers.push(unsubAnalysis);

    // Subscribe to credit reports
    const reportsQuery = clientId
      ? query(
          collection(db, 'creditReports'),
          where('clientId', '==', clientId),
          orderBy('createdAt', 'desc'),
          limit(1)
        )
      : query(collection(db, 'creditReports'), orderBy('createdAt', 'desc'), limit(1));

    const unsubReports = onSnapshot(reportsQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCreditReports(data);
    });
    unsubscribers.push(unsubReports);

    return () => unsubscribers.forEach(unsub => unsub());
  }, [userProfile]);

  const handleRunAnalysis = async () => {
    try {
      setAnalyzing(true);

      if (creditReports.length === 0) {
        throw new Error('No credit report available for analysis');
      }

      const report = creditReports[0];

      // Generate AI analysis (simplified version - in production, call AI API)
      const analysisData = generateAnalysis(report);

      await addDoc(collection(db, 'creditAnalysis'), {
        clientId: userProfile.uid,
        clientName: userProfile.displayName || userProfile.email,
        reportId: report.id,
        ...analysisData,
        createdAt: serverTimestamp(),
        createdBy: userProfile.email
      });

      setSnackbar({
        open: true,
        message: 'Analysis completed successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error running analysis:', error);
      setSnackbar({
        open: true,
        message: 'Error running analysis: ' + error.message,
        severity: 'error'
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const generateAnalysis = (report) => {
    // Calculate average score
    const scores = [
      report.bureaus?.equifax?.score,
      report.bureaus?.experian?.score,
      report.bureaus?.transunion?.score
    ].filter(s => s);
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

    // Analyze accounts
    const allAccounts = [
      ...(report.bureaus?.equifax?.accounts || []),
      ...(report.bureaus?.experian?.accounts || []),
      ...(report.bureaus?.transunion?.accounts || [])
    ];

    const negativeAccounts = allAccounts.filter(a =>
      a.status !== 'Current' && a.status !== 'Paid'
    );

    const highBalanceAccounts = allAccounts.filter(a =>
      a.balance > 5000
    );

    // Generate recommendations
    const recommendations = [];

    if (avgScore < 650) {
      recommendations.push({
        priority: 'high',
        category: 'Score Improvement',
        title: 'Focus on Payment History',
        description: 'Your score is below average. Prioritize making all payments on time.',
        impact: '+50-100 points',
        timeframe: '6-12 months'
      });
    }

    if (negativeAccounts.length > 0) {
      recommendations.push({
        priority: 'high',
        category: 'Negative Items',
        title: 'Dispute Negative Items',
        description: `You have ${negativeAccounts.length} negative items that could be disputed.`,
        impact: '+20-80 points',
        timeframe: '2-4 months'
      });
    }

    if (highBalanceAccounts.length > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'Credit Utilization',
        title: 'Reduce Credit Utilization',
        description: 'High balances are affecting your score. Aim for under 30% utilization.',
        impact: '+15-40 points',
        timeframe: '1-3 months'
      });
    }

    recommendations.push({
      priority: 'medium',
      category: 'Credit Mix',
      title: 'Diversify Credit Types',
      description: 'Having different types of credit can improve your score.',
      impact: '+10-20 points',
      timeframe: '3-6 months'
    });

    recommendations.push({
      priority: 'low',
      category: 'Credit Age',
      title: 'Keep Old Accounts Open',
      description: 'Maintain your oldest accounts to improve average credit age.',
      impact: '+5-15 points',
      timeframe: 'Ongoing'
    });

    // Score predictions
    const predictions = [
      {
        timeframe: '3 months',
        minScore: avgScore + 10,
        maxScore: avgScore + 30,
        assumptions: ['All payments on time', 'Reduce utilization to 30%']
      },
      {
        timeframe: '6 months',
        minScore: avgScore + 25,
        maxScore: avgScore + 60,
        assumptions: ['Continue good habits', 'Dispute resolved successfully']
      },
      {
        timeframe: '12 months',
        minScore: avgScore + 50,
        maxScore: avgScore + 100,
        assumptions: ['Consistent positive behavior', 'Negative items removed']
      }
    ];

    // Action items
    const actionItems = [
      {
        priority: 'immediate',
        task: 'Review credit report for errors',
        status: 'pending'
      },
      {
        priority: 'immediate',
        task: 'Set up payment reminders for all accounts',
        status: 'pending'
      },
      {
        priority: 'this_week',
        task: 'Dispute identified negative items',
        status: 'pending'
      },
      {
        priority: 'this_month',
        task: 'Pay down high-balance accounts',
        status: 'pending'
      },
      {
        priority: 'this_month',
        task: 'Request credit limit increases',
        status: 'pending'
      }
    ];

    return {
      currentScore: avgScore,
      scoreCategory: getScoreCategory(avgScore),
      recommendations,
      predictions,
      actionItems,
      insights: {
        totalAccounts: allAccounts.length,
        negativeItems: negativeAccounts.length,
        avgCreditAge: '5 years', // Simplified
        creditUtilization: '45%', // Simplified
        paymentHistory: '85%' // Simplified
      }
    };
  };

  const getScoreCategory = (score) => {
    if (score >= 800) return 'Excellent';
    if (score >= 740) return 'Very Good';
    if (score >= 670) return 'Good';
    if (score >= 580) return 'Fair';
    return 'Poor';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
      case 'immediate':
        return 'error';
      case 'medium':
      case 'this_week':
        return 'warning';
      case 'low':
      case 'this_month':
        return 'info';
      default:
        return 'default';
    }
  };

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
            <Brain size={24} style={{ verticalAlign: 'middle', marginRight: 8 }} />
            AI Credit Analysis
          </Typography>
          <Typography variant="body2" color="text.secondary">
            AI-powered insights and recommendations for credit improvement
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={analyzing ? <RefreshCw size={18} className="spinning" /> : <Brain size={18} />}
          onClick={handleRunAnalysis}
          disabled={analyzing || creditReports.length === 0}
        >
          {analyzing ? 'Analyzing...' : 'Run Analysis'}
        </Button>
      </Box>

      {!analysis ? (
        <Alert severity="info">
          <Typography variant="body2">
            No analysis available yet. Click "Run Analysis" to get AI-powered insights on your credit profile.
          </Typography>
        </Alert>
      ) : (
        <>
          {/* Current Score Overview */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Current Score
                  </Typography>
                  <Typography variant="h2" sx={{ fontWeight: 600, mb: 1 }}>
                    {analysis.currentScore}
                  </Typography>
                  <Chip
                    label={analysis.scoreCategory}
                    color={
                      analysis.currentScore >= 740 ? 'success' :
                      analysis.currentScore >= 670 ? 'info' :
                      analysis.currentScore >= 580 ? 'warning' : 'error'
                    }
                    size="small"
                  />
                  <Typography variant="caption" display="block" sx={{ mt: 2 }} color="text.secondary">
                    Last analyzed: {analysis.createdAt?.toDate().toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={8}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Key Insights
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={4}>
                      <Typography variant="caption" color="text.secondary">Total Accounts</Typography>
                      <Typography variant="h6">{analysis.insights?.totalAccounts || 0}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={4}>
                      <Typography variant="caption" color="text.secondary">Negative Items</Typography>
                      <Typography variant="h6" color="error.main">
                        {analysis.insights?.negativeItems || 0}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={4}>
                      <Typography variant="caption" color="text.secondary">Credit Utilization</Typography>
                      <Typography variant="h6">{analysis.insights?.creditUtilization || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={4}>
                      <Typography variant="caption" color="text.secondary">Avg Credit Age</Typography>
                      <Typography variant="h6">{analysis.insights?.avgCreditAge || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={4}>
                      <Typography variant="caption" color="text.secondary">Payment History</Typography>
                      <Typography variant="h6" color="success.main">
                        {analysis.insights?.paymentHistory || 'N/A'}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Score Predictions */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                <TrendingUp size={20} style={{ verticalAlign: 'middle', marginRight: 8 }} />
                Score Improvement Predictions
              </Typography>
              <Grid container spacing={2}>
                {analysis.predictions?.map((prediction, index) => (
                  <Grid item xs={12} sm={4} key={index}>
                    <Paper sx={{ p: 2, bgcolor: 'primary.50' }}>
                      <Typography variant="subtitle2" gutterBottom>
                        {prediction.timeframe}
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 600, my: 1 }}>
                        {prediction.minScore} - {prediction.maxScore}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Assuming:
                      </Typography>
                      <List dense>
                        {prediction.assumptions?.map((assumption, i) => (
                          <ListItem key={i} sx={{ px: 0 }}>
                            <ListItemIcon sx={{ minWidth: 20 }}>
                              <CheckCircle size={14} />
                            </ListItemIcon>
                            <ListItemText
                              primary={assumption}
                              primaryTypographyProps={{ variant: 'caption' }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                <Lightbulb size={20} style={{ verticalAlign: 'middle', marginRight: 8 }} />
                AI Recommendations
              </Typography>
              <Box>
                {analysis.recommendations?.map((rec, index) => (
                  <Accordion key={index}>
                    <AccordionSummary expandIcon={<ChevronDown size={20} />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                        <Chip
                          label={rec.priority}
                          color={getPriorityColor(rec.priority)}
                          size="small"
                        />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {rec.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {rec.category}
                          </Typography>
                        </Box>
                        <Chip
                          label={rec.impact}
                          color="success"
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2" paragraph>
                        {rec.description}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Expected timeframe: {rec.timeframe}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Action Items */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                <Target size={20} style={{ verticalAlign: 'middle', marginRight: 8 }} />
                Action Items
              </Typography>
              <List>
                {analysis.actionItems?.map((item, index) => (
                  <React.Fragment key={index}>
                    {index > 0 && <Divider />}
                    <ListItem>
                      <ListItemIcon>
                        {item.status === 'completed' ? (
                          <CheckCircle size={20} color="green" />
                        ) : (
                          <AlertTriangle size={20} color="orange" />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.task}
                        secondary={
                          <Box>
                            <Chip
                              label={item.priority}
                              color={getPriorityColor(item.priority)}
                              size="small"
                              sx={{ mt: 0.5 }}
                            />
                          </Box>
                        }
                      />
                      {item.status !== 'completed' && (
                        <Button size="small" variant="outlined">
                          Mark Complete
                        </Button>
                      )}
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AnalysisTab;
