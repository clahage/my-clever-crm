/**
 * WORKFLOW STEP EDITOR
 *
 * Purpose:
 * Visual editor for workflow steps. Allows live editing during testing
 * or building workflows without writing JSON.
 *
 * What It Does:
 * - Visual form for all step types
 * - JSON editor for advanced users
 * - Real-time validation
 * - Step type templates
 * - Configuration helpers
 *
 * Why It's Important:
 * - Edit steps mid-test without restarting
 * - Build workflows visually (no coding)
 * - Prevent configuration errors
 * - Quick step duplication
 *
 * Used in: WorkflowTestingSimulator, Workflow Builder
 *
 * Created: 2025-12-05
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
  Tabs,
  Tab,
  Grid,
  Switch,
  FormControlLabel,
  Chip,
  Alert
} from '@mui/material';
import { Code as CodeIcon, Edit as EditIcon } from '@mui/icons-material';

// ============================================================================
// STEP TYPES
// ============================================================================

const STEP_TYPES = [
  { value: 'email_send', label: 'Send Email', icon: '📧' },
  { value: 'sms_send', label: 'Send SMS', icon: '💬' },
  { value: 'wait', label: 'Wait/Delay', icon: '⏰' },
  { value: 'conditional_branch', label: 'Conditional Branch', icon: '🔀' },
  { value: 'ai_analysis', label: 'AI Analysis', icon: '🤖' },
  { value: 'task_create', label: 'Create Task', icon: '✓' },
  { value: 'role_assignment', label: 'Assign Role', icon: '👤' },
  { value: 'idiq_enrollment', label: 'IDIQ Enrollment', icon: '📊' },
  { value: 'service_recommendation', label: 'Service Recommendation', icon: '💡' },
  { value: 'update_contact', label: 'Update Contact', icon: '📝' },
  { value: 'workflow_complete', label: 'Complete Workflow', icon: '🎉' }
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function WorkflowStepEditor({
  step,
  stepIndex,
  open,
  onClose,
  onSave
}) {
  const [editMode, setEditMode] = useState('visual'); // 'visual' or 'json'
  const [editedStep, setEditedStep] = useState(step || getDefaultStep());
  const [jsonError, setJsonError] = useState(null);

  useEffect(() => {
    if (step) {
      setEditedStep(step);
    }
  }, [step]);

  const handleSave = () => {
    if (editMode === 'json') {
      try {
        const parsed = JSON.parse(editedStep.jsonString || '{}');
        onSave({ ...editedStep, config: parsed });
      } catch (error) {
        setJsonError('Invalid JSON');
        return;
      }
    } else {
      onSave(editedStep);
    }
  };

  const handleFieldChange = (field, value) => {
    setEditedStep(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleConfigChange = (field, value) => {
    setEditedStep(prev => ({
      ...prev,
      config: {
        ...prev.config,
        [field]: value
      }
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {stepIndex !== null ? `Edit Step ${stepIndex + 1}` : 'Add New Step'}
      </DialogTitle>

      <DialogContent>
        {/* Edit Mode Toggle */}
        <Tabs value={editMode} onChange={(e, v) => setEditMode(v)} sx={{ mb: 2 }}>
          <Tab value="visual" label="Visual Editor" icon={<EditIcon />} />
          <Tab value="json" label="JSON Editor" icon={<CodeIcon />} />
        </Tabs>

        {/* Visual Editor */}
        {editMode === 'visual' && (
          <Box>
            {/* Basic Fields */}
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Step Type</InputLabel>
                  <Select
                    value={editedStep.type || ''}
                    onChange={(e) => handleFieldChange('type', e.target.value)}
                    label="Step Type"
                  >
                    {STEP_TYPES.map(type => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Step Name"
                  value={editedStep.name || ''}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  placeholder="e.g., Send Welcome Email"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description (optional)"
                  value={editedStep.description || ''}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  multiline
                  rows={2}
                  placeholder="What does this step do?"
                />
              </Grid>
            </Grid>

            {/* Type-Specific Configuration */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Step Configuration
              </Typography>

              {renderConfigEditor(editedStep.type, editedStep.config || {}, handleConfigChange)}
            </Box>
          </Box>
        )}

        {/* JSON Editor */}
        {editMode === 'json' && (
          <Box>
            <Alert severity="info" sx={{ mb: 2 }}>
              Edit the step configuration as JSON. Changes here override visual editor.
            </Alert>

            {jsonError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {jsonError}
              </Alert>
            )}

            <TextField
              fullWidth
              multiline
              rows={20}
              value={editedStep.jsonString || JSON.stringify(editedStep.config || {}, null, 2)}
              onChange={(e) => {
                setJsonError(null);
                setEditedStep(prev => ({
                  ...prev,
                  jsonString: e.target.value
                }));
              }}
              sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ============================================================================
// CONFIG EDITORS
// ============================================================================

function renderConfigEditor(type, config, onChange) {
  switch (type) {
    case 'email_send':
      return <EmailConfigEditor config={config} onChange={onChange} />;
    case 'sms_send':
      return <SMSConfigEditor config={config} onChange={onChange} />;
    case 'wait':
      return <WaitConfigEditor config={config} onChange={onChange} />;
    case 'conditional_branch':
      return <BranchConfigEditor config={config} onChange={onChange} />;
    case 'task_create':
      return <TaskConfigEditor config={config} onChange={onChange} />;
    case 'ai_analysis':
      return <AIConfigEditor config={config} onChange={onChange} />;
    default:
      return (
        <Alert severity="info">
          No visual editor for this step type. Use JSON editor.
        </Alert>
      );
  }
}

function EmailConfigEditor({ config, onChange }) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Email Template"
          value={config.template || ''}
          onChange={(e) => onChange('template', e.target.value)}
          placeholder="e.g., welcome_standard"
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Subject Line"
          value={config.subject || ''}
          onChange={(e) => onChange('subject', e.target.value)}
          placeholder="Use {{firstName}} for personalization"
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={6}
          label="Email Body"
          value={config.body || ''}
          onChange={(e) => onChange('body', e.target.value)}
          placeholder="Email content..."
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="CTA Text"
          value={config.cta?.text || ''}
          onChange={(e) => onChange('cta', { ...config.cta, text: e.target.value })}
          placeholder="e.g., Get My Free Report"
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="CTA URL"
          value={config.cta?.url || ''}
          onChange={(e) => onChange('cta', { ...config.cta, url: e.target.value })}
          placeholder="e.g., {{idiqEnrollmentLink}}"
        />
      </Grid>

      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Switch
              checked={config.personalize !== false}
              onChange={(e) => onChange('personalize', e.target.checked)}
            />
          }
          label="Enable personalization"
        />
      </Grid>
    </Grid>
  );
}

function SMSConfigEditor({ config, onChange }) {
  const charCount = (config.message || '').length;
  const segments = Math.ceil(charCount / 160);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={4}
          label="SMS Message"
          value={config.message || ''}
          onChange={(e) => onChange('message', e.target.value)}
          placeholder="Use {{firstName}} for personalization. Include opt-out language."
        />

        <Box display="flex" justifyContent="space-between" sx={{ mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {charCount} characters / {segments} segment{segments > 1 ? 's' : ''}
          </Typography>
          {!config.message?.toLowerCase().includes('stop') && (
            <Chip label="⚠️ Missing opt-out" size="small" color="warning" />
          )}
        </Box>
      </Grid>

      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Switch
              checked={config.includeLink === true}
              onChange={(e) => onChange('includeLink', e.target.checked)}
            />
          }
          label="Include link"
        />
      </Grid>
    </Grid>
  );
}

function WaitConfigEditor({ config, onChange }) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          type="number"
          label="Duration"
          value={config.duration || 1}
          onChange={(e) => onChange('duration', parseInt(e.target.value))}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel>Unit</InputLabel>
          <Select
            value={config.unit || 'hours'}
            onChange={(e) => onChange('unit', e.target.value)}
            label="Unit"
          >
            <MenuItem value="minutes">Minutes</MenuItem>
            <MenuItem value="hours">Hours</MenuItem>
            <MenuItem value="days">Days</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12}>
        <Alert severity="info">
          In test mode, this wait can be accelerated or skipped entirely.
        </Alert>
      </Grid>
    </Grid>
  );
}

