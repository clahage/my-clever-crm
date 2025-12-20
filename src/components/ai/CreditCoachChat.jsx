// ============================================================================
// AI CREDIT COACH CHAT - 24/7 INTELLIGENT ASSISTANT
// ============================================================================
// Interactive AI chatbot for credit education and guidance
// ============================================================================

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Avatar,
  IconButton,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  Grid,
  Tooltip,
  Fab,
  Drawer,
  Badge,
  Collapse,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Send,
  SmartToy,
  Person,
  Lightbulb,
  School,
  TrendingUp,
  Psychology,
  Refresh,
  History,
  Close,
  ExpandMore,
  ExpandLess,
  Star,
  AutoAwesome,
} from '@mui/icons-material';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/firebase/config';
import { useAuth } from '@/contexts/AuthContext';

// Message Component
const ChatMessage = ({ message, isUser }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        mb: 2,
        gap: 1,
      }}
    >
      {!isUser && (
        <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
          <SmartToy sx={{ fontSize: 20 }} />
        </Avatar>
      )}
      <Paper
        sx={{
          p: 2,
          maxWidth: '75%',
          bgcolor: isUser ? 'primary.main' : 'grey.100',
          color: isUser ? 'white' : 'text.primary',
          borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        }}
      >
        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
          {message.content}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            mt: 0.5,
            opacity: 0.7,
            textAlign: isUser ? 'right' : 'left',
          }}
        >
          {new Date(message.timestamp).toLocaleTimeString()}
        </Typography>
      </Paper>
      {isUser && (
        <Avatar sx={{ bgcolor: 'grey.400', width: 36, height: 36 }}>
          <Person sx={{ fontSize: 20 }} />
        </Avatar>
      )}
    </Box>
  );
};

// Quick Tips Card
const QuickTipsCard = ({ tips, onTipClick }) => {
  if (!tips?.length) return null;

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <Lightbulb sx={{ mr: 1, color: 'warning.main' }} />
          Quick Tips
        </Typography>
        <Grid container spacing={1}>
          {tips.map((tip, idx) => (
            <Grid item xs={12} sm={6} key={idx}>
              <Card
                variant="outlined"
                sx={{
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
                onClick={() => onTipClick(tip)}
              >
                <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body2" fontWeight="bold">
                      {tip.title}
                    </Typography>
                    <Chip
                      label={tip.impact}
                      size="small"
                      color={tip.impact === 'high' ? 'error' : tip.impact === 'medium' ? 'warning' : 'default'}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {tip.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

// Suggested Questions
const SuggestedQuestions = ({ questions, onQuestionClick }) => {
  if (!questions?.length) return null;

  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
      {questions.map((question, idx) => (
        <Chip
          key={idx}
          label={question}
          onClick={() => onQuestionClick(question)}
          sx={{ cursor: 'pointer' }}
          variant="outlined"
          color="primary"
        />
      ))}
    </Box>
  );
};

const CreditCoachChat = ({ clientId, clientContext, embedded = false }) => {
  const { userProfile } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('general');
  const [quickTips, setQuickTips] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [tipsLoading, setTipsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom on new messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load initial tips
  useEffect(() => {
    loadQuickTips();
  }, [clientId]);

  // Add welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: `👋 Hi! I'm your AI Credit Coach. I'm here to help you understand credit, answer questions, and guide your credit repair journey.

Here are some things I can help with:
• Explain how credit scores work
• Answer questions about disputes
• Provide personalized improvement tips
• Help you understand your credit report

What would you like to know?`,
          timestamp: new Date().toISOString(),
        },
      ]);
      setSuggestions([
        'How do I improve my credit score?',
        'What affects my score the most?',
        'How long do collections stay on my report?',
      ]);
    }
  }, []);

  // Load quick tips
  const loadQuickTips = async () => {
    setTipsLoading(true);
    try {
      const getTips = httpsCallable(functions, 'getQuickTips');
      const result = await getTips({ clientId, category: null });
      if (result.data.success) {
        setQuickTips(result.data.tips || []);
      }
    } catch (err) {
      console.error('Error loading tips:', err);
    } finally {
      setTipsLoading(false);
    }
  };

  // Send message
  const sendMessage = async (messageText = input) => {
    if (!messageText.trim()) return;

    const userMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: messageText.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setSuggestions([]);

    try {
      const chat = httpsCallable(functions, 'chatWithCoach');
      const result = await chat({
        message: messageText.trim(),
        conversationHistory: messages.slice(-10).map(m => ({
          role: m.role,
          content: m.content,
        })),
        clientContext: clientContext || { clientId },
        mode,
      });

      if (result.data.success) {
        const assistantMessage = {
          id: `assistant_${Date.now()}`,
          role: 'assistant',
          content: result.data.response,
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, assistantMessage]);
        setSuggestions(result.data.followUpSuggestions || []);
      }
    } catch (err) {
      console.error('Chat error:', err);
      const errorMessage = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again.",
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // Handle tip click
  const handleTipClick = (tip) => {
    sendMessage(`Tell me more about: ${tip.title}`);
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Clear conversation
  const clearConversation = () => {
    setMessages([]);
    setSuggestions([]);
  };

  return (
    <Box sx={{ height: embedded ? '100%' : 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      {!embedded && (
        <Paper sx={{ p: 2, mb: 2, background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2 }}>
                <SmartToy />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  AI Credit Coach
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Your 24/7 credit education assistant
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  sx={{ color: 'white', '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' } }}
                >
                  <MenuItem value="general">General</MenuItem>
                  <MenuItem value="educational">Educational</MenuItem>
                  <MenuItem value="motivational">Motivational</MenuItem>
                  <MenuItem value="strategic">Strategic</MenuItem>
                </Select>
              </FormControl>
              <Tooltip title="Clear conversation">
                <IconButton onClick={clearConversation} sx={{ color: 'white' }}>
                  <Refresh />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Quick Tips */}
      {quickTips.length > 0 && messages.length <= 1 && (
        <QuickTipsCard tips={quickTips} onTipClick={handleTipClick} />
      )}

      {/* Messages */}
      <Paper
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
          bgcolor: 'grey.50',
          mb: 2,
        }}
      >
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            isUser={message.role === 'user'}
          />
        ))}
        {loading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
              <SmartToy sx={{ fontSize: 20 }} />
            </Avatar>
            <Paper sx={{ p: 2, bgcolor: 'grey.100', borderRadius: '18px 18px 18px 4px' }}>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <CircularProgress size={8} />
                <CircularProgress size={8} sx={{ animationDelay: '0.2s' }} />
                <CircularProgress size={8} sx={{ animationDelay: '0.4s' }} />
              </Box>
            </Paper>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Paper>

      {/* Suggested Questions */}
      <SuggestedQuestions questions={suggestions} onQuestionClick={sendMessage} />

      {/* Input */}
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            placeholder="Ask me anything about credit..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            multiline
            maxRows={3}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
              },
            }}
          />
          <Button
            variant="contained"
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            sx={{
              minWidth: 56,
              borderRadius: 3,
              background: 'linear-gradient(45deg, #6366f1, #8b5cf6)',
            }}
          >
            <Send />
          </Button>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Powered by AI • Press Enter to send
        </Typography>
      </Paper>
    </Box>
  );
};

// Floating Chat Widget
export const CreditCoachWidget = ({ clientId, clientContext }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Fab
        color="primary"
        onClick={() => setOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: 'linear-gradient(45deg, #6366f1, #8b5cf6)',
        }}
      >
        <Badge badgeContent="AI" color="success">
          <SmartToy />
        </Badge>
      </Fab>

      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 400 } },
        }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <SmartToy sx={{ mr: 1 }} />
              <Typography variant="h6">Credit Coach</Typography>
            </Box>
            <IconButton onClick={() => setOpen(false)} sx={{ color: 'white' }}>
              <Close />
            </IconButton>
          </Box>
          <Box sx={{ flex: 1, p: 2, overflow: 'hidden' }}>
            <CreditCoachChat clientId={clientId} clientContext={clientContext} embedded />
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default CreditCoachChat;
