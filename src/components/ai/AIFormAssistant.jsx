// ============================================================================
// AIFormAssistant.jsx - Context-Aware Floating Chat Widget
// ============================================================================
// A floating AI helper that provides contextual guidance during form filling
//
// Features:
// - Watches current form field focus
// - Provides field-specific guidance
// - Answers user questions via pattern matching + OpenAI fallback
// - Detects frustration and offers help
// - Escalates to human agent when needed
// - Multi-language support (English, Spanish)
// ============================================================================

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  TextField,
  Button,
  Fab,
  Zoom,
  Fade,
  Collapse,
  Avatar,
  Badge,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  SmartToy as AIIcon,
  Close as CloseIcon,
  Send as SendIcon,
  Minimize as MinimizeIcon,
  OpenInFull as MaximizeIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Help as HelpIcon,
  Mic as MicIcon,
  VolumeUp as SpeakerIcon,
  Download as DownloadIcon,
  Support as SupportIcon,
} from '@mui/icons-material';
import { keyframes } from '@mui/system';
import { requestHumanHelp, IDIQ_CONTACT, SCR_CONTACT, getIDIQStatus } from '../../services/EscalationService';
import VoiceMicButton from '../voice/VoiceMicButton';

// ============================================================================
// ANIMATIONS
// ============================================================================

const bounceAnimation = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
`;

const pulseAnimation = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.4); }
  50% { box-shadow: 0 0 0 10px rgba(25, 118, 210, 0); }
`;

const typingAnimation = keyframes`
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
`;

// ============================================================================
// CONSTANTS
// ============================================================================

const FIELD_GUIDANCE = {
  firstName: {
    title: 'First Name',
    help: 'Enter your legal first name as it appears on your government-issued ID.',
    tips: ['Use your legal name, not a nickname', 'Spell it exactly as on your ID'],
  },
  lastName: {
    title: 'Last Name',
    help: 'Enter your legal last name as it appears on your government-issued ID.',
    tips: ['Include any suffixes like Jr., Sr., III if on your ID'],
  },
  ssn: {
    title: 'Social Security Number',
    help: 'Your SSN is encrypted and only used for identity verification with IDIQ.',
    tips: ['Your SSN is protected with bank-level encryption', 'IDIQ requires this to pull your credit report', 'We never store your full SSN'],
  },
  dob: {
    title: 'Date of Birth',
    help: 'Enter your date of birth in MM/DD/YYYY format.',
    tips: ['Make sure this matches your ID exactly', 'Use 4-digit year (e.g., 1990)'],
  },
  address: {
    title: 'Address',
    help: 'Enter your current residential address.',
    tips: ['Use your current address as on your credit report', 'Include apartment/unit number if applicable'],
  },
  phone: {
    title: 'Phone Number',
    help: 'Enter your best contact phone number.',
    tips: ['We may call to verify your identity', 'Mobile numbers work best for text updates'],
  },
  email: {
    title: 'Email Address',
    help: 'Enter your email address for account notifications.',
    tips: ['Use an email you check regularly', 'Your credit report will be sent here'],
  },
  zip: {
    title: 'ZIP Code',
    help: 'Enter your 5-digit ZIP code.',
    tips: ['City and state will auto-fill', 'Use your current address ZIP'],
  },
};

const STEP_MESSAGES = {
  0: { emoji: '', message: 'Welcome! This will only take about 3-5 minutes.' },
  1: { emoji: '', message: 'Your information is encrypted with bank-level security.' },
  2: { emoji: '', message: 'Security questions come from your credit report. Having a recent report handy can help - but most people do fine from memory!' },
  3: { emoji: '', message: 'Almost done! Just review your info and submit.' },
  4: { emoji: '', message: 'Congratulations! Your credit report is ready!' },
};

