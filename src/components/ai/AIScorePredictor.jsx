// ============================================================================
// AI SCORE PREDICTOR - PREDICTIVE CREDIT SCORE ANALYSIS
// ============================================================================
// ML-powered credit score prediction with scenario analysis
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  TextField,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Speed,
  Refresh,
  ExpandMore,
  CheckCircle,
  Warning,
  Info,
  Lightbulb,
  Timeline,
  Flag,
  Star,
  ArrowUpward,
  ArrowDownward,
} from '@mui/icons-material';
import { httpsCallable } from 'firebase/functions';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db, functions } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

// Score Gauge Component
const ScoreGauge = ({ score, label, predicted, size = 'medium' }) => {
  const getScoreColor = (s) => {
    if (s >= 800) return '#00c853';
    if (s >= 740) return '#64dd17';
    if (s >= 670) return '#ffeb3b';
    if (s >= 580) return '#ff9800';
    return '#f44336';
  };

  const gaugeSize = size === 'large' ? 140 : size === 'medium' ? 100 : 70;
  const strokeWidth = size === 'large' ? 12 : size === 'medium' ? 8 : 6;
  const radius = (gaugeSize - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const normalizedScore = Math.min(Math.max(score, 300), 850);
  const percentage = (normalizedScore - 300) / 550;
  const strokeDashoffset = circumference - percentage * circumference;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Box sx={{ position: 'relative', width: gaugeSize, height: gaugeSize }}>
        <svg width={gaugeSize} height={gaugeSize} style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx={gaugeSize / 2}
            cy={gaugeSize / 2}
            r={radius}
            fill="none"
            stroke="#e0e0e0"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={gaugeSize / 2}
            cy={gaugeSize / 2}
            r={radius}
            fill="none"
            stroke={getScoreColor(score)}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />
        </svg>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
          }}
        >
          <Typography
            variant={size === 'large' ? 'h4' : size === 'medium' ? 'h5' : 'h6'}
            fontWeight="bold"
            color={getScoreColor(score)}
          >
            {score || '---'}
          </Typography>
        </Box>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        {label}
      </Typography>
      {predicted && (
        <Chip
          icon={<TrendingUp sx={{ fontSize: 14 }} />}
          label="Predicted"
          size="small"
          color="primary"
          sx={{ mt: 0.5 }}
        />
      )}
    </Box>
  );
};

// Prediction Card Component
const PredictionCard = ({ title, prediction, color, icon: Icon }) => {
  const avgScore = prediction
    ? Math.round((prediction.experian + prediction.equifax + prediction.transunion) / 3)
    : 0;

  return (
    <Card sx={{ height: '100%', borderTop: `4px solid ${color}` }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: `${color}20`, color, mr: 1 }}>
            <Icon />
          </Avatar>
          <Typography variant="h6" fontWeight="bold">
            {title}
          </Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <ScoreGauge score={prediction?.experian || 0} label="Experian" size="small" predicted />
          </Grid>
          <Grid item xs={4}>
            <ScoreGauge score={prediction?.equifax || 0} label="Equifax" size="small" predicted />
          </Grid>
          <Grid item xs={4}>
            <ScoreGauge score={prediction?.transunion || 0} label="TransUnion" size="small" predicted />
          </Grid>
        </Grid>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Average: <strong>{avgScore}</strong>
          </Typography>
          {prediction?.timeline && (
            <Chip
              icon={<Timeline sx={{ fontSize: 14 }} />}
              label={prediction.timeline}
              size="small"
              sx={{ mt: 1 }}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

const AIScorePredictor = () => {
  const { userProfile } = useAuth();
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const [scenarioType, setScenarioType] = useState('all_disputes_successful');

  // Load clients
  useEffect(() => {
    const loadClients = async () => {
      try {
        const contactsRef = collection(db, 'contacts');
        const q = query(contactsRef, orderBy('lastName'), limit(500));
        const snapshot = await getDocs(q);
        const clientList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          label: `${doc.data().firstName || ''} ${doc.data().lastName || ''}`.trim() || doc.data().email,
        }));
        setClients(clientList);
      } catch (err) {
        console.error('Error loading clients:', err);
      } finally {
        setClientsLoading(false);
      }
    };
    loadClients();
  }, []);

  // Run prediction
  const runPrediction = async () => {
    if (!selectedClient) {
      setError('Please select a client');
      return;
    }

    setLoading(true);
    setError(null);
    setPrediction(null);

    try {
      const predictScore = httpsCallable(functions, 'predictCreditScore');
      const result = await predictScore({
        clientId: selectedClient.id,
        scenarioType,
      });

      if (result.data.success) {
        setPrediction(result.data.prediction);
      } else {
        setError('Prediction failed');
      }
    } catch (err) {
      console.error('Prediction error:', err);
      setError(err.message || 'Failed to generate prediction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2, width: 56, height: 56 }}>
              <Speed sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="bold">
                AI Score Predictor
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Machine learning-powered credit score forecasting
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Controls */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={5}>
            <Autocomplete
              options={clients}
              loading={clientsLoading}
              value={selectedClient}
              onChange={(e, newValue) => setSelectedClient(newValue)}
              getOptionLabel={(option) => option.label || ''}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Client"
                  placeholder="Search by name..."
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {clientsLoading ? <CircularProgress size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Prediction Scenario</InputLabel>
              <Select
                value={scenarioType}
                label="Prediction Scenario"
                onChange={(e) => setScenarioType(e.target.value)}
              >
                <MenuItem value="all_disputes_successful">All Disputes Successful</MenuItem>
                <MenuItem value="realistic">Realistic (Based on History)</MenuItem>
                <MenuItem value="conservative">Conservative Estimate</MenuItem>
                <MenuItem value="current_only">Current Trajectory</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={runPrediction}
              disabled={loading || !selectedClient}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <TrendingUp />}
              sx={{ height: 56, background: 'linear-gradient(45deg, #667eea, #764ba2)' }}
            >
              {loading ? 'Analyzing...' : 'Predict Score'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Results */}
      {prediction && (
        <>
          {/* Current vs Predicted */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom color="text.secondary">
                  Current Estimated Scores
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <ScoreGauge
                      score={prediction.currentScoreEstimate?.experian || 0}
                      label="Experian"
                      size="medium"
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <ScoreGauge
                      score={prediction.currentScoreEstimate?.equifax || 0}
                      label="Equifax"
                      size="medium"
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <ScoreGauge
                      score={prediction.currentScoreEstimate?.transunion || 0}
                      label="TransUnion"
                      size="medium"
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, textAlign: 'center', background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)' }}>
                <Typography variant="h6" gutterBottom color="success.dark">
                  Predicted Scores (Realistic)
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <ScoreGauge
                      score={prediction.predictedScores?.realistic?.experian || 0}
                      label="Experian"
                      size="medium"
                      predicted
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <ScoreGauge
                      score={prediction.predictedScores?.realistic?.equifax || 0}
                      label="Equifax"
                      size="medium"
                      predicted
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <ScoreGauge
                      score={prediction.predictedScores?.realistic?.transunion || 0}
                      label="TransUnion"
                      size="medium"
                      predicted
                    />
                  </Grid>
                </Grid>
                {prediction.predictedScores?.realistic?.timeline && (
                  <Chip
                    icon={<Timeline />}
                    label={`Timeline: ${prediction.predictedScores.realistic.timeline}`}
                    color="success"
                    sx={{ mt: 2 }}
                  />
                )}
              </Paper>
            </Grid>
          </Grid>

          {/* Scenario Comparisons */}
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Scenario Analysis
          </Typography>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <PredictionCard
                title="Optimistic"
                prediction={prediction.predictedScores?.optimistic}
                color="#4caf50"
                icon={TrendingUp}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <PredictionCard
                title="Realistic"
                prediction={prediction.predictedScores?.realistic}
                color="#2196f3"
                icon={Speed}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <PredictionCard
                title="Conservative"
                prediction={prediction.predictedScores?.conservative}
                color="#ff9800"
                icon={Flag}
              />
            </Grid>
          </Grid>

          {/* Key Factors */}
          {prediction.keyFactors?.length > 0 && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Info sx={{ mr: 1 }} />
                Key Score Factors
              </Typography>
              <Grid container spacing={2}>
                {prediction.keyFactors.map((factor, idx) => (
                  <Grid item xs={12} md={6} key={idx}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {factor.impact === 'positive' ? (
                              <ArrowUpward sx={{ color: 'success.main', mr: 1 }} />
                            ) : (
                              <ArrowDownward sx={{ color: 'error.main', mr: 1 }} />
                            )}
                            <Typography fontWeight="bold">{factor.factor}</Typography>
                          </Box>
                          <Chip
                            label={`${factor.points > 0 ? '+' : ''}${factor.points} pts`}
                            size="small"
                            color={factor.impact === 'positive' ? 'success' : 'error'}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {factor.recommendation}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          )}

          {/* Quick Wins */}
          {prediction.quickWins?.length > 0 && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Lightbulb sx={{ mr: 1, color: 'warning.main' }} />
                Quick Wins
              </Typography>
              <List>
                {prediction.quickWins.map((win, idx) => (
                  <ListItem key={idx} sx={{ bgcolor: 'action.hover', borderRadius: 1, mb: 1 }}>
                    <ListItemIcon>
                      <Star sx={{ color: 'warning.main' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={win.action}
                      secondary={
                        <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                          <Chip label={`+${win.potentialGain} pts`} size="small" color="success" />
                          <Chip label={win.difficulty} size="small" variant="outlined" />
                          <Chip label={win.timeframe} size="small" variant="outlined" />
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}

          {/* Risk Factors */}
          {prediction.riskFactors?.length > 0 && (
            <Paper sx={{ p: 3, bgcolor: 'error.light' }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', color: 'error.dark' }}>
                <Warning sx={{ mr: 1 }} />
                Risk Factors
              </Typography>
              <List dense>
                {prediction.riskFactors.map((risk, idx) => (
                  <ListItem key={idx}>
                    <ListItemIcon>
                      <Warning sx={{ color: 'error.dark' }} />
                    </ListItemIcon>
                    <ListItemText primary={risk} sx={{ color: 'error.dark' }} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}

          {/* Confidence Level */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Prediction Confidence: {Math.round((prediction.confidenceLevel || 0) * 100)}%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={(prediction.confidenceLevel || 0) * 100}
              sx={{ mt: 1, height: 8, borderRadius: 4 }}
            />
          </Box>
        </>
      )}

      {/* Empty State */}
      {!prediction && !loading && (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Speed sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Select a client to predict their credit score
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Our AI analyzes credit data, active disputes, and historical patterns
            to forecast future scores across multiple scenarios.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default AIScorePredictor;
