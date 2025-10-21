// src/pages/CreditAnalysisEngine.jsx
// AI-Powered Credit Analysis Engine - Revolutionary Credit Repair Intelligence
import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Paper, Typography, Button, Grid, Card, CardContent, TextField,
  Tabs, Tab, Alert, CircularProgress, LinearProgress, Chip, Avatar,
  List, ListItem, ListItemText, ListItemIcon, Divider, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, Stepper, Step,
  StepLabel, StepContent, Accordion, AccordionSummary, AccordionDetails,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Stack, Tooltip, Badge, Switch, FormControlLabel, Select, MenuItem,
  FormControl, InputLabel, Slider, Rating
} from '@mui/material';
import {
  Brain, TrendingUp, Target, AlertCircle, CheckCircle, XCircle,
  Star, Award, Zap, ArrowUp, ArrowDown, Clock, DollarSign,
  FileText, Shield, Activity, BarChart3, PieChart, Eye,
  Download, Upload, RefreshCw, Settings, Play, Pause, Info,
  ChevronDown, ChevronRight, Sparkles, Lightbulb, Flag,
  Calendar, User, CreditCard, Building2, Mail, Phone
} from 'lucide-react';
import { collection, addDoc, updateDoc, doc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import aiService from '@/services/aiService';

const CreditAnalysisEngine = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  
  // Analysis Data
  const [clientData, setClientData] = useState({
    name: '',
    currentScore: 0,
    goalScore: 0,
    timeframe: '6',
    email: '',
    phone: ''
  });

  const [creditReport, setCreditReport] = useState({
    bureaus: {
      equifax: { score: 0, items: [] },
      experian: { score: 0, items: [] },
      transunion: { score: 0, items: [] }
    },
    negativeItems: [],
    positiveItems: [],
    utilization: 0,
    ageOfCredit: 0,
    hardInquiries: 0,
    publicRecords: 0
  });

  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [actionPlan, setActionPlan] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [prioritizedDisputes, setPrioritizedDisputes] = useState([]);
  const [timeline, setTimeline] = useState([]);

  // File upload
  const fileInputRef = useRef(null);

  // aiService proxy (use aiService.complete or aiService.analyzeCreditReport)
  const openai = {
    chat: {
      completions: {
        create: async (opts) => {
          const res = await (aiService.analyzeCreditReport ? aiService.analyzeCreditReport(opts) : aiService.complete(opts));
          return { choices: [{ message: { content: res.response || res || '' } }], usage: res.usage || {} };
        }
      }
    }
  };

  // AI Analysis Engine
  const analyzeCredit = async () => {
    if (!clientData.name || !clientData.currentScore) {
      alert('Please enter client name and current score');
      return;
    }

    setAnalyzing(true);
    try {
      // Step 1: Analyze Credit Profile
      const profileAnalysis = await analyzeCreditProfile();
      
      // Step 2: Calculate Success Probabilities
      const successRates = await calculateDisputeSuccess();
      
      // Step 3: Generate Action Plan
      const plan = await generateActionPlan(profileAnalysis, successRates);
      
      // Step 4: Predict Score Improvement
      const scorePredictions = await predictScoreImprovement(profileAnalysis);
      
      // Step 5: Prioritize Disputes
      const prioritized = await prioritizeDisputes(successRates);
      
      // Step 6: Create Timeline
      const timelineData = await createTimeline(plan, scorePredictions);

      setAiAnalysis(profileAnalysis);
      setActionPlan(plan);
      setPredictions(scorePredictions);
      setPrioritizedDisputes(prioritized);
      setTimeline(timelineData);
      setAnalysisComplete(true);

      // Save to Firestore
      await saveAnalysis({
        clientData,
        creditReport,
        aiAnalysis: profileAnalysis,
        actionPlan: plan,
        predictions: scorePredictions,
        prioritizedDisputes: prioritized,
        timeline: timelineData,
        createdAt: Timestamp.now(),
        userId: currentUser.uid
      });

    } catch (error) {
      console.error('Analysis error:', error);
      alert('Error analyzing credit. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const analyzeCreditProfile = async () => {
    const prompt = `Analyze this credit profile and provide detailed insights:
    
Client: ${clientData.name}
Current Score: ${clientData.currentScore}
Goal Score: ${clientData.goalScore}
Timeframe: ${clientData.timeframe} months

Credit Report Summary:
- Negative Items: ${creditReport.negativeItems.length}
- Positive Items: ${creditReport.positiveItems.length}
- Utilization: ${creditReport.utilization}%
- Age of Credit: ${creditReport.ageOfCredit} years
- Hard Inquiries: ${creditReport.hardInquiries}
- Public Records: ${creditReport.publicRecords}

Provide analysis in JSON format:
{
  "overallHealth": "poor/fair/good/excellent",
  "healthScore": 0-100,
  "keyIssues": ["issue1", "issue2", ...],
  "strengths": ["strength1", "strength2", ...],
  "riskFactors": ["risk1", "risk2", ...],
  "opportunities": ["opp1", "opp2", ...],
  "estimatedImpact": {
    "removingNegatives": number,
    "improvingUtilization": number,
    "addingPositives": number,
    "agingAccounts": number
  },
  "complianceIssues": ["issue1", "issue2", ...],
  "recommendations": ["rec1", "rec2", ...]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{
        role: "system",
        content: "You are an expert credit analyst specializing in FICO scoring and credit repair strategies. Provide detailed, actionable analysis."
      }, {
        role: "user",
        content: prompt
      }],
      temperature: 0.3,
      max_tokens: 1500
    });

    return JSON.parse(response.choices[0].message.content);
  };

  const calculateDisputeSuccess = async () => {
    const items = creditReport.negativeItems.map((item, idx) => ({
      id: idx,
      type: item.type || 'unknown',
      age: item.age || 0,
      amount: item.amount || 0,
      status: item.status || 'unknown',
      bureau: item.bureau || 'unknown'
    }));

    const prompt = `Calculate dispute success probability for these credit items:

Items: ${JSON.stringify(items, null, 2)}

For each item, provide:
{
  "items": [
    {
      "id": number,
      "successProbability": 0-100,
      "estimatedTimeframe": "30-60 days",
      "difficulty": "easy/moderate/hard",
      "strategy": "verification/goodwill/factual/statute",
      "expectedScoreImpact": number,
      "reasoning": "explanation",
      "complianceRisk": "low/medium/high"
    }
  ],
  "overallSuccessRate": number,
  "totalPotentialImpact": number
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{
        role: "system",
        content: "You are a credit dispute expert with deep knowledge of FCRA, FDCPA, and dispute success factors."
      }, {
        role: "user",
        content: prompt
      }],
      temperature: 0.4,
      max_tokens: 2000
    });

    return JSON.parse(response.choices[0].message.content);
  };

  const generateActionPlan = async (analysis, successRates) => {
    const prompt = `Create a comprehensive action plan based on this analysis:

Profile Health: ${analysis.overallHealth}
Key Issues: ${analysis.keyIssues.join(', ')}
Success Rates: ${JSON.stringify(successRates, null, 2)}
Goal: Improve from ${clientData.currentScore} to ${clientData.goalScore} in ${clientData.timeframe} months

Generate a detailed action plan with:
{
  "phases": [
    {
      "phase": 1,
      "name": "Phase name",
      "duration": "weeks",
      "goals": ["goal1", "goal2"],
      "actions": [
        {
          "action": "description",
          "priority": "high/medium/low",
          "impact": number,
          "effort": "low/medium/high",
          "timeline": "timeframe",
          "steps": ["step1", "step2"]
        }
      ],
      "expectedScoreChange": number
    }
  ],
  "quickWins": ["win1", "win2"],
  "longTermStrategies": ["strategy1", "strategy2"],
  "avoidActions": ["avoid1", "avoid2"],
  "milestones": [
    {
      "week": number,
      "milestone": "description",
      "expectedScore": number
    }
  ]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{
        role: "system",
        content: "You are a strategic credit repair consultant creating actionable, compliant improvement plans."
      }, {
        role: "user",
        content: prompt
      }],
      temperature: 0.5,
      max_tokens: 2500
    });

    return JSON.parse(response.choices[0].message.content);
  };

  const predictScoreImprovement = async (analysis) => {
    const prompt = `Predict credit score improvement trajectory:

Current Score: ${clientData.currentScore}
Goal Score: ${clientData.goalScore}
Timeframe: ${clientData.timeframe} months
Profile Health: ${analysis.overallHealth}
Key Issues: ${analysis.keyIssues.length}

Generate predictions:
{
  "projections": [
    {
      "month": number,
      "projectedScore": number,
      "lowEstimate": number,
      "highEstimate": number,
      "confidence": 0-100,
      "assumptions": ["assumption1", "assumption2"]
    }
  ],
  "bestCaseScenario": number,
  "worstCaseScenario": number,
  "mostLikelyOutcome": number,
  "achievabilityScore": 0-100,
  "factorsAffectingSuccess": ["factor1", "factor2"],
  "riskFactors": ["risk1", "risk2"]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{
        role: "system",
        content: "You are a credit scoring expert with deep knowledge of FICO algorithms and score improvement patterns."
      }, {
        role: "user",
        content: prompt
      }],
      temperature: 0.4,
      max_tokens: 1500
    });

    return JSON.parse(response.choices[0].message.content);
  };

  const prioritizeDisputes = async (successRates) => {
    return successRates.items
      .sort((a, b) => {
        // Sort by: success probability * score impact
        const scoreA = a.successProbability * a.expectedScoreImpact;
        const scoreB = b.successProbability * b.expectedScoreImpact;
        return scoreB - scoreA;
      })
      .slice(0, 10); // Top 10
  };

  const createTimeline = async (plan, predictions) => {
    const events = [];
    
    plan.phases.forEach(phase => {
      phase.actions.forEach(action => {
        events.push({
          type: 'action',
          phase: phase.phase,
          title: action.action,
          priority: action.priority,
          timeline: action.timeline,
          impact: action.impact
        });
      });
    });

    plan.milestones.forEach(milestone => {
      events.push({
        type: 'milestone',
        week: milestone.week,
        title: milestone.milestone,
        expectedScore: milestone.expectedScore
      });
    });

    return events.sort((a, b) => {
      const weekA = a.week || 0;
      const weekB = b.week || 0;
      return weekA - weekB;
    });
  };

  const saveAnalysis = async (data) => {
    try {
      await addDoc(collection(db, 'creditAnalyses'), data);
    } catch (error) {
      console.error('Error saving analysis:', error);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // In production, parse PDF/XML credit reports
    alert('Credit report upload coming soon! For now, enter data manually.');
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              <Brain size={32} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              AI Credit Analysis Engine
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Revolutionary AI-powered credit analysis, dispute prediction, and action planning
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<Upload />}
              onClick={() => fileInputRef.current?.click()}
            >
              Import Report
            </Button>
            <Button
              variant="contained"
              startIcon={analyzing ? <CircularProgress size={20} /> : <Sparkles />}
              onClick={analyzeCredit}
              disabled={analyzing}
            >
              {analyzing ? 'Analyzing...' : 'Analyze with AI'}
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
          <Tab label="Client Info" icon={<User size={18} />} iconPosition="start" />
          <Tab label="Credit Report" icon={<FileText size={18} />} iconPosition="start" />
          <Tab label="AI Analysis" icon={<Brain size={18} />} iconPosition="start" disabled={!analysisComplete} />
          <Tab label="Action Plan" icon={<Target size={18} />} iconPosition="start" disabled={!analysisComplete} />
          <Tab label="Predictions" icon={<TrendingUp size={18} />} iconPosition="start" disabled={!analysisComplete} />
          <Tab label="Timeline" icon={<Calendar size={18} />} iconPosition="start" disabled={!analysisComplete} />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Client Information</Typography>
              <Stack spacing={2}>
                <TextField
                  label="Client Name"
                  value={clientData.name}
                  onChange={(e) => setClientData({ ...clientData, name: e.target.value })}
                  fullWidth
                />
                <TextField
                  label="Email"
                  type="email"
                  value={clientData.email}
                  onChange={(e) => setClientData({ ...clientData, email: e.target.value })}
                  fullWidth
                />
                <TextField
                  label="Phone"
                  value={clientData.phone}
                  onChange={(e) => setClientData({ ...clientData, phone: e.target.value })}
                  fullWidth
                />
                <TextField
                  label="Current Credit Score"
                  type="number"
                  value={clientData.currentScore}
                  onChange={(e) => setClientData({ ...clientData, currentScore: parseInt(e.target.value) })}
                  fullWidth
                  InputProps={{ inputProps: { min: 300, max: 850 } }}
                />
                <TextField
                  label="Goal Credit Score"
                  type="number"
                  value={clientData.goalScore}
                  onChange={(e) => setClientData({ ...clientData, goalScore: parseInt(e.target.value) })}
                  fullWidth
                  InputProps={{ inputProps: { min: 300, max: 850 } }}
                />
                <FormControl fullWidth>
                  <InputLabel>Timeframe (Months)</InputLabel>
                  <Select
                    value={clientData.timeframe}
                    onChange={(e) => setClientData({ ...clientData, timeframe: e.target.value })}
                    label="Timeframe (Months)"
                  >
                    <MenuItem value="3">3 Months</MenuItem>
                    <MenuItem value="6">6 Months</MenuItem>
                    <MenuItem value="12">12 Months</MenuItem>
                    <MenuItem value="24">24 Months</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Quick Stats</Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Points to Improve</Typography>
                  <Typography variant="h4" color="primary">
                    {clientData.goalScore - clientData.currentScore}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Timeframe</Typography>
                  <Typography variant="h4">
                    {clientData.timeframe} months
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Monthly Improvement Needed</Typography>
                  <Typography variant="h4" color="success.main">
                    {Math.ceil((clientData.goalScore - clientData.currentScore) / parseInt(clientData.timeframe))} pts/month
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Credit Report Summary</Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Upload a credit report or enter data manually
              </Alert>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Credit Utilization %"
                    type="number"
                    value={creditReport.utilization}
                    onChange={(e) => setCreditReport({ ...creditReport, utilization: parseInt(e.target.value) })}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Age of Credit (Years)"
                    type="number"
                    value={creditReport.ageOfCredit}
                    onChange={(e) => setCreditReport({ ...creditReport, ageOfCredit: parseInt(e.target.value) })}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Hard Inquiries"
                    type="number"
                    value={creditReport.hardInquiries}
                    onChange={(e) => setCreditReport({ ...creditReport, hardInquiries: parseInt(e.target.value) })}
                    fullWidth
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      )}

      {activeTab === 2 && aiAnalysis && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56 }}>
                    <Shield size={32} />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Overall Health</Typography>
                    <Typography variant="h5" sx={{ textTransform: 'capitalize' }}>
                      {aiAnalysis.overallHealth}
                    </Typography>
                    <Typography variant="caption" color="primary">
                      Score: {aiAnalysis.healthScore}/100
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Key Issues</Typography>
              <Stack spacing={1}>
                {aiAnalysis.keyIssues.map((issue, idx) => (
                  <Chip
                    key={idx}
                    label={issue}
                    icon={<AlertCircle size={16} />}
                    color="error"
                    variant="outlined"
                  />
                ))}
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>AI Recommendations</Typography>
              <List>
                {aiAnalysis.recommendations.map((rec, idx) => (
                  <ListItem key={idx}>
                    <ListItemIcon>
                      <Lightbulb color="#F59E0B" />
                    </ListItemIcon>
                    <ListItemText primary={rec} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      )}

      {activeTab === 3 && actionPlan && (
        <Grid container spacing={3}>
          {actionPlan.phases.map((phase, idx) => (
            <Grid item xs={12} key={idx}>
              <Accordion defaultExpanded={idx === 0}>
                <AccordionSummary expandIcon={<ChevronDown />}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: 'primary.main' }}>{phase.phase}</Avatar>
                    <Box>
                      <Typography variant="h6">{phase.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Duration: {phase.duration} | Expected Impact: +{phase.expectedScoreChange} points
                      </Typography>
                    </Box>
                  </Stack>
                </AccordionSummary>
                <AccordionDetails>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Action</TableCell>
                          <TableCell>Priority</TableCell>
                          <TableCell>Impact</TableCell>
                          <TableCell>Timeline</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {phase.actions.map((action, actionIdx) => (
                          <TableRow key={actionIdx}>
                            <TableCell>{action.action}</TableCell>
                            <TableCell>
                              <Chip
                                label={action.priority}
                                size="small"
                                color={
                                  action.priority === 'high' ? 'error' :
                                  action.priority === 'medium' ? 'warning' : 'default'
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="success.main">
                                +{action.impact} points
                              </Typography>
                            </TableCell>
                            <TableCell>{action.timeline}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            </Grid>
          ))}
        </Grid>
      )}

      {activeTab === 4 && predictions && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Score Improvement Projections</Typography>
              <Box sx={{ mb: 3 }}>
                {predictions.projections.map((proj, idx) => (
                  <Box key={idx} sx={{ mb: 2 }}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                      <Typography variant="body2">Month {proj.month}</Typography>
                      <Typography variant="h6" color="primary">{proj.projectedScore}</Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={(proj.projectedScore / 850) * 100}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      Range: {proj.lowEstimate} - {proj.highEstimate} | Confidence: {proj.confidence}%
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Best Case</Typography>
                <Typography variant="h3" color="success.main">
                  {predictions.bestCaseScenario}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Most Likely</Typography>
                <Typography variant="h3" color="primary">
                  {predictions.mostLikelyOutcome}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Worst Case</Typography>
                <Typography variant="h3" color="warning.main">
                  {predictions.worstCaseScenario}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 5 && timeline.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Implementation Timeline</Typography>
          <Stepper orientation="vertical">
            {timeline.map((event, idx) => (
              <Step key={idx} active>
                <StepLabel>
                  <Stack direction="row" spacing={2} alignItems="center">
                    {event.type === 'milestone' ? <Flag size={18} /> : <Zap size={18} />}
                    <Typography>{event.title}</Typography>
                    {event.priority && (
                      <Chip label={event.priority} size="small" />
                    )}
                  </Stack>
                </StepLabel>
                <StepContent>
                  {event.expectedScore && (
                    <Typography variant="body2" color="text.secondary">
                      Expected Score: {event.expectedScore}
                    </Typography>
                  )}
                  {event.impact && (
                    <Typography variant="body2" color="success.main">
                      Impact: +{event.impact} points
                    </Typography>
                  )}
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </Paper>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        hidden
        accept=".pdf,.xml"
        onChange={handleFileUpload}
      />
    </Box>
  );
};

export default CreditAnalysisEngine;