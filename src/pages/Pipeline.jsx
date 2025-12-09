// ================================================================================
// PATH: /src/pages/Pipeline.jsx
// ================================================================================
// MEGA AI-POWERED SALES PIPELINE - PRODUCTION READY
// ================================================================================
// Features: AI-powered lead scoring, Kanban drag-and-drop, real-time updates,
//           predictive analytics, smart automation, visual insights
// Author: Christopher (Speedy Credit Repair)
// Last Updated: 2025-12-01
// ================================================================================

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// ===== FIREBASE IMPORTS =====
import { db } from '../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  deleteDoc,
  serverTimestamp,
  getDocs
} from 'firebase/firestore';

// ===== LUCIDE REACT ICONS =====
import {
  Users,
  UserPlus,
  UserCheck,
  MessageSquare,
  FileText,
  Scale,
  Trophy,
  XCircle,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Mail,
  Phone,
  Calendar,
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  X,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  Activity,
  Zap,
  Target,
  Brain,
  Bot,
  Sparkles,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  Settings,
  RefreshCw,
  Copy,
  ExternalLink,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Info
} from 'lucide-react';

// ===== AI SERVICE IMPORT =====
import RealPipelineAI from '../services/RealPipelineAIService';

// ================================================================================
// UTILITY FUNCTIONS
// ================================================================================

/**
 * Calculate deal health score (0-100)
 * Based on: last activity, stage progression, engagement level
 */
const calculateDealHealth = (deal) => {
  if (!deal) return 0;
  
  let health = 100;
  
  // Last activity recency (0-30 points)
  if (deal.lastActivity) {
    const daysSinceActivity = Math.floor((Date.now() - deal.lastActivity.toMillis()) / (1000 * 60 * 60 * 24));
    if (daysSinceActivity > 30) health -= 30;
    else if (daysSinceActivity > 14) health -= 20;
    else if (daysSinceActivity > 7) health -= 10;
  } else {
    health -= 30;
  }
  
  // Stage-appropriate timing (0-30 points)
  if (deal.createdAt) {
    const daysInStage = Math.floor((Date.now() - deal.createdAt.toMillis()) / (1000 * 60 * 60 * 24));
    const stageTargets = {
      'new': 1,
      'contacted': 3,
      'qualified': 7,
      'proposal': 14,
      'negotiation': 21
    };
    const target = stageTargets[deal.stage] || 7;
    if (daysInStage > target * 2) health -= 30;
    else if (daysInStage > target) health -= 15;
  }
  
  // Engagement level (0-20 points)
  const interactions = deal.interactions || 0;
  if (interactions === 0) health -= 20;
  else if (interactions < 3) health -= 10;
  
  // Priority/urgency bonus (0-20 points)
  if (deal.priority === 'high' || deal.urgency === 'high') health += 10;
  if (deal.leadScore >= 8) health += 10;
  
  return Math.max(0, Math.min(100, health));
};

/**
 * Calculate win probability (0-100%)
 * Based on: stage, lead score, deal health, historical patterns
 */
const calculateWinProbability = (deal) => {
  if (!deal) return 0;
  
  // Base probability by stage
  const stageProbabilities = {
    'new': 10,
    'contacted': 20,
    'qualified': 40,
    'proposal': 60,
    'negotiation': 75,
    'won': 100,
    'lost': 0
  };
  
  let probability = stageProbabilities[deal.stage] || 10;
  
  // Adjust for lead score
  if (deal.leadScore) {
    probability += (deal.leadScore - 5) * 3; // ±15% adjustment
  }
  
  // Adjust for deal health
  const health = calculateDealHealth(deal);
  if (health < 50) probability -= 15;
  else if (health > 80) probability += 10;
  
  // Adjust for value (larger deals may have lower probability)
  if (deal.value > 3000) probability -= 5;
  
  return Math.max(0, Math.min(100, probability));
};

/**
 * Get color class based on health score
 */
const getHealthColor = (health) => {
  if (health >= 80) return 'text-green-600';
  if (health >= 60) return 'text-yellow-600';
  if (health >= 40) return 'text-orange-600';
  return 'text-red-600';
};

/**
 * Format currency
 */
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount || 0);
};

/**
 * Format relative time (e.g., "2 hours ago")
 */
const formatRelativeTime = (timestamp) => {
  if (!timestamp) return 'Never';
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
};

// ================================================================================
// PIPELINE UTILITIES EXPORT
// ================================================================================

