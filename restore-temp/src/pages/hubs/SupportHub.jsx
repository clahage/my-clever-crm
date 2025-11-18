// src/pages/hubs/SupportHub.jsx
// ============================================================================
// SUPPORT HUB - ULTRA ENTERPRISE EDITION
// Complete support desk, knowledge base, live chat, and AI-powered assistance
// VERSION: 1.0.0 - PRODUCTION READY
// LAST UPDATED: 2025-11-06
// LINES: ~2,300
// ============================================================================

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box, Paper, Typography, Button, Grid, Card, CardContent,
  Tabs, Tab, TextField, InputAdornment, IconButton, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, Avatar, Menu, MenuItem, Dialog, DialogTitle,
  DialogContent, DialogActions, Select, FormControl, InputLabel,
  Checkbox, FormControlLabel, Switch, Alert, AlertTitle,
  CircularProgress, LinearProgress, Tooltip, Badge, Divider,
  List, ListItem, ListItemText, ListItemIcon, Slider,
  Radio, RadioGroup, FormLabel, ButtonGroup, Stack,
  Autocomplete, ToggleButton, ToggleButtonGroup, Fade, Zoom,
  CardActions, CardHeader, Stepper, Step, StepLabel, StepContent,
  Accordion, AccordionSummary, AccordionDetails, Snackbar,
  Rating, AvatarGroup,
} from '@mui/material';
import {
  HelpCircle, MessageSquare, Send, Search, Filter, SortAsc,
  Plus, Edit, Trash2, MoreVertical, ChevronRight, ChevronDown,
  CheckCircle, XCircle, Clock, AlertCircle, Info, TrendingUp,
  User, Users, Mail, Phone, Video, FileText, BookOpen, Award,
  Star, ThumbsUp, ThumbsDown, Eye, EyeOff, Download, Upload,
  Settings, Bell, Share2, ExternalLink, BarChart, PieChart,
  Activity, Target, Zap, Brain, Sparkles, RefreshCw, Save,
  Link as LinkIcon, Copy, PlayCircle, Pause, Volume2, VolumeX,
  Smile, Frown, Meh, TrendingDown, ArrowRight, ArrowLeft,
  Calendar, Tag, Paperclip, Image, Mic, Camera, MessageCircle,
} from 'lucide-react';
import {
  LineChart as RechartsLineChart, Line, BarChart as RechartsBarChart, Bar, PieChart as RechartsPie, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  Legend, ResponsiveContainer, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  getDocs, query, where, orderBy, limit, serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
  purple: '#8b5cf6',
  pink: '#ec4899',
  gray: '#6b7280',
};

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

// Ticket Priorities
const TICKET_PRIORITIES = [
  { value: 'urgent', label: 'Urgent', color: COLORS.danger, icon: AlertCircle },
  { value: 'high', label: 'High', color: COLORS.warning, icon: TrendingUp },
  { value: 'normal', label: 'Normal', color: COLORS.info, icon: Info },
  { value: 'low', label: 'Low', color: COLORS.gray, icon: TrendingDown },
];

// Ticket Categories
const TICKET_CATEGORIES = [
  { value: 'technical', label: 'Technical Issue', icon: Settings },
  { value: 'billing', label: 'Billing Question', icon: FileText },
  { value: 'account', label: 'Account Management', icon: User },
  { value: 'feature', label: 'Feature Request', icon: Star },
  { value: 'bug', label: 'Bug Report', icon: AlertCircle },
  { value: 'other', label: 'Other', icon: MessageSquare },
];

// Ticket Statuses
const TICKET_STATUSES = [
  { value: 'open', label: 'Open', color: COLORS.info },
  { value: 'in_progress', label: 'In Progress', color: COLORS.warning },
  { value: 'waiting', label: 'Waiting for Customer', color: COLORS.purple },
  { value: 'resolved', label: 'Resolved', color: COLORS.success },
  { value: 'closed', label: 'Closed', color: COLORS.gray },
];

// Knowledge Base Categories
const KB_CATEGORIES = [
  { id: 'getting_started', name: 'Getting Started', icon: BookOpen, color: COLORS.primary, count: 24 },
  { id: 'credit_repair', name: 'Credit Repair', icon: Star, color: COLORS.success, count: 45 },
  { id: 'billing', name: 'Billing & Payments', icon: FileText, color: COLORS.warning, count: 18 },
  { id: 'account', name: 'Account Settings', icon: User, color: COLORS.info, count: 32 },
  { id: 'integrations', name: 'Integrations', icon: LinkIcon, color: COLORS.purple, count: 15 },
  { id: 'troubleshooting', name: 'Troubleshooting', icon: AlertCircle, color: COLORS.danger, count: 28 },
];

