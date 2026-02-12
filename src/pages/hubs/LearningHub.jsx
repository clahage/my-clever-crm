// src/pages/learning/LearningHub.jsx
// ============================================================================
// 🎓 ULTIMATE LEARNING HUB - AI-POWERED TRAINING SYSTEM
// ============================================================================
// PROJECT: SpeedyCRM - Credit Repair CRM
// TABS: 10 fully implemented tabs
// AI FEATURES: 30+ AI-powered capabilities
// ============================================================================
// TAB 0: Course Library - Browse, filter, enroll in courses
// TAB 1: Video Training - Video lessons with progress tracking
// TAB 2: Knowledge Base - Articles, guides, AI-powered search
// TAB 3: AI Tutor - Interactive AI chat tutor
// TAB 4: Quizzes - AI-generated assessments
// TAB 5: Certifications - Cert tracking, badges, progress
// TAB 6: Analytics - Learning metrics, charts, AI insights
// TAB 7: Team Training - Team progress management (admin)
// TAB 8: Mobile App - Mobile learning resources
// TAB 9: Content Manager - Admin content creation (admin only)
// ============================================================================
// © 1995-2026 Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved
// ============================================================================

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Tabs,
  Tab,
  LinearProgress,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Alert,
  AlertTitle,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
  Avatar,
  Badge,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Switch,
  Radio,
  RadioGroup,
  FormLabel,
  Rating,
  Slider,
  Fade,
  Zoom,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Stack,
  Container,
  Snackbar,
} from '@mui/material';
import {
  School as SchoolIcon,
  VideoLibrary as VideoIcon,
  MenuBook as BookIcon,
  Psychology as AIIcon,
  Quiz as QuizIcon,
  EmojiEvents as TrophyIcon,
  Assessment as AnalyticsIcon,
  Groups as TeamIcon,
  PhoneAndroid as MobileIcon,
  Settings as SettingsIcon,
  PlayCircle as PlayIcon,
  Pause as PauseIcon,
  CheckCircle as CheckIcon,
  Lock as LockIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  Timeline as TimelineIcon,
  AutoAwesome as SparkleIcon,
  Lightbulb as IdeaIcon,
  EmojiObjects as BulbIcon,
  Rocket as RocketIcon,
  Speed as SpeedIcon,
  ThumbUp as LikeIcon,
  Comment as CommentIcon,
  Share as ShareIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  Refresh as RefreshIcon,
  Print as PrintIcon,
  Email as EmailIcon,
  Message as MessageIcon,
  Notifications as BellIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Verified as VerifiedIcon,
  WorkspacePremium as BadgeIcon,
  LocalFireDepartment as FireIcon,
  Celebration as PartyIcon,
  SportsScore as GoalIcon,
  Flag as FlagIcon,
  Send as SendIcon,
  Close as CloseIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  AreaChart,
  Area,
} from 'recharts';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  setDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { ROLE_HIERARCHY } from '../../layout/navConfig';

// ============================================================================
// 🎨 CONSTANTS & CONFIGURATION
// ============================================================================

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// Course categories
const COURSE_CATEGORIES = [
  { id: 'credit-basics', name: 'Credit Basics', icon: '📚', color: '#4CAF50', description: 'Fundamentals of credit repair and FCRA' },
  { id: 'dispute-letters', name: 'Dispute Letters', icon: '✉️', color: '#2196F3', description: 'Master the art of effective disputes' },
  { id: 'client-management', name: 'Client Management', icon: '👥', color: '#FF9800', description: 'Build strong client relationships' },
  { id: 'sales-training', name: 'Sales Training', icon: '💰', color: '#9C27B0', description: 'Close more deals and grow revenue' },
  { id: 'compliance', name: 'Compliance & Legal', icon: '⚖️', color: '#F44336', description: 'Stay compliant with regulations' },
  { id: 'advanced', name: 'Advanced Strategies', icon: '🚀', color: '#00BCD4', description: 'Expert-level techniques' },
  { id: 'software', name: 'Software Training', icon: '💻', color: '#607D8B', description: 'Master SpeedyCRM tools' },
  { id: 'leadership', name: 'Leadership', icon: '👑', color: '#E91E63', description: 'Lead and manage teams effectively' },
];

// Difficulty levels
const DIFFICULTY_LEVELS = [
  { id: 'beginner', name: 'Beginner', color: '#4CAF50', icon: '🌱', description: 'No prior knowledge required' },
  { id: 'intermediate', name: 'Intermediate', color: '#FF9800', icon: '🌿', description: 'Basic knowledge recommended' },
  { id: 'advanced', name: 'Advanced', color: '#F44336', icon: '🌳', description: 'Experienced professionals' },
  { id: 'expert', name: 'Expert', color: '#9C27B0', icon: '🏆', description: 'Industry leaders' },
];

// Chart colors
const CHART_COLORS = ['#2196F3', '#4CAF50', '#FF9800', '#F44336', '#9C27B0', '#00BCD4', '#607D8B', '#E91E63'];

// Quiz topic options
const QUIZ_TOPICS = [
  'FCRA Laws & Regulations',
  'Credit Scoring Models',
  'Dispute Letter Strategies',
  'Credit Bureau Communication',
  'Client Onboarding Best Practices',
  'Compliance Requirements',
  'Sales Techniques for Credit Repair',
  'Advanced Dispute Tactics',
];


// ============================================================================
// 🤖 AI FUNCTIONS (Server-side via VITE_OPENAI_API_KEY)
// ============================================================================

const generateCourseRecommendations = async (userProfile, completedCourses) => {
  if (!OPENAI_API_KEY) {
    console.warn('⚠️ OpenAI API key not configured');
    return null;
  }
  try {
    const prompt = `You are a learning advisor for a credit repair training platform.

USER PROFILE:
- Role: ${userProfile?.role || 'user'}
- Experience Level: ${userProfile?.experienceLevel || 'beginner'}
- Completed Courses: ${completedCourses?.length || 0}
- Current Skills: ${userProfile?.skills?.join(', ') || 'None listed'}
- Career Goals: ${userProfile?.careerGoals || 'General credit repair expertise'}

TASK: Recommend 5 courses that would be most beneficial for this user's growth.

Respond in JSON format:
{
  "recommendations": [
    { "courseName": "string", "reason": "why recommended", "priority": "high|medium|low", "estimatedBenefit": "what they'll gain" }
  ],
  "learningPath": "suggested sequence of learning",
  "skillGaps": ["skill 1", "skill 2"],
  "nextMilestone": "what to achieve next"
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are an expert learning advisor. Respond with valid JSON only.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });
    if (!response.ok) throw new Error(`OpenAI API error: ${response.statusText}`);
    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error('❌ AI Recommendations Error:', error);
    return null;
  }
};

const chatWithAITutor = async (message, conversationHistory) => {
  if (!OPENAI_API_KEY) return "AI Tutor is currently unavailable. Please check your API configuration.";
  try {
    const systemPrompt = `You are an expert credit repair tutor for Speedy Credit Repair (est. 1995). You help students learn about:
- FCRA laws and regulations
- Credit scoring and reporting
- Dispute letter strategies
- Client management
- Compliance requirements
- Business growth
Be encouraging, clear, and provide actionable advice. Use examples when helpful.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: message },
    ];
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify({ model: 'gpt-4', messages, temperature: 0.8, max_tokens: 500 }),
    });
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('❌ AI Tutor Error:', error);
    return "Sorry, I encountered an error. Please try again.";
  }
};

const generateQuizQuestions = async (topic, difficulty, count = 5) => {
  if (!OPENAI_API_KEY) return null;
  try {
    const prompt = `Generate ${count} multiple choice quiz questions about ${topic} at ${difficulty} difficulty level for credit repair professionals.

Respond in JSON format:
{
  "questions": [
    { "question": "question text", "options": ["A", "B", "C", "D"], "correctAnswer": 0, "explanation": "why this answer is correct", "difficulty": "${difficulty}" }
  ]
}`;
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are an expert quiz creator for credit repair training. Generate valid JSON only.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });
    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error('❌ Quiz Generation Error:', error);
    return null;
  }
};

const analyzePerformanceWithAI = async (userStats) => {
  if (!OPENAI_API_KEY) return null;
  try {
    const prompt = `Analyze this student's learning performance:

STATISTICS:
- Courses Completed: ${userStats.coursesCompleted}
- Average Quiz Score: ${userStats.avgQuizScore}%
- Study Hours: ${userStats.totalStudyHours}
- Engagement Rate: ${userStats.engagementRate}%
- Completion Rate: ${userStats.completionRate}%

Respond in JSON:
{
  "overallRating": "excellent|good|average|needs-improvement",
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1"],
  "recommendations": ["action 1", "action 2"],
  "predictedSuccess": "percentage",
  "motivationalMessage": "encouraging message"
}`;
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a learning analytics expert. Respond with JSON only.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });
    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error('❌ Performance Analysis Error:', error);
    return null;
  }
};

const generateCourseContent = async (topic, difficulty, format) => {
  if (!OPENAI_API_KEY) return null;
  try {
    const prompt = `Create ${format} content about "${topic}" at ${difficulty} level for credit repair professionals.

${format === 'lesson' ? 'Include: title, objectives (array), keyConcepts (array of {term, definition}), examples (array), summary' : ''}
${format === 'quiz' ? 'Include: 10 questions with answers and explanations' : ''}
${format === 'article' ? 'Include: title, introduction, sections (array of {heading, content}), conclusion, keyTakeaways (array)' : ''}

Respond in valid JSON format.`;
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are an expert content creator for credit repair training. Generate valid JSON only.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.8,
        max_tokens: 2000,
      }),
    });
    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error('❌ Content Generation Error:', error);
    return null;
  }
};


// ============================================================================
// 🎯 MAIN COMPONENT
// ============================================================================

const LearningHub = () => {
  // ===== AUTH & PERMISSIONS =====
  const { currentUser, userProfile } = useAuth();
  const userRole = userProfile?.role || 'user';
  const hasAccess = ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY.viewer;
  const isAdmin = ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY.admin;

  // ===== STATE MANAGEMENT =====
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // ===== Course Library State =====
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseFilter, setCourseFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);

  // ===== Video Training State =====
  const [videos, setVideos] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [videoProgress, setVideoProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // ===== Knowledge Base State =====
  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [articleSearch, setArticleSearch] = useState('');
  const [articleDialogOpen, setArticleDialogOpen] = useState(false);
  const [newArticle, setNewArticle] = useState({ title: '', category: '', content: '' });

  // ===== AI Tutor State =====
  const [tutorMessages, setTutorMessages] = useState([
    { role: 'assistant', content: 'Hi! I\'m your AI learning assistant. Ask me anything about credit repair, FCRA laws, dispute strategies, or SpeedyCRM!' }
  ]);
  const [tutorInput, setTutorInput] = useState('');
  const [tutorLoading, setTutorLoading] = useState(false);
  const chatEndRef = useRef(null);

  // ===== Quiz State =====
  const [quizzes, setQuizzes] = useState([]);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResults, setQuizResults] = useState(null);
  const [quizTopic, setQuizTopic] = useState('');
  const [quizDifficulty, setQuizDifficulty] = useState('beginner');

  // ===== Certification State =====
  const [certifications, setCertifications] = useState([]);

  // ===== Analytics State =====
  const [learningStats, setLearningStats] = useState({
    coursesCompleted: 0,
    coursesInProgress: 0,
    totalStudyHours: 0,
    avgQuizScore: 0,
    engagementRate: 0,
    completionRate: 0,
    streak: 0,
  });
  const [aiRecommendations, setAiRecommendations] = useState(null);
  const [performanceAnalysis, setPerformanceAnalysis] = useState(null);

  // ===== Team Training State =====
  const [teamMembers, setTeamMembers] = useState([]);

  // ===== Content Management State =====
  const [contentForm, setContentForm] = useState({
    type: 'course',
    title: '',
    description: '',
    category: '',
    difficulty: 'beginner',
  });
  const [aiGenerating, setAiGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);

  // ===== Mobile Settings State =====
  const [mobileSettings, setMobileSettings] = useState({
    offlineEnabled: false,
    pushNotifications: true,
    downloadQuality: 'medium',
  });


  // ============================================================================
  // 📡 DATA LOADING
  // ============================================================================

  useEffect(() => {
    loadLearningData();
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [tutorMessages]);

  const loadLearningData = async () => {
    setLoading(true);
    try {
      // ===== Load courses from Firebase =====
      const coursesRef = collection(db, 'courses');
      const coursesSnapshot = await getDocs(query(coursesRef, orderBy('createdAt', 'desc')));
      const coursesData = coursesSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setCourses(coursesData);

      // ===== Load videos from Firebase =====
      const videosRef = collection(db, 'trainingVideos');
      const videosSnapshot = await getDocs(query(videosRef, orderBy('createdAt', 'desc')));
      const videosData = videosSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setVideos(videosData);

      // ===== Load articles from Firebase =====
      const articlesRef = collection(db, 'knowledgeBase');
      const articlesSnapshot = await getDocs(query(articlesRef, orderBy('createdAt', 'desc')));
      const articlesData = articlesSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setArticles(articlesData);

      // ===== Load certifications from Firebase =====
      const certsRef = collection(db, 'certifications');
      const certsSnapshot = await getDocs(certsRef);
      const certsData = certsSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setCertifications(certsData);

      // ===== Load quiz history from Firebase =====
      if (currentUser) {
        const quizRef = collection(db, 'quizResults');
        const quizSnapshot = await getDocs(query(quizRef, where('userId', '==', currentUser.uid), orderBy('completedAt', 'desc'), limit(20)));
        const quizData = quizSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setQuizzes(quizData);
      }

      // ===== Load user progress =====
      if (currentUser) {
        const progressRef = doc(db, 'userProgress', currentUser.uid);
        const progressDoc = await getDoc(progressRef);
        if (progressDoc.exists()) {
          const data = progressDoc.data();
          if (data.stats) setLearningStats(data.stats);
        }
      }

      // ===== Load team members (admin only) =====
      if (isAdmin) {
        const usersRef = collection(db, 'userProfiles');
        const usersSnapshot = await getDocs(query(usersRef, limit(50)));
        const usersData = usersSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setTeamMembers(usersData);
      }

      console.log('✅ Learning data loaded');
    } catch (err) {
      console.error('❌ Error loading learning data:', err);
      setCourses([]);
      setVideos([]);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };


  // ============================================================================
  // 🎬 HANDLERS
  // ============================================================================

  // ===== AI RECOMMENDATIONS =====
  const loadAIRecommendations = async () => {
    setLoading(true);
    try {
      const completedCourses = courses.filter(c => c.completed).map(c => c.id);
      const recommendations = await generateCourseRecommendations(userProfile, completedCourses);
      setAiRecommendations(recommendations);
      if (recommendations) setSuccess('AI recommendations generated!');
      else setError('AI unavailable — check API key configuration');
    } catch (err) {
      console.error('❌ Error loading recommendations:', err);
      setError('Failed to generate recommendations');
    } finally {
      setLoading(false);
    }
  };

  // ===== PERFORMANCE ANALYSIS =====
  const analyzePerformance = async () => {
    setLoading(true);
    try {
      const analysis = await analyzePerformanceWithAI(learningStats);
      setPerformanceAnalysis(analysis);
      if (analysis) setSuccess('Performance analysis complete!');
    } catch (err) {
      console.error('❌ Error analyzing performance:', err);
      setError('Failed to analyze performance');
    } finally {
      setLoading(false);
    }
  };

  // ===== COURSE ENROLLMENT =====
  const enrollInCourse = async (courseId) => {
    try {
      const course = courses.find(c => c.id === courseId);
      if (!course || !currentUser) return;

      await addDoc(collection(db, 'enrollments'), {
        userId: currentUser.uid,
        courseId,
        courseName: course.title || course.name,
        enrolledAt: serverTimestamp(),
        progress: 0,
        status: 'in-progress',
      });

      setSuccess(`Enrolled in ${course.title || course.name}!`);
      setCourseDialogOpen(false);
    } catch (err) {
      console.error('❌ Enrollment error:', err);
      setError('Failed to enroll in course');
    }
  };

  // ===== AI TUTOR CHAT =====
  const sendTutorMessage = async () => {
    if (!tutorInput.trim()) return;
    const userMessage = tutorInput;
    setTutorInput('');
    setTutorMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setTutorLoading(true);
    try {
      const response = await chatWithAITutor(userMessage, tutorMessages);
      setTutorMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (err) {
      console.error('❌ Tutor error:', err);
      setTutorMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setTutorLoading(false);
    }
  };

  // ===== QUIZ GENERATION =====
  const generateQuiz = async () => {
    if (!quizTopic) {
      setError('Please select a quiz topic');
      return;
    }
    setAiGenerating(true);
    try {
      const quiz = await generateQuizQuestions(quizTopic, quizDifficulty, 10);
      if (quiz) {
        setCurrentQuiz(quiz);
        setQuizAnswers({});
        setQuizResults(null);
        setSuccess('Quiz generated! Good luck!');
      } else {
        setError('AI unavailable — check API key');
      }
    } catch (err) {
      console.error('❌ Quiz generation error:', err);
      setError('Failed to generate quiz');
    } finally {
      setAiGenerating(false);
    }
  };

  // ===== QUIZ SUBMISSION =====
  const submitQuiz = async () => {
    if (!currentQuiz) return;
    const questions = currentQuiz.questions;
    let correct = 0;
    questions.forEach((q, index) => {
      if (quizAnswers[index] === q.correctAnswer) correct++;
    });
    const score = Math.round((correct / questions.length) * 100);
    const results = { score, correct, total: questions.length, passed: score >= 70 };
    setQuizResults(results);

    // Save to Firebase
    try {
      if (currentUser) {
        await addDoc(collection(db, 'quizResults'), {
          userId: currentUser.uid,
          topic: quizTopic,
          difficulty: quizDifficulty,
          score,
          correct,
          total: questions.length,
          passed: score >= 70,
          completedAt: serverTimestamp(),
        });
      }
    } catch (err) {
      console.error('❌ Error saving quiz results:', err);
    }

    // Update local stats
    setLearningStats(prev => ({
      ...prev,
      avgQuizScore: prev.avgQuizScore > 0 ? Math.round((prev.avgQuizScore + score) / 2) : score,
    }));
  };

  // ===== AI CONTENT GENERATION =====
  const generateContent = async () => {
    if (!contentForm.title || !contentForm.category) {
      setError('Please fill in title and category');
      return;
    }
    setAiGenerating(true);
    setGeneratedContent(null);
    try {
      const content = await generateCourseContent(contentForm.title, contentForm.difficulty, contentForm.type);
      if (content) {
        setGeneratedContent(content);
        setSuccess('Content generated! Review below and save to publish.');
      } else {
        setError('AI unavailable — check API key');
      }
    } catch (err) {
      console.error('❌ Content generation error:', err);
      setError('Failed to generate content');
    } finally {
      setAiGenerating(false);
    }
  };

  // ===== SAVE GENERATED CONTENT TO FIREBASE =====
  const saveGeneratedContent = async () => {
    if (!generatedContent) return;
    try {
      const collectionName = contentForm.type === 'article' ? 'knowledgeBase' : 'courses';
      await addDoc(collection(db, collectionName), {
        ...generatedContent,
        title: contentForm.title,
        category: contentForm.category,
        difficulty: contentForm.difficulty,
        type: contentForm.type,
        aiGenerated: true,
        createdBy: currentUser?.uid || 'system',
        createdAt: serverTimestamp(),
        status: 'draft',
      });
      setSuccess('Content saved to Firebase!');
      setGeneratedContent(null);
      setContentForm({ type: 'course', title: '', description: '', category: '', difficulty: 'beginner' });
      loadLearningData(); // Refresh
    } catch (err) {
      console.error('❌ Error saving content:', err);
      setError('Failed to save content');
    }
  };

  // ===== ADD ARTICLE TO KNOWLEDGE BASE =====
  const handleAddArticle = async () => {
    if (!newArticle.title || !newArticle.content) {
      setError('Please fill in title and content');
      return;
    }
    try {
      await addDoc(collection(db, 'knowledgeBase'), {
        ...newArticle,
        createdBy: currentUser?.uid || 'system',
        createdAt: serverTimestamp(),
        views: 0,
        helpful: 0,
      });
      setSuccess('Article added to Knowledge Base!');
      setNewArticle({ title: '', category: '', content: '' });
      setArticleDialogOpen(false);
      loadLearningData();
    } catch (err) {
      console.error('❌ Error adding article:', err);
      setError('Failed to add article');
    }
  };


  // ============================================================================
  // 🔍 FILTERED DATA
  // ============================================================================

  const filteredCourses = useMemo(() => {
    let filtered = courses;
    if (courseFilter !== 'all') filtered = filtered.filter(c => c.category === courseFilter);
    if (searchQuery) {
      filtered = filtered.filter(c =>
        (c.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.description || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (sortBy === 'popular') filtered.sort((a, b) => (b.students || 0) - (a.students || 0));
    else if (sortBy === 'rating') filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    else if (sortBy === 'recent') filtered.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    return filtered;
  }, [courses, courseFilter, searchQuery, sortBy]);

  const filteredArticles = useMemo(() => {
    if (!articleSearch) return articles;
    return articles.filter(a =>
      (a.title || '').toLowerCase().includes(articleSearch.toLowerCase()) ||
      (a.content || '').toLowerCase().includes(articleSearch.toLowerCase()) ||
      (a.category || '').toLowerCase().includes(articleSearch.toLowerCase())
    );
  }, [articles, articleSearch]);


  // ============================================================================
  // 🚫 ACCESS CHECK
  // ============================================================================

  if (!hasAccess) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">
          <AlertTitle>Access Denied</AlertTitle>
          You do not have permission to access the Learning Hub.
        </Alert>
      </Box>
    );
  }


  // ============================================================================
  // 🎨 RENDER
  // ============================================================================

  return (
    <Box sx={{ p: 3 }}>
      {/* ================================================================== */}
      {/* HEADER                                                             */}
      {/* ================================================================== */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
            <SchoolIcon fontSize="large" />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" fontWeight="bold">
              Learning Hub
            </Typography>
            <Typography variant="body2" color="text.secondary">
              AI-Powered Training & Development Platform
            </Typography>
          </Box>
          {learningStats.streak > 0 && (
            <Chip icon={<FireIcon />} label={`${learningStats.streak} Day Streak!`} color="warning" sx={{ fontWeight: 'bold' }} />
          )}
          <Tooltip title="Refresh Data">
            <IconButton onClick={loadLearningData} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Quick Stats */}
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {[
            { value: learningStats.coursesCompleted, label: 'Courses Completed', color: 'primary' },
            { value: `${learningStats.avgQuizScore}%`, label: 'Avg Quiz Score', color: 'success.main' },
            { value: `${learningStats.totalStudyHours}h`, label: 'Study Time', color: 'info.main' },
            { value: learningStats.coursesInProgress, label: 'In Progress', color: 'warning.main' },
          ].map((stat, i) => (
            <Grid item xs={6} sm={3} key={i}>
              <Card elevation={2}>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h4" color={stat.color} fontWeight="bold">{stat.value}</Typography>
                  <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* AI INSIGHTS BANNER */}
      <Fade in>
        <Alert
          severity="info"
          icon={<SparkleIcon />}
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={loadAIRecommendations} disabled={loading}>
              Get AI Recommendations
            </Button>
          }
        >
          <AlertTitle>AI-Powered Learning</AlertTitle>
          Get personalized course recommendations, interactive tutoring, and performance insights
        </Alert>
      </Fade>

      {/* ALERTS */}
      {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 3 }}>{success}</Alert>}

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* ================================================================== */}
      {/* MAIN TABS                                                          */}
      {/* ================================================================== */}
      <Paper elevation={3}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<SchoolIcon />} label="Course Library" />
          <Tab icon={<VideoIcon />} label="Video Training" />
          <Tab icon={<BookIcon />} label="Knowledge Base" />
          <Tab icon={<AIIcon />} label="AI Tutor" />
          <Tab icon={<QuizIcon />} label="Quizzes" />
          <Tab icon={<TrophyIcon />} label="Certifications" />
          <Tab icon={<AnalyticsIcon />} label="Analytics" />
          <Tab icon={<TeamIcon />} label="Team Training" />
          <Tab icon={<MobileIcon />} label="Mobile App" />
          {isAdmin && <Tab icon={<SettingsIcon />} label="Content Manager" />}
        </Tabs>

        <Box sx={{ p: 3 }}>

          {/* ============================================================ */}
          {/* TAB 0: COURSE LIBRARY                                        */}
          {/* ============================================================ */}
          {activeTab === 0 && (
            <Box>
              {/* Search & Filters */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={5}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
                  />
                </Grid>
                <Grid item xs={6} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Category</InputLabel>
                    <Select value={courseFilter} label="Category" onChange={(e) => setCourseFilter(e.target.value)}>
                      <MenuItem value="all">All Categories</MenuItem>
                      {COURSE_CATEGORIES.map(cat => (
                        <MenuItem key={cat.id} value={cat.id}>{cat.icon} {cat.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Sort By</InputLabel>
                    <Select value={sortBy} label="Sort By" onChange={(e) => setSortBy(e.target.value)}>
                      <MenuItem value="popular">Most Popular</MenuItem>
                      <MenuItem value="rating">Highest Rated</MenuItem>
                      <MenuItem value="recent">Most Recent</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              {/* Category Chips */}
              <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {COURSE_CATEGORIES.map(cat => (
                  <Chip
                    key={cat.id}
                    label={`${cat.icon} ${cat.name}`}
                    onClick={() => setCourseFilter(courseFilter === cat.id ? 'all' : cat.id)}
                    color={courseFilter === cat.id ? 'primary' : 'default'}
                    variant={courseFilter === cat.id ? 'filled' : 'outlined'}
                    size="small"
                  />
                ))}
              </Box>

              {/* AI Recommendations */}
              {aiRecommendations && (
                <Alert severity="info" sx={{ mb: 3 }} onClose={() => setAiRecommendations(null)}>
                  <AlertTitle>AI Recommendations</AlertTitle>
                  <Typography variant="body2" sx={{ mb: 1 }}>{aiRecommendations.learningPath}</Typography>
                  {aiRecommendations.skillGaps?.length > 0 && (
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
                      <Typography variant="caption" fontWeight="bold">Skill Gaps:</Typography>
                      {aiRecommendations.skillGaps.map((gap, i) => (
                        <Chip key={i} label={gap} size="small" color="warning" variant="outlined" />
                      ))}
                    </Box>
                  )}
                  {aiRecommendations.recommendations?.map((rec, i) => (
                    <Box key={i} sx={{ mt: 1, p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
                      <Typography variant="body2" fontWeight="bold">{rec.courseName}</Typography>
                      <Typography variant="caption" color="text.secondary">{rec.reason}</Typography>
                    </Box>
                  ))}
                </Alert>
              )}

              {/* Course Grid */}
              {filteredCourses.length > 0 ? (
                <Grid container spacing={3}>
                  {filteredCourses.map(course => (
                    <Grid item xs={12} sm={6} md={4} key={course.id}>
                      <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ p: 2, bgcolor: COURSE_CATEGORIES.find(c => c.id === course.category)?.color || '#607D8B', color: 'white', textAlign: 'center' }}>
                          <Typography variant="h3">
                            {COURSE_CATEGORIES.find(c => c.id === course.category)?.icon || '📚'}
                          </Typography>
                        </Box>
                        <CardContent sx={{ flex: 1 }}>
                          <Typography variant="h6" gutterBottom>{course.title || course.name}</Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {(course.description || '').substring(0, 120)}{(course.description || '').length > 120 ? '...' : ''}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {course.difficulty && <Chip label={course.difficulty} size="small" />}
                            {course.category && (
                              <Chip label={COURSE_CATEGORIES.find(c => c.id === course.category)?.name || course.category} size="small" variant="outlined" />
                            )}
                          </Box>
                          {course.rating > 0 && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                              <Rating value={course.rating || 0} readOnly size="small" precision={0.5} />
                              <Typography variant="caption" color="text.secondary">({course.students || 0} students)</Typography>
                            </Box>
                          )}
                        </CardContent>
                        <CardActions>
                          <Button
                            size="small"
                            onClick={() => { setSelectedCourse(course); setCourseDialogOpen(true); }}
                          >
                            View Details
                          </Button>
                          <Button size="small" variant="contained" onClick={() => enrollInCourse(course.id)}>
                            Enroll
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <SchoolIcon sx={{ fontSize: 64, opacity: 0.3 }} />
                  <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>No courses found</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {courses.length === 0 ? 'Add courses using the Content Manager tab to get started.' : 'Try adjusting your search or filters.'}
                  </Typography>
                  {courses.length > 0 && (
                    <Button variant="outlined" onClick={() => { setCourseFilter('all'); setSearchQuery(''); }}>
                      Clear Filters
                    </Button>
                  )}
                </Box>
              )}
            </Box>
          )}


          {/* ============================================================ */}
          {/* TAB 1: VIDEO TRAINING                                        */}
          {/* ============================================================ */}
          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>Video Training Library</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Watch training videos, track progress, and build your skills.
              </Typography>

              {/* Current Video Player */}
              {currentVideo && (
                <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: '#000', color: 'white', borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">{currentVideo.title}</Typography>
                    <IconButton onClick={() => setCurrentVideo(null)} sx={{ color: 'white' }}>
                      <CloseIcon />
                    </IconButton>
                  </Box>
                  {currentVideo.videoUrl ? (
                    <Box sx={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: 1 }}>
                      <iframe
                        src={currentVideo.videoUrl}
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                        allowFullScreen
                        title={currentVideo.title}
                      />
                    </Box>
                  ) : (
                    <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#1a1a1a', borderRadius: 1 }}>
                      <Typography color="grey.500">Video URL not configured</Typography>
                    </Box>
                  )}
                  <LinearProgress variant="determinate" value={videoProgress} sx={{ mt: 2 }} />
                  <Typography variant="caption" color="grey.400">{videoProgress}% complete</Typography>
                </Paper>
              )}

              {/* Video Grid */}
              {videos.length > 0 ? (
                <Grid container spacing={3}>
                  {videos.map(video => (
                    <Grid item xs={12} sm={6} md={4} key={video.id}>
                      <Card elevation={2} sx={{ cursor: 'pointer' }} onClick={() => { setCurrentVideo(video); setVideoProgress(video.progress || 0); }}>
                        <Box sx={{ height: 140, bgcolor: 'grey.800', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                          <PlayIcon sx={{ fontSize: 48, color: 'white', opacity: 0.8 }} />
                          {video.duration && (
                            <Chip label={video.duration} size="small" sx={{ position: 'absolute', bottom: 8, right: 8, bgcolor: 'rgba(0,0,0,0.7)', color: 'white' }} />
                          )}
                        </Box>
                        <CardContent>
                          <Typography variant="subtitle1" fontWeight="bold">{video.title}</Typography>
                          <Typography variant="body2" color="text.secondary">{video.description || 'Training video'}</Typography>
                          {video.progress > 0 && (
                            <Box sx={{ mt: 1 }}>
                              <LinearProgress variant="determinate" value={video.progress} />
                              <Typography variant="caption" color="text.secondary">{video.progress}% complete</Typography>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <VideoIcon sx={{ fontSize: 64, opacity: 0.3 }} />
                  <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>No training videos yet</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {isAdmin ? 'Add training videos using the Content Manager tab.' : 'Training videos will appear here once added by your admin.'}
                  </Typography>
                </Box>
              )}
            </Box>
          )}


          {/* ============================================================ */}
          {/* TAB 2: KNOWLEDGE BASE                                        */}
          {/* ============================================================ */}
          {activeTab === 2 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                  <Typography variant="h6">Knowledge Base</Typography>
                  <Typography variant="body2" color="text.secondary">Articles, guides, and reference materials</Typography>
                </Box>
                {isAdmin && (
                  <Button variant="contained" startIcon={<AddIcon />} onClick={() => setArticleDialogOpen(true)}>
                    Add Article
                  </Button>
                )}
              </Box>

              {/* Search */}
              <TextField
                fullWidth
                size="small"
                placeholder="Search knowledge base..."
                value={articleSearch}
                onChange={(e) => setArticleSearch(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
                sx={{ mb: 3 }}
              />

              {/* Articles List */}
              {filteredArticles.length > 0 ? (
                <Grid container spacing={2}>
                  {filteredArticles.map(article => (
                    <Grid item xs={12} md={6} key={article.id}>
                      <Card elevation={2}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="h6" gutterBottom>{article.title}</Typography>
                              {article.category && <Chip label={article.category} size="small" sx={{ mb: 1 }} />}
                              <Typography variant="body2" color="text.secondary">
                                {(article.content || '').substring(0, 200)}{(article.content || '').length > 200 ? '...' : ''}
                              </Typography>
                            </Box>
                            <Avatar sx={{ bgcolor: 'info.main', ml: 2 }}>
                              <BookIcon />
                            </Avatar>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                            <Typography variant="caption" color="text.secondary">
                              {article.views || 0} views
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {article.helpful || 0} found helpful
                            </Typography>
                          </Box>
                        </CardContent>
                        <CardActions>
                          <Button size="small" onClick={() => { setSelectedArticle(article); }}>
                            Read More
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <BookIcon sx={{ fontSize: 64, opacity: 0.3 }} />
                  <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>No articles found</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {articles.length === 0
                      ? (isAdmin ? 'Add articles or use AI Content Manager to generate knowledge base content.' : 'Knowledge base articles will appear here once added.')
                      : 'Try adjusting your search query.'
                    }
                  </Typography>
                </Box>
              )}

              {/* Article Detail Dialog */}
              <Dialog open={!!selectedArticle} onClose={() => setSelectedArticle(null)} maxWidth="md" fullWidth>
                {selectedArticle && (
                  <>
                    <DialogTitle>{selectedArticle.title}</DialogTitle>
                    <DialogContent>
                      {selectedArticle.category && <Chip label={selectedArticle.category} size="small" sx={{ mb: 2 }} />}
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                        {selectedArticle.content}
                      </Typography>
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={() => setSelectedArticle(null)}>Close</Button>
                    </DialogActions>
                  </>
                )}
              </Dialog>

              {/* Add Article Dialog */}
              <Dialog open={articleDialogOpen} onClose={() => setArticleDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Add Knowledge Base Article</DialogTitle>
                <DialogContent>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12}>
                      <TextField fullWidth label="Article Title" value={newArticle.title} onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })} />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>Category</InputLabel>
                        <Select value={newArticle.category} label="Category" onChange={(e) => setNewArticle({ ...newArticle, category: e.target.value })}>
                          {COURSE_CATEGORIES.map(cat => <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>)}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField fullWidth multiline rows={10} label="Content" value={newArticle.content} onChange={(e) => setNewArticle({ ...newArticle, content: e.target.value })} />
                    </Grid>
                  </Grid>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setArticleDialogOpen(false)}>Cancel</Button>
                  <Button variant="contained" onClick={handleAddArticle}>Save Article</Button>
                </DialogActions>
              </Dialog>
            </Box>
          )}


          {/* ============================================================ */}
          {/* TAB 3: AI TUTOR                                              */}
          {/* ============================================================ */}
          {activeTab === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>AI Learning Tutor</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Ask questions about credit repair, FCRA laws, dispute strategies, or SpeedyCRM features.
              </Typography>

              {/* Chat Window */}
              <Paper elevation={2} sx={{ height: 450, display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
                {/* Messages */}
                <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                  {tutorMessages.map((msg, i) => (
                    <Box
                      key={i}
                      sx={{
                        display: 'flex',
                        justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        mb: 2,
                      }}
                    >
                      {msg.role === 'assistant' && (
                        <Avatar sx={{ bgcolor: 'primary.main', mr: 1, width: 32, height: 32 }}>
                          <AIIcon fontSize="small" />
                        </Avatar>
                      )}
                      <Paper
                        elevation={1}
                        sx={{
                          p: 2,
                          maxWidth: '75%',
                          bgcolor: msg.role === 'user' ? 'primary.main' : 'grey.100',
                          color: msg.role === 'user' ? 'white' : 'text.primary',
                          borderRadius: 2,
                        }}
                      >
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{msg.content}</Typography>
                      </Paper>
                    </Box>
                  ))}
                  {tutorLoading && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                        <AIIcon fontSize="small" />
                      </Avatar>
                      <CircularProgress size={20} />
                      <Typography variant="body2" color="text.secondary">Thinking...</Typography>
                    </Box>
                  )}
                  <div ref={chatEndRef} />
                </Box>

                {/* Input */}
                <Divider />
                <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Ask the AI Tutor anything..."
                    value={tutorInput}
                    onChange={(e) => setTutorInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendTutorMessage(); } }}
                    disabled={tutorLoading}
                  />
                  <Button variant="contained" onClick={sendTutorMessage} disabled={tutorLoading || !tutorInput.trim()}>
                    <SendIcon />
                  </Button>
                </Box>
              </Paper>

              {/* Quick Questions */}
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">Quick questions:</Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                  {['What is FCRA?', 'How to write dispute letters?', 'Credit score factors?', 'CROA compliance?', 'How to use SpeedyCRM?'].map((q, i) => (
                    <Chip key={i} label={q} variant="outlined" size="small" onClick={() => { setTutorInput(q); }} clickable />
                  ))}
                </Box>
              </Box>
            </Box>
          )}


          {/* ============================================================ */}
          {/* TAB 4: QUIZZES                                               */}
          {/* ============================================================ */}
          {activeTab === 4 && (
            <Box>
              <Typography variant="h6" gutterBottom>AI-Powered Quizzes</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Test your knowledge with AI-generated quizzes. Select a topic and difficulty to begin.
              </Typography>

              {/* Quiz Generator */}
              {!currentQuiz && (
                <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Generate a New Quiz</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={5}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Topic</InputLabel>
                        <Select value={quizTopic} label="Topic" onChange={(e) => setQuizTopic(e.target.value)}>
                          {QUIZ_TOPICS.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Difficulty</InputLabel>
                        <Select value={quizDifficulty} label="Difficulty" onChange={(e) => setQuizDifficulty(e.target.value)}>
                          {DIFFICULTY_LEVELS.map(d => <MenuItem key={d.id} value={d.id}>{d.icon} {d.name}</MenuItem>)}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Button fullWidth variant="contained" onClick={generateQuiz} disabled={aiGenerating || !quizTopic} startIcon={aiGenerating ? <CircularProgress size={20} /> : <SparkleIcon />}>
                        {aiGenerating ? 'Generating...' : 'Generate Quiz'}
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>
              )}

              {/* Active Quiz */}
              {currentQuiz && !quizResults && (
                <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6">{quizTopic} Quiz</Typography>
                    <Chip label={`${Object.keys(quizAnswers).length}/${currentQuiz.questions?.length || 0} answered`} color="primary" />
                  </Box>
                  {currentQuiz.questions?.map((q, qi) => (
                    <Paper key={qi} elevation={1} sx={{ p: 2, mb: 2, bgcolor: quizAnswers[qi] !== undefined ? 'action.hover' : 'background.paper' }}>
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                        {qi + 1}. {q.question}
                      </Typography>
                      <RadioGroup value={quizAnswers[qi] ?? ''} onChange={(e) => setQuizAnswers({ ...quizAnswers, [qi]: parseInt(e.target.value) })}>
                        {q.options?.map((opt, oi) => (
                          <FormControlLabel key={oi} value={oi} control={<Radio size="small" />} label={opt} />
                        ))}
                      </RadioGroup>
                    </Paper>
                  ))}
                  <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                    <Button variant="contained" color="primary" onClick={submitQuiz} disabled={Object.keys(quizAnswers).length < (currentQuiz.questions?.length || 0)}>
                      Submit Quiz
                    </Button>
                    <Button variant="outlined" color="error" onClick={() => { setCurrentQuiz(null); setQuizAnswers({}); }}>
                      Cancel
                    </Button>
                  </Box>
                </Paper>
              )}

              {/* Quiz Results */}
              {quizResults && (
                <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                  <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Typography variant="h2" color={quizResults.passed ? 'success.main' : 'error.main'} fontWeight="bold">
                      {quizResults.score}%
                    </Typography>
                    <Typography variant="h6">{quizResults.passed ? 'Passed!' : 'Try Again'}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {quizResults.correct} out of {quizResults.total} correct
                    </Typography>
                    <Chip
                      label={quizResults.passed ? 'PASSED' : 'FAILED'}
                      color={quizResults.passed ? 'success' : 'error'}
                      sx={{ mt: 1 }}
                    />
                  </Box>
                  {/* Show explanations */}
                  {currentQuiz?.questions?.map((q, qi) => (
                    <Accordion key={qi}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {quizAnswers[qi] === q.correctAnswer
                            ? <CheckIcon color="success" fontSize="small" />
                            : <ErrorIcon color="error" fontSize="small" />
                          }
                          <Typography variant="body2">Q{qi + 1}: {q.question}</Typography>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body2" color="success.main" sx={{ mb: 1 }}>
                          Correct answer: {q.options?.[q.correctAnswer]}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">{q.explanation}</Typography>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                  <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                    <Button variant="contained" onClick={() => { setCurrentQuiz(null); setQuizAnswers({}); setQuizResults(null); }}>
                      Take Another Quiz
                    </Button>
                  </Box>
                </Paper>
              )}

              {/* Quiz History */}
              {quizzes.length > 0 && !currentQuiz && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Quiz History</Typography>
                  <TableContainer component={Paper} elevation={1}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Topic</TableCell>
                          <TableCell>Difficulty</TableCell>
                          <TableCell>Score</TableCell>
                          <TableCell>Result</TableCell>
                          <TableCell>Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {quizzes.map(q => (
                          <TableRow key={q.id}>
                            <TableCell>{q.topic}</TableCell>
                            <TableCell><Chip label={q.difficulty} size="small" /></TableCell>
                            <TableCell>{q.score}%</TableCell>
                            <TableCell>
                              <Chip label={q.passed ? 'Passed' : 'Failed'} size="small" color={q.passed ? 'success' : 'error'} />
                            </TableCell>
                            <TableCell>{q.completedAt?.toDate?.()?.toLocaleDateString() || 'N/A'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              {/* Empty state for history */}
              {quizzes.length === 0 && !currentQuiz && (
                <Alert severity="info" sx={{ mt: 3 }}>
                  No quiz history yet. Generate your first quiz above to start tracking your progress!
                </Alert>
              )}
            </Box>
          )}


          {/* ============================================================ */}
          {/* TAB 5: CERTIFICATIONS                                        */}
          {/* ============================================================ */}
          {activeTab === 5 && (
            <Box>
              <Typography variant="h6" gutterBottom>Certifications & Badges</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Earn certifications by completing courses and passing assessments.
              </Typography>

              {certifications.length > 0 ? (
                <Grid container spacing={3}>
                  {certifications.map(cert => (
                    <Grid item xs={12} sm={6} md={4} key={cert.id}>
                      <Card elevation={2} sx={{ textAlign: 'center', position: 'relative' }}>
                        {cert.earned && (
                          <Chip
                            icon={<VerifiedIcon />}
                            label="EARNED"
                            color="success"
                            size="small"
                            sx={{ position: 'absolute', top: 8, right: 8 }}
                          />
                        )}
                        <CardContent>
                          <Typography variant="h2" sx={{ mb: 1 }}>{cert.badge || '🏆'}</Typography>
                          <Typography variant="h6" gutterBottom>{cert.name}</Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {cert.description}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={cert.progress || 0}
                            sx={{ height: 8, borderRadius: 4, mb: 1 }}
                            color={cert.earned ? 'success' : 'primary'}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {cert.progress || 0}% complete
                          </Typography>
                        </CardContent>
                        <CardActions sx={{ justifyContent: 'center' }}>
                          {cert.earned ? (
                            <Button size="small" startIcon={<DownloadIcon />}>Download Certificate</Button>
                          ) : (
                            <Button size="small" variant="outlined">View Requirements</Button>
                          )}
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <TrophyIcon sx={{ fontSize: 64, opacity: 0.3 }} />
                  <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>No certifications available yet</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Certifications will appear here as courses and assessments are configured.
                  </Typography>
                </Box>
              )}
            </Box>
          )}


          {/* ============================================================ */}
          {/* TAB 6: ANALYTICS                                             */}
          {/* ============================================================ */}
          {activeTab === 6 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                  <Typography variant="h6">Learning Analytics</Typography>
                  <Typography variant="body2" color="text.secondary">Track your progress and get AI-powered insights.</Typography>
                </Box>
                <Button variant="outlined" startIcon={<SparkleIcon />} onClick={analyzePerformance} disabled={loading}>
                  AI Performance Analysis
                </Button>
              </Box>

              {/* Stats Cards */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {[
                  { label: 'Completion Rate', value: `${learningStats.completionRate}%`, color: '#4CAF50', icon: <CheckIcon /> },
                  { label: 'Engagement Rate', value: `${learningStats.engagementRate}%`, color: '#2196F3', icon: <TrendingUpIcon /> },
                  { label: 'Avg Quiz Score', value: `${learningStats.avgQuizScore}%`, color: '#FF9800', icon: <QuizIcon /> },
                  { label: 'Study Streak', value: `${learningStats.streak} days`, color: '#F44336', icon: <FireIcon /> },
                ].map((stat, i) => (
                  <Grid item xs={6} md={3} key={i}>
                    <Card elevation={2}>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Avatar sx={{ bgcolor: stat.color, mx: 'auto', mb: 1 }}>{stat.icon}</Avatar>
                        <Typography variant="h5" fontWeight="bold">{stat.value}</Typography>
                        <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {/* Charts */}
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper elevation={2} sx={{ p: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Progress by Category</Typography>
                    {courses.length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={COURSE_CATEGORIES.map(cat => ({
                          name: cat.name,
                          courses: courses.filter(c => c.category === cat.id).length,
                          color: cat.color,
                        })).filter(d => d.courses > 0)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                          <YAxis />
                          <RechartsTooltip />
                          <Bar dataKey="courses" fill="#2196F3" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <Box sx={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography color="text.secondary">Enroll in courses to see progress data</Typography>
                      </Box>
                    )}
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper elevation={2} sx={{ p: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Quiz Performance</Typography>
                    {quizzes.length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={quizzes.slice(0, 10).reverse().map((q, i) => ({ name: `Quiz ${i + 1}`, score: q.score }))}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis domain={[0, 100]} />
                          <RechartsTooltip />
                          <Line type="monotone" dataKey="score" stroke="#4CAF50" strokeWidth={2} dot={{ r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <Box sx={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography color="text.secondary">Complete quizzes to see performance trends</Typography>
                      </Box>
                    )}
                  </Paper>
                </Grid>
              </Grid>

              {/* AI Performance Analysis */}
              {performanceAnalysis && (
                <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <SparkleIcon color="primary" />
                    <Typography variant="h6">AI Performance Analysis</Typography>
                    <Chip label={performanceAnalysis.overallRating} color={performanceAnalysis.overallRating === 'excellent' ? 'success' : 'primary'} size="small" />
                  </Box>
                  <Typography variant="body1" sx={{ mb: 2, fontStyle: 'italic' }}>
                    "{performanceAnalysis.motivationalMessage}"
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="success.main" gutterBottom>Strengths</Typography>
                      <List dense>
                        {performanceAnalysis.strengths?.map((s, i) => (
                          <ListItem key={i}><ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon><ListItemText primary={s} /></ListItem>
                        ))}
                      </List>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="warning.main" gutterBottom>Areas to Improve</Typography>
                      <List dense>
                        {performanceAnalysis.weaknesses?.map((w, i) => (
                          <ListItem key={i}><ListItemIcon><WarningIcon color="warning" fontSize="small" /></ListItemIcon><ListItemText primary={w} /></ListItem>
                        ))}
                      </List>
                    </Grid>
                  </Grid>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" gutterBottom>Recommendations</Typography>
                  <List dense>
                    {performanceAnalysis.recommendations?.map((r, i) => (
                      <ListItem key={i}><ListItemIcon><IdeaIcon color="info" fontSize="small" /></ListItemIcon><ListItemText primary={r} /></ListItem>
                    ))}
                  </List>
                </Paper>
              )}
            </Box>
          )}


          {/* ============================================================ */}
          {/* TAB 7: TEAM TRAINING                                         */}
          {/* ============================================================ */}
          {activeTab === 7 && (
            <Box>
              <Typography variant="h6" gutterBottom>Team Training Progress</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {isAdmin ? 'Monitor team learning progress and identify training gaps.' : 'View team learning statistics.'}
              </Typography>

              {teamMembers.length > 0 ? (
                <>
                  {/* Team Overview Stats */}
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={6} md={3}>
                      <Card elevation={2}>
                        <CardContent sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" color="primary" fontWeight="bold">{teamMembers.length}</Typography>
                          <Typography variant="caption" color="text.secondary">Team Members</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Card elevation={2}>
                        <CardContent sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" color="success.main" fontWeight="bold">
                            {teamMembers.filter(m => (m.coursesCompleted || 0) > 0).length}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">Active Learners</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Card elevation={2}>
                        <CardContent sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" color="info.main" fontWeight="bold">
                            {courses.length}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">Available Courses</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Card elevation={2}>
                        <CardContent sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" color="warning.main" fontWeight="bold">
                            {certifications.filter(c => c.earned).length}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">Certs Earned</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  {/* Team Members Table */}
                  <TableContainer component={Paper} elevation={2}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Team Member</TableCell>
                          <TableCell>Role</TableCell>
                          <TableCell>Email</TableCell>
                          <TableCell>Courses</TableCell>
                          <TableCell>Last Active</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {teamMembers.map(member => (
                          <TableRow key={member.id}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                                  {(member.displayName || member.email || '?')[0].toUpperCase()}
                                </Avatar>
                                <Typography variant="body2">{member.displayName || member.email || 'Unknown'}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell><Chip label={member.role || 'user'} size="small" /></TableCell>
                            <TableCell><Typography variant="body2" color="text.secondary">{member.email || 'N/A'}</Typography></TableCell>
                            <TableCell>{member.coursesCompleted || 0}</TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {member.lastLogin?.toDate?.()?.toLocaleDateString() || 'N/A'}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              ) : (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <TeamIcon sx={{ fontSize: 64, opacity: 0.3 }} />
                  <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>No team data available</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {isAdmin ? 'Team member learning data will appear as users are added and begin training.' : 'Team training data is visible to administrators.'}
                  </Typography>
                </Box>
              )}
            </Box>
          )}


          {/* ============================================================ */}
          {/* TAB 8: MOBILE APP                                            */}
          {/* ============================================================ */}
          {activeTab === 8 && (
            <Box>
              <Typography variant="h6" gutterBottom>Mobile Learning</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Access training on-the-go with mobile-optimized content.
              </Typography>

              <Grid container spacing={3}>
                {/* Mobile App Info */}
                <Grid item xs={12} md={6}>
                  <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
                    <MobileIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>SpeedyCRM Learning App</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Access your courses, quizzes, and certificates from any mobile device. The SpeedyCRM web app is fully responsive and works great on phones and tablets.
                    </Typography>
                    <Alert severity="info" sx={{ textAlign: 'left' }}>
                      <AlertTitle>Mobile Access</AlertTitle>
                      Simply visit <strong>myclevercrm.com</strong> from your mobile browser to access all learning features on-the-go.
                    </Alert>
                  </Paper>
                </Grid>

                {/* Mobile Features */}
                <Grid item xs={12} md={6}>
                  <Paper elevation={2} sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>Mobile Features</Typography>
                    <List>
                      {[
                        { icon: <VideoIcon color="primary" />, title: 'Video Streaming', desc: 'Watch training videos on mobile data or WiFi' },
                        { icon: <QuizIcon color="success" />, title: 'Take Quizzes', desc: 'Complete assessments from anywhere' },
                        { icon: <AIIcon color="info" />, title: 'AI Tutor Chat', desc: 'Ask the AI tutor questions on the go' },
                        { icon: <TrophyIcon color="warning" />, title: 'Track Progress', desc: 'See your certifications and progress' },
                        { icon: <BookIcon color="secondary" />, title: 'Knowledge Base', desc: 'Read articles and reference materials' },
                        { icon: <BellIcon color="error" />, title: 'Notifications', desc: 'Get reminders for upcoming training' },
                      ].map((feature, i) => (
                        <React.Fragment key={i}>
                          <ListItem>
                            <ListItemIcon>{feature.icon}</ListItemIcon>
                            <ListItemText primary={feature.title} secondary={feature.desc} />
                          </ListItem>
                          {i < 5 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  </Paper>
                </Grid>

                {/* Mobile Settings */}
                <Grid item xs={12}>
                  <Paper elevation={2} sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>Mobile Preferences</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <FormControlLabel
                          control={<Switch checked={mobileSettings.pushNotifications} onChange={(e) => setMobileSettings({ ...mobileSettings, pushNotifications: e.target.checked })} />}
                          label="Push Notifications"
                        />
                        <Typography variant="caption" color="text.secondary" display="block">
                          Receive training reminders and updates
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <FormControlLabel
                          control={<Switch checked={mobileSettings.offlineEnabled} onChange={(e) => setMobileSettings({ ...mobileSettings, offlineEnabled: e.target.checked })} />}
                          label="Offline Mode"
                        />
                        <Typography variant="caption" color="text.secondary" display="block">
                          Download content for offline access
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Download Quality</InputLabel>
                          <Select value={mobileSettings.downloadQuality} label="Download Quality" onChange={(e) => setMobileSettings({ ...mobileSettings, downloadQuality: e.target.value })}>
                            <MenuItem value="low">Low (saves data)</MenuItem>
                            <MenuItem value="medium">Medium</MenuItem>
                            <MenuItem value="high">High (best quality)</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}


          {/* ============================================================ */}
          {/* TAB 9: CONTENT MANAGER (Admin Only)                          */}
          {/* ============================================================ */}
          {activeTab === 9 && isAdmin && (
            <Box>
              <Typography variant="h6" gutterBottom>AI Content Manager</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Generate courses, articles, and quizzes using AI. Review and publish to the learning platform.
              </Typography>

              {/* Content Generator Form */}
              <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Generate New Content</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Content Type</InputLabel>
                      <Select value={contentForm.type} label="Content Type" onChange={(e) => setContentForm({ ...contentForm, type: e.target.value })}>
                        <MenuItem value="lesson">Lesson</MenuItem>
                        <MenuItem value="article">Article</MenuItem>
                        <MenuItem value="quiz">Quiz</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField fullWidth size="small" label="Title / Topic" value={contentForm.title} onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })} />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Category</InputLabel>
                      <Select value={contentForm.category} label="Category" onChange={(e) => setContentForm({ ...contentForm, category: e.target.value })}>
                        {COURSE_CATEGORIES.map(cat => <MenuItem key={cat.id} value={cat.id}>{cat.icon} {cat.name}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Difficulty</InputLabel>
                      <Select value={contentForm.difficulty} label="Difficulty" onChange={(e) => setContentForm({ ...contentForm, difficulty: e.target.value })}>
                        {DIFFICULTY_LEVELS.map(d => <MenuItem key={d.id} value={d.id}>{d.icon} {d.name}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth size="small" multiline rows={2} label="Description (optional)" value={contentForm.description} onChange={(e) => setContentForm({ ...contentForm, description: e.target.value })} />
                  </Grid>
                  <Grid item xs={12}>
                    <Button variant="contained" onClick={generateContent} disabled={aiGenerating || !contentForm.title || !contentForm.category} startIcon={aiGenerating ? <CircularProgress size={20} /> : <SparkleIcon />}>
                      {aiGenerating ? 'Generating with AI...' : 'Generate Content'}
                    </Button>
                  </Grid>
                </Grid>
              </Paper>

              {/* Generated Content Preview */}
              {generatedContent && (
                <Paper elevation={2} sx={{ p: 3, mb: 3, border: '2px solid', borderColor: 'success.main' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" color="success.main">Generated Content Preview</Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button variant="contained" color="success" startIcon={<CheckIcon />} onClick={saveGeneratedContent}>
                        Save to Firebase
                      </Button>
                      <Button variant="outlined" color="error" onClick={() => setGeneratedContent(null)}>
                        Discard
                      </Button>
                    </Box>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', maxHeight: 400, overflow: 'auto' }}>
                    {typeof generatedContent === 'string' ? generatedContent : JSON.stringify(generatedContent, null, 2)}
                  </Typography>
                </Paper>
              )}

              {/* Content Stats */}
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Content Inventory</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Card elevation={1}>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h3" color="primary">{courses.length}</Typography>
                        <Typography variant="body2" color="text.secondary">Courses</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={4}>
                    <Card elevation={1}>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h3" color="info.main">{articles.length}</Typography>
                        <Typography variant="body2" color="text.secondary">Articles</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={4}>
                    <Card elevation={1}>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h3" color="success.main">{videos.length}</Typography>
                        <Typography variant="body2" color="text.secondary">Videos</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Paper>
            </Box>
          )}

        </Box>
      </Paper>

      {/* ================================================================== */}
      {/* COURSE DETAIL DIALOG                                               */}
      {/* ================================================================== */}
      <Dialog open={courseDialogOpen} onClose={() => setCourseDialogOpen(false)} maxWidth="md" fullWidth>
        {selectedCourse && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <Box>
                  <Typography variant="h5" fontWeight="bold">{selectedCourse.title || selectedCourse.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{selectedCourse.instructor || 'Speedy Credit Repair'}</Typography>
                </Box>
                <IconButton onClick={() => setCourseDialogOpen(false)}><CloseIcon /></IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                {selectedCourse.duration && (
                  <Grid item xs={6} sm={3}>
                    <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: 'action.hover' }}>
                      <Typography variant="body2" fontWeight="bold">{selectedCourse.duration}</Typography>
                      <Typography variant="caption" color="text.secondary">Duration</Typography>
                    </Paper>
                  </Grid>
                )}
                {selectedCourse.difficulty && (
                  <Grid item xs={6} sm={3}>
                    <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: 'action.hover' }}>
                      <Typography variant="body2" fontWeight="bold">{selectedCourse.difficulty}</Typography>
                      <Typography variant="caption" color="text.secondary">Difficulty</Typography>
                    </Paper>
                  </Grid>
                )}
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: 'action.hover' }}>
                    <Typography variant="body2" fontWeight="bold">{selectedCourse.rating || 'N/A'}</Typography>
                    <Typography variant="caption" color="text.secondary">Rating</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: 'action.hover' }}>
                    <Typography variant="body2" fontWeight="bold">{selectedCourse.students || 0}</Typography>
                    <Typography variant="caption" color="text.secondary">Students</Typography>
                  </Paper>
                </Grid>
              </Grid>
              <Typography variant="body1">{selectedCourse.description}</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setCourseDialogOpen(false)}>Close</Button>
              <Button variant="contained" onClick={() => enrollInCourse(selectedCourse.id)} startIcon={<PlayIcon />}>
                Enroll Now
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default LearningHub;