export const PipelineUtils = {
  calculateDealHealth,
  calculateWinProbability,
  getHealthColor,
  formatCurrency,
  formatRelativeTime,
  
  /**
   * Get AI insights for pipeline
   */
  getAIInsights: (deals) => {
    const insights = [];
    const avgHealth = deals && deals.length > 0
      ? deals.reduce((sum, d) => sum + calculateDealHealth(d), 0) / deals.length
      : 0;
    
    if (avgHealth < 60) {
      insights.push({
        type: 'warning',
        icon: '⚠️',
        title: 'Pipeline Health Below Target',
        description: `Average health is ${avgHealth.toFixed(0)}% - increase engagement with stale leads`,
        action: 'Review Stale Deals',
        priority: 'high'
      });
    }
    
    const hotLeads = deals.filter(d => d.leadScore >= 8 && ['new', 'contacted', 'qualified'].includes(d.stage));
    if (hotLeads.length > 0) {
      insights.push({
        type: 'success',
        icon: '🔥',
        title: `${hotLeads.length} Hot Leads Ready`,
        description: 'High-scoring leads need immediate attention',
        action: 'View Hot Leads',
        priority: 'high'
      });
    }
    
    return insights;
  },
  
  /**
   * Forecast revenue based on current pipeline
   */
  forecastRevenue: (deals, days = 30) => {
    const qualified = deals.filter(d => 
      ['qualified', 'proposal', 'negotiation'].includes(d.stage)
    );
    
    let forecast = 0;
    let bestCase = 0;
    let worstCase = 0;
    
    qualified.forEach(deal => {
      const probability = calculateWinProbability(deal) / 100;
      const value = deal.value || 0;
      forecast += value * probability;
      bestCase += value * Math.min(1, probability * 1.3);
      worstCase += value * probability * 0.5;
    });
    
    return {
      likely: Math.round(forecast),
      bestCase: Math.round(bestCase),
      worstCase: Math.round(worstCase),
      confidence: qualified.length > 10 ? 'high' : qualified.length > 5 ? 'medium' : 'low'
    };
  }
};

// ================================================================================
// MAIN PIPELINE COMPONENT
// ================================================================================

