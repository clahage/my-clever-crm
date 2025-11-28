/**
 * Testing Assistant Component
 *
 * Interactive testing guide that helps users test the complete CRM system
 * Features:
 * - Step-by-step test scenarios
 * - Progress tracking
 * - Issue reporting
 * - Real-time guidance
 * - Memory persistence
 * - Troubleshooting help
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Drawer,
  Typography,
  Button,
  IconButton,
  LinearProgress,
  Chip,
  Card,
  CardContent,
  CardActions,
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Checkbox,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  AlertTitle,
  Divider,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Badge,
  Fab,
  Tooltip,
  Menu,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stack,
  Paper,
  Grid
} from '@mui/material';
import {
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  BugReport as BugIcon,
  Help as HelpIcon,
  Info as InfoIcon,
  Science as ScienceIcon,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  RadioButtonChecked as RadioButtonCheckedIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';

import { masterTestingChecklist, troubleshootingGuide } from '../../data/testingChecklists';
import {
  initializeTestSession,
  loadTestSession,
  getCurrentTestSession,
  updateTestSession,
  saveTestResult,
  validateTestResult,
  reportIssue,
  generateTestReport,
  downloadTestReport,
  formatTestingMemory,
  saveTestingMemory,
  calculateProgress,
  getTestStatistics,
  formatDuration,
  pauseTestSession,
  resumeTestSession,
  completeTestSession
} from '../../utils/testingHelpers';

const TestingAssistant = ({ open, onClose, currentUser }) => {
  // State management
  const [session, setSession] = useState(null);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [currentScenario, setCurrentScenario] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [testResults, setTestResults] = useState([]);
  const [issues, setIssues] = useState([]);
  const [expandedScenario, setExpandedScenario] = useState(null);
  const [showIssueDialog, setShowIssueDialog] = useState(false);
  const [showTroubleshootingDialog, setShowTroubleshootingDialog] = useState(false);
  const [selectedTroubleshooting, setSelectedTroubleshooting] = useState(null);
  const [actualResult, setActualResult] = useState('');
  const [notes, setNotes] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);

  // Load or initialize session on mount
  useEffect(() => {
    const initSession = async () => {
      const existing = await getCurrentTestSession();
      if (existing) {
        setSession(existing);
        loadSessionData(existing.sessionId);
      }
    };
    initSession();
  }, []);

  // Auto-save session periodically
  useEffect(() => {
    if (!session) return;

    const interval = setInterval(async () => {
      await saveSessionState();
    }, 30000); // Save every 30 seconds

    return () => clearInterval(interval);
  }, [session, testResults, issues]);

  // Load session data
  const loadSessionData = async (sessionId) => {
    try {
      // Load results from localStorage cache
      const cachedResults = JSON.parse(
        localStorage.getItem(`testResults_${sessionId}`) || '[]'
      );
      setTestResults(cachedResults);

      // Load issues from localStorage cache
      const cachedIssues = JSON.parse(
        localStorage.getItem(`testIssues_${sessionId}`) || '[]'
      );
      setIssues(cachedIssues);
    } catch (error) {
      console.error('Failed to load session data:', error);
    }
  };

  // Save current session state
  const saveSessionState = async () => {
    if (!session) return;

    try {
      const updates = {
        currentScenario: currentScenario
          ? {
              id: currentScenario.id,
              name: currentScenario.name,
              category: currentCategory?.name,
              currentStep,
              totalSteps: currentScenario.steps.length,
              status: 'in-progress'
            }
          : null,
        completedScenarios: testResults.filter(r => r.scenarioCompleted).length,
        passedTests: testResults.filter(r => r.status === 'passed').length,
        failedTests: testResults.filter(r => r.status === 'failed').length,
        warningTests: testResults.filter(r => r.status === 'warning').length
      };

      await updateTestSession(session.sessionId, updates);

      // Save memory for Claude
      await saveTestingMemory(session, testResults, issues);
    } catch (error) {
      console.error('Failed to save session state:', error);
    }
  };

  // Start new test session
  const handleStartNewSession = async () => {
    try {
      const newSession = await initializeTestSession(
        currentUser?.displayName || 'Tester',
        masterTestingChecklist.categories.map(c => c.id)
      );

      setSession(newSession);
      setTestResults([]);
      setIssues([]);
      setCurrentCategory(null);
      setCurrentScenario(null);
      setCurrentStep(0);
    } catch (error) {
      console.error('Failed to start new session:', error);
      alert('Failed to start new test session. Please try again.');
    }
  };

  // Select category
  const handleSelectCategory = (category) => {
    setCurrentCategory(category);
    setCurrentScenario(null);
    setCurrentStep(0);
  };

  // Select scenario
  const handleSelectScenario = (scenario) => {
    setCurrentScenario(scenario);
    setCurrentStep(0);
    setExpandedScenario(scenario.id);
    saveSessionState();
  };

  // Complete current step
  const handleCompleteStep = async (status) => {
    if (!currentScenario || !session) return;

    const step = currentScenario.steps[currentStep];

    // Validate result if expected result exists
    let validation = null;
    if (step.expectedResult && actualResult) {
      validation = validateTestResult(actualResult, step.expectedResult);
    }

    // Save test result
    const result = {
      sessionId: session.sessionId,
      scenarioId: currentScenario.id,
      stepId: step.id,
      stepDescription: step.description,
      status: validation?.status || status,
      expectedResult: step.expectedResult,
      actualResult,
      notes,
      timestamp: new Date().toISOString(),
      scenarioCompleted: currentStep === currentScenario.steps.length - 1
    };

    try {
      await saveTestResult(session.sessionId, result);
      setTestResults(prev => [...prev, result]);

      // Clear input fields
      setActualResult('');
      setNotes('');

      // Move to next step or complete scenario
      if (currentStep < currentScenario.steps.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        // Scenario completed
        alert(`✅ Scenario "${currentScenario.name}" completed!`);
        setCurrentScenario(null);
        setCurrentStep(0);
      }

      await saveSessionState();
    } catch (error) {
      console.error('Failed to save test result:', error);
      alert('Failed to save test result. Please try again.');
    }
  };

  // Report issue
  const handleReportIssue = async (issueData) => {
    if (!session) return;

    try {
      const issue = {
        ...issueData,
        scenarioId: currentScenario?.id,
        stepId: currentScenario?.steps[currentStep]?.id,
        category: currentCategory?.name,
        timestamp: new Date().toISOString()
      };

      await reportIssue(session.sessionId, issue);
      setIssues(prev => [...prev, issue]);
      setShowIssueDialog(false);

      alert('✅ Issue reported successfully!');
      await saveSessionState();
    } catch (error) {
      console.error('Failed to report issue:', error);
      alert('Failed to report issue. Please try again.');
    }
  };

  // Generate and download report
  const handleGenerateReport = async () => {
    if (!session) return;

    try {
      const report = await generateTestReport(session.sessionId);
      downloadTestReport(report, 'json');
      alert('✅ Test report downloaded!');
    } catch (error) {
      console.error('Failed to generate report:', error);
      alert('Failed to generate report. Please try again.');
    }
  };

  // Pause session
  const handlePauseSession = async () => {
    if (!session) return;
    await pauseTestSession(session.sessionId);
    await saveSessionState();
    alert('⏸️  Test session paused. You can resume anytime.');
  };

  // Resume session
  const handleResumeSession = async () => {
    if (!session) return;
    await resumeTestSession(session.sessionId);
    alert('▶️  Test session resumed!');
  };

  // Complete session
  const handleCompleteSession = async () => {
    if (!session) return;

    const confirm = window.confirm(
      'Are you sure you want to complete this test session? This will generate a final report.'
    );

    if (confirm) {
      await completeTestSession(session.sessionId);
      await handleGenerateReport();
      alert('✅ Test session completed! Report downloaded.');
      setSession(null);
    }
  };

  // Open troubleshooting
  const handleOpenTroubleshooting = (issue) => {
    const troubleshooting = troubleshootingGuide.find(
      t => t.category === currentCategory?.name
    );
    setSelectedTroubleshooting(troubleshooting);
    setShowTroubleshootingDialog(true);
  };

  // Calculate progress
  const progress = session ? calculateProgress(session) : 0;
  const stats = getTestStatistics(testResults);

  // Render category list
  const renderCategoryList = () => (
    <List>
      {masterTestingChecklist.categories.map((category) => (
        <ListItemButton
          key={category.id}
          selected={currentCategory?.id === category.id}
          onClick={() => handleSelectCategory(category)}
        >
          <ListItemText
            primary={category.name}
            secondary={`${category.scenarios.length} scenarios`}
          />
        </ListItemButton>
      ))}
    </List>
  );

  // Render scenario list
  const renderScenarioList = () => {
    if (!currentCategory) return null;

    return (
      <List>
        {currentCategory.scenarios.map((scenario) => {
          const scenarioResults = testResults.filter(
            r => r.scenarioId === scenario.id
          );
          const completed = scenarioResults.some(r => r.scenarioCompleted);
          const passed = scenarioResults.every(r => r.status === 'passed');

          return (
            <Card key={scenario.id} sx={{ mb: 2 }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1}>
                  {completed && (
                    <CheckCircleIcon
                      color={passed ? 'success' : 'warning'}
                      fontSize="small"
                    />
                  )}
                  <Typography variant="subtitle1">
                    {scenario.name}
                  </Typography>
                  <Chip
                    label={scenario.priority}
                    size="small"
                    color={
                      scenario.priority === 'critical'
                        ? 'error'
                        : scenario.priority === 'high'
                        ? 'warning'
                        : 'default'
                    }
                  />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {scenario.description}
                </Typography>
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  ⏱️  {scenario.estimatedTime} • {scenario.steps.length} steps
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  onClick={() => handleSelectScenario(scenario)}
                  disabled={completed && passed}
                >
                  {completed ? (passed ? 'Completed' : 'Retry') : 'Start Test'}
                </Button>
              </CardActions>
            </Card>
          );
        })}
      </List>
    );
  };

  // Render current test steps
  const renderCurrentTest = () => {
    if (!currentScenario) {
      return (
        <Box p={3} textAlign="center">
          <ScienceIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Test Selected
          </Typography>
          <Typography color="text.secondary">
            Select a test scenario from the list to begin testing
          </Typography>
        </Box>
      );
    }

    const step = currentScenario.steps[currentStep];

    return (
      <Box>
        {/* Scenario header */}
        <Paper sx={{ p: 2, mb: 2, bgcolor: 'primary.main', color: 'white' }}>
          <Typography variant="h6">{currentScenario.name}</Typography>
          <Typography variant="caption">
            Step {currentStep + 1} of {currentScenario.steps.length}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={(currentStep / currentScenario.steps.length) * 100}
            sx={{ mt: 1, bgcolor: 'primary.light', '& .MuiLinearProgress-bar': { bgcolor: 'white' } }}
          />
        </Paper>

        {/* Current step */}
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Step {step.id}: {step.description}
            </Typography>

            {step.expectedResult && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <AlertTitle>Expected Result</AlertTitle>
                {step.expectedResult}
              </Alert>
            )}

            {step.troubleshooting && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                <AlertTitle>Troubleshooting Tips</AlertTitle>
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {step.troubleshooting.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </Alert>
            )}

            {/* Test data if provided */}
            {step.testData && (
              <Alert severity="success" sx={{ mb: 2 }}>
                <AlertTitle>Test Data</AlertTitle>
                <pre style={{ margin: 0, fontSize: '0.85rem' }}>
                  {JSON.stringify(step.testData, null, 2)}
                </pre>
              </Alert>
            )}

            {/* Field checks if provided */}
            {step.fieldChecks && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <AlertTitle>Verify These Fields</AlertTitle>
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {step.fieldChecks.map((check, idx) => (
                    <li key={idx}><code>{check}</code></li>
                  ))}
                </ul>
              </Alert>
            )}

            {/* Actual result input */}
            <TextField
              label="Actual Result (What did you observe?)"
              multiline
              rows={3}
              fullWidth
              value={actualResult}
              onChange={(e) => setActualResult(e.target.value)}
              sx={{ mb: 2 }}
              placeholder="Describe what actually happened when you performed this step..."
            />

            {/* Notes input */}
            <TextField
              label="Notes (Optional)"
              multiline
              rows={2}
              fullWidth
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes or observations..."
            />
          </CardContent>

          <CardActions>
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircleIcon />}
              onClick={() => handleCompleteStep('passed')}
              disabled={!actualResult}
            >
              ✅ Pass
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<CancelIcon />}
              onClick={() => handleCompleteStep('failed')}
            >
              ❌ Fail
            </Button>
            <Button
              variant="contained"
              color="warning"
              startIcon={<WarningIcon />}
              onClick={() => handleCompleteStep('warning')}
            >
              ⚠️  Warning
            </Button>
            <Button
              startIcon={<BugIcon />}
              onClick={() => setShowIssueDialog(true)}
            >
              Report Issue
            </Button>
            <Button
              startIcon={<HelpIcon />}
              onClick={() => handleOpenTroubleshooting()}
            >
              Help
            </Button>
          </CardActions>
        </Card>

        {/* All steps overview */}
        <Stepper activeStep={currentStep} orientation="vertical">
          {currentScenario.steps.map((s, idx) => {
            const stepResult = testResults.find(
              r => r.scenarioId === currentScenario.id && r.stepId === s.id
            );

            return (
              <Step key={s.id} completed={!!stepResult}>
                <StepLabel
                  error={stepResult?.status === 'failed'}
                  StepIconComponent={() => {
                    if (stepResult?.status === 'passed')
                      return <CheckCircleIcon color="success" />;
                    if (stepResult?.status === 'failed')
                      return <CancelIcon color="error" />;
                    if (stepResult?.status === 'warning')
                      return <WarningIcon color="warning" />;
                    return <RadioButtonUncheckedIcon />;
                  }}
                >
                  Step {s.id}: {s.description}
                </StepLabel>
                <StepContent>
                  <Typography variant="caption" color="text.secondary">
                    {s.expectedResult}
                  </Typography>
                </StepContent>
              </Step>
            );
          })}
        </Stepper>
      </Box>
    );
  };

  // Issue report dialog
  const renderIssueDialog = () => (
    <Dialog open={showIssueDialog} onClose={() => setShowIssueDialog(false)} maxWidth="sm" fullWidth>
      <DialogTitle>🐛 Report Issue</DialogTitle>
      <DialogContent>
        <IssueReportForm onSubmit={handleReportIssue} onCancel={() => setShowIssueDialog(false)} />
      </DialogContent>
    </Dialog>
  );

  // Troubleshooting dialog
  const renderTroubleshootingDialog = () => (
    <Dialog
      open={showTroubleshootingDialog}
      onClose={() => setShowTroubleshootingDialog(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>🔧 Troubleshooting Guide</DialogTitle>
      <DialogContent>
        {selectedTroubleshooting ? (
          <TroubleshootingGuide troubleshooting={selectedTroubleshooting} />
        ) : (
          <Typography>Select an issue to see troubleshooting steps.</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowTroubleshootingDialog(false)}>Close</Button>
      </DialogActions>
    </Dialog>
  );

  // Main render
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 600, md: 700 } }
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box
          sx={{
            p: 2,
            bgcolor: 'primary.main',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <ScienceIcon />
            <Typography variant="h6">Testing Assistant</Typography>
          </Box>
          <IconButton color="inherit" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Progress bar */}
        {session && (
          <Box sx={{ p: 2, bgcolor: 'background.default' }}>
            <Typography variant="subtitle2" gutterBottom>
              Session Progress: {progress}%
            </Typography>
            <LinearProgress variant="determinate" value={progress} sx={{ mb: 1 }} />
            <Box display="flex" gap={2}>
              <Chip
                icon={<CheckCircleIcon />}
                label={`${stats.passed} Passed`}
                color="success"
                size="small"
              />
              <Chip
                icon={<CancelIcon />}
                label={`${stats.failed} Failed`}
                color="error"
                size="small"
              />
              <Chip
                icon={<WarningIcon />}
                label={`${stats.warnings} Warnings`}
                color="warning"
                size="small"
              />
            </Box>
          </Box>
        )}

        {/* Main content */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          {!session ? (
            // No session - show start screen
            <Box textAlign="center" py={4}>
              <ScienceIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Welcome to Testing Assistant
              </Typography>
              <Typography color="text.secondary" paragraph>
                Your comprehensive guide to testing every aspect of SpeedyCRM
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<PlayIcon />}
                onClick={handleStartNewSession}
              >
                Start New Test Session
              </Button>
            </Box>
          ) : (
            // Active session
            <Grid container spacing={2}>
              {/* Left sidebar - categories and scenarios */}
              <Grid item xs={12} md={5}>
                <Typography variant="subtitle2" gutterBottom>
                  Test Categories
                </Typography>
                {renderCategoryList()}

                {currentCategory && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" gutterBottom>
                      {currentCategory.name} Scenarios
                    </Typography>
                    {renderScenarioList()}
                  </>
                )}
              </Grid>

              {/* Right content - current test */}
              <Grid item xs={12} md={7}>
                {renderCurrentTest()}
              </Grid>
            </Grid>
          )}
        </Box>

        {/* Footer actions */}
        {session && (
          <Box
            sx={{
              p: 2,
              bgcolor: 'background.default',
              borderTop: 1,
              borderColor: 'divider',
              display: 'flex',
              gap: 1,
              flexWrap: 'wrap'
            }}
          >
            <Button
              startIcon={session.status === 'paused' ? <PlayIcon /> : <PauseIcon />}
              onClick={session.status === 'paused' ? handleResumeSession : handlePauseSession}
              size="small"
            >
              {session.status === 'paused' ? 'Resume' : 'Pause'}
            </Button>
            <Button
              startIcon={<StopIcon />}
              onClick={handleCompleteSession}
              size="small"
              color="error"
            >
              Complete
            </Button>
            <Button startIcon={<DownloadIcon />} onClick={handleGenerateReport} size="small">
              Export Report
            </Button>
            <Badge badgeContent={issues.length} color="error">
              <Button
                startIcon={<BugIcon />}
                onClick={() => setShowIssueDialog(true)}
                size="small"
              >
                Issues
              </Button>
            </Badge>
          </Box>
        )}
      </Box>

      {/* Dialogs */}
      {renderIssueDialog()}
      {renderTroubleshootingDialog()}
    </Drawer>
  );
};

// Issue Report Form Component
const IssueReportForm = ({ onSubmit, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('medium');

  const handleSubmit = () => {
    if (!title || !description) {
      alert('Please fill in all required fields');
      return;
    }

    onSubmit({
      title,
      description,
      severity
    });

    // Reset form
    setTitle('');
    setDescription('');
    setSeverity('medium');
  };

  return (
    <Box sx={{ pt: 2 }}>
      <TextField
        label="Issue Title *"
        fullWidth
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        sx={{ mb: 2 }}
        placeholder="Brief description of the issue"
      />

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Severity *</InputLabel>
        <Select value={severity} onChange={(e) => setSeverity(e.target.value)} label="Severity *">
          <MenuItem value="info">ℹ️  Info</MenuItem>
          <MenuItem value="warning">⚠️  Warning</MenuItem>
          <MenuItem value="error">❌ Error</MenuItem>
          <MenuItem value="critical">🚨 Critical</MenuItem>
        </Select>
      </FormControl>

      <TextField
        label="Description *"
        fullWidth
        multiline
        rows={4}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        sx={{ mb: 2 }}
        placeholder="Detailed description of the issue, steps to reproduce, expected vs actual behavior..."
      />

      <Box display="flex" gap={1} justifyContent="flex-end">
        <Button onClick={onCancel}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Report Issue
        </Button>
      </Box>
    </Box>
  );
};

// Troubleshooting Guide Component
const TroubleshootingGuide = ({ troubleshooting }) => {
  return (
    <Box sx={{ pt: 2 }}>
      <Alert severity="warning" sx={{ mb: 2 }}>
        <AlertTitle>{troubleshooting.issue}</AlertTitle>
        Severity: {troubleshooting.severity}
      </Alert>

      <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
        Possible Causes:
      </Typography>
      <List dense>
        {troubleshooting.possibleCauses.map((cause, idx) => (
          <ListItem key={idx}>
            <ListItemIcon>
              <InfoIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={cause} />
          </ListItem>
        ))}
      </List>

      <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
        Diagnostic Steps:
      </Typography>
      <List dense>
        {troubleshooting.diagnosticSteps.map((step, idx) => (
          <ListItem key={idx}>
            <ListItemIcon>
              <Typography variant="body2" color="primary">
                {idx + 1}.
              </Typography>
            </ListItemIcon>
            <ListItemText primary={step} />
          </ListItem>
        ))}
      </List>

      <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
        Solutions:
      </Typography>
      <List dense>
        {troubleshooting.solutions.map((solution, idx) => (
          <ListItem key={idx}>
            <ListItemIcon>
              <CheckCircleIcon fontSize="small" color="success" />
            </ListItemIcon>
            <ListItemText primary={solution} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default TestingAssistant;
