// src/pages/Pipeline.jsx
// MEGA AI-POWERED SALES PIPELINE - ULTIMATE EDITION
// Features: AI Coach, Predictive Analytics, Smart Automation, Visual Insights

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import EnhancedPipelineAIService from '../services/EnhancedPipelineAIService';
import { 
  GitBranch, Plus, DollarSign, Users, Phone, Mail, Calendar, Clock,
  ChevronRight, MoreVertical, Edit2, Trash2, Star, AlertCircle, TrendingUp,
  Target, Award, X, Search, Filter, CheckCircle, XCircle, RefreshCw,
  Bot, Sparkles, Zap, Brain, Activity, BarChart3, MessageSquare,

      ? deals.reduce((sum, d) => sum + EnhancedPipelineAIService.ConversionIntelligence.calculateDealHealth(d), 0) / deals.length
      : 0;
    if (avgHealth < 60) {
      insights.push({
        type: 'info',
        icon: '💡',
        title: 'Pipeline Health Below Average',
        description: `Overall health is ${avgHealth.toFixed(0)}% - increase activity`,
        action: 'Boost Engagement',
        priority: 'medium'
      });
    }
    
    return insights;
  },

  // Forecast revenue with AI
  forecastRevenue: (deals, days = 30) => {
    const qualified = deals.filter(d => 
      ['qualified', 'proposal', 'negotiation'].includes(d.stage)
    );
    
    let forecast = 0;
    let bestCase = 0;
    let worstCase = 0;
    
    qualified.forEach(deal => {
      const probability = EnhancedPipelineAIService.ConversionIntelligence.calculateWinProbability(deal) / 100;
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

// ============================================================================
// MAIN PIPELINE COMPONENT
// ============================================================================

const Pipeline = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Core state
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draggedDeal, setDraggedDeal] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);
  
  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDeal, setShowAddDeal] = useState(false);
  const [selectedStage, setSelectedStage] = useState('');
  const [editingDeal, setEditingDeal] = useState(null);
  const [selectedDeals, setSelectedDeals] = useState([]);
  const [expandedDeals, setExpandedDeals] = useState(new Set());
  const [viewMode, setViewMode] = useState('kanban');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter state
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const [filterProduct, setFilterProduct] = useState('all');
  const [filterHealth, setFilterHealth] = useState('all');
  const [sortBy, setSortBy] = useState('value');
  const [showHotLeadsOnly, setShowHotLeadsOnly] = useState(false);
  
  // AI features state
  const [showAICoach, setShowAICoach] = useState(false);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [showEmailGenerator, setShowEmailGenerator] = useState(false);
  const [selectedDealForEmail, setSelectedDealForEmail] = useState(null);
  const [aiInsights, setAIInsights] = useState([]);
  const [forecastData, setForecastData] = useState(null);
  
  // Settings
  const [realtimeUpdates, setRealtimeUpdates] = useState(true);
  const [automationEnabled, setAutomationEnabled] = useState(true);
  const [forecastRange, setForecastRange] = useState(30);
  
  // Stats
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

  // Pipeline stages
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

  // Products
  const PRODUCTS = {
    'basic-repair': { name: 'Basic Credit Repair', value: 997, color: 'blue' },
    'full-repair': { name: 'Full Credit Repair', value: 1997, color: 'green' },
    'business-credit': { name: 'Business Credit', value: 2997, color: 'purple' },
    'monitoring': { name: 'Credit Monitoring', value: 497, color: 'yellow' },
    'consultation': { name: 'Consultation', value: 297, color: 'gray' },
    'complete-solution': { name: 'Complete Solution', value: 4997, color: 'indigo' }
  };

  // ============================================================================
  // DATA LOADING WITH REAL-TIME UPDATES
  // ============================================================================

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setDeals([]);
      return;
    }

    if (!realtimeUpdates) {
      setLoading(false);
      return;
    }

    let dealsReceived = false;
    let contactsReceived = false;
    
    const checkLoadingComplete = () => {
      if (dealsReceived && contactsReceived) {
        setLoading(false);
      }
    };

    // Listen to deals collection
    const q1 = query(collection(db, 'deals'), orderBy('createdAt', 'desc'));
    const unsubscribeDeals = onSnapshot(q1, 
      (snapshot) => {
        const dealsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          isDeal: true
        }));
        
        setDeals(prevDeals => {
          const merged = [...prevDeals.filter(d => !d.isDeal), ...dealsList];
          calculateStats(merged);
          return merged;
        });
        
        dealsReceived = true;
        checkLoadingComplete();
      },
      (error) => {
        console.error('Error loading deals:', error);
        dealsReceived = true;
        checkLoadingComplete();
      }
    );

    // Listen to leads from contacts
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
            name: `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.fullName || 'Unknown',
            company: data.company || '',
            email: data.email || '',
            phone: data.phone || '',
            value: data.estimatedValue || data.dealValue || 1500,
            stage: data.pipelineStage || 'new',
            priority: data.urgencyLevel || 'medium',
            source: data.source || 'manual',
            product: data.product || 'basic-repair',
            leadScore: data.leadScore || 5,
            urgencyLevel: data.urgencyLevel || 'medium',
            painPoints: data.painPoints || [],
            conversionProbability: data.conversionProbability || 50,
            nextAction: data.nextBestAction || '',
            tags: data.tags || [],
            createdAt: data.createdAt,
            aiGenerated: data.source === 'ai-receptionist',
            contactId: doc.id,
            isLead: true,
            engagementLevel: data.engagementLevel || 'medium',
            responseTime: data.responseTime || 'medium',
            budgetRange: data.budgetRange || 'unknown',
            competitorMentioned: data.competitorMentioned || false,
            lastActivity: data.lastActivity
          };
        });
        
        setDeals(prevDeals => {
          const merged = [...prevDeals.filter(d => !d.isLead), ...leadsList];
          calculateStats(merged);
          return merged;
        });
        
        contactsReceived = true;
        checkLoadingComplete();
      },
      (error) => {
        console.error('Error loading contacts:', error);
        contactsReceived = true;
        checkLoadingComplete();
      }
    );

    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn('Loading timeout, forcing completion');
        setLoading(false);
      }
    }, 5000);

    return () => {
      clearTimeout(timeoutId);
      unsubscribeDeals();
      unsubscribeContacts();
    };
  }, [user, realtimeUpdates]);

  // ============================================================================
  // STATS CALCULATION WITH AI ENHANCEMENTS
  // ============================================================================

  const calculateStats = useCallback((dealsList) => {
    const totalDeals = dealsList.length;
    const totalValue = dealsList.reduce((sum, d) => sum + (d.value || 0), 0);
    const wonDeals = dealsList.filter(d => d.stage === 'won');
    const lostDeals = dealsList.filter(d => d.stage === 'lost');
    const avgDealSize = totalDeals > 0 ? totalValue / totalDeals : 0;
    const conversionRate = (wonDeals.length + lostDeals.length) > 0 
      ? (wonDeals.length / (wonDeals.length + lostDeals.length)) * 100 
      : 0;

    // Velocity
    const lastWeekDeals = dealsList.filter(d => {
      const created = d.createdAt?.seconds ? new Date(d.createdAt.seconds * 1000) : new Date(d.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return created > weekAgo;
    });
    const velocity = lastWeekDeals.length;

    // AI-powered metrics
    const avgHealth = dealsList.length > 0
      ? dealsList.reduce((sum, d) => sum + EnhancedPipelineAIService.ConversionIntelligence.calculateDealHealth(d), 0) / dealsList.length
      : 0;
    
    const avgWinProb = dealsList.filter(d => !['won', 'lost'].includes(d.stage)).length > 0
      ? dealsList
          .filter(d => !['won', 'lost'].includes(d.stage))
          .reduce((sum, d) => sum + EnhancedPipelineAIService.calculateWinProbability(d), 0) / 
          dealsList.filter(d => !['won', 'lost'].includes(d.stage)).length
      : 0;

    // At risk deals
    const atRiskDeals = dealsList.filter(d => EnhancedPipelineAIService.ConversionIntelligence.calculateDealHealth(d) < 40 && !['won', 'lost'].includes(d.stage));
    
    // Hot leads
    const hotLeads = dealsList.filter(d => d.leadScore >= 8 && !['won', 'lost'].includes(d.stage)).length;
    
    // AI generated
    const aiGeneratedDeals = dealsList.filter(d => d.aiGenerated || d.source === 'ai-receptionist').length;

    // Forecast
    const forecastData = AIService.forecastRevenue(dealsList, forecastRange);

    setStats({
      totalValue,
      totalDeals,
      avgDealSize,
      conversionRate,
      avgCycleTime: 0, // Would calculate from historical data
      velocity,
      forecast: forecastData.likely,
      atRisk: atRiskDeals.length,
      hotLeads,
      aiGeneratedDeals,
      avgHealth,
      avgWinProb,
      stageConversion: {}
    });

    setForecastData(forecastData);

    // Generate AI insights
    const insights = AIService.getAIInsights(dealsList);
    setAIInsights(insights);
  }, [forecastRange]);

  // ============================================================================
  // DRAG & DROP HANDLERS
  // ============================================================================

  const handleDragStart = (e, deal) => {
    setDraggedDeal(deal);
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.classList.add('opacity-50');
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('opacity-50');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e, stageId) => {
    e.preventDefault();
    setDragOverStage(stageId);
  };

  const handleDragLeave = (e) => {
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setDragOverStage(null);
  };

  const handleDrop = async (e, newStage) => {
    e.preventDefault();
    setDragOverStage(null);
    
    if (draggedDeal && draggedDeal.stage !== newStage) {
      try {
        // Update local state immediately
        const updatedDeals = deals.map(deal => 
          deal.id === draggedDeal.id 
            ? { ...deal, stage: newStage, lastActivity: new Date() }
            : deal
        );
        setDeals(updatedDeals);
        calculateStats(updatedDeals);

        // Update Firebase
        const isContact = draggedDeal.isLead || draggedDeal.contactId;
        
        if (isContact && draggedDeal.contactId) {
          const contactRef = doc(db, 'contacts', draggedDeal.contactId);
          const updateData = {
            pipelineStage: newStage,
            lastActivity: serverTimestamp(),
            updatedAt: serverTimestamp()
          };
          
          if (newStage === 'won') {
            updateData.lifecycleStatus = 'completed';
            updateData.primaryRole = 'client';
            updateData.roles = arrayUnion('client');
          } else if (newStage === 'lost') {
            updateData.lifecycleStatus = 'lost';
          }
          
          await updateDoc(contactRef, updateData);
        } else if (!draggedDeal.isDemoData) {
          const dealRef = doc(db, 'deals', draggedDeal.id);
          const updateData = {
            stage: newStage,
            lastActivity: serverTimestamp(),
            updatedAt: serverTimestamp()
          };
          
          if (newStage === 'won') {
            updateData.closedAt = serverTimestamp();
            updateData.status = 'closed-won';
          } else if (newStage === 'lost') {
            updateData.closedAt = serverTimestamp();
            updateData.status = 'closed-lost';
          }
          
          await updateDoc(dealRef, updateData);
        }

        showNotification(`${draggedDeal.name} moved to ${newStage}`, 'success');
      } catch (error) {
        console.error('Error updating deal:', error);
        showNotification('Error updating stage', 'error');
      }
    }
    
    setDraggedDeal(null);
  };

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const showNotification = (message, type = 'info') => {
    console.log(`[${type.toUpperCase()}] ${message}`);
    // In production, use proper notification system
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
    return d.toLocaleDateString();
  };

  const getHealthColor = (health) => {
    if (health >= 70) return 'text-green-600';
    if (health >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthBgColor = (health) => {
    if (health >= 70) return 'bg-green-100';
    if (health >= 40) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      critical: 'bg-red-100 text-red-700 border-red-300',
      high: 'bg-orange-100 text-orange-700 border-orange-300',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      low: 'bg-green-100 text-green-700 border-green-300'
    };
    return colors[priority] || colors.medium;
  };

  // ============================================================================
  // FILTERING & SORTING
  // ============================================================================

  const getFilteredDeals = useMemo(() => {
    let filtered = [...deals];
    
    // Hot leads filter
    if (showHotLeadsOnly) {
      filtered = filtered.filter(d => d.leadScore >= 8);
    }
    
    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(deal =>
        deal.name?.toLowerCase().includes(term) ||
        deal.company?.toLowerCase().includes(term) ||
        deal.email?.toLowerCase().includes(term) ||
        deal.phone?.includes(term)
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
        const health = AIService.calculateDealHealth(d);
        if (filterHealth === 'healthy') return health >= 70;
        if (filterHealth === 'warning') return health >= 40 && health < 70;
        if (filterHealth === 'critical') return health < 40;
        return true;
      });
    }
    
    // Sort
    filtered.sort((a, b) => {
      switch(sortBy) {
        case 'value':
          return (b.value || 0) - (a.value || 0);
        case 'health':
          return EnhancedPipelineAIService.ConversionIntelligence.calculateDealHealth(b) - EnhancedPipelineAIService.ConversionIntelligence.calculateDealHealth(a);
        case 'probability':
          return EnhancedPipelineAIService.ConversionIntelligence.calculateWinProbability(b) - EnhancedPipelineAIService.ConversionIntelligence.calculateWinProbability(a);
        case 'score':
          return (b.leadScore || 0) - (a.leadScore || 0);
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [deals, searchTerm, filterPriority, filterSource, filterProduct, filterHealth, sortBy, showHotLeadsOnly]);

  const getDealsForStage = useCallback((stageId) => {
    return getFilteredDeals.filter(deal => deal.stage === stageId);
  }, [getFilteredDeals]);

  // ============================================================================
  // RENDER - Due to size, continuing in next message
  // ============================================================================

// ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const getStageMetrics = useCallback((stageId) => {
    const stageDeals = getDealsForStage(stageId);
    const value = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0);
    const avgHealth = stageDeals.length > 0

            : health < 40
            ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
            : 'border-transparent'
        }`}
        onClick={() => {
          if (isExpanded) {
            const newExpanded = new Set(expandedDeals);
            newExpanded.delete(deal.id);
            setExpandedDeals(newExpanded);
          } else {
            setExpandedDeals(new Set([...expandedDeals, deal.id]));
          }
        }}
      >
        {/* Header Row */}
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {deal.aiGenerated && (
              <Bot className="w-4 h-4 text-purple-600 flex-shrink-0" title="AI Generated" />
            )}
            <h4 className="font-semibold text-gray-900 dark:text-white truncate text-sm">
              {deal.name}
            </h4>
          </div>
          <div className="flex items-center gap-1 ml-2">
            <span className={`px-2 py-0.5 text-xs font-medium rounded ${getPriorityColor(deal.priority || 'medium')}`}>
              {deal.priority || 'med'}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditingDeal(deal);
              }}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
            >
              <MoreVertical className="w-3 h-3 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Company */}
        {deal.company && (
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 truncate">
            {deal.company}
          </p>
        )}

        {/* Value & Scores Row */}
        <div className="flex items-center justify-between mb-2">
          <div className="text-base font-bold text-blue-600">
            {formatCurrency(deal.value)}
          </div>
          <div className="flex items-center gap-2">
            {/* Lead Score */}
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
              deal.leadScore >= 8 ? 'bg-red-100 text-red-700' :
              deal.leadScore >= 6 ? 'bg-orange-100 text-orange-700' :
              deal.leadScore >= 4 ? 'bg-yellow-100 text-yellow-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {deal.leadScore || 0}/10
            </span>
            {/* Health Score */}
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${getHealthBgColor(health)} ${getHealthColor(health)}`}>
              {health}%
            </span>
            {/* Win Probability */}
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
              winProb >= 75 ? 'bg-green-100 text-green-700' :
              winProb >= 50 ? 'bg-blue-100 text-blue-700' :
              winProb >= 25 ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {winProb}%
            </span>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400 mb-2">
          {deal.email && (
            <div className="flex items-center gap-1 truncate">
              <Mail className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{deal.email}</span>
            </div>
          )}
          {deal.phone && (
            <div className="flex items-center gap-1">
              <Phone className="w-3 h-3 flex-shrink-0" />
              {deal.phone}
            </div>
          )}
        </div>

        {/* AI Next Best Action */}
        {nextAction && (
          <div className="mt-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded text-xs">
            <div className="flex items-center gap-1 font-semibold text-purple-900 dark:text-purple-200">
              <Lightbulb className="w-3 h-3" />
              AI Suggests:
            </div>
            <div className="text-purple-700 dark:text-purple-300 mt-1">
              {nextAction.icon} {nextAction.action}
            </div>
          </div>
        )}

        {/* Product Badge */}
        {deal.product && PRODUCTS[deal.product] && (
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
            <span className={`text-xs px-2 py-1 rounded bg-${PRODUCTS[deal.product].color}-100 text-${PRODUCTS[deal.product].color}-700`}>
              {PRODUCTS[deal.product].name}
            </span>
          </div>
        )}

        {/* Expanded Details */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 space-y-2 text-xs">
            {deal.painPoints && deal.painPoints.length > 0 && (
              <div>
                <strong className="text-gray-700 dark:text-gray-300">Pain Points:</strong>
                <div className="flex flex-wrap gap-1 mt-1">
                  {deal.painPoints.map((point, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                      {point}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {deal.tags && deal.tags.length > 0 && (
              <div>
                <strong className="text-gray-700 dark:text-gray-300">Tags:</strong>
                <div className="flex flex-wrap gap-1 mt-1">
                  {deal.tags.map((tag, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 mt-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/contacts/${deal.contactId || deal.id}`);
                }}
                className="px-2 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 flex items-center justify-center gap-1"
              >
                <Eye className="w-3 h-3" />
                View
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedDealForEmail(deal);
                  setShowEmailGenerator(true);
                }}
                className="px-2 py-1.5 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 flex items-center justify-center gap-1"
              >
                <Bot className="w-3 h-3" />
                AI Email
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = `tel:${deal.phone}`;
                }}
                className="px-2 py-1.5 bg-green-600 text-white rounded text-xs hover:bg-green-700 flex items-center justify-center gap-1"
                disabled={!deal.phone}
              >
                <Phone className="w-3 h-3" />
                Call
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = `mailto:${deal.email}`;
                }}
                className="px-2 py-1.5 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700 flex items-center justify-center gap-1"
                disabled={!deal.email}
              >
                <Mail className="w-3 h-3" />
                Email
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading AI-Powered Pipeline...</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Analyzing deals and generating insights</p>
        </div>
      </div>
    );
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Enhanced Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex-shrink-0">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <GitBranch className="h-7 w-7 text-blue-600" />
              AI-Powered Sales Pipeline
              {realtimeUpdates && (
                <span className="flex items-center gap-1 text-sm font-normal text-green-600">
                  <Wifi className="h-4 w-4 animate-pulse" />
                  Live
                </span>
              )}
              {automationEnabled && (
                <span className="flex items-center gap-1 text-sm font-normal text-purple-600">
                  <Bot className="h-4 w-4" />
                  AI Active
                </span>
              )}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {stats.totalDeals} deals • {formatCurrency(stats.totalValue)} pipeline • {stats.avgWinProb.toFixed(0)}% avg win rate
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAICoach(!showAICoach)}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 flex items-center gap-2 shadow-lg"
            >
              <Brain className="w-4 h-4" />
              AI Coach
            </button>
            <button
              onClick={() => setShowAIInsights(!showAIInsights)}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 flex items-center gap-2 shadow-lg"
            >
              <Sparkles className="w-4 h-4" />
              Insights
            </button>
            <button
              onClick={() => {
                setShowAddDeal(true);
                setSelectedStage('');
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Deal
            </button>
          </div>
        </div>

        {/* Enhanced Stats Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mt-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs opacity-90">Pipeline</span>
              <DollarSign className="w-4 h-4 opacity-80" />
            </div>
            <div className="text-xl font-bold">{formatCurrency(stats.totalValue)}</div>
            <div className="text-xs opacity-75">{stats.totalDeals} deals</div>
          </div>
          
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs opacity-90">Win Rate</span>
              <TrendingUp className="w-4 h-4 opacity-80" />
            </div>
            <div className="text-xl font-bold">{stats.conversionRate.toFixed(0)}%</div>
            <div className="text-xs opacity-75">conversion</div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs opacity-90">Forecast</span>
              <PieChart className="w-4 h-4 opacity-80" />
            </div>
            <div className="text-xl font-bold">{formatCurrency(stats.forecast)}</div>
            <div className="text-xs opacity-75">{forecastRange}d</div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs opacity-90">Avg Deal</span>
              <Target className="w-4 h-4 opacity-80" />
            </div>
            <div className="text-xl font-bold">{formatCurrency(stats.avgDealSize)}</div>
            <div className="text-xs opacity-75">per deal</div>
          </div>
          
          <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs opacity-90">Hot Leads</span>
              <Flame className="w-4 h-4 opacity-80" />
            </div>
            <div className="text-xl font-bold">{stats.hotLeads}</div>
            <div className="text-xs opacity-75">score 8+</div>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs opacity-90">At Risk</span>
              <AlertTriangle className="w-4 h-4 opacity-80" />
            </div>
            <div className="text-xl font-bold">{stats.atRisk}</div>
            <div className="text-xs opacity-75">unhealthy</div>
          </div>
          
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs opacity-90">Avg Health</span>
              <Activity className="w-4 h-4 opacity-80" />
            </div>
            <div className="text-xl font-bold">{stats.avgHealth.toFixed(0)}%</div>
            <div className="text-xs opacity-75">pipeline</div>
          </div>
          
          <div className="bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs opacity-90">AI Deals</span>
              <Bot className="w-4 h-4 opacity-80" />
            </div>
            <div className="text-xl font-bold">{stats.aiGeneratedDeals}</div>
            <div className="text-xs opacity-75">auto-gen</div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="mt-4 space-y-3">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search deals by name, company, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <button
              onClick={() => setShowHotLeadsOnly(!showHotLeadsOnly)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                showHotLeadsOnly 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              <Flame className="w-4 h-4" />
              Hot Only
            </button>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="value">💰 Deal Value</option>
              <option value="health">❤️ Health Score</option>
              <option value="probability">🎯 Win Probability</option>
              <option value="score">⭐ Lead Score</option>
            </select>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                showFilters ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {(filterPriority !== 'all' || filterSource !== 'all' || filterProduct !== 'all' || filterHealth !== 'all') && (
                <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  •
                </span>
              )}
            </button>
            
            <button
              onClick={() => setAutomationEnabled(!automationEnabled)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                automationEnabled 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'bg-gray-100 text-gray-700'
              }`}
              title={automationEnabled ? 'AI Automation On' : 'AI Automation Off'}
            >
              <Bot className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => setRealtimeUpdates(!realtimeUpdates)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                realtimeUpdates 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-700'
              }`}
              title={realtimeUpdates ? 'Real-time On' : 'Real-time Off'}
            >
              {realtimeUpdates ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            </button>
          </div>
          
          {/* Expanded Filters */}
          {showFilters && (
            <div className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
              >
                <option value="all">All Priorities</option>
                <option value="critical">🚨 Critical</option>
                <option value="high">🔥 High</option>
                <option value="medium">⚡ Medium</option>
                <option value="low">❄️ Low</option>
              </select>
              
              <select
                value={filterHealth}
                onChange={(e) => setFilterHealth(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
              >
                <option value="all">All Health Levels</option>
                <option value="healthy">✅ Healthy (70%+)</option>
                <option value="warning">⚠️ Warning (40-70%)</option>
                <option value="critical">🚨 Critical (&lt;40%)</option>
              </select>
              
              <select
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
              >
                <option value="all">All Sources</option>
                <option value="ai-receptionist">🤖 AI Receptionist</option>
                <option value="website">🌐 Website</option>
                <option value="referral">👥 Referral</option>
                <option value="email">📧 Email</option>
                <option value="phone">📞 Phone</option>
                <option value="social">📱 Social</option>
              </select>
              
              <select
                value={filterProduct}
                onChange={(e) => setFilterProduct(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
              >
                <option value="all">All Products</option>
                {Object.entries(PRODUCTS).map(([key, product]) => (
                  <option key={key} value={key}>{product.name}</option>
                ))}
              </select>
              
              <button
                onClick={() => {
                  setFilterPriority('all');
                  setFilterSource('all');
                  setFilterProduct('all');
                  setFilterHealth('all');
                }}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Clear All
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto bg-gray-50 dark:bg-gray-900">
        <div className="flex gap-4 p-6 min-w-max h-full">
          {stages.map(stage => {
            const metrics = getStageMetrics(stage.id);
            const StageIcon = stage.icon;
            
            return (
              <div
                key={stage.id}
                className="w-80 flex flex-col"
                onDragOver={handleDragOver}
                onDragEnter={(e) => handleDragEnter(e, stage.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, stage.id)}
              >
                {/* Stage Header */}
                <div className={`${stage.color} text-white rounded-t-lg p-3 shadow-lg`}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <StageIcon className="h-5 w-5" />
                      <div>
                        <h3 className="font-semibold">{stage.title}</h3>
                        <p className="text-xs opacity-90 mt-0.5">{stage.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs opacity-90">{metrics.count} deals</div>
                      <div className="text-sm font-semibold">{formatCurrency(metrics.value)}</div>
                    </div>
                  </div>
                  
                  {/* AI Metrics Bar */}
                  <div className="mt-2 pt-2 border-t border-white/20 grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className="opacity-75">Health</div>
                      <div className="font-semibold">{metrics.avgHealth}%</div>
                    </div>
                    <div className="text-center">
                      <div className="opacity-75">Win %</div>
                      <div className="font-semibold">{metrics.avgWinProb}%</div>
                    </div>
                    <div className="text-center">
                      <div className="opacity-75">Hot</div>
                      <div className="font-semibold">{metrics.hotCount}</div>
                    </div>
                  </div>
                </div>

                {/* Cards Container */}
                <div className={`flex-1 bg-gray-100 dark:bg-gray-800 rounded-b-lg p-3 space-y-3 overflow-y-auto ${
                  dragOverStage === stage.id ? 'bg-blue-100 dark:bg-blue-900/30' : ''
                }`}>
                  {/* Add Deal Button */}
                  <button
                    onClick={() => {
                      setSelectedStage(stage.id);
                      setShowAddDeal(true);
                    }}
                    className="w-full p-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition-colors flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 hover:text-blue-600"
                  >
                    <Plus className="w-4 h-4" />
                    Quick Add
                  </button>

                  {/* Deal Cards */}
                  {getDealsForStage(stage.id).map(deal => (
                    <DealCard key={deal.id} deal={deal} />
                  ))}
                  
                  {getDealsForStage(stage.id).length === 0 && (
                    <div className="text-center py-8 text-gray-400 dark:text-gray-600 text-sm">
                      No deals in this stage
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI COACH PANEL */}
      {showAICoach && (
        <div className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-800 shadow-2xl z-50 overflow-y-auto border-l-4 border-purple-500">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Brain className="h-6 w-6 text-purple-600" />
                AI Deal Coach
              </h2>
              <button
                onClick={() => setShowAICoach(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Today's Priority Actions */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-purple-600" />
                  Priority Actions Today
                </h3>
                <div className="space-y-2">
                  {deals
                    .filter(d => !['won', 'lost'].includes(d.stage))
                    .sort((a, b) => {
                      const scoreA = (a.leadScore || 0) + (AIService.calculateDealHealth(a) < 40 ? 5 : 0);
                      const scoreB = (b.leadScore || 0) + (AIService.calculateDealHealth(b) < 40 ? 5 : 0);
                      return scoreB - scoreA;
                    })
                    .slice(0, 5)
                    .map(deal => {
                      const action = AIService.getNextBestAction(deal);
                      const health = AIService.calculateDealHealth(deal);
                      return (
                        <div key={deal.id} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="font-medium text-sm">{deal.name}</div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">{formatCurrency(deal.value)}</div>
                            </div>
                            <div className={`text-xs font-bold px-2 py-1 rounded ${getHealthBgColor(health)} ${getHealthColor(health)}`}>
                              {health}%
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className={`px-2 py-1 rounded font-medium ${
                              action.priority === 'critical' ? 'bg-red-100 text-red-700' :
                              action.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {action.icon} {action.action}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            {action.reason}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Deal Health Overview */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  Pipeline Health
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded">
                    <span className="text-sm flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Healthy Deals
                    </span>
                    <span className="font-bold text-green-700 dark:text-green-400">
                      {deals.filter(d => AIService.calculateDealHealth(d) >= 70).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                    <span className="text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                      Needs Attention
                    </span>
                    <span className="font-bold text-yellow-700 dark:text-yellow-400">
                      {deals.filter(d => {
                        const h = AIService.calculateDealHealth(d);
                        return h >= 40 && h < 70;
                      }).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900/20 rounded">
                    <span className="text-sm flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      Critical
                    </span>
                    <span className="font-bold text-red-700 dark:text-red-400">
                      {deals.filter(d => AIService.calculateDealHealth(d) < 40).length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Win Opportunities */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Rocket className="w-4 h-4 text-green-600" />
                  Quick Win Opportunities
                </h3>
                <div className="space-y-2">
                  {deals
                    .filter(d => EnhancedPipelineAIService.calculateWinProbability(d) > 75 && !['won', 'lost'].includes(d.stage))
                    .slice(0, 3)
                    .map(deal => (
                      <div key={deal.id} className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{deal.name}</span>
                          <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded">
                            {EnhancedPipelineAIService.calculateWinProbability(deal)}% win
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {formatCurrency(deal.value)} • {deal.stage}
                        </div>
                        <button
                          onClick={() => navigate(`/contacts/${deal.contactId || deal.id}`)}
                          className="mt-2 w-full text-xs bg-green-600 text-white py-1 rounded hover:bg-green-700"
                        >
                          Close This Deal
                        </button>
                      </div>
                    ))}
                  {deals.filter(d => EnhancedPipelineAIService.calculateWinProbability(d) > 75 && !['won', 'lost'].includes(d.stage)).length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                      No high-probability deals right now. Focus on moving deals forward!
                    </p>
                  )}
                </div>
              </div>

              {/* AI Training Tips */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-600" />
                  Sales Tips
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="font-medium text-blue-900 dark:text-blue-200">💡 Follow-up Timing</div>
                    <div className="text-blue-700 dark:text-blue-300 text-xs mt-1">
                      Best time to follow up is within 5 minutes of initial contact. 78% higher response rate.
                    </div>
                  </div>
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="font-medium text-purple-900 dark:text-purple-200">📞 Multiple Touchpoints</div>
                    <div className="text-purple-700 dark:text-purple-300 text-xs mt-1">
                      It takes 8+ touchpoints to reach a prospect. Don't give up after 2-3 attempts!
                    </div>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="font-medium text-green-900 dark:text-green-200">🎯 Value First</div>
                    <div className="text-green-700 dark:text-green-300 text-xs mt-1">
                      Lead with value, not features. Focus on solving their pain points.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI INSIGHTS PANEL */}
      {showAIInsights && (
        <div className="fixed right-0 top-0 h-full w-[500px] bg-white dark:bg-gray-800 shadow-2xl z-50 overflow-y-auto border-l-4 border-blue-500">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-blue-600" />
                AI Pipeline Insights
              </h2>
              <button
                onClick={() => setShowAIInsights(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Revenue Forecast */}
              <div>
                <h3 className="font-semibold mb-3">Revenue Forecast ({forecastRange} days)</h3>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg">
                  <div className="text-3xl font-bold text-blue-900 dark:text-blue-200 mb-2">
                    {formatCurrency(forecastData?.likely || 0)}
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                    Likely outcome • {forecastData?.confidence || 'medium'} confidence
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Best Case (90%):</span>
                      <span className="font-bold text-green-700 dark:text-green-400">
                        {formatCurrency(forecastData?.bestCase || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Likely (50%):</span>
                      <span className="font-bold text-blue-700 dark:text-blue-400">
                        {formatCurrency(forecastData?.likely || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Worst Case (10%):</span>
                      <span className="font-bold text-orange-700 dark:text-orange-400">
                        {formatCurrency(forecastData?.worstCase || 0)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Forecast Range Selector */}
                  <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
                    <label className="text-xs text-gray-600 dark:text-gray-400 mb-2 block">Forecast Range:</label>
                    <select
                      value={forecastRange}
                      onChange={(e) => setForecastRange(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    >
                      <option value={7}>7 days</option>
                      <option value={14}>14 days</option>
                      <option value={30}>30 days</option>
                      <option value={60}>60 days</option>
                      <option value={90}>90 days</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* AI Recommendations */}
              <div>
                <h3 className="font-semibold mb-3">AI Recommendations</h3>
                <div className="space-y-3">
                  {aiInsights.length > 0 ? (
                    aiInsights.map((insight, index) => (
                      <div 
                        key={index}
                        className={`p-4 rounded-lg ${
                          insight.type === 'danger' ? 'bg-red-50 dark:bg-red-900/20 border border-red-200' :
                          insight.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200' :
                          insight.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border border-green-200' :
                          'bg-blue-50 dark:bg-blue-900/20 border border-blue-200'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{insight.icon}</span>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900 dark:text-white mb-1">
                              {insight.title}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                              {insight.description}
                            </div>
                            {insight.deals && insight.deals.length > 0 && (
                              <div className="mb-2">
                                <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Top deals:
                                </div>
                                {insight.deals.slice(0, 3).map(deal => (
                                  <div key={deal.id} className="text-xs text-gray-600 dark:text-gray-400">
                                    • {deal.name} - {formatCurrency(deal.value)}
                                  </div>
                                ))}
                              </div>
                            )}
                            <button className={`text-xs font-medium px-3 py-1 rounded ${
                              insight.type === 'danger' ? 'bg-red-600 text-white hover:bg-red-700' :
                              insight.type === 'warning' ? 'bg-yellow-600 text-white hover:bg-yellow-700' :
                              insight.type === 'success' ? 'bg-green-600 text-white hover:bg-green-700' :
                              'bg-blue-600 text-white hover:bg-blue-700'
                            }`}>
                              {insight.action}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Bot className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Your pipeline is looking good! Keep up the great work.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Performance Metrics */}
              <div>
                <h3 className="font-semibold mb-3">Performance Metrics</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Average Deal Health</span>
                      <span className={`text-lg font-bold ${getHealthColor(stats.avgHealth)}`}>
                        {stats.avgHealth.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          stats.avgHealth >= 70 ? 'bg-green-500' :
                          stats.avgHealth >= 40 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${stats.avgHealth}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Average Win Probability</span>
                      <span className="text-lg font-bold text-blue-600">
                        {stats.avgWinProb.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-blue-500 transition-all"
                        style={{ width: `${stats.avgWinProb}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Win Rate</span>
                      <span className="text-lg font-bold text-green-600">
                        {stats.conversionRate.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-green-500 transition-all"
                        style={{ width: `${stats.conversionRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Stage Analysis */}
              <div>
                <h3 className="font-semibold mb-3">Stage Analysis</h3>
                <div className="space-y-2">
                  {stages.filter(s => !['won', 'lost'].includes(s.id)).map(stage => {
                    const stageDeals = getDealsForStage(stage.id);
                    const avgHealth = stageDeals.length > 0
                      ? stageDeals.reduce((sum, d) => sum + AIService.calculateDealHealth(d), 0) / stageDeals.length
                      : 0;
                    
                    return (
                      <div key={stage.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded">
                        <div className="flex items-center gap-2">
                          <stage.icon className="w-4 h-4 text-gray-600" />
                          <span className="text-sm font-medium">{stage.title}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500">{stageDeals.length} deals</span>
                          <span className={`text-xs font-bold ${getHealthColor(avgHealth)}`}>
                            {avgHealth.toFixed(0)}% health
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI EMAIL GENERATOR MODAL */}
      {showEmailGenerator && selectedDealForEmail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Bot className="h-5 w-5 text-purple-600" />
                AI Email Generator
              </h2>
              <button
                onClick={() => {
                  setShowEmailGenerator(false);
                  setSelectedDealForEmail(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Generating email for:</div>
                <div className="font-semibold text-lg">{selectedDealForEmail.name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{selectedDealForEmail.email}</div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Type:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['initial', 'followup', 'proposal', 'closing'].map(type => (
                    <button
                      key={type}
                      onClick={() => {
                        const email = AIService.generateEmail(selectedDealForEmail, type);
                        navigator.clipboard.writeText(email);
                        alert(`${type} email copied to clipboard!`);
                      }}
                      className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 text-sm font-medium capitalize"
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Preview:
                </label>
                <textarea
                  value={AIService.generateEmail(selectedDealForEmail, 'followup')}
                  readOnly
                  rows="12"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm font-mono"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const email = AIService.generateEmail(selectedDealForEmail, 'followup');
                    navigator.clipboard.writeText(email);
                    alert('Email copied to clipboard!');
                  }}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy to Clipboard
                </button>
                <button
                  onClick={() => {
                    window.location.href = `mailto:${selectedDealForEmail.email}?subject=Credit Repair&body=${encodeURIComponent(AIService.generateEmail(selectedDealForEmail, 'followup'))}`;
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Open in Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD/EDIT DEAL MODAL - Simplified for brevity */}
      {(showAddDeal || editingDeal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingDeal ? 'Edit Deal' : 'Add New Deal'}
              </h2>
              <button
                onClick={() => {
                  setShowAddDeal(false);
                  setEditingDeal(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p className="mb-4">Deal creation form goes here</p>
                <p className="text-sm">You can add full form fields based on your requirements</p>
                <button
                  onClick={() => {
                    setShowAddDeal(false);
                    setEditingDeal(null);
                  }}
                  className="mt-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
                >
                  Close
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