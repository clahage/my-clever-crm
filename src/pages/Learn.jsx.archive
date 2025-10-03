// src/pages/Learn.jsx
import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Video, 
  FileText, 
  Award,
  Clock, 
  CheckCircle,
  Crown,
  PlayCircle,
  Download,
  Star,
  Lock,
  Unlock,
  TrendingUp,
  Users,
  Calendar,
  MessageSquare,
  Target,
  Trophy,
  Zap,
  Brain,
  Headphones,
  Monitor,
  Smartphone,
  ChevronRight,
  ChevronDown,
  Search,
  Filter,
  Bookmark,
  BookmarkCheck,
  Share2,
  ThumbsUp,
  MessageCircle,
  Settings,
  BarChart3,
  PieChart,
  Activity,
  Medal,
  Gift,
  Heart,
  Info,
  HelpCircle,
  ExternalLink,
  Volume2,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Maximize,
  Minimize,
  RefreshCw,
  Upload,
  Shield,
  GraduationCap,
  Lightbulb,
  Map,
  Compass,
  Flag,
  Timer,
  FastForward,
  Rewind,
  Layers,
  Grid,
  List,
  ChevronLeft,
  ArrowRight,
  Database,
  Globe,
  Briefcase,
  DollarSign,
  CreditCard,
  TrendingDown,
  UserCheck,
  UserPlus,
  UserX,
  Mail,
  Phone,
  Printer,
  Edit3,
  Eye,
  EyeOff,
  ScrollText,
  X,
  XCircle,
  ChevronUp
} from 'lucide-react';

