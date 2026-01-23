// src/pages/ClientPortal.jsx
// 🎯 ULTIMATE CLIENT PROGRESS PORTAL - COMPLETE VERSION
// SECTION 1 OF 3: Core + Dashboard + Scores Tabs

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db, storage } from '@/lib/firebase';
import {
  collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs,
  onSnapshot, serverTimestamp, writeBatch, orderBy, limit, getDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// MUI Timeline (from @mui/lab)
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import TimelineDot from '@mui/lab/TimelineDot';

// Material-UI Components
import {
  Box, Paper, Typography, Button, TextField, IconButton, Grid, Card,
  CardContent, CardActions, FormControl, InputLabel, Select, MenuItem,
  Chip, Alert, Snackbar, Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer,
  List, ListItem, ListItemText, Checkbox, CircularProgress, Tabs, Tab,
  Stepper, Step, StepLabel, StepContent, Divider, Avatar, Tooltip,
  Badge, Switch, Slider, LinearProgress, Rating, Accordion,
  AccordionSummary, AccordionDetails, Stack, Collapse, Breadcrumbs, SpeedDial, SpeedDialAction,
  SpeedDialIcon, Fab, Menu, ListItemIcon, RadioGroup, FormControlLabel,
  Radio, Autocomplete, InputAdornment, ButtonGroup, ToggleButton,
  ToggleButtonGroup, Container, AppBar, Toolbar, Drawer, ListItemButton,
  OutlinedInput, FormHelperText, CardHeader, CardMedia, ImageList,
  ImageListItem, Pagination, TablePagination, Popover, ClickAwayListener
} from '@mui/material';

// Lucide Icons
import {
  LayoutDashboard, TrendingUp, TrendingDown, Activity, Target, Award,
  BarChart3 as BarIcon, BarChart3, LineChart, PieChart, AreaChart, Shield, ShieldCheck,
  Plus, Edit2, Trash2, Save, Download, Upload, Share2, Copy, Check,
  X, RefreshCw, Filter, Search, SlidersHorizontal, Eye, EyeOff,
  Home, FileText, CreditCard, Users, Settings, Bell, HelpCircle,
  Menu as MenuIcon, ChevronRight, ChevronLeft, ChevronDown, ChevronUp,
  CheckCircle, XCircle, AlertCircle, Clock, Calendar, Mail, Phone,
  FolderOpen, File, Upload as UploadIcon, Paperclip, Image as ImageIcon,
  DollarSign, Wallet, Receipt, TrendingUp as Growth,
  Star, Gift, Trophy, Medal, Zap, Sparkles, Crown, Gem, Hexagon,
  MessageSquare, Send, Inbox, Archive,
  PieChart as Pie, BarChart2, Activity as ActivityIcon,
  Target as TargetIcon, Flag, Bookmark, Heart,
  Wrench, Code, Database, Cloud, Lock, Unlock,
  Facebook, Twitter, Linkedin, Instagram, Share,
  Info, AlertTriangle, Loader, ExternalLink, Link as LinkIcon,
  Moon, Sun, Volume2, VolumeX, Maximize2, Minimize2, MoreVertical,
  Package, ShoppingCart, Tag, Percent, Calendar as CalendarIcon,
  User, UserPlus, UserCheck, UserX, LogOut, Key, Smartphone,
  Globe, Map, MapPin, Video, PlayCircle, PauseCircle, StopCircle,
  Printer, FileDown, FilePlus, FolderPlus, Repeat, RotateCw,
  Scissors, Clipboard, Link2, Hash, AtSign, Smile, Frown, Meh,
  ThumbsUp, ThumbsDown, MessageCircle, AlertOctagon, ShieldAlert,
  Bot, Brain
} from 'lucide-react';

// Document Download Button Component
import DocumentDownloadButton from '../components/documents/DocumentDownloadButton';

// Chart.js Core
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, RadialLinearScale, Title, Tooltip as ChartTooltip,
  Legend, Filler
} from 'chart.js';

// React-ChartJS-2 and other Charting Components
import { Line, Bar, Doughnut } from 'react-chartjs-2'; 
import { Line as RechartsLine } from 'recharts';
import Confetti from 'react-confetti';
import ViewCreditReportButton from '../components/credit/ViewCreditReportButton';

// Note: Removed redundant import of ZellePaymentOption to fix redeclaration error.

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  ArcElement, RadialLinearScale, Title, ChartTooltip, Legend, Filler
);

// ============================================================================
// CREDIT SCORE ANALYSIS ENGINE
// ============================================================================

// ================================================================================
// COMPONENT 1: LIVE AI CHAT ASSISTANT
// ================================================================================

