// src/pages/BusinessCredit.jsx
import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  CreditCard, 
  TrendingUp, 
  FileText, 
  Shield, 
  Award,
  BarChart3,
  PieChart,
  Activity,
  DollarSign,
  Users,
  Target,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Calendar,
  Download,
  Upload,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  Search,
  Filter,
  Settings,
  HelpCircle,
  Info,
  Lock,
  Unlock,
  Star,
  Bookmark,
  Share2,
  Printer,
  Mail,
  Phone,
  Globe,
  MapPin,
  Briefcase,
  Package,
  Truck,
  Store,
  ShoppingCart,
  Zap,
  Database,
  Server,
  Cpu,
  Layers,
  Grid,
  List,
  Eye,
  EyeOff,
  Edit3,
  Trash2,
  Copy,
  Link2,
  Hash,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  MoreVertical,
  MoreHorizontal,
  Circle,
  CheckSquare,
  Square,
  AlertTriangle,
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Battery,
  Gauge,
  Compass,
  Navigation,
  Map,
  Flag,
  Tag,
  Tags,
  Folder,
  FolderOpen,
  Archive,
  Inbox,
  Send,
  MessageSquare,
  MessageCircle,
  Video,
  Camera,
  Mic,
  Headphones,
  Speaker,
  Play,
  Pause,
  StopCircle,
  FastForward,
  Rewind,
  SkipForward,
  SkipBack,
  Repeat,
  Shuffle,
  Maximize,
  Minimize,
  Expand,
  Move,
  GitBranch,
  GitCommit,
  GitMerge,
  Github,
  Award as AwardIcon,
  Medal,
  Trophy,
  Crown,
  Gift,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Smile,
  Coffee,
  Droplet,
  Flame,
  CloudRain,
  Sun,
  Moon,
  Wind,
  Umbrella,
  Sparkles,
  Lightbulb,
  BookOpen,
  Book,
  FileCheck,
  FilePlus,
  FileMinus,
  FileX,
  X
} from 'lucide-react';

