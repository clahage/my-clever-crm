// ============================================================================
// AI CREDIT SCORE SIMULATOR - WHAT-IF SCENARIO ANALYSIS
// ============================================================================
// Predict credit score changes based on hypothetical actions
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
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
  Slider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Speed,
  Refresh,
  PlayArrow,
  CheckCircle,
  Warning,
  Star,
  ExpandMore,
  CreditCard,
  Delete,
  Schedule,
  AttachMoney,
  Lightbulb,
  CompareArrows,
  Timeline,
  EmojiEvents,
} from '@mui/icons-material';
import { httpsCallable } from 'firebase/functions';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db, functions } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

// Score Display Component
const ScoreDisplay = ({ score, label, change, size = 'medium' }) => {
  const getColor = (s) => {
    if (s >= 740) return '#22c55e';
    if (s >= 670) return '#84cc16';
    if (s >= 580) return '#f59e0b';
    return '#ef4444';
  };

  const getRating = (s) => {
    if (s >= 800) return 'Exceptional';
    if (s >= 740) return 'Very Good';
    if (s >= 670) return 'Good';
    if (s >= 580) return 'Fair';
    return 'Poor';
  };

  return (
    <Box sx={{ textAlign: 'center', p: 2 }}>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography
        variant={size === 'large' ? 'h2' : 'h4'}
        fontWeight="bold"
        sx={{ color: getColor(score) }}
      >
        {score}
      </Typography>
      <Chip
        label={getRating(score)}
        size="small"
        sx={{ bgcolor: `${getColor(score)}20`, color: getColor(score), mt: 0.5 }}
      />
      {change !== undefined && change !== 0 && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
          {change > 0 ? (
            <TrendingUp sx={{ color: 'success.main', fontSize: 18 }} />
          ) : (
            <TrendingDown sx={{ color: 'error.main', fontSize: 18 }} />
          )}
          <Typography
            variant="body2"
            sx={{ color: change > 0 ? 'success.main' : 'error.main', fontWeight: 'bold' }}
          >
            {change > 0 ? '+' : ''}{change} pts
          </Typography>
        </Box>
      )}
    </Box>
  );
};