const LiveAIChatAssistant = ({ open, onClose, clientData }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      text: "Hi! I'm your AI assistant. I can help you with credit repair questions, explain your score, suggest next steps, and more. How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickActions = [
    { icon: TrendingUp, label: "Check my score", action: "What's my current credit score?" },
    { icon: Target, label: "Next steps", action: "What should I do next?" },
    { icon: HelpCircle, label: "How it works", action: "How does credit repair work?" },
    { icon: Calendar, label: "Timeline", action: "How long will this take?" }
  ];

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    setTimeout(() => {
      const aiResponse = generateAIResponse(inputMessage, clientData);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'assistant',
        text: aiResponse,
        timestamp: new Date()
      }]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (question, data) => {
    const q = question.toLowerCase();
    
    if (q.includes('score') || q.includes('credit')) {
      return `Your current credit score is ${data?.currentScore || 'being calculated'}. ${
        data?.scoreChange > 0 
          ? `Great news! You've improved by ${data.scoreChange} points recently. 🎉` 
          : 'We\'re working on improving it for you.'
      } Keep up the good work on your payment history!`;
    }
    
    if (q.includes('next') || q.includes('should i do')) {
      return "Based on your profile, here are your next steps:\n1. Review the disputes we filed\n2. Upload any new documentation\n3. Keep making on-time payments\n4. Check back in 30 days for updates";
    }
    
    if (q.includes('how long') || q.includes('timeline')) {
      return "Credit repair typically takes 3-6 months for significant improvements. You'll see updates every 30-45 days as the bureaus respond to disputes. Stay patient and keep following our guidance!";
    }
    
    if (q.includes('how') && q.includes('work')) {
      return "Credit repair works by:\n1. Analyzing your credit reports\n2. Identifying errors and negative items\n3. Disputing inaccuracies with bureaus\n4. Following up on disputes\n5. Building positive credit history\n\nWe handle all the complex paperwork for you!";
    }
    
    return "I'd be happy to help with that! For detailed questions, please contact your credit specialist. You can also explore the resources in your portal for more information.";
  };

  const handleQuickAction = (action) => {
    setInputMessage(action);
  };

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          position: 'fixed',
          right: 20,
          bottom: 20,
          m: 0,
          maxHeight: '600px',
          height: '600px',
          borderRadius: 3
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
            <Bot />
          </Avatar>
          <Box>
            <Typography variant="h6">AI Assistant</Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              Always here to help
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}> 
          <X />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            Quick Actions
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 1 }}>
            {quickActions.map((qa, idx) => (
              <Chip
                key={idx}
                icon={<qa.icon size={16} />}
                label={qa.label}
                size="small"
                onClick={() => handleQuickAction(qa.action)}
                sx={{ cursor: 'pointer' }}
              />
            ))}
          </Stack>
        </Box>

        <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
          {messages.map((msg) => (
            <Box
              key={msg.id}
              sx={{
                display: 'flex',
                justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start',
                mb: 2
              }}
            >
              {msg.type === 'assistant' && (
                <Avatar sx={{ bgcolor: 'primary.main', mr: 1 }}>
                  <Bot size={20} />
                </Avatar>
              )}
              <Paper
                sx={{
                  p: 1.5,
                  maxWidth: '70%',
                  bgcolor: msg.type === 'user' ? 'primary.main' : 'grey.100',
                  color: msg.type === 'user' ? 'white' : 'text.primary',
                  borderRadius: 2,
                  whiteSpace: 'pre-line'
                }}
              >
                <Typography variant="body2">{msg.text}</Typography>
                <Typography variant="caption" sx={{ opacity: 0.7, mt: 0.5, display: 'block' }}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Typography>
              </Paper>
              {msg.type === 'user' && (
                <Avatar sx={{ bgcolor: 'secondary.main', ml: 1 }}>
                  <User size={20} />
                </Avatar>
              )}
            </Box>
          ))}
          
          {isTyping && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <Bot size={20} />
              </Avatar>
              <Paper sx={{ p: 1.5, bgcolor: 'grey.100', borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Typing...
                </Typography>
              </Paper>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>

        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Stack direction="row" spacing={1}>
            <TextField
              fullWidth
              size="small"
              placeholder="Ask me anything..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title="Send message">
                      <IconButton size="small" onClick={handleSendMessage} disabled={!inputMessage.trim()}>
                        <Send size={20} />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                )
              }}
            />
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

// ================================================================================
// COMPONENT 2: LIVE HELPER TOOLTIP
// ================================================================================

const LiveHelper = ({ title, content, children, placement = 'top' }) => {
  const [open, setOpen] = useState(false);
  return (
    <Tooltip
      open={open}
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      title={
        <Box sx={{ p: 1 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
            {title}
          </Typography>
          <Typography variant="body2">{content}</Typography>
        </Box>
      }
      placement={placement}
      arrow
      enterDelay={300}
      leaveDelay={200}
      sx={{ cursor: 'help' }}
    >
      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
        {children}
        <HelpCircle size={16} style={{ opacity: 0.5, cursor: 'help' }} />
      </Box>
    </Tooltip>
  );
};

// ================================================================================
// COMPONENT 3: ZELLE PAYMENT OPTION
// ================================================================================

const ZellePaymentOption = ({ amount, onSuccess, clientInfo }) => {
  const [copied, setCopied] = useState(false);

  const zelleInfo = {
    email: 'payments@speedycreditrepair.com',
    phone: '(714) 555-0100',
    displayName: 'Speedy Credit Repair'
  };

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
            <Smartphone size={32} />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Pay with Zelle
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Fast, secure, and free
            </Typography>
          </Box>
        </Box>

        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            Use your banking app's Zelle feature to send payment to Speedy Credit Repair
          </Typography>
        </Alert>

        <Stack spacing={2}>
          <Box>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Payment Amount
            </Typography>
            <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
              ${amount?.toFixed(2) || '0.00'}
            </Typography>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Send payment to:
            </Typography>
            
            <Paper variant="outlined" sx={{ p: 2, mb: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {zelleInfo.email}
                  </Typography>
                </Box>
                <Tooltip title={copied === 'email' ? 'Copied!' : 'Copy email'}>
                  <IconButton size="small" onClick={() => handleCopy(zelleInfo.email, 'email')}>
                    {copied === 'email' ? <Check color="green" /> : <Copy />}
                  </IconButton>
                </Tooltip>
              </Box>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Phone
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {zelleInfo.phone}
                  </Typography>
                </Box>
                <Tooltip title={copied === 'phone' ? 'Copied!' : 'Copy phone'}>
                  <IconButton size="small" onClick={() => handleCopy(zelleInfo.phone, 'phone')}>
                    {copied === 'phone' ? <Check color="green" /> : <Copy />}
                  </IconButton>
                </Tooltip>
              </Box>
            </Paper>
          </Box>

          <Alert severity="warning" icon={<AlertCircle />}>
            <Typography variant="body2">
              <strong>Important:</strong> Include your name "{clientInfo?.name || 'your name'}" in the payment memo
            </Typography>
          </Alert>
        </Stack>
      </CardContent>

      <CardActions>
        <Button
          fullWidth
          variant="contained"
          size="large"
          startIcon={<CheckCircle />}
          onClick={onSuccess}
        >
          I've Sent the Payment
        </Button>
      </CardActions>
    </Card>
  );
};

// ================================================================================
// END OF COMPONENTS TO ADD
// ================================================================================
// These three components are now ready to use in your ClientPortal!
// ================================================================================

const CreditScoreAnalyzer = {
  getScoreColor: (score) => {
    if (score >= 800) return '#10B981';
    if (score >= 740) return '#3B82F6';
    if (score >= 670) return '#F59E0B';
    if (score >= 580) return '#EF4444';
    return '#991B1B';
  },

  getScoreRating: (score) => {
    if (score >= 800) return 'Exceptional';
    if (score >= 740) return 'Very Good';
    if (score >= 670) return 'Good';
    if (score >= 580) return 'Fair';
    return 'Poor';
  },

  getRecommendations: (score, utilization = 30, inquiries = 2) => {
    const recs = [];
    
    // High Priority: Utilization
    if (utilization > 30) {
      recs.push({
        title: "Lower Credit Utilization",
        description: `Your utilization is at ${utilization}%. Aim for under 10% to see a significant boost in your ${CreditScoreAnalyzer.getScoreRating(score)} score.`,
        priority: "high",
        category: "Utilization",
        impact: "Extreme"
      });
    }

    // High Priority: Low Score / Negative Items
    if (score < 700) {
      recs.push({
        title: "Address Negative Items",
        description: "Focus on the active disputes in your dashboard. Removing inaccuracies is the fastest way to reach the 700+ club.",
        priority: "high",
        category: "Disputes",
        impact: "High"
      });
    }

    // Medium Priority: New Credit
    if (inquiries > 3) {
      recs.push({
        title: "Limit Hard Inquiries",
        description: "You have several recent credit applications. Avoid new hard pulls for the next 90 days.",
        priority: "medium",
        category: "New Credit",
        impact: "Moderate"
      });
    }

    // Low Priority: Age of Credit
    recs.push({
      title: "Keep Old Accounts Open",
      description: "Even if you don't use them, older accounts help your 'Length of Credit History' factor.",
      priority: "low",
      category: "History",
      impact: "Moderate"
    });

    return recs;
  },

  getScoreChangePercent: (oldScore, newScore) => {
    if (!oldScore || oldScore === 0) return 0;
    return ((newScore - oldScore) / oldScore * 100).toFixed(1);
  },

  predictFutureScore: (scoreHistory) => {
    if (!scoreHistory || scoreHistory.length < 2) return null;
    const recentScores = scoreHistory.slice(-6);
    const avgChange = recentScores.reduce((sum, score, i) => {
      if (i === 0) return 0;
      return sum + (score.value - recentScores[i-1].value);
    }, 0) / (recentScores.length - 1);

    const currentScore = recentScores[recentScores.length - 1].value;
    return {
      threeMonths: Math.min(850, Math.max(300, Math.round(currentScore + (avgChange * 3)))),
      sixMonths: Math.min(850, Math.max(300, Math.round(currentScore + (avgChange * 6)))),
      trend: avgChange > 0 ? 'improving' : avgChange < 0 ? 'declining' : 'stable',
      avgMonthlyChange: Math.round(avgChange)
    };
  },
};

// ACHIEVEMENTS object (moved out of CreditScoreAnalyzer)
const ACHIEVEMENTS = {
  scoreIncrease100: {
    id: 'score-100',
    name: 'Century Club',
    description: 'Increased score by 100 points',
    icon: '💯',
    points: 500,
    category: 'Score'
  },
  reached700: {
    id: 'reached-700',
    name: 'Good Credit',
    description: 'Reached a score of 700+',
    icon: '✅',
    points: 200,
    category: 'Milestones'
  },
  reached750: {
    id: 'reached-750',
    name: 'Excellent Credit',
    description: 'Reached a score of 750+',
    icon: '🏆',
    points: 500,
    category: 'Milestones'
  },
  reached800: {
    id: 'reached-800',
    name: 'Credit Royalty',
    description: 'Reached a score of 800+',
    icon: '👑',
    points: 1000,
    category: 'Milestones'
  },
  firstReferral: {
    id: 'first-referral',
    name: 'Share the Love',
    description: 'Referred your first friend',
    icon: '🎁',
    points: 50,
    category: 'Referrals'
  },
  threeMonths: {
    id: 'three-months',
    name: 'Committed',
    description: 'Active for 3 months',
    icon: '📅',
    points: 75,
    category: 'Engagement'
  },
  sixMonths: {
    id: 'six-months',
    name: 'Dedicated',
    description: 'Active for 6 months',
    icon: '💪',
    points: 150,
    category: 'Engagement'
  },
  perfectMonth: {
    id: 'perfect-month',
    name: 'Perfect Month',
    description: 'No late payments for 30 days',
    icon: '✨',
    points: 25,
    category: 'Payments'
  },
  zeroBalance: {
    id: 'zero-balance',
    name: 'Debt Free',
    description: 'Paid off all credit card debt',
    icon: '🎊',
    points: 300,
    category: 'Debt'
  },
  earlyBird: {
    id: 'early-bird',
    name: 'Early Bird',
    description: 'Made 3 early payments',
    icon: '🐦',
    points: 50,
    category: 'Payments'
  }
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

  const ClientPortal = () => {
  const { user, userProfile } = useAuth();
  const fileInputRef = useRef(null);
  const messageInputRef = useRef(null);

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [loading, setLoading] = useState(true);
  const [clientData, setClientData] = useState(null);
  const [creditScores, setCreditScores] = useState({
    experian: { current: 0, previous: 0, history: [] },
    equifax: { current: 0, previous: 0, history: [] },
    transunion: { current: 0, previous: 0, history: [] }
  });
  const [disputes, setDisputes] = useState([]);
  const [deletions, setDeletions] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [goals, setGoals] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [activities, setActivities] = useState([]);
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedBureau, setSelectedBureau] = useState('experian');
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showDocUploadDialog, setShowDocUploadDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showPaymentMethodDialog, setShowPaymentMethodDialog] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  // Zelle dialog state
  const [showZelleDialog, setShowZelleDialog] = useState(false);
  const [showAppointmentDialog, setShowAppointmentDialog] = useState(false);
  const [showProfileEditDialog, setShowProfileEditDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showNotificationSettingsDialog, setShowNotificationSettingsDialog] = useState(false);

  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'info'
  });

  const [stats, setStats] = useState({
    totalDisputes: 0,
    successfulDeletions: 0,
    pendingDisputes: 0,
    scoreIncrease: 0,
    daysActive: 0,
    completionRate: 0,
    totalPoints: 0,
    totalPaid: 0,
    nextPaymentDate: null,
    nextPaymentAmount: 0,
    referralEarnings: 0,
    activeReferrals: 0
  });

  const [disputeFilter, setDisputeFilter] = useState('all');
  const [documentFilter, setDocumentFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  const [goalForm, setGoalForm] = useState({
    title: '',
    targetScore: 750,
    targetDate: '',
    description: ''
  });

  const [messageForm, setMessageForm] = useState({
    subject: '',
    body: '',
    priority: 'normal'
  });

  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: ''
  });

  const [paymentMethodForm, setPaymentMethodForm] = useState({
    type: 'card',
    cardNumber: '',
    cardName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    billingZip: ''
  });

  const [notificationSettings, setNotificationSettings] = useState({
    email: {
      scoreUpdates: true,
      disputeUpdates: true,
      paymentReminders: true,
      achievements: true,
      marketing: false
    },
    sms: {
      scoreUpdates: false,
      disputeUpdates: true,
      paymentReminders: true
    }
  });

  const [disputePage, setDisputePage] = useState(0);
  const [disputeRowsPerPage, setDisputeRowsPerPage] = useState(10);
  const [documentPage, setDocumentPage] = useState(0);
  const [documentRowsPerPage, setDocumentRowsPerPage] = useState(12);

  const [disputeSearch, setDisputeSearch] = useState('');
  const [documentSearch, setDocumentSearch] = useState('');

  // Confetti state for achievement unlock
  const [showConfetti, setShowConfetti] = useState(false);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    if (achievements.length > 0) {
      // Show confetti for 2 seconds when a new achievement is unlocked
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [achievements]);

  useEffect(() => {
    if (!user) return;
    loadAllData();
  }, [user]);

  // ============================================================================
  // DATA LOADING
  // ============================================================================

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadClientProfile(),
        loadCreditScores(),
        loadDisputes(),
        loadDeletions(),
        loadDocuments(),
        loadPayments(),
        loadGoals(),
        loadAchievements(),
        loadActivities(),
        loadMessages(),
        loadNotifications(),
        loadReferrals(),
        loadAppointments(),
        loadInvoices(),
        loadPaymentMethods()
      ]);
      calculateStats();
    } catch (error) {
      console.error('Error loading data:', error);
      showNotification('Error loading data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadClientProfile = async () => {
    try {
      const q = query(collection(db, 'clients'), where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        setClientData({ id: snapshot.docs[0].id, ...data });
        setProfileForm({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || user.email,
          phone: data.phone || '',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          zip: data.zip || ''
        });
        
        if (!data.hasSeenWelcome) {
          setShowWelcomeDialog(true);
          await updateDoc(doc(db, 'clients', snapshot.docs[0].id), { hasSeenWelcome: true });
        }
      } else {
        const newProfile = {
          userId: user.uid,
          email: user.email,
          joinedAt: serverTimestamp(),
          hasSeenWelcome: false,
          accountManager: 'John Smith',
          accountStatus: 'active',
          tier: 'gold',
          referralCode: generateReferralCode()
        };
        const docRef = await addDoc(collection(db, 'clients'), newProfile);
        setClientData({ id: docRef.id, ...newProfile });
        setShowWelcomeDialog(true);
      }
    } catch (error) {
      console.error('Error loading client profile:', error);
    }
};

  const loadCreditScores = async () => {
    try {
      const q = query(
        collection(db, 'creditScores'),
        where('userId', '==', user.uid),
        orderBy('date', 'desc'),
        limit(12)
      );

      const snapshot = await getDocs(q);
      const scoresData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const organized = {
        experian: { current: 0, previous: 0, history: [] },
        equifax: { current: 0, previous: 0, history: [] },
        transunion: { current: 0, previous: 0, history: [] }
      };

      scoresData.forEach(score => {
        if (score.bureau === 'experian') organized.experian.history.push(score);
        else if (score.bureau === 'equifax') organized.equifax.history.push(score);
        else if (score.bureau === 'transunion') organized.transunion.history.push(score);
      });

      ['experian', 'equifax', 'transunion'].forEach(bureau => {
        if (organized[bureau].history.length > 0) {
          organized[bureau].current = organized[bureau].history[0].score;
          if (organized[bureau].history.length > 1) {
            organized[bureau].previous = organized[bureau].history[1].score;
          }
        }
      });

      setCreditScores(organized);
  } catch (error) {
    console.error('Error loading credit scores:', error);
  }
};

  const loadDisputes = async () => {
    try {
      const q = query(
        collection(db, 'disputes'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const disputesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setDisputes(disputesData);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error loading disputes:', error);
    }
  };

  const loadDeletions = async () => {
    try {
      const q = query(
        collection(db, 'deletions'),
        where('userId', '==', user.uid),
        orderBy('deletedAt', 'desc')
      );

      const snapshot = await getDocs(q);
      setDeletions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error loading deletions:', error);
    }
  };

  const loadDocuments = async () => {
    try {
      const q = query(
        collection(db, 'clientDocuments'),
        where('userId', '==', user.uid),
        orderBy('uploadedAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        setDocuments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  const loadPayments = async () => {
    try {
      const q = query(
        collection(db, 'payments'),
        where('userId', '==', user.uid),
        orderBy('date', 'desc'),
        limit(24)
      );

      const snapshot = await getDocs(q);
      setPayments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error loading payments:', error);
    }
  };

  const loadGoals = async () => {
    try {
      const q = query(
        collection(db, 'clientGoals'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        setGoals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  };

  const loadAchievements = async () => {
    try {
      const q = query(
        collection(db, 'clientAchievements'),
        where('userId', '==', user.uid),
        orderBy('unlockedAt', 'desc')
      );

      const snapshot = await getDocs(q);
      setAchievements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error loading achievements:', error);
    }
  };

  const loadActivities = async () => {
    try {
      const q = query(
        collection(db, 'activityLog'),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc'),
        limit(100)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        setActivities(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error loading activities:', error);
    }
  };

  const loadMessages = async () => {
    try {
      const q = query(
        collection(db, 'clientMessages'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const q = query(
        collection(db, 'clientNotifications'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const notificationsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setNotifications(notificationsData);
        setUnreadCount(notificationsData.filter(n => !n.read).length);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const loadReferrals = async () => {
    try {
      const q = query(
        collection(db, 'referrals'),
        where('referrerId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      setReferrals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error loading referrals:', error);
    }
  };

  const loadAppointments = async () => {
    try {
      const q = query(
        collection(db, 'appointments'),
        where('userId', '==', user.uid),
        orderBy('scheduledDate', 'desc'),
        limit(20)
      );

      const snapshot = await getDocs(q);
      setAppointments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error loading appointments:', error);
    }
  };

  const loadInvoices = async () => {
    try {
      const q = query(
        collection(db, 'invoices'),
        where('userId', '==', user.uid),
        orderBy('date', 'desc'),
        limit(24)
      );

      const snapshot = await getDocs(q);
      setInvoices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error loading invoices:', error);
    }
  };

  const loadPaymentMethods = async () => {
    try {
      const q = query(
        collection(db, 'paymentMethods'),
        where('userId', '==', user.uid)
      );

      const snapshot = await getDocs(q);
      setPaymentMethods(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error loading payment methods:', error);
    }
  };

  // ============================================================================
  // CALCULATE STATISTICS
  // ============================================================================

  const calculateStats = useCallback(() => {
    const totalDisputes = disputes.length;
    const successfulDeletions = deletions.length;
    const pendingDisputes = disputes.filter(d => d.status === 'pending' || d.status === 'investigating').length;
    
    let totalIncrease = 0;
    let bureauCount = 0;
    ['experian', 'equifax', 'transunion'].forEach(bureau => {
      if (creditScores[bureau].current && creditScores[bureau].previous) {
        totalIncrease += (creditScores[bureau].current - creditScores[bureau].previous);
        bureauCount++;
      }
    });
    const scoreIncrease = bureauCount > 0 ? Math.round(totalIncrease / bureauCount) : 0;

    // joinedAt can be a Firestore Timestamp, an object with seconds, or a serverTimestamp() sentinel
    // which does not have toMillis() on the client immediately after addDoc. Guard against that.
    const joinedAt = clientData?.joinedAt;
    let joinedMs = null;
    if (joinedAt) {
      if (typeof joinedAt.toMillis === 'function') {
        joinedMs = joinedAt.toMillis();
      } else if (typeof joinedAt.seconds === 'number') {
        joinedMs = joinedAt.seconds * 1000;
      } else {
        // serverTimestamp() or unknown shape — don't compute daysActive yet
        joinedMs = null;
      }
    }

    const daysActive = joinedMs
      ? Math.floor((Date.now() - joinedMs) / (1000 * 60 * 60 * 24))
      : 0;

    const completionRate = totalDisputes > 0 
      ? Math.round((successfulDeletions / totalDisputes) * 100)
      : 0;

    const totalPoints = achievements.reduce((sum, a) => {
      const achievement = ACHIEVEMENTS[a.achievementId];
      return sum + (achievement?.points || 0);
    }, 0);

    const totalPaid = payments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const nextPayment = payments
      .filter(p => p.status === 'pending' && p.dueDate)
      .sort((a, b) => {
        const aDate = a.dueDate.toMillis ? a.dueDate.toMillis() : new Date(a.dueDate).getTime();
        const bDate = b.dueDate.toMillis ? b.dueDate.toMillis() : new Date(b.dueDate).getTime();
        return aDate - bDate;
      })[0];

    const referralEarnings = referrals
      .filter(r => r.status === 'completed')
      .reduce((sum, r) => sum + (r.commission || 100), 0);

    const activeReferrals = referrals.filter(r => r.status === 'active' || r.status === 'completed').length;

    setStats({
      totalDisputes,
      successfulDeletions,
      pendingDisputes,
      scoreIncrease,
      daysActive,
      completionRate,
      totalPoints,
      totalPaid,
      nextPaymentDate: nextPayment?.dueDate || null,
      nextPaymentAmount: nextPayment?.amount || 0,
      referralEarnings,
      activeReferrals
    });
  }, [disputes, deletions, creditScores, clientData, achievements, payments, referrals]);

  useEffect(() => {
    calculateStats();
  }, [calculateStats]);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const showNotification = (message, type = 'info') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'info' });
    }, 5000);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(timestamp);
  };

  const generateReferralCode = () => {
    return 'SCR' + Math.random().toString(36).substr(2, 9).toUpperCase();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showNotification('Copied to clipboard!', 'success');
  };

  // ============================================================================
  // CHART DATA GENERATORS
  // ============================================================================

  const getScoreHistoryChartData = (bureau) => {
    const bureauData = creditScores[bureau];
    if (!bureauData || bureauData.history.length === 0) {
      return { labels: [], datasets: [] };
    }

    const sortedHistory = [...bureauData.history].reverse();
    const labels = sortedHistory.map(s => formatDate(s.date));
    const scores = sortedHistory.map(s => s.score);

    return {
      labels,
      datasets: [
        {
          label: `${bureau.charAt(0).toUpperCase() + bureau.slice(1)} Score`,
          data: scores,
          borderColor: CreditScoreAnalyzer.getScoreColor(bureauData.current),
          backgroundColor: CreditScoreAnalyzer.getScoreColor(bureauData.current) + '20',
          fill: true,
          tension: 0.4,
          pointRadius: 6,
          pointHoverRadius: 8
        }
      ]
    };
  };

  const getAllBureausChartData = () => {
    const maxLength = Math.max(
      creditScores.experian.history.length,
      creditScores.equifax.history.length,
      creditScores.transunion.history.length
    );

    if (maxLength === 0) return { labels: [], datasets: [] };

    const allDates = [
      ...creditScores.experian.history,
      ...creditScores.equifax.history,
      ...creditScores.transunion.history
    ].map(s => s.date?.toMillis()).filter(Boolean);

    const uniqueDates = [...new Set(allDates)].sort();
    const labels = uniqueDates.map(ms => formatDate({ toMillis: () => ms }));

    const datasets = [];

    if (creditScores.experian.history.length > 0) {
      datasets.push({
        label: 'Experian',
        data: [...creditScores.experian.history].reverse().map(s => s.score),
        borderColor: '#EF4444',
        backgroundColor: '#EF444420',
        tension: 0.4
      });
    }

    if (creditScores.equifax.history.length > 0) {
      datasets.push({
        label: 'Equifax',
        data: [...creditScores.equifax.history].reverse().map(s => s.score),
        borderColor: '#3B82F6',
        backgroundColor: '#3B82F620',
        tension: 0.4
      });
    }

    if (creditScores.transunion.history.length > 0) {
      datasets.push({
        label: 'TransUnion',
        data: [...creditScores.transunion.history].reverse().map(s => s.score),
        borderColor: '#10B981',
        backgroundColor: '#10B98120',
        tension: 0.4
      });
    }

    return { labels: labels.slice(-12), datasets };
  };

  const getDisputeStatusChartData = () => {
    const statusCounts = {
      pending: disputes.filter(d => d.status === 'pending').length,
      investigating: disputes.filter(d => d.status === 'investigating').length,
      successful: disputes.filter(d => d.status === 'successful').length,
      failed: disputes.filter(d => d.status === 'failed').length
    };

    return {
      labels: ['Pending', 'Investigating', 'Successful', 'Failed'],
      datasets: [
        {
          data: [statusCounts.pending, statusCounts.investigating, statusCounts.successful, statusCounts.failed],
          backgroundColor: ['#F59E0B', '#3B82F6', '#10B981', '#EF4444'],
          borderColor: ['#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF'],
          borderWidth: 2
        }
      ]
    };
  };

  const getMonthlyActivityChartData = () => {
    const last6Months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      last6Months.push({
        label: date.toLocaleDateString('en-US', { month: 'short' }),
        disputes: 0,
        deletions: 0
      });
    }

    disputes.forEach(dispute => {
      const date = dispute.createdAt?.toDate();
      if (date) {
        const monthDiff = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
        if (monthDiff >= 0 && monthDiff < 6) {
          last6Months[5 - monthDiff].disputes++;
        }
      }
    });

    deletions.forEach(deletion => {
      const date = deletion.deletedAt?.toDate();
      if (date) {
        const monthDiff = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
        if (monthDiff >= 0 && monthDiff < 6) {
          last6Months[5 - monthDiff].deletions++;
        }
      }
    });

    return {
      labels: last6Months.map(m => m.label),
      datasets: [
        {
          label: 'Disputes Filed',
          data: last6Months.map(m => m.disputes),
          backgroundColor: '#3B82F6',
          borderRadius: 8
        },
        {
          label: 'Items Deleted',
          data: last6Months.map(m => m.deletions),
          backgroundColor: '#10B981',
          borderRadius: 8
        }
      ]
    };
  };

  // ============================================================================
  // CHART OPTIONS
  // ============================================================================

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 }
      }
    },
    scales: {
      y: {
        min: 300,
        max: 850,
        ticks: { stepSize: 50 },
        grid: { color: 'rgba(0, 0, 0, 0.05)' }
      },
      x: { grid: { display: false } }
    }
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true, position: 'top' } },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } }
    }
  };

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true, position: 'bottom' } }
  };

  // ============================================================================
  // FILTERED DATA
  // ============================================================================

  const filteredDisputes = useMemo(() => {
    let filtered = disputes;
    if (disputeFilter !== 'all') {
      filtered = filtered.filter(d => d.status === disputeFilter);
    }
    if (disputeSearch) {
      const search = disputeSearch.toLowerCase();
      filtered = filtered.filter(d =>
        d.itemName?.toLowerCase().includes(search) ||
        d.accountNumber?.toLowerCase().includes(search) ||
        d.bureau?.toLowerCase().includes(search)
      );
    }
    return filtered;
  }, [disputes, disputeFilter, disputeSearch]);

  const filteredDocuments = useMemo(() => {
    let filtered = documents;
    if (documentFilter !== 'all') {
      filtered = filtered.filter(d => d.status === documentFilter);
    }
    if (documentSearch) {
      const search = documentSearch.toLowerCase();
      filtered = filtered.filter(d => d.fileName.toLowerCase().includes(search));
    }
    return filtered;
  }, [documents, documentFilter, documentSearch]);

  const paginatedDisputes = useMemo(() => {
    const start = disputePage * disputeRowsPerPage;
    return filteredDisputes.slice(start, start + disputeRowsPerPage);
  }, [filteredDisputes, disputePage, disputeRowsPerPage]);

  const paginatedDocuments = useMemo(() => {
    const start = documentPage * documentRowsPerPage;
    return filteredDocuments.slice(start, start + documentRowsPerPage);
  }, [filteredDocuments, documentPage, documentRowsPerPage]);

  // ============================================================================
  // RENDER: LOADING STATE
  // ============================================================================

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: 'background.default' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" sx={{ mt: 3, color: 'text.secondary' }}>
            Loading Your Progress Portal...
          </Typography>
        </Box>
      </Box>
    );
  }

  // ============================================================================
  // RENDER: MAIN COMPONENT
  // ============================================================================
  // Sidebar navigation items
  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, value: 'dashboard' },
    { label: 'Scores', icon: BarChart3, value: 'scores' },
    { label: 'Disputes', icon: ShieldCheck, value: 'disputes' },
    { label: 'Documents', icon: FileText, value: 'documents' },
    { label: 'Payments', icon: CreditCard, value: 'payments' },
    { label: 'Goals', icon: Target, value: 'goals' },
    { label: 'Achievements', icon: Trophy, value: 'achievements' },
    { label: 'Referrals', icon: Users, value: 'referrals' },
    { label: 'Messages', icon: Mail, value: 'messages' },
    { label: 'Settings', icon: Settings, value: 'settings' },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 3, minHeight: '100vh' }}>
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} numberOfPieces={250} recycle={false} />}
      
      {/* Animated Welcome Banner */}
      {showWelcomeDialog && (
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          zIndex: 1300,
          background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 3,
          boxShadow: 3,
          animation: 'slideDown 1s cubic-bezier(0.23, 1, 0.32, 1)'
        }}>
          <Typography variant="h4" align="center" sx={{ fontWeight: 'bold', letterSpacing: 1 }}>
            Welcome, {profileForm.firstName || user?.displayName || 'Client'}!
          </Typography>
          <Typography variant="subtitle1" align="center" sx={{ opacity: 0.9 }}>
            We're excited to help you achieve your credit goals. Explore your portal and let us know if you need help!
          </Typography>
        </Box>
      )}

      {/* Floating Help Button for LiveAIChatAssistant */}
      <Box sx={{ position: 'fixed', bottom: 32, right: 32, zIndex: 1200 }}>
        <Tooltip title="Need help? Chat with AI Assistant!">
          <IconButton
            size="large"
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              boxShadow: 4,
              '&:hover': { bgcolor: 'primary.dark' },
              animation: 'pulse 2s infinite'
            }}
            onClick={() => setShowMessageDialog(true)}
          >
            <HelpCircle size={32} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Navigation Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {navItems.map((item) => (
            <Tab
              key={item.value}
              value={item.value}
              icon={React.createElement(item.icon, { size: 20 })}
              label={item.label}
              iconPosition="start"
              sx={{ minHeight: 64, textTransform: 'none', fontSize: '0.95rem' }}
            />
          ))}
        </Tabs>
      </Paper>

      {/* Main Portal Content */}
      <Box>
          {/* DASHBOARD TAB */}
          {/* ========================================================================== */}

          {activeTab === 'dashboard' && (
            <Box>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Welcome Back, {clientData?.firstName || 'Client'}! 👋
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Here's your credit repair progress at a glance
                </Typography>
              </Box>

              {/* View Credit Report Button */}
              <Box sx={{ mb: 4 }}>
                <ViewCreditReportButton
                  contactId={user?.uid}
                  contactEmail={user?.email}
                  membershipNumber={clientData?.idiqEnrollment?.membershipNumber}
                  variant="contained"
                  size="large"
                  fullWidth
                  customLabel="View My Credit Report"
                />
              </Box>
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>Avg Credit Score</Typography>
                        <TrendingUp size={24} style={{ opacity: 0.8 }} />
                      </Box>
                      <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {Math.round((creditScores.experian.current + creditScores.equifax.current + creditScores.transunion.current) / 3) || 0}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {stats.scoreIncrease > 0 ? (
                          <>
                            <TrendingUp size={16} />
                            <Typography variant="caption" sx={{ opacity: 0.9 }}>
                              +{stats.scoreIncrease} points this month
                            </Typography>
                          </>
                        ) : (
                          <Typography variant="caption" sx={{ opacity: 0.9 }}>
                            No change this month
                          </Typography>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>Items Deleted</Typography>
                        <CheckCircle size={24} style={{ opacity: 0.8 }} />
                      </Box>
                      <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {stats.successfulDeletions}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.9 }}>
                        {stats.totalDisputes} total disputes
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>Active Disputes</Typography>
                        <Activity size={24} style={{ opacity: 0.8 }} />
                      </Box>
                      <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {stats.pendingDisputes}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.9 }}>
                        {stats.completionRate}% success rate
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>Achievement Points</Typography>
                        <Star size={24} style={{ opacity: 0.8 }} />
                      </Box>
                      <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {stats.totalPoints}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.9 }}>
                        {achievements.length} achievements unlocked
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} lg={8}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                      Credit Score Progress
                    </Typography>
                    <Box sx={{ height: 350 }}>
                      <Line data={getAllBureausChartData()} options={lineChartOptions} />
                    </Box>
                  </Paper>
                </Grid>

                <Grid item xs={12} lg={4}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                      Dispute Status
                    </Typography>
                    <Box sx={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {disputes.length > 0 ? (
                        <Doughnut data={getDisputeStatusChartData()} options={doughnutChartOptions} />
                      ) : (
                        <Typography color="text.secondary" align="center">
                          No disputes yet
                        </Typography>
                      )}
                    </Box>
                  </Paper>
                </Grid>
              </Grid>

              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                      Monthly Activity
                    </Typography>
                    <Box sx={{ height: 300 }}>
                      <Bar data={getMonthlyActivityChartData()} options={barChartOptions} />
                    </Box>
                  </Paper>
                </Grid>
              </Grid>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        Recent Activity
                      </Typography>
                      <Button size="small" endIcon={<ChevronRight size={16} />}>
                        View All
                      </Button>
                    </Box>
                    <Timeline sx={{ py: 0, my: 0 }}>
                      {activities.slice(0, 5).map((activity, index) => (
                        <TimelineItem key={activity.id}>
                          <TimelineOppositeContent sx={{ flex: 0.3, py: 1 }} color="text.secondary" variant="caption">
                            {formatRelativeTime(activity.timestamp)}
                          </TimelineOppositeContent>
                          <TimelineSeparator>
                            <TimelineDot color={
                              activity.type === 'deletion' ? 'success' :
                              activity.type === 'dispute' ? 'primary' :
                              activity.type === 'payment' ? 'warning' : 'grey'
                            }>
                              {activity.type === 'deletion' ? <CheckCircle size={14} /> :
                               activity.type === 'dispute' ? <FileText size={14} /> :
                               activity.type === 'payment' ? <DollarSign size={14} /> :
                               <Activity size={14} />}
                            </TimelineDot>
                            {index < Math.min(activities.length, 5) - 1 && <TimelineConnector />}
                          </TimelineSeparator>
                          <TimelineContent sx={{ py: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {activity.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {activity.description}
                            </Typography>
                          </TimelineContent>
                        </TimelineItem>
                      ))}
                    </Timeline>
                    {activities.length === 0 && (
                      <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                        No recent activity
                      </Typography>
                    )}
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        Recent Achievements
                      </Typography>
                      <Button size="small" endIcon={<ChevronRight size={16} />} onClick={() => setActiveTab('achievements')}>
                        View All
                      </Button>
                    </Box>
                    <List>
                      {achievements.slice(0, 5).map((ach) => {
                        const achievement = ACHIEVEMENTS[ach.achievementId];
                        if (!achievement) return null;
                        
                        return (
                          <ListItem key={ach.id} sx={{ px: 0 }}>
                            <Avatar sx={{ mr: 2, bgcolor: 'primary.light' }}>
                              {achievement.icon}
                            </Avatar>
                            <ListItemText 
                              primaryTypographyProps={{ component: "div" }} 
                              secondaryTypographyProps={{ component: "div" }} 
                              primary={achievement.name} 
                              secondary={
                                <Box component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Box component="span" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                                    {achievement.description}
                                  </Box>
                                  <Chip label={`+${achievement.points} pts`} size="small" color="primary" sx={{ height: 18, fontSize: '0.65rem' }} />
                                </Box>
                              }
                            />
                            <Typography variant="caption" color="text.secondary">
                              {formatRelativeTime(ach.unlockedAt)}
                            </Typography>
                          </ListItem>
                        );
                      })}
                    </List>
                    {achievements.length === 0 && (
                      <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                        Complete actions to unlock achievements!
                      </Typography>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* ========================================================================== */}
          {/* CREDIT SCORES TAB */}
          {/* ========================================================================== */}

          {activeTab === 'scores' && (
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4 }}>
                Credit Scores
              </Typography>

              <Box sx={{ mb: 4 }}>
                <ToggleButtonGroup
                  value={selectedBureau}
                  exclusive
                  onChange={(e, val) => val && setSelectedBureau(val)}
                  sx={{ mb: 2 }}
                >
                  <ToggleButton value="experian">Experian</ToggleButton>
                  <ToggleButton value="equifax">Equifax</ToggleButton>
                  <ToggleButton value="transunion">TransUnion</ToggleButton>
                </ToggleButtonGroup>
              </Box>

              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                  <Card sx={{ 
                    background: `linear-gradient(135deg, ${CreditScoreAnalyzer.getScoreColor(creditScores[selectedBureau].current)}40 0%, ${CreditScoreAnalyzer.getScoreColor(creditScores[selectedBureau].current)}80 100%)`,
                    border: 2,
                    borderColor: CreditScoreAnalyzer.getScoreColor(creditScores[selectedBureau].current)
                  }}>
                    <CardContent sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="overline" sx={{ fontWeight: 'bold' }}>
                        {selectedBureau.toUpperCase()} SCORE
                      </Typography>
                      <Typography variant="h1" sx={{ fontWeight: 'bold', my: 2, color: CreditScoreAnalyzer.getScoreColor(creditScores[selectedBureau].current) }}>
                        {creditScores[selectedBureau].current || 0}
                      </Typography>
                      <Chip 
                        label={CreditScoreAnalyzer.getScoreRating(creditScores[selectedBureau].current)}
                        sx={{ 
                          bgcolor: CreditScoreAnalyzer.getScoreColor(creditScores[selectedBureau].current),
                          color: 'white',
                          fontWeight: 'bold',
                          mb: 2
                        }}
                      />
                      {creditScores[selectedBureau].previous > 0 && (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 2 }}>
                          {creditScores[selectedBureau].current > creditScores[selectedBureau].previous ? (
                            <TrendingUp size={20} style={{ color: '#10B981' }} />
                          ) : creditScores[selectedBureau].current < creditScores[selectedBureau].previous ? (
                            <TrendingDown size={20} style={{ color: '#EF4444' }} />
                          ) : null}
                          <Typography variant="body2">
                            {Math.abs(creditScores[selectedBureau].current - creditScores[selectedBureau].previous)} points from last month
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={8}>
                  <Paper sx={{ p: 3, height: '100%' }}>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                      Score History
                    </Typography>
                    <Box sx={{ height: 300 }}>
                      <Line data={getScoreHistoryChartData(selectedBureau)} options={lineChartOptions} />
                    </Box>
                  </Paper>
                </Grid>
              </Grid>

              <Paper sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                  All Bureaus Comparison
                </Typography>
                <Grid container spacing={3}>
                  {['experian', 'equifax', 'transunion'].map(bureau => (
                    <Grid item xs={12} md={4} key={bureau}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="overline" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                            {bureau.toUpperCase()}
                          </Typography>
                          <Typography variant="h3" sx={{ fontWeight: 'bold', my: 2, color: CreditScoreAnalyzer.getScoreColor(creditScores[bureau].current) }}>
                            {creditScores[bureau].current || 0}
                          </Typography>
                          <Chip 
                            label={CreditScoreAnalyzer.getScoreRating(creditScores[bureau].current)}
                            size="small"
                            sx={{ bgcolor: CreditScoreAnalyzer.getScoreColor(creditScores[bureau].current) + '20', color: CreditScoreAnalyzer.getScoreColor(creditScores[bureau].current), fontWeight: 'bold' }}
                          />
                          {creditScores[bureau].previous > 0 && (
                            <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                              <Typography variant="caption" color="text.secondary">
                                Change from last month
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                {creditScores[bureau].current > creditScores[bureau].previous ? (
                                  <>
                                    <TrendingUp size={16} style={{ color: '#10B981' }} />
                                    <Typography variant="body2" sx={{ color: '#10B981', fontWeight: 'bold' }}>
                                      +{creditScores[bureau].current - creditScores[bureau].previous}
                                    </Typography>
                                  </>
                                ) : creditScores[bureau].current < creditScores[bureau].previous ? (
                                  <>
                                    <TrendingDown size={16} style={{ color: '#EF4444' }} />
                                    <Typography variant="body2" sx={{ color: '#EF4444', fontWeight: 'bold' }}>
                                      {creditScores[bureau].current - creditScores[bureau].previous}
                                    </Typography>
                                  </>
                                ) : (
                                  <Typography variant="body2" color="text.secondary">
                                    No change
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Paper>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                      What Makes Up Your Score
                    </Typography>
                    {[
                      { label: 'Payment History', percent: 35, color: '#EF4444' },
                      { label: 'Credit Utilization', percent: 30, color: '#F59E0B' },
                      { label: 'Credit History Length', percent: 15, color: '#3B82F6' },
                      { label: 'Credit Mix', percent: 10, color: '#8B5CF6' },
                      { label: 'New Credit', percent: 10, color: '#10B981' }
                    ].map((factor, index) => (
                      <Box key={index} sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {factor.label}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: factor.color }}>
                            {factor.percent}%
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={factor.percent} 
                          sx={{ 
                            height: 8, 
                            borderRadius: 4,
                            bgcolor: `${factor.color}20`,
                            '& .MuiLinearProgress-bar': { bgcolor: factor.color }
                          }}
                        />
                      </Box>
                    ))}
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                      AI Recommendations
                    </Typography>
                    <List>
                      {CreditScoreAnalyzer.getRecommendations(
                        creditScores[selectedBureau].current,
                        50,
                        100
                      ).map((rec, index) => (
                        <ListItem key={index} sx={{ px: 0, alignItems: 'flex-start' }}>
                          <Avatar 
                            sx={{ 
                              mr: 2, 
                              bgcolor: rec.priority === 'high' ? 'error.light' : 'warning.light',
                              width: 40,
                              height: 40
                            }}
                          >
                            {rec.priority === 'high' ? <AlertCircle size={20} /> : <Info size={20} />}
                          </Avatar>
                          <ListItemText 
                            primaryTypographyProps={{ component: "div" }} 
                            secondaryTypographyProps={{ component: "div" }} 
                            primary={
                              <Box component="div" sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>
                                {rec.title}
                              </Box>
                            }
                            secondary={
                              <Box component="div">
                                <Box component="div" sx={{ my: 1, fontSize: '0.875rem' }}>
                                  {rec.description}
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                  <Chip label={rec.category} size="small" variant="outlined" />
                                  <Chip label={rec.impact} size="small" color="success" />
                                </Box>
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* ========================================================================== */}
          {/* DISPUTES TAB - COMPLETE */}
          {/* ========================================================================== */}

          {activeTab === 'disputes' && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  Disputes
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    size="small"
                    placeholder="Search disputes..."
                    value={disputeSearch}
                    onChange={(e) => setDisputeSearch(e.target.value)}
                    InputProps={{
                      startAdornment: <Search size={18} style={{ marginRight: 8 }} />
                    }}
                  />
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Filter</InputLabel>
                    <Select
                      value={disputeFilter}
                      onChange={(e) => setDisputeFilter(e.target.value)}
                      label="Filter"
                    >
                      <MenuItem value="all">All Disputes</MenuItem>
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="investigating">Investigating</MenuItem>
                      <MenuItem value="successful">Successful</MenuItem>
                      <MenuItem value="failed">Failed</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              <Grid container spacing={3} sx={{ mb: 4 }}>
                {[
                  { label: 'Total', count: stats.totalDisputes, color: 'primary.main' },
                  { label: 'Pending', count: disputes.filter(d => d.status === 'pending').length, color: 'warning.main' },
                  { label: 'Successful', count: stats.successfulDeletions, color: 'success.main' },
                  { label: 'Success Rate', count: stats.completionRate + '%', color: 'info.main' }
                ].map((stat, i) => (
                  <Grid item xs={12} sm={6} md={3} key={i}>
                    <Card>
                      <CardContent>
                        {/* LiveHelper for Dashboard metrics */}
                        {stat.label === 'Total' ? (
                          <Typography variant="overline" color="text.secondary">{stat.label}</Typography>
                        ) : stat.label === 'Pending' ? (
                          <LiveHelper
                            title="Active Disputes"
                            content="Number of disputes currently being processed with credit bureaus."
                          >
                            <Typography variant="overline" color="text.secondary">Active Disputes</Typography>
                          </LiveHelper>
                        ) : stat.label === 'Successful' ? (
                          <LiveHelper
                            title="Goal Progress"
                            content="Your progress towards your target credit score goal."
                          >
                            <Typography variant="overline" color="text.secondary">Goal Progress</Typography>
                          </LiveHelper>
                        ) : stat.label === 'Success Rate' ? (
                          <LiveHelper
                            title="Reward Points"
                            content="Earn points for completing tasks and reaching milestones!"
                          >
                            <Typography variant="overline" color="text.secondary">Reward Points</Typography>
                          </LiveHelper>
                        ) : (
                          <Typography variant="overline" color="text.secondary">{stat.label}</Typography>
                        )}
                        <Typography variant="h3" sx={{ fontWeight: 'bold', color: stat.color }}>
                          {stat.count}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              <Paper>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Item</TableCell>
                        <TableCell>Bureau</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Filed Date</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedDisputes.map(dispute => (
                        <TableRow key={dispute.id} hover>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {dispute.itemName || 'N/A'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {dispute.accountNumber ? `Account: ${dispute.accountNumber}` : ''}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label={dispute.bureau?.toUpperCase() || 'N/A'} size="small" variant="outlined" />
                          </TableCell>
                          <TableCell>{dispute.disputeType || 'General'}</TableCell>
                          <TableCell>{formatDate(dispute.createdAt)}</TableCell>
                          <TableCell>
                            <Chip 
                              label={dispute.status?.toUpperCase() || 'PENDING'}
                              size="small"
                              color={
                                dispute.status === 'successful' ? 'success' :
                                dispute.status === 'failed' ? 'error' :
                                dispute.status === 'investigating' ? 'info' : 'warning'
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton size="small"><Eye size={18} /></IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  component="div"
                  count={filteredDisputes.length}
                  page={disputePage}
                  onPageChange={(e, newPage) => setDisputePage(newPage)}
                  rowsPerPage={disputeRowsPerPage}
                  onRowsPerPageChange={(e) => {
                    setDisputeRowsPerPage(parseInt(e.target.value, 10));
                    setDisputePage(0);
                  }}
                />
                {filteredDisputes.length === 0 && (
                  <Box sx={{ p: 8, textAlign: 'center' }}>
                    <FileText size={64} style={{ color: '#D1D5DB', marginBottom: 16 }} />
                    <Typography variant="h6" color="text.secondary">No disputes found</Typography>
                  </Box>
                )}
              </Paper>
            </Box>
          )}

          {/* ========================================================================== */}
          {/* DOCUMENTS TAB - COMPLETE */}
          {/* ========================================================================== */}

          {activeTab === 'documents' && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Documents</Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    size="small"
                    placeholder="Search documents..."
                    value={documentSearch}
                    onChange={(e) => setDocumentSearch(e.target.value)}
                    InputProps={{ startAdornment: <Search size={18} style={{ marginRight: 8 }} /> }}
                  />
                  <Button variant="contained" startIcon={<Upload />} onClick={() => setShowDocUploadDialog(true)}>
                    Upload Document
                  </Button>
                </Box>
              </Box>

              <Grid container spacing={3}>
                {paginatedDocuments.map(doc => (
                  <Grid item xs={12} sm={6} md={4} key={doc.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'start', gap: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.light', width: 48, height: 48 }}>
                            <FileText size={24} />
                          </Avatar>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="subtitle2" noWrap sx={{ fontWeight: 'bold' }}>
                              {doc.fileName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {(doc.fileSize / 1024).toFixed(0)} KB • {formatDate(doc.uploadedAt)}
                            </Typography>
                            <Box sx={{ mt: 1 }}>
                              <Chip 
                                label={doc.status?.toUpperCase() || 'PENDING'}
                                size="small"
                                color={doc.status === 'approved' ? 'success' : 'warning'}
                              />
                            </Box>
                          </Box>
                        </Box>
                      </CardContent>
                      <CardActions>
                        <DocumentDownloadButton
                          url={doc.downloadURL}
                          filename={doc.fileName}
                          variant="button"
                          label="Download"
                        />
                        <IconButton size="small" onClick={() => {
                          if (window.confirm('Delete this document?')) {
                            deleteDoc(doc.id, doc.storagePath);
                          }
                        }}>
                          <Trash2 size={16} />
                        </IconButton>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {paginatedDocuments.length > 0 && (
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                  <Pagination
                    count={Math.ceil(filteredDocuments.length / documentRowsPerPage)}
                    page={documentPage + 1}
                    onChange={(e, page) => setDocumentPage(page - 1)}
                  />
                </Box>
              )}

              {filteredDocuments.length === 0 && (
                <Paper sx={{ p: 8, textAlign: 'center' }}>
                  <FolderOpen size={64} style={{ color: '#D1D5DB', marginBottom: 16 }} />
                  <Typography variant="h6" gutterBottom>No documents uploaded</Typography>
                  <Typography color="text.secondary" sx={{ mb: 3 }}>
                    Upload your credit reports, IDs, and other documents
                  </Typography>
                  <Button variant="contained" startIcon={<Upload />} onClick={() => setShowDocUploadDialog(true)}>
                    Upload First Document
                  </Button>
                </Paper>
              )}
            </Box>
          )}

          {/* ========================================================================== */}
          {/* PAYMENTS TAB - COMPLETE */}
          {/* ========================================================================== */}


          {activeTab === 'payments' && (
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4 }}>Payments</Typography>

              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                  <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                    <CardContent>
                      <LiveHelper
                        title="Total Paid"
                        content="Total amount you've paid for credit repair services"
                      >
                        <Typography variant="overline" sx={{ opacity: 0.9 }}>Total Paid</Typography>
                      </LiveHelper>
                      <Typography variant="h3" sx={{ fontWeight: 'bold', my: 1 }}>
                        ${(payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + (p.amount || 0), 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.9 }}>
                        Lifetime payments
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
                    <CardContent>
                      <LiveHelper
                        title="Next Payment"
                        content="Your upcoming payment amount and due date"
                      >
                        <Typography variant="overline" sx={{ opacity: 0.9 }}>Next Payment</Typography>
                      </LiveHelper>
                      <Typography variant="h3" sx={{ fontWeight: 'bold', my: 1 }}>
                        {(() => {
                          const nextPayment = payments
                            .filter(p => p.status === 'pending' && p.date)
                            .sort((a, b) => {
                              const aDate = a.date?.toDate ? a.date.toDate() : new Date(a.date);
                              const bDate = b.date?.toDate ? b.date.toDate() : new Date(b.date);
                              return aDate - bDate;
                            })[0];
                          return nextPayment ? `$${(nextPayment.amount || 0).toFixed(2)}` : 'N/A';
                        })()}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.9 }}>
                        {(() => {
                          const nextPayment = payments
                            .filter(p => p.status === 'pending' && p.date)
                            .sort((a, b) => {
                              const aDate = a.date?.toDate ? a.date.toDate() : new Date(a.date);
                              const bDate = b.date?.toDate ? b.date.toDate() : new Date(b.date);
                              return aDate - bDate;
                            })[0];
                          if (!nextPayment) return 'No upcoming payments';
                          const date = nextPayment.date?.toDate ? nextPayment.date.toDate() : new Date(nextPayment.date);
                          return `Due ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
                        })()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <LiveHelper
                        title="Payment Methods"
                        content="Manage your saved payment methods for easy checkout"
                      >
                        <Typography variant="overline" color="text.secondary">Payment Methods</Typography>
                      </LiveHelper>
                      <Typography variant="h3" sx={{ fontWeight: 'bold', my: 1 }}>
                        {paymentMethods.length}
                      </Typography>
                      <Button size="small" startIcon={<Plus />} onClick={() => setShowPaymentMethodDialog(true)}>
                        Add New
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Quick Pay Options - Zelle, Card, ACH */}
              <Paper sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                  Quick Pay Options
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        cursor: 'pointer', 
                        '&:hover': { bgcolor: 'action.hover', borderColor: 'primary.main' },
                        transition: 'all 0.2s'
                      }}
                      onClick={() => setShowPaymentMethodDialog(true)}
                    >
                      <CardContent sx={{ textAlign: 'center', py: 3 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56, mx: 'auto', mb: 2 }}>
                          <CreditCard size={28} />
                        </Avatar>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                          Credit/Debit Card
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Visa, Mastercard, Amex
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        cursor: 'pointer', 
                        '&:hover': { bgcolor: 'action.hover', borderColor: 'primary.main' },
                        transition: 'all 0.2s'
                      }}
                      onClick={() => setShowPaymentMethodDialog(true)}
                    >
                      <CardContent sx={{ textAlign: 'center', py: 3 }}>
                        <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56, mx: 'auto', mb: 2 }}>
                          <DollarSign size={28} />
                        </Avatar>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                          ACH/Bank Transfer
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Direct from your bank
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        cursor: 'pointer', 
                        '&:hover': { bgcolor: 'action.hover', borderColor: 'warning.main' },
                        transition: 'all 0.2s',
                        border: '2px solid',
                        borderColor: 'warning.main'
                      }}
                      onClick={() => setShowZelleDialog(true)}
                    >
                      <CardContent sx={{ textAlign: 'center', py: 3 }}>
                        <Avatar sx={{ bgcolor: 'warning.main', width: 56, height: 56, mx: 'auto', mb: 2 }}>
                          <Smartphone size={28} />
                        </Avatar>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 0.5 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            Zelle
                          </Typography>
                          <Chip label="Popular" size="small" color="warning" />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          Fast & free transfers
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Paper>

              <Paper sx={{ mb: 4 }}>
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Payment History</Typography>
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Filter</InputLabel>
                    <Select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} label="Filter">
                      <MenuItem value="all">All Payments</MenuItem>
                      <MenuItem value="paid">Paid</MenuItem>
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="failed">Failed</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Method</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {payments
                        .filter(p => paymentFilter === 'all' || p.status === paymentFilter)
                        .slice(0, 10)
                        .map(payment => {
                          const paymentDate = payment.date?.toDate ? payment.date.toDate() : new Date(payment.date || Date.now());
                          return (
                            <TableRow key={payment.id} hover>
                              <TableCell>{paymentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</TableCell>
                              <TableCell>{payment.description || 'Monthly Payment'}</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>
                                ${(payment.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <CreditCard size={16} />
                                  <Typography variant="caption">****{payment.cardLast4 || '0000'}</Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={payment.status?.toUpperCase() || 'PENDING'}
                                  size="small"
                                  color={payment.status === 'paid' ? 'success' : payment.status === 'failed' ? 'error' : 'warning'}
                                />
                              </TableCell>
                              <TableCell>
                                <IconButton size="small"><Download size={16} /></IconButton>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </TableContainer>
                {payments.filter(p => paymentFilter === 'all' || p.status === paymentFilter).length === 0 && (
                  <Box sx={{ p: 8, textAlign: 'center' }}>
                    <Receipt size={64} style={{ color: '#D1D5DB', marginBottom: 16 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>No payments found</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Payment history will appear here once transactions are processed
                    </Typography>
                  </Box>
                )}
              </Paper>

              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>Payment Methods</Typography>
              <Grid container spacing={3}>
                {paymentMethods.map(method => (
                  <Grid item xs={12} sm={6} md={4} key={method.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CreditCard size={20} />
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                              {method.cardBrand || 'Card'}
                            </Typography>
                          </Box>
                          {method.isDefault && <Chip label="Default" size="small" color="primary" />}
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          •••• •••• •••• {method.cardLast4 || '0000'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Expires {method.expiryMonth || 'MM'}/{method.expiryYear || 'YY'}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button size="small">Edit</Button>
                        <Button size="small" color="error" onClick={() => {
                          if (window.confirm('Remove this payment method?')) {
                            deleteDoc(doc(db, 'paymentMethods', method.id))
                              .then(() => {
                                showNotification('Payment method removed', 'success');
                              })
                              .catch((error) => {
                                console.error('Error removing payment method:', error);
                                showNotification('Failed to remove payment method', 'error');
                              });
                          }
                        }}>Remove</Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
                {paymentMethods.length === 0 && (
                  <Grid item xs={12}>
                    <Box sx={{ p: 6, textAlign: 'center', border: '2px dashed', borderColor: 'divider', borderRadius: 2 }}>
                      <CreditCard size={48} style={{ color: '#D1D5DB', marginBottom: 16 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No payment methods added
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Add a payment method to enable automatic payments
                      </Typography>
                      <Button variant="contained" startIcon={<Plus />} onClick={() => setShowPaymentMethodDialog(true)}>
                        Add Payment Method
                      </Button>
                    </Box>
                  </Grid>
                )}
                {paymentMethods.length > 0 && (
                  <Grid item xs={12} sm={6} md={4}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        cursor: 'pointer', 
                        '&:hover': { bgcolor: 'action.hover' } 
                      }} 
                      onClick={() => setShowPaymentMethodDialog(true)}
                    >
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Plus size={48} style={{ color: '#9CA3AF', marginBottom: 8 }} />
                        <Typography variant="body2" color="text.secondary">Add Payment Method</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}

          {/* ========================================================================== */}
          {/* GOALS TAB - COMPLETE */}
          {/* ========================================================================== */}

          {activeTab === 'goals' && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Goals</Typography>
                <Button variant="contained" startIcon={<Plus />} onClick={() => setShowGoalDialog(true)}>
                  Create Goal
                </Button>
              </Box>

              {goals.length === 0 ? (
                <Paper sx={{ p: 8, textAlign: 'center' }}>
                  <Target size={64} style={{ color: '#D1D5DB', marginBottom: 16 }} />
                  <Typography variant="h6" gutterBottom>No goals yet</Typography>
                  <Typography color="text.secondary" sx={{ mb: 3 }}>
                    Set goals to track your credit repair journey
                  </Typography>
                  <Button variant="contained" startIcon={<Plus />} onClick={() => setShowGoalDialog(true)}>
                    Create Your First Goal
                  </Button>
                </Paper>
              ) : (
                <Grid container spacing={3}>
                  {goals.map(goal => {
                    const progress = ((goal.currentScore || 0) / goal.targetScore) * 100;
                    const daysRemaining = goal.targetDate ? Math.ceil((new Date(goal.targetDate.toDate ? goal.targetDate.toDate() : goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24)) : 0;
                    
                    return (
                      <Grid item xs={12} md={6} key={goal.id}>
                        <Card>
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                  {goal.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {goal.description}
                                </Typography>
                              </Box>
                              <Chip 
                                label={goal.status === 'completed' ? 'Completed' : goal.status === 'active' ? 'Active' : 'Paused'}
                                size="small"
                                color={goal.status === 'completed' ? 'success' : goal.status === 'active' ? 'primary' : 'default'}
                              />
                            </Box>

                            <Box sx={{ mb: 2 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="caption" color="text.secondary">
                                  Current: {goal.currentScore || 0}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Target: {goal.targetScore}
                                </Typography>
                              </Box>
                              <LinearProgress 
                                variant="determinate" 
                                value={Math.min(100, progress)}
                                sx={{ height: 8, borderRadius: 4 }}
                              />
                            </Box>

                            <Grid container spacing={2}>
                              <Grid item xs={6}>
                                <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                                  <Typography variant="caption" color="text.secondary">Progress</Typography>
                                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                    {Math.round(progress)}%
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={6}>
                                <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                                  <Typography variant="caption" color="text.secondary">Days Left</Typography>
                                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                    {daysRemaining > 0 ? daysRemaining : 'Overdue'}
                                  </Typography>
                                </Box>
                              </Grid>
                            </Grid>
                          </CardContent>
                          <CardActions>
                            <Button size="small" startIcon={<Edit2 size={16} />}>Edit</Button>
                            <Button size="small" color="error" startIcon={<Trash2 size={16} />} onClick={() => {
                              if (window.confirm('Delete this goal?')) {
                                deleteDoc(doc(db, 'clientGoals', goal.id));
                                showNotification('Goal deleted', 'success');
                              }
                            }}>Delete</Button>
                          </CardActions>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </Box>
          )}

          {/* ========================================================================== */}
          {/* ACHIEVEMENTS TAB - COMPLETE */}
          {/* ========================================================================== */}

          {activeTab === 'achievements' && (
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4 }}>Achievements</Typography>

              <Paper sx={{ p: 3, mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <Grid container spacing={3} alignItems="center">
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h2" sx={{ fontWeight: 'bold', mb: 1 }}>{stats.totalPoints}</Typography>
                      <Typography variant="h6" sx={{ opacity: 0.9 }}>Total Points</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h2" sx={{ fontWeight: 'bold', mb: 1 }}>{achievements.length}</Typography>
                      <Typography variant="h6" sx={{ opacity: 0.9 }}>Unlocked</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h2" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {Object.keys(ACHIEVEMENTS).length - achievements.length}
                      </Typography>
                      <Typography variant="h6" sx={{ opacity: 0.9 }}>Remaining</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>

              <Grid container spacing={3}>
                {Object.entries(ACHIEVEMENTS).map(([key, achievement]) => {
                  const isUnlocked = achievements.some(a => a.achievementId === key);
                  const unlockedDate = achievements.find(a => a.achievementId === key)?.unlockedAt;

                  return (
                    <Grid item xs={12} sm={6} md={4} key={key}>
                      <Card sx={{ border: 2, borderColor: isUnlocked ? 'success.main' : 'divider', opacity: isUnlocked ? 1 : 0.6 }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'start', gap: 2 }}>
                            <Typography variant="h2">{achievement.icon}</Typography>
                            <Box sx={{ flex: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                  {achievement.name}
                                </Typography>
                                {isUnlocked && <CheckCircle size={16} style={{ color: '#10B981' }} />}
                              </Box>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                {achievement.description}
                              </Typography>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Chip label={achievement.category} size="small" variant="outlined" />
                                <Chip 
                                  label={`${achievement.points} pts`}
                                  size="small"
                                  color={isUnlocked ? 'success' : 'default'}
                                  sx={{ fontWeight: 'bold' }}
                                />
                              </Box>
                              {isUnlocked && unlockedDate && (
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                  Unlocked {formatRelativeTime(unlockedDate)}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          )}

          {/* ========================================================================== */}
          {/* REFERRALS TAB - COMPLETE */}
          {/* ========================================================================== */}

          {activeTab === 'referrals' && (
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4 }}>Referral Program</Typography>

              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                  <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                    <CardContent>
                      <Typography variant="overline" sx={{ opacity: 0.9 }}>Total Earnings</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 'bold', my: 1 }}>
                        {formatCurrency(stats.referralEarnings)}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.9 }}>From referrals</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
                    <CardContent>
                      <Typography variant="overline" sx={{ opacity: 0.9 }}>Active Referrals</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 'bold', my: 1 }}>
                        {stats.activeReferrals}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.9 }}>Currently active</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="overline" color="text.secondary">Pending</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 'bold', my: 1 }}>
                        {referrals.filter(r => r.status === 'pending').length}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">Awaiting signup</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Paper sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Your Referral Link</Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth
                    value={`https://speedycredit.com/ref/${clientData?.referralCode || 'LOADING'}`}
                    InputProps={{ readOnly: true }}
                  />
                  <Button 
                    variant="contained" 
                    startIcon={<Copy />}
                    onClick={() => copyToClipboard(`https://speedycredit.com/ref/${clientData?.referralCode}`)}
                  >
                    Copy
                  </Button>
                  <Button variant="outlined" startIcon={<Share2 />} onClick={() => setShowShareDialog(true)}>
                    Share
                  </Button>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Earn $100 for every friend who signs up using your link!
                </Typography>
              </Paper>

              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>Referral History</Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Commission</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {referrals.map(referral => (
                      <TableRow key={referral.id} hover>
                        <TableCell>{referral.referredName || 'N/A'}</TableCell>
                        <TableCell>{referral.referredEmail || 'N/A'}</TableCell>
                        <TableCell>{formatDate(referral.createdAt)}</TableCell>
                        <TableCell>
                          <Chip 
                            label={referral.status?.toUpperCase() || 'PENDING'}
                            size="small"
                            color={
                              referral.status === 'completed' ? 'success' :
                              referral.status === 'active' ? 'info' : 'warning'
                            }
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>
                          {referral.status === 'completed' ? formatCurrency(referral.commission || 100) : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {referrals.length === 0 && (
                <Paper sx={{ p: 8, textAlign: 'center' }}>
                  <Gift size={64} style={{ color: '#D1D5DB', marginBottom: 16 }} />
                  <Typography variant="h6" gutterBottom>No referrals yet</Typography>
                  <Typography color="text.secondary">Share your link to start earning!</Typography>
                </Paper>
              )}
            </Box>
          )}

          {/* ========================================================================== */}
          {/* MESSAGES TAB - COMPLETE */}
          {/* ========================================================================== */}

          {activeTab === 'messages' && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Messages</Typography>
                <Button variant="contained" startIcon={<Send />} onClick={() => setShowMessageDialog(true)}>
                  New Message
                </Button>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ height: 600, overflow: 'auto' }}>
                    <List>
                      {messages.map(message => (
                        <ListItemButton key={message.id} selected={false}>
                          <ListItemIcon>
                            {message.from === 'admin' ? <Inbox size={20} /> : <Send size={20} />}
                          </ListItemIcon>
                          <ListItemText 
                            primaryTypographyProps={{ component: "div" }} 
                            secondaryTypographyProps={{ component: "div" }} 
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box component="span" sx={{ fontWeight: message.read ? 'normal' : 'bold', fontSize: '0.875rem' }}>
                                  {message.subject}
                                </Box>
                                {!message.read && message.from === 'admin' && (
                                  <Badge badgeContent="New" color="error" />
                                )}
                              </Box>
                            }
                            secondary={
                              <Box component="div">
                                <Box component="span" sx={{ display: 'block', fontSize: '0.75rem', color: 'text.secondary' }}>
                                  {formatRelativeTime(message.createdAt)}
                                </Box>
                                <Box component="span" sx={{ display: 'block', fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {message.body?.substring(0, 50)}...
                                </Box>
                              </Box>
                            }
                          />
                        </ListItemButton>
                      ))}
                    </List>
                    {messages.length === 0 && (
                      <Box sx={{ p: 4, textAlign: 'center' }}>
                        <MessageSquare size={48} style={{ color: '#D1D5DB', marginBottom: 8 }} />
                        <Typography color="text.secondary">No messages</Typography>
                      </Box>
                    )}
                  </Paper>
                </Grid>

                <Grid item xs={12} md={8}>
                  <Paper sx={{ p: 3, height: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Mail size={64} style={{ color: '#D1D5DB', marginBottom: 16 }} />
                      <Typography variant="h6" color="text.secondary">
                        Select a message to view
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* ========================================================================== */}
          {/* SETTINGS TAB - COMPLETE */}
          {/* ========================================================================== */}

          {activeTab === 'settings' && (
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4 }}>Settings</Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Profile Information</Typography>
                      <Button size="small" startIcon={<Edit2 />} onClick={() => setShowProfileEditDialog(true)}>
                        Edit
                      </Button>
                    </Box>
                    <List>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemText primary="Name" secondary={`${profileForm.firstName} ${profileForm.lastName}` || 'Not set'} />
                      </ListItem>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemText primary="Email" secondary={profileForm.email || 'Not set'} />
                      </ListItem>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemText primary="Phone" secondary={profileForm.phone || 'Not set'} />
                      </ListItem>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemText primary="Address" secondary={`${profileForm.address}, ${profileForm.city}, ${profileForm.state} ${profileForm.zip}` || 'Not set'} />
                      </ListItem>
                    </List>
                  </Paper>

                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>Security</Typography>
                    <List>
                      <ListItemButton onClick={() => setShowPasswordDialog(true)}>
                        <ListItemIcon><Lock size={20} /></ListItemIcon>
                        <ListItemText primary="Change Password" secondary="Update your password" />
                        <ChevronRight size={20} />
                      </ListItemButton>
                      <ListItemButton>
                        <ListItemIcon><Smartphone size={20} /></ListItemIcon>
                        <ListItemText primary="Two-Factor Authentication" secondary="Not enabled" />
                        <Switch />
                      </ListItemButton>
                    </List>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Notifications</Typography>
                      <Button size="small" startIcon={<Edit2 />} onClick={() => setShowNotificationSettingsDialog(true)}>
                        Edit
                      </Button>
                    </Box>
                    <List>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemText primary="Email Notifications" />
                        <Switch checked={notificationSettings.email.scoreUpdates} />
                      </ListItem>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemText primary="SMS Notifications" />
                        <Switch checked={notificationSettings.sms.scoreUpdates} />
                      </ListItem>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemText primary="Marketing Emails" />
                        <Switch checked={notificationSettings.email.marketing} />
                      </ListItem>
                    </List>
                  </Paper>

                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                      Account
                    </Typography>
                    <List>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemText primary="Account Status" secondary={clientData?.accountStatus?.toUpperCase() || 'ACTIVE'} />
                        <Chip label={clientData?.tier?.toUpperCase() || 'GOLD'} color="primary" size="small" />
                      </ListItem>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemText primary="Member Since" secondary={formatDate(clientData?.joinedAt)} />
                      </ListItem>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemText primary="Account Manager" secondary={clientData?.accountManager || 'Not assigned'} />
                      </ListItem>
                    </List>
                    <Divider sx={{ my: 2 }} />
                    <Button fullWidth variant="outlined" color="error" startIcon={<LogOut />}>
                      Sign Out
                    </Button>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* ========================================================================== */}
          {/* ALL DIALOGS - COMPLETE */}
          {/* ========================================================================== */}

          {/* Document Upload Dialog */}
          <Dialog open={showDocUploadDialog} onClose={() => setShowDocUploadDialog(false)}>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogContent>
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    if (file.size > 10 * 1024 * 1024) {
                      showNotification('File must be less than 10MB', 'error');
                      return;
                    }
                    try {
                      const timestamp = Date.now();
                      const fileName = `${timestamp}_${file.name}`;
                      const storageRef = ref(storage, `client-documents/${user.uid}/${fileName}`);
                      await uploadBytes(storageRef, file);
                      const downloadURL = await getDownloadURL(storageRef);
                      await addDoc(collection(db, 'clientDocuments'), {
                        userId: user.uid,
                        fileName: file.name,
                        fileSize: file.size,
                        fileType: file.type,
                        downloadURL,
                        storagePath: storageRef.fullPath,
                        uploadedAt: serverTimestamp(),
                        status: 'pending-review'
                      });
                      showNotification('Document uploaded!', 'success');
                      setShowDocUploadDialog(false);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    } catch (error) {
                      console.error(error);
                      showNotification('Upload failed', 'error');
                    }
                  }}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
                <Button variant="outlined" size="large" startIcon={<Upload />} onClick={() => fileInputRef.current?.click()}>
                  Choose File
                </Button>
                <Typography variant="caption" display="block" sx={{ mt: 2 }} color="text.secondary">
                  Accepted: PDF, JPG, PNG, DOC (Max 10MB)
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowDocUploadDialog(false)}>Cancel</Button>
            </DialogActions>
          </Dialog>

          {/* Zelle Payment Dialog */}
          <Dialog open={showZelleDialog} onClose={() => setShowZelleDialog(false)} maxWidth="xs" fullWidth>
            <DialogTitle>Pay with Zelle</DialogTitle>
            <DialogContent>
              <ZellePaymentOption 
                amount={stats.nextPaymentAmount || 0} 
                clientInfo={clientData} 
                onSuccess={() => {
                  setShowZelleDialog(false);
                  showNotification('Payment received! Thank you.', 'success');
                }} 
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowZelleDialog(false)}>Close</Button>
            </DialogActions>
          </Dialog>

          {/* Goal Creation Dialog */}
          <Dialog open={showGoalDialog} onClose={() => setShowGoalDialog(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Create New Goal</DialogTitle>
            <DialogContent>
              <TextField
                fullWidth
                label="Goal Title"
                value={goalForm.title}
                onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                sx={{ mt: 2, mb: 2 }}
              />
              <TextField
                fullWidth
                label="Target Score"
                type="number"
                value={goalForm.targetScore}
                onChange={(e) => setGoalForm({ ...goalForm, targetScore: parseInt(e.target.value) })}
                sx={{ mb: 2 }}
                inputProps={{ min: 300, max: 850 }}
              />
              <TextField
                fullWidth
                label="Target Date"
                type="date"
                value={goalForm.targetDate}
                onChange={(e) => setGoalForm({ ...goalForm, targetDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={goalForm.description}
                onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowGoalDialog(false)}>Cancel</Button>
              <Button variant="contained" onClick={async () => {
                if (!goalForm.title || !goalForm.targetScore || !goalForm.targetDate) {
                  showNotification('Please fill all fields', 'warning');
                  return;
                }
                try {
                  const currentAvg = Math.round((creditScores.experian.current + creditScores.equifax.current + creditScores.transunion.current) / 3);
                  await addDoc(collection(db, 'clientGoals'), {
                    userId: user.uid,
                    title: goalForm.title,
                    description: goalForm.description,
                    targetScore: parseInt(goalForm.targetScore),
                    currentScore: currentAvg,
                    targetDate: new Date(goalForm.targetDate),
                    progress: 0,
                    status: 'active',
                    createdAt: serverTimestamp()
                  });
                  showNotification('Goal created!', 'success');
                  setShowGoalDialog(false);
                  setGoalForm({ title: '', targetScore: 750, targetDate: '', description: '' });
                } catch (error) {
                  console.error(error);
                  showNotification('Error creating goal', 'error');
                }
              }}>Create Goal</Button>
            </DialogActions>
          </Dialog>

          {/* Message Dialog */}
          <Dialog open={showMessageDialog} onClose={() => setShowMessageDialog(false)} maxWidth="md" fullWidth>
            <DialogTitle>New Message</DialogTitle>
            <DialogContent>
              <TextField
                fullWidth
                label="Subject"
                value={messageForm.subject}
                onChange={(e) => setMessageForm({ ...messageForm, subject: e.target.value })}
                sx={{ mt: 2, mb: 2 }}
              />
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={messageForm.priority}
                  onChange={(e) => setMessageForm({ ...messageForm, priority: e.target.value })}
                  label="Priority"
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="normal">Normal</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Message"
                multiline
                rows={6}
                value={messageForm.body}
                onChange={(e) => setMessageForm({ ...messageForm, body: e.target.value })}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowMessageDialog(false)}>Cancel</Button>
              <Button variant="contained" startIcon={<Send />} onClick={async () => {
                if (!messageForm.subject || !messageForm.body) {
                  showNotification('Please fill all fields', 'warning');
                  return;
                }
                try {
                  await addDoc(collection(db, 'clientMessages'), {
                    userId: user.uid,
                    subject: messageForm.subject,
                    body: messageForm.body,
                    priority: messageForm.priority,
                    from: 'client',
                    to: 'admin',
                    status: 'sent',
                    read: false,
                    createdAt: serverTimestamp()
                  });
                  showNotification('Message sent!', 'success');
                  setShowMessageDialog(false);
                  setMessageForm({ subject: '', body: '', priority: 'normal' });
                } catch (error) {
                  console.error(error);
                  showNotification('Error sending message', 'error');
                }
              }}>Send Message</Button>
            </DialogActions>
          </Dialog>

          {/* Profile Edit Dialog */}
          <Dialog open={showProfileEditDialog} onClose={() => setShowProfileEditDialog(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={profileForm.firstName}
                    onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={profileForm.lastName}
                    onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="City"
                    value={profileForm.city}
                    onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    fullWidth
                    label="State"
                    value={profileForm.state}
                    onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    fullWidth
                    label="ZIP"
                    value={profileForm.zip}
                    onChange={(e) => setProfileForm({ ...profileForm, zip: e.target.value })}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowProfileEditDialog(false)}>Cancel</Button>
              <Button variant="contained" onClick={async () => {
                try {
                  if (clientData?.id) {
                    await updateDoc(doc(db, 'clients', clientData.id), {
                      ...profileForm,
                      updatedAt: serverTimestamp()
                    });
                    setClientData(prev => ({ ...prev, ...profileForm }));
                    showNotification('Profile updated!', 'success');
                    setShowProfileEditDialog(false);
                  }
                } catch (error) {
                  console.error(error);
                  showNotification('Error updating profile', 'error');
                }
              }}>Save Changes</Button>
            </DialogActions>
          </Dialog>

          {/* Payment Method Dialog */}
          <Dialog open={showPaymentMethodDialog} onClose={() => setShowPaymentMethodDialog(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Add Payment Method</DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Card Number"
                    value={paymentMethodForm.cardNumber}
                    onChange={(e) => setPaymentMethodForm({ ...paymentMethodForm, cardNumber: e.target.value })}
                    placeholder="1234 5678 9012 3456"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Cardholder Name"
                    value={paymentMethodForm.cardName}
                    onChange={(e) => setPaymentMethodForm({ ...paymentMethodForm, cardName: e.target.value })}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    label="Exp Month"
                    value={paymentMethodForm.expiryMonth}
                    onChange={(e) => setPaymentMethodForm({ ...paymentMethodForm, expiryMonth: e.target.value })}
                    placeholder="MM"
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    label="Exp Year"
                    value={paymentMethodForm.expiryYear}
                    onChange={(e) => setPaymentMethodForm({ ...paymentMethodForm, expiryYear: e.target.value })}
                    placeholder="YY"
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    label="CVV"
                    value={paymentMethodForm.cvv}
                    onChange={(e) => setPaymentMethodForm({ ...paymentMethodForm, cvv: e.target.value })}
                    placeholder="123"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Billing ZIP"
                    value={paymentMethodForm.billingZip}
                    onChange={(e) => setPaymentMethodForm({ ...paymentMethodForm, billingZip: e.target.value })}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowPaymentMethodDialog(false)}>Cancel</Button>
              <Button variant="contained" onClick={async () => {
                if (!paymentMethodForm.cardNumber || !paymentMethodForm.cardName) {
                  showNotification('Please fill all fields', 'warning');
                  return;
                }
                try {
                  const detectBrand = (num) => {
                    const cleaned = num.replace(/\s/g, '');
                    if (/^4/.test(cleaned)) return 'Visa';
                    if (/^5[1-5]/.test(cleaned)) return 'Mastercard';
                    if (/^3[47]/.test(cleaned)) return 'Amex';
                    return 'Card';
                  };
                  await addDoc(collection(db, 'paymentMethods'), {
                    userId: user.uid,
                    type: 'card',
                    cardLast4: paymentMethodForm.cardNumber.slice(-4),
                    cardBrand: detectBrand(paymentMethodForm.cardNumber),
                    cardName: paymentMethodForm.cardName,
                    expiryMonth: paymentMethodForm.expiryMonth,
                    expiryYear: paymentMethodForm.expiryYear,
                    billingZip: paymentMethodForm.billingZip,
                    isDefault: paymentMethods.length === 0,
                    createdAt: serverTimestamp()
                  });
                  showNotification('Payment method added!', 'success');
                  setShowPaymentMethodDialog(false);
                  setPaymentMethodForm({ type: 'card', cardNumber: '', cardName: '', expiryMonth: '', expiryYear: '', cvv: '', billingZip: '' });
                } catch (error) {
                  console.error(error);
                  showNotification('Error adding payment method', 'error');
                }
              }}>Add Card</Button>
            </DialogActions>
          </Dialog>

          {/* Share Dialog */}
          <Dialog open={showShareDialog} onClose={() => setShowShareDialog(false)}>
            <DialogTitle>Share Your Referral Link</DialogTitle>
            <DialogContent>
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="body2" sx={{ mb: 3 }}>
                  Share via social media
                </Typography>
                <Stack direction="row" spacing={2} justifyContent="center">
                  <IconButton sx={{ bgcolor: '#1877F2', color: 'white', '&:hover': { bgcolor: '#166FE5' } }}>
                    <Facebook />
                  </IconButton>
                  <IconButton sx={{ bgcolor: '#1DA1F2', color: 'white', '&:hover': { bgcolor: '#1A91DA' } }}>
                    <Twitter />
                  </IconButton>
                  <IconButton sx={{ bgcolor: '#0A66C2', color: 'white', '&:hover': { bgcolor: '#095196' } }}>
                    <Linkedin />
                  </IconButton>
                  <IconButton sx={{ bgcolor: '#E4405F', color: 'white', '&:hover': { bgcolor: '#D62F4F' } }}>
                    <Instagram />
                  </IconButton>
                </Stack>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowShareDialog(false)}>Close</Button>
            </DialogActions>
          </Dialog>

          {/* Notification Settings Dialog */}
          <Dialog open={showNotificationSettingsDialog} onClose={() => setShowNotificationSettingsDialog(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Notification Settings</DialogTitle>
            <DialogContent>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>Email Notifications</Typography>
              <List>
                {Object.entries(notificationSettings.email).map(([key, value]) => (
                  <ListItem key={key} sx={{ px: 0 }}>
                    <ListItemText primary={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} />
                    <Switch
                      checked={value}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        email: { ...notificationSettings.email, [key]: e.target.checked }
                      })}
                    />
                  </ListItem>
                ))}
              </List>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>SMS Notifications</Typography>
              <List>
                {Object.entries(notificationSettings.sms).map(([key, value]) => (
                  <ListItem key={key} sx={{ px: 0 }}>
                    <ListItemText primary={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} />
                    <Switch
                      checked={value}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        sms: { ...notificationSettings.sms, [key]: e.target.checked }
                      })}
                    />
                  </ListItem>
                ))}
              </List>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowNotificationSettingsDialog(false)}>Cancel</Button>
              <Button variant="contained" onClick={async () => {
                try {
                  if (clientData?.id) {
                    await updateDoc(doc(db, 'clients', clientData.id), {
                      notificationSettings,
                      updatedAt: serverTimestamp()
                    });
                    showNotification('Settings updated!', 'success');
                    setShowNotificationSettingsDialog(false);
                  }
                } catch (error) {
                  console.error(error);
                  showNotification('Error updating settings', 'error');
                }
              }}>Save Changes</Button>
            </DialogActions>
          </Dialog>

          {/* Notifications Popover */}
          <Popover
            open={Boolean(notificationAnchor)}
            anchorEl={notificationAnchor}
            onClose={() => setNotificationAnchor(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Box sx={{ width: 360, maxHeight: 400 }}>
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Notifications</Typography>
                {unreadCount > 0 && (
                  <Button size="small" onClick={async () => {
                    const batch = writeBatch(db);
                    notifications.filter(n => !n.read).forEach(n => {
                      batch.update(doc(db, 'clientNotifications', n.id), { read: true, readAt: serverTimestamp() });
                    });
                    await batch.commit();
                    showNotification('All marked as read', 'success');
                  }}>Mark all read</Button>
                )}
              </Box>
              <List sx={{ maxHeight: 320, overflow: 'auto' }}>
                {notifications.slice(0, 10).map(notif => (
                  <ListItemButton key={notif.id} onClick={async () => {
                    if (!notif.read) {
                      await updateDoc(doc(db, 'clientNotifications', notif.id), { read: true, readAt: serverTimestamp() });
                    }
                  }}>
                    <ListItemIcon>
                      <Badge variant="dot" invisible={notif.read} color="error">
                        <Bell size={20} />
                      </Badge>
                    </ListItemIcon>
                    <ListItemText 
                      primaryTypographyProps={{ component: "div" }} 
                      secondaryTypographyProps={{ component: "div" }} 
                      primary={notif.title} 
                      secondary={
                        <Box component="div">
                          <Box component="span" sx={{ display: 'block', fontSize: '0.75rem' }}>
                            {notif.message}
                          </Box>
                          <Box component="span" sx={{ display: 'block', fontSize: '0.75rem', color: 'text.secondary' }}>
                            {formatRelativeTime(notif.createdAt)}
                          </Box>
                        </Box>
                      }
                    />
                  </ListItemButton>
                ))}
              </List>
              {notifications.length === 0 && (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Bell size={48} style={{ color: '#D1D5DB', marginBottom: 8 }} />
                  <Typography color="text.secondary">No notifications</Typography>
                </Box>
              )}
            </Box>
          </Popover>

          {/* LiveAIChatAssistant Dialog */}
          <LiveAIChatAssistant 
            open={showMessageDialog} 
            onClose={() => setShowMessageDialog(false)} 
            clientData={clientData}
          />

          {/* Snackbar for Notifications */}
          <Snackbar
            open={notification.show}
            autoHideDuration={4000}
            onClose={() => setNotification({ ...notification, show: false })}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert 
              onClose={() => setNotification({ ...notification, show: false })} 
              severity={notification.type}
              variant="filled"
            >
              {notification.message}
            </Alert>
          </Snackbar>
      </Box>
    </Container>
  );
};

export default ClientPortal;