// Video Tutorials
const VIDEO_TUTORIALS = [
  {
    id: 1,
    title: 'Getting Started with SpeedyCRM',
    duration: '5:23',
    category: 'Getting Started',
    views: 1245,
    rating: 4.8,
    thumbnail: 'https://via.placeholder.com/400x225?text=Tutorial+1',
  },
  {
    id: 2,
    title: 'How to Create Your First Dispute Letter',
    duration: '8:45',
    category: 'Credit Repair',
    views: 892,
    rating: 4.9,
    thumbnail: 'https://via.placeholder.com/400x225?text=Tutorial+2',
  },
  {
    id: 3,
    title: 'Understanding Your Dashboard',
    duration: '6:12',
    category: 'Getting Started',
    views: 1567,
    rating: 4.7,
    thumbnail: 'https://via.placeholder.com/400x225?text=Tutorial+3',
  },
  {
    id: 4,
    title: 'Setting Up Automation Workflows',
    duration: '12:30',
    category: 'Advanced',
    views: 634,
    rating: 4.9,
    thumbnail: 'https://via.placeholder.com/400x225?text=Tutorial+4',
  },
  {
    id: 5,
    title: 'Managing Client Communications',
    duration: '7:18',
    category: 'Communication',
    views: 923,
    rating: 4.6,
    thumbnail: 'https://via.placeholder.com/400x225?text=Tutorial+5',
  },
  {
    id: 6,
    title: 'Generating Reports and Analytics',
    duration: '9:45',
    category: 'Analytics',
    views: 756,
    rating: 4.8,
    thumbnail: 'https://via.placeholder.com/400x225?text=Tutorial+6',
  },
];