function BranchConfigEditor({ config, onChange }) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Condition"
          value={config.condition || ''}
          onChange={(e) => onChange('condition', e.target.value)}
          placeholder="e.g., contact.idiqStatus === 'enrolled'"
          helperText="JavaScript expression that evaluates to true/false"
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="True Path (next step if true)"
          value={config.truePath || ''}
          onChange={(e) => onChange('truePath', e.target.value)}
          placeholder="e.g., step_10"
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="False Path (next step if false)"
          value={config.falsePath || ''}
          onChange={(e) => onChange('falsePath', e.target.value)}
          placeholder="e.g., step_20"
        />
      </Grid>
    </Grid>
  );
}

function TaskConfigEditor({ config, onChange }) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Task Title"
          value={config.title || ''}
          onChange={(e) => onChange('title', e.target.value)}
          placeholder="e.g., Call new lead: {{firstName}} {{lastName}}"
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Description"
          value={config.description || ''}
          onChange={(e) => onChange('description', e.target.value)}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel>Assign To</InputLabel>
          <Select
            value={config.assignTo || 'christopher'}
            onChange={(e) => onChange('assignTo', e.target.value)}
            label="Assign To"
          >
            <MenuItem value="christopher">Christopher</MenuItem>
            <MenuItem value="laurie">Laurie</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel>Priority</InputLabel>
          <Select
            value={config.priority || 'medium'}
            onChange={(e) => onChange('priority', e.target.value)}
            label="Priority"
          >
            <MenuItem value="urgent">🔴 Urgent</MenuItem>
            <MenuItem value="high">🟠 High</MenuItem>
            <MenuItem value="medium">🟡 Medium</MenuItem>
            <MenuItem value="low">🟢 Low</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Due Date"
          value={config.dueDate || ''}
          onChange={(e) => onChange('dueDate', e.target.value)}
          placeholder="e.g., +24 hours, +3 days"
          helperText="Relative time (e.g., +24 hours) or absolute date"
        />
      </Grid>
    </Grid>
  );
}

