// CreditSimulator.jsx - Professional Multi-Model Credit Score Simulator
import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Chip,
  Alert,
  IconButton,
  Tooltip,
  LinearProgress,
  Switch,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge,
  ToggleButton,
  ToggleButtonGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Container
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  CreditCard,
  Calendar,
  DollarSign,
  AlertCircle,
  Info,
  ChevronDown,
  Calculator,
  Target,
  Activity,
  BarChart3,
  Home,
  Car,
  Briefcase,
  Plus,
  Minus,
  RefreshCw,
  Save,
  Download,
  History,
  Zap
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  Legend,
  Cell
} from 'recharts';

// Scoring model configurations
const SCORING_MODELS = {
  'FICO 8': {
    name: 'FICO 8',
    range: [300, 850],
    weights: {
      paymentHistory: 0.35,
      creditUtilization: 0.30,
      creditAge: 0.15,
      creditMix: 0.10,
      newCredit: 0.10
    },
    categories: {
      exceptional: [800, 850],
      veryGood: [740, 799],
      good: [670, 739],
      fair: [580, 669],
      poor: [300, 579]
    }
  },
  'FICO Auto': {
    name: 'FICO Auto Score 8',
    range: [250, 900],
    weights: {
      paymentHistory: 0.40,
      creditUtilization: 0.25,
      creditAge: 0.12,
      creditMix: 0.13,
      newCredit: 0.10
    },
    categories: {
      exceptional: [800, 900],
      veryGood: [740, 799],
      good: [670, 739],
      fair: [580, 669],
      poor: [250, 579]
    }
  },
  'FICO Mortgage': {
    name: 'FICO Mortgage Score',
    range: [300, 850],
    weights: {
      paymentHistory: 0.38,
      creditUtilization: 0.28,
      creditAge: 0.14,
      creditMix: 0.10,
      newCredit: 0.10
    },
    categories: {
      exceptional: [760, 850],
      veryGood: [700, 759],
      good: [660, 699],
      fair: [620, 659],
      poor: [300, 619]
    }
  },
  'VantageScore 4.0': {
    name: 'VantageScore 4.0',
    range: [300, 850],
    weights: {
      paymentHistory: 0.41,
      creditUtilization: 0.20,
      creditAge: 0.20,
      creditMix: 0.11,
      newCredit: 0.08
    },
    categories: {
      excellent: [781, 850],
      good: [661, 780],
      fair: [601, 660],
      poor: [500, 600],
      veryPoor: [300, 499]
    }
  }
};

