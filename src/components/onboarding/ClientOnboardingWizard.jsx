import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  TextField,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  useTheme
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  RadioButtonUnchecked as UncheckedIcon,
  Person as PersonIcon,
  Description as DocIcon,
  CreditScore as CreditIcon,
  Gavel as DisputeIcon,
  Payment as PaymentIcon,
  Schedule as ScheduleIcon,
  Lightbulb as TipIcon,
  PlayArrow as StartIcon,
  Close as CloseIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

const CREDIT_GOALS = [
  { id: 'auto_loan', label: 'Get Auto Loan/Lease', icon: '🚗' },
  { id: 'mortgage', label: 'Buy a Home', icon: '🏠' },
  { id: 'credit_cards', label: 'Get Credit Cards', icon: '💳' },
  { id: 'business_credit', label: 'Build Business Credit', icon: '🏢' },
  { id: 'lower_rates', label: 'Lower Interest Rates', icon: '📉' },
  { id: 'general', label: 'General Credit Improvement', icon: '📈' }
];

export default function ClientOnboardingWizard({ clientId, clientName, clientEmail, onComplete, onClose }) {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [session, setSession] = useState(null);
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [stepNotes, setStepNotes] = useState({});

  useEffect(() => {
    if (clientId) {
      checkExistingSession();
    }
  }, [clientId]);

  const checkExistingSession = async () => {
    try {
      const getSession = httpsCallable(functions, 'getOnboardingSession');
      const result = await getSession({ clientId });
      if (result.data.session) {
        setSession(result.data.session);
        setSelectedGoals(result.data.session.creditGoals || []);
        // Find current step
        const currentStep = result.data.session.checklist?.findIndex(item => !item.completed) || 0;
        setActiveStep(Math.max(0, currentStep));
      }
    } catch (err) {
      console.error('Error checking session:', err);
    }
  };

  const startOnboarding = async () => {
    if (selectedGoals.length === 0) {
      setError('Please select at least one credit goal');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const createSession = httpsCallable(functions, 'createOnboardingSession');
      const result = await createSession({
        clientId,
        clientName,
        clientEmail,
        creditGoals: selectedGoals
      });

      setSession({
        id: result.data.sessionId,
        checklist: result.data.checklist,
        aiRecommendations: result.data.recommendations,
        expectedTimeline: result.data.timeline
      });
      setActiveStep(0);
    } catch (err) {
      console.error('Error starting onboarding:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const completeStep = async (stepId) => {
    setLoading(true);
    try {
      const updateStep = httpsCallable(functions, 'updateOnboardingStep');
      const result = await updateStep({
        sessionId: session.id,
        stepId,
        completed: true,
        notes: stepNotes[stepId] || null
      });

      // Update local state
      const updatedChecklist = session.checklist.map(item =>
        item.id === stepId ? { ...item, completed: true } : item
      );
      setSession({ ...session, checklist: updatedChecklist });

      // Move to next step
      const nextIncomplete = updatedChecklist.findIndex(item => !item.completed);
      if (nextIncomplete >= 0) {
        setActiveStep(nextIncomplete);
      }

      if (result.data.allRequiredComplete && onComplete) {
        onComplete();
      }
    } catch (err) {
      console.error('Error completing step:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleGoal = (goalId) => {
    setSelectedGoals(prev =>
      prev.includes(goalId)
        ? prev.filter(g => g !== goalId)
        : [...prev, goalId]
    );
  };

  const getStepIcon = (stepId) => {
    const icons = {
      welcome: PersonIcon,
      agreement: DocIcon,
      id_verification: PersonIcon,
      ssn_verification: PersonIcon,
      credit_reports: CreditIcon,
      initial_analysis: CreditIcon,
      dispute_strategy: DisputeIcon,
      payment_setup: PaymentIcon,
      auto_prequalify: '🚗',
      mortgage_readiness: '🏠',
      business_setup: '🏢'
    };
    return icons[stepId] || DocIcon;
  };

  const completedCount = session?.checklist?.filter(item => item.completed).length || 0;
  const totalCount = session?.checklist?.length || 0;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Goal Selection Screen
  if (!session) {
    return (
      <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Client Onboarding
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Let's set up {clientName || 'this client'} for success. Start by selecting their credit goals.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            What are the client's credit goals?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select all that apply - this helps us customize their experience.
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {CREDIT_GOALS.map(goal => (
              <Card
                key={goal.id}
                sx={{
                  width: 160,
                  cursor: 'pointer',
                  border: selectedGoals.includes(goal.id) ? 2 : 1,
                  borderColor: selectedGoals.includes(goal.id) ? 'primary.main' : 'divider',
                  bgcolor: selectedGoals.includes(goal.id) ? 'primary.50' : 'background.paper',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'primary.main',
                    transform: 'translateY(-2px)'
                  }
                }}
                onClick={() => toggleGoal(goal.id)}
              >
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" sx={{ mb: 1 }}>
                    {goal.icon}
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {goal.label}
                  </Typography>
                  {selectedGoals.includes(goal.id) && (
                    <CheckIcon color="primary" sx={{ mt: 1 }} />
                  )}
                </CardContent>
              </Card>
            ))}
          </Box>
        </Paper>

        <Box sx={{ display: 'flex', gap: 2 }}>
          {onClose && (
            <Button variant="outlined" onClick={onClose}>
              Cancel
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <StartIcon />}
            onClick={startOnboarding}
            disabled={loading || selectedGoals.length === 0}
          >
            Start Onboarding
          </Button>
        </Box>
      </Box>
    );
  }

  // Onboarding Progress Screen
  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Onboarding: {clientName || 'Client'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {selectedGoals.map(goalId => {
              const goal = CREDIT_GOALS.find(g => g.id === goalId);
              return (
                <Chip
                  key={goalId}
                  label={`${goal?.icon} ${goal?.label}`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              );
            })}
          </Box>
        </Box>
        {onClose && (
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      {/* Progress */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" fontWeight="medium">
            Progress: {completedCount} of {totalCount} steps complete
          </Typography>
          <Typography variant="body2" color="primary.main" fontWeight="bold">
            {Math.round(progress)}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ height: 8, borderRadius: 1 }}
        />
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* AI Recommendations */}
      {session.aiRecommendations && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'info.50' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <TipIcon color="info" />
            <Typography variant="subtitle2" fontWeight="bold">
              AI Recommendations
            </Typography>
          </Box>
          <List dense disablePadding>
            {session.aiRecommendations.slice(0, 3).map((rec, index) => (
              <ListItem key={index} disableGutters>
                <ListItemIcon sx={{ minWidth: 24 }}>
                  <Typography variant="body2">•</Typography>
                </ListItemIcon>
                <ListItemText primary={rec} primaryTypographyProps={{ variant: 'body2' }} />
              </ListItem>
            ))}
          </List>
          {session.expectedTimeline && (
            <Box sx={{ mt: 1, display: 'flex', gap: 2 }}>
              <Chip
                size="small"
                icon={<ScheduleIcon />}
                label={`Typical: ${session.expectedTimeline.typical} months`}
                color="info"
                variant="outlined"
              />
            </Box>
          )}
        </Paper>
      )}

      {/* Checklist Steps */}
      <Paper sx={{ p: 3 }}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {session.checklist?.map((step, index) => {
            const StepIcon = getStepIcon(step.id);
            const isCompleted = step.completed;

            return (
              <Step key={step.id} completed={isCompleted}>
                <StepLabel
                  StepIconComponent={() => (
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: isCompleted ? 'success.main' : index === activeStep ? 'primary.main' : 'grey.300',
                        color: 'white'
                      }}
                    >
                      {isCompleted ? (
                        <CheckIcon fontSize="small" />
                      ) : typeof StepIcon === 'string' ? (
                        <Typography>{StepIcon}</Typography>
                      ) : (
                        <StepIcon fontSize="small" />
                      )}
                    </Box>
                  )}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography fontWeight={index === activeStep ? 'bold' : 'regular'}>
                      {step.title}
                    </Typography>
                    {step.required && !isCompleted && (
                      <Chip label="Required" size="small" color="error" variant="outlined" />
                    )}
                    {isCompleted && (
                      <Chip label="Complete" size="small" color="success" />
                    )}
                  </Box>
                </StepLabel>
                <StepContent>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {step.description}
                  </Typography>

                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    size="small"
                    placeholder="Add notes for this step..."
                    value={stepNotes[step.id] || ''}
                    onChange={(e) => setStepNotes({ ...stepNotes, [step.id]: e.target.value })}
                    sx={{ mb: 2 }}
                  />

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={loading ? <CircularProgress size={16} /> : <CheckIcon />}
                      onClick={() => completeStep(step.id)}
                      disabled={loading}
                    >
                      Mark Complete
                    </Button>
                    {index > 0 && (
                      <Button
                        variant="outlined"
                        onClick={() => setActiveStep(index - 1)}
                      >
                        Back
                      </Button>
                    )}
                  </Box>
                </StepContent>
              </Step>
            );
          })}
        </Stepper>

        {progress === 100 && (
          <Alert severity="success" sx={{ mt: 3 }}>
            🎉 Onboarding complete! {clientName} is all set to begin their credit repair journey.
          </Alert>
        )}
      </Paper>
    </Box>
  );
}