// Scenario Card Component
const ScenarioCard = ({ scenario, isSelected, onSelect }) => {
  const getDifficultyColor = (diff) => {
    if (diff === 'easy') return 'success';
    if (diff === 'medium') return 'warning';
    return 'error';
  };

  return (
    <Card
      sx={{
        cursor: 'pointer',
        border: isSelected ? '2px solid' : '1px solid',
        borderColor: isSelected ? 'primary.main' : 'divider',
        transition: 'all 0.2s',
        '&:hover': { boxShadow: 3, transform: 'translateY(-2px)' },
      }}
      onClick={onSelect}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            {scenario.description}
          </Typography>
          <Chip
            label={scenario.difficulty}
            size="small"
            color={getDifficultyColor(scenario.difficulty)}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 2 }}>
          <Avatar
            sx={{
              bgcolor: scenario.pointsGained >= 0 ? 'success.light' : 'error.light',
              width: 48,
              height: 48,
            }}
          >
            <Typography variant="h6" fontWeight="bold" color={scenario.pointsGained >= 0 ? 'success.dark' : 'error.dark'}>
              {scenario.pointsGained >= 0 ? '+' : ''}{scenario.pointsGained}
            </Typography>
          </Avatar>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Predicted Score
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              {scenario.predictedScore?.average || 'N/A'}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
          <Chip
            icon={<Schedule />}
            label={scenario.timeToReflect}
            size="small"
            variant="outlined"
          />
          <Chip
            label={`${scenario.confidence}% confidence`}
            size="small"
            variant="outlined"
          />
        </Box>

        {scenario.costEstimate && (
          <Typography variant="caption" color="text.secondary">
            Est. Cost: {scenario.costEstimate}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

const CreditScoreSimulator = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [simulationResult, setSimulationResult] = useState(null);
  const [customScenarios, setCustomScenarios] = useState([]);

  // Load clients
  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const clientsQuery = query(
        collection(db, 'contacts'),
        where('type', '==', 'client'),
        orderBy('lastName'),
        limit(100)
      );
      const snap = await getDocs(clientsQuery);
      setClients(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error('Error loading clients:', err);
    }
  };

  const runSimulation = async () => {
    if (!selectedClient) return;

    setLoading(true);
    setError(null);

    try {
      const simulate = httpsCallable(functions, 'simulateCreditScore');
      const result = await simulate({
        clientId: selectedClient.id,
        scenarios: customScenarios.length > 0 ? customScenarios : null,
      });

      if (result.data.success) {
        setSimulationResult(result.data);
      }
    } catch (err) {
      console.error('Simulation error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2, width: 56, height: 56 }}>
              <CompareArrows sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="bold">
                Credit Score Simulator
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                "What-if" analysis: See how actions impact credit scores
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Client Selection */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Select Client
        </Typography>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Autocomplete
              options={clients}
              getOptionLabel={(c) => `${c.firstName} ${c.lastName} - ${c.email}`}
              value={selectedClient}
              onChange={(e, v) => setSelectedClient(v)}
              renderInput={(params) => (
                <TextField {...params} label="Search clients..." variant="outlined" />
              )}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              variant="contained"
              size="large"
              fullWidth
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PlayArrow />}
              onClick={runSimulation}
              disabled={!selectedClient || loading}
            >
              Run Simulation
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Results */}
      {simulationResult && (
        <>
          {/* Current vs Combined Prediction */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Score Comparison
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="subtitle2" color="text.secondary">Current Score</Typography>
                  <ScoreDisplay
                    score={simulationResult.currentScore?.average || 0}
                    label="Average"
                    size="large"
                  />
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
                    <ScoreDisplay score={simulationResult.currentScore?.experian || 0} label="Experian" />
                    <ScoreDisplay score={simulationResult.currentScore?.equifax || 0} label="Equifax" />
                    <ScoreDisplay score={simulationResult.currentScore?.transunion || 0} label="TransUnion" />
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box sx={{ textAlign: 'center' }}>
                  <TrendingUp sx={{ fontSize: 64, color: 'success.main' }} />
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    +{simulationResult.combinedScenario?.totalPointsGained || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Potential Gain
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper
                  variant="outlined"
                  sx={{ p: 2, textAlign: 'center', bgcolor: 'success.lighter', borderColor: 'success.main' }}
                >
                  <Typography variant="subtitle2" color="success.dark">If All Actions Completed</Typography>
                  <ScoreDisplay
                    score={simulationResult.combinedScenario?.predictedScore || 0}
                    label="Projected"
                    size="large"
                    change={simulationResult.combinedScenario?.totalPointsGained}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Timeframe: {simulationResult.combinedScenario?.timeframe}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Paper>

          {/* Scenarios */}
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            <Lightbulb sx={{ verticalAlign: 'middle', mr: 1, color: 'warning.main' }} />
            What-If Scenarios
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {simulationResult.scenarios?.map((scenario, idx) => (
              <Grid item xs={12} md={6} lg={4} key={idx}>
                <ScenarioCard scenario={scenario} />
              </Grid>
            ))}
          </Grid>

          {/* Recommendations */}
          {simulationResult.recommendations?.length > 0 && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                <Star sx={{ verticalAlign: 'middle', mr: 1, color: 'warning.main' }} />
                AI Recommendations (Prioritized)
              </Typography>
              <List>
                {simulationResult.recommendations.map((rec, idx) => (
                  <ListItem key={idx}>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                        {rec.priority}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={rec.action}
                      secondary={`${rec.reason} • Expected: +${rec.expectedGain} points`}
                    />
                    <Chip
                      label={`+${rec.expectedGain} pts`}
                      color="success"
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}

          {/* Warnings */}
          {simulationResult.warnings?.length > 0 && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>Important Notes:</Typography>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {simulationResult.warnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </Alert>
          )}

          {/* Credit Profile Summary */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Current Credit Profile
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                  <Typography variant="h4" fontWeight="bold" color="primary">
                    {simulationResult.creditProfile?.utilization}%
                  </Typography>
                  <Typography variant="caption">Utilization</Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                  <Typography variant="h4" fontWeight="bold" color="error.main">
                    {simulationResult.creditProfile?.collections}
                  </Typography>
                  <Typography variant="caption">Collections</Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {simulationResult.creditProfile?.latePayments}
                  </Typography>
                  <Typography variant="caption">Late Payments</Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                  <Typography variant="h4" fontWeight="bold" color="info.main">
                    {simulationResult.creditProfile?.accounts}
                  </Typography>
                  <Typography variant="caption">Total Accounts</Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </>
      )}

      {/* Empty State */}
      {!simulationResult && !loading && (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <CompareArrows sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Select a client and run a simulation
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The AI will analyze their credit profile and predict score changes for various scenarios
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default CreditScoreSimulator;
