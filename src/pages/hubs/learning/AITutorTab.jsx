import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Avatar, Chip,
  Alert, CircularProgress, List, ListItem, Divider
} from '@mui/material';
import { Brain, Send, User, Sparkles } from 'lucide-react';
import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../contexts/AuthContext';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

const AITutorTab = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI Learning Assistant. Ask me anything about credit repair, FCRA laws, dispute strategies, or any topic you\'re studying. How can I help you today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadConversationHistory();
  }, [currentUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversationHistory = async () => {
    try {
      setLoading(true);
      const conversationsRef = collection(db, 'tutorConversations');
      const conversationsSnap = await getDocs(
        query(
          conversationsRef,
          where('userId', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        )
      );

      if (!conversationsSnap.empty) {
        const lastConversation = conversationsSnap.docs[0].data();
        if (lastConversation.messages) {
          setMessages(lastConversation.messages);
        }
      }
    } catch (err) {
      console.error('Error loading conversation history:', err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setSending(true);
    setError('');

    try {
      // Call OpenAI API
      if (!OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured');
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are an expert credit repair tutor. Help students learn about FCRA laws, credit scoring, dispute strategies, client management, and compliance. Be encouraging, clear, and provide actionable advice.'
            },
            ...updatedMessages
          ],
          temperature: 0.8,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }

      const data = await response.json();
      const assistantMessage = {
        role: 'assistant',
        content: data.choices[0].message.content
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);

      // Save conversation to Firebase
      await addDoc(collection(db, 'tutorConversations'), {
        userId: currentUser.uid,
        messages: finalMessages,
        createdAt: serverTimestamp()
      });

    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to get response. Please try again.');
      setMessages([
        ...updatedMessages,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.'
        }
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Brain size={24} />
        <Typography variant="h5" fontWeight="bold">
          AI Tutor
        </Typography>
        <Chip
          icon={<Sparkles size={16} />}
          label="Powered by AI"
          color="primary"
          size="small"
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Chat Container */}
      <Paper sx={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
        {/* Messages */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            p: 3,
            bgcolor: 'background.default'
          }}
        >
          <List>
            {messages.map((message, index) => (
              <ListItem
                key={index}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: message.role === 'user' ? 'flex-end' : 'flex-start',
                  mb: 2
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    gap: 1,
                    maxWidth: '80%',
                    flexDirection: message.role === 'user' ? 'row-reverse' : 'row'
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: message.role === 'user' ? 'primary.main' : 'secondary.main',
                      width: 32,
                      height: 32
                    }}
                  >
                    {message.role === 'user' ? <User size={20} /> : <Brain size={20} />}
                  </Avatar>
                  <Paper
                    sx={{
                      p: 2,
                      bgcolor: message.role === 'user' ? 'primary.main' : 'background.paper',
                      color: message.role === 'user' ? 'white' : 'text.primary'
                    }}
                  >
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                      {message.content}
                    </Typography>
                  </Paper>
                </Box>
              </ListItem>
            ))}
            {sending && (
              <ListItem sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
                    <Brain size={20} />
                  </Avatar>
                  <Paper sx={{ p: 2 }}>
                    <CircularProgress size={20} />
                  </Paper>
                </Box>
              </ListItem>
            )}
            <div ref={messagesEndRef} />
          </List>
        </Box>

        <Divider />

        {/* Input */}
        <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              placeholder="Ask me anything about credit repair..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={sending}
            />
            <Button
              variant="contained"
              onClick={sendMessage}
              disabled={!input.trim() || sending}
              startIcon={sending ? <CircularProgress size={20} /> : <Send size={20} />}
            >
              Send
            </Button>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Press Enter to send, Shift+Enter for new line
          </Typography>
        </Box>
      </Paper>

      {/* Quick Topics */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Quick Topics:
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {[
            'What is FCRA?',
            'How to write dispute letters',
            'Credit scoring basics',
            'Client onboarding tips',
            'Compliance requirements'
          ].map((topic) => (
            <Chip
              key={topic}
              label={topic}
              onClick={() => setInput(topic)}
              clickable
              size="small"
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default AITutorTab;