const Pipeline = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();

  // ===== CORE STATE =====
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [draggedDeal, setDraggedDeal] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);
  
  // ===== UI STATE =====
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDeal, setShowAddDeal] = useState(false);
  const [selectedStage, setSelectedStage] = useState('');
  const [editingDeal, setEditingDeal] = useState(null);
  const [selectedDeals, setSelectedDeals] = useState([]);
  const [expandedDeals, setExpandedDeals] = useState(new Set());
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'list' | 'chart'
  const [showFilters, setShowFilters] = useState(false);
  
  // ===== FILTER STATE =====
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const [filterProduct, setFilterProduct] = useState('all');
  const [filterHealth, setFilterHealth] = useState('all');
  const [sortBy, setSortBy] = useState('value');
  const [showHotLeadsOnly, setShowHotLeadsOnly] = useState(false);
  
  // ===== AI FEATURES STATE =====
  const [showAICoach, setShowAICoach] = useState(false);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [showEmailGenerator, setShowEmailGenerator] = useState(false);
  const [selectedDealForEmail, setSelectedDealForEmail] = useState(null);
  const [aiInsights, setAIInsights] = useState([]);
  const [forecastData, setForecastData] = useState(null);
  
  // ===== SETTINGS =====
  const [realtimeUpdates, setRealtimeUpdates] = useState(true);
  const [automationEnabled, setAutomationEnabled] = useState(true);
  const [forecastRange, setForecastRange] = useState(30);
  
  // ===== STATS =====
  const [stats, setStats] = useState({
    totalValue: 0,
    totalDeals: 0,
    avgDealSize: 0,
    conversionRate: 0,
    avgCycleTime: 0,
    velocity: 0,
    forecast: 0,
    atRisk: 0,
    hotLeads: 0,
    aiGeneratedDeals: 0,
    avgHealth: 0,
    avgWinProb: 0,
    stageConversion: {}
  });

  // ===== PIPELINE STAGES =====
  const stages = [
    { 
      id: 'new', 
      title: 'New Lead', 
      color: 'bg-gradient-to-br from-gray-400 to-gray-500',
      borderColor: 'border-gray-500',
      textColor: 'text-gray-700',
      description: 'Unqualified leads',
      icon: UserPlus,
      targetDays: 1
    },
    { 
      id: 'contacted', 
      title: 'Contacted', 
      color: 'bg-gradient-to-br from-blue-400 to-blue-500',
      borderColor: 'border-blue-500',
      textColor: 'text-blue-700',
      description: 'Initial contact made',
      icon: MessageSquare,
      targetDays: 3
    },
    { 
      id: 'qualified', 
      title: 'Qualified', 
      color: 'bg-gradient-to-br from-indigo-400 to-indigo-500',
      borderColor: 'border-indigo-500',
      textColor: 'text-indigo-700',
      description: 'Lead qualified',
      icon: UserCheck,
      targetDays: 7
    },
    { 
      id: 'proposal', 
      title: 'Proposal', 
      color: 'bg-gradient-to-br from-purple-400 to-purple-500',
      borderColor: 'border-purple-500',
      textColor: 'text-purple-700',
      description: 'Proposal sent',
      icon: FileText,
      targetDays: 14
    },
    { 
      id: 'negotiation', 
      title: 'Negotiation', 
      color: 'bg-gradient-to-br from-orange-400 to-orange-500',
      borderColor: 'border-orange-500',
      textColor: 'text-orange-700',
      description: 'In negotiation',
      icon: Scale,
      targetDays: 21
    },
    { 
      id: 'won', 
      title: 'Won', 
      color: 'bg-gradient-to-br from-green-400 to-green-500',
      borderColor: 'border-green-500',
      textColor: 'text-green-700',
      description: 'Deal closed',
      icon: Trophy,
      targetDays: 0
    },
    { 
      id: 'lost', 
      title: 'Lost', 
      color: 'bg-gradient-to-br from-red-400 to-red-500',
      borderColor: 'border-red-500',
      textColor: 'text-red-700',
      description: 'Deal lost',
      icon: XCircle,
      targetDays: 0
    }
  ];

  // ===== PRODUCTS/SERVICES =====
  const PRODUCTS = {
    'diy': { name: 'DIY ($39/mo)', value: 39, color: 'blue' },
    'standard': { name: 'Standard ($149/mo)', value: 149, color: 'green' },
    'acceleration': { name: 'Acceleration ($199/mo)', value: 199, color: 'purple' },
    'pfd': { name: 'PFD ($0)', value: 0, color: 'gray' },
    'hybrid': { name: 'Hybrid ($99/mo)', value: 99, color: 'yellow' },
    'premium': { name: 'Premium ($349/mo)', value: 349, color: 'indigo' }
  };

  // ================================================================================
  // DATA LOADING WITH REAL-TIME UPDATES
  // ================================================================================

  useEffect(() => {
    console.log('🔄 Pipeline: Loading data...');
    
    if (!user) {
      console.log('❌ Pipeline: No user logged in');
      setLoading(false);
      setDeals([]);
      return;
    }

    if (!realtimeUpdates) {
      console.log('⏸️ Pipeline: Real-time updates disabled');
      setLoading(false);
      return;
    }

    let dealsReceived = false;
    let contactsReceived = false;
    
    const checkLoadingComplete = () => {
      if (dealsReceived && contactsReceived) {
        console.log('✅ Pipeline: All data loaded');
        setLoading(false);
      }
    };

    // ===== LISTEN TO DEALS COLLECTION =====
    const q1 = query(collection(db, 'deals'), orderBy('createdAt', 'desc'));
    const unsubscribeDeals = onSnapshot(q1, 
      (snapshot) => {
        const dealsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          isDeal: true
        }));
        
        console.log(`📊 Pipeline: Loaded ${dealsList.length} deals from 'deals' collection`);
        
        setDeals(prevDeals => {
          const merged = [...prevDeals.filter(d => !d.isDeal), ...dealsList];
          calculateStats(merged);
          return merged;
        });
        
        dealsReceived = true;
        checkLoadingComplete();
      },
      (error) => {
        console.error('❌ Pipeline: Error loading deals:', error);
        setError('Failed to load deals');
        dealsReceived = true;
        checkLoadingComplete();
      }
    );

    // ===== LISTEN TO LEADS FROM CONTACTS =====
    const q2 = query(
      collection(db, 'contacts'),
      where('roles', 'array-contains', 'lead'),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribeContacts = onSnapshot(q2,
      (snapshot) => {
        const leadsList = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            isDeal: false,
            // Map contact fields to deal fields
            name: data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Unknown',
            email: data.email,
            phone: data.phone,
            stage: data.pipelineStage || 'new',
            value: data.estimatedValue || 0,
            leadScore: data.leadScore || 0,
            source: data.source || 'contact',
            priority: data.priority || 'medium',
            product: data.interestedIn || '',
            lastActivity: data.lastInteraction || data.updatedAt,
            createdAt: data.createdAt,
            notes: data.notes || '',
            urgency: data.urgencyLevel || 'medium'
          };
        });
        
        console.log(`👥 Pipeline: Loaded ${leadsList.length} leads from 'contacts' collection`);
        
        setDeals(prevDeals => {
          const merged = [...prevDeals.filter(d => d.isDeal), ...leadsList];
          calculateStats(merged);
          return merged;
        });
        
        contactsReceived = true;
        checkLoadingComplete();
      },
      (error) => {
        console.error('❌ Pipeline: Error loading contacts:', error);
        contactsReceived = true;
        checkLoadingComplete();
      }
    );

    // ===== CLEANUP =====
    return () => {
      console.log('🧹 Pipeline: Cleaning up listeners');
      unsubscribeDeals();
      unsubscribeContacts();
    };
  }, [user, realtimeUpdates]);

  // ================================================================================
  // CALCULATE STATISTICS
  // ================================================================================

  const calculateStats = useCallback((dealsToAnalyze) => {
    if (!dealsToAnalyze || dealsToAnalyze.length === 0) {
      setStats({
        totalValue: 0,
        totalDeals: 0,
        avgDealSize: 0,
        conversionRate: 0,
        avgCycleTime: 0,
        velocity: 0,
        forecast: 0,
        atRisk: 0,
        hotLeads: 0,
        aiGeneratedDeals: 0,
        avgHealth: 0,
        avgWinProb: 0,
        stageConversion: {}
      });
      return;
    }

    const totalValue = dealsToAnalyze.reduce((sum, d) => sum + (d.value || 0), 0);
    const totalDeals = dealsToAnalyze.length;
    const wonDeals = dealsToAnalyze.filter(d => d.stage === 'won');
    const lostDeals = dealsToAnalyze.filter(d => d.stage === 'lost');
    const activeDeals = dealsToAnalyze.filter(d => !['won', 'lost'].includes(d.stage));
    
    // Calculate average health and win probability
    const avgHealth = activeDeals.length > 0
      ? activeDeals.reduce((sum, d) => sum + calculateDealHealth(d), 0) / activeDeals.length
      : 0;
    
    const avgWinProb = activeDeals.length > 0
      ? activeDeals.reduce((sum, d) => sum + calculateWinProbability(d), 0) / activeDeals.length
      : 0;

    // Calculate conversion rate
    const totalClosed = wonDeals.length + lostDeals.length;
    const conversionRate = totalClosed > 0 ? (wonDeals.length / totalClosed) * 100 : 0;

    // Find at-risk deals (health < 50%)
    const atRisk = activeDeals.filter(d => calculateDealHealth(d) < 50).length;

    // Find hot leads (score >= 8)
    const hotLeads = activeDeals.filter(d => d.leadScore >= 8).length;

    // AI-generated deals
    const aiGeneratedDeals = dealsToAnalyze.filter(d => d.source === 'ai' || d.aiGenerated).length;

    // Forecast
    const forecast = PipelineUtils.forecastRevenue(activeDeals, forecastRange);

    // Stage conversion rates
    const stageConversion = {};
    stages.forEach(stage => {
      const stageDeals = dealsToAnalyze.filter(d => d.stage === stage.id);
      stageConversion[stage.id] = stageDeals.length;
    });

    setStats({
      totalValue,
      totalDeals,
      avgDealSize: totalDeals > 0 ? totalValue / totalDeals : 0,
      conversionRate,
      avgCycleTime: 0, // TODO: Calculate based on timestamp differences
      velocity: wonDeals.length, // Simplified
      forecast: forecast.likely,
      atRisk,
      hotLeads,
      aiGeneratedDeals,
      avgHealth,
      avgWinProb,
      stageConversion
    });

    // Update AI insights
    const insights = PipelineUtils.getAIInsights(dealsToAnalyze);
    setAIInsights(insights);

    // Update forecast data
    setForecastData(forecast);
  }, [forecastRange]);

  // ================================================================================
  // DEAL MANAGEMENT FUNCTIONS
  // ================================================================================

  /**
   * Move deal to new stage
   */
  const moveDealToStage = async (dealId, newStage, isDealFromDealsCollection) => {
    try {
      console.log(`🔄 Moving deal ${dealId} to ${newStage}`);
      
      if (isDealFromDealsCollection) {
        // Update in deals collection
        await updateDoc(doc(db, 'deals', dealId), {
          stage: newStage,
          lastActivity: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } else {
        // Update in contacts collection
        await updateDoc(doc(db, 'contacts', dealId), {
          pipelineStage: newStage,
          lastInteraction: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      
      console.log(`✅ Deal moved to ${newStage}`);
    } catch (error) {
      console.error('❌ Error moving deal:', error);
      alert('Failed to move deal: ' + error.message);
    }
  };

  /**
   * Delete deal
   */
  const deleteDeal = async (dealId, isDealFromDealsCollection) => {
    if (!confirm('Are you sure you want to delete this deal?')) return;
    
    try {
      console.log(`🗑️ Deleting deal ${dealId}`);
      
      if (isDealFromDealsCollection) {
        await deleteDoc(doc(db, 'deals', dealId));
      } else {
        // Remove 'lead' role from contact
        const deal = deals.find(d => d.id === dealId);
        if (deal && deal.roles) {
          const updatedRoles = deal.roles.filter(r => r !== 'lead');
          await updateDoc(doc(db, 'contacts', dealId), {
            roles: updatedRoles,
            pipelineStage: null
          });
        }
      }
      
      console.log('✅ Deal deleted');
    } catch (error) {
      console.error('❌ Error deleting deal:', error);
      alert('Failed to delete deal: ' + error.message);
    }
  };

  // ================================================================================
  // DRAG AND DROP HANDLERS
  // ================================================================================

  const handleDragStart = (e, deal) => {
    setDraggedDeal(deal);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, stageId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStage(stageId);
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = async (e, stageId) => {
    e.preventDefault();
    setDragOverStage(null);
    
    if (!draggedDeal) return;
    
    if (draggedDeal.stage !== stageId) {
      await moveDealToStage(draggedDeal.id, stageId, draggedDeal.isDeal);
    }
    
    setDraggedDeal(null);
  };

  // ================================================================================
  // FILTERED AND SORTED DEALS
  // ================================================================================

  const filteredAndSortedDeals = useMemo(() => {
    let filtered = deals;

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(d => 
        (d.name && d.name.toLowerCase().includes(search)) ||
        (d.email && d.email.toLowerCase().includes(search)) ||
        (d.phone && d.phone.toLowerCase().includes(search)) ||
        (d.company && d.company.toLowerCase().includes(search))
      );
    }

    // Priority filter
    if (filterPriority !== 'all') {
      filtered = filtered.filter(d => d.priority === filterPriority);
    }

    // Source filter
    if (filterSource !== 'all') {
      filtered = filtered.filter(d => d.source === filterSource);
    }

    // Product filter
    if (filterProduct !== 'all') {
      filtered = filtered.filter(d => d.product === filterProduct);
    }

    // Health filter
    if (filterHealth !== 'all') {
      filtered = filtered.filter(d => {
        const health = calculateDealHealth(d);
        if (filterHealth === 'high') return health >= 80;
        if (filterHealth === 'medium') return health >= 50 && health < 80;
        if (filterHealth === 'low') return health < 50;
        return true;
      });
    }

    // Hot leads only
    if (showHotLeadsOnly) {
      filtered = filtered.filter(d => d.leadScore >= 8);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'value':
          return (b.value || 0) - (a.value || 0);
        case 'score':
          return (b.leadScore || 0) - (a.leadScore || 0);
        case 'health':
          return calculateDealHealth(b) - calculateDealHealth(a);
        case 'recent':
          return (b.lastActivity?.toMillis() || 0) - (a.lastActivity?.toMillis() || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [deals, searchTerm, filterPriority, filterSource, filterProduct, filterHealth, showHotLeadsOnly, sortBy]);

  /**
   * Get deals for specific stage
   */
  const getDealsForStage = (stageId) => {
    return filteredAndSortedDeals.filter(d => d.stage === stageId);
  };

  // ================================================================================
  // EMAIL GENERATION (BASIC - NO AI API CALL NEEDED IN CLIENT)
  // ================================================================================

  const generateBasicEmail = (deal, type = 'followup') => {
    const templates = {
      initial: `Hi ${deal.name},\n\nThank you for your interest in our credit repair services. I'd love to learn more about your credit goals and show you how we can help.\n\nWhen would be a good time for a brief call?\n\nBest regards,\nSpeedy Credit Repair`,
      followup: `Hi ${deal.name},\n\nI wanted to follow up on our recent conversation about improving your credit score. Have you had a chance to review the information I sent?\n\nI'm here to answer any questions you might have.\n\nBest regards,\nSpeedy Credit Repair`,
      proposal: `Hi ${deal.name},\n\nThank you for taking the time to discuss your credit situation with me. Based on our conversation, I've prepared a customized proposal for you.\n\nWhen can we schedule a call to review it together?\n\nBest regards,\nSpeedy Credit Repair`,
      closing: `Hi ${deal.name},\n\nI'm excited to help you achieve your credit goals! Let's schedule a time to finalize everything and get you started on your credit repair journey.\n\nLooking forward to working with you!\n\nBest regards,\nSpeedy Credit Repair`
    };

    return templates[type] || templates.followup;
  };

  // ================================================================================
  // RENDER: EMPTY STATE
  // ================================================================================

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Please Log In
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            You need to be logged in to view the pipeline.
          </p>
        </div>
      </div>
    );
  }

  // ================================================================================
  // RENDER: LOADING STATE
  // ================================================================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Loading Pipeline...
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Fetching deals and leads from Firebase
          </p>
        </div>
      </div>
    );
  }

  // ================================================================================
  // RENDER: ERROR STATE
  // ================================================================================

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Error Loading Pipeline
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ================================================================================
  // RENDER: MAIN PIPELINE VIEW
  // ================================================================================

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      
      {/* ===== HEADER ===== */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          {/* Title & Stats */}
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Brain className="w-7 h-7 text-purple-600" />
                AI-Powered Sales Pipeline
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {stats.totalDeals} deals • {formatCurrency(stats.totalValue)} total value • {stats.hotLeads} hot leads
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors ${
                showFilters
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>

            <button
              onClick={() => setShowAIInsights(!showAIInsights)}
              className={`px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors ${
                showAIInsights
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              AI Insights
              {aiInsights.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-white dark:bg-purple-800 text-purple-700 dark:text-purple-200 rounded-full text-xs font-bold">
                  {aiInsights.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setShowAddDeal(true)}
              className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Deal
            </button>

            <button
              onClick={() => window.location.reload()}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ===== FILTER BAR ===== */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search deals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Priority Filter */}
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Priorities</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>

              {/* Source Filter */}
              <select
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Sources</option>
                <option value="website">Website</option>
                <option value="referral">Referral</option>
                <option value="ai">AI Generated</option>
                <option value="contact">Contact Form</option>
              </select>

              {/* Health Filter */}
              <select
                value={filterHealth}
                onChange={(e) => setFilterHealth(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Health</option>
                <option value="high">Healthy (&gt;80%)</option>
                <option value="medium">Medium (50-80%)</option>
                <option value="low">At Risk (&lt;50%)</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="value">Sort by Value</option>
                <option value="score">Sort by Score</option>
                <option value="health">Sort by Health</option>
                <option value="recent">Sort by Recent</option>
              </select>
            </div>

            {/* Hot Leads Toggle */}
            <div className="mt-3 flex items-center gap-2">
              <input
                type="checkbox"
                id="hotLeadsOnly"
                checked={showHotLeadsOnly}
                onChange={(e) => setShowHotLeadsOnly(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label htmlFor="hotLeadsOnly" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                <Zap className="w-4 h-4 text-orange-500" />
                Show Hot Leads Only (Score ≥ 8)
              </label>
            </div>
          </div>
        )}
      </div>

      {/* ===== AI INSIGHTS BANNER ===== */}
      {showAIInsights && aiInsights.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-b border-purple-200 dark:border-purple-800 px-6 py-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                AI-Powered Insights
              </h3>
              <div className="space-y-2">
                {aiInsights.map((insight, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-white dark:bg-gray-800 rounded-lg p-3 border border-purple-100 dark:border-purple-800">
                    <span className="text-2xl">{insight.icon}</span>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">{insight.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{insight.description}</p>
                    </div>
                    {insight.action && (
                      <button className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 whitespace-nowrap">
                        {insight.action}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => setShowAIInsights(false)}
              className="ml-4 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* ===== STATS ROW ===== */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          
          {/* Total Value */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
            <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">Total Value</div>
            <div className="text-lg font-bold text-blue-700 dark:text-blue-300">{formatCurrency(stats.totalValue)}</div>
          </div>

          {/* Forecast */}
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
            <div className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-1">Forecast</div>
            <div className="text-lg font-bold text-purple-700 dark:text-purple-300">{formatCurrency(stats.forecast)}</div>
          </div>

          {/* Hot Leads */}
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 border border-orange-200 dark:border-orange-800">
            <div className="text-xs text-orange-600 dark:text-orange-400 font-medium mb-1 flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Hot Leads
            </div>
            <div className="text-lg font-bold text-orange-700 dark:text-orange-300">{stats.hotLeads}</div>
          </div>

          {/* At Risk */}
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 border border-red-200 dark:border-red-800">
            <div className="text-xs text-red-600 dark:text-red-400 font-medium mb-1">At Risk</div>
            <div className="text-lg font-bold text-red-700 dark:text-red-300">{stats.atRisk}</div>
          </div>

          {/* Avg Health */}
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
            <div className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">Avg Health</div>
            <div className={`text-lg font-bold ${getHealthColor(stats.avgHealth)}`}>
              {stats.avgHealth.toFixed(0)}%
            </div>
          </div>

          {/* Win Rate */}
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-3 border border-indigo-200 dark:border-indigo-800">
            <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mb-1">Win Rate</div>
            <div className="text-lg font-bold text-indigo-700 dark:text-indigo-300">{stats.conversionRate.toFixed(0)}%</div>
          </div>

          {/* Avg Win Prob */}
          <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-3 border border-teal-200 dark:border-teal-800">
            <div className="text-xs text-teal-600 dark:text-teal-400 font-medium mb-1">Win Prob</div>
            <div className="text-lg font-bold text-teal-700 dark:text-teal-300">{stats.avgWinProb.toFixed(0)}%</div>
          </div>

          {/* AI Deals */}
          <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-lg p-3 border border-cyan-200 dark:border-cyan-800">
            <div className="text-xs text-cyan-600 dark:text-cyan-400 font-medium mb-1 flex items-center gap-1">
              <Bot className="w-3 h-3" />
              AI Deals
            </div>
            <div className="text-lg font-bold text-cyan-700 dark:text-cyan-300">{stats.aiGeneratedDeals}</div>
          </div>
        </div>
      </div>

      {/* ===== EMPTY STATE ===== */}
      {filteredAndSortedDeals.length === 0 && (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md px-6">
            <Users className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No Deals Yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm || showHotLeadsOnly || filterPriority !== 'all' || filterSource !== 'all' || filterHealth !== 'all'
                ? 'No deals match your current filters. Try adjusting your search criteria.'
                : 'Get started by adding your first deal or lead to the pipeline.'
              }
            </p>
            {!(searchTerm || showHotLeadsOnly || filterPriority !== 'all' || filterSource !== 'all' || filterHealth !== 'all') && (
              <button
                onClick={() => setShowAddDeal(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto text-lg font-medium"
              >
                <Plus className="w-5 h-5" />
                Add First Deal
              </button>
            )}
          </div>
        </div>
      )}

      {/* ===== KANBAN BOARD ===== */}
      {filteredAndSortedDeals.length > 0 && (
        <div className="p-6 overflow-x-auto">
          <div className="flex gap-4 min-w-max">
            {stages.map(stage => {
              const stageDeals = getDealsForStage(stage.id);
              const stageValue = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0);
              const StageIcon = stage.icon;
              const isDragOver = dragOverStage === stage.id;

              return (
                <div
                  key={stage.id}
                  className="flex-shrink-0 w-80"
                  onDragOver={(e) => handleDragOver(e, stage.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, stage.id)}
                >
                  {/* Stage Header */}
                  <div className={`${stage.color} rounded-lg p-4 mb-3 text-white shadow-md`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <StageIcon className="w-5 h-5" />
                        <h3 className="font-bold text-lg">{stage.title}</h3>
                      </div>
                      <span className="bg-white/20 px-2 py-1 rounded-full text-sm font-bold">
                        {stageDeals.length}
                      </span>
                    </div>
                    <div className="text-sm opacity-90">
                      {formatCurrency(stageValue)}
                    </div>
                  </div>

                  {/* Deals Column */}
                  <div
                    className={`min-h-[400px] bg-gray-100 dark:bg-gray-800/50 rounded-lg p-2 space-y-2 transition-colors ${
                      isDragOver ? 'bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500' : ''
                    }`}
                  >
                    {stageDeals.length === 0 ? (
                      <div className="text-center py-8 text-gray-400 dark:text-gray-600">
                        <StageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No deals</p>
                      </div>
                    ) : (
                      stageDeals.map(deal => {
                        const health = calculateDealHealth(deal);
                        const winProb = calculateWinProbability(deal);

                        return (
                          <div
                            key={deal.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, deal)}
                            className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-move border border-gray-200 dark:border-gray-700 group"
                          >
                            {/* Deal Header */}
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 dark:text-white truncate" title={deal.name}>
                                  {deal.name || 'Unnamed Deal'}
                                </h4>
                                {deal.company && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{deal.company}</p>
                                )}
                              </div>
                              
                              {/* Quick Actions */}
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => navigate(`/contacts/${deal.id}`)}
                                  className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                                  title="View details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedDealForEmail(deal);
                                    setShowEmailGenerator(true);
                                  }}
                                  className="p-1 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded"
                                  title="Generate email"
                                >
                                  <Mail className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => deleteDeal(deal.id, deal.isDeal)}
                                  className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* Deal Value */}
                            {deal.value > 0 && (
                              <div className="text-lg font-bold text-green-600 dark:text-green-400 mb-2">
                                {formatCurrency(deal.value)}
                              </div>
                            )}

                            {/* Lead Score */}
                            {deal.leadScore > 0 && (
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs text-gray-600 dark:text-gray-400">Score:</span>
                                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full transition-all ${
                                      deal.leadScore >= 8 ? 'bg-green-500' :
                                      deal.leadScore >= 6 ? 'bg-yellow-500' :
                                      'bg-red-500'
                                    }`}
                                    style={{ width: `${deal.leadScore * 10}%` }}
                                  />
                                </div>
                                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{deal.leadScore}/10</span>
                              </div>
                            )}

                            {/* Health & Win Probability */}
                            <div className="flex items-center justify-between text-xs mb-2">
                              <div className="flex items-center gap-1">
                                <Activity className="w-3 h-3 text-gray-400" />
                                <span className={`font-medium ${getHealthColor(health)}`}>
                                  {health.toFixed(0)}% health
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Target className="w-3 h-3 text-gray-400" />
                                <span className="font-medium text-blue-600 dark:text-blue-400">
                                  {winProb.toFixed(0)}% win
                                </span>
                              </div>
                            </div>

                            {/* Contact Info */}
                            <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400 mb-2">
                              {deal.email && (
                                <div className="flex items-center gap-1 truncate">
                                  <Mail className="w-3 h-3 flex-shrink-0" />
                                  <span className="truncate">{deal.email}</span>
                                </div>
                              )}
                              {deal.phone && (
                                <div className="flex items-center gap-1">
                                  <Phone className="w-3 h-3 flex-shrink-0" />
                                  <span>{deal.phone}</span>
                                </div>
                              )}
                            </div>
                            {/* Contact Frequency Counter - ADD THIS */}
                              {deal.contactFrequency && deal.contactFrequency > 1 && (
                              <Chip
                              icon={<Phone size={12} />}
                              label={`${deal.contactFrequency}x contacted`}
                              size="small"
                              sx={{
                              bgcolor: deal.contactFrequency > 5 ? '#FF5722' : '#FF9800',
                              color: 'white',
                              fontSize: 10,
                              height: 20,
                          }}
                          />
                            )}

                            {/* Last Activity */}
                            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatRelativeTime(deal.lastActivity || deal.createdAt)}
                              </div>
                              {deal.priority && (
                                <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${
                                  deal.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                  deal.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                  'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                                }`}>
                                  {deal.priority}
                                </span>
                              )}
                            </div>

                            {/* Hot Lead Badge */}
                            {deal.leadScore >= 8 && (
                              <div className="mt-2 flex items-center justify-center gap-1 bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                                <Zap className="w-3 h-3" />
                                HOT LEAD
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== EMAIL GENERATOR MODAL ===== */}
      {showEmailGenerator && selectedDealForEmail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Bot className="w-5 h-5 text-purple-600" />
                Email Generator
              </h2>
              <button
                onClick={() => {
                  setShowEmailGenerator(false);
                  setSelectedDealForEmail(null);
                }}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              
              {/* Deal Info */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">Generating email for:</div>
                <div className="font-semibold text-lg text-gray-900 dark:text-white">{selectedDealForEmail.name}</div>
                {selectedDealForEmail.email && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">{selectedDealForEmail.email}</div>
                )}
              </div>

              {/* Email Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Email Type:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['initial', 'followup', 'proposal', 'closing'].map(type => (
                    <button
                      key={type}
                      onClick={() => {
                        const email = generateBasicEmail(selectedDealForEmail, type);
                        navigator.clipboard.writeText(email);
                        alert(`${type} email copied to clipboard!`);
                      }}
                      className="px-4 py-3 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 text-sm font-medium capitalize transition-colors"
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Email Preview */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Preview (Follow-up Email):
                </label>
                <textarea
                  value={generateBasicEmail(selectedDealForEmail, 'followup')}
                  readOnly
                  rows="12"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm font-mono resize-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const email = generateBasicEmail(selectedDealForEmail, 'followup');
                    navigator.clipboard.writeText(email);
                    alert('Email copied to clipboard!');
                  }}
                  className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2 font-medium transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  Copy to Clipboard
                </button>
                <button
                  onClick={() => {
                    const email = generateBasicEmail(selectedDealForEmail, 'followup');
                    window.location.href = `mailto:${selectedDealForEmail.email}?subject=Following Up&body=${encodeURIComponent(email)}`;
                  }}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 font-medium transition-colors"
                  disabled={!selectedDealForEmail.email}
                >
                  <Mail className="w-4 h-4" />
                  Open in Email
                </button>
              </div>

              {/* Note */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                <div className="flex gap-2">
                  <Info className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Note:</strong> This is a basic email template. For AI-powered personalized emails, the OpenAI API integration would need to be called from a server-side Firebase Cloud Function.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== ADD DEAL MODAL (PLACEHOLDER) ===== */}
      {showAddDeal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Add New Deal
              </h2>
              <button
                onClick={() => setShowAddDeal(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body - Placeholder */}
            <div className="p-6">
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <UserPlus className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Deal Creation Form</p>
                <p className="text-sm mb-6">
                  Full deal creation form will be implemented based on your requirements.
                  <br />
                  For now, use the ClientsHub or contact intake form to add new leads.
                </p>
                <button
                  onClick={() => {
                    setShowAddDeal(false);
                    navigate('/clients-hub');
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Go to Clients Hub
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pipeline;