/**
 * TIER 3 AI FEATURES DASHBOARD
 *
 * Unified dashboard for all Tier 3 (Future Enhancements) AI features:
 * - Competitor Analysis
 * - Success Predictor
 * - Workflow Repair
 * - Time-to-Value Calculator
 *
 * Created: 2025-12-05
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Button,
  Grid,
  Chip,
  LinearProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  TrendingUp,
  Assessment,
  Build,
  AttachMoney,
  CheckCircle,
  Warning,
  Error,
  Info,
  EmojiEvents,
  Speed
} from '@mui/icons-material';

import competitorAnalysis from '../lib/ai/competitorAnalysis';
import successPredictor from '../lib/ai/successPredictor';
import workflowRepair from '../lib/ai/workflowRepair';
import timeToValueCalculator from '../lib/ai/timeToValueCalculator';

export default function Tier3Dashboard({ contactId, workflowId }) {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    competitor: null,
    success: null,
    workflow: null,
    timeToValue: null
  });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const loadData = async (tab) => {
    setLoading(true);
    try {
      switch (tab) {
        case 0: // Competitor Analysis
          if (!data.competitor) {
            const result = await competitorAnalysis.analyzeCompetitors();
            setData(prev => ({ ...prev, competitor: result }));
          }
          break;

        case 1: // Success Predictor
          if (!data.success && contactId) {
            const result = await successPredictor.predictClientSuccess(contactId);
            setData(prev => ({ ...prev, success: result }));
          }
          break;

        case 2: // Workflow Repair
          if (!data.workflow && workflowId) {
            const result = await workflowRepair.analyzeWorkflowHealth(workflowId);
            setData(prev => ({ ...prev, workflow: result }));
          }
          break;

        case 3: // Time-to-Value
          if (!data.timeToValue && contactId) {
            const result = await timeToValueCalculator.calculateTimeToValue(contactId);
            setData(prev => ({ ...prev, timeToValue: result }));
          }
          break;
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(activeTab);
  }, [activeTab]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        AI Insights Dashboard (Tier 3)
      </Typography>

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab icon={<TrendingUp />} label="Competitor Analysis" />
        <Tab icon={<Assessment />} label="Success Predictor" disabled={!contactId} />
        <Tab icon={<Build />} label="Workflow Repair" disabled={!workflowId} />
        <Tab icon={<AttachMoney />} label="ROI Calculator" disabled={!contactId} />
      </Tabs>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Competitor Analysis Tab */}
      {activeTab === 0 && (
        <CompetitorAnalysisView data={data.competitor} loading={loading} />
      )}

      {/* Success Predictor Tab */}
      {activeTab === 1 && contactId && (
        <SuccessPredictorView data={data.success} loading={loading} />
      )}

      {/* Workflow Repair Tab */}
      {activeTab === 2 && workflowId && (
        <WorkflowRepairView
          data={data.workflow}
          loading={loading}
          onRepair={async () => {
            const result = await workflowRepair.repairWorkflow(workflowId);
            setData(prev => ({ ...prev, workflow: result.healthReport || prev.workflow }));
          }}
        />
      )}

      {/* Time-to-Value Tab */}
      {activeTab === 3 && contactId && (
        <TimeToValueView data={data.timeToValue} loading={loading} />
      )}
    </Box>
  );
}

// ============================================================================
// COMPETITOR ANALYSIS VIEW
// ============================================================================

