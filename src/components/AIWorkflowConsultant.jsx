// ============================================================================
// AI WORKFLOW CONSULTANT - Interactive AI Assistant
// ============================================================================
// Path: /src/components/AIWorkflowConsultant.jsx
//
// This component provides real-time AI guidance during workflow testing.
// It analyzes workflows step-by-step, suggests improvements, detects issues,
// and helps Christopher build better workflows through interactive feedback.
//
// KEY FEATURES:
// - Real-time step analysis and feedback
// - Issue detection (missing steps, compliance violations, inefficiencies)
// - Improvement suggestions with one-click apply
// - Missing feature detection
// - Running notes and documentation
// - AI reasoning display
// - Conversion probability predictions
// - Context-aware recommendations
//
// INTEGRATES WITH:
// - WorkflowTestingSimulator (parent component)
// - workflowEngine.js (execution data)
// - OpenAI API (GPT-4 for analysis)
//
// Last updated: December 2024
// Owner: Christopher - Speedy Credit Repair
// ============================================================================

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Chip,
  Divider,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  CircularProgress,
  LinearProgress,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Lightbulb,
  Warning,
  CheckCircle,
  Error as ErrorIcon,
  Info,
  TrendingUp,
  Psychology,
  AutoFixHigh,
  Visibility,
  ExpandMore,
  ExpandLess,
  ContentCopy,
  Download,
  Minimize,
  Close,
  ChatBubble,
  Analytics,
  BugReport
} from '@mui/icons-material';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../lib/firebase.js';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * AIWorkflowConsultant Component
 *
 * Provides real-time AI guidance during workflow testing
 *
 * @param {Object} props
 * @param {Object} props.execution - Current workflow execution state
 * @param {Object} props.workflow - Workflow configuration
 * @param {Object} props.contact - Test contact data
 * @param {number} props.currentStep - Current step index
 * @param {Function} props.onApplySuggestion - Callback when suggestion applied
 * @param {Function} props.onAddStep - Callback to add new step
 * @param {Function} props.onEditStep - Callback to edit step
 * @param {boolean} props.minimized - Minimized state
 * @param {Function} props.onToggleMinimize - Toggle minimize callback
 */
