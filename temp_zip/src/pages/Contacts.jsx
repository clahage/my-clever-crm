// src/pages/Contacts.jsx - MEGA ENHANCED VERSION 2.0
// ULTRA-COMPLETE CONTACT MANAGEMENT SYSTEM
// 3000+ LINES - PRODUCTION READY
// LAST UPDATED: 2025-10-12

import UltimateClientForm from '@/components/UltimateClientForm';
import ImportContactsModal from '../components/ImportContactsModal';
import ExportModal from '../components/ExportModal';
import BulkActions from '../components/BulkActions';
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import InteractionLogger from '../components/InteractionLogger';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  Users, User, Plus, Search, Filter, Mail, Phone, MapPin, Calendar, Edit, Trash2, Eye,
  ChevronDown, Download, Upload, UserCheck, UserPlus, Star, Building2, Tag,
  AlertCircle, CheckCircle, XCircle, RefreshCw, ArrowUpCircle, Hash, Shield,
  Clock, FileText, Paperclip, X, MessageSquare, TrendingUp, Target, DollarSign,
  Zap, Brain, Activity, BarChart3, Award, Send, GitBranch, Briefcase, CreditCard,
  BookOpen, Scale, Bot, Sparkles, Gauge, AlertTriangle, PhoneCall, Video,
  Globe, Linkedin, Twitter, Facebook, Instagram, Youtube, ChevronUp, MoreVertical,
  Copy, Share2, Archive, Flag, Settings, Database, Cpu, Wifi, WifiOff,
  Heart, PauseCircle, ClipboardCheck, Printer, FileDown, FilePlus, SlidersHorizontal,
  Layers, Grid, List, Columns, SortAsc, SortDesc, Maximize2, Minimize2,
  BarChart2, TrendingDown, Handshake, Percent, DollarSign as Money, UserX, UserMinus,
  Link2, ExternalLink, Code, Terminal, Unlock, Lock, Key, ShieldAlert,
  MousePointer, MousePointerClick, Move, Grab, GripVertical, Menu as MenuIcon
} from 'lucide-react';
import { db } from '../lib/firebase';
import { 
  collection, query, orderBy, getDocs, doc, updateDoc, deleteDoc, addDoc,
  serverTimestamp, writeBatch, where, arrayUnion, arrayRemove, onSnapshot,
  limit, startAfter, getDoc, setDoc
} from 'firebase/firestore';

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const Contacts = () => {
  
  // ===== NAVIGATION & ROUTING =====
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // ===== REFS =====
  const searchInputRef = useRef(null);
  const tableRef = useRef(null);

  // ===== FORM STATE =====
  const [showMegaForm, setShowMegaForm] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [formMode, setFormMode] = useState('create'); // create, edit, duplicate

  // ===== INTERACTION LOGGER STATE =====
  const [showInteractionLogger, setShowInteractionLogger] = useState(false);
  const [selectedContactForInteraction, setSelectedContactForInteraction] = useState(null);

  // ===== CONTACT DATA STATE =====
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ===== SEARCH & FILTER STATE =====
  const [searchTerm, setSearchTerm] = useState('');
  const [advancedSearch, setAdvancedSearch] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    city: '',
    state: '',
    zipcode: '',
    tags: [],
    source: '',
    dateRange: { start: '', end: '' }
  });
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [sortBy, setSortBy] = useState('leadScore');
  const [sortDirection, setSortDirection] = useState('desc'); // asc, desc
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [filterRoles, setFilterRoles] = useState([]);
  const [filterLifecycle, setFilterLifecycle] = useState('all');
  const [filterUrgency, setFilterUrgency] = useState('all');
  const [filterScoreRange, setFilterScoreRange] = useState([0, 10]);
  const [filterValueRange, setFilterValueRange] = useState([0, 10000]);
  const [showFilters, setShowFilters] = useState(false);
  const [showHotLeadsOnly, setShowHotLeadsOnly] = useState(false);
  const [savedFilters, setSavedFilters] = useState([]);
  const [currentFilterPreset, setCurrentFilterPreset] = useState(null);

  // ===== CONTACT MANAGEMENT STATE =====
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showNewContactForm, setShowNewContactForm] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [editingRoles, setEditingRoles] = useState(null);
  const [mergeMode, setMergeMode] = useState(false);
  const [contactsToMerge, setContactsToMerge] = useState([]);

  // ===== AI & ANALYSIS STATE =====
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [selectedContactForAI, setSelectedContactForAI] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [runningAIBatch, setRunningAIBatch] = useState(false);

  // ===== COMMUNICATION STATE =====
  const [showBulkEmail, setShowBulkEmail] = useState(false);
  const [showBulkSMS, setShowBulkSMS] = useState(false);
  const [showEmailComposer, setShowEmailComposer] = useState(false);
  const [showSMSComposer, setShowSMSComposer] = useState(false);
  const [emailTemplate, setEmailTemplate] = useState('');
  const [smsTemplate, setSmsTemplate] = useState('');

  // ===== UI STATE =====
  const [expandedContacts, setExpandedContacts] = useState(new Set());
  const [realtimeUpdates, setRealtimeUpdates] = useState(true);
  const [viewMode, setViewMode] = useState('table'); // table, cards, kanban, grid
  const [tableColumns, setTableColumns] = useState([
    'select', 'contact', 'score', 'roles', 'status', 'value', 'source', 'actions'
  ]);
  const [columnWidths, setColumnWidths] = useState({});
  const [isDraggingColumn, setIsDraggingColumn] = useState(false);
  const [showColumnCustomizer, setShowColumnCustomizer] = useState(false);
  const [compactView, setCompactView] = useState(false);
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [showContactDetails, setShowContactDetails] = useState(false);
  const [selectedContactDetails, setSelectedContactDetails] = useState(null);

  // ===== STATISTICS STATE =====
  const [stats, setStats] = useState({
    total: 0,
    byRole: {},
    byLifecycle: {},
    byUrgency: {},
    bySource: {},
    byState: {},
    avgLeadScore: 0,
    hotLeads: 0,
    coldLeads: 0,
    warmLeads: 0,
    conversionRate: 0,
    totalValue: 0,
    avgValue: 0,
    thisMonth: 0,
    lastMonth: 0,
    growth: 0,
    topSources: [],
    topStates: [],
    recentActivity: []
  });

  // ===== ACTIVITY & HISTORY STATE =====
  const [activityLog, setActivityLog] = useState([]);
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [contactHistory, setContactHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // ===== NOTES & DOCUMENTS STATE =====
  const [showNotesPanel, setShowNotesPanel] = useState(false);
  const [selectedContactForNotes, setSelectedContactForNotes] = useState(null);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [documents, setDocuments] = useState([]);
  const [uploadingDocument, setUploadingDocument] = useState(false);

  // ===== CUSTOM FIELDS STATE =====
  const [customFields, setCustomFields] = useState([]);
  const [showCustomFieldsManager, setShowCustomFieldsManager] = useState(false);

  // ===== IMPORT/EXPORT STATE =====
  const [importProgress, setImportProgress] = useState(0);
  const [importErrors, setImportErrors] = useState([]);
  const [exportFormat, setExportFormat] = useState('csv'); // csv, xlsx, json, vcard
  const [exportProgress, setExportProgress] = useState(0);

  // ===== PERFORMANCE & OPTIMIZATION =====
  const [virtualScrolling, setVirtualScrolling] = useState(true);
  const [lazyLoading, setLazyLoading] = useState(true);
  const [cacheEnabled, setCacheEnabled] = useState(true);
  const [lastSync, setLastSync] = useState(null);

  // ===== ENHANCED ROLE DEFINITIONS =====
  const ROLES = {
    contact: { 
      label: 'Contact', 
      color: 'bg-gray-100 text-gray-700', 
      icon: Users, 
      description: 'Basic contact',
      priority: 1 
    },
    lead: { 
      label: 'Lead', 
      color: 'bg-yellow-100 text-yellow-700', 
      icon: UserPlus, 
      description: 'Potential customer',
      priority: 3 
    },
    client: { 
      label: 'Client', 
      color: 'bg-green-100 text-green-700', 
      icon: UserCheck, 
      description: 'Active customer',
      priority: 5 
    },
    affiliate: { 
      label: 'Affiliate', 
      color: 'bg-purple-100 text-purple-700', 
      icon: Star, 
      description: 'Referral partner',
      priority: 4 
    },
    vendor: { 
      label: 'Vendor', 
      color: 'bg-blue-100 text-blue-700', 
      icon: Building2, 
      description: 'Service provider',
      priority: 2 
    },
    partner: { 
      label: 'Partner', 
      color: 'bg-indigo-100 text-indigo-700', 
      icon: Shield, 
      description: 'Business partner',
      priority: 4 
    },
    professional: { 
      label: 'Professional', 
      color: 'bg-pink-100 text-pink-700', 
      icon: Briefcase, 
      description: 'Attorney, CPA, etc',
      priority: 3 
    },
    employee: { 
      label: 'Employee', 
      color: 'bg-teal-100 text-teal-700', 
      icon: Award, 
      description: 'Team member',
      priority: 5 
    }
  };

  // ===== ENHANCED LIFECYCLE STATUSES =====
  const LIFECYCLE_STATUSES = {
    new: { label: 'New', color: 'bg-blue-100 text-blue-700', icon: Sparkles, stage: 1 },
    contacted: { label: 'Contacted', color: 'bg-cyan-100 text-cyan-700', icon: Phone, stage: 2 },
    qualified: { label: 'Qualified', color: 'bg-indigo-100 text-indigo-700', icon: CheckCircle, stage: 3 },
    intake: { label: 'Intake', color: 'bg-purple-100 text-purple-700', icon: ClipboardCheck, stage: 4 },
    nurturing: { label: 'Nurturing', color: 'bg-pink-100 text-pink-700', icon: Heart, stage: 3 },
    proposal: { label: 'Proposal', color: 'bg-amber-100 text-amber-700', icon: FileText, stage: 5 },
    negotiation: { label: 'Negotiation', color: 'bg-orange-100 text-orange-700', icon: Handshake, stage: 6 },
    active: { label: 'Active', color: 'bg-green-100 text-green-700', icon: Activity, stage: 7 },
    paused: { label: 'Paused', color: 'bg-yellow-100 text-yellow-700', icon: PauseCircle, stage: 7 },
    completed: { label: 'Completed', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle, stage: 8 },
    closed: { label: 'Closed', color: 'bg-gray-100 text-gray-700', icon: XCircle, stage: 9 },
    lost: { label: 'Lost', color: 'bg-red-100 text-red-700', icon: AlertTriangle, stage: 9 },
    churned: { label: 'Churned', color: 'bg-red-200 text-red-800', icon: UserX, stage: 9 }
  };

  // ===== URGENCY LEVELS =====
  const URGENCY_LEVELS = {
    critical: { label: 'Critical', color: 'bg-red-100 text-red-700', icon: '🚨', weight: 4 },
    high: { label: 'High', color: 'bg-orange-100 text-orange-700', icon: '🔥', weight: 3 },
    medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-700', icon: '⚡', weight: 2 },
    low: { label: 'Low', color: 'bg-green-100 text-green-700', icon: '❄️', weight: 1 }
  };

  // ===== CONTACT SOURCES =====
  const CONTACT_SOURCES = {
    'manual': 'Manual Entry',
    'import': 'CSV Import',
    'ai-receptionist': 'AI Receptionist',
    'web-form': 'Website Form',
    'referral': 'Referral',
    'google': 'Google Search',
    'facebook': 'Facebook',
    'instagram': 'Instagram',
    'linkedin': 'LinkedIn',
    'email': 'Email Campaign',
    'phone': 'Phone Call',
    'event': 'Event/Trade Show',
    'partner': 'Partner',
    'other': 'Other'
  };

  // ===== AVAILABLE TABLE COLUMNS =====
  const AVAILABLE_COLUMNS = [
    { id: 'select', label: 'Select', width: 50, locked: true },
    { id: 'contact', label: 'Contact Info', width: 300, locked: true },
    { id: 'score', label: 'Score/Urgency', width: 150 },
    { id: 'roles', label: 'Roles', width: 200 },
    { id: 'status', label: 'Lifecycle Status', width: 150 },
    { id: 'value', label: 'Value', width: 120 },
    { id: 'probability', label: 'Probability', width: 100 },
    { id: 'source', label: 'Source', width: 120 },
    { id: 'location', label: 'Location', width: 150 },
    { id: 'created', label: 'Created Date', width: 120 },
    { id: 'updated', label: 'Last Updated', width: 120 },
    { id: 'activity', label: 'Last Activity', width: 120 },
    { id: 'documents', label: 'Documents', width: 100 },
    { id: 'interactions', label: 'Interactions', width: 100 },
    { id: 'owner', label: 'Assigned To', width: 150 },
    { id: 'tags', label: 'Tags', width: 200 },
    { id: 'actions', label: 'Actions', width: 200, locked: true }
  ];

  // ===== NOTIFICATION HELPER =====
  const showNotification = useCallback((message, type = 'info') => {
    console.log(`[${type.toUpperCase()}] ${message}`);
    // TODO: Implement toast notification system
  }, []);

  // ===== REAL-TIME LISTENER FOR HOT LEADS =====
  useEffect(() => {
    if (!realtimeUpdates) return;

    const q = query(
      collection(db, 'contacts'),
      where('leadScore', '>=', 8),
      orderBy('leadScore', 'desc'),
      limit(10)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added' || change.type === 'modified') {
          const data = change.doc.data();
          if (data.urgencyLevel === 'critical') {
            showNotification(`🚨 Critical Lead: ${data.firstName} ${data.lastName}`, 'error');
          }
        }
      });
    });
    
    return () => unsubscribe();
  }, [realtimeUpdates, showNotification]);

  // ===== CHECK FOR NEW STATUS IN URL =====
  useEffect(() => {
    const action = searchParams.get('action');
    const status = searchParams.get('status');
    
    if (action === 'new' || status === 'new') {
      setShowMegaForm(true);
      setFormMode('create');
    }
  }, [searchParams]);

  // ===== FETCH CONTACTS =====
  useEffect(() => {
    fetchContacts();
  }, []);

  // ===== FILTER AND SORT CONTACTS =====
  useEffect(() => {
    filterAndSortContacts();
  }, [
    contacts, 
    searchTerm, 
    advancedSearch,
    sortBy, 
    sortDirection,
    filterRoles, 
    filterLifecycle, 
    filterUrgency, 
    filterScoreRange,
    filterValueRange,
    showHotLeadsOnly
  ]);

  // ===== FETCH CONTACTS FROM FIREBASE =====
  const fetchContacts = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    else setRefreshing(true);
    
    try {
      console.log('📥 Fetching contacts from Firebase...');
      
      if (!db) {
        throw new Error('Database connection not initialized');
      }
      
      let q;
      try {
        q = query(
          collection(db, 'contacts'),
          orderBy('createdAt', 'desc')
        );
      } catch (indexError) {
        console.warn('⚠️ Index not ready, using fallback query:', indexError);
        q = query(collection(db, 'contacts'));
      }
      
      const querySnapshot = await getDocs(q);
      console.log(`✅ Fetched ${querySnapshot.size} contacts`);
      
      const contactsData = [];
      const roleStats = {};
      const lifecycleStats = {};
      const urgencyStats = {};
      const sourceStats = {};
      const stateStats = {};
      let totalScore = 0;
      let hotLeadsCount = 0;
      let coldLeadsCount = 0;
      let warmLeadsCount = 0;
      let totalValue = 0;
      let convertedCount = 0;
      let thisMonthCount = 0;
      let lastMonthCount = 0;
      
      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      
      querySnapshot.forEach((doc) => {
        try {
          const data = { id: doc.id, ...doc.data() };
          
          // Ensure required fields exist
          if (!data.roles || !Array.isArray(data.roles)) {
            data.roles = [data.status || data.category || 'contact'];
          }
          if (!data.primaryRole) {
            data.primaryRole = data.roles[0];
          }
          if (!data.lifecycleStatus) {
            data.lifecycleStatus = 'active';
          }
          if (!data.urgencyLevel) {
            data.urgencyLevel = 'medium';
          }
          if (data.leadScore === undefined) {
            data.leadScore = 0;
          }
          if (!data.source) {
            data.source = 'manual';
          }
          
          // Calculate statistics
          data.roles.forEach(role => {
            roleStats[role] = (roleStats[role] || 0) + 1;
          });
          
          lifecycleStats[data.lifecycleStatus] = (lifecycleStats[data.lifecycleStatus] || 0) + 1;
          urgencyStats[data.urgencyLevel] = (urgencyStats[data.urgencyLevel] || 0) + 1;
          sourceStats[data.source] = (sourceStats[data.source] || 0) + 1;
          
          if (data.state || data.stateCode) {
            const state = data.stateCode || data.state;
            stateStats[state] = (stateStats[state] || 0) + 1;
          }
          
          totalScore += data.leadScore || 0;
          
          if (data.leadScore >= 8) hotLeadsCount++;
          else if (data.leadScore >= 5) warmLeadsCount++;
          else coldLeadsCount++;
          
          totalValue += data.estimatedValue || 0;
          
          if (data.lifecycleStatus === 'completed' || data.primaryRole === 'client') {
            convertedCount++;
          }
          
          // Count new contacts this month and last month
          if (data.createdAt && data.createdAt.seconds) {
            const createdDate = new Date(data.createdAt.seconds * 1000);
            if (createdDate >= thisMonthStart) {
              thisMonthCount++;
            } else if (createdDate >= lastMonthStart && createdDate <= lastMonthEnd) {
              lastMonthCount++;
            }
          }
          
          contactsData.push(data);
        } catch (docError) {
          console.error('❌ Error processing document:', doc.id, docError);
        }
      });
      
      // Calculate metrics
      const avgScore = contactsData.length > 0 ? totalScore / contactsData.length : 0;
      const conversionRate = contactsData.length > 0 ? (convertedCount / contactsData.length) * 100 : 0;
      const avgValue = contactsData.length > 0 ? totalValue / contactsData.length : 0;
      const growth = lastMonthCount > 0 ? ((thisMonthCount - lastMonthCount) / lastMonthCount) * 100 : 0;
      
      // Get top sources
      const topSources = Object.entries(sourceStats)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([source, count]) => ({ source, count }));
      
      // Get top states
      const topStates = Object.entries(stateStats)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([state, count]) => ({ state, count }));
      
      setStats({
        total: contactsData.length,
        byRole: roleStats,
        byLifecycle: lifecycleStats,
        byUrgency: urgencyStats,
        bySource: sourceStats,
        byState: stateStats,
        avgLeadScore: avgScore.toFixed(1),
        hotLeads: hotLeadsCount,
        coldLeads: coldLeadsCount,
        warmLeads: warmLeadsCount,
        conversionRate: conversionRate.toFixed(1),
        totalValue,
        avgValue: avgValue.toFixed(0),
        thisMonth: thisMonthCount,
        lastMonth: lastMonthCount,
        growth: growth.toFixed(1),
        topSources,
        topStates,
        recentActivity: [] // TODO: Implement activity tracking
      });
      
      setContacts(contactsData);
      setLastSync(new Date());
      console.log('✅ Contacts loaded successfully');
      
    } catch (error) {
      console.error('❌ Error fetching contacts:', error);
      
      let errorMessage = 'Error loading contacts';
      if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. Please check authentication.';
      } else if (error.code === 'unavailable') {
        errorMessage = 'Firebase unavailable. Check internet connection.';
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      showNotification(errorMessage, 'error');
      
      setContacts([]);
      setStats({
        total: 0,
        byRole: {},
        byLifecycle: {},
        byUrgency: {},
        bySource: {},
        byState: {},
        avgLeadScore: 0,
        hotLeads: 0,
        coldLeads: 0,
        warmLeads: 0,
        conversionRate: 0,
        totalValue: 0,
        avgValue: 0,
        thisMonth: 0,
        lastMonth: 0,
        growth: 0,
        topSources: [],
        topStates: [],
        recentActivity: []
      });
    } finally {
      if (showLoader) setLoading(false);
      else setRefreshing(false);
    }
  };

  // ===== FILTER AND SORT CONTACTS =====
  const filterAndSortContacts = useCallback(() => {
    let filtered = [...contacts];

    // Hot leads filter
    if (showHotLeadsOnly) {
      filtered = filtered.filter(contact => contact.leadScore >= 8);
    }

    // Basic search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(contact => {
        const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.toLowerCase();
        const company = (contact.company || '').toLowerCase();
        const email = (contact.email || '').toLowerCase();
        const phone = (contact.phone || '').toLowerCase();
        const tags = (contact.tags || []).join(' ').toLowerCase();
        const painPoints = (contact.painPoints || []).join(' ').toLowerCase();
        const notes = (contact.notes || '').toLowerCase();

        return fullName.includes(term) ||
          company.includes(term) ||
          email.includes(term) ||
          phone.includes(term) ||
          tags.includes(term) ||
          painPoints.includes(term) ||
          notes.includes(term);
      });
    }

    // Advanced search filters
    if (showAdvancedSearch) {
      if (advancedSearch.firstName) {
        filtered = filtered.filter(c => 
          c.firstName?.toLowerCase().includes(advancedSearch.firstName.toLowerCase())
        );
      }
      if (advancedSearch.lastName) {
        filtered = filtered.filter(c => 
          c.lastName?.toLowerCase().includes(advancedSearch.lastName.toLowerCase())
        );
      }
      if (advancedSearch.email) {
        filtered = filtered.filter(c => 
          c.email?.toLowerCase().includes(advancedSearch.email.toLowerCase())
        );
      }
      if (advancedSearch.phone) {
        filtered = filtered.filter(c => 
          c.phone?.includes(advancedSearch.phone)
        );
      }
      if (advancedSearch.company) {
        filtered = filtered.filter(c => 
          c.company?.toLowerCase().includes(advancedSearch.company.toLowerCase())
        );
      }
      if (advancedSearch.city) {
        filtered = filtered.filter(c => 
          c.city?.toLowerCase().includes(advancedSearch.city.toLowerCase())
        );
      }
      if (advancedSearch.state) {
        filtered = filtered.filter(c => 
          c.state?.toLowerCase().includes(advancedSearch.state.toLowerCase()) ||
          c.stateCode?.toLowerCase().includes(advancedSearch.state.toLowerCase())
        );
      }
      if (advancedSearch.zipcode) {
        filtered = filtered.filter(c => 
          c.zipcode?.includes(advancedSearch.zipcode)
        );
      }
      if (advancedSearch.source) {
        filtered = filtered.filter(c => c.source === advancedSearch.source);
      }
      if (advancedSearch.tags && advancedSearch.tags.length > 0) {
        filtered = filtered.filter(c => 
          c.tags && c.tags.some(tag => advancedSearch.tags.includes(tag))
        );
      }
      if (advancedSearch.dateRange.start) {
        const startDate = new Date(advancedSearch.dateRange.start);
        filtered = filtered.filter(c => {
          if (!c.createdAt || !c.createdAt.seconds) return false;
          const contactDate = new Date(c.createdAt.seconds * 1000);
          return contactDate >= startDate;
        });
      }
      if (advancedSearch.dateRange.end) {
        const endDate = new Date(advancedSearch.dateRange.end);
        filtered = filtered.filter(c => {
          if (!c.createdAt || !c.createdAt.seconds) return false;
          const contactDate = new Date(c.createdAt.seconds * 1000);
          return contactDate <= endDate;
        });
      }
    }

    // Role filter
    if (filterRoles.length > 0) {
      filtered = filtered.filter(contact => {
        const contactRoles = contact.roles || [];
        return filterRoles.some(role => contactRoles.includes(role));
      });
    }

    // Lifecycle filter
    if (filterLifecycle !== 'all') {
      filtered = filtered.filter(contact => contact.lifecycleStatus === filterLifecycle);
    }

    // Urgency filter
    if (filterUrgency !== 'all') {
      filtered = filtered.filter(contact => contact.urgencyLevel === filterUrgency);
    }

    // Score range filter
    filtered = filtered.filter(contact => {
      const score = contact.leadScore || 0;
      return score >= filterScoreRange[0] && score <= filterScoreRange[1];
    });

    // Value range filter
    filtered = filtered.filter(contact => {
      const value = contact.estimatedValue || 0;
      return value >= filterValueRange[0] && value <= filterValueRange[1];
    });

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'leadScore':
          comparison = (b.leadScore || 0) - (a.leadScore || 0);
          break;
        case 'urgency':
          const urgencyOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          comparison = (urgencyOrder[b.urgencyLevel] || 0) - (urgencyOrder[a.urgencyLevel] || 0);
          break;
        case 'value':
          comparison = (b.estimatedValue || 0) - (a.estimatedValue || 0);
          break;
        case 'probability':
          comparison = (b.conversionProbability || 0) - (a.conversionProbability || 0);
          break;
        case 'newest':
          comparison = (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
          break;
        case 'oldest':
          comparison = (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0);
          break;
        case 'name':
          const nameA = `${a.firstName || ''} ${a.lastName || ''}`.toLowerCase();
          const nameB = `${b.firstName || ''} ${b.lastName || ''}`.toLowerCase();
          comparison = nameA.localeCompare(nameB);
          break;
        case 'lastName':
          comparison = (a.lastName || '').localeCompare(b.lastName || '');
          break;
        case 'company':
          comparison = (a.company || '').localeCompare(b.company || '');
          break;
        case 'email':
          comparison = (a.email || '').localeCompare(b.email || '');
          break;
        case 'lastActivity':
          comparison = (b.lastActivityDate?.seconds || 0) - (a.lastActivityDate?.seconds || 0);
          break;
        case 'lifecycle':
          const stageA = LIFECYCLE_STATUSES[a.lifecycleStatus]?.stage || 0;
          const stageB = LIFECYCLE_STATUSES[b.lifecycleStatus]?.stage || 0;
          comparison = stageB - stageA;
          break;
        default:
          comparison = 0;
      }
      
      // Apply sort direction
      return sortDirection === 'asc' ? -comparison : comparison;
    });

    setFilteredContacts(filtered);
  }, [
    contacts,
    searchTerm,
    advancedSearch,
    showAdvancedSearch,
    filterRoles,
    filterLifecycle,
    filterUrgency,
    filterScoreRange,
    filterValueRange,
    showHotLeadsOnly,
    sortBy,
    sortDirection
  ]);

  // ===== AI-POWERED LEAD SCORING =====
  const calculateAIScore = async (contact) => {
    let score = 5;
    
    if (contact.urgencyLevel === 'critical') score += 3;
    if (contact.urgencyLevel === 'high') score += 2;
    if (contact.urgencyLevel === 'medium') score += 1;
    
    if (contact.painPoints?.length > 3) score += 2;
    if (contact.painPoints?.length > 0) score += 1;
    
    if (contact.source === 'ai-receptionist') score += 1;
    if (contact.source === 'referral') score += 2;
    
    if (contact.conversionProbability > 70) score += 2;
    if (contact.conversionProbability > 50) score += 1;
    
    if (contact.estimatedValue > 5000) score += 2;
    if (contact.estimatedValue > 2000) score += 1;
    
    return Math.min(10, score);
  };

  // ===== BATCH AI SCORING =====
  const runBatchAIScoring = async () => {
    if (selectedContacts.length === 0) {
      showNotification('Please select contacts to score', 'warning');
      return;
    }

    setRunningAIBatch(true);
    
    try {
      const batch = writeBatch(db);
      let processedCount = 0;

      for (const contactId of selectedContacts) {
        const contact = contacts.find(c => c.id === contactId);
        if (!contact) continue;

        const score = await calculateAIScore(contact);
        
        const docRef = doc(db, 'contacts', contactId);
        batch.update(docRef, {
          leadScore: score,
          lastAIScoreDate: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        processedCount++;
      }

      await batch.commit();
      showNotification(`AI scoring completed for ${processedCount} contacts`, 'success');
      await fetchContacts(false);
      
    } catch (error) {
      console.error('Batch AI scoring failed:', error);
      showNotification('Batch AI scoring failed', 'error');
    } finally {
      setRunningAIBatch(false);
    }
  };

  // ... CONTINUING IN PART 2 ...
  // ===== UPDATE ROLES =====
  const handleUpdateRoles = async (contactId, newRoles, primaryRole) => {
    try {
      const docRef = doc(db, 'contacts', contactId);
      const updateData = {
        roles: newRoles,
        primaryRole: primaryRole || newRoles[0],
        updatedAt: serverTimestamp()
      };
      
      const roleHistoryEntry = {
        roles: newRoles,
        primaryRole: primaryRole || newRoles[0],
        changedAt: new Date().toISOString(),
        changedBy: 'current_user'
      };
      
      await updateDoc(docRef, {
        ...updateData,
        roleHistory: arrayUnion(roleHistoryEntry)
      });
      
      setEditingRoles(null);
      await fetchContacts(false);
      showNotification('Roles updated successfully', 'success');
    } catch (error) {
      console.error('Error updating roles:', error);
      showNotification('Error updating roles', 'error');
    }
  };

  // ===== UPDATE LIFECYCLE STATUS =====
  const handleUpdateLifecycle = async (contactId, newStatus) => {
    try {
      const docRef = doc(db, 'contacts', contactId);
      await updateDoc(docRef, {
        lifecycleStatus: newStatus,
        lifecycleUpdatedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      await fetchContacts(false);
      showNotification('Lifecycle status updated', 'success');
    } catch (error) {
      console.error('Error updating lifecycle status:', error);
      showNotification('Error updating status', 'error');
    }
  };

  // ===== BULK ACTIONS =====
  const handleBulkRoleUpdate = async (action) => {
    if (selectedContacts.length === 0) return;
    
    try {
      const batch = writeBatch(db);
      
      if (action === 'delete') {
        if (!window.confirm(`Delete ${selectedContacts.length} contacts?`)) return;
        
        selectedContacts.forEach(contactId => {
          batch.delete(doc(db, 'contacts', contactId));
        });
      } else if (action === 'mark-hot') {
        selectedContacts.forEach(contactId => {
          const docRef = doc(db, 'contacts', contactId);
          batch.update(docRef, {
            leadScore: 9,
            urgencyLevel: 'high',
            tags: arrayUnion('hot-lead'),
            updatedAt: serverTimestamp()
          });
        });
      } else if (action === 'mark-warm') {
        selectedContacts.forEach(contactId => {
          const docRef = doc(db, 'contacts', contactId);
          batch.update(docRef, {
            leadScore: 6,
            urgencyLevel: 'medium',
            tags: arrayUnion('warm-lead'),
            updatedAt: serverTimestamp()
          });
        });
      } else if (action === 'mark-cold') {
        selectedContacts.forEach(contactId => {
          const docRef = doc(db, 'contacts', contactId);
          batch.update(docRef, {
            leadScore: 3,
            urgencyLevel: 'low',
            tags: arrayUnion('cold-lead'),
            updatedAt: serverTimestamp()
          });
        });
      } else if (action === 'archive') {
        selectedContacts.forEach(contactId => {
          const docRef = doc(db, 'contacts', contactId);
          batch.update(docRef, {
            archived: true,
            archivedAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        });
      } else if (action.startsWith('add-role-') || action.startsWith('remove-role-')) {
        const role = action.replace('add-role-', '').replace('remove-role-', '');
        const isAdding = action.startsWith('add-role-');
        
        selectedContacts.forEach(contactId => {
          const contact = contacts.find(c => c.id === contactId);
          if (!contact) return;
          
          const currentRoles = contact.roles || [];
          let newRoles;
          
          if (isAdding) {
            newRoles = currentRoles.includes(role) ? currentRoles : [...currentRoles, role];
          } else {
            newRoles = currentRoles.filter(r => r !== role);
            if (newRoles.length === 0) newRoles = ['contact'];
          }
          
          const docRef = doc(db, 'contacts', contactId);
          batch.update(docRef, {
            roles: newRoles,
            primaryRole: newRoles.includes(contact.primaryRole) ? contact.primaryRole : newRoles[0],
            updatedAt: serverTimestamp()
          });
        });
      } else if (action.startsWith('set-status-')) {
        const status = action.replace('set-status-', '');
        selectedContacts.forEach(contactId => {
          const docRef = doc(db, 'contacts', contactId);
          batch.update(docRef, {
            lifecycleStatus: status,
            lifecycleUpdatedAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        });
      } else if (action.startsWith('set-urgency-')) {
        const urgency = action.replace('set-urgency-', '');
        selectedContacts.forEach(contactId => {
          const docRef = doc(db, 'contacts', contactId);
          batch.update(docRef, {
            urgencyLevel: urgency,
            updatedAt: serverTimestamp()
          });
        });
      } else if (action === 'export-selected') {
        exportContacts('csv', true);
        return;
      }
      
      await batch.commit();
      setSelectedContacts([]);
      setBulkAction('');
      await fetchContacts(false);
      showNotification(`Bulk action completed for ${selectedContacts.length} contacts`, 'success');
    } catch (error) {
      console.error('Error bulk updating:', error);
      showNotification('Error performing bulk action', 'error');
    }
  };

  // ===== DELETE CONTACT =====
  const handleDelete = async (contactId) => {
    try {
      await deleteDoc(doc(db, 'contacts', contactId));
      setDeleteConfirm(null);
      await fetchContacts(false);
      showNotification('Contact deleted', 'success');
    } catch (error) {
      console.error('Error deleting contact:', error);
      showNotification('Error deleting contact', 'error');
    }
  };

  // ===== DUPLICATE CONTACT =====
  const handleDuplicate = async (contact) => {
    try {
      const duplicateData = {
        ...contact,
        firstName: `${contact.firstName} (Copy)`,
        email: '',
        phone: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      delete duplicateData.id;
      
      await addDoc(collection(db, 'contacts'), duplicateData);
      await fetchContacts(false);
      showNotification('Contact duplicated successfully', 'success');
    } catch (error) {
      console.error('Error duplicating contact:', error);
      showNotification('Error duplicating contact', 'error');
    }
  };

  // ===== MERGE CONTACTS =====
  const handleMergeContacts = async () => {
    if (contactsToMerge.length < 2) {
      showNotification('Please select at least 2 contacts to merge', 'warning');
      return;
    }

    if (!window.confirm(`Merge ${contactsToMerge.length} contacts into one?`)) return;

    try {
      const primaryContact = contacts.find(c => c.id === contactsToMerge[0]);
      const mergedData = { ...primaryContact };

      // Merge data from other contacts
      for (let i = 1; i < contactsToMerge.length; i++) {
        const contact = contacts.find(c => c.id === contactsToMerge[i]);
        if (!contact) continue;

        // Merge roles
        if (contact.roles) {
          mergedData.roles = [...new Set([...mergedData.roles, ...contact.roles])];
        }

        // Merge tags
        if (contact.tags) {
          mergedData.tags = [...new Set([...(mergedData.tags || []), ...contact.tags])];
        }

        // Take highest lead score
        if (contact.leadScore > mergedData.leadScore) {
          mergedData.leadScore = contact.leadScore;
        }

        // Combine notes
        if (contact.notes) {
          mergedData.notes = `${mergedData.notes || ''}\n\n--- Merged from ${contact.firstName} ${contact.lastName} ---\n${contact.notes}`;
        }

        // Add secondary email/phone if missing
        if (!mergedData.emailSecondary && contact.email && contact.email !== mergedData.email) {
          mergedData.emailSecondary = contact.email;
        }
        if (!mergedData.phoneSecondary && contact.phone && contact.phone !== mergedData.phone) {
          mergedData.phoneSecondary = contact.phone;
        }
      }

      // Update primary contact
      const primaryRef = doc(db, 'contacts', contactsToMerge[0]);
      await updateDoc(primaryRef, {
        ...mergedData,
        updatedAt: serverTimestamp(),
        mergedFrom: contactsToMerge.slice(1)
      });

      // Delete other contacts
      const batch = writeBatch(db);
      for (let i = 1; i < contactsToMerge.length; i++) {
        batch.delete(doc(db, 'contacts', contactsToMerge[i]));
      }
      await batch.commit();

      setMergeMode(false);
      setContactsToMerge([]);
      await fetchContacts(false);
      showNotification('Contacts merged successfully', 'success');
    } catch (error) {
      console.error('Error merging contacts:', error);
      showNotification('Error merging contacts', 'error');
    }
  };

  // ===== TOGGLE CONTACT EXPANSION =====
  const toggleContactExpansion = (contactId) => {
    const newExpanded = new Set(expandedContacts);
    if (newExpanded.has(contactId)) {
      newExpanded.delete(contactId);
    } else {
      newExpanded.add(contactId);
    }
    setExpandedContacts(newExpanded);
  };

  // ===== FORMAT DATE =====
  const formatDate = (date) => {
    if (!date) return 'N/A';
    if (date.seconds) {
      return new Date(date.seconds * 1000).toLocaleDateString();
    }
    return new Date(date).toLocaleDateString();
  };

  // ===== FORMAT DATE WITH TIME =====
  const formatDateTime = (date) => {
    if (!date) return 'N/A';
    if (date.seconds) {
      return new Date(date.seconds * 1000).toLocaleString();
    }
    return new Date(date).toLocaleString();
  };

  // ===== GET INITIALS =====
  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || '?';
  };

  // ===== GET SCORE COLOR =====
  const getScoreColor = (score) => {
    if (score >= 8) return 'text-red-600 dark:text-red-400';
    if (score >= 6) return 'text-orange-600 dark:text-orange-400';
    if (score >= 4) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  // ===== GET SCORE BACKGROUND =====
  const getScoreBackground = (score) => {
    if (score >= 8) return 'bg-red-100 dark:bg-red-900/30';
    if (score >= 6) return 'bg-orange-100 dark:bg-orange-900/30';
    if (score >= 4) return 'bg-yellow-100 dark:bg-yellow-900/30';
    return 'bg-gray-100 dark:bg-gray-900/30';
  };

  // ===== EXPORT CONTACTS =====
  const exportContacts = (format = 'csv', selectedOnly = false) => {
    const data = selectedOnly && selectedContacts.length > 0
      ? filteredContacts.filter(c => selectedContacts.includes(c.id))
      : filteredContacts;
    
    if (data.length === 0) {
      showNotification('No contacts to export', 'warning');
      return;
    }

    if (format === 'csv') {
      const headers = [
        'First Name', 'Last Name', 'Email', 'Phone', 'Company', 
        'Address', 'City', 'State', 'Zipcode',
        'Primary Role', 'All Roles', 'Lifecycle Status', 'Lead Score', 
        'Urgency', 'Estimated Value', 'Conversion Probability',
        'Source', 'Tags', 'Notes', 'Created Date'
      ];
      
      const rows = data.map(c => [
        c.firstName || '',
        c.lastName || '',
        c.email || '',
        c.phone || '',
        c.company || '',
        c.address1 || '',
        c.city || '',
        c.state || c.stateCode || '',
        c.zipcode || '',
        c.primaryRole || '',
        (c.roles || []).join('; '),
        c.lifecycleStatus || '',
        c.leadScore || 0,
        c.urgencyLevel || '',
        c.estimatedValue || 0,
        c.conversionProbability || 0,
        c.source || '',
        (c.tags || []).join('; '),
        (c.notes || '').replace(/\n/g, ' ').replace(/,/g, ';'),
        formatDate(c.createdAt)
      ]);
      
      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => {
          const cellStr = String(cell);
          return cellStr.includes(',') ? `"${cellStr}"` : cellStr;
        }).join(','))
      ].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contacts_export_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      
      showNotification(`Exported ${data.length} contacts`, 'success');
    } else if (format === 'json') {
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contacts_export_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      showNotification(`Exported ${data.length} contacts`, 'success');
    }
  };

  // ===== SAVE FILTER PRESET =====
  const saveFilterPreset = () => {
    const presetName = prompt('Enter a name for this filter preset:');
    if (!presetName) return;

    const preset = {
      name: presetName,
      searchTerm,
      filterRoles,
      filterLifecycle,
      filterUrgency,
      filterScoreRange,
      filterValueRange,
      showHotLeadsOnly,
      sortBy,
      sortDirection,
      createdAt: new Date().toISOString()
    };

    const newPresets = [...savedFilters, preset];
    setSavedFilters(newPresets);
    localStorage.setItem('contactFilterPresets', JSON.stringify(newPresets));
    showNotification('Filter preset saved', 'success');
  };

  // ===== LOAD FILTER PRESET =====
  const loadFilterPreset = (preset) => {
    setSearchTerm(preset.searchTerm || '');
    setFilterRoles(preset.filterRoles || []);
    setFilterLifecycle(preset.filterLifecycle || 'all');
    setFilterUrgency(preset.filterUrgency || 'all');
    setFilterScoreRange(preset.filterScoreRange || [0, 10]);
    setFilterValueRange(preset.filterValueRange || [0, 10000]);
    setShowHotLeadsOnly(preset.showHotLeadsOnly || false);
    setSortBy(preset.sortBy || 'leadScore');
    setSortDirection(preset.sortDirection || 'desc');
    setCurrentFilterPreset(preset);
    showNotification(`Loaded filter preset: ${preset.name}`, 'success');
  };

  // ===== CLEAR ALL FILTERS =====
  const clearAllFilters = () => {
    setSearchTerm('');
    setAdvancedSearch({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      city: '',
      state: '',
      zipcode: '',
      tags: [],
      source: '',
      dateRange: { start: '', end: '' }
    });
    setFilterRoles([]);
    setFilterLifecycle('all');
    setFilterUrgency('all');
    setFilterScoreRange([0, 10]);
    setFilterValueRange([0, 10000]);
    setShowHotLeadsOnly(false);
    setShowAdvancedSearch(false);
    setCurrentFilterPreset(null);
    showNotification('All filters cleared', 'success');
  };

  // ===== QUICK ACTIONS COMPONENT =====
  const QuickActions = ({ contact }) => (
    <div className="flex items-center gap-1">
      <button
        onClick={() => {
          setSelectedContactDetails(contact);
          setShowContactDetails(true);
        }}
        className="p-1.5 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
        title="View Details"
      >
        <Eye className="h-4 w-4" />
      </button>
      <button
        onClick={() => {
          setEditingContact(contact);
          setFormMode('edit');
          setShowMegaForm(true);
        }}
        className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
        title="Edit"
      >
        <Edit className="h-4 w-4" />
      </button>
      <button
        onClick={() => handleDuplicate(contact)}
        className="p-1.5 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition-colors"
        title="Duplicate"
      >
        <Copy className="h-4 w-4" />
      </button>
      <button
        onClick={() => window.location.href = `tel:${contact.phone}`}
        className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
        title="Call"
        disabled={!contact.phone}
      >
        <Phone className="h-4 w-4" />
      </button>
      <button
        onClick={() => window.location.href = `mailto:${contact.email}`}
        className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
        title="Email"
        disabled={!contact.email}
      >
        <Mail className="h-4 w-4" />
      </button>
      <button
        onClick={() => {
          setSelectedContactForInteraction(contact);
          setShowInteractionLogger(true);
        }}
        className="p-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded transition-colors"
        title="Log Interaction"
      >
        <MessageSquare className="h-4 w-4" />
      </button>
      <button
        onClick={() => toggleContactExpansion(contact.id)}
        className="p-1.5 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
        title={expandedContacts.has(contact.id) ? "Collapse" : "Expand"}
      >
        {expandedContacts.has(contact.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      <div className="relative group">
        <button
          className="p-1.5 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          title="More Actions"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
          <button
            onClick={() => navigate(`/credit-reports/${contact.id}`)}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            View Reports
          </button>
          <button
            onClick={() => navigate(`/dispute-letters?contactId=${contact.id}`)}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <Scale className="h-4 w-4" />
            Dispute Letters
          </button>
          <button
            onClick={() => navigate(`/documents?contactId=${contact.id}`)}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <Paperclip className="h-4 w-4" />
            Documents
          </button>
          <div className="border-t border-gray-200 dark:border-gray-700"></div>
          <button
            onClick={() => {
              if (window.confirm('Archive this contact?')) {
                handleBulkRoleUpdate('archive');
              }
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <Archive className="h-4 w-4" />
            Archive
          </button>
          <button
            onClick={() => setDeleteConfirm(contact.id)}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  // ===== PAGINATION CALCULATIONS =====
  const totalPages = Math.ceil(filteredContacts.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedContacts = filteredContacts.slice(startIndex, endIndex);

  // ===== LOADING STATE =====
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading contacts...</p>
        </div>
      </div>
    );
  }

  // ===== MAIN RENDER =====
  return (
    <div className="p-4 md:p-6 space-y-6 max-w-full">
      {/* ========== HEADER ========== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="h-8 w-8 text-blue-600" />
            Master Contact Hub
            {realtimeUpdates && (
              <span className="flex items-center gap-1 text-sm font-normal text-green-600 dark:text-green-400">
                <Wifi className="h-4 w-4" />
                Live
              </span>
            )}
            {refreshing && (
              <span className="flex items-center gap-1 text-sm font-normal text-blue-600 dark:text-blue-400">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Syncing...
              </span>
            )}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            AI-Enhanced unified contact management • {stats.total} total contacts
            {lastSync && ` • Last sync: ${formatDateTime(lastSync)}`}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => fetchContacts(false)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            disabled={refreshing}
          >
            <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => {
              console.log('🟡 TOP BUTTON CLICKED!');
              console.log('🟡 showMegaForm BEFORE:', showMegaForm);
              console.log('🟡 UltimateClientForm exists?', !!UltimateClientForm);  // ✅
              console.log('🟡 UltimateClientForm type:', typeof UltimateClientForm);  // ✅
              setEditingContact(null);
              setFormMode('create');
              setShowMegaForm(true);
              console.log('🟡 setState called - showMegaForm should be true now');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            <Plus className="h-5 w-5" />
            Add Contact
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Upload className="h-5 w-5" />
            Import
          </button>
          <button
            onClick={() => exportContacts('csv')}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="h-5 w-5" />
            Export
          </button>
        </div>
      </div>

      {/* ========== ENHANCED STATS DASHBOARD ========== */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs opacity-90 font-medium">Total Contacts</p>
              <p className="text-2xl font-bold mt-1">{stats.total}</p>
              <p className="text-xs opacity-75 mt-1">
                {stats.growth >= 0 ? '↑' : '↓'} {Math.abs(stats.growth)}% this month
              </p>
            </div>
            <Users className="h-8 w-8 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
          onClick={() => setShowHotLeadsOnly(!showHotLeadsOnly)}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs opacity-90 font-medium">🔥 Hot Leads</p>
              <p className="text-2xl font-bold mt-1">{stats.hotLeads}</p>
              <p className="text-xs opacity-75 mt-1">Score 8-10</p>
            </div>
            <TrendingUp className="h-8 w-8 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs opacity-90 font-medium">⚡ Warm Leads</p>
              <p className="text-2xl font-bold mt-1">{stats.warmLeads}</p>
              <p className="text-xs opacity-75 mt-1">Score 5-7</p>
            </div>
            <Activity className="h-8 w-8 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-500 to-gray-600 text-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs opacity-90 font-medium">❄️ Cold Leads</p>
              <p className="text-2xl font-bold mt-1">{stats.coldLeads}</p>
              <p className="text-xs opacity-75 mt-1">Score 0-4</p>
            </div>
            <TrendingDown className="h-8 w-8 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs opacity-90 font-medium">Active Clients</p>
              <p className="text-2xl font-bold mt-1">{stats.byRole.client || 0}</p>
              <p className="text-xs opacity-75 mt-1">{stats.conversionRate}% rate</p>
            </div>
            <UserCheck className="h-8 w-8 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs opacity-90 font-medium">Avg Score</p>
              <p className="text-2xl font-bold mt-1">{stats.avgLeadScore}</p>
              <p className="text-xs opacity-75 mt-1">out of 10</p>
            </div>
            <Gauge className="h-8 w-8 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs opacity-90 font-medium">Win Rate</p>
              <p className="text-2xl font-bold mt-1">{stats.conversionRate}%</p>
              <p className="text-xs opacity-75 mt-1">conversion</p>
            </div>
            <Award className="h-8 w-8 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-teal-500 to-teal-600 text-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs opacity-90 font-medium">Pipeline Value</p>
              <p className="text-2xl font-bold mt-1">${(stats.totalValue / 1000).toFixed(0)}K</p>
              <p className="text-xs opacity-75 mt-1">total estimated</p>
            </div>
            <DollarSign className="h-8 w-8 opacity-80" />
          </div>
        </div>
      </div>

      {/* ========== SECONDARY STATS (TOP SOURCES & STATES) ========== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Sources */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Top Sources
          </h3>
          <div className="space-y-2">
            {stats.topSources.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                  {CONTACT_SOURCES[item.source] || item.source}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${(item.count / stats.total) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white w-8 text-right">
                    {item.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top States */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-green-600" />
            Top States
          </h3>
          <div className="space-y-2">
            {stats.topStates.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300 uppercase font-medium">
                  {item.state}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-600 rounded-full"
                      style={{ width: `${(item.count / stats.total) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white w-8 text-right">
                    {item.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ... CONTINUING IN PART 3 ... */}
      {/* ========== BULK ACTIONS BAR ========== */}
      {selectedContacts.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {selectedContacts.length} selected
              </span>
              <button
                onClick={() => setSelectedContacts([])}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline"
              >
                Clear
              </button>
              {mergeMode && (
                <button
                  onClick={() => {
                    setMergeMode(false);
                    setContactsToMerge([]);
                  }}
                  className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 underline"
                >
                  Cancel Merge
                </button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {mergeMode ? (
                <>
                  <button
                    onClick={() => {
                      setContactsToMerge(selectedContacts);
                      handleMergeContacts();
                    }}
                    disabled={selectedContacts.length < 2}
                    className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    <Layers className="h-4 w-4 inline mr-1" />
                    Merge {selectedContacts.length} Contacts
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowBulkEmail(true)}
                    className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Mail className="h-4 w-4 inline mr-1" />
                    Email All
                  </button>
                  <button
                    onClick={() => setShowBulkSMS(true)}
                    className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <MessageSquare className="h-4 w-4 inline mr-1" />
                    SMS All
                  </button>
                  <button
                    onClick={runBatchAIScoring}
                    disabled={runningAIBatch}
                    className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors"
                  >
                    <Brain className="h-4 w-4 inline mr-1" />
                    {runningAIBatch ? 'Scoring...' : 'AI Score'}
                  </button>
                  <select
                    value={bulkAction}
                    onChange={(e) => {
                      setBulkAction(e.target.value);
                      if (e.target.value) handleBulkRoleUpdate(e.target.value);
                    }}
                    className="px-3 py-1.5 text-sm border border-blue-300 dark:border-blue-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Bulk Actions</option>
                    <optgroup label="Lead Quality">
                      <option value="mark-hot">🔥 Mark as Hot Leads</option>
                      <option value="mark-warm">⚡ Mark as Warm Leads</option>
                      <option value="mark-cold">❄️ Mark as Cold Leads</option>
                    </optgroup>
                    <optgroup label="Add Role">
                      {Object.entries(ROLES).map(([key, role]) => (
                        <option key={`add-${key}`} value={`add-role-${key}`}>
                          + Add {role.label} Role
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Remove Role">
                      {Object.entries(ROLES).map(([key, role]) => (
                        <option key={`remove-${key}`} value={`remove-role-${key}`}>
                          - Remove {role.label} Role
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Change Status">
                      {Object.entries(LIFECYCLE_STATUSES).map(([key, status]) => (
                        <option key={`status-${key}`} value={`set-status-${key}`}>
                          Set to {status.label}
                        </option>
                      ))}
                        <button
                          onClick={() => navigate('/intake')}
                          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          <UserPlus className="h-5 w-5" />
                          Full Client Intake
                        </button>
                    </optgroup>
                    <optgroup label="Change Urgency">
                      {Object.entries(URGENCY_LEVELS).map(([key, level]) => (
                        <option key={`urgency-${key}`} value={`set-urgency-${key}`}>
                          Set to {level.label}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Other">
                      <option value="export-selected">📥 Export Selected</option>
                      <option value="archive">📦 Archive</option>
                      <option value="delete">🗑️ Delete</option>
                    </optgroup>
                  </select>
                  <button
                    onClick={() => {
                      setMergeMode(true);
                      setContactsToMerge(selectedContacts);
                    }}
                    className="px-3 py-1.5 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    <Layers className="h-4 w-4 inline mr-1" />
                    Merge
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========== ADVANCED SEARCH AND FILTERS ========== */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search by name, email, phone, company, tags, or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setShowHotLeadsOnly(!showHotLeadsOnly)}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 font-medium ${
                showHotLeadsOnly 
                  ? 'bg-red-600 text-white shadow-lg' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <TrendingUp className="h-5 w-5" />
              🔥 Hot Leads Only
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="leadScore">Sort: Lead Score</option>
              <option value="urgency">Sort: Urgency</option>
              <option value="value">Sort: Deal Value</option>
              <option value="probability">Sort: Probability</option>
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="name">Sort: First Name</option>
              <option value="lastName">Sort: Last Name</option>
              <option value="company">Sort: Company</option>
              <option value="email">Sort: Email</option>
              <option value="lastActivity">Sort: Last Activity</option>
              <option value="lifecycle">Sort: Lifecycle Stage</option>
            </select>

            <button
              onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
              className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title={sortDirection === 'asc' ? 'Sort Ascending' : 'Sort Descending'}
            >
              {sortDirection === 'asc' ? <SortAsc className="h-5 w-5" /> : <SortDesc className="h-5 w-5" />}
            </button>

            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="table">📊 Table View</option>
              <option value="cards">📇 Card View</option>
              <option value="grid">🔲 Grid View</option>
              <option value="kanban">📋 Kanban View</option>
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                showFilters 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Filter className="h-5 w-5" />
              Filters
              {(filterRoles.length > 0 || filterLifecycle !== 'all' || filterUrgency !== 'all') && (
                <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                  {filterRoles.length + (filterLifecycle !== 'all' ? 1 : 0) + (filterUrgency !== 'all' ? 1 : 0)}
                </span>
              )}
              <ChevronDown className={`h-4 w-4 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            <button
              onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                showAdvancedSearch 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <SlidersHorizontal className="h-5 w-5" />
              Advanced
            </button>

            <button
              onClick={() => setRealtimeUpdates(!realtimeUpdates)}
              className={`p-2 rounded-lg transition-colors ${
                realtimeUpdates 
                  ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
              title={realtimeUpdates ? 'Disable real-time updates' : 'Enable real-time updates'}
            >
              {realtimeUpdates ? <Wifi className="h-5 w-5" /> : <WifiOff className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Advanced Search Panel */}
        {showAdvancedSearch && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Advanced Search</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
              <input
                type="text"
                placeholder="First Name"
                value={advancedSearch.firstName}
                onChange={(e) => setAdvancedSearch({...advancedSearch, firstName: e.target.value})}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
              <input
                type="text"
                placeholder="Last Name"
                value={advancedSearch.lastName}
                onChange={(e) => setAdvancedSearch({...advancedSearch, lastName: e.target.value})}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
              <input
                type="email"
                placeholder="Email"
                value={advancedSearch.email}
                onChange={(e) => setAdvancedSearch({...advancedSearch, email: e.target.value})}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
              <input
                type="tel"
                placeholder="Phone"
                value={advancedSearch.phone}
                onChange={(e) => setAdvancedSearch({...advancedSearch, phone: e.target.value})}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
              <input
                type="text"
                placeholder="Company"
                value={advancedSearch.company}
                onChange={(e) => setAdvancedSearch({...advancedSearch, company: e.target.value})}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
              <input
                type="text"
                placeholder="City"
                value={advancedSearch.city}
                onChange={(e) => setAdvancedSearch({...advancedSearch, city: e.target.value})}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
              <input
                type="text"
                placeholder="State"
                value={advancedSearch.state}
                onChange={(e) => setAdvancedSearch({...advancedSearch, state: e.target.value})}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
              <input
                type="text"
                placeholder="Zipcode"
                value={advancedSearch.zipcode}
                onChange={(e) => setAdvancedSearch({...advancedSearch, zipcode: e.target.value})}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
              <select
                value={advancedSearch.source}
                onChange={(e) => setAdvancedSearch({...advancedSearch, source: e.target.value})}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="">All Sources</option>
                {Object.entries(CONTACT_SOURCES).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              <input
                type="date"
                placeholder="Created After"
                value={advancedSearch.dateRange.start}
                onChange={(e) => setAdvancedSearch({
                  ...advancedSearch, 
                  dateRange: {...advancedSearch.dateRange, start: e.target.value}
                })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
              <input
                type="date"
                placeholder="Created Before"
                value={advancedSearch.dateRange.end}
                onChange={(e) => setAdvancedSearch({
                  ...advancedSearch, 
                  dateRange: {...advancedSearch.dateRange, end: e.target.value}
                })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>
          </div>
        )}

        {/* Standard Filters Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
            {/* Role Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filter by Roles
              </label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(ROLES).map(([key, role]) => {
                  const Icon = role.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        if (filterRoles.includes(key)) {
                          setFilterRoles(filterRoles.filter(r => r !== key));
                        } else {
                          setFilterRoles([...filterRoles, key]);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 transition-all ${
                        filterRoles.includes(key)
                          ? role.color + ' shadow-md'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {role.label} ({stats.byRole[key] || 0})
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Lifecycle Status Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Lifecycle Status
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterLifecycle('all')}
                  className={`px-3 py-1.5 rounded-lg text-sm ${
                    filterLifecycle === 'all'
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 shadow-md'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  All Statuses
                </button>
                {Object.entries(LIFECYCLE_STATUSES).map(([key, status]) => {
                  const Icon = status.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => setFilterLifecycle(key)}
                      className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 transition-all ${
                        filterLifecycle === key
                          ? status.color + ' shadow-md'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {status.label} ({stats.byLifecycle[key] || 0})
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Urgency Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Urgency Level
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterUrgency('all')}
                  className={`px-3 py-1.5 rounded-lg text-sm ${
                    filterUrgency === 'all'
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 shadow-md'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  All Urgency
                </button>
                {Object.entries(URGENCY_LEVELS).map(([key, level]) => (
                  <button
                    key={key}
                    onClick={() => setFilterUrgency(key)}
                    className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 transition-all ${
                      filterUrgency === key
                        ? level.color + ' shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <span>{level.icon}</span>
                    {level.label} ({stats.byUrgency[key] || 0})
                  </button>
                ))}
              </div>
            </div>
            
            {/* Lead Score Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Lead Score Range: {filterScoreRange[0]} - {filterScoreRange[1]}
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={filterScoreRange[0]}
                  onChange={(e) => setFilterScoreRange([parseInt(e.target.value), filterScoreRange[1]])}
                  className="flex-1"
                />
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={filterScoreRange[1]}
                  onChange={(e) => setFilterScoreRange([filterScoreRange[0], parseInt(e.target.value)])}
                  className="flex-1"
                />
              </div>
            </div>

            {/* Estimated Value Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Estimated Value Range: ${filterValueRange[0]} - ${filterValueRange[1]}
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="10000"
                  step="100"
                  value={filterValueRange[0]}
                  onChange={(e) => setFilterValueRange([parseInt(e.target.value), filterValueRange[1]])}
                  className="flex-1"
                />
                <input
                  type="range"
                  min="0"
                  max="10000"
                  step="100"
                  value={filterValueRange[1]}
                  onChange={(e) => setFilterValueRange([filterValueRange[0], parseInt(e.target.value)])}
                  className="flex-1"
                />
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white underline"
              >
                Clear All Filters
              </button>
              <div className="flex gap-2">
                <button
                  onClick={saveFilterPreset}
                  className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  💾 Save Preset
                </button>
                {savedFilters.length > 0 && (
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        const preset = savedFilters.find(p => p.name === e.target.value);
                        if (preset) loadFilterPreset(preset);
                      }
                    }}
                    className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg"
                  >
                    <option value="">Load Preset...</option>
                    {savedFilters.map((preset, idx) => (
                      <option key={idx} value={preset.name}>{preset.name}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========== TABLE VIEW ========== */}
      {viewMode === 'table' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto" ref={tableRef}>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedContacts.length === paginatedContacts.length && paginatedContacts.length > 0}
                      onChange={() => {
                        if (selectedContacts.length === paginatedContacts.length) {
                          setSelectedContacts([]);
                        } else {
                          setSelectedContacts(paginatedContacts.map(c => c.id));
                        }
                      }}
                      className="rounded border-gray-300 dark:border-gray-600"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Contact Info
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Score/Urgency
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Roles
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Lifecycle
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:border-gray-700">
                {paginatedContacts.map((contact) => (
                  <React.Fragment key={contact.id}>
                    <tr className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      contact.urgencyLevel === 'critical' ? 'bg-red-50 dark:bg-red-900/10' : ''
                    } ${
                      selectedContacts.includes(contact.id) ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                    }`}>
                      {/* Checkbox */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedContacts.includes(contact.id)}
                          onChange={() => {
                            if (selectedContacts.includes(contact.id)) {
                              setSelectedContacts(selectedContacts.filter(id => id !== contact.id));
                            } else {
                              setSelectedContacts([...selectedContacts, contact.id]);
                            }
                          }}
                          className="rounded border-gray-300 dark:border-gray-600"
                        />
                      </td>

                      {/* Contact Info */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold text-sm ${
                              contact.leadScore >= 8 
                                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' 
                                : contact.leadScore >= 5
                                ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                            }`}>
                              {getInitials(contact.firstName, contact.lastName)}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {contact.firstName} {contact.lastName}
                              </span>
                              {contact.source === 'ai-receptionist' && (
                                <Bot className="h-3 w-3 text-purple-600 dark:text-purple-400" title="AI Generated" />
                              )}
                            </div>
                            
                            {/* Created Date - NEW! */}
                            {contact.createdAt && (
                              <div className="flex items-center gap-1 mt-0.5">
                                <Clock className="h-3 w-3 text-gray-400" />
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  Added {(() => {
                                    const created = contact.createdAt?.toDate ? contact.createdAt.toDate() : new Date(contact.createdAt);
                                    const now = new Date();
                                    const diffMs = now - created;
                                    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                                    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                                    const diffMinutes = Math.floor(diffMs / (1000 * 60));
                                    
                                    if (diffMinutes < 60) return `${diffMinutes}m ago`;
                                    if (diffHours < 24) return `${diffHours}h ago`;
                                    if (diffDays < 7) return `${diffDays}d ago`;
                                    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
                                    if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
                                    return created.toLocaleDateString();
                                  })()}
                                </span>
                              </div>
                            )}
                            
                            {contact.company && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">{contact.company}</div>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              {contact.email && (
                                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {contact.email}
                                </span>
                              )}
                              {contact.phone && (
                                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {contact.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Score/Urgency */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <div className={`px-2 py-1 rounded-lg ${getScoreBackground(contact.leadScore || 0)}`}>
                              <span className={`text-lg font-bold ${getScoreColor(contact.leadScore || 0)}`}>
                                {contact.leadScore || 0}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">/10</span>
                            </div>
                            {contact.conversionProbability && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {contact.conversionProbability}%
                              </span>
                            )}
                          </div>
                          {contact.urgencyLevel && (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                              URGENCY_LEVELS[contact.urgencyLevel]?.color || 'bg-gray-100 text-gray-700'
                            }`}>
                              {URGENCY_LEVELS[contact.urgencyLevel]?.icon} 
                              {URGENCY_LEVELS[contact.urgencyLevel]?.label}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Roles */}
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1">
                          {(contact.roles || []).slice(0, 2).map(role => {
                            const roleConfig = ROLES[role];
                            if (!roleConfig) return null;
                            const Icon = roleConfig.icon;
                            return (
                              <span
                                key={role}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${roleConfig.color}`}
                                title={contact.primaryRole === role ? 'Primary Role' : ''}
                              >
                                <Icon className="h-3 w-3" />
                                {roleConfig.label}
                                {contact.primaryRole === role && <Star className="h-2.5 w-2.5" />}
                              </span>
                            );
                          })}
                          {contact.roles && contact.roles.length > 2 && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              +{contact.roles.length - 2}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Lifecycle Status */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <select
                          value={contact.lifecycleStatus || 'active'}
                          onChange={(e) => handleUpdateLifecycle(contact.id, e.target.value)}
                          className={`px-2 py-1 text-xs font-medium rounded-full border-0 cursor-pointer ${
                            LIFECYCLE_STATUSES[contact.lifecycleStatus || 'active']?.color || 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {Object.entries(LIFECYCLE_STATUSES).map(([key, status]) => (
                            <option key={key} value={key}>{status.label}</option>
                          ))}
                        </select>
                      </td>

                      {/* Value */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900 dark:text-white">
                            ${(contact.estimatedValue || 0).toLocaleString()}
                          </div>
                          {contact.dealValue && contact.dealValue !== contact.estimatedValue && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Deal: ${contact.dealValue.toLocaleString()}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Source */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full capitalize">
                          {CONTACT_SOURCES[contact.source] || contact.source || 'Unknown'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <QuickActions contact={contact} />
                      </td>
                    </tr>

                    {/* Expanded Row */}
                    {expandedContacts.has(contact.id) && (
                      <tr>
                        <td colSpan="8" className="px-4 py-4 bg-gray-50 dark:bg-gray-900/50">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                            {/* Contact Details */}
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Contact Details
                              </h4>
                              <dl className="space-y-1">
                                <div><dt className="inline font-medium">Full Name:</dt> <dd className="inline">{contact.firstName} {contact.lastName}</dd></div>
                                {contact.company && <div><dt className="inline font-medium">Company:</dt> <dd className="inline">{contact.company}</dd></div>}
                                {contact.address1 && <div><dt className="inline font-medium">Address:</dt> <dd className="inline">{contact.address1} {contact.address2}</dd></div>}
                                {contact.city && <div><dt className="inline font-medium">Location:</dt> <dd className="inline">{contact.city}, {contact.state || contact.stateCode} {contact.zipcode}</dd></div>}
                                {contact.website && <div><dt className="inline font-medium">Website:</dt> <dd className="inline"><a href={contact.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{contact.website}</a></dd></div>}
                              </dl>
                            </div>

                            {/* AI Analysis */}
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                <Brain className="h-4 w-4" />
                                AI Analysis
                              </h4>
                              <dl className="space-y-1">
                                <div><dt className="inline font-medium">Lead Score:</dt> <dd className="inline">{contact.leadScore || 0}/10</dd></div>
                                <div><dt className="inline font-medium">Urgency:</dt> <dd className="inline capitalize">{contact.urgencyLevel || 'medium'}</dd></div>
                                <div><dt className="inline font-medium">Conversion Prob:</dt> <dd className="inline">{contact.conversionProbability || 0}%</dd></div>
                                {contact.nextBestAction && <div><dt className="inline font-medium">Next Action:</dt> <dd className="inline">{contact.nextBestAction}</dd></div>}
                                {contact.painPoints && contact.painPoints.length > 0 && (
                                  <div><dt className="inline font-medium">Pain Points:</dt> <dd className="inline">{contact.painPoints.join(', ')}</dd></div>
                                )}
                              </dl>
                            </div>

                            {/* Engagement */}
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                <Activity className="h-4 w-4" />
                                Engagement
                              </h4>
                              <dl className="space-y-1">
                                <div><dt className="inline font-medium">Created:</dt> <dd className="inline">{formatDate(contact.createdAt)}</dd></div>
                                {contact.lastActivityDate && <div><dt className="inline font-medium">Last Activity:</dt> <dd className="inline">{formatDate(contact.lastActivityDate)}</dd></div>}
                                <div><dt className="inline font-medium">Documents:</dt> <dd className="inline">{contact.documentCount || 0}</dd></div>
                                <div><dt className="inline font-medium">Interactions:</dt> <dd className="inline">{contact.interactions?.length || 0}</dd></div>
                                {contact.tags && contact.tags.length > 0 && (
                                  <div><dt className="inline font-medium">Tags:</dt> <dd className="inline">{contact.tags.join(', ')}</dd></div>
                                )}
                              </dl>
                            </div>
                          </div>

                          {/* Notes */}
                          {contact.notes && (
                            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                              <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2 text-sm">
                                <FileText className="h-4 w-4" />
                                Notes
                              </h4>
                              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{contact.notes}</p>
                            </div>
                          )}

                          {/* Credit Issues */}
                          {contact.creditIssues && contact.creditIssues.length > 0 && (
                            <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                              <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2 text-sm">
                                <AlertTriangle className="h-4 w-4" />
                                Credit Issues
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {contact.creditIssues.map((issue, idx) => (
                                  <span key={idx} className="px-2 py-1 bg-orange-200 dark:bg-orange-800 text-orange-800 dark:text-orange-200 rounded text-xs">
                                    {issue}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredContacts.length)} of {filteredContacts.length} contacts
              </span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded"
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== EMPTY STATE ========== */}
      {filteredContacts.length === 0 && !loading && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <Users className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
            {searchTerm || filterRoles.length > 0 || filterLifecycle !== 'all' || filterUrgency !== 'all'
              ? 'No contacts found'
              : 'No contacts yet'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
            {searchTerm || filterRoles.length > 0
              ? 'Try adjusting your search or filters to find what you\'re looking for.'
              : 'Get started by adding your first contact or let AI Receptionist generate leads automatically.'}
          </p>
          <div className="flex justify-center gap-3">
            {(searchTerm || filterRoles.length > 0 || filterLifecycle !== 'all' || filterUrgency !== 'all') ? (
              <button
                onClick={clearAllFilters}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 shadow-lg hover:shadow-xl transition-all"
              >
                <X className="h-5 w-5" />
                Clear Filters
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setEditingContact(null);
                    setFormMode('create');
                    setShowMegaForm(true);
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all"
                >
                  <Plus className="h-5 w-5" />
                  Add Your First Contact
                </button>
                <button
                  onClick={() => setShowImportModal(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 shadow-lg hover:shadow-xl transition-all"
                >
                  <Upload className="h-5 w-5" />
                  Import Contacts
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ========== MODALS ========== */}
                 
      {showMegaForm && (
  <UltimateClientForm
    initialData={editingContact || {}}
    contactId={editingContact?.id || null}
    onSave={async (savedContact) => {
      setShowMegaForm(false);
      setEditingContact(null);
      setFormMode('create');
      await fetchContacts(false);
      showNotification('Contact saved successfully!', 'success');
    }}
    onCancel={() => {
      setShowMegaForm(false);
      setEditingContact(null);
      setFormMode('create');
    }}
  />
)}

      {/* Interaction Logger Modal */}
      {showInteractionLogger && selectedContactForInteraction && (
        <InteractionLogger
          contactId={selectedContactForInteraction.id}
          contactName={`${selectedContactForInteraction.firstName} ${selectedContactForInteraction.lastName}`}
          onClose={() => {
            setShowInteractionLogger(false);
            setSelectedContactForInteraction(null);
          }}
          onSave={async () => {
            setShowInteractionLogger(false);
            setSelectedContactForInteraction(null);
            await fetchContacts(false);
            showNotification('Interaction logged successfully', 'success');
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Contact</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Are you sure you want to delete this contact? All associated data will be permanently removed.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Contact
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Details Modal */}
      {showContactDetails && selectedContactDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedContactDetails.firstName} {selectedContactDetails.lastName}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Contact Details</p>
              </div>
              <button
                onClick={() => {
                  setShowContactDetails(false);
                  setSelectedContactDetails(null);
                }}
                className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Lead Score & Roles */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Lead Score</span>
                  </div>
                  <p className="text-3xl font-bold text-blue-600">{selectedContactDetails.leadScore || 'N/A'}/10</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Roles</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {selectedContactDetails.roles?.map(role => (
                      <span key={role} className="px-2 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs rounded">
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Phone className="h-5 w-5" /> Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedContactDetails.phone && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedContactDetails.phone}</p>
                      </div>
                    </div>
                  )}
                  {selectedContactDetails.email && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedContactDetails.email}</p>
                      </div>
                    </div>
                  )}
                  {selectedContactDetails.city && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Location</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {selectedContactDetails.city}, {selectedContactDetails.state}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedContactDetails.createdAt && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Added</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {new Date(selectedContactDetails.createdAt?.toDate()).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Source & Notes */}
              {(selectedContactDetails.source || selectedContactDetails.notes) && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Additional Info</h3>
                  {selectedContactDetails.source && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Source</p>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedContactDetails.source}</p>
                    </div>
                  )}
                  {selectedContactDetails.notes && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Notes</p>
                      <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">{selectedContactDetails.notes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    setShowContactDetails(false);
                    setSelectedContactDetails(null);
                    setEditingContact(selectedContactDetails);
                    setFormMode('edit');
                    setShowMegaForm(true);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit Contact
                </button>
                <button
                  onClick={() => {
                    setShowContactDetails(false);
                    setSelectedContactDetails(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
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

export default Contacts;