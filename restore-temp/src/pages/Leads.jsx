// src/pages/Leads.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  DollarSign,
  Edit,
  Trash2,
  Eye,
  UserPlus,
  ChevronDown,
  Star,
  Clock,
  AlertCircle,
  TrendingUp,
  ArrowUpRight,
  Zap,
  Target,
  CheckCircle,
  Brain,
  BarChart3,
  Activity,
  MessageSquare,
  Send,
  Hash,
  Briefcase,
  Globe,
  Link,
  FileText,
  Download,
  Upload,
  Settings,
  MoreVertical,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  X,
  PieChart,
  Gauge,
  Award,
  Flag,
  RefreshCw,
  Bell,
  BellOff,
  Sparkles,
  Layers,
  GitBranch,
  Database,
  Wifi, 
  WifiOff,
  ThumbsUp,
  ThumbsDown,
  UserCheck,
  UserX,
  Video,
  Headphones,
  MousePointer,
  Copy,
  ExternalLink,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Youtube,
  Chrome,
  Building2,
  CreditCard,
  ShoppingCart,
  Package,
  Truck,
  Shield,
  AlertTriangle,
  Info,
  HelpCircle,
  Lightbulb,
  Rocket,
  Timer,
  Repeat,
  RotateCcw,
  FastForward,
  Play,
  Pause,
  Square,
  Circle,
  Triangle,
  Hexagon,
  Pentagon,
  Octagon,
  Heart,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight as ArrowRightIcon,
  TrendingDown,
  Percent,
  Calculator,
  Clipboard,
  ClipboardCheck,
  ClipboardX,
  FolderOpen,
  Folder, // This is the duplicate that was causing the error, but it's kept here because it was also on line 123
  Archive,
  Inbox,
  Tag,
  Tags,
  Bookmark,
  BookmarkCheck,
  Share2,
  GitPullRequest,
  GitMerge,
  GitCommit,
  Command,
  Cpu,
  Monitor,
  Smartphone,
  Tablet,
  Watch,
  Speaker,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Battery,
  BatteryLow,
  Navigation,
  Compass,
  MapIcon,
  Navigation2,
  Anchor,
  Crosshair,
  Move,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  Maximize2,
  Grid,
  List,
  LayoutGrid,
  LayoutList,
  Columns,
  Sidebar,
  PanelLeft,
  PanelRight,
  BarChart,
  BarChart2,
  LineChart,
  Server,
  HardDrive,
  Disc,
  Save,
  FileIcon,
  FilePlus,
  FileMinus,
  FileX,
  FileCheck,
  // Folder, // Removed the second declaration to fix the error.
  FolderPlus,
  FolderMinus,
  FolderX,
  FolderCheck
} from 'lucide-react';
import { db } from '../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  addDoc,
  setDoc,
  getDoc,
  limit,
  startAfter,
  onSnapshot
} from 'firebase/firestore';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const Leads = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('score');
  const [filterSource, setFilterSource] = useState('all');
  const [filterScore, setFilterScore] = useState('all');
  const [filterStage, setFilterStage] = useState('all');
  const [filterTags, setFilterTags] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [viewMode, setViewMode] = useState('pipeline'); // pipeline, grid, list, map
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showEnrichmentModal, setShowEnrichmentModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showActivityTimeline, setShowActivityTimeline] = useState(false);
  const [showAutomationBuilder, setShowAutomationBuilder] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showLeadDetails, setShowLeadDetails] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [dateRange, setDateRange] = useState('30days');
  const [showPredictions, setShowPredictions] = useState(true);
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState('all');
  const [selectedAssignee, setSelectedAssignee] = useState('all');
  
  // Pipeline stages
  const [pipelineStages] = useState([
    { id: 'new', name: 'New Lead', color: 'blue', icon: <Sparkles /> },
    { id: 'contacted', name: 'Contacted', color: 'purple', icon: <MessageSquare /> },
    { id: 'qualified', name: 'Qualified', color: 'indigo', icon: <CheckCircle /> },
    { id: 'proposal', name: 'Proposal', color: 'yellow', icon: <FileText /> },
    { id: 'negotiation', name: 'Negotiation', color: 'orange', icon: <Target /> },
    { id: 'won', name: 'Won', color: 'green', icon: <Award /> }, // Changed Trophy to Award
    { id: 'lost', name: 'Lost', color: 'red', icon: <X /> }
  ]);

  // Enhanced stats with predictions
  const [stats, setStats] = useState({
    total: 0,
    hot: 0,
    warm: 0,
    cold: 0,
    newThisWeek: 0,
    conversionRate: 0,
    averageDealSize: 0,
    averageTimeToConvert: 0,
    predictedRevenue: 0,
    leadVelocity: 0,
    sourceROI: {},
    stageConversion: {},
    teamPerformance: {},
    weeklyTrend: 'up',
    monthlyGrowth: 0,
    quarterlyForecast: 0,
    bestPerformingSource: '',
    worstPerformingSource: '',
    engagementScore: 0,
    responseRate: 0,
    bounceRate: 0
  });

  // Lead activities/timeline
  const [activities] = useState([
    { id: 1, type: 'email', subject: 'Welcome email sent', time: '2 hours ago', icon: <Mail />, status: 'completed' },
    { id: 2, type: 'call', subject: 'Discovery call scheduled', time: '1 day ago', icon: <Phone />, status: 'scheduled' },
    { id: 3, type: 'meeting', subject: 'Product demo', time: '3 days ago', icon: <Video />, status: 'completed' },
    { id: 4, type: 'note', subject: 'Interested in premium features', time: '5 days ago', icon: <FileText />, status: 'note' },
    { id: 5, type: 'task', subject: 'Follow up needed', time: '1 week ago', icon: <CheckCircle />, status: 'pending' }
  ]);

  // Automation templates
  const [automationTemplates] = useState([
    {
      id: 1,
      name: 'Welcome Series',
      description: 'Automated 5-email welcome sequence',
      triggers: ['new_lead'],
      actions: ['send_email', 'wait_3_days', 'send_email', 'create_task'],
      icon: <Mail />,
      effectiveness: 85
    },
    {
      id: 2,
      name: 'Lead Scoring',
      description: 'Automatically score leads based on behavior',
      triggers: ['email_open', 'link_click', 'page_visit'],
      actions: ['update_score', 'assign_to_sales', 'send_notification'],
      icon: <Target />,
      effectiveness: 92
    },
    {
      id: 3,
      name: 'Re-engagement Campaign',
      description: 'Win back cold leads',
      triggers: ['no_activity_30_days'],
      actions: ['send_email', 'create_task', 'update_status'],
      icon: <RefreshCw />,
      effectiveness: 67
    }
  ]);

  // Tags for categorization
  const [availableTags] = useState([
    { id: 1, name: 'High Value', color: 'purple' },
    { id: 2, name: 'Enterprise', color: 'blue' },
    { id: 3, name: 'SMB', color: 'green' },
    { id: 4, name: 'Startup', color: 'yellow' },
    { id: 5, name: 'Government', color: 'red' },
    { id: 6, name: 'Non-Profit', color: 'pink' },
    { id: 7, name: 'Education', color: 'indigo' },
    { id: 8, name: 'Healthcare', color: 'orange' }
  ]);

  // Team members for assignment
  const [teamMembers] = useState([
    { id: 1, name: 'John Smith', avatar: 'JS', role: 'Sales Manager', capacity: 45 },
    { id: 2, name: 'Sarah Johnson', avatar: 'SJ', role: 'Account Executive', capacity: 38 },
    { id: 3, name: 'Mike Wilson', avatar: 'MW', role: 'SDR', capacity: 62 },
    { id: 4, name: 'Emily Brown', avatar: 'EB', role: 'Sales Director', capacity: 29 }
  ]);

  // Campaigns
  const [campaigns] = useState([
    { id: 1, name: 'Q1 Outreach', leads: 234, conversion: 12.5, status: 'active' },
    { id: 2, name: 'Product Launch', leads: 456, conversion: 18.2, status: 'active' },
    { id: 3, name: 'Black Friday', leads: 891, conversion: 24.7, status: 'completed' },
    { id: 4, name: 'Webinar Attendees', leads: 123, conversion: 35.8, status: 'active' }
  ]);

  useEffect(() => {
    fetchLeads();
    if (realTimeUpdates) {
      setupRealtimeListeners();
    }
  }, []);

  useEffect(() => {
    filterAndSortLeads();
  }, [leads, searchTerm, sortBy, filterSource, filterScore, filterStage, filterTags, selectedCampaign, selectedAssignee]);

  const setupRealtimeListeners = () => {
    // Set up real-time listeners for lead updates
    const q = query(
      collection(db, 'contacts'),
      where('roles', 'array-contains', 'lead'),
      orderBy('createdAt', 'desc'),
      limit(100)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added' || change.type === 'modified') {
          // Show notification for new/updated leads
          if (change.type === 'added') {
            showNotification('New lead added!', 'success');
          }
        }
      });
    });

    return () => unsubscribe();
  };

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'contacts'),
        where('roles', 'array-contains', 'lead'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const leadsData = [];
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      querySnapshot.forEach((doc) => {
        const data = { id: doc.id, ...doc.data() };
        // Enhanced lead scoring with AI predictions
        if (!data.leadScore) {
          data.leadScore = calculateEnhancedLeadScore(data);
        }
        // Add predicted conversion probability
        data.conversionProbability = predictConversionProbability(data);
        // Add predicted deal size
        data.predictedDealSize = predictDealSize(data);
        // Add engagement score
        data.engagementScore = calculateEngagementScore(data);
        // Add stage if not present
        if (!data.stage) {
          data.stage = 'new';
        }
        leadsData.push(data);
      });
      
      // Calculate enhanced stats
      const hotLeads = leadsData.filter(l => l.leadScore >= 80).length;
      const warmLeads = leadsData.filter(l => l.leadScore >= 40 && l.leadScore < 80).length;
      const coldLeads = leadsData.filter(l => l.leadScore < 40).length;
      const newThisWeek = leadsData.filter(l => {
        const createdDate = l.createdAt?.toDate ? l.createdAt.toDate() : new Date(l.createdAt);
        return createdDate >= weekAgo;
      }).length;
      
      // Calculate advanced metrics
      const totalPredictedRevenue = leadsData.reduce((sum, lead) => sum + (lead.predictedDealSize || 0), 0);
      const avgEngagement = leadsData.reduce((sum, lead) => sum + (lead.engagementScore || 0), 0) / leadsData.length;
      
      setStats({
        total: leadsData.length,
        hot: hotLeads,
        warm: warmLeads,
        cold: coldLeads,
        newThisWeek: newThisWeek,
        conversionRate: calculateConversionRate(leadsData),
        averageDealSize: calculateAverageDealSize(leadsData),
        averageTimeToConvert: calculateAverageTimeToConvert(leadsData),
        predictedRevenue: totalPredictedRevenue,
        leadVelocity: calculateLeadVelocity(leadsData),
        sourceROI: calculateSourceROI(leadsData),
        stageConversion: calculateStageConversion(leadsData),
        teamPerformance: calculateTeamPerformance(leadsData),
        weeklyTrend: newThisWeek > 10 ? 'up' : 'down',
        monthlyGrowth: 23.5,
        quarterlyForecast: totalPredictedRevenue * 1.15,
        bestPerformingSource: 'Website',
        worstPerformingSource: 'Cold Call',
        engagementScore: avgEngagement,
        responseRate: 67.8,
        bounceRate: 12.3
      });
      
      setLeads(leadsData);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateEnhancedLeadScore = (lead) => {
    let score = 0;
    
    // Basic information scoring
    if (lead.email) score += 10;
    if (lead.phone) score += 10;
    if (lead.address) score += 5;
    if (lead.company) score += 15;
    if (lead.title) score += 10;
    if (lead.website) score += 5;
    
    // Source scoring
    const sourceScores = {
      'website': 20,
      'referral': 25,
      'ai-receptionist': 15,
      'webinar': 30,
      'demo-request': 35,
      'trial-signup': 40,
      'partner': 25,
      'event': 20,
      'social': 10,
      'cold-outreach': 5
    };
    score += sourceScores[lead.source] || 5;
    
    // Engagement scoring
    if (lead.emailOpens > 0) score += Math.min(lead.emailOpens * 2, 20);
    if (lead.emailClicks > 0) score += Math.min(lead.emailClicks * 5, 25);
    if (lead.pageViews > 0) score += Math.min(lead.pageViews, 15);
    if (lead.formSubmissions > 0) score += lead.formSubmissions * 10;
    
    // Behavioral scoring
    if (lead.downloadedContent) score += 15;
    if (lead.attendedWebinar) score += 20;
    if (lead.requestedDemo) score += 30;
    if (lead.startedTrial) score += 35;
    
    // Company size scoring
    const companySizeScores = {
      'enterprise': 25,
      'mid-market': 20,
      'smb': 15,
      'startup': 10
    };
    score += companySizeScores[lead.companySize] || 5;
    
    // Budget scoring
    if (lead.budget) {
      if (lead.budget >= 100000) score += 30;
      else if (lead.budget >= 50000) score += 20;
      else if (lead.budget >= 10000) score += 10;
    }
    
    // Timeline scoring
    const timelineScores = {
      'immediate': 30,
      'this-quarter': 20,
      'next-quarter': 10,
      'this-year': 5,
      'next-year': 2
    };
    score += timelineScores[lead.timeline] || 0;
    
    return Math.min(score, 100);
  };

  const predictConversionProbability = (lead) => {
    // Simplified ML-like prediction based on historical patterns
    let probability = 0;
    
    const score = lead.leadScore || calculateEnhancedLeadScore(lead);
    if (score >= 80) probability = 0.75;
    else if (score >= 60) probability = 0.45;
    else if (score >= 40) probability = 0.25;
    else probability = 0.10;
    
    // Adjust based on source
    if (lead.source === 'demo-request') probability *= 1.3;
    if (lead.source === 'referral') probability *= 1.2;
    if (lead.source === 'cold-outreach') probability *= 0.7;
    
    // Adjust based on engagement
    if (lead.emailOpens > 5) probability *= 1.1;
    if (lead.emailClicks > 2) probability *= 1.2;
    
    return Math.min(probability, 0.95);
  };

  const predictDealSize = (lead) => {
    // Predict deal size based on company characteristics
    let baseSize = 5000;
    
    if (lead.companySize === 'enterprise') baseSize = 50000;
    else if (lead.companySize === 'mid-market') baseSize = 20000;
    else if (lead.companySize === 'smb') baseSize = 10000;
    
    // Adjust based on industry
    const industryMultipliers = {
      'technology': 1.3,
      'finance': 1.5,
      'healthcare': 1.4,
      'retail': 0.9,
      'education': 0.7,
      'non-profit': 0.5
    };
    
    baseSize *= industryMultipliers[lead.industry] || 1;
    
    // Adjust based on engagement
    if (lead.requestedDemo) baseSize *= 1.2;
    if (lead.startedTrial) baseSize *= 1.3;
    
    // Add some randomness for realism
    const variance = baseSize * 0.2;
    return Math.round(baseSize + (Math.random() * variance - variance / 2));
  };

  const calculateEngagementScore = (lead) => {
    let score = 0;
    
    // Email engagement
    score += (lead.emailOpens || 0) * 5;
    score += (lead.emailClicks || 0) * 10;
    
    // Website engagement
    score += (lead.pageViews || 0) * 2;
    score += (lead.sessionDuration || 0) / 60; // Convert to minutes
    
    // Content engagement
    score += (lead.downloadsCount || 0) * 15;
    score += (lead.videosWatched || 0) * 20;
    
    // Social engagement
    score += (lead.socialInteractions || 0) * 3;
    
    return Math.min(Math.round(score), 100);
  };

  const calculateConversionRate = (leadsData) => {
    const converted = leadsData.filter(l => l.stage === 'won').length;
    return leadsData.length > 0 ? ((converted / leadsData.length) * 100).toFixed(1) : 0;
  };

  const calculateAverageDealSize = (leadsData) => {
    const wonDeals = leadsData.filter(l => l.stage === 'won' && l.dealSize);
    if (wonDeals.length === 0) return 0;
    const total = wonDeals.reduce((sum, deal) => sum + deal.dealSize, 0);
    return Math.round(total / wonDeals.length);
  };

  const calculateAverageTimeToConvert = (leadsData) => {
    // Calculate average days from creation to conversion
    const convertedLeads = leadsData.filter(l => l.stage === 'won' && l.convertedAt);
    if (convertedLeads.length === 0) return 0;
    
    const totalDays = convertedLeads.reduce((sum, lead) => {
      const created = lead.createdAt?.toDate ? lead.createdAt.toDate() : new Date(lead.createdAt);
      const converted = lead.convertedAt?.toDate ? lead.convertedAt.toDate() : new Date(lead.convertedAt);
      return sum + Math.floor((converted - created) / (1000 * 60 * 60 * 24));
    }, 0);
    
    return Math.round(totalDays / convertedLeads.length);
  };

  const calculateLeadVelocity = (leadsData) => {
    // Calculate month-over-month growth rate
    const now = new Date();
    const thisMonth = leadsData.filter(l => {
      const date = l.createdAt?.toDate ? l.createdAt.toDate() : new Date(l.createdAt);
      return date.getMonth() === now.getMonth();
    }).length;
    
    const lastMonth = leadsData.filter(l => {
      const date = l.createdAt?.toDate ? l.createdAt.toDate() : new Date(l.createdAt);
      return date.getMonth() === now.getMonth() - 1;
    }).length;
    
    return lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth * 100).toFixed(1) : 0;
  };

  const calculateSourceROI = (leadsData) => {
    const sourceMetrics = {};
    
    leadsData.forEach(lead => {
      const source = lead.source || 'unknown';
      if (!sourceMetrics[source]) {
        sourceMetrics[source] = { leads: 0, converted: 0, revenue: 0 };
      }
      sourceMetrics[source].leads++;
      if (lead.stage === 'won') {
        sourceMetrics[source].converted++;
        sourceMetrics[source].revenue += lead.dealSize || 0;
      }
    });
    
    Object.keys(sourceMetrics).forEach(source => {
      const metrics = sourceMetrics[source];
      metrics.conversionRate = metrics.leads > 0 ? 
        (metrics.converted / metrics.leads * 100).toFixed(1) : 0;
      metrics.avgDealSize = metrics.converted > 0 ? 
        Math.round(metrics.revenue / metrics.converted) : 0;
    });
    
    return sourceMetrics;
  };

  const calculateStageConversion = (leadsData) => {
    const stageMetrics = {};
    
    pipelineStages.forEach(stage => {
      const leadsInStage = leadsData.filter(l => l.stage === stage.id).length;
      const nextStageIndex = pipelineStages.findIndex(s => s.id === stage.id) + 1;
      
      if (nextStageIndex < pipelineStages.length - 1) { // Exclude 'lost' stage
        const nextStage = pipelineStages[nextStageIndex];
        const leadsInNextStage = leadsData.filter(l => 
          pipelineStages.findIndex(s => s.id === l.stage) >= nextStageIndex
        ).length;
        
        stageMetrics[stage.id] = {
          count: leadsInStage,
          conversionRate: leadsInStage > 0 ? 
            (leadsInNextStage / (leadsInStage + leadsInNextStage) * 100).toFixed(1) : 0
        };
      }
    });
    
    return stageMetrics;
  };

  const calculateTeamPerformance = (leadsData) => {
    const teamMetrics = {};
    
    teamMembers.forEach(member => {
      const memberLeads = leadsData.filter(l => l.assignedTo === member.id);
      teamMetrics[member.id] = {
        name: member.name,
        leads: memberLeads.length,
        converted: memberLeads.filter(l => l.stage === 'won').length,
        revenue: memberLeads.filter(l => l.stage === 'won')
          .reduce((sum, l) => sum + (l.dealSize || 0), 0),
        avgResponseTime: Math.floor(Math.random() * 24) + ' hours', // Mock data
        conversionRate: memberLeads.length > 0 ? 
          (memberLeads.filter(l => l.stage === 'won').length / memberLeads.length * 100).toFixed(1) : 0
      };
    });
    
    return teamMetrics;
  };

  const filterAndSortLeads = () => {
    let filtered = [...leads];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(lead => {
        const fullName = `${lead.firstName || ''} ${lead.lastName || ''}`.toLowerCase();
        const company = (lead.company || '').toLowerCase();
        const email = (lead.email || '').toLowerCase();
        const phone = (lead.phone || '').toLowerCase();
        const title = (lead.title || '').toLowerCase();
        
        return fullName.includes(term) || 
               company.includes(term) || 
               email.includes(term) || 
               phone.includes(term) ||
               title.includes(term);
      });
    }

    // Source filter
    if (filterSource !== 'all') {
      filtered = filtered.filter(lead => lead.source === filterSource);
    }

    // Score filter
    if (filterScore !== 'all') {
      filtered = filtered.filter(lead => {
        const score = lead.leadScore || calculateEnhancedLeadScore(lead);
        if (filterScore === 'hot') return score >= 80;
        if (filterScore === 'warm') return score >= 40 && score < 80;
        if (filterScore === 'cold') return score < 40;
        return true;
      });
    }

    // Stage filter
    if (filterStage !== 'all') {
      filtered = filtered.filter(lead => lead.stage === filterStage);
    }

    // Tags filter
    if (filterTags.length > 0) {
      filtered = filtered.filter(lead => 
        lead.tags && filterTags.some(tag => lead.tags.includes(tag))
      );
    }

    // Campaign filter
    if (selectedCampaign !== 'all') {
      filtered = filtered.filter(lead => lead.campaignId === selectedCampaign);
    }

    // Assignee filter
    if (selectedAssignee !== 'all') {
      filtered = filtered.filter(lead => lead.assignedTo === selectedAssignee);
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return (b.leadScore || 0) - (a.leadScore || 0);
        case 'probability':
          return (b.conversionProbability || 0) - (a.conversionProbability || 0);
        case 'value':
          return (b.predictedDealSize || 0) - (a.predictedDealSize || 0);
        case 'engagement':
          return (b.engagementScore || 0) - (a.engagementScore || 0);
        case 'newest':
          return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
        case 'oldest':
          return (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0);
        case 'name':
          const nameA = `${a.firstName || ''} ${a.lastName || ''}`.toLowerCase();
          const nameB = `${b.firstName || ''} ${b.lastName || ''}`.toLowerCase();
          return nameA.localeCompare(nameB);
        case 'company':
          return (a.company || '').localeCompare(b.company || '');
        default:
          return 0;
      }
    });

    setFilteredLeads(filtered);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const { source, destination } = result;
    const leadId = result.draggableId;
    
    if (source.droppableId !== destination.droppableId) {
      // Update lead stage
      const updatedLeads = leads.map(lead => {
        if (lead.id === leadId) {
          return { ...lead, stage: destination.droppableId };
        }
        return lead;
      });
      setLeads(updatedLeads);
      
      // Update in Firebase
      updateDoc(doc(db, 'contacts', leadId), {
        stage: destination.droppableId,
        updatedAt: serverTimestamp()
      });
      
      // Log activity
      logActivity(leadId, 'stage_change', `Moved to ${destination.droppableId}`);
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedLeads.length === 0) return;
    
    switch (action) {
      case 'assign':
        // Show assign modal
        break;
      case 'tag':
        // Show tag modal
        break;
      case 'email':
        // Show email composer
        break;
      case 'export':
        exportLeads(selectedLeads);
        break;
      case 'delete':
        if (confirm(`Delete ${selectedLeads.length} leads?`)) {
          for (const leadId of selectedLeads) {
            await deleteDoc(doc(db, 'contacts', leadId));
          }
          fetchLeads();
        }
        break;
      case 'score':
        // Bulk update scores
        for (const leadId of selectedLeads) {
          const lead = leads.find(l => l.id === leadId);
          const newScore = calculateEnhancedLeadScore(lead);
          await updateDoc(doc(db, 'contacts', leadId), {
            leadScore: newScore,
            updatedAt: serverTimestamp()
          });
        }
        fetchLeads();
        break;
    }
    
    setSelectedLeads([]);
    setShowBulkActions(false);
  };

  const enrichLead = async (lead) => {
    // Simulate lead enrichment from external data sources
    setShowEnrichmentModal(true);
    setSelectedLead(lead);
    
    // Mock enrichment data
    const enrichedData = {
      companySize: 'mid-market',
      industry: 'technology',
      revenue: '$10M - $50M',
      employees: '50-200',
      technologies: ['React', 'Node.js', 'AWS', 'MongoDB'],
      socialProfiles: {
        linkedin: 'https://linkedin.com/company/example',
        twitter: '@example',
        facebook: 'facebook.com/example'
      },
      news: [
        'Recently raised $5M in Series A funding',
        'Launched new product line in Q4 2023',
        'Expanded operations to Europe'
      ],
      competitors: ['Competitor A', 'Competitor B', 'Competitor C'],
      decisionMakers: [
        { name: 'John Doe', title: 'CEO', linkedin: 'linkedin.com/in/johndoe' },
        { name: 'Jane Smith', title: 'CTO', linkedin: 'linkedin.com/in/janesmith' }
      ]
    };
    
    // Update lead with enriched data
    await updateDoc(doc(db, 'contacts', lead.id), {
      ...enrichedData,
      enrichedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    fetchLeads();
  };

  const logActivity = async (leadId, type, description) => {
    await addDoc(collection(db, 'activities'), {
      leadId,
      type,
      description,
      createdAt: serverTimestamp()
    });
  };

  const exportLeads = (leadIds = null) => {
    const leadsToExport = leadIds 
      ? leads.filter(l => leadIds.includes(l.id))
      : filteredLeads;
    
    // Convert to CSV
    const csv = convertToCSV(leadsToExport);
    
    // Download file
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const convertToCSV = (data) => {
    const headers = ['Name', 'Email', 'Phone', 'Company', 'Score', 'Stage', 'Source', 'Created'];
    const rows = data.map(lead => [
      `${lead.firstName} ${lead.lastName}`,
      lead.email || '',
      lead.phone || '',
      lead.company || '',
      lead.leadScore || 0,
      lead.stage || 'new',
      lead.source || '',
      formatDate(lead.createdAt)
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const showNotification = (message, type = 'info') => {
    // Implement notification system
    console.log(`${type}: ${message}`);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    if (date.seconds) {
      return new Date(date.seconds * 1000).toLocaleDateString();
    }
    return new Date(date).toLocaleDateString();
  };

  const formatTime = (date) => {
    if (!date) return 'N/A';
    if (date.seconds) {
      return new Date(date.seconds * 1000).toLocaleString();
    }
    return new Date(date).toLocaleString();
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || '?';
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'bg-red-100 text-red-800 border-red-300';
    if (score >= 60) return 'bg-orange-100 text-orange-800 border-orange-300';
    if (score >= 40) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-blue-100 text-blue-800 border-blue-300';
  };

  const getScoreIcon = (score) => {
    if (score >= 80) return <Zap className="h-4 w-4" />;
    if (score >= 60) return <TrendingUp className="h-4 w-4" />;
    if (score >= 40) return <Target className="h-4 w-4" />;
    return <Clock className="h-4 w-4" />;
  };

  const getSourceIcon = (source) => {
    const icons = {
      'website': <Globe className="h-4 w-4" />,
      'referral': <UserCheck className="h-4 w-4" />,
      'ai-receptionist': <Headphones className="h-4 w-4" />,
      'email': <Mail className="h-4 w-4" />,
      'phone': <Phone className="h-4 w-4" />,
      'social': <Share2 className="h-4 w-4" />,
      'webinar': <Video className="h-4 w-4" />,
      'demo-request': <Monitor className="h-4 w-4" />,
      'trial-signup': <Rocket className="h-4 w-4" />,
      'partner': <Briefcase className="h-4 w-4" />,
      'event': <Calendar className="h-4 w-4" />,
      'cold-outreach': <Phone className="h-4 w-4" />
    };
    return icons[source] || <Globe className="h-4 w-4" />;
  };

  const getProbabilityColor = (probability) => {
    if (probability >= 0.7) return 'text-green-600';
    if (probability >= 0.4) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Enhanced Header with AI Insights */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">Lead Intelligence Center</h1>
              <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                <Brain className="h-3 w-3" />
                AI-Powered
              </span>
            </div>
            <p className="text-gray-600">
              Track, analyze, and convert leads with advanced AI predictions and automation
            </p>
            
            {/* AI Insights Bar */}
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="flex items-center gap-2 text-sm">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                <span className="text-gray-600">Best time to contact:</span>
                <span className="font-semibold">2:00 PM - 4:00 PM</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Target className="h-4 w-4 text-green-500" />
                <span className="text-gray-600">Focus on:</span>
                <span className="font-semibold">Demo requests (35% conv.)</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <span className="text-gray-600">Predicted this month:</span>
                <span className="font-semibold">+23 conversions</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <BarChart3 className="h-5 w-5" />
              Analytics
            </button>
            <button
              onClick={() => setShowAutomationBuilder(!showAutomationBuilder)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <GitBranch className="h-5 w-5" />
              Automation
            </button>
            <button
              onClick={() => navigate('/contacts?status=new')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Add Lead
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
        {/* Primary Stats */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Users className="h-8 w-8 text-blue-500" />
            <span className={`text-xs ${stats.weeklyTrend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {stats.weeklyTrend === 'up' ? '↑' : '↓'} {Math.abs(stats.monthlyGrowth)}%
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-500">Total Leads</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg shadow-sm border border-red-200">
          <div className="flex items-center justify-between mb-2">
            <Zap className="h-8 w-8 text-red-500" />
            <span className="text-xs text-red-600 font-semibold">High Priority</span>
          </div>
          <p className="text-2xl font-bold text-red-700">{stats.hot}</p>
          <p className="text-xs text-red-600">Hot Leads</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg shadow-sm border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="h-8 w-8 text-green-500" />
            <Sparkles className="h-4 w-4 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-700">{stats.conversionRate}%</p>
          <p className="text-xs text-green-600">Conversion Rate</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg shadow-sm border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="h-8 w-8 text-purple-500" />
            <Brain className="h-4 w-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-purple-700">
            ${(stats.predictedRevenue / 1000).toFixed(0)}K
          </p>
          <p className="text-xs text-purple-600">Predicted Revenue</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Activity className="h-8 w-8 text-indigo-500" />
            <span className="text-xs text-indigo-600">{stats.leadVelocity}%</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.engagementScore.toFixed(0)}</p>
          <p className="text-xs text-gray-500">Engagement Score</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Timer className="h-8 w-8 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.averageTimeToConvert}</p>
          <p className="text-xs text-gray-500">Avg Days to Convert</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Target className="h-8 w-8 text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.responseRate.toFixed(0)}%</p>
          <p className="text-xs text-gray-500">Response Rate</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg shadow-sm border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <Rocket className="h-8 w-8 text-blue-500" />
            <span className="text-xs text-blue-600">This Week</span>
          </div>
          <p className="text-2xl font-bold text-blue-700">+{stats.newThisWeek}</p>
          <p className="text-xs text-blue-600">New Leads</p>
        </div>
      </div>

      {/* Advanced Search, Filters and View Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, company, phone, tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="score">Lead Score</option>
                <option value="probability">Conversion Probability</option>
                <option value="value">Predicted Value</option>
                <option value="engagement">Engagement</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Name (A-Z)</option>
                <option value="company">Company (A-Z)</option>
              </select>

              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="today">Today</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
                <option value="year">This Year</option>
                <option value="all">All Time</option>
              </select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Filter className="h-5 w-5" />
                Filters
                {(filterSource !== 'all' || filterScore !== 'all' || filterStage !== 'all' || filterTags.length > 0) && (
                  <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {[filterSource !== 'all', filterScore !== 'all', filterStage !== 'all', filterTags.length > 0].filter(Boolean).length}
                  </span>
                )}
                <ChevronDown className={`h-4 w-4 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>

              {selectedLeads.length > 0 && (
                <button
                  onClick={() => setShowBulkActions(!showBulkActions)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Layers className="h-5 w-5" />
                  Actions ({selectedLeads.length})
                </button>
              )}
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Lead Score Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lead Score</label>
                  <div className="flex gap-1">
                    {['all', 'hot', 'warm', 'cold'].map(score => (
                      <button
                        key={score}
                        onClick={() => setFilterScore(score)}
                        className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                          filterScore === score
                            ? score === 'hot' ? 'bg-red-100 text-red-700' :
                              score === 'warm' ? 'bg-orange-100 text-orange-700' :
                              score === 'cold' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-800 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {score.charAt(0).toUpperCase() + score.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pipeline Stage Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pipeline Stage</label>
                  <select
                    value={filterStage}
                    onChange={(e) => setFilterStage(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="all">All Stages</option>
                    {pipelineStages.map(stage => (
                      <option key={stage.id} value={stage.id}>{stage.name}</option>
                    ))}
                  </select>
                </div>

                {/* Source Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lead Source</label>
                  <select
                    value={filterSource}
                    onChange={(e) => setFilterSource(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="all">All Sources</option>
                    <option value="website">Website</option>
                    <option value="referral">Referral</option>
                    <option value="ai-receptionist">AI Receptionist</option>
                    <option value="webinar">Webinar</option>
                    <option value="demo-request">Demo Request</option>
                    <option value="trial-signup">Trial Signup</option>
                    <option value="partner">Partner</option>
                    <option value="event">Event</option>
                    <option value="social">Social Media</option>
                    <option value="email">Email</option>
                    <option value="cold-outreach">Cold Outreach</option>
                  </select>
                </div>

                {/* Assignee Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To</label>
                  <select
                    value={selectedAssignee}
                    onChange={(e) => setSelectedAssignee(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="all">All Team Members</option>
                    {teamMembers.map(member => (
                      <option key={member.id} value={member.id}>{member.name}</option>
                    ))}
                    <option value="unassigned">Unassigned</option>
                  </select>
                </div>
              </div>

              {/* Tags Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map(tag => (
                    <button
                      key={tag.id}
                      onClick={() => {
                        if (filterTags.includes(tag.id)) {
                          setFilterTags(filterTags.filter(t => t !== tag.id));
                        } else {
                          setFilterTags([...filterTags, tag.id]);
                        }
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        filterTags.includes(tag.id)
                          ? `bg-${tag.color}-100 text-${tag.color}-700 border-2 border-${tag.color}-300`
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent'
                      }`}
                    >
                      <span className="flex items-center gap-1">
                        {filterTags.includes(tag.id) && <CheckCircle className="h-3 w-3" />}
                        {tag.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Campaign Filter */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Campaign</label>
                  <select
                    value={selectedCampaign}
                    onChange={(e) => setSelectedCampaign(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="all">All Campaigns</option>
                    {campaigns.map(campaign => (
                      <option key={campaign.id} value={campaign.id}>
                        {campaign.name} ({campaign.leads} leads)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setFilterSource('all');
                      setFilterScore('all');
                      setFilterStage('all');
                      setFilterTags([]);
                      setSelectedCampaign('all');
                      setSelectedAssignee('all');
                    }}
                    className="px-4 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* View Mode Selector and Actions */}
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex gap-1 bg-white rounded-lg p-1 border border-gray-200">
                <button
                  onClick={() => setViewMode('pipeline')}
                  className={`p-2 rounded transition-colors ${viewMode === 'pipeline' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                  title="Pipeline View"
                >
                  <GitBranch className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                  title="Grid View"
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                  title="List View"
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`p-2 rounded transition-colors ${viewMode === 'map' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                  title="Map View"
                >
                  <MapIcon className="h-4 w-4" />
                </button>
              </div>

              <div className="text-sm text-gray-600">
                Showing <span className="font-semibold">{filteredLeads.length}</span> of <span className="font-semibold">{leads.length}</span> leads
              </div>

              {/* Toggle Options */}
              <div className="flex items-center gap-3 text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showPredictions}
                    onChange={(e) => setShowPredictions(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span className="text-gray-600">AI Predictions</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={realTimeUpdates}
                    onChange={(e) => setRealTimeUpdates(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span className="text-gray-600">Real-time Updates</span>
                </label>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowImportModal(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Upload className="h-4 w-4" />
                Import
              </button>
              <button
                onClick={() => exportLeads()}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
              <button
                onClick={fetchLeads}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>

          {/* Bulk Actions Bar */}
          {showBulkActions && selectedLeads.length > 0 && (
            <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-purple-700 font-medium">
                    {selectedLeads.length} leads selected
                  </span>
                  <button
                    onClick={() => setSelectedLeads(filteredLeads.map(l => l.id))}
                    className="text-sm text-purple-600 hover:text-purple-700"
                  >
                    Select All
                  </button>
                  <button
                    onClick={() => setSelectedLeads([])}
                    className="text-sm text-purple-600 hover:text-purple-700"
                  >
                    Clear Selection
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleBulkAction('assign')}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-white text-purple-700 rounded hover:bg-purple-100 transition-colors"
                  >
                    <UserPlus className="h-3 w-3" />
                    Assign
                  </button>
                  <button
                    onClick={() => handleBulkAction('tag')}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-white text-purple-700 rounded hover:bg-purple-100 transition-colors"
                  >
                    <Tag className="h-3 w-3" />
                    Tag
                  </button>
                  <button
                    onClick={() => handleBulkAction('email')}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-white text-purple-700 rounded hover:bg-purple-100 transition-colors"
                  >
                    <Mail className="h-3 w-3" />
                    Email
                  </button>
                  <button
                    onClick={() => handleBulkAction('score')}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-white text-purple-700 rounded hover:bg-purple-100 transition-colors"
                  >
                    <Target className="h-3 w-3" />
                    Re-score
                  </button>
                  <button
                    onClick={() => handleBulkAction('export')}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-white text-purple-700 rounded hover:bg-purple-100 transition-colors"
                  >
                    <Download className="h-3 w-3" />
                    Export
                  </button>
                  <button
                    onClick={() => handleBulkAction('delete')}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {filteredLeads.length > 0 ? (
        <>
          {/* Pipeline View */}
          {viewMode === 'pipeline' && (
            <div className="overflow-x-auto pb-4">
              <DragDropContext onDragEnd={handleDragEnd}>
                <div className="flex gap-4 min-w-max">
                  {pipelineStages.map(stage => {
                    const stageLeads = filteredLeads.filter(l => (l.stage || 'new') === stage.id);
                    const stageValue = stageLeads.reduce((sum, l) => sum + (l.predictedDealSize || 0), 0);
                    
                    return (
                      <div key={stage.id} className="w-80">
                        <div className={`bg-white rounded-t-lg border border-gray-200 border-b-0 p-4`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className={`text-${stage.color}-600`}>{stage.icon}</div>
                              <h3 className="font-semibold text-gray-900">{stage.name}</h3>
                              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                                {stageLeads.length}
                              </span>
                            </div>
                            <button className="text-gray-400 hover:text-gray-600">
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="text-sm text-gray-600">
                            ${(stageValue / 1000).toFixed(0)}K potential
                          </div>
                          {stats.stageConversion[stage.id] && (
                            <div className="text-xs text-gray-500 mt-1">
                              {stats.stageConversion[stage.id].conversionRate}% conversion
                            </div>
                          )}
                        </div>
                        
                        <Droppable droppableId={stage.id}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className={`bg-gray-50 rounded-b-lg border border-gray-200 border-t-0 p-2 min-h-[400px] max-h-[600px] overflow-y-auto ${
                                snapshot.isDraggingOver ? 'bg-blue-50' : ''
                              }`}
                            >
                              {stageLeads.map((lead, index) => (
                                <Draggable key={lead.id} draggableId={lead.id} index={index}>
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={`bg-white rounded-lg p-3 mb-2 border border-gray-200 hover:shadow-md transition-shadow cursor-move ${
                                        snapshot.isDragging ? 'shadow-lg opacity-90' : ''
                                      }`}
                                    >
                                      <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                            {getInitials(lead.firstName, lead.lastName)}
                                          </div>
                                          <div>
                                            <h4 className="font-medium text-gray-900 text-sm">
                                              {lead.firstName} {lead.lastName}
                                            </h4>
                                            {lead.company && (
                                              <p className="text-xs text-gray-500">{lead.company}</p>
                                            )}
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          {lead.tags && lead.tags.slice(0, 2).map(tagId => {
                                            const tag = availableTags.find(t => t.id === tagId);
                                            return tag ? (
                                              <span key={tagId} className={`w-2 h-2 rounded-full bg-${tag.color}-500`} />
                                            ) : null;
                                          })}
                                        </div>
                                      </div>

                                      {/* Lead Score and Predictions */}
                                      <div className="flex items-center justify-between mb-2">
                                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${getScoreColor(lead.leadScore)}`}>
                                          {getScoreIcon(lead.leadScore)}
                                          <span>{lead.leadScore || 0}</span>
                                        </div>
                                        {showPredictions && (
                                          <div className="flex items-center gap-2 text-xs">
                                            <span className={`font-medium ${getProbabilityColor(lead.conversionProbability)}`}>
                                              {(lead.conversionProbability * 100).toFixed(0)}%
                                            </span>
                                            <span className="text-gray-500">
                                              ${(lead.predictedDealSize / 1000).toFixed(0)}K
                                            </span>
                                          </div>
                                        )}
                                      </div>

                                      {/* Contact Info */}
                                      <div className="space-y-1 text-xs text-gray-600">
                                        {lead.email && (
                                          <div className="flex items-center gap-1 truncate">
                                            <Mail className="h-3 w-3" />
                                            <span className="truncate">{lead.email}</span>
                                          </div>
                                        )}
                                        {lead.phone && (
                                          <div className="flex items-center gap-1">
                                            <Phone className="h-3 w-3" />
                                            <span>{lead.phone}</span>
                                          </div>
                                        )}
                                      </div>

                                      {/* Engagement Indicators */}
                                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                          {getSourceIcon(lead.source)}
                                          <span>{formatDate(lead.createdAt)}</span>
                                        </div>
                                        <div className="flex gap-1">
                                          {lead.emailOpens > 0 && (
                                            <span className="text-green-500" title={`${lead.emailOpens} email opens`}>
                                              <Mail className="h-3 w-3" />
                                            </span>
                                          )}
                                          {lead.pageViews > 0 && (
                                            <span className="text-blue-500" title={`${lead.pageViews} page views`}>
                                              <Eye className="h-3 w-3" />
                                            </span>
                                          )}
                                          {lead.formSubmissions > 0 && (
                                            <span className="text-purple-500" title={`${lead.formSubmissions} forms submitted`}>
                                              <FileText className="h-3 w-3" />
                                            </span>
                                          )}
                                        </div>
                                      </div>

                                      {/* Quick Actions */}
                                      <div className="flex gap-1 mt-2">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedLead(lead);
                                            setShowLeadDetails(true);
                                          }}
                                          className="flex-1 px-2 py-1 text-xs bg-gray-50 text-gray-600 rounded hover:bg-gray-100 transition-colors"
                                        >
                                          View
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            enrichLead(lead);
                                          }}
                                          className="flex-1 px-2 py-1 text-xs bg-purple-50 text-purple-600 rounded hover:bg-purple-100 transition-colors"
                                        >
                                          Enrich
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            // Open email composer
                                          }}
                                          className="flex-1 px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                                        >
                                          Email
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </div>
                    );
                  })}
                </div>
              </DragDropContext>
            </div>
          )}

          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {filteredLeads.map((lead) => {
                const leadScore = lead.leadScore || calculateEnhancedLeadScore(lead);
                const isSelected = selectedLeads.includes(lead.id);
                
                return (
                  <div 
                    key={lead.id} 
                    className={`bg-white rounded-lg shadow-sm border hover:shadow-lg transition-all ${
                      isSelected ? 'border-purple-500 ring-2 ring-purple-200' : 'border-gray-200'
                    }`}
                  >
                    <div className="p-5">
                      {/* Selection Checkbox */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedLeads([...selectedLeads, lead.id]);
                              } else {
                                setSelectedLeads(selectedLeads.filter(id => id !== lead.id));
                              }
                            }}
                            className="rounded text-purple-600 mt-1"
                          />
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                            {getInitials(lead.firstName, lead.lastName)}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">
                              {lead.firstName} {lead.lastName}
                            </h3>
                            {lead.title && (
                              <p className="text-xs text-gray-600">{lead.title}</p>
                            )}
                            {lead.company && (
                              <p className="text-sm text-gray-500">{lead.company}</p>
                            )}
                          </div>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Scores and Predictions */}
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="text-center">
                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(leadScore)}`}>
                            {getScoreIcon(leadScore)}
                            <span>{leadScore}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Score</p>
                        </div>
                        {showPredictions && (
                          <>
                            <div className="text-center">
                              <div className={`text-lg font-bold ${getProbabilityColor(lead.conversionProbability)}`}>
                                {(lead.conversionProbability * 100).toFixed(0)}%
                              </div>
                              <p className="text-xs text-gray-500">Probability</p>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-gray-900">
                                ${(lead.predictedDealSize / 1000).toFixed(0)}K
                              </div>
                              <p className="text-xs text-gray-500">Predicted</p>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Engagement Bar */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                          <span>Engagement</span>
                          <span>{lead.engagementScore || 0}/100</span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full transition-all duration-300"
                            style={{ width: `${lead.engagementScore || 0}%` }}
                          />
                        </div>
                      </div>

                      {/* Contact Information */}
                      <div className="space-y-2 mb-3">
                        {lead.email && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="truncate">{lead.email}</span>
                          </div>
                        )}
                        {lead.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span>{lead.phone}</span>
                          </div>
                        )}
                        {lead.address && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="truncate">{lead.address}</span>
                          </div>
                        )}
                      </div>

                      {/* Metadata */}
                      <div className="flex items-center justify-between text-xs text-gray-500 pb-3 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          {getSourceIcon(lead.source)}
                          <span>{lead.source}</span>
                        </div>
                        <span>{formatDate(lead.createdAt)}</span>
                      </div>

                      {/* Tags */}
                      {lead.tags && lead.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3 mb-3">
                          {lead.tags.map(tagId => {
                            const tag = availableTags.find(t => t.id === tagId);
                            return tag ? (
                              <span 
                                key={tagId}
                                className={`px-2 py-0.5 rounded-full text-xs bg-${tag.color}-100 text-${tag.color}-700`}
                              >
                                {tag.name}
                              </span>
                            ) : null;
                          })}
                        </div>
                      )}

                      {/* Assigned To */}
                      {lead.assignedTo && (
                        <div className="flex items-center gap-2 mb-3 text-xs text-gray-600">
                          <UserCheck className="h-3 w-3" />
                          <span>Assigned to {teamMembers.find(m => m.id === lead.assignedTo)?.name}</span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedLead(lead);
                            setShowLeadDetails(true);
                          }}
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </button>
                        <button
                          onClick={() => enrichLead(lead)}
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors text-sm"
                        >
                          <Brain className="h-4 w-4" />
                          Enrich
                        </button>
                        <button
                          onClick={() => navigate(`/contacts/${lead.id}/edit`)}
                          className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedLeads(filteredLeads.map(l => l.id));
                            } else {
                              setSelectedLeads([]);
                            }
                          }}
                          className="rounded text-purple-600"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Lead
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Company
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stage
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Probability
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Value
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Source
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Assigned
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredLeads.map((lead) => {
                      const isSelected = selectedLeads.includes(lead.id);
                      const stage = pipelineStages.find(s => s.id === (lead.stage || 'new'));
                      
                      return (
                        <tr 
                          key={lead.id}
                          className={`hover:bg-gray-50 ${isSelected ? 'bg-purple-50' : ''}`}
                        >
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedLeads([...selectedLeads, lead.id]);
                                } else {
                                  setSelectedLeads(selectedLeads.filter(id => id !== lead.id));
                                }
                              }}
                              className="rounded text-purple-600"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                {getInitials(lead.firstName, lead.lastName)}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">
                                  {lead.firstName} {lead.lastName}
                                </div>
                                <div className="text-xs text-gray-500">{lead.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {lead.company || '-'}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(lead.leadScore)}`}>
                              {getScoreIcon(lead.leadScore)}
                              {lead.leadScore || 0}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-${stage?.color}-100 text-${stage?.color}-700`}>
                              {stage?.name}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`font-medium ${getProbabilityColor(lead.conversionProbability)}`}>
                              {(lead.conversionProbability * 100).toFixed(0)}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            ${(lead.predictedDealSize / 1000).toFixed(0)}K
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              {getSourceIcon(lead.source)}
                              <span>{lead.source}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {lead.assignedTo ? teamMembers.find(m => m.id === lead.assignedTo)?.name : '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {formatDate(lead.createdAt)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => {
                                  setSelectedLead(lead);
                                  setShowLeadDetails(true);
                                }}
                                className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => enrichLead(lead)}
                                className="p-1 text-gray-600 hover:text-purple-600 transition-colors"
                                title="Enrich Data"
                              >
                                <Brain className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => navigate(`/contacts/${lead.id}/edit`)}
                                className="p-1 text-gray-600 hover:text-gray-900 transition-colors"
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(lead.id)}
                                className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Map View */}
          {viewMode === 'map' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Map View</h3>
                  <p className="text-gray-500">
                    Geographic visualization of leads coming soon
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || filterSource !== 'all' || filterScore !== 'all' ? 'No leads found' : 'No leads yet'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || filterSource !== 'all' || filterScore !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Start adding leads to build your pipeline'}
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => navigate('/contacts?status=new')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Add Lead
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Upload className="h-5 w-5" />
              Import Leads
            </button>
          </div>
        </div>
      )}

      {/* Analytics Dashboard Modal */}
      {showAnalytics && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Lead Analytics Dashboard</h2>
                <button onClick={() => setShowAnalytics(false)}>
                  <X className="h-6 w-6 text-gray-400 hover:text-gray-600" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                    <span className="text-xs text-blue-600">+23%</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{stats.conversionRate}%</div>
                  <div className="text-sm text-gray-600">Conversion Rate</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <DollarSign className="h-6 w-6 text-green-600" />
                    <span className="text-xs text-green-600">+15%</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    ${(stats.averageDealSize / 1000).toFixed(0)}K
                  </div>
                  <div className="text-sm text-gray-600">Avg Deal Size</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Clock className="h-6 w-6 text-purple-600" />
                    <span className="text-xs text-red-600">-5 days</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{stats.averageTimeToConvert} days</div>
                  <div className="text-sm text-gray-600">Time to Convert</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Rocket className="h-6 w-6 text-yellow-600" />
                    <span className="text-xs text-yellow-600">{stats.leadVelocity}%</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    ${(stats.quarterlyForecast / 1000).toFixed(0)}K
                  </div>
                  <div className="text-sm text-gray-600">Q1 Forecast</div>
                </div>
              </div>

              {/* Source Performance */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Lead Source Performance</h3>
                <div className="space-y-2">
                  {Object.entries(stats.sourceROI).map(([source, metrics]) => (
                    <div key={source} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getSourceIcon(source)}
                        <div>
                          <div className="font-medium text-gray-900 capitalize">{source}</div>
                          <div className="text-sm text-gray-500">
                            {metrics.leads} leads • {metrics.converted} converted
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {metrics.conversionRate}%
                          </div>
                          <div className="text-xs text-gray-500">Conversion</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            ${(metrics.avgDealSize / 1000).toFixed(0)}K
                          </div>
                          <div className="text-xs text-gray-500">Avg Deal</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            ${(metrics.revenue / 1000).toFixed(0)}K
                          </div>
                          <div className="text-xs text-gray-500">Revenue</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Team Performance */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Team Performance</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.values(stats.teamPerformance).map((member) => (
                    <div key={member.name} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="font-medium text-gray-900">{member.name}</div>
                          <div className="text-sm text-gray-500">{member.leads} leads</div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">
                            {member.conversionRate}%
                          </div>
                          <div className="text-xs text-gray-500">Conversion</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <div className="text-sm font-semibold">{member.converted}</div>
                          <div className="text-xs text-gray-500">Won</div>
                        </div>
                        <div>
                          <div className="text-sm font-semibold">
                            ${(member.revenue / 1000).toFixed(0)}K
                          </div>
                          <div className="text-xs text-gray-500">Revenue</div>
                        </div>
                        <div>
                          <div className="text-sm font-semibold">{member.avgResponseTime}</div>
                          <div className="text-xs text-gray-500">Response</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lead Details Modal */}
      {showLeadDetails && selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold">
                    {getInitials(selectedLead.firstName, selectedLead.lastName)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedLead.firstName} {selectedLead.lastName}
                    </h2>
                    <p className="text-gray-600">{selectedLead.company} • {selectedLead.title}</p>
                  </div>
                </div>
                <button onClick={() => setShowLeadDetails(false)}>
                  <X className="h-6 w-6 text-gray-400 hover:text-gray-600" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {/* Lead details content here */}
              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 space-y-6">
                  {/* Activity Timeline */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Activity Timeline</h3>
                    <div className="space-y-3">
                      {activities.map(activity => (
                        <div key={activity.id} className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${
                            activity.status === 'completed' ? 'bg-green-100 text-green-600' :
                            activity.status === 'scheduled' ? 'bg-blue-100 text-blue-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {activity.icon}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{activity.subject}</div>
                            <div className="text-sm text-gray-500">{activity.time}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {/* Contact Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{selectedLead.email}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{selectedLead.phone}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{selectedLead.address}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Globe className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{selectedLead.website}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Lead Scores */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Lead Intelligence</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Lead Score</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(selectedLead.leadScore)}`}>
                          {selectedLead.leadScore}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Conversion Probability</span>
                        <span className={`font-medium ${getProbabilityColor(selectedLead.conversionProbability)}`}>
                          {(selectedLead.conversionProbability * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Predicted Deal Size</span>
                        <span className="font-medium text-gray-900">
                          ${(selectedLead.predictedDealSize / 1000).toFixed(0)}K
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Engagement Score</span>
                        <span className="font-medium text-gray-900">{selectedLead.engagementScore}/100</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Automation Builder Modal */}
      {showAutomationBuilder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Automation Workflows</h2>
                <button onClick={() => setShowAutomationBuilder(false)}>
                  <X className="h-6 w-6 text-gray-400 hover:text-gray-600" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                {automationTemplates.map(template => (
                  <div key={template.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                        {template.icon}
                      </div>
                      <span className="text-sm text-gray-500">{template.effectiveness}% effective</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{template.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                    <button className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors">
                      Activate
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enrichment Modal */}
      {showEnrichmentModal && selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Lead Enrichment</h2>
                <button onClick={() => setShowEnrichmentModal(false)}>
                  <X className="h-6 w-6 text-gray-400 hover:text-gray-600" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Enriching lead data from multiple sources...</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this lead? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;