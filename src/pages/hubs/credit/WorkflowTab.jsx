// Path: /src/pages/hubs/credit/WorkflowTab.jsx
// ============================================================================
// CREDIT HUB - WORKFLOWS TAB
// ============================================================================
// Purpose: Credit report workflows
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper
} from '@mui/material';
import {
  GitBranch,
  Play,
  Pause,
  CheckCircle,
  Circle,
  Plus,
  Eye,
  Copy,
  Trash2
} from 'lucide-react';
import { collection, query, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, where, orderBy } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../contexts/AuthContext';

const WORKFLOW_TEMPLATES = [
  {
    id: 'dispute_process',
    name: 'Complete Dispute Process',
    description: 'End-to-end workflow for disputing negative items',
    steps: [
      { title: 'Pull Credit Reports', description: 'Obtain reports from all three bureaus', duration: '1 day' },
      { title: 'Identify Errors', description: 'Review reports for inaccuracies', duration: '2 days' },
      { title: 'Gather Evidence', description: 'Collect supporting documentation', duration: '3 days' },
      { title: 'Submit Disputes', description: 'Send dispute letters to bureaus', duration: '1 day' },
      { title: 'Monitor Responses', description: 'Track bureau responses (30-45 days)', duration: '45 days' },
      { title: 'Follow Up', description: 'Send follow-up letters if needed', duration: '1 day' },
      { title: 'Verify Results', description: 'Confirm changes on credit reports', duration: '2 days' }
    ]
  },
  {
    id: 'score_improvement',
    name: 'Credit Score Improvement Plan',
    description: '90-day plan to improve credit score',
    steps: [
      { title: 'Baseline Assessment', description: 'Review current credit profile', duration: '1 day' },
      { title: 'Set Payment Reminders', description: 'Configure auto-pay for all accounts', duration: '1 day' },
      { title: 'Reduce Utilization', description: 'Pay down balances to <30%', duration: '30 days' },
      { title: 'Dispute Negative Items', description: 'Challenge inaccurate information', duration: '45 days' },
      { title: 'Request Credit Increases', description: 'Ask for higher limits on good accounts', duration: '1 day' },
      { title: 'Monitor Progress', description: 'Track score changes monthly', duration: '90 days' }
    ]
  },
  {
    id: 'new_client_onboarding',
    name: 'New Client Credit Onboarding',
    description: 'Onboarding process for new credit repair clients',
    steps: [
      { title: 'Initial Consultation', description: 'Meet with client to discuss goals', duration: '1 day' },
      { title: 'IDIQ Enrollment', description: 'Enroll client in monitoring system', duration: '1 day' },
      { title: 'Pull Credit Reports', description: 'Obtain tri-merge report', duration: '1 day' },
      { title: 'Credit Analysis', description: 'Analyze reports and create strategy', duration: '2 days' },
      { title: 'Present Action Plan', description: 'Review findings with client', duration: '1 day' },
      { title: 'Begin Disputes', description: 'Start dispute process', duration: '1 day' }
    ]
  },
  {
    id: 'monthly_maintenance',
    name: 'Monthly Credit Maintenance',
    description: 'Recurring monthly credit health checkup',
    steps: [
      { title: 'Pull Updated Reports', description: 'Get latest credit reports', duration: '1 day' },
      { title: 'Review Changes', description: 'Identify any new items or changes', duration: '1 day' },
      { title: 'Update Client', description: 'Send progress report to client', duration: '1 day' },
      { title: 'Address New Issues', description: 'Handle any new negative items', duration: '2 days' },
      { title: 'Track Disputes', description: 'Follow up on ongoing disputes', duration: '1 day' }
    ]
  }
];

const WorkflowTab = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [workflows, setWorkflows] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [viewWorkflow, setViewWorkflow] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    // Subscribe to workflows
    const clientId = userProfile?.role === 'client' ? userProfile.uid : null;
    const workflowsQuery = clientId
      ? query(
          collection(db, 'creditWorkflows'),
          where('clientId', '==', clientId),
          orderBy('createdAt', 'desc')
        )
      : query(collection(db, 'creditWorkflows'), orderBy('createdAt', 'desc'));

    const unsubWorkflows = onSnapshot(workflowsQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setWorkflows(data);
      setLoading(false);
    });

    return () => unsubWorkflows();
  }, [userProfile]);

  const handleCreateWorkflow = async (template) => {
    try {
      const workflow = {
        clientId: userProfile.uid,
        clientName: userProfile.displayName || userProfile.email,
        templateId: template.id,
        name: template.name,
        description: template.description,
        steps: template.steps.map(step => ({
          ...step,
          status: 'pending',
          completedAt: null
        })),
        currentStep: 0,
        status: 'active',
        progress: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: userProfile.email
      };

      await addDoc(collection(db, 'creditWorkflows'), workflow);

      setSnackbar({
        open: true,
        message: 'Workflow created successfully',
        severity: 'success'
      });
      setOpenDialog(false);
      setSelectedTemplate(null);
    } catch (error) {
      console.error('Error creating workflow:', error);
      setSnackbar({
        open: true,
        message: 'Error creating workflow',
        severity: 'error'
      });
    }
  };

  const handleCompleteStep = async (workflowId, stepIndex) => {
    try {
      const workflow = workflows.find(w => w.id === workflowId);
      if (!workflow) return;

      const updatedSteps = [...workflow.steps];
      updatedSteps[stepIndex].status = 'completed';
      updatedSteps[stepIndex].completedAt = new Date();

      const completedCount = updatedSteps.filter(s => s.status === 'completed').length;
      const progress = Math.round((completedCount / updatedSteps.length) * 100);
      const allCompleted = completedCount === updatedSteps.length;

      await updateDoc(doc(db, 'creditWorkflows', workflowId), {
        steps: updatedSteps,
        currentStep: stepIndex + 1,
        progress,
        status: allCompleted ? 'completed' : 'active',
        updatedAt: serverTimestamp()
      });

      setSnackbar({
        open: true,
        message: 'Step completed',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error completing step:', error);
      setSnackbar({
        open: true,
        message: 'Error completing step',
        severity: 'error'
      });
    }
  };

  const handlePauseWorkflow = async (workflowId) => {
    try {
      await updateDoc(doc(db, 'creditWorkflows', workflowId), {
        status: 'paused',
        updatedAt: serverTimestamp()
      });

      setSnackbar({
        open: true,
        message: 'Workflow paused',
        severity: 'info'
      });
    } catch (error) {
      console.error('Error pausing workflow:', error);
    }
  };

  const handleResumeWorkflow = async (workflowId) => {
    try {
      await updateDoc(doc(db, 'creditWorkflows', workflowId), {
        status: 'active',
        updatedAt: serverTimestamp()
      });

      setSnackbar({
        open: true,
        message: 'Workflow resumed',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error resuming workflow:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'info';
      case 'completed': return 'success';
      case 'paused': return 'warning';
      default: return 'default';
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
            <GitBranch size={24} style={{ verticalAlign: 'middle', marginRight: 8 }} />
            Credit Workflows
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage credit repair processes with structured workflows
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={() => setOpenDialog(true)}
        >
          Create Workflow
        </Button>
      </Box>

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Total Workflows</Typography>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                {workflows.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Active</Typography>
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'info.main' }}>
                {workflows.filter(w => w.status === 'active').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Completed</Typography>
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'success.main' }}>
                {workflows.filter(w => w.status === 'completed').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Avg Progress</Typography>
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
                {workflows.length > 0
                  ? Math.round(workflows.reduce((sum, w) => sum + (w.progress || 0), 0) / workflows.length)
                  : 0}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Active Workflows */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Your Workflows
          </Typography>
          {workflows.length === 0 ? (
            <Alert severity="info">
              No workflows yet. Click "Create Workflow" to get started with a structured credit repair process.
            </Alert>
          ) : (
            <Grid container spacing={2}>
              {workflows.map((workflow) => (
                <Grid item xs={12} key={workflow.id}>
                  <Paper sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          {workflow.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {workflow.description}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                          <Chip
                            label={workflow.status}
                            color={getStatusColor(workflow.status)}
                            size="small"
                          />
                          <Chip
                            label={`${workflow.progress || 0}% Complete`}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {workflow.status === 'active' && (
                          <IconButton size="small" onClick={() => handlePauseWorkflow(workflow.id)} title="Pause">
                            <Pause size={18} />
                          </IconButton>
                        )}
                        {workflow.status === 'paused' && (
                          <IconButton size="small" onClick={() => handleResumeWorkflow(workflow.id)} title="Resume">
                            <Play size={18} />
                          </IconButton>
                        )}
                        <IconButton size="small" onClick={() => setViewWorkflow(workflow)} title="View Details">
                          <Eye size={18} />
                        </IconButton>
                      </Box>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={workflow.progress || 0}
                      sx={{ mb: 2 }}
                    />
                    <Stepper activeStep={workflow.currentStep} orientation="vertical">
                      {workflow.steps?.map((step, index) => (
                        <Step key={index} completed={step.status === 'completed'}>
                          <StepLabel>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                              <Typography variant="body2">{step.title}</Typography>
                              {step.status !== 'completed' && workflow.currentStep === index && (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => handleCompleteStep(workflow.id, index)}
                                >
                                  Complete
                                </Button>
                              )}
                            </Box>
                          </StepLabel>
                          <StepContent>
                            <Typography variant="caption" color="text.secondary">
                              {step.description}
                            </Typography>
                            <Typography variant="caption" display="block" color="text.secondary">
                              Duration: {step.duration}
                            </Typography>
                          </StepContent>
                        </Step>
                      ))}
                    </Stepper>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Create Workflow Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Workflow</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Choose a workflow template to get started
          </Typography>
          <Grid container spacing={2}>
            {WORKFLOW_TEMPLATES.map((template) => (
              <Grid item xs={12} sm={6} key={template.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    border: selectedTemplate?.id === template.id ? 2 : 1,
                    borderColor: selectedTemplate?.id === template.id ? 'primary.main' : 'divider',
                    '&:hover': { borderColor: 'primary.main' }
                  }}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {template.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {template.description}
                    </Typography>
                    <Chip label={`${template.steps.length} steps`} size="small" />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => handleCreateWorkflow(selectedTemplate)}
            disabled={!selectedTemplate}
          >
            Create Workflow
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Workflow Dialog */}
      <Dialog
        open={!!viewWorkflow}
        onClose={() => setViewWorkflow(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {viewWorkflow?.name}
          <Typography variant="caption" display="block" color="text.secondary">
            Created: {viewWorkflow?.createdAt?.toDate().toLocaleDateString()}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            {viewWorkflow?.description}
          </Typography>
          <Stepper activeStep={viewWorkflow?.currentStep} orientation="vertical">
            {viewWorkflow?.steps?.map((step, index) => (
              <Step key={index} completed={step.status === 'completed'}>
                <StepLabel>
                  {step.title}
                  {step.status === 'completed' && step.completedAt && (
                    <Typography variant="caption" display="block" color="success.main">
                      Completed: {new Date(step.completedAt).toLocaleDateString()}
                    </Typography>
                  )}
                </StepLabel>
                <StepContent>
                  <Typography variant="body2">{step.description}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Duration: {step.duration}
                  </Typography>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewWorkflow(null)}>Close</Button>
        </DialogActions>
      </Dialog>

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

export default WorkflowTab;
