// src/pages/Learn.jsx
import React, { useState } from 'react';
import { 
  BookOpen, 
  Video, 
  FileText,
  Award,
  Clock,
  Users,
  Star,
  Play,
  Lock,
  CheckCircle,
  ArrowRight,
  Download,
  Bookmark,
  TrendingUp,
  Target,
  Zap,
  Calendar,
  MessageCircle,
  ChevronRight,
  Search,
  Filter,
  X
} from 'lucide-react';

const Learn = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([1, 3]); // Example enrolled courses

  // Course categories
  const categories = [
    { id: 'all', name: 'All Courses', icon: BookOpen },
    { id: 'credit-basics', name: 'Credit Basics', icon: TrendingUp },
    { id: 'dispute', name: 'Dispute Process', icon: FileText },
    { id: 'business', name: 'Business Credit', icon: Target },
    { id: 'advanced', name: 'Advanced Strategies', icon: Zap }
  ];

  // Course data
  const courses = [
    {
      id: 1,
      title: 'Credit Repair Fundamentals',
      category: 'credit-basics',
      description: 'Master the basics of credit scores, reports, and how to improve them',
      duration: '2 hours',
      lessons: 8,
      students: 1234,
      rating: 4.8,
      level: 'Beginner',
      instructor: 'Sarah Johnson',
      thumbnail: '📊',
      price: 0,
      modules: [
        { id: 1, title: 'Understanding Credit Scores', duration: '15 min', completed: true },
        { id: 2, title: 'Reading Your Credit Report', duration: '20 min', completed: true },
        { id: 3, title: 'Common Credit Myths', duration: '12 min', completed: false },
        { id: 4, title: 'Factors That Affect Your Score', duration: '18 min', completed: false }
      ]
    },
    {
      id: 2,
      title: 'DIY Dispute Letter Mastery',
      category: 'dispute',
      description: 'Learn to write powerful dispute letters that get results',
      duration: '3 hours',
      lessons: 12,
      students: 892,
      rating: 4.9,
      level: 'Intermediate',
      instructor: 'Michael Chen',
      thumbnail: '✉️',
      price: 49,
      modules: [
        { id: 1, title: 'Dispute Letter Basics', duration: '25 min', completed: false },
        { id: 2, title: 'Section 609 Letters', duration: '30 min', completed: false },
        { id: 3, title: 'Goodwill Letters', duration: '20 min', completed: false },
        { id: 4, title: 'Pay for Delete Strategy', duration: '22 min', completed: false }
      ]
    },
    {
      id: 3,
      title: 'Building Business Credit Fast',
      category: 'business',
      description: 'Establish and build business credit in 90 days or less',
      duration: '4 hours',
      lessons: 15,
      students: 567,
      rating: 4.7,
      level: 'Intermediate',
      instructor: 'David Martinez',
      thumbnail: '🏢',
      price: 99,
      modules: [
        { id: 1, title: 'Business Entity Setup', duration: '35 min', completed: true },
        { id: 2, title: 'Getting Your DUNS Number', duration: '20 min', completed: false },
        { id: 3, title: 'Starter Vendor Accounts', duration: '40 min', completed: false },
        { id: 4, title: 'Building Paydex Score', duration: '30 min', completed: false }
      ]
    },
    {
      id: 4,
      title: 'Advanced Credit Strategies',
      category: 'advanced',
      description: 'Advanced techniques for 750+ credit scores',
      duration: '5 hours',
      lessons: 20,
      students: 423,
      rating: 4.9,
      level: 'Advanced',
      instructor: 'Jennifer Williams',
      thumbnail: '🚀',
      price: 149,
      modules: [
        { id: 1, title: 'Credit Card Churning', duration: '45 min', completed: false },
        { id: 2, title: 'Authorized User Strategies', duration: '30 min', completed: false },
        { id: 3, title: 'Credit Mix Optimization', duration: '35 min', completed: false },
        { id: 4, title: 'Rapid Rescore Tactics', duration: '40 min', completed: false }
      ]
    },
    {
      id: 5,
      title: 'Collections & Charge-offs',
      category: 'dispute',
      description: 'How to handle collections and remove charge-offs',
      duration: '2.5 hours',
      lessons: 10,
      students: 1567,
      rating: 4.8,
      level: 'Intermediate',
      instructor: 'Robert Thompson',
      thumbnail: '⚡',
      price: 79,
      modules: [
        { id: 1, title: 'Debt Validation Process', duration: '30 min', completed: false },
        { id: 2, title: 'Statute of Limitations', duration: '25 min', completed: false },
        { id: 3, title: 'Settlement Negotiations', duration: '35 min', completed: false },
        { id: 4, title: 'Removing Paid Collections', duration: '28 min', completed: false }
      ]
    },
    {
      id: 6,
      title: 'Identity Theft Recovery',
      category: 'credit-basics',
      description: 'Protect yourself and recover from identity theft',
      duration: '3 hours',
      lessons: 11,
      students: 892,
      rating: 4.9,
      level: 'All Levels',
      instructor: 'Lisa Anderson',
      thumbnail: '🔒',
      price: 0,
      modules: [
        { id: 1, title: 'Prevention Strategies', duration: '20 min', completed: false },
        { id: 2, title: 'Early Warning Signs', duration: '15 min', completed: false },
        { id: 3, title: 'Filing Reports', duration: '25 min', completed: false },
        { id: 4, title: 'Credit Freeze Process', duration: '18 min', completed: false }
      ]
    }
  ];

  // Filter courses
  const filteredCourses = courses.filter(course => {
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          course.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Calculate progress for enrolled courses
  const calculateProgress = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return 0;
    const completed = course.modules.filter(m => m.completed).length;
    return Math.round((completed / course.modules.length) * 100);
  };

  // Quick stats
  const stats = {
    totalCourses: courses.length,
    totalStudents: courses.reduce((sum, c) => sum + c.students, 0),
    avgRating: (courses.reduce((sum, c) => sum + c.rating, 0) / courses.length).toFixed(1),
    totalHours: courses.reduce((sum, c) => sum + parseFloat(c.duration), 0)
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Learning Center</h1>
        </div>
        <p className="text-gray-600">Build your credit knowledge with expert-led courses and resources</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Courses</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
            </div>
            <BookOpen className="h-8 w-8 text-blue-100" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Students</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStudents.toLocaleString()}</p>
            </div>
            <Users className="h-8 w-8 text-green-100" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg Rating</p>
              <p className="text-2xl font-bold text-gray-900">⭐ {stats.avgRating}</p>
            </div>
            <Star className="h-8 w-8 text-yellow-100" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Hours</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalHours}+</p>
            </div>
            <Clock className="h-8 w-8 text-purple-100" />
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* My Learning Section */}
      {enrolledCourses.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Continue Learning</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {enrolledCourses.map(courseId => {
              const course = courses.find(c => c.id === courseId);
              if (!course) return null;
              const progress = calculateProgress(courseId);
              
              return (
                <div key={courseId} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{course.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{course.instructor}</p>
                    </div>
                    <span className="text-2xl">{course.thumbnail}</span>
                  </div>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Continue Course
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map(course => (
          <div key={course.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <span className="text-4xl">{course.thumbnail}</span>
                {course.price === 0 ? (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                    FREE
                  </span>
                ) : (
                  <span className="text-xl font-bold text-gray-900">
                    ${course.price}
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{course.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{course.description}</p>
              
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {course.duration}
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {course.lessons} lessons
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {course.students}
                </span>
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(course.rating) 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">{course.rating}</span>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  course.level === 'Beginner' ? 'bg-green-100 text-green-700' :
                  course.level === 'Intermediate' ? 'bg-blue-100 text-blue-700' :
                  'bg-purple-100 text-purple-700'
                }`}>
                  {course.level}
                </span>
              </div>
              
              <div className="flex gap-2">
                {enrolledCourses.includes(course.id) ? (
                  <button 
                    onClick={() => setSelectedCourse(course)}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Continue Learning
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={() => setSelectedCourse(course)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Preview
                    </button>
                    <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Enroll Now
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Course Preview Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">{selectedCourse.title}</h2>
              <button
                onClick={() => setSelectedCourse(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-6xl">{selectedCourse.thumbnail}</span>
                  <div>
                    <p className="text-gray-600">{selectedCourse.description}</p>
                    <p className="text-sm text-gray-500 mt-2">Instructor: {selectedCourse.instructor}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">What you'll learn</h3>
                <div className="space-y-2">
                  {selectedCourse.modules.map(module => (
                    <div key={module.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {module.completed ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                        )}
                        <span className="text-gray-700">{module.title}</span>
                      </div>
                      <span className="text-sm text-gray-500">{module.duration}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                {enrolledCourses.includes(selectedCourse.id) ? (
                  <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    Continue Course
                  </button>
                ) : (
                  <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Enroll Now {selectedCourse.price > 0 && `- $${selectedCourse.price}`}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Learn;