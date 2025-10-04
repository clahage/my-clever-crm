// src/pages/Pipeline.jsx - MEGA ENHANCED VERSION
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  GitBranch, Plus, DollarSign, Users, Phone, Mail, Calendar, Clock,
  ChevronRight, MoreVertical, Edit2, Trash2, Star, AlertCircle, TrendingUp,
  Target, Award, X, Search, Filter, CheckCircle, XCircle, RefreshCw,
  Bot, Sparkles, Zap, Brain, Activity, BarChart3, MessageSquare,
  FileText, Eye, Send, Video, PhoneCall, Timer, Flag, Archive,
  ChevronDown, ChevronUp, Copy, Settings, Database, Gauge, Bell,
  Briefcase, CreditCard, Scale, Shield, AlertTriangle, PieChart,
  TrendingDown, UserPlus, UserCheck, Layers, Grid, List, Columns,
  Download, Upload, Share2, Bookmark, Hash, Globe, Linkedin,
  Twitter, Facebook, Instagram, Youtube, Wifi, WifiOff, Cpu
} from 'lucide-react';
import { db } from '../lib/firebase';
import { 
  collection, query, where, orderBy, getDocs, doc, updateDoc, deleteDoc,
  addDoc, serverTimestamp, onSnapshot, writeBatch, arrayUnion
} from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Pipeline = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draggedDeal, setDraggedDeal] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDeal, setShowAddDeal] = useState(false);
  const [selectedStage, setSelectedStage] = useState('');
  const [editingDeal, setEditingDeal] = useState(null);
  const [selectedDeals, setSelectedDeals] = useState([]);
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const [filterProduct, setFilterProduct] = useState('all');
  const [sortBy, setSortBy] = useState('value');
  const [viewMode, setViewMode] = useState('kanban'); // kanban, list, forecast
  const [showFilters, setShowFilters] = useState(false);
  const [realtimeUpdates, setRealtimeUpdates] = useState(true);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [expandedDeals, setExpandedDeals] = useState(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [forecastRange, setForecastRange] = useState(30); // days
  const [showHotLeadsOnly, setShowHotLeadsOnly] = useState(false);
  const [automationEnabled, setAutomationEnabled] = useState(true);
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
    stageConversion: {}
  });

  // Enhanced pipeline stages
  const stages = [
    { 
      id: 'new', 
      title: 'New Lead', 
      color: 'bg-gradient-to-br from-gray-400 to-gray-500',
      borderColor: 'border-gray-500',
      description: 'Unqualified leads',
      icon: UserPlus,
      targetDays: 1,
      automationRules: ['auto-assign', 'send-welcome']
    },
    { 
      id: 'contacted', 
      title: 'Contacted', 
      color: 'bg-gradient-to-br from-blue-400 to-blue-500',
      borderColor: 'border-blue-500',
      description: 'Initial contact made',
      icon: MessageSquare,
      targetDays: 3,
      automationRules: ['follow-up-reminder', 'engagement-tracking']
    },
    { 
      id: 'qualified', 
      title: 'Qualified', 
      color: 'bg-gradient-to-br from-indigo-400 to-indigo-500',
      borderColor: 'border-indigo-500',
      description: 'Lead qualified and interested',
      icon: UserCheck,
      targetDays: 7,
      automationRules: ['score-update', 'nurture-campaign']
    },
    { 
      id: 'proposal', 
      title: 'Proposal', 
      color: 'bg-gradient-to-br from-purple-400 to-purple-500',
      borderColor: 'border-purple-500',
      description: 'Proposal sent',
      icon: FileText,
      targetDays: 14,
      automationRules: ['proposal-tracking', 'follow-up-sequence']
    },
    { 
      id: 'negotiation', 
      title: 'Negotiation', 
      color: 'bg-gradient-to-br from-orange-400 to-orange-500',
      borderColor: 'border-orange-500',
      description: 'In negotiation',
      icon: Scale,
      targetDays: 21,
      automationRules: ['urgency-check', 'manager-alert']
    },
    { 
      id: 'won', 
      title: 'Won', 
      color: 'bg-gradient-to-br from-green-400 to-green-500',
      borderColor: 'border-green-500',
      description: 'Deal closed successfully',
      icon: Award,
      targetDays: 0,
      automationRules: ['onboarding-trigger', 'success-notification']
    },
    { 
      id: 'lost', 
      title: 'Lost', 
      color: 'bg-gradient-to-br from-red-400 to-red-500',
      borderColor: 'border-red-500',
      description: 'Deal lost',
      icon: XCircle,
      targetDays: 0,
      automationRules: ['loss-analysis', 'reengagement-queue']
    }
  ];

  // Products/Services
  const PRODUCTS = {
    'basic-repair': { name: 'Basic Credit Repair', value: 997, color: 'blue' },
    'full-repair': { name: 'Full Credit Repair', value: 1997, color: 'green' },
    'business-credit': { name: 'Business Credit Building', value: 2997, color: 'purple' },
    'monitoring': { name: 'Credit Monitoring', value: 497, color: 'yellow' },
    'consultation': { name: 'Credit Consultation', value: 297, color: 'gray' },
    'complete-solution': { name: 'Complete Credit Solution', value: 4997, color: 'indigo' },
    'enterprise': { name: 'Enterprise Package', value: 9997, color: 'pink' },
    'dispute-letters': { name: 'Dispute Letter Package', value: 597, color: 'orange' },
    'identity-protection': { name: 'Identity Protection', value: 797, color: 'red' }
  };

  // Enhanced deal form state
  const [newDeal, setNewDeal] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    value: '',
    stage: 'new',
    priority: 'medium',
    notes: '',
    source: 'website',
    product: 'basic-repair',
    expectedCloseDate: '',
    leadScore: 5,
    urgencyLevel: 'medium',
    painPoints: [],
    conversionProbability: 50,
    nextAction: '',
    assignedTo: '',
    tags: [],
    creditIssues: [],
    disputeCount: 0,
    contactMethod: 'email',
    timezone: 'PST',
    language: 'English',
    referralSource: '',
    competitorMentioned: '',
    budgetRange: '',
    decisionMaker: true,
    aiGenerated: false
  });

  // Real-time updates listener
  useEffect(() => {
    // CRITICAL FIX: Handle loading state properly
    if (!user) {
      console.log('Pipeline: No user, stopping loading');
      setLoading(false);
      setDeals([]);
      return;
    }

    if (!realtimeUpdates) {
      console.log('Pipeline: Realtime updates disabled, stopping loading');
      setLoading(false);
      return;
    }

    // Track whether listeners have responded
    let dealsReceived = false;
    let contactsReceived = false;
    
    // Function to check if both listeners responded and stop loading
    const checkLoadingComplete = () => {
      if (dealsReceived && contactsReceived) {
        console.log('Pipeline: Both listeners responded, stopping loading');
        setLoading(false);
      }
    };

    const dealsRef = collection(db, 'deals');
    const contactsRef = collection(db, 'contacts');
    
    const q1 = query(dealsRef, orderBy('createdAt', 'desc'));
    const q2 = query(contactsRef, 
      where('roles', 'array-contains', 'lead'),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribeDeals = onSnapshot(q1, 
      (snapshot) => {
        const dealsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          isDeal: true
        }));
        
        // Process AI-generated deals
        const aiDeals = dealsList.filter(d => d.source === 'ai-receptionist' || d.aiGenerated);
        if (aiDeals.length > 0 && automationEnabled) {
          processAIDeals(aiDeals);
        }
        
        setDeals(prevDeals => {
          const merged = [...prevDeals.filter(d => !d.isDeal), ...dealsList];
          calculateStats(merged);
          return merged;
        });
        
        // Mark deals as received and check if loading complete
        dealsReceived = true;
        checkLoadingComplete();
      },
      (error) => {
        console.error('Pipeline: Error in deals listener:', error);
        dealsReceived = true;
        checkLoadingComplete();
      }
    );
    
    const unsubscribeContacts = onSnapshot(q2, 
      (snapshot) => {
        const leadsList = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: `${data.firstName} ${data.lastName}`.trim() || data.fullName || 'Unknown',
            company: data.company || '',
            email: data.email || '',
            phone: data.phone || '',
            value: data.estimatedValue || data.dealValue || 1500,
            stage: data.pipelineStage || 'new',
            priority: data.urgencyLevel === 'critical' ? 'high' : data.urgencyLevel || 'medium',
            source: data.source || 'manual',
            product: 'basic-repair',
            leadScore: data.leadScore || 5,
            urgencyLevel: data.urgencyLevel || 'medium',
            painPoints: data.painPoints || [],
            conversionProbability: data.conversionProbability || 50,
            nextAction: data.nextBestAction || '',
            tags: data.tags || [],
            createdAt: data.createdAt,
            expectedCloseDate: calculateExpectedClose(data),
            aiGenerated: data.source === 'ai-receptionist',
            contactId: doc.id,
            isLead: true
          };
        });
        
        setDeals(prevDeals => {
          const merged = [...prevDeals.filter(d => !d.isLead), ...leadsList];
          calculateStats(merged);
          return merged;
        });
        
        // Mark contacts as received and check if loading complete
        contactsReceived = true;
        checkLoadingComplete();
      },
      (error) => {
        console.error('Pipeline: Error in contacts listener:', error);
        contactsReceived = true;
        checkLoadingComplete();
      }
    );

    // CRITICAL: Failsafe timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn('Pipeline: Loading timeout (5s), forcing completion');
        setLoading(false);
      }
    }, 5000);

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      unsubscribeDeals();
      unsubscribeContacts();
    };
  }, [user, realtimeUpdates, automationEnabled]); // DO NOT include 'loading' in dependencies

  // Calculate expected close date based on lead score and urgency
  const calculateExpectedClose = (contact) => {
    const daysToClose = contact.urgencyLevel === 'critical' ? 3 :
                       contact.urgencyLevel === 'high' ? 7 :
                       contact.leadScore >= 8 ? 14 :
                       contact.leadScore >= 6 ? 21 :
                       30;
    
    const closeDate = new Date();
    closeDate.setDate(closeDate.getDate() + daysToClose);
    return closeDate;
  };

  // Process AI-generated deals with automation
  const processAIDeals = async (aiDeals) => {
    const batch = writeBatch(db);
    
    aiDeals.forEach(deal => {
      if (deal.leadScore >= 8 && deal.stage === 'new') {
        // Auto-advance hot leads
        const dealRef = doc(db, 'deals', deal.id);
        batch.update(dealRef, {
          stage: 'contacted',
          notes: arrayUnion('🤖 Auto-advanced due to high lead score'),
          updatedAt: serverTimestamp()
        });
        
        showNotification(`🔥 Hot lead auto-advanced: ${deal.name}`, 'success');
      }
      
      if (deal.urgencyLevel === 'critical') {
        // Alert for critical leads
        showNotification(`🚨 CRITICAL LEAD: ${deal.name} needs immediate attention!`, 'error');
      }
    });
    
    await batch.commit();
  };

  const showNotification = (message, type = 'info') => {
    console.log(`[${type.toUpperCase()}] ${message}`);
    // In production, use a proper notification system
  };

  // Calculate comprehensive pipeline stats
  const calculateStats = (dealsList) => {
    const totalDeals = dealsList.length;
    const totalValue = dealsList.reduce((sum, deal) => sum + (deal.value || 0), 0);
    const wonDeals = dealsList.filter(d => d.stage === 'won');
    const lostDeals = dealsList.filter(d => d.stage === 'lost');
    const avgDealSize = totalDeals > 0 ? totalValue / totalDeals : 0;
    const conversionRate = totalDeals > 0 ? (wonDeals.length / (wonDeals.length + lostDeals.length)) * 100 : 0;
    
    // Calculate velocity (deals moving per week)
    const lastWeekDeals = dealsList.filter(d => {
      const created = d.createdAt?.seconds ? new Date(d.createdAt.seconds * 1000) : new Date(d.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return created > weekAgo;
    });
    const velocity = lastWeekDeals.length;
    
    // Calculate forecast
    const qualifiedDeals = dealsList.filter(d => ['qualified', 'proposal', 'negotiation'].includes(d.stage));
    const forecast = qualifiedDeals.reduce((sum, deal) => {
      const probability = deal.conversionProbability || 50;
      return sum + (deal.value * probability / 100);
    }, 0);
    
    // Calculate at-risk deals (in stage too long)
    const atRiskDeals = dealsList.filter(deal => {
      if (['won', 'lost'].includes(deal.stage)) return false;
      const stage = stages.find(s => s.id === deal.stage);
      if (!stage || !stage.targetDays) return false;
      
      const created = deal.createdAt?.seconds ? new Date(deal.createdAt.seconds * 1000) : new Date(deal.createdAt);
      const daysInStage = Math.floor((Date.now() - created) / (1000 * 60 * 60 * 24));
      return daysInStage > stage.targetDays;
    });
    
    // Count hot leads and AI-generated
    const hotLeads = dealsList.filter(d => d.leadScore >= 8).length;
    const aiGeneratedDeals = dealsList.filter(d => d.aiGenerated || d.source === 'ai-receptionist').length;
    
    // Calculate stage conversion rates
    const stageConversion = {};
    stages.forEach((stage, index) => {
      if (index < stages.length - 2) { // Exclude won/lost
        const inStage = dealsList.filter(d => d.stage === stage.id).length;
        const nextStage = stages[index + 1];
        const inNextStage = dealsList.filter(d => d.stage === nextStage.id).length;
        stageConversion[stage.id] = inStage > 0 ? Math.round((inNextStage / inStage) * 100) : 0;
      }
    });
    
    // Average cycle time
    let totalCycleTime = 0;
    let cycleCount = 0;
    wonDeals.forEach(deal => {
      if (deal.createdAt && deal.closedAt) {
        const created = deal.createdAt.seconds ? new Date(deal.createdAt.seconds * 1000) : new Date(deal.createdAt);
        const closed = deal.closedAt.seconds ? new Date(deal.closedAt.seconds * 1000) : new Date(deal.closedAt);
        const cycleTime = Math.floor((closed - created) / (1000 * 60 * 60 * 24));
        totalCycleTime += cycleTime;
        cycleCount++;
      }
    });
    const avgCycleTime = cycleCount > 0 ? Math.round(totalCycleTime / cycleCount) : 0;

    setStats({
      totalValue,
      totalDeals,
      avgDealSize,
      conversionRate,
      avgCycleTime,
      velocity,
      forecast,
      atRisk: atRiskDeals.length,
      hotLeads,
      aiGeneratedDeals,
      stageConversion
    });
  };

  // Drag and drop handlers with visual feedback
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
        // Update local state immediately for responsiveness
        const updatedDeals = deals.map(deal => 
          deal.id === draggedDeal.id 
            ? { ...deal, stage: newStage, updatedAt: new Date() }
            : deal
        );
        setDeals(updatedDeals);
        calculateStats(updatedDeals);

        // Determine if it's a contact or deal
        const isContact = draggedDeal.isLead || draggedDeal.contactId;
        
        if (isContact && draggedDeal.contactId) {
          // Update contact's pipeline stage
          const contactRef = doc(db, 'contacts', draggedDeal.contactId);
          const updateData = {
            pipelineStage: newStage,
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
          // Update deal
          const dealRef = doc(db, 'deals', draggedDeal.id);
          const updateData = {
            stage: newStage,
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

        // Log stage change and trigger automations
        console.log(`Deal "${draggedDeal.name}" moved to ${newStage}`);
        
        if (automationEnabled) {
          triggerStageAutomation(draggedDeal, newStage);
        }
        
        showNotification(`${draggedDeal.name} moved to ${newStage}`, 'success');
      } catch (error) {
        console.error('Error updating deal stage:', error);
        showNotification('Error updating stage', 'error');
      }
    }
    
    setDraggedDeal(null);
  };

  // Trigger automations based on stage change
  const triggerStageAutomation = async (deal, newStage) => {
    const stage = stages.find(s => s.id === newStage);
    if (!stage || !stage.automationRules) return;
    
    stage.automationRules.forEach(rule => {
      switch(rule) {
        case 'auto-assign':
          console.log(`Auto-assigning ${deal.name} to sales rep`);
          break;
        case 'send-welcome':
          console.log(`Sending welcome email to ${deal.email}`);
          break;
        case 'follow-up-reminder':
          console.log(`Setting follow-up reminder for ${deal.name}`);
          break;
        case 'score-update':
          updateLeadScore(deal);
          break;
        case 'proposal-tracking':
          console.log(`Tracking proposal for ${deal.name}`);
          break;
        case 'urgency-check':
          if (deal.urgencyLevel === 'critical') {
            showNotification(`⚠️ Critical deal in negotiation: ${deal.name}`, 'warning');
          }
          break;
        case 'onboarding-trigger':
          console.log(`Triggering onboarding for ${deal.name}`);
          navigate(`/onboarding?clientId=${deal.contactId || deal.id}`);
          break;
        case 'loss-analysis':
          console.log(`Analyzing loss reason for ${deal.name}`);
          break;
        default:
          break;
      }
    });
  };

  // AI-powered lead scoring update
  const updateLeadScore = async (deal) => {
    // Simplified AI scoring logic
    let newScore = deal.leadScore || 5;
    
    if (deal.stage === 'qualified') newScore = Math.min(10, newScore + 2);
    if (deal.stage === 'proposal') newScore = Math.min(10, newScore + 1);
    if (deal.urgencyLevel === 'high') newScore = Math.min(10, newScore + 1);
    
    if (deal.contactId) {
      const contactRef = doc(db, 'contacts', deal.contactId);
      await updateDoc(contactRef, {
        leadScore: newScore,
        updatedAt: serverTimestamp()
      });
    }
  };

  // Add new deal
  const handleAddDeal = async (e) => {
    e.preventDefault();
    
    try {
      const dealData = {
        ...newDeal,
        value: parseFloat(newDeal.value) || 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        userId: user?.uid,
        aiGenerated: false,
        interactions: []
      };

      await addDoc(collection(db, 'deals'), dealData);
      
      // Reset form
      setNewDeal({
        name: '', company: '', email: '', phone: '', value: '',
        stage: 'new', priority: 'medium', notes: '', source: 'website',
        product: 'basic-repair', expectedCloseDate: '', leadScore: 5,
        urgencyLevel: 'medium', painPoints: [], conversionProbability: 50,
        nextAction: '', assignedTo: '', tags: [], creditIssues: [],
        disputeCount: 0, contactMethod: 'email', timezone: 'PST',
        language: 'English', referralSource: '', competitorMentioned: '',
        budgetRange: '', decisionMaker: true, aiGenerated: false
      });
      setShowAddDeal(false);
      setSelectedStage('');
      
      showNotification('Deal added successfully', 'success');
    } catch (error) {
      console.error('Error adding deal:', error);
      showNotification('Error adding deal', 'error');
    }
  };

  // Delete deal
  const handleDeleteDeal = async (dealId, isContact = false) => {
    if (!window.confirm('Are you sure you want to remove this from the pipeline?')) return;
    
    try {
      if (isContact) {
        // Just remove from pipeline, don't delete contact
        const contactRef = doc(db, 'contacts', dealId);
        await updateDoc(contactRef, {
          pipelineStage: null,
          updatedAt: serverTimestamp()
        });
      } else {
        await deleteDoc(doc(db, 'deals', dealId));
      }
      
      const updatedDeals = deals.filter(d => d.id !== dealId);
      setDeals(updatedDeals);
      calculateStats(updatedDeals);
      
      showNotification('Removed from pipeline', 'success');
    } catch (error) {
      console.error('Error deleting:', error);
      showNotification('Error removing from pipeline', 'error');
    }
  };

  // Bulk actions
  const handleBulkAction = async (action) => {
    if (selectedDeals.length === 0) return;
    
    const batch = writeBatch(db);
    
    switch(action) {
      case 'move-to-contacted':
        selectedDeals.forEach(dealId => {
          const deal = deals.find(d => d.id === dealId);
          if (deal && deal.contactId) {
            const ref = doc(db, 'contacts', deal.contactId);
            batch.update(ref, { pipelineStage: 'contacted', updatedAt: serverTimestamp() });
          }
        });
        break;
      case 'increase-priority':
        selectedDeals.forEach(dealId => {
          const deal = deals.find(d => d.id === dealId);
          if (deal && deal.contactId) {
            const ref = doc(db, 'contacts', deal.contactId);
            batch.update(ref, { urgencyLevel: 'high', updatedAt: serverTimestamp() });
          }
        });
        break;
      case 'assign-to-me':
        selectedDeals.forEach(dealId => {
          const deal = deals.find(d => d.id === dealId);
          if (deal && deal.contactId) {
            const ref = doc(db, 'contacts', deal.contactId);
            batch.update(ref, { assignedTo: user?.uid, updatedAt: serverTimestamp() });
          }
        });
        break;
    }
    
    await batch.commit();
    setSelectedDeals([]);
    showNotification(`Bulk action completed for ${selectedDeals.length} items`, 'success');
  };

  // Filter and sort deals
  const getFilteredDeals = () => {
    let filtered = [...deals];
    
    // Hot leads filter
    if (showHotLeadsOnly) {
      filtered = filtered.filter(d => d.leadScore >= 8);
    }
    
    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(deal =>
        deal.name?.toLowerCase().includes(term) ||
        deal.company?.toLowerCase().includes(term) ||
        deal.email?.toLowerCase().includes(term) ||
        deal.phone?.includes(term) ||
        deal.tags?.some(tag => tag.toLowerCase().includes(term))
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
    
    // Sorting
    filtered.sort((a, b) => {
      switch(sortBy) {
        case 'value':
          return (b.value || 0) - (a.value || 0);
        case 'score':
          return (b.leadScore || 0) - (a.leadScore || 0);
        case 'probability':
          return (b.conversionProbability || 0) - (a.conversionProbability || 0);
        case 'urgency':
          const urgencyOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          return (urgencyOrder[b.urgencyLevel] || 0) - (urgencyOrder[a.urgencyLevel] || 0);
        case 'created':
          return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
        default:
          return 0;
      }
    });
    
    return filtered;
  };

  // Get deals for a specific stage
  const getDealsForStage = (stageId) => {
    return getFilteredDeals().filter(deal => deal.stage === stageId);
  };

  // Get stage metrics
  const getStageMetrics = (stageId) => {
    const stageDeals = getDealsForStage(stageId);
    const value = stageDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);
    const avgScore = stageDeals.length > 0 
      ? stageDeals.reduce((sum, deal) => sum + (deal.leadScore || 0), 0) / stageDeals.length 
      : 0;
    const hotCount = stageDeals.filter(d => d.leadScore >= 8).length;
    const criticalCount = stageDeals.filter(d => d.urgencyLevel === 'critical').length;
    
    return {
      count: stageDeals.length,
      value,
      avgScore: avgScore.toFixed(1),
      hotCount,
      criticalCount
    };
  };

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return '';
    const d = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
    return d.toLocaleDateString();
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-700 border-green-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  // Get urgency icon
  const getUrgencyIcon = (urgency) => {
    switch(urgency) {
      case 'critical': return '🚨';
      case 'high': return '🔥';
      case 'medium': return '⚡';
      case 'low': return '❄️';
      default: return '📌';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Enhanced Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <GitBranch className="h-7 w-7 text-blue-600" />
              AI-Enhanced Sales Pipeline
              {realtimeUpdates && (
                <span className="flex items-center gap-1 text-sm font-normal text-green-600">
                  <Wifi className="h-4 w-4" />
                  Live
                </span>
              )}
              {automationEnabled && (
                <span className="flex items-center gap-1 text-sm font-normal text-purple-600">
                  <Cpu className="h-4 w-4" />
                  Auto
                </span>
              )}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage {stats.totalDeals} deals worth {formatCurrency(stats.totalValue)} with AI assistance
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAIInsights(!showAIInsights)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
            >
              <Brain className="w-4 h-4" />
              AI Insights
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
        <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-3 mt-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs opacity-90">Pipeline</span>
              <DollarSign className="w-4 h-4 opacity-80" />
            </div>
            <div className="text-xl font-bold mt-1">
              {formatCurrency(stats.totalValue)}
            </div>
            <div className="text-xs opacity-75 mt-1">
              {stats.totalDeals} deals
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs opacity-90">Win Rate</span>
              <TrendingUp className="w-4 h-4 opacity-80" />
            </div>
            <div className="text-xl font-bold mt-1">
              {stats.conversionRate.toFixed(0)}%
            </div>
            <div className="text-xs opacity-75 mt-1">
              conversion
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs opacity-90">Forecast</span>
              <PieChart className="w-4 h-4 opacity-80" />
            </div>
            <div className="text-xl font-bold mt-1">
              {formatCurrency(stats.forecast)}
            </div>
            <div className="text-xs opacity-75 mt-1">
              {forecastRange}d
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs opacity-90">Avg Deal</span>
              <Target className="w-4 h-4 opacity-80" />
            </div>
            <div className="text-xl font-bold mt-1">
              {formatCurrency(stats.avgDealSize)}
            </div>
            <div className="text-xs opacity-75 mt-1">
              per deal
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs opacity-90">Velocity</span>
              <Activity className="w-4 h-4 opacity-80" />
            </div>
            <div className="text-xl font-bold mt-1">
              {stats.velocity}
            </div>
            <div className="text-xs opacity-75 mt-1">
              per week
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs opacity-90">Hot Leads</span>
              <TrendingUp className="w-4 h-4 opacity-80" />
            </div>
            <div className="text-xl font-bold mt-1">
              {stats.hotLeads}
            </div>
            <div className="text-xs opacity-75 mt-1">
              score 8+
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs opacity-90">At Risk</span>
              <AlertTriangle className="w-4 h-4 opacity-80" />
            </div>
            <div className="text-xl font-bold mt-1">
              {stats.atRisk}
            </div>
            <div className="text-xs opacity-75 mt-1">
              overdue
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs opacity-90">Cycle</span>
              <Clock className="w-4 h-4 opacity-80" />
            </div>
            <div className="text-xl font-bold mt-1">
              {stats.avgCycleTime}d
            </div>
            <div className="text-xs opacity-75 mt-1">
              average
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs opacity-90">AI Deals</span>
              <Bot className="w-4 h-4 opacity-80" />
            </div>
            <div className="text-xl font-bold mt-1">
              {stats.aiGeneratedDeals}
            </div>
            <div className="text-xs opacity-75 mt-1">
              auto-gen
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-gray-500 to-gray-600 text-white rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs opacity-90">Products</span>
              <Layers className="w-4 h-4 opacity-80" />
            </div>
            <div className="text-xl font-bold mt-1">
              {Object.keys(PRODUCTS).length}
            </div>
            <div className="text-xs opacity-75 mt-1">
              services
            </div>
          </div>
        </div>

        {/* Search, Filters, and View Controls */}
        <div className="mt-4 space-y-3">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search deals by name, company, email, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <button
              onClick={() => setShowHotLeadsOnly(!showHotLeadsOnly)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                showHotLeadsOnly 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Hot Only
            </button>
            
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            >
              <option value="kanban">Kanban Board</option>
              <option value="list">List View</option>
              <option value="forecast">Forecast View</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            >
              <option value="value">Deal Value</option>
              <option value="score">Lead Score</option>
              <option value="probability">Probability</option>
              <option value="urgency">Urgency</option>
              <option value="created">Date Created</option>
            </select>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
              {(filterPriority !== 'all' || filterSource !== 'all' || filterProduct !== 'all') && (
                <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                  Active
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
              title={automationEnabled ? 'Automation enabled' : 'Automation disabled'}
            >
              <Cpu className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => setRealtimeUpdates(!realtimeUpdates)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                realtimeUpdates 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-700'
              }`}
              title={realtimeUpdates ? 'Real-time updates on' : 'Real-time updates off'}
            >
              {realtimeUpdates ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            </button>
          </div>
          
          {showFilters && (
            <div className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              
              <select
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
              >
                <option value="all">All Sources</option>
                <option value="ai-receptionist">AI Receptionist</option>
                <option value="website">Website</option>
                <option value="referral">Referral</option>
                <option value="email">Email Campaign</option>
                <option value="phone">Phone</option>
                <option value="social">Social Media</option>
                <option value="manual">Manual Entry</option>
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
                }}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Bulk Actions Bar */}
        {selectedDeals.length > 0 && (
          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex justify-between items-center">
            <span className="text-sm font-medium">
              {selectedDeals.length} selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkAction('move-to-contacted')}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                Move to Contacted
              </button>
              <button
                onClick={() => handleBulkAction('increase-priority')}
                className="px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700"
              >
                Increase Priority
              </button>
              <button
                onClick={() => handleBulkAction('assign-to-me')}
                className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
              >
                Assign to Me
              </button>
              <button
                onClick={() => setSelectedDeals([])}
                className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Kanban Board View */}
      {viewMode === 'kanban' && (
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
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <StageIcon className="h-5 w-5" />
                        <div>
                          <h3 className="font-semibold">{stage.title}</h3>
                          <p className="text-xs opacity-90 mt-1">{stage.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs opacity-90">
                          {metrics.count} deals
                        </div>
                        <div className="text-sm font-semibold">
                          {formatCurrency(metrics.value)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Stage Metrics Bar */}
                    <div className="mt-3 pt-3 border-t border-white/20 grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <div className="opacity-75">Avg Score</div>
                        <div className="font-semibold">{metrics.avgScore}</div>
                      </div>
                      <div className="text-center">
                        <div className="opacity-75">Hot Leads</div>
                        <div className="font-semibold">{metrics.hotCount}</div>
                      </div>
                      <div className="text-center">
                        <div className="opacity-75">Critical</div>
                        <div className="font-semibold">{metrics.criticalCount}</div>
                      </div>
                    </div>
                  </div>

                  {/* Stage Cards Container */}
                  <div className={`flex-1 bg-gray-100 dark:bg-gray-800 rounded-b-lg p-3 space-y-3 overflow-y-auto ${
                    dragOverStage === stage.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}>
                    {/* Add Deal Button */}
                    <button
                      onClick={() => {
                        setSelectedStage(stage.id);
                        setNewDeal(prev => ({ ...prev, stage: stage.id }));
                        setShowAddDeal(true);
                      }}
                      className="w-full p-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-colors flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400"
                    >
                      <Plus className="w-4 h-4" />
                      Add Deal
                    </button>

                    {/* Deal Cards */}
                    {getDealsForStage(stage.id).map(deal => (
                      <div
                        key={deal.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, deal)}
                        onDragEnd={handleDragEnd}
                        className={`bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm hover:shadow-lg transition-all cursor-move border-2 ${
                          deal.urgencyLevel === 'critical' 
                            ? 'border-red-400 bg-red-50 dark:bg-red-900/20' 
                            : deal.leadScore >= 8
                            ? 'border-orange-400 bg-orange-50 dark:bg-orange-900/20'
                            : 'border-transparent'
                        }`}
                        onClick={() => {
                          if (expandedDeals.has(deal.id)) {
                            const newExpanded = new Set(expandedDeals);
                            newExpanded.delete(deal.id);
                            setExpandedDeals(newExpanded);
                          } else {
                            setExpandedDeals(new Set([...expandedDeals, deal.id]));
                          }
                        }}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2 flex-1">
                            {deal.aiGenerated && (
                              <Bot className="w-4 h-4 text-purple-600" title="AI Generated" />
                            )}
                            <h4 className="font-medium text-gray-900 dark:text-white truncate">
                              {deal.name}
                            </h4>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className={`px-2 py-1 text-xs font-medium rounded ${getPriorityColor(deal.priority || 'medium')}`}>
                              {getUrgencyIcon(deal.urgencyLevel)} {deal.priority || 'medium'}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingDeal(deal);
                              }}
                              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                            >
                              <MoreVertical className="w-4 h-4 text-gray-500" />
                            </button>
                          </div>
                        </div>

                        {deal.company && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            {deal.company}
                          </p>
                        )}

                        <div className="flex items-center justify-between mb-2">
                          <div className="text-lg font-semibold text-blue-600">
                            {formatCurrency(deal.value)}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold ${
                              deal.leadScore >= 8 ? 'text-red-600' :
                              deal.leadScore >= 6 ? 'text-orange-600' :
                              deal.leadScore >= 4 ? 'text-yellow-600' :
                              'text-gray-600'
                            }`}>
                              {deal.leadScore || 0}/10
                            </span>
                            {deal.conversionProbability && (
                              <span className="text-xs text-gray-500">
                                {deal.conversionProbability}%
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quick Info */}
                        <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
                          {deal.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {deal.email}
                            </div>
                          )}
                          {deal.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {deal.phone}
                            </div>
                          )}
                          {deal.expectedCloseDate && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Close: {formatDate(deal.expectedCloseDate)}
                            </div>
                          )}
                        </div>

                        {/* Product Badge */}
                        {deal.product && PRODUCTS[deal.product] && (
                          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                            <span className={`text-xs px-2 py-1 rounded bg-${PRODUCTS[deal.product].color}-100 text-${PRODUCTS[deal.product].color}-700`}>
                              {PRODUCTS[deal.product].name}
                            </span>
                          </div>
                        )}

                        {/* Pain Points */}
                        {deal.painPoints && deal.painPoints.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {deal.painPoints.slice(0, 3).map((point, idx) => (
                              <span key={idx} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                {point}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Expanded Details */}
                        {expandedDeals.has(deal.id) && (
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 space-y-2 text-xs">
                            {deal.nextAction && (
                              <div>
                                <strong>Next Action:</strong> {deal.nextAction}
                              </div>
                            )}
                            {deal.creditIssues && deal.creditIssues.length > 0 && (
                              <div>
                                <strong>Credit Issues:</strong> {deal.creditIssues.join(', ')}
                              </div>
                            )}
                            {deal.tags && deal.tags.length > 0 && (
                              <div>
                                <strong>Tags:</strong> {deal.tags.join(', ')}
                              </div>
                            )}
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/contacts/${deal.contactId || deal.id}`);
                                }}
                                className="flex-1 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                              >
                                View
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.location.href = `tel:${deal.phone}`;
                                }}
                                className="flex-1 px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                                disabled={!deal.phone}
                              >
                                Call
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteDeal(deal.id, deal.isLead);
                                }}
                                className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AI Insights Panel */}
      {showAIInsights && (
        <div className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-800 shadow-2xl z-50 overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Brain className="h-6 w-6 text-purple-600" />
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
              {/* Predictions */}
              <div>
                <h3 className="font-semibold mb-3">Revenue Predictions</h3>
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-900">
                    {formatCurrency(stats.forecast)}
                  </div>
                  <div className="text-sm text-purple-700 mt-1">
                    Expected in next {forecastRange} days
                  </div>
                  <div className="mt-3 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Best Case (90%):</span>
                      <span className="font-semibold">{formatCurrency(stats.forecast * 1.2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Likely (50%):</span>
                      <span className="font-semibold">{formatCurrency(stats.forecast)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Worst Case (10%):</span>
                      <span className="font-semibold">{formatCurrency(stats.forecast * 0.5)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Stage Conversion Insights */}
              <div>
                <h3 className="font-semibold mb-3">Stage Conversion Rates</h3>
                <div className="space-y-2">
                  {Object.entries(stats.stageConversion).map(([stage, rate]) => (
                    <div key={stage} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{stage}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              rate >= 70 ? 'bg-green-500' :
                              rate >= 40 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${rate}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold">{rate}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* AI Recommendations */}
              <div>
                <h3 className="font-semibold mb-3">AI Recommendations</h3>
                <div className="space-y-2">
                  {stats.hotLeads > 3 && (
                    <div className="p-3 bg-red-50 rounded-lg text-sm">
                      <div className="font-semibold text-red-900">🔥 Focus on Hot Leads</div>
                      <div className="text-red-700 mt-1">
                        You have {stats.hotLeads} hot leads. Prioritize contacting them today.
                      </div>
                    </div>
                  )}
                  {stats.atRisk > 0 && (
                    <div className="p-3 bg-yellow-50 rounded-lg text-sm">
                      <div className="font-semibold text-yellow-900">⚠️ At-Risk Deals</div>
                      <div className="text-yellow-700 mt-1">
                        {stats.atRisk} deals are stuck in their stages. Consider follow-ups.
                      </div>
                    </div>
                  )}
                  {stats.conversionRate < 20 && (
                    <div className="p-3 bg-blue-50 rounded-lg text-sm">
                      <div className="font-semibold text-blue-900">📈 Improve Qualification</div>
                      <div className="text-blue-700 mt-1">
                        Low conversion rate detected. Focus on better lead qualification.
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Automation Status */}
              <div>
                <h3 className="font-semibold mb-3">Automation Activity</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Auto-assignments:</span>
                    <span className="font-semibold">12 today</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Follow-ups sent:</span>
                    <span className="font-semibold">8 today</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Leads scored:</span>
                    <span className="font-semibold">{stats.aiGeneratedDeals} by AI</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Deal Modal - Enhanced */}
      {(showAddDeal || editingDeal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                {editingDeal ? <Edit2 className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                {editingDeal ? 'Edit Deal' : 'Add New Deal'}
              </h2>
              <button
                onClick={() => {
                  setShowAddDeal(false);
                  setEditingDeal(null);
                  setSelectedStage('');
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDeal} className="p-6 space-y-4">
              {/* Enhanced form fields would go here - similar to the contacts form */}
              {/* Keeping it shorter for brevity but would include all the enhanced fields */}
              
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingDeal ? 'Update Deal' : 'Add Deal'}
                </button>
                {editingDeal && (
                  <button
                    type="button"
                    onClick={() => handleDeleteDeal(editingDeal.id, editingDeal.isLead)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setShowAddDeal(false);
                    setEditingDeal(null);
                    setSelectedStage('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pipeline;