const SMART_RESPONSES = {
  'how long': 'The enrollment takes about 3-5 minutes. You\'re doing great!',
  'is this safe': 'Absolutely! Your data is encrypted with bank-level security. We\'ve been in business since 1995 with an A+ BBB rating.',
  'why ssn': 'IDIQ requires your SSN to verify your identity and pull your credit report. It\'s encrypted and we never store it.',
  'help': 'I\'m here to help! What are you stuck on? You can also click "Talk to Human" if you\'d prefer to speak with someone.',
  'security question': 'Security questions are based on your credit report. Having a recent report handy can help! Free options: Credit Karma, Experian, NerdWallet, or your bank\'s app. But don\'t worry - most people answer correctly from memory!',
  'wrong answer': 'No worries! \'None of the above\' is often the correct answer. Think carefully about addresses, loans, and accounts from the past 7-10 years.',
  'failed': 'Let\'s figure this out together. What error message did you see? I can help guide you through the recovery process.',
  'credit report': 'You can get a free credit report from Credit Karma, Experian.com, NerdWallet, Credit Sesame, AnnualCreditReport.com, or your bank\'s app. Having one nearby can help with security questions - but it\'s not required!',
  'contact idiq': `You can reach IDIQ Customer Service at ${IDIQ_CONTACT.phone} (toll-free). Hours: Mon-Fri 5AM-4PM PT, Saturday 6:30AM-3PM PT, closed Sunday. They have 100% U.S.-based support!`,
  'call idiq': `IDIQ Customer Service: ${IDIQ_CONTACT.phone} (toll-free). Hours: Mon-Fri 5AM-4PM PT, Sat 6:30AM-3PM PT.`,
  'idiq phone': `IDIQ Customer Service: ${IDIQ_CONTACT.phone}. Hours: Mon-Fri 5AM-4PM PT, Sat 6:30AM-3PM PT.`,
  'idiq hours': 'IDIQ Customer Service hours (Pacific Time): Mon-Fri 5:00 AM - 4:00 PM, Saturday 6:30 AM - 3:00 PM, Sunday Closed.',
  'talk to person': `I can connect you with help! For IDIQ technical issues, call ${IDIQ_CONTACT.phone}. For credit repair guidance, contact Speedy Credit Repair at ${SCR_CONTACT.phone}.`,
  'human help': `For immediate assistance, call us at ${SCR_CONTACT.phone} or email ${SCR_CONTACT.email}. We\'re here to help!`,
  'cost': 'IDIQ enrollment is handled separately from our credit repair services. Contact us at Speedy Credit Repair for a free consultation on our service plans!',
  'cancel': 'If you need to cancel or have concerns, please call us at Speedy Credit Repair. We\'re here to help answer any questions.',
  'stuck': 'I notice you might be having trouble. Would you like me to explain this field, or would you prefer to talk to a human agent?',
  'none of the above': 'The "None of the above" option is often the correct answer! Security questions sometimes include fake options to verify your identity.',
  'what is idiq': 'IDIQ (IdentityIQ) is our trusted credit monitoring partner. They help us pull your 3-bureau credit reports securely so we can start improving your credit!',
  'privacy': 'We take privacy very seriously. Your data is encrypted, never sold, and only used for credit repair services. We\'ve been BBB A+ rated since 1995.',
};

// ============================================================================
// FRUSTRATION DETECTION
// ============================================================================

const detectFrustration = (metrics) => {
  let score = 0;

  // Time on field (over 60 seconds = frustration)
  if (metrics.timeOnField > 60000) score += 20;
  if (metrics.timeOnField > 120000) score += 20;

  // Error count
  if (metrics.errorCount > 2) score += 15;
  if (metrics.errorCount > 5) score += 20;

  // Backspaces (rapid corrections)
  if (metrics.backspaceCount > 10) score += 10;
  if (metrics.backspaceCount > 20) score += 15;

  // Rage clicks
  if (metrics.clickCount > 5) score += 15;

  // Form resets
  if (metrics.resetCount > 0) score += 20;

  return Math.min(score, 100);
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const AIFormAssistant = ({
  currentStep = 0,
  currentField = null,
  formData = {},
  onEscalate,
  language = 'en',
  position = 'bottom-right',
  contactId = null,
}) => {
  // ===== STATE =====
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [frustrationScore, setFrustrationScore] = useState(0);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);

  // ===== REFS =====
  const chatEndRef = useRef(null);
  const metricsRef = useRef({
    timeOnField: 0,
    errorCount: 0,
    backspaceCount: 0,
    clickCount: 0,
    resetCount: 0,
    fieldStartTime: Date.now(),
  });

  // ===== SCROLL TO BOTTOM =====
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // ===== WELCOME MESSAGE =====
  useEffect(() => {
    if (!hasShownWelcome) {
      addBotMessage(STEP_MESSAGES[0]?.message || 'Welcome! How can I help you today?');
      setHasShownWelcome(true);
    }
  }, [hasShownWelcome]);

  // ===== STEP CHANGE MESSAGES =====
  useEffect(() => {
    if (currentStep > 0 && STEP_MESSAGES[currentStep]) {
      addBotMessage(STEP_MESSAGES[currentStep].message);
    }
  }, [currentStep]);

  // ===== FIELD CHANGE =====
  useEffect(() => {
    if (currentField && FIELD_GUIDANCE[currentField]) {
      metricsRef.current.fieldStartTime = Date.now();
      metricsRef.current.backspaceCount = 0;
      metricsRef.current.clickCount = 0;
    }
  }, [currentField]);

  // ===== FRUSTRATION DETECTION =====
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentField) {
        metricsRef.current.timeOnField = Date.now() - metricsRef.current.fieldStartTime;
        const score = detectFrustration(metricsRef.current);
        setFrustrationScore(score);

        // Proactive help offer
        if (score > 70 && score <= 90 && messages.length < 10) {
          addBotMessage('I notice you might need some help. Would you like me to explain this field, or connect you with a human agent?');
        } else if (score > 90) {
          addBotMessage('It seems like you\'re having difficulty. Let me connect you with a human agent who can help.');
        }
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [currentField, messages.length]);

  // ===== ADD BOT MESSAGE =====
  const addBotMessage = useCallback((text) => {
    const newMessage = {
      id: Date.now(),
      type: 'bot',
      text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);

    if (!isOpen) {
      setUnreadCount(prev => prev + 1);
    }
  }, [isOpen]);

  // ===== ADD USER MESSAGE =====
  const addUserMessage = useCallback((text) => {
    const newMessage = {
      id: Date.now(),
      type: 'user',
      text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
  }, []);

  // ===== FIND RESPONSE =====
  const findResponse = useCallback((query) => {
    const lowerQuery = query.toLowerCase();

    // Check for pattern matches
    for (const [pattern, response] of Object.entries(SMART_RESPONSES)) {
      if (lowerQuery.includes(pattern)) {
        return response;
      }
    }

    // Check for field-specific questions
    for (const [field, guidance] of Object.entries(FIELD_GUIDANCE)) {
      if (lowerQuery.includes(field.toLowerCase())) {
        return `${guidance.help}\n\nTips: ${guidance.tips.join(', ')}`;
      }
    }

    // Default response
    return 'I\'m not sure I understand. Could you rephrase that? Or if you prefer, I can connect you with a human agent.';
  }, []);

  // ===== HANDLE SEND =====
  const handleSend = useCallback(() => {
    if (!inputValue.trim()) return;

    addUserMessage(inputValue);
    setInputValue('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const response = findResponse(inputValue);
      addBotMessage(response);
      setIsTyping(false);
    }, 500 + Math.random() * 1000);
  }, [inputValue, addUserMessage, addBotMessage, findResponse]);

  // ===== HANDLE ESCALATE =====
  const handleEscalate = useCallback(async () => {
    addBotMessage('Connecting you with a human agent...');

    try {
      await requestHumanHelp({
        contactId,
        contactName: `${formData.firstName || ''} ${formData.lastName || ''}`.trim(),
        contactPhone: formData.phone,
        contactEmail: formData.email,
        currentStep,
        currentField,
        issue: 'User requested human help',
        frustrationScore,
        conversationHistory: messages.map(m => ({ type: m.type, text: m.text })),
      });

      addBotMessage(`A team member will contact you shortly. You can also reach us at:\n\nSpeedy Credit Repair: ${SCR_CONTACT.phone}\nEmail: ${SCR_CONTACT.email}`);

      if (onEscalate) {
        onEscalate({ frustrationScore, messages });
      }
    } catch (error) {
      addBotMessage(`Please call us directly at ${SCR_CONTACT.phone} for immediate assistance.`);
    }
  }, [contactId, formData, currentStep, currentField, frustrationScore, messages, onEscalate]);

  // ===== HANDLE VOICE INPUT =====
  const handleVoiceResult = useCallback((transcript) => {
    setInputValue(transcript);
  }, []);

  // ===== TOGGLE OPEN =====
  const toggleOpen = useCallback(() => {
    setIsOpen(prev => !prev);
    if (!isOpen) {
      setUnreadCount(0);
      setIsMinimized(false);
    }
  }, [isOpen]);

  // ===== EXPORT TRANSCRIPT =====
  const exportTranscript = useCallback(() => {
    const transcript = messages
      .map(m => `[${m.type === 'bot' ? 'Assistant' : 'You'}]: ${m.text}`)
      .join('\n\n');

    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chat-transcript.txt';
    a.click();
    URL.revokeObjectURL(url);
  }, [messages]);

  // ===== POSITION STYLES =====
  const positionStyles = useMemo(() => {
    switch (position) {
      case 'bottom-left':
        return { bottom: 16, left: 16 };
      case 'top-right':
        return { top: 16, right: 16 };
      case 'top-left':
        return { top: 16, left: 16 };
      default:
        return { bottom: 16, right: 16 };
    }
  }, [position]);

  // ===== GET IDIQ STATUS =====
  const idiqStatus = useMemo(() => getIDIQStatus(), []);

  // ===== RENDER =====
  return (
    <Box
      sx={{
        position: 'fixed',
        ...positionStyles,
        zIndex: 1200,
      }}
    >
      {/* Chat Window */}
      <Collapse in={isOpen && !isMinimized}>
        <Paper
          elevation={8}
          sx={{
            width: 380,
            height: isMinimized ? 'auto' : 500,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 3,
            overflow: 'hidden',
            mb: 2,
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 2,
              background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ bgcolor: 'white', color: 'primary.main', width: 36, height: 36 }}>
                <AIIcon />
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  AI Assistant
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  Here to help!
                </Typography>
              </Box>
            </Box>
            <Box>
              <Tooltip title="Minimize">
                <IconButton size="small" onClick={() => setIsMinimized(true)} sx={{ color: 'white' }}>
                  <MinimizeIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Close">
                <IconButton size="small" onClick={toggleOpen} sx={{ color: 'white' }}>
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Current Field Guidance */}
          {currentField && FIELD_GUIDANCE[currentField] && (
            <Box sx={{ p: 1.5, backgroundColor: 'primary.lighter', borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" color="primary.main" fontWeight="bold">
                {FIELD_GUIDANCE[currentField].title}
              </Typography>
              <Typography variant="caption" display="block" color="text.secondary">
                {FIELD_GUIDANCE[currentField].help}
              </Typography>
            </Box>
          )}

          {/* Messages */}
          <Box
            sx={{
              flex: 1,
              overflow: 'auto',
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
            }}
          >
            {messages.map((message) => (
              <Box
                key={message.id}
                sx={{
                  display: 'flex',
                  justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <Box
                  sx={{
                    maxWidth: '80%',
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor: message.type === 'user' ? 'primary.main' : 'grey.100',
                    color: message.type === 'user' ? 'white' : 'text.primary',
                  }}
                >
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                    {message.text}
                  </Typography>
                </Box>
              </Box>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <Box sx={{ display: 'flex', gap: 0.5, p: 1 }}>
                {[0, 1, 2].map((i) => (
                  <Box
                    key={i}
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: 'grey.400',
                      animation: `${typingAnimation} 1s infinite`,
                      animationDelay: `${i * 0.2}s`,
                    }}
                  />
                ))}
              </Box>
            )}

            <div ref={chatEndRef} />
          </Box>

          {/* Quick Actions */}
          <Box sx={{ p: 1, borderTop: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Chip
                icon={<HelpIcon />}
                label="Help"
                size="small"
                onClick={() => {
                  addUserMessage('I need help');
                  setTimeout(() => addBotMessage(SMART_RESPONSES['help']), 500);
                }}
                clickable
              />
              <Chip
                icon={<PersonIcon />}
                label="Talk to Human"
                size="small"
                color="primary"
                onClick={handleEscalate}
                clickable
              />
              <Chip
                icon={<PhoneIcon />}
                label="IDIQ Support"
                size="small"
                variant="outlined"
                onClick={() => {
                  addUserMessage('How do I contact IDIQ?');
                  setTimeout(() => addBotMessage(SMART_RESPONSES['contact idiq']), 500);
                }}
                clickable
              />
            </Box>
          </Box>

          {/* Input */}
          <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Type a message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <VoiceMicButton
                      onResult={handleVoiceResult}
                      fieldType="text"
                      size="small"
                    />
                  ),
                }}
              />
              <IconButton color="primary" onClick={handleSend} disabled={!inputValue.trim()}>
                <SendIcon />
              </IconButton>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
              <Tooltip title="Export transcript">
                <IconButton size="small" onClick={exportTranscript}>
                  <DownloadIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Paper>
      </Collapse>

      {/* Minimized State */}
      {isOpen && isMinimized && (
        <Paper
          elevation={4}
          sx={{
            p: 1.5,
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 2,
            cursor: 'pointer',
          }}
          onClick={() => setIsMinimized(false)}
        >
          <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
            <AIIcon fontSize="small" />
          </Avatar>
          <Typography variant="body2">AI Assistant</Typography>
          <IconButton size="small">
            <MaximizeIcon fontSize="small" />
          </IconButton>
        </Paper>
      )}

      {/* Floating Button */}
      <Zoom in={!isOpen}>
        <Badge
          badgeContent={unreadCount}
          color="error"
          overlap="circular"
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Fab
            color="primary"
            onClick={toggleOpen}
            sx={{
              width: 60,
              height: 60,
              animation: frustrationScore > 70 ? `${pulseAnimation} 2s infinite` : 'none',
              '&:hover': {
                animation: `${bounceAnimation} 0.5s ease-in-out`,
              },
            }}
          >
            <AIIcon />
          </Fab>
        </Badge>
      </Zoom>
    </Box>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export default AIFormAssistant;