function CompetitorAnalysisView({ data, loading }) {
  if (loading || !data) return <CircularProgress />;

  return (
    <Grid container spacing={3}>
      {/* Competitive Score */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Competitive Score
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <CircularProgress
                variant="determinate"
                value={data.competitiveScore || 0}
                size={80}
              />
              <Typography variant="h3">
                {data.competitiveScore || 0}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Overall market competitiveness
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Pricing Analysis */}
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Pricing Position
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Your pricing is <strong>{data.pricingAnalysis?.yourPosition?.replace('_', ' ')}</strong>
            </Typography>
            {data.pricingAnalysis?.insights?.map((insight, index) => (
              <Alert key={index} severity="info" sx={{ mb: 1 }}>
                {insight.message}
                <br />
                <strong>Recommendation:</strong> {insight.recommendation}
              </Alert>
            ))}
          </CardContent>
        </Card>
      </Grid>

      {/* Top Recommendations */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Strategic Recommendations
            </Typography>
            <List>
              {data.recommendations?.slice(0, 5).map((rec, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemIcon>
                      <TrendingUp color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={rec.title}
                      secondary={rec.action}
                    />
                    <Chip
                      label={rec.priority}
                      color={rec.priority === 'high' ? 'error' : 'default'}
                      size="small"
                    />
                  </ListItem>
                  {index < data.recommendations.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

// ============================================================================
// SUCCESS PREDICTOR VIEW
// ============================================================================

function SuccessPredictorView({ data, loading }) {
  if (loading || !data) return <CircularProgress />;

  return (
    <Grid container spacing={3}>
      {/* Credit Score Prediction */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Credit Score Prediction
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Current: {data.creditScore?.current} → Predicted: {data.creditScore?.predicted}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(data.creditScore?.improvement / 100) * 100}
                sx={{ mt: 1, height: 10, borderRadius: 5 }}
              />
              <Typography variant="h4" sx={{ mt: 1 }}>
                +{data.creditScore?.improvement} points
              </Typography>
            </Box>
            <Chip
              label={`${data.creditScore?.confidence}% Confidence`}
              color="success"
              size="small"
            />
          </CardContent>
        </Card>
      </Grid>

      {/* Timeline Prediction */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Timeline to Completion
            </Typography>
            <Typography variant="h3" sx={{ mb: 1 }}>
              {data.timeline?.estimatedMonths} months
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Expected completion: {new Date(data.timeline?.estimatedCompletionDate).toLocaleDateString()}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">
                Range: {data.timeline?.range?.fastest}-{data.timeline?.range?.longest} months
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Deletion Predictions */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Negative Item Deletion Forecast
            </Typography>
            <Box display="flex" alignItems="center" gap={2} sx={{ mb: 2 }}>
              <Typography variant="h4">
                {data.deletions?.expectedDeletions}/{data.deletions?.totalItems}
              </Typography>
              <Typography variant="body1">
                items expected to be removed ({data.deletions?.deletionRate}% success rate)
              </Typography>
            </Box>
            <Grid container spacing={1}>
              <Grid item xs={4}>
                <Chip label={`Easy: ${data.deletions?.byDifficulty?.easy}`} color="success" />
              </Grid>
              <Grid item xs={4}>
                <Chip label={`Medium: ${data.deletions?.byDifficulty?.medium}`} color="warning" />
              </Grid>
              <Grid item xs={4}>
                <Chip label={`Hard: ${data.deletions?.byDifficulty?.hard}`} color="error" />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Insights */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Key Insights
            </Typography>
            <List>
              {data.insights?.map((insight, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    {insight.icon === '🎯' && <EmojiEvents color="success" />}
                    {insight.icon === '⚠️' && <Warning color="warning" />}
                    {insight.icon === '✅' && <CheckCircle color="success" />}
                    {!insight.icon && <Info color="info" />}
                  </ListItemIcon>
                  <ListItemText
                    primary={insight.message}
                    secondary={insight.recommendation}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

// ============================================================================
// WORKFLOW REPAIR VIEW
// ============================================================================

function WorkflowRepairView({ data, loading, onRepair }) {
  if (loading || !data) return <CircularProgress />;

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'warning': return 'warning';
      default: return 'info';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return <Error />;
      case 'warning': return <Warning />;
      default: return <Info />;
    }
  };

  return (
    <Grid container spacing={3}>
      {/* Health Score */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Workflow Health
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <CircularProgress
                variant="determinate"
                value={data.healthScore || 0}
                size={80}
                color={data.status === 'excellent' ? 'success' : data.status === 'good' ? 'primary' : 'error'}
              />
              <Box>
                <Typography variant="h3">{data.healthScore || 0}</Typography>
                <Chip
                  label={data.status}
                  color={data.status === 'excellent' ? 'success' : 'default'}
                  size="small"
                />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Issue Summary */}
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Issues Found
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Box textAlign="center">
                  <Typography variant="h4" color="error">
                    {data.issues?.critical?.length || 0}
                  </Typography>
                  <Typography variant="body2">Critical</Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box textAlign="center">
                  <Typography variant="h4" color="warning.main">
                    {data.issues?.warnings?.length || 0}
                  </Typography>
                  <Typography variant="body2">Warnings</Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box textAlign="center">
                  <Typography variant="h4" color="info.main">
                    {data.issues?.suggestions?.length || 0}
                  </Typography>
                  <Typography variant="body2">Suggestions</Typography>
                </Box>
              </Grid>
            </Grid>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
              onClick={onRepair}
              disabled={data.issues?.critical?.length === 0 && data.issues?.warnings?.length === 0}
            >
              Auto-Repair Workflow
            </Button>
          </CardContent>
        </Card>
      </Grid>

      {/* Critical Issues */}
      {data.issues?.critical?.length > 0 && (
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="error">
                Critical Issues
              </Typography>
              <List>
                {data.issues.critical.map((issue, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <Error color="error" />
                    </ListItemIcon>
                    <ListItemText
                      primary={issue.message}
                      secondary={issue.autoFix ? '✓ Auto-fixable' : 'Requires manual fix'}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* Warnings */}
      {data.issues?.warnings?.length > 0 && (
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="warning.main">
                Warnings
              </Typography>
              <List>
                {data.issues.warnings.map((issue, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <Warning color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary={issue.message}
                      secondary={issue.recommendation}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      )}
    </Grid>
  );
}

// ============================================================================
// TIME-TO-VALUE VIEW
// ============================================================================

function TimeToValueView({ data, loading }) {
  if (loading || !data) return <CircularProgress />;

  return (
    <Grid container spacing={3}>
      {/* ROI Summary */}
      <Grid item xs={12}>
        <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <CardContent>
            <Typography variant="h4" gutterBottom>
              {data.roi?.roiPercentage}% Return on Investment
            </Typography>
            <Typography variant="h6">
              ${data.roi?.netBenefit?.toLocaleString()} Net Benefit
            </Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>
              +{data.contact?.scoreImprovement} credit score points
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Investment vs Value */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Investment
            </Typography>
            <Typography variant="h4" color="primary">
              ${data.investment?.totalPaid}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {data.investment?.monthsInProgram} months × ${data.investment?.monthlyRate}/mo
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Service Tier: <strong>{data.contact?.serviceTier}</strong>
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Total Value Received
            </Typography>
            <Typography variant="h4" color="success.main">
              ${Math.round(data.value?.totalValue).toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Lifetime financial benefit
            </Typography>
            {data.roi?.paybackPeriod && (
              <Alert severity="success" sx={{ mt: 2 }}>
                Break-even: {data.roi.paybackPeriod}
              </Alert>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Value Breakdown */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Value Breakdown
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Category</TableCell>
                    <TableCell>Details</TableCell>
                    <TableCell align="right">Monthly</TableCell>
                    <TableCell align="right">Lifetime</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.value?.interestSavings?.breakdown?.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.type}</TableCell>
                      <TableCell>
                        {item.oldRate}% → {item.newRate}% APR
                      </TableCell>
                      <TableCell align="right">${item.monthlySavings}</TableCell>
                      <TableCell align="right">${item.lifetimeSavings.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  {data.value?.insuranceSavings?.breakdown?.map((item, index) => (
                    <TableRow key={`ins-${index}`}>
                      <TableCell>{item.type}</TableCell>
                      <TableCell>Lower rates with better credit</TableCell>
                      <TableCell align="right">${item.monthlySavings}</TableCell>
                      <TableCell align="right">${item.annualSavings.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Insights */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Key Insights
            </Typography>
            <List>
              {data.insights?.map((insight, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    {insight.icon === '🎯' && <EmojiEvents color="success" />}
                    {insight.icon === '✅' && <CheckCircle color="success" />}
                    {insight.icon === '💰' && <AttachMoney color="primary" />}
                    {insight.icon === '⚡' && <Speed color="primary" />}
                  </ListItemIcon>
                  <ListItemText
                    primary={insight.message}
                    secondary={`Importance: ${insight.importance}`}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
