/**
 * CertificationAcademyHub.jsx
 *
 * Credit Repair Certification Academy - Enterprise AI Hub
 * Complete training, certification, and coaching platform for credit repair professionals
 *
 * Features:
 * - AI-powered learning paths and course recommendations
 * - Professional certification programs (Basic, Advanced, Master)
 * - Live coaching sessions and mentorship matching
 * - Practice simulations and case studies
 * - Continuing education and compliance training
 * - Business development training
 * - Community and networking features
 * - Progress tracking and achievement system
 *
 * @version 1.0.0
 * @date November 2025
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';
  GraduationCap,
  BookOpen,
  Award,
  Trophy,
  Star,
  Users,
  Video,
  FileText,
  CheckCircle,
  Clock,
  Calendar,
  Target,
  TrendingUp,
  Brain,
  Sparkles,
  Play,
  Pause,
  SkipForward,
  Volume2,
  Maximize,
  Download,
  Share2,
  Bookmark,
  BookmarkCheck,
  MessageSquare,
  ThumbsUp,
  Flag,
  Search,
  Filter,
  SortAsc,
  Grid3X3,
  List,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Lock,
  Unlock,
  AlertCircle,
  Info,
  HelpCircle,
  Settings,
  Bell,
  Mail,
  Phone,
  MapPin,
  Globe,
  Linkedin,
  Twitter,
  Facebook,
  Youtube,
  Instagram,
  ExternalLink,
  Copy,
  Edit,
  Trash2,
  Plus,
  Minus,
  RefreshCw,
  Zap,
  Shield,
  Scale,
  Briefcase,
  DollarSign,
  CreditCard,
  PieChart,
  BarChart3,
  LineChart,
  Activity,
  Layers,
  Package,
  Gift,
  Heart,
  Flame,
  Medal,
  Crown,
  Gem,
  Rocket,
  Lightbulb,
  Compass,
  Map,
  Route,
  Milestone,
  Timer,
  Hourglass,
  CalendarCheck,
  CalendarClock,
  UserCheck,
  UserPlus,
  UsersRound,
  GraduationCapIcon,
  School,
  Library,
  Presentation,
  MonitorPlay,
  Headphones,
  Mic,
  Camera,
  Image,
  FileVideo,
  FilePlus,
  FileCheck,
  FolderOpen,
  Archive,
  Clipboard,
  ClipboardCheck,
  ClipboardList,
  PenTool,
  Pencil,
  NotebookPen,
  Quote,
  Hash,
  AtSign,
  Link2,
  QrCode,
  Printer,
  Save,
  Upload,
  CloudUpload,
  Database,
  Server,
  Wifi,
  WifiOff,
  Power,
  ToggleLeft,
  ToggleRight,
  Sliders,
  Gauge,
  Thermometer,
  Percent,
  Calculator,
  Binary,
  Code,
  Terminal,
  Bug,
  TestTube,
  Beaker,
  Microscope,
  Stethoscope,
  Pill,
  Syringe,
  Bandage,
  HeartPulse,
  Brain,
  Eye,
  EyeOff,
  Ear,
  Hand,

  CalendarClock,
  UserCheck,
  UserPlus,
  UsersRound,
  GraduationCapIcon,
  School,
  Library,
  Presentation,
  MonitorPlay,
  Headphones,
  Mic,
  Camera,
  Image,
  FileVideo,
  FilePlus,
  FileCheck,
  FolderOpen,
  Archive,
  Clipboard,
  ClipboardCheck,
  ClipboardList,
  PenTool,
  Pencil,
  NotebookPen,
  Quote,
  Hash,
  AtSign,
  Link2,
  QrCode,
  Printer,
  Save,
  Upload,
  CloudUpload,
  Database,
  Server,
  Wifi,
  WifiOff,
  Power,

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const STORAGE_KEY = 'certification_academy_hub_tab';

const CERTIFICATION_LEVELS = {
  BASIC: {
    id: 'basic',
    name: 'Credit Repair Specialist',
    shortName: 'CRS',
    level: 1,
    color: '#4CAF50',
    icon: Award,
    duration: '4-6 weeks',
    credits: 40,
    price: 497,
    prerequisites: [],
    description: 'Foundation certification for credit repair professionals'
  },
  ADVANCED: {
    id: 'advanced',
    name: 'Senior Credit Consultant',
    shortName: 'SCC',
    level: 2,
    color: '#2196F3',
    icon: Trophy,
    duration: '8-12 weeks',
    credits: 80,
    price: 997,
    prerequisites: ['basic'],
    description: 'Advanced strategies and complex case management'
  },
  MASTER: {
    id: 'master',
    name: 'Master Credit Strategist',
    shortName: 'MCS',
    level: 3,
    color: '#9C27B0',
    icon: Crown,
    duration: '12-16 weeks',
    credits: 120,
    price: 1997,
    prerequisites: ['basic', 'advanced'],
    description: 'Elite certification for industry leaders'
  },
  EXPERT: {
    id: 'expert',
    name: 'Credit Repair Expert',
    shortName: 'CRE',
    level: 4,
    color: '#FF9800',
    icon: Gem,
    duration: '16-20 weeks',
    credits: 160,
    price: 2997,
    prerequisites: ['basic', 'advanced', 'master'],
    description: 'Top-tier certification with business mentorship'
  }
};

const COURSE_CATEGORIES = [
  { id: 'fundamentals', name: 'Credit Fundamentals', icon: BookOpen, color: '#4CAF50' },
  { id: 'disputes', name: 'Dispute Strategies', icon: Scale, color: '#2196F3' },
  { id: 'legal', name: 'Legal Compliance', icon: Shield, color: '#F44336' },
  { id: 'business', name: 'Business Development', icon: Briefcase, color: '#9C27B0' },
  { id: 'marketing', name: 'Marketing & Sales', icon: TrendingUp, color: '#FF9800' },
  { id: 'technology', name: 'Technology & Tools', icon: Zap, color: '#00BCD4' },
  { id: 'advanced', name: 'Advanced Techniques', icon: Brain, color: '#E91E63' },
  { id: 'specializations', name: 'Specializations', icon: Target, color: '#795548' }
];

const ACHIEVEMENT_TYPES = {
  COURSE_COMPLETE: { icon: CheckCircle, color: '#4CAF50', points: 100 },
  QUIZ_PERFECT: { icon: Star, color: '#FFD700', points: 50 },
  STREAK_7: { icon: Flame, color: '#FF5722', points: 75 },
  STREAK_30: { icon: Flame, color: '#FF9800', points: 200 },
  FIRST_CERT: { icon: Award, color: '#2196F3', points: 500 },
  MENTOR_SESSION: { icon: Users, color: '#9C27B0', points: 150 },
  COMMUNITY_HELPER: { icon: Heart, color: '#E91E63', points: 100 },
  CASE_STUDY_PASS: { icon: FileCheck, color: '#00BCD4', points: 200 }
};

const CHART_COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#E91E63', '#9C27B0', '#00BCD4', '#FF5722', '#795548'];

// ============================================================================
// MOCK DATA
// ============================================================================

const mockStudentProfile = {
  id: 'STU-001',
  name: 'Alex Thompson',
  email: 'alex.thompson@email.com',
  avatar: null,
  enrollmentDate: '2025-08-15',
  currentLevel: 'advanced',
  totalCredits: 85,
  completedCourses: 12,
  inProgressCourses: 3,
  certifications: ['basic'],
  achievements: ['COURSE_COMPLETE', 'QUIZ_PERFECT', 'STREAK_7', 'FIRST_CERT'],
  totalPoints: 1250,
  rank: 'Rising Star',
  streak: 15,
  studyHours: 127,
  quizAverage: 92,
  lastActive: '2025-11-24'
};

const mockCourses = [
  {
    id: 'CRS-101',
    title: 'Credit Repair Fundamentals',
    category: 'fundamentals',
    level: 'basic',
    duration: '4 hours',
    lessons: 12,
    credits: 4,
    rating: 4.9,
    reviews: 1247,
    enrolled: 5842,
    instructor: 'Dr. Sarah Mitchell',
    thumbnail: '/courses/fundamentals.jpg',
    description: 'Master the basics of credit repair, understanding credit reports, and foundational dispute strategies.',
    progress: 100,
    status: 'completed',
    completedDate: '2025-09-01',
    tags: ['Beginner', 'Required', 'Self-Paced'],
    modules: [
      { id: 1, title: 'Understanding Credit Reports', duration: '25 min', completed: true },
      { id: 2, title: 'Credit Score Components', duration: '30 min', completed: true },
      { id: 3, title: 'Consumer Rights Overview', duration: '20 min', completed: true },
      { id: 4, title: 'Introduction to Disputes', duration: '35 min', completed: true }
    ]
  },
  {
    id: 'CRS-102',
    title: 'FCRA Deep Dive',
    category: 'legal',
    level: 'basic',
    duration: '6 hours',
    lessons: 18,
    credits: 6,
    rating: 4.8,
    reviews: 892,
    enrolled: 4231,
    instructor: 'Attorney James Wilson',
    thumbnail: '/courses/fcra.jpg',
    description: 'Comprehensive coverage of the Fair Credit Reporting Act and how to leverage it for clients.',
    progress: 100,
    status: 'completed',
    completedDate: '2025-09-15',
    tags: ['Legal', 'Required', 'Certificate'],
    modules: [
      { id: 1, title: 'FCRA History & Purpose', duration: '20 min', completed: true },
      { id: 2, title: 'Consumer Rights Under FCRA', duration: '45 min', completed: true },
      { id: 3, title: 'Dispute Procedures', duration: '40 min', completed: true },
      { id: 4, title: 'Violations & Damages', duration: '35 min', completed: true }
    ]
  },
  {
    id: 'CRS-201',
    title: 'Advanced Dispute Strategies',
    category: 'disputes',
    level: 'advanced',
    duration: '8 hours',
    lessons: 24,
    credits: 8,
    rating: 4.9,
    reviews: 654,
    enrolled: 2847,
    instructor: 'Michael Chen, MCS',
    thumbnail: '/courses/disputes.jpg',
    description: 'Learn advanced dispute techniques including method of verification challenges and procedural disputes.',
    progress: 75,
    status: 'in_progress',
    tags: ['Advanced', 'Hands-On', 'Popular'],
    modules: [
      { id: 1, title: 'MOV Challenge Fundamentals', duration: '40 min', completed: true },
      { id: 2, title: 'Metro 2 Format Analysis', duration: '50 min', completed: true },
      { id: 3, title: 'Procedural Dispute Tactics', duration: '45 min', completed: true },
      { id: 4, title: 'Escalation Strategies', duration: '35 min', completed: false }
    ]
  },
  {
    id: 'CRS-202',
    title: 'Business Building Blueprint',
    category: 'business',
    level: 'advanced',
    duration: '10 hours',
    lessons: 30,
    credits: 10,
    rating: 4.7,
    reviews: 423,
    enrolled: 1893,
    instructor: 'Lisa Rodriguez, CRE',
    thumbnail: '/courses/business.jpg',
    description: 'Build a profitable credit repair business from scratch with proven systems and strategies.',
    progress: 45,
    status: 'in_progress',
    tags: ['Business', 'Revenue', 'Systems'],
    modules: [
      { id: 1, title: 'Business Model Selection', duration: '35 min', completed: true },
      { id: 2, title: 'Pricing Strategies', duration: '40 min', completed: true },
      { id: 3, title: 'Client Acquisition', duration: '50 min', completed: false },
      { id: 4, title: 'Scaling Operations', duration: '45 min', completed: false }
    ]
  },
  {
    id: 'CRS-203',
    title: 'Digital Marketing Mastery',
    category: 'marketing',
    level: 'advanced',
    duration: '12 hours',
    lessons: 36,
    credits: 12,
    rating: 4.8,
    reviews: 567,
    enrolled: 2156,
    instructor: 'David Park, MBA',
    thumbnail: '/courses/marketing.jpg',
    description: 'Master digital marketing strategies specifically designed for credit repair businesses.',
    progress: 20,
    status: 'in_progress',
    tags: ['Marketing', 'Digital', 'Lead Gen'],
    modules: [
      { id: 1, title: 'SEO for Credit Repair', duration: '45 min', completed: true },
      { id: 2, title: 'Social Media Strategy', duration: '50 min', completed: false },
      { id: 3, title: 'Paid Advertising', duration: '55 min', completed: false },
      { id: 4, title: 'Email Marketing', duration: '40 min', completed: false }
    ]
  },
  {
    id: 'CRS-301',
    title: 'Master Class: Complex Cases',
    category: 'advanced',
    level: 'master',
    duration: '16 hours',
    lessons: 48,
    credits: 16,
    rating: 5.0,
    reviews: 234,
    enrolled: 876,
    instructor: 'Dr. Patricia Adams, CRE',
    thumbnail: '/courses/master.jpg',
    description: 'Handle the most complex credit repair cases with advanced strategies and legal frameworks.',
    progress: 0,
    status: 'locked',
    tags: ['Master', 'Complex', 'Expert'],
    modules: [
      { id: 1, title: 'Identity Theft Cases', duration: '60 min', completed: false },
      { id: 2, title: 'Mixed Files Resolution', duration: '55 min', completed: false },
      { id: 3, title: 'Bankruptcy Navigation', duration: '50 min', completed: false },
      { id: 4, title: 'Legal Action Preparation', duration: '45 min', completed: false }
    ]
  },
  {
    id: 'CRS-302',
    title: 'Mortgage Optimization Specialist',
    category: 'specializations',
    level: 'master',
    duration: '14 hours',
    lessons: 42,
    credits: 14,
    rating: 4.9,
    reviews: 189,
    enrolled: 654,
    instructor: 'Robert Martinez, MCS',
    thumbnail: '/courses/mortgage.jpg',
    description: 'Specialize in rapid credit optimization for mortgage applicants.',
    progress: 0,
    status: 'locked',
    tags: ['Specialization', 'Mortgage', 'Rapid'],
    modules: [
      { id: 1, title: 'Mortgage Score Requirements', duration: '40 min', completed: false },
      { id: 2, title: 'Rapid Rescore Process', duration: '45 min', completed: false },
      { id: 3, title: 'Lender Relationships', duration: '35 min', completed: false },
      { id: 4, title: 'Case Studies', duration: '50 min', completed: false }
    ]
  }
];

const mockCoachingSessions = [
  {
    id: 'CS-001',
    type: 'group',
    title: 'Weekly Q&A: Dispute Strategy Review',
    instructor: 'Michael Chen, MCS',
    date: '2025-11-26',
    time: '2:00 PM EST',
    duration: '60 min',
    attendees: 45,
    maxAttendees: 100,
    status: 'upcoming',
    topics: ['MOV Challenges', 'Bureau Response Analysis', 'Escalation Timing'],
    recording: false
  },
  {
    id: 'CS-002',
    type: 'group',
    title: 'Business Growth Mastermind',
    instructor: 'Lisa Rodriguez, CRE',
    date: '2025-11-27',
    time: '1:00 PM EST',
    duration: '90 min',
    attendees: 28,
    maxAttendees: 50,
    status: 'upcoming',
    topics: ['Client Retention', 'Pricing Models', 'Team Building'],
    recording: true
  },
  {
    id: 'CS-003',
    type: 'one-on-one',
    title: 'Personal Mentorship Session',
    instructor: 'Dr. Patricia Adams, CRE',
    date: '2025-11-28',
    time: '10:00 AM EST',
    duration: '30 min',
    status: 'scheduled',
    topics: ['Career Path Planning', 'Certification Goals'],
    notes: 'Discuss advanced certification timeline'
  },
  {
    id: 'CS-004',
    type: 'workshop',
    title: 'Live Case Study Workshop',
    instructor: 'Attorney James Wilson',
    date: '2025-11-29',
    time: '3:00 PM EST',
    duration: '120 min',
    attendees: 67,
    maxAttendees: 150,
    status: 'upcoming',
    topics: ['Real Client Cases', 'Strategy Development', 'Documentation'],
    recording: true
  }
];

const mockMentors = [
  {
    id: 'M-001',
    name: 'Dr. Patricia Adams',
    credentials: 'CRE, PhD',
    specialty: 'Complex Cases & Legal Strategy',
    rating: 5.0,
    reviews: 234,
    students: 156,
    yearsExperience: 18,
    availability: 'Limited',
    hourlyRate: 250,
    bio: 'Former attorney specializing in consumer protection law with 18+ years of credit repair expertise.',
    certifications: ['CRE', 'MCS', 'SCC', 'CRS'],
    achievements: ['Industry Pioneer Award', 'Top Mentor 2024', 'Published Author']
  },
  {
    id: 'M-002',
    name: 'Michael Chen',
    credentials: 'MCS',
    specialty: 'Dispute Strategies & Bureau Relations',
    rating: 4.9,
    reviews: 189,
    students: 243,
    yearsExperience: 12,
    availability: 'Available',
    hourlyRate: 175,
    bio: 'Industry veteran known for innovative dispute techniques and bureau negotiation strategies.',
    certifications: ['MCS', 'SCC', 'CRS'],
    achievements: ['Most Helpful Mentor 2024', 'Course Creator Award']
  },
  {
    id: 'M-003',
    name: 'Lisa Rodriguez',
    credentials: 'CRE',
    specialty: 'Business Development & Scaling',
    rating: 4.8,
    reviews: 156,
    students: 198,
    yearsExperience: 15,
    availability: 'Available',
    hourlyRate: 200,
    bio: 'Built and sold two 7-figure credit repair businesses. Expert in business systems and growth.',
    certifications: ['CRE', 'MCS', 'SCC', 'CRS'],
    achievements: ['Entrepreneur of the Year', 'Business Builder Award']
  },
  {
    id: 'M-004',
    name: 'Attorney James Wilson',
    credentials: 'JD, SCC',
    specialty: 'Legal Compliance & Consumer Law',
    rating: 4.9,
    reviews: 145,
    students: 178,
    yearsExperience: 20,
    availability: 'Limited',
    hourlyRate: 300,
    bio: 'Consumer protection attorney who has won millions in FCRA/FDCPA cases.',
    certifications: ['SCC', 'CRS'],
    achievements: ['Legal Excellence Award', 'Consumer Advocate Award']
  }
];

const mockCommunityPosts = [
  {
    id: 'POST-001',
    author: 'Jennifer Martinez',
    authorCredentials: 'SCC',
    authorAvatar: null,
    title: 'Just passed my Master Credit Strategist exam!',
    content: 'After 6 months of study and practice, I finally earned my MCS certification. Here are my top tips for anyone preparing...',
    category: 'Success Stories',
    likes: 89,
    comments: 23,
    timestamp: '2025-11-23T14:30:00',
    tags: ['Certification', 'MCS', 'Study Tips']
  },
  {
    id: 'POST-002',
    author: 'David Thompson',
    authorCredentials: 'CRS',
    authorAvatar: null,
    title: 'Question: Best approach for mixed file disputes?',
    content: 'I have a client with a clear mixed file situation. Bureau is being unresponsive. What strategies have worked for you?',
    category: 'Questions',
    likes: 34,
    comments: 45,
    timestamp: '2025-11-23T10:15:00',
    tags: ['Mixed File', 'Strategy', 'Help Needed']
  },
  {
    id: 'POST-003',
    author: 'Michael Chen',
    authorCredentials: 'MCS',
    authorAvatar: null,
    title: 'Weekly Strategy Session Recording Available',
    content: 'For those who missed yesterday\'s live session on MOV challenges, the recording is now available in the course library.',
    category: 'Announcements',
    likes: 67,
    comments: 12,
    timestamp: '2025-11-22T16:45:00',
    tags: ['Recording', 'MOV', 'Session']
  }
];

const mockAchievements = [
  { id: 'ACH-001', type: 'COURSE_COMPLETE', title: 'First Steps', description: 'Complete your first course', earned: true, date: '2025-09-01', points: 100 },
  { id: 'ACH-002', type: 'QUIZ_PERFECT', title: 'Perfect Score', description: 'Score 100% on any quiz', earned: true, date: '2025-09-10', points: 50 },
  { id: 'ACH-003', type: 'STREAK_7', title: 'Week Warrior', description: 'Maintain a 7-day study streak', earned: true, date: '2025-09-20', points: 75 },
  { id: 'ACH-004', type: 'FIRST_CERT', title: 'Certified Professional', description: 'Earn your first certification', earned: true, date: '2025-10-01', points: 500 },
  { id: 'ACH-005', type: 'STREAK_30', title: 'Monthly Master', description: 'Maintain a 30-day study streak', earned: false, progress: 50, points: 200 },
  { id: 'ACH-006', type: 'MENTOR_SESSION', title: 'Guidance Seeker', description: 'Complete a mentorship session', earned: true, date: '2025-10-15', points: 150 },
  { id: 'ACH-007', type: 'COMMUNITY_HELPER', title: 'Helping Hand', description: 'Help 10 community members', earned: false, progress: 70, points: 100 },
  { id: 'ACH-008', type: 'CASE_STUDY_PASS', title: 'Case Cracker', description: 'Pass a case study simulation', earned: false, progress: 0, points: 200 }
];

const mockProgressData = [
  { month: 'Jun', credits: 4, hours: 8, quizScore: 85 },
  { month: 'Jul', credits: 8, hours: 16, quizScore: 88 },
  { month: 'Aug', credits: 12, hours: 24, quizScore: 90 },
  { month: 'Sep', credits: 20, hours: 35, quizScore: 92 },
  { month: 'Oct', credits: 28, hours: 48, quizScore: 91 },
  { month: 'Nov', credits: 40, hours: 62, quizScore: 94 }
];

const mockLeaderboard = [
  { rank: 1, name: 'Sarah Williams', points: 4850, streak: 45, badges: 12 },
  { rank: 2, name: 'James Rodriguez', points: 4620, streak: 38, badges: 11 },
  { rank: 3, name: 'Emily Chen', points: 4380, streak: 52, badges: 10 },
  { rank: 4, name: 'Michael Brown', points: 4150, streak: 29, badges: 9 },
  { rank: 5, name: 'Alex Thompson', points: 1250, streak: 15, badges: 4, isCurrentUser: true }
];

const mockCaseStudies = [
  {
    id: 'CASE-001',
    title: 'Identity Theft Recovery',
    difficulty: 'Advanced',
    duration: '45 min',
    scenario: 'Client discovered 15 fraudulent accounts after identity theft',
    objectives: ['Document fraud', 'File disputes', 'Establish fraud alerts', 'Monitor recovery'],
    credits: 3,
    completed: false,
    rating: 4.9,
    attempts: 234
  },
  {
    id: 'CASE-002',
    title: 'Rapid Mortgage Prep',
    difficulty: 'Intermediate',
    duration: '30 min',
    scenario: 'Client needs 40-point score increase in 30 days for mortgage',
    objectives: ['Score analysis', 'Quick wins identification', 'Strategy execution', 'Lender coordination'],
    credits: 2,
    completed: true,
    rating: 4.8,
    attempts: 456
  },
  {
    id: 'CASE-003',
    title: 'Collection Negotiation',
    difficulty: 'Beginner',
    duration: '20 min',
    scenario: 'Client has 3 collections totaling $12,000 affecting score',
    objectives: ['Validate debts', 'Negotiate settlements', 'Request pay-for-delete', 'Document agreements'],
    credits: 1,
    completed: true,
    rating: 4.7,
    attempts: 892
  }
];

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

const StatsCard = ({ icon: Icon, title, value, subtitle, color, trend }) => {
  const theme = useTheme();
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Avatar sx={{ bgcolor: alpha(color, 0.1), color: color, width: 48, height: 48 }}>
            <Icon size={24} />
          </Avatar>
          {trend && (
            <Chip
              size="small"
              icon={trend > 0 ? <TrendingUp size={14} /> : <TrendingUp size={14} style={{ transform: 'rotate(180deg)' }} />}
              label={`${trend > 0 ? '+' : ''}${trend}%`}
              color={trend > 0 ? 'success' : 'error'}
              variant="outlined"
            />
          )}
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>{value}</Typography>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>{title}</Typography>
        {subtitle && <Typography variant="body2" color="text.secondary">{subtitle}</Typography>}
      </CardContent>
    </Card>
  );
};

const CourseCard = ({ course, onEnroll, onContinue }) => {
  const theme = useTheme();
  const category = COURSE_CATEGORIES.find(c => c.id === course.category);
  const CategoryIcon = category?.icon || BookOpen;

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{
        height: 120,
        bgcolor: alpha(category?.color || '#666', 0.1),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}>
        <CategoryIcon size={48} color={category?.color || '#666'} />
        {course.status === 'locked' && (
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Lock size={32} color="white" />
          </Box>
        )}
        <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 0.5 }}>
          {course.tags?.slice(0, 2).map(tag => (
            <Chip key={tag} label={tag} size="small" sx={{ bgcolor: 'white', fontSize: '0.7rem' }} />
          ))}
        </Box>
      </Box>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Chip
            label={category?.name}
            size="small"
            sx={{ bgcolor: alpha(category?.color || '#666', 0.1), color: category?.color }}
          />
          <Chip
            label={`${course.credits} Credits`}
            size="small"
            variant="outlined"
          />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, lineHeight: 1.3 }}>
          {course.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
          {course.description}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Clock size={14} />
            <Typography variant="caption">{course.duration}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <BookOpen size={14} />
            <Typography variant="caption">{course.lessons} lessons</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Star size={14} fill="#FFD700" color="#FFD700" />
            <Typography variant="caption">{course.rating}</Typography>
          </Box>
        </Box>
        {course.status === 'in_progress' && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">Progress</Typography>
              <Typography variant="caption" fontWeight={600}>{course.progress}%</Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={course.progress}
              sx={{ height: 6, borderRadius: 3 }}
            />
          </Box>
        )}
        <Typography variant="body2" color="text.secondary">
          <Users size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
          {course.enrolled.toLocaleString()} enrolled
        </Typography>
      </CardContent>
      <CardActions sx={{ p: 2, pt: 0 }}>
        {course.status === 'completed' && (
          <Button fullWidth variant="outlined" color="success" startIcon={<CheckCircle size={18} />}>
            Completed
          </Button>
        )}
        {course.status === 'in_progress' && (
          <Button fullWidth variant="contained" onClick={() => onContinue?.(course)} startIcon={<Play size={18} />}>
            Continue
          </Button>
        )}
        {course.status === 'not_started' && (
          <Button fullWidth variant="contained" onClick={() => onEnroll?.(course)} startIcon={<BookOpen size={18} />}>
            Start Course
          </Button>
        )}
        {course.status === 'locked' && (
          <Button fullWidth variant="outlined" disabled startIcon={<Lock size={18} />}>
            Prerequisites Required
          </Button>
        )}
      </CardActions>
    </Card>
  );
};

const AchievementBadge = ({ achievement, size = 'medium' }) => {
  const config = ACHIEVEMENT_TYPES[achievement.type] || {};
  const Icon = config.icon || Award;
  const iconSize = size === 'small' ? 20 : size === 'large' ? 40 : 28;
  const avatarSize = size === 'small' ? 40 : size === 'large' ? 80 : 56;

  return (
    <Tooltip title={`${achievement.title}: ${achievement.description} (${achievement.points} pts)`}>
      <Box sx={{ textAlign: 'center' }}>
        <Avatar
          sx={{
            width: avatarSize,
            height: avatarSize,
            bgcolor: achievement.earned ? alpha(config.color || '#666', 0.1) : 'action.disabledBackground',
            color: achievement.earned ? config.color : 'action.disabled',
            mx: 'auto',
            mb: 1,
            border: achievement.earned ? `2px solid ${config.color}` : 'none'
          }}
        >
          <Icon size={iconSize} />
        </Avatar>
        {size !== 'small' && (
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              color: achievement.earned ? 'text.primary' : 'text.disabled',
              display: 'block'
            }}
          >
            {achievement.title}
          </Typography>
        )}
      </Box>
    </Tooltip>
  );
};

const CertificationBadge = ({ level, earned = false, size = 'medium' }) => {
  const cert = CERTIFICATION_LEVELS[level.toUpperCase()];
  if (!cert) return null;
  const Icon = cert.icon;
  const iconSize = size === 'small' ? 24 : size === 'large' ? 48 : 32;

  return (
    <Tooltip title={`${cert.name} (${cert.shortName})`}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          opacity: earned ? 1 : 0.3
        }}
      >
        <Avatar
          sx={{
            width: iconSize * 2,
            height: iconSize * 2,
            bgcolor: alpha(cert.color, 0.1),
            color: cert.color,
            border: `3px solid ${cert.color}`
          }}
        >
          <Icon size={iconSize} />
        </Avatar>
        <Typography variant="caption" sx={{ fontWeight: 700, mt: 1, color: cert.color }}>
          {cert.shortName}
        </Typography>
      </Box>
    </Tooltip>
  );
};

// ============================================================================
// TAB PANELS
// ============================================================================

// Tab 0: Dashboard
const DashboardTab = ({ studentProfile, courses, achievements }) => {
  const theme = useTheme();

  const inProgressCourses = courses.filter(c => c.status === 'in_progress');
  const completedCourses = courses.filter(c => c.status === 'completed');
  const earnedAchievements = achievements.filter(a => a.earned);

  return (
    <Box>
      {/* Welcome Banner */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          color: 'white',
          borderRadius: 3
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar sx={{ width: 64, height: 64, bgcolor: 'white', color: 'primary.main' }}>
                <GraduationCap size={32} />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  Welcome back, {studentProfile.name}!
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  You're on a {studentProfile.streak}-day learning streak! 🔥
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Chip
                icon={<Award size={16} />}
                label={studentProfile.rank}
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
              <Chip
                icon={<Star size={16} />}
                label={`${studentProfile.totalPoints.toLocaleString()} Points`}
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
              <Chip
                icon={<BookOpen size={16} />}
                label={`${studentProfile.totalCredits} Credits`}
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="subtitle2" sx={{ opacity: 0.9, mb: 1 }}>
                Next Certification
              </Typography>
              <CertificationBadge level="advanced" earned={false} size="large" />
              <LinearProgress
                variant="determinate"
                value={65}
                sx={{
                  mt: 2,
                  height: 8,
                  borderRadius: 4,
                  bgcolor: 'rgba(255,255,255,0.3)',
                  '& .MuiLinearProgress-bar': { bgcolor: 'white' }
                }}
              />
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                65% to Senior Credit Consultant
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <StatsCard
            icon={BookOpen}
            title="Courses Completed"
            value={studentProfile.completedCourses}
            subtitle={`${studentProfile.inProgressCourses} in progress`}
            color="#4CAF50"
            trend={15}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatsCard
            icon={Clock}
            title="Study Hours"
            value={studentProfile.studyHours}
            subtitle="Total learning time"
            color="#2196F3"
            trend={22}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatsCard
            icon={Target}
            title="Quiz Average"
            value={`${studentProfile.quizAverage}%`}
            subtitle="Across all courses"
            color="#FF9800"
            trend={5}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatsCard
            icon={Trophy}
            title="Achievements"
            value={earnedAchievements.length}
            subtitle={`of ${achievements.length} total`}
            color="#9C27B0"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Continue Learning */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Play size={20} /> Continue Learning
            </Typography>
            {inProgressCourses.length > 0 ? (
              <List disablePadding>
                {inProgressCourses.map((course, index) => (
                  <React.Fragment key={course.id}>
                    {index > 0 && <Divider />}
                    <ListItem sx={{ px: 0, py: 2 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: alpha(COURSE_CATEGORIES.find(c => c.id === course.category)?.color || '#666', 0.1) }}>
                          {React.createElement(COURSE_CATEGORIES.find(c => c.id === course.category)?.icon || BookOpen, { size: 20, color: COURSE_CATEGORIES.find(c => c.id === course.category)?.color })}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={course.title}
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="caption" color="text.secondary">
                                {course.progress}% complete
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {course.credits - Math.floor(course.credits * course.progress / 100)} credits remaining
                              </Typography>
                            </Box>
                            <LinearProgress variant="determinate" value={course.progress} sx={{ height: 6, borderRadius: 3 }} />
                          </Box>
                        }
                      />
                      <Button variant="contained" size="small" startIcon={<Play size={16} />} sx={{ ml: 2 }}>
                        Resume
                      </Button>
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Alert severity="info">
                No courses in progress. Start a new course to continue learning!
              </Alert>
            )}
          </Paper>

          {/* Progress Chart */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUp size={20} /> Learning Progress
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={mockProgressData}>
                <defs>
                  <linearGradient id="colorCredits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#4CAF50" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <RechartsTooltip />
                <Area type="monotone" dataKey="credits" stroke="#4CAF50" fillOpacity={1} fill="url(#colorCredits)" name="Credits Earned" />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Upcoming Sessions */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Calendar size={20} /> Upcoming Sessions
            </Typography>
            <List disablePadding>
              {mockCoachingSessions.slice(0, 3).map((session, index) => (
                <ListItem key={session.id} sx={{ px: 0, py: 1 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: session.type === 'group' ? 'primary.light' : 'secondary.light' }}>
                      {session.type === 'group' ? <Users size={18} /> : <Video size={18} />}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={<Typography variant="body2" fontWeight={600}>{session.title}</Typography>}
                    secondary={`${session.date} at ${session.time}`}
                  />
                </ListItem>
              ))}
            </List>
            <Button fullWidth variant="outlined" sx={{ mt: 1 }}>
              View All Sessions
            </Button>
          </Paper>

          {/* Achievements */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Trophy size={20} /> Recent Achievements
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
              {achievements.slice(0, 6).map(achievement => (
                <AchievementBadge key={achievement.id} achievement={achievement} size="small" />
              ))}
            </Box>
            <Button fullWidth variant="outlined" sx={{ mt: 2 }}>
              View All Achievements
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

// Tab 1: Course Library
const CourseLibraryTab = ({ courses }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           course.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
      const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;
      return matchesSearch && matchesCategory && matchesLevel;
    });
  }, [courses, searchQuery, selectedCategory, selectedLevel]);

  return (
    <Box>
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <Search size={18} style={{ marginRight: 8, color: '#666' }} />
              }}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} label="Category">
                <MenuItem value="all">All Categories</MenuItem>
                {COURSE_CATEGORIES.map(cat => (
                  <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Level</InputLabel>
              <Select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)} label="Level">
                <MenuItem value="all">All Levels</MenuItem>
                <MenuItem value="basic">Basic</MenuItem>
                <MenuItem value="advanced">Advanced</MenuItem>
                <MenuItem value="master">Master</MenuItem>
                <MenuItem value="expert">Expert</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <IconButton
                onClick={() => setViewMode('grid')}
                color={viewMode === 'grid' ? 'primary' : 'default'}
              >
                <Grid3X3 size={20} />
              </IconButton>
              <IconButton
                onClick={() => setViewMode('list')}
                color={viewMode === 'list' ? 'primary' : 'default'}
              >
                <ListIcon size={20} />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Course Categories Overview */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Browse by Category
        </Typography>
        <Grid container spacing={2}>
          {COURSE_CATEGORIES.map(category => {
            const Icon = category.icon;
            const courseCount = courses.filter(c => c.category === category.id).length;
            return (
              <Grid item xs={6} sm={4} md={3} key={category.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 },
                    border: selectedCategory === category.id ? `2px solid ${category.color}` : 'none'
                  }}
                  onClick={() => setSelectedCategory(category.id === selectedCategory ? 'all' : category.id)}
                >
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <Avatar sx={{ bgcolor: alpha(category.color, 0.1), color: category.color, mx: 'auto', mb: 1, width: 48, height: 48 }}>
                      <Icon size={24} />
                    </Avatar>
                    <Typography variant="body2" fontWeight={600}>{category.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{courseCount} courses</Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Paper>

      {/* Course Grid */}
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        {filteredCourses.length} Courses Available
      </Typography>
      <Grid container spacing={3}>
        {filteredCourses.map(course => (
          <Grid item xs={12} sm={6} md={4} key={course.id}>
            <CourseCard course={course} />
          </Grid>
        ))}
      </Grid>

      {filteredCourses.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          No courses found matching your criteria. Try adjusting your filters.
        </Alert>
      )}
    </Box>
  );
};

// Tab 2: Certifications
const CertificationsTab = ({ studentProfile }) => {
  const theme = useTheme();
  const [selectedCert, setSelectedCert] = useState(null);

  const certificationPath = Object.values(CERTIFICATION_LEVELS);

  return (
    <Box>
      {/* Current Status */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
              Your Certification Journey
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Track your progress through our comprehensive certification program.
              Each level builds upon the previous, preparing you for advanced
              credit repair strategies and business success.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Chip icon={<Award size={16} />} label={`${studentProfile.certifications.length} Certifications Earned`} color="primary" />
              <Chip icon={<BookOpen size={16} />} label={`${studentProfile.totalCredits} Total Credits`} />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3 }}>
              {certificationPath.slice(0, 4).map(cert => (
                <CertificationBadge
                  key={cert.id}
                  level={cert.id}
                  earned={studentProfile.certifications.includes(cert.id)}
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Certification Cards */}
      <Grid container spacing={3}>
        {certificationPath.map((cert, index) => {
          const isEarned = studentProfile.certifications.includes(cert.id);
          const isAvailable = cert.prerequisites.every(p => studentProfile.certifications.includes(p));
          const Icon = cert.icon;

          return (
            <Grid item xs={12} md={6} key={cert.id}>
              <Card sx={{
                height: '100%',
                border: isEarned ? `2px solid ${cert.color}` : 'none',
                opacity: isAvailable || isEarned ? 1 : 0.6
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                    <Avatar sx={{
                      width: 64,
                      height: 64,
                      bgcolor: alpha(cert.color, 0.1),
                      color: cert.color
                    }}>
                      <Icon size={32} />
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {cert.name}
                        </Typography>
                        {isEarned && (
                          <Chip label="Earned" size="small" color="success" />
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {cert.shortName} - Level {cert.level}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {cert.description}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Duration</Typography>
                      <Typography variant="body2" fontWeight={600}>{cert.duration}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Credits Required</Typography>
                      <Typography variant="body2" fontWeight={600}>{cert.credits} credits</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Investment</Typography>
                      <Typography variant="body2" fontWeight={600}>${cert.price}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Prerequisites</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {cert.prerequisites.length === 0 ? 'None' : cert.prerequisites.map(p => CERTIFICATION_LEVELS[p.toUpperCase()]?.shortName).join(', ')}
                      </Typography>
                    </Grid>
                  </Grid>

                  {!isEarned && (
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption">Progress to certification</Typography>
                        <Typography variant="caption" fontWeight={600}>
                          {Math.min(studentProfile.totalCredits, cert.credits)}/{cert.credits} credits
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min((studentProfile.totalCredits / cert.credits) * 100, 100)}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                  )}
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0 }}>
                  {isEarned ? (
                    <Button fullWidth variant="outlined" color="success" startIcon={<Download size={18} />}>
                      Download Certificate
                    </Button>
                  ) : isAvailable ? (
                    <Button fullWidth variant="contained" sx={{ bgcolor: cert.color }} startIcon={<Rocket size={18} />}>
                      Start Certification
                    </Button>
                  ) : (
                    <Button fullWidth variant="outlined" disabled startIcon={<Lock size={18} />}>
                      Complete Prerequisites
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Certification Benefits */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Certification Benefits
        </Typography>
        <Grid container spacing={2}>
          {[
            { icon: Award, title: 'Industry Recognition', description: 'Credentials recognized by lenders and partners' },
            { icon: TrendingUp, title: 'Higher Earnings', description: 'Certified professionals earn 40% more on average' },
            { icon: Users, title: 'Exclusive Network', description: 'Access to certified professional community' },
            { icon: Shield, title: 'Legal Protection', description: 'Training on compliance and best practices' },
            { icon: Briefcase, title: 'Business Tools', description: 'Templates, scripts, and marketing materials' },
            { icon: Zap, title: 'Priority Support', description: 'Direct access to expert advisors' }
          ].map((benefit, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main' }}>
                  <benefit.icon size={20} />
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" fontWeight={600}>{benefit.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{benefit.description}</Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
};

// Tab 3: Live Coaching
const LiveCoachingTab = () => {
  const [sessionType, setSessionType] = useState('all');

  const filteredSessions = mockCoachingSessions.filter(s => sessionType === 'all' || s.type === sessionType);

  return (
    <Box>
      {/* Hero Section */}
      <Paper sx={{
        p: 4,
        mb: 3,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        borderRadius: 3
      }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Live Coaching & Workshops
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, mb: 2 }}>
              Join live sessions with industry experts, participate in Q&A,
              and accelerate your learning with real-time guidance.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Chip
                icon={<Video size={16} />}
                label="4 Upcoming Sessions"
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
              <Chip
                icon={<Users size={16} />}
                label="150+ Active Learners"
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<Calendar size={20} />}
              sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }}
            >
              Schedule 1-on-1 Session
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Filter Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={sessionType} onChange={(e, v) => setSessionType(v)}>
          <Tab value="all" label="All Sessions" />
          <Tab value="group" label="Group Sessions" />
          <Tab value="workshop" label="Workshops" />
          <Tab value="one-on-one" label="1-on-1 Mentoring" />
        </Tabs>
      </Paper>

      {/* Session Cards */}
      <Grid container spacing={3}>
        {filteredSessions.map(session => (
          <Grid item xs={12} md={6} key={session.id}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                  <Avatar sx={{
                    bgcolor: session.type === 'group' ? 'primary.light' :
                             session.type === 'workshop' ? 'secondary.light' : 'success.light',
                    width: 56,
                    height: 56
                  }}>
                    {session.type === 'group' ? <Users size={28} /> :
                     session.type === 'workshop' ? <Presentation size={28} /> : <Video size={28} />}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Chip
                        label={session.type === 'group' ? 'Group' : session.type === 'workshop' ? 'Workshop' : '1-on-1'}
                        size="small"
                        color={session.type === 'group' ? 'primary' : session.type === 'workshop' ? 'secondary' : 'success'}
                      />
                      {session.recording && (
                        <Chip label="Recording Available" size="small" variant="outlined" />
                      )}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {session.title}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Calendar size={16} />
                    <Typography variant="body2">{session.date}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Clock size={16} />
                    <Typography variant="body2">{session.time}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Timer size={16} />
                    <Typography variant="body2">{session.duration}</Typography>
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  <strong>Instructor:</strong> {session.instructor}
                </Typography>

                {session.topics && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">Topics:</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                      {session.topics.map(topic => (
                        <Chip key={topic} label={topic} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </Box>
                )}

                {session.attendees !== undefined && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Users size={16} />
                    <Typography variant="body2">
                      {session.attendees}/{session.maxAttendees} registered
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={(session.attendees / session.maxAttendees) * 100}
                      sx={{ flexGrow: 1, height: 6, borderRadius: 3 }}
                    />
                  </Box>
                )}
              </CardContent>
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button fullWidth variant="contained" startIcon={<CalendarCheck size={18} />}>
                  {session.type === 'one-on-one' ? 'Confirm Session' : 'Register Now'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

// Tab 4: Mentorship
const MentorshipTab = () => {
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');

  return (
    <Box>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          Find Your Mentor
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Connect with experienced professionals who can guide your career and accelerate your success.
        </Typography>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Specialty</InputLabel>
          <Select value={selectedSpecialty} onChange={(e) => setSelectedSpecialty(e.target.value)} label="Specialty">
            <MenuItem value="all">All Specialties</MenuItem>
            <MenuItem value="disputes">Dispute Strategies</MenuItem>
            <MenuItem value="legal">Legal & Compliance</MenuItem>
            <MenuItem value="business">Business Development</MenuItem>
            <MenuItem value="marketing">Marketing & Sales</MenuItem>
          </Select>
        </FormControl>
      </Paper>

      {/* Mentor Cards */}
      <Grid container spacing={3}>
        {mockMentors.map(mentor => (
          <Grid item xs={12} md={6} key={mentor.id}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.light' }}>
                    {mentor.name.split(' ').map(n => n[0]).join('')}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {mentor.name}
                    </Typography>
                    <Typography variant="body2" color="primary.main" fontWeight={600}>
                      {mentor.credentials}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {mentor.specialty}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <Rating value={mentor.rating} precision={0.1} size="small" readOnly />
                      <Typography variant="caption">({mentor.reviews} reviews)</Typography>
                    </Box>
                  </Box>
                </Box>

                <Typography variant="body2" sx={{ mb: 2 }}>
                  {mentor.bio}
                </Typography>

                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={4}>
                    <Typography variant="caption" color="text.secondary">Experience</Typography>
                    <Typography variant="body2" fontWeight={600}>{mentor.yearsExperience} years</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="caption" color="text.secondary">Students</Typography>
                    <Typography variant="body2" fontWeight={600}>{mentor.students}</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="caption" color="text.secondary">Rate</Typography>
                    <Typography variant="body2" fontWeight={600}>${mentor.hourlyRate}/hr</Typography>
                  </Grid>
                </Grid>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                  {mentor.certifications.map(cert => (
                    <Chip key={cert} label={cert} size="small" variant="outlined" color="primary" />
                  ))}
                </Box>

                <Chip
                  label={mentor.availability}
                  size="small"
                  color={mentor.availability === 'Available' ? 'success' : 'warning'}
                />
              </CardContent>
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button fullWidth variant="contained" startIcon={<Calendar size={18} />}>
                  Book Session
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

// Tab 5: Case Studies & Simulations
const CaseStudiesTab = () => {
  return (
    <Box>
      {/* Header */}
      <Paper sx={{
        p: 4,
        mb: 3,
        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        color: 'white',
        borderRadius: 3
      }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Practice Makes Perfect
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9, mb: 2 }}>
          Apply your knowledge with real-world case studies and interactive simulations.
          Earn credits and build confidence before working with actual clients.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Chip
            icon={<FileText size={16} />}
            label="15 Case Studies"
            sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
          />
          <Chip
            icon={<Zap size={16} />}
            label="AI-Powered Feedback"
            sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
          />
        </Box>
      </Paper>

      {/* Case Study Cards */}
      <Grid container spacing={3}>
        {mockCaseStudies.map(caseStudy => (
          <Grid item xs={12} md={4} key={caseStudy.id}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Chip
                    label={caseStudy.difficulty}
                    size="small"
                    color={caseStudy.difficulty === 'Beginner' ? 'success' :
                           caseStudy.difficulty === 'Intermediate' ? 'warning' : 'error'}
                  />
                  {caseStudy.completed && (
                    <CheckCircle size={20} color="#4CAF50" />
                  )}
                </Box>

                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  {caseStudy.title}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {caseStudy.scenario}
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Clock size={14} />
                    <Typography variant="caption">{caseStudy.duration}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Award size={14} />
                    <Typography variant="caption">{caseStudy.credits} credits</Typography>
                  </Box>
                </Box>

                <Typography variant="caption" color="text.secondary">Objectives:</Typography>
                <List dense disablePadding>
                  {caseStudy.objectives.map((obj, index) => (
                    <ListItem key={index} sx={{ px: 0, py: 0.25 }}>
                      <ListItemIcon sx={{ minWidth: 24 }}>
                        <Target size={14} />
                      </ListItemIcon>
                      <ListItemText
                        primary={<Typography variant="caption">{obj}</Typography>}
                      />
                    </ListItem>
                  ))}
                </List>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                  <Star size={14} fill="#FFD700" color="#FFD700" />
                  <Typography variant="caption">{caseStudy.rating}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    ({caseStudy.attempts} attempts)
                  </Typography>
                </Box>
              </CardContent>
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                  fullWidth
                  variant={caseStudy.completed ? 'outlined' : 'contained'}
                  startIcon={caseStudy.completed ? <RefreshCw size={18} /> : <Play size={18} />}
                >
                  {caseStudy.completed ? 'Retry' : 'Start Simulation'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

// Tab 6: Community
const CommunityTab = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  return (
    <Box>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              Community Forum
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Connect with fellow professionals, share insights, and get help from the community.
            </Typography>
          </Grid>
          <Grid item xs={12} md={4} sx={{ textAlign: 'right' }}>
            <Button variant="contained" startIcon={<Plus size={18} />}>
              New Discussion
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        {/* Posts List */}
        <Grid item xs={12} md={8}>
          <Paper>
            {mockCommunityPosts.map((post, index) => (
              <React.Fragment key={post.id}>
                {index > 0 && <Divider />}
                <Box sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.light' }}>
                      {post.author.split(' ').map(n => n[0]).join('')}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {post.author}
                        </Typography>
                        <Chip label={post.authorCredentials} size="small" variant="outlined" />
                        <Typography variant="caption" color="text.secondary">
                          • {new Date(post.timestamp).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Chip label={post.category} size="small" sx={{ mb: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        {post.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {post.content}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, mb: 2 }}>
                        {post.tags.map(tag => (
                          <Chip key={tag} label={tag} size="small" variant="outlined" />
                        ))}
                      </Box>
                      <Box sx={{ display: 'flex', gap: 3 }}>
                        <Button size="small" startIcon={<ThumbsUp size={16} />}>
                          {post.likes}
                        </Button>
                        <Button size="small" startIcon={<MessageSquare size={16} />}>
                          {post.comments} Comments
                        </Button>
                        <Button size="small" startIcon={<Share2 size={16} />}>
                          Share
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </React.Fragment>
            ))}
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Leaderboard */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Trophy size={20} /> Leaderboard
            </Typography>
            <List disablePadding>
              {mockLeaderboard.map((user, index) => (
                <ListItem
                  key={user.rank}
                  sx={{
                    px: 0,
                    bgcolor: user.isCurrentUser ? 'action.selected' : 'transparent',
                    borderRadius: 1
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{
                      bgcolor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : 'grey.300',
                      color: index < 3 ? 'white' : 'text.primary',
                      width: 36,
                      height: 36
                    }}>
                      {user.rank}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="body2" fontWeight={user.isCurrentUser ? 700 : 400}>
                        {user.name} {user.isCurrentUser && '(You)'}
                      </Typography>
                    }
                    secondary={`${user.points.toLocaleString()} pts • ${user.streak} day streak`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>

          {/* Active Topics */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Flame size={20} /> Trending Topics
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {['MOV Challenges', 'Metro 2', 'FCRA Updates', 'Business Tips', 'Success Stories', 'Legal Help'].map(topic => (
                <Chip key={topic} label={topic} clickable variant="outlined" />
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

// Tab 7: Achievements & Rewards
const AchievementsTab = ({ achievements, studentProfile }) => {
  const earnedAchievements = achievements.filter(a => a.earned);
  const totalPoints = earnedAchievements.reduce((sum, a) => sum + a.points, 0);

  return (
    <Box>
      {/* Stats Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              Your Achievements
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Track your progress and earn rewards for your dedication to learning.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Chip icon={<Trophy size={16} />} label={`${earnedAchievements.length}/${achievements.length} Badges`} color="primary" />
              <Chip icon={<Star size={16} />} label={`${totalPoints.toLocaleString()} Points`} />
              <Chip icon={<Flame size={16} />} label={`${studentProfile.streak} Day Streak`} color="error" />
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {studentProfile.rank}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Current Rank
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Achievement Grid */}
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        All Achievements
      </Typography>
      <Grid container spacing={3}>
        {achievements.map(achievement => {
          const config = ACHIEVEMENT_TYPES[achievement.type] || {};
          const Icon = config.icon || Award;

          return (
            <Grid item xs={6} sm={4} md={3} key={achievement.id}>
              <Card sx={{
                height: '100%',
                opacity: achievement.earned ? 1 : 0.6,
                border: achievement.earned ? `2px solid ${config.color}` : 'none'
              }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Avatar
                    sx={{
                      width: 64,
                      height: 64,
                      bgcolor: achievement.earned ? alpha(config.color || '#666', 0.1) : 'action.disabledBackground',
                      color: achievement.earned ? config.color : 'action.disabled',
                      mx: 'auto',
                      mb: 2
                    }}
                  >
                    <Icon size={32} />
                  </Avatar>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {achievement.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {achievement.description}
                  </Typography>
                  <Chip
                    label={`${achievement.points} pts`}
                    size="small"
                    color={achievement.earned ? 'primary' : 'default'}
                  />
                  {achievement.earned && (
                    <Typography variant="caption" display="block" color="success.main" sx={{ mt: 1 }}>
                      Earned {achievement.date}
                    </Typography>
                  )}
                  {!achievement.earned && achievement.progress !== undefined && (
                    <Box sx={{ mt: 1 }}>
                      <LinearProgress variant="determinate" value={achievement.progress} sx={{ height: 6, borderRadius: 3 }} />
                      <Typography variant="caption" color="text.secondary">
                        {achievement.progress}% complete
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

// Tab 8: AI Study Assistant
const AIStudyAssistantTab = () => {
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI Study Assistant. I can help you with:\n\n• Explaining credit repair concepts\n• Reviewing dispute strategies\n• Clarifying legal requirements\n• Quiz preparation\n• Career guidance\n\nWhat would you like to learn about today?'
    }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSendQuestion = () => {
    if (!question.trim()) return;

    setChatHistory(prev => [...prev, { role: 'user', content: question }]);
    setQuestion('');
    setIsProcessing(true);

    // Simulate AI response
    setTimeout(() => {
      setChatHistory(prev => [...prev, {
        role: 'assistant',
        content: 'That\'s a great question! Let me explain...\n\n[AI-generated response based on your certification curriculum and industry best practices would appear here]\n\nWould you like me to elaborate on any specific aspect?'
      }]);
      setIsProcessing(false);
    }, 1500);
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Chat Area */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '70vh', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <Brain size={24} />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={600}>AI Study Assistant</Typography>
                <Typography variant="caption" color="text.secondary">
                  Powered by advanced AI • Available 24/7
                </Typography>
              </Box>
              <Chip label="AI" color="primary" size="small" sx={{ ml: 'auto' }} />
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* Chat Messages */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 2 }}>
              {chatHistory.map((message, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                    mb: 2
                  }}
                >
                  <Paper
                    sx={{
                      p: 2,
                      maxWidth: '80%',
                      bgcolor: message.role === 'user' ? 'primary.main' : 'grey.100',
                      color: message.role === 'user' ? 'white' : 'text.primary',
                      borderRadius: 2
                    }}
                  >
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {message.content}
                    </Typography>
                  </Paper>
                </Box>
              ))}
              {isProcessing && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} />
                  <Typography variant="body2" color="text.secondary">
                    AI is thinking...
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Input Area */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                placeholder="Ask me anything about credit repair..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendQuestion()}
                disabled={isProcessing}
              />
              <Button
                variant="contained"
                onClick={handleSendQuestion}
                disabled={isProcessing || !question.trim()}
              >
                <Sparkles size={20} />
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Quick Topics */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Quick Topics
            </Typography>
            <Stack spacing={1}>
              {[
                'Explain FCRA Section 611',
                'Metro 2 format basics',
                'Method of Verification',
                'Credit score factors',
                'Statute of limitations',
                'Pay for delete strategy'
              ].map(topic => (
                <Button
                  key={topic}
                  variant="outlined"
                  fullWidth
                  sx={{ justifyContent: 'flex-start' }}
                  onClick={() => setQuestion(topic)}
                >
                  {topic}
                </Button>
              ))}
            </Stack>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Study Resources
            </Typography>
            <List disablePadding>
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon><FileText size={20} /></ListItemIcon>
                <ListItemText primary="FCRA Quick Reference" />
                <IconButton size="small"><Download size={16} /></IconButton>
              </ListItem>
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon><FileText size={20} /></ListItemIcon>
                <ListItemText primary="Dispute Letter Templates" />
                <IconButton size="small"><Download size={16} /></IconButton>
              </ListItem>
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon><FileText size={20} /></ListItemIcon>
                <ListItemText primary="Study Flashcards" />
                <IconButton size="small"><Download size={16} /></IconButton>
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

// Tab 9: Analytics & Progress
const AnalyticsTab = ({ studentProfile }) => {
  const theme = useTheme();

  const skillRadarData = [
    { skill: 'Disputes', value: 85 },
    { skill: 'Legal', value: 70 },
    { skill: 'Business', value: 60 },
    { skill: 'Marketing', value: 45 },
    { skill: 'Technology', value: 75 },
    { skill: 'Communication', value: 80 }
  ];

  const categoryBreakdown = [
    { name: 'Fundamentals', value: 100, color: '#4CAF50' },
    { name: 'Legal', value: 80, color: '#2196F3' },
    { name: 'Disputes', value: 65, color: '#FF9800' },
    { name: 'Business', value: 40, color: '#9C27B0' }
  ];

  return (
    <Box>
      {/* Summary Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <StatsCard
            icon={BookOpen}
            title="Total Courses"
            value={studentProfile.completedCourses + studentProfile.inProgressCourses}
            subtitle={`${studentProfile.completedCourses} completed`}
            color="#4CAF50"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatsCard
            icon={Clock}
            title="Study Time"
            value={`${studentProfile.studyHours}h`}
            subtitle="Total hours invested"
            color="#2196F3"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatsCard
            icon={Award}
            title="Credits Earned"
            value={studentProfile.totalCredits}
            subtitle="Toward certifications"
            color="#FF9800"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatsCard
            icon={Target}
            title="Quiz Average"
            value={`${studentProfile.quizAverage}%`}
            subtitle="Across all quizzes"
            color="#9C27B0"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Learning Progress Over Time */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Learning Progress Over Time
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsLineChart data={mockProgressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <RechartsTooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="credits" stroke="#4CAF50" name="Credits" strokeWidth={2} />
                <Line yAxisId="left" type="monotone" dataKey="hours" stroke="#2196F3" name="Hours" strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="quizScore" stroke="#FF9800" name="Quiz Score %" strokeWidth={2} />
              </RechartsLineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Skill Radar */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Skill Assessment
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={skillRadarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="skill" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar name="Your Skills" dataKey="value" stroke="#2196F3" fill="#2196F3" fillOpacity={0.5} />
              </RadarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Category Breakdown */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Progress by Category
            </Typography>
            <Stack spacing={2}>
              {categoryBreakdown.map(category => (
                <Box key={category.name}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">{category.name}</Typography>
                    <Typography variant="body2" fontWeight={600}>{category.value}%</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={category.value}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      bgcolor: alpha(category.color, 0.1),
                      '& .MuiLinearProgress-bar': { bgcolor: category.color }
                    }}
                  />
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>

        {/* Weekly Activity */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Weekly Study Activity
            </Typography>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={[
                { day: 'Mon', hours: 2.5 },
                { day: 'Tue', hours: 1.5 },
                { day: 'Wed', hours: 3 },
                { day: 'Thu', hours: 2 },
                { day: 'Fri', hours: 1 },
                { day: 'Sat', hours: 4 },
                { day: 'Sun', hours: 2.5 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="hours" fill="#4CAF50" radius={[4, 4, 0, 0]} name="Study Hours" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const CertificationAcademyHub = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // State
  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? parseInt(saved, 10) : 0;
  });
  const [loading, setLoading] = useState(true);
  const [studentProfile, setStudentProfile] = useState(mockStudentProfile);
  const [courses, setCourses] = useState(mockCourses);
  const [achievements, setAchievements] = useState(mockAchievements);

  // Effects
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, activeTab.toString());
  }, [activeTab]);

  useEffect(() => {
    // Simulate initial load
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Handlers
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Tab Configuration
  const tabs = [
    { label: 'Dashboard', icon: LayoutDashboard },
    { label: 'Course Library', icon: BookOpen },
    { label: 'Certifications', icon: Award },
    { label: 'Live Coaching', icon: Video },
    { label: 'Mentorship', icon: Users },
    { label: 'Case Studies', icon: FileText },
    { label: 'Community', icon: MessageSquare },
    { label: 'Achievements', icon: Trophy },
    { label: 'AI Assistant', icon: Brain },
    { label: 'Analytics', icon: BarChart3 }
  ];

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>Loading Academy...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
            <GraduationCap size={32} />
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Credit Repair Certification Academy
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Master the art and science of credit repair with AI-powered learning
            </Typography>
          </Box>
          <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
            <Chip icon={<Sparkles size={16} />} label="AI-Powered" color="primary" />
            <Chip icon={<Award size={16} />} label="Certified" color="success" />
          </Box>
        </Box>
      </Box>

      {/* Navigation Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons={isMobile ? "auto" : false}
          sx={{
            '& .MuiTab-root': {
              minHeight: 64,
              textTransform: 'none',
              fontWeight: 500
            }
          }}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              label={tab.label}
              icon={<tab.icon size={20} />}
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box sx={{ minHeight: '60vh' }}>
        {activeTab === 0 && <DashboardTab studentProfile={studentProfile} courses={courses} achievements={achievements} />}
        {activeTab === 1 && <CourseLibraryTab courses={courses} />}
        {activeTab === 2 && <CertificationsTab studentProfile={studentProfile} />}
        {activeTab === 3 && <LiveCoachingTab />}
        {activeTab === 4 && <MentorshipTab />}
        {activeTab === 5 && <CaseStudiesTab />}
        {activeTab === 6 && <CommunityTab />}
        {activeTab === 7 && <AchievementsTab achievements={achievements} studentProfile={studentProfile} />}
        {activeTab === 8 && <AIStudyAssistantTab />}
        {activeTab === 9 && <AnalyticsTab studentProfile={studentProfile} />}
      </Box>
    </Container>
  );
};

export default CertificationAcademyHub;
