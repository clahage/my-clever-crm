import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Alert,
  CircularProgress,
  Divider,
  Autocomplete,
  ToggleButton,
  ToggleButtonGroup,
  useTheme
} from '@mui/material';
import {
  Email as EmailIcon,
  Sms as SmsIcon,
  Phone as PhoneIcon,
  Send as SendIcon,
  AutoAwesome as AIIcon,
  ContentCopy as CopyIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Celebration as CelebrationIcon,
  Warning as WarningIcon,
  ThumbUp as ThumbUpIcon
} from '@mui/icons-material';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

const COMMUNICATION_TYPES = [
  { value: 'welcome', label: 'Welcome Message', icon: '👋', description: 'Warm welcome for new clients' },
  { value: 'dispute_update', label: 'Dispute Update', icon: '📋', description: 'Progress on disputes' },
  { value: 'score_milestone', label: 'Score Milestone', icon: '🎉', description: 'Celebrate score improvements' },
  { value: 'payment_reminder', label: 'Payment Reminder', icon: '💳', description: 'Friendly payment nudge' },
  { value: 'document_request', label: 'Document Request', icon: '📄', description: 'Request documents' },
  { value: 'monthly_update', label: 'Monthly Update', icon: '📊', description: 'Monthly progress report' },
  { value: 'reengagement', label: 'Re-engagement', icon: '🔄', description: 'Win back inactive clients' },
  { value: 'referral_request', label: 'Referral Request', icon: '🤝', description: 'Ask for referrals' },
  { value: 'auto_opportunity', label: 'Auto Opportunity', icon: '🚗', description: 'Auto financing offer' },
  { value: 'review_request', label: 'Review Request', icon: '⭐', description: 'Request online review' }
];

const CHANNELS = [
  { value: 'email', label: 'Email', icon: EmailIcon },
  { value: 'sms', label: 'SMS', icon: SmsIcon },
  { value: 'phone_script', label: 'Phone Script', icon: PhoneIcon }
];

function GeneratedMessage({ communication, channel, onCopy, onSend }) {
  const theme = useTheme();

  return (
    <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
      {channel === 'email' && communication.subject && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary">Subject</Typography>
          <Typography variant="subtitle1" fontWeight="bold">
            {communication.subject}
          </Typography>
        </Box>
      )}

      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary">
          {channel === 'phone_script' ? 'Script' : 'Message'}
        </Typography>
        <Paper
          variant="outlined"
          sx={{ p: 2, mt: 1, bgcolor: 'background.paper', whiteSpace: 'pre-wrap' }}
        >
          <Typography variant="body2">
            {communication.body}
          </Typography>
        </Paper>
      </Box>

      {communication.callToAction && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary">Call to Action</Typography>
          <Chip label={communication.callToAction} color="primary" sx={{ mt: 0.5 }} />
        </Box>
      )}

      {communication.followUpDate && (
        <Typography variant="caption" color="text.secondary">
          Suggested follow-up: {communication.followUpDate} days
        </Typography>
      )}

      <Divider sx={{ my: 2 }} />

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<CopyIcon />}
          onClick={() => {
            const text = channel === 'email'
              ? `Subject: ${communication.subject}\n\n${communication.body}`
              : communication.body;
            navigator.clipboard.writeText(text);
            onCopy?.();
          }}
        >
          Copy
        </Button>
        <Button
          variant="contained"
          startIcon={<SendIcon />}
          onClick={onSend}
        >
          Mark as Sent
        </Button>
      </Box>
    </Paper>
  );
}

function TemplateManager({ templates, onSave, onSelect }) {
  const [editingTemplate, setEditingTemplate] = useState(null);

  return (
    <Box>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Saved Templates
      </Typography>
      <List>
        {templates.map(template => (
          <ListItem
            key={template.id}
            button
            onClick={() => onSelect(template)}
            secondaryAction={
              <IconButton onClick={(e) => {
                e.stopPropagation();
                setEditingTemplate(template);
              }}>
                <EditIcon fontSize="small" />
              </IconButton>
            }
          >
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                {CHANNELS.find(c => c.value === template.channel)?.icon && (
                  React.createElement(CHANNELS.find(c => c.value === template.channel).icon, { fontSize: 'small' })
                )}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={template.name}
              secondary={`${template.type} • ${template.channel}`}
            />
          </ListItem>
        ))}
        {templates.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
            No saved templates yet
          </Typography>
        )}
      </List>
    </Box>
  );
}

export default function CommunicationCenter() {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [communicationType, setCommunicationType] = useState('');
  const [channel, setChannel] = useState('email');
  const [clientId, setClientId] = useState('');
  const [customContext, setCustomContext] = useState('');
  const [generatedCommunication, setGeneratedCommunication] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Additional context fields
  const [scoreIncrease, setScoreIncrease] = useState('');
  const [disputeCount, setDisputeCount] = useState('');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const getTemplates = httpsCallable(functions, 'getCommunicationTemplates');
      const result = await getTemplates({});
      setTemplates(result.data.templates || []);
    } catch (err) {
      console.error('Error loading templates:', err);
    }
  };

  const generateCommunication = async () => {
    if (!communicationType) {
      setError('Please select a communication type');
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedCommunication(null);

    try {
      const generateFn = httpsCallable(functions, 'generateClientCommunication');
      const result = await generateFn({
        clientId: clientId || null,
        communicationType,
        channel,
        context: {
          scoreIncrease: scoreIncrease ? parseInt(scoreIncrease) : null,
          disputeCount: disputeCount ? parseInt(disputeCount) : null,
          customContext
        }
      });

      setGeneratedCommunication(result.data.communication);
    } catch (err) {
      console.error('Error generating communication:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const logSentCommunication = async () => {
    try {
      const logFn = httpsCallable(functions, 'logSentCommunication');
      await logFn({
        clientId: clientId || null,
        channel,
        type: communicationType,
        content: generatedCommunication
      });
      setSuccessMessage('Communication logged successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error logging communication:', err);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          AI Communication Center
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Generate personalized client communications with AI assistance
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Left Panel - Configuration */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Create Communication
            </Typography>

            {/* Channel Selection */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>Channel</Typography>
              <ToggleButtonGroup
                value={channel}
                exclusive
                onChange={(e, v) => v && setChannel(v)}
                fullWidth
              >
                {CHANNELS.map(ch => (
                  <ToggleButton key={ch.value} value={ch.value}>
                    <ch.icon sx={{ mr: 1 }} fontSize="small" />
                    {ch.label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>

            {/* Communication Type */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Communication Type</InputLabel>
              <Select
                value={communicationType}
                label="Communication Type"
                onChange={(e) => setCommunicationType(e.target.value)}
              >
                {COMMUNICATION_TYPES.map(type => (
                  <MenuItem key={type.value} value={type.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>{type.icon}</span>
                      <Box>
                        <Typography variant="body2">{type.label}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {type.description}
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Context Fields */}
            <Typography variant="subtitle2" gutterBottom>Context (Optional)</Typography>

            {(communicationType === 'score_milestone' || communicationType === 'monthly_update') && (
              <TextField
                fullWidth
                label="Score Increase (points)"
                type="number"
                value={scoreIncrease}
                onChange={(e) => setScoreIncrease(e.target.value)}
                sx={{ mb: 2 }}
                placeholder="e.g., 25"
              />
            )}

            {(communicationType === 'dispute_update' || communicationType === 'monthly_update') && (
              <TextField
                fullWidth
                label="Active Disputes"
                type="number"
                value={disputeCount}
                onChange={(e) => setDisputeCount(e.target.value)}
                sx={{ mb: 2 }}
                placeholder="e.g., 5"
              />
            )}

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Additional Context"
              value={customContext}
              onChange={(e) => setCustomContext(e.target.value)}
              sx={{ mb: 3 }}
              placeholder="Any additional details to personalize the message..."
            />

            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={loading ? <CircularProgress size={20} /> : <AIIcon />}
              onClick={generateCommunication}
              disabled={loading || !communicationType}
            >
              Generate with AI
            </Button>
          </Paper>

          {/* Quick Templates */}
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={1}>
              {COMMUNICATION_TYPES.slice(0, 6).map(type => (
                <Grid item xs={6} key={type.value}>
                  <Button
                    fullWidth
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      setCommunicationType(type.value);
                      generateCommunication();
                    }}
                    sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                  >
                    <span style={{ marginRight: 8 }}>{type.icon}</span>
                    {type.label}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Right Panel - Generated Message */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, minHeight: 400 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Generated Message
            </Typography>

            {loading && (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
                <CircularProgress sx={{ mb: 2 }} />
                <Typography color="text.secondary">
                  AI is crafting your message...
                </Typography>
              </Box>
            )}

            {!loading && !generatedCommunication && (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <AIIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Ready to Generate
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Select a communication type and click "Generate with AI" to create a personalized message.
                </Typography>
              </Box>
            )}

            {!loading && generatedCommunication && (
              <GeneratedMessage
                communication={generatedCommunication}
                channel={channel}
                onCopy={() => setSuccessMessage('Copied to clipboard!')}
                onSend={logSentCommunication}
              />
            )}
          </Paper>

          {/* Tips */}
          <Paper sx={{ p: 2, mt: 3, bgcolor: 'info.50' }}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              💡 Communication Tips
            </Typography>
            <List dense disablePadding>
              <ListItem disableGutters>
                <ListItemText
                  primary="• Score milestones of 20+ points are great opportunities to request referrals"
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText
                  primary="• Send review requests after positive dispute resolutions"
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText
                  primary="• Auto opportunity messages work best for clients with 650+ scores"
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