const BusinessCredit = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedBusiness, setSelectedBusiness] = useState(0);
  const [showAddTradeline, setShowAddTradeline] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('90days');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTradeline, setSelectedTradeline] = useState(null);

  // Multiple business profiles
  const [businesses] = useState([
    {
      id: 1,
      name: 'Tech Solutions LLC',
      ein: '87-1234567',
      duns: '123456789',
      established: '2019-03-15',
      structure: 'LLC',
      industry: 'Technology Services',
      revenue: '$2.5M',
      employees: 25,
      score: {
        paydex: 80,
        intelliscore: 76,
        fico: 720,
        businessAge: 5
      }
    },
    {
      id: 2,
      name: 'Retail Ventures Inc',
      ein: '87-9876543',
      duns: '987654321',
      established: '2021-06-20',
      structure: 'Corporation',
      industry: 'Retail Trade',
      revenue: '$850K',
      employees: 12,
      score: {
        paydex: 75,
        intelliscore: 68,
        fico: 690,
        businessAge: 3
      }
    }
  ]);

  const currentBusiness = businesses[selectedBusiness];

  // Comprehensive tradelines data
  const [tradelines] = useState([
    {
      id: 1,
      vendor: 'Uline',
      accountNumber: 'UL-123456',
      type: 'Net 30',
      category: 'Shipping Supplies',
      creditLimit: 15000,
      balance: 3500,
      utilization: 23,
      status: 'Active',
      paymentHistory: [100, 100, 100, 100, 100, 100, 95, 100, 100, 100, 100, 100],
      established: '2022-01-15',
      lastPayment: '2024-01-15',
      nextDue: '2024-02-15',
      reportingBureaus: ['D&B', 'Experian', 'Equifax'],
      tier: 'Tier 3',
      importance: 'high',
      notes: 'Excellent payment history, consider increasing limit'
    },
    {
      id: 2,
      vendor: 'Grainger',
      accountNumber: 'GR-789012',
      type: 'Net 30',
      category: 'Industrial Supplies',
      creditLimit: 25000,
      balance: 8750,
      utilization: 35,
      status: 'Active',
      paymentHistory: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
      established: '2021-06-20',
      lastPayment: '2024-01-10',
      nextDue: '2024-02-10',
      reportingBureaus: ['D&B', 'Experian'],
      tier: 'Tier 4',
      importance: 'high',
      notes: 'Major vendor, maintain perfect payment history'
    },
    {
      id: 3,
      vendor: 'Quill',
      accountNumber: 'Q-345678',
      type: 'Net 30',
      category: 'Office Supplies',
      creditLimit: 5000,
      balance: 1200,
      utilization: 24,
      status: 'Active',
      paymentHistory: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
      established: '2022-09-10',
      lastPayment: '2024-01-05',
      nextDue: '2024-02-05',
      reportingBureaus: ['D&B'],
      tier: 'Tier 2',
      importance: 'medium',
      notes: 'Good starter tradeline'
    },
    {
      id: 4,
      vendor: 'Home Depot Pro',
      accountNumber: 'HD-901234',
      type: 'Revolving',
      category: 'Building Materials',
      creditLimit: 10000,
      balance: 2800,
      utilization: 28,
      status: 'Active',
      paymentHistory: [100, 100, 100, 90, 100, 100, 100, 100, 100, 100, 100, 100],
      established: '2021-11-30',
      lastPayment: '2024-01-12',
      nextDue: '2024-02-12',
      reportingBureaus: ['D&B', 'Experian', 'Equifax'],
      tier: 'Tier 3',
      importance: 'high',
      notes: 'One late payment 9 months ago'
    },
    {
      id: 5,
      vendor: 'Amazon Business',
      accountNumber: 'AMZ-567890',
      type: 'Net 30',
      category: 'Various',
      creditLimit: 8000,
      balance: 0,
      utilization: 0,
      status: 'Active',
      paymentHistory: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
      established: '2023-03-15',
      lastPayment: '2023-12-20',
      nextDue: 'N/A',
      reportingBureaus: ['D&B'],
      tier: 'Tier 2',
      importance: 'medium',
      notes: 'Use regularly to maintain active status'
    }
  ]);

  // Credit building roadmap
  const creditBuildingSteps = [
    {
      phase: 'Foundation',
      month: '0-3',
      status: 'completed',
      tasks: [
        { name: 'Establish Business Entity', completed: true, critical: true },
        { name: 'Obtain EIN', completed: true, critical: true },
        { name: 'Open Business Bank Account', completed: true, critical: true },
        { name: 'Get Business License', completed: true, critical: false },
        { name: 'Create Business Website', completed: true, critical: false },
        { name: 'Get Business Phone Number', completed: true, critical: true }
      ]
    },
    {
      phase: 'Registration',
      month: '3-6',
      status: 'completed',
      tasks: [
        { name: 'Register with Dun & Bradstreet', completed: true, critical: true },
        { name: 'Get DUNS Number', completed: true, critical: true },
        { name: 'Register with Experian Business', completed: true, critical: true },
        { name: 'Register with Equifax Business', completed: true, critical: true },
        { name: 'Set up Trade References', completed: true, critical: false }
      ]
    },
    {
      phase: 'Starter Tradelines',
      month: '6-9',
      status: 'in-progress',
      tasks: [
        { name: 'Quill Account', completed: true, critical: false },
        { name: 'Uline Account', completed: true, critical: false },
        { name: 'Grainger Account', completed: true, critical: false },
        { name: 'HD Supply Account', completed: false, critical: false },
        { name: 'Establish 5+ Tradelines', completed: false, critical: true }
      ]
    },
    {
      phase: 'Growth Phase',
      month: '9-12',
      status: 'upcoming',
      tasks: [
        { name: 'Apply for Business Credit Card', completed: false, critical: true },
        { name: 'Establish Fleet/Gas Cards', completed: false, critical: false },
        { name: 'Apply for Small Business Loan', completed: false, critical: false },
        { name: 'Increase Credit Limits', completed: false, critical: false },
        { name: 'Maintain 80+ Paydex', completed: false, critical: true }
      ]
    },
    {
      phase: 'Advanced Credit',
      month: '12+',
      status: 'upcoming',
      tasks: [
        { name: 'Establish Bank Lines of Credit', completed: false, critical: true },
        { name: 'Apply for SBA Loans', completed: false, critical: false },
        { name: 'Equipment Financing', completed: false, critical: false },
        { name: 'Commercial Real Estate', completed: false, critical: false },
        { name: 'Maintain Multiple Credit Lines', completed: false, critical: true }
      ]
    }
  ];

  // Bureau data and scores
  const bureauData = {
    dunBradstreet: {
      name: 'Dun & Bradstreet',
      score: currentBusiness.score.paydex,
      maxScore: 100,
      rating: 'Good',
      lastUpdated: '2024-01-15',
      tradelines: 8,
      publicRecords: 0,
      trend: 'up',
      change: 5,
      factors: [
        { factor: 'Payment History', impact: 'positive', description: '100% on-time payments' },
        { factor: 'Credit Utilization', impact: 'positive', description: '28% average utilization' },
        { factor: 'Business Age', impact: 'neutral', description: '5 years in business' },
        { factor: 'Industry Risk', impact: 'positive', description: 'Low risk industry' }
      ]
    },
    experian: {
      name: 'Experian Business',
      score: currentBusiness.score.intelliscore,
      maxScore: 100,
      rating: 'Fair',
      lastUpdated: '2024-01-10',
      tradelines: 6,
      publicRecords: 0,
      trend: 'stable',
      change: 0,
      factors: [
        { factor: 'Credit History', impact: 'positive', description: 'Established credit profile' },
        { factor: 'Payment Trends', impact: 'positive', description: 'Improving payment patterns' },
        { factor: 'Credit Mix', impact: 'neutral', description: 'Moderate variety of credit' },
        { factor: 'Recent Inquiries', impact: 'negative', description: '3 inquiries in last 6 months' }
      ]
    },
    equifax: {
      name: 'Equifax Business',
      score: 89,
      maxScore: 100,
      rating: 'Very Good',
      lastUpdated: '2024-01-12',
      tradelines: 5,
      publicRecords: 0,
      trend: 'up',
      change: 3,
      factors: [
        { factor: 'Payment Performance', impact: 'positive', description: 'Excellent payment record' },
        { factor: 'Financial Stability', impact: 'positive', description: 'Strong financial indicators' },
        { factor: 'Credit Capacity', impact: 'positive', description: 'Low debt-to-credit ratio' },
        { factor: 'Company Size', impact: 'neutral', description: 'Small business profile' }
      ]
    }
  };

  // Vendor recommendations
  const vendorRecommendations = [
    {
      category: 'Starter Vendors (No PG)',
      vendors: [
        { name: 'Quill', type: 'Net 30', approval: 'Easy', bureaus: 'D&B', minRevenue: 'None', popular: true },
        { name: 'Uline', type: 'Net 30', approval: 'Easy', bureaus: 'D&B, Exp', minRevenue: 'None', popular: true },
        { name: 'Strategic Network Solutions', type: 'Net 30', approval: 'Easy', bureaus: 'D&B', minRevenue: 'None' },
        { name: 'Crown Office Supplies', type: 'Net 30', approval: 'Easy', bureaus: 'D&B', minRevenue: 'None' }
      ]
    },
    {
      category: 'Tier 2 Vendors',
      vendors: [
        { name: 'Grainger', type: 'Net 30', approval: 'Moderate', bureaus: 'D&B, Exp', minRevenue: '$100K', popular: true },
        { name: 'HD Supply', type: 'Net 30', approval: 'Moderate', bureaus: 'D&B, Exp, Eq', minRevenue: '$100K', popular: true },
        { name: 'Amazon Business', type: 'Net 30', approval: 'Easy', bureaus: 'D&B', minRevenue: 'None', popular: true },
        { name: 'Fastenal', type: 'Net 30', approval: 'Moderate', bureaus: 'D&B, Exp', minRevenue: '$250K' }
      ]
    },
    {
      category: 'Fleet & Fuel Cards',
      vendors: [
        { name: 'Shell Fleet Plus', type: 'Revolving', approval: 'Moderate', bureaus: 'D&B, Exp', minRevenue: '$100K', popular: true },
        { name: 'BP Business Solutions', type: 'Revolving', approval: 'Moderate', bureaus: 'D&B, Exp', minRevenue: '$100K' },
        { name: 'ExxonMobil Fleet', type: 'Revolving', approval: 'Hard', bureaus: 'All', minRevenue: '$250K', popular: true },
        { name: 'WEX Fleet Card', type: 'Revolving', approval: 'Moderate', bureaus: 'D&B, Exp', minRevenue: '$100K' }
      ]
    },
    {
      category: 'Business Credit Cards',
      vendors: [
        { name: 'Capital One Spark', type: 'Revolving', approval: 'Moderate', bureaus: 'All', minRevenue: '$100K', popular: true },
        { name: 'Chase Ink Business', type: 'Revolving', approval: 'Hard', bureaus: 'All', minRevenue: '$250K', popular: true },
        { name: 'American Express Business', type: 'Revolving', approval: 'Hard', bureaus: 'All', minRevenue: '$500K', popular: true },
        { name: 'Bank of America Business', type: 'Revolving', approval: 'Hard', bureaus: 'All', minRevenue: '$250K' }
      ]
    }
  ];

  // Monitoring alerts
  const [alerts] = useState([
    {
      id: 1,
      type: 'success',
      title: 'Score Increase',
      message: 'Your Paydex score increased by 5 points to 80',
      date: '2024-01-15',
      bureau: 'D&B',
      icon: <TrendingUp className="w-5 h-5" />
    },
    {
      id: 2,
      type: 'warning',
      title: 'Payment Due Soon',
      message: 'Grainger payment of $2,450 due in 3 days',
      date: '2024-01-17',
      vendor: 'Grainger',
      icon: <Clock className="w-5 h-5" />
    },
    {
      id: 3,
      type: 'info',
      title: 'New Tradeline Available',
      message: 'You qualify for Home Depot Pro with $10,000 limit',
      date: '2024-01-16',
      vendor: 'Home Depot',
      icon: <Plus className="w-5 h-5" />
    },
    {
      id: 4,
      type: 'error',
      title: 'High Utilization',
      message: 'Grainger utilization at 35% - consider payment',
      date: '2024-01-14',
      vendor: 'Grainger',
      icon: <AlertTriangle className="w-5 h-5" />
    }
  ]);

  // Financial metrics
  const financialMetrics = {
    totalCredit: 63000,
    totalUsed: 16250,
    availableCredit: 46750,
    avgUtilization: 26,
    monthlyPayments: 4850,
    creditGrowth: 156,
    paymentPerformance: 98,
    tradelines: {
      active: 5,
      pending: 2,
      closed: 1,
      total: 8
    }
  };

  // Helper functions
  const getScoreColor = (score, max) => {
    const percentage = (score / max) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    if (percentage >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getUtilizationColor = (utilization) => {
    if (utilization <= 30) return 'bg-green-500';
    if (utilization <= 50) return 'bg-yellow-500';
    if (utilization <= 70) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getAlertStyles = (type) => {
    switch(type) {
      case 'success': return 'bg-green-50 border-green-200 text-green-800';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'error': return 'bg-red-50 border-red-200 text-red-800';
      default: return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const calculateCreditScore = () => {
    // Weighted average of all bureau scores
    const scores = [
      bureauData.dunBradstreet.score,
      bureauData.experian.score,
      bureauData.equifax.score
    ];
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Enhanced Header with Business Selector */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl p-8 text-white">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-4">
              <h1 className="text-3xl font-bold">Business Credit Center</h1>
              <select
                value={selectedBusiness}
                onChange={(e) => setSelectedBusiness(Number(e.target.value))}
                className="bg-white/20 backdrop-blur text-white px-4 py-2 rounded-lg border border-white/30"
              >
                {businesses.map((business, index) => (
                  <option key={business.id} value={index} className="text-gray-900">
                    {business.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <div className="text-sm opacity-75">Business Name</div>
                <div className="font-semibold">{currentBusiness.name}</div>
              </div>
              <div>
                <div className="text-sm opacity-75">DUNS Number</div>
                <div className="font-semibold">{currentBusiness.duns}</div>
              </div>
              <div>
                <div className="text-sm opacity-75">Industry</div>
                <div className="font-semibold">{currentBusiness.industry}</div>
              </div>
              <div>
                <div className="text-sm opacity-75">Annual Revenue</div>
                <div className="font-semibold">{currentBusiness.revenue}</div>
              </div>
            </div>
          </div>
          
          {/* Overall Credit Score */}
          <div className="text-center">
            <div className="text-6xl font-bold mb-2">{calculateCreditScore()}</div>
            <div className="text-sm opacity-75">Business Credit Score</div>
            <div className="flex items-center justify-center mt-2">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span className="text-sm">+8 this month</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-8 gap-4">
          <div className="bg-white/10 backdrop-blur rounded-lg p-3">
            <Shield className="w-6 h-6 mb-2" />
            <div className="text-2xl font-bold">{currentBusiness.score.paydex}</div>
            <div className="text-xs opacity-75">Paydex</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-3">
            <BarChart3 className="w-6 h-6 mb-2" />
            <div className="text-2xl font-bold">{currentBusiness.score.intelliscore}</div>
            <div className="text-xs opacity-75">Intelliscore</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-3">
            <CreditCard className="w-6 h-6 mb-2" />
            <div className="text-2xl font-bold">{currentBusiness.score.fico}</div>
            <div className="text-xs opacity-75">FICO SBSS</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-3">
            <Building2 className="w-6 h-6 mb-2" />
            <div className="text-2xl font-bold">{tradelines.length}</div>
            <div className="text-xs opacity-75">Tradelines</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-3">
            <DollarSign className="w-6 h-6 mb-2" />
            <div className="text-2xl font-bold">${(financialMetrics.totalCredit / 1000).toFixed(0)}K</div>
            <div className="text-xs opacity-75">Total Credit</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-3">
            <Percent className="w-6 h-6 mb-2" />
            <div className="text-2xl font-bold">{financialMetrics.avgUtilization}%</div>
            <div className="text-xs opacity-75">Utilization</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-3">
            <Calendar className="w-6 h-6 mb-2" />
            <div className="text-2xl font-bold">{currentBusiness.score.businessAge}y</div>
            <div className="text-xs opacity-75">Age</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-3">
            <Users className="w-6 h-6 mb-2" />
            <div className="text-2xl font-bold">{currentBusiness.employees}</div>
            <div className="text-xs opacity-75">Employees</div>
          </div>
        </div>

        {/* Credit Health Bar */}
        <div className="mt-6 bg-white/10 backdrop-blur rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm">Credit Health Score</span>
            <span className="text-sm font-semibold">Excellent</span>
          </div>
          <div className="bg-white/20 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-green-400 to-green-300 h-full rounded-full transition-all duration-500"
              style={{ width: '85%' }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs opacity-75">
            <span>Poor</span>
            <span>Fair</span>
            <span>Good</span>
            <span>Very Good</span>
            <span>Excellent</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b px-6">
          <nav className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 className="w-4 h-4" /> },
              { id: 'tradelines', label: 'Tradelines', icon: <CreditCard className="w-4 h-4" /> },
              { id: 'bureaus', label: 'Credit Bureaus', icon: <Shield className="w-4 h-4" /> },
              { id: 'roadmap', label: 'Building Roadmap', icon: <Map className="w-4 h-4" /> },
              { id: 'vendors', label: 'Vendor Directory', icon: <Store className="w-4 h-4" /> },
              { id: 'monitoring', label: 'Monitoring', icon: <Activity className="w-4 h-4" /> },
              { id: 'documents', label: 'Documents', icon: <FileText className="w-4 h-4" /> },
              { id: 'resources', label: 'Resources', icon: <BookOpen className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
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
              {/* Financial Overview */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <CreditCard className="w-8 h-8 text-blue-600" />
                    <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                      Active
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    ${financialMetrics.totalCredit.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Total Credit Available</div>
                  <div className="mt-2 text-xs text-blue-600">
                    +${(financialMetrics.totalCredit * 0.15).toLocaleString()} last month
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <DollarSign className="w-8 h-8 text-green-600" />
                    <ArrowUpRight className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    ${financialMetrics.availableCredit.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Available Credit</div>
                  <div className="mt-2 text-xs text-green-600">
                    {Math.round((financialMetrics.availableCredit / financialMetrics.totalCredit) * 100)}% available
                  </div>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Percent className="w-8 h-8 text-yellow-600" />
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      financialMetrics.avgUtilization <= 30 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {financialMetrics.avgUtilization <= 30 ? 'Good' : 'Watch'}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {financialMetrics.avgUtilization}%
                  </div>
                  <div className="text-sm text-gray-600">Avg. Utilization</div>
                  <div className="mt-2 text-xs text-gray-500">
                    Target: Under 30%
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <TrendingUp className="w-8 h-8 text-purple-600" />
                    <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded-full">
                      +{financialMetrics.creditGrowth}%
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {financialMetrics.paymentPerformance}%
                  </div>
                  <div className="text-sm text-gray-600">Payment Performance</div>
                  <div className="mt-2 text-xs text-purple-600">
                    Excellent standing
                  </div>
                </div>
              </div>

              {/* Recent Alerts */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Recent Alerts</h3>
                  <button className="text-blue-600 hover:text-blue-700 text-sm">View All</button>
                </div>
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div key={alert.id} className={`border rounded-lg p-4 ${getAlertStyles(alert.type)}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start">
                          <div className="mr-3 mt-0.5">{alert.icon}</div>
                          <div>
                            <div className="font-medium">{alert.title}</div>
                            <div className="text-sm mt-1">{alert.message}</div>
                            <div className="text-xs mt-2 opacity-75">{alert.date}</div>
                          </div>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Score Trends Chart */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Credit Score Trends</h3>
                  <select 
                    value={selectedTimeframe}
                    onChange={(e) => setSelectedTimeframe(e.target.value)}
                    className="px-3 py-1 border rounded-lg text-sm"
                  >
                    <option value="30days">30 Days</option>
                    <option value="90days">90 Days</option>
                    <option value="6months">6 Months</option>
                    <option value="1year">1 Year</option>
                  </select>
                </div>
                
                {/* Simplified Chart Visualization */}
                <div className="h-64 flex items-end justify-between space-x-2">
                  {[65, 68, 70, 72, 71, 73, 75, 74, 76, 78, 77, 80].map((score, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t transition-all duration-300 hover:from-blue-600 hover:to-blue-500"
                        style={{ height: `${(score / 100) * 100}%` }}
                      />
                      <span className="text-xs text-gray-500 mt-2">
                        {index % 3 === 0 ? `M${index/3 + 1}` : ''}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="text-center">
                    <div className="text-sm text-gray-600">Starting Score</div>
                    <div className="text-2xl font-bold">65</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600">Current Score</div>
                    <div className="text-2xl font-bold text-green-600">80</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600">Improvement</div>
                    <div className="text-2xl font-bold text-blue-600">+23%</div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="grid grid-cols-4 gap-4">
                  <button className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 transition-colors">
                    <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <span className="text-sm text-gray-600">Add Tradeline</span>
                  </button>
                  <button className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 transition-colors">
                    <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <span className="text-sm text-gray-600">Generate Report</span>
                  </button>
                  <button className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 transition-colors">
                    <Shield className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <span className="text-sm text-gray-600">Dispute Item</span>
                  </button>
                  <button className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 transition-colors">
                    <Download className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <span className="text-sm text-gray-600">Pull Reports</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tradelines Tab */}
          {activeTab === 'tradelines' && (
            <div className="space-y-6">
              {/* Tradeline Summary */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <span className="text-2xl font-bold">{financialMetrics.tradelines.active}</span>
                  </div>
                  <div className="text-sm text-gray-600">Active Tradelines</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Clock className="w-6 h-6 text-yellow-600" />
                    <span className="text-2xl font-bold">{financialMetrics.tradelines.pending}</span>
                  </div>
                  <div className="text-sm text-gray-600">Pending Approval</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <XCircle className="w-6 h-6 text-gray-600" />
                    <span className="text-2xl font-bold">{financialMetrics.tradelines.closed}</span>
                  </div>
                  <div className="text-sm text-gray-600">Closed</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Layers className="w-6 h-6 text-blue-600" />
                    <span className="text-2xl font-bold">{financialMetrics.tradelines.total}</span>
                  </div>
                  <div className="text-sm text-gray-600">Total All Time</div>
                </div>
              </div>

              {/* Add New Tradeline Button */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Active Tradelines</h3>
                <button
                  onClick={() => setShowAddTradeline(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Tradeline
                </button>
              </div>

              {/* Tradelines List */}
              <div className="space-y-4">
                {tradelines.map((tradeline) => (
                  <div key={tradeline.id} className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start">
                        <div className="bg-gray-100 p-3 rounded-lg mr-4">
                          <Building2 className="w-6 h-6 text-gray-600" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="text-lg font-semibold">{tradeline.vendor}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              tradeline.status === 'Active' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {tradeline.status}
                            </span>
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                              {tradeline.tier}
                            </span>
                            {tradeline.importance === 'high' && (
                              <Star className="w-4 h-4 text-yellow-500" />
                            )}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            Account: {tradeline.accountNumber} • Type: {tradeline.type} • Category: {tradeline.category}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedTradeline(tradeline);
                          setShowDetailModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Credit and Payment Info */}
                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-600">Credit Limit</div>
                        <div className="text-xl font-semibold">${tradeline.creditLimit.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Current Balance</div>
                        <div className="text-xl font-semibold">${tradeline.balance.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Utilization</div>
                        <div className="flex items-center">
                          <span className="text-xl font-semibold mr-2">{tradeline.utilization}%</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-full rounded-full ${getUtilizationColor(tradeline.utilization)}`}
                              style={{ width: `${tradeline.utilization}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Next Payment</div>
                        <div className="text-xl font-semibold">{tradeline.nextDue}</div>
                      </div>
                    </div>

                    {/* Payment History */}
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Payment History (12 months)</span>
                        <span className="text-sm text-gray-600">
                          Reporting to: {tradeline.reportingBureaus.join(', ')}
                        </span>
                      </div>
                      <div className="flex space-x-1">
                        {tradeline.paymentHistory.map((payment, index) => (
                          <div
                            key={index}
                            className={`flex-1 h-8 rounded flex items-center justify-center text-xs font-medium ${
                              payment === 100 
                                ? 'bg-green-500 text-white' 
                                : payment >= 90 
                                ? 'bg-yellow-500 text-white'
                                : 'bg-red-500 text-white'
                            }`}
                            title={`Month ${12 - index}: ${payment}% on time`}
                          >
                            {payment === 100 ? '✓' : payment + '%'}
                          </div>
                        ))}
                      </div>
                      {tradeline.notes && (
                        <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                          <div className="flex items-start">
                            <Info className="w-4 h-4 text-yellow-600 mr-2 mt-0.5" />
                            <span className="text-sm text-yellow-800">{tradeline.notes}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Recommended Tradelines */}
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Recommended Next Tradelines</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">HD Supply</span>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        Pre-qualified
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">Building supplies vendor with Net 30 terms</p>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Est. Limit:</span>
                        <span className="font-medium">$5,000-$10,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Reports to:</span>
                        <span className="font-medium">D&B, Exp</span>
                      </div>
                    </div>
                    <button className="w-full mt-3 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                      Apply Now
                    </button>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Shell Fleet Card</span>
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                        Likely approval
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">Fuel card for business vehicles</p>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Est. Limit:</span>
                        <span className="font-medium">$3,000-$5,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Reports to:</span>
                        <span className="font-medium">D&B, Exp</span>
                      </div>
                    </div>
                    <button className="w-full mt-3 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                      Learn More
                    </button>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Office Depot</span>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        Easy approval
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">Office supplies with Net 30 terms</p>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Est. Limit:</span>
                        <span className="font-medium">$2,000-$5,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Reports to:</span>
                        <span className="font-medium">D&B</span>
                      </div>
                    </div>
                    <button className="w-full mt-3 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                      Apply Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Credit Bureaus Tab */}
          {activeTab === 'bureaus' && (
            <div className="space-y-6">
              {Object.values(bureauData).map((bureau, index) => (
                <div key={index} className="border rounded-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{bureau.name}</h3>
                        <div className="flex items-center space-x-4">
                          <div>
                            <span className="text-4xl font-bold">{bureau.score}</span>
                            <span className="text-gray-600">/{bureau.maxScore}</span>
                          </div>
                          <div className="text-left">
                            <div className={`text-lg font-medium ${getScoreColor(bureau.score, bureau.maxScore)}`}>
                              {bureau.rating}
                            </div>
                            <div className="text-sm text-gray-500">
                              {bureau.trend === 'up' ? '+' : bureau.trend === 'down' ? '-' : ''}{bureau.change} this month
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600 mb-1">Last Updated</div>
                        <div className="font-medium">{bureau.lastUpdated}</div>
                        <button className="mt-2 text-blue-600 hover:text-blue-700 text-sm">
                          Pull Latest Report →
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3">Score Factors</h4>
                        <div className="space-y-2">
                          {bureau.factors.map((factor, idx) => (
                            <div key={idx} className="flex items-start">
                              <div className={`w-2 h-2 rounded-full mt-1.5 mr-2 ${
                                factor.impact === 'positive' ? 'bg-green-500' :
                                factor.impact === 'negative' ? 'bg-red-500' : 'bg-gray-400'
                              }`} />
                              <div>
                                <div className="text-sm font-medium">{factor.factor}</div>
                                <div className="text-xs text-gray-600">{factor.description}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-3">Account Summary</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Tradelines Reported</span>
                            <span className="font-medium">{bureau.tradelines}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Public Records</span>
                            <span className="font-medium text-green-600">{bureau.publicRecords}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Recent Inquiries</span>
                            <span className="font-medium">2</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Account Age</span>
                            <span className="font-medium">3.5 years</span>
                          </div>
                        </div>
                        <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                          View Full Report
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Bureau Comparison */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Bureau Score Comparison</h3>
                <div className="space-y-3">
                  {Object.values(bureauData).map((bureau, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-40 text-sm font-medium">{bureau.name}</div>
                      <div className="flex-1 mx-4">
                        <div className="bg-gray-200 rounded-full h-8">
                          <div 
                            className={`h-full rounded-full flex items-center justify-end pr-3 text-white text-sm font-medium ${
                              bureau.score >= 80 ? 'bg-green-500' :
                              bureau.score >= 60 ? 'bg-yellow-500' :
                              bureau.score >= 40 ? 'bg-orange-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${bureau.score}%` }}
                          >
                            {bureau.score}
                          </div>
                        </div>
                      </div>
                      <div className="w-20 text-right">
                        <span className={`text-sm ${
                          bureau.trend === 'up' ? 'text-green-600' :
                          bureau.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {bureau.trend === 'up' ? '↑' : bureau.trend === 'down' ? '↓' : '→'} {bureau.change}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Building Roadmap Tab */}
          {activeTab === 'roadmap' && (
            <div className="space-y-6">
              {/* Progress Overview */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Your Credit Building Journey</h3>
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                    Phase 3 of 5
                  </span>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  {creditBuildingSteps.map((step, index) => (
                    <div key={index} className="flex-1">
                      <div className={`h-2 rounded-full ${
                        step.status === 'completed' ? 'bg-green-500' :
                        step.status === 'in-progress' ? 'bg-blue-500' :
                        'bg-gray-300'
                      }`} />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Foundation</span>
                  <span>Registration</span>
                  <span>Starter</span>
                  <span>Growth</span>
                  <span>Advanced</span>
                </div>
              </div>

              {/* Roadmap Steps */}
              <div className="space-y-4">
                {creditBuildingSteps.map((phase, phaseIndex) => (
                  <div 
                    key={phaseIndex} 
                    className={`border rounded-lg overflow-hidden ${
                      phase.status === 'in-progress' ? 'border-blue-500' : ''
                    }`}
                  >
                    <div 
                      className={`p-4 cursor-pointer ${
                        phase.status === 'completed' ? 'bg-green-50' :
                        phase.status === 'in-progress' ? 'bg-blue-50' :
                        'bg-gray-50'
                      }`}
                      onClick={() => setExpandedSection(expandedSection === phaseIndex ? null : phaseIndex)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {phase.status === 'completed' ? (
                            <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                          ) : phase.status === 'in-progress' ? (
                            <div className="w-6 h-6 border-2 border-blue-600 rounded-full mr-3 animate-pulse" />
                          ) : (
                            <div className="w-6 h-6 border-2 border-gray-400 rounded-full mr-3" />
                          )}
                          <div>
                            <h4 className="font-semibold">{phase.phase}</h4>
                            <span className="text-sm text-gray-600">Months {phase.month}</span>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {phase.status === 'in-progress' && (
                            <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs mr-3">
                              Current Phase
                            </span>
                          )}
                          {expandedSection === phaseIndex ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>

                    {expandedSection === phaseIndex && (
                      <div className="p-4 border-t">
                        <div className="space-y-2">
                          {phase.tasks.map((task, taskIndex) => (
                            <div key={taskIndex} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                              <div className="flex items-center">
                                {task.completed ? (
                                  <CheckSquare className="w-5 h-5 text-green-600 mr-3" />
                                ) : (
                                  <Square className="w-5 h-5 text-gray-400 mr-3" />
                                )}
                                <span className={task.completed ? 'text-gray-600 line-through' : 'text-gray-900'}>
                                  {task.name}
                                </span>
                                {task.critical && (
                                  <span className="ml-2 bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs">
                                    Critical
                                  </span>
                                )}
                              </div>
                              {!task.completed && (
                                <button className="text-blue-600 hover:text-blue-700 text-sm">
                                  Start →
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                        
                        {phase.status === 'in-progress' && (
                          <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                            <div className="flex items-start">
                              <Lightbulb className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                              <div>
                                <div className="font-medium text-yellow-900">Next Steps</div>
                                <p className="text-sm text-yellow-800 mt-1">
                                  Focus on completing the remaining tasks in this phase before moving forward. 
                                  Critical tasks must be completed for optimal credit building.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Milestone Achievements */}
              <div className="bg-purple-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Milestone Achievements</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
                    <div className="font-medium">First Tradeline</div>
                    <div className="text-sm text-gray-600">Completed</div>
                  </div>
                  <div className="text-center">
                    <Award className="w-12 h-12 text-blue-500 mx-auto mb-2" />
                    <div className="font-medium">DUNS Registered</div>
                    <div className="text-sm text-gray-600">Completed</div>
                  </div>
                  <div className="text-center">
                    <Star className="w-12 h-12 text-purple-500 mx-auto mb-2" />
                    <div className="font-medium">80 Paydex</div>
                    <div className="text-sm text-gray-600">Achieved</div>
                  </div>
                  <div className="text-center opacity-50">
                    <Medal className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <div className="font-medium">$100K Credit</div>
                    <div className="text-sm text-gray-600">In Progress</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Vendor Directory Tab */}
          {activeTab === 'vendors' && (
            <div className="space-y-6">
              {vendorRecommendations.map((category, index) => (
                <div key={index}>
                  <h3 className="text-lg font-semibold mb-4">{category.category}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {category.vendors.map((vendor, vendorIndex) => (
                      <div key={vendorIndex} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center">
                              <h4 className="font-semibold">{vendor.name}</h4>
                              {vendor.popular && (
                                <span className="ml-2 bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-xs">
                                  Popular
                                </span>
                              )}
                            </div>
                            <span className="text-sm text-gray-600">{vendor.type} Terms</span>
                          </div>
                          <Store className="w-5 h-5 text-gray-400" />
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Approval Difficulty</span>
                            <span className={`font-medium ${
                              vendor.approval === 'Easy' ? 'text-green-600' :
                              vendor.approval === 'Moderate' ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {vendor.approval}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Reports To</span>
                            <span className="font-medium">{vendor.bureaus}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Min Revenue</span>
                            <span className="font-medium">{vendor.minRevenue}</span>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2 mt-4">
                          <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                            Apply
                          </button>
                          <button className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                            Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Application Tips */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">Vendor Application Tips</h3>
                <div className="grid grid-cols-2 gap-4 text-sm text-blue-800">
                  <div>
                    <h4 className="font-medium mb-2">Before Applying:</h4>
                    <ul className="space-y-1">
                      <li>• Ensure business entity is properly established</li>
                      <li>• Have EIN and DUNS number ready</li>
                      <li>• Business bank account with 3+ months history</li>
                      <li>• Business address (not residential)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Best Practices:</h4>
                    <ul className="space-y-1">
                      <li>• Start with easier approval vendors</li>
                      <li>• Apply for 1-2 vendors per month max</li>
                      <li>• Use credit immediately and pay early</li>
                      <li>• Keep utilization under 30%</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Monitoring Tab */}
          {activeTab === 'monitoring' && (
            <div className="space-y-6">
              {/* Monitoring Settings */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Alert Settings</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="flex items-center justify-between">
                      <span className="text-sm font-medium">Score Changes</span>
                      <input type="checkbox" className="toggle" defaultChecked />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-sm font-medium">Payment Reminders</span>
                      <input type="checkbox" className="toggle" defaultChecked />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-sm font-medium">New Tradeline Opportunities</span>
                      <input type="checkbox" className="toggle" defaultChecked />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-sm font-medium">High Utilization Warnings</span>
                      <input type="checkbox" className="toggle" defaultChecked />
                    </label>
                  </div>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between">
                      <span className="text-sm font-medium">New Inquiries</span>
                      <input type="checkbox" className="toggle" defaultChecked />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-sm font-medium">Public Records</span>
                      <input type="checkbox" className="toggle" defaultChecked />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-sm font-medium">Monthly Reports</span>
                      <input type="checkbox" className="toggle" defaultChecked />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-sm font-medium">Bureau Updates</span>
                      <input type="checkbox" className="toggle" />
                    </label>
                  </div>
                </div>
              </div>

              {/* Recent Activity Log */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Activity Log</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium text-gray-700">Date</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-700">Event</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-700">Details</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-700">Impact</th>
                        <th className="text-center px-4 py-3 font-medium text-gray-700">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">2024-01-15</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <TrendingUp className="w-4 h-4 text-green-600 mr-2" />
                            <span className="font-medium">Score Increase</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">Paydex increased from 75 to 80</td>
                        <td className="px-4 py-3">
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                            Positive
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button className="text-blue-600 hover:text-blue-700 text-sm">View</button>
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">2024-01-14</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <CreditCard className="w-4 h-4 text-blue-600 mr-2" />
                            <span className="font-medium">Payment Processed</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">Grainger - $2,450 paid on time</td>
                        <td className="px-4 py-3">
                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                            Neutral
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button className="text-blue-600 hover:text-blue-700 text-sm">Details</button>
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">2024-01-13</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <AlertCircle className="w-4 h-4 text-yellow-600 mr-2" />
                            <span className="font-medium">Utilization Alert</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">Home Depot utilization at 45%</td>
                        <td className="px-4 py-3">
                          <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs">
                            Warning
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button className="text-blue-600 hover:text-blue-700 text-sm">Action</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Monitoring Dashboard */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <span className="text-2xl font-bold">12</span>
                  </div>
                  <div className="font-medium">Positive Changes</div>
                  <div className="text-sm text-gray-600">This month</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <AlertTriangle className="w-8 h-8 text-yellow-600" />
                    <span className="text-2xl font-bold">3</span>
                  </div>
                  <div className="font-medium">Warnings</div>
                  <div className="text-sm text-gray-600">Requires attention</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Bell className="w-8 h-8 text-blue-600" />
                    <span className="text-2xl font-bold">45</span>
                  </div>
                  <div className="font-medium">Total Alerts</div>
                  <div className="text-sm text-gray-600">Last 30 days</div>
                </div>
              </div>
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="space-y-6">
              {/* Document Categories */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 cursor-pointer hover:bg-blue-100 transition-colors">
                  <FileText className="w-8 h-8 text-blue-600 mb-2" />
                  <div className="font-medium">Business Documents</div>
                  <div className="text-sm text-gray-600">12 files</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 cursor-pointer hover:bg-green-100 transition-colors">
                  <Shield className="w-8 h-8 text-green-600 mb-2" />
                  <div className="font-medium">Credit Reports</div>
                  <div className="text-sm text-gray-600">8 files</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 cursor-pointer hover:bg-purple-100 transition-colors">
                  <Award className="w-8 h-8 text-purple-600 mb-2" />
                  <div className="font-medium">Certifications</div>
                  <div className="text-sm text-gray-600">5 files</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 cursor-pointer hover:bg-yellow-100 transition-colors">
                  <Briefcase className="w-8 h-8 text-yellow-600 mb-2" />
                  <div className="font-medium">Vendor Agreements</div>
                  <div className="text-sm text-gray-600">15 files</div>
                </div>
              </div>

              {/* Recent Documents */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Recent Documents</h3>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Document
                  </button>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium text-gray-700">Document Name</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-700">Type</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-700">Date Added</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-700">Size</th>
                        <th className="text-center px-4 py-3 font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <FileText className="w-5 h-5 text-gray-400 mr-2" />
                            <span className="font-medium">DnB Report January 2024</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">Credit Report</td>
                        <td className="px-4 py-3 text-sm">2024-01-15</td>
                        <td className="px-4 py-3 text-sm">2.4 MB</td>
                        <td className="px-4 py-3 text-center">
                          <button className="text-blue-600 hover:text-blue-700 mr-2">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="text-gray-600 hover:text-gray-700 mr-2">
                            <Download className="w-4 h-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <FileText className="w-5 h-5 text-gray-400 mr-2" />
                            <span className="font-medium">Business License 2024</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">License</td>
                        <td className="px-4 py-3 text-sm">2024-01-01</td>
                        <td className="px-4 py-3 text-sm">856 KB</td>
                        <td className="px-4 py-3 text-center">
                          <button className="text-blue-600 hover:text-blue-700 mr-2">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="text-gray-600 hover:text-gray-700 mr-2">
                            <Download className="w-4 h-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Resources Tab */}
          {activeTab === 'resources' && (
            <div className="space-y-6">
              {/* Quick Links */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                <div className="grid grid-cols-3 gap-4">
                  <a href="#" className="border rounded-lg p-4 hover:shadow-md transition-shadow flex items-center justify-between">
                    <div>
                      <div className="font-medium">D&B Portal</div>
                      <div className="text-sm text-gray-600">Access your account</div>
                    </div>
                    <ExternalLink className="w-5 h-5 text-gray-400" />
                  </a>
                  <a href="#" className="border rounded-lg p-4 hover:shadow-md transition-shadow flex items-center justify-between">
                    <div>
                      <div className="font-medium">Experian Business</div>
                      <div className="text-sm text-gray-600">View credit report</div>
                    </div>
                    <ExternalLink className="w-5 h-5 text-gray-400" />
                  </a>
                  <a href="#" className="border rounded-lg p-4 hover:shadow-md transition-shadow flex items-center justify-between">
                    <div>
                      <div className="font-medium">SBA Resources</div>
                      <div className="text-sm text-gray-600">Small business help</div>
                    </div>
                    <ExternalLink className="w-5 h-5 text-gray-400" />
                  </a>
                </div>
              </div>

              {/* Educational Content */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Learning Resources</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-5">
                    <BookOpen className="w-8 h-8 text-blue-600 mb-3" />
                    <h4 className="font-semibold mb-2">Business Credit Guide</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Complete guide to building business credit from scratch
                    </p>
                    <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                      Read Guide →
                    </button>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-5">
                    <Video className="w-8 h-8 text-purple-600 mb-3" />
                    <h4 className="font-semibold mb-2">Video Tutorials</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Watch step-by-step tutorials on credit building strategies
                    </p>
                    <button className="text-purple-600 hover:text-purple-700 font-medium text-sm">
                      Watch Videos →
                    </button>
                  </div>
                </div>
              </div>

              {/* Tools & Calculators */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Tools & Calculators</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4 text-center hover:shadow-md transition-shadow">
                    <Gauge className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <div className="font-medium">Credit Score Simulator</div>
                    <button className="mt-2 text-blue-600 hover:text-blue-700 text-sm">
                      Launch Tool
                    </button>
                  </div>
                  <div className="border rounded-lg p-4 text-center hover:shadow-md transition-shadow">
                    <Hash className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="font-medium">ROI Calculator</div>
                    <button className="mt-2 text-blue-600 hover:text-blue-700 text-sm">
                      Calculate
                    </button>
                  </div>
                  <div className="border rounded-lg p-4 text-center hover:shadow-md transition-shadow">
                    <Target className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <div className="font-medium">Goal Planner</div>
                    <button className="mt-2 text-blue-600 hover:text-blue-700 text-sm">
                      Plan Goals
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Tradeline Modal */}
      {showAddTradeline && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Add New Tradeline</h3>
              <button onClick={() => setShowAddTradeline(false)}>
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vendor Name
                  </label>
                  <input type="text" className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Number
                  </label>
                  <input type="text" className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Credit Type
                  </label>
                  <select className="w-full px-3 py-2 border rounded-lg">
                    <option>Net 30</option>
                    <option>Net 60</option>
                    <option>Net 90</option>
                    <option>Revolving</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select className="w-full px-3 py-2 border rounded-lg">
                    <option>Office Supplies</option>
                    <option>Industrial Supplies</option>
                    <option>Shipping Supplies</option>
                    <option>Building Materials</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Credit Limit
                  </label>
                  <input type="number" className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Balance
                  </label>
                  <input type="number" className="w-full px-3 py-2 border rounded-lg" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reporting Bureaus
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm">D&B</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm">Experian</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm">Equifax</span>
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddTradeline(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Tradeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tradeline Detail Modal */}
      {showDetailModal && selectedTradeline && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">{selectedTradeline.vendor} Details</h3>
              <button onClick={() => setShowDetailModal(false)}>
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Account Information */}
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3">Account Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Account Number:</span>
                    <span className="ml-2 font-medium">{selectedTradeline.accountNumber}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Account Type:</span>
                    <span className="ml-2 font-medium">{selectedTradeline.type}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Established:</span>
                    <span className="ml-2 font-medium">{selectedTradeline.established}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <span className="ml-2 font-medium">{selectedTradeline.status}</span>
                  </div>
                </div>
              </div>

              {/* Credit Information */}
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3">Credit Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Credit Limit:</span>
                    <span className="ml-2 font-medium">${selectedTradeline.creditLimit.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Current Balance:</span>
                    <span className="ml-2 font-medium">${selectedTradeline.balance.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Available Credit:</span>
                    <span className="ml-2 font-medium">
                      ${(selectedTradeline.creditLimit - selectedTradeline.balance).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Utilization:</span>
                    <span className="ml-2 font-medium">{selectedTradeline.utilization}%</span>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3">Payment Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Last Payment:</span>
                    <span className="ml-2 font-medium">{selectedTradeline.lastPayment}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Next Due:</span>
                    <span className="ml-2 font-medium">{selectedTradeline.nextDue}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                  Edit
                </button>
                <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                  Make Payment
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  View History
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessCredit;