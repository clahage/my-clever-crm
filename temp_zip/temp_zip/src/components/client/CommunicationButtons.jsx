/**
 * CommunicationButtons.jsx
 * 
 * Purpose: Client-facing communication button interface
 * Provides quick access to different support channels
 * 
 * Features:
 * - Pre-configured buttons for different support types
 * - Modal dialog for message composition
 * - Real-time status updates
 * - AI-powered suggestions
 * - Success/failure notifications
 * - Mobile-responsive design
 * 
 * Dependencies:
 * - Material-UI
 * - communicationService.js
 * - Firebase Auth
 * 
 * Author: Claude (SpeedyCRM Team)
 * Last Updated: October 19, 2025
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  AlertTitle,
  CircularProgress,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Stack,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Fade,
  Zoom,
  Snackbar
} from '@mui/material';
import {
  AlertCircle as UrgentIcon,
  MessageCircle as QuestionIcon,
  DollarSign as BillingIcon,
  FileText as DisputeIcon,
  Phone as CallIcon,
  Star as FeedbackIcon,
  Send as SendIcon,
  X as CloseIcon,
  CheckCircle as SuccessIcon,
  Info as InfoIcon,
  Clock as ClockIcon
} from 'lucide-react';

import communicationService from '@/services/communicationService';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';

/**
 * Button configurations
 */
const BUTTON_CONFIGS = {
  urgent: {
    id: 'urgent',
    label: '🚨 Urgent Help Needed',
    description: 'Get immediate assistance for critical issues',
    icon: UrgentIcon,
    color: 'error',
    department: 'urgent',
    priority: 'urgent',
    placeholder: 'Please describe your urgent situation...',
    hint: 'Our team will be alerted immediately and respond ASAP.',
    aiProcess: false, // Always go to human
    estimatedResponse: 'Within 1 hour'
  },
  question: {
    id: 'question',
    label: '💬 Ask a Question',
    description: 'General questions about your account or services',
    icon: QuestionIcon,
    color: 'primary',
    department: 'support',
    priority: 'normal',
    placeholder: 'What would you like to know?',
    hint: 'Our AI assistant may be able to answer immediately!',
    aiProcess: true,
    estimatedResponse: '5-15 minutes'
  },
  billing: {
    id: 'billing',
    label: '💳 Billing Question',
    description: 'Questions about payments, invoices, or charges',
    icon: BillingIcon,
    color: 'success',
    department: 'billing',
    priority: 'normal',
    placeholder: 'How can we help with billing?',
    hint: 'Get quick answers about your account and payments.',
    aiProcess: true,
    estimatedResponse: '15-30 minutes'
  },
  dispute: {
    id: 'dispute',
    label: '📋 Dispute Status',
    description: 'Check on your credit dispute progress',
    icon: DisputeIcon,
    color: 'info',
    department: 'disputes',
    priority: 'normal',
    placeholder: 'Which dispute would you like to check on?',
    hint: 'Get real-time updates on your dispute status.',
    aiProcess: true,
    estimatedResponse: '10-20 minutes'
  },
  call: {
    id: 'call',
    label: '📞 Schedule a Call',
    description: 'Request a phone consultation',
    icon: CallIcon,
    color: 'warning',
    department: 'support',
    priority: 'normal',
    placeholder: 'What would you like to discuss? When are you available?',
    hint: 'We\'ll confirm a time within 24 hours.',
    aiProcess: true,
    estimatedResponse: 'Within 24 hours'
  },
  feedback: {
    id: 'feedback',
    label: '⭐ Share Feedback',
    description: 'Tell us how we\'re doing',
    icon: FeedbackIcon,
    color: 'secondary',
    department: 'support',
    priority: 'low',
    placeholder: 'We\'d love to hear your thoughts!',
    hint: 'Your feedback helps us improve our service.',
    aiProcess: true,
    estimatedResponse: '1-2 business days'
  }
};

/**
 * Main CommunicationButtons Component
 */
const CommunicationButtons = ({ 
  clientId = null,
  clientEmail = null,
  clientName = null,
  layout = 'grid', // 'grid', 'list', 'compact'
  showDescriptions = true,
  onSuccess = null
}) => {
  const { user } = useAuth();
  const { showSuccess, showError, showInfo } = useNotification();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedButton, setSelectedButton] = useState(null);
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);

  // Get client info from auth if not provided
  const finalClientId = clientId || user?.uid;
  const finalClientEmail = clientEmail || user?.email;
  const finalClientName = clientName || user?.displayName || 'Valued Client';

  /**
   * Handle button click - open dialog
   */
  const handleButtonClick = (buttonConfig) => {
    setSelectedButton(buttonConfig);
    setSubject(''); // Reset
    setMessage(''); // Reset
    setResult(null);
    setDialogOpen(true);
  };

  /**
   * Handle dialog close
   */
  const handleClose = () => {
    if (!sending) {
      setDialogOpen(false);
      setSelectedButton(null);
      setMessage('');
      setSubject('');
    }
  };

  /**
   * Send message
   */
  const handleSend = async () => {
    if (!message.trim()) {
      showError('Please enter a message');
      return;
    }

    setSending(true);

    try {
      // Generate subject if not provided
      const finalSubject = subject.trim() || `${selectedButton.label} - ${finalClientName}`;

      // Send via communication service
      const response = await communicationService.sendClientMessage({
        clientId: finalClientId,
        clientEmail: finalClientEmail,
        clientName: finalClientName,
        department: selectedButton.department,
        subject: finalSubject,
        message: message.trim(),
        priority: selectedButton.priority,
        aiProcess: selectedButton.aiProcess,
        metadata: {
          buttonId: selectedButton.id,
          source: 'client_portal'
        }
      });

      console.log('✅ Message sent:', response);

      // Show result
      setResult(response);
      setShowResult(true);

      // Show success notification
      if (response.autoResponse) {
        showSuccess('AI responded to your message! Check your email.');
      } else if (response.action === 'urgent_ticket_created') {
        showSuccess('Urgent ticket created! Our team has been alerted.');
      } else {
        showSuccess('Message sent! We\'ll respond soon.');
      }

      // Call success callback
      if (onSuccess) {
        onSuccess(response);
      }

      // Close dialog after 2 seconds
      setTimeout(() => {
        setDialogOpen(false);
        setMessage('');
        setSubject('');
      }, 2000);

    } catch (error) {
      console.error('Failed to send message:', error);
      showError(error.message || 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  /**
   * Render button based on layout
   */
  const renderButton = (config) => {
    const Icon = config.icon;

    if (layout === 'compact') {
      return (
        <Tooltip key={config.id} title={config.description} arrow>
          <IconButton
            color={config.color}
            onClick={() => handleButtonClick(config)}
            sx={{
              border: 2,
              borderColor: `${config.color}.main`,
              '&:hover': {
                backgroundColor: `${config.color}.light`,
                transform: 'scale(1.05)'
              },
              transition: 'all 0.2s'
            }}
          >
            <Icon size={24} />
          </IconButton>
        </Tooltip>
      );
    }

    if (layout === 'list') {
      return (
        <Card
          key={config.id}
          sx={{
            mb: 2,
            cursor: 'pointer',
            transition: 'all 0.2s',
            '&:hover': {
              transform: 'translateX(8px)',
              boxShadow: 3
            }
          }}
          onClick={() => handleButtonClick(config)}
        >
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 60,
                height: 60,
                borderRadius: 2,
                bgcolor: `${config.color}.light`,
                color: `${config.color}.main`
              }}
            >
              <Icon size={32} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" gutterBottom>
                {config.label}
              </Typography>
              {showDescriptions && (
                <Typography variant="body2" color="text.secondary">
                  {config.description}
                </Typography>
              )}
              <Chip
                label={`~${config.estimatedResponse}`}
                size="small"
                icon={<ClockIcon size={14} />}
                sx={{ mt: 1 }}
              />
            </Box>
          </CardContent>
        </Card>
      );
    }

    // Default: grid layout
    return (
      <Card
        key={config.id}
        sx={{
          cursor: 'pointer',
          transition: 'all 0.2s',
          height: '100%',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 4
          }
        }}
        onClick={() => handleButtonClick(config)}
      >
        <CardContent sx={{ textAlign: 'center', py: 3 }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: `${config.color}.light`,
              color: `${config.color}.main`,
              mb: 2
            }}
          >
            <Icon size={40} />
          </Box>
          <Typography variant="h6" gutterBottom>
            {config.label}
          </Typography>
          {showDescriptions && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {config.description}
            </Typography>
          )}
          <Chip
            label={`~${config.estimatedResponse}`}
            size="small"
            icon={<ClockIcon size={14} />}
            color={config.color}
            variant="outlined"
          />
        </CardContent>
      </Card>
    );
  };

  /**
   * Get grid columns based on layout
   */
  const getGridColumns = () => {
    if (layout === 'compact') return { xs: 12, sm: 'auto' };
    if (layout === 'list') return { xs: 12 };
    return { xs: 12, sm: 6, md: 4 };
  };

  return (
    <Box>
      {/* Communication Buttons */}
      <Box
        sx={{
          display: layout === 'compact' ? 'flex' : 'grid',
          gap: 2,
          gridTemplateColumns: {
            xs: '1fr',
            sm: layout === 'list' ? '1fr' : 'repeat(2, 1fr)',
            md: layout === 'list' ? '1fr' : 'repeat(3, 1fr)'
          },
          flexWrap: layout === 'compact' ? 'wrap' : 'nowrap',
          justifyContent: layout === 'compact' ? 'center' : 'flex-start'
        }}
      >
        {Object.values(BUTTON_CONFIGS).map(config => renderButton(config))}
      </Box>

      {/* Message Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Zoom}
      >
        {selectedButton && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 50,
                    height: 50,
                    borderRadius: '50%',
                    bgcolor: `${selectedButton.color}.light`,
                    color: `${selectedButton.color}.main`
                  }}
                >
                  <selectedButton.icon size={28} />
                </Box>
                <Box flex={1}>
                  <Typography variant="h6">{selectedButton.label}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedButton.description}
                  </Typography>
                </Box>
                <IconButton onClick={handleClose} disabled={sending}>
                  <CloseIcon size={20} />
                </IconButton>
              </Box>
            </DialogTitle>

            <Divider />

            <DialogContent>
              {/* Hint Alert */}
              <Alert severity="info" icon={<InfoIcon size={20} />} sx={{ mb: 3 }}>
                {selectedButton.hint}
              </Alert>

              {/* Success Result */}
              {showResult && result && (
                <Fade in={showResult}>
                  <Alert severity="success" icon={<SuccessIcon size={20} />} sx={{ mb: 3 }}>
                    <AlertTitle>Message Sent!</AlertTitle>
                    {result.message}
                    {result.ticketId && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Ticket #{result.ticketId}
                      </Typography>
                    )}
                  </Alert>
                </Fade>
              )}

              {/* Subject Field (optional) */}
              {!showResult && (
                <TextField
                  fullWidth
                  label="Subject (optional)"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  disabled={sending}
                  sx={{ mb: 2 }}
                  placeholder={`Quick summary of your ${selectedButton.id}`}
                />
              )}

              {/* Message Field */}
              {!showResult && (
                <TextField
                  fullWidth
                  multiline
                  rows={8}
                  label="Your Message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={sending}
                  placeholder={selectedButton.placeholder}
                  required
                  error={!message.trim() && message.length > 0}
                  helperText={
                    !message.trim() && message.length > 0
                      ? 'Message cannot be empty'
                      : `${message.length} characters`
                  }
                />
              )}

              {/* Response Time */}
              {!showResult && (
                <Box display="flex" alignItems="center" gap={1} sx={{ mt: 2 }}>
                  <ClockIcon size={16} color="#666" />
                  <Typography variant="body2" color="text.secondary">
                    Estimated response time: {selectedButton.estimatedResponse}
                  </Typography>
                </Box>
              )}
            </DialogContent>

            {!showResult && (
              <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button
                  onClick={handleClose}
                  disabled={sending}
                  variant="outlined"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSend}
                  disabled={!message.trim() || sending}
                  variant="contained"
                  color={selectedButton.color}
                  startIcon={sending ? <CircularProgress size={20} /> : <SendIcon size={20} />}
                >
                  {sending ? 'Sending...' : 'Send Message'}
                </Button>
              </DialogActions>
            )}
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default CommunicationButtons;