import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  addDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import {
  BookOpen,
  Play,
  CheckCircle,
  Clock,
  Award,
  TrendingUp,
  Target,
  Users,
  Star,
  Download,
  Upload,
  Search,
  Filter,
  Calendar,
  Video,
  FileText,
  Headphones,
  Code,
  Zap,
  Trophy,
  Flame,
  Gift,
  Lock,
  Unlock,
  ChevronRight,
  ChevronDown,
  BarChart3,
  Activity,
  Bookmark,
  Share2,
  Heart,
  MessageSquare,
  ExternalLink,
  PlayCircle,
  PauseCircle,
  SkipForward,
  Volume2,
  Settings,
  Maximize,
  X,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Globe,
  Mail,
  Bell
} from 'lucide-react';

const Training = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [activeTab, setActiveTab] = useState('catalog');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCourseDetail, setShowCourseDetail] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [currentLesson, setCurrentLesson] = useState(null);

  // Course categories
  const categories = [
    { id: 'all', label: 'All Courses', icon: BookOpen, color: '#3b82f6' },
    { id: 'basics', label: 'Getting Started', icon: Play, color: '#10b981' },
    { id: 'advanced', label: 'Advanced Topics', icon: TrendingUp, color: '#f59e0b' },
    { id: 'business', label: 'Business Credit', icon: Target, color: '#8b5cf6' },
    { id: 'legal', label: 'Legal & Compliance', icon: FileText, color: '#ef4444' },
    { id: 'sales', label: 'Sales & Marketing', icon: Users, color: '#ec4899' },
    { id: 'tech', label: 'Technology', icon: Code, color: '#06b6d4' }
  ];

  // Sample course data
  const sampleCourses = [
    {
      id: '1',
      title: 'Credit Repair Fundamentals',
      description: 'Master the basics of credit repair and client management',
      category: 'basics',
      level: 'Beginner',
      duration: '4 hours',
      lessons: 12,
      students: 1250,
      rating: 4.8,
      instructor: 'Sarah Johnson',
      featured: true,
      tags: ['Credit', 'Basics', 'Required'],
      modules: [
        { id: 'm1', title: 'Introduction to Credit Repair', lessons: 3, duration: '45 min', completed: true },
        { id: 'm2', title: 'Credit Report Analysis', lessons: 4, duration: '1 hour', completed: true },
        { id: 'm3', title: 'Dispute Letter Writing', lessons: 3, duration: '50 min', completed: false },
        { id: 'm4', title: 'Client Communication', lessons: 2, duration: '30 min', completed: false }
      ],
      requirements: ['Basic computer skills', 'Understanding of finance'],
      outcomes: ['Analyze credit reports', 'Write effective disputes', 'Manage client expectations']
    },
    {
      id: '2',
      title: 'Advanced Dispute Strategies',
      description: 'Learn advanced techniques for complex credit situations',
      category: 'advanced',
      level: 'Advanced',
      duration: '6 hours',
      lessons: 18,
      students: 850,
      rating: 4.9,
      instructor: 'Michael Chen',
      featured: true,
      tags: ['Advanced', 'Disputes', 'Strategy'],
      modules: [
        { id: 'm1', title: 'Complex Dispute Scenarios', lessons: 5, duration: '1.5 hours', completed: false },
        { id: 'm2', title: 'Legal Frameworks', lessons: 4, duration: '1 hour', completed: false },
        { id: 'm3', title: 'Bureau Tactics', lessons: 5, duration: '1.5 hours', completed: false },
        { id: 'm4', title: 'Case Studies', lessons: 4, duration: '2 hours', completed: false }
      ],
      requirements: ['Credit Repair Fundamentals', '6 months experience'],
      outcomes: ['Handle complex cases', 'Apply legal strategies', 'Maximize results']
    },
    {
      id: '3',
      title: 'Business Credit Building',
      description: 'Complete guide to establishing business credit profiles',
      category: 'business',
      level: 'Intermediate',
      duration: '5 hours',
      lessons: 15,
      students: 920,
      rating: 4.7,
      instructor: 'David Martinez',
      featured: true,
      tags: ['Business', 'Credit Building', 'Enterprise'],
      modules: [
        { id: 'm1', title: 'Business Structure Setup', lessons: 4, duration: '1 hour', completed: false },
        { id: 'm2', title: 'Vendor Credit Lines', lessons: 4, duration: '1.5 hours', completed: false },
        { id: 'm3', title: 'Business Credit Reports', lessons: 4, duration: '1 hour', completed: false },
        { id: 'm4', title: 'Funding Strategies', lessons: 3, duration: '1.5 hours', completed: false }
      ],
      requirements: ['Basic credit knowledge', 'Business concepts'],
      outcomes: ['Build business credit', 'Secure vendor lines', 'Obtain funding']
    },
    {
      id: '4',
      title: 'FCRA & Consumer Rights',
      description: 'Understanding federal regulations and consumer protections',
      category: 'legal',
      level: 'Intermediate',
      duration: '3 hours',
      lessons: 10,
      students: 750,
      rating: 4.9,
      instructor: 'Jennifer Roberts',
      featured: false,
      tags: ['Legal', 'FCRA', 'Compliance'],
      modules: [
        { id: 'm1', title: 'FCRA Overview', lessons: 3, duration: '45 min', completed: false },
        { id: 'm2', title: 'Consumer Rights', lessons: 3, duration: '45 min', completed: false },
        { id: 'm3', title: 'Bureau Obligations', lessons: 2, duration: '45 min', completed: false },
        { id: 'm4', title: 'Violations & Remedies', lessons: 2, duration: '45 min', completed: false }
      ],
      requirements: ['Credit repair basics'],
      outcomes: ['Know FCRA inside out', 'Protect consumers', 'Identify violations']
    },
    {
      id: '5',
      title: 'Sales Mastery for Credit Repair',
      description: 'Convert leads and close deals effectively',
      category: 'sales',
      level: 'Beginner',
      duration: '4 hours',
      lessons: 14,
      students: 1100,
      rating: 4.6,
      instructor: 'Amanda Foster',
      featured: false,
      tags: ['Sales', 'Marketing', 'Conversion'],
      modules: [
        { id: 'm1', title: 'Lead Qualification', lessons: 4, duration: '1 hour', completed: false },
        { id: 'm2', title: 'Sales Scripts', lessons: 3, duration: '45 min', completed: false },
        { id: 'm3', title: 'Objection Handling', lessons: 4, duration: '1 hour', completed: false },
        { id: 'm4', title: 'Closing Techniques', lessons: 3, duration: '1.25 hours', completed: false }
      ],
      requirements: ['None'],
      outcomes: ['Qualify leads', 'Handle objections', 'Close sales']
    },
    {
      id: '6',
      title: 'CRM System Mastery',
      description: 'Maximize efficiency with SpeedyCRM platform',
      category: 'tech',
      level: 'Beginner',
      duration: '3 hours',
      lessons: 12,
      students: 1500,
      rating: 4.8,
      instructor: 'System Admin',
      featured: false,
      tags: ['Software', 'CRM', 'Productivity'],
      modules: [
        { id: 'm1', title: 'Platform Overview', lessons: 3, duration: '45 min', completed: false },
        { id: 'm2', title: 'Contact Management', lessons: 3, duration: '45 min', completed: false },
        { id: 'm3', title: 'Automation Features', lessons: 3, duration: '45 min', completed: false },
        { id: 'm4', title: 'Reports & Analytics', lessons: 3, duration: '45 min', completed: false }
      ],
      requirements: ['None'],
      outcomes: ['Navigate platform', 'Automate workflows', 'Generate reports']
    }
  ];

  // Live webinars
  const webinars = [
    {
      id: 'w1',
      title: 'Q1 2025 Industry Trends',
      presenter: 'Industry Expert Panel',
      date: '2025-10-15',
      time: '2:00 PM EST',
      duration: '90 min',
      attendees: 450,
      status: 'upcoming',
      description: 'Join us for quarterly insights on credit repair industry trends'
    },
    {
      id: 'w2',
      title: 'Advanced IDIQ Integration',
      presenter: 'Tech Team',
      date: '2025-10-08',
      time: '3:00 PM EST',
      duration: '60 min',
      attendees: 320,
      status: 'upcoming',
      description: 'Deep dive into IDIQ API features and best practices'
    },
    {
      id: 'w3',
      title: 'Sales Techniques Workshop',
      presenter: 'Amanda Foster',
      date: '2025-09-25',
      time: '1:00 PM EST',
      duration: '120 min',
      attendees: 580,
      status: 'completed',
      recording: true,
      description: 'Interactive workshop on closing high-ticket sales'
    }
  ];

  // Resources
  const resources = [
    {
      id: 'r1',
      title: 'Dispute Letter Templates',
      type: 'PDF',
      category: 'Templates',
      size: '2.5 MB',
      downloads: 3500,
      icon: FileText
    },
    {
      id: 'r2',
      title: 'FCRA Quick Reference Guide',
      type: 'PDF',
      category: 'Legal',
      size: '1.8 MB',
      downloads: 2800,
      icon: FileText
    },
    {
      id: 'r3',
      title: 'Sales Call Scripts',
      type: 'DOCX',
      category: 'Sales',
      size: '850 KB',
      downloads: 4200,
      icon: FileText
    },
    {
      id: 'r4',
      title: 'Credit Analysis Spreadsheet',
      type: 'XLSX',
      category: 'Tools',
      size: '1.2 MB',
      downloads: 3100,
      icon: FileText
    },
    {
      id: 'r5',
      title: 'Client Onboarding Checklist',
      type: 'PDF',
      category: 'Operations',
      size: '650 KB',
      downloads: 3800,
      icon: FileText
    }
  ];

  // User stats
  const userStats = {
    coursesEnrolled: 3,
    coursesCompleted: 1,
    totalHours: 12.5,
    currentStreak: 5,
    totalPoints: 850,
    level: 4,
    nextLevelPoints: 1000,
    certificates: 1,
    rank: 'Silver',
    badges: ['Fast Learner', 'Week Warrior', 'Quiz Master']
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(false);
      setCourses(sampleCourses);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  // Filtered courses
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          course.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [courses, selectedCategory, searchTerm]);

  // Handle course enrollment
  const handleEnroll = async (courseId) => {
    try {
      await addDoc(collection(db, 'courseProgress'), {
        userId: user?.uid,
        courseId,
        enrolledAt: serverTimestamp(),
        progress: 0,
        lastAccessed: serverTimestamp()
      });
      
      alert('Successfully enrolled in course!');
    } catch (error) {
      console.error('Error enrolling:', error);
    }
  };

  // Calculate overall progress
  const overallProgress = useMemo(() => {
    if (courses.length === 0) return 0;
    const enrolled = courses.filter(c => c.modules?.some(m => m.completed));
    if (enrolled.length === 0) return 0;
    
    const totalModules = enrolled.reduce((sum, c) => sum + (c.modules?.length || 0), 0);
    const completedModules = enrolled.reduce((sum, c) => 
      sum + (c.modules?.filter(m => m.completed).length || 0), 0);
    
    return Math.round((completedModules / totalModules) * 100);
  }, [courses]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-blue-600 animate-pulse" />
          <p className="text-gray-600 dark:text-gray-400">Loading training center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <BookOpen className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Training Center</h1>
                <p className="text-blue-100 mt-1">Master your craft and grow your skills</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-blue-100">Current Streak</p>
                <div className="flex items-center space-x-2 mt-1">
                  <Flame className="w-5 h-5 text-orange-300" />
                  <p className="text-2xl font-bold">{userStats.currentStreak} days</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-100">Total Points</p>
                <div className="flex items-center space-x-2 mt-1">
                  <Trophy className="w-5 h-5 text-yellow-300" />
                  <p className="text-2xl font-bold">{userStats.totalPoints}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Level {userStats.level} Progress</span>
              <span className="text-sm">{userStats.totalPoints} / {userStats.nextLevelPoints} XP</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${(userStats.totalPoints / userStats.nextLevelPoints) * 100}%` }}
              />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-5 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Enrolled</p>
                  <p className="text-2xl font-bold mt-1">{userStats.coursesEnrolled}</p>
                </div>
                <BookOpen className="w-8 h-8 text-blue-200" />
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Completed</p>
                  <p className="text-2xl font-bold mt-1">{userStats.coursesCompleted}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-300" />
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Hours</p>
                  <p className="text-2xl font-bold mt-1">{userStats.totalHours}</p>
                </div>
                <Clock className="w-8 h-8 text-purple-300" />
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Certificates</p>
                  <p className="text-2xl font-bold mt-1">{userStats.certificates}</p>
                </div>
                <Award className="w-8 h-8 text-yellow-300" />
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Rank</p>
                  <p className="text-2xl font-bold mt-1">{userStats.rank}</p>
                </div>
                <Star className="w-8 h-8 text-orange-300" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex space-x-1 bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm mb-6">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-all ${
              activeTab === 'catalog'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Course Catalog</span>
          </button>
          <button
            onClick={() => setActiveTab('my-courses')}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-all ${
              activeTab === 'my-courses'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>My Courses</span>
          </button>
          <button
            onClick={() => setActiveTab('webinars')}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-all ${
              activeTab === 'webinars'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Live Webinars</span>
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-all ${
              activeTab === 'resources'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Resources</span>
          </button>
          <button
            onClick={() => setActiveTab('certificates')}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-all ${
              activeTab === 'certificates'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Certificates</span>
          </button>
        </div>

        {/* Course Catalog Tab */}
        {activeTab === 'catalog' && (
          <div className="space-y-6">
            {/* Category Filter */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
              <div className="flex items-center space-x-4 overflow-x-auto pb-2">
                {categories.map(cat => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                        selectedCategory === cat.id
                          ? 'text-white shadow-lg'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                      style={selectedCategory === cat.id ? { backgroundColor: cat.color } : {}}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Course Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map(course => (
                <div
                  key={course.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer"
                  onClick={() => {
                    setSelectedCourse(course);
                    setShowCourseDetail(true);
                  }}
                >
                  {/* Thumbnail */}
                  <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <BookOpen className="w-16 h-16 text-white/50" />
                    {course.featured && (
                      <div className="absolute top-3 right-3 px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs font-semibold flex items-center space-x-1">
                        <Star className="w-3 h-3 fill-current" />
                        <span>Featured</span>
                      </div>
                    )}
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="flex items-center justify-between text-white text-xs">
                        <span className="px-2 py-1 bg-black/30 backdrop-blur-sm rounded">{course.level}</span>
                        <span className="px-2 py-1 bg-black/30 backdrop-blur-sm rounded">{course.duration}</span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">
                        {course.title}
                      </h3>
                      <div className="flex items-center space-x-1 ml-2">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{course.rating}</span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {course.description}
                    </p>

                    <div className="flex items-center space-x-4 text-xs text-gray-500 mb-4">
                      <div className="flex items-center space-x-1">
                        <Play className="w-3 h-3" />
                        <span>{course.lessons} lessons</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-3 h-3" />
                        <span>{course.students} students</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {course.tags?.slice(0, 3).map(tag => (
                        <span key={tag} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEnroll(course.id);
                      }}
                      className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium flex items-center justify-center space-x-2"
                    >
                      <PlayCircle className="w-4 h-4" />
                      <span>Enroll Now</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* My Courses Tab */}
        {activeTab === 'my-courses' && (
          <div className="space-y-6">
            {/* Progress Overview */}
            <div className="grid grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Overall Progress</h3>
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div className="space-y-2">
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{overallProgress}%</p>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                      style={{ width: `${overallProgress}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Learning Streak</h3>
                  <Flame className="w-5 h-5 text-orange-500" />
                </div>
                <div className="space-y-2">
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{userStats.currentStreak}</p>
                  <p className="text-sm text-gray-500">days in a row</p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Time Invested</h3>
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <div className="space-y-2">
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{userStats.totalHours}</p>
                  <p className="text-sm text-gray-500">hours total</p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Next Milestone</h3>
                  <Target className="w-5 h-5 text-green-600" />
                </div>
                <div className="space-y-2">
                  <p className="text-xl font-bold text-gray-900 dark:text-white">Level {userStats.level + 1}</p>
                  <p className="text-sm text-gray-500">{userStats.nextLevelPoints - userStats.totalPoints} XP to go</p>
                </div>
              </div>
            </div>

            {/* Enrolled Courses */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Continue Learning</h3>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {courses.filter(c => c.modules?.some(m => m.completed)).map(course => {
                  const completedModules = course.modules?.filter(m => m.completed).length || 0;
                  const totalModules = course.modules?.length || 1;
                  const progress = Math.round((completedModules / totalModules) * 100);

                  return (
                    <div key={course.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{course.title}</h4>
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs">
                              {course.level}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{course.description}</p>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">
                                {completedModules} of {totalModules} modules completed
                              </span>
                              <span className="font-semibold text-gray-900 dark:text-white">{progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>

                          {/* Modules */}
                          <div className="mt-4 space-y-2">
                            {course.modules?.map((module, idx) => (
                              <div
                                key={module.id}
                                className={`flex items-center justify-between p-3 rounded-lg ${
                                  module.completed
                                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                                    : 'bg-gray-50 dark:bg-gray-700/50'
                                }`}
                              >
                                <div className="flex items-center space-x-3">
                                  {module.completed ? (
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                  ) : (
                                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600" />
                                  )}
                                  <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{module.title}</p>
                                    <p className="text-xs text-gray-500">{module.lessons} lessons • {module.duration}</p>
                                  </div>
                                </div>
                                {!module.completed && (
                                  <button className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm">
                                    Start
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Achievements</h3>
              <div className="grid grid-cols-3 gap-4">
                {userStats.badges.map((badge, idx) => (
                  <div key={idx} className="flex items-center space-x-3 p-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="p-2 bg-yellow-400 rounded-lg">
                      <Award className="w-5 h-5 text-yellow-900" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{badge}</p>
                      <p className="text-xs text-gray-500">Earned today</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Webinars Tab */}
        {activeTab === 'webinars' && (
          <div className="space-y-6">
            {/* Upcoming */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Webinars</h3>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {webinars.filter(w => w.status === 'upcoming').map(webinar => (
                  <div key={webinar.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="p-3 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl">
                          <Video className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{webinar.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{webinar.description}</p>
                          <div className="flex items-center space-x-6 text-sm text-gray-500">
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4" />
                              <span>{webinar.date}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4" />
                              <span>{webinar.time}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Users className="w-4 h-4" />
                              <span>{webinar.attendees} registered</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            Presented by: <span className="font-medium">{webinar.presenter}</span>
                          </p>
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center space-x-2">
                        <Bell className="w-4 h-4" />
                        <span>Register</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Past Webinars */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recorded Sessions</h3>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {webinars.filter(w => w.status === 'completed').map(webinar => (
                  <div key={webinar.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="p-3 bg-gray-200 dark:bg-gray-700 rounded-xl">
                          <PlayCircle className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{webinar.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{webinar.description}</p>
                          <div className="flex items-center space-x-6 text-sm text-gray-500">
                            <span>{webinar.date}</span>
                            <span>•</span>
                            <span>{webinar.duration}</span>
                            <span>•</span>
                            <span>{webinar.attendees} attended</span>
                          </div>
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center space-x-2">
                        <PlayCircle className="w-4 h-4" />
                        <span>Watch Recording</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Resource Library</h3>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center space-x-2">
                    <Upload className="w-4 h-4" />
                    <span>Request Resource</span>
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {resources.map(resource => {
                    const Icon = resource.icon;
                    return (
                      <div
                        key={resource.id}
                        className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Icon className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{resource.title}</h4>
                            <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                              <span>{resource.type}</span>
                              <span>•</span>
                              <span>{resource.size}</span>
                              <span>•</span>
                              <span>{resource.downloads} downloads</span>
                            </div>
                          </div>
                        </div>
                        <button className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all">
                          <Download className="w-5 h-5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Certificates Tab */}
        {activeTab === 'certificates' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Your Certificates</h3>
              
              {userStats.certificates > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border-2 border-yellow-400 rounded-xl p-6 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-yellow-400 rounded-lg">
                        <Award className="w-8 h-8 text-yellow-900" />
                      </div>
                      <span className="text-xs text-gray-500">Issued: Jan 10, 2025</span>
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      Credit Repair Fundamentals
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Successfully completed all course requirements
                    </p>
                    <div className="flex items-center space-x-2">
                      <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center space-x-2">
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </button>
                      <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Award className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <p className="text-gray-600 dark:text-gray-400 mb-4">No certificates earned yet</p>
                  <p className="text-sm text-gray-500 mb-6">
                    Complete courses to earn certificates and showcase your expertise
                  </p>
                  <button
                    onClick={() => setActiveTab('catalog')}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                  >
                    Browse Courses
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Course Detail Modal */}
      {showCourseDetail && selectedCourse && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative h-64 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <BookOpen className="w-24 h-24 text-white/50" />
              <button
                onClick={() => setShowCourseDetail(false)}
                className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-lg backdrop-blur-sm transition-all"
              >
                <X className="w-5 h-5" />
              </button>
              {selectedCourse.featured && (
                <div className="absolute top-4 left-4 px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs font-semibold flex items-center space-x-1">
                  <Star className="w-3 h-3 fill-current" />
                  <span>Featured Course</span>
                </div>
              )}
            </div>

            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{selectedCourse.title}</h2>
                  <p className="text-gray-600 dark:text-gray-400 text-lg">{selectedCourse.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-8">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <TrendingUp className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">Level</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{selectedCourse.level}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <Clock className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">Duration</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{selectedCourse.duration}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <Play className="w-6 h-6 mx-auto mb-2 text-green-600" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">Lessons</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{selectedCourse.lessons}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <Users className="w-6 h-6 mx-auto mb-2 text-orange-600" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">Students</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{selectedCourse.students}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">What You'll Learn</h3>
                  <ul className="grid grid-cols-2 gap-3">
                    {selectedCourse.outcomes?.map((outcome, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 dark:text-gray-300">{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Course Content</h3>
                  <div className="space-y-2">
                    {selectedCourse.modules?.map((module, idx) => (
                      <div key={module.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {module.completed ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center text-xs text-gray-500">
                                {idx + 1}
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{module.title}</p>
                              <p className="text-sm text-gray-500">{module.lessons} lessons • {module.duration}</p>
                            </div>
                          </div>
                          {module.completed ? (
                            <Lock className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Requirements</h3>
                  <ul className="space-y-2">
                    {selectedCourse.requirements?.map((req, idx) => (
                      <li key={idx} className="flex items-start space-x-2 text-gray-700 dark:text-gray-300">
                        <span className="text-blue-600">•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      handleEnroll(selectedCourse.id);
                      setShowCourseDetail(false);
                    }}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold text-lg flex items-center justify-center space-x-2"
                  >
                    <PlayCircle className="w-5 h-5" />
                    <span>Enroll in This Course</span>
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

export default Training;