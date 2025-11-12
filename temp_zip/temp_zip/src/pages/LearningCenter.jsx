// src/pages/LearningCenter.jsx - Unified Learning System with Real Content
import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  IconButton,
  Tabs,
  Tab,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  CircularProgress,
  Avatar,
  AvatarGroup,
  Badge,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Rating,
  Tooltip,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Collapse,
  Skeleton
} from '@mui/material';
import {
  BookOpen,
  PlayCircle,
  CheckCircle,
  Clock,
  Award,
  TrendingUp,
  Users,
  Star,
  Download,
  Search,
  Calendar,
  Video,
  FileText,
  Zap,
  Trophy,
  Flame,
  Lock,
  ChevronRight,
  ChevronDown,
  BarChart3,
  Target,
  Shield,
  Brain,
  Globe,
  MessageSquare,
  Bell,
  Settings,
  Share2,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Volume2,
  Pause,
  Play,
  SkipForward,
  SkipBack,
  X,
  Info,
  Coffee,
  GraduationCap,
  Lightbulb,
  Medal,
  Gift,
  Heart,
  ThumbsUp,
  Flag,
  Timer,
  Layers,
  Edit3,
  CheckSquare,
  Square,
  Circle,
  HelpCircle,
  AlertCircle,
  ChevronsRight,
  Headphones,
  Monitor,
  Smartphone,
  Repeat,
  RefreshCw
} from 'lucide-react';
import { 
  collection, 
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { format, differenceInDays, addDays } from 'date-fns';
import YouTube from 'react-youtube';

const LearningCenter = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Course & Progress States
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [bookmarkedCourses, setBookmarkedCourses] = useState([]);
  
  // User Progress & Gamification
  const [userProgress, setUserProgress] = useState({
    level: 1,
    xp: 0,
    nextLevelXp: 100,
    streak: 0,
    longestStreak: 0,
    totalHours: 0,
    completedCourses: 0,
    completedLessons: 0,
    certificates: [],
    badges: [],
    points: 0,
    rank: 'Beginner',
    lastActivityDate: null
  });

  // Community States
  const [discussions, setDiscussions] = useState([]);
  const [studyGroups, setStudyGroups] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  // Real Course Content with Actual Lessons
  const realCourses = [
    {
      id: 'credit-repair-fundamentals',
      title: 'Credit Repair Fundamentals',
      description: 'Complete foundation course covering all aspects of credit repair from basics to client management',
      category: 'Credit Repair',
      level: 'Beginner',
      duration: '8 hours',
      instructor: 'Sarah Johnson, CRC',
      rating: 4.9,
      students: 3456,
      price: 'Free',
      featured: true,
      thumbnail: '🎓',
      certificateAvailable: true,
      xpReward: 500,
      modules: [
        {
          id: 'crf-m1',
          title: 'Introduction to Credit Systems',
          description: 'Understanding how credit works in America',
          lessons: [
            {
              id: 'crf-m1-l1',
              title: 'What is Credit and Why It Matters',
              type: 'video',
              duration: '15 min',
              videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Replace with real video
              content: `Credit is a financial tool that allows you to borrow money or access goods/services with the understanding that you'll pay later. Your credit score, ranging from 300-850, determines your creditworthiness.

Key Points:
- Credit scores affect loan approvals, interest rates, insurance premiums, and even job opportunities
- 35% of Americans have scores below 620 (subprime)
- The average American has $6,194 in credit card debt
- Good credit can save you hundreds of thousands over your lifetime

Understanding the Credit Scoring Models:
1. FICO Score (most common) - Used by 90% of lenders
2. VantageScore - Growing alternative model
3. Industry-specific scores (auto, mortgage, credit card)

Your credit report contains:
- Personal information
- Account history
- Credit inquiries
- Public records
- Collections`,
              quiz: {
                questions: [
                  {
                    question: 'What is the credit score range?',
                    options: ['0-100', '300-850', '400-900', '500-1000'],
                    correct: 1
                  },
                  {
                    question: 'What percentage of your score is payment history?',
                    options: ['15%', '25%', '35%', '45%'],
                    correct: 2
                  }
                ]
              },
              resources: [
                { name: 'Credit Score Factors PDF', type: 'pdf', url: '#' },
                { name: 'FICO vs VantageScore Comparison', type: 'article', url: '#' }
              ],
              xpReward: 20
            },
            {
              id: 'crf-m1-l2',
              title: 'The Three Credit Bureaus',
              type: 'video',
              duration: '20 min',
              videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
              content: `The three major credit bureaus (Credit Reporting Agencies) are Equifax, Experian, and TransUnion. Each maintains independent records and may have different information.

Equifax:
- Founded: 1899
- Headquarters: Atlanta, GA
- Covers: 220+ million consumers
- Special: Work Number employment verification

Experian:
- Founded: 1996 (merger)
- Headquarters: Dublin, Ireland
- Largest globally
- Special: Boost feature for utility payments

TransUnion:
- Founded: 1968
- Headquarters: Chicago, IL
- International presence
- Special: TrueIdentity free monitoring

Why scores differ between bureaus:
- Not all creditors report to all bureaus
- Different scoring models used
- Timing of updates varies
- Different data sources

Your rights with bureaus:
- Free annual credit report from each
- Right to dispute inaccurate information
- Right to add consumer statements
- Security freeze options`,
              quiz: {
                questions: [
                  {
                    question: 'How many major credit bureaus are there?',
                    options: ['2', '3', '4', '5'],
                    correct: 1
                  },
                  {
                    question: 'Which bureau offers the Boost feature?',
                    options: ['Equifax', 'Experian', 'TransUnion', 'All of them'],
                    correct: 1
                  }
                ]
              },
              xpReward: 20
            },
            {
              id: 'crf-m1-l3',
              title: 'Credit Score Factors Deep Dive',
              type: 'interactive',
              duration: '25 min',
              content: `The Five Factors of Your Credit Score:

1. Payment History (35%)
   - Most important factor
   - Includes all accounts: credit cards, loans, mortgages
   - Late payments stay for 7 years
   - Severity matters: 30, 60, 90+ days late
   
2. Credit Utilization (30%)
   - Ratio of balances to credit limits
   - Keep under 30% (ideally under 10%)
   - Calculated per card AND overall
   - Updates monthly with statements
   
3. Length of Credit History (15%)
   - Average age of accounts
   - Age of oldest account
   - Never close oldest cards
   - Authorized user accounts can help
   
4. Credit Mix (10%)
   - Variety of account types
   - Revolving (cards) vs Installment (loans)
   - Shows ability to manage different credit
   
5. New Credit (10%)
   - Hard inquiries (last 2 years, impact for 1 year)
   - New accounts opened
   - Rate shopping window: 14-45 days
   - Soft inquiries don't affect score`,
              exercises: [
                {
                  title: 'Calculate Utilization',
                  description: 'If you have a $5,000 limit and $1,500 balance, what is your utilization?',
                  type: 'calculation'
                }
              ],
              xpReward: 25
            }
          ]
        },
        {
          id: 'crf-m2',
          title: 'Reading and Analyzing Credit Reports',
          description: 'Master the skill of credit report analysis',
          lessons: [
            {
              id: 'crf-m2-l1',
              title: 'Obtaining Credit Reports',
              type: 'video',
              duration: '18 min',
              content: `Methods to Obtain Credit Reports:

1. AnnualCreditReport.com (Official)
   - Free weekly reports (extended from annual due to COVID)
   - All three bureaus available
   - No credit scores included
   
2. Credit Monitoring Services
   - Credit Karma (TransUnion, Equifax - VantageScore)
   - Experian.com (FICO 8)
   - myFICO.com (All FICO versions)
   
3. Through Creditors
   - Many cards offer free FICO scores
   - Discover provides free FICO to everyone
   
4. For Clients
   - IdentityIQ (tri-merge reports)
   - SmartCredit
   - PrivacyGuard
   
Best Practices:
- Check all three bureaus
- Look for discrepancies
- Download PDF copies
- Review every 4 months (rotate bureaus)`,
              xpReward: 20
            },
            {
              id: 'crf-m2-l2', 
              title: 'Identifying Errors and Negative Items',
              type: 'interactive',
              duration: '30 min',
              content: `Common Credit Report Errors:

Identity Errors:
- Wrong name variations
- Incorrect SSN
- Mixed files (similar names/SSNs)
- Wrong addresses

Account Errors:
- Accounts that aren't yours
- Closed accounts showing open
- Duplicate accounts
- Incorrect balances/limits
- Wrong payment history

Red Flags to Look For:
- Inquiries you didn't authorize
- Unknown accounts (identity theft)
- Incorrect late payments
- Re-aged old debts
- Paid accounts showing unpaid

Negative Items Priority:
1. Recent late payments (highest impact)
2. Collections (even if paid)
3. Charge-offs
4. Public records (bankruptcies, judgments)
5. High utilization

Documentation Needed:
- Payment records
- Cancellation confirmations  
- Court documents
- Identity verification`,
              exercises: [
                {
                  title: 'Spot the Errors',
                  description: 'Review this sample credit report and identify all errors',
                  type: 'analysis'
                }
              ],
              xpReward: 30
            }
          ]
        },
        {
          id: 'crf-m3',
          title: 'Dispute Letter Writing Mastery',
          description: 'Learn to write effective dispute letters',
          lessons: [
            {
              id: 'crf-m3-l1',
              title: 'FCRA and Your Rights',
              type: 'video',
              duration: '22 min',
              content: `Fair Credit Reporting Act (FCRA) Key Provisions:

Section 609:
- Right to request all information in your file
- Includes sources of information
- Not technically a "dispute" method

Section 611:
- Right to dispute inaccurate information
- 30-day investigation requirement
- Bureaus must forward to furnisher

Section 623:
- Furnisher responsibilities
- Must investigate disputes
- Cannot report info they know is inaccurate

Consumer Rights:
- Free credit reports
- Dispute inaccurate information
- Sue for damages
- Opt-out of prescreened offers
- Security freezes

Time Limits:
- Most negative info: 7 years
- Bankruptcies: 7-10 years
- Unpaid tax liens: indefinite
- Positive info: indefinite`,
              xpReward: 25
            },
            {
              id: 'crf-m3-l2',
              title: 'Writing Your First Dispute Letter',
              type: 'interactive',
              duration: '35 min',
              content: `Effective Dispute Letter Structure:

1. Header
   - Your full name
   - Current address
   - SSN (last 4 digits)
   - Date of birth
   - Date of letter

2. Bureau Address
   - Use certified mail address
   - Include confirmation number

3. Opening
   - Clear statement of dispute
   - Reference FCRA Section 611

4. Body
   - List each item separately
   - Provide specific reasons
   - Include account numbers
   - Reference attached proof

5. Closing
   - Request deletion/correction
   - 30-day timeline reminder
   - Method of response preference

Templates:
- Initial Dispute
- Follow-up Dispute  
- Debt Validation
- Goodwill Letter
- Pay for Delete

Never admit debt ownership!`,
              templates: [
                {
                  name: 'Basic Dispute Template',
                  content: 'Full template text here...'
                }
              ],
              xpReward: 35
            }
          ]
        },
        {
          id: 'crf-m4',
          title: 'Client Communication and Management',
          description: 'Build strong client relationships',
          lessons: [
            {
              id: 'crf-m4-l1',
              title: 'Setting Realistic Expectations',
              type: 'video',
              duration: '20 min',
              content: `Managing Client Expectations:

Realistic Timelines:
- First results: 30-45 days
- Significant improvement: 3-6 months
- Major changes: 6-12 months
- Complete rebuild: 12-24 months

What to Promise:
✓ Thorough analysis
✓ Legal dispute process
✓ Regular updates
✓ Education and guidance

What NOT to Promise:
✗ Specific point increases
✗ Guaranteed deletions
✗ Overnight results
✗ Removal of accurate info

Communication Schedule:
Week 1: Welcome package
Week 2: Initial analysis
Week 4: First round disputes
Week 6: Update call
Monthly: Progress reports

Setting Boundaries:
- Response time expectations
- Office hours
- Emergency vs non-emergency
- Preferred contact methods`,
              xpReward: 25
            }
          ]
        },
        {
          id: 'crf-m5',
          title: 'Advanced Dispute Strategies',
          description: 'Complex tactics for difficult cases',
          lessons: [
            {
              id: 'crf-m5-l1',
              title: 'Metro 2 Compliance Method',
              type: 'video',
              duration: '28 min',
              content: `Metro 2 Format Compliance:

What is Metro 2?
- Industry standard for credit reporting
- Specific format requirements
- Character limits and codes
- Monthly reporting cycle

Common Metro 2 Violations:
- Invalid status codes
- Incorrect date fields
- Missing required fields
- Contradictory information

How to Identify:
- Look for impossible combinations
- Check date consistency
- Verify account types match
- Cross-reference with statements

Dispute Strategy:
1. Point out specific violations
2. Reference Metro 2 guidelines
3. Request compliance audit
4. Demand correction or deletion

Success Rate: 70-80% for valid violations`,
              xpReward: 30
            },
            {
              id: 'crf-m5-l2',
              title: 'Direct Creditor Disputes',
              type: 'interactive',
              duration: '25 min',
              content: `Disputing Directly with Creditors:

When to Use:
- After bureau disputes fail
- For goodwill requests
- Payment history corrections
- Account detail updates

Process:
1. Find correct department
2. Document everything
3. Get agreements in writing
4. Follow up consistently

Effective Departments:
- Executive Office
- Retention Department
- Credit Bureau Dispute Dept
- Office of the President

Letters that Work:
- Goodwill adjustment
- Pay for delete
- Validation request
- Cease and desist

Follow-up Timeline:
Day 1: Send letter
Day 15: First follow-up
Day 30: Second follow-up
Day 45: Escalate`,
              xpReward: 30
            }
          ]
        },
        {
          id: 'crf-m6',
          title: 'Business Credit Basics',
          description: 'Introduction to business credit building',
          lessons: [
            {
              id: 'crf-m6-l1',
              title: 'Business Credit vs Personal Credit',
              type: 'video',
              duration: '20 min',
              content: `Business Credit Fundamentals:

Key Differences:
- Separate from personal credit
- Based on EIN not SSN
- Different scoring models
- Different bureaus (D&B, Experian Business, Equifax Business)

Benefits:
- Higher credit limits
- No personal liability (usually)
- Build business value
- Better terms with vendors

Requirements:
- Legal business entity
- EIN from IRS
- Business bank account
- Business address (not home)
- Business phone number

Timeline:
Month 1: Entity setup
Month 2: Vendor accounts
Month 3: First reporting
Month 6: Business credit cards
Month 12: Bank lines of credit`,
              xpReward: 25
            }
          ]
        },
        {
          id: 'crf-m7',
          title: 'Legal and Compliance',
          description: 'Stay compliant with regulations',
          lessons: [
            {
              id: 'crf-m7-l1',
              title: 'CROA Compliance',
              type: 'video',
              duration: '30 min',
              content: `Credit Repair Organizations Act:

Requirements:
- Written contracts required
- 3-day cancellation right
- No upfront payment
- Specific disclosures
- Cannot make false claims

Prohibited Practices:
- Charging before services
- Advising illegal actions
- Creating new identity
- False/misleading statements
- Removing accurate info claims

Required Disclosures:
- Consumer rights notice
- Full service description
- Total cost
- Timeline estimates
- Cancellation rights

Penalties:
- Civil liability
- Criminal penalties
- State AG enforcement
- FTC enforcement
- Private lawsuits`,
              xpReward: 30
            }
          ]
        },
        {
          id: 'crf-m8',
          title: 'Final Assessment and Certification',
          description: 'Test your knowledge and earn your certificate',
          lessons: [
            {
              id: 'crf-m8-l1',
              title: 'Comprehensive Review',
              type: 'review',
              duration: '45 min',
              content: 'Review of all key concepts covered in the course',
              xpReward: 40
            },
            {
              id: 'crf-m8-l2',
              title: 'Final Examination',
              type: 'exam',
              duration: '60 min',
              content: '50 question comprehensive exam covering all modules',
              passingScore: 80,
              xpReward: 100
            }
          ]
        }
      ]
    },
    {
      id: 'advanced-dispute-strategies',
      title: 'Advanced Dispute Strategies',
      description: 'Master complex dispute tactics and legal strategies for challenging cases',
      category: 'Credit Repair',
      level: 'Advanced',
      duration: '6 hours',
      instructor: 'Michael Chen, Attorney',
      rating: 4.8,
      students: 1842,
      price: 'Premium',
      featured: true,
      thumbnail: '⚖️',
      certificateAvailable: true,
      xpReward: 600,
      prerequisites: ['credit-repair-fundamentals'],
      modules: [
        {
          id: 'ads-m1',
          title: 'Complex Legal Strategies',
          description: 'Advanced legal tactics within FCRA',
          lessons: [
            {
              id: 'ads-m1-l1',
              title: 'Section 609 vs 611 Deep Dive',
              type: 'video',
              duration: '35 min',
              content: 'Detailed legal analysis of FCRA sections',
              xpReward: 35
            }
          ]
        }
      ]
    },
    {
      id: 'business-credit-mastery',
      title: 'Business Credit Building Mastery',
      description: 'Complete guide to establishing and building strong business credit',
      category: 'Business Credit',
      level: 'Intermediate',
      duration: '7 hours', 
      instructor: 'David Martinez, MBA',
      rating: 4.7,
      students: 2156,
      price: 'Premium',
      featured: false,
      thumbnail: '🏢',
      certificateAvailable: true,
      xpReward: 550,
      modules: [
        {
          id: 'bcm-m1',
          title: 'Business Entity Setup',
          description: 'Proper business structure for credit',
          lessons: [
            {
              id: 'bcm-m1-l1',
              title: 'Choosing the Right Entity Type',
              type: 'video',
              duration: '25 min',
              content: 'LLC vs Corp vs Sole Prop for credit building',
              xpReward: 25
            }
          ]
        }
      ]
    },
    {
      id: 'sales-mastery',
      title: 'Sales Mastery for Credit Repair',
      description: 'Convert leads and close deals in the credit repair industry',
      category: 'Sales & Marketing',
      level: 'Beginner',
      duration: '5 hours',
      instructor: 'Amanda Foster',
      rating: 4.6,
      students: 2847,
      price: 'Free',
      featured: false,
      thumbnail: '💼',
      certificateAvailable: true,
      xpReward: 400,
      modules: [
        {
          id: 'sm-m1',
          title: 'Lead Generation',
          description: 'Finding and qualifying prospects',
          lessons: [
            {
              id: 'sm-m1-l1',
              title: 'Digital Marketing for Credit Repair',
              type: 'video',
              duration: '30 min',
              content: 'Facebook, Google Ads, and SEO strategies',
              xpReward: 25
            }
          ]
        }
      ]
    },
    {
      id: 'fcra-compliance',
      title: 'FCRA & CROA Compliance Mastery',
      description: 'Navigate federal regulations and maintain full compliance',
      category: 'Legal & Compliance',
      level: 'Intermediate',
      duration: '4 hours',
      instructor: 'Jennifer Roberts, JD',
      rating: 4.9,
      students: 1523,
      price: 'Premium',
      featured: false,
      thumbnail: '⚖️',
      certificateAvailable: true,
      xpReward: 450,
      modules: [
        {
          id: 'fc-m1',
          title: 'FCRA Deep Dive',
          description: 'Complete FCRA understanding',
          lessons: [
            {
              id: 'fc-m1-l1',
              title: 'FCRA History and Purpose',
              type: 'video',
              duration: '20 min',
              content: 'Why FCRA exists and its evolution',
              xpReward: 20
            }
          ]
        }
      ]
    }
  ];

  // Live webinars
  const webinars = [
    {
      id: 'w1',
      title: 'Q1 2025 Credit Industry Updates',
      presenter: 'Industry Expert Panel',
      date: new Date('2025-01-15'),
      duration: '90 min',
      attendees: 234,
      status: 'upcoming',
      description: 'Latest changes in credit reporting and dispute strategies'
    },
    {
      id: 'w2',
      title: 'Metro 2 Compliance Workshop',
      presenter: 'Michael Chen',
      date: new Date('2025-01-20'),
      duration: '120 min',
      attendees: 156,
      status: 'upcoming',
      description: 'Hands-on workshop for identifying Metro 2 violations'
    }
  ];

  // Resources
  const resources = [
    {
      id: 'r1',
      title: 'Dispute Letter Templates Pack',
      type: 'ZIP',
      category: 'Templates',
      size: '2.5 MB',
      downloads: 3456,
      description: '20+ proven dispute letter templates'
    },
    {
      id: 'r2',
      title: 'FCRA Quick Reference Guide 2025',
      type: 'PDF',
      category: 'Legal',
      size: '1.8 MB',
      downloads: 2891,
      description: 'Complete FCRA sections with annotations'
    },
    {
      id: 'r3',
      title: 'Credit Analysis Spreadsheet',
      type: 'XLSX',
      category: 'Tools',
      size: '850 KB',
      downloads: 4123,
      description: 'Automated credit report analysis tool'
    }
  ];

  // Achievement definitions
  const achievements = [
    { id: 'first-lesson', name: 'First Steps', description: 'Complete your first lesson', icon: <Play />, xp: 10 },
    { id: 'first-course', name: 'Course Complete', description: 'Finish your first course', icon: <CheckCircle />, xp: 50 },
    { id: 'week-streak', name: 'Week Warrior', description: '7 day learning streak', icon: <Flame />, xp: 25 },
    { id: 'month-streak', name: 'Dedicated Learner', description: '30 day learning streak', icon: <Trophy />, xp: 100 },
    { id: 'quiz-master', name: 'Quiz Master', description: 'Score 100% on 5 quizzes', icon: <Brain />, xp: 30 },
    { id: 'helper', name: 'Community Helper', description: 'Answer 10 questions', icon: <Users />, xp: 40 },
    { id: 'speed-learner', name: 'Speed Learner', description: 'Complete 5 lessons in one day', icon: <Zap />, xp: 35 },
    { id: 'night-owl', name: 'Night Owl', description: 'Study after midnight', icon: <Clock />, xp: 15 }
  ];

  // Initialize user data
  useEffect(() => {
    if (currentUser) {
      loadUserProgress();
      loadEnrollments();
      loadCourses();
      loadCommunityData();
      checkAndUpdateStreak();
    }
  }, [currentUser]);

  // Load user progress from Firebase
  const loadUserProgress = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'userProgress', currentUser.uid));
      if (userDoc.exists()) {
        setUserProgress(userDoc.data());
      } else {
        // Create initial progress document
        const initialProgress = {
          level: 1,
          xp: 0,
          nextLevelXp: 100,
          streak: 0,
          longestStreak: 0,
          totalHours: 0,
          completedCourses: 0,
          completedLessons: 0,
          certificates: [],
          badges: [],
          points: 0,
          rank: 'Beginner',
          lastActivityDate: null,
          createdAt: serverTimestamp()
        };
        await setDoc(doc(db, 'userProgress', currentUser.uid), initialProgress);
        setUserProgress(initialProgress);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  // Load user enrollments
  const loadEnrollments = async () => {
    try {
      const q = query(
        collection(db, 'courseEnrollments'),
        where('userId', '==', currentUser.uid)
      );
      
      const snapshot = await getDocs(q);
      const enrollmentsData = [];
      snapshot.forEach(doc => {
        enrollmentsData.push({ id: doc.id, ...doc.data() });
      });
      
      setEnrollments(enrollmentsData);
    } catch (error) {
      console.error('Error loading enrollments:', error);
    }
  };

  // Load courses (from local data for now, could be Firebase)
  const loadCourses = () => {
    setCourses(realCourses);
  };

  // Load community data
  const loadCommunityData = async () => {
    try {
      // Load discussions
      const discussionsQuery = query(
        collection(db, 'discussions'),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      
      onSnapshot(discussionsQuery, (snapshot) => {
        const discussionsData = [];
        snapshot.forEach(doc => {
          discussionsData.push({ id: doc.id, ...doc.data() });
        });
        setDiscussions(discussionsData);
      });

      // Load leaderboard
      const leaderboardQuery = query(
        collection(db, 'userProgress'),
        orderBy('xp', 'desc'),
        limit(10)
      );
      
      const leaderboardSnapshot = await getDocs(leaderboardQuery);
      const leaderboardData = [];
      leaderboardSnapshot.forEach(doc => {
        leaderboardData.push({ id: doc.id, ...doc.data() });
      });
      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Error loading community data:', error);
    }
  };

  // Check and update learning streak
  const checkAndUpdateStreak = async () => {
    const today = new Date().toDateString();
    const lastActivity = userProgress.lastActivityDate ? new Date(userProgress.lastActivityDate).toDateString() : null;
    
    if (lastActivity !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toDateString();
      
      let newStreak = userProgress.streak;
      
      if (lastActivity === yesterdayString) {
        // Continue streak
        newStreak = userProgress.streak + 1;
      } else if (lastActivity !== today) {
        // Break streak
        newStreak = 1;
      }
      
      const longestStreak = Math.max(newStreak, userProgress.longestStreak);
      
      await updateDoc(doc(db, 'userProgress', currentUser.uid), {
        streak: newStreak,
        longestStreak,
        lastActivityDate: today
      });
      
      setUserProgress(prev => ({
        ...prev,
        streak: newStreak,
        longestStreak,
        lastActivityDate: today
      }));
    }
  };

  // Enroll in course
  const handleEnrollCourse = async (courseId) => {
    try {
      setLoading(true);
      
      // Check if already enrolled
      const existingEnrollment = enrollments.find(e => e.courseId === courseId);
      if (existingEnrollment) {
        alert('You are already enrolled in this course');
        return;
      }
      
      // Create enrollment
      const enrollmentData = {
        userId: currentUser.uid,
        courseId,
        enrolledAt: serverTimestamp(),
        progress: 0,
        completedLessons: [],
        lastAccessedAt: serverTimestamp(),
        status: 'active'
      };
      
      const docRef = await addDoc(collection(db, 'courseEnrollments'), enrollmentData);
      
      // Update local state
      setEnrollments(prev => [...prev, { id: docRef.id, ...enrollmentData }]);
      
      // Award XP for enrollment
      await awardXP(10, 'Course enrollment');
      
      alert('Successfully enrolled in course!');
      setCourseDialogOpen(false);
    } catch (error) {
      console.error('Error enrolling in course:', error);
      alert('Error enrolling in course');
    } finally {
      setLoading(false);
    }
  };

  // Complete lesson
  const handleCompleteLesson = async (courseId, moduleId, lessonId) => {
    try {
      const enrollment = enrollments.find(e => e.courseId === courseId);
      if (!enrollment) return;
      
      const completedLessons = enrollment.completedLessons || [];
      
      if (completedLessons.includes(lessonId)) {
        alert('Lesson already completed');
        return;
      }
      
      // Update enrollment
      const updatedCompletedLessons = [...completedLessons, lessonId];
      const course = courses.find(c => c.id === courseId);
      const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
      const progress = Math.round((updatedCompletedLessons.length / totalLessons) * 100);
      
      await updateDoc(doc(db, 'courseEnrollments', enrollment.id), {
        completedLessons: updatedCompletedLessons,
        progress,
        lastAccessedAt: serverTimestamp()
      });
      
      // Update user progress
      await updateDoc(doc(db, 'userProgress', currentUser.uid), {
        completedLessons: increment(1),
        totalHours: increment(0.5) // Estimate 30 min per lesson
      });
      
      // Award XP for the lesson
      const lesson = course.modules
        .find(m => m.id === moduleId)
        ?.lessons.find(l => l.id === lessonId);
      
      if (lesson?.xpReward) {
        await awardXP(lesson.xpReward, `Completed lesson: ${lesson.title}`);
      }
      
      // Check for course completion
      if (progress === 100) {
        await handleCourseCompletion(courseId);
      }
      
      // Update local state
      setEnrollments(prev => prev.map(e => 
        e.id === enrollment.id 
          ? { ...e, completedLessons: updatedCompletedLessons, progress }
          : e
      ));
      
      alert('Lesson completed! Great work!');
      setLessonDialogOpen(false);
    } catch (error) {
      console.error('Error completing lesson:', error);
    }
  };

  // Handle course completion
  const handleCourseCompletion = async (courseId) => {
    try {
      const course = courses.find(c => c.id === courseId);
      
      // Update user progress
      await updateDoc(doc(db, 'userProgress', currentUser.uid), {
        completedCourses: increment(1),
        certificates: [...userProgress.certificates, {
          courseId,
          courseName: course.title,
          earnedAt: new Date().toISOString(),
          certificateId: `CERT-${Date.now()}`
        }]
      });
      
      // Award bonus XP
      await awardXP(course.xpReward, `Completed course: ${course.title}`);
      
      // Check achievements
      await checkAchievements('course-complete');
      
      alert(`Congratulations! You've completed ${course.title} and earned a certificate!`);
    } catch (error) {
      console.error('Error handling course completion:', error);
    }
  };

  // Award XP and check for level up
  const awardXP = async (amount, reason) => {
    try {
      const newXP = userProgress.xp + amount;
      let newLevel = userProgress.level;
      let nextLevelXp = userProgress.nextLevelXp;
      
      // Check for level up
      while (newXP >= nextLevelXp) {
        newLevel++;
        nextLevelXp = newLevel * 100; // Simple progression
      }
      
      await updateDoc(doc(db, 'userProgress', currentUser.uid), {
        xp: newXP,
        level: newLevel,
        nextLevelXp,
        points: increment(amount)
      });
      
      setUserProgress(prev => ({
        ...prev,
        xp: newXP,
        level: newLevel,
        nextLevelXp,
        points: prev.points + amount
      }));
      
      // Log XP gain
      await addDoc(collection(db, 'xpLog'), {
        userId: currentUser.uid,
        amount,
        reason,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error awarding XP:', error);
    }
  };

  // Check achievements
  const checkAchievements = async (trigger) => {
    // Implementation for checking and awarding achievements
    // This would check various conditions and award badges
  };

  // Toggle bookmark
  const toggleBookmark = async (courseId) => {
    if (bookmarkedCourses.includes(courseId)) {
      setBookmarkedCourses(prev => prev.filter(id => id !== courseId));
    } else {
      setBookmarkedCourses(prev => [...prev, courseId]);
    }
  };

  // Filtered courses
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [courses, selectedCategory, searchQuery]);

  // Get enrollment for course
  const getEnrollmentForCourse = (courseId) => {
    return enrollments.find(e => e.courseId === courseId);
  };

  // Calculate overall progress
  const calculateOverallProgress = () => {
    if (enrollments.length === 0) return 0;
    const totalProgress = enrollments.reduce((sum, e) => sum + (e.progress || 0), 0);
    return Math.round(totalProgress / enrollments.length);
  };

  // Get level progress percentage
  const getLevelProgress = () => {
    return Math.round((userProgress.xp / userProgress.nextLevelXp) * 100);
  };

  // Format time ago
  const formatTimeAgo = (date) => {
    if (!date) return 'Never';
    const days = differenceInDays(new Date(), new Date(date));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Header with Gamification */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 4,
          px: 3
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                sx={{
                  width: 60,
                  height: 60,
                  bgcolor: 'white',
                  color: 'primary.main'
                }}
              >
                <GraduationCap size={30} />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  Learning Center
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Master credit repair and grow your business
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 3 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Flame size={20} />
                  <Typography variant="h5" fontWeight="bold">
                    {userProgress.streak}
                  </Typography>
                </Box>
                <Typography variant="caption">Day Streak</Typography>
              </Box>
              
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Trophy size={20} />
                  <Typography variant="h5" fontWeight="bold">
                    {userProgress.level}
                  </Typography>
                </Box>
                <Typography variant="caption">Level</Typography>
              </Box>
              
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Star size={20} />
                  <Typography variant="h5" fontWeight="bold">
                    {userProgress.xp}
                  </Typography>
                </Box>
                <Typography variant="caption">XP Points</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* XP Progress Bar */}
        <Box sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">
              Level {userProgress.level} Progress
            </Typography>
            <Typography variant="body2">
              {userProgress.xp} / {userProgress.nextLevelXp} XP
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={getLevelProgress()}
            sx={{
              height: 10,
              borderRadius: 5,
              bgcolor: 'rgba(255,255,255,0.2)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 5,
                background: 'linear-gradient(90deg, #FFD700 0%, #FFA500 100%)'
              }
            }}
          />
        </Box>

        {/* Quick Stats */}
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {[
            { icon: <BookOpen />, value: userProgress.completedCourses, label: 'Courses Completed' },
            { icon: <CheckCircle />, value: userProgress.completedLessons, label: 'Lessons Done' },
            { icon: <Clock />, value: `${Math.round(userProgress.totalHours)}h`, label: 'Time Learned' },
            { icon: <Award />, value: userProgress.certificates.length, label: 'Certificates' },
            { icon: <Medal />, value: userProgress.badges.length, label: 'Badges' },
            { icon: <Users />, value: userProgress.rank, label: 'Rank' }
          ].map((stat, index) => (
            <Grid item xs={6} sm={4} md={2} key={index}>
              <Paper
                sx={{
                  p: 2,
                  bgcolor: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  textAlign: 'center'
                }}
              >
                <Box sx={{ color: 'white', mb: 1 }}>{stat.icon}</Box>
                <Typography variant="h6" fontWeight="bold">
                  {stat.value}
                </Typography>
                <Typography variant="caption">{stat.label}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Main Content */}
      <Box sx={{ p: 3 }}>
        {/* Navigation Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(e, v) => setActiveTab(v)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Dashboard" icon={<BarChart3 size={18} />} iconPosition="start" value="dashboard" />
            <Tab label="Courses" icon={<BookOpen size={18} />} iconPosition="start" value="courses" />
            <Tab label="My Learning" icon={<Target size={18} />} iconPosition="start" value="my-learning" />
            <Tab label="Live Events" icon={<Video size={18} />} iconPosition="start" value="events" />
            <Tab label="Community" icon={<Users size={18} />} iconPosition="start" value="community" />
            <Tab label="Resources" icon={<Download size={18} />} iconPosition="start" value="resources" />
            <Tab label="Certificates" icon={<Award size={18} />} iconPosition="start" value="certificates" />
            <Tab label="Achievements" icon={<Trophy size={18} />} iconPosition="start" value="achievements" />
          </Tabs>
        </Paper>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <Grid container spacing={3}>
            {/* Continue Learning */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Continue Learning
                </Typography>
                <Grid container spacing={2}>
                  {enrollments.slice(0, 3).map(enrollment => {
                    const course = courses.find(c => c.id === enrollment.courseId);
                    if (!course) return null;
                    
                    return (
                      <Grid item xs={12} md={4} key={enrollment.id}>
                        <Card>
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                              <Typography variant="h4">{course.thumbnail}</Typography>
                              <Chip 
                                label={`${enrollment.progress || 0}%`}
                                color={enrollment.progress >= 100 ? 'success' : 'primary'}
                                size="small"
                              />
                            </Box>
                            <Typography variant="h6" gutterBottom>
                              {course.title}
                            </Typography>
                            <LinearProgress 
                              variant="determinate" 
                              value={enrollment.progress || 0}
                              sx={{ mb: 2, height: 8, borderRadius: 4 }}
                            />
                            <Button
                              fullWidth
                              variant="contained"
                              onClick={() => {
                                setSelectedCourse(course);
                                setCourseDialogOpen(true);
                              }}
                            >
                              Continue Learning
                            </Button>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </Paper>
            </Grid>

            {/* Recommended Courses */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Recommended for You
                </Typography>
                <Grid container spacing={2}>
                  {courses.filter(c => !enrollments.find(e => e.courseId === c.id))
                    .slice(0, 3)
                    .map(course => (
                      <Grid item xs={12} md={4} key={course.id}>
                        <Card>
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                              <Typography variant="h4">{course.thumbnail}</Typography>
                              {course.featured && (
                                <Chip label="Featured" color="warning" size="small" icon={<Star size={14} />} />
                              )}
                            </Box>
                            <Typography variant="h6" gutterBottom>
                              {course.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {course.description.substring(0, 100)}...
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                              <Chip label={course.level} size="small" />
                              <Chip label={course.duration} size="small" variant="outlined" />
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Star size={16} color="#FFA500" />
                                <Typography variant="body2">{course.rating}</Typography>
                              </Box>
                              <Typography variant="body2" color="text.secondary">
                                {course.students.toLocaleString()} students
                              </Typography>
                            </Box>
                            <Button
                              fullWidth
                              variant="outlined"
                              onClick={() => {
                                setSelectedCourse(course);
                                setCourseDialogOpen(true);
                              }}
                            >
                              View Course
                            </Button>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                </Grid>
              </Paper>
            </Grid>

            {/* Learning Activity */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  This Week's Activity
                </Typography>
                <Grid container spacing={1}>
                  {[...Array(7)].map((_, index) => {
                    const date = new Date();
                    date.setDate(date.getDate() - (6 - index));
                    const dayName = format(date, 'EEE');
                    const isActive = index <= 4; // Mock data
                    
                    return (
                      <Grid item key={index}>
                        <Box
                          sx={{
                            width: 60,
                            height: 80,
                            bgcolor: isActive ? 'success.main' : 'grey.200',
                            borderRadius: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: isActive ? 'white' : 'text.secondary'
                          }}
                        >
                          {isActive && <CheckCircle size={20} />}
                          <Typography variant="caption">{dayName}</Typography>
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              </Paper>
            </Grid>

            {/* Leaderboard */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Top Learners This Week
                </Typography>
                <List>
                  {leaderboard.slice(0, 5).map((user, index) => (
                    <ListItem key={user.id}>
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? '#CD7F32' : 'grey.400' }}>
                          {index + 1}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText 
                        primary={user.displayName || 'Anonymous'}
                        secondary={`${user.xp} XP • Level ${user.level}`}
                      />
                      {index === 0 && <Trophy color="#FFD700" />}
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <Box>
            {/* Search and Filters */}
            <Paper sx={{ p: 2, mb: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    placeholder="Search courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: <Search size={18} style={{ marginRight: 8 }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Stack direction="row" spacing={1}>
                    <Chip
                      label="All"
                      onClick={() => setSelectedCategory('all')}
                      color={selectedCategory === 'all' ? 'primary' : 'default'}
                    />
                    <Chip
                      label="Credit Repair"
                      onClick={() => setSelectedCategory('Credit Repair')}
                      color={selectedCategory === 'Credit Repair' ? 'primary' : 'default'}
                    />
                    <Chip
                      label="Business Credit"
                      onClick={() => setSelectedCategory('Business Credit')}
                      color={selectedCategory === 'Business Credit' ? 'primary' : 'default'}
                    />
                    <Chip
                      label="Sales & Marketing"
                      onClick={() => setSelectedCategory('Sales & Marketing')}
                      color={selectedCategory === 'Sales & Marketing' ? 'primary' : 'default'}
                    />
                    <Chip
                      label="Legal"
                      onClick={() => setSelectedCategory('Legal & Compliance')}
                      color={selectedCategory === 'Legal & Compliance' ? 'primary' : 'default'}
                    />
                  </Stack>
                </Grid>
              </Grid>
            </Paper>

            {/* Course Grid */}
            <Grid container spacing={3}>
              {filteredCourses.map(course => {
                const enrollment = getEnrollmentForCourse(course.id);
                
                return (
                  <Grid item xs={12} md={6} lg={4} key={course.id}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <Box
                        sx={{
                          height: 150,
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative'
                        }}
                      >
                        <Typography variant="h1">{course.thumbnail}</Typography>
                        {course.featured && (
                          <Chip
                            label="Featured"
                            color="warning"
                            size="small"
                            icon={<Star size={14} />}
                            sx={{ position: 'absolute', top: 10, right: 10 }}
                          />
                        )}
                        {enrollment && (
                          <Box
                            sx={{
                              position: 'absolute',
                              bottom: 10,
                              left: 10,
                              right: 10
                            }}
                          >
                            <LinearProgress 
                              variant="determinate" 
                              value={enrollment.progress || 0}
                              sx={{
                                height: 6,
                                borderRadius: 3,
                                bgcolor: 'rgba(255,255,255,0.3)',
                                '& .MuiLinearProgress-bar': {
                                  bgcolor: 'white'
                                }
                              }}
                            />
                          </Box>
                        )}
                      </Box>
                      
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                          <Chip label={course.level} size="small" />
                          <Chip label={course.category} size="small" variant="outlined" />
                        </Box>
                        
                        <Typography variant="h6" gutterBottom>
                          {course.title}
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {course.description}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Star size={16} color="#FFA500" />
                            <Typography variant="body2">{course.rating}</Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {course.students.toLocaleString()} students
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Clock size={16} />
                            <Typography variant="body2">{course.duration}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Award size={16} />
                            <Typography variant="body2">+{course.xpReward} XP</Typography>
                          </Box>
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary">
                          Instructor: {course.instructor}
                        </Typography>
                      </CardContent>
                      
                      <Box sx={{ p: 2, pt: 0 }}>
                        <Stack direction="row" spacing={1}>
                          <Button
                            fullWidth
                            variant={enrollment ? 'contained' : 'outlined'}
                            onClick={() => {
                              setSelectedCourse(course);
                              setCourseDialogOpen(true);
                            }}
                          >
                            {enrollment ? `Continue (${enrollment.progress}%)` : 'View Course'}
                          </Button>
                          <IconButton onClick={() => toggleBookmark(course.id)}>
                            {bookmarkedCourses.includes(course.id) ? (
                              <BookmarkCheck color="#667eea" />
                            ) : (
                              <Bookmark />
                            )}
                          </IconButton>
                        </Stack>
                      </Box>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        )}

        {/* My Learning Tab */}
        {activeTab === 'my-learning' && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Your Progress Overview
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 3 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <CircularProgress 
                      variant="determinate" 
                      value={calculateOverallProgress()}
                      size={80}
                      thickness={4}
                    />
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Overall Progress
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" color="primary">
                      {enrollments.length}
                    </Typography>
                    <Typography variant="body2">
                      Enrolled Courses
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" color="success.main">
                      {userProgress.completedCourses}
                    </Typography>
                    <Typography variant="body2">
                      Completed
                    </Typography>
                  </Box>
                </Box>
                
                <Divider sx={{ my: 3 }} />
                
                <Typography variant="h6" gutterBottom>
                  Enrolled Courses
                </Typography>
                <List>
                  {enrollments.map(enrollment => {
                    const course = courses.find(c => c.id === enrollment.courseId);
                    if (!course) return null;
                    
                    return (
                      <ListItem key={enrollment.id}>
                        <ListItemIcon>
                          <Typography variant="h4">{course.thumbnail}</Typography>
                        </ListItemIcon>
                        <ListItemText
                          primary={course.title}
                          secondary={
                            <Box>
                              <LinearProgress 
                                variant="determinate" 
                                value={enrollment.progress || 0}
                                sx={{ mb: 1, height: 8, borderRadius: 4 }}
                              />
                              <Typography variant="caption">
                                {enrollment.progress || 0}% complete • Last accessed {formatTimeAgo(enrollment.lastAccessedAt)}
                              </Typography>
                            </Box>
                          }
                        />
                        <Button
                          variant="contained"
                          onClick={() => {
                            setSelectedCourse(course);
                            setCourseDialogOpen(true);
                          }}
                        >
                          Continue
                        </Button>
                      </ListItem>
                    );
                  })}
                </List>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Additional tabs content would go here... */}
        
      </Box>

      {/* Course Detail Dialog */}
      <Dialog
        open={courseDialogOpen}
        onClose={() => setCourseDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedCourse && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="h2">{selectedCourse.thumbnail}</Typography>
                  <Box>
                    <Typography variant="h6">{selectedCourse.title}</Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <Chip label={selectedCourse.level} size="small" />
                      <Chip label={selectedCourse.duration} size="small" variant="outlined" />
                      <Chip label={`+${selectedCourse.xpReward} XP`} size="small" color="success" />
                    </Box>
                  </Box>
                </Box>
                <IconButton onClick={() => setCourseDialogOpen(false)}>
                  <X />
                </IconButton>
              </Box>
            </DialogTitle>
            
            <DialogContent>
              <Typography variant="body1" paragraph>
                {selectedCourse.description}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Star color="#FFA500" />
                  <Typography>{selectedCourse.rating} rating</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Users />
                  <Typography>{selectedCourse.students.toLocaleString()} students</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <GraduationCap />
                  <Typography>{selectedCourse.instructor}</Typography>
                </Box>
              </Box>
              
              <Typography variant="h6" gutterBottom>
                Course Content
              </Typography>
              
              <List>
                {selectedCourse.modules.map((module, moduleIndex) => {
                  const enrollment = getEnrollmentForCourse(selectedCourse.id);
                  
                  return (
                    <Accordion key={module.id}>
                      <AccordionSummary expandIcon={<ChevronDown />}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                          <Avatar sx={{ bgcolor: 'primary.main', width: 30, height: 30 }}>
                            {moduleIndex + 1}
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography>{module.title}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {module.lessons.length} lessons • {module.description}
                            </Typography>
                          </Box>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <List>
                          {module.lessons.map((lesson, lessonIndex) => {
                            const isCompleted = enrollment?.completedLessons?.includes(lesson.id);
                            
                            return (
                              <ListItemButton
                                key={lesson.id}
                                onClick={() => {
                                  setCurrentLesson({ 
                                    ...lesson, 
                                    courseId: selectedCourse.id,
                                    moduleId: module.id 
                                  });
                                  setLessonDialogOpen(true);
                                }}
                              >
                                <ListItemIcon>
                                  {isCompleted ? (
                                    <CheckCircle color="success" />
                                  ) : (
                                    <Circle />
                                  )}
                                </ListItemIcon>
                                <ListItemText
                                  primary={lesson.title}
                                  secondary={`${lesson.type} • ${lesson.duration}`}
                                />
                                {lesson.xpReward && (
                                  <Chip label={`+${lesson.xpReward} XP`} size="small" />
                                )}
                              </ListItemButton>
                            );
                          })}
                        </List>
                      </AccordionDetails>
                    </Accordion>
                  );
                })}
              </List>
            </DialogContent>
            
            <DialogActions>
              {!getEnrollmentForCourse(selectedCourse.id) ? (
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => handleEnrollCourse(selectedCourse.id)}
                  disabled={loading}
                >
                  Enroll in Course
                </Button>
              ) : (
                <Button variant="contained" size="large" disabled>
                  Already Enrolled
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Lesson Dialog */}
      <Dialog
        open={lessonDialogOpen}
        onClose={() => setLessonDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        {currentLesson && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">{currentLesson.title}</Typography>
                <IconButton onClick={() => setLessonDialogOpen(false)}>
                  <X />
                </IconButton>
              </Box>
            </DialogTitle>
            
            <DialogContent>
              <Box sx={{ mb: 2 }}>
                <Chip label={currentLesson.type} size="small" />
                <Chip label={currentLesson.duration} size="small" sx={{ ml: 1 }} />
                {currentLesson.xpReward && (
                  <Chip label={`+${currentLesson.xpReward} XP`} size="small" color="success" sx={{ ml: 1 }} />
                )}
              </Box>
              
              {currentLesson.type === 'video' && currentLesson.videoUrl && (
                <Box sx={{ mb: 3 }}>
                  <YouTube
                    videoId={currentLesson.videoUrl.split('/').pop()}
                    opts={{
                      height: '390',
                      width: '100%',
                      playerVars: {
                        autoplay: 0,
                      },
                    }}
                  />
                </Box>
              )}
              
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 3 }}>
                {currentLesson.content}
              </Typography>
              
              {currentLesson.quiz && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Quick Quiz
                  </Typography>
                  {currentLesson.quiz.questions.map((q, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Typography variant="body2" gutterBottom>
                        {index + 1}. {q.question}
                      </Typography>
                      <Stack direction="column" spacing={1}>
                        {q.options.map((option, optIndex) => (
                          <Button
                            key={optIndex}
                            variant="outlined"
                            size="small"
                            onClick={() => {
                              if (optIndex === q.correct) {
                                alert('Correct!');
                              } else {
                                alert('Try again!');
                              }
                            }}
                          >
                            {option}
                          </Button>
                        ))}
                      </Stack>
                    </Box>
                  ))}
                </Box>
              )}
              
              {currentLesson.resources && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Resources
                  </Typography>
                  <List>
                    {currentLesson.resources.map((resource, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <FileText />
                        </ListItemIcon>
                        <ListItemText primary={resource.name} secondary={resource.type} />
                        <Button size="small">Download</Button>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </DialogContent>
            
            <DialogActions>
              <Button
                variant="contained"
                onClick={() => handleCompleteLesson(
                  currentLesson.courseId,
                  currentLesson.moduleId,
                  currentLesson.id
                )}
              >
                Mark as Complete
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default LearningCenter;