const CreditSimulator = () => {
// Deprecated: Simulator.jsx
// This feature is now integrated into CreditHub.jsx (Score Simulation tab)
  const [selectedModel, setSelectedModel] = useState('FICO 8');
  const [compareMode, setCompareMode] = useState(false);
  const [scenarios, setScenarios] = useState([]);
  
  // Current credit profile state
  const [profile, setProfile] = useState({
    // Payment History
    onTimePayments: 95,
    latePayments30Days: 1,
    latePayments60Days: 0,
    latePayments90Days: 0,
    collections: 0,
    bankruptcies: 0,
    
    // Credit Utilization
    totalCreditLimit: 25000,
    totalBalance: 7500,
    numberOfCards: 5,
    highestUtilization: 45,
    
    // Credit Age
    oldestAccount: 84, // months
    averageAccountAge: 48,
    
    // Credit Mix
    creditCards: 5,
    installmentLoans: 1,
    mortgages: 0,
    autoLoans: 1,
    studentLoans: 0,
    
    // New Credit
    hardInquiries: 2,
    newAccounts: 1,
    monthsSinceLastInquiry: 6
  });

  // Simulated changes
  const [simulatedProfile, setSimulatedProfile] = useState({ ...profile });
  
  // Calculate score based on model and profile
  const calculateScore = (profileData, modelName) => {
    const model = SCORING_MODELS[modelName];
    const weights = model.weights;
    const [minScore, maxScore] = model.range;
    
    // Payment History Score (0-100)
    let paymentScore = profileData.onTimePayments;
    paymentScore -= profileData.latePayments30Days * 5;
    paymentScore -= profileData.latePayments60Days * 10;
    paymentScore -= profileData.latePayments90Days * 20;
    paymentScore -= profileData.collections * 30;
    paymentScore -= profileData.bankruptcies * 50;
    paymentScore = Math.max(0, Math.min(100, paymentScore));
    
    // Credit Utilization Score (0-100)
    const utilization = (profileData.totalBalance / profileData.totalCreditLimit) * 100;
    let utilizationScore = 100;
    if (utilization <= 10) utilizationScore = 100;
    else if (utilization <= 30) utilizationScore = 90 - (utilization - 10) * 0.5;
    else if (utilization <= 50) utilizationScore = 80 - (utilization - 30) * 1;
    else if (utilization <= 70) utilizationScore = 60 - (utilization - 50) * 1.5;
    else utilizationScore = 30 - (utilization - 70) * 0.5;
    utilizationScore = Math.max(0, Math.min(100, utilizationScore));
    
    // Credit Age Score (0-100)
    let ageScore = Math.min(100, (profileData.averageAccountAge / 84) * 100);
    if (profileData.oldestAccount >= 120) ageScore += 10;
    ageScore = Math.min(100, ageScore);
    
    // Credit Mix Score (0-100)
    const totalAccounts = profileData.creditCards + profileData.installmentLoans + 
                          profileData.mortgages + profileData.autoLoans + profileData.studentLoans;
    const accountTypes = [profileData.creditCards, profileData.installmentLoans, 
                          profileData.mortgages, profileData.autoLoans, profileData.studentLoans]
                          .filter(x => x > 0).length;
    let mixScore = (accountTypes / 5) * 80 + (Math.min(totalAccounts, 10) / 10) * 20;
    
    // New Credit Score (0-100)
    let newCreditScore = 100;
    newCreditScore -= profileData.hardInquiries * 10;
    newCreditScore -= profileData.newAccounts * 5;
    newCreditScore += Math.min(profileData.monthsSinceLastInquiry * 2, 20);
    newCreditScore = Math.max(0, Math.min(100, newCreditScore));
    
    // Calculate weighted score
    const weightedScore = (
      paymentScore * weights.paymentHistory +
      utilizationScore * weights.creditUtilization +
      ageScore * weights.creditAge +
      mixScore * weights.creditMix +
      newCreditScore * weights.newCredit
    );
    
    // Scale to model's range
    const scaledScore = minScore + (weightedScore / 100) * (maxScore - minScore);
    
    return {
      score: Math.round(scaledScore),
      factors: {
        paymentHistory: Math.round(paymentScore),
        creditUtilization: Math.round(utilizationScore),
        creditAge: Math.round(ageScore),
        creditMix: Math.round(mixScore),
        newCredit: Math.round(newCreditScore)
      },
      utilization: Math.round(utilization)
    };
  };

  const currentScore = useMemo(() => calculateScore(profile, selectedModel), [profile, selectedModel]);
  const simulatedScore = useMemo(() => calculateScore(simulatedProfile, selectedModel), [simulatedProfile, selectedModel]);
  const scoreDifference = simulatedScore.score - currentScore.score;

  // Get score category
  const getScoreCategory = (score, modelName) => {
    const model = SCORING_MODELS[modelName];
    for (const [category, [min, max]] of Object.entries(model.categories)) {
      if (score >= min && score <= max) {
        return category.charAt(0).toUpperCase() + category.slice(1).replace(/([A-Z])/g, ' $1');
      }
    }
    return 'Unknown';
  };

  // Get score color
  const getScoreColor = (score, modelName) => {
    const model = SCORING_MODELS[modelName];
    const categories = model.categories;
    
    if (categories.exceptional && score >= categories.exceptional[0]) return '#10B981';
    if (categories.excellent && score >= categories.excellent[0]) return '#10B981';
    if (categories.veryGood && score >= categories.veryGood[0]) return '#3B82F6';
    if (categories.good && score >= categories.good[0]) return '#3B82F6';
    if (categories.fair && score >= categories.fair[0]) return '#F59E0B';
    if (categories.poor && score >= categories.poor[0]) return '#EF4444';
    return '#DC2626';
  };

  // Save scenario
  const saveScenario = () => {
    const newScenario = {
      id: Date.now(),
      name: `Scenario ${scenarios.length + 1}`,
      date: new Date().toISOString(),
      model: selectedModel,
      profile: { ...simulatedProfile },
      score: simulatedScore.score,
      difference: scoreDifference
    };
    setScenarios([...scenarios, newScenario]);
  };

  // Load scenario
  const loadScenario = (scenario) => {
    setSelectedModel(scenario.model);
    setSimulatedProfile(scenario.profile);
  };

  // Reset simulation
export default function DeprecatedSimulator() {
  return null;
}
    setSimulatedProfile({ ...profile });
  };

  // Chart data for factor comparison
  const factorComparisonData = [
    {
      factor: 'Payment History',
      current: currentScore.factors.paymentHistory,
      simulated: simulatedScore.factors.paymentHistory
    },
    {
      factor: 'Credit Utilization',
      current: currentScore.factors.creditUtilization,
      simulated: simulatedScore.factors.creditUtilization
    },
    {
      factor: 'Credit Age',
      current: currentScore.factors.creditAge,
      simulated: simulatedScore.factors.creditAge
    },
    {
      factor: 'Credit Mix',
      current: currentScore.factors.creditMix,
      simulated: simulatedScore.factors.creditMix
    },
    {
      factor: 'New Credit',
      current: currentScore.factors.newCredit,
      simulated: simulatedScore.factors.newCredit
    }
  ];

  // Score projection over time
  const projectionData = Array.from({ length: 12 }, (_, i) => {
    const monthsAhead = i + 1;
    const projectedProfile = {
      ...simulatedProfile,
      averageAccountAge: simulatedProfile.averageAccountAge + monthsAhead,
      monthsSinceLastInquiry: simulatedProfile.monthsSinceLastInquiry + monthsAhead,
      onTimePayments: Math.min(100, simulatedProfile.onTimePayments + monthsAhead * 0.5)
    };
    const projectedScore = calculateScore(projectedProfile, selectedModel);
    
    return {
      month: `Month ${monthsAhead}`,
      score: projectedScore.score
    };
  });

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Calculator /> Credit Score Simulator
        </Typography>
        <Typography color="text.secondary">
          Simulate credit score changes across multiple scoring models
        </Typography>
      </Box>

      {/* Model Selection */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Scoring Model</InputLabel>
              <Select
                value={selectedModel}
                label="Scoring Model"
                onChange={(e) => setSelectedModel(e.target.value)}
                startAdornment={<BarChart3 size={20} style={{ marginRight: 8 }} />}
              >
                {Object.keys(SCORING_MODELS).map(model => (
                  <MenuItem key={model} value={model}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {model.includes('Auto') && <Car size={16} />}
                      {model.includes('Mortgage') && <Home size={16} />}
                      {model.includes('FICO 8') && <CreditCard size={16} />}
                      {model.includes('Vantage') && <Target size={16} />}
                      {SCORING_MODELS[model].name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControlLabel
              control={<Switch checked={compareMode} onChange={(e) => setCompareMode(e.target.checked)} />}
              label="Compare All Models"
            />
          </Grid>
          <Grid item xs={12} md={5} sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button startIcon={<RefreshCw />} onClick={resetSimulation}>
              Reset
            </Button>
            <Button startIcon={<Save />} onClick={saveScenario} variant="outlined">
              Save Scenario
            </Button>
            <Button startIcon={<Download />} variant="contained">
              Export Report
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Score Display */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'primary.dark', color: 'white' }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                Current Score ({selectedModel})
              </Typography>
              <Typography variant="h2" sx={{ my: 1 }}>
                {currentScore.score}
              </Typography>
              <Chip 
                label={getScoreCategory(currentScore.score, selectedModel)}
                size="small"
                sx={{ bgcolor: 'white', color: 'primary.dark' }}
              />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            bgcolor: scoreDifference >= 0 ? 'success.main' : 'error.main', 
            color: 'white' 
          }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                Simulated Score
              </Typography>
              <Typography variant="h2" sx={{ my: 1 }}>
                {simulatedScore.score}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {scoreDifference > 0 ? <TrendingUp /> : scoreDifference < 0 ? <TrendingDown /> : <Minus />}
                <Typography variant="h6">
                  {scoreDifference > 0 ? '+' : ''}{scoreDifference} points
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Credit Utilization
              </Typography>
              <Typography variant="h3" sx={{ my: 1 }}>
                {simulatedScore.utilization}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={simulatedScore.utilization}
                sx={{ 
                  height: 10, 
                  borderRadius: 5,
                  bgcolor: 'grey.300',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: simulatedScore.utilization <= 30 ? 'success.main' : 
                             simulatedScore.utilization <= 50 ? 'warning.main' : 'error.main'
                  }
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                Target: Under 30% (ideally under 10%)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Simulation Controls */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 2 }}>
            <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 3 }}>
              <Tab label="Payment History (35%)" />
              <Tab label="Credit Utilization (30%)" />
              <Tab label="Credit Age (15%)" />
              <Tab label="Credit Mix (10%)" />
              <Tab label="New Credit (10%)" />
            </Tabs>

            {/* Payment History Tab */}
            {activeTab === 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>Payment History Factors</Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography gutterBottom>On-Time Payments (%)</Typography>
                    <Slider
                      value={simulatedProfile.onTimePayments}
                      onChange={(e, v) => setSimulatedProfile(prev => ({ ...prev, onTimePayments: v }))}
                      min={0}
                      max={100}
                      marks={[
                        { value: 0, label: '0%' },
                        { value: 50, label: '50%' },
                        { value: 100, label: '100%' }
                      ]}
                      valueLabelDisplay="on"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography gutterBottom>30-Day Late Payments</Typography>
                    <Slider
                      value={simulatedProfile.latePayments30Days}
                      onChange={(e, v) => setSimulatedProfile(prev => ({ ...prev, latePayments30Days: v }))}
                      min={0}
                      max={10}
                      step={1}
                      marks
                      valueLabelDisplay="on"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography gutterBottom>60-Day Late Payments</Typography>
                    <Slider
                      value={simulatedProfile.latePayments60Days}
                      onChange={(e, v) => setSimulatedProfile(prev => ({ ...prev, latePayments60Days: v }))}
                      min={0}
                      max={10}
                      step={1}
                      marks
                      valueLabelDisplay="on"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography gutterBottom>90+ Day Late Payments</Typography>
                    <Slider
                      value={simulatedProfile.latePayments90Days}
                      onChange={(e, v) => setSimulatedProfile(prev => ({ ...prev, latePayments90Days: v }))}
                      min={0}
                      max={10}
                      step={1}
                      marks
                      valueLabelDisplay="on"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography gutterBottom>Collections</Typography>
                    <Slider
                      value={simulatedProfile.collections}
                      onChange={(e, v) => setSimulatedProfile(prev => ({ ...prev, collections: v }))}
                      min={0}
                      max={5}
                      step={1}
                      marks
                      valueLabelDisplay="on"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography gutterBottom>Bankruptcies</Typography>
                    <Slider
                      value={simulatedProfile.bankruptcies}
                      onChange={(e, v) => setSimulatedProfile(prev => ({ ...prev, bankruptcies: v }))}
                      min={0}
                      max={2}
                      step={1}
                      marks
                      valueLabelDisplay="on"
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Credit Utilization Tab */}
            {activeTab === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom>Credit Utilization Factors</Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography gutterBottom>Total Credit Limit</Typography>
                    <TextField
                      fullWidth
                      type="number"
                      value={simulatedProfile.totalCreditLimit}
                      onChange={(e) => setSimulatedProfile(prev => ({ 
                        ...prev, 
                        totalCreditLimit: parseInt(e.target.value) || 0 
                      }))}
                      InputProps={{
                        startAdornment: '$',
                        inputProps: { min: 0, step: 1000 }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography gutterBottom>Total Balance</Typography>
                    <TextField
                      fullWidth
                      type="number"
                      value={simulatedProfile.totalBalance}
                      onChange={(e) => setSimulatedProfile(prev => ({ 
                        ...prev, 
                        totalBalance: parseInt(e.target.value) || 0 
                      }))}
                      InputProps={{
                        startAdornment: '$',
                        inputProps: { min: 0, max: simulatedProfile.totalCreditLimit }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography gutterBottom>Number of Cards</Typography>
                    <Slider
                      value={simulatedProfile.numberOfCards}
                      onChange={(e, v) => setSimulatedProfile(prev => ({ ...prev, numberOfCards: v }))}
                      min={1}
                      max={20}
                      step={1}
                      marks={[
                        { value: 1, label: '1' },
                        { value: 10, label: '10' },
                        { value: 20, label: '20' }
                      ]}
                      valueLabelDisplay="on"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography gutterBottom>Highest Card Utilization (%)</Typography>
                    <Slider
                      value={simulatedProfile.highestUtilization}
                      onChange={(e, v) => setSimulatedProfile(prev => ({ ...prev, highestUtilization: v }))}
                      min={0}
                      max={100}
                      marks={[
                        { value: 0, label: '0%' },
                        { value: 50, label: '50%' },
                        { value: 100, label: '100%' }
                      ]}
                      valueLabelDisplay="on"
                    />
                  </Grid>
                </Grid>
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>Best Practices:</strong> Keep overall utilization under 30%, individual cards under 30%, 
                    and have at least one card under 10% utilization.
                  </Typography>
                </Alert>
              </Box>
            )}

            {/* Credit Age Tab */}
            {activeTab === 2 && (
              <Box>
                <Typography variant="h6" gutterBottom>Credit Age Factors</Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography gutterBottom>Oldest Account (months)</Typography>
                    <Slider
                      value={simulatedProfile.oldestAccount}
                      onChange={(e, v) => setSimulatedProfile(prev => ({ ...prev, oldestAccount: v }))}
                      min={0}
                      max={360}
                      step={1}
                      marks={[
                        { value: 0, label: '0' },
                        { value: 120, label: '10y' },
                        { value: 240, label: '20y' },
                        { value: 360, label: '30y' }
                      ]}
                      valueLabelDisplay="on"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography gutterBottom>Average Account Age (months)</Typography>
                    <Slider
                      value={simulatedProfile.averageAccountAge}
                      onChange={(e, v) => setSimulatedProfile(prev => ({ ...prev, averageAccountAge: v }))}
                      min={0}
                      max={simulatedProfile.oldestAccount}
                      step={1}
                      marks={[
                        { value: 0, label: '0' },
                        { value: 60, label: '5y' },
                        { value: 120, label: '10y' }
                      ]}
                      valueLabelDisplay="on"
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Credit Mix Tab */}
            {activeTab === 3 && (
              <Box>
                <Typography variant="h6" gutterBottom>Credit Mix</Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Typography gutterBottom>Credit Cards</Typography>
                    <TextField
                      fullWidth
                      type="number"
                      value={simulatedProfile.creditCards}
                      onChange={(e) => setSimulatedProfile(prev => ({ 
                        ...prev, 
                        creditCards: parseInt(e.target.value) || 0 
                      }))}
                      InputProps={{ inputProps: { min: 0, max: 20 } }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography gutterBottom>Installment Loans</Typography>
                    <TextField
                      fullWidth
                      type="number"
                      value={simulatedProfile.installmentLoans}
                      onChange={(e) => setSimulatedProfile(prev => ({ 
                        ...prev, 
                        installmentLoans: parseInt(e.target.value) || 0 
                      }))}
                      InputProps={{ inputProps: { min: 0, max: 10 } }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography gutterBottom>Mortgages</Typography>
                    <TextField
                      fullWidth
                      type="number"
                      value={simulatedProfile.mortgages}
                      onChange={(e) => setSimulatedProfile(prev => ({ 
                        ...prev, 
                        mortgages: parseInt(e.target.value) || 0 
                      }))}
                      InputProps={{ inputProps: { min: 0, max: 5 } }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography gutterBottom>Auto Loans</Typography>
                    <TextField
                      fullWidth
                      type="number"
                      value={simulatedProfile.autoLoans}
                      onChange={(e) => setSimulatedProfile(prev => ({ 
                        ...prev, 
                        autoLoans: parseInt(e.target.value) || 0 
                      }))}
                      InputProps={{ inputProps: { min: 0, max: 5 } }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography gutterBottom>Student Loans</Typography>
                    <TextField
                      fullWidth
                      type="number"
                      value={simulatedProfile.studentLoans}
                      onChange={(e) => setSimulatedProfile(prev => ({ 
                        ...prev, 
                        studentLoans: parseInt(e.target.value) || 0 
                      }))}
                      InputProps={{ inputProps: { min: 0, max: 10 } }}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* New Credit Tab */}
            {activeTab === 4 && (
              <Box>
                <Typography variant="h6" gutterBottom>New Credit Activity</Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Typography gutterBottom>Hard Inquiries</Typography>
                    <Slider
                      value={simulatedProfile.hardInquiries}
                      onChange={(e, v) => setSimulatedProfile(prev => ({ ...prev, hardInquiries: v }))}
                      min={0}
                      max={20}
                      step={1}
                      marks
                      valueLabelDisplay="on"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography gutterBottom>New Accounts</Typography>
                    <Slider
                      value={simulatedProfile.newAccounts}
                      onChange={(e, v) => setSimulatedProfile(prev => ({ ...prev, newAccounts: v }))}
                      min={0}
                      max={10}
                      step={1}
                      marks
                      valueLabelDisplay="on"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography gutterBottom>Months Since Last Inquiry</Typography>
                    <Slider
                      value={simulatedProfile.monthsSinceLastInquiry}
                      onChange={(e, v) => setSimulatedProfile(prev => ({ ...prev, monthsSinceLastInquiry: v }))}
                      min={0}
                      max={24}
                      step={1}
                      marks={[
                        { value: 0, label: '0' },
                        { value: 12, label: '12' },
                        { value: 24, label: '24' }
                      ]}
                      valueLabelDisplay="on"
                    />
                  </Grid>
                </Grid>
              </Box>
            )}
          </Paper>

          {/* Charts */}
          <Paper sx={{ p: 2, mt: 3 }}>
            <Typography variant="h6" gutterBottom>Score Factor Analysis</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={factorComparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="factor" angle={-45} textAnchor="end" height={100} />
                <YAxis domain={[0, 100]} />
                <ChartTooltip />
                <Legend />
                <Bar dataKey="current" fill="#94A3B8" name="Current" />
                <Bar dataKey="simulated" fill="#3B82F6" name="Simulated" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>

          <Paper sx={{ p: 2, mt: 3 }}>
            <Typography variant="h6" gutterBottom>12-Month Score Projection</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={projectionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={['dataMin - 10', 'dataMax + 10']} />
                <ChartTooltip />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  dot={{ fill: '#10B981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Right Side Panel */}
        <Grid item xs={12} lg={4}>
          {/* Model Comparison */}
          {compareMode && (
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>All Models Comparison</Typography>
              <List>
                {Object.keys(SCORING_MODELS).map(modelName => {
                  const modelScore = calculateScore(simulatedProfile, modelName);
                  const color = getScoreColor(modelScore.score, modelName);
                  
                  return (
                    <ListItem key={modelName}>
                      <ListItemIcon>
                        {modelName.includes('Auto') && <Car size={20} />}
                        {modelName.includes('Mortgage') && <Home size={20} />}
                        {modelName.includes('FICO 8') && <CreditCard size={20} />}
                        {modelName.includes('Vantage') && <Target size={20} />}
                      </ListItemIcon>
                      <ListItemText 
                        primary={modelName}
                        secondary={getScoreCategory(modelScore.score, modelName)}
                      />
                      <Typography 
                        variant="h6" 
                        sx={{ color, fontWeight: 'bold' }}
                      >
                        {modelScore.score}
                      </Typography>
                    </ListItem>
                  );
                })}
              </List>
            </Paper>
          )}

          {/* Action Recommendations */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              <Zap style={{ marginRight: 8, verticalAlign: 'middle' }} />
              Quick Actions for Impact
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon><TrendingUp color="#10B981" /></ListItemIcon>
                <ListItemText 
                  primary="Pay down to 30% utilization"
                  secondary={`Could increase score by ~${Math.round((30 - simulatedScore.utilization) * 1.5)} points`}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><TrendingUp color="#10B981" /></ListItemIcon>
                <ListItemText 
                  primary="Pay down to 10% utilization"
                  secondary={`Could increase score by ~${Math.round((10 - simulatedScore.utilization) * 2)} points`}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><Calendar color="#3B82F6" /></ListItemIcon>
                <ListItemText 
                  primary="Keep accounts open"
                  secondary="Increases average account age over time"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><AlertCircle color="#F59E0B" /></ListItemIcon>
                <ListItemText 
                  primary="Avoid new inquiries"
                  secondary="Each inquiry can drop score 5-10 points"
                />
              </ListItem>
            </List>
          </Paper>

          {/* Saved Scenarios */}
          {scenarios.length > 0 && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                <History style={{ marginRight: 8, verticalAlign: 'middle' }} />
                Saved Scenarios
              </Typography>
              <List>
                {scenarios.map(scenario => (
                  <ListItem 
                    key={scenario.id}
                    button
                    onClick={() => loadScenario(scenario)}
                  >
                    <ListItemText 
                      primary={scenario.name}
                      secondary={`${scenario.model}: ${scenario.score} (${scenario.difference > 0 ? '+' : ''}${scenario.difference})`}
                    />
                    <IconButton 
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setScenarios(scenarios.filter(s => s.id !== scenario.id));
                      }}
                    >
                      <Minus size={16} />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}

          {/* Educational Tips */}
          <Paper sx={{ p: 2, mt: 3, bgcolor: 'info.light' }}>
            <Typography variant="h6" gutterBottom>
              <Info style={{ marginRight: 8, verticalAlign: 'middle' }} />
              Scoring Model Tips
            </Typography>
            <Accordion>
              <AccordionSummary expandIcon={<ChevronDown />}>
                <Typography>FICO 8 (Most Common)</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">
                  Used by 90% of lenders. Ignores paid collections, penalizes high balances more.
                </Typography>
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary expandIcon={<ChevronDown />}>
                <Typography>FICO Auto Score</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">
                  Range: 250-900. Weighs auto loan history more heavily. Used by auto lenders.
                </Typography>
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary expandIcon={<ChevronDown />}>
                <Typography>FICO Mortgage</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">
                  Used for home loans. More sensitive to recent activity and high balances.
                </Typography>
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary expandIcon={<ChevronDown />}>
                <Typography>VantageScore 4.0</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">
                  Uses trended data, machine learning. Less penalty for medical debt.
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CreditSimulator;