/**
 * WORKFLOW TESTING SIMULATOR
 *
 * Purpose:
 * The main interface for testing workflows step-by-step with AI guidance,
 * dual-view display, and complete control over execution.
 *
 * What It Does:
 * - Displays what the CONTACT sees (emails, SMS) vs what the CRM does (internal actions)
 * - Step-by-step execution with pause/resume at any point
 * - Speed controls (realtime, fast, instant)
 * - AI Workflow Consultant providing live guidance
 * - Event injection (simulate contact actions like "open email", "click link")
 * - Live editing of steps during testing
 * - Session save/resume (can pause and come back later)
 * - Detailed logging of every action
 * - Visual workflow progress tracker
 *
 * Why It's Important:
 * - Christopher can see EXACTLY what contacts will experience
 * - Catch problems before workflows go live
 * - AI suggests improvements in real-time
 * - No technical knowledge needed to test
 * - Prevents embarrassing mistakes (typos, broken links, wrong names)
 *
 * Layout:
 * ┌─────────────────────────────────────────────────────────────┐
 * │ Header: Workflow Name | Step 5/12 | [Pause] [Speed: Fast]  │
 * ├─────────────────────────────────────────────────────────────┤
 * │ Progress: ████████░░░░░░░░░░░░░░░░░░░░ 42%                 │
 * ├──────────────────────────┬──────────────────────────────────┤
 * │ CONTACT VIEW            │ CRM VIEW                          │
 * │ (What they see)         │ (What system does)                │
 * │                          │                                   │
 * │ [Email Preview]         │ Step 5: Send Email                │
 * │ From: Christopher       │ Status: ✓ Completed               │
 * │ Subject: Welcome!       │ Duration: 1.2s                    │
 * │                          │ Template: welcome-standard        │
 * │ Hi John,                │ Personalization: ✓ Applied        │
 * │ Welcome to Speedy...    │ Compliance: ✓ Passed              │
 * │                          │                                   │
 * │ [CTA Button: Get Report]│ Next: Step 6 (Wait 48 hours)     │
 * │                          │                                   │
 * │ [Simulate: Open Email]  │ [Edit Step] [Skip] [Inject Event]│
 * ├──────────────────────────┴──────────────────────────────────┤
 * │ AI CONSULTANT (Minimizable)                                  │
 * │ ✅ Email looks great! Subject line is compelling.           │
 * │ 💡 Suggestion: Add urgency to CTA ("Get Report Today")      │
 * │ ⚠️ Detected: No fallback if IDIQ API fails at Step 6       │
 * └─────────────────────────────────────────────────────────────┘
 *
 * Created: 2025-12-05
 * Part of: Speedy Credit Repair AI Workflow System
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  LinearProgress,
  Divider,
  Chip,
  Card,
  CardContent,
  Stack,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge
} from '@mui/material';

// Icons
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  SkipNext as SkipIcon,
  Replay as ReplayIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  VisibilityOff as HideIcon,
  Speed as SpeedIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
  Schedule as ScheduleIcon,
  Settings as SettingsIcon,
  BugReport as BugIcon,
  ExpandMore as ExpandIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Info as InfoIcon
} from '@mui/icons-material';

// Import our AI and workflow modules
import { executeWorkflow, executeStep, TEST_SPEED } from '../lib/workflowEngine';
import AIWorkflowConsultant from './AIWorkflowConsultant';
import { globalContextMemory } from '../lib/ai/contextMemory';
import { checkWorkflowCompliance } from '../lib/ai/complianceMonitor';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function WorkflowTestingSimulator({
  workflow,
  testContact,
  onComplete,
  onSave,
  resumeSession = null
}) {
  // --------------------------------------------------------------------------
  // STATE MANAGEMENT
  // --------------------------------------------------------------------------

  // Execution state
  const [execution, setExecution] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(TEST_SPEED.FAST);
  const [logs, setLogs] = useState([]);

  // Contact state (simulated)
  const [contactState, setContactState] = useState({
    ...testContact,
    emailsReceived: [],
    smsReceived: [],
    emailsOpened: [],
    emailsClicked: [],
    smsReplied: []
  });

  // UI state
  const [selectedView, setSelectedView] = useState('split'); // 'split', 'contact', 'crm'
  const [showAIConsultant, setShowAIConsultant] = useState(true);
  const [aiMinimized, setAIMinimized] = useState(false);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [editingStep, setEditingStep] = useState(null);

  // Session state
  const [sessionId, setSessionId] = useState(null);
  const [sessionStartTime, setSessionStartTime] = useState(null);

  // Refs
  const executionRef = useRef(null);
  const autoScrollRef = useRef(true);
  const contactViewRef = useRef(null);
  const crmViewRef = useRef(null);

  // --------------------------------------------------------------------------
  // INITIALIZATION
  // --------------------------------------------------------------------------

  useEffect(() => {
    initializeSimulator();
  }, []);

  /**
   * Initializes the simulator (resume or start new)
   */
  const initializeSimulator = async () => {
    console.log('[Simulator] Initializing...');

    try {
      // Check for compliance issues before starting
      const complianceReport = await checkWorkflowCompliance(workflow);
      if (complianceReport.violations.length > 0) {
        addLog('warning', `⚠️ Compliance issues detected: ${complianceReport.violations.length} violations`);
      }

      // Resume existing session or start new
      if (resumeSession) {
        await resumeTestingSession(resumeSession);
      } else {
        await startNewSession();
      }

      addLog('info', '✓ Simulator ready');

    } catch (error) {
      console.error('[Simulator] Initialization error:', error);
      addLog('error', `Failed to initialize: ${error.message}`);
    }
  };

  /**
   * Starts a new testing session
   */
  const startNewSession = async () => {
    setSessionStartTime(new Date());

    // Create session in context memory
    const session = await globalContextMemory.startSession({
      workflowId: workflow.id,
      contactId: testContact.id
    });

    setSessionId(session.id);

    // Initialize execution state
    const newExecution = {
      workflowId: workflow.id,
      contactId: testContact.id,
      status: 'ready',
      currentStep: 0,
      stepResults: [],
      startedAt: new Date(),
      testMode: true,
      speed
    };

    setExecution(newExecution);
    executionRef.current = newExecution;

    addLog('info', `Started new testing session for workflow: ${workflow.name}`);
  };

  /**
   * Resumes a paused testing session
   */
  const resumeTestingSession = async (session) => {
    console.log('[Simulator] Resuming session:', session.id);

    setSessionId(session.id);
    setSessionStartTime(session.startedAt);
    setCurrentStep(session.currentStep || 0);
    setExecution(session.executionState);
    setContactState(session.contactState);

    addLog('info', `Resumed testing session from step ${session.currentStep + 1}`);
  };

  // --------------------------------------------------------------------------
  // EXECUTION CONTROL
  // --------------------------------------------------------------------------

  /**
   * Starts or resumes workflow execution
   */
  const handlePlay = async () => {
    console.log('[Simulator] Play pressed');

    if (currentStep >= workflow.steps.length) {
      addLog('info', 'Workflow already completed. Use Replay to start over.');
      return;
    }

    setIsRunning(true);
    setIsPaused(false);

    addLog('info', `▶️ ${isPaused ? 'Resuming' : 'Starting'} execution at step ${currentStep + 1}`);

    try {
      // Execute steps one at a time
      for (let i = currentStep; i < workflow.steps.length; i++) {
        if (!executionRef.current || executionRef.current.status === 'paused') {
          break; // User paused
        }

        await executeCurrentStep(i);

        // Auto-scroll to keep current step visible
        if (autoScrollRef.current) {
          scrollToCurrentStep();
        }

        // Small delay between steps for visibility (unless instant mode)
        if (speed !== TEST_SPEED.INSTANT) {
          await delay(500);
        }
      }

      // Workflow completed
      if (currentStep >= workflow.steps.length - 1) {
        await handleComplete();
      }

    } catch (error) {
      console.error('[Simulator] Execution error:', error);
      addLog('error', `❌ Execution failed: ${error.message}`);
      setIsRunning(false);
    }
  };

  /**
   * Pauses execution
   */
  const handlePause = async () => {
    console.log('[Simulator] Pause pressed');

    setIsPaused(true);
    setIsRunning(false);

    if (executionRef.current) {
      executionRef.current.status = 'paused';
    }

    addLog('info', '⏸️ Execution paused');

    // Save session state
    await saveSessionState();
  };

  /**
   * Executes a single step
   */
  const executeCurrentStep = async (stepIndex) => {
    const step = workflow.steps[stepIndex];

    console.log(`[Simulator] Executing step ${stepIndex + 1}: ${step.type}`);
    addLog('info', `Step ${stepIndex + 1}: ${step.name || step.type}`);

    setCurrentStep(stepIndex);

    try {
      const startTime = Date.now();

      // Execute step using workflowEngine
      const result = await executeStep(
        step,
        contactState,
        executionRef.current,
        true, // testMode
        speed
      );

      const duration = Date.now() - startTime;

      // Update execution state
      const updatedExecution = {
        ...executionRef.current,
        stepResults: [
          ...executionRef.current.stepResults,
          {
            stepIndex,
            type: step.type,
            success: result.success,
            result: result.data,
            duration,
            timestamp: new Date()
          }
        ]
      };

      setExecution(updatedExecution);
      executionRef.current = updatedExecution;

      // Update contact state based on step result
      if (result.success) {
        updateContactState(step, result.data);
        addLog('success', `✓ Step ${stepIndex + 1} completed (${duration}ms)`);
      } else {
        addLog('error', `✗ Step ${stepIndex + 1} failed: ${result.error}`);
      }

      // Move to next step
      setCurrentStep(stepIndex + 1);

    } catch (error) {
      console.error(`[Simulator] Step ${stepIndex + 1} error:`, error);
      addLog('error', `❌ Step ${stepIndex + 1} error: ${error.message}`);
      throw error;
    }
  };

  /**
   * Updates contact state based on step execution
   */
  const updateContactState = (step, result) => {
    const updates = { ...contactState };

    switch (step.type) {
      case 'email_send':
        updates.emailsReceived.push({
          subject: result.subject,
          body: result.body,
          sentAt: new Date(),
          opened: false,
          clicked: false
        });
        break;

      case 'sms_send':
        updates.smsReceived.push({
          message: result.message,
          sentAt: new Date(),
          replied: false
        });
        break;

      case 'role_assignment':
        updates.status = result.newRole;
        break;

      case 'update_contact':
        Object.assign(updates, result.updates);
        break;

      case 'ai_analysis':
        updates.leadScore = result.leadScore;
        updates.temperature = result.temperature;
        updates.aiContext = result.context;
        break;

      case 'idiq_enrollment':
        updates.idiqStatus = 'enrolled';
        updates.idiqEnrolledAt = new Date();
        break;

      default:
        // No state update needed
        break;
    }

    setContactState(updates);
  };

  /**
   * Skips current step
   */
  const handleSkip = () => {
    console.log(`[Simulator] Skipping step ${currentStep + 1}`);
    addLog('warning', `⏭️ Skipped step ${currentStep + 1}`);

    const skippedResult = {
      stepIndex: currentStep,
      type: workflow.steps[currentStep].type,
      success: false,
      result: null,
      skipped: true,
      timestamp: new Date()
    };

    const updatedExecution = {
      ...executionRef.current,
      stepResults: [...executionRef.current.stepResults, skippedResult]
    };

    setExecution(updatedExecution);
    executionRef.current = updatedExecution;

    setCurrentStep(currentStep + 1);
  };

  /**
   * Replays workflow from beginning
   */
  const handleReplay = () => {
    console.log('[Simulator] Replaying workflow');

    setCurrentStep(0);
    setIsRunning(false);
    setIsPaused(false);

    // Reset execution state
    const resetExecution = {
      ...executionRef.current,
      status: 'ready',
      currentStep: 0,
      stepResults: [],
      startedAt: new Date()
    };

    setExecution(resetExecution);
    executionRef.current = resetExecution;

    // Reset contact state
    setContactState({
      ...testContact,
      emailsReceived: [],
      smsReceived: [],
      emailsOpened: [],
      emailsClicked: [],
      smsReplied: []
    });

    setLogs([]);
    addLog('info', '🔄 Workflow reset to beginning');
  };

  /**
   * Completes the workflow
   */
  const handleComplete = async () => {
    console.log('[Simulator] Workflow completed');

    setIsRunning(false);
    addLog('success', '🎉 Workflow completed successfully!');

    // Complete session in context memory
    if (sessionId) {
      await globalContextMemory.completeSession({
        finalStep: workflow.steps.length,
        wasSuccessful: true,
        outcome: 'All steps executed successfully in test mode'
      });
    }

    // Callback to parent
    if (onComplete) {
      onComplete({
        execution: executionRef.current,
        contactState,
        logs
      });
    }
  };

  // --------------------------------------------------------------------------
  // SPEED CONTROL
  // --------------------------------------------------------------------------

  const handleSpeedChange = (newSpeed) => {
    console.log(`[Simulator] Speed changed to: ${newSpeed}`);
    setSpeed(newSpeed);

    if (executionRef.current) {
      executionRef.current.speed = newSpeed;
    }

    addLog('info', `Speed: ${newSpeed}`);
  };

  // --------------------------------------------------------------------------
  // EVENT INJECTION
  // --------------------------------------------------------------------------

  /**
   * Opens event injection dialog
   */
  const handleInjectEvent = () => {
    setShowEventDialog(true);
  };

  /**
   * Simulates contact opening an email
   */
  const simulateEmailOpen = (emailIndex) => {
    console.log(`[Simulator] Simulating email open: ${emailIndex}`);

    const updated = { ...contactState };
    updated.emailsReceived[emailIndex].opened = true;
    updated.emailsOpened.push(emailIndex);

    setContactState(updated);
    addLog('info', `📧 Simulated: Contact opened email #${emailIndex + 1}`);
  };

  /**
   * Simulates contact clicking email link
   */
  const simulateEmailClick = (emailIndex) => {
    console.log(`[Simulator] Simulating email click: ${emailIndex}`);

    const updated = { ...contactState };
    updated.emailsReceived[emailIndex].clicked = true;
    updated.emailsClicked.push(emailIndex);

    setContactState(updated);
    addLog('info', `🖱️ Simulated: Contact clicked link in email #${emailIndex + 1}`);
  };

  /**
   * Simulates contact replying to SMS
   */
  const simulateSmsReply = (smsIndex, message) => {
    console.log(`[Simulator] Simulating SMS reply: ${smsIndex}`);

    const updated = { ...contactState };
    updated.smsReceived[smsIndex].replied = true;
    updated.smsReceived[smsIndex].replyMessage = message;
    updated.smsReplied.push(smsIndex);

    setContactState(updated);
    addLog('info', `💬 Simulated: Contact replied to SMS #${smsIndex + 1}`);
  };

  // --------------------------------------------------------------------------
  // STEP EDITING
  // --------------------------------------------------------------------------

  const handleEditStep = (stepIndex) => {
    setEditingStep(stepIndex);
    setShowEditDialog(true);
  };

  const handleSaveStepEdit = (updatedStep) => {
    console.log(`[Simulator] Saving edits to step ${editingStep}`);

    // Update workflow (this would normally update Firestore)
    workflow.steps[editingStep] = updatedStep;

    addLog('info', `✏️ Edited step ${editingStep + 1}`);
    setShowEditDialog(false);
    setEditingStep(null);
  };

  // --------------------------------------------------------------------------
  // SESSION MANAGEMENT
  // --------------------------------------------------------------------------

  /**
   * Saves current session state for resume
   */
  const saveSessionState = async () => {
    if (!sessionId) return;

    try {
      await globalContextMemory.saveSessionState({
        currentStep,
        executionState: executionRef.current,
        contactState,
        isPaused: true
      });

      console.log('[Simulator] Session state saved');

    } catch (error) {
      console.error('[Simulator] Failed to save session:', error);
    }
  };

  /**
   * Opens save session dialog
   */
  const handleSaveSession = () => {
    setShowSaveDialog(true);
  };

  /**
   * Saves session and exits
   */
  const handleSaveAndExit = async () => {
    await saveSessionState();

    addLog('success', '💾 Session saved - you can resume later');

    if (onSave) {
      onSave({
        sessionId,
        currentStep,
        execution: executionRef.current,
        contactState
      });
    }
  };

  // --------------------------------------------------------------------------
  // LOGGING
  // --------------------------------------------------------------------------

  const addLog = (level, message) => {
    const log = {
      level,
      message,
      timestamp: new Date()
    };

    setLogs(prev => [...prev, log]);

    // Auto-scroll logs
    setTimeout(() => {
      const logContainer = document.getElementById('log-container');
      if (logContainer && autoScrollRef.current) {
        logContainer.scrollTop = logContainer.scrollHeight;
      }
    }, 100);
  };

  // --------------------------------------------------------------------------
  // UTILITIES
  // --------------------------------------------------------------------------

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const scrollToCurrentStep = () => {
    const element = document.getElementById(`step-${currentStep}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const getStepIcon = (step) => {
    switch (step.type) {
      case 'email_send':
        return <EmailIcon />;
      case 'sms_send':
        return <SmsIcon />;
      case 'wait':
        return <ScheduleIcon />;
      default:
        return <SettingsIcon />;
    }
  };

  const getStepStatus = (stepIndex) => {
    if (stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep) return 'active';
    return 'pending';
  };

  const calculateProgress = () => {
    return (currentStep / workflow.steps.length) * 100;
  };

  // --------------------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------------------

  if (!execution) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper elevation={2} sx={{ p: 2, borderRadius: 0 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          {/* Workflow info */}
          <Box>
            <Typography variant="h5" fontWeight="bold">
              {workflow.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Testing with: {testContact.firstName} {testContact.lastName}
            </Typography>
          </Box>

          {/* Controls */}
          <Stack direction="row" spacing={1} alignItems="center">
            {/* Step counter */}
            <Chip
              label={`Step ${currentStep + 1} / ${workflow.steps.length}`}
              color="primary"
              variant="outlined"
            />

            {/* Play/Pause */}
            {!isRunning ? (
              <Button
                variant="contained"
                startIcon={<PlayIcon />}
                onClick={handlePlay}
                disabled={currentStep >= workflow.steps.length}
              >
                {currentStep === 0 ? 'Start' : 'Resume'}
              </Button>
            ) : (
              <Button
                variant="contained"
                color="warning"
                startIcon={<PauseIcon />}
                onClick={handlePause}
              >
                Pause
              </Button>
            )}

            {/* Skip */}
            <Tooltip title="Skip current step">
              <IconButton
                onClick={handleSkip}
                disabled={!isRunning || currentStep >= workflow.steps.length}
              >
                <SkipIcon />
              </IconButton>
            </Tooltip>

            {/* Replay */}
            <Tooltip title="Restart from beginning">
              <IconButton onClick={handleReplay} disabled={isRunning}>
                <ReplayIcon />
              </IconButton>
            </Tooltip>

            {/* Speed control */}
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Speed</InputLabel>
              <Select
                value={speed}
                label="Speed"
                onChange={(e) => handleSpeedChange(e.target.value)}
                disabled={isRunning}
              >
                <MenuItem value={TEST_SPEED.REALTIME}>Realtime</MenuItem>
                <MenuItem value={TEST_SPEED.FAST}>Fast (10x)</MenuItem>
                <MenuItem value={TEST_SPEED.INSTANT}>Instant</MenuItem>
              </Select>
            </FormControl>

            {/* Save */}
            <Tooltip title="Save and exit">
              <IconButton onClick={handleSaveSession}>
                <SaveIcon />
              </IconButton>
            </Tooltip>

            {/* View toggle */}
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>View</InputLabel>
              <Select
                value={selectedView}
                label="View"
                onChange={(e) => setSelectedView(e.target.value)}
              >
                <MenuItem value="split">Split View</MenuItem>
                <MenuItem value="contact">Contact Only</MenuItem>
                <MenuItem value="crm">CRM Only</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Box>

        {/* Progress bar */}
        <Box sx={{ mt: 2 }}>
          <LinearProgress
            variant="determinate"
            value={calculateProgress()}
            sx={{ height: 8, borderRadius: 4 }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            {calculateProgress().toFixed(0)}% Complete
          </Typography>
        </Box>
      </Paper>

      {/* Main content */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left/Top: Contact View */}
        {(selectedView === 'split' || selectedView === 'contact') && (
          <Box
            ref={contactViewRef}
            sx={{
              flex: selectedView === 'split' ? 1 : 2,
              overflow: 'auto',
              p: 2,
              borderRight: selectedView === 'split' ? 1 : 0,
              borderColor: 'divider',
              bgcolor: '#f5f5f5'
            }}
          >
            <ContactView
              contactState={contactState}
              onEmailOpen={simulateEmailOpen}
              onEmailClick={simulateEmailClick}
              onSmsReply={simulateSmsReply}
            />
          </Box>
        )}

        {/* Right/Bottom: CRM View */}
        {(selectedView === 'split' || selectedView === 'crm') && (
          <Box
            ref={crmViewRef}
            sx={{
              flex: selectedView === 'split' ? 1 : 2,
              overflow: 'auto',
              p: 2
            }}
          >
            <CRMView
              workflow={workflow}
              execution={execution}
              currentStep={currentStep}
              contactState={contactState}
              logs={logs}
              onEditStep={handleEditStep}
              onInjectEvent={handleInjectEvent}
            />
          </Box>
        )}
      </Box>

      {/* AI Consultant (overlay) */}
      {showAIConsultant && (
        <Box
          sx={{
            position: 'fixed',
            bottom: aiMinimized ? 0 : 20,
            right: 20,
            width: aiMinimized ? 300 : 400,
            maxHeight: aiMinimized ? 60 : '60vh',
            zIndex: 1000,
            boxShadow: 3
          }}
        >
          <AIWorkflowConsultant
            execution={execution}
            workflow={workflow}
            contact={contactState}
            currentStep={currentStep}
            onApplySuggestion={(suggestion) => {
              addLog('info', `AI: Applied suggestion - ${suggestion.summary}`);
            }}
            onAddStep={(step) => {
              addLog('info', `AI: Added step - ${step.name}`);
            }}
            onEditStep={handleEditStep}
            minimized={aiMinimized}
            onToggleMinimize={() => setAIMinimized(!aiMinimized)}
          />

          <IconButton
            size="small"
            sx={{ position: 'absolute', top: 8, right: 8 }}
            onClick={() => setShowAIConsultant(false)}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      )}

      {/* Event Injection Dialog */}
      <EventInjectionDialog
        open={showEventDialog}
        onClose={() => setShowEventDialog(false)}
        contactState={contactState}
        onEmailOpen={simulateEmailOpen}
        onEmailClick={simulateEmailClick}
        onSmsReply={simulateSmsReply}
      />

      {/* Step Edit Dialog */}
      <StepEditDialog
        open={showEditDialog}
        step={editingStep !== null ? workflow.steps[editingStep] : null}
        stepIndex={editingStep}
        onClose={() => setShowEditDialog(false)}
        onSave={handleSaveStepEdit}
      />

      {/* Save Session Dialog */}
      <SaveSessionDialog
        open={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        onSave={handleSaveAndExit}
      />
    </Box>
  );
}

// ============================================================================
// CONTACT VIEW COMPONENT
// ============================================================================

function ContactView({ contactState, onEmailOpen, onEmailClick, onSmsReply }) {
  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <ViewIcon sx={{ mr: 1 }} />
        Contact View
        <Chip label="What they see" size="small" sx={{ ml: 1 }} />
      </Typography>

      <Typography variant="body2" color="text.secondary" gutterBottom>
        This is exactly what {contactState.firstName} will experience
      </Typography>

      <Divider sx={{ my: 2 }} />

      {/* Emails received */}
      {contactState.emailsReceived.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            📧 Emails Received ({contactState.emailsReceived.length})
          </Typography>

          <Stack spacing={2}>
            {contactState.emailsReceived.map((email, index) => (
              <EmailPreview
                key={index}
                email={email}
                index={index}
                onOpen={() => onEmailOpen(index)}
                onClick={() => onEmailClick(index)}
              />
            ))}
          </Stack>
        </Box>
      )}

      {/* SMS received */}
      {contactState.smsReceived.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            💬 SMS Messages ({contactState.smsReceived.length})
          </Typography>

          <Stack spacing={2}>
            {contactState.smsReceived.map((sms, index) => (
              <SMSPreview
                key={index}
                sms={sms}
                index={index}
                onReply={(message) => onSmsReply(index, message)}
              />
            ))}
          </Stack>
        </Box>
      )}

      {/* Empty state */}
      {contactState.emailsReceived.length === 0 && contactState.smsReceived.length === 0 && (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            color: 'text.secondary'
          }}
        >
          <EmailIcon sx={{ fontSize: 64, opacity: 0.3, mb: 2 }} />
          <Typography variant="body1">
            No messages sent yet
          </Typography>
          <Typography variant="body2">
            Start the workflow to see what contacts will receive
          </Typography>
        </Box>
      )}
    </Box>
  );
}

// ============================================================================
// CRM VIEW COMPONENT
// ============================================================================

function CRMView({ workflow, execution, currentStep, contactState, logs, onEditStep, onInjectEvent }) {
  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <SettingsIcon sx={{ mr: 1 }} />
        CRM View
        <Chip label="What system does" size="small" color="primary" sx={{ ml: 1 }} />
      </Typography>

      <Typography variant="body2" color="text.secondary" gutterBottom>
        Internal workflow execution details
      </Typography>

      <Divider sx={{ my: 2 }} />

      {/* Workflow steps */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Workflow Steps
        </Typography>

        <Stepper activeStep={currentStep} orientation="vertical">
          {workflow.steps.map((step, index) => {
            const status = index < currentStep ? 'completed' : index === currentStep ? 'active' : 'pending';
            const result = execution?.stepResults?.find(r => r.stepIndex === index);

            return (
              <Step key={index} id={`step-${index}`}>
                <StepLabel
                  error={result && !result.success}
                  icon={
                    result?.success ? <CheckIcon color="success" /> :
                    result && !result.success ? <ErrorIcon color="error" /> :
                    index + 1
                  }
                >
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="body1">
                        {step.name || step.type}
                      </Typography>
                      {result && (
                        <Typography variant="caption" color="text.secondary">
                          {result.duration}ms
                        </Typography>
                      )}
                    </Box>

                    {status === 'active' && (
                      <Box>
                        <Tooltip title="Edit step">
                          <IconButton size="small" onClick={() => onEditStep(index)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}
                  </Box>
                </StepLabel>

                <StepContent>
                  <StepDetails step={step} result={result} />
                </StepContent>
              </Step>
            );
          })}
        </Stepper>
      </Box>

      {/* Contact state */}
      <Box sx={{ mb: 3 }}>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandIcon />}>
            <Typography variant="subtitle1" fontWeight="bold">
              Contact State
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <ContactStateDisplay contactState={contactState} />
          </AccordionDetails>
        </Accordion>
      </Box>

      {/* Execution logs */}
      <Box>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Execution Logs
        </Typography>

        <Paper
          id="log-container"
          variant="outlined"
          sx={{
            maxHeight: 300,
            overflow: 'auto',
            p: 2,
            bgcolor: '#1e1e1e',
            color: '#d4d4d4',
            fontFamily: 'monospace',
            fontSize: '0.875rem'
          }}
        >
          {logs.map((log, index) => (
            <Box key={index} sx={{ mb: 0.5 }}>
              <span style={{ color: getLogColor(log.level) }}>
                [{log.timestamp.toLocaleTimeString()}]
              </span>{' '}
              {log.message}
            </Box>
          ))}
        </Paper>
      </Box>
    </Box>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function EmailPreview({ email, index, onOpen, onClick }) {
  const [isOpen, setIsOpen] = useState(email.opened);

  const handleOpen = () => {
    setIsOpen(true);
    onOpen();
  };

  return (
    <Card variant="outlined" sx={{ bgcolor: isOpen ? 'white' : '#f9f9f9' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              From: Christopher @ Speedy Credit Repair
            </Typography>
            <Typography variant="subtitle1" fontWeight="bold">
              {email.subject}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {email.sentAt.toLocaleString()}
            </Typography>
          </Box>

          <Chip
            label={isOpen ? 'Opened' : 'Unread'}
            size="small"
            color={isOpen ? 'success' : 'default'}
          />
        </Box>

        {isOpen && (
          <>
            <Divider sx={{ my: 1 }} />
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {email.body}
            </Typography>

            <Box mt={2}>
              <Button
                variant="contained"
                fullWidth
                onClick={onClick}
                disabled={email.clicked}
              >
                {email.clicked ? '✓ Clicked' : 'Get My Free Credit Report'}
              </Button>
            </Box>
          </>
        )}

        {!isOpen && (
          <Button size="small" onClick={handleOpen} sx={{ mt: 1 }}>
            Open Email
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function SMSPreview({ sms, index, onReply }) {
  const [replyText, setReplyText] = useState('');
  const [showReply, setShowReply] = useState(false);

  const handleSendReply = () => {
    onReply(replyText);
    setShowReply(false);
    setReplyText('');
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Box display="flex" justifyContent="space-between" mb={1}>
          <Typography variant="caption" color="text.secondary">
            SMS from Speedy Credit Repair
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {sms.sentAt.toLocaleString()}
          </Typography>
        </Box>

        <Paper
          sx={{
            p: 1.5,
            bgcolor: '#e3f2fd',
            borderRadius: 2
          }}
        >
          <Typography variant="body2">
            {sms.message}
          </Typography>
        </Paper>

        {sms.replied && (
          <Paper
            sx={{
              p: 1.5,
              bgcolor: '#f1f8e9',
              borderRadius: 2,
              mt: 1,
              ml: 4
            }}
          >
            <Typography variant="caption" color="text.secondary">
              You replied:
            </Typography>
            <Typography variant="body2">
              {sms.replyMessage}
            </Typography>
          </Paper>
        )}

        {!sms.replied && !showReply && (
          <Button size="small" onClick={() => setShowReply(true)} sx={{ mt: 1 }}>
            Reply to SMS
          </Button>
        )}

        {showReply && (
          <Box mt={2}>
            <TextField
              fullWidth
              size="small"
              placeholder="Type reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              multiline
              rows={2}
            />
            <Box mt={1} display="flex" gap={1}>
              <Button size="small" variant="contained" onClick={handleSendReply}>
                Send
              </Button>
              <Button size="small" onClick={() => setShowReply(false)}>
                Cancel
              </Button>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

function StepDetails({ step, result }) {
  return (
    <Box>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        <strong>Type:</strong> {step.type}
      </Typography>

      {step.config && (
        <Box mt={1}>
          <Typography variant="caption" color="text.secondary">
            Configuration:
          </Typography>
          <pre style={{ fontSize: '0.75rem', overflow: 'auto' }}>
            {JSON.stringify(step.config, null, 2)}
          </pre>
        </Box>
      )}

      {result && (
        <Box mt={1}>
          <Alert severity={result.success ? 'success' : 'error'} sx={{ mt: 1 }}>
            {result.success ? 'Completed successfully' : `Failed: ${result.error}`}
          </Alert>
        </Box>
      )}
    </Box>
  );
}

function ContactStateDisplay({ contactState }) {
  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary">Status</Typography>
          <Typography variant="body1">{contactState.status}</Typography>
        </Grid>

        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary">Lead Score</Typography>
          <Typography variant="body1">{contactState.leadScore || 'N/A'}</Typography>
        </Grid>

        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary">IDIQ Status</Typography>
          <Typography variant="body1">{contactState.idiqStatus || 'Not enrolled'}</Typography>
        </Grid>

        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary">Temperature</Typography>
          <Typography variant="body1">{contactState.temperature || 'N/A'}</Typography>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="body2" color="text.secondary">Engagement</Typography>
          <Typography variant="body2">
            📧 Emails: {contactState.emailsReceived.length} received, {contactState.emailsOpened.length} opened, {contactState.emailsClicked.length} clicked
          </Typography>
          <Typography variant="body2">
            💬 SMS: {contactState.smsReceived.length} received, {contactState.smsReplied.length} replied
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
}

// ============================================================================
// DIALOG COMPONENTS
// ============================================================================

function EventInjectionDialog({ open, onClose, contactState, onEmailOpen, onEmailClick, onSmsReply }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Inject Event</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Simulate contact actions to test workflow branching
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* Email events */}
        {contactState.emailsReceived.length > 0 && (
          <Box mb={2}>
            <Typography variant="subtitle2" gutterBottom>
              Email Events
            </Typography>
            <List>
              {contactState.emailsReceived.map((email, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={`Email #${index + 1}: ${email.subject}`}
                    secondary={`Sent: ${email.sentAt.toLocaleTimeString()}`}
                  />
                  <Button
                    size="small"
                    onClick={() => {
                      onEmailOpen(index);
                      onClose();
                    }}
                    disabled={email.opened}
                  >
                    {email.opened ? 'Opened' : 'Simulate Open'}
                  </Button>
                  <Button
                    size="small"
                    onClick={() => {
                      onEmailClick(index);
                      onClose();
                    }}
                    disabled={email.clicked}
                    sx={{ ml: 1 }}
                  >
                    {email.clicked ? 'Clicked' : 'Simulate Click'}
                  </Button>
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* SMS events */}
        {contactState.smsReceived.length > 0 && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              SMS Events
            </Typography>
            <List>
              {contactState.smsReceived.map((sms, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={`SMS #${index + 1}`}
                    secondary={`Sent: ${sms.sentAt.toLocaleTimeString()}`}
                  />
                  <Button
                    size="small"
                    onClick={() => {
                      onSmsReply(index, 'YES');
                      onClose();
                    }}
                    disabled={sms.replied}
                  >
                    {sms.replied ? 'Replied' : 'Simulate Reply'}
                  </Button>
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {contactState.emailsReceived.length === 0 && contactState.smsReceived.length === 0 && (
          <Alert severity="info">
            No messages sent yet. Events will appear here as the workflow progresses.
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

function StepEditDialog({ open, step, stepIndex, onClose, onSave }) {
  const [editedStep, setEditedStep] = useState(step);

  useEffect(() => {
    setEditedStep(step);
  }, [step]);

  if (!step) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit Step {stepIndex + 1}</DialogTitle>
      <DialogContent>
        <Box mt={2}>
          <TextField
            fullWidth
            label="Step Name"
            value={editedStep?.name || ''}
            onChange={(e) => setEditedStep({ ...editedStep, name: e.target.value })}
            margin="normal"
          />

          <TextField
            fullWidth
            label="Step Type"
            value={editedStep?.type || ''}
            disabled
            margin="normal"
          />

          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            Configuration (JSON)
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={10}
            value={JSON.stringify(editedStep?.config || {}, null, 2)}
            onChange={(e) => {
              try {
                const config = JSON.parse(e.target.value);
                setEditedStep({ ...editedStep, config });
              } catch (err) {
                // Invalid JSON, ignore
              }
            }}
            sx={{ fontFamily: 'monospace' }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={() => onSave(editedStep)}>
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function SaveSessionDialog({ open, onClose, onSave }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Save Testing Session</DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          Your progress will be saved and you can resume this testing session later from where you left off.
        </Typography>

        <Alert severity="info" sx={{ mt: 2 }}>
          Session state includes:
          <ul style={{ marginTop: 8, marginBottom: 0 }}>
            <li>Current step position</li>
            <li>Execution results</li>
            <li>Contact state</li>
            <li>All logs and history</li>
          </ul>
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onSave} startIcon={<SaveIcon />}>
          Save & Exit
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getLogColor(level) {
  switch (level) {
    case 'success':
      return '#4caf50';
    case 'error':
      return '#f44336';
    case 'warning':
      return '#ff9800';
    case 'info':
    default:
      return '#2196f3';
  }
}
