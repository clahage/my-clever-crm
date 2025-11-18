// ============================================
// PROGRESS PORTAL HUB
// Path: /src/pages/client/ProgressPortalHub.jsx
// ============================================
// Client-facing progress portal dashboard
// Credit tracking, disputes, docs, messaging, payments
// ============================================

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  LinearProgress,
  Chip,
  Avatar,
  Button,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Badge,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Paper,
  Grid,
  Stepper,
  Step,
  StepLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Award,
  FileText,
  MessageSquare,
  CreditCard,
  Calendar,
  BookOpen,
  Settings,
  Download,
  Upload,
  Send,
  Check,
  X,
  AlertCircle,
  Clock,
  Target,
  Star,
  Zap,
  Shield,
  Users,
  Mail,
  Phone,
  DollarSign,
  CheckCircle,
  XCircle,
  MinusCircle,
  ArrowUp,
  ArrowDown,
  Activity,
  Trophy,
  Gift,
  Bell,
  Eye,
  Edit,
  Trash2,
  Plus,
  ChevronRight,
  Home,
  BarChart3,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { collection, query, where, orderBy, getDocs, doc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

// ============================================
// CONSTANTS & CONFIGURATION
// ============================================

const CREDIT_BUREAUS = ['Experian', 'Equifax', 'TransUnion'];

const SCORE_RANGES = {
  excellent: { min: 750, max: 850, color: '#10b981', label: 'Excellent' },
  good: { min: 700, max: 749, color: '#3b82f6', label: 'Good' },
  fair: { min: 650, max: 699, color: '#f59e0b', label: 'Fair' },
  poor: { min: 300, max: 649, color: '#ef4444', label: 'Poor' },
};

const ACHIEVEMENT_BADGES = {
  firstDispute: { icon: '🎯', label: 'First Dispute Sent', color: '#3b82f6' },
  firstDeletion: { icon: '🎉', label: 'First Item Deleted', color: '#10b981' },
  score50: { icon: '📈', label: '50 Points Improved', color: '#8b5cf6' },
  score100: { icon: '🚀', label: '100 Points Improved', color: '#ec4899' },
  allBureaus: { icon: '🏆', label: 'All Bureaus Improved', color: '#f59e0b' },
  sixMonths: { icon: '⏰', label: '6 Months Active', color: '#06b6d4' },
  excellent: { icon: '👑', label: 'Excellent Credit', color: '#eab308' },
};

const DISPUTE_STATUSES = {
  pending: { label: 'Pending', color: '#f59e0b', icon: Clock },
  investigating: { label: 'Under Investigation', color: '#3b82f6', icon: Activity },
  resolved: { label: 'Resolved', color: '#10b981', icon: CheckCircle },
  verified: { label: 'Verified', color: '#6b7280', icon: MinusCircle },
  deleted: { label: 'Deleted', color: '#10b981', icon: Check },
};

// ============================================
// MAIN COMPONENT
// ============================================

const ProgressPortalHub = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [clientData, setClientData] = useState(null);
  const [creditScores, setCreditScores] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [payments, setPayments] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [actionPlan, setActionPlan] = useState([]);
  const [settings, setSettings] = useState({});

  // Dialog states
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');

  // ============================================
  // DATA LOADING
  // ============================================

  useEffect(() => {
    if (currentUser) {
      loadAllData();
    }
  }, [currentUser]);

  const loadAllData = async () => {
    console.log('📊 Loading progress portal data for client:', currentUser.uid);
    setLoading(true);

    try {
      await Promise.all([
        loadClientProfile(),
        loadCreditScores(),
        loadDisputes(),
        loadDocuments(),
        loadMessages(),
        loadPayments(),
        loadAppointments(),
        loadAchievements(),
        loadActionPlan(),
        loadSettings(),
      ]);

      console.log('✅ All data loaded successfully');
    } catch (error) {
      console.error('❌ Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadClientProfile = async () => {
    try {
      const clientRef = doc(db, 'contacts', currentUser.uid);
      const clientSnap = await getDoc(clientRef);
      
      if (clientSnap.exists()) {
        setClientData(clientSnap.data());
      }
    } catch (error) {
      console.error('❌ Error loading client profile:', error);
    }
  };

  const loadCreditScores = async () => {
    try {
      const scoresRef = collection(db, 'creditScores');
      const q = query(
        scoresRef,
        where('clientId', '==', currentUser.uid),
        orderBy('pulledDate', 'desc')
      );

      const snapshot = await getDocs(q);
      const scores = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setCreditScores(scores);
    } catch (error) {
      console.error('❌ Error loading credit scores:', error);
      setCreditScores([]);
    }
  };

  const loadDisputes = async () => {
    try {
      const disputesRef = collection(db, 'disputes');
      const q = query(
        disputesRef,
        where('clientId', '==', currentUser.uid),
        orderBy('sentDate', 'desc')
      );

      const snapshot = await getDocs(q);
      const disputeData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setDisputes(disputeData);
    } catch (error) {
      console.error('❌ Error loading disputes:', error);
      setDisputes([]);
    }
  };

  const loadDocuments = async () => {
    try {
      const docsRef = collection(db, 'clientDocuments');
      const q = query(
        docsRef,
        where('clientId', '==', currentUser.uid),
        orderBy('uploadedAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setDocuments(docs);
    } catch (error) {
      console.error('❌ Error loading documents:', error);
      setDocuments([]);
    }
  };

  const loadMessages = async () => {
    try {
      const messagesRef = collection(db, 'clientMessages');
      const q = query(
        messagesRef,
        where('clientId', '==', currentUser.uid),
        orderBy('timestamp', 'desc'),
        limit(50)
      );

      const snapshot = await getDocs(q);
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setMessages(msgs);
    } catch (error) {
      console.error('❌ Error loading messages:', error);
      setMessages([]);
    }
  };

  const loadPayments = async () => {
    try {
      const paymentsRef = collection(db, 'payments');
      const q = query(
        paymentsRef,
        where('clientId', '==', currentUser.uid),
        orderBy('date', 'desc')
      );

      const snapshot = await getDocs(q);
      const paymentData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setPayments(paymentData);
    } catch (error) {
      console.error('❌ Error loading payments:', error);
      setPayments([]);
    }
  };

  const loadAppointments = async () => {
    try {
      const apptRef = collection(db, 'appointments');
      const q = query(
        apptRef,
        where('clientId', '==', currentUser.uid),
        orderBy('scheduledFor', 'desc')
      );

      const snapshot = await getDocs(q);
      const appts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setAppointments(appts);
    } catch (error) {
      console.error('❌ Error loading appointments:', error);
      setAppointments([]);
    }
  };

  const loadAchievements = async () => {
    try {
      const achieveRef = collection(db, 'clientAchievements');
      const q = query(
        achieveRef,
        where('clientId', '==', currentUser.uid),
        orderBy('earnedAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const achieve = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setAchievements(achieve);
    } catch (error) {
      console.error('❌ Error loading achievements:', error);
      setAchievements([]);
    }
  };

  const loadActionPlan = async () => {
    try {
      const planRef = collection(db, 'actionPlans');
      const q = query(
        planRef,
        where('clientId', '==', currentUser.uid),
        where('status', '!=', 'completed'),
        orderBy('priority', 'asc')
      );

      const snapshot = await getDocs(q);
      const plan = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setActionPlan(plan);
    } catch (error) {
      console.error('❌ Error loading action plan:', error);
      setActionPlan([]);
    }
  };

  const loadSettings = async () => {
    try {
      const settingsRef = doc(db, 'clientSettings', currentUser.uid);
      const settingsSnap = await getDoc(settingsRef);
      
      if (settingsSnap.exists()) {
        setSettings(settingsSnap.data());
      } else {
        // Default settings
        setSettings({
          emailNotifications: true,
          smsNotifications: true,
          theme: 'light',
          language: 'en',
        });
      }
    } catch (error) {
      console.error('❌ Error loading settings:', error);
    }
  };

  // ============================================
  // AI HELPER FUNCTIONS
  // ============================================

  const calculateScoreImprovement = () => {
    if (creditScores.length < 2) return null;

    const latest = creditScores[0];
    const earliest = creditScores[creditScores.length - 1];

    const improvements = {};
    CREDIT_BUREAUS.forEach(bureau => {
      const latestScore = latest[bureau.toLowerCase()] || 0;
      const earliestScore = earliest[bureau.toLowerCase()] || 0;
      improvements[bureau] = latestScore - earliestScore;
    });

    const avgImprovement = Object.values(improvements).reduce((a, b) => a + b, 0) / 3;

    return {
      improvements,
      average: avgImprovement,
      trend: avgImprovement > 0 ? 'improving' : avgImprovement < 0 ? 'declining' : 'stable',
    };
  };

  const predictNextScore = (bureau) => {
    if (creditScores.length < 3) return null;

    // Simple linear regression for prediction
    const scores = creditScores.slice(0, 6).reverse().map(s => s[bureau.toLowerCase()] || 0);
    
    // Calculate trend
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    scores.forEach((score, index) => {
      sumX += index;
      sumY += score;
      sumXY += index * score;
      sumX2 += index * index;
    });

    const n = scores.length;
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Predict next score
    const predicted = Math.round(slope * n + intercept);

    return {
      predicted: Math.min(850, Math.max(300, predicted)),
      trend: slope > 0 ? 'improving' : slope < 0 ? 'declining' : 'stable',
      confidence: n >= 6 ? 'high' : 'medium',
    };
  };

  const calculateDisputeSuccessRate = () => {
    if (disputes.length === 0) return 0;

    const resolved = disputes.filter(d => 
      d.status === 'resolved' || d.status === 'deleted'
    ).length;

    return ((resolved / disputes.length) * 100).toFixed(0);
  };

  const getNextMilestone = () => {
    if (creditScores.length === 0) return null;

    const latestScore = creditScores[0];
    const avgScore = Math.round(
      (latestScore.experian + latestScore.equifax + latestScore.transunion) / 3
    );

    const milestones = [
      { score: 650, label: 'Fair Credit', icon: '📊' },
      { score: 700, label: 'Good Credit', icon: '📈' },
      { score: 750, label: 'Excellent Credit', icon: '⭐' },
      { score: 800, label: 'Exceptional Credit', icon: '🏆' },
    ];

    const nextMilestone = milestones.find(m => m.score > avgScore);

    if (!nextMilestone) return null;

    return {
      ...nextMilestone,
      pointsNeeded: nextMilestone.score - avgScore,
      progress: ((avgScore - 300) / (nextMilestone.score - 300)) * 100,
    };
  };

  const getPersonalizedRecommendations = () => {
    const recommendations = [];

    // Check for overdue disputes
    const overdueDisputes = disputes.filter(d => 
      d.status === 'pending' && 
      new Date(d.sentDate) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );

    if (overdueDisputes.length > 0) {
      recommendations.push({
        type: 'action',
        priority: 'high',
        title: 'Follow up on disputes',
        description: `You have ${overdueDisputes.length} disputes pending for over 30 days`,
        icon: AlertCircle,
        color: '#ef4444',
      });
    }

    // Check for missing documents
    if (documents.length < 5) {
      recommendations.push({
        type: 'action',
        priority: 'medium',
        title: 'Upload more documents',
        description: 'Additional documentation can strengthen your disputes',
        icon: Upload,
        color: '#f59e0b',
      });
    }

    // Check for score improvement opportunity
    const improvement = calculateScoreImprovement();
    if (improvement && improvement.average > 0) {
      recommendations.push({
        type: 'celebration',
        priority: 'low',
        title: 'Great progress!',
        description: `Your score has improved by ${improvement.average.toFixed(0)} points on average`,
        icon: TrendingUp,
        color: '#10b981',
      });
    }

    // Check for upcoming appointment
    const upcomingAppt = appointments.find(a => 
      new Date(a.scheduledFor) > new Date() && 
      new Date(a.scheduledFor) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    );

    if (upcomingAppt) {
      recommendations.push({
        type: 'reminder',
        priority: 'medium',
        title: 'Upcoming appointment',
        description: `You have a consultation on ${new Date(upcomingAppt.scheduledFor).toLocaleDateString()}`,
        icon: Calendar,
        color: '#3b82f6',
      });
    }

    return recommendations.slice(0, 5); // Top 5 recommendations
  };

  // ============================================
  // TAB 1: DASHBOARD OVERVIEW
  // ============================================

  const renderDashboardTab = () => {
    const improvement = calculateScoreImprovement();
    const successRate = calculateDisputeSuccessRate();
    const nextMilestone = getNextMilestone();
    const recommendations = getPersonalizedRecommendations();

    return (
      <Box className="space-y-6">
        {/* ===== WELCOME MESSAGE ===== */}
        <Card elevation={3}>
          <CardContent>
            <Box className="flex items-center justify-between">
              <Box>
                <Typography variant="h5" className="font-bold mb-2">
                  Welcome back, {clientData?.firstName || 'there'}! 👋
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  Here's your credit repair progress at a glance
                </Typography>
              </Box>
              <Avatar
                sx={{ width: 80, height: 80, bgcolor: '#3b82f6', fontSize: '2rem' }}
              >
                {clientData?.firstName?.[0]}{clientData?.lastName?.[0]}
              </Avatar>
            </Box>
          </CardContent>
        </Card>

        {/* ===== KEY METRICS ===== */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Box className="flex items-center justify-between">
                  <Box>
                    <Typography variant="caption" className="text-gray-600">
                      Average Score
                    </Typography>
                    <Typography variant="h4" className="font-bold">
                      {creditScores.length > 0 ? 
                        Math.round((creditScores[0].experian + creditScores[0].equifax + creditScores[0].transunion) / 3)
                        : 'N/A'}
                    </Typography>
                  </Box>
                  <TrendingUp className="w-10 h-10 text-green-600" />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Box className="flex items-center justify-between">
                  <Box>
                    <Typography variant="caption" className="text-gray-600">
                      Total Improvement
                    </Typography>
                    <Typography variant="h4" className="font-bold text-green-600">
                      {improvement ? `+${improvement.average.toFixed(0)}` : 'N/A'}
                    </Typography>
                  </Box>
                  <ArrowUp className="w-10 h-10 text-green-600" />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Box className="flex items-center justify-between">
                  <Box>
                    <Typography variant="caption" className="text-gray-600">
                      Success Rate
                    </Typography>
                    <Typography variant="h4" className="font-bold text-blue-600">
                      {successRate}%
                    </Typography>
                  </Box>
                  <Target className="w-10 h-10 text-blue-600" />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Box className="flex items-center justify-between">
                  <Box>
                    <Typography variant="caption" className="text-gray-600">
                      Active Disputes
                    </Typography>
                    <Typography variant="h4" className="font-bold text-orange-600">
                      {disputes.filter(d => d.status === 'pending' || d.status === 'investigating').length}
                    </Typography>
                  </Box>
                  <Activity className="w-10 h-10 text-orange-600" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* ===== NEXT MILESTONE ===== */}
        {nextMilestone && (
          <Card elevation={3}>
            <CardContent>
              <Box className="flex items-center gap-3 mb-3">
                <Typography variant="h6" className="font-semibold">
                  {nextMilestone.icon} Next Milestone: {nextMilestone.label}
                </Typography>
              </Box>
              <Box className="mb-2">
                <Box className="flex items-center justify-between mb-1">
                  <Typography variant="body2" className="text-gray-600">
                    {nextMilestone.pointsNeeded} points to go
                  </Typography>
                  <Typography variant="body2" className="font-semibold">
                    {nextMilestone.progress.toFixed(0)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={nextMilestone.progress}
                  sx={{ height: 10, borderRadius: 5 }}
                />
              </Box>
              <Typography variant="caption" className="text-gray-600">
                Keep up the great work! You're making excellent progress.
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* ===== RECOMMENDATIONS ===== */}
        {recommendations.length > 0 && (
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" className="font-semibold mb-3">
                💡 Personalized Recommendations
              </Typography>
              <Box className="space-y-2">
                {recommendations.map((rec, index) => {
                  const Icon = rec.icon;
                  return (
                    <Alert
                      key={index}
                      severity={
                        rec.priority === 'high' ? 'error' :
                        rec.priority === 'medium' ? 'warning' : 'info'
                      }
                      icon={<Icon className="w-5 h-5" />}
                    >
                      <Typography variant="body2" className="font-semibold">
                        {rec.title}
                      </Typography>
                      <Typography variant="caption">
                        {rec.description}
                      </Typography>
                    </Alert>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        )}

        {/* ===== RECENT ACHIEVEMENTS ===== */}
        {achievements.length > 0 && (
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" className="font-semibold mb-3">
                🏆 Recent Achievements
              </Typography>
              <Box className="flex gap-3 flex-wrap">
                {achievements.slice(0, 6).map((achievement) => {
                  const badge = ACHIEVEMENT_BADGES[achievement.type];
                  return (
                    <Chip
                      key={achievement.id}
                      icon={<span className="text-xl">{badge?.icon}</span>}
                      label={badge?.label || achievement.type}
                      sx={{
                        bgcolor: badge?.color,
                        color: 'white',
                        fontWeight: 600,
                      }}
                    />
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>
    );
  };

  // ============================================
  // TAB 2: CREDIT SCORE PROGRESS
  // ============================================

  const renderCreditScoreTab = () => {
    if (creditScores.length === 0) {
      return (
        <Alert severity="info">
          No credit scores available yet. We'll pull your first report soon!
        </Alert>
      );
    }

    const latestScore = creditScores[0];
    const scoreHistory = creditScores.slice(0, 12).reverse();

    // Prepare chart data
    const chartData = scoreHistory.map((score, index) => ({
      month: new Date(score.pulledDate).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      Experian: score.experian || 0,
      Equifax: score.equifax || 0,
      TransUnion: score.transunion || 0,
    }));

    return (
      <Box className="space-y-6">
        {/* ===== CURRENT SCORES ===== */}
        <Grid container spacing={3}>
          {CREDIT_BUREAUS.map(bureau => {
            const score = latestScore[bureau.toLowerCase()] || 0;
            const prediction = predictNextScore(bureau);
            
            let scoreRange = SCORE_RANGES.poor;
            for (const [key, range] of Object.entries(SCORE_RANGES)) {
              if (score >= range.min && score <= range.max) {
                scoreRange = range;
                break;
              }
            }

            return (
              <Grid item xs={12} md={4} key={bureau}>
                <Card elevation={3}>
                  <CardContent>
                    <Typography variant="h6" className="font-semibold mb-2">
                      {bureau}
                    </Typography>
                    <Box className="text-center my-4">
                      <Typography
                        variant="h2"
                        className="font-bold"
                        style={{ color: scoreRange.color }}
                      >
                        {score}
                      </Typography>
                      <Chip
                        label={scoreRange.label}
                        size="small"
                        sx={{
                          bgcolor: scoreRange.color,
                          color: 'white',
                          fontWeight: 600,
                          mt: 1,
                        }}
                      />
                    </Box>
                    {prediction && (
                      <Box className="mt-3">
                        <Divider className="mb-2" />
                        <Box className="flex items-center justify-between">
                          <Typography variant="caption" className="text-gray-600">
                            Predicted Next
                          </Typography>
                          <Box className="flex items-center gap-1">
                            <Typography variant="caption" className="font-semibold">
                              {prediction.predicted}
                            </Typography>
                            {prediction.trend === 'improving' ? (
                              <TrendingUp className="w-4 h-4 text-green-600" />
                            ) : prediction.trend === 'declining' ? (
                              <TrendingDown className="w-4 h-4 text-red-600" />
                            ) : null}
                          </Box>
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* ===== SCORE HISTORY CHART ===== */}
        <Card elevation={3}>
          <CardContent>
            <Typography variant="h6" className="font-semibold mb-4">
              📈 Credit Score History
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[300, 850]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="Experian"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="Equifax"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="TransUnion"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* ===== SCORE FACTORS ===== */}
        <Card elevation={3}>
          <CardContent>
            <Typography variant="h6" className="font-semibold mb-3">
              📊 Factors Affecting Your Score
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <List>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: '#10b981' }}>
                        <Check className="w-5 h-5" />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Payment History"
                      secondary="35% impact • On-time payments help most"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: '#3b82f6' }}>
                        <DollarSign className="w-5 h-5" />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Credit Utilization"
                      secondary="30% impact • Keep below 30%"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: '#f59e0b' }}>
                        <Clock className="w-5 h-5" />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Credit History Length"
                      secondary="15% impact • Older is better"
                    />
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={12} md={6}>
                <List>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: '#8b5cf6' }}>
                        <CreditCard className="w-5 h-5" />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Credit Mix"
                      secondary="10% impact • Variety helps"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: '#ec4899' }}>
                        <Plus className="w-5 h-5" />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="New Credit"
                      secondary="10% impact • Limit applications"
                    />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    );
  };

  // ============================================
  // TAB 3: DISPUTE TRACKER
  // ============================================

  const renderDisputeTrackerTab = () => {
    if (disputes.length === 0) {
      return (
        <Alert severity="info">
          No disputes have been filed yet. We'll start disputing negative items soon!
        </Alert>
      );
    }

    // Group disputes by status
    const groupedDisputes = disputes.reduce((acc, dispute) => {
      if (!acc[dispute.status]) {
        acc[dispute.status] = [];
      }
      acc[dispute.status].push(dispute);
      return acc;
    }, {});

    return (
      <Box className="space-y-6">
        {/* ===== DISPUTE SUMMARY ===== */}
        <Grid container spacing={3}>
          {Object.entries(DISPUTE_STATUSES).map(([status, config]) => {
            const count = groupedDisputes[status]?.length || 0;
            const Icon = config.icon;
            
            return (
              <Grid item xs={12} sm={6} md={4} lg={2.4} key={status}>
                <Card elevation={2}>
                  <CardContent>
                    <Box className="flex items-center justify-between">
                      <Box>
                        <Typography variant="caption" className="text-gray-600">
                          {config.label}
                        </Typography>
                        <Typography variant="h4" className="font-bold" style={{ color: config.color }}>
                          {count}
                        </Typography>
                      </Box>
                      <Icon className="w-10 h-10" style={{ color: config.color }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* ===== DISPUTE LIST ===== */}
        <Card elevation={3}>
          <CardContent>
            <Typography variant="h6" className="font-semibold mb-3">
              ⚖️ All Disputes
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Item</TableCell>
                    <TableCell>Bureau</TableCell>
                    <TableCell>Sent Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {disputes.map(dispute => {
                    const statusConfig = DISPUTE_STATUSES[dispute.status];
                    const StatusIcon = statusConfig.icon;
                    
                    return (
                      <TableRow key={dispute.id}>
                        <TableCell>
                          <Typography variant="body2" className="font-semibold">
                            {dispute.itemName}
                          </Typography>
                          <Typography variant="caption" className="text-gray-600">
                            {dispute.accountNumber}
                          </Typography>
                        </TableCell>
                        <TableCell>{dispute.bureau}</TableCell>
                        <TableCell>
                          {new Date(dispute.sentDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={<StatusIcon className="w-4 h-4" />}
                            label={statusConfig.label}
                            size="small"
                            sx={{
                              bgcolor: statusConfig.color,
                              color: 'white',
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton size="small">
                            <Eye className="w-4 h-4" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* ===== DISPUTE TIMELINE ===== */}
        <Card elevation={3}>
          <CardContent>
            <Typography variant="h6" className="font-semibold mb-4">
              📅 Dispute Timeline
            </Typography>
            <Stepper orientation="vertical">
              {disputes.slice(0, 5).map((dispute, index) => (
                <Step key={dispute.id} active={true} completed={dispute.status === 'resolved' || dispute.status === 'deleted'}>
                  <StepLabel>
                    <Box>
                      <Typography variant="body2" className="font-semibold">
                        {dispute.itemName} - {dispute.bureau}
                      </Typography>
                      <Typography variant="caption" className="text-gray-600">
                        {new Date(dispute.sentDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </CardContent>
        </Card>
      </Box>
    );
  };

  // ============================================
  // REMAINING TABS (SIMPLIFIED FOR SPACE)
  // ============================================

  const renderDocumentsTab = () => (
    <Card elevation={3}>
      <CardContent>
        <Box className="flex items-center justify-between mb-4">
          <Typography variant="h6" className="font-semibold">
            📄 Your Documents
          </Typography>
          <Button
            variant="contained"
            startIcon={<Upload className="w-4 h-4" />}
            onClick={() => setDocumentDialogOpen(true)}
          >
            Upload Document
          </Button>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Document</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Uploaded</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documents.map(doc => (
                <TableRow key={doc.id}>
                  <TableCell>{doc.name}</TableCell>
                  <TableCell>{doc.type}</TableCell>
                  <TableCell>{new Date(doc.uploadedAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <IconButton size="small">
                      <Download className="w-4 h-4" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );

  const renderActionPlanTab = () => (
    <Card elevation={3}>
      <CardContent>
        <Typography variant="h6" className="font-semibold mb-4">
          ✅ Your Personalized Action Plan
        </Typography>
        <List>
          {actionPlan.map((task, index) => (
            <ListItem key={task.id}>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: task.completed ? '#10b981' : '#3b82f6' }}>
                  {task.completed ? <Check className="w-5 h-5" /> : <Target className="w-5 h-5" />}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={task.title}
                secondary={task.description}
              />
              <Chip label={task.priority} size="small" color={
                task.priority === 'high' ? 'error' : 
                task.priority === 'medium' ? 'warning' : 'default'
              } />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );

  const renderMessagesTab = () => (
    <Card elevation={3}>
      <CardContent>
        <Box className="flex items-center justify-between mb-4">
          <Typography variant="h6" className="font-semibold">
            💬 Messages with Your Case Manager
          </Typography>
          <Button
            variant="contained"
            startIcon={<Send className="w-4 h-4" />}
            onClick={() => setMessageDialogOpen(true)}
          >
            New Message
          </Button>
        </Box>
        <List>
          {messages.map(msg => (
            <ListItem key={msg.id} alignItems="flex-start">
              <ListItemAvatar>
                <Avatar>{msg.from === 'client' ? 'Y' : 'S'}</Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={msg.subject}
                secondary={
                  <>
                    <Typography variant="caption" className="text-gray-600">
                      {new Date(msg.timestamp).toLocaleString()}
                    </Typography>
                    <br />
                    {msg.message}
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );

  const renderPaymentsTab = () => (
    <Card elevation={3}>
      <CardContent>
        <Typography variant="h6" className="font-semibold mb-4">
          💳 Billing & Payments
        </Typography>
        <Alert severity="info" className="mb-4">
          Next payment of $99 due on {new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString()}
        </Alert>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Receipt</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.map(payment => (
                <TableRow key={payment.id}>
                  <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                  <TableCell>${payment.amount}</TableCell>
                  <TableCell>
                    <Chip
                      label={payment.status}
                      size="small"
                      color={payment.status === 'paid' ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small">
                      <Download className="w-4 h-4" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );

  const renderAppointmentsTab = () => (
    <Card elevation={3}>
      <CardContent>
        <Box className="flex items-center justify-between mb-4">
          <Typography variant="h6" className="font-semibold">
            📅 Appointments & Consultations
          </Typography>
          <Button
            variant="contained"
            startIcon={<Plus className="w-4 h-4" />}
            onClick={() => setAppointmentDialogOpen(true)}
          >
            Book Appointment
          </Button>
        </Box>
        <List>
          {appointments.map(appt => (
            <ListItem key={appt.id}>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: '#3b82f6' }}>
                  <Calendar className="w-5 h-5" />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={appt.title}
                secondary={`${new Date(appt.scheduledFor).toLocaleString()} - ${appt.duration} minutes`}
              />
              <Button size="small" variant="outlined">
                Join Call
              </Button>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );

  const renderEducationTab = () => (
    <Card elevation={3}>
      <CardContent>
        <Typography variant="h6" className="font-semibold mb-4">
          📚 Credit Education Center
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card elevation={1}>
              <CardContent>
                <Typography variant="h6" className="font-semibold mb-2">
                  📖 Understanding Credit Scores
                </Typography>
                <Typography variant="body2" className="text-gray-600 mb-3">
                  Learn how credit scores work and what factors affect them most.
                </Typography>
                <Button variant="outlined" fullWidth>
                  Read Article
                </Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card elevation={1}>
              <CardContent>
                <Typography variant="h6" className="font-semibold mb-2">
                  🎥 Dispute Process Explained
                </Typography>
                <Typography variant="body2" className="text-gray-600 mb-3">
                  Watch our video guide on how the dispute process works.
                </Typography>
                <Button variant="outlined" fullWidth>
                  Watch Video
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const renderSettingsTab = () => (
    <Card elevation={3}>
      <CardContent>
        <Typography variant="h6" className="font-semibold mb-4">
          ⚙️ Account Settings
        </Typography>
        <Box className="space-y-4">
          <FormControlLabel
            control={<Switch checked={settings.emailNotifications} />}
            label="Email Notifications"
          />
          <FormControlLabel
            control={<Switch checked={settings.smsNotifications} />}
            label="SMS Notifications"
          />
          <FormControl fullWidth>
            <InputLabel>Theme</InputLabel>
            <Select value={settings.theme || 'light'}>
              <MenuItem value="light">Light</MenuItem>
              <MenuItem value="dark">Dark</MenuItem>
              <MenuItem value="auto">Auto</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </CardContent>
    </Card>
  );

  // ============================================
  // MAIN RENDER
  // ============================================

  if (loading) {
    return (
      <Box className="flex items-center justify-center h-screen">
        <Box className="text-center">
          <LinearProgress sx={{ width: 300, mb: 2 }} />
          <Typography variant="body2" className="text-gray-600">
            Loading your progress portal...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <Box className="max-w-7xl mx-auto">
        {/* ===== HEADER ===== */}
        <Box className="mb-6">
          <Typography variant="h4" className="font-bold mb-2">
            Your Credit Repair Journey
          </Typography>
          <Typography variant="body2" className="text-gray-600">
            Track your progress, manage disputes, and achieve your credit goals
          </Typography>
        </Box>

        {/* ===== TABS ===== */}
        <Paper elevation={3} className="mb-6">
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab icon={<Home className="w-5 h-5" />} label="Dashboard" />
            <Tab icon={<TrendingUp className="w-5 h-5" />} label="Credit Scores" />
            <Tab icon={<Shield className="w-5 h-5" />} label="Disputes" />
            <Tab icon={<FileText className="w-5 h-5" />} label="Documents" />
            <Tab icon={<Target className="w-5 h-5" />} label="Action Plan" />
            <Tab icon={<MessageSquare className="w-5 h-5" />} label="Messages" />
            <Tab icon={<CreditCard className="w-5 h-5" />} label="Billing" />
            <Tab icon={<Calendar className="w-5 h-5" />} label="Appointments" />
            <Tab icon={<BookOpen className="w-5 h-5" />} label="Education" />
            <Tab icon={<Settings className="w-5 h-5" />} label="Settings" />
          </Tabs>
        </Paper>

        {/* ===== TAB CONTENT ===== */}
        <Box>
          {activeTab === 0 && renderDashboardTab()}
          {activeTab === 1 && renderCreditScoreTab()}
          {activeTab === 2 && renderDisputeTrackerTab()}
          {activeTab === 3 && renderDocumentsTab()}
          {activeTab === 4 && renderActionPlanTab()}
          {activeTab === 5 && renderMessagesTab()}
          {activeTab === 6 && renderPaymentsTab()}
          {activeTab === 7 && renderAppointmentsTab()}
          {activeTab === 8 && renderEducationTab()}
          {activeTab === 9 && renderSettingsTab()}
        </Box>
      </Box>
    </Box>
  );
};

export default ProgressPortalHub;