function AIConfigEditor({ config, onChange }) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <FormControl fullWidth>
          <InputLabel>Analysis Type</InputLabel>
          <Select
            value={config.analysisType || 'full_profile'}
            onChange={(e) => onChange('analysisType', e.target.value)}
            label="Analysis Type"
          >
            <MenuItem value="full_profile">Full Profile Analysis</MenuItem>
            <MenuItem value="quick_score">Quick Lead Score</MenuItem>
            <MenuItem value="engagement_only">Engagement Analysis Only</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Switch
              checked={config.includeLeadScore !== false}
              onChange={(e) => onChange('includeLeadScore', e.target.checked)}
            />
          }
          label="Include lead score"
        />
      </Grid>

      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Switch
              checked={config.includeRecommendations === true}
              onChange={(e) => onChange('includeRecommendations', e.target.checked)}
            />
          }
          label="Include service tier recommendation"
        />
      </Grid>

      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Switch
              checked={config.returnReasoning === true}
              onChange={(e) => onChange('returnReasoning', e.target.checked)}
            />
          }
          label="Return detailed reasoning (for testing)"
        />
      </Grid>
    </Grid>
  );
}

// ============================================================================
// HELPERS
// ============================================================================

function getDefaultStep() {
  return {
    id: `step_${Date.now()}`,
    name: '',
    type: 'email_send',
    description: '',
    config: {}
  };
}
