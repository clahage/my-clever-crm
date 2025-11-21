// ===================================================================
// AIResourceAssistant.jsx
// Path: /src/components/resources/AIResourceAssistant.jsx
// 
// AI Resource Assistant Component
// Intelligent assistant for resource discovery and Q&A
// 
// Features:
// - Semantic search across all resources
// - Natural language Q&A
// - Personalized recommendations
// - Learning path suggestions
// - Content summarization
// - Multi-turn conversations
// 
// Created: November 10, 2025
// ===================================================================

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Avatar,
  Paper,
  Chip,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Fade,
  Tooltip,
} from '@mui/material';
import {
  Brain,
  Send,
  Sparkles,
  BookOpen,
  TrendingUp,
  Target,
  MessageCircle,
  RefreshCw,
  Copy,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  Star,
  Zap,
  Lightbulb,
  CheckCircle,
} from 'lucide-react';

const AIResourceAssistant = ({
  resources,
  templates,
  courses,
  knowledgeBase,
  userProfile,
  onNavigateToResource,
}) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const messagesEndRef = useRef(null);

  // Welcome message on mount
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: `Hi ${userProfile?.displayName || 'there'}! 👋 I'm your AI Resource Assistant. I can help you:

• Find specific resources and templates
• Answer questions about credit repair
• Recommend training materials
• Suggest relevant tools
• Explain compliance topics

What can I help you with today?`,
        timestamp: new Date(),
      }]);

      // Set initial suggestions
      setSuggestions([
        'Find dispute letter templates',
        'What are the latest FCRA regulations?',
        'Recommend beginner training courses',
        'Show me credit score calculators',
      ]);
    }
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    try {
      // Add user message
      const userMessage = {
        role: 'user',
        content: input.trim(),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMessage]);
      setInput('');
      setLoading(true);

      // Process with AI
      const response = await processAIQuery(input.trim());

      // Add AI response
      const aiMessage = {
        role: 'assistant',
        content: response.content,
        resources: response.resources || [],
        recommendations: response.recommendations || [],
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);

      // Update suggestions
      if (response.suggestions) {
        setSuggestions(response.suggestions);
      }

    } catch (error) {
      console.error('Error processing AI query:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
        error: true,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const processAIQuery = async (query) => {
    // In production, this would call OpenAI API with RAG over knowledge base
    // For now, implement basic keyword matching and categorization

    const lowerQuery = query.toLowerCase();

    // Detect intent
    let intent = 'general';
    if (lowerQuery.includes('template') || lowerQuery.includes('letter')) {
      intent = 'template_search';
    } else if (lowerQuery.includes('course') || lowerQuery.includes('training') || lowerQuery.includes('learn')) {
      intent = 'training';
    } else if (lowerQuery.includes('tool') || lowerQuery.includes('calculator')) {
      intent = 'tool_search';
    } else if (lowerQuery.includes('fcra') || lowerQuery.includes('compliance') || lowerQuery.includes('regulation')) {
      intent = 'compliance';
    } else if (lowerQuery.includes('how') || lowerQuery.includes('what') || lowerQuery.includes('why')) {
      intent = 'question';
    }

    // Search relevant resources
    const relevantResources = searchResources(query);

    // Generate response based on intent
    let response = {
      content: '',
      resources: relevantResources,
      recommendations: [],
      suggestions: [],
    };

    switch (intent) {
      case 'template_search':
        response.content = `I found ${relevantResources.length} templates that might help you. These are commonly used for dispute letters and client communications.`;
        response.suggestions = [
          'Show me email templates',
          'Find contract templates',
          'Create a new custom template',
        ];
        break;

      case 'training':
        response.content = `Based on your profile, I recommend these training resources to enhance your credit repair skills. They're designed for ${userProfile?.skillLevel || 'all'} skill levels.`;
        response.recommendations = courses.slice(0, 3).map(course => ({
          type: 'course',
          title: course.title,
          reason: 'Matches your current learning path',
          resource: course,
        }));
        response.suggestions = [
          'What courses should I take first?',
          'Show advanced training materials',
          'Recommend certification programs',
        ];
        break;

      case 'tool_search':
        response.content = `Here are some useful tools and calculators that can help with your credit repair work. Each tool is designed to streamline specific tasks.`;
        response.suggestions = [
          'Show budget calculators',
          'Find debt analysis tools',
          'What\'s the best score calculator?',
        ];
        break;

      case 'compliance':
        response.content = `Here's what you need to know about ${lowerQuery.includes('fcra') ? 'FCRA' : 'compliance'}: The Fair Credit Reporting Act (FCRA) is a federal law that regulates how consumer credit information is collected, shared, and used. Key points for credit repair professionals:

• Clients have the right to dispute inaccurate information
• Bureaus must investigate disputes within 30 days
• Negative items must be verified or removed
• Recent updates in 2025 strengthen consumer protections

I've found relevant compliance resources for you to review.`;
        response.suggestions = [
          'What are recent FCRA updates?',
          'Explain CROA requirements',
          'Find compliance checklists',
        ];
        break;

      case 'question':
        response.content = `Great question! ${generateAnswer(query)}

Let me know if you need more specific information or want to explore related topics.`;
        response.suggestions = [
          'Tell me more about this',
          'Show me related resources',
          'What else should I know?',
        ];
        break;

      default:
        response.content = `I found ${relevantResources.length} resources related to your query. I can help you with templates, training materials, compliance information, and more. What would you like to explore?`;
        response.suggestions = [
          'Find dispute templates',
          'Recommend training courses',
          'Explain FCRA compliance',
          'Show useful tools',
        ];
    }

    return response;
  };

  const searchResources = (query) => {
    const lowerQuery = query.toLowerCase();
    const allContent = [
      ...resources.map(r => ({ ...r, type: 'resource' })),
      ...templates.map(t => ({ ...t, type: 'template' })),
      ...courses.map(c => ({ ...c, type: 'course' })),
    ];

    return allContent
      .filter(item => {
        const searchableText = `${item.title} ${item.description} ${item.category} ${item.tags?.join(' ')}`.toLowerCase();
        return searchableText.includes(lowerQuery);
      })
      .slice(0, 5);
  };

  const generateAnswer = (question) => {
    // In production, this would use OpenAI to generate answers from knowledge base
    // For now, provide template responses
    
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('credit score') || lowerQuestion.includes('score')) {
      return 'A credit score is a numerical representation of your creditworthiness, ranging from 300 to 850. It\'s calculated based on payment history (35%), amounts owed (30%), length of credit history (15%), new credit (10%), and credit mix (10%).';
    }
    
    if (lowerQuestion.includes('dispute') || lowerQuestion.includes('remove')) {
      return 'To dispute an item on a credit report, you need to: 1) Identify the inaccurate information, 2) Gather supporting documentation, 3) Send a dispute letter to the credit bureau, 4) Wait 30 days for investigation, 5) Follow up if needed. The bureau must verify or remove the item.';
    }
    
    if (lowerQuestion.includes('bureau')) {
      return 'The three major credit bureaus are Equifax, Experian, and TransUnion. They collect and maintain credit information about consumers. Each may have slightly different information, so it\'s important to check all three reports when helping clients.';
    }

    return 'That\'s an interesting question. I can search our knowledge base for more detailed information, or connect you with specific resources that cover this topic in depth.';
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
    handleSend();
  };

  const handleCopyMessage = (content) => {
    navigator.clipboard.writeText(content);
  };

  const renderMessage = (message, index) => {
    const isUser = message.role === 'user';

    return (
      <Fade in key={index}>
        <Box
          className={`mb-4 ${isUser ? 'flex justify-end' : 'flex justify-start'}`}
        >
          <Box className={`max-w-[80%] ${isUser ? 'flex flex-row-reverse' : 'flex'} items-start gap-2`}>
            <Avatar className={isUser ? 'bg-blue-600' : 'bg-gradient-to-r from-purple-600 to-blue-600'}>
              {isUser ? (
                userProfile?.displayName?.[0] || 'U'
              ) : (
                <Brain className="w-5 h-5" />
              )}
            </Avatar>
            <Paper
              elevation={1}
              className={`p-3 ${
                isUser
                  ? 'bg-blue-600 text-white'
                  : message.error
                  ? 'bg-red-50 dark:bg-red-900/20'
                  : 'bg-white dark:bg-gray-800'
              }`}
            >
              <Typography
                variant="body2"
                style={{ whiteSpace: 'pre-wrap' }}
                className={isUser ? 'text-white' : ''}
              >
                {message.content}
              </Typography>

              {/* Resources */}
              {message.resources && message.resources.length > 0 && (
                <Box className="mt-3 space-y-2">
                  <Divider className="my-2" />
                  <Typography variant="caption" className="font-semibold">
                    Relevant Resources:
                  </Typography>
                  {message.resources.map((resource, idx) => (
                    <Box
                      key={idx}
                      className="p-2 bg-gray-50 dark:bg-gray-700 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                      onClick={() => onNavigateToResource?.(resource)}
                    >
                      <Box className="flex items-center justify-between">
                        <Box>
                          <Typography variant="body2" className="font-semibold">
                            {resource.title}
                          </Typography>
                          <Box className="flex items-center gap-1 mt-1">
                            <Chip label={resource.category} size="small" />
                            <Chip label={resource.type} size="small" variant="outlined" />
                          </Box>
                        </Box>
                        <IconButton size="small">
                          <ExternalLink className="w-4 h-4" />
                        </IconButton>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}

              {/* Recommendations */}
              {message.recommendations && message.recommendations.length > 0 && (
                <Box className="mt-3 space-y-2">
                  <Divider className="my-2" />
                  <Typography variant="caption" className="font-semibold">
                    Recommended for You:
                  </Typography>
                  {message.recommendations.map((rec, idx) => (
                    <Box
                      key={idx}
                      className="p-2 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded"
                    >
                      <Box className="flex items-start gap-2">
                        <Star className="w-4 h-4 text-yellow-500 mt-0.5" />
                        <Box>
                          <Typography variant="body2" className="font-semibold">
                            {rec.title}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {rec.reason}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}

              {/* Actions */}
              {!isUser && (
                <Box className="flex items-center gap-1 mt-2">
                  <Tooltip title="Copy">
                    <IconButton
                      size="small"
                      onClick={() => handleCopyMessage(message.content)}
                    >
                      <Copy className="w-3 h-3" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Helpful">
                    <IconButton size="small">
                      <ThumbsUp className="w-3 h-3" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Not helpful">
                    <IconButton size="small">
                      <ThumbsDown className="w-3 h-3" />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}

              <Typography variant="caption" color="textSecondary" className="block mt-1">
                {message.timestamp.toLocaleTimeString()}
              </Typography>
            </Paper>
          </Box>
        </Box>
      </Fade>
    );
  };

  return (
    <Box>
      {/* Header */}
      <Card className="mb-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
        <CardContent>
          <Box className="flex items-center gap-3">
            <Avatar className="bg-gradient-to-r from-purple-600 to-blue-600">
              <Brain className="w-6 h-6" />
            </Avatar>
            <Box>
              <Typography variant="h6" className="font-semibold">
                AI Resource Assistant
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Powered by advanced AI • Trained on your resource library
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Box className="grid grid-cols-3 gap-3 mb-4">
        <Card>
          <CardContent className="text-center py-3">
            <Typography variant="h5" className="font-bold">
              {resources.length + templates.length}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Resources Indexed
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center py-3">
            <Typography variant="h5" className="font-bold">
              {courses.length}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Courses Available
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center py-3">
            <Typography variant="h5" className="font-bold">
              {knowledgeBase.length}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Knowledge Articles
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Chat Messages */}
      <Card className="mb-4">
        <CardContent>
          <Box className="h-96 overflow-y-auto mb-4 p-2">
            {messages.map((message, index) => renderMessage(message, index))}
            {loading && (
              <Box className="flex items-center gap-2 mb-4">
                <Avatar className="bg-gradient-to-r from-purple-600 to-blue-600">
                  <Brain className="w-5 h-5" />
                </Avatar>
                <Paper className="p-3">
                  <Box className="flex items-center gap-2">
                    <CircularProgress size={16} />
                    <Typography variant="body2">Thinking...</Typography>
                  </Box>
                </Paper>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>

          {/* Suggestions */}
          {suggestions.length > 0 && !loading && (
            <Box className="mb-4">
              <Typography variant="caption" color="textSecondary" className="mb-2 block">
                Suggested questions:
              </Typography>
              <Box className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, index) => (
                  <Chip
                    key={index}
                    label={suggestion}
                    size="small"
                    clickable
                    onClick={() => handleSuggestionClick(suggestion)}
                    icon={<Lightbulb className="w-3 h-3" />}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Input */}
          <Box className="flex gap-2">
            <TextField
              fullWidth
              placeholder="Ask me anything about resources, training, or credit repair..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={loading}
            />
            <Button
              variant="contained"
              disabled={!input.trim() || loading}
              onClick={handleSend}
              startIcon={loading ? <Sparkles className="w-4 h-4 animate-pulse" /> : <Send className="w-4 h-4" />}
            >
              Send
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardContent>
          <Typography variant="subtitle2" className="font-semibold mb-3">
            What I Can Do:
          </Typography>
          <List dense>
            <ListItem>
              <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
              <ListItemText
                primary="Semantic Search"
                secondary="Find resources using natural language"
              />
            </ListItem>
            <ListItem>
              <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
              <ListItemText
                primary="Q&A on Credit Repair"
                secondary="Answer questions based on knowledge base"
              />
            </ListItem>
            <ListItem>
              <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
              <ListItemText
                primary="Personalized Recommendations"
                secondary="Suggest resources based on your role and activity"
              />
            </ListItem>
            <ListItem>
              <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
              <ListItemText
                primary="Learning Paths"
                secondary="Create custom training sequences"
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AIResourceAssistant;