const Learn = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [expandedModule, setExpandedModule] = useState(null);
  const [bookmarkedCourses, setBookmarkedCourses] = useState([]);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // User learning data
  const [learningData] = useState({
    level: 'Advanced',
    xp: 8750,
    nextLevelXp: 10000,
    streak: 15,
    totalHours: 127,
    completedCourses: 23,
    certificates: 8,
    rank: 42,
    totalLearners: 1250,
    weeklyGoal: 5,
    weeklyProgress: 3,
    points: 4250,
    badges: 12
  });

  // Enhanced courses data
  const courses = [
    {
      id: 1,
      title: 'Credit Repair Mastery Course',
      category: 'Credit Repair',
      instructor: 'John Martinez, CRC',
      level: 'Beginner to Advanced',
      duration: '12 hours',
      modules: 24,
      students: 3456,
      rating: 4.9,
      price: 'Premium',
      progress: 75,
      thumbnail: '📊',
      description: 'Complete guide to credit repair from basics to advanced strategies',
      skills: ['Credit Analysis', 'Dispute Letters', 'Bureau Communication', 'Client Management'],
      certificate: true,
      xpReward: 500,
      lastAccessed: '2 days ago'
    },
    {
      id: 2,
      title: 'Business Credit Building Strategies',
      category: 'Business Credit',
      instructor: 'Sarah Chen, MBA',
      level: 'Intermediate',
      duration: '8 hours',
      modules: 16,
      students: 2134,
      rating: 4.8,
      price: 'Included',
      progress: 45,
      thumbnail: '🏢',
      description: 'Build strong business credit profiles for your clients',
      skills: ['D&B Setup', 'Tradeline Management', 'Business Structure', 'Vendor Credit'],
      certificate: true,
      xpReward: 350,
      lastAccessed: '1 week ago'
    },
    {
      id: 3,
      title: 'Advanced Dispute Tactics',
      category: 'Dispute Management',
      instructor: 'Michael Roberts',
      level: 'Advanced',
      duration: '6 hours',
      modules: 12,
      students: 1876,
      rating: 4.7,
      price: 'Premium',
      progress: 90,
      thumbnail: '⚖️',
      description: 'Master advanced dispute strategies and legal compliance',
      skills: ['Metro 2 Format', 'FCRA Compliance', 'Validation Letters', 'Legal Strategies'],
      certificate: true,
      xpReward: 300,
      lastAccessed: 'Today'
    },
    {
      id: 4,
      title: 'Client Acquisition & Marketing',
      category: 'Business Growth',
      instructor: 'Amanda Foster',
      level: 'All Levels',
      duration: '10 hours',
      modules: 20,
      students: 2890,
      rating: 4.9,
      price: 'Included',
      progress: 60,
      thumbnail: '📈',
      description: 'Grow your credit repair business with proven marketing strategies',
      skills: ['Digital Marketing', 'Sales Funnels', 'Social Media', 'Email Campaigns'],
      certificate: true,
      xpReward: 400,
      lastAccessed: '3 days ago'
    },
    {
      id: 5,
      title: 'FCRA & FDCPA Compliance',
      category: 'Legal & Compliance',
      instructor: 'Robert Johnson, JD',
      level: 'Intermediate',
      duration: '5 hours',
      modules: 10,
      students: 1543,
      rating: 4.6,
      price: 'Premium',
      progress: 30,
      thumbnail: '⚖️',
      description: 'Navigate legal requirements and maintain compliance',
      skills: ['FCRA Rules', 'FDCPA Guidelines', 'State Laws', 'Documentation'],
      certificate: true,
      xpReward: 250,
      lastAccessed: '5 days ago'
    },
    {
      id: 6,
      title: 'Financial Literacy Coaching',
      category: 'Coaching',
      instructor: 'Dr. Emily Wilson',
      level: 'Beginner',
      duration: '7 hours',
      modules: 14,
      students: 2234,
      rating: 4.8,
      price: 'Included',
      progress: 15,
      thumbnail: '💰',
      description: 'Teach clients financial literacy and money management',
      skills: ['Budgeting', 'Savings Plans', 'Investment Basics', 'Debt Management'],
      certificate: true,
      xpReward: 300,
      lastAccessed: '1 week ago'
    }
  ];

  // Learning paths
  const learningPaths = [
    {
      id: 1,
      name: 'Credit Repair Specialist',
      description: 'Become a certified credit repair specialist',
      courses: 8,
      duration: '40 hours',
      level: 'Beginner to Advanced',
      progress: 65,
      color: 'blue',
      icon: <Shield className="w-6 h-6" />,
      milestones: [
        { name: 'Foundation', completed: true },
        { name: 'Advanced Tactics', completed: true },
        { name: 'Legal Compliance', completed: false },
        { name: 'Certification', completed: false }
      ]
    },
    {
      id: 2,
      name: 'Business Growth Expert',
      description: 'Master business development and marketing',
      courses: 6,
      duration: '30 hours',
      level: 'Intermediate',
      progress: 40,
      color: 'green',
      icon: <TrendingUp className="w-6 h-6" />,
      milestones: [
        { name: 'Marketing Basics', completed: true },
        { name: 'Sales Mastery', completed: false },
        { name: 'Scaling Strategies', completed: false },
        { name: 'Automation', completed: false }
      ]
    },
    {
      id: 3,
      name: 'Compliance Officer',
      description: 'Expert in legal and regulatory compliance',
      courses: 5,
      duration: '25 hours',
      level: 'Advanced',
      progress: 20,
      color: 'purple',
      icon: <ScrollText className="w-6 h-6" />,
      milestones: [
        { name: 'FCRA Mastery', completed: true },
        { name: 'State Laws', completed: false },
        { name: 'Documentation', completed: false },
        { name: 'Audit Preparation', completed: false }
      ]
    }
  ];

  // Live events and webinars
  const liveEvents = [
    {
      id: 1,
      title: 'Weekly Q&A: Credit Repair Strategies',
      type: 'Live Q&A',
      date: '2024-01-20',
      time: '2:00 PM EST',
      instructor: 'John Martinez',
      attendees: 234,
      status: 'upcoming',
      thumbnail: '🎙️'
    },
    {
      id: 2,
      title: 'Mastering Business Credit',
      type: 'Webinar',
      date: '2024-01-22',
      time: '3:00 PM EST',
      instructor: 'Sarah Chen',
      attendees: 156,
      status: 'upcoming',
      thumbnail: '📹'
    },
    {
      id: 3,
      title: 'FCRA Compliance Workshop',
      type: 'Workshop',
      date: '2024-01-18',
      time: '1:00 PM EST',
      instructor: 'Robert Johnson',
      attendees: 189,
      status: 'recorded',
      thumbnail: '📼'
    }
  ];

  // Achievements and badges
  const achievements = [
    { id: 1, name: 'Fast Learner', description: 'Complete 5 courses in a month', icon: <Zap />, earned: true, xp: 100 },
    { id: 2, name: 'Dedicated Student', description: '30-day learning streak', icon: <Trophy />, earned: true, xp: 200 },
    { id: 3, name: 'Knowledge Sharer', description: 'Help 10 students in forums', icon: <Users />, earned: false, xp: 150 },
    { id: 4, name: 'Certificate Collector', description: 'Earn 10 certificates', icon: <Award />, earned: false, xp: 300 },
    { id: 5, name: 'Marathon Learner', description: '100 hours of learning', icon: <Clock />, earned: true, xp: 500 },
    { id: 6, name: 'Perfect Score', description: 'Get 100% on 5 assessments', icon: <Star />, earned: false, xp: 250 }
  ];

  // Community discussions
  const discussions = [
    {
      id: 1,
      title: 'Best practices for Metro 2 disputes?',
      author: 'Mike Thompson',
      replies: 23,
      views: 456,
      lastActivity: '2 hours ago',
      category: 'Disputes',
      solved: false
    },
    {
      id: 2,
      title: 'How to handle aggressive collectors',
      author: 'Sarah Williams',
      replies: 45,
      views: 789,
      lastActivity: '1 hour ago',
      category: 'Legal',
      solved: true
    },
    {
      id: 3,
      title: 'Tips for client onboarding',
      author: 'James Chen',
      replies: 12,
      views: 234,
      lastActivity: '5 hours ago',
      category: 'Business',
      solved: false
    }
  ];

  // Resources and downloads
  const resources = [
    {
      category: 'Templates',
      items: [
        { name: 'Dispute Letter Templates Pack', type: 'document', downloads: 1234, size: '2.5 MB', premium: false },
        { name: 'Client Agreement Templates', type: 'document', downloads: 987, size: '1.8 MB', premium: true },
        { name: 'Business Forms Collection', type: 'document', downloads: 765, size: '3.2 MB', premium: true }
      ]
    },
    {
      category: 'Guides',
      items: [
        { name: 'Complete FCRA Guide 2024', type: 'pdf', downloads: 2345, size: '5.6 MB', premium: false },
        { name: 'Business Credit Building Manual', type: 'pdf', downloads: 1876, size: '4.3 MB', premium: true },
        { name: 'Marketing Strategy Playbook', type: 'pdf', downloads: 1543, size: '7.8 MB', premium: true }
      ]
    },
    {
      category: 'Tools',
      items: [
        { name: 'Credit Score Calculator', type: 'tool', downloads: 3456, size: 'Web Tool', premium: false },
        { name: 'Dispute Tracking Spreadsheet', type: 'spreadsheet', downloads: 2134, size: '450 KB', premium: false },
        { name: 'ROI Calculator for Credit Repair', type: 'spreadsheet', downloads: 987, size: '320 KB', premium: true }
      ]
    }
  ];

  // Study groups
  const studyGroups = [
    {
      id: 1,
      name: 'FCRA Study Group',
      members: 45,
      nextSession: '2024-01-21 7:00 PM EST',
      topic: 'Section 609 Deep Dive',
      level: 'Intermediate'
    },
    {
      id: 2,
      name: 'Business Builders',
      members: 78,
      nextSession: '2024-01-22 8:00 PM EST',
      topic: 'Marketing Strategies',
      level: 'All Levels'
    },
    {
      id: 3,
      name: 'Beginners Circle',
      members: 123,
      nextSession: '2024-01-20 6:00 PM EST',
      topic: 'Credit Report Basics',
      level: 'Beginner'
    }
  ];

  // Filter courses
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Toggle bookmark
  const toggleBookmark = (courseId) => {
    setBookmarkedCourses(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  // Get level color
  const getLevelColor = (level) => {
    if (level.includes('Beginner')) return 'bg-green-100 text-green-800';
    if (level.includes('Intermediate')) return 'bg-yellow-100 text-yellow-800';
    if (level.includes('Advanced')) return 'bg-red-100 text-red-800';
    return 'bg-blue-100 text-blue-800';
  };

  // Get progress color
  const getProgressColor = (progress) => {
    if (progress >= 75) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    if (progress >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Enhanced Header with Gamification */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl p-8 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Learning Center</h1>
            <p className="text-xl opacity-90 mb-4">
              Expand your knowledge and grow your credit repair business
            </p>
            
            {/* User Stats Bar */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <Trophy className="w-5 h-5 mr-2" />
                <span>Level {Math.floor(learningData.xp / 1000)}: {learningData.level}</span>
              </div>
              <div className="flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                <span>{learningData.streak} day streak</span>
              </div>
              <div className="flex items-center">
                <Award className="w-5 h-5 mr-2" />
                <span>{learningData.certificates} certificates</span>
              </div>
              <div className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                <span>Rank #{learningData.rank} of {learningData.totalLearners}</span>
              </div>
            </div>
          </div>

          {/* XP Progress */}
          <div className="text-right">
            <div className="mb-2">
              <span className="text-3xl font-bold">{learningData.xp.toLocaleString()}</span>
              <span className="text-sm opacity-75"> / {learningData.nextLevelXp.toLocaleString()} XP</span>
            </div>
            <div className="w-64 bg-white/20 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-yellow-400 to-yellow-300 h-full rounded-full transition-all duration-500"
                style={{ width: `${(learningData.xp / learningData.nextLevelXp) * 100}%` }}
              />
            </div>
            <p className="text-xs mt-1 opacity-75">
              {learningData.nextLevelXp - learningData.xp} XP to next level
            </p>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-6 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur rounded-lg p-3">
            <Clock className="w-6 h-6 mb-2" />
            <div className="text-2xl font-bold">{learningData.totalHours}</div>
            <div className="text-xs opacity-75">Hours Learned</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-3">
            <BookOpen className="w-6 h-6 mb-2" />
            <div className="text-2xl font-bold">{learningData.completedCourses}</div>
            <div className="text-xs opacity-75">Courses Done</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-3">
            <Target className="w-6 h-6 mb-2" />
            <div className="text-2xl font-bold">{learningData.weeklyProgress}/{learningData.weeklyGoal}</div>
            <div className="text-xs opacity-75">Weekly Goal</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-3">
            <Medal className="w-6 h-6 mb-2" />
            <div className="text-2xl font-bold">{learningData.badges}</div>
            <div className="text-xs opacity-75">Badges Earned</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-3">
            <Medal className="w-6 h-6 mb-2" />
            <div className="text-2xl font-bold">{learningData.points.toLocaleString()}</div>
            <div className="text-xs opacity-75">Points</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-3">
            <ScrollText className="w-6 h-6 mb-2" />
            <div className="text-2xl font-bold">{learningData.certificates}</div>
            <div className="text-xs opacity-75">Certificates</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses, topics, or instructors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">All Categories</option>
              <option value="Credit Repair">Credit Repair</option>
              <option value="Business Credit">Business Credit</option>
              <option value="Dispute Management">Dispute Management</option>
              <option value="Business Growth">Business Growth</option>
              <option value="Legal & Compliance">Legal & Compliance</option>
              <option value="Coaching">Coaching</option>
            </select>
            <button className="flex items-center text-purple-600 hover:text-purple-700">
              <Filter className="w-4 h-4 mr-1" />
              More Filters
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-purple-100 text-purple-600' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-purple-100 text-purple-600' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b px-6">
          <nav className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 className="w-4 h-4" /> },
              { id: 'courses', label: 'Courses', icon: <BookOpen className="w-4 h-4" /> },
              { id: 'paths', label: 'Learning Paths', icon: <Map className="w-4 h-4" /> },
              { id: 'live', label: 'Live Events', icon: <Video className="w-4 h-4" /> },
              { id: 'community', label: 'Community', icon: <Users className="w-4 h-4" /> },
              { id: 'resources', label: 'Resources', icon: <Download className="w-4 h-4" /> },
              { id: 'achievements', label: 'Achievements', icon: <Trophy className="w-4 h-4" /> },
              { id: 'certificates', label: 'Certificates', icon: <Award className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.icon}
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Continue Learning */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Continue Learning</h3>
                <div className="grid grid-cols-3 gap-4">
                  {courses.filter(c => c.progress > 0 && c.progress < 100).slice(0, 3).map((course) => (
                    <div key={course.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div className="text-3xl">{course.thumbnail}</div>
                        <button onClick={() => toggleBookmark(course.id)}>
                          {bookmarkedCourses.includes(course.id) ? (
                            <BookmarkCheck className="w-5 h-5 text-purple-600" />
                          ) : (
                            <Bookmark className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                      <h4 className="font-semibold mb-1">{course.title}</h4>
                      <p className="text-sm text-gray-600 mb-3">{course.instructor}</p>
                      <div className="mb-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{course.progress}%</span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${getProgressColor(course.progress)}`}
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">{course.lastAccessed}</span>
                        <button className="bg-purple-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-purple-700 transition-colors">
                          Continue
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended for You */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Recommended for You</h3>
                <div className="grid grid-cols-2 gap-4">
                  {courses.filter(c => c.progress === 0).slice(0, 2).map((course) => (
                    <div key={course.id} className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(course.level)}`}>
                              {course.level}
                            </span>
                            <span className="text-xs text-gray-500">{course.duration}</span>
                            <span className="text-xs text-gray-500">{course.modules} modules</span>
                          </div>
                          <h4 className="font-semibold text-lg mb-2">{course.title}</h4>
                          <p className="text-sm text-gray-600 mb-3">{course.description}</p>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {course.skills.slice(0, 3).map((skill, idx) => (
                              <span key={idx} className="bg-white px-2 py-1 rounded text-xs">
                                {skill}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 text-sm text-gray-600">
                              <span className="flex items-center">
                                <Star className="w-4 h-4 text-yellow-500 mr-1" />
                                {course.rating}
                              </span>
                              <span className="flex items-center">
                                <Users className="w-4 h-4 mr-1" />
                                {course.students.toLocaleString()}
                              </span>
                              <span className="flex items-center">
                                <Award className="w-4 h-4 mr-1" />
                                +{course.xpReward} XP
                              </span>
                            </div>
                            <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                              Start Course
                            </button>
                          </div>
                        </div>
                        <div className="text-5xl ml-4">{course.thumbnail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly Progress */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">This Week's Progress</h3>
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                    <div key={index} className="text-center">
                      <div className="text-xs text-gray-600 mb-1">{day}</div>
                      <div className={`h-16 rounded-lg flex items-center justify-center ${
                        index < 5 ? 'bg-green-500 text-white' : 'bg-gray-200'
                      }`}>
                        {index < 5 && <CheckCircle className="w-5 h-5" />}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">{learningData.weeklyProgress} / {learningData.weeklyGoal}</div>
                    <div className="text-sm text-gray-600">Days completed this week</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Keep it up!</div>
                    <div className="text-sm font-medium text-purple-600">2 more days to reach your goal</div>
                  </div>
                </div>
              </div>

              {/* Upcoming Events */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Upcoming Live Events</h3>
                <div className="grid grid-cols-3 gap-4">
                  {liveEvents.filter(e => e.status === 'upcoming').map((event) => (
                    <div key={event.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="text-3xl mb-3">{event.thumbnail}</div>
                      <div className="mb-2">
                        <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                          {event.type}
                        </span>
                      </div>
                      <h4 className="font-semibold mb-2">{event.title}</h4>
                      <p className="text-sm text-gray-600 mb-3">with {event.instructor}</p>
                      <div className="space-y-1 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          {event.date}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          {event.time}
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-2" />
                          {event.attendees} registered
                        </div>
                      </div>
                      <button className="w-full mt-3 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors">
                        Register
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Courses Tab */}
          {activeTab === 'courses' && (
            <div className="space-y-6">
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-3 gap-6">
                  {filteredCourses.map((course) => (
                    <div key={course.id} className="border rounded-lg overflow-hidden hover:shadow-xl transition-shadow">
                      <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-6">
                        <div className="flex justify-between items-start">
                          <div className="text-4xl">{course.thumbnail}</div>
                          <div className="flex space-x-2">
                            <button onClick={() => toggleBookmark(course.id)}>
                              {bookmarkedCourses.includes(course.id) ? (
                                <BookmarkCheck className="w-5 h-5 text-purple-600" />
                              ) : (
                                <Bookmark className="w-5 h-5 text-gray-400" />
                              )}
                            </button>
                            <button>
                              <Share2 className="w-5 h-5 text-gray-400" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="p-5">
                        <div className="flex items-center space-x-2 mb-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(course.level)}`}>
                            {course.level}
                          </span>
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {course.category}
                          </span>
                          {course.certificate && (
                            <ScrollText className="w-4 h-4 text-purple-600" />
                          )}
                        </div>
                        
                        <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
                        <p className="text-sm text-gray-600 mb-3">by {course.instructor}</p>
                        
                        <p className="text-sm text-gray-600 mb-4">{course.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {course.skills.map((skill, idx) => (
                            <span key={idx} className="bg-gray-100 text-xs px-2 py-1 rounded">
                              {skill}
                            </span>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {course.duration}
                          </span>
                          <span className="flex items-center">
                            <Layers className="w-4 h-4 mr-1" />
                            {course.modules} modules
                          </span>
                          <span className="flex items-center">
                            <Award className="w-4 h-4 mr-1" />
                            +{course.xpReward} XP
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between pb-4 border-b">
                          <div className="flex items-center space-x-3">
                            <span className="flex items-center text-sm">
                              <Star className="w-4 h-4 text-yellow-500 mr-1" />
                              {course.rating}
                            </span>
                            <span className="text-sm text-gray-600">
                              {course.students.toLocaleString()} students
                            </span>
                          </div>
                          <span className={`text-sm font-medium ${
                            course.price === 'Included' ? 'text-green-600' : 'text-purple-600'
                          }`}>
                            {course.price}
                          </span>
                        </div>
                        
                        <div className="flex space-x-2 mt-4">
                          {course.progress > 0 ? (
                            <>
                              <button className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors">
                                Continue ({course.progress}%)
                              </button>
                              <button className="px-3 py-2 border rounded-lg hover:bg-gray-50">
                                <RefreshCw className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors">
                                Start Course
                              </button>
                              <button className="px-3 py-2 border rounded-lg hover:bg-gray-50">
                                <Info className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredCourses.map((course) => (
                    <div key={course.id} className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="text-5xl">{course.thumbnail}</div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(course.level)}`}>
                                {course.level}
                              </span>
                              <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                {course.category}
                              </span>
                              {course.certificate && (
                                <Certificate className="w-4 h-4 text-purple-600" />
                              )}
                              <span className={`text-sm font-medium ${
                                course.price === 'Included' ? 'text-green-600' : 'text-purple-600'
                              }`}>
                                {course.price}
                              </span>
                            </div>
                            <h3 className="font-semibold text-xl mb-2">{course.title}</h3>
                            <p className="text-gray-600 mb-3">by {course.instructor}</p>
                            <p className="text-gray-600 mb-4">{course.description}</p>
                            <div className="flex items-center space-x-6 text-sm text-gray-600">
                              <span className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {course.duration}
                              </span>
                              <span className="flex items-center">
                                <Layers className="w-4 h-4 mr-1" />
                                {course.modules} modules
                              </span>
                              <span className="flex items-center">
                                <Star className="w-4 h-4 text-yellow-500 mr-1" />
                                {course.rating}
                              </span>
                              <span className="flex items-center">
                                <Users className="w-4 h-4 mr-1" />
                                {course.students.toLocaleString()}
                              </span>
                              <span className="flex items-center">
                                <Award className="w-4 h-4 mr-1" />
                                +{course.xpReward} XP
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-3">
                          <div className="flex space-x-2">
                            <button onClick={() => toggleBookmark(course.id)}>
                              {bookmarkedCourses.includes(course.id) ? (
                                <BookmarkCheck className="w-5 h-5 text-purple-600" />
                              ) : (
                                <Bookmark className="w-5 h-5 text-gray-400" />
                              )}
                            </button>
                            <button>
                              <Share2 className="w-5 h-5 text-gray-400" />
                            </button>
                          </div>
                          {course.progress > 0 ? (
                            <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                              Continue ({course.progress}%)
                            </button>
                          ) : (
                            <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                              Start Course
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Learning Paths Tab */}
          {activeTab === 'paths' && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-6">
                {learningPaths.map((path) => (
                  <div key={path.id} className="border rounded-lg overflow-hidden hover:shadow-xl transition-shadow">
                    <div className={`bg-gradient-to-r from-${path.color}-500 to-${path.color}-600 p-6 text-white`}>
                      <div className="flex items-center justify-between mb-4">
                        {path.icon}
                        <span className="bg-white/20 px-2 py-1 rounded text-xs">
                          {path.level}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold mb-2">{path.name}</h3>
                      <p className="text-sm opacity-90">{path.description}</p>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-4 text-sm">
                        <span className="text-gray-600">{path.courses} courses</span>
                        <span className="text-gray-600">{path.duration}</span>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-medium">Progress</span>
                          <span>{path.progress}%</span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-2">
                          <div 
                            className={`bg-${path.color}-500 h-full rounded-full transition-all duration-500`}
                            style={{ width: `${path.progress}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="text-sm font-medium text-gray-700">Milestones</div>
                        {path.milestones.map((milestone, idx) => (
                          <div key={idx} className="flex items-center text-sm">
                            {milestone.completed ? (
                              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            ) : (
                              <div className="w-4 h-4 border-2 border-gray-300 rounded-full mr-2" />
                            )}
                            <span className={milestone.completed ? 'text-gray-900' : 'text-gray-500'}>
                              {milestone.name}
                            </span>
                          </div>
                        ))}
                      </div>
                      
                      <button className={`w-full bg-${path.color}-600 text-white py-2 rounded-lg hover:bg-${path.color}-700 transition-colors`}>
                        {path.progress > 0 ? 'Continue Path' : 'Start Path'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Create Custom Path */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 text-center">
                <Compass className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Create Your Own Path</h3>
                <p className="text-gray-600 mb-4">
                  Build a custom learning path tailored to your specific goals
                </p>
                <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                  Create Custom Path
                </button>
              </div>
            </div>
          )}

          {/* Live Events Tab */}
          {activeTab === 'live' && (
            <div className="space-y-6">
              {/* Upcoming Events */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Upcoming Events</h3>
                <div className="grid grid-cols-2 gap-4">
                  {liveEvents.filter(e => e.status === 'upcoming').map((event) => (
                    <div key={event.id} className="border rounded-lg p-5 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="text-4xl">{event.thumbnail}</div>
                          <div className="flex-1">
                            <div className="mb-2">
                              <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                                {event.type}
                              </span>
                              <span className="ml-2 bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full">
                                Live
                              </span>
                            </div>
                            <h4 className="font-semibold text-lg mb-2">{event.title}</h4>
                            <p className="text-gray-600 mb-3">Hosted by {event.instructor}</p>
                            <div className="space-y-2 text-sm text-gray-600">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-2" />
                                {event.date}
                              </div>
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-2" />
                                {event.time}
                              </div>
                              <div className="flex items-center">
                                <Users className="w-4 h-4 mr-2" />
                                {event.attendees} registered
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-2">
                          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                            Register
                          </button>
                          <button className="text-purple-600 hover:text-purple-700 text-sm">
                            Add to Calendar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recorded Events */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Recorded Sessions</h3>
                <div className="grid grid-cols-3 gap-4">
                  {liveEvents.filter(e => e.status === 'recorded').map((event) => (
                    <div key={event.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="bg-gray-100 rounded-lg p-8 mb-3 flex items-center justify-center">
                        <PlayCircle className="w-12 h-12 text-gray-600" />
                      </div>
                      <h4 className="font-semibold mb-2">{event.title}</h4>
                      <p className="text-sm text-gray-600 mb-3">by {event.instructor}</p>
                      <button className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors">
                        Watch Recording
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Study Groups */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Study Groups</h3>
                <div className="grid grid-cols-3 gap-4">
                  {studyGroups.map((group) => (
                    <div key={group.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <Users className="w-8 h-8 text-purple-600" />
                        <span className="bg-purple-100 text-purple-600 text-xs px-2 py-1 rounded-full">
                          {group.level}
                        </span>
                      </div>
                      <h4 className="font-semibold mb-2">{group.name}</h4>
                      <p className="text-sm text-gray-600 mb-3">{group.members} members</p>
                      <div className="bg-gray-50 rounded p-3 mb-3">
                        <div className="text-xs text-gray-500 mb-1">Next Session</div>
                        <div className="font-medium text-sm">{group.topic}</div>
                        <div className="text-xs text-gray-600 mt-1">{group.nextSession}</div>
                      </div>
                      <button className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors">
                        Join Group
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Community Tab */}
          {activeTab === 'community' && (
            <div className="space-y-6">
              {/* Discussion Forums */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Discussion Forums</h3>
                  <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                    New Discussion
                  </button>
                </div>
                <div className="space-y-3">
                  {discussions.map((discussion) => (
                    <div key={discussion.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                              {discussion.category}
                            </span>
                            {discussion.solved && (
                              <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded flex items-center">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Solved
                              </span>
                            )}
                          </div>
                          <h4 className="font-semibold text-lg mb-2">{discussion.title}</h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>by {discussion.author}</span>
                            <span className="flex items-center">
                              <MessageCircle className="w-4 h-4 mr-1" />
                              {discussion.replies} replies
                            </span>
                            <span className="flex items-center">
                              <Eye className="w-4 h-4 mr-1" />
                              {discussion.views} views
                            </span>
                            <span>{discussion.lastActivity}</span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Leaderboard */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Community Leaderboard</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4 text-center">
                    <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
                    <div className="font-semibold">Top Learner</div>
                    <div className="text-2xl font-bold">Sarah M.</div>
                    <div className="text-sm text-gray-600">15,230 XP</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center">
                    <Medal className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <div className="font-semibold">Most Helpful</div>
                    <div className="text-2xl font-bold">John D.</div>
                    <div className="text-sm text-gray-600">234 solutions</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center">
                    <Star className="w-12 h-12 text-orange-500 mx-auto mb-2" />
                    <div className="font-semibold">Rising Star</div>
                    <div className="text-2xl font-bold">Emily R.</div>
                    <div className="text-sm text-gray-600">45-day streak</div>
                  </div>
                </div>
              </div>

              {/* Mentorship Program */}
              <div className="bg-purple-50 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Mentorship Program</h3>
                    <p className="text-gray-600 mb-4">
                      Get paired with experienced credit repair professionals for one-on-one guidance
                    </p>
                    <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                      Find a Mentor
                    </button>
                  </div>
                  <UserCheck className="w-24 h-24 text-purple-300" />
                </div>
              </div>
            </div>
          )}

          {/* Resources Tab */}
          {activeTab === 'resources' && (
            <div className="space-y-6">
              {resources.map((category, index) => (
                <div key={index}>
                  <h3 className="text-lg font-semibold mb-4">{category.category}</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {category.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start">
                            <div className="bg-gray-100 p-2 rounded-lg mr-3">
                              {item.type === 'document' && <FileText className="w-5 h-5 text-blue-600" />}
                              {item.type === 'pdf' && <FileText className="w-5 h-5 text-red-600" />}
                              {item.type === 'spreadsheet' && <Grid className="w-5 h-5 text-green-600" />}
                              {item.type === 'tool' && <Settings className="w-5 h-5 text-purple-600" />}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium mb-1">{item.name}</h4>
                              <div className="flex items-center space-x-3 text-xs text-gray-500">
                                <span>{item.size}</span>
                                <span>{item.downloads} downloads</span>
                              </div>
                            </div>
                          </div>
                          {item.premium && (
                            <Crown className="w-5 h-5 text-yellow-500" />
                          )}
                        </div>
                        <button className={`w-full py-2 rounded-lg transition-colors flex items-center justify-center ${
                          item.premium 
                            ? 'bg-yellow-500 text-white hover:bg-yellow-600' 
                            : 'bg-purple-600 text-white hover:bg-purple-700'
                        }`}>
                          <Download className="w-4 h-4 mr-2" />
                          {item.premium ? 'Premium' : 'Download'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Resource Library Stats */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Your Resource Library</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">47</div>
                    <div className="text-sm text-gray-600">Downloaded</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">12</div>
                    <div className="text-sm text-gray-600">Bookmarked</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">8</div>
                    <div className="text-sm text-gray-600">Shared</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-600">5</div>
                    <div className="text-sm text-gray-600">Premium</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Achievements Tab */}
          {activeTab === 'achievements' && (
            <div className="space-y-6">
              {/* Achievement Progress */}
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-6 text-white">
                <h3 className="text-2xl font-bold mb-4">Your Achievements</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                    <Trophy className="w-8 h-8 mb-2" />
                    <div className="text-3xl font-bold">{achievements.filter(a => a.earned).length}</div>
                    <div className="text-sm opacity-75">Unlocked</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                    <Medal className="w-8 h-8 mb-2" />
                    <div className="text-3xl font-bold">
                      {achievements.filter(a => a.earned).reduce((sum, a) => sum + a.xp, 0)}
                    </div>
                    <div className="text-sm opacity-75">XP Earned</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                    <Target className="w-8 h-8 mb-2" />
                    <div className="text-3xl font-bold">
                      {Math.round((achievements.filter(a => a.earned).length / achievements.length) * 100)}%
                    </div>
                    <div className="text-sm opacity-75">Completion</div>
                  </div>
                </div>
              </div>

              {/* Achievement Grid */}
              <div className="grid grid-cols-3 gap-4">
                {achievements.map((achievement) => (
                  <div 
                    key={achievement.id} 
                    className={`border rounded-lg p-5 ${
                      achievement.earned 
                        ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-300' 
                        : 'bg-gray-50 border-gray-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-3 rounded-lg ${
                        achievement.earned ? 'bg-purple-100 text-purple-600' : 'bg-gray-200 text-gray-400'
                      }`}>
                        {achievement.icon}
                      </div>
                      {achievement.earned && (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      )}
                    </div>
                    <h4 className="font-semibold mb-2">{achievement.name}</h4>
                    <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-purple-600">+{achievement.xp} XP</span>
                      {!achievement.earned && (
                        <span className="text-xs text-gray-500">Locked</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Badges Collection */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Badge Collection</h3>
                <div className="grid grid-cols-6 gap-3">
                  {[...Array(12)].map((_, index) => (
                    <div 
                      key={index}
                      className={`aspect-square rounded-lg flex items-center justify-center ${
                        index < learningData.badges 
                          ? 'bg-gradient-to-br from-yellow-400 to-orange-500' 
                          : 'bg-gray-200'
                      }`}
                    >
                      {index < learningData.badges ? (
                        <Star className="w-8 h-8 text-white" />
                      ) : (
                        <Lock className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Certificates Tab */}
          {activeTab === 'certificates' && (
            <div className="space-y-6">
              {/* Certificate Stats */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Your Certificates</h3>
                    <p className="opacity-90">
                      Showcase your expertise with verified certificates
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold">{learningData.certificates}</div>
                    <div className="text-sm opacity-75">Total Earned</div>
                  </div>
                </div>
              </div>

              {/* Certificate Grid */}
              <div className="grid grid-cols-2 gap-6">
                {courses.filter(c => c.certificate && c.progress === 100).map((course) => (
                  <div key={course.id} className="border-2 border-gray-200 rounded-lg p-6 bg-gradient-to-br from-gray-50 to-white">
                    <div className="flex items-start justify-between mb-4">
                      <ScrollText className="w-12 h-12 text-purple-600" />
                      <div className="text-right">
                        <div className="text-xs text-gray-500">Certificate ID</div>
                        <div className="font-mono text-sm">CERT-2024-{course.id.toString().padStart(4, '0')}</div>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Certificate of Completion</h3>
                    <p className="text-gray-600 mb-4">{course.title}</p>
                    <div className="border-t pt-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Instructor</span>
                        <span className="font-medium">{course.instructor}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Completed</span>
                        <span className="font-medium">January 15, 2024</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duration</span>
                        <span className="font-medium">{course.duration}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <button className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors">
                        View
                      </button>
                      <button className="flex-1 border border-purple-600 text-purple-600 py-2 rounded-lg hover:bg-purple-50 transition-colors">
                        Download
                      </button>
                      <button className="px-3 py-2 border rounded-lg hover:bg-gray-50">
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Verification Section */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-start">
                  <Shield className="w-8 h-8 text-blue-600 mr-4 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-2">Certificate Verification</h4>
                    <p className="text-blue-700 mb-3">
                      All certificates are blockchain-verified and can be authenticated using the certificate ID. 
                      Share your certificates with confidence knowing they're tamper-proof and verifiable.
                    </p>
                    <button className="text-blue-900 underline text-sm font-medium">
                      Learn more about verification →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Video Player Modal */}
      {showVideoPlayer && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl">
            <div className="bg-gray-900 rounded-t-lg p-4">
              <div className="flex items-center justify-between text-white mb-4">
                <h3 className="text-lg font-semibold">{selectedCourse.title}</h3>
                <button onClick={() => setShowVideoPlayer(false)}>
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <div className="bg-black aspect-video rounded flex items-center justify-center">
                <PlayCircle className="w-16 h-16 text-white" />
              </div>
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center space-x-2">
                  <button className="text-white hover:text-gray-300">
                    <SkipBack className="w-5 h-5" />
                  </button>
                  <button className="text-white hover:text-gray-300">
                    <Play className="w-6 h-6" />
                  </button>
                  <button className="text-white hover:text-gray-300">
                    <SkipForward className="w-5 h-5" />
                  </button>
                  <span className="text-sm text-gray-300">0:00 / 12:30</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="text-white hover:text-gray-300">
                    <Volume2 className="w-5 h-5" />
                  </button>
                  <select 
                    value={playbackSpeed}
                    onChange={(e) => setPlaybackSpeed(e.target.value)}
                    className="bg-gray-800 text-white text-sm px-2 py-1 rounded"
                  >
                    <option value="0.5">0.5x</option>
                    <option value="0.75">0.75x</option>
                    <option value="1">1x</option>
                    <option value="1.25">1.25x</option>
                    <option value="1.5">1.5x</option>
                    <option value="2">2x</option>
                  </select>
                  <button className="text-white hover:text-gray-300">
                    <Settings className="w-5 h-5" />
                  </button>
                  <button className="text-white hover:text-gray-300">
                    <Maximize className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-semibold">Module 1: Introduction to Credit Repair</h4>
                  <p className="text-sm text-gray-600">Lesson 3 of 12</p>
                </div>
                <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                  Next Lesson
                </button>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium mb-2">Lesson Resources</h5>
                <div className="space-y-2">
                  <button className="flex items-center text-sm text-purple-600 hover:text-purple-700">
                    <Download className="w-4 h-4 mr-2" />
                    Download slides
                  </button>
                  <button className="flex items-center text-sm text-purple-600 hover:text-purple-700">
                    <FileText className="w-4 h-4 mr-2" />
                    View transcript
                  </button>
                  <button className="flex items-center text-sm text-purple-600 hover:text-purple-700">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Ask a question
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Learn;