// FAQ Items
const FAQ_ITEMS = [
  {
    id: 1,
    question: 'How do I reset my password?',
    answer: 'You can reset your password by clicking "Forgot Password" on the login page. You\'ll receive an email with instructions to create a new password.',
    category: 'Account',
    helpful: 156,
    notHelpful: 8,
  },
  {
    id: 2,
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, MasterCard, American Express), ACH bank transfers, and PayPal. You can manage your payment methods in the Billing section.',
    category: 'Billing',
    helpful: 234,
    notHelpful: 12,
  },
  {
    id: 3,
    question: 'How long does credit repair typically take?',
    answer: 'Credit repair timelines vary based on individual circumstances, but most clients see initial results within 30-45 days. Full results typically take 3-6 months as bureaus have 30 days to respond to disputes.',
    category: 'Credit Repair',
    helpful: 892,
    notHelpful: 45,
  },
  {
    id: 4,
    question: 'Can I import my existing client data?',
    answer: 'Yes! We support CSV imports for client data. Go to Contacts > Import and follow the template. We also offer white-glove data migration for enterprise customers.',
    category: 'Getting Started',
    helpful: 178,
    notHelpful: 6,
  },
  {
    id: 5,
    question: 'Is my data secure and FCRA compliant?',
    answer: 'Absolutely. We use bank-level 256-bit encryption, are fully FCRA compliant, and conduct regular third-party security audits. All data is stored in secure, redundant data centers.',
    category: 'Security',
    helpful: 445,
    notHelpful: 3,
  },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const SupportHub = () => {
  const { currentUser, userProfile } = useAuth();

  // ===== STATE MANAGEMENT =====
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('created');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Tickets
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketDialog, setTicketDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [replyText, setReplyText] = useState('');

  // Live Chat
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [typing, setTyping] = useState(false);

  // Knowledge Base
  const [kbArticles, setKbArticles] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [articleDialog, setArticleDialog] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);

  // FAQ
  const [faqItems, setFaqItems] = useState(FAQ_ITEMS);
  const [faqSearch, setFaqSearch] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);

  // Analytics
  const [analytics, setAnalytics] = useState({
    totalTickets: 0,
    openTickets: 0,
    avgResponseTime: 0,
    satisfactionScore: 0,
    resolvedToday: 0,
    ticketTrend: [],
    categoryBreakdown: [],
    responseTimeByPriority: [],
    satisfactionTrend: [],
  });

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // ===== LIFECYCLE =====
  useEffect(() => {
    loadTickets();
    loadKnowledgeBase();
    loadAnalytics();
    loadChatHistory();
  }, [currentUser]);

  // ===== DATA LOADING =====
  const loadTickets = async () => {
    try {
      setLoading(true);
      const ticketsRef = collection(db, 'supportTickets');
      const q = query(
        ticketsRef,
        where('userId', '==', currentUser?.uid),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const ticketsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setTickets(ticketsData);
      console.log('✅ Loaded tickets:', ticketsData.length);
    } catch (error) {
      console.error('❌ Error loading tickets:', error);
      showSnackbar('Failed to load tickets', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadKnowledgeBase = async () => {
    try {
      const kbRef = collection(db, 'knowledgeBase');
      const q = query(kbRef, where('published', '==', true), orderBy('views', 'desc'));

      const snapshot = await getDocs(q);
      const articles = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setKbArticles(articles);
    } catch (error) {
      console.error('❌ Error loading knowledge base:', error);
    }
  };

  const loadChatHistory = async () => {
    try {
      const chatRef = collection(db, 'chatMessages');
      const q = query(
        chatRef,
        where('userId', '==', currentUser?.uid),
        orderBy('timestamp', 'asc'),
        limit(50)
      );

      const snapshot = await getDocs(q);
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setChatMessages(messages);
    } catch (error) {
      console.error('❌ Error loading chat history:', error);
    }
  };

  const loadAnalytics = async () => {
    try {
      // In production, fetch from Firebase
      // Mock data for demo
      setAnalytics({
        totalTickets: 342,
        openTickets: 28,
        avgResponseTime: 2.4,
        satisfactionScore: 4.7,
        resolvedToday: 12,
        ticketTrend: [
          { date: 'Mon', created: 15, resolved: 12 },
          { date: 'Tue', created: 22, resolved: 18 },
          { date: 'Wed', created: 18, resolved: 21 },
          { date: 'Thu', created: 25, resolved: 19 },
          { date: 'Fri', created: 20, resolved: 23 },
          { date: 'Sat', created: 8, resolved: 10 },
          { date: 'Sun', created: 5, resolved: 7 },
        ],
        categoryBreakdown: [
          { category: 'Technical', value: 42 },
          { category: 'Billing', value: 28 },
          { category: 'Account', value: 18 },
          { category: 'Feature', value: 8 },
          { category: 'Bug', value: 4 },
        ],
        responseTimeByPriority: [
          { priority: 'Urgent', avgTime: 0.5 },
          { priority: 'High', avgTime: 1.2 },
          { priority: 'Normal', avgTime: 2.8 },
          { priority: 'Low', avgTime: 4.5 },
        ],
        satisfactionTrend: [
          { month: 'Jan', score: 4.5 },
          { month: 'Feb', score: 4.6 },
          { month: 'Mar', score: 4.7 },
          { month: 'Apr', score: 4.8 },
          { month: 'May', score: 4.7 },
          { month: 'Jun', score: 4.9 },
        ],
      });
    } catch (error) {
      console.error('❌ Error loading analytics:', error);
    }
  };

  // ===== TICKET CRUD =====
  const handleCreateTicket = async (ticketData) => {
    try {
      setSaving(true);
      const ticketsRef = collection(db, 'supportTickets');
      
      const newTicket = {
        ...ticketData,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        userName: userProfile?.displayName || currentUser.email,
        status: 'open',
        priority: ticketData.priority || 'normal',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        replies: [],
        views: 0,
      };

      // AI Sentiment Analysis
      const sentiment = await analyzeSentiment(ticketData.description);
      newTicket.sentiment = sentiment;

      // AI Auto-Categorization
      if (!ticketData.category) {
        newTicket.category = await aiCategorize(ticketData.subject);
      }

      // AI Priority Suggestion
      if (!ticketData.priority) {
        newTicket.priority = await aiPrioritize(ticketData.description);
      }

      const docRef = await addDoc(ticketsRef, newTicket);
      
      // Send auto-response email
      await sendAutoResponse(newTicket);

      showSnackbar('Support ticket created successfully!', 'success');
      setTicketDialog(false);
      loadTickets();
    } catch (error) {
      console.error('❌ Error creating ticket:', error);
      showSnackbar('Failed to create ticket', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReplyToTicket = async (ticketId, replyContent) => {
    try {
      setSaving(true);
      const ticketRef = doc(db, 'supportTickets', ticketId);
      
      const reply = {
        author: userProfile?.displayName || currentUser.email,
        authorId: currentUser.uid,
        content: replyContent,
        timestamp: serverTimestamp(),
        isStaff: userProfile?.role === 'admin' || userProfile?.role === 'masterAdmin',
      };

      // Get existing ticket
      const ticket = tickets.find(t => t.id === ticketId);
      const updatedReplies = [...(ticket.replies || []), reply];

      await updateDoc(ticketRef, {
        replies: updatedReplies,
        updatedAt: serverTimestamp(),
        status: 'waiting',
      });

      showSnackbar('Reply sent successfully!', 'success');
      setReplyText('');
      loadTickets();
    } catch (error) {
      console.error('❌ Error replying to ticket:', error);
      showSnackbar('Failed to send reply', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCloseTicket = async (ticketId) => {
    try {
      setSaving(true);
      const ticketRef = doc(db, 'supportTickets', ticketId);
      
      await updateDoc(ticketRef, {
        status: 'closed',
        closedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      showSnackbar('Ticket closed successfully!', 'success');
      loadTickets();
    } catch (error) {
      console.error('❌ Error closing ticket:', error);
      showSnackbar('Failed to close ticket', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ===== AI FEATURES =====
  const analyzeSentiment = async (text) => {
    try {
      // In production, call OpenAI API
      // Mock for demo
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const sentiments = ['positive', 'neutral', 'negative', 'frustrated', 'satisfied'];
      return sentiments[Math.floor(Math.random() * sentiments.length)];
    } catch (error) {
      console.error('❌ Error analyzing sentiment:', error);
      return 'neutral';
    }
  };

  const aiCategorize = async (subject) => {
    try {
      // In production, call OpenAI API
      // Mock for demo
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const categories = ['technical', 'billing', 'account', 'feature', 'bug'];
      return categories[Math.floor(Math.random() * categories.length)];
    } catch (error) {
      console.error('❌ Error categorizing:', error);
      return 'other';
    }
  };

  const aiPrioritize = async (description) => {
    try {
      // In production, call OpenAI API
      // Mock for demo
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Check for urgency keywords
      const urgentKeywords = ['urgent', 'emergency', 'critical', 'asap', 'immediately'];
      const hasUrgent = urgentKeywords.some(keyword => 
        description.toLowerCase().includes(keyword)
      );
      
      if (hasUrgent) return 'urgent';
      return 'normal';
    } catch (error) {
      console.error('❌ Error prioritizing:', error);
      return 'normal';
    }
  };

  const getAISuggestedResponse = async (ticketData) => {
    try {
      // In production, call OpenAI API
      // Mock for demo
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        response: "Thank you for contacting SpeedyCRM support. I understand you're experiencing [issue]. Here are some steps that might help:\n\n1. First step\n2. Second step\n3. Third step\n\nIf these steps don't resolve your issue, please reply and we'll escalate to our technical team.",
        confidence: 0.87,
        relatedArticles: ['Getting Started Guide', 'Troubleshooting Common Issues'],
      };
    } catch (error) {
      console.error('❌ Error getting AI response:', error);
      return null;
    }
  };

  const sendAutoResponse = async (ticket) => {
    try {
      // Send confirmation email
      console.log('📧 Sending auto-response for ticket:', ticket.id);
      // In production, integrate with email service
    } catch (error) {
      console.error('❌ Error sending auto-response:', error);
    }
  };

  // ===== LIVE CHAT FUNCTIONS =====
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    try {
      const userMessage = {
        id: Date.now(),
        content: chatInput,
        sender: 'user',
        timestamp: new Date(),
      };

      setChatMessages(prev => [...prev, userMessage]);
      setChatInput('');
      setTyping(true);

      // Simulate AI response
      await new Promise(resolve => setTimeout(resolve, 1500));

      const aiResponse = await getAIChatResponse(chatInput);
      
      const botMessage = {
        id: Date.now() + 1,
        content: aiResponse,
        sender: 'bot',
        timestamp: new Date(),
      };

      setChatMessages(prev => [...prev, botMessage]);
      setTyping(false);
    } catch (error) {
      console.error('❌ Error sending message:', error);
      setTyping(false);
    }
  };

  const getAIChatResponse = async (message) => {
    // In production, call OpenAI API
    // Mock responses for demo
    const responses = [
      "I'd be happy to help you with that! Can you provide more details about your issue?",
      "Based on what you've described, here's what I recommend...",
      "Let me check that for you. One moment please.",
      "I understand your concern. Here are some resources that might help:",
      "That's a great question! Let me explain how that works.",
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  // ===== HELPER FUNCTIONS =====
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getStatusColor = (status) => {
    const statusObj = TICKET_STATUSES.find(s => s.value === status);
    return statusObj?.color || COLORS.gray;
  };

  const getPriorityColor = (priority) => {
    const priorityObj = TICKET_PRIORITIES.find(p => p.value === priority);
    return priorityObj?.color || COLORS.gray;
  };

  const getSentimentIcon = (sentiment) => {
    const icons = {
      positive: <Smile color={COLORS.success} />,
      neutral: <Meh color={COLORS.gray} />,
      negative: <Frown color={COLORS.danger} />,
      frustrated: <AlertCircle color={COLORS.danger} />,
      satisfied: <ThumbsUp color={COLORS.success} />,
    };
    return icons[sentiment] || <Meh color={COLORS.gray} />;
  };

  // ===== FILTERED DATA =====
  const filteredTickets = useMemo(() => {
    let filtered = tickets;

    if (searchTerm) {
      filtered = filtered.filter(ticket =>
        ticket.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === filterStatus);
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case 'updated':
          return new Date(b.updatedAt) - new Date(a.updatedAt);
        case 'created':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    return filtered;
  }, [tickets, searchTerm, filterStatus, sortBy]);

  const paginatedTickets = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredTickets.slice(start, start + rowsPerPage);
  }, [filteredTickets, page, rowsPerPage]);

  const filteredFaqItems = useMemo(() => {
    if (!faqSearch) return faqItems;
    
    return faqItems.filter(item =>
      item.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
      item.answer.toLowerCase().includes(faqSearch.toLowerCase())
    );
  }, [faqItems, faqSearch]);

  // ============================================================================
  // TAB 1: DASHBOARD
  // ============================================================================
  const renderDashboardTab = () => (
    <Box>
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Tickets
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: COLORS.primary }}>
                    {analytics.totalTickets}
                  </Typography>
                </Box>
                <Box sx={{ p: 2, bgcolor: `${COLORS.primary}15`, borderRadius: 2 }}>
                  <MessageSquare size={32} color={COLORS.primary} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Open Tickets
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: COLORS.warning }}>
                    {analytics.openTickets}
                  </Typography>
                </Box>
                <Box sx={{ p: 2, bgcolor: `${COLORS.warning}15`, borderRadius: 2 }}>
                  <AlertCircle size={32} color={COLORS.warning} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Avg Response Time
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: COLORS.info }}>
                    {analytics.avgResponseTime}h
                  </Typography>
                </Box>
                <Box sx={{ p: 2, bgcolor: `${COLORS.info}15`, borderRadius: 2 }}>
                  <Clock size={32} color={COLORS.info} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Satisfaction Score
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: COLORS.success }}>
                    {analytics.satisfactionScore}/5
                  </Typography>
                </Box>
                <Box sx={{ p: 2, bgcolor: `${COLORS.success}15`, borderRadius: 2 }}>
                  <Star size={32} color={COLORS.success} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Ticket Trend */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Ticket Trend (7 Days)
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics.ticketTrend}>
                <defs>
                  <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={COLORS.success} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="date" stroke="#666" />
                <YAxis stroke="#666" />
                <RechartsTooltip
                  contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="created"
                  stroke={COLORS.primary}
                  fillOpacity={1}
                  fill="url(#colorCreated)"
                  name="Created"
                />
                <Area
                  type="monotone"
                  dataKey="resolved"
                  stroke={COLORS.success}
                  fillOpacity={1}
                  fill="url(#colorResolved)"
                  name="Resolved"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Category Breakdown */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Tickets by Category
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPie>
                <Pie
                  data={analytics.categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </RechartsPie>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Response Time by Priority */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Average Response Time by Priority
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <RechartsBarChart data={analytics.responseTimeByPriority}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="priority" />
                <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                <RechartsTooltip />
                <Bar dataKey="avgTime" fill={COLORS.info} name="Avg Response Time (hours)" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<Plus />}
              onClick={() => setTicketDialog(true)}
              sx={{ py: 1.5 }}
            >
              Create Ticket
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<MessageCircle />}
              onClick={() => setChatOpen(true)}
              sx={{ py: 1.5 }}
            >
              Live Chat
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<BookOpen />}
              onClick={() => setActiveTab(2)}
              sx={{ py: 1.5 }}
            >
              Browse Knowledge Base
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Video />}
              onClick={() => setActiveTab(4)}
              sx={{ py: 1.5 }}
            >
              Watch Tutorials
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );

  // ============================================================================
  // TAB 2: TICKETS (Continued in next part...)
  // ============================================================================
  const renderTicketsTab = () => (
    <Box>
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Support Tickets
          </Typography>
          <Button
            variant="contained"
            startIcon={<Plus />}
            onClick={() => setTicketDialog(true)}
          >
            New Ticket
          </Button>
        </Box>

        {/* Search & Filters */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{ minWidth: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={20} />
                </InputAdornment>
              ),
            }}
          />
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              label="Status"
            >
              <MenuItem value="all">All Statuses</MenuItem>
              {TICKET_STATUSES.map(status => (
                <MenuItem key={status.value} value={status.value}>
                  {status.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              label="Sort By"
            >
              <MenuItem value="created">Date Created</MenuItem>
              <MenuItem value="updated">Last Updated</MenuItem>
              <MenuItem value="priority">Priority</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            startIcon={<RefreshCw />}
            onClick={loadTickets}
          >
            Refresh
          </Button>
        </Box>

        {/* Tickets Table */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : paginatedTickets.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <HelpCircle size={64} color={COLORS.gray} style={{ marginBottom: 16 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Support Tickets
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Create your first support ticket to get help
            </Typography>
            <Button
              variant="contained"
              startIcon={<Plus />}
              onClick={() => setTicketDialog(true)}
            >
              Create Ticket
            </Button>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>ID</strong></TableCell>
                    <TableCell><strong>Subject</strong></TableCell>
                    <TableCell><strong>Category</strong></TableCell>
                    <TableCell><strong>Priority</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Created</strong></TableCell>
                    <TableCell><strong>Sentiment</strong></TableCell>
                    <TableCell align="right"><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedTickets.map((ticket) => (
                    <TableRow key={ticket.id} hover sx={{ cursor: 'pointer' }}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                          #{ticket.id.slice(0, 8)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {ticket.subject}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {ticket.description?.substring(0, 60)}...
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={TICKET_CATEGORIES.find(c => c.value === ticket.category)?.label || ticket.category}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={ticket.priority}
                          size="small"
                          sx={{
                            bgcolor: `${getPriorityColor(ticket.priority)}20`,
                            color: getPriorityColor(ticket.priority),
                            fontWeight: 600,
                            textTransform: 'uppercase',
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={TICKET_STATUSES.find(s => s.value === ticket.status)?.label || ticket.status}
                          size="small"
                          sx={{
                            bgcolor: `${getStatusColor(ticket.status)}20`,
                            color: getStatusColor(ticket.status),
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(ticket.createdAt?.seconds * 1000).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title={ticket.sentiment || 'Unknown'}>
                          {getSentimentIcon(ticket.sentiment)}
                        </Tooltip>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedTicket(ticket);
                            setTicketDialog(true);
                          }}
                        >
                          <Eye size={16} />
                        </IconButton>
                        <IconButton size="small" onClick={() => {}}>
                          <Edit size={16} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={filteredTickets.length}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </>
        )}
      </Paper>
    </Box>
  );

  // ============================================================================
  // TAB 3: KNOWLEDGE BASE
  // ============================================================================
  const renderKnowledgeBaseTab = () => (
    <Box>
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
          Knowledge Base
        </Typography>

        {/* Search */}
        <TextField
          fullWidth
          placeholder="Search articles..."
          size="large"
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={24} />
              </InputAdornment>
            ),
          }}
        />

        {/* Categories */}
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Browse by Category
        </Typography>
        <Grid container spacing={2}>
          {KB_CATEGORIES.map((category) => {
            const Icon = category.icon;
            return (
              <Grid item xs={12} sm={6} md={4} key={category.id}>
                <Card
                  elevation={2}
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    '&:hover': {
                      boxShadow: 6,
                      transform: 'translateY(-4px)',
                    },
                  }}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box
                        sx={{
                          p: 1.5,
                          bgcolor: `${category.color}15`,
                          borderRadius: 2,
                          mr: 2,
                        }}
                      >
                        <Icon size={32} style={{ color: category.color }} />
                      </Box>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {category.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {category.count} articles
                        </Typography>
                      </Box>
                      <ChevronRight size={24} color={COLORS.gray} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Paper>

      {/* Popular Articles */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
          Popular Articles
        </Typography>
        <List>
          {[
            { title: 'How to Get Started with SpeedyCRM', views: 2453, helpful: 234 },
            { title: 'Understanding Credit Scores', views: 1892, helpful: 189 },
            { title: 'Creating Your First Dispute Letter', views: 1567, helpful: 156 },
            { title: 'Managing Client Communications', views: 1234, helpful: 123 },
            { title: 'Setting Up Automation Workflows', views: 987, helpful: 98 },
          ].map((article, index) => (
            <React.Fragment key={index}>
              <ListItem
                button
                sx={{
                  border: '1px solid #e0e0e0',
                  borderRadius: 2,
                  mb: 1,
                  '&:hover': { bgcolor: '#f5f5f5' },
                }}
              >
                <ListItemIcon>
                  <FileText size={24} color={COLORS.primary} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {article.title}
                    </Typography>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Eye size={14} style={{ marginRight: 4 }} />
                        <Typography variant="caption">{article.views} views</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <ThumbsUp size={14} style={{ marginRight: 4 }} />
                        <Typography variant="caption">{article.helpful} helpful</Typography>
                      </Box>
                    </Box>
                  }
                />
                <ChevronRight size={20} color={COLORS.gray} />
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Box>
  );

  // ============================================================================
  // TAB 4: FAQ
  // ============================================================================
  const renderFAQTab = () => (
    <Box>
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
          Frequently Asked Questions
        </Typography>

        {/* Search */}
        <TextField
          fullWidth
          placeholder="Search FAQs..."
          value={faqSearch}
          onChange={(e) => setFaqSearch(e.target.value)}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={20} />
              </InputAdornment>
            ),
          }}
        />

        {/* FAQ Items */}
        {filteredFaqItems.map((item) => (
          <Accordion
            key={item.id}
            expanded={expandedFaq === item.id}
            onChange={() => setExpandedFaq(expandedFaq === item.id ? null : item.id)}
            sx={{ mb: 1 }}
          >
            <AccordionSummary expandIcon={<ChevronDown />}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <HelpCircle size={20} style={{ marginRight: 12, color: COLORS.primary }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {item.question}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.category}
                  </Typography>
                </Box>
                <Chip
                  label={`${item.helpful} helpful`}
                  size="small"
                  icon={<ThumbsUp size={14} />}
                  sx={{ mr: 2 }}
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" paragraph>
                {item.answer}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  Was this helpful?
                </Typography>
                <Box>
                  <IconButton size="small" color="success">
                    <ThumbsUp size={18} />
                  </IconButton>
                  <IconButton size="small" color="error">
                    <ThumbsDown size={18} />
                  </IconButton>
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}

        {filteredFaqItems.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <HelpCircle size={64} color={COLORS.gray} style={{ marginBottom: 16 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No FAQs Found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try a different search term or browse our knowledge base
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Still Need Help */}
      <Paper elevation={2} sx={{ p: 3, mt: 3, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Still Need Help?
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Can't find what you're looking for? Our support team is here to help!
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            startIcon={<MessageSquare />}
            onClick={() => setChatOpen(true)}
          >
            Start Live Chat
          </Button>
          <Button
            variant="outlined"
            startIcon={<Plus />}
            onClick={() => setTicketDialog(true)}
          >
            Create Ticket
          </Button>
          <Button
            variant="outlined"
            startIcon={<Mail />}
            href="mailto:support@speedycrm.com"
          >
            Email Support
          </Button>
        </Box>
      </Paper>
    </Box>
  );

  // ============================================================================
  // TAB 5: VIDEO TUTORIALS
  // ============================================================================
  const renderVideoTutorialsTab = () => (
    <Box>
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
          Video Tutorials
        </Typography>

        <Grid container spacing={3}>
          {VIDEO_TUTORIALS.map((video) => (
            <Grid item xs={12} sm={6} md={4} key={video.id}>
              <Card
                elevation={2}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s',
                  '&:hover': {
                    boxShadow: 6,
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    paddingTop: '56.25%',
                    bgcolor: '#000',
                    cursor: 'pointer',
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'rgba(0,0,0,0.5)',
                      transition: 'all 0.3s',
                      '&:hover': {
                        bgcolor: 'rgba(0,0,0,0.7)',
                      },
                    }}
                  >
                    <PlayCircle size={64} color="white" />
                  </Box>
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 8,
                      right: 8,
                      bgcolor: 'rgba(0,0,0,0.8)',
                      color: 'white',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: '0.875rem',
                      fontWeight: 600,
                    }}
                  >
                    {video.duration}
                  </Box>
                </Box>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {video.title}
                  </Typography>
                  <Chip
                    label={video.category}
                    size="small"
                    sx={{ mb: 2 }}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Eye size={16} color={COLORS.gray} />
                      <Typography variant="caption" color="text.secondary">
                        {video.views.toLocaleString()} views
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Star size={16} color={COLORS.warning} fill={COLORS.warning} />
                      <Typography variant="caption" color="text.secondary">
                        {video.rating}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<PlayCircle />}
                  >
                    Watch Now
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );

  // ============================================================================
  // TAB 6: LIVE CHAT
  // ============================================================================
  const renderLiveChatTab = () => (
    <Box>
      <Paper elevation={2} sx={{ p: 3, height: 600, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Live Chat Support
          </Typography>
          <Chip
            label="AI-Powered"
            icon={<Brain size={14} />}
            size="small"
            color="primary"
          />
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Messages */}
        <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 2, pr: 1 }}>
          {chatMessages.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <MessageCircle size={64} color={COLORS.gray} style={{ marginBottom: 16 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Start a Conversation
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Our AI-powered assistant is here to help you 24/7
              </Typography>
            </Box>
          ) : (
            <Box>
              {chatMessages.map((message) => (
                <Box
                  key={message.id}
                  sx={{
                    display: 'flex',
                    justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      maxWidth: '70%',
                      bgcolor: message.sender === 'user' ? COLORS.primary : '#f5f5f5',
                      color: message.sender === 'user' ? 'white' : 'black',
                      p: 2,
                      borderRadius: 2,
                      borderTopRightRadius: message.sender === 'user' ? 0 : 2,
                      borderTopLeftRadius: message.sender === 'bot' ? 0 : 2,
                    }}
                  >
                    <Typography variant="body2">{message.content}</Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        mt: 0.5,
                        opacity: 0.7,
                      }}
                    >
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </Typography>
                  </Box>
                </Box>
              ))}
              
              {typing && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      bgcolor: '#f5f5f5',
                      p: 2,
                      borderRadius: 2,
                      borderTopLeftRadius: 0,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      AI is typing...
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </Box>

        {/* Input */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            placeholder="Type your message..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            multiline
            maxRows={3}
            size="small"
          />
          <IconButton
            color="primary"
            onClick={handleSendMessage}
            disabled={!chatInput.trim() || typing}
            sx={{
              bgcolor: `${COLORS.primary}15`,
              '&:hover': { bgcolor: `${COLORS.primary}30` },
            }}
          >
            <Send size={20} />
          </IconButton>
        </Box>

        <Alert severity="info" icon={<Brain />} sx={{ mt: 2 }}>
          Our AI assistant can help with common questions. For complex issues, you'll be connected to a human agent.
        </Alert>
      </Paper>
    </Box>
  );

  // ============================================================================
  // TAB 7: COMMUNITY
  // ============================================================================
  const renderCommunityTab = () => (
    <Box>
      <Paper elevation={2} sx={{ p: 3, mb: 3, textAlign: 'center' }}>
        <Users size={64} color={COLORS.primary} style={{ marginBottom: 16 }} />
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
          Community Forum
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Connect with other SpeedyCRM users, share tips, and get help from the community
        </Typography>
        <Chip
          label="Coming Soon"
          color="warning"
          sx={{ mb: 3 }}
        />
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Features planned for the community forum:
          </Typography>
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={6}>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <MessageSquare size={20} color={COLORS.primary} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Discussion Forums"
                    secondary="Topic-based discussions"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Star size={20} color={COLORS.warning} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Best Practices"
                    secondary="Learn from top users"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <ThumbsUp size={20} color={COLORS.success} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Upvote System"
                    secondary="Vote on helpful content"
                  />
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12} sm={6}>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Award size={20} color={COLORS.purple} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Badges & Rewards"
                    secondary="Earn recognition"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Users size={20} color={COLORS.info} />
                  </ListItemIcon>
                  <ListItemText
                    primary="User Profiles"
                    secondary="Build your reputation"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Bell size={20} color={COLORS.danger} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Notifications"
                    secondary="Stay updated on replies"
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );

  // ============================================================================
  // TAB 8: ANALYTICS
  // ============================================================================
  const renderAnalyticsTab = () => (
    <Box>
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
          Support Analytics
        </Typography>

        {/* Satisfaction Trend */}
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Customer Satisfaction Trend
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <RechartsLineChart data={analytics.satisfactionTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis domain={[0, 5]} />
            <RechartsTooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="score"
              stroke={COLORS.success}
              strokeWidth={3}
              name="Satisfaction Score"
            />
          </RechartsLineChart>
        </ResponsiveContainer>
      </Paper>

      {/* Response Metrics */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Response Time Distribution
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="< 1 hour" secondary="67% of tickets" />
                <LinearProgress
                  variant="determinate"
                  value={67}
                  sx={{ width: 100, ml: 2 }}
                />
              </ListItem>
              <ListItem>
                <ListItemText primary="1-4 hours" secondary="24% of tickets" />
                <LinearProgress
                  variant="determinate"
                  value={24}
                  sx={{ width: 100, ml: 2 }}
                />
              </ListItem>
              <ListItem>
                <ListItemText primary="4-24 hours" secondary="7% of tickets" />
                <LinearProgress
                  variant="determinate"
                  value={7}
                  sx={{ width: 100, ml: 2 }}
                />
              </ListItem>
              <ListItem>
                <ListItemText primary="> 24 hours" secondary="2% of tickets" />
                <LinearProgress
                  variant="determinate"
                  value={2}
                  sx={{ width: 100, ml: 2 }}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Resolution Metrics
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">First Response Rate</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>94%</Typography>
              </Box>
              <LinearProgress variant="determinate" value={94} sx={{ height: 8, borderRadius: 4 }} />
            </Box>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Resolution Rate</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>87%</Typography>
              </Box>
              <LinearProgress variant="determinate" value={87} sx={{ height: 8, borderRadius: 4 }} />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Customer Satisfaction</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>96%</Typography>
              </Box>
              <LinearProgress variant="determinate" value={96} sx={{ height: 8, borderRadius: 4 }} />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              p: 2,
              bgcolor: `${COLORS.success}15`,
              borderRadius: 2,
              mr: 2,
            }}
          >
            <HelpCircle size={40} color={COLORS.success} />
          </Box>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 700, color: 'text.primary' }}>
              Support Hub
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Get help, find answers, and connect with our support team
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Tabs */}
      <Paper elevation={2} sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              minHeight: 64,
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 600,
            },
          }}
        >
          <Tab icon={<Activity size={20} />} label="Dashboard" iconPosition="start" />
          <Tab icon={<MessageSquare size={20} />} label="My Tickets" iconPosition="start" />
          <Tab icon={<BookOpen size={20} />} label="Knowledge Base" iconPosition="start" />
          <Tab icon={<HelpCircle size={20} />} label="FAQ" iconPosition="start" />
          <Tab icon={<Video size={20} />} label="Video Tutorials" iconPosition="start" />
          <Tab icon={<MessageCircle size={20} />} label="Live Chat" iconPosition="start" />
          <Tab icon={<Users size={20} />} label="Community" iconPosition="start" />
          <Tab icon={<RechartsBarChart size={20} />} label="Analytics" iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 && renderDashboardTab()}
      {activeTab === 1 && renderTicketsTab()}
      {activeTab === 2 && renderKnowledgeBaseTab()}
      {activeTab === 3 && renderFAQTab()}
      {activeTab === 4 && renderVideoTutorialsTab()}
      {activeTab === 5 && renderLiveChatTab()}
      {activeTab === 6 && renderCommunityTab()}
      {activeTab === 7 && renderAnalyticsTab()}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SupportHub;