export default function AIWorkflowConsultant({
  execution,
  workflow,
  contact,
  currentStep,
  onApplySuggestion,
  onAddStep,
  onEditStep,
  minimized = false,
  onToggleMinimize
}) {
  // =========================================================================
  // STATE
  // =========================================================================

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState([]);
  const [expandedSections, setExpandedSections] = useState({
    current: true,
    issues: true,
    suggestions: true,
    missing: false,
    notes: false
  });

  const notesEndRef = useRef(null);

  // =========================================================================
  // EFFECTS
  // =========================================================================

  /**
   * Analyze current step when it changes
   */
  useEffect(() => {
    if (currentStep !== null && workflow && contact) {
      analyzeCurrentStep();
    }
  }, [currentStep, workflow, contact]);

  /**
   * Auto-scroll notes to bottom
   */
  useEffect(() => {
    if (notesEndRef.current) {
      notesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [notes]);

  // =========================================================================
  // AI ANALYSIS
  // =========================================================================

  /**
   * Analyze current workflow step with AI
   */
  const analyzeCurrentStep = async () => {
    setLoading(true);

    try {
      console.log('[AIConsultant] Analyzing step:', currentStep);

      // Call HTTP Cloud Function for AI analysis
      const response = await fetch('https://us-central1-my-clever-crm.cloudfunctions.net/aiAnalyzeWorkflowStep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflowId: workflow.id,
          stepIndex: currentStep,
          contactData: contact,
          executionData: execution,
          previousSteps: workflow.steps.slice(0, currentStep),
          currentStepConfig: workflow.steps[currentStep]
        })
      });
      const result = await response.json();
      const analysisData = result.analysis;

      setAnalysis(analysisData);

      // Add to notes
      addNote({
        type: 'analysis',
        step: currentStep,
        stepName: workflow.steps[currentStep].name,
        timestamp: new Date(),
        content: `AI analyzed step ${currentStep + 1}: ${workflow.steps[currentStep].name}`,
        data: analysisData
      });

      console.log('[AIConsultant] Analysis complete:', analysisData);

    } catch (error) {
      console.error('[AIConsultant] Analysis failed:', error);

      setAnalysis({
        workingWell: [],
        issues: [{
          severity: 'error',
          title: 'Analysis Failed',
          description: error.message,
          fix: null
        }],
        suggestions: [],
        missingFeatures: []
      });

    } finally {
      setLoading(false);
    }
  };

  /**
   * Add note to running log
   */
  const addNote = (note) => {
    setNotes(prev => [...prev, { id: Date.now(), ...note }]);
  };

  // =========================================================================
  // HANDLERS
  // =========================================================================

  /**
   * Toggle section expansion
   */
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  /**
   * Apply a suggested fix
   */
  const handleApplySuggestion = async (suggestion) => {
    console.log('[AIConsultant] Applying suggestion:', suggestion);

    addNote({
      type: 'action',
      timestamp: new Date(),
      content: `Applied suggestion: ${suggestion.title}`,
      data: suggestion
    });

    if (onApplySuggestion) {
      await onApplySuggestion(suggestion);
    }
  };

  /**
   * Export notes as text file
   */
  const exportNotes = () => {
    const notesText = notes.map(note => {
      const timestamp = new Date(note.timestamp).toLocaleTimeString();
      return `[${timestamp}] ${note.content}`;
    }).join('\n');

    const blob = new Blob([notesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workflow-test-notes-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /**
   * Clear all notes
   */
  const clearNotes = () => {
    if (confirm('Clear all notes? This cannot be undone.')) {
      setNotes([]);
    }
  };

  // =========================================================================
  // RENDER: MINIMIZED STATE
  // =========================================================================

  if (minimized) {
    return (
      <Paper
        elevation={3}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          p: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          bgcolor: 'primary.main',
          color: 'white',
          cursor: 'pointer',
          zIndex: 1000
        }}
        onClick={onToggleMinimize}
      >
        <Badge
          badgeContent={analysis?.issues?.length || 0}
          color="error"
        >
          <Psychology />
        </Badge>
        <Typography variant="body2">
          AI Consultant
        </Typography>
      </Paper>
    );
  }

  // =========================================================================
  // RENDER: FULL STATE
  // =========================================================================

  const step = workflow?.steps[currentStep];

  return (
    <Paper
      elevation={3}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        bgcolor: 'background.paper'
      }}
    >
      {/* HEADER */}
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Psychology />
          <Typography variant="h6">
            AI Workflow Consultant
          </Typography>
        </Box>

        <Box>
          <Tooltip title="Minimize">
            <IconButton
              size="small"
              onClick={onToggleMinimize}
              sx={{ color: 'white' }}
            >
              <Minimize />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* CURRENT STEP INFO */}
      {step && (
        <Box sx={{ p: 2, bgcolor: 'grey.50', borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Currently Analyzing:
          </Typography>
          <Typography variant="body1" fontWeight="bold">
            Step {currentStep + 1}/{workflow.steps.length}: {step.name}
          </Typography>
          <Chip
            label={step.type}
            size="small"
            color="primary"
            sx={{ mt: 0.5 }}
          />
        </Box>
      )}

      {/* MAIN CONTENT */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 4 }}>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary">
              AI is analyzing this step...
            </Typography>
          </Box>
        ) : analysis ? (
          <>
            {/* WHAT'S WORKING WELL */}
            {analysis.workingWell && analysis.workingWell.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 1,
                    cursor: 'pointer'
                  }}
                  onClick={() => toggleSection('current')}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle color="success" />
                    <Typography variant="subtitle1" fontWeight="bold">
                      ✅ Working Well
                    </Typography>
                  </Box>
                  {expandedSections.current ? <ExpandLess /> : <ExpandMore />}
                </Box>

                <Collapse in={expandedSections.current}>
                  <List dense>
                    {analysis.workingWell.map((item, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <CheckCircle fontSize="small" color="success" />
                        </ListItemIcon>
                        <ListItemText primary={item} />
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              </Box>
            )}

            {/* ISSUES DETECTED */}
            {analysis.issues && analysis.issues.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 1,
                    cursor: 'pointer'
                  }}
                  onClick={() => toggleSection('issues')}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Warning color="warning" />
                    <Typography variant="subtitle1" fontWeight="bold">
                      ⚠️ Issues Detected ({analysis.issues.length})
                    </Typography>
                  </Box>
                  {expandedSections.issues ? <ExpandLess /> : <ExpandMore />}
                </Box>

                <Collapse in={expandedSections.issues}>
                  {analysis.issues.map((issue, index) => (
                    <Alert
                      key={index}
                      severity={issue.severity || 'warning'}
                      sx={{ mb: 1 }}
                      action={
                        issue.fix && (
                          <Button
                            size="small"
                            onClick={() => handleApplySuggestion(issue.fix)}
                          >
                            Fix Now
                          </Button>
                        )
                      }
                    >
                      <AlertTitle>{issue.title}</AlertTitle>
                      {issue.description}
                      {issue.impact && (
                        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                          Impact: {issue.impact}
                        </Typography>
                      )}
                    </Alert>
                  ))}
                </Collapse>
              </Box>
            )}

            {/* SUGGESTIONS */}
            {analysis.suggestions && analysis.suggestions.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 1,
                    cursor: 'pointer'
                  }}
                  onClick={() => toggleSection('suggestions')}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Lightbulb color="info" />
                    <Typography variant="subtitle1" fontWeight="bold">
                      💡 AI Suggestions ({analysis.suggestions.length})
                    </Typography>
                  </Box>
                  {expandedSections.suggestions ? <ExpandLess /> : <ExpandMore />}
                </Box>

                <Collapse in={expandedSections.suggestions}>
                  {analysis.suggestions.map((suggestion, index) => (
                    <Paper
                      key={index}
                      variant="outlined"
                      sx={{ p: 2, mb: 1 }}
                    >
                      <Typography variant="subtitle2" gutterBottom>
                        {suggestion.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {suggestion.description}
                      </Typography>

                      {suggestion.expectedImpact && (
                        <Box sx={{ mb: 1 }}>
                          <Chip
                            icon={<TrendingUp />}
                            label={`Expected: ${suggestion.expectedImpact}`}
                            size="small"
                            color="success"
                            variant="outlined"
                          />
                        </Box>
                      )}

                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<AutoFixHigh />}
                          onClick={() => handleApplySuggestion(suggestion)}
                        >
                          Apply This
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                        >
                          Tell Me More
                        </Button>
                      </Box>
                    </Paper>
                  ))}
                </Collapse>
              </Box>
            )}

            {/* MISSING FEATURES */}
            {analysis.missingFeatures && analysis.missingFeatures.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 1,
                    cursor: 'pointer'
                  }}
                  onClick={() => toggleSection('missing')}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BugReport color="error" />
                    <Typography variant="subtitle1" fontWeight="bold">
                      🔍 Missing Features Detected
                    </Typography>
                  </Box>
                  {expandedSections.missing ? <ExpandLess /> : <ExpandMore />}
                </Box>

                <Collapse in={expandedSections.missing}>
                  <Alert severity="info" sx={{ mb: 1 }}>
                    <AlertTitle>AI noticed these features are missing</AlertTitle>
                    Add them to improve your workflow's effectiveness
                  </Alert>

                  {analysis.missingFeatures.map((feature, index) => (
                    <Paper
                      key={index}
                      variant="outlined"
                      sx={{ p: 2, mb: 1 }}
                    >
                      <Typography variant="subtitle2" gutterBottom>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {feature.description}
                      </Typography>

                      <Button
                        size="small"
                        variant="contained"
                        color="secondary"
                        onClick={() => onAddStep && onAddStep(feature.stepTemplate)}
                      >
                        Add This Feature
                      </Button>
                    </Paper>
                  ))}
                </Collapse>
              </Box>
            )}

            {/* AI RECOMMENDATION */}
            {analysis.recommendation && (
              <Alert
                severity="success"
                icon={<Psychology />}
                sx={{ mb: 3 }}
              >
                <AlertTitle>🎯 AI Recommendation</AlertTitle>
                {analysis.recommendation}
              </Alert>
            )}

            {/* CONVERSION PREDICTION */}
            {analysis.conversionProbability && (
              <Paper
                variant="outlined"
                sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}
              >
                <Typography variant="subtitle2" gutterBottom>
                  📊 Conversion Probability
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Box sx={{ flex: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={analysis.conversionProbability}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                  <Typography variant="h6">
                    {analysis.conversionProbability}%
                  </Typography>
                </Box>

                <Typography variant="caption" color="text.secondary">
                  Based on similar workflows and leads
                </Typography>
              </Paper>
            )}
          </>
        ) : (
          <Alert severity="info">
            <AlertTitle>Ready to Analyze</AlertTitle>
            Start testing your workflow to get AI-powered insights and suggestions.
          </Alert>
        )}

        {/* RUNNING NOTES */}
        <Box sx={{ mt: 3 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 1,
              cursor: 'pointer'
            }}
            onClick={() => toggleSection('notes')}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ChatBubble />
              <Typography variant="subtitle1" fontWeight="bold">
                📝 Running Notes ({notes.length})
              </Typography>
            </Box>
            <Box>
              {expandedSections.notes ? <ExpandLess /> : <ExpandMore />}
            </Box>
          </Box>

          <Collapse in={expandedSections.notes}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                maxHeight: 300,
                overflow: 'auto',
                bgcolor: 'grey.50'
              }}
            >
              {notes.length > 0 ? (
                <List dense>
                  {notes.map(note => (
                    <ListItem key={note.id} sx={{ py: 0.5 }}>
                      <ListItemText
                        primary={
                          <Typography variant="caption" color="text.secondary">
                            [{new Date(note.timestamp).toLocaleTimeString()}]
                          </Typography>
                        }
                        secondary={note.content}
                      />
                    </ListItem>
                  ))}
                  <div ref={notesEndRef} />
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  No notes yet. AI will document your testing session here.
                </Typography>
              )}
            </Paper>

            {notes.length > 0 && (
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Button
                  size="small"
                  startIcon={<Download />}
                  onClick={exportNotes}
                >
                  Export Notes
                </Button>
                <Button
                  size="small"
                  startIcon={<ContentCopy />}
                  onClick={() => {
                    const text = notes.map(n => n.content).join('\n');
                    navigator.clipboard.writeText(text);
                  }}
                >
                  Copy All
                </Button>
                <Button
                  size="small"
                  color="error"
                  onClick={clearNotes}
                >
                  Clear
                </Button>
              </Box>
            )}
          </Collapse>
        </Box>
      </Box>
    </Paper>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

/**
 * AI Thinking Indicator
 */
export function AIThinkingIndicator() {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        p: 2,
        bgcolor: 'primary.light',
        color: 'primary.contrastText',
        borderRadius: 1
      }}
    >
      <CircularProgress size={20} color="inherit" />
      <Typography variant="body2">
        AI is thinking...
      </Typography>
    </Box>
  );
}

/**
 * AI Suggestion Badge
 */
export function AISuggestionBadge({ count }) {
  if (count === 0) return null;

  return (
    <Chip
      icon={<Lightbulb />}
      label={`${count} suggestion${count !== 1 ? 's' : ''}`}
      size="small"
      color="warning"
      sx={{ ml: 1 }}
